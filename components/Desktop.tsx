
import React from 'react';
import { AppID } from '../types';
import { MessageSquare, Mic, Video, Settings, Terminal, Bot } from 'lucide-react';

interface DesktopProps {
  activeApp: AppID | null;
  onOpenApp: (id: AppID) => void;
}

const Desktop: React.FC<DesktopProps> = ({ activeApp, onOpenApp }) => {
  const apps = [
    { id: AppID.CHAT, label: 'Chat', icon: MessageSquare, color: 'text-sky-400' },
    { id: AppID.VOICE, label: 'Voice', icon: Mic, color: 'text-purple-400' },
    { id: AppID.VIDEO_CALL, label: 'Video Call', icon: Video, color: 'text-red-400' },
    { id: AppID.TERMINAL, label: 'System', icon: Terminal, color: 'text-emerald-400' },
    { id: AppID.SETTINGS, label: 'Core', icon: Settings, color: 'text-slate-400' },
  ];

  return (
    <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-8 p-8 content-start">
      {apps.map((app) => (
        <button
          key={app.id}
          onClick={() => onOpenApp(app.id)}
          className={`flex flex-col items-center gap-2 group transition-all transform active:scale-90 ${activeApp === app.id ? 'opacity-30 grayscale' : ''}`}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900/60 border-2 border-white/5 rounded-3xl flex items-center justify-center backdrop-blur-xl group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            <app.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${app.color} transition-transform group-hover:scale-110`} />
          </div>
          <span className="text-[10px] sm:text-xs font-black text-white/60 tracking-widest uppercase group-hover:text-cyan-400 transition-colors">
            {app.label}
          </span>
        </button>
      ))}

      {/* Floating Harvic Core Avatar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
         <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-cyan-500/10 flex items-center justify-center animate-[pulse_4s_infinite]">
            <div className="w-3/4 h-3/4 rounded-full border-2 border-cyan-500/20 flex items-center justify-center animate-[spin_10s_linear_infinite]">
               <Bot className="w-12 h-12 text-cyan-500/40" />
            </div>
         </div>
         <div className="mt-8 text-center">
            <h2 className="text-xl sm:text-3xl font-black text-cyan-500/30 tracking-[1em] uppercase">HARVIC PRO</h2>
            <p className="text-[10px] text-cyan-500/10 font-bold uppercase tracking-[0.5em] mt-2">V7.1-STABLE-RELEASE</p>
         </div>
      </div>
    </div>
  );
};

export default Desktop;
