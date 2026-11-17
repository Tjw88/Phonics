// The creature's reaction library: HOW each world's companion takes a letter, cheers, says "oh" and dances. Signature motion per world:
//   dino stomp-chomps and kicks up dust | dragon gulps with a tiny flame puff | transport scoops (a digger digs) and toots a ring of steam
//   space beams the letter up with a light cone | ocean engulfs it like a jelly and ripples | farm chomps and hops (hay, petals, feathers)
// Applied to the companion element (`.companion` > svg.dino) through the existing mood classes plus Web Animations on the root, `.headg` and
// `.bodyg`. Everything is deterministic (variants are chosen by index, never by chance) and nothing moves under Reduce Motion: the face
// (mood classes) and the sound still say "yes".
import { h, reducedMotion, sleep } from './dom';
import { currentPack, emit, emitKind, puffAt, showerAcross, type Level, type PackId } from './particles';
import { findCreature } from './themes';

// ---- face: mood and eyes (moved here from games.ts, which re-exports them) --------------------------------------------------
export type Mood = 'idle' | 'happy' | 'open' | 'sleepy' | 'oops';
export const setMood = (el: Element, mood: Mood): void => {
  el.querySelector('svg')?.setAttribute('class', `dino mood-${mood}`);
};
/** Point the creature's pupils at a screen position (null = look straight ahead). */
export const lookAt = (el: Element, x: number | null, y: number | null): void => {
  el.querySelectorAll<SVGElement>('.pupil').forEach((p) => {
    p.style.transition = 'transform 0.12s';
    if (x === null || y === null) { p.style.transform = ''; return; }
    const r = p.getBoundingClientRect();
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(4, d / 28);
    p.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`;
  });
};

/** Which world a creature belongs to (by its id, e.g. 'space-zip'); falls back to the world on screen. */
export const packOfCreature = (kind?: string | null): PackId => {
  const id = kind ? findCreature(kind)?.pack.id : undefined;
  return (id as PackId | undefined) ?? currentPack();
};

// ---- WAAPI helpers --------------------------------------------------------------------------------------------------------
interface Parts { root: HTMLElement; head: SVGElement | null; body: SVGElement | null }
const partsOf = (root: HTMLElement): Parts => ({ root, head: root.querySelector<SVGElement>('.headg'), body: root.querySelector<SVGElement>('.bodyg') });
const run = (el: Element | null, kf: Keyframe[], dur: number, easing = 'ease-in-out', delay = 0): Animation | null => {
  if (!el || reducedMotion() || !el.isConnected) return null;
  if (el instanceof HTMLElement && !el.style.transformOrigin) el.style.transformOrigin = '50% 100%';
  return el.animate(kf, { duration: dur, easing, delay, fill: 'none' });
};
const done = (a: Animation | null): Promise<void> => (a ? a.finished.then(() => undefined, () => undefined) : Promise.resolve());

/** While a reaction owns the creature, a second reaction (e.g. celebrate() on the same creature) leaves it alone. */
const busyUntil = new WeakMap<Element, number>();
const isBusy = (el: Element): boolean => (busyUntil.get(el) ?? 0) > performance.now();
const claim = (el: Element, ms: number): void => { busyUntil.set(el, performance.now() + ms); };

// ---- motion primitives on the creature root (origin: its feet) ------------------------------------------------------------------
type Prim = { kf: Keyframe[]; dur: number; dust?: number[] };
const hop = (hh = 34, k = 1): Prim => ({
  dur: 800,
  kf: [
    { transform: 'scale(1,1) translateY(0px)' },
    { transform: `scale(${1 + 0.08 * k},${1 - 0.12 * k}) translateY(${4 * k}px)`, offset: 0.14 },
    { transform: `scale(${1 - 0.06 * k},${1 + 0.1 * k}) translateY(${-hh * k}px)`, offset: 0.42 },
    { transform: `scale(${1 + 0.06 * k},${1 - 0.08 * k}) translateY(0px)`, offset: 0.7 },
    { transform: `scale(${1 - 0.02 * k},${1 + 0.03 * k}) translateY(0px)`, offset: 0.84 },
    { transform: 'scale(1,1) translateY(0px)' },
  ],
});
const wiggle = (k = 1): Prim => ({
  dur: 720,
  kf: [
    { transform: 'rotate(0deg) scale(1)' },
    { transform: `rotate(${-7 * k}deg) scale(${1 + 0.05 * k})`, offset: 0.2 },
    { transform: `rotate(${6 * k}deg) scale(${1 + 0.04 * k})`, offset: 0.45 },
    { transform: `rotate(${-4 * k}deg) scale(1.02)`, offset: 0.7 },
    { transform: 'rotate(0deg) scale(1)' },
  ],
});
// a lively wobble-flip: it swings to either side (never edge-on: a full turn made a thin sliver that read as a flicker, width stayed ~0.33)
const twirl = (k = 1): Prim => ({
  dur: 820,
  kf: [
    { transform: 'perspective(520px) rotateY(0deg) rotateZ(0deg) translateY(0px)' },
    { transform: `perspective(520px) rotateY(32deg) rotateZ(-6deg) translateY(${-26 * k}px)`, offset: 0.35 },
    { transform: `perspective(520px) rotateY(-32deg) rotateZ(6deg) translateY(${-18 * k}px)`, offset: 0.7 },
    { transform: 'perspective(520px) rotateY(0deg) rotateZ(0deg) translateY(0px)' },
  ],
});
const rock = (k = 1): Prim => ({
  dur: 780,
  kf: [
    { transform: 'rotate(0deg) translateX(0px)' },
    { transform: `rotate(${-6 * k}deg) translateX(${-9 * k}px)`, offset: 0.22 },
    { transform: `rotate(${5 * k}deg) translateX(${9 * k}px)`, offset: 0.5 },
    { transform: `rotate(${-3 * k}deg) translateX(${-4 * k}px)`, offset: 0.75 },
    { transform: 'rotate(0deg) translateX(0px)' },
  ],
});
const floatUp = (k = 1): Prim => ({
  dur: 1000,
  kf: [
    { transform: 'translateY(0px) rotate(0deg)' },
    { transform: `translateY(${-30 * k}px) rotate(${-4 * k}deg)`, offset: 0.45 },
    { transform: `translateY(${-22 * k}px) rotate(${3 * k}deg)`, offset: 0.72 },
    { transform: 'translateY(0px) rotate(0deg)' },
  ],
});
const jelly = (k = 1): Prim => ({
  dur: 860,
  kf: [
    { transform: 'scale(1,1) translateY(0px)' },
    { transform: `scale(${1 + 0.12 * k},${1 - 0.1 * k}) translateY(0px)`, offset: 0.2 },
    { transform: `scale(${1 - 0.08 * k},${1 + 0.1 * k}) translateY(${-8 * k}px)`, offset: 0.45 },
    { transform: `scale(${1 + 0.05 * k},${1 - 0.05 * k}) translateY(0px)`, offset: 0.72 },
    { transform: 'scale(1,1) translateY(0px)' },
  ],
});
const stomp = (k = 1): Prim => ({
  dur: 820,
  dust: [0.38, 0.78],
  kf: [
    { transform: 'translateY(0px) scale(1,1)' },
    { transform: `translateY(${-16 * k}px) scale(0.97,1.05)`, offset: 0.2 },
    { transform: `translateY(0px) scale(${1 + 0.1 * k},${1 - 0.12 * k})`, offset: 0.38 },
    { transform: `translateY(${-8 * k}px) scale(1,1)`, offset: 0.6 },
    { transform: `translateY(0px) scale(${1 + 0.07 * k},${1 - 0.07 * k})`, offset: 0.78 },
    { transform: 'translateY(0px) scale(1,1)' },
  ],
});
const doubleHop = (k = 1): Prim => ({
  dur: 760,
  kf: [
    { transform: 'translateY(0px) scale(1,1)' },
    { transform: `translateY(${-18 * k}px) scale(0.96,1.06)`, offset: 0.22 },
    { transform: `translateY(0px) scale(${1 + 0.06 * k},${1 - 0.08 * k})`, offset: 0.42 },
    { transform: `translateY(${-24 * k}px) scale(0.95,1.07)`, offset: 0.68 },
    { transform: `translateY(0px) scale(${1 + 0.07 * k},${1 - 0.09 * k})`, offset: 0.88 },
    { transform: 'translateY(0px) scale(1,1)' },
  ],
});

/** The three "I'm happy" moves of each world; the variant is picked by index so no two in a row are the same. */
const HAPPY: Record<PackId, ((k: number) => Prim)[]> = {
  dino: [(k) => stomp(k * 1.4), (k) => hop(40, k), (k) => wiggle(k * 1.6)],
  dragon: [(k) => hop(36, k), twirl, wiggle],
  transport: [rock, twirl, (k) => hop(28, k)],
  space: [floatUp, twirl, (k) => hop(52, k)],
  ocean: [(k) => jelly(k * 1.6), floatUp, twirl],
  farm: [(k) => hop(30, k), wiggle, doubleHop],
};
const LEVEL_K: Record<Level, number> = { 1: 0.65, 2: 1, 3: 1.3 };

/** Run the world's happy move number `variant` on the creature; dust puffs on landings for the heavy movers. Returns its length in ms. */
const happyMove = (root: HTMLElement, pack: PackId, variant: number, level: Level, speed = 1): number => {
  const prim = (HAPPY[pack][variant % 3] as (k: number) => Prim)(LEVEL_K[level]);
  const dur = prim.dur * speed;
  run(root, prim.kf, dur, 'cubic-bezier(0.3, 0.7, 0.4, 1)');
  if (pack === 'dino' && prim.dust) for (const f of prim.dust) setTimeout(() => puffAt(root, 3), f * dur);
  return dur;
};

/** Variants 1 and 2 also change the body's rhythm WHILE chewing (variant 0: steady; 1: a sway from side to side; 2: little bounces), so three rounds
 *  in a row differ in the creature's body, not only in the particles. Applied to the body group (the root for the dino, whose body group is used). */
const chewRhythm = (parts: Parts, pack: PackId, variant: number, dur: number): void => {
  const tgt = pack === 'dino' ? parts.root : parts.body;
  if (variant === 1) run(tgt, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg)', offset: 0.25 }, { transform: 'rotate(6deg)', offset: 0.75 }, { transform: 'rotate(0deg)' }], dur);
  else if (variant === 2) run(tgt, [{ transform: 'translateY(0px)' }, { transform: 'translateY(-9px)', offset: 0.17 }, { transform: 'translateY(0px)', offset: 0.33 }, { transform: 'translateY(-9px)', offset: 0.5 }, { transform: 'translateY(0px)', offset: 0.67 }, { transform: 'translateY(-9px)', offset: 0.83 }, { transform: 'translateY(0px)' }], dur);
};

// ---- the letter's flight into the mouth, shaped by the world ------------------------------------------------------------------
const T = (x: number, y: number, s: number, r: number): string => `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s}) rotate(${r}deg)`;
const mix = (a: number, b: number, f: number): number => a + (b - a) * f;
interface Flight { kf: Keyframe[]; dur: number; easing: string }
const flightRaw = (pack: PackId, start: string, cur: { x: number; y: number }, end: { x: number; y: number }, short: boolean): Flight => {
  const s = short ? 0.85 : 1;
  const M = (f: number, dy = 0) => ({ x: mix(cur.x, end.x, f), y: mix(cur.y, end.y, f) + dy });
  switch (pack) {
    case 'dino': { // a stompy lob: up and over, in
      const m = M(0.5, -64);
      return { dur: 440 * s, easing: 'ease-in-out', kf: [{ transform: start }, { transform: T(m.x, m.y, 0.7, -10), offset: 0.5 }, { transform: T(end.x, end.y, 0.18, 20) }] };
    }
    case 'dragon': { // a quick gulp: a tiny lift, then straight down the throat
      const m = M(0.2, -14);
      return { dur: 360 * s, easing: 'cubic-bezier(0.5, 0, 0.9, 0.5)', kf: [{ transform: start }, { transform: T(m.x, m.y, 0.8, -8), offset: 0.22 }, { transform: T(end.x, end.y, 0.15, 14) }] };
    }
    case 'transport': { // a scoop: the letter dips low, then is swung up and in
      const d = M(0.12, 30), u = M(0.62, -44);
      return { dur: 500 * s, easing: 'ease-in-out', kf: [{ transform: start }, { transform: T(d.x, d.y, 0.85, -14), offset: 0.28 }, { transform: T(u.x, u.y, 0.6, 12), offset: 0.7 }, { transform: T(end.x, end.y, 0.18, 0) }] };
    }
    case 'space': { // beamed: it lifts, hovers with a little wobble, then slides along the beam, shimmering
      const l = M(0, -22), w = M(0.1, -26), q = M(0.55, -10);
      return {
        dur: 600 * s, easing: 'ease-in-out',
        kf: [
          { transform: start, opacity: 1 }, { transform: T(l.x, l.y, 0.8, 0), opacity: 0.85, offset: 0.25 }, { transform: T(w.x + 8, w.y, 0.8, 8), opacity: 1, offset: 0.4 },
          { transform: T(q.x, q.y, 0.5, -6), opacity: 0.6, offset: 0.7 }, { transform: T(end.x, end.y, 0.12, 0), opacity: 0.3 },
        ],
      };
    }
    case 'ocean': { // engulfed: slow, soft, wobbling as it is drawn in
      const a = M(0.5, -8);
      return { dur: 560 * s, easing: 'ease-in-out', kf: [{ transform: start, opacity: 1 }, { transform: T(a.x, a.y, 0.62, 6), opacity: 0.9, offset: 0.55 }, { transform: T(end.x, end.y, 0.22, -4), opacity: 0.5 }] };
    }
    default: { // farm: two little hops to the mouth
      const a = M(0.5, -46), b = M(0.8, -10);
      return { dur: 420 * s, easing: 'ease-out', kf: [{ transform: start }, { transform: T(a.x, a.y, 0.7, -10), offset: 0.45 }, { transform: T(b.x, b.y, 0.4, 6), offset: 0.75 }, { transform: T(end.x, end.y, 0.16, 12) }] };
    }
  }
};

/** A flight whose letter never gets BIGGER than it was when released: a tile carried to the mouth is already shrunk, and must not swell over the face. */
const flightFor = (pack: PackId, start: string, cur: { x: number; y: number }, end: { x: number; y: number }, short: boolean): Flight => {
  const f = flightRaw(pack, start, cur, end, short);
  const m = /scale\(([\d.]+)\)/.exec(start);
  const s0 = m ? Number(m[1]) : 1;
  for (const k of f.kf) if (typeof k.transform === 'string') k.transform = k.transform.replace(/scale\(([\d.]+)\)/, (_, v) => `scale(${Math.min(Number(v), s0, 0.62)})`);
  return f;
};

/** A ring that grows and fades (the ocean's glow ripple, the vehicles' honk ring). Uses a plain div so it can be a full circle. */
const ripple = (at: Element, colour = '#ffffff', size = 90): void => {
  if (reducedMotion()) return;
  const r = at.getBoundingClientRect();
  const el = h('span', { class: 'ripple', style: `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;width:${size}px;height:${size}px;border-color:${colour}` });
  (document.getElementById('fxp') ?? document.body.appendChild(h('div', { id: 'fxp', 'aria-hidden': 'true' }))).append(el);
  const a = el.animate([{ transform: 'translate(-50%, -50%) scale(0.3)', opacity: 0.85 }, { transform: 'translate(-50%, -50%) scale(1.9)', opacity: 0 }], { duration: 750, easing: 'ease-out' });
  a.onfinish = () => el.remove();
};

/** The beam of the space world: a column of light that falls round the creature while it takes the letter aboard (drawn BEHIND the creature). */
const beam = (creature: HTMLElement, ms: number): void => {
  if (reducedMotion()) return;
  const host = creature.parentElement;
  if (!host) return;
  const hr = host.getBoundingClientRect(), cr = creature.getBoundingClientRect();
  const el = h('span', { class: 'beam', style: `left:${cr.left + cr.width / 2 - hr.left}px;top:-60px;height:${cr.bottom - hr.top + 60}px` });
  host.insertBefore(el, host.firstChild);
  const a = el.animate([{ opacity: 0, transform: 'scaleX(0.4)' }, { opacity: 1, transform: 'scaleX(1)', offset: 0.1 }, { opacity: 0.9, transform: 'scaleX(1)', offset: 0.75 }, { opacity: 0, transform: 'scaleX(0.6)' }], { duration: ms, easing: 'ease-in-out' });
  a.onfinish = () => el.remove();
};

// ---- the public reactions ---------------------------------------------------------------------------------------------------------
export interface EatArgs {
  creature: HTMLElement;
  tile: HTMLElement;
  mouth: HTMLElement;
  /** how far the letter was carried (its translate), and where the mouth is relative to where it started */
  cur: { x: number; y: number };
  end: { x: number; y: number };
  /** the success counter of this game this session: picks the variant deterministically */
  index: number;
  /** the short version (every success after the first one of the session) */
  short: boolean;
  /** called when the letter reaches the mouth (the swallow): play the chomp sound here */
  onSwallow?: () => void;
  /** called when the happy phase starts: fire the celebration burst here */
  onHappy?: () => void;
  /** the creature's id (decides the world); default: the world on screen */
  kind?: string | null;
}

/** The creature takes the letter: flight, swallow (the world's signature), chew, then a happy move. Resolves when it is time to move on. */
const eat = async (a: EatArgs): Promise<void> => {
  const { creature, tile, mouth } = a;
  const pack = packOfCreature(a.kind ?? creature.dataset.kind);
  const parts = partsOf(creature);
  const variant = a.index % 3;
  const chewTimes = a.short ? 2 : 3;
  const unit = a.short ? 85 : 100; // one chew = open + shut = 2 units
  claim(creature, 2600);
  const start = tile.style.transform || 'translate(0px, 0px) scale(1) rotate(0deg)';
  tile.classList.add('flying');
  tile.style.transition = 'none';
  const fl = flightFor(pack, start, a.cur, a.end, a.short);
  setMood(creature, 'open');
  if (reducedMotion()) {
    tile.style.opacity = '0';
    await sleep(200);
  } else {
    // anticipation: the head leans toward the letter (and the alien's beam starts)
    const tr = tile.getBoundingClientRect(), mr = mouth.getBoundingClientRect();
    const toward = Math.sign(tr.left + tr.width / 2 - (mr.left + mr.width / 2));
    run(parts.head, [{ transform: 'rotate(0deg) translateY(0px)' }, { transform: `rotate(${-4 * toward}deg) translateY(-3px)` }], fl.dur * 0.6);
    if (pack === 'space') beam(creature, fl.dur + (chewTimes * unit * 2) + 200);
    const flight = tile.animate(fl.kf, { duration: fl.dur, easing: fl.easing, fill: 'forwards' });
    await done(flight);
    tile.style.opacity = '0';
  }
  // the swallow and the chew: the world's signature
  a.onSwallow?.();
  switch (pack) {
    case 'dino': // stomp-chomp: the head nods into every bite
      run(parts.head, [{ transform: 'translateY(0px)' }, { transform: 'translateY(6px)', offset: 0.25 }, { transform: 'translateY(0px)', offset: 0.5 }, { transform: 'translateY(6px)', offset: 0.75 }, { transform: 'translateY(0px)' }], chewTimes * unit * 2);
      run(parts.body, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.06,0.93)', offset: 0.2 }, { transform: 'scale(1,1)' }], 380);
      break;
    case 'dragon': // a big gulp: the head tips back, then a tiny flame puff
      run(parts.head, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-9deg) translateY(-4px)', offset: 0.35 }, { transform: 'rotate(3deg) translateY(2px)', offset: 0.7 }, { transform: 'rotate(0deg)' }], chewTimes * unit * 2);
      setTimeout(() => emitKind(mouth, 'flame', a.short ? 2 : 3), unit * 2);
      break;
    case 'transport': // the scoop: the whole front dips down and up like a bucket
      run(parts.root, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(5deg) translateY(4px)', offset: 0.3 }, { transform: 'rotate(-3deg)', offset: 0.65 }, { transform: 'rotate(0deg)' }], chewTimes * unit * 2);
      setTimeout(() => ripple(mouth, '#ffffff', 80), unit * 2);
      break;
    case 'space': // beamed aboard: it floats a little, a shimmer of twinkles
      run(parts.root, [{ transform: 'translateY(0px)' }, { transform: 'translateY(-14px)', offset: 0.45 }, { transform: 'translateY(0px)' }], chewTimes * unit * 2);
      emitKind(mouth, 'twinkle', a.short ? 2 : 4);
      break;
    case 'ocean': // engulfed: the whole body swells round it and a ripple glows out
      run(parts.root, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.14,1.1)', offset: 0.35 }, { transform: 'scale(0.96,0.98)', offset: 0.7 }, { transform: 'scale(1,1)' }], chewTimes * unit * 2);
      ripple(mouth, '#bdeeff', 100);
      break;
    default: // farm: chomp chomp chomp
      run(parts.head, [{ transform: 'translateY(0px)' }, { transform: 'translateY(7px)', offset: 0.17 }, { transform: 'translateY(0px)', offset: 0.33 }, { transform: 'translateY(7px)', offset: 0.5 }, { transform: 'translateY(0px)', offset: 0.67 }, { transform: 'translateY(7px)', offset: 0.83 }, { transform: 'translateY(0px)' }], chewTimes * unit * 2);
  }
  chewRhythm(parts, pack, variant, chewTimes * unit * 2);
  for (let i = 0; i < chewTimes; i++) {
    setMood(creature, 'oops');
    await sleep(unit);
    setMood(creature, 'open');
    await sleep(unit);
  }
  setMood(creature, 'happy');
  lookAt(creature, null, null);
  const len = happyMove(creature, pack, variant, 2, a.short ? 0.72 : 1); // the whole move is seen, just quicker after the first
  a.onHappy?.();
  await sleep(len);
};

/** Right answer: the creature's happy move (3 variants by index), sized by level. Leaves it alone if another reaction owns it. */
const right = (creature: HTMLElement, o: { level?: Level; index?: number; kind?: string | null } = {}): void => {
  if (isBusy(creature)) return;
  const pack = packOfCreature(o.kind ?? creature.dataset.kind);
  const level = o.level ?? 2;
  setMood(creature, 'happy');
  claim(creature, 900);
  happyMove(creature, pack, o.index ?? 0, level);
  setTimeout(() => { if (creature.isConnected) setMood(creature, 'idle'); }, 1100);
};

/**
 * Wrong answer, errorless: a soft "oh" mouth, the head tilts and the eyes look toward the RIGHT choice. No shake, no red.
 * Resolves after ~600 ms (the caller then models the sound again). The look is released after a moment.
 */
const wrong = async (creature: HTMLElement, o: { toward?: Element | null } = {}): Promise<void> => {
  const parts = partsOf(creature);
  const cr = creature.getBoundingClientRect();
  let sign = 0;
  setMood(creature, 'oops');
  if (o.toward) {
    const t = o.toward.getBoundingClientRect();
    const tx = t.left + t.width / 2, ty = t.top + t.height / 2;
    const ddx = tx - (cr.left + cr.width / 2);
    sign = Math.abs(ddx) < 40 ? 0 : Math.sign(ddx); // nearly straight below: no side tilt, just look down at it
    lookAt(creature, tx, ty);
    creature.dataset.hold = '1'; // no idle glances while it is looking at the answer
    setTimeout(() => { delete creature.dataset.hold; lookAt(creature, null, null); }, 1700);
  }
  claim(creature, 700);
  run(parts.head, [{ transform: 'rotate(0deg) translateX(0px) translateY(0px)' }, { transform: `rotate(${9 * sign}deg) translateX(${4 * sign}px) translateY(${sign ? 0 : 4}px)`, offset: 0.35 }, { transform: `rotate(${9 * sign}deg) translateX(${4 * sign}px) translateY(${sign ? 0 : 4}px)`, offset: 0.8 }, { transform: 'rotate(0deg) translateX(0px) translateY(0px)' }], 1300, 'ease-in-out');
  run(parts.root, [{ transform: 'rotate(0deg)' }, { transform: `rotate(${3 * sign}deg)`, offset: 0.4 }, { transform: 'rotate(0deg)' }], 800);
  await sleep(600);
  setMood(creature, 'idle');
};

/** A soft nod (the calm acknowledgement for placement, where nothing is right or wrong). */
const nod = (creature: HTMLElement): void => {
  setMood(creature, 'happy');
  run(partsOf(creature).head, [{ transform: 'translateY(0px)' }, { transform: 'translateY(6px)', offset: 0.4 }, { transform: 'translateY(0px)' }], 520);
};

/** The finale: three happy moves in a row, then a world-wide shower. About 2.5 s. */
const finale = (creature: HTMLElement | null, o: { kind?: string | null } = {}): void => {
  showerAcross({ n: 18 });
  if (!creature || reducedMotion()) { if (creature) setMood(creature, 'happy'); return; }
  const pack = packOfCreature(o.kind ?? creature.dataset.kind);
  setMood(creature, 'happy');
  claim(creature, 2800);
  [0, 1, 2].forEach((v, i) => setTimeout(() => { if (creature.isConnected) happyMove(creature, pack, v, 3); }, i * 820));
  setTimeout(() => { if (creature.isConnected) setMood(creature, 'idle'); }, 2600);
};

/** After the second miss the right choice gently pulses (a slow glow, a few times; never red, never a shake). */
const pulseHint = (tile: HTMLElement): void => {
  tile.classList.remove('hint-pulse');
  void tile.offsetWidth;
  tile.classList.add('hint-pulse');
  setTimeout(() => tile.classList.remove('hint-pulse'), 5200);
};

export const reactions = { eat, right, wrong, finale, nod, pulseHint, emit };
