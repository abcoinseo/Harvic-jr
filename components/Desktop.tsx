
import React from 'react';
import { AppID } from '../types';
import { MessageSquare, Mic, Video, Settings, Terminal, Bot, BrainCircuit, GraduationCap } from 'lucide-react';

interface DesktopProps {
  activeApp: AppID | null;
  onOpenApp: (id: AppID) => void;
}

const Desktop: React.FC<DesktopProps> = ({ activeApp, onOpenApp }) => {
  const apps = [
    { id: AppID.CHAT, label: 'Chat', icon: MessageSquare, color: 'text-sky-400' },
    { id: AppID.VOICE, label: 'Voice', icon: Mic, color: 'text-purple-400' },
    { id: AppID.VIDEO_CALL, label: 'Video', icon: Video, color: 'text-red-400' },
    { id: AppID.IQ_TEST, label: 'IQ Test', icon: BrainCircuit, color: 'text-yellow-400' },
    { id: AppID.IELTS, label: 'IELTS', icon: GraduationCap, color: 'text-emerald-400' },
    { id: AppID.TERMINAL, label: 'Terminal', icon: Terminal, color: 'text-slate-500' },
    { id: AppID.SETTINGS, label: 'System', icon: Settings, color: 'text-slate-400' },
  ];

  return (
    <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-10 p-12 content-start">
      {apps.map((app) => (
        <button
          key={app.id}
          onClick={() => onOpenApp(app.id)}
          className={`flex flex-col items-center gap-3 group transition-all transform active:scale-90 ${activeApp === app.id ? 'opacity-30 grayscale blur-sm' : ''}`}
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-900/60 border-2 border-cyan-500/10 rounded-[2.5rem] flex items-center justify-center backdrop-blur-2xl group-hover:border-cyan-500/40 group-hover:shadow-[0_0_40px_rgba(34,211,238,0.25)] group-hover:-translate-y-2 transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-50"></div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/20 transition-all" />
            <app.icon className={`w-10 h-10 sm:w-12 sm:h-12 ${app.color} transition-transform group-hover:scale-110 drop-shadow-[0_0_10px_currentColor]`} />
          </div>
          <span className="text-[10px] font-black text-white/50 tracking-[0.3em] uppercase group-hover:text-cyan-400 transition-colors">
            {app.label}
          </span>
        </button>
      ))}

      {/* Central Holographic Hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center z-0">
         <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full flex items-center justify-center">
            <div className="absolute inset-0 border-[1px] border-cyan-500/5 rounded-full animate-[spin_30s_linear_infinite]" />
            <div className="absolute inset-10 border-[1px] border-cyan-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
            <div className="absolute inset-20 border-[1px] border-cyan-500/20 rounded-full animate-[pulse_4s_infinite]" />
            
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-cyan-500/30 flex items-center justify-center shadow-[0_0_100px_rgba(6,182,212,0.1)]">
               <div className="w-3/4 h-3/4 rounded-full border-2 border-cyan-500/40 flex items-center justify-center animate-[spin_8s_ease-in-out_infinite] relative">
                  <div className="absolute inset-0 bg-cyan-400/5 blur-3xl" />
                  <Bot className="w-16 h-16 text-cyan-500/60 drop-shadow-[0_0_20px_#06b6d4]" />
               </div>
            </div>
         </div>
         <div className="mt-12 text-center">
            <h2 className="text-2xl sm:text-4xl font-black text-cyan-500/20 tracking-[1.2em] uppercase leading-none">HARVIC PRO</h2>
            <div className="h-1 w-32 bg-cyan-500/10 mx-auto mt-4 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-500/30 w-1/3 animate-[shimmer_2s_infinite]" />
            </div>
         </div>
      </div>
    </div>
  );
};

export default Desktop;
