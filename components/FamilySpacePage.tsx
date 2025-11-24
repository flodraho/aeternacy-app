

import React, { useState, useEffect, useMemo } from 'react';
import { Page, UserTier, Moment } from '../types';
import { Users, LayoutGrid, UserPlus, GitBranch, MessageSquare, Edit, Trash2, Eye, X } from 'lucide-react';
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
  onPinToggle: (id: string) => void;
  onUpdateMoment: (moment: Moment) => void;
  onEditMoment: (moment: Moment) => void;
  onDeleteMoment: (id: string) => void;
  deletingMomentId?: string | null;
}

const FamilySpacePage: React.FC<FamilySpacePageProps> = ({ onNavigate, userTier, moments, onSelectMoment, onPinToggle, onUpdateMoment, onEditMoment, onDeleteMoment, deletingMomentId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [backgrounds, setBackgrounds] = useState(staticFamilyBackgrounds);
  // FIX: Changed selectedMomentId to be a string to match Moment.id type.
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);

  const selectedMoment = useMemo(() => {
    if (!selectedMomentId) return null;
    // FIX: This comparison will now work correctly with string IDs.
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
  
  // FIX: Changed momentId to be a string.
  const handleSelectFeaturedMoment = (momentId: string) => {
    setSelectedMomentId(prevId => prevId === momentId ? null : momentId);
  };
  
  const handleDelete = () => {
      if (selectedMoment) {
          if (window.confirm('Are you sure you want to permanently delete this momænt?')) {
              // FIX: Pass string id to handler.
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
            <div className="flex justify-center items-center gap-4 mb-4">
                <Users className="w-10 h-10 text-indigo-300" />
                <h1 className="text-4xl sm:text-5xl font-bold font-brand">
                    Welcome to Your Fæmily Space
                </h1>
            </div>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mt-4 mb-10">
            This is your central hub for creating, sharing, and reliving your family's collective story.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate(Page.FamilyTree)} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20 w-full sm:w-auto"
            >
              <GitBranch className="w-6 h-6 inline-block mr-2 -mt-1" />
              <span>View Fæmily Tree</span>
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
        <div className="absolute bottom-10 left-10 z-10 text-left text-white max-w-sm">
            <div key={currentImageIndex} className="animate-fade-in-up">
                <h2 className="text-lg font-bold font-brand" style={{textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>{backgrounds[currentImageIndex]?.title}</h2>
                <p className="hidden md:block text-xs text-slate-300 mt-1" style={{textShadow: '0 1px 4px rgba(0,0,0,0.7)'}}>
                    {backgrounds[currentImageIndex]?.description}
                    
                </p>
            </div>
        </div>

        <button onClick={handleScrollDown} className="absolute bottom-10 z-10 animate-bounce">
            <ChevronDoubleDownIcon className="w-8 h-8 text-white/50" />
        </button>
      </div>

      <div id="dashboard-section" className="container mx-auto px-6 py-16 space-y-12">
        {/* AI Curation Suggestion */}
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/30 p-8 rounded-2xl ring-1 ring-cyan-500/30 flex flex-col md:flex-row items-center gap-8">
            <GitMerge className="w-16 h-16 text-cyan-300 flex-shrink-0" />
            <div>
                <h3 className="text-2xl font-bold font-brand text-white">AI Curation Suggestion</h3>
                <p className="text-slate-300 mt-2">æterny noticed that you and Jane both uploaded photos from "California Coast Adventures". Would you like to merge them into a single, richer momænt?</p>
                <div className="mt-4 flex gap-4">
                    <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-full text-sm">Merge Momænts</button>
                    <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-full text-sm">Dismiss</button>
                </div>
            </div>
        </div>

        {/* Featured Momænts */}
        {featuredMoments.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold font-brand mb-8">Featured Fæmily Momænts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredMoments.map(moment => (
                  <button 
                    key={moment.id} 
                    // FIX: Pass string id to handler.
                    onClick={() => handleSelectFeaturedMoment(moment.id)}
                    className={`text-left w-full h-full transition-all outline-none rounded-2xl bg-gray-800/50 overflow-hidden ring-1 ring-white/10 group
                                {/* FIX: These comparisons will now work correctly with string IDs. */}
                                ${selectedMomentId === moment.id ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'} ${deletingMomentId === moment.id ? 'animate-dissolve-blue' : ''}`}
                  >
                      <div className="relative h-40">
                          <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-full object-cover transition-transform duration-300"/>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
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
          </div>
        )}

        {/* Memory Circles & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             {/* Memory Circles */}
            <div>
                <h2 className="text-3xl font-bold font-brand mb-8">Memory Circles</h2>
                 <div className="space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
                        <div className="flex items-center -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-pink-500 ring-2 ring-slate-800 flex items-center justify-center font-bold text-white">JD</div>
                            <div className="w-10 h-10 rounded-full bg-sky-500 ring-2 ring-slate-800 flex items-center justify-center font-bold text-white">AD</div>
                        </div>
                        <p className="font-semibold text-white">Parents</p>
                    </div>
                     <div className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
                        <div className="flex items-center -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-teal-500 ring-2 ring-slate-800 flex items-center justify-center font-bold text-white">MD</div>
                        </div>
                        <p className="font-semibold text-white">Kids</p>
                    </div>
                    <button className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">+ Create a new circle</button>
                 </div>
            </div>
             {/* Recent Activity */}
            <div>
                <h2 className="text-3xl font-bold font-brand mb-8">Recent Activity</h2>
                <div className="space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-sky-500 ring-2 ring-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">AD</div>
                        <p className="text-sm text-slate-300"><span className="font-semibold text-white">Alex Doe</span> left a comment on <span className="font-semibold text-white">"Our Wedding Day"</span>: "Such a beautiful day! I still remember the sunset."</p>
                    </div>
                     <div className="bg-slate-800/50 p-4 rounded-lg flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-teal-500 ring-2 ring-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">MD</div>
                        <p className="text-sm text-slate-300"><span className="font-semibold text-white">Mia Doe</span> added a new momænt: <span className="font-semibold text-white">"First Day of School"</span>.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
       {selectedMoment && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-800/90 backdrop-blur-sm animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4 overflow-hidden">
              <img src={selectedMoment.image || selectedMoment.images?.[0]} alt={selectedMoment.title} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
              <div className="whitespace-nowrap overflow-hidden">
                <p className="font-bold text-white truncate">{selectedMoment.title}</p>
                <p className="text-sm text-slate-400">{selectedMoment.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => onSelectMoment(selectedMoment)} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-full text-sm transition-colors"><Eye className="w-4 h-4"/> View</button>
              <button onClick={() => onEditMoment(selectedMoment)} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-full text-sm transition-colors"><Edit className="w-4 h-4"/> Edit</button>
              <button onClick={handleDelete} className="flex items-center gap-2 bg-red-900/50 hover:bg-red-900/80 text-red-300 font-semibold py-2 px-3 rounded-full text-sm transition-colors"><Trash2 className="w-4 h-4"/> Delete</button>
              <button onClick={() => setSelectedMomentId(null)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 transition-colors"><X className="w-5 h-5"/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilySpacePage;