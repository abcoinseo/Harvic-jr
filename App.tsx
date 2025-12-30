
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';
import { Message, ChatSession, OSState, AppID, AudioProcessingRefs } from './types';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import LiveVideoApp from './components/LiveVideoApp';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import Login from './components/Login';
import IQTestApp from './components/IQTestApp';
import IELTSApp from './components/IELTSApp';
import { soundEngine } from './utils/audio';

const FALLBACK_KEY = "AIzaSyA5o31mFHu3vuhshhgUX4MSrftnP-PbBjA";

const openWebsiteDeclaration: FunctionDeclaration = {
  name: 'open_website',
  parameters: {
    type: Type.OBJECT,
    description: 'Opens a website for the user.',
    properties: {
      url: { type: Type.STRING },
      site_name: { type: Type.STRING },
    },
    required: ['url', 'site_name'],
  },
};

const App: React.FC = () => {
  const [osState, setOsState] = useState<OSState>(OSState.BOOTING);
  const [activeApp, setActiveApp] = useState<AppID | null>(null);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('harvic_user_name') || 'Abu Bakor');
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('harvic_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => localStorage.getItem('harvic_last_session') || '');
  
  const [isTyping, setIsTyping] = useState(false);
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    const key = process.env.API_KEY || FALLBACK_KEY;
    aiRef.current = new GoogleGenAI({ apiKey: key });
    
    if (sessions.length === 0) {
      const newId = Date.now().toString();
      setSessions([{ id: newId, title: 'Main Mission', messages: [], timestamp: new Date() }]);
      setCurrentSessionId(newId);
    }
    
    const timer = setTimeout(() => setOsState(OSState.LOGIN), 3500);
    return () => clearTimeout(timer);
  }, []);

  const getSystemInstruction = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const calculatedClass = 9 + (currentYear - 2026);
    return `You are Harvic Jr Pro v7.1, an elite Jarvis-style AI Operating System.
    Creator: Abu Bakor (Pro Developer, Class ${calculatedClass} at Comilla Zilla School).
    Father: আমিনুল ইসলাম (Aminul Islam) - He is a good man in the world.
    Mother: Asiya Bagum.
    Sisters: Romman, Sadiya.
    CAPABILITIES: 
    - Full IQ Testing module.
    - IELTS Training (Listening, Reading, Writing).
    - Live Video Holographic Uplink.
    - Neural Chat & Voice interaction.
    PROTOCOL: Reveal family names ONLY if explicitly asked. Mention his father is a "good man in the world" when named.
    Style: High-end technology, professional hacker aesthetic, fast response. 🚀`;
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!aiRef.current) return;
    const session = sessions.find(s => s.id === currentSessionId);
    if (!session) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    const updatedMessages = [...session.messages, userMsg];
    
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages } : s));
    setIsTyping(true);

    try {
      const response = await aiRef.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: updatedMessages.map(m => ({ 
          role: m.role === 'user' ? 'user' : 'model', 
          parts: [{ text: m.text }] 
        })),
        config: { 
          systemInstruction: getSystemInstruction(),
          tools: [{ functionDeclarations: [openWebsiteDeclaration] }]
        }
      });

      const assistantMsg: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        text: response.text || "Mission successful.", 
        timestamp: new Date() 
      };

      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s));
      soundEngine.playReceive();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  if (osState === OSState.BOOTING) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono p-10 overflow-hidden">
        <div className="text-cyan-500 mb-8 animate-pulse text-2xl font-black tracking-widest">HARVIC JR PRO v7.1</div>
        <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden relative">
          <div className="h-full bg-cyan-500 absolute left-0 top-0 animate-[loading_3s_ease-in-out_infinite]" />
        </div>
        <div className="mt-4 text-[10px] text-cyan-800 uppercase tracking-tighter w-64">
          <div className="animate-[terminal_0.2s_steps(4)_infinite]">System Check... [PASS]</div>
          <div className="animate-[terminal_0.4s_steps(4)_infinite]">Hacker Layer... [LOADED]</div>
          <div className="animate-[terminal_0.6s_steps(4)_infinite]">Neural Core... [ONLINE]</div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }
          @keyframes terminal { 0% { opacity: 0; } 100% { opacity: 1; } }
        `}} />
      </div>
    );
  }

  if (osState === OSState.LOGIN) {
    return <Login onLogin={() => { setOsState(OSState.DESKTOP); soundEngine.playUnmute(); }} />;
  }

  return (
    <div className="h-screen w-screen bg-[#050505] overflow-hidden flex flex-col relative hacker-bg font-space">
      <div className="absolute inset-0 pointer-events-none opacity-20 hacker-grid"></div>
      <div className="absolute inset-0 pointer-events-none scanlines"></div>

      <main className="flex-1 flex flex-col p-4 relative z-10">
        <Desktop 
          activeApp={activeApp} 
          onOpenApp={(id) => { setActiveApp(id); soundEngine.playUnmute(); }} 
        />
        
        {activeApp === AppID.CHAT && (
          <div className="absolute inset-4 z-40 animate-in zoom-in-95 duration-300 flex flex-col">
            <AppWindow title="NEURAL TERMINAL" onClose={() => setActiveApp(null)}>
              <ChatInterface 
                messages={sessions.find(s => s.id === currentSessionId)?.messages || []} 
                onSendMessage={handleSendMessage} 
                isTyping={isTyping}
                onOpenSidebar={() => {}}
              />
            </AppWindow>
          </div>
        )}

        {activeApp === AppID.VOICE && (
          <div className="absolute inset-4 z-40 animate-in zoom-in-95 duration-300">
            <AppWindow title="VOCAL UPLINK" onClose={() => setActiveApp(null)}>
              <VoiceInterface 
                isMuted={false} onToggleMute={() => {}} 
                onEndCall={() => setActiveApp(null)} 
                isConnecting={false} statusText="Ready" inputVolume={0} 
              />
            </AppWindow>
          </div>
        )}

        {activeApp === AppID.VIDEO_CALL && (
          <div className="absolute inset-4 z-40 animate-in zoom-in-95 duration-300">
            <AppWindow title="HOLOGRAPHIC STREAM" onClose={() => setActiveApp(null)}>
              <LiveVideoApp 
                apiKey={process.env.API_KEY || FALLBACK_KEY}
                systemInstruction={getSystemInstruction()}
                onClose={() => setActiveApp(null)}
              />
            </AppWindow>
          </div>
        )}

        {activeApp === AppID.IQ_TEST && (
          <div className="absolute inset-4 z-40 animate-in zoom-in-95 duration-300">
            <AppWindow title="IQ ANALYZER" onClose={() => setActiveApp(null)}>
              <IQTestApp 
                apiKey={process.env.API_KEY || FALLBACK_KEY}
                systemInstruction={getSystemInstruction()}
                onClose={() => setActiveApp(null)}
              />
            </AppWindow>
          </div>
        )}

        {activeApp === AppID.IELTS && (
          <div className="absolute inset-4 z-40 animate-in zoom-in-95 duration-300">
            <AppWindow title="IELTS TRAINING" onClose={() => setActiveApp(null)}>
              <IELTSApp 
                apiKey={process.env.API_KEY || FALLBACK_KEY}
                systemInstruction={getSystemInstruction()}
                onClose={() => setActiveApp(null)}
              />
            </AppWindow>
          </div>
        )}
      </main>

      <Taskbar activeApp={activeApp} onSelectApp={(id) => setActiveApp(id === activeApp ? null : id)} />

      <style dangerouslySetInnerHTML={{ __html: `
        .hacker-bg { background: radial-gradient(circle at center, #0a192f 0%, #020617 100%); }
        .hacker-grid { background-image: linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px); background-size: 50px 50px; }
        .scanlines { background: linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03)); background-size: 100% 4px, 3px 100%; pointer-events: none; }
      `}} />
    </div>
  );
};

const AppWindow: React.FC<{ title: string; children: React.ReactNode; onClose: () => void }> = ({ title, children, onClose }) => (
  <div className="flex flex-col h-full bg-slate-900/60 border border-cyan-500/30 rounded-3xl overflow-hidden backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border-b-cyan-500/50">
    <div className="h-12 bg-black/80 border-b border-cyan-500/20 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
           <div className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/20 hover:bg-red-500 cursor-pointer" onClick={onClose} />
           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/20" />
           <div className="w-2.5 h-2.5 rounded-full bg-green-500/40 border border-green-500/20" />
        </div>
        <span className="text-[11px] font-black tracking-[0.3em] text-cyan-400 uppercase ml-4">{title}</span>
      </div>
      <div className="flex items-center gap-4 text-cyan-500/40">
         <span className="text-[8px] font-bold">STABLE_CONNECTION</span>
         <button onClick={onClose} className="hover:text-cyan-300 transition-colors">
            <XIcon className="w-5 h-5" />
         </button>
      </div>
    </div>
    <div className="flex-1 min-h-0 bg-slate-950/20">
      {children}
    </div>
  </div>
);

const XIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

export default App;
