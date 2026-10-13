import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Share2,
  Music,
  Mic,
  Sliders,
  Check,
  Sparkles,
} from 'lucide-react';
import { audioBufferToWav } from '../services/audioMusicEngine';

interface AudioPlayerVisualizerProps {
  masterBuffer: AudioBuffer | null;
  voiceBuffer: AudioBuffer | null;
  musicBuffer: AudioBuffer | null;
  businessName: string;
  musicStyleLabel: string;
  whatsappScriptText?: string;
  onReMix?: (musicVol: number, voiceVol: number) => void;
}

export const AudioPlayerVisualizer: React.FC<AudioPlayerVisualizerProps> = ({
  masterBuffer,
  voiceBuffer,
  musicBuffer,
  businessName,
  musicStyleLabel,
  whatsappScriptText,
  onReMix,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<'master' | 'voice' | 'music'>('master');
  const [musicVol, setMusicVol] = useState(0.28);
  const [voiceVol, setVoiceVol] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Active buffer depending on mode
  const currentBuffer =
    playbackMode === 'voice' && voiceBuffer
      ? voiceBuffer
      : playbackMode === 'music' && musicBuffer
      ? musicBuffer
      : masterBuffer;

  useEffect(() => {
    if (currentBuffer) {
      setDuration(currentBuffer.duration);
      stopPlayback();
      setCurrentTime(0);
      pauseTimeRef.current = 0;
    }
  }, [currentBuffer, playbackMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtxClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playFrom = (offset: number) => {
    if (!currentBuffer) return;
    initAudio();
    const ctx = audioCtxRef.current!;

    // Stop current source if any
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = currentBuffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isMuted ? 0 : 1, ctx.currentTime);

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    source.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    sourceNodeRef.current = source;
    gainNodeRef.current = gain;
    analyserRef.current = analyser;

    startTimeRef.current = ctx.currentTime - offset;
    source.start(0, offset);
    setIsPlaying(true);

    source.onended = () => {
      if (ctx.currentTime - startTimeRef.current >= currentBuffer.duration - 0.1) {
        setIsPlaying(false);
        setCurrentTime(0);
        pauseTimeRef.current = 0;
      }
    };

    startVisualizer();
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!currentBuffer) return;
    if (isPlaying) {
      if (audioCtxRef.current) {
        pauseTimeRef.current = audioCtxRef.current.currentTime - startTimeRef.current;
      }
      stopPlayback();
    } else {
      const startAt = pauseTimeRef.current >= duration ? 0 : pauseTimeRef.current;
      playFrom(startAt);
    }
  };

  const handleRestart = () => {
    stopPlayback();
    pauseTimeRef.current = 0;
    setCurrentTime(0);
    playFrom(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    pauseTimeRef.current = newTime;
    setCurrentTime(newTime);
    if (isPlaying) {
      playFrom(newTime);
    }
  };

  const startVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) {
        // Draw static placeholder wave
        drawIdleWave(ctx, canvas.width, canvas.height);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);

      if (audioCtxRef.current) {
        const cur = audioCtxRef.current.currentTime - startTimeRef.current;
        setCurrentTime(Math.min(cur, duration));
      }

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency spectrum bars with Brazilian festive theme (Green, Gold, Blue)
      const barWidth = (canvas.width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height * 0.85);

        const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        grad.addColorStop(0, '#16a34a'); // Green
        grad.addColorStop(0.5, '#eab308'); // Gold/Yellow
        grad.addColorStop(1, '#38bdf8'); // Sky blue

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 2);
      ctx.lineTo(canvas.width, canvas.height - 2);
      ctx.stroke();
    };

    draw();
  };

  const drawIdleWave = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const midY = height / 2;
    for (let x = 0; x < width; x += 5) {
      const y = midY + Math.sin(x * 0.04) * 8;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawIdleWave(ctx, canvas.width, canvas.height);
    }
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDownload = () => {
    if (!masterBuffer) return;
    setIsDownloading(true);
    try {
      const blob = audioBufferToWav(masterBuffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      a.href = url;
      a.download = `propaganda-${safeName || 'comercial'}-sertanejo.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const textToShare =
      whatsappScriptText ||
      `🔥 Ouça a nova propaganda comercial do ${businessName}! Produzida com fundo musical sertanejo alegre e locução profissional!`;
    const encoded = encodeURIComponent(textToShare);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  if (!masterBuffer) {
    return (
      <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center text-slate-400">
        <Music className="w-12 h-12 mx-auto mb-3 text-amber-500/60 animate-pulse" />
        <h3 className="text-lg font-semibold text-white mb-1">
          Estúdio de Áudio Pronto para Gravação
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Preencha os dados da sua refrigeração ou do seu cliente (como o Mercado do Elias) e clique no botão verde para gerar o áudio completo com fundo sertanejo alegre!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {businessName || 'Comercial'}
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {musicStyleLabel}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Áudio Masterizado com Sidechain & Fundo Sertanejo
            </p>
          </div>
        </div>

        {/* Channels Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => setPlaybackMode('master')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              playbackMode === 'master'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🎧 Mix Master
          </button>
          <button
            onClick={() => setPlaybackMode('voice')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
              playbackMode === 'voice'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mic className="w-3 h-3" /> Só a Voz
          </button>
          <button
            onClick={() => setPlaybackMode('music')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
              playbackMode === 'music'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Music className="w-3 h-3" /> Só o Sertanejo
          </button>
        </div>
      </div>

      {/* Visualizer Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
        <canvas
          ref={canvasRef}
          width={640}
          height={90}
          className="w-full h-24 block"
        />

        {/* Live status badge */}
        <div className="absolute top-2 left-3 flex items-center gap-2">
          {isPlaying ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              TOCANDO AGORA
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700">
              PAUSADO
            </span>
          )}
        </div>

        {/* Duration badge */}
        <div className="absolute top-2 right-3 font-mono text-xs text-amber-300 bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-amber-500/30">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress scrubber */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.05}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Main Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
            title={isPlaying ? 'Pausar' : 'Tocar áudio'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Restart */}
          <button
            onClick={handleRestart}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Reiniciar do começo"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Mute */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (gainNodeRef.current && audioCtxRef.current) {
                gainNodeRef.current.gain.setValueAtTime(
                  !isMuted ? 0 : 1,
                  audioCtxRef.current.currentTime
                );
              }
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={isMuted ? 'Desmutar' : 'Mutar'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Download & Share Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition active:scale-95 disabled:opacity-50"
            title="Baixar áudio pronto para enviar no WhatsApp ou tocar no carro de som"
          >
            <Download className="w-4 h-4" />
            Baixar Áudio (.WAV)
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold text-xs shadow-md transition active:scale-95"
            title="Enviar texto formatado e anúncio no WhatsApp"
          >
            {copiedShare ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copiedShare ? 'Abrindo WhatsApp...' : 'Enviar no WhatsApp'}
          </button>
        </div>
      </div>

      {/* Volume Balancers for Audio Production */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Music className="w-3.5 h-3.5" /> Volume do Fundo Sertanejo
            </span>
            <span className="font-mono text-slate-400">{Math.round(musicVol * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={musicVol}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMusicVol(val);
              onReMix?.(val, voiceVol);
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Mic className="w-3.5 h-3.5" /> Volume da Voz da Locução
            </span>
            <span className="font-mono text-slate-400">{Math.round(voiceVol * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.05}
            value={voiceVol}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVoiceVol(val);
              onReMix?.(musicVol, val);
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
