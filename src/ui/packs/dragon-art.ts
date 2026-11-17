import { mixHex } from '../art';

// Dragon Castle art: the egg, the full-screen kingdom backdrop and the home island. Flat, soft, low-contrast scenery.
// Every id here starts with "dragon-" so several packs' backdrops can share one page.

const f1 = (n: number): string => (Math.round(n * 10) / 10).toString();

// ------------------------------------------------------------------------------------------------ the egg
/** A glossy dragon egg with rows of little scales, in the creature's colours. */
export const dragonEgg = (id: string, main: string, dark: string, accent: string): string => {
  const light = mixHex(main, '#ffffff', 0.55);
  const shape = 'M60 6 C100 6 112 78 112 98 C112 128 90 142 60 142 C30 142 8 128 8 98 C8 78 20 6 60 6Z';
  let scales = '';
  let row = 0;
  for (let y = 30; y < 150; y += 17, row++) {
    for (let x = row % 2 ? 6 : -5; x < 130; x += 22) {
      scales += `M${x} ${y} Q${x + 11} ${y + 15} ${x + 22} ${y} `;
    }
  }
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="dragon-eg-${id}" cx="34%" cy="26%" r="85%"><stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${main}"/><stop offset="1" stop-color="${dark}"/></radialGradient>
    <clipPath id="dragon-ec-${id}"><path d="${shape}"/></clipPath>
  </defs>
  <ellipse cx="60" cy="142" rx="38" ry="7" fill="#0000002b"/>
  <path d="${shape}" fill="url(#dragon-eg-${id})"/>
  <g clip-path="url(#dragon-ec-${id})">
    <path d="${scales}" fill="none" stroke="${dark}" stroke-opacity=".32" stroke-width="3" stroke-linecap="round"/>
    <path d="M-6 92 Q60 70 126 92 L126 110 Q60 88 -6 110Z" fill="${accent}" opacity=".9"/>
    <circle cx="38" cy="101" r="4" fill="#ffffffcc"/><circle cx="60" cy="97" r="4" fill="#ffffffcc"/><circle cx="82" cy="101" r="4" fill="#ffffffcc"/>
  </g>
  <ellipse cx="38" cy="38" rx="13" ry="22" fill="#ffffff" opacity=".55" transform="rotate(24 38 38)"/><ellipse cx="30" cy="56" rx="4" ry="6" fill="#ffffff" opacity=".7"/>
</svg>`;
};

// ------------------------------------------------------------------------------------------------ castle pieces
const STONE = '#f3ead8';
const STONE_SHADE = '#e0d3bb';
const ROOFS = { keep: '#a58fe0', inner: '#f08ca8', outer: '#7fb0f0' };

/** A round tower with a curved conical roof, centred on cx, standing on y=0. */
const tower = (cx: number, w: number, h: number, roofH: number, roof: string, flag: string): string => {
  const x0 = cx - w / 2;
  const roofDark = mixHex(roof, '#000000', 0.14);
  const tipY = -h - roofH;
  return `<rect x="${f1(x0)}" y="${-h}" width="${w}" height="${h}" fill="${STONE}"/>
    <rect x="${f1(cx + w * 0.16)}" y="${-h}" width="${f1(w * 0.34)}" height="${h}" fill="${STONE_SHADE}"/>
    <rect x="${f1(x0 + w * 0.13)}" y="${-h + 10}" width="${f1(w * 0.09)}" height="${h - 14}" rx="${f1(w * 0.045)}" fill="#fff" opacity=".45"/>
    <rect x="${f1(x0 - 4)}" y="${-h - 2}" width="${w + 8}" height="12" rx="6" fill="${STONE_SHADE}"/>
    <path d="M${f1(x0 - 9)} ${-h + 4} Q${f1(cx - w * 0.14)} ${f1(-h - roofH * 0.34)} ${f1(cx)} ${tipY} Q${f1(cx + w * 0.14)} ${f1(-h - roofH * 0.34)} ${f1(cx + w / 2 + 9)} ${-h + 4}Z" fill="${roof}"/>
    <path d="M${f1(cx)} ${tipY} Q${f1(cx + w * 0.14)} ${f1(-h - roofH * 0.34)} ${f1(cx + w / 2 + 9)} ${-h + 4} L${f1(cx + w * 0.05)} ${-h + 4}Q${f1(cx + w * 0.07)} ${f1(-h - roofH * 0.4)} ${f1(cx)} ${tipY}Z" fill="${roofDark}"/>
    <path d="M${f1(cx - w * 0.2)} ${f1(-h - roofH * 0.3)} Q${f1(cx - w * 0.1)} ${f1(-h - roofH * 0.62)} ${f1(cx - 2)} ${f1(tipY + 12)}" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".4"/>
    <path d="M${f1(cx)} ${tipY} V${tipY - 24}" stroke="#a98d6d" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M${f1(cx + 1)} ${tipY - 24} L${f1(cx + 19)} ${tipY - 18} L${f1(cx + 1)} ${tipY - 11}Z" fill="${flag}"/>`;
};

/** The storybook castle on y=0, centred on x=0. */
const castle = (): string => {
  let crenels = '';
  for (let x = -150; x < 150; x += 30) crenels += `<rect x="${x + 2}" y="-84" width="18" height="16" rx="3" fill="${STONE}"/>`;
  return `<g class="castle">
    <rect x="-150" y="-72" width="300" height="72" fill="${STONE}"/>${crenels}
    <rect x="-150" y="-26" width="300" height="26" fill="${STONE_SHADE}" opacity=".55"/>
    ${tower(-120, 46, 118, 52, ROOFS.outer, '#ffd23f')}
    ${tower(120, 46, 132, 56, ROOFS.outer, '#ff6b6b')}
    ${tower(-68, 40, 158, 64, ROOFS.inner, '#ff6b6b')}
    ${tower(68, 40, 158, 64, ROOFS.inner, '#ffd23f')}
    ${tower(0, 84, 200, 84, ROOFS.keep, '#ff6b6b')}
    <path d="M-19 0 V-34 Q-19 -54 0 -54 Q19 -54 19 -34 V0Z" fill="#c9b99a"/>
    <path d="M-14 0 V-33 Q-14 -49 0 -49 Q14 -49 14 -33 V0Z" fill="#9b6a4f"/>
    <path d="M0 -49 V0 M-7 -44 V0 M7 -44 V0" stroke="#7d5240" stroke-width="2" fill="none"/>
    <circle cx="8" cy="-22" r="2.4" fill="#ffd23f"/>
  </g>`;
};

/** Lit windows, in the castle's own coordinates (drawn outside the scenery group so they stay bright at night). */
const WINDOWS: [number, number][] = [[-17, -128], [17, -128], [-68, -112], [68, -112], [-120, -80], [120, -80]];
const windowPath = (x: number, y: number): string => `M${x - 6} ${y} V${y - 13} Q${x - 6} ${y - 21} ${x} ${y - 21} Q${x + 6} ${y - 21} ${x + 6} ${y - 13} V${y}Z`;
const castleWindows = (): string =>
  WINDOWS.map(([x, y]) => `<circle class="halo" cx="${x}" cy="${y - 10}" r="17" fill="#ffd45a" opacity="0"/>`).join('') +
  WINDOWS.map(([x, y]) => `<path d="${windowPath(x, y)}" fill="#ffe08a" stroke="#cdbfa5" stroke-width="2.5" stroke-linejoin="round"/><path d="M${x} ${y - 21} V${y}M${x - 6} ${y - 9} H${x + 6}" stroke="#cdbfa5" stroke-width="1.6" fill="none"/>`).join('') +
  `<circle cx="0" cy="-176" r="7" fill="#ffe08a" stroke="#cdbfa5" stroke-width="2.5"/>`;

// ------------------------------------------------------------------------------------------------ helpers
/** A smooth ribbon (path, river) along a centre line of [x, y, width] points. */
const ribbon = (pts: [number, number, number][]): string => {
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  pts.forEach(([x, y, w], i) => {
    const a = pts[Math.max(0, i - 1)]!;
    const b = pts[Math.min(pts.length - 1, i + 1)]!;
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    left.push([x - dy * (w / 2), y + dx * (w / 2)]);
    right.push([x + dy * (w / 2), y - dx * (w / 2)]);
  });
  const poly = [...left, ...right.reverse()];
  const mid = (p: [number, number], q: [number, number]): string => `${f1((p[0] + q[0]) / 2)} ${f1((p[1] + q[1]) / 2)}`;
  let d = `M${mid(poly[poly.length - 1]!, poly[0]!)}`;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!, q = poly[(i + 1) % poly.length]!;
    d += ` Q${f1(p[0])} ${f1(p[1])} ${mid(p, q)}`;
  }
  return d + 'Z';
};

const cloud = (cls: string, x: number, y: number, s: number, op: number): string =>
  `<g class="cloud ${cls}" fill="#fff" opacity="${op}"><g transform="translate(${x} ${y}) scale(${s})"><rect x="-74" y="-4" width="148" height="30" rx="15"/><circle cx="-34" cy="-2" r="24"/><circle cx="6" cy="-14" r="32"/><circle cx="44" cy="0" r="22"/></g></g>`;

const lolliTree = (x: number, y: number, s: number, c1: string, c2: string): string =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-30" width="10" height="34" rx="4" fill="#a9825a"/><circle cx="0" cy="-48" r="30" fill="${c1}"/><circle cx="-9" cy="-57" r="12" fill="${c2}" opacity=".7"/></g>`;

const bush = (x: number, y: number, s: number, c: string): string =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><circle cx="-16" cy="-8" r="14"/><circle cx="0" cy="-14" r="17"/><circle cx="17" cy="-8" r="13"/><rect x="-28" y="-9" width="56" height="10" rx="5"/></g>`;

const flower = (x: number, y: number, petal: string, s = 1): string =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 V12" stroke="#4fa971" stroke-width="2.4" stroke-linecap="round"/><g fill="${petal}"><circle cx="0" cy="-6" r="4.2"/><circle cx="6" cy="-1" r="4.2"/><circle cx="-6" cy="-1" r="4.2"/><circle cx="3.6" cy="5" r="4.2" transform="translate(-3.6 -3)"/><circle cx="0" cy="3.4" r="4.2"/></g><circle cx="0" cy="-1" r="3.2" fill="#ffd23f"/></g>`;

/** A mountain peak with a snow cap, as a closed polygon path. */
const MOUNTAINS: [number, number][] = [
  [0, 470], [90, 372], [175, 436], [270, 336], [390, 446], [480, 408], [575, 478], [700, 430], [815, 486], [950, 410], [1075, 336], [1200, 436], [1295, 386], [1400, 452], [1510, 404], [1600, 446],
];
const mountainPath = (): string => `M0 600 ${MOUNTAINS.map(([x, y]) => `L${x} ${y}`).join(' ')} L1600 600Z`;
const snowCaps = (peaks: number[]): string =>
  peaks.map((i) => {
    const p = MOUNTAINS[i]!, a = MOUNTAINS[i - 1]!, b = MOUNTAINS[i + 1]!;
    const at = (q: [number, number], t: number): [number, number] => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
    const l = at(a, 0.34), r = at(b, 0.34);
    const lm = at(a, 0.2), rm = at(b, 0.2);
    return `<path d="M${f1(l[0])} ${f1(l[1])} L${p[0]} ${p[1]} L${f1(r[0])} ${f1(r[1])} L${f1((rm[0] + p[0]) / 2 + 4)} ${f1(r[1] - 6)} L${f1(p[0] + 2)} ${f1(r[1] + 8)} L${f1((lm[0] + p[0]) / 2 - 4)} ${f1(l[1] - 6)}Z" fill="#f6fbff" stroke="#f6fbff" stroke-width="3" stroke-linejoin="round"/>`;
  }).join('');

// ------------------------------------------------------------------------------------------------ the backdrop
export const sceneSVG = (): string => {
  const rays = Array.from({ length: 12 }, (_, i) => `<rect x="-5" y="-96" width="10" height="28" rx="5" fill="#ffe27a" transform="rotate(${i * 30})"/>`).join('');
  const stars = [[160, 90, 4], [420, 160, 3], [700, 70, 4], [980, 140, 3], [1260, 60, 3], [260, 260, 3], [840, 250, 4], [560, 330, 3], [1450, 250, 3], [90, 330, 3], [1530, 120, 4], [1080, 300, 3]]
    .map(([x, y, r], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`).join('');
  const pathD = ribbon([[1450, 556, 20], [1370, 592, 30], [1215, 620, 46], [1128, 668, 62], [1150, 724, 86], [1235, 774, 112], [1190, 836, 150], [1120, 910, 190]]);
  const streamD = ribbon([[184, 728, 6], [180, 748, 20], [206, 790, 40], [190, 850, 54], [200, 920, 70]]);
  const flowersL = [[40, 836, '#ff8fb1'], [96, 868, '#ffffff'], [150, 842, '#ffd23f'], [250, 880, '#ff8fb1'], [24, 790, '#c9a6ff'], [300, 852, '#ffffff']] as const;
  const flowersR = [[1470, 830, '#ffffff'], [1530, 866, '#ff8fb1'], [1420, 872, '#ffd23f'], [1570, 812, '#c9a6ff'], [1340, 848, '#ff8fb1'], [1500, 790, '#ffd23f']] as const;
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="dragon-sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ff"/><stop offset="0.6" stop-color="#cfeeff"/><stop offset="1" stop-color="#fff6dc"/></linearGradient>
    <linearGradient id="dragon-sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2a5a"/><stop offset="0.7" stop-color="#3f4f95"/><stop offset="1" stop-color="#6a73b8"/></linearGradient>
  </defs>
  <style>#scene-bg .scenery-glow .halo{opacity:0;transition:opacity 1.2s}.night #scene-bg .scenery-glow .halo{opacity:.4}</style>
  <rect class="sky-day" width="1600" height="900" fill="url(#dragon-sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#dragon-sky-n)"/>
  <g class="sun"><g transform="translate(1110 140)"><g class="rays">${rays}</g></g><circle cx="1110" cy="140" r="46" fill="#ffd54a"/><circle cx="1110" cy="140" r="58" fill="#ffd54a" opacity=".22"/></g>
  <g class="moon"><circle cx="1110" cy="140" r="64" fill="#fff6c9" opacity=".16"/><circle cx="1110" cy="140" r="46" fill="#fff6c9"/><circle cx="1094" cy="126" r="8" fill="#e9dfa8"/><circle cx="1126" cy="156" r="6" fill="#e9dfa8"/><circle cx="1122" cy="122" r="4" fill="#e9dfa8"/></g>
  <g class="stars" fill="#fff">${stars}</g>
  ${cloud('c1', 300, 190, 1.1, 0.92)}
  ${cloud('c2', 880, 112, 0.9, 0.85)}
  ${cloud('c3', 1180, 300, 0.75, 0.75)}
  <g class="scenery">
    <path d="${mountainPath()}" fill="#bcd6f1"/>
    <g>${snowCaps([3, 10, 1, 13])}</g>
    <path d="M0 600 Q180 506 380 560 T760 540 T1130 556 T1600 520 V900 H0Z" fill="#d3efc3"/>
    ${bush(520, 560, 0.9, '#bfe6b0')}${bush(640, 552, 0.7, '#bfe6b0')}${bush(960, 556, 0.8, '#bfe6b0')}
    <path d="M560 900 V800 Q800 760 1000 704 Q1100 616 1230 584 Q1450 548 1590 584 Q1630 598 1640 626 V900Z" fill="#b6e49c"/>
    <g transform="translate(1450 560) scale(0.74)">${castle()}</g>
    <path d="M1240 612 Q1450 512 1640 612 Q1630 620 1640 640 V700 H1200Z" fill="#b6e49c"/>
    ${lolliTree(1180, 640, 0.62, '#78c47c', '#9ad98c')}${lolliTree(1236, 628, 0.5, '#6fbf78', '#97d78a')}${lolliTree(1565, 668, 0.7, '#78c47c', '#9ad98c')}
    <path d="M0 900 V670 Q130 604 300 650 T620 664 T900 690 Q1010 704 1070 790 V900Z" fill="#a4dc92"/>
    ${lolliTree(70, 700, 0.95, '#6fbf78', '#97d78a')}${lolliTree(1500, 726, 0.85, '#6fbf78', '#97d78a')}
    <path d="M0 900 V760 Q200 712 430 758 T860 776 T1240 764 T1600 748 V900Z" fill="#8bd47e"/>
    <path d="${streamD}" fill="#8fd2f2"/>
    <path d="${pathD}" fill="#f1e4bd"/>
    <g transform="translate(0 6)">
      <path d="M118 828 L118 806 Q205 754 292 806 L292 828Z" fill="#e6dcc4"/>
      <path d="M118 806 Q205 754 292 806" stroke="#cfc3a8" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M170 828 Q205 784 240 828Z" fill="#7cc6ea"/>
      <path d="M170 828 Q205 784 240 828" stroke="#cfc3a8" stroke-width="5" fill="none"/>
      <path d="M130 822 H160 M250 822 H280" stroke="#cfc3a8" stroke-width="3" stroke-linecap="round"/>
    </g>
    ${bush(400, 790, 1, '#6fc47a')}${bush(1050, 800, 1.1, '#6fc47a')}${bush(1320, 760, 0.8, '#6fc47a')}
    ${flowersL.map(([x, y, c]) => flower(x, y, c, 1.15)).join('')}${flowersR.map(([x, y, c]) => flower(x, y, c, 1.15)).join('')}
  </g>
  <g class="scenery-glow"><g transform="translate(1450 560) scale(0.74)">${castleWindows()}</g></g>
</svg>`;
};

// ------------------------------------------------------------------------------------------------ the home island
export const islandSVG = (): string => {
  const win = (x: number, y: number): string => `<path d="${windowPath(x, y)}" fill="#ffe08a" stroke="#cdbfa5" stroke-width="2" stroke-linejoin="round"/>`;
  return `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="200" cy="176" rx="186" ry="11" fill="#2f6f9f" opacity=".28"/>
  <path d="M18 128 Q26 80 120 76 L280 76 Q374 80 382 128 Q384 170 200 172 Q16 170 18 128Z" fill="#c4a077"/>
  <path d="M30 150 Q60 162 110 162 M270 164 Q330 160 370 146" stroke="#a8825a" stroke-width="5" stroke-linecap="round" fill="none" opacity=".6"/>
  <path d="M26 122 Q40 70 128 66 L272 66 Q360 70 374 122 Q330 102 200 102 Q70 102 26 122Z" fill="#7bd389"/>
  <path d="M60 104 Q120 92 200 96 Q150 90 60 104Z" fill="#9be8a6" opacity=".7"/>
  <g transform="translate(278 0)">
    <g transform="translate(2 0)">
      <rect x="-70" y="62" width="60" height="22" fill="${STONE}"/>
      ${[-70, -52, -34, -16].map((x) => `<rect x="${x}" y="56" width="11" height="9" rx="2.5" fill="${STONE}"/>`).join('')}
      <path d="M-50 84 V74 Q-50 66 -40 66 Q-30 66 -30 74 V84Z" fill="#9b6a4f"/>
      <g transform="translate(-72 84)">${tower(0, 26, 24, 24, ROOFS.inner, '#ffd23f')}</g>
    </g>
    <g transform="translate(40 84)">${tower(0, 42, 54, 46, ROOFS.keep, '#ff6b6b')}<path d="M0 -1 V-23 M-14 -1 V-1" stroke="none"/></g>
    <g transform="translate(40 84)">${win(0, -26)}</g>
    <path d="M-72 70 h0" stroke="none"/>
  </g>
  <g transform="translate(72 82)"><rect x="-4" y="-22" width="8" height="26" rx="3" fill="#a9825a"/><circle cx="0" cy="-38" r="22" fill="#58b567"/><circle cx="-7" cy="-45" r="9" fill="#7ad08a" opacity=".8"/></g>
  <g transform="translate(112 106)"><circle cx="-10" cy="-4" r="8" fill="#58b567"/><circle cx="2" cy="-8" r="10" fill="#58b567"/><circle cx="14" cy="-4" r="8" fill="#58b567"/></g>
  ${flower(34, 112, '#ff8fb1')}${flower(48, 100, '#ffffff', 0.9)}${flower(356, 116, '#ffd23f')}${flower(334, 104, '#c9a6ff', 0.9)}${flower(250, 98, '#ff8fb1', 0.85)}
</svg>`;
};
