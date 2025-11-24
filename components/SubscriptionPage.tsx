

import React from 'react';
import { Page, UserTier } from '../types';
import { ArrowLeft, CheckCircle, CreditCard, Download, HardDrive } from 'lucide-react';

interface SubscriptionPageProps {
  userTier: UserTier;
  onNavigate: (page: Page) => void;
  momentsCount: number;
  daysRemaining: number | null;
}

const tierDetails = {
  free: { name: 'Free', price: '€0/month', description: 'Basic access' },
  essæntial: { name: 'Essæntial', price: '€9/month', description: 'For every beginning.' },
  fæmily: { name: 'Fæmily', price: '€15/month', description: 'Weave your stories together.' },
  fæmilyPlus: { name: 'Fæmily Plus', price: '€25/month', description: 'For larger families & archives.' },
  legacy: { name: 'Lægacy', price: '€45/month', description: 'Preserve your story for generations.' },
};

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ userTier, onNavigate, momentsCount, daysRemaining }) => {
  const currentTier = tierDetails[userTier];

  // Placeholder data
  const billingHistory = [
    { id: 'inv_12345', date: 'June 1, 2024', amount: '€19.00', status: 'Paid' },
    { id: 'inv_12344', date: 'May 1, 2024', amount: '€19.00', status: 'Paid' },
    { id: 'inv_12343', date: 'April 1, 2024', amount: '€9.00', status: 'Paid' },
  ];
  
  const usage = {
    moments: { current: 157, limit: 'Unlimited' },
    storage: { current: '12.4 GB', limit: 'Unlimited' },
    veoScenes: { current: 3, limit: userTier === 'legacy' ? 5 : (userTier === 'fæmily' ? 1 : 0) },
    familyMembers: { current: userTier === 'fæmily' ? 3 : (userTier === 'legacy' ? 5 : 1), limit: userTier === 'fæmily' ? 5 : (userTier === 'legacy' ? 'Unlimited' : 1) }
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

      {userTier === 'free' && (
        <div className="bg-gray-800/50 rounded-2xl ring-1 ring-cyan-500/30 border border-cyan-500/20 p-8 mb-8">
            <h2 className="text-2xl font-bold font-brand mb-6 text-center">Free Trial Status</h2>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-baseline mb-1 text-sm">
                        <label className="font-semibold text-slate-300">Moments Created</label>
                        <span className={`font-mono font-semibold ${momentsCount > 100 ? 'text-red-400' : 'text-white'}`}>{momentsCount} / 100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${momentsCount > 100 ? 'bg-red-500' : 'bg-cyan-400'}`} style={{ width: `${Math.min(100, (momentsCount / 100) * 100)}%` }}></div>
                    </div>
                </div>
                {daysRemaining !== null && (
                    <div>
                        <div className="flex justify-between items-baseline mb-1 text-sm">
                            <label className="font-semibold text-slate-300">Trial Days Remaining</label>
                            <span className={`font-mono font-semibold ${daysRemaining <= 5 ? 'text-red-400' : daysRemaining <= 10 ? 'text-amber-400' : 'text-white'}`}>{daysRemaining} Days</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${daysRemaining <= 5 ? 'bg-red-500' : daysRemaining <= 10 ? 'bg-amber-500' : 'bg-cyan-400'}`} style={{ width: `${(daysRemaining / 90) * 100}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-8 text-center">
                <p className="text-slate-400 mb-4">Upgrade now for unlimited moments, family collaboration, and advanced AI features.</p>
                <button onClick={() => onNavigate(Page.ComparePlans)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full transition-colors">
                    Compare Plans & Upgrade
                </button>
            </div>
        </div>
      )}

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
            <h2 className="text-2xl font-bold font-brand mb-4">Plans & Pricing</h2>
            <p className="text-sm text-slate-400 mb-4">Explore our plans to find the perfect fit for your legacy.</p>
            <button onClick={() => onNavigate(Page.ComparePlans)} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-full transition-colors">
              Compare All Plans
            </button>
            <div className="mt-4 space-y-2">
                <button onClick={() => onNavigate(Page.ComparePlans)} className="w-full text-left p-3 rounded-lg hover:bg-slate-700/50 text-sm font-semibold text-amber-300">Upgrade to Lægacy</button>
                <button onClick={() => {}} className="w-full text-left p-3 rounded-lg hover:bg-slate-700/50 text-sm text-slate-300">Downgrade Plan</button>
                <button onClick={() => {}} className="w-full text-left p-3 rounded-lg hover:bg-slate-700/50 text-sm text-red-400">Cancel Subscription</button>
            </div>
          </div>
          
          {/* Usage & Limits */}
          {userTier !== 'free' && (
            <div className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-8">
                <h2 className="text-2xl font-bold font-brand mb-4">Usage & Limits</h2>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center"><span className="text-slate-400">Momænts Created</span> <span className="font-semibold text-white">{usage.moments.current} / {usage.moments.limit}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Cloud Storage</span> <span className="font-semibold text-white">{usage.storage.current} / {usage.storage.limit}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Living Header Images</span> <span className="font-semibold text-white">{usage.veoScenes.current} / {usage.veoScenes.limit}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Family Members</span> <span className="font-semibold text-white">{usage.familyMembers.current} / {usage.familyMembers.limit}</span></div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;