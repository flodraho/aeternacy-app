import React from 'react';
import { Moment } from '../types';
import LegacyIcon from './icons/LegacyIcon';
import { Users } from 'lucide-react';

interface TimelineViewProps {
    moments: Moment[];
    onPinToggle: (id: number) => void;
    onSelectMoment: (moment: Moment) => void;
    onShare: (moment: Moment) => void;
    newMomentId?: number | null;
    deletingMomentId?: number | null;
}

const TimelineView: React.FC<TimelineViewProps> = ({ moments, onPinToggle, onSelectMoment, newMomentId, deletingMomentId }) => {
    // Hardcoded user for demo purposes.
    const currentUserId = 'JD';

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-3xl">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-700/50"></div>
                {moments.filter(m => m.type !== 'insight' && m.type !== 'collection').map((moment, index) => {
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