import React, { useEffect } from 'react';
import { X, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export type ToastMessage = {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
};

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

const icons = {
  info: <Info className="w-5 h-5 text-sky-300" />,
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <AlertTriangle className="w-5 h-5 text-red-400" />,
};

const ringColors = {
  info: 'ring-sky-500/50',
  success: 'ring-green-500/50',
  error: 'ring-red-500/50',
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div 
        className={`fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md rounded-lg shadow-2xl p-4 flex items-center gap-4 ring-1 ${ringColors[toast.type]} z-[100]`}
        style={{ animation: 'fade-in-down 0.3s ease-out forwards' }}
    >
       <style>{`
          @keyframes fade-in-down {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}</style>
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="text-sm text-slate-200">{toast.message}</p>
      <button onClick={onDismiss} className="text-slate-500 hover:text-white ml-4">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;