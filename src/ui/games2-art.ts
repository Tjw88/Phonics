// Per-world props for Beat the Drum, Sound Safari and Word Kitchen (inline SVG, original art). The world id is document.body.dataset.pack.
// The props change how the games LOOK; their logic, test ids and sizes are identical in every world.

export type World = 'dino' | 'dragon' | 'transport' | 'space' | 'ocean' | 'farm';
const WORLDS: World[] = ['dino', 'dragon', 'transport', 'space', 'ocean', 'farm'];
export const worldId = (): World => {
  const p = document.body.dataset.pack as World | undefined;
  return p && WORLDS.includes(p) ? p : 'dino';
};

// ---------------------------------------------------------------------------------------------------------------
// Drums. viewBox 0 0 200 170; the skin (the part that is hit) is an ellipse.skin at (100,70) rx72 ry26; ellipse.ripple is the
// ring that spreads from the skin on every tap.
// ---------------------------------------------------------------------------------------------------------------
const drumOpen = '<svg class="drum-art" viewBox="0 0 200 170" role="img" aria-hidden="true" focusable="false"><ellipse cx="100" cy="160" rx="74" ry="8" fill="#0000001f"/>';
const ripple = (c: string) => `<ellipse class="ripple" cx="100" cy="70" rx="72" ry="26" fill="none" stroke="${c}" stroke-width="6" opacity="0"/>`;
const CYL = 'M28 70 L28 130 Q28 152 100 152 Q172 152 172 130 L172 70Z';

const DRUMS: Record<World, string> = {
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
export const drumArt = (w: World = worldId()): string => DRUMS[w];

// ---------------------------------------------------------------------------------------------------------------
// Cooking pots. viewBox 0 0 160 150; the rim is at y 56-70, the lid (class "lid") sits above it.
// ---------------------------------------------------------------------------------------------------------------
const potOpen = '<svg class="pot-art" viewBox="0 0 160 150" role="img" aria-hidden="true" focusable="false"><ellipse cx="80" cy="142" rx="58" ry="8" fill="#0000001f"/>';
const BODY = 'M22 62 Q22 138 80 138 Q138 138 138 62Z';
const rim = (fill: string, stroke: string) => `<rect x="8" y="56" width="144" height="14" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="4"/>`;
const shine = '<path d="M34 80 Q38 124 62 130" stroke="#fff" stroke-width="5" fill="none" opacity=".28" stroke-linecap="round"/>';
const LID = 'M30 56 Q30 30 80 30 Q130 30 130 56Z';

const POTS: Record<World, string> = {
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
export const potArt = (w: World = worldId()): string => POTS[w];

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
const COVERS: Record<World, Cover[]> = {
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
export const coverFor = (w: World, i: number): Cover => {
  const list = COVERS[w];
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
export const WORLD_GLOW: Record<World, string> = { dino: '#b5e46a', dragon: '#ffb36b', transport: '#ffd166', space: '#b7a2ff', ocean: '#8fe0f7', farm: '#ffd98a' };
const EMBLEM: Record<World, string> = {
  dino: '<path d="M0 -13 C12 -9 12 8 0 14 C-12 8 -12 -9 0 -13Z" fill="#5cb85c"/><path d="M0 -9 V11" stroke="#2f7d3a" stroke-width="2"/>',
  dragon: '<path d="M0 -14 C9 -4 11 5 0 13 C-11 5 -9 -4 0 -14Z" fill="#ff9f43"/><path d="M0 -3 C4 2 4 7 0 10 C-4 7 -4 2 0 -3Z" fill="#ffe27a"/>',
  transport: '<path d="M0 -14 L4 -4.5 L14 -4.5 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14 -4.5 L-4 -4.5Z" fill="#ffc233"/>',
  space: '<circle r="7.5" fill="#a98bff"/><ellipse rx="14" ry="4.5" fill="none" stroke="#ffd166" stroke-width="2.6" transform="rotate(-20)"/>',
  ocean: '<path d="M0 12 L-13 -2 Q-12 -13 0 -12 Q12 -13 13 -2Z" fill="#ff9fb4"/><path d="M0 12 L-7 -10 M0 12 L0 -12 M0 12 L7 -10" stroke="#e0577a" stroke-width="1.8" fill="none"/>',
  farm: '<path d="M0 14 V-10" stroke="#c98f2a" stroke-width="2.4"/><g fill="#f2cf63"><ellipse cx="-4.5" cy="-8" rx="3" ry="5.5" transform="rotate(-25 -4.5 -8)"/><ellipse cx="4.5" cy="-8" rx="3" ry="5.5" transform="rotate(25 4.5 -8)"/><ellipse cx="-4.5" cy="-1" rx="3" ry="5.5" transform="rotate(-25 -4.5 -1)"/><ellipse cx="4.5" cy="-1" rx="3" ry="5.5" transform="rotate(25 4.5 -1)"/><ellipse cx="0" cy="-13" rx="3" ry="5"/></g>',
};
export const worldBadge = (w: World = worldId()): string =>
  `<svg class="world-badge" viewBox="-20 -20 40 40" aria-hidden="true" focusable="false"><circle r="18" fill="#fff" stroke="${WORLD_GLOW[w]}" stroke-width="3.5"/>${EMBLEM[w]}</svg>`;
