import React from 'react';
import { Page } from '../types';
import { ArrowLeft, Box, BrainCircuit, Scan, Sparkles, Users } from 'lucide-react';

interface HypermemoryPageProps {
  onNavigate: (page: Page) => void;
}

const FeatureCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center ring-1 ring-purple-500/20 mb-4">
            <Icon className="w-8 h-8 text-purple-300" />
        </div>
        <h3 className="text-xl font-bold text-white font-brand">{title}</h3>
        <p className="text-slate-400 mt-2 text-sm max-w-xs">{description}</p>
    </div>
);

const HypermemoryPage: React.FC<HypermemoryPageProps> = ({ onNavigate }) => {
    return (
        <div className="bg-slate-900 text-white animate-fade-in-up -mt-20">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center text-center overflow-hidden pt-20">
                <img src="https://images.pexels.com/photos/5083491/pexels-photo-5083491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Person immersed in a VR experience" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-purple-900/40 to-transparent"></div>
                <div className="relative z-10 p-6">
                    <h1 className="text-5xl md:text-7xl font-bold font-brand text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>The Hypermemory Lab</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4 mb-8" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}>
                        Where memories become worlds. Go beyond remembering — step back in time and relive your most cherished moments in hyper-realistic VR & AR.
                    </p>
                    <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20">
                        Request a Consultation
                    </button>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 md:py-32 bg-slate-900">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <h2 className="text-4xl font-bold font-brand text-white mb-12">From Memory to Reality: The Process</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold font-brand text-purple-400 mb-2">1. Capture</div>
                            <h3 className="text-xl font-bold text-white mb-2">The Digital Twin</h3>
                            <p className="text-slate-400 text-sm">Using advanced 3D scanning and photogrammetry, we capture every detail of a cherished space, person, or even a beloved pet.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold font-brand text-purple-400 mb-2">2. Reconstruct</div>
                            <h3 className="text-xl font-bold text-white mb-2">The AI Architect</h3>
                            <p className="text-slate-400 text-sm">Our AI, using technologies like Gaussian Splatting, meticulously reconstructs the scans into a photo-realistic, interactive digital environment.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold font-brand text-purple-400 mb-2">3. Relive</div>
                            <h3 className="text-xl font-bold text-white mb-2">The Immersive Experience</h3>
                            <p className="text-slate-400 text-sm">Step into your hypermemory with VR/AR devices. Walk through your childhood home, or have a conversation with a loved one's Living Avatar.</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Living Avatars Section */}
            <section className="py-20 md:py-32 bg-gray-900/50">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold font-brand text-white">Living Avatars</h2>
                            <p className="text-slate-300 mt-4 text-lg">The heart of the Hypermemory Lab is the ability to create hyper-realistic digital avatars of the people who matter most. By combining 3D scans with recorded voice and AI, we can create an interactive presence that allows you to share a space and converse with them again.</p>
                            <p className="text-slate-400 mt-4">This sensitive process, handled with the utmost care and respect, offers a profound way to preserve the essence of a loved one, including those who have passed on, or even immortalize the spirit of a cherished family pet.</p>
                        </div>
                        <div className="relative aspect-square w-full max-w-md mx-auto">
                            <img src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Artistic representation of a digital human avatar" className="w-full h-full object-cover rounded-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Quote / Emotional Block */}
            <section className="relative py-32 md:py-40 text-center bg-black">
                <div className="absolute inset-0 w-full h-full bg-grid-purple-500/[0.05]"></div>
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <p className="text-3xl md:text-4xl font-brand text-white italic leading-relaxed">
                        “What if a photograph was no longer a window, but a door?”
                    </p>
                </div>
            </section>

            {/* Exclusive CTA */}
            <section className="py-20 md:py-32 bg-slate-900">
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <h2 className="text-4xl font-bold font-brand text-white">A Lægacy Exclusive Service</h2>
                    <p className="text-slate-300 mt-4">The Hypermemory Lab represents the pinnacle of personal preservation. This is a high-touch, bespoke service available exclusively for our Lægacy members, requiring a personal consultation to begin the delicate process of digital immortalization.</p>
                    <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20 mt-8">
                        Request a Private Consultation
                    </button>
                    <p className="text-sm text-slate-500 mt-4">Because some stories deserve to be lived more than once.</p>
                </div>
            </section>
        </div>
    );
};

export default HypermemoryPage;