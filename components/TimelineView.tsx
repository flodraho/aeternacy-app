import React from 'react';
import { Moment, Page } from '../types';
import LegacyIcon from './icons/LegacyIcon';
import { Users, BarChart, Check } from 'lucide-react';

interface TimelineViewProps {
    moments: Moment[];
    onPinToggle: (id: number) => void;
    onSelectMoment: (moment: Moment) => void;
    onShare: (moment: Moment) => void;
    newMomentId?: number | null;
    deletingMomentId?: number | null;
    onNavigate: (page: Page) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ moments, onPinToggle, onSelectMoment, newMomentId, deletingMomentId, onNavigate }) => {
    // Hardcoded user for demo purposes.
    const currentUserId = 'JD';

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-3xl">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-700/50"></div>
                {moments.filter(m => m.type !== 'collection').map((moment, index) => {
                    if (moment.id === -1) { // Insight teaser card
                        return (
                            <div key="teaser-card" className="relative mb-12">
                                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-4 w-4 h-4 rounded-full bg-cyan-500 ring-4 ring-gray-900"></div>
                                <div className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                                        <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 ring-1 ring-cyan-500/30 overflow-hidden">
                                             <img src="https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Data insights background" className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm"/>
                                            <div className="relative text-center">
                                                <BarChart className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
                                                <h3 className="font-bold text-white text-lg font-brand">Your Story at a Glance</h3>
                                                <p className="text-xs text-slate-400 mt-1 mb-3">🔒 AI-powered insights are available on paid plans.</p>
                                                <button onClick={() => onNavigate(Page.Subscription)} className="font-semibold text-cyan-300 text-sm hover:underline">
                                                    See What You're Missing &rarr;
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    if (moment.id === -2) { // Family teaser card
                        return (
                            <div key="family-teaser-card" className="relative mb-12">
                                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-4 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-gray-900"></div>
                                <div className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                                        <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 ring-1 ring-indigo-500/30 overflow-hidden">
                                             <img src="https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Family collaboration" className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm"/>
                                            <div className="relative">
                                                <Users className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
                                                <h3 className="font-bold text-white text-lg font-brand text-center">{moment.title}</h3>
                                                <ul className="text-slate-400 mt-3 text-xs space-y-1.5">
                                                    <li className="flex gap-2"><Check className="w-4 h-4 text-indigo-400 flex-shrink-0"/> Invite up to 5 family members</li>
                                                    <li className="flex gap-2"><Check className="w-4 h-4 text-indigo-400 flex-shrink-0"/> Collaborate on shared memories</li>
                                                    <li className="flex gap-2"><Check className="w-4 h-4 text-indigo-400 flex-shrink-0"/> AI weaves stories together</li>
                                                </ul>
                                                <div className="mt-4 space-y-2">
                                                     <button onClick={() => alert("A video demo would show how multiple family members contribute photos and stories to an event, which are then woven into a single, beautiful timeline.")} className="w-full text-xs font-semibold py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20">
                                                        See How It Works
                                                    </button>
                                                    <button onClick={() => onNavigate(Page.Subscription)} className="w-full text-xs font-semibold py-1.5 rounded-full bg-indigo-500 text-white hover:bg-indigo-400">
                                                        Upgrade to Fæmily
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    const isSharedByOther = moment.createdBy && moment.createdBy !== currentUserId;
                    const isDeleting = moment.id === deletingMomentId;
                    return (
                        <div key={moment.id} className="relative mb-12">
                             <div className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-4 w-4 h-4 rounded-full bg-cyan-500 ring-4 ring-gray-900`}></div>
                             <div className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                <button 
                                    onClick={() => onSelectMoment(moment)} 
                                    className={`w-5/12 text-left transition-transform transform hover:scale-105 focus:scale-105 outline-none rounded-xl ${moment.id === newMomentId ? 'new-moment-glow' : ''} ${isDeleting ? 'animate-dissolve-blue' : ''} ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}
                                >
                                     <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 ring-1 ring-white/10">
                                         <div className="relative">
                                            <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                                            {isSharedByOther && (
                                                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-purple-600 ring-2 ring-slate-800 flex items-center justify-center text-xs font-bold text-white z-10" title={`Shared by ${moment.createdBy}`}>
                                                    {moment.createdBy}
                                                </div>
                                            )}
                                            {moment.isLegacy && <div className="absolute top-2 right-2 p-1.5 bg-amber-900/50 rounded-full backdrop-blur-sm"><LegacyIcon className="w-4 h-4 text-amber-300" /></div>}
                                         </div>
                                         <p className="text-sm text-slate-400">{moment.date}</p>
                                         <h3 className="font-bold text-white text-lg font-brand">{moment.title}</h3>
                                         <p className="text-xs text-slate-400 mt-1 line-clamp-2">{moment.description}</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineView;