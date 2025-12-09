
import React, { useRef, useEffect } from 'react';
import { Message, Page } from '../types';
import { X, Mic, Send, Bot, Square, Volume2, ArrowUp, Speaker, VolumeX } from 'lucide-react';
import AeternyAvatarDisplay from './AeternyAvatarDisplay';

interface AeternyFabProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  onPlayTts: (text: string) => void;
  isTtsPlaying: boolean;
  currentlyPlayingText: string | null;
  aeternyAvatar: string | null;
  contextualPrompts?: string[];
  onContextualSend: (prompt: string) => void;
  liveDisplay: { user: string; ai: string } | null;
  currentPage: Page;
  onTriggerGuide: () => void;
}

const AeternyFab: React.FC<AeternyFabProps> = (props) => {
  const {
    isOpen, onToggle, messages, input, onInputChange, onSend, isLoading,
    isRecording, onToggleRecording, isTtsEnabled, onToggleTts, onPlayTts,
    isTtsPlaying, currentlyPlayingText, aeternyAvatar,
    contextualPrompts, onContextualSend, liveDisplay, currentPage, onTriggerGuide
  } = props;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, liveDisplay]);

  const pagesWithGuide = [Page.Create, Page.Curate, Page.Moments];

  return (
    <>
      <button
        onClick={onToggle}
        className="aeterny-fab fixed bottom-6 right-6 w-14 h-14 bg-slate-800/60 backdrop-blur-sm ring-1 ring-cyan-500/50 rounded-full shadow-lg flex items-center justify-center text-white z-50 transition-all duration-300 transform hover:scale-105 hover:ring-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
        aria-label="Open æterny chat"
      >
        <div className="aeterny-fab-pulse"></div>
        <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-full h-full rounded-full" />
      </button>

      {isOpen && (
        <div className="aeterny-chat-bubble fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-white/10 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-white/10 flex justify-between items-center flex-shrink-0 h-14">
            <div className="flex items-center gap-3">
              <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-8 h-8 rounded-full" />
              <h3 className="font-bold text-white text-base font-brand">Conversation with æterny</h3>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={onToggleTts} className={`p-2 rounded-full transition-colors ${isTtsEnabled ? 'text-cyan-400' : 'text-slate-400 hover:bg-white/5'}`}>
                  {isTtsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button onClick={onToggle} className="p-2 rounded-full text-slate-400 hover:bg-white/5" aria-label="Close chat">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && (
                  <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-6 h-6 rounded-full flex-shrink-0" />
                )}
                <div className={`max-w-xs p-3 rounded-2xl text-sm relative group ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-700 text-slate-200 rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                   {msg.sender === 'ai' && (
                      <button 
                        onClick={() => onPlayTts(msg.text)} 
                        className="absolute -bottom-2 -right-2 w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50" 
                        disabled={!isTtsEnabled || isTtsPlaying}
                      >
                        {isTtsPlaying && currentlyPlayingText === msg.text 
                          ? <Speaker className="w-3 h-3 text-cyan-300 animate-pulse"/> 
                          : isTtsEnabled
                            ? <Volume2 className="w-3 h-3 text-slate-300"/>
                            : <VolumeX className="w-3 h-3 text-slate-500"/>
                        }
                      </button>
                  )}
                </div>
              </div>
            ))}
            {liveDisplay?.user && (
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-xs p-3 rounded-2xl text-sm bg-cyan-600/70 text-white/80 rounded-br-none">
                  <p className="whitespace-pre-wrap">{liveDisplay.user}</p>
                </div>
              </div>
            )}
             {liveDisplay?.ai && (
              <div className="flex items-start gap-3">
                 <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-6 h-6 rounded-full flex-shrink-0" />
                <div className="max-w-xs p-3 rounded-2xl text-sm bg-gray-700/70 text-slate-200/80 rounded-bl-none">
                  <p className="whitespace-pre-wrap">{liveDisplay.ai}</p>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex items-start gap-3">
                <AeternyAvatarDisplay avatar={aeternyAvatar} className="w-6 h-6 rounded-full flex-shrink-0" />
                <div className="p-3 rounded-2xl bg-gray-700 text-slate-200 rounded-bl-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-0"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-200"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-400"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex-shrink-0">
             {pagesWithGuide.includes(currentPage) && (
                <div className="mb-3 px-1 animate-fade-in">
                    <button
                        onClick={() => {
                            onTriggerGuide();
                            onToggle(); // Close the FAB
                        }}
                        className="w-full text-sm bg-slate-700/80 hover:bg-slate-700 transition-colors py-2 px-3 rounded-full"
                    >
                        Guide me on this page
                    </button>
                </div>
            )}
             {isOpen && messages.length <= 1 && !isRecording && contextualPrompts && contextualPrompts.length > 0 && (
              <div className="mb-3 animate-fade-in">
                <p className="text-xs text-slate-400 mb-2 px-1">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {contextualPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => onContextualSend(prompt)}
                      className="text-xs bg-slate-700/50 hover:bg-slate-700 transition-colors py-1.5 px-3 rounded-full"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && input.trim() && onSend()}
                    className="w-full bg-slate-900 border border-slate-600 rounded-full py-2.5 px-4 pr-12 text-sm text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    placeholder={isRecording ? "Listening..." : "Ask æterny..."}
                    disabled={isLoading}
                />
                <div className="absolute right-2 flex items-center">
                    {input.trim() ? (
                        <button
                            onClick={onSend}
                            disabled={isLoading}
                            className="w-8 h-8 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-colors disabled:bg-gray-600"
                            aria-label="Send message"
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onToggleRecording}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                                isRecording
                                    ? 'bg-red-500 text-white'
                                    : 'bg-transparent text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                            disabled={isLoading}
                            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        >
                            {isRecording ? <Square className="w-4 h-4" fill="white" /> : <Mic className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AeternyFab;
