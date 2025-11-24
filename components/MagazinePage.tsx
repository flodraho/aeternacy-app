import React, { useState } from 'react';
import { Page, UserTier, Moment, Journey } from '../types';
import { ArrowLeft, BookOpen, Download, Sparkles, LayoutTemplate, PenLine, Award, Calendar, Check, X, Loader2 } from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';
import { TOKEN_COSTS } from '../services/costCatalog';
import Tooltip from './Tooltip';

interface MagazinePageProps {
  onNavigate: (page: Page) => void;
  userTier: UserTier;
  moments: Moment[];
  journeys: Journey[];
  triggerConfirmation: (cost: number, featureKey: string, onConfirm: () => Promise<any>, message?: string) => void;
}

const layouts = [
    { name: 'Minimalist', description: 'Clean, modern, and spacious.' },
    { name: 'Chronicle', description: 'Classic, text-focused, and elegant.' },
    { name: 'Emotive', description: 'Visually driven with bold imagery.' }
];

const MagazinePage: React.FC<MagazinePageProps> = ({ onNavigate, userTier, moments, journeys, triggerConfirmation }) => {
  const [selectedItem, setSelectedItem] = useState<Moment | Journey | null>(null);
  const [isDesignStudioOpen, setIsDesignStudioOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(layouts[0].name);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState<{ title?: string; foreword?: string }>({});

  const isLegacyUser = userTier === 'legacy';
  const canCreate = userTier !== 'free';

  const handleItemSelect = (item: Moment | Journey) => {
    setSelectedItem(item);
    setEnhancedContent({});
    setIsDesignStudioOpen(true);
  };
  
  const handleEnhance = async (type: 'title' | 'foreword') => {
      setIsEnhancing(true);
      // Simulate AI call
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (type === 'title') {
          setEnhancedContent(prev => ({ ...prev, title: `A Deeper Look: ${selectedItem?.title}`}));
      } else {
          setEnhancedContent(prev => ({ ...prev, foreword: `In this reflective piece, we delve into the heart of "${selectedItem?.title}", an experience that...`}));
      }
      setIsEnhancing(false);
  };
  
  const executeDownload = async () => {
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Your mægazine PDF download has started!');
    setIsDesignStudioOpen(false);
    console.log("TELEMETRY: token_used, feature: MAGAZINE_ISSUE, cost: " + TOKEN_COSTS.MAGAZINE_ISSUE);
  }

  const handleDownload = () => {
    if (!canCreate) {
        onNavigate(Page.Subscription);
        return;
    }

    if (!isLegacyUser) {
        // For non-legacy paying users, give them the option to use tokens or upgrade
        const wantsToProceed = window.confirm(
            `This creation costs ${TOKEN_COSTS.MAGAZINE_ISSUE} Tokæn.\n\nLægacy members receive annual credits for these creations.\n\nPress OK to use your Tokæn, or Cancel to explore upgrade options.`
        );
        if (wantsToProceed) {
            triggerConfirmation(TOKEN_COSTS.MAGAZINE_ISSUE, 'MAGAZINE_ISSUE', executeDownload);
        } else {
            onNavigate(Page.Subscription);
        }
    } else {
        // Legacy user flow
        triggerConfirmation(TOKEN_COSTS.MAGAZINE_ISSUE, 'MAGAZINE_ISSUE', executeDownload);
    }
  }

  return (
    <div className="animate-fade-in-up">
        <section className="relative h-[50vh] flex items-center justify-center text-white text-center overflow-hidden">
            <div className="absolute inset-0 bg-black">
                <img src="https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Person looking at a photobook" className="w-full h-full object-cover opacity-30" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            <div className="relative z-10 p-6">
                <button onClick={() => onNavigate(Page.Shop)} className="absolute top-[-4rem] left-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                    <ArrowLeft className="w-4 h-4" /> Back to Shop
                </button>
                <h1 className="text-5xl md:text-7xl font-bold font-brand" style={{textShadow: '0 2px 15px rgba(0,0,0,0.5)'}}>The Mægazine Studio</h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
                    Transform your digital memories into tangible works of art. Design and download bespoke mægazines from your moments and journæys.
                </p>
            </div>
        </section>
        
        <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* On-Demand Mægazines */}
                <div className="bg-gray-800/50 p-8 rounded-2xl ring-1 ring-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-8 h-8 text-cyan-400" />
                    <h2 className="text-3xl font-bold font-brand">On-Demand Mægazines</h2>
                </div>
                <p className="text-slate-400 mb-6">Select any momænt or journæy from your timestream to instantly create a beautiful, personalized mægazine.</p>
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                    {moments.filter(m => m.type !== 'insight' && m.type !== 'collection' && m.type !== 'fæmilyStoryline').map(item => (
                        <button key={`moment-${item.id}`} onClick={() => handleItemSelect(item)} className="w-full text-left bg-slate-700/50 hover:bg-slate-700 p-3 rounded-lg flex items-center gap-4 transition-colors">
                            <img src={item.image || item.images?.[0]} alt={item.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0"/>
                            <div className="overflow-hidden">
                                <p className="font-bold text-white truncate">{item.title}</p>
                                <p className="text-xs text-slate-400">{item.date}</p>
                            </div>
                        </button>
                    ))}
                    {journeys.map(item => (
                        <button key={`journey-${item.id}`} onClick={() => handleItemSelect(item)} className="w-full text-left bg-slate-700/50 hover:bg-slate-700 p-3 rounded-lg flex items-center gap-4 transition-colors">
                            <img src={item.coverImage} alt={item.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0"/>
                            <div className="overflow-hidden">
                                <p className="font-bold text-white truncate">{item.title}</p>
                                <p className="text-xs text-slate-400">{item.momentIds.length} momænts</p>
                            </div>
                        </button>
                    ))}
                </div>
                </div>
                
                {/* Quarterly Subscription */}
                <div className="bg-gray-800/50 p-8 rounded-2xl ring-1 ring-amber-500/30">
                <div className="flex items-center gap-3 mb-6">
                    <Award className="w-8 h-8 text-amber-300" />
                    <h2 className="text-3xl font-bold font-brand">The Quarterly Subscription</h2>
                </div>
                <p className="text-slate-400 mb-6">Every three months, æterny automatically curates your most significant moments into a stunning new issue, delivered directly to your studio.</p>
                {isLegacyUser ? (
                    <div className="bg-amber-900/40 p-6 rounded-lg ring-1 ring-amber-500/50">
                        <div className="flex items-center gap-3 text-amber-300 font-semibold mb-4">
                            <Check className="w-5 h-5"/>
                            <span>Lægacy Subscription Active</span>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">Your next issue, <span className="font-bold">"Summer 2024 Retrospective"</span>, is currently being curated.</p>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `75%` }}></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Available on October 1, 2024</p>
                    </div>
                ) : (
                    <div className="bg-slate-900/50 p-6 rounded-lg text-center">
                        <p className="text-slate-300 mb-4">This is an exclusive feature for <span className="font-bold text-amber-300">Lægacy</span> members.</p>
                        <button onClick={() => onNavigate(Page.Subscription)} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-full transition-colors">Upgrade to Lægacy</button>
                    </div>
                )}
                </div>
            </div>

            {isDesignStudioOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsDesignStudioOpen(false)}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold font-brand text-white">Mægazine Design Studio</h2>
                            <button onClick={() => setIsDesignStudioOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
                        </div>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-6 overflow-y-auto">
                            {/* Preview */}
                            <div className="lg:col-span-3 bg-black/20 p-4 rounded-lg flex items-center justify-center">
                                <div className="w-full max-w-md aspect-[8.5/11] bg-slate-700 rounded-md shadow-lg p-6 flex flex-col text-center">
                                    <p className="text-sm font-semibold text-cyan-400">æternacy Mægazine</p>
                                    <div className="flex-grow flex items-center justify-center">
                                        <h3 className="text-4xl font-brand font-bold text-white">{enhancedContent.title || selectedItem.title}</h3>
                                    </div>
                                    <img src={'momentIds' in selectedItem ? selectedItem.coverImage : (selectedItem.image || selectedItem.images?.[0])} alt="Cover" className="w-full h-48 object-cover rounded"/>
                                </div>
                            </div>
                            {/* Controls */}
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h4 className="font-bold text-white flex items-center gap-2 mb-3"><LayoutTemplate className="w-5 h-5 text-cyan-400"/> Choose a Layout</h4>
                                    <div className="space-y-2">
                                        {layouts.map(layout => (
                                            <button key={layout.name} onClick={() => setSelectedLayout(layout.name)} className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${selectedLayout === layout.name ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                                                <p className="font-semibold text-white">{layout.name}</p>
                                                <p className="text-xs text-slate-400">{layout.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 text-cyan-400"/> Enhance with æterny</h4>
                                    <div className="space-y-2">
                                        <button disabled={isEnhancing} onClick={() => handleEnhance('title')} className="w-full text-sm bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-2">
                                            {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin"/> : <PenLine className="w-4 h-4" />} Suggest a Cover Title
                                        </button>
                                        <button disabled={isEnhancing} onClick={() => handleEnhance('foreword')} className="w-full text-sm bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-2">
                                            {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin"/> : <PenLine className="w-4 h-4" />} Generate a Foreword
                                        </button>
                                        {enhancedContent.foreword && <p className="text-xs italic text-slate-400 p-2 border-l-2 border-cyan-500">"{enhancedContent.foreword}"</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-700 mt-auto flex justify-end items-center">
                            <button onClick={handleDownload} className="font-bold py-2 px-6 rounded-full transition-colors flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white">
                                <Download className="w-4 h-4"/> Create Mægazine
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default MagazinePage;