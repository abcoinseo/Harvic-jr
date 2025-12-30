
import React from 'react';
import { X, Shield, Cpu, Volume2, Moon, Sparkles, Rocket, Fingerprint } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xs md:max-w-sm bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          <h2 className="text-[10px] md:text-xs font-black text-sky-50 font-space flex items-center gap-2 uppercase tracking-widest">
            <Cpu className="w-3.5 h-3.5 text-sky-500" />
            Command Center v6
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-sky-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-3 space-y-4">
          <div className="space-y-2">
            <h3 className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5">
              <Sparkles className="w-2 h-2" /> Neural Engine
            </h3>
            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-lg border border-white/5">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-[9px] font-bold text-sky-100 uppercase tracking-widest">Safe Protocols</span>
              </div>
              <div className="w-7 h-3.5 bg-sky-500 rounded-full flex items-center justify-end px-0.5">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-lg border border-white/5">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[9px] font-bold text-sky-100 uppercase tracking-widest">Biometric Sync</span>
              </div>
              <div className="w-7 h-3.5 bg-purple-600 rounded-full flex items-center justify-end px-0.5">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5">
              <Moon className="w-2 h-2" /> UI Environment
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-sky-500 text-white rounded-lg flex flex-col items-center gap-1 cursor-pointer shadow-md">
                <Rocket className="w-3.5 h-3.5" />
                <span className="text-[8px] font-black uppercase">Galactic</span>
              </div>
              <div className="p-2.5 bg-slate-800 text-slate-500 rounded-lg flex flex-col items-center gap-1 cursor-pointer border border-transparent hover:border-white/10">
                <Cpu className="w-3.5 h-3.5" />
                <span className="text-[8px] font-black uppercase">Standard</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 bg-slate-950/50 border-t border-white/5 text-center">
          <p className="text-[6px] text-slate-700 font-black uppercase tracking-[0.4em]">
            Jarvis Kernel v6.2.1-Final • Gemini Core
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
