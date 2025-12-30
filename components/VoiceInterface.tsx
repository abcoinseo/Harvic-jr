
import React, { useMemo } from 'react';
import { PhoneOff, Mic, MicOff, Star, Shield, Zap, AlertCircle, Rocket, Disc, CircleDot, Activity, Share2, Wifi } from 'lucide-react';

interface VoiceInterfaceProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
  isConnecting: boolean;
  statusText: string;
  inputVolume: number; // 0 to 1
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  isMuted, 
  onToggleMute, 
  onEndCall, 
  isConnecting,
  statusText,
  inputVolume
}) => {
  const isError = statusText.toLowerCase().includes('failed') || statusText.toLowerCase().includes('denied');
  const isTransmitting = statusText.includes('Stream') || statusText.includes('Transmitting');
  const v = isMuted || isConnecting ? 0 : inputVolume;

  const stars = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 1.5 + 0.1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  })), []);

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden rounded-lg shadow-2xl relative border border-white/5">
      
      {/* Space Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute inset-0 transition-all duration-1000 ${isTransmitting ? 'bg-purple-900/10' : 'bg-sky-900/5'}`} />
        
        {/* Deep Nebula Pulses */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] transition-all duration-700 blur-[80px] opacity-20 ${
          isTransmitting ? 'bg-purple-500/20' : 'bg-sky-500/10'
        }`} style={{ transform: `translate(-50%, -50%) scale(${1 + v * 0.5})` }} />

        {stars.map((star) => (
          <div key={star.id} className="absolute bg-white rounded-full animate-twinkle" style={{
            top: star.top, left: star.left, width: `${star.size}px`, height: `${star.size}px`,
            animationDuration: `${star.duration}s`, animationDelay: `${star.delay}s`
          }} />
        ))}

        {/* Perspective Grid */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 perspective-grid-container">
          <div className="w-full h-full perspective-grid" style={{ 
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, ${isTransmitting ? '#a855f7' : '#0ea5e9'} 1px, transparent 1px), linear-gradient(to bottom, ${isTransmitting ? '#a855f7' : '#0ea5e9'} 1px, transparent 1px)`,
            transform: `rotateX(65deg) translateY(${v * -20}px) scale(2)`,
          }}></div>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between p-4 z-20">
         <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/5 rounded-full backdrop-blur-md">
            <Wifi className={`w-3 h-3 ${isConnecting ? 'text-yellow-500 animate-pulse' : 'text-green-500'}`} />
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Quantum_Encryption: ON</span>
         </div>
         <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/5 rounded-full backdrop-blur-md">
            <Share2 className="w-3 h-3 text-sky-400" />
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Link_ID: HRVC-XP-06</span>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 relative">
        <div className="relative mb-8 group">
          {/* Wave Visualization Rings */}
          <div className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${isTransmitting ? 'border-purple-500/30' : 'border-sky-500/20'} animate-ping`} style={{ transform: `scale(${1.2 + v * 0.8})` }}></div>
          <div className={`absolute inset-0 rounded-full border transition-all duration-300 ${isTransmitting ? 'border-purple-500/20' : 'border-sky-500/10'} animate-ping [animation-delay:0.2s]`} style={{ transform: `scale(${1.5 + v * 1.2})` }}></div>

          <div className={`w-40 h-40 md:w-56 md:h-56 bg-slate-900 border border-white/10 transition-all duration-500 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden ${
            isError ? 'border-red-500' : isTransmitting ? 'border-purple-500 ring-4 ring-purple-500/20' : 'border-sky-500/30 ring-4 ring-sky-500/10'
          }`} style={{ transform: `scale(${1 + v * 0.08}) rotate(${v * 5}deg)` }}>
            
            {/* Holographic scanning layer inside avatar */}
            <div className={`absolute inset-0 opacity-10 ${isTransmitting ? 'animate-spin-slow' : 'animate-reverse-spin'}`} style={{ 
              backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', 
              backgroundSize: '16px 16px' 
            }}></div>
            
            <div className="flex flex-col items-center relative z-10">
              {isError ? (
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="w-12 h-12 text-red-500 animate-pulse" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Link_Severed</span>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Zap className={`w-10 h-10 md:w-16 md:h-16 mb-2 transition-all duration-300 ${
                      isMuted ? 'text-slate-800' : isTransmitting ? 'text-purple-400' : 'text-sky-400'
                    }`} style={{ 
                      transform: `scale(${1 + v * 0.4})`, 
                      filter: v > 0.3 ? `drop-shadow(0 0 20px ${isTransmitting ? '#9333ea' : '#38bdf8'})` : 'none' 
                    }} />
                  </div>
                  <div className="flex gap-2 h-4 items-end">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className={`w-1 rounded-full transition-all duration-100 ${
                        isTransmitting ? 'bg-purple-500' : 'bg-sky-400'
                      }`} style={{ height: `${20 + (v * (50 + Math.random() * 50))} %`, opacity: 0.3 + (v * 0.7) }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Status Indicator Dot */}
          {!isConnecting && !isMuted && !isError && (
            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-4 border-slate-950 animate-pulse z-20 ${
              isTransmitting ? 'bg-purple-500 shadow-[0_0_15px_#9333ea]' : 'bg-green-500 shadow-[0_0_15px_#22c55e]'
            }`}></div>
          )}
        </div>

        <div className="text-center mb-10 z-20">
          <h2 className={`text-2xl md:text-3xl font-black font-space mb-2 tracking-[0.3em] ${isError ? 'text-red-400' : 'text-white'}`}>
            HARVIC <span className="text-sky-500 font-light italic">PRIME</span>
          </h2>
          <div className="flex flex-col items-center gap-2">
             <div className="flex items-center gap-2 px-4 py-1.5 bg-black/50 rounded-lg border border-white/5 backdrop-blur-2xl shadow-xl">
               <div className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500' : 'bg-sky-500 animate-pulse'}`} />
               <p className={`font-black uppercase tracking-[0.25em] text-[10px] md:text-xs ${
                 isError ? 'text-red-500' : isTransmitting ? 'text-purple-400' : 'text-sky-400'
               }`}>
                 {statusText}
               </p>
             </div>
             {v > 0 && (
               <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                 Processing_Voice_Signals...
               </div>
             )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 md:gap-12 z-30">
          <button 
            onClick={onToggleMute} 
            disabled={isConnecting} 
            className={`group p-4 md:p-5 rounded-2xl border transition-all transform active:scale-90 ${
              isMuted 
              ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-lg shadow-red-500/10' 
              : 'bg-slate-900 border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-500/40 hover:bg-slate-800'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />}
          </button>
          
          <button 
            onClick={onEndCall} 
            className="group p-6 md:p-8 rounded-full bg-red-600 text-white shadow-2xl hover:scale-105 active:scale-90 transition-all border-8 border-slate-950 ring-2 ring-white/5"
          >
            <PhoneOff className="w-7 h-7 group-hover:rotate-[135deg] transition-transform duration-500" />
          </button>

          <button className="p-4 md:p-5 rounded-2xl bg-slate-900 border border-white/5 text-slate-700 cursor-not-allowed">
            <Rocket className="w-5 h-5 opacity-20" />
          </button>
        </div>
      </div>

      {/* Interface Footer Bar */}
      <div className="p-2 bg-slate-900/80 border-t border-white/5 flex justify-between items-center text-[7px] md:text-[8px] font-black tracking-[0.3em] text-slate-500 gap-4 z-20">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-sky-500 animate-pulse" />
          SYSTEM_STABILITY: 99.8%
        </div>
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> SECURE</span>
          <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
          <span>NEURAL_LOAD: {(v * 100).toFixed(1)}%</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-grid-container { perspective: 1000px; }
        .perspective-grid { transform-origin: bottom; animation: grid-scroll 25s linear infinite; }
        @keyframes grid-scroll { from { background-position: 0 0; } to { background-position: 0 400px; } }
        @keyframes twinkle { 0%, 100% { opacity: 0.1; transform: scale(0.8); } 50% { opacity: 0.6; transform: scale(1.1); } }
        .animate-twinkle { animation: twinkle linear infinite; }
      `}} />
    </div>
  );
};

export default VoiceInterface;
