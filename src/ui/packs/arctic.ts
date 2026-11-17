import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import { arcticIsland, arcticScene, iceEgg } from './arctic-art';
import type { CreatureDef, Pack } from './types';

/**
 * Arctic Friends: four chubby baby arctic animals (polar bear cub, penguin chick, arctic fox kit, seal pup) on a calm ice-floe world.
 * Each is its own body shape under the shared face (see THE COMPANION CONTRACT in ../art.ts); all ids are prefixed "arctic".
 */

const HY = 84;

/** Wrap a creature: body parts first (behind), then the bobbing head group with the shared face and accessory. */
const wrap = (behind: string, head: string, growth: number, hy = HY): string => `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  ${behind}
  <g class="headg">
    ${head}
    ${faceEyesSVG(hy)}
    ${faceMouthSVG(hy)}
    ${accessorySVG(growth, hy)}
  </g>
  ${zzzSVG(hy)}
</svg>`;
const shadow = (rx = 62) => `<ellipse cx="100" cy="202" rx="${rx}" ry="9" fill="#0000001f"/>`;

// ---------------------------------------------------------------- polar bear cub: ice-white with a blue shadow tone, round ears, dark nose
const BEAR = { main: '#bfe6ff', dark: '#6fa8dc', accent: '#4f9be6' };
const bearSVG = (growth: number): string => {
  const { main, dark } = BEAR;
  const belly = '#eef9ff';
  const line = '#5a9fd6';
  const behind = `${shadow()}
  <g class="tail"><circle cx="152" cy="174" r="12" fill="${dark}"/><circle cx="152" cy="172" r="12" fill="${main}" stroke="${line}" stroke-width="3.5"/></g>
  <g class="bodyg">
    <ellipse cx="72" cy="193" rx="23" ry="12" fill="${dark}"/><ellipse cx="128" cy="193" rx="23" ry="12" fill="${dark}"/>
    <ellipse cx="72" cy="190" rx="23" ry="12" fill="${main}" stroke="${line}" stroke-width="3.5"/><ellipse cx="128" cy="190" rx="23" ry="12" fill="${main}" stroke="${line}" stroke-width="3.5"/>
    <ellipse cx="72" cy="193" rx="10" ry="5.5" fill="${dark}" opacity=".7"/><ellipse cx="128" cy="193" rx="10" ry="5.5" fill="${dark}" opacity=".7"/>
    <ellipse cx="100" cy="153" rx="55" ry="46" fill="${dark}"/>
    <ellipse cx="100" cy="150" rx="55" ry="46" fill="${main}" stroke="${line}" stroke-width="3.5"/>
    <ellipse cx="100" cy="160" rx="36" ry="30" fill="${belly}"/>
    <path d="M68 168 Q100 196 132 168 Q130 186 100 190 Q70 186 68 168Z" fill="#c5e2f8"/>
    <ellipse cx="48" cy="152" rx="12.5" ry="21" fill="${main}" stroke="${line}" stroke-width="3.5" transform="rotate(22 48 152)"/>
    <ellipse cx="152" cy="152" rx="12.5" ry="21" fill="${main}" stroke="${line}" stroke-width="3.5" transform="rotate(-22 152 152)"/>
  </g>`;
  const ear = (x: number) => `<circle cx="${x}" cy="53" r="16" fill="${main}" stroke="${line}" stroke-width="3.5"/><circle cx="${x + (x < 100 ? 1 : -1)}" cy="55" r="8.5" fill="${dark}" opacity=".75"/>`;
  const head = `${ear(65)}${ear(135)}
    <circle cx="100" cy="${HY + 3}" r="44" fill="${dark}"/>
    <circle cx="100" cy="${HY}" r="44" fill="${main}" stroke="${line}" stroke-width="3.5"/>
    <ellipse cx="100" cy="${HY + 21}" rx="27" ry="21" fill="#f3fbff"/>
    <ellipse cx="100" cy="${HY + 9}" rx="7.5" ry="5.2" fill="#26354f"/><ellipse cx="98" cy="${HY + 7.5}" rx="2.4" ry="1.4" fill="#fff" opacity=".7"/>
    <ellipse cx="70" cy="${HY - 28}" rx="11" ry="6" fill="#fff" opacity=".65" transform="rotate(-38 70 ${HY - 28})"/>`;
  return wrap(behind, head, growth);
};

// ---------------------------------------------------------------- penguin chick: deep navy, a fluffy white face patch, orange beak and feet
const PENGUIN = { main: '#22409e', dark: '#12266b', accent: '#ff9f1c' };
const penguinSVG = (growth: number): string => {
  const { main, dark, accent } = PENGUIN;
  const lite = mixHex(main, '#7fa6ff', 0.35);
  const white = '#f7fbff';
  const foot = (x: number) => `<path d="M${x - 19} 197 Q${x - 17} 186 ${x - 6} 187 Q${x} 183 ${x + 6} 187 Q${x + 17} 186 ${x + 19} 197 Q${x + 12} 203 ${x} 201 Q${x - 12} 203 ${x - 19} 197Z" fill="${accent}"/><path d="M${x - 6} 189 V197 M${x + 6} 189 V197" stroke="#e07f00" stroke-width="2.4" stroke-linecap="round"/>`;
  const behind = `${shadow(56)}
  <g class="tail"><path d="M142 178 Q168 178 176 198 Q152 200 134 192Z" fill="${dark}"/></g>
  <g class="bodyg">
    ${foot(74)}${foot(126)}
    <ellipse cx="100" cy="153" rx="52" ry="47" fill="${dark}"/>
    <ellipse cx="100" cy="150" rx="52" ry="47" fill="${main}"/>
    <ellipse cx="100" cy="158" rx="35" ry="37" fill="${white}"/>
    <path d="M70 176 Q100 190 130 176" stroke="#dcebf7" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <ellipse cx="46" cy="152" rx="11" ry="27" fill="${dark}" transform="rotate(20 46 152)"/>
    <ellipse cx="154" cy="152" rx="11" ry="27" fill="${dark}" transform="rotate(-20 154 152)"/>
    <ellipse cx="44" cy="146" rx="3.4" ry="10" fill="${lite}" opacity=".5" transform="rotate(20 44 146)"/><ellipse cx="156" cy="146" rx="3.4" ry="10" fill="${lite}" opacity=".5" transform="rotate(-20 156 146)"/>
  </g>`;
  const head = `<g fill="${main}"><ellipse cx="90" cy="41" rx="5" ry="9" transform="rotate(-24 90 41)"/><ellipse cx="102" cy="38" rx="5.5" ry="10"/><ellipse cx="114" cy="41" rx="5" ry="9" transform="rotate(24 114 41)"/></g>
    <circle cx="100" cy="${HY + 3}" r="44" fill="${dark}"/>
    <circle cx="100" cy="${HY}" r="44" fill="${main}"/>
    <ellipse cx="68" cy="${HY - 26}" rx="12" ry="6.5" fill="${lite}" opacity=".6" transform="rotate(-40 68 ${HY - 26})"/>
    <g fill="${white}"><ellipse cx="80" cy="${HY}" rx="25" ry="26"/><ellipse cx="120" cy="${HY}" rx="25" ry="26"/><ellipse cx="100" cy="${HY + 14}" rx="33" ry="22"/></g>
    <path d="M91 ${HY + 5} Q100 ${HY - 1} 109 ${HY + 5} Q107 ${HY + 16} 100 ${HY + 17} Q93 ${HY + 16} 91 ${HY + 5}Z" fill="${accent}"/><path d="M95 ${HY + 7} Q100 ${HY + 4} 105 ${HY + 7}" stroke="#ffd08a" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  return wrap(behind, head, growth);
};

// ---------------------------------------------------------------- arctic fox kit: orange and white, pointed ears, a big fluffy tail
const FOX = { main: '#ff8a1f', dark: '#c95a0b', accent: '#fff1e0' };
const foxSVG = (growth: number): string => {
  const { main, dark } = FOX;
  const white = '#fffaf3';
  const sock = '#8b3d12';
  const tailPath = 'M134 188 C150 206 190 202 197 166 C204 134 192 102 166 82 C172 112 160 128 142 142Z';
  const behind = `${shadow(58)}
  <g class="tail">
    <defs><clipPath id="arctic-fox-tailclip"><path d="${tailPath}"/></clipPath></defs>
    <path d="${tailPath}" fill="${dark}" transform="translate(0 3)"/>
    <path d="${tailPath}" fill="${main}"/>
    <g clip-path="url(#arctic-fox-tailclip)"><path d="M120 60 H215 V114 Q196 126 178 116 Q160 104 140 118Z" fill="${white}"/></g>
    <path d="M146 176 Q170 182 184 160" stroke="#ffb15c" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>
  </g>
  <g class="bodyg">
    <ellipse cx="74" cy="194" rx="19" ry="10.5" fill="${sock}"/><ellipse cx="126" cy="194" rx="19" ry="10.5" fill="${sock}"/>
    <ellipse cx="100" cy="153" rx="50" ry="45" fill="${dark}"/>
    <ellipse cx="100" cy="150" rx="50" ry="45" fill="${main}"/>
    <path d="M100 126 C124 126 134 146 132 164 C128 182 114 190 100 190 C86 190 72 182 68 164 C66 146 76 126 100 126Z" fill="${white}"/>
    <ellipse cx="55" cy="160" rx="11" ry="22" fill="${main}" transform="rotate(18 55 160)"/><ellipse cx="145" cy="160" rx="11" ry="22" fill="${main}" transform="rotate(-18 145 160)"/>
    <ellipse cx="52" cy="178" rx="9" ry="7" fill="${sock}"/><ellipse cx="148" cy="178" rx="9" ry="7" fill="${sock}"/>
  </g>`;
  const ear = (mirror: boolean) => {
    const x = (v: number) => (mirror ? 200 - v : v);
    return `<path d="M${x(56)} 70 L${x(46)} 16 L${x(98)} 44Z" fill="${main}" stroke="${main}" stroke-width="9" stroke-linejoin="round"/>
    <path d="M${x(62)} 58 L${x(55)} 29 L${x(86)} 46Z" fill="#ffd2b0" stroke="#ffd2b0" stroke-width="5" stroke-linejoin="round"/>
    <path d="M${x(46)} 14 L${x(50)} 30 L${x(62)} 22Z" fill="${sock}" stroke="${sock}" stroke-width="5" stroke-linejoin="round"/>`;
  };
  const muzzle = 'M52 97 Q72 94 86 98 Q100 92 114 98 Q128 94 148 97 L157 108 L144 111 L148 124 L131 124 Q119 138 100 138 Q81 138 69 124 L52 124 L56 111 L43 108Z';
  const head = `${ear(false)}${ear(true)}
    <circle cx="100" cy="${HY + 3}" r="44" fill="${dark}"/>
    <circle cx="100" cy="${HY}" r="44" fill="${main}"/>
    <ellipse cx="70" cy="${HY - 28}" rx="11" ry="6" fill="#fff" opacity=".35" transform="rotate(-38 70 ${HY - 28})"/>
    <path d="${muzzle}" fill="${white}" stroke="${white}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M92 ${HY + 8} Q100 ${HY + 4} 108 ${HY + 8} Q106 ${HY + 16} 100 ${HY + 17} Q94 ${HY + 16} 92 ${HY + 8}Z" fill="#26303f"/>`;
  return wrap(behind, head, growth);
};

// ---------------------------------------------------------------- seal pup: grey-violet, whiskers, flippers, a round pale belly
const SEAL = { main: '#8c92dc', dark: '#5b60b0', accent: '#c6c9f6' };
const sealSVG = (growth: number): string => {
  const { main, dark } = SEAL;
  const belly = '#eceeff';
  const flipper = mixHex(main, dark, 0.45);
  const behind = `${shadow(64)}
  <g class="tail">
    <path d="M140 170 C160 170 176 158 188 138 C198 150 196 164 190 172 C198 178 196 192 186 200 C168 194 152 190 138 186Z" fill="${dark}"/>
    <path d="M142 172 C160 172 174 162 184 148" stroke="${flipper}" stroke-width="5" stroke-linecap="round" fill="none"/>
  </g>
  <g class="bodyg">
    <ellipse cx="100" cy="155" rx="59" ry="44" fill="${dark}"/>
    <ellipse cx="100" cy="152" rx="59" ry="44" fill="${main}"/>
    <ellipse cx="100" cy="163" rx="39" ry="30" fill="${belly}"/>
    <path d="M78 150 Q100 158 122 150" stroke="#d9dcf8" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    <path d="M48 186 Q42 176 52 170 Q74 172 84 184 Q80 198 62 198 Q48 196 48 186Z" fill="${flipper}"/>
    <path d="M152 186 Q158 176 148 170 Q126 172 116 184 Q120 198 138 198 Q152 196 152 186Z" fill="${flipper}"/>
  </g>`;
  const whisker = (s: 1 | -1) => [[-4, -9], [3, 3], [-1, 15]].map(([a, b]) => `<path d="M${100 + s * 26} ${HY + 17 + (a as number) * 0.5} Q${100 + s * 46} ${HY + 17 + (a as number)} ${100 + s * 60} ${HY + 17 + (b as number)}" />`).join('');
  const head = `<circle cx="100" cy="${HY + 3}" r="44" fill="${dark}"/>
    <circle cx="100" cy="${HY}" r="44" fill="${main}"/>
    <ellipse cx="68" cy="${HY - 28}" rx="12" ry="6.5" fill="#fff" opacity=".4" transform="rotate(-38 68 ${HY - 28})"/>
    <circle cx="87" cy="${HY + 21}" r="17" fill="#e7e9ff"/><circle cx="113" cy="${HY + 21}" r="17" fill="#e7e9ff"/>
    <g stroke="#4d5299" stroke-width="2.6" stroke-linecap="round" fill="none">${whisker(-1)}${whisker(1)}</g>
    <path d="M90 ${HY + 8} Q100 ${HY + 3} 110 ${HY + 8} Q108 ${HY + 16} 100 ${HY + 16} Q92 ${HY + 16} 90 ${HY + 8}Z" fill="#3a3070"/><ellipse cx="97" cy="${HY + 7}" rx="2.6" ry="1.4" fill="#fff" opacity=".6"/>`;
  return wrap(behind, head, growth);
};

const make = (id: string, label: string, c: { main: string; dark: string; accent: string }, crystal: string, svg: (g: number) => string): CreatureDef => ({
  id, label, main: c.main, dark: c.dark, accent: c.accent, hy: HY, svg,
  egg: () => iceEgg(id, crystal, id.replace('arctic-', '')),
});

export const pack: Pack = {
  id: 'arctic',
  name: 'Arctic Friends',
  blurb: 'Snowy baby animals, ice floes and northern lights',
  arrival: 'ice egg',
  defaultName: 'Frosty',
  creatures: [
    make('arctic-penguin', 'navy penguin ice egg', PENGUIN, '#2a4fc4', penguinSVG),
    make('arctic-bear', 'white polar bear ice egg', BEAR, '#4f9be6', bearSVG),
    make('arctic-fox', 'orange fox ice egg', FOX, '#ff8a1f', foxSVG),
    make('arctic-seal', 'violet seal ice egg', SEAL, '#8c92dc', sealSVG),
  ],
  scene: arcticScene,
  island: arcticIsland,
};
