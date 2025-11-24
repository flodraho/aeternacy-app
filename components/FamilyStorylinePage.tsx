
import React, { useMemo } from 'react';
import { Moment } from '../types';
import { ArrowLeft, Users } from 'lucide-react';

interface FamilyStorylinePageProps {
  moments: Moment[];
  onBack: () => void;
}

const FamilyStorylinePage: React.FC<FamilyStorylinePageProps> = ({ moments, onBack }) => {

  const storylineMoments = useMemo(() => {
    return moments
      .filter(m => m.type === 'standard' || m.type === 'focus')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [moments]);

  return (
    <div className="container mx-auto px-6 pt-28 pb-8 animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Fæmily Space
      </button>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">The Fæmily Storyline</h1>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">An interactive timeline of your shared history, connecting every memory into one continuous story.</p>
      </div>
      
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative storyline-container flex flex-col p-4">
          {storylineMoments.map((moment, index) => (
            <div key={moment.id} className="storyline-item mb-8">
              <div className="bg-slate-800/60 p-4 rounded-xl ring-1 ring-white/10 backdrop-blur-sm">
                <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-40 object-cover rounded-lg mb-3"/>
                <p className="text-xs text-slate-400">{moment.date}</p>
                <h3 className="font-bold text-white font-brand">{moment.title}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{moment.description}</p>
                {moment.people && moment.people.length > 0 && (
                   <div className="flex items-center gap-2 mt-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <p className="text-xs text-slate-400">{moment.people.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FamilyStorylinePage;