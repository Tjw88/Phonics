// PLACEHOLDER AUDIO. The spec forbids text-to-speech for phonics content (it distorts isolated sounds)
// and requires recordings by a trained voice. This prototype therefore plays a distinct TONE per sound and
// always shows the sound on screen (e.g. /s/). Whole words use browser speech purely as a prototype aid.
let ctx: AudioContext | null = null;
let muted = false;
const ac = (): AudioContext | null => {
  try {
    ctx ??= new AudioContext();
    return ctx;
  } catch {
    return null;
  }
};

export const unlockAudio = (): void => {
  void ac()?.resume();
};
export const setMuted = (m: boolean): void => {
  muted = m;
  if (m) window.speechSynthesis?.cancel();
};

const SCALE = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0, 880.0, 1046.5, 1174.7];
const freqFor = (key: string): number => {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SCALE[hash % SCALE.length] as number;
};

const tone = (freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.18, delay = 0): void => {
  const a = ac();
  if (!a || muted) return;
  const t0 = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
};

export const blip = (phoneme: string): void => tone(freqFor(phoneme), 0.32, 'triangle', 0.22);
export const tap = (): void => tone(660, 0.07, 'sine', 0.1);
export const soft = (): void => tone(196, 0.25, 'sine', 0.1); // never a buzzer
export const praise = (): void => {
  const pool: [number, number, number][] = [
    [523.3, 659.3, 784.0], [587.3, 740, 880], [440, 554.4, 659.3], [659.3, 784, 988], [392, 523.3, 659.3],
  ];
  const [a, b, c] = pool[Math.floor(Math.random() * pool.length)] as [number, number, number];
  tone(a, 0.18, 'triangle', 0.16);
  tone(b, 0.18, 'triangle', 0.16, 0.12);
  tone(c, 0.3, 'triangle', 0.16, 0.24);
};

/** Play a sequence of sounds; `onStep(i)` fires as each starts. */
export const playSequence = async (phonemes: string[], onStep?: (i: number) => void, gapMs = 620): Promise<void> => {
  for (let i = 0; i < phonemes.length; i++) {
    onStep?.(i);
    blip(phonemes[i] as string);
    await new Promise((r) => setTimeout(r, gapMs));
  }
  onStep?.(-1);
};

/** Whole words only, never isolated sounds. Prototype aid; replace with recorded audio. */
export const speak = (text: string): void => {
  if (muted || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  } catch {
    /* no speech available: captions carry the meaning */
  }
};
