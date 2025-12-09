
import React from 'react';
import { X, Zap, Loader2 } from 'lucide-react';
import TokenIcon from './icons/TokenIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: React.ReactNode;
  cost: number;
  isLoading?: boolean;
}

const tokenExplanation = `We introduced Tokæn as a way to fuel your most ambitious creative projects within æternacy. Think of them as your personal 'creative energy,' reserved for the most advanced AI creations—like bringing a photo to life with a stunning animation or having æternacy craft a deeply personal video reflection.

These powerful features require significant energy from our dedicated AI servers. By using Tokæn, we can all be more mindful of this energy, ensuring that every creation is intentional and meaningful. This approach allows us to keep the core æternacy experience—capturing, curating, and sharing your everyday moments—completely free and unlimited, while making sure the platform remains powerful and sustainable for every storyteller's journey.`;


const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, cost, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" style={{animation: 'fade-in 0.2s ease-out forwards'}} onClick={onClose}>
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md" style={{animation: 'fade-in-up 0.3s ease-out forwards'}} onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold font-brand text-white mb-2">{title}</h2>
          <div className="text-slate-400 text-sm mb-6">{message || "This creation will use creative energy. Continue?"}</div>
          
          <div className="bg-slate-700/50 p-4 rounded-lg text-center mb-6">
            <p className="text-sm text-slate-300">This will use</p>
            <div className="flex items-center justify-center gap-2 cursor-help" title={tokenExplanation}>
                <p className="text-3xl font-bold text-white font-mono">
                {cost.toLocaleString()}
                </p>
                <TokenIcon className="w-7 h-7 text-cyan-400" />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button onClick={onClose} disabled={isLoading} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-full text-sm">Cancel</button>
            <button onClick={onConfirm} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-6 rounded-full text-sm flex items-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
