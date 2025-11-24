

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Moment, AeternyVoice, Page } from '../types';
import { Sparkles, Loader2, X, ArrowRight, CheckCircle } from 'lucide-react';
import { createDemoStoryFromImages, textToSpeech, imageUrlToPayload } from '../services/geminiService';
import { decodeAudioData } from '../utils/audio';
import Slideshow from './Slideshow';

interface GeneratedData {
    title: string;
    story: string;
    tags: {
        location: string[];
        people: string[];
        activities: string[];
    };
}

interface AhaMomentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: Page) => void;
    moments: Moment[];
    aeternyVoice: AeternyVoice;
}

const processingSteps = [
    { id: 'analyze', text: 'Analyzing your photos & finding themes' },
    { id: 'story', text: 'Writing your personal story' },
    { id: 'narration', text: 'Voicing your narrated slideshow' }
];

type DemoStep = 'prompt' | 'generating' | 'playing' | 'upsell';

const AhaMomentModal: React.FC<AhaMomentModalProps> = ({ isOpen, onClose, onNavigate, moments, aeternyVoice }) => {
    const [demoStep, setDemoStep] = useState<DemoStep>('prompt');
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [generatedData, setGeneratedData] = useState<(GeneratedData & { images: string[] }) | null>(null);
    const [narration, setNarration] = useState<{ buffer: AudioBuffer; context: AudioContext } | null>(null);

    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const slideTimerRef = useRef<number | null>(null);
    const progressFrameRef = useRef<number | null>(null);

    const sentences = useMemo(() => {
        const text = generatedData?.story;
        if (!text || !narration) return [];
        const matches = text.match(/[^.!?]+[.!?\s]*|\s*$/g)?.filter(s => s.trim()) || [text];
        let runningTime = 0;
        const totalDuration = narration.buffer.duration;
        const totalWords = text.trim().split(/\s+/).length;
        if (totalWords === 0) return [];

        return matches.map(sentence => {
            const wordCount = sentence.trim().split(/\s+/).length;
            const duration = (wordCount / totalWords) * totalDuration;
            const startTime = runningTime;
            runningTime += duration;
            return { text: sentence.trim(), startTime, endTime: runningTime };
        });
    }, [generatedData?.story, narration]);

    const cleanup = useCallback(() => {
        if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
        if (progressFrameRef.current) cancelAnimationFrame(progressFrameRef.current);
        if (audioSourceRef.current) {
            audioSourceRef.current.onended = null;
            audioSourceRef.current.stop();
        }
        if (narration?.context?.state !== 'closed') {
            narration?.context?.close().catch(console.error);
        }
        audioSourceRef.current = null;
        setCurrentSentenceIndex(-1);
    }, [narration]);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const handleGenerate = async () => {
        setDemoStep('generating');
        const momentsToUse = moments.filter(m => m.image || (m.images && m.images.length > 0)).slice(0, 5);
        const images = momentsToUse.flatMap(m => m.images || (m.image ? [m.image] : [])).filter(Boolean) as string[];

        try {
            const payloads = await Promise.all(images.map(url => imageUrlToPayload(url)));
            const storyData = await createDemoStoryFromImages(payloads);
            setCompletedSteps(['analyze', 'story']);

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await textToSpeech(storyData.story, audioContext, aeternyVoice);
            
            setGeneratedData({ ...storyData, images });
            setNarration({ buffer: audioBuffer, context: audioContext });
            setCompletedSteps(['analyze', 'story', 'narration']);
            
            await new Promise(r => setTimeout(r, 500));
            setDemoStep('playing');

        } catch (error) {
            console.error("Aha Moment generation failed:", error);
            onClose(); // Close on error
        }
    };

    useEffect(() => {
        if (demoStep !== 'playing' || !narration || !generatedData) return;

        const audioContext = narration.context;
        const audioBuffer = narration.buffer;

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        audioSourceRef.current = source;

        const totalDuration = audioBuffer.duration;
        const slideDuration = totalDuration / generatedData.images.length;

        const advance = (index: number) => {
            if (index < generatedData.images.length) {
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
            cleanup();
            setTimeout(() => setDemoStep('upsell'), 1000);
        };
    }, [demoStep, generatedData, narration, sentences, cleanup]);


    const renderContent = () => {
        switch (demoStep) {
            case 'prompt':
                return (
                    <div className="text-center animate-fade-in-up">
                        <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-white font-brand">Your story is waiting.</h1>
                        <p className="text-slate-300 mt-2 mb-6">Your memories are stored safely. Want to see what æternacy's AI can really do with them?</p>
                        <button onClick={handleGenerate} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105">
                            Generate Sample Story
                        </button>
                        <p className="text-xs text-slate-500 mt-2">(One-time free demo)</p>
                    </div>
                );
            case 'generating':
                const currentStepIndex = completedSteps.length;
                return (
                    <div className="text-center animate-fade-in w-full max-w-md">
                        <h1 className="text-3xl font-bold font-brand mb-6">æterny is curating...</h1>
                        <div className="space-y-3 text-left">
                            {processingSteps.map((step, index) => (
                                <div key={step.id} className={`flex items-center gap-3 transition-opacity duration-500 ${!completedSteps.includes(step.id) && index > currentStepIndex ? 'opacity-40' : 'opacity-100'}`}>
                                    {completedSteps.includes(step.id) ? (
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    ) : index === currentStepIndex ? (
                                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin flex-shrink-0" />
                                    ) : (
                                        <div className="w-5 h-5 flex-shrink-0 border-2 border-slate-600 rounded-full" />
                                    )}
                                    <span className={`${index === currentStepIndex ? 'text-white font-semibold' : 'text-slate-400'}`}>{step.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'playing':
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
                            {generatedData && <Slideshow images={generatedData.images} isPlaying={true} />}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-8 left-8 right-8 text-center text-white text-xl font-semibold" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.8)' }}>
                                {currentSentenceIndex > -1 && <p className="animate-fade-in">{sentences[currentSentenceIndex]?.text}</p>}
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white font-brand mt-4">{generatedData?.title}</p>
                    </div>
                );
            case 'upsell':
                return (
                    <div className="text-center animate-fade-in-up">
                        <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-white font-brand">This is just the beginning.</h1>
                        <p className="text-slate-300 mt-2">Narrated stories like this are an exclusive feature of our premium plans.</p>
                        <p className="text-cyan-300 font-semibold text-lg mt-4">Fæmily members get a monthly allocation of Tokæn for features like this.</p>
                        <button onClick={() => { onNavigate(Page.Subscription); onClose(); }} className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105">
                            Upgrade to Create More Stories <ArrowRight className="inline w-5 h-5 ml-2"/>
                        </button>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/95 z-[100] p-4 flex" onClick={onClose}>
            <button onClick={onClose} className="fixed top-6 right-6 text-slate-500 hover:text-white transition-colors z-[110]">
                <X size={24} />
            </button>
            <div className="m-auto w-full" onClick={e => e.stopPropagation()}>
                {renderContent()}
            </div>
        </div>
    );
};

export default AhaMomentModal;