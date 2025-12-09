
import React, { useState, useMemo } from 'react';
import { Moment, Page } from '../types';
import { ArrowLeft, Wand2, Users, MapPin, Heart, Mountain, Plane, Check, X } from 'lucide-react';

interface SmartCollectionPageProps {
    moments: Moment[];
    onNavigate: (page: Page) => void;
    onCreateFocusMoment: (images: string[], title: string, description: string) => void;
}

type Suggestion = {
    key: string;
    title: string;
    description: string;
    icon: React.ElementType;
    moments: Moment[];
    images: string[];
};

const SmartCollectionPage: React.FC<SmartCollectionPageProps> = ({ moments, onNavigate, onCreateFocusMoment }) => {
    const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null);
    const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

    const suggestions = useMemo((): Suggestion[] => {
        const suggestionsMap = new Map<string, Suggestion>();

        // Theme 1: Travel
        const travelMoments = moments.filter(m => (m.location && m.location.toLowerCase() !== 'home') || m.activities?.some(a => ['travel', 'road trip', 'vacation'].includes(a.toLowerCase())));
        if (travelMoments.length > 1) {
            const images = travelMoments.flatMap(m => m.images || (m.image ? [m.image] : [])).filter(Boolean) as string[];
            if (images.length > 2) {
                suggestionsMap.set('travel', { key: 'travel', title: 'Travel Highlights', description: 'Revisit your journeys across different places.', icon: Plane, moments: travelMoments, images });
            }
        }
        
        // Theme 2: Celebrations
        const celebrationKeywords = ['wedding', 'celebration', 'birthday', 'holiday'];
        const celebrationMoments = moments.filter(m => m.activities?.some(a => celebrationKeywords.includes(a.toLowerCase())));
        if (celebrationMoments.length > 1) {
             const images = celebrationMoments.flatMap(m => m.images || (m.image ? [m.image] : [])).filter(Boolean) as string[];
             if (images.length > 2) {
                suggestionsMap.set('celebrations', { key: 'celebrations', title: 'Life\'s Celebrations', description: 'A collection of your most joyful events and milestones.', icon: Heart, moments: celebrationMoments, images });
             }
        }

        // Theme 3: Nature & Outdoors
        const natureKeywords = ['hiking', 'nature', 'mountains', 'yosemite', 'vineyard'];
        const natureMoments = moments.filter(m => 
            m.activities?.some(a => natureKeywords.includes(a.toLowerCase())) ||
            natureKeywords.some(keyword => (m.title + m.description).toLowerCase().includes(keyword))
        );
        if (natureMoments.length > 1) {
            const images = natureMoments.flatMap(m => m.images || (m.image ? [m.image] : [])).filter(Boolean) as string[];
            if (images.length > 2) {
                suggestionsMap.set('nature', { key: 'nature', title: 'Into the Wild', description: 'Moments of adventure and peace in the great outdoors.', icon: Mountain, moments: natureMoments, images });
            }
        }

        // Theme 4: People-based
        const peopleCounts = new Map<string, Moment[]>();
        moments.forEach(m => {
            m.people?.forEach(p => {
                if (p !== 'John Doe' && p !== 'Jane Doe' && p !== 'Family' && p !== 'Friends') {
                    if (!peopleCounts.has(p)) peopleCounts.set(p, []);
                    peopleCounts.get(p)!.push(m);
                }
            });
        });
        peopleCounts.forEach((moms, person) => {
            if (moms.length > 1) {
                const images = moms.flatMap(m => m.images || (m.image ? [m.image] : [])).filter(Boolean) as string[];
                if (images.length > 2) {
                    suggestionsMap.set(person, { key: person, title: `Moments with ${person}`, description: `A collection of memories you've shared together.`, icon: Users, moments: moms, images });
                }
            }
        });

        return Array.from(suggestionsMap.values());
    }, [moments]);

    const handleSuggestionClick = (suggestion: Suggestion) => {
        setActiveSuggestion(suggestion);
        setSelectedPhotos(new Set(suggestion.images));
    };

    const handleTogglePhoto = (photoUrl: string) => {
        setSelectedPhotos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(photoUrl)) {
                newSet.delete(photoUrl);
            } else {
                newSet.add(photoUrl);
            }
            return newSet;
        });
    };

    const handleCreateCollection = () => {
        if (!activeSuggestion || selectedPhotos.size === 0) return;
        
        const description = `A curated collection focusing on ${activeSuggestion.title.toLowerCase()}. ${activeSuggestion.description}`;
        onCreateFocusMoment(Array.from(selectedPhotos), activeSuggestion.title, description);
    };

    return (
        <div className="container mx-auto px-6 pt-28 pb-12 animate-fade-in-up">
            <button onClick={() => onNavigate(Page.Create)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Create
            </button>
            
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">Smart Collections</h1>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Rediscover your story. Let æterny find hidden themes in your moments and weave them into new, meaningful collections.</p>
            </div>

            <div className="space-y-12">
                <div>
                    <h2 className="text-2xl font-bold font-brand mb-6">æterny's Suggestions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {suggestions.map(suggestion => {
                            const Icon = suggestion.icon;
                            return (
                                <button key={suggestion.key} onClick={() => handleSuggestionClick(suggestion)} className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10 text-left flex flex-col hover:bg-gray-700/50 hover:ring-cyan-500/30 transition-all transform hover:-translate-y-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center ring-1 ring-cyan-500/20 flex-shrink-0">
                                            <Icon className="w-6 h-6 text-cyan-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{suggestion.title}</h3>
                                            <p className="text-xs text-slate-400">{suggestion.images.length} photos found in {suggestion.moments.length} momænts</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4 flex-grow">{suggestion.description}</p>
                                    <div className="flex -space-x-2 overflow-hidden mt-auto">
                                        {suggestion.images.slice(0, 5).map(img => (
                                            <img key={img} src={img} className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-800" alt="" />
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                         <div className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10 text-left flex flex-col justify-center items-center text-center">
                            <Wand2 className="w-8 h-8 text-slate-500 mb-2"/>
                            <h3 className="text-xl font-bold text-white">Create Your Own</h3>
                            <p className="text-slate-400 text-sm mt-2 mb-4">Curate a new collection from scratch based on people, places, dates, or keywords.</p>
                            <button className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors mt-auto">Coming Soon</button>
                        </div>
                    </div>
                </div>
            </div>

            {activeSuggestion && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setActiveSuggestion(null)}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-700 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold font-brand text-white">Review Photos for "{activeSuggestion.title}"</h2>
                                <p className="text-slate-400 text-sm">Deselect any photos you don't want to include in this new collection.</p>
                            </div>
                            <button onClick={() => setActiveSuggestion(null)} className="text-slate-400 hover:text-white"><X /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                {activeSuggestion.images.map(img => {
                                    const isSelected = selectedPhotos.has(img);
                                    return (
                                        <button key={img} onClick={() => handleTogglePhoto(img)} className="aspect-square relative rounded-lg overflow-hidden group">
                                            <img src={img} alt="" className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40'}`} />
                                            <div className={`absolute inset-0 ring-4 ring-inset transition-all ${isSelected ? 'ring-cyan-500' : 'ring-transparent'}`}></div>
                                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center bg-slate-900/50 ring-1 ring-white/50">
                                                {isSelected && <div className="w-3 h-3 rounded-full bg-cyan-500"></div>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 mt-auto flex justify-between items-center">
                            <p className="text-slate-300 font-semibold">{selectedPhotos.size} photos selected</p>
                            <button onClick={handleCreateCollection} disabled={selectedPhotos.size === 0} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:bg-gray-600">
                                Create Collection
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SmartCollectionPage;
