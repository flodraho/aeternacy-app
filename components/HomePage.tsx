
import React, { useState, useEffect, useRef } from 'react';
import { Page, Moment } from '../types';
import { 
    Clock, Calendar, Sparkles, TrendingUp, Bell, Plus, X, 
    ArrowRight, Quote, GripHorizontal, Settings, MapPin, UploadCloud, Mic, BarChart3, Image as ImageIcon, Check
} from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';

interface HomePageProps {
    onNavigate: (page: Page) => void;
    moments: Moment[];
    onSelectMoment: (moment: Moment) => void;
}

interface Widget {
    id: string;
    type: 'daily-reflection' | 'on-this-day' | 'moment-highlight' | 'moment-standard' | 'insight' | 'notifications' | 'quick-actions' | 'stats';
    colSpan: string;
    rowSpan?: string;
    data?: any;
}

const DailyReflectionCard: React.FC<{ onNavigate: (page: Page) => void; isEditing: boolean }> = ({ onNavigate, isEditing }) => (
    <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl ring-1 ring-white/10 h-full flex flex-col justify-between hover:ring-white/20 transition-all shadow-xl group cursor-pointer" onClick={() => !isEditing && onNavigate(Page.Journaling)}>
        <div>
            <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-500/20 p-2 rounded-full text-amber-300">
                    <Quote className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daily Prompt</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 leading-snug">"What is a small kindness you witnessed today?"</h3>
            <p className="text-slate-400 text-sm">Capture it before it fades.</p>
        </div>
        <div className="mt-4 flex items-center text-amber-400 text-sm font-bold gap-2 group-hover:gap-3 transition-all">
            Write Reflection <ArrowRight className="w-4 h-4" />
        </div>
    </div>
);

const OnThisDayCard: React.FC<{ onClick: () => void; isEditing: boolean }> = ({ onClick, isEditing }) => (
    <div onClick={() => !isEditing && onClick()} className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 p-6 rounded-3xl ring-1 ring-white/10 h-full text-white cursor-pointer relative overflow-hidden group shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-full">
                    <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-indigo-200 text-sm">On This Day</span>
            </div>
            <div className="text-3xl font-bold font-brand mb-1">3 Years Ago</div>
            <p className="text-indigo-200 text-sm mb-6">You visited "Yosemite National Park" with family.</p>
            <div className="flex -space-x-2 overflow-hidden mb-4">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-indigo-900" src="https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&w=100" alt=""/>
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-indigo-900" src="https://images.pexels.com/photos/1528660/pexels-photo-1528660.jpeg?auto=compress&cs=tinysrgb&w=100" alt=""/>
            </div>
            <button className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg font-semibold text-sm transition-colors">Relive Memory</button>
        </div>
    </div>
);

const MomentHighlightCard: React.FC<{ data: Moment | null; onClick: () => void; onNavigateCreate: () => void; isEditing: boolean; size?: 'large' | 'small' }> = ({ data, onClick, onNavigateCreate, isEditing, size = 'small' }) => (
    <div onClick={() => !isEditing && (data ? onClick() : onNavigateCreate())} className={`relative group rounded-3xl overflow-hidden ring-1 ring-white/10 cursor-pointer shadow-xl h-full ${size === 'large' ? 'min-h-[400px]' : 'min-h-[200px]'}`}>
        {data ? (
            <>
                <img src={data.image || data.images?.[0]} alt={data.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                    {data.location && (
                        <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
                            <MapPin className="w-3 h-3" /> {data.location}
                        </div>
                    )}
                    <h3 className={`${size === 'large' ? 'text-3xl' : 'text-xl'} font-bold text-white font-brand leading-tight mb-2`}>{data.title}</h3>
                    <p className="text-slate-300 text-sm line-clamp-2">{data.description}</p>
                </div>
            </>
        ) : (
            <>
                <img src="https://images.pexels.com/photos/2085998/pexels-photo-2085998.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Placeholder" className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105 grayscale" />
                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 ring-1 ring-white/20 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-brand mb-2">Your Highlight Awaits</h3>
                    <p className="text-slate-300 text-sm max-w-xs">Create your first momænt to see it featured here.</p>
                </div>
            </>
        )}
    </div>
);

const QuickActionsWidget: React.FC<{ onNavigate: (page: Page) => void; isEditing: boolean }> = ({ onNavigate, isEditing }) => (
    <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl ring-1 ring-white/10 h-full flex flex-col justify-center gap-4 shadow-xl">
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 h-full">
            <button onClick={() => !isEditing && onNavigate(Page.Create)} className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
                <UploadCloud className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-cyan-100">Upload</span>
            </button>
            <button onClick={() => !isEditing && onNavigate(Page.Record)} className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
                <Mic className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-purple-100">Record</span>
            </button>
        </div>
    </div>
);

const StatsWidget: React.FC<{ momentCount: number }> = ({ momentCount }) => (
    <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl ring-1 ring-white/10 h-full flex flex-col justify-center shadow-xl">
        <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <h3 className="font-bold text-white text-sm">Your Timestream</h3>
        </div>
        <div className="flex justify-between items-end">
            <div>
                <p className="text-3xl font-bold text-white font-mono">{momentCount}</p>
                <p className="text-xs text-slate-400">Momænts</p>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
             <div>
                <p className="text-3xl font-bold text-white font-mono">1</p>
                <p className="text-xs text-slate-400">Day Streak</p>
            </div>
        </div>
    </div>
);

const DataInsightTeaserCard: React.FC<{ onClick: () => void; isEditing: boolean }> = ({ onClick, isEditing }) => (
    <div onClick={() => !isEditing && onClick()} className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl ring-1 ring-white/10 h-full flex flex-col hover:bg-slate-800 transition-colors cursor-pointer shadow-xl">
        <div className="flex items-center justify-between mb-4">
            <div className="bg-cyan-500/20 p-2 rounded-full text-cyan-400">
                <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-green-400 text-xs font-bold">+12% this month</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Weekly Insights</h3>
        <p className="text-slate-400 text-sm mb-4">You've explored the theme of "Nature" 5 times this week.</p>
        <div className="mt-auto h-16 flex items-end gap-1">
            {[40, 70, 35, 50, 80, 60, 90].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-700 hover:bg-cyan-500/50 transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
        </div>
    </div>
);

const NotificationWidget: React.FC<{ onClick: () => void; isEditing: boolean }> = ({ onClick, isEditing }) => (
    <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl ring-1 ring-white/10 h-full shadow-xl">
        <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-white">Activity</h3>
        </div>
        <div className="space-y-4">
            <div className="flex gap-3 items-start">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-400 flex-shrink-0"></div>
                <div>
                    <p className="text-sm text-slate-300"><span className="font-bold text-white">Jane</span> commented on "Summer Trip"</p>
                    <p className="text-xs text-slate-500 mt-0.5">2 hours ago</p>
                </div>
            </div>
            <div className="flex gap-3 items-start">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-400 flex-shrink-0"></div>
                <div>
                    <p className="text-sm text-slate-300">New memory created by <span className="font-bold text-white">Alex</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">5 hours ago</p>
                </div>
            </div>
        </div>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ onNavigate, moments, onSelectMoment }) => {
    const heroImages = [
        'https://images.pexels.com/photos/1528660/pexels-photo-1528660.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2', // Peaceful Path
        'https://images.pexels.com/photos/3363357/pexels-photo-3363357.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2', // Golden Hour Silhouette
        'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2', // Nostalgic Light
        'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2', // Majestic Mountain
        'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2' // Joy/Celebration
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [greeting, setGreeting] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [draggedWidgetIndex, setDraggedWidgetIndex] = useState<number | null>(null);
    const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);

    const [widgets, setWidgets] = useState<Widget[]>([
        { id: '1', type: 'daily-reflection', colSpan: 'col-span-1 md:col-span-1' },
        { id: '2', type: 'on-this-day', colSpan: 'col-span-1 md:col-span-1' },
        { id: '3', type: 'moment-highlight', colSpan: 'col-span-1 md:col-span-2 lg:col-span-2 row-span-2', data: null }, 
        { id: '4', type: 'insight', colSpan: 'col-span-1 md:col-span-1' },
        { id: '5', type: 'notifications', colSpan: 'col-span-1 md:col-span-1' },
    ]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
        }, 8000); 
        return () => clearInterval(interval);
    }, [heroImages]);

    useEffect(() => {
        // Populate widget data from moments
        if (moments.length > 0) {
            setWidgets(prev => prev.map(w => {
                if (w.type === 'moment-highlight' && !w.data) {
                    const pinned = moments.find(m => m.pinned) || moments[0];
                    return { ...w, data: pinned };
                }
                if (w.type === 'moment-standard' && !w.data) {
                     // Just pick a random one for standard widget if not set
                     return { ...w, data: moments[Math.floor(Math.random() * moments.length)] };
                }
                return w;
            }));
        } else {
             // If moments are cleared, ensure data is null so placeholder renders
             setWidgets(prev => prev.map(w => {
                if (w.type === 'moment-highlight') return { ...w, data: null };
                return w;
             }));
        }
    }, [moments]);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedWidgetIndex(index);
        // Required for Firefox
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedWidgetIndex === null || draggedWidgetIndex === index) return;
        
        const newWidgets = [...widgets];
        const draggedItem = newWidgets[draggedWidgetIndex];
        newWidgets.splice(draggedWidgetIndex, 1);
        newWidgets.splice(index, 0, draggedItem);
        
        setWidgets(newWidgets);
        setDraggedWidgetIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedWidgetIndex(null);
    };

    const removeWidget = (id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    };
    
    const handleAddWidget = (type: Widget['type']) => {
        const newId = `widget-${Date.now()}`;
        let colSpan = 'col-span-1 md:col-span-1';
        let rowSpan = undefined;
        let data = null;

        if (type === 'moment-highlight') {
             colSpan = 'col-span-1 md:col-span-2 lg:col-span-2 row-span-2';
             const pinned = moments.find(m => m.pinned) || moments[0];
             data = pinned || null;
        }

        const newWidget: Widget = {
            id: newId,
            type,
            colSpan,
            rowSpan,
            data
        };

        setWidgets(prev => [...prev, newWidget]);
        setIsAddWidgetModalOpen(false);
    };

    const getWiggleStyle = (id: string) => {
        const rot = Math.random() * 2 - 1; 
        return { transform: `rotate(${rot}deg)` };
    };

    const kenBurnsAnimations = [
        'animate-ken-burns-1',
        'animate-ken-burns-2',
        'animate-ken-burns-3',
        'animate-ken-burns-4',
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white -mt-20">
            {/* Hero Header */}
            <div className="relative h-[600px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900 z-10"></div>
                
                {heroImages.map((img, index) => {
                    const animationClass = kenBurnsAnimations[index % kenBurnsAnimations.length];
                    const isActive = index === currentImageIndex;
                    return (
                        <div 
                            key={img}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${isActive ? 'opacity-80' : 'opacity-0'}`}
                        >
                            <img 
                                src={img} 
                                alt="Hero Background" 
                                className={`w-full h-full object-cover ${isActive ? animationClass : ''}`}
                                loading={index === 0 ? "eager" : "lazy"}
                                // @ts-ignore
                                fetchpriority={index === 0 ? "high" : "auto"}
                            />
                        </div>
                    );
                })}
                
                {/* Content Container */}
                <div className="absolute inset-0 z-20 flex flex-col justify-start px-6 container mx-auto pt-32">
                    <div className="max-w-3xl animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-cyan-300 border border-white/10">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold font-brand mb-4 text-white leading-tight drop-shadow-lg">
                            {greeting}, John.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-200 drop-shadow-md max-w-2xl">
                            Your timestream is active. 3 new memories from last week are ready for review.
                        </p>
                    </div>
                </div>
            </div>

            {/* DASHBOARD GRID */}
            <div className="relative z-20 -mt-32 pb-24 container mx-auto px-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min items-start">
                    {widgets.map((widget, index) => {
                        const isDraggable = isEditMode;
                        
                        return (
                            <div 
                                key={widget.id}
                                draggable={isDraggable}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                style={isDraggable ? getWiggleStyle(widget.id) : {}}
                                className={`
                                    relative
                                    ${widget.colSpan} ${widget.rowSpan || ''}
                                    transition-all duration-300
                                    ${isEditMode ? 'animate-wiggle cursor-grab active:cursor-grabbing' : ''}
                                    ${draggedWidgetIndex === index ? 'opacity-0' : 'opacity-100'}
                                `}
                            >
                                {isEditMode && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                                        className="absolute -top-3 -left-3 z-50 bg-slate-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-500 transition-colors border-2 border-slate-900"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                )}

                                <div className={`h-full w-full ${isEditMode ? 'pointer-events-none' : ''}`}>
                                    {widget.type === 'daily-reflection' && <DailyReflectionCard onNavigate={onNavigate} isEditing={isEditMode} />}
                                    {widget.type === 'on-this-day' && <OnThisDayCard onClick={() => onNavigate(Page.Moments)} isEditing={isEditMode} />}
                                    {widget.type === 'moment-highlight' && <MomentHighlightCard data={widget.data as Moment} onClick={() => onSelectMoment && onSelectMoment(widget.data as Moment)} onNavigateCreate={() => onNavigate(Page.Create)} isEditing={isEditMode} size="large" />}
                                    {widget.type === 'moment-standard' && widget.data && <MomentHighlightCard data={widget.data as Moment} onClick={() => onSelectMoment && onSelectMoment(widget.data as Moment)} onNavigateCreate={() => onNavigate(Page.Create)} isEditing={isEditMode} />}
                                    {widget.type === 'insight' && <DataInsightTeaserCard onClick={() => onNavigate(Page.DataInsight)} isEditing={isEditMode} />}
                                    {widget.type === 'notifications' && <NotificationWidget onClick={() => {}} isEditing={isEditMode} />}
                                    {widget.type === 'quick-actions' && <QuickActionsWidget onNavigate={onNavigate} isEditing={isEditMode} />}
                                    {widget.type === 'stats' && <StatsWidget momentCount={moments.length} />}
                                </div>
                            </div>
                        );
                    })}
                    
                    {isEditMode && (
                        <button onClick={() => setIsAddWidgetModalOpen(true)} className="h-full min-h-[200px] border-2 border-dashed border-slate-600 rounded-3xl flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-slate-400 transition-all bg-slate-900/50">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-2">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-sm">Add Widget</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Customize Dashboard Controls */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                {isEditMode ? (
                    <button 
                        onClick={() => setIsEditMode(false)}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 transition-transform transform hover:scale-105 animate-fade-in-up"
                    >
                        <Check className="w-5 h-5" /> Done
                    </button>
                ) : (
                    <button 
                        onClick={() => setIsEditMode(true)}
                        className="bg-slate-800/90 backdrop-blur-md border border-white/10 hover:bg-slate-700 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 transition-all hover:scale-105"
                    >
                        <Settings className="w-5 h-5" /> Customize
                    </button>
                )}
            </div>

            {/* Add Widget Modal */}
            {isAddWidgetModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsAddWidgetModalOpen(false)}>
                    <div className="bg-slate-800 rounded-3xl w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold font-brand text-white">Add Widget to Dashboard</h2>
                            <button onClick={() => setIsAddWidgetModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                            <button onClick={() => handleAddWidget('moment-highlight')} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-white/5 hover:border-cyan-500/50 transition-all group text-left">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-3 text-cyan-300 group-hover:scale-110 transition-transform"><ImageIcon className="w-5 h-5"/></div>
                                <h3 className="font-bold text-white text-sm">Highlight</h3>
                                <p className="text-xs text-slate-400 mt-1">Large featured photo</p>
                            </button>
                             <button onClick={() => handleAddWidget('quick-actions')} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-white/5 hover:border-cyan-500/50 transition-all group text-left">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-3 text-amber-300 group-hover:scale-110 transition-transform"><UploadCloud className="w-5 h-5"/></div>
                                <h3 className="font-bold text-white text-sm">Quick Actions</h3>
                                <p className="text-xs text-slate-400 mt-1">Upload & Record shortcuts</p>
                            </button>
                             <button onClick={() => handleAddWidget('daily-reflection')} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-white/5 hover:border-cyan-500/50 transition-all group text-left">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 text-purple-300 group-hover:scale-110 transition-transform"><Quote className="w-5 h-5"/></div>
                                <h3 className="font-bold text-white text-sm">Reflection</h3>
                                <p className="text-xs text-slate-400 mt-1">Daily journal prompt</p>
                            </button>
                             <button onClick={() => handleAddWidget('stats')} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-white/5 hover:border-cyan-500/50 transition-all group text-left">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-3 text-green-300 group-hover:scale-110 transition-transform"><BarChart3 className="w-5 h-5"/></div>
                                <h3 className="font-bold text-white text-sm">Stats</h3>
                                <p className="text-xs text-slate-400 mt-1">Timestream overview</p>
                            </button>
                             <button onClick={() => handleAddWidget('on-this-day')} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-white/5 hover:border-cyan-500/50 transition-all group text-left">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 text-blue-300 group-hover:scale-110 transition-transform"><Clock className="w-5 h-5"/></div>
                                <h3 className="font-bold text-white text-sm">On This Day</h3>
                                <p className="text-xs text-slate-400 mt-1">Historical flashbacks</p>
                            </button>
                             <button onClick={() => handleAddWidget('insight')} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-white/5 hover:border-cyan-500/50 transition-all group text-left">
                                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center mb-3 text-teal-300 group-hover:scale-110 transition-transform"><TrendingUp className="w-5 h-5"/></div>
                                <h3 className="font-bold text-white text-sm">Insights</h3>
                                <p className="text-xs text-slate-400 mt-1">Weekly analysis</p>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
