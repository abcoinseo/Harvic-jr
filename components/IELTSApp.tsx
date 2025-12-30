
import React, { useState } from 'react';
import { GraduationCap, Headphones, BookOpen, PenTool, ChevronRight, Activity, Globe, Radio, PhoneOff } from 'lucide-react';

interface IELTSAppProps {
  apiKey: string;
  systemInstruction: string;
  onClose: () => void;
}

const IELTSApp: React.FC<IELTSAppProps> = ({ apiKey, systemInstruction, onClose }) => {
  const [module, setModule] = useState<'HOME' | 'LISTENING' | 'READING' | 'WRITING'>('HOME');

  const modules = [
    { id: 'LISTENING', label: 'Listening', icon: Headphones, color: 'text-sky-400', desc: 'Neural comprehension of vocal data streams.' },
    { id: 'READING', label: 'Reading', icon: BookOpen, color: 'text-emerald-400', desc: 'Fast extraction of logic from encoded text passages.' },
    { id: 'WRITING', label: 'Writing', icon: PenTool, color: 'text-purple-400', desc: 'Generation of structured reports and arguments.' },
  ];

  if (module !== 'HOME') {
     return (
       <div className="h-full bg-slate-950 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-8">
             <Radio className="w-10 h-10 text-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-[0.4em] uppercase mb-4">{module} PROTOCOL</h2>
          <p className="text-sm text-slate-500 uppercase tracking-widest max-w-md mb-12">
            This module is being initialized on the galactic network. Harvic is preparing the simulation for your session.
          </p>
          <div className="flex gap-6">
             <button onClick={() => setModule('HOME')} className="px-8 py-3 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">
                Abort Mission
             </button>
             <button className="px-8 py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-3">
                <Activity className="w-4 h-4" /> Start Link
             </button>
          </div>
       </div>
     );
  }

  return (
    <div className="h-full bg-slate-950 p-8 flex flex-col">
      <header className="flex items-center justify-between mb-12 px-4">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
               <GraduationCap className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
               <h2 className="text-lg font-black text-white tracking-widest uppercase">IELTS Training</h2>
               <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">Simulator v4.2</p>
            </div>
         </div>
         <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
            <Globe className="w-3.5 h-3.5" /> Language Uplink OK
         </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((m) => (
          <button 
            key={m.id}
            onClick={() => setModule(m.id as any)}
            className="group flex flex-col p-8 bg-slate-900/40 border-2 border-white/5 rounded-[2.5rem] hover:border-emerald-500/40 hover:bg-slate-900 hover:shadow-[0_0_50px_rgba(16,185,129,0.1)] transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
               <ChevronRight className="w-6 h-6 text-emerald-500" />
            </div>
            <div className={`w-16 h-16 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-emerald-500/5 transition-all shadow-inner`}>
               <m.icon className={`w-8 h-8 ${m.color}`} />
            </div>
            <h3 className="text-xl font-black text-white tracking-widest uppercase mb-4">{m.label}</h3>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
               {m.desc}
            </p>
            <div className="mt-auto pt-8 flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
               <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Module_Ready</span>
            </div>
          </button>
        ))}
      </div>

      <footer className="mt-12 p-6 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
         <div className="flex items-center gap-4 text-slate-700">
            <PhoneOff className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-[0.5em]">Emergency Disconnect Protocol Active</span>
         </div>
         <span className="text-[8px] font-black text-emerald-500/30 uppercase tracking-[0.5em]">HanBak Education Systems</span>
      </footer>
    </div>
  );
};

export default IELTSApp;
