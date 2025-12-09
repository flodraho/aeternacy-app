
import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { ArrowLeft, Users, GitMerge, UserPlus, Sparkles, GitBranch, MessageSquare, BookCopy, ShieldCheck, Layers, Star, Smartphone, Mic, Palette, ArrowDown, PlayCircle, BrainCircuit } from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';

interface FamilyPlanPageProps {
  onNavigate: (page: Page) => void;
}

const FeatureCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <div className="bg-slate-800/50 p-6 rounded-2xl ring-1 ring-white/10 flex flex-col items-start text-left h-full">
    <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-cyan-300" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm flex-grow">{description}</p>
  </div>
);

const FamilyPlanPage: React.FC<FamilyPlanPageProps> = ({ onNavigate }) => {
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        const loadImages = async () => {
            const [heroImg, timelineImg, collabImg, storylineDemoImg] = await Promise.all([
                fetchPexelsImages('happy multi-generational family outdoors', 1, 'landscape'),
                fetchPexelsImages('family looking at photo album together', 1, 'landscape'),
                fetchPexelsImages('family cooking together in kitchen', 1, 'landscape'),
                fetchPexelsImages('family using tablet together indoors', 1, 'landscape'),
            ]);
            setImages([
                heroImg[0]?.src.large2x || 'https://picsum.photos/seed/famhero/1920/1080',
                timelineImg[0]?.src.large2x || 'https://picsum.photos/seed/famtimeline/800/600',
                collabImg[0]?.src.large2x || 'https://picsum.photos/seed/famcollab/800/600',
                storylineDemoImg[0]?.src.large2x || 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
            ]);
        };
        loadImages();
    }, []);

    return (
        <div className="animate-fade-in-up">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center text-white text-center overflow-hidden">
                <div className="absolute inset-0 bg-black">
                    {images[0] && <img src={images[0]} alt="Happy family" className="w-full h-full object-cover opacity-40" />}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                <div className="relative z-10 p-6">
                    <button onClick={() => onNavigate(Page.Profile)} className="absolute top-[-4rem] left-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Settings
                    </button>
                    <h1 className="text-5xl md:text-7xl font-bold font-brand" style={{textShadow: '0 2px 15px rgba(0,0,0,0.5)'}}>Your Family's Story, Woven Together.</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4 mb-8" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
                        Upgrade to the Fæmily Plan and transform individual memories into a shared legacy. Collaborate, connect, and preserve your collective story for generations to come.
                    </p>
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20">
                        Upgrade to Fæmily - €14.99/month
                    </button>
                </div>
            </section>

            <div className="container mx-auto px-6 py-16">
                {/* Features Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white font-brand">One Subscription, a Lifetime of Shared Memories</h2>
                    <p className="text-slate-400 mt-2 max-w-2xl mx-auto">The Fæmily Plan includes everything in Essæntial for up to 10 members, plus these exclusive features:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard 
                        icon={Layers}
                        title="Contribute to Shared Momænts"
                        description="Multiple family members can add their own photos, video clips, and captions to a single story, creating a richer, multi-perspective memory."
                    />
                     <FeatureCard 
                        icon={GitMerge} 
                        title="The Fæmily Storyline" 
                        description="æterny's AI automatically weaves a beautiful, chronological timeline of your family's biggest events and everyday moments from everyone's contributions."
                    />
                    <FeatureCard 
                        icon={UserPlus} 
                        title="Invite Your Inner Circle" 
                        description="Bring up to 10 family members into your private space. Assign roles and permissions to manage who can add, edit, and view your shared history."
                    />
                    <FeatureCard 
                        icon={Sparkles}
                        title="Intelligent Curation"
                        description="æterny acts as your family's archivist, detecting overlapping events, merging similar moments, and identifying shared locations to keep your storyline seamless."
                    />
                    <FeatureCard 
                        icon={GitBranch}
                        title="Organize with Memory Circles"
                        description="Create circles for different branches of your family—like 'Grandparents' or 'The Kids'—to easily view and curate stories from specific groups."
                    />
                    <FeatureCard 
                        icon={MessageSquare}
                        title="Meaningful Interactions"
                        description="Leave comments and reactions on shared moments. It's a space for emotional connection and storytelling, not social media noise."
                    />
                     <FeatureCard 
                        icon={BookCopy}
                        title="Create Collaborative Albums"
                        description="Export your favorite shared moments into beautifully designed digital magazines or printable photobooks—a tangible piece of your collective legacy."
                    />
                    <FeatureCard 
                        icon={ShieldCheck}
                        title="Private by Design"
                        description="Each family member maintains full control over their own moments. Decide what to share with the family and what to keep in your personal timestream."
                    />
                </div>

                {/* Fæmily Storyline Section */}
                <section id="familystoryline-section" className="py-20 md:py-32">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-white font-brand">How Fæmily Storyline Works</h2>
                            <p className="text-lg md:text-xl text-slate-300 mt-4">
                                Unlike shared albums, Fæmily Storyline uses AI to merge everyone's perspective into one cohesive story—while preserving each person's unique voice.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                            
                            {/* Visual Diagram */}
                            <div className="lg:col-span-3">
                                <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 text-center">
                                    {/* Inputs */}
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-slate-800/50 p-4 rounded-lg h-full ring-1 ring-white/5">
                                            <Smartphone className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                            <h4 className="font-semibold text-white text-sm">Mom uploads photos</h4>
                                            <p className="text-xs text-slate-400">from her phone</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-slate-800/50 p-4 rounded-lg h-full ring-1 ring-white/5">
                                            <Mic className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                            <h4 className="font-semibold text-white text-sm">Dad adds voice memories</h4>
                                            <p className="text-xs text-slate-400">sharing context</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-slate-800/50 p-4 rounded-lg h-full ring-1 ring-white/5">
                                            <Palette className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                            <h4 className="font-semibold text-white text-sm">Kids contribute drawings</h4>
                                            <p className="text-xs text-slate-400">adding creativity</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center my-6">
                                    <ArrowDown className="w-8 h-8 text-slate-600" />
                                </div>
                                
                                {/* AI Processing */}
                                <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/60 p-6 rounded-2xl ring-1 ring-indigo-400/30 flex items-center gap-6">
                                    <BrainCircuit className="w-12 h-12 text-indigo-300 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold text-white">AI Weaves a Collaborative Narrative</h3>
                                        <p className="text-slate-300 text-sm">æterny analyzes content, emotion, and context from every contribution to build a single, unified story.</p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-center my-6">
                                    <ArrowDown className="w-8 h-8 text-slate-600" />
                                </div>

                                {/* Output */}
                                <div className="bg-slate-800/50 p-6 rounded-2xl ring-1 ring-white/10 flex items-center gap-6">
                                    <Users className="w-12 h-12 text-indigo-400 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Everyone Gets a Personalized Perspective</h3>
                                        <p className="text-slate-300 text-sm">Relive the shared story, or tap into an individual's view to see the moment through their eyes.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Video Demo */}
                            <div className="lg:col-span-2 flex items-center justify-center">
                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer ring-1 ring-white/10 shadow-2xl">
                                    {images[3] && <img src={images[3]} alt="Family collaborating on a story" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>}
                                    <div className="absolute inset-0 bg-black/40"></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <PlayCircle className="w-20 h-20 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" />
                                        <p className="mt-2 font-semibold text-white" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.7)' }}>Watch 2-min Demo</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Visual Feature Showcase */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-20 items-center">
                    <div className="text-left">
                        <h3 className="text-3xl font-bold text-white font-brand mb-4">See Your Story from Every Angle</h3>
                        <p className="text-slate-300 mb-6">
                            The Fæmily Storyline isn't just a collection of photos; it's a living document of your shared history. A wedding isn't just one story—it's the bride's, the groom's, the parents', the friends'. æternacy weaves them all together, creating a richer, more complete memory than ever before.
                        </p>
                        <div className="flex items-center -space-x-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-pink-500 ring-4 ring-slate-900 flex items-center justify-center font-bold text-white">JD</div>
                            <div className="w-12 h-12 rounded-full bg-sky-500 ring-4 ring-slate-900 flex items-center justify-center font-bold text-white">AD</div>
                            <div className="w-12 h-12 rounded-full bg-teal-500 ring-4 ring-slate-900 flex items-center justify-center font-bold text-white">MD</div>
                            <div className="w-12 h-12 rounded-full bg-slate-600 ring-4 ring-slate-900 flex items-center justify-center text-slate-300 text-xl font-light">+7</div>
                        </div>
                        <p className="text-slate-400">See who contributed to each moment and experience your history from multiple perspectives.</p>
                    </div>
                    <div className="w-full h-96 rounded-2xl overflow-hidden ring-1 ring-white/10">
                        {images[1] && <img src={images[1]} alt="Family looking at photos" className="w-full h-full object-cover" />}
                    </div>
                </div>

                {/* Testimonial Section */}
                <div className="mt-20 text-center max-w-3xl mx-auto">
                    <Star className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                    <blockquote className="text-2xl text-white italic">
                        "Using the Fæmily Plan has been a revelation. We've unearthed stories and photos we thought were lost, and my kids are now more connected to their grandparents' history than ever before. It's more than an app; it's our family's heart."
                    </blockquote>
                    <p className="text-slate-400 mt-4">- The Chen Family</p>
                </div>

                {/* Final CTA */}
                <div className="mt-20 text-center bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-12">
                    <h2 className="text-3xl font-bold font-brand text-white">Ready to Build Your Shared Legacy?</h2>
                    <p className="text-slate-300 max-w-xl mx-auto my-4">
                        Start your 30-day free trial on the Essæntial plan and upgrade to the Fæmily plan at any time.
                    </p>
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                        Start Your Free Trial Today
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FamilyPlanPage;
