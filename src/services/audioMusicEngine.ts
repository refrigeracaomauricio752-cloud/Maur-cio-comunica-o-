/**
 * Audio & Music Synthesis Engine for Brazilian Commercial Jingles & Radio Spots.
 * Features:
 * - Upbeat Sertanejo Alegre rhythm generator (Viola caipira / Acoustic guitar, Sanfona/Accordion, Bass, Drums)
 * - Modão Sertanejo, Forró/Piseiro, and Carro de Som styles
 * - Commercial radio chime / vinheta intro
 * - Dynamic sidechain ducking (voiceover takes priority over background music)
 * - WAV file encoder for direct export and WhatsApp sharing
 */

export type MusicStyle =
  | 'sertanejo_alegre'
  | 'modao_sertanejo'
  | 'forro_piseiro'
  | 'carro_de_som'
  | 'pop_acustico'
  | 'nenhum';

export interface MusicTrackConfig {
  style: MusicStyle;
  musicVolume: number; // 0 to 1 (default 0.28)
  voiceVolume: number; // 0 to 1 (default 1.0)
  enableIntroChime: boolean; // Commercial intro ding
  duckingAmount: number; // 0 to 1 (default 0.70)
}

// Convert an AudioBuffer to a 16-bit PCM WAV Blob
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + length, true);
  // RIFF type
  writeString(8, 'WAVE');
  // format chunk identifier
  writeString(12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, format, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, sampleRate * blockAlign, true);
  // block align
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(36, 'data');
  // data chunk length
  view.setUint32(40, length, true);

  // Interleave audio samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      // Clamping
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}

// Convert base64 WAV into AudioBuffer
export async function base64ToAudioBuffer(
  ctx: AudioContext | OfflineAudioContext,
  base64: string
): Promise<AudioBuffer> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await ctx.decodeAudioData(bytes.buffer.slice(0));
}

/**
 * Procedurally synthesize Brazilian background music according to the chosen style.
 * Uses Web Audio synthesis of Acoustic Guitars, Accordion (Sanfona), Bassline, and Percussion.
 */
export async function generateMusicalBackdrop(
  durationSeconds: number,
  style: MusicStyle,
  sampleRate = 44100
): Promise<AudioBuffer | null> {
  if (style === 'nenhum' || durationSeconds <= 0) {
    return null;
  }

  const offlineCtx = new OfflineAudioContext(2, Math.ceil(durationSeconds * sampleRate), sampleRate);

  // Style parameters
  let bpm = 128; // Standard upbeat Brazilian Sertanejo Universitário / Vanera
  let rootFreq = 146.83; // D3
  let chordProgression: number[][] = [
    // D major: D (I), A (V), Bm (vi), G (IV)
    [146.83, 185.0, 220.0, 293.66], // D
    [110.0, 164.81, 220.0, 277.18], // A
    [123.47, 146.83, 185.0, 246.94], // Bm
    [98.0, 146.83, 196.0, 246.94], // G
  ];

  if (style === 'modao_sertanejo') {
    bpm = 106;
    rootFreq = 130.81; // C3
    chordProgression = [
      [130.81, 164.81, 196.0, 261.63], // C
      [98.0, 146.83, 196.0, 246.94], // G
      [87.31, 130.81, 174.61, 220.0], // F
      [98.0, 146.83, 196.0, 246.94], // G
    ];
  } else if (style === 'forro_piseiro') {
    bpm = 138;
    rootFreq = 164.81; // E3
    chordProgression = [
      [164.81, 207.65, 246.94, 329.63], // E
      [110.0, 164.81, 220.0, 277.18], // A
      [123.47, 164.81, 185.0, 246.94], // B
      [110.0, 164.81, 220.0, 277.18], // A
    ];
  } else if (style === 'carro_de_som') {
    bpm = 132;
    chordProgression = [
      [146.83, 185.0, 220.0, 293.66],
      [98.0, 146.83, 196.0, 246.94],
      [146.83, 185.0, 220.0, 293.66],
      [110.0, 164.81, 220.0, 277.18],
    ];
  } else if (style === 'pop_acustico') {
    bpm = 112;
    chordProgression = [
      [130.81, 164.81, 196.0, 261.63],
      [110.0, 130.81, 164.81, 220.0],
      [87.31, 130.81, 174.61, 220.0],
      [98.0, 146.83, 196.0, 246.94],
    ];
  }

  const beatSec = 60 / bpm;
  const barSec = beatSec * 4;
  const totalBars = Math.ceil(durationSeconds / barSec) + 1;

  // Master music bus with compression and warming EQ
  const musicMaster = offlineCtx.createGain();
  musicMaster.gain.setValueAtTime(0.85, 0);

  const filter = offlineCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(9500, 0);
  musicMaster.connect(filter);
  filter.connect(offlineCtx.destination);

  // Synthesize instruments across bars
  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = bar * barSec;
    if (barStart > durationSeconds) break;

    const chordIndex = bar % chordProgression.length;
    const currentChord = chordProgression[chordIndex];

    // 1. DRUMS & PERCUSSION (Sertanejo groove: Kick on beats 1, 3; Snare rimshot on 2, 4; rapid shakers)
    for (let beat = 0; beat < 4; beat++) {
      const beatTime = barStart + beat * beatSec;
      if (beatTime >= durationSeconds) break;

      // Kick drum
      if (beat === 0 || beat === 2 || (style === 'carro_de_som' && beat % 1 === 0)) {
        createKick(offlineCtx, musicMaster, beatTime);
      }

      // Snare / Rimshot
      if (beat === 1 || beat === 3) {
        createSnare(offlineCtx, musicMaster, beatTime, style);
      }

      // Shaker / Chocalho / Hi-hat (continuous upbeat sertanejo subdivision)
      for (let sub = 0; sub < 4; sub++) {
        const subTime = beatTime + sub * (beatSec / 4);
        if (subTime < durationSeconds) {
          const isAccent = sub === 2 || sub === 0;
          createShaker(offlineCtx, musicMaster, subTime, isAccent ? 0.22 : 0.12);
        }
      }
    }

    // 2. BASSLINE (Sertanejo Walking / Pumping Bass)
    const root = currentChord[0];
    const fifth = root * 1.5;
    const bassNotes = [
      { time: barStart + 0 * beatSec, freq: root, dur: beatSec * 0.7 },
      { time: barStart + 1 * beatSec, freq: fifth, dur: beatSec * 0.4 },
      { time: barStart + 2 * beatSec, freq: root * 2, dur: beatSec * 0.6 },
      { time: barStart + 3 * beatSec, freq: fifth, dur: beatSec * 0.5 },
    ];

    bassNotes.forEach((n) => {
      if (n.time < durationSeconds) {
        createElectricBass(offlineCtx, musicMaster, n.time, n.freq, n.dur);
      }
    });

    // 3. SANFONA / ACCORDION (Rich harmonized Brazilian accordion chords & vibrato)
    for (let strum = 0; strum < 8; strum++) {
      const strumTime = barStart + strum * (beatSec / 2);
      if (strumTime >= durationSeconds) break;
      // Strum rhythm: accents on upbeat (offbeat swing)
      const accent = strum % 2 === 1 ? 0.35 : 0.18;
      createAccordionChord(offlineCtx, musicMaster, strumTime, currentChord, beatSec * 0.45, accent);
    }

    // 4. VIOLA CAIPIRA / ACOUSTIC GUITAR STRUM (Brilliant crisp rhythmic pluck)
    for (let s = 0; s < 4; s++) {
      const gTime = barStart + s * beatSec + (beatSec * 0.5);
      if (gTime < durationSeconds) {
        createGuitarStrum(offlineCtx, musicMaster, gTime, currentChord, beatSec * 0.4);
      }
    }

    // 5. CHEERFUL MELODIC HOOK (Every 2 bars, a memorable cheerful motif)
    if (bar % 2 === 0) {
      const melodyNotes = [
        currentChord[2] * 2,
        currentChord[3] * 2,
        currentChord[2] * 2,
        currentChord[1] * 2,
      ];
      melodyNotes.forEach((mFreq, mIdx) => {
        const mTime = barStart + mIdx * (beatSec * 0.5);
        if (mTime < durationSeconds) {
          createAccordionLead(offlineCtx, musicMaster, mTime, mFreq, beatSec * 0.4);
        }
      });
    }
  }

  // Smooth fade-out at the very end
  const fadeOutStart = Math.max(0, durationSeconds - 1.5);
  musicMaster.gain.setValueAtTime(0.85, fadeOutStart);
  musicMaster.gain.exponentialRampToValueAtTime(0.001, durationSeconds);

  return await offlineCtx.startRendering();
}

// Kick drum sound
function createKick(ctx: OfflineAudioContext, dest: GainNode, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(130, time);
  osc.frequency.exponentialRampToValueAtTime(38, time + 0.18);

  gain.gain.setValueAtTime(1.0, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + 0.25);
}

// Snare / Rimshot
function createSnare(ctx: OfflineAudioContext, dest: GainNode, time: number, style: MusicStyle) {
  // Noise component
  const bufferSize = ctx.sampleRate * 0.15;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.setValueAtTime(style === 'modao_sertanejo' ? 800 : 1200, time);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.7, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.14);

  whiteNoise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(dest);

  // Tonal body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, time);
  osc.frequency.exponentialRampToValueAtTime(120, time + 0.08);

  oscGain.gain.setValueAtTime(0.4, time);
  oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.09);

  osc.connect(oscGain);
  oscGain.connect(dest);

  whiteNoise.start(time);
  whiteNoise.stop(time + 0.16);
  osc.start(time);
  osc.stop(time + 0.1);
}

// Shaker / Hi-Hat
function createShaker(ctx: OfflineAudioContext, dest: GainNode, time: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'square';
  osc.frequency.setValueAtTime(6500 + Math.random() * 800, time);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(7500, time);
  filter.Q.setValueAtTime(3.0, time);

  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + 0.06);
}

// Electric Bass
function createElectricBass(
  ctx: OfflineAudioContext,
  dest: GainNode,
  time: number,
  freq: number,
  duration: number
) {
  const osc = ctx.createOscillator();
  const sub = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);

  sub.type = 'sine';
  sub.frequency.setValueAtTime(freq / 2, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(350, time);
  filter.frequency.exponentialRampToValueAtTime(180, time + duration);

  gain.gain.setValueAtTime(0.55, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

  osc.connect(filter);
  sub.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(time);
  sub.start(time);
  osc.stop(time + duration);
  sub.stop(time + duration);
}

// Brazilian Sanfona / Accordion Chord
function createAccordionChord(
  ctx: OfflineAudioContext,
  dest: GainNode,
  time: number,
  notes: number[],
  duration: number,
  vol: number
) {
  const chordGain = ctx.createGain();
  chordGain.gain.setValueAtTime(0.001, time);
  chordGain.gain.linearRampToValueAtTime(vol, time + 0.03);
  chordGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  chordGain.connect(dest);

  notes.slice(1).forEach((noteFreq) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    // Slight detune for that rich authentic accordion chorus
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(noteFreq, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(noteFreq * 1.003, time);

    const noteFilter = ctx.createBiquadFilter();
    noteFilter.type = 'lowpass';
    noteFilter.frequency.setValueAtTime(2200, time);

    osc1.connect(noteFilter);
    osc2.connect(noteFilter);
    noteFilter.connect(chordGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  });
}

// Sanfona Lead / Melody note
function createAccordionLead(
  ctx: OfflineAudioContext,
  dest: GainNode,
  time: number,
  freq: number,
  duration: number
) {
  const osc = ctx.createOscillator();
  const oscDetune = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  oscDetune.type = 'sawtooth';
  oscDetune.frequency.setValueAtTime(freq * 1.004, time);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(0.2, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1800, time);

  osc.connect(filter);
  oscDetune.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(time);
  oscDetune.start(time);
  osc.stop(time + duration);
  oscDetune.stop(time + duration);
}

// Viola Caipira / Steel Guitar Strum
function createGuitarStrum(
  ctx: OfflineAudioContext,
  dest: GainNode,
  time: number,
  notes: number[],
  duration: number
) {
  notes.forEach((freq, idx) => {
    const pluckTime = time + idx * 0.012; // Natural strum arpeggio
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 2, pluckTime);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 3, pluckTime);
    filter.Q.setValueAtTime(4.0, pluckTime);

    gain.gain.setValueAtTime(0.25, pluckTime);
    gain.gain.exponentialRampToValueAtTime(0.001, pluckTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(pluckTime);
    osc.stop(pluckTime + duration);
  });
}

// Commercial Intro Chime ("Atenção, ouvintes! Plim-plim")
function synthesizeRadioIntroChime(
  ctx: OfflineAudioContext,
  dest: AudioNode,
  time: number
) {
  const chimes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  chimes.forEach((freq, idx) => {
    const t = time + idx * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.85);
  });
}

/**
 * Mix voiceover buffer and procedural musical backdrop with Sidechain Ducking.
 * When the locutor speaks, the music volume drops smoothly; when silent, it rises.
 */
export async function mixVoiceAndMusic(
  voiceBuffer: AudioBuffer,
  config: MusicTrackConfig,
  customDuration?: number
): Promise<AudioBuffer> {
  const sampleRate = voiceBuffer.sampleRate || 44100;
  const introLeadTime = config.enableIntroChime ? 0.8 : 0.4;
  const outroTailTime = 2.0; // Let the music resolve cheerfully for 2s after voice finishes!

  const totalDuration = customDuration || (voiceBuffer.duration + introLeadTime + outroTailTime);
  const totalSamples = Math.ceil(totalDuration * sampleRate);

  const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

  // 1. Synthesize the background track if enabled
  let musicBuffer: AudioBuffer | null = null;
  if (config.style !== 'nenhum') {
    musicBuffer = await generateMusicalBackdrop(totalDuration, config.style, sampleRate);
  }

  // Master output limiter to avoid clipping
  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-4, 0);
  compressor.knee.setValueAtTime(10, 0);
  compressor.ratio.setValueAtTime(8, 0);
  compressor.attack.setValueAtTime(0.003, 0);
  compressor.release.setValueAtTime(0.25, 0);
  compressor.connect(offlineCtx.destination);

  // 2. Setup Voiceover Channel
  const voiceSource = offlineCtx.createBufferSource();
  voiceSource.buffer = voiceBuffer;

  const voiceGain = offlineCtx.createGain();
  voiceGain.gain.setValueAtTime(config.voiceVolume, 0);

  // Radio broadcaster EQ (slight low boost + crisp high boost)
  const voiceEqLow = offlineCtx.createBiquadFilter();
  voiceEqLow.type = 'lowshelf';
  voiceEqLow.frequency.setValueAtTime(200, 0);
  voiceEqLow.gain.setValueAtTime(2.5, 0);

  const voiceEqHigh = offlineCtx.createBiquadFilter();
  voiceEqHigh.type = 'highshelf';
  voiceEqHigh.frequency.setValueAtTime(4500, 0);
  voiceEqHigh.gain.setValueAtTime(2.0, 0);

  voiceSource.connect(voiceGain);
  voiceGain.connect(voiceEqLow);
  voiceEqLow.connect(voiceEqHigh);
  voiceEqHigh.connect(compressor);

  // Start voice slightly after intro so musical intro plays first
  const voiceStartTime = introLeadTime;
  voiceSource.start(voiceStartTime);

  // 3. Intro chime if requested
  if (config.enableIntroChime) {
    synthesizeRadioIntroChime(offlineCtx, compressor, 0.05);
  }

  // 4. Setup Music Track with Sidechain Ducking
  if (musicBuffer && config.musicVolume > 0) {
    const musicSource = offlineCtx.createBufferSource();
    musicSource.buffer = musicBuffer;

    const musicGain = offlineCtx.createGain();

    // Sidechain Ducking automation:
    // Full volume at intro -> ducks down when voice starts -> returns up after voice ends
    const baseMusicVol = config.musicVolume;
    const duckedMusicVol = baseMusicVol * (1 - config.duckingAmount);

    musicGain.gain.setValueAtTime(baseMusicVol * 0.9, 0);
    // Intro swell
    musicGain.gain.linearRampToValueAtTime(baseMusicVol, voiceStartTime - 0.1);
    // Duck down for locution
    musicGain.gain.linearRampToValueAtTime(duckedMusicVol, voiceStartTime + 0.1);

    // Keep ducked during voiceover
    const voiceEndTime = voiceStartTime + voiceBuffer.duration;
    musicGain.gain.setValueAtTime(duckedMusicVol, voiceEndTime - 0.2);

    // Swell back up for grand finale outro
    musicGain.gain.linearRampToValueAtTime(baseMusicVol * 1.1, voiceEndTime + 0.3);
    // Fade out at end
    musicGain.gain.setValueAtTime(baseMusicVol * 1.1, totalDuration - 1.2);
    musicGain.gain.exponentialRampToValueAtTime(0.001, totalDuration);

    musicSource.connect(musicGain);
    musicGain.connect(compressor);

    musicSource.start(0);
  }

  return await offlineCtx.startRendering();
}
