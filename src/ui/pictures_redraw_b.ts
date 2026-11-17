import { K, add, c, e, p, r, s, shadow } from './pictureKit';

/** Redrawn picture cards (they replace the earlier drawings of the same word). */

const drawings: Array<[string, string]> = [];
const put = (word: string, body: string): void => {
  drawings.push([word, body]);
};
const g = (t: string, body: string): string => `<g transform="${t}">${body}</g>`;
const star = (cx: number, cy: number, R: number, f: string): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : R * 0.45;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return p(`M${pts.join(' L')}Z`, f);
};

// ---- nut: a peanut in its shell, and a cracked-open one --------------------------------------------------------------
const PEANUT = 'M4 42 C4 22 28 20 33 38 Q36 42 40 38 C46 20 72 26 72 44 C72 64 46 66 40 50 Q36 46 33 50 C28 68 4 62 4 42Z';
const peanut = (): string => {
  const lobes: Array<[number, number, number, number]> = [[19, 42, 15.5, 16], [55, 44, 17.5, 18]];
  let hatch = '';
  for (let y = 22; y < 68; y += 7) {
    for (let x = 4; x < 74; x += 7) {
      const px = x + ((y / 7) % 2 ? 3.5 : 0);
      if (lobes.some(([cx, cy, rx, ry]) => ((px - cx) / (rx - 4)) ** 2 + ((y - cy) / (ry - 4)) ** 2 < 1)) hatch += `M${px - 2} ${y - 2} l4 4 M${px + 2} ${y - 2} l-4 4 `;
    }
  }
  return p(PEANUT, '#b98445', 'transform="translate(0 3)"') + p(PEANUT, '#e8c48a') +
    s(hatch, '#c9975a', 1.3, 'opacity=".8"') +
    p('M11 36 q3 -8 12 -9', 'none', 'stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".7"') +
    p('M47 31 q8 -3 15 2', 'none', 'stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".7"') +
    '';
};
put('nut', shadow(94, 40) +
  g('translate(-1 -2) rotate(-16 38 44) scale(1.14)', peanut()));

// ---- net: a butterfly/fishing net held diagonally --------------------------------------------------------------------
const netMesh = (): string => {
  // local coords: axis along +x, hoop at x=40, bag tapering to x=96
  const hx = 40, L = 56, H = 21;
  const h = (x: number): number => H * Math.sqrt(Math.max(0, 1 - ((x - hx) / L) ** 2));
  let lines = '';
  for (const k of [-0.66, -0.33, 0, 0.33, 0.66]) {
    let d = '';
    for (let x = hx + 2; x <= hx + L - 3; x += 4) d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${(k * h(x)).toFixed(1)} `;
    lines += d;
  }
  let cross = '';
  const knots: string[] = [];
  for (const x of [52, 64, 76, 87]) {
    const hh = h(x);
    cross += `M${x - 1} ${-hh + 1.5} Q${x + 2.5} 0 ${x - 1} ${hh - 1.5} `;
    for (const k of [-0.66, -0.33, 0, 0.33, 0.66]) knots.push(c(x + 1, k * hh, 1.5, '#4a8fa0'));
  }
  const bag = `M${hx} ${-H} A${L} ${H} 0 0 1 ${hx + L} 0 A${L} ${H} 0 0 1 ${hx} ${H}Z`;
  return p(bag, '#cfeef6', 'opacity=".95"') + p(bag, 'none', 'stroke="#4a8fa0" stroke-width="2.4" stroke-linejoin="round"') + s(lines, '#5fa7b8', 1.5) + s(cross, '#5fa7b8', 1.5) + knots.join('');
};
put('net', shadow(95, 34) + g('translate(8 90) rotate(-45)',
  r(-4, -4.5, 48, 9, 4, K.dbrown) + r(-4, -4.5, 48, 4, 2, K.brown) + r(-6, -5.5, 6, 11, 3, K.dgrey) +
  netMesh() +
  e(40, 0, 6.5, 22, 'none').replace('fill="none"', `fill="none" stroke="${K.dgrey}" stroke-width="5"`) +
  e(40, 0, 6.5, 22, 'none').replace('fill="none"', 'fill="none" stroke="#c9d3e0" stroke-width="1.6" transform="translate(-0.6 0)"') +
  r(30, -3.4, 12, 6.8, 3, K.dbrown)));

// ---- nose: a friendly cartoon nose on a peach face patch ---------------------------------------------------------------
put('nose', shadow(94, 36) +
  c(50, 52, 42, '#ffe3cf') + c(50, 52, 42, 'none', 'stroke="#ffd0b5" stroke-width="3"') +
  c(18, 66, 7, '#ffb3b3', 'opacity=".55"') + c(82, 66, 7, '#ffb3b3', 'opacity=".55"') +
  p('M43 22 Q41 46 36 58 L64 58 Q59 46 57 22Z', K.skin) + p('M52 22 Q56 46 60 58 L64 58 Q59 46 57 22Z', K.dskin, 'opacity=".5"') +
  c(34, 66, 11, K.dskin) + c(66, 66, 11, K.dskin) + c(50, 64, 18, K.dskin) +
  c(34, 64, 11, K.skin) + c(66, 64, 11, K.skin) + c(50, 62, 18, K.skin) +
  e(41, 74, 4.4, 5.6, '#8a4a2c', 8) + e(59, 74, 4.4, 5.6, '#8a4a2c', -8) +
  e(48, 52, 5, 7, '#ffffff77', 12) + p('M44 28 Q43 38 41 46', 'none', 'stroke="#ffffff77" stroke-width="3" stroke-linecap="round"'));

// ---- banana: a plump bunch of two ----------------------------------------------------------------------------------------
const banana = (dx: number, dy: number, main: string, dark: string, light: string): string => g(`translate(${dx} ${dy})`,
  p('M12 22 C0 60 34 96 82 66 L88 54 C58 74 30 56 30 22Z', dark) +
  p('M14 18 C4 56 36 92 84 62 L84 52 C54 68 32 52 32 20Z', main) +
  p('M22 30 C22 52 40 74 72 64 C46 68 30 52 30 30Z', light, 'opacity=".55"') +
  p('M16 40 C16 62 34 82 62 78', 'none', 'stroke="#ffffff88" stroke-width="3" stroke-linecap="round"') +
  p('M82 66 L90 54 L84 50 L80 58Z', K.dgreen) + c(88, 52, 3.4, K.dbrown) +
  r(12, 8, 20, 12, 3, K.brown, -4) + r(12, 8, 20, 5, 2, '#d99a57', -4));
put('banana', shadow(94, 34) +
  banana(10, -2, K.yellow, K.dyellow, '#fff2b0').replace(/<g[^>]*>/, (m) => m.replace('>', ' opacity="1">')) +
  banana(0, 12, '#ffd966', '#d99a00', '#fff6c8') );

// ---- sock: a pair of child's socks ---------------------------------------------------------------------------------------
const sockOne = (main: string, dark: string, stripe: string): string => {
  const d = 'M22 6 H52 V50 Q52 58 62 61 L80 66 Q94 72 90 84 Q86 92 74 92 H34 Q14 92 14 74 Q14 64 22 58Z';
  return p(d, dark, 'transform="translate(1.5 2.5)"') + p(d, main) +
    r(22, 6, 30, 22, 4, K.white) + r(22, 11, 30, 4, 0, stripe) + r(22, 19, 30, 4, 0, stripe) +
    p('M14 74 Q14 64 22 58 L30 62 Q26 68 28 78 Q24 88 36 92 Q14 92 14 74Z', stripe, 'opacity=".9"') +
    p('M68 62 L80 66 Q94 72 90 84 Q86 92 74 92 Q82 80 68 62Z', stripe, 'opacity=".9"') +
    s('M30 34 v14', '#ffffff77', 4) + p('M56 70 q14 4 20 14', 'none', 'stroke="#ffffff66" stroke-width="3" stroke-linecap="round"');
};
put('sock', shadow(94, 38) +
  g('translate(26 0) rotate(10 40 50) scale(.86)', sockOne(K.violet, K.dviolet, K.pink)) +
  g('translate(-6 8) rotate(-6 40 50) scale(.88)', sockOne(K.blue, K.dblue, K.yellow)));

// ---- axe: standing in a chopping log -------------------------------------------------------------------------------------
put('axe', shadow(95, 40) +
  p('M12 76 V88 Q12 98 50 98 Q88 98 88 88 V76Z', '#8a5a2b') + p('M12 76 V88 Q12 98 30 98 L30 78Z', '#7a4a1d', 'opacity=".5"') +
  s('M26 82 v10 M40 84 v12 M60 84 v12 M74 82 v10', '#6b3f18', 2.4, 'opacity=".6"') +
  e(50, 76, 38, 11, '#d9a566') + e(50, 76, 28, 7.5, '#e8bb7e') + e(50, 76, 17, 4.5, '#d9a566') + e(50, 76, 7, 2.4, '#c58f4e') +
  // handle then head
  g('rotate(12 60 60)', r(56, 4, 9, 74, 4, K.dbrown) + r(56, 4, 4, 74, 2, K.brown) + e(60.5, 5, 6, 3.4, K.brown)) +
  g('rotate(12 60 60)',
    p('M66 40 L52 40 C44 38 36 34 30 28 C22 44 22 66 32 82 C40 76 48 72 52 70 L66 70Z', K.dgrey) +
    p('M64 42 L52 42 C44 40 38 36 32 32 C26 46 26 64 34 78 C42 72 48 68 52 66 L64 66Z', '#c9d3e0') +
    p('M30 28 C22 44 22 66 32 82 C26 66 28 44 36 32Z', '#eef3f8') +
    p('M52 42 L64 42 L64 66 L52 66Z', '#9aa8b8') + r(54, 48, 3, 12, 1.5, '#ffffff99')) +
  p('M22 82 q28 12 56 0', 'none', 'stroke="#00000022" stroke-width="3"'));

// ---- feet: a pair of bare feet from the front/top --------------------------------------------------------------------------
const foot = (): string => {
  const body = 'M5 40 Q5 24 26 24 Q47 22 49 40 C51 56 43 62 41 72 Q28 84 15 72 C11 60 3 56 5 40Z';
  const toes: Array<[number, number, number]> = [[39, 16, 9.6], [27.5, 13.5, 7], [18.5, 17, 6], [11.5, 23, 5.2], [7, 31.5, 4.6]];
  return r(16, 66, 24, 36, 6, K.dskin) + r(17, 66, 22, 36, 6, K.skin) + p(body, K.dskin, 'transform="translate(0 2)"') + p(body, K.skin) + r(17.5, 74, 21, 8, 0, K.skin) +
    toes.map(([x, y, rad]) => c(x, y + 1.6, rad, K.dskin)).join('') + toes.map(([x, y, rad]) => c(x, y, rad, K.skin)).join('') +
    toes.map(([x, y, rad]) => e(x - 0.5, y - rad * 0.36, rad * 0.5, rad * 0.3, '#ffe9da')).join('') +
    p('M20 44 q-2 10 2 20', 'none', 'stroke="#ffffff66" stroke-width="4" stroke-linecap="round"');
};
put('feet', e(50, 96, 40, 4.5, '#0000001c') +
  g('translate(0 -2)', foot()) + g('translate(100 -2) scale(-1 1)', foot()));

// ---- nail: a big steel nail hammered into a plank, hammer beside it ---------------------------------------------------
put('nail', shadow(95, 42) +
  r(4, 66, 92, 28, 4, '#b8793a') + r(4, 66, 92, 8, 4, '#d99a57') + r(4, 86, 92, 8, 4, '#7a4a1d', 0, 'opacity=".5"') +
  s('M10 78 q20 -3 40 0 t40 -1 M10 86 q24 3 48 0 t30 1', '#8a5a2b', 1.8, 'opacity=".7"') + e(74, 82, 6, 3.4, '#8a5a2b') +
  // the nail
  p('M24 26 H36 L34.5 72 H25.5Z', '#8896a5') + p('M24 26 H30 L29.5 72 H25.5Z', '#cdd6df') +
  e(30, 28, 15, 5.5, '#6b7685') + e(30, 25, 15, 5.5, '#b5bfca') + e(30, 24, 15, 3.6, '#dde4ea') + e(25, 23, 4, 1.4, K.white) +
  e(30, 71, 5.4, 2, '#00000033') +
  // the hammer
  g('translate(66 40) rotate(28)',
    r(-4, 6, 8, 46, 3.5, K.dbrown) + r(-4, 6, 3.5, 46, 1.8, K.brown) +
    r(-17, -10, 34, 17, 4, K.dgrey) + r(-17, -10, 34, 8, 4, '#c9d3e0') + r(-17, -10, 9, 17, 3, '#8896a5') + r(-14, -8, 12, 3, 1.5, '#ffffffaa')));

// ---- shoe: a child's lace-up trainer, side view -----------------------------------------------------------------------------
put('shoe', shadow(94, 42) +
  p('M10 78 H96 Q98 78 98 83 Q96 91 86 91 H16 Q6 91 8 80Z', '#d9dfe8') +
  p('M10 76 H96 Q98 76 98 80 Q96 87 86 87 H16 Q6 87 8 78Z', K.white) + r(10, 80, 86, 2.6, 1.3, '#ef476f66') +
  p('M10 78 L10 40 Q10 30 20 30 L30 30 L31 14 Q41 10 50 16 L50 34 Q58 46 70 50 Q92 56 96 72 L96 78Z', K.dred) +
  p('M10 76 L10 42 Q10 32 20 32 L30 32 L32 18 Q42 14 49 20 L49 36 Q58 48 70 52 Q90 58 94 72 L94 76Z', K.red) +
  p('M64 51 Q90 58 94 72 L94 76 L72 76 Q76 62 64 51Z', K.dred, 'opacity=".55"') +
  p('M10 78 L10 56 Q22 56 24 66 Q26 76 22 78Z', K.dred, 'opacity=".6"') +
  p('M31 30 L30 28 L50 34 L49 40 L33 36Z', '#c2284f', 'opacity=".6"') +
  s('M40 30 L68 52', K.dred, 11) + s('M40 30 L68 52', '#a31f43', 7, 'opacity=".5"') +
  [0.08, 0.3, 0.52, 0.74].map((t2) => { const x = 40 + 28 * t2 * 1.0, y = 30 + 22 * t2; return s(`M${(x - 5.5).toFixed(1)} ${(y + 5.5).toFixed(1)} L${(x + 5.5).toFixed(1)} ${(y - 5.5).toFixed(1)}`, K.white, 3.4); }).join('') +
  star(26, 60, 10, K.yellow) + star(26, 60, 10, 'none').replace('fill="none"', 'fill="none" stroke="#e0a100" stroke-width="1.4"') +
  p('M16 40 q6 -8 12 -6', 'none', 'stroke="#ffffff88" stroke-width="3" stroke-linecap="round"'));

// ---- hill: a green hill with a winding path, a flag, a tree and flowers ----------------------------------------------------
const flower = (x: number, y: number, col: string, stemH = 8): string =>
  s(`M${x} ${y} v${stemH}`, K.dgreen, 1.8) + c(x - 2.6, y, 2.2, col) + c(x + 2.6, y, 2.2, col) + c(x, y - 2.6, 2.2, col) + c(x, y + 2.6, 2.2, col) + c(x, y, 1.6, K.yellow);
put('hill', shadow(96, 46) +
  p('M-2 94 Q2 30 50 28 Q98 30 102 94Z', K.dgreen) +
  p('M0 92 Q4 33 50 31 Q96 33 100 92Z', K.green) +
  p('M0 92 Q4 33 50 31 Q30 46 32 92Z', '#86dc92', 'opacity=".7"') +
  // the winding path
  p('M30 94 Q66 86 44 74 Q24 64 52 54 Q70 48 52 40 Q48 36 50 34 Q54 36 58 40 Q78 50 60 58 Q40 66 58 72 Q86 84 74 94Z', '#f0d6a0') +
  p('M52 54 Q40 60 52 66', 'none', 'stroke="#ffffff55" stroke-width="2" stroke-linecap="round"') +
  // flag on top
  s('M50 33 V7', K.dbrown, 3) + p('M51 8 L75 15 L51 23Z', K.red) + p('M51 8 L63 11.5 L51 15Z', '#ff8fa3') + c(50, 6, 2.6, K.yellow) +
  // little tree on the slope
  r(80, 56, 4, 12, 1.5, K.dbrown) + c(82, 50, 9, K.dgreen) + c(82, 48, 8, '#2f8a4c') + c(79, 45, 3, '#ffffff33') +
  flower(14, 78, K.pink) + flower(22, 86, K.yellow, 6) + flower(86, 80, K.white) + flower(92, 87, K.pink, 6) + flower(34, 71, K.yellow, 6));

// ---- lip: a friendly smiling pair of lips ----------------------------------------------------------------------------------------
put('lip', shadow(88, 34) +
  p('M8 46 Q50 66 92 46 Q82 76 50 76 Q18 76 8 46Z', K.dred, 'transform="translate(0 2.5)"') +
  p('M8 46 Q50 66 92 46 Q82 74 50 74 Q18 74 8 46Z', K.red) +
  p('M8 46 Q50 66 92 46 Q78 40 66 32 Q56 26 50 33 Q44 26 34 32 Q22 40 8 46Z', '#d63a63') +
  p('M8 46 Q50 66 92 46', 'none', 'stroke="#9e1f45" stroke-width="2.6" stroke-linecap="round"') +
  s('M11 40 q-2 4 0 8 M89 40 q2 4 0 8', '#c2284f', 2.6) +
  e(50, 67, 15, 3.6, '#ffffffaa') + e(31, 56, 5.5, 2.2, '#ffffff77', 24) + p('M37 33 Q43 29 47 34', 'none', 'stroke="#ffffff88" stroke-width="2.6" stroke-linecap="round"'));

// ---- cup: a pink-and-white china teacup on a saucer ---------------------------------------------------------------------------
put('cup', shadow(93, 42) +
  e(50, 82, 44, 10, '#e0607f') + e(50, 80, 44, 10, K.pink) + e(50, 79, 33, 6.4, '#ffd3de') + e(50, 80, 22, 4.4, '#ffb6c9') +
  // handle
  s('M76 46 q20 -2 18 12 q-2 12 -17 10', K.dpink, 7) + s('M76 46 q20 -2 18 12 q-2 12 -17 10', K.pink, 4) +
  // bowl
  p('M15 38 Q15 80 50 80 Q85 80 85 38Z', '#d9e1ec') + p('M15 36 Q15 77 50 77 Q85 77 85 36Z', K.white) +
  p('M17 50 Q19 62 26 68 H74 Q81 62 83 50Z', K.pink, 'opacity=".85"') + p('M17 50 H83', 'none', 'stroke="#fff" stroke-width="2.4"') +
  [30, 44, 58, 72].map((x) => c(x, 58, 2.6, K.white)).join('') +
  e(50, 36, 35, 8, '#f3f6fa') + e(50, 38, 31, 5.8, '#c9884a') + e(50, 37, 31, 4.6, '#dba062') + e(38, 36, 8, 1.6, '#ffffff77') +
  p('M25 46 q-1 10 6 17', 'none', 'stroke="#ffffffcc" stroke-width="3.4" stroke-linecap="round"') +
  s('M38 24 q-7 -7 0 -13 q6 -5 0 -10 M54 24 q-7 -7 0 -13 q6 -5 0 -10', '#b9c3cf', 3, 'opacity=".75"'));

// ---- mop: a bold mop standing in a small blue bucket -----------------------------------------------------------------------------
const mopStrand = (i: number): string => {
  const k = i - 4;
  const x1 = 36 + k * 4.6;
  const y1 = 93 - Math.abs(k) * 1.6;
  const col = ['#f3f1ea', '#d5dce6', '#fbf6e4', '#c3ccd9', '#eef0f4'][i % 5] ?? '#f3f1ea';
  const d = `M${36 + k * 1.2} 52 C${36 + k * 2.6} 62 ${x1} 66 ${x1} ${y1}`;
  return s(d, '#2b3a4f22', 7.6, 'transform="translate(1.2 1.2)"') + s(d, col, 6.2);
};
put('mop', shadow(95, 40) +
  // the mop: upright handle, a clear head of thick hanging strands
  g('rotate(4 36 50)', r(33, 0, 6.4, 52, 3, K.dbrown) + r(33, 0, 3, 52, 1.5, K.brown) + e(36.2, 1.6, 5, 3, K.brown) +
    p('M22 60 Q36 40 50 60Z', '#e3e8f0') +
    [0, 8, 1, 7, 2, 6, 3, 5, 4].map((i) => mopStrand(i)).join('') +
    r(26, 44, 20, 10, 3.5, K.dgrey) + r(26, 44, 20, 4, 2, '#c9d3e0') + r(30, 54, 12, 3, 1.5, '#8896a5')) +
  // the bucket beside it
  s('M64 66 Q79 36 94 66', K.dgrey, 3) +
  p('M60 64 L98 64 L93 94 Q79 99 65 94Z', K.dblue) + p('M60 64 L98 64 L94 92 Q79 97 64 92Z', K.blue) +
  p('M60 64 L98 64 L97 72 L61 72Z', '#3aa9bf') + e(79, 64, 19, 5, '#2b8fa3') + e(79, 65, 16, 3.2, '#bfe8ff') +
  p('M67 76 L69 90', 'none', 'stroke="#ffffff77" stroke-width="4" stroke-linecap="round"') +
  c(72, 60, 2.6, '#ffffffcc') + c(80, 57, 3.2, '#ffffffcc') + c(87, 60, 2.2, '#ffffffcc'));

export const install = (): void => {
  for (const [word, body] of drawings) add(word, body);
};
