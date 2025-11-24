
import React, { useState, useEffect, useMemo } from 'react';
import { Page, Moment, ActiveRitual } from '../types';
import { fetchPexelsImages } from '../services/pexelsService';
import { ArrowRight, MessageSquare, BookText, Heart, PlusCircle, LayoutGrid, Mic, CalendarClock, UploadCloud } from 'lucide-react';
import AeternyAvatarDisplay from './AeternyAvatarDisplay';
import ChevronDoubleDownIcon from './icons/ChevronDoubleDownIcon';
import * as LucideIcons from 'lucide-react';
import CatchUpCard from './CatchUpCard';


const staticSampleBackgrounds: Moment[] = [
    { id: '-1', type: 'standard', image: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg', title: 'Path to Discovery', description: 'A wooden path winding through lush greenery, inviting you to explore.', date: '', pinned: false, aiTier: null },
    { id: '-2', type: 'standard', image: 'https://images.pexels.com/photos/1528660/pexels-photo-1528660.jpeg', title: 'Sunlight Through the Trees', description: 'Golden sunbeams pierce through a majestic forest.', date: '', pinned: false, aiTier: null },
    { id: '-3', type: 'standard', image: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg', title: 'Celestial Wonder', description: 'The aurora borealis dances across a starry sky.', date: '', pinned: false, aiTier: null },
    { id: '-4', type: 'standard', image: 'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg', title: 'Mountain Majesty', description: 'Snow-capped peaks stand tall against a clear sky.', date: '', pinned: false, aiTier: null },
    { id: '-5', type: 'standard', image: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg', title: 'Ocean\'s Embrace', description: 'Gentle waves meet the shore at sunset.', date: '', pinned: false, aiTier: null }
];

interface HomePageProps {
  onNavigate: (page: Page) => void;
  userName: string;
  moments: Moment[];
  onSelectMoment: (moment: Moment) => void;
  activeRituals: ActiveRitual[];
  onSelectRitual: (ritual: ActiveRitual) => void;
}

const PromptCard: React.FC<{ icon: React.ElementType, title: string; description: string; onClick: () => void }> = ({ icon: Icon, title, description, onClick }) => (
    <button onClick={onClick} className="bg-slate-800/50 p-6 rounded-2xl ring-1 ring-white/10 text-left h-full flex flex-col hover:bg-slate-700/50 hover:ring-cyan-500/30 transition-all transform hover:-translate-y-1">
        <Icon className="w-8 h-8 text-cyan-400 mb-3" />
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400 mt-1 flex-grow">{description}</p>
        <p className="text-sm font-semibold text-cyan-400 mt-4 self-start">Let's Create <ArrowRight className="inline w-4 h-4" /></p>
    </button>
);


const HomePage: React.FC<HomePageProps> = ({ onNavigate, userName, moments, onSelectMoment, activeRituals, onSelectRitual }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [catchUpSuggestion, setCatchUpSuggestion] = useState<{
        type: 'ritual' | 'bulk';
        title: string;
        description: string;
        buttonText: string;
        icon: React.ElementType;
        action: () => void;
    } | null>(null);

    useEffect(() => {
        const suggestionShown = sessionStorage.getItem('catchUpSuggestionShown');
        if (suggestionShown) return;

        // Suggestion 1: Contribute to weekly ritual
        const weeklyRitual = activeRituals.find(r => r.frequency === 'Weekly');
        if (weeklyRitual) {
            setCatchUpSuggestion({
                type: 'ritual',
                title: `Your "${weeklyRitual.title}" Ritual Awaits`,
                description: "It's time to add this week's contribution. Keep your family tradition alive!",
                buttonText: 'Add Contribution',
                icon: CalendarClock,
                action: () => onSelectRitual(weeklyRitual)
            });
            return;
        }

        // Suggestion 2: Bulk upload after inactivity
        // FIX: moment.id is a string, parse it to a number for comparison and filtering.
        const personalMoments = moments.filter(m => !isNaN(parseInt(m.id)) && parseInt(m.id) > 0);
        if (personalMoments.length > 0) {
            const lastMomentDate = new Date(personalMoments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date);
            const daysSinceLastMoment = (new Date().getTime() - lastMomentDate.getTime()) / (1000 * 3600 * 24);

            if (daysSinceLastMoment > 30) {
                 setCatchUpSuggestion({
                    type: 'bulk',
                    title: "It's been a while!",
                    description: "Let's catch up. Use the Bulk Upload to easily add memories from the past month.",
                    buttonText: 'Bulk Upload Photos',
                    icon: UploadCloud,
                    action: () => onNavigate(Page.BulkUpload)
                });
                return;
            }
        }
    }, [moments, activeRituals, onNavigate, onSelectRitual]);

    const handleDismissCatchUp = () => {
        setCatchUpSuggestion(null);
        sessionStorage.setItem('catchUpSuggestionShown', 'true');
    };

    const slideshowMoments = useMemo(() => {
        const userMomentsWithImages = moments.filter(m => m.image || (m.images && m.images.length > 0));
        if (userMomentsWithImages.length > 0) {
            return userMomentsWithImages;
        }
        return staticSampleBackgrounds;
    }, [moments]);

    useEffect(() => {
        if (slideshowMoments.length === 0) return;
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slideshowMoments.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(timer);
    }, [slideshowMoments]);

    const currentMoment = slideshowMoments[currentImageIndex];

    const kenBurnsAnimations = [
        'animate-ken-burns-home-1',
        'animate-ken-burns-home-2',
        'animate-ken-burns-home-3',
        'animate-ken-burns-home-4',
    ];
    
    const handleScrollDown = () => {
        document.getElementById('suggestions-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <section className="relative h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden">
                <style>
                    {`
                    @keyframes ken-burns-home-1 { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.1) translate(-2%, -2%); } }
                    .animate-ken-burns-home-1 { animation: ken-burns-home-1 25s ease-in-out infinite alternate; }
                    @keyframes ken-burns-home-2 { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.1) translate(2%, 2%); } }
                    .animate-ken-burns-home-2 { animation: ken-burns-home-2 25s ease-in-out infinite alternate; }
                    @keyframes ken-burns-home-3 { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.1) translate(-2%, 2%); } }
                    .animate-ken-burns-home-3 { animation: ken-burns-home-3 25s ease-in-out infinite alternate; }
                    @keyframes ken-burns-home-4 { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.1) translate(2%, -2%); } }
                    .animate-ken-burns-home-4 { animation: ken-burns-home-4 25s ease-in-out infinite alternate; }
                    `}
                </style>
                {slideshowMoments.map((moment, index) => {
                    const animationClass = kenBurnsAnimations[index % kenBurnsAnimations.length];
                    const image = moment.image || moment.images?.[0];
                    return (
                        <div
                            key={moment.id}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <div
                                className={`w-full h-full bg-cover bg-center ${index === currentImageIndex ? animationClass : ''}`}
                                style={{ backgroundImage: `url(${image})` }}
                            />
                        </div>
                    );
                })}
                <div className="absolute inset-0 bg-slate-900/70"></div>

                <div className="relative z-10 p-6 w-full max-w-5xl mx-auto text-center animate-fade-in-up">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white text-center font-brand">
                        Welcome back, {userName}.
                    </h1>
                    <p className="text-base sm:text-lg text-slate-300 text-center max-w-2xl mx-auto my-4">
                        Let's continue building your timestream. Where should we begin?
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-10">
                        <button onClick={() => onNavigate(Page.Record)} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20 w-full sm:w-auto">
                             <Mic className="w-6 h-6 inline-block mr-2 -mt-1" />
                            <span>Capture a Moment</span>
                        </button>
                        <button onClick={() => onNavigate(Page.Create)} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 w-full sm:w-auto">
                            <PlusCircle className="w-6 h-6 inline-block mr-2 -mt-1" />
                            Create a Momænt
                        </button>
                        <button onClick={() => onNavigate(Page.Moments)} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 w-full sm:w-auto">
                            <LayoutGrid className="w-6 h-6 inline-block mr-2 -mt-1" />
                            View Collection
                        </button>
                    </div>
                </div>
                 <div className="absolute bottom-10 left-10 z-10 text-left text-white max-w-sm">
                    <div key={currentMoment.id} className="animate-fade-in-up">
                        <h2 className="text-lg font-bold font-brand" style={{textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>{currentMoment.title}</h2>
                        {/* FIX: moment.id is a string, parse to check if it's a real moment vs a teaser. */}
                        {(!isNaN(parseInt(currentMoment.id)) && parseInt(currentMoment.id) > 0) && <p className="text-xs text-slate-300 mt-1" style={{textShadow: '0 1px 4px rgba(0,0,0,0.7)'}}>{currentMoment.date}</p>}
                    </div>
                </div>

                <button onClick={handleScrollDown} className="absolute bottom-10 z-10 animate-bounce">
                    <ChevronDoubleDownIcon className="w-8 h-8 text-white/50" />
                </button>
            </section>

            <section id="suggestions-section" className="container mx-auto px-6 py-16">
                {catchUpSuggestion && (
                    <div className="mb-12">
                        <CatchUpCard 
                            icon={catchUpSuggestion.icon}
                            title={catchUpSuggestion.title}
                            description={catchUpSuggestion.description}
                            buttonText={catchUpSuggestion.buttonText}
                            onButtonClick={catchUpSuggestion.action}
                            onDismiss={handleDismissCatchUp}
                        />
                    </div>
                )}
                
                <h2 className="text-3xl font-bold font-brand text-white mb-6">What's Next?</h2>
                <div className="flex justify-center">
                    <div className="w-full max-w-md">
                        <PromptCard icon={UploadCloud} title="Upload a Memory" description="Have photos or videos ready? Craft a story around them." onClick={() => onNavigate(Page.Create)} />
                    </div>
                </div>
                
                {activeRituals.length > 0 && (
                     <>
                        <h2 className="text-3xl font-bold font-brand text-white mt-16 mb-6">Our Shared Traditions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {activeRituals.map(ritual => {
                                const latestContribution = moments
                                    .filter(m => m.ritualId === ritual.id)
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                                const Icon = (LucideIcons as any)[ritual.iconName] || LucideIcons.CalendarClock;

                                return (
                                    <button key={ritual.id} onClick={() => onSelectRitual(ritual)} className="bg-slate-800/50 rounded-2xl ring-1 ring-white/10 text-left h-full flex flex-col hover:bg-slate-700/50 hover:ring-indigo-500/30 transition-all transform hover:-translate-y-1 overflow-hidden group">
                                        <div className="relative h-40 bg-slate-700">
                                            {latestContribution?.image ? (
                                                <img src={latestContribution.image} alt="Latest contribution" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Icon className="w-12 h-12 text-slate-500" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4">
                                                <h3 className="font-bold text-white text-lg">{ritual.title}</h3>
                                                <p className="text-xs text-slate-300">{ritual.frequency}</p>
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            {latestContribution ? (
                                                <>
                                                    <p className="text-xs text-slate-400 font-semibold">LATEST STORY BY {latestContribution.createdBy || 'Family'}</p>
                                                    <p className="text-sm text-slate-300 mt-2 flex-grow line-clamp-2">"{latestContribution.description}"</p>
                                                </>
                                            ) : (
                                                <p className="text-sm text-slate-400 flex-grow">No contributions yet for this cycle. Be the first to add a memory!</p>
                                            )}
                                            <div className="mt-4">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="text-xs font-semibold text-slate-400">Progress</span>
                                                    <span className="text-sm font-bold text-white">{ritual.progress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${ritual.progress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default HomePage;
