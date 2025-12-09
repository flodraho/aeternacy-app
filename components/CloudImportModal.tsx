
import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';
import GoogleIcon from './icons/GoogleIcon';
import AppleIcon from './icons/AppleIcon';
import MetaIcon from './icons/MetaIcon';

export type CloudProvider = 'google' | 'apple' | 'meta';

interface CloudImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: CloudProvider;
    onImport: (files: File[]) => void;
}

const mockCloudImages = [
    'https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3363357/pexels-photo-3363357.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2536588/pexels-photo-2536588.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3206168/pexels-photo-3206168.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/33688/delicate-arch-night-stars-landscape.jpg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1252983/pexels-photo-1252983.jpeg?auto=compress&cs=tinysrgb&w=400',
];

const CloudImportModal: React.FC<CloudImportModalProps> = ({ isOpen, onClose, provider, onImport }) => {
    const [step, setStep] = useState<'connecting' | 'selecting' | 'importing'>('connecting');
    const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
    
    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep('connecting');
            setSelectedUrls(new Set());
            // Simulate authentication delay
            const timer = setTimeout(() => setStep('selecting'), 2000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const providerConfig = {
        google: { name: 'Google Photos', icon: GoogleIcon, color: 'bg-white text-black' },
        apple: { name: 'iCloud Photos', icon: AppleIcon, color: 'bg-black text-white' },
        meta: { name: 'Instagram / Facebook', icon: MetaIcon, color: 'bg-blue-600 text-white' }
    };

    const { name, icon: Icon, color } = providerConfig[provider];

    const handleToggleSelect = (url: string) => {
        setSelectedUrls(prev => {
            const next = new Set(prev);
            if (next.has(url)) next.delete(url);
            else next.add(url);
            return next;
        });
    };

    const handleImport = async () => {
        setStep('importing');
        
        try {
            // Convert URLs to File objects
            const filePromises = Array.from(selectedUrls).map(async (url: string, index) => {
                const response = await fetch(url);
                const blob = await response.blob();
                // Create a unique filename
                return new File([blob], `cloud_import_${provider}_${Date.now()}_${index}.jpg`, { type: blob.type });
            });

            const files = await Promise.all(filePromises);
            onImport(files);
            onClose();
        } catch (error) {
            console.error("Failed to import images", error);
            setStep('selecting'); // Go back on error
            // In a real app, show an error toast
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-brand font-bold text-white text-lg">Import from {name}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 min-h-[300px]">
                    {step === 'connecting' && (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                            <h4 className="text-lg font-semibold text-white">Connecting to {name}...</h4>
                            <p className="text-slate-400 text-sm mt-2">Securely authenticating your account.</p>
                        </div>
                    )}

                    {step === 'selecting' && (
                        <div className="animate-fade-in">
                            <p className="text-slate-400 text-sm mb-4">Select photos to add to your momænt. ({selectedUrls.size} selected)</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {mockCloudImages.map((url, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => handleToggleSelect(url)}
                                        className={`relative aspect-square rounded-lg overflow-hidden group transition-all ${selectedUrls.has(url) ? 'ring-4 ring-cyan-500' : 'hover:opacity-90'}`}
                                    >
                                        <img src={url} alt="Cloud photo" className="w-full h-full object-cover" />
                                        {selectedUrls.has(url) && (
                                            <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                                                <CheckCircle className="w-8 h-8 text-white drop-shadow-lg" fill="#06b6d4" />
                                            </div>
                                        )}
                                        {!selectedUrls.has(url) && (
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'importing' && (
                         <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                            <h4 className="text-lg font-semibold text-white">Downloading Media...</h4>
                            <p className="text-slate-400 text-sm mt-2">Transferring {selectedUrls.size} photos to your studio.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'selecting' && (
                    <div className="p-4 border-t border-white/10 bg-slate-800/50 flex justify-between items-center">
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Only simulates connection for demo
                        </p>
                        <div className="flex gap-3">
                             <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">Cancel</button>
                             <button 
                                onClick={handleImport} 
                                disabled={selectedUrls.size === 0}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Import Selected
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CloudImportModal;
