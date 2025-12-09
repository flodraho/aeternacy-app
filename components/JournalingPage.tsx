import React from 'react';
import { Page } from '../types';
import { ArrowLeft, Zap, Clock, Sparkles } from 'lucide-react';

interface JournalingPageProps {
  onNavigate: (page: Page) => void;
}

const JournalingPage: React.FC<JournalingPageProps> = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in-up">
      <section className="relative h-[50vh] flex items-center justify-center text-white text-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Journaling background" className="w-full h-full object-cover opacity-40" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="relative z-10 p-6">
          <button onClick={() => onNavigate(Page.Profile)} className="absolute top-[-4rem] left-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Features
          </button>
          <h1 className="text-5xl md:text-7xl font-bold font-brand" style={{textShadow: '0 2px 15px rgba(0,0,0,0.5)'}}>Instant Journaling</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
            Capture the fleeting moments of your day. æterny automatically tracks and curates your experiences into a daily story.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center">
            <div className="flex flex-col items-center">
                <Zap className="w-10 h-10 text-cyan-400 mb-4"/>
                <h3 className="text-xl font-bold text-white mb-2">Instant Capture</h3>
                <p className="text-slate-400">Use voice notes, quick photos, or short text entries to log thoughts and events as they happen, effortlessly.</p>
            </div>
            <div className="flex flex-col items-center">
                <Clock className="w-10 h-10 text-cyan-400 mb-4"/>
                <h3 className="text-xl font-bold text-white mb-2">24-Hour Story Stream</h3>
                <p className="text-slate-400">Watch your day unfold in a private, real-time stream that collects all your entries, photos, and locations.</p>
            </div>
             <div className="flex flex-col items-center">
                <Sparkles className="w-10 h-10 text-cyan-400 mb-4"/>
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Synthesis</h3>
                <p className="text-slate-400">At the end of the day, æterny synthesizes your stream into a coherent, narrative momænt for your timestream.</p>
            </div>
        </div>

        <div className="relative w-full max-w-sm mx-auto bg-slate-800 rounded-2xl ring-1 ring-white/10 p-4 h-[600px] overflow-y-scroll">
             <div className="space-y-4">
                <div className="p-3 bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-400">9:05 AM - Voice Note</p>
                    <p className="text-sm text-white italic">"Just had a great idea for the Phoenix project, need to remember to draft the proposal this afternoon."</p>
                </div>
                 <div className="p-3 bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-400">12:30 PM - Photo</p>
                    <img src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Lunch" className="mt-2 rounded"/>
                </div>
                 <div className="p-3 bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-400">3:15 PM - Text Note</p>
                    <p className="text-sm text-white">Finished the proposal. Feeling accomplished!</p>
                </div>
             </div>
        </div>
        
        <div className="mt-20 text-center bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-brand text-white">Never Miss a Detail.</h2>
            <p className="text-slate-300 max-w-xl mx-auto my-4">
                Instant Journaling is an exclusive feature of the Lægacy plan, designed to capture the rich texture of your daily life.
            </p>
            <button className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                Upgrade to Lægacy
            </button>
        </div>
      </div>
    </div>
  );
};

export default JournalingPage;
