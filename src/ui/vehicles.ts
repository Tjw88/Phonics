// Rhyme Rocket's vehicle, skinned per world (the mechanic never changes: drop the rhyming picture in, the gauge fills, it leaves):
//   dino leaf glider | dragon magic carpet | transport aeroplane | space rocket | ocean bubble pod | farm hot-air balloon
// `vehicleExit` flies it away: the path rotates through THREE variants by round (deterministic), and repeats are shorter.
import { rocketSVG } from './art';
import { reducedMotion } from './dom';
import { familyOf, type PackId } from './particles';

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


// ---- the six newer worlds' OWN vehicles --------------------------------------------------------------------------------------------
const cart = (): string => wrap('v-hover', '0 0 160 124', `
  <defs><linearGradient id="hvGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ee2ff" stop-opacity=".85"/><stop offset="1" stop-color="#7ee2ff" stop-opacity="0"/></linearGradient></defs>
  <g class="hglow"><path d="M40 88 L120 88 L142 122 L18 122Z" fill="url(#hvGlow)"/><ellipse cx="80" cy="88" rx="44" ry="7" fill="#bff4ff" opacity=".9"/></g>
  <line x1="80" y1="30" x2="80" y2="12" stroke="#5a6b86" stroke-width="3.5" stroke-linecap="round"/><circle cx="80" cy="9" r="6" fill="#ffd166" stroke="#e0a100" stroke-width="2.5"/>
  <path d="M46 66 Q46 28 80 28 Q114 28 114 66Z" fill="#bfeaff" fill-opacity=".8" stroke="#5a86c7" stroke-width="4"/>
  <rect x="62" y="44" width="36" height="20" rx="8" fill="#26364f"/><circle cx="72" cy="54" r="5" fill="#7ee2ff"/><circle cx="88" cy="54" r="5" fill="#7ee2ff"/><circle cx="73.5" cy="52" r="1.8" fill="#fff"/><circle cx="89.5" cy="52" r="1.8" fill="#fff"/>
  <ellipse cx="80" cy="76" rx="68" ry="19" fill="#8fb3e8" stroke="#5a86c7" stroke-width="4"/>
  <path d="M14 78 Q80 106 146 78" fill="none" stroke="#5a86c7" stroke-width="4"/>
  <path d="M16 74 Q80 92 144 74" fill="none" stroke="#ff9f1c" stroke-width="6" stroke-linecap="round"/>
  <g fill="#e8f0ff" stroke="#5a86c7" stroke-width="1.6"><circle cx="30" cy="80" r="3.2"/><circle cx="50" cy="86" r="3.2"/><circle cx="72" cy="89" r="3.2"/><circle cx="94" cy="89" r="3.2"/><circle cx="116" cy="86" r="3.2"/><circle cx="136" cy="80" r="3.2"/></g>`);

const boat = (): string => wrap('v-boat', '0 0 160 120', `
  <path d="M80 68 L80 10 Q124 28 130 68Z" fill="#fff8e6" stroke="#d8c79a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M74 68 L74 24 Q44 40 36 68Z" fill="#ffe9b8" stroke="#d8c79a" stroke-width="3" stroke-linejoin="round"/>
  <line x1="80" y1="6" x2="80" y2="74" stroke="#8d5a22" stroke-width="4" stroke-linecap="round"/>
  <path d="M12 70 L148 70 Q138 104 112 106 L48 106 Q22 104 12 70Z" fill="#c9893e" stroke="#7a4a1d" stroke-width="4" stroke-linejoin="round"/>
  <path d="M18 80 L142 80" stroke="#7a4a1d" stroke-width="3" opacity=".6"/>
  <circle cx="56" cy="90" r="6" fill="#bfeaff" stroke="#7a4a1d" stroke-width="3"/><circle cx="80" cy="90" r="6" fill="#bfeaff" stroke="#7a4a1d" stroke-width="3"/><circle cx="104" cy="90" r="6" fill="#bfeaff" stroke="#7a4a1d" stroke-width="3"/>
  <path d="M6 108 Q22 98 38 108 T70 108 T102 108 T134 108 T158 108" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>`);

const dragonfly = (): string => wrap('v-dragonfly', '0 0 170 112', `
  <g class="wing"><ellipse cx="72" cy="38" rx="38" ry="14" transform="rotate(-18 72 38)" fill="#e9d7ff" fill-opacity=".75" stroke="#b79af0" stroke-width="2.5"/><path d="M40 46 L100 30" stroke="#b79af0" stroke-width="1.5" opacity=".7"/></g>
  <g class="wing"><ellipse cx="96" cy="36" rx="34" ry="12" transform="rotate(-6 96 36)" fill="#ffd6ec" fill-opacity=".75" stroke="#f08fc0" stroke-width="2.5"/></g>
  <g class="wing"><ellipse cx="72" cy="72" rx="36" ry="13" transform="rotate(16 72 72)" fill="#e9d7ff" fill-opacity=".75" stroke="#b79af0" stroke-width="2.5"/></g>
  <g class="wing"><ellipse cx="98" cy="70" rx="32" ry="11" transform="rotate(6 98 70)" fill="#ffd6ec" fill-opacity=".75" stroke="#f08fc0" stroke-width="2.5"/></g>
  <path d="M14 58 Q70 50 128 54" stroke="#4cc3d9" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M30 56 L30 50 M48 54 L48 48 M66 53 L66 47 M84 52 L84 46 M102 52 L102 46" stroke="#2a8fb8" stroke-width="3" stroke-linecap="round"/>
  <circle cx="140" cy="54" r="13" fill="#ff7eb6" stroke="#d85a96" stroke-width="3"/><circle cx="145" cy="50" r="5" fill="#fff"/><circle cx="146" cy="50" r="2.4" fill="#26303f"/>`);

const vineBasket = (): string => wrap('v-vine', '0 0 120 190', `
  <path d="M60 0 C48 8 72 16 60 26" stroke="#3f9e4d" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M12 62 Q14 26 60 22 Q106 26 108 62 Q84 50 60 56 Q36 50 12 62Z" fill="#6cc24a" stroke="#3f9e4d" stroke-width="4" stroke-linejoin="round"/>
  <path d="M60 24 L60 56 M60 34 L30 52 M60 34 L90 52" stroke="#3f9e4d" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M20 60 L34 136 M44 56 L40 136 M76 56 L80 136 M100 60 L86 136" stroke="#8d5a22" stroke-width="3" stroke-linecap="round"/>
  <rect x="22" y="132" width="76" height="16" rx="7" fill="#c9893e" stroke="#7a4a1d" stroke-width="4"/>
  <path d="M30 140 L90 140" stroke="#7a4a1d" stroke-width="2" opacity=".6"/>
  <path d="M28 132 L28 106 Q60 100 92 106 L92 132" fill="#e8b866" fill-opacity=".55" stroke="#7a4a1d" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M34 148 L38 172 M86 148 L82 172" stroke="#8d5a22" stroke-width="3" stroke-linecap="round"/><circle cx="38" cy="176" r="5" fill="#ff7a5a" stroke="#d65a3a" stroke-width="2"/><circle cx="82" cy="176" r="5" fill="#ff7a5a" stroke="#d65a3a" stroke-width="2"/>`);

const noteBalloon = (): string => wrap('v-note', '0 0 100 210', `
  <path d="M78 104 L78 18 Q96 26 96 56" stroke="#ef476f" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <ellipse cx="46" cy="106" rx="38" ry="30" transform="rotate(-18 46 106)" fill="#8d63df" stroke="#5b3bb0" stroke-width="4"/>
  <path d="M22 98 Q30 82 46 80" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M46 136 L46 172" stroke="#8d5a22" stroke-width="3"/>
  <rect x="32" y="172" width="28" height="22" rx="5" fill="#c9893e" stroke="#7a4a1d" stroke-width="3.5"/>`);

const sled = (): string => wrap('v-sled', '0 0 170 104', `
  <path d="M8 84 L148 84 Q168 84 164 62" stroke="#7a8aa6" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M34 84 L34 72 M128 84 L128 72" stroke="#7a8aa6" stroke-width="6" stroke-linecap="round"/>
  <rect x="22" y="58" width="130" height="14" rx="6" fill="#c9893e" stroke="#7a4a1d" stroke-width="3.5"/>
  <rect x="22" y="22" width="12" height="40" rx="5" fill="#c9893e" stroke="#7a4a1d" stroke-width="3.5"/>
  <rect x="64" y="26" width="48" height="32" rx="7" fill="#9fd8f5" stroke="#4aa3d1" stroke-width="3.5"/><path d="M88 26 L88 58 M64 42 L112 42" stroke="#ef476f" stroke-width="5"/>
  <path d="M120 58 Q132 38 144 46 Q136 52 132 60Z" fill="#ef476f" stroke="#c7385a" stroke-width="2.5" stroke-linejoin="round"/>`);


const NAMES: Record<PackId, string> = {
  dino: 'leaf glider', dragon: 'magic carpet', transport: 'aeroplane', space: 'rocket', ocean: 'bubble pod', farm: 'hot-air balloon',
};

/** What the vehicle is called in the caption (any world id; a world without its own gets its family's vehicle). */
export const vehicleName = (id: string): string => OWN[id]?.name ?? NAMES[familyOf(id)];
/** The vehicle's drawing for a world. */
export const vehicleSVG = (id: string): string => {
  const own = OWN[id];
  if (own) return own.svg();
  switch (familyOf(id)) {
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
interface Pose { x: number; y: number; r: number; s: number; o: number }

/**
 * Where the vehicle is at progress f (0..1). Every world leaves on a DIAGONAL across the card (the panel lets it out), and the three variants
 * (by round, deterministic) differ per vehicle: rocket right / straight / left; plane climb / loop-the-loop / low swoop then climb;
 * carpet S-wave right / left / spiral; leaf glide right / spiral / left; pod wobbles right / up / left and pops; balloon drifts right / up / left.
 */
const pose = (pack: PackId, v: number, f: number): Pose => {
  const dirX = v === 0 ? 1 : v === 2 ? -1 : 0;
  const wind = Math.sin((f / 0.12) * Math.PI) * 9 * (f < 0.12 ? 1 : 0); // a small dip first: the wind-up before leaving
  let x = 0, y = 0, r = 0, s = 1 - 0.35 * f;
  switch (pack) {
    case 'space': {
      const e = Math.pow(f, 2);
      const d = v === 1 ? 0 : dirX;
      x = d * 330 * e; y = -400 * e; r = d * 38 * smooth(0, 0.2, f);
      break;
    }
    case 'transport': { // the plane always flies right
      const e = Math.pow(f, 1.6);
      x = 440 * e; y = -300 * e; r = -22 * smooth(0, 0.25, f);
      if (v === 1) { const th = Math.PI * 2 * smooth(0.18, 0.7, f); x += 58 * Math.sin(th); y -= 58 * (1 - Math.cos(th)); r = -22 - (th * 180) / Math.PI; }
      if (v === 2) { y += 70 * Math.sin(Math.PI * Math.min(1, f * 2.2)) * (f < 0.46 ? 1 : 0); r = 8 * Math.sin(Math.PI * Math.min(1, f * 2.2)) - 24 * smooth(0.4, 0.7, f); }
      s = 1 - 0.3 * f;
      break;
    }
    case 'dragon': {
      const e = Math.pow(f, 1.4);
      const d = v === 2 ? -1 : v === 0 ? 1 : 0.2;
      x = d * 320 * e + (v === 1 ? 70 * Math.sin(f * 12) : 40 * Math.sin(f * 8)); y = -380 * e; r = 15 * Math.cos(f * (v === 1 ? 12 : 8)) + d * 12;
      break;
    }
    case 'dino': {
      const e = Math.pow(f, 1.35);
      if (v === 1) { x = 60 * e + 60 * Math.sin(f * 13); y = -380 * e - 24 * (1 - Math.cos(f * 13)) * 0.4; r = 38 * Math.sin(f * 13); }
      else { const d = v === 0 ? 1 : -1; x = d * 300 * e + 26 * Math.sin(f * 7); y = -340 * e; r = d * 10 + 18 * Math.sin(f * 7); }
      break;
    }
    case 'ocean': {
      const e = f;
      const d = dirX * 0.7;
      x = d * 260 * e + Math.sin(f * 9) * (v === 1 ? 26 : 16); y = -360 * e; r = 0;
      s = 1 - 0.1 * f + 0.28 * smooth(0.8, 0.93, f); // a swell, then it pops
      break;
    }
    default: { // farm balloon: a slow drift
      const e = Math.pow(f, 1.3);
      const d = dirX * 0.7;
      x = d * 280 * e + Math.sin(f * 5.5) * 16; y = -370 * e; r = Math.sin(f * 5.5) * 5 + d * 6;
    }
  }
  const popped = pack === 'ocean' && f > 0.93;
  return { x, y: y + wind, r, s: popped ? s * (1 - (f - 0.93) / 0.07) : s, o: popped ? 1 - (f - 0.93) / 0.07 : f < 0.8 ? 1 : 1 - (f - 0.8) / 0.2 };
};

const S = Math.sin, C = Math.cos, PI = Math.PI, ab = Math.abs;
const mk = (x: number, y: number, r: number, f: number, s = 1 - 0.32 * f): Pose => ({ x, y, r, s, o: f < 0.8 ? 1 : 1 - (f - 0.8) / 0.2 });
/** The newer worlds' own vehicles: drawing, caption name, speed and THREE exits (by round, deterministic), all leaving diagonally across the card. */
const OWN: Partial<Record<string, { svg: () => string; name: string; speed: number; pose: (v: number, f: number) => Pose }>> = {
  robot: { svg: cart, name: 'hover disc', speed: 1, pose: (v, f) => { // zip right / hop-hop-hop up / zig-zag left
    const e = Math.pow(f, 1.8);
    if (v === 0) return mk(360 * e, -280 * e + 9 * S(f * 22) * (1 - f), -8 * smooth(0, 0.2, f), f);
    if (v === 1) return mk(36 * S(f * 8), -340 * f - 28 * ab(S(f * PI * 4)), 0, f);
    return mk(-300 * e + 58 * S(f * 14), -330 * e, 10 * C(f * 14), f);
  } },
  pirate: { svg: boat, name: 'little boat', speed: 1.1, pose: (v, f) => { // sails right over the waves / leaps on the waves / sails round in a loop
    if (v === 0) return mk(380 * Math.pow(f, 1.4), -250 * Math.pow(f, 1.4) + 16 * S(f * 16), 8 * S(f * 16) - 10 * smooth(0, 0.3, f), f);
    if (v === 1) return mk(-210 * f, -330 * f - 42 * ab(S(f * PI * 3)), 6 * S(f * 9), f);
    return mk(300 * Math.pow(f, 1.4), -300 * Math.pow(f, 1.4), -360 * smooth(0.25, 0.8, f), f);
  } },
  fairy: { svg: dragonfly, name: 'dragonfly', speed: 1.1, pose: (v, f) => { // a figure-eight climb / a zig-zag / a spiral to the left
    if (v === 0) return mk(200 * f + 110 * S(f * 2 * PI), -360 * f + 46 * S(f * 4 * PI), 12 * C(f * 2 * PI), f);
    if (v === 1) return mk(290 * f + 60 * S(f * 18), -340 * f, 10 * C(f * 18), f);
    return mk(-210 * f + 70 * S(f * 12), -360 * f + 40 * (1 - C(f * 12)) * 0.5, 14 * S(f * 12), f);
  } },
  jungle: { svg: vineBasket, name: 'leaf swing', speed: 1.1, pose: (v, f) => { // swings and is flung off to the right / the left / after three swings
    const dir = v === 1 ? -1 : 1;
    const sw = (v === 2 ? 3 : 1.5) * PI * f;
    const fl = smooth(0.5, 1, f);
    return mk(190 * S(sw) * (1 - f * 0.5) + dir * 230 * fl, -50 * (1 - C(sw)) - 340 * fl, -14 * S(sw) * (1 - f) + dir * 16 * fl, f);
  } },
  music: { svg: noteBalloon, name: 'note balloon', speed: 1.15, pose: (v, f) => { // drifts right with a wobble / rises and twirls / drifts left
    const e = Math.pow(f, 1.3);
    if (v === 1) return mk(30 * S(f * 6), -400 * e, 360 * smooth(0.2, 0.9, f) * 0.5 + 10 * S(f * 6), f);
    const d = v === 0 ? 1 : -1;
    return mk(d * 260 * e + 40 * S(f * 7), -380 * e, 14 * S(f * 7), f);
  } },
  arctic: { svg: sled, name: 'sled', speed: 0.95, pose: (v, f) => { // slides off a ramp / bumps along / flips as it goes
    const e = Math.pow(f, 1.7);
    if (v === 0) return mk(420 * e, -300 * e, -18 * smooth(0, 0.2, f), f);
    if (v === 1) return mk(420 * e, -250 * e - 34 * ab(S(f * PI * 4)), -8, f);
    return mk(400 * e, -280 * e, -360 * smooth(0.3, 0.8, f), f);
  } },
};

const SPEED: Record<PackId, number> = { dino: 1.05, dragon: 1, transport: 0.95, space: 1, ocean: 1.1, farm: 1.1 };
/** How long the exit takes, in ms (the games wait for about this long). */
export const exitMs = (id: string, short: boolean): number => (short ? 800 : 1100) * (OWN[id]?.speed ?? SPEED[familyOf(id)]);

/** Fly the vehicle off across the card. `variant` is the round number (0, 1, 2, 0...), `short` shortens repeats. Resolves when it has gone. */
export const vehicleExit = (el: HTMLElement, id: string, variant: number, short: boolean): Promise<void> => {
  if (reducedMotion()) { el.style.opacity = '0'; return Promise.resolve(); }
  const pack = familyOf(id);
  const own = OWN[id];
  const dur = exitMs(id, short);
  const N = 22;
  const kf: Keyframe[] = [];
  for (let k = 0; k <= N; k++) {
    const f = k / N;
    const p = own ? own.pose(variant % 3, f) : pose(pack, variant % 3, f);
    kf.push({ transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${p.r.toFixed(1)}deg) scale(${Math.max(0.02, p.s).toFixed(3)})`, opacity: p.o, offset: f });
  }
  const a = el.animate(kf, { duration: dur, easing: 'linear', fill: 'forwards' });
  return a.finished.then(() => undefined, () => undefined);
};

// ---- Robot Talk's little per-world prop (drawn INTO the robot's own svg so it moves with it) ----------------------------------
// `back` is drawn behind the antenna and the head (only the part above the head shows), `front` over the head. The antenna bulb always stays visible.
const PROPS: Record<PackId, { back?: string; front?: string }> = {
  transport: { // a hard hat, tipped a little
    back: '<g transform="translate(-6 0) rotate(-10 56 34)"><path d="M26 36 Q26 2 70 2 Q114 2 114 36Z" fill="#ffd23f" stroke="#e0a100" stroke-width="4"/><rect x="62" y="6" width="16" height="26" rx="5" fill="#ffe27a"/><rect x="18" y="32" width="104" height="9" rx="4.5" fill="#ffc21a" stroke="#e0a100" stroke-width="3"/></g>',
  },
  space: { // a clear helmet round the head
    front: '<rect x="18" y="24" width="124" height="96" rx="40" fill="#bfeaff" fill-opacity=".22" stroke="#eaf8ff" stroke-width="4"/><path d="M34 52 Q40 36 58 32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/><rect x="62" y="116" width="36" height="8" rx="4" fill="#9fb4d6"/>',
  },
  farm: { // a straw hat with a red band
    back: '<g transform="translate(-4 0) rotate(-12 56 34)"><path d="M32 34 Q34 6 62 6 Q90 6 92 34Z" fill="#f1d27a" stroke="#b8893a" stroke-width="3"/><rect x="32" y="24" width="60" height="7" fill="#c0392b"/><ellipse cx="62" cy="35" rx="48" ry="9" fill="#e8c46a" stroke="#b8893a" stroke-width="3"/></g>',
  },
  ocean: { // a swimming mask over the eyes and a snorkel
    front: '<rect x="32" y="40" width="96" height="50" rx="22" fill="#bdeeff" fill-opacity=".3" stroke="#2a86b5" stroke-width="6"/><path d="M130 66 Q152 60 148 14" stroke="#2fb4c8" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="148" cy="12" r="6" fill="#ff7a5a"/>',
  },
  dino: { // a crown of leaves
    front: '<g fill="#5cb85c" stroke="#3f9e4d" stroke-width="2.5" stroke-linejoin="round"><path d="M32 38 Q20 22 28 6 Q46 14 44 36Z"/><path d="M52 32 Q46 12 56 0 Q69 10 64 30Z"/><path d="M96 30 Q92 10 104 2 Q116 12 110 34Z"/><path d="M116 36 Q126 20 124 4 Q142 12 136 38Z"/></g>',
  },
  dragon: { // a tiny gold crown, a little to one side so the bulb shows
    front: '<g transform="translate(22 0) rotate(10 80 30)"><path d="M54 34 L54 12 L66 24 L80 6 L94 24 L106 12 L106 34Z" fill="#ffd23f" stroke="#e0a100" stroke-width="3.5" stroke-linejoin="round"/><circle cx="80" cy="22" r="4" fill="#ef476f"/><circle cx="62" cy="26" r="2.6" fill="#4cc3d9"/><circle cx="98" cy="26" r="2.6" fill="#4cc3d9"/></g>',
  },
};
const PROPS_OWN: Partial<Record<string, { back?: string; front?: string }>> = {
  music: { front: '<path d="M26 66 Q22 22 80 20 Q138 22 134 66" stroke="#7b4fd1" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="14" y="54" width="20" height="30" rx="9" fill="#ef476f" stroke="#b3154f" stroke-width="3"/><rect x="126" y="54" width="20" height="30" rx="9" fill="#ef476f" stroke="#b3154f" stroke-width="3"/>' }, // headphones
  arctic: { back: '<g transform="translate(-4 0)"><path d="M30 36 Q30 6 80 6 Q130 6 130 36Z" fill="#4cc3d9" stroke="#2a8fb8" stroke-width="4"/><rect x="26" y="30" width="108" height="12" rx="6" fill="#e6f4ff" stroke="#a9cde8" stroke-width="3"/><circle cx="80" cy="4" r="9" fill="#ffffff" stroke="#a9cde8" stroke-width="3"/></g>' }, // a woolly hat with a bobble
  pirate: { back: '<g transform="translate(-4 0) rotate(-6 80 34)"><path d="M24 38 Q40 4 80 8 Q120 4 136 38Z" fill="#2f3340" stroke="#1d2230" stroke-width="4"/><rect x="26" y="30" width="108" height="8" rx="4" fill="#ffc21a" stroke="#e0a100" stroke-width="2.5"/></g>' }, // a pirate hat with a gold band (no skull)
};
/** The robot's drawing with the world's prop on it (a world's own prop, else its family's, else none: never throws). */
export const robotWithProp = (svg: string, id: string): string => {
  const p = PROPS_OWN[id] ?? PROPS[familyOf(id)] ?? {};
  let out = svg;
  if (p.back) out = out.replace('<line x1="80" y1="30"', `${p.back}<line x1="80" y1="30"`);
  if (p.front) out = out.replace('</svg>', `${p.front}</svg>`);
  return out;
};
