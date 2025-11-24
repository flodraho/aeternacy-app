
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Moment, AeternyVoice, AeternyStyle, UserTier } from '../types';
import { textToSpeech, generateFirstMomentDetails, generateVideo, checkImageForMinors, startAeternyChat } from '../services/geminiService';
import { Volume2, CheckCircle, Speaker, UploadCloud, Loader2, Feather, ArrowRight, BookHeart, HelpCircle, Film, Zap, BookImage, Headset, User, Users, Send } from 'lucide-react';
import AeternyAvatarDisplay from './AeternyAvatarDisplay';
import Tooltip from './Tooltip';

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

interface FirstMomentCardProps {
    moment: Moment;
}

const FirstMomentCard: React.FC<FirstMomentCardProps> = ({ moment }) => (
    <div className="w-full max-w-sm bg-gray-800/50 rounded-3xl overflow-hidden ring-1 ring-white/10 flex flex-col mx-auto animate-fade-in-up">
        <div className="relative h-48 bg-black">
            {moment.video ? (
                 <div className="relative w-full h-full animate-ken-burns-1" style={{ animationDuration: '20s' }}>
                    <img src={moment.image} alt={moment.title} className="w-full h-full object-cover"/>
                    <span className="video-watermark">æ</span>
                </div>
            ) : (
                <img src={moment.image} alt={moment.title} className="w-full h-full object-cover"/>
            )}
        </div>
        <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-lg font-bold text-white font-brand">{moment.title}</h3>
            <p className="text-sm text-slate-500">{moment.date}</p>
            <p className="text-sm text-slate-400 mt-2 flex-grow line-clamp-3">{moment.description}</p>
        </div>
    </div>
);


interface InterviewPageProps {
  // FIX: Changed newMomentId to string to match Moment.id type.
  onComplete: (newMomentId?: string) => void;
  aeternyAvatar: string | null;
  aeternyVoice: AeternyVoice;
  setAeternyVoice: (voice: AeternyVoice) => void;
  aeternyStyle: AeternyStyle;
  setAeternyStyle: (style: AeternyStyle) => void;
  onCreateFirstMoment: (momentData: Omit<Moment, 'id' | 'pinned'>) => Moment;
  showToast: (message: string, type: 'info' | 'success' | 'error') => void;
  userTier: UserTier;
  setFamilyMembers: React.Dispatch<React.SetStateAction<string[]>>;
}

type InterviewStep = 'personalization' | 'goal' | 'invite' | 'createMemory' | 'generating' | 'reveal';

const voiceOptions: { name: string; voice: AeternyVoice; description: string }[] = [
    { name: 'The Mentor', voice: 'Kore', description: 'A warm, wise, and guiding voice.' },
    { name: 'The Sovereign', voice: 'Fenrir', description: 'A mature, resonant, and serious voice.' },
    { name: 'The Storyteller', voice: 'Charon', description: 'A calm, deep, and narrative voice.' }
];

const styleOptions: { name: AeternyStyle, description: string }[] = [
    { name: 'Warm & Empathetic', description: 'Supportive and encouraging' },
    { name: 'Neutral', description: 'Clear and straightforward' },
    { name: 'Humorous', description: 'Lighthearted with a bit of wit' }
];

const InterviewPage: React.FC<InterviewPageProps> = (props) => {
    const { onComplete, aeternyAvatar, aeternyVoice, setAeternyVoice, aeternyStyle, setAeternyStyle, onCreateFirstMoment, setFamilyMembers, showToast, userTier } = props;

    const [step, setStep] = useState<InterviewStep>('personalization');
    const [hint, setHint] = useState('');
    const [image, setImage] = useState<{ preview: string; file: File } | null>(null);
    const [generatedMoment, setGeneratedMoment] = useState<Moment | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState('');
    const [containsMinor, setContainsMinor] = useState(false);
    const [isCheckingImage, setIsCheckingImage] = useState(false);

    const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [showHintBubble, setShowHintBubble] = useState(false);


    useEffect(() => {
        if (step === 'createMemory') {
            const timer = setTimeout(() => {
                setShowHintBubble(true);
            }, 800); // 800ms delay
            return () => {
                clearTimeout(timer);
                setShowHintBubble(false); // Reset when leaving step
            };
        }
    }, [step]);


    useEffect(() => {
        startAeternyChat(aeternyStyle, userTier).then(({ initialMessage }) => {
            console.log("Aeterny's tailored welcome:", initialMessage);
        });
    }, [aeternyStyle, userTier]);

    // Audio states
    const [playingVoice, setPlayingVoice] = useState<AeternyVoice | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const cleanupAudio = useCallback(() => {
        if (audioSourceRef.current) {
            audioSourceRef.current.onended = null;
            audioSourceRef.current.stop();
        }
        if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close().catch(console.error);
        audioContextRef.current = null;
        setPlayingVoice(null);
    }, []);

    const handleVoiceSelect = (voice: AeternyVoice) => {
        setAeternyVoice(voice);
        const selectedOption = voiceOptions.find(opt => opt.voice === voice);
        cleanupAudio();
        const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = newAudioContext;
        setPlayingVoice(voice);
        textToSpeech(`This is the voice of ${selectedOption?.name || voice}.`, newAudioContext, voice)
            .then(buffer => {
                if (buffer && audioContextRef.current?.state !== 'closed') {
                    const source = newAudioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(newAudioContext.destination);
                    source.start();
                    source.onended = () => { if (audioSourceRef.current === source) setPlayingVoice(null); };
                    audioSourceRef.current = source;
                } else { setPlayingVoice(null); }
            }).catch(err => { console.error(err); setPlayingVoice(null); });
    };

    useEffect(() => {
        return () => cleanupAudio();
    }, [cleanupAudio]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsCheckingImage(true);
            setContainsMinor(false);
            const preview = await fileToDataUrl(file);
            setImage({ preview, file });
            try {
                const payload = await fileToPayload(file);
                const isMinor = await checkImageForMinors(payload);
                setContainsMinor(isMinor);
                if (isMinor) {
                    showToast("Minor detected. A privacy-safe 'Living Momænt' will be created.", "info");
                }
            } catch (error) {
                console.error("Error during image safety check:", error);
            } finally {
                setIsCheckingImage(false);
            }
        }
    };

    const handleAddEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEmail && !invitedEmails.includes(newEmail) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            setInvitedEmails(prev => [...prev, newEmail]);
            setNewEmail('');
        } else {
            showToast("Please enter a valid email address.", "error");
        }
    };
    
    const handleContinueFromInvite = () => {
        setFamilyMembers(prev => [...new Set([...prev, ...invitedEmails])]);
        if (invitedEmails.length > 0) {
            showToast(`Sent ${invitedEmails.length} invite(s)!`, 'success');
        }
        setStep('createMemory');
    };

    const handleGenerateMoment = async () => {
        if (!hint || !image) return;
        setStep('generating');
        setError(null);
        let videoUrl: string | null = null;
        let storyDetails: { title: string; story: string; tags: any; };
    
        try {
            setGenerationStatus("Analyzing your memory and writing your story...");
            const imagePayload = await fileToPayload(image.file);
            storyDetails = await generateFirstMomentDetails(imagePayload, hint);
    
            if (!containsMinor) {
                setGenerationStatus("Bringing your photo to life... (this may take a few minutes)");
                
                let keyIsReady = (window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey();
                if (!keyIsReady) {
                    try {
                        await (window as any).aistudio.openSelectKey();
                        keyIsReady = true;
                    } catch (e) { console.warn("API key selection cancelled. Proceeding without video."); }
                }
                
                if (keyIsReady) {
                    try {
                        const videoPrompt = `Create a beautiful, short video that brings this image to life, like a living photograph. Thematically, it relates to: ${storyDetails.title}`;
                        videoUrl = await generateVideo(videoPrompt, imagePayload, "16:9");
                    } catch (videoError) { console.error("Video generation failed, proceeding without video.", videoError); }
                }
            } else {
                setGenerationStatus("Creating a privacy-safe Living Momænt...");
                videoUrl = 'LIVING_MOMENT_FLAG'; 
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
    
            setGenerationStatus("Finalizing your momænt...");
            const newMomentData: Omit<Moment, 'id' | 'pinned'> = {
                type: 'standard', aiTier: 'diamond', image: image.preview, images: [image.preview], video: videoUrl || undefined,
                title: storyDetails.title, date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                description: storyDetails.story, location: storyDetails.tags.location[0] || undefined, people: storyDetails.tags.people,
                activities: storyDetails.tags.activities, photoCount: 1, emotion: 'reflection', createdBy: 'JD'
            };
            const finalMoment = onCreateFirstMoment(newMomentData);
            setGeneratedMoment(finalMoment);
            setStep('reveal');
    
        } catch (err) {
            console.error("Failed to generate first moment:", err);
            setError("Sorry, æterny couldn't create your momænt. Please try again.");
            setStep('createMemory');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'personalization':
                return (
                    <div className="w-full max-w-3xl text-center text-white p-8 animate-fade-in-up">
                        <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-24 h-24 rounded-full mx-auto mb-4 ring-2 ring-cyan-400" />
                        <h1 className="text-4xl font-bold font-brand mb-2">Meet æterny</h1>
                        <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">I'm your personal memory companion. To begin our journey together, let's personalize our conversation.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                           {/* Voice Selection */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">1. Choose My Voice</h2>
                                <div className="grid gap-3 auto-rows-fr">{voiceOptions.map(option => (
                                    <button key={option.voice} onClick={() => handleVoiceSelect(option.voice)} className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between h-full ${aeternyVoice === option.voice ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                                        <div><p className="font-semibold">{option.name}</p><p className="text-sm text-slate-400">{option.description}</p></div>
                                        <div className="flex items-center gap-2">{playingVoice === option.voice ? <Speaker className="w-5 h-5 text-cyan-400 animate-pulse" /> : aeternyVoice === option.voice && <CheckCircle className="w-6 h-6 text-cyan-400" />}</div>
                                    </button>
                                ))}</div>
                            </div>
                            {/* Style Selection */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">2. Choose Communication Style</h2>
                                <div className="grid gap-3 auto-rows-fr">{styleOptions.map(option => (
                                    <button key={option.name} onClick={() => setAeternyStyle(option.name)} className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between h-full ${aeternyStyle === option.name ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                                        <div><p className="font-semibold">{option.name}</p><p className="text-sm text-slate-400">{option.description}</p></div>
                                        {aeternyStyle === option.name && <CheckCircle className="w-6 h-6 text-cyan-400" />}
                                    </button>
                                ))}</div>
                            </div>
                        </div>
                        <button onClick={() => setStep('goal')} disabled={!aeternyVoice || !aeternyStyle} className="mt-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100">Let's Begin <ArrowRight className="w-5 h-5 inline-block ml-2" /></button>
                    </div>
                );
            case 'goal':
                return (
                    <div className="w-full max-w-3xl text-center text-white p-8 animate-fade-in-up">
                        <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-20 h-20 rounded-full mx-auto mb-4" />
                        <h1 className="text-3xl font-bold font-brand mb-2">How will you begin your story?</h1>
                        <p className="text-lg text-slate-300 mb-8">Choose your path. You can always change this later.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button onClick={() => setStep('createMemory')} className="bg-slate-800/50 p-8 rounded-2xl ring-1 ring-white/10 text-left h-full flex flex-col hover:bg-slate-700/50 hover:ring-cyan-500/30 transition-all transform hover:-translate-y-1">
                                <User className="w-10 h-10 text-cyan-400 mb-4" />
                                <h3 className="font-bold text-xl text-white">My Personal Story</h3>
                                <p className="text-sm text-slate-400 mt-1 flex-grow">Focus on curating your own life's journey, building a private and personal timestream.</p>
                                <p className="text-sm font-semibold text-cyan-400 mt-4 self-start">Start My Timestream <ArrowRight className="inline w-4 h-4" /></p>
                            </button>
                            <button onClick={() => setStep('invite')} className="bg-slate-800/50 p-8 rounded-2xl ring-1 ring-white/10 text-left h-full flex flex-col hover:bg-slate-700/50 hover:ring-indigo-500/30 transition-all transform hover:-translate-y-1">
                                <Users className="w-10 h-10 text-indigo-400 mb-4" />
                                <h3 className="font-bold text-xl text-white">A Shared Fæmily Story</h3>
                                <p className="text-sm text-slate-400 mt-1 flex-grow">Invite your family to collaborate, share memories, and weave your individual stories into one.</p>
                                <p className="text-sm font-semibold text-indigo-400 mt-4 self-start">Build Our Story <ArrowRight className="inline w-4 h-4" /></p>
                            </button>
                        </div>
                    </div>
                );
            case 'invite':
                return (
                    <div className="w-full max-w-2xl text-center text-white p-8 animate-fade-in-up">
                        <Users className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold font-brand mb-2">Invite Your Fæmily</h1>
                        <p className="text-lg text-slate-300 mb-6">Your story is richer with every voice. Invite family members to collaborate and build your shared history together.</p>
                        {userTier === 'free' && (
                            <div className="bg-indigo-900/50 p-4 rounded-lg text-sm text-indigo-300 mb-6 max-w-md mx-auto">
                                <strong>Note:</strong> Fæmily collaboration is a premium feature. Your invites will be sent, and your family can join once you upgrade to a Fæmily plan.
                            </div>
                        )}
                        <form onSubmit={handleAddEmail} className="flex gap-2 max-w-md mx-auto">
                            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Enter family member's email" className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-full text-white focus:ring-indigo-500 focus:border-indigo-500" />
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-full transition-colors"><Send className="w-5 h-5"/></button>
                        </form>
                        <div className="mt-4 space-y-2 max-w-md mx-auto">
                            {invitedEmails.map(email => (
                                <div key={email} className="bg-slate-700/50 p-2 px-4 rounded-full text-sm text-slate-300 text-left">{email}</div>
                            ))}
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button onClick={handleContinueFromInvite} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105">
                                {invitedEmails.length > 0 ? 'Send Invites & Continue' : 'Continue'}
                            </button>
                             <button onClick={() => setStep('createMemory')} className="text-slate-400 hover:text-white font-semibold text-sm">Skip for now</button>
                        </div>
                    </div>
                );
            case 'createMemory':
                 return (
                    <div className="w-full max-w-2xl text-center text-white p-8 animate-fade-in-up">
                        <div className="relative inline-block mx-auto mb-4">
                            <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-20 h-20 rounded-full" />
                            {showHintBubble && (
                                <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 w-max max-w-[200px] animate-fade-in">
                                    <div className="bg-slate-700 text-white p-3 rounded-lg shadow-lg relative z-10">
                                        <p className="text-xs text-cyan-300 font-semibold mb-1">A tip for your first momænt...</p>
                                        <p className="text-sm italic">"A moment that would have felt lost forever."</p>
                                    </div>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-slate-700 transform rotate-45 z-0"></div>
                                </div>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold font-brand mb-2">Your First Momænt</h1>
                        <p className="text-lg text-slate-300 mb-6">To start your timestream, let's create your first memory. Think of a recent moment that has stayed with you. Add a photo and a short sentence about it.</p>
                        
                        <div className="space-y-6">
                            <textarea value={hint} onChange={(e) => setHint(e.target.value)} placeholder="e.g., A beautiful sunset during our coastal trip." rows={2} className="w-full p-4 bg-slate-800/50 border-2 border-slate-600 rounded-lg text-white text-lg focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors" />
                            
                             {image ? (
                                <div className="relative w-full max-w-sm mx-auto aspect-video">
                                    <img src={image.preview} alt="Moment preview" className="w-full h-full object-cover rounded-lg"/>
                                </div>
                            ) : (
                                <label htmlFor="file-upload" className="w-full max-w-sm mx-auto aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer border-gray-600 hover:border-gray-500">
                                    <UploadCloud className="w-12 h-12 text-slate-500 mb-2" />
                                    <p className="text-slate-400 font-semibold">Upload a photo</p>
                                </label>
                            )}
                            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                         {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                        <button onClick={handleGenerateMoment} disabled={!hint.trim() || !image || isCheckingImage} className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto">
                            {isCheckingImage ? <><Loader2 className="w-5 h-5 animate-spin"/> Checking Image...</> : 
                            containsMinor ? <>Create Living Momænt <Film className="w-5 h-5"/></> : <>Create with æterny <Feather className="w-5 h-5"/></>
                            }
                        </button>
                        {containsMinor && (
                            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-400">
                                <p>Privacy-safe mode enabled.</p>
                                <Tooltip text="To protect the privacy and safety of minors, AI video generation is unavailable for this image. 'Living Momænts' offer a beautiful, privacy-safe alternative to bring your memory to life.">
                                    <HelpCircle className="w-4 h-4" />
                                </Tooltip>
                            </div>
                        )}
                    </div>
                );
            case 'generating':
                return (
                    <div className="text-center text-white p-8 animate-fade-in">
                        {image && <img src={image.preview} alt="Generating..." className="w-48 h-48 object-cover rounded-lg mx-auto mb-6 opacity-30" />}
                        <Loader2 className="w-12 h-12 text-cyan-400 mx-auto animate-spin mb-6" />
                        <h1 className="text-3xl font-bold font-brand mb-2">æterny is curating...</h1>
                        <p className="text-lg text-slate-300">{generationStatus}</p>
                    </div>
                );
            case 'reveal':
                if (!generatedMoment) return null;
                return (
                    <div className="w-full max-w-2xl text-center text-white p-8 animate-fade-in-up">
                        <BookHeart className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold font-brand mb-2">Your First Momænt is Ready</h1>
                        <p className="text-lg text-slate-300 mb-8">This is the beginning of your timestream.</p>
                        <FirstMomentCard moment={generatedMoment} />
                        <button onClick={() => onComplete(generatedMoment.id)} className="mt-8 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105">
                            Enter Your Timestream
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
            {renderStep()}
        </div>
    );
};

export default InterviewPage;
