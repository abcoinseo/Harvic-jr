import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Rocket, Zap, Sparkles, Activity, ShieldCheck, Cpu, Waves, Radio } from 'lucide-react';
import { Message } from '../types';
import { soundEngine } from '../utils/audio';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  streamingText?: string;
  onOpenSidebar: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping, streamingText, onOpenSidebar }) => {
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
    <div className="flex flex-col h-full bg-slate-900/30 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative backdrop-blur-xl animate-in zoom-in-95 duration-500">
      
      {/* CSS Animations for the AI Avatar */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes avatar-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(56, 189, 248, 0.1); }
          50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(56, 189, 248, 0.3); }
        }
        @keyframes avatar-scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes avatar-blink {
          0%, 94%, 96%, 100% { opacity: 1; }
          95% { opacity: 0.3; }
        }
        .ai-avatar-container {
          animation: avatar-breathe 4s ease-in-out infinite;
        }
        .ai-avatar-icon {
          animation: avatar-blink 8s infinite;
        }
        .ai-scan-line {
          animation: avatar-scan 3s linear infinite;
        }
      `}} />

      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #38bdf8 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth scrollbar-hide">
        {messages.length === 0 && !streamingText && (
          <div className="h-full flex flex-col items-center justify-center text-sky-400/20 gap-6">
            <div className="relative">
              <Rocket className="w-24 h-24 animate-bounce" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-sky-500/20 blur-xl animate-pulse"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
               <p className="text-sm font-black uppercase tracking-[0.4em]">Ready for Liftoff!</p>
               <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Signal quality: 100%</span>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6 duration-500`}>
            <div className={`flex max-w-[90%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-4`}>
              <div className={`w-12 h-12 rounded-[1.2rem] shrink-0 flex items-center justify-center shadow-xl transform transition-transform hover:scale-110 relative overflow-hidden ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-sky-400 to-sky-600' 
                  : 'bg-slate-800 border-2 border-sky-500/20 ai-avatar-container'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-6 h-6 text-white" />
                ) : (
                  <>
                    <div className="absolute inset-0 ai-scan-line bg-gradient-to-b from-transparent via-sky-400/20 to-transparent w-full h-1/2" />
                    <Bot className="w-6 h-6 text-sky-400 ai-avatar-icon" />
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className={`px-6 py-4 rounded-[1.8rem] text-sm sm:text-base leading-relaxed shadow-2xl transition-all ${
                  msg.role === 'user' 
                  ? 'bg-sky-500 text-white rounded-br-none' 
                  : 'bg-white/5 text-sky-50 border border-white/10 rounded-bl-none backdrop-blur-3xl'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest px-2">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {(streamingText || isTyping) && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-4">
            <div className="flex items-end gap-4">
              <div className="w-12 h-12 rounded-[1.2rem] bg-slate-800 border-2 border-sky-500/40 flex items-center justify-center ai-avatar-container relative overflow-hidden">
                <div className="absolute inset-0 ai-scan-line bg-gradient-to-b from-transparent via-sky-400/20 to-transparent w-full h-1/2" />
                <Radio className="w-6 h-6 text-sky-400 ai-avatar-icon" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[1.8rem] rounded-bl-none px-6 py-4 text-sky-100 backdrop-blur-3xl flex items-center gap-2">
                {streamingText || (
                   <div className="flex gap-1.5 items-center px-2">
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-slate-950/80 border-t border-white/10 backdrop-blur-3xl">
        <div className="max-w-4xl mx-auto flex items-center gap-4 relative">
          <div className="absolute left-6 text-sky-500/50 pointer-events-none">
            <Sparkles className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            placeholder="Talk to Harvic Jr... 🚀" 
            className="flex-1 bg-slate-900/80 border-2 border-white/5 rounded-3xl py-4 sm:py-5 pl-14 pr-6 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/40 transition-all shadow-inner" 
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isTyping}
            className="p-4 sm:p-5 bg-gradient-to-br from-sky-400 to-sky-600 text-white rounded-3xl shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:opacity-20 active:scale-90 transition-all group"
          >
            <Send className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
