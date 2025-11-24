
import React, { useMemo, useState } from 'react';
import { Moment } from '../types';
import { MapPin, Users, Heart, Tag, Bot } from 'lucide-react';

interface DataInsightPageProps {
    moments: Moment[];
}

const emotionConfig: { [key: string]: { color: string, icon: React.ElementType, name: string } } = {
    joy: { color: 'text-yellow-300', icon: Heart, name: 'Joy' },
    love: { color: 'text-pink-400', icon: Heart, name: 'Love' },
    adventure: { color: 'text-orange-400', icon: Heart, name: 'Adventure' },
    peace: { color: 'text-sky-300', icon: Heart, name: 'Peace' },
    reflection: { color: 'text-purple-300', icon: Heart, name: 'Reflection' },
    achievement: { color: 'text-green-400', icon: Heart, name: 'Achievement' },
};

const DataInsightPage: React.FC<DataInsightPageProps> = ({ moments }) => {
    const [hoveredThread, setHoveredThread] = useState<string | null>(null);

    const standardMoments = useMemo(() => moments.filter(m => m.type === 'standard' || m.type === 'focus'), [moments]);

    const lifeFabricData = useMemo(() => {
        if (standardMoments.length < 2) return null;

        const momentsByYear: { [year: string]: Moment[] } = {};
        standardMoments.forEach(m => {
            const year = new Date(m.date).getFullYear().toString();
            if (!momentsByYear[year]) momentsByYear[year] = [];
            momentsByYear[year].push(m);
        });

        const years = Object.keys(momentsByYear).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        if (years.length < 2) return null;

        const emotions = Object.keys(emotionConfig);
        const colorMap: { [key: string]: string } = {
            joy: '#facc15', love: '#f472b6', adventure: '#fb923c',
            peace: '#38bdf8', reflection: '#c084fc', achievement: '#4ade80',
        };

        const threads: { [emotion: string]: { year: string, value: number }[] } = {};
        emotions.forEach(emotion => {
            threads[emotion] = years.map(year => ({
                year,
                value: (momentsByYear[year] || []).filter(m => m.emotion === emotion).length
            }));
        });

        const maxCount = Math.max(1, ...emotions.flatMap(e => threads[e].map(p => p.value)));

        const width = 1000, height = 300, padding = { top: 40, right: 20, bottom: 40, left: 20 };
        const points: { [emotion: string]: { x: number, y: number }[] } = {};
        emotions.forEach(emotion => {
            points[emotion] = threads[emotion].map((point, i) => ({
                x: padding.left + (i / (years.length - 1)) * (width - padding.left - padding.right),
                y: (height - padding.bottom) - ((point.value / maxCount) * (height - padding.top - padding.bottom))
            }));
        });

        const line = (points: {x:number, y:number}[]) => {
            if (points.length < 2) return `M ${points[0]?.x || 0} ${points[0]?.y || 0}`;
            let d = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = i > 0 ? points[i - 1] : points[i];
                const p1 = points[i];
                const p2 = points[i + 1];
                const p3 = i < points.length - 2 ? points[i + 2] : p2;
                const cp1x = p1.x + (p2.x - p0.x) / 6; const cp1y = p1.y + (p2.y - p0.y) / 6;
                const cp2x = p2.x - (p3.x - p1.x) / 6; const cp2y = p2.y - (p3.y - p1.y) / 6;
                d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
            }
            return d;
        };

        const paths = emotions.map(emotion => ({
            emotion, d: line(points[emotion]), color: colorMap[emotion] || '#ffffff',
        }));

        return { width, height, paths, years, padding };
    }, [standardMoments]);

    const insights = useMemo(() => {
        const peopleCounts: { [person: string]: number } = {};
        const locationCounts: { [loc: string]: number } = {};
        const activityCounts: { [act: string]: number } = {};

        standardMoments.forEach(m => {
            m.people?.forEach(p => { peopleCounts[p] = (peopleCounts[p] || 0) + 1; });
            if (m.location) locationCounts[m.location] = (locationCounts[m.location] || 0) + 1;
            m.activities?.forEach(act => { activityCounts[act] = (activityCounts[act] || 0) + 1; });
        });

        const topPeople = Object.entries(peopleCounts).sort(([,a],[,b]) => b-a).slice(0, 5);
        const topLocations = Object.entries(locationCounts).sort(([,a],[,b]) => b-a).slice(0, 5);
        const topActivities = Object.entries(activityCounts).sort(([,a],[,b]) => b-a).slice(0, 3);
        
        return { topPeople, topLocations, topActivities };
    }, [standardMoments]);

    const lifeChapters = useMemo(() => {
        const yearGroups: { [year: string]: Moment[] } = {};
        standardMoments.forEach(m => {
            const year = new Date(m.date).getFullYear().toString();
            if (!yearGroups[year]) yearGroups[year] = [];
            yearGroups[year].push(m);
        });

        return Object.entries(yearGroups)
            .sort(([yearA], [yearB]) => parseInt(yearB, 10) - parseInt(yearA, 10))
            .slice(0, 4)
            .map(([year, yearMoments]) => {
                const emotionCounts: { [emotion: string]: number } = {};
                yearMoments.forEach(m => { if(m.emotion) emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1; });
                const dominantEmotion = Object.entries(emotionCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0];
                
                let title = `The Year of New Beginnings`;
                if(dominantEmotion === 'adventure') title = `The Year of Adventure`;
                if(dominantEmotion === 'achievement') title = `The Year of Achievement`;
                if(dominantEmotion === 'love') title = `The Year of Connection`;
                
                return {
                    year,
                    title,
                    dominantEmotion,
                    moments: yearMoments,
                };
            });
    }, [standardMoments]);

    return (
        <div className="container mx-auto px-6 pt-28 pb-12 animate-fade-in-up">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">Your Story at a Glance</h1>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Discover the patterns, connections, and emotional threads that make your story unique.</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl ring-1 ring-white/10 mb-12">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white font-brand">The Fabric of Your Life</h2>
                    <p className="text-slate-400 mt-1 text-sm">An emotional timeline of your moments.</p>
                </div>
                {lifeFabricData ? (
                    <div className="relative">
                        <svg viewBox={`0 0 ${lifeFabricData.width} ${lifeFabricData.height}`} className="w-full h-auto">
                            {lifeFabricData.paths.map(({ emotion, d, color }) => (
                                <path
                                    key={emotion}
                                    d={d}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={hoveredThread === emotion ? 5 : 3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="transition-all duration-300"
                                    opacity={hoveredThread ? (hoveredThread === emotion ? 1 : 0.2) : 0.7}
                                    onMouseEnter={() => setHoveredThread(emotion)}
                                    onMouseLeave={() => setHoveredThread(null)}
                                />
                            ))}
                        </svg>
                        <div className="flex justify-between absolute bottom-0 left-0 right-0 px-5">
                            {lifeFabricData.years.map(year => <span key={year} className="text-xs text-slate-500">{year}</span>)}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">Not enough data to visualize your life fabric. Add more moments with emotions to see your story unfold.</div>
                )}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6">
                    {Object.entries(emotionConfig).map(([key, { color, name }]) => (
                        <div key={key} onMouseEnter={() => setHoveredThread(key)} onMouseLeave={() => setHoveredThread(null)} className={`flex items-center gap-2 text-sm font-semibold cursor-pointer transition-all ${hoveredThread ? (hoveredThread === key ? `scale-110 ${color}` : 'opacity-50') : color}`}>
                            <div className={`w-3 h-3 rounded-full bg-current`}></div>
                            <span>{name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white font-brand mb-4"><Users className="w-5 h-5 text-cyan-400"/> Top Connections</h3>
                    <ul className="space-y-3">{insights.topPeople.map(([name, count]) => <li key={name} className="flex justify-between text-sm"><span className="text-slate-300">{name}</span><span className="font-semibold text-white">{count} moments</span></li>)}</ul>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white font-brand mb-4"><MapPin className="w-5 h-5 text-cyan-400"/> Top Locations</h3>
                    <ul className="space-y-3">{insights.topLocations.map(([loc, count]) => <li key={loc} className="flex justify-between text-sm"><span className="text-slate-300">{loc}</span><span className="font-semibold text-white">{count} times</span></li>)}</ul>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white font-brand mb-4"><Tag className="w-5 h-5 text-cyan-400"/> Top Activities</h3>
                    <ul className="space-y-3">{insights.topActivities.map(([act, count]) => <li key={act} className="flex justify-between text-sm"><span className="text-slate-300">{act}</span><span className="font-semibold text-white">{count} times</span></li>)}</ul>
                </div>
            </div>
            
            <div className="mb-12">
                <h2 className="text-3xl font-bold font-brand text-white mb-8 text-center">Your Life's Chapters</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {lifeChapters.map(chapter => (
                        <div key={chapter.year} className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10 flex flex-col sm:flex-row gap-6">
                            <div className="flex-shrink-0">
                                <p className={`text-sm font-semibold ${emotionConfig[chapter.dominantEmotion!]?.color || 'text-cyan-300'}`}>{chapter.year}</p>
                                <h3 className="text-2xl font-bold font-brand text-white mt-1">{chapter.title}</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 items-start">
                                {chapter.moments.slice(0, 5).map(m => (
                                    <img key={m.id} src={m.image || m.images?.[0]} className="w-16 h-16 rounded-md object-cover" alt={m.title} title={m.title}/>
                                ))}
                                {chapter.moments.length > 5 && <div className="w-16 h-16 rounded-md bg-slate-700/50 flex items-center justify-center text-slate-400 font-bold">+{chapter.moments.length - 5}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-2xl ring-1 ring-white/10 text-center">
                <Bot className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">æterny's Reflection</h2>
                <p className="text-slate-300 mt-2 max-w-2xl mx-auto italic">"Your journey is rich with moments of achievement and deep connection, particularly with Jane and Alex. Your travels to the California coast stand out as a period of great adventure, beautifully balanced by reflective moments at home. It's a story of growth, love, and exploration."</p>
            </div>
        </div>
    );
};

export default DataInsightPage;
