// The picture cards: original flat-style illustrations for every word the games show as a picture (replacing emoji).
// The drawing helpers and the PICTURES store live in pictureKit.ts so redrawn cards can be written in separate files.
import { K, PICTURES, add, c, e, eye, p, r, s, shadow, type Col } from './pictureKit';
import { install as installRedrawA } from './pictures_redraw_a';
import { install as installRedrawB } from './pictures_redraw_b';
import { install as installSet8 } from './pictures_set8';
import { install as installSet10 } from './pictures_set10';
import { install as installSet11 } from './pictures_set11';
export { PICTURES };

// ===== ANIMALS =====================================================================================================
add('cat', shadow() + p('M70 84 Q92 82 88 58 Q86 50 80 54', 'none', `stroke="${K.dorange}" stroke-width="9" stroke-linecap="round"`) +
  e(50, 78, 26, 16, K.orange) + p('M26 42 L30 14 L48 32Z M74 42 L70 14 L52 32Z', K.orange) + p('M31 34 L33 22 L42 31Z M69 34 L67 22 L58 31Z', K.pink) +
  c(50, 54, 27, '#ffb26b') + s('M50 28 v8 M40 30 l2 7 M60 30 l-2 7', K.dorange, 3) + eye(40, 52, 3.8) + eye(60, 52, 3.8) + p('M46 60 h8 l-4 5z', K.pink) +
  s('M50 65 q-5 5 -9 2 M50 65 q5 5 9 2', K.ink, 2) + s('M30 58 l-14 -3 M30 63 l-14 4 M70 58 l14 -3 M70 63 l14 4', K.dorange, 1.8));
add('dog', shadow() + e(50, 84, 24, 12, '#c98f58') + e(26, 52, 11, 22, K.dbrown, 12) + e(74, 52, 11, 22, K.dbrown, -12) + c(50, 52, 25, '#d9a066') +
  e(50, 64, 14, 11, K.cream) + e(50, 58, 6, 4.5, K.ink) + eye(40, 46, 3.6) + eye(60, 46, 3.6) + s('M50 62 v5 M44 70 q6 6 12 0', K.ink, 2) + e(50, 74, 4.5, 5, K.pink));
add('pig', shadow() + e(50, 84, 24, 12, '#ff9db9') + p('M26 38 Q22 18 38 24Z M74 38 Q78 18 62 24Z', '#ff8fab') + c(50, 54, 29, '#ffa5c0') + e(50, 64, 14, 10.5, '#ff7ea1') +
  e(45, 64, 2.6, 3.6, '#c2406a') + e(55, 64, 2.6, 3.6, '#c2406a') + eye(38, 48, 3.6) + eye(62, 48, 3.6));
add('hen', shadow() + s('M82 70 q10 -14 2 -26', K.dbrown, 7) + e(46, 66, 30, 24, '#e6a85c') + p('M30 66 q16 -16 40 -2 q-8 24 -28 24 q-12 -6 -12 -22z', '#c98a3c') +
  c(76, 42, 17, '#e6a85c') + c(70, 22, 6, K.red) + c(80, 20, 6.5, K.red) + c(88, 26, 5, K.red) + p('M91 42 l13 5 l-13 5z', K.orange) + e(88, 58, 3.6, 6, K.red) + eye(80, 40, 3.2) +
  s('M40 88 v8 M56 88 v8 M34 96 h12 M50 96 h12', K.orange, 3.2));
add('bat', shadow(94, 26) + p('M50 40 Q30 26 6 34 Q14 44 10 56 Q22 50 28 60 Q36 50 50 62Z', K.dviolet) + p('M50 40 Q70 26 94 34 Q86 44 90 56 Q78 50 72 60 Q64 50 50 62Z', K.dviolet) +
  e(50, 58, 12, 20, '#4a3d8f') + p('M42 40 L40 24 L50 34Z M58 40 L60 24 L50 34Z', '#4a3d8f') + c(45, 50, 3.4, K.yellow) + c(55, 50, 3.4, K.yellow) + c(45, 50, 1.4, K.ink) + c(55, 50, 1.4, K.ink) + p('M46 58 l2 5 l2 -5z M50 58 l2 5 l2 -5z', K.white));
add('rat', shadow() + s('M82 80 q18 -4 12 -26 q-2 -8 -10 -6', '#d79aa8', 3.6) + e(52, 70, 30, 16, '#8d7b6a') + p('M14 70 Q20 54 38 54 Q54 56 56 70Z', '#a38f7c') + c(40, 52, 11, '#a38f7c') +
  c(34, 44, 9, '#a38f7c') + c(34, 44, 5, K.pink) + c(14, 70, 4, K.pink) + eye(26, 62, 3) + s('M12 70 l-9 -3 M12 72 l-9 4', '#6b5b4b', 1.6) + s('M30 84 v8 M60 84 v8', '#6b5b4b', 4));
add('mouse', shadow() + s('M80 84 q16 4 14 -14 q-2 -8 -9 -6', K.pink, 3.4) + e(50, 78, 28, 16, '#c9cbdb') + c(32, 42, 15, '#c9cbdb') + c(68, 42, 15, '#c9cbdb') + c(32, 42, 9, K.pink) + c(68, 42, 9, K.pink) +
  c(50, 60, 24, '#dfe0ee') + eye(41, 56, 3.4) + eye(59, 56, 3.4) + c(50, 67, 4, K.dpink) + s('M50 71 q-5 5 -9 2 M50 71 q5 5 9 2', K.ink, 1.8) + s('M28 66 l-14 -3 M28 70 l-14 4 M72 66 l14 -3 M72 70 l14 4', K.dgrey, 1.6));
add('ram', shadow() + e(50, 80, 22, 14, '#e9e4d8') + s('M30 40 C6 34 8 78 34 70 C22 64 26 50 38 52', '#c9a35a', 9) + s('M70 40 C94 34 92 78 66 70 C78 64 74 50 62 52', '#c9a35a', 9) +
  c(50, 46, 20, '#f2eee4') + e(50, 62, 15, 20, '#e8c9a0') + e(50, 74, 6, 4, K.dpink) + eye(42, 56, 3.4) + eye(58, 56, 3.4) + e(30, 54, 7, 4, '#e8c9a0', 28) + e(70, 54, 7, 4, '#e8c9a0', -28));
add('snake', shadow(94, 34) + s('M14 82 C30 94 44 62 60 76 C76 90 90 60 82 40', K.dgreen, 15) + s('M14 82 C30 94 44 62 60 76 C76 90 90 60 82 40', K.green, 11) +
  s('M30 84 l3 -6 M52 72 l5 5 M76 80 l5 -6', K.dgreen, 3) + c(82, 34, 13, K.green) + s('M82 46 l0 10 m0 0 l-4 5 m4 -5 l4 5', K.red, 2.6) + eye(78, 31, 3) + eye(88, 31, 3));
add('ant', shadow() + s('M44 70 l-14 22 M52 72 l-4 24 M62 72 l10 22 M40 62 l-20 14 M70 60 l22 12 M36 56 l-22 -6', K.ink, 3.4) +
  e(74, 56, 20, 15, '#4a2c2a') + e(48, 58, 10, 9, '#5c3633') + c(30, 50, 12, '#4a2c2a') + s('M26 40 q-8 -16 -18 -14 M34 40 q0 -18 -10 -22', K.ink, 2.6) + eye(26, 49, 2.6) + e(80, 52, 6, 3, '#ffffff33', -20));
add('alligator', shadow() + p('M6 72 Q8 56 30 54 L70 54 Q90 54 96 70 Q80 66 70 74 L10 78Z', K.dgreen) + p('M6 72 L6 64 L38 56 L40 66Z', K.green) + p('M20 72 L70 72 Q92 76 96 70 Q96 80 70 82 L24 80Z', '#b8e3a0') +
  s('M24 72 l3 5 l3 -5 l3 5 l3 -5 l3 5 l3 -5', K.white, 2) + c(46, 52, 7, K.green) + eye(46, 51, 3) + p('M54 54 l4 -8 l4 8 M66 54 l4 -8 l4 8 M78 56 l4 -8 l4 8', K.dgreen) + r(30, 78, 9, 12, 4, K.dgreen) + r(66, 78, 9, 12, 4, K.dgreen));
add('tiger', shadow() + p('M22 44 L24 14 L44 28Z M78 44 L76 14 L56 28Z', K.orange) + c(50, 54, 33, K.orange) + e(50, 68, 21, 16, K.cream) +
  s('M50 22 v12 M36 24 l4 10 M64 24 l-4 10 M20 48 l12 3 M18 60 l13 0 M80 48 l-12 3 M82 60 l-13 0', K.ink, 3.4) + eye(38, 50, 4) + eye(62, 50, 4) + p('M45 60 h10 l-5 6z', K.ink) +
  s('M50 66 q-6 7 -12 3 M50 66 q6 7 12 3', K.ink, 2) + c(38, 50, 1.2, K.white));
add('turtle', shadow() + e(50, 88, 38, 6, '#0000000d') + e(86, 64, 11, 10, '#8bc77a') + eye(90, 62, 2.6) + r(22, 76, 14, 14, 6, '#8bc77a') + r(60, 76, 14, 14, 6, '#8bc77a') + p('M10 78 l10 -4 l-4 12z', '#8bc77a') +
  p('M14 76 Q14 30 50 30 Q86 30 86 76Z', K.dgreen) + p('M22 74 Q22 38 50 38 Q78 38 78 74Z', '#5db26f') + s('M50 38 v36 M30 50 h40 M26 64 h48', K.dgreen, 3) + s('M38 42 l-6 12 M62 42 l6 12', K.dgreen, 3));
add('panda', shadow() + e(50, 84, 28, 14, K.white) + e(30, 82, 10, 14, K.ink) + e(70, 82, 10, 14, K.ink) + c(26, 30, 13, K.ink) + c(74, 30, 13, K.ink) + c(50, 52, 30, K.white) +
  e(38, 50, 8, 11, K.ink, 22) + e(62, 50, 8, 11, K.ink, -22) + c(39, 49, 2.6, K.white) + c(61, 49, 2.6, K.white) + e(50, 62, 6, 4.5, K.ink) + s('M50 66 q-6 6 -11 2 M50 66 q6 6 11 2', K.ink, 2));
add('parrot', shadow() + p('M52 70 Q60 96 74 96 Q66 78 64 66Z', K.blue) + e(50, 62, 22, 28, K.green, -8) + p('M34 58 Q26 78 40 86 Q46 70 44 58Z', K.dgreen) + c(56, 32, 20, K.red) +
  p('M72 30 Q96 30 92 50 Q82 44 72 44Z', K.yellow) + p('M72 36 Q88 34 90 46', 'none', `stroke="${K.dyellow}" stroke-width="2"`) + eye(60, 28, 3.6) + c(60, 27, 1.2, K.white) + s('M48 88 v8 M60 88 v8', K.dorange, 3.4));
add('duck', shadow() + e(48, 74, 32, 20, K.yellow) + p('M70 66 q20 -4 22 8 q-12 8 -26 2z', K.yellow) + c(66, 38, 18, K.yellow) + p('M80 38 q18 -2 18 6 q-8 8 -20 4z', K.orange) + eye(70, 34, 3.4) +
  p('M30 66 q18 -14 34 6 q-8 16 -24 14 q-12 -2 -10 -20z', '#f0b429') + e(30, 94, 6, 3, K.orange));
add('dolphin', shadow(94, 34) + p('M6 70 Q10 36 52 30 Q84 28 92 50 Q94 58 88 62 Q76 56 66 62 Q60 84 30 86 Q12 84 6 70Z', K.grey) + p('M6 70 Q10 36 52 30 Q70 30 82 38 Q50 40 30 62 Q18 76 6 70Z', '#8896a5') +
  p('M52 30 Q58 10 72 6 Q66 20 66 34Z', '#8896a5') + p('M20 80 Q30 100 48 92 Q40 84 36 80Z', '#8896a5') + p('M90 62 Q98 70 96 82 Q88 76 84 68Z', '#8896a5') + p('M86 48 q10 -2 12 4 q-8 4 -12 2z', K.grey) + eye(78, 44, 3) + s('M58 58 q16 8 28 -2', K.white, 2));
add('goat', shadow() + p('M34 36 q-14 -24 4 -30 q-6 12 12 24z M66 36 q14 -24 -4 -30 q6 12 -12 24z', '#b9a68a') + e(24, 52, 14, 7, '#efe8da', 20) + e(76, 52, 14, 7, '#efe8da', -20) +
  e(50, 58, 26, 32, '#f5efe4') + p('M50 90 l-9 12 q9 6 18 0z', '#e2d9c8') + e(50, 74, 10, 8, '#e8bdb0') + c(46, 74, 1.6, K.ink) + c(54, 74, 1.6, K.ink) + eye(40, 52, 3.6) + eye(60, 52, 3.6) + e(50, 38, 14, 5, '#e8dfcf'));
add('monkey', shadow() + s('M76 88 q24 -6 14 -34 q-4 -8 -12 -4', K.dbrown, 6) + e(50, 78, 22, 18, '#a86f3a') + c(26, 48, 11, '#a86f3a') + c(74, 48, 11, '#a86f3a') + c(26, 48, 6, K.skin) + c(74, 48, 6, K.skin) +
  c(50, 46, 26, '#a86f3a') + e(50, 52, 19, 17, K.skin) + e(50, 60, 10, 7, '#e8b48a') + eye(41, 46, 3.6) + eye(59, 46, 3.6) + e(46, 62, 1.6, 1.2, K.ink) + e(54, 62, 1.6, 1.2, K.ink) + s('M44 67 q6 4 12 0', K.ink, 2));
add('cow', shadow() + e(50, 80, 28, 16, K.white) + p('M24 44 L16 32 L32 34Z M76 44 L84 32 L68 34Z', '#d9cdb8') + c(50, 52, 26, K.white) + c(34, 40, 9, K.ink) + c(66, 44, 8, K.ink) + p('M32 34 q-6 -14 4 -20 M68 34 q6 -14 -4 -20', '#e8d8a8', 'stroke="#e8d8a8" stroke-width="5"') +
  e(50, 66, 17, 13, '#ffb3c6') + e(43, 66, 2.8, 3.6, K.dpink) + e(57, 66, 2.8, 3.6, K.dpink) + eye(40, 50, 3.6) + eye(60, 50, 3.6) + e(26, 56, 8, 4, '#f2e2d0', 20) + e(74, 56, 8, 4, '#f2e2d0', -20));
add('camel', shadow() + r(30, 70, 9, 22, 3, '#c98f4a') + r(56, 70, 9, 22, 3, '#c98f4a') + r(70, 70, 9, 22, 3, '#c98f4a') + r(16, 70, 9, 22, 3, '#c98f4a') + e(48, 64, 36, 18, '#dba05c') +
  c(38, 40, 13, '#dba05c') + c(60, 42, 13, '#dba05c') + p('M80 52 Q92 24 88 8 Q80 8 78 14 Q76 36 70 50Z', '#dba05c') + e(88, 14, 11, 8, '#dba05c', -20) + eye(90, 12, 2.6) + s('M10 62 q-6 12 0 22', '#c98f4a', 4));
add('elephant', shadow() + r(24, 72, 14, 22, 5, K.grey) + r(60, 72, 14, 22, 5, K.grey) + e(50, 62, 34, 22, '#b5bfca') + c(80, 48, 20, '#b5bfca') + e(66, 46, 16, 20, '#9fabb8') + s('M92 56 q10 20 -2 38 q-8 6 -10 -6', '#b5bfca', 13) +
  eye(84, 44, 3.2) + p('M88 56 l8 12 l-4 2z', K.white) + s('M8 62 q-4 8 2 14', K.grey, 4));
add('rabbit', shadow() + e(36, 24, 8, 24, K.white, -8) + e(64, 24, 8, 24, K.white, 8) + e(36, 26, 4, 16, K.pink, -8) + e(64, 26, 4, 16, K.pink, 8) + e(50, 82, 24, 14, K.white) + c(80, 84, 8, K.white) + c(50, 58, 25, K.white) +
  eye(41, 56, 3.4) + eye(59, 56, 3.4) + p('M46 64 h8 l-4 5z', K.pink) + r(46, 70, 4, 7, 1.5, K.white) + r(50.5, 70, 4, 7, 1.5, K.white) + s('M46 70 h9 M50 69 v8', '#d8d0e4', 1) + c(38, 66, 4, K.pink, 'opacity=".5"') + c(62, 66, 4, K.pink, 'opacity=".5"'));
add('horse', shadow() + r(28, 74, 8, 20, 3, '#8a5a2b') + r(60, 74, 8, 20, 3, '#8a5a2b') + e(50, 70, 30, 18, '#a86f3a') + p('M64 60 Q70 24 84 14 Q96 18 92 34 Q88 46 80 50 Q76 62 72 68Z', '#a86f3a') + p('M64 60 Q66 30 80 16 Q72 36 76 62Z', K.dbrown) +
  e(90, 30, 7, 10, '#b97d46', 30) + eye(85, 24, 3) + c(94, 34, 1.4, K.dbrown) + s('M18 62 q-10 8 -6 26', K.dbrown, 5));
add('hippo', shadow() + e(50, 74, 38, 20, '#9a8fb8') + c(24, 38, 8, '#8678a8') + c(76, 38, 8, '#8678a8') + e(50, 50, 34, 28, '#a99fc6') + e(50, 62, 29, 17, '#c8bfdf') + e(40, 60, 3.2, 4, '#6f6290') + e(60, 60, 3.2, 4, '#6f6290') +
  c(36, 36, 7, K.white) + c(64, 36, 7, K.white) + c(37, 37, 3.4, K.ink) + c(63, 37, 3.4, K.ink) + p('M44 74 l3 5 l3 -5z M52 74 l3 5 l3 -5z', K.white));
add('bee', shadow(94, 22) + e(30, 38, 16, 11, '#cfeaff', -30) + e(48, 32, 16, 11, '#cfeaff', 10) + e(52, 62, 28, 22, K.yellow) + p('M42 42 Q36 62 42 82 L50 82 Q44 62 50 42Z M60 42 Q56 62 62 82 L70 82 Q64 62 70 42Z', K.ink) +
  c(24, 60, 13, K.yellow) + s('M20 50 q-6 -12 -14 -10 M28 50 q2 -14 -6 -20', K.ink, 2.6) + eye(20, 58, 3) + p('M80 60 l16 4 l-16 4z', K.ink) + s('M34 82 v8 M52 84 v8 M64 82 v8', K.ink, 3));
add('fish', shadow(94, 30) + p('M78 50 Q96 34 96 22 Q96 50 96 78 Q96 66 78 50Z', K.dorange) + p('M18 50 Q34 22 64 28 Q84 34 80 50 Q84 66 64 72 Q34 78 18 50Z', K.orange) + p('M40 28 Q50 10 62 28Z', K.dorange) + p('M40 72 Q50 90 62 72Z', K.dorange) +
  s('M44 32 q-8 18 0 36 M56 30 q-8 20 0 40', '#ffd9a8', 3) + eye(30, 46, 3.8) + s('M20 54 q4 4 8 0', K.dorange, 2));
add('fox', shadow() + p('M70 86 Q100 80 92 52 Q80 62 66 70Z', K.orange) + p('M88 60 Q96 56 92 52 Q86 54 84 60Z', K.white) + p('M24 44 L26 12 L48 30Z M76 44 L74 12 L52 30Z', K.orange) + p('M30 30 L30 20 L42 28Z M70 30 L70 20 L58 28Z', K.ink) +
  e(50, 82, 20, 12, K.orange) + c(50, 54, 27, '#f4a152') + p('M24 58 Q40 56 50 76 Q60 56 76 58 Q70 86 50 88 Q30 86 24 58Z', K.white) + eye(40, 52, 3.6) + eye(60, 52, 3.6) + e(50, 70, 5, 3.8, K.ink));
add('frog', shadow() + e(50, 76, 34, 18, K.green) + r(10, 80, 22, 10, 5, K.dgreen) + r(68, 80, 22, 10, 5, K.dgreen) + c(32, 40, 14, K.green) + c(68, 40, 14, K.green) + c(32, 38, 9, K.white) + c(68, 38, 9, K.white) + c(33, 39, 5, K.ink) + c(67, 39, 5, K.ink) +
  e(50, 58, 32, 20, '#7fdc8e') + s('M28 62 q22 18 44 0', K.dgreen, 3) + c(42, 52, 1.8, K.dgreen) + c(58, 52, 1.8, K.dgreen) + e(50, 76, 16, 10, '#d6f5c8'));
add('lion', shadow() + c(50, 52, 37, '#d9822b') + c(50, 52, 32, '#c76a1a') + c(50, 54, 25, '#f4b860') + c(30, 30, 9, '#f4b860') + c(70, 30, 9, '#f4b860') + e(50, 64, 14, 11, K.cream) + eye(40, 50, 3.8) + eye(60, 50, 3.8) +
  p('M45 60 h10 l-5 6z', K.dpink) + s('M50 66 q-6 6 -11 2 M50 66 q6 6 11 2', K.ink, 2) + s('M30 62 l-8 -2 M30 67 l-8 3 M70 62 l8 -2 M70 67 l8 3', K.dorange, 1.8));

add('octopus', shadow() + s('M22 66 q-14 14 -4 28 M36 72 q-6 16 6 24 M64 72 q6 16 -6 24 M78 66 q14 14 4 28 M28 70 q-8 6 -2 14 M72 70 q8 6 2 14', '#9a5fc9', 9) + c(50, 46, 32, '#b07ad9') +
  c(36, 30, 7, '#ffffff55') + c(40, 46, 8, K.white) + c(60, 46, 8, K.white) + c(41, 47, 4, K.ink) + c(61, 47, 4, K.ink) + s('M42 62 q8 6 16 0', K.ink, 2.4) + c(30, 56, 4, K.pink, 'opacity=".5"') + c(70, 56, 4, K.pink, 'opacity=".5"'));
// ===== FOOD ========================================================================================================
add('apple', shadow() + p('M50 30 C30 18 8 34 14 60 C20 84 38 92 50 86 C62 92 80 84 86 60 C92 34 70 18 50 30Z', K.red) + p('M24 44 q4 -14 20 -16', 'none', 'stroke="#ffffff66" stroke-width="5" stroke-linecap="round"') + s('M50 30 q2 -12 8 -18', K.dbrown, 4) + p('M54 22 q14 -14 26 -4 q-12 10 -26 4Z', K.green));
add('pear', shadow() + p('M50 14 C60 14 60 32 66 44 C86 58 84 90 50 90 C16 90 14 58 34 44 C40 32 40 14 50 14Z', '#b8d84a') + p('M36 52 q-8 14 0 28', 'none', 'stroke="#ffffff66" stroke-width="5" stroke-linecap="round"') + s('M50 16 q0 -8 6 -12', K.dbrown, 4) + p('M52 12 q12 -8 20 0 q-10 8 -20 0Z', K.green));
add('grapes', shadow() + [[34, 40], [52, 38], [70, 42], [42, 56], [60, 56], [50, 72], [30, 56], [74, 58]].map(([x, y]) => c(x!, y!, 10, K.violet) + c(x! - 3, y! - 3, 2.6, '#ffffff66')).join('') + s('M52 38 q0 -14 6 -20', K.dbrown, 4) + p('M56 20 q12 -10 22 -2 q-10 10 -22 2Z', K.green));
add('banana', shadow(94) + p('M16 34 C20 70 50 90 86 70 C70 80 40 74 30 30 Q22 28 16 34Z', K.yellow) + p('M16 34 C20 66 46 84 78 74', 'none', `stroke="${K.dyellow}" stroke-width="3"`) + r(12, 24, 9, 12, 3, K.dbrown, -20) + p('M84 68 l6 4 l-8 4z', K.dbrown));
add('orange', shadow() + c(50, 54, 36, K.orange) + c(38, 40, 9, '#ffffff44') + s('M50 20 q2 -8 8 -10', K.dbrown, 3) + p('M52 18 q12 -8 22 0 q-10 8 -22 0Z', K.green) + [[40, 66], [58, 62], [50, 76], [64, 74], [34, 56]].map(([x, y]) => c(x!, y!, 1.6, K.dorange)).join(''));
add('lemon', shadow() + p('M10 54 Q14 30 50 28 Q86 30 90 54 Q86 78 50 80 Q14 78 10 54Z', K.yellow) + p('M6 54 l8 -4 l-2 8z M94 54 l-8 -4 l2 8z', K.yellow) + c(34, 42, 6, '#ffffff66') + p('M60 28 q8 -12 20 -10 q-6 10 -20 10Z', K.green));
add('pizza', shadow(94) + p('M50 8 L94 84 Q50 100 6 84Z', K.yellow) + p('M50 8 L94 84 Q50 100 6 84Z', 'none', `stroke="#d98a2b" stroke-width="7" stroke-linejoin="round"`) + p('M12 80 Q50 94 88 80 Q50 98 12 80Z', '#d98a2b') +
  c(50, 40, 7, K.red) + c(36, 62, 7, K.red) + c(64, 60, 7, K.red) + c(50, 76, 5, K.red) + c(46, 52, 3, K.green) + c(60, 72, 3, K.green));
add('cake', shadow() + r(16, 56, 68, 34, 8, '#d99a6c') + p('M16 62 q8 14 17 0 q9 14 17 0 q9 14 17 0 q9 14 17 0 L84 56 L16 56Z', K.white) + r(16, 40, 68, 20, 8, '#f6b8c8') + p('M16 46 q8 12 17 0 q9 12 17 0 q9 12 17 0 q9 12 17 0 L84 40 L16 40Z', K.white) +
  r(30, 22, 6, 18, 2, K.blue) + r(47, 22, 6, 18, 2, K.green) + r(64, 22, 6, 18, 2, K.violet) + [33, 50, 67].map((x) => `<path d="M${x} 20 q-5 -6 0 -12 q5 6 0 12z" fill="${K.yellow}"/>`).join('') + c(26, 74, 3, K.red) + c(50, 78, 3, K.red) + c(74, 74, 3, K.red));
add('lollipop', shadow() + r(47, 52, 6, 42, 3, K.white) + c(50, 36, 28, K.pink) + s('M50 36 m0 -3 a3 3 0 1 1 -3 3 a8 8 0 1 1 8 8 a14 14 0 1 1 -14 -14 a20 20 0 1 1 20 20', K.white, 5) + c(38, 22, 4, '#ffffff77'));
add('milk', shadow() + p('M26 36 L36 14 L64 14 L74 36Z', '#d6e6f5') + r(26, 34, 48, 58, 6, K.white) + r(26, 34, 48, 58, 6, 'none', 0, 'stroke="#c9d6e4" stroke-width="3"') + r(26, 50, 48, 28, 0, K.blue) + c(50, 64, 10, K.white) + p('M45 66 q5 -14 10 0 q-5 8 -10 0Z', K.blue) + r(36, 10, 28, 6, 2, '#c9d6e4'));
add('nut', shadow() + e(36, 56, 21, 25, '#d8a257', -18) + e(62, 48, 21, 25, '#e0ad63', 22) + s('M30 68 q10 -6 14 -18 M56 60 q10 -8 14 -22', '#b57d36', 3) + e(52, 66, 24, 18, '#e0ad63', 68) + c(40, 50, 2.4, '#b57d36') + c(60, 44, 2.4, '#b57d36'));
add('egg', shadow() + p('M50 10 C78 10 90 50 90 64 C90 84 72 92 50 92 C28 92 10 84 10 64 C10 50 22 10 50 10Z', K.cream) + p('M50 10 C78 10 90 50 90 64 C90 84 72 92 50 92 C28 92 10 84 10 64 C10 50 22 10 50 10Z', 'none', `stroke="#e0c48a" stroke-width="4"`) + p('M24 44 q4 -20 18 -26', 'none', 'stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"'));
add('tin', shadow() + r(22, 24, 56, 64, 8, '#c9d4de') + r(22, 36, 56, 40, 0, K.red) + e(50, 24, 28, 7, '#e8eef4') + e(50, 88, 28, 6, '#a9b6c3') + r(22, 36, 56, 5, 0, '#ffffff44') + e(50, 56, 12, 12, K.cream) + p('M44 56 q6 -10 12 0 q-6 8 -12 0Z', K.green) + s('M30 30 h6', '#fff', 3));
add('pan', shadow() + r(66, 52, 34, 9, 4, K.dbrown) + p('M8 40 Q8 76 40 76 Q72 76 72 40Z', '#5b6573') + e(40, 40, 32, 9, '#7a8696') + e(40, 40, 27, 6, '#3d4552') + e(40, 46, 20, 3, '#4d5766') + e(22, 36, 5, 2, '#ffffff55'));
add('pot', shadow() + r(10, 40, 12, 8, 4, K.dgrey) + r(78, 40, 12, 8, 4, K.dgrey) + r(18, 34, 64, 54, 10, '#8693b3') + r(18, 34, 64, 10, 4, '#6f7c9c') + r(14, 26, 72, 12, 6, '#9aa6c4') + r(32, 40, 8, 40, 4, '#ffffff33') + c(50, 18, 6, K.dgrey) + s('M42 18 h16', K.dgrey, 3));
add('cup', shadow(92) + e(50, 88, 38, 6, '#d6dce6') + p('M24 36 Q24 74 50 74 Q76 74 76 36Z', K.white) + p('M24 36 Q24 74 50 74 Q76 74 76 36Z', 'none', `stroke="#c9d6e4" stroke-width="3"`) + e(50, 36, 26, 7, '#8b5a2b') + s('M76 44 q18 0 14 14 q-4 10 -18 8', K.white, 7) + s('M76 44 q18 0 14 14 q-4 10 -18 8', '#c9d6e4', 1.6) + r(44, 74, 12, 8, 2, K.white) + p('M32 50 q2 14 14 18', 'none', 'stroke="#4cc3d9" stroke-width="4" stroke-linecap="round"'));
add('mug', shadow() + r(20, 28, 52, 62, 8, K.blue) + r(20, 28, 52, 10, 5, '#3aa9bf') + e(46, 28, 26, 6, '#6b3a1c') + s('M72 42 q22 0 20 18 q-2 14 -20 12', K.blue, 9) + s('M32 20 q-6 -8 0 -14 M46 20 q-6 -8 0 -14 M60 20 q-6 -8 0 -14', '#ffffffaa', 3) + r(28, 40, 8, 40, 4, '#ffffff44'));
// ===== NATURE / SKY ================================================================================================
add('sun', c(50, 50, 24, K.yellow) + Array.from({ length: 12 }, (_, i) => `<rect x="47" y="6" width="6" height="14" rx="3" fill="${K.orange}" transform="rotate(${i * 30} 50 50)"/>`).join('') + c(42, 42, 7, '#ffffff77'));
add('star', shadow(94) + p('M50 8 L61 36 L92 38 L68 58 L76 88 L50 72 L24 88 L32 58 L8 38 L39 36Z', K.yellow) + p('M50 8 L61 36 L92 38 L68 58 L76 88 L50 72Z', '#ffd98c') + p('M50 8 L61 36 L92 38 L68 58 L76 88 L50 72 L24 88 L32 58 L8 38 L39 36Z', 'none', `stroke="${K.dyellow}" stroke-width="3" stroke-linejoin="round"`));
add('moon', p('M60 8 A42 42 0 1 0 92 62 A34 34 0 1 1 60 8Z', '#ffe98a') + p('M60 8 A42 42 0 1 0 92 62 A34 34 0 1 1 60 8Z', 'none', `stroke="${K.dyellow}" stroke-width="3" stroke-linejoin="round"`) + c(36, 62, 5, '#f0d060') + c(48, 36, 3.6, '#f0d060') + c(40, 80, 3, '#f0d060') + c(84, 22, 3, '#fff') + c(92, 40, 2, '#fff'));
add('rainbow', shadow(92, 36) + ['#ef476f', '#ff9f43', '#ffd166', '#6fd37e', '#4cc3d9', '#9b8bf0'].map((col, i) => s(`M${8 + i * 5} 84 A${42 - i * 5} ${42 - i * 5} 0 0 1 ${92 - i * 5} 84`, col, 5.2)).join('') + e(14, 86, 12, 7, K.white) + e(86, 86, 12, 7, K.white) + e(22, 88, 10, 6, K.white) + e(78, 88, 10, 6, K.white));
add('flower', shadow() + s('M50 50 V92', K.dgreen, 5) + p('M50 78 q-18 -4 -22 -18 q18 0 22 18Z M50 70 q18 -4 22 -18 q-18 0 -22 18Z', K.green) + [0, 72, 144, 216, 288].map((a) => e(50, 24, 11, 15, K.pink, a).replace('rotate(' + a + ' 50 24)', `rotate(${a} 50 38)`)).join('') + c(50, 38, 11, K.yellow) + c(47, 35, 3.4, '#ffffff77'));
add('leaf', shadow(94) + p('M14 88 C10 40 44 10 90 12 C92 58 64 90 14 88Z', K.green) + s('M14 88 C36 66 58 42 82 20', K.dgreen, 3.4) + s('M40 62 q14 2 22 -4 M54 46 q10 2 16 -4 M30 76 q8 0 14 -4', K.dgreen, 2.4));
add('feather', shadow(94) + p('M20 88 C8 52 30 14 84 8 C92 56 66 88 20 88Z', '#8fd0f0') + p('M20 88 C8 52 30 14 84 8 C66 26 40 54 20 88Z', K.blue) + s('M16 92 C34 66 58 36 84 10', K.white, 3) + s('M40 62 l-12 6 M54 46 l-12 8 M68 32 l-12 8', '#ffffff99', 2.4));
add('fire', shadow() + p('M50 8 C62 28 82 38 80 64 C78 84 64 94 50 94 C34 94 20 84 22 64 C24 48 36 44 38 28 C44 36 46 22 50 8Z', K.orange) + p('M50 34 C58 50 70 56 68 70 C66 82 58 90 50 90 C40 90 32 82 34 70 C36 60 44 56 50 34Z', K.yellow) + p('M50 60 C54 68 60 70 58 78 C56 84 52 86 50 86 C46 86 42 82 44 76 C46 70 48 68 50 60Z', '#fff3b0'));
add('nest', shadow(94, 34) + e(50, 70, 40, 20, '#b8793a') + s('M14 70 q36 24 72 0 M18 62 q32 18 64 0 M22 78 q28 14 56 0 M12 66 l30 -10 M88 66 l-30 -10 M30 58 l26 14', K.dbrown, 3) + e(38, 56, 11, 14, K.blue) + e(58, 54, 11, 14, K.blue) + e(48, 60, 11, 14, '#7fd5e8') + s('M32 48 q2 -6 6 -6', '#fff', 2));
add('hill', shadow(94, 44) + p('M2 90 Q10 30 50 30 Q90 30 98 90Z', K.green) + p('M2 90 Q10 30 50 30 Q40 50 44 90Z', '#82dc8e') + p('M62 30 V10 l16 6 l-16 6', K.red) + s('M62 30 V8', K.dbrown, 3) + e(74, 58, 6, 3, K.dgreen) + e(24, 64, 6, 3, K.dgreen));
add('kiwi', shadow() + e(50, 56, 38, 34, '#8b6a3c') + e(50, 56, 38, 34, 'none').replace('fill="none"', 'fill="none" stroke="#6b4f26" stroke-width="2.4" stroke-dasharray="2 5"') + p('M12 56 Q16 28 50 22 L50 90 Q16 84 12 56Z', '#9c7a47', 'opacity=".5"') +
  p('M62 14 q8 -6 14 0', 'none', 'stroke="#6b4f26" stroke-width="3" stroke-linecap="round"') + e(50, 56, 30, 26, '#8fd14f') + e(50, 56, 22, 19, '#c5ee7a') + e(50, 56, 6, 5, '#f5ffd0') + Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return c(+(50 + Math.cos(a) * 14).toFixed(1), +(56 + Math.sin(a) * 12).toFixed(1), 1.6, K.ink); }).join(''));
add('kangaroo', shadow() + s('M70 84 q22 6 20 -16 q-2 -8 -10 -6', '#c98f58', 9) + e(54, 70, 22, 22, '#d9a066') + e(54, 76, 12, 14, '#f0d4a8') + p('M40 90 L26 96 L52 96Z M62 90 L58 96 L84 96Z', '#c98f58') + e(34, 60, 9, 5, '#c98f58', 28) +
  e(64, 30, 7, 16, '#d9a066', 12) + e(52, 30, 7, 16, '#d9a066', -14) + c(58, 44, 16, '#d9a066') + e(62, 50, 8, 6, '#f0d4a8') + c(60, 42, 2.8, K.ink) + c(66, 42, 2.8, K.ink) + e(66, 50, 3, 2.2, K.ink));
add('rock', shadow() + p('M10 86 Q6 52 26 36 Q42 22 66 30 Q92 40 92 86Z', K.grey) + p('M10 86 Q6 52 26 36 Q34 30 44 28 Q30 52 38 86Z', '#c4ccd4') + p('M60 86 Q58 60 78 50 Q90 56 92 86Z', '#8f9aa6') + s('M44 50 l8 8 l-4 10', K.dgrey, 2.4));
add('heart', shadow(94) + p('M50 90 C10 60 6 34 24 22 C38 14 48 22 50 32 C52 22 62 14 76 22 C94 34 90 60 50 90Z', K.red) + p('M20 34 q4 -10 16 -10', 'none', 'stroke="#ffffff88" stroke-width="5" stroke-linecap="round"'));
add('ball', shadow() + c(50, 50, 38, K.white) + p('M50 12 L66 24 L60 42 L40 42 L34 24Z', K.ink) + p('M12 46 L30 40 L38 56 L26 70Z', K.ink) + p('M88 46 L70 40 L62 56 L74 70Z', K.ink) + p('M36 84 L40 68 L60 68 L64 84 L50 90Z', K.ink) + c(50, 50, 38, 'none', 'stroke="#c9d3de" stroke-width="3"'));
add('gift', shadow() + r(14, 44, 72, 46, 4, K.violet) + r(10, 32, 80, 18, 4, '#b4a8f5') + r(44, 32, 12, 58, 0, K.yellow) + p('M50 32 q-20 -22 -26 -10 q6 14 26 10Z M50 32 q20 -22 26 -10 q-6 14 -26 10Z', K.red) + c(50, 32, 6, K.dred));
add('igloo', shadow(92, 40) + p('M8 84 Q8 22 50 22 Q92 22 92 84Z', '#e8f3fb') + p('M8 84 Q8 22 50 22 Q92 22 92 84Z', 'none', `stroke="#bcd7ee" stroke-width="3"`) + s('M12 62 H88 M18 44 H82 M30 30 H70 M34 22 v22 M50 22 v22 M66 22 v22 M22 44 v18 M42 44 v18 M58 44 v18 M78 44 v18 M12 62 v22 M30 62 v22 M50 62 v22 M70 62 v22 M88 62 v22', '#bcd7ee', 2.4) +
  p('M36 84 Q36 62 50 62 Q64 62 64 84Z', '#4a6fa5') + r(10, 84, 80, 6, 3, '#d6e6f5'));
add('ink', shadow() + p('M24 48 Q24 32 38 32 L62 32 Q76 32 76 48 L80 82 Q80 92 70 92 L30 92 Q20 92 20 82Z', '#2b3a67') + r(38, 22, 24, 12, 3, K.dbrown) + p('M24 48 L76 48 L80 82 Q80 92 70 92 L30 92 Q20 92 20 82Z', '#3a4d87') + c(50, 70, 11, K.white) + p('M50 60 q-8 12 0 18 q8 -6 0 -18z', '#2b3a67') + s('M34 56 q-2 14 2 24', '#ffffff55', 4) + s('M62 30 L84 8', K.red, 4) + p('M84 8 l6 -2 l-2 8z', K.dbrown));
// ===== THINGS ======================================================================================================
add('tap', shadow() + r(40, 6, 20, 10, 4, K.red) + r(36, 4, 28, 6, 3, K.dred) + r(44, 14, 12, 18, 0, '#8fa2b5') + r(12, 30, 70, 20, 10, '#aab9c9') + r(12, 30, 70, 6, 3, '#ffffff55') + r(60, 46, 22, 12, 5, '#8fa2b5') + p('M71 66 q-9 12 0 18 q9 -6 0 -18z', K.blue));
add('map', shadow() + p('M8 22 L34 12 L62 22 L90 12 L90 78 L62 88 L34 78 L8 88Z', '#f4e1b0') + p('M34 12 L34 78 M62 22 L62 88', 'none', `stroke="#d9bf7a" stroke-width="2.5"`) + p('M12 60 q14 -10 22 2 q10 10 22 -4', 'none', `stroke="${K.blue}" stroke-width="4" stroke-linecap="round"`) + s('M70 30 q8 6 14 -2', K.green, 5) +
  s('M44 40 l10 12 M54 40 l-10 12', K.red, 4) + c(20, 34, 5, K.green));
add('sock', shadow() + p('M34 8 L66 8 L66 54 Q66 66 82 72 Q94 80 86 90 Q78 96 62 90 Q34 80 34 56Z', K.blue) + r(34, 8, 32, 14, 3, K.white) + p('M34 28 H66 V36 H34Z M34 44 H66 V50 H34Z', K.white) + p('M66 60 Q76 70 88 76 Q92 84 86 90 Q76 92 70 84Z', K.dblue) + c(50, 70, 3, '#ffffff77'));
add('pen', shadow() + p('M14 86 L24 62 L70 16 L84 30 L38 76Z', K.red) + p('M70 16 L84 30 L92 22 Q96 14 88 8 Q80 6 70 16Z', K.dgrey) + p('M14 86 L24 62 L38 76Z', '#f4e1b0') + p('M14 86 L18 74 L26 82Z', K.ink) + p('M28 66 L72 20 L76 24 L32 70Z', '#ffffff44'));
add('net', shadow() + s('M44 56 L88 94', K.dbrown, 7) + c(36, 40, 28, 'none', `stroke="${K.dgrey}" stroke-width="5"`) + p('M12 40 Q12 86 36 86 Q60 86 60 40Z', '#d6f1c9', 'opacity=".9"') + s('M16 52 H56 M18 64 H54 M24 76 H48 M24 40 V80 M36 40 V86 M48 40 V80', K.dgreen, 2));
add('hat', shadow() + e(50, 78, 42, 10, '#3d3a52') + r(24, 24, 52, 56, 6, K.ink) + e(50, 24, 26, 7, '#3d3a52') + r(24, 62, 52, 14, 0, K.red) + r(28, 30, 8, 28, 4, '#ffffff22'));
add('bed', shadow() + r(8, 52, 84, 28, 6, '#8a5a2b') + r(8, 28, 8, 62, 3, '#6b3f1a') + r(84, 38, 8, 52, 3, '#6b3f1a') + r(14, 44, 72, 20, 8, K.white) + r(18, 36, 22, 14, 7, '#ffd9e2') + r(14, 56, 72, 18, 5, K.blue) + p('M14 62 q8 8 18 0 q10 8 18 0 q10 8 18 0 q8 8 18 0 V74 H14Z', '#3aa9bf'));
add('bus', shadow(94) + r(6, 24, 88, 56, 12, K.yellow) + r(6, 64, 88, 16, 6, '#e0a100') + [14, 36, 58].map((x) => r(x, 32, 18, 18, 4, '#bfe8ff')).join('') + r(76, 32, 14, 28, 4, '#bfe8ff') + c(26, 82, 10, K.ink) + c(74, 82, 10, K.ink) + c(26, 82, 4, K.grey) + c(74, 82, 4, K.grey) + r(88, 62, 8, 6, 2, K.red) + r(10, 60, 80, 3, 0, '#ffffff66'));
add('log', shadow() + r(10, 28, 76, 50, 12, '#b8793a') + e(86, 53, 11, 25, '#d9a066') + e(86, 53, 7, 17, '#c98f58') + e(86, 53, 3, 8, '#b8793a') + s('M22 40 H60 M18 54 H70 M24 66 H56', '#8a5a2b', 3) + s('M12 40 q-4 8 0 16', '#ffffff44', 3));
add('pin', shadow(94, 24) + p('M50 24 L44 90 L56 90Z', K.grey) + p('M50 24 L50 90 L56 90Z', '#8896a5') + c(50, 22, 14, K.red) + c(45, 17, 4.4, '#ffffff77'));
add('kid', shadow() + r(36, 62, 28, 30, 10, K.blue) + r(38, 84, 10, 10, 3, K.dblue) + r(52, 84, 10, 10, 3, K.dblue) + e(28, 74, 7, 12, K.skin, 18) + e(72, 74, 7, 12, K.skin, -18) + c(50, 40, 24, K.skin) + p('M26 38 Q28 14 50 14 Q72 14 74 38 Q60 28 50 30 Q38 28 26 38Z', K.dbrown) + eye(42, 44, 3.4) + eye(58, 44, 3.4) + s('M43 54 q7 6 14 0', K.dred, 2.6) + c(36, 52, 4, K.pink, 'opacity=".5"') + c(64, 52, 4, K.pink, 'opacity=".5"'));
add('man', shadow() + r(32, 64, 36, 30, 6, '#3b5b8c') + r(34, 56, 32, 28, 8, K.green) + e(26, 72, 7, 14, K.skin, 14) + e(74, 72, 7, 14, K.skin, -14) + c(50, 38, 22, K.dskin) + p('M28 34 Q30 12 50 12 Q70 12 72 34 Q62 26 50 28 Q38 26 28 34Z', '#4a3a2a') + eye(42, 40, 3.2) + eye(58, 40, 3.2) + s('M43 50 q7 5 14 0', K.dred, 2.6) + s('M36 48 q14 12 28 0', '#4a3a2a', 2, 'opacity=".5"'));
add('mum', shadow() + p('M26 52 Q24 18 50 14 Q76 18 74 52 Q72 80 66 92 L34 92 Q28 80 26 52Z', '#6b3f1a') + p('M30 62 L70 62 L86 94 L14 94Z', '#9b5de5') + r(16, 60, 8, 22, 4, K.dskin, 14) + r(76, 60, 8, 22, 4, K.dskin, -14) + c(50, 38, 21, K.dskin) +
  p('M28 38 Q28 12 50 12 Q72 12 72 38 Q64 22 50 24 Q36 22 28 38Z', '#6b3f1a') + eye(42, 40, 3.2) + eye(58, 40, 3.2) + s('M43 49 q7 6 14 0', K.dred, 2.6) + c(36, 47, 4, K.pink, 'opacity=".5"') + c(64, 47, 4, K.pink, 'opacity=".5"') + c(50, 62, 3.5, K.yellow));
add('mop', shadow() + s('M58 6 L38 66', K.dbrown, 6) + p('M20 66 Q38 58 60 66 L66 92 L16 92Z', K.cream) + s('M24 70 v20 M32 68 v22 M40 68 v22 M48 68 v22 M56 70 v20', '#e0cfa8', 3) + p('M20 66 Q38 58 60 66 L62 74 Q38 66 18 74Z', K.blue));
add('bag', shadow() + p('M26 28 Q26 6 50 6 Q74 6 74 28', 'none', `stroke="${K.dbrown}" stroke-width="7" stroke-linecap="round"`) + p('M16 32 L84 32 L90 88 Q90 94 82 94 L18 94 Q10 94 10 88Z', K.red) + p('M16 32 L84 32 L86 46 L14 46Z', K.dred) + r(40, 44, 20, 14, 4, K.yellow) + c(50, 51, 3, K.dyellow));
add('bell', shadow() + c(50, 10, 6, 'none', `stroke="${K.dyellow}" stroke-width="4"`) + p('M50 14 C74 14 82 38 82 62 L92 80 H8 L18 62 C18 38 26 14 50 14Z', K.yellow) + p('M50 14 C74 14 82 38 82 62 L92 80 H8 L18 62 C18 38 26 14 50 14Z', 'none', `stroke="${K.dyellow}" stroke-width="3"`) + p('M28 44 q4 -16 20 -18', 'none', 'stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"') + c(50, 88, 8, K.dyellow));
add('doll', shadow() + p('M30 56 L70 56 L80 92 L20 92Z', K.pink) + r(22, 60, 8, 22, 4, K.skin, 14) + r(70, 60, 8, 22, 4, K.skin, -14) + c(50, 34, 21, K.skin) + p('M26 34 Q24 8 50 8 Q76 8 74 34 Q70 18 50 18 Q30 18 26 34Z', K.yellow) + s('M26 34 q-6 20 0 34 M74 34 q6 20 0 34', K.yellow, 8) + eye(42, 38, 3) + eye(58, 38, 3) + s('M44 46 q6 5 12 0', K.dred, 2.4) + c(36, 44, 4, K.pink, 'opacity=".6"') + c(64, 44, 4, K.pink, 'opacity=".6"'));
add('lip', shadow(90, 30) + p('M8 50 Q28 26 50 38 Q72 26 92 50 Q72 76 50 74 Q28 76 8 50Z', K.red) + p('M8 50 Q30 58 50 54 Q70 58 92 50 Q72 76 50 74 Q28 76 8 50Z', K.dred) + s('M8 50 Q30 58 50 54 Q70 58 92 50', K.ink, 2.6) + p('M30 36 q10 -4 18 2', 'none', 'stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"'));
add('nose', shadow(94, 22) + e(50, 62, 24, 20, K.skin) + p('M40 14 Q38 44 34 62 L66 62 Q62 44 60 14Z', K.skin) + e(38, 70, 6, 8, K.dskin) + e(62, 70, 6, 8, K.dskin) + e(50, 74, 4, 3, K.dskin) + e(42, 40, 3, 16, '#ffffff55'));
add('tooth', shadow() + p('M18 30 Q18 10 38 12 Q50 16 62 12 Q82 10 82 30 Q82 50 74 60 Q72 90 62 90 Q54 90 54 66 Q50 62 46 66 Q46 90 38 90 Q28 90 26 60 Q18 50 18 30Z', K.white) + p('M18 30 Q18 10 38 12 Q50 16 62 12 Q82 10 82 30 Q82 50 74 60 Q72 90 62 90 Q54 90 54 66 Q50 62 46 66 Q46 90 38 90 Q28 90 26 60 Q18 50 18 30Z', 'none', 'stroke="#d6dfe8" stroke-width="3"') + p('M28 24 q6 -8 14 -8', 'none', 'stroke="#bfe8ff" stroke-width="4" stroke-linecap="round"'));
add('nail', shadow(94, 20) + e(50, 14, 22, 7, '#8896a5') + e(50, 11, 22, 5, '#b5bfca') + p('M44 16 L56 16 L52 90 L48 90Z', '#9aa5b1') + p('M44 16 L50 16 L48 90Z', '#c4ccd4'));
add('axe', shadow() + s('M30 94 L66 14', K.dbrown, 9) + p('M52 12 Q82 4 94 26 Q82 40 64 36 L56 24Z', '#9aa8b8') + p('M52 12 Q82 4 94 26 Q86 30 78 30 Q76 14 52 12Z', '#c4ccd8') + p('M94 26 Q82 40 64 36 L66 30 Q80 32 94 26Z', '#6b7685'));
add('tent', shadow(94, 42) + p('M4 88 L50 12 L96 88Z', K.orange) + p('M50 12 L96 88 L62 88Z', '#e0791c') + p('M50 40 L70 88 L30 88Z', '#8a4b1a') + p('M50 40 L50 88', 'none', `stroke="#6b3a12" stroke-width="2.4"`) + p('M50 12 V4 l12 4 l-12 4', K.red) + s('M4 88 L-2 94 M96 88 L102 94', K.dbrown, 3));
add('train', shadow(94, 40) + r(8, 36, 56, 40, 6, K.blue) + r(58, 22, 36, 54, 8, K.dblue) + r(66, 30, 22, 20, 4, '#bfe8ff') + r(14, 24, 14, 14, 3, K.dgrey) + r(12, 18, 18, 8, 3, '#4a5463') + r(8, 66, 86, 8, 2, '#33405a') + c(24, 80, 10, K.ink) + c(50, 80, 10, K.ink) + c(78, 80, 10, K.ink) + c(24, 80, 4, K.grey) + c(50, 80, 4, K.grey) + c(78, 80, 4, K.grey) + r(14, 44, 40, 12, 4, '#ffffff44') + c(70, 66, 4, K.yellow));
add('car', shadow(94) + p('M6 70 L6 56 Q6 48 16 46 L28 28 Q32 22 40 22 L64 22 Q72 22 76 28 L88 46 Q96 48 96 58 L96 70Z', K.red) + p('M32 30 L40 28 L40 44 L22 44Z M46 28 L64 28 L72 44 L46 44Z', '#bfe8ff') + r(4, 62, 94, 14, 6, K.dred) + c(26, 78, 11, K.ink) + c(76, 78, 11, K.ink) + c(26, 78, 4.4, K.grey) + c(76, 78, 4.4, K.grey) + c(92, 56, 4, K.yellow));
add('drum', shadow() + p('M14 40 L14 78 Q14 92 50 92 Q86 92 86 78 L86 40Z', K.red) + p('M22 44 L34 90 M42 46 L50 92 M58 46 L50 92 M78 44 L66 90', 'none', `stroke="${K.yellow}" stroke-width="4" stroke-linecap="round"`) + e(50, 40, 36, 12, '#fff5e0') + e(50, 40, 36, 12, 'none').replace('fill="none"', `fill="none" stroke="${K.yellow}" stroke-width="4"`) + s('M24 8 L54 38 M76 8 L50 38', '#a46a2c', 4) + c(24, 8, 4.4, '#a46a2c') + c(76, 8, 4.4, '#a46a2c'));
add('door', shadow() + r(22, 8, 56, 86, 6, K.dbrown) + r(28, 14, 44, 74, 4, '#b8793a') + r(34, 20, 14, 26, 3, '#a56a2c') + r(52, 20, 14, 26, 3, '#a56a2c') + r(34, 52, 14, 30, 3, '#a56a2c') + r(52, 52, 14, 30, 3, '#a56a2c') + c(66, 58, 4.4, K.yellow) + c(66, 58, 1.8, K.dyellow));
add('guitar', shadow() + s('M62 40 L90 12', K.dbrown, 7) + r(84, 4, 12, 14, 3, K.ink, 40) + c(36, 74, 20, '#d9822b') + c(48, 56, 14, '#d9822b') + c(36, 74, 20, 'none', 'stroke="#a8561a" stroke-width="3"') + c(40, 66, 7, '#3a2210') + c(40, 66, 7, 'none', `stroke="${K.dbrown}" stroke-width="2"`) + s('M44 62 L82 22', '#f4e1b0', 1.6) + r(22, 82, 22, 5, 2, K.dbrown, -30));
add('kite', shadow(94, 20) + s('M50 66 q-10 8 0 14 q10 6 0 14', K.dbrown, 2.6) + p('M50 6 L84 40 L50 74 L16 40Z', K.red) + p('M50 6 L84 40 L50 40Z', K.yellow) + p('M50 74 L16 40 L50 40Z', K.yellow) + p('M50 6 V74 M16 40 H84', 'none', 'stroke="#fff" stroke-width="2.4" opacity=".8"') + p('M44 82 l-8 -4 l2 10z M56 90 l8 -4 l-2 10z', K.blue));
add('key', shadow() + c(30, 36, 22, K.yellow) + c(30, 36, 11, '#e8f3fb') + r(46, 32, 46, 9, 3, K.yellow) + r(70, 40, 8, 14, 2, K.yellow) + r(82, 40, 8, 18, 2, K.yellow) + c(22, 26, 5, '#ffffff77') + c(30, 36, 22, 'none', `stroke="${K.dyellow}" stroke-width="3"`));
add('envelope', shadow() + r(8, 22, 84, 58, 6, K.white) + r(8, 22, 84, 58, 6, 'none', 0, 'stroke="#c9d6e4" stroke-width="3"') + p('M8 28 L50 58 L92 28', 'none', `stroke="#c9d6e4" stroke-width="3" stroke-linejoin="round"`) + p('M8 76 L38 50 M92 76 L62 50', 'none', `stroke="#d6dfe8" stroke-width="2.4"`) + p('M66 12 l8 8 l8 -8 q6 -6 -2 -10 q-6 -2 -6 4 q0 -6 -6 -4 q-8 4 -2 10z', K.red, 'transform="translate(4 0)"'));
add('umbrella', shadow() + s('M50 44 V84 q0 10 -12 10 q-10 0 -10 -10', K.dviolet, 5) + p('M6 48 Q6 8 50 8 Q94 8 94 48 Q84 40 76 48 Q66 40 58 48 Q50 40 42 48 Q34 40 24 48 Q14 40 6 48Z', K.violet) + p('M50 8 Q34 24 42 48 M50 8 Q66 24 58 48', 'none', `stroke="${K.dviolet}" stroke-width="2.6"`) + p('M18 30 q8 -12 22 -16', 'none', 'stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"'));
add('up', shadow(94, 18) + c(50, 50, 40, '#e8f6ff') + p('M50 14 L84 52 L62 52 L62 86 L38 86 L38 52 L16 52Z', K.green) + p('M50 14 L84 52 L62 52 L62 86 L50 86Z', K.dgreen) + p('M50 14 L84 52 L62 52 L62 86 L38 86 L38 52 L16 52Z', 'none', 'stroke="#2f7d46" stroke-width="3" stroke-linejoin="round"'));
add('robot', shadow() + s('M50 24 V12', K.dgrey, 4) + c(50, 10, 6, K.red) + r(24, 24, 52, 38, 12, '#8fb3e8') + r(30, 32, 40, 22, 8, K.ink) + c(41, 43, 6, '#7ee2ff') + c(59, 43, 6, '#7ee2ff') + r(30, 66, 40, 28, 10, '#8fb3e8') + c(50, 80, 6, K.yellow) + r(14, 68, 14, 8, 4, '#5a86c7') + r(72, 68, 14, 8, 4, '#5a86c7') + r(34, 92, 12, 6, 3, '#5a86c7') + r(54, 92, 12, 6, 3, '#5a86c7'));
add('rocket', shadow(94, 22) + p('M36 74 Q50 108 64 74Z', K.orange) + p('M42 74 Q50 98 58 74Z', K.yellow) + p('M50 4 C72 22 74 56 70 78 L30 78 C26 56 28 22 50 4Z', '#f1f5fb') + p('M50 4 C72 22 74 56 70 78 L30 78 C26 56 28 22 50 4Z', 'none', 'stroke="#c9d3e6" stroke-width="3"') + p('M50 4 C60 12 66 22 69 34 L31 34 C34 22 40 12 50 4Z', K.red) + c(50, 52, 11, '#9ad7ff') + c(50, 52, 11, 'none', 'stroke="#5aa9e6" stroke-width="3.4"') + c(46, 48, 3.4, '#ffffffcc') + p('M30 58 L14 82 L32 76Z M70 58 L86 82 L68 76Z', K.red));
add('ring', shadow(94, 24) + c(50, 62, 26, 'none', `stroke="${K.yellow}" stroke-width="11"`) + c(50, 62, 26, 'none', `stroke="${K.dyellow}" stroke-width="2"`) + p('M50 8 L64 20 L58 36 L42 36 L36 20Z', K.blue) + p('M50 8 L64 20 L50 22 L36 20Z', '#a6e7f3') + p('M42 36 L58 36 L50 24Z', '#2b8fa3'));
add('house', shadow(94, 42) + r(16, 44, 68, 46, 3, '#f2d9a8') + p('M6 48 L50 8 L94 48Z', K.red) + p('M50 8 L94 48 L72 48Z', K.dred) + r(42, 62, 18, 28, 3, K.dbrown) + r(22, 54, 16, 16, 2, '#bfe8ff') + r(64, 54, 14, 16, 2, '#bfe8ff') + c(56, 76, 1.8, K.yellow) + r(66, 12, 9, 22, 2, '#8a5a2b'));
add('soap', shadow() + r(10, 40, 80, 44, 14, '#ff9db9') + r(10, 40, 80, 14, 7, '#ffb8ce') + e(30, 48, 10, 3.4, '#ffffff88') + c(24, 20, 10, '#cfeaff', 'opacity=".9"') + c(52, 12, 8, '#cfeaff', 'opacity=".9"') + c(76, 24, 12, '#cfeaff', 'opacity=".9"') + c(22, 17, 3, '#ffffffcc') + c(72, 20, 3.4, '#ffffffcc'));

// ===== DIGRAPH WORDS (sh ch th ng) =================================================================================
const mirror = (body: string): string => `<g transform="translate(100 0) scale(-1 1)">${body}</g>`;
const waves = (y: number, f: Col): string => p(`M-6 ${y} q8 -8 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 V100 H-6Z`, f);

add('ship', shadow(95, 36) + p('M6 52 H94 L80 84 H20Z', K.red) + p('M12 66 H88 L84 74 H16Z', K.white) + r(4, 48, 92, 8, 4, K.dred) + r(28, 30, 44, 20, 4, K.white) + r(28, 44, 44, 6, 0, '#dfe8f0') +
  c(38, 40, 4.4, K.blue) + c(50, 40, 4.4, K.blue) + c(62, 40, 4.4, K.blue) + r(40, 12, 20, 22, 4, K.orange) + r(40, 12, 20, 7, 3, K.ink) + r(36, 28, 28, 6, 3, K.dorange) +
  s('M82 48 V12', K.dbrown, 3) + p('M82 12 L98 18 L82 24Z', K.yellow) + c(46, 4, 4.4, '#ffffff99') + c(54, -2, 3.4, '#ffffff77') + waves(82, K.blue) + waves(90, '#7fd5e8'));
add('shell', shadow(94, 38) + e(50, 88, 46, 9, K.tan) + e(40, 90, 14, 3, '#f4dba8') + p('M50 86 L12 54 Q4 28 24 20 Q32 12 40 16 Q50 6 60 16 Q68 12 76 20 Q96 28 88 54Z', K.dpink) +
  p('M50 84 L16 54 Q10 32 26 26 Q34 20 40 22 Q50 14 60 22 Q66 20 74 26 Q90 32 84 54Z', '#ffb3c6') + s('M50 84 L24 32 M50 84 L38 24 M50 84 L50 20 M50 84 L62 24 M50 84 L76 32', K.dpink, 3.2) +
  p('M36 86 L64 86 L60 94 L40 94Z', K.dpink) + p('M34 82 L50 86 L30 70Z M66 82 L50 86 L70 70Z', '#ffd0dc') + s('M24 40 q4 -10 14 -14', K.white, 4, 'opacity=".6"'));
add('sheep', shadow() + r(26, 72, 8, 22, 3, '#4a4458') + r(40, 74, 8, 20, 3, '#4a4458') + r(60, 72, 8, 22, 3, '#4a4458') + r(72, 74, 8, 20, 3, '#4a4458') +
  [[24, 54, 15], [28, 38, 16], [46, 32, 18], [64, 38, 16], [70, 54, 15], [46, 66, 18], [28, 68, 13], [64, 68, 14], [46, 50, 18]].map(([x, y, rr]) => c(x!, y! + 2, rr!, '#d6dbea')).join('') +
  [[24, 54, 15], [28, 38, 16], [46, 32, 18], [64, 38, 16], [70, 54, 15], [46, 66, 18], [28, 68, 13], [64, 68, 14], [46, 50, 18]].map(([x, y, rr]) => c(x!, y!, rr!, K.white)).join('') +
  e(84, 48, 13, 16, '#4a4458') + e(74, 38, 10, 5, '#3a3548', 36) + c(80, 28, 8, K.white) + c(88, 30, 6, K.white) + c(84, 43, 3.8, K.white) + c(85, 44, 2.2, K.ink) + e(88, 58, 5, 3.4, '#6a6478'));
add('shoe', shadow(94, 42) + p('M12 40 Q12 34 22 34 L36 34 Q40 42 54 46 Q70 50 86 58 Q98 62 98 74 V78 H12Z', K.dblue) + p('M12 40 Q12 34 22 34 L36 34 Q40 42 54 46 Q64 48 72 52 Q50 56 12 56Z', K.blue) +
  p('M68 52 Q74 54 86 58 Q98 62 98 74 V78 H64Z', K.white) + p('M12 34 Q10 24 20 22 L32 22 L36 34Z', K.dblue) + s('M20 64 Q46 58 66 66', K.yellow, 5) + r(6, 74, 94, 14, 7, K.white) + r(6, 82, 94, 6, 3, '#d6dfe8') +
  s('M42 40 L54 34 M48 45 L60 39 M54 49 L66 43', K.white, 4) + s('M18 34 q8 -6 16 0', '#ffffff66', 3));
add('shop', shadow(94, 44) + r(14, 30, 72, 60, 3, '#ffe0a8') + r(14, 30, 72, 8, 0, '#f0c880') + r(24, 4, 52, 20, 5, K.dbrown) + r(28, 8, 44, 12, 3, K.brown) + c(38, 14, 3.2, K.yellow) + c(50, 14, 3.2, K.yellow) + c(62, 14, 3.2, K.yellow) +
  r(20, 54, 24, 36, 3, K.blue) + r(25, 59, 14, 26, 2, '#7fd5e8') + c(40, 74, 2, K.yellow) + r(52, 52, 28, 24, 3, K.dbrown) + r(55, 55, 22, 18, 2, '#bfe8ff') + r(50, 74, 32, 5, 2, K.brown) + r(60, 66, 6, 6, 1.5, K.red) + c(70, 69, 3.6, K.orange) +
  [0, 1, 2, 3, 4].map((i) => p(`M${8 + i * 17} 28 H${25 + i * 17} V42 q-8.5 9 -17 0Z`, i % 2 ? K.white : K.red)).join('') + r(8, 26, 85, 5, 2, K.dred));
add('shed', shadow(94, 44) + r(12, 40, 76, 50, 2, K.brown) + [26, 40, 54, 68, 82].map((x) => s(`M${x} 42 V90`, K.dbrown, 1.6)).join('') + p('M2 40 L98 22 L98 34 L2 52Z', '#5b6573') + p('M2 40 L98 22 L98 27 L2 45Z', '#7d8a98') + p('M2 52 L98 34 L98 38 L2 56Z', '#3d4552') +
  r(34, 52, 32, 38, 2, K.dbrown) + r(37, 55, 26, 32, 1, '#9b6429') + s('M38 56 L62 86 M38 86 L62 56', '#7a4a1d', 3.2) + r(56, 68, 12, 10, 2.5, K.yellow) + s('M58.5 68 v-5 a3.5 3.5 0 0 1 7 0 v5', K.grey, 2.6) + c(62, 73, 1.6, K.dyellow) +
  p('M4 92 q4 -10 8 0 M88 92 q4 -10 8 0 M10 92 q2 -8 6 0', K.green) + r(8, 90, 84, 4, 2, K.dgreen));
add('dish', shadow(94, 36) + e(50, 62, 38, 26, '#d6e6f5') + e(50, 58, 38, 26, K.white) + e(50, 58, 38, 26, 'none').replace('fill="none"', `fill="none" stroke="${K.blue}" stroke-width="5"`) + e(50, 58, 26, 16, '#e8f3fb') +
  c(40, 54, 7, K.red) + c(38, 52, 2, '#ffffff88') + [[52, 58], [60, 54], [56, 64], [66, 60], [48, 64]].map(([x, y]) => c(x!, y!, 4.6, K.green) + c(x! - 1.2, y! - 1.4, 1.4, '#ffffff88')).join('') + c(46, 62, 5, K.orange) +
  r(9, 38, 3.4, 22, 1.7, K.grey) + r(14.4, 38, 3.4, 22, 1.7, K.grey) + r(19.8, 38, 3.4, 22, 1.7, K.grey) + r(9, 54, 14.2, 8, 3, K.grey) + r(13, 60, 6, 32, 3, K.grey) + r(13, 60, 2.4, 30, 1, '#ffffff77') +
  e(88, 50, 8, 12, K.grey) + e(86, 47, 2.6, 5, '#ffffff77') + r(85, 60, 6, 32, 3, K.grey));
add('chair', shadow(95, 36) + r(24, 44, 7, 44, 2, K.dbrown) + r(60, 40, 7, 40, 2, K.dbrown) + r(24, 8, 7, 54, 2, K.brown) + r(60, 8, 7, 50, 2, K.brown) + r(22, 6, 48, 10, 4, '#d9a066') +
  r(34, 20, 6, 32, 2, '#d9a066') + r(46, 20, 6, 32, 2, '#d9a066') + p('M20 56 L66 56 L84 68 L38 68Z', '#f0c58a') + p('M38 68 L84 68 L84 76 L38 76Z', K.brown) + p('M20 56 L38 68 L38 76 L20 64Z', K.dbrown) +
  r(38, 76, 8, 18, 2, K.brown) + r(76, 76, 8, 18, 2, K.brown) + r(20, 64, 7, 22, 2, K.dbrown) + e(48, 62, 12, 2.4, '#ffffff66', 18));
add('cheese', shadow(94, 42) + p('M6 66 L78 46 L78 86 L6 86Z', K.yellow) + p('M6 66 L78 46 L94 38 L22 58Z', '#ffe58f') + p('M78 46 L94 38 L94 78 L78 86Z', '#e8a800') +
  e(26, 76, 6, 5, '#e8b300') + e(50, 68, 7, 6, '#e8b300') + e(66, 78, 5.5, 5, '#e8b300') + e(40, 82, 3.4, 2.6, '#e8b300') + e(60, 57, 4, 3, '#e8b300') + e(86, 56, 3, 4, '#c98d00') + e(44, 51, 4, 1.8, '#f0c200', -18) + e(14, 78, 3.2, 3, '#e8b300'));
add('chick', shadow(94, 28) + s('M42 86 v8 M58 86 v8 M36 94 h12 M52 94 h12', K.orange, 3.2) +
  Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return c(+(50 + Math.cos(a) * 29).toFixed(1), +(56 + Math.sin(a) * 27 + 2).toFixed(1), 11, '#f0b429'); }).join('') +
  Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return c(+(50 + Math.cos(a) * 29).toFixed(1), +(56 + Math.sin(a) * 27).toFixed(1), 11, K.yellow); }).join('') + c(50, 56, 32, K.yellow) +
  p('M50 20 q-8 -10 -14 -8 q4 6 8 12z M50 20 q0 -12 6 -14 q2 8 -2 14z M50 20 q8 -8 14 -4 q-4 6 -10 8z', K.yellow) + e(24, 62, 7, 12, '#f5bf3a', 14) + e(76, 62, 7, 12, '#f5bf3a', -14) +
  eye(39, 50, 4) + eye(61, 50, 4) + p('M44 56 H56 L50 67Z', K.orange) + c(32, 60, 4.4, K.pink, 'opacity=".55"') + c(68, 60, 4.4, K.pink, 'opacity=".55"') + e(40, 38, 6, 3, '#ffffff77', -30));
add('chip', shadow(94, 28) + [[28, 16, -14, 9], [38, 8, -6, 9], [48, 14, 2, 9], [58, 4, 8, 9], [66, 18, 14, 9], [20, 30, -22, 8]].map(([x, y, rot, w]) => r(x!, y!, w!, 50, 3, '#ffd23f', rot) + r(x!, y!, 3, 50, 1.5, '#ffe98a', rot)).join('') +
  p('M20 52 L80 52 L72 94 L28 94Z', K.red) + p('M20 52 L80 52 L78 62 L22 62Z', K.dred) + p('M23 70 L77 70 L75 80 L25 80Z', K.white) + c(50, 75, 3.4, K.red) + c(38, 75, 2.4, K.red) + c(62, 75, 2.4, K.red) + r(24, 54, 5, 36, 2, '#ffffff44', 6));
add('thumb', shadow(94, 36) + r(6, 52, 18, 40, 5, K.blue) + r(6, 52, 18, 8, 3, '#3aa9bf') + r(22, 46, 66, 46, 18, '#f0a572') + r(22, 42, 66, 46, 18, K.skin) +
  [50, 61, 72].map((y) => r(44, y, 46, 12, 6, K.skin) + s(`M48 ${y + 12} H86`, '#e0a173', 2.2)).join('') + r(24, 8, 26, 56, 13, '#f0a572') + r(22, 6, 26, 56, 13, K.skin) + e(34, 20, 8, 7, '#ffe5d3') + e(30, 18, 3, 2.4, K.white, -20) + s('M28 56 q8 6 16 0', '#e0a173', 2.2));
add('thread', shadow(94, 38) + r(10, 8, 44, 10, 5, K.tan) + r(10, 80, 44, 10, 5, K.tan) + r(10, 14, 44, 3, 0, '#d0a868') + r(14, 18, 36, 62, 3, K.dred) + r(14, 18, 36, 62, 3, K.red) +
  [24, 31, 38, 45, 52, 59, 66, 73].map((y) => s(`M14 ${y} H50`, K.dred, 2.2)).join('') + r(16, 18, 6, 62, 2, '#ffffff44') + s('M50 56 C66 56 60 84 74 82 C86 80 74 60 84 44', K.red, 3.4) + s('M50 56 C66 56 60 84 74 82 C86 80 74 60 84 44', '#ff8fa8', 1.2) +
  s('M96 92 L80 24', K.grey, 3) + s('M96 92 L80 24', '#e8eef4', 1.2) + e(80, 28, 2.4, 6, K.ink, -14) + p('M96 92 L98 98 L94 98Z', K.dgrey));
add('thunder', shadow(94, 30) + [[30, 38, 16], [50, 28, 20], [72, 38, 16]].map(([x, y, rr]) => c(x!, y! + 3, rr!, '#454e63')).join('') + r(16, 40, 70, 20, 10, '#454e63') +
  [[30, 38, 16], [50, 28, 20], [72, 38, 16]].map(([x, y, rr]) => c(x!, y!, rr!, '#5f6a82')).join('') + r(16, 38, 70, 20, 10, '#5f6a82') + s('M26 30 q6 -10 18 -12', K.white, 3.4, 'opacity=".25"') +
  p('M58 50 L36 78 L50 78 L42 98 L72 66 L56 66 L68 50Z', K.dyellow) + p('M58 52 L38 76 L52 76 L46 92 L68 66 L54 66 L64 52Z', K.yellow) +
  [[18, 70], [84, 66], [16, 90], [86, 88]].map(([x, y]) => p(`M${x} ${y! - 8} q-6 9 0 12 q6 -3 0 -12Z`, K.blue)).join(''));
add('moth', shadow(94, 28) + [0, 1].map((m) => { const an = s('M46 24 Q36 8 24 6', '#6b5b4b', 1.8) + [[42, 18, -1], [38, 13, -1], [33, 9.5, -1], [28, 7.2, -1]].map(([x, y]) => s(`M${x} ${y} l-3.4 -4.4 M${x} ${y} l1.6 4.4`, '#6b5b4b', 1.3)).join(''); return m ? mirror(an) : an; }).join('') +
  [0, 1].map((m) => { const w = p('M46 40 Q22 16 6 32 Q0 56 40 64Z', '#b5a58f') + p('M44 58 Q22 60 20 82 Q36 92 48 74Z', '#9c8a74') + p('M46 40 Q22 16 6 32 Q4 40 8 46 Q30 38 46 40Z', '#a39380') + c(22, 44, 7, '#8c7a63') + c(22, 44, 3.6, '#e8d9b8') + s('M10 54 Q26 56 40 52', '#8c7a63', 2.4) + c(30, 74, 4, '#8c7a63'); return m ? mirror(w) : w; }).join('') +
  e(50, 58, 12, 24, '#8d7b66') + e(50, 56, 9, 20, '#a38f7c') + [[44, 48], [56, 48], [44, 60], [56, 60], [50, 72]].map(([x, y]) => c(x!, y!, 4, '#a38f7c')).join('') + c(50, 30, 10, '#8d7b66') + eye(46, 29, 3) + eye(54, 29, 3));
add('king', shadow(94, 34) + p('M12 96 Q12 66 50 66 Q88 66 88 96Z', K.red) + p('M24 70 Q50 86 76 70 L82 80 Q50 100 18 80Z', K.white) + [34, 50, 66].map((x) => c(x, 84, 2.4, K.ink)).join('') + p('M50 72 V96', 'none', `stroke="${K.dred}" stroke-width="3"`) +
  p('M22 40 Q16 74 50 84 Q84 74 78 40 Q66 62 50 62 Q34 62 22 40Z', '#e9e4d8') + c(50, 44, 22, K.skin) + c(32, 40, 5, '#e9e4d8') + c(68, 40, 5, '#e9e4d8') + e(41, 54, 9, 4.4, K.white, -14) + e(59, 54, 9, 4.4, K.white, 14) +
  eye(42, 44, 3.4) + eye(58, 44, 3.4) + c(50, 50, 3.6, '#f0a572') + s('M45 62 q5 4 10 0', K.dred, 2.4) + c(34, 54, 3.6, K.pink, 'opacity=".5"') + c(66, 54, 3.6, K.pink, 'opacity=".5"') +
  p('M27 28 L25 6 L38 16 L50 2 L62 16 L75 6 L73 28Z', K.yellow) + r(26, 22, 48, 9, 3, K.dyellow) + c(25, 6, 3.4, K.red) + c(50, 2, 3.4, K.blue) + c(75, 6, 3.4, K.red) + c(38, 26.5, 2.4, K.red) + c(50, 26.5, 2.4, K.blue) + c(62, 26.5, 2.4, K.red) + r(30, 8, 4, 12, 2, '#ffffff66', 10));
add('gong', shadow(95, 40) + r(4, 90, 26, 6, 3, K.dbrown) + r(70, 90, 26, 6, 3, K.dbrown) + r(10, 8, 9, 84, 3, K.brown) + r(81, 8, 9, 84, 3, K.brown) + r(6, 4, 88, 11, 5, K.dbrown) + r(6, 4, 88, 4, 2, '#d9a066') +
  s('M42 15 L43 28 M58 15 L57 28', K.dbrown, 2.4) + c(50, 50, 28, '#d99a1a') + c(50, 50, 25, K.yellow) + c(50, 50, 19, '#f2c04a') + c(50, 50, 19, 'none', 'stroke="#d99a1a" stroke-width="2.4"') + c(50, 50, 8, '#d99a1a') + c(50, 50, 5.4, '#f6d27a') + s('M31 36 q6 -10 15 -11', K.white, 4, 'opacity=".6"') +
  r(40, 82, 30, 5, 2.5, K.dbrown) + c(36, 84.5, 6.4, K.red) + c(34, 82.5, 2, '#ffffff88'));

// ===== VOWEL-TEAM WORDS (ai ee oa oo) ==============================================================================
const drop = (x: number, y: number, rot: number, f: Col = K.blue, sc = 1): string =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"><path d="M0 -9 C-1 -6 -6 0 -6 4 A6 6 0 0 0 6 4 C6 0 1 -6 0 -9Z" fill="${f}"/><path d="M-2.4 3 q0 -3 2 -5" fill="none" stroke="#ffffffaa" stroke-width="1.6" stroke-linecap="round"/></g>`;

add('rain', [[28, 40, 17], [50, 30, 21], [73, 40, 17]].map(([x, y, rr]) => c(x!, y! + 3, rr!, '#7d93ae')).join('') + r(12, 42, 78, 20, 10, '#7d93ae') +
  [[28, 40, 17], [50, 30, 21], [73, 40, 17]].map(([x, y, rr]) => c(x!, y!, rr!, '#a9bdd6')).join('') + r(12, 40, 78, 20, 10, '#a9bdd6') + s('M24 30 q6 -10 18 -12', K.white, 3.4, 'opacity=".4"') +
  [[20, 70], [44, 70], [68, 70], [90, 70], [32, 81], [56, 81], [80, 81], [20, 92], [44, 92], [68, 92], [90, 92]].map(([x, y], i) => drop(x!, y!, 18, i % 2 ? K.blue : '#3aa9d4', 1.05)).join(''));

add('snail', shadow(95, 38) + p('M6 90 Q2 78 8 70 Q10 54 16 50 Q24 50 22 62 Q26 74 36 76 L84 76 Q98 78 98 86 Q96 92 86 92 L12 92Z', '#d9a85c') +
  p('M6 87 Q2 76 8 68 Q10 54 16 50 Q24 50 22 62 Q26 74 36 76 L84 76 Q98 78 98 86 Q96 89 86 89 L12 89Z', '#f2c57a') +
  s('M12 52 L10 32 M22 50 L26 30', '#d9a85c', 4) + c(10, 28, 6.5, K.white) + c(27, 26, 6.5, K.white) + c(11, 29, 3.4, K.ink) + c(28, 27, 3.4, K.ink) + c(12, 27.6, 1.2, K.white) + c(29, 25.6, 1.2, K.white) +
  s('M10 70 q5 5 10 0', K.dorange, 2.4) + c(8, 62, 3, K.pink, 'opacity=".55"') +
  c(60, 52, 30, '#c0562f') + c(60, 50, 30, '#ff8f5e') + s('M60 50 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0 a12 12 0 0 1 -24 0 a15 15 0 0 1 30 0', '#ffe1c8', 3.6) + s('M42 36 q6 -10 16 -12', K.white, 3.4, 'opacity=".55"'));

add('sail', shadow(94, 32) + p('M50 6 L50 66 L14 66Z', K.white) + p('M50 6 L50 66 L34 66Z', '#dfe8f0') + p('M54 22 L54 66 L86 66Z', K.red) + p('M54 22 L54 66 L68 66Z', K.dred) + r(48, 4, 5, 66, 2, K.dbrown) +
  p('M50 4 L64 9 L50 14Z', K.yellow) + p('M6 66 H94 L82 86 H18Z', K.dblue) + p('M6 66 H94 L90 72 H10Z', K.white) + p('M8 74 H92 L82 86 H18Z', K.blue) + waves(82, '#7fd5e8') + waves(90, K.blue));

add('tree', shadow(94, 34) + p('M44 94 Q46 70 44 52 H58 Q56 70 60 94Z', K.dbrown) + p('M48 94 Q50 70 48 52 H54 Q52 70 54 94Z', K.brown) + s('M50 70 q-12 -10 -16 -18 M52 64 q10 -6 14 -14', K.brown, 4) +
  c(30, 44, 22, K.dgreen) + c(70, 44, 22, K.dgreen) + c(50, 24, 26, K.dgreen) + c(50, 50, 24, K.dgreen) + c(30, 42, 21, K.green) + c(70, 42, 21, K.green) + c(50, 22, 25, K.green) + c(50, 48, 23, K.green) +
  c(38, 22, 9, '#ffffff44') + c(24, 38, 5, '#ffffff33') + c(62, 56, 6, '#3f9e5a', 'opacity=".5"') + c(40, 60, 5, '#3f9e5a', 'opacity=".5"'));

const oneFoot = (tx: number, flip: boolean): string => `<g transform="translate(${tx} 64)${flip ? ' scale(-1 1)' : ''} rotate(-5)">` +
  p('M-19 -14 Q-20 -2 -14 8 Q-12 18 -12 26 Q-12 36 0 36 Q12 36 12 26 Q12 14 17 4 Q20 -6 18 -16Z', K.dskin) +
  p('M-19 -16 Q-20 -4 -14 6 Q-12 16 -12 24 Q-12 33 -1 33 Q10 33 10 24 Q10 12 16 2 Q20 -8 18 -18Z', K.skin) +
  c(9, -27, 8, K.dskin) + c(-3, -33, 5.6, K.dskin) + c(-12, -29, 4.8, K.dskin) + c(-19, -22, 4.2, K.dskin) + c(-22, -13, 3.6, K.dskin) +
  c(9, -29, 8, K.skin) + c(-3, -35, 5.6, K.skin) + c(-12, -31, 4.8, K.skin) + c(-19, -24, 4.2, K.skin) + c(-22, -15, 3.6, K.skin) +
  e(9, -32, 3.6, 2.4, '#ffe5d3') + e(-3, -37, 2.6, 1.7, '#ffe5d3') + e(-12, -33, 2.3, 1.6, '#ffe5d3') + e(-19, -26, 2, 1.4, '#ffe5d3') +
  s('M-9 6 q-4 10 0 22', '#ffffff66', 4) + `</g>`;
add('feet', e(50, 96, 40, 4.5, '#0000001c') + oneFoot(28, false) + oneFoot(72, true));

add('boat', shadow(96, 40) + '<g transform="translate(0 -8)">' + p('M4 46 H78 Q92 44 98 34 Q96 70 70 80 H30 Q8 76 4 46Z', K.dred) + p('M8 60 H94 Q88 74 70 78 H30 Q14 74 8 60Z', K.red) + p('M4 46 H78 Q92 44 98 34 Q96 52 92 60 H6Z', K.white) + p('M4 46 H78 Q92 44 98 34 L96 40 Q86 52 74 52 H4Z', '#b9c8d8') +
  r(30, 34, 26, 7, 3, K.dbrown) + r(32, 37, 22, 3, 1.5, K.brown) + c(24, 55, 6.5, K.red) + c(24, 55, 6.5, 'none', 'stroke="#fff" stroke-width="3"') + c(24, 55, 3, '#dfe8f0') + p('M12 50 H64', 'none', 'stroke="#ffffff88" stroke-width="2"') + '</g>' +
  waves(82, K.blue) + waves(90, '#7fd5e8') + waves(98, K.blue));

add('coat', shadow(95, 36) + p('M30 22 Q50 -2 70 22 Q72 36 50 40 Q28 36 30 22Z', K.dorange) + p('M34 22 Q50 6 66 22 Q66 32 50 34 Q34 32 34 22Z', '#ffe0b0') +
  p('M30 22 Q50 36 70 22 L84 28 L94 76 L78 82 L74 54 V92 H26 V54 L22 82 L6 76 L16 28Z', K.dorange) + p('M32 26 Q50 38 68 26 L82 30 L92 74 L80 78 L76 52 V90 H24 V52 L20 78 L8 74 L18 30Z', K.orange) +
  p('M6 76 L22 82 L21 90 L4 84Z M94 76 L78 82 L79 90 L96 84Z', K.cream) + r(48, 38, 4, 54, 1, K.dorange) + [48, 60, 72, 83].map((y) => c(58, y, 3.6, K.white) + c(58, y, 1.2, K.dorange)).join('') +
  r(30, 62, 14, 14, 3, K.dorange) + r(30, 62, 14, 4, 2, '#ffb26b') + p('M32 26 Q40 40 50 40 Q42 30 38 24Z M68 26 Q60 40 50 40 Q58 30 62 24Z', '#ffe0b0') + s('M30 40 q-4 12 -6 24', '#ffffff66', 4));

const slice = 'M20 90 V50 Q4 46 4 30 Q4 8 28 8 Q40 8 50 12 Q60 8 72 8 Q96 8 96 30 Q96 46 80 50 V90Z';
add('toast', shadow(95, 34) + p(slice, '#b06a2c', 'transform="translate(2 4)"') + p(slice, '#c98a3c') +
  `<g transform="translate(50 52) scale(.84) translate(-50 -52)">${p(slice, '#e9a850')}</g>` + `<g transform="translate(50 54) scale(.7) translate(-50 -54)">${p(slice, '#f6c577')}</g>` +
  s('M30 40 q-4 14 0 30 M62 26 q4 14 0 28 M50 62 q4 8 0 18', '#d28a3a', 3, 'opacity=".55"') + c(36, 28, 1.6, '#c98a3c') + c(68, 68, 1.6, '#c98a3c') + c(44, 78, 1.6, '#c98a3c') + s('M14 24 q2 -8 10 -10', K.white, 3.4, 'opacity=".5"') +
  r(40, 36, 26, 22, 5, '#ffe9a0', -8) + r(40, 36, 26, 8, 4, '#fff6c8', -8) + r(40, 50, 26, 8, 4, '#f0cc5a', -8));

add('spoon', e(50, 95, 30, 4, '#0000001c') + `<g transform="rotate(40 50 52)">` + p('M50 2 C66 2 70 22 64 36 Q60 44 54 48 L55 88 Q55 96 50 96 Q45 96 45 88 L46 48 Q40 44 36 36 C30 22 34 2 50 2Z', K.dgrey) +
  p('M50 2 C65 2 68 22 62 35 Q58 42 52 46 L53 88 Q53 94 50 94 Q47 94 47 88 L48 46 Q42 42 38 35 C32 22 35 2 50 2Z', '#d5dde5') + e(50, 21, 10, 16, '#b9c3cf') + e(50, 25, 8, 12, '#e6ebf1') + e(44, 14, 2.4, 6, K.white, 8) + r(50, 56, 3, 32, 1.5, K.white, 0) + `</g>`);

add('boot', shadow(95, 38) + p('M30 28 Q30 10 42 10 Q54 10 54 28' , 'none', `stroke="${K.dred}" stroke-width="6" stroke-linecap="round" transform="translate(-8 -3)"`) + p('M26 18 H58 V58 Q58 64 70 66 Q96 68 96 82 V90 H18 V70 Q22 66 26 60Z', K.dred) +
  p('M26 16 H58 V56 Q58 62 70 64 Q94 66 94 78 V84 H22 V70 Q26 64 26 56Z', K.red) + r(24, 14, 36, 9, 4, K.dred) + r(24, 14, 36, 4, 2, '#ff8fa3') + r(14, 82, 84, 12, 6, K.cream) + r(14, 88, 84, 6, 3, '#e0cfa8') + s('M32 28 V60', K.white, 4, 'opacity=".45"') + s('M72 70 q12 2 18 8', K.white, 3, 'opacity=".4"'));

// Redrawn cards replace the earlier drawings of the same word (they run last on purpose).
installRedrawA();
installRedrawB();
installSet8();
installSet10();
installSet11();

export const hasPicture = (word: string): boolean => word in PICTURES;
import { h } from './dom';

/** A picture card image as an element: the drawing, or the word's emoji only if no drawing exists. */
export const pictureEl = (word: string, fallbackEmoji = '❔', cls = ''): HTMLElement => {
  const el = h('span', { class: `pic-wrap ${cls}`, 'aria-hidden': 'true' });
  const svg = pictureSVG(word);
  if (svg) el.innerHTML = svg;
  else el.textContent = fallbackEmoji;
  return el;
};

/** The picture as an element (falls back to the word's emoji only if no drawing exists). */
export const pictureSVG = (word: string): string =>
  PICTURES[word] ? `<svg class="pic-art" viewBox="-6 -4 112 108" role="img" aria-hidden="true" focusable="false">${PICTURES[word]}</svg>` : '';
