import React from 'react';
import { Page } from '../types';
import { Shield, Wand2, Clock, MapPin } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

const FeatureCard: React.FC<{ icon: React.ElementType; title: string; description: string; }> = ({ icon: Icon, title, description }) => (
    <div className="bg-slate-800/50 p-6 rounded-2xl ring-1 ring-white/10 text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-cyan-300" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
    </div>
);

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {

  const handleScrollDown = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-900 text-white animate-fade-in -mt-20">
      <header className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => onNavigate(Page.Home)} className="font-brand text-3xl font-bold tracking-tight text-white">æternacy<sup className="text-lg font-light relative -top-2">™</sup></button>
          <button
            onClick={() => onNavigate(Page.Home)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-full text-sm transition-all"
          >
            Enter App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        <img src="https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="The iconic highway view of Monument Valley, famously known as Forrest Gump Point." className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/60"></div>
        <div className="text-center z-10 p-6 animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight mb-2 font-brand" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>Story is everything.</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
            Without story, everything is nothing.
          </p>
        </div>
        <div className="absolute bottom-10 animate-bounce cursor-pointer" onClick={handleScrollDown}>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
                <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse"></div>
            </div>
        </div>
      </section>

      {/* Main Content */}
      <div id="main-content" className="container mx-auto px-6 py-20 max-w-3xl space-y-20">
        
        {/* Founder & Vision */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <MapPin className="w-8 h-8 text-cyan-400" />
            <h2 className="text-4xl font-bold text-white font-brand">Founder & Vision</h2>
          </div>
          <p className="text-xl font-bold text-white mb-4">Flo — Founder & Vision Lead</p>
          <div className="prose prose-lg prose-invert prose-p:text-slate-300">
            <p>A lifelong storyteller and explorer, Flo conceived æternacy on a road trip through Monument Valley — the same place where Forrest Gump stopped running. Standing on that endless highway, with majestic red rock formations stretching into the horizon, something profound shifted. Like Forrest in that moment, clarity emerged—a realization that something dormant had been waiting to come to life.</p>
            <p>That turning point became the spark for a lifelong vision: to build a platform where memories aren't just stored, but truly lived again. Today, he leads æternacy's mission to combine AI, privacy, and emotion into the first immersive "life-timestream" experience — guided by the AI curator, æterny.</p>
          </div>
        </section>

        {/* Founder Image */}
        <section className="w-full">
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10">
                <img src="https://i.ibb.co/6n21h0F/founder-monument-valley.jpg" alt="Founder Flo in Monument Valley" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <p className="absolute bottom-4 left-4 text-white text-sm italic" style={{textShadow: '0 1px 4px rgba(0,0,0,0.7)'}}>Monument Valley, 2025 — The turning point where æternacy was born</p>
            </div>
        </section>

        {/* Interview */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <Wand2 className="w-8 h-8 text-cyan-400" />
            <h2 className="text-4xl font-bold text-white font-brand">An Interview with Flo — by æterny</h2>
          </div>
          <div className="space-y-6 text-slate-300">
            <div>
                <p className="font-bold text-cyan-300">æterny: Flo, can you tell me how æternacy began?</p>
                <p className="pl-6 border-l-2 border-slate-700 ml-2 mt-2">Flo: It actually started on a road trip along the US West Coast. We arrived — quite by chance — at the exact spot in Monument Valley where Forrest Gump stopped running in the movie. I remember standing there and realizing: this is my turning point too.</p>
            </div>
             <div>
                <p className="font-bold text-cyan-300">æterny: What kind of turning point?</p>
                <p className="pl-6 border-l-2 border-slate-700 ml-2 mt-2">Flo: I'd always had this quiet wish to preserve my memories — not just as photos in a cloud, but as something alive. A digital timeline of my life that I could curate and maybe pass on to my family. I imagined being old one day, putting on a headset and walking through my life again — reliving those precious moments.</p>
            </div>
            <div>
                <p className="font-bold text-cyan-300">æterny: And that vision became æternacy?</p>
                <p className="pl-6 border-l-2 border-slate-700 ml-2 mt-2">Flo: Exactly. I wanted to make it effortless and private for anyone to record their life story — guided by AI but completely under their own control. That's how the idea of æterny, the personal AI curator and biografer, came to life.</p>
            </div>
            <div>
                <p className="font-bold text-cyan-300">æterny: What does the name mean to you?</p>
                <p className="pl-6 border-l-2 border-slate-700 ml-2 mt-2">Flo: It’s a fusion of eternity, privacy, and legacy. The ligature <span className="font-brand">æ</span> resembles the infinity symbol — the perfect representation of what we’re building: a place where your memories transcend time.</p>
            </div>
            <div>
                <p className="font-bold text-cyan-300">æterny: What is the deeper mission behind æternacy?</p>
                <p className="pl-6 border-l-2 border-slate-700 ml-2 mt-2">Flo: To help people reflect, not just record. To give everyone a private, beautifully designed space to relive their story — personal, private, and safe. Because without our stories, nothing truly remains.</p>
            </div>
          </div>
        </section>

        {/* Enter Aeternacy */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center ring-1 ring-cyan-500/30">
              <span className="font-brand text-2xl font-bold text-cyan-300">æ</span>
            </div>
            <h2 className="text-4xl font-bold text-white font-brand">Enter æternacy</h2>
          </div>
           <div className="prose prose-lg prose-invert prose-p:text-slate-300 mb-12">
            <p>æternacy is where your life story becomes a living, breathing timeline. Guided by æterny, your personal AI curator and biografer, every precious memory finds its place in your unique narrative.</p>
            <p>This isn't just about storage or organization. It's about creating a space for reflection, a digital legacy that grows with you, and a way to ensure that the moments that matter most are never truly lost.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
                icon={Shield}
                title="Personal & Private"
                description="Your memories belong to you. Safe, secure, and intimate."
            />
             <FeatureCard
                icon={Wand2}
                title="AI-Powered"
                description="æterny helps you curate and enrich your timeline effortlessly."
            />
             <FeatureCard
                icon={Clock}
                title="Timeless Legacy"
                description="Build a narrative that can be cherished across generations."
            />
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;
