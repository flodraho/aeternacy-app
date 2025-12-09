
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { createMomentFromRecording } from '../services/geminiService';
import { Moment } from '../types';
import { Mic, Video, MapPin, Loader2, Save, Trash2, Bot, StopCircle, Camera, Sparkles, MicOff, VideoOff, MapPinOff, Users, UserPlus } from 'lucide-react';

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

const SensorButton: React.FC<{ 
    active: boolean; 
    icon: React.ElementType; 
    offIcon: React.ElementType;
    label: string; 
    onClick: () => void;
}> = ({ active, icon: Icon, offIcon: OffIcon, label, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 w-24 aspect-square backdrop-blur-md border ${
            active 
            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
            : 'bg-slate-800/40 border-white/5 text-slate-500 hover:bg-slate-800/60'
        }`}
    >
        {active ? <Icon className="w-6 h-6" /> : <OffIcon className="w-6 h-6" />}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
);

const AudioVisualizer: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="flex items-center justify-center gap-1 h-8">
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-1 bg-cyan-400 rounded-full animate-music-bar"
                    style={{ 
                        height: '100%', 
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s' 
                    }} 
                />
            ))}
        </div>
    );
};


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
    const [isCameraEnabled, setIsCameraEnabled] = useState(false); // Default to voice only for "Story" feel
    const [isLocationEnabled, setIsLocationEnabled] = useState(true);
    const [isJointSession, setIsJointSession] = useState(false);
    const [jointPartner, setJointPartner] = useState<string | null>(null);

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

    // Animation for processing view
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

    const toggleJointSession = () => {
        if (!isJointSession) {
            // Mock selecting a partner
            setJointPartner("Jane Doe");
            setIsJointSession(true);
        } else {
            setJointPartner(null);
            setIsJointSession(false);
        }
    };

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
            // Inject joint partner if present
            if (isJointSession && jointPartner) {
                result.tags.people = [...(result.tags.people || []), jointPartner];
            }
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
            photoCount: capturedImagesRef.current.length,
            collaborators: isJointSession && jointPartner ? [jointPartner] : []
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

    // --- UI Renderers ---

    const renderReview = () => {
        if (!generatedMoment) return null;
        const hasImages = capturedImagesRef.current && capturedImagesRef.current.length > 0;
        return (
            <div className="w-full max-w-4xl bg-gray-800/50 rounded-3xl shadow-2xl ring-1 ring-white/10 flex flex-col max-h-[85vh] animate-fade-in-up">
                <div className="p-8 border-b border-white/10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white font-brand">Momænt Crafted</h2>
                        </div>
                        <p className="text-slate-400 text-sm">æterny has synthesized your recording.</p>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto space-y-6">
                     <div>
                        <h3 className="text-3xl font-bold text-white font-brand mb-3">{generatedMoment.title}</h3>
                        <div className="prose prose-invert prose-p:text-slate-300 prose-lg max-w-none leading-relaxed">
                            <p>{generatedMoment.story}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {generatedMoment.tags.location.map(t => <span key={t} className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs font-medium flex items-center gap-1"><MapPin size={10}/> {t}</span>)}
                        {generatedMoment.tags.people.map(t => <span key={t} className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs font-medium flex items-center gap-1"><Users size={10}/> {t}</span>)}
                    </div>

                    {hasImages && (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                            {capturedImagesRef.current.map((img, index) => (
                                <div key={index} className="aspect-square rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10">
                                    <img 
                                        src={`data:${img.mimeType};base64,${img.data}`} 
                                        alt={`Captured moment ${index + 1}`} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="p-6 flex justify-end gap-4 border-t border-white/10 bg-slate-900/30 rounded-b-3xl">
                    <button onClick={handleDiscard} className="text-slate-400 hover:text-red-400 px-6 py-3 font-semibold transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4"/> Discard</button>
                    <button onClick={handleSaveMoment} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-cyan-500/20"><Save className="w-4 h-4"/> Save to Timestream</button>
                </div>
            </div>
        );
    };

    const renderError = () => (
         <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/30">
                <Bot className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-white font-brand mb-2">Connection Interrupted</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">{errorMessage}</p>
            <button onClick={handleDiscard} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full transition-colors">Return to Studio</button>
        </div>
    );

    const renderProcessing = () => (
         <div className="text-center animate-fade-in">
             <div className="relative w-32 h-32 mx-auto mb-8">
                 <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                 <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"></div>
                 <div className="absolute inset-0 rounded-full flex items-center justify-center">
                    <Bot className="w-12 h-12 text-cyan-400 animate-pulse" />
                 </div>
            </div>
            <h2 className="text-4xl font-bold text-white font-brand mb-4">Weaving Reality...</h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto">æterny is synthesizing your audio, visuals, and context into a timeless memory.</p>
            
            {capturedImagesRef.current.length > 0 && (
                 <div className="mt-8 h-16 flex justify-center gap-2 opacity-50">
                      {/* Tiny visual indicator of captured frames being processed */}
                     {[0,1,2].map(i => (
                         <div key={i} className="w-12 h-16 rounded bg-slate-700 animate-pulse" style={{animationDelay: `${i*0.2}s`}}></div>
                     ))}
                 </div>
            )}
        </div>
    );

    // The main capture interface
    return (
        <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-center">
             <canvas ref={canvasRef} className="hidden"></canvas>
             
             {/* Background Ambiance */}
             <div className="absolute inset-0 pointer-events-none">
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] transition-all duration-1000 ${pageState === 'recording' ? 'scale-110 opacity-30' : 'scale-100 opacity-10'}`}></div>
             </div>

             {/* Main Stage */}
             <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
                 {pageState === 'idle' && (
                     <div className="flex flex-col items-center gap-12 animate-fade-in-up">
                         <div className="text-center space-y-2">
                             <h1 className="text-5xl md:text-7xl font-bold text-white font-brand tracking-tight">Capture the Now</h1>
                             <p className="text-slate-400 text-lg">Select your senses.</p>
                         </div>

                         {/* Sensor Control Bar */}
                         <div className="flex gap-6 flex-wrap justify-center">
                             <SensorButton active={isVoiceEnabled} icon={Mic} offIcon={MicOff} label="Voice" onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} />
                             <SensorButton active={isCameraEnabled} icon={Camera} offIcon={VideoOff} label="Camera" onClick={() => setIsCameraEnabled(!isCameraEnabled)} />
                             <SensorButton active={isLocationEnabled} icon={MapPin} offIcon={MapPinOff} label="Location" onClick={() => setIsLocationEnabled(!isLocationEnabled)} />
                             <SensorButton active={isJointSession} icon={Users} offIcon={UserPlus} label="Joint" onClick={toggleJointSession} />
                         </div>

                         {/* Big Action Button */}
                         <button 
                            onClick={startRecording}
                            disabled={!isVoiceEnabled && !isCameraEnabled}
                            className="group relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                             <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-full opacity-80 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-500"></div>
                             <div className="absolute inset-1 bg-slate-950 rounded-full flex items-center justify-center ring-1 ring-white/10">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] transition-shadow duration-500">
                                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                                        <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                                    </div>
                                </div>
                             </div>
                         </button>
                     </div>
                 )}

                 {pageState === 'recording' && (
                     <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl animate-fade-in">
                         {/* Camera / Audio Visualizer Area */}
                         <div className="relative flex-grow bg-slate-900 flex items-center justify-center overflow-hidden">
                             {isCameraEnabled ? (
                                 <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                             ) : (
                                 <div className="flex flex-col items-center gap-8">
                                     {/* Breathing Orb for Audio */}
                                     <div className="relative w-64 h-64 flex items-center justify-center">
                                         <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '2s'}}></div>
                                         <div className="w-32 h-32 bg-gradient-to-tr from-cyan-500/40 to-blue-500/40 rounded-full backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center">
                                             <Mic className="w-12 h-12 text-white" />
                                         </div>
                                     </div>
                                     <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Listening</p>
                                 </div>
                             )}

                             {/* Live Transcription Overlay */}
                             {isVoiceEnabled && (
                                 <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-32 pointer-events-none flex flex-col justify-end min-h-[300px]">
                                     <div className="max-w-3xl mx-auto text-center">
                                        <p className="text-2xl md:text-3xl font-medium text-white/90 leading-relaxed drop-shadow-lg transition-all duration-300">
                                            {transcribedText ? `"${transcribedText}"` : <span className="opacity-50">...</span>}
                                        </p>
                                     </div>
                                 </div>
                             )}

                             {/* Status Indicators */}
                             <div className="absolute top-6 left-6 flex gap-3 flex-wrap">
                                 <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full backdrop-blur-md border border-red-500/30">
                                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                     <span className="text-xs font-bold uppercase tracking-wider">Recording</span>
                                 </div>
                                 {isLocationEnabled && (
                                     <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 text-white/70 rounded-full backdrop-blur-md border border-white/10">
                                         <MapPin className="w-3 h-3" />
                                         <span className="text-xs font-bold uppercase tracking-wider">Locating</span>
                                     </div>
                                 )}
                                 {isJointSession && jointPartner && (
                                     <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full backdrop-blur-md border border-indigo-500/30">
                                         <Users className="w-3 h-3" />
                                         <span className="text-xs font-bold uppercase tracking-wider">With {jointPartner}</span>
                                     </div>
                                 )}
                             </div>
                         </div>

                         {/* Bottom Controls */}
                         <div className="h-24 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center relative z-20">
                             <button 
                                onClick={stopRecording}
                                className="group flex flex-col items-center gap-1"
                             >
                                 <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center transition-all duration-300 group-hover:border-red-500/50 group-hover:bg-red-500/10">
                                     <div className="w-6 h-6 bg-red-500 rounded-md shadow-[0_0_15px_#ef4444]"></div>
                                 </div>
                             </button>
                         </div>
                     </div>
                 )}

                 {pageState === 'processing' && renderProcessing()}
                 {pageState === 'review' && renderReview()}
                 {pageState === 'error' && renderError()}
             </div>
        </div>
    );
};

export default RecordPage;
