
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Page, AuthMode, Moment, UserTier, AeternyVoice, AeternyStyle, Message, Journey, TokenState } from './types';
import LandingPage from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import HomePage from './components/HomePage';
import InterviewPage from './components/InterviewPage';
import MomentsPage from './components/MomentsPage';
import CreatePage from './components/CreatePage';
import RecordPage from './components/RecordPage';
import CuratePage from './components/CuratePage';
import MomentDetailPage from './components/MomentDetailPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar'; 
import SmartGuide from './components/SmartGuide';
import { initialMoments, initialJourneys } from './data/moments';
import ProfilePage from './components/ProfilePage';
import DataInsightPage from './components/Data-Insight-Page';
import { fetchPexelsImages } from './services/pexelsService';
import { Chat, GoogleGenAI, LiveServerMessage, Blob, Modality } from '@google/genai';
import { startGenericAeternyChat, continueAeternyChat, textToSpeech, getGenericAeternySystemInstruction } from './services/geminiService';
import AeternyFab from './components/AeternyFab';
import TimeCapsulePage from './components/TimeCapsulePage';
import FamilyStorylinePage from './components/FamilyStorylinePage';
import LegacySpacePage from './components/LegacySpacePage';
import LegacyTrustPage from './components/LegacyTrustPage';
import TheaterPage from './components/TheaterPage';
import FamilyPlanPage from './components/FamilyPlanPage';
import FamilySpacePage from './components/FamilySpacePage';
import SubscriptionPage from './components/SubscriptionPage';
import FamilyMomentsPage from './components/FamilyMomentsPage';
import ShopPage from './components/ShopPage';
import MagazinePage from './components/MagazinePage';
import JournalingPage from './components/JournalingPage';
import PhotobookPage from './components/PhotobookPage';
import BiograferPage from './components/BiograferPage';
import BulkUploadPage from './components/BulkUploadPage';
import AIVideoPage from './components/AIVideoPage';
import AboutPage from './components/AboutPage';
import { encode, decode, decodeAudioData } from './utils/audio';
import SmartCollectionPage from './components/SmartCollectionPage';
import ConfirmationModal from './components/ConfirmationModal';
import Toast, { ToastMessage } from './components/Toast';
import TrustCenterPage from './components/TrustCenterPage';
import BulkUploadReviewPage from './components/BulkUploadReviewPage';
import ProductDemo from './components/ProductDemo';
import ArticlesPage from './components/ArticlesPage';
import VRLabPage from './components/VRLabPage';
import { useAuth } from './contexts/AuthContext';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  const { user } = useAuth();

  // User profile state
  const [userName, setUserName] = useState('John Doe');
  const [userTier, setUserTier] = useState<UserTier>('legacy'); // 'free', 'essæntial', 'fæmily', 'legacy'
  const [profilePic, setProfilePic] = useState<string | null>(null);
  
  // Family profile state
  const [familyName, setFamilyName] = useState('Doe Family');
  const [familyProfilePic, setFamilyProfilePic] = useState<string | null>(null);

  // Aeterny state
  const [aeternyAvatar, setAeternyAvatar] = useState<string | null>('bot-default');
  const [aeternyVoice, setAeternyVoice] = useState<AeternyVoice>('Kore');
  const [aeternyStyle, setAeternyStyle] = useState<AeternyStyle>('Warm & Empathetic');
  const [isFabChatOpen, setIsFabChatOpen] = useState(false);
  const [fabMessages, setFabMessages] = useState<Message[]>([]);
  const [fabInput, setFabInput] = useState('');
  const [isFabLoading, setIsFabLoading] = useState(false);
  const fabChatRef = useRef<Chat | null>(null);
  const [isFabTtsEnabled, setIsFabTtsEnabled] = useState(true);
  
  // Aeterny voice input state
  const [isFabRecording, setIsFabRecording] = useState(false);
  const fabSessionPromiseRef = useRef<Promise<any> | null>(null);
  const fabStreamRef = useRef<MediaStream | null>(null);
  const fabInputAudioContextRef = useRef<AudioContext | null>(null);
  const fabScriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const fabMediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isFabStoppingRef = useRef(false);

  // Aeterny TTS output state
  const textChatAudioContextRef = useRef<AudioContext | null>(null);
  const textChatAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [currentlyPlayingFabText, setCurrentlyPlayingFabText] = useState<string | null>(null);

  const fabOutputAudioContextRef = useRef<AudioContext | null>(null);
  const fabAudioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextFabAudioTime = useRef(0);
  
  // Live transcription state
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const [fabLiveDisplay, setFabLiveDisplay] = useState<{ user: string, ai: string } | null>(null);

  // --- Tokæn System State & Logic ---
  const [tokenState, setTokenState] = useState<TokenState>({
    balance: 0,
    monthlyAllocation: 0,
    rollover: 0,
    freeHeaderAnimations: { used: 0, total: 0 },
  });
  const [featureUsage, setFeatureUsage] = useState<Record<string, number>>({});
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    cost: 0,
    onConfirm: async () => {},
    onClose: () => {},
    title: '',
    message: undefined as React.ReactNode | undefined,
    isLoading: false
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Sync Firebase User state with App state
  useEffect(() => {
    if (user) {
        setIsLoggedIn(true);
        setUserName(user.displayName || user.email?.split('@')[0] || 'User');
        if (user.photoURL) {
            setProfilePic(user.photoURL);
        }
        setShowAuthModal(false);
        if (currentPage === Page.Landing) {
             setCurrentPage(Page.Home);
        }
    } else {
        // Handle logout state or stay on landing
        if (isLoggedIn) {
             setIsLoggedIn(false);
             setCurrentPage(Page.Landing);
        }
    }
  }, [user, currentPage, isLoggedIn]);

  // Initialize and reset Tokæn based on user tier
  useEffect(() => {
    const tierConfig = {
      free: { allocation: 0, freeAnims: 0 },
      essæntial: { allocation: 0, freeAnims: 10 },
      fæmily: { allocation: 4000, freeAnims: 0 },
      legacy: { allocation: 12000, freeAnims: 0 }
    };
  
    setTokenState(prev => {
      const config = tierConfig[userTier];
      const newRollover = Math.floor(Math.min(
        prev.monthlyAllocation * 0.5,
        Math.max(0, prev.balance * 0.25)
      ));
  
      return {
        balance: config.allocation + newRollover,
        monthlyAllocation: config.allocation,
        rollover: newRollover,
        freeHeaderAnimations: { used: 0, total: config.freeAnims }
      };
    });
  }, [userTier]);

  const spendTokens = (cost: number) => {
    setTokenState(prev => ({...prev, balance: Math.max(0, prev.balance - cost)}));
  };

  const refundTokens = (cost: number) => {
    setTokenState(prev => ({...prev, balance: prev.balance + cost}));
  };
  
  const addTokens = (amount: number) => {
    setTokenState(prev => ({...prev, balance: prev.balance + amount}));
  };

  const useFreeHeaderAnimation = () => {
    setTokenState(prev => ({
        ...prev,
        freeHeaderAnimations: {
            ...prev.freeHeaderAnimations,
            used: prev.freeHeaderAnimations.used + 1
        }
    }));
  };

  const showToast = useCallback((message: string, type: ToastMessage['type']) => {
    setToast({ id: Date.now(), message, type });
  }, []);
  
  const triggerConfirmation = useCallback((cost: number, featureKey: string, onConfirm: () => Promise<any>, message?: string) => {
    console.log(`TELEMETRY: token_preview, feature: ${featureKey}, cost: ${cost}`);
    if (tokenState.balance < cost) {
      showToast("Not enough Tokæn. Visit Profile & Settings to refill.", "error");
      return;
    }
    
    (async () => {
      try {
        spendTokens(cost);
        await onConfirm();
        
        const newUsageCount = (featureUsage[featureKey] || 0) + 1;
        setFeatureUsage(prev => ({
          ...prev,
          [featureKey]: newUsageCount
        }));

        if (featureKey === 'AI_VIDEO_REFLECTION' && newUsageCount === 3) {
            setTimeout(() => {
                showToast("Feeling creative? Add more Tokæn to keep your inspiration flowing.", "info");
            }, 2500);
        }
      } catch (error) {
        console.error("AI action failed, refunding Tokæn.", error);
        if (!(error instanceof Error && error.message.includes("Operation stopped due to safety policy"))) {
          refundTokens(cost);
          console.log(`TELEMETRY: token_refund, feature: ${featureKey}, amount: ${cost}`);
          showToast('Tokæn returned.', 'success');
        }
      }
    })();
  }, [tokenState.balance, featureUsage, showToast]);

  // Navigation and Auth
  const handleNavigate = useCallback((page: Page) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
    setSelectedMoment(null);
  }, []);

  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSkipForDemo = () => {
    setIsLoggedIn(true);
    setCurrentPage(Page.Home);
    fetchPexelsImages('portrait of a person smiling', 1, 'portrait').then(photos => {
      if (photos.length > 0) {
        setProfilePic(photos[0].src.portrait);
      }
    });
    if (userTier === 'fæmily' || userTier === 'legacy') {
      fetchPexelsImages('happy multi-generational family outdoors', 1, 'portrait').then(photos => {
          if (photos.length > 0) {
              setFamilyProfilePic(photos[0].src.portrait);
          }
      });
    }
  };
  
  // Replaced by useEffect listening to AuthContext
  const handleLoginSuccess = (isNewUser: boolean, profileData?: { name: string, picture: string }) => {
     // Kept for reference but mostly handled by effect
  };

  const handleGoogleSignIn = (credentialResponse: any) => {
    // This needs to be adapted for Firebase Auth with Google Provider if desired
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage(Page.Landing);
    setProfilePic(null);
    setFamilyProfilePic(null);
    setFamilyName('Doe Family');
    setMoments(initialMoments);
    setJourneys(initialJourneys);
  };
  
  const handleInterviewComplete = (newMomentIdForHighlight?: number) => {
    if (newMomentIdForHighlight) {
        setNewMomentId(newMomentIdForHighlight);
        setTimeout(() => setNewMomentId(null), 4000);
    }
    setCurrentPage(Page.Home);
  };

  const handleStartDemo = () => {
    setShowProductDemo(true);
  };

  const handleDemoComplete = (shouldRegister: boolean, demoData?: DemoData) => {
      setShowProductDemo(false);
      if (shouldRegister && demoData) {
          setDemoDataForFirstMoment(demoData);
          openAuthModal(AuthMode.Register);
      }
  };

  // Moment Management
  const handlePinToggle = (id: number) => {
    setMoments(prev => prev.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };
  
  const handleSelectMoment = (moment: Moment) => {
    if (moment.type === 'insight') {
      handleNavigate(Page.DataInsight);
    } else if (moment.type === 'fæmilyStoryline') {
      handleNavigate(Page.FamilySpace);
    } else if (moment.type === 'collection') {
      handleNavigate(Page.SmartCollection);
    } else {
      setLastCollectionPage(currentPage);
      setSelectedMoment(moment);
      setCurrentPage(Page.MomentDetail);
    }
  };
  
  const handleUpdateMoment = (updatedMoment: Moment) => {
    setMoments(prev => prev.map(m => m.id === updatedMoment.id ? updatedMoment : m));
    if (selectedMoment && selectedMoment.id === updatedMoment.id) {
        setSelectedMoment(updatedMoment);
    }
  };

  const handleItemUpdate = (item: Moment | Journey) => {
    if ('momentIds' in item) { // It's a Journey
      setJourneys(prev => prev.map(j => j.id === item.id ? item : j));
    } else { // It's a Moment
      setMoments(prev => prev.map(m => m.id === item.id ? item : m));
      if (selectedMoment && selectedMoment.id === item.id) {
        setSelectedMoment(item);
      }
    }
  };

  const handleShareItemToFamily = (item: Moment | Journey) => {
    const currentUser = 'JD';
    
    const share = (i: Moment | Journey) => ({
      ...i,
      collaborators: Array.from(new Set([...(i.collaborators || []), currentUser]))
    });

    if ('momentIds' in item) { // Journey
      const journey = item;
      handleItemUpdate(share(journey));
      setMoments(prev => prev.map(m => {
        if (journey.momentIds.includes(m.id)) {
          return share(m) as Moment;
        }
        return m;
      }));
    } else { // Moment
      handleItemUpdate(share(item));
    }
  };

  const handleCreateMoment = (momentData: Omit<Moment, 'id' | 'pinned'>) => {
    if (userTier === 'free' && moments.length >= 100) {
      showToast("You've reached your 100 Momænt limit for the Free plan. Please upgrade to create more.", "error");
      handleNavigate(Page.Subscription);
      return;
    }
    let newId = 0;
    setMoments(prevMoments => {
      newId = (prevMoments.length > 0 ? Math.max(...prevMoments.map(m => m.id)) : 0) + 1;
      const newMoment: Moment = {
        ...momentData,
        id: newId,
        pinned: false,
      };
      return [newMoment, ...prevMoments];
    });
    setNewMomentId(newId);
    handleNavigate(Page.Moments);
    setTimeout(() => setNewMomentId(null), 3000);
  };
  
  const createFirstMoment = (momentData: Omit<Moment, 'id' | 'pinned'>): Moment => {
    const newMoment: Moment = {
      ...momentData,
      id: Date.now(),
      pinned: false,
    };
    setMoments(prevMoments => [newMoment, ...prevMoments]);
    return newMoment;
  };

  const handleDeleteMoment = (id: number) => {
    setDeletingMomentId(id);
    setTimeout(() => {
      setMoments(prev => prev.filter(m => m.id !== id));
      setJourneys(prev => prev.map(j => ({
        ...j,
        momentIds: j.momentIds.filter(mid => mid !== id)
      })));
      setDeletingMomentId(null);
    }, 2000);
  };

  const handleEditMoment = (moment: Moment) => {
    setSelectedMoment(moment);
    setCurrentPage(Page.Curate);
  };

  const handleCreateJourney = useCallback((title: string, description: string, momentIds: number[]) => {
    if (momentIds.length === 0) return;
    setJourneys(prev => {
        const newId = Math.max(0, ...prev.map(j => j.id)) + 1;
        const coverMoment = moments.find(m => m.id === momentIds[0]);
        const newJourney: Journey = {
          id: newId,
          title,
          description,
          momentIds,
          coverImage: coverMoment?.image || coverMoment?.images?.[0] || 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        };
        return [newJourney, ...prev];
    });
  }, [moments]);

  const handleStartCurationFromPhotos = useCallback((images: string[], title: string, description: string) => {
    if (userTier === 'free' && moments.length >= 100) {
      showToast("You've reached your 100 Momænt limit for the Free plan. Please upgrade to create more.", "error");
      handleNavigate(Page.Subscription);
      return;
    }
    if (images.length === 0) return;
    setMoments(prev => {
        const newId = Math.max(0, ...prev.map(m => m.id)) + 1;
        const newMoment: Moment = {
          id: newId,
          type: 'focus',
          aiTier: 'sparkle',
          pinned: false,
          title: title,
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          description: description,
          image: images[0],
          images: images,
          photoCount: images.length,
        };
        setSelectedMoment(newMoment);
        setCurrentPage(Page.Curate);
        return [newMoment, ...prev];
    });
  }, [moments, userTier, showToast, handleNavigate]);


  // --- Aeterny FAB Logic ---

  const cleanupTextChatAudio = useCallback(() => {
    if (textChatAudioSourceRef.current) {
        textChatAudioSourceRef.current.onended = null;
        textChatAudioSourceRef.current.stop();
    }
    if (textChatAudioContextRef.current && textChatAudioContextRef.current.state !== 'closed') {
        textChatAudioContextRef.current.close().catch(console.error);
    }
    textChatAudioContextRef.current = null;
    textChatAudioSourceRef.current = null;
    setCurrentlyPlayingFabText(null);
  }, []);

  const stopFabRecording = useCallback(() => {
    if (isFabStoppingRef.current) return;
    isFabStoppingRef.current = true;

    fabSessionPromiseRef.current?.then(session => session.close());
    fabSessionPromiseRef.current = null;
    
    fabStreamRef.current?.getTracks().forEach(track => track.stop());
    fabStreamRef.current = null;
    
    fabScriptProcessorRef.current?.disconnect();
    fabScriptProcessorRef.current = null;
    
    fabMediaStreamSourceRef.current?.disconnect();
    fabMediaStreamSourceRef.current = null;
    
    if (fabInputAudioContextRef.current && fabInputAudioContextRef.current.state !== 'closed') {
        fabInputAudioContextRef.current.close().catch(console.error);
    }
    fabInputAudioContextRef.current = null;

    fabAudioSourcesRef.current.forEach(source => source.stop());
    fabAudioSourcesRef.current.clear();
    if (fabOutputAudioContextRef.current && fabOutputAudioContextRef.current.state !== 'closed') {
        fabOutputAudioContextRef.current.close().catch(console.error);
    }
    fabOutputAudioContextRef.current = null;
    nextFabAudioTime.current = 0;

    setFabLiveDisplay(null);
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';

    setIsFabRecording(false);
    setTimeout(() => { isFabStoppingRef.current = false; }, 200);
  }, []);
  
  const handleToggleFab = () => {
    setIsFabChatOpen(prev => {
        if (!prev) {
            if (fabMessages.length === 0) {
                setIsFabLoading(true);
                startGenericAeternyChat(aeternyStyle, userTier).then(({ chat, initialMessage }) => {
                    fabChatRef.current = chat;
                    setFabMessages([{ sender: 'ai', text: initialMessage }]);
                    setIsFabLoading(false);
                }).catch(err => {
                  console.error("Failed to start FAB chat", err);
                  setFabMessages([{ sender: 'ai', text: "Sorry, I can't connect right now." }]);
                  setIsFabLoading(false);
                });
            }
        } else {
          stopFabRecording();
          cleanupTextChatAudio();
        }
        return !prev;
    });
  };

  const handleSendFabMessage = async () => {
    if (!fabInput.trim() || !fabChatRef.current || isFabLoading) return;

    if(isFabRecording) stopFabRecording();
    cleanupTextChatAudio();

    const userMessage: Message = { sender: 'user', text: fabInput };
    setFabMessages(prev => [...prev, userMessage]);
    setFabInput('');
    setIsFabLoading(true);

    try {
      const response = await continueAeternyChat(fabChatRef.current, userMessage.text);
      const aiMessage: Message = { sender: 'ai', text: response };
      setFabMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error in FAB chat:", error);
      const errorMessage: Message = { sender: 'ai', text: "I'm sorry, I'm having a little trouble right now." };
      setFabMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsFabLoading(false);
    }
  };
  
  const handlePlayFabTts = useCallback(async (text: string) => {
    if (!isFabTtsEnabled || currentlyPlayingFabText) return;
    cleanupTextChatAudio();

    setCurrentlyPlayingFabText(text);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      textChatAudioContextRef.current = audioContext;
      const buffer = await textToSpeech(text, audioContext, aeternyVoice, aeternyStyle);

      if (buffer && textChatAudioContextRef.current) {
        const source = textChatAudioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(textChatAudioContextRef.current.destination);
        source.start();
        source.onended = () => {
          if (textChatAudioSourceRef.current === source) {
            cleanupTextChatAudio();
          }
        };
        textChatAudioSourceRef.current = source;
      } else {
        cleanupTextChatAudio();
      }
    } catch (error) {
      console.error("TTS Error:", error);
      cleanupTextChatAudio();
    }
  }, [isFabTtsEnabled, currentlyPlayingFabText, cleanupTextChatAudio, aeternyVoice, aeternyStyle]);

  const handleToggleFabRecording = async () => {
    if (isFabRecording) {
      stopFabRecording();
    } else {
      cleanupTextChatAudio();
      setIsFabRecording(true);
      setFabInput('');

      try {
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
        fabStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        fabInputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        fabOutputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

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
                  let userTranscription = '';
                  let aiTranscription = '';

                  if (message.serverContent?.inputTranscription) {
                      userTranscription = currentInputTranscriptionRef.current + message.serverContent.inputTranscription.text;
                  }
                  if (message.serverContent?.outputTranscription) {
                      aiTranscription = currentOutputTranscriptionRef.current + message.serverContent.outputTranscription.text;
                  }

                  setFabLiveDisplay({ user: userTranscription, ai: aiTranscription });

                  if (isFabTtsEnabled) {
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && fabOutputAudioContextRef.current) {
                      const audioContext = fabOutputAudioContextRef.current;
                      nextFabAudioTime.current = Math.max(nextFabAudioTime.current, audioContext.currentTime);
                      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                      const source = audioContext.createBufferSource();
                      source.buffer = audioBuffer;
                      source.connect(audioContext.destination);
                      source.addEventListener('ended', () => fabAudioSourcesRef.current.delete(source));
                      source.start(nextFabAudioTime.current);
                      nextFabAudioTime.current += audioBuffer.duration;
                      fabAudioSourcesRef.current.add(source);
                    }
                  }
                  
                  if (message.serverContent?.interrupted) {
                      fabAudioSourcesRef.current.forEach(source => source.stop());
                      fabAudioSourcesRef.current.clear();
                      nextFabAudioTime.current = 0;
                  }

                  if (message.serverContent?.turnComplete) {
                      const finalUserInput = userTranscription || currentInputTranscriptionRef.current;
                      const finalAiOutput = aiTranscription || currentOutputTranscriptionRef.current;
                      
                      if (finalUserInput) setFabMessages(prev => [...prev, { sender: 'user', text: finalUserInput }]);
                      if (finalAiOutput) setFabMessages(prev => [...prev, { sender: 'ai', text: finalAiOutput }]);

                      currentInputTranscriptionRef.current = '';
                      currentOutputTranscriptionRef.current = '';
                      setFabLiveDisplay(null);
                  } else {
                    if (message.serverContent?.inputTranscription) currentInputTranscriptionRef.current = userTranscription;
                    if (message.serverContent?.outputTranscription) currentOutputTranscriptionRef.current = aiTranscription;
                  }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('FAB voice error:', e);
                    setFabMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble with the voice connection." }]);
                    stopFabRecording();
                },
                onclose: () => {
                }
            },
            config: { 
                systemInstruction: getGenericAeternySystemInstruction(aeternyStyle, userTier),
                inputAudioTranscription: {}, 
                outputAudioTranscription: {},
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: aeternyVoice }}}
            }
        });

    } catch (error) {
        console.error("Mic access error:", error);
        stopFabRecording();
    }
    }
  };

  const handleContextualSend = (prompt: string) => {
    setFabInput(prompt);
    setTimeout(() => {
        handleSendFabMessage();
    }, 0);
  };
  
  const contextualPrompts = useMemo(() => {
    switch (currentPage) {
        case Page.Home: return ["Tell me a fun fact about memories.", "What's my latest moment?", "Suggest a new moment to create."];
        case Page.Moments: return ["Find moments from last summer.", "What are my pinned moments?", "Help me curate these moments."];
        case Page.Create: return ["Suggest a title for my new moment.", "Help me write a story.", "What tags should I use?"];
        default: return [];
    }
  }, [currentPage]);
  
  useEffect(() => {
    return () => {
      cleanupTextChatAudio();
      stopFabRecording();
    };
  }, [cleanupTextChatAudio, stopFabRecording]);
  
  const spaceContext = useMemo(() => {
    switch (currentPage) {
      case Page.Moments:
      case Page.Create:
      case Page.Record:
      case Page.Curate:
      case Page.DataInsight:
      case Page.SmartCollection:
        return 'personal';
      case Page.FamilySpace:
      case Page.FamilyMoments:
      case Page.FamilyStoryline:
        return 'family';
      case Page.LegacySpace:
      case Page.LegacyTrust:
      case Page.TimeCapsule:
      case Page.Biografer:
        return 'legacy';
      default:
        return null;
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
        case Page.Home:
            return <HomePage onNavigate={handleNavigate} moments={moments} onSelectMoment={handleSelectMoment} />;
        case Page.Interview:
            return <InterviewPage
                onComplete={handleInterviewComplete}
                aeternyAvatar={aeternyAvatar}
                aeternyVoice={aeternyVoice}
                setAeternyVoice={setAeternyVoice}
                aeternyStyle={aeternyStyle}
                setAeternyStyle={setAeternyStyle}
                onCreateFirstMoment={createFirstMoment}
                showToast={showToast}
                userTier={userTier}
            />;
        case Page.Moments:
            return <MomentsPage
                moments={moments}
                journeys={journeys}
                onCreateJourney={handleCreateJourney}
                onPinToggle={handlePinToggle}
                onSelectMoment={handleSelectMoment}
                onItemUpdate={handleItemUpdate}
                onShareToFamily={handleShareItemToFamily}
                userTier={userTier}
                onNavigate={handleNavigate}
                newMomentId={newMomentId}
                deletingMomentId={deletingMomentId}
                showGuide={activeGuidePage === Page.Moments}
                onCloseGuide={() => setActiveGuidePage(null)}
            />;
        case Page.Create:
            return <CreatePage 
                onCreateMoment={handleCreateMoment} 
                onNavigate={handleNavigate} 
                userTier={userTier} 
                showGuide={activeGuidePage === Page.Create}
                onCloseGuide={() => setActiveGuidePage(null)}
            />;
        case Page.Record:
            return <RecordPage onCreateMoment={handleCreateMoment} />;
        case Page.Curate:
            return <CuratePage
                moments={moments}
                onUpdateMoment={handleUpdateMoment}
                aeternyAvatar={aeternyAvatar}
                initialMoment={selectedMoment}
                onClearInitialMoment={() => setSelectedMoment(null)}
                onNavigate={handleNavigate}
                userTier={userTier}
                tokenState={tokenState}
                onUseFreeHeaderAnimation={useFreeHeaderAnimation}
                triggerConfirmation={triggerConfirmation}
                showGuide={activeGuidePage === Page.Curate}
                onCloseGuide={() => setActiveGuidePage(null)}
                showToast={showToast}
            />;
        case Page.MomentDetail:
            return selectedMoment && <MomentDetailPage
                moment={selectedMoment}
                onBack={() => handleNavigate(lastCollectionPage)}
                onUpdateMoment={handleUpdateMoment}
                aeternyVoice={aeternyVoice}
                aeternyStyle={aeternyStyle}
                onEditMoment={handleEditMoment}
                onDeleteMoment={handleDeleteMoment}
            />;
        case Page.Profile:
            return <ProfilePage
                profilePic={profilePic}
                onProfilePicChange={setProfilePic}
                aeternyAvatar={aeternyAvatar}
                setAeternyAvatar={setAeternyAvatar}
                aeternyVoice={aeternyVoice}
                setAeternyVoice={setAeternyVoice}
                aeternyStyle={aeternyStyle}
                setAeternyStyle={setAeternyStyle}
                onNavigate={handleNavigate}
                userTier={userTier}
                setUserTier={setUserTier}
                familyName={familyName}
                onFamilyNameChange={setFamilyName}
                familyProfilePic={familyProfilePic}
                onFamilyProfilePicChange={setFamilyProfilePic}
                tokenState={tokenState}
                onAddTokens={addTokens}
                showToast={showToast}
            />;
        case Page.DataInsight:
            return <DataInsightPage moments={moments} />;
        case Page.TimeCapsule:
            return <TimeCapsulePage moments={moments} onBack={() => handleNavigate(Page.LegacySpace)} triggerConfirmation={triggerConfirmation} />;
        case Page.FamilyStoryline:
            return <FamilyStorylinePage moments={moments} onBack={() => handleNavigate(Page.FamilySpace)} />;
        case Page.LegacySpace:
            return <LegacySpacePage 
                userTier={userTier} 
                onNavigate={handleNavigate} 
                profilePic={profilePic} 
                userName={userName} 
                moments={moments}
                journeys={journeys}
                onSelectMoment={handleSelectMoment}
                deletingMomentId={deletingMomentId}
            />;
        case Page.LegacyTrust:
            return <LegacyTrustPage onBack={() => handleNavigate(Page.LegacySpace)} />;
        case Page.Theater:
            return <TheaterPage moments={moments} aeternyVoice={aeternyVoice} onExit={() => handleNavigate(Page.Moments)} startingMomentId={selectedMoment?.id} />;
        case Page.FamilyPlan:
            return <FamilyPlanPage onNavigate={handleNavigate} />;
        case Page.FamilySpace:
            return (
                <FamilySpacePage
                    onNavigate={handleNavigate}
                    userTier={userTier}
                    moments={moments}
                    onSelectMoment={handleSelectMoment}
                    onPinToggle={handlePinToggle}
                    onUpdateMoment={handleUpdateMoment}
                    onEditMoment={handleEditMoment}
                    onDeleteMoment={handleDeleteMoment}
                    deletingMomentId={deletingMomentId}
                />
            );
        case Page.Shop:
            return <ShopPage onNavigate={handleNavigate} userTier={userTier} />;
        case Page.FamilyMoments: {
            const familyMoments = moments.filter(m => (m.collaborators && m.collaborators.length > 0) || (m.createdBy && m.createdBy !== 'JD'));
            const familyJourneys = journeys.filter(j => j.collaborators && j.collaborators.length > 0);
            return <FamilyMomentsPage 
              moments={familyMoments}
              journeys={familyJourneys}
              onPinToggle={handlePinToggle}
              onSelectMoment={handleSelectMoment} 
              onItemUpdate={handleItemUpdate}
              onShareToFamily={handleShareItemToFamily}
              userTier={userTier}
              onNavigate={handleNavigate}
              newMomentId={newMomentId}
              deletingMomentId={deletingMomentId}
            />;
          }
      case Page.Subscription:
        return <SubscriptionPage userTier={userTier} onNavigate={handleNavigate} />;
      case Page.Magazine:
        return <MagazinePage
            onNavigate={handleNavigate} 
            userTier={userTier} 
            moments={moments} 
            journeys={journeys} 
            triggerConfirmation={triggerConfirmation}
        />;
      case Page.Journaling:
        return <JournalingPage onNavigate={handleNavigate} />;
      case Page.Photobook:
        return <PhotobookPage onNavigate={handleNavigate} />;
      case Page.Biografer:
        return <BiograferPage onBack={() => handleNavigate(Page.LegacySpace)} triggerConfirmation={triggerConfirmation} />;
      case Page.BulkUpload:
        return <BulkUploadPage onNavigate={handleNavigate} userTier={userTier} triggerConfirmation={triggerConfirmation} />;
      case Page.AIVideo:
        return <AIVideoPage
            onNavigate={handleNavigate}
            userTier={userTier}
            moments={moments}
            journeys={journeys}
            onItemUpdate={handleItemUpdate}
            aeternyStyle={aeternyStyle}
            triggerConfirmation={triggerConfirmation}
        />;
      case Page.About:
        return <AboutPage onNavigate={handleNavigate} />;
      case Page.SmartCollection:
        return <SmartCollectionPage
            moments={moments}
            onNavigate={handleNavigate}
            onCreateFocusMoment={handleStartCurationFromPhotos}
        />;
      case Page.TrustCenter:
        return <TrustCenterPage onNavigate={handleNavigate} />;
      case Page.BulkUploadReview:
        return <BulkUploadReviewPage onNavigate={handleNavigate} />;
      case Page.Articles:
        return <ArticlesPage onNavigate={handleNavigate} />;
      case Page.VRLab:
        return <VRLabPage onNavigate={handleNavigate} />;
      case Page.Landing:
      default:
        return <LandingPage onLogin={() => openAuthModal(AuthMode.Login)} onRegister={() => openAuthModal(AuthMode.Register)} onSkipForDemo={handleSkipForDemo} onNavigate={handleNavigate} onStartDemo={handleStartDemo} />;
    }
  };

  const showHeader = isLoggedIn && ![Page.Landing, Page.Interview, Page.Theater, Page.MomentDetail, Page.FamilyPlan, Page.About, Page.TrustCenter, Page.Articles].includes(currentPage);
  const showFab = isLoggedIn && ![Page.Landing, Page.Interview, Page.Theater].includes(currentPage);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex overflow-x-hidden max-w-[100vw]">
       {/* Sidebar only on Desktop, hidden on mobile */}
       {showHeader && <Sidebar currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} userTier={userTier} />}
       
       <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 relative ${showHeader ? 'md:ml-20' : ''}`}>
          {/* TopBar (Header) handles mobile menu and global actions */}
          {showHeader && <Header onNavigate={handleNavigate} onLogout={handleLogout} currentPage={currentPage} userTier={userTier} profilePic={profilePic} spaceContext={spaceContext} tokenState={tokenState} />}
          
          <main className="flex-1 relative">
            {renderPage()}
          </main>
       </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
        />
      )}
      <ConfirmationModal 
        isOpen={confirmationState.isOpen}
        onClose={confirmationState.onClose}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        cost={confirmationState.cost}
        isLoading={confirmationState.isLoading}
      />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      
      {/* Smart Guide Component - Context Aware AI Hints */}
      {isLoggedIn && (
        <SmartGuide 
            currentPage={currentPage}
            moments={moments}
            onNavigate={handleNavigate}
            aeternyAvatar={aeternyAvatar}
            userName={userName}
        />
      )}

      {showFab && (
        <AeternyFab
          isOpen={isFabChatOpen}
          onToggle={handleToggleFab}
          messages={fabMessages}
          input={fabInput}
          onInputChange={(value) => {
            if (isFabRecording) stopFabRecording();
            cleanupTextChatAudio();
            setFabInput(value);
          }}
          onSend={handleSendFabMessage}
          isLoading={isFabLoading}
          isRecording={isFabRecording}
          onToggleRecording={handleToggleFabRecording}
          isTtsEnabled={isFabTtsEnabled}
          onToggleTts={() => setIsFabTtsEnabled(prev => !prev)}
          onPlayTts={handlePlayFabTts}
          isTtsPlaying={currentlyPlayingFabText !== null}
          currentlyPlayingText={currentlyPlayingFabText}
          aeternyAvatar={aeternyAvatar}
          contextualPrompts={contextualPrompts}
          onContextualSend={handleContextualSend}
          liveDisplay={fabLiveDisplay}
          currentPage={currentPage}
          onTriggerGuide={() => setActiveGuidePage(currentPage)}
        />
      )}
       {showProductDemo && (
        <ProductDemo 
            onClose={() => setShowProductDemo(false)}
            onComplete={handleDemoComplete}
        />
      )}
    </div>
  );
};

export default App;
