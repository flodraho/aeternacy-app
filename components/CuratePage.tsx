
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Moment, Message, Page, UserTier, TokenState, AeternyVoice, AeternyStyle } from '../types';
import { rewriteStory, generateVideo, imageUrlToPayload, editImage, createStoryFromImages, analyzeImageForCuration, checkImageForMinors } from '../services/geminiService';
import { Feather, Film, ChevronDown, Bot, Loader2, Wand2, X, Users, UploadCloud, Star, MapPin, Tag, Check, RotateCw, HelpCircle, Hand, Play } from 'lucide-react';
import AeternyAvatarDisplay from './AeternyAvatarDisplay';
import ShareModal from './ShareModal';
import LegacyIcon from './icons/LegacyIcon';
import Tooltip from './Tooltip';
import { TOKEN_COSTS } from '../services/costCatalog';
import LivingSlideshowPlayer from './LivingSlideshowPlayer';

// --- Helper Components ---

const CurationTool: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; tooltipText?: string; }> = ({ title, icon: Icon, children, tooltipText }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border-b border-white/10">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5">
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <span className="font-semibold text-white">{title}</span>
                    {tooltipText && (
                        <Tooltip text={tooltipText}>
                            <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                        </Tooltip>
                    )}
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
};

const MomentSelectorGrid: React.FC<{ moments: Moment[], onSelect: (moment: Moment) => void }> = ({ moments, onSelect }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {moments.map(moment => (
            <button key={moment.id} onClick={() => onSelect(moment)} className="aspect-square relative rounded-lg overflow-hidden group text-left">
                <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="font-bold text-white text-sm leading-tight">{moment.title}</h3>
                    <p className="text-xs text-slate-400">{moment.date}</p>
                </div>
            </button>
        ))}
    </div>
);

// --- Helper Functions ---
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const fileToPayload = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header?.match(/:(.*?);/)?.[1];
            if (data && mimeType) {
                resolve({ data, mimeType });
            } else {
                reject(new Error('Could not parse file data for payload.'));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};


// --- Main CuratePage Component ---

interface CuratePageProps {
    moments: Moment[];
    onUpdateMoment: (moment: Moment) => void;
    aeternyAvatar: string | null;
    initialMoment: Moment | null;
    onClearInitialMoment: () => void;
    onNavigate: (page: Page) => void;
    userTier: UserTier;
    tokenState: TokenState;
    onUseFreeHeaderAnimation: () => void;
    triggerConfirmation: (cost: number, featureKey: string, onConfirm: () => Promise<any>) => void;
    showGuide: boolean;
    onCloseGuide: () => void;
    showToast: (message: string, type: 'info' | 'success' | 'error') => void;
    aeternyVoice: AeternyVoice;
    aeternyStyle: AeternyStyle;
}

interface GeneratedContent {
    title: string;
    story: string;
    tags: {
        location: string[];
        people: string[];
        activities: string[];
    };
}


const CuratePage: React.FC<CuratePageProps> = (props) => {
    const { 
        moments, onUpdateMoment, aeternyAvatar, initialMoment, 
        onClearInitialMoment, onNavigate, userTier, 
        tokenState, onUseFreeHeaderAnimation, triggerConfirmation,
        showGuide, onCloseGuide, showToast, aeternyVoice, aeternyStyle
    } = props;

    const [selectedMoment, setSelectedMoment] = useState<Moment | null>(initialMoment);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [videoModalOpen, setVideoModalOpen] = useState(false);


    // --- Story Enhancer State ---
    const [rewritePrompt, setRewritePrompt] = useState('');
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewrittenStory, setRewrittenStory] = useState<string | null>(null);
    const [showRewriteSuccess, setShowRewriteSuccess] = useState(false);
    const [storyDraft, setStoryDraft] = useState<GeneratedContent | null>(null);
    
    // Photo Upload State
    const [newlyAddedFiles, setNewlyAddedFiles] = useState<{ id: string; file: File; preview: string; status: 'uploading' | 'analyzing' | 'complete' }[]>([]);
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);
    
    // --- New states from MomentDetailPage ---
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isImageEditModalOpen, setIsImageEditModalOpen] = useState(false);
    const [imageToEdit, setImageToEdit] = useState<{ url: string, index: number } | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [isGeneratingEdit, setIsGeneratingEdit] = useState(false);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [curationAnalysis, setCurationAnalysis] = useState<{ suggestions: string[]; tags: { location: string[]; people: string[]; activities: string[] } } | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    
    // Video Generation State
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isKeySelected, setIsKeySelected] = useState(false);
    const [videoGenerationError, setVideoGenerationError] = useState<string | null>(null);


    const allImages = useMemo(() => 
        selectedMoment ? [selectedMoment.image, ...(selectedMoment.images || [])].filter((img): img is string => !!img) : [],
    [selectedMoment]);


    useEffect(() => {
        if (initialMoment) {
            setSelectedMoment(initialMoment);
        }
         // API key check for video generation
        const checkApiKey = async () => {
            if ((window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                setIsKeySelected(hasKey);
            }
        };
        checkApiKey();
    }, [initialMoment]);
    
    useEffect(() => {
        return () => {
            onClearInitialMoment();
        };
    }, [onClearInitialMoment]);

    const handleMomentSelect = (moment: Moment) => {
        setSelectedMoment(moment);
        setNewlyAddedFiles([]);
        setStoryDraft(null);
    };

    const handleSaveMoment = () => {
        if (selectedMoment) {
            onUpdateMoment(selectedMoment);
            showToast("Momænt saved successfully!", "success");
        }
    };
    
    const handleUpdateField = (field: keyof Moment, value: any) => {
        setSelectedMoment(prev => prev ? { ...prev, [field]: value } : null);
    };
    
    const handleAddTag = (category: 'people' | 'activities', tag: string) => {
        if (!selectedMoment || !tag.trim()) return;
        const currentTags = selectedMoment[category] || [];
        if (!currentTags.includes(tag.trim())) {
            handleUpdateField(category, [...currentTags, tag.trim()]);
        }
    };
    
    const handleRemoveTag = (category: 'people' | 'activities', tag: string) => {
        if (!selectedMoment) return;
        handleUpdateField(category, (selectedMoment[category] || []).filter(t => t !== tag));
    };
    
    // --- File Handling for Photo Tool ---
    const processFiles = useCallback(async (files: FileList) => {
        if (!selectedMoment) return;

        const newFiles = await Promise.all(
            Array.from(files).map(async file => ({
                id: `${file.name}-${Date.now()}`,
                file,
                preview: await fileToDataUrl(file),
                status: 'uploading' as 'uploading',
            }))
        );
        setNewlyAddedFiles(prev => [...prev, ...newFiles]);
        
        // Simulate upload/analysis
        setTimeout(() => {
            setNewlyAddedFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'analyzing' } : f));
            setTimeout(() => {
                setNewlyAddedFiles(prev => prev.map(f => f.status === 'analyzing' ? { ...f, status: 'complete' } : f));
            }, 1000);
        }, 500);
    }, [selectedMoment]);

    // FIX: Changed event type from React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement> to match the component it's attached to.
    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault(); e.stopPropagation();
        if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    };

    const handleRemoveNewPhoto = (id: string) => setNewlyAddedFiles(prev => prev.filter(f => f.id !== id));
    
    const handleAddPhotosToMoment = () => {
        if (newlyAddedFiles.length === 0) return;
        const newPreviews = newlyAddedFiles.map(f => f.preview);
        const updatedImages = [...allImages, ...newPreviews];
        handleUpdateField('images', updatedImages);
        setNewlyAddedFiles([]);
    };
    
    const handleRemoveImage = (index: number) => {
        const updatedImages = allImages.filter((_, i) => i !== index);
        handleUpdateField('images', updatedImages);
    };
    
    const handleSetHeader = (index: number) => {
        const newHeader = allImages[index];
        const otherImages = allImages.filter((_, i) => i !== index);
        setSelectedMoment(prev => prev ? { ...prev, image: newHeader, images: otherImages } : null);
    };
    
    // --- AI Tool Handlers ---

    const handleRewrite = async (prompt: string) => {
        if (!selectedMoment || !prompt.trim() || isRewriting) return;
        setIsRewriting(true);
        setRewrittenStory(null);
        try {
            const result = await rewriteStory(selectedMoment.description, prompt);
            setRewrittenStory(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsRewriting(false);
        }
    };
    
    const handleAcceptRewrite = () => {
        if (rewrittenStory) {
            handleUpdateField('description', rewrittenStory);
            setRewrittenStory(null);
            setShowRewriteSuccess(true);
            setTimeout(() => setShowRewriteSuccess(false), 2000);
        }
    };

    const handleRegenerateStory = async () => {
        if (!selectedMoment) return;
        setIsGeneratingStory(true);
        try {
            const imagePayloads = await Promise.all(allImages.map(url => imageUrlToPayload(url)));
            const result = await createStoryFromImages(imagePayloads);
            setStoryDraft(result);
        } catch (error) {
            console.error("Error regenerating story", error);
        } finally {
            setIsGeneratingStory(false);
        }
    };
    
    const handleAcceptDraft = () => {
        if (storyDraft && selectedMoment) {
            setSelectedMoment(prev => prev ? {
                ...prev,
                title: storyDraft.title,
                description: storyDraft.story,
                location: storyDraft.tags.location[0] || prev.location,
                people: Array.from(new Set([...(prev.people || []), ...storyDraft.tags.people])),
                activities: Array.from(new Set([...(prev.activities || []), ...storyDraft.tags.activities])),
            } : null);
            setStoryDraft(null);
        }
    };
    
    // --- Image Editing Handlers from MomentDetailPage ---
    
    const handleOpenEditModal = async (url: string, index: number) => {
        setImageToEdit({ url, index });
        setIsImageEditModalOpen(true);
        setEditedImageUrl(null);
        setEditError(null);
        setCurationAnalysis(null);
        setIsSuggesting(true);
        try {
            const { data, mimeType } = await imageUrlToPayload(url);
            const analysis = await analyzeImageForCuration(data, mimeType);
            setCurationAnalysis(analysis);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleCloseEditModal = () => {
        setIsImageEditModalOpen(false);
        setImageToEdit(null);
        setEditPrompt('');
        setEditedImageUrl(null);
        setEditError(null);
    };

    const handleImageEdit = async () => {
        if (!imageToEdit || !editPrompt) return;
        setIsGeneratingEdit(true);
        setEditedImageUrl(null);
        setEditError(null);
        try {
            const { data, mimeType } = await imageUrlToPayload(imageToEdit.url);
            
            // Safety check for minors before editing
            const containsMinor = await checkImageForMinors({data, mimeType});
            if (containsMinor) {
                throw new Error("To protect privacy, AI image editing is not available for photos containing minors.");
            }
            
            const resultUrl = await editImage(data, mimeType, editPrompt);
            setEditedImageUrl(resultUrl);
        } catch (error) {
            setEditError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsGeneratingEdit(false);
        }
    };
    
    const handleAcceptEdit = () => {
        if (editedImageUrl && imageToEdit && selectedMoment) {
            const updatedImages = [...allImages];
            updatedImages[imageToEdit.index] = editedImageUrl;
            
            const isHeader = selectedMoment.image === imageToEdit.url;
            
            setSelectedMoment(prev => prev ? {
                ...prev,
                image: isHeader ? updatedImages[0] : updatedImages.find(img => img === prev.image),
                images: updatedImages,
            } : null);
        }
        handleCloseEditModal();
    };
    
    // --- Animate Header ---
    const handleAnimateHeader = () => {
        if (!selectedMoment?.image || isGeneratingVideo) return;
        
        triggerConfirmation(TOKEN_COSTS.HEADER_ANIMATION, 'HEADER_ANIMATION', async () => {
            let keyIsReady = isKeySelected;
            if (!keyIsReady) {
                try {
                    await (window as any).aistudio.openSelectKey();
                    keyIsReady = true;
                } catch (e) {
                    setVideoGenerationError("API key selection was cancelled.");
                    throw new Error("API key selection was cancelled.");
                }
            }
            if (!keyIsReady) throw new Error("API key not selected.");

            setIsGeneratingVideo(true);
            setVideoGenerationError(null);

            try {
                const imagePayload = await imageUrlToPayload(selectedMoment.image!);
                const prompt = `Create a beautiful, short "living photograph" video from this image, related to the moment: ${selectedMoment.title}. Use subtle, realistic motion.`;
                const videoUrl = await generateVideo(prompt, imagePayload, aspectRatioForImage(imagePayload));
                
                handleUpdateField('video', videoUrl);
                setVideoModalOpen(true);
                showToast("Your 'Living Photo' is ready!", "success");

            } catch (error) {
                 const message = error instanceof Error ? error.message : "An unknown error occurred.";
                if (message.includes("Your API key may be invalid")) {
                    setIsKeySelected(false);
                }
                setVideoGenerationError(message);
                showToast(`Video generation failed: ${message}`, "error");
                throw error; // Re-throw to allow for potential refund logic in triggerConfirmation
            } finally {
                setIsGeneratingVideo(false);
            }
        });
    };
    
    const aspectRatioForImage = (image: { data: string, mimeType: string }): "16:9" | "9:16" => {
        const img = new Image();
        img.src = `data:${image.mimeType};base64,${image.data}`;
        return (img.width / img.height) > 1 ? "16:9" : "9:16";
    };

    
    const isLegacyUser = userTier === 'legacy';
    const isFreeHeaderAvailable = userTier === 'essæntial' && tokenState.freeHeaderAnimations.used < tokenState.freeHeaderAnimations.total;


    if (!selectedMoment) {
        return (
            <div className="container mx-auto px-6 pt-28 pb-12 flex flex-col items-center justify-center min-h-[80vh]">
                <Wand2 className="w-16 h-16 text-slate-600 mb-4"/>
                <h1 className="text-3xl font-bold text-white font-brand">Curætion Workspace</h1>
                <p className="text-slate-400 mt-2 mb-8">Select a momænt to begin curating.</p>
                <div className="w-full max-w-4xl">
                    <MomentSelectorGrid moments={moments} onSelect={handleMomentSelect} />
                </div>
            </div>
        );
    }


    return (
        <div className="container mx-auto px-6 pt-28 pb-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 font-brand">Curætion Workspace</h1>
                <p className="text-lg text-slate-400">Refine and enhance your momænt with AI-powered tools.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left: Curation Tools */}
                <div className="lg:col-span-1 bg-gray-800/50 rounded-2xl ring-1 ring-white/10 overflow-hidden h-fit sticky top-24">
                    <CurationTool title="Story Details" icon={Feather}>
                        {/* Title, Date, Description */}
                        <div className="space-y-4">
                            <div><label className="text-sm font-semibold text-slate-400">Title</label><input type="text" value={selectedMoment.title} onChange={e => handleUpdateField('title', e.target.value)} className="w-full bg-slate-700/50 p-2 rounded-md mt-1" /></div>
                            <div><label className="text-sm font-semibold text-slate-400">Date</label><input type="text" value={selectedMoment.date} onChange={e => handleUpdateField('date', e.target.value)} className="w-full bg-slate-700/50 p-2 rounded-md mt-1" /></div>
                        </div>
                    </CurationTool>

                    <CurationTool title="Story Enhancer" icon={Wand2} tooltipText="Rewrite or regenerate the story with AI">
                        <div>
                            <textarea value={selectedMoment.description} onChange={e => handleUpdateField('description', e.target.value)} rows={5} className="w-full bg-slate-700/50 p-2 rounded-md" />
                            {rewrittenStory && (
                                <div className="mt-2 p-2 bg-green-900/50 rounded-md border border-green-500/50">
                                    <p className="text-xs text-green-300 italic">{rewrittenStory}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={handleAcceptRewrite} className="text-xs bg-green-500/20 hover:bg-green-500/40 text-green-200 px-2 py-1 rounded">Accept</button>
                                        <button onClick={() => setRewrittenStory(null)} className="text-xs hover:bg-white/10 px-2 py-1 rounded">Discard</button>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 mt-2">
                                <input type="text" value={rewritePrompt} onChange={e => setRewritePrompt(e.target.value)} placeholder="e.g., Make it more poetic" className="w-full text-xs bg-slate-700/50 p-2 rounded-md" />
                                <button onClick={() => handleRewrite(rewritePrompt)} disabled={isRewriting} className="bg-slate-600 hover:bg-slate-500 text-xs px-3 rounded-md">{isRewriting ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Rewrite'}</button>
                            </div>
                            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"/></div><div className="relative flex justify-center text-sm"><span className="bg-slate-800 px-2 text-slate-500">Or</span></div></div>
                            <button onClick={handleRegenerateStory} disabled={isGeneratingStory} className="w-full text-sm bg-slate-600 hover:bg-slate-500 font-semibold py-2 rounded-md flex items-center justify-center gap-2">
                                {isGeneratingStory ? <><Loader2 className="w-4 h-4 animate-spin"/> Regenerating...</> : <><RotateCw className="w-4 h-4"/> Regenerate Story & Title</>}
                            </button>
                            {storyDraft && (
                                <div className="mt-2 p-3 bg-blue-900/50 rounded-md border border-blue-500/50">
                                    <h5 className="font-bold text-sm text-blue-300">{storyDraft.title}</h5>
                                    <p className="text-xs text-blue-300 italic mt-1">{storyDraft.story}</p>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={handleAcceptDraft} className="text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 px-2 py-1 rounded">Accept Draft</button>
                                        <button onClick={() => setStoryDraft(null)} className="text-xs hover:bg-white/10 px-2 py-1 rounded">Discard</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CurationTool>
                    
                    <CurationTool title="Tags" icon={Tag}>
                         <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-400 flex items-center gap-2"><Users className="w-4 h-4"/> People</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(selectedMoment.people || []).map(p => <span key={p} className="flex items-center gap-1 bg-gray-700 text-slate-300 text-xs px-2 py-1 rounded-full">{p} <button onClick={() => handleRemoveTag('people', p)}><X size={12}/></button></span>)}
                                </div>
                                <input type="text" placeholder="+ Add person" onKeyDown={e => {if(e.key==='Enter'){ e.preventDefault(); handleAddTag('people', e.currentTarget.value); e.currentTarget.value='';}}} className="w-full bg-transparent text-sm mt-2 focus:outline-none"/>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-400 flex items-center gap-2"><Tag className="w-4 h-4"/> Activities</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                     {(selectedMoment.activities || []).map(a => <span key={a} className="flex items-center gap-1 bg-gray-700 text-slate-300 text-xs px-2 py-1 rounded-full">{a} <button onClick={() => handleRemoveTag('activities', a)}><X size={12}/></button></span>)}
                                </div>
                                <input type="text" placeholder="+ Add activity" onKeyDown={e => {if(e.key==='Enter'){ e.preventDefault(); handleAddTag('activities', e.currentTarget.value); e.currentTarget.value='';}}} className="w-full bg-transparent text-sm mt-2 focus:outline-none"/>
                            </div>
                        </div>
                    </CurationTool>
                    <div className="p-4"><button onClick={handleSaveMoment} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-full transition-colors">Save Momænt</button></div>
                </div>

                {/* Right: Preview & Photo Tools */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-lg">
                        {isGeneratingVideo && (
                            <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin mb-3"/>
                                <p>æterny is creating...</p>
                                <p className="text-sm text-slate-400 mt-1">This may take a few minutes.</p>
                            </div>
                        )}
                        {selectedMoment.video && !videoModalOpen && (
                             <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center">
                                <button onClick={() => setVideoModalOpen(true)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full transition-colors backdrop-blur-sm">
                                    <Play className="w-5 h-5"/> Play 'Living Photo'
                                </button>
                            </div>
                        )}
                        <img src={selectedMoment.image} alt={selectedMoment.title} className="w-full h-full object-cover" />
                        <div className={`absolute top-4 right-4 ${showGuide ? 'relative z-[56] animate-guide-pulse' : ''}`}>
                            <Tooltip text={isFreeHeaderAvailable ? `You have ${tokenState.freeHeaderAnimations.total - tokenState.freeHeaderAnimations.used} free animations left this month.` : "Animate this photo with AI"}>
                                <button onClick={handleAnimateHeader} disabled={isGeneratingVideo} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Film className="w-4 h-4" />
                                    <span>Create 'Living Photo'</span>
                                    {isFreeHeaderAvailable && <span className="text-xs bg-green-500/80 text-white px-2 py-0.5 rounded-full">FREE</span>}
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    <div className={`bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10 ${showGuide ? 'relative z-[56] animate-guide-pulse' : ''}`}>
                        <h2 className="text-2xl font-bold text-white mb-4 font-brand">Photos</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {allImages.map((img, index) => (
                                <div key={index} className="relative aspect-square group">
                                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg"/>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                        <Tooltip text="Set as Header"><button onClick={() => handleSetHeader(index)} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><Star size={14} fill={selectedMoment.image === img ? 'currentColor' : 'none'}/></button></Tooltip>
                                        <Tooltip text="Edit with AI"><button onClick={() => handleOpenEditModal(img, index)} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><Wand2 size={14}/></button></Tooltip>
                                        <Tooltip text="Remove"><button onClick={() => handleRemoveImage(index)} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X size={14}/></button></Tooltip>
                                    </div>
                                </div>
                            ))}
                            {newlyAddedFiles.map(file => (
                                <div key={file.id} className="relative aspect-square group">
                                    <img src={file.preview} alt="" className="w-full h-full object-cover rounded-lg"/>
                                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-xs">
                                        <Loader2 className="w-5 h-5 animate-spin"/>
                                        <p className="mt-1">{file.status}...</p>
                                    </div>
                                </div>
                            ))}
                            <label onDrop={handleDrop} onDragOver={e => e.preventDefault()} onDragEnter={e => e.preventDefault()} htmlFor="photo-upload" className="aspect-square border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 hover:bg-slate-700/50 transition-colors">
                                <UploadCloud className="w-6 h-6 text-slate-500"/>
                                <span className="text-xs text-slate-400 mt-1 text-center">Add Photos</span>
                            </label>
                             <input type="file" id="photo-upload" multiple accept="image/*" className="hidden" onChange={e => { if(e.target.files) processFiles(e.target.files) }} />
                        </div>
                         {newlyAddedFiles.length > 0 && (
                            <div className="mt-4 text-right">
                                <button onClick={handleAddPhotosToMoment} className="bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold px-4 py-2 rounded-full">Add {newlyAddedFiles.length} Photo(s)</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

             {showGuide && onCloseGuide && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[55]" onClick={onCloseGuide}>
                    <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-[30%] right-[calc(50%-10rem)] w-64 animate-fade-in-up">
                            <div style={{ transform: 'rotate(20deg) scaleX(-1)', transformOrigin: 'bottom left', marginLeft: 'auto', marginRight: '3rem' }}>
                                <div className="animate-point-and-click">
                                    <Hand className="w-16 h-16 text-cyan-400/80" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 bg-slate-800/95 backdrop-blur-sm p-4 rounded-lg shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-400/50">
                                <h4 className="font-bold text-white mb-2">æterny's Guide</h4>
                                <p className="text-sm text-slate-300">
                                    Try the <strong>AI Curation Studio</strong> to rewrite your story, add new photos, or generate a stunning "Living Photo" animation for your header image.
                                </p>
                                <button onClick={onCloseGuide} className="mt-4 w-full bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 text-sm font-bold py-2 rounded-lg transition-colors">
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isImageEditModalOpen && imageToEdit && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={handleCloseEditModal}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center"><h2 className="text-xl font-bold font-brand text-white">AI Photo Editor</h2><button onClick={handleCloseEditModal} className="text-slate-400 hover:text-white"><X /></button></div>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-y-auto">
                            <div className="md:col-span-2 bg-black/20 rounded-lg flex items-center justify-center relative">
                                <img src={editedImageUrl || imageToEdit.url} alt="Image to edit" className="max-w-full max-h-full object-contain rounded"/>
                                {isGeneratingEdit && <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin mb-2" /><p>Generating...</p></div>}
                                {editedImageUrl && (
                                    <div className="absolute top-2 left-2 flex gap-2">
                                        <span className="bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full">After</span>
                                        <button onClick={() => setEditedImageUrl(null)} className="text-xs text-slate-300 hover:underline">Show Original</button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Describe your edit</h3>
                                    <input type="text" value={editPrompt} onChange={e => setEditPrompt(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleImageEdit()} placeholder="e.g., Add a vintage film filter" className="w-full bg-slate-700 p-2 rounded-md text-sm"/>
                                    <button onClick={handleImageEdit} disabled={!editPrompt || isGeneratingEdit} className="w-full mt-2 bg-slate-600 hover:bg-slate-500 text-sm font-semibold p-2 rounded-md disabled:opacity-50">Generate</button>
                                    {editError && <p className="text-xs text-red-400 mt-1">{editError}</p>}
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Or try a suggestion</h3>
                                    {isSuggesting ? <Loader2 className="w-5 h-5 animate-spin"/> : (
                                        <div className="space-y-2">
                                            {curationAnalysis?.suggestions.map(s => <button key={s} onClick={() => { setEditPrompt(s); handleImageEdit(); }} className="w-full text-left text-sm p-2 bg-slate-700/50 hover:bg-slate-700 rounded-md">{s}</button>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                         <div className="p-4 border-t border-slate-700 flex justify-end gap-4"><button onClick={handleCloseEditModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-full">Cancel</button><button onClick={handleAcceptEdit} disabled={!editedImageUrl} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-full disabled:bg-gray-700 disabled:cursor-not-allowed">Accept & Save</button></div>
                    </div>
                </div>
            )}

            {videoModalOpen && selectedMoment && (
                <LivingSlideshowPlayer 
                    moment={selectedMoment}
                    aeternyVoice={aeternyVoice}
                    aeternyStyle={aeternyStyle}
                    onClose={() => setVideoModalOpen(false)}
                />
            )}
        </div>
    );
};

export default CuratePage;
