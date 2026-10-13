import React, { useState, useRef } from 'react';
import { Mic, Square, RotateCcw, Check, X, AlertCircle } from 'lucide-react';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (recordedBuffer: AudioBuffer) => void;
  scriptText: string;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onRecordingComplete,
  scriptText,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Não foi possível acessar o microfone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordingSeconds(0);
    setErrorMsg(null);
  };

  const confirmRecording = async () => {
    if (!recordedBlob) return;
    try {
      const arrayBuffer = await recordedBlob.arrayBuffer();
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      onRecordingComplete(audioBuffer);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg('Erro ao processar o áudio gravado: ' + error.message);
    }
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gravar Sua Própria Voz</h3>
              <p className="text-xs text-slate-400">Grave sua locução para misturar com o Sertanejo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Script Teleprompter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Teleprompter (Leia este texto enquanto grava):
          </label>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto font-sans">
            {scriptText || 'Texto da propaganda aparecerá aqui...'}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Recorder Center */}
        <div className="text-center py-4 space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <div className="text-3xl font-mono font-bold text-white">
            {formatSecs(recordingSeconds)}
          </div>

          <div className="flex items-center justify-center gap-3">
            {!isRecording && !recordedBlob && (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition active:scale-95"
              >
                <Mic className="w-5 h-5" />
                Iniciar Gravação
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/30 transition animate-pulse active:scale-95"
              >
                <Square className="w-5 h-5 fill-current" />
                Parar Gravação
              </button>
            )}

            {!isRecording && recordedBlob && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  Gravar Novamente
                </button>
                <button
                  type="button"
                  onClick={confirmRecording}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Usar Esta Gravação com o Sertanejo
                </button>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            {isRecording
              ? '🔴 Gravando seu áudio... Fale com bastante energia de rádio!'
              : recordedBlob
              ? 'Gravação concluída! Clique em "Usar Esta Gravação" para mixar com a música.'
              : 'Clique no botão acima e fale no microfone do celular ou computador.'}
          </p>
        </div>
      </div>
    </div>
  );
};
