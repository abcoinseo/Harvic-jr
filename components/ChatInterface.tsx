
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Rocket, Globe, ExternalLink, Zap, Sparkles, Activity, ShieldCheck, Terminal, MoreVertical, Loader2, Waves, Cpu, Radio, Share2, Info } from 'lucide-react';
import { Message } from '../types';
import { soundEngine } from '../utils/audio';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  groundingMetadata?: any[];
  streamingText?: string;
  onOpenSidebar: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping, groundingMetadata, streamingText, onOpenSidebar }) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, streamingText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      soundEngine.playSend();
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/30 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && !streamingText && (
          <div className="h-full flex flex-col items-center justify-center text-sky-400/20">
            <Rocket className="w-16 h-16 animate-bounce mb-4" />
            <p className="text-xs font-bold uppercase tracking-[0.3em]">Start a New Mission!</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-300`}>
            <div className={`flex max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
              <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-lg ${
                msg.role === 'user' ? 'bg-sky-500' : 'bg-slate-800 border border-white/10'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-sky-400" />}
              </div>

              <div className="flex flex-col gap-2">
                <div className={`px-4 py-3 rounded-3xl text-sm md:text-base leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-sky-500 text-white rounded-br-none shadow-sky-500/20' 
                  : 'bg-white/5 text-sky-50 border border-white/10 rounded-bl-none backdrop-blur-xl'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          </div>
        ))}

        {(streamingText || isTyping) && (
          <div className="flex justify-start animate-pulse">
            <div className="flex items-end gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-sky-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-sky-400" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl rounded-bl-none px-4 py-3 text-sky-100 min-h-[2.5rem] flex items-center">
                {streamingText || "..."}
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-950/80 border-t border-white/10 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            placeholder="Type a command... 🚀" 
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-all shadow-inner" 
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isTyping}
            className="p-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl shadow-xl shadow-sky-500/20 disabled:opacity-20 active:scale-90 transition-all"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
