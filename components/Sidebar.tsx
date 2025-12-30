
import React, { useState } from 'react';
import { X, Plus, MessageSquare, User, History, Database, Trash2, AlertTriangle, Check, RefreshCw, ShieldCheck } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  userName: string;
  setUserName: (name: string) => void;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onClearAllSessions: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  sessions, 
  currentSessionId, 
  userName, 
  setUserName,
  onSelectSession,
  onNewSession,
  onClearAllSessions
}) => {
  const [confirmPurge, setConfirmPurge] = useState(false);

  const handlePurge = () => {
    if (confirmPurge) {
      onClearAllSessions();
      setConfirmPurge(false);
    } else {
      setConfirmPurge(true);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`fixed top-0 left-0 h-full w-72 bg-slate-950/95 border-r border-white/10 z-[70] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div className="p-6 border-b border-white/5 bg-slate-950/50 z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <h2 className="text-[11px] font-black text-white tracking-[0.4em] uppercase flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-500" /> Mission_Vault
                </h2>
                <span className="text-[6px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 italic">Pro Protocol v6.2.1</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-all hover:rotate-90">
                <X className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={onNewSession}
              className="w-full relative group flex items-center justify-center gap-3 py-3 bg-sky-500/5 border border-sky-500/20 rounded-xl text-sky-400 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-sky-500 hover:text-white transition-all overflow-hidden"
            >
              <Plus className="w-4 h-4" /> New Mission
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide z-10">
            <div className="flex items-center gap-2 mb-4 px-2 opacity-30">
               <History className="w-3 h-3" />
               <span className="text-[7px] font-black uppercase tracking-widest">Session History</span>
            </div>

            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-10">
                 <RefreshCw className="w-8 h-8 animate-spin-slow mb-2" />
                 <span className="text-[7px] font-bold uppercase">Empty Sector</span>
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                    currentSessionId === session.id 
                    ? 'bg-sky-500/10 border border-sky-500/30' 
                    : 'hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentSessionId === session.id ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-900 text-slate-700'}`}>
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className={`text-[9px] font-black truncate w-full ${currentSessionId === session.id ? 'text-sky-50' : 'text-slate-500'}`}>
                      {session.title || 'Mission_Log'}
                    </span>
                    <span className="text-[6px] font-bold text-slate-700 uppercase">{new Date(session.timestamp).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-6 border-t border-white/5 bg-slate-950/80 z-10">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Commander Identifier
                </span>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3 py-2 text-[9px] text-sky-100 font-bold focus:outline-none focus:border-sky-500/20 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={handlePurge}
                  onMouseLeave={() => setConfirmPurge(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-[8px] font-black uppercase tracking-widest ${
                    confirmPurge ? 'bg-red-600 text-white' : 'bg-slate-900/50 text-red-500/50 hover:text-red-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {confirmPurge ? <AlertTriangle className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    {confirmPurge ? 'Confirm Purge?' : 'Clear All Data'}
                  </div>
                  {confirmPurge && <Check className="w-3 h-3" />}
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 opacity-20">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[6px] font-black uppercase tracking-[0.5em]">HanBak_Secure_V6</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
