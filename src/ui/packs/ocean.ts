import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import { oceanIsland, oceanScene } from './ocean-art';
import type { CreatureDef, Pack } from './types';

/**
 * Ocean Reef: four chubby baby sea creatures (whale, jellyfish, turtle, crab) on a sunny coral reef.
 * Each is its own body shape under the shared face (see THE COMPANION CONTRACT in ../art.ts); all ids are prefixed "ocean-".
 */

const HY = 84;

/** Wrap a creature: body parts first (behind), then the bobbing head group with the shared face and accessory. */
const wrap = (behind: string, head: string, growth: number, hy = HY): string => `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  ${behind}
  <g class="headg">
    ${head}
    <circle cx="66" cy="${hy + 14}" r="10" fill="#ffc2cd"/><circle cx="134" cy="${hy + 14}" r="10" fill="#ffc2cd"/>
    ${faceEyesSVG(hy)}
    ${faceMouthSVG(hy)}
    ${accessorySVG(growth, hy)}
  </g>
  ${zzzSVG(hy)}
</svg>`;
const shadow = (rx = 62) => `<ellipse cx="100" cy="202" rx="${rx}" ry="9" fill="#0000001f"/>`;

// ---------------------------------------------------------------- whale: blue, pale belly, a fluke for a tail
const WHALE = { main: '#1f8bff', dark: '#0a55c8', accent: '#9be7ff', belly: '#e6f5ff' };
const whaleSVG = (growth: number): string => {
  const { main, dark, belly, accent } = WHALE;
  const groove = mixHex(belly, main, 0.35);
  const behind = `${shadow()}
  <g class="tail">
    <path d="M130 172 C156 176 166 158 166 130 L178 130 C184 172 158 196 124 188Z" fill="${main}"/>
    <path d="M172 144 C157 144 145 130 143 104 C158 104 168 112 172 124 C176 112 186 104 201 104 C199 130 187 144 172 144Z" fill="${dark}"/>
    <path d="M150 110 C158 111 166 116 170 124" stroke="${accent}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
  </g>
  <g class="bodyg">
    <ellipse cx="100" cy="150" rx="62" ry="47" fill="${main}"/>
    <ellipse cx="100" cy="164" rx="45" ry="30" fill="${belly}"/>
    <path d="M72 158 Q100 168 128 158 M68 169 Q100 180 132 169 M76 180 Q100 188 124 180" stroke="${groove}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="40" cy="160" rx="19" ry="9.5" fill="${dark}" transform="rotate(-32 40 160)"/>
    <ellipse cx="160" cy="160" rx="19" ry="9.5" fill="${dark}" transform="rotate(32 160 160)"/>
  </g>`;
  const head = `<circle cx="100" cy="${HY}" r="44" fill="${main}"/>
    <ellipse cx="66" cy="${HY - 28}" rx="11" ry="6" fill="#fff" opacity=".35" transform="rotate(-38 66 ${HY - 28})"/>`;
  return wrap(behind, head, growth);
};

// ---------------------------------------------------------------- jellyfish: pink-purple dome head, wavy tentacles
const JELLY = { main: '#e254f0', dark: '#a22bb8', accent: '#ffe27a' };
const jellySVG = (growth: number): string => {
  const { main, dark, accent } = JELLY;
  const light = mixHex(main, '#ffffff', 0.4);
  const arm = mixHex(main, dark, 0.45);
  const wave = (x: number, w: number, stroke: string, extra = '') => `<path ${extra} d="M${x} 130 q-9 12 0 24 t0 24 t0 24" stroke="${stroke}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const frill = Array.from({ length: 7 }, (_, i) => `<circle cx="${(54 + i * 15.33).toFixed(1)}" cy="127" r="11.5"/>`).join('');
  const behind = `<ellipse cx="100" cy="204" rx="40" ry="6" fill="#0000001a"/>
  <g class="bodyg">
    ${wave(66, 7, light)}${wave(83, 7, light)}${wave(117, 7, light)}
    <g class="tail">${wave(134, 7, light)}<path d="M120 132 q10 14 0 28 t0 28 t0 20" stroke="${light}" stroke-width="7" fill="none" stroke-linecap="round"/></g>
    <path d="M93 132 q-9 14 0 28 t0 28 t0 14" stroke="${arm}" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M107 132 q9 14 0 28 t0 28 t0 14" stroke="${arm}" stroke-width="11" fill="none" stroke-linecap="round"/>
    <g fill="${dark}">${frill}</g>
  </g>`;
  const head = `<path d="M49 128 C42 70 62 36 100 36 C138 36 158 70 151 128Z" fill="${main}"/>
    <ellipse cx="68" cy="58" rx="12" ry="6" fill="#fff" opacity=".4" transform="rotate(-42 68 58)"/>
    <circle cx="86" cy="50" r="4" fill="${accent}"/><circle cx="104" cy="46" r="3.2" fill="${accent}"/><circle cx="122" cy="52" r="4.2" fill="${accent}"/><circle cx="100" cy="58" r="2.6" fill="${accent}"/>`;
  return wrap(behind, head, growth);
};

// ---------------------------------------------------------------- turtle: green, patterned shell behind the head, flippers
const TURTLE = { main: '#22c55e', dark: '#0d7a3b', accent: '#ffd54a' };
const hex = (cx: number, cy: number, r: number): string =>
  `<polygon points="${Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i + Math.PI / 6; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(' ')}"/>`;
const turtleSVG = (growth: number): string => {
  const { main, dark, accent } = TURTLE;
  const id = 'ocean-turtle';
  const plate = mixHex(main, '#ffffff', 0.18);
  const shell = mixHex(dark, main, 0.25);
  const flip = mixHex(main, '#000000', 0.04);
  const behind = `${shadow()}
  <path class="tail" d="M152 182 Q184 180 188 196 Q168 200 148 194Z" fill="${main}"/>
  <ellipse cx="22" cy="150" rx="22" ry="10.5" fill="${dark}" transform="rotate(-38 22 150)"/>
  <ellipse cx="178" cy="150" rx="22" ry="10.5" fill="${dark}" transform="rotate(38 178 150)"/>
  <ellipse cx="22" cy="148" rx="20" ry="9" fill="${flip}" transform="rotate(-38 22 148)"/>
  <ellipse cx="178" cy="148" rx="20" ry="9" fill="${flip}" transform="rotate(38 178 148)"/>
  <g class="bodyg">
    <defs><clipPath id="${id}-clip"><ellipse cx="100" cy="128" rx="76" ry="68"/></clipPath></defs>
    <ellipse cx="100" cy="128" rx="76" ry="68" fill="${shell}"/>
    <g clip-path="url(#${id}-clip)">
      <g fill="${plate}">${hex(100, 150, 20)}${hex(60, 158, 17)}${hex(140, 158, 17)}${hex(80, 188, 15)}${hex(120, 188, 15)}${hex(38, 122, 14)}${hex(162, 122, 14)}${hex(30, 160, 11)}${hex(170, 160, 11)}${hex(50, 94, 11)}${hex(150, 94, 11)}</g>
      <g fill="${accent}" opacity=".9"><circle cx="100" cy="150" r="4"/><circle cx="60" cy="158" r="3.2"/><circle cx="140" cy="158" r="3.2"/><circle cx="38" cy="122" r="3"/><circle cx="162" cy="122" r="3"/></g>
    </g>
    <path d="M26 138 Q26 196 100 196 Q174 196 174 138" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" opacity=".9"/>
  </g>
  <ellipse cx="64" cy="198" rx="19" ry="9" fill="${main}"/><ellipse cx="136" cy="198" rx="19" ry="9" fill="${main}"/>
  <ellipse cx="64" cy="200" rx="19" ry="7" fill="${dark}" opacity=".3"/><ellipse cx="136" cy="200" rx="19" ry="7" fill="${dark}" opacity=".3"/>`;
  const head = `<circle cx="100" cy="${HY}" r="42" fill="${main}"/>
    <ellipse cx="68" cy="${HY - 26}" rx="10" ry="5.5" fill="#fff" opacity=".35" transform="rotate(-38 68 ${HY - 26})"/>`;
  return wrap(behind, head, growth);
};

// ---------------------------------------------------------------- crab: orange-red, two raised claws, little legs
const CRAB = { main: '#ff5a1f', dark: '#bf2d0a', accent: '#ffd166' };
const crabSVG = (growth: number): string => {
  const { main, dark } = CRAB;
  const body = mixHex(main, dark, 0.35);
  const belly = mixHex(main, '#ffffff', 0.5);
  const p = (cx: number, cy: number, r: number, deg: number) => `${(cx + r * Math.cos((deg * Math.PI) / 180)).toFixed(1)} ${(cy + r * Math.sin((deg * Math.PI) / 180)).toFixed(1)}`;
  // a pincer: a round blob with a wedge cut out of the top
  const claw = (cx: number, cy: number, lean: number) => {
    const d = `M${cx} ${cy} L${p(cx, cy, 21, lean + 28)} A21 21 0 1 1 ${p(cx, cy, 21, lean - 28)}Z`;
    return `<path d="${d}" fill="${dark}" transform="translate(0 3)" stroke="${dark}" stroke-width="5" stroke-linejoin="round"/><path d="${d}" fill="${main}" stroke="${main}" stroke-width="5" stroke-linejoin="round"/>
      <ellipse cx="${cx - 7}" cy="${cy + 2}" rx="4" ry="7" fill="#fff" opacity=".4"/>`;
  };
  const legs = (s: 1 | -1) => [[146, 22, 160], [164, 20, 180], [180, 18, 198]].map(([y, dx, ey], i) =>
    `<path d="M${100 + s * (52 - i * 2)} ${y} Q${100 + s * (56 + (dx as number))} ${(y as number) - 4} ${100 + s * (60 + (dx as number))} ${ey}" stroke="${dark}" stroke-width="9" fill="none" stroke-linecap="round"/>`).join('');
  const behind = `${shadow()}
  <g class="tail">
    <path d="M148 142 Q180 128 172 88" stroke="${dark}" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M148 142 Q180 128 172 88" stroke="${main}" stroke-width="12" fill="none" stroke-linecap="round"/>
    ${claw(172, 70, -102)}
  </g>
  <g class="bodyg">${legs(-1)}${legs(1)}
    <path d="M52 142 Q20 128 28 88" stroke="${dark}" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M52 142 Q20 128 28 88" stroke="${main}" stroke-width="12" fill="none" stroke-linecap="round"/>
    ${claw(28, 70, -78)}
    <ellipse cx="100" cy="150" rx="66" ry="43" fill="${body}"/>
    <ellipse cx="100" cy="164" rx="42" ry="24" fill="${belly}"/>
    <circle cx="58" cy="156" r="5" fill="${dark}" opacity=".4"/><circle cx="142" cy="156" r="5" fill="${dark}" opacity=".4"/><circle cx="48" cy="170" r="3.5" fill="${dark}" opacity=".4"/><circle cx="152" cy="170" r="3.5" fill="${dark}" opacity=".4"/>
  </g>`;
  const head = `<circle cx="100" cy="${HY}" r="44" fill="${main}"/>
    <ellipse cx="66" cy="${HY - 28}" rx="11" ry="6" fill="#fff" opacity=".35" transform="rotate(-38 66 ${HY - 28})"/>`;
  return wrap(behind, head, growth);
};

// ---------------------------------------------------------------- arrival: an egg cradled in an open clam shell
const clamEgg = (id: string, main: string, dark: string, accent: string): string => {
  const light = mixHex(main, '#ffffff', 0.6);
  const lid = mixHex(main, '#ffffff', 0.74);
  const rib = mixHex(main, '#ffffff', 0.4);
  const cup = mixHex(main, '#ffffff', 0.7);
  const fan = (cx: number, cy: number, n: number, r0: number, r1: number, a0: number, a1: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = ((a0 + ((a1 - a0) * i) / (n - 1)) * Math.PI) / 180;
      return `M${(cx + r0 * Math.cos(a)).toFixed(1)} ${(cy + r0 * Math.sin(a)).toFixed(1)} L${(cx + r1 * Math.cos(a)).toFixed(1)} ${(cy + r1 * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs><radialGradient id="${id}-egg" cx="34%" cy="28%" r="80%"><stop offset="0" stop-color="${light}"/><stop offset="0.45" stop-color="${main}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>
  <ellipse cx="60" cy="143" rx="46" ry="6.5" fill="#0000002b"/>
  <path d="M60 138 L10 100 Q-2 62 20 46 Q38 32 60 36 Q82 32 100 46 Q122 62 110 100Z" fill="${lid}" stroke="${rib}" stroke-width="3" stroke-linejoin="round"/>
  <path d="${fan(60, 138, 7, 40, 66, -152, -28)}" stroke="${rib}" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M60 22 C90 22 98 70 98 86 C98 108 82 120 60 120 C38 120 22 108 22 86 C22 70 30 22 60 22Z" fill="url(#${id}-egg)"/>
  <ellipse cx="44" cy="52" rx="9" ry="16" fill="#fff" opacity=".6" transform="rotate(22 44 52)"/><ellipse cx="38" cy="72" rx="3.2" ry="5" fill="#fff" opacity=".75"/>
  <circle cx="76" cy="86" r="5" fill="${accent}" opacity=".9"/><circle cx="52" cy="98" r="3.5" fill="#fff" opacity=".7"/><circle cx="68" cy="64" r="3" fill="#fff" opacity=".65"/>
  <path d="M10 104 Q60 92 110 104 Q114 140 60 142 Q6 140 10 104Z" fill="${cup}" stroke="${rib}" stroke-width="3" stroke-linejoin="round"/>
  <path d="${fan(60, 146, 7, 14, 40, -166, -14)}" stroke="${rib}" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M96 22 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" fill="#fff" opacity=".95"/>
  <circle cx="14" cy="40" r="5" fill="none" stroke="#fff" stroke-width="2.4" opacity=".85"/><circle cx="24" cy="22" r="3" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>
</svg>`;
};

const make = (id: string, label: string, c: { main: string; dark: string; accent: string }, svg: (g: number) => string): CreatureDef => ({
  id, label, main: c.main, dark: c.dark, accent: c.accent, hy: HY, svg,
  egg: () => clamEgg(id, c.main, c.dark, c.accent),
});

export const pack: Pack = {
  id: 'ocean',
  name: 'Ocean Reef',
  blurb: 'Baby sea creatures on a sunny coral reef',
  arrival: 'egg',
  defaultName: 'Splash',
  creatures: [
    make('ocean-whale', 'blue whale egg', WHALE, whaleSVG),
    make('ocean-jelly', 'pink jellyfish egg', JELLY, jellySVG),
    make('ocean-turtle', 'green turtle egg', TURTLE, turtleSVG),
    make('ocean-crab', 'orange crab egg', CRAB, crabSVG),
  ],
  scene: oceanScene,
  island: oceanIsland,
};
