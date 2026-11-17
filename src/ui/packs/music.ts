import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import { musicCaseSVG, musicIslandSVG, musicSceneSVG } from './music-art';
import type { CreatureDef, Pack } from './types';

// Music Band: four chubby instrument pals (drum, trumpet, xylophone, maraca) on a friendly stage.
// Each follows the companion contract (see ../art.ts): the shared face sits on the main body of the instrument, on a smooth light area
// (drum skin, trumpet bell, xylophone panel, maraca face patch). Decoration (lugs, valves, bars, sparkles) stays away from the eyes and mouth.
// Distinct silhouettes: the drum is a round skin on a squat zig-zag drum with two sticks, the trumpet a round bell with a big coil of tube
// behind it, the xylophone a soft square head over a stack of coloured bars with a mallet, the maraca a ball over a tapering handle.

const HY = 84;
const SHADOW = `<ellipse cx="100" cy="202" rx="62" ry="9" fill="#0000001f"/>`;
const r1 = (n: number): string => n.toFixed(1);
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

/** assemble a creature: tail and body first, then the head group with the shared face on top. */
const shell = (defs: string, tail: string, body: string, headBehind: string, head: string, headFront: string, growth: number): string => `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  ${defs ? `<defs>${defs}</defs>` : ''}
  ${SHADOW}
  ${tail}
  <g class="bodyg">${body}</g>
  <g class="headg">
    ${headBehind}
    ${head}
    ${faceEyesSVG(HY)}
    ${headFront}
    ${faceMouthSVG(HY)}
    ${accessorySVG(growth, HY)}
  </g>
  ${zzzSVG(HY)}
</svg>`;

const sparkle = (x: number, y: number, s: number, c: string): string =>
  `<path d="M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${c}"/>`;

// ---------------------------------------------------------------- drum
const DRUM = { main: '#ff2a3d', dark: '#c4001f', accent: '#ffd23f' };
const drumSVG = (growth: number): string => {
  const { main, dark } = DRUM;
  const skin = '#fff3dc';
  const chrome = '#e6ecf4', chromeDark = '#aab6c6';
  const wood = '#b9792f', woodLight = '#f4c682';
  const stick = (x1: number, y1: number, x2: number, y2: number) =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${wood}" stroke-width="10" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${woodLight}" stroke-width="6" stroke-linecap="round"/><circle cx="${x2 + 2}" cy="${y2 - 3}" r="10" fill="${wood}"/><circle cx="${x2 + 2}" cy="${y2 - 3}" r="8" fill="#ffeccb"/><ellipse cx="${x2 - 1}" cy="${y2 - 7}" rx="3" ry="2" fill="#fff"/>`;
  const tail = `<g class="tail">${stick(138, 176, 186, 122)}${stick(140, 186, 194, 160)}</g>`;
  const zig = Array.from({ length: 7 }, (_, i) => `${64 + i * 12},${i % 2 ? 177 : 141}`).join(' ');
  const body = `
    <ellipse cx="74" cy="197" rx="17" ry="9" fill="${dark}"/><ellipse cx="126" cy="197" rx="17" ry="9" fill="${dark}"/>
    <rect x="56" y="126" width="88" height="66" rx="17" fill="${main}"/>
    <path d="M56 170 H144 V175 Q144 192 127 192 H73 Q56 192 56 175Z" fill="${dark}" opacity=".35"/>
    <polyline points="${zig}" fill="none" stroke="${skin}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
    ${Array.from({ length: 4 }, (_, i) => `<circle cx="${76 + i * 24}" cy="141" r="3.4" fill="${chrome}" stroke="${chromeDark}" stroke-width="1.2"/><circle cx="${64 + i * 24}" cy="177" r="3.4" fill="${chrome}" stroke="${chromeDark}" stroke-width="1.2"/>`).join('')}
    <rect x="51" y="122" width="98" height="12" rx="6" fill="${chrome}"/><rect x="51" y="122" width="98" height="5" rx="2.5" fill="#fff" opacity=".7"/><rect x="51" y="182" width="98" height="12" rx="6" fill="${chromeDark}"/><rect x="51" y="182" width="98" height="5" rx="2.5" fill="${chrome}"/>`;
  const lugs = Array.from({ length: 8 }, (_, i) => {
    const [x, y] = polar(100, HY, 47.5, i * 45);
    return `<rect x="-3.5" y="-5" width="7" height="10" rx="2.5" fill="${chrome}" stroke="${chromeDark}" stroke-width="1.2" transform="translate(${r1(x)} ${r1(y)}) rotate(${i * 45})"/>`;
  }).join('');
  const head = `<circle cx="100" cy="${HY}" r="50" fill="${main}" stroke="${dark}" stroke-width="3"/>
    <path d="M62 56 A47 47 0 0 1 98 37" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>
    <circle cx="100" cy="${HY}" r="44" fill="${skin}"/><circle cx="100" cy="${HY}" r="44" fill="none" stroke="#efd5ac" stroke-width="3"/>${lugs}`;
  return shell('', tail, body, '', head, '', growth);
};

// ---------------------------------------------------------------- trumpet
const TRUMPET = { main: '#ffc21a', dark: '#d98600', accent: '#ff3d7f' };
const trumpetSVG = (growth: number): string => {
  const { main, dark, accent } = TRUMPET;
  const light = mixHex(main, '#ffffff', 0.55);
  const silver = '#e6ecf4', silverDark = '#aab6c6';
  const defs = `<radialGradient id="music-trumpet-bell" cx="42%" cy="36%" r="75%"><stop offset="0" stop-color="#fffbe4"/><stop offset=".65" stop-color="#fff0b0"/><stop offset="1" stop-color="#ffe07a"/></radialGradient>`;
  // the bell flares into a long thin tube that runs right to a mouthpiece, then wraps back round in two nested loops (as a real trumpet does)
  const loop1 = 'M186 90 V124 Q186 152 160 152 H130';
  const loop2 = 'M170 90 V116 Q170 134 152 134 H130';
  const wrap = (d: string) => `<path d="${d}" stroke="${dark}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${main}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const tail = `<g class="tail">
    <path d="M100 31 L176 77 V91 L100 137Z" fill="${main}" stroke="${dark}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M132 50 L172 78" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/>
    ${wrap(loop1)}${wrap(loop2)}<path d="M181 98 V122" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>
    <rect x="168" y="76" width="30" height="16" rx="8" fill="${main}" stroke="${dark}" stroke-width="3.5"/><path d="M176 81 H192" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    <path d="M196 77 H200 Q205 84 200 91 H196Z" fill="${silver}" stroke="${silverDark}" stroke-width="2.2" stroke-linejoin="round"/></g>`;
  const valve = (x: number) => `<rect x="${x - 8}" y="148" width="16" height="40" rx="7" fill="${dark}"/><rect x="${x - 5.5}" y="151" width="4" height="34" rx="2" fill="#fff" opacity=".4"/><rect x="${x - 11}" y="141" width="22" height="9" rx="4.5" fill="${silver}" stroke="${silverDark}" stroke-width="1.8"/><rect x="${x - 3.5}" y="132" width="7" height="10" rx="2.5" fill="${silverDark}"/><circle cx="${x}" cy="131" r="6.4" fill="${accent}" stroke="#c4175a" stroke-width="1.6"/><circle cx="${x - 2}" cy="129" r="1.9" fill="#fff" opacity=".85"/>`;
  const body = `
    <ellipse cx="74" cy="198" rx="17" ry="9" fill="${dark}"/><ellipse cx="126" cy="198" rx="17" ry="9" fill="${dark}"/>
    <ellipse cx="100" cy="162" rx="52" ry="36" fill="${main}"/><ellipse cx="100" cy="172" rx="44" ry="25" fill="${light}"/>
    ${valve(70)}${valve(100)}${valve(130)}`;
  const head = `<ellipse cx="100" cy="${HY}" rx="50" ry="52" fill="${dark}"/><ellipse cx="100" cy="${HY}" rx="47" ry="49" fill="${main}"/>
    <path d="M60 52 A46 47 0 0 1 100 37" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>
    <ellipse cx="100" cy="${HY}" rx="43" ry="45" fill="url(#music-trumpet-bell)"/><ellipse cx="100" cy="${HY}" rx="43" ry="45" fill="none" stroke="#f0b400" stroke-width="2.6" opacity=".7"/>`;
  return shell(defs, tail, body, '', head, '', growth);
};

// ---------------------------------------------------------------- xylophone
const XYLO = { main: '#13b9ef', dark: '#0577a6', accent: '#ff7a1a' };
const BARS = ['#ff4d5e', '#ff9f1c', '#ffd91a', '#35d07f', '#a066ff'];
const xyloSVG = (growth: number): string => {
  const { main, dark } = XYLO;
  const panel = '#e6fafd';
  const wood = '#b9792f', woodLight = '#f4c682';
  const mallet = (x1: number, y1: number, x2: number, y2: number) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${wood}" stroke-width="7" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${woodLight}" stroke-width="3.6" stroke-linecap="round"/><circle cx="${x2 + (x2 > x1 ? 3 : -3)}" cy="${y2 - 5}" r="12" fill="#e0243a" stroke="#a8061c" stroke-width="2"/><ellipse cx="${x2 + (x2 > x1 ? 0 : -6)}" cy="${y2 - 10}" rx="4" ry="2.8" fill="#fff" opacity=".75"/>`;
  const tail = `<g class="tail">${mallet(142, 168, 182, 120)}</g>`;
  const bars = BARS.map((c, i) => {
    const w = 70 + i * 8; // wider towards the bottom
    const y = 132 + i * 12.4;
    return `<rect x="${r1(100 - w / 2)}" y="${r1(y)}" width="${w}" height="11" rx="5.5" fill="${c}"/><rect x="${r1(100 - w / 2 + 4)}" y="${r1(y + 1.8)}" width="${w - 8}" height="2.6" rx="1.3" fill="#fff" opacity=".4"/><circle cx="${r1(100 - w / 2 + 7)}" cy="${r1(y + 5.5)}" r="1.9" fill="#fff" opacity=".85"/><circle cx="${r1(100 + w / 2 - 7)}" cy="${r1(y + 5.5)}" r="1.9" fill="#fff" opacity=".85"/>`;
  }).join('');
  const body = `
    <ellipse cx="68" cy="198" rx="17" ry="9" fill="${dark}"/><ellipse cx="132" cy="198" rx="17" ry="9" fill="${dark}"/>
    <path d="M70 124 L130 124 L156 194 L44 194Z" fill="${dark}" stroke="${dark}" stroke-width="10" stroke-linejoin="round"/>
    <path d="M70 124 L130 124 L156 194 L44 194Z" fill="${main}" stroke="${main}" stroke-width="3" stroke-linejoin="round"/>
    ${bars}
    ${mallet(58, 168, 18, 120)}`;
  const head = `<rect x="49" y="36" width="102" height="100" rx="32" fill="${dark}"/><rect x="49" y="36" width="102" height="96" rx="32" fill="${main}"/>
    <rect x="72" y="38.5" width="18" height="5" rx="2.5" fill="#ff4d5e"/><rect x="91" y="38.5" width="18" height="5" rx="2.5" fill="#ffd91a"/><rect x="110" y="38.5" width="18" height="5" rx="2.5" fill="#35d07f"/>
    <path d="M56 62 Q56 48 68 46" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>
    <rect x="58" y="47" width="84" height="80" rx="24" fill="${panel}"/><rect x="58" y="47" width="84" height="80" rx="24" fill="none" stroke="#b4eaf5" stroke-width="2.5"/>`;
  return shell('', tail, body, '', head, '', growth);
};

// ---------------------------------------------------------------- maraca
const MARACA = { main: '#22c55e', dark: '#0b8a3a', accent: '#ff4f9a' };
const maracaSVG = (growth: number): string => {
  const { main, dark, accent } = MARACA;
  const gold = '#ffd23f';
  const defs = `<clipPath id="music-maraca-ball"><circle cx="100" cy="${HY}" r="51"/></clipPath><clipPath id="music-maraca-handle"><rect x="87" y="120" width="26" height="70" rx="9"/></clipPath>`;
  // two pink ribbons tied round the handle flutter as the tail
  const tail = `<g class="tail"><path d="M112 152 Q142 144 152 166" stroke="${accent}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M112 156 Q138 170 136 188" stroke="${gold}" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
  const bands = [['#f4b860', 0], [accent, 1], [gold, 2], ['#4fc3c8', 3], [accent, 4], [gold, 5]] as const;
  const body = `
    <ellipse cx="76" cy="199" rx="15" ry="8" fill="${dark}"/><ellipse cx="124" cy="199" rx="15" ry="8" fill="${dark}"/>
    <rect x="87" y="120" width="26" height="70" rx="9" fill="#f4b860"/>
    <g clip-path="url(#music-maraca-handle)">${bands.map(([c, i]) => `<rect x="80" y="${126 + i * 11}" width="40" height="${i % 2 ? 8 : 0}" fill="${c}"/>`).join('')}<rect x="90" y="124" width="5" height="64" rx="2.5" fill="#fff" opacity=".4"/></g>
    <rect x="87" y="120" width="26" height="70" rx="9" fill="none" stroke="#b9792f" stroke-width="2.6"/>
    <ellipse cx="100" cy="188" rx="21" ry="13" fill="${accent}" stroke="#c42a6e" stroke-width="2.6"/><ellipse cx="94" cy="184" rx="7" ry="3.5" fill="#fff" opacity=".5"/>`;
  const dotsTop = Array.from({ length: 7 }, (_, i) => `<circle cx="${52 + i * 16}" cy="${44 + (i % 2) * 3}" r="3.4" fill="#fff"/>`).join('');
  const dotsBot = Array.from({ length: 6 }, (_, i) => `<circle cx="${60 + i * 16}" cy="131" r="2.6" fill="${accent}"/>`).join('');
  const headBehind = `${sparkle(28, 44, 9, gold)}${sparkle(172, 38, 7.5, gold)}${sparkle(20, 104, 6, '#ff7ab0')}${sparkle(182, 100, 8, gold)}<circle cx="50" cy="22" r="3" fill="#ff7ab0"/><circle cx="150" cy="20" r="3.4" fill="#fff"/><circle cx="10" cy="64" r="3" fill="#fff"/><circle cx="192" cy="64" r="3" fill="#ff7ab0"/>`;
  const head = `<circle cx="100" cy="${HY}" r="53" fill="${dark}"/><circle cx="100" cy="${HY}" r="51" fill="${main}"/>
    <g clip-path="url(#music-maraca-ball)"><rect x="40" y="30" width="120" height="24" fill="${accent}"/>${dotsTop}<rect x="40" y="124" width="120" height="14" fill="${gold}"/>${dotsBot}<path d="M40 54 H160" stroke="#fff" stroke-width="3" opacity=".6"/></g>
    <path d="M58 52 A48 48 0 0 1 92 36" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>
    <ellipse cx="100" cy="89" rx="42" ry="37" fill="#effff4"/><ellipse cx="100" cy="89" rx="42" ry="37" fill="none" stroke="#b9efcb" stroke-width="2.5"/>`;
  return shell(defs, tail, body, headBehind, head, '', growth);
};

// ---------------------------------------------------------------- the pack
const creature = (id: string, label: string, c: { main: string; dark: string; accent: string }, svg: (g: number) => string): CreatureDef => ({
  id, label, ...c, hy: HY, svg, egg: () => musicCaseSVG(id, c.main, c.dark, c.accent),
});

export const pack: Pack = {
  id: 'music',
  name: 'Music Band',
  blurb: 'Instrument pals on a stage with curtains, spotlights and floating notes',
  arrival: 'instrument case',
  defaultName: 'Tune',
  creatures: [
    creature('music-drum', 'red drum case', DRUM, drumSVG),
    creature('music-trumpet', 'gold trumpet case', TRUMPET, trumpetSVG),
    creature('music-xylo', 'blue xylophone case', XYLO, xyloSVG),
    creature('music-maraca', 'green maraca case', MARACA, maracaSVG),
  ],
  scene: musicSceneSVG,
  island: musicIslandSVG,
};
