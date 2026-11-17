import { cheeks, eyes, face, smile } from './friendKit';

// Sound-friends of set(s) j v w x y z zz qu. Each entry is an SVG fragment (viewBox 0 0 120 120) in the style of the existing friends.

// stripes inside an ellipse (zebra), each one as tall as the ellipse is at that x
const stripes = (cx: number, cy: number, rx: number, ry: number, xs: number[], w = 5): string =>
  xs.map((x) => {
    const h = ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)) - 1;
    return `<path d="M${x} ${cy - h} Q${x + 3} ${cy} ${x - 1} ${cy + h}" fill="none" stroke="#26303f" stroke-width="${w}" stroke-linecap="round"/>`;
  }).join('');

export const FRIENDS_SET8: Record<string, string> = {
  // j: Jess the jet, zooming up and away, her face on the nose
  j: `<path d="M2 78 h24 M8 92 h22 M0 64 h16" stroke="#8fd0f0" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g transform="translate(5 -8) scale(.92) rotate(-12 64 62)">
        <path d="M24 62 L12 30 L32 30 L46 56Z" fill="#1f9d92"/>
        <path d="M58 52 L80 20 L96 20 L84 52Z" fill="#1f9d92"/>
        <ellipse cx="64" cy="66" rx="50" ry="29" fill="#1f9d92"/><ellipse cx="64" cy="63" rx="50" ry="29" fill="#2ec4b6"/>
        <path d="M18 70 Q40 84 80 82 Q104 80 112 66 Q114 92 78 94 Q30 96 18 70Z" fill="#fff" opacity=".55"/>
        <path d="M40 98 L22 118 L50 118 L84 94Z" fill="#168378"/><ellipse cx="56" cy="102" rx="11" ry="5" fill="#aab4bf"/><ellipse cx="56" cy="101" rx="9" ry="3" fill="#dfe6ec"/>
        <rect x="26" y="52" width="9" height="9" rx="4" fill="#bfe8ff"/><rect x="38" y="52" width="9" height="9" rx="4" fill="#bfe8ff"/>
        <path d="M30 42 q14 -10 30 -10" stroke="#fff" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>
        ${face(82, 62, 1.1)}
      </g>`,
  // v: Vic the van, a friendly face on his windscreen
  v: `<rect x="6" y="88" width="16" height="24" rx="7" fill="#26303f"/><rect x="98" y="88" width="16" height="24" rx="7" fill="#26303f"/>
      <rect x="22" y="8" width="76" height="22" rx="10" fill="#d9482a"/><rect x="30" y="4" width="60" height="8" rx="4" fill="#aab4bf"/>
      <rect x="12" y="22" width="96" height="86" rx="20" fill="#d9482a"/><rect x="12" y="20" width="96" height="86" rx="20" fill="#ff6a3d"/>
      <rect x="22" y="28" width="76" height="46" rx="14" fill="#5bb8d6"/><rect x="22" y="28" width="76" height="46" rx="14" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/>
      <path d="M32 38 q8 -8 22 -8" stroke="#fff" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
      ${face(60, 52, 1.2)}
      <circle cx="28" cy="88" r="8" fill="#ffd166"/><circle cx="92" cy="88" r="8" fill="#ffd166"/><circle cx="26" cy="86" r="2.6" fill="#fff" opacity=".8"/><circle cx="90" cy="86" r="2.6" fill="#fff" opacity=".8"/>
      <rect x="40" y="80" width="40" height="14" rx="7" fill="#fff3d6"/><path d="M48 87 h24" stroke="#d9a066" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="22" y="98" width="76" height="9" rx="4.5" fill="#b9c3cd"/>
      <rect x="2" y="46" width="12" height="16" rx="6" fill="#d9482a"/><rect x="106" y="46" width="12" height="16" rx="6" fill="#d9482a"/>`,
  // w: Wiggle the worm, wobbling into a w, with a big happy mouth
  w: `<path d="M16 34 C18 90 34 108 46 80 C52 64 66 64 72 80 C84 108 100 86 100 46" fill="none" stroke="#e0607f" stroke-width="27" stroke-linecap="round"/>
      <path d="M16 34 C18 90 34 108 46 80 C52 64 66 64 72 80 C84 108 100 86 100 46" fill="none" stroke="#ff8fab" stroke-width="20" stroke-linecap="round"/>
      <path d="M24 44 C26 78 34 92 40 76" fill="none" stroke="#fff" stroke-width="3.5" opacity=".45" stroke-linecap="round"/>
      <path d="M8 44 l9 3 M8 56 l9 1 M30 100 l5 -6 M50 62 l0 8 M62 62 l0 8 M80 102 l5 -6" stroke="#e0607f" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <circle cx="98" cy="34" r="22" fill="#ff8fab"/><path d="M82 26 q6 -12 20 -12" stroke="#fff" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
      ${eyes(89, 108, 28, 6.5)}${cheeks(82, 114, 42, 4.5)}
      <path d="M86 38 Q98 58 110 38Z" fill="#8f2540"/><path d="M92 47 Q98 56 104 47Q98 44 92 47Z" fill="#ff6f95"/>
      <path d="M94 12 q-2 -8 -9 -10 M104 12 q2 -8 9 -10" stroke="#e0607f" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="85" cy="2" r="3.4" fill="#ffd166"/><circle cx="113" cy="2" r="3.4" fill="#ffd166"/>`,
  // x: Axel the box, flaps open like ears, a bow tie, and tape crossed like an x
  x: `<path d="M26 44 L8 20 L38 12 L46 44Z" fill="#c78a45"/><path d="M94 44 L112 20 L82 12 L74 44Z" fill="#c78a45"/>
      <path d="M26 44 L8 20 L16 18 L32 44Z" fill="#a96f31"/><path d="M94 44 L112 20 L104 18 L88 44Z" fill="#a96f31"/>
      <rect x="18" y="38" width="84" height="76" rx="8" fill="#b9803f"/><rect x="18" y="38" width="84" height="74" rx="8" fill="#e8b878"/>
      <rect x="14" y="36" width="92" height="12" rx="5" fill="#d9a066"/>
      <path d="M26 56 L94 106 M94 56 L26 106" stroke="#fff3d6" stroke-width="9" stroke-linecap="round" opacity=".6"/>
      <path d="M28 54 q4 -4 10 -4" stroke="#fff" stroke-width="3.5" fill="none" opacity=".5" stroke-linecap="round"/>
      ${eyes(46, 74, 64, 8)}${cheeks(34, 86, 76, 5)}<path d="M44 76 Q60 94 76 76Z" fill="#8f3a2b"/><path d="M52 84 Q60 91 68 84Q60 82 52 84Z" fill="#ff8fa3"/>
      <path d="M60 100 L40 90 L40 110Z" fill="#c2284f"/><path d="M60 100 L80 90 L80 110Z" fill="#c2284f"/><path d="M60 100 L42 92 L42 104Z" fill="#ef476f"/><path d="M60 100 L78 92 L78 104Z" fill="#ef476f"/><rect x="54" y="93" width="12" height="14" rx="5" fill="#ff6f91"/>`,
  // y: Yoyo the yak, all fluffy, with a yo-yo on a string. His horns make a y.
  y: `<path d="M14 98 Q10 78 60 76 Q110 78 106 98 L106 106 q-6 12 -14 2 q-6 12 -14 2 q-6 12 -14 2 q-6 12 -14 2 q-6 12 -14 2 q-6 12 -14 2 q-6 8 -10 -4Z" fill="#4a3328"/>
      <path d="M22 94 q-2 12 4 20 M40 90 q-2 14 2 22 M60 92 v22 M80 90 q2 14 -2 22 M98 94 q2 12 -4 20" stroke="#6b4a36" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M38 40 Q16 38 12 8 Q24 14 48 28Z" fill="#fff3d6"/><path d="M82 40 Q104 38 108 8 Q96 14 72 28Z" fill="#fff3d6"/>
      <path d="M12 8 Q24 14 48 28 L44 32 Q22 28 12 8Z" fill="#e0c48a"/><path d="M108 8 Q96 14 72 28 L76 32 Q98 28 108 8Z" fill="#e0c48a"/>
      <ellipse cx="22" cy="62" rx="12" ry="8" fill="#4a3328" transform="rotate(28 22 62)"/><ellipse cx="98" cy="62" rx="12" ry="8" fill="#4a3328" transform="rotate(-28 98 62)"/>
      <circle cx="60" cy="58" r="34" fill="#4a3328"/><circle cx="60" cy="56" r="32" fill="#6b4a36"/>
      <path d="M32 40 Q40 26 52 36 Q60 22 68 36 Q80 26 88 40 Q74 34 60 46 Q46 34 32 40Z" fill="#4a3328"/>
      <path d="M26 56 Q22 80 32 92 L36 74Z M94 56 Q98 80 88 92 L84 74Z" fill="#4a3328"/>
      <ellipse cx="60" cy="76" rx="17" ry="13" fill="#b4906d"/><ellipse cx="60" cy="74" rx="16" ry="11.5" fill="#d2b08c"/><ellipse cx="53" cy="72" rx="2.2" ry="3" fill="#3b2030"/><ellipse cx="67" cy="72" rx="2.2" ry="3" fill="#3b2030"/>
      ${eyes(46, 74, 54, 7)}${cheeks(36, 84, 66, 4.5)}${smile(60, 78, 8)}
      <path d="M94 92 Q104 84 106 66" stroke="#4a3328" stroke-width="13" fill="none" stroke-linecap="round"/><circle cx="106" cy="64" r="8" fill="#3b2a22"/><path d="M106 70 V92" stroke="#cfd6de" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="106" cy="104" r="14" fill="#c2284f"/><circle cx="106" cy="103" r="14" fill="#ef476f"/><circle cx="106" cy="103" r="6" fill="#ffd166"/><path d="M96 98 q3 -6 10 -7" stroke="#fff" stroke-width="2.6" fill="none" opacity=".7" stroke-linecap="round"/>`,
  // z: Zippy the zebra, mid-zoom with speed lines and dust
  z: `<path d="M2 50 h20 M6 66 h16 M0 82 h18" stroke="#8fd0f0" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="12" cy="108" r="6" fill="#e6e0ee"/><circle cx="22" cy="112" r="4.6" fill="#e6e0ee" opacity=".8"/>
      <g transform="rotate(-4 60 70)">
      <path d="M28 70 Q12 66 14 46" stroke="#26303f" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="14" cy="42" rx="5" ry="7" fill="#26303f" transform="rotate(-10 14 42)"/>
      <g stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none"><path d="M60 92 L88 102"/><path d="M50 96 L70 114"/><path d="M34 92 L12 100"/><path d="M42 96 L26 114"/></g>
      <g fill="#26303f"><circle cx="90" cy="103" r="5"/><circle cx="71" cy="114" r="5"/><circle cx="10" cy="101" r="5"/><circle cx="25" cy="114" r="5"/></g>
      <ellipse cx="46" cy="80" rx="38" ry="22" fill="#e4e8ee"/><ellipse cx="46" cy="78" rx="38" ry="22" fill="#fff"/>${stripes(46, 78, 38, 22, [22, 32, 42, 52, 62, 70])}
      <path d="M64 44 L70 24 L92 28 L90 62Z" fill="#fff"/>
      <path d="M62 54 L66 22 L72 22 L68 56Z" fill="#26303f"/>
      <path d="M72 22 L70 6 L82 16Z" fill="#fff"/><path d="M72 22 L70 6 L75 10Z" fill="#26303f"/><path d="M92 22 L96 6 L100 20Z" fill="#fff"/><path d="M92 22 L96 6 L97 11Z" fill="#26303f"/>
      <circle cx="86" cy="50" r="26" fill="#e4e8ee"/><circle cx="86" cy="48" r="26" fill="#fff"/>
      <path d="M70 28 q4 8 2 16 M86 22 v10 M102 28 q-4 8 -2 16 M64 50 q4 4 4 12 M108 50 q-4 4 -4 12" stroke="#26303f" stroke-width="4.4" fill="none" stroke-linecap="round"/>
      <ellipse cx="86" cy="64" rx="14" ry="10" fill="#e9d9c4"/>
      ${eyes(77, 95, 46, 6.5)}${cheeks(70, 102, 56, 4.4)}${smile(86, 60, 7)}
      </g>`,
  // zz: Fizzy the fizz, a fizzy-drink bottle with bubbles and a zigzag band
  zz: `<circle cx="26" cy="30" r="8" fill="#fff" opacity=".85"/><circle cx="16" cy="48" r="5" fill="#fff" opacity=".7"/><circle cx="96" cy="26" r="7" fill="#fff" opacity=".85"/><circle cx="106" cy="44" r="4.4" fill="#fff" opacity=".7"/><circle cx="86" cy="8" r="4" fill="#fff" opacity=".8"/>
      <path d="M44 12 Q44 2 50 6 Q56 -2 62 4 Q68 0 74 8 Q78 14 72 18 H48 Q42 18 44 12Z" fill="#fff"/>
      <rect x="46" y="14" width="28" height="12" rx="5" fill="#9b8bf0"/><rect x="46" y="14" width="28" height="4" rx="2" fill="#fff" opacity=".4"/>
      <path d="M48 26 H72 V36 Q100 46 100 72 V104 Q100 116 88 116 H32 Q20 116 20 104 V72 Q20 46 48 36Z" fill="#8fb12a"/>
      <path d="M50 26 H70 V37 Q96 46 96 72 V104 Q96 112 86 112 H34 Q24 112 24 104 V72 Q24 46 50 37Z" fill="#c4e23d"/>
      <path d="M22 96 l8.5 -9 l8.5 9 l8.5 -9 l8.5 9 l8.5 -9 l8.5 9 l8.5 -9 l8.5 9 V104 l-8.5 -9 l-8.5 9 l-8.5 -9 l-8.5 9 l-8.5 -9 l-8.5 9 l-8.5 -9 l-8.5 9 l-8.5 -9 l-8.5 9Z" fill="#fff" opacity=".9"/>
      <path d="M34 54 q4 -10 14 -14" stroke="#fff" stroke-width="4.4" fill="none" opacity=".6" stroke-linecap="round"/>
      <circle cx="84" cy="96" r="3.4" fill="#fff" opacity=".7"/><circle cx="34" cy="108" r="2.6" fill="#fff" opacity=".7"/>
      ${face(60, 62, 1.2)}`,
  // qu: Queenie the queen, a finger to her lips for "quiet"
  qu: `<path d="M26 116 Q22 88 38 70 L84 70 Q100 88 94 116Z" fill="#7e6fdc"/><path d="M30 116 Q28 90 40 74 L80 74 Q94 90 90 116Z" fill="#9b8bf0"/>
      <path d="M40 74 Q60 92 80 74 L86 82 Q60 104 34 82Z" fill="#fff"/><circle cx="48" cy="86" r="2.6" fill="#ff8fab"/><circle cx="60" cy="92" r="2.6" fill="#ff8fab"/><circle cx="72" cy="86" r="2.6" fill="#ff8fab"/>
      <path d="M24 44 Q16 76 22 96 Q34 106 40 88 L42 50Z M96 44 Q104 76 98 96 Q86 106 80 88 L78 50Z" fill="#8c5a2a"/>
      <circle cx="60" cy="52" r="28" fill="#ffcfa4"/><path d="M34 46 Q36 24 60 24 Q84 24 86 46 Q72 38 60 40 Q48 38 34 46Z" fill="#8c5a2a"/>
      ${eyes(48, 72, 52, 7.5)}${cheeks(40, 80, 64, 4.8)}
      <path d="M44 28 L40 10 L52 20 L60 6 L68 20 L80 10 L76 28Z" fill="#ffc23d"/><rect x="43" y="23" width="34" height="8" rx="3" fill="#e0a100"/><circle cx="40" cy="10" r="3.6" fill="#ef476f"/><circle cx="60" cy="6" r="3.8" fill="#4cc3d9"/><circle cx="80" cy="10" r="3.6" fill="#ef476f"/>
      <path d="M92 112 Q104 94 74 92" stroke="#7e6fdc" stroke-width="15" fill="none" stroke-linecap="round"/>
      <ellipse cx="64" cy="88" rx="10" ry="8" fill="#e8a67a"/><ellipse cx="63" cy="87" rx="10" ry="8" fill="#ffcfa4"/><rect x="56" y="62" width="9" height="26" rx="4.5" fill="#e8a67a"/><rect x="55" y="61" width="9" height="26" rx="4.5" fill="#ffd9b8"/><path d="M58 90 h10 M58 94 h8" stroke="#e8a67a" stroke-width="2" stroke-linecap="round" opacity=".0"/><ellipse cx="58" cy="66" rx="2.4" ry="3" fill="#fff" opacity=".8"/>`,
};
void [cheeks, eyes, face, smile];
