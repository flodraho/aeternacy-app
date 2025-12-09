
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { UploadCloud, X, Loader2, Sparkles, Play, Pause, CheckCircle, MapPin, Users, Tag, GitBranch, Wand2, ArrowRight, Star, Speaker, Zap, RefreshCw } from 'lucide-react';
import { createDemoStoryFromImages, textToSpeech } from '../services/geminiService';
import { AeternyVoice } from '../types';
import { decodeAudioData } from '../utils/audio';
import Slideshow from './Slideshow';
import GoogleIcon from './icons/GoogleIcon';

interface GeneratedData {
    title: string;
    story: string;
    tags: {
        location: string[];
        people: string[];
        activities: string[];
    };
}

interface ProductDemoProps {
    onClose: () => void;
    onComplete: (shouldRegister: boolean, demoData?: GeneratedData & { images: string[] }) => void;
}

interface SelectedFile {
    id: string;
    file: File;
    preview: string;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const fileToPayload = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header?.match(/:(.*?);/)?.[1];
            if (data && mimeType) {
                resolve({ data, mimeType });
            } else {
                reject(new Error('Could not parse file data for payload.'));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const voiceOptions: { name: string; voice: AeternyVoice; description: string }[] = [
    { name: 'The Mentor', voice: 'Kore', description: 'A warm, wise, and guiding voice.' },
    { name: 'The Sovereign', voice: 'Fenrir', description: 'A mature, resonant, and serious voice.' },
    { name: 'The Storyteller', voice: 'Charon', description: 'A calm, deep, and narrative voice.' }
];

const processingSteps = [
    { id: 'analyze', text: 'Scanning visual details & context...' },
    { id: 'story', text: 'Weaving the narrative arc...' },
    { id: 'narration', text: 'Recording voiceover...' }
];

type DemoStep = 'upload' | 'importing' | 'processing' | 'review' | 'playing' | 'showcase';

const ProductDemo: React.FC<ProductDemoProps> = ({ onClose, onComplete }) => {
    const [step, setStep] = useState<DemoStep>('upload');
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [headerId, setHeaderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Import Simulation State
    const [importProgress, setImportProgress] = useState(0);
    const [importStatus, setImportStatus] = useState('');
    
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
    const [narration, setNarration] = useState<{ buffer: AudioBuffer; context: AudioContext } | null>(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const slideTimerRef = useRef<number | null>(null);
    const progressFrameRef = useRef<number | null>(null);
    const [showcaseStep, setShowcaseStep] = useState(0);
    
    // Review step state
    const [editedTitle, setEditedTitle] = useState('');
    const [editedStory, setEditedStory] = useState('');
    const [selectedVoice, setSelectedVoice] = useState<AeternyVoice>('Charon');
    const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
    const [playingVoice, setPlayingVoice] = useState<AeternyVoice | null>(null);
    const sampleAudioContextRef = useRef<AudioContext | null>(null);
    const sampleAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);


    const sentences = useMemo(() => {
        const text = generatedData?.story;
        if (!text) return [];
        const matches = text.match(/[^.!?]+[.!?\s]*|\s*$/g)?.filter(s => s.trim()) || [text];
        let runningTime = 0;
        const totalDuration = narration?.buffer.duration || 30;
        const totalWords = text.trim().split(/\s+/).length;
        if (totalWords === 0) return [];

        return matches.map(sentence => {
            const wordCount = sentence.trim().split(/\s+/).length;
            const duration = (wordCount / totalWords) * totalDuration;
            const startTime = runningTime;
            runningTime += duration;
            return { text: sentence.trim(), startTime, endTime: runningTime };
        });
    }, [generatedData?.story, narration?.buffer]);

    const cleanupAudio = useCallback((context: 'main' | 'sample' | 'all' = 'all') => {
        if (context === 'main' || context === 'all') {
            if (progressFrameRef.current) cancelAnimationFrame(progressFrameRef.current);
            if (audioSourceRef.current) {
                audioSourceRef.current.onended = null;
                audioSourceRef.current.stop();
            }
            if (narration?.context?.state === 'running') narration?.context?.close();
            audioSourceRef.current = null;
            setCurrentSentenceIndex(-1);
        }
        if (context === 'sample' || context === 'all') {
            if (sampleAudioSourceRef.current) {
                sampleAudioSourceRef.current.onended = null;
                sampleAudioSourceRef.current.stop();
            }
            if (sampleAudioContextRef.current?.state === 'running') sampleAudioContextRef.current?.close();
            sampleAudioSourceRef.current = null;
            setPlayingVoice(null);
        }
    }, [narration]);

    useEffect(() => {
        return () => {
            cleanupAudio();
            if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
        }
    }, [cleanupAudio]);

    const processFiles = useCallback(async (fileList: FileList) => {
        const acceptedFiles = Array.from(fileList);
        if (acceptedFiles.length === 0) return;

        const newFiles = await Promise.all(acceptedFiles.map(async (file): Promise<SelectedFile> => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            preview: await fileToDataUrl(file),
        })));
        
        setSelectedFiles(prev => {
            const combined = [...prev, ...newFiles].slice(0, 10);
            if (!headerId && combined.length > 0) {
                setHeaderId(combined[0].id);
            }
            return combined;
        });
        setError(null);
    }, [headerId]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
        // Clear input value to allow re-selecting the same file
        e.target.value = '';
    };
    
    const handleRemoveFile = (idToRemove: string) => {
        setSelectedFiles(prev => {
            const newFiles = prev.filter(f => f.id !== idToRemove);
            if (headerId === idToRemove) {
                setHeaderId(newFiles.length > 0 ? newFiles[0].id : null);
            }
            return newFiles;
        });
    };

    const handleSetHeader = (id: string) => setHeaderId(id);

    const handleGenerate = async () => {
        if (selectedFiles.length < 5) {
            setError('Please upload at least 5 photos to create a compelling story.');
            return;
        }
        setStep('processing');
        setError(null);
        setCompletedSteps([]);

        try {
            // Step 1: Story
            // Check if files are mock files (size 0) or real
            const isMock = selectedFiles.some(f => f.file.size === 0);
            
            let storyData;
            if (isMock) {
                // Use pre-canned data for the mock "Google Photos" import
                 storyData = {
                    title: "The Road Less Traveled",
                    story: "We chased the horizon until the sun dipped low, painting the sky in hues of fire and gold. The mountains stood as silent giants witnessing our journey. Every turn revealed a new wonder, a fresh breath of freedom that only the open road can offer.",
                    tags: { location: ["Mountains", "Highway 1", "California"], people: ["Friends"], activities: ["Road Trip", "Sunset"] }
                };
                await new Promise(r => setTimeout(r, 2000)); // Simulate thinking
            } else {
                const payloads = await Promise.all(selectedFiles.map(sf => fileToPayload(sf.file)));
                storyData = await createDemoStoryFromImages(payloads);
            }
            
            setCompletedSteps(['analyze', 'story']);
            setGeneratedData(storyData);
            setEditedTitle(storyData.title);
            setEditedStory(storyData.story);

            // Step 2: Narration
            await handleGenerateNarration(storyData.story, selectedVoice);
            setCompletedSteps(['analyze', 'story', 'narration']);
            
            await new Promise(r => setTimeout(r, 500));

            setStep('review');
        } catch (err) {
            console.error(err);
            setError("Sorry, æterny couldn't create your story. Please try again with different images.");
            setStep('upload');
        }
    };

    const handleSignUp = () => {
        if (generatedData) {
            onComplete(true, {
                ...generatedData,
                images: selectedFiles.map(f => f.preview)
            });
        }
    };
    
    const handleGenerateNarration = async (story: string, voice: AeternyVoice) => {
        if (!story) return;
        setIsGeneratingNarration(true);
        cleanupAudio('main');
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await textToSpeech(story, audioContext, voice);
            setNarration({ buffer: audioBuffer, context: audioContext });
        } finally {
            setIsGeneratingNarration(false);
        }
    };

    const handleVoiceSample = async (voice: AeternyVoice) => {
        const selectedOption = voiceOptions.find(opt => opt.voice === voice);
        if (!selectedOption) return;

        cleanupAudio('sample');
        setPlayingVoice(voice);
        const sampleAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        sampleAudioContextRef.current = sampleAudioContext;
        try {
            const buffer = await textToSpeech(`This is the voice of ${selectedOption.name}.`, sampleAudioContext, voice);
            if (buffer && sampleAudioContextRef.current) {
                const source = sampleAudioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(sampleAudioContextRef.current.destination);
                source.start();
                source.onended = () => { if(sampleAudioSourceRef.current === source) setPlayingVoice(null); };
                sampleAudioSourceRef.current = source;
            } else {
                setPlayingVoice(null);
            }
        } catch (error) {
            console.error("Error playing voice sample:", error);
            setPlayingVoice(null);
        }
    };

    const handleContinueToSlideshow = async () => {
        if (generatedData?.story !== editedStory || !narration) {
            await handleGenerateNarration(editedStory, selectedVoice);
        }
        if (generatedData?.title !== editedTitle && generatedData) {
            setGeneratedData({ ...generatedData, title: editedTitle });
        }
        setStep('playing');
    };

    // New: Simulate Google Photos Import
    const startGooglePhotosSimulation = async () => {
        setStep('importing');
        setImportProgress(0);
        setImportStatus('Connecting to Google Photos...');

        await new Promise(r => setTimeout(r, 1000));
        setImportProgress(30);
        setImportStatus('Scanning timeline for recent events...');

        await new Promise(r => setTimeout(r, 1500));
        setImportProgress(60);
        setImportStatus("Found 'Summer Roadtrip 2024' (8 photos)...");
        
        await new Promise(r => setTimeout(r, 1000));
        setImportProgress(100);
        setImportStatus('Importing photos...');

        await new Promise(r => setTimeout(r, 800));

        // Load Mock Data
        const exampleImages = [
            'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg',
            'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg',
            'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg',
            'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg',
            'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg',
            'https://images.pexels.com/photos/1252983/pexels-photo-1252983.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/3363357/pexels-photo-3363357.jpeg?auto=compress&cs=tinysrgb&w=400',
        ];

        setSelectedFiles(exampleImages.map((url, i) => ({
            id: `example-${i}`,
            file: new File([], ""), // Mock file
            preview: url
        })));
        setHeaderId('example-0');
        
        // Auto-proceed to generation
        handleGenerate();
    };

    
    useEffect(() => {
        if (step !== 'playing' || !narration || !generatedData) return;

        const audioContext = narration.context;
        const audioBuffer = narration.buffer;

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        if(isPlaying) source.start();
        audioSourceRef.current = source;
        
        const totalDuration = audioBuffer.duration;
        const slideDuration = totalDuration / selectedFiles.length;
        
        const advance = (index: number) => {
            if (index < selectedFiles.length) {
                setCurrentSlideIndex(index);
                slideTimerRef.current = window.setTimeout(() => advance(index + 1), slideDuration * 1000);
            }
        };
        advance(0);

        const startTime = audioContext.currentTime;
        const animateProgress = () => {
            if (audioContext.state === 'running' && audioSourceRef.current) {
                const elapsedTime = audioContext.currentTime - startTime;
                const currentSentence = sentences.findIndex(s => elapsedTime >= s.startTime && elapsedTime < s.endTime);
                setCurrentSentenceIndex(currentSentence);
                progressFrameRef.current = requestAnimationFrame(animateProgress);
            }
        };
        animateProgress();

        source.onended = () => {
            cleanupAudio();
            setTimeout(() => setStep('showcase'), 1000); // Pause before moving on
        };
    }, [step, isPlaying, generatedData, narration, selectedFiles.length, sentences, cleanupAudio]);

    useEffect(() => {
        if (step === 'showcase') {
            const timers = [
                setTimeout(() => setShowcaseStep(1), 500), // Show tags
                setTimeout(() => setShowcaseStep(2), 1500), // Show timeline
                setTimeout(() => setShowcaseStep(3), 2500), // Show curation
                setTimeout(() => setShowcaseStep(4), 4000), // Show CTA
            ];
            return () => timers.forEach(clearTimeout);
        }
    }, [step]);


    const renderUpload = () => (
        <div className="w-full max-w-4xl text-center animate-fade-in-up">
            <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white font-brand">Experience the Magic</h1>
            <p className="text-slate-300 mt-2 mb-10 text-lg">See how æterny transforms scattered photos into a cohesive, narrated story in seconds.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Option 1: Fast Track */}
                <button 
                    onClick={startGooglePhotosSimulation}
                    className="bg-slate-800/80 hover:bg-slate-700/80 border-2 border-transparent hover:border-cyan-500/50 rounded-2xl p-8 transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 bg-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Fastest</div>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                        <GoogleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Simulate Google Photos Import</h3>
                    <p className="text-slate-400 text-sm">We'll simulate finding a "Summer Trip" album and import 8 photos instantly.</p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-cyan-400 font-bold text-sm group-hover:gap-3 transition-all">
                        Start Demo <ArrowRight className="w-4 h-4"/>
                    </div>
                </button>

                {/* Option 2: Manual Upload */}
                <div
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 transition-colors flex flex-col items-center justify-center ${isDragging ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-600 bg-transparent hover:bg-white/5'}`}
                >
                     {selectedFiles.length === 0 ? (
                        <>
                            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-6">
                                <UploadCloud className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Upload Your Own</h3>
                            <p className="text-slate-400 text-sm mb-6">Drag & drop 5-10 photos to see them transformed.</p>
                            <label htmlFor="demo-upload" className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-full text-sm cursor-pointer transition-colors">
                                Select Files
                            </label>
                             <input id="demo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                        </>
                    ) : (
                        <div className="w-full">
                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {selectedFiles.map((file) => (
                                    <div key={file.id} className="relative aspect-square group">
                                        <img src={file.preview} className="w-full h-full object-cover rounded-md" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                            <button onClick={() => handleRemoveFile(file.id)} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center" title="Remove"><X size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                {selectedFiles.length < 10 && <label htmlFor="demo-upload-add" className="flex aspect-square items-center justify-center border-2 border-dashed border-slate-600 rounded-md cursor-pointer text-slate-400 hover:bg-slate-700/50 hover:border-slate-500 text-2xl">+</label>}
                                <input id="demo-upload-add" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                            </div>
                            <button onClick={handleGenerate} disabled={selectedFiles.length < 5} className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all disabled:bg-gray-600 disabled:cursor-not-allowed">
                                Generate My Story
                            </button>
                            {selectedFiles.length < 5 && <p className="text-xs text-red-400 mt-2">Please add {5 - selectedFiles.length} more photos.</p>}
                        </div>
                    )}
                </div>
            </div>
            
            {error && <p className="text-red-400 mt-8 text-sm bg-red-900/20 p-2 rounded-lg inline-block">{error}</p>}
        </div>
    );
    
    const renderImporting = () => (
         <div className="w-full max-w-md text-center animate-fade-in">
            <div className="relative w-24 h-24 mx-auto mb-8">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#06b6d4" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * importProgress / 100)} className="transition-all duration-300 ease-linear" transform="rotate(-90 50 50)" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                     <GoogleIcon className="w-10 h-10" />
                 </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{importStatus}</h2>
            <p className="text-slate-400 text-sm font-mono">{importProgress}%</p>
         </div>
    );

    const renderProcessing = () => {
        const currentStepIndex = completedSteps.length;
        return (
            <div className="text-center animate-fade-in w-full max-w-md">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-cyan-500/30">
                    <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold font-brand mb-8 text-white">æterny is creating...</h1>
                <div className="space-y-4 text-left bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                    {processingSteps.map((step, index) => {
                        const isCompleted = completedSteps.includes(step.id);
                        const isCurrent = index === currentStepIndex && index < processingSteps.length;
                        return (
                            <div key={step.id} className={`flex items-center gap-4 transition-all duration-500 ${!isCompleted && !isCurrent ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}>
                                {isCompleted ? (
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center ring-1 ring-green-500/50">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                    </div>
                                ) : isCurrent ? (
                                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-600" />
                                )}
                                <span className={`text-sm ${isCurrent ? 'text-white font-bold' : 'text-slate-300'}`}>{step.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    
    const renderReview = () => {
        const headerImage = selectedFiles.find(f => f.id === headerId)?.preview || selectedFiles[0]?.preview;
        return (
            <div className="w-full max-w-5xl animate-fade-in-up grid grid-cols-1 lg:grid-cols-2 gap-8 h-[80vh]">
                <div className="flex flex-col justify-center">
                    <div className="w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl relative group">
                        {headerImage ? (
                            <img src={headerImage} alt="Story header" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Header image</div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                             <h3 className="text-white font-bold text-xl font-brand">{editedTitle}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800/50 p-8 rounded-2xl ring-1 ring-white/10 flex flex-col h-full border-l-4 border-cyan-500">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold font-brand mb-1 text-white">Review Draft</h2>
                        <p className="text-slate-400 text-sm">æterny wrote this story based on your photos.</p>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Story Narrative</label>
                            <textarea value={editedStory} onChange={e => setEditedStory(e.target.value)} rows={8} className="w-full bg-slate-900/50 border border-white/10 p-4 rounded-xl mt-2 text-base text-slate-200 leading-relaxed font-serif focus:ring-2 focus:ring-cyan-500/50 outline-none resize-none" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Voice Persona</label>
                            <div className="grid grid-cols-1 gap-2">
                                {voiceOptions.map(opt => (
                                    <button key={opt.voice} onClick={() => setSelectedVoice(opt.voice)} className={`p-3 rounded-lg border flex items-center justify-between transition-all ${selectedVoice === opt.voice ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 hover:bg-white/5'}`}>
                                        <span className="font-semibold text-sm text-white">{opt.name}</span>
                                        <button onClick={(e) => { e.stopPropagation(); handleVoiceSample(opt.voice); }} className="text-slate-400 hover:text-cyan-400 p-1">
                                            {playingVoice === opt.voice ? <Speaker className="w-4 h-4 animate-pulse text-cyan-400" /> : <Play className="w-4 h-4" />}
                                        </button>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                         <button onClick={() => setStep('upload')} className="text-slate-400 hover:text-white text-sm font-semibold flex items-center gap-2"><RefreshCw className="w-4 h-4"/> Start Over</button>
                        <button onClick={handleContinueToSlideshow} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-full text-base transition-all transform hover:scale-105 shadow-lg shadow-cyan-900/20">
                            Play Experience
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderPlaying = () => (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <Slideshow images={selectedFiles.map(f => f.preview)} isPlaying={isPlaying} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none"></div>
                
                {/* Subtitles */}
                <div className="absolute bottom-12 left-12 right-12 text-center">
                     <p className="text-white/90 text-2xl md:text-3xl font-medium leading-relaxed drop-shadow-xl animate-fade-in font-serif">
                        {currentSentenceIndex > -1 ? sentences[currentSentenceIndex]?.text : "..."}
                    </p>
                </div>

                <div className="absolute top-8 left-8">
                     <h2 className="text-white/80 font-brand font-bold text-lg tracking-wide uppercase">{generatedData?.title}</h2>
                </div>
            </div>
            <p className="text-slate-500 mt-6 text-sm animate-pulse">Playing generated memory...</p>
        </div>
    );
    
    const renderShowcase = () => (
        <div className="w-full max-w-6xl mx-auto text-center animate-fade-in-up flex flex-col items-center justify-center min-h-[60vh]">
            <div className="mb-12">
                 <div className="w-24 h-24 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(6,182,212,0.4)] animate-pulse">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-5xl font-bold text-white font-brand mb-4">Magic, isn't it?</h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">This is exactly what æterny will do for every memory in your collection.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                <div className={`transition-all duration-700 delay-100 transform ${showcaseStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} bg-slate-800/40 p-6 rounded-2xl border border-white/5`}>
                    <Tag className="w-8 h-8 text-cyan-400 mx-auto mb-3"/>
                    <h3 className="text-lg font-bold text-white">Auto-Tagged</h3>
                    <p className="text-slate-400 text-sm mt-2">People, places, and emotions organized automatically.</p>
                </div>
                <div className={`transition-all duration-700 delay-300 transform ${showcaseStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} bg-slate-800/40 p-6 rounded-2xl border border-white/5`}>
                    <GitBranch className="w-8 h-8 text-cyan-400 mx-auto mb-3"/>
                    <h3 className="text-lg font-bold text-white">Timeline Ready</h3>
                    <p className="text-slate-400 text-sm mt-2">Placed perfectly in your chronological life stream.</p>
                </div>
                <div className={`transition-all duration-700 delay-500 transform ${showcaseStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} bg-slate-800/40 p-6 rounded-2xl border border-white/5`}>
                    <Wand2 className="w-8 h-8 text-cyan-400 mx-auto mb-3"/>
                    <h3 className="text-lg font-bold text-white">Narrated</h3>
                    <p className="text-slate-400 text-sm mt-2">Ready to be watched, shared, or passed down.</p>
                </div>
            </div>
            
             <div className={`transition-all duration-700 delay-700 ${showcaseStep >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <p className="text-slate-300 mb-6 text-lg">Want to import your last year?</p>
                <button onClick={handleSignUp} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-12 rounded-full text-xl transition-all transform hover:scale-105 shadow-xl shadow-cyan-900/30 flex items-center gap-3">
                    Import & Sign Up <ArrowRight className="w-6 h-6"/>
                </button>
                <p className="text-xs text-slate-500 mt-4">This memory will be waiting for you in your new account.</p>
             </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-950 z-[100] p-4 py-12 overflow-y-auto" onClick={onClose}>
            <button onClick={onClose} className="fixed top-6 right-6 text-slate-500 hover:text-white transition-colors z-[110] bg-slate-900/50 p-2 rounded-full hover:bg-slate-800">
                <X size={24} />
            </button>
            <div className="min-h-full w-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                {step === 'upload' && renderUpload()}
                {step === 'importing' && renderImporting()}
                {step === 'processing' && renderProcessing()}
                {step === 'review' && renderReview()}
                {step === 'playing' && renderPlaying()}
                {step === 'showcase' && renderShowcase()}
            </div>
        </div>
    );
};

export default ProductDemo;
