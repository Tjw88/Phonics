// Themed particles: what comes out of a celebration depends on the WORLD (document.body.dataset.pack).
//   dino: leaves and dust | dragon: sparkles and tiny flames | transport: stars and steam puffs
//   space: twinkles and little orbit rings | ocean: bubbles | farm: hay, petals and feathers
// Web Animations API only (transform + opacity), no randomness anywhere: the scatter comes from a fixed hash of the particle index, so the
// same call always draws the same picture (the owner forbids variable rewards). Nothing at all is drawn under Reduce Motion.
// Particles live in their own fixed layer (#fxp) and remove themselves; `clearParticles()` removes whatever is still in flight.
import { h, reducedMotion } from './dom';

/** The six STYLE FAMILIES that have a full set of hand-made reactions, vehicles and props. Every other world (jungle, robot, pirate, fairy, music, arctic,
 *  and any pack added later) maps to the nearest family through FAMILY, and can override single entries (particles, props, skins) by its own id. */
export type PackId = 'dino' | 'dragon' | 'transport' | 'space' | 'ocean' | 'farm';
export const PACK_IDS: PackId[] = ['dino', 'dragon', 'transport', 'space', 'ocean', 'farm'];
const FAMILY: Record<string, PackId> = { jungle: 'dino', robot: 'space', pirate: 'ocean', fairy: 'dragon', music: 'farm', arctic: 'transport' };
/** The style family of any world id (an unknown id gets the neutral default, 'dino'). Never throws. */
export const familyOf = (id: string | null | undefined): PackId => (id && (PACK_IDS as string[]).includes(id) ? (id as PackId) : (id && FAMILY[id]) || 'dino');
/** The raw world id on screen (e.g. 'jungle'), for the few tables that have their own entry for a newer world. */
export const rawPack = (): string => document.body.dataset.pack || 'dino';
/** Look an entry up by the world's own id, then by its family, then the neutral default: a data-driven table with overrides and a default. */
export const pick = <T>(table: Partial<Record<string, T>>, id: string, fallback: T): T => table[id] ?? table[familyOf(id)] ?? fallback;
/** The style family of the world the app is showing right now (what the six-family tables are keyed by). */
export const currentPack = (): PackId => familyOf(document.body.dataset.pack);

/** 1 = small (a first success), 2 = ordinary, 3 = finale. */
export type Level = 1 | 2 | 3;

/** Fixed pseudo-random numbers in [0,1): a hash of (i, k). Deterministic, so a reaction never differs between two plays. */
export const hash = (i: number, k = 0): number => {
  const x = Math.sin(i * 127.1 + k * 311.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};

type Kind = 'note' | 'snow' | 'leaf' | 'dust' | 'spark' | 'flame' | 'star' | 'steam' | 'twinkle' | 'ring' | 'bubble' | 'hay' | 'petal' | 'feather';

const STAR4 = 'M0 -11 Q1.6 -1.6 11 0 Q1.6 1.6 0 11 Q-1.6 1.6 -11 0 Q-1.6 -1.6 0 -11Z';
const STAR5 = 'M0 -11 L3.2 -3.4 L11 -3.4 L4.8 1.6 L7 10 L0 5.2 L-7 10 L-4.8 1.6 L-11 -3.4 L-3.2 -3.4Z';
const svg = (inner: string, size = 24): string => `<svg viewBox="-12 -12 24 24" width="${Math.round(size * 1.35)}" height="${Math.round(size * 1.35)}">${inner}</svg>`;

const COLOURS: Record<Kind, string[]> = {
  note: ['#7b4fd1', '#ef476f', '#2f9bd6', '#e8a010'],
  snow: ['#ffffff', '#e6f4ff'],
  leaf: ['#5cb85c', '#8ee27a', '#3f9e4d', '#b5e46a'],
  dust: ['#d9c294', '#cdb280'],
  spark: ['#ffc233', '#ff7eb6', '#a98bff', '#ffd966'],
  flame: ['#ff9f43', '#ff7a3d'],
  star: ['#ffc233', '#ff9f43', '#ffd966', '#3ec6e8'],
  steam: ['#e9f0f7'],
  twinkle: ['#ffc233', '#3ec6e8', '#a98bff', '#ff7eb6'],
  ring: ['#3ec6e8', '#a98bff', '#ff7eb6'],
  bubble: ['#7fd8f5', '#5cc8ee', '#a9e6fa'],
  hay: ['#e8b84a', '#f1cd70', '#d9a53a'],
  petal: ['#ff8fb8', '#ffb3d1', '#ffd0e2'],
  feather: ['#fff3c4', '#ffffff', '#ffe08a'],
};

const shape = (kind: Kind, i: number): string => {
  const c = COLOURS[kind][i % COLOURS[kind].length] as string;
  switch (kind) {
    case 'note': return svg(`<ellipse cx="-3" cy="6" rx="4.6" ry="3.4" fill="${c}" transform="rotate(-20 -3 6)"/><path d="M1 5 L1 -9 Q8 -7 8 -1" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`, 24);
    case 'snow': return svg(`<circle r="6.5" fill="${c}" stroke="#a9cde8" stroke-width="1.6"/>`, 22);
    case 'leaf': return svg(`<path d="M0 -11 C9 -8 9 6 0 12 C-9 6 -9 -8 0 -11Z" fill="${c}"/><path d="M0 -8 L0 9" stroke="#2f7d3a" stroke-width="1.6" opacity=".55"/>`);
    case 'dust': return svg(`<circle r="9" fill="${c}" opacity=".85"/>`, 26);
    case 'spark': return svg(`<path d="${STAR4}" fill="${c}" stroke="#0000001f" stroke-width="1"/>`, 26);
    case 'flame': return svg(`<path d="M0 -11 C7 -3 8 4 0 10 C-8 4 -7 -3 0 -11Z" fill="${c}"/><path d="M0 -3 C3 1 3 5 0 8 C-3 5 -3 1 0 -3Z" fill="#ffe27a"/>`, 20);
    case 'star': return svg(`<path d="${STAR5}" fill="${c}" stroke="#0000001f" stroke-width="1"/>`, 22);
    case 'steam': return svg(`<circle r="9" fill="${c}" stroke="#c4d3e4" stroke-width="1.5" opacity=".95"/>`, 28);
    case 'twinkle': return svg(`<path d="${STAR4}" fill="${c}" stroke="#0000001f" stroke-width="1"/><circle r="2.2" fill="#fff"/>`, 24);
    case 'ring': return svg(`<ellipse rx="10" ry="4.5" fill="none" stroke="${c}" stroke-width="2.8" transform="rotate(-18)"/>`, 36);
    case 'bubble': return svg(`<circle r="9.5" fill="${c}" fill-opacity=".4" stroke="#4fb3d9" stroke-width="1.6"/><path d="M-5 -3 A6 6 0 0 1 -1 -7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`, 26);
    case 'hay': return svg(`<path d="M-10 2 Q0 -6 10 -2" stroke="${c}" stroke-width="3.6" stroke-linecap="round" fill="none"/>`, 24);
    case 'petal': return svg(`<ellipse rx="5.5" ry="9" fill="${c}"/>`, 22);
    case 'feather': return svg(`<path d="M0 -12 C8 -6 8 6 0 12 C-8 6 -8 -6 0 -12Z" fill="${c}" stroke="#e6d28a" stroke-width="1"/><path d="M0 -10 L0 12" stroke="#e6d28a" stroke-width="1.2"/>`, 22);
  }
};

/** How each kind moves. g = gravity px/s^2 (negative = buoyant), sway = side-to-side flutter, grow = scale at the end. */
interface Motion { dur: number; speed: [number, number]; g: number; sway: number; spin: number; grow: number; fadeFrom: number; mode?: 'fan' | 'rise' | 'twinkle' | 'ring' | 'puff' }
const MOTION: Record<Kind, Motion> = {
  note: { dur: 1400, speed: [90, 170], g: -60, sway: 26, spin: 40, grow: 1.1, fadeFrom: 0.7, mode: 'rise' },
  snow: { dur: 1700, speed: [90, 190], g: 120, sway: 30, spin: 60, grow: 0.9, fadeFrom: 0.75 },
  leaf: { dur: 1500, speed: [150, 250], g: 240, sway: 22, spin: 220, grow: 0.85, fadeFrom: 0.72 },
  dust: { dur: 700, speed: [60, 120], g: -30, sway: 0, spin: 0, grow: 2.0, fadeFrom: 0.1, mode: 'puff' },
  spark: { dur: 1000, speed: [150, 290], g: 150, sway: 0, spin: 120, grow: 0.3, fadeFrom: 0.55 },
  flame: { dur: 760, speed: [90, 170], g: -180, sway: 8, spin: 0, grow: 0.35, fadeFrom: 0.45 },
  star: { dur: 1100, speed: [220, 380], g: 620, sway: 0, spin: 260, grow: 0.6, fadeFrom: 0.7 },
  steam: { dur: 1150, speed: [20, 60], g: -90, sway: 10, spin: 0, grow: 2.4, fadeFrom: 0.15, mode: 'rise' },
  twinkle: { dur: 1000, speed: [0, 0], g: 0, sway: 0, spin: 90, grow: 1, fadeFrom: 0.6, mode: 'twinkle' },
  ring: { dur: 950, speed: [0, 0], g: 0, sway: 0, spin: 0, grow: 3, fadeFrom: 0.1, mode: 'ring' },
  bubble: { dur: 1500, speed: [30, 90], g: -160, sway: 14, spin: 0, grow: 1.25, fadeFrom: 0.78, mode: 'rise' },
  hay: { dur: 1300, speed: [170, 300], g: 330, sway: 10, spin: 300, grow: 0.8, fadeFrom: 0.7 },
  petal: { dur: 1600, speed: [110, 200], g: 150, sway: 30, spin: 200, grow: 0.9, fadeFrom: 0.72 },
  feather: { dur: 1800, speed: [100, 190], g: 110, sway: 34, spin: 120, grow: 0.9, fadeFrom: 0.75 },
};

/** What each world throws, as a repeating mix of kinds. */
const MIX: Record<PackId, Kind[]> = {
  dino: ['leaf', 'leaf', 'dust', 'leaf', 'leaf', 'dust'],
  dragon: ['spark', 'spark', 'flame', 'spark', 'spark', 'flame'],
  transport: ['star', 'steam', 'star', 'star', 'steam', 'star'],
  space: ['twinkle', 'twinkle', 'ring', 'twinkle', 'twinkle', 'twinkle'],
  ocean: ['bubble', 'bubble', 'bubble', 'bubble', 'bubble', 'bubble'],
  farm: ['hay', 'petal', 'feather', 'hay', 'petal', 'feather'],
};
/** Worlds with their own particle mix (the rest use their family's). */
const MIX_OWN: Partial<Record<string, Kind[]>> = {
  jungle: ['leaf', 'petal', 'leaf', 'feather', 'leaf', 'petal'],
  robot: ['spark', 'ring', 'star', 'twinkle', 'spark', 'star'],
  pirate: ['bubble', 'star', 'bubble', 'bubble', 'star', 'bubble'],
  fairy: ['spark', 'petal', 'twinkle', 'spark', 'petal', 'spark'],
  music: ['note', 'note', 'star', 'note', 'ring', 'note'],
  arctic: ['snow', 'snow', 'twinkle', 'snow', 'bubble', 'snow'],
};
const mixOf = (id: string): Kind[] => MIX_OWN[id] ?? MIX[familyOf(id)] ?? MIX.dino;
const COUNT: Record<Level, number> = { 1: 8, 2: 14, 3: 26 };

let host: HTMLElement | null = null;
const layer = (): HTMLElement => {
  if (!host || !host.isConnected) {
    host = h('div', { id: 'fxp', 'aria-hidden': 'true' });
    document.body.append(host);
  }
  return host;
};
/** Remove every particle still in flight (a scene went away). */
export const clearParticles = (): void => { host?.replaceChildren(); };

const originOf = (o: Element | { x: number; y: number }): { x: number; y: number } => {
  if ('getBoundingClientRect' in o) {
    const r = o.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return o;
};

/** Fire one particle of `kind` from (x, y). `ang` is the launch direction in radians (up = -PI/2). */
const fire = (kind: Kind, i: number, x: number, y: number, ang: number, delay: number, scale = 1): void => {
  const m = MOTION[kind];
  const p = h('span', { class: `tp tp-${kind}`, style: `left:${x}px;top:${y}px` });
  p.innerHTML = shape(kind, i);
  layer().append(p);
  const sp = (m.speed[0] + hash(i, 1) * (m.speed[1] - m.speed[0])) * scale;
  const vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp;
  const spin = (hash(i, 2) - 0.5) * 2 * m.spin;
  const phase = hash(i, 3) * 6.28;
  const dur = m.dur;
  const N = 12;
  const frames: Keyframe[] = [];
  for (let k = 0; k <= N; k++) {
    const f = k / N, t = f * (dur / 1000);
    let tx = vx * t + Math.sin(t * 6 + phase) * m.sway;
    let ty = vy * t + 0.5 * m.g * t * t;
    let sc = 1;
    let rot = spin * t;
    let op = f < m.fadeFrom ? 1 : 1 - (f - m.fadeFrom) / (1 - m.fadeFrom);
    if (m.mode === 'twinkle') {
      const r = 44 + hash(i, 4) * 80 * scale; // scattered around the origin, then still
      tx = Math.cos(ang) * r * Math.min(1, f * 2.2);
      ty = Math.sin(ang) * r * Math.min(1, f * 2.2) - f * 10;
      sc = Math.sin(Math.min(1, f * 1.15) * Math.PI) * 1.15;
      op = f < 0.7 ? 1 : 1 - (f - 0.7) / 0.3;
    } else if (m.mode === 'ring') {
      tx = 0; ty = -f * 14; sc = 0.2 + f * (m.grow - 0.2); op = 0.95 * (1 - f * f); rot = 0;
    } else if (m.mode === 'puff') {
      sc = 0.4 + f * (m.grow - 0.4); op = 0.8 * (1 - f);
    } else if (m.mode === 'rise') {
      sc = 0.5 + f * (m.grow - 0.5);
    } else {
      sc = 1 - f * (1 - m.grow);
    }
    frames.push({ transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(0)}deg) scale(${Math.max(0.01, sc).toFixed(3)})`, opacity: Math.max(0, op), offset: f });
  }
  const a = p.animate(frames, { duration: dur, easing: 'linear', delay, fill: 'both' });
  a.onfinish = () => p.remove();
  a.oncancel = () => p.remove();
};

export interface EmitOptions {
  /** size of the burst (default 2) */
  level?: Level;
  /** 0..2: rotates the direction and the mix so consecutive bursts do not look the same */
  variant?: number;
  /** override the world (a particle test) */
  pack?: PackId;
  /** scatter more widely sideways, as a wide fan (a finale) */
  wide?: boolean;
}

/** A burst of the world's particles from an element or a point. Nothing under Reduce Motion. */
export const emit = (from: Element | { x: number; y: number }, o: EmitOptions = {}): void => {
  if (reducedMotion()) return;
  const level = o.level ?? 2;
  const v = (o.variant ?? 0) % 3;
  const { x, y } = originOf(from);
  const mix = mixOf(o.pack ?? rawPack());
  const n = COUNT[level];
  // a fan: variant 0 straight up, variant 1 leans left, variant 2 leans right (a little), always mostly upward
  const lean = (v - 1) * 0.35;
  const spread = o.wide ? Math.PI * 1.1 : Math.PI * (level === 1 ? 0.8 : 1.05);
  for (let i = 0; i < n; i++) {
    const kind = mix[(i + v) % mix.length] as Kind;
    const ang = -Math.PI / 2 + lean + (hash(i, 5 + v) - 0.5) * spread;
    // a dust puff starts at the feet and goes sideways; a ring/steam/bubble starts right at the origin
    const a2 = kind === 'dust' ? (i % 2 ? 0.2 : Math.PI - 0.2) : kind === 'twinkle' ? hash(i, 6) * 6.283 : ang;
    fire(kind, i + v * 7, x + (hash(i, 7) - 0.5) * 18, y, a2, hash(i, 8) * 110, level === 3 ? 1.15 : 1);
  }
};

/** A soft shower across the whole screen (the finale of a block, or the day). Leaves/hay/petals fall, bubbles and steam rise, twinkles blink. */
export const showerAcross = (o: { pack?: PackId; n?: number } = {}): void => {
  if (reducedMotion()) return;
  const id = o.pack ?? rawPack();
  const n = o.n ?? 16;
  const W = window.innerWidth, H = window.innerHeight;
  const fam = familyOf(id);
  const rising = (fam === 'ocean' || fam === 'transport' || fam === 'dragon' || id === 'music') && id !== 'arctic'; // snow falls
  for (let i = 0; i < n; i++) {
    const mix = mixOf(id);
    let kind = mix[i % mix.length] as Kind;
    if (kind === 'dust') kind = 'leaf';
    if (kind === 'ring') kind = 'twinkle';
    const x = ((i + 0.5) / n) * W + (hash(i, 9) - 0.5) * 40;
    const y = rising ? H * (0.78 + hash(i, 10) * 0.2) : H * (0.05 + hash(i, 10) * 0.15);
    const ang = rising ? -Math.PI / 2 : Math.PI / 2;
    if (kind === 'twinkle') fire(kind, i, x, H * (0.12 + hash(i, 11) * 0.6), hash(i, 12) * 6.283, hash(i, 13) * 500, 0.9);
    else fire(kind, i, x, y, ang + (hash(i, 14) - 0.5) * 0.6, hash(i, 13) * 500, kind === 'bubble' || kind === 'steam' || kind === 'note' ? 1 : 0.5);
  }
};

/** Dust puffs at an element's feet (a stomp or a landing). Only worlds with a ground feel call this. */
export const puffAt = (el: Element, n = 4): void => {
  if (reducedMotion()) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) fire('dust', i, r.left + r.width / 2 + (i % 2 ? 1 : -1) * (14 + i * 5), r.bottom - 6, i % 2 ? 0.15 : Math.PI - 0.15, i * 30);
};

/** Particles of one named kind (used by the reaction library for a small, specific effect: a flame puff, a steam toot, a ring). */
export const emitKind = (from: Element | { x: number; y: number }, kind: Kind, n = 3, o: { scale?: number } = {}): void => {
  if (reducedMotion()) return;
  const { x, y } = originOf(from);
  for (let i = 0; i < n; i++) fire(kind, i + 31, x + (i - (n - 1) / 2) * 8, y, -Math.PI / 2 + (i - (n - 1) / 2) * 0.35, i * 70, o.scale ?? 1);
};
export type { Kind as ParticleKind };
