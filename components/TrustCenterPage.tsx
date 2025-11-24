import React from 'react';
import { Page } from '../types';
import { ArrowLeft, ShieldCheck, Lock, Database, UserCheck } from 'lucide-react';

// Re-creating these badge components locally as they are specific to this context
const Iso27001Badge = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#B0B0B0" />
      <text x="50" y="55" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#2D3748" textAnchor="middle">ISO</text>
      <text x="50" y="75" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill="#2D3748" textAnchor="middle">27001</text>
    </svg>
);
  
const GdprBadge = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#4A5568" />
      <text x="50" y="60" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle">GDPR</text>
    </svg>
);

const Soc2Badge = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#2D3748" />
        <text x="50" y="60" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">SOC 2</text>
    </svg>
);


interface TrustCenterPageProps {
  onNavigate: (page: Page) => void;
}

const PrincipleCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <div className="bg-slate-800/50 p-6 rounded-2xl ring-1 ring-white/10">
    <div className="flex items-center gap-3 mb-3">
      <Icon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <p className="text-slate-400 text-sm">{description}</p>
  </div>
);


const TrustCenterPage: React.FC<TrustCenterPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-900 text-white animate-fade-in-up">
      <header className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="container mx-auto">
          <button onClick={() => onNavigate(Page.Landing)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 text-center">
        <div className="container mx-auto px-6">
          <ShieldCheck className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
          <h1 className="text-5xl md:text-6xl font-bold font-brand text-white">Trust Center</h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mt-4">
            Your story is priceless. We're committed to protecting it with state-of-the-art security and unwavering respect for your privacy.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl space-y-16">
        
        {/* Our Principles */}
        <section>
          <h2 className="text-3xl font-bold text-white font-brand text-center mb-8">Our Guiding Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PrincipleCard 
                icon={Lock}
                title="Privacy by Design"
                description="We build privacy into every feature from the ground up. We don't sell your data, use it for advertising, or share it. Your legacy is yours alone."
            />
             <PrincipleCard 
                icon={Database}
                title="Encryption Everywhere"
                description="Your data is encrypted both in transit (using TLS) and at rest in our secure cloud storage. This ensures your memories are protected at every step."
            />
             <PrincipleCard 
                icon={UserCheck}
                title="You Are in Control"
                description="You have the right to access, modify, and delete your data at any time. Our tools are designed to empower you to manage your own story."
            />
             <PrincipleCard 
                icon={ShieldCheck}
                title="Continuous Improvement"
                description="Security is an ongoing process. We conduct regular audits, vulnerability scanning, and employee training to stay ahead of emerging threats."
            />
          </div>
        </section>

        {/* Compliance Section */}
        <section>
            <h2 className="text-3xl font-bold text-white font-brand text-center mb-8">Compliance & Certifications</h2>
            <p className="text-center text-slate-400 max-w-2xl mx-auto mb-12">
                We are committed to meeting and exceeding the industry's most stringent security and privacy standards. This is a continuous journey of audits and improvements.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 mb-4"><Iso27001Badge /></div>
                    <h3 className="text-xl font-bold text-white">ISO/IEC 27001</h3>
                    <p className="text-sm text-slate-400 mt-2">The international standard for Information Security Management Systems (ISMS), ensuring we have a comprehensive, risk-based approach to securing your data.</p>
                </div>
                 <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 mb-4"><Soc2Badge /></div>
                    <h3 className="text-xl font-bold text-white">SOC 2 Type II</h3>
                    <p className="text-sm text-slate-400 mt-2">An independent audit verifying that our controls for security, availability, and confidentiality are designed correctly and operate effectively over time.</p>
                </div>
                 <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 mb-4"><GdprBadge /></div>
                    <h3 className="text-xl font-bold text-white">GDPR Compliant</h3>
                    <p className="text-sm text-slate-400 mt-2">We adhere to the principles of the General Data Protection Regulation, giving you robust rights and protections over your personal data.</p>
                </div>
            </div>
        </section>

        {/* Learn More */}
        <section className="text-center py-12">
            <h2 className="text-3xl font-bold text-white font-brand mb-4">Have Questions?</h2>
            <p className="text-slate-300 mb-6">For a detailed look at how we handle your data, please review our policies.</p>
            <div className="flex justify-center gap-4">
                <button className="text-cyan-400 font-semibold hover:underline">Privacy Policy</button>
                <span className="text-slate-500">|</span>
                <button className="text-cyan-400 font-semibold hover:underline">Terms of Service</button>
                <span className="text-slate-500">|</span>
                 <button className="text-cyan-400 font-semibold hover:underline">Contact Support</button>
            </div>
        </section>
      </div>
    </div>
  );
};

export default TrustCenterPage;