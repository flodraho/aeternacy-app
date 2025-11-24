

import React, { useState } from 'react';
import { Moment, TimeCapsule, Page, UserTier } from '../types';
import { CheckCircle, Loader2, Share2, ArrowLeft, Clock, ShieldCheck, Edit, Trash2 } from 'lucide-react';
import { createLegacyLetter } from '../services/geminiService';
import { TOKEN_COSTS } from '../services/costCatalog';
import Tooltip from './Tooltip';
import LegacyLandingPage from './LegacyLandingPage';

interface TimeCapsulePageProps {
  moments: Moment[];
  onBack: () => void;
  triggerConfirmation: (cost: number, featureKey: string, onConfirm: () => Promise<any>, message?: string) => void;
  userTier: UserTier;
  onNavigate: (page: Page) => void;
}

type CapsuleState = 'selecting' | 'generating' | 'viewing';

const TimeCapsulePage: React.FC<TimeCapsulePageProps> = ({ moments, onBack, triggerConfirmation, userTier, onNavigate }) => {
  const [state, setState] = useState<CapsuleState>('selecting');
  const [selectedMomentIds, setSelectedMomentIds] = useState<Set<string>>(new Set());
  const [legacyLetter, setLegacyLetter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [sealedCapsules, setSealedCapsules] = useState<TimeCapsule[]>([
    { 
      id: 'tc1', 
      name: "For Julia's 18th Birthday", 
      openDate: 'October 23, 2035', 
      recipient: 'julia.doe@example.com', 
      momentIds: ['2', '7'], 
      status: 'Active' 
    }
  ]);

  const handleToggleMoment = (id: string) => {
    setSelectedMomentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const executeGeneration = async () => {
      if (selectedMomentIds.size === 0) return;
      setState('generating');
      setError(null);
      try {
        const selectedMoments = moments.filter(m => selectedMomentIds.has(m.id));
        const letter = await createLegacyLetter(selectedMoments);
        setLegacyLetter(letter);
        setState('viewing');
        console.log("TELEMETRY: creative_energy_used, feature: TIME_CAPSULE_SEAL, cost: " + TOKEN_COSTS.TIME_CAPSULE_SEAL);
      } catch (err) {
        console.error("Failed to create Legacy Letter", err);
        setError("Sorry, æterny couldn't create your letter at this time. Please try again.");
        setState('selecting');
        throw err; // Re-throw for token refund
      }
  };

  const handleGenerate = () => {
    triggerConfirmation(TOKEN_COSTS.TIME_CAPSULE_SEAL, 'TIME_CAPSULE_SEAL', executeGeneration);
  };

  const selectedMoments = moments.filter(m => selectedMomentIds.has(m.id));

  if (userTier !== 'legacy') {
      return <LegacyLandingPage onNavigate={onNavigate} />;
  }
  
  const renderGenerator = () => {
    switch(state) {
      case 'generating':
        return (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-cyan-400 mx-auto animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-white font-brand">Crafting Your Legacy Letter</h2>
              <p className="text-slate-400 mt-2">æterny is reflecting on your moments to write your story...</p>
            </div>
          </div>
        );
      
      case 'viewing':
        return (
          <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white font-brand">Your New Time Capsule</h1>
                <p className="text-slate-400">A reflection on {selectedMoments.length} cherished momænts.</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setState('selecting')} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </header>
            <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8 md:p-12">
              <div className="font-serif-legacy legacy-letter-content max-w-3xl mx-auto">
                {legacyLetter.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="border-t border-white/20 my-8"></div>
              <h3 className="text-xl font-bold font-brand text-white mb-4 text-center">Included Momænts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {selectedMoments.map(moment => (
                  <div key={moment.id} className="aspect-square rounded-lg overflow-hidden group relative">
                    <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <p className="absolute bottom-2 left-2 text-white text-xs font-bold leading-tight">{moment.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'selecting':
      default:
        return (
          <div className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white font-brand">Create a New Time Capsule</h2>
              <p className="text-slate-400 mt-2">Select the momænts you want æterny to weave into a narrative Legacy Letter.</p>
            </div>
            
            {error && <p className="text-center text-red-400 bg-red-900/30 p-3 rounded-lg mb-6">{error}</p>}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {moments.map(moment => (
                <button 
                  key={moment.id} 
                  onClick={() => handleToggleMoment(moment.id)}
                  className={`aspect-square rounded-lg overflow-hidden group relative text-left transition-all duration-300 ${selectedMomentIds.has(moment.id) ? 'transform scale-95' : ''}`}
                >
                  <img src={moment.image || moment.images?.[0]} alt={moment.title} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-black transition-opacity ${selectedMomentIds.has(moment.id) ? 'opacity-60' : 'opacity-40 group-hover:opacity-20'}`}></div>
                  <div className="absolute inset-0 p-3 flex flex-col justify-end">
                    <h3 className="font-bold text-white text-sm leading-tight">{moment.title}</h3>
                    <p className="text-xs text-slate-400">{moment.date}</p>
                  </div>
                  {selectedMomentIds.has(moment.id) && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center ring-4 ring-slate-900">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="sticky bottom-0 mt-8 py-4 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center gap-4">
              <p className="text-white font-semibold">
                {selectedMomentIds.size} momænt{selectedMomentIds.size !== 1 && 's'} selected
              </p>
              <button 
                onClick={handleGenerate} 
                disabled={selectedMomentIds.size === 0}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Create Legacy Letter
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-6 pt-28 pb-8">
        <button onClick={onBack} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-12">
            <ArrowLeft className="w-4 h-4"/> Back to Lægacy Space
        </button>
        
        {/* Sealed Capsules Section */}
        <div className="mb-16">
            <h2 className="text-3xl font-bold font-brand text-white mb-6">Sealed Time Capsules</h2>
            <div className="space-y-4">
                {sealedCapsules.map(capsule => (
                    <div key={capsule.id} className="bg-gray-800/50 p-4 rounded-2xl ring-1 ring-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <p className="font-bold text-white text-lg">{capsule.name}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> Unseals: {capsule.openDate}</span>
                                <span>For: {capsule.recipient}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/20 text-green-300">
                                <ShieldCheck className="w-4 h-4"/> Active & Secured
                            </span>
                             <button className="text-slate-500 hover:text-white p-2"><Edit className="w-4 h-4"/></button>
                            <button className="text-slate-500 hover:text-red-400 p-2"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 bg-slate-800 p-4 rounded-lg text-sm text-slate-400 text-center">
              <p>Your <strong>Lægacy subscription</strong> ensures the continuous security, data integrity, and guaranteed future delivery of your sealed Time Capsules. If your subscription lapses, your capsules will be paused and will not be delivered until the subscription is reactivated.</p>
            </div>
        </div>

        <div className="border-t border-white/10 pt-12">
            {renderGenerator()}
        </div>
    </div>
  );
};

export default TimeCapsulePage;
