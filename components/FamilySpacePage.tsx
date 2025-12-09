
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Page, UserTier, Moment } from '../types';
import { Users, LayoutGrid, UserPlus, GitMerge, MessageSquare, Edit, Trash2, Eye, X, MapPin, ArrowRight, Plus } from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';
import ChevronDoubleDownIcon from './icons/ChevronDoubleDownIcon';

const staticFamilyBackgrounds = [
    { url: 'https://images.pexels.com/photos/1036841/pexels-photo-1036841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', title: 'Shared Laughter', description: 'Moments of joy that become the foundation of your family\'s story.' },
    { url: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', title: 'Generations Connected', description: 'The timeless bond that links the past, present, and future.' },
    { url: 'https://images.pexels.com/photos/668296/pexels-photo-668296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', title: 'Holiday Warmth', description: 'The cozy comfort of tradition and togetherness.' },
    { url: 'https://images.pexels.com/photos/1251299/pexels-photo-1251299.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', title: 'Outdoor Adventures', description: 'Exploring the world together, creating memories one step at a time.' },
    { url: 'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', title: 'A Quiet Moment', description: 'In the simple, shared silence, the deepest connections are felt.' }
];

interface FamilySpacePageProps {
  onNavigate: (page: Page) => void;
  userTier: UserTier;
  moments: Moment[];
  onSelectMoment: (moment: Moment) => void;
  onPinToggle: (id: number) => void;
  onUpdateMoment: (moment: Moment) => void;
  onEditMoment: (moment: Moment) => void;
  onDeleteMoment: (id: number) => void;
  deletingMomentId?: number | null;
}

const FamilySpacePage: React.FC<FamilySpacePageProps> = ({ onNavigate, userTier, moments, onSelectMoment, onPinToggle, onUpdateMoment, onEditMoment, onDeleteMoment, deletingMomentId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [backgrounds, setBackgrounds] = useState(staticFamilyBackgrounds);
  const [selectedMomentId, setSelectedMomentId] = useState<number | null>(null);

  const selectedMoment = useMemo(() => {
    if (!selectedMomentId) return null;
    return moments.find(m => m.id === selectedMomentId);
  }, [selectedMomentId, moments]);

  useEffect(() => {
    const fetchImages = async () => {
        const bgPhotos = await fetchPexelsImages('authentic candid family moments sharing stories', 5, 'landscape');
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
    if (userTier === 'fæmily' || userTier === 'legacy') {
      onNavigate(Page.Profile);
    } else {
      onNavigate(Page.FamilyPlan);
    }
  };
  
  const handleSelectFeaturedMoment = (momentId: number) => {
    setSelectedMomentId(prevId => prevId === momentId ? null : momentId);
  };
  
  const handleDelete = () => {
      if (selectedMoment) {
          if (window.confirm('Are you sure you want to permanently delete this momænt?')) {
              onDeleteMoment(selectedMoment.id);
              setSelectedMomentId(null);
          }
      }
  };

  const featuredMoments = moments
    .filter(m => m.pinned)
    .slice(0, 4);

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
      <style>{`
            @keyframes wiggle {
                0% { transform: rotate(-0.3deg); }
                50% { transform: rotate(0.3deg); }
                100% { transform: rotate(-0.3deg); }
            }
            .animate-wiggle {
                animation: wiggle 0.4s ease-in-out infinite;
            }
        `}</style>

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
              <Users className="w-6 h-6 inline-block mr-2 -mt-1" />
              <span>Fæmily Storyline</span>
            </button>
             <button 
              onClick={() => onNavigate(Page.FamilyMoments)} 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 w-full sm:w-auto"
            >
              <LayoutGrid className="w-6 h-6 inline-block mr-2 -mt-1" />
              <span>View Fæmily Collection</span>
            </button>
          </div>
        </div>
        
        {/* Minimalist Image Info Overlay - Centered */}
        <div className="absolute bottom-56 w-full z-20 flex justify-center pointer-events-none">
            <div key={currentImageIndex} className="animate-fade-in-up flex items-center justify-center gap-4 sm:gap-6 px-6 pointer-events-auto">
                
                <h2 className="text-sm font-bold font-brand text-white drop-shadow-lg tracking-widest uppercase whitespace-nowrap">
                    {backgrounds[currentImageIndex]?.title}
                </h2>
                
                <span className="h-px w-8 bg-white/40 hidden md:block"></span>
                
                <p className="text-sm text-slate-200 font-medium drop-shadow-md hidden lg:block whitespace-nowrap max-w-[300px] truncate opacity-90">
                    {backgrounds[currentImageIndex]?.description}
                </p>

                <span className="h-px w-8 bg-white/40 hidden lg:block"></span>

                <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-white/90 drop-shadow-md whitespace-nowrap hidden sm:flex">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Shared Space</span>
                </div>
            </div>
        </div>
      </div>

      {/* Content Grid - Hanging Overlap */}
      <div id="dashboard-section" className="relative z-20 -mt-48 pb-24 container mx-auto px-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            
            {/* AI Curation Widget */}
            <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/60 p-8 rounded-3xl ring-1 ring-indigo-400/30 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all hover:ring-indigo-400/50 lg:col-span-2 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-300">
                             <GitMerge className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold font-brand text-white">Curation Suggestion</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed mb-8 text-lg">æterny noticed that you and Jane both uploaded photos from "California Coast Adventures". Would you like to merge them into a single, richer momænt?</p>
                    <div className="flex gap-4">
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full text-sm shadow-lg shadow-indigo-900/20">Merge Momænts</button>
                        <button className="text-slate-400 hover:text-white font-semibold text-sm px-4">Dismiss</button>
                    </div>
                </div>
            </div>

            {/* Recent Activity Widget */}
            <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl ring-1 ring-white/10 shadow-xl h-full">
                <h2 className="text-xl font-bold font-brand mb-6 flex items-center gap-3 text-white"><Users className="w-5 h-5 text-indigo-400"/> Recent Activity</h2>
                <div className="space-y-6">
                    <div className="flex items-start gap-4 pb-4 border-b border-white/5">
                        <div className="w-10 h-10 rounded-full bg-sky-500 ring-2 ring-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">AD</div>
                        <div>
                            <p className="text-sm text-slate-300"><span className="font-bold text-white">Alex Doe</span> commented</p>
                            <p className="text-xs text-slate-400 mt-1 italic">"Such a beautiful day! I still remember the sunset."</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-teal-500 ring-2 ring-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">MD</div>
                         <div>
                            <p className="text-sm text-slate-300"><span className="font-bold text-white">Mia Doe</span> added a momænt</p>
                            <p className="text-xs text-slate-400 mt-1 font-bold text-white">"First Day of School"</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Moments Grid */}
            {featuredMoments.length > 0 && (
                 <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    {featuredMoments.map(moment => (
                      <button 
                        key={moment.id} 
                        onClick={() => handleSelectFeaturedMoment(moment.id)}
                        className={`text-left w-full h-full transition-all outline-none rounded-3xl bg-slate-800/50 overflow-hidden ring-1 ring-white/10 group shadow-lg
                                    ${selectedMomentId === moment.id ? 'ring-2 ring-indigo-400 scale-[1.02]' : 'hover:scale-[1.02]'} ${deletingMomentId === moment.id ? 'animate-dissolve-blue' : ''}`}
                      >
                          <div className="relative h-48">
                              <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                              {moment.createdBy && moment.createdBy !== 'JD' && (
                                <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-purple-600 ring-2 ring-slate-900 flex items-center justify-center text-sm font-bold text-white z-10 shadow-lg" title={`Shared by ${moment.createdBy}`}>
                                    {moment.createdBy}
                                </div>
                              )}
                          </div>
                          <div className="p-6">
                              <h3 className="font-bold text-white leading-tight mb-2 text-lg font-brand">{moment.title}</h3>
                              <p className="text-xs text-slate-400">{moment.date}</p>
                          </div>
                      </button>
                    ))}
                    
                    {/* Invite Card */}
                    <button onClick={handleInviteClick} className="flex flex-col items-center justify-center text-center p-6 rounded-3xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group h-full min-h-[200px]">
                        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ring-1 ring-white/10">
                            <UserPlus className="w-6 h-6 text-slate-400 group-hover:text-indigo-400"/>
                        </div>
                        <span className="font-bold text-slate-300 group-hover:text-white">Invite Family</span>
                    </button>
                 </div>
            )}

            {/* Memory Circles */}
            <div className="lg:col-span-3 bg-slate-800/40 backdrop-blur-sm p-8 rounded-3xl ring-1 ring-white/5 mt-4">
                <h2 className="text-2xl font-bold font-brand mb-6 text-white">Memory Circles</h2>
                 <div className="flex flex-wrap gap-4">
                    <button className="bg-slate-700/50 hover:bg-slate-700 p-4 rounded-2xl flex items-center gap-4 ring-1 ring-white/10 transition-all pr-8">
                        <div className="flex items-center -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-pink-500 ring-2 ring-slate-800 flex items-center justify-center font-bold text-white">JD</div>
                            <div className="w-10 h-10 rounded-full bg-sky-500 ring-2 ring-slate-800 flex items-center justify-center font-bold text-white">AD</div>
                        </div>
                        <div>
                            <p className="font-bold text-white">Parents</p>
                            <p className="text-xs text-slate-400">2 Members</p>
                        </div>
                    </button>
                     <button className="bg-slate-700/50 hover:bg-slate-700 p-4 rounded-2xl flex items-center gap-4 ring-1 ring-white/10 transition-all pr-8">
                        <div className="flex items-center -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-teal-500 ring-2 ring-slate-800 flex items-center justify-center font-bold text-white">MD</div>
                        </div>
                        <div>
                            <p className="font-bold text-white">Kids</p>
                            <p className="text-xs text-slate-400">1 Member</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed border-slate-600 hover:border-indigo-400 text-slate-400 hover:text-indigo-400 font-bold transition-all">
                        <Plus className="w-5 h-5" />
                        Create Circle
                    </button>
                 </div>
            </div>
         </div>
      </div>
      
       {selectedMoment && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-800/90 backdrop-blur-xl border-t border-white/10 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4 overflow-hidden">
              <img src={selectedMoment.image || selectedMoment.images?.[0]} alt={selectedMoment.title} className="w-12 h-12 object-cover rounded-lg flex-shrink-0 ring-1 ring-white/20" />
              <div className="whitespace-nowrap overflow-hidden">
                <p className="font-bold text-white truncate text-lg">{selectedMoment.title}</p>
                <p className="text-xs text-slate-400">{selectedMoment.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={() => onSelectMoment(selectedMoment)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-5 rounded-full text-sm transition-colors"><Eye className="w-4 h-4"/> View</button>
              <button onClick={() => onEditMoment(selectedMoment)} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-5 rounded-full text-sm transition-colors"><Edit className="w-4 h-4"/> Edit</button>
              <button onClick={handleDelete} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2 px-5 rounded-full text-sm transition-colors"><Trash2 className="w-4 h-4"/> Delete</button>
              <button onClick={() => setSelectedMomentId(null)} className="p-2 rounded-full text-slate-400 hover:bg-white/10 transition-colors ml-2"><X className="w-5 h-5"/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilySpacePage;
