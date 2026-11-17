import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import { capsuleSVG, islandSVG, sceneSVG } from './space-art';
import type { CreatureDef, Pack } from './types';

/** Space Station: four baby aliens (Zip, Plum, Star, Sky), a rocket-pod arrival, a pastel moon-surface backdrop and a floating planetoid. */

const HY = 84;
const SHADOW = '<ellipse cx="100" cy="202" rx="62" ry="9" fill="#0000001f"/>';
const wrap = (inner: string): string =>
  `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">\n  ${SHADOW}\n  ${inner}\n  ${zzzSVG(HY)}\n</svg>`;
/** the shared face, centred on (100, HY) */
const face = (g: number): { eyes: string; mouth: string; acc: string } => ({ eyes: faceEyesSVG(HY), mouth: faceMouthSVG(HY), acc: accessorySVG(g, HY) });
/** a pinched four-point sparkle */
const spark = (x: number, y: number, r: number, fill: string): string => {
  const k = r * 0.2;
  return `<path d="M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}Z" fill="${fill}"/>`;
};

// ---------------------------------------------------------------- Zip: neon green, round pear body, one bobbing antenna with a glowing ball
const ZIP = { main: '#2ee84f', dark: '#0e9f31', accent: '#ffe53d', belly: '#dcffdc' };
const zipSVG = (g: number): string => {
  const { main, dark, accent, belly } = ZIP;
  const f = face(g);
  const tall = g >= 3; // the antenna grows up through the hat / crown
  const ay = tall ? HY - 96 : HY - 74; // ball centre
  return wrap(`<g class="bodyg">
    <ellipse cx="74" cy="194" rx="19" ry="9" fill="${dark}"/><ellipse cx="126" cy="194" rx="19" ry="9" fill="${dark}"/>
    <circle cx="48" cy="150" r="12" fill="${dark}"/><circle cx="152" cy="150" r="12" fill="${dark}"/>
    <ellipse cx="100" cy="152" rx="52" ry="42" fill="${main}"/>
    <ellipse cx="100" cy="161" rx="32" ry="26" fill="${belly}"/>
    <circle cx="70" cy="140" r="5" fill="${dark}" opacity=".3"/><circle cx="132" cy="136" r="4" fill="${dark}" opacity=".3"/><circle cx="124" cy="150" r="3" fill="${dark}" opacity=".3"/>
    <path d="M62 128 Q70 118 84 116" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".45"/>
  </g>
  <g class="headg">
    <g class="tail" style="transform-origin:50% 100%">
      <path d="M100 ${HY - 38} Q92 ${HY - 56} 102 ${ay + 8}" stroke="${dark}" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="102" cy="${ay}" r="15" fill="${accent}" opacity=".35"/><circle cx="102" cy="${ay}" r="9.5" fill="${accent}"/><circle cx="99" cy="${ay - 3}" r="3.2" fill="#fff"/>
    </g>
    <circle cx="100" cy="${HY}" r="44" fill="${dark}" opacity=".35" transform="translate(0 3)"/>
    <circle cx="100" cy="${HY}" r="44" fill="${main}"/>
    <path d="M66 ${HY - 26} Q74 ${HY - 38} 88 ${HY - 40}" stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity=".5"/>
    ${f.eyes}
    <ellipse cx="92" cy="${HY + 8}" rx="2.4" ry="3.2" fill="${dark}" opacity=".5"/><ellipse cx="108" cy="${HY + 8}" rx="2.4" ry="3.2" fill="${dark}" opacity=".5"/>
    ${f.mouth}
    ${f.acc}
  </g>`);
};

// ---------------------------------------------------------------- Plum: purple, two little horns, side fins and a tiny cape
const PLUM = { main: '#a24bff', dark: '#6b1fd2', accent: '#ff6bb8', belly: '#ecdcff' };
const plumSVG = (g: number): string => {
  const { main, dark, accent, belly } = PLUM;
  const f = face(g);
  const horn = (s: number) => {
    const x = (v: number) => 100 + s * v;
    return `<path d="M${x(30)} ${HY - 32} Q${x(40)} ${HY - 50} ${x(50)} ${HY - 62} Q${x(58)} ${HY - 40} ${x(44)} ${HY - 22}Z" fill="${dark}"/><circle cx="${x(50)}" cy="${HY - 62}" r="7" fill="${accent}"/><circle cx="${x(48)}" cy="${HY - 64}" r="2.4" fill="#fff" opacity=".8"/>`;
  };
  const fin = (s: number) => {
    const x = (v: number) => 100 + s * v;
    return `<path d="M${x(40)} ${HY - 12} Q${x(62)} ${HY - 30} ${x(66)} ${HY - 8} Q${x(70)} ${HY + 14} ${x(42)} ${HY + 14}Z" fill="${dark}"/><path d="M${x(48)} ${HY - 4} Q${x(60)} ${HY - 16} ${x(62)} ${HY - 4}" stroke="${accent}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  };
  return wrap(`<g class="tail" style="transform-origin:50% 8%">
    <path d="M62 120 Q40 160 30 200 Q100 214 170 200 Q160 160 138 120Z" fill="${accent}"/>
    <path d="M62 120 Q46 160 38 196 Q100 208 162 196 Q154 160 138 120Z" fill="${mixHex(accent, '#ffffff', 0.25)}"/>
    <path d="M44 190 Q50 200 60 198 Q70 208 80 202 Q90 210 100 204 Q110 210 120 202 Q130 208 140 198 Q150 200 156 190" stroke="${mixHex(accent, '#b01a6e', 0.35)}" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
  <g class="bodyg">
    <ellipse cx="76" cy="194" rx="19" ry="9" fill="${dark}"/><ellipse cx="124" cy="194" rx="19" ry="9" fill="${dark}"/>
    <rect x="52" y="108" width="96" height="86" rx="42" fill="${main}"/>
    <ellipse cx="100" cy="160" rx="30" ry="27" fill="${belly}"/>
    <ellipse cx="46" cy="152" rx="11" ry="14" fill="${dark}" transform="rotate(20 46 152)"/><ellipse cx="154" cy="152" rx="11" ry="14" fill="${dark}" transform="rotate(-20 154 152)"/>
    <circle cx="68" cy="124" r="6" fill="#ffd54a"/><circle cx="132" cy="124" r="6" fill="#ffd54a"/><circle cx="66" cy="122" r="2" fill="#fff" opacity=".8"/><circle cx="130" cy="122" r="2" fill="#fff" opacity=".8"/>
    <circle cx="100" cy="164" r="4" fill="${dark}" opacity=".25"/>
  </g>
  <g class="headg">
    ${fin(-1)}${fin(1)}${horn(-1)}${horn(1)}
    <circle cx="100" cy="${HY}" r="44" fill="${dark}" opacity=".35" transform="translate(0 3)"/>
    <circle cx="100" cy="${HY}" r="44" fill="${main}"/>
    <path d="M66 ${HY - 26} Q74 ${HY - 38} 88 ${HY - 40}" stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity=".5"/>
    ${f.eyes}
    <ellipse cx="92" cy="${HY + 8}" rx="2.4" ry="3.2" fill="${dark}" opacity=".5"/><ellipse cx="108" cy="${HY + 8}" rx="2.4" ry="3.2" fill="${dark}" opacity=".5"/>
    ${f.mouth}
    ${f.acc}
  </g>`);
};

// ---------------------------------------------------------------- Star: orange, a soft rounded five-pointed star with little feet
const STAR = { main: '#ffa31a', dark: '#e26a00', accent: '#ffe94d', belly: '#fff0b8' };
const starPath = (cx: number, cy: number, ro: number, ri: number): string =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + i * 36) * (Math.PI / 180);
    const r = i % 2 ? ri : ro;
    return `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join('') + 'Z';
const starSVG = (g: number): string => {
  const { main, dark, accent } = STAR;
  const f = face(g);
  const shape = starPath(100, HY + 2, 68, 40);
  const round = (fill: string, dy: number) => `<path d="${shape}" fill="${fill}" stroke="${fill}" stroke-width="10" stroke-linejoin="round" transform="translate(0 ${dy})"/>`;
  return wrap(`<g class="bodyg">
    <ellipse cx="64" cy="152" rx="19" ry="11" fill="${dark}"/><ellipse cx="136" cy="152" rx="19" ry="11" fill="${dark}"/>
    <ellipse cx="64" cy="148" rx="15" ry="7" fill="${mixHex(dark, '#ffffff', 0.2)}" opacity=".5"/><ellipse cx="136" cy="148" rx="15" ry="7" fill="${mixHex(dark, '#ffffff', 0.2)}" opacity=".5"/>
  </g>
  <g class="headg">
    ${round(dark, 5)}
    ${round(main, 0)}
    <path d="M93 ${HY - 44} Q94 ${HY - 56} 100 ${HY - 62}" stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity=".55"/>
    <path d="M38 ${HY - 14} Q40 ${HY - 24} 50 ${HY - 30}" stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity=".5"/>
    ${spark(158, HY - 66, 7, accent).replace('/>', ' class="tail" style="transform-origin:50% 50%"/>')}
    ${f.eyes}
    <ellipse cx="92" cy="${HY + 8}" rx="2.4" ry="3.2" fill="${dark}" opacity=".5"/><ellipse cx="108" cy="${HY + 8}" rx="2.4" ry="3.2" fill="${dark}" opacity=".5"/>
    ${f.mouth}
    ${f.acc}
  </g>`);
};

// ---------------------------------------------------------------- Sky: cyan, a clear glass dome helmet with a little antenna
const SKY = { main: '#17c6ff', dark: '#0a86cc', accent: '#ffd23d', belly: '#dff6ff' };
const skySVG = (g: number): string => {
  const { main, dark, accent, belly } = SKY;
  const f = face(g);
  return wrap(`<g class="bodyg">
    <rect x="40" y="124" width="22" height="50" rx="11" fill="#cfe0ff"/><rect x="138" y="124" width="22" height="50" rx="11" fill="#cfe0ff"/>
    <rect x="44" y="132" width="14" height="6" rx="3" fill="#a6bde8"/><rect x="142" y="132" width="14" height="6" rx="3" fill="#a6bde8"/>
    <ellipse cx="76" cy="194" rx="19" ry="9" fill="${dark}"/><ellipse cx="124" cy="194" rx="19" ry="9" fill="${dark}"/>
    <circle cx="50" cy="152" r="12" fill="${dark}"/><circle cx="150" cy="152" r="12" fill="${dark}"/>
    <ellipse cx="100" cy="154" rx="48" ry="40" fill="${main}"/>
    <ellipse cx="100" cy="162" rx="28" ry="24" fill="${belly}"/>
    <circle cx="88" cy="158" r="5" fill="${accent}"/><circle cx="104" cy="152" r="4" fill="#ff6fa8"/><circle cx="114" cy="166" r="4.5" fill="${dark}" opacity=".5"/><rect x="82" y="168" width="14" height="5" rx="2.5" fill="${dark}" opacity=".35"/>
  </g>
  <g class="headg">
    <g class="tail" style="transform-origin:50% 100%">
      <path d="M63 ${HY - 38} Q56 ${HY - 52} 52 ${HY - 62}" stroke="#a6bde8" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <circle cx="51" cy="${HY - 65}" r="8" fill="${accent}" stroke="#e0a100" stroke-width="2.5"/><circle cx="48.5" cy="${HY - 67.5}" r="2.4" fill="#fff"/>
    </g>
    <circle cx="100" cy="${HY}" r="40" fill="${dark}" opacity=".35" transform="translate(0 3)"/>
    <circle cx="100" cy="${HY}" r="40" fill="${main}"/>
    <circle cx="100" cy="${HY - 1}" r="53" fill="#d8f4ff" opacity=".42"/>
    ${f.eyes}
    <ellipse cx="92" cy="${HY + 8}" rx="2.4" ry="3.2" fill="${dark}" opacity=".5"/><ellipse cx="108" cy="${HY + 8}" rx="2.4" ry="3.2" fill="${dark}" opacity=".5"/>
    ${f.mouth}
    <circle cx="100" cy="${HY - 1}" r="53" fill="none" stroke="#ffffff" stroke-width="4" opacity=".85"/>
    <circle cx="100" cy="${HY - 1}" r="55.5" fill="none" stroke="#8fc8ee" stroke-width="2" opacity=".7"/>
    <path d="M62 ${HY - 32} Q72 ${HY - 46} 90 ${HY - 50}" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>
    <circle cx="58" cy="${HY - 22}" r="2.6" fill="#fff"/>
    <path d="M142 ${HY + 20} Q136 ${HY + 34} 122 ${HY + 40}" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".6"/>
    <rect x="52" y="${HY + 40}" width="96" height="14" rx="7" fill="${accent}" stroke="#e0a100" stroke-width="2.5"/>
    <rect x="58" y="${HY + 43}" width="40" height="3.5" rx="1.75" fill="#fff" opacity=".6"/>
    ${f.acc}
  </g>`);
};

const make = (id: string, label: string, c: { main: string; dark: string; accent: string }, svg: (g: number) => string): CreatureDef => ({
  id, label, main: c.main, dark: c.dark, accent: c.accent, hy: HY, svg, egg: () => capsuleSVG(id, c.main, c.dark, c.accent),
});

export const pack: Pack = {
  id: 'space',
  name: 'Space Station',
  blurb: 'Friendly aliens among the stars and planets',
  arrival: 'capsule',
  defaultName: 'Alien',
  creatures: [
    make('space-zip', 'green alien capsule', ZIP, zipSVG),
    make('space-plum', 'purple alien capsule', PLUM, plumSVG),
    make('space-star', 'orange star alien capsule', STAR, starSVG),
    make('space-sky', 'blue helmet alien capsule', SKY, skySVG),
  ],
  scene: sceneSVG,
  island: islandSVG,
};
