
import React, { useState } from 'react';
import { Page, UserTier } from '../types';
import { 
    Mic, UploadCloud, Wand2, LayoutGrid, FilePenLine, BarChart, 
    Users, BookOpen, Headset, ShoppingBag, Settings, 
    LogOut, ChevronRight, Plus, Home, Bell
} from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';

interface SidebarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    userTier: UserTier;
}

const navStructure = [
    {
        title: 'Create',
        items: [
            { page: Page.Create, icon: UploadCloud, label: 'Upload' },
            { page: Page.Record, icon: Mic, label: 'Record' },
            { page: Page.SmartCollection, icon: Wand2, label: 'Smart Create' }
        ]
    },
    {
        title: 'Curate',
        items: [
            { page: Page.Moments, icon: LayoutGrid, label: 'My Collection' },
            { page: Page.Curate, icon: FilePenLine, label: 'Studio' },
            { page: Page.DataInsight, icon: BarChart, label: 'Insights' }
        ]
    },
    {
        title: 'Preserve',
        items: [
            { page: Page.FamilySpace, icon: Users, label: 'Fæmily Space', color: 'text-indigo-400' },
            { page: Page.LegacySpace, icon: LegacyIcon, label: 'Lægacy Space', color: 'text-amber-400' },
            { page: Page.Magazine, icon: BookOpen, label: 'Mægazine' },
            { page: Page.Biografer, icon: Headset, label: 'Biografær', color: 'text-amber-400' }
        ]
    }
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout, userTier }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Mock Notifications
    const notifications = [
        { id: 1, title: "Video Ready", text: "Your cinematic reflection for 'Summer 2023' is ready to view.", time: "2m ago", unread: true },
        { id: 2, title: "New Comment", text: "Jane Doe commented on 'Grandma's 80th Birthday'.", time: "1h ago", unread: true },
        { id: 3, title: "Daily Reflection", text: "New prompt: What brings you joy today?", time: "5h ago", unread: false },
        { id: 4, title: "System", text: "Your monthly Tokæn allowance has been refilled.", time: "1d ago", unread: false },
    ];
    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <aside 
            className={`hidden md:flex flex-col fixed left-0 top-0 h-screen z-50 bg-slate-950/80 backdrop-blur-xl border-r border-white/5 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isHovered ? 'w-64' : 'w-20'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsNotificationsOpen(false); }}
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-center border-b border-white/5 relative overflow-hidden">
                <button onClick={() => onNavigate(Page.Home)} className="flex items-center justify-center text-white transition-opacity hover:opacity-80">
                    <div className="flex items-center relative">
                        {/* The Anchor Symbol 'æ' */}
                        <span className="font-brand text-3xl font-bold tracking-tighter pb-1 z-10">æ</span>
                        
                        {/* The Expanding Suffix 'ternacy' */}
                        <span 
                            className={`font-brand text-3xl font-bold tracking-tighter pb-1 whitespace-nowrap overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isHovered ? 'max-w-[140px] opacity-100' : 'max-w-0 opacity-0'}`}
                        >
                            ternacy
                        </span>
                    </div>
                </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-6 space-y-8 scrollbar-hide">
                {/* Dashboard Link */}
                <div className="px-3">
                    <button 
                        onClick={() => onNavigate(Page.Home)}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${currentPage === Page.Home ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Home className="w-6 h-6 flex-shrink-0" />
                        <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 hidden'}`}>
                            Dashboard
                        </span>
                        {!isHovered && currentPage === Page.Home && (
                            <div className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-full" />
                        )}
                    </button>
                </div>

                {navStructure.map((section, idx) => (
                    <div key={idx} className="px-3">
                        <div className={`text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 px-3 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            {section.title}
                        </div>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = currentPage === item.page;
                                const Icon = item.icon;
                                
                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => onNavigate(item.page)}
                                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative ${
                                            isActive 
                                            ? 'bg-white/10 text-white shadow-lg shadow-black/20 ring-1 ring-white/10' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-cyan-400' : item.color || 'group-hover:text-slate-200'}`} />
                                        
                                        <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 hidden'}`}>
                                            {item.label}
                                        </span>

                                        {!isHovered && isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-white/5 bg-slate-900/50 flex flex-col gap-1">
                {/* Notification Bell */}
                <div className="relative">
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${isNotificationsOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="relative">
                            <Bell className="w-6 h-6 flex-shrink-0" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-slate-900" />
                            )}
                        </div>
                        <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 hidden'}`}>
                            Notifications
                        </span>
                    </button>

                    {/* Notification Panel */}
                    {isNotificationsOpen && (
                        <div className="absolute left-full bottom-0 ml-4 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 animate-fade-in origin-bottom-left overflow-hidden ring-1 ring-black/50">
                             <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                                <span className="font-semibold text-white text-sm">Notifications</span>
                                {unreadCount > 0 && <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">Mark all read</button>}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notification => (
                                        <button key={notification.id} className={`w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors ${notification.unread ? 'bg-white/5' : ''}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs font-bold ${notification.unread ? 'text-cyan-400' : 'text-slate-400'}`}>{notification.title}</span>
                                                <span className="text-[10px] text-slate-500">{notification.time}</span>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-snug">{notification.text}</p>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-slate-500 text-sm">No new notifications.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => onNavigate(Page.Shop)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all ${currentPage === Page.Shop ? 'bg-white/5 text-white' : ''}`}
                >
                    <ShoppingBag className="w-6 h-6 flex-shrink-0" />
                    <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        Shop & Upgrades
                    </span>
                </button>
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="w-6 h-6 flex-shrink-0" />
                    <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        Log Out
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
