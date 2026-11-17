import { K, add, c, e, eye, p, r, s, shadow } from './pictureKit';

/** Picture cards for the words of these sets (viewBox 0 0 100 100, flat fills, no outlines, `shadow()` first). */
export const install = (): void => {
  void [eye];

  // arm: a bent arm showing a small muscle, a sleeve cuff and a little sparkle
  add('arm', shadow(94, 36) +
    s('M80 78 H28 V34', K.dskin, 22, 'transform="translate(0 2)"') +
    s('M80 76 H28 V34', K.skin, 22) +
    e(56, 58, 18, 17, K.dskin, -8) + e(56, 56, 18, 17, K.skin, -8) + s('M44 47 q10 -7 21 -3', K.white, 3.4, 'opacity=".6"') + s('M48 66 q8 5 18 2', K.dskin, 2.4) +
    r(12, 6, 32, 30, 12, K.dskin) + r(12, 4, 32, 30, 12, K.skin) + s('M17 14 H30 M17 20 H30 M17 26 H30', K.dskin, 2.2) + e(36, 24, 7, 6, K.skin) + s('M30 20 q7 -2 9 5', K.dskin, 2) + s('M18 10 q6 -4 14 -2', K.white, 3, 'opacity=".5"') +
    r(74, 56, 28, 40, 7, K.dblue) + r(72, 54, 28, 40, 7, K.blue) + r(72, 54, 9, 40, 4, K.white) + s('M90 60 v28', K.white, 3, 'opacity=".45"') +
    '<path d="M82 12 L85 20 L93 23 L85 26 L82 34 L79 26 L71 23 L79 20Z" fill="#ffd166"/>' + c(94, 40, 2.4, K.yellow) + c(68, 6, 2, K.yellow));

  // barn: a red barn with a white cross-brace door and a hay loft
  add('barn', shadow(94, 42) +
    r(12, 42, 76, 50, 2, K.dred) + r(14, 42, 72, 48, 2, K.red) +
    p('M4 50 L18 24 L50 8 L82 24 L96 50 L86 50 L76 32 L50 20 L24 32 L14 50Z', K.dbrown) +
    p('M12 46 L22 28 L50 14 L78 28 L88 46Z', K.red) +
    p('M12 46 L22 28 L50 14 L78 28 L88 46Z', 'none', `stroke="${K.white}" stroke-width="3" stroke-linejoin="round"`) +
    r(41, 25, 18, 16, 2, K.dbrown) + r(43, 27, 14, 12, 1, K.yellow) + s('M45 33 h10 M45 36 h10', K.dyellow, 1.4) +
    r(30, 56, 40, 36, 2, K.white) + r(33, 59, 34, 33, 1, K.red) + s('M33 59 L67 92 M67 59 L33 92', K.white, 4) + s('M50 59 V92', K.white, 3) +
    r(14, 42, 5, 50, 1, K.white) + r(81, 42, 5, 50, 1, K.white) + s('M20 50 V86 M80 50 V86', K.dred, 1.8, 'opacity=".5"'));

  // card: a greeting card standing open, with a heart and a star on the front
  add('card', shadow(94, 38) +
    r(44, 12, 46, 68, 4, '#e6d2a6', 8) + r(44, 10, 46, 68, 4, K.cream, 8) + s('M58 28 h22 M58 38 h22 M58 48 h14', '#e0cfa8', 3, 'transform="rotate(8 67 44)"') +
    r(10, 14, 54, 74, 5, K.dviolet, -4) + r(10, 12, 54, 74, 5, K.violet, -4) + r(16, 18, 42, 62, 3, 'none', -4, `stroke="${K.white}" stroke-width="2.4" opacity=".85"`) +
    '<g transform="rotate(-4 37 49)">' +
    p('M37 72 C20 60 22 46 30 46 C34 46 37 49 37 52 C37 49 40 46 44 46 C52 46 54 60 37 72Z', K.red) + p('M28 50 q2 -4 6 -3', 'none', 'stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6" fill="none"') +
    '<path d="M37 21 L40.5 29 L49 30 L42.5 35.500 L44.500 44 L37 39.500 L29.500 44 L31.500 35.500 L25 30 L33.500 29Z" fill="#ffd166"/></g>' +
    c(92, 8, 2.4, K.yellow) + c(6, 8, 2, K.pink));

  // corn: a yellow cob in green husk leaves
  {
    let kernels = '';
    for (let row = 0; row < 8; row++) {
      const y = 14 + row * 8;
      for (let col = 0; col < 4; col++) {
        const x = 38.5 + col * 7.7 + (row % 2 ? 3.8 : 0) - 3.8;
        const dx = (x - 50) / 17, dy = (y - 38) / 32;
        if (dx * dx + dy * dy < 0.82) kernels += e(x, y, 3.6, 3.9, K.yellow) + c(x - 1, y - 1.3, 1, '#fff6c8');
      }
    }
    add('corn', shadow(95, 28) +
      p('M50 96 C24 96 10 82 10 60 C24 64 40 70 50 80Z', K.dgreen) + p('M50 96 C76 96 90 82 90 60 C76 64 60 70 50 80Z', K.dgreen) + p('M50 96 C32 94 24 84 24 70 C34 74 44 78 50 84Z', K.green) + p('M50 96 C68 94 76 84 76 70 C66 74 56 78 50 84Z', K.green) +
      e(50, 38, 19, 34, K.dyellow) + e(50, 37, 18, 33, '#ffe08a') + kernels +
      p('M50 96 C38 88 40 74 50 62 C60 74 62 88 50 96Z', K.green) + p('M50 92 C45 84 45 76 50 68', 'none', `stroke="${K.dgreen}" stroke-width="2.4" stroke-linecap="round" fill="none"`) + p('M15 64 q2 8 8 12', 'none', 'stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".35" fill="none"'));
  }

  // farm: a green tractor in a field strip
  add('farm', shadow(97, 42) +
    r(2, 82, 96, 15, 5, K.dbrown) + r(2, 82, 96, 12, 5, K.brown) + s('M10 90 H90', K.dbrown, 1.6, 'opacity=".6"') +
    [12, 28, 44, 60, 76, 90].map((x) => s(`M${x} 92 v-5 M${x} 89 q-4 -4 -6 -3 M${x} 89 q4 -4 6 -3`, K.green, 1.8)).join('') +
    r(10, 50, 44, 22, 6, K.dgreen) + r(10, 48, 44, 22, 6, K.green) + r(8, 54, 6, 14, 3, K.dgrey) +
    r(46, 22, 34, 48, 6, K.dgreen) + r(46, 20, 34, 48, 6, K.green) + r(51, 26, 24, 20, 3, '#cdeeff') + p('M54 29 l8 -2 l-10 12z', K.white, 'opacity=".7"') +
    r(44, 14, 38, 8, 4, K.dgrey) +
    r(18, 30, 6, 22, 2, K.dgrey) + r(16, 26, 10, 6, 3, K.ink) +
    c(26, 74, 12, K.ink) + c(26, 74, 6, K.yellow) + c(26, 74, 2.4, K.dyellow) +
    c(66, 68, 21, K.ink) + c(66, 68, 12, K.yellow) + c(66, 68, 12, 'none', `stroke="${K.dyellow}" stroke-width="2"`) + c(66, 68, 4, K.dyellow) +
    s('M48 55 q8 -5 14 -4', K.white, 3, 'opacity=".45"') + c(88, 10, 8, K.yellow) + s('M88 -4 v4 M100 10 h4 M96 2 l3 -3 M76 2 l-3 -3', K.yellow, 2.4));

  // fork: a silver table fork
  add('fork', shadow(95, 24) + '<g transform="rotate(20 50 52)">' +
    [35, 45, 55, 65].map((x) => s(`M${x} 11 V36`, K.dgrey, 7.5)).join('') +
    [35, 45, 55, 65].map((x) => s(`M${x} 10 V36`, '#d6dde5', 6.5)).join('') +
    p('M31 32 H69 V40 Q69 54 55 56 V60 H45 V56 Q31 54 31 40Z', '#d6dde5') +
    p('M44 54 H56 L59 90 Q59 98 50 98 Q41 98 41 90Z', '#d6dde5') +
    p('M56 54 H59 L62 90 Q62 97 55 98 Q59 96 59 90Z', K.grey) + p('M60 34 H69 V40 Q69 54 55 56 V50 Q60 48 60 40Z', K.grey) +
    s('M36 14 V34 M46 14 V30', K.white, 2, 'opacity=".9"') + s('M46 62 L48 90', K.white, 3, 'opacity=".85"') + '</g>');

  // horn: a golden French-horn-like horn with a wide bell
  add('horn', shadow(94, 38) +
    c(38, 58, 27, 'none', `stroke="${K.dyellow}" stroke-width="12"`) + c(38, 56, 27, 'none', `stroke="${K.yellow}" stroke-width="10"`) +
    c(38, 56, 14, 'none', `stroke="${K.dyellow}" stroke-width="5"`) + c(38, 55, 14, 'none', `stroke="${K.yellow}" stroke-width="4"`) +
    s('M20 40 Q22 32 30 30 Q42 28 54 34', K.dyellow, 6) +
    s('M54 34 L68 30', K.dyellow, 8) +
    p('M60 30 L88 6 Q99 38 90 72 L62 56Z', K.dyellow) + p('M60 28 L86 4 Q96 36 88 68 L62 54Z', K.yellow) +
    e(89, 38, 9, 33, K.dyellow, -4) + e(88, 37, 7, 29, '#7a4a1d', -4) + e(87, 37, 4, 22, '#4a2a10', -4) +
    s('M66 38 L82 18', K.white, 3.4, 'opacity=".55"') + s('M22 56 q4 -16 18 -22', K.white, 3.4, 'opacity=".5"') +
    r(8, 24, 14, 6, 3, K.dgrey, -35) + c(11, 21, 4.5, K.grey) +
    c(40, 28, 4.2, K.pink) + c(52, 30, 4.2, K.pink) + c(28, 32, 4.2, K.pink));

  // jar: a clear glass jar with a lid and some coloured sweets
  add('jar', shadow(95, 32) +
    r(16, 28, 68, 66, 15, '#a9d4e3') + r(18, 28, 64, 64, 14, '#e6f6fc') + r(22, 22, 56, 10, 3, '#c5e3ee') +
    [[30, 82, K.red], [44, 84, K.yellow], [58, 83, K.violet], [72, 82, K.green], [37, 70, K.blue], [51, 71, K.orange], [65, 70, K.pink], [44, 58, K.green], [58, 57, K.red], [72, 64, K.yellow], [30, 66, K.violet]]
      .map(([x, y, f]) => c(x as number, y as number, 7, f as string) + c((x as number) - 2.4, (y as number) - 2.6, 1.8, '#ffffffcc')).join('') +
    r(14, 6, 72, 18, 5, K.dviolet) + r(14, 6, 72, 14, 5, K.violet) + [24, 34, 44, 54, 64, 74].map((x) => r(x, 8, 3, 12, 1.5, K.dviolet)).join('') +
    s('M24 36 V52', K.white, 4.5, 'opacity=".75"') + s('M24 60 v6', K.white, 4.5, 'opacity=".75"'));

  // light: a glowing yellow light bulb with rays
  add('light', shadow(95, 20) +
    c(50, 40, 34, '#fff2a8', 'opacity=".5"') +
    [-90, -55, -125, -20, -160, 15, 195].map((a) => { const t = (a * Math.PI) / 180; return s(`M${50 + 35 * Math.cos(t)} ${40 + 35 * Math.sin(t)} L${50 + 44 * Math.cos(t)} ${40 + 44 * Math.sin(t)}`, K.orange, 4); }).join('') +
    p('M36 54 Q38 66 40 72 H60 Q62 66 64 54Z', K.dyellow) +
    c(50, 40, 24, K.dyellow) + c(50, 39, 24, K.yellow) + p('M38 54 Q40 66 42 70 H58 Q60 66 62 54Z', K.yellow) +
    r(38, 70, 24, 8, 2, K.dgrey) + r(38, 70, 24, 3, 1.5, K.grey) + r(39, 77, 22, 8, 2, K.grey) + r(39, 77, 22, 3, 1.5, '#d6dde5') + p('M42 85 H58 Q56 92 50 92 Q44 92 42 85Z', K.dgrey) +
    s('M44 70 V52 Q44 44 47 44 Q50 44 50 52 Q50 44 53 44 Q56 44 56 52 V70', K.orange, 2.2) +
    s('M32 30 Q36 20 46 16', K.white, 4.5, 'opacity=".75"') + c(30, 40, 2.4, K.white));

  // night: a dark-blue night sky with a crescent moon and stars over a small hill
  add('night', r(4, 4, 92, 90, 12, '#1d2a5a') + r(4, 4, 92, 90, 12, '#26357a', 0, 'opacity=".55"') +
    p('M62 16 A22 22 0 1 0 82 50 A17 17 0 1 1 62 16Z', K.yellow) + p('M60 18 A20 20 0 0 0 36 40', 'none', 'stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45" fill="none"') +
    [[20, 20, 4], [34, 52, 3], [74, 62, 3.5], [14, 62, 2.6], [86, 20, 3]].map(([x, y, rr]) => `<path d="M${x} ${(y as number) - (rr as number) * 2} L${(x as number) + (rr as number) * 0.6} ${(y as number) - (rr as number) * 0.6} L${(x as number) + (rr as number) * 2} ${y} L${(x as number) + (rr as number) * 0.6} ${(y as number) + (rr as number) * 0.6} L${x} ${(y as number) + (rr as number) * 2} L${(x as number) - (rr as number) * 0.6} ${(y as number) + (rr as number) * 0.6} L${(x as number) - (rr as number) * 2} ${y} L${(x as number) - (rr as number) * 0.6} ${(y as number) - (rr as number) * 0.6}Z" fill="#fff6c0"/>`).join('') +
    c(54, 12, 1.6, K.white) + c(66, 58, 1.6, K.white) + c(26, 38, 1.4, K.white) +
    p('M4 82 Q4 62 36 60 Q70 58 96 78 V82 Q96 94 84 94 H16 Q4 94 4 82Z', '#2f6b6b') + p('M4 86 Q30 72 60 76 Q84 78 96 84 V84 Q96 94 84 94 H16 Q4 94 4 86Z', '#244f56'));

  // shark: a friendly grey-blue cartoon shark with a smile and a fin
  add('shark', shadow(94, 38) +
    p('M82 50 L98 30 Q94 52 100 72 L82 62Z', K.dblue) +
    p('M6 56 Q24 28 58 32 Q80 34 88 54 Q88 78 52 80 Q16 80 6 56Z', '#6f8fb0') +
    p('M42 36 L56 8 Q62 24 68 36Z', '#6f8fb0') + p('M50 22 L56 8 Q60 18 63 28Z', '#5b7a9b') +
    p('M8 62 Q30 72 60 70 Q84 68 88 56 Q88 78 52 80 Q16 80 8 62Z', '#f2f7fb') +
    p('M10 52 Q26 32 56 34 Q78 36 86 52 Q60 44 30 50 Q18 52 10 52Z', '#86a6c4') +
    p('M44 68 L36 90 Q54 86 62 70Z', '#5b7a9b') +
    s('M26 38 Q36 33 48 34', K.white, 3.4, 'opacity=".5"') + s('M62 52 q2 6 0 11 M68 52 q2 6 0 11', '#5b7a9b', 2, 'opacity=".8"') +
    eye(26, 52, 4) + c(16, 62, 4, K.pink, 'opacity=".55"') + s('M13 63 Q24 74 38 64', K.ink, 2.8) +
    c(6, 24, 3, K.blue, 'opacity=".5"') + c(14, 14, 2, K.blue, 'opacity=".5"'));

  // surf: a surfboard standing in the sand next to a small wave
  add('surf', shadow(95, 40) +
    p('M-4 96 V64 C-4 42 14 30 34 32 C48 34 52 48 46 58 C42 50 34 48 29 53 C25 59 30 70 40 74 V96Z', K.dblue) +
    p('M-4 96 V68 C-4 50 12 40 30 42 C42 44 44 52 42 58 C36 54 30 56 28 62 C26 70 34 78 38 82 V96Z', K.blue) +
    p('M-4 58 C-2 44 14 32 34 32 C48 34 52 48 46 58 C42 50 34 48 29 53 C32 44 18 40 8 50 C4 54 0 58 -4 62Z', K.white) + c(12, 62, 2.4, K.sky) + c(22, 70, 2, K.sky) + c(4, 74, 2, K.sky) +
    '<g transform="rotate(10 64 50)">' +
    p('M64 4 C84 14 88 50 80 80 L48 80 C40 50 44 14 64 4Z', K.dorange) + p('M64 6 C82 16 86 48 78 78 L50 78 C42 48 46 16 64 6Z', K.orange) +
    p('M62 14 C70 20 72 38 70 78 L52 78 C48 44 52 22 62 14Z', K.white, 'opacity=".9"') + s('M64 12 V80', K.dorange, 2) + s('M52 24 q4 -10 12 -14', K.white, 3, 'opacity=".6"') +
    p('M62 76 L56 88 L68 88Z', K.dgrey) + '</g>' +
    p('M32 94 Q50 76 78 84 Q94 88 98 94 Q98 98 90 98 H40 Q32 98 32 94Z', K.tan) + p('M32 94 Q50 80 78 88 Q94 92 98 95 Q98 98 90 98 H40Q32 98 32 94Z', '#d9ac66') + c(46, 92, 1.4, '#c49a55') + c(80, 94, 1.4, '#c49a55'));

  // torch: a handheld torch with a yellow beam
  add('torch', shadow(94, 36) +
    p('M60 46 L102 14 V98 L60 66Z', '#ffe27a', 'opacity=".45"') + p('M60 52 L98 32 V80 L60 62Z', '#fff2a8', 'opacity=".7"') +
    '<g transform="rotate(-8 34 56)">' +
    r(6, 46, 36, 24, 8, K.dviolet) + r(6, 44, 36, 24, 8, K.violet) + [14, 21, 28].map((x) => r(x, 47, 3, 18, 1.5, K.dviolet)).join('') + r(8, 49, 6, 14, 3, K.dviolet) +
    p('M40 40 L62 34 V82 L40 76Z', K.dgrey) + p('M40 38 L62 32 V80 L40 74Z', K.grey) +
    e(63, 56, 6, 24, K.dyellow) + e(63, 56, 4.4, 20, '#fff6c0') +
    r(20, 36, 12, 8, 3, K.red) + s('M44 44 L56 40', K.white, 3, 'opacity=".6"') + '</g>' +
    c(86, 40, 2.4, K.white) + c(78, 62, 2, K.white) + c(92, 66, 2.4, K.white));

  // curl: one big springy coil of ribbon (three loops, front and back of the coil) with a curled end and sparkles
  {
    const w = 30; const h = 8; const pch = 19; const y0 = 24;
    const L = [0, 1, 2].map((i) => y0 + i * pch);
    const back = L.map((y) => s(`M${50 + w} ${y + pch / 2} Q50 ${y + pch * 0.75 - 2 * h} ${50 - w} ${y + pch}`, '#6f5fd0', 8)).join('');
    const front = L.map((y) => {
      const d = `M${50 - w} ${y} Q50 ${y + pch / 4 + 2 * h} ${50 + w} ${y + pch / 2}`;
      return s(d, '#6f5fd0', 11) + s(d, '#9b8bf0', 8) + s(d, '#ffffffaa', 2, 'transform="translate(0 -2)"');
    }).join('');
    const top = 'M20 24 Q13 23 13 17 Q13 11 20 11';
    const bot = `M${50 - w} ${y0 + 3 * pch} Q${50 - w - 8} ${y0 + 3 * pch + 6} ${50 - w + 2} ${y0 + 3 * pch + 14}`;
    add('curl', shadow(96, 30) +
      back + front + s(top, '#6f5fd0', 11) + s(top, '#9b8bf0', 8) + s(bot, '#6f5fd0', 11) + s(bot, '#9b8bf0', 8) +
      p('M88 20 l2.4 -7 l2.4 7 l7 2.4 l-7 2.4 l-2.4 7 l-2.4 -7 l-7 -2.4z', K.yellow) + p('M10 60 l1.8 -5 l1.8 5 l5 1.8 l-5 1.8 l-1.8 5 l-1.8 -5 l-5 -1.8z', K.pink) + c(90, 62, 2.4, K.pink) + c(88, 84, 2, K.yellow));
  }
};
