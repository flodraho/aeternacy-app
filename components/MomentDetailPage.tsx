
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Moment, AeternyVoice, AeternyStyle, UserTier, Page } from '../types';
import Slideshow from './Slideshow';
import { generateVideo, imageUrlToPayload } from '../services/geminiService';
import { ChevronLeft, Loader2, Film, Pause, Clapperboard, Heart, Zap, Edit, Trash2, Play } from 'lucide-react';
import LightboxGallery from './LightboxGallery';
import LegacyIcon from './icons/LegacyIcon';
import LivingSlideshowPlayer from './LivingSlideshowPlayer';
import Tooltip from './Tooltip';

interface MomentDetailPageProps {
    moment: Moment;
    onBack: () => void;
    onUpdateMoment: (moment: Moment) => void;
    aeternyVoice: AeternyVoice;
    aeternyStyle: AeternyStyle;
    onEditMoment: (moment: Moment) => void;
    onDeleteMoment: (id: string) => void;
    userTier: UserTier;
    onNavigate: (page: Page) => void;
}

const MomentDetailPage: React.FC<MomentDetailPageProps> = ({ moment, onBack, onUpdateMoment, aeternyVoice, aeternyStyle, onEditMoment, onDeleteMoment, userTier, onNavigate }) => {
    // UI State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [initialLightboxIndex, setInitialLightboxIndex] = useState(0);
    const [isLivingSlideshowOpen, setIsLivingSlideshowOpen] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Video State
    const [playableVideoUrl, setPlayableVideoUrl] = useState<string | null>(null);
    const [isLoadingHeroVideo, setIsLoadingHeroVideo] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isKeySelected, setIsKeySelected] = useState(false);
    const [videoGenerationError, setVideoGenerationError] = useState<string | null>(null);
    
    const heroRef = useRef<HTMLElement>(null);

    const allImages = [moment.image, ...(moment.images || [])].filter((img): img is string => !!img);
    const canGenerateVideo = allImages.length > 0;

    // --- Effects ---

    useEffect(() => {
        const checkApiKey = async () => {
            if ((window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                setIsKeySelected(hasKey);
            }
        };
        checkApiKey();
        
        let objectUrl: string | undefined;
        const fetchHeroVideo = async () => {
            if (moment.video && moment.video.includes('generativelanguage.googleapis.com')) {
                setIsLoadingHeroVideo(true);
                setPlayableVideoUrl(null);
                try {
                    const response = await fetch(`${moment.video}&key=${process.env.API_KEY}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch video: ${response.statusText}`);
                    }
                    const blob = await response.blob();
                    objectUrl = URL.createObjectURL(blob);
                    setPlayableVideoUrl(objectUrl);
                } catch (e) {
                    console.error("Failed to load hero video", e);
                    setVideoGenerationError("Could not load the 'Living Photo' for this moment.");
                } finally {
                    setIsLoadingHeroVideo(false);
                }
            } else if (moment.video) {
                // For non-secure URLs or already processed blob URLs
                setPlayableVideoUrl(moment.video);
            } else {
                setPlayableVideoUrl(null);
            }
        };

        fetchHeroVideo();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [moment.video]);


    // --- Handlers ---
    
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to permanently delete this momænt? This action cannot be undone.')) {
            onDeleteMoment(moment.id);
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
        setVideoGenerationError(null);
        try {
            const headerImage = allImages[0];
            const imagePayload = await imageUrlToPayload(headerImage);
            
            const prompt = `Create a beautiful, high-quality, short video that brings this image to life. Animate the scene with gentle, realistic motion, like a slow zoom or a gentle parallax effect, to create a feeling of a living photograph. Thematically, it relates to: ${moment.title}`;
            
            const url = await generateVideo(prompt, imagePayload, "16:9");
            const updatedMoment = { ...moment, video: url };
            onUpdateMoment(updatedMoment);
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
        if (playableVideoUrl) {
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
            <main>
                <section ref={heroRef} className="h-screen w-full relative bg-black flex items-end justify-center text-white pb-24">
                     <div className="absolute top-20 left-6 z-20">
                        <button onClick={onBack} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                            <ChevronLeft className="w-5 h-5" />
                            Back to My Collection
                        </button>
                    </div>

                    {isLoadingHeroVideo ? (
                        <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin mb-3"/>
                            <p>Loading video for preview...</p>
                        </div>
                    ) : playableVideoUrl ? (
                        <div className="absolute inset-0 w-full h-full">
                            <video key={playableVideoUrl} src={playableVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
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
                             {userTier === 'free' && canGenerateVideo ? (
                                <div className="text-center p-4 bg-slate-800/50 rounded-lg ring-1 ring-cyan-500/20">
                                    <button
                                        onClick={() => onNavigate(Page.Subscription)}
                                        className="bg-gray-700 text-slate-400 font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-600 hover:text-white transition-colors"
                                    >
                                        <Film className="w-5 h-5" />
                                        <span>Create Living Slideshow</span>
                                    </button>
                                    <p className="text-xs text-slate-400 mt-2">
                                        🔒 Upgrade to Essæntial or higher to turn your moments into narrated stories.
                                    </p>
                                </div>
                             ) : (
                                canGenerateVideo && (
                                    <button onClick={handleVeoButtonClick} disabled={isGeneratingVideo} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-full transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                                        {isGeneratingVideo ? ( <><Loader2 className="w-5 h-5 animate-spin"/><span>Creating...</span></> ) : playableVideoUrl ? ( <><Film className="w-5 h-5" /><span>View Living Slideshow</span></> ) : ( <><Film className="w-5 h-5" /><span>Create Living Slideshow</span></> )}
                                    </button>
                                )
                             )}
                         </div>
                        <div className="prose prose-invert prose-p:text-slate-300 max-w-none prose-p:text-lg prose-p:leading-relaxed">{moment.description.split('\n').filter(p => p.trim() !== '').map((p, i) => <p key={i}>{p}</p>)}</div>
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
                        {isGeneratingVideo && ( <div className="text-center text-sm text-slate-300 mb-8 p-4 bg-slate-800/50 rounded-lg"><p>æterny is directing your scene... this may take a few minutes.</p></div> )}
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
                            <Tooltip text="Enter Curation Workspace to edit details, add photos, rewrite story, and more.">
                                <button onClick={() => onEditMoment(moment)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Momænt</span>
                                </button>
                            </Tooltip>
                             <Tooltip text="This will permanently delete the moment and all its contents. This action cannot be undone.">
                                <button onClick={handleDelete} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm ring-1 ring-red-500/20 text-red-300 font-semibold py-2 px-4 rounded-full text-sm transition-all">
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Momænt</span>
                                </button>
                            </Tooltip>
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
