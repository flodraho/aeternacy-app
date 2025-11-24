
import React, { useState, useEffect, useRef, useMemo } from 'react';
// FIX: Import missing icons from lucide-react.
import { Star, Combine, ShieldOff, Lock, Infinity, Camera, Wand2, Film, Users, ChevronDown, Check, HelpCircle, ArrowDown, Zap, BookOpen, ArrowRight, Clapperboard, BookImage, Gift, ArrowLeft, CheckCircle, UserCheck, Mail } from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';
import { Page } from '../types';
import Tooltip from './Tooltip';

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

const journeySteps = [
  {
    icon: Camera,
    title: '1. Capture',
    description: 'Effortlessly add photos, record conversations, or jot down thoughts. Preserve the raw essence of your moments as they happen, from any device.'
  },
  {
    icon: Wand2,
    title: '2. Curate',
    description: 'Watch as æterny, your personal AI curator, intelligently weaves your memories into compelling stories, complete with rich details, context, and tags.'
  },
  {
    icon: Film,
    title: '3. Relive',
    description: 'Experience your timestream through narrated stories, dynamic slideshows, and even AI-generated "living photo" video scenes.'
  },
  {
    icon: Users,
    title: '4. Share',
    description: 'Create shared family spaces or invite individual collaborators. Your stories, shared privately with the people who matter most.'
  },
  {
    icon: Lock,
    title: '5. Preserve',
    description: 'Secure your most important moments in the Lægacy Vault. Appoint stewards and create Time Capsules to ensure your story endures.'
  }
];

const faqData = [
    {
        question: "What exactly is æterny?",
        answer: "æterny is your personal AI curator. It's the intelligent and empathetic core of the platform that helps you organize your memories, uncover hidden themes, and weave your individual moments into a cohesive life story. It assists with everything from writing narratives to generating video slideshows."
    },
    {
        question: "Is my data private and secure?",
        answer: "Absolutely. Privacy is the foundation of æternacy. We use end-to-end encryption for all your data. We never sell your data, use it for advertising, or share it with third parties. Your story is yours alone, and with the Lægacy Trust, you control who has access, even into the future."
    },
    {
        question: "What are Tokæn used for?",
        answer: "Tokæn are your internal 'creative energy', used exclusively for advanced AI features like generating cinematic video reflections or designing a mægazine issue. This helps us manage the significant server resources these powerful tools require, while keeping the core platform features unlimited for subscribers."
    },
    {
        question: "Can I cancel my subscription at any time?",
        answer: "Yes, you can cancel your subscription at any time, no questions asked. You will retain access to your plan's features until the end of your current billing cycle."
    },
    {
        question: "What makes the Lægacy plan special?",
        answer: "The Lægacy plan is about permanence. It unlocks our full suite of preservation tools, including the Lægacy Vault, Time Capsules, and the ability to appoint Stewards to safeguard your story for future generations. It's designed for those who want to create a timeless family archive."
    }
];

// Inline Badge components for the new security section
const Iso27001Badge = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#B0B0B0" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#708090" strokeWidth="1" />
      <text x="50" y="55" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#2D3748" textAnchor="middle">ISO</text>
      <text x="50" y="75" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill="#2D3748" textAnchor="middle">27001</text>
      <text x="50" y="90" fontFamily="sans-serif" fontSize="8" fill="#2D3748" textAnchor="middle">Certified</text>
      <path id="circlePath" d="M 15,50 A 35,35 0 1,1 85,50" fill="none" />
      <text fontSize="6" fill="#2D3748" letterSpacing="0.5">
        <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
          Information Security Management System
        </textPath>
      </text>
    </svg>
  );
  
  const Iso22301Badge = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#888888" stroke="#666666" strokeWidth="1"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#AAAAAA" strokeWidth="1" strokeDasharray="2 2" />
      <text x="50" y="55" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">ISO</text>
      <text x="50" y="75" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">22301</text>
      <path id="circlePath2" d="M 15,50 A 35,35 0 1,1 85,50" fill="none" />
      <text fontSize="7" fill="#FFFFFF" letterSpacing="2">
        <textPath href="#circlePath2" startOffset="50%" textAnchor="middle">
          • CERTIFIED • CERTIFIED • CERTIFIED •
        </textPath>
      </text>
    </svg>
  );
  
  const GdprBadge = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#4A5568" stroke="#718096" strokeWidth="2" />
      <text x="50" y="60" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle">GDPR</text>
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x = 50 + 38 * Math.cos(angle);
        const y = 50 + 38 * Math.sin(angle);
        return <text key={i} x={x} y={y + 4} fontSize="12" fill="white" textAnchor="middle">★</text>
      })}
    </svg>
);

const TOKEN_COSTS = {
  HEADER_ANIMATION: 200,
  AI_VIDEO_REFLECTION: 600,
  MAGAZINE_ISSUE: 1200,
  BIOGRAFER_SESSION: 400,
  NARRATED_STORY: 100,
};


const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, onSkipForDemo, onNavigate, onStartDemo }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [landingBackgrounds, setLandingBackgrounds] = useState(staticBackgrounds);
  const [featureImages, setFeatureImages] = useState<string[]>([
      'https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
      'https://images.pexels.com/photos/3127880/pexels-photo-3127880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/7649234/pexels-photo-7649234.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/694740/pexels-photo-694740.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ]);
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);
  const journeyStepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // State for token calculator
  const [calcVideos, setCalcVideos] = useState(2);
  const [calcMagazines, setCalcMagazines] = useState(1);

  const { monthlyTokensNeeded, recommendedPlan } = useMemo(() => {
    const needed = (calcVideos * TOKEN_COSTS.AI_VIDEO_REFLECTION) + (calcMagazines / 12 * TOKEN_COSTS.MAGAZINE_ISSUE);
    
    let plan = 'Select usage to see recommendation';
    if (needed > 12000) {
        plan = 'Lægacy (High Usage)';
    } else if (needed > 8000) {
        plan = 'Lægacy';
    } else if (needed > 4000) {
        plan = 'Fæmily Plus'
    } else if (needed > 0) {
        plan = 'Fæmily';
    }

    return { monthlyTokensNeeded: needed, recommendedPlan: plan };
  }, [calcVideos, calcMagazines]);


  const prices = {
      monthly: { essæntial: 9, fæmily: 19, familyPlus: 29, legacy: 49 },
      yearly: { essæntial: 90, fæmily: 190, familyPlus: 290, legacy: 490 }
  };

  const tokenTooltipText = "Tokæn fuel advanced AI creations like:\n• Living Photo animations\n• AI Video Reflections\n• Mægazine design\n• Biografær sessions\n• Bulk Upload analysis";

  const socialProofData = [
    {
      text: "Maria used æternacy to preserve her mother's recipes and stories before Alzheimer's took her memories",
      image: "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      text: "The Schmidt family documented 3 generations across Germany, Argentina, and the US",
      image: "https://images.pexels.com/photos/853168/pexels-photo-853168.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      text: "Thomas created a video biography for his father's 75th birthday using 40 years of photos",
      image: "https://images.pexels.com/photos/1684820/pexels-photo-1684820.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];

  useEffect(() => {
    const fetchImages = async () => {
        const bgPhotos = await fetchPexelsImages('intimate personal memory', 5, 'landscape');
        if (bgPhotos.length > 0) {
            setLandingBackgrounds(bgPhotos.map((photo, index) => ({
                url: photo.src.large2x,
                title: staticBackgrounds[index].title,
                description: photo.alt || staticBackgrounds[index].description
            })));
        }
        
        const capturePhotoPromise = fetchPexelsImages('first person perspective hiking beautiful mountain trail', 1, 'landscape');
        const curatePhotoPromise = fetchPexelsImages('hands carefully arranging old photographs', 1, 'landscape');
        const relivePhotoPromise = fetchPexelsImages('family watching old slides projected on wall', 1, 'landscape');
        const sharePhotoPromise = fetchPexelsImages('family sharing photos on tablet', 1, 'landscape');
        const preservePhotoPromise = fetchPexelsImages('hands placing a photograph into a wooden box', 1, 'landscape');

        const [capturePhotos, curatePhotos, relivePhotos, sharePhotos, preservePhotos] = await Promise.all([
            capturePhotoPromise,
            curatePhotoPromise,
            relivePhotoPromise,
            sharePhotoPromise,
            preservePhotoPromise,
        ]);

        const newFeatureImages = [...featureImages]; // Start with fallback
        if (capturePhotos.length > 0) newFeatureImages[0] = capturePhotos[0].src.large2x;
        if (curatePhotos.length > 0) newFeatureImages[1] = curatePhotos[0].src.large2x;
        if (relivePhotos.length > 0) newFeatureImages[2] = relivePhotos[0].src.large2x;
        if (sharePhotos.length > 0) newFeatureImages[3] = sharePhotos[0].src.large2x;
        if (preservePhotos.length > 0) newFeatureImages[4] = preservePhotos[0].src.large2x;
        
        setFeatureImages(newFeatureImages);
    };
    fetchImages();
}, []);


  useEffect(() => {
    if (landingBackgrounds.length === 0) return;
    const timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % landingBackgrounds.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, [landingBackgrounds]);
  
  useEffect(() => {
    const handleScroll = () => {
        let currentStep = 0;
        for (let i = 0; i < journeyStepRefs.current.length; i++) {
            const ref = journeyStepRefs.current[i];
            if (ref) {
                const { top } = ref.getBoundingClientRect();
                if (top < window.innerHeight * 0.55) { // Activate when top of element passes 55% of viewport height
                    currentStep = i;
                }
            }
        }
        setActiveJourneyStep(currentStep);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const kenBurnsAnimations = [
    'animate-ken-burns-landing-1',
    'animate-ken-burns-landing-2',
    'animate-ken-burns-landing-3',
    'animate-ken-burns-landing-4',
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
      <header className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <span className="font-brand text-3xl font-bold tracking-tight text-white">æternacy<sup className="text-lg font-light relative -top-2">™</sup></span>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate(Page.Gift)} className="text-white font-semibold text-sm hover:underline flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-300" />
              Gift a Legacy
            </button>
            <button onClick={onLogin} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-2 px-6 rounded-full text-sm transition-all">
                Login
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center relative overflow-hidden">
           <style>
                {`
                @keyframes ken-burns-landing-1 {
                    0% { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.1) translate(-2%, -2%); }
                }
                .animate-ken-burns-landing-1 { animation: ken-burns-landing-1 30s ease-in-out infinite alternate; }

                @keyframes ken-burns-landing-2 {
                    0% { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.1) translate(2%, 2%); }
                }
                .animate-ken-burns-landing-2 { animation: ken-burns-landing-2 30s ease-in-out infinite alternate; }
                
                @keyframes ken-burns-landing-3 {
                    0% { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.1) translate(-2%, 2%); }
                }
                .animate-ken-burns-landing-3 { animation: ken-burns-landing-3 30s ease-in-out infinite alternate; }

                @keyframes ken-burns-landing-4 {
                    0% { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.1) translate(2%, -2%); }
                }
                .animate-ken-burns-landing-4 { animation: ken-burns-landing-4 30s ease-in-out infinite alternate; }
                `}
            </style>
            {landingBackgrounds.map((bg, index) => {
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
            <div className="mt-4">
                <button onClick={onSkipForDemo} className="bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white font-semibold py-3 px-6 rounded-full transition-colors text-sm">
                    Enter Demo Space
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

        {/* Intro Section */}
        <section id="intro-section" className="py-20 md:py-32 bg-slate-900 z-10 relative">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-brand">What is æternacy?</h2>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              Your personal legacy platform. Capture, curate, reflect, and preserve your life's moments with AI-guided storytelling—secure, private, timeless, and uniquely yours.
            </p>

            <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12 text-left">
                {/* Feature 1: Connected */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                        <Combine className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Your Life, Connected</h3>
                        <p className="text-slate-400 mt-1">Seamlessly import memories from Google Photos, Apple iCloud, Meta, and more. Your entire story, all in one place.</p>
                    </div>
                </div>

                {/* Feature 2: Ad-Free */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                        <ShieldOff className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">A Sacred, Ad-Free Space</h3>
                        <p className="text-slate-400 mt-1">Relive your moments without interruption. We never show ads, and we never will. Your experience is paramount.</p>
                    </div>
                </div>

                {/* Feature 3: Private */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                        <Lock className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Private by Design</h3>
                        <p className="text-slate-400 mt-1">Your data is yours alone. We never use it for commercial purposes or share it with third parties. Your legacy is encrypted and secure.</p>
                    </div>
                </div>

                {/* Feature 4: Timeless */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                        <Infinity className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Built for Generations</h3>
                        <p className="text-slate-400 mt-1">æternacy is designed for permanence, ensuring your story can be passed down and experienced by future generations.</p>
                    </div>
                </div>
            </div>

          </div>
        </section>

        {/* Privacy and Security Section */}
        <section id="trust-section" className="py-20 md:py-32 bg-slate-800/50">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-brand">Privacy and Security</h2>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-16">
                    Discover in our <button onClick={() => onNavigate(Page.TrustCenter)} className="text-cyan-400 hover:underline">Trust Center</button> how æternacy protects your data.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-5xl mx-auto">
                    <div className="w-48 h-48">
                        <Iso27001Badge />
                    </div>
                    <div className="w-48 h-48">
                        <Iso22301Badge />
                    </div>
                    <div className="w-48 h-48">
                        <GdprBadge />
                    </div>
                </div>
            </div>
        </section>

        {/* Scrollytelling Section */}
        <section className="py-20 md:py-32 bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-brand">Your Story's Journey</h2>
                    <p className="text-lg md:text-xl text-slate-300 mt-4">
                        From fleeting moments to an enduring legacy, see how æternacy brings your story to life.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24" style={{ height: `${(journeySteps.length) * 70}vh` }}>
                    {/* Sticky Visuals */}
                    <div className="sticky top-0 h-screen flex items-center">
                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                            {featureImages.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={journeySteps[index]?.title}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${activeJourneyStep === index ? 'opacity-100' : 'opacity-0'}`}
                                />
                            ))}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                    </div>

                    {/* Scrolling Text */}
                    <div>
                        {journeySteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div 
                                    key={index} 
                                    ref={el => { journeyStepRefs.current[index] = el; }}
                                    className="h-[70vh] flex items-center"
                                >
                                    <div className={`transition-opacity duration-500 ${activeJourneyStep === index ? 'opacity-100' : 'opacity-30'}`}>
                                        <div className={`flex items-center gap-4 mb-4`}>
                                            <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                                                <Icon className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <h3 className="text-3xl font-bold text-white font-brand">{step.title}</h3>
                                        </div>
                                        <p className="text-lg text-slate-300">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 md:py-32 bg-slate-900">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white font-brand text-center mb-12">Stories of æternacy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {socialProofData.map((proof, index) => (
                <div key={index} className="relative aspect-video rounded-2xl overflow-hidden group">
                  <img src={proof.image} alt={proof.text} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <p className="absolute bottom-6 left-6 right-6 text-white font-semibold text-lg" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.7)' }}>
                    "{proof.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gifting Section */}
        <section className="py-20 md:py-32 bg-slate-800/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-bold text-white font-brand">Give the Gift of a Lifetime.</h2>
                <p className="text-lg text-slate-300 mt-4">
                  Help your parents or loved ones preserve their priceless stories with the "Gift a Legacy" package. It’s more than a gift; it's a bridge between generations.
                </p>
                <ul className="text-left space-y-3 mt-6 text-slate-300">
                  <li className="flex gap-3"><Check className="w-6 h-6 text-cyan-400 flex-shrink-0"/> A prepaid year of the æternacy Fæmily Plan.</li>
                  <li className="flex gap-3"><Check className="w-6 h-6 text-cyan-400 flex-shrink-0"/> A personal onboarding concierge to help them get started.</li>
                  <li className="flex gap-3"><Check className="w-6 h-6 text-cyan-400 flex-shrink-0"/> The perfect, meaningful gift for birthdays, anniversaries, or just because.</li>
                </ul>
                <button onClick={() => onNavigate(Page.Gift)} className="mt-8 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105">
                    Learn More About Gifting
                </button>
              </div>
              <div className="relative aspect-square w-full max-w-md mx-auto">
                <img src="https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Older person smiling while looking at a tablet" className="w-full h-full object-cover rounded-2xl shadow-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing-section" className="py-20 md:py-32 bg-slate-800/50">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-brand">Find Your Plan</h2>
                    <p className="text-lg md:text-xl text-slate-300 mt-4">
                        Start your 30-day free trial. Choose the plan that fits your story. Cancel anytime.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center items-center mb-12">
                    <div className="inline-flex bg-slate-800 rounded-full p-1 items-center">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-8 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none ${billingCycle === 'monthly' ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setBillingCycle('yearly')}
                            className={`group px-8 py-2 rounded-full text-sm font-semibold transition-colors relative focus:outline-none ${billingCycle === 'yearly' ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}
                        >
                            Yearly
                            <span className="absolute -top-2.5 -right-5 bg-amber-400 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-full ring-2 ring-slate-800 transform transition-transform group-hover:scale-110">2 months free</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
