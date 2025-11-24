import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Page, AuthMode, Moment, UserTier, AeternyVoice, AeternyStyle, Message, Journey, TokenState, ActiveRitual } from '../types';
import LandingPage from './LandingPage';
import AuthModal from './AuthModal';
import HomePage from './HomePage';
import InterviewPage from './InterviewPage';
import MomentsPage from './MomentsPage';
import CreatePage from './CreatePage';
import RecordPage from './RecordPage';
import CuratePage from './CuratePage';
import MomentDetailPage from './MomentDetailPage';
import Header from './Header';
import { initialMoments, initialJourneys } from '../data/moments';
import { initialActiveRituals } from '../data/rituals';
import ProfilePage from './ProfilePage';
import DataInsightPage from './DataInsightPage';
import { fetchPexelsImages } from '../services/pexelsService';
import { Chat, GoogleGenAI, LiveServerMessage, Blob, Modality } from '@google/genai';
// FIX: Renamed startGenericAeternyChat to startAeternyChat to match the exported member from geminiService.
import { startAeternyChat, continueAeternyChat, textToSpeech, getGenericAeternySystemInstruction, createDemoStoryFromImages } from '../services/geminiService';
import AeternyFab from './AeternyFab';
import TimeCapsulePage from './TimeCapsulePage';
import FamilyStorylinePage from './FamilyStorylinePage';
import LegacySpacePage from './LegacySpacePage';
import LegacyTrustPage from './LegacyTrustPage';
import TheaterPage from './TheaterPage';
import FamilyPlanPage from './FamilyPlanPage';
import FamilySpacePage from './FamilySpacePage';
import SubscriptionPage from './SubscriptionPage';
import FamilyMomentsPage from './FamilyMomentsPage';
import ShopPage from './ShopPage';
import MagazinePage from './MagazinePage';
import JournalingPage from './JournalingPage';
import PhotobookPage from './PhotobookPage';
import VRLabPage from './VRLabPage';
import BiograferPage from './BiograferPage';
import BulkUploadPage from './BulkUploadPage';
import AIVideoPage from './AIVideoPage';
import AboutPage from './AboutPage';
import { encode, decode, decodeAudioData } from '../utils/audio';
import SmartCollectionPage from './SmartCollectionPage';
import Toast, { ToastMessage } from './Toast';
import TrustCenterPage from './TrustCenterPage';
import BulkUploadReviewPage from './BulkUploadReviewPage';
import ProductDemo from './ProductDemo';
import ArticlesPage from './ArticlesPage';
import AhaMomentModal from './AhaMomentModal';
import LimitReachedModal from './LimitReachedModal';
import { TOKEN_COSTS } from '../services/costCatalog';
import GiftPage from './GiftPage';
import FamilyTreePage from './FamilyTreePage';
import ComparePlansPage from './ComparePlansPage';
import FamilyRitualsPage from './FamilyRitualsPage';
import RitualDashboardPage from './RitualDashboardPage';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
// FIX: Import Loader2 from lucide-react to resolve missing component error.
import { Loader2 } from 'lucide-react';

interface DemoData {
  title: string;
  story: string;
  images: string[];
  tags: {
    location: string[];
    people: string[];
    activities: string[];
  };
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Landing);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.Login);
  const [moments, setMoments] = useState<Moment[]>(initialMoments);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [newMomentId, setNewMomentId] = useState<number | null>(null);
  const [deletingMomentId, setDeletingMomentId] = useState<number | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>(initialJourneys);
  const [activeGuidePage, setActiveGuidePage] = useState<Page | null>(null);
  const [lastCollectionPage, setLastCollectionPage] = useState<Page>(Page.Moments);
  const [showProductDemo, setShowProductDemo] = useState(false);
  const [demoDataForFirstMoment, setDemoDataForFirstMoment] = useState<DemoData | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showAhaMomentModal, setShowAhaMomentModal] = useState(false);
  
  // User profile state
  const [userName, setUserName] = useState('John Doe');
  const [userTier, setUserTier] = useState<UserTier>('free'); // 'free', 'essæntial', 'fæmily', 'legacy'
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [registrationDate, setRegistrationDate] = useState<Date | null>(null);
  const [limitReason, setLimitReason] = useState<'moments' | 'time' | null>(null);

  // Family profile state
  const [familyName, setFamilyName] = useState('Doe Family');
  const [familyProfilePic, setFamilyProfilePic] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<string[]>(['jane.doe@example.com', 'alex.smith@example.com']);

  // Family Rituals state
  const [activeRituals, setActiveRituals] = useState<ActiveRitual[]>(initialActiveRituals);
  const [selectedRitual, setSelectedRitual] = useState<ActiveRitual | null>(null);
  const [ritualContextId, setRitualContextId] = useState<string | null>(null);

  // Aeterny state
  const [aeternyAvatar, setAeternyAvatar] = useState<string | null>('bot-default');
  const [aeternyVoice, setAeternyVoice] = useState<AeternyVoice>('Kore');
  const [aeternyStyle, setAeternyStyle] = useState<AeternyStyle>('Warm & Empathetic');
  const [isFabChatOpen, setIsFabChatOpen] = useState(false);
  const [fabMessages, setFabMessages] = useState<Message[]>([]);
  const [fabInput, setFabInput] = useState('');
  const [isFabLoading, setIsFabLoading] = useState(false);
  const fabChatRef = useRef<Chat | null>(null);
  const [isFabTtsEnabled, setIsFabTtsEnabled] = useState(false);
  const [currentlyPlayingFabText, setCurrentlyPlayingFabText] = useState<string | null>(null);
  const [suggestionBubble, setSuggestionBubble] = useState<{ text: string; actionPage: Page } | null>(null);
  const suggestionTimerRef = useRef<number | null>(null);
  
  // Aeterny voice input state
  const [isFabRecording, setIsFabRecording] = useState(false);
  const fabSessionPromiseRef = useRef<Promise<any> | null>(null);
  const fabStreamRef = useRef<MediaStream | null>(null);
  const fabInputAudioContextRef = useRef<AudioContext | null>(null);
  const fabScriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const fabMediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isFabStoppingRef = useRef(false);
  const [liveDisplay, setLiveDisplay] = useState<{ user: string; ai: string } | null>(null);

  // Aeterny TTS output state
  const textChatAudioContextRef = useRef<AudioContext | null>(null);
  const textChatAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fabOutputAudioContextRef = useRef<AudioContext | null>(null);
  const fabOutputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const fabNextStartTimeRef = useRef(0);

  // --- Tokæn State ---
  const [tokenState, setTokenState] = useState<TokenState>({
    balance: 800,
    monthlyAllocation: 4000,
    rollover: 200,
    freeHeaderAnimations: { used: 0, total: 10 }
  });

  // --- Toast State ---
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  // --- Derived State for Free Tier Limits ---
  const daysSinceRegistration = useMemo(() => {
    if (!registrationDate) return 0;
    const diffTime = Math.abs(new Date().getTime() - registrationDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [registrationDate]);

  const daysRemaining = useMemo(() => {
      if (!registrationDate || userTier !== 'free') return null;
      const daysPassed = Math.floor((new Date().getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, 90 - daysPassed);
  }, [registrationDate, userTier]);

  // --- Navigation & Auth ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setIsAuthLoading(true);
        if (firebaseUser) {
            setUser(firebaseUser);
            setUserName(firebaseUser.displayName || firebaseUser.email || 'User');
            setProfilePic(firebaseUser.photoURL);
            
            // Check if it's a new user
            const isNewUser = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;

            if (isNewUser) {
                setRegistrationDate(new Date());
                // Handle post-demo registration
                if (demoDataForFirstMoment) {
                    const { images, title, story, tags } = demoDataForFirstMoment;
                    handleCreateFirstMoment({
                        title,
                        description: story,
                        location: tags.location[0],
                        people: tags.people,
                        activities: tags.activities,
                        type: 'standard',
                        aiTier: 'diamond',
                        image: images[0],
                        images: images,
                        date: new Date().toLocaleDateString(),
                        photoCount: images.length
                    });
                    handleNavigate(Page.Moments);
                } else {
                    handleNavigate(Page.Interview);
                }
            } else {
                // For existing users, fetch their data from Firestore here
                // For now, just navigate to home
                handleNavigate(Page.Home);
            }

        } else {
            setUser(null);
            setCurrentPage(Page.Landing);
        }
        setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [demoDataForFirstMoment]);


  const handleNavigate = useCallback((page: Page) => {
    if ([Page.Moments, Page.FamilyMoments].includes(page)) {
      setLastCollectionPage(page);
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = () => { setShowAuthModal(true); setAuthMode(AuthMode.Login); };
  const handleRegister = () => { setShowAuthModal(true); setAuthMode(AuthMode.Register); };
  const handleLogout = () => { signOut(auth); };
  
  const handleAuthSuccess = useCallback((isNewUser: boolean) => {
    // This is now primarily handled by onAuthStateChanged.
    // We can keep it for any logic that needs to run immediately after a modal action.
    setShowAuthModal(false);
  }, []);

  // --- Moment & Journey Management ---
  const handleSelectMoment = (moment: Moment) => { setSelectedMoment(moment); handleNavigate(Page.MomentDetail); };
  const handleUpdateMoment = (updatedItem: Moment | Journey) => {
    if ('momentIds' in updatedItem) { // It's a Journey
      setJourneys(prev => prev.map(j => (j.id === updatedItem.id ? updatedItem : j)));
    } else { // It's a Moment
      setMoments(prev => prev.map(m => (m.id === updatedItem.id ? updatedItem : m)));
    }
  };
  const handlePinToggle = (id: number) => {
    setMoments(prev => prev.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };

  const handleSelectRitual = (ritual: ActiveRitual) => {
    setSelectedRitual(ritual);
    handleNavigate(Page.RitualDashboard);
  };
  
  const handleAddContributionToRitual = (ritualId: string) => {
    setRitualContextId(ritualId);
    handleNavigate(Page.Create);
  };

  useEffect(() => {
    const personalMomentsCount = moments.filter(m => m.id > 0).length;
    if (userTier === 'free' && personalMomentsCount === 3 && !localStorage.getItem('ahaMomentShown')) {
        setShowAhaMomentModal(true);
        localStorage.setItem('ahaMomentShown', 'true');
    }
  }, [moments, userTier]);

  const handleCreateMoment = (momentData: Omit<Moment, 'id' | 'pinned'>) => {
    if (userTier === 'free') {
        if (moments.length >= 100) {
            setLimitReason('moments');
            setShowLimitModal(true);
            return;
        }
        if (daysSinceRegistration > 90) {
            setLimitReason('time');
            setShowLimitModal(true);
            return;
        }
    }
    const newId = Date.now();
    const newMoment: Moment = { ...momentData, id: newId, pinned: false, createdBy: user?.displayName?.substring(0, 2).toUpperCase() || 'ME' };
    setMoments(prev => [newMoment, ...prev]);
    setNewMomentId(newId);
    setTimeout(() => setNewMomentId(null), 4000);
    
    if (newMoment.ritualId) {
        const ritual = activeRituals.find(r => r.id === newMoment.ritualId);
        if (ritual) handleSelectRitual(ritual);
        else handleNavigate(Page.Moments);
    } else {
        handleNavigate(Page.Moments);
    }
  };
  
  const handleStartCurationFromPhotos = (images: string[], title: string, description: string) => {
    if (userTier === 'free') {
        if (moments.length >= 100) {
            setLimitReason('moments');
            setShowLimitModal(true);
            return;
        }
        if (daysSinceRegistration > 90) {
            setLimitReason('time');
            setShowLimitModal(true);
            return;
        }
    }
    const newId = Date.now();
    const newMoment: Moment = { 
        id: newId, pinned: false, type: 'focus', aiTier: 'sparkle', image: images[0],
        images: images, photoCount: images.length, title, description,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    setMoments(prev => [newMoment, ...prev]);
    setNewMomentId(newId);
    setTimeout(() => setNewMomentId(null), 4000);
    handleNavigate(Page.Moments);
  };
  
  const handleDeleteMoment = (id: number) => {
    setDeletingMomentId(id);
    setTimeout(() => {
      setMoments(prev => prev.filter(m => m.id !== id));
      setDeletingMomentId(null);
    }, 2000); // Wait for animation
  };

  const handleCreateJourney = (title: string, description: string, momentIds: number[]) => {
    const newJourney: Journey = {
      id: Date.now(), title, description, momentIds,
      coverImage: moments.find(m => m.id === momentIds[0])?.image || '',
    };
    setJourneys(prev => [newJourney, ...prev]);
  };

  const handleCreateFirstMoment = useCallback((momentData: Omit<Moment, 'id' | 'pinned'>): Moment => {
    const newId = Date.now();
    const newMoment: Moment = { ...momentData, id: newId, pinned: false };
    setMoments(prev => [newMoment, ...prev]);
    return newMoment;
  }, []);
  
  const handleCompleteDemo = (shouldRegister: boolean, demoData?: DemoData & { images: string[] }) => {
    setShowProductDemo(false);
    if (shouldRegister) {
      if (demoData) setDemoDataForFirstMoment(demoData);
      handleRegister();
    }
  };

  // --- Tokæn Management ---
  const handleUseTokens = (amount: number, featureKey: string): void => {
    setTokenState(prev => ({ ...prev, balance: Math.max(0, prev.balance - amount) }));
    console.log(`TELEMETRY: token_used, feature: ${featureKey}, amount: ${amount}`);
  };

  const handleAddTokens = (amount: number) => {
    setTokenState(prev => ({...prev, balance: prev.balance + amount}));
  };

  const handleUseFreeHeaderAnimation = () => {
    setTokenState(prev => ({ ...prev, freeHeaderAnimations: { ...prev.freeHeaderAnimations, used: prev.freeHeaderAnimations.used + 1 } }));
    console.log("TELEMETRY: free_animation_used");
  };

  const triggerConfirmation = (cost: number, featureKey: string, onConfirm: () => Promise<any>) => {
    if (userTier === 'essæntial' && featureKey === 'HEADER_ANIMATION' && tokenState.freeHeaderAnimations.used < tokenState.freeHeaderAnimations.total) {
        handleUseFreeHeaderAnimation();
        onConfirm().catch(e => {
            console.error("Free action failed", e);
            showToast(`An error occurred during your free action.`, "error");
        });
        return;
    }
    
    handleUseTokens(cost, featureKey);
    onConfirm().catch(e => {
        console.error(`Action failed for ${featureKey}`, e);
        showToast(`An error occurred: ${e instanceof Error ? e.message : 'Unknown error'}`, "error");
    });
  };

  // --- FAB Chat & Suggestion Logic ---
  useEffect(() => {
    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    if (!user || isFabChatOpen || ![Page.Home, Page.Moments, Page.FamilyMoments].includes(currentPage)) {
        setSuggestionBubble(null);
        return;
    }

    const inviteSuggestionShown = sessionStorage.getItem('inviteSuggestionShown');
    const hasPersonalMoments = moments.some(m => m.id > 0);

    if (!inviteSuggestionShown && (userTier === 'free' || userTier === 'essæntial') && hasPersonalMoments && familyMembers.length <= 2) {
        suggestionTimerRef.current = window.setTimeout(() => {
            setSuggestionBubble({
                text: 'Enjoying the journey? Invite family members to build your story together!',
                actionPage: Page.Profile,
            });
        }, 15000);
    }
    return () => { if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current); };
  }, [user, isFabChatOpen, currentPage, userTier, moments, familyMembers]);

  const cleanupFabAudio = useCallback(() => {
    textChatAudioSourceRef.current?.stop();
    if (textChatAudioContextRef.current?.state !== 'closed') textChatAudioContextRef.current?.close().catch(console.error);
    textChatAudioContextRef.current = null;
    setCurrentlyPlayingFabText(null);

    fabOutputSourcesRef.current.forEach(source => source.stop());
    fabOutputSourcesRef.current.clear();
    if (fabOutputAudioContextRef.current?.state !== 'closed') fabOutputAudioContextRef.current?.close().catch(console.error);
    fabOutputAudioContextRef.current = null;
    fabNextStartTimeRef.current = 0;
  }, []);

  const handleToggleFabRecording = useCallback(async () => {
    if (isFabStoppingRef.current) return;
    if (isFabRecording) {
        isFabStoppingRef.current = true;
        setIsFabRecording(false);
        fabSessionPromiseRef.current?.then(session => session.close()).catch(console.error);
        fabSessionPromiseRef.current = null;
        fabStreamRef.current?.getTracks().forEach(track => track.stop());
        fabStreamRef.current = null;
        fabScriptProcessorRef.current?.disconnect();
        fabScriptProcessorRef.current = null;
        fabMediaStreamSourceRef.current?.disconnect();
        fabMediaStreamSourceRef.current = null;
        if (fabInputAudioContextRef.current?.state !== 'closed') fabInputAudioContextRef.current.close().catch(console.error);
        fabInputAudioContextRef.current = null;
        cleanupFabAudio();
        setLiveDisplay(prev => {
          if(prev?.user && !prev.ai) setFabMessages(m => [...m.slice(0, -1), { sender: 'user', text: prev.user }]);
          return null;
        });
        setTimeout(() => { isFabStoppingRef.current = false; }, 500);
    } else {
        cleanupFabAudio();
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            fabStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            fabInputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

            setLiveDisplay({ user: '', ai: '' });
            setIsFabRecording(true);
            setFabMessages([{ sender: 'ai', text: 'Listening...' }]);

            fabSessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        if (!fabStreamRef.current || !fabInputAudioContextRef.current) return;
                        fabMediaStreamSourceRef.current = fabInputAudioContextRef.current.createMediaStreamSource(fabStreamRef.current);
                        fabScriptProcessorRef.current = fabInputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        fabScriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            fabSessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        fabMediaStreamSourceRef.current.connect(fabScriptProcessorRef.current);
                        fabScriptProcessorRef.current.connect(fabInputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription?.text) setLiveDisplay(prev => ({ user: (prev?.user || '') + message.serverContent!.inputTranscription!.text!, ai: prev?.ai || '' }));
                        if (message.serverContent?.outputTranscription?.text) setLiveDisplay(prev => ({ user: prev?.user || '', ai: (prev?.ai || '') + message.serverContent!.outputTranscription!.text! }));
                        if (message.serverContent?.turnComplete) {
                            setLiveDisplay(prev => {
                                if (prev) {
                                  if (prev.user) setFabMessages(m => [...m.slice(0, -1), { sender: 'user', text: prev.user }]);
                                  if (prev.ai) setFabMessages(m => [...m, { sender: 'ai', text: prev.ai }]);
                                }
                                setFabMessages(m => [...m, { sender: 'ai', text: 'Listening...' }]);
                                return { user: '', ai: '' };
                            });
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio) {
                            if (!fabOutputAudioContextRef.current || fabOutputAudioContextRef.current.state === 'closed') {
                                fabOutputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                                fabNextStartTimeRef.current = fabOutputAudioContextRef.current.currentTime;
                            }
                            const audioContext = fabOutputAudioContextRef.current;
                            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                            const source = audioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioContext.destination);
                            const nextStart = Math.max(audioContext.currentTime, fabNextStartTimeRef.current);
                            source.start(nextStart);
                            fabNextStartTimeRef.current = nextStart + audioBuffer.duration;
                            fabOutputSourcesRef.current.add(source);
                            source.onended = () => fabOutputSourcesRef.current.delete(source);
                        }
                        if (message.serverContent?.interrupted) {
                          fabOutputSourcesRef.current.forEach(source => source.stop());
                          fabOutputSourcesRef.current.clear();
                          fabNextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Aeterny FAB voice error:', e);
                        setFabMessages(prev => [...prev.slice(0, -1), { sender: 'ai', text: 'Sorry, I had a connection issue.' }]);
                        handleToggleFabRecording();
                    },
                    onclose: () => {}
                },
                config: {
                    inputAudioTranscription: {}, outputAudioTranscription: {}, responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: aeternyVoice } } },
                    systemInstruction: getGenericAeternySystemInstruction(aeternyStyle, userTier)
                }
            });
        } catch (error) {
            console.error("Failed to start FAB recording:", error);
            setFabMessages([{ sender: 'ai', text: "I couldn't access your microphone. Please check permissions." }]);
            setIsFabRecording(false);
        }
    }
  }, [isFabRecording, aeternyVoice, aeternyStyle, userTier, cleanupFabAudio]);

  const handleToggleFabChat = useCallback(() => {
    if (!isFabChatOpen) {
      setIsFabChatOpen(true);
      fabChatRef.current = null;
      setFabMessages([{ sender: 'ai', text: "Hello! How can I help you with your memories today?" }]);
      setFabInput('');
      setIsFabLoading(false);
      setSuggestionBubble(null);
    } else {
      if (isFabRecording) handleToggleFabRecording();
      cleanupFabAudio();
      setIsFabChatOpen(false);
    }
  }, [isFabChatOpen, isFabRecording, handleToggleFabRecording, cleanupFabAudio]);

  const fabContextualPrompts = useMemo(() => {
    switch (currentPage) {
      case Page.Moments: return ["Find photos of my dog", "Create a journey about my trip", "What was my last pinned moment?"];
      case Page.Create: return ["Help me write a story", "Suggest a title", "What tags should I add?"];
      case Page.Curate: return ["Make this story more poetic", "Suggest new tags", "Animate this photo"];
      default: return ["What can I do here?", "Show me my latest moment", "How do I create a journey?"];
    }
  }, [currentPage]);
  
  const handleContextualSend = (prompt: string) => { setFabInput(prompt); };
  
  const handlePlayFabTts = useCallback(async (text: string) => {
    cleanupFabAudio();
    setCurrentlyPlayingFabText(text);
    try {
      const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      textChatAudioContextRef.current = newAudioContext;
      const buffer = await textToSpeech(text, newAudioContext, aeternyVoice);
      if (buffer && textChatAudioContextRef.current?.state !== 'closed') {
        const source = textChatAudioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(textChatAudioContextRef.current.destination);
        source.start();
        source.onended = () => { if (textChatAudioSourceRef.current === source) setCurrentlyPlayingFabText(null); };
        textChatAudioSourceRef.current = source;
      } else {
        setCurrentlyPlayingFabText(null);
      }
    } catch (error) {
      console.error("TTS playback error:", error);
      showToast("Sorry, I couldn't play that response.", 'error');
      setCurrentlyPlayingFabText(null);
    }
  }, [aeternyVoice, cleanupFabAudio, showToast]);

  const handleFabSend = useCallback(async () => {
    if (!fabInput.trim() || isFabLoading) return;
    const userMessage: Message = { sender: 'user', text: fabInput };
    setFabMessages(prev => [...prev, userMessage]);
    const currentInput = fabInput;
    setFabInput('');
    setIsFabLoading(true);

    try {
        let responseText: string;
        if (!fabChatRef.current) {
            // FIX: Renamed startGenericAeternyChat to startAeternyChat to match the imported function.
            const { chat } = await startAeternyChat(aeternyStyle, userTier);
            fabChatRef.current = chat;
            responseText = await continueAeternyChat(chat, currentInput);
        } else {
            responseText = await continueAeternyChat(fabChatRef.current, currentInput);
        }
        const aiMessage: Message = { sender: 'ai', text: responseText };
        setFabMessages(prev => [...prev, aiMessage]);
        if (isFabTtsEnabled) handlePlayFabTts(responseText);
    } catch (error) {
        console.error("Aeterny FAB chat error:", error);
        setFabMessages(prev => [...prev, { sender: 'ai', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
        setIsFabLoading(false);
    }
  }, [fabInput, isFabLoading, aeternyStyle, userTier, isFabTtsEnabled, handlePlayFabTts]);

  useEffect(() => {
    return () => cleanupFabAudio();
  }, [cleanupFabAudio]);


  // --- Page Rendering ---
  const spaceContext = useMemo(() => {
    if ([Page.FamilySpace, Page.FamilyMoments, Page.FamilyStoryline, Page.FamilyTree, Page.FamilyRituals, Page.RitualDashboard].includes(currentPage)) return 'family';
    if ([Page.LegacySpace, Page.LegacyTrust, Page.TimeCapsule, Page.Biografer].includes(currentPage)) return 'legacy';
    if (user && currentPage !== Page.Landing) return 'personal';
    return null;
  }, [currentPage, user]);
  
  if (isAuthLoading) {
    return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;
  }

  const renderPage = () => {
    if (!user) {
      switch (currentPage) {
        case Page.Gift: return <GiftPage onNavigate={handleNavigate} />;
        case Page.Journal: return <ArticlesPage onNavigate={handleNavigate} />;
        default: return <LandingPage onLogin={handleLogin} onRegister={handleRegister} onNavigate={handleNavigate} onStartDemo={() => setShowProductDemo(true)} onSkipForDemo={() => {}} />;
      }
    }
    switch (currentPage) {
      case Page.Home: return <HomePage onNavigate={handleNavigate} userName={userName} moments={moments} onSelectMoment={handleSelectMoment} activeRituals={activeRituals} onSelectRitual={handleSelectRitual} />;
      case Page.Interview: return <InterviewPage onComplete={(id) => { if(id) { setSelectedMoment(moments.find(m => m.id === id) || null); handleNavigate(Page.MomentDetail); } else { handleNavigate(Page.Home); } }} aeternyAvatar={aeternyAvatar} aeternyVoice={aeternyVoice} setAeternyVoice={setAeternyVoice} aeternyStyle={aeternyStyle} setAeternyStyle={setAeternyStyle} onCreateFirstMoment={handleCreateFirstMoment} showToast={showToast} userTier={userTier} setFamilyMembers={setFamilyMembers} />;
      case Page.Moments: return <MomentsPage moments={moments} journeys={journeys} onCreateJourney={handleCreateJourney} onPinToggle={handlePinToggle} onSelectMoment={handleSelectMoment} onItemUpdate={handleUpdateMoment} onShareToFamily={() => {}} userTier={userTier} onNavigate={handleNavigate} newMomentId={newMomentId} deletingMomentId={deletingMomentId} showGuide={activeGuidePage === Page.Moments} onCloseGuide={() => setActiveGuidePage(null)} />;
      case Page.Create: return <CreatePage onCreateMoment={handleCreateMoment} onNavigate={handleNavigate} userTier={userTier} showGuide={activeGuidePage === Page.Create} onCloseGuide={() => setActiveGuidePage(null)} tokenState={tokenState} ritualContextId={ritualContextId} onClearRitualContext={() => setRitualContextId(null)} />;
      case Page.Record: return <RecordPage onCreateMoment={handleCreateMoment} />;
      case Page.Curate: return <CuratePage moments={moments} onUpdateMoment={handleUpdateMoment} aeternyAvatar={aeternyAvatar} initialMoment={selectedMoment} onClearInitialMoment={() => setSelectedMoment(null)} onNavigate={handleNavigate} userTier={userTier} tokenState={tokenState} onUseFreeHeaderAnimation={handleUseFreeHeaderAnimation} triggerConfirmation={triggerConfirmation} showGuide={activeGuidePage === Page.Curate} onCloseGuide={() => setActiveGuidePage(null)} showToast={showToast} aeternyVoice={aeternyVoice} aeternyStyle={aeternyStyle} />;
      case Page.MomentDetail: return selectedMoment ? <MomentDetailPage moment={selectedMoment} onBack={() => handleNavigate(lastCollectionPage)} onUpdateMoment={handleUpdateMoment} aeternyVoice={aeternyVoice} aeternyStyle={aeternyStyle} onEditMoment={(m) => { setSelectedMoment(m); handleNavigate(Page.Curate); }} onDeleteMoment={handleDeleteMoment} userTier={userTier} onNavigate={handleNavigate} /> : <p>Moment not found</p>;
      case Page.Profile: return <ProfilePage profilePic={profilePic} onProfilePicChange={setProfilePic} aeternyAvatar={aeternyAvatar} setAeternyAvatar={setAeternyAvatar} aeternyVoice={aeternyVoice} setAeternyVoice={setAeternyVoice} aeternyStyle={aeternyStyle} setAeternyStyle={setAeternyStyle} onNavigate={handleNavigate} userTier={userTier} setUserTier={setUserTier} familyName={familyName} onFamilyNameChange={setFamilyName} familyProfilePic={familyProfilePic} onFamilyProfilePicChange={setFamilyProfilePic} tokenState={tokenState} showToast={showToast} onAddTokens={handleAddTokens} familyMembers={familyMembers} setFamilyMembers={setFamilyMembers} />;
      case Page.DataInsight: return <DataInsightPage moments={moments} />;
      case Page.TimeCapsule: return <TimeCapsulePage moments={moments} onBack={() => handleNavigate(Page.LegacySpace)} triggerConfirmation={triggerConfirmation} userTier={userTier} onNavigate={handleNavigate} />;
      case Page.FamilyStoryline: return <FamilyStorylinePage moments={moments} onBack={() => handleNavigate(Page.FamilySpace)} />;
      case Page.FamilyTree: return <FamilyTreePage onNavigate={handleNavigate} userTier={userTier} />;
      case Page.LegacySpace: return <LegacySpacePage userTier={userTier} onNavigate={handleNavigate} profilePic={profilePic} userName={userName} moments={moments} journeys={journeys} onSelectMoment={handleSelectMoment} deletingMomentId={deletingMomentId} />;
      case Page.Theater: return <TheaterPage moments={moments} aeternyVoice={aeternyVoice} onExit={() => handleNavigate(Page.Moments)} startingMomentId={selectedMoment?.id} />;
      case Page.FamilyPlan: return <FamilyPlanPage onNavigate={handleNavigate} />;
      case Page.FamilySpace: return <FamilySpacePage userTier={userTier} onNavigate={handleNavigate} moments={moments} onSelectMoment={handleSelectMoment} onPinToggle={handlePinToggle} onUpdateMoment={handleUpdateMoment} onEditMoment={(m) => { setSelectedMoment(m); handleNavigate(Page.Curate); }} onDeleteMoment={handleDeleteMoment} deletingMomentId={deletingMomentId} />;
      case Page.Subscription: return <SubscriptionPage userTier={userTier} onNavigate={handleNavigate} momentsCount={moments.length} daysRemaining={daysRemaining} />;
      case Page.ComparePlans: return <ComparePlansPage onNavigate={handleNavigate} />;
      case Page.FamilyMoments: return <FamilyMomentsPage moments={moments} journeys={journeys} onPinToggle={handlePinToggle} onSelectMoment={handleSelectMoment} onItemUpdate={handleUpdateMoment} onShareToFamily={() => {}} userTier={userTier} onNavigate={handleNavigate} newMomentId={newMomentId} deletingMomentId={deletingMomentId} />;
      case Page.Shop: return <ShopPage onNavigate={handleNavigate} userTier={userTier} />;
      case Page.Magazine: return <MagazinePage onNavigate={handleNavigate} userTier={userTier} moments={moments} journeys={journeys} triggerConfirmation={triggerConfirmation} />;
      case Page.Journaling: return <JournalingPage onNavigate={handleNavigate} />;
      case Page.Photobook: return <PhotobookPage onNavigate={handleNavigate} />;
      case Page.VRLab: return <VRLabPage onNavigate={handleNavigate} />;
      case Page.Biografer: return <BiograferPage onBack={() => handleNavigate(Page.LegacySpace)} triggerConfirmation={triggerConfirmation} userTier={userTier} onNavigate={handleNavigate} />;
      case Page.BulkUpload: return <BulkUploadPage onNavigate={handleNavigate} userTier={userTier} triggerConfirmation={triggerConfirmation} />;
      case Page.AIVideo: return <AIVideoPage onNavigate={handleNavigate} userTier={userTier} moments={moments} journeys={journeys} onItemUpdate={handleUpdateMoment} aeternyStyle={aeternyStyle} triggerConfirmation={triggerConfirmation} />;
      case Page.About: return <AboutPage onNavigate={handleNavigate} />;
      case Page.SmartCollection: return <SmartCollectionPage moments={moments} onNavigate={handleNavigate} onCreateFocusMoment={handleStartCurationFromPhotos} />;
      case Page.TrustCenter: return <TrustCenterPage onNavigate={handleNavigate} />;
      case Page.BulkUploadReview: return <BulkUploadReviewPage onNavigate={handleNavigate} />;
      case Page.LegacyTrust: return <LegacyTrustPage onBack={() => handleNavigate(Page.LegacySpace)} userTier={userTier} onNavigate={handleNavigate} />;
      case Page.Gift: return <GiftPage onNavigate={handleNavigate} />;
      case Page.FamilyRituals: return <FamilyRitualsPage moments={moments} showToast={showToast} onNavigate={handleNavigate} activeRituals={activeRituals} setActiveRituals={setActiveRituals} onSelectRitual={handleSelectRitual} familyMembers={familyMembers} userTier={userTier} />;
      case Page.RitualDashboard: return selectedRitual ? <RitualDashboardPage ritual={selectedRitual} moments={moments} onNavigate={handleNavigate} onAddContribution={handleAddContributionToRitual} triggerConfirmation={triggerConfirmation} showToast={showToast} /> : <p>Ritual not found.</p>;
      case Page.Journal: return <ArticlesPage onNavigate={handleNavigate} />;
      default: return <HomePage onNavigate={handleNavigate} userName={userName} moments={moments} onSelectMoment={handleSelectMoment} activeRituals={activeRituals} onSelectRitual={handleSelectRitual} />;
    }
  };

  return (
    <>
      {currentPage !== Page.Landing && currentPage !== Page.Theater && currentPage !== Page.Gift && (
        <Header 
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentPage={currentPage}
          userTier={userTier}
          profilePic={profilePic}
          spaceContext={spaceContext}
          tokenState={tokenState}
        />
      )}
      <main>
        {renderPage()}
      </main>
      
      {user && currentPage !== Page.Interview && currentPage !== Page.Record && currentPage !== Page.Theater && (
        <AeternyFab
          isOpen={isFabChatOpen}
          onToggle={handleToggleFabChat}
          messages={fabMessages}
          input={fabInput}
          onInputChange={setFabInput}
          onSend={handleFabSend}
          isLoading={isFabLoading}
          isRecording={isFabRecording}
          onToggleRecording={handleToggleFabRecording}
          isTtsEnabled={isFabTtsEnabled}
          onToggleTts={() => setIsFabTtsEnabled(!isFabTtsEnabled)}
          onPlayTts={handlePlayFabTts}
          isTtsPlaying={currentlyPlayingFabText !== null}
          currentlyPlayingText={currentlyPlayingFabText}
          aeternyAvatar={aeternyAvatar}
          contextualPrompts={fabContextualPrompts}
          onContextualSend={handleContextualSend}
          liveDisplay={liveDisplay}
          currentPage={currentPage}
          onTriggerGuide={() => setActiveGuidePage(currentPage)}
          suggestion={suggestionBubble?.text || null}
          onCloseSuggestion={() => {
              setSuggestionBubble(null);
              sessionStorage.setItem('inviteSuggestionShown', 'true');
          }}
          onSuggestionClick={() => {
              if (suggestionBubble) handleNavigate(suggestionBubble.actionPage);
              setSuggestionBubble(null);
              sessionStorage.setItem('inviteSuggestionShown', 'true');
          }}
        />
      )}
      
      {showAuthModal && (
        <AuthModal 
          mode={authMode} 
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          switchMode={() => setAuthMode(m => m === AuthMode.Login ? AuthMode.Register : AuthMode.Login)} 
        />
      )}
      {showProductDemo && <ProductDemo onClose={() => setShowProductDemo(false)} onComplete={handleCompleteDemo} />}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      
      {showAhaMomentModal && (
          <AhaMomentModal 
              isOpen={showAhaMomentModal}
              onClose={() => setShowAhaMomentModal(false)}
              onNavigate={handleNavigate}
              moments={moments}
              aeternyVoice={aeternyVoice}
          />
      )}
      {showLimitModal && (
          <LimitReachedModal
              isOpen={showLimitModal}
              onClose={() => setShowLimitModal(false)}
              onUpgrade={() => { setShowLimitModal(false); handleNavigate(Page.Subscription); }}
              onManageMoments={() => { setShowLimitModal(false); handleNavigate(Page.Moments); }}
              reason={limitReason}
          />
      )}
    </>
  );
};

export default App;