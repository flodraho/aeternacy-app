
import React, { useState } from 'react';
import { Moment, Page } from '../types';
import { Bookmark, Gem, Sparkles, Zap, MapPin, Users, Tag, BarChart, Wand2, Share2, MessageSquare, ArrowRight, Maximize2 } from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';

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
    zoomLevel: number; // 0 (Micro) to 3 (Immersive)
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
    zoomLevel: number;
}> = ({ moment, onPinToggle, onSelect, onShare, onNavigate, newMomentId, deletingMomentId, isSelecting, isSelected, onToggleSelection, zoomLevel }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const TRUNCATE_LENGTH = 100;
    
    // Derived states based on zoom level
    const isMicro = zoomLevel === 0;
    const isDense = zoomLevel === 1;
    const isImmersive = zoomLevel === 3;

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
        } else {
            onSelect();
        }
    };

    // --- Micro View (Thumbnail Only) ---
    if (isMicro) {
        return (
            <div 
                onClick={handleCardClick} 
                className={`relative w-full aspect-square rounded-md overflow-hidden cursor-pointer group transition-all duration-300 ${isSelected ? 'ring-4 ring-cyan-400 z-10' : 'hover:scale-105 hover:z-10'}`}
                title={`${moment.title} - ${moment.date}`}
            >
                <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-full object-cover" />
                {isSelecting && (
                    <div className={`absolute inset-0 bg-black/40 ${isSelected ? 'opacity-0' : 'opacity-100'} group-hover:opacity-0 transition-opacity`}></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-[10px] font-bold truncate w-full">{moment.title}</p>
                </div>
                {moment.pinned && <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-sm"></div>}
            </div>
        );
    }

    // --- Standard/Dense/Immersive View ---

    const Footer: React.FC<{moment: Moment}> = ({ moment }) => (
        <div className={`pt-4 mt-auto space-y-3 ${isDense ? 'hidden' : 'block'}`}>
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
            </div>
            <div className="flex items-center justify-between min-h-[24px]">
                {moment.collaborators && moment.collaborators.length > 0 ? (
                    <div className="flex items-center -space-x-2">
                        {moment.collaborators.slice(0, 3).map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-600 ring-2 ring-gray-800 flex items-center justify-center text-[10px] font-bold text-white" title={c}>{c}</div>
                        ))}
                        {moment.collaborators.length > 3 && <div className="w-6 h-6 rounded-full bg-slate-700 ring-2 ring-gray-800 flex items-center justify-center text-10px font-bold text-white">+{moment.collaborators.length - 3}</div>}
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

    const isSelectable = isSelecting && (moment.type === 'standard' || moment.type === 'focus');
    const isSpecialCard = moment.type === 'fæmilyStoryline' || moment.type === 'insight' || moment.type === 'collection';

    const cardContent = () => {
         if (isSpecialCard) {
            const isSelectableSpecial = isSelecting;
            
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
                 <div className={`h-full rounded-3xl p-8 flex flex-col justify-between ring-1 ${moment.type === 'fæmilyStoryline' ? 'bg-gradient-to-br from-indigo-900/80 to-purple-900/60 ring-indigo-400/30' : 'bg-gradient-to-br from-cyan-900/80 to-teal-900/60 ring-cyan-400/30'} ${isSelectableSpecial ? 'opacity-50' : ''}`}>
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
                        {buttonConfig && !isSelectableSpecial && (
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
            <div className={`bg-gray-800/50 rounded-3xl overflow-hidden ring-1 ring-white/10 flex flex-col h-full ${isImmersive ? 'flex-row' : ''}`}>
                <div className={`relative ${isImmersive ? 'w-2/3 h-96' : 'h-48'} transition-all duration-500`}>
                    {isSharedByOther && <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-purple-600 ring-2 ring-slate-900 flex items-center justify-center text-sm font-bold text-white z-10" title={`Shared by ${moment.createdBy}`}>{moment.createdBy}</div>}
                    <img src={moment.image} alt={moment.title} className="w-full h-full object-cover"/>
                    
                    {moment.isLegacy && <div className="absolute top-4 left-4 p-2 bg-amber-900/50 rounded-full backdrop-blur-sm"><LegacyIcon className="w-5 h-5 text-amber-300" /></div>}
                </div>
                <div className={`p-6 flex-grow flex flex-col ${isImmersive ? 'w-1/3 justify-center' : ''}`}>
                    <h3 className={`${isImmersive ? 'text-4xl' : 'text-lg'} font-bold text-white font-brand`}>{moment.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{moment.date}</p>
                    {!isDense && (
                        <>
                            <p className={`text-sm text-slate-400 mt-2 flex-grow ${isImmersive ? 'text-lg leading-relaxed line-clamp-6' : ''}`}>{textToShow}</p>
                            {moment.description.length > TRUNCATE_LENGTH && !isImmersive && <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-sm font-semibold text-cyan-300 mt-2 self-start hover:text-cyan-200">{isExpanded ? 'Read less' : 'Read more'}</button>}
                            <Footer moment={moment} />
                        </>
                    )}
                </div>
            </div>
        );
    };
    
    // Actions Overlay - Moved to parent to avoid clipping
    const actionsOverlay = !isSelecting && !isDense && !isSpecialCard && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={handleShareClick} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors" title="Share">
                <Share2 className="w-5 h-5 text-slate-300" />
            </button>
            <button onClick={handlePinClick} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${moment.pinned ? 'bg-cyan-500/80 backdrop-blur-sm' : 'bg-black/40 backdrop-blur-sm hover:bg-black/60'}`} title={moment.pinned ? "Unpin from collection" : "Pin to collection"}>
                <Bookmark fill={moment.pinned ? 'currentColor' : 'none'} className={`w-5 h-5 ${moment.pinned ? 'text-white' : 'text-slate-300'}`} />
            </button>
        </div>
    );

    return (
        <div onClick={handleCardClick} className={`relative group text-left w-full h-full transition-transform transform focus:scale-[1.02] outline-none rounded-3xl ${moment.id === newMomentId ? 'new-moment-glow' : ''} ${isSelectable ? 'cursor-pointer hover:scale-[1.02]' : ''} ${isDeleting ? 'animate-dissolve-blue' : ''}`}>
            {cardContent()}
            
            {/* Render Actions here to escape overflow-hidden of cardContent */}
            {actionsOverlay}

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

const GridView: React.FC<GridViewProps> = ({ moments, onPinToggle, onSelectMoment, onShare, newMomentId, deletingMomentId, isSelecting, selectedIds, onToggleSelection, onNavigate, zoomLevel }) => {
    
    // Define grid classes based on zoom level
    let gridClasses = "";
    if (zoomLevel === 0) { // Micro
        gridClasses = "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1";
    } else if (zoomLevel === 1) { // Dense
        gridClasses = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";
    } else if (zoomLevel === 2) { // Standard
        gridClasses = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    } else if (zoomLevel === 3) { // Immersive
        gridClasses = "grid-cols-1 gap-12 max-w-5xl mx-auto";
    }

    return (
        <div className={`grid ${gridClasses} transition-all duration-500 ease-in-out`}>
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
                    zoomLevel={zoomLevel}
                />
            ))}
        </div>
    );
};

export default GridView;
