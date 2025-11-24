
import React, { useState, useMemo } from 'react';
import { Moment, Page, Journey, UserTier } from '../types';
import GridView from './GridView';
import TimelineView from './TimelineView';
import { LayoutGrid, List, MoreVertical, User, Plus, X, ArrowLeft, Share2, Hand, Filter, Check, Users } from 'lucide-react';
import ShareModal from './ShareModal';
import Tooltip from './Tooltip';

interface MomentsPageProps {
    moments: Moment[];
    journeys: Journey[];
    onCreateJourney: (title: string, description: string, momentIds: string[]) => void;
    onPinToggle: (id: string) => void;
    onSelectMoment: (moment: Moment) => void;
    onItemUpdate: (item: Moment | Journey) => void;
    onShareToFamily: (item: Moment | Journey) => void;
    userTier: UserTier;
    onNavigate: (page: Page) => void;
    newMomentId?: string | null;
    deletingMomentId?: string | null;
    showGuide?: boolean;
    onCloseGuide?: () => void;
}

type ViewMode = 'grid' | 'timeline';
type CollectionMode = 'moments' | 'journeys' | 'shared';
type FilterMode = 'all' | 'pinned' | 'legacy';


// --- Sub-components for Journeys View ---

const JourneyCard: React.FC<{ journey: Journey; onClick: () => void; onShare: () => void; }> = ({ journey, onClick, onShare }) => (
    <div onClick={onClick} className="relative aspect-[10/7] cursor-pointer group p-4">
        <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Tooltip text="Share Journæy">
                <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors">
                    <Share2 className="w-5 h-5 text-slate-300" />
                </button>
            </Tooltip>
        </div>
        <div className="absolute inset-4 bg-slate-700/50 rounded-2xl ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-2 group-hover:-rotate-6"></div>
        <div className="absolute inset-2 bg-slate-800/50 rounded-2xl ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-3"></div>
        <div className="relative w-full h-full bg-slate-800 rounded-2xl overflow-hidden ring-1 ring-white/10 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
            <img src={journey.coverImage} alt={journey.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4">
                <h3 className="font-bold text-white text-lg font-brand">{journey.title}</h3>
                <p className="text-xs text-slate-400">{journey.momentIds.length} momænts</p>
            </div>
        </div>
    </div>
);

const ExpandedJourneyView: React.FC<{
    journey: Journey;
    moments: Moment[];
    onBack: () => void;
    onSelectMoment: (moment: Moment) => void;
    onPinToggle: (id: string) => void;
    onShare: (moment: Moment) => void;
    onNavigate: (page: Page) => void;
}> = ({ journey, moments, onBack, onSelectMoment, onPinToggle, onShare, onNavigate }) => {
    const journeyMoments = useMemo(() => moments.filter(m => journey.momentIds.includes(m.id)), [journey, moments]);
    
    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to all Journæys
            </button>
            <h2 className="text-4xl font-bold text-white font-brand mb-2">{journey.title}</h2>
            <p className="text-slate-400 mb-8 max-w-2xl">{journey.description}</p>
            <GridView
                moments={journeyMoments}
                onPinToggle={onPinToggle}
                onSelectMoment={onSelectMoment}
                onShare={onShare}
                onNavigate={onNavigate}
            />
        </div>
    );
};


const MomentsPage: React.FC<MomentsPageProps> = ({ moments, journeys, onCreateJourney, onPinToggle, onSelectMoment, onItemUpdate, onShareToFamily, userTier, onNavigate, newMomentId, deletingMomentId, showGuide, onCloseGuide }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [shareTarget, setShareTarget] = useState<Moment | Journey | null>(null);
    const [mode, setMode] = useState<CollectionMode>('moments');
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [journeyTitle, setJourneyTitle] = useState('');
    const [journeyDescription, setJourneyDescription] = useState('');
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
    const [filterMode, setFilterMode] = useState<FilterMode>('all');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);


    const currentUserId = 'JD';

    const displayedMoments = useMemo(() => {
        let baseMoments: Moment[] = [];
        if (mode === 'moments') {
            baseMoments = moments.filter(m => !m.createdBy || m.createdBy === currentUserId);
        }
        if (mode === 'shared') {
            baseMoments = moments.filter(m => m.createdBy && m.createdBy !== currentUserId);
        }

        if (mode !== 'journeys') {
            switch (filterMode) {
                case 'pinned':
                    return baseMoments.filter(m => m.pinned);
                case 'legacy':
                    return baseMoments.filter(m => m.isLegacy === true);
                case 'all':
                default:
                    return baseMoments;
            }
        }
        
        return []; // Return empty for journeys mode as it has its own render logic
    }, [moments, mode, currentUserId, filterMode]);
    
    const momentsWithTeaser = useMemo(() => {
        if (userTier !== 'free' || mode !== 'moments') {
            return displayedMoments;
        }
    
        // FIX: Filter out the full versions of insight/family cards for free users to avoid duplicates
        let newMoments = displayedMoments.filter(m => m.type !== 'insight' && m.type !== 'fæmilyStoryline');
    
        // Add Family Storyline Teaser at the beginning
        const familyTeaserMoment: Moment = {
            id: '-2',
            type: 'fæmilyStoryline',
            aiTier: null,
            pinned: false,
            title: "The Fæmily Storyline",
            date: "Fæmily Plan Feature",
            description: "Invite family, collaborate on memories, and let AI weave everyone's perspective into one shared story.",
        };
        newMoments.unshift(familyTeaserMoment);
    
        // Add Data Insights Teaser (existing logic)
        // Note: The original logic used `displayedMoments.length > 2`. 
        // We should use the length of actual user moments.
        // `newMoments` at this point only has user moments + the family teaser.
        if (displayedMoments.filter(m => m.type === 'standard' || m.type === 'focus').length > 2) {
            const insightTeaserMoment: Moment = {
                id: '-1',
                type: 'insight',
                aiTier: null,
                pinned: false,
                title: "Your Story at a Glance",
                date: "AI-Powered",
                description: "Unlock AI-powered insights into your life's patterns, connections, and emotional threads.",
                insightData: {
                    memories: 0,
                    period: 'Upgrade to Unlock'
                }
            };
            // Splice after the 4th item (3 user moments + family teaser). The original logic was `splice(4,...)` after `unshift`.
            newMoments.splice(4, 0, insightTeaserMoment);
        }
        
        return newMoments;
    }, [displayedMoments, userTier, mode]);

    const hasPersonalMoments = useMemo(() => 
        moments.some(m => !m.createdBy || m.createdBy === currentUserId),
    [moments, currentUserId]);

    const handleStartCreateJourney = () => {
        setMode('moments');
        setViewMode('grid');
        setIsSelecting(true);
        setSelectedIds(new Set());
    };

    const handleCancelSelection = () => {
        setIsSelecting(false);
        setSelectedIds(new Set());
    };

    const handleToggleSelection = (momentId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(momentId)) newSet.delete(momentId);
            else newSet.add(momentId);
            return newSet;
        });
    };

    const handleProceedToCreate = () => {
        if (selectedIds.size > 0) setIsCreateModalOpen(true);
    };
    
    const handleFilterChange = (filter: FilterMode) => {
        setFilterMode(filter);
        setIsFilterMenuOpen(false);
    };

    const handleFinalizeJourney = (e: React.FormEvent) => {
        e.preventDefault();
        if (journeyTitle.trim() && selectedIds.size > 0) {
            onCreateJourney(journeyTitle, journeyDescription, Array.from(selectedIds));
            setIsCreateModalOpen(false);
            setIsSelecting(false);
            setSelectedIds(new Set());
            setJourneyTitle('');
            setJourneyDescription('');
            setMode('journeys');
        }
    };

    return (
        <div className="container mx-auto px-6 pt-28 pb-8">
            <div className="mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-xl flex items-center justify-center ring-1 ring-cyan-500/20">
                        <User className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">My Collection</h1>
                        <p className="text-slate-400 mt-2">Explore, connect, and curate the chapters of your personal story.</p>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-slate-700 mb-6">
                <button onClick={() => { setMode('moments'); setIsSelecting(false); setActiveJourney(null); }} className={`px-4 py-2 font-semibold transition-colors ${mode === 'moments' ? 'text-white border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                    My Momænts
                </button>
                <button onClick={() => { setMode('journeys'); setIsSelecting(false); setActiveJourney(null); }} className={`px-4 py-2 font-semibold transition-colors ${mode === 'journeys' ? 'text-white border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                    Journæys
                </button>
                <button onClick={() => { setMode('shared'); setIsSelecting(false); setActiveJourney(null); }} className={`px-4 py-2 font-semibold transition-colors ${mode === 'shared' ? 'text-white border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                    Shared With Me
                </button>
            </div>

            {(mode === 'moments' || mode === 'shared') && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            {isSelecting && <p className="text-slate-300 font-semibold animate-fade-in">Select momænts to create a new journæy.</p>}
                        </div>
                        <div className={`flex items-center gap-2 ${showGuide ? 'relative z-[56] animate-guide-pulse' : ''}`}>
                            {!isSelecting && (
                                <>
                                    {/* View Toggle */}
                                    <div className="flex items-center bg-gray-800/80 border border-white/10 rounded-full p-1">
                                        <Tooltip text="Grid View">
                                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/5'}`}>
                                                <LayoutGrid className="w-5 h-5 text-white" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip text="Timeline View">
                                            <button onClick={() => setViewMode('timeline')} className={`p-2 rounded-full transition-colors ${viewMode === 'timeline' ? 'bg-white/20' : 'hover:bg-white/5'}`}>
                                                <List className="w-5 h-5 text-white" />
                                            </button>
                                        </Tooltip>
                                    </div>
                                    
                                    {/* Filter Button */}
                                    <div className="relative">
                                        <Tooltip text="Filter moments">
                                            <button onClick={() => setIsFilterMenuOpen(prev => !prev)} className="p-3 rounded-full bg-gray-800/80 border border-white/10 hover:bg-white/5 transition-colors relative">
                                                <Filter className="w-5 h-5 text-white" />
                                                {filterMode !== 'all' && <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></div>}
                                            </button>
                                        </Tooltip>
                                        {isFilterMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-white/10 z-10">
                                                <button onClick={() => handleFilterChange('all')} className="w-full text-left flex items-center justify-between gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                                    <span>All</span>
                                                    {filterMode === 'all' && <Check className="w-4 h-4 text-cyan-400"/>}
                                                </button>
                                                <button onClick={() => handleFilterChange('pinned')} className="w-full text-left flex items-center justify-between gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                                    <span>Pinned</span>
                                                    {filterMode === 'pinned' && <Check className="w-4 h-4 text-cyan-400"/>}
                                                </button>
                                                <button onClick={() => handleFilterChange('legacy')} className="w-full text-left flex items-center justify-between gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                                    <span>Legacy</span>
                                                    {filterMode === 'legacy' && <Check className="w-4 h-4 text-cyan-400"/>}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* More Options Button */}
                                    <div className="relative">
                                        <Tooltip text="More options">
                                            <button onClick={() => setIsMoreMenuOpen(prev => !prev)} className="p-3 rounded-full bg-gray-800/80 border border-white/10 hover:bg-white/5 transition-colors">
                                                <MoreVertical className="w-5 h-5 text-white" />
                                            </button>
                                        </Tooltip>
                                        {isMoreMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-white/10 z-10">
                                                <button 
                                                    onClick={() => { handleStartCreateJourney(); setIsMoreMenuOpen(false); }} 
                                                    disabled={!hasPersonalMoments}
                                                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="w-5 h-5 text-slate-400" />
                                                    <span>Create new Journæy</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {displayedMoments.length === 0 && !isSelecting ? (
                        <div className="text-center py-20 px-6 text-slate-500 bg-slate-800/30 rounded-lg flex flex-col items-center">
                            {mode === 'shared' ? (
                                <>
                                    <Users className="w-16 h-16 text-slate-600 mb-4" />
                                    <h2 className="font-semibold text-xl text-slate-400 mb-2">A Space for Shared Stories</h2>
                                    <p>When family members share momænts with you, they will appear here.</p>
                                    {userTier === 'free' ? (
                                        <>
                                            <p className="mt-4">Collaborating on memories is a feature of the <span className="font-semibold text-indigo-400">Fæmily</span> plan.</p>
                                            <button onClick={() => onNavigate(Page.Subscription)} className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full transition-colors">
                                                Upgrade to Fæmily
                                            </button>
                                        </>
                                    ) : (
                                        <p className="mt-4">Invite family members from your Profile to start building your story together.</p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <LayoutGrid className="w-16 h-16 text-slate-600 mb-4" />
                                    <h2 className="font-semibold text-xl text-slate-400 mb-2">Your Collection is Eager for Stories</h2>
                                    <p>This is where your curated life will unfold. Start by creating your first memory.</p>
                                    <button onClick={() => onNavigate(Page.Create)} className="mt-8 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full transition-colors">
                                        Create First Momænt
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <GridView moments={momentsWithTeaser} onPinToggle={onPinToggle} onSelectMoment={onSelectMoment} onShare={(moment) => setShareTarget(moment)} newMomentId={newMomentId} deletingMomentId={deletingMomentId} isSelecting={isSelecting} selectedIds={selectedIds} onToggleSelection={handleToggleSelection} onNavigate={onNavigate} />
                        ) : (
                            <TimelineView moments={momentsWithTeaser} onPinToggle={onPinToggle} onSelectMoment={onSelectMoment} onShare={(moment) => setShareTarget(moment)} newMomentId={newMomentId} deletingMomentId={deletingMomentId} onNavigate={onNavigate} />
                        )
                    )}
                </>
            )}

            {mode === 'journeys' && (
                activeJourney ? (
                    <ExpandedJourneyView
                        journey={activeJourney}
                        moments={moments}
                        onBack={() => setActiveJourney(null)}
                        onSelectMoment={onSelectMoment}
                        onPinToggle={onPinToggle}
                        onShare={(moment) => setShareTarget(moment)}
                        onNavigate={onNavigate}
                    />
                ) : (
                    <div>
                        {journeys.length === 0 ? (
                            <div className="text-center py-16 px-6 text-slate-500 bg-slate-800/30 rounded-lg">
                                <p className="font-semibold text-lg text-slate-400 mb-2">Your Journæys will appear here.</p>
                                <p>Group your momænts into powerful stories.</p>
                                <p className="mt-4">
                                    To get started, switch to the <span className="font-semibold text-cyan-400">"My Momænts"</span> tab and find <br/> "Create new Journæy" in the menu (<MoreVertical className="w-4 h-4 inline-block -mt-1"/>).
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {journeys.map(journey => (
                                    <JourneyCard key={journey.id} journey={journey} onClick={() => setActiveJourney(journey)} onShare={() => setShareTarget(journey)} />
                                ))}
                            </div>
                        )}
                    </div>
                )
            )}

            {isSelecting && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg p-2 flex items-center gap-2 z-50 animate-fade-in-up">
                    <span className="text-white font-semibold px-4">{selectedIds.size} momænt{selectedIds.size !== 1 && 's'} selected</span>
                    <button onClick={handleProceedToCreate} disabled={selectedIds.size === 0} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed">Next</button>
                    <button onClick={handleCancelSelection} className="p-2 text-slate-300 hover:text-white rounded-full"><X size={20}/></button>
                </div>
            )}
            
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsCreateModalOpen(false)}>
                    <form onSubmit={handleFinalizeJourney} className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold font-brand mb-4">Create Your Journæy</h2>
                        <div className="space-y-4">
                            <input type="text" value={journeyTitle} onChange={e => setJourneyTitle(e.target.value)} placeholder="Journæy Title" required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500" />
                            <textarea value={journeyDescription} onChange={e => setJourneyDescription(e.target.value)} placeholder="Journæy Description (optional)" className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md h-24 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="bg-slate-600 hover:bg-slate-500 py-2 px-4 rounded-full font-semibold">Cancel</button>
                            <button type="submit" disabled={!journeyTitle.trim()} className="bg-cyan-600 hover:bg-cyan-500 py-2 px-4 rounded-full font-semibold disabled:bg-gray-600">Create Journæy</button>
                        </div>
                    </form>
                </div>
            )}

            {shareTarget && (
                <ShareModal 
                    item={shareTarget}
                    onClose={() => setShareTarget(null)}
                    onUpdateItem={(updatedItem) => {
                        onItemUpdate(updatedItem);
                        setShareTarget(updatedItem);
                    }}
                    onShareToFamily={onShareToFamily}
                    userTier={userTier}
                />
            )}

            {showGuide && onCloseGuide && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[55]" onClick={onCloseGuide}>
                    <div className="relative w-full h-full max-w-7xl mx-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-[18%] right-[2%] md:right-[5%] lg:right-[10%] xl:right-[15%] w-64 animate-fade-in-up">
                            <div style={{ transform: 'rotate(-45deg)', transformOrigin: 'bottom left' }}>
                               <div className="animate-point-and-click">
                                    <Hand className="w-16 h-16 text-cyan-400/80" />
                                </div>
                            </div>
                            <div className="absolute top-16 left-0 bg-slate-800/95 backdrop-blur-sm p-4 rounded-lg shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-400/50" >
                                <h4 className="font-bold text-white mb-2">æterny's Guide</h4>
                                <p className="text-sm text-slate-300">
                                    Use these controls to switch views or create a 'Journæy' to group related momænts into a larger story.
                                </p>
                                <button onClick={onCloseGuide} className="mt-4 w-full bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 text-sm font-bold py-2 rounded-lg transition-colors">
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MomentsPage;
