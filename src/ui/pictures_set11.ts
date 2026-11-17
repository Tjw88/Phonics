import { K, add, c, e, eye, p, r, s, shadow } from './pictureKit';

/** Picture cards for the words of these sets (viewBox 0 0 100 100, flat fills, no outlines, `shadow()` first). */

/** A five-pointed star as a path. */
const star = (cx: number, cy: number, R: number, ri: number, rot = 0): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((rot - 90 + i * 36) * Math.PI) / 180, rr = i % 2 ? ri : R;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')}Z`;
};
/** A four-point sparkle. */
const sparkle = (x: number, y: number, R: number, f: string): string =>
  p(`M${x} ${y - R} Q${x + R * 0.18} ${y - R * 0.18} ${x + R} ${y} Q${x + R * 0.18} ${y + R * 0.18} ${x} ${y + R} Q${x - R * 0.18} ${y + R * 0.18} ${x - R} ${y} Q${x - R * 0.18} ${y - R * 0.18} ${x} ${y - R}Z`, f);

/** A fern frond: a curved stem with pairs of leaflets that shrink towards the tip. */
const frond = (): string => {
  const P0 = [44, 94], P1 = [30, 50], P2 = [64, 8];
  const at = (t: number): [number, number, number] => {
    const x = (1 - t) ** 2 * P0[0]! + 2 * (1 - t) * t * P1[0]! + t * t * P2[0]!;
    const y = (1 - t) ** 2 * P0[1]! + 2 * (1 - t) * t * P1[1]! + t * t * P2[1]!;
    const dx = 2 * (1 - t) * (P1[0]! - P0[0]!) + 2 * t * (P2[0]! - P1[0]!);
    const dy = 2 * (1 - t) * (P1[1]! - P0[1]!) + 2 * t * (P2[1]! - P1[1]!);
    return [x, y, (Math.atan2(dy, dx) * 180) / Math.PI];
  };
  let dark = '', light = '';
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = 0.16 + (i / (n - 1)) * 0.78;
    const [x, y, a] = at(t);
    const len = 17 * (1 - 0.72 * (i / (n - 1))) + 3.5, wid = len * 0.34;
    for (const side of [-1, 1]) {
      const an = a + side * 62;
      const ox = x + Math.cos((an * Math.PI) / 180) * len * 0.9, oy = y + Math.sin((an * Math.PI) / 180) * len * 0.9;
      dark += e(ox + 0.8, oy + 1.4, len, wid, K.dgreen, an);
      light += e(ox, oy, len, wid, i % 2 ? K.green : '#7fdc8e', an);
    }
  }
  const tip = at(1);
  return s('M44 94 Q30 50 64 8', K.dgreen, 4.4) + dark + light + c(tip[0], tip[1], 3.4, K.green) + s('M44 94 Q30 50 64 8', '#4fb36a', 2) + s('M44 95 v3', K.dbrown, 4);
};

export const install = (): void => {
  // ---- air: a red balloon being blown up with a hand pump; puffs of air travel along the hose ----
  add('air', shadow(95, 36) +
    e(31, 33, 25, 28, '#c2284f') + e(29, 31, 25, 28, K.red) + e(20, 20, 6, 9, '#ffffffaa', 28) + p('M31 62 L25 70 L37 70Z', '#c2284f') +
    s('M31 70 Q31 90 66 84', K.dgrey, 5) + s('M31 70 Q31 90 66 84', K.grey, 2.2) +
    r(58, 94, 38, 5, 2.5, K.dgrey) + r(66, 46, 20, 48, 6, K.dblue) + r(66, 46, 20, 46, 6, K.blue) + r(70, 50, 5, 38, 2.5, '#ffffff77') + r(62, 76, 6, 10, 2, K.dgrey) +
    r(74, 24, 4.4, 24, 2, K.dgrey) + r(62, 17, 28, 8, 4, K.orange) + r(62, 17, 28, 3, 1.5, '#ffb066') +
    [[46, 78, 4.4], [52, 76, 5.2], [58, 78, 4.2]].map(([x, y, rr]) => c(x!, y! - 14, rr!, '#e4f5ff', 'stroke="#4cc3d9" stroke-width="1.8"')).join('') +
    [[44, 52, 3.6], [49, 50, 4.6], [55, 52, 3.4]].map(([x, y, rr]) => c(x!, y!, rr!, '#e4f5ff', 'stroke="#4cc3d9" stroke-width="1.8"')).join('') +
    s('M60 40 q6 6 0 12 M65 34 q9 10 0 24', '#4cc3d9', 2.6));

  // ---- clown: soft rainbow wig, red nose, ruff collar, big smile ----
  const wig: [number, number, string][] = [[26, 32, K.violet], [19, 46, K.blue], [24, 60, K.green], [74, 32, K.yellow], [81, 46, K.orange], [76, 60, K.pink]];
  add('clown', shadow(96, 32) +
    p('M14 100 Q14 84 30 82 H70 Q86 84 86 100Z', K.blue) + c(24, 94, 3, K.yellow) + c(76, 94, 3, K.yellow) + c(50, 95, 3, K.yellow) +
    [[30, 82], [42, 85], [54, 86], [66, 85], [74, 82]].map(([x, y]) => c(x!, y! + 1.5, 8.5, '#c9d8e8')).join('') + [[30, 80], [42, 83], [54, 84], [66, 83], [74, 80]].map(([x, y]) => c(x!, y!, 8.5, K.white)).join('') +
    wig.map(([x, y, f]) => c(x, y + 1.5, 11.5, f, 'opacity=".75"')).join('') + wig.map(([x, y, f]) => c(x, y, 11.5, f)).join('') +
    c(40, 17, 9, K.red) + c(50, 14, 10, K.orange) + c(60, 17, 9, K.green) + c(50, 52, 25, '#fff0e3') + c(50, 52, 25, 'none', 'stroke="#f5d9c4" stroke-width="1.5"') +
    c(36, 28, 5, '#ffffff77') + e(35.5, 41, 5.5, 4, K.blue, -15) + e(64.5, 41, 5.5, 4, K.blue, 15) + eye(36, 46, 3.6) + eye(64, 46, 3.6) +
    c(50, 54, 7.2, K.dred) + c(50, 53, 7.2, K.red) + c(47.8, 50.6, 2.2, '#ffffff99') + c(31, 58, 4.6, K.pink, 'opacity=".55"') + c(69, 58, 4.6, K.pink, 'opacity=".55"') +
    p('M33 62 Q50 68 67 62 Q62 78 50 78 Q38 78 33 62Z', K.dred) + p('M38 70 Q50 66 62 70 Q58 77 50 77 Q42 77 38 70Z', K.pink) + s('M33 62 Q50 68 67 62', K.dred, 2.4));

  // ---- coin: gold coin with a star, slightly tilted, with a sparkle ----
  add('coin', shadow(95, 28) + '<g transform="rotate(-14 48 54)">' + e(53, 59, 34, 38, K.dyellow) + e(48, 54, 34, 38, '#e8a21f') + e(48, 54, 30, 34, K.yellow) + e(48, 54, 24, 28, '#e8a21f') +
    e(48, 54, 22, 26, '#ffdf8a') + p(star(48, 55, 17, 7.4, 4), '#e8a21f', 'transform="translate(1.4 2)"') + p(star(48, 55, 17, 7.4, 4), K.orange) + p(star(48, 55, 13, 5.6, 4), K.yellow, 'transform="translate(-.4 -.8)"') +
    p('M24 38 Q32 22 50 22', 'none', 'stroke="#ffffff99" stroke-width="4.4" stroke-linecap="round"') + '</g>' + sparkle(84, 18, 10, '#ffd23f') + sparkle(84, 18, 5, K.white) + sparkle(18, 86, 5.4, '#ffd23f') + sparkle(90, 76, 3.6, '#ffd23f'));

  // ---- crown: a gold crown with jewels on a red cushion (no face, no cloak) ----
  add('crown', shadow(96, 38) +
    p('M6 80 Q6 70 18 70 H82 Q94 70 94 80 Q94 94 82 94 H18 Q6 94 6 80Z', K.dred) + p('M6 80 Q6 70 18 70 H82 Q94 70 94 80 Q94 88 82 88 H18 Q6 88 6 80Z', K.red) + e(50, 74, 36, 6, K.dred) +
    s('M12 86 Q50 96 88 86', '#ffffff55', 2) + [10, 90].map((x) => c(x, 93, 4.4, K.yellow) + c(x, 93, 1.5, K.dyellow)).join('') +
    p('M20 78 L14 32 L33 50 L50 20 L67 50 L86 32 L80 78 Q50 86 20 78Z', K.dyellow) + p('M22 74 L17 37 L34 54 L50 25 L66 54 L83 37 L78 74 Q50 82 22 74Z', K.yellow) +
    p('M22 74 Q50 82 78 74 L79 62 Q50 70 21 62Z', '#f2b705') + p('M21 62 Q50 70 79 62 L79 59 Q50 67 21 59Z', '#ffe9a0') +
    c(14, 30, 5, K.yellow) + c(50, 18, 5.6, K.yellow) + c(86, 30, 5, K.yellow) + c(12.6, 28.6, 1.6, K.white) + c(48.6, 16.4, 1.8, K.white) + c(84.6, 28.6, 1.6, K.white) +
    '<path d="M50 56 L58 66 L50 76 L42 66Z" fill="#c2284f"/><path d="M50 56 L58 66 L50 66Z" fill="#ef476f"/>' + c(30, 66, 5, K.blue) + c(70, 66, 5, K.green) + c(28.6, 64.4, 1.5, K.white) + c(68.6, 64.4, 1.5, K.white) +
    p('M30 44 L28 36', 'none', 'stroke="#ffffff88" stroke-width="3" stroke-linecap="round"'));

  // ---- ear: a cartoon ear in profile on a round pale patch ----
  const earShape = 'M46 14 C68 8 82 26 78 48 C76 60 68 66 66 76 C64 90 46 94 40 82 C37 76 40 70 34 64 C22 52 26 20 46 14Z';
  add('ear', shadow(95, 28) + c(50, 52, 45, '#e4f2ff') +
    p(earShape, K.dskin, 'transform="translate(2 2.4)"') + p(earShape, '#fbd3b0') +
    p('M47 24 C64 22 70 38 66 50 C63 58 58 62 57 70', 'none', 'stroke="#e8a67a" stroke-width="5.5" stroke-linecap="round"') +
    p('M44 38 C54 34 58 46 52 54 C49 58 52 64 54 68', 'none', 'stroke="#e8a67a" stroke-width="4.4" stroke-linecap="round"') +
    e(52, 49, 5, 6.5, '#d98f62', 8) + e(50, 82, 8, 5, '#ffe3cc', -10) + p('M33 34 Q36 24 46 20', 'none', 'stroke="#ffffff88" stroke-width="3.6" stroke-linecap="round"'));

  // ---- fern: a green frond ----
  add('fern', shadow(96, 22) + c(50, 52, 45, '#e9f8e6') + frond());

  // ---- hair: a smiling child's head from the front with a big mop of wavy brown hair, and a hairbrush beside it ----
  {
    const bumps = [[18, 34, 13], [26, 20, 14], [40, 14, 14], [54, 18, 14], [64, 30, 13], [66, 46, 12], [14, 52, 12], [16, 68, 12], [66, 62, 12], [20, 82, 11], [62, 78, 11]];
    add('hair', shadow(97, 38) +
      e(40, 90, 26, 12, K.dblue) + e(40, 88, 26, 12, K.blue) +
      bumps.map(([x, y, rr]) => c(x! + 1.5, y! + 2, rr!, K.dbrown)).join('') + e(41, 52, 28, 36, K.dbrown) +
      bumps.map(([x, y, rr]) => c(x!, y!, rr!, K.brown)).join('') + e(40, 50, 28, 36, K.brown) +
      s('M18 56 C12 66 22 72 16 84 M62 56 C68 66 58 72 64 84', '#9a6228', 2.6) +
      r(34, 66, 12, 14, 5, K.dskin) + c(40, 52, 22, K.dskin) + e(40, 56, 21, 20, K.skin) +
      p('M16 46 C16 24 28 18 40 20 C52 18 64 26 64 46 C58 38 54 34 48 38 C44 28 36 36 32 36 C26 34 20 38 16 46Z', K.dbrown) +
      p('M18 44 C18 26 28 21 40 22 C52 21 62 28 62 44 C57 37 52 34 48 38 C43 29 36 35 32 36 C26 33 21 37 18 44Z', K.brown) +
      s('M26 28 C32 22 38 22 44 25', '#e8b56f', 2.6, 'opacity=".75"') +
      eye(32, 54, 3.4) + eye(48, 54, 3.4) + c(27, 61, 3.8, K.pink, 'opacity=".6"') + c(53, 61, 3.8, K.pink, 'opacity=".6"') + s('M34 62 q6 5 12 0', K.dred, 2.2) +
      '<g transform="rotate(18 80 60)">' +
        r(77, 58, 6, 34, 3, K.dpink) + r(77, 58, 3, 34, 2, K.pink) +
        r(68, 24, 24, 38, 11, '#e0607f') + r(68, 22, 24, 38, 11, K.pink) + r(72, 26, 16, 6, 3, '#ffffff88') +
        [[74, 38], [80, 38], [86, 38], [74, 46], [80, 46], [86, 46], [74, 54], [80, 54], [86, 54]].map(([x, y]) => c(x!, y!, 1.8, K.white)).join('') +
      '</g>');
  }

  // ---- oil: a golden drop beside a small cruet bottle with a spout ----
  add('oil', shadow(95, 36) +
    p('M30 18 C26 32 8 52 8 68 C8 82 18 92 30 92 C42 92 52 82 52 68 C52 52 34 32 30 18Z', '#e0a100') + p('M30 22 C27 34 12 52 12 68 C12 80 20 88 30 88 C40 88 48 80 48 68 C48 52 33 34 30 22Z', K.yellow) +
    p('M18 70 Q16 58 24 50', 'none', 'stroke="#ffffffcc" stroke-width="4.6" stroke-linecap="round"') + c(23, 79, 2.2, '#ffffffaa') +
    r(58, 42, 36, 50, 12, '#a9d9d0') + r(60, 52, 32, 38, 10, '#f2b705') + r(60, 52, 32, 8, 4, '#ffd166') + r(58, 42, 36, 50, 12, '#ffffff', 0, 'opacity=".22"') +
    p('M68 44 V30 H84 V44Z', '#a9d9d0') + r(66, 28, 20, 5, 2.5, K.dgreen) + p('M69 28 L73 12 H79 L83 28Z', K.green) + p('M73 12 H79 L80 8 H72Z', K.dgreen) +
    r(63, 46, 4, 38, 2, '#ffffffbb') + e(76, 69, 8, 3.4, '#ffffff55'));

  // ---- owl: a friendly brown owl with big eyes on a branch ----
  add('owl', shadow(97, 36) +
    p('M4 86 Q50 80 96 88 L96 94 Q50 88 4 92Z', K.dbrown) + p('M4 84 Q50 78 96 86 L96 90 Q50 84 4 88Z', K.brown) + p('M80 84 q6 -8 14 -6 q-4 6 -10 8Z', K.green) +
    p('M20 40 L18 12 L38 26Z M80 40 L82 12 L62 26Z', '#8a5a2b') + e(50, 56, 32, 34, '#8a5a2b') + e(50, 54, 32, 33, K.brown) +
    p('M12 52 Q6 74 22 82 Q28 66 26 52Z', '#8a5a2b') + p('M88 52 Q94 74 78 82 Q72 66 74 52Z', '#8a5a2b') +
    e(50, 68, 17, 20, K.cream) + [[42, 60], [58, 60], [50, 68], [42, 76], [58, 76], [50, 82]].map(([x, y]) => s(`M${x! - 4.5} ${y!} q4.5 5 9 0`, '#e8c48a', 2)).join('') +
    c(36, 40, 15, K.cream) + c(64, 40, 15, K.cream) + c(36, 40, 15, 'none', 'stroke="#d9a066" stroke-width="2.4"') + c(64, 40, 15, 'none', 'stroke="#d9a066" stroke-width="2.4"') +
    c(37, 41, 8, '#5a3a1a') + c(63, 41, 8, '#5a3a1a') + c(37, 41, 5, K.ink) + c(63, 41, 5, K.ink) + c(39.4, 38.6, 2.4, K.white) + c(65.4, 38.6, 2.4, K.white) +
    p('M44 48 L56 48 L50 60Z', K.orange) + p('M44 48 L50 50 L50 60Z', K.dorange, 'opacity=".5"') +
    s('M34 87 l-3 -5 M38 87 v-6 M42 87 l3 -5 M58 87 l-3 -5 M62 87 v-6 M66 87 l3 -5', K.orange, 3));

  // ---- pair: two matching red mittens joined by a string ----
  const mitten = (x: number, mirror: boolean): string =>
    `<g transform="translate(${x} 0)${mirror ? ' scale(-1 1)' : ''}">` +
    p('M-13 36 V62 Q-13 86 0 86 Q13 86 13 62 V36Z', K.dred) + e(13, 60, 6.5, 11, K.dred, -14) +
    p('M-11 36 V62 Q-11 83 0 83 Q11 83 11 62 V36Z', K.red) + e(12, 59, 5, 9.5, K.red, -14) + p('M-8 46 V62', 'none', 'stroke="#ffffff77" stroke-width="3.6" stroke-linecap="round"') +
    c(0, 62, 5, K.white) + p('M0 56 L1.6 60.4 L6 62 L1.6 63.6 L0 68 L-1.6 63.6 L-6 62 L-1.6 60.4Z', K.red) +
    r(-15, 24, 30, 15, 5, '#dfe8f0') + r(-15, 25, 30, 14, 5, K.white) + [-8, 0, 8].map((xx) => r(xx - 2, 25, 4, 14, 0, K.blue)).join('') + '</g>';
  add('pair', shadow(95, 32) + s('M27 26 C27 -4 73 -4 73 26', '#8a5a2b', 3.4) + s('M27 26 C27 -4 73 -4 73 26', K.tan, 1.4) + c(27, 25, 3, '#8a5a2b') + c(73, 25, 3, '#8a5a2b') + mitten(27, false) + mitten(73, true));

  // ---- stair: four wooden steps with a hand rail ----
  const steps = [0, 1, 2, 3].map((i) => {
    const x = 8 + i * 21, top = 78 - i * 13;
    return r(x, top, 22, 90 - top, 0, '#a8703a') + r(x, top, 22, 6, 0, '#e8b56f') + r(x, top + 6, 22, 1.4, 0, '#7a4a1d', 0, 'opacity=".5"') + (i ? s(`M${x + 4} ${top + 14} H${x + 14}`, '#8a5a2b', 1.4) : '') + (i > 1 ? s(`M${x + 8} ${top + 20} H${x + 18}`, '#8a5a2b', 1.4, 'opacity=".7"') : '');
  }).join('');
  add('stair', shadow(95, 42) + steps +
    [0, 1, 2, 3].map((i) => r(17 + i * 21, 52 - i * 13, 4, 26, 1.6, K.dbrown) + r(17 + i * 21, 52 - i * 13, 1.6, 26, 0.8, '#d9a066')).join('') +
    s('M12 54 L88 14', K.dbrown, 6.5) + s('M12 53 L88 13', K.brown, 3.8) + s('M20 49 L50 33', '#ffffff55', 1.4) + c(12, 54, 3.6, K.dbrown));
};
