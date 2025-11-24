import React from 'react';
import { Page } from '../types';
import { ArrowLeft, Gift, CheckCircle, Mail, UserCheck } from 'lucide-react';

interface GiftPageProps {
  onNavigate: (page: Page) => void;
}

const GiftPage: React.FC<GiftPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-900 text-white animate-fade-in -mt-20">
      <header className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="container mx-auto">
          <button onClick={() => onNavigate(Page.Landing)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center text-center overflow-hidden pt-20">
        <img src="https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="An older woman smiling warmly while video calling on a tablet" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="relative z-10 p-6">
          <Gift className="w-16 h-16 mx-auto text-amber-300 mb-4" />
          <h1 className="text-5xl md:text-7xl font-bold font-brand text-white" style={{textShadow: '0 2px 20px rgba(0,0,0,0.7)'}}>Gift a Legacy</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4" style={{textShadow: '0 1px 10px rgba(0,0,0,0.7)'}}>
            Give the most meaningful gift imaginable: the story of a lifetime, beautifully preserved. Perfect for parents, grandparents, and the storytellers in your life.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-20 max-w-5xl space-y-20">
        
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-gray-800/50 p-8 rounded-2xl ring-1 ring-white/10">
            <h2 className="text-3xl font-bold font-brand mb-6 text-white">What's Included in the Gift Package?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white">One Year of the Fæmily Plan</h4>
                  <p className="text-slate-400 text-sm">All premium features, including unlimited moments, family collaboration for up to 5 members, and 4,000 Tokæn of creative energy per month.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <UserCheck className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white">Personal Onboarding Concierge</h4>
                  <p className="text-slate-400 text-sm">We'll personally guide your loved one through setup. This includes a one-on-one video call to help them connect photo accounts, create their first momænt, and feel comfortable using the platform.</p>
                </div>
              </li>
               <li className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white">A Beautiful Welcome Experience</h4>
                  <p className="text-slate-400 text-sm">Your recipient will receive a personalized email explaining the gift, what æternacy is, and how to schedule their onboarding session. It's a warm, welcoming introduction to their new journey.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="relative w-full aspect-square max-w-sm mx-auto">
            <img src="https://images.pexels.com/photos/853168/pexels-photo-853168.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="A family enjoying time together" className="w-full h-full object-cover rounded-2xl shadow-2xl transform -rotate-3 transition hover:rotate-0" />
            <img src="https://images.pexels.com/photos/1684820/pexels-photo-1684820.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="An older man smiling" className="w-2/3 h-2/3 object-cover rounded-2xl shadow-2xl absolute -bottom-8 -left-8 transform rotate-6 border-4 border-slate-900 transition hover:rotate-0" />
          </div>
        </section>
        
        {/* How it Works */}
        <section>
            <h2 className="text-3xl font-bold font-brand text-center mb-12">How It Works in 3 Simple Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                    <div className="text-5xl font-brand font-bold text-amber-300 mb-2">1</div>
                    <h3 className="text-xl font-bold text-white mb-2">Purchase the Gift</h3>
                    <p className="text-slate-400 text-sm">Securely purchase the "Gift a Legacy" package. You'll provide the recipient's name and email, and choose a delivery date for their welcome email.</p>
                </div>
                 <div>
                    <div className="text-5xl font-brand font-bold text-amber-300 mb-2">2</div>
                    <h3 className="text-xl font-bold text-white mb-2">They Receive Your Gift</h3>
                    <p className="text-slate-400 text-sm">On the date you selected, your loved one receives a beautiful email introducing them to æternacy and inviting them to schedule their personal onboarding session.</p>
                </div>
                 <div>
                    <div className="text-5xl font-brand font-bold text-amber-300 mb-2">3</div>
                    <h3 className="text-xl font-bold text-white mb-2">We Handle the Rest</h3>
                    <p className="text-slate-400 text-sm">Our concierge helps them set up their account, import their first photos, and ensures they feel confident and excited to begin their journey.</p>
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-800/50 rounded-2xl ring-1 ring-white/10 p-12 text-center">
            <h2 className="text-3xl font-bold font-brand text-white">Give a Gift That Lasts Forever</h2>
            <p className="text-slate-300 max-w-xl mx-auto my-4">
                For a single payment of €349, you give a full year of shared memories, professional guidance, and the priceless gift of a preserved legacy.
            </p>
            <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                Gift a Legacy - €349
            </button>
        </section>
      </div>
    </div>
  );
};

export default GiftPage;