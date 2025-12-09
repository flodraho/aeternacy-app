
import React from 'react';
import { Page, UserTier } from '../types';
import { ArrowLeft, BookOpen, FilePenLine, BookImage, CheckCircle, ExternalLink, UploadCloud } from 'lucide-react';

interface ShopPageProps {
  onNavigate: (page: Page) => void;
  userTier: UserTier;
}

interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    image: string;
    page: Page;
    userTier: UserTier;
    onNavigate: (page: Page) => void;
    isCoreFeature?: boolean;
    isVision?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, image, page, userTier, onNavigate, isCoreFeature = false, isVision = false }) => {
    const isLegacyUser = userTier === 'legacy';
    
    const handleButtonClick = () => {
        if (isLegacyUser) {
            onNavigate(page);
        } else {
            onNavigate(Page.Subscription);
        }
    };
    
    const ringColor = isVision ? 'ring-purple-500/50' : 'ring-white/10';
    const iconColor = isVision ? 'text-purple-300' : 'text-cyan-400';
    const iconBg = isVision ? 'bg-purple-500/10' : 'bg-cyan-500/10';

    return (
        <div className={`bg-gray-800/50 rounded-2xl ring-1 ${ringColor} overflow-hidden flex flex-col`}>
            <img src={image} alt={title} className="w-full h-48 object-cover" />
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center ring-1 ring-white/5 ${iconBg}`}>
                            <Icon className={`w-6 h-6 ${iconColor}`} />
                        </div>
                        <h3 className="text-2xl font-bold font-brand text-white">{title}</h3>
                    </div>
                     {isVision && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Vision</span>}
                </div>
                <p className="text-slate-400 text-sm mb-6 flex-grow">{description}</p>
                {isLegacyUser ? (
                    isCoreFeature ? (
                         <button onClick={handleButtonClick} className="w-full mt-auto bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-full text-sm transition-colors flex items-center justify-center gap-2">
                           Open <ExternalLink className="w-4 h-4" />
                        </button>
                    ) : (
                         <button onClick={handleButtonClick} className={`w-full mt-auto ${isVision ? 'bg-purple-600 hover:bg-purple-500' : 'bg-amber-600 hover:bg-amber-500'} text-white font-bold py-2 rounded-full text-sm transition-colors`}>
                            {isVision ? 'Request Consultation' : 'Design & Purchase'}
                        </button>
                    )
                ) : (
                    <button onClick={handleButtonClick} className="w-full mt-auto bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-full text-sm transition-colors">
                        Upgrade to Lægacy to Unlock
                    </button>
                )}
            </div>
        </div>
    );
}


const ShopPage: React.FC<ShopPageProps> = ({ onNavigate, userTier }) => {
  return (
    <div className="container mx-auto px-6 pt-28 pb-12 animate-fade-in-up">
      <button onClick={() => onNavigate(Page.Profile)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">The Shop & Creation Suite</h1>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Enhance your story with exclusive features and transform your digital legacy into tangible art.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
            icon={UploadCloud}
            title="Bulk Upload"
            description="Let æterny bring order to your chaos. Upload your entire archive and let our AI analyze, declutter, and curate your story for you."
            image="https://images.pexels.com/photos/1575845/pexels-photo-1575845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            onNavigate={onNavigate}
            userTier={userTier}
            page={Page.BulkUpload}
            isCoreFeature={true}
        />
        <FeatureCard
            icon={BookOpen}
            title="æternacy Magazine"
            description="Receive a quarterly, interactive digital magazine curated from your best moments. A stunning, shareable summary of your life's recent chapters."
            image="https://images.pexels.com/photos/267569/pexels-photo-267569.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            onNavigate={onNavigate}
            userTier={userTier}
            page={Page.Magazine}
        />
        <FeatureCard
            icon={FilePenLine}
            title="Instant Journaling"
            description="Capture fleeting thoughts and moments throughout your day. æterny automatically tracks and curates your experiences into a daily story."
            image="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            onNavigate={onNavigate}
            userTier={userTier}
            page={Page.Journaling}
        />
        <FeatureCard
            icon={BookImage}
            title="Premium Photobooks"
            description="Turn your digital legacy into a tangible heirloom. Create stunning, museum-quality photobooks from your curated moments, designed by æterny."
            image="https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            onNavigate={onNavigate}
            userTier={userTier}
            page={Page.Photobook}
        />
      </div>
    </div>
  );
};

export default ShopPage;
