import React from 'react';
import { Page } from '../types';
import { ArrowLeft, Book, Sparkles, Truck } from 'lucide-react';

interface PhotobookPageProps {
  onNavigate: (page: Page) => void;
}

const PhotobookPage: React.FC<PhotobookPageProps> = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in-up">
      <section className="relative h-[50vh] flex items-center justify-center text-white text-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img src="https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Photobook background" className="w-full h-full object-cover opacity-40" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="relative z-10 p-6">
          <button onClick={() => onNavigate(Page.Profile)} className="absolute top-[-4rem] left-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Features
          </button>
          <h1 className="text-5xl md:text-7xl font-bold font-brand" style={{textShadow: '0 2px 15px rgba(0,0,0,0.5)'}}>Premium Photobooks</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
            Turn your digital legacy into a tangible heirloom. Create stunning, museum-quality photobooks from your curated moments.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center">
            <div className="flex flex-col items-center">
                <Book className="w-10 h-10 text-cyan-400 mb-4"/>
                <h3 className="text-xl font-bold text-white mb-2">Heirloom Quality</h3>
                <p className="text-slate-400">Choose from premium linen covers, archival paper, and professional layflat binding for a book that lasts generations.</p>
            </div>
            <div className="flex flex-col items-center">
                <Sparkles className="w-10 h-10 text-cyan-400 mb-4"/>
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Design</h3>
                <p className="text-slate-400">Select a collection of moments, and let æterny intelligently design beautiful layouts that tell your story perfectly.</p>
            </div>
             <div className="flex flex-col items-center">
                <Truck className="w-10 h-10 text-cyan-400 mb-4"/>
                <h3 className="text-xl font-bold text-white mb-2">Delivered to You</h3>
                <p className="text-slate-400">Finalize your design, and we'll handle the rest. Your custom photobook is printed and delivered to your doorstep.</p>
            </div>
        </div>

        <div className="relative w-full aspect-video max-w-4xl mx-auto">
             <img src="https://images.pexels.com/photos/1906435/pexels-photo-1906435.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Photobook mockup" className="w-full h-full object-cover rounded-lg shadow-2xl"/>
        </div>
        
        <div className="mt-20 text-center bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-brand text-white">Your Memories, in Your Hands.</h2>
            <p className="text-slate-300 max-w-xl mx-auto my-4">
                Creating physical photobooks is an exclusive feature of the Lægacy plan.
            </p>
            <button className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                Upgrade to Lægacy
            </button>
        </div>
      </div>
    </div>
  );
};

export default PhotobookPage;
