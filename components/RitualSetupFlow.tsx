
import React, { useState } from 'react';
import { RitualTemplate, ActiveRitual } from '../types';
import { X, Users, Calendar, CheckCircle } from 'lucide-react';

interface RitualSetupFlowProps {
    template: RitualTemplate;
    familyMembers: string[];
    onClose: () => void;
    onComplete: (newRitual: Omit<ActiveRitual, 'progress' | 'id'>) => void;
}

const RitualSetupFlow: React.FC<RitualSetupFlowProps> = ({ template, familyMembers, onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [invitedMembers, setInvitedMembers] = useState<Set<string>>(new Set(['john.doe@example.com'])); // Current user included by default
    const [frequency, setFrequency] = useState(template.frequency);

    const handleToggleMember = (email: string) => {
        setInvitedMembers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(email)) {
                newSet.delete(email);
            } else {
                newSet.add(email);
            }
            return newSet;
        });
    };

    const handleFinalize = () => {
        // FIX: Replaced dynamic `require` with `template.iconName` which is passed from the parent.
        onComplete({
            templateId: template.id,
            title: template.title,
            description: template.description,
            iconName: template.iconName,
            frequency: frequency,
            // FIX: Added explicit type `string` to `email` to fix 'split' property error.
            participants: Array.from(invitedMembers).map((email: string) => ({
                id: email,
                name: email.split('@')[0],
                avatar: email.split('@')[0].substring(0,2).toUpperCase(),
            })),
        });
    };
    
    const ProgressBar: React.FC = () => (
        <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-colors ${step >= s ? 'bg-indigo-500' : 'bg-slate-600'} ${s === 4 ? 'w-1/6' : 'w-full'}`} />
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg ring-1 ring-white/10 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-brand text-white">Set Up: {template.title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
                </div>
                
                <div className="p-8 space-y-6">
                    <ProgressBar />
                    
                    {step === 1 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white">Welcome to the '{template.title}' Ritual</h3>
                            <p className="text-slate-400 mt-2">{template.description}</p>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400"/> Invite Family Members</h3>
                            <p className="text-slate-400 mt-2 mb-4">Select who you want to participate in this ritual.</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {['john.doe@example.com', ...familyMembers].map(email => (
                                    <label key={email} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg cursor-pointer">
                                        <span>{email} {email === 'john.doe@example.com' && '(You)'}</span>
                                        <input type="checkbox" checked={invitedMembers.has(email)} onChange={() => handleToggleMember(email)} disabled={email === 'john.doe@example.com'} className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-indigo-500 focus:ring-indigo-500" />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {step === 3 && (
                         <div>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-400"/> Set the Schedule</h3>
                            <p className="text-slate-400 mt-2 mb-4">How often should this ritual occur? You'll get reminders.</p>
                            <input type="text" value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="e.g., Every Sunday at 7 PM" className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                            <p className="text-xs text-slate-500 mt-2">Examples: "Every Sunday at 7pm", "The 1st of each month", "Annually on June 15th".</p>
                        </div>
                    )}
                    
                    {step === 4 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><CheckCircle className="w-5 h-5 text-indigo-400"/> Confirm & Start</h3>
                            <div className="mt-4 space-y-3 bg-slate-700/50 p-4 rounded-lg">
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Ritual:</span> <strong className="text-white">{template.title}</strong></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Schedule:</span> <strong className="text-white">{frequency}</strong></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Participants:</span> <strong className="text-white">{invitedMembers.size}</strong></div>
                            </div>
                        </div>
                    )}

                </div>

                <div className="p-4 mt-auto border-t border-slate-700 flex justify-between items-center">
                    <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-full text-sm disabled:opacity-50">Back</button>
                    {step < 4 ? (
                        <button onClick={() => setStep(s => s + 1)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full text-sm">Next</button>
                    ) : (
                        <button onClick={handleFinalize} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full text-sm">Confirm & Start Ritual</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RitualSetupFlow;
