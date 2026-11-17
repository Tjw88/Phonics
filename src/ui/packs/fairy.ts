import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import { fairyBudSVG, fairyIslandSVG, fairySceneSVG } from './fairy-art';
import type { CreatureDef, Pack } from './types';

// Fairy Garden: four tiny garden friends (flower sprite, ladybird, hedgehog, firefly) among giant flowers and toadstool houses.
// Each follows the companion contract (see ../art.ts). Distinct silhouettes: the sprite has tall see-through wings and a petal collar,
// the ladybird a big round spotted shell and antennae, the hedgehog a spiky dome behind a pale face, the firefly a glowing belly in a soft halo.
// Everything decorative stays away from the eyes (y 67-93) and the shared mouth (hy + 22) so the face is always clean.

const HY = 84;
const SHADOW = `<ellipse cx="100" cy="202" rx="62" ry="9" fill="#0000001f"/>`;
const r1 = (n: number): string => n.toFixed(1);
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

/** assemble a creature: behind-everything layer, body, then the head group with the shared face on top. */
const shell = (behind: string, body: string, headBehind: string, head: string, nose: string, growth: number): string => `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  ${SHADOW}
  ${behind}
  <g class="bodyg">${body}</g>
  <g class="headg">
    ${headBehind}
    ${head}
    ${faceEyesSVG(HY)}
    ${nose}
    ${faceMouthSVG(HY)}
    ${accessorySVG(growth, HY)}
  </g>
  ${zzzSVG(HY)}
</svg>`;

// ---------------------------------------------------------------- flower sprite
const PETAL = { main: '#ff3fa4', dark: '#c4127a', accent: '#ffe14d' };
const petalSVG = (growth: number): string => {
  const { main, dark, accent } = PETAL;
  const light = mixHex(main, '#ffffff', 0.5);
  const mid = mixHex(main, '#ffffff', 0.25);
  const wingFill = '#eadfff', wingEdge = '#b79cf0';
  const wing = (cx: number, cy: number, rx: number, ry: number, rot: number, flip: boolean): string => {
    const t = flip ? `translate(200 0) scale(-1 1)` : '';
    return `<g transform="${t}"><g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${wingFill}" fill-opacity=".78" stroke="${wingEdge}" stroke-width="2.6"/>
      <path d="M${cx} ${cy + ry - 6} V${cy - ry + 8} M${cx} ${cy + 6} Q${cx - rx * 0.55} ${cy - 4} ${cx - rx * 0.7} ${cy - 14} M${cx} ${cy + 6} Q${cx + rx * 0.55} ${cy - 4} ${cx + rx * 0.7} ${cy - 14}" stroke="${wingEdge}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/>
      <ellipse cx="${cx - rx * 0.34}" cy="${cy - ry * 0.4}" rx="${rx * 0.2}" ry="${ry * 0.3}" fill="#fff" opacity=".7"/></g></g>`;
  };
  const wings = wing(46, 92, 24, 50, -34, false) + wing(46, 92, 24, 50, -34, true) + wing(36, 154, 16, 28, 30, false) + wing(36, 154, 16, 28, 30, true);
  const wand = `<g class="tail"><path d="M140 172 Q166 164 174 136" stroke="#8d6b3f" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M175 112 L179.5 123 L191 124.5 L182.5 132 L185 143 L175 137 L165 143 L167.5 132 L159 124.5 L170.5 123Z" fill="${accent}" stroke="#f0b400" stroke-width="2" stroke-linejoin="round"/><circle cx="175" cy="128" r="3.6" fill="#fff" opacity=".85"/></g>`;
  const behind = `${wings}${wand}`;
  const boot = (x: number): string => `<g transform="translate(${x} 196)"><ellipse cx="0" cy="0" rx="19" ry="9" fill="#4fc16a"/><path d="M-8 -2 Q0 -7 8 -2" stroke="#8fe39f" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  const body = `${boot(76)}${boot(124)}<ellipse cx="100" cy="154" rx="46" ry="40" fill="${main}"/><ellipse cx="100" cy="164" rx="28" ry="24" fill="${light}"/>
    <path d="M78 166 Q100 178 122 166" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".28"/>`;
  // a tuft of three petals on top and a collar of petals around the neck (both behind the head, clear of the eyes and mouth)
  const tuft = [-34, 0, 34].map((a) => `<g transform="rotate(${a} 100 50)"><ellipse cx="100" cy="28" rx="11" ry="24" fill="${a === 0 ? accent : light}"/><path d="M100 14 V40" stroke="${a === 0 ? '#f0b400' : mid}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/></g>`).join('');
  const collar = [0, 28, 56, 84, 112, 140, 168].map((a, i) => {
    const [x, y] = polar(100, HY, 46, a);
    return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${a})"><ellipse cx="0" cy="0" rx="22" ry="12" fill="${i % 2 ? light : mid}" stroke="${dark}" stroke-opacity=".25" stroke-width="2"/><path d="M-12 0 H12" stroke="${dark}" stroke-width="2" stroke-linecap="round" opacity=".25"/></g>`;
  }).join('');
  const head = `<circle cx="100" cy="${HY}" r="43" fill="${main}"/><ellipse cx="82" cy="52" rx="12" ry="6" fill="#fff" opacity=".35" transform="rotate(-24 82 52)"/>`;
  return shell(behind, body, `${tuft}${collar}`, head, '', growth);
};

// ---------------------------------------------------------------- ladybird
const LADYBIRD = { main: '#ff2a1f', dark: '#b30f12', accent: '#ffe14d' };
const INK = '#2a2233';
const ladybirdSVG = (growth: number): string => {
  const { main, dark } = LADYBIRD;
  const accent = INK;
  const spot = (x: number, y: number, r: number): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="${accent}"/>`;
  const antenna = (s: number): string => `<path d="M${100 + s * 12} 48 Q${100 + s * 20} 20 ${100 + s * 36} 10" stroke="${accent}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="${100 + s * 37}" cy="9" r="6" fill="${accent}"/>`;
  const behind = `<g class="tail">${antenna(-1)}${antenna(1)}</g>`;
  const leg = (s: number, y: number, dy: number): string => `<path d="M${100 + s * 50} ${y} Q${100 + s * 62} ${y + 2} ${100 + s * 66} ${y + dy}" stroke="${accent}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`;
  const foot = (x: number): string => `<ellipse cx="${x}" cy="196" rx="19" ry="8.5" fill="${accent}"/><ellipse cx="${x - 5}" cy="193" rx="6" ry="2.4" fill="#fff" opacity=".25"/>`;
  const body = `${leg(-1, 150, 8)}${leg(1, 150, 8)}${leg(-1, 170, 8)}${leg(1, 170, 8)}${foot(76)}${foot(124)}
    <ellipse cx="100" cy="152" rx="52" ry="44" fill="${accent}"/><ellipse cx="100" cy="164" rx="32" ry="26" fill="#fff0dc"/>
    <path d="M80 168 Q100 180 120 168" stroke="${accent}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".3"/>`;
  // the big round shell sits behind the head: a ring of red with black spots, kept clear of the face
  const shellArt = `<circle cx="100" cy="90" r="68" fill="${dark}"/><circle cx="100" cy="90" r="65" fill="${main}"/>
    <path d="M100 25 V50" stroke="${accent}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M58 46 A58 58 0 0 1 80 32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".4"/>
    ${spot(68, 42, 6.5)}${spot(132, 42, 6.5)}${spot(41, 76, 9)}${spot(159, 76, 9)}${spot(42, 112, 7.5)}${spot(158, 112, 7.5)}${spot(60, 138, 6)}${spot(140, 138, 6)}`;
  // a black head with a pale cream face patch (it holds the shared eyes, cheeks and mouth)
  const head = `<circle cx="100" cy="${HY}" r="43" fill="${accent}"/><ellipse cx="100" cy="${HY + 5}" rx="37" ry="33" fill="#ffecd2"/><ellipse cx="78" cy="56" rx="12" ry="5" fill="#fff" opacity=".18" transform="rotate(-24 78 56)"/>`;
  return shell(behind, body, shellArt, head, '', growth);
};

// ---------------------------------------------------------------- hedgehog
const HEDGEHOG = { main: '#a65bd6', dark: '#5f2f86', accent: '#ffd166' };
const hedgehogSVG = (growth: number): string => {
  const { main, dark } = HEDGEHOG;
  const face = '#ffe4d2';
  const skin = '#f6cbb0';
  const spikeRing = (cx: number, cy: number, rIn: number, rOut: number, n: number, off: number, fill: string): string => {
    let o = '';
    const step = 360 / n;
    for (let i = 0; i < n; i++) {
      const a = off + i * step;
      const [x0, y0] = polar(cx, cy, rIn, a - step * 0.7);
      const [x1, y1] = polar(cx, cy, rOut, a);
      const [x2, y2] = polar(cx, cy, rIn, a + step * 0.7);
      o += `<path d="M${r1(x0)} ${r1(y0)} L${r1(x1)} ${r1(y1)} L${r1(x2)} ${r1(y2)}Z"/>`;
    }
    return `<g fill="${fill}" stroke="${fill}" stroke-width="8" stroke-linejoin="round">${o}</g>`;
  };
  const behind = `${spikeRing(100, 104, 50, 82, 20, 0, dark)}${spikeRing(100, 104, 50, 72, 20, 9, main)}<circle cx="100" cy="104" r="58" fill="${main}"/>`;
  const foot = (x: number): string => `<g transform="translate(${x} 196)"><ellipse cx="0" cy="0" rx="19" ry="9" fill="${skin}"/><path d="M-7 -1 v5 M0 -2 v6 M7 -1 v5" stroke="${mixHex(skin, '#a05a3a', 0.5)}" stroke-width="2.4" stroke-linecap="round"/></g>`;
  const hand = (s: number): string => `<ellipse cx="${100 + s * 52}" cy="158" rx="9" ry="12" fill="${skin}" transform="rotate(${s * -22} ${100 + s * 52} 158)"/>`;
  const body = `${foot(76)}${foot(124)}<ellipse cx="100" cy="152" rx="52" ry="44" fill="${mixHex(main, dark, 0.25)}"/>${hand(-1)}${hand(1)}<ellipse cx="100" cy="162" rx="33" ry="29" fill="${face}"/>`;
  const ears = [-1, 1].map((s) => `<circle cx="${100 + s * 40}" cy="50" r="13" fill="${skin}"/><circle cx="${100 + s * 40}" cy="51" r="7" fill="#ff9bb5"/>`).join('');
  // pale round face with a spiky fringe of quills across the top only (it stops well above the eyes)
  const fringe = `<clipPath id="fairy-hedgehog-clip"><circle cx="100" cy="${HY}" r="43"/></clipPath>
    <g clip-path="url(#fairy-hedgehog-clip)"><path d="M50 36 H150 V50 L141 61 L131 49 L120 61 L110 48 L100 61 L90 48 L80 61 L69 49 L59 61 L50 50Z" fill="${main}" stroke="${main}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M50 36 H150 V44 L141 53 L131 42 L120 53 L110 41 L100 53 L90 41 L80 53 L69 42 L59 53 L50 44Z" fill="${dark}" stroke="${dark}" stroke-width="6" stroke-linejoin="round"/></g>`;
  const head = `<circle cx="100" cy="${HY}" r="43" fill="${face}"/>${fringe}`;
  const nose = `<ellipse cx="100" cy="95" rx="6.2" ry="4.6" fill="#4a2a3c"/><ellipse cx="98" cy="93.4" rx="2" ry="1.2" fill="#fff" opacity=".6"/>`;
  return shell(behind, body, ears, head, nose, growth);
};

// ---------------------------------------------------------------- firefly
const GLOW = { main: '#d3ee1c', dark: '#7f9a00', accent: '#fff59a' };
const glowSVG = (growth: number): string => {
  const { main, dark, accent } = GLOW;
  const wingFill = '#fffbd0';
  const wing = (flip: boolean): string => `<g transform="${flip ? 'translate(200 0) scale(-1 1)' : ''}"><g transform="rotate(-62 52 128)"><ellipse cx="52" cy="128" rx="17" ry="36" fill="${wingFill}" fill-opacity=".8" stroke="#e5d65a" stroke-width="2.4"/><path d="M52 98 V152" stroke="#e5d65a" stroke-width="1.8" stroke-linecap="round" opacity=".7"/><ellipse cx="46" cy="114" rx="4" ry="10" fill="#fff" opacity=".8"/></g></g>`;
  const antenna = (s: number): string => `<path d="M${100 + s * 14} 47 Q${100 + s * 18} 24 ${100 + s * 34} 16" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="${100 + s * 35}" cy="15" r="7" fill="${accent}"/><circle cx="${100 + s * 35}" cy="15" r="3" fill="#fff"/>`;
  const behind = `<circle cx="100" cy="124" r="96" fill="url(#fairy-glow-halo)"/>${wing(false)}${wing(true)}<g class="tail">${antenna(-1)}${antenna(1)}</g>`;
  const foot = (x: number): string => `<ellipse cx="${x}" cy="196" rx="17" ry="8" fill="${dark}"/>`;
  const body = `<defs><radialGradient id="fairy-glow-halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff7a8" stop-opacity=".95"/><stop offset=".55" stop-color="#f6f06a" stop-opacity=".45"/><stop offset="1" stop-color="#e6ff6a" stop-opacity="0"/></radialGradient>
    <radialGradient id="fairy-glow-belly" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="${accent}"/><stop offset="1" stop-color="#ffe14a"/></radialGradient></defs>
    ${foot(78)}${foot(122)}<ellipse cx="100" cy="152" rx="50" ry="44" fill="${main}"/>
    <path d="M56 140 Q66 128 80 130 M144 140 Q134 128 120 130" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>
    <circle cx="100" cy="166" r="30" fill="#fff59a" fill-opacity=".55"/><circle cx="100" cy="166" r="25" fill="url(#fairy-glow-belly)"/><ellipse cx="91" cy="157" rx="6" ry="4" fill="#fff" opacity=".85" transform="rotate(-30 91 157)"/>`;
  const head = `<circle cx="100" cy="${HY}" r="42" fill="${main}"/><ellipse cx="80" cy="55" rx="12" ry="6" fill="#fff" opacity=".4" transform="rotate(-24 80 55)"/>`;
  return shell(behind, body, '', head, '', growth);
};

// ---------------------------------------------------------------- the pack
const creature = (id: string, label: string, c: { main: string; dark: string; accent: string }, svg: (g: number) => string): CreatureDef => ({
  id, label, ...c, hy: HY, svg, egg: () => fairyBudSVG(id, c.main, c.dark, c.accent),
});

export const pack: Pack = {
  id: 'fairy',
  name: 'Fairy Garden',
  blurb: 'Tiny garden friends among giant flowers, mushrooms and dewdrops',
  arrival: 'flower bud',
  defaultName: 'Petal',
  creatures: [
    creature('fairy-ladybird', 'red ladybird bud', LADYBIRD, ladybirdSVG),
    creature('fairy-hedgehog', 'purple hedgehog bud', HEDGEHOG, hedgehogSVG),
    creature('fairy-glow', 'yellow firefly bud', GLOW, glowSVG),
    creature('fairy-petal', 'pink flower sprite bud', PETAL, petalSVG),
  ],
  scene: fairySceneSVG,
  island: fairyIslandSVG,
};
