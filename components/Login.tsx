
import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onLogin();
    }, 2000);
  };

  return (
    <div className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 to-transparent"></div>
      
      <div className="w-full max-w-sm p-10 bg-slate-900/40 border border-cyan-500/30 rounded-[3rem] backdrop-blur-3xl shadow-[0_0_100px_rgba(6,182,212,0.1)] relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-500/20 flex items-center justify-center mb-10 relative">
          {isVerifying ? (
            <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="absolute inset-2 border border-cyan-500/20 rounded-full animate-pulse" />
          )}
          <Lock className="w-10 h-10 text-cyan-500" />
        </div>

        <h1 className="text-xl font-black text-white tracking-[0.3em] uppercase mb-2">ACCESS CONTROL</h1>
        <p className="text-[10px] text-cyan-500/40 font-bold uppercase tracking-widest mb-12">SYSTEM_LOG_v7.1</p>

        <button 
          onClick={handleVerify}
          disabled={isVerifying}
          className="w-full group relative flex items-center justify-center gap-4 py-6 bg-cyan-500/10 border-2 border-cyan-500/30 rounded-2xl transition-all hover:bg-cyan-500 hover:text-white disabled:opacity-50"
        >
          <Fingerprint className="w-8 h-8" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">
            {isVerifying ? 'AUTHENTICATING...' : 'BIO-SCAN TO BOOT'}
          </span>
        </button>

        <div className="mt-12 flex items-center gap-3 text-cyan-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-[0.5em]">HanBak Quantum Protection</span>
        </div>
      </div>

      <div className="absolute bottom-10 text-[8px] text-cyan-950 font-black uppercase tracking-[1em]">
        AUTHORIZED ACCESS ONLY
      </div>
    </div>
  );
};

export default Login;
