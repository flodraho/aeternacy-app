
import React, { useState, useEffect, useRef } from 'react';
import { Page, UserTier, TokenState } from '../types';
import { MoreVertical, Search, User, BarChart, UploadCloud, Mic, Wand2, Users, BookOpen, Film, BrainCircuit, Info, CreditCard, ShoppingBag, Headset, FilePenLine, LayoutGrid, ChevronDown, Zap, Clock, GitBranch, CalendarClock } from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';
import Tooltip from './Tooltip';
import LogoIcon from './icons/LogoIcon';

type SpaceContext = 'personal' | 'family' | 'legacy' | null;

interface HeaderProps {
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    currentPage: Page;
    userTier: UserTier;
    profilePic: string | null;
    spaceContext: SpaceContext;
    tokenState: TokenState;
}

const navStructure = [
    {
        title: 'Create',
        items: [
            { page: Page.Create, icon: UploadCloud, title: 'Upload Momænt', description: 'Craft a story from new photos & videos.' },
            { page: Page.Record, icon: Mic, title: 'Capture Momænt', description: 'Record an experience as it happens.' },
            { page: Page.SmartCollection, icon: Wand2, title: 'From Existing', description: 'Let æterny find themes in your timestream.' }
        ]
    },
    {
        title: 'Curate',
        items: [
            { page: Page.Moments, icon: LayoutGrid, title: 'My Collection', description: 'View, combine, and reflect on your story.' },
            { page: Page.Curate, icon: FilePenLine, title: 'Curætion Workspace', description: 'Refine and enhance a specific momænt.' },
            { page: Page.FamilyRituals, icon: CalendarClock, title: 'Fæmily Rituals', description: 'Create and participate in family traditions.'},
            { page: Page.DataInsight, icon: BarChart, title: 'Data Insights', description: 'Discover patterns in your life\'s journey.' }
        ]
    },
    {
        title: 'Preserve',
        items: [
            { page: Page.FamilySpace, icon: Users, title: 'Fæmily Space', description: 'Share and collaborate on your family\'s story.' },
            { page: Page.LegacySpace, icon: LegacyIcon, title: 'Lægacy Space', description: 'Ensure your story endures for generations.' },
            { page: Page.Magazine, icon: BookOpen, title: 'Mægazine Studio', description: 'Design and publish beautiful magazines.' },
            { page: Page.Biografer, icon: Headset, title: 'The Biografær', description: 'Build a life story through AI interviews.' },
            { page: Page.VRLab, icon: BrainCircuit, title: 'VR Lab', description: 'Step into your memories. (Vision)' }
        ]
    }
];

const NavDropdown: React.FC<{
  title: string;
  items: { page: Page; title: string; description: string; icon: React.ElementType; }[];
  onNavigate: (page: Page) => void;
  currentPage: Page;
}> = ({ title, items, onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const isAnyActive = items.some(item => item.page === currentPage);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 200); // A small delay to allow moving mouse to dropdown
  };


  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isAnyActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-72 bg-slate-800 rounded-xl shadow-lg p-2 ring-1 ring-white/10 z-10 animate-fade-in" style={{animationDuration: '150ms'}}>
          <div className="space-y-1">
            {items.map(item => {
              const Icon = item.icon;
              const iconColor = {
                [Page.LegacySpace]: 'text-amber-400',
                [Page.FamilySpace]: 'text-indigo-400',
                [Page.FamilyTree]: 'text-indigo-400',
                [Page.FamilyRituals]: 'text-indigo-400',
                [Page.VRLab]: 'text-purple-400',
              }[item.page] || 'text-cyan-400';

              return (
                <button 
                  key={item.title} 
                  onClick={() => { onNavigate(item.page); setIsOpen(false); }} 
                  className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                  <div>
                    <p className="font-semibold text-white text-sm">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


const contextConfig: { [key in NonNullable<SpaceContext>]: { icon: React.ElementType, text: string, className: string } } = {
    personal: { icon: User, text: 'Personal', className: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/30' },
    family: { icon: Users, text: 'Fæmily', className: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/30' },
    legacy: { icon: LegacyIcon, text: 'Lægacy', className: 'bg-amber-500/10 text-amber-300 ring-amber-500/30' }
};

const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout, currentPage, userTier, profilePic, spaceContext, tokenState }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { balance, monthlyAllocation, freeHeaderAnimations } = tokenState;
    const isCritical = userTier !== 'free' && monthlyAllocation > 0 && (balance / monthlyAllocation) * 100 < 20;

    let tierColorClass: string;
    let tierTrackClass: string;

    switch (userTier) {
        case 'legacy':
            tierColorClass = 'text-amber-400';
            tierTrackClass = 'text-amber-400/40';
            break;
        case 'fæmilyPlus':
             tierColorClass = 'text-teal-400';
            tierTrackClass = 'text-teal-400/40';
            break;
        case 'fæmily':
            tierColorClass = 'text-indigo-400';
            tierTrackClass = 'text-indigo-400/40';
            break;
        case 'essæntial':
            tierColorClass = 'text-cyan-400';
            tierTrackClass = 'text-cyan-400/40';
            break;
        case 'free':
        default:
            tierColorClass = 'text-slate-400';
            tierTrackClass = 'text-slate-400/40';
            break;
    }

    let percentage = 0;
    if (userTier === 'essæntial') {
        const total = freeHeaderAnimations.total > 0 ? freeHeaderAnimations.total : 1;
        percentage = ((total - freeHeaderAnimations.used) / total) * 100;
    } else if (userTier !== 'free') {
        const total = monthlyAllocation > 0 ? monthlyAllocation : 1;
        percentage = (balance / total) * 100;
    }
    
    const displayPercentage = Math.min(100, Math.max(0, percentage));

    const radius = 19;
    const strokeWidth = 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;
    
    const ContextBadge: React.FC<{ context: SpaceContext }> = ({ context }) => {
        if (!context) return null;
        const config = contextConfig[context];
        const Icon = config.icon;
        return (
            <div className={`group flex items-center text-xs font-semibold py-1 rounded-full ring-1 ${config.className} px-2 transition-all duration-300 hover:px-3`}>
                <Icon className="w-4 h-4" />
                <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 overflow-hidden whitespace-nowrap">{config.text}</span>
            </div>
        );
    };
    
    const heroPages = [Page.Home, Page.FamilySpace, Page.LegacySpace, Page.MomentDetail];
    const isHeroPage = heroPages.includes(currentPage);
    const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        (isScrolled || !isHeroPage)
        ? 'bg-slate-900/80 backdrop-blur-sm shadow-lg'
        : 'bg-transparent'
    }`;

    return (
        <header className={headerClasses}>
            <div className="container mx-auto px-6 h-16 flex items-center relative">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate(Page.Home)} className="flex items-center text-white">
                        <LogoIcon className="w-10 h-10 text-white" />
                    </button>
                    <ContextBadge context={spaceContext} />
                    <nav className="hidden md:flex items-center gap-2 pl-4">
                        {navStructure.map(category => (
                            <NavDropdown
                                key={category.title}
                                title={category.title}
                                items={category.items}
                                onNavigate={onNavigate}
                                currentPage={currentPage}
                            />
                        ))}
                    </nav>
                </div>

                <div className="flex-grow" />

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Search memories..."
                            className={`rounded-full py-2 pl-10 pr-4 text-sm w-64 text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-400 ${
                                (isScrolled || !isHeroPage)
                                ? 'bg-slate-800 border border-slate-700 placeholder-slate-400'
                                : 'bg-white/10 border border-white/20 placeholder-slate-300 backdrop-blur-sm'
                            }`}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    {isCritical && (
                        <div className="flex items-center gap-2 bg-amber-900/50 p-1.5 pl-3 rounded-full border border-amber-500/60 shadow-lg animate-pulse">
                            <div className="flex items-center gap-1.5">
                                <Zap className={`w-4 h-4 text-amber-300`} />
                                <span className="text-white font-mono tracking-tighter text-sm font-semibold">{balance.toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={() => onNavigate(Page.Profile)}
                                className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-3 py-1 rounded-full transition-colors"
                            >
                                Refill
                            </button>
                        </div>
                    )}

                    <Tooltip text={"Profile & Settings"} position="bottom">
                        <button 
                            onClick={() => onNavigate(Page.Profile)} 
                            className="relative w-10 h-10 flex items-center justify-center rounded-full focus:outline-none"
                            aria-label="Profile, settings, and Tokæn balance"
                        >
                            {userTier !== 'free' && (
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 40">
                                    <circle
                                        className={`stroke-current ${tierTrackClass}`}
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                        r={radius}
                                        cx="20"
                                        cy="20"
                                    />
                                    <circle
                                        className={`stroke-current ${tierColorClass} transition-all duration-500`}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r={radius}
                                        cx="20"
                                        cy="20"
                                        transform="rotate(-90 20 20)"
                                    />
                                </svg>
                            )}
                            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                        </button>
                    </Tooltip>

                    <div className="relative">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                            <MoreVertical className="w-6 h-6 text-slate-300" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-white/10 z-20">
                                {/* Mobile-only nav links */}
                                <div className="md:hidden">
                                    {navStructure.map(category => (
                                        <div key={category.title} className="px-2 py-1">
                                            <h4 className="px-2 pt-2 pb-1 text-xs font-semibold text-slate-500 uppercase">{category.title}</h4>
                                            {category.items.map(item => {
                                                const Icon = item.icon;
                                                return (
                                                    <button 
                                                      key={item.title} 
                                                      onClick={() => { onNavigate(item.page); setIsDropdownOpen(false); }} 
                                                      className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-md"
                                                    >
                                                        <Icon className="w-5 h-5 text-slate-400" />
                                                        <span>{item.title}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                    <div className="border-t border-white/10 my-1"></div>
                                </div>

                                <button onClick={() => { onNavigate(Page.Profile); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <span>Profile & Settings</span>
                                </button>
                                 <button onClick={() => { onNavigate(Page.Subscription); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                    <CreditCard className="w-5 h-5 text-slate-400" />
                                    <span>Subscription & Billing</span>
                                </button>
                                 <button onClick={() => { onNavigate(Page.About); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                    <Info className="w-5 h-5 text-slate-400" />
                                    <span>About æternacy</span>
                                </button>
                                <button onClick={() => { onNavigate(Page.Journal); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                    <BookOpen className="w-5 h-5 text-slate-400" />
                                    <span>Journal</span>
                                </button>
                                <div className="border-t border-white/10 my-1"></div>
                                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Premium Features</div>
                                <button onClick={() => { onNavigate(Page.Shop); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                    <ShoppingBag className="w-5 h-5 text-slate-400" />
                                    <span>Shop & Creation Suite</span>
                                </button>
                                <button onClick={() => { onNavigate(Page.AIVideo); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                                    <Film className="w-5 h-5 text-slate-400" />
                                    <span>Video Studio</span>
                                </button>
                                <div className="border-t border-white/10 my-1"></div>
                                {userTier === 'fæmily' || userTier === 'legacy' ? (
                                    <button onClick={() => { onNavigate(Page.FamilySpace); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-indigo-400 hover:bg-white/5 font-semibold">
                                        <Users className="w-5 h-5 text-indigo-400" />
                                        <span className="text-indigo-300">Fæmily Space</span>
                                    </button>
                                ) : (
                                    <button onClick={() => { onNavigate(Page.FamilyPlan); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-cyan-300 hover:bg-white/5 font-semibold">
                                        <Users className="w-5 h-5 text-cyan-400" />
                                        <span>Upgrade to Fæmily</span>
                                    </button>
                                )}
                                <button onClick={() => { onNavigate(Page.LegacySpace); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-amber-300 hover:bg-white/5 font-semibold">
                                    <LegacyIcon className="w-5 h-5 text-amber-400" />
                                    <span>Lægacy Space</span>
                                </button>
                                <div className="border-t border-white/10 my-1"></div>
                                <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
