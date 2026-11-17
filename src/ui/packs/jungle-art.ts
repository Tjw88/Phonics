import { mixHex } from '../art';

// Jungle Safari: the hanging leaf pods the animals arrive in, the sunny-jungle backdrop and the home island.
// Calm, flat, light tints (see PACK_BRIEF): saturated colour belongs to the creatures. Every id is prefixed "jungle-".

const f1 = (n: number): number => Math.round(n * 10) / 10;
/** a small deterministic pseudo-random number in [0, 1) so the art never changes between renders */
const rnd = (n: number): number => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ------------------------------------------------------------------ the arrival: a woven leaf pod on a rope, a coloured fruit on its front
export const jungleEggSVG = (id: string, main: string, dark: string, _accent: string): string => {
  const light = mixHex(main, '#ffffff', 0.5);
  const outline = mixHex(dark, '#000000', 0.15);
  const inside = mixHex(dark, '#000000', 0.35);
  const leaf = '#3fae63', leafD = '#238a4a', leafL = '#7fd28a';
  const lines: string[] = [];
  for (let k = -5; k <= 5; k++) {
    lines.push(`<path d="M${60 + k * 17 - 40} 62 L${60 + k * 17 + 30} 142" stroke="${dark}" stroke-width="2.6" opacity=".4"/>`);
    lines.push(`<path d="M${60 + k * 17 + 40} 62 L${60 + k * 17 - 30} 142" stroke="${dark}" stroke-width="2.6" opacity=".4"/>`);
  }
  const podPath = 'M16 62 C10 108 32 142 60 142 C88 142 110 108 104 62Z';
  const leafShape = (x: number, y: number, a: number, s: number, c: string, d: string) =>
    `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M0 0 C-16 -14 -14 -44 0 -64 C14 -44 16 -14 0 0Z" fill="${c}"/><path d="M0 -2 L0 -54" stroke="${d}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/><path d="M0 -20 l-8 -8 M0 -32 l8 -8" stroke="${d}" stroke-width="1.8" stroke-linecap="round" opacity=".5"/></g>`;
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="jungle-egg-${id}-g" cx="34%" cy="26%" r="85%"><stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${main}"/><stop offset="1" stop-color="${dark}"/></radialGradient>
    <clipPath id="jungle-egg-${id}-pod"><path d="${podPath}"/></clipPath>
  </defs>
  <ellipse cx="60" cy="146" rx="34" ry="4" fill="#0000002b"/>
  <path d="M60 6 L30 54 M60 6 L90 54" stroke="#8a6a35" stroke-width="3.6" stroke-linecap="round" fill="none"/>
  <circle cx="60" cy="6" r="4.5" fill="#6b4f22"/>
  <path d="${podPath}" fill="url(#jungle-egg-${id}-g)"/>
  <g clip-path="url(#jungle-egg-${id}-pod)">${lines.join('')}</g>
  <path d="${podPath}" fill="none" stroke="${outline}" stroke-width="2.4" stroke-linejoin="round" stroke-opacity=".6"/>
  <ellipse cx="38" cy="98" rx="7" ry="16" fill="#fff" opacity=".4" transform="rotate(18 38 98)"/>
  <ellipse cx="60" cy="62" rx="45" ry="11" fill="${light}" stroke="${outline}" stroke-width="2.4" stroke-opacity=".6"/>
  <ellipse cx="60" cy="62" rx="36" ry="7" fill="${inside}"/>
  ${leafShape(22, 64, -58, 0.62, leaf, leafD)}${leafShape(98, 64, 58, 0.62, leaf, leafD)}${leafShape(30, 68, -28, 0.46, leafL, leaf)}${leafShape(90, 68, 28, 0.46, leafL, leaf)}
</svg>`;
};

// ------------------------------------------------------------------ shared building blocks
const frondLeaflets = (): string => {
  const P = [[0, 0], [58, -64], [138, -6]] as const;
  let out = '';
  for (let i = 0; i < 13; i++) {
    const t = 0.1 + i * 0.068;
    const x = (1 - t) * (1 - t) * P[0][0] + 2 * (1 - t) * t * P[1][0] + t * t * P[2][0];
    const y = (1 - t) * (1 - t) * P[0][1] + 2 * (1 - t) * t * P[1][1] + t * t * P[2][1];
    const dx = 2 * (1 - t) * (P[1][0] - P[0][0]) + 2 * t * (P[2][0] - P[1][0]);
    const dy = 2 * (1 - t) * (P[1][1] - P[0][1]) + 2 * t * (P[2][1] - P[1][1]);
    const th = (Math.atan2(dy, dx) * 180) / Math.PI;
    const L = 17 * (1 - 0.6 * t) + 3;
    for (const a of [-58, 58]) out += `<ellipse cx="${f1(L * 0.85)}" cy="0" rx="${f1(L)}" ry="${f1(L * 0.3)}" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(th + a)})"/>`;
  }
  return `${out}<ellipse cx="143" cy="-2" rx="13" ry="4.5" transform="rotate(8 143 -2)"/><path d="M0 0 Q58 -64 138 -6" fill="none" stroke="#0b4a2c" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>`;
};

/** a palm: tapered curved trunk with ring marks, a crown of fronds (via <use href="#fid">), coconuts */
const palm = (fid: string, x: number, baseY: number, topX: number, topY: number, s: number, w: number, c1: string, c2: string, trunk = '#9a7650', trunkD = '#7d5d3b'): string => {
  const my = (baseY + topY) / 2;
  const bend = (topX - x) * 0.15;
  let o = `<path d="M${x - w} ${baseY} Q${f1(x - w * 0.4 + bend)} ${my} ${f1(topX - w * 0.5)} ${topY} L${f1(topX + w * 0.5)} ${topY} Q${f1(x + w * 0.6 + bend)} ${my} ${x + w} ${baseY}Z" fill="${trunk}"/>`;
  o += `<path d="M${f1(x + w * 0.15)} ${baseY} Q${f1(x + w * 0.5 + bend)} ${my} ${f1(topX + w * 0.05)} ${topY} L${f1(topX + w * 0.5)} ${topY} Q${f1(x + w * 0.6 + bend)} ${my} ${x + w} ${baseY}Z" fill="${trunkD}" opacity=".5"/>`;
  for (let k = 1; k < 10; k++) {
    const t = k / 10;
    const yy = baseY + (topY - baseY) * t;
    const xx = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * (x + bend) + t * t * topX;
    const hw = w * (1 - t * 0.5) * 0.9;
    o += `<path d="M${f1(xx - hw)} ${f1(yy)} q${f1(hw)} ${f1(hw * 0.5)} ${f1(hw * 2)} 0" fill="none" stroke="${trunkD}" stroke-width="${f1(Math.max(2, w * 0.3))}" stroke-linecap="round" opacity=".6"/>`;
  }
  const angles = [-100, -72, -44, -16, 12];
  angles.forEach((a, i) => { for (const m of [1, -1]) o += `<use href="#${fid}" fill="${i % 2 ? c1 : c2}" transform="translate(${topX} ${topY}) scale(${f1(m * s)} ${s}) rotate(${a})"/>`; });
  o += `<circle cx="${topX - 7 * s}" cy="${f1(topY + 6 * s)}" r="${f1(6 * s)}" fill="#7a4a21"/><circle cx="${topX + 6 * s}" cy="${f1(topY + 8 * s)}" r="${f1(6 * s)}" fill="#8a5628"/><circle cx="${topX}" cy="${f1(topY + 12 * s)}" r="${f1(5.4 * s)}" fill="#7a4a21"/>`;
  return o;
};

/** a flower: a stalk and five round petals */
const flower = (x: number, y: number, c: string, s = 1, c2 = '#ffd23f'): string =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 q-2 -10 0 -20" stroke="#2f8f55" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="${c}" transform="translate(0 -22)">${[0, 72, 144, 216, 288].map((a) => `<circle cx="0" cy="-7" r="5.6" transform="rotate(${a})"/>`).join('')}</g><circle cx="0" cy="-22" r="3.6" fill="${c2}"/></g>`;

/** a bumpy canopy silhouette: round green lobes of varying size along a baseline */
const canopy = (y: number, rMin: number, rMax: number, seed: number, fill: string, x0 = -60, x1 = 1660): string => {
  let x = x0;
  let d = `M${x0} ${y + 500} L${x0} ${y}`;
  let i = 0;
  while (x < x1) {
    const r = rMin + rnd(seed + i) * (rMax - rMin);
    const dy = (rnd(seed + i * 3.3 + 1) - 0.5) * 20;
    d += ` A${f1(r)} ${f1(r * 0.85)} 0 0 1 ${f1(x + 2 * r)} ${f1(y + dy)}`;
    x += 2 * r;
    i++;
  }
  return `<path d="${d} L${f1(x)} ${y + 500}Z" fill="${fill}"/>`;
};

/** a vine: a gently swaying line from (x, y0) down to y1 with little leaves, optionally ending in a flower */
const vine = (x: number, y0: number, y1: number, sway: number, c: string, leafC: string, bloom?: string): string => {
  const my = (y0 + y1) / 2;
  let o = `<path d="M${x} ${y0} C${x + sway} ${f1(y0 + (my - y0) * 0.6)} ${x - sway} ${f1(my + (y1 - my) * 0.4)} ${x + sway * 0.3} ${y1}" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/>`;
  const n = Math.max(2, Math.round((y1 - y0) / 46));
  for (let k = 1; k <= n; k++) {
    const t = k / (n + 0.6);
    const yy = y0 + (y1 - y0) * t;
    const xx = x + sway * Math.sin(t * Math.PI * 1.6) * 0.55;
    const side = k % 2 ? 1 : -1;
    o += `<ellipse cx="${f1(xx + side * 9)}" cy="${f1(yy)}" rx="11" ry="5.6" transform="rotate(${side * -35} ${f1(xx + side * 9)} ${f1(yy)})" fill="${leafC}"/>`;
  }
  if (bloom) o += `<g transform="translate(${f1(x + sway * 0.3)} ${y1})"><g fill="${bloom}">${[0, 72, 144, 216, 288].map((a) => `<circle cx="0" cy="-6" r="4.6" transform="rotate(${a})"/>`).join('')}</g><circle r="3" fill="#ffd23f"/></g>`;
  return o;
};

/** a butterfly seen from above */
const butterfly = (x: number, y: number, s: number, c: string, c2: string, rot = 0): string =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" opacity=".95"><ellipse cx="-8" cy="-5" rx="9" ry="6" transform="rotate(-25 -8 -5)" fill="${c}"/><ellipse cx="8" cy="-5" rx="9" ry="6" transform="rotate(25 8 -5)" fill="${c}"/><ellipse cx="-6" cy="5" rx="6" ry="4.5" transform="rotate(25 -6 5)" fill="${c2}"/><ellipse cx="6" cy="5" rx="6" ry="4.5" transform="rotate(-25 6 5)" fill="${c2}"/><rect x="-1.2" y="-8" width="2.4" height="17" rx="1.2" fill="#5b4a3a"/></g>`;

// ------------------------------------------------------------------ the backdrop
export const jungleSceneSVG = (): string => {
  const bigLeaves = (x: number, y: number, s: number, flip: number, c1: string, c2: string): string =>
    [[-70, c2, 0.92], [-38, c1, 1.05], [-8, c2, 1], [24, c1, 0.9], [-100, c1, 0.82], [52, c2, 0.75]]
      .map(([a, c, k]) => `<use href="#jungle-bleaf" fill="${c}" transform="translate(${x} ${y}) scale(${f1(flip * s * (k as number))} ${f1(s * (k as number))}) rotate(${a})"/>`).join('');
  const rays = Array.from({ length: 12 }, (_, i) => `<rect x="-5" y="-110" width="10" height="34" rx="5" fill="#fff0a0" transform="rotate(${i * 30})"/>`).join('');
  const stars = [[160, 80, 3.4], [420, 150, 2.6], [700, 60, 3.4], [980, 130, 2.6], [1150, 50, 2.6], [320, 250, 2.6], [860, 230, 3.4], [560, 300, 2.6], [1440, 240, 2.6], [1000, 40, 2.6]]
    .map(([x, y, r], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`).join('');
  // fireflies (night): a soft glow and a bright dot, mostly low and at the edges
  const flies = [[110, 520], [190, 640], [60, 720], [260, 580], [330, 790], [1480, 540], [1380, 650], [1530, 700], [1280, 800], [1200, 600], [90, 400], [1500, 410], [700, 830], [900, 800], [450, 850], [1100, 860]]
    .map(([x, y], i) => `<g class="tw tw${i % 3}"><circle cx="${x}" cy="${y}" r="13" fill="#d9ff6a" opacity=".22"/><circle cx="${x}" cy="${y}" r="4.6" fill="#f2ff9a"/></g>`).join('');
  // the rope bridge across the far distance: two sagging walkway ropes, planks, posts and hanging hand-ropes
  const bx0 = 120, bx1 = 1480, by0 = 452, by1 = 460, bcy = 580;
  const bq = (t: number, dy: number): [number, number] => [(1 - t) * (1 - t) * bx0 + 2 * (1 - t) * t * ((bx0 + bx1) / 2) + t * t * bx1, (1 - t) * (1 - t) * (by0 + dy) + 2 * (1 - t) * t * (bcy + dy) + t * t * (by1 + dy)];
  const walkD = `M${bx0} ${by0} Q${(bx0 + bx1) / 2} ${bcy} ${bx1} ${by1}`;
  const railD = `M${bx0} ${by0 - 40} Q${(bx0 + bx1) / 2} ${bcy - 40} ${bx1} ${by1 - 40}`;
  let hangers = '';
  for (let k = 1; k < 27; k++) { const [x, y] = bq(k / 27, 0); const [, y2] = bq(k / 27, -40); hangers += `<path d="M${f1(x)} ${f1(y)} L${f1(x)} ${f1(y2)}" stroke="#a89468" stroke-width="2.6" stroke-linecap="round"/>`; }
  const bridge = `<g opacity=".8">
    <rect x="${bx0 - 10}" y="${by0 - 110}" width="20" height="150" rx="8" fill="#a98f66"/><rect x="${bx1 - 10}" y="${by1 - 110}" width="20" height="150" rx="8" fill="#a98f66"/>
    <ellipse cx="${bx0}" cy="${by0 - 112}" rx="34" ry="20" fill="#8cc68f"/><ellipse cx="${bx1}" cy="${by1 - 112}" rx="34" ry="20" fill="#8cc68f"/>
    <path d="${railD}" fill="none" stroke="#a89468" stroke-width="3.4" stroke-linecap="round"/>${hangers}
    <path d="${walkD}" fill="none" stroke="#8d7a50" stroke-width="12" stroke-linecap="round"/><path d="${walkD}" fill="none" stroke="#d8c08a" stroke-width="9" stroke-dasharray="11 4"/></g>`;
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="jungle-sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9ea96"/><stop offset=".55" stop-color="#e7f5ae"/><stop offset="1" stop-color="#fdf6c8"/></linearGradient>
    <linearGradient id="jungle-sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04242d"/><stop offset="1" stop-color="#0f5760"/></linearGradient>
    <radialGradient id="jungle-sun-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6b0" stop-opacity=".9"/><stop offset=".5" stop-color="#fff2a0" stop-opacity=".35"/><stop offset="1" stop-color="#fff2a0" stop-opacity="0"/></radialGradient>
    <linearGradient id="jungle-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0" stop-opacity="0"/><stop offset=".55" stop-color="#fffbe0" stop-opacity=".62"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></linearGradient>
    <linearGradient id="jungle-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9be6e0"/><stop offset="1" stop-color="#5ec6cf"/></linearGradient>
    <linearGradient id="jungle-fall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9f2f0"/><stop offset=".5" stop-color="#ecfbf8"/><stop offset="1" stop-color="#b9ebea"/></linearGradient>
    <g id="jungle-frond">${frondLeaflets()}</g>
    <g id="jungle-bleaf"><path d="M0 0 C-34 -30 -46 -104 0 -176 C46 -104 34 -30 0 0Z"/><path d="M0 -4 L0 -160" stroke="#fff" stroke-opacity=".35" stroke-width="3.4" stroke-linecap="round"/><path d="M0 -40 L-24 -62 M0 -40 L24 -62 M0 -78 L-26 -102 M0 -78 L26 -102 M0 -114 L-20 -134 M0 -114 L20 -134" stroke="#fff" stroke-opacity=".22" stroke-width="2.6" stroke-linecap="round"/></g>
  </defs>
  <rect class="sky-day" width="1600" height="900" fill="url(#jungle-sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#jungle-sky-n)"/>
  <g class="sun"><circle cx="1250" cy="128" r="150" fill="url(#jungle-sun-glow)"/><g transform="translate(1250 128)"><g class="rays">${rays}</g></g><circle cx="1250" cy="128" r="54" fill="#ffe672"/></g>
  <g class="moon"><circle cx="1250" cy="128" r="50" fill="#f3f8d4"/><circle cx="1232" cy="114" r="9" fill="#dfe8b8"/><circle cx="1268" cy="146" r="6" fill="#dfe8b8"/><circle cx="1262" cy="108" r="5" fill="#dfe8b8"/></g>
  <g class="stars" fill="#fff">${stars}</g>
  <g class="cloud c1" fill="#fffdea" opacity=".9"><ellipse cx="330" cy="190" rx="88" ry="26"/><ellipse cx="380" cy="170" rx="56" ry="30"/><ellipse cx="290" cy="176" rx="46" ry="24"/></g>
  <g class="cloud c2" fill="#fffdea" opacity=".8"><ellipse cx="860" cy="100" rx="80" ry="22"/><ellipse cx="906" cy="84" rx="48" ry="26"/><ellipse cx="822" cy="88" rx="40" ry="20"/></g>
  <g class="cloud c3" fill="#fffdea" opacity=".7"><ellipse cx="1130" cy="300" rx="70" ry="20"/><ellipse cx="1170" cy="284" rx="42" ry="22"/></g>
  <g class="scenery">
    <!-- far hazy ridges and the rope bridge -->
    ${canopy(548, 44, 72, 3, '#b3dcae')}
    <rect x="0" y="440" width="1600" height="140" fill="url(#jungle-mist)"/>
    ${bridge}
    ${canopy(606, 36, 62, 11, '#9fd2a6')}
    ${[[250, 600, 0.6], [520, 612, 0.5], [1010, 606, 0.55], [1230, 600, 0.5]].map(([x, y, k]) => palm('jungle-frond', x!, y!, x! + 10, y! - 120 * k!, k! * 0.8, 6 * k!, '#8fc89a', '#7bbb89', '#8fb99a', '#7fa98a')).join('')}
    <rect x="0" y="540" width="1600" height="150" fill="url(#jungle-mist)" opacity=".8"/>
    <!-- the cliff, with the waterfall falling into its pool (right edge) -->
    <path d="M1236 790 C1236 590 1262 380 1320 318 Q1400 262 1500 290 L1620 308 V790Z" fill="#b9a98c"/>
    <path d="M1236 790 C1236 590 1262 380 1320 318 Q1350 292 1380 286 Q1320 380 1318 790Z" fill="#cfc0a3"/>
    <path d="M1520 296 Q1590 330 1600 520 L1600 790 L1560 790 Q1566 540 1520 296Z" fill="#9c8c74" opacity=".7"/>
    <path d="M1290 340 Q1300 330 1316 336 M1500 420 q16 -6 30 2 M1470 560 q20 -6 34 2 M1280 520 q14 -6 26 0" stroke="#8f7f66" stroke-width="3" fill="none" stroke-linecap="round" opacity=".45"/>
    ${canopy(292, 22, 38, 41, '#79c26f', 1226, 1640)}
    <path d="M1352 292 L1428 292 Q1440 300 1440 316 L1446 744 L1344 744 L1350 316 Q1348 300 1352 292Z" fill="url(#jungle-fall)"/>
    <path d="M1372 304 L1370 740 M1394 300 L1396 740 M1418 306 L1424 740" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".8"/>
    <path d="M1344 300 Q1366 280 1390 292 Q1414 280 1438 298" fill="none" stroke="#6bbc68" stroke-width="12" stroke-linecap="round"/>
    <ellipse cx="1396" cy="758" rx="210" ry="40" fill="#cdeee9"/><ellipse cx="1396" cy="758" rx="192" ry="32" fill="url(#jungle-water)"/>
    <ellipse cx="1370" cy="752" rx="112" ry="15" fill="#c2f1ee" opacity=".7"/>
    <g fill="#fff" opacity=".75"><ellipse cx="1396" cy="738" rx="64" ry="14"/><circle cx="1352" cy="730" r="14"/><circle cx="1396" cy="722" r="18"/><circle cx="1442" cy="730" r="14"/><circle cx="1470" cy="738" r="10"/><circle cx="1324" cy="738" r="10"/></g>
    <path d="M1260 764 q16 -7 32 0 t32 0 M1470 776 q14 -6 28 0 t28 0 M1330 780 q12 -5 24 0" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
    <g transform="translate(1276 752)"><ellipse cx="0" cy="0" rx="17" ry="7" fill="#58b865"/><ellipse cx="0" cy="-1" rx="10" ry="4" fill="#7fd28a"/><circle cx="2" cy="-5" r="3.4" fill="#ff7eb6"/></g>
    <g transform="translate(1530 780)"><ellipse cx="0" cy="0" rx="15" ry="6" fill="#58b865"/><ellipse cx="0" cy="-1" rx="9" ry="3.6" fill="#7fd28a"/></g>
    <path d="M1210 782 C1200 760 1226 736 1256 746 C1236 756 1232 772 1244 790Z" fill="#a89878"/><path d="M1210 782 C1200 760 1226 736 1256 746 C1244 750 1226 756 1224 782Z" fill="#c6b898"/>
    <path d="M1540 790 C1536 760 1566 744 1600 752 L1600 800Z" fill="#a89878"/><path d="M1556 770 q14 -14 30 -12 q-6 8 -16 10 q-6 -4 -14 2Z" fill="#79c26f"/>
    <!-- nearer jungle floor -->
    ${canopy(676, 30, 52, 23, '#86c98f', -60, 1230)}
    <path d="M0 740 Q300 692 640 730 T1260 724 L1260 900 L0 900Z" fill="#7cc67d"/>
    <path d="M0 806 Q400 770 860 800 T1600 784 V900H0Z" fill="#69b86e"/>
    <path d="M0 864 Q420 842 900 866 T1600 856 V900H0Z" fill="#54a460"/>
    <!-- left: a tall palm, big leaves, flowers -->
    ${palm('jungle-frond', 112, 884, 150, 340, 1.05, 15, '#46b36c', '#2f9a58')}
    ${bigLeaves(46, 900, 1.1, 1, '#3fa862', '#2b8d51')}
    ${bigLeaves(268, 906, 0.78, 1, '#52b86f', '#3fa862')}
    ${flower(120, 880, '#ff5d73', 1.2)}${flower(330, 884, '#ff9f1c', 1)}${flower(74, 810, '#ff7eb6', 1)}${flower(410, 872, '#ffd23f', 0.9, '#ff8a3a')}${flower(190, 890, '#fff', 1, '#ffd23f')}
    <!-- right: big leaves and flowers -->
    ${bigLeaves(1572, 906, 1.1, -1, '#3fa862', '#2b8d51')}
    ${bigLeaves(1330, 910, 0.72, -1, '#52b86f', '#3fa862')}
    ${flower(1420, 882, '#ff5d73', 1.1)}${flower(1228, 874, '#ff7eb6', 1)}${flower(1130, 884, '#ffd23f', 0.9, '#ff8a3a')}${flower(1528, 856, '#ff9f1c', 1)}${flower(980, 884, '#ff5d73', 0.8)}${flower(610, 886, '#ff9f1c', 0.8)}
    <!-- top corners: the canopy with hanging vines and big leaves -->
    <path d="M-20 -20 H430 Q430 60 380 90 Q350 150 290 130 Q250 190 190 160 Q130 220 70 180 Q20 220 -20 190Z" fill="#3aa860"/>
    <path d="M-20 -20 H360 Q350 50 310 70 Q280 120 230 104 Q190 150 140 126 Q90 170 40 140 Q10 160 -20 150Z" fill="#58bd75"/>
    ${bigLeaves(60, -10, 0.85, -1, '#2f9a58', '#238a4a').replace(/rotate\((-?\d+)\)/g, (_, a) => `rotate(${180 - Number(a)})`)}
    <path d="M1360 -20 H1620 V210 Q1580 190 1540 170 Q1500 200 1450 150 Q1410 130 1390 70 Q1370 40 1360 -20Z" fill="#3aa860"/>
    <path d="M1400 -20 H1620 V140 Q1590 150 1560 120 Q1520 140 1480 96 Q1440 70 1420 20Z" fill="#58bd75"/>
    ${vine(60, 150, 470, 18, '#2f9a58', '#46b36c', '#ff5d73')}${vine(150, 160, 380, -14, '#2f9a58', '#46b36c')}${vine(240, 140, 300, 12, '#2f9a58', '#46b36c', '#ffb02e')}${vine(330, 110, 230, -10, '#2f9a58', '#46b36c')}
    ${vine(1560, 180, 520, -16, '#2f9a58', '#46b36c', '#ff7eb6')}${vine(1500, 160, 380, 14, '#2f9a58', '#46b36c')}${vine(1420, 130, 280, -12, '#2f9a58', '#46b36c', '#ffb02e')}
    ${butterfly(520, 760, 1.1, '#ffb02e', '#ff7eb6', -10)}${butterfly(1100, 690, 0.9, '#7fd2ff', '#b29bff', 14)}${butterfly(180, 460, 0.8, '#ff7eb6', '#ffd23f', 8)}
  </g>
  <g class="stars">${flies}</g>
</svg>`;
};

// ------------------------------------------------------------------ the home island: a green mound, a tall palm, a vine swing and a little waterfall pool
export const jungleIslandSVG = (): string => {
  const rock = (x: number, y: number, rx: number, ry: number, c: string, c2: string): string =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/><ellipse cx="${x - rx * 0.25}" cy="${y - ry * 0.3}" rx="${rx * 0.6}" ry="${ry * 0.5}" fill="${c2}"/>`;
  return `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="jungle-isl-fall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9f2f0"/><stop offset=".5" stop-color="#f0fcf9"/><stop offset="1" stop-color="#b9ebea"/></linearGradient>
    <g id="jungle-isl-frond">${frondLeaflets()}</g>
  </defs>
  <ellipse cx="200" cy="177" rx="192" ry="11" fill="#1d6a3c" opacity=".22"/>
  <path d="M14 126 Q14 172 200 176 Q386 172 386 126Z" fill="#a97a4b"/>
  <path d="M26 142 Q60 166 200 168 Q340 166 374 142 Q340 172 200 174 Q60 172 26 142Z" fill="#8a6038" opacity=".6"/>
  <path d="M10 128 Q22 88 120 80 L280 80 Q378 88 390 128 Q390 152 200 152 Q10 152 10 128Z" fill="#6cc46f"/>
  <path d="M34 112 Q70 88 140 85 L260 85 Q330 88 366 112 Q300 98 200 98 Q100 98 34 112Z" fill="#8fdc8c"/>
  <!-- the tall palm with a vine swing -->
  ${palm('jungle-isl-frond', 44, 134, 78, 76, 0.44, 7, '#3fa862', '#2b8d51')}
  <path d="M82 84 Q90 98 102 112" stroke="#2f9a58" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M94 86 Q108 98 124 112" stroke="#2f9a58" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="95" cy="76" rx="6" ry="3" fill="#46b36c" transform="rotate(-30 95 76)"/><ellipse cx="116" cy="84" rx="6" ry="3" fill="#46b36c" transform="rotate(30 116 84)"/>
  <rect x="94" y="109" width="36" height="7" rx="3.5" fill="#c2924d"/><rect x="94" y="109" width="36" height="3" rx="1.5" fill="#dcb06c"/>
  <!-- the little waterfall pool -->
  <g transform="translate(0 0)">
    <ellipse cx="324" cy="140" rx="52" ry="12" fill="#cdeee9"/><ellipse cx="324" cy="140" rx="46" ry="9.5" fill="#6fd0d4"/><ellipse cx="318" cy="138" rx="28" ry="4.5" fill="#b4eeee" opacity=".7"/>
    <path d="M286 138 Q284 90 306 70 Q336 56 358 74 Q372 100 366 136 Q326 128 286 138Z" fill="#b9a98c"/><path d="M286 138 Q284 90 306 70 Q318 62 330 62 Q304 90 304 136Z" fill="#cfc0a3"/>
    ${rock(300, 66, 20, 9, '#6cc46f', '#8fdc8c')}${rock(346, 70, 18, 8, '#6cc46f', '#8fdc8c')}
    <path d="M318 66 L342 66 Q346 74 346 82 L348 134 L316 134 L318 82 Q318 74 318 66Z" fill="url(#jungle-isl-fall)"/>
    <path d="M326 70 L326 132 M336 70 L338 132" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <g fill="#fff" opacity=".8"><circle cx="322" cy="134" r="6"/><circle cx="332" cy="131" r="8"/><circle cx="344" cy="134" r="6"/></g>
    <path d="M298 143 q8 -3 16 0 t16 0" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="357" cy="141" rx="9" ry="3.6" fill="#58b865"/><circle cx="359" cy="138" r="2.4" fill="#ff7eb6"/>
  </g>
  ${[[28, 132, '#ff5d73'], [48, 140, '#ffd23f'], [262, 130, '#ff7eb6'], [276, 138, '#ff9f1c'], [378, 130, '#ff5d73']].map(([x, y, c]) => flower(x as number, y as number, c as string, 0.55)).join('')}
  <path d="M150 112 q-4 -10 2 -16 M158 112 q0 -12 8 -14 M246 114 q4 -10 -2 -16 M238 114 q0 -12 -8 -14" stroke="#3fa862" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/>
</svg>`;
};
