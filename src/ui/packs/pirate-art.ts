import { mixHex } from '../art';

/**
 * Pirate Cove: the arrival chests, the sunny-cove backdrop and the sand-island. Soft, flat, low-contrast shapes; the saturated colour
 * belongs to the creatures. No weapons, no skulls, no flags: a gentle "treasure and maps" world. Every id is prefixed "pirate".
 */

const f = (n: number): string => (Math.round(n * 10) / 10).toString();

const WOOD = '#b57a3a';
const WOOD_D = '#7d4e22';
const GOLD = '#ffd23a';
const GOLD_D = '#e0a100';

// ---------------------------------------------------------------- the arrival: a small wooden treasure chest, lid ajar, gold glow, a ribbon in the creature's colour
export const chestEgg = (id: string, main: string, dark: string): string => {
  const band = mixHex(main, '#ffffff', 0.1);
  const bandHi = mixHex(main, '#ffffff', 0.45);
  const planks = (x0: number, x1: number, y0: number, y1: number, n: number) =>
    Array.from({ length: n - 1 }, (_, i) => `M${x0} ${f(y0 + ((y1 - y0) * (i + 1)) / n)} H${x1}`).join(' ');
  const coins = [[30, 82], [44, 79], [58, 81], [72, 79], [86, 82], [38, 85], [52, 86], [66, 85], [80, 86]]
    .map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="8.5" ry="5" fill="${i % 2 ? '#ffdd55' : GOLD}" stroke="${GOLD_D}" stroke-width="1.6"/>`).join('');
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="${id}-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6b0" stop-opacity=".95"/><stop offset="0.5" stop-color="#ffe066" stop-opacity=".5"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixHex(WOOD, '#ffffff', 0.18)}"/><stop offset="1" stop-color="${WOOD}"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="144" rx="48" ry="6.5" fill="#0000002b"/>
  <circle cx="60" cy="66" r="58" fill="url(#${id}-glow)"/>
  <path d="M42 80 L28 28 L40 30 L52 76Z M60 78 L60 14 L72 16 L68 76Z M78 80 L96 30 L86 28 L72 76Z" fill="#fff6b0" opacity=".38"/>
  <path d="M14 94 H106 V132 Q106 140 98 140 H22 Q14 140 14 132Z" fill="url(#${id}-wood)" stroke="${WOOD_D}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="${planks(15, 105, 94, 140, 3)}" stroke="${WOOD_D}" stroke-width="2.4" opacity=".55"/>
  <path d="M14 94 H106 V86 Q60 94 14 86Z" fill="${WOOD_D}" opacity=".55"/>
  <g>${coins}</g>
  <g transform="rotate(-9 16 70)">
    <path d="M14 70 Q14 34 60 34 Q106 34 106 70 Z" fill="url(#${id}-wood)" stroke="${WOOD_D}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M14 70 H106 V76 Q60 80 14 76Z" fill="${WOOD_D}"/>
    <path d="M26 56 Q34 42 48 40" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".5"/>
    <path d="M18 60 Q60 50 102 60" stroke="${WOOD_D}" stroke-width="2.4" fill="none" opacity=".5"/>
    <path d="M47 35 Q44 52 46 72 H74 Q76 52 73 35Q60 31 47 35Z" fill="${band}" stroke="${dark}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M50 38 Q48 54 50 70" stroke="${bandHi}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <g transform="translate(60 33)">
      <path d="M0 0 C-8 -14 -26 -10 -22 -2 C-19 4 -8 3 0 0Z" fill="${main}" stroke="${dark}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M0 0 C8 -14 26 -10 22 -2 C19 4 8 3 0 0Z" fill="${main}" stroke="${dark}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M-2 2 L-12 16 L-5 14 L-3 20Z M2 2 L12 16 L5 14 L3 20Z" fill="${band}" stroke="${dark}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="0" cy="0" r="5" fill="${band}" stroke="${dark}" stroke-width="2.2"/>
      <ellipse cx="-14" cy="-6" rx="4.5" ry="2.4" fill="#fff" opacity=".55" transform="rotate(-20 -14 -6)"/>
    </g>
  </g>
  <rect x="48" y="94" width="24" height="46" fill="${band}" stroke="${dark}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M52 96 V138" stroke="${bandHi}" stroke-width="3" stroke-linecap="round"/>
  <rect x="51" y="102" width="18" height="20" rx="5" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="2.6"/>
  <circle cx="60" cy="109" r="3.4" fill="${WOOD_D}"/><path d="M60 110 V116" stroke="${WOOD_D}" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="22" cy="104" r="2.6" fill="${GOLD_D}"/><circle cx="98" cy="104" r="2.6" fill="${GOLD_D}"/><circle cx="22" cy="130" r="2.6" fill="${GOLD_D}"/><circle cx="98" cy="130" r="2.6" fill="${GOLD_D}"/>
  <path d="M104 40 l2.6 7 l7 2.6 l-7 2.6 l-2.6 7 l-2.6 -7 l-7 -2.6 l7 -2.6z" fill="#fff" opacity=".95"/>
  <path d="M14 56 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z" fill="#fff" opacity=".85"/>
  <circle cx="96" cy="68" r="2.6" fill="#fff" opacity=".8"/>
</svg>`;
};

// ---------------------------------------------------------------- shared little drawings

interface PalmColours { trunk: string; ring: string; fronds: [string, string, string]; vein: string; nut: string }
const PALM_DAY: PalmColours = { trunk: '#b98650', ring: '#9a6a3a', fronds: ['#2f9f60', '#3fb871', '#59cb86'], vein: '#c8f5d6', nut: '#8a5a2b' };

/** A palm tree with its foot at (x, y): `h` tall, crown leaning `lean` sideways, fronds `len` long. */
const palm = (x: number, y: number, h: number, lean: number, len: number, c: PalmColours = PALM_DAY, flip = false): string => {
  const sc = len / 100;
  const frond = (th: number, size: number, shade: number, mirror: boolean) =>
    `<g transform="${mirror ? 'scale(-1 1) ' : ''}rotate(${th}) scale(${f(sc * size)})"><path d="M0 0 C26 -26 72 -30 100 10 C70 -10 30 -6 0 0Z" fill="${c.fronds[shade]}" stroke="${c.fronds[shade]}" stroke-width="5" stroke-linejoin="round"/><path d="M4 -1 C30 -14 66 -16 96 8" stroke="${c.vein}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".45"/></g>`;
  const ringsN = 6;
  const rings = Array.from({ length: ringsN }, (_, i) => {
    const t = (i + 1) / (ringsN + 1);
    const yy = -h * t;
    const xx = lean * t * t * 0.9;
    const w = 10 - 4 * t;
    return `<path d="M${f(xx - w)} ${f(yy)} q${f(w)} 4 ${f(w * 2)} 0" stroke="${c.ring}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  }).join('');
  const trunk = `<path d="M-11 0 C-9 ${f(-h * 0.35)} ${f(lean * 0.5 - 7)} ${f(-h * 0.75)} ${f(lean - 5)} ${f(-h)} L${f(lean + 5)} ${f(-h)} C${f(lean * 0.5 + 8)} ${f(-h * 0.75)} 9 ${f(-h * 0.35)} 11 0Z" fill="${c.trunk}"/>`;
  const crown = `<g transform="translate(${f(lean)} ${f(-h)})">
      ${frond(-60, 0.9, 0, true)}${frond(-60, 0.95, 0, false)}${frond(8, 1, 1, true)}${frond(14, 1.05, 1, false)}${frond(42, 0.85, 1, true)}${frond(46, 0.9, 1, false)}${frond(-28, 1.0, 2, true)}${frond(-24, 1.05, 2, false)}
      <circle cx="-7" cy="8" r="${f(6 * Math.max(0.7, sc))}" fill="${c.nut}"/><circle cx="7" cy="9" r="${f(6 * Math.max(0.7, sc))}" fill="${c.nut}"/><circle cx="0" cy="13" r="${f(6 * Math.max(0.7, sc))}" fill="${c.nut}"/>
    </g>`;
  return `<g transform="translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}"><ellipse cx="${f(lean * 0.2)}" cy="3" rx="${f(18 + h * 0.08)}" ry="5" fill="#00000014"/>${trunk}${rings}${crown}</g>`;
};

/** A spiral sea snail shell (origin at its centre). */
const spiralShell = (x: number, y: number, s: number, rot: number, fill = '#fff1dc', line = '#e4b58a'): string =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-22 10 Q-26 -22 2 -26 Q30 -26 28 2 Q26 24 4 24 Q-14 24 -14 6 Q-14 -10 2 -10 Q14 -10 14 2" fill="${fill}" stroke="${line}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M-12 -14 Q4 -22 18 -12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></g>`;

/** A scallop (fan) shell. */
const scallop = (x: number, y: number, s: number, rot: number, fill = '#ffd6dc', line = '#f0a4b4'): string => {
  const ribs = Array.from({ length: 5 }, (_, i) => { const a = ((-150 + i * 30) * Math.PI) / 180; return `M0 0 L${f(30 * Math.cos(a))} ${f(30 * Math.sin(a))}`; }).join(' ');
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-6 6 L6 6 L10 12 L-10 12Z" fill="${line}"/><path d="M0 6 L-30 -8 Q-34 -34 0 -38 Q34 -34 30 -8Z" fill="${fill}" stroke="${line}" stroke-width="3" stroke-linejoin="round"/><path d="${ribs}" transform="translate(0 6)" stroke="${line}" stroke-width="3" stroke-linecap="round" fill="none"/></g>`;
};

/** A rounded five-armed starfish. */
const starfish = (cx: number, cy: number, R: number, rot: number, fill: string, dot: string): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((rot + i * 36 - 90) * Math.PI) / 180;
    const r = i % 2 === 0 ? R : R * 0.46;
    pts.push(`${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`);
  }
  const dots = Array.from({ length: 5 }, (_, i) => {
    const a = ((rot + i * 72 - 90) * Math.PI) / 180;
    return `<circle cx="${f(cx + R * 0.55 * Math.cos(a))}" cy="${f(cy + R * 0.55 * Math.sin(a))}" r="${f(R * 0.09)}"/>`;
  }).join('');
  return `<g><polygon points="${pts.join(' ')}" fill="${fill}" stroke="${fill}" stroke-width="${f(R * 0.4)}" stroke-linejoin="round"/><g fill="${dot}">${dots}</g></g>`;
};

/** A soft cloud: a flat base with round puffs. */
const cloud = (cls: string, x: number, y: number, s: number): string =>
  `<g class="cloud ${cls}" fill="#ffffff" opacity=".92"><g transform="translate(${x} ${y}) scale(${s})"><rect x="-70" y="-18" width="140" height="36" rx="18"/><circle cx="-24" cy="-22" r="26"/><circle cx="14" cy="-32" r="32"/><circle cx="44" cy="-14" r="20"/></g></g>`;

/** The toy ship: chunky rounded hull, two masts, striped sails, no flags. Origin = middle of the deck line; `lantern` is the hanging lantern's centre. */
const SHIP_LANTERN: [number, number] = [-52, -14];
const ship = (x: number, y: number, s: number, haze: number): string => {
  const c = (hex: string) => mixHex(hex, '#8fdde8', haze);
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="pirate-bob">
    <ellipse cx="0" cy="40" rx="78" ry="7" fill="#ffffff" opacity=".45"/>
    <defs>
      <clipPath id="pirate-sail-a"><path d="M-6 -96 Q-52 -84 -48 -22 L-6 -24Z"/></clipPath>
      <clipPath id="pirate-sail-b"><path d="M6 -90 Q54 -78 50 -24 L6 -26Z"/></clipPath>
    </defs>
    <rect x="-6" y="-106" width="9" height="108" rx="4" fill="${c('#8a5a2b')}"/>
    <circle cx="-1.5" cy="-108" r="6" fill="${c('#e8a93a')}"/>
    <g clip-path="url(#pirate-sail-a)"><rect x="-60" y="-100" width="60" height="80" fill="${c('#fff4de')}"/>${[-50, -34, -18].map((x0) => `<rect x="${x0}" y="-100" width="8" height="80" fill="${c('#f0766a')}"/>`).join('')}</g>
    <g clip-path="url(#pirate-sail-b)"><rect x="4" y="-96" width="60" height="76" fill="${c('#fff4de')}"/>${[8, 24, 40].map((x0) => `<rect x="${x0}" y="-96" width="8" height="76" fill="${c('#f0766a')}"/>`).join('')}</g>
    <path d="M-6 -96 Q-52 -84 -48 -22 L-6 -24Z M6 -90 Q54 -78 50 -24 L6 -26Z" fill="none" stroke="${c('#e9d2a8')}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-72 0 H72 Q66 34 36 40 H-36 Q-66 34 -72 0Z" fill="${c('#a9713a')}"/>
    <path d="M-72 0 H72 L70 11 H-70Z" fill="${c('#f6e2b0')}"/>
    <path d="M-72 0 H72" stroke="${c('#8a5a2b')}" stroke-width="4" stroke-linecap="round"/>
    <g fill="${c('#fff1c6')}" stroke="${c('#7d4e22')}" stroke-width="2.4"><circle cx="-34" cy="23" r="6.5"/><circle cx="0" cy="25" r="6.5"/><circle cx="34" cy="23" r="6.5"/></g>
    <path d="M-52 0 V-20" stroke="${c('#8a5a2b')}" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="-58" y="-24" width="12" height="14" rx="4" fill="${c('#ffd36b')}" stroke="${c('#8a5a2b')}" stroke-width="2.4"/>
    <path d="M72 0 Q96 -6 100 -22 Q92 -10 72 -6Z" fill="${c('#a9713a')}"/>
  </g></g>`;
};

// ---------------------------------------------------------------- the backdrop
export const pirateScene = (): string => {
  const stars = [[120, 120], [260, 60], [420, 200], [560, 90], [700, 40], [820, 170], [960, 70], [1100, 150], [1180, 40], [1300, 210], [1440, 100], [1520, 260], [80, 300], [330, 330], [640, 280], [900, 320], [1240, 340], [1480, 380], [180, 220], [520, 240], [760, 300], [1020, 250], [1360, 300], [60, 400], [1540, 420]]
    .map(([x, y], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="${i % 4 === 0 ? '#fff2c2' : '#e4f6ff'}"/>`).join('');
  const rays = Array.from({ length: 12 }, (_, i) => `<rect x="-6" y="-92" width="12" height="26" rx="6" fill="#ffe27a" opacity=".7" transform="rotate(${i * 30})"/>`).join('');
  const SX = 1512, SY = 408, SS = 0.8;
  const lantern = [SX + SHIP_LANTERN[0] * SS, SY + SHIP_LANTERN[1] * SS];
  const beach = 'M0 556 C150 552 300 670 520 742 C760 812 1010 812 1190 748 C1340 702 1460 596 1600 556 V900 H0Z';
  const foam = 'M0 546 C150 542 300 660 520 732 C760 802 1010 802 1190 738 C1340 692 1460 586 1600 546';
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <style>
  @keyframes pirate-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
  #scene-bg .pirate-bob { animation: pirate-bob 5s ease-in-out infinite; }
  .wt-scene .sky-night, .wt-scene .moon, .wt-scene .stars { opacity: 0; }
  #scene-bg .scenery-glow, .wt-scene .scenery-glow { opacity: 0; transition: opacity 1.2s; }
  body.night #scene-bg .scenery-glow, .night #scene-bg .scenery-glow { opacity: 1; }
  @media (prefers-reduced-motion: reduce) { #scene-bg .pirate-bob { animation: none; } }
  </style>
  <defs>
    <linearGradient id="pirate-sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#78cdfb"/><stop offset="0.3" stop-color="#a9e3ff"/><stop offset="0.47" stop-color="#fff1cf"/><stop offset="1" stop-color="#fff1cf"/></linearGradient>
    <linearGradient id="pirate-sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2748"/><stop offset="0.5" stop-color="#1c4a73"/><stop offset="1" stop-color="#3a7b8e"/></linearGradient>
    <linearGradient id="pirate-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe6e6"/><stop offset="0.12" stop-color="#52d3d6"/><stop offset="0.55" stop-color="#2fbfcb"/><stop offset="1" stop-color="#3fd0cf"/></linearGradient>
    <radialGradient id="pirate-sunglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6c4" stop-opacity=".9"/><stop offset="0.4" stop-color="#ffec99" stop-opacity=".4"/><stop offset="1" stop-color="#ffec99" stop-opacity="0"/></radialGradient>
    <radialGradient id="pirate-moonglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fffbe0" stop-opacity=".7"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>
    <radialGradient id="pirate-lantern" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".95"/><stop offset="0.35" stop-color="#ffd36b" stop-opacity=".5"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient>
  </defs>
  <rect class="sky-day" width="1600" height="900" fill="url(#pirate-sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#pirate-sky-n)"/>
  <g class="sun"><g transform="translate(1400 118)"><g class="rays">${rays}</g><circle r="170" fill="url(#pirate-sunglow)"/><circle r="50" fill="#ffe77a"/><circle r="38" fill="#fff3a8"/></g></g>
  <g class="moon"><circle cx="1400" cy="130" r="170" fill="url(#pirate-moonglow)"/><circle cx="1400" cy="130" r="72" fill="#fff6d2"/><circle cx="1376" cy="110" r="13" fill="#f0e2b0"/><circle cx="1426" cy="152" r="9" fill="#f0e2b0"/><circle cx="1428" cy="104" r="6" fill="#f0e2b0"/><circle cx="1384" cy="158" r="6" fill="#f0e2b0"/></g>
  <g class="stars">${stars}</g>
  ${cloud('c1', 150, 190, 1)}${cloud('c2', 500, 110, 0.8)}${cloud('c3', 820, 250, 0.7)}
  <g class="scenery">
    <!-- the sea: hazy at the horizon, turquoise, lighter in the shallows -->
    <rect y="420" width="1600" height="480" fill="url(#pirate-sea)"/>
    <path d="M0 420 H1600" stroke="#ffffff" stroke-width="5" opacity=".35"/>
    <!-- far landmarks -->
    <path fill-rule="evenodd" d="M20 440 L20 404 Q26 346 104 338 Q190 334 226 382 Q256 418 258 440Z M82 440 L82 404 Q86 380 126 376 Q162 380 168 404 L170 440Z" fill="#e7c898" opacity=".95"/>
    <path d="M22 404 Q28 346 104 338 Q190 334 226 382" stroke="#fff4d6" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/>
    <path d="M20 440 H260" stroke="#ffffff" stroke-width="9" opacity=".4"/>
    <g fill="#6fcf8f"><ellipse cx="80" cy="348" rx="26" ry="12"/><ellipse cx="152" cy="346" rx="22" ry="10"/></g>
    ${ship(SX, SY, SS, 0.15)}
    <!-- gentle wave marks -->
    <g fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".38">
      <path d="M60 500 q26 -9 52 0 q26 9 52 0"/><path d="M300 470 q22 -8 44 0 q22 8 44 0"/><path d="M1180 480 q26 -9 52 0 q26 9 52 0"/><path d="M1400 520 q22 -8 44 0 q22 8 44 0"/><path d="M180 590 q26 -9 52 0 q26 9 52 0"/>
      <path d="M1320 600 q26 -9 52 0 q26 9 52 0"/><path d="M700 450 q18 -6 36 0 q18 6 36 0"/><path d="M420 540 q22 -8 44 0"/><path d="M1090 560 q22 -8 44 0"/>
    </g>
    <!-- shallows and beach -->
    <path d="${beach}" transform="translate(0 -16)" fill="#7fe6d6"/>
    <path d="${beach}" transform="translate(0 -7)" fill="#c4f4e2" opacity=".9"/>
    <path d="${beach}" fill="#f3d98f"/>
    <path d="${beach}" transform="translate(0 40)" fill="#fae6aa"/>
    <path d="${foam}" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity=".75"/>
    <g fill="none" stroke="#e6c57b" stroke-width="4" stroke-linecap="round" opacity=".7"><path d="M260 700 q22 -8 44 0"/><path d="M560 800 q26 -8 52 0"/><path d="M820 846 q26 -8 52 0"/><path d="M1380 650 q22 -8 44 0"/><path d="M60 640 q22 -8 44 0"/></g>
    <!-- the two palm gardens at the edges -->
    <g>
      <ellipse cx="170" cy="612" rx="140" ry="30" fill="#7fcf8f" opacity=".55"/>
      ${palm(70, 640, 150, -18, 82)}
      ${palm(176, 618, 228, 34, 104, PALM_DAY, true)}
      <g fill="#58b878"><ellipse cx="238" cy="618" rx="34" ry="14"/><ellipse cx="108" cy="652" rx="26" ry="11"/></g>
      <ellipse cx="1440" cy="620" rx="150" ry="30" fill="#7fcf8f" opacity=".55"/>
      ${palm(1530, 650, 160, 16, 86)}
      ${palm(1424, 624, 236, -62, 94)}
      <g fill="#58b878"><ellipse cx="1362" cy="626" rx="34" ry="14"/><ellipse cx="1500" cy="660" rx="26" ry="11"/></g>
    </g>
    <!-- treasure map patch with a plain X and a dotted trail -->
    <path d="M880 858 C960 840 1060 868 1130 852" stroke="#e1b86b" stroke-width="8" stroke-dasharray="0.1 22" stroke-linecap="round" fill="none"/>
    <path d="M1090 852 C1100 828 1180 818 1250 826 C1316 832 1340 856 1304 872 C1250 890 1130 892 1096 876 C1082 868 1084 858 1090 852Z" fill="#fff0c4" stroke="#ecd08e" stroke-width="4" stroke-linejoin="round"/>
    <path d="M1168 838 L1228 874 M1228 838 L1168 874" stroke="#d99410" stroke-width="19" stroke-linecap="round"/><path d="M1168 836 L1228 872 M1228 836 L1168 872" stroke="#ffc933" stroke-width="14" stroke-linecap="round"/>
    <!-- shells on the sand -->
    ${scallop(330, 790, 0.9, -12)}${spiralShell(430, 842, 0.8, 18)}${starfish(210, 800, 24, 12, '#ff9a5c', '#ffd2a8')}${spiralShell(120, 700, 0.6, -20)}
    ${scallop(1480, 760, 0.8, 14)}${starfish(1370, 830, 20, -10, '#ff8fa3', '#ffd0d8')}${spiralShell(1540, 840, 0.7, -16)}${scallop(700, 880, 0.55, 6)}
    <g fill="#ffffff" opacity=".7"><circle cx="40" cy="760" r="4"/><circle cx="70" cy="800" r="3"/><circle cx="1560" cy="780" r="4"/><circle cx="1290" cy="800" r="3"/><circle cx="600" cy="850" r="3"/></g>
  </g>
  <g class="scenery-glow">
    <circle cx="${f(lantern[0]!)}" cy="${f(lantern[1]!)}" r="64" fill="url(#pirate-lantern)"/>
    <rect x="${f(lantern[0]! - 5)}" y="${f(lantern[1]! - 6)}" width="10" height="12" rx="3" fill="#ffe27a"/>
    <g fill="#ffe27a"><circle cx="${f(SX - 34 * SS)}" cy="${f(SY + 23 * SS)}" r="${f(6.5 * SS)}"/><circle cx="${f(SX)}" cy="${f(SY + 25 * SS)}" r="${f(6.5 * SS)}"/><circle cx="${f(SX + 34 * SS)}" cy="${f(SY + 23 * SS)}" r="${f(6.5 * SS)}"/></g>
  </g>
</svg>`;
};

// ---------------------------------------------------------------- the home island
export const pirateIsland = (): string => `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <defs><radialGradient id="pirate-island-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6b0" stop-opacity=".9"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="200" cy="164" rx="196" ry="24" fill="#2fb9c6" opacity=".34"/>
  <ellipse cx="200" cy="160" rx="182" ry="19" fill="#8fe9dc" opacity=".55"/>
  <path d="M26 146 Q34 104 112 98 L288 98 Q366 104 374 146 Q374 170 200 172 Q26 170 26 146Z" fill="#e6c57b"/>
  <path d="M38 134 Q50 100 124 94 L276 94 Q350 100 362 134 Q300 120 200 120 Q100 120 38 134Z" fill="#f8e3a0"/>
  <path d="M40 148 q20 -6 40 0 M320 150 q22 -6 44 0 M150 158 q26 -7 52 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>
  <g fill="none" stroke="#e1bd6e" stroke-width="3" stroke-linecap="round" opacity=".7"><path d="M130 112 q18 -5 36 0"/><path d="M236 112 q18 -5 36 0"/></g>
  <g fill="#58b878"><ellipse cx="72" cy="106" rx="22" ry="8"/><ellipse cx="120" cy="100" rx="14" ry="6"/></g>
  ${palm(96, 108, 50, 14, 44)}
  <g transform="translate(0 6)">
    <g transform="rotate(-7 308 80)"><rect x="284" y="52" width="48" height="30" rx="9" fill="#7d4e22" stroke="${WOOD_D}" stroke-width="3"/><rect x="289" y="57" width="38" height="22" rx="6" fill="#a36b33"/><path d="M296 57 V79 M308 57 V79 M320 57 V79" stroke="#8a5a2b" stroke-width="2" opacity=".6"/></g>
    <circle cx="308" cy="84" r="34" fill="url(#pirate-island-glow)"/>
    <ellipse cx="308" cy="88" rx="26" ry="9" fill="#ffc933" stroke="${GOLD_D}" stroke-width="2.4"/>
    <g fill="${GOLD}" stroke="${GOLD_D}" stroke-width="1.8"><ellipse cx="296" cy="84" rx="7" ry="4.5"/><ellipse cx="310" cy="81" rx="7" ry="4.5"/><ellipse cx="322" cy="85" rx="7" ry="4.5"/><ellipse cx="303" cy="90" rx="7" ry="4.5"/><ellipse cx="316" cy="91" rx="7" ry="4.5"/></g>
    <path d="M280 90 H336 V112 Q336 118 330 118 H286 Q280 118 280 112Z" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="3"/>
    <path d="M280 98 H336" stroke="${WOOD_D}" stroke-width="2.4" opacity=".5"/>
    <rect x="302" y="90" width="12" height="28" fill="#e8a93a" stroke="${GOLD_D}" stroke-width="2.4"/>
    <path d="M268 108 Q290 94 308 98 Q330 92 350 108 Q342 124 308 124 Q276 124 268 108Z" fill="#f8e3a0"/>
    <path d="M278 106 Q292 99 308 101" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
    <path d="M340 50 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2z" fill="#fff" opacity=".95"/>
    <circle cx="284" cy="52" r="2.6" fill="#fff" opacity=".9"/>
  </g>
  <g>
    <rect x="2" y="132" width="76" height="14" rx="3" fill="#c28a52" stroke="${WOOD_D}" stroke-width="2.4"/>
    <path d="M16 133 V145 M30 133 V145 M44 133 V145 M58 133 V145" stroke="${WOOD_D}" stroke-width="2.2" opacity=".6"/>
    <rect x="2" y="146" width="76" height="5" rx="2" fill="${WOOD_D}"/>
    <rect x="6" y="148" width="7" height="22" rx="3" fill="#8a5a2b"/><rect x="66" y="148" width="7" height="22" rx="3" fill="#8a5a2b"/>
    <ellipse cx="9" cy="170" rx="9" ry="3" fill="#ffffff" opacity=".6"/><ellipse cx="69" cy="170" rx="9" ry="3" fill="#ffffff" opacity=".6"/>
  </g>
  ${scallop(372, 138, 0.38, 10)}${spiralShell(96, 150, 0.4, -14)}${starfish(348, 160, 11, 12, '#ff9a5c', '#ffd2a8')}
</svg>`;
