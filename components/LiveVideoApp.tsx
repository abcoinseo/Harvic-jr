
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audio';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Zap, Shield, Sparkles } from 'lucide-react';

interface LiveVideoAppProps {
  apiKey: string;
  systemInstruction: string;
  onClose: () => void;
}

const LiveVideoApp: React.FC<LiveVideoAppProps> = ({ apiKey, systemInstruction, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState('Standby');
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  const startSession = useCallback(async () => {
    try {
      setStatus('Initializing...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 480, height: 360 } 
      });
      
      if (videoRef.current) videoRef.current.srcObject = stream;

      const ai = new GoogleGenAI({ apiKey });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      let nextStartTime = 0;
      const sources = new Set<AudioBufferSourceNode>();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Active');
            setIsActive(true);
            
            // Audio Streaming
            const source = audioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (!isMuted) {
                const inputData = e.inputBuffer.getChannelData(0);
                sessionPromise.then(s => s.sendRealtimeInput({ media: createPcmBlob(inputData) }));
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtxRef.current!.destination);

            // Video Streaming (Frames)
            frameIntervalRef.current = window.setInterval(() => {
              if (videoRef.current && canvasRef.current && !isVideoOff) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.drawImage(videoRef.current, 0, 0, 480, 360);
                  canvasRef.current.toBlob(async (blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                      };
                      reader.readAsDataURL(blob);
                    }
                  }, 'image/jpeg', 0.6);
                }
              }
            }, 1000); // 1 FPS for efficiency
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
              sources.add(source);
              source.onended = () => sources.delete(source);
            }
            if (message.serverContent?.interrupted) {
              sources.forEach(s => s.stop());
              sources.clear();
              nextStartTime = 0;
            }
          },
          onclose: () => setStatus('Closed'),
          onerror: (e) => { console.error(e); setStatus('Error'); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed');
    }
  }, [apiKey, systemInstruction, isMuted, isVideoOff]);

  useEffect(() => {
    startSession();
    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      sessionPromiseRef.current?.then(s => s.close());
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden relative">
      <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
         <div className="px-4 py-2 bg-black/60 border border-cyan-500/20 rounded-xl backdrop-blur-xl flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]' : 'bg-slate-500'}`} />
            <span className="text-[10px] font-black tracking-widest text-cyan-500 uppercase">Live Uplink: {status}</span>
         </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-slate-950">
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} />
        <canvas ref={canvasRef} width="480" height="360" className="hidden" />
        
        {isVideoOff && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <div className="w-40 h-40 rounded-full border border-cyan-500/10 flex items-center justify-center animate-pulse">
               <Shield className="w-16 h-16 text-cyan-500/20" />
            </div>
            <span className="text-xs font-black tracking-widest text-cyan-500/20 uppercase">Video Signal Terminated</span>
          </div>
        )}

        {/* AI Reaction Hud */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           <div className="w-[80%] h-[80%] border border-cyan-500/5 rounded-[4rem] flex items-center justify-center">
              <div className={`w-24 h-24 rounded-full border-2 border-cyan-500/10 flex items-center justify-center ${isActive ? 'animate-[ping_3s_infinite]' : ''}`}>
                 <Zap className="w-8 h-8 text-cyan-500/20" />
              </div>
           </div>
        </div>
      </div>

      <div className="h-28 bg-black/80 border-t border-cyan-500/20 backdrop-blur-2xl flex items-center justify-center gap-8 px-10 relative z-30">
        <button onClick={() => setIsMuted(!isMuted)} className={`p-5 rounded-2xl border transition-all ${isMuted ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-cyan-500'}`}>
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        <button onClick={onClose} className="p-8 rounded-full bg-red-600 text-white shadow-[0_0_50px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-90 transition-all border-4 border-black ring-1 ring-white/10">
          <PhoneOff className="w-8 h-8" />
        </button>

        <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-5 rounded-2xl border transition-all ${isVideoOff ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-cyan-500'}`}>
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default LiveVideoApp;
