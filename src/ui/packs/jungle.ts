import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import { jungleEggSVG, jungleIslandSVG, jungleSceneSVG } from './jungle-art';
import type { CreatureDef, Pack } from './types';

// Jungle Safari: four chubby baby jungle animals (monkey, elephant, tiger, parrot) among vines, a waterfall and a rope bridge.
// Each follows the companion contract (see ../art.ts). Distinct silhouettes: the monkey has round side ears and a curly tail, the
// elephant has huge round ears and a short trunk, the tiger has rounded top ears, cheek ruffs and a striped tail, the parrot has a head
// tuft, folded wings and a long tail feather. Noses and beaks sit above y = hy + 14 so the shared mouth (hy + 22) and the feeding
// drop target stay clear; stripes and patches stay off the eye and cheek areas.

const HY = 84;
const SHADOW = `<ellipse cx="100" cy="202" rx="62" ry="9" fill="#0000001f"/>`;

/** assemble a creature: tail and body first, then the head group with the shared face on top. */
const shell = (tail: string, body: string, headBehind: string, head: string, nose: string, growth: number): string => `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  ${SHADOW}
  ${tail}
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

// ---------------------------------------------------------------- monkey: chestnut-gold, cream face heart, round ears, curly tail
const MONKEY = { main: '#d9861c', dark: '#8f4f0c', accent: '#ffd89a' };
const monkeySVG = (growth: number): string => {
  const { main, dark } = MONKEY;
  const cream = '#ffe3b3';
  const creamD = '#f3c98a';
  const pad = '#f7b3a0';
  const tail = `<g class="tail"><path d="M142 176 Q194 190 192 148 Q190 120 168 128 Q156 134 164 148" fill="none" stroke="${dark}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M142 176 Q194 190 192 148 Q190 120 168 128 Q156 134 164 148" fill="none" stroke="${main}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M150 174 Q184 182 188 156" fill="none" stroke="#ffffff55" stroke-width="3" stroke-linecap="round"/></g>`;
  const foot = (x: number) => `<ellipse cx="${x}" cy="195" rx="22" ry="10.5" fill="${dark}"/><ellipse cx="${x}" cy="196" rx="14" ry="6" fill="${cream}"/><path d="M${x - 8} 193 v6 M${x} 192 v8 M${x + 8} 193 v6" stroke="${creamD}" stroke-width="2.4" stroke-linecap="round"/>`;
  const arm = (s: number) => `<g transform="${s > 0 ? 'matrix(-1 0 0 1 200 0)' : ''}"><ellipse cx="48" cy="152" rx="14" ry="28" fill="${main}" transform="rotate(16 48 152)"/><circle cx="42" cy="176" r="12" fill="${cream}"/><path d="M36 180 v-5 M42 182 v-6 M48 180 v-5" stroke="${creamD}" stroke-width="2.2" stroke-linecap="round"/></g>`;
  const body = `${foot(74)}${foot(126)}<ellipse cx="100" cy="150" rx="53" ry="46" fill="${main}"/><ellipse cx="100" cy="161" rx="33" ry="29" fill="${cream}"/>${arm(-1)}${arm(1)}`;
  const ear = (s: number) => `<g transform="${s > 0 ? 'matrix(-1 0 0 1 200 0)' : ''}"><circle cx="54" cy="86" r="17" fill="${main}"/><circle cx="55" cy="87" r="10.5" fill="${pad}"/></g>`;
  const headBehind = `${ear(-1)}${ear(1)}`;
  const head = `<circle cx="100" cy="${HY}" r="43" fill="${main}"/>
    <path d="M86 46 Q92 30 106 32 Q116 36 108 46 Q102 40 98 44 Q94 46 86 46Z" fill="${dark}"/>
    <g fill="${cream}"><circle cx="81" cy="86" r="22"/><circle cx="119" cy="86" r="22"/><ellipse cx="100" cy="105" rx="28" ry="20"/></g>`;
  const nose = `<ellipse cx="95" cy="97" rx="2.2" ry="2.8" fill="${dark}" opacity=".7"/><ellipse cx="105" cy="97" rx="2.2" ry="2.8" fill="${dark}" opacity=".7"/>`;
  return shell(tail, body, headBehind, head, nose, growth);
};

// ---------------------------------------------------------------- elephant calf: blue-lavender, huge ears, short trunk, pale belly
const ELEPHANT = { main: '#8e92e6', dark: '#5559b8', accent: '#ffc83d' };
const elephantSVG = (growth: number): string => {
  const { main, dark } = ELEPHANT;
  const belly = mixHex(main, '#ffffff', 0.55);
  const earOut = mixHex(main, dark, 0.45);
  const earIn = '#ffb6d6';
  const trunkC = mixHex(main, '#ffffff', 0.3);
  const tail = `<g class="tail"><path d="M148 172 Q172 178 176 158" stroke="${dark}" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="177" cy="152" rx="6.5" ry="10" fill="${dark}" transform="rotate(10 177 152)"/></g>`;
  const foot = (x: number) => `<ellipse cx="${x}" cy="193" rx="24" ry="12" fill="${dark}"/><g fill="#eef0ff"><ellipse cx="${x - 12}" cy="198" rx="4.2" ry="3.2"/><ellipse cx="${x}" cy="200" rx="4.2" ry="3.2"/><ellipse cx="${x + 12}" cy="198" rx="4.2" ry="3.2"/></g>`;
  const body = `${foot(72)}${foot(128)}<ellipse cx="100" cy="150" rx="57" ry="47" fill="${main}"/><ellipse cx="100" cy="162" rx="35" ry="29" fill="${belly}"/>`;
  const ear = (s: number) => `<g transform="${s > 0 ? 'matrix(-1 0 0 1 200 0)' : ''}"><path d="M70 62 C40 42 8 54 8 88 C8 120 36 134 60 116 C74 106 76 80 70 62Z" fill="${earOut}"/><path d="M66 74 C46 62 24 70 24 90 C24 108 42 116 56 106 C66 98 68 86 66 74Z" fill="${earIn}"/><path d="M30 80 Q36 72 46 72" stroke="#ffffff88" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  const headBehind = `${ear(-1)}${ear(1)}`;
  const head = `<ellipse cx="100" cy="${HY}" rx="45" ry="42" fill="${main}"/><ellipse cx="82" cy="52" rx="14" ry="6" fill="#ffffff44" transform="rotate(-20 82 52)"/>`;
  // a real trunk: it starts between the eyes and swings down past the right cheek, curling up beside (never over) the mouth at (100, hy + 22)
  const tr = 'M100 62 C100 84 102 92 114 100 C130 110 140 122 132 132 C127 138 120 134 123 127';
  const trunk = `<path d="${tr}" fill="none" stroke="${mixHex(dark, '#000000', 0.1)}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
    <path d="${tr}" fill="none" stroke="${trunkC}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M97 66 C97 82 99 90 108 97" fill="none" stroke="#ffffff66" stroke-width="3" stroke-linecap="round"/>
    <path d="M122 106 q6 -3 10 3 M130 116 q6 -2 9 4" stroke="${dark}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".5"/>
    <ellipse cx="122" cy="127" rx="2.2" ry="1.8" fill="${dark}"/>`;
  return shell(tail, body, headBehind, head, trunk, growth);
};

// ---------------------------------------------------------------- tiger cub: vivid orange, dark stripes, rounded ears, cheek ruffs, striped tail
const TIGER = { main: '#ff7a14', dark: '#bd4a00', accent: '#ffe7c2' };
const tigerSVG = (growth: number): string => {
  const { main, dark } = TIGER;
  const stripe = '#5b2a0b';
  const cream = '#fff0d8';
  const tailD = 'M146 176 Q190 188 190 150 Q190 128 174 118';
  const tail = `<g class="tail"><path d="${tailD}" fill="none" stroke="${dark}" stroke-width="18" stroke-linecap="round"/><path d="${tailD}" fill="none" stroke="${main}" stroke-width="13" stroke-linecap="round"/>
    <path d="${tailD}" fill="none" stroke="${stripe}" stroke-width="13" stroke-dasharray="5 15" stroke-dashoffset="-12"/><circle cx="174" cy="118" r="7.5" fill="${stripe}"/></g>`;
  const foot = (x: number) => `<ellipse cx="${x}" cy="195" rx="22" ry="10.5" fill="${main}"/><ellipse cx="${x}" cy="199" rx="22" ry="7" fill="${dark}" opacity=".35"/><path d="M${x - 8} 192 v7 M${x} 191 v9 M${x + 8} 192 v7" stroke="${stripe}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`;
  const flank = (s: number) => `<g transform="${s > 0 ? 'matrix(-1 0 0 1 200 0)' : ''}" fill="none" stroke="${stripe}" stroke-width="5.5" stroke-linecap="round"><path d="M48 128 q12 3 17 13"/><path d="M45 148 q14 2 20 12"/><path d="M52 168 q12 0 18 8"/></g>`;
  const body = `${foot(72)}${foot(128)}<ellipse cx="100" cy="150" rx="55" ry="46" fill="${main}"/><ellipse cx="100" cy="162" rx="33" ry="29" fill="${cream}"/>${flank(-1)}${flank(1)}`;
  const ear = (s: number) => `<g transform="${s > 0 ? 'matrix(-1 0 0 1 200 0)' : ''}"><circle cx="63" cy="49" r="18" fill="${main}"/><circle cx="63" cy="50" r="10.5" fill="${cream}"/><circle cx="63" cy="50" r="10.5" fill="${dark}" opacity=".25"/></g>`;
  const headBehind = `${ear(-1)}${ear(1)}`;
  const ruff = (s: number) => `<g transform="${s > 0 ? 'matrix(-1 0 0 1 200 0)' : ''}" fill="${cream}"><path d="M60 88 Q42 90 40 102 Q46 100 48 106 Q50 112 58 110 Q60 116 70 114 Q76 104 72 94Z"/></g>`;
  const head = `<clipPath id="jungle-tiger-hc"><ellipse cx="100" cy="${HY}" rx="45" ry="41"/></clipPath>
    ${ruff(-1)}${ruff(1)}
    <ellipse cx="100" cy="${HY}" rx="45" ry="41" fill="${main}"/>
    <g clip-path="url(#jungle-tiger-hc)" fill="${stripe}">
      <path d="M95 40 L105 40 L102 62 Q100 64 98 62Z"/><path d="M76 42 L86 40 L88 56 Q85 57 83 54Z"/><path d="M124 42 L114 40 L112 56 Q115 57 117 54Z"/>
      <path d="M52 60 L67 63.5 L52 68Z"/><path d="M148 60 L133 63.5 L148 68Z"/><path d="M50 75 L63 78 L50 82Z"/><path d="M150 75 L137 78 L150 82Z"/>
    </g>
    <ellipse cx="100" cy="105" rx="24" ry="15" fill="${cream}"/>`;
  const nose = `<path d="M93 90.5 Q100 87.5 107 90.5 Q104 98 100 98 Q96 98 93 90.5Z" fill="#e0627a"/><ellipse cx="97" cy="91" rx="2.2" ry="1" fill="#ffffff88"/>`;
  return shell(tail, body, headBehind, head, nose, growth);
};

// ---------------------------------------------------------------- parrot chick: emerald, red head tuft, wings, a long tail feather
const PARROT = { main: '#17b86c', dark: '#0a7a46', accent: '#ff3a3a' };
const parrotSVG = (growth: number): string => {
  const { main, dark, accent } = PARROT;
  const belly = '#b7f2c3';
  const gold = '#ffcb3d';
  const tail = `<g class="tail"><path d="M128 176 Q170 176 196 206 Q156 210 124 192Z" fill="#1c9ed6"/><path d="M128 172 Q166 166 194 190 Q158 198 126 186Z" fill="${accent}"/><path d="M130 178 Q164 176 190 190" stroke="#ffffff77" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M178 184 Q188 186 194 190 Q186 196 176 196Z" fill="${gold}"/></g>`;
  const toes = (x: number) => `<ellipse cx="${x}" cy="198" rx="15" ry="6.5" fill="${gold}"/><path d="M${x - 8} 196 v6 M${x} 195 v8 M${x + 8} 196 v6" stroke="#d18a00" stroke-width="2.2" stroke-linecap="round"/>`;
  const wing = (s: number) => `<g transform="${s > 0 ? 'matrix(-1 0 0 1 200 0)' : ''}"><path d="M64 122 Q34 138 36 172 Q38 192 56 200 Q66 178 68 148Z" fill="${dark}"/><path d="M64 122 Q42 132 38 152 Q54 146 68 148Z" fill="${accent}"/><path d="M40 164 Q54 160 62 168 M44 178 Q54 174 62 182" stroke="${main}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></g>`;
  const body = `${toes(82)}${toes(118)}<ellipse cx="100" cy="152" rx="46" ry="50" fill="${main}"/><ellipse cx="100" cy="164" rx="29" ry="32" fill="${belly}"/><path d="M82 150 q6 4 12 0 M96 160 q6 4 12 0 M108 148 q6 4 12 0 M88 172 q6 4 12 0" stroke="${main}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/>${wing(-1)}${wing(1)}`;
  const tuft = [-30, 0, 30].map((a) => `<g transform="rotate(${a} 100 60)"><path d="M100 62 Q90 38 100 ${a === 0 ? 8 : 16} Q110 38 100 62Z" fill="${a === 0 ? accent : mixHex(accent, '#ff8a3a', 0.35)}"/></g>`).join('');
  const headBehind = tuft;
  const head = `<circle cx="100" cy="${HY}" r="42" fill="${main}"/><ellipse cx="100" cy="90" rx="35" ry="31" fill="${mixHex(main, '#ffffff', 0.28)}"/><ellipse cx="82" cy="52" rx="13" ry="5" fill="#ffffff44" transform="rotate(-20 82 52)"/>`;
  const beak = `<path d="M90.5 88.5 Q100 82 109.5 88.5 Q112 97 103 99 Q100 99.5 99 96.5 Q92 95 90.5 88.5Z" fill="${gold}"/><path d="M96 94 Q100 96 105 94" stroke="#d18a00" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="96" cy="87.5" rx="3.4" ry="1.5" fill="#fff" opacity=".65"/>`;
  return shell(tail, body, headBehind, head, beak, growth);
};

// ---------------------------------------------------------------- the pack
const creature = (id: string, label: string, c: { main: string; dark: string; accent: string }, svg: (g: number) => string): CreatureDef => ({
  id, label, ...c, hy: HY, svg, egg: () => jungleEggSVG(id, c.main, c.dark, c.accent),
});

export const pack: Pack = {
  id: 'jungle',
  name: 'Jungle Safari',
  blurb: 'Baby jungle animals among vines, a waterfall and a rope bridge',
  arrival: 'pod',
  defaultName: 'Mango',
  creatures: [
    creature('jungle-monkey', 'golden monkey pod', MONKEY, monkeySVG),
    creature('jungle-elephant', 'blue elephant pod', ELEPHANT, elephantSVG),
    creature('jungle-tiger', 'orange tiger pod', TIGER, tigerSVG),
    creature('jungle-parrot', 'green parrot pod', PARROT, parrotSVG),
  ],
  scene: jungleSceneSVG,
  island: jungleIslandSVG,
};
