


import React, { useState } from 'react';
import { Steward, StewardRole, UserTier, Page } from '../types';
import { ArrowLeft, UserPlus, ShieldCheck, Mail, Video, Mic, FileText, Trash2, GitMerge, BookOpen, Wand2, Lock, Users, BookImage, Film, Headset } from 'lucide-react';
import LegacyIcon from './icons/LegacyIcon';
import LegacyLandingPage from './LegacyLandingPage';

interface LegacyTrustPageProps {
  onBack: () => void;
  userTier: UserTier;
  onNavigate: (page: Page) => void;
}

const initialStewards: Steward[] = [
  { id: '1', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'Successor', status: 'Certified' },
  { id: '2', name: 'Alex Smith', email: 'alex.s@example.com', role: 'Guardian', status: 'Active' },
];

const LegacyTrustPage: React.FC<LegacyTrustPageProps> = ({ onBack, userTier, onNavigate }) => {
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
        status: 'Pending',
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

   const getStatusStyle = (status: Steward['status']) => {
    switch (status) {
      case 'Certified': return 'bg-green-500/20 text-green-300';
      case 'Active': return 'bg-sky-500/20 text-sky-300';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (userTier !== 'legacy') {
    return <LegacyLandingPage onNavigate={onNavigate} />;
  }

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
                <p className="text-slate-400 mt-2 max-w-3xl">This is where you decide who can access and manage your story when you're no longer able to. Appoint trusted 'Stewards' to ensure your legacy is passed on securely.</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stewards */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
          <h2 className="text-2xl font-bold font-brand mb-6">Your Stewards</h2>
          <div className="space-y-4">
            {stewards.map(steward => (
              <div key={steward.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-700/50 p-4 rounded-lg gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white">
                    {steward.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{steward.name}</p>
                    <p className="text-sm text-slate-400">{steward.email}</p>
                  </div>
                </div>
                 <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(steward.status)}`}>{steward.status}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getRoleStyle(steward.role)}`}>{steward.role}</span>
                    <button onClick={() => alert('This would generate a sample legal agreement for this steward.')} className="text-slate-400 hover:text-white p-1"><FileText className="w-4 h-4"/></button>
                    <button onClick={() => handleRemoveSteward(steward.id)} className="text-slate-500 hover:text-red-400 p-1">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
          
          {isAdding ? (
            <form onSubmit={handleAddSteward} className="mt-6 p-4 bg-slate-900/50 rounded-lg space-y-4">
              <h3 className="font-semibold text-white">Appoint a New Steward</h3>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name" required className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email Address" required className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as StewardRole)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md">
                <option value="Guardian">Guardian</option>
                <option value="Co-Curator">Co-Curator</option>
                <option value="Successor">Successor</option>
              </select>
               <div className="flex items-start space-x-2 pt-2">
                <input type="checkbox" id="legal-understand" className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-cyan-600 focus:ring-cyan-500" required />
                <label htmlFor="legal-understand" className="text-xs text-slate-400">I understand this is a first step and legal consultation is recommended to make this appointment legally binding.</label>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-full text-sm">Cancel</button>
                <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-full text-sm">Send Invitation</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setIsAdding(true)} className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-colors">
              <UserPlus className="w-5 h-5" />
              Appoint a New Steward
            </button>
          )}
        </div>

        {/* Right: Protocol & Message & Legal */}
        <div className="space-y-8">
            <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
                <h2 className="text-2xl font-bold font-brand mb-4">Legal & Notary Services</h2>
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">We've partnered with German estate planning attorneys to help make your Lægacy Trust legally sound.</p>
                    <button className="w-full flex items-center gap-3 text-left bg-slate-700/50 hover:bg-slate-700 p-3 rounded-lg transition-colors">
                        <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-white text-sm">Schedule Legal Consultation</p>
                            <p className="text-xs text-slate-400">Speak with a legal partner.</p>
                        </div>
                    </button>
                     <button className="w-full flex items-center gap-3 text-left bg-slate-700/50 hover:bg-slate-700 p-3 rounded-lg transition-colors">
                        <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-white text-sm">Certify Appointments</p>
                            <p className="text-xs text-slate-400">Use a digital notary service.</p>
                        </div>
                    </button>
                </div>
            </div>
             <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
                <h2 className="text-2xl font-bold font-brand mb-4">Legacy Protocol</h2>
                 <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                        <ShieldCheck className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Protocol Status: Active</h3>
                        <p className="text-slate-400 mt-1 text-sm">æternacy will discreetly check in via email every 6 months. Upon unresponsiveness, we initiate a multi-step verification process with your designated Stewards before activating the protocol.</p>
                        <button className="mt-4 font-semibold text-amber-400 hover:text-amber-300 text-sm">
                            Adjust Settings &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
       <div className="mt-12 text-center text-xs text-slate-500 max-w-3xl mx-auto">
        <p><strong>Disclaimer:</strong> æternacy provides a framework for digital succession. For steward appointments to be legally binding under German Erbrecht (inheritance law) or your local jurisdiction, we strongly recommend consulting with an estate planning attorney. Our tools are designed to complement, not replace, formal legal advice and documentation.</p>
      </div>
    </div>
  );
};

export default LegacyTrustPage;