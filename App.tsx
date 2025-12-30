
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Message, AppMode, AudioProcessingRefs, ChatSession } from './types';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';
import { Menu, Settings, Rocket, Activity, Wifi, ShieldAlert, AlertCircle, ShieldCheck } from 'lucide-react';
import { createPcmBlob, decode, decodeAudioData, soundEngine } from './utils/audio';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [userName, setUserName] = useState<string>(localStorage.getItem('harvic_user_name') || 'Commander');
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('harvic_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>(localStorage.getItem('harvic_last_session') || '');
  
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusText, setStatusText] = useState('Standby');
  const [groundingMetadata, setGroundingMetadata] = useState<any[]>([]);
  const [inputVolume, setInputVolume] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const audioRefs = useRef<AudioProcessingRefs>({ nextStartTime: 0, sources: new Set<AudioBufferSourceNode>() });
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeAnimationFrameRef = useRef<number | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const currentMessages = currentSession?.messages || [];

  const getSystemInstruction = useCallback(() => {
    return `You are Harvic Jr., a world-class space-themed AI assistant developed by HanBak Org. 
    The user's name is ${userName}. 
    Protocol version: 6.2 Pro. 
    Tone: Highly intelligent, efficient, kid-friendly but professional. 
    In Voice mode: Respond concisely. 
    Creators: HanBak Org.`;
  }, [userName]);

  useEffect(() => {
    const key = process.env.API_KEY;
    if (!key || key === 'undefined') {
      setApiKeyMissing(true);
    } else {
      aiRef.current = new GoogleGenAI({ apiKey: key });
      if (sessions.length === 0) {
        handleNewSession();
      } else if (!currentSessionId) {
        setCurrentSessionId(sessions[0].id);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('harvic_user_name', userName);
  }, [userName]);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('harvic_sessions', JSON.stringify(sessions));
      localStorage.setItem('harvic_last_session', currentSessionId);
    }
  }, [sessions, currentSessionId]);

  const saveMessage = useCallback((msg: Message) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const updatedMessages = [...s.messages, msg];
        let newTitle = s.title;
        if ((s.title === 'New Mission' || !s.title) && msg.role === 'user') {
          newTitle = msg.text.length > 25 ? msg.text.substring(0, 25) + '...' : msg.text;
        }
        return { ...s, messages: updatedMessages, title: newTitle };
      }
      return s;
    }));
  }, [currentSessionId]);

  const handleNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Mission',
      messages: [],
      timestamp: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setIsSidebarOpen(false);
    soundEngine.playUnmute();
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setIsSidebarOpen(false);
    soundEngine.playReceive();
  };

  const handleClearAllSessions = () => {
    setSessions([]);
    setCurrentSessionId('');
    localStorage.removeItem('harvic_sessions');
    localStorage.removeItem('harvic_last_session');
    handleNewSession();
  };

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
        config: { systemInstruction: getSystemInstruction(), tools: [{ googleSearch: {} }] }
      });

      let fullText = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          setStreamingText(fullText);
        }
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          setGroundingMetadata(chunk.candidates[0].groundingMetadata.groundingChunks);
        }
      }

      soundEngine.playReceive();
      saveMessage({ id: Date.now().toString(), role: 'assistant', text: fullText, timestamp: new Date() });
      setStreamingText('');
    } catch (err) {
      console.error(err);
      saveMessage({ id: Date.now().toString(), role: 'assistant', text: "Neural link timeout. Check Vercel environment variables.", timestamp: new Date() });
    } finally {
      setIsTyping(false);
    }
  };

  const updateVolume = useCallback(() => {
    if (!analyserRef.current || isMuted) {
      setInputVolume(0);
      volumeAnimationFrameRef.current = requestAnimationFrame(updateVolume);
      return;
    }
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    setInputVolume(Math.min(1, (sum / dataArray.length) / 128));
    volumeAnimationFrameRef.current = requestAnimationFrame(updateVolume);
  }, [isMuted]);

  const startVoiceSession = useCallback(async () => {
    if (!aiRef.current) return;
    try {
      setIsConnecting(true);
      setStatusText('Initializing...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      if (!inputAudioCtxRef.current) inputAudioCtxRef.current = new AudioContext({ sampleRate: 16000 });
      if (!outputAudioCtxRef.current) outputAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      
      const sessionPromise = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatusText('Link Active');
            setIsConnecting(false);
            const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
            const analyser = inputAudioCtxRef.current!.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            source.connect(analyser);
            updateVolume();
            const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              sessionPromise.then(session => session.sendRealtimeInput({ media: createPcmBlob(e.inputBuffer.getChannelData(0)) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setStatusText('Transmitting');
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
                if (audioRefs.current.sources.size === 0) setStatusText('Awaiting Command');
              };
            }
          },
          onerror: () => setStatusText('Signal Lost'),
          onclose: () => setStatusText('Offline'),
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
      setStatusText('Access Denied');
    }
  }, [isMuted, updateVolume, getSystemInstruction]);

  const stopVoiceSession = useCallback(() => {
    if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
    if (analyserRef.current) analyserRef.current.disconnect();
    if (volumeAnimationFrameRef.current) cancelAnimationFrame(volumeAnimationFrameRef.current);
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

  if (apiKeyMissing) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-slate-900 border border-red-500/30 rounded-3xl shadow-2xl backdrop-blur-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Neural Key Missing</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Harvic Jr. requires an <span className="text-sky-400 font-bold">API_KEY</span> in your environment variables to function. 
            Please add it to your Vercel or local environment.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-sky-500/60 mb-8">
            KEY: API_KEY <br/> VALUE: your_gemini_key_here
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase tracking-widest transition-all">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-1 bg-slate-950 font-space selection:bg-sky-500/30">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        sessions={sessions}
        currentSessionId={currentSessionId}
        userName={userName}
        setUserName={setUserName}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onClearAllSessions={handleClearAllSessions}
      />

      <header className="flex items-center justify-between px-3 py-2 bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-xl shadow-2xl z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-sky-400">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[10px] font-black text-white tracking-[0.3em] uppercase leading-none flex items-center gap-1.5">
              Harvic Jr. <span className="text-sky-500 font-light italic">Pro</span>
            </h1>
            <span className="text-[7px] font-black text-sky-400 uppercase opacity-40 tracking-widest mt-0.5">Vercel_Ready_v6.2</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 bg-slate-950/80 px-4 py-1 rounded-full border border-white/5 shadow-inner">
          <div className="flex items-center gap-2">
            <Activity className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span className="text-[7px] text-emerald-400 font-black uppercase tracking-widest">Neural_Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <Rocket className="w-2.5 h-2.5 text-sky-400" />
            <span className="text-[7px] text-sky-400 font-black uppercase tracking-widest">{userName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-2.5 h-2.5 text-purple-400" />
            <span className="text-[7px] text-purple-400 font-black uppercase tracking-widest">Live_Host</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950/90 p-1 rounded-lg border border-white/10">
            <button onClick={() => setMode(AppMode.CHAT)} className={`px-3 py-1.5 rounded-md transition-all text-[9px] font-black uppercase tracking-widest ${mode === AppMode.CHAT ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-600'}`}>Chat</button>
            <button onClick={() => setMode(AppMode.VOICE)} className={`px-3 py-1.5 rounded-md transition-all text-[9px] font-black uppercase tracking-widest ${mode === AppMode.VOICE ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-600'}`}>Voice</button>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-500 hover:text-white transition-all bg-slate-900 border border-white/5 rounded-lg">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 relative z-10 py-1 overflow-hidden">
        {mode === AppMode.CHAT ? (
          <ChatInterface 
            messages={currentMessages} 
            onSendMessage={handleSendChatMessage} 
            isTyping={isTyping} 
            groundingMetadata={groundingMetadata} 
            streamingText={streamingText} 
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        ) : (
          <VoiceInterface isMuted={isMuted} onToggleMute={() => { setIsMuted(!isMuted); isMuted ? soundEngine.playUnmute() : soundEngine.playMute(); }} onEndCall={() => setMode(AppMode.CHAT)} isConnecting={isConnecting} statusText={statusText} inputVolume={inputVolume} />
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <footer className="px-3 py-1.5 flex justify-between items-center text-[7px] font-black text-slate-700 uppercase tracking-[0.5em] bg-slate-950/90 border-t border-white/5 z-20">
        <div className="flex items-center gap-2"><ShieldCheck className="w-2.5 h-2.5 text-sky-900" /> PRO_KERNEL_6.2_VRC</div>
        <div className="opacity-40">ENCRYPTED_HOSTING_ACTIVE</div>
        <div className="hidden sm:block text-sky-500/10 tracking-[1em]">SYSTEM_READY</div>
      </footer>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_bottom,#1e293b_0%,#020617_100%)] opacity-30"></div>
    </div>
  );
};

export default App;
