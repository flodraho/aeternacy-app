
import React, { useState, useMemo } from 'react';
import { Page, UserTier } from '../types';
import { ArrowLeft, CheckCircle, CreditCard, Download, HardDrive, Calculator, Film, BookOpen, Wand2, Star, Zap, Loader2 } from 'lucide-react';
import { TOKEN_COSTS } from '../services/costCatalog';
import TokenIcon from './icons/TokenIcon';

interface SubscriptionPageProps {
  userTier: UserTier;
  onNavigate: (page: Page) => void;
}

const tierDetails = {
  free: { name: 'Free', price: '€0/month', description: 'Forever free basic access.' },
  essæntial: { name: 'Essæntial', price: '€4.99/month', description: 'Includes 30-day free trial.' },
  fæmily: { name: 'Fæmily', price: '€14.99/month', description: 'Weave stories with up to 10 members.' },
  legacy: { name: 'Lægacy', price: '€29.99/month', description: 'Preserve your story for generations.' },
};

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ userTier, onNavigate }) => {
  const currentTier = tierDetails[userTier] || tierDetails.free;

  // Calculator State
  const [calcVideos, setCalcVideos] = useState(2);
  const [calcMagazines, setCalcMagazines] = useState(1);
  const [calcAnimations, setCalcAnimations] = useState(5);

  const { monthlyTokensNeeded, recommendedPlan } = useMemo(() => {
    // Basic calculation logic
    const videoCost = calcVideos * TOKEN_COSTS.AI_VIDEO_REFLECTION;
    const magazineCost = (calcMagazines / 12) * TOKEN_COSTS.MAGAZINE_ISSUE; // normalized to monthly cost roughly
    const animationCost = calcAnimations * TOKEN_COSTS.HEADER_ANIMATION;
    
    const needed = videoCost + magazineCost + animationCost;
    
    let plan = 'Essæntial';
    if (needed > 8000) {
        plan = 'Lægacy';
    } else if (needed > 2000) {
        plan = 'Fæmily';
    } else {
        plan = 'Essæntial';
    }

    return { monthlyTokensNeeded: Math.ceil(needed), recommendedPlan: plan };
  }, [calcVideos, calcMagazines, calcAnimations]);

  // Placeholder data
  const billingHistory = [
    { id: 'inv_12345', date: 'June 1, 2024', amount: '€14.99', status: 'Paid' },
    { id: 'inv_12344', date: 'May 1, 2024', amount: '€14.99', status: 'Paid' },
    { id: 'inv_12343', date: 'April 1, 2024', amount: '€4.99', status: 'Paid' },
  ];
  
  const usage = {
    moments: { current: 157, limit: 'Unlimited' },
    storage: { current: '12.4 GB', limit: 'Unlimited' },
    veoScenes: { current: 3, limit: userTier === 'legacy' ? 5 : (userTier === 'fæmily' ? 3 : 0) },
    familyMembers: { current: userTier === 'fæmily' ? 3 : (userTier === 'legacy' ? 5 : 1), limit: userTier === 'fæmily' ? 10 : (userTier === 'legacy' ? 'Unlimited' : 1) }
  };

  return (
    <div className="container mx-auto px-6 pt-28 pb-12 animate-fade-in-up">
      <button onClick={() => onNavigate(Page.Profile)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </button>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white font-brand">Subscription & Billing</h1>
        <p className="text-slate-400 mt-2">Manage your æternacy membership.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
            <h2 className="text-2xl font-bold font-brand mb-4">Overview</h2>
            <div className="bg-slate-700/50 p-6 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <p className="text-sm text-slate-400">Your current plan</p>
                <p className="text-xl font-bold text-white">{currentTier.name}</p>
                <p className="text-sm text-slate-300">{currentTier.description}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl font-bold text-white">{currentTier.price}</p>
                <p className="text-sm text-slate-400">Next payment on July 1, 2024</p>
              </div>
            </div>
          </div>

          {/* Usage Estimator (Calculator) */}
          <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
             <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-6 h-6 text-cyan-400"/>
                <h2 className="text-2xl font-bold font-brand text-white">Plan Finder</h2>
             </div>
             <p className="text-slate-400 text-sm mb-6">Not sure which plan is right for you? Use our estimator based on your creative needs.</p>
             
             <div className="space-y-6">
                {/* Sliders */}
                <div className="bg-slate-900/50 p-5 rounded-2xl ring-1 ring-white/5 hover:ring-cyan-500/30 transition-all group">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <Film className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">AI Video Reflections</h4>
                                <p className="text-xs text-slate-400">Cinematic movies of your memories</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-white font-mono">{calcVideos}</span>
                            <span className="text-xs text-slate-500 block">/ month</span>
                        </div>
                    </div>
                    <input type="range" min="0" max="10" value={calcVideos} onChange={e => setCalcVideos(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"/>
                </div>

                <div className="bg-slate-900/50 p-5 rounded-2xl ring-1 ring-white/5 hover:ring-cyan-500/30 transition-all group">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Mægazine Issues</h4>
                                <p className="text-xs text-slate-400">Curated digital & print-ready digests</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-white font-mono">{calcMagazines}</span>
                            <span className="text-xs text-slate-500 block">/ year</span>
                        </div>
                    </div>
                    <input type="range" min="0" max="12" value={calcMagazines} onChange={e => setCalcMagazines(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"/>
                </div>
                
                 <div className="bg-slate-900/50 p-5 rounded-2xl ring-1 ring-white/5 hover:ring-cyan-500/30 transition-all group">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <Wand2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Living Photos</h4>
                                <p className="text-xs text-slate-400">Short animations for your dashboard</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-white font-mono">{calcAnimations}</span>
                            <span className="text-xs text-slate-500 block">/ month</span>
                        </div>
                    </div>
                    <input type="range" min="0" max="20" value={calcAnimations} onChange={e => setCalcAnimations(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
                </div>
                
                {/* Result */}
                <div className="bg-slate-700/30 p-6 rounded-xl text-center border-t border-white/10 mt-6">
                    <p className="text-slate-400 text-sm mb-2">Estimated Usage</p>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-4xl font-bold text-white font-mono">{monthlyTokensNeeded.toLocaleString()}</span>
                        <TokenIcon className="w-6 h-6 text-slate-400"/> <span className="text-sm text-slate-400">/ mo</span>
                    </div>
                    <p className="text-sm text-slate-300">We recommend the <span className={`font-bold ${recommendedPlan === 'Lægacy' ? 'text-amber-400' : recommendedPlan === 'Fæmily' ? 'text-indigo-400' : 'text-cyan-400'}`}>{recommendedPlan} Plan</span></p>
                </div>
             </div>
          </div>

          {/* Billing History */}
          <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
            <h2 className="text-2xl font-bold font-brand mb-4">Billing History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-2 font-semibold text-slate-400">Date</th>
                    <th className="py-2 font-semibold text-slate-400">Amount</th>
                    <th className="py-2 font-semibold text-slate-400">Status</th>
                    <th className="py-2 font-semibold text-slate-400 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map(item => (
                    <tr key={item.id} className="border-b border-slate-800">
                      <td className="py-4 text-slate-300">{item.date}</td>
                      <td className="py-4 text-slate-300">{item.amount}</td>
                      <td className="py-4">
                        <span className="flex items-center gap-1.5 text-green-400">
                          <CheckCircle className="w-4 h-4" /> {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 ml-auto">
                          <Download className="w-4 h-4" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="text-sm text-slate-400 hover:text-white mt-4">View older history</button>
          </div>
          
           {/* Storage Add-ons */}
          <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
            <h2 className="text-2xl font-bold font-brand mb-4">Storage Add-ons</h2>
            <p className="text-sm text-slate-400 mb-4">Need more space for your growing legacy? Add storage to your Fæmily Vault.</p>
            <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <HardDrive className="w-6 h-6 text-cyan-400"/>
                    <div>
                        <p className="font-bold text-white">Fæmily Vault +1 TB</p>
                        <p className="text-xs text-slate-400">Add 1 Terabyte of secure storage to your Fæmily account.</p>
                    </div>
                </div>
                <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors">
                    €4.99/mo
                </button>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Plans & Pricing */}
          <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
            <h2 className="text-2xl font-bold font-brand mb-6">Change Plan</h2>
            <p className="text-sm text-slate-400 mb-4">Explore our plans to find the perfect fit.</p>
            <div className="space-y-3">
                <button className="w-full text-left p-4 rounded-lg border border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors flex justify-between items-center group">
                    <div>
                        <p className="font-bold text-white">Starter</p>
                        <p className="text-xs text-slate-400">Forever Free</p>
                    </div>
                    <span className="text-sm text-white group-hover:text-cyan-400">€0</span>
                </button>
                <button className="w-full text-left p-4 rounded-lg border border-cyan-900 bg-cyan-950/20 hover:border-cyan-700 transition-colors flex justify-between items-center group">
                    <div>
                        <p className="font-bold text-white">Essæntial</p>
                        <p className="text-xs text-slate-400">Includes 30-day Trial</p>
                    </div>
                    <span className="text-sm text-cyan-300 font-bold">€4.99</span>
                </button>
                <button className="w-full text-left p-4 rounded-lg border border-indigo-500 bg-indigo-950/30 hover:bg-indigo-900/40 transition-colors flex justify-between items-center group relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-indigo-500 text-[9px] font-bold px-2 text-white rounded-bl-md uppercase">Popular</div>
                    <div>
                        <p className="font-bold text-white">Fæmily</p>
                        <p className="text-xs text-indigo-200">Shared Storyline (10 Members)</p>
                    </div>
                    <span className="text-sm text-indigo-300 font-bold">€14.99</span>
                </button>
                <button className="w-full text-left p-4 rounded-lg border border-amber-500/50 bg-amber-950/20 hover:bg-amber-900/30 transition-colors flex justify-between items-center group">
                    <div>
                        <p className="font-bold text-amber-400">Lægacy</p>
                        <p className="text-xs text-slate-400">Timeless preservation</p>
                    </div>
                    <span className="text-sm text-amber-400 font-bold">€29.99</span>
                </button>
            </div>
            <button className="w-full mt-6 text-sm text-red-400 hover:text-red-300 underline">Cancel Subscription</button>
          </div>
          
          {/* Usage & Limits */}
          <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
             <h2 className="text-2xl font-bold font-brand mb-4">Usage & Limits</h2>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center"><span className="text-slate-400">Momænts Created</span> <span className="font-semibold text-white">{usage.moments.current} / {usage.moments.limit}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Cloud Storage</span> <span className="font-semibold text-white">{usage.storage.current} / {usage.storage.limit}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Living Header Images</span> <span className="font-semibold text-white">{usage.veoScenes.current} / {usage.veoScenes.limit}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Family Members</span> <span className="font-semibold text-white">{usage.familyMembers.current} / {usage.familyMembers.limit}</span></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
