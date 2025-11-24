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
import { Chat } from '@google/genai';
import { startAeternyChat, continueAeternyChat } from '../services/geminiService';
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
import SmartCollectionPage from './SmartCollectionPage';
import Toast, { ToastMessage } from './Toast';
import TrustCenterPage from './TrustCenterPage';
import BulkUploadReviewPage from './BulkUploadReviewPage';
import ProductDemo from './ProductDemo';
import ArticlesPage from './ArticlesPage';
import GiftPage from './GiftPage';
import FamilyTreePage from './FamilyTreePage';
import ComparePlansPage from './ComparePlansPage';
import FamilyRitualsPage from './FamilyRitualsPage';
import RitualDashboardPage from './RitualDashboardPage';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

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
  const [newMomentId, setNewMomentId] = useState<string | null>(null);
  const [deletingMomentId, setDeletingMomentId] = useState<string | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>(initialJourneys);
  const [lastCollectionPage, setLastCollectionPage] = useState<Page>(Page.Moments);
  const [showProductDemo, setShowProductDemo] = useState(false);
  const [demoDataForFirstMoment, setDemoDataForFirstMoment] = useState<DemoData | null>(null);
  
  // User profile state
  const [userName, setUserName] = useState('John Doe');
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  
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
  
  const [tokenState, setTokenState] = useState<TokenState>({
    balance: 800,
    monthlyAllocation: 4000,
    rollover: 200,
    freeHeaderAnimations: { used: 0, total: 10 }
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ id: Date.now(), message, type });
  }, []);
  
  const [confirmationState, setConfirmationState] = useState<{isOpen: boolean; cost: number; featureKey: string; onConfirm: (() => Promise<any>) | null; message?: string}>({isOpen: false, cost: 0, featureKey: '', onConfirm: null});
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setIsAuthLoading(true);
        if (firebaseUser) {
            setUser(firebaseUser);
            setUserName(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User');
            setProfilePic(firebaseUser.photoURL);
            
            const isNewUser = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;

            if (isNewUser) {
                if (demoDataForFirstMoment) {
                    // Create moment from demo
                } else {
                    handleNavigate(Page.Interview);
                }
            } else {
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
      setShowAuthModal(false);
  }, []);

  const handleSelectMoment = (moment: Moment) => { setSelectedMoment(moment); handleNavigate(Page.MomentDetail); };
  
  const handleUpdateMoment = (updatedItem: Moment | Journey) => {
    if ('momentIds' in updatedItem) {
      setJourneys(prev => prev.map(j => (j.id === updatedItem.id ? updatedItem : j)));
    } else {
      setMoments(prev => prev.map(m => (m.id === updatedItem.id ? updatedItem : m)));
    }
  };

  const handlePinToggle = (id: string) => { setMoments(prev => prev.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m)); };
  const handleSelectRitual = (ritual: ActiveRitual) => { setSelectedRitual(ritual); handleNavigate(Page.RitualDashboard); };
  const handleAddContributionToRitual = (ritualId: string) => { setRitualContextId(ritualId); handleNavigate(Page.Create); };

  const handleCreateMoment = (momentData: Omit<Moment, 'id' | 'pinned'>) => {
    const newId = Date.now().toString();
    const newMoment: Moment = { ...momentData, id: newId, pinned: false, createdBy: user?.displayName?.substring(0, 2).toUpperCase() || 'ME' };
    setMoments(prev => [newMoment, ...prev]);
    setNewMomentId(newId);
    setTimeout(() => setNewMomentId(null), 4000);
    handleNavigate(Page.Moments);
  };
  
  const handleCreateFirstMoment = useCallback((momentData: Omit<Moment, 'id' | 'pinned'>): Moment => {
    const newId = Date.now().toString();
    const newMoment: Moment = { ...momentData, id: newId, pinned: false };
    setMoments(prev => [newMoment, ...prev]);
    return newMoment;
  }, []);
  
  const handleDeleteMoment = (id: string) => {
    setDeletingMomentId(id);
    setTimeout(() => {
      setMoments(prev => prev.filter(m => m.id !== id));
      setDeletingMomentId(null);
    }, 2000);
  };

  const handleCreateJourney = (title: string, description: string, momentIds: string[]) => {
    const newJourney: Journey = {
      id: Date.now().toString(), title, description, momentIds,
      coverImage: moments.find(m => m.id === momentIds[0])?.image || '',
    };
    setJourneys(prev => [newJourney, ...prev]);
  };

  const handleStartCurationFromPhotos = (images: string[], title: string, description: string) => {
    const newId = Date.now().toString();
    const newMoment: Moment = { 
        id: newId, pinned: false, type: 'focus', aiTier: 'sparkle', image: images[0],
        images, photoCount: images.length, title, description,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    setMoments(prev => [newMoment, ...prev]);
    setNewMomentId(newId);
    setTimeout(() => setNewMomentId(null), 4000);
    handleNavigate(Page.Moments);
  };

  const handleCompleteDemo = (shouldRegister: boolean, demoData?: DemoData) => {
    setShowProductDemo(false);
    if (shouldRegister) {
      if (demoData) setDemoDataForFirstMoment(demoData);
      handleRegister();
    }
  };
  
  const triggerConfirmation = (cost: number, featureKey: string, onConfirm: () => Promise<any>, message?: string) => {
    setConfirmationState({ isOpen: true, cost, featureKey, onConfirm, message });
  };
  
  const executeConfirmation = async () => {
    if (!confirmationState.onConfirm) return;
    setIsConfirming(true);
    try {
      await confirmationState.onConfirm();
    } catch (e) {
      // Error handling is inside the onConfirm function itself
    } finally {
      setIsConfirming(false);
      setConfirmationState({ isOpen: false, cost: 0, featureKey: '', onConfirm: null });
    }
  };

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
      if (showProductDemo) {
          return <ProductDemo onClose={() => setShowProductDemo(false)} onComplete={handleCompleteDemo} />;
      }
      switch (currentPage) {
          case Page.About: return <AboutPage onNavigate={handleNavigate} />;
          case Page.TrustCenter: return <TrustCenterPage onNavigate={handleNavigate} />;
          case Page.Journal: return <ArticlesPage onNavigate={handleNavigate} />;
          default: return <LandingPage onLogin={handleLogin} onRegister={handleRegister} onNavigate={handleNavigate} onStartDemo={() => setShowProductDemo(true)} onSkipForDemo={() => {setUser({} as User); handleNavigate(Page.Home);}} />;
      }
    }
    
    switch (currentPage) {
        case Page.Home: return <HomePage onNavigate={handleNavigate} userName={userName} moments={moments} onSelectMoment={handleSelectMoment} activeRituals={activeRituals} onSelectRitual={handleSelectRitual} />;
        case Page.Interview: return <InterviewPage onComplete={(id) => { if(id) { setSelectedMoment(moments.find(m => m.id === id) || null); handleNavigate(Page.MomentDetail); } else { handleNavigate(Page.Home); } }} aeternyAvatar={aeternyAvatar} aeternyVoice={aeternyVoice} setAeternyVoice={setAeternyVoice} aeternyStyle={aeternyStyle} setAeternyStyle={setAeternyStyle} onCreateFirstMoment={handleCreateFirstMoment} showToast={showToast} userTier={userTier} setFamilyMembers={setFamilyMembers} />;
        case Page.Moments: return <MomentsPage moments={moments} journeys={journeys} onCreateJourney={handleCreateJourney} onPinToggle={handlePinToggle} onSelectMoment={handleSelectMoment} onItemUpdate={handleUpdateMoment} onShareToFamily={() => {}} userTier={userTier} onNavigate={handleNavigate} newMomentId={newMomentId} deletingMomentId={deletingMomentId} />;
        case Page.Create: return <CreatePage onCreateMoment={handleCreateMoment} onNavigate={handleNavigate} userTier={userTier} tokenState={tokenState} ritualContextId={ritualContextId} onClearRitualContext={() => setRitualContextId(null)} />;
        case Page.Record: return <RecordPage onCreateMoment={handleCreateMoment} />;
        case Page.Curate: return <CuratePage moments={moments} onUpdateMoment={handleUpdateMoment} aeternyAvatar={aeternyAvatar} initialMoment={selectedMoment} onClearInitialMoment={() => setSelectedMoment(null)} onNavigate={handleNavigate} userTier={userTier} tokenState={tokenState} onUseFreeHeaderAnimation={() => {}} triggerConfirmation={triggerConfirmation} showGuide={false} onCloseGuide={()=>{}} showToast={showToast} aeternyVoice={aeternyVoice} aeternyStyle={aeternyStyle} />;
        case Page.MomentDetail: return selectedMoment ? <MomentDetailPage moment={selectedMoment} onBack={() => handleNavigate(lastCollectionPage)} onUpdateMoment={handleUpdateMoment} aeternyVoice={aeternyVoice} aeternyStyle={aeternyStyle} onEditMoment={(m) => { setSelectedMoment(m); handleNavigate(Page.Curate); }} onDeleteMoment={handleDeleteMoment} userTier={userTier} onNavigate={handleNavigate} /> : <p>Moment not found</p>;
        case Page.Profile: return <ProfilePage profilePic={profilePic} onProfilePicChange={setProfilePic} aeternyAvatar={aeternyAvatar} setAeternyAvatar={setAeternyAvatar} aeternyVoice={aeternyVoice} setAeternyVoice={setAeternyVoice} aeternyStyle={aeternyStyle} setAeternyStyle={setAeternyStyle} onNavigate={handleNavigate} userTier={userTier} setUserTier={setUserTier} familyName={familyName} onFamilyNameChange={setFamilyName} familyProfilePic={familyProfilePic} onFamilyProfilePicChange={setFamilyProfilePic} tokenState={tokenState} showToast={showToast} onAddTokens={()=>{}} familyMembers={familyMembers} setFamilyMembers={setFamilyMembers} />;
        case Page.DataInsight: return <DataInsightPage moments={moments} />;
        case Page.TimeCapsule: return <TimeCapsulePage moments={moments} onBack={() => handleNavigate(Page.LegacySpace)} triggerConfirmation={triggerConfirmation} userTier={userTier} onNavigate={handleNavigate}/>;
        case Page.FamilyStoryline: return <FamilyStorylinePage moments={moments} onBack={() => handleNavigate(Page.FamilySpace)} />;
        case Page.LegacySpace: return <LegacySpacePage userTier={userTier} onNavigate={handleNavigate} profilePic={profilePic} userName={userName} moments={moments} journeys={journeys} onSelectMoment={handleSelectMoment} deletingMomentId={deletingMomentId} />;
        case Page.Theater: return <TheaterPage moments={moments} aeternyVoice={aeternyVoice} onExit={() => handleNavigate(Page.Home)} startingMomentId={selectedMoment?.id} />;
        case Page.FamilyPlan: return <FamilyPlanPage onNavigate={handleNavigate} />;
        case Page.FamilySpace: return <FamilySpacePage onNavigate={handleNavigate} userTier={userTier} moments={moments} onSelectMoment={handleSelectMoment} onPinToggle={handlePinToggle} onUpdateMoment={handleUpdateMoment} onEditMoment={(m) => { setSelectedMoment(m); handleNavigate(Page.Curate); }} onDeleteMoment={handleDeleteMoment} deletingMomentId={deletingMomentId} />;
        case Page.Subscription: return <SubscriptionPage userTier={userTier} onNavigate={handleNavigate} momentsCount={moments.length} daysRemaining={null} />;
        case Page.FamilyMoments: return <FamilyMomentsPage moments={moments} journeys={journeys} onPinToggle={() => {}} onSelectMoment={handleSelectMoment} onItemUpdate={handleUpdateMoment} onShareToFamily={() => {}} userTier={userTier} onNavigate={handleNavigate} />;
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
        case Page.Gift: return <GiftPage onNavigate={handleNavigate} />;
        case Page.FamilyTree: return <FamilyTreePage onNavigate={handleNavigate} userTier={userTier} />;
        case Page.ComparePlans: return <ComparePlansPage onNavigate={handleNavigate} />;
        case Page.FamilyRituals: return <FamilyRitualsPage moments={moments} showToast={showToast} onNavigate={handleNavigate} activeRituals={activeRituals} setActiveRituals={setActiveRituals} onSelectRitual={handleSelectRitual} familyMembers={familyMembers} userTier={userTier} />;
        case Page.RitualDashboard: return selectedRitual ? <RitualDashboardPage ritual={selectedRitual} moments={moments} onNavigate={handleNavigate} onAddContribution={handleAddContributionToRitual} triggerConfirmation={triggerConfirmation} showToast={showToast} /> : <p>Ritual not found</p>;
        case Page.Journal: return <ArticlesPage onNavigate={handleNavigate} />;
        default: return <LandingPage onLogin={handleLogin} onRegister={handleRegister} onNavigate={handleNavigate} onStartDemo={() => setShowProductDemo(true)} onSkipForDemo={() => {setUser({} as User); handleNavigate(Page.Home);}} />;
    }
  };

  return (
    <>
      {currentPage !== Page.Landing && user && (
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
      {renderPage()}
      
      {showAuthModal && (
        <AuthModal 
          mode={authMode} 
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          switchMode={() => setAuthMode(m => m === AuthMode.Login ? AuthMode.Register : AuthMode.Login)} 
        />
      )}
      
      <ConfirmationModal 
        isOpen={confirmationState.isOpen}
        onClose={() => setConfirmationState(p => ({...p, isOpen: false}))}
        onConfirm={executeConfirmation}
        title="Confirm AI Creation"
        message={confirmationState.message}
        cost={confirmationState.cost}
        isLoading={isConfirming}
      />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
};

export default App;
