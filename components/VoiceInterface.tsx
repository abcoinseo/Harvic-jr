
import React, { useMemo, useEffect, useState } from 'react';
import { PhoneOff, Mic, MicOff, Zap, AlertCircle, Rocket, Activity, Radio, Globe, Shield, Cpu, Sparkles, Layers, Waves } from 'lucide-react';

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
       setV(prev => prev * 0.75 + target * 0.25);
    }, 16);
    return () => clearInterval(interval);
  }, [inputVolume, isMuted, isConnecting]);

  const stars = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 0.5,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  })), []);

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden relative animate-in fade-in duration-700">
      
      {/* Space Background Layer with Dynamic Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute inset-0 transition-all duration-1000 ${isTalking ? 'bg-purple-900/40' : 'bg-cyan-900/10'}`} />
        
        {/* Plasma Nebula Effect */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220%] h-[220%] transition-all duration-1000 blur-[150px] opacity-20 ${
            isTalking ? 'bg-purple-600' : 'bg-cyan-500'
          }`} 
          style={{ transform: `translate(-50%, -50%) scale(${1 + v * 2}) rotate(${v * 10}deg)` }} 
        />

        {/* Floating Particles */}
        {stars.map((star) => (
          <div key={star.id} className={`absolute bg-white rounded-full transition-all duration-500 ${isTalking ? 'shadow-[0_0_10px_#a855f7]' : 'shadow-[0_0_10px_#22d3ee]'}`} style={{
            top: star.top, left: star.left, width: `${star.size}px`, height: `${star.size}px`,
            opacity: 0.2 + v * 0.8,
            transform: `translate(${v * 20}px, ${v * -20}px)`,
            animation: `twinkle ${star.duration}s infinite linear ${star.delay}s`
          }} />
        ))}

        {/* Dynamic Scanline Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="w-full h-full" style={{ 
            backgroundSize: '30px 30px',
            backgroundImage: `linear-gradient(to right, ${isTalking ? '#a855f7' : '#22d3ee'} 1px, transparent 1px), linear-gradient(to bottom, ${isTalking ? '#a855f7' : '#22d3ee'} 1px, transparent 1px)`,
            transform: `perspective(1000px) rotateX(60deg) translateY(${v * -100}px) scale(3)`,
          }}></div>
        </div>
      </div>

      {/* Protocol HUD */}
      <div className="flex items-center justify-between p-8 z-20">
         <div className="flex items-center gap-4 px-6 py-2.5 bg-black/80 border border-cyan-500/20 rounded-2xl backdrop-blur-2xl">
            <div className={`w-3 h-3 rounded-full ${isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 shadow-[0_0_20px_#22c55e]'}`} />
            <span className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em]">
              NEURAL_SYNC: {isConnecting ? 'INITIALIZING' : 'STABLE'}
            </span>
         </div>
         <div className="flex items-center gap-4 px-6 py-2.5 bg-black/80 border border-cyan-500/20 rounded-2xl backdrop-blur-2xl text-cyan-500">
            <Radio className={`w-5 h-5 ${isTalking ? 'animate-pulse text-purple-400' : ''}`} />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">UPLINK_SECURE</span>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-10 z-10 relative">
        <div className="relative mb-16">
          {/* Reaction Spheres */}
          <div className={`absolute inset-0 rounded-full border-[20px] transition-all duration-300 ${isTalking ? 'border-purple-500/10' : 'border-cyan-500/5'} animate-ping`} style={{ transform: `scale(${1.2 + v * 4})` }}></div>
          <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${isTalking ? 'border-purple-500/20' : 'border-cyan-500/10'} animate-ping [animation-delay:0.3s]`} style={{ transform: `scale(${1.6 + v * 6})` }}></div>

          {/* JARVIS CORE ORB */}
          <div className={`w-64 h-64 md:w-80 md:h-80 bg-slate-950 border-[6px] transition-all duration-500 rounded-full flex items-center justify-center shadow-[0_0_120px_rgba(0,0,0,1)] relative overflow-hidden ${
            isError ? 'border-red-600 shadow-red-600/40' : 
            isTalking ? 'border-purple-500 shadow-purple-500/60 scale-110' : 
            'border-cyan-400 shadow-cyan-500/40'
          }`}>
            
            {/* Holographic Rotation */}
            <div className="absolute inset-0 opacity-30 animate-[spin_10s_linear_infinite]" style={{ 
              backgroundImage: `conic-gradient(from 0deg, transparent, ${isTalking ? '#a855f7' : '#22d3ee'}, transparent)`, 
            }}></div>
            
            <div className="absolute inset-2 rounded-full border border-white/5 bg-slate-950/95 shadow-inner flex items-center justify-center">
              <div className={`w-2/3 h-2/3 rounded-full transition-all duration-300 blur-3xl opacity-20 ${isTalking ? 'bg-purple-500' : 'bg-cyan-400'}`} style={{ transform: `scale(${0.6 + v * 2})` }} />
              
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-1 rounded-full transition-all duration-75 ${isTalking ? 'bg-purple-400' : 'bg-cyan-400'}`} 
                        style={{ height: `${20 + (v * (150 + Math.random() * 50))}px`, opacity: 0.4 + v }} 
                      />
                    ))}
                 </div>
              </div>
            </div>

            <div className="flex flex-col items-center relative z-10">
              {isError ? (
                <AlertCircle className="w-24 h-24 text-red-500 animate-pulse" />
              ) : (
                <div className="relative group">
                  <div className={`absolute inset-0 blur-3xl transition-all duration-300 rounded-full ${isTalking ? 'bg-purple-500' : 'bg-cyan-400'}`} style={{ opacity: 0.1 + v * 0.9, transform: `scale(${1 + v * 1.5})` }} />
                  <Zap className={`w-24 h-24 md:w-32 md:h-32 transition-all ${isTalking ? 'text-purple-300' : 'text-cyan-300'}`} 
                      style={{ filter: `drop-shadow(0 0 30px ${isTalking ? '#a855f7' : '#0ea5e9'})`, transform: `scale(${1 + v * 0.4})` }} 
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-full flex justify-center">
            <div className={`flex items-center gap-6 px-10 py-4 bg-black/90 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-3xl transition-all duration-500 ${isTalking ? 'scale-110 border-purple-500/40' : 'scale-100 border-cyan-500/20'}`}>
              <Waves className={`w-5 h-5 ${isTalking ? 'text-purple-400 animate-bounce' : 'text-cyan-400'}`} />
              <span className={`text-[13px] font-black uppercase tracking-[0.4em] ${isTalking ? 'text-purple-400' : 'text-cyan-400'}`}>
                {statusText}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-16 mb-20 z-20">
          <h2 className="text-5xl md:text-7xl font-black tracking-[0.6em] text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            HARVIC <span className="text-cyan-500 italic">JR</span>
          </h2>
          <div className="flex items-center justify-center gap-4 mt-8 opacity-40">
             <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-cyan-500" />
             <span className="text-[11px] font-bold uppercase tracking-[0.8em]">V7.1 PRO CORE</span>
             <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-cyan-500" />
          </div>
        </div>

        <div className="flex items-center gap-12 md:gap-20 z-30">
          <button onClick={onToggleMute} className={`p-8 md:p-10 rounded-full border-2 transition-all transform active:scale-90 shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
              isMuted ? 'bg-red-500/20 border-red-500/60 text-red-500' : 'bg-slate-950 border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50'
            }`}>
            {isMuted ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
          
          <button onClick={onEndCall} className="p-12 md:p-14 rounded-full bg-red-600 text-white shadow-[0_0_100px_rgba(220,38,38,0.6)] hover:scale-105 active:scale-90 transition-all border-[14px] border-slate-950 ring-1 ring-white/10">
            <PhoneOff className="w-12 h-12" />
          </button>

          <div className="p-8 md:p-10 rounded-full bg-slate-950 border-2 border-white/10 text-slate-700">
            <Cpu className={`w-10 h-10 ${v > 0.1 ? 'text-cyan-500 animate-pulse' : ''}`} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
      `}} />
    </div>
  );
};

export default VoiceInterface;
