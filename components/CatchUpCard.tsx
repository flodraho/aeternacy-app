
import React from 'react';
import { X } from 'lucide-react';

interface CatchUpCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  onDismiss: () => void;
}

const CatchUpCard: React.FC<CatchUpCardProps> = ({ icon: Icon, title, description, buttonText, onButtonClick, onDismiss }) => {
  return (
    <div className="relative bg-gradient-to-br from-cyan-900/80 to-teal-900/60 p-6 rounded-2xl ring-2 ring-cyan-400/30 overflow-hidden animate-fade-in-up">
      <button onClick={onDismiss} className="absolute top-3 right-3 text-slate-400 hover:text-white">
        <X size={18} />
      </button>
      <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="flex-shrink-0 w-16 h-16 bg-cyan-500/20 rounded-xl flex items-center justify-center ring-1 ring-cyan-500/20">
          <Icon className="w-8 h-8 text-cyan-300" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white font-brand">{title}</h3>
          <p className="text-slate-300 mt-1 text-sm">{description}</p>
        </div>
        <button onClick={onButtonClick} className="w-full sm:w-auto mt-4 sm:mt-0 sm:ml-auto flex-shrink-0 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-6 rounded-full transition-colors whitespace-nowrap">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default CatchUpCard;
