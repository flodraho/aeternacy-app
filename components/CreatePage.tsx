
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createStoryFromImages, rewriteStory } from '../services/geminiService';
import { Moment, Page, UserTier } from '../types';
import { UploadCloud, X, Star, MapPin, Users, Tag, RotateCw, Loader2, BookOpen, FilePenLine, BookImage, Hand, Wand2, Bike, CakeSlice, Briefcase, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react';
import GoogleIcon from './icons/GoogleIcon';
import AppleIcon from './icons/AppleIcon';
import MetaIcon from './icons/MetaIcon';
import CloudImportModal, { CloudProvider } from './CloudImportModal';

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

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const CreatePage: React.FC<CreatePageProps> = ({ onCreateMoment, onNavigate, userTier, showGuide, onCloseGuide }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRewriting, setIsRewriting] = useState(false);
    const [activeCloudProvider, setActiveCloudProvider] = useState<CloudProvider | null>(null);
    const [promptInput, setPromptInput] = useState('');
    const [newTag, setNewTag] = useState({ location: '', people: '', activities: '' });
    
    // New State for "Studio Mode"
    const [activeViewImage, setActiveViewImage] = useState<string | null>(null);

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

    const processFiles = useCallback(async (files: File[] | FileList) => {
        const fileArray = files instanceof FileList ? Array.from(files) : files;
        const newFilesPromises = fileArray.map(async (file): Promise<SelectedFile> => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            preview: await fileToDataUrl(file),
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
        
        // Auto-set the first image as the active view if none selected
        if (!activeViewImage && newFiles.length > 0) {
            setActiveViewImage(newFiles[0].preview);
        }

        setGeneratedContent(null);
        hasTriggeredGeneration.current = false;
    }, [activeViewImage]);
    
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
            
            if (userTier === 'free') {
                setGeneratedContent({
                    title: 'New Momænt',
                    story: 'Upgrade to an Essæntial, Fæmily, or Lægacy plan to unlock AI-generated narratives for your memories.',
                    tags: result.tags
                });
            } else {
                setGeneratedContent(result);
            }
    
        } catch (error) {
            console.error("Error generating story:", error);
            setGeneratedContent({
                title: 'Untitled Moment',
                story: 'We could not generate a story at this time. Feel free to write your own.',
                tags: { location: [], people: [], activities: [] }
            });
        } finally {
            setIsGenerating(false);
        }
    }, [selectedFiles, isGenerating, userTier]);


    useEffect(() => {
        const uploadingFiles = selectedFiles.filter(f => f.status === 'uploading');
        if (uploadingFiles.length > 0) {
            const timer = setTimeout(() => {
                setSelectedFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'analyzing' } : f));
            }, 800);
            return () => clearTimeout(timer);
        }

        const analyzingFiles = selectedFiles.filter(f => f.status === 'analyzing');
        if (analyzingFiles.length > 0) {
             const timer = setTimeout(() => {
                setSelectedFiles(prev => prev.map(f => f.status === 'analyzing' ? { ...f, status: 'complete' } : f));
            }, 1500);
            return () => clearTimeout(timer);
        }
        
        const allComplete = selectedFiles.length > 0 && selectedFiles.every(f => f.status === 'complete');
        if (allComplete && !hasTriggeredGeneration.current) {
            handleGenerateStory();
        }
    }, [selectedFiles, handleGenerateStory]);


    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) processFiles(e.target.files); };
    
    const handleRemoveFile = (id: string) => {
        setSelectedFiles(prev => {
            const remaining = prev.filter(f => f.id !== id);
            if (prev.find(f => f.id === id)?.isHeader && remaining.length > 0) {
                remaining[0].isHeader = true;
            }
            return remaining;
        });
        // If we removed the active view image, reset it
        const removedFile = selectedFiles.find(f => f.id === id);
        if (removedFile?.preview === activeViewImage) {
            const remaining = selectedFiles.filter(f => f.id !== id);
            setActiveViewImage(remaining.length > 0 ? remaining[0].preview : null);
        }
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
            console.error("Error rewriting:", error);
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

    const TagPill: React.FC<{ text: string, icon: React.ElementType, onRemove: () => void }> = ({ text, icon: Icon, onRemove }) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 border border-white/10 text-xs text-slate-300 hover:bg-slate-800 transition-colors group cursor-default">
            <Icon className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            {text}
            <button onClick={onRemove} className="ml-1 text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
        </span>
    );

    // --- Empty State (The Portal) ---
    if (selectedFiles.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 -mt-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
                
                <div className={`relative w-full max-w-2xl p-12 rounded-3xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center text-center gap-6 group ${isDragging ? 'border-cyan-500 bg-cyan-500/10 scale-105' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                    onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                >
                    <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center ring-1 ring-white/10 shadow-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                         <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-cyan-400' : 'text-slate-400'}`} />
                    </div>
                    
                    <div className="space-y-2 pointer-events-none">
                        <h1 className="text-4xl font-bold font-brand tracking-tight">Ignite a Memory</h1>
                        <p className="text-slate-400">Drag & drop photos to start crafting your story.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 pointer-events-auto z-10">
                         <label htmlFor="file-upload" className="bg-white text-slate-900 hover:bg-cyan-50 px-6 py-3 rounded-full font-bold text-sm cursor-pointer transition-colors shadow-lg">
                            Select Photos
                        </label>
                        <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileSelect} accept="image/*" />
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Or import from cloud</p>
                    <div className="flex gap-4">
                        <button onClick={() => setActiveCloudProvider('google')} className="p-3 bg-slate-900 rounded-full border border-white/10 hover:border-white/30 hover:bg-slate-800 transition-all" title="Google Photos"><GoogleIcon className="w-5 h-5"/></button>
                        <button onClick={() => setActiveCloudProvider('apple')} className="p-3 bg-slate-900 rounded-full border border-white/10 hover:border-white/30 hover:bg-slate-800 transition-all" title="iCloud"><AppleIcon className="w-5 h-5 text-white"/></button>
                        <button onClick={() => setActiveCloudProvider('meta')} className="p-3 bg-slate-900 rounded-full border border-white/10 hover:border-white/30 hover:bg-slate-800 transition-all" title="Instagram"><MetaIcon className="w-5 h-5 text-white"/></button>
                    </div>
                </div>

                <div className="w-full max-w-2xl mt-8 pt-8 border-t border-white/5 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => onNavigate(Page.SmartCollection)} className="w-full bg-slate-800/50 p-4 rounded-lg ring-1 ring-white/10 text-left flex items-start gap-4 hover:bg-slate-800 hover:ring-cyan-500/30 transition-all">
                             <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/10 rounded-md flex items-center justify-center ring-1 ring-cyan-500/20">
                                <Wand2 className="w-5 h-5 text-cyan-300" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Create from Existing</h4>
                                <p className="text-xs text-slate-400">Let æterny find themes in your timestream and build a new collection.</p>
                            </div>
                        </button>
                        <button onClick={() => onNavigate(Page.BulkUpload)} className="w-full bg-slate-800/50 p-4 rounded-lg ring-1 ring-white/10 text-left flex items-start gap-4 hover:bg-slate-800 hover:ring-amber-500/30 transition-all">
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

                {activeCloudProvider && (
                    <CloudImportModal 
                        isOpen={!!activeCloudProvider}
                        onClose={() => setActiveCloudProvider(null)}
                        provider={activeCloudProvider}
                        onImport={processFiles}
                    />
                )}
            </div>
        );
    }

    // --- Filled State (The Studio) ---
    const headerImageFile = selectedFiles.find(f => f.isHeader) || selectedFiles[0];
    
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row overflow-hidden h-screen">
            {/* Left: Visual Canvas */}
            <div className="relative flex-1 h-[50vh] lg:h-auto bg-black overflow-hidden group">
                <div className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30" style={{ backgroundImage: `url(${activeViewImage})` }}></div>
                <img 
                    src={activeViewImage || headerImageFile.preview} 
                    alt="Active View" 
                    className="absolute inset-0 w-full h-full object-contain p-4 lg:p-12 transition-all duration-500"
                />
                
                {/* Mini Gallery / Filmstrip */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex gap-3 overflow-x-auto scrollbar-hide justify-center">
                    <label htmlFor="add-more" className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 flex-shrink-0">
                        <input type="file" id="add-more" className="hidden" multiple onChange={handleFileSelect} accept="image/*" />
                        <span className="text-2xl text-slate-400">+</span>
                    </label>
                    {selectedFiles.map(file => (
                        <div 
                            key={file.id} 
                            onClick={() => setActiveViewImage(file.preview)}
                            className={`relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer transition-all flex-shrink-0 border-2 ${activeViewImage === file.preview ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={file.preview} className="w-full h-full object-cover" alt="thumbnail" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={(e) => { e.stopPropagation(); handleRemoveFile(file.id); }} className="p-1 bg-red-500/80 rounded-full text-white"><X size={10}/></button>
                            </div>
                            {file.isHeader && <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-cyan-400 rounded-full shadow-sm"></div>}
                        </div>
                    ))}
                </div>
                
                <div className="absolute top-6 left-6">
                    <button onClick={() => onNavigate(Page.Home)} className="bg-black/40 backdrop-blur-md p-2 rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-colors"><X className="w-6 h-6"/></button>
                </div>
            </div>

            {/* Right: Narrative Studio */}
            <div className="flex-1 lg:max-w-xl bg-slate-900/95 border-l border-white/5 flex flex-col h-[50vh] lg:h-auto shadow-2xl relative z-10">
                
                {/* Studio Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900">
                    <div>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Creation Studio</h2>
                        {isGenerating && <p className="text-xs text-cyan-400 flex items-center gap-1 mt-1 animate-pulse"><Sparkles size={10}/> æterny is writing...</p>}
                    </div>
                    {photoCountExceeded && <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded border border-amber-500/30">Limit Reached</span>}
                </div>

                {/* Editor Area */}
                <div className="flex-grow overflow-y-auto p-8 space-y-8">
                    {!generatedContent && !isGenerating && (
                         <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4 opacity-60">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p>Analyzing your photos...</p>
                        </div>
                    )}

                    {generatedContent && (
                        <div className="space-y-8 animate-fade-in-up">
                            {/* Title Input */}
                            <div className="group relative">
                                <div className="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600"><ImageIcon size={16}/></div>
                                <input 
                                    type="text"
                                    value={generatedContent.title}
                                    onChange={(e) => handleContentChange('title', e.target.value)}
                                    className="w-full bg-transparent text-4xl font-bold font-brand text-white placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-slate-700 transition-colors pb-2"
                                    placeholder="Untitled Moment"
                                />
                            </div>

                            {/* Story Input */}
                            <div className="group relative">
                                <div className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600"><FilePenLine size={16}/></div>
                                <textarea 
                                    value={generatedContent.story}
                                    onChange={(e) => handleContentChange('story', e.target.value)}
                                    className="w-full bg-transparent text-lg text-slate-300 leading-relaxed focus:outline-none resize-none min-h-[200px] font-light"
                                    placeholder="Write your story here..."
                                />
                            </div>

                            {/* Tags Section */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <Tag className="w-3 h-3" /> Smart Tags
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {generatedContent.tags.location.map(t => <TagPill key={t} text={t} icon={MapPin} onRemove={() => handleRemoveTag('location', t)} />)}
                                    {generatedContent.tags.people.map(t => <TagPill key={t} text={t} icon={Users} onRemove={() => handleRemoveTag('people', t)} />)}
                                    {generatedContent.tags.activities.map(t => <TagPill key={t} text={t} icon={Star} onRemove={() => handleRemoveTag('activities', t)} />)}
                                    
                                    {/* Add Tag Input */}
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            className="bg-transparent border border-white/10 rounded-full px-3 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 w-24 transition-all focus:w-32"
                                            placeholder="+ Add tag"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.target as HTMLInputElement).value;
                                                    if (val) {
                                                        setNewTag(prev => ({ ...prev, activities: val }));
                                                        // Optimistic add to 'activities' for simplicity in this demo
                                                        setGeneratedContent(prev => prev ? ({ ...prev, tags: { ...prev.tags, activities: [...prev.tags.activities, val] } }) : null);
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Toolbar */}
                <div className="p-6 border-t border-white/10 bg-slate-900">
                    {userTier !== 'free' && generatedContent && (
                        <div className="flex items-center gap-2 mb-6 bg-slate-800/50 p-2 rounded-xl ring-1 ring-white/5">
                            <input 
                                type="text" 
                                value={promptInput} 
                                onChange={(e) => setPromptInput(e.target.value)} 
                                placeholder="Ask æterny to rewrite (e.g. 'Make it funnier')" 
                                className="flex-grow bg-transparent px-3 py-1 text-sm text-white placeholder-slate-500 focus:outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && handlePromptRewrite()}
                            />
                            <button onClick={handlePromptRewrite} disabled={isRewriting || !promptInput} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white disabled:opacity-50 transition-colors">
                                {isRewriting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>}
                            </button>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">{selectedFiles.length} photos selected</p>
                        <button 
                            onClick={handleCreateMomentClick} 
                            disabled={!generatedContent || photoCountExceeded} 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-900/20 flex items-center gap-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            Create Momænt <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
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
