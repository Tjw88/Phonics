import { cheeks, eyes, face, smile } from './friendKit';
import { FRIENDS_SET8 } from './friends_set8';
import { FRIENDS_SET10 } from './friends_set10';
import { FRIENDS_SET11 } from './friends_set11';
// The sound-friends: one original character per sound (spec: original mnemonics, must not copy any programme's
// artwork; each character's shape or action evokes its letter). Hand-drawn inline SVG, same style as the companion:
// big eyes, soft round shapes, nothing scary. viewBox is 0 0 120 120 for all of them.

const BODY: Record<string, string> = {
  // s: Sid the snake, bent like the letter
  s: `<path d="M84 28 C44 14 30 46 58 56 C86 66 78 96 36 104" fill="none" stroke="#3c9a4b" stroke-width="28" stroke-linecap="round"/>
      <path d="M84 28 C44 14 30 46 58 56 C86 66 78 96 36 104" fill="none" stroke="#6fd37e" stroke-width="20" stroke-linecap="round"/>
      <path d="M62 60 q8 6 14 14 M44 40 q-6 -6 -12 -4" stroke="#3c9a4b" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
      <circle cx="88" cy="26" r="17" fill="#6fd37e"/><path d="M99 33 l13 3 M105 35 l7 -5 M105 35 l7 7" stroke="#ef476f" stroke-width="3" stroke-linecap="round" fill="none"/>${eyes(82, 94, 22, 5.5)}${smile(88, 32, 6)}`,
  // a: Annie the ant
  a: `<g stroke="#6b2d1d" stroke-width="4" stroke-linecap="round" fill="none"><path d="M54 84 l-10 22 M62 86 l0 24 M70 84 l12 22 M82 90 l-4 20 M88 88 l14 16 M38 80 l-14 14"/><path d="M28 56 q-8 -16 -18 -14 M36 54 q-2 -18 -12 -22"/></g>
     <circle cx="88" cy="74" r="22" fill="#d9644a"/><circle cx="60" cy="74" r="14" fill="#c4553b"/><circle cx="38" cy="66" r="19" fill="#d9644a"/>${face(38, 64, 0.95)}
     <circle cx="82" cy="68" r="5" fill="#fff" opacity=".35"/>`,
  // t: Tessa the tap (a T shape) with a drip
  t: `<rect x="50" y="10" width="20" height="26" rx="6" fill="#ef476f"/><rect x="30" y="8" width="60" height="12" rx="6" fill="#ef476f"/>
     <rect x="44" y="30" width="32" height="22" fill="#8fb3d9"/><rect x="14" y="48" width="76" height="30" rx="15" fill="#8fb3d9"/><rect x="14" y="48" width="76" height="9" rx="4" fill="#fff" opacity=".35"/>
     <rect x="68" y="72" width="22" height="16" rx="5" fill="#6f95c0"/><path d="M79 94 q-9 14 0 20 q9 -6 0 -20z" fill="#4cc3d9"/>${face(48, 63, 0.8)}`,
  // p: Pip the penguin
  p: `<ellipse cx="34" cy="64" rx="9" ry="22" fill="#26364f" transform="rotate(14 34 64)"/><ellipse cx="86" cy="64" rx="9" ry="22" fill="#26364f" transform="rotate(-14 86 64)"/>
     <ellipse cx="60" cy="72" rx="30" ry="38" fill="#26364f"/><ellipse cx="60" cy="80" rx="20" ry="28" fill="#fff"/>
     <ellipse cx="46" cy="112" rx="12" ry="6" fill="#ff9f1c"/><ellipse cx="74" cy="112" rx="12" ry="6" fill="#ff9f1c"/>
     <circle cx="60" cy="36" r="24" fill="#26364f"/><ellipse cx="60" cy="42" rx="16" ry="14" fill="#fff"/>${eyes(51, 69, 34, 5.5)}<path d="M52 44 L68 44 L60 54Z" fill="#ff9f1c"/>${cheeks(44, 76, 44, 4)}`,
  // i: Iggy the inchworm; the head is the dot of the i
  i: `<circle cx="60" cy="104" r="13" fill="#5cc26b"/><circle cx="60" cy="86" r="14" fill="#8ee27a"/><circle cx="60" cy="68" r="14" fill="#5cc26b"/><circle cx="60" cy="50" r="14" fill="#8ee27a"/>
     <circle cx="60" cy="26" r="19" fill="#8ee27a"/><path d="M50 10 q-6 -10 -14 -8 M70 10 q6 -10 14 -8" stroke="#3c9a4b" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="36" cy="2" r="3.5" fill="#ef476f"/><circle cx="84" cy="2" r="3.5" fill="#ef476f"/>${face(60, 24, 0.95)}`,
  // n: Nutmeg the nut
  n: `<ellipse cx="60" cy="68" rx="36" ry="40" fill="#d19a5f"/><path d="M60 30 q-10 40 0 76" stroke="#a9763d" stroke-width="3" fill="none" opacity=".6"/>
     <path d="M24 56 Q24 18 60 18 Q96 18 96 56Z" fill="#9a6633"/><path d="M34 40 q10 -14 26 -14" stroke="#fff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>${face(60, 72, 1.05)}`,
  // m: Mabel the mouse
  m: `<path d="M92 96 q22 4 18 -22 q-2 -10 -10 -10" stroke="#e8a0b4" stroke-width="5" fill="none" stroke-linecap="round"/>
     <ellipse cx="60" cy="88" rx="30" ry="26" fill="#bfc0d3"/><circle cx="34" cy="36" r="18" fill="#bfc0d3"/><circle cx="86" cy="36" r="18" fill="#bfc0d3"/><circle cx="34" cy="36" r="10" fill="#ffb3c6"/><circle cx="86" cy="36" r="10" fill="#ffb3c6"/>
     <circle cx="60" cy="58" r="28" fill="#d3d4e6"/>${eyes(48, 72, 54, 6.5)}<ellipse cx="60" cy="66" rx="5" ry="4" fill="#ff7aa2"/><path d="M60 70 l0 4 M60 74 q-6 6 -10 2 M60 74 q6 6 10 2" stroke="#3b2030" stroke-width="2.5" fill="none" stroke-linecap="round"/>
     <path d="M30 64 l-14 -4 M30 70 l-14 4 M90 64 l14 -4 M90 70 l14 4" stroke="#8c8ea6" stroke-width="2" stroke-linecap="round"/>${cheeks(40, 80, 66, 4)}`,
  // d: Dot the dino, with a drum
  d: `<path d="M20 92 Q2 98 8 74 Q20 86 34 80Z" fill="#f2b705"/>
     <ellipse cx="50" cy="86" rx="38" ry="28" fill="#ffd166"/><ellipse cx="48" cy="96" rx="24" ry="16" fill="#fff0c2"/>
     <path d="M26 66 l8 -16 l8 14z M42 60 l8 -18 l8 16z M58 62 l8 -16 l8 14z" fill="#ff9f43"/>
     <ellipse cx="34" cy="112" rx="12" ry="6" fill="#f2b705"/><ellipse cx="62" cy="112" rx="12" ry="6" fill="#f2b705"/>
     <circle cx="84" cy="48" r="25" fill="#ffd166"/>${face(86, 46, 0.95)}<ellipse cx="94" cy="58" rx="2" ry="2.6" fill="#d98a00" opacity=".6"/>
     <ellipse cx="96" cy="100" rx="20" ry="7" fill="#fff5e0"/><rect x="76" y="100" width="40" height="14" fill="#ef476f"/><ellipse cx="96" cy="114" rx="20" ry="7" fill="#d6335b"/><ellipse cx="96" cy="100" rx="20" ry="7" fill="none" stroke="#d6335b" stroke-width="3"/>
     <path d="M70 84 L88 98 M104 80 L98 98" stroke="#a46a2c" stroke-width="3.5" stroke-linecap="round"/><circle cx="70" cy="83" r="3.5" fill="#a46a2c"/><circle cx="105" cy="79" r="3.5" fill="#a46a2c"/>`,
  // g: Gus the goat
  g: `<path d="M44 38 C26 34 22 12 38 0 C34 14 44 22 58 30Z" fill="#d9a65a"/><path d="M76 38 C94 34 98 12 82 0 C86 14 76 22 62 30Z" fill="#d9a65a"/><path d="M44 38 C26 34 22 12 38 0 C30 16 38 28 50 33Z" fill="#b07a35"/><path d="M76 38 C94 34 98 12 82 0 C90 16 82 28 70 33Z" fill="#b07a35"/><path d="M33 22 q6 0 9 4 M31 12 q6 -1 9 3 M87 22 q-6 0 -9 4 M89 12 q-6 -1 -9 3" stroke="#8a5a22" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>
     <ellipse cx="60" cy="106" rx="26" ry="14" fill="#f7f2ea"/><g fill="#5b4636"><path d="M42 110 h12 v9 q0 3 -3 3 h-6 q-3 0 -3 -3z"/><path d="M66 110 h12 v9 q0 3 -3 3 h-6 q-3 0 -3 -3z"/></g><path d="M48 114 v7 M72 114 v7" stroke="#f7f2ea" stroke-width="1.6"/>
     <path d="M26 52 q-18 -6 -22 8 q-2 14 12 18 q8 0 12 -10z" fill="#c9a97c"/><path d="M94 52 q18 -6 22 8 q2 14 -12 18 q-8 0 -12 -10z" fill="#c9a97c"/><path d="M24 58 q-12 -2 -13 6 q0 8 8 10z M96 58 q12 -2 13 6 q0 8 -8 10z" fill="#f0b9a8"/>
     <path d="M54 90 Q54 106 56 112 Q58 106 60 116 Q62 106 64 112 Q66 106 66 90Z" fill="#c9a97c"/>
     <path d="M32 54 Q30 28 60 28 Q90 28 88 54 Q88 74 76 86 Q72 94 60 94 Q48 94 44 86 Q32 74 32 54Z" fill="#f7f2ea"/><path d="M52 32 q8 -4 16 0 q-2 8 -8 10 q-6 -2 -8 -10z" fill="#c9a97c"/>
     <ellipse cx="60" cy="78" rx="15" ry="11" fill="#fff"/><ellipse cx="60" cy="72" rx="7.5" ry="5" fill="#9a6b5a"/><circle cx="57" cy="72" r="1.5" fill="#3b2030"/><circle cx="63" cy="72" r="1.5" fill="#3b2030"/>
     ${eyes(48, 72, 52, 6.5)}${smile(60, 81, 6)}${cheeks(40, 80, 66, 4)}`,
  // o: Ollie the octopus
  o: `<g stroke="#9a5fc9" stroke-width="12" stroke-linecap="round" fill="none"><path d="M34 74 q-14 16 -4 32 M48 80 q-6 18 6 30 M72 80 q6 18 -6 30 M86 74 q14 16 4 32"/></g>
     <circle cx="60" cy="52" r="36" fill="#b07ad9"/><circle cx="42" cy="34" r="6" fill="#fff" opacity=".3"/>${eyes(46, 74, 46, 8)}<ellipse cx="60" cy="68" rx="8" ry="10" fill="#6b2437"/>${cheeks(34, 86, 60, 5)}`,
  // c: Cora the cat, tail curled like a c
  c: `<path d="M92 98 C114 98 114 66 94 66" fill="none" stroke="#f4a259" stroke-width="11" stroke-linecap="round"/>
     <path d="M30 40 L34 8 L56 28Z M90 40 L86 8 L64 28Z" fill="#f4a259"/><path d="M36 30 L38 16 L48 26Z M84 30 L82 16 L72 26Z" fill="#ffb3c6"/>
     <ellipse cx="58" cy="94" rx="30" ry="22" fill="#f4a259"/><circle cx="60" cy="56" r="32" fill="#f7b072"/><path d="M60 26 v10 M48 28 l3 9 M72 28 l-3 9" stroke="#d97f2d" stroke-width="3.5" stroke-linecap="round"/>
     ${eyes(47, 73, 52, 7)}<path d="M55 63 h10 l-5 6z" fill="#ff7aa2"/><path d="M60 69 q-6 7 -12 3 M60 69 q6 7 12 3" stroke="#3b2030" stroke-width="2.5" fill="none" stroke-linecap="round"/>
     <path d="M34 62 l-18 -4 M34 68 l-18 4 M86 62 l18 -4 M86 68 l18 4" stroke="#b86a22" stroke-width="2" stroke-linecap="round"/>${cheeks(38, 82, 66, 4)}`,
  // k: Kit the kite
  k: `<path d="M60 96 q-14 10 0 18 q14 8 0 16" stroke="#8d5a2b" stroke-width="2.5" fill="none" transform="translate(0 -14)"/>
     <path d="M52 104 l-10 -8 l-2 12z M68 112 l10 -8 l2 12z" fill="#4cc3d9" transform="translate(0 -4)"/>
     <path d="M60 6 L96 50 L60 94 L24 50Z" fill="#ef476f"/><path d="M60 6 L96 50 L60 50Z" fill="#ffd166"/><path d="M60 94 L24 50 L60 50Z" fill="#ffd166"/><path d="M60 6 V94 M24 50 H96" stroke="#fff" stroke-width="2.5" opacity=".7"/>
     ${face(60, 50, 0.85)}`,
  // ck: Rocky the rock
  ck: `<path d="M14 100 Q10 60 36 42 Q56 26 84 40 Q112 58 106 100Z" fill="#9aa8b6"/><path d="M26 92 Q22 66 40 54" stroke="#fff" stroke-width="5" fill="none" opacity=".35" stroke-linecap="round"/>
      <path d="M52 40 q-4 -14 6 -18 q2 8 8 4 q6 6 -2 14z" fill="#6fd37e"/>${face(60, 70, 1.05)}<path d="M82 88 l10 4 M30 100 l10 -2" stroke="#7d8a98" stroke-width="3" stroke-linecap="round"/>`,
  // e: Ed the egg
  e: `<ellipse cx="46" cy="112" rx="10" ry="5" fill="#ff9f1c"/><ellipse cx="74" cy="112" rx="10" ry="5" fill="#ff9f1c"/>
     <path d="M60 8 C92 8 104 62 104 78 C104 102 84 112 60 112 C36 112 16 102 16 78 C16 62 28 8 60 8Z" fill="#fff3d6" stroke="#e0c48a" stroke-width="4"/>
     <path d="M24 48 l10 -8 l10 10 l10 -10 l10 10 l10 -10 l10 10 l10 -10 l8 8" fill="none" stroke="#e0c48a" stroke-width="3" stroke-linejoin="round" opacity=".9"/>${face(60, 74, 1.05)}`,
  // u: Uma the umbrella
  u: `<path d="M60 52 V96 q0 12 -12 12 q-10 0 -10 -10" fill="none" stroke="#6a5bc0" stroke-width="6" stroke-linecap="round"/>
     <path d="M8 56 Q8 8 60 8 Q112 8 112 56 Q100 46 90 56 Q80 46 70 56 Q60 46 50 56 Q40 46 30 56 Q20 46 8 56Z" fill="#9b8bf0"/>
     <path d="M60 8 Q40 24 50 56 M60 8 Q80 24 70 56" fill="none" stroke="#7a69d6" stroke-width="3"/><path d="M20 30 q10 -14 26 -18" stroke="#fff" stroke-width="3.5" fill="none" opacity=".45" stroke-linecap="round"/>${face(60, 36, 0.95)}`,
  // r: Rosie the rabbit
  r: `<ellipse cx="42" cy="28" rx="11" ry="26" fill="#fff" stroke="#e6e0ee" stroke-width="2" transform="rotate(-8 42 28)"/><ellipse cx="78" cy="28" rx="11" ry="26" fill="#fff" stroke="#e6e0ee" stroke-width="2" transform="rotate(8 78 28)"/>
     <ellipse cx="42" cy="30" rx="5.5" ry="18" fill="#ffb3c6" transform="rotate(-8 42 30)"/><ellipse cx="78" cy="30" rx="5.5" ry="18" fill="#ffb3c6" transform="rotate(8 78 30)"/>
     <ellipse cx="60" cy="102" rx="26" ry="16" fill="#fff" stroke="#e6e0ee" stroke-width="2"/><circle cx="92" cy="104" r="8" fill="#fff" stroke="#e6e0ee" stroke-width="2"/>
     <circle cx="60" cy="66" r="28" fill="#fff" stroke="#e6e0ee" stroke-width="2"/>${eyes(49, 71, 62, 6.5)}<path d="M55 71 h10 l-5 5z" fill="#ff7aa2"/><rect x="56" y="78" width="4" height="7" rx="1.5" fill="#fff" stroke="#d8d0e4" stroke-width="1.2"/><rect x="60.5" y="78" width="4" height="7" rx="1.5" fill="#fff" stroke="#d8d0e4" stroke-width="1.2"/>${cheeks(40, 80, 74, 4.5)}`,
  // h: Hattie the hen
  h: `<path d="M20 70 q-14 -8 -10 -26 q12 6 20 22z" fill="#c98f4a"/><ellipse cx="58" cy="78" rx="38" ry="32" fill="#ffd98a"/><path d="M46 72 q20 -10 40 4 q-6 22 -26 24 q-18 -6 -14 -28z" fill="#f0b95a"/>
     <circle cx="82" cy="46" r="22" fill="#ffd98a"/><circle cx="76" cy="24" r="7" fill="#ef476f"/><circle cx="86" cy="22" r="8" fill="#ef476f"/><circle cx="94" cy="28" r="6" fill="#ef476f"/>
     <path d="M100 46 l14 6 l-14 6z" fill="#ff9f1c"/><ellipse cx="98" cy="66" rx="5" ry="8" fill="#ef476f"/>${eyes(76, 90, 42, 5.5)}${cheeks(70, 92, 54, 3.5)}
     <path d="M50 110 v8 M66 110 v8 M44 118 h12 M60 118 h12" stroke="#ff9f1c" stroke-width="3.5" stroke-linecap="round"/>`,
  // b: Bo the bug (ladybird)
  b: `<path d="M44 20 q-10 -14 -18 -10 M76 20 q10 -14 18 -10" stroke="#26303f" stroke-width="3.5" fill="none" stroke-linecap="round"/>
     <circle cx="60" cy="70" r="40" fill="#ef476f"/><path d="M60 30 V110" stroke="#26303f" stroke-width="4"/><circle cx="40" cy="62" r="8" fill="#26303f"/><circle cx="82" cy="58" r="7" fill="#26303f"/><circle cx="76" cy="90" r="8" fill="#26303f"/><circle cx="42" cy="92" r="6" fill="#26303f"/>
     <path d="M26 44 Q60 -2 94 44 Q60 34 26 44Z" fill="#26303f"/>${eyes(48, 72, 32, 6)}<circle cx="30" cy="76" r="6" fill="#fff" opacity=".3"/>${smile(60, 40, 7)}`,
  // f: Fenn the fox
  f: `<path d="M92 104 q26 -6 20 -34 q-18 8 -26 26z" fill="#f08a3c"/><path d="M104 74 q8 -4 8 -4 q4 14 -4 24z" fill="#fff"/>
     <path d="M26 54 L30 14 L56 34Z M94 54 L90 14 L64 34Z" fill="#f08a3c"/><path d="M32 38 L34 24 L46 34Z M88 38 L86 24 L74 34Z" fill="#26303f"/>
     <ellipse cx="60" cy="100" rx="26" ry="16" fill="#f08a3c"/><path d="M28 62 Q30 36 60 36 Q90 36 92 62 Q92 94 60 96 Q28 94 28 62Z" fill="#f4a152"/>
     <path d="M30 66 Q50 64 60 84 Q70 64 90 66 Q84 96 60 98 Q36 96 30 66Z" fill="#fff"/>${eyes(47, 73, 58, 6.5)}<ellipse cx="60" cy="76" rx="6" ry="4.5" fill="#26303f"/>${cheeks(38, 82, 70, 4)}`,
  // ff: Fluffy the cloud
  ff: `<g fill="#fff" stroke="#bcd7ee" stroke-width="3"><circle cx="34" cy="70" r="22"/><circle cx="60" cy="52" r="28"/><circle cx="88" cy="68" r="24"/><rect x="24" y="68" width="74" height="24" rx="12"/></g>
      <g fill="#fff"><circle cx="34" cy="70" r="20"/><circle cx="60" cy="52" r="26"/><circle cx="88" cy="68" r="22"/><rect x="26" y="70" width="70" height="20" rx="10"/></g>
      <path d="M96 100 q6 8 0 14 M24 100 q-6 8 0 14 M60 100 v14" stroke="#8fd0f0" stroke-width="3.5" stroke-linecap="round" fill="none"/>${face(60, 70, 1.05)}`,
  // l: Lulu the lamb
  l: `<ellipse cx="30" cy="72" rx="13" ry="8" fill="#4a4458" transform="rotate(30 30 72)"/><ellipse cx="90" cy="72" rx="13" ry="8" fill="#4a4458" transform="rotate(-30 90 72)"/>
     <g fill="#fff" stroke="#e4e0f0" stroke-width="2"><circle cx="34" cy="50" r="17"/><circle cx="52" cy="34" r="17"/><circle cx="72" cy="34" r="17"/><circle cx="88" cy="50" r="17"/><circle cx="32" cy="76" r="16"/><circle cx="90" cy="76" r="16"/><circle cx="60" cy="90" r="18"/></g>
     <g fill="#fff"><circle cx="34" cy="50" r="16"/><circle cx="52" cy="34" r="16"/><circle cx="72" cy="34" r="16"/><circle cx="88" cy="50" r="16"/><circle cx="32" cy="76" r="15"/><circle cx="90" cy="76" r="15"/><circle cx="60" cy="90" r="17"/></g>
     <ellipse cx="60" cy="64" rx="22" ry="25" fill="#4a4458"/>${eyes(51, 69, 58, 6)}<ellipse cx="60" cy="72" rx="4" ry="3" fill="#ff9fb4"/>${smile(60, 74, 5)}<path d="M44 108 v8 M76 108 v8" stroke="#4a4458" stroke-width="6" stroke-linecap="round"/>`,
  // ll: Bella the bell
  ll: `<circle cx="60" cy="10" r="7" fill="none" stroke="#c98f00" stroke-width="4"/><path d="M60 14 C86 14 98 40 98 72 L108 94 H12 L22 72 C22 40 34 14 60 14Z" fill="#ffc933" stroke="#e0a100" stroke-width="3.5"/>
      <path d="M32 40 q6 -16 24 -20" stroke="#fff" stroke-width="4.5" fill="none" opacity=".55" stroke-linecap="round"/><circle cx="60" cy="102" r="10" fill="#e0a100"/>${face(60, 62, 1.1)}
      <path d="M112 60 q8 6 0 14 M8 60 q-8 6 0 14" stroke="#ffd166" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  // ss: Moss the hisser (a mossy, hissing fuzzball)
  ss: `<g fill="#4fa971"><circle cx="30" cy="68" r="20"/><circle cx="52" cy="46" r="22"/><circle cx="78" cy="48" r="22"/><circle cx="92" cy="72" r="18"/><circle cx="56" cy="86" r="26"/></g>
      <g fill="#7bd389"><circle cx="34" cy="64" r="14"/><circle cx="56" cy="44" r="16"/><circle cx="76" cy="46" r="16"/><circle cx="86" cy="68" r="12"/><circle cx="58" cy="84" r="20"/></g>
      <path d="M20 40 q-8 -8 0 -14 M98 36 q8 -10 -2 -16" stroke="#3c9a4b" stroke-width="3.5" fill="none" stroke-linecap="round"/>${face(58, 70, 1.05)}
      <path d="M8 96 q8 -10 14 0 q6 10 12 0 M86 100 q8 -10 14 0 q6 10 12 0" stroke="#4cc3d9" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  // sh: Shelly the shell, finger to her lips ("shh")
  sh: `<ellipse cx="60" cy="112" rx="40" ry="6" fill="#f4dba8"/>
      <path d="M60 110 L14 72 Q2 38 28 26 Q38 12 60 18 Q82 12 92 26 Q118 38 106 72Z" fill="#e8688a"/>
      <path d="M60 108 L20 72 Q10 42 32 32 Q40 22 60 26 Q80 22 88 32 Q110 42 100 72Z" fill="#ffb3c6"/>
      <path d="M60 108 L28 42 M60 108 L44 30 M60 108 L60 24 M60 108 L76 30 M60 108 L92 42" stroke="#f08aa8" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M44 108 L76 108 L70 118 L50 118Z" fill="#e8688a"/><path d="M34 46 q6 -14 18 -16" stroke="#fff" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>
      ${eyes(46, 74, 56, 7.5)}${cheeks(34, 86, 70, 5)}
      <path d="M96 120 q10 -14 -8 -28 q-8 -4 -14 -2" stroke="#d98a58" stroke-width="12" fill="none" stroke-linecap="round"/>
      <rect x="52" y="58" width="16" height="42" rx="8" fill="#d98a58"/><rect x="51" y="56" width="16" height="42" rx="8" fill="#ffcfa4"/><ellipse cx="57" cy="62" rx="5" ry="4" fill="#fff" opacity=".85"/><path d="M52 80 h14" stroke="#e8a67a" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="60" cy="100" rx="19" ry="13" fill="#d98a58"/><ellipse cx="58" cy="98" rx="19" ry="13" fill="#ffcfa4"/><path d="M46 94 q-6 4 -2 10 M70 93 q6 4 2 10" stroke="#e8a67a" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
  // ch: Choo-Choo the little steam train, face on the boiler, puffing steam
  ch: `<circle cx="84" cy="14" r="9" fill="#fff"/><circle cx="100" cy="4" r="7" fill="#fff" opacity=".9"/><circle cx="72" cy="2" r="5.5" fill="#fff" opacity=".85"/>
      <rect x="10" y="108" width="100" height="5" rx="2.5" fill="#8896a5"/><path d="M20 113 h10 M45 113 h10 M70 113 h10 M95 113 h10" stroke="#7a4a1d" stroke-width="4" stroke-linecap="round"/>
      <rect x="16" y="34" width="88" height="68" rx="12" fill="#ef476f"/><rect x="12" y="26" width="96" height="14" rx="7" fill="#c2284f"/>
      <circle cx="28" cy="100" r="13" fill="#26303f"/><circle cx="92" cy="100" r="13" fill="#26303f"/><circle cx="28" cy="100" r="5" fill="#aab4bf"/><circle cx="92" cy="100" r="5" fill="#aab4bf"/>
      <path d="M52 46 L55 26 H65 L68 46Z" fill="#26303f"/><path d="M46 12 H74 L68 26 H52Z" fill="#3d4a63"/><rect x="50" y="8" width="20" height="6" rx="3" fill="#26303f"/><rect x="53" y="32" width="14" height="4" fill="#ffd166"/>
      <circle cx="60" cy="74" r="34" fill="#2b8fa3"/><circle cx="60" cy="74" r="31" fill="#4cc3d9"/><circle cx="60" cy="74" r="31" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-dasharray="2 8" stroke-linecap="round"/><path d="M38 54 q8 -10 20 -12" stroke="#fff" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
      ${face(60, 72, 1.2)}
      <path d="M32 96 L88 96 L96 104 L24 104Z" fill="#ffd166"/>`,
  // th: Theo the thumb: a round fist with a short, chubby thumb up, a face on the fist and his tongue out
  th: `<rect x="26" y="98" width="68" height="18" rx="9" fill="#52b8a5"/><rect x="26" y="98" width="68" height="6" rx="3" fill="#fff" opacity=".35"/>
      <ellipse cx="60" cy="78" rx="44" ry="36" fill="#e8a479"/><ellipse cx="60" cy="74" rx="44" ry="36" fill="#ffc59a"/>
      <ellipse cx="38" cy="30" rx="17" ry="25" fill="#e8a479" transform="rotate(-12 38 30)"/><ellipse cx="38" cy="27" rx="17" ry="25" fill="#ffc59a" transform="rotate(-12 38 27)"/>
      <ellipse cx="37" cy="14" rx="9" ry="6" fill="#ffe5d3" transform="rotate(-12 37 14)"/><ellipse cx="33" cy="12" rx="3.4" ry="2" fill="#fff" opacity=".8" transform="rotate(-12 33 12)"/>
      <path d="M86 64 q10 6 10 16 M84 80 q8 5 8 14" stroke="#e8a479" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${eyes(48, 72, 66, 7)}${cheeks(36, 84, 80, 5)}
      <path d="M50 84 Q60 92 70 84" fill="none" stroke="#3b2030" stroke-width="3.2" stroke-linecap="round"/><path d="M53 87 Q60 104 67 87Z" fill="#ff6f95"/><path d="M60 89 V96" stroke="#e0507a" stroke-width="2" stroke-linecap="round"/>`,
  // ng: Gong the gong in his frame, a little mallet at his foot
  ng: `<rect x="6" y="104" width="30" height="8" rx="4" fill="#6b3f1a"/><rect x="84" y="104" width="30" height="8" rx="4" fill="#6b3f1a"/>
      <rect x="12" y="12" width="10" height="96" rx="4" fill="#a8703a"/><rect x="98" y="12" width="10" height="96" rx="4" fill="#a8703a"/><rect x="8" y="6" width="104" height="12" rx="6" fill="#7a4a1d"/><rect x="8" y="6" width="104" height="4" rx="2" fill="#d9a066" opacity=".7"/>
      <path d="M48 18 L50 32 M72 18 L70 32" stroke="#7a4a1d" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="60" cy="68" r="36" fill="#d68a14"/><circle cx="60" cy="68" r="32" fill="#ffc23d"/><circle cx="60" cy="68" r="26" fill="#ffd166"/><circle cx="60" cy="68" r="26" fill="none" stroke="#e8a21f" stroke-width="2.5"/>
      <path d="M36 50 q8 -14 22 -16" stroke="#fff" stroke-width="4.5" fill="none" opacity=".6" stroke-linecap="round"/>
      ${face(60, 66, 1.15)}
      <rect x="62" y="102" width="30" height="6" rx="3" fill="#7a4a1d"/><circle cx="58" cy="105" r="7.5" fill="#ef476f"/><circle cx="55" cy="102" r="2.4" fill="#fff" opacity=".6"/>`,
  // ai: Rainy the raindrop, with a few splash drops
  ai: `<path d="M18 34 q-4 -9 -10 -10 M102 34 q4 -9 10 -10 M12 72 h-8 M108 72 h8" stroke="#8fd0f0" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M60 6 C60 6 20 54 20 80 C20 102 38 114 60 114 C82 114 100 102 100 80 C100 54 60 6 60 6Z" fill="#2f78d6"/>
      <path d="M60 10 C60 10 24 54 24 80 C24 100 40 110 60 110 C80 110 96 100 96 80 C96 54 60 10 60 10Z" fill="#4ea1f5"/>
      <path d="M38 78 q-2 -14 8 -28" stroke="#fff" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>${face(60, 82, 1.1)}
      <path d="M14 100 q-6 6 -2 12 q8 0 6 -10z M106 100 q6 6 2 12 q-8 0 -6 -10z M28 12 q-4 6 0 9 q5 -2 0 -9z M94 12 q4 6 0 9 q-5 -2 0 -9z" fill="#8fd0f0"/>`,
  // ee: Bea the bee, round and fuzzy
  ee: `<ellipse cx="38" cy="28" rx="20" ry="13" fill="#cfeaff" stroke="#a6d4f2" stroke-width="2.5" transform="rotate(-28 38 28)"/><ellipse cx="82" cy="28" rx="20" ry="13" fill="#cfeaff" stroke="#a6d4f2" stroke-width="2.5" transform="rotate(28 82 28)"/>
     <path d="M48 36 q-6 -18 -18 -22 M72 36 q6 -18 18 -22" stroke="#26303f" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="29" cy="13" r="4.6" fill="#26303f"/><circle cx="91" cy="13" r="4.6" fill="#26303f"/>
     <ellipse cx="60" cy="74" rx="44" ry="40" fill="#e0a100"/><ellipse cx="60" cy="72" rx="44" ry="40" fill="#ffd23f"/>
     <clipPath id="beaBody"><ellipse cx="60" cy="72" rx="44" ry="40"/></clipPath>
     <g clip-path="url(#beaBody)"><path d="M0 88 Q60 98 120 88 V99 Q60 109 0 99Z M0 106 Q60 116 120 106 V124 H0Z" fill="#26303f"/></g>
     ${face(60, 62, 1.15)}<path d="M36 52 q4 -10 14 -12" stroke="#fff" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>`,
  // oa: Boa the boat, a face on her hull, a little flag on the mast
  oa: `<path d="M60 8 V58" stroke="#7a4a1d" stroke-width="5" stroke-linecap="round"/><path d="M62 10 L96 22 L62 34Z" fill="#ffd166"/><path d="M62 10 L96 22 L62 22Z" fill="#fff" opacity=".4"/>
     <path d="M4 56 H116 Q110 98 82 104 H38 Q10 98 4 56Z" fill="#c2284f"/><path d="M8 56 H112 Q106 94 80 100 H40 Q14 94 8 56Z" fill="#ef476f"/><rect x="2" y="50" width="116" height="11" rx="5.5" fill="#fff"/><rect x="2" y="56" width="116" height="5" rx="2.5" fill="#dfe8f0"/>
     <path d="M22 70 q4 -10 16 -12" stroke="#fff" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/>${face(60, 78, 1.05)}
     <path d="M-4 96 q10 -10 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V124 H-4Z" fill="#2b8fa3"/><path d="M-4 106 q10 -10 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V124 H-4Z" fill="#4cc3d9"/>`,
  // oo: Moony the moon, sleepy-happy, with two stars
  oo: `<path d="M76 8 A52 52 0 1 0 108 82 A42 42 0 1 1 76 8Z" fill="#e0b800"/><path d="M74 8 A50 50 0 1 0 106 80 A40 40 0 1 1 74 8Z" fill="#ffe98a"/>
     <path d="M30 40 q6 -16 20 -22" stroke="#fff" stroke-width="4.5" fill="none" opacity=".55" stroke-linecap="round"/>
     <path d="M32 70 q6 6 12 0 M60 74 q6 6 12 0" stroke="#26303f" stroke-width="3.6" fill="none" stroke-linecap="round"/>
     ${cheeks(30, 76, 86, 5)}<path d="M42 90 Q52 100 62 90" fill="none" stroke="#3b2030" stroke-width="3.2" stroke-linecap="round"/>
     <path d="M98 22 l4 10 l10 1 l-8 7 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -7 l10 -1z" fill="#ffd166"/><path d="M102 60 l2.4 6 l6 .6 l-4.6 4 l1.6 6 l-5.4 -3.6 l-5.4 3.6 l1.6 -6 l-4.6 -4 l6 -.6z" fill="#ffd166" transform="translate(-4 -2)"/>
     <circle cx="64" cy="22" r="2.6" fill="#fff"/><circle cx="110" cy="52" r="2.2" fill="#fff"/>`,
};

// the friends of later sets are drawn in their own files and merged in here
Object.assign(BODY, FRIENDS_SET8, FRIENDS_SET10, FRIENDS_SET11);
export const FRIEND_IDS = Object.keys(BODY);
export const friendSVG = (id: string): string =>
  BODY[id] ? `<svg class="friend" viewBox="0 -6 120 130" role="img" aria-hidden="true" focusable="false">${BODY[id]}</svg>` : '';
export const hasFriend = (id: string): boolean => id in BODY;

import { MNEMONICS } from '../engine/data';
import { h } from './dom';

/** A sound-friend as an element: the drawn character, or its emoji if there is no drawing. */
export const friendEl = (id: string, cls = ''): HTMLElement => {
  const el = h('span', { class: `friend-wrap ${cls}`, 'aria-hidden': 'true' });
  if (hasFriend(id)) el.innerHTML = friendSVG(id);
  else el.textContent = MNEMONICS[id]?.emoji ?? '⭐';
  return el;
};
