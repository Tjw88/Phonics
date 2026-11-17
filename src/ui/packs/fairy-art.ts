import { mixHex } from '../art';

// Fairy Garden: the flower-bud arrival, the dreamy ground-level garden backdrop and the home island. Calm, flat, light tints (see PACK_BRIEF).
// All ids and classes are prefixed `fairy`. Night: the sky changes, the scenery is dimmed by the app, and `scenery-glow` (fireflies and lit
// toadstool windows) fades in on top.

const f1 = (n: number): string => n.toFixed(1);
const rad = (d: number): number => (d * Math.PI) / 180;
/** tiny deterministic random so the art never changes between renders */
const rng = (seed: number): (() => number) => {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
};

const STEM = '#6cc58a', STEM_D = '#4fa870', LEAF = '#86d7a0', LEAF_D = '#62bd82';

// ------------------------------------------------------------------ the arrival: a closed flower bud on a short stem with a sparkle
export const fairyBudSVG = (id: string, main: string, dark: string, accent: string): string => {
  const light = mixHex(main, '#ffffff', 0.5);
  const side = mixHex(main, dark, 0.45);
  const sideEdge = mixHex(dark, '#000000', 0.15);
  const mirror = (d: string): string => `<path d="${d}" transform="translate(120 0) scale(-1 1)"/>`;
  const leftPetal = 'M60 106 C28 106 20 66 32 42 C38 30 48 22 55 12 C60 34 62 66 60 106Z';
  const star = (x: number, y: number, r: number, fill: string, stroke: string): string => {
    const pts = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = rad(i * 45 - 90); const rr = i % 2 ? r * 0.32 : r; return `${f1(x + rr * Math.cos(a))} ${f1(y + rr * Math.sin(a))}`; });
    return `<path d="M${pts.join(' L')}Z" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>`;
  };
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="fairy-bud-${id}-g" x1="0.15" y1="0" x2="0.85" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${main}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="142" rx="44" ry="6" fill="#0000002b"/>
  <path d="M18 140 Q22 124 60 122 Q98 124 102 140 Q60 148 18 140Z" fill="#8fdca0"/><path d="M26 138 Q60 130 94 138" stroke="#b6f0c2" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
  <path d="M60 128 C58 118 62 112 60 102" stroke="${STEM}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M60 126 C40 128 26 118 22 102 C42 104 56 112 60 126Z" fill="${LEAF}"/><path d="M60 126 C80 128 94 118 98 102 C78 104 64 112 60 126Z" fill="${LEAF_D}"/>
  <path d="M58 124 C46 118 36 112 28 106" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>
  <g fill="${side}" stroke="${sideEdge}" stroke-opacity=".35" stroke-width="2" stroke-linejoin="round"><path d="${leftPetal}"/>${mirror(leftPetal)}</g>
  <path d="M60 110 C38 108 34 70 48 42 C53 32 57 22 60 8 C63 22 67 32 72 42 C86 70 82 108 60 110Z" fill="url(#fairy-bud-${id}-g)" stroke="${sideEdge}" stroke-opacity=".4" stroke-width="2" stroke-linejoin="round"/>
  <path d="M60 18 V98 M60 60 C52 56 48 50 47 44 M60 60 C68 56 72 50 73 44" stroke="${dark}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".3"/>
  <ellipse cx="48" cy="48" rx="5" ry="14" fill="#fff" opacity=".6" transform="rotate(14 48 48)"/><ellipse cx="45" cy="68" rx="2.2" ry="4" fill="#fff" opacity=".7"/>
  <path d="M60 112 C48 112 40 106 38 96 C48 98 56 102 60 112Z" fill="${STEM_D}"/><path d="M60 112 C72 112 80 106 82 96 C72 98 64 102 60 112Z" fill="${STEM}"/>
  <path d="M86 108 C86 103 90 99 90 99 C90 99 94 103 94 108 A4 4 0 0 1 86 108Z" fill="#d6f1ff" stroke="#8fcfe8" stroke-width="1.4"/><ellipse cx="89" cy="107" rx="1.2" ry="1.8" fill="#fff"/>
  ${star(97, 30, 14, accent, mixHex(accent, '#b06a00', 0.45))}${star(98, 30, 5, '#ffffff', 'none')}
  <circle cx="110" cy="52" r="3.2" fill="${accent}"/><circle cx="84" cy="14" r="2.6" fill="${accent}"/><circle cx="106" cy="14" r="1.8" fill="#fff"/>
</svg>`;
};

// ------------------------------------------------------------------ small building blocks
/** a teardrop of dew with a highlight; (x, y) is the middle of the drop */
const dew = (x: number, y: number, s = 1): string => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M0 -11 C7 -3 9 3 9 5 A9 9 0 0 1 -9 5 C-9 3 -7 -3 0 -11Z" fill="#d9f3ff" fill-opacity=".92" stroke="#8fcfe8" stroke-width="1.6"/><ellipse cx="-3" cy="2" rx="2" ry="3.4" fill="#fff" transform="rotate(18 -3 2)"/></g>`;

/** tall blades of grass, a tuft from x spreading `spread` either side, base on y */
const grass = (x: number, y: number, n: number, h: number, spread: number, seed: number, cols = [LEAF, LEAF_D, '#9ae3b2']): string => {
  const r = rng(seed);
  let o = '';
  for (let i = 0; i < n; i++) {
    const bx = x + (r() - 0.5) * 2 * spread;
    const hh = h * (0.55 + r() * 0.45);
    const lean = (bx - x) * 0.5 + (r() - 0.5) * 24;
    const w = 5 + r() * 4;
    o += `<path d="M${f1(bx - w)} ${y} Q${f1(bx - w * 0.3 + lean * 0.3)} ${f1(y - hh * 0.6)} ${f1(bx + lean)} ${f1(y - hh)} Q${f1(bx + w * 0.7 + lean * 0.5)} ${f1(y - hh * 0.5)} ${f1(bx + w)} ${y}Z" fill="${cols[i % cols.length]}"/>`;
  }
  return o;
};

/** a big daisy; (cx, cy) the middle, R the overall radius */
const daisy = (cx: number, cy: number, R: number, petal: string, edge: string, middle = '#ffd36b', n = 12): string => {
  let o = '';
  for (let i = 0; i < n; i++) o += `<ellipse cx="0" cy="${f1(-R * 0.64)}" rx="${f1(R * 0.22)}" ry="${f1(R * 0.38)}" transform="rotate(${f1((i * 360) / n)})"/>`;
  return `<g transform="translate(${f1(cx)} ${f1(cy)})"><g fill="${edge}" transform="rotate(${f1(180 / n)})">${o}</g><g fill="${petal}">${o}</g>
    <circle r="${f1(R * 0.36)}" fill="${mixHex(middle, '#c88a1a', 0.35)}"/><circle r="${f1(R * 0.32)}" fill="${middle}"/><circle cx="${f1(-R * 0.1)}" cy="${f1(-R * 0.1)}" r="${f1(R * 0.12)}" fill="#fff" opacity=".45"/>
    ${[[0.12, 0.1], [-0.08, 0.16], [0.16, -0.06], [-0.14, 0.02]].map(([a, b]) => `<circle cx="${f1(R * a!)}" cy="${f1(R * b!)}" r="${f1(R * 0.035)}" fill="${mixHex(middle, '#c88a1a', 0.6)}"/>`).join('')}</g>`;
};

/** a tulip cup (cx, cy = middle of the cup), w its width */
const tulip = (cx: number, cy: number, w: number, c: string, cd: string): string => `<g transform="translate(${f1(cx)} ${f1(cy)}) scale(${f1(w / 100)})">
  <path d="M0 52 C-40 52 -50 6 -36 -26 C-28 -42 -14 -52 -4 -70 C0 -44 2 -10 0 52Z" fill="${cd}"/><path d="M0 52 C40 52 50 6 36 -26 C28 -42 14 -52 4 -70 C0 -44 -2 -10 0 52Z" fill="${cd}"/>
  <path d="M0 56 C-30 54 -36 14 -22 -22 C-16 -38 -8 -50 0 -72 C8 -50 16 -38 22 -22 C36 14 30 54 0 56Z" fill="${c}"/><ellipse cx="-12" cy="-14" rx="6" ry="20" fill="#fff" opacity=".4" transform="rotate(12 -12 -14)"/></g>`;

/** a hanging bell flower, the stem joins at (cx, cy - 22 s) */
const bell = (cx: number, cy: number, s: number, c: string, cd: string): string => `<g transform="translate(${f1(cx)} ${f1(cy)}) scale(${s})">
  <path d="M-16 -22 C-20 6 -26 20 -32 30 Q-16 40 0 34 Q16 40 32 30 C26 20 20 6 16 -22 Q0 -34 -16 -22Z" fill="${c}"/><path d="M6 -26 C14 -22 18 -8 20 8 C22 20 28 26 32 30 Q22 36 12 34 C16 20 10 -6 6 -26Z" fill="${cd}" opacity=".55"/>
  <path d="M-32 30 Q-16 42 0 34 Q16 42 32 30" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/><ellipse cx="-9" cy="-6" rx="3.5" ry="12" fill="#fff" opacity=".5" transform="rotate(8 -9 -6)"/></g>`;

/** a big curved leaf from (x, y) pointing in direction `deg` (0 = right), length L */
const leaf = (x: number, y: number, L: number, deg: number, c = LEAF, cd = LEAF_D): string => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${deg})"><path d="M0 0 C${f1(L * 0.25)} ${f1(-L * 0.3)} ${f1(L * 0.7)} ${f1(-L * 0.28)} ${f1(L)} 0 C${f1(L * 0.7)} ${f1(L * 0.22)} ${f1(L * 0.25)} ${f1(L * 0.2)} 0 0Z" fill="${c}"/><path d="M0 0 C${f1(L * 0.3)} ${f1(L * 0.04)} ${f1(L * 0.7)} ${f1(L * 0.02)} ${f1(L)} 0 C${f1(L * 0.7)} ${f1(L * 0.22)} ${f1(L * 0.25)} ${f1(L * 0.2)} 0 0Z" fill="${cd}" opacity=".5"/><path d="M${f1(L * 0.04)} ${f1(L * 0.01)} Q${f1(L * 0.5)} ${f1(-L * 0.04)} ${f1(L * 0.94)} 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/></g>`;

const stem = (d: string, w = 12): string => `<path d="${d}" stroke="${STEM_D}" stroke-width="${w + 4}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${STEM}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;

interface House { art: string; glow: string }
/** a spotted toadstool house with a tiny round door, base-centre at (tx, ty) */
const toad = (tx: number, ty: number, s: number, cap: string, capD: string, lit = true): House => {
  const stalk = '#fff4e4', stalkD = '#f0dcc2';
  const art = `<g transform="translate(${f1(tx)} ${f1(ty)}) scale(${s})">
    <ellipse cx="0" cy="3" rx="46" ry="6" fill="#00000016"/>
    <path d="M-17 -44 C-18 -24 -26 -8 -25 2 Q0 9 25 2 C26 -8 18 -24 17 -44Z" fill="${stalk}"/>
    <path d="M7 -44 C10 -24 14 -8 17 4 Q22 4 25 2 C26 -8 18 -24 17 -44Z" fill="${stalkD}"/>
    <circle cx="0" cy="-13" r="10" fill="#c58a62"/><circle cx="0" cy="-13" r="7.2" fill="#e0a77f"/><path d="M-7 -13 H7 M0 -20 V-6" stroke="#b07548" stroke-width="1.4" opacity=".6"/><circle cx="4" cy="-12" r="1.5" fill="#fff0c8"/>
    <ellipse cx="0" cy="3.5" rx="12" ry="2.6" fill="#d9c7a8"/>
    <path d="M-58 -46 C-58 -98 58 -98 58 -46 Q0 -33 -58 -46Z" fill="${cap}"/>
    <path d="M26 -88 C46 -78 58 -64 58 -46 Q38 -38 18 -37Z" fill="${capD}" opacity=".55"/>
    <path d="M-58 -46 Q0 -33 58 -46 Q40 -30 0 -29 Q-40 -30 -58 -46Z" fill="${mixHex(cap, '#ffffff', 0.55)}"/>
    <path d="M-44 -58 Q-34 -80 -12 -86" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".45"/>
    <circle cx="-36" cy="-58" r="8" fill="#fff"/><circle cx="35" cy="-58" r="7" fill="#fff" opacity=".95"/><circle cx="-21" cy="-79" r="5.4" fill="#fff"/><circle cx="23" cy="-78" r="5.6" fill="#fff" opacity=".95"/>
    <circle cx="0" cy="-63" r="8.2" fill="#fff4e4"/><circle cx="0" cy="-63" r="5.6" fill="#8eb4d8"/><path d="M-5.6 -63 H5.6 M0 -68.6 V-57.4" stroke="#fff4e4" stroke-width="1.6"/>
    <circle cx="-12.5" cy="-27" r="4.2" fill="#8eb4d8"/><circle cx="12.5" cy="-27" r="4.2" fill="#8eb4d8"/>
  </g>`;
  const g = (x: number, y: number, r: number): string => `<circle cx="${f1(tx + x * s)}" cy="${f1(ty + y * s)}" r="${f1(r * s * 2.4)}" fill="#ffe27a" opacity=".22"/><circle cx="${f1(tx + x * s)}" cy="${f1(ty + y * s)}" r="${f1(r * s)}" fill="#ffe58a"/>`;
  return { art, glow: lit ? g(0, -63, 5.6) + g(-12.5, -27, 4.2) + g(12.5, -27, 4.2) + `<circle cx="${f1(tx)}" cy="${f1(ty - 13 * s)}" r="${f1(7.2 * s)}" fill="#ffd36b" opacity=".85"/>` : '' };
};

/** a lily pad with a notch; (x, y) the middle */
const pad = (x: number, y: number, rx: number, rot = 0, c = '#7fd69c'): string => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${rot})"><ellipse cx="0" cy="3" rx="${f1(rx)}" ry="${f1(rx * 0.34)}" fill="#4fa870" opacity=".55"/><path d="M0 0 L${f1(rx * 0.96)} ${f1(-rx * 0.06)} A${f1(rx)} ${f1(rx * 0.36)} 0 1 1 ${f1(rx * 0.9)} ${f1(rx * 0.12)}Z" fill="${c}"/><path d="M0 0 L${f1(-rx * 0.7)} ${f1(-rx * 0.1)} M0 0 L${f1(-rx * 0.4)} ${f1(rx * 0.3)} M0 0 L${f1(rx * 0.1)} ${f1(rx * 0.34)}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".45"/></g>`;

const lotus = (x: number, y: number, s: number): string => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${[-50, -25, 25, 50].map((a) => `<ellipse cx="0" cy="-12" rx="6" ry="13" fill="#ffb6d8" transform="rotate(${a})"/>`).join('')}<ellipse cx="0" cy="-14" rx="6.5" ry="15" fill="#ffd0e8"/><ellipse cx="-2" cy="-17" rx="1.8" ry="6" fill="#fff" opacity=".7"/><circle cx="0" cy="-2" r="3" fill="#ffd36b"/></g>`;

const butterfly = (x: number, y: number, s: number, c1: string, c2: string, rot = 0): string => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})"><g class="fairy-bf">
  <g class="fairy-wl"><ellipse cx="-11" cy="-8" rx="12" ry="9" transform="rotate(-24 -11 -8)" fill="${c1}"/><ellipse cx="-9" cy="8" rx="8" ry="6.5" transform="rotate(20 -9 8)" fill="${c2}"/><circle cx="-14" cy="-9" r="2.6" fill="#fff" opacity=".7"/></g>
  <g class="fairy-wr"><ellipse cx="11" cy="-8" rx="12" ry="9" transform="rotate(24 11 -8)" fill="${c1}"/><ellipse cx="9" cy="8" rx="8" ry="6.5" transform="rotate(-20 9 8)" fill="${c2}"/><circle cx="14" cy="-9" r="2.6" fill="#fff" opacity=".7"/></g></g>
  <rect x="-1.8" y="-9" width="3.6" height="19" rx="1.8" fill="#7a5a8a"/><path d="M-1 -9 Q-5 -17 -9 -18 M1 -9 Q5 -17 9 -18" stroke="#7a5a8a" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`;

const smallShroom = (x: number, y: number, s: number, cap: string, spots = true): string => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><ellipse cx="0" cy="2" rx="16" ry="3" fill="#00000014"/><path d="M-6 -14 Q-7 -2 -9 2 Q0 5 9 2 Q7 -2 6 -14Z" fill="#fff4e4"/><path d="M-20 -14 C-20 -40 20 -40 20 -14 Q0 -8 -20 -14Z" fill="${cap}"/>${spots ? '<circle cx="-8" cy="-24" r="3.4" fill="#fff"/><circle cx="7" cy="-26" r="2.8" fill="#fff"/><circle cx="1" cy="-17" r="2.2" fill="#fff"/>' : ''}</g>`;

const hillPath = (fn: (x: number) => number, step = 20): string => {
  let d = `M0 ${f1(fn(0))}`;
  for (let x = step; x <= 1600; x += step) d += ` L${x} ${f1(fn(x))}`;
  return `${d} V900 H0Z`;
};

// ------------------------------------------------------------------ the backdrop
export const fairySceneSVG = (): string => {
  const farHill = (x: number): number => 548 - 54 * Math.sin(Math.PI * Math.min(1, Math.max(0, (x - 40) / 1520))) ** 0.7 + 10 * Math.sin(x / 150);
  const midHill = (x: number): number => 600 - 62 * Math.sin(Math.PI * (x / 1600)) ** 0.8 + 6 * Math.sin(x / 120 + 1);
  const front = (x: number): number => 706 - 26 * Math.sin(Math.PI * (x / 1600)) + 8 * Math.sin(x / 170);
  const baseY = (x: number): number => midHill(x) + 12;

  // the ring of toadstool houses: big at the front corners, smaller and higher round the back of the hill
  const caps: [string, string][] = [['#ff7f9a', '#d94f78'], ['#c7a2f0', '#9a72cf'], ['#ff9a73', '#d9684a'], ['#ff7f9a', '#d94f78'], ['#b8a3f5', '#8c78d6'], ['#ff8fae', '#d9577f']];
  const plan: [number, number, number][] = [ // x, scale, cap index
    [215, 1.7, 0], [346, 0.88, 1], [500, 0.7, 2], [670, 0.56, 3], [930, 0.54, 4], [1100, 0.66, 0], [1264, 0.86, 2], [1385, 1.7, 1],
  ];
  const houses = plan.map(([x, s, c]) => toad(x, baseY(x) + (s > 1 ? 28 : 0), s, caps[c]![0], caps[c]![1]));

  const rays = Array.from({ length: 12 }, (_, i) => `<rect x="-4" y="-92" width="8" height="24" rx="4" fill="#ffe9a8" transform="rotate(${i * 30})"/>`).join('');
  const stars = [[140, 80, 4], [420, 160, 3], [700, 70, 4], [980, 140, 3], [1180, 56, 3], [260, 250, 3], [840, 230, 4], [560, 310, 3], [1450, 300, 3], [60, 320, 3], [1020, 40, 3], [330, 50, 3], [1500, 120, 3], [640, 190, 3]]
    .map(([x, y, r], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`).join('');

  // fireflies for the night glow
  const fr = rng(7);
  const flies = [[90, 470], [300, 640], [470, 760], [640, 700], [860, 790], [1010, 730], [1190, 770], [1360, 660], [1500, 600], [1540, 760], [70, 740], [250, 560], [1110, 590], [760, 590], [520, 590], [1300, 520]]
    .map(([x, y]) => `<g class="fairy-ff" style="animation-delay:${f1(fr() * -6)}s"><circle cx="${x}" cy="${y}" r="34" fill="url(#fairy-ff-glow)"/><circle cx="${x}" cy="${y}" r="5" fill="#fffbc4"/></g>`).join('');

  const lawnFar = `<path d="${hillPath(farHill)}" fill="#dccdf6"/>`;
  const farDecor = `${[[110, 8], [250, 14], [1330, 12], [1500, 8]].map(([x, h]) => `<g opacity=".9"><path d="M${x} ${farHill(x!) + 6} V${farHill(x!) - 70 - h!}" stroke="#bfe3cc" stroke-width="6" stroke-linecap="round"/>${daisy(x!, farHill(x!) - 78 - h!, 26, '#f3e3ff', '#d8c3f3', '#ffe08a')}</g>`).join('')}`;

  const leftFlowers = `
    ${stem('M92 900 C70 760 150 640 170 470 C176 420 180 390 184 372', 14)}
    ${leaf(104, 760, 96, -158)}${leaf(128, 660, 78, -30, LEAF_D, STEM_D)}
    ${daisy(190, 330, 84, '#ffc2e0', '#f08cbc', '#ffd36b')}${dew(150, 300, 1.1)}${dew(242, 376, 0.8)}
    ${stem('M30 900 C 8 800 30 700 76 640 C102 604 110 590 104 574', 10)}${bell(104, 600, 0.9, '#d2b6f8', '#a982e3')}${dew(104, 640, 0.8)}${leaf(34, 840, 70, -135, LEAF, LEAF_D)}`;
  const rightFlowers = `
    ${stem('M1500 900 C1520 780 1420 640 1418 470 C1418 420 1416 392 1412 374', 14)}
    ${leaf(1496, 780, 92, -26, LEAF, LEAF_D)}${leaf(1450, 640, 74, -150, LEAF_D, STEM_D)}
    ${tulip(1412, 322, 112, '#ffa9cb', '#ec7fae')}${dew(1384, 330, 0.9)}
    ${stem('M1568 900 C1586 800 1570 720 1534 650 C1520 626 1514 612 1516 594', 10)}${daisy(1536, 560, 52, '#d9c2fb', '#b799ee', '#ffe08a')}${leaf(1556, 800, 66, -40)}${dew(1566, 590, 0.7)}`;

  const edgeGrass = `${grass(60, 900, 22, 190, 78, 11)}${grass(1540, 900, 22, 200, 80, 23)}${grass(250, 900, 10, 100, 50, 5, [LEAF_D, '#9ae3b2', LEAF])}${grass(1370, 900, 10, 110, 50, 17, [LEAF_D, '#9ae3b2', LEAF])}`;

  const bridge = `<g transform="translate(1248 890) scale(0.9)">
    <ellipse cx="0" cy="12" rx="90" ry="9" fill="#4a86a8" opacity=".3"/>
    <path d="M-92 4 C-70 -56 70 -56 92 4 C60 -22 -60 -22 -92 4Z" fill="${LEAF_D}"/>
    <path d="M-92 2 C-70 -62 70 -62 92 2 C66 -34 -66 -34 -92 2Z" fill="#8fe0a8"/>
    <path d="M-84 -2 C-60 -48 60 -48 84 -2" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>
    <path d="M-60 -20 L-52 -38 M-30 -34 L-26 -50 M0 -38 V-54 M30 -34 L26 -50 M60 -20 L52 -38" stroke="${LEAF_D}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    ${[-90, 90].map((x) => `<g transform="translate(${x} 4)"><path d="M-8 0 Q-9 -16 -4 -24 H4 Q9 -16 8 0Z" fill="#c9a37a"/><path d="M-10 -22 Q0 -34 10 -22Z" fill="#a97b52"/><path d="M0 -34 V-40" stroke="#a97b52" stroke-width="2.4" stroke-linecap="round"/></g>`).join('')}
    ${dew(-34, -42, 0.6)}</g>`;

  const water = `<path d="M330 900 C320 858 440 824 660 820 C880 816 1010 826 1090 846 C1110 856 1116 880 1112 900Z" fill="#9fd6ee"/>
    <path d="M1168 800 C1200 792 1280 792 1312 800 C1330 840 1352 880 1366 900 H1126 C1140 870 1156 830 1168 800Z" fill="#9fd6ee"/>
    <path d="M350 888 C420 846 600 836 800 836 C940 836 1040 846 1090 862" fill="none" stroke="#c7ebf8" stroke-width="10" stroke-linecap="round" opacity=".6"/>
    <path d="M1220 818 q30 -6 60 0 M1190 850 q20 -5 40 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M500 868 q18 -7 36 0 M780 850 q16 -6 32 0 M930 872 q20 -7 40 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/>
    ${pad(430, 880, 40, -10)}${pad(580, 852, 30, 24, '#8fdca8')}${pad(700, 884, 46, 8)}${pad(860, 858, 34, -18, '#8fdca8')}${pad(980, 886, 42, 30)}${pad(1050, 858, 24, -8, '#8fdca8')}
    ${lotus(700, 876, 0.9)}${lotus(980, 878, 0.7)}${dew(560, 842, 0.5)}`;

  const banks = `<ellipse cx="1160" cy="896" rx="44" ry="14" fill="#8fdca0"/><ellipse cx="1338" cy="896" rx="44" ry="14" fill="#8fdca0"/>${smallShroom(300, 872, 0.9, '#c7a2f0')}${smallShroom(1124, 884, 0.7, '#ff9a73')}`;

  const butterflies = `${butterfly(232, 470, 1.3, '#ffb3d6', '#ffd9ec', -10)}${butterfly(1372, 540, 1.2, '#c9b0f5', '#e4d6fb', 12)}${butterfly(70, 250, 1, '#ffd98a', '#fff0c4', 8)}${butterfly(1180, 96, 1, '#ffb3d6', '#ffd9ec', -14)}${butterfly(620, 96, 0.9, '#b6ecd0', '#dff8ea', 6)}`;

  const meadowDecor = `${smallShroom(60, 770, 1.1, '#ff8fae')}${smallShroom(100, 784, 0.8, '#c7a2f0')}${smallShroom(1540, 780, 1.1, '#c7a2f0')}${smallShroom(1496, 796, 0.8, '#ff9a73')}
    ${[[330, 760], [380, 790], [1210, 770], [1300, 760]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><path d="M0 0 v12" stroke="${STEM}" stroke-width="2.4" stroke-linecap="round"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${f1(5 * Math.cos(rad(a)))}" cy="${f1(5 * Math.sin(rad(a)))}" r="3.6" fill="${i % 2 ? '#fff' : '#ffc6e0'}"/>`).join('')}<circle r="2.8" fill="#ffd36b"/></g>`).join('')}`;

  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="fairy-sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4c9e8"/><stop offset="0.5" stop-color="#e3d6fa"/><stop offset="0.82" stop-color="#d9f1ee"/><stop offset="1" stop-color="#eefaef"/></linearGradient>
    <linearGradient id="fairy-sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150f3d"/><stop offset="0.6" stop-color="#2c2a6e"/><stop offset="1" stop-color="#3f4a8c"/></linearGradient>
    <radialGradient id="fairy-ff-glow"><stop offset="0" stop-color="#fff7a0" stop-opacity=".95"/><stop offset="0.45" stop-color="#e8ff7a" stop-opacity=".35"/><stop offset="1" stop-color="#e8ff7a" stop-opacity="0"/></radialGradient>
    <radialGradient id="fairy-sunglow"><stop offset="0" stop-color="#fff6c8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>
  </defs>
  <style>.wt-scene .sky-night, .wt-scene .moon, .wt-scene .stars { opacity: 0; } #scene-bg .scenery-glow, .wt-scene .scenery-glow { opacity: 0; transition: opacity 1.2s; } body.night #scene-bg .scenery-glow, .night #scene-bg .scenery-glow { opacity: 1; }
  .fairy-ff { animation: fairy-bob 6s ease-in-out infinite; } @keyframes fairy-bob { 0%, 100% { opacity: .55; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-9px); } }
  .fairy-bf .fairy-wl, .fairy-bf .fairy-wr { animation: fairy-flap 1.1s ease-in-out infinite alternate; transform-box: fill-box; } .fairy-bf .fairy-wl { transform-origin: 100% 50%; } .fairy-bf .fairy-wr { transform-origin: 0% 50%; } @keyframes fairy-flap { to { transform: scaleX(.55); } }
  @media (prefers-reduced-motion: reduce) { .fairy-ff, .fairy-bf .fairy-wl, .fairy-bf .fairy-wr { animation: none; } }</style>
  <rect class="sky-day" width="1600" height="900" fill="url(#fairy-sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#fairy-sky-n)"/>
  <g class="sun"><circle cx="1400" cy="112" r="130" fill="url(#fairy-sunglow)"/><g transform="translate(1400 112)"><g class="rays">${rays}</g></g><circle cx="1400" cy="112" r="52" fill="#fff0b0"/><circle cx="1400" cy="112" r="40" fill="#fff8d0"/></g>
  <g class="moon"><circle cx="1400" cy="112" r="48" fill="#fff6d0"/><circle cx="1382" cy="98" r="9" fill="#efe5b8"/><circle cx="1418" cy="130" r="6" fill="#efe5b8"/><circle cx="1412" cy="90" r="5" fill="#efe5b8"/></g>
  <g class="stars" fill="#fff">${stars}</g>
  <g class="cloud c1" fill="#fff" opacity=".85"><ellipse cx="170" cy="130" rx="96" ry="26"/><ellipse cx="222" cy="110" rx="54" ry="30"/><ellipse cx="132" cy="112" rx="46" ry="24"/></g>
  <g class="cloud c2" fill="#ffeef8" opacity=".8"><ellipse cx="860" cy="96" rx="84" ry="22"/><ellipse cx="910" cy="80" rx="46" ry="26"/><ellipse cx="822" cy="84" rx="40" ry="20"/></g>
  <g class="cloud c3" fill="#fff" opacity=".7"><ellipse cx="1080" cy="300" rx="72" ry="20"/><ellipse cx="1120" cy="284" rx="40" ry="22"/><ellipse cx="1050" cy="288" rx="32" ry="15"/></g>
  <g class="scenery">
    ${lawnFar}
    ${farDecor}
    <path d="${hillPath(midHill)}" fill="#bfe8cf"/>
    <path d="${hillPath((x) => midHill(x) + 26)}" fill="#b0e1c2" opacity=".7"/>
    ${houses.map((h) => h.art).join('')}
    <path d="${hillPath(front)}" fill="#a6dfb7"/>
    <path d="${hillPath((x) => front(x) + 56 + 6 * Math.sin(x / 90))}" fill="#92d6a8"/>
    ${meadowDecor}
    ${water}
    ${banks}
    ${bridge}
    ${rightFlowers}
    ${leftFlowers}
    ${edgeGrass}
    ${butterflies}
  </g>
  <g class="scenery-glow">${houses.map((h) => h.glow).join('')}${flies}</g>
</svg>`;
};

// ------------------------------------------------------------------ the home island: a mossy mound with a toadstool house, a flower and a dewdrop
export const fairyIslandSVG = (): string => {
  const house = toad(98, 118, 1.0, '#ff7f9a', '#d94f78');
  const stones = [[112, 126, 7, 3.2], [128, 136, 6, 2.8], [150, 144, 5, 2.4]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#e8dcc8"/>`).join('');
  return `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <defs><linearGradient id="fairy-isle-moss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6ecb6"/><stop offset="1" stop-color="#7fd29a"/></linearGradient></defs>
  <ellipse cx="200" cy="177" rx="192" ry="11" fill="#2f6f5a" opacity=".22"/>
  <path d="M18 120 Q22 170 200 176 Q378 170 382 120Z" fill="#b48a68"/>
  <path d="M34 140 Q70 166 200 168 Q330 166 366 140 Q330 172 200 174 Q70 172 34 140Z" fill="#94694a" opacity=".6"/>
  <path d="M60 150 q-8 8 -4 16 M340 150 q8 8 4 16 M140 158 q-4 8 0 14 M262 158 q4 8 0 14" stroke="#94694a" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>
  <path d="M12 126 Q16 60 130 56 L270 56 Q384 60 388 126 Q388 154 200 156 Q12 154 12 126Z" fill="url(#fairy-isle-moss)"/>
  <path d="M30 114 Q60 76 140 70 L260 70 Q340 76 370 114 Q300 100 200 100 Q100 100 30 114Z" fill="#c4f5cc" opacity=".8"/>
  ${grass(26, 128, 7, 30, 16, 3)}${grass(374, 128, 7, 30, 16, 9)}
  ${stones}
  ${house.art}
  ${smallShroom(214, 108, 0.6, '#c7a2f0')}${smallShroom(256, 104, 0.5, '#ff9a73')}
  ${stem('M324 136 C320 112 328 90 324 66', 7)}${leaf(322, 122, 34, -150)}${leaf(324, 106, 28, -25, LEAF_D, STEM_D)}${daisy(324, 48, 28, '#ffc2e0', '#f08cbc', '#ffd36b', 10)}
  ${dew(354, 132, 0.9)}${dew(298, 100, 0.55)}
  <path d="M356 100 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3z" fill="#fff6b0" stroke="#f0c040" stroke-width="1.4" stroke-linejoin="round"/>
  <circle cx="296" cy="40" r="2.6" fill="#fff6b0"/><circle cx="340" cy="30" r="2" fill="#fff"/>
</svg>`;
};
