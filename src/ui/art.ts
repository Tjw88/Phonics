// Original, hand-drawn SVG characters and scenery (spec: original art only, big heads, big eyes, soft round shapes,
// nothing scary). Everything is inline SVG so it is crisp at any size, tiny, offline and carries no third-party code.
// Moods are CSS classes on the root <svg> (see style.css): idle | happy | open | sleepy | oops.

export type DinoKind = 'rexy' | 'longneck' | 'trike' | 'stego';
interface DinoDef { id: DinoKind; label: string; main: string; dark: string; belly: string; accent: string; hy: number }

export const DINOS: DinoDef[] = [
  // vivid, saturated primaries for the companions (a child picks "the red one"); shapes differ too, so colour is never the only cue
  { id: 'rexy', label: 'red egg', main: '#ff2a3d', dark: '#c4001f', belly: '#ffd9de', accent: '#ffd400', hy: 84 },
  { id: 'longneck', label: 'blue egg', main: '#1f7bff', dark: '#0a49c9', belly: '#d4e6ff', accent: '#ffe14d', hy: 74 },
  { id: 'trike', label: 'neon green egg', main: '#2dff5a', dark: '#00b52e', belly: '#e6ffe9', accent: '#ff3df0', hy: 84 },
  { id: 'stego', label: 'yellow egg', main: '#ffd400', dark: '#e09b00', belly: '#fff6b8', accent: '#ff3d7f', hy: 84 },
];
export const dinoDef = (k: string): DinoDef => DINOS.find((d) => d.id === k) ?? (DINOS[0] as DinoDef);

const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [
  cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180),
];

/** accessory 0..4: nothing, bow, scarf, explorer hat, crown (the companion grows as sets are secured) */
const accessory = (n: number, hy: number): string => {
  switch (n) {
    case 1: return `<g class="acc"><path d="M124 ${hy - 40} l-22 -12 v24z" fill="#ff6b9a"/><path d="M124 ${hy - 40} l22 -12 v24z" fill="#ff6b9a"/><circle cx="124" cy="${hy - 40}" r="7" fill="#e0457b"/></g>`;
    case 2: return `<g class="acc"><path d="M62 ${hy + 42} Q100 ${hy + 66} 138 ${hy + 42} L134 ${hy + 58} Q100 ${hy + 82} 66 ${hy + 58}Z" fill="#ef476f"/><path d="M118 ${hy + 62} l10 26 l12 -8 l-8 -22z" fill="#d6335b"/><path d="M70 ${hy + 52} Q100 ${hy + 70} 130 ${hy + 52}" stroke="#ffffff66" stroke-width="3" fill="none"/></g>`;
    case 3: return `<g class="acc"><ellipse cx="100" cy="${hy - 40}" rx="54" ry="10" fill="#b98a4e"/><path d="M60 ${hy - 42} Q100 ${hy - 98} 140 ${hy - 42}Z" fill="#d9b77e"/><rect x="62" y="${hy - 54}" width="76" height="10" rx="4" fill="#8d5a2b"/></g>`;
    case 4: return `<g class="acc"><path d="M66 ${hy - 40} L72 ${hy - 76} L88 ${hy - 56} L100 ${hy - 82} L112 ${hy - 56} L128 ${hy - 76} L134 ${hy - 40}Z" fill="#ffc933" stroke="#e0a100" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="${hy - 54}" r="5" fill="#ef476f"/><circle cx="78" cy="${hy - 50}" r="3.5" fill="#4cc3d9"/><circle cx="122" cy="${hy - 50}" r="3.5" fill="#4cc3d9"/></g>`;
    default: return '';
  }
};

export const dinoSVG = (kind: string, growth = 0): string => {
  const d = dinoDef(kind);
  const { main, dark, belly, accent, hy } = d;
  const ey = hy - 4;
  const my = hy + 22;
  const headR = d.id === 'longneck' ? 40 : 44;
  let behind = '';
  let front = '';
  if (d.id === 'trike') {
    behind += `<circle cx="100" cy="${hy}" r="62" fill="${dark}"/>`;
    for (let a = -165; a <= -15; a += 25) {
      const [x, y] = polar(100, hy, 52, a);
      behind += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${accent}"/>`;
    }
    front += `<path d="M66 ${hy - 32} L75 ${hy - 64} L86 ${hy - 36}Z" fill="#fff4d6"/><path d="M134 ${hy - 32} L125 ${hy - 64} L114 ${hy - 36}Z" fill="#fff4d6"/><path d="M92 ${hy + 10} L100 ${hy - 10} L108 ${hy + 10}Z" fill="#fff4d6"/>`;
  } else if (d.id === 'stego') {
    for (let a = -160; a <= -20; a += 35) {
      const [x, y] = polar(100, hy, 58, a);
      behind += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a + 90})"><path d="M0 -20 L13 0 L0 18 L-13 0Z" fill="${accent}"/></g>`;
    }
  } else if (d.id === 'rexy') {
    for (const x of [78, 100, 122]) front += `<path d="M${x - 8} ${hy - 40} L${x} ${hy - 58} L${x + 8} ${hy - 40}Z" fill="${dark}"/>`;
  } else {
    front += `<circle cx="74" cy="${hy - 34}" r="8" fill="${dark}"/><circle cx="126" cy="${hy - 34}" r="8" fill="${dark}"/>`;
  }
  const neck = d.id === 'longneck' ? `<rect x="80" y="${hy + 14}" width="40" height="64" rx="18" fill="${main}"/>` : '';
  const spots = d.id === 'longneck'
    ? `<circle cx="76" cy="150" r="8" fill="${dark}" opacity=".35"/><circle cx="126" cy="164" r="10" fill="${dark}" opacity=".35"/><circle cx="106" cy="138" r="6" fill="${dark}" opacity=".35"/>` : '';
  const tail = `<path class="tail" d="M146 168 Q186 178 192 136 Q174 156 148 150Z" fill="${main}"/>${d.id === 'stego' ? `<path d="M178 150 l12 -14 l-2 18z" fill="${accent}"/>` : ''}`;
  return `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="100" cy="202" rx="62" ry="9" fill="#0000001f"/>
  ${tail}
  ${neck}
  <g class="bodyg">
    <ellipse cx="72" cy="192" rx="22" ry="11" fill="${dark}"/><ellipse cx="128" cy="192" rx="22" ry="11" fill="${dark}"/>
    <ellipse cx="100" cy="150" rx="54" ry="46" fill="${main}"/><ellipse cx="100" cy="160" rx="35" ry="31" fill="${belly}"/>${spots}
    ${d.id === 'rexy' ? `<ellipse cx="54" cy="146" rx="9" ry="6" fill="${dark}" transform="rotate(30 54 146)"/><ellipse cx="146" cy="146" rx="9" ry="6" fill="${dark}" transform="rotate(-30 146 146)"/>` : ''}
  </g>
  ${behind}
  <g class="headg">
    <circle cx="100" cy="${hy}" r="${headR}" fill="${main}"/>
    ${front}
    <circle cx="66" cy="${hy + 14}" r="9" fill="#ff8fa3" opacity=".5"/><circle cx="134" cy="${hy + 14}" r="9" fill="#ff8fa3" opacity=".5"/>
    <g class="eyes eyes-open">
      <circle cx="80" cy="${ey}" r="13" fill="#fff"/><circle cx="120" cy="${ey}" r="13" fill="#fff"/>
      <circle class="pupil" cx="82" cy="${ey + 1}" r="8" fill="#26303f"/><circle class="pupil" cx="118" cy="${ey + 1}" r="8" fill="#26303f"/>
      <circle cx="85" cy="${ey - 3}" r="3" fill="#fff"/><circle cx="121" cy="${ey - 3}" r="3" fill="#fff"/>
    </g>
    <g class="eyes eyes-happy" fill="none" stroke="#26303f" stroke-width="5" stroke-linecap="round"><path d="M67 ${ey + 3} Q80 ${ey - 14} 93 ${ey + 3}"/><path d="M107 ${ey + 3} Q120 ${ey - 14} 133 ${ey + 3}"/></g>
    <g class="eyes eyes-closed" fill="none" stroke="#26303f" stroke-width="5" stroke-linecap="round"><path d="M67 ${ey} Q80 ${ey + 11} 93 ${ey}"/><path d="M107 ${ey} Q120 ${ey + 11} 133 ${ey}"/></g>
    <ellipse cx="92" cy="${hy + 8}" rx="2.6" ry="3.4" fill="${dark}" opacity=".55"/><ellipse cx="108" cy="${hy + 8}" rx="2.6" ry="3.4" fill="${dark}" opacity=".55"/>
    <path class="mouth mouth-smile" d="M84 ${my} Q100 ${my + 16} 116 ${my}" fill="none" stroke="#3b2030" stroke-width="4.5" stroke-linecap="round"/>
    <g class="mouth mouth-open"><ellipse cx="100" cy="${my + 5}" rx="17" ry="14" fill="#6b2437"/><ellipse cx="100" cy="${my + 12}" rx="10" ry="5.5" fill="#ff8fa3"/></g>
    <ellipse class="mouth mouth-oh" cx="100" cy="${my + 5}" rx="7" ry="9" fill="#6b2437"/>
    ${accessory(growth, hy)}
  </g>
  <g class="zzz" fill="#5b6fb5" font-family="Andika, sans-serif" font-weight="700"><text x="142" y="${hy - 26}" font-size="22">z</text><text x="156" y="${hy - 42}" font-size="28">z</text><text x="172" y="${hy - 60}" font-size="34">Z</text></g>
</svg>`;
};

const mixHex = (hex: string, withHex: string, t: number): string => {
  const f = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const m = (i: number) => Math.round(f(hex, i) * (1 - t) + f(withHex, i) * t).toString(16).padStart(2, '0');
  return `#${m(0)}${m(1)}${m(2)}`;
};

/** A glossy, vivid egg in the dino's colour, used for choosing a companion. */
export const eggSVG = (kind: string): string => {
  const d = dinoDef(kind);
  const light = mixHex(d.main, '#ffffff', 0.55);
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs><radialGradient id="eg-${d.id}" cx="34%" cy="26%" r="85%"><stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${d.main}"/><stop offset="1" stop-color="${d.dark}"/></radialGradient></defs>
  <ellipse cx="60" cy="142" rx="38" ry="7" fill="#0000002b"/>
  <path d="M60 6 C100 6 112 78 112 98 C112 128 90 142 60 142 C30 142 8 128 8 98 C8 78 20 6 60 6Z" fill="url(#eg-${d.id})"/>
  <circle cx="38" cy="66" r="9" fill="${d.accent}" opacity=".95"/><circle cx="80" cy="52" r="7" fill="#ffffffcc"/><circle cx="84" cy="94" r="11" fill="${d.accent}" opacity=".95"/>
  <circle cx="44" cy="110" r="8" fill="#ffffffcc"/><circle cx="66" cy="80" r="5" fill="${d.dark}" opacity=".55"/>
  <ellipse cx="38" cy="38" rx="13" ry="22" fill="#ffffff" opacity=".55" transform="rotate(24 38 38)"/><ellipse cx="30" cy="56" rx="4" ry="6" fill="#ffffff" opacity=".7"/>
</svg>`;
};

export const robotSVG = (): string => `<svg class="robot-art mood-idle" viewBox="0 0 160 190" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="80" cy="182" rx="46" ry="7" fill="#0000001f"/>
  <line x1="80" y1="30" x2="80" y2="10" stroke="#5a6b86" stroke-width="5" stroke-linecap="round"/>
  <circle class="bulb" cx="80" cy="9" r="9" fill="#ffd166" stroke="#e0a100" stroke-width="3"/>
  <rect x="24" y="30" width="112" height="82" rx="26" fill="#8fb3e8" stroke="#5a86c7" stroke-width="5"/>
  <rect x="38" y="46" width="84" height="40" rx="18" fill="#26364f"/>
  <circle cx="60" cy="66" r="12" fill="#7ee2ff"/><circle cx="100" cy="66" r="12" fill="#7ee2ff"/>
  <circle cx="63" cy="62" r="4" fill="#fff"/><circle cx="103" cy="62" r="4" fill="#fff"/>
  <g class="grill"><rect x="56" y="94" width="8" height="12" rx="3" fill="#26364f"/><rect x="68" y="92" width="8" height="16" rx="3" fill="#26364f"/><rect x="80" y="94" width="8" height="12" rx="3" fill="#26364f"/><rect x="92" y="92" width="8" height="16" rx="3" fill="#26364f"/></g>
  <rect x="42" y="116" width="76" height="56" rx="20" fill="#8fb3e8" stroke="#5a86c7" stroke-width="5"/>
  <circle cx="80" cy="144" r="12" fill="#ffd166" stroke="#e0a100" stroke-width="3"/>
  <rect x="16" y="120" width="22" height="14" rx="7" fill="#5a86c7"/><rect x="122" y="120" width="22" height="14" rx="7" fill="#5a86c7"/>
  <rect x="50" y="170" width="22" height="12" rx="6" fill="#5a86c7"/><rect x="88" y="170" width="22" height="12" rx="6" fill="#5a86c7"/>
</svg>`;

export const rocketSVG = (): string => `<svg class="rocket-art" viewBox="0 0 100 210" role="img" aria-hidden="true" focusable="false">
  <g class="flame"><path d="M36 150 Q50 210 64 150Z" fill="#ff9f1c"/><path d="M42 150 Q50 190 58 150Z" fill="#ffe066"/></g>
  <path d="M50 6 C78 30 82 80 78 140 L22 140 C18 80 22 30 50 6Z" fill="#fff" stroke="#c9d3e6" stroke-width="4"/>
  <path d="M50 6 C62 16 70 30 74 46 L26 46 C30 30 38 16 50 6Z" fill="#ef476f"/>
  <circle cx="50" cy="84" r="16" fill="#9ad7ff" stroke="#5aa9e6" stroke-width="5"/><circle cx="45" cy="79" r="5" fill="#fff" opacity=".8"/>
  <path d="M22 118 L4 152 L24 144Z" fill="#ef476f"/><path d="M78 118 L96 152 L76 144Z" fill="#ef476f"/>
  <rect x="30" y="136" width="40" height="14" rx="5" fill="#c9d3e6"/>
</svg>`;

export const chestSVG = (): string => `<svg class="chest-art" viewBox="0 0 180 160" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="90" cy="150" rx="64" ry="8" fill="#0000001f"/>
  <g class="rays"><circle cx="90" cy="70" r="60" fill="#ffe27a" opacity=".0"/></g>
  <rect x="22" y="70" width="136" height="72" rx="12" fill="#b8793a" stroke="#7a4a1d" stroke-width="5"/>
  <rect x="22" y="92" width="136" height="10" fill="#7a4a1d" opacity=".5"/>
  <g class="lid"><path d="M22 72 Q22 30 90 30 Q158 30 158 72Z" fill="#cf8c46" stroke="#7a4a1d" stroke-width="5"/><rect x="22" y="64" width="136" height="12" fill="#7a4a1d" opacity=".5"/></g>
  <rect x="78" y="76" width="24" height="30" rx="6" fill="#ffc933" stroke="#c98f00" stroke-width="4"/><circle cx="90" cy="90" r="4" fill="#7a4a1d"/>
</svg>`;

/** The Dino Valley backdrop: calm, low-contrast, so the learning object stays the star. */
export const sceneSVG = (): string => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe8ff"/><stop offset="1" stop-color="#eefbe9"/></linearGradient>
    <linearGradient id="sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2a5a"/><stop offset="1" stop-color="#4b5fa3"/></linearGradient>
  </defs>
  <rect class="sky-day" width="1600" height="900" fill="url(#sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#sky-n)"/>
  <g class="sun"><g transform="translate(1320 150)"><g class="rays">${Array.from({ length: 12 }, (_, i) => `<rect x="-5" y="-110" width="10" height="34" rx="5" fill="#ffe27a" transform="rotate(${i * 30})"/>`).join('')}</g></g><circle cx="1320" cy="150" r="58" fill="#ffd54a"/></g>
  <g class="moon"><circle cx="1320" cy="150" r="52" fill="#fff6c9"/><circle cx="1340" cy="136" r="46" fill="#4b5fa3" opacity=".0"/></g>
  <g class="stars" fill="#fff">${[[160, 90, 4], [420, 160, 3], [700, 70, 4], [980, 140, 3], [1180, 60, 3], [260, 260, 3], [840, 250, 4], [560, 320, 3], [1450, 290, 3], [90, 330, 3]].map(([x, y, r], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
  <g class="cloud c1" fill="#fff" opacity=".9"><ellipse cx="300" cy="170" rx="90" ry="30"/><ellipse cx="360" cy="150" rx="60" ry="32"/><ellipse cx="250" cy="156" rx="50" ry="26"/></g>
  <g class="cloud c2" fill="#fff" opacity=".8"><ellipse cx="900" cy="110" rx="80" ry="26"/><ellipse cx="950" cy="92" rx="52" ry="28"/><ellipse cx="860" cy="98" rx="44" ry="22"/></g>
  <g class="cloud c3" fill="#fff" opacity=".7"><ellipse cx="1180" cy="270" rx="70" ry="22"/><ellipse cx="1220" cy="254" rx="44" ry="24"/></g>
  <path d="M0 560 Q200 470 420 540 T820 520 T1240 540 T1600 500 V900 H0Z" fill="#cde9d4" class="hills-far"/>
  <g class="volcano"><path d="M1060 560 L1190 330 L1230 330 L1360 560Z" fill="#b99f86"/><path d="M1182 330 L1238 330 L1226 348 L1194 348Z" fill="#ff9966"/>
    <g class="smoke" fill="#e9edf2"><circle class="s1" cx="1210" cy="300" r="16"/><circle class="s2" cx="1210" cy="300" r="14"/><circle class="s3" cx="1210" cy="300" r="12"/></g></g>
  <path d="M0 640 Q260 560 520 630 T1040 620 T1600 590 V900 H0Z" fill="#a9dbb4" class="hills-mid"/>
  <path d="M0 740 Q300 690 600 740 T1200 735 T1600 710 V900 H0Z" fill="#82c996" class="hills-near"/>
  <g class="fern" fill="#4fa971"><path d="M80 780 q10 -80 70 -110 q-20 50 -10 110z"/><path d="M80 780 q-20 -60 -75 -80 q10 50 30 80z"/><path d="M1480 790 q-6 -80 -62 -112 q16 52 6 112z"/><path d="M1480 790 q24 -56 80 -70 q-14 46 -38 70z"/></g>
</svg>`;

export const islandSVG = (): string => `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="200" cy="170" rx="190" ry="18" fill="#3b8fb8" opacity=".35"/>
  <path d="M20 130 Q30 80 120 78 L280 78 Q370 80 380 130 Q380 168 200 170 Q20 168 20 130Z" fill="#f2d98d"/>
  <path d="M40 112 Q60 70 130 70 L270 70 Q340 70 360 112 Q300 96 200 96 Q100 96 40 112Z" fill="#7bd389"/>
  <g class="palm" transform="translate(318 20)"><path d="M10 100 Q18 50 8 14" stroke="#9c6b3a" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M8 14 q-34 -6 -44 14 q26 -6 44 -14z M8 14 q34 -8 46 10 q-26 -4 -46 -10z M8 14 q-6 -30 -28 -34 q10 22 28 34z M8 14 q8 -30 30 -32 q-12 20 -30 32z" fill="#3fae66"/></g>
</svg>`;

/** Where the mouth sits inside the dino's box, as percentages (for the drop target). */
export const dinoMouthPct = (kind: string): { x: number; y: number } => {
  const hy = dinoDef(kind).hy;
  return { x: 50, y: ((hy + 27 + 26) / 238) * 100 };
};

export const drumSVG = (): string => `<svg class="drum-art" viewBox="0 0 200 170" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="100" cy="160" rx="72" ry="8" fill="#0000001f"/>
  <path d="M28 70 L28 130 Q28 152 100 152 Q172 152 172 130 L172 70Z" fill="#ef476f"/>
  <path d="M28 70 L28 130 Q28 152 100 152 Q172 152 172 130 L172 70Z" fill="none" stroke="#c2284f" stroke-width="4"/>
  <path d="M40 74 L60 148 M70 78 L90 152 M100 80 L100 152 M130 78 L110 152 M160 74 L140 148" stroke="#ffd166" stroke-width="5" stroke-linecap="round" opacity=".9"/>
  <ellipse class="skin" cx="100" cy="70" rx="72" ry="26" fill="#fff5e0" stroke="#e0cfa8" stroke-width="5"/>
  <ellipse cx="100" cy="70" rx="72" ry="26" fill="none" stroke="#ffd166" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round" transform="translate(0 6)"/>
</svg>`;

export const potSVG = (): string => `<svg class="pot-art" viewBox="0 0 160 150" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="80" cy="142" rx="56" ry="8" fill="#0000001f"/>
  <path class="steam" d="M60 30 q-8 -12 0 -22 M82 26 q-8 -12 0 -22 M104 30 q-8 -12 0 -22" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0"/>
  <path d="M22 62 Q22 138 80 138 Q138 138 138 62Z" fill="#6b7a99"/><path d="M22 62 Q22 138 80 138 Q138 138 138 62Z" fill="none" stroke="#4a5876" stroke-width="4"/>
  <path d="M34 80 Q38 124 62 130" stroke="#fff" stroke-width="5" fill="none" opacity=".25" stroke-linecap="round"/>
  <rect x="8" y="56" width="144" height="14" rx="7" fill="#8693b3" stroke="#4a5876" stroke-width="4"/>
  <path class="lid" d="M30 56 Q30 30 80 30 Q130 30 130 56Z" fill="#8693b3" stroke="#4a5876" stroke-width="4"/><circle class="lid" cx="80" cy="26" r="7" fill="#ffc933" stroke="#c98f00" stroke-width="3"/>
</svg>`;
