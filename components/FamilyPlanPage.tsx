import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { ArrowLeft, Users, GitMerge, UserPlus, Sparkles, GitBranch, MessageSquare, BookCopy, ShieldCheck, Layers, Star, Smartphone, Mic, Palette, ArrowDown, PlayCircle, BrainCircuit, Heart } from 'lucide-react';
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
    const [images, setImages] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadImages = async () => {
            const [heroImg, storylineDemoImg, testimonial1, testimonial2, testimonial3] = await Promise.all([
                fetchPexelsImages('happy multi-generational family outdoors laughing', 1, 'landscape'),
                fetchPexelsImages('family using tablet together indoors cozy', 1, 'landscape'),
                fetchPexelsImages('grandparent reading to grandchild', 1, 'portrait'),
                fetchPexelsImages('family laughing at dinner table candid', 1, 'portrait'),
                fetchPexelsImages('father and son walking on beach sunset', 1, 'portrait'),
            ]);
            setImages({
                hero: heroImg[0]?.src.large2x || 'https://picsum.photos/seed/famhero/1920/1080',
                storylineDemo: storylineDemoImg[0]?.src.large2x || 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                testimonial1: testimonial1[0]?.src.large || 'https://picsum.photos/seed/test1/800/600',
                testimonial2: testimonial2[0]?.src.large || 'https://picsum.photos/seed/test2/800/600',
                testimonial3: testimonial3[0]?.src.large || 'https://picsum.photos/seed/test3/800/600',
            });
        };
        loadImages();
    }, []);

    const testimonials = [
        {
            quote: "My daughter uploaded a drawing of our holiday. Seeing it next to my photos and my husband's voice note from that day... I cried. It's a completely new way to remember.",
            author: "— Sarah K., Mom & Fæmily user",
            image: images.testimonial1,
        },
        {
            quote: "I live across the country from my grandkids. The Fæmily Storyline makes me feel like I'm right there with them, watching them grow. It's closed the distance.",
            author: "— David P., Grandfather & Fæmily user",
            image: images.testimonial2,
        },
        {
            quote: "My brother and I finally digitized all our old family photos. æternacy's AI found moments we'd forgotten and wove them into a story. It's like discovering our own history.",
            author: "— Michael B., Brother & Fæmily user",
            image: images.testimonial3,
        }
    ];

    return (
        <div className="animate-fade-in-up">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center text-white text-center overflow-hidden">
                <div className="absolute inset-0 bg-black">
                    {images.hero && <img src={images.hero} alt="Happy family" className="w-full h-full object-cover opacity-40" />}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                <div className="relative z-10 p-6">
                    <button onClick={() => onNavigate(Page.Profile)} className="absolute top-[-4rem] left-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Settings
                    </button>
                    <h1 className="text-5xl md:text-7xl font-bold font-brand" style={{textShadow: '0 2px 15px rgba(0,0,0,0.5)'}}>One Family, Infinite Stories.</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4 mb-8" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
                        Upgrade to the Fæmily Plan and transform individual memories into a shared legacy. Because a family's story is told in more than one voice.
                    </p>
                    <button onClick={() => onNavigate(Page.Subscription)} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20">
                        Upgrade to Fæmily
                    </button>
                </div>
            </section>

            <div className="container mx-auto px-6 py-16">
                 {/* Testimonial Section */}
                <section className="py-16">
                    <h2 className="text-4xl font-bold text-white font-brand text-center mb-12">Stories from our Fæmilies</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-slate-800/50 p-6 rounded-2xl ring-1 ring-white/10 flex flex-col">
                                <p className="text-slate-300 text-lg flex-grow italic">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                                    {testimonial.image && <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover" />}
                                    <div>
                                        <p className="font-bold text-white">{testimonial.author}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Fæmily Storyline Section */}
                <section id="familystoryline-section" className="py-20 md:py-32">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-white font-brand">One Moment, Many Perspectives</h2>
                            <p className="text-lg md:text-xl text-slate-300 mt-4">
                                The Fæmily Storyline doesn't just collect photos. It weaves everyone's unique experience—a photo, a voice note, a child's drawing—into a single, richer story.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                            
                            <div className="lg:col-span-3">
                                <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 text-center">
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-slate-800/50 p-4 rounded-lg h-full ring-1 ring-white/5"><Smartphone className="w-8 h-8 text-indigo-400 mx-auto mb-2" /><h4 className="font-semibold text-white text-sm">Your Perspective</h4><p className="text-xs text-slate-400">Photos of the perfect sunset.</p></div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-slate-800/50 p-4 rounded-lg h-full ring-1 ring-white/5"><Mic className="w-8 h-8 text-indigo-400 mx-auto mb-2" /><h4 className="font-semibold text-white text-sm">Their Voice</h4><p className="text-xs text-slate-400">A partner's heartfelt reflection.</p></div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-slate-800/50 p-4 rounded-lg h-full ring-1 ring-white/5"><Palette className="w-8 h-8 text-indigo-400 mx-auto mb-2" /><h4 className="font-semibold text-white text-sm">A Child's Eyes</h4><p className="text-xs text-slate-400">A drawing of a sandcastle.</p></div>
                                    </div>
                                </div>

                                <div className="flex justify-center my-6"><ArrowDown className="w-8 h-8 text-slate-600" /></div>
                                
                                <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/60 p-6 rounded-2xl ring-1 ring-indigo-400/30 flex items-center gap-6">
                                    <BrainCircuit className="w-12 h-12 text-indigo-300 flex-shrink-0" /><h3 className="text-xl font-bold text-white">æterny Weaves Your Story</h3>
                                </div>
                                
                                <div className="flex justify-center my-6"><ArrowDown className="w-8 h-8 text-slate-600" /></div>

                                <div className="bg-slate-800/50 p-6 rounded-2xl ring-1 ring-white/10 flex items-center gap-6">
                                    <Heart className="w-12 h-12 text-indigo-400 flex-shrink-0" /><h3 className="text-xl font-bold text-white">A Complete, Emotional Memory</h3>
                                </div>
                            </div>

                            <div className="lg:col-span-2 flex items-center justify-center">
                                <div onClick={() => alert("This would play a short, emotional video showing how different family contributions merge into a single beautiful slideshow.")} className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer ring-1 ring-white/10 shadow-2xl">
                                    {images.storylineDemo && <img src={images.storylineDemo} alt="Family collaborating on a story" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>}
                                    <div className="absolute inset-0 bg-black/40"></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center"><PlayCircle className="w-20 h-20 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" /><p className="mt-2 font-semibold text-white" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.7)' }}>See How It Feels</p></div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <div className="text-center pt-20">
                    <h2 className="text-4xl font-bold text-white font-brand">A Private Space for What Matters Most</h2>
                    <p className="text-slate-400 mt-2 max-w-2xl mx-auto">The Fæmily Plan includes everything in your current plan for up to 5 members, plus these exclusive features:</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                     <FeatureCard icon={Layers} title="Multi-Perspective Memories" description="See the same event through everyone's eyes. Combine photos, videos, and notes from multiple family members into a single, richer momænt."/>
                     <FeatureCard icon={GitMerge} title="A Living History" description="The Fæmily Storyline isn't a static timeline. It's an ever-evolving tapestry of your shared life, intelligently woven together by æterny."/>
                     <FeatureCard icon={UserPlus} title="Your Private Family Hub" description="Invite your inner circle (up to 5 members) to a secure, shared space. Bridge distances and connect generations without the noise of social media."/>
                     <FeatureCard icon={Sparkles} title="The Family Archivist" description="æterny finds connections you might have missed, suggesting moments to merge and themes to explore across everyone's contributions."/>
                     <FeatureCard icon={GitBranch} title="Circles of Connection" description="Create private 'circles' for different branches of your family—like 'Grandparents' or 'The Kids'—to share and view stories within smaller groups."/>
                     <FeatureCard icon={MessageSquare} title="Deeper Conversations" description="Leave comments and voice notes on shared memories, sparking meaningful conversations that become part of the memory itself."/>
                     <FeatureCard icon={BookCopy} title="Tangible Heirlooms" description="Collaborate on beautifully designed digital magazines or printable photobooks, turning your shared digital story into a physical legacy."/>
                     <FeatureCard icon={ShieldCheck} title="Sacred & Secure" description="Each member retains full control over their personal timestream, choosing what to share with the family and what to keep private."/>
                </div>

                {/* Final CTA */}
                <div className="mt-20 text-center bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-12">
                    <h2 className="text-3xl font-bold font-brand text-white">Start Weaving Your Family's Story Today</h2>
                    <p className="text-slate-300 max-w-xl mx-auto my-4">
                        Unlock a deeper connection and create a legacy that will be cherished for generations.
                    </p>
                    <button onClick={() => onNavigate(Page.Subscription)} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                        Upgrade to Fæmily
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FamilyPlanPage;
