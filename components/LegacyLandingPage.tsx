

import React from 'react';
import { Page } from '../types';
import { Lock, Clock, Mic, BookOpen, ShieldCheck } from 'lucide-react';
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
        <div className="bg-slate-900 text-white animate-fade-in-up -mt-20">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center text-center overflow-hidden pt-20">
                <img src="https://images.pexels.com/photos/1766838/pexels-photo-1766838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Constellations of moments in a starry sky" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                <div className="relative z-10 p-6">
                    <div className="mb-8">
                        <LegacyIcon className="w-16 h-16 mx-auto text-amber-300" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-brand text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>Preserve Your Story for Generations.</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4 mb-8" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}>
                        This is a Lægacy feature, where your memories live beyond time, secured in a private digital vault and woven into a timeless narrative for those who follow.
                    </p>
                    <button onClick={handleUpgrade} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20">
                        Upgrade to Lægacy
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
                            description="A secure, encrypted repository for your life's story, safeguarded beyond a lifetime with advanced access controls."
                        />
                        <Feature
                            icon={ShieldCheck}
                            title="Digital Inheritance"
                            description="Appoint trusted Stewards with legally-recognized agreements to manage your account and pass on your legacy."
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
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LegacyLandingPage;
