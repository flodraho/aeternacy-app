import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Moment, AeternyVoice } from '../types';
import Slideshow from './Slideshow';
import { textToSpeech } from '../services/geminiService';
import { Play, Pause, SkipBack, SkipForward, X, Volume2, VolumeX } from 'lucide-react';

interface TheaterPageProps {
  moments: Moment[];
  aeternyVoice: AeternyVoice;
  onExit: () => void;
  startingMomentId?: number | null;
}

const TheaterPage: React.FC<TheaterPageProps> = ({ moments, aeternyVoice, onExit, startingMomentId }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  
  const slideDurationWithoutNarration = 10000; // 10 seconds

  const playableMoments = useMemo(() => {
    return moments.filter(m => m.type === 'standard' || m.type === 'focus').sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [moments]);
  
  const initialIndex = useMemo(() => {
    if (startingMomentId != null) {
      const index = playableMoments.findIndex(m => m.id === startingMomentId);
      return index > -1 ? index : 0;
    }
    return 0;
  }, [startingMomentId, playableMoments]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  const currentMoment = playableMoments[currentIndex];
  
  const cleanupAudio = useCallback(() => {
    if (audioSourceRef.current) {
        audioSourceRef.current.onended = null;
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
    }
    audioContextRef.current = null;
    setIsNarrating(false);
  }, []);
  
  const advanceToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % playableMoments.length);
  }, [playableMoments.length]);

  // Effect for narration and narrated advancement
  useEffect(() => {
    if (!isPlaying || !isNarrationEnabled || !currentMoment) {
      return; // Do nothing if not playing with narration
    }

    cleanupAudio();
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);

    setIsNarrating(true);
    const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = newAudioContext;

    textToSpeech(currentMoment.description, newAudioContext, aeternyVoice)
      .then(audioBuffer => {
        if (!audioBuffer || !audioContextRef.current || audioContextRef.current.state === 'closed') {
          setIsNarrating(false);
          autoAdvanceTimerRef.current = window.setTimeout(advanceToNext, slideDurationWithoutNarration);
          return;
        }
        
        const source = newAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(newAudioContext.destination);
        source.start();
        audioSourceRef.current = source;
        source.onended = () => {
          if (audioSourceRef.current === source) {
            setIsNarrating(false);
            audioSourceRef.current = null;
            autoAdvanceTimerRef.current = window.setTimeout(advanceToNext, 3000); // 3s pause after narration
          }
        };
      })
      .catch(err => {
        console.error("Narration failed:", err);
        setIsNarrating(false);
        autoAdvanceTimerRef.current = window.setTimeout(advanceToNext, slideDurationWithoutNarration);
      });

    return () => {
      cleanupAudio();
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    }
  }, [currentIndex, isPlaying, isNarrationEnabled, currentMoment, aeternyVoice, advanceToNext, cleanupAudio]);

  // Effect for non-narrated slideshow advancement
  useEffect(() => {
    if (!isPlaying || isNarrationEnabled || !currentMoment) {
      return; // Do nothing if narration is on, or paused
    }

    const timer = setTimeout(advanceToNext, slideDurationWithoutNarration);

    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, isNarrationEnabled, currentMoment, advanceToNext]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === ' ') {
            e.preventDefault();
            setIsPlaying(prev => !prev);
        }
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % playableMoments.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? playableMoments.length - 1 : prev - 1));
  };
  
  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };
  
  if (!currentMoment) {
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
            <p>No playable moments in your timestream.</p>
            <button onClick={onExit} className="mt-4 bg-white/20 px-4 py-2 rounded-lg">Exit</button>
        </div>
    );
  }

  const allImages = [currentMoment.image, ...(currentMoment.images || [])].filter((img): img is string => !!img);

  return (
    <div className="fixed inset-0 bg-black text-white theater-container">
      <Slideshow images={allImages} isPlaying={isPlaying} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/70"></div>
      
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <h2 className="text-xl font-brand">Timestream Review</h2>
        <button onClick={onExit} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-8 z-10 pointer-events-none">
        <div className="text-center theater-moment-info">
            <h1 className="text-4xl md:text-6xl font-bold font-brand">{currentMoment.title}</h1>
            <p className="text-lg md:text-xl text-slate-300 mt-2">{currentMoment.date}</p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 theater-controls auto-hide">
        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full mb-4 theater-progress-bar-bg">
          <div 
            className="h-full rounded-full theater-progress-bar-fg" 
            style={{ width: `${((currentIndex + 1) / playableMoments.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
            <button onClick={() => setIsNarrationEnabled(p => !p)} className="text-slate-300 hover:text-white transition-colors p-2" title={isNarrationEnabled ? 'Disable narration' : 'Enable narration'}>
              {isNarrationEnabled ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7" />}
            </button>
            <div className="flex items-center justify-center gap-8">
                <button onClick={handlePrev} className="text-slate-300 hover:text-white transition-colors">
                    <SkipBack className="w-7 h-7" />
                </button>
                <button onClick={handlePlayPause} className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                    {isPlaying ? <Pause className="w-8 h-8"/> : <Play className="w-8 h-8"/>}
                </button>
                <button onClick={handleNext} className="text-slate-300 hover:text-white transition-colors">
                    <SkipForward className="w-7 h-7" />
                </button>
            </div>
             <div className="w-11"></div> {/* Spacer to balance UI */}
        </div>
      </div>
    </div>
  );
};

export default TheaterPage;