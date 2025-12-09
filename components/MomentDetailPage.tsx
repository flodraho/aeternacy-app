
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Moment, AeternyVoice, AeternyStyle } from '../types';
import Slideshow from './Slideshow';
import { generateVideo, imageUrlToPayload, getRelatedMoments, SearchResult } from '../services/geminiService';
import { ChevronLeft, Loader2, Film, Pause, Clapperboard, Heart, Zap, Edit, Trash2, Play, BrainCircuit, ArrowRight } from 'lucide-react';
import LightboxGallery from './LightboxGallery';
import LegacyIcon from './icons/LegacyIcon';
import LivingSlideshowPlayer from './LivingSlideshowPlayer';
import { initialMoments } from '../data/moments';

interface MomentDetailPageProps {
    moment: Moment;
    onBack: () => void;
    onUpdateMoment: (moment: Moment) => void;
    aeternyVoice: AeternyVoice;
    aeternyStyle: AeternyStyle;
    onEditMoment: (moment: Moment) => void;
    onDeleteMoment: (id: number) => void;
}

const MomentDetailPage: React.FC<MomentDetailPageProps> = ({ moment, onBack, onUpdateMoment, aeternyVoice, aeternyStyle, onEditMoment, onDeleteMoment }) => {
    // UI State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [initialLightboxIndex, setInitialLightboxIndex] = useState(0);
    const [isLivingSlideshowOpen, setIsLivingSlideshowOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Contextual RAG State
    const [relatedMoments, setRelatedMoments] = useState<SearchResult[] | null>(null);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);

    // Video State
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isKeySelected, setIsKeySelected] = useState(false);
    const [videoGenerationError, setVideoGenerationError] = useState<string | null>(null);
    const [isGeneratingDirectorsCut, setIsGeneratingDirectorsCut] = useState<string | null>(null);

    const heroRef = useRef<HTMLElement>(null);

    // Deduplicate images to prevent the header image from appearing twice
    const allImages = useMemo(() => {
        const rawImages = [moment.image, ...(moment.images || [])].filter((img): img is string => !!img);
        return Array.from(new Set(rawImages));
    }, [moment.image, moment.images]);

    const canGenerateVideo = allImages.length > 0;

    // --- Effects ---
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Reset state when moment changes
        setVideoUrl(moment.video || null);
        const checkApiKey = async () => {
            if ((window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                setIsKeySelected(hasKey);
            }
        };
        checkApiKey();
    }, [moment]);

    // Fetch related moments (Simulated Contextual RAG)
    useEffect(() => {
        const fetchRelated = async () => {
            setIsLoadingRelated(true);
            try {
                // In a real app, this comes from props or context
                const allMoments = initialMoments; 
                const results = await getRelatedMoments(moment, allMoments);
                setRelatedMoments(results);
            } catch (error) {
                console.error("Failed to fetch related moments", error);
            } finally {
                setIsLoadingRelated(false);
            }
        };
        fetchRelated();
    }, [moment]);


    // --- Handlers ---
    
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to permanently delete this momænt? This action cannot be undone.')) {
            // First, trigger the deletion process in the parent state.
            // This will set `deletingMomentId`.
            onDeleteMoment(moment.id);
            // Then, immediately navigate back. React will batch these updates,
            // so the collection page renders with the `deletingMomentId` already set.
            onBack();
        }
    };
    
    const handlePostComment = () => {
        if (!newComment.trim()) return;

        const commentToAdd = {
            user: 'JD', // Hardcoded current user for demo
            text: newComment.trim(),
            date: new Date().toISOString(),
        };

        const updatedMoment = {
            ...moment,
            comments: [...(moment.comments || []), commentToAdd],
        };

        onUpdateMoment(updatedMoment);
        setNewComment('');
    };


    const generateDirectorCutAndHandleSafety = useCallback(async (momentToUse: Moment, style: 'Cinematic' | 'Nostalgic' | 'Upbeat') => {
        setIsGeneratingDirectorsCut(style);
        setVideoGenerationError(null);

        const stylePrompts = {
            'Cinematic': 'Produce a beautiful cinematic, romantic, slow-motion video based on the provided image. Focus on elegant movements and heartfelt emotions.',
            'Nostalgic': 'Generate a nostalgic, vintage-style video based on the provided image. Apply a warm, grainy, super 8 film aesthetic to evoke cherished memories and a sense of timelessness.',
            'Upbeat': 'Create a lively, upbeat, and celebratory video based on the provided image. Use energetic motion and joyful, dynamic transitions to capture excitement and happiness.'
        };
        
        try {
            // Use local deduplicated images logic or recreate it here
            const currentImages = Array.from(new Set([momentToUse.image, ...(momentToUse.images || [])].filter((img): img is string => !!img)));
            
            if (currentImages.length === 0) {
                throw new Error("This moment has no images to generate a video from.");
            }
            const headerImage = currentImages[0];
            const imagePayload = await imageUrlToPayload(headerImage);
            const prompt = stylePrompts[style];
            
            const url = await generateVideo(prompt, imagePayload, "16:9");
            
            const updatedMoment = { ...momentToUse, video: url };
            onUpdateMoment(updatedMoment);
            setVideoUrl(url);
            setIsLivingSlideshowOpen(true);

        } catch (error) {
            if (error instanceof Error && error.message === "SAFETY_FILTER_BLOCK") {
                 if (window.confirm("The source image was blocked by safety filters. Would you like to remove this image and try generating the video with the next one?")) {
                    const currentImages = Array.from(new Set([momentToUse.image, ...(momentToUse.images || [])].filter((img): img is string => !!img)));
                    const newImages = currentImages.slice(1);

                    if (newImages.length > 0) {
                        const updatedMoment: Moment = {
                            ...momentToUse,
                            image: newImages[0],
                            images: newImages.slice(1),
                            photoCount: newImages.length,
                        };
                        onUpdateMoment(updatedMoment);
                        await generateDirectorCutAndHandleSafety(updatedMoment, style);
                        return; 
                    } else {
                        setVideoGenerationError("No other images were available to try.");
                    }
                 } else {
                     setVideoGenerationError("Video generation cancelled by user.");
                 }
            } else {
                const message = error instanceof Error ? error.message : "An unknown error occurred.";
                if (message.includes("Your API key may be invalid")) {
                    setIsKeySelected(false);
                }
                setVideoGenerationError(message);
            }
        } finally {
            setIsGeneratingDirectorsCut(null);
        }
    }, [onUpdateMoment, setIsKeySelected]);


    const handleGenerateDirectorsCut = async (style: 'Cinematic' | 'Nostalgic' | 'Upbeat') => {
        if (!canGenerateVideo) return;
        
        let keyIsReady = isKeySelected;
        if (!keyIsReady) {
            try {
                await (window as any).aistudio.openSelectKey();
                setIsKeySelected(true); keyIsReady = true;
            } catch (e) {
                setVideoGenerationError("API key selection was cancelled.");
                return;
            }
        }
        if (!keyIsReady) return;

        generateDirectorCutAndHandleSafety(moment, style);
    };


    const handleCreateVeoScene = async () => {
        if (!canGenerateVideo) {
            setVideoGenerationError("This moment has no images to generate a video from.");
            return;
        }
        if (!(window as any).aistudio) {
            setVideoGenerationError("Video generation is not available in this environment.");
            return;
        }

        let keyIsReady = isKeySelected;
        if (!keyIsReady) {
             try {
                await (window as any).aistudio.openSelectKey();
                setIsKeySelected(true);
                keyIsReady = true;
            } catch (e) {
                console.error("Could not open API key selection dialog", e);
                setVideoGenerationError("API key selection was cancelled. Please try again.");
                return;
            }
        }

        if (!keyIsReady) return;

        setIsGeneratingVideo(true);
        setVideoUrl(null);
        setVideoGenerationError(null);
        try {
            const headerImage = allImages[0];
            const imagePayload = await imageUrlToPayload(headerImage);
            
            const prompt = `Create a beautiful, high-quality, short video that brings this image to life. Animate the scene with gentle, realistic motion, like a slow zoom or a gentle parallax effect, to create a feeling of a living photograph. Thematically, it relates to: ${moment.title}`;
            
            const url = await generateVideo(prompt, imagePayload, "16:9");
            const updatedMoment = { ...moment, video: url };
            onUpdateMoment(updatedMoment);
            setVideoUrl(url);
            setIsLivingSlideshowOpen(true);
        } catch (error) {
            console.error("Failed to generate video:", error instanceof Error ? error.message : String(error));
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            if (message.includes("Your API key may be invalid")) {
                setIsKeySelected(false);
            }
            setVideoGenerationError(message);
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    const handleVeoButtonClick = () => {
        if (videoUrl) {
            setIsLivingSlideshowOpen(true);
        } else {
            handleCreateVeoScene();
        }
    };

    const openLightbox = (index: number) => {
        setInitialLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    // --- Render ---

    return (
        <div className="moment-detail-page bg-slate-900 text-white animate-fade-in-up">
            <header className={`fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center transition-colors duration-300 ${isScrolled ? 'bg-slate-900/80 backdrop-blur-sm' : 'bg-transparent'}`}>
                <button onClick={onBack} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                    <ChevronLeft className="w-5 h-5" />
                    Back to My Collection
                </button>
            </header>

            <main>
                <section ref={heroRef} className="h-screen w-full relative bg-black flex items-end justify-center text-white pb-24">
                     {isGeneratingDirectorsCut && ( <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 animate-spin mb-3"/><p>æterny is crafting your <span className="font-semibold">{isGeneratingDirectorsCut}</span> cut...</p><p className="text-sm text-slate-400 mt-1">This may take a few minutes.</p></div> )}
                    {videoUrl ? (
                        <div className="absolute inset-0 w-full h-full">
                            <video key={videoUrl} src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                            <span className="video-watermark">æ</span>
                        </div>
                    ) : (
                        <Slideshow images={allImages.slice(0, 5)} isPlaying={true} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                         <h1 className="text-4xl md:text-6xl font-bold font-brand flex items-center justify-center gap-4" style={{textShadow: '0 2px 20px rgba(0,0,0,0.7)'}}>
                            {moment.isLegacy && <LegacyIcon className="w-8 h-8 text-amber-300" title="Legacy Moment"/>}
                            {moment.title}
                        </h1>
                        <p className="text-lg text-slate-300 mt-2" style={{textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>{moment.date}</p>
                    </div>
                </section>

                <section className="relative z-10 bg-slate-900">
                     <div className="max-w-3xl mx-auto px-6 py-16 story-content">
                         <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 -mt-8">
                             {canGenerateVideo && (
                                <button onClick={handleVeoButtonClick} disabled={isGeneratingVideo} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-full transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                                    {isGeneratingVideo ? ( <><Loader2 className="w-5 h-5 animate-spin"/><span>Creating...</span></> ) : videoUrl ? ( <><Film className="w-5 h-5" /><span>View Living Slideshow</span></> ) : ( <><Film className="w-5 h-5" /><span>Create Living Slideshow</span></> )}
                                </button>
                             )}
                         </div>
                        <div className="prose prose-invert prose-p:text-slate-300 max-w-none prose-p:text-lg prose-p:leading-relaxed">{moment.description.split('\n').filter(p => p.trim() !== '').map((p, i) => <p key={i}>{p}</p>)}</div>
                    </div>
                    
                    {/* Connected Memories Section (RAG) */}
                    <div className="max-w-5xl mx-auto px-6 py-12 mb-12 border-t border-b border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <BrainCircuit className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold font-brand text-white">Connected Threads</h2>
                        </div>
                        {isLoadingRelated ? (
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin"/> æterny is weaving connections...
                            </div>
                        ) : relatedMoments && relatedMoments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedMoments.map(result => {
                                    // In a real app we'd map ID to object, assuming we can find it in 'initialMoments' imported for now
                                    // or passed down. For this demo, we can just display the reason and title if we had the full object.
                                    // Since we only got ID and reason back from Gemini, we need to find the full moment object.
                                    // We are importing initialMoments directly for this simulation.
                                    const relatedMoment = initialMoments.find(m => m.id === result.id);
                                    if (!relatedMoment) return null;

                                    return (
                                        <div key={result.id} className="bg-slate-800/50 p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group cursor-pointer">
                                            <div className="flex gap-4 mb-3">
                                                <img src={relatedMoment.image || relatedMoment.images?.[0]} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" alt={relatedMoment.title} />
                                                <div>
                                                    <h4 className="font-bold text-white text-sm line-clamp-1">{relatedMoment.title}</h4>
                                                    <p className="text-xs text-slate-400 mt-1">{relatedMoment.date}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-cyan-200 italic border-l-2 border-cyan-500 pl-3 py-1">"{result.reason}"</p>
                                            <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-xs font-bold text-white flex items-center gap-1 hover:underline">View Connection <ArrowRight className="w-3 h-3"/></button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm">No specific connections found for this moment.</p>
                        )}
                    </div>

                    <div className="max-w-3xl mx-auto px-6 pb-16">
                        <h2 className="text-3xl font-bold font-brand mb-6">Conversation</h2>
                        <div className="space-y-6">
                            {(moment.comments || []).map((comment, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center font-bold text-white text-sm" title={comment.user}>
                                        {comment.user}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-semibold text-white">{comment.user === 'JD' ? 'John Doe' : 'Alex Doe'}</p>
                                            <p className="text-xs text-slate-400">{new Date(comment.date).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-slate-300">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-700/50">
                             <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center font-bold text-white text-sm" title="John Doe">
                                    JD
                                </div>
                                <div className="flex-grow">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add your own reflection to this momænt..."
                                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                        rows={3}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button 
                                            onClick={handlePostComment}
                                            disabled={!newComment.trim()}
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        >
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>


                    <div className="max-w-5xl mx-auto px-6 pb-20">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8"><div><h2 className="text-3xl font-bold font-brand">Moment Gallery</h2><p className="text-slate-400">{allImages.length} photo{allImages.length !== 1 && 's'} captured.</p></div></div>
                        {(isGeneratingVideo || isGeneratingDirectorsCut) && ( <div className="text-center text-sm text-slate-300 mb-8 p-4 bg-slate-800/50 rounded-lg"><p>æterny is directing your scene... this may take a few minutes.</p></div> )}
                        {videoGenerationError && ( <div className="mb-8 text-red-400 text-sm p-3 bg-red-900/30 rounded-lg text-center"><p>{videoGenerationError}</p>{(!isKeySelected || videoGenerationError.includes("quota")) && <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline mt-1 inline-block">Learn more about billing</a>}</div> )}

                        <div className="masonry-grid">
                            {allImages.map((image, index) => (
                                <div key={index} className="masonry-item mb-4">
                                    <button onClick={() => openLightbox(index)} className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer group block w-full">
                                        <img src={image} alt={`Moment image ${index + 1}`} className="w-full h-auto block object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="max-w-3xl mx-auto px-6 pb-16">
                         <div className="border-t border-slate-700/50 pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button onClick={() => onEditMoment(moment)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                                <Edit className="w-4 h-4" />
                                <span>Edit Momænt</span>
                            </button>
                            <button onClick={handleDelete} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm ring-1 ring-red-500/20 text-red-300 font-semibold py-2 px-4 rounded-full text-sm transition-all">
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Momænt</span>
                            </button>
                        </div>
                    </div>
                </section>
            </main>
            
            {isLightboxOpen && <LightboxGallery images={allImages} initialIndex={initialLightboxIndex} onClose={() => setIsLightboxOpen(false)} />}
            
            {isLivingSlideshowOpen && (
                <LivingSlideshowPlayer
                    moment={moment}
                    aeternyVoice={aeternyVoice}
                    aeternyStyle={aeternyStyle}
                    onClose={() => setIsLivingSlideshowOpen(false)}
                />
            )}
        </div>
    );
};

export default MomentDetailPage;
