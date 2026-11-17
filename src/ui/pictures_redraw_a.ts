import { K, add, c, e, eye, p, r, s, shadow } from './pictureKit';

/** Redrawn picture cards (they replace the earlier drawings of the same word). */
export const install = (): void => {
  // ---- ant: big, bold, warm red-brown, three body segments, six legs, two antennae, friendly face -------------------
  const antDark = '#8a3322';
  const antMid = '#c4503a';
  const antLight = '#e0735a';
  add('ant', shadow(93, 36) +
    s('M40 62 L28 76 L22 90 M50 64 L48 80 L46 92 M60 62 L72 76 L80 90', antDark, 5.5) +
    s('M44 60 L34 70 L30 82 M54 62 L60 76 L64 88', '#a63f2b', 5.5) +
    s('M24 38 Q18 20 6 20 M38 38 Q42 20 32 10', antDark, 3.6) + c(6, 20, 3.6, antDark) + c(32, 10, 3.6, antDark) +
    e(74, 58, 21, 17, antDark) + e(74, 55, 21, 17, antMid) + e(66, 48, 9, 5, '#ffffff55', -20) +
    e(48, 55, 12, 11, antMid) + e(46, 51, 8, 5, antLight) +
    c(28, 50, 17, antDark) + c(28, 48, 17, antMid) + c(22, 40, 6, '#ffffff44') +
    c(21, 46, 5.4, K.white) + c(35, 46, 5.4, K.white) + c(22, 47, 3, K.ink) + c(36, 47, 3, K.ink) + c(23, 46, 1, K.white) + c(37, 46, 1, K.white) +
    s('M22 56 q6 6 12 0', K.ink, 2.4) + c(16, 54, 3, K.pink, 'opacity=".55"') + c(40, 54, 3, K.pink, 'opacity=".55"'));

  // ---- horse: brown, side-on, clear head, mane, tail, four sturdy legs -------------------------------------------------
  const hBody = '#b8793a';
  const hDark = '#8a5a2b';
  add('horse', shadow(94, 36) +
    p('M22 52 Q2 56 6 84 Q10 94 14 86 Q12 72 24 66Z', K.dbrown) +
    r(22, 70, 11, 22, 5, hDark) + r(52, 70, 11, 22, 5, hDark) + r(22, 88, 11, 6, 3, '#3a2414') + r(52, 88, 11, 6, 3, '#3a2414') +
    e(46, 62, 30, 19, hBody) + e(40, 52, 14, 6, '#d09256', -8) +
    r(34, 72, 11, 22, 5, hBody) + r(64, 72, 11, 22, 5, hBody) + r(34, 88, 11, 6, 3, '#3a2414') + r(64, 88, 11, 6, 3, '#3a2414') +
    p('M56 58 Q60 32 70 20 L92 30 Q86 50 78 66Z', hBody) +
    p('M58 56 Q58 30 68 14 Q76 12 78 18 Q68 30 68 58Z', K.dbrown) +
    e(86, 36, 18, 10.5, hBody, 55) + e(92, 47, 8.5, 7, '#e8c48a', 55) +
    p('M70 22 L70 6 L78 18Z', hBody) + p('M72 20 L72 11 L76 18Z', K.pink) +
    p('M72 16 Q80 14 82 24 Q76 22 72 16Z', K.dbrown) +
    eye(82, 30, 3.6) + e(95, 50, 1.8, 2.4, K.dbrown, 30) + s('M90 54 q4 2 7 -1', K.dbrown, 1.6));

  // ---- kangaroo: upright, front-on, friendly face, tall ears, big tail on the ground, pouch with a joey ------------------
  const kRed = '#d99a58';
  const kDark = '#b87a3e';
  const kLight = '#f3d8b0';
  add('kangaroo', shadow(94, 36) +
    p('M60 82 Q84 82 97 95 Q72 99 50 92Z', kDark) +
    p('M34 46 Q12 72 22 90 L70 90 Q80 72 58 46Z', kRed) +
    e(27, 78, 11, 13, kDark) + e(65, 78, 11, 13, kDark) + e(26, 92, 13, 4.6, kDark) + e(66, 92, 13, 4.6, kDark) +
    e(46, 70, 15, 19, kLight) +
    e(40, 53, 3, 6, '#c98550', -15) + e(52, 53, 3, 6, '#c98550', 15) + c(46, 59, 8.5, '#c98550') + e(46, 62, 4.6, 3.2, '#e6b48a') + eye(42, 57, 2.4) + eye(50, 57, 2.4) +
    p('M32 68 Q46 63 60 68 Q61 87 46 87 Q31 87 32 68Z', '#f0cf9e') + s('M32 68 Q46 63 60 68', '#c98d5a', 2.6) +
    e(31, 60, 4.5, 9, kDark, 18) + e(61, 60, 4.5, 9, kDark, -18) +
    p('M35 28 L29 4 Q42 8 45 24Z', kRed) + p('M36 25 L33 11 Q40 13 42 23Z', K.pink) +
    p('M57 28 L63 4 Q50 8 47 24Z', kRed) + p('M56 25 L59 11 Q52 13 50 23Z', K.pink) +
    c(46, 35, 14.5, kRed) + e(46, 42, 9, 7, kLight) + e(46, 38.6, 3.4, 2.3, K.ink) +
    eye(39, 31, 3.8) + eye(53, 31, 3.8) + s('M41 46 q5 3.5 10 0', K.ink, 1.8) + c(33, 40, 3, K.pink, 'opacity=".45"') + c(59, 40, 3, K.pink, 'opacity=".45"'));

  // ---- bat: cute, rounded, closed smile, soft purple wings, no fangs ----------------------------------------------
  const wingL = '#bfb0f7';
  const wingD = '#9f8cee';
  const bodyP = '#7a68d6';
  add('bat', shadow(94, 24) +
    p('M36 46 Q20 26 2 34 Q10 46 6 58 Q16 54 22 66 Q28 58 36 70Z', wingL) +
    p('M64 46 Q80 26 98 34 Q90 46 94 58 Q84 54 78 66 Q72 58 64 70Z', wingL) +
    s('M36 50 Q22 40 8 38 M36 56 Q24 54 14 58 M64 50 Q78 40 92 38 M64 56 Q76 54 86 58', wingD, 2.4) +
    e(50, 68, 17, 21, bodyP) + e(50, 74, 10, 13, '#a99bf0') +
    p('M33 36 L31 14 Q40 16 46 26Z M67 36 L69 14 Q60 16 54 26Z', bodyP) + p('M35 32 L34 21 Q39 23 42 28Z M65 32 L66 21 Q61 23 58 28Z', K.pink) +
    c(50, 44, 21, bodyP) + c(42, 34, 5, '#ffffff33') +
    c(41, 43, 6.4, K.white) + c(59, 43, 6.4, K.white) + c(42, 44, 3.6, K.ink) + c(60, 44, 3.6, K.ink) + c(43, 43, 1.2, K.white) + c(61, 43, 1.2, K.white) +
    e(50, 50, 2.6, 1.8, K.dpink) + s('M43 54 q7 6 14 0', K.ink, 2.2) + c(32, 51, 3.6, K.pink, 'opacity=".55"') + c(68, 51, 3.6, K.pink, 'opacity=".55"') +
    e(44, 90, 3.4, 4, '#a99bf0') + e(56, 90, 3.4, 4, '#a99bf0'));

  // ---- goat: cute chubby side-on goat, round body, short legs, two small horns, floppy ear, beard ---------------------
  const gBody = '#f4ebd9';
  const gShade = '#d3c19f';
  const gTan = '#b9a07a';
  add('goat', shadow(94, 38) +
    p('M18 56 Q8 44 8 40 Q20 42 24 52Z', gBody) +
    r(24, 74, 12, 18, 5, '#8c765c') + r(52, 74, 12, 18, 5, '#8c765c') + r(24, 88, 12, 6, 3, K.ink) + r(52, 88, 12, 6, 3, K.ink) +
    e(44, 62, 31, 22, gShade) + e(44, 60, 31, 22, gBody) + p('M20 52 Q42 40 66 52 Q58 62 42 56 Q28 58 20 52Z', gTan) +
    r(34, 74, 12, 18, 5, '#a38d72') + r(64, 74, 12, 18, 5, '#a38d72') + r(34, 88, 12, 6, 3, K.ink) + r(64, 88, 12, 6, 3, K.ink) +
    p('M56 60 Q60 38 72 30 L88 46 Q84 62 70 72Z', gBody) +
    s('M71 33 Q66 20 57 23', gTan, 6) + s('M81 31 Q82 17 73 14', gTan, 6) +
    c(80, 43, 15, gBody) + e(91, 50, 9, 7.5, '#ece0c8') + e(95, 50, 2.6, 2.2, K.dbrown) + c(92, 46, 1.4, K.dbrown) +
    p('M84 55 Q82 72 91 74 Q94 64 94 55Z', gTan) +
    e(68, 49, 11, 6, gTan, 55) + eye(81, 40, 3.8) + s('M87 56 q4 2 8 -1', K.ink, 1.8));

  // ---- rat: bigger, darker grey-brown, long pointed snout, round ears, long curved pink tail ----------------------------
  const rBody = '#7c6a5c';
  const rLight = '#a39080';
  add('rat', shadow(94, 36) +
    s('M82 76 C98 78 100 56 90 48 C84 42 78 50 84 54', '#d9a0ae', 5) +
    r(26, 80, 11, 12, 5, '#e6a5b4') + r(60, 80, 11, 12, 5, '#e6a5b4') +
    e(56, 66, 32, 21, rBody) + e(52, 76, 22, 10, rLight) +
    r(36, 80, 11, 12, 5, '#f0b8c4') + r(70, 80, 11, 12, 5, '#f0b8c4') +
    p('M8 70 Q20 44 46 42 Q66 46 66 68 Q62 86 38 84 Q16 82 8 70Z', rBody) +
    c(48, 38, 11, rBody) + c(48, 38, 6.5, K.pink) + c(33, 36, 10, rBody) + c(33, 36, 5.5, K.pink) +
    p('M8 70 Q12 60 26 56 Q30 70 20 76 Q12 76 8 70Z', rLight) +
    c(8, 71, 4.4, K.dpink) + c(7, 69.6, 1.2, '#ffffff88') +
    eye(30, 58, 3.8) + s('M18 78 q8 4 16 0', K.ink, 1.8) +
    s('M10 72 L-2 66 M10 75 L-2 78', '#4a3d33', 1.6));

  // ---- snake: clear coiled green snake, head with eyes, forked tongue, diamond pattern ----------------------------------
  const sPath = 'M90 88 C98 70 70 66 40 70 C12 74 8 52 40 50 C62 48 66 36 50 32';
  add('snake', shadow(94, 38) +
    s(sPath, K.dgreen, 21) + s(sPath, K.green, 16) + s(sPath, '#a6e8a8', 4, 'transform="translate(0 -3)" opacity=".7"') +
    s(sPath, '#2f7d47', 8, 'stroke-dasharray="0.1 13"') + s(sPath, K.yellow, 4.4, 'stroke-dasharray="0.1 13"') +
    e(60, 26, 17, 12.5, K.dgreen) + e(60, 24, 17, 12.5, K.green) +
    s('M76 28 q10 2 14 -3 m-4 1.6 q4 3 8 2 m-8 -3.6 q4 -3 8 -2', K.red, 2.6) +
    c(56, 18, 5.8, K.white) + c(68, 18, 5.8, K.white) + c(57, 19, 3.2, K.ink) + c(69, 19, 3.2, K.ink) + c(58, 18, 1, K.white) + c(70, 18, 1, K.white) +
    s('M52 30 q9 5 17 0', '#2f7d47', 2) + c(50, 26, 2.6, K.pink, 'opacity=".5"'));

  // ---- cow: a big friendly black-and-white cow face: horns, ears, a few large patches and a big pink muzzle ----
  {
    add('cow', shadow(96, 34) +
      e(50, 92, 30, 10, '#d9d4e4') + e(50, 90, 30, 10, K.white) +
      p('M30 24 Q20 8 30 2 Q38 10 44 22Z M70 24 Q80 8 70 2 Q62 10 56 22Z', '#e8c48a') +
      e(15, 38, 13, 7, '#2a2f3d', -18) + e(85, 38, 13, 7, '#2a2f3d', 18) + e(16, 38, 7, 3.4, K.pink, -18) + e(84, 38, 7, 3.4, K.pink, 18) +
      e(50, 52, 29, 34, '#d9d4e4') + e(50, 50, 29, 34, K.white) +
      p('M24 40 C22 24 36 18 44 24 C48 32 42 44 36 52 C30 56 24 50 24 40Z', K.ink) +
      p('M60 20 C72 18 80 28 74 38 C68 38 62 32 60 20Z', K.ink) +
      e(50, 70, 20, 15, '#ff7ea1') + e(50, 68, 20, 14, K.pink) + e(42, 68, 3.2, 4.6, K.dpink) + e(58, 68, 3.2, 4.6, K.dpink) + s('M42 77 q8 5 16 0', K.dpink, 2) +
      eye(35, 46, 4.2) + eye(65, 46, 4.2));
  }

  // ---- sheep: whole fluffy white sheep, side-on, dark face and legs (no horns) -----------------------------------------
  const wool = '#ffffff';
  const woolShade = '#cdc7e2';
  const faceD = '#4a4458';
  const woolBumps = [[44, 48, 14], [60, 42, 15], [77, 48, 14], [85, 60, 11], [73, 66, 13], [55, 68, 13], [40, 62, 12], [57, 56, 16], [72, 56, 13]];
  add('sheep', shadow(94, 36) +
    r(36, 66, 9, 28, 4, faceD) + r(68, 66, 9, 28, 4, faceD) + r(36, 88, 9, 6, 3, K.ink) + r(68, 88, 9, 6, 3, K.ink) +
    woolBumps.map(([x, y, rad]) => c(x!, y! + 2.5, rad! + 2, woolShade)).join('') +
    woolBumps.map(([x, y, rad]) => c(x!, y!, rad!, wool)).join('') +
    r(48, 68, 9, 26, 4, '#5c566c') + r(80, 66, 9, 28, 4, '#5c566c') + r(48, 88, 9, 6, 3, K.ink) + r(80, 88, 9, 6, 3, K.ink) +
    e(40, 54, 11, 4.8, '#3a3548', 25) +
    e(21, 60, 14, 17, faceD) + c(22, 41, 10, woolShade) + c(23, 40, 10, wool) + c(33, 43, 8, wool) + c(12, 44, 7, wool) +
    c(26, 56, 5, K.white) + c(27, 57, 2.8, K.ink) + c(28, 56, 1, K.white) +
    e(13, 66, 1.4, 1.9, K.ink) + s('M16 72 q5 3 10 0', K.pink, 1.8) + c(32, 66, 3, K.pink, 'opacity=".5"'));

  // ---- hippo: a round baby hippo, small ears, big nostrils, smiling mouth ----------------------------------------------
  const hip = '#a99fd6';
  const hipD = '#8678bc';
  const hipL = '#cfc7ec';
  add('hippo', shadow(94, 38) +
    r(16, 76, 18, 16, 7, hipD) + r(66, 76, 18, 16, 7, hipD) +
    e(50, 70, 40, 22, hip) + e(50, 80, 28, 10, hipL, 0) +
    r(30, 78, 18, 15, 7, '#9a8fcc') + r(52, 78, 18, 15, 7, '#9a8fcc') +
    e(22, 34, 8, 7, hipD) + e(78, 34, 8, 7, hipD) + e(22, 35, 4.5, 3.6, K.pink) + e(78, 35, 4.5, 3.6, K.pink) +
    e(50, 48, 36, 30, hip) + c(36, 32, 8, hip) + c(64, 32, 8, hip) +
    c(36, 32, 5.6, K.white) + c(64, 32, 5.6, K.white) + c(37, 33, 3.4, K.ink) + c(65, 33, 3.4, K.ink) + c(38, 32, 1.1, K.white) + c(66, 32, 1.1, K.white) +
    e(50, 60, 30, 19, hipL) + e(40, 53, 5.2, 4, '#5f538f', -10) + e(60, 53, 5.2, 4, '#5f538f', 10) +
    s('M32 63 Q50 80 68 63', '#5f538f', 3) + c(28, 62, 4.4, K.pink, 'opacity=".55"') + c(72, 62, 4.4, K.pink, 'opacity=".55"') +
    e(38, 28, 5, 2.6, '#ffffff44', -20));
  void [eye];
};
