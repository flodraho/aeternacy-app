

import React from 'react';
import { Page, UserTier, Moment, Journey } from '../types';
import { Clock, Mic, BookOpen, ShieldCheck, Users, BrainCircuit } from 'lucide-react';
import GridView from './GridView';
import Slideshow from './Slideshow';
import LegacyLandingPage from './LegacyLandingPage';

interface LegacySpacePageProps {
    userTier: UserTier;
    onNavigate: (page: Page) => void;
    profilePic: string | null;
    userName: string;
    moments: Moment[];
    journeys: Journey[];
    onSelectMoment: (moment: Moment) => void;
    deletingMomentId?: string | null;
}

const LegacyDashboard: React.FC<{ 
    onNavigate: (page: Page) => void; 
    profilePic: string | null; 
    userName: string;
    moments: Moment[];
    journeys: Journey[];
    onSelectMoment: (moment: Moment) => void;
    deletingMomentId?: string | null;
}> = ({ onNavigate, profilePic, userName, moments, journeys, onSelectMoment, deletingMomentId }) => {
    
    const legacyMoments = moments.filter(m => m.isLegacy);
    const legacyJourneys = journeys.filter(j => j.isLegacy);
    const backgroundImages = moments.filter(m => m.pinned || m.isLegacy).map(m => m.image || m.images?.[0]).filter((img): img is string => !!img);


    const DashboardCard: React.FC<{ icon: React.ElementType, title: string, description: string, page: Page, isVision?: boolean }> = ({ icon: Icon, title, description, page, isVision = false }) => (
        <button onClick={() => onNavigate(page)} className={`bg-gray-800/50 p-8 rounded-2xl ring-1 ${isVision ? 'ring-purple-400/50' : 'ring-white/10'} text-left h-full flex flex-col hover:bg-gray-700/50 ${isVision ? 'hover:ring-purple-400' : 'hover:ring-amber-400/50'} transition-all transform hover:-translate-y-1`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ring-1 ${isVision ? 'bg-purple-500/10 ring-purple-500/20' : 'bg-amber-500/10 ring-amber-500/20'} mb-4`}>
                <Icon className={`w-6 h-6 ${isVision ? 'text-purple-300' : 'text-amber-300'}`} />
            </div>
            <h3 className="text-xl font-bold text-white font-brand flex items-center justify-between">
                {title}
                {isVision && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Vision</span>}
            </h3>
            <p className="text-slate-400 mt-2 text-sm flex-grow">{description}</p>
            <p className={`text-sm font-semibold ${isVision ? 'text-purple-300' : 'text-amber-400'} mt-6 self-start`}>Explore &rarr;</p>
        </button>
    );
    
    const JourneyCard: React.FC<{ journey: Journey; onClick: () => void; }> = ({ journey, onClick }) => (
        <div onClick={onClick} className="relative aspect-[10/7] cursor-pointer group p-4">
            <div className="absolute inset-4 bg-slate-700/50 rounded-2xl ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-2 group-hover:-rotate-6"></div>
            <div className="absolute inset-2 bg-slate-800/50 rounded-2xl ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-3"></div>
            <div className="relative w-full h-full bg-slate-800 rounded-2xl overflow-hidden ring-1 ring-white/10 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
                <img src={journey.coverImage} alt={journey.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-bold text-white text-lg font-brand">{journey.title}</h3>
                    <p className="text-xs text-slate-400">{journey.momentIds.length} momænts</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen">
             <div className="absolute inset-0 z-0">
                {backgroundImages.length > 0 ? (
                    <Slideshow images={backgroundImages} isPlaying={true} />
                ) : (
                    <div className="w-full h-full bg-slate-900"></div>
                )}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 pt-28 pb-8 animate-fade-in-up">
                <section className="relative mb-16 text-center">
                    <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute -inset-2 bg-amber-400 rounded-full blur-2xl opacity-30 animate-pulse-glow" style={{ animationDuration: '5s' }}></div>
                        {profilePic ? (
                            <img src={profilePic} alt="Your profile" className="relative w-full h-full object-cover rounded-full ring-4 ring-slate-700"/>
                        ) : (
                            <div className="relative w-full h-full bg-slate-700 rounded-full ring-4 ring-slate-600 flex items-center justify-center">
                                <Users className="w-16 h-16 text-slate-500" />
                            </div>
                        )}
                    </div>
                    <h1 className="mt-6 text-4xl md:text-5xl font-bold font-brand text-white">Welcome to Your Lægacy, {userName}.</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">This is your private sanctuary. A timeless space to curate, preserve, and reflect on your life's story.</p>
                </section>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <DashboardCard icon={ShieldCheck} title="Legacy Trust" description="Appoint stewards and manage your succession protocol to ensure your story endures." page={Page.LegacyTrust} />
                    <DashboardCard icon={Clock} title="Time Capsules" description="Create time-locked messages and legacy letters for the future." page={Page.TimeCapsule} />
                    <DashboardCard icon={Mic} title="The Biografær" description="Engage in AI-guided interviews to build a rich, comprehensive life story." page={Page.Biografer} />
                    <DashboardCard icon={BookOpen} title="Creation Suite" description="Design and order physical magazines and photobooks from your moments." page={Page.Shop} />
                    <div className="md:col-span-2 lg:col-span-1">
                        <DashboardCard 
                          icon={BrainCircuit} 
                          title="VR Lab" 
                          description="Go beyond remembering. Step back in time and relive moments in hyper-realistic VR & AR." 
                          page={Page.VRLab} 
                          isVision={true}
                        />
                    </div>
                </div>
                
                 {legacyJourneys.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-3xl font-bold font-brand text-white mb-8">Your Lægacy Journæys</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {legacyJourneys.map(journey => (
                                <JourneyCard key={journey.id} journey={journey} onClick={() => {
                                    // TODO: Navigate to a specific journey view within the legacy context
                                }} />
                            ))}
                        </div>
                    </section>
                )}

                {legacyMoments.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-3xl font-bold font-brand text-white mb-8">Your Lægacy Momænts</h2>
                        <GridView 
                            moments={legacyMoments}
                            onSelectMoment={onSelectMoment}
                            onPinToggle={() => {}} 
                            onShare={() => {}}
                            onNavigate={onNavigate}
                            deletingMomentId={deletingMomentId}
                        />
                    </section>
                )}
            </div>
        </div>
    );
};


const LegacySpacePage: React.FC<LegacySpacePageProps> = ({ userTier, onNavigate, profilePic, userName, moments, journeys, onSelectMoment, deletingMomentId }) => {
    
    if (userTier === 'legacy') {
        return <LegacyDashboard onNavigate={onNavigate} profilePic={profilePic} userName={userName} moments={moments} journeys={journeys} onSelectMoment={onSelectMoment} deletingMomentId={deletingMomentId} />;
    }

    return <LegacyLandingPage onNavigate={onNavigate} />;
};

export default LegacySpacePage;
