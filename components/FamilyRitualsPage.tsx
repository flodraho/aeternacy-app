

import React, { useState } from 'react';
import { Page, RitualTemplate, ActiveRitual, Moment, UserTier } from '../types';
import * as LucideIcons from 'lucide-react';
import { CalendarClock, Users, BookHeart, Plus, Sun, Moon, Sparkles, UtensilsCrossed, CakeSlice, Plane, Headset, Lock } from 'lucide-react';
import RitualSetupFlow from './RitualSetupFlow';

interface FamilyRitualsPageProps {
  moments: Moment[];
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  onNavigate: (page: Page) => void;
  activeRituals: ActiveRitual[];
  setActiveRituals: React.Dispatch<React.SetStateAction<ActiveRitual[]>>;
  onSelectRitual: (ritual: ActiveRitual) => void;
  familyMembers: string[];
  userTier: UserTier;
}

const ritualTemplates: RitualTemplate[] = [
    { id: 'sunday-dinner', title: 'Sunday Dinner', description: "Each Sunday, share a photo or thought from your family dinner.", icon: UtensilsCrossed, iconName: 'UtensilsCrossed', frequency: 'Weekly' },
    { id: 'birthday-tradition', title: 'Birthday Tradition', description: "Capture a special moment from each family member's birthday every year.", icon: CakeSlice, iconName: 'CakeSlice', frequency: 'Annual' },
    { id: 'vacation-journal', title: 'Vacation Journal', description: "Create a collaborative journal for your next family trip.", icon: Plane, iconName: 'Plane', frequency: 'Per Event' },
    { id: 'grandparent-interview', title: 'Grandparent Interview', description: "Ask a grandparent one question each month and record their story.", icon: Headset, iconName: 'Headset', frequency: 'Monthly' }
];


const FamilyRitualsPage: React.FC<FamilyRitualsPageProps> = ({ moments, showToast, onNavigate, activeRituals, setActiveRituals, onSelectRitual, familyMembers, userTier }) => {
    const [setupFlowState, setSetupFlowState] = useState<{ isOpen: boolean; template: RitualTemplate | null }>({ isOpen: false, template: null });

    const handleStartRitual = (template: RitualTemplate) => {
        if (activeRituals.some(r => r.templateId === template.id)) {
            showToast('This ritual is already active!', 'info');
            return;
        }
        setSetupFlowState({ isOpen: true, template });
    };

    const handleCompleteSetup = (newRitual: Omit<ActiveRitual, 'progress' | 'id'>) => {
        const fullRitual: ActiveRitual = {
            ...newRitual,
            id: new Date().toISOString(),
            progress: 0,
        };
        setActiveRituals(prev => [fullRitual, ...prev]);
        showToast(`Started the "${fullRitual.title}" ritual!`, 'success');
        setSetupFlowState({ isOpen: false, template: null });
    };
    
    const isFreeTier = userTier === 'free';

    return (
        <div className="animate-fade-in-up">
            {setupFlowState.isOpen && setupFlowState.template && (
                <RitualSetupFlow 
                    template={setupFlowState.template}
                    onClose={() => setSetupFlowState({ isOpen: false, template: null })}
                    onComplete={handleCompleteSetup}
                    familyMembers={familyMembers}
                />
            )}
            
            <section className="relative h-[50vh] flex items-center justify-center text-white text-center overflow-hidden">
                <div className="absolute inset-0 bg-black">
                    <img src="https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Family sharing a moment" className="w-full h-full object-cover opacity-40" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                <div className="relative z-10 p-6 animate-fade-in-up">
                    <h1 className="text-5xl md:text-6xl font-bold font-brand" style={{textShadow: '0 2px 15px rgba(0,0,0,0.5)'}}>Our Fæmily Rituals</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
                        Weaving individual moments into the shared traditions that bring our family closer, story by story.
                    </p>
                </div>
            </section>


            <div className="container mx-auto px-6 py-12">
                <section className="mb-16">
                    <h2 className="text-3xl font-bold font-brand text-white mb-6">Our Shared Traditions</h2>
                    {activeRituals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {activeRituals.map(ritual => {
                                const latestContribution = moments
                                    .filter(m => m.ritualId === ritual.id)
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                
                                const Icon = (LucideIcons as any)[ritual.iconName] || LucideIcons.CalendarClock;

                                return (
                                    <button key={ritual.id} onClick={() => onSelectRitual(ritual)} className="bg-slate-800/50 rounded-2xl ring-1 ring-white/10 text-left h-full flex flex-col hover:bg-slate-700/50 hover:ring-indigo-500/30 transition-all transform hover:-translate-y-1 overflow-hidden group">
                                        <div className="relative h-48 bg-slate-700">
                                            {latestContribution?.image ? (
                                                <img src={latestContribution.image} alt="Latest contribution" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Icon className="w-16 h-16 text-slate-600" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4">
                                                <h3 className="font-bold text-white text-xl">{ritual.title}</h3>
                                                <p className="text-sm text-slate-300">{ritual.frequency}</p>
                                            </div>
                                            <div className="absolute top-4 right-4 flex items-center -space-x-2">
                                                {ritual.participants.map(p => (
                                                    <div key={p.id} title={p.name} className="w-8 h-8 rounded-full bg-slate-600 ring-2 ring-slate-800 flex items-center justify-center text-xs font-bold">
                                                        {p.avatar}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            {latestContribution ? (
                                                <>
                                                    <p className="text-xs text-slate-400 font-semibold">LATEST STORY BY {latestContribution.createdBy || 'Family'}</p>
                                                    <p className="text-sm text-slate-300 mt-2 flex-grow line-clamp-2">"{latestContribution.description}"</p>
                                                </>
                                            ) : (
                                                <p className="text-sm text-slate-400 flex-grow">No contributions yet for this cycle. Be the first to add a memory!</p>
                                            )}
                                            <div className="mt-4">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="text-xs font-semibold text-slate-400">Progress</span>
                                                    <span className="text-sm font-bold text-white">{ritual.progress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${ritual.progress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-6 bg-slate-800/30 rounded-lg text-slate-500">
                            <p className="font-semibold text-lg text-slate-400 mb-2">No active rituals yet.</p>
                            <p>Start a new ritual from the library below to begin a family tradition.</p>
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-3xl font-bold font-brand text-white mb-6">Begin a New Tradition</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ritualTemplates.map(template => {
                            const Icon = template.icon;
                            return (
                                <div key={template.id} className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10 flex flex-col text-center items-center">
                                    <div className="w-16 h-16 bg-cyan-500/10 rounded-xl flex items-center justify-center ring-1 ring-cyan-500/20 mb-4">
                                        <Icon className="w-8 h-8 text-cyan-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white font-brand">{template.title}</h3>
                                    <p className="text-slate-400 text-sm mt-2 flex-grow">{template.description}</p>
                                    {isFreeTier ? (
                                        <button 
                                            onClick={() => onNavigate(Page.Subscription)}
                                            className="mt-6 w-full bg-indigo-600/50 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <Lock className="w-4 h-4" /> Unlock with Fæmily Plan
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleStartRitual(template)} 
                                            className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> Start this Ritual
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FamilyRitualsPage;