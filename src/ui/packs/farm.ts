import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import { farmEggSVG, farmIslandSVG, farmSceneSVG } from './farm-art';
import type { CreatureDef, Pack } from './types';

// Farm Friends: four chubby baby farm animals (chick, piglet, lamb, calf) in a sunny patchwork meadow.
// Each follows the companion contract (see ../art.ts). Distinct silhouettes: the chick is one fluffy ball with a feather tuft, the piglet has
// pointed folded ears and a curly tail, the lamb is a cloud of wool, the calf has horn nubs and broad floppy ears.
// Beaks, snouts and muzzles are kept ABOVE y = hy + 12 so the shared mouth (hy + 22) and the feeding drop target stay clear.

const HY = 84;
const SHADOW = `<ellipse cx="100" cy="202" rx="62" ry="9" fill="#0000001f"/>`;

/** assemble a creature: tail and body first, then the head group with the shared face on top. */
const shell = (tail: string, body: string, headBehind: string, head: string, growth: number): string => `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  ${SHADOW}
  ${tail}
  <g class="bodyg">${body}</g>
  <g class="headg">
    ${headBehind}
    ${head}
    ${faceEyesSVG(HY)}
    ${'@@nose@@'}
    ${faceMouthSVG(HY)}
    ${accessorySVG(growth, HY)}
  </g>
  ${zzzSVG(HY)}
</svg>`;

const r1 = (n: number): string => n.toFixed(1);
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

// ---------------------------------------------------------------- chick
const CHICK = { main: '#ffd21f', dark: '#f0a000', accent: '#ff8a1f' };
const chickSVG = (growth: number): string => {
  const { main, dark, accent } = CHICK;
  const fluff = mixHex(main, dark, 0.4);
  const belly = mixHex(main, '#ffffff', 0.55);
  const tail = `<g class="tail"><path d="M146 160 Q168 160 184 138 Q192 160 178 174 Q162 182 146 174Z" fill="${fluff}"/><path d="M150 164 Q166 162 178 150" stroke="${main}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/></g>`;
  const feet = [76, 124].map((x) => `<g transform="translate(${x} 196)"><ellipse cx="0" cy="0" rx="17" ry="7" fill="${accent}"/><path d="M-9 -2 v6 M0 -3 v8 M9 -2 v6" stroke="${mixHex(accent, '#b04a00', 0.35)}" stroke-width="2.5" stroke-linecap="round"/></g>`).join('');
  const wing = (s: number) => `<g transform="translate(${s < 0 ? 44 : 156} 152) rotate(${s * 16})"><ellipse cx="0" cy="0" rx="15" ry="26" fill="${fluff}"/><path d="M${-5 * -s} -14 Q${-s * 8} 0 ${-s * 3} 16" stroke="${main}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/></g>`;
  const body = `${feet}${wing(-1)}${wing(1)}<ellipse cx="100" cy="150" rx="56" ry="47" fill="${main}"/><ellipse cx="100" cy="162" rx="36" ry="30" fill="${belly}"/>`;
  const tuft = [-24, 0, 24].map((a) => `<g transform="rotate(${a} 100 52)"><path d="M100 52 Q90 28 100 12 Q110 28 100 52Z" fill="${a === 0 ? main : fluff}"/></g>`).join('');
  const puffs = `<circle cx="58" cy="94" r="12" fill="${main}"/><circle cx="142" cy="94" r="12" fill="${main}"/>`;
  const headBehind = `${tuft}${puffs}`;
  const head = `<circle cx="100" cy="${HY}" r="43" fill="${main}"/>`;
  const beak = `<path d="M93 90 Q100 84 107 90 Q106 100 100 102 Q94 100 93 90Z" fill="${accent}"/><path d="M95.5 93 Q100 95.5 104.5 93" stroke="${mixHex(accent, '#b04a00', 0.4)}" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="97.5" cy="89.5" rx="2.4" ry="1.4" fill="#fff" opacity=".6"/>`;
  return shell(tail, body, headBehind, head, growth).replace('@@nose@@', beak);
};

// ---------------------------------------------------------------- piglet
const PIG = { main: '#ff74ae', dark: '#d9407f', accent: '#ffc2dd' };
const pigletSVG = (growth: number): string => {
  const { main, dark } = PIG;
  const light = mixHex(main, '#ffffff', 0.45);
  const earIn = mixHex(main, '#ffffff', 0.4);
  const tail = `<path class="tail" d="M150 160 Q176 160 176 142 Q176 126 162 130 Q154 134 160 142 Q166 148 170 142" stroke="${dark}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const hoof = (x: number) => `<g transform="translate(${x} 196)"><ellipse cx="0" cy="0" rx="19" ry="9" fill="${dark}"/><path d="M0 -4 v9" stroke="${mixHex(dark, '#7a1040', 0.5)}" stroke-width="2.5" stroke-linecap="round"/></g>`;
  const body = `${hoof(72)}${hoof(128)}<ellipse cx="100" cy="150" rx="58" ry="46" fill="${main}"/><ellipse cx="100" cy="162" rx="36" ry="29" fill="${light}"/>`;
  const ear = (flip: boolean) => `<g transform="${flip ? 'translate(206 6) scale(-1 1)' : 'translate(-6 6)'}"><path d="M86 48 Q62 22 36 28 Q34 52 52 68 Q72 68 84 60Z" fill="${dark}"/><path d="M78 48 Q62 34 46 36 Q46 52 58 62 Q70 60 78 56Z" fill="${earIn}"/><path d="M36 28 Q46 40 52 50" stroke="${main}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/></g>`;
  const headBehind = `${ear(false)}${ear(true)}`;
  const head = `<ellipse cx="100" cy="${HY}" rx="45" ry="42" fill="${main}"/>`;
  const snout = `<ellipse cx="100" cy="96" rx="13" ry="8.5" fill="${light}"/><ellipse cx="100" cy="97" rx="13" ry="8.5" fill="none" stroke="${dark}" stroke-width="1.6" opacity=".35"/><ellipse cx="94.5" cy="96" rx="2.4" ry="3.4" fill="${dark}"/><ellipse cx="105.5" cy="96" rx="2.4" ry="3.4" fill="${dark}"/>`;
  return shell(tail, body, headBehind, head, growth).replace('@@nose@@', snout);
};

// ---------------------------------------------------------------- lamb
const LAMB = { main: '#fff1cb', dark: '#8f6f58', accent: '#a98568' };
const lambSVG = (growth: number): string => {
  const { main, dark } = LAMB;
  const face = '#c2a994';
  const shade = mixHex(main, '#b8975f', 0.4);
  const cloud = (pts: [number, number, number][]) =>
    pts.map(([x, y, r]) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r + 2.4}" fill="${shade}"/>`).join('') + pts.map(([x, y, r]) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="${main}"/>`).join('');
  const bodyPts: [number, number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const a = i * 30;
    const x = 100 + 46 * Math.cos((a * Math.PI) / 180);
    const y = 152 + 36 * Math.sin((a * Math.PI) / 180);
    bodyPts.push([x, y, 17]);
  }
  bodyPts.push([100, 152, 34]);
  const tailPts: [number, number, number][] = [[156, 160, 11], [166, 150, 9], [164, 168, 9]];
  const tail = `<g class="tail">${cloud(tailPts)}</g>`;
  const leg = (x: number) => `<rect x="${x - 8}" y="176" width="16" height="26" rx="8" fill="${dark}"/><ellipse cx="${x}" cy="200" rx="11" ry="5" fill="${mixHex(dark, '#3a2616', 0.45)}"/>`;
  const body = `${leg(74)}${leg(126)}${cloud(bodyPts)}`;
  const ring: [number, number, number][] = [];
  for (let a = 180; a <= 360; a += 22.5) { const [x, y] = polar(100, HY, 41, a); ring.push([x, y, 15]); }
  const earL = `<ellipse cx="46" cy="94" rx="17" ry="9" fill="${dark}" transform="rotate(24 46 94)"/><ellipse cx="48" cy="94" rx="10" ry="4.5" fill="#e7b9a8" transform="rotate(24 46 94)"/>`;
  const earR = `<ellipse cx="154" cy="94" rx="17" ry="9" fill="${dark}" transform="rotate(-24 154 94)"/><ellipse cx="152" cy="94" rx="10" ry="4.5" fill="#e7b9a8" transform="rotate(-24 154 94)"/>`;
  const headBehind = `${earL}${earR}${cloud(ring)}`;
  const fringe = cloud([[82, 53, 12.5], [118, 53, 12.5], [100, 48, 14.5]]);
  const head = `<ellipse cx="100" cy="90" rx="37" ry="38" fill="${face}"/>${fringe}`;
  const nose = `<ellipse cx="100" cy="97" rx="5.5" ry="3.6" fill="${mixHex(face, dark, 0.55)}"/>`;
  return shell(tail, body, headBehind, head, growth).replace('@@nose@@', nose);
};

// ---------------------------------------------------------------- calf
const CALF = { main: '#c8702a', dark: '#7c3a0e', accent: '#fff0d0' };
const calfSVG = (growth: number): string => {
  const { main, dark, accent } = CALF;
  const pink = '#ffa6c0';
  const tail = `<g class="tail"><path d="M148 156 Q172 158 176 180" stroke="${dark}" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="177" cy="186" rx="7" ry="11" fill="${dark}" transform="rotate(8 177 186)"/></g>`;
  const leg = (x: number) => `<rect x="${x - 12}" y="176" width="24" height="24" rx="9" fill="${main}"/><rect x="${x - 13}" y="190" width="26" height="12" rx="6" fill="${dark}"/>`;
  const body = `<clipPath id="farm-calf-bodyclip"><ellipse cx="100" cy="150" rx="58" ry="47"/></clipPath>${leg(72)}${leg(128)}<ellipse cx="100" cy="150" rx="58" ry="47" fill="${main}"/>
    <g clip-path="url(#farm-calf-bodyclip)"><path d="M40 134 Q56 112 76 124 Q84 146 62 158 Q40 160 40 134Z" fill="${accent}"/><path d="M142 118 Q166 112 164 146 Q150 168 130 160 Q122 138 142 118Z" fill="${accent}"/><ellipse cx="100" cy="176" rx="22" ry="12" fill="${accent}"/></g>`;
  const horn = (flip: boolean) => `<g transform="translate(${flip ? 128 : 72} 54) rotate(${flip ? 24 : -24})"><path d="M-10 8 Q-12 -16 0 -21 Q12 -16 10 8Z" fill="${accent}"/><path d="M-10 8 Q-11 -2 -8 -7 L8 -7 Q11 -2 10 8Z" fill="#e8c88a"/></g>`;
  const ear = (flip: boolean) => `<g transform="${flip ? 'translate(200 0) scale(-1 1)' : ''}"><ellipse cx="42" cy="72" rx="23" ry="12" fill="${main}" transform="rotate(-18 42 72)"/><ellipse cx="42" cy="73" rx="14" ry="6.5" fill="${pink}" transform="rotate(-18 42 73)"/></g>`;
  const headBehind = `${horn(false)}${horn(true)}${ear(false)}${ear(true)}`;
  const head = `<ellipse cx="100" cy="${HY}" rx="45" ry="42" fill="${main}"/><path d="M93 45 Q100 39 107 45 Q109 68 104 90 L96 90 Q91 68 93 45Z" fill="${accent}"/>`;
  const muzzle = `<ellipse cx="100" cy="97" rx="20" ry="8.5" fill="${pink}"/><ellipse cx="92" cy="97" rx="2.1" ry="2.8" fill="${mixHex(pink, '#b0305a', 0.6)}"/><ellipse cx="108" cy="97" rx="2.1" ry="2.8" fill="${mixHex(pink, '#b0305a', 0.6)}"/>`;
  return shell(tail, body, headBehind, head, growth).replace('@@nose@@', muzzle);
};

// ---------------------------------------------------------------- the pack
const creature = (id: string, label: string, c: { main: string; dark: string; accent: string }, svg: (g: number) => string): CreatureDef => ({
  id, label, ...c, hy: HY, svg, egg: () => farmEggSVG(id, c.main, c.dark, c.accent),
});

export const pack: Pack = {
  id: 'farm',
  name: 'Farm Friends',
  blurb: 'Baby farm animals in a sunny meadow',
  arrival: 'egg',
  defaultName: 'Chick',
  creatures: [
    creature('farm-chick', 'yellow chick egg', CHICK, chickSVG),
    creature('farm-piglet', 'pink piglet egg', PIG, pigletSVG),
    creature('farm-lamb', 'cream lamb egg', LAMB, lambSVG),
    creature('farm-calf', 'brown calf egg', CALF, calfSVG),
  ],
  scene: farmSceneSVG,
  island: farmIslandSVG,
};
