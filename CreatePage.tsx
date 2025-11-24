import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createStoryFromImages, rewriteStory } from '../services/geminiService';
import { Moment, Page, UserTier } from '../types';
import { UploadCloud, X, Star, MapPin, Users, Tag, RotateCw, Loader2, BookOpen, FilePenLine, BookImage, Hand, Wand2, Bike, CakeSlice, Briefcase } from 'lucide-react';


interface CreatePageProps {
    onCreateMoment: (moment: Omit<Moment, 'id' | 'pinned'>) => void;
    onNavigate: (page: Page) => void;
    userTier: UserTier;
    showGuide?: boolean;
    onCloseGuide?: () => void;
}

interface SelectedFile {
    id: string;
    file: File;
    preview: string;
    status: 'uploading' | 'analyzing' | 'complete';
    isHeader: boolean;
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

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const TeaserCard: React.FC<{ icon: React.ElementType; title: string; description: string; onClick: () => void }> = ({ icon: Icon, title, description, onClick }) => (
    <button onClick={onClick} className="bg-slate-800/50 p-4 rounded-lg ring-1 ring-white/10 text-left flex items-start gap-4 hover:bg-slate-700/50 hover:ring-amber-500/30 transition-all h-full">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-500/10 rounded-md flex items-center justify-center ring-1 ring-amber-500/20">
            <Icon className="w-5 h-5 text-amber-300" />
        </div>
        <div>
            <h4 className="font-bold text-white text-sm">{title}</h4>
            <p className="text-xs text-slate-400">{description}</p>
        </div>
    </button>
);

const CreatePage: React.FC<CreatePageProps> = ({ onCreateMoment, onNavigate, userTier, showGuide, onCloseGuide }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRewriting, setIsRewriting] = useState(false);
    
    const [promptInput, setPromptInput] = useState('');
    const [newTag, setNewTag] = useState({ location: '', people: '', activities: '' });

    const hasTriggeredGeneration = useRef(false);

    const imageLimit = useMemo(() => {
        switch (userTier) {
            case 'legacy': return 20;
            case 'fæmily': return 10;
            case 'essæntial': return 10;
            case 'free': return 5;
            default: return 5;
        }
    }, [userTier]);

    const photoCountExceeded = selectedFiles.length > imageLimit;

    const processFiles = useCallback(async (files: FileList) => {
        const newFilesPromises = Array.from(files).map(async (file): Promise<SelectedFile> => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            preview: await fileToDataUrl(file), // Use persistent data URL
            status: 'uploading',
            isHeader: false,
        }));
        
        const newFiles = await Promise.all(newFilesPromises);

        setSelectedFiles(prevFiles => {
            const combined = [...prevFiles, ...newFiles];
            if (!combined.some(f => f.isHeader) && combined.length > 0) {
                combined[0].isHeader = true;
            }
            return combined;
        });
        setGeneratedContent(null);
        hasTriggeredGeneration.current = false;
    }, []);
    
    const handleGenerateStory = useCallback(async () => {
        if (!selectedFiles.length || isGenerating || hasTriggeredGeneration.current) return;
    
        hasTriggeredGeneration.current = true;
        setIsGenerating(true);
        setGeneratedContent(null);
    
        try {
            const imagePayloads = await Promise.all(
                selectedFiles.map(async (sf) => ({
                    data: await fileToBase64(sf.file),
                    mimeType: sf.file.type,
                }))
            );
            const result = await createStoryFromImages(imagePayloads);
            setGeneratedContent(result);
        } catch (error) {
            console.error("Error generating story:", error);
            setGeneratedContent({
                title: 'An error occurred',
                story: 'Sorry, I was unable to create a story from these images. Please try again.',
                tags: { location: [], people: [], activities: [] }
            });
        } finally {
            setIsGenerating(false);
        }
    }, [selectedFiles, isGenerating]);


    useEffect(() => {
        const uploadingFiles = selectedFiles.filter(f => f.status === 'uploading');
        if (uploadingFiles.length > 0) {
            const timer = setTimeout(() => {
                setSelectedFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'analyzing' } : f));
            }, 1000);
            return () => clearTimeout(timer);
        }

        const analyzingFiles = selectedFiles.filter(f => f.status === 'analyzing');
        if (analyzingFiles.length > 0) {
             const timer = setTimeout(() => {
                setSelectedFiles(prev => prev.map(f => f.status === 'analyzing' ? { ...f, status: 'complete' } : f));
            }, 2000);
            return () => clearTimeout(timer);
        }
        
        const allComplete = selectedFiles.length > 0 && selectedFiles.every(f => f.status === 'complete');
        if (allComplete) {
            handleGenerateStory();
        }

    }, [selectedFiles, handleGenerateStory]);


    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) processFiles(e.target.files); };
    
    const handleRemoveFile = (id: string) => {
        setSelectedFiles(prev => {
            const remaining = prev.filter(f => f.id !== id);
            // If the removed file was the header, and there are files left, assign a new header
            if (prev.find(f => f.id === id)?.isHeader && remaining.length > 0) {
                remaining[0].isHeader = true;
            }
            return remaining;
        });
    };

    const handleSetHeader = (id: string) => setSelectedFiles(prev => prev.map(f => ({ ...f, isHeader: f.id === id })));
    
    const handleContentChange = (field: 'title' | 'story', value: string) => {
        if (!generatedContent) return;
        setGeneratedContent({ ...generatedContent, [field]: value });
    };

    const handleRewrite = async (prompt: string) => {
        if (!generatedContent || isRewriting || !prompt) return;
        setIsRewriting(true);
        try {
            const rewrittenStory = await rewriteStory(generatedContent.story, prompt);
            setGeneratedContent(prev => prev ? { ...prev, story: rewrittenStory } : null);
        } catch (error) {
            console.error("Error rewriting story:", error);
        } finally {
            setIsRewriting(false);
        }
    };
    
    const handlePromptRewrite = () => {
        handleRewrite(promptInput);
        setPromptInput('');
    };

    const handleAddTag = (category: keyof GeneratedContent['tags']) => {
        if (!generatedContent || !newTag[category].trim()) return;
        setGeneratedContent(prev => prev ? {
            ...prev,
            tags: {
                ...prev.tags,
                [category]: [...prev.tags[category], newTag[category].trim()]
            }
        } : null);
        setNewTag(prev => ({ ...prev, [category]: '' }));
    };

    const handleRemoveTag = (category: keyof GeneratedContent['tags'], tagToRemove: string) => {
        if (!generatedContent) return;
        setGeneratedContent(prev => prev ? {
            ...prev,
            tags: {
                ...prev.tags,
                [category]: prev.tags[category].filter(t => t !== tagToRemove)
            }
        } : null);
    };


    const handleCreateMomentClick = () => {
        if (!generatedContent || !selectedFiles.length || photoCountExceeded) return;

        const headerImage = selectedFiles.find(f => f.isHeader) || selectedFiles[0];
        
        const newMoment: Omit<Moment, 'id' | 'pinned'> = {
            type: 'standard',
            aiTier: 'diamond',
            image: headerImage.preview,
            images: selectedFiles.map(f => f.preview),
            title: generatedContent.title,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            description: generatedContent.story,
            location: generatedContent.tags.location[0] || undefined,
            people: generatedContent.tags.people,
            activities: generatedContent.tags.activities,
            photoCount: selectedFiles.length
        };

        onCreateMoment(newMoment);
    };
    
    const allUploadsComplete = selectedFiles.length > 0 && selectedFiles.every(f => f.status === 'complete');

    const TagEditor: React.FC<{ category: keyof GeneratedContent['tags'], icon: React.ElementType, placeholder: string }> = ({ category, icon: Icon, placeholder }) => (
        <div>
            <div className="flex flex-wrap items-center gap-2">
                {generatedContent?.tags[category].map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 bg-gray-700 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                        <Icon className="w-3.5 h-3.5"/>
                        {tag}
                        <button onClick={() => handleRemoveTag(category, tag)} className="text-slate-500 hover:text-white"><X size={12}/></button>
                    </span>
                ))}
                 <form onSubmit={(e) => { e.preventDefault(); handleAddTag(category); }} className="flex-grow">
                    <input
                        type="text"
                        value={newTag[category]}
                        onChange={(e) => setNewTag(prev => ({...prev, [category]: e.target.value}))}
                        placeholder={placeholder}
                        className="bg-transparent text-xs text-slate-300 focus:outline-none w-full min-w-[80px]"
                    />
                </form>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-6 pt-28 pb-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 font-brand">Create a New Momænt</h1>
                <p className="text-lg text-slate-400">Add photos and watch as æterny crafts your story in real-time.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Upload Photos */}
                <div className={`bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10 flex flex-col ${showGuide ? 'relative z-[56] animate-guide-pulse' : ''}`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
                    <h2 className="text-2xl font-bold text-white mb-4 font-brand">1. Add Your Photos</h2>
                    
                     {photoCountExceeded && (
                        <div className="bg-amber-900/50 border border-amber-500/50 p-4 rounded-lg mb-4">
                            <h3 className="font-bold text-amber-300">Image Limit Reached</h3>
                            <p className="text-sm text-slate-300">
                                Your '<span className="capitalize">{userTier}</span>' plan allows for a maximum of {imageLimit} photos per momænt. 
                                Please remove {selectedFiles.length - imageLimit} photo(s) to continue. 
                                Your story was generated using all uploaded images for the best result.
                            </p>
                            <p className="font-bold text-amber-300 text-lg mt-2">{selectedFiles.length} / {imageLimit}</p>
                        </div>
                    )}

                    <div className="flex-grow">
                        {selectedFiles.length === 0 ? (
                             <label htmlFor="file-upload" className={`relative flex-grow border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors min-h-[300px] cursor-pointer ${isDragging ? 'border-cyan-400 bg-cyan-900/20' : 'border-gray-600 hover:border-gray-500'}`}>
                                <UploadCloud className="w-16 h-16 text-slate-500 mb-4" />
                                <p className="text-slate-400 font-semibold">Drag & drop photos here</p>
                                <p className="text-slate-500 text-sm">or click to browse</p>
                            </label>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                                {selectedFiles.map(file => (
                                    <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
                                        {file.status !== 'complete' && <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mb-2"></div>{file.status === 'uploading' ? 'Uploading...' : 'Analyzing...'}</div>}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => handleSetHeader(file.id)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center" title="Set as header"><Star fill={file.isHeader ? 'currentColor' : 'none'} className="w-5 h-5 text-white" /></button>
                                            <button onClick={() => handleRemoveFile(file.id)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center" title="Remove image"><X className="w-5 h-5 text-white" /></button>
                                        </div>
                                        {file.isHeader && <div className="absolute top-1 left-1 bg-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">HEADER</div>}
                                    </div>
                                ))}
                                <label htmlFor="file-upload" className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-700/50 transition-colors"><span className="text-3xl text-slate-500">+</span><span className="text-xs text-slate-400">Add More</span></label>
                            </div>
                        )}
                    </div>
                    <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileSelect} accept="image/*" />
                    
                    <div className="relative my-6 text-center">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-700" /></div>
                        <div className="relative flex justify-center"><span className="bg-gray-800 px-4 text-sm text-slate-400">Or</span></div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => onNavigate(Page.SmartCollection)} className="w-full bg-slate-700/50 p-4 rounded-lg ring-1 ring-white/10 text-left flex items-start gap-4 hover:bg-slate-700 hover:ring-cyan-500/30 transition-all">
                             <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/10 rounded-md flex items-center justify-center ring-1 ring-cyan-500/20">
                                <Wand2 className="w-5 h-5 text-cyan-300" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Create from Existing</h4>
                                <p className="text-xs text-slate-400">Let æterny find themes in your timestream and build a new collection.</p>
                            </div>
                        </button>
                        <button onClick={() => onNavigate(Page.BulkUpload)} className="w-full bg-slate-700/50 p-4 rounded-lg ring-1 ring-white/10 text-left flex items-start gap-4 hover:bg-slate-700 hover:ring-amber-500/30 transition-all">
                            <div className="flex-shrink-0 w-10 h-10 bg-amber-500/10 rounded-md flex items-center justify-center ring-1 ring-amber-500/20">
                                <UploadCloud className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Use Bulk Upload</h4>
                                <p className="text-xs text-slate-400">Automatically declutter and curate thousands of photos for you.</p>
                            </div>
                        </button>
                    </div>
                    
                </div>

                {/* Right Side: AI Storyteller */}
                 <div className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10 flex flex-col">
                    <h2 className="text-2xl font-bold text-white mb-4 font-brand">2. Review æterny's Draft</h2>
                     <div className="flex-grow space-y-6">
                        {!allUploadsComplete && selectedFiles.length > 0 && <div className="text-center p-8 text-slate-400">Processing photos...</div>}
                        {isGenerating && (
                            <div className="text-center p-8">
                                <div className="flex items-center justify-center text-slate-300">
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    æterny is writing your story...
                                </div>
                            </div>
                        )}
                        {generatedContent && (
                            <>
                                <div>
                                    <label className="text-sm font-semibold text-slate-400">Title</label>
                                    <div contentEditable onBlur={e => handleContentChange('title', e.currentTarget.textContent || '')} suppressContentEditableWarning className="text-2xl font-bold text-white mt-1 p-2 rounded-md bg-transparent hover:bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors" dangerouslySetInnerHTML={{ __html: generatedContent.title }} />
                                </div>
                                 <div>
                                    <label className="text-sm font-semibold text-slate-400">Story</label>
                                    {isRewriting ? (
                                        <div className="min-h-[100px] flex items-center justify-center text-slate-300">
                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            Rewriting...
                                        </div>
                                    ) : (
                                        <div contentEditable onBlur={e => handleContentChange('story', e.currentTarget.textContent || '')} suppressContentEditableWarning className="text-slate-300 mt-1 p-2 rounded-md bg-transparent hover:bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors min-h-[100px] whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: generatedContent.story.replace(/\n/g, '<br/>') }} />
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                                        <RotateCw className="w-4 h-4" />
                                        Refine story with æterny
                                    </label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            value={promptInput}
                                            onChange={(e) => setPromptInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handlePromptRewrite()}
                                            placeholder="e.g., 'Make it more poetic...'"
                                            disabled={isRewriting}
                                            className="w-full bg-gray-900/50 border border-white/10 rounded-md py-2 px-3 text-sm text-white placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                        />
                                        <button onClick={handlePromptRewrite} disabled={isRewriting || !promptInput.trim()} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50">Refine</button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-slate-400">Tags</h4>
                                    <TagEditor category="location" icon={MapPin} placeholder="+ Location" />
                                    <TagEditor category="people" icon={Users} placeholder="+ People" />
                                    <TagEditor category="activities" icon={Tag} placeholder="+ Activity" />
                                </div>
                            </>
                        )}
                        {!generatedContent && !isGenerating && <div className="text-center text-slate-500 pt-16">Upload photos and æterny's draft will appear here.</div>}
                     </div>
                     <button onClick={handleCreateMomentClick} disabled={!generatedContent || photoCountExceeded} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 text-lg rounded-full transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-auto">Create Momænt</button>
                 </div>
            </div>

            <div className="mt-12 border-t border-white/10 pt-8">
                <h3 className="text-lg font-bold text-white mb-4 font-brand text-center">Elevate Your Story</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <TeaserCard icon={BookImage} title="Premium Photobooks" description="Turn your favorite momænts into museum-quality tangible heirlooms." onClick={() => onNavigate(Page.Shop)} />
                    <TeaserCard icon={BookOpen} title="æternacy Magazine" description="Receive a stunning quarterly digital magazine of your life's highlights." onClick={() => onNavigate(Page.Shop)} />
                    <TeaserCard icon={FilePenLine} title="Instant Journaling" description="Capture fleeting thoughts and let æterny build your daily story." onClick={() => onNavigate(Page.Shop)} />
                </div>
            </div>
            
            {showGuide && onCloseGuide && (
                <div className="fixed inset-0 bg-black/70 z-[55]" onClick={onCloseGuide}>
                    <div className="relative w-full h-full max-w-7xl mx-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-[30%] left-[2%] md:left-[5%] lg:left-[10%] w-64 animate-fade-in-up">
                            <Hand fill="currentColor" className="w-16 h-16 text-cyan-400/80 animate-point-and-click" style={{ transform: 'rotate(90deg) scaleX(-1)', transformOrigin: 'bottom left' }} />
                            <div className="absolute top-0 left-20 bg-slate-800 p-4 rounded-lg shadow-2xl ring-1 ring-white/10">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white">æterny's Guide</h4>
                                    <button onClick={onCloseGuide} className="text-slate-400 hover:text-white -mt-1 -mr-1"><X size={16}/></button>
                                </div>
                                <p className="text-sm text-slate-300">
                                    Start here! Add photos by dragging them into this panel. æterny will then automatically create a story draft for you on the right.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePage;