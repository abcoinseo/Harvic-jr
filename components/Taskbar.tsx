
import React, { useState, useEffect } from 'react';
import { AppID } from '../types';
import { LayoutGrid, Cpu, Clock, Wifi } from 'lucide-react';

interface TaskbarProps {
  activeApp: AppID | null;
  onSelectApp: (id: AppID) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ activeApp, onSelectApp }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-16 bg-black/60 border-t border-cyan-500/20 backdrop-blur-3xl px-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-4">
        <button className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all">
          <LayoutGrid className="w-6 h-6" />
        </button>
        <div className="h-8 w-[1px] bg-white/10 mx-2" />
        <div className="flex items-center gap-2">
           <div className={`w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center transition-all ${activeApp === AppID.CHAT ? 'bg-cyan-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
              <Cpu className="w-5 h-5" />
           </div>
           <div className="hidden sm:block text-[10px] font-black text-cyan-500 tracking-tighter">
              CPU: 24% <br/> RAM: 1.2GB
           </div>
        </div>
      </div>

      <div className="flex items-center gap-6 text-cyan-500/60 font-mono text-[11px] font-bold">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          <span className="hidden sm:inline">UPLINK_SECURE</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
    </footer>
  );
};

export default Taskbar;
