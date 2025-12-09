
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Moment, Page, UserTier, TokenState } from '../types';
import { 
    ArrowLeft, Save, Trash2, Film, Wand2, 
    Image as ImageIcon, Calendar, MapPin, Users, 
    Tag, Sparkles, Play, MoreVertical, Check, Loader2,
    Layout, Mic, X, Share2, Edit3, ArrowRight, Eye, EyeOff, Maximize2, FilePenLine, AlertCircle,
    History, Music, Brush, Info
} from 'lucide-react';
import { imageUrlToPayload, generateVideo, rewriteStory, checkImageForMinors } from '../services/geminiService';
import { TOKEN_COSTS } from '../services/costCatalog';

interface CuratePageProps {
    moments: Moment[];
    onUpdateMoment: (moment: Moment) => void;
    initialMoment: Moment | null;
    onNavigate: (page: Page) => void;
    userTier: UserTier;
    tokenState: TokenState;
    triggerConfirmation: (cost: number, featureKey: string, onConfirm: () => Promise<any>, message?: string) => void;
    showToast: (message: string, type: 'info' | 'success' | 'error') => void;
    aeternyAvatar?: string | null;
    onClearInitialMoment?: () => void;
    onUseFreeHeaderAnimation?: () => void;
    showGuide?: boolean;
    onCloseGuide?: () => void;
}

type EditorTab = 'story' | 'details' | 'ai';

const CuratePage: React.FC<CuratePageProps> = (props) => {
    const { moments, initialMoment, onUpdateMoment, onNavigate, showToast, triggerConfirmation } = props;
    
    // Core State
    const [selectedMoment, setSelectedMoment] = useState<Moment | null>(initialMoment);
    const [activeTab, setActiveTab] = useState<EditorTab>('story');
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [isZenMode, setIsZenMode] = useState(false);
    const [mediaLoadError, setMediaLoadError] = useState(false);
    
    // AI Tools State
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isRewriting, setIsRewriting] = useState(false);
    const [aiContext, setAiContext] = useState<string | null>(null);
    const [isFetchingContext, setIsFetchingContext] = useState(false);
    
    // Editor State
    const [isDirty, setIsDirty] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [videoError, setVideoError] = useState<string | null>(null);
    const [isKeySelected, setIsKeySelected] = useState(false);

    // Derived
    const allImages = useMemo(() => {
        if (!selectedMoment) return [];
        const raw = [selectedMoment.image, ...(selectedMoment.images || [])].filter((img): img is string => !!img);
        return Array.from(new Set(raw));
    }, [selectedMoment]);

    const currentMedia = allImages[activeMediaIndex];

    useEffect(() => {
        if (initialMoment) {
            setSelectedMoment(initialMoment);
        }
    }, [initialMoment]);

    useEffect(() => {
        const checkApiKey = async () => {
            if ((window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                setIsKeySelected(hasKey);
            }
        };
        checkApiKey();
    }, []);

    // Handlers
    const handleUpdateField = (field: keyof Moment, value: any) => {
        if (!selectedMoment) return;
        setSelectedMoment({ ...selectedMoment, [field]: value });
        setIsDirty(true);
    };

    const handleSave = () => {
        if (selectedMoment) {
            onUpdateMoment(selectedMoment);
            setIsDirty(false);
            showToast("Momænt saved successfully.", "success");
        }
    };

    const handleBack = () => {
        if (isDirty) {
            if (window.confirm("You have unsaved changes. Discard them?")) {
                setSelectedMoment(null);
                setIsDirty(false);
            }
        } else {
            setSelectedMoment(null);
        }
    };

    const handleRewrite = async () => {
        if (!selectedMoment || !aiPrompt.trim()) return;
        setIsRewriting(true);
        try {
            const newStory = await rewriteStory(selectedMoment.description, aiPrompt);
            handleUpdateField('description', newStory);
            setAiPrompt('');
            showToast("Story rewritten by æterny.", "success");
        } catch (e) {
            showToast("Failed to rewrite story.", "error");
        } finally {
            setIsRewriting(false);
        }
    };

    // Simulated "Time Travel" Context Feature
    const handleFetchHistoricalContext = async () => {
        if(!selectedMoment) return;
        setIsFetchingContext(true);
        // Simulate API call for historical context based on date/location
        setTimeout(() => {
            setAiContext(`On ${selectedMoment.date}, the weather was unseasonably warm. It was also the day of the 'Harvest Moon', which might explain the beautiful lighting in your photos.`);
            setIsFetchingContext(false);
            setActiveTab('ai'); // Switch to AI tab to show result
        }, 1500);
    };

    const handleGenerateLivingPhoto = async () => {
        if (!selectedMoment) return;

        let keyIsReady = isKeySelected;
        if (!keyIsReady) {
             try {
                if ((window as any).aistudio) {
                    await (window as any).aistudio.openSelectKey();
                    setIsKeySelected(true);
                    keyIsReady = true;
                } else {
                    setVideoError("AI Studio bridge unavailable.");
                    return;
                }
            } catch (e) {
                setVideoError("API key selection was cancelled.");
                return;
            }
        }

        const executeVideoGen = async () => {
            setIsGeneratingVideo(true);
            setVideoError(null);
            try {
                const imagePayload = await imageUrlToPayload(currentMedia);
                const isUnsafe = await checkImageForMinors(imagePayload);
                if (isUnsafe) {
                    throw new Error("SAFETY_POLICY_VIOLATION");
                }

                const prompt = `Create a cinematic, high-quality living photo video. Subtle motion, breathing scenery. Context: ${selectedMoment.title}`;
                const url = await generateVideo(prompt, imagePayload, "16:9");
                
                const updated = { ...selectedMoment, video: url };
                setSelectedMoment(updated);
                onUpdateMoment(updated);
                setActiveMediaIndex(0);
                setMediaLoadError(false);
                console.log(`TELEMETRY: token_spend_ok, feature: HEADER_ANIMATION`);
            } catch (error: any) {
                if (error.message === "SAFETY_POLICY_VIOLATION") {
                    showToast("Video generation blocked by safety policy.", "error");
                } else {
                    setVideoError(error.message || "Generation failed.");
                    if (error.message?.includes("404") || error.message?.includes("not found")) {
                        setIsKeySelected(false);
                    }
                }
                throw error;
            } finally {
                setIsGeneratingVideo(false);
            }
        };

        triggerConfirmation(TOKEN_COSTS.HEADER_ANIMATION, 'HEADER_ANIMATION', executeVideoGen);
    };

    // --- The Light Table (Selection View) ---
    if (!selectedMoment) {
        return (
            <div className="min-h-screen bg-slate-950 text-white animate-fade-in -mt-20 pt-20">
                <div className="container mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <button onClick={() => onNavigate(Page.Moments)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Collection
                            </button>
                            <h1 className="text-4xl md:text-5xl font-bold font-brand text-white flex items-center gap-4">
                                Momænt Studio <Wand2 className="w-8 h-8 text-cyan-400" />
                            </h1>
                            <p className="text-slate-400 mt-2 max-w-xl">
                                Your creative workspace. Use AI to refine narratives, add historical context, and transform static memories into living experiences.
                            </p>
                        </div>
                        <div className="text-right">
                             <button onClick={() => onNavigate(Page.Create)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20">
                                <Sparkles className="w-4 h-4"/> Create New
                             </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {moments.filter(m => m.type !== 'insight' && m.type !== 'collection').map(moment => (
                            <button 
                                key={moment.id} 
                                onClick={() => setSelectedMoment(moment)}
                                className="group relative aspect-[4/5] rounded-lg overflow-hidden bg-slate-900 ring-1 ring-white/10 hover:ring-cyan-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-900/20 text-left"
                            >
                                <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                                <div className="absolute bottom-0 left-0 p-4 w-full">
                                    <p className="text-[10px] uppercase tracking-widest text-cyan-400 mb-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">{moment.date}</p>
                                    <h3 className="font-bold text-white text-lg leading-tight truncate pr-2 font-brand">{moment.title}</h3>
                                </div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100">
                                    <div className="bg-slate-950/50 backdrop-blur-md p-2 rounded-full text-white border border-white/10">
                                        <Edit3 className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- The Studio Workspace (Editor View) ---
    return (
        <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden text-slate-200 animate-fade-in fixed inset-0 z-[100]">
            
            {/* Top Bar */}
            <header className={`h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-xl flex-shrink-0 z-30 transition-transform duration-500 ${isZenMode ? '-translate-y-full' : 'translate-y-0'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-4 w-px bg-white/10"></div>
                    <span className="font-brand text-lg font-bold text-white tracking-wide">Studio</span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest hidden sm:inline-block">• {selectedMoment.title}</span>
                </div>

                <div className="flex items-center gap-4">
                     <button onClick={() => setIsZenMode(!isZenMode)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors" title={isZenMode ? "Exit Zen" : "Enter Zen Mode"}>
                        {isZenMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg ${isDirty ? 'bg-cyan-600 text-white hover:bg-cyan-500 hover:scale-105' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                        {isDirty ? <Save className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        {isDirty ? 'Save Changes' : 'Saved'}
                    </button>
                </div>
            </header>

            {/* Main Workspace Layout */}
            <div className="flex-grow flex overflow-hidden relative">
                
                {/* 1. Visual Canvas (Center) */}
                <div className={`transition-all duration-500 ease-in-out bg-black relative flex flex-col ${isZenMode ? 'w-full' : 'w-[65%]'}`}>
                    
                    {/* The Artifact */}
                    <div className="flex-grow relative group flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/30 via-black to-black">
                         {selectedMoment.video && activeMediaIndex === 0 && !mediaLoadError ? (
                            <div className="relative w-full h-full max-w-6xl max-h-full aspect-video flex items-center justify-center">
                                <video 
                                    src={selectedMoment.video} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="w-full h-full object-contain shadow-2xl"
                                    onError={() => setMediaLoadError(true)}
                                />
                                <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-cyan-300 flex items-center gap-2 border border-cyan-500/30 shadow-lg pointer-events-none">
                                    <Film className="w-3 h-3" /> Living Photo Active
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center p-8">
                                <img src={currentMedia} alt="Active Memory" className="w-full h-full object-contain shadow-2xl rounded-sm" />
                                {mediaLoadError && activeMediaIndex === 0 && selectedMoment.video && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
                                        <div className="bg-slate-800 p-4 rounded-xl flex items-center gap-3 text-amber-400">
                                            <AlertCircle className="w-6 h-6"/>
                                            <div>
                                                <p className="font-bold">Video Preview Unavailable</p>
                                                <p className="text-sm text-slate-400">The video link may have expired.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Floating AI Palette (Magic Wand) */}
                        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl transition-all duration-300 ${isZenMode ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}>
                             {isGeneratingVideo ? (
                                <div className="px-4 py-2 flex items-center gap-2 text-cyan-400 font-bold text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin"/> Generating...
                                </div>
                             ) : (
                                <>
                                    <button 
                                        onClick={handleGenerateLivingPhoto}
                                        className="p-3 rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-300 transition-colors group relative"
                                        title="Generate Living Photo (Veo)"
                                    >
                                        <Film className="w-5 h-5" />
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black px-2 py-1 text-[10px] rounded text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Make it Move</span>
                                    </button>
                                    <div className="w-px h-6 bg-white/10"></div>
                                    <button 
                                        onClick={handleFetchHistoricalContext} 
                                        disabled={isFetchingContext}
                                        className="p-3 rounded-full hover:bg-purple-500/20 hover:text-purple-400 text-slate-300 transition-colors group relative"
                                        title="Find Context"
                                    >
                                        {isFetchingContext ? <Loader2 className="w-5 h-5 animate-spin"/> : <History className="w-5 h-5" />}
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black px-2 py-1 text-[10px] rounded text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">History Check</span>
                                    </button>
                                     <button 
                                        className="p-3 rounded-full hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors group relative"
                                        title="Generate Soundscape (Coming Soon)"
                                    >
                                        <Music className="w-5 h-5" />
                                         <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black px-2 py-1 text-[10px] rounded text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Add Sound</span>
                                    </button>
                                    <button 
                                        className="p-3 rounded-full hover:bg-green-500/20 hover:text-green-400 text-slate-300 transition-colors group relative"
                                        title="Magic Edit (Coming Soon)"
                                    >
                                        <Brush className="w-5 h-5" />
                                         <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black px-2 py-1 text-[10px] rounded text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Magic Edit</span>
                                    </button>
                                </>
                             )}
                        </div>

                        {/* Zen Exit */}
                        {isZenMode && (
                            <button onClick={() => setIsZenMode(false)} className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="w-5 h-5"/>
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Narrative Sidebar (Right) */}
                <div className={`bg-slate-900 border-l border-white/5 flex flex-col flex-shrink-0 transition-all duration-500 ease-in-out z-20 ${isZenMode ? 'w-0 opacity-0 translate-x-full' : 'w-[35%] opacity-100 translate-x-0'}`}>
                    
                    {/* Tabs */}
                    <div className="flex border-b border-white/5">
                        <button onClick={() => setActiveTab('story')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'story' ? 'border-cyan-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Story</button>
                        <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'details' ? 'border-cyan-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Details</button>
                        <button onClick={() => setActiveTab('ai')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'ai' ? 'border-cyan-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>AI Insights</button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-8">
                        {/* Tab: Story */}
                        {activeTab === 'story' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <input 
                                        type="text" 
                                        value={selectedMoment.title}
                                        onChange={(e) => handleUpdateField('title', e.target.value)}
                                        className="w-full bg-transparent text-3xl font-bold font-brand text-white border-none focus:ring-0 px-0 placeholder-slate-700"
                                        placeholder="Title..."
                                    />
                                </div>
                                <div className="relative group">
                                     <textarea 
                                        value={selectedMoment.description}
                                        onChange={(e) => handleUpdateField('description', e.target.value)}
                                        className="w-full h-[50vh] bg-transparent text-lg text-slate-300 leading-relaxed font-serif outline-none resize-none placeholder-slate-700 focus:text-white transition-colors"
                                        placeholder="Write your story here..."
                                    />
                                    <div className="absolute bottom-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 bg-cyan-950/30 px-3 py-1.5 rounded-full"><Mic className="w-3 h-3"/> Dictate</button>
                                    </div>
                                </div>
                                
                                {/* AI Rewrite Module */}
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 flex gap-3 items-center">
                                    <Wand2 className="w-4 h-4 text-indigo-400 flex-shrink-0"/>
                                    <input 
                                        type="text"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Ask æterny to rewrite (e.g., 'More poetic')"
                                        className="flex-grow bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleRewrite()}
                                    />
                                    <button onClick={handleRewrite} disabled={isRewriting || !aiPrompt} className="text-indigo-400 hover:text-white text-xs font-bold uppercase transition-colors disabled:opacity-50">
                                        {isRewriting ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Go'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tab: Details */}
                        {activeTab === 'details' && (
                             <div className="space-y-8 animate-fade-in">
                                <div className="group">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Date</label>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        <input type="text" value={selectedMoment.date} onChange={(e) => handleUpdateField('date', e.target.value)} className="bg-transparent text-white w-full outline-none font-medium"/>
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Location</label>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                        <input type="text" value={selectedMoment.location || ''} onChange={(e) => handleUpdateField('location', e.target.value)} className="bg-transparent text-white w-full outline-none font-medium" placeholder="Add location"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">People</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMoment.people?.map(p => (
                                            <span key={p} className="bg-slate-800 px-3 py-1.5 rounded-full text-sm text-slate-300 border border-white/5 flex items-center gap-2">
                                                <Users className="w-3 h-3"/> {p}
                                            </span>
                                        ))}
                                        <button className="px-3 py-1.5 rounded-full text-sm text-slate-500 border border-dashed border-slate-600 hover:text-white hover:border-slate-400 transition-colors">+ Add</button>
                                    </div>
                                </div>
                            </div>
                        )}

                         {/* Tab: AI Insights */}
                         {activeTab === 'ai' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-purple-900/10 border border-purple-500/20 p-6 rounded-2xl">
                                    <h3 className="text-purple-300 font-bold flex items-center gap-2 mb-3"><History className="w-4 h-4"/> Historical Context</h3>
                                    {aiContext ? (
                                        <p className="text-slate-300 text-sm leading-relaxed">{aiContext}</p>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-slate-500 text-sm mb-4">Discover what else happened in the world on this day.</p>
                                            <button onClick={handleFetchHistoricalContext} disabled={isFetchingContext} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors disabled:opacity-50">
                                                {isFetchingContext ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Reveal History'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bg-slate-800/50 border border-white/5 p-6 rounded-2xl opacity-60 grayscale cursor-not-allowed">
                                    <h3 className="text-slate-400 font-bold flex items-center gap-2 mb-2"><Info className="w-4 h-4"/> Emotional Analysis</h3>
                                    <p className="text-slate-500 text-sm">Coming soon: æterny will analyze the emotional tone of your story.</p>
                                </div>
                            </div>
                         )}
                    </div>

                    {/* Bottom: Filmstrip (Mini) */}
                    <div className="p-6 border-t border-white/5 bg-slate-950">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <button className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-colors flex-shrink-0">
                                <Layout className="w-5 h-5" />
                            </button>
                            {allImages.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => { setActiveMediaIndex(idx); setMediaLoadError(false); }}
                                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${activeMediaIndex === idx ? 'ring-2 ring-cyan-400 opacity-100' : 'opacity-40 hover:opacity-80'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="thumbnail"/>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CuratePage;
