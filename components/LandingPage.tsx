
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Combine, ShieldOff, Lock, Infinity, Camera, Wand2, Film, Users, ChevronDown, Check, HelpCircle, ArrowDown, Zap, BookOpen, ArrowRight, Clapperboard, BookImage, Gift, GitBranch, CalendarClock } from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';
import { Page } from '../types';
import Tooltip from './Tooltip';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
    onNavigate: (page: Page) => void;
    onStartDemo: () => void;
}

const staticBackgrounds = [
    {
        url: 'https://images.pexels.com/photos/1036841/pexels-photo-1036841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'Warmth of Connection',
        description: 'Cherish the moments of closeness that define a family, passed down through generations.'
    },
    {
        url: 'https://images.pexels.com/photos/1766838/pexels-photo-1766838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'Celestial Wonder',
        description: 'Under a sky full of stars, we find our place in the universe and the stories that connect us.'
    },
    {
        url: 'https://images.unsplash.com/photo-1750769645255-6880e23bbb4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBnZW5lcmF0aW9ucyUyMGhhbmRzfGVufDF8fHx8MTc1OTY3MzEzOHww&ixlib=rb-4.1.0&q=80&w=1080',
        title: 'Generations',
        description: 'The gentle touch that passes stories and love from one generation to the next.'
    },
    {
        url: 'https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'A New Beginning',
        description: 'At the dawn of a new day, the future of the family story begins to unfold.'
    },
    {
        url: 'https://images.pexels.com/photos/3184406/pexels-photo-3184406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'Moments of Achievement',
        description: 'Celebrating the dedication, discipline, and beauty of personal and collective achievement.'
    },
    {
        url: 'https://images.pexels.com/photos/931018/pexels-photo-931018.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'Shared Celebrations',
        description: 'The vibrant energy of moments shared in celebration, creating memories that glow.'
    },
    {
        url: 'https://images.pexels.com/photos/414144/pexels-photo-414144.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'Thrill of Adventure',
        description: 'Carving a new path, embracing the rush of adventure in the great wide open.'
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
    description: 'Create shared family spaces and traditions. Invite collaborators to build your story together, privately and securely.'
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
        question: "What are Fæmily Rituals?",
        answer: "Fæmily Rituals are recurring, themed activities designed to turn memory-keeping into a family tradition. For example, a 'Sunday Dinner' ritual prompts everyone to share a photo each week. At the end of the cycle, æterny can weave these contributions into a beautiful, shared story. It’s about creating memories together, consistently."
    },
    {
        question: "Is my data private and secure?",
        answer: "Absolutely. Privacy is the foundation of æternacy. We use end-to-end encryption for all your data. We never sell your data, use it for advertising, or share it with third parties. Your story is yours alone, and with the Lægacy Trust, you control who has access, even into the future."
    },
    {
        question: "What are Tokæn used for?",
        answer: "Tokæn are your monthly allowance for advanced AI features like generating cinematic video reflections or designing a mægazine issue. This helps us manage the significant server resources these powerful tools require, while keeping the core platform features unlimited for subscribers."
    },
    {
        question: "What makes the Lægacy plan special?",
        answer: "The Lægacy plan is about permanence. It unlocks our full suite of preservation tools, including Digital Inheritance tools, Time Capsules, and the ability to appoint Stewards to safeguard your story for future generations. It's designed for those who want to create a timeless family archive."
    }
];

const IsoBadge: React.FC<{ title: string, description: string, className?: string }> = ({ title, description, className }) => (
  <Tooltip text={description}>
    <div className={`relative flex items-center justify-center transition-transform hover:scale-110 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600" />
            <text x="50" y="60" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="currentColor" textAnchor="middle" className="text-slate-300">{title}</text>
        </svg>
    </div>
  </Tooltip>
);


const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, onNavigate, onStartDemo }) => {
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

  const [calcVideos, setCalcVideos] = useState(2);
  const [calcMagazines, setCalcMagazines] = useState(1);

  const { monthlyTokensNeeded, recommendedPlan } = useMemo(() => {
    const TOKEN_COSTS = { AI_VIDEO_REFLECTION: 600, MAGAZINE_ISSUE: 1200 };
    const needed = (calcVideos * TOKEN_COSTS.AI_VIDEO_REFLECTION) + ((calcMagazines * TOKEN_COSTS.MAGAZINE_ISSUE) / 12);

    let plan = 'Essæntial (or Free)';
    if (needed > 12000) {
        plan = 'Lægacy (High Usage)';
    } else if (needed > 8000) {
        plan = 'Lægacy';
    } else if (needed > 4000) {
        plan = 'Fæmily Plus';
    } else if (needed > 0) {
        plan = 'Fæmily';
    }

    return { monthlyTokensNeeded: needed, recommendedPlan: plan };
  }, [calcVideos, calcMagazines]);

  const prices = {
      monthly: { essæntial: 9, fæmily: 15, familyPlus: 25, legacy: 45 },
      yearly: { essæntial: 90, fæmily: 150, familyPlus: 250, legacy: 450 }
  };

  const tokenTooltipText = "Tokæn fuel advanced AI creations like:\n• Living Photo animations\n• AI Video Reflections\n• Mægazine design\n• Biografær sessions\n• Bulk Upload analysis";

  const socialProofData = [
    {
      name: 'Sarah K.',
      age: 45,
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=800',
      statement: "Using the Biografær with my dad was life-changing. æternacy's AI guided him through stories I'd never heard. We now have a 'living biography' my children will cherish forever."
    },
    {
      name: 'David Garcia',
      age: 38,
      image: 'https://images.pexels.com/photos/2253879/pexels-photo-2253879.jpeg?auto=compress&cs=tinysrgb&w=800',
      statement: "The Fæmily Storyline is incredible. My wife and I add moments, my parents in Spain add theirs, and æternacy weaves it all into one timeline. It has closed the distance between us."
    },
    {
      name: 'Chloe T.',
      age: 28,
      image: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=800',
      statement: "The 'Sunday Dinner' ritual has become a tradition. Every week, we all add a photo. At the end of the month, æterny weaves it into a beautiful story of our time together. It's so much more than a photo album."
    }
  ];

  useEffect(() => {
    const fetchImages = async () => {
        /* User has provided specific images for the main slideshow. Disabling dynamic fetch to ensure they are used.
        const bgPhotos = await fetchPexelsImages('intimate personal memory', 5, 'landscape');
        if (bgPhotos.length > 0) {
            setLandingBackgrounds(bgPhotos.map((photo, index) => ({
                url: photo.src.large2x,
                title: staticBackgrounds[index].title,
                description: photo.alt || staticBackgrounds[index].description
            })));
        }
        */
        
        // This part fetches images for the "Journey" scrollytelling section, which is separate from the main slideshow.
        const capturePhotoPromise = fetchPexelsImages('person joyfully capturing sunset phone', 1, 'landscape');
        const curatePhotoPromise = fetchPexelsImages('artist desk scattered photos tablet creative', 1, 'landscape');
        const relivePhotoPromise = fetchPexelsImages('multi-generational family laughing together watching slideshow', 1, 'landscape');
        const sharePhotoPromise = fetchPexelsImages('two friends laughing looking at smartphone', 1, 'landscape');
        const preservePhotoPromise = fetchPexelsImages('close-up hands placing vintage photo keepsake box', 1, 'landscape');

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
        const journeySection = document.getElementById('journey-section');
        if (!journeySection || window.innerWidth < 768) {
            // If on mobile or section not found, don't run scrollytelling logic
            return;
        }
        let currentStep = -1; // Start at -1 so nothing is active initially
        for (let i = 0; i < journeyStepRefs.current.length; i++) {
            const ref = journeyStepRefs.current[i];
            if (ref) {
                const { top } = ref.getBoundingClientRect();
                 if (top < window.innerHeight * 0.55 && top > window.innerHeight * -0.15) {
                    currentStep = i;
                    break;
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
             <p className="text-xs text-slate-400 mt-2" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>The AI-powered memory experience.</p>
          </div>
           <div className="absolute bottom-10 left-10 z-10 text-left text-white max-w-sm hidden md:block">
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
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-brand">Your Story, Fortified.</h2>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-16">
                    Discover how æternacy protects your data in our <button onClick={() => onNavigate(Page.TrustCenter)} className="text-cyan-400 hover:underline">Trust Center</button>.
                </p>
                <div className="flex items-center justify-center gap-8 md:gap-12">
                    <IsoBadge title="ISO" description="ISO/IEC 27001 Certified for Information Security Management" className="w-16 h-16" />
                    <IsoBadge title="GDPR" description="General Data Protection Regulation Compliant" className="w-16 h-16" />
                    <IsoBadge title="SOC 2" description="SOC 2 Type II Audited for Security & Availability" className="w-16 h-16" />
                </div>
            </div>
        </section>

        {/* Scrollytelling Section */}
        <section id="journey-section" className="py-20 md:py-32 bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-32">
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-brand">Your Story's Journey</h2>
                    <p className="text-lg md:text-xl text-slate-300 mt-4">
                        From fleeting moments to an enduring legacy, see how æternacy brings your story to life.
                    </p>
                </div>
                
                {/* Desktop Scrollytelling */}
                <div className="hidden md:grid grid-cols-2 gap-16 md:gap-24">
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
                    <div className="relative" style={{ height: `${journeySteps.length * 90}vh` }}>
                        {journeySteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div 
                                    key={index} 
                                    ref={el => { journeyStepRefs.current[index] = el; }}
                                    className="h-[90vh] flex items-center"
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

                {/* Mobile Stacked Layout */}
                <div className="grid grid-cols-1 gap-16 md:hidden">
                    {journeySteps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="flex flex-col gap-8 text-center">
                                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl mx-auto max-w-lg">
                                    <img
                                        src={featureImages[index]}
                                        alt={step.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className={`inline-flex items-center gap-4 mb-4`}>
                                        <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                                            <Icon className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white font-brand">{step.title}</h3>
                                    </div>
                                    <p className="text-lg text-slate-300 max-w-lg mx-auto">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 md:py-32 bg-slate-900">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white font-brand text-center mb-12">Stories of æternacy</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {socialProofData.map((testimonial, index) => (
                <div key={index} className="bg-slate-800/50 p-6 rounded-2xl ring-1 ring-white/10 flex flex-col">
                  <p className="text-slate-300 text-lg flex-grow italic">"{testimonial.statement}"</p>
                  <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className="text-sm text-slate-400">æternacy user, age {testimonial.age}</p>
                    </div>
                  </div>
                </div>
              ))}
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
                
                {/* Pricing Cards */}
                 <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {/* Free Plan */}
                    <div className="bg-slate-800 p-8 rounded-2xl ring-1 ring-white/10 flex flex-col">
                        <h3 className="text-2xl font-bold font-brand text-white">Free</h3>
                        <p className="text-slate-400 mb-6">Start your journey.</p>
                        <p className="text-4xl font-bold text-white mb-2">€0</p>
                        <p className="text-sm text-slate-500 mb-2">&nbsp;</p>
                        <ul className="space-y-3 text-slate-300 text-sm mb-8 flex-grow">
                            <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 100 Momænts</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Basic AI Tagging</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 1 User Only</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Private Sharing</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 1 free AI Video creation</li>
                        </ul>
                        <button onClick={onRegister} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full transition-colors">Start for Free</button>
                    </div>

                    {/* Essæntial Plan */}
                    <div className="bg-slate-800 p-8 rounded-2xl ring-1 ring-white/10 flex flex-col">
                        <h3 className="text-2xl font-bold font-brand text-white">Essæntial</h3>
                        <p className="text-slate-400 mb-6">For every beginning.</p>
                        <p className="text-4xl font-bold text-white mb-2">€{prices[billingCycle].essæntial}<span className="text-base font-normal text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span></p>
                        <p className="text-sm text-slate-500 mb-2">{billingCycle === 'yearly' ? `€${(prices.yearly.essæntial / 12).toFixed(2)}/month equivalent` : ' '}</p>
                        <p className="text-sm font-semibold text-cyan-300 text-center mb-4">Includes a 30-day free trial</p>
                        <ul className="space-y-3 text-slate-300 text-sm mb-8 flex-grow">
                            <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Unlimited Momænts</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Advanced AI Storytelling</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Full Creation Suite access</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 1 User</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/>
                                <div className="flex items-center gap-1.5">
                                    <span>10 Free 'Living Photo' animations/month</span>
                                </div>
                            </li>
                        </ul>
                        <button onClick={onRegister} className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 rounded-full transition-colors">Start 30-Day Free Trial</button>
                    </div>

                    {/* Fæmily Plan */}
                    <div className="bg-slate-800 p-8 rounded-2xl ring-2 ring-indigo-500 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">POPULAR</div>
                        <h3 className="text-2xl font-bold font-brand text-indigo-300">Fæmily</h3>
                        <p className="text-slate-400 mb-6">Weave your stories together.</p>
                        <p className="text-4xl font-bold text-white mb-2">€{prices[billingCycle].fæmily}<span className="text-base font-normal text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span></p>
                        <p className="text-sm text-slate-500 mb-2">{billingCycle === 'yearly' ? `€${(prices.yearly.fæmily / 12).toFixed(2)}/month equivalent` : ' '}</p>
                        <ul className="space-y-3 text-slate-300 text-sm flex-grow">
                            <li className="flex gap-2">
                                <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"/>
                                <div>
                                    <strong className="text-white">UNLIMITED Momænts</strong>
                                </div>
                            </li>
                            <li className="flex gap-2 items-start">
                                <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"/>
                                <div>
                                    <strong className="text-white">Up to 5 Family Members</strong>
                                </div>
                            </li>
                             <li className="flex gap-2 items-start">
                                <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"/>
                                <div>
                                    <strong className="text-white">Fæmily Rituals</strong>
                                    <ul className="mt-1 space-y-1 text-slate-400">
                                        <li className="flex gap-2 italic text-slate-500 pl-5"><CalendarClock className="w-3 h-3 text-indigo-400/70 flex-shrink-0 mt-1 transform -ml-5" /> e.g., A 'Sunday Dinner' ritual to build a weekly tradition.</li>
                                    </ul>
                                </div>
                            </li>
                            <li className="flex gap-2 items-start">
                                <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"/>
                                <div>
                                    <strong className="text-white">Shared Fæmily Storyline</strong>
                                     <ul className="mt-1 space-y-1 text-slate-400">
                                        <li className="flex gap-2 italic text-slate-500 pl-5"><GitBranch className="w-3 h-3 text-indigo-400/70 flex-shrink-0 mt-1 transform -rotate-90 -ml-5" /> e.g., Mom adds a reflection, æterny weaves it into the shared story.</li>
                                    </ul>
                                </div>
                            </li>
                            <li className="flex gap-2 items-start">
                                <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"/>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <strong className="text-white">4,000 Pooled Tokæn/month</strong>
                                        <Tooltip text={tokenTooltipText} position="top">
                                            <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                                        </Tooltip>
                                    </div>
                                </div>
                            </li>
                        </ul>
                         <div className="mt-8">
                            <button onClick={onRegister} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-full transition-colors">Choose Fæmily</button>
                        </div>
                    </div>
                    
                    {/* Fæmily Plus Plan */}
                    <div className="bg-slate-800 p-8 rounded-2xl ring-2 ring-teal-500 flex flex-col">
                        <h3 className="text-2xl font-bold font-brand text-teal-300">Fæmily Plus</h3>
                        <p className="text-slate-400 mb-6">For larger families & archives.</p>
                        <p className="text-4xl font-bold text-white mb-2">€{prices[billingCycle].familyPlus}<span className="text-base font-normal text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span></p>
                        <p className="text-sm text-slate-500 mb-2">{billingCycle === 'yearly' ? `€${(prices.yearly.familyPlus / 12).toFixed(2)}/month equivalent` : ' '}</p>
                        <ul className="space-y-3 text-slate-300 text-sm mb-8 flex-grow">
                            <li className="font-semibold text-slate-200">Everything in Fæmily, plus:</li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-teal-400 flex-shrink-0"/> Up to <strong>10 family members</strong></li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-teal-400 flex-shrink-0"/>
                                <div className="flex items-center gap-1.5">
                                    <span><strong>8,000</strong> Pooled Tokæn/month</span>
                                    <Tooltip text={tokenTooltipText} position="top"><HelpCircle className="w-4 h-4 text-slate-500 cursor-help" /></Tooltip>
                                </div>
                            </li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-teal-400 flex-shrink-0"/> Interactive <strong className="text-teal-300">Fæmily Tree</strong></li>
                            <li className="flex gap-2"><Check className="w-5 h-5 text-teal-400 flex-shrink-0"/> Priority Support</li>
                        </ul>
                        <button onClick={onRegister} className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-full transition-colors mt-auto">Choose Fæmily Plus</button>
                    </div>

                    {/* Lægacy Plan */}
                    <div className="bg-slate-800 p-8 rounded-2xl ring-2 ring-amber-500 flex flex-col">
                        <h3 className="text-2xl font-bold font-brand text-amber-300">Lægacy</h3>
                        <p className="text-slate-400 mb-6">For your timeless story.</p>
                        <p className="text-4xl font-bold text-white mb-2">€{prices[billingCycle].legacy}<span className="text-base font-normal text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span></p>
                        <p className="text-sm text-slate-500 mb-2">{billingCycle === 'yearly' ? `€${(prices.yearly.legacy / 12).toFixed(2)}/month equivalent` : ' '}</p>
                        <ul className="space-y-3 text-slate-300 text-sm mb-8 flex-grow">
                             <li className="font-semibold text-slate-200">Everything in Fæmily Plus, plus:</li>
                             <li className="flex gap-2"><Check className="w-5 h-5 text-amber-400 flex-shrink-0"/> <strong>Unlimited members</strong></li>
                             <li className="flex gap-2 items-start">
                                <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
                                <div>
                                    <strong className="text-white">Digital Inheritance Tools</strong>
                                    <ul className="mt-1 space-y-1 text-slate-400">
                                        <li className="flex gap-2 italic text-slate-500 pl-5"><GitBranch className="w-3 h-3 text-amber-400/70 flex-shrink-0 mt-1 transform -rotate-90 -ml-5" /> Answer: "How do my kids access this after I'm gone?"</li>
                                    </ul>
                                </div>
                            </li>
                             <li className="flex gap-2 items-start">
                                <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
                                <div>
                                    <strong className="text-white">Full Creation Suite</strong>
                                    <ul className="mt-1 space-y-1 text-slate-400">
                                      <li className="flex gap-2 italic text-slate-500 pl-5"><ArrowRight className="w-3 h-3 text-amber-400/70 flex-shrink-0 mt-1 transform -ml-5" /> Includes The Biografær & annual credits</li>
                                    </ul>
                                </div>
                            </li>
                             <li className="flex gap-2"><Check className="w-5 h-5 text-amber-400 flex-shrink-0"/>
                                <div className="flex items-center gap-1.5">
                                    <span>12,000 Tokæn/month</span>
                                    <Tooltip text={tokenTooltipText} position="top">
                                        <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                                    </Tooltip>
                                </div>
                            </li>
                        </ul>
                        <button onClick={onRegister} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-full transition-colors">Choose Lægacy</button>
                    </div>
                </div>
            </div>
        </section>

        {/* Token Calculator Section */}
        <section className="py-20 md:py-32 bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-brand">What are Tokæn?</h2>
                    <p className="text-lg md:text-xl text-slate-300 mt-4">
                        Tokæn fuel your most ambitious creations. See what's possible with each plan and estimate your own usage.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
                    <div className="bg-slate-800 p-8 rounded-2xl ring-1 ring-white/10">
                        <h3 className="text-2xl font-bold font-brand text-white text-center mb-6">Estimate Your Needs</h3>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="video-slider" className="flex justify-between text-sm font-medium text-slate-300">
                                    <span>AI Video Reflections / month</span>
                                    <span className="font-bold text-white">{calcVideos}</span>
                                </label>
                                <input id="video-slider" type="range" min="0" max="20" value={calcVideos} onChange={e => setCalcVideos(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2"/>
                            </div>
                            <div>
                                <label htmlFor="magazine-slider" className="flex justify-between text-sm font-medium text-slate-300">
                                    <span>Mægazine Issues / year</span>
                                    <span className="font-bold text-white">{calcMagazines}</span>
                                </label>
                                <input id="magazine-slider" type="range" min="0" max="12" value={calcMagazines} onChange={e => setCalcMagazines(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2"/>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-slate-700 pt-6 text-center">
                            <p className="text-sm text-slate-400">Estimated Monthly Tokæn Usage:</p>
                            <p className="text-4xl font-bold text-cyan-400 font-mono my-2">{Math.ceil(monthlyTokensNeeded).toLocaleString()}</p>
                             <div className={`mt-4 p-4 rounded-lg border-2 transition-all ${
                                recommendedPlan.startsWith('Lægacy') ? 'border-amber-500 bg-amber-500/10' :
                                recommendedPlan.startsWith('Fæmily') ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700'
                            }`}>
                                <p className="font-semibold text-white">Recommended Plan:</p>
                                <h4 className={`text-2xl font-bold font-brand ${
                                    recommendedPlan.startsWith('Lægacy') ? 'text-amber-300' :
                                    recommendedPlan.startsWith('Fæmily') ? 'text-indigo-300' : 'text-white'
                                }`}>
                                    {recommendedPlan}
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-800 p-8 rounded-2xl ring-1 ring-indigo-500/30 h-full">
                            <h3 className="text-2xl font-bold font-brand text-indigo-300">Fæmily Plan Example</h3>
                            <p className="text-slate-400 mb-4 text-sm">A typical monthly usage with <strong>4,000 Tokæn</strong> could include:</p>
                            <ul className="space-y-3 text-slate-300 text-sm">
                                <li className="flex gap-3"><span className="font-mono text-indigo-300 w-16 text-right">1,200</span> <span>2 cinematic video reflections</span></li>
                                <li className="flex gap-3"><span className="font-mono text-indigo-300 w-16 text-right">1,000</span> <span>5 "living photo" animations</span></li>
                                <li className="flex gap-3"><span className="font-mono text-indigo-300 w-16 text-right">1,000</span> <span>10 AI-narrated photo stories</span></li>
                                <li className="flex gap-3 border-t border-slate-700 pt-3 mt-3"><span className="font-mono text-slate-400 w-16 text-right">800</span> <span>Tokæn remaining for more creations!</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-32 bg-slate-900">
            <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold text-white font-brand text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqData.map((faq, index) => (
                        <div key={index} className="bg-slate-800/50 rounded-lg">
                            <button
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="w-full flex justify-between items-center p-6 text-left"
                            >
                                <span className="font-semibold text-white">{faq.question}</span>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                            </button>
                            {openFaq === index && (
                                <div className="px-6 pb-6 text-slate-300">
                                    <p>{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>

      </main>
      
      <footer className="bg-slate-800/50 py-8">
        <div className="container mx-auto px-6 text-center text-slate-400">
          <div className="flex justify-center gap-6 mb-4">
              <button onClick={() => onNavigate(Page.About)} className="hover:text-white transition-colors">About</button>
              <button onClick={() => onNavigate(Page.Journal)} className="hover:text-white transition-colors">Journal</button>
              <button onClick={() => onNavigate(Page.TrustCenter)} className="hover:text-white transition-colors">Trust Center</button>
              <button onClick={() => onNavigate(Page.Gift)} className="hover:text-white transition-colors">Gift a Legacy</button>
              <button className="hover:text-white transition-colors">Contact</button>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} æternacy™. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;