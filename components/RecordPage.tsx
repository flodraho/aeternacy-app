import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { createMomentFromRecording } from '../services/geminiService';
import { Moment } from '../types';
import { Mic, Video, MapPin, Loader2, Save, Trash2, Bot, HeartPulse, MessageSquare, Users, Check } from 'lucide-react';

// --- Helper Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const blobToBase64 = (blob: globalThis.Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            if (reader.error) return reject(reader.error);
            resolve((reader.result as string).split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

// --- Sub-components ---
const ToggleSwitch: React.FC<{
    icon: React.ElementType;
    label: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    disabled?: boolean;
}> = ({ icon: Icon, label, description, enabled, onToggle, disabled = false }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${disabled ? 'bg-gray-800/50 opacity-50' : 'bg-gray-700/50'}`}>
        <div className="flex items-center gap-4">
            <Icon className={`w-6 h-6 ${disabled ? 'text-slate-500' : 'text-cyan-400'}`} />
            <div>
                <p className={`font-semibold ${disabled ? 'text-slate-400' : 'text-white'}`}>{label}</p>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
        </div>
        <button
            role="switch"
            aria-checked={enabled}
            onClick={() => !disabled && onToggle(!enabled)}
            disabled={disabled}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                enabled ? 'bg-cyan-500' : 'bg-gray-600'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    </div>
);


// --- Component ---
type PageState = 'idle' | 'recording' | 'processing' | 'review' | 'error';
type GeneratedContent = { title: string; story: string; tags: { location: string[]; people: string[]; activities: string[] } };

interface RecordPageProps {
    onCreateMoment: (moment: Omit<Moment, 'id' | 'pinned'>) => void;
}

const RecordPage: React.FC<RecordPageProps> = ({ onCreateMoment }) => {
    const [pageState, setPageState] = useState<PageState>('idle');
    const [transcribedText, setTranscribedText] = useState('');
    const [generatedMoment, setGeneratedMoment] = useState<GeneratedContent | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [processingImageIndex, setProcessingImageIndex] = useState(0);
    
    // Capture source toggles
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [isLocationEnabled, setIsLocationEnabled] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const transcribedTextRef = useRef('');
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const capturedImagesRef = useRef<{ data: string, mimeType: string }[]>([]);
    const locationRef = useRef<GeolocationCoordinates | null>(null);
    const frameIntervalRef = useRef<number | null>(null);
    const isStoppingRef = useRef(false);

    useEffect(() => {
        let interval: number;
        if (pageState === 'processing' && capturedImagesRef.current.length > 0) {
            interval = window.setInterval(() => {
                setProcessingImageIndex(prev => (prev + 1) % capturedImagesRef.current.length);
            }, 200);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [pageState]);


    const cleanup = useCallback(() => {
        isStoppingRef.current = true;
        if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;

        sessionPromiseRef.current?.then(session => session.close()).catch(console.error);
        sessionPromiseRef.current = null;

        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        
        mediaStreamSourceRef.current?.disconnect();
        mediaStreamSourceRef.current = null;

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(console.error);
        }
        inputAudioContextRef.current = null;

        setTimeout(() => { isStoppingRef.current = false; }, 500);
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const startRecording = async () => {
        if (isStoppingRef.current || (!isVoiceEnabled && !isCameraEnabled)) return;
        setErrorMessage('');
        setTranscribedText('');
        transcribedTextRef.current = '';
        capturedImagesRef.current = [];
        locationRef.current = null;

        try {
            const constraints = {
                video: isCameraEnabled ? { facingMode: 'environment' } : false,
                audio: isVoiceEnabled,
            };

            if (isCameraEnabled || isVoiceEnabled) {
                streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
                 if (videoRef.current && streamRef.current && isCameraEnabled) {
                    videoRef.current.srcObject = streamRef.current;
                }
            }
            
            if (isLocationEnabled) {
                navigator.geolocation.getCurrentPosition(
                    (position) => { locationRef.current = position.coords; },
                    (err) => { console.warn(`Location Error: ${err.message}`); }
                );
            }

            if (isVoiceEnabled) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                sessionPromiseRef.current = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    callbacks: {
                        onopen: () => {
                            if (!streamRef.current || !inputAudioContextRef.current) return;
                            mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob: Blob = {
                                    data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                            };
                            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                        },
                        onmessage: (message: LiveServerMessage) => {
                            if (message.serverContent?.inputTranscription?.text) {
                                const newText = transcribedTextRef.current + message.serverContent.inputTranscription.text;
                                transcribedTextRef.current = newText;
                                setTranscribedText(newText);
                            }
                        },
                        onerror: (e: ErrorEvent) => {
                            console.error('Voice recording error:', e);
                            setErrorMessage('A live connection error occurred.');
                            setPageState('error');
                            cleanup();
                        },
                        onclose: () => {}
                    },
                    config: { inputAudioTranscription: {}, responseModalities: [Modality.AUDIO] }
                });
            }
            
            if (isCameraEnabled) {
                frameIntervalRef.current = window.setInterval(async () => {
                    if (videoRef.current && canvasRef.current) {
                        const video = videoRef.current;
                        const canvas = canvasRef.current;
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            canvas.toBlob(async (blob) => {
                                if (blob) {
                                    const base64 = await blobToBase64(blob);
                                    capturedImagesRef.current.push({ data: base64, mimeType: 'image/jpeg' });
                                }
                            }, 'image/jpeg', 0.8);
                        }
                    }
                }, 2000);
            }

            setPageState('recording');
        } catch (error) {
            console.error("Failed to start recording:", error);
            setErrorMessage("Could not access camera/microphone. Please check permissions.");
            setPageState('error');
            cleanup();
        }
    };

    const stopRecording = async () => {
        cleanup();
        setPageState('processing');

        try {
            const result = await createMomentFromRecording(transcribedTextRef.current, capturedImagesRef.current, locationRef.current);
            setGeneratedMoment(result);
            setPageState('review');
        } catch (error) {
             console.error("Failed to create moment:", error);
             setErrorMessage("æterny could not create a moment from this recording. Please try again.");
             setPageState('error');
        }
    };

    const handleSaveMoment = () => {
        if (!generatedMoment) return;
        
        const hasImages = capturedImagesRef.current.length > 0;
        const imagePreviews = hasImages 
            ? capturedImagesRef.current.map(img => `data:${img.mimeType};base64,${img.data}`) 
            : [];

        const newMoment: Omit<Moment, 'id' | 'pinned'> = {
            type: 'standard',
            aiTier: 'diamond',
            image: hasImages ? imagePreviews[0] : undefined,
            images: hasImages ? imagePreviews : undefined,
            title: generatedMoment.title,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            description: generatedMoment.story,
            location: generatedMoment.tags.location[0] || undefined,
            people: generatedMoment.tags.people,
            activities: generatedMoment.tags.activities,
            photoCount: capturedImagesRef.current.length
        };

        onCreateMoment(newMoment);
    };
    
    const handleDiscard = () => {
        setTranscribedText('');
        transcribedTextRef.current = '';
        capturedImagesRef.current = [];
        locationRef.current = null;
        setGeneratedMoment(null);
        setPageState('idle');
    };
    
    const renderContent = () => {
        switch(pageState) {
            case 'idle':
                return (
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-white mb-2 font-brand">Capture a Momænt</h1>
                            <p className="text-lg text-slate-400 mb-8">Configure your capture sources and start recording your experience.</p>
                        </div>
                        
                        <div className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10">
                            <h2 className="text-xl font-bold text-white mb-4 font-brand">Capture Sources</h2>
                             <div className="space-y-4">
                                <ToggleSwitch icon={Mic} label="Voice" description="Live audio transcription" enabled={isVoiceEnabled} onToggle={setIsVoiceEnabled} />
                                <ToggleSwitch icon={Video} label="Camera" description="Video frames from your camera" enabled={isCameraEnabled} onToggle={setIsCameraEnabled} />
                                <ToggleSwitch icon={MapPin} label="Location" description="Geotag your momænt" enabled={isLocationEnabled} onToggle={setIsLocationEnabled} />
                                <ToggleSwitch icon={HeartPulse} label="Biometrics" description="Heart rate, activity (Coming Soon)" enabled={false} onToggle={() => {}} disabled />
                                <ToggleSwitch icon={MessageSquare} label="Social Feed" description="Import related posts (Coming Soon)" enabled={false} onToggle={() => {}} disabled />
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10 mt-6">
                            <h2 className="text-xl font-bold text-white mb-2 font-brand">Multi-perspective Momænt</h2>
                            <p className="text-sm text-slate-400 mb-4">Invite others to capture this moment with you from their perspective, like a wedding or birthday.</p>
                            <div className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                                 <div className="flex items-center">
                                    <div className="flex items-center -space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500 ring-2 ring-gray-800 flex items-center justify-center font-bold text-white">YOU</div>
                                        <div className="w-10 h-10 rounded-full bg-slate-600 ring-2 ring-gray-800 flex items-center justify-center text-slate-300 text-xl font-light">?</div>
                                    </div>
                                    <span className="text-sm text-slate-300 ml-4 hidden sm:block">You + Others</span>
                                </div>
                                <button className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-full transition-colors flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4"/> Invite Others
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                             <button
                                onClick={startRecording}
                                disabled={!isVoiceEnabled && !isCameraEnabled}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors flex items-center justify-center gap-3 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                                Start Capture
                            </button>
                            <p className="text-xs text-center text-slate-500 mt-2">At least one media source (Voice or Camera) must be enabled.</p>
                        </div>
                    </div>
                );
            case 'recording':
                return (
                     <div className="w-full h-[80vh] max-w-4xl bg-black rounded-2xl shadow-2xl ring-1 ring-white/10 flex flex-col">
                        <div className="relative flex-grow w-full rounded-lg overflow-hidden">
                            {isCameraEnabled ? (
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                                    <Mic className="w-24 h-24 mb-4"/>
                                    <p>Audio capture in progress...</p>
                                </div>
                            )}
                             <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                                {isCameraEnabled && <span className="flex items-center gap-1.5 text-xs bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm"><Check className="w-3 h-3 text-green-400"/> Camera Active</span>}
                                {isVoiceEnabled && <span className="flex items-center gap-1.5 text-xs bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm"><Check className="w-3 h-3 text-green-400"/> Mic Active</span>}
                                {isLocationEnabled && <span className="flex items-center gap-1.5 text-xs bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm"><Check className="w-3 h-3 text-green-400"/> Location Active</span>}
                            </div>
                            {isVoiceEnabled && (
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg text-slate-200 italic whitespace-pre-wrap max-h-48 overflow-y-auto">
                                        {transcribedText || "Listening..."}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={stopRecording} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-b-2xl text-lg transition-colors flex-shrink-0">Stop Capture</button>
                    </div>
                );
            case 'processing':
                 return (
                    <div className="text-center">
                         <div className="relative w-48 h-32 mx-auto mb-6 rounded-lg overflow-hidden bg-slate-800">
                            {capturedImagesRef.current.length > 0 ? (
                                 <img 
                                    key={processingImageIndex}
                                    src={`data:${capturedImagesRef.current[processingImageIndex].mimeType};base64,${capturedImagesRef.current[processingImageIndex].data}`} 
                                    className="w-full h-full object-cover animate-fade-in"
                                    style={{animationDuration: '200ms'}}
                                    alt="Processing..."
                                />
                            ) : (
                                <Bot className="w-16 h-16 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-white font-brand">Weaving your memory...</h2>
                        <p className="text-slate-400 mt-2">æterny is analyzing your recording to build a beautiful momænt.</p>
                    </div>
                );
            case 'review':
                if (!generatedMoment) return null;
                const hasImages = capturedImagesRef.current && capturedImagesRef.current.length > 0;
                return (
                    <div className="w-full max-w-4xl bg-gray-800/50 rounded-2xl shadow-2xl ring-1 ring-white/10 flex flex-col max-h-[90vh]">
                        <div className="p-8 flex-shrink-0">
                            <div className="flex items-center gap-3 mb-4">
                                <Bot className="w-8 h-8 text-cyan-400" />
                                <h2 className="text-3xl font-bold text-white font-brand">æterny's Draft</h2>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{generatedMoment.title}</h3>
                            <div className="prose prose-invert prose-p:text-slate-300 max-w-none max-h-48 overflow-y-auto pr-4">
                                <p>{generatedMoment.story}</p>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto px-8">
                           {hasImages ? (
                                <div className="masonry-grid">
                                    {capturedImagesRef.current.map((img, index) => (
                                        <div key={index} className="masonry-item mb-4">
                                            <img 
                                                src={`data:${img.mimeType};base64,${img.data}`} 
                                                alt={`Captured moment ${index + 1}`} 
                                                className="w-full h-auto rounded-lg" 
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="my-6 p-8 bg-gray-900/50 rounded-lg text-center text-slate-500">
                                    <p>No images were captured for this momænt.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-8 flex justify-end gap-4 border-t border-white/10 flex-shrink-0">
                            <button onClick={handleDiscard} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center gap-2"><Trash2 className="w-5 h-5"/> Discard</button>
                            <button onClick={handleSaveMoment} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center gap-2"><Save className="w-5 h-5"/> Save to Timestream</button>
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-red-400 font-brand">An Error Occurred</h2>
                        <p className="text-slate-400 mt-2 mb-6">{errorMessage}</p>
                        <button onClick={handleDiscard} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-full transition-colors">Try Again</button>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="container mx-auto px-6 pt-28 pb-8 min-h-[80vh] flex flex-col items-center justify-center animate-fade-in-up">
            <canvas ref={canvasRef} className="hidden"></canvas>
            {renderContent()}
        </div>
    );
};

export default RecordPage;