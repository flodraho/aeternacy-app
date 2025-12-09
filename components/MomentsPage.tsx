
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Moment, Page, Journey, UserTier } from '../types';
import GridView from './GridView';
import TimelineView from './TimelineView';
import { LayoutGrid, List, MoreVertical, User, Users, Plus, X, Share2, Filter, Search, Map as MapIcon, Calendar, ArrowUpRight, Plane, Heart, Mountain, Minus, ZoomIn, ArrowDownWideNarrow, Sparkles, Smile, History, Loader2, BrainCircuit } from 'lucide-react';
import ShareModal from './ShareModal';
import { semanticSearch, SearchResult } from '../services/geminiService';

interface MomentsPageProps {
    moments: Moment[];
    journeys: Journey[];
    onCreateJourney: (title: string, description: string, momentIds: number[]) => void;
    onPinToggle: (id: number) => void;
    onSelectMoment: (moment: Moment) => void;
    onItemUpdate: (item: Moment | Journey) => void;
    onShareToFamily: (item: Moment | Journey) => void;
    userTier: UserTier;
    onNavigate: (page: Page) => void;
    newMomentId?: number | null;
    deletingMomentId?: number | null;
    showGuide?: boolean;
    onCloseGuide?: () => void;
}

type ViewMode = 'grid' | 'timeline';
type CollectionMode = 'moments' | 'journeys' | 'shared';
type SortMode = 'date-desc' | 'date-asc' | 'emotional' | 'togetherness';

// Helper to group moments based on current sort mode
const groupMoments = (moments: Moment[], sortMode: SortMode) => {
    const groups: { [key: string]: Moment[] } = {};
    
    moments.forEach(m => {
        let key = 'Other';
        if (sortMode === 'date-desc' || sortMode === 'date-asc') {
            key = new Date(m.date).getFullYear().toString();
        } else if (sortMode === 'emotional') {
            key = m.emotion ? m.emotion.charAt(0).toUpperCase() + m.emotion.slice(1) : 'Uncategorized';
        } else if (sortMode === 'togetherness') {
            const count = m.people?.length || 0;
            key = count === 0 ? 'Solo' : count === 1 ? '1 Person' : count < 4 ? 'Small Group' : 'Large Group';
        }
        
        if (!groups[key]) groups[key] = [];
        groups[key].push(m);
    });

    return Object.entries(groups).sort((a, b) => {
        if (sortMode === 'date-desc') return Number(b[0]) - Number(a[0]);
        if (sortMode === 'date-asc') return Number(a[0]) - Number(b[0]);
        return a[0].localeCompare(b[0]);
    });
};

// --- Smart Cluster Component ---
const SmartClusterCard: React.FC<{ title: string, count: number, icon: React.ElementType, color: string, onClick: () => void }> = ({ title, count, icon: Icon, color, onClick }) => (
    <button onClick={onClick} className="flex-shrink-0 relative w-48 h-32 bg-slate-800 rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-white/20 transition-all group">
        <div className={`absolute top-3 left-3 w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-3 left-3 text-left">
            <p className="text-white font-bold text-sm">{title}</p>
            <p className="text-xs text-slate-400">{count} moments</p>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>
    </button>
);

const MomentsPage: React.FC<MomentsPageProps> = ({ moments, journeys, onCreateJourney, onPinToggle, onSelectMoment, onItemUpdate, onShareToFamily, userTier, onNavigate, newMomentId, deletingMomentId, showGuide, onCloseGuide }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [shareTarget, setShareTarget] = useState<Moment | Journey | null>(null);
    const [mode, setMode] = useState<CollectionMode>('moments');
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [journeyTitle, setJourneyTitle] = useState('');
    const [journeyDescription, setJourneyDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Semantic Search State
    const [isSemanticSearching, setIsSemanticSearching] = useState(false);
    const [semanticResults, setSemanticResults] = useState<SearchResult[] | null>(null);
    
    // Zoom/Density State: 0 (Micro) to 3 (Immersive)
    const [zoomLevel, setZoomLevel] = useState<number>(2);
    
    // AI Filtering & Sorting
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
    const [sortMode, setSortMode] = useState<SortMode>('date-desc');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    
    const currentUserId = 'JD';

    // Semantic Search Handler via Form Submit
    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSemanticResults(null);
            return;
        }
        
        // Always trigger semantic search on Submit to provide reasoning
        setIsSemanticSearching(true);
        try {
            const results = await semanticSearch(searchQuery, moments);
            setSemanticResults(results);
        } catch (error) {
            console.error("Semantic search failed", error);
            // On error, we rely on standard filtering which happens automatically via the searchQuery state
            setSemanticResults(null);
        } finally {
            setIsSemanticSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSemanticResults(null);
    };

    // Generate Smart Filters from Content
    const smartFilters = useMemo(() => {
        const counts: Record<string, { count: number, type: 'year' | 'emotion' | 'location' | 'person' }> = {};
        moments.forEach(m => {
            const year = new Date(m.date).getFullYear().toString();
            counts[year] = { count: (counts[year]?.count || 0) + 1, type: 'year' };
            if (m.emotion) {
                const emo = m.emotion.charAt(0).toUpperCase() + m.emotion.slice(1);
                counts[emo] = { count: (counts[emo]?.count || 0) + 1, type: 'emotion' };
            }
            if (m.location) {
                const loc = m.location.split(',')[0].trim();
                counts[loc] = { count: (counts[loc]?.count || 0) + 1, type: 'location' };
            }
        });
        return Object.entries(counts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 15)
            .map(([label, data]) => ({ label, ...data }));
    }, [moments]);

    // Filter moments based on mode, search (semantic or text), and filters
    const filteredMoments = useMemo(() => {
        let base = moments;
        
        // Tab Mode Filter
        if (mode === 'moments') base = base.filter(m => !m.createdBy || m.createdBy === currentUserId);
        if (mode === 'shared') base = base.filter(m => m.createdBy && m.createdBy !== currentUserId);
        
        // Semantic Search Results take precedence
        if (semanticResults) {
            const resultIds = new Set(semanticResults.map(r => r.id));
            base = base.filter(m => resultIds.has(m.id));
            // Sort by relevance (order in semanticResults)
            base.sort((a, b) => {
                const indexA = semanticResults.findIndex(r => r.id === a.id);
                const indexB = semanticResults.findIndex(r => r.id === b.id);
                return indexA - indexB;
            });
        } 
        // Standard Text Search (while typing or fallback)
        else if (searchQuery) {
            const q = searchQuery.toLowerCase();
            base = base.filter(m => 
                m.title.toLowerCase().includes(q) || 
                m.description.toLowerCase().includes(q) ||
                m.location?.toLowerCase().includes(q)
            );
        }

        // Smart Filters (AND logic)
        if (activeFilters.size > 0) {
            base = base.filter(m => {
                const year = new Date(m.date).getFullYear().toString();
                const emo = m.emotion ? m.emotion.charAt(0).toUpperCase() + m.emotion.slice(1) : '';
                const loc = m.location ? m.location.split(',')[0].trim() : '';
                return activeFilters.has(year) || activeFilters.has(emo) || activeFilters.has(loc);
            });
        }
        
        return base;
    }, [moments, mode, searchQuery, semanticResults, activeFilters, currentUserId]);

    // Group filtered moments based on sort mode
    const groupedMoments = useMemo(() => groupMoments(filteredMoments, semanticResults ? 'relevance' as any : sortMode), [filteredMoments, sortMode, semanticResults]);

    // Smart Clusters Data
    const clusters = useMemo(() => [
        { title: 'Travel Adventures', count: filteredMoments.filter(m => m.emotion === 'adventure').length, icon: Plane, color: 'bg-blue-500' },
        { title: 'Family Gatherings', count: filteredMoments.filter(m => m.people?.includes('Family')).length, icon: Users, color: 'bg-indigo-500' },
        { title: 'Nature & Peace', count: filteredMoments.filter(m => m.emotion === 'peace').length, icon: Mountain, color: 'bg-emerald-500' },
        { title: 'Celebrations', count: filteredMoments.filter(m => m.activities?.includes('Celebration')).length, icon: Heart, color: 'bg-rose-500' },
    ], [filteredMoments]);

    const handleToggleSelection = (momentId: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(momentId)) newSet.delete(momentId);
            else newSet.add(momentId);
            return newSet;
        });
    };
    
    const toggleSmartFilter = (label: string) => {
        setActiveFilters(prev => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            return next;
        });
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

    const getFilterIcon = (type: string) => {
        switch (type) {
            case 'year': return <Calendar className="w-3 h-3" />;
            case 'emotion': return <Heart className="w-3 h-3" />;
            case 'location': return <MapIcon className="w-3 h-3" />;
            default: return <Sparkles className="w-3 h-3" />;
        }
    };

    return (
        <div className="container mx-auto px-6 pt-28 pb-20 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-brand mb-2">My Collection</h1>
                    <p className="text-slate-400">
                        {filteredMoments.length} moments • {semanticResults ? 'Semantic Results' : activeFilters.size > 0 ? 'Filtered View' : 'All Time'}
                    </p>
                </div>
                
                {/* Semantic Search & Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <form onSubmit={handleSearchSubmit} className="relative flex-grow md:flex-grow-0 group">
                        <div className={`absolute inset-0 bg-cyan-500/20 rounded-full blur-md transition-opacity ${isSemanticSearching ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
                        <input 
                            type="text" 
                            placeholder="Search feelings, memories..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`relative z-10 w-full md:w-72 bg-slate-800/50 border ${isSemanticSearching ? 'border-cyan-500/50' : 'border-white/10'} rounded-full py-2.5 pl-10 pr-10 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all`}
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                            {isSemanticSearching ? <Loader2 className="w-4 h-4 text-cyan-400 animate-spin"/> : <BrainCircuit className={`w-4 h-4 ${searchQuery.length > 10 ? 'text-cyan-400' : 'text-slate-500'}`} />}
                        </div>
                        {searchQuery && (
                            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-slate-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                    <div className="h-8 w-px bg-white/10 mx-1"></div>
                    
                    {/* View Toggle */}
                    <div className="flex bg-slate-800/50 rounded-full p-1 border border-white/10">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('timeline')} className={`p-2 rounded-full transition-all ${viewMode === 'timeline' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><List className="w-4 h-4" /></button>
                    </div>

                    {/* Magic Sort Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                            className={`p-2.5 rounded-full border transition-all ${isSortMenuOpen || sortMode !== 'date-desc' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:text-white'}`}
                        >
                            <ArrowDownWideNarrow className="w-4 h-4" />
                        </button>
                        {isSortMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
                                <div className="p-2">
                                    <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Magic Sort</div>
                                    <button onClick={() => { setSortMode('date-desc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${sortMode === 'date-desc' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <History className="w-4 h-4"/> Chronological
                                    </button>
                                    <button onClick={() => { setSortMode('emotional'); setIsSortMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${sortMode === 'emotional' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <Heart className="w-4 h-4"/> Emotional Arc
                                    </button>
                                    <button onClick={() => { setSortMode('togetherness'); setIsSortMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${sortMode === 'togetherness' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <Users className="w-4 h-4"/> Togetherness
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Smart Filter Rail */}
            <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 px-1 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap mr-2">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> Suggested
                </div>
                {smartFilters.map(filter => {
                    const isActive = activeFilters.has(filter.label);
                    return (
                        <button
                            key={filter.label}
                            onClick={() => toggleSmartFilter(filter.label)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
                                isActive 
                                ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                                : 'bg-slate-800/50 text-slate-300 border-white/10 hover:border-white/30 hover:bg-slate-800'
                            }`}
                        >
                            {getFilterIcon(filter.type)}
                            {filter.label}
                            <span className={`ml-1 opacity-60 text-[10px] ${isActive ? 'text-white' : 'text-slate-500'}`}>{filter.count}</span>
                        </button>
                    )
                })}
                {activeFilters.size > 0 && (
                    <button onClick={() => setActiveFilters(new Set())} className="ml-2 text-xs text-slate-400 hover:text-white underline decoration-dotted">
                        Clear all
                    </button>
                )}
            </div>

            {/* Semantic Search Context Rail - Display "Why" */}
            {semanticResults && semanticResults.length > 0 && (
                <div className="mb-8 p-4 bg-cyan-900/20 border border-cyan-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-cyan-300 text-sm font-bold">
                        <BrainCircuit className="w-4 h-4"/> Semantic Matches found:
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {semanticResults.slice(0, 3).map(res => {
                            const m = moments.find(moment => moment.id === res.id);
                            if(!m) return null;
                            return (
                                <div key={res.id} className="min-w-[250px] bg-slate-900/50 p-3 rounded-lg border border-white/5 text-xs">
                                    <p className="font-bold text-white truncate mb-1">{m.title}</p>
                                    <p className="text-slate-400 italic">"{res.reason}"</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Discovery Rail - Smart Clusters (Hidden when searching/filtering) */}
            {mode === 'moments' && !searchQuery && activeFilters.size === 0 && (
                <div className="mb-12 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                    <div className="flex gap-4 min-w-max">
                         <div className="flex flex-col justify-center pr-4 border-r border-white/10">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Quick Access</span>
                            <h3 className="text-white font-bold text-lg">Smart<br/>Clusters</h3>
                         </div>
                         {clusters.map(cluster => (
                             <SmartClusterCard 
                                key={cluster.title} 
                                {...cluster} 
                                onClick={() => setSearchQuery(cluster.title.split(' ')[0])}
                             />
                         ))}
                    </div>
                </div>
            )}

            {/* Mode Tabs */}
            <div className="flex border-b border-slate-800 mb-10">
                {['moments', 'journeys', 'shared'].map((m) => (
                    <button 
                        key={m}
                        onClick={() => { setMode(m as CollectionMode); setIsSelecting(false); }} 
                        className={`px-6 py-3 font-semibold transition-all border-b-2 ${mode === m ? 'text-white border-cyan-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                        {m === 'moments' ? 'Timeline' : m === 'journeys' ? 'Journæys' : 'Shared'}
                    </button>
                ))}
            </div>
            
            {/* Selection Toolbar */}
             {isSelecting && (
                <div className="sticky top-24 z-30 mb-8 animate-fade-in-down">
                    <div className="bg-cyan-900/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 flex justify-between items-center shadow-2xl">
                         <span className="text-cyan-100 font-semibold px-2">{selectedIds.size} selected</span>
                         <div className="flex gap-3">
                            <button onClick={() => setIsSelecting(false)} className="px-4 py-2 text-sm font-semibold text-cyan-200 hover:text-white">Cancel</button>
                            <button onClick={() => setIsCreateModalOpen(true)} disabled={selectedIds.size === 0} className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                Create Journæy
                            </button>
                         </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {mode === 'journeys' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {journeys.map(journey => (
                        <div key={journey.id} className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer ring-1 ring-white/10 shadow-2xl transition-all hover:scale-[1.02]">
                             <img src={journey.coverImage} alt={journey.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
                             <div className="absolute bottom-0 left-0 p-6">
                                 <h3 className="text-2xl font-bold text-white font-brand">{journey.title}</h3>
                                 <p className="text-slate-300 text-sm mt-1 line-clamp-2">{journey.description}</p>
                                 <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
                                     {journey.momentIds.length} Moments <ArrowUpRight className="w-3 h-3" />
                                 </div>
                             </div>
                        </div>
                    ))}
                 </div>
            ) : (
                <div className="relative flex gap-8">
                    {/* Timeline Scrubber (Desktop Only) */}
                    <div className="hidden xl:block w-16 sticky top-32 h-[calc(100vh-200px)] flex flex-col justify-start gap-2 pt-4">
                         {groupedMoments.map(([group]) => (
                             <a href={`#group-${group}`} key={group} className="text-xs font-bold text-slate-600 hover:text-cyan-400 transition-colors text-right pr-4 border-r-2 border-transparent hover:border-cyan-400 py-1 truncate w-full" title={group}>
                                 {group}
                             </a>
                         ))}
                    </div>

                    {/* The Grid */}
                    <div className="flex-grow space-y-16">
                        {groupedMoments.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-20"/>
                                <p>No moments found matching your criteria.</p>
                                <button onClick={() => { setActiveFilters(new Set()); setSearchQuery(''); setSemanticResults(null); }} className="mt-4 text-cyan-400 hover:underline">Clear filters</button>
                            </div>
                        ) : (
                            groupedMoments.map(([group, groupMoments]) => (
                                <div key={group} id={`group-${group}`} className="scroll-mt-32">
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2 className="text-3xl font-bold text-white font-brand">{group}</h2>
                                        <div className="h-px bg-slate-800 flex-grow"></div>
                                        <span className="text-xs font-mono text-slate-500">{groupMoments.length} moments</span>
                                    </div>
                                    
                                    {viewMode === 'grid' ? (
                                        <GridView 
                                            moments={groupMoments} 
                                            onPinToggle={onPinToggle} 
                                            onSelectMoment={onSelectMoment} 
                                            onShare={(m) => setShareTarget(m)} 
                                            onNavigate={onNavigate} 
                                            isSelecting={isSelecting}
                                            selectedIds={selectedIds}
                                            onToggleSelection={handleToggleSelection}
                                            zoomLevel={zoomLevel}
                                        />
                                    ) : (
                                        <TimelineView moments={groupMoments} onPinToggle={onPinToggle} onSelectMoment={onSelectMoment} onShare={(m) => setShareTarget(m)} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Floating Create Action & Zoom Controls */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4">
                {!isSelecting && mode === 'moments' && (
                    <button 
                        onClick={() => { setIsSelecting(true); setViewMode('grid'); }}
                        className="bg-slate-900/80 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2 text-sm font-bold"
                    >
                        <Plus className="w-4 h-4 text-cyan-400"/> Select
                    </button>
                )}
                
                {/* Zoom Control Slider */}
                {viewMode === 'grid' && mode === 'moments' && (
                    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-2 rounded-full shadow-2xl flex items-center gap-3 px-4">
                        <button 
                            onClick={() => setZoomLevel(Math.max(0, zoomLevel - 1))} 
                            disabled={zoomLevel === 0}
                            className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        
                        <div className="w-24 relative flex items-center">
                            <input 
                                type="range" 
                                min="0" 
                                max="3" 
                                step="1" 
                                value={zoomLevel} 
                                onChange={(e) => setZoomLevel(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            {/* Ticks */}
                            <div className="absolute inset-0 flex justify-between pointer-events-none px-0.5">
                                {[0,1,2,3].map(i => <div key={i} className={`w-1 h-1 rounded-full ${i === zoomLevel ? 'bg-cyan-400' : 'bg-slate-600'}`}></div>)}
                            </div>
                        </div>

                        <button 
                            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 1))} 
                            disabled={zoomLevel === 3}
                            className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Create Journey Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-white/10" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold font-brand text-white mb-6">Name Your Journæy</h2>
                        <form onSubmit={handleFinalizeJourney} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={journeyTitle} 
                                    onChange={e => setJourneyTitle(e.target.value)} 
                                    placeholder="e.g., Summer in Italy 2023" 
                                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Description (Optional)</label>
                                <textarea 
                                    value={journeyDescription} 
                                    onChange={e => setJourneyDescription(e.target.value)} 
                                    placeholder="What made this time special?" 
                                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none h-32 resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                                <button type="submit" disabled={!journeyTitle.trim()} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

             {shareTarget && (
                <ShareModal 
                    item={shareTarget}
                    onClose={() => setShareTarget(null)}
                    onUpdateItem={onItemUpdate}
                    onShareToFamily={onShareToFamily}
                    userTier={userTier}
                />
            )}
        </div>
    );
};

export default MomentsPage;
