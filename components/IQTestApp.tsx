
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audio';
import { BrainCircuit, Play, CheckCircle, HelpCircle, XCircle, Mic, PhoneOff, Cpu, Activity } from 'lucide-react';

interface IQTestAppProps {
  apiKey: string;
  systemInstruction: string;
  onClose: () => void;
}

const IQTestApp: React.FC<IQTestAppProps> = ({ apiKey, systemInstruction, onClose }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [v, setV] = useState(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const startTest = useCallback(async () => {
    try {
      setIsStarted(true);
      setStatus('Linking Neural Core...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      let nextStartTime = 0;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Conducting IQ Test...');
            const source = audioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
              setV(Math.sqrt(sum/inputData.length));
              sessionPromise.then(s => s.sendRealtimeInput({ media: createPcmBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtxRef.current!.destination);

            // Initial instruction to AI
            sessionPromise.then(s => s.sendRealtimeInput({ 
              media: { data: "", mimeType: "audio/pcm;rate=16000" } 
            }));
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const buffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              nextStartTime = Math.max(nextStartTime, outCtx.currentTime);
              source.start(nextStartTime);
              nextStartTime += buffer.duration;
            }
          },
          onclose: () => setIsStarted(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemInstruction + "\n\nACT AS AN IQ TESTER. Ask the user 5 varied logic and math questions. Evaluate their answers with voice and give a final score.",
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } }
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      setIsStarted(false);
      setStatus('Failed');
    }
  }, [apiKey, systemInstruction]);

  useEffect(() => {
    return () => {
      sessionPromiseRef.current?.then(s => { try { s.close(); } catch(e) {} });
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <div className="h-full bg-slate-950 p-10 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 hacker-grid pointer-events-none" />
      
      {!isStarted ? (
        <div className="flex flex-col items-center gap-10 text-center animate-in zoom-in-95 duration-500 max-w-lg">
          <div className="w-32 h-32 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.1)]">
            <BrainCircuit className="w-16 h-16 text-yellow-500 animate-pulse" />
          </div>
          <div className="space-y-4">
             <h2 className="text-3xl font-black text-white tracking-[0.4em] uppercase leading-tight">IQ Analyzer v1.0</h2>
             <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
               Neural synchronization required. Harvic will conduct a 5-stage logic assessment. Voice interaction is mandatory.
             </p>
          </div>
          <button onClick={startTest} className="group relative px-12 py-5 bg-yellow-500 text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(234,179,8,0.4)]">
             <div className="flex items-center gap-3">
                <Play className="w-5 h-5 fill-current" />
                Initialize Bio-Scan
             </div>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-12 animate-in fade-in duration-1000">
           <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20 animate-ping" style={{ transform: `scale(${1.2 + v * 4})` }} />
              <div className="w-48 h-48 rounded-full border-4 border-yellow-500/40 bg-slate-900 flex items-center justify-center relative z-10 shadow-[0_0_100px_rgba(234,179,8,0.2)]">
                 <div className="flex gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1 bg-yellow-500 rounded-full transition-all duration-75" style={{ height: `${20 + v * 150}px` }} />
                    ))}
                 </div>
              </div>
           </div>
           <div className="flex flex-col items-center gap-4">
              <div className="px-8 py-3 bg-black/80 border border-yellow-500/20 rounded-2xl flex items-center gap-4">
                 <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />
                 <span className="text-xs font-black text-yellow-500 uppercase tracking-[0.4em]">{status}</span>
              </div>
              <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[1em] mt-4">Brain Waves Syncing...</p>
           </div>
           <button onClick={onClose} className="mt-8 p-6 rounded-full bg-red-600/20 border border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white transition-all">
              <PhoneOff className="w-6 h-6" />
           </button>
        </div>
      )}
    </div>
  );
};

export default IQTestApp;
