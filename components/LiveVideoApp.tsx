
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audio';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Zap, Shield, Sparkles, AlertTriangle, Monitor } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = useCallback(async () => {
    try {
      setStatus('Searching Hardware...');
      setErrorMsg(null);
      
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24 } } 
        });
      } catch (e: any) {
        if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsVideoOff(true);
          } catch (audioErr: any) {
            throw new Error("No usable microphone or camera found.");
          }
        } else {
          throw e;
        }
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatus('Neural Link...');
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
            
            if (stream.getAudioTracks().length > 0) {
              const source = audioCtxRef.current!.createMediaStreamSource(stream);
              const scriptProcessor = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (e) => {
                if (!isMuted && isActive) {
                  const inputData = e.inputBuffer.getChannelData(0);
                  sessionPromise.then(s => s.sendRealtimeInput({ media: createPcmBlob(inputData) }));
                }
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(audioCtxRef.current!.destination);
            }

            frameIntervalRef.current = window.setInterval(() => {
              if (videoRef.current && canvasRef.current && !isVideoOff && stream.getVideoTracks().length > 0) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.drawImage(videoRef.current, 0, 0, 640, 360);
                  canvasRef.current.toBlob(async (blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                      };
                      reader.readAsDataURL(blob);
                    }
                  }, 'image/jpeg', 0.5);
                }
              }
            }, 1000); 
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
          },
          onclose: () => setIsActive(false),
          onerror: (e) => setStatus('Link Interrupted')
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err: any) {
      setStatus('Init Failed');
      setErrorMsg(err.message || "Required device not found.");
    }
  }, [apiKey, systemInstruction, isMuted, isVideoOff, isActive]);

  useEffect(() => {
    startSession();
    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      sessionPromiseRef.current?.then(s => { try { s.close(); } catch(e) {} });
      audioCtxRef.current?.close();
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden relative">
      <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
         <div className="px-5 py-2.5 bg-black/80 border border-cyan-500/20 rounded-2xl backdrop-blur-2xl flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[11px] font-black tracking-[0.4em] text-cyan-400 uppercase">HOLOGRAPHIC_UPLINK: {status}</span>
         </div>
      </div>

      <div className="flex-1 flex flex-row items-stretch overflow-hidden relative">
        <div className="flex-1 bg-black relative flex items-center justify-center">
           {errorMsg ? (
             <div className="flex flex-col items-center gap-6 p-10 text-center animate-in fade-in duration-500">
               <AlertTriangle className="w-16 h-16 text-red-500" />
               <h3 className="text-xl font-black text-red-500 uppercase tracking-widest">Hardware Fault</h3>
               <p className="text-sm text-slate-500 uppercase tracking-tighter">{errorMsg}</p>
             </div>
           ) : (
             <>
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 muted 
                 className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} 
               />
               <canvas ref={canvasRef} width="640" height="360" className="hidden" />
               
               {isVideoOff && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-slate-900/60 backdrop-blur-xl">
                   <Monitor className="w-24 h-24 text-cyan-500/20" />
                   <span className="text-xs font-black tracking-[1em] text-cyan-500/40 uppercase">Video Disabled</span>
                 </div>
               )}

               <div className="absolute inset-0 pointer-events-none flex items-center justify-center border-x-4 border-cyan-500/5">
                  <div className="w-[95%] h-[90%] border border-cyan-500/10 rounded-[3rem] relative">
                     <div className="absolute top-10 left-10 w-20 h-[1px] bg-cyan-500/40" />
                     <div className="absolute top-10 left-10 h-20 w-[1px] bg-cyan-500/40" />
                     <div className="absolute bottom-10 right-10 w-20 h-[1px] bg-cyan-500/40" />
                     <div className="absolute bottom-10 right-10 h-20 w-[1px] bg-cyan-500/40" />
                  </div>
               </div>
             </>
           )}
        </div>
      </div>

      <div className="h-32 bg-black/95 border-t border-cyan-500/20 backdrop-blur-3xl flex items-center justify-center gap-12 px-10 relative z-30">
        <button onClick={() => setIsMuted(!isMuted)} className={`p-7 rounded-[2rem] border-2 transition-all ${isMuted ? 'bg-red-500/20 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-cyan-400'}`}>
          {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>
        
        <button onClick={onClose} className="p-10 rounded-full bg-red-600 text-white shadow-[0_0_80px_rgba(220,38,38,0.6)] hover:scale-105 active:scale-90 transition-all border-[10px] border-black group ring-1 ring-white/10">
          <PhoneOff className="w-10 h-10 group-hover:rotate-[135deg] transition-transform duration-500" />
        </button>

        <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-7 rounded-[2rem] border-2 transition-all ${isVideoOff ? 'bg-red-500/20 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-cyan-400'}`}>
          {isVideoOff ? <VideoOff className="w-8 h-8" /> : <Video className="w-8 h-8" />}
        </button>
      </div>
    </div>
  );
};

export default LiveVideoApp;
