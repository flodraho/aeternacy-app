
import React, { useState, useEffect, useRef } from 'react';
import { Page, Moment } from '../types';
import { X, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import AeternyAvatarDisplay from './AeternyAvatarDisplay';

interface SmartGuideProps {
    currentPage: Page;
    moments: Moment[];
    onNavigate: (page: Page) => void;
    aeternyAvatar: string | null;
    userName: string;
}

const SmartGuide: React.FC<SmartGuideProps> = ({ currentPage, moments, onNavigate, aeternyAvatar, userName }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentHint, setCurrentHint] = useState<{ id: string, text: string, actionLabel?: string, action?: () => void } | null>(null);
    const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());
    const idleTimerRef = useRef<number | null>(null);

    // Empathic Copywriting Library
    const hints = {
        emptyHome: {
            id: 'home-empty',
            text: `Welcome, ${userName}. Your timestream is a blank canvas waiting for your story. Shall we paint the first stroke together?`,
            actionLabel: "Create First Momænt",
            action: () => onNavigate(Page.Create)
        },
        createIdle: {
            id: 'create-idle',
            text: "Writer's block? You don't need a masterpiece. Just drop a single photo, and I'll find the words for you.",
            actionLabel: null,
            action: undefined
        },
        momentsExplore: {
            id: 'moments-explore',
            text: "You're building a beautiful collection. Did you know we can weave these into a 'Journæy' to tell a bigger story?",
            actionLabel: "Try Smart Create",
            action: () => onNavigate(Page.SmartCollection)
        },
        legacyIntimidated: {
            id: 'legacy-idle',
            text: "Thinking about the future is an act of love. You don't have to finish this today. Just adding one Steward is a beautiful start.",
            actionLabel: "Add a Steward",
            action: () => onNavigate(Page.LegacyTrust)
        },
        curateSuggestion: {
            id: 'curate-suggest',
            text: "I see you're revisiting this moment. It feels special. Would you like me to turn it into a cinematic video reflection?",
            actionLabel: "Open Video Studio",
            action: () => onNavigate(Page.AIVideo)
        }
    };

    const showHint = (hintKey: keyof typeof hints) => {
        const hint = hints[hintKey];
        if (!dismissedHints.has(hint.id)) {
            setCurrentHint(hint);
            setIsVisible(true);
        }
    };

    // Context Monitoring Logic
    useEffect(() => {
        // Reset visibility on page change
        setIsVisible(false);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        // Scenario 1: Home Page & Empty State
        if (currentPage === Page.Home && moments.length <= 1) {
            idleTimerRef.current = window.setTimeout(() => {
                showHint('emptyHome');
            }, 2000);
        }

        // Scenario 2: Create Page & Idle (Writer's Block)
        if (currentPage === Page.Create) {
            idleTimerRef.current = window.setTimeout(() => {
                showHint('createIdle');
            }, 8000); // Wait 8s to see if they do anything
        }

        // Scenario 3: Moments Page (Discovery)
        if (currentPage === Page.Moments && moments.length > 5) {
             idleTimerRef.current = window.setTimeout(() => {
                showHint('momentsExplore');
            }, 5000);
        }

        // Scenario 4: Legacy Space (Reassurance)
        if (currentPage === Page.LegacySpace) {
             idleTimerRef.current = window.setTimeout(() => {
                showHint('legacyIntimidated');
            }, 4000);
        }
        
        // Scenario 5: Detail Page
        if (currentPage === Page.MomentDetail) {
             idleTimerRef.current = window.setTimeout(() => {
                showHint('curateSuggestion');
            }, 6000);
        }

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [currentPage, moments.length, dismissedHints]); // Re-run when page or data changes

    const handleDismiss = () => {
        setIsVisible(false);
        if (currentHint) {
            setDismissedHints(prev => new Set(prev).add(currentHint.id));
        }
    };

    if (!isVisible || !currentHint) return null;

    return (
        <div className="fixed bottom-24 right-6 z-50 max-w-xs md:max-w-sm animate-fade-in-up">
            <div className="relative">
                {/* The Speech Bubble Tail - Positioned bottom-right pointing to FAB */}
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-800 rotate-45 transform border-r border-b border-white/20 z-10"></div>
                
                {/* The Bubble Container */}
                <div className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl flex gap-4 items-start relative overflow-hidden group">
                    
                    {/* Subtle aesthetic glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                    {/* Icon Indicator */}
                    <div className="flex-shrink-0 pt-1">
                         <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-cyan-400 fill-current animate-pulse" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow relative z-10">
                        <p className="text-sm text-slate-200 leading-relaxed font-medium">
                            "{currentHint.text}"
                        </p>
                        
                        {currentHint.action && (
                            <button 
                                onClick={() => {
                                    handleDismiss();
                                    currentHint.action?.();
                                }}
                                className="mt-3 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors uppercase tracking-wide"
                            >
                                {currentHint.actionLabel} <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Close Button */}
                    <button 
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartGuide;
