
import React, { useState, useMemo } from 'react';
import { Moment, Page, Journey, UserTier } from '../types';
import GridView from './GridView';
import TimelineView from './TimelineView';
import { LayoutGrid, List, Filter, MoreVertical, Check, Search, Users, Share2, ArrowLeft } from 'lucide-react';
import ShareModal from './ShareModal';

interface FamilyMomentsPageProps {
    moments: Moment[];
    journeys: Journey[];
    onPinToggle: (id: number) => void;
    onSelectMoment: (moment: Moment) => void;
    onItemUpdate: (item: Moment | Journey) => void;
    onShareToFamily: (item: Moment | Journey) => void;
    userTier: UserTier;
    onNavigate: (page: Page) => void;
    newMomentId?: number | null;
    deletingMomentId?: number | null;
}

type ViewMode = 'grid' | 'timeline';
type FilterMode = 'all' | 'byMe' | 'byOthers';
type FamilyViewMode = 'moments' | 'journeys';

const JourneyCard: React.FC<{ journey: Journey; onClick: () => void; onShare: () => void; }> = ({ journey, onClick, onShare }) => (
    <div onClick={onClick} className="relative aspect-[10/7] cursor-pointer group p-4">
        <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors">
                <Share2 className="w-5 h-5 text-slate-300" />
            </button>
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


const FamilyMomentsPage: React.FC<FamilyMomentsPageProps> = (props) => {
    const { moments, journeys, onPinToggle, onSelectMoment, onItemUpdate, onShareToFamily, userTier, onNavigate, newMomentId, deletingMomentId } = props;
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [shareTarget, setShareTarget] = useState<Moment | Journey | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterMode>('all');
    const [familyView, setFamilyView] = useState<FamilyViewMode>('moments');

    const currentUserId = 'JD';

    const filteredAndSearchedMoments = useMemo(() => {
        let processedMoments = moments;

        switch (activeFilter) {
            case 'byMe':
                processedMoments = moments.filter(m => m.createdBy === currentUserId);
                break;
            case 'byOthers':
                processedMoments = moments.filter(m => m.createdBy && m.createdBy !== currentUserId);
                break;
            case 'all':
            default:
                break;
        }

        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            processedMoments = processedMoments.filter(m => 
                m.title.toLowerCase().includes(lowercasedQuery) ||
                m.description.toLowerCase().includes(lowercasedQuery) ||
                m.location?.toLowerCase().includes(lowercasedQuery) ||
                m.people?.some(p => p.toLowerCase().includes(lowercasedQuery)) ||
                m.activities?.some(a => a.toLowerCase().includes(lowercasedQuery))
            );
        }

        return processedMoments;
    }, [moments, activeFilter, searchQuery, currentUserId]);
    
    const handleFilterChange = (filter: FilterMode) => {
        setActiveFilter(filter);
        setIsFilterOpen(false);
    };


    return (
        <div className="container mx-auto px-6 pt-28 pb-8">
            <div className="mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-xl flex items-center justify-center ring-1 ring-indigo-500/20">
                        <Users className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">Fæmily Collection</h1>
                        <p className="text-slate-400 mt-2">A shared space for your family's most cherished memories, woven together.</p>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-slate-700 mb-6">
                <button onClick={() => setFamilyView('moments')} className={`px-4 py-2 font-semibold transition-colors ${familyView === 'moments' ? 'text-white border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>
                    Shared Momænts
                </button>
                <button onClick={() => setFamilyView('journeys')} className={`px-4 py-2 font-semibold transition-colors ${familyView === 'journeys' ? 'text-white border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>
                    Shared Journæys
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={`Search ${familyView}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-full py-2 pl-10 pr-4 text-sm w-64 bg-slate-800 border border-slate-700 placeholder-slate-400 text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-400"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {familyView === 'moments' && (
                        <>
                            <button onClick={() => setViewMode('grid')} className={`p-3 rounded-full transition-colors bg-gray-800/80 border border-white/10 ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/5'}`}>
                                <LayoutGrid className="w-5 h-5 text-white" />
                            </button>
                            <button onClick={() => setViewMode('timeline')} className={`p-3 rounded-full transition-colors bg-gray-800/80 border border-white/10 ${viewMode === 'timeline' ? 'bg-white/20' : 'hover:bg-white/5'}`}>
                                <List className="w-5 h-5 text-white" />
                            </button>
                        </>
                    )}
                    <div className="relative">
                        <button onClick={() => setIsFilterOpen(prev => !prev)} className="p-3 rounded-full bg-gray-800/80 border border-white/10 hover:bg-white/5 transition-colors relative">
                            <Filter className="w-5 h-5 text-white" />
                            {activeFilter !== 'all' && <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-400 rounded-full"></div>}
                        </button>
                         {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-white/10 z-10">
                                <button onClick={() => handleFilterChange('all')} className="w-full text-left flex items-center justify-between gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                    <span>All Shared</span>
                                    {activeFilter === 'all' && <Check className="w-4 h-4 text-indigo-400"/>}
                                </button>
                                <button onClick={() => handleFilterChange('byMe')} className="w-full text-left flex items-center justify-between gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                    <span>Created by Me</span>
                                    {activeFilter === 'byMe' && <Check className="w-4 h-4 text-indigo-400"/>}
                                </button>
                                <button onClick={() => handleFilterChange('byOthers')} className="w-full text-left flex items-center justify-between gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                    <span>Created by Others</span>
                                    {activeFilter === 'byOthers' && <Check className="w-4 h-4 text-indigo-400"/>}
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="p-3 rounded-full bg-gray-800/80 border border-white/10 hover:bg-white/5 transition-colors">
                        <MoreVertical className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
            
            {familyView === 'moments' ? (
                viewMode === 'grid' ? (
                    <GridView moments={filteredAndSearchedMoments} onPinToggle={onPinToggle} onSelectMoment={onSelectMoment} onShare={(moment) => setShareTarget(moment)} onNavigate={onNavigate} newMomentId={newMomentId} deletingMomentId={deletingMomentId} zoomLevel={2} />
                ) : (
                    <TimelineView moments={filteredAndSearchedMoments} onPinToggle={onPinToggle} onSelectMoment={onSelectMoment} onShare={(moment) => setShareTarget(moment)} newMomentId={newMomentId} deletingMomentId={deletingMomentId} />
                )
            ) : (
                <div>
                    {journeys.length === 0 ? (
                        <div className="text-center py-16 px-6 text-slate-500 bg-slate-800/30 rounded-lg">
                            <p className="font-semibold text-lg text-slate-400 mb-2">No Shared Journæys Yet.</p>
                            <p>Share a journæy from your personal collection to see it here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {journeys.map(journey => (
                                <JourneyCard key={journey.id} journey={journey} onClick={() => {
                                    // Future: navigate to a family journey detail view
                                }} onShare={() => setShareTarget(journey)} />
                            ))}
                        </div>
                    )}
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
        </div>
    );
};

export default FamilyMomentsPage;
