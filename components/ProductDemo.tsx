
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { UploadCloud, X, Loader2, Sparkles, Play, Pause, CheckCircle, MapPin, Users, Tag, GitBranch, Wand2, ArrowRight, Star, Speaker } from 'lucide-react';
import { createDemoStoryFromImages, textToSpeech } from '../services/geminiService';
import { AeternyVoice } from '../types';
import { decodeAudioData } from '../utils/audio';
import Slideshow from './Slideshow';
import GooglePhotosIcon from './icons/GooglePhotosIcon';
import ApplePhotosIcon from './icons/ApplePhotosIcon';
import Tooltip from './Tooltip';

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
    { id: 'analyze', text: 'Analyzing photos & finding themes' },
    { id: 'story', text: 'Writing your personal story' },
    { id: 'narration', text: 'Voicing your personal story' }
];

type DemoStep = 'upload' | 'processing' | 'review' | 'playing' | 'showcase';

const ProductDemo: React.FC<ProductDemoProps> = ({ onClose, onComplete }) => {
    const [step, setStep] = useState<DemoStep>('upload');
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [headerId, setHeaderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [generatedData, setGeneratedData] = useState<(GeneratedData & { images: string[] }) | null>(null);
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
            const payloads = await Promise.all(selectedFiles.map(sf => fileToPayload(sf.file)));
            const storyData = await createDemoStoryFromImages(payloads);
            setCompletedSteps(['analyze', 'story']);
            setGeneratedData({ ...storyData, images: selectedFiles.map(f => f.preview) });
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

    const startExample = async () => {
        const exampleImages = [
            'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg',
            'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg',
            'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg',
            'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg',
            'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg'
        ];
        const exampleData: GeneratedData = {
            title: "Whispers of the Wild",
            story: "A journey through misty forests and across silent waters. We watched the northern lights dance in the sky, a spectacle of color against the dark canvas of night. Each moment was a breath of fresh air, a quiet reflection on nature's grandeur.",
            tags: { location: ["Forest", "Mountains", "Coastal"], people: [], activities: ["Hiking", "Stargazing", "Reflection"] }
        };

        setSelectedFiles(exampleImages.map((url, i) => ({
            id: `example-${i}`,
            file: new File([], ""),
            preview: url
        })));
        setHeaderId('example-0');
        setGeneratedData({ ...exampleData, images: exampleImages });
        setEditedTitle(exampleData.title);
        setEditedStory(exampleData.story);
        
        setStep('processing');
        setCompletedSteps([]);

        await new Promise(r => setTimeout(r, 500));
        setCompletedSteps(['analyze', 'story']);
        
        await new Promise(r => setTimeout(r, 1000));
        await handleGenerateNarration(exampleData.story, selectedVoice);
        setCompletedSteps(['analyze', 'story', 'narration']);

        await new Promise(r => setTimeout(r, 500));
        setStep('review');
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
                setTimeout(() => setShowcaseStep(1), 1000), // Show tags
                setTimeout(() => setShowcaseStep(2), 3000), // Show timeline
                setTimeout(() => setShowcaseStep(3), 5000), // Show curation
                setTimeout(() => setShowcaseStep(4), 7000), // Show CTA
            ];
            return () => timers.forEach(clearTimeout);
        }
    }, [step]);


    const renderUpload = () => (
        <div className="w-full max-w-2xl text-center animate-fade-in-up">
            <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white font-brand">Try a Live Demo</h1>
            <p className="text-slate-300 mt-2 mb-6">Upload 5-10 of your favorite photos and watch æterny turn them into a narrated story.</p>
            <div
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors min-h-[200px] ${isDragging ? 'border-cyan-400 bg-cyan-900/20' : 'border-gray-600'}`}
            >
                {selectedFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                        <UploadCloud className="w-10 h-10 mb-2" />
                        <p>Drag & drop photos here</p>
                        <p className="text-sm">or</p>
                        <label htmlFor="demo-upload" className="font-semibold text-cyan-400 hover:underline cursor-pointer pointer-events-auto">browse your files</label>
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-2">
                        {selectedFiles.map((file) => (
                            <div key={file.id} className="relative aspect-square group">
                                <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover rounded-md" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                    <button onClick={() => handleSetHeader(file.id)} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center" title="Set as header"><Star size={14} fill={headerId === file.id ? 'currentColor' : 'none'} /></button>
                                    <button onClick={() => handleRemoveFile(file.id)} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center" title="Remove"><X size={14} /></button>
                                </div>
                                {headerId === file.id && <div className="absolute top-1 left-1 bg-cyan-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">HEADER</div>}
                            </div>
                        ))}
                        {selectedFiles.length < 10 && <label htmlFor="demo-upload" className="flex aspect-square items-center justify-center border-2 border-dashed border-slate-600 rounded-md cursor-pointer text-slate-400 hover:bg-slate-700/50 hover:border-slate-500 text-2xl">+</label>}
                    </div>
                )}
                <input id="demo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
            </div>
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
            
            {selectedFiles.length > 0 ? (
                <>
                    <button onClick={handleGenerate} disabled={selectedFiles.length < 5 || selectedFiles.length > 10} className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        Generate My Story
                    </button>
                    <p className="text-xs text-slate-500 mt-2">Please upload between 5 and 10 photos.</p>
                </>
            ) : (
                <>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-700" /></div>
                        <div className="relative flex justify-center text-sm"><span className="bg-slate-900/95 px-2 text-slate-400">Or</span></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button onClick={startExample} className="w-full bg-slate-700/80 hover:bg-slate-700 p-4 rounded-lg ring-1 ring-white/10 flex items-center justify-center gap-3 transition-colors">
                            <Wand2 className="w-5 h-5" />
                            <span className="font-semibold">Use Sample Photos</span>
                        </button>
                        <Tooltip text="Coming Soon!">
                            <button disabled className="w-full bg-slate-700/50 p-4 rounded-lg ring-1 ring-white/10 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <GooglePhotosIcon className="w-6 h-6" />
                                <span className="font-semibold">Google Photos</span>
                            </button>
                        </Tooltip>
                        <Tooltip text="Coming Soon!">
                            <button disabled className="w-full bg-slate-700/50 p-4 rounded-lg ring-1 ring-white/10 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <ApplePhotosIcon className="w-5 h-5" />
                                <span className="font-semibold">Apple Photos</span>
                            </button>
                        </Tooltip>
                    </div>
                </>
            )}
        </div>
    );
    
    const renderProcessing = () => {
        const currentStepIndex = completedSteps.length;
        return (
            <div className="text-center animate-fade-in w-full max-w-md">
                <h1 className="text-3xl font-bold font-brand mb-6">æterny is curating...</h1>
                <div className="space-y-3 text-left">
                    {processingSteps.map((step, index) => {
                        const isCompleted = completedSteps.includes(step.id);
                        const isCurrent = index === currentStepIndex && index < processingSteps.length;
                        return (
                            <div key={step.id} className={`flex items-center gap-3 transition-opacity duration-500 ${!isCompleted && !isCurrent ? 'opacity-40' : 'opacity-100'}`}>
                                {isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                ) : isCurrent ? (
                                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin flex-shrink-0" />
                                ) : (
                                    <div className="w-5 h-5 flex-shrink-0 border-2 border-slate-600 rounded-full" />
                                )}
                                <span className={`${isCurrent ? 'text-white font-semibold' : 'text-slate-400'}`}>{step.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    
    const renderReview = () => {
        const headerImage = selectedFiles.find(f => f.id === headerId)?.preview;
        return (
            <div className="w-full max-w-5xl animate-fade-in-up grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden ring-1 ring-white/10 shadow-lg">
                        {headerImage ? (
                            <img src={headerImage} alt="Story header" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Header image will appear here.</div>
                        )}
                    </div>
                    <p className="text-sm text-slate-400 mt-2">This is your header image.</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl ring-1 ring-white/10 flex flex-col">
                    <h2 className="text-2xl font-bold font-brand mb-4">Review Your Story</h2>
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-400">Title</label>
                            <input value={editedTitle} onChange={e => setEditedTitle(e.target.value)} className="w-full bg-slate-700/50 p-2 rounded-md mt-1 text-lg font-bold" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-400">Story</label>
                            <textarea value={editedStory} onChange={e => setEditedStory(e.target.value)} rows={5} className="w-full bg-slate-700/50 p-2 rounded-md mt-1 text-sm whitespace-pre-wrap" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-400">Narrator Voice</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                                {voiceOptions.map(opt => (
                                    <button key={opt.voice} onClick={() => setSelectedVoice(opt.voice)} className={`p-3 rounded-lg border-2 text-left transition-colors ${selectedVoice === opt.voice ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-sm">{opt.name}</p>
                                            <button onClick={(e) => { e.stopPropagation(); handleVoiceSample(opt.voice); }} className="text-slate-400 hover:text-cyan-400">
                                                {playingVoice === opt.voice ? <Speaker className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-auto pt-4 flex justify-end">
                        <button onClick={handleContinueToSlideshow} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-6 rounded-full text-base transition-all transform hover:scale-105">
                            Finalize & Play Story
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderPlaying = () => (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
                {generatedData && <Slideshow images={generatedData.images} isPlaying={isPlaying} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-center text-white text-xl font-semibold" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.8)' }}>
                    {currentSentenceIndex > -1 && <p className="animate-fade-in">{sentences[currentSentenceIndex]?.text}</p>}
                </div>
            </div>
             <p className="text-2xl font-bold text-white font-brand mt-4">{generatedData?.title}</p>
        </div>
    );
    
    const renderShowcase = () => (
        <div className="w-full max-w-5xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-4xl font-bold text-white font-brand">Your Story is Ready.</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className={`transition-opacity duration-700 ${showcaseStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center justify-center gap-2"><Tag/> Tags</h3>
                    <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {generatedData?.tags.location.map(t => <span key={t} className="flex items-center gap-1 text-xs bg-gray-700 px-2 py-1 rounded-full"><MapPin size={12}/>{t}</span>)}
                            {generatedData?.tags.people.map(t => <span key={t} className="flex items-center gap-1 text-xs bg-gray-700 px-2 py-1 rounded-full"><Users size={12}/>{t}</span>)}
                            {generatedData?.tags.activities.map(t => <span key={t} className="flex items-center gap-1 text-xs bg-gray-700 px-2 py-1 rounded-full"><CheckCircle size={12}/>{t}</span>)}
                        </div>
                        <p className="text-xs text-slate-500">æterny automatically finds details in your memories.</p>
                    </div>
                </div>
                <div className={`transition-opacity duration-700 ${showcaseStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                     <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center justify-center gap-2"><GitBranch/> Timeline</h3>
                     <div className="bg-slate-800/50 p-4 rounded-lg">
                        <div className="relative w-full h-24 flex items-center justify-center">
                            <div className="w-0.5 h-full bg-slate-600 absolute left-1/2 -translate-x-1/2"></div>
                            <div className="w-4 h-4 rounded-full bg-cyan-400 ring-4 ring-slate-800 z-10"></div>
                        </div>
                         <p className="text-xs text-slate-500">Each story becomes a new entry in your personal timestream.</p>
                     </div>
                </div>
                <div className={`transition-opacity duration-700 ${showcaseStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                     <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center justify-center gap-2"><Wand2/> Curation</h3>
                     <div className="bg-slate-800/50 p-4 rounded-lg">
                        <img src={selectedFiles[0]?.preview} alt="" className="w-full h-24 object-cover rounded-md opacity-75"/>
                        <p className="text-xs text-slate-500 mt-2">Enhance photos, rewrite stories, and perfect every detail.</p>
                     </div>
                </div>
            </div>
             <div className={`mt-12 transition-all duration-700 ${showcaseStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h2 className="text-3xl font-bold font-brand text-white">Save your first memory and continue your journey.</h2>
                <button onClick={handleSignUp} className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105">
                    Sign Up to Save Your Story <ArrowRight className="inline w-5 h-5 ml-2"/>
                </button>
             </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/95 z-[100] p-4 py-12 overflow-y-auto" onClick={onClose}>
            <button onClick={onClose} className="fixed top-6 right-6 text-slate-500 hover:text-white transition-colors z-[110]">
                <X size={24} />
            </button>
            <div className="min-h-full w-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                {step === 'upload' && renderUpload()}
                {step === 'processing' && renderProcessing()}
                {step === 'review' && renderReview()}
                {step === 'playing' && renderPlaying()}
                {step === 'showcase' && renderShowcase()}
            </div>
        </div>
    );
};

export default ProductDemo;