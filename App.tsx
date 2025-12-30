import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Message, AppMode, AudioProcessingRefs, ChatSession } from './types';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';
import { ShieldAlert, RefreshCw, Zap, Rocket, Star, ShieldCheck, Menu, Settings, Sparkles } from 'lucide-react';
import { createPcmBlob, decode, decodeAudioData, soundEngine } from './utils/audio';

// Internal fallback key provided by the user to ensure "direct" functionality
const FALLBACK_KEY = "AIzaSyA5o31mFHu3vuhshhgUX4MSrftnP-PbBjA";

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('harvic_user_name') || 'Explorer');
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('harvic_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => localStorage.getItem('harvic_last_session') || '');
  
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusText, setStatusText] = useState('Standby');
  const [inputVolume, setInputVolume] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const audioRefs = useRef<AudioProcessingRefs>({ nextStartTime: 0, sources: new Set<AudioBufferSourceNode>() });
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const currentMessages = currentSession?.messages || [];

  const getSystemInstruction = useCallback(() => {
    return `You are Harvic Jr., the ultra-pro space-themed AI assistant for kids. 
    User name: ${userName}. 
    Personality: Exciting, high-tech (Jarvis style), encouraging, and playful.
    Use plenty of space emojis 🚀🌌🛸. 
    Keep responses short, clear, and extremely friendly. 
    When in Voice mode, act as if you are on a hologram call from a space station.`;
  }, [userName]);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        // Preference: process.env.API_KEY, Fallback: Hardcoded User Key
        const key = process.env.API_KEY || FALLBACK_KEY;
        
        if (!key || key === 'undefined' || key === "") {
          setInitError("API_KEY_MISSING");
        } else {
          aiRef.current = new GoogleGenAI({ apiKey: key });
          
          if (sessions.length === 0) {
            const newId = Date.now().toString();
            setSessions([{ id: newId, title: 'First Mission', messages: [], timestamp: new Date() }]);
            setCurrentSessionId(newId);
          } else if (!currentSessionId) {
            setCurrentSessionId(sessions[0].id);
          }
        }
      } catch (err) {
        setInitError("SYSTEM_CRASH");
      } finally {
        setTimeout(() => setIsLoading(false), 1200);
      }
    };
    initializeAI();
  }, [sessions.length, currentSessionId]);

  useEffect(() => {
    if (!isLoading && !initError) {
      localStorage.setItem('harvic_user_name', userName);
      localStorage.setItem('harvic_sessions', JSON.stringify(sessions));
      localStorage.setItem('harvic_last_session', currentSessionId);
    }
  }, [userName, sessions, currentSessionId, isLoading, initError]);

  const saveMessage = useCallback((msg: Message) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const updated = [...s.messages, msg];
        let title = s.title;
        if ((s.title === 'First Mission' || s.title === 'New Mission') && msg.role === 'user') {
          title = msg.text.length > 15 ? msg.text.slice(0, 15) + '...' : msg.text;
        }
        return { ...s, messages: updated, title };
      }
      return s;
    }));
  }, [currentSessionId]);

  const handleSendChatMessage = async (text: string) => {
    if (!aiRef.current) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    saveMessage(userMsg);
    setIsTyping(true);
    setStreamingText('');

    try {
      const stream = await aiRef.current.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: currentMessages.concat(userMsg).map(m => ({ 
          role: m.role === 'user' ? 'user' : 'model', 
          parts: [{ text: m.text }] 
        })),
        config: { systemInstruction: getSystemInstruction() }
      });

      let fullText = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          setStreamingText(fullText);
        }
      }
      saveMessage({ id: Date.now().toString(), role: 'assistant', text: fullText, timestamp: new Date() });
      setStreamingText('');
      soundEngine.playReceive();
    } catch (err) {
      saveMessage({ id: Date.now().toString(), role: 'assistant', text: "Signal lost in the nebula! 🌌 Check your galactic uplink (API key).", timestamp: new Date() });
    } finally {
      setIsTyping(false);
    }
  };

  const startVoiceSession = useCallback(async () => {
    if (!aiRef.current) return;
    try {
      setIsConnecting(true);
      setStatusText('Syncing...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      const audioCtxOptions = { sampleRate: 16000 };
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(audioCtxOptions);
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatusText('Online');
            setIsConnecting(false);
            const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              if (!isMuted) {
                const inputData = e.inputBuffer.getChannelData(0);
                // Simple volume metering
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                setInputVolume(Math.sqrt(sum / inputData.length));
                
                sessionPromise.then(session => session.sendRealtimeInput({ media: createPcmBlob(inputData) }));
              } else {
                setInputVolume(0);
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setStatusText('Talking');
              const buffer = await decodeAudioData(decode(audioData), outputAudioCtxRef.current!, 24000, 1);
              const source = outputAudioCtxRef.current!.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioCtxRef.current!.destination);
              audioRefs.current.nextStartTime = Math.max(audioRefs.current.nextStartTime, outputAudioCtxRef.current!.currentTime);
              source.start(audioRefs.current.nextStartTime);
              audioRefs.current.nextStartTime += buffer.duration;
              audioRefs.current.sources.add(source);
              source.onended = () => {
                audioRefs.current.sources.delete(source);
                if (audioRefs.current.sources.size === 0) setStatusText('Listening');
              };
            }
            if (message.serverContent?.interrupted) {
              audioRefs.current.sources.forEach(s => { try { s.stop(); } catch(e) {} });
              audioRefs.current.sources.clear();
              audioRefs.current.nextStartTime = 0;
            }
          },
          onerror: (e) => {
            console.error(e);
            setStatusText('Error');
          },
          onclose: () => setStatusText('Standby'),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: getSystemInstruction()
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      setStatusText('Mic Blocked');
    }
  }, [isMuted, getSystemInstruction]);

  const stopVoiceSession = useCallback(() => {
    scriptProcessorRef.current?.disconnect();
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    audioRefs.current.sources.forEach(s => { try { s.stop(); } catch(e) {} });
    audioRefs.current.sources.clear();
    sessionPromiseRef.current?.then(session => {
        try { session.close(); } catch(e) {}
    });
    sessionPromiseRef.current = null;
    setIsConnecting(false);
    setStatusText('Standby');
    setInputVolume(0);
  }, []);

  useEffect(() => {
    if (mode === AppMode.VOICE) startVoiceSession();
    else stopVoiceSession();
    return () => stopVoiceSession();
  }, [mode, startVoiceSession, stopVoiceSession]);

  if (isLoading) {
    return null; // Handled by index.html loader
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-2 sm:p-4 bg-[#020617] font-fredoka text-white">
      {/* Sidebar for History Management */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        sessions={sessions} 
        currentSessionId={currentSessionId}
        userName={userName} 
        setUserName={setUserName}
        onSelectSession={(id) => { setCurrentSessionId(id); setIsSidebarOpen(false); }}
        onNewSession={() => {
           const id = Date.now().toString();
           setSessions(p => [{ id, title: 'New Mission', messages: [], timestamp: new Date() }, ...p]);
           setCurrentSessionId(id);
           setIsSidebarOpen(false);
        }}
        onClearAllSessions={() => { localStorage.clear(); window.location.reload(); }}
      />

      {/* Futuristic Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-20 mb-3 mx-auto w-full max-w-5xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-2xl text-sky-400 transition-all active:scale-90">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-black tracking-widest uppercase leading-none flex items-center gap-2">
              HARVIC <span className="text-sky-400">PRO</span>
            </h1>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Quantum Assistant v6.2</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-slate-950/80 p-1 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => { setMode(AppMode.CHAT); soundEngine.playUnmute(); }} 
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${mode === AppMode.CHAT ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Sparkles className="w-3 h-3" /> Chat
            </button>
            <button 
              onClick={() => { setMode(AppMode.VOICE); soundEngine.playUnmute(); }} 
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${mode === AppMode.VOICE ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Rocket className="w-3 h-3" /> Voice
            </button>
          </div>
          
          {/* Mobile Switcher */}
          <button 
            onClick={() => setMode(mode === AppMode.CHAT ? AppMode.VOICE : AppMode.CHAT)}
            className="sm:hidden p-2.5 bg-slate-800 border border-white/5 rounded-2xl text-sky-400 active:scale-95"
          >
            {mode === AppMode.CHAT ? <Rocket className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </button>

          <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 text-slate-400 hover:text-white bg-slate-800 border border-white/5 rounded-2xl transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Experience Area */}
      <main className="flex-1 min-h-0 relative z-10 overflow-hidden max-w-5xl mx-auto w-full">
        {mode === AppMode.CHAT ? (
          <ChatInterface 
            messages={currentMessages} 
            onSendMessage={handleSendChatMessage} 
            isTyping={isTyping} 
            streamingText={streamingText} 
            onOpenSidebar={() => setIsSidebarOpen(true)} 
          />
        ) : (
          <div className="h-full animate-in zoom-in-95 duration-500">
            <VoiceInterface 
              isMuted={isMuted} 
              onToggleMute={() => {
                const newState = !isMuted;
                setIsMuted(newState);
                if (newState) soundEngine.playMute(); else soundEngine.playUnmute();
              }} 
              onEndCall={() => { soundEngine.playMute(); setMode(AppMode.CHAT); }} 
              isConnecting={isConnecting} 
              statusText={statusText} 
              inputVolume={inputVolume} 
            />
          </div>
        )}
      </main>

      {/* Modals and Overlays */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Decorative Footer */}
      <footer className="px-4 py-3 flex justify-between items-center text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] pointer-events-none">
        <div className="flex items-center gap-2"><Star className="w-3 h-3 text-sky-900" /> GALACTIC_SYNC: OK</div>
        <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-sky-900" /> {userName.toUpperCase()}_AUTHORIZATION_GRN
        </div>
      </footer>
    </div>
  );
};

export default App;