// Rhyme Rocket's vehicle, skinned per world (the mechanic never changes: drop the rhyming picture in, the gauge fills, it leaves):
//   dino leaf glider | dragon magic carpet | transport aeroplane | space rocket | ocean bubble pod | farm hot-air balloon
// `vehicleExit` flies it away: the path rotates through THREE variants by round (deterministic), and repeats are shorter.
import { rocketSVG } from './art';
import { reducedMotion } from './dom';
import type { PackId } from './particles';

const wrap = (cls: string, vb: string, inner: string): string =>
  `<svg class="rocket-art ${cls}" viewBox="${vb}" role="img" aria-hidden="true" focusable="false">${inner}</svg>`;

const plane = (): string => wrap('v-plane', '0 0 160 110', `
  <path d="M30 52 L12 20 L36 20 L52 50Z" fill="#ffd166" stroke="#e0a100" stroke-width="3"/>
  <path d="M28 62 L6 62 L10 76 L34 70Z" fill="#ffd166" stroke="#e0a100" stroke-width="3"/>
  <path d="M60 64 L102 64 L82 102 L50 102Z" fill="#ef476f" stroke="#c7385a" stroke-width="3"/>
  <path d="M18 60 Q20 40 60 40 L112 40 Q150 44 152 60 Q150 76 112 78 L60 78 Q20 80 18 60Z" fill="#fff" stroke="#c9d3e6" stroke-width="4"/>
  <path d="M22 57 Q70 49 150 55 L150 62 Q70 68 22 66Z" fill="#ef476f"/>
  <circle cx="72" cy="56" r="6" fill="#9ad7ff" stroke="#5aa9e6" stroke-width="3"/><circle cx="92" cy="56" r="6" fill="#9ad7ff" stroke="#5aa9e6" stroke-width="3"/><circle cx="112" cy="56" r="6" fill="#9ad7ff" stroke="#5aa9e6" stroke-width="3"/>
  <circle cx="150" cy="60" r="5" fill="#5a6b86"/>
  <g class="prop"><rect x="151" y="34" width="6" height="52" rx="3" fill="#5a6b86"/></g>`);

const carpet = (): string => wrap('v-carpet', '-6 0 172 96', `
  <path d="M10 36 Q48 22 82 34 T150 32 L146 64 Q112 78 80 64 T14 68Z" fill="#7b4fd1" stroke="#4a2a9a" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M22 41 Q50 32 82 41 T138 39 L135 57 Q110 66 80 56 T24 60Z" fill="none" stroke="#ffd166" stroke-width="3.5" stroke-dasharray="9 6"/>
  <path d="M80 42 L96 50 L80 58 L64 50Z" fill="#ffd166"/><path d="M80 46 L88 50 L80 54 L72 50Z" fill="#ef476f"/>
  <g class="fringe" stroke="#ffd166" stroke-width="3.2" stroke-linecap="round">
    <path d="M10 40 L0 38 M11 49 L0 50 M12 58 L1 63 M146 36 L158 34 M145 48 L158 49 M145 60 L157 64"/>
  </g>`);

const leaf = (): string => wrap('v-leaf', '-12 0 164 110', `
  <path d="M10 70 C30 18 100 8 140 40 C112 92 52 102 10 70Z" fill="#6cc24a" stroke="#3f9e4d" stroke-width="4" stroke-linejoin="round"/>
  <path d="M12 70 Q80 56 138 40" stroke="#3f9e4d" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M50 62 L66 34 M76 56 L96 30 M100 50 L118 32 M46 70 L64 88 M76 64 L92 86 M104 56 L118 72" stroke="#3f9e4d" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M10 70 Q-2 76 -8 92" stroke="#8b5a2b" stroke-width="5" fill="none" stroke-linecap="round"/>`);

const bubblePod = (): string => wrap('v-bubble', '0 0 100 210', `
  <circle cx="50" cy="96" r="50" fill="#bdeeff" fill-opacity=".38" stroke="#fff" stroke-width="4"/>
  <path d="M20 74 A32 32 0 0 1 42 50" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
  <path d="M30 70 A22 22 0 0 1 38 60" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M30 120 Q50 98 70 120 Q70 138 50 140 Q30 138 30 120Z" fill="#ffb7c5" stroke="#e9879b" stroke-width="3"/>
  <circle cx="50" cy="116" r="7" fill="#fff" stroke="#e9d2d8" stroke-width="2"/>
  <circle cx="38" cy="160" r="6" fill="#bdeeff" fill-opacity=".45" stroke="#fff" stroke-width="2"/><circle cx="60" cy="174" r="4.5" fill="#bdeeff" fill-opacity=".45" stroke="#fff" stroke-width="2"/><circle cx="46" cy="190" r="3.5" fill="#bdeeff" fill-opacity=".45" stroke="#fff" stroke-width="2"/>`);

const balloon = (): string => wrap('v-balloon', '0 0 100 210', `
  <path d="M50 6 C92 6 98 54 76 92 L64 120 L36 120 L24 92 C2 54 8 6 50 6Z" fill="#ffd166" stroke="#e0a100" stroke-width="4" stroke-linejoin="round"/>
  <path d="M50 6 C36 22 34 70 44 120 L56 120 C66 70 64 22 50 6Z" fill="#ef476f"/>
  <path d="M20 34 C34 40 66 40 80 34 M16 58 C34 66 66 66 84 58" stroke="#fff" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/>
  <path d="M36 120 L40 154 M64 120 L60 154" stroke="#8d5a22" stroke-width="3"/>
  <g class="flame"><path d="M44 136 Q50 118 56 136Z" fill="#ff9f1c"/></g>
  <rect x="34" y="152" width="32" height="26" rx="5" fill="#c9893e" stroke="#8d5a22" stroke-width="4"/>
  <path d="M34 162 L66 162 M34 170 L66 170" stroke="#8d5a22" stroke-width="2"/>`);

export const VEHICLE_NAME: Record<PackId, string> = {
  dino: 'leaf glider', dragon: 'magic carpet', transport: 'aeroplane', space: 'rocket', ocean: 'bubble pod', farm: 'hot-air balloon',
};

/** The vehicle's drawing for a world. */
export const vehicleSVG = (pack: PackId): string => {
  switch (pack) {
    case 'dino': return leaf();
    case 'dragon': return carpet();
    case 'transport': return plane();
    case 'ocean': return bubblePod();
    case 'farm': return balloon();
    default: return rocketSVG();
  }
};

// ---- the exit -------------------------------------------------------------------------------------------------------------------
const smooth = (a: number, b: number, x: number): number => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Position of the vehicle at progress f (0..1) for a world and a variant (0 straight up, 1 curves right, 2 curves left). */
const pose = (pack: PackId, v: number, f: number): { x: number; y: number; r: number; s: number; o: number } => {
  const e = pack === 'space' || pack === 'transport' ? f * f : pack === 'ocean' ? f : Math.pow(f, 1.35);
  const dirX = v === 1 ? 1 : v === 2 ? -1 : 0;
  let x = dirX * 230 * e;
  let y = -350 * e;
  let r = dirX * 22 * e;
  let s = 1 - 0.38 * e;
  if (f < 0.12) y += Math.sin((f / 0.12) * Math.PI) * 9; // a small dip: the wind-up before leaving
  switch (pack) {
    case 'ocean': x += Math.sin(f * 9) * 18; s = 1 - 0.1 * f + 0.2 * smooth(0.85, 0.95, f); break; // wobbling up, a little swell before it pops
    case 'farm': x += Math.sin(f * 5.5) * 16; r += Math.sin(f * 5.5) * 5; break;
    case 'dragon': x += Math.sin(f * 8) * 38; r += Math.cos(f * 8) * 14; break;
    case 'dino': x += Math.sin(f * 7) * 26; r += Math.sin(f * 7) * 18; break;
    case 'transport': r += -16 * e; if (v === 2) r = -360 * smooth(0.25, 0.7, f) - 10 * e; break;
    default: break;
  }
  return { x, y, r, s, o: f < 0.78 ? 1 : 1 - (f - 0.78) / 0.22 };
};

const SPEED: Record<PackId, number> = { dino: 1.15, dragon: 1.1, transport: 0.95, space: 1, ocean: 1.2, farm: 1.25 };

/** Fly the vehicle off the panel. `variant` is the round number (0, 1, 2, 0...), `short` shortens repeats. Resolves when it has gone. */
export const vehicleExit = (el: HTMLElement, pack: PackId, variant: number, short: boolean): Promise<void> => {
  if (reducedMotion()) { el.style.opacity = '0'; return Promise.resolve(); }
  const dur = (short ? 950 : 1450) * SPEED[pack];
  const N = 16;
  const kf: Keyframe[] = [];
  for (let k = 0; k <= N; k++) {
    const f = k / N;
    const p = pose(pack, variant % 3, f);
    kf.push({ transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${p.r.toFixed(1)}deg) scale(${p.s.toFixed(3)})`, opacity: p.o, offset: f });
  }
  const a = el.animate(kf, { duration: dur, easing: 'linear', fill: 'forwards' });
  return a.finished.then(() => undefined, () => undefined);
};
