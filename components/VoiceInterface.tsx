import React, { useMemo, useEffect, useState } from 'react';
import { PhoneOff, Mic, MicOff, Zap, AlertCircle, Rocket, Activity, Share2, Wifi, Radio, Globe, Shield } from 'lucide-react';

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
  const isError = statusText.toLowerCase().includes('error') || statusText.toLowerCase().includes('blocked');
  const isTalking = statusText === 'Talking';
  const isListening = statusText === 'Listening';
  
  // v represents the visual intensity, dampened slightly for smoothness
  const [v, setV] = useState(0);
  useEffect(() => {
    const target = isMuted || isConnecting ? 0 : inputVolume;
    setV(prev => prev * 0.4 + target * 0.6);
  }, [inputVolume, isMuted, isConnecting]);

  const stars = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
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
        <div className={`absolute inset-0 transition-all duration-1000 ${isTalking ? 'bg-purple-900/20' : 'bg-sky-900/10'}`} />
        
        {/* Deep Nebula Pulses */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] transition-all duration-1000 blur-[120px] opacity-20 ${
            isTalking ? 'bg-purple-500' : 'bg-sky-500'
          }`} 
          style={{ transform: `translate(-50%, -50%) scale(${1 + v * 0.8})` }} 
        />

        {stars.map((star) => (
          <div key={star.id} className="absolute bg-white rounded-full animate-twinkle" style={{
            top: star.top, left: star.left, width: `${star.size}px`, height: `${star.size}px`,
            animationDuration: `${star.duration}s`, animationDelay: `${star.delay}s`
          }} />
        ))}

        {/* Dynamic Perspective Grid */}
        <div className="absolute bottom-0 left-0 w-full h-2/3 opacity-10 perspective-grid-container">
          <div className="w-full h-full perspective-grid" style={{ 
            backgroundSize: '60px 60px',
            backgroundImage: `linear-gradient(to right, ${isTalking ? '#a855f7' : '#0ea5e9'} 2px, transparent 2px), linear-gradient(to bottom, ${isTalking ? '#a855f7' : '#0ea5e9'} 2px, transparent 2px)`,
            transform: `rotateX(75deg) translateY(${v * -40}px) scale(3)`,
          }}></div>
        </div>
      </div>

      {/* Top Protocol Bar */}
      <div className="flex items-center justify-between p-6 z-20">
         <div className="flex items-center gap-3 px-4 py-2 bg-black/50 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`} />
            <span className="text-[9px] font-black text-sky-100 uppercase tracking-widest">
              {isConnecting ? 'Establishing_Uplink...' : 'Uplink_Secure'}
            </span>
         </div>
         <div className="flex items-center gap-3 px-4 py-2 bg-black/50 border border-white/10 rounded-2xl backdrop-blur-xl text-sky-400">
            <Radio className={`w-4 h-4 ${isTalking || isListening ? 'animate-pulse' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Signal_ID: HRVC-PRO-9</span>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
        <div className="relative mb-12">
          {/* Wave Visualization Rings */}
          <div className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${isTalking ? 'border-purple-500/30' : 'border-sky-500/20'} animate-ping`} style={{ transform: `scale(${1.2 + v * 1.5})` }}></div>
          <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${isTalking ? 'border-purple-500/20' : 'border-sky-500/10'} animate-ping [animation-delay:0.3s]`} style={{ transform: `scale(${1.6 + v * 2.2})` }}></div>

          {/* Central Avatar Orb */}
          <div className={`w-48 h-48 md:w-64 md:h-64 bg-slate-900 border-4 transition-all duration-700 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.9)] relative overflow-hidden ${
            isError ? 'border-red-500/50 shadow-red-500/20' : 
            isTalking ? 'border-purple-500 shadow-purple-500/40' : 
            'border-sky-400/30 shadow-sky-500/20'
          }`} style={{ transform: `scale(${1 + v * 0.15})` }}>
            
            {/* Inner Scanning Effect */}
            <div className="absolute inset-0 opacity-20 animate-spin-slow pointer-events-none" style={{ 
              backgroundImage: 'conic-gradient(from 0deg, transparent, #38bdf8, transparent)', 
            }}></div>

            <div className="flex flex-col items-center relative z-10">
              {isError ? (
                <div className="flex flex-col items-center gap-3">
                  <AlertCircle className="w-16 h-16 text-red-500 animate-bounce" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Connection_Error</span>
                </div>
              ) : (
                <div className="relative">
                  <div className={`absolute inset-0 blur-2xl transition-all duration-300 ${isTalking ? 'bg-purple-500' : 'bg-sky-400'}`} style={{ opacity: v * 0.8 }} />
                  <Zap className={`w-16 h-16 md:w-24 md:h-24 transition-all duration-300 relative ${
                    isMuted ? 'text-slate-800' : isTalking ? 'text-purple-400' : 'text-sky-400'
                  }`} style={{ 
                    transform: `scale(${1 + v * 0.6})`,
                    filter: v > 0.1 ? `drop-shadow(0 0 30px ${isTalking ? '#a855f7' : '#0ea5e9'})` : 'none'
                  }} />
                  
                  {/* Dynamic Visualizer Bars */}
                  <div className="flex gap-1.5 h-6 items-center justify-center mt-4">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                      <div key={i} className={`w-1 rounded-full transition-all duration-75 ${isTalking ? 'bg-purple-400' : 'bg-sky-400'}`} 
                        style={{ 
                          height: `${20 + (v * (80 + Math.random() * 40))} %`, 
                          opacity: 0.2 + (v * 0.8),
                          transform: `scaleY(${0.5 + Math.random()})`
                        }} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Label Floating */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className={`flex items-center gap-3 px-6 py-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-3xl transform transition-all duration-500 ${isTalking ? 'scale-110' : 'scale-100'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isError ? 'bg-red-500' : isConnecting ? 'bg-yellow-500' : 'bg-green-500 shadow-[0_0_10px_currentColor]'} animate-pulse`} />
              <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isTalking ? 'text-purple-400' : 'text-sky-400'}`}>
                {statusText}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 mb-12 z-20">
          <h2 className={`text-3xl md:text-4xl font-black font-space mb-3 tracking-[0.4em] drop-shadow-lg ${isError ? 'text-red-400' : 'text-white'}`}>
            HARVIC <span className="text-sky-500 font-light italic">JR.</span>
          </h2>
          <div className="flex items-center justify-center gap-3 opacity-40">
            <div className="h-[1px] w-8 bg-sky-500" />
            <Globe className="w-4 h-4 text-sky-400" />
            <div className="h-[1px] w-8 bg-sky-500" />
          </div>
        </div>

        {/* Pro Call Controls */}
        <div className="flex items-center gap-10 md:gap-14 z-30">
          <button 
            onClick={onToggleMute} 
            disabled={isConnecting} 
            className={`group p-5 md:p-6 rounded-3xl border-2 transition-all transform active:scale-90 shadow-2xl ${
              isMuted 
              ? 'bg-red-500/20 border-red-500/50 text-red-400' 
              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-500/50 hover:bg-slate-800'
            }`}
          >
            {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />}
          </button>
          
          <button 
            onClick={onEndCall} 
            className="group p-8 md:p-10 rounded-full bg-red-600 text-white shadow-[0_0_60px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-90 transition-all border-[10px] border-slate-950 ring-2 ring-white/10"
          >
            <PhoneOff className="w-9 h-9 group-hover:rotate-[135deg] transition-transform duration-700" />
          </button>

          <div className="p-5 md:p-6 rounded-3xl bg-slate-900/80 border-2 border-white/10 text-slate-700">
            <Rocket className="w-7 h-7 opacity-20" />
          </div>
        </div>
      </div>

      {/* Futuristic Status Bar */}
      <div className="p-4 bg-slate-900/80 border-t border-white/10 flex justify-between items-center text-[8px] sm:text-[9px] font-black tracking-[0.4em] text-slate-500 gap-6 z-20">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-sky-500 animate-pulse" />
          NEURAL_LOAD: {(v * 100).toFixed(1)}%
        </div>
        <div className="hidden sm:flex gap-6 items-center">
          <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-green-500" /> ENCRYPTION_ACTIVE</div>
          <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
          <span className="text-sky-900">KERNEL_XP_8.0</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-grid-container { perspective: 800px; }
        .perspective-grid { transform-origin: bottom; animation: grid-move 20s linear infinite; }
        @keyframes grid-move { from { background-position: 0 0; } to { background-position: 0 600px; } }
        @keyframes twinkle { 0%, 100% { opacity: 0.1; transform: scale(0.6); } 50% { opacity: 0.8; transform: scale(1.2); } }
        .animate-twinkle { animation: twinkle linear infinite; }
        .animate-spin-slow { animation: spin 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default VoiceInterface;