import React, { useMemo, useEffect, useState } from 'react';
import { PhoneOff, Mic, MicOff, Zap, AlertCircle, Rocket, Activity, Radio, Globe, Shield, Cpu, Sparkles, Layers } from 'lucide-react';

interface VoiceInterfaceProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
  isConnecting: boolean;
  statusText: string;
  inputVolume: number;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  isMuted, 
  onToggleMute, 
  onEndCall, 
  isConnecting,
  statusText,
  inputVolume
}) => {
  const isError = statusText.toLowerCase().includes('error') || statusText.toLowerCase().includes('blocked');
  const isTalking = statusText === 'Talking';
  const isListening = statusText === 'Listening' || statusText === 'Online';
  
  const [v, setV] = useState(0);
  useEffect(() => {
    const target = isMuted || isConnecting ? 0 : inputVolume;
    const interval = setInterval(() => {
       setV(prev => prev * 0.7 + target * 0.3);
    }, 16);
    return () => clearInterval(interval);
  }, [inputVolume, isMuted, isConnecting]);

  const stars = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 5,
  })), []);

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden rounded-[2.5rem] shadow-2xl relative border border-white/10 animate-in fade-in duration-700">
      
      {/* Space Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute inset-0 transition-all duration-1000 ${isTalking ? 'bg-purple-900/30' : 'bg-sky-900/10'}`} />
        
        {/* Deep Nebula Pulses */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] transition-all duration-1000 blur-[140px] opacity-25 ${
            isTalking ? 'bg-purple-600' : 'bg-sky-500'
          }`} 
          style={{ transform: `translate(-50%, -50%) scale(${1 + v * 1.5})` }} 
        />

        {stars.map((star) => (
          <div key={star.id} className="absolute bg-white rounded-full animate-twinkle" style={{
            top: star.top, left: star.left, width: `${star.size}px`, height: `${star.size}px`,
            animationDuration: `${star.duration}s`, animationDelay: `${star.delay}s`
          }} />
        ))}

        {/* Dynamic Perspective Grid */}
        <div className="absolute bottom-0 left-0 w-full h-full opacity-[0.05] perspective-grid-container pointer-events-none">
          <div className="w-full h-full perspective-grid" style={{ 
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, ${isTalking ? '#a855f7' : '#0ea5e9'} 1px, transparent 1px), linear-gradient(to bottom, ${isTalking ? '#a855f7' : '#0ea5e9'} 1px, transparent 1px)`,
            transform: `rotateX(60deg) translateY(${v * -60}px) scale(2.5)`,
          }}></div>
        </div>
      </div>

      {/* Protocol Header */}
      <div className="flex items-center justify-between p-6 z-20">
         <div className="flex items-center gap-3 px-4 py-2 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 shadow-[0_0_12px_#22c55e]'}`} />
            <span className="text-[10px] font-black text-sky-50 uppercase tracking-[0.3em]">
              UPLINK: {isConnecting ? 'Establishing' : 'Active'}
            </span>
         </div>
         <div className="flex items-center gap-3 px-4 py-2 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl text-sky-400">
            <Cpu className="w-4 h-4 animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">XP-8_CORE</span>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
        <div className="relative mb-12">
          {/* Wave Visualization Rings */}
          <div className={`absolute inset-0 rounded-full border-[12px] transition-all duration-300 ${isTalking ? 'border-purple-500/10' : 'border-sky-500/5'} animate-ping`} style={{ transform: `scale(${1.1 + v * 3})` }}></div>
          <div className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${isTalking ? 'border-purple-500/20' : 'border-sky-500/10'} animate-ping [animation-delay:0.2s]`} style={{ transform: `scale(${1.4 + v * 4})` }}></div>

          {/* Central Pro Avatar Orb */}
          <div className={`w-52 h-52 md:w-72 md:h-72 bg-slate-900 border-4 transition-all duration-500 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.9)] relative overflow-hidden ${
            isError ? 'border-red-500 shadow-red-500/30' : 
            isTalking ? 'border-purple-500 shadow-purple-500/50 scale-105' : 
            'border-sky-400 shadow-sky-500/30'
          }`}>
            
            {/* Holographic Scanning Core */}
            <div className="absolute inset-0 opacity-40 animate-spin-slow" style={{ 
              backgroundImage: `conic-gradient(from 0deg, transparent, ${isTalking ? '#a855f7' : '#38bdf8'}, transparent)`, 
            }}></div>
            
            {/* Neural Mesh Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
              backgroundSize: '15px 15px'
            }}></div>

            <div className="absolute inset-4 rounded-full border border-white/5 bg-slate-900/95 shadow-inner flex items-center justify-center">
              {/* Inner core reaction */}
              <div className={`w-3/4 h-3/4 rounded-full transition-all duration-300 blur-2xl opacity-20 ${isTalking ? 'bg-purple-500' : 'bg-sky-400'}`} style={{ transform: `scale(${0.5 + v * 1.5})` }} />
            </div>

            {/* Avatar Center Content */}
            <div className="flex flex-col items-center relative z-10">
              {isError ? (
                <div className="flex flex-col items-center gap-4">
                  <AlertCircle className="w-20 h-20 text-red-500 animate-pulse" />
                  <span className="text-[12px] font-black text-red-500 uppercase tracking-widest">Protocol_Broken</span>
                </div>
              ) : (
                <div className="relative group">
                  <div className={`absolute inset-0 blur-3xl transition-all duration-300 rounded-full ${isTalking ? 'bg-purple-500' : 'bg-sky-400'}`} style={{ opacity: 0.1 + v * 0.9, transform: `scale(${1 + v * 0.8})` }} />
                  
                  {/* Pro Reacting Icon */}
                  <div className={`relative transition-all duration-300 ${isMuted ? 'opacity-20' : 'opacity-100'}`} style={{ transform: `scale(${1 + v * 0.3}) rotate(${v * 20}deg)` }}>
                    <Zap className={`w-20 h-20 md:w-28 md:h-28 transition-all ${isTalking ? 'text-purple-300' : 'text-sky-300'}`} 
                        style={{ filter: `drop-shadow(0 0 25px ${isTalking ? '#a855f7' : '#0ea5e9'})` }} 
                    />
                  </div>
                  
                  {/* Dynamic Spectral Visualizer (Smooth) */}
                  <div className="flex gap-1.5 h-12 items-center justify-center mt-6">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-1 rounded-full transition-all duration-100 ${isTalking ? 'bg-purple-400' : 'bg-sky-400'}`} 
                        style={{ 
                          height: `${10 + (v * (100 + Math.random() * 60))} %`, 
                          opacity: 0.2 + (v * 0.8),
                          transform: `scaleY(${0.3 + Math.random()})`
                        }} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Capsule */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className={`flex items-center gap-4 px-8 py-3 bg-slate-900/95 border border-white/10 rounded-full shadow-2xl backdrop-blur-3xl transform transition-all duration-500 ${isTalking ? 'scale-110 border-purple-500/40 shadow-purple-500/20' : 'scale-100 border-sky-500/20 shadow-sky-500/10'}`}>
              <div className={`w-3 h-3 rounded-full ${isError ? 'bg-red-500' : isConnecting ? 'bg-yellow-500' : 'bg-green-500 shadow-[0_0_12px_currentColor]'} animate-pulse`} />
              <span className={`text-[12px] font-black uppercase tracking-[0.3em] ${isTalking ? 'text-purple-400' : 'text-sky-400'}`}>
                {statusText}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 mb-16 z-20">
          <div className="flex items-center justify-center gap-4 mb-4">
             <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-sky-500/50" />
             <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
             <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-sky-500/50" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-[0.4em] drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]">
            HARVIC <span className="text-sky-500 italic font-medium">JR</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em] mt-4">Autonomous Space Intelligence</p>
        </div>

        {/* Pro Voice Controls */}
        <div className="flex items-center gap-10 md:gap-16 z-30">
          <button onClick={onToggleMute} className={`p-6 md:p-8 rounded-[2.5rem] border-2 transition-all transform active:scale-90 shadow-2xl ${
              isMuted ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-red-500/20' : 'bg-slate-900/90 border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-500/50 hover:bg-slate-800'
            }`}>
            {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          
          <button onClick={onEndCall} className="p-10 md:p-12 rounded-full bg-red-600 text-white shadow-[0_0_80px_rgba(220,38,38,0.6)] hover:scale-105 active:scale-90 transition-all border-[12px] border-slate-950 ring-2 ring-white/10 group">
            <PhoneOff className="w-10 h-10 group-hover:rotate-[135deg] transition-transform duration-700" />
          </button>

          <div className="p-6 md:p-8 rounded-[2.5rem] bg-slate-900/90 border-2 border-white/10 text-slate-700 flex items-center justify-center transition-all hover:bg-slate-800">
            <Radio className={`w-8 h-8 ${v > 0.05 ? 'text-sky-500 animate-pulse' : ''}`} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-grid-container { perspective: 1000px; }
        .perspective-grid { transform-origin: bottom; animation: grid-scrolling 15s linear infinite; }
        @keyframes grid-scrolling { from { background-position: 0 0; } to { background-position: 0 400px; } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; transform: scale(1.2); } }
        .animate-twinkle { animation: twinkle linear infinite; }
      `}} />
    </div>
  );
};

export default VoiceInterface;