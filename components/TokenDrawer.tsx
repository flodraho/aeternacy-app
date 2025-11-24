import React, { useState } from 'react';
import { X, Zap, Loader2 } from 'lucide-react';
import { TokenState, UserTier } from '../types';
import { purchaseTokens, TOKEN_PACKS, TokenPack } from '../services/billingService';

// DEPRECATED: This component is no longer in use. Token management UI has been moved to `ProfilePage.tsx`.
// This file is kept for reference but should be removed in future cleanup.

interface TokenDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tokenState: TokenState;
  userTier: UserTier;
  onAddTokens: (amount: number) => void;
}

const TokenDrawer: React.FC<TokenDrawerProps> = ({ isOpen, onClose, tokenState, userTier, onAddTokens }) => {
  const [purchasing, setPurchasing] = useState<TokenPack | null>(null);

  if (!isOpen) return null;
  
  const handlePurchase = async (pack: TokenPack) => {
    setPurchasing(pack);
    try {
      const amount = await purchaseTokens(pack);
      onAddTokens(amount);
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setPurchasing(null);
    }
  };

  const tierName = userTier.charAt(0).toUpperCase() + userTier.slice(1).replace('æ', 'æm');

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end" onClick={onClose}>
      <div 
        className="w-full max-w-sm h-full bg-slate-800/90 backdrop-blur-md shadow-2xl ring-1 ring-white/10 flex flex-col" 
        style={{animation: 'slide-in-from-right 0.3s ease-out forwards'}}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slide-in-from-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
        <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold font-brand text-white flex items-center gap-2">
            <span className="font-brand">Tokæn</span> Balance
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          <div className="text-center mb-8">
            <p className="text-sm text-slate-400">Current Balance</p>
            <p className="text-6xl font-bold text-white font-brand">{tokenState.balance.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Your creative energy for advanced AI creations.</p>
          </div>
          
          <div className="bg-slate-700/50 p-4 rounded-lg mb-8">
             <h3 className="text-base font-semibold text-white mb-3">{tierName} Plan Details</h3>
             <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-300">Monthly Allocation:</span> <span className="font-semibold text-white font-mono">{tokenState.monthlyAllocation.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-300">Rollover from last month:</span> <span className="font-semibold text-white font-mono">{tokenState.rollover.toLocaleString()}</span></div>
                {userTier === 'essæntial' && (
                    <div className="pt-2 mt-2 border-t border-white/10 flex justify-between"><span className="text-slate-300">Free Header Animations:</span> <span className="font-semibold text-white font-mono">{tokenState.freeHeaderAnimations.total - tokenState.freeHeaderAnimations.used} / {tokenState.freeHeaderAnimations.total} left</span></div>
                )}
             </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-white mb-4">Refill Tokæn</h3>
            <div className="space-y-3">
              {(Object.keys(TOKEN_PACKS) as TokenPack[]).map(pack => (
                <button 
                  key={pack}
                  onClick={() => handlePurchase(pack)}
                  disabled={purchasing !== null}
                  className="w-full flex items-center justify-between bg-slate-700/50 hover:bg-slate-700 p-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="text-left">
                    <p className="font-bold text-white"><span className="font-mono">{TOKEN_PACKS[pack].amount.toLocaleString()}</span> Tokæn</p>
                    <p className="text-xs text-slate-400">{pack.charAt(0).toUpperCase() + pack.slice(1)} Refill Pack</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {purchasing === pack 
                      ? <Loader2 className="w-5 h-5 animate-spin"/>
                      : <span className="font-bold bg-cyan-600 text-white text-sm py-1 px-3 rounded-full">{TOKEN_PACKS[pack].price}</span>
                    }
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">Your purchase will be processed securely.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDrawer;