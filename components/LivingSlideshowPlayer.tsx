import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Moment, AeternyVoice, AeternyStyle } from '../types';
import { textToSpeech } from '../services/geminiService';
import { X, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Loader2, Captions, CaptionsOff } from 'lucide-react';

const kenBurnsAnimations = [
    'animate-ken-burns-1',
    'animate-ken-burns-2',
    'animate-ken-burns-3',
    'animate-ken-burns-4',
];

interface LivingSlideshowPlayerProps {
    moment: Moment;
    aeternyVoice: AeternyVoice;
    aeternyStyle: AeternyStyle;
    onClose: () => void;
}

const LivingSlideshowPlayer: React.FC<LivingSlideshowPlayerProps> = ({ moment, aeternyVoice, aeternyStyle, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isNarrationOn, setIsNarrationOn] = useState(false);
    const [isSubtitlesOn, setIsSubtitlesOn] = useState(true);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);
    
    const [narrationState, setNarrationState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
    const [narrationProgress, setNarrationProgress] = useState(0);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const slideTimerRef = useRef<number | null>(null);
    const progressFrameRef = useRef<number | null>(null);

    const slides = useMemo(() => {
        const images = [moment.image, ...(moment.images || [])].filter(Boolean) as string[];
        if (moment.video) {
            return [moment.video, ...images];
        }
        return images;
    }, [moment]);

    const sentences = useMemo(() => {
        const text = moment.description;
        if (!text) return [];
        const matches = text.match(/[^.!?]+[.!?\s]*|\s*$/g)?.filter(s => s.trim()) || [text];
        let runningTime = 0;
        const wordsPerSecond = 2.5; // Average reading speed
        return matches.map(sentence => {
            const wordCount = sentence.trim().split(/\s+/).length;
            const duration = (wordCount / wordsPerSecond) || 0.1; // Ensure duration is not zero
            const startTime = runningTime;
            runningTime += duration;
            return { text: sentence.trim(), startTime, endTime: runningTime };
        });
    }, [moment.description]);

    const cleanup = useCallback(() => {
        if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
        if (progressFrameRef.current) cancelAnimationFrame(progressFrameRef.current);
        if (audioSourceRef.current) {
            audioSourceRef.current.onended = null;
            audioSourceRef.current.stop();
        }
        if (audioContextRef.current?.state === 'running') audioContextRef.current?.close();
        audioSourceRef.current = null;
        audioContextRef.current = null;
        setNarrationState('idle');
        setNarrationProgress(0);
        setCurrentSentenceIndex(-1);
    }, []);
    
    const advanceSlide = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    // Manual navigation handlers
    const handlePrev = () => {
        setIsPlaying(false);
        setIsManuallyPaused(true);
        cleanup();
        setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setIsPlaying(false);
        setIsManuallyPaused(true);
        cleanup();
        setCurrentIndex(prev => (prev + 1) % slides.length);
    };

    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
        if (isManuallyPaused) {
            setIsManuallyPaused(false);
        }
    };

    // Effect for non-narrated playback
    useEffect(() => {
        if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
        const currentSlide = slides[currentIndex];
        const isVideo = currentSlide?.startsWith('blob:') || currentSlide?.endsWith('.mp4');

        if (isPlaying && !isNarrationOn && !isManuallyPaused) {
            if (isVideo) {
                const video = videoRef.current;
                if (video) {
                    video.onended = advanceSlide;
                    video.play().catch(console.error);
                }
            } else {
                slideTimerRef.current = window.setTimeout(advanceSlide, 6000);
            }
        } else if (!isPlaying && !isNarrationOn) {
            if (isVideo) videoRef.current?.pause();
        }

    }, [currentIndex, isPlaying, isNarrationOn, slides, advanceSlide, isManuallyPaused]);

    // Effect for narrated playback
    useEffect(() => {
        const playNarration = async () => {
            cleanup();
            if (!isPlaying || !isNarrationOn || !moment.description || isManuallyPaused) return;

            setNarrationState('loading');
            try {
                const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                audioContextRef.current = newAudioContext;
                
                const buffer = audioBufferRef.current || await textToSpeech(moment.description, newAudioContext, aeternyVoice, aeternyStyle);
                if (!buffer || newAudioContext.state === 'closed') throw new Error("Audio generation failed or context closed.");
                audioBufferRef.current = buffer;
                
                const source = newAudioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(newAudioContext.destination);
                source.start(0, 0);
                audioSourceRef.current = source;
                setNarrationState('playing');
                
                let slideDuration = buffer.duration / slides.length;
                if (slides[0]?.startsWith('blob:') || slides[0]?.endsWith('.mp4')) {
                    // Give video more time
                    slideDuration = (buffer.duration - (videoRef.current?.duration || 10)) / (slides.length - 1);
                }
                
                const scheduleSlideChange = (index: number) => {
                    if (index < slides.length) {
                        const isVideo = slides[index-1]?.startsWith('blob:') || slides[index-1]?.endsWith('.mp4');
                        const duration = isVideo ? (videoRef.current?.duration || 10) : slideDuration;
                        slideTimerRef.current = window.setTimeout(() => {
                            setCurrentIndex(index);
                            scheduleSlideChange(index + 1);
                        }, duration * 1000);
                    }
                };
                setCurrentIndex(0);
                scheduleSlideChange(1);
                
                source.onended = () => {
                    cleanup();
                    setIsPlaying(false);
                };

                const startTime = newAudioContext.currentTime;
                const animateProgress = () => {
                    if (newAudioContext.state === 'running' && audioSourceRef.current) {
                        const elapsedTime = newAudioContext.currentTime - startTime;
                        setNarrationProgress(elapsedTime / buffer.duration);
                        
                        const currentSentence = sentences.findIndex(s => elapsedTime >= s.startTime && elapsedTime < s.endTime);
                        setCurrentSentenceIndex(currentSentence);

                        progressFrameRef.current = requestAnimationFrame(animateProgress);
                    } else {
                        setNarrationProgress(1);
                        setCurrentSentenceIndex(-1);
                    }
                };
                animateProgress();

            } catch (error) {
                console.error("Narration error:", error);
                setNarrationState('error');
            }
        };

        playNarration();

    }, [isPlaying, isNarrationOn, aeternyVoice, aeternyStyle, moment.description, slides, sentences, cleanup, isManuallyPaused]);


    return (
        <div className="fixed inset-0 bg-black z-[100] living-slideshow-player">
            {slides.map((slide, index) => {
                const isVideo = slide.startsWith('blob:') || slide.endsWith('.mp4');
                const isActive = index === currentIndex;
                const animationClass = kenBurnsAnimations[index % kenBurnsAnimations.length];

                if (isVideo) {
                    return (
                        <div key={index} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                            <video ref={index === 0 ? videoRef : null} src={slide} muted playsInline className="w-full h-full object-cover" onLoadedData={(e) => { if (isActive && isPlaying) (e.target as HTMLVideoElement).play(); }}/>
                            <span className="video-watermark">æ</span>
                        </div>
                    );
                }
                return (
                    <img 
                        key={index} 
                        src={slide}
                        alt={`Slide ${index}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isActive ? `opacity-100 ${isPlaying && !isManuallyPaused ? animationClass : ''}` : 'opacity-0'}`}
                        style={{ animationDuration: '20s' }}
                    />
                );
            })}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/70"></div>
            
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20 controls-overlay opacity-0">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-brand">{moment.title}</h2>
                    <p className="text-slate-300">{moment.date}</p>
                </div>
                <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 text-center subtitle-text-container pointer-events-none flex items-center justify-center min-h-[6rem]">
                {isSubtitlesOn && isNarrationOn && narrationState === 'playing' && currentSentenceIndex > -1 && sentences[currentSentenceIndex] && (
                    <p key={currentSentenceIndex} className="text-xl md:text-2xl font-semibold leading-relaxed animate-fade-in">
                        {sentences[currentSentenceIndex].text}
                    </p>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent controls-overlay opacity-0">
                <div className="w-full h-1 bg-white/20 rounded-full mb-4">
                    <div className="h-full bg-white rounded-full" style={{ width: `${narrationProgress * 100}%`, transition: isPlaying && isNarrationOn ? 'width 0.2s linear' : 'none' }}></div>
                </div>
                <div className="flex items-center justify-between">
                     <button onClick={() => setIsNarrationOn(p => !p)} className="text-slate-300 hover:text-white transition-colors" title="Toggle Narration">
                        {narrationState === 'loading' ? <Loader2 className="w-6 h-6 animate-spin" /> : isNarrationOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </button>
                    <div className="flex items-center justify-center gap-6">
                        <button onClick={handlePrev} className="text-slate-300 hover:text-white transition-colors" title="Previous Slide">
                            <SkipBack className="w-7 h-7" />
                        </button>
                        <button onClick={handlePlayPause} className="w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white" title={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                        </button>
                        <button onClick={handleNext} className="text-slate-300 hover:text-white transition-colors" title="Next Slide">
                            <SkipForward className="w-7 h-7" />
                        </button>
                    </div>
                    <button onClick={() => setIsSubtitlesOn(p => !p)} className="text-slate-300 hover:text-white transition-colors" title="Toggle Subtitles">
                        {isSubtitlesOn ? <Captions className="w-6 h-6" /> : <CaptionsOff className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LivingSlideshowPlayer;