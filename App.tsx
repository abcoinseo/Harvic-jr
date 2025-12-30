
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Message, AppMode, AudioProcessingRefs, ChatSession } from './types';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';
import { ShieldAlert, RefreshCw, Zap, Rocket, Star, ShieldCheck, Menu, Settings } from 'lucide-react';
import { createPcmBlob, decode, decodeAudioData, soundEngine } from './utils/audio';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('harvic_user_name') || 'Commander');
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
    return `You are Harvic Jr., the Pro Galactic AI Assistant for ${userName}. 
    Version: 6.2 Pro. Mode: Helpful, Kids-friendly, and Jarvis-like. 
    Use emojis like 🚀, 🛸, 🌌. Keep responses energetic and encouraging.`;
  }, [userName]);

  // Use process.env.API_KEY directly as per guidelines. Assume it is pre-configured and valid.
  useEffect(() => {
    const initialize = async () => {
      try {
        const key = process.env.API_KEY;
        if (!key || key === 'undefined') {
          setInitError("API_KEY_MISSING");
        } else {
          aiRef.current = new GoogleGenAI({ apiKey: key });
          if (sessions.length === 0) {
            const newId = Date.now().toString();
            setSessions([{ id: newId, title: 'Initial Log', messages: [], timestamp: new Date() }]);
            setCurrentSessionId(newId);
          } else if (!currentSessionId) {
            setCurrentSessionId(sessions[0].id);
          }
        }
      } catch (err) {
        setInitError("SYSTEM_CRASH");
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    initialize();
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
        if (s.title === 'Initial Log' && msg.role === 'user') {
          title = msg.text.slice(0, 15) + '...';
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
      saveMessage({ id: Date.now().toString(), role: 'assistant', text: "Signal lost! 🛸 Check the API key in Vercel settings.", timestamp: new Date() });
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
      inputAudioCtxRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      
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
                sessionPromise.then(session => session.sendRealtimeInput({ media: createPcmBlob(e.inputBuffer.getChannelData(0)) }));
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
          },
          onerror: () => setStatusText('Logic Error'),
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
      setIsConnecting(false);
      setStatusText('Access Blocked');
    }
  }, [isMuted, getSystemInstruction]);

  const stopVoiceSession = useCallback(() => {
    scriptProcessorRef.current?.disconnect();
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    audioRefs.current.sources.forEach(s => { try { s.stop(); } catch(e) {} });
    audioRefs.current.sources.clear();
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;
    setIsConnecting(false);
    setStatusText('Standby');
  }, []);

  useEffect(() => {
    if (mode === AppMode.VOICE) startVoiceSession();
    else stopVoiceSession();
    return () => stopVoiceSession();
  }, [mode, startVoiceSession, stopVoiceSession]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center">
        <Zap className="w-12 h-12 text-sky-400 animate-bounce mb-4" />
        <h1 className="text-white font-bold text-xs tracking-widest uppercase animate-pulse">Neural Core Loading</h1>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-10 bg-slate-900 border-2 border-red-500/20 rounded-[3rem] shadow-2xl text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-xl font-bold text-white uppercase mb-4 tracking-tighter">Mission Interrupted</h2>
          <p className="text-slate-400 text-xs mb-8 leading-relaxed">
            {initError === "API_KEY_MISSING" 
              ? "The Galactic API Key is missing. Go to Vercel Project Settings > Environment Variables and add API_KEY." 
              : "The system encountered a logic loop. Please reboot the AI interface."}
          </p>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-bold uppercase transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Reboot Harvic Jr.
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-2 bg-[#020617] font-fredoka">
      <Sidebar 
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} 
        sessions={sessions} currentSessionId={currentSessionId}
        userName={userName} setUserName={setUserName}
        onSelectSession={setCurrentSessionId}
        onNewSession={() => {
           const id = Date.now().toString();
           setSessions(p => [{ id, title: 'New Mission', messages: [], timestamp: new Date() }, ...p]);
           setCurrentSessionId(id);
        }}
        onClearAllSessions={() => { localStorage.clear(); window.location.reload(); }}
      />

      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl z-20 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><Menu className="w-5 h-5" /></button>
          <h1 className="text-sm font-bold text-white tracking-widest uppercase leading-none">Harvic <span className="text-sky-400">Pro</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setMode(AppMode.CHAT)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${mode === AppMode.CHAT ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>Chat</button>
            <button onClick={() => setMode(AppMode.VOICE)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${mode === AppMode.VOICE ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>Voice</button>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-white/5 rounded-xl"><Settings className="w-4 h-4" /></button>
        </div>
      </header>

      <main className="flex-1 min-h-0 relative z-10 overflow-hidden">
        {mode === AppMode.CHAT ? (
          <ChatInterface messages={currentMessages} onSendMessage={handleSendChatMessage} isTyping={isTyping} streamingText={streamingText} onOpenSidebar={() => setIsSidebarOpen(true)} />
        ) : (
          <VoiceInterface isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} onEndCall={() => setMode(AppMode.CHAT)} isConnecting={isConnecting} statusText={statusText} inputVolume={inputVolume} />
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <footer className="px-4 py-2 flex justify-between items-center text-[8px] font-bold text-slate-700 uppercase tracking-widest">
        <div className="flex items-center gap-2"><Star className="w-3 h-3 text-sky-900" /> MISSION_ACTIVE</div>
        <div className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-sky-900" /> ENCRYPTED_LINK</div>
      </footer>
    </div>
  );
};

export default App;
