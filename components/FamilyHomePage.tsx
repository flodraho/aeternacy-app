
import React, { useState, useEffect } from 'react';
import { Page, UserTier, Moment } from '../types';
import { Users, LayoutGrid, UserPlus, ArrowRight, GitMerge, Heart } from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';
import ChevronDoubleDownIcon from './icons/ChevronDoubleDownIcon';

// New static backgrounds for the family page
const staticFamilyBackgrounds = [
    { url: 'https://picsum.photos/seed/family1/1920/1080', title: 'Shared Laughter', description: 'Moments of joy that become the foundation of your family\'s story.', location: 'Home', people: ['Family'] },
    { url: 'https://picsum.photos/seed/family2/1920/1080', title: 'Generations Connected', description: 'The timeless bond that links the past, present, and future.', location: 'Reunion', people: ['Grandparents', 'Kids'] },
    { url: 'https://picsum.photos/seed/family3/1920/1080', title: 'Holiday Warmth', description: 'The cozy comfort of tradition and togetherness.', location: 'Cabin', people: ['Everyone'] },
    { url: 'https://picsum.photos/seed/family4/1920/1080', title: 'Outdoor Adventures', description: 'Exploring the world together, creating memories one step at a time.', location: 'National Park', people: ['Family'] },
    { url: 'https://picsum.photos/seed/family5/1920/1080', title: 'A Quiet Moment', description: 'In the simple, shared silence, the deepest connections are felt.', location: 'Living Room', people: ['Parents'] }
];

interface FamilyHomePageProps {
  onNavigate: (page: Page) => void;
  userTier: UserTier;
  moments: Moment[];
  onSelectMoment: (moment: Moment) => void;
}

const FamilyHomePage: React.FC<FamilyHomePageProps> = ({ onNavigate, userTier, moments, onSelectMoment }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [backgrounds, setBackgrounds] = useState(staticFamilyBackgrounds);

  useEffect(() => {
    const fetchImages = async () => {
        const bgPhotos = await fetchPexelsImages('happy family moment', 5, 'landscape');
        if (bgPhotos.length > 0) {
            setBackgrounds(bgPhotos.map((photo, index) => ({
                url: photo.src.large2x,
                title: staticFamilyBackgrounds[index]?.title || 'A beautiful moment',
                description: photo.alt || staticFamilyBackgrounds[index]?.description || '',
                location: 'Unknown Location',
                people: ['Family']
            })));
        }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (backgrounds.length === 0) return;
    const timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [backgrounds]);

  const handleInviteClick = () => {
    if (userTier === 'fæmily') {
      onNavigate(Page.Profile);
    } else {
      onNavigate(Page.LegacySpace);
    }
  };

  const sharedMoments = moments
    .filter(m => (m.createdBy && m.createdBy !== 'JD') || (m.collaborators && m.collaborators.length > 0))
    .slice(0, 4); // Show up to 4 recent moments

  const kenBurnsAnimations = [
    'animate-ken-burns-home-1',
    'animate-ken-burns-home-2',
    'animate-ken-burns-home-3',
    'animate-ken-burns-home-4',
  ];
  
  const handleScrollDown = () => {
    document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-slate-900 text-white -mt-20">
      {/* Hero Section */}
      <div className={`relative min-h-screen w-full flex flex-col justify-start text-center text-white overflow-hidden pt-40 pb-96 transition-all duration-500`}>
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
            {backgrounds.map((bg, index) => {
                const animationClass = kenBurnsAnimations[index % kenBurnsAnimations.length];
                return (
                    <div
                        key={bg.url}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                         <div
                            className={`w-full h-full bg-cover bg-center ${index === currentImageIndex ? animationClass : ''}`}
                            style={{ backgroundImage: `url(${bg.url})` }}
                        />
                    </div>
                );
            })}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-slate-900/90 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-indigo-950/30 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[800px] bg-gradient-to-t from-slate-900 from-10% via-slate-900/80 via-40% to-transparent pointer-events-none"></div>

        <div className="relative z-10 p-6 animate-fade-in-up max-w-4xl mx-auto">
            <div className="flex justify-center items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center ring-1 ring-indigo-500/40 backdrop-blur-sm">
                    <Users className="w-8 h-8 text-indigo-300" />
                </div>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold font-brand text-white leading-tight drop-shadow-lg">
                The Fæmily Space
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100/80 max-w-3xl mx-auto mt-4 mb-10 drop-shadow-md">
                Your central hub for creating, sharing, and reliving your family's collective story.
            </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate(Page.FamilyStoryline)} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20 w-full sm:w-auto"
            >
              <span>Fæmily Storyline</span>
            </button>
             <button 
              onClick={() => onNavigate(Page.FamilyMoments)} 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 w-full sm:w-auto"
            >
              <span>All Shared Momænts</span>
            </button>
          </div>
        </div>
        
        {/* Minimalist Image Info Overlay */}
        <div className="absolute bottom-56 w-full z-20 flex justify-center pointer-events-none">
            <div key={currentImageIndex} className="animate-fade-in-up flex items-center justify-center gap-4 sm:gap-6 px-6 pointer-events-auto">
                <h2 className="text-sm font-bold font-brand text-white drop-shadow-lg tracking-widest uppercase whitespace-nowrap">
                    {backgrounds[currentImageIndex]?.title}
                </h2>
                <span className="h-px w-8 bg-white/40 hidden md:block"></span>
                <p className="text-sm text-slate-200 font-medium drop-shadow-md hidden lg:block whitespace-nowrap opacity-90">
                    {backgrounds[currentImageIndex]?.description}
                </p>
                <span className="h-px w-8 bg-white/40 hidden lg:block"></span>
                <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-white/90 drop-shadow-md whitespace-nowrap hidden sm:flex">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Shared by {backgrounds[currentImageIndex]?.people?.[0]}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Content Grid - Hanging Overlap */}
      <div id="dashboard-section" className="relative z-20 -mt-48 pb-24 container mx-auto px-6 space-y-12">
        
        {/* Featured Momænts Grid */}
        {sharedMoments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sharedMoments.map(moment => (
              <button key={moment.id} onClick={() => onSelectMoment(moment)} className="text-left w-full h-full transition-all transform hover:-translate-y-1 outline-none rounded-2xl bg-slate-800/80 backdrop-blur-md overflow-hidden ring-1 ring-white/10 group shadow-xl">
                <div className="relative h-48">
                  <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  {moment.createdBy && moment.createdBy !== 'JD' && (
                       <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-indigo-600 ring-2 ring-slate-800 flex items-center justify-center text-xs font-bold text-white z-10 shadow-lg" title={`Shared by ${moment.createdBy}`}>
                          {moment.createdBy}
                      </div>
                  )}
                </div>
                <div className="p-5">
                    <h3 className="font-bold text-white leading-tight mb-1 text-lg font-brand">{moment.title}</h3>
                    <p className="text-xs text-slate-400">{moment.date}</p>
                </div>
              </button>
            ))}
             {/* Add Invite Card if space permits */}
             <button onClick={handleInviteClick} className="flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-6 h-6 text-slate-400 group-hover:text-indigo-400"/>
                </div>
                <span className="font-bold text-slate-300 group-hover:text-white">Invite Family</span>
             </button>
          </div>
        ) : (
          <div className="text-center text-slate-500 bg-gray-800/50 p-12 rounded-2xl ring-1 ring-white/10 max-w-md mx-auto">
              <p className="font-brand text-xl text-white mb-2">Your Fæmily Space is ready.</p>
              <p className="text-sm">Invite family members to start building your collective storyline!</p>
              <button onClick={handleInviteClick} className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full transition-colors">Invite Members</button>
          </div>
        )}

        {/* Memory Circles & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* AI Curation Suggestion */}
            <div className="bg-gradient-to-br from-cyan-900/60 to-blue-900/40 p-8 rounded-3xl ring-1 ring-cyan-500/30 flex flex-col justify-center relative overflow-hidden group cursor-pointer transition-all hover:ring-cyan-400/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex items-center gap-6 mb-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-300">
                         <GitMerge className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold font-brand text-white">Curation Suggestion</h3>
                </div>
                <p className="text-slate-300 leading-relaxed mb-6">æterny noticed that you and Jane both uploaded photos from "California Coast Adventures". Would you like to merge them into a single, richer momænt?</p>
                <div className="flex gap-4">
                    <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-full text-sm shadow-lg shadow-cyan-900/20">Merge Momænts</button>
                    <button className="text-slate-400 hover:text-white font-semibold text-sm px-4">Dismiss</button>
                </div>
            </div>

             {/* Recent Activity */}
            <div className="bg-slate-800/60 backdrop-blur-md p-8 rounded-3xl ring-1 ring-white/10">
                <h2 className="text-xl font-bold font-brand mb-6 flex items-center gap-3 text-white"><Users className="w-5 h-5 text-indigo-400"/> Recent Activity</h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-4 pb-4 border-b border-white/5">
                        <div className="w-8 h-8 rounded-full bg-sky-500 ring-2 ring-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-white text-xs">AD</div>
                        <div>
                            <p className="text-sm text-slate-300"><span className="font-bold text-white">Alex Doe</span> commented on <span className="font-bold text-white">"Our Wedding Day"</span></p>
                            <p className="text-xs text-slate-400 mt-1 italic">"Such a beautiful day! I still remember the sunset."</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-teal-500 ring-2 ring-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-white text-xs">MD</div>
                         <div>
                            <p className="text-sm text-slate-300"><span className="font-bold text-white">Mia Doe</span> added a new momænt</p>
                            <p className="text-xs text-slate-400 mt-1 font-bold text-white">"First Day of School"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyHomePage;
