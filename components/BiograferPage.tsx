
import React, { useState, useRef, useEffect } from 'react';
import { Page, UserTier, Message } from '../types';
import { ArrowLeft, BookText, Briefcase, GitBranch, HeartCrack, Mic, Users, X, Send, Loader2 } from 'lucide-react';
import { TOKEN_COSTS } from '../services/costCatalog';
import Tooltip from './Tooltip';
import LegacyLandingPage from './LegacyLandingPage';
// FIX: Corrected function name to startBiographerTextChat as startBiographerChat is not exported.
import { startBiographerTextChat, continueAeternyChat } from '../services/geminiService';
import { Chat } from '@google/genai';

interface BiograferPageProps {
  onBack: () => void;
  triggerConfirmation: (cost: number, featureKey: string, onConfirm: () => Promise<any>, message?: string) => void;
  userTier: UserTier;
  onNavigate: (page: Page) => void;
}

const sessions = [
    { id: 'family', title: 'Family & Roots', description: 'Explore your family history, relationships, and heritage.', icon: Users, completed: false },
    { id: 'childhood', title: 'Childhood & Youth', description: 'Revisit the formative years and memories that shaped you.', icon: BookText, completed: false },
    { id: 'career', title: 'Career & Ambitions', description: 'Reflect on your professional journey, milestones, and aspirations.', icon: Briefcase, completed: false },
    { id: 'turning_points', title: 'Turning Points', description: 'Discuss the pivotal moments and decisions that defined your path.', icon: GitBranch, completed: false },
    { id: 'love_loss', title: 'Love & Loss', description: 'Share stories of the most profound connections and farewells in your life.', icon: HeartCrack, completed: false }
];

// Chat Interface Component
const BiographerChat: React.FC<{ topic: string; onClose: () => void }> = ({ topic, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = async () => {
            setIsLoading(true);
            try {
                // FIX: Corrected function call from `startBiographerChat` to the exported `startBiographerTextChat`.
                const { chat, initialMessage } = await startBiographerTextChat(topic);
                chatRef.current = chat;
                setMessages([{ sender: 'ai', text: initialMessage }]);
            } catch (e) {
                setMessages([{ sender: 'ai', text: "I'm having trouble connecting. Please try again later." }]);
            } finally {
                setIsLoading(false);
            }
        };
        initChat();
    }, [topic]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !chatRef.current) return;
        
        const userMsg: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await continueAeternyChat(chatRef.current, userMsg.text);
            setMessages(prev => [...prev, { sender: 'ai', text: response }]);
        } catch (e) {
            setMessages(prev => [...prev, { sender: 'ai', text: "I encountered an error. Please continue." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col ring-1 ring-white/10">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white font-brand">Interview: {topic}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs ml-4">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            æterny is thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-slate-700 flex gap-2">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type your answer..." 
                        className="flex-grow bg-slate-900 border border-slate-600 rounded-full px-4 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const BiograferPage: React.FC<BiograferPageProps> = ({ onBack, triggerConfirmation, userTier, onNavigate }) => {
    const [activeSession, setActiveSession] = useState<typeof sessions[0] | null>(null);

    if (userTier !== 'legacy') {
        return <LegacyLandingPage onNavigate={onNavigate} />;
    }

    const handleStartSession = (session: typeof sessions[0]) => {
        triggerConfirmation(TOKEN_COSTS.BIOGRAFER_SESSION, 'BIOGRAFER_SESSION', async () => {
            setActiveSession(session);
        });
    };

    return (
        <div className="bg-slate-900 -mt-20">
             <section className="relative h-[60vh] flex items-center justify-center text-white text-center overflow-hidden">
                <img src="https://images.pexels.com/photos/1036841/pexels-photo-1036841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="A thoughtful person looking out a window" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                <div className="relative z-10 p-6 animate-fade-in-up">
                    <button onClick={onBack} className="absolute top-[-4rem] left-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Lægacy Space
                    </button>
                    <h1 className="text-5xl md:text-7xl font-bold font-brand" style={{textShadow: '0 2px 15px rgba(0,0,0,0.5)'}}>Your Story, in Your Voice.</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
                    The Biografær is your personal interviewer, guiding you through the chapters of your life to create a rich, authentic autobiography.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-6 py-16">
                <div className="bg-gray-800/50 p-8 rounded-3xl ring-1 ring-white/10">
                    <h2 className="text-3xl font-bold font-brand text-white mb-8 text-center">Available Sessions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sessions.map(session => {
                            const Icon = session.icon;
                            return (
                                <div key={session.id} className="bg-slate-700/50 p-6 rounded-2xl flex flex-col justify-between h-full hover:bg-slate-700 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-cyan-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">{session.title}</h3>
                                        </div>
                                        <p className="text-slate-300 text-sm mb-6">{session.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleStartSession(session)}
                                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Mic className="w-4 h-4" /> Start Interview
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            
            {activeSession && (
                <BiographerChat 
                    topic={activeSession.title} 
                    onClose={() => setActiveSession(null)} 
                />
            )}
        </div>
    );
};

export default BiograferPage;
