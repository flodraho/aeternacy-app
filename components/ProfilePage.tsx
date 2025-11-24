import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { User, Camera, Bot, RotateCw, UploadCloud, Wand2, Loader2, Speaker, CheckCircle, Activity, Aperture, BookOpen, FilePenLine, BookImage, UserPlus, Trash2, Users, X, Archive, Zap, HelpCircle, Gift } from 'lucide-react';
import { AeternyVoice, AeternyStyle, Page, UserTier, TokenState } from '../types';
import { fetchPexelsImages } from '../services/pexelsService';
import { textToSpeech, imageUrlToPayload, editImage } from '../services/geminiService';
import AeternyAvatarDisplay from './AeternyAvatarDisplay';
import LegacyIcon from './icons/LegacyIcon';
import Tooltip from './Tooltip';
import { purchaseTokens, TOKEN_PACKS, TokenPack } from '../services/billingService';
import TokenIcon from './icons/TokenIcon';
import { TOKEN_COSTS } from '../services/costCatalog';

const iconOptions = [
    { id: 'bot-default', Icon: Bot, name: 'The Curator' },
    { id: 'activity', Icon: Activity, name: 'The Pulse' },
    { id: 'aperture', Icon: Aperture, name: 'The Lens' },
];

const voiceOptions: { name: string; voice: AeternyVoice; description: string }[] = [
    { name: 'The Mentor', voice: 'Kore', description: 'A warm, wise, and guiding voice.' },
    { name: 'The Sovereign', voice: 'Fenrir', description: 'A mature, resonant, and serious voice.' },
    { name: 'The Storyteller', voice: 'Charon', description: 'A calm, deep, and narrative voice.' }
];

const styleOptions: { name: AeternyStyle, description: string }[] = [
    { name: 'Warm & Empathetic', description: 'Supportive and encouraging' },
    { name: 'Neutral', description: 'Clear and straightforward' },
    { name: 'Humorous', description: 'Lighthearted with a bit of wit' },
];

const tokenExplanation = `Tokæn fuel your most ambitious creative projects within æternacy. Think of them as your allowance for the most advanced AI creations—like bringing a photo to life with a stunning animation or having æternacy craft a deeply personal video reflection.

These powerful features require significant energy from our dedicated AI servers. Using Tokæn allows us to keep the core æternacy experience unlimited, while ensuring the platform remains powerful and sustainable.`;


interface ProfilePageProps {
    profilePic: string | null;
    onProfilePicChange: (pic: string | null) => void;
    aeternyAvatar: string | null;
    setAeternyAvatar: (avatar: string) => void;
    aeternyVoice: AeternyVoice;
    setAeternyVoice: (voice: AeternyVoice) => void;
    aeternyStyle: AeternyStyle;
    setAeternyStyle: (style: AeternyStyle) => void;
    onNavigate: (page: Page) => void;
    userTier: UserTier;
    setUserTier: (tier: UserTier) => void;
    familyName: string;
    onFamilyNameChange: (name: string) => void;
    familyProfilePic: string | null;
    onFamilyProfilePicChange: (pic: string | null) => void;
    tokenState: TokenState;
    showToast: (message: string, type: 'info' | 'success' | 'error') => void;
    onAddTokens: (amount: number) => void;
    familyMembers: string[];
    setFamilyMembers: React.Dispatch<React.SetStateAction<string[]>>;
}

const ProfilePage: React.FC<ProfilePageProps> = (props) => {
    const { 
        profilePic, onProfilePicChange, 
        aeternyAvatar, setAeternyAvatar, 
        aeternyVoice, setAeternyVoice, 
        aeternyStyle, setAeternyStyle, 
        onNavigate, userTier, setUserTier,
        familyName, onFamilyNameChange,
        familyProfilePic, onFamilyProfilePicChange,
        tokenState,
        showToast,
        onAddTokens,
        familyMembers,
        setFamilyMembers
    } = props;

    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john.doe@example.com');
    const [isSaved, setIsSaved] = useState(false);
    const [purchasing, setPurchasing] = useState<TokenPack | null>(null);
    const [estimatorValues, setEstimatorValues] = useState({
        animations: 2,
        videos: 1,
        magazines: 0,
        biografer: 0,
        photos: 1000,
    });

    // State for aeterny customization
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
    const [isRefreshingAvatars, setIsRefreshingAvatars] = useState(false);
    const [avatarPage, setAvatarPage] = useState(1);
    const aeternyFileInputRef = useRef<HTMLInputElement>(null);
    const [playingVoice, setPlayingVoice] = useState<AeternyVoice | null>(null);

    // Avatar Editing State
    const [editingAvatar, setEditingAvatar] = useState<{ url: string; index: number } | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [isGeneratingEdit, setIsGeneratingEdit] = useState(false);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // State for family management
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [inviteSent, setInviteSent] = useState(false);

    const estimatedCost = useMemo(() => {
        return (
          (estimatorValues.animations * TOKEN_COSTS.HEADER_ANIMATION) +
          (estimatorValues.videos * TOKEN_COSTS.AI_VIDEO_REFLECTION) +
          (estimatorValues.magazines * TOKEN_COSTS.MAGAZINE_ISSUE) +
          (estimatorValues.biografer * TOKEN_COSTS.BIOGRAFER_SESSION) +
          (Math.ceil(estimatorValues.photos / 1000) * TOKEN_COSTS.BULK_UPLOAD_PER_1000)
        );
    }, [estimatorValues]);

    const handleInviteMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMemberEmail && (userTier === 'legacy' || familyMembers.length < 4)) {
            setFamilyMembers(prev => [...prev, newMemberEmail]);
            setNewMemberEmail('');
            setInviteSent(true);
            setTimeout(() => setInviteSent(false), 3000);
        }
    };

    const handleRemoveMember = (emailToRemove: string) => {
        setFamilyMembers(prev => prev.filter(email => email !== emailToRemove));
    };

    const fetchAvatars = useCallback(async () => {
        setIsRefreshingAvatars(true);
        try {
            const avatarPhotos = await fetchPexelsImages('futuristic abstract portrait', 4, 'portrait', avatarPage);
            if (avatarPhotos.length > 0) {
                setAvatarOptions(avatarPhotos.map(p => p.src.portrait));
                setAvatarPage(prevPage => prevPage + 1);
            }
        } finally {
            setIsRefreshingAvatars(false);
        }
    }, [avatarPage]);

    useEffect(() => {
        if (isAvatarModalOpen) {
            fetchAvatars();
        }
    }, [isAvatarModalOpen, fetchAvatars]);

    const cleanupAudio = useCallback(() => {
        audioSourceRef.current?.stop();
        audioSourceRef.current?.disconnect();
        audioSourceRef.current = null;
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }
        audioContextRef.current = null;
        setPlayingVoice(null);
    }, []);

    const handleVoiceSelect = (voice: AeternyVoice) => {
        setAeternyVoice(voice);
        const selectedOption = voiceOptions.find(opt => opt.voice === voice);
        
        cleanupAudio();
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        setPlayingVoice(voice);
        textToSpeech(`This is the voice of ${selectedOption?.name || voice}.`, audioContextRef.current, voice)
            .then(audioBuffer => {
                if (audioBuffer && audioContextRef.current) {
                    const source = audioContextRef.current.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContextRef.current.destination);
                    source.start();
                    source.onended = () => setPlayingVoice(null);
                    audioSourceRef.current = source;
                }
            })
            .catch(err => {
                console.error(err);
                setPlayingVoice(null);
            });
    };

    const handlePictureUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => onProfilePicChange(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    }, [onProfilePicChange]);

     const handleFamilyPictureUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => onFamilyProfilePicChange(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    }, [onFamilyProfilePicChange]);

    const handleAeternyAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAeternyAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    // Avatar Editing Handlers
    const handleOpenEditModal = (url: string, index: number) => setEditingAvatar({ url, index });
    const handleCloseEditModal = () => {
        setEditingAvatar(null);
        setEditedImageUrl(null);
        setEditPrompt('');
        setEditError(null);
    };
    const handleImageEdit = async () => {
        if (!editingAvatar || !editPrompt) return;
        setIsGeneratingEdit(true); setEditedImageUrl(null); setEditError(null);
        try {
            const { data, mimeType } = await imageUrlToPayload(editingAvatar.url);
            const resultUrl = await editImage(data, mimeType, editPrompt);
            setEditedImageUrl(resultUrl);
        } catch (error) {
            setEditError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsGeneratingEdit(false);
        }
    };
    const handleAcceptEdit = () => {
        if (editedImageUrl && editingAvatar) {
            const newAvatarOptions = [...avatarOptions];
            newAvatarOptions[editingAvatar.index] = editedImageUrl;
            setAvatarOptions(newAvatarOptions);
            if (aeternyAvatar === editingAvatar.url) setAeternyAvatar(editedImageUrl);
        }
        handleCloseEditModal();
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
        console.log("Saved:", { name, email, profilePic, aeternyAvatar, aeternyVoice, aeternyStyle });
    };
    
    const handlePurchase = async (pack: TokenPack) => {
        setPurchasing(pack);
        try {
          const amount = await purchaseTokens(pack);
          onAddTokens(amount);
          showToast(`${amount.toLocaleString()} Tokæn added!`, 'success');
        } catch (error) {
          console.error("Purchase failed:", error);
           showToast(`Purchase failed. Please try again.`, 'error');
        } finally {
          setPurchasing(null);
        }
      };
    
    const tierName = userTier.charAt(0).toUpperCase() + userTier.slice(1).replace('æ', 'æm');
    
    const totalAllocation = tokenState.monthlyAllocation + tokenState.rollover;
    const balancePercentage = totalAllocation > 0 ? Math.min(100, (tokenState.balance / totalAllocation) * 100) : (tokenState.balance > 0 ? 100 : 0);

    return (
        <div className="container mx-auto px-6 pt-28 pb-12">
            <h1 className="text-4xl font-bold text-white mb-8 font-brand">Profile & Settings</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: User Profile & Legacy */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8 h-fit">
                        <h2 className="text-2xl font-bold font-brand mb-6">Your Profile</h2>
                        <div className="flex flex-col items-center gap-4 mb-8">
                            <div className="relative w-24 h-24">
                                <Tooltip text="Change Profile Picture">
                                    <label htmlFor="profile-pic-upload" className="cursor-pointer group">
                                        <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center overflow-hidden ring-2 ring-gray-600">
                                            {profilePic ? <img src={profilePic} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-slate-500" />}
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera className="w-6 h-6 text-white" /></div>
                                    </label>
                                </Tooltip>
                                <input type="file" id="profile-pic-upload" className="hidden" accept="image/*" onChange={handlePictureUpload} />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Contact Email</label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                        </div>
                    </div>
                    
                    {(userTier === 'fæmily' || userTier === 'fæmilyPlus' || userTier === 'legacy') && (
                        <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8 h-fit">
                            <h2 className="text-2xl font-bold font-brand mb-6">Fæmily Profile & Management</h2>
                            <div className="flex flex-col items-center gap-4 mb-8">
                                <div className="relative w-24 h-24">
                                    <Tooltip text="Change Family Picture">
                                        <label htmlFor="family-profile-pic-upload" className="cursor-pointer group">
                                            <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center overflow-hidden ring-2 ring-gray-600">
                                                {familyProfilePic ? <img src={familyProfilePic} alt="Family Profile" className="w-full h-full object-cover" /> : <Users className="w-12 h-12 text-slate-500" />}
                                            </div>
                                            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera className="w-6 h-6 text-white" /></div>
                                        </label>
                                    </Tooltip>
                                    <input type="file" id="family-profile-pic-upload" className="hidden" accept="image/*" onChange={handleFamilyPictureUpload} />
                                </div>
                                <div>
                                    <label htmlFor="family-name" className="sr-only">Family Name</label>
                                    <input 
                                        type="text" 
                                        id="family-name" 
                                        value={familyName} 
                                        onChange={(e) => onFamilyNameChange(e.target.value)} 
                                        className="w-full text-center text-lg font-bold bg-transparent text-white focus:outline-none focus:bg-slate-700/50 rounded-md p-1"
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">You have used {familyMembers.length + 1} / {userTier === 'legacy' ? 'Unlimited' : userTier === 'fæmilyPlus' ? 10 : 5} member slots.</p>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-white">{name} (Owner)</p>
                                        <p className="text-xs text-slate-400">{email}</p>
                                    </div>
                                    <Tooltip text="Gift Tokæn (Coming Soon)">
                                        <button onClick={() => showToast('Tokæn gifting is coming soon!', 'info')} className="text-slate-500 hover:text-cyan-400 p-1"><Gift className="w-4 h-4" /></button>
                                    </Tooltip>
                                </div>
                                {familyMembers.map(memberEmail => (
                                    <div key={memberEmail} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-white">{memberEmail.split('@')[0]}</p>
                                            <p className="text-xs text-slate-400">{memberEmail}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Tooltip text="Gift Tokæn (Coming Soon)">
                                                <button onClick={() => showToast('Tokæn gifting is coming soon!', 'info')} className="text-slate-500 hover:text-cyan-400 p-1"><Gift className="w-4 h-4" /></button>
                                            </Tooltip>
                                            <button onClick={() => handleRemoveMember(memberEmail)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {(userTier === 'legacy' || familyMembers.length < 4) ? (
                                <form onSubmit={handleInviteMember}>
                                    <label htmlFor="invite-email" className="text-sm font-semibold text-slate-300 mb-2 block">Invite a new member</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="invite-email"
                                            type="email"
                                            value={newMemberEmail}
                                            onChange={(e) => setNewMemberEmail(e.target.value)}
                                            placeholder="Enter email address"
                                            required
                                            className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-full text-sm"
                                        />
                                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-2 rounded-full transition-colors"><UserPlus className="w-5 h-5" /></button>
                                    </div>
                                    {inviteSent && <p className="text-xs text-green-400 mt-2">Invitation sent!</p>}
                                </form>
                            ) : (
                                <p className="text-sm text-center text-slate-500 p-4 bg-slate-900/50 rounded-lg">You have reached your member limit.</p>
                            )}
                        </div>
                    )}
                    
                    <div className="bg-slate-800/50 rounded-2xl ring-1 ring-amber-500/30 p-6 h-fit border border-amber-500/20">
                        <h2 className="text-xl font-bold font-brand mb-4 text-amber-300">Demo Controls</h2>
                        <p className="text-sm text-slate-400 mb-4">Switch your user tier to experience all platform features.</p>
                        <div className="flex flex-col space-y-2">
                            {(['free', 'essæntial', 'fæmily', 'fæmilyPlus', 'legacy'] as UserTier[]).map(tier => (
                                <button 
                                    key={tier} 
                                    onClick={() => setUserTier(tier)}
                                    className={`w-full p-3 rounded-lg border-2 text-left font-semibold transition-colors
                                        ${userTier === tier 
                                            ? 'border-cyan-500 bg-cyan-500/10 text-white' 
                                            : 'border-gray-600 hover:border-gray-500 text-slate-300'}`
                                        }
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="capitalize">{tier === 'fæmily' ? 'Fæmily' : tier === 'fæmilyPlus' ? 'Fæmily Plus' : tier}</span>
                                        {userTier === tier && <CheckCircle className="w-5 h-5 text-cyan-400" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="text-2xl font-bold font-brand">Tokæn</h2>
                            <Tooltip text={tokenExplanation} position="bottom">
                                <HelpCircle className="w-5 h-5 text-slate-500 cursor-help" />
                            </Tooltip>
                        </div>
                        
                        <div className="text-center mb-8">
                            <p className="text-sm text-slate-400">Current Balance</p>
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-6xl font-bold text-white font-brand">{tokenState.balance.toLocaleString()}</p>
                                <TokenIcon className="w-10 h-10 text-slate-400" />
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-4 max-w-sm mx-auto">
                               <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${balancePercentage}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Your Tokæn for advanced AI creations.</p>
                        </div>
                        
                        <div className="bg-slate-700/50 p-4 rounded-lg mb-8">
                            <h3 className="text-base font-semibold text-white mb-3">{tierName} Plan Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-300">Monthly Allocation:</span> <span className="font-semibold text-white font-mono">{tokenState.monthlyAllocation.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-slate-300">Rollover from last month:</span> <span className="font-semibold text-white font-mono">{tokenState.rollover.toLocaleString()}</span></div>
                                {userTier === 'essæntial' && (
                                    <div className="pt-2 mt-2 border-t border-white/10 flex justify-between"><span className="text-slate-300">Free Header Animations:</span> <span className="font-semibold text-white font-mono">{tokenState.freeHeaderAnimations.total - tokenState.freeHeaderAnimations.used} / {tokenState.freeHeaderAnimations.total} left</span></div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Refill Tokæn</h3>
                            <div className="space-y-3">
                                {(Object.keys(TOKEN_PACKS) as TokenPack[]).map(pack => (
                                <button 
                                    key={pack}
                                    onClick={() => handlePurchase(pack)}
                                    disabled={purchasing !== null}
                                    className="w-full flex items-center justify-between bg-slate-700/50 hover:bg-slate-700 p-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <div className="text-left">
                                    <p className="font-bold text-white"><span className="font-mono">{TOKEN_PACKS[pack].amount.toLocaleString()}</span> Tokæn</p>
                                    <p className="text-xs text-slate-400">{pack.charAt(0).toUpperCase() + pack.slice(1)} Refill Pack</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                    {purchasing === pack 
                                        ? <Loader2 className="w-5 h-5 animate-spin"/>
                                        : <span className="font-bold bg-cyan-600 text-white text-sm py-1 px-3 rounded-full">{TOKEN_PACKS[pack].price}</span>
                                    }
                                    </div>
                                </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-4 text-center">Your purchase will be processed securely.</p>
                        </div>
                    </div>
                     <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
                        <h2 className="text-2xl font-bold font-brand mb-6">Tokæn Estimator</h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <label htmlFor="animations" className="flex justify-between text-slate-300 mb-1"><span>Living Photo Animations</span><span className="font-bold">{estimatorValues.animations}</span></label>
                                <input id="animations" type="range" min="0" max="10" value={estimatorValues.animations} onChange={e => setEstimatorValues(p => ({...p, animations: +e.target.value}))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                            </div>
                            <div>
                                <label htmlFor="videos" className="flex justify-between text-slate-300 mb-1"><span>AI Video Reflections</span><span className="font-bold">{estimatorValues.videos}</span></label>
                                <input id="videos" type="range" min="0" max="5" value={estimatorValues.videos} onChange={e => setEstimatorValues(p => ({...p, videos: +e.target.value}))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                            </div>
                             <div>
                                <label htmlFor="magazines" className="flex justify-between text-slate-300 mb-1"><span>Mægazine Issues</span><span className="font-bold">{estimatorValues.magazines}</span></label>
                                <input id="magazines" type="range" min="0" max="4" value={estimatorValues.magazines} onChange={e => setEstimatorValues(p => ({...p, magazines: +e.target.value}))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                            </div>
                             <div>
                                <label htmlFor="biografer" className="flex justify-between text-slate-300 mb-1"><span>Biografær Sessions</span><span className="font-bold">{estimatorValues.biografer}</span></label>
                                <input id="biografer" type="range" min="0" max="10" value={estimatorValues.biografer} onChange={e => setEstimatorValues(p => ({...p, biografer: +e.target.value}))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                            </div>
                            <div>
                                <label htmlFor="photos" className="flex justify-between text-slate-300 mb-1"><span>Bulk Upload Photos</span><span className="font-bold">{estimatorValues.photos.toLocaleString()}</span></label>
                                <input id="photos" type="range" min="0" max="20000" step="1000" value={estimatorValues.photos} onChange={e => setEstimatorValues(p => ({...p, photos: +e.target.value}))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                            </div>
                        </div>
                        <div className="mt-6 text-center bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-lg font-semibold text-white">Estimated Monthly Usage</p>
                            <p className="text-3xl font-bold text-cyan-400 font-mono mt-1">{estimatedCost.toLocaleString()} <span className="text-lg">Tokæn</span></p>
                            <p className="text-xs text-slate-400 mt-2">An average active family might use 500-1,000 Tokæn/month on features like Living Photos and AI Reflections for their captured memories.</p>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
                        <h2 className="text-2xl font-bold font-brand mb-6">æterny Customization</h2>
                        <div className="space-y-8">
                            {/* Avatar Settings */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Avatar</h3>
                                <div className="flex items-center gap-4">
                                    <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-20 h-20 rounded-full" />
                                    <button 
                                        onClick={() => setIsAvatarModalOpen(true)}
                                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm"
                                    >
                                        Change Avatar
                                    </button>
                                </div>
                            </div>
                            
                            {/* Voice & Style Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Voice</h3>
                                    <div className="grid gap-3 auto-rows-fr">
                                        {voiceOptions.map(option => (
                                            <button type="button" key={option.voice} onClick={() => handleVoiceSelect(option.voice)} className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between h-full ${aeternyVoice === option.voice ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                                                <div><p className="font-semibold">{option.name}</p><p className="text-sm text-slate-400">{option.description}</p></div>
                                                <div className="flex items-center gap-2">{playingVoice === option.voice ? <Speaker className="w-5 h-5 text-cyan-400 animate-pulse" /> : aeternyVoice === option.voice && <CheckCircle className="w-6 h-6 text-cyan-400" />}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Communication Style</h3>
                                    <div className="grid gap-3 auto-rows-fr">
                                        {styleOptions.map(option => (
                                            <button type="button" key={option.name} onClick={() => setAeternyStyle(option.name)} className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between h-full ${aeternyStyle === option.name ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                                                <div><p className="font-semibold">{option.name}</p><p className="text-sm text-slate-400">{option.description}</p></div>
                                                {aeternyStyle === option.name && <CheckCircle className="w-6 h-6 text-cyan-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end items-center gap-4">
                {isSaved && <span className="text-green-400 text-sm animate-fade-in-up">Changes saved!</span>}
                <button type="submit" onClick={handleSaveChanges} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full transition-colors">Save All Changes</button>
            </div>

            {/* Avatar Selection Modal */}
            {isAvatarModalOpen && (
                 <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsAvatarModalOpen(false)}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl relative ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsAvatarModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10"><X/></button>
                        <div className="p-6">
                             <h2 className="text-2xl font-bold font-brand text-white mb-4">Change æterny's Avatar</h2>
                             <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-slate-400">Select an appearance for your AI curator.</p>
                                <div className="flex items-center gap-2">
                                    <input type="file" ref={aeternyFileInputRef} onChange={handleAeternyAvatarUpload} className="hidden" accept="image/*" />
                                    <Tooltip text="Upload your own image">
                                        <button type="button" onClick={() => aeternyFileInputRef.current?.click()} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-sm font-semibold py-2 px-3 rounded-full"><UploadCloud className="w-4 h-4" /> Upload</button>
                                    </Tooltip>
                                    <Tooltip text="Generate new AI options">
                                        <button type="button" onClick={fetchAvatars} disabled={isRefreshingAvatars} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-sm font-semibold py-2 px-3 rounded-full"><RotateCw className={`w-4 h-4 ${isRefreshingAvatars ? 'animate-spin' : ''}`} /> Refresh</button>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                                {iconOptions.map(icon => (
                                    <button 
                                        key={icon.id}
                                        onClick={() => setAeternyAvatar(icon.id)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden ring-2 transition-all transform hover:scale-105 outline-none group cursor-pointer ${aeternyAvatar === icon.id ? 'ring-cyan-400' : 'ring-transparent hover:ring-cyan-400/50'}`}
                                    >
                                        <AeternyAvatarDisplay avatar={icon.id} className="w-full h-full" />
                                        {aeternyAvatar === icon.id && <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center ring-2 ring-slate-800"><CheckCircle className="w-4 h-4 text-white" /></div>}
                                    </button>
                                ))}
                                {avatarOptions.map((avatarUrl, index) => (
                                    <div key={avatarUrl + index} onClick={() => setAeternyAvatar(avatarUrl)} className={`relative aspect-square rounded-2xl overflow-hidden ring-2 transition-all transform hover:scale-105 outline-none group cursor-pointer ${aeternyAvatar === avatarUrl ? 'ring-cyan-400' : 'ring-transparent hover:ring-cyan-400/50'}`}>
                                        <AeternyAvatarDisplay avatar={avatarUrl} className="w-full h-full" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><button type="button" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(avatarUrl, index); }} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm font-semibold py-2 px-3 rounded-full text-xs"><Wand2 className="w-3 h-3" /> Refine</button></div>
                                        {aeternyAvatar === avatarUrl && <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center ring-2 ring-slate-800"><CheckCircle className="w-4 h-4 text-white" /></div>}
                                    </div>
                                ))}
                            </div>
                             <div className="mt-6 flex justify-end">
                                <button onClick={() => setIsAvatarModalOpen(false)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-full">Done</button>
                            </div>
                        </div>
                    </div>
                 </div>
            )}

            {/* Avatar Editing Modal */}
            {editingAvatar && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={handleCloseEditModal}>
                    <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl relative ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold font-brand text-white mb-4">Refine æterny Avatar</h2>
                            <div className="aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-900 relative">
                                <img src={editedImageUrl || editingAvatar.url} alt="Avatar for editing" className="w-full h-full object-cover" />
                                {isGeneratingEdit && <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin mb-2" /><p>Generating...</p></div>}
                            </div>
                            {editError && <p className="text-red-400 text-sm text-center mt-2">{editError}</p>}
                            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                <input type="text" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleImageEdit()} placeholder="e.g., Add a retro filter..." className="flex-grow bg-slate-700 border border-slate-600 rounded-full py-3 px-5 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500 outline-none" disabled={isGeneratingEdit} />
                                <button onClick={handleImageEdit} disabled={isGeneratingEdit || !editPrompt} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-5 rounded-full transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed flex-shrink-0">Generate</button>
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <button onClick={handleCloseEditModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-full">Cancel</button>
                                <button onClick={handleAcceptEdit} disabled={!editedImageUrl} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-full disabled:bg-gray-700 disabled:cursor-not-allowed">Accept & Use</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;