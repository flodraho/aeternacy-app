
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Combine, ShieldOff, Lock, Infinity as InfinityIcon, Camera, Wand2, Film, Users, ChevronDown, Check, HelpCircle, ArrowDown, Zap, BookOpen, HardDrive, Sparkles, Calculator } from 'lucide-react';
import { Page } from '../types';
import { TOKEN_COSTS } from '../services/costCatalog';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
    onSkipForDemo: () => void;
    onNavigate: (page: Page) => void;
    onStartDemo: () => void;
}

const staticBackgrounds = [
    {
        // Image: Atmospheric forest path (Symbolizing the journey of life)
        url: 'https://images.pexels.com/photos/1528660/pexels-photo-1528660.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
        title: 'A Journey Begins',
        description: 'Every path holds a new story, a new adventure waiting to be written into your legacy.'
    },
    {
        // Image: Aurora/Starry night (Symbolizing wonder and timelessness)
        url: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
        title: 'The Dawn of a Memory',
        description: 'Sunrise paints the sky, a reminder that every day is a fresh canvas for unforgettable moments.'
    },
    {
        // Image: Majestic Mountain (Symbolizing endurance and legacy)
        url: 'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
        title: 'Reflection and Peace',
        description: 'In stillness, we find clarity. Cherish the quiet moments that shape our inner world.'
    },
    {
        // Image: Moody Ocean (Symbolizing depth of emotion)
        url: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
        title: 'Navigating Life\'s Tides',
        description: 'Like a lighthouse, our cherished memories guide us through the darkest storms.'
    },
    {
        // Image: River/Flow (Symbolizing the timestream)
        url: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
        title: 'The Continuous Stream',
        description: 'Moments flow together to create the river of your life story.'
    }
];

// Augmented journey steps with static, reliable images
const journeySteps = [
  {
    id: 'capture',
    icon: Camera,
    title: 'Capture',
    subtitle: 'Preserve the Raw Moment',
    description: 'Effortlessly add photos, record voice notes, or jot down thoughts. Whether it’s a grand milestone or a quiet morning coffee, capture the essence as it happens.',
    image: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' // Camera/Phone taking photo
  },
  {
    id: 'curate',
    icon: Wand2,
    title: 'Curate',
    subtitle: 'AI-Powered Storytelling',
    description: 'æterny, your AI curator, analyzes your uploads. It finds the best shots, writes beautiful narratives, and organizes chaos into meaningful chapters.',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' // Designing/Editing
  },
  {
    id: 'relive',
    icon: Film,
    title: 'Relive',
    subtitle: 'Cinema-Quality Reflection',
    description: 'Turn static images into living memories. Experience your timestream through narrated stories, dynamic slideshows, and AI-generated video scenes.',
    image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' // Projector/Watching
  },
  {
    id: 'share',
    icon: Users,
    title: 'Share',
    subtitle: 'Connect Generations',
    description: 'Invite family to contribute to a shared timeline. Watch as individual perspectives weave together into a rich, collective family history.',
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' // Family sharing
  },
  {
    id: 'preserve',
    icon: Lock,
    title: 'Preserve',
    subtitle: 'The Lægacy Vault',
    description: 'Secure your story for the future. Appoint stewards, create time capsules, and ensure your legacy outlasts digital obsolescence.',
    image: 'https://images.pexels.com/photos/3772612/pexels-photo-3772612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' // Old photos/preservation
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


const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, onSkipForDemo, onNavigate, onStartDemo }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [landingBackgrounds] = useState(staticBackgrounds);
  
  // Scrollytelling State
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);
  const journeyStepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const prices = {
      monthly: { essential: "4.99", family: "14.99", legacy: "29.99" },
      yearly: { essential: "49.90", family: "149.90", legacy: "299.90" }
  };

  const testimonials = [
    {
      quote: "Using the Biografær with my dad was life-changing. æternacy's AI guided him through stories I'd never heard. We now have a 'living biography' my children will cherish forever.",
      name: "Sarah K.",
      role: "AETERNACY USER, AGE 45",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      quote: "The Fæmily Storyline is incredible. My wife and I add moments, my parents in Spain add theirs, and æternacy weaves it all into one timeline. It has closed the distance between us.",
      name: "David Garcia",
      role: "AETERNACY USER, AGE 38",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      quote: "The 'Sunday Dinner' ritual has become a tradition. Every week, we all add a photo. At the end of the month, æterny weaves it into a beautiful story of our time together. It's so much more than a photo album.",
      name: "Chloe T.",
      role: "AETERNACY USER, AGE 28",
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  useEffect(() => {
    if (landingBackgrounds.length === 0) return;
    const timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % landingBackgrounds.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, [landingBackgrounds]);
  
  // Robust IntersectionObserver for Desktop Scrollytelling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = journeyStepRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setActiveJourneyStep(index);
            }
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '-40% 0px -40% 0px', // Trigger only when the element is in the middle 20% of the screen
        threshold: 0 // Trigger as soon as one pixel enters the rootMargin
      }
    );

    journeyStepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
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
          {/* Removed Enter Demo Space button for cleaner UI */}
          <button onClick={onLogin} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-2 px-6 rounded-full text-sm transition-all">
              Login
          </button>
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
                    Create Free Account
                </button>
                <button onClick={onStartDemo} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 w-full sm:w-auto">
                    Try a Live Demo
                </button>
            </div>
             <p className="text-xs text-slate-400 mt-4" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>The AI-powered memory experience.</p>
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
                        <InfinityIcon className="w-6 h-6 text-cyan-400" />
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

        {/* Cinematic Scrollytelling Section - Rebuilt for Stability */}
        <section ref={scrollSectionRef} className="bg-slate-950 relative min-h-[500vh]">
            <div className="container mx-auto px-6">
                
                {/* Section Header */}
                <div className="text-center pt-24 pb-20">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-xs font-bold tracking-widest uppercase mb-6 ring-1 ring-white/20">
                        How it Works
                    </span>
                    <h2 className="text-4xl md:text-6xl font-bold text-white font-brand">From Moment to Legacy</h2>
                    <p className="text-lg text-slate-400 mt-4 max-w-2xl mx-auto font-light">
                        A seamless journey designed to turn your life's fragments into a cohesive, timeless story.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row relative">
                    
                    {/* Left Column: Sticky Visuals (Desktop) */}
                    <div className="hidden lg:block lg:w-1/2 relative">
                        <div className="sticky top-0 h-screen flex items-center justify-center">
                            {/* Image Deck */}
                            <div className="relative w-full max-w-lg aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10 group">
                                {journeySteps.map((step, index) => {
                                    const isActive = activeJourneyStep === index;
                                    return (
                                        <div 
                                            key={index}
                                            className={`absolute inset-0 transition-all duration-700 ease-in-out ${isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'}`}
                                        >
                                            <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                                            
                                            {/* Dynamic Badge */}
                                            <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full backdrop-blur-md border transition-all duration-700 delay-300 ${isActive ? 'bg-cyan-500/20 border-cyan-400/50 translate-y-0 opacity-100' : 'bg-black/50 border-white/10 -translate-y-4 opacity-0'}`}>
                                                <span className="text-xs font-bold uppercase tracking-wider text-white">Step 0{index + 1}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Scrollable Narrative */}
                    <div className="w-full lg:w-1/2 lg:pl-24 pb-40">
                        {journeySteps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = activeJourneyStep === index;
                            
                            return (
                                <div 
                                    key={index}
                                    ref={el => { journeyStepRefs.current[index] = el; }}
                                    className={`min-h-[80vh] flex flex-col justify-center transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4 grayscale'}`}
                                >
                                    {/* Mobile Visual (Visible only on small screens) */}
                                    <div className="lg:hidden w-full aspect-video rounded-xl overflow-hidden shadow-xl border border-white/10 mb-8">
                                        <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex gap-6 items-start relative">
                                        {/* Connecting Line */}
                                        {index !== journeySteps.length - 1 && (
                                            <div className="absolute left-[27px] top-16 bottom-[-80vh] w-0.5 bg-gradient-to-b from-cyan-500 via-slate-800 to-slate-800 opacity-30 hidden lg:block"></div>
                                        )}

                                        <div className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-110' : 'bg-slate-800 text-slate-500 ring-1 ring-white/10 scale-100'}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>

                                        <div className="pt-2">
                                            <h3 className={`text-3xl font-bold font-brand mb-2 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.title}</h3>
                                            <h4 className={`text-lg font-semibold mb-4 uppercase tracking-widest text-xs transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`}>{step.subtitle}</h4>
                                            <p className={`text-lg leading-relaxed max-w-md transition-colors duration-300 ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>

        {/* Stories of æternacy Section (Social Proof) */}
        <section className="py-20 md:py-32 bg-slate-900">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white font-brand text-center mb-16">Stories of æternacy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((item, index) => (
                <div key={index} className="flex flex-col h-full p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 backdrop-blur-sm">
                  <div className="mb-8 flex-grow">
                    <p className="font-brand text-lg md:text-xl text-slate-300 italic leading-relaxed">"{item.quote}"</p>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10" />
                    <div>
                      <p className="font-bold text-white text-base">{item.name}</p>
                      <p className="text--[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing-section" className="py-20 md:py-32 bg-slate-950">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold text-white font-brand mb-4">Find Your Plan</h2>
                    <p className="text-lg md:text-xl text-slate-400 font-light">
                        Choose the plan that fits your story.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center items-center mb-16 relative z-10">
                    <div className="relative inline-flex bg-slate-800 rounded-full p-1 items-center ring-1 ring-white/10">
                        <div 
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full transition-all duration-300 shadow-sm ${billingCycle === 'monthly' ? 'left-1' : 'left-[50%]'}`}
                        />
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`relative z-10 px-8 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400 hover:text-white'}`}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setBillingCycle('yearly')}
                            className={`relative z-10 px-8 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400 hover:text-white'}`}
                        >
                            Yearly
                        </button>
                        
                        {/* Discount Badge */}
                        <div className="absolute -top-4 -right-4 z-20">
                            <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-1 rounded-full shadow-lg transform rotate-12 border-2 border-slate-900">
                                2 months free
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Pricing Cards Grid - 3 Columns */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
                    
                    {/* Essæntial Plan */}
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl flex flex-col h-full hover:border-cyan-900/50 transition-colors relative overflow-hidden">
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold font-brand text-white">Essæntial</h3>
                            <p className="text-slate-400 text-sm mt-2">For every beginning.</p>
                        </div>
                        <div className="mb-8">
                            <p className="text-5xl font-bold text-white">€{prices[billingCycle].essential}<span className="text-lg font-normal text-slate-500">/mo</span></p>
                        </div>
                        <ul className="space-y-4 text-slate-300 text-sm mb-10 flex-grow">
                            <li className="flex gap-3"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 30-day free trial</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Unlimited Momænts</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Advanced AI Storytelling</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Full Creation Suite access</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 1 User</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 10 Free 'Living Photo' animations/month</li>
                        </ul>
                        <button onClick={onRegister} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 rounded-xl text-base transition-colors shadow-lg shadow-cyan-500/20">Start 30-Day Free Trial</button>
                    </div>

                    {/* Fæmily Plan (Combined) */}
                    <div className="bg-slate-800/80 border border-indigo-500 p-8 rounded-3xl flex flex-col h-full relative transform md:-translate-y-4 shadow-2xl shadow-indigo-500/20 z-10">
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold font-brand text-indigo-300">Fæmily</h3>
                            <p className="text-slate-400 text-sm mt-2">Weave your stories together.</p>
                        </div>
                        <div className="mb-8">
                            <p className="text-5xl font-bold text-white">€{prices[billingCycle].family}<span className="text-lg font-normal text-slate-500">/mo</span></p>
                        </div>
                        <ul className="space-y-4 text-slate-300 text-sm mb-10 flex-grow">
                            <li className="flex gap-3"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0"/> UNLIMITED Momænts</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0"/> Up to 10 Family Members</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0"/> Shared Fæmily Storyline</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0"/> Interactive Fæmily Tree</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0"/> 8,000 Pooled Tokæn/month</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0"/> Priority Support</li>
                        </ul>
                        <button onClick={onRegister} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl text-base transition-colors shadow-lg shadow-indigo-500/30">Upgrade to Fæmily</button>
                    </div>
                    
                    {/* Lægacy Plan */}
                    <div className="bg-slate-900 border border-amber-500 p-8 rounded-3xl flex flex-col h-full hover:shadow-amber-500/10 hover:shadow-2xl transition-all">
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold font-brand text-amber-400">Lægacy</h3>
                            <p className="text-slate-400 text-sm mt-2">For your timeless story.</p>
                        </div>
                        <div className="mb-8">
                            <p className="text-5xl font-bold text-white">€{prices[billingCycle].legacy}<span className="text-lg font-normal text-slate-500">/mo</span></p>
                        </div>
                        <ul className="space-y-4 text-slate-300 text-sm mb-10 flex-grow">
                             <li className="flex gap-3"><Check className="w-5 h-5 text-amber-400 flex-shrink-0"/> Everything in Fæmily, plus:</li>
                             <li className="flex gap-3"><Check className="w-5 h-5 text-amber-400 flex-shrink-0"/> Unlimited members</li>
                             <li className="flex gap-3"><Check className="w-5 h-5 text-amber-400 flex-shrink-0"/> Digital Inheritance Tools</li>
                             <li className="flex gap-3"><Check className="w-5 h-5 text-amber-400 flex-shrink-0"/> Full Creation Suite</li>
                             <li className="flex gap-3"><Check className="w-5 h-5 text-amber-400 flex-shrink-0"/> 12,000 Tokæn/month</li>
                             <li className="flex gap-3"><Check className="w-5 h-5 text-amber-400 flex-shrink-0"/> Curation Concierge Access</li>
                        </ul>
                        <button onClick={onRegister} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 rounded-xl text-base transition-colors shadow-lg shadow-amber-500/20">Become a Member</button>
                    </div>
                </div>
            </div>
        </section>

        {/* Conceptual Token Section - Replaces detailed calculator */}
        <section className="py-20 md:py-32 bg-slate-900 border-t border-white/5 relative overflow-hidden">
             {/* Background glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-900/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-8 ring-1 ring-cyan-500/20">
                    <Zap className="w-3 h-3" fill="currentColor"/> Creative Energy
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white font-brand mb-6">Tokæn: Fuel for Your Imagination.</h2>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                    We believe in transparent, sustainable AI. Instead of hidden limits, we use **Tokæn**—a renewable monthly energy source for high-end creations.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
                     <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5">
                        <Film className="w-10 h-10 text-indigo-400 mx-auto mb-4"/>
                        <h3 className="text-white font-bold mb-2">Cinematic Video</h3>
                        <p className="text-slate-400 text-sm">Turn static moments into moving, narrated films.</p>
                     </div>
                     <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5">
                        <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-4"/>
                        <h3 className="text-white font-bold mb-2">Living Photos</h3>
                        <p className="text-slate-400 text-sm">Add subtle, magical motion to your best shots.</p>
                     </div>
                     <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5">
                        <BookOpen className="w-10 h-10 text-amber-400 mx-auto mb-4"/>
                        <h3 className="text-white font-bold mb-2">Printed Memories</h3>
                        <p className="text-slate-400 text-sm">Generate layouts for magazines and photobooks.</p>
                     </div>
                </div>
                
                <p className="text-slate-500 text-sm mt-12">
                    Every plan comes with a monthly Tokæn allowance. Need more? You can top up anytime.
                </p>
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
              <button onClick={() => onNavigate(Page.Articles)} className="hover:text-white transition-colors">Journal</button>
              <button onClick={() => onNavigate(Page.TrustCenter)} className="hover:text-white transition-colors">Trust Center</button>
              <button className="hover:text-white transition-colors">Contact</button>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} æternacy™. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
