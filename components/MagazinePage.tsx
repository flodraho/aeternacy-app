
import React, { useState } from 'react';
import { Page, UserTier, Moment, Journey } from '../types';
import { ArrowLeft, BookOpen, Download, Sparkles, LayoutTemplate, PenLine, Award, Calendar, Check, X, Loader2, ArrowRight } from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';
import { TOKEN_COSTS } from '../services/costCatalog';

interface MagazinePageProps {
  onNavigate: (page: Page) => void;
  userTier: UserTier;
  moments: Moment[];
  journeys: Journey[];
  triggerConfirmation: (cost: number, featureKey: string, onConfirm: () => Promise<any>, message?: string) => void;
}

const tokenExplanation = `Using Tokæn ensures we can sustainably power the high-end AI servers needed to generate print-ready, high-resolution magazine layouts.`;

const layouts = [
    { name: 'Minimalist', description: 'Clean, modern, and spacious. Perfect for photography portfolios.' },
    { name: 'Chronicle', description: 'Classic editorial style. Best for narrative-heavy stories.' },
    { name: 'Emotive', description: 'Bold typography and full-bleed imagery. High impact.' }
];

const MagazinePage: React.FC<MagazinePageProps> = ({ onNavigate, userTier, moments, journeys, triggerConfirmation }) => {
  const [selectedItem, setSelectedItem] = useState<Moment | Journey | null>(null);
  const [isDesignStudioOpen, setIsDesignStudioOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(layouts[0].name);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState<{ title?: string; foreword?: string }>({});

  const isLegacyUser = userTier === 'legacy';

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
          setEnhancedContent(prev => ({ ...prev, foreword: `In this reflective piece, we delve into the heart of "${selectedItem?.title}", capturing the fleeting emotions and lasting impressions that defined this experience...`}));
      }
      setIsEnhancing(false);
  };
  
  const executeDownload = async () => {
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Your mægazine PDF download has started! A print-ready version has been sent to your email.');
    setIsDesignStudioOpen(false);
    console.log("TELEMETRY: token_spend_ok, feature: MAGAZINE_ISSUE, cost: " + TOKEN_COSTS.MAGAZINE_ISSUE);
  }

  const handleDownload = () => {
    if (!isLegacyUser) {
        onNavigate(Page.Subscription);
    } else {
        triggerConfirmation(TOKEN_COSTS.MAGAZINE_ISSUE, 'MAGAZINE_ISSUE', executeDownload, "Create and download this magazine issue?");
    }
  }

  return (
    <div className="container mx-auto px-6 pt-28 pb-12 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
          <button onClick={() => onNavigate(Page.Home)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
      </div>
      
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-white font-brand mb-4">The Mægazine Studio</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">Transform your digital memories into tangible works of art. Design bespoke mægazines or subscribe to our curated quarterly series.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        
        {/* On-Demand Mægazines - Left Column */}
        <div className="bg-slate-800/60 backdrop-blur-md p-10 rounded-3xl ring-1 ring-white/10 flex flex-col shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center ring-1 ring-cyan-500/20">
                    <BookOpen className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold font-brand text-white">On-Demand Issues</h2>
                    <p className="text-cyan-200/70 text-sm font-medium tracking-wide uppercase">Single Edition Creation</p>
                </div>
              </div>
              
              <p className="text-slate-300 mb-8 leading-relaxed">Select any momænt or journæy from your timestream to instantly curate a beautiful, personalized mægazine issue. Perfect for trips, events, or thoughtful gifts.</p>
              
              <div className="flex-grow bg-slate-900/50 rounded-xl p-4 ring-1 ring-white/5 overflow-y-auto max-h-[400px] space-y-3 custom-scrollbar">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest px-2 mb-2">Ready to Print</p>
                {moments.filter(m => m.type !== 'insight' && m.type !== 'collection' && m.type !== 'fæmilyStoryline').slice(0, 5).map(item => (
                    <button key={`moment-${item.id}`} onClick={() => handleItemSelect(item)} className="w-full text-left bg-slate-800 hover:bg-slate-700 p-3 rounded-lg flex items-center gap-4 transition-all group/item ring-1 ring-white/5 hover:ring-cyan-500/30">
                        <img src={item.image || item.images?.[0]} alt={item.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0 shadow-md group-hover/item:scale-105 transition-transform"/>
                        <div className="overflow-hidden flex-grow">
                            <p className="font-bold text-white truncate group-hover/item:text-cyan-300 transition-colors">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.date}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover/item:text-cyan-400 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                    </button>
                ))}
                {journeys.map(item => (
                     <button key={`journey-${item.id}`} onClick={() => handleItemSelect(item)} className="w-full text-left bg-slate-800 hover:bg-slate-700 p-3 rounded-lg flex items-center gap-4 transition-all group/item ring-1 ring-white/5 hover:ring-cyan-500/30">
                        <img src={item.coverImage} alt={item.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0 shadow-md group-hover/item:scale-105 transition-transform"/>
                        <div className="overflow-hidden flex-grow">
                            <p className="font-bold text-white truncate group-hover/item:text-cyan-300 transition-colors">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.momentIds.length} momænts • Journey</p>
                        </div>
                         <ArrowRight className="w-4 h-4 text-slate-500 group-hover/item:text-cyan-400 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                    </button>
                ))}
              </div>
           </div>
        </div>
        
        {/* Quarterly Subscription - Right Column */}
        <div className="bg-gradient-to-br from-slate-900 to-amber-950/20 backdrop-blur-md p-10 rounded-3xl ring-1 ring-amber-500/30 flex flex-col shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center ring-1 ring-amber-500/20">
                    <Award className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold font-brand text-white">The Archive Series</h2>
                    <p className="text-amber-200/70 text-sm font-medium tracking-wide uppercase">Quarterly Subscription</p>
                </div>
              </div>
              
              <p className="text-slate-300 mb-8 leading-relaxed">Let æterny automatically curate your life's chapters. Every three months, receive a stunning, professionally designed digital digest of your most significant moments.</p>
              
              <div className="flex-grow flex flex-col justify-center">
                  {isLegacyUser ? (
                      <div className="bg-black/30 p-8 rounded-2xl ring-1 ring-amber-500/30 backdrop-blur-sm">
                          <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-3 text-amber-400 font-bold tracking-wide text-sm uppercase">
                                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                                  Curating Now
                              </div>
                              <span className="text-xs text-slate-400 font-mono">Q3 2024</span>
                          </div>
                          
                          <h3 className="text-2xl font-bold text-white font-brand mb-2">"Summer 2024 Retrospective"</h3>
                          <p className="text-sm text-slate-400 mb-6">Estimated delivery: October 1, 2024</p>
                          
                          <div className="relative pt-2">
                              <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold">
                                  <span>Data Collection</span>
                                  <span>AI Analysis</span>
                                  <span>Layout Design</span>
                                  <span className="text-white">Review</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                                  <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-3 rounded-full relative" style={{ width: `75%` }}>
                                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 animate-pulse"></div>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="mt-8 flex gap-4">
                              <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg text-sm font-semibold transition-colors border border-white/10">View Past Issues</button>
                              <button className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-900 py-3 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-amber-900/20">Manage Sub</button>
                          </div>
                      </div>
                  ) : (
                      <div className="bg-slate-800/80 p-8 rounded-2xl text-center ring-1 ring-white/5">
                          <LegacyIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">Exclusive Lægacy Feature</h3>
                          <p className="text-slate-400 mb-6 text-sm">Upgrade to the Lægacy tier to unlock automated quarterly curation and build a library of your life's work without lifting a finger.</p>
                          <button onClick={() => onNavigate(Page.Subscription)} className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-amber-900/20">
                              Upgrade to Lægacy
                          </button>
                      </div>
                  )}
              </div>
           </div>
        </div>
      </div>

      {/* The Design Studio Modal */}
      {isDesignStudioOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in backdrop-blur-xl">
            <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col ring-1 ring-white/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex justify-between items-center px-6 bg-slate-950/50">
                    <div className="flex items-center gap-4">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-lg font-bold font-brand text-white tracking-wide">Mægazine Studio</h2>
                    </div>
                    <button onClick={() => setIsDesignStudioOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"><X size={20}/></button>
                </div>

                <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                    
                    {/* Left: Preview Canvas */}
                    <div className="flex-grow bg-slate-950 relative flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/30 to-slate-950 pointer-events-none"></div>
                        
                        {/* The Magazine Cover Mockup */}
                        <div className="relative w-full max-w-md aspect-[3/4] bg-white shadow-2xl rounded-sm overflow-hidden transform transition-all duration-500 hover:scale-[1.02] ring-1 ring-white/20">
                            <img src={'momentIds' in selectedItem ? selectedItem.coverImage : (selectedItem.image || selectedItem.images?.[0])} alt="Cover" className="absolute inset-0 w-full h-full object-cover"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                            
                            {/* Layout Logic */}
                            <div className={`absolute inset-0 p-8 flex flex-col ${selectedLayout === 'Minimalist' ? 'items-center justify-between text-center' : selectedLayout === 'Chronicle' ? 'items-start justify-end text-left' : 'items-center justify-center text-center'}`}>
                                <div className="w-full">
                                    <p className={`uppercase tracking-[0.3em] text-xs mb-2 ${selectedLayout === 'Emotive' ? 'opacity-0' : 'text-white/80'}`}>The æternacy Collection</p>
                                    <h1 className={`font-brand font-bold text-white leading-tight drop-shadow-lg ${selectedLayout === 'Minimalist' ? 'text-5xl' : selectedLayout === 'Chronicle' ? 'text-4xl mb-4' : 'text-6xl uppercase tracking-tighter'}`}>
                                        {enhancedContent.title || selectedItem.title}
                                    </h1>
                                </div>
                                {selectedLayout === 'Chronicle' && <div className="h-1 w-20 bg-white mb-4"></div>}
                                <div className="w-full">
                                    <p className="text-white/90 font-serif text-sm leading-relaxed drop-shadow-md line-clamp-4">
                                        {enhancedContent.foreword || "A curated collection of memories, preserved for eternity."}
                                    </p>
                                    <p className="text-white/60 text-[10px] uppercase tracking-widest mt-4">Volume 1 • 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Editor Panel */}
                    <div className="w-full lg:w-96 bg-slate-900 border-l border-white/10 flex flex-col h-full">
                        <div className="flex-grow overflow-y-auto p-6 space-y-8">
                            
                            {/* Layout Selector */}
                            <div>
                                <h4 className="font-bold text-white flex items-center gap-2 mb-4 text-sm uppercase tracking-wider text-slate-500"><LayoutTemplate className="w-4 h-4 text-cyan-400"/> Layout Style</h4>
                                <div className="space-y-3">
                                    {layouts.map(layout => (
                                        <button key={layout.name} onClick={() => setSelectedLayout(layout.name)} className={`w-full p-4 rounded-xl border text-left transition-all relative group ${selectedLayout === layout.name ? 'border-cyan-500 bg-cyan-900/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-bold ${selectedLayout === layout.name ? 'text-cyan-400' : 'text-white'}`}>{layout.name}</span>
                                                {selectedLayout === layout.name && <Check className="w-4 h-4 text-cyan-400"/>}
                                            </div>
                                            <p className="text-xs text-slate-400">{layout.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AI Tools */}
                             <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5">
                                <h4 className="font-bold text-indigo-300 flex items-center gap-2 mb-4 text-sm uppercase tracking-wider"><Sparkles className="w-4 h-4"/> AI Editorial Assistant</h4>
                                <div className="space-y-3">
                                    <button disabled={isEnhancing} onClick={() => handleEnhance('title')} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition-colors border border-white/5">
                                        <span className="flex items-center gap-2">{isEnhancing ? <Loader2 className="w-4 h-4 animate-spin"/> : <PenLine className="w-4 h-4" />} Suggest Editorial Title</span>
                                        <ArrowRight className="w-4 h-4 opacity-50"/>
                                    </button>
                                    <button disabled={isEnhancing} onClick={() => handleEnhance('foreword')} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition-colors border border-white/5">
                                         <span className="flex items-center gap-2">{isEnhancing ? <Loader2 className="w-4 h-4 animate-spin"/> : <PenLine className="w-4 h-4" />} Write Foreword</span>
                                         <ArrowRight className="w-4 h-4 opacity-50"/>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Action */}
                        <div className="p-6 border-t border-white/10 bg-slate-900">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-400 text-sm">Issue Cost</span>
                                <span className="font-bold text-white font-mono text-lg flex items-center gap-2">
                                    {TOKEN_COSTS.MAGAZINE_ISSUE.toLocaleString()} 
                                    <span className="text-cyan-400 text-sm">Tokæn</span>
                                </span>
                            </div>
                            <button onClick={handleDownload} className={`w-full font-bold py-4 px-6 rounded-full transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3 ${isLegacyUser ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-900'}`}>
                                {isLegacyUser ? <><Download className="w-5 h-5"/> Generate & Download PDF</> : 'Upgrade to Create'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MagazinePage;
