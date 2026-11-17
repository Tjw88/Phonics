import { K, add, c, e, eye, p, r, s, shadow } from './pictureKit';

/** Picture cards for the words of these sets (viewBox 0 0 100 100, flat fills, no outlines, `shadow()` first). */
export const install = (): void => {
  void [K, add, c, e, eye, p, r, s, shadow];

  // ---- box: an open cardboard box with flaps ----
  add('box', shadow(94, 36) +
    p('M20 40 L8 18 L34 12 L42 40Z', '#d9a066') + p('M80 40 L92 18 L66 12 L58 40Z', '#d9a066') +
    p('M20 40 L8 18 L16 17 L26 40Z', '#b9803f') + p('M80 40 L92 18 L84 17 L74 40Z', '#b9803f') +
    p('M16 40 H84 L88 52 H12Z', '#7a4a1d') +
    r(12, 46, 76, 46, 4, '#e8b878') + r(12, 46, 76, 8, 3, '#d9a066') +
    r(41, 46, 18, 46, 0, '#fff3d6') + r(41, 46, 18, 8, 0, '#f2d9a8') +
    r(36, 66, 28, 8, 4, '#b9803f') + r(18, 58, 6, 28, 3, '#ffffff55'));

  // ---- jam: glass jar of red jam with a gingham cloth lid and a spoon ----
  const check = (x0: number, x1: number, y0: number, y1: number, sz: number): string => {
    let out = '';
    for (let j = 0, y = y0; y < y1; y += sz, j++) for (let i = 0, x = x0; x < x1; x += sz, i++) if ((i + j) % 2 === 0) out += r(x, y, Math.min(sz, x1 - x), Math.min(sz, y1 - y), 0, '#ef476f');
    return out;
  };
  add('jam', shadow(94, 32) +
    r(18, 36, 54, 56, 13, '#d3eef6') + r(22, 46, 46, 42, 10, K.dred) +
    r(25, 49, 40, 36, 8, K.red) + c(36, 60, 4, '#ffffff66') + c(52, 72, 3, K.dred) + c(44, 78, 2.4, K.dred) + r(24, 56, 5, 24, 2.5, '#ffffff77') +
    r(22, 30, 46, 10, 4, '#b9dbe6') +
    p('M14 22 H76 L82 34 Q70 40 60 36 Q45 42 30 36 Q20 40 8 34Z', K.white) +
    check(14, 76, 22, 36, 8) +
    s('M20 33 Q45 40 70 33', K.dgreen, 3.4) +
    e(86, 62, 6.5, 9, K.grey, -8) + e(84.5, 59, 2.4, 3.6, '#ffffff99', -8) + s('M88 70 L92 94', K.grey, 5) + s('M88 70 L91 90', '#dfe6ec', 1.6));

  // ---- jet: a small friendly passenger jet, side view ----
  add('jet', shadow(94, 36) + '<g transform="rotate(-8 50 52)">' +
    p('M44 50 L58 30 L68 30 L62 50Z', '#8fb3d9') +
    p('M10 52 L6 24 L20 24 L36 48Z', K.blue) + p('M10 52 L6 24 L12 24 L20 52Z', K.dblue) +
    p('M14 52 L2 44 L10 40 L24 50Z', '#8fb3d9') +
    p('M8 54 Q8 42 24 42 H80 Q96 46 96 54 Q96 64 80 66 H24 Q8 66 8 54Z', K.white) +
    p('M8 56 H96 Q95 64 80 66 H24 Q9 66 8 56Z', '#dfe8f0') +
    r(12, 54, 82, 4.5, 2, K.blue) +
    p('M82 44 Q92 46 95 51 L78 51Z', K.dblue) +
    [24, 33, 42, 51, 60, 69].map((x) => r(x, 46.5, 5.4, 5.4, 2.4, K.dblue)).join('') +
    p('M40 60 L18 84 L34 84 L66 62Z', K.blue) + p('M40 60 L18 84 L24 84 L48 61Z', K.dblue) +
    e(54, 69, 9, 4.6, K.grey) + e(54, 68, 8, 3, '#dfe6ec') + r(44, 63, 6, 4, 1, K.grey) +
    e(34, 46, 10, 1.6, '#ffffff99') + '</g>');

  // ---- jug: pale blue ceramic jug with a cream stripe, handle and spout ----
  add('jug', shadow(94, 30) +
    s('M70 40 Q94 38 92 60 Q90 78 68 78', '#8fc6d6', 10) + s('M70 40 Q88 40 86 58 Q85 72 68 74', '#bfe8f5', 4) +
    p('M30 20 Q26 18 18 20 Q22 28 30 32 L30 40 Q22 52 24 70 Q26 92 48 92 Q72 92 74 70 Q76 52 68 40 L68 22Z', '#a8d8e8') +
    p('M24 70 Q26 92 48 92 Q72 92 74 70 Q76 52 68 40 L72 40 Q80 58 74 76 Q70 92 50 92Z', '#7fbcd0') +
    p('M24 56 Q50 64 75 56 L76 68 Q50 78 24 68Z', K.cream) + p('M24 56 Q50 64 75 56 L75 59 Q50 67 24 59Z', '#f2d9a8') +
    e(49, 21, 20, 5, '#7fbcd0') + e(49, 20, 19, 4, '#d6f0f9') + r(34, 40, 6, 36, 3, '#ffffff77', 8));

  // ---- queen: friendly queen with a gold crown, long hair and a simple gown ----
  add('queen', shadow(94, 34) +
    p('M12 96 Q12 66 50 66 Q88 66 88 96Z', K.violet) + p('M12 96 Q12 80 24 72 L30 96Z', K.dviolet) +
    p('M28 68 Q50 88 72 68 L78 76 Q50 98 22 76Z', K.white) + [36, 44, 50, 56, 64].map((x) => c(x, x === 50 ? 86 : x < 50 ? 82 + (x - 36) * 0.1 : 82 + (64 - x) * 0.1, 2.3, K.pink)).join('') +
    p('M20 40 Q10 60 14 82 Q22 92 32 80 L34 44Z M80 40 Q90 60 86 82 Q78 92 68 80 L66 44Z', '#a8672c') +
    p('M22 36 Q22 14 50 14 Q78 14 78 36 Q78 52 66 56 L34 56 Q22 52 22 36Z', '#c27a36') +
    c(50, 46, 21, K.skin) + e(50, 29, 21, 9, '#c27a36') + p('M29 36 Q50 22 71 36 Q60 28 50 28 Q40 28 29 36Z', '#c27a36') +
    eye(42, 46, 3.4) + eye(58, 46, 3.4) + c(50, 52, 3, '#f0a572') + s('M44 58 q6 5 12 0', K.dred, 2.4) + c(33, 54, 3.6, K.pink, 'opacity=".55"') + c(67, 54, 3.6, K.pink, 'opacity=".55"') +
    p('M32 28 L28 8 L40 17 L50 3 L60 17 L72 8 L68 28Z', K.yellow) + r(31, 22, 38, 8, 3, K.dyellow) + c(28, 8, 3.2, K.pink) + c(50, 3, 3.4, K.red) + c(72, 8, 3.2, K.pink) +
    c(40, 26, 2.2, K.red) + c(50, 26, 2.2, K.blue) + c(60, 26, 2.2, K.red) + r(34, 10, 3.6, 10, 2, '#ffffff77', 12));

  // ---- quilt: a patchwork quilt on a bed, folded back at the top to show a pillow ----
  const qCols = [K.red, K.yellow, K.blue, K.green, K.violet, K.orange, K.pink, K.red, K.blue, K.yellow, K.green, K.orange, K.violet, K.pink, K.blue];
  let qPatches = '';
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) {
    const x = 10 + i * 16; const y = 47 + j * 14.4;
    qPatches += r(x + 0.8, y + 0.8, 14.4, 12.8, 1.6, qCols[j * 5 + i]!) + s(`M${x + 3.6} ${y + 3.4} L${x + 12.4} ${y + 10.6}`, '#ffffff99', 1.3, 'stroke-dasharray="2 2"') + s(`M${x + 12.4} ${y + 3.4} L${x + 3.6} ${y + 10.6}`, '#ffffff55', 1.3, 'stroke-dasharray="2 2"');
  }
  const scallops = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => c(14.5 + i * 10.4, 91, 5.6, i % 2 ? K.dred : K.red)).join('');
  add('quilt', shadow(96, 42) +
    r(4, 4, 92, 88, 9, K.dbrown) + r(4, 4, 92, 10, 5, '#a8703a') + r(9, 13, 82, 76, 6, '#f6efe3') +
    r(22, 16, 56, 24, 12, '#dfe7f0') + r(22, 14, 56, 24, 12, K.white) + s('M32 26 Q50 30 68 26', '#dfe7f0', 2) + r(28, 18, 14, 4, 2, '#ffffffcc') +
    r(9, 44, 82, 46, 4, K.dviolet) + scallops + r(9, 44, 82, 46, 4, 'none') +
    qPatches +
    s('M10 45 H90 M10 59.4 H90 M10 73.8 H90', '#ffffffaa', 1.4, 'stroke-dasharray="3 2.4"') +
    p('M9 44 Q50 36 91 44 V30 Q50 24 9 30Z', '#e0607f') + p('M9 30 Q50 24 91 30 V36 Q50 30 9 36Z', K.pink) +
    [[18, 38], [34, 40], [50, 40], [66, 40], [82, 38]].map(([x, y]) => c(x!, y!, 2.2, '#ffffffcc')).join('') +
    p('M9 44 Q50 36 91 44 V47 Q50 39 9 47Z', '#00000018'));

  // ---- van: a small yellow delivery van, side view ----
  add('van', shadow(94, 42) +
    p('M6 38 Q6 26 18 26 H66 Q74 26 78 34 L90 50 Q95 54 95 62 V76 Q95 80 91 80 H10 Q6 80 6 76Z', K.yellow) +
    p('M6 66 H95 V76 Q95 80 91 80 H10 Q6 80 6 76Z', K.dyellow) +
    p('M70 32 H74 Q76 32 78 35 L86 50 H70Z', K.sky) + p('M70 32 H73 L81 50 H70Z', '#ffffff66') +
    r(14, 34, 22, 16, 4, K.sky) + r(40, 34, 22, 16, 4, K.sky) + r(16, 36, 5, 12, 2, '#ffffff77') + r(42, 36, 5, 12, 2, '#ffffff77') +
    s('M38 30 V64', K.dyellow, 2.2) + r(8, 59, 86, 4, 0, K.red) + r(86, 60, 10, 6, 3, K.dgrey) + c(91, 56, 3.2, K.white) + r(5, 58, 4, 8, 2, K.red) + r(68, 56, 6, 2.6, 1.3, K.dyellow) +
    c(26, 80, 11, K.ink) + c(74, 80, 11, K.ink) + c(26, 80, 5, K.grey) + c(74, 80, 5, K.grey) + c(26, 80, 1.8, K.dgrey) + c(74, 80, 1.8, K.dgrey));

  // ---- vest: a child's waistcoat in a bright colour, with buttons ----
  add('vest', shadow(94, 30) +
    p('M30 14 L50 52 L70 14 L84 32 Q78 38 80 52 L78 88 Q50 96 22 88 L20 52 Q22 38 16 32Z', K.white) +
    p('M30 14 L44 12 L56 52 L56 90 Q40 92 24 88 L22 52 Q24 38 18 32Z', K.blue) +
    p('M70 14 L56 12 L44 52 L44 90 Q60 92 76 88 L78 52 Q76 38 82 32Z', K.blue) +
    p('M44 52 L56 52 L56 90 Q50 91 44 90Z', K.dblue) +
    p('M30 14 L44 12 L50 44 L44 52 L34 32Z', K.dblue) + p('M70 14 L56 12 L50 44 L56 52 L66 32Z', K.dblue) +
    p('M44 12 L50 40 L56 12Z', K.white) +
    c(50, 60, 3.4, K.yellow) + c(50, 72, 3.4, K.yellow) + c(50, 84, 3.4, K.yellow) +
    r(26, 66, 14, 3, 1.5, K.dblue) + r(60, 66, 14, 3, 1.5, K.dblue) + r(24, 54, 5, 30, 2.5, '#ffffff44'));

  // ---- web: a spider web with dewdrops, and one small friendly spider on a thread ----
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315].map((a): [number, number] => [50 + 46 * Math.cos((a * Math.PI) / 180), 56 + 46 * Math.sin((a * Math.PI) / 180)]);
  const ring = (k: number): string => spokes.map(([x, y], i) => `${i ? 'L' : 'M'}${(50 + (x - 50) * k).toFixed(1)} ${(56 + (y - 56) * k).toFixed(1)}`).join(' ') + 'Z';
  add('web', '<g>' +
    spokes.map(([x, y]) => s(`M50 56 L${x.toFixed(1)} ${y.toFixed(1)}`, '#7d93ad', 2.2)).join('') +
    [0.28, 0.5, 0.72, 0.94].map((k) => s(ring(k), '#7d93ad', 2.2)).join('') +
    ([[0.5, 0], [0.72, 90], [0.5, 180], [0.94, 225], [0.28, 270], [0.72, 315], [0.94, 45], [0.5, 135]] as Array<[number, number]>).map(([k, a]) => {
      const x = 50 + 46 * k * Math.cos((a * Math.PI) / 180); const y = 56 + 46 * k * Math.sin((a * Math.PI) / 180);
      return c(x, y, 3.4, '#bfe8ff') + c(x - 1, y - 1, 1.1, K.white);
    }).join('') +
    s('M80 2 V22', '#7d93ad', 2.2) +
    s('M74 26 q-8 -6 -12 -2 M74 30 q-10 0 -14 6 M86 26 q8 -6 12 -2 M86 30 q10 0 14 6', K.dviolet, 2.6) +
    e(80, 31, 9, 8, K.violet) + c(80, 25, 6.4, K.violet) + c(77.6, 24.6, 2.4, K.white) + c(82.4, 24.6, 2.4, K.white) + c(77.9, 24.9, 1.1, K.ink) + c(82.1, 24.9, 1.1, K.ink) +
    s('M78 28.2 q2 2 4 0', K.ink, 1.1) + e(76.5, 33, 3.6, 2.6, K.pink, -10) + '</g>');

  // ---- wig: a wavy bob wig with a fringe and parting, on a mannequin head stand ----
  add('wig', shadow(96, 24) +
    e(50, 92, 17, 3.6, K.dgrey) + r(46, 74, 8, 18, 3, K.grey) + r(46, 74, 3, 18, 1.5, '#ffffff55') +
    p('M50 8 C22 8 12 34 16 58 C18 68 12 74 18 82 C24 90 34 86 38 76 L62 76 C66 86 76 90 82 82 C88 74 82 68 84 58 C88 34 78 8 50 8Z', K.dviolet) +
    p('M18 82 C24 90 34 86 38 76 L36 70 C30 78 24 74 18 66Z M82 82 C76 90 66 86 62 76 L64 70 C70 78 76 74 82 66Z', '#5b49b8') +
    e(50, 54, 18, 26, '#f3e1c9') + e(44, 46, 3.4, 9, '#ffffff66') +
    p('M42 12 C20 18 18 42 22 56 C30 52 36 44 38 30 C40 24 42 18 42 12Z', K.violet) +
    p('M42 12 C68 12 80 30 80 54 C66 48 52 40 38 30 C40 24 42 18 42 12Z', K.violet) +
    p('M44 14 C64 16 74 28 76 44 C64 38 52 30 44 14Z', '#b6a9f6') +
    s('M42 12 C40 22 36 34 30 46', '#ffffff99', 2) +
    s('M26 34 C18 44 28 52 20 64 C16 72 24 78 22 84 M74 34 C82 44 72 52 80 64 C84 72 76 78 78 84', K.pink, 3) +
    s('M34 30 C28 40 34 46 28 58 M66 30 C72 40 66 46 72 58', '#ffffff88', 2.2) +
    s('M44 24 C54 28 62 34 68 42', '#ffffff77', 2.2));

  // ---- wing: a single bird's wing, side view: a curved leading edge and three rows of layered feathers ----
  const feather = (bx: number, by: number, ang: number, len: number, wid: number, f: string): string => {
    const a = (ang * Math.PI) / 180;
    return e(bx + (len / 2) * Math.cos(a), by - (len / 2) * Math.sin(a), len / 2, wid, f, -ang);
  };
  const fan = (angs: number[], len: number, wid: number, f: string, dx = 0): string => angs.map((a, i) => feather(14 + dx, 40, a, len - (i % 2) * 4, wid, f)).join('');
  add('wing', shadow(95, 32) +
    fan([22, 10, -2, -14, -26, -38], 82, 6.6, '#c4dbec') + fan([22, 10, -2, -14, -26, -38], 80, 6.2, K.white) +
    fan([26, 14, 2, -10, -22, -34, -46], 58, 6.4, '#9fd9ea') +
    fan([28, 17, 6, -5, -16, -27, -38, -49], 38, 5.6, K.blue) +
    p('M8 52 Q10 26 38 20 Q66 14 92 24 Q66 24 46 32 Q24 40 8 52Z', '#2fa0c4') + p('M14 46 Q22 28 44 24 Q62 21 80 23 Q58 26 42 32 Q26 38 14 46Z', '#6fd0e6') +
    c(12, 50, 5, '#2fa0c4') + s('M20 44 Q34 30 58 24', '#ffffff88', 2));

  // ---- yak: shaggy brown-black yak with horns and long fur ----
  const tufts = [14, 26, 38, 50, 62, 74, 86].map((x, i) => p(`M${x - 8} 70 Q${x} ${98 + (i % 2) * 4} ${x + 8} 70Z`, i % 2 ? '#3d2b22' : '#4a3328')).join('');
  add('yak', shadow(95, 36) +
    e(50, 66, 42, 24, '#3d2b22') + tufts + e(50, 66, 38, 22, '#4a3328') +
    s('M20 66 q-2 14 2 22 M34 70 q-2 12 1 20 M66 70 q2 12 -1 20 M80 66 q2 14 -2 22', '#5c4233', 2.4) +
    p('M30 36 Q14 34 12 12 Q20 18 36 24Z', K.cream) + p('M70 36 Q86 34 88 12 Q80 18 64 24Z', K.cream) +
    p('M12 12 Q20 18 36 24 L34 28 Q20 24 12 12Z', '#e0c48a') + p('M88 12 Q80 18 64 24 L66 28 Q80 24 88 12Z', '#e0c48a') +
    e(26, 46, 9, 5.5, '#3d2b22', 28) + e(74, 46, 9, 5.5, '#3d2b22', -28) +
    c(50, 46, 24, '#4a3328') + p('M28 36 Q50 12 72 36 Q60 30 56 40 Q50 28 44 40 Q40 30 28 36Z', '#3d2b22') +
    p('M26 44 Q22 62 30 72 L34 60Z M74 44 Q78 62 70 72 L66 60Z', '#3d2b22') +
    e(50, 58, 14, 11, '#9c7656') + e(50, 56, 13, 8.4, '#b4906d') + e(43, 57, 2, 3, K.ink, 10) + e(57, 57, 2, 3, K.ink, -10) + s('M44 63 q6 4 12 0', K.ink, 1.8) +
    eye(40, 44, 3.6) + eye(60, 44, 3.6) + c(30, 52, 3, K.pink, 'opacity=".4"') + c(70, 52, 3, K.pink, 'opacity=".4"'));

  // ---- yoyo: a red yo-yo on its string with a finger loop ----
  add('yoyo', shadow(95, 24) +
    s('M50 22 V46', '#8a95a3', 2.6) + p('M40 14 Q40 4 50 4 Q60 4 60 14 Q60 22 50 24 Q40 22 40 14Z', 'none', `stroke="${K.dgrey}" stroke-width="3"`) +
    c(50, 68, 27, K.dred) + c(50, 66, 27, K.red) + c(50, 66, 20, K.dred) + c(50, 66, 18, '#ff6f91') +
    c(50, 66, 8, K.yellow) + c(50, 66, 8, 'none', `stroke="${K.dyellow}" stroke-width="2"`) + c(50, 66, 2.6, K.dyellow) +
    s('M30 52 Q36 42 48 40', '#ffffffaa', 3.6) + s('M26 66 a24 24 0 0 0 4 12', '#ffffff55', 2));

  // ---- zebra: a friendly zebra, side view with stripes ----
  const stripe = (cx: number, cy: number, rx: number, ry: number, xs: number[], w = 4): string =>
    xs.map((x) => { const h = ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)) - 0.8; return s(`M${x} ${cy - h} Q${x + 3} ${cy} ${x - 1} ${cy + h}`, K.ink, w); }).join('');
  const ZW = '#f6f8fb'; const ZS = '#cfd8e6';
  add('zebra', shadow(95, 36) +
    s('M14 58 Q4 64 6 80', K.ink, 3.6) + e(6, 82, 4, 5.6, K.ink, 6) +
    [20, 30, 56, 66].map((x, i) => r(x - 4.5, 68, 9, 26, 3.4, i % 2 ? ZS : ZW) + r(x - 4.5, 74, 9, 3.4, 0, K.ink) + r(x - 4.5, 82, 9, 3.4, 0, K.ink) + r(x - 5, 90, 10, 5.4, 2.6, K.ink)).join('') +
    e(42, 66, 33, 19, ZS) + e(42, 63, 33, 19, ZW) + stripe(42, 63, 33, 19, [20, 28, 36, 44, 52, 60]) +
    p('M52 58 L60 28 L80 26 L76 64Z', ZW) + p('M72 28 L80 26 L76 64 L70 62Z', ZS) +
    s('M58 36 L77 34 M56 44 L76 43 M55 52 L75 52', K.ink, 3.8) +
    p('M52 58 L59 27 L64 25 L58 58Z', K.ink) +
    p('M70 22 L68 6 L80 14Z', ZW) + p('M70 22 L68 6 L73 9Z', K.ink) + p('M71 18 L70 10 L76 14Z', K.pink) + p('M80 22 L84 8 L90 20Z', ZW) + p('M80 22 L84 8 L86 13Z', K.ink) +
    e(84, 30, 15, 10.4, ZS, 24) + e(84, 28, 15, 10.4, ZW, 24) + s('M76 20 L80 26 M84 17 L87 23', K.ink, 3) + e(95, 37, 7.6, 7, '#4a4f5e', 24) + c(93, 38, 1.3, '#9aa3b3') + c(98, 36, 1.3, '#9aa3b3') +
    eye(86, 28, 3.6) + s('M89 43 q3 2 6 0', K.white, 1.6));

  // ---- zip: a jacket zip with a yellow pull tab, partly open ----
  const teeth = (x0: number, y0: number, x1: number, y1: number, n: number, side: number): string => {
    let out = '';
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n; const x = x0 + (x1 - x0) * t; const y = y0 + (y1 - y0) * t;
      out += `<rect x="${(x - (side > 0 ? 0 : 5)).toFixed(1)}" y="${(y - 2).toFixed(1)}" width="5" height="4" rx="1.4" fill="${i % 2 ? K.grey : '#dfe6ec'}"/>`;
    }
    return out;
  };
  let closed = '';
  for (let i = 0; i < 11; i++) closed += r(i % 2 ? 50 : 45, 52 + i * 3.8, 5, 3.2, 1.2, i % 2 ? K.grey : '#dfe6ec');
  add('zip', shadow(95, 36) +
    p('M6 4 H31 L47 52 V96 H6Z', K.dorange) + p('M94 4 H69 L53 52 V96 H94Z', K.dorange) +
    p('M6 4 H31 L47 52 V96 H6Z', K.orange) + p('M94 4 H69 L53 52 V96 H94Z', K.orange) +
    p('M31 4 L47 52 L69 4Z', '#fff3d6') + p('M31 4 L47 52 L50 36 L50 4Z', '#f2d9a8') +
    s('M14 8 V90 M86 8 V90', '#ffffff55', 2, 'stroke-dasharray="3 4"') +
    teeth(34, 8, 46, 50, 7, 0) + teeth(66, 8, 54, 50, 7, 1) + closed +
    r(41, 40, 18, 18, 6, K.dgrey) + r(42, 41, 16, 14, 5, K.grey) + r(44, 43, 5, 8, 2.5, '#ffffff99') +
    p('M44 58 H56 V74 Q56 82 50 82 Q44 82 44 74Z', K.dyellow) + p('M45 58 H55 V74 Q55 80 50 80 Q45 80 45 74Z', K.yellow) + e(50, 74, 2.8, 4.4, K.dyellow));

  // ---- zoo: a stone gateway with a giraffe peeking over the arch (no text) ----
  const spot = (x: number, y: number, rad: number): string => e(x, y, rad, rad * 0.8, '#b86b25', 20);
  add('zoo', shadow(96, 44) +
    r(28, 44, 44, 50, 0, '#7bc46f') + r(28, 80, 44, 14, 0, '#5fae5e') + p('M44 94 Q50 82 56 94Z', '#e8c48a') +
    p('M42 96 L44 28 H57 L59 96Z', K.yellow) + p('M54 28 H57 L59 96 H54Z', '#e8b533') +
    ([[47, 84, 3.4], [53, 70, 3.2], [47, 56, 3.2], [52, 44, 3], [48, 34, 2.8]] as Array<[number, number, number]>).map(([x, y, rad]) => spot(x, y, rad)).join('') +
    s('M46 14 V8 M54 14 V8', K.dyellow, 2.6) + c(46, 7, 2.6, K.dbrown) + c(54, 7, 2.6, K.dbrown) +
    e(39, 17, 6.4, 3.2, K.yellow, -30) + e(39, 17, 3.4, 1.6, K.pink, -30) + e(61, 17, 6.4, 3.2, K.yellow, 30) +
    e(50, 22, 11.5, 9, K.yellow) + e(60, 26, 7.6, 6.2, '#fdd98a') + c(62.5, 25, 1.2, K.ink) + c(65.5, 27, 1.2, K.ink) + eye(52, 19, 2.6) + spot(46, 25, 2.2) +
    p('M6 94 V54 Q6 48 12 48 H28 Q34 48 34 54 V94Z', '#d6cfbd') + p('M26 48 H28 Q34 48 34 54 V94 H26Z', '#bdb5a0') +
    p('M66 94 V54 Q66 48 72 48 H88 Q94 48 94 54 V94Z', '#d6cfbd') + p('M86 48 H88 Q94 48 94 54 V94 H86Z', '#bdb5a0') +
    r(2, 40, 36, 11, 4, '#e8e2d2') + r(62, 40, 36, 11, 4, '#e8e2d2') + r(2, 46, 36, 5, 2.5, '#cfc8b4') + r(62, 46, 36, 5, 2.5, '#cfc8b4') +
    c(20, 34, 6.6, '#e8e2d2') + c(80, 34, 6.6, '#e8e2d2') + c(18, 32, 2, '#ffffffcc') + c(78, 32, 2, '#ffffffcc') +
    p('M32 52 Q50 24 68 52 L68 62 Q50 34 32 62Z', '#e8e2d2') + p('M32 58 Q50 30 68 58 L68 62 Q50 34 32 62Z', '#cfc8b4') +
    r(10, 62, 18, 2, 1, '#bdb5a0') + r(10, 72, 18, 2, 1, '#bdb5a0') + r(72, 62, 18, 2, 1, '#bdb5a0') + r(72, 72, 18, 2, 1, '#bdb5a0'));
};
