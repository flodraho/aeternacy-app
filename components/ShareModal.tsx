import React, { useState } from 'react';
import { Moment, Journey, UserTier } from '../types';
import { X, Users, Send } from 'lucide-react';

interface ShareModalProps {
  item: Moment | Journey;
  onClose: () => void;
  onUpdateItem: (item: Moment | Journey) => void;
  onShareToFamily: (item: Moment | Journey) => void;
  userTier: UserTier;
}

const ShareModal: React.FC<ShareModalProps> = ({ item, onClose, onUpdateItem, onShareToFamily, userTier }) => {
  const [email, setEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return '?';
    const words = name.split(' ');
    if (words.length > 1) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const newCollaborator = getInitials(email.split('@')[0]);
    const updatedCollaborators = [...(item.collaborators || []), newCollaborator];
    
    onUpdateItem({ ...item, collaborators: updatedCollaborators });
    
    setEmail('');
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
  };
  
  const handleShareToFamily = () => {
    onShareToFamily(item);
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white font-brand">Collaborate on "{item.title}"</h2>
          </div>
          
          {(userTier === 'fæmily' || userTier === 'legacy') && (
            <div className="mb-6">
                <button 
                  onClick={handleShareToFamily}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Share to Fæmily Space
                </button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-700" /></div>
                  <div className="relative flex justify-center text-sm"><span className="bg-slate-800 px-2 text-slate-400">or invite individuals</span></div>
                </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Shared With</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center -space-x-2">
                {(item.collaborators || []).map((name, index) => (
                    <div key={index} title={name} className="w-10 h-10 rounded-full bg-slate-600 ring-2 ring-slate-800 flex items-center justify-center text-sm font-bold text-white">
                        {getInitials(name)}
                    </div>
                ))}
              </div>
              {(item.collaborators || []).length === 0 && (
                <p className="text-sm text-slate-500">You haven't shared this yet.</p>
              )}
            </div>
          </div>

          <form onSubmit={handleInvite}>
            <label htmlFor="email-invite" className="text-sm font-semibold text-slate-400 mb-2 block">Invite Others via Email</label>
            <div className="flex gap-2">
              <input
                id="email-invite"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address..."
                className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500"
              />
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-3 rounded-md transition-colors flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span>Invite</span>
              </button>
            </div>
            {inviteSent && <p className="text-sm text-green-400 mt-2">Invitation sent!</p>}
          </form>
          
          {userTier !== 'fæmily' && userTier !== 'legacy' && (
            <div className="mt-8 p-4 bg-gradient-to-r from-indigo-900/40 to-purple-900/30 rounded-lg ring-1 ring-indigo-500/50">
              <h4 className="font-bold text-white font-brand">Unlock Your Fæmily Storyline</h4>
              <p className="text-sm text-slate-300 mt-1 mb-4">Upgrade to a Fæmily Plan to combine all your shared momænts into one beautiful, continuous timestream. A shared legacy, built together.</p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-md transition-colors">
                Learn About Fæmily Plans
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;