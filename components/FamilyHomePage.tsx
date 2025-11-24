

import React, { useState, useEffect } from 'react';
import { Page, UserTier, Moment } from '../types';
import { Users, LayoutGrid, UserPlus, GitBranch } from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';
import ChevronDoubleDownIcon from './icons/ChevronDoubleDownIcon';

// New static backgrounds for the family page
const staticFamilyBackgrounds = [
    { url: 'https://picsum.photos/seed/family1/1920/1080', title: 'Shared Laughter', description: 'Moments of joy that become the foundation of your family\'s story.' },
    { url: 'https://picsum.photos/seed/family2/1920/1080', title: 'Generations Connected', description: 'The timeless bond that links the past, present, and future.' },
    { url: 'https://picsum.photos/seed/family3/1920/1080', title: 'Holiday Warmth', description: 'The cozy comfort of tradition and togetherness.' },
    { url: 'https://picsum.photos/seed/family4/1920/1080', title: 'Outdoor Adventures', description: 'Exploring the world together, creating memories one step at a time.' },
    { url: 'https://picsum.photos/seed/family5/1920/1080', title: 'A Quiet Moment', description: 'In the simple, shared silence, the deepest connections are felt.' }
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
                description: photo.alt || staticFamilyBackgrounds[index]?.description || ''
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
    .slice(0, 8); // Show up to 8 recent moments

  const kenBurnsAnimations = [
    'animate-ken-burns-home-1',
    'animate-ken-burns-home-2',
    'animate-ken-burns-home-3',
    'animate-ken-burns-home-4',
  ];
  
  const handleScrollDown = () => {
    document.getElementById('recent-moments-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative h-screen w-full flex flex-col items-center justify-center text-center text-white overflow-hidden">
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
        <div className="absolute inset-0 bg-slate-900/60"></div>

        <div className="relative z-10 p-6 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-bold font-brand">
            Welcome to Your Fæmily Space
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mt-4 mb-10">
            This is your central hub for creating, sharing, and reliving your family's collective story.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate(Page.FamilyStoryline)} 
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20 w-full sm:w-auto"
            >
              <Users className="w-6 h-6 inline-block mr-2 -mt-1" />
              <span>Fæmily Storyline</span>
            </button>
             <button 
              onClick={() => onNavigate(Page.Moments)} 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 w-full sm:w-auto"
            >
              <LayoutGrid className="w-6 h-6 inline-block mr-2 -mt-1" />
              <span>All Shared Momænts</span>
            </button>
             <button
              onClick={() => onNavigate(Page.FamilyTree)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 w-full sm:w-auto"
            >
              <GitBranch className="w-6 h-6 inline-block mr-2 -mt-1" />
              <span>Build Your Fæmily Tree</span>
            </button>
            <button 
              onClick={handleInviteClick} 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 w-full sm:w-auto"
            >
              <UserPlus className="w-6 h-6 inline-block mr-2 -mt-1" />
              <span>Invite Members</span>
            </button>
          </div>
        </div>
        <button onClick={handleScrollDown} className="absolute bottom-10 z-10 animate-bounce">
            <ChevronDoubleDownIcon className="w-8 h-8 text-white/50" />
        </button>
      </div>

      {/* Recent Moments Section */}
      <div id="recent-moments-section" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold font-brand text-center mb-8">Recent Fæmily Momænts</h2>
        {sharedMoments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {sharedMoments.map(moment => (
              <button key={moment.id} onClick={() => onSelectMoment(moment)} className="text-left w-full h-full transition-transform transform hover:scale-105 focus:scale-105 outline-none rounded-2xl bg-gray-800/50 overflow-hidden ring-1 ring-white/10 group">
                <div className="relative h-48">
                  <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  {moment.createdBy && moment.createdBy !== 'JD' && (
                       <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-purple-600 ring-2 ring-slate-800 flex items-center justify-center text-xs font-bold text-white z-10" title={`Shared by ${moment.createdBy}`}>
                          {moment.createdBy}
                      </div>
                  )}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-white leading-tight mb-1">{moment.title}</h3>
                    <p className="text-xs text-slate-400">{moment.date}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 bg-gray-800/50 p-8 rounded-lg max-w-md mx-auto">
              <p>No shared moments yet.</p>
              <p className="mt-2 text-sm">Invite family members to start building your collective storyline!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyHomePage;