
import React, { useState, useEffect, useRef } from 'react';
import { Page, UserTier, TokenState } from '../types';
import { Search, User, Users, Menu, X, ShoppingBag, CreditCard, LogOut, UploadCloud, Mic, Wand2, BookOpen, Headset, BrainCircuit, BarChart, FilePenLine, LayoutGrid } from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';
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

// Mobile navigation structure (Duplicated here for the mobile drawer)
const mobileNavStructure = [
    {
        title: 'Create',
        items: [
            { page: Page.Create, icon: UploadCloud, title: 'Upload' },
            { page: Page.Record, icon: Mic, title: 'Record' },
            { page: Page.SmartCollection, icon: Wand2, title: 'Smart Create' }
        ]
    },
    {
        title: 'Curate',
        items: [
            { page: Page.Moments, icon: LayoutGrid, title: 'Collection' },
            { page: Page.Curate, icon: FilePenLine, title: 'Studio' },
            { page: Page.DataInsight, icon: BarChart, title: 'Insights' }
        ]
    },
    {
        title: 'Preserve',
        items: [
            { page: Page.FamilySpace, icon: Users, title: 'Fæmily Space' },
            { page: Page.LegacySpace, icon: LegacyIcon, title: 'Lægacy Space' },
            { page: Page.Magazine, icon: BookOpen, title: 'Mægazine' },
            { page: Page.Biografer, icon: Headset, title: 'Biografær' }
        ]
    }
];

const contextConfig: { [key in NonNullable<SpaceContext>]: { icon: React.ElementType, text: string, className: string } } = {
    personal: { icon: User, text: 'Personal', className: 'hidden' },
    family: { icon: Users, text: 'Fæmily', className: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' },
    legacy: { icon: LegacyIcon, text: 'Lægacy', className: 'text-amber-400 border-amber-500/20 bg-amber-500/10' }
};

const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout, currentPage, userTier, profilePic, spaceContext, tokenState }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const totalAllocation = tokenState.monthlyAllocation + tokenState.rollover;
    const balancePercentage = totalAllocation > 0 ? Math.min(100, (tokenState.balance / totalAllocation) * 100) : (tokenState.balance > 0 ? 100 : 0);
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (balancePercentage / 100) * circumference;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getTierColorClass = () => {
        switch (userTier) {
            case 'legacy': return 'text-amber-400';
            case 'fæmily': return 'text-indigo-400';
            case 'essæntial': return 'text-cyan-400';
            default: return 'text-slate-400';
        }
    };
    
    const getTierBgClass = () => {
         switch (userTier) {
            case 'legacy': return 'bg-amber-400';
            case 'fæmily': return 'bg-indigo-400';
            case 'essæntial': return 'bg-cyan-400';
            default: return 'bg-slate-400';
        }
    };

    const ringColorClass = getTierColorClass();
    const dotBgClass = getTierBgClass();

    const ContextBadge: React.FC<{ context: SpaceContext }> = ({ context }) => {
        // Only show badge for special contexts (Family, Legacy). 
        // Personal context is the default and should not have a badge.
        if (!context || context === 'personal') return null;
        
        const config = contextConfig[context];
        const Icon = config.icon;
        return (
            <div className={`hidden md:flex items-center gap-2 text-xs uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border ${config.className} transition-all`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{config.text} Space</span>
            </div>
        );
    };

    return (
        <header className={`sticky top-0 z-40 w-full transition-all duration-500 ease-in-out ${isScrolled ? 'bg-slate-800/90 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent border-b border-transparent'}`}>
            <div className="px-6 h-20 flex justify-between items-center max-w-[1920px] mx-auto relative">
                
                {/* Mobile Search Overlay */}
                {isMobileSearchOpen && (
                    <div className="absolute inset-0 bg-slate-950 z-50 flex items-center px-6 md:hidden animate-fade-in">
                         <div className="relative flex-grow">
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search..."
                                className="w-full bg-slate-800 text-white rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                         </div>
                         <button 
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="ml-4 text-slate-400 hover:text-white text-sm font-medium"
                         >
                            Cancel
                         </button>
                    </div>
                )}

                {/* Left: Mobile Menu & Context */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Mobile Hamburger */}
                    <button 
                        className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    
                    {/* Logo on Mobile only */}
                    <button onClick={() => onNavigate(Page.Home)} className="md:hidden flex items-center text-white">
                        <LogoIcon className="w-8 h-8" />
                    </button>

                    <ContextBadge context={spaceContext} />
                </div>

                {/* Center: Search Command Center */}
                <div className="hidden md:flex flex-1 justify-center">
                    {/* Center space reserved for future use or title */}
                </div>

                {/* Right: Search, Profile & Actions */}
                <div className="flex items-center gap-4 flex-1 justify-end" ref={dropdownRef}>
                    
                    {/* Desktop Search Bar - Restored to Right Side */}
                    <div className="hidden md:block relative group">
                        <input
                            type="text"
                            placeholder="Search memories..."
                            className="bg-slate-800/50 text-slate-200 placeholder-slate-500 rounded-full h-10 pl-10 pr-4 text-sm w-64 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-500/50 focus:bg-slate-800 transition-all"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                    </div>
                    
                    {/* Mobile Search Icon - Triggers Overlay */}
                    <button 
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                        onClick={() => setIsMobileSearchOpen(true)}
                    >
                        <Search className="w-6 h-6" />
                    </button>

                    {/* Profile Button */}
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="relative w-11 h-11 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 focus:outline-none transition-all active:scale-95 group"
                            aria-label="Profile and settings"
                        >
                            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                                <circle className="text-slate-700" strokeWidth="2.5" stroke="currentColor" fill="transparent" r={radius} cx="20" cy="20" />
                                <circle className={`${ringColorClass} transition-all duration-1000 ease-out`} strokeWidth="2.5" strokeDasharray={circumference} strokeDashoffset={isNaN(strokeDashoffset) ? circumference : strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="20" cy="20" />
                            </svg>
                            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden z-10 border border-slate-700/50">
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-4 w-72 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in origin-top-right ring-1 ring-black/50">
                                <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                                    <p className="text-base font-bold text-white">John Doe</p>
                                    <div className="flex items-center gap-2 mt-1">
                                         <span className={`w-2 h-2 rounded-full ${dotBgClass}`}></span>
                                        <p className="text-xs text-slate-300 capitalize font-medium">{userTier} Member</p>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <button onClick={() => { onNavigate(Page.Profile); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                        <User className="w-4 h-4" />
                                        <span>Profile & Settings</span>
                                    </button>
                                    <button onClick={() => { onNavigate(Page.Subscription); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                        <CreditCard className="w-4 h-4" />
                                        <span>Subscription</span>
                                    </button>
                                </div>
                                <div className="border-t border-white/5 mx-2 my-1"></div>
                                <div className="p-2">
                                    <button onClick={onLogout} className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <LogOut className="w-4 h-4"/>
                                            <span>Log out</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="relative w-72 bg-slate-900 h-full shadow-2xl flex flex-col animate-slide-in-left border-r border-white/10">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-950">
                            <span className="font-brand text-xl font-bold text-white">æternacy</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4">
                            <button onClick={() => { onNavigate(Page.Home); setIsMobileMenuOpen(false); }} className="w-full text-left px-6 py-4 text-slate-200 font-bold hover:bg-white/5 text-lg">Dashboard</button>
                            {mobileNavStructure.map(category => (
                                <div key={category.title} className="mb-6">
                                    <h4 className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{category.title}</h4>
                                    {category.items.map(item => {
                                        const Icon = item.icon;
                                        return (
                                            <button 
                                                key={item.title} 
                                                onClick={() => { onNavigate(item.page); setIsMobileMenuOpen(false); }} 
                                                className="w-full text-left flex items-center gap-4 px-6 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-cyan-500"
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span>{item.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/10 bg-slate-950">
                            <button onClick={onLogout} className="flex items-center gap-3 text-red-400 font-semibold w-full px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
                                <LogOut className="w-5 h-5" /> Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
