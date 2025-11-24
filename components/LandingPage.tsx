import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Combine, ShieldOff, Lock, Infinity, Camera, Wand2, Film, Users, ChevronDown, Check, HelpCircle, ArrowDown, Zap, BookOpen, ArrowRight, Clapperboard, BookImage, Gift, ArrowLeft, CheckCircle, UserCheck, Mail } from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';
import { Page } from '../types';
import Tooltip from './Tooltip';
import LogoIcon from './icons/LogoIcon';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
    onSkipForDemo: () => void;
    onNavigate: (page: Page) => void;
    onStartDemo: () => void;
}

const staticBackgrounds = [
    {
        url: 'https://images.pexels.com/photos/1528660/pexels-photo-1528660.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'A Journey Begins',
        description: 'Every path holds a new story, a new adventure waiting to be written into your legacy.'
    },
    {
        url: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'The Dawn of a Memory',
        description: 'Sunrise paints the sky, a reminder that every day is a fresh canvas for unforgettable moments.'
    },
    {
        url: 'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'Reflection and Peace',
        description: 'In stillness, we find clarity. Cherish the quiet moments that shape our inner world.'
    },
    {
        url: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'Navigating Life\'s Tides',
        description: 'Like a lighthouse, our cherished memories guide us through the darkest storms.'
    },
    {
        url: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'Reaching New Heights',
        description: 'Celebrate the milestones, the struggles overcome, and the breathtaking views from the top.'
    }
];

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, onSkipForDemo, onNavigate, onStartDemo }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [landingBackgrounds, setLandingBackgrounds] = useState(staticBackgrounds);
  
  useEffect(() => {
    const fetchImages = async () => {
        const bgPhotos = await fetchPexelsImages('intimate personal memory', 5, 'landscape');
        if (bgPhotos.length > 0) {
            setLandingBackgrounds(bgPhotos.map((photo, index) => ({
                url: photo.src.large2x,
                title: staticBackgrounds[index]?.title || 'A beautiful moment',
                description: photo.alt || staticBackgrounds[index]?.description || ''
            })));
        }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (landingBackgrounds.length === 0) return;
    const timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % landingBackgrounds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [landingBackgrounds]);
  
  const kenBurnsAnimations = [
    'animate-ken-burns-landing-1', 'animate-ken-burns-landing-2',
    'animate-ken-burns-landing-3', 'animate-ken-burns-landing-4',
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
      <header className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => onNavigate(Page.Landing)} className="flex items-center gap-2 text-white">
            <LogoIcon className="w-10 h-10" />
            <span className="font-brand text-2xl font-bold tracking-tight">æternacy<sup className="text-sm font-light relative -top-1.5">™</sup></span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate(Page.About)} className="text-white font-semibold text-sm hover:underline hidden sm:block">About</button>
            <button onClick={() => onNavigate(Page.TrustCenter)} className="text-white font-semibold text-sm hover:underline hidden sm:block">Trust & Security</button>
            <button onClick={onLogin} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-2 px-6 rounded-full text-sm transition-all">
                Login
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="h-screen flex items-center justify-center relative overflow-hidden">
           <style>{`
                @keyframes ken-burns-landing-1 { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.1) translate(-2%, -2%); } } .animate-ken-burns-landing-1 { animation: ken-burns-landing-1 30s ease-in-out infinite alternate; }
                @keyframes ken-burns-landing-2 { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.1) translate(2%, 2%); } } .animate-ken-burns-landing-2 { animation: ken-burns-landing-2 30s ease-in-out infinite alternate; }
                @keyframes ken-burns-landing-3 { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.1) translate(-2%, 2%); } } .animate-ken-burns-landing-3 { animation: ken-burns-landing-3 30s ease-in-out infinite alternate; }
                @keyframes ken-burns-landing-4 { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.1) translate(2%, -2%); } } .animate-ken-burns-landing-4 { animation: ken-burns-landing-4 30s ease-in-out infinite alternate; }
           `}</style>
            {landingBackgrounds.map((bg, index) => (
                <div key={bg.url} className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}>
                     <div className={`w-full h-full bg-cover bg-center ${index === currentImageIndex ? kenBurnsAnimations[index % kenBurnsAnimations.length] : ''}`} style={{ backgroundImage: `url(${bg.url})` }} />
                </div>
            ))}
          <div className="absolute inset-0 bg-slate-900/60"></div>
          <div className="text-center z-10 p-6 animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight mb-4 font-brand" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>Your life. One timeless stream.</h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
              Capture what matters. Relive what’s priceless. <br className="hidden sm:block" />
              æternacy turns your memories into a living story—beautifully told, forever preserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={onRegister} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20 w-full sm:w-auto">
                    Start 30-Day Free Trial
                </button>
                <button onClick={onStartDemo} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 w-full sm:w-auto">
                    Try a Live Demo
                </button>
            </div>
             <p className="text-xs text-slate-400 mt-2" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>The AI-powered memory experience.</p>
          </div>
           <div className="absolute bottom-10 left-10 z-10 text-left text-white max-w-sm">
                <div key={currentImageIndex} className="animate-fade-in-up">
                    <h2 className="text-lg font-bold font-brand" style={{textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>{landingBackgrounds[currentImageIndex]?.title}</h2>
                    <p className="text-xs text-slate-300 mt-1" style={{textShadow: '0 1px 4px rgba(0,0,0,0.7)'}}>
                        {landingBackgrounds[currentImageIndex]?.description}
                    </p>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
