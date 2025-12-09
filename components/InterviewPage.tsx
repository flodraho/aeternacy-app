
import React, { useState, useRef, useEffect } from 'react';
import { AeternyVoice, AeternyStyle, UserTier, Moment } from '../types';
import { Bot, Send, Mic, User, Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import { startGenericAeternyChat, continueAeternyChat } from '../services/geminiService';
import AeternyAvatarDisplay from './AeternyAvatarDisplay';

interface InterviewPageProps {
    onComplete: (momentId?: number) => void;
    aeternyAvatar: string | null;
    aeternyVoice: AeternyVoice;
    setAeternyVoice: (voice: AeternyVoice) => void;
    aeternyStyle: AeternyStyle;
    setAeternyStyle: (style: AeternyStyle) => void;
    onCreateFirstMoment: (momentData: Omit<Moment, 'id' | 'pinned'>) => Moment;
    showToast: (message: string, type: 'info' | 'success' | 'error') => void;
    userTier: UserTier;
}

const InterviewPage: React.FC<InterviewPageProps> = ({ onComplete, aeternyAvatar, aeternyStyle, userTier, onCreateFirstMoment }) => {
    const [messages, setMessages] = useState<{ sender: 'ai' | 'user', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const chatRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = async () => {
            setIsInitializing(true);
            // Simulate a brief "connecting" delay for effect
            await new Promise(r => setTimeout(r, 1000));
            
            try {
                const { chat, initialMessage } = await startGenericAeternyChat(aeternyStyle, userTier);
                chatRef.current = chat;
                setMessages([{ sender: 'ai', text: initialMessage }]);
            } catch (error) {
                console.error("Failed to start chat", error);
                setMessages([{ sender: 'ai', text: "I'm having trouble connecting to the archives right now. Please try again later." }]);
            } finally {
                setIsInitializing(false);
                setIsLoading(false);
            }
        };
        initChat();
    }, [aeternyStyle, userTier]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || !chatRef.current) return;
        
        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await continueAeternyChat(chatRef.current, userMsg);
            setMessages(prev => [...prev, { sender: 'ai', text: response }]);
            
            // Simple heuristic to end interview and create moment after a few exchanges
            if (messages.length > 4) {
                 setTimeout(() => {
                     // Create a dummy moment based on the conversation context
                     const newMoment = onCreateFirstMoment({
                         type: 'standard',
                         aiTier: 'diamond',
                         title: 'My First Interview',
                         date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                         description: "A reflective conversation with æterny, capturing the essence of my current thoughts and memories.",
                         photoCount: 0,
                         people: ['Me'],
                         activities: ['Interview']
                     });
                     onComplete(newMoment.id);
                 }, 3000);
            }

        } catch (error) {
            console.error("Chat error", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative h-screen w-full bg-slate-950 overflow-hidden flex flex-col items-center justify-center">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.pexels.com/photos/2085998/pexels-photo-2085998.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                    alt="Abstract memory background" 
                    className="w-full h-full object-cover opacity-20 blur-sm scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950"></div>
            </div>

            {/* Main Interface */}
            <div className="relative z-10 w-full max-w-3xl h-full flex flex-col">
                
                {/* Header */}
                <div className="p-8 flex justify-between items-center">
                    <div className="flex items-center gap-3 opacity-80">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-bold tracking-widest uppercase text-slate-300">The Biografær</span>
                    </div>
                    <button onClick={() => onComplete()} className="text-slate-500 hover:text-white text-xs font-semibold uppercase tracking-wide flex items-center gap-2 transition-colors">
                        Skip Introduction <SkipForward className="w-4 h-4" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto px-6 md:px-12 py-4 space-y-8 scrollbar-hide">
                    {isInitializing ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin"></div>
                                <AeternyAvatarDisplay avatar={aeternyAvatar} className="absolute inset-2 rounded-full opacity-50" />
                            </div>
                            <p className="text-sm font-light tracking-wide animate-pulse">Initializing æterny...</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'} animate-fade-in-up`}
                                >
                                    {msg.sender === 'ai' && (
                                        <div className="flex items-center gap-2 mb-2 pl-1">
                                             <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                                <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-full h-full" />
                                            </div>
                                            <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider">æterny</span>
                                        </div>
                                    )}
                                    
                                    <div className={`px-6 py-4 rounded-2xl text-lg leading-relaxed shadow-xl backdrop-blur-sm ${
                                        msg.sender === 'ai' 
                                            ? 'bg-slate-800/60 text-slate-200 rounded-tl-none border border-white/5' 
                                            : 'bg-cyan-900/20 text-white rounded-tr-none border border-cyan-500/20'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex flex-col items-start max-w-[85%] animate-fade-in">
                                     <div className="flex items-center gap-2 mb-2 pl-1">
                                         <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-cyan-500/30">
                                            <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-full h-full" />
                                        </div>
                                        <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider">æterny</span>
                                    </div>
                                    <div className="px-6 py-4 rounded-2xl rounded-tl-none bg-slate-800/40 border border-white/5 flex gap-1.5 items-center h-[60px]">
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 md:p-8 z-20">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                            <input 
                                className="flex-1 bg-transparent border-none text-white placeholder-slate-500 px-8 py-5 focus:ring-0 text-lg"
                                placeholder="Type your answer..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                disabled={isLoading || isInitializing}
                                autoFocus
                            />
                            <div className="pr-2 flex items-center gap-2">
                                <button 
                                    className="p-3 text-slate-400 hover:text-white transition-colors"
                                    title="Voice Input (Coming Soon)"
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={handleSend} 
                                    disabled={isLoading || !input.trim()} 
                                    className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full transition-all transform active:scale-95 flex items-center justify-center"
                                >
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-slate-500 text-xs mt-4">æterny learns from your stories to preserve them accurately.</p>
                </div>

            </div>
        </div>
    );
};

export default InterviewPage;
