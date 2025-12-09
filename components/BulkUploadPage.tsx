import React, { useState } from 'react';
import { Page, UserTier } from '../types';
import { ArrowLeft, UploadCloud, Sparkles, FolderCheck, CheckCircle, Loader2 } from 'lucide-react';
import { TOKEN_COSTS } from '../services/costCatalog';

interface BulkUploadPageProps {
  onNavigate: (page: Page) => void;
  userTier: UserTier;
  triggerConfirmation: (cost: number, featureKey: string, onConfirm: () => Promise<any>, message?: string) => void;
}

const Step: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center ring-1 ring-amber-500/20">
            <Icon className="w-6 h-6 text-amber-300" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-slate-400 mt-1 text-sm">{description}</p>
        </div>
    </div>
);

const BulkUploadPage: React.FC<BulkUploadPageProps> = ({ onNavigate, userTier, triggerConfirmation }) => {
    const [photoCount, setPhotoCount] = useState(5000);
    const [isProcessing, setIsProcessing] = useState(false);
    const isLegacyUser = userTier === 'legacy';

    const calculatedCost = Math.ceil(photoCount / 1000) * TOKEN_COSTS.BULK_UPLOAD_PER_1000;

    const handleUpload = async () => {
        setIsProcessing(true);
        // Mock upload and analysis action
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log(`TELEMETRY: token_spend_ok, feature: BULK_UPLOAD, cost: ${isLegacyUser ? 0 : calculatedCost}`);
        setIsProcessing(false);
        onNavigate(Page.BulkUploadReview);
    };
    
    const handleTriggerUpload = () => {
        if (isLegacyUser) {
             const message = `This will analyze approximately ${photoCount.toLocaleString()} photos and use your annual credits.`;
             triggerConfirmation(0, 'BULK_UPLOAD', handleUpload, message); // Cost is 0 if using credits
        } else {
            const message = `This will analyze approximately ${photoCount.toLocaleString()} photos.`;
            triggerConfirmation(calculatedCost, 'BULK_UPLOAD', handleUpload, message);
        }
    };
    
    if (isProcessing) {
        return (
            <div className="min-h-screen -mt-20 flex flex-col items-center justify-center text-center p-6">
                <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-6" />
                <h1 className="text-3xl font-bold font-brand text-white">æterny is Curating...</h1>
                <p className="text-slate-400 mt-2 max-w-md">Analyzing your archive, finding duplicates, and organizing your moments. This may take a few minutes for large collections.</p>
            </div>
        )
    }

    const renderCTA = () => {
        if (isLegacyUser) {
            return (
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <h2 className="text-4xl font-bold font-brand text-white">Your Lægacy Credits</h2>
                    <p className="text-slate-300 mt-4">
                        As a Lægacy member, you receive a generous annual credit for photo analysis.
                    </p>
                    <div className="my-8 p-6 bg-slate-800/50 rounded-lg ring-1 ring-white/10 max-w-sm mx-auto">
                        <p className="text-sm text-amber-300 font-semibold">ANNUAL CREDITS REMAINING</p>
                        <p className="text-5xl font-bold text-white mt-2">20,000</p>
                        <p className="text-xs text-slate-400">Resets on January 1, 2025</p>
                    </div>
                    <button onClick={handleTriggerUpload} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20">
                        Start Bulk Upload
                    </button>
                </div>
            );
        }

        return (
            <div className="container mx-auto px-6 text-center max-w-2xl">
                <h2 className="text-4xl font-bold font-brand text-white">Ready to Reclaim Your Memories?</h2>
                <p className="text-slate-300 mt-4">
                    Estimate the number of photos you want to upload. Cost is {TOKEN_COSTS.BULK_UPLOAD_PER_1000} Tokæn per 1,000 photos.
                </p>
                <div className="my-8 p-6 bg-slate-800/50 rounded-lg ring-1 ring-white/10 max-w-lg mx-auto">
                    <label htmlFor="photo-count" className="text-sm text-slate-300">Estimated number of photos:</label>
                    <input 
                        id="photo-count"
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={photoCount}
                        onChange={(e) => setPhotoCount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer my-4"
                    />
                     <p className="text-3xl font-bold text-white font-mono">{photoCount.toLocaleString()}</p>
                     <p className="text-lg text-cyan-400 font-semibold mt-2">Estimated Cost: <span className="font-mono">{calculatedCost.toLocaleString()}</span> Tokæn</p>
                </div>

                <button onClick={handleTriggerUpload} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105">
                    Continue to Upload
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 text-white animate-fade-in-up -mt-20">
            <div className="relative z-10 pt-8">
                <div className="container mx-auto px-6">
                     <button onClick={() => onNavigate(Page.Shop)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Shop
                    </button>
                </div>
            </div>
            {/* Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center text-center overflow-hidden -mt-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-slate-900 to-slate-900"></div>
                <div className="relative z-10 p-6">
                <h1 className="text-5xl md:text-7xl font-bold font-brand text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>Let æterny bring order to your chaos.</h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4 mb-8" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}>
                    Upload your entire photo archive — tens of thousands of images at once — and let æterny analyze, declutter, and curate your story for you.
                </p>
                <button onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20">
                    Get Started
                </button>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="main-content" className="py-20 md:py-32 bg-slate-900">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold font-brand text-white">From Digital Mess to Curated Masterpiece</h2>
                        <p className="text-slate-400 mt-2 text-lg">A seamless, AI-powered process that puts you in control.</p>
                    </div>
                    <div className="space-y-12">
                        <Step 
                            icon={UploadCloud}
                            title="1. Upload Your Archive"
                            description="Securely upload folders containing thousands of photos and videos. æterny supports most common formats and preserves your original files."
                        />
                        <Step 
                            icon={Sparkles}
                            title="2. AI Analysis & Decluttering"
                            description="æterny gets to work, automatically detecting and removing screenshots, receipts, and duplicates. It groups similar photos (like bursts) and intelligently suggests the best shots."
                        />
                        <Step 
                            icon={FolderCheck}
                            title="3. Intelligent Organization"
                            description="Your cleaned archive is automatically organized by people, places, and themes, creating a browsable and searchable collection without any manual effort."
                        />
                        <Step 
                            icon={CheckCircle}
                            title="4. Review & Approve"
                            description="You have the final say. Review all of æterny's suggestions in a simple, intuitive interface. Approve changes, make adjustments, or undo anything you don't like before it's saved to your timestream."
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 md:py-32 bg-gray-900/50">
                {renderCTA()}
            </section>
        </div>
    );
};

export default BulkUploadPage;