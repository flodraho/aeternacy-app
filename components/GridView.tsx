import React, { useState } from 'react';
import { Moment, Page } from '../types';
import { Bookmark, Gem, Sparkles, Zap, MapPin, Users, Tag, BarChart, Wand2, Share2, MessageSquare, ArrowRight, Check } from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';
import Tooltip from './Tooltip';

interface GridViewProps {
    moments: Moment[];
    onPinToggle: (id: number) => void;
    onSelectMoment: (moment: Moment) => void;
    onShare: (moment: Moment) => void;
    onNavigate: (page: Page) => void;
    newMomentId?: number | null;
    deletingMomentId?: number | null;
    isSelecting?: boolean;
    selectedIds?: Set<number>;
    onToggleSelection?: (id: number) => void;
}

const tierIconMap = {
    diamond: Gem,
    sparkle: Sparkles,
    flash: Zap,
};

const Card: React.FC<{ 
    moment: Moment; 
    onPinToggle: (id: number) => void; 
    onSelect: () => void; 
    onShare: () => void;
    onNavigate: (page: Page) => void;
    newMomentId?: number | null;
    deletingMomentId?: number | null;
    isSelecting?: boolean;
    isSelected?: boolean;
    onToggleSelection?: () => void;
}> = ({ moment, onPinToggle, onSelect, onShare, onNavigate, newMomentId, deletingMomentId, isSelecting, isSelected, onToggleSelection }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const TRUNCATE_LENGTH = 100;
    
    const TierIcon = moment.aiTier ? tierIconMap[moment.aiTier] : null;

    const currentUserId = 'JD';
    const isSharedByOther = moment.createdBy && moment.createdBy !== currentUserId;
    const isDeleting = moment.id === deletingMomentId;

    const handlePinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPinToggle(moment.id);
    };

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare();
    };
    
    const handleCardClick = () => {
        if (isSelecting && onToggleSelection) {
            onToggleSelection();
        } else if (moment.id !== -1 && moment.id !== -2) { // Prevent click on teasers
            onSelect();
        }
    };

    const Footer: React.FC<{moment: Moment}> = ({ moment }) => (
        <div className="pt-4 mt-auto space-y-3">
            <div className="flex flex-wrap gap-2">
                {moment.location && (
                    <span className="flex items-center gap-1.5 bg-gray-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                        <MapPin className="w-3.5 h-3.5"/>
                        {moment.location}
                    </span>
                )}
                {moment.people?.slice(0, 2).map(person => (
                    <span key={person} className="flex items-center gap-1.5 bg-gray-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                        <Users className="w-3.5 h-3.5"/>
                        {person}
                    </span>
                ))}
                {moment.activities?.slice(0, 1).map(activity => (
                     <span key={activity} className="flex items-center gap-1.5 bg-gray-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                        <Tag className="w-3.5 h-3.5"/>
                        {activity}
                    </span>
                ))}
            </div>
            <div className="flex items-center justify-between min-h-[24px]">
                {moment.collaborators && moment.collaborators.length > 0 ? (
                    <div className="flex items-center -space-x-2">
                        {moment.collaborators.slice(0, 3).map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-600 ring-2 ring-gray-800 flex items-center justify-center text-[10px] font-bold text-white" title={c}>{c}</div>
                        ))}
                        {moment.collaborators.length > 3 && <div className="w-6 h-6 rounded-full bg-slate-700 ring-2 ring-gray-800 flex items-center justify-center text-[10px] font-bold text-white">+{moment.collaborators.length - 3}</div>}
                    </div>
                ) : ( <div /> )} 
                {moment.comments && moment.comments.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{moment.comments.length}</span>
                    </div>
                )}
            </div>
        </div>
    );

    const cardContent = () => {
        if (moment.id === -1) { // Teaser Card for Free tier
            return (
                <div className="relative h-full rounded-3xl p-8 flex flex-col justify-between bg-gradient-to-br from-cyan-900/80 to-teal-900/60 ring-1 ring-cyan-400/30 overflow-hidden">
                    <div className="absolute inset-0">
                        <img src="https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Data insights background" className="w-full h-full object-cover opacity-20"/>
                        <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/30"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
                            <BarChart className="w-8 h-8 text-cyan-300" />
                        </div>
                        <h3 className="text-xl font-bold text-white font-brand">Your Story at a Glance</h3>
                        <p className="text-slate-400 mt-2 text-sm">🔒 AI-powered insights are available on paid plans.</p>
                    </div>
                    <div className="relative z-10 mt-6">
                        <button onClick={(e) => { e.stopPropagation(); onNavigate(Page.Subscription); }} className="w-full font-bold py-2 rounded-full text-sm flex items-center justify-center gap-2 transition-colors bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/40">
                            See What You're Missing <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            );
        }

        if (moment.id === -2) { // Family Storyline Teaser
            return (
                <div className="relative h-full rounded-3xl p-8 flex flex-col justify-between bg-gradient-to-br from-indigo-900/80 to-purple-900/60 ring-1 ring-indigo-400/30 overflow-hidden">
                    <div className="absolute inset-0">
                        <img src="https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Family collaboration" className="w-full h-full object-cover opacity-20"/>
                        <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/30"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
                            <Users className="w-8 h-8 text-indigo-300" />
                        </div>
                        <h3 className="text-xl font-bold text-white font-brand">{moment.title}</h3>
                        <ul className="text-slate-300 mt-4 text-sm space-y-2">
                            <li className="flex gap-2"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0"/> Invite up to 5 family members</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0"/> Collaborate on shared memories</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0"/> AI weaves everyone's perspective into one story</li>
                        </ul>
                    </div>
                    <div className="relative z-10 mt-6 space-y-2">
                        <button onClick={(e) => { e.stopPropagation(); alert("A video demo would show how multiple family members contribute photos and stories to an event, which are then woven into a single, beautiful timeline."); }} className="w-full font-bold py-2 rounded-full text-sm flex items-center justify-center gap-2 transition-colors bg-white/10 text-white hover:bg-white/20">
                            See How It Works
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onNavigate(Page.Subscription); }} className="w-full font-bold py-2 rounded-full text-sm flex items-center justify-center gap-2 transition-colors bg-indigo-500 text-white hover:bg-indigo-400">
                            Upgrade to Fæmily
                        </button>
                    </div>
                </div>
            );
        }


         if (moment.type === 'fæmilyStoryline' || moment.type === 'insight' || moment.type === 'collection') {
            const isSelectable = isSelecting;
            
            const renderStats = () => {
                if(moment.type === 'fæmilyStoryline' && moment.fæmilyStorylineData) {
                    return `${moment.fæmilyStorylineData.members} members • ${moment.fæmilyStorylineData.moments} momænts`;
                }
                if(moment.type === 'insight' && moment.insightData) {
                    return `${moment.insightData.memories} analyzed • ${moment.insightData.period}`;
                }
                if(moment.type === 'collection' && moment.collectionData) {
                    return `${moment.collectionData.ready} suggestions ready`;
                }
                return null;
            }

            const getButtonConfig = () => {
                if(moment.type === 'fæmilyStoryline') return { text: "Open Fæmily Space", action: () => onNavigate(Page.FamilySpace) };
                if(moment.type === 'insight') return { text: "View Insights", action: () => onNavigate(Page.DataInsight) };
                if(moment.type === 'collection') return { text: "Open Curator's Studio", action: () => onNavigate(Page.SmartCollection) };
                return null;
            }

            const buttonConfig = getButtonConfig();

            return (
                 <div className={`h-full rounded-3xl p-8 flex flex-col justify-between ring-1 ${moment.type === 'fæmilyStoryline' ? 'bg-gradient-to-br from-indigo-900/80 to-purple-900/60 ring-indigo-400/30' : 'bg-gradient-to-br from-cyan-900/80 to-teal-900/60 ring-cyan-400/30'} ${isSelectable ? 'opacity-50' : ''}`}>
                    <div>
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${moment.type === 'fæmilyStoryline' ? 'bg-indigo-500/20' : 'bg-cyan-500/20'}`}>
                            {moment.type === 'fæmilyStoryline' && <Users className="w-8 h-8 text-indigo-300" />}
                            {moment.type === 'insight' && <BarChart className="w-8 h-8 text-cyan-300" />}
                            {moment.type === 'collection' && <Wand2 className="w-8 h-8 text-cyan-300" />}
                        </div>
                        <h3 className="text-xl font-bold text-white font-brand">{moment.title}</h3>
                        <p className="text-slate-400 mt-2 text-sm">{moment.description}</p>
                    </div>
                    <div className="mt-6">
                        <div className="h-px bg-white/10 mb-4"></div>
                        <p className="text-xs text-slate-400 font-semibold mb-3">{renderStats()}</p>
                        {buttonConfig && !isSelectable && (
                            <button onClick={(e) => { e.stopPropagation(); buttonConfig.action(); }} className={`w-full font-bold py-2 rounded-full text-sm flex items-center justify-center gap-2 transition-colors ${moment.type === 'fæmilyStoryline' ? 'bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/40' : 'bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/40'}`}>
                                {buttonConfig.text} <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        const textToShow = moment.description.length > TRUNCATE_LENGTH && !isExpanded ? `${moment.description.substring(0, TRUNCATE_LENGTH)}...` : moment.description;

        return (
            <div className="bg-gray-800/50 rounded-3xl overflow-hidden ring-1 ring-white/10 flex flex-col h-full">
                <div className="relative h-48">
                    {isSharedByOther && <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-purple-600 ring-2 ring-slate-900 flex items-center justify-center text-sm font-bold text-white z-10" title={`Shared by ${moment.createdBy}`}>{moment.createdBy}</div>}
                    <img src={moment.image} alt={moment.title} className="w-full h-full object-cover"/>
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                         <Tooltip text="Share">
                            <button onClick={handleShareClick} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"><Share2 className="w-5 h-5 text-slate-300" /></button>
                         </Tooltip>
                         <Tooltip text={moment.pinned ? "Unpin from collection" : "Pin to collection"}>
                            <button onClick={handlePinClick} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${moment.pinned ? 'bg-cyan-500/80 backdrop-blur-sm' : 'bg-black/40 backdrop-blur-sm hover:bg-black/60'}`}><Bookmark fill={moment.pinned ? 'currentColor' : 'none'} className={`w-5 h-5 ${moment.pinned ? 'text-white' : 'text-slate-300'}`} /></button>
                         </Tooltip>
                    </div>
                    {moment.isLegacy && <div className="absolute top-4 left-4 p-2 bg-amber-900/50 rounded-full backdrop-blur-sm"><LegacyIcon className="w-5 h-5 text-amber-300" /></div>}
                </div>
                <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-white font-brand">{moment.title}</h3>
                    <p className="text-sm text-slate-500">{moment.date}</p>
                    <p className="text-sm text-slate-400 mt-2 flex-grow">{textToShow}</p>
                    {moment.description.length > TRUNCATE_LENGTH && <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-sm font-semibold text-cyan-300 mt-2 self-start hover:text-cyan-200">{isExpanded ? 'Read less' : 'Read more'}</button>}
                    <Footer moment={moment} />
                </div>
            </div>
        );
    };
    
    const isSelectable = isSelecting && (moment.type === 'standard' || moment.type === 'focus');

    return (
        <div onClick={handleCardClick} className={`relative text-left w-full h-full transition-transform transform focus:scale-[1.02] outline-none rounded-3xl ${moment.id === newMomentId ? 'new-moment-glow' : ''} ${isSelectable ? 'cursor-pointer hover:scale-[1.02]' : ''} ${isDeleting ? 'animate-dissolve-blue' : ''}`}>
            {cardContent()}
             {isSelecting && (
                <div className={`absolute inset-0 rounded-3xl transition-all duration-300 pointer-events-none ${!isSelectable ? 'bg-slate-900/60' : ''} ${isSelected ? 'ring-4 ring-cyan-400' : ''}`}>
                    {isSelectable && (
                        <div className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-slate-900/50 ring-2 ring-white backdrop-blur-sm">
                            {isSelected && <div className="w-4 h-4 rounded-full bg-cyan-400"></div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const GridView: React.FC<GridViewProps> = ({ moments, onPinToggle, onSelectMoment, onShare, newMomentId, deletingMomentId, isSelecting, selectedIds, onToggleSelection, onNavigate }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {moments.map(moment => (
                <Card 
                    key={moment.id} 
                    moment={moment} 
                    onPinToggle={onPinToggle} 
                    onSelect={() => onSelectMoment(moment)} 
                    onShare={() => onShare(moment)} 
                    onNavigate={onNavigate}
                    newMomentId={newMomentId}
                    deletingMomentId={deletingMomentId}
                    isSelecting={isSelecting}
                    isSelected={selectedIds?.has(moment.id)}
                    onToggleSelection={onToggleSelection ? () => onToggleSelection(moment.id) : undefined}
                />
            ))}
        </div>
    );
};

export default GridView;