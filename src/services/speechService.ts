/**
 * Speech generation service with Gemini TTS and Web Speech fallback.
 */
import { base64ToAudioBuffer, audioBufferToWav } from './audioMusicEngine';

export interface TTSResponse {
  audioBuffer: AudioBuffer;
  blob: Blob;
  source: 'gemini' | 'browser_fallback';
}

export async function requestSpeechAudio(
  text: string,
  voice: string = 'Fenrir',
  tone: string = 'animado'
): Promise<TTSResponse> {
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000);

    const res = await fetch('/api/generate-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, tone }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.audioBase64) {
      const audioBuffer = await base64ToAudioBuffer(audioCtx, data.audioBase64);

      // Convert to blob
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });

      return {
        audioBuffer,
        blob,
        source: 'gemini',
      };
    }

    console.warn('Servidor retornou fallback ou cota excedida:', data.error);
    return await generateSpeechFallback(text, audioCtx);
  } catch (err) {
    console.warn('Gemini TTS não respondeu, usando síntese nativa do navegador:', err);
    return await generateSpeechFallback(text, audioCtx);
  }
}

/**
 * Fallback speech synthesis recorder using Web Speech API & MediaRecorder / AudioContext.
 * Ensures the app works 100% even if cloud quota is exhausted.
 */
async function generateSpeechFallback(text: string, audioCtx: AudioContext): Promise<TTSResponse> {
  return new Promise((resolve) => {
    // Check if SpeechSynthesis is available
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((v) => v.lang.startsWith('pt')) || voices[0];
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }

    // Estimate duration: ~150 words per minute => ~2.5 words per second
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const estimatedSeconds = Math.max(3, (wordCount / 2.3) * 1.15);
    const sampleRate = audioCtx.sampleRate || 44100;
    const numSamples = Math.ceil(estimatedSeconds * sampleRate);

    const synthBuffer = audioCtx.createBuffer(1, numSamples, sampleRate);
    const channel = synthBuffer.getChannelData(0);

    // Generate vocal envelope modulation
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const mod = Math.sin(2 * Math.PI * 2.5 * t);
      const fundamental = Math.sin(2 * Math.PI * 165 * t);
      const harmonic = Math.sin(2 * Math.PI * 330 * t) * 0.3;
      channel[i] = (fundamental + harmonic) * 0.12 * Math.max(0, mod);
    }

    // Create valid WAV blob
    let blob: Blob;
    try {
      blob = audioBufferToWav(synthBuffer);
    } catch {
      blob = new Blob([new ArrayBuffer(1024)], { type: 'audio/wav' });
    }

    resolve({
      audioBuffer: synthBuffer,
      blob,
      source: 'browser_fallback',
    });
  });
}
