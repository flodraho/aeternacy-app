
import React, { useState, useEffect, useCallback } from 'react';
import { Page, UserTier, Moment, Journey } from '../types';
import { Lock, Clock, Mic, BookOpen, ShieldCheck, Users, MapPin, ArrowRight, Wand2, BookImage, Headset } from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';
import GridView from './GridView';
import { fetchPexelsImages } from '../services/pexelsService';

interface LegacySpacePageProps {
    userTier: UserTier;
    onNavigate: (page: Page) => void;
    profilePic: string | null;
    userName: string;
    moments: Moment[];
    journeys: Journey[];
    onSelectMoment: (moment: Moment) => void;
    deletingMomentId?: number | null;
}

const Feature: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center ring-1 ring-amber-500/20 mb-4">
            <Icon className="w-8 h-8 text-amber-300" />
        </div>
        <h3 className="text-xl font-bold text-white font-brand">{title}</h3>
        <p className="text-slate-400 mt-2 text-sm max-w-xs">{description}</p>
    </div>
);

// Reusing the Card Pattern from HomePage for consistency
const DashboardCard: React.FC<{ icon: React.ElementType, title: string, description: string, page: Page, isVision?: boolean, onNavigate: (page: Page) => void }> = ({ icon: Icon, title, description, page, isVision = false, onNavigate }) => (
    <button onClick={() => onNavigate(page)} className={`bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl ring-1 ${isVision ? 'ring-purple-500/30' : 'ring-white/10'} text-left h-full flex flex-col hover:bg-slate-800 transition-all transform hover:-translate-y-1 shadow-2xl relative group overflow-hidden`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ring-1 mb-6 transition-all ${isVision ? 'bg-purple-500/10 ring-purple-500/20 group-hover:scale-110' : 'bg-amber-500/10 ring-amber-500/20 group-hover:scale-110'}`}>
            <Icon className={`w-7 h-7 ${isVision ? 'text-purple-300' : 'text-amber-300'}`} />
        </div>
        <h3 className="text-xl font-bold text-white font-brand flex items-center justify-between">
            {title}
            {isVision && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full uppercase tracking-wider font-bold">Vision</span>}
        </h3>
        <p className="text-slate-400 mt-3 text-sm flex-grow leading-relaxed">{description}</p>
        <div className={`text-xs font-bold uppercase tracking-widest mt-8 flex items-center gap-2 ${isVision ? 'text-purple-400' : 'text-amber-400'}`}>
            Explore <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1"/>
        </div>
    </button>
);


const LegacyDashboard: React.FC<{ 
    onNavigate: (page: Page) => void; 
    profilePic: string | null; 
    userName: string;
    moments: Moment[];
    journeys: Journey[];
    onSelectMoment: (moment: Moment) => void;
    deletingMomentId?: number | null;
}> = ({ onNavigate, profilePic, userName, moments, journeys, onSelectMoment, deletingMomentId }) => {
    
    const legacyMoments = moments.filter(m => m.isLegacy);
    const legacyJourneys = journeys.filter(j => j.isLegacy);
    const [heroImage, setHeroImage] = useState<string | null>(null);

    useEffect(() => {
        const loadHero = async () => {
            const images = await fetchPexelsImages('ancient library golden hour', 1, 'landscape');
            if(images.length > 0) setHeroImage(images[0].src.large2x);
        };
        loadHero();
    }, []);

    return (
        <div className="relative min-h-screen w-full bg-slate-900">
             {/* Hero Section - Matching HomePage Style */}
            <div className={`relative min-h-screen w-full flex flex-col justify-start text-center text-white overflow-hidden -mt-20 pt-40 pb-96 transition-all duration-500`}>
                {heroImage && (
                     <div className="absolute inset-0 w-full h-full">
                        <div className="w-full h-full bg-cover bg-center animate-ken-burns-landing-1" style={{ backgroundImage: `url(${heroImage})` }} />
                    </div>
                )}
                
                <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-slate-900/90 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-amber-950/30 pointer-events-none mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[800px] bg-gradient-to-t from-slate-900 from-10% via-slate-900/80 via-40% to-transparent pointer-events-none"></div>

                <div className="relative z-10 p-6 animate-fade-in-up max-w-4xl mx-auto">
                    <div className="flex justify-center mb-6">
                         <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center ring-1 ring-amber-500/40 backdrop-blur-sm">
                            <LegacyIcon className="w-10 h-10 text-amber-300" />
                        </div>
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-bold text-white leading-tight mb-6 font-brand drop-shadow-lg" style={{textShadow: '0 4px 20px rgba(0,0,0,0.5)'}}>
                        The Lægacy Space
                    </h1>
                    <p className="text-lg sm:text-xl text-amber-100/80 max-w-2xl mx-auto mb-10 font-light drop-shadow-md">
                        Welcome to your sanctuary, {userName}. A timeless vault to curate, preserve, and safeguard your story for generations to come.
                    </p>
                </div>

                {/* Minimalist Image Info Overlay */}
                <div className="absolute bottom-56 w-full z-20 flex justify-center pointer-events-none">
                    <div className="animate-fade-in-up flex items-center justify-center gap-4 sm:gap-6 px-6 pointer-events-auto">
                        <h2 className="text-sm font-bold font-brand text-white drop-shadow-lg tracking-widest uppercase whitespace-nowrap">
                            Timeless Archives
                        </h2>
                        <span className="h-px w-8 bg-white/40 hidden md:block"></span>
                        <p className="text-sm text-slate-200 font-medium drop-shadow-md hidden lg:block whitespace-nowrap opacity-90">
                            Your personal museum of memories
                        </p>
                        <span className="h-px w-8 bg-white/40 hidden lg:block"></span>
                        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-white/90 drop-shadow-md whitespace-nowrap hidden sm:flex">
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            <span>Successor: Jane Doe</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid - Hanging Overlap */}
            <div className="relative z-20 -mt-48 pb-24 container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                    <DashboardCard icon={ShieldCheck} title="Legacy Trust" description="Appoint stewards and manage your succession protocol to ensure your story endures." page={Page.LegacyTrust} onNavigate={onNavigate} />
                    <DashboardCard icon={Clock} title="Time Capsules" description="Create time-locked messages and legacy letters for the future." page={Page.TimeCapsule} onNavigate={onNavigate} />
                    <DashboardCard icon={Mic} title="The Biografær" description="Engage in AI-guided interviews to build a rich, comprehensive life story." page={Page.Biografer} onNavigate={onNavigate} />
                    <DashboardCard icon={BookOpen} title="Creation Suite" description="Design and order physical magazines and photobooks from your moments." page={Page.Shop} onNavigate={onNavigate} />
                </div>

                {legacyMoments.length > 0 && (
                    <section className="mt-24">
                        <div className="flex items-center gap-4 mb-8">
                             <div className="h-px flex-grow bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                             <h2 className="text-3xl font-bold font-brand text-white">Your Lægacy Collection</h2>
                             <div className="h-px flex-grow bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </div>
                        <GridView 
                            moments={legacyMoments}
                            onSelectMoment={onSelectMoment}
                            onPinToggle={() => {}} 
                            onShare={() => {}}
                            onNavigate={onNavigate}
                            deletingMomentId={deletingMomentId}
                            zoomLevel={2}
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

    const handleUpgrade = () => onNavigate(Page.Subscription);

    return (
        <div className="bg-slate-900 text-white animate-fade-in-up -mt-20">
            {/* Hero Section - Locked State */}
            <section className="relative h-screen flex items-center justify-center text-center overflow-hidden pt-20">
                <img src="https://images.pexels.com/photos/1766838/pexels-photo-1766838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Constellations of moments in a starry sky" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                <div className="relative z-10 p-6">
                    <div className="mb-8">
                        <LegacyIcon className="w-16 h-16 mx-auto text-amber-300" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-brand text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>Preserve Your Story for Generations.</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4 mb-8" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}>
                        Welcome to the Lægacy Space — where your memories live beyond time, secured in a private digital vault and woven into a timeless narrative for those who follow.
                    </p>
                    <button onClick={handleUpgrade} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20">
                        Explore Lægacy Space
                    </button>
                </div>
            </section>

            {/* Core Feature Sections */}
            <section className="py-20 md:py-32 bg-slate-900">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        <Feature
                            icon={Lock}
                            title="Lægacy Vault"
                            description="A secure, encrypted repository for your life's story, safeguarded beyond a lifetime with advanced access controls (1 TB - 5 TB tiers)."
                        />
                        <Feature
                            icon={Clock}
                            title="Time Capsules"
                            description="Schedule momænts or journæys to unlock at specific future dates. Your story, shared when the time is right."
                        />
                        <Feature
                            icon={Mic}
                            title="The Biografær"
                            description="Engage in empathic AI interview sessions that are woven into a coherent life biography, told in your own voice."
                        />
                        <Feature
                            icon={BookOpen}
                            title="Creation Suite"
                            description="Transform your digital story into tangible heirlooms like museum-quality photobooks, magazines, and daily journals."
                        />
                    </div>
                </div>
            </section>
            
            {/* Emotional Story Block */}
            <section className="relative py-32 md:py-40 text-center bg-black">
                <img src="https://images.pexels.com/photos/3184406/pexels-photo-3184406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Hands holding old photographs" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <p className="text-3xl md:text-4xl font-brand text-white italic leading-relaxed">
                        “We live twice — once in life, and once in memory.”
                    </p>
                </div>
            </section>

             {/* Detailed Features */}
            <section className="py-20 md:py-32 bg-gray-900/50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                         <h2 className="text-4xl font-bold font-brand text-white">The Complete Lægacy Experience</h2>
                         <p className="text-slate-400 mt-2">Includes everything in Fæmily, plus the entire suite of preservation tools.</p>
                    </div>
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div className="flex gap-4"><Users className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" /><div><h4 className="font-bold text-white text-lg">Family Tree & Trust</h4><p className="text-slate-400 mt-1">Connect generations with roles (Owner, Steward, Guest). Invite family to collaborate, comment, and inherit access.</p></div></div>
                        <div className="flex gap-4"><Wand2 className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" /><div><h4 className="font-bold text-white text-lg">æterny Curation</h4><p className="text-slate-400 mt-1">AI-driven empathy mode refines your archives, merging overlapping memories and generating beautifully written retrospectives.</p></div></div>
                        <div className="flex gap-4"><BookImage className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" /><div><h4 className="font-bold text-white text-lg">Magæzine & Photobook</h4><p className="text-slate-400 mt-1">Physical and digital extensions of your story, including quarterly digests and handcrafted hardcover books.</p></div></div>
                        <div className="flex gap-4"><Headset className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" /><div><h4 className="font-bold text-white text-lg">Curation Concierge</h4><p className="text-slate-400 mt-1">Receive personalized assistance and priority support from our team to help you curate and organize your family's archive.</p></div></div>
                    </div>
                </div>
            </section>


            {/* Upgrade CTA */}
            <section className="py-20 md:py-32 bg-slate-900">
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <h2 className="text-4xl font-bold font-brand text-white">Start Your Lægacy Today.</h2>
                     <p className="text-5xl font-brand font-bold text-white mt-4">€49 <span className="text-xl text-slate-400 font-normal">/ month</span></p>
                    <p className="text-slate-300 mt-4">Includes Vault (1 TB), unlimited Biografær sessions, and the complete creation suite. Your story deserves to be eternal.</p>
                    <button onClick={handleUpgrade} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20 mt-8">
                        Upgrade to Lægacy
                    </button>
                    <p className="text-sm text-slate-500 mt-4">Because stories outlive us.</p>
                </div>
            </section>
        </div>
    );
};

export default LegacySpacePage;
