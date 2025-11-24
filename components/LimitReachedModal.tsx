
import React from 'react';
import { X, ArrowRight, Trash2 } from 'lucide-react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onManageMoments: () => void;
  reason: 'moments' | 'time' | null;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ isOpen, onClose, onUpgrade, onManageMoments, reason }) => {
  if (!isOpen) return null;

  const title = reason === 'time' 
      ? "Your 90-day free trial has ended" 
      : "You've reached your 100-momænt limit";
  
  const message = reason === 'time'
      ? "You're on the Free plan which is limited to 90 days of use. To continue creating and curating memories, please upgrade to a Fæmily plan."
      : "You're on the Free plan which is limited to 100 momænts. To create more memories, you can either upgrade for unlimited momænts or manage your existing collection.";


  return (
    <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fade-in-up-modal {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg" style={{ animation: 'fade-in-up-modal 0.3s ease-out forwards' }} onClick={e => e.stopPropagation()}>
        <div className="p-8">
          <h2 className="text-2xl font-bold font-brand text-white mb-2">{title}</h2>
          <p className="text-slate-400 mb-6">{message}</p>
          
          <div className="space-y-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-white">1. Upgrade to Fæmily</h3>
                <p className="text-sm text-slate-300 mt-1">Get unlimited momænts, family collaboration, 4,000 Tokæn/month, and advanced AI features.</p>
            </div>
            {reason === 'moments' && (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-white">2. Manage Your Momænts</h3>
                    <p className="text-sm text-slate-300 mt-1">Delete older or less important momænts to free up space in your collection.</p>
                </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            {reason === 'moments' && (
                <button onClick={onManageMoments} className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-full text-sm">
                    <Trash2 className="w-4 h-4" /> Manage Momænts
                </button>
            )}
            <button onClick={onUpgrade} className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-6 rounded-full text-sm">
              Upgrade to Fæmily <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedModal;
