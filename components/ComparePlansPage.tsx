

import React, { useState } from 'react';
import { Page } from '../types';
import { ArrowLeft, Check, HelpCircle, ArrowRight, GitBranch } from 'lucide-react';
import Tooltip from './Tooltip';

interface ComparePlansPageProps {
  onNavigate: (page: Page) => void;
}

const ComparePlansPage: React.FC<ComparePlansPageProps> = ({ onNavigate }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const prices = {
        monthly: { essæntial: 9, fæmily: 15, familyPlus: 25, legacy: 45 },
        yearly: { essæntial: 90, fæmily: 150, familyPlus: 250, legacy: 450 }
    };
    const tokenTooltipText = "Tokæn fuel advanced AI creations like:\n• Living Photo animations\n• AI Video Reflections\n• Mægazine design\n• Biografær sessions\n• Bulk Upload analysis";

    const handleChoosePlan = () => {
      onNavigate(Page.Subscription);
    }

    return (
        <div className="container mx-auto px-6 pt-28 pb-12 animate-fade-in-up">
            <button onClick={() => onNavigate(Page.Subscription)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Subscription
            </button>

            {/* Copied and adapted from LandingPage.tsx */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white font-brand">Find Your Plan</h2>
                <p className="text-lg md:text-xl text-slate-300 mt-4">
                    Choose the plan that fits your story. Cancel anytime.
                </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center items-center mb-12">
                <div className="inline-flex bg-slate-800 rounded-full p-1 items-center">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none ${billingCycle === 'monthly' ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={`group px-8 py-2 rounded-full text-sm font-semibold transition-colors relative focus:outline-none ${billingCycle === 'yearly' ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        Yearly
                        <span className="absolute -top-2.5 -right-5 bg-amber-400 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-full ring-2 ring-slate-800 transform transition-transform group-hover:scale-110">2 months free</span>
                    </button>
                </div>
            </div>
            
            {/* Pricing Cards */}
            <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {/* Free Plan */}
                <div className="bg-slate-800 p-8 rounded-2xl ring-1 ring-white/10 flex flex-col">
                    <h3 className="text-2xl font-bold font-brand text-white">Free</h3>
                    <p className="text-slate-400 mb-6">Start your journey.</p>
                    <p className="text-4xl font-bold text-white mb-2">€0</p>
                    <p className="text-sm text-slate-500 mb-2">&nbsp;</p>
                    <ul className="space-y-3 text-slate-300 text-sm mb-8 flex-grow">
                        <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 100 Momænts</li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Basic AI Tagging</li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 1 User Only</li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Private Sharing</li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 1 free AI Video creation</li>
                    </ul>
                    <button onClick={handleChoosePlan} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full transition-colors">Manage Plan</button>
                </div>

                {/* Essæntial Plan */}
                <div className="bg-slate-800 p-8 rounded-2xl ring-1 ring-white/10 flex flex-col">
                    <h3 className="text-2xl font-bold font-brand text-white">Essæntial</h3>
                    <p className="text-slate-400 mb-6">For every beginning.</p>
                    <p className="text-4xl font-bold text-white mb-2">€{prices[billingCycle].essæntial}<span className="text-base font-normal text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span></p>
                    <p className="text-sm text-slate-500 mb-2">{billingCycle === 'yearly' ? `€${(prices.yearly.essæntial / 12).toFixed(2)}/month equivalent` : ' '}</p>
                    <p className="text-sm font-semibold text-cyan-300 text-center mb-4">Includes a 30-day free trial</p>
                    <ul className="space-y-3 text-slate-300 text-sm mb-8 flex-grow">
                        <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Unlimited Momænts</li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Advanced AI Storytelling</li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> Full Creation Suite access</li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/> 1 User</li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-cyan-400 flex-shrink-0"/>
                            <div className="flex items-center gap-1.5">
                                <span>10 Free 'Living Photo' animations/month</span>
                            </div>
                        </li>
                    </ul>
                    <button onClick={handleChoosePlan} className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 rounded-full transition-colors">Start 30-Day Free Trial</button>
                </div>

                {/* Fæmily Plan */}
                <div className="bg-slate-800 p-8 rounded-2xl ring-2 ring-indigo-500 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">POPULAR</div>
                    <h3 className="text-2xl font-bold font-brand text-indigo-300">Fæmily</h3>
                    <p className="text-slate-400 mb-6">Weave your stories together.</p>
                    <p className="text-4xl font-bold text-white mb-2">€{prices[billingCycle].fæmily}<span className="text-base font-normal text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span></p>
                    <p className="text-sm text-slate-500 mb-2">{billingCycle === 'yearly' ? `€${(prices.yearly.fæmily / 12).toFixed(2)}/month equivalent` : ' '}</p>
                    <ul className="space-y-3 text-slate-300 text-sm flex-grow">
                        <li className="flex gap-2">
                            <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"/>
                            <div>
                                <strong className="text-white">UNLIMITED Momænts</strong>
                            </div>
                        </li>
                        <li className="flex gap-2 items-start">
                            <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"/>
                            <div>
                                <strong className="text-white">Up to 5 Family Members</strong>
                                <ul className="mt-1 space-y-1 text-slate-400">
                                    <li className="flex gap-2"><ArrowRight className="w-3 h-3 flex-shrink-0 mt-1"/> Shared <strong className="text-indigo-300">Fæmily Storyline</strong></li>
                                    <li className="flex gap-2 italic text-slate-500 pl-5"><GitBranch className="w-3 h-3 text-indigo-400/70 flex-shrink-0 mt-1 transform -rotate-90 -ml-5" /> e.g., Mom adds a reflection, æterny weaves it into the shared story.</li>
                                </ul>
                            </div>
                        </li>
                        <li className="flex gap-2 items-start">
                            <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"/>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <strong className="text-white">4,000 Pooled Tokæn/month</strong>
                                    <Tooltip text={tokenTooltipText} position="top">
                                        <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                                    </Tooltip>
                                </div>
                            </div>
                        </li>
                    </ul>
                     <div className="mt-8">
                        <button onClick={handleChoosePlan} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-full transition-colors">Choose Fæmily</button>
                    </div>
                </div>
                
                {/* Fæmily Plus Plan */}
                <div className="bg-slate-800 p-8 rounded-2xl ring-2 ring-teal-500 flex flex-col">
                    <h3 className="text-2xl font-bold font-brand text-teal-300">Fæmily Plus</h3>
                    <p className="text-slate-400 mb-6">For larger families & archives.</p>
                    <p className="text-4xl font-bold text-white mb-2">€{prices[billingCycle].familyPlus}<span className="text-base font-normal text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span></p>
                    <p className="text-sm text-slate-500 mb-2">{billingCycle === 'yearly' ? `€${(prices.yearly.familyPlus / 12).toFixed(2)}/month equivalent` : ' '}</p>
                    <ul className="space-y-3 text-slate-300 text-sm mb-8 flex-grow">
                        <li className="font-semibold text-slate-200">Everything in Fæmily, plus:</li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-teal-400 flex-shrink-0"/> Up to <strong>10 family members</strong></li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-teal-400 flex-shrink-0"/>
                            <div className="flex items-center gap-1.5">
                                <span><strong>8,000</strong> Pooled Tokæn/month</span>
                                <Tooltip text={tokenTooltipText} position="top"><HelpCircle className="w-4 h-4 text-slate-500 cursor-help" /></Tooltip>
                            </div>
                        </li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-teal-400 flex-shrink-0"/> Interactive <strong className="text-teal-300">Fæmily Tree</strong></li>
                        <li className="flex gap-2"><Check className="w-5 h-5 text-teal-400 flex-shrink-0"/> Priority Support</li>
                    </ul>
                    <button onClick={handleChoosePlan} className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-full transition-colors mt-auto">Choose Fæmily Plus</button>
                </div>

                {/* Lægacy Plan */}
                <div className="bg-slate-800 p-8 rounded-2xl ring-2 ring-amber-500 flex flex-col">
                    <h3 className="text-2xl font-bold font-brand text-amber-300">Lægacy</h3>
                    <p className="text-slate-400 mb-6">For your timeless story.</p>
                    <p className="text-4xl font-bold text-white mb-2">€{prices[billingCycle].legacy}<span className="text-base font-normal text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span></p>
                    <p className="text-sm text-slate-500 mb-2">{billingCycle === 'yearly' ? `€${(prices.yearly.legacy / 12).toFixed(2)}/month equivalent` : ' '}</p>
                    <ul className="space-y-3 text-slate-300 text-sm mb-8 flex-grow">
                         <li className="font-semibold text-slate-200">Everything in Fæmily Plus, plus:</li>
                         <li className="flex gap-2"><Check className="w-5 h-5 text-amber-400 flex-shrink-0"/> <strong>Unlimited members</strong></li>
                         <li className="flex gap-2 items-start">
                            <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
                            <div>
                                <strong className="text-white">Digital Inheritance Tools</strong>
                                <ul className="mt-1 space-y-1 text-slate-400">
                                    <li className="flex gap-2 italic text-slate-500 pl-5"><GitBranch className="w-3 h-3 text-amber-400/70 flex-shrink-0 mt-1 transform -rotate-90 -ml-5" /> Answer: "How do my kids access this after I'm gone?"</li>
                                </ul>
                            </div>
                        </li>
                         <li className="flex gap-2 items-start">
                            <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
                            <div>
                                <strong className="text-white">Full Creation Suite</strong>
                                <ul className="mt-1 space-y-1 text-slate-400">
                                  <li className="flex gap-2 italic text-slate-500 pl-5"><ArrowRight className="w-3 h-3 text-amber-400/70 flex-shrink-0 mt-1 transform -ml-5" /> Includes The Biografær & annual credits</li>
                                </ul>
                            </div>
                        </li>
                         <li className="flex gap-2"><Check className="w-5 h-5 text-amber-400 flex-shrink-0"/>
                            <div className="flex items-center gap-1.5">
                                <span>12,000 Tokæn/month</span>
                                <Tooltip text={tokenTooltipText} position="top">
                                    <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                                </Tooltip>
                            </div>
                        </li>
                    </ul>
                    <button onClick={handleChoosePlan} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-full transition-colors">Choose Lægacy</button>
                </div>
            </div>
        </div>
    );
};

export default ComparePlansPage;
