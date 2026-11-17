import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import { chestEgg, pirateIsland, pirateScene } from './pirate-art';
import type { CreatureDef, Pack } from './types';

/**
 * Pirate Cove: four friendly cove creatures (a sea otter, a silver kitten in a bandana, a baby octopus in a tiny captain's hat
 * and a white seagull chick) on a sunny treasure-map beach. No weapons, no skulls, nothing frightening.
 * Each is its own body under the shared face (see THE COMPANION CONTRACT in ../art.ts); every id is prefixed "pirate".
 * Silhouettes: otter = round ears + fat tapered tail; kitten = pointy ears + tall striped tail; octopus = tall dome + hat + curling arms;
 * gull = head tuft + drooping wings + orange webbed feet.
 */

const HY = 84;

const wrap = (behind: string, head: string, growth: number, hy = HY): string => `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  ${behind}
  <g class="headg">
    ${head}
    ${accessorySVG(growth, hy)}
  </g>
  ${zzzSVG(hy)}
</svg>`;
const shadow = (rx = 62) => `<ellipse cx="100" cy="202" rx="${rx}" ry="9" fill="#0000001f"/>`;
/** a stroke that gets thinner along its length: each [path, width] piece is a round-capped stroke */
const taper = (pieces: [string, number][], stroke: string): string =>
  pieces.map(([d, w]) => `<path d="${d}" stroke="${stroke}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('');

// ---------------------------------------------------------------- otter: dark chocolate brown, sleek body, low small ears, whiskered cream muzzle, pale shell in its paws
const OTTER = { main: '#6e4f45', dark: '#432f2a', accent: '#7fd6d0' };
const otterSVG = (growth: number): string => {
  const { main, dark } = OTTER;
  const cream = '#f6e6cc';
  const behind = `${shadow(58)}
  <g class="tail">
    <path d="M136 184 C166 196 192 184 196 150 C188 168 168 172 142 166Z" fill="${dark}" stroke="${dark}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M140 180 C166 188 186 178 190 156" stroke="${main}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
  </g>
  <g class="bodyg">
    <ellipse cx="74" cy="195" rx="20" ry="9.5" fill="${dark}"/><ellipse cx="126" cy="195" rx="20" ry="9.5" fill="${dark}"/>
    <path d="M64 195 v-3.5 M74 197 v-3.5 M84 195 v-3.5 M116 195 v-3.5 M126 197 v-3.5 M136 195 v-3.5" stroke="${main}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
    <path d="M100 100 C146 100 150 160 136 188 C126 198 74 198 64 188 C50 160 54 100 100 100Z" fill="${main}"/>
    <path d="M100 118 C128 118 130 160 122 184 C116 190 84 190 78 184 C70 160 72 118 100 118Z" fill="${cream}"/>
    <path d="M86 132 q4 -4 8 0 M104 128 q4 -4 8 0 M92 150 q4 -4 8 0 M110 148 q4 -4 8 0" stroke="#e6cfa8" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <g transform="translate(100 164)">
      <path d="M-18 8 L18 8 L22 14 L-22 14Z" fill="#f0a4b4"/>
      <path d="M0 10 L-28 -2 Q-32 -26 0 -30 Q32 -26 28 -2Z" fill="#ffe6ec" stroke="#f0a4b4" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M0 8 L-20 -6 M0 8 L-8 -22 M0 8 L8 -22 M0 8 L20 -6" stroke="#f0a4b4" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    </g>
    <path d="M64 130 C54 144 56 164 70 170 L78 160 C72 152 72 140 74 130Z" fill="${main}"/><path d="M136 130 C146 144 144 164 130 170 L122 160 C128 152 128 140 126 130Z" fill="${main}"/>
    <ellipse cx="80" cy="168" rx="11" ry="9" fill="${dark}"/><ellipse cx="120" cy="168" rx="11" ry="9" fill="${dark}"/>
  </g>`;
  const head = `<circle cx="100" cy="${HY}" r="44" fill="${main}"/>
    <ellipse cx="68" cy="${HY - 30}" rx="11" ry="6" fill="#fff" opacity=".2" transform="rotate(-38 68 ${HY - 30})"/>
    <circle cx="57" cy="62" r="8" fill="${main}"/><circle cx="57" cy="63" r="4.4" fill="${dark}"/>
    <circle cx="143" cy="62" r="8" fill="${main}"/><circle cx="143" cy="63" r="4.4" fill="${dark}"/>
    <path d="M90 48 Q100 38 110 48 Q100 44 90 48Z" fill="${dark}" opacity=".6"/>
    <ellipse cx="100" cy="${HY + 22}" rx="31" ry="18" fill="${cream}"/>
    <g fill="${dark}" opacity=".5"><circle cx="82" cy="${HY + 12}" r="1.6"/><circle cx="77" cy="${HY + 18}" r="1.6"/><circle cx="118" cy="${HY + 12}" r="1.6"/><circle cx="123" cy="${HY + 18}" r="1.6"/></g>
    <path d="M93 ${HY + 8} Q100 ${HY + 4} 107 ${HY + 8} Q105 ${HY + 15} 100 ${HY + 16} Q95 ${HY + 15} 93 ${HY + 8}Z" fill="#2a1a16"/>
    <g stroke="#e6cfa8" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M70 ${HY + 24} Q56 ${HY + 22} 44 ${HY + 26}"/><path d="M72 ${HY + 30} Q58 ${HY + 32} 48 ${HY + 38}"/><path d="M130 ${HY + 24} Q144 ${HY + 22} 156 ${HY + 26}"/><path d="M128 ${HY + 30} Q142 ${HY + 32} 152 ${HY + 38}"/></g>
    ${faceEyesSVG(HY)}
    ${faceMouthSVG(HY)}`;
  return wrap(behind, head, growth);
};

// ---------------------------------------------------------------- kitten: ginger, red polka-dot bandana, pointy ears, striped tail
const KITTEN = { main: '#93a8c6', dark: '#5f7699', accent: '#e8283c' };
const kittenSVG = (growth: number): string => {
  const { main, dark } = KITTEN;
  const cream = '#f4f8ff';
  const stripe = '#5d7396';
  const bandana = '#e8283c';
  const behind = `${shadow(58)}
  <g class="tail">
    <path d="M142 182 C192 192 202 140 178 112" stroke="${dark}" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="M142 182 C192 192 202 140 178 112" stroke="${main}" stroke-width="17" fill="none" stroke-linecap="round"/>
    <path d="M142 182 C192 192 202 140 178 112" stroke="${stripe}" stroke-width="17" fill="none" stroke-dasharray="6 13" stroke-dashoffset="-8"/>
    <circle cx="178" cy="112" r="8.5" fill="${cream}"/>
  </g>
  <g class="bodyg">
    <ellipse cx="100" cy="152" rx="46" ry="46" fill="${main}"/>
    <ellipse cx="62" cy="176" rx="22" ry="24" fill="${mixHex(main, dark, 0.25)}"/><ellipse cx="138" cy="176" rx="22" ry="24" fill="${mixHex(main, dark, 0.25)}"/>
    <ellipse cx="100" cy="162" rx="27" ry="31" fill="${cream}"/>
    <path d="M56 140 q8 2 12 8 M54 154 q8 0 13 5 M144 140 q-8 2 -12 8 M146 154 q-8 0 -13 5" stroke="${stripe}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="82" cy="193" rx="17" ry="10" fill="${cream}"/><ellipse cx="118" cy="193" rx="17" ry="10" fill="${cream}"/>
    <path d="M76 194 v-5 M88 194 v-5 M112 194 v-5 M124 194 v-5" stroke="#c9d6e8" stroke-width="2.4" stroke-linecap="round"/>
  </g>`;
  const ear = (s: 1 | -1) => {
    const X = (x: number) => (s === 1 ? x : 200 - x);
    return `<path d="M${X(56)} 68 L${X(52)} 22 L${X(94)} 46Z" fill="${main}" stroke="${main}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M${X(62)} 58 L${X(60)} 34 L${X(80)} 47Z" fill="#ff9aa6" stroke="#ff9aa6" stroke-width="4" stroke-linejoin="round"/>`;
  };
  const dots = [[72, 44], [88, 41], [104, 41], [120, 43], [134, 48], [80, 52], [96, 50], [112, 51], [126, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#fff"/>`).join('');
  const head = `${ear(1)}${ear(-1)}
    <circle cx="100" cy="${HY}" r="44" fill="${main}"/>
    <defs><clipPath id="pirate-kitten-hc"><circle cx="100" cy="${HY}" r="44"/></clipPath></defs>
    <g clip-path="url(#pirate-kitten-hc)">
      <path d="M40 30 H160 V54 Q100 64 40 54Z" fill="${bandana}"/>
      <path d="M40 54 Q100 64 160 54" stroke="#b81428" stroke-width="3" fill="none"/>
      <path d="M44 38 Q100 28 156 38" stroke="#ff6b78" stroke-width="3" fill="none" opacity=".7"/>
      ${dots}
    </g>
    <g>
      <path d="M62 56 Q46 58 38 74 Q50 70 58 66Z" fill="${bandana}"/><path d="M62 58 Q54 74 56 90 Q66 80 66 66Z" fill="#c81c30"/>
      <circle cx="63" cy="56" r="6.5" fill="#d3202f"/><circle cx="61" cy="54" r="2" fill="#ff6b78"/>
    </g>
    <ellipse cx="100" cy="${HY + 22}" rx="24" ry="16" fill="${cream}"/>
    <path d="M94 ${HY + 7} Q100 ${HY + 4} 106 ${HY + 7} Q104 ${HY + 14} 100 ${HY + 15} Q96 ${HY + 14} 94 ${HY + 7}Z" fill="#ff6f8a"/>
    <g stroke="#4f6485" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".85">
      <path d="M58 ${HY + 16} Q44 ${HY + 11} 28 ${HY + 12}"/><path d="M58 ${HY + 22} Q44 ${HY + 23} 28 ${HY + 28}"/>
      <path d="M142 ${HY + 16} Q156 ${HY + 11} 172 ${HY + 12}"/><path d="M142 ${HY + 22} Q156 ${HY + 23} 172 ${HY + 28}"/>
    </g>
    ${faceEyesSVG(HY)}
    ${faceMouthSVG(HY)}`;
  return wrap(behind, head, growth);
};

// ---------------------------------------------------------------- octopus: purple dome head, tiny captain's tricorn, arms curling below as the tail
const OCTO = { main: '#9b3dff', dark: '#6317c4', accent: '#ffd23a' };
const octoSVG = (growth: number): string => {
  const { main, dark, accent } = OCTO;
  const arm = mixHex(main, '#ffffff', 0.12);
  const armDark = mixHex(main, dark, 0.55);
  const dot = '#ecd2ff';
  const arms: [string, number][][] = [
    [['M78 116 C52 122 28 140 26 166', 21], ['M26 166 C25 186 44 199 61 191', 16], ['M61 191 C71 185 67 171 57 173', 10]],
    [['M90 124 C74 142 68 166 76 184', 19], ['M76 184 C82 200 101 200 103 187', 14], ['M103 187 C104 179 95 177 92 183', 9]],
  ];
  const mirrorWrap = (s: string) => `<g transform="translate(200 0) scale(-1 1)">${s}</g>`;
  const drawArms = (): string => arms.map((a) => {
    const joined = `${a[0]![0]} ${a[1]![0].replace(/^M\S+ \S+ /, '')}`;
    return taper(a.map(([d, w]) => [d, w + 4] as [string, number]), armDark) + taper(a, arm)
      + `<path d="${joined}" stroke="${dot}" stroke-width="3.4" stroke-dasharray="0.1 14" opacity=".8" stroke-linecap="round" fill="none"/>`;
  }).join('');
  const behind = `${shadow(54)}
  <g class="bodyg">${drawArms()}</g>
  <g class="tail">${mirrorWrap(drawArms())}</g>
  <ellipse cx="100" cy="124" rx="38" ry="18" fill="${mixHex(main, dark, 0.3)}"/>`;
  const hat = `<g transform="rotate(-5 100 30)">
      <path d="M52 40 Q56 18 84 16 Q100 12 116 16 Q144 18 148 40 Q124 30 100 44 Q76 30 52 40Z" fill="#2b2f78"/>
      <path d="M52 40 Q76 30 100 44 Q124 30 148 40" stroke="${accent}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M70 24 Q100 12 130 24" stroke="#4a50a8" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <circle cx="100" cy="29" r="4.5" fill="${accent}"/>
    </g>`;
  const head = `<ellipse cx="100" cy="64" rx="43" ry="46" fill="${main}"/><circle cx="100" cy="${HY}" r="44" fill="${main}"/>
    <ellipse cx="66" cy="54" rx="10" ry="5.5" fill="#fff" opacity=".32" transform="rotate(-40 66 54)"/>
    <g fill="#c58aff"><circle cx="72" cy="${HY - 22}" r="4.4"/><circle cx="128" cy="${HY - 24}" r="4"/><circle cx="82" cy="${HY - 32}" r="3"/><circle cx="118" cy="${HY - 34}" r="3.4"/></g>
    ${hat}
    ${faceEyesSVG(HY)}
    ${faceMouthSVG(HY)}`;
  return wrap(behind, head, growth);
};

// ---------------------------------------------------------------- gull chick: white with light-grey wings, no crest, yellow beak, orange webbed feet
const GULL = { main: '#40b4ff', dark: '#2b8fd8', accent: '#ffb61f' };
const gullSVG = (growth: number): string => {
  const white = '#ffffff';
  const shade = '#d3e3f3';
  const wingC = '#c3cfdf';
  const wingD = '#9fb0c6';
  const orange = '#ffa51a';
  const wing = (s: 1 | -1) => {
    const X = (x: number) => (s === 1 ? x : 200 - x);
    return `<path d="M${X(60)} 120 C${X(30)} 124 ${X(16)} 160 ${X(24)} 188 L${X(32)} 180 L${X(36)} 192 L${X(46)} 180 L${X(52)} 188 C${X(60)} 168 ${X(66)} 146 ${X(64)} 124Z" fill="${wingC}" stroke="${wingC}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M${X(26)} 176 L${X(32)} 180 L${X(36)} 192 L${X(46)} 180 L${X(52)} 188" stroke="${wingD}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  const foot = (cx: number) => `<path d="M${cx - 17} 203 Q${cx - 14} 192 ${cx} 194 Q${cx + 14} 192 ${cx + 17} 203 Q${cx + 9} 209 ${cx} 205 Q${cx - 9} 209 ${cx - 17} 203Z" fill="${orange}" stroke="#e8870a" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M${cx - 6} 196 L${cx - 7} 205 M${cx + 6} 196 L${cx + 7} 205" stroke="#e8870a" stroke-width="2.4" stroke-linecap="round"/>`;
  const behind = `${shadow(56)}
  <g class="tail">
    <g transform="translate(150 170)">
      <ellipse cx="22" cy="-14" rx="22" ry="8.5" fill="${wingD}" transform="rotate(-24 22 -14)"/>
      <ellipse cx="25" cy="0" rx="23" ry="8.5" fill="${wingC}"/>
      <ellipse cx="22" cy="14" rx="21" ry="8" fill="${wingD}" transform="rotate(22 22 14)"/>
    </g>
  </g>
  ${wing(1)}${wing(-1)}
  <g class="bodyg">
    <ellipse cx="100" cy="155" rx="47" ry="44" fill="${shade}"/>
    <ellipse cx="100" cy="152" rx="47" ry="44" fill="${white}"/>
    <path d="M70 152 q5 -5 10 0 M90 160 q5 -5 10 0 M110 152 q5 -5 10 0 M80 174 q5 -5 10 0 M104 174 q5 -5 10 0" stroke="#dbe8f5" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M62 190 v6 M138 190 v6" stroke="${orange}" stroke-width="6" stroke-linecap="round"/>
  </g>
  ${foot(74)}${foot(126)}`;
  const head = `<circle cx="100" cy="${HY}" r="44" fill="${white}" stroke="${shade}" stroke-width="3"/>
    <path d="M62 ${HY - 14} Q64 ${HY - 34} 84 ${HY - 40}" stroke="#c3cfdf" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>
    <path d="M138 ${HY - 14} Q136 ${HY - 34} 116 ${HY - 40}" stroke="#c3cfdf" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>
    <path d="M91 ${HY + 6} Q100 ${HY + 1} 109 ${HY + 6} Q108 ${HY + 14} 100 ${HY + 17} Q92 ${HY + 14} 91 ${HY + 6}Z" fill="#ffd21f" stroke="#f2a600" stroke-width="2" stroke-linejoin="round"/>
    <path d="M95 ${HY + 11} H105" stroke="#f2a600" stroke-width="1.8" stroke-linecap="round"/>
    ${faceEyesSVG(HY)}
    ${faceMouthSVG(HY)}`;
  return wrap(behind, head, growth);
};

const make = (id: string, label: string, c: { main: string; dark: string; accent: string }, svg: (g: number) => string): CreatureDef => ({
  id, label, main: c.main, dark: c.dark, accent: c.accent, hy: HY, svg,
  egg: () => chestEgg(id, c.main, c.dark),
});

export const pack: Pack = {
  id: 'pirate',
  name: 'Pirate Cove',
  blurb: 'Friendly cove creatures, a treasure map and a toy ship (no weapons, no skulls)',
  arrival: 'treasure chest',
  defaultName: 'Pip',
  creatures: [
    make('pirate-otter', 'brown otter treasure chest', OTTER, otterSVG),
    make('pirate-kitten', 'silver kitten treasure chest', KITTEN, kittenSVG),
    make('pirate-octopus', 'purple octopus treasure chest', OCTO, octoSVG),
    make('pirate-gull', 'white seagull treasure chest', GULL, gullSVG),
  ],
  scene: pirateScene,
  island: pirateIsland,
};
