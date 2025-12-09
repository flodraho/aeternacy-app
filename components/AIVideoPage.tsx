
import React, { useState, useMemo, useEffect } from 'react';
import { Page, UserTier, Moment, Journey, AeternyStyle } from '../types';
import { ArrowLeft, Check, Film, Loader2, Wand2, MonitorSmartphone, Clapperboard, Sparkles, X, Save } from 'lucide-react';
import { generateVideoScript, generateVideo, imageUrlToPayload } from '../services/geminiService';
import { TOKEN_COSTS } from '../services/costCatalog';

interface AIVideoPageProps {
  onNavigate: (page: Page) => void;
  userTier: UserTier;
  moments: Moment[];
  journeys: Journey[];
  onItemUpdate: (item: Moment | Journey) => void;
  aeternyStyle: AeternyStyle;
  triggerConfirmation: (cost: number, featureKey: string, onConfirm: () => Promise<any>, message?: string) => void;
}

type VideoStyle = 'Cinematic' | 'Nostalgic' | 'Upbeat' | 'Documentary';
type AspectRatio = '16:9' | '9:16';
type PageState = 'select' | 'configure' | 'generating' | 'review';

const AIVideoPage: React.FC<AIVideoPageProps> = (props) => {
    const { onNavigate, userTier, moments, journeys, onItemUpdate, aeternyStyle, triggerConfirmation } = props;

    const [pageState, setPageState] = useState<PageState>('select');
    const [selectedItem, setSelectedItem] = useState<Moment | Journey | null>(null);
    
    // Config state
    const [videoStyle, setVideoStyle] = useState<VideoStyle>('Cinematic');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [withNarration, setWithNarration] = useState(true);

    // Script state
    const [script, setScript] = useState('');
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);

    // Video Generation state
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [isKeySelected, setIsKeySelected] = useState(false);

    useEffect(() => {
        const checkApiKey = async () => {
            if ((window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                setIsKeySelected(hasKey);
            }
        };
        checkApiKey();
    }, []);

    const handleGenerateScript = async () => {
        if (!selectedItem) return;
        setIsGeneratingScript(true);
        try {
            const generated = await generateVideoScript(selectedItem, aeternyStyle);
            setScript(generated);
        } catch (error) {
            console.error(error);
            setScript("Sorry, I couldn't generate a script at this moment.");
        } finally {
            setIsGeneratingScript(false);
        }
    };

    const handleStartGeneration = async () => {
        if (!selectedItem) return;

        let keyIsReady = isKeySelected;
        if (!keyIsReady) {
            try {
                await (window as any).aistudio.openSelectKey();
                setIsKeySelected(true); keyIsReady = true;
            } catch (e) {
                setGenerationError("API key selection was cancelled.");
                return;
            }
        }
        if (!keyIsReady) return;
        
        setPageState('generating');
        setGenerationError(null);
        
        try {
            const firstMomentId = 'momentIds' in selectedItem ? selectedItem.momentIds[0] : selectedItem.id;
            const moment = moments.find(m => m.id === firstMomentId);
            if (!moment || (!moment.image && !moment.images?.[0])) {
                throw new Error("The selected moment does not have a valid header image.");
            }
            
            const imagePayload = await imageUrlToPayload(moment.image || moment.images![0]);
            
            let prompt = `Create a video with a ${videoStyle.toLowerCase()} feel.`;
            if (withNarration && script) {
                prompt += ` Narrate the following script: "${script}"`;
            }
            prompt += ` The story is about: ${selectedItem.title}.`;

            const url = await generateVideo(prompt, imagePayload, aspectRatio);
            setGeneratedVideoUrl(url);
            setPageState('review');
            console.log(`TELEMETRY: token_spend_ok, feature: AI_VIDEO_REFLECTION, cost: ${TOKEN_COSTS.AI_VIDEO_REFLECTION}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            if (message.includes("Requested entity was not found") || message.includes("404") || message.includes("Your API key may be invalid")) {
                setIsKeySelected(false); // Reset state so the user is prompted again
            }
            setGenerationError(message);
            setPageState('configure'); // Go back to config on error
            throw error; // Re-throw to trigger refund
        }
    };
    
    const handleTriggerGeneration = () => {
        triggerConfirmation(TOKEN_COSTS.AI_VIDEO_REFLECTION, 'AI_VIDEO_REFLECTION', handleStartGeneration);
    };

    const handleSaveVideo = () => {
        if (selectedItem && generatedVideoUrl && !('momentIds' in selectedItem)) {
            const updatedMoment = { ...selectedItem, video: generatedVideoUrl };
            onItemUpdate(updatedMoment);
            onNavigate(Page.MomentDetail); // Or maybe back to curate
        } else {
            // Logic for saving to a journey might be different, e.g., creates a new moment
            alert('Video saved!');
            resetState();
        }
    };
    
    const resetState = () => {
        setPageState('select');
        setSelectedItem(null);
        setScript('');
        setGeneratedVideoUrl(null);
        setGenerationError(null);
    };

    const renderSelect = () => (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold font-brand mb-4">Select a Momænt</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {moments.filter(m => m.type !== 'insight' && m.type !== 'collection' && m.type !== 'fæmilyStoryline').slice(0, 4).map(m => (
                        <button key={m.id} onClick={() => { setSelectedItem(m); setPageState('configure'); }} className="aspect-square relative group rounded-lg overflow-hidden">
                            <img src={m.image || m.images?.[0]} alt={m.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <p className="absolute bottom-2 left-3 font-bold text-sm text-white">{m.title}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold font-brand mb-4">Or a Journæy</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {journeys.slice(0, 4).map(j => (
                        <button key={j.id} onClick={() => { setSelectedItem(j); setPageState('configure'); }} className="aspect-square relative group rounded-lg overflow-hidden">
                            <img src={j.coverImage} alt={j.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <p className="absolute bottom-2 left-3 font-bold text-sm text-white">{j.title}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
    
    const renderConfigure = () => {
        if (!selectedItem) return null;
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview */}
                <div className="bg-slate-800/50 p-6 rounded-2xl ring-1 ring-white/10">
                    <h3 className="font-bold text-lg mb-4">Source Material</h3>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                        <img src={'momentIds' in selectedItem ? selectedItem.coverImage : (selectedItem.image || selectedItem.images?.[0])} alt={selectedItem.title} className="w-full h-full object-cover"/>
                    </div>
                    <h4 className="font-bold text-white text-xl">{selectedItem.title}</h4>
                    <p className="text-sm text-slate-400 line-clamp-2">{selectedItem.description}</p>
                </div>

                {/* Configuration */}
                <div className="space-y-6">
                     <div>
                        <h3 className="text-lg font-bold mb-3">1. Choose a Style</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {(['Cinematic', 'Nostalgic', 'Upbeat', 'Documentary'] as VideoStyle[]).map(style => (
                                <button key={style} onClick={() => setVideoStyle(style)} className={`p-3 rounded-lg border-2 text-sm font-semibold transition-colors ${videoStyle === style ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}`}>{style}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-3">2. Choose Aspect Ratio</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setAspectRatio('16:9')} className={`p-3 rounded-lg border-2 font-semibold transition-colors flex items-center justify-center gap-2 ${aspectRatio === '16:9' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}`}><MonitorSmartphone className="w-5 h-5"/> 16:9</button>
                            <button onClick={() => setAspectRatio('9:16')} className={`p-3 rounded-lg border-2 font-semibold transition-colors flex items-center justify-center gap-2 ${aspectRatio === '9:16' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}`}><MonitorSmartphone className="w-5 h-5 rotate-90"/> 9:16</button>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold mb-3">3. AI Narration</h3>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                            <label htmlFor="narration-toggle" className="font-semibold text-sm">Enable AI-generated voiceover</label>
                            <button id="narration-toggle" role="switch" aria-checked={withNarration} onClick={() => setWithNarration(p => !p)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${withNarration ? 'bg-cyan-500' : 'bg-gray-600'}`}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${withNarration ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        {withNarration && (
                            <div className="mt-3">
                                {script ? (
                                    <textarea value={script} onChange={e => setScript(e.target.value)} rows={4} className="w-full text-sm p-2 bg-gray-900/50 border border-white/10 rounded-md" />
                                ) : (
                                    <button onClick={handleGenerateScript} disabled={isGeneratingScript} className="w-full text-sm bg-slate-700 hover:bg-slate-600 font-semibold py-2 rounded-md flex items-center justify-center gap-2">
                                        {isGeneratingScript ? <><Loader2 className="w-4 h-4 animate-spin"/> Generating Script...</> : <><Sparkles className="w-4 h-4"/> Generate Script with æterny</>}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {generationError && <p className="text-red-400 text-sm text-center">{generationError}</p>}
                </div>
            </div>
        );
    };

    const renderGenerating = () => (
        <div className="text-center min-h-[50vh] flex flex-col items-center justify-center">
            <Film className="w-16 h-16 text-cyan-400 mb-4 animate-pulse"/>
            <h2 className="text-3xl font-bold font-brand text-white">Directing Your Scene...</h2>
            <p className="text-slate-400 mt-2 max-w-md mx-auto">æterny is writing, narrating, and editing your cinematic reflection. This process can take a few minutes. Please keep this window open.</p>
        </div>
    );
    
    const renderReview = () => (
        <div className="text-center">
             <h2 className="text-3xl font-bold font-brand text-white mb-4">Your AI Video Reflection is Ready</h2>
             <div className="max-w-2xl mx-auto aspect-video bg-black rounded-lg overflow-hidden ring-1 ring-white/10">
                {generatedVideoUrl && (
                    <div className="relative w-full h-full">
                        <video src={generatedVideoUrl} controls autoPlay className="w-full h-full" />
                        <span className="video-watermark">æ</span>
                    </div>
                )}
             </div>
             <div className="flex justify-center gap-4 mt-8">
                 <button onClick={resetState} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-full"><X className="w-5 h-5 inline-block -mt-1 mr-1"/> Discard</button>
                 <button onClick={handleSaveVideo} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full"><Save className="w-5 h-5 inline-block -mt-1 mr-1"/> Save to Momænt</button>
             </div>
        </div>
    );

    return (
        <div className="container mx-auto px-6 pt-28 pb-12 animate-fade-in-up">
            <button onClick={() => { if(pageState === 'select') onNavigate(Page.Shop); else setPageState('select'); }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-8">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-white font-brand">Video Studio</h1>
                    <p className="text-slate-400 mt-2">Craft cinematic short films from your memories.</p>
                </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8 min-h-[60vh]">
                {pageState === 'select' && renderSelect()}
                {pageState === 'configure' && renderConfigure()}
                {pageState === 'generating' && renderGenerating()}
                {pageState === 'review' && renderReview()}
            </div>

            {pageState === 'configure' && (
                <div className="mt-8 flex justify-end">
                    <button onClick={handleTriggerGeneration} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 flex items-center gap-2">
                       <Clapperboard className="w-5 h-5" />
                       Generate Video
                    </button>
                </div>
            )}
        </div>
    );
};

export default AIVideoPage;
