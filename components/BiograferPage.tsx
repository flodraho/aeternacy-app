
import React, { useState } from 'react';
import { Page } from '../types';
import { ArrowLeft, Book, Mic, Video, Coffee, Feather, Play, CheckCircle, Lock, Sparkles, Headphones, Star } from 'lucide-react';
import { TOKEN_COSTS } from '../services/costCatalog';

interface BiograferPageProps {
  onBack: () => void;
  triggerConfirmation: (cost: number, featureKey: string, onConfirm: () => Promise<any>, message?: string) => void;
}

const tokenExplanation = `Biografær sessions use advanced conversational AI to interview you, transcribe your speech, and organize your memories into a coherent narrative structure in real-time.`;

interface Session {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    duration: string;
    icon: React.ElementType;
    status: 'completed' | 'current' | 'locked';
}

const lifeChapters: Session[] = [
    { 
        id: 'roots', 
        title: 'Roots & Origins', 
        subtitle: 'Chapter I',
        description: 'Where do you come from? Let’s talk about your grandparents, family lore, and the home you were born into.', 
        duration: '15 min',
        icon: Feather, 
        status: 'completed' 
    },
    { 
        id: 'childhood', 
        title: 'Early Years', 
        subtitle: 'Chapter II',
        description: 'The smell of your childhood kitchen, your favorite toy, the street you grew up on. The foundations of you.', 
        duration: '15 min',
        icon: Sparkles, 
        status: 'current' 
    },
    { 
        id: 'youth', 
        title: 'Coming of Age', 
        subtitle: 'Chapter III',
        description: 'First loves, first heartbreaks, teenage rebellion, and the moment you felt you became an adult.', 
        duration: '20 min',
        icon: Play, 
        status: 'locked' 
    },
    { 
        id: 'career', 
        title: 'Building a Life', 
        subtitle: 'Chapter IV',
        description: 'Ambitions, career paths, building a family, and the turning points that defined your journey.', 
        duration: '20 min',
        icon: Coffee, 
        status: 'locked' 
    },
    { 
        id: 'wisdom', 
        title: 'Wisdom & Legacy', 
        subtitle: 'Chapter V',
        description: 'Reflections on what matters most, lessons learned, and the message you want to leave behind.', 
        duration: '15 min',
        icon: Book, 
        status: 'locked' 
    }
];

const BiograferPage: React.FC<BiograferPageProps> = ({ onBack, triggerConfirmation }) => {

  // Calculate progress
  const completedCount = lifeChapters.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedCount / lifeChapters.length) * 100;
  
  const handleBeginSession = (chapter: Session) => {
    if (chapter.status === 'locked') return;
    
    triggerConfirmation(TOKEN_COSTS.BIOGRAFER_SESSION, 'BIOGRAFER_SESSION', async () => {
      // Simulation of starting the interview interface
      await new Promise(resolve => setTimeout(resolve, 800));
      alert(`Starting Session: ${chapter.title}. æterny is ready to listen.`);
    }, `Start the "${chapter.title}" interview session?`);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 animate-fade-in-up">
      {/* Navigation Header */}
      <div className="container mx-auto px-6 pt-28 pb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            <span>Back to Lægacy Space</span>
        </button>

        {/* Emotional Hero */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 ring-1 ring-white/10 mb-16">
            <div className="absolute inset-0">
                <img src="https://images.pexels.com/photos/3772612/pexels-photo-3772612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Old microphone and letters" className="w-full h-full object-cover opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
            </div>
            <div className="relative z-10 p-8 md:p-16 max-w-3xl">
                <div className="flex gap-3 mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/30 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
                        <Mic className="w-3 h-3" /> The Biografær
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest">
                         <Star className="w-3 h-3 text-amber-400" fill="currentColor" /> Premier Feature
                    </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white font-brand mb-6 leading-tight">
                    Your voice is the greatest inheritance.
                </h1>
                <p className="text-lg text-slate-300 leading-relaxed mb-8">
                    You don't need to write a book. Just talk. æterny guides you through your life story in short, conversational sessions—capturing not just the facts, but the feeling, the laughter, and the wisdom.
                </p>
                
                {/* Overall Progress */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 inline-block w-full max-w-md">
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        <span>Biography Progress</span>
                        <span>{Math.round(progressPercentage)}% Complete</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* The Guided Journey */}
        <div className="max-w-5xl mx-auto mb-24">
            <h2 className="text-2xl font-bold text-white font-brand mb-8 text-center">Your Journey Chapters</h2>
            <div className="space-y-6">
                {lifeChapters.map((chapter, index) => {
                    const Icon = chapter.icon;
                    const isLocked = chapter.status === 'locked';
                    const isCompleted = chapter.status === 'completed';
                    const isCurrent = chapter.status === 'current';

                    return (
                        <div 
                            key={chapter.id}
                            onClick={() => handleBeginSession(chapter)}
                            className={`relative group rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 transition-all duration-300 border 
                                ${isCurrent 
                                    ? 'bg-gradient-to-r from-slate-800 to-slate-800/50 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)] scale-[1.02] cursor-pointer' 
                                    : isCompleted 
                                        ? 'bg-slate-900/50 border-white/5 opacity-75 hover:opacity-100 cursor-default'
                                        : 'bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed'
                                }`
                            }
                        >
                            {/* Connector Line */}
                            {index !== lifeChapters.length - 1 && (
                                <div className="absolute left-8 md:left-[3.25rem] top-20 bottom-[-24px] w-0.5 bg-white/5 -z-10 hidden md:block"></div>
                            )}

                            {/* Icon / Status Indicator */}
                            <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ring-4 ring-slate-950 relative z-10 
                                ${isCompleted ? 'bg-green-500 text-slate-900' : isCurrent ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                                {isCompleted ? <CheckCircle className="w-7 h-7" /> : isLocked ? <Lock className="w-6 h-6" /> : <Icon className="w-7 h-7" />}
                            </div>

                            {/* Content */}
                            <div className="flex-grow text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-amber-400' : 'text-slate-500'}`}>{chapter.subtitle}</span>
                                    {isCompleted && <span className="inline-block px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase">Completed</span>}
                                </div>
                                <h3 className={`text-xl font-bold font-brand mb-2 ${isLocked ? 'text-slate-500' : 'text-white'}`}>{chapter.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{chapter.description}</p>
                            </div>

                            {/* Action Button */}
                            <div className="flex-shrink-0">
                                {isCurrent ? (
                                    <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-6 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-amber-900/20">
                                        <Mic className="w-4 h-4" />
                                        <span>Begin Session</span>
                                        <span className="text-xs opacity-70 font-normal ml-1">({chapter.duration})</span>
                                    </button>
                                ) : isCompleted ? (
                                    <button className="text-slate-400 hover:text-white font-semibold text-sm flex items-center gap-2">
                                        Review <Play className="w-3 h-3" />
                                    </button>
                                ) : (
                                    <span className="text-slate-600 text-sm font-medium flex items-center gap-2"><Lock className="w-3 h-3"/> Locked</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* The "Why" - Artifact Teasers */}
        <div className="border-t border-white/10 bg-slate-900/50 py-20">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white font-brand mb-4">Turn Your Story Into Art</h2>
                    <p className="text-slate-400">Your biography sessions aren't just recordings. æterny transforms them into tangible legacies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Book */}
                    <div className="bg-slate-800 p-8 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all group text-center">
                        <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500/10 transition-colors">
                            <Book className="w-8 h-8 text-slate-300 group-hover:text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white font-brand mb-2">The Memoir</h3>
                        <p className="text-sm text-slate-400 mb-6">A beautifully bound hardcover book, written in your voice, illustrated with your photos.</p>
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Print on Demand</span>
                    </div>

                    {/* Audio */}
                    <div className="bg-slate-800 p-8 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group text-center">
                        <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 transition-colors">
                            <Headphones className="w-8 h-8 text-slate-300 group-hover:text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white font-brand mb-2">The Audio Series</h3>
                        <p className="text-sm text-slate-400 mb-6">An edited, podcast-style audio series of your life, enhanced with music and soundscapes.</p>
                        <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider">Coming Soon</span>
                    </div>

                    {/* Video */}
                    <div className="bg-slate-800 p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all group text-center">
                        <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-500/10 transition-colors">
                            <Video className="w-8 h-8 text-slate-300 group-hover:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white font-brand mb-2">The Documentary</h3>
                        <p className="text-sm text-slate-400 mb-6">A cinematic video combining your interview audio with your photo archive and AI visuals.</p>
                        <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Coming Soon</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BiograferPage;
