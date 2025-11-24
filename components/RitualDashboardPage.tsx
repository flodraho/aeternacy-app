import React, { useState } from 'react';
import { Page, ActiveRitual, Moment } from '../types';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, Users, Plus, Wand2, Loader2, X } from 'lucide-react';
import GridView from './GridView';
import { TOKEN_COSTS } from '../services/costCatalog';
import { weaveRitualStory } from '../services/geminiService';

interface RitualDashboardPageProps {
    ritual: ActiveRitual;
    moments: Moment[];
    onNavigate: (page: Page) => void;
    onAddContribution: (ritualId: string) => void;
    triggerConfirmation: (cost: number, featureKey: string, onConfirm: () => Promise<any>) => void;
    showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const RitualDashboardPage: React.FC<RitualDashboardPageProps> = ({ ritual, moments, onNavigate, onAddContribution, triggerConfirmation, showToast }) => {
    
    const [isWeaving, setIsWeaving] = useState(false);
    const [wovenStory, setWovenStory] = useState<string | null>(null);

    const Icon = (LucideIcons as any)[ritual.iconName] || LucideIcons.CalendarClock;

    const contributions = moments.filter(m => m.ritualId === ritual.id);

    const executeWeave = async () => {
        setIsWeaving(true);
        try {
            const story = await weaveRitualStory(contributions);
            setWovenStory(story);
        } catch (error) {
            console.error("Failed to weave story:", error);
            showToast("Sorry, æterny couldn't weave the story. Please try again.", "error");
            throw error; // Propagate error for token logic
        } finally {
            setIsWeaving(false);
        }
    };

    const handleWeaveStory = () => {
        if (contributions.length === 0) {
            showToast("There are no contributions to weave a story from yet.", "info");
            return;
        }
        triggerConfirmation(TOKEN_COSTS.RITUAL_STORY_WEAVING, 'RITUAL_STORY_WEAVING', executeWeave);
    };


    return (
        <>
            <div className="container mx-auto px-6 pt-28 pb-12 animate-fade-in-up">
                <button onClick={() => onNavigate(Page.FamilyRituals)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to All Rituals
                </button>

                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-xl flex items-center justify-center ring-1 ring-indigo-500/20">
                            <Icon className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">{ritual.title}</h1>
                            <p className="text-slate-400 mt-2">{ritual.description}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                        <div className="flex items-center -space-x-2">
                            {ritual.participants.map(p => (
                                <div key={p.id} title={p.name} className="w-10 h-10 rounded-full bg-slate-600 ring-2 ring-slate-800 flex items-center justify-center text-sm font-bold">
                                    {p.avatar}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500">{ritual.participants.length} participants</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900/50 via-slate-800/50 to-slate-800/50 p-8 rounded-3xl ring-2 ring-indigo-500/30 mb-12 text-center">
                    <Wand2 className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold font-brand text-white">The Magic of Memory</h3>
                    <p className="text-slate-300 mt-2 max-w-xl mx-auto">Ready to see this cycle's story? Let æterny weave all contributions into a single, heartfelt narrative that captures the essence of your shared moments.</p>
                    <button onClick={handleWeaveStory} disabled={isWeaving || contributions.length === 0} className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full transition-colors flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed mx-auto transform hover:scale-105">
                        {isWeaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Weaving Your Story...</> : <>Weave Our Story</>}
                    </button>
                </div>

                <div className="mb-8 flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-brand text-white">Contributions</h2>
                    <button onClick={() => onAddContribution(ritual.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4"/> Add Your Contribution
                    </button>
                </div>
                
                {contributions.length > 0 ? (
                    <GridView 
                        moments={contributions}
                        onPinToggle={() => {}} 
                        onSelectMoment={() => {}} 
                        onShare={() => {}} 
                        onNavigate={onNavigate} 
                    />
                ) : (
                    <div className="text-center py-20 px-6 bg-slate-800/30 rounded-lg text-slate-500">
                        <p className="font-semibold text-lg text-slate-400 mb-2">No contributions yet for this cycle.</p>
                        <p>Be the first to add a moment to this ritual!</p>
                    </div>
                )}
            </div>
            {wovenStory && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setWovenStory(null)}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold font-brand text-white">Your Woven Story for "{ritual.title}"</h2>
                            <button onClick={() => setWovenStory(null)} className="text-slate-400 hover:text-white"><X /></button>
                        </div>
                        <div className="p-8 overflow-y-auto">
                            <div className="prose prose-invert prose-p:text-slate-300 max-w-none">
                                {wovenStory.split('\n').filter(p => p.trim()).map((p, i) => <p key={i}>{p}</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RitualDashboardPage;
