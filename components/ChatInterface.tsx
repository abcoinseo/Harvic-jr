
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

type AIState = 'IDLE' | 'PROCESSING' | 'RESPONDING';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping, groundingMetadata, streamingText, onOpenSidebar }) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const aiState: AIState = !!streamingText ? 'RESPONDING' : isTyping ? 'PROCESSING' : 'IDLE';

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

  const NeuralCore = ({ state }: { state: AIState }) => {
    const isResponding = state === 'RESPONDING';
    const isProcessing = state === 'PROCESSING';
    const isIdle = state === 'IDLE';

    return (
      <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
        <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-1000 ${
          isResponding ? 'bg-sky-400/50 scale-150 animate-pulse-fast' : 
          isProcessing ? 'bg-purple-600/30 scale-125 animate-pulse' : 
          'bg-sky-900/10 scale-100 animate-nebula-breathing'
        }`}></div>

        <div className={`absolute inset-0 border border-white/5 rounded-full transition-transform duration-700 ${
          isResponding ? 'animate-spin-fast border-sky-400/40' : 
          isProcessing ? 'animate-spin border-purple-400/30' : 
          'rotate-12 border-slate-700/30 animate-slow-drift'
        }`}>
          <div className={`absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-lg transition-all duration-500 ${
            isResponding ? 'bg-sky-300 shadow-sky-400/50 scale-125' : 
            isProcessing ? 'bg-purple-400 shadow-purple-500/50 scale-100' : 
            'bg-slate-700 scale-75 animate-star-blink'
          }`}></div>
        </div>

        <div className={`absolute inset-1 border border-dotted rounded-full transition-opacity duration-700 ${
          isResponding ? 'animate-reverse-spin border-sky-400/20 opacity-100' : 
          isProcessing ? 'animate-reverse-spin-slow border-purple-400/10 opacity-60' : 
          'border-slate-800/10 opacity-20 animate-reverse-spin-very-slow'
        }`}></div>

        <div className={`relative w-5 h-5 rounded-full bg-slate-950 border transition-all duration-500 z-10 flex items-center justify-center overflow-hidden ${
          isResponding ? 'border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.7)] scale-110' : 
          isProcessing ? 'border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 
          'border-slate-800/80'
        }`}>
           {isIdle && (
             <div className="absolute inset-0 opacity-20 pointer-events-none">
               <div className="absolute top-0 left-0 w-full h-0.5 bg-sky-500/20 blur-[0.5px] animate-scanline"></div>
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-glint pointer-events-none"></div>
           {isResponding ? <Waves className="w-3 h-3 text-sky-400 animate-pulse" /> : isProcessing ? <Loader2 className="w-3 h-3 text-purple-400 animate-spin" /> : <Radio className="w-2.5 h-2.5 text-slate-600 group-hover:text-sky-400 transition-colors animate-heartbeat-pulse" />}
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin-fast { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes reverse-spin { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          @keyframes reverse-spin-slow { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          @keyframes reverse-spin-very-slow { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          @keyframes nebula-breathing { 0%, 100% { transform: scale(0.9); opacity: 0.1; filter: blur(12px); } 50% { transform: scale(1.1); opacity: 0.3; filter: blur(16px); } }
          @keyframes heartbeat-pulse { 0%, 100% { transform: scale(0.9); opacity: 0.4; } 5% { transform: scale(1.1); opacity: 0.8; } 10% { transform: scale(0.95); opacity: 0.5; } 15% { transform: scale(1.05); opacity: 0.7; } 20% { transform: scale(1); opacity: 0.6; } }
          @keyframes pulse-fast { 0%, 100% { transform: scale(1.4); opacity: 0.8; } 50% { transform: scale(1.6); opacity: 1; } }
          @keyframes flicker { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } 20%, 80% { opacity: 0.5; } }
          @keyframes scanline { 0% { top: -20%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 120%; opacity: 0; } }
          @keyframes star-blink { 0%, 80%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 85% { opacity: 0.2; transform: translate(-50%, -50%) scale(0.7); } 90% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); } 95% { opacity: 0.1; transform: translate(-50%, -50%) scale(0.5); } }
          @keyframes glint { 0% { transform: translateX(-150%) skewX(-25deg); } 30%, 100% { transform: translateX(150%) skewX(-25deg); } }
          @keyframes slow-drift { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
          .animate-spin-fast { animation: spin-fast 0.8s linear infinite; }
          .animate-reverse-spin { animation: reverse-spin 1.2s linear infinite; }
          .animate-reverse-spin-slow { animation: reverse-spin 3.14s linear infinite; }
          .animate-reverse-spin-very-slow { animation: reverse-spin 12s linear infinite; }
          .animate-nebula-breathing { animation: nebula-breathing 6s ease-in-out infinite; }
          .animate-heartbeat-pulse { animation: heartbeat-pulse 4s ease-in-out infinite; }
          .animate-pulse-fast { animation: pulse-fast 1s ease-in-out infinite; }
          .animate-flicker { animation: flicker 0.1s ease-in-out infinite; }
          .animate-scanline { animation: scanline 5s linear infinite; }
          .animate-star-blink { animation: star-blink 8s infinite; }
          .animate-glint { animation: glint 10s ease-in-out infinite; }
          .animate-slow-drift { animation: slow-drift 20s linear infinite; }
        `}} />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-lg overflow-hidden shadow-2xl relative">
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#38bdf8 0.5px, transparent 0.5px), linear-gradient(90deg, #38bdf8 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>

      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/70 border-b border-white/5 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onOpenSidebar}>
          <NeuralCore state={aiState} />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white tracking-[0.2em] uppercase opacity-90 leading-none group-hover:text-sky-400 transition-colors">Harvic Intelligence</span>
            <span className={`text-[6px] font-bold uppercase tracking-tighter transition-colors duration-300 ${
              aiState === 'RESPONDING' ? 'text-sky-400' : aiState === 'PROCESSING' ? 'text-purple-400' : 'text-slate-500'
            }`}>
              {aiState === 'RESPONDING' ? 'Receiving_Quantum_Packets' : aiState === 'PROCESSING' ? 'Thinking_In_Hyperspace' : 'Standby_Waiting_For_Command'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-slate-900/50 rounded-full border border-white/5">
             <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">Protocol_6.1_Active</span>
          </div>
          <button onClick={onOpenSidebar} className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-slate-400 hover:text-sky-400">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 md:space-y-6 scrollbar-hide relative">
        {messages.length === 0 && !streamingText && (
          <div className="h-full flex flex-col items-center justify-center text-sky-400/5 select-none">
            <div className="relative mb-4">
               <Rocket className="w-12 h-12 animate-bounce-subtle" />
               <div className="absolute -inset-4 bg-sky-400/10 rounded-full blur-xl animate-pulse"></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize Mission Log</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              {/* Avatar Design */}
              <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center transition-all duration-300 ${
                msg.role === 'user' ? 'bg-sky-600 shadow-lg shadow-sky-500/20' : 'bg-slate-800 border border-white/10 shadow-xl'
              }`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-sky-400" />}
              </div>

              {/* Message Bubble Design */}
              <div className="flex flex-col gap-1.5 max-w-[calc(100%-2rem)]">
                <div className={`relative px-3 py-2 rounded-2xl text-[10px] md:text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user' 
                  ? 'bg-sky-500 text-white rounded-br-none' 
                  : 'bg-slate-800/80 text-sky-50 border border-white/10 rounded-bl-none backdrop-blur-md'
                }`}>
                  {/* Holographic scanning effect for AI messages */}
                  {msg.role === 'assistant' && (
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none rounded-2xl overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400 to-transparent -translate-x-full animate-glint"></div>
                    </div>
                  )}
                  {msg.text}
                </div>

                {/* Grounding Metadata Cards */}
                {msg.role === 'assistant' && idx === messages.length - 1 && groundingMetadata && groundingMetadata.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1 animate-in fade-in slide-in-from-left-2 duration-500">
                    <div className="flex items-center gap-1 opacity-40 px-1">
                       <Globe className="w-2 h-2 text-sky-400" />
                       <span className="text-[7px] font-black uppercase tracking-widest text-sky-400">Verified_Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {groundingMetadata.map((chunk, i) => chunk.web && (
                        <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 bg-slate-900/60 border border-white/5 rounded-lg text-[8px] text-sky-300 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all group/card shadow-sm">
                          <div className="w-4 h-4 bg-slate-800 rounded flex items-center justify-center group-hover/card:bg-sky-500/20">
                            <Info className="w-2.5 h-2.5 text-sky-400" />
                          </div>
                          <span className="font-bold truncate max-w-[120px]">{chunk.web.title}</span>
                          <ExternalLink className="w-2 h-2 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming/Typing Design */}
        {(streamingText || isTyping) && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex max-w-[95%] flex-row items-end gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-800 border border-sky-500/30 flex items-center justify-center animate-pulse shadow-lg shadow-sky-500/10">
                <Bot className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="bg-slate-800/80 text-sky-50 border border-sky-500/20 rounded-2xl rounded-bl-none px-3 py-2 text-[10px] md:text-sm min-h-[2rem] flex items-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-sky-400/5 animate-pulse"></div>
                {streamingText || (
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Console Design */}
      <form onSubmit={handleSubmit} className="p-2 md:p-3 bg-slate-950/90 border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl z-30">
        <div className="relative group max-w-4xl mx-auto flex items-center gap-2">
          {/* Status Glow for the input */}
          <div className={`absolute -inset-1 rounded-xl blur-md opacity-20 group-focus-within:opacity-40 transition-opacity pointer-events-none ${
            aiState === 'RESPONDING' ? 'bg-sky-400' : 'bg-slate-700'
          }`}></div>
          
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3 text-slate-500 group-focus-within:text-sky-400 transition-colors">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder="Awaiting Command..." 
              className="w-full bg-slate-900/80 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-[10px] md:text-xs text-sky-50 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/40 focus:bg-slate-900 transition-all font-mono tracking-wide shadow-inner" 
            />
          </div>

          <button 
            type="submit" 
            className="p-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all disabled:opacity-20 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20 active:scale-95 group-active:translate-y-px group/btn" 
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        
        {/* Hardware Status Footer */}
        <div className="mt-2 flex justify-center items-center gap-4 opacity-30 select-none">
          <div className="flex items-center gap-1.5">
             <Cpu className="w-2 h-2 text-sky-400" />
             <span className="text-[7px] font-black text-sky-400 uppercase tracking-widest">OS_v6.1_PRO</span>
          </div>
          <div className="w-1 h-1 bg-white/10 rounded-full"></div>
          <div className="flex items-center gap-1.5">
             <Sparkles className="w-2 h-2 text-purple-400" />
             <span className="text-[7px] font-black text-purple-400 uppercase tracking-widest">Neural_Sync_Ready</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
