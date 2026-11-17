import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import { dragonEgg, islandSVG, sceneSVG } from './dragon-art';
import type { CreatureDef, Pack } from './types';

// Dragon Castle: four BABY dragons (chubby, round, tiny wings, soft horns/ridges) in a sunny fairy-tale kingdom.
// Silhouettes differ as well as colours:  ember = round bat-wings + two little horns + flame tail,
// frost = big pointy ears + kite/crystal wings + snowflake,  leaf = leaf ears + leaf wings + leaf tail,
// sun = star-shaped spikes arching over the head and down the tail + small round fairy wings.

const HY = 84;
const f1 = (n: number): string => (Math.round(n * 10) / 10).toString();

/** Mirror a left-hand drawing (x < 100) onto the right-hand side. */
const mirror = (s: string): string => `<g transform="translate(200 0) scale(-1 1)">${s}</g>`;
const both = (s: string): string => s + mirror(s);

/** A five-pointed star with rounded corners. */
const star = (cx: number, cy: number, R: number, r: number, rot: number, fill: string): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((rot - 90 + i * 36) * Math.PI) / 180;
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${f1(cx + rad * Math.cos(a))},${f1(cy + rad * Math.sin(a))}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${fill}" stroke-width="3" stroke-linejoin="round"/>`;
};

/** A leaf pointing up from (0,0), `len` long and `wid` wide, with a centre vein. */
const leaf = (len: number, wid: number, fill: string, vein: string): string =>
  `<path d="M0 0 Q${-wid} ${f1(-len * 0.5)} 0 ${-len} Q${wid} ${f1(-len * 0.5)} 0 0Z" fill="${fill}" stroke="${fill}" stroke-width="2" stroke-linejoin="round"/>` +
  `<path d="M0 -4 L0 ${f1(-len * 0.8)}" stroke="${vein}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;

/** A six-armed snowflake. */
const snowflake = (cx: number, cy: number, r: number, col: string, sw: number): string => {
  let d = '';
  for (let k = 0; k < 6; k++) {
    const a = (k * 60 * Math.PI) / 180;
    const ex = cx + r * Math.cos(a), ey = cy + r * Math.sin(a);
    d += `M${f1(cx)} ${f1(cy)} L${f1(ex)} ${f1(ey)} `;
    const bx = cx + r * 0.58 * Math.cos(a), by = cy + r * 0.58 * Math.sin(a);
    for (const s of [-1, 1]) {
      const b = a + (s * 42 * Math.PI) / 180;
      d += `M${f1(bx)} ${f1(by)} L${f1(bx + r * 0.34 * Math.cos(b))} ${f1(by + r * 0.34 * Math.sin(b))} `;
    }
  }
  return `<path d="${d}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
};

interface Spec {
  id: string;
  main: string;
  dark: string;
  belly: string;
  accent: string;
  /** behind the body (wings), left-hand drawing, mirrored automatically */
  wings: string;
  /** behind the head, inside the bobbing head group (horns, ears, spikes); already symmetrical */
  headBack: string;
  /** on the forehead, over the head disc */
  headFront: string;
  /** decoration on the belly */
  bellyDeco: string;
  /** the tail tip, drawn at (0,0) at the tail's end */
  tip: string;
  /** extra decoration on the tail itself */
  tailExtra?: string;
  /** extra decoration on the body itself (before the head), e.g. back spikes */
  bodyExtra?: string;
}

const TAIL_TIP: [number, number] = [193, 135];

const dragon = (s: Spec, growth: number): string => {
  const { main, dark, belly } = s;
  const armCol = mixHex(main, dark, 0.45);
  const toe = mixHex(belly, '#ffffff', 0.4);
  return `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="100" cy="202" rx="62" ry="9" fill="#0000001f"/>
  ${both(s.wings)}
  <g class="tail"><path d="M136 172 C172 188 200 170 195 134 C186 154 170 160 138 152Z" fill="${main}" stroke="${main}" stroke-width="3" stroke-linejoin="round"/>${s.tailExtra ?? ''}<g transform="translate(${TAIL_TIP[0]} ${TAIL_TIP[1]})">${s.tip}</g></g>
  <g class="bodyg">
    <ellipse cx="72" cy="192" rx="23" ry="11" fill="${dark}"/><ellipse cx="128" cy="192" rx="23" ry="11" fill="${dark}"/>
    <circle cx="60" cy="197" r="3.6" fill="${toe}"/><circle cx="72" cy="200" r="3.6" fill="${toe}"/><circle cx="84" cy="197" r="3.6" fill="${toe}"/>
    <circle cx="116" cy="197" r="3.6" fill="${toe}"/><circle cx="128" cy="200" r="3.6" fill="${toe}"/><circle cx="140" cy="197" r="3.6" fill="${toe}"/>
    <ellipse cx="100" cy="150" rx="54" ry="46" fill="${main}"/>
    <ellipse cx="100" cy="160" rx="35" ry="31" fill="${belly}"/>
    ${s.bellyDeco}
    ${s.bodyExtra ?? ''}
    <ellipse cx="49" cy="160" rx="11" ry="7.5" fill="${armCol}" transform="rotate(32 49 160)"/><ellipse cx="151" cy="160" rx="11" ry="7.5" fill="${armCol}" transform="rotate(-32 151 160)"/>
  </g>
  <g class="headg">
    ${s.headBack}
    <circle cx="100" cy="${HY}" r="43" fill="${main}"/>
    <ellipse cx="100" cy="${HY + 21}" rx="23" ry="15.5" fill="${belly}" opacity=".9"/>
    ${s.headFront}
    ${faceEyesSVG(HY)}
    <ellipse cx="93" cy="${HY + 11}" rx="2.2" ry="2.8" fill="${dark}" opacity=".6"/><ellipse cx="107" cy="${HY + 11}" rx="2.2" ry="2.8" fill="${dark}" opacity=".6"/>
    ${faceMouthSVG(HY)}
    ${accessorySVG(growth, HY)}
  </g>
  ${zzzSVG(HY)}
</svg>`;
};

// ---------------------------------------------------------------- ember (red): bat wings, two horns, flame tail
const EMBER = { main: '#ff2a3d', dark: '#c4001f', belly: '#ffe9b0', accent: '#ffd400' };
const emberHorn = `<path d="M72 ${HY - 30} Q58 ${HY - 52} 63 ${HY - 70} Q82 ${HY - 58} 88 ${HY - 38}Z" fill="#fff0c2" stroke="#fff0c2" stroke-width="4" stroke-linejoin="round"/>
  <path d="M63 ${HY - 70} Q60 ${HY - 59} 65 ${HY - 52} Q75 ${HY - 59} 78 ${HY - 62}Z" fill="#ffb84d"/>`;
const ember = (g: number): string => dragon({
  id: 'dragon-ember', ...EMBER,
  wings: `<path d="M66 128 Q42 104 14 90 Q8 110 20 118 Q14 132 30 134 Q28 146 48 146 Q60 142 66 136Z" fill="#ff8a5c" stroke="#ff8a5c" stroke-width="3" stroke-linejoin="round"/>
    <path d="M62 128 Q36 108 16 92 M56 134 Q34 126 22 120 M52 140 Q36 138 30 135" stroke="#c4001f" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  headBack: both(emberHorn),
  headFront: '',
  bellyDeco: `<g fill="none" stroke="#f2b45a" stroke-width="3.4" stroke-linecap="round"><path d="M80 146 Q100 154 120 146"/><path d="M76 160 Q100 170 124 160"/><path d="M80 174 Q100 183 120 174"/></g>`,
  tip: `<path d="M0 6 C-12 5 -13 -8 -4 -19 C-3 -11 1 -10 3 -22 C14 -11 13 3 0 6Z" fill="#ff9f1c" stroke="#ff9f1c" stroke-width="2" stroke-linejoin="round"/><path d="M0 4 C-6 3 -6 -4 -1 -9 C0 -4 3 -3 4 -9 C8 -3 6 3 0 4Z" fill="#ffe066"/>`,
}, g);

// ---------------------------------------------------------------- frost (blue): pointy ears, crystal wings, snowflakes
const FROST = { main: '#1f7bff', dark: '#0a49c9', belly: '#e8f6ff', accent: '#9be8ff' };
const frostEar = `<path d="M66 ${HY - 22} L10 ${HY - 40} L58 ${HY + 4}Z" fill="#1f7bff" stroke="#1f7bff" stroke-width="6" stroke-linejoin="round"/>
  <path d="M58 ${HY - 16} L26 ${HY - 28} L54 ${HY - 3}Z" fill="#cdeeff" stroke="#cdeeff" stroke-width="3" stroke-linejoin="round"/>`;
const frost = (g: number): string => dragon({
  id: 'dragon-frost', ...FROST,
  wings: `<path d="M66 124 L38 82 L8 108 L40 144Z" fill="#7fc4ff" stroke="#7fc4ff" stroke-width="4" stroke-linejoin="round"/>
    <path d="M66 124 L8 108 M38 82 L40 144" stroke="#e3f5ff" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M38 82 L52 103 L8 108Z" fill="#ffffff" opacity=".45"/>${snowflake(34, 118, 9, '#ffffff', 2.4)}`,
  headBack: both(frostEar),
  headFront: '',
  bellyDeco: snowflake(100, 162, 16, '#8fd4ff', 3.2),
  tip: `<path d="M0 -17 L10 0 L0 14 L-10 0Z" fill="#9be8ff" stroke="#9be8ff" stroke-width="3" stroke-linejoin="round"/><path d="M0 -17 L0 14" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>`,
}, g);

// ---------------------------------------------------------------- leaf (neon green): leaf ears, leaf wings, leaf tail
const LEAF = { main: '#2dff5a', dark: '#00b52e', belly: '#f1ffd8', accent: '#ffd400' };
const leafEar = `<g transform="translate(75 ${HY - 32}) rotate(-30)">${leaf(50, 19, '#00b52e', '#7dffa0')}</g>`;
const leafBelly = `<g transform="translate(100 176)">${leaf(34, 13, '#9be86a', '#e8ffc4')}</g>`;
const leafy = (g: number): string => dragon({
  id: 'dragon-leaf', ...LEAF,
  wings: `<g transform="translate(62 130) rotate(-64)">${leaf(62, 25, '#12d64a', '#b8ffcb')}</g>`,
  headBack: both(leafEar),
  headFront: '',
  bellyDeco: leafBelly,
  tip: `<g transform="rotate(16)">${leaf(34, 15, '#00b52e', '#7dffa0')}</g>`,
  tailExtra: `<g transform="translate(166 160) rotate(20)">${leaf(18, 8, '#00b52e', '#7dffa0')}</g>`,
}, g);

// ---------------------------------------------------------------- sun (golden yellow): star spikes, small round fairy wings
const SUN = { main: '#ffd400', dark: '#e09b00', belly: '#fff6c4', accent: '#ff8a1f' };
const sunStars = [-155, -125, -95, -65, -35]
  .map((a, i) => {
    const rad = (a * Math.PI) / 180;
    const R = i === 2 ? 17 : i % 2 === 0 ? 14 : 13;
    return star(100 + 55 * Math.cos(rad), HY + 55 * Math.sin(rad), R, R * 0.47, a + 90, '#ff8a1f');
  })
  .join('');
const sunny = (g: number): string => dragon({
  id: 'dragon-sun', ...SUN,
  wings: `<ellipse cx="38" cy="108" rx="24" ry="13" fill="#ffb13d" transform="rotate(-48 38 108)"/>
    <ellipse cx="38" cy="108" rx="12" ry="5.5" fill="#fff3b0" opacity=".75" transform="rotate(-48 38 108)"/>
    <ellipse cx="42" cy="136" rx="15" ry="8.5" fill="#ffb13d" transform="rotate(-12 42 136)"/>`,
  headBack: sunStars,
  headFront: '',
  bellyDeco: star(100, 162, 16, 7.4, 0, '#ffc233'),
  bodyExtra: '',
  tip: star(2, -2, 14, 6.6, 12, '#ff8a1f'),
  tailExtra: star(160, 160, 8.5, 4, 0, '#ff8a1f'),
}, g);

const mk = (id: string, label: string, c: { main: string; dark: string; accent: string }, svg: (g: number) => string): CreatureDef => ({
  id, label, main: c.main, dark: c.dark, accent: c.accent, hy: HY, svg, egg: () => dragonEgg(id, c.main, c.dark, c.accent),
});

export const pack: Pack = {
  id: 'dragon',
  name: 'Dragon Castle',
  blurb: 'Baby dragons and a fairy-tale castle',
  arrival: 'egg',
  defaultName: 'Dragon',
  creatures: [
    mk('dragon-ember', 'red dragon egg', EMBER, ember),
    mk('dragon-frost', 'blue dragon egg', FROST, frost),
    mk('dragon-leaf', 'green dragon egg', LEAF, leafy),
    mk('dragon-sun', 'yellow dragon egg', SUN, sunny),
  ],
  scene: sceneSVG,
  island: islandSVG,
};
