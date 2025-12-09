import React, { useState } from 'react';
import { Steward, StewardRole } from '../types';
import { ArrowLeft, UserPlus, ShieldCheck, Mail, Video, Mic, FileText, Trash2 } from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';

interface LegacyTrustPageProps {
  onBack: () => void;
}

const initialStewards: Steward[] = [
  { id: '1', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'Successor' },
  { id: '2', name: 'Alex Smith', email: 'alex.s@example.com', role: 'Guardian' },
];

const LegacyTrustPage: React.FC<LegacyTrustPageProps> = ({ onBack }) => {
  const [stewards, setStewards] = useState<Steward[]>(initialStewards);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<StewardRole>('Guardian');

  const handleAddSteward = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newEmail) {
      const newSteward: Steward = {
        id: Date.now().toString(),
        name: newName,
        email: newEmail,
        role: newRole,
      };
      setStewards(prev => [...prev, newSteward]);
      setNewName('');
      setNewEmail('');
      setNewRole('Guardian');
      setIsAdding(false);
    }
  };

  const handleRemoveSteward = (id: string) => {
    setStewards(prev => prev.filter(steward => steward.id !== id));
  };
  
  const getRoleStyle = (role: StewardRole) => {
    switch (role) {
      case 'Successor': return 'bg-amber-500/20 text-amber-300';
      case 'Guardian': return 'bg-sky-500/20 text-sky-300';
      case 'Co-Curator': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-6 pt-28 pb-8 animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Lægacy Space
      </button>

      <div className="mb-12">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center ring-1 ring-amber-500/20">
                <LegacyIcon className="w-8 h-8 text-amber-400" />
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">The Legacy Trust</h1>
                <p className="text-slate-400 mt-2 max-w-3xl">Ensure your story endures. Appoint trusted individuals to safeguard your legacy and define how it's passed on.</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stewards */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
          <h2 className="text-2xl font-bold font-brand mb-6">Your Stewards</h2>
          <div className="space-y-4">
            {stewards.map(steward => (
              <div key={steward.id} className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white">
                    {steward.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{steward.name}</p>
                    <p className="text-sm text-slate-400">{steward.email}</p>
                  </div>
                </div>
                 <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getRoleStyle(steward.role)}`}>{steward.role}</span>
                    <button onClick={() => handleRemoveSteward(steward.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
              </div>
            ))}
          </div>
          
          {isAdding ? (
            <form onSubmit={handleAddSteward} className="mt-6 p-4 bg-slate-900/50 rounded-lg space-y-4">
              <h3 className="font-semibold text-white">Add a New Steward</h3>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name" required className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email Address" required className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as StewardRole)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md">
                <option value="Guardian">Guardian</option>
                <option value="Co-Curator">Co-Curator</option>
                <option value="Successor">Successor</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-full text-sm">Cancel</button>
                <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-full text-sm">Add Steward</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setIsAdding(true)} className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-colors">
              <UserPlus className="w-5 h-5" />
              Appoint a New Steward
            </button>
          )}

        </div>

        {/* Right: Protocol & Message */}
        <div className="space-y-8">
            <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
                <h2 className="text-2xl font-bold font-brand mb-4">Legacy Protocol</h2>
                 <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                        <ShieldCheck className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Protocol Status: Active</h3>
                        <p className="text-slate-400 mt-1 text-sm">æternacy will discreetly check in every 6 months. If you are unresponsive, the protocol will initiate to transfer stewardship to your designated Successor.</p>
                        <button className="mt-4 font-semibold text-amber-400 hover:text-amber-300 text-sm">
                            Adjust Settings &rarr;
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
                <h2 className="text-2xl font-bold font-brand mb-4">Message for the Future</h2>
                 <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                        <Mail className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Record a Private Message</h3>
                        <p className="text-slate-400 mt-1 text-sm">Record a personal video, audio, or text message that will only be unlocked for your Successor when the Legacy Protocol is activated.</p>
                         <div className="mt-4 flex flex-wrap gap-2">
                            <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-full text-sm"><Video className="w-4 h-4"/> Record Video</button>
                            <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-full text-sm"><Mic className="w-4 h-4"/> Record Audio</button>
                            <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-full text-sm"><FileText className="w-4 h-4"/> Write Text</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LegacyTrustPage;