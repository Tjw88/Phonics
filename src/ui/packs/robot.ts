import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import { robotBoxSVG, robotGear, robotIslandSVG, robotSceneSVG, robotSpring } from './robot-art';
import type { CreatureDef, Pack } from './types';

// Robot Workshop: four chubby, toy-like robots. Each follows the companion contract (see ../art.ts): the shared face sits on a LIGHT flat
// screen set into the coloured casing. Silhouettes: Orb = dome head on a ball (bulb antenna), Boxy (purple, so the shared red scarf shows) = square head on a box with wheels and
// a wind-up key, Springy = head on a coil-spring neck with a tall body and a waving arm, Tiny = huge head on stubby treads with a little gear.
// Nothing decorative sits in the eye / mouth area (mouth is at hy + 22); the screen reaches down to hy + 44 so the open mouth stays on it.

const SHADOW = `<ellipse cx="100" cy="202" rx="62" ry="9" fill="#0000001f"/>`;
const STEEL = '#aab6c6';
const IRON = '#3a4658';
const STYLE = `<style>.dino .robot-wave.tail{animation:robot-wave 1.9s ease-in-out infinite}@keyframes robot-wave{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(14deg)}}.dino .robot-cog{transform-box:fill-box;transform-origin:50% 50%;animation:robot-cog 7s linear infinite}.dino.mood-sleepy .robot-cog{animation:none}@keyframes robot-cog{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.dino .robot-wave.tail,.dino .robot-cog{animation:none}}</style>`;

const shell = (hy: number, back: string, body: string, headBehind: string, head: string, growth: number): string => `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  ${STYLE}
  ${SHADOW}
  ${back}
  <g class="bodyg">${body}</g>
  <g class="headg">
    ${headBehind}
    ${head}
    ${faceEyesSVG(hy)}
    ${faceMouthSVG(hy)}
    ${accessorySVG(growth, hy)}
  </g>
  ${zzzSVG(hy)}
</svg>`;

/** a soft glass shine in the top-left corner of the screen, kept clear of the eyes */
const shine = (x: number, y: number, w: number, rot = 0): string => `<rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="#fff" opacity=".75" transform="rotate(${rot} ${x} ${y})"/>`;

// ---------------------------------------------------------------- Orb: blue, dome head, ball body, bulb antenna
const ORB = { main: '#1f7bff', dark: '#0a49c9', accent: '#ffd400' };
const orbSVG = (growth: number): string => {
  const { main, dark, accent } = ORB;
  const hy = 84;
  const screen = mixHex(main, '#ffffff', 0.8);
  const light = mixHex(main, '#ffffff', 0.4);
  const antenna = `<g class="tail"><path d="M80 52 Q66 34 62 22" fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round"/><circle cx="62" cy="16" r="15" fill="${accent}" opacity=".3"/><circle cx="62" cy="16" r="9.5" fill="${accent}" stroke="#e0a100" stroke-width="3"/><circle cx="59" cy="12.5" r="3" fill="#fff" opacity=".85"/></g>`;
  const ears = `<circle cx="50" cy="90" r="11" fill="${dark}"/><circle cx="150" cy="90" r="11" fill="${dark}"/><circle cx="50" cy="90" r="4.5" fill="${accent}"/><circle cx="150" cy="90" r="4.5" fill="${accent}"/>`;
  const head = `<ellipse cx="100" cy="90" rx="50" ry="47" fill="${dark}"/><ellipse cx="100" cy="86" rx="50" ry="47" fill="${main}"/>
    <path d="M64 56 Q76 44 92 41" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="100" cy="88" rx="44" ry="40" fill="${screen}"/>${shine(66, 52, 22, -28)}`;
  const body = `<ellipse cx="78" cy="200" rx="18" ry="9" fill="${dark}"/><ellipse cx="122" cy="200" rx="18" ry="9" fill="${dark}"/>
    <ellipse cx="53" cy="162" rx="11" ry="15" fill="${dark}" transform="rotate(18 53 162)"/><ellipse cx="147" cy="162" rx="11" ry="15" fill="${dark}" transform="rotate(-18 147 162)"/>
    <ellipse cx="100" cy="166" rx="46" ry="38" fill="${dark}"/><ellipse cx="100" cy="162" rx="46" ry="38" fill="${main}"/>
    <path d="M66 148 Q72 136 84 132" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="5" stroke-linecap="round"/>
    <circle cx="100" cy="168" r="20" fill="${light}"/><circle cx="100" cy="168" r="20" fill="none" stroke="${dark}" stroke-opacity=".35" stroke-width="3"/>
    <circle cx="100" cy="168" r="8" fill="${accent}" stroke="#e0a100" stroke-width="2.5"/><circle cx="97.5" cy="165.5" r="2.4" fill="#fff" opacity=".8"/>`;
  return shell(hy, '', body, ears + antenna, head, growth);
};

// ---------------------------------------------------------------- Boxy: red, square head, box body, side bolts, wheels, wind-up key
const BOXY = { main: '#9b45ff', dark: '#6a1fc9', accent: '#ffd400' };
const boxySVG = (growth: number): string => {
  const { main, dark, accent } = BOXY;
  const hy = 84;
  const screen = mixHex(main, '#ffffff', 0.82);
  const light = mixHex(main, '#ffffff', 0.45);
  const key = `<g class="tail"><rect x="124" y="152" width="30" height="8" fill="${STEEL}"/><circle cx="165" cy="156" r="13" fill="none" stroke="${accent}" stroke-width="7"/><circle cx="165" cy="156" r="13" fill="none" stroke="#e0a100" stroke-width="7" stroke-opacity=".0"/><rect x="152" y="152" width="8" height="8" rx="2" fill="#e0a100"/></g>`;
  const wheel = (x: number): string => `<circle cx="${x}" cy="190" r="15" fill="${IRON}"/><circle cx="${x}" cy="190" r="7" fill="#cfd8e6"/><circle cx="${x}" cy="190" r="2.6" fill="${IRON}"/>`;
  const bolts = `<rect x="38" y="72" width="16" height="28" rx="6" fill="${dark}"/><rect x="146" y="72" width="16" height="28" rx="6" fill="${dark}"/><circle cx="43" cy="86" r="3" fill="#fff" opacity=".6"/><circle cx="157" cy="86" r="3" fill="#fff" opacity=".6"/>`;
  const knobs = `<rect x="68" y="26" width="12" height="14" rx="4" fill="${dark}"/><rect x="120" y="26" width="12" height="14" rx="4" fill="${dark}"/>`;
  const head = `<rect x="52" y="40" width="96" height="98" rx="14" fill="${dark}"/><rect x="52" y="36" width="96" height="98" rx="14" fill="${main}"/>
    <rect x="59" y="46" width="82" height="82" rx="10" fill="${screen}"/>${shine(65, 52, 20)}`;
  const body = `${wheel(76)}${wheel(124)}
    <rect x="40" y="136" width="18" height="38" rx="9" fill="${dark}"/><rect x="142" y="136" width="18" height="38" rx="9" fill="${dark}"/><circle cx="49" cy="178" r="9" fill="${main}"/><circle cx="151" cy="178" r="9" fill="${main}"/>
    <rect x="60" y="128" width="80" height="64" rx="13" fill="${dark}"/><rect x="60" y="124" width="80" height="64" rx="13" fill="${main}"/>
    <path d="M68 142 Q68 133 78 132" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="4.5" stroke-linecap="round"/>
    <rect x="76" y="138" width="48" height="38" rx="9" fill="${light}"/>
    <circle cx="88" cy="150" r="5" fill="${accent}"/><circle cx="100" cy="150" r="5" fill="#fff"/><circle cx="112" cy="150" r="5" fill="${dark}"/>
    <rect x="85" y="162" width="30" height="7" rx="3.5" fill="${dark}" opacity=".35"/>`;
  return shell(hy, key, body, bolts + knobs, head, growth);
};

// ---------------------------------------------------------------- Springy: yellow, head on a coil-spring neck, tall body, waving arm
const SPRINGY = { main: '#ffd400', dark: '#e09b00', accent: '#ff3d7f' };
const springySVG = (growth: number): string => {
  const { main, dark, accent } = SPRINGY;
  const hy = 64;
  const screen = mixHex(main, '#ffffff', 0.72);
  const light = mixHex(main, '#ffffff', 0.55);
  const arm = `<g class="tail robot-wave"><path d="M128 160 Q154 160 158 134" fill="none" stroke="${dark}" stroke-width="12" stroke-linecap="round"/><circle cx="158" cy="126" r="10" fill="${main}" stroke="${dark}" stroke-width="3"/></g>`;
  const otherArm = `<path d="M72 160 Q48 164 48 188" fill="none" stroke="${dark}" stroke-width="12" stroke-linecap="round"/><circle cx="48" cy="192" r="9" fill="${main}" stroke="${dark}" stroke-width="3"/>`;
  const neck = robotSpring(100, 108, 28, 46, 5, STEEL, 5.5);
  const body = `${neck}${otherArm}
    <ellipse cx="82" cy="203" rx="18" ry="8" fill="${dark}"/><ellipse cx="118" cy="203" rx="18" ry="8" fill="${dark}"/>
    <rect x="66" y="150" width="68" height="54" rx="14" fill="${dark}"/><rect x="66" y="146" width="68" height="54" rx="14" fill="${main}"/>
    <path d="M74 164 Q74 154 84 152" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="100" cy="166" r="16" fill="${light}"/><circle cx="100" cy="166" r="16" fill="none" stroke="${dark}" stroke-opacity=".4" stroke-width="3"/>
    <path d="M100 166 L108 156" stroke="${accent}" stroke-width="3.5" stroke-linecap="round"/><circle cx="100" cy="166" r="3" fill="${dark}"/>
    <circle cx="84" cy="188" r="4.5" fill="${accent}"/><circle cx="100" cy="188" r="4.5" fill="#fff"/><circle cx="116" cy="188" r="4.5" fill="${dark}"/>`;
  const earPads = `<rect x="40" y="56" width="16" height="34" rx="8" fill="${dark}"/><rect x="144" y="56" width="16" height="34" rx="8" fill="${dark}"/>`;
  const head = `<rect x="50" y="26" width="100" height="98" rx="40" fill="${dark}"/><rect x="50" y="22" width="100" height="98" rx="40" fill="${main}"/>
    <rect x="57" y="32" width="86" height="84" rx="32" fill="${screen}"/>${shine(66, 40, 20, -20)}`;
  return shell(hy, arm, body, `<g transform="translate(0 -8)">${earPads}</g>`, `<g transform="translate(0 -8)">${head}</g>`, growth);
};

// ---------------------------------------------------------------- Tiny: green, a big head on a small body, stubby treads, one small gear
const TINY = { main: '#1fd25a', dark: '#0a9a3a', accent: '#ff9a1f' };
const tinySVG = (growth: number): string => {
  const { main, dark, accent } = TINY;
  const hy = 84;
  const screen = mixHex(main, '#ffffff', 0.8);
  const light = mixHex(main, '#ffffff', 0.5);
  const cog = `<g class="robot-cog">${robotGear(80, 24, 17, 8, accent, { hole: dark })}</g><rect x="74" y="34" width="12" height="10" fill="${dark}"/>`;
  const wheels = [72, 100, 128].map((x) => `<circle cx="${x}" cy="187" r="10" fill="#8895a8"/><circle cx="${x}" cy="187" r="3.8" fill="${IRON}"/>`).join('');
  const body = `<circle cx="64" cy="152" r="9" fill="${dark}"/><circle cx="136" cy="152" r="9" fill="${dark}"/>
    <rect x="72" y="128" width="56" height="52" rx="14" fill="${dark}"/><rect x="72" y="126" width="56" height="52" rx="14" fill="${main}"/>
    <circle cx="100" cy="154" r="9" fill="${light}"/><circle cx="100" cy="154" r="3.6" fill="${accent}"/>
    <rect x="52" y="168" width="96" height="36" rx="18" fill="${IRON}"/>${wheels}
    <path d="M66 172 H134" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 6"/>`;
  const head = `<rect x="46" y="36" width="108" height="100" rx="32" fill="${dark}"/><rect x="46" y="32" width="108" height="100" rx="32" fill="${main}"/>
    <rect x="55" y="42" width="90" height="86" rx="26" fill="${screen}"/>${shine(66, 49, 20, -14)}`;
  return shell(hy, '', body, cog, head, growth);
};

const make = (id: string, label: string, c: { main: string; dark: string; accent: string }, hy: number, svg: (g: number) => string, idx: number): CreatureDef => ({
  id, label, main: c.main, dark: c.dark, accent: c.accent, hy, svg, egg: () => robotBoxSVG(idx, c.main, c.dark, c.accent),
});

export const pack: Pack = {
  id: 'robot',
  name: 'Robot Workshop',
  blurb: 'Four friendly little robots in a cosy gear-and-conveyor workshop',
  arrival: 'parts box',
  defaultName: 'Bolt',
  creatures: [
    make('robot-round', 'blue round robot parts box', ORB, 84, orbSVG, 0),
    make('robot-boxy', 'purple boxy robot parts box', BOXY, 84, boxySVG, 1),
    make('robot-tall', 'yellow tall robot parts box', SPRINGY, 72, springySVG, 2),
    make('robot-tiny', 'green tiny robot parts box', TINY, 84, tinySVG, 3),
  ],
  scene: robotSceneSVG,
  island: robotIslandSVG,
};
