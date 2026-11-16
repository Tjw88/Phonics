let ctx: AudioContext | null = null;
let muted = false;
let musicOn = true;
let night = false;

// ---- audio graph: everything goes through `master`; effects get a little "room" via a feedback delay; music has its own
// bus so it can duck under speech (spec: music ducks automatically and has its own toggle). ----
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
const ac = (): AudioContext | null => {
  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      // a small, soft room for effects
      const send = ctx.createGain();
      send.gain.value = 0.22;
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = 0.085;
      const fb = ctx.createGain();
      fb.gain.value = 0.32;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3200;
      send.connect(delay);
      delay.connect(lp);
      lp.connect(fb);
      fb.connect(delay);
      lp.connect(master);
      sfxBus = ctx.createGain();
      sfxBus.connect(master);
      sfxBus.connect(send);
      musicBus = ctx.createGain();
      musicBus.gain.value = 0.5;
      musicBus.connect(master);
    }
    return ctx;
  } catch {
    return null;
  }
};

interface Manifest {
  phonemes: Record<string, string[]>;
  words: Record<string, string>;
  phrases: Record<string, string>;
  sources?: Record<string, string>;
}
let manifest: Manifest | null = null;
const buffers = new Map<string, AudioBuffer>();
const inflight = new Map<string, Promise<AudioBuffer | null>>();
let currentVoice: AudioBufferSourceNode | null = null;

const url = (rel: string) => `${import.meta.env.BASE_URL}audio/${rel}`;

const loadBuffer = (rel: string): Promise<AudioBuffer | null> => {
  const hit = buffers.get(rel);
  if (hit) return Promise.resolve(hit);
  let p = inflight.get(rel);
  if (!p) {
    p = (async () => {
      try {
        const a = ac();
        if (!a) return null;
        const res = await fetch(url(rel));
        if (!res.ok) return null;
        const buf = await a.decodeAudioData(await res.arrayBuffer());
        buffers.set(rel, buf);
        return buf;
      } catch {
        return null;
      }
    })();
    inflight.set(rel, p);
  }
  return p;
};

/**
 * Fetch an accent's manifest and decode every phoneme clip up front so touch-to-sound stays fast.
 * Calling it again with another accent swaps the whole pack (buffers are keyed by file path, so nothing clashes).
 */
export const initAudio = async (accent: string): Promise<void> => {
  try {
    const res = await fetch(url(`${accent}/manifest.json`));
    if (!res.ok) {
      manifest = null; // tone/speech fallback
      return;
    }
    const m = (await res.json()) as Manifest;
    await Promise.all(Object.values(m.phonemes).flat().map(loadBuffer));
    manifest = m;
  } catch {
    manifest = null;
  }
};
export const audioSource = (phoneme: string): string => manifest?.sources?.[phoneme] ?? 'tone (no clip)';
export const hasWord = (w: string): boolean => !!manifest?.words[w.toLowerCase()];

export const unlockAudio = (): void => {
  void ac()?.resume();
  startMusic();
};
export const setMuted = (m: boolean): void => {
  muted = m;
  if (m) {
    window.speechSynthesis?.cancel();
    currentVoice?.stop();
  }
};


const play = (buf: AudioBuffer, gain = 1, exclusive = false): Promise<void> =>
  new Promise((resolve) => {
    const a = ac();
    if (!a || muted || !master) return resolve();
    if (exclusive) {
      try { currentVoice?.stop(); } catch { /* already stopped */ }
    }
    const src = a.createBufferSource();
    const g = a.createGain();
    g.gain.value = gain;
    src.buffer = buf;
    src.connect(g).connect(master);
    src.onended = () => resolve();
    if (exclusive) currentVoice = src;
    duck(buf.duration * 1000 + 250); // music steps back while anyone is speaking
    src.start();
  });

// ---------------------------------------------------------------------------------------------------------------
// Sound effects: synthesised, soft and rounded (these are UI sounds, not phonics content). Pentatonic so that any
// combination of them stays pleasant. Nobody has listened to these yet.
// ---------------------------------------------------------------------------------------------------------------
const PENTA = [0, 2, 4, 7, 9]; // major pentatonic, semitones
const hz = (base: number, semis: number): number => base * Math.pow(2, semis / 12);

interface Voice { f: number; t: number; dur: number; type?: OscillatorType; gain?: number; attack?: number; partials?: [number, number][]; vibrato?: number; glideTo?: number }
/** A single bell/pluck-like note: soft attack, exponential decay, optional upper partials for a "glassy" tone. */
const note = (v: Voice): void => {
  const a = ac();
  if (!a || muted || !sfxBus) return;
  const t0 = a.currentTime + v.t;
  const partials: [number, number][] = [[1, 1], ...(v.partials ?? [])];
  for (const [mult, amp] of partials) {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = v.type ?? 'sine';
    o.frequency.setValueAtTime(v.f * mult, t0);
    if (v.glideTo) o.frequency.exponentialRampToValueAtTime(v.glideTo * mult, t0 + v.dur);
    if (v.vibrato) {
      const lfo = a.createOscillator();
      const lg = a.createGain();
      lfo.frequency.value = 9;
      lg.gain.value = v.vibrato * mult;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(t0);
      lfo.stop(t0 + v.dur + 0.1);
    }
    const peak = (v.gain ?? 0.15) * amp;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + (v.attack ?? 0.012));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + v.dur);
    o.connect(g).connect(sfxBus);
    o.start(t0);
    o.stop(t0 + v.dur + 0.08);
  }
};
/** Shaped noise: a burst through a band-pass that can sweep (whooshes, scrapes, sizzle, wood knocks). */
const hiss = (o: { t?: number; dur: number; gain?: number; from: number; to?: number; q?: number; type?: BiquadFilterType }): void => {
  const a = ac();
  if (!a || muted || !sfxBus) return;
  const t0 = a.currentTime + (o.t ?? 0);
  const n = Math.max(1, Math.floor(a.sampleRate * o.dur));
  const buf = a.createBuffer(1, n, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  const f = a.createBiquadFilter();
  const g = a.createGain();
  f.type = o.type ?? 'bandpass';
  f.Q.value = o.q ?? 1.2;
  f.frequency.setValueAtTime(o.from, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + o.dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.1, t0 + Math.min(0.02, o.dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  src.buffer = buf;
  src.connect(f).connect(g).connect(sfxBus);
  src.start(t0);
};

const GLASS: [number, number][] = [[2.01, 0.35], [3.02, 0.14], [4.2, 0.06]];

// correct answers climb a pentatonic scale; a miss quietly resets (deterministic, never random: spec bans variable rewards)
let streak = 0;
export const resetStreak = (): void => { streak = 0; };

export const tap = (): void => note({ f: 880, t: 0, dur: 0.07, gain: 0.07, attack: 0.004 });
export const soft = (): void => {
  // a gentle, rounded "boop-boop" (never a buzzer)
  note({ f: 392, t: 0, dur: 0.16, gain: 0.1, glideTo: 330 });
  note({ f: 330, t: 0.13, dur: 0.22, gain: 0.08, glideTo: 262 });
  resetStreak();
};
export const praise = (): void => {
  const base = hz(523.25, PENTA[Math.min(streak, PENTA.length - 1)] as number);
  // a three-note bell arpeggio (root, third, fifth) that gets higher the longer the run
  [1, 1.26, 1.5].forEach((m, i) => note({ f: base * m, t: i * 0.085, dur: 0.55 - i * 0.04, gain: 0.13, type: 'sine', partials: GLASS }));
  if (streak >= 2) note({ f: base * 2, t: 0.3, dur: 0.5, gain: 0.07, partials: GLASS }); // a little extra sparkle on a run
  streak = Math.min(streak + 1, 8);
};

export const sfx = {
  pop: () => { note({ f: 420, t: 0, dur: 0.1, gain: 0.13, glideTo: 880, attack: 0.004 }); hiss({ dur: 0.04, gain: 0.04, from: 2500, q: 0.6 }); },
  whoosh: () => hiss({ dur: 0.4, gain: 0.08, from: 400, to: 3200, q: 0.9 }),
  thud: () => {
    // a wooden plank knock: low body + a short woody click
    note({ f: 170, t: 0, dur: 0.16, gain: 0.2, glideTo: 90, attack: 0.003 });
    hiss({ dur: 0.05, gain: 0.1, from: 900, q: 2.5 });
  },
  chomp: () => {
    // "nom nom": two soft chews then a happy gulp
    hiss({ dur: 0.07, gain: 0.12, from: 500, q: 1.5 });
    note({ f: 200, t: 0, dur: 0.09, gain: 0.12, glideTo: 120 });
    hiss({ t: 0.11, dur: 0.07, gain: 0.12, from: 600, q: 1.5 });
    note({ f: 220, t: 0.11, dur: 0.09, gain: 0.12, glideTo: 130 });
    note({ f: 300, t: 0.26, dur: 0.14, gain: 0.12, glideTo: 150 });
  },
  boing: () => note({ f: 200, t: 0, dur: 0.3, gain: 0.14, glideTo: 560, vibrato: 14 }),
  sparkle: () => [0, 2, 4, 7, 9, 12].forEach((st, i) => note({ f: hz(1046.5, st), t: i * 0.055, dur: 0.35, gain: 0.07, partials: GLASS })),
  step: () => { note({ f: 300 + (Math.random() > 0.5 ? 40 : 0), t: 0, dur: 0.06, gain: 0.07, attack: 0.003 }); },
  launch: () => {
    hiss({ dur: 1.3, gain: 0.12, from: 250, to: 2600, q: 0.7 });
    note({ f: 110, t: 0, dur: 1.3, gain: 0.07, type: 'sawtooth', glideTo: 420 });
    [0, 2, 4, 7, 9, 12].forEach((st, i) => note({ f: hz(784, st), t: 0.5 + i * 0.1, dur: 0.4, gain: 0.06, partials: GLASS }));
  },
  chest: () => {
    // a little creak, then a rising harp-like run
    note({ f: 140, t: 0, dur: 0.3, gain: 0.07, type: 'sawtooth', glideTo: 230, vibrato: 6 });
    [0, 2, 4, 7, 9, 12, 14].forEach((st, i) => note({ f: hz(523.25, st), t: 0.28 + i * 0.07, dur: 0.6, gain: 0.1, partials: GLASS }));
  },
  drum: () => {
    note({ f: 150, t: 0, dur: 0.22, gain: 0.3, glideTo: 55, attack: 0.002 });
    hiss({ dur: 0.1, gain: 0.07, from: 1800, q: 0.7 });
  },
  ding: () => note({ f: 1318.5, t: 0, dur: 0.6, gain: 0.12, partials: GLASS }),
  scratch: () => hiss({ dur: 0.18, gain: 0.05, from: 1500, to: 3500, q: 0.8 }),
  sizzle: () => hiss({ dur: 0.6, gain: 0.06, from: 5000, q: 0.5, type: 'highpass' }),
  chop: () => { hiss({ dur: 0.05, gain: 0.1, from: 1200, q: 2 }); note({ f: 220, t: 0, dur: 0.07, gain: 0.08, glideTo: 120 }); },
  tick: () => note({ f: 1500, t: 0, dur: 0.04, gain: 0.05, attack: 0.002 }),
  hatch: () => { sfx.boing(); setTimeout(() => sfx.sparkle(), 220); },
};

/** Play an isolated sound (a phoneme key such as "s", "k", "a"). */
export const blip = (phoneme: string): void => {
  const files = manifest?.phonemes[phoneme];
  const buf = files ? buffers.get(files[Math.floor(Math.random() * files.length)] as string) : undefined;
  if (buf) void play(buf, 1.0);
  else {
    // fallback tone: one steady pitch per sound
    let hash = 0;
    for (const ch of phoneme) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    note({ f: hz(261.6, [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26][hash % 12] as number), t: 0, dur: 0.32, gain: 0.2, type: 'triangle' });
    duck(500);
  }
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

// ---------------------------------------------------------------------------------------------------------------
// Music: calm, melodic, quiet; its own on/off; ducks under speech; slows into a lullaby when the island sleeps.
// A fixed pattern over I - vi - IV - V in C major pentatonic (no randomness), scheduled a beat ahead.
// ---------------------------------------------------------------------------------------------------------------
const CHORDS: number[][] = [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]]; // semitones from C: C, Am, F, G
const MELODY = [7, 4, 9, 7, 12, 9, 7, 4, 9, 12, 7, 9, 4, 7, 2, 4]; // pentatonic-ish, 16 steps per 4 bars
let musicTimer: number | null = null;
let beat = 0;
let nextTime = 0;

const musicNote = (f: number, t: number, dur: number, gain: number, type: OscillatorType = 'sine'): void => {
  const a = ac();
  if (!a || !musicBus) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + Math.min(0.25, dur * 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(musicBus);
  o.start(t);
  o.stop(t + dur + 0.05);
};

const scheduleMusic = (): void => {
  const a = ac();
  if (!a || !musicOn || muted) return;
  const bpm = night ? 52 : 76;
  const spb = 60 / bpm;
  if (nextTime < a.currentTime) nextTime = a.currentTime + 0.05;
  while (nextTime < a.currentTime + 0.6) {
    const bar = Math.floor(beat / 4) % CHORDS.length;
    const chord = CHORDS[bar] as number[];
    const inBar = beat % 4;
    const root = night ? 130.8 : 261.6; // lower and softer at night
    if (inBar === 0) chord.forEach((st) => musicNote(hz(root / 2, st), nextTime, spb * 4.2, night ? 0.05 : 0.04, 'sine')); // pad
    const m = MELODY[beat % MELODY.length] as number;
    if (!night || inBar % 2 === 0) musicNote(hz(root * 2, m - 12), nextTime, spb * (night ? 1.6 : 1.1), night ? 0.03 : 0.035, 'triangle');
    nextTime += spb;
    beat++;
  }
};
export const startMusic = (): void => {
  if (musicTimer !== null || !ac()) return;
  musicTimer = window.setInterval(scheduleMusic, 150);
  scheduleMusic();
};
export const setMusicOn = (on: boolean): void => {
  musicOn = on;
  if (musicBus && ctx) musicBus.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 0.3);
  if (on) startMusic();
};
export const setNightMusic = (n: boolean): void => {
  night = n;
};
let duckTimer: number | null = null;
/** Music steps back while a voice or sound plays, then eases back up. */
export const duck = (ms: number): void => {
  if (!ctx || !musicBus || !musicOn) return;
  musicBus.gain.cancelScheduledValues(ctx.currentTime);
  musicBus.gain.setTargetAtTime(0.1, ctx.currentTime, 0.05);
  if (duckTimer !== null) clearTimeout(duckTimer);
  duckTimer = window.setTimeout(() => {
    if (ctx && musicBus && musicOn) musicBus.gain.setTargetAtTime(0.5, ctx.currentTime, 0.4);
  }, ms);
};

const browserSpeech = (text: string): void => {
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

/** Say a word, or a short list ("cat, hat"). Uses a generated clip when one exists, browser speech otherwise. */
export const speak = (text: string): void => {
  const parts = text.split(/,\s*/);
  const clips = parts.map((p) => manifest?.words[p.toLowerCase()]);
  if (clips.every(Boolean)) {
    void (async () => {
      for (const rel of clips as string[]) {
        const buf = await loadBuffer(rel);
        if (!buf) return browserSpeech(text);
        await play(buf, 1.0, true);
        await new Promise((r) => setTimeout(r, 120));
      }
    })();
  } else browserSpeech(text);
};

/** A fixed phrase from the manifest (e.g. "play", "two_minutes"). */
export const sayPhrase = (key: string, fallbackText: string): void => {
  const rel = manifest?.phrases[key];
  if (!rel) return browserSpeech(fallbackText);
  void loadBuffer(rel).then((buf) => (buf ? play(buf, 1.0, true) : browserSpeech(fallbackText)));
};
