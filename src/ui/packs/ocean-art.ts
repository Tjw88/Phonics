import { mixHex } from '../art';

/** Ocean Reef backdrop and island. Soft, flat, low-contrast; the saturated colour belongs to the creatures. */

const f = (n: number): string => n.toFixed(1);

/** A rounded five-armed starfish with little dots down each arm. */
const starfish = (cx: number, cy: number, R: number, rot: number, fill: string, dot: string): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((rot + i * 36 - 90) * Math.PI) / 180;
    const r = i % 2 === 0 ? R : R * 0.46;
    pts.push(`${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`);
  }
  const dots = Array.from({ length: 5 }, (_, i) => {
    const a = ((rot + i * 72 - 90) * Math.PI) / 180;
    return `<circle cx="${f(cx + R * 0.58 * Math.cos(a))}" cy="${f(cy + R * 0.58 * Math.sin(a))}" r="${f(R * 0.09)}"/><circle cx="${f(cx + R * 0.34 * Math.cos(a))}" cy="${f(cy + R * 0.34 * Math.sin(a))}" r="${f(R * 0.07)}"/>`;
  }).join('');
  return `<g><polygon points="${pts.join(' ')}" fill="${fill}" stroke="${fill}" stroke-width="${f(R * 0.4)}" stroke-linejoin="round"/><g fill="${dot}">${dots}</g></g>`;
};

/** A spiral sea snail shell (origin at its centre). */
const spiralShell = (x: number, y: number, s: number, rot: number, fill = '#fff1dc', line = '#e9b98d'): string =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-22 10 Q-26 -22 2 -26 Q30 -26 28 2 Q26 24 4 24 Q-14 24 -14 6 Q-14 -10 2 -10 Q14 -10 14 2" fill="${fill}" stroke="${line}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M-22 10 Q-30 22 -14 28 Q0 30 4 24" fill="${fill}" stroke="${line}" stroke-width="3.5" stroke-linejoin="round"/><path d="M-12 -14 Q4 -22 18 -12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></g>`;

/** A scallop (fan) shell. */
const scallop = (x: number, y: number, s: number, rot: number, fill = '#ffd6dc', line = '#f0a4b4'): string => {
  const ribs = Array.from({ length: 5 }, (_, i) => { const a = ((-150 + i * 30) * Math.PI) / 180; return `M0 0 L${f(30 * Math.cos(a))} ${f(30 * Math.sin(a))}`; }).join(' ');
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-6 6 L6 6 L10 12 L-10 12Z" fill="${line}"/><path d="M0 6 L-30 -8 Q-34 -34 0 -38 Q34 -34 30 -8Z" fill="${fill}" stroke="${line}" stroke-width="3" stroke-linejoin="round"/><path d="${ribs}" transform="translate(0 6)" stroke="${line}" stroke-width="3" stroke-linecap="round" fill="none"/></g>`;
};

/** Branching coral: a trunk with round-tipped branches (drawn with one stroked path). */
const branchCoral = (x: number, y: number, s: number, c: string, d = ''): string =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0 V-62 M0 -30 L-28 -64 L-30 -94 M-28 -64 L-52 -74 M0 -48 L26 -80 L34 -112 M26 -80 L52 -88 M0 -62 L-4 -100 L8 -128 ${d}"/></g>`;

/** Fan coral: a half circle with ribs. */
const fanCoral = (x: number, y: number, s: number, c: string, rib: string): string => {
  const ribs = Array.from({ length: 7 }, (_, i) => { const a = ((-165 + i * 25) * Math.PI) / 180; return `M0 0 L${f(54 * Math.cos(a))} ${f(54 * Math.sin(a))}`; }).join(' ');
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-8 4 L-10 -4 L10 -4 L8 4Z" fill="${rib}"/><path d="M0 -4 L-62 -30 Q-72 -78 0 -86 Q72 -78 62 -30Z" fill="${c}"/><path d="${ribs}" transform="translate(0 -6)" stroke="${rib}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".75"/></g>`;
};

/** Brain coral: a dome with a few curly grooves. */
const brainCoral = (x: number, y: number, s: number, c: string, groove: string): string =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-54 0 Q-54 -62 0 -62 Q54 -62 54 0Z" fill="${c}"/><g fill="none" stroke="${groove}" stroke-width="4" stroke-linecap="round" opacity=".8"><path d="M-36 -14 Q-28 -30 -18 -20 T-2 -30 T14 -22 T30 -14"/><path d="M-26 -38 Q-14 -50 -4 -42 T14 -46 T26 -34"/><path d="M-42 -4 Q-30 -8 -22 -2 T-4 -6 T14 -2 T40 -6"/></g></g>`;

/** Tube coral: a cluster of rounded tubes. */
const tubeCoral = (x: number, y: number, s: number, c: string, top: string): string =>
  `<g transform="translate(${x} ${y}) scale(${s})">${[[-24, 70, 16], [-6, 96, 17], [14, 62, 15], [30, 82, 14]].map(([dx, h, w]) => `<rect x="${(dx as number) - (w as number) / 2}" y="${-(h as number)}" width="${w}" height="${h}" rx="${(w as number) / 2}" fill="${c}"/><ellipse cx="${dx}" cy="${-(h as number) + 4}" rx="${(w as number) / 2 - 2.5}" ry="4.5" fill="${top}"/>`).join('')}</g>`;

/** A swaying ribbon of kelp, rooted at (x, y). */
const kelp = (x: number, y: number, h: number, c: string, i: number): string => {
  const seg = h / 4;
  const dur = 4.2 + (i % 4) * 0.8;
  return `<path class="oc-sw" style="animation-duration:${dur}s;animation-delay:-${(i * 1.3).toFixed(1)}s" d="M${x} ${y} q-16 ${f(-seg / 2)} 0 ${f(-seg)} t0 ${f(-seg)} t0 ${f(-seg)} t0 ${f(-seg)}" stroke="${c}" stroke-width="${f(13 - (i % 3) * 2)}" fill="none" stroke-linecap="round"/>`;
};

const bubble = (cx: number, cy: number, r: number, i: number): string =>
  `<g class="oc-b" style="animation-delay:-${(i * 1.7).toFixed(1)}s;animation-duration:${(7 + (i % 4) * 1.5).toFixed(1)}s"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff2e" stroke="#ffffffa6" stroke-width="2"/><circle cx="${f(cx - r * 0.35)}" cy="${f(cy - r * 0.35)}" r="${f(r * 0.22)}" fill="#fff" opacity=".8"/></g>`;

const bubbleCluster = (cls: string, cx: number, cy: number, seed: number): string => {
  const dots: [number, number, number][] = [[0, 0, 15], [26, -30, 9], [-18, -44, 11], [12, -70, 7], [-6, -98, 5], [34, 14, 6]];
  return `<g class="cloud ${cls}">${dots.map(([dx, dy, r], i) => `<g class="oc-b" style="animation-delay:-${(seed + i * 1.9).toFixed(1)}s;animation-duration:${(8 + ((seed + i) % 4) * 1.4).toFixed(1)}s"><circle cx="${cx + dx}" cy="${cy + dy}" r="${r}" fill="#ffffff33" stroke="#ffffffb3" stroke-width="2.2"/><circle cx="${f(cx + dx - r * 0.35)}" cy="${f(cy + dy - r * 0.35)}" r="${f(r * 0.22)}" fill="#fff" opacity=".8"/></g>`).join('')}</g>`;
};

const STYLE = `<style>
@keyframes oc-sway { 0%, 100% { transform: rotate(-3.5deg); } 50% { transform: rotate(3.5deg); } }
@keyframes oc-rise { 0% { transform: translateY(0); } 100% { transform: translateY(-120px); } }
#scene-bg .oc-sw, .wt-scene .oc-sw { transform-box: fill-box; transform-origin: 50% 100%; animation: oc-sway 5s ease-in-out infinite; }
#scene-bg .oc-b, .wt-scene .oc-b { animation: oc-rise 9s ease-in infinite; }
/* the world-picker thumbnail is not inside #scene-bg, so keep it to the daytime look */
.wt-scene .sky-night, .wt-scene .moon, .wt-scene .stars { opacity: 0; }
@media (prefers-reduced-motion: reduce) { #scene-bg .oc-sw, #scene-bg .oc-b, .wt-scene .oc-sw, .wt-scene .oc-b { animation: none !important; } }
</style>`;

export const oceanScene = (): string => {
  const haze = '#4fb6d9'; // far shapes melt into the water
  const farCoral = (c: string) => mixHex(c, '#3cc3e2', 0.5);
  const pink = '#ff9fb8', orange = '#ffb072', violet = '#b9a0f6', gold = '#ffd86b', mint = '#74e3c4';
  const stars = [[120, 120], [260, 60], [420, 200], [560, 90], [700, 40], [820, 170], [960, 70], [1100, 150], [1180, 40], [1300, 210], [1440, 100], [1520, 260], [80, 300], [330, 330], [640, 280], [900, 320], [1240, 340], [1480, 400], [180, 480], [520, 440], [760, 470], [1020, 430], [1360, 500], [60, 620], [1540, 620], [300, 560], [1180, 580]]
    .map(([x, y], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="${i % 4 === 0 ? '#c8ffe9' : '#bff3ff'}"/>`).join('');
  const beams = Array.from({ length: 10 }, (_, i) => `<path d="M-13 -48 L-60 -480 L60 -480 L13 -48Z" fill="url(#ocean-beam)" transform="rotate(${i * 36})"/>`).join('');
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  ${STYLE}
  <defs>
    <linearGradient id="ocean-wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ff3ec"/><stop offset="0.38" stop-color="#46cde4"/><stop offset="0.75" stop-color="#25a2da"/><stop offset="1" stop-color="#1778c0"/></linearGradient>
    <linearGradient id="ocean-wn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b3a78"/><stop offset="0.6" stop-color="#0a2a62"/><stop offset="1" stop-color="#061a45"/></linearGradient>
    <linearGradient id="ocean-beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".2"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
    <radialGradient id="ocean-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff9d6" stop-opacity=".95"/><stop offset="0.35" stop-color="#fff2a8" stop-opacity=".45"/><stop offset="1" stop-color="#fff2a8" stop-opacity="0"/></radialGradient>
    <radialGradient id="ocean-mglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#dff4ff" stop-opacity=".7"/><stop offset="1" stop-color="#dff4ff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect class="sky-day" width="1600" height="900" fill="url(#ocean-wd)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#ocean-wn)"/>
  <g class="sun">
    <g transform="translate(1290 86)"><g class="rays">${beams}</g><circle r="150" fill="url(#ocean-glow)"/><circle r="42" fill="#fff6bd"/><circle r="30" fill="#fffbe3"/></g>
    <g fill="#ffffff" opacity=".16"><path d="M120 0 L260 0 L120 520Z"/><path d="M360 0 L440 0 L300 460Z"/><path d="M700 0 L760 0 L640 380Z"/></g>
  </g>
  <g class="moon"><circle cx="1290" cy="96" r="120" fill="url(#ocean-mglow)"/><circle cx="1290" cy="96" r="40" fill="#eaf6ff"/><circle cx="1276" cy="84" r="8" fill="#cfe6f7"/><circle cx="1304" cy="108" r="5" fill="#cfe6f7"/></g>
  <g class="stars">${stars}</g>
  ${bubbleCluster('c1', 140, 640, 1)}
  ${bubbleCluster('c2', 260, 420, 4)}
  ${bubbleCluster('c3', 80, 250, 7)}
  <g class="scenery">
    <!-- distant landmarks, melting into the water: a rock arch on the left, a sunken ship on the right -->
    <path fill-rule="evenodd" d="M-30 760 L-30 470 Q-20 372 100 362 Q222 358 276 430 Q324 500 334 620 L344 760Z M72 760 L72 574 Q80 476 150 470 Q222 476 238 574 L246 760Z" fill="${haze}" opacity=".7"/>
    <path d="M-30 470 Q-20 372 100 362 Q222 358 276 430" stroke="#ffffff" stroke-width="6" fill="none" opacity=".16" stroke-linecap="round"/>
    <g opacity=".78" transform="rotate(-9 1380 650)">
      <rect x="1318" y="420" width="12" height="230" rx="5" fill="${haze}"/><rect x="1418" y="462" width="12" height="190" rx="5" fill="${haze}"/>
      <rect x="1290" y="470" width="86" height="10" rx="5" fill="${haze}"/>
      <path d="M1330 436 Q1380 460 1372 520 L1330 520Z" fill="${mixHex(haze, '#ffffff', 0.18)}"/>
      <path d="M1178 612 L1540 612 Q1520 704 1420 716 L1300 716 Q1196 704 1178 612Z" fill="${haze}"/>
      <path d="M1178 612 L1540 612" stroke="${mixHex(haze, '#ffffff', 0.25)}" stroke-width="10" stroke-linecap="round"/>
      <g fill="${mixHex(haze, '#1778c0', 0.45)}"><circle cx="1260" cy="660" r="14"/><circle cx="1320" cy="664" r="14"/><circle cx="1380" cy="664" r="14"/><circle cx="1440" cy="660" r="14"/></g>
    </g>
    <!-- far reef: soft mounds -->
    <path d="M0 700 Q160 640 320 690 T640 680 T960 690 T1280 676 T1600 690 V900 H0Z" fill="${mixHex('#3ab7d6', '#25a2da', 0.4)}"/>
    <g>${branchCoral(60, 700, 0.9, farCoral(pink))}${branchCoral(1500, 700, 1, farCoral(violet))}${fanCoral(380, 700, 0.9, farCoral(orange), farCoral('#ff7f6e'))}${tubeCoral(1250, 704, 0.9, farCoral(gold), farCoral('#fff1a8'))}${brainCoral(1450, 706, 0.8, farCoral(mint), farCoral('#2fb8a0'))}</g>
    <!-- mid reef, with the coral gardens at the two edges -->
    <path d="M0 760 Q220 704 440 752 T880 760 T1320 744 T1600 752 V900 H0Z" fill="#eadcae"/>
    <g>
      ${tubeCoral(86, 770, 1.15, '#ff8fa8', '#ffc4d2')}${branchCoral(170, 776, 1.1, orange)}${fanCoral(266, 776, 1, violet, '#8f74e0')}${brainCoral(26, 784, 0.9, gold, '#e5a92b')}
      ${branchCoral(1524, 780, 1.15, pink)}${brainCoral(1410, 790, 1.05, mint, '#2fb8a0')}${fanCoral(1316, 780, 0.95, orange, '#f08a4a')}${tubeCoral(1230, 790, 0.9, violet, '#d9c9ff')}
    </g>
    <!-- sandy bottom -->
    <path d="M0 800 Q300 770 620 806 T1260 802 T1600 790 V900 H0Z" fill="#f2e3b3"/>
    <path d="M0 850 Q360 822 760 852 T1600 842 V900 H0Z" fill="#f8edc6"/>
    <g fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".5"><path d="M220 840 q30 -10 60 0"/><path d="M560 870 q36 -10 72 0"/><path d="M980 856 q30 -10 60 0"/><path d="M1280 872 q34 -10 68 0"/><path d="M60 880 q26 -8 52 0"/></g>
    <!-- kelp that sways -->
    <g>${[[330, 800, 190], [352, 806, 140], [1236, 800, 170], [1262, 806, 210], [1190, 808, 120], [20, 800, 150], [1580, 800, 170]].map(([x, y, h], i) => kelp(x as number, y as number, h as number, i % 2 ? '#52c98e' : '#3dbd84', i)).join('')}</g>
    <!-- treasures on the sand -->
    ${starfish(210, 842, 30, 10, '#ff9a5c', '#ffd2a8')}${starfish(1390, 862, 26, -14, '#ff8fa3', '#ffd0d8')}${starfish(790, 884, 18, 24, '#ffb86b', '#ffe3bf')}
    ${spiralShell(120, 868, 0.8, -18)}${scallop(1480, 842, 0.8, 8)}${scallop(470, 876, 0.55, -10)}${spiralShell(1100, 880, 0.55, 20)}
    <g fill="#ffffff" opacity=".6"><circle cx="40" cy="850" r="4"/><circle cx="64" cy="868" r="3"/><circle cx="1540" cy="876" r="4"/><circle cx="1210" cy="858" r="3"/><circle cx="660" cy="866" r="3"/></g>
    <!-- bubbles from the sand -->
    ${bubble(1330, 640, 7, 2)}${bubble(1346, 600, 5, 5)}${bubble(1322, 566, 9, 8)}${bubble(150, 600, 6, 3)}${bubble(166, 556, 8, 6)}
  </g>
</svg>`;
};

export const oceanIsland = (): string => `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="200" cy="172" rx="192" ry="16" fill="#0d5f98" opacity=".28"/>
  <path d="M16 134 Q26 84 120 80 L280 80 Q374 84 384 134 Q384 172 200 174 Q16 172 16 134Z" fill="#e6c987"/>
  <path d="M34 118 Q52 72 130 70 L270 70 Q348 72 366 118 Q300 100 200 100 Q100 100 34 118Z" fill="#f6e6ae"/>
  <path d="M60 128 q20 -6 40 0 M290 132 q22 -6 44 0 M150 146 q26 -7 52 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>
  <g>${tubeCoral(330, 96, 0.85, '#ff8fa8', '#ffc4d2')}${branchCoral(300, 100, 0.62, '#ffb072')}${fanCoral(62, 98, 0.62, '#b9a0f6', '#8f74e0')}</g>
  ${starfish(350, 134, 17, 12, '#ff9a5c', '#ffd2a8')}
  ${spiralShell(46, 134, 0.62, -14)}
  ${scallop(112, 90, 0.4, 0)}
  <g fill="#ffffff2e" stroke="#ffffffb3" stroke-width="2"><circle cx="318" cy="30" r="6"/><circle cx="332" cy="14" r="4"/><circle cx="306" cy="12" r="3.4"/><circle cx="76" cy="38" r="5"/><circle cx="86" cy="20" r="3.4"/></g>
</svg>`;
