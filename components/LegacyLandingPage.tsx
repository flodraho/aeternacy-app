

import React from 'react';
import { Page, UserTier } from '../types';
import { ArrowLeft, Lock, Clock, Mic, BookOpen, ShieldCheck, Users, Wand2, BookImage, Film, Headset } from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';


const Feature: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center ring-1 ring-amber-500/20 mb-4">
            <Icon className="w-8 h-8 text-amber-300" />
        </div>
        <h3 className="text-xl font-bold text-white font-brand">{title}</h3>
        <p className="text-slate-400 mt-2 text-sm max-w-xs">{description}</p>
    </div>
);

interface LegacyLandingPageProps {
  onNavigate: (page: Page) => void;
}

const LegacyLandingPage: React.FC<LegacyLandingPageProps> = ({ onNavigate }) => {

    const handleUpgrade = () => onNavigate(Page.Subscription);

    return (
        <div className="bg-slate-900 text-white animate-fade-in-up">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
                <img src="https://images.pexels.com/photos/1766838/pexels-photo-1766838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Constellations of moments in a starry sky" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                <div className="relative z-10 p-6">
                    <div className="mb-8">
                        <LegacyIcon className="w-16 h-16 mx-auto text-amber-300" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-brand text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>Preserve Your Story for Generations.</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4 mb-8" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}>
                        Welcome to the Lægacy Studio — where your memories live beyond time, secured in a private digital vault and woven into a timeless narrative for those who follow.
                    </p>
                    <button onClick={handleUpgrade} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20">
                        Explore Lægacy Studio
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
                            description="Unlock the ability to purchase tangible heirlooms like museum-quality photobooks, magazines, and journals."
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
                    <p className="text-slate-300 mt-4">Includes Vault (1 TB), unlimited Biografær sessions, and exclusive access to the Creation Suite. Your story deserves to be eternal.</p>
                    <button onClick={handleUpgrade} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20 mt-8">
                        Upgrade to Lægacy
                    </button>
                    <p className="text-sm text-slate-500 mt-4">Because stories outlive us.</p>
                </div>
            </section>
        </div>
    );
};

export default LegacyLandingPage;