// Per-world props for Beat the Drum, Sound Safari and Word Kitchen (inline SVG, original art). The world id is document.body.dataset.pack.
// The props change how the games LOOK; their logic, test ids and sizes are identical in every world.

import { packById } from './themes';

// DATA-DRIVEN per pack: each table below has hand-drawn entries for some packs; every other pack (the newer ones, or any added later) gets a
// DEFAULT built from its own creature colours, so a pack with no themed props yet still shows a sensible, coloured drum, pot and cover
// (never nothing, never an error).
export type World = string;
export const worldId = (): World => document.body.dataset.pack || 'dino';
/** The pack's own colours (its first creature's main, dark and accent), with neutral fallbacks. Never throws. */
export interface Tint { main: string; dark: string; accent: string }
const NEUTRAL: Tint = { main: '#ef476f', dark: '#c2284f', accent: '#ffd166' };
export const worldTint = (w: World = worldId()): Tint => {
  try {
    const c = packById(w).creatures[0];
    return c ? { main: c.main || NEUTRAL.main, dark: c.dark || NEUTRAL.dark, accent: c.accent || NEUTRAL.accent } : NEUTRAL;
  } catch { return NEUTRAL; }
};
/** True when the pack has hand-drawn game props (the six original worlds); others use the generated defaults. */
export const hasThemedProps = (w: World = worldId()): boolean => w in DRUMS;

// ---------------------------------------------------------------------------------------------------------------
// Drums. viewBox 0 0 200 170; the skin (the part that is hit) is an ellipse.skin at (100,70) rx72 ry26; ellipse.ripple is the
// ring that spreads from the skin on every tap.
// ---------------------------------------------------------------------------------------------------------------
const drumOpen = '<svg class="drum-art" viewBox="0 0 200 170" role="img" aria-hidden="true" focusable="false"><ellipse cx="100" cy="160" rx="74" ry="8" fill="#0000001f"/>';
const ripple = (c: string) => `<ellipse class="ripple" cx="100" cy="70" rx="72" ry="26" fill="none" stroke="${c}" stroke-width="6" opacity="0"/>`;
const CYL = 'M28 70 L28 130 Q28 152 100 152 Q172 152 172 130 L172 70Z';

const DRUMS: Record<string, string> = {
  // a stone drum with a hide stretched over it and a little moss
  dino: `${drumOpen}<path d="${CYL}" fill="#aaa192"/>
    <path d="M28 98 Q100 122 172 98 M28 124 Q100 148 172 124" fill="none" stroke="#857c6e" stroke-width="3.5"/>
    <path d="M58 108 v16 M104 114 v18 M146 106 v14 M80 132 v16 M126 134 v14" stroke="#857c6e" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M28 112 q8 12 20 8 q10 10 22 6 q-8 14 -22 12 q-18 -2 -20 -26z" fill="#74a869"/>
    <path d="M40 80 Q36 98 40 118" stroke="#fff" opacity=".28" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="${CYL}" fill="none" stroke="#6f6659" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#f1d9a5" stroke="#9c7a45" stroke-width="5"/>
    <ellipse cx="100" cy="70" rx="72" ry="26" fill="none" stroke="#7a5a2c" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" transform="translate(0 6)"/>${ripple('#fff')}</svg>`,
  // a barrel drum covered in violet dragon scales, gold bands and studs
  dragon: `${drumOpen}<defs><clipPath id="dgBody"><path d="M26 70 Q14 112 26 138 Q42 154 100 154 Q158 154 174 138 Q186 112 174 70Z"/></clipPath></defs>
    <path d="M26 70 Q14 112 26 138 Q42 154 100 154 Q158 154 174 138 Q186 112 174 70Z" fill="#7a5ad6"/>
    <g clip-path="url(#dgBody)" fill="none" stroke="#5a3fb0" stroke-width="3.2" stroke-linecap="round">
      ${[0, 1, 2, 3, 4].map((r) => Array.from({ length: 11 }, (_, k) => `<path d="M${4 + (r % 2) * 10 + k * 20} ${86 + r * 14} q10 13 20 0"/>`).join('')).join('')}
    </g>
    <path d="M23 88 Q100 114 177 88" fill="none" stroke="#ffd166" stroke-width="7" stroke-linecap="round"/><path d="M32 138 Q100 162 168 138" fill="none" stroke="#ffd166" stroke-width="7" stroke-linecap="round"/>
    <path d="M26 70 Q14 112 26 138 Q42 154 100 154 Q158 154 174 138 Q186 112 174 70Z" fill="none" stroke="#4b34a1" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#fff2d6" stroke="#ffd166" stroke-width="5"/>
    <path d="M100 50 q11 13 1 22 q-4 -4 -2 -9 q-11 7 -6 18 q-14 -11 2 -25 q2 5 5 -6z" fill="#ff9f43" stroke="#ef476f" stroke-width="2" stroke-linejoin="round"/>
    ${[40, 62, 84, 116, 138, 160].map((x) => `<circle cx="${x}" cy="${70 + Math.round(26 * Math.sqrt(1 - ((x - 100) / 72) ** 2)) + 6}" r="3.4" fill="#ffd166"/>`).join('')}${ripple('#ffd166')}</svg>`,
  // a road-works traffic drum: orange with two white reflective bands and a black rubber top
  transport: `${drumOpen}<path d="${CYL}" fill="#ff8a3d"/>
    <path d="M28 90 Q100 116 172 90 L172 104 Q100 130 28 104Z" fill="#fff"/><path d="M28 114 Q100 140 172 114 L172 126 Q100 152 28 126Z" fill="#fff"/>
    <path d="M40 78 Q36 98 40 120" stroke="#fff" opacity=".35" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="${CYL}" fill="none" stroke="#d2621c" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#3b4252" stroke="#ffc933" stroke-width="5"/>
    <ellipse cx="100" cy="70" rx="52" ry="17" fill="none" stroke="#596277" stroke-width="3"/>
    <ellipse cx="100" cy="70" rx="72" ry="26" fill="none" stroke="#3b4252" stroke-width="3" stroke-dasharray="12 12" transform="translate(0 6)"/>${ripple('#ffc933')}</svg>`,
  // a metal pad with a glowing cyan rim
  space: `${drumOpen}<path d="${CYL}" fill="#55627f"/>
    <path d="M28 122 L28 130 Q28 152 100 152 Q172 152 172 130 L172 122 Q100 148 28 122Z" fill="#3a4560"/>
    <path d="M64 86 v58 M138 86 v58" stroke="#3f4a67" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M28 102 Q100 128 172 102" fill="none" stroke="#5ef2ff" stroke-width="13" opacity=".22" stroke-linecap="round"/><path d="M28 102 Q100 128 172 102" fill="none" stroke="#5ef2ff" stroke-width="5" stroke-linecap="round"/>
    <path d="${CYL}" fill="none" stroke="#38425e" stroke-width="4"/>
    <ellipse cx="100" cy="70" rx="76" ry="29" fill="none" stroke="#5ef2ff" stroke-width="9" opacity=".25"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#1c2550" stroke="#5ef2ff" stroke-width="4"/>
    <ellipse cx="100" cy="70" rx="44" ry="15" fill="none" stroke="#5ef2ff" stroke-width="2.5" opacity=".7"/><circle cx="100" cy="70" r="5" fill="#5ef2ff"/>${ripple('#5ef2ff')}</svg>`,
  // a giant pink scallop-shell drum with a pearl
  ocean: `${drumOpen}<path d="M26 70 Q20 124 50 144 Q100 162 150 144 Q180 124 174 70Z" fill="#ffb0bf"/>
    <path d="M100 160 L30 86 M100 160 L52 92 M100 160 L76 96 M100 160 L100 98 M100 160 L124 96 M100 160 L148 92 M100 160 L170 86" stroke="#ea6a85" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M38 84 Q36 104 44 124" stroke="#fff" opacity=".4" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M26 70 Q20 124 50 144 Q100 162 150 144 Q180 124 174 70Z" fill="none" stroke="#e0577a" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#fff0f6" stroke="#f7c6d4" stroke-width="5"/>
    <circle cx="100" cy="70" r="12" fill="#fff" stroke="#d9c4ee" stroke-width="3"/><circle cx="96" cy="66" r="3.4" fill="#d9c4ee"/>${ripple('#fff')}</svg>`,
  // a steel milk pail with a red band; the skin is the milk
  farm: `${drumOpen}<circle cx="21" cy="82" r="8" fill="none" stroke="#7d8798" stroke-width="5"/><circle cx="179" cy="82" r="8" fill="none" stroke="#7d8798" stroke-width="5"/>
    <path d="M24 70 L44 138 Q46 152 100 152 Q154 152 156 138 L176 70Z" fill="#b9c4d4"/>
    <path d="M31 92 Q100 118 169 92 L163 110 Q100 136 37 110Z" fill="#ef476f"/>
    <path d="M42 80 L54 136" stroke="#fff" opacity=".5" stroke-width="6" stroke-linecap="round"/>
    <path d="M24 70 L44 138 Q46 152 100 152 Q154 152 156 138 L176 70Z" fill="none" stroke="#7d8798" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#fffdf3" stroke="#b9c4d4" stroke-width="5"/>
    <ellipse cx="100" cy="72" rx="44" ry="13" fill="none" stroke="#efe6c6" stroke-width="3"/>${ripple('#4cc3d9')}</svg>`,
};
/** A default drum in the pack's colours: a coloured shell with accent stripes and a hide on top. */
const defaultDrum = (t: Tint): string => `${drumOpen}<path d="${CYL}" fill="${t.main}"/>
    <path d="M40 74 L60 148 M70 78 L90 152 M100 80 L100 152 M130 78 L110 152 M160 74 L140 148" stroke="${t.accent}" stroke-width="5" stroke-linecap="round" opacity=".9"/>
    <path d="${CYL}" fill="none" stroke="${t.dark}" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#fff5e0" stroke="#e0cfa8" stroke-width="5"/>
    <ellipse cx="100" cy="70" rx="72" ry="26" fill="none" stroke="${t.accent}" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round" transform="translate(0 6)"/>${ripple(t.accent)}</svg>`;
export const drumArt = (w: World = worldId()): string => DRUMS[w] ?? defaultDrum(worldTint(w));

// ---------------------------------------------------------------------------------------------------------------
// Cooking pots. viewBox 0 0 160 150; the rim is at y 56-70, the lid (class "lid") sits above it.
// ---------------------------------------------------------------------------------------------------------------
const potOpen = '<svg class="pot-art" viewBox="0 0 160 150" role="img" aria-hidden="true" focusable="false"><ellipse cx="80" cy="142" rx="58" ry="8" fill="#0000001f"/>';
const BODY = 'M22 62 Q22 138 80 138 Q138 138 138 62Z';
const rim = (fill: string, stroke: string) => `<rect x="8" y="56" width="144" height="14" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="4"/>`;
const shine = '<path d="M34 80 Q38 124 62 130" stroke="#fff" stroke-width="5" fill="none" opacity=".28" stroke-linecap="round"/>';
const LID = 'M30 56 Q30 30 80 30 Q130 30 130 56Z';

const POTS: Record<string, string> = {
  // a clay cooking pot with a leaf for a lid
  dino: `${potOpen}<path d="${BODY}" fill="#c9794a"/><path d="M30 92 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8" stroke="#f3d9a8" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M34 110 h92" stroke="#f3d9a8" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
    <path d="${BODY}" fill="none" stroke="#8f4f2a" stroke-width="4"/>${shine}${rim('#d98f5b', '#8f4f2a')}
    <g class="lid"><path d="${LID}" fill="#6fb55a" stroke="#3f7f3a" stroke-width="4"/><path d="M80 32 V56 M80 40 L62 50 M80 40 L98 50" stroke="#3f7f3a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="80" cy="26" r="7" fill="#f1e6c8" stroke="#b9a77c" stroke-width="3"/></g></svg>`,
  // a black cauldron with a green glow, three feet and a ruby on the lid
  dragon: `${potOpen}<path d="M40 132 l-6 12 h14z M80 136 l-6 8 h12z M120 132 l6 12 h-14z" fill="#2a2540"/><path d="M30 138 q-6 -10 2 -16 q0 8 6 8z M130 138 q6 -10 -2 -16 q0 8 -6 8z" fill="#ff9f43" opacity=".95" class="flame"/>
    <path d="${BODY}" fill="#3b3550"/><path d="M30 96 Q80 112 130 96" stroke="#7bd389" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/><circle cx="52" cy="112" r="5" fill="#7bd389" opacity=".5"/><circle cx="104" cy="118" r="4" fill="#7bd389" opacity=".5"/>
    <path d="${BODY}" fill="none" stroke="#26213a" stroke-width="4"/>${shine}${rim('#54486e', '#26213a')}
    <g class="lid"><path d="${LID}" fill="#54486e" stroke="#26213a" stroke-width="4"/><path d="M80 24 l7 8 l-7 10 l-7 -10z" fill="#ef476f" stroke="#a02549" stroke-width="2.5" stroke-linejoin="round"/></g></svg>`,
  // a little steam boiler: red, with a yellow band, rivets, a gauge and a whistle on top
  transport: `${potOpen}<path d="${BODY}" fill="#e5484d"/><path d="M24 94 Q80 108 136 94 L136 106 Q80 120 24 106Z" fill="#ffd166"/>
    <circle cx="48" cy="112" r="3" fill="#fff" opacity=".7"/><circle cx="80" cy="120" r="3" fill="#fff" opacity=".7"/><circle cx="112" cy="112" r="3" fill="#fff" opacity=".7"/>
    <circle cx="80" cy="82" r="11" fill="#fff" stroke="#8693b3" stroke-width="3.5"/><path d="M80 82 L86 76" stroke="#ef476f" stroke-width="2.5" stroke-linecap="round"/>
    <path d="${BODY}" fill="none" stroke="#a8282c" stroke-width="4"/>${shine}${rim('#8693b3', '#4a5876')}
    <g class="lid"><path d="${LID}" fill="#8693b3" stroke="#4a5876" stroke-width="4"/><rect x="72" y="14" width="16" height="18" rx="3" fill="#6b7a99" stroke="#4a5876" stroke-width="3"/><rect x="68" y="10" width="24" height="7" rx="3.5" fill="#ffc933" stroke="#c98f00" stroke-width="2.5"/></g></svg>`,
  // a glowing cooking pod with a glass dome
  space: `${potOpen}<path d="M30 134 h100" stroke="#3a4560" stroke-width="7" stroke-linecap="round"/><path d="${BODY}" fill="#7a86a6"/>
    <rect x="34" y="88" width="92" height="14" rx="7" fill="#1c2550"/><rect x="38" y="91" width="84" height="8" rx="4" fill="#5ef2ff" opacity=".85"/>
    <circle cx="52" cy="118" r="3" fill="#5ef2ff"/><circle cx="80" cy="122" r="3" fill="#5ef2ff"/><circle cx="108" cy="118" r="3" fill="#5ef2ff"/>
    <path d="${BODY}" fill="none" stroke="#4a557a" stroke-width="4"/>${shine}${rim('#9aa6c6', '#4a557a')}
    <g class="lid"><path d="${LID}" fill="#bff6ff" fill-opacity=".55" stroke="#8fe6ff" stroke-width="4"/><path d="M48 50 Q50 38 66 36" stroke="#fff" stroke-width="4" fill="none" opacity=".8" stroke-linecap="round"/><circle cx="80" cy="26" r="6" fill="#5ef2ff" stroke="#1c8fa6" stroke-width="3"/></g></svg>`,
  // a clam pot: a ribbed pink shell, the top shell is the lid, a pearl for the knob
  ocean: `${potOpen}<path d="${BODY}" fill="#ffb0bf"/><path d="M80 138 L34 76 M80 138 L52 80 M80 138 L68 82 M80 138 L80 82 M80 138 L92 82 M80 138 L108 80 M80 138 L126 76" stroke="#ea6a85" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="${BODY}" fill="none" stroke="#e0577a" stroke-width="4"/>${shine}${rim('#ffc9d4', '#e0577a')}
    <g class="lid"><path d="${LID}" fill="#ffc9d4" stroke="#e0577a" stroke-width="4"/><path d="M80 56 L44 44 M80 56 L58 36 M80 56 L80 32 M80 56 L102 36 M80 56 L116 44" stroke="#ea6a85" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="80" cy="26" r="7" fill="#fff" stroke="#d9c4ee" stroke-width="3"/></g></svg>`,
  // a red enamel pot with white spots and wooden handles
  farm: `${potOpen}<rect x="2" y="74" width="22" height="9" rx="4.5" fill="#a77a3a" stroke="#6b4a1d" stroke-width="3"/><rect x="136" y="74" width="22" height="9" rx="4.5" fill="#a77a3a" stroke="#6b4a1d" stroke-width="3"/>
    <path d="${BODY}" fill="#e04f5f"/><g fill="#fff" opacity=".9"><circle cx="48" cy="92" r="5"/><circle cx="80" cy="102" r="5"/><circle cx="112" cy="92" r="5"/><circle cx="64" cy="120" r="4"/><circle cx="98" cy="122" r="4"/></g>
    <path d="${BODY}" fill="none" stroke="#a02838" stroke-width="4"/>${shine}${rim('#fff', '#a02838')}
    <g class="lid"><path d="${LID}" fill="#e04f5f" stroke="#a02838" stroke-width="4"/><circle cx="80" cy="26" r="7" fill="#a77a3a" stroke="#6b4a1d" stroke-width="3"/></g></svg>`,
};
/** A default pot in the pack's colours with a matching lid (the lid still pops off). */
const defaultPot = (t: Tint): string => `${potOpen}<path d="${BODY}" fill="${t.main}"/><path d="M30 94 Q80 110 130 94" stroke="${t.accent}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="${BODY}" fill="none" stroke="${t.dark}" stroke-width="4"/>${shine}${rim(t.accent, t.dark)}
    <g class="lid"><path d="${LID}" fill="${t.main}" stroke="${t.dark}" stroke-width="4"/><circle cx="80" cy="26" r="7" fill="${t.accent}" stroke="${t.dark}" stroke-width="3"/></g></svg>`;
export const potArt = (w: World = worldId()): string => POTS[w] ?? defaultPot(worldTint(w));

// ---------------------------------------------------------------------------------------------------------------
// Sound Safari covers. Each safari cell is a square: a BACK layer (a hole, a crater, a window... behind the picture) and a
// FRONT layer (ferns, battlements, coral... in front of the bottom of the picture), so the picture "peeks" out. viewBox 0 0 100 100.
// ---------------------------------------------------------------------------------------------------------------
const cov = (inner: string, cls: string) => `<svg class="cover ${cls}" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">${inner}</svg>`;
const fern = (angles: number[], c1: string, c2: string) =>
  angles.map((a, i) => `<ellipse cx="50" cy="80" rx="7.5" ry="25" fill="${i % 2 ? c1 : c2}" transform="rotate(${a} 50 104)"/>`).join('');
const brick = (y0: number, y1: number, c: string) => {
  let s = '';
  for (let y = y0, r = 0; y < y1; y += 9, r++) {
    s += `<path d="M0 ${y} H100" stroke="${c}" stroke-width="1.6"/>`;
    for (let x = (r % 2) * 10; x < 100; x += 20) s += `<path d="M${x} ${y} v9" stroke="${c}" stroke-width="1.6"/>`;
  }
  return s;
};

interface Cover { back: string; front: string }
const COVERS: Record<string, Cover[]> = {
  dino: [
    { back: cov('<ellipse cx="50" cy="82" rx="40" ry="14" fill="#2f6e3b" opacity=".35"/>', 'back'),
      front: cov(`${fern([-64, -40, -18, 0, 18, 40, 64], '#4caf5d', '#2f8a47')}<ellipse cx="50" cy="102" rx="48" ry="13" fill="#2a7a3d"/>`, 'front') },
    { back: cov('<ellipse cx="50" cy="82" rx="40" ry="14" fill="#2f6e3b" opacity=".35"/>', 'back'),
      front: cov(`${fern([-58, -30, -8, 12, 34, 60], '#6fcf6a', '#3f9b52')}<ellipse cx="50" cy="102" rx="48" ry="13" fill="#3a8c46"/><circle cx="20" cy="84" r="3.5" fill="#ff9f43"/><circle cx="82" cy="88" r="3" fill="#ff6b9a"/>`, 'front') },
  ],
  dragon: [
    { back: cov('<rect x="6" y="14" width="88" height="70" rx="12" fill="#ffffff" opacity=".0"/>', 'back'),
      front: cov(`<path d="M0 70 H100 V100 H0Z" fill="#b9b2d6"/>${brick(70, 100, '#8d85b8')}<g fill="#c9c2e8" stroke="#8d85b8" stroke-width="2"><rect x="3" y="58" width="22" height="14" rx="2"/><rect x="39" y="58" width="22" height="14" rx="2"/><rect x="75" y="58" width="22" height="14" rx="2"/></g>`, 'front') },
    { back: cov('', 'back'),
      front: cov(`<path d="M0 70 H100 V100 H0Z" fill="#c6bde6"/>${brick(70, 100, '#9a90c4')}<g fill="#d3cbf0" stroke="#9a90c4" stroke-width="2"><rect x="-4" y="58" width="22" height="14" rx="2"/><rect x="21" y="58" width="22" height="14" rx="2"/><rect x="57" y="58" width="22" height="14" rx="2"/><rect x="82" y="58" width="22" height="14" rx="2"/></g><path d="M50 58 V40" stroke="#7a4a1d" stroke-width="2.5"/><path d="M50 40 L66 46 L50 52Z" fill="#ef476f"/>`, 'front') },
  ],
  transport: [
    { back: cov('', 'back'),
      front: cov(`<path d="M0 0 H100 V13 H0Z" fill="#ef476f"/><path d="M0 13 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0Z" fill="#ef476f"/><path d="M12.5 0 v22 M37.5 0 v22 M62.5 0 v22 M87.5 0 v22" stroke="#fff" stroke-width="12.5" opacity=".85"/>
        <rect x="0" y="86" width="100" height="14" fill="#9aa5b8"/><rect x="6" y="68" width="88" height="22" rx="5" fill="#8a5a2c"/><g><circle cx="22" cy="66" r="6" fill="#ff6b9a"/><circle cx="40" cy="62" r="6" fill="#ffd166"/><circle cx="58" cy="66" r="6" fill="#ff6b9a"/><circle cx="76" cy="62" r="6" fill="#ffd166"/></g><g fill="#4caf5d"><circle cx="30" cy="70" r="7"/><circle cx="50" cy="68" r="7"/><circle cx="68" cy="70" r="7"/><circle cx="86" cy="68" r="6"/></g>`, 'front') },
    { back: cov('', 'back'),
      front: cov(`<path d="M0 0 H100 V13 H0Z" fill="#4cc3d9"/><path d="M0 13 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0 q6.25 9 12.5 0Z" fill="#4cc3d9"/><path d="M12.5 0 v22 M37.5 0 v22 M62.5 0 v22 M87.5 0 v22" stroke="#fff" stroke-width="12.5" opacity=".85"/>
        <rect x="0" y="86" width="100" height="14" fill="#9aa5b8"/><rect x="6" y="68" width="88" height="22" rx="5" fill="#8a5a2c"/><g fill="#4caf5d"><circle cx="24" cy="68" r="7"/><circle cx="44" cy="66" r="7"/><circle cx="64" cy="68" r="7"/><circle cx="82" cy="66" r="7"/></g><g><circle cx="24" cy="63" r="5" fill="#fff"/><circle cx="44" cy="60" r="5" fill="#ffd166"/><circle cx="64" cy="63" r="5" fill="#fff"/><circle cx="82" cy="60" r="5" fill="#ff6b9a"/></g>`, 'front') },
  ],
  space: [
    { back: cov('<ellipse cx="50" cy="72" rx="42" ry="15" fill="#1f2350"/><ellipse cx="50" cy="72" rx="42" ry="15" fill="none" stroke="#8d89b3" stroke-width="3"/>', 'back'),
      front: cov('<path d="M4 74 Q50 108 96 74 L100 100 H0Z" fill="#aaa6cc"/><path d="M4 74 Q50 100 96 74 Q50 90 4 74Z" fill="#7f7ba8"/><ellipse cx="22" cy="92" rx="8" ry="4" fill="#8d89b3"/><ellipse cx="74" cy="94" rx="10" ry="4.5" fill="#8d89b3"/>', 'front') },
    { back: cov('<ellipse cx="50" cy="72" rx="42" ry="15" fill="#2a1f50"/><ellipse cx="50" cy="72" rx="42" ry="15" fill="none" stroke="#9a86b8" stroke-width="3"/>', 'back'),
      front: cov('<path d="M4 74 Q50 108 96 74 L100 100 H0Z" fill="#b59bc9"/><path d="M4 74 Q50 100 96 74 Q50 90 4 74Z" fill="#8c72a8"/><circle cx="30" cy="92" r="5" fill="#9a86b8"/><circle cx="68" cy="90" r="4" fill="#9a86b8"/><circle cx="82" cy="96" r="3" fill="#9a86b8"/>', 'front') },
  ],
  ocean: [
    { back: cov('<ellipse cx="50" cy="86" rx="40" ry="10" fill="#e7cf95" opacity=".7"/>', 'back'),
      front: cov(`<g stroke="#ff7f8f" stroke-width="8" fill="none" stroke-linecap="round"><path d="M22 100 V72 M22 86 L10 72 M22 80 L34 68"/><path d="M52 100 V66 M52 84 L38 68 M52 76 L66 62"/><path d="M82 100 V74 M82 88 L92 74 M82 80 L72 68"/></g><circle cx="22" cy="70" r="5" fill="#ffb0bf"/><circle cx="52" cy="63" r="5" fill="#ffb0bf"/><circle cx="82" cy="72" r="5" fill="#ffb0bf"/><path d="M0 100 Q50 88 100 100Z" fill="#e7cf95"/>`, 'front') },
    { back: cov('<ellipse cx="50" cy="86" rx="40" ry="10" fill="#e7cf95" opacity=".7"/>', 'back'),
      front: cov('<path d="M16 100 Q16 66 50 66 Q84 66 84 100Z" fill="#9b8bf0"/><path d="M50 100 L24 78 M50 100 L36 70 M50 100 L50 66 M50 100 L64 70 M50 100 L76 78" stroke="#6a5bc0" stroke-width="3" stroke-linecap="round"/><g stroke="#ff9f43" stroke-width="7" fill="none" stroke-linecap="round"><path d="M92 100 V76 M92 88 L84 78"/><path d="M8 100 V80 M8 90 L16 82"/></g><path d="M0 100 Q50 88 100 100Z" fill="#e7cf95"/>', 'front') },
  ],
  farm: [
    { back: cov('<ellipse cx="50" cy="88" rx="42" ry="9" fill="#5a8a3a" opacity=".3"/>', 'back'),
      front: cov('<rect x="4" y="62" width="92" height="40" rx="14" fill="#f2cf63"/><path d="M14 74 H86 M12 84 H88 M16 94 H84" stroke="#d4a93a" stroke-width="2.6" stroke-linecap="round"/><path d="M30 62 V102 M70 62 V102" stroke="#c98f2a" stroke-width="4"/><path d="M8 66 l-4 -8 M20 62 l-2 -8 M44 62 l0 -9 M58 62 l2 -8 M80 62 l3 -9 M92 66 l5 -7" stroke="#f2cf63" stroke-width="3.5" stroke-linecap="round"/>', 'front') },
    { back: cov('<ellipse cx="50" cy="88" rx="42" ry="9" fill="#5a8a3a" opacity=".3"/>', 'back'),
      front: cov('<g fill="#3f9b52"><circle cx="20" cy="89" r="18"/><circle cx="46" cy="82" r="20"/><circle cx="72" cy="88" r="19"/><circle cx="90" cy="95" r="14"/></g><g fill="#5cc26b"><circle cx="16" cy="85" r="11"/><circle cx="46" cy="76" r="13"/><circle cx="72" cy="83" r="12"/></g><rect x="0" y="92" width="100" height="10" fill="#3f9b52"/><circle cx="30" cy="91" r="3" fill="#ff6b9a"/><circle cx="60" cy="86" r="3" fill="#ffd166"/><circle cx="84" cy="96" r="3" fill="#ff6b9a"/>', 'front') },
  ],
};
/** A default cover: leafy bushes (neutral green) with a few flowers in the pack's accent colour. */
const defaultCovers = (t: Tint): Cover[] => [0, 1].map((v) => ({
  back: cov('<ellipse cx="50" cy="88" rx="42" ry="9" fill="#5a8a3a" opacity=".3"/>', 'back'),
  front: cov(`<g fill="#3f9b52"><circle cx="${v ? 24 : 20}" cy="89" r="18"/><circle cx="46" cy="${v ? 80 : 82}" r="20"/><circle cx="72" cy="88" r="19"/><circle cx="90" cy="95" r="14"/></g><g fill="#5cc26b"><circle cx="${v ? 24 : 16}" cy="85" r="11"/><circle cx="46" cy="76" r="13"/><circle cx="72" cy="83" r="12"/></g><rect x="0" y="92" width="100" height="10" fill="#3f9b52"/><circle cx="30" cy="91" r="3.2" fill="${t.accent}"/><circle cx="60" cy="${v ? 80 : 86}" r="3.2" fill="${t.main}"/><circle cx="84" cy="96" r="3.2" fill="${t.accent}"/>`, 'front'),
}));
export const coverFor = (w: World, i: number): Cover => {
  const list = COVERS[w] ?? defaultCovers(worldTint(w));
  return list[i % list.length] as Cover;
};

/** The creature's arms and the two sticks it hits with (drawn over the drum; the pivots are the hands). At rest each stick hovers over the skin. */
export const sticksArt = (hand: string): string => `<svg class="sticks" viewBox="0 0 200 170" aria-hidden="true" focusable="false">
  <g class="stick sl"><line x1="56" y1="6" x2="80" y2="62" stroke="#b5793c" stroke-width="6" stroke-linecap="round"/><circle cx="81" cy="63" r="7" fill="#ffd166" stroke="#c98f00" stroke-width="2.5"/><line x1="78" y1="22" x2="56" y2="6" stroke="${hand}" stroke-width="10" stroke-linecap="round"/><circle cx="56" cy="6" r="8.5" fill="${hand}" stroke="#0003" stroke-width="2"/></g>
  <g class="stick sr"><line x1="144" y1="6" x2="120" y2="62" stroke="#b5793c" stroke-width="6" stroke-linecap="round"/><circle cx="119" cy="63" r="7" fill="#ffd166" stroke="#c98f00" stroke-width="2.5"/><line x1="122" y1="22" x2="144" y2="6" stroke="${hand}" stroke-width="10" stroke-linecap="round"/><circle cx="144" cy="6" r="8.5" fill="${hand}" stroke="#0003" stroke-width="2"/></g>
</svg>`;

// ---------------------------------------------------------------------------------------------------------------
// World flavour for the sound-friend that appears when a letter is traced: a glow in the world's colour and a small medal with the
// world's emblem (a leaf, a flame, a star, a ringed planet, a shell, an ear of wheat), so the friend feels like it belongs to this world.
// ---------------------------------------------------------------------------------------------------------------
const WORLD_GLOW: Record<string, string> = { dino: '#b5e46a', dragon: '#ffb36b', transport: '#ffd166', space: '#b7a2ff', ocean: '#8fe0f7', farm: '#ffd98a' };
const EMBLEM: Record<string, string> = {
  dino: '<path d="M0 -13 C12 -9 12 8 0 14 C-12 8 -12 -9 0 -13Z" fill="#5cb85c"/><path d="M0 -9 V11" stroke="#2f7d3a" stroke-width="2"/>',
  dragon: '<path d="M0 -14 C9 -4 11 5 0 13 C-11 5 -9 -4 0 -14Z" fill="#ff9f43"/><path d="M0 -3 C4 2 4 7 0 10 C-4 7 -4 2 0 -3Z" fill="#ffe27a"/>',
  transport: '<path d="M0 -14 L4 -4.5 L14 -4.5 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14 -4.5 L-4 -4.5Z" fill="#ffc233"/>',
  space: '<circle r="7.5" fill="#a98bff"/><ellipse rx="14" ry="4.5" fill="none" stroke="#ffd166" stroke-width="2.6" transform="rotate(-20)"/>',
  ocean: '<path d="M0 12 L-13 -2 Q-12 -13 0 -12 Q12 -13 13 -2Z" fill="#ff9fb4"/><path d="M0 12 L-7 -10 M0 12 L0 -12 M0 12 L7 -10" stroke="#e0577a" stroke-width="1.8" fill="none"/>',
  farm: '<path d="M0 14 V-10" stroke="#c98f2a" stroke-width="2.4"/><g fill="#f2cf63"><ellipse cx="-4.5" cy="-8" rx="3" ry="5.5" transform="rotate(-25 -4.5 -8)"/><ellipse cx="4.5" cy="-8" rx="3" ry="5.5" transform="rotate(25 4.5 -8)"/><ellipse cx="-4.5" cy="-1" rx="3" ry="5.5" transform="rotate(-25 -4.5 -1)"/><ellipse cx="4.5" cy="-1" rx="3" ry="5.5" transform="rotate(25 4.5 -1)"/><ellipse cx="0" cy="-13" rx="3" ry="5"/></g>',
};
/** The glow colour for a pack: hand-picked for the original six, otherwise the pack's own accent. */
export const worldGlow = (w: World = worldId()): string => WORLD_GLOW[w] ?? worldTint(w).accent;
const STAR_EMBLEM = '<path d="M0 -14 L4 -4.5 L14 -4.5 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14 -4.5 L-4 -4.5Z" fill="#ffc233"/>';
export const worldBadge = (w: World = worldId()): string =>
  `<svg class="world-badge" viewBox="-20 -20 40 40" aria-hidden="true" focusable="false"><circle r="18" fill="#fff" stroke="${worldGlow(w)}" stroke-width="3.5"/>${EMBLEM[w] ?? STAR_EMBLEM}</svg>`;

// ---------------------------------------------------------------------------------------------------------------
// The six newer worlds: jungle, robot, pirate, fairy, music, arctic. Same geometry and class hooks as the older entries (a drum's
// ellipse.skin and ellipse.ripple, a pot's BODY, rim and g.lid, a cover's back and front layers), so the games treat them alike.
// ---------------------------------------------------------------------------------------------------------------
const BARREL = 'M26 70 Q14 112 26 138 Q42 154 100 154 Q158 154 174 138 Q186 112 174 70Z';
const clipOf = (id: string, d: string) => `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>`;

Object.assign(DRUMS, {
  // a hollow log drum with a hide on top, wrapped in a green vine with leaves
  jungle: `${drumOpen}<path d="${CYL}" fill="#9a6a3a"/>
    <path d="M44 76 L42 146 M70 80 L68 152 M100 82 L100 152 M130 80 L132 152 M156 76 L158 146" stroke="#6f4a24" stroke-width="4" stroke-linecap="round" opacity=".75"/>
    <path d="M28 104 Q64 126 100 112 Q140 98 172 122" fill="none" stroke="#3f9b52" stroke-width="7" stroke-linecap="round"/>
    <path d="M52 118 q-10 -14 -22 -8 q8 14 22 8z M118 108 q8 -16 22 -12 q-4 16 -22 12z M150 120 q10 -12 20 -4 q-6 12 -20 4z" fill="#5cc26b" stroke="#2f7d3a" stroke-width="2"/>
    <path d="${CYL}" fill="none" stroke="#5a3a1a" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#f0d9a8" stroke="#8a6a3a" stroke-width="5"/>
    <ellipse cx="100" cy="70" rx="72" ry="26" fill="none" stroke="#3f9b52" stroke-width="3" stroke-dasharray="10 6" stroke-linecap="round" transform="translate(0 6)"/>${ripple('#fff')}</svg>`,
  // a gear drum: a steel shell with a ring of gear teeth, rivets, and a dark beeper head with a red button
  robot: `${drumOpen}<path d="${CYL}" fill="#8e9bb0"/>
    ${Array.from({ length: 14 }, (_, k) => `<rect x="${28 + k * 10.3}" y="${96 + Math.round(10 * Math.sin((k / 13) * Math.PI))}" width="7" height="12" rx="1.5" fill="#5a6a82"/>`).join('')}
    <path d="M28 98 Q100 124 172 98" fill="none" stroke="#5a6a82" stroke-width="5"/>
    <circle cx="44" cy="134" r="3.2" fill="#d9e0ea"/><circle cx="78" cy="144" r="3.2" fill="#d9e0ea"/><circle cx="122" cy="144" r="3.2" fill="#d9e0ea"/><circle cx="156" cy="134" r="3.2" fill="#d9e0ea"/>
    <path d="M40 80 Q36 98 40 120" stroke="#fff" opacity=".35" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="${CYL}" fill="none" stroke="#46546b" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#2b3c5a" stroke="#ff9f43" stroke-width="5"/>
    <ellipse cx="100" cy="70" rx="46" ry="16" fill="none" stroke="#5ec8ff" stroke-width="3" opacity=".8"/><circle cx="100" cy="70" r="7" fill="#ef476f" stroke="#fff" stroke-width="2"/>${ripple('#5ec8ff')}</svg>`,
  // a wooden barrel with iron hoops and a black X on the drum head
  pirate: `${drumOpen}${clipOf('pbBody', BARREL)}<path d="${BARREL}" fill="#a8703a"/>
    <g clip-path="url(#pbBody)" stroke="#7a4a1d" stroke-width="3" opacity=".8"><path d="M52 76 Q44 112 56 152 M78 80 Q74 116 80 154 M104 80 V154 M130 80 Q134 116 128 154 M154 76 Q162 112 150 152"/></g>
    <path d="M22 90 Q100 118 178 90" fill="none" stroke="#3a3f4a" stroke-width="8" stroke-linecap="round"/><path d="M26 134 Q100 160 174 134" fill="none" stroke="#3a3f4a" stroke-width="8" stroke-linecap="round"/>
    <path d="${BARREL}" fill="none" stroke="#5a3a1a" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#f1dca0" stroke="#7a4a1d" stroke-width="5"/>
    <path d="M100 50 L106.5 63.5 L121 65.5 L110.5 75.5 L113 90 L100 83 L87 90 L89.5 75.5 L79 65.5 L93.5 63.5Z" fill="#ffc233" stroke="#c98f00" stroke-width="3" stroke-linejoin="round"/>${ripple('#fff')}</svg>`,
  // a mushroom drum: a cream stalk and a red spotted cap that is the drum head
  fairy: `${drumOpen}<path d="M30 70 L36 134 Q36 152 100 152 Q164 152 164 134 L170 70Z" fill="#fff3d9"/>
    <path d="M40 104 Q100 128 160 104 M42 124 Q100 148 158 124" fill="none" stroke="#e8d3a8" stroke-width="3.5"/>
    <path d="M36 140 q6 -10 12 0 M150 142 q6 -10 12 0 M96 150 q4 -10 8 0" stroke="#5cc26b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M30 70 L36 134 Q36 152 100 152 Q164 152 164 134 L170 70Z" fill="none" stroke="#d9bd8a" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#ef5b7b" stroke="#b83a58" stroke-width="5"/>
    <g fill="#fff"><circle cx="64" cy="66" r="7"/><circle cx="100" cy="58" r="6"/><circle cx="136" cy="68" r="7.5"/><circle cx="84" cy="80" r="5"/><circle cx="118" cy="82" r="5.5"/></g>${ripple('#fff')}</svg>`,
  // a real snare drum: a silver shell, chrome hoops, tension rods and a white head
  music: `${drumOpen}<path d="${CYL}" fill="#d9dde6"/>
    <path d="M28 88 Q100 114 172 88 L172 98 Q100 124 28 98Z" fill="#9aa3b5"/><path d="M28 130 Q100 156 172 130 L172 140 Q100 166 28 140Z" fill="#9aa3b5"/>
    ${[46, 70, 100, 130, 154].map((x) => `<rect x="${x - 2.5}" y="${96 + Math.round(18 * Math.sin(((x - 28) / 144) * Math.PI) * 0.7) + 2}" width="5" height="34" rx="2" fill="#6f7a90"/><circle cx="${x}" cy="${96 + Math.round(18 * Math.sin(((x - 28) / 144) * Math.PI) * 0.7)}" r="4.5" fill="#46546b"/>`).join('')}
    <path d="M40 80 Q36 98 40 120" stroke="#fff" opacity=".6" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="${CYL}" fill="none" stroke="#6f7a90" stroke-width="4"/>
    <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#fffdf6" stroke="#9aa3b5" stroke-width="6"/>
    <path d="M60 76 Q100 62 140 76" fill="none" stroke="#e8e0cc" stroke-width="2.5"/>${ripple('#ffc233')}</svg>`,
  // an ice drum: pale blue frosted shell with light facets and a snow-white rim
  arctic: `${drumOpen}<path d="${CYL}" fill="#a9dcf5"/>
    <path d="M28 96 L70 150 M60 80 L100 152 M96 80 L140 152 M132 80 L172 134" stroke="#e8f8ff" stroke-width="5" stroke-linecap="round" opacity=".75"/>
    <path d="M28 116 L60 100 M110 142 L172 104" stroke="#7cc4ec" stroke-width="3" opacity=".7"/>
    <path d="${CYL}" fill="none" stroke="#5aa8d6" stroke-width="4"/>
    <ellipse cx="100" cy="70" rx="76" ry="29" fill="#fff" opacity=".95"/>
    <ellipse class="skin" cx="100" cy="70" rx="68" ry="24" fill="#e9f7ff" stroke="#bfe6fa" stroke-width="4"/>
    <path d="M100 56 V84 M86 62 L114 78 M114 62 L86 78" stroke="#bfe6fa" stroke-width="3" stroke-linecap="round"/>${ripple('#7cc4ec')}</svg>`,
});

Object.assign(POTS, {
  // a dark wok on a big green leaf, with a woven bamboo steamer lid
  jungle: `${potOpen}<path d="M6 138 Q40 124 80 130 Q120 124 154 138 Q120 150 80 148 Q40 150 6 138Z" fill="#4caf5d" stroke="#2f7d3a" stroke-width="3"/><path d="M20 138 H140" stroke="#2f7d3a" stroke-width="2" opacity=".6"/>
    <path d="${BODY}" fill="#4a4036"/><path d="M30 96 Q80 110 130 96" stroke="#ff9f43" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>
    <path d="${BODY}" fill="none" stroke="#2a241e" stroke-width="4"/>${shine}${rim('#6b5a48', '#2a241e')}
    <g class="lid"><path d="${LID}" fill="#e0bd78" stroke="#a8803a" stroke-width="4"/><path d="M44 52 Q80 42 116 52 M52 42 Q80 34 108 42 M36 52 L124 52" stroke="#a8803a" stroke-width="2.6" fill="none"/><path d="M62 30 V56 M80 30 V56 M98 30 V56" stroke="#a8803a" stroke-width="2.6"/><circle cx="80" cy="26" r="6" fill="#4caf5d" stroke="#2f7d3a" stroke-width="3"/></g></svg>`,
  // a soup tank: riveted steel with a glass gauge of orange soup, a side pipe and valve, a lid with an antenna bulb
  robot: `${potOpen}<path d="M122 112 h22 v-26 h-8" stroke="#6f7a90" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="144" cy="84" r="7" fill="#ef476f" stroke="#a02538" stroke-width="3"/>
    <path d="${BODY}" fill="#8e9bb0"/><rect x="58" y="82" width="44" height="34" rx="8" fill="#26354f" stroke="#5a6a82" stroke-width="3"/><rect x="63" y="96" width="34" height="15" rx="4" fill="#ff9f43"/><path d="M63 96 q8.5 -5 17 0 t17 0" fill="#ffb86b"/>
    <circle cx="36" cy="92" r="3" fill="#d9e0ea"/><circle cx="124" cy="92" r="3" fill="#d9e0ea"/><circle cx="42" cy="118" r="3" fill="#d9e0ea"/><circle cx="118" cy="118" r="3" fill="#d9e0ea"/>
    <path d="${BODY}" fill="none" stroke="#46546b" stroke-width="4"/>${shine}${rim('#6f7a90', '#46546b')}
    <g class="lid"><path d="${LID}" fill="#6f7a90" stroke="#46546b" stroke-width="4"/><path d="M80 30 V10" stroke="#46546b" stroke-width="3.5" stroke-linecap="round"/><circle cx="80" cy="8" r="6" fill="#5ec8ff" stroke="#1c8fa6" stroke-width="3"/></g></svg>`,
  // a friendly copper treasure pot: a round bronze belly with a gold coin badge, and gold coins heaped on the lid as if it is overflowing
  pirate: `${potOpen}<path d="${BODY}" fill="#c9783a"/><path d="M26 92 Q80 108 134 92 L132 100 Q80 116 28 100Z" fill="#e8a55a"/>
    <circle cx="80" cy="118" r="11" fill="#ffc233" stroke="#c98f00" stroke-width="3"/><path d="M80 110 L82.5 116 L89 116.5 L84 120.5 L85.8 127 L80 123.5 L74.2 127 L76 120.5 L71 116.5 L77.5 116Z" fill="#fff3b0"/>
    <circle cx="44" cy="84" r="2.8" fill="#f6d9b0"/><circle cx="116" cy="84" r="2.8" fill="#f6d9b0"/>
    <path d="${BODY}" fill="none" stroke="#8f4f1a" stroke-width="4"/>${shine}${rim('#e8a55a', '#8f4f1a')}
    <g class="lid"><path d="${LID}" fill="#c9783a" stroke="#8f4f1a" stroke-width="4"/><g fill="#ffc233" stroke="#c98f00" stroke-width="2.6"><ellipse cx="66" cy="28" rx="10" ry="6.5"/><ellipse cx="92" cy="27" rx="10" ry="6.5"/><ellipse cx="79" cy="19" rx="10" ry="6.5"/></g><path d="M72 28 H60 M98 27 H86 M85 19 H73" stroke="#fff3b0" stroke-width="2" stroke-linecap="round" opacity=".8"/></g></svg>`,
  // a pink teacup on a saucer with a handle; the lid is a brown acorn cap
  fairy: `${potOpen}<ellipse cx="80" cy="138" rx="66" ry="8" fill="#e8c2e8" stroke="#b98ad0" stroke-width="3"/>
    <path d="M136 82 q26 -2 20 22 q-6 16 -24 12" fill="none" stroke="#f3a6cc" stroke-width="8" stroke-linecap="round"/><path d="M136 82 q26 -2 20 22 q-6 16 -24 12" fill="none" stroke="#c46a9a" stroke-width="2" stroke-linecap="round" opacity=".5"/>
    <path d="${BODY}" fill="#ffc2dc"/><g fill="#fff" opacity=".9"><circle cx="48" cy="96" r="4"/><circle cx="76" cy="108" r="4"/><circle cx="108" cy="96" r="4"/><circle cx="94" cy="122" r="3.5"/></g><path d="M30 92 Q80 108 130 92" stroke="#ffd166" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="${BODY}" fill="none" stroke="#c46a9a" stroke-width="4"/>${shine}${rim('#ffe27a', '#c98f00')}
    <g class="lid"><path d="${LID}" fill="#a8703a" stroke="#6b4a1d" stroke-width="4"/><path d="M40 46 H120 M46 38 H114 M58 32 H102" stroke="#6b4a1d" stroke-width="2.4" opacity=".7"/><path d="M80 30 V16" stroke="#6b4a1d" stroke-width="5" stroke-linecap="round"/></g></svg>`,
  // a brass pot with musical notes on its belly; the lid has a note for a knob
  music: `${potOpen}<path d="${BODY}" fill="#e0a82e"/><path d="${BODY}" fill="none" stroke="#a8761a" stroke-width="4"/>
    <g fill="#5a3a0a"><ellipse cx="62" cy="116" rx="7" ry="5.4" transform="rotate(-18 62 116)"/><ellipse cx="96" cy="108" rx="7" ry="5.4" transform="rotate(-18 96 108)"/></g>
    <path d="M68.5 114 V88 M102.5 106 V80 M68.5 88 L102.5 80" stroke="#5a3a0a" stroke-width="3.4" fill="none" stroke-linecap="round"/>${shine}${rim('#ffd166', '#a8761a')}
    <g class="lid"><path d="${LID}" fill="#e0a82e" stroke="#a8761a" stroke-width="4"/><ellipse cx="74" cy="26" rx="6" ry="4.6" fill="#5a3a0a" transform="rotate(-18 74 26)"/><path d="M79.5 25 V10 q8 2 10 10" stroke="#5a3a0a" stroke-width="3" fill="none" stroke-linecap="round"/></g></svg>`,
  // an igloo pot: snow-block walls with a dark doorway, and a snow-dome lid
  arctic: `${potOpen}<path d="${BODY}" fill="#e9f7ff"/><g stroke="#b5dcf2" stroke-width="3" fill="none"><path d="M26 86 Q80 100 134 86 M30 108 Q80 124 130 108"/><path d="M50 90 v18 M80 96 v14 M110 90 v18 M64 112 v18 M96 114 v18"/></g>
    <path d="M64 138 V120 Q64 106 80 106 Q96 106 96 120 V138Z" fill="#3a5a7a"/>
    <path d="${BODY}" fill="none" stroke="#8fc8e8" stroke-width="4"/>${shine}${rim('#ffffff', '#8fc8e8')}
    <g class="lid"><path d="${LID}" fill="#fff" stroke="#8fc8e8" stroke-width="4"/><path d="M52 50 Q80 40 108 50 M62 40 Q80 34 98 40" stroke="#cfe9f7" stroke-width="2.6" fill="none"/><path d="M80 18 l6 8 l-6 9 l-6 -9z" fill="#7cc4ec" stroke="#4aa0d4" stroke-width="2.5" stroke-linejoin="round"/></g></svg>`,
});

const leaf = (x: number, y: number, a: number, w: number, h: number, c: string) => `<path d="M0 0 C${w} ${-h * 0.35} ${w} ${-h * 0.8} 0 ${-h} C${-w} ${-h * 0.8} ${-w} ${-h * 0.35} 0 0Z" fill="${c}" transform="translate(${x} ${y}) rotate(${a})"/>`;
Object.assign(COVERS, {
  // dense jungle: broad overlapping leaves and hanging vines (a different silhouette from the dino ferns)
  jungle: [
    { back: cov('<ellipse cx="50" cy="84" rx="40" ry="12" fill="#1f5a3a" opacity=".35"/>', 'back'),
      front: cov(`${leaf(50, 104, -58, 20, 50, '#2f8a47')}${leaf(50, 104, 58, 20, 50, '#2f8a47')}${leaf(50, 104, -28, 20, 52, '#4caf5d')}${leaf(50, 104, 28, 20, 52, '#4caf5d')}${leaf(50, 104, 0, 18, 44, '#6fcf6a')}<path d="M16 60 Q12 74 18 84 M84 58 Q90 72 82 86" stroke="#2f7d3a" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="18" cy="86" r="3.4" fill="#ff9f43"/><circle cx="82" cy="88" r="3.4" fill="#ff6b9a"/>`, 'front') },
    { back: cov('<ellipse cx="50" cy="84" rx="40" ry="12" fill="#1f5a3a" opacity=".35"/>', 'back'),
      front: cov(`${leaf(24, 104, -20, 18, 46, '#3f9b52')}${leaf(76, 104, 20, 18, 46, '#3f9b52')}${leaf(50, 104, -42, 20, 48, '#2f8a47')}${leaf(50, 104, 42, 20, 48, '#2f8a47')}${leaf(50, 104, -8, 20, 54, '#5cc26b')}${leaf(50, 104, 12, 18, 46, '#4caf5d')}<path d="M30 58 Q38 70 30 80 M68 58 Q60 72 70 82" stroke="#2f7d3a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="30" cy="82" r="3.2" fill="#ffd166"/>`, 'front') },
  ],
  // a robot workshop: a steel shelf with bolts and hazard stripes, and a crate of parts with a gear
  robot: [
    { back: cov('<rect x="8" y="30" width="84" height="50" rx="6" fill="#5a6a82" opacity=".22"/>', 'back'),
      front: cov(`<rect x="0" y="68" width="100" height="32" fill="#8e9bb0"/><path d="M0 68 H100" stroke="#46546b" stroke-width="3"/><path d="M0 74 l8 -6 h8 l-8 6z M16 74 l8 -6 h8 l-8 6z M32 74 l8 -6 h8 l-8 6z M48 74 l8 -6 h8 l-8 6z M64 74 l8 -6 h8 l-8 6z M80 74 l8 -6 h8 l-8 6z" fill="#ffc233" opacity=".9"/>
        <circle cx="12" cy="88" r="3" fill="#d9e0ea"/><circle cx="50" cy="90" r="3" fill="#d9e0ea"/><circle cx="88" cy="88" r="3" fill="#d9e0ea"/><g fill="#ff9f43" stroke="#a85a14" stroke-width="2"><circle cx="76" cy="62" r="9"/>${Array.from({ length: 8 }, (_, k) => `<rect x="-2.5" y="-13" width="5" height="6" transform="translate(76 62) rotate(${k * 45})" stroke="none"/>`).join('')}</g><circle cx="76" cy="62" r="3.5" fill="#8e9bb0"/>`, 'front') },
    { back: cov('<rect x="8" y="30" width="84" height="50" rx="6" fill="#5a6a82" opacity=".22"/>', 'back'),
      front: cov(`<rect x="2" y="64" width="96" height="36" rx="3" fill="#ffb347" stroke="#c97a14" stroke-width="3"/><path d="M2 82 H98 M30 64 V100 M70 64 V100" stroke="#c97a14" stroke-width="3"/><circle cx="10" cy="70" r="2.6" fill="#fff"/><circle cx="90" cy="70" r="2.6" fill="#fff"/><rect x="38" y="58" width="24" height="10" rx="2" fill="#5ec8ff" stroke="#1c8fa6" stroke-width="2"/>`, 'front') },
  ],
  // a beach: sand dunes with palm fronds (and a sandy dip behind each picture)
  pirate: [
    { back: cov('<ellipse cx="50" cy="86" rx="40" ry="10" fill="#d9b56a" opacity=".7"/>', 'back'),
      front: cov(`<path d="M0 100 V80 Q22 62 48 76 Q76 62 100 78 V100Z" fill="#f1dca0"/><path d="M0 92 Q30 82 60 90 Q82 84 100 90 V100 H0Z" fill="#e2c27a"/><g stroke="#3f9b52" stroke-width="5" stroke-linecap="round" fill="none"><path d="M82 78 Q70 56 52 60"/><path d="M82 78 Q84 52 70 44"/><path d="M82 78 Q96 58 100 64"/></g><path d="M82 78 L84 96" stroke="#8a5a2c" stroke-width="5" stroke-linecap="round"/>`, 'front') },
    { back: cov('<ellipse cx="50" cy="86" rx="40" ry="10" fill="#d9b56a" opacity=".7"/>', 'back'),
      front: cov(`<path d="M0 100 V76 Q26 58 52 74 Q78 60 100 74 V100Z" fill="#f4e2ac"/><path d="M0 94 Q34 84 64 92 Q84 86 100 92 V100 H0Z" fill="#e2c27a"/><g stroke="#3f9b52" stroke-width="5" stroke-linecap="round" fill="none"><path d="M18 76 Q30 56 48 60"/><path d="M18 76 Q16 52 30 44"/><path d="M18 76 Q6 58 0 64"/></g><path d="M18 76 L16 96" stroke="#8a5a2c" stroke-width="5" stroke-linecap="round"/><path d="M62 82 l5 -8 l5 8z" fill="#ff6b9a"/>`, 'front') },
  ],
  // a fairy garden: big pink petals around each picture, or a pair of red spotted toadstools in front
  fairy: [
    { back: cov('<circle cx="50" cy="70" r="24" fill="#ffe27a" opacity=".45"/>', 'back'),
      front: cov(`<g>${[-64, -38, -14, 12, 38, 64].map((a, k) => `<ellipse cx="50" cy="80" rx="13" ry="26" fill="${k % 2 ? '#ffb3d1' : '#ff8fb8'}" transform="rotate(${a} 50 106)"/>`).join('')}</g><ellipse cx="50" cy="102" rx="46" ry="9" fill="#5cc26b"/>`, 'front') },
    { back: cov('<circle cx="50" cy="70" r="24" fill="#e0c8ff" opacity=".5"/>', 'back'),
      front: cov(`<rect x="22" y="80" width="14" height="22" rx="5" fill="#fff3d9" stroke="#e0c48a" stroke-width="2"/><rect x="66" y="84" width="12" height="18" rx="5" fill="#fff3d9" stroke="#e0c48a" stroke-width="2"/><path d="M6 82 Q29 54 52 82 Q29 90 6 82Z" fill="#ef5b7b" stroke="#b83a58" stroke-width="2.5"/><path d="M52 88 Q72 62 94 88 Q72 94 52 88Z" fill="#ef5b7b" stroke="#b83a58" stroke-width="2.5"/><g fill="#fff"><circle cx="18" cy="76" r="3.4"/><circle cx="30" cy="70" r="3"/><circle cx="40" cy="78" r="3.4"/><circle cx="64" cy="80" r="3"/><circle cx="76" cy="76" r="3.4"/><circle cx="86" cy="82" r="2.8"/></g><rect x="0" y="94" width="100" height="6" fill="#5cc26b"/>`, 'front') },
  ],
  // a stage: red velvet curtains at the sides and a wooden riser with a gold edge in front
  music: [
    { back: cov('<ellipse cx="50" cy="40" rx="30" ry="40" fill="#ffd166" opacity=".18"/>', 'back'),
      front: cov(`<path d="M0 0 H16 Q10 40 14 100 H0Z" fill="#b8243e"/><path d="M100 0 H84 Q90 40 86 100 H100Z" fill="#b8243e"/><path d="M5 0 Q3 50 6 100 M11 0 Q9 50 11 100 M95 0 Q97 50 94 100 M89 0 Q91 50 89 100" stroke="#7a1428" stroke-width="2" fill="none"/>
        <rect x="0" y="72" width="100" height="28" fill="#8a5a2c"/><rect x="0" y="72" width="100" height="5" fill="#ffc233"/><path d="M0 86 H100" stroke="#6b4420" stroke-width="2.4"/><circle cx="50" cy="90" r="3" fill="#ffc233"/>`, 'front') },
    { back: cov('<ellipse cx="50" cy="40" rx="30" ry="40" fill="#ffd166" opacity=".18"/>', 'back'),
      front: cov(`<path d="M0 0 H12 Q8 40 10 100 H0Z" fill="#7a2a8a"/><path d="M100 0 H88 Q92 40 90 100 H100Z" fill="#7a2a8a"/><path d="M4 0 Q2 50 4 100 M94 0 Q96 50 94 100" stroke="#4f1a5c" stroke-width="2" fill="none"/>
        <rect x="6" y="66" width="88" height="34" rx="4" fill="#2b2f3a"/><rect x="6" y="66" width="88" height="4" fill="#ffc233"/><circle cx="30" cy="84" r="11" fill="#444b5c" stroke="#9aa3b5" stroke-width="2"/><circle cx="30" cy="84" r="4" fill="#9aa3b5"/><circle cx="70" cy="84" r="11" fill="#444b5c" stroke="#9aa3b5" stroke-width="2"/><circle cx="70" cy="84" r="4" fill="#9aa3b5"/>`, 'front') },
  ],
  // snow: a drift with a few ice blocks, and a drift of rounded snow mounds
  arctic: [
    { back: cov('<ellipse cx="50" cy="86" rx="40" ry="10" fill="#b5dcf2" opacity=".6"/>', 'back'),
      front: cov(`<path d="M0 100 V74 Q24 58 50 72 Q76 58 100 74 V100Z" fill="#fff"/><path d="M0 100 V88 Q30 78 60 88 Q80 82 100 88 V100Z" fill="#dff1fb"/><rect x="10" y="62" width="20" height="16" rx="4" fill="#bfe6fa" stroke="#8fc8e8" stroke-width="2.4"/><rect x="66" y="66" width="16" height="14" rx="4" fill="#a9dcf5" stroke="#8fc8e8" stroke-width="2.4"/><path d="M14 66 l6 0 M70 70 l5 0" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`, 'front') },
    { back: cov('<ellipse cx="50" cy="86" rx="40" ry="10" fill="#b5dcf2" opacity=".6"/>', 'back'),
      front: cov(`<g fill="#fff" stroke="#cfe9f7" stroke-width="2.4"><circle cx="20" cy="84" r="17"/><circle cx="48" cy="76" r="19"/><circle cx="76" cy="84" r="17"/><circle cx="94" cy="92" r="12"/></g><rect x="0" y="90" width="100" height="10" fill="#dff1fb"/><path d="M34 70 l4 -6 l4 6z M70 76 l4 -6 l4 6z" fill="#7cc4ec"/>`, 'front') },
  ],
});

Object.assign(WORLD_GLOW, { jungle: '#c8f070', robot: '#8fe0ff', pirate: '#ffd98a', fairy: '#f3b6ff', music: '#ffd166', arctic: '#bfeaff' });
Object.assign(EMBLEM, {
  jungle: '<path d="M0 14 C-14 6 -12 -8 0 -14 C12 -8 14 6 0 14Z" fill="#4caf5d"/><path d="M0 12 V-10 M0 2 L-7 -4 M0 -3 L7 -8" stroke="#2f7d3a" stroke-width="2" fill="none"/>',
  robot: '<circle r="6" fill="#8e9bb0"/>' + Array.from({ length: 8 }, (_, k) => `<rect x="-2.5" y="-14" width="5" height="7" fill="#8e9bb0" transform="rotate(${k * 45})"/>`).join('') + '<circle r="2.6" fill="#fff"/>',
  pirate: '<circle r="12" fill="#ffc233" stroke="#c98f00" stroke-width="2.5"/><path d="M0 -8 L2.3 -2.5 L8 -2 L3.6 1.6 L5 7.5 L0 4.4 L-5 7.5 L-3.6 1.6 L-8 -2 L-2.3 -2.5Z" fill="#fff3b0"/>',
  fairy: '<g fill="#ff8fb8">' + [0, 72, 144, 216, 288].map((a) => `<ellipse cy="-8" rx="5.5" ry="8" transform="rotate(${a})"/>`).join('') + '</g><circle r="4.5" fill="#ffd166"/>',
  music: '<ellipse cx="-3" cy="8" rx="6.5" ry="5" fill="#3a2a5a" transform="rotate(-18 -3 8)"/><path d="M2.5 7 V-12 q10 2 10 12" stroke="#3a2a5a" stroke-width="3.2" fill="none" stroke-linecap="round"/>',
  arctic: '<path d="M0 -14 V14 M-12 -7 L12 7 M12 -7 L-12 7" stroke="#7cc4ec" stroke-width="3.2" stroke-linecap="round"/><circle r="3" fill="#bfeaff"/>',
});
