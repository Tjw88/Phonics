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
export const accessorySVG = (n: number, hy: number): string => {
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
    ${faceEyesSVG(hy)}
    <ellipse cx="92" cy="${hy + 8}" rx="2.6" ry="3.4" fill="${dark}" opacity=".55"/><ellipse cx="108" cy="${hy + 8}" rx="2.6" ry="3.4" fill="${dark}" opacity=".55"/>
    ${faceMouthSVG(hy)}
    ${accessorySVG(growth, hy)}
  </g>
  ${zzzSVG(hy)}
</svg>`;
};

export const mixHex = (hex: string, withHex: string, t: number): string => {
  const f = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const m = (i: number) => Math.round(f(hex, i) * (1 - t) + f(withHex, i) * t).toString(16).padStart(2, '0');
  return `#${m(0)}${m(1)}${m(2)}`;
};

/**
 * THE COMPANION CONTRACT (every theme pack's creatures follow it, so moods, eye-tracking, the feeding drop-target and the growing
 * accessories all work unchanged). A creature is an <svg class="dino mood-idle" viewBox="0 -26 200 238"> whose head/face is centred
 * on x=100, y=hy with a radius of roughly 40-44. The face is these shared parts, drawn on top of the creature's own head:
 *   faceEyesSVG(hy)  cheeks + three eye states (.eyes-open with .pupil circles for lookAt, .eyes-happy, .eyes-closed)
 *   faceMouthSVG(hy) three mouth states (.mouth-smile, .mouth-open, .mouth-oh); the mouth is at (100, hy+22)
 *   zzzSVG(hy)       the sleep "zzz"
 *   accessorySVG(n, hy)  growth 0..4: nothing, bow, scarf, explorer hat, crown
 * Wrap the head in <g class="headg"> (it bobs) and give a tail/flag/antenna the class "tail" (it wags). Mood is a CSS class on the root.
 */
export const faceEyesSVG = (hy: number): string => {
  const ey = hy - 4;
  return `<circle cx="66" cy="${hy + 14}" r="9" fill="#ff8fa3" opacity=".5"/><circle cx="134" cy="${hy + 14}" r="9" fill="#ff8fa3" opacity=".5"/>
    <g class="eyes eyes-open">
      <circle cx="80" cy="${ey}" r="13" fill="#fff"/><circle cx="120" cy="${ey}" r="13" fill="#fff"/>
      <circle class="pupil" cx="82" cy="${ey + 1}" r="8" fill="#26303f"/><circle class="pupil" cx="118" cy="${ey + 1}" r="8" fill="#26303f"/>
      <circle cx="85" cy="${ey - 3}" r="3" fill="#fff"/><circle cx="121" cy="${ey - 3}" r="3" fill="#fff"/>
    </g>
    <g class="eyes eyes-happy" fill="none" stroke="#26303f" stroke-width="5" stroke-linecap="round"><path d="M67 ${ey + 3} Q80 ${ey - 14} 93 ${ey + 3}"/><path d="M107 ${ey + 3} Q120 ${ey - 14} 133 ${ey + 3}"/></g>
    <g class="eyes eyes-closed" fill="none" stroke="#26303f" stroke-width="5" stroke-linecap="round"><path d="M67 ${ey} Q80 ${ey + 11} 93 ${ey}"/><path d="M107 ${ey} Q120 ${ey + 11} 133 ${ey}"/></g>`;
};
export const faceMouthSVG = (hy: number): string => {
  const my = hy + 22;
  return `<path class="mouth mouth-smile" d="M84 ${my} Q100 ${my + 16} 116 ${my}" fill="none" stroke="#3b2030" stroke-width="4.5" stroke-linecap="round"/>
    <g class="mouth mouth-open"><ellipse cx="100" cy="${my + 5}" rx="17" ry="14" fill="#6b2437"/><ellipse cx="100" cy="${my + 12}" rx="10" ry="5.5" fill="#ff8fa3"/></g>
    <ellipse class="mouth mouth-oh" cx="100" cy="${my + 5}" rx="7" ry="9" fill="#6b2437"/>`;
};
export const zzzSVG = (hy: number): string =>
  `<g class="zzz" fill="#5b6fb5" font-family="Andika, sans-serif" font-weight="700"><text x="142" y="${hy - 26}" font-size="22">z</text><text x="156" y="${hy - 42}" font-size="28">z</text><text x="172" y="${hy - 60}" font-size="34">Z</text></g>`;
/** Mouth position inside a creature's box, as percentages, for the feeding drop target (valid for any creature that follows the contract). */
export const mouthPctFor = (hy: number): { x: number; y: number } => ({ x: 50, y: ((hy + 27 + 26) / 238) * 100 });

/** A glossy, vivid egg in a creature's colours. */
export const eggFromColours = (id: string, main: string, dark: string, accent: string): string => {
  const light = mixHex(main, '#ffffff', 0.55);
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs><radialGradient id="eg-${id}" cx="34%" cy="26%" r="85%"><stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${main}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>
  <ellipse cx="60" cy="142" rx="38" ry="7" fill="#0000002b"/>
  <path d="M60 6 C100 6 112 78 112 98 C112 128 90 142 60 142 C30 142 8 128 8 98 C8 78 20 6 60 6Z" fill="url(#eg-${id})"/>
  <circle cx="38" cy="66" r="9" fill="${accent}" opacity=".95"/><circle cx="80" cy="52" r="7" fill="#ffffffcc"/><circle cx="84" cy="94" r="11" fill="${accent}" opacity=".95"/>
  <circle cx="44" cy="110" r="8" fill="#ffffffcc"/><circle cx="66" cy="80" r="5" fill="${dark}" opacity=".55"/>
  <ellipse cx="38" cy="38" rx="13" ry="22" fill="#ffffff" opacity=".55" transform="rotate(24 38 38)"/><ellipse cx="30" cy="56" rx="4" ry="6" fill="#ffffff" opacity=".7"/>
</svg>`;
};

/** A glossy, vivid egg in the dino's colour, used for choosing a companion. */
export const eggSVG = (kind: string): string => {
  const d = dinoDef(kind);
  return eggFromColours(d.id, d.main, d.dark, d.accent);
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

/** The Dino Valley backdrop: a calm prehistoric valley, rich at the edges and quiet in the middle so the learning object stays the star. */
export const sceneSVG = (): string => {
  const r1 = (n: number): number => Math.round(n * 10) / 10;
  // a feathery frond (pointing right from the origin, arching over); colour comes from the <use>
  const frondLeaflets = (): string => {
    const P = [[0, 0], [58, -64], [138, -6]] as const;
    let out = '';
    for (let i = 0; i < 14; i++) {
      const t = 0.1 + i * 0.065;
      const x = (1 - t) * (1 - t) * P[0][0] + 2 * (1 - t) * t * P[1][0] + t * t * P[2][0];
      const y = (1 - t) * (1 - t) * P[0][1] + 2 * (1 - t) * t * P[1][1] + t * t * P[2][1];
      const dx = 2 * (1 - t) * (P[1][0] - P[0][0]) + 2 * t * (P[2][0] - P[1][0]);
      const dy = 2 * (1 - t) * (P[1][1] - P[0][1]) + 2 * t * (P[2][1] - P[1][1]);
      const th = (Math.atan2(dy, dx) * 180) / Math.PI;
      const L = 17 * (1 - 0.6 * t) + 3;
      for (const a of [-58, 58]) out += `<ellipse cx="${r1(L * 0.85)}" cy="0" rx="${r1(L)}" ry="${r1(L * 0.3)}" transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(th + a)})"/>`;
    }
    return `${out}<ellipse cx="143" cy="-2" rx="13" ry="4.5" transform="rotate(8 143 -2)"/><path d="M0 0 Q58 -64 138 -6" fill="none" stroke="#0b4a2c" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`;
  };
  const crown = (x: number, y: number, s: number, c1: string, c2: string): string => {
    const back = [-88, -62, -34, -6, 22];
    let o = '';
    back.forEach((a, i) => { for (const m of [1, -1]) o += `<use href="#dino-frond" fill="${i % 2 ? c1 : c2}" transform="translate(${x} ${y}) scale(${r1(m * s)} ${s}) rotate(${a + (i === 0 ? 0 : 0)})"/>`; });
    return o;
  };
  const treeFern = (x: number, baseY: number, topX: number, topY: number, s: number, w: number, c1: string, c2: string): string => {
    const my = (baseY + topY) / 2;
    const trunk = `<path d="M${x - w} ${baseY} Q${x - w * 0.5} ${my} ${topX - w * 0.45} ${topY} L${topX + w * 0.45} ${topY} Q${x + w * 0.5} ${my} ${x + w} ${baseY}Z" fill="#8a6848"/>
    <path d="M${x + w * 0.1} ${baseY} Q${x + w * 0.4} ${my} ${topX + w * 0.1} ${topY} L${topX + w * 0.45} ${topY} Q${x + w * 0.5} ${my} ${x + w} ${baseY}Z" fill="#6f5238" opacity=".55"/>`;
    let marks = '';
    for (let k = 1; k < 9; k++) {
      const t = k / 9; const yy = baseY + (topY - baseY) * t; const xx = x + (topX - x) * t * t; const hw = (w * (1 - t * 0.55)) * 0.8;
      marks += `<path d="M${r1(xx - hw)} ${r1(yy)} q${r1(hw)} ${r1(-hw * 0.5)} ${r1(hw * 2)} 0" fill="none" stroke="#5e4429" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>`;
    }
    return `${trunk}${marks}${crown(topX, topY, s, c1, c2)}<circle cx="${topX}" cy="${topY - 4}" r="${r1(w * 0.55)}" fill="${c2}"/>`;
  };
  const cycad = (x: number, baseY: number, h: number, s: number, c1: string, c2: string): string =>
    `<path d="M${x - 26} ${baseY} Q${x - 34} ${baseY - h * 0.55} ${x - 20} ${baseY - h} L${x + 20} ${baseY - h} Q${x + 34} ${baseY - h * 0.55} ${x + 26} ${baseY}Z" fill="#8f6c49"/>
    <path d="M${x - 26} ${baseY} Q${x - 34} ${baseY - h * 0.55} ${x - 20} ${baseY - h} L${x + 20} ${baseY - h} Q${x + 34} ${baseY - h * 0.55} ${x + 26} ${baseY}Z" fill="url(#dino-scales)"/>
    <path d="M${x + 8} ${baseY} Q${x + 30} ${baseY - h * 0.5} ${x + 14} ${baseY - h} L${x + 20} ${baseY - h} Q${x + 34} ${baseY - h * 0.55} ${x + 26} ${baseY}Z" fill="#5e4429" opacity=".35"/>
    ${crown(x, baseY - h + 4, s, c1, c2)}`;
  const leafPlant = (x: number, y: number, s: number, flip: number, c1: string, c2: string): string =>
    [[-78, c2, 1], [-52, c1, 1.1], [-26, c2, 0.95], [-100, c1, 0.9], [0, c1, 0.8]].map(([a, c, k]) => `<use href="#dino-leaf" fill="${c}" transform="translate(${x} ${y}) scale(${r1(flip * s * (k as number))} ${r1(s * (k as number))}) rotate(${a})"/>`).join('');
  const flower = (x: number, y: number, c: string, s = 1): string =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 q-2 -10 0 -20" stroke="#3f8f5a" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="${c}" transform="translate(0 -22)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-6" rx="4.6" ry="6" transform="rotate(${a})"/>`).join('')}</g><circle cx="0" cy="-22" r="3.6" fill="#ffd166"/></g>`;
  const rock = (x: number, y: number, s: number, moss = true): string =>
    `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="4" cy="2" rx="62" ry="8" fill="#2f6a49" opacity=".25"/>
    <path d="M-58 0 Q-62 -30 -30 -42 Q0 -56 34 -40 Q62 -28 58 0Z" fill="#9b8470"/><path d="M-58 0 Q-62 -30 -30 -42 Q-6 -52 10 -46 Q-20 -30 -26 0Z" fill="#b8a38d"/><path d="M22 -42 Q60 -28 58 0 L30 0 Q42 -22 22 -42Z" fill="#7d6857"/>
    ${moss ? `<path d="M-44 -26 Q-34 -44 -6 -50 Q22 -52 34 -40 Q20 -34 12 -40 Q4 -30 -8 -38 Q-16 -26 -26 -34 Q-34 -24 -44 -26Z" fill="#79b865"/><path d="M-30 -38 Q-12 -48 6 -48 Q-8 -42 -30 -38Z" fill="#a5d98a" opacity=".8"/><circle cx="-40" cy="-12" r="5" fill="#79b865"/><circle cx="-30" cy="-6" r="3.5" fill="#79b865"/>` : ''}</g>`;
  const tree = (x: number, y: number, s: number, c: string, c2: string): string =>
    `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-30" width="6" height="30" rx="3" fill="#8a6848"/><ellipse cx="0" cy="-42" rx="24" ry="22" fill="${c}"/><ellipse cx="-8" cy="-50" rx="12" ry="10" fill="${c2}" opacity=".7"/></g>`;
  const footprint = (x: number, y: number, a: number): string =>
    `<g transform="translate(${x} ${y}) rotate(${a})" fill="#8a6a45" opacity=".4"><ellipse cx="0" cy="4" rx="5" ry="4"/><ellipse cx="-7" cy="-5" rx="2.6" ry="4.4" transform="rotate(-24 -7 -5)"/><ellipse cx="0" cy="-8" rx="2.6" ry="4.8"/><ellipse cx="7" cy="-5" rx="2.6" ry="4.4" transform="rotate(24 7 -5)"/></g>`;
  // a winding river across the bottom third: centreline y(x), banks and water drawn as ribbons
  const rc = (x: number): number => 852 + 20 * Math.sin(x / 210 + 0.6) + 6 * Math.sin(x / 70);
  const ribbon = (half: (x: number) => number, dy = 0): string => {
    const xs: number[] = []; for (let x = -20; x <= 1620; x += 20) xs.push(x);
    const top = xs.map((x) => `${r1(x)} ${r1(rc(x) + dy - half(x))}`);
    const bot = xs.slice().reverse().map((x) => `${r1(x)} ${r1(rc(x) + dy + half(x))}`);
    return `M${top.join(' L')} L${bot.join(' L')}Z`;
  };
  const hw = (x: number): number => 24 + 7 * Math.sin(x / 150 + 1.3);
  const ripples = [[300, 0], [520, 2], [760, -3], [980, 3], [1180, -2], [1380, 2], [140, 3], [1540, 0]]
    .map(([x, o]) => `<path d="M${x! - 24} ${r1(rc(x!) + o!)} q12 -6 24 0 t24 0" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>`).join('');
  const mtnSnow = (x: number, y: number, w: number): string => `<path d="M${x - w} ${y + w * 0.9} Q${x - w * 0.5} ${y + w * 0.7} ${x - w * 0.2} ${y + w * 0.95} Q${x + w * 0.1} ${y + w * 0.7} ${x + w * 0.4} ${y + w * 0.95} Q${x + w * 0.65} ${y + w * 0.75} ${x + w} ${y + w * 0.9} L${x} ${y}Z" fill="#fff" opacity=".85"/>`;
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0f2"/><stop offset=".6" stop-color="#cdeef5"/><stop offset="1" stop-color="#fdf1d4"/></linearGradient>
    <linearGradient id="sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2a5a"/><stop offset="1" stop-color="#4b5fa3"/></linearGradient>
    <linearGradient id="dino-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="dino-h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9e6c2"/><stop offset="1" stop-color="#a6d5ad"/></linearGradient>
    <linearGradient id="dino-h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a3d8a3"/><stop offset="1" stop-color="#7fc294"/></linearGradient>
    <linearGradient id="dino-h3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86cb8f"/><stop offset="1" stop-color="#5fb07c"/></linearGradient>
    <linearGradient id="dino-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd6ea"/><stop offset="1" stop-color="#5fb8d6"/></linearGradient>
    <radialGradient id="dino-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb870" stop-opacity=".85"/><stop offset=".5" stop-color="#ff9a5c" stop-opacity=".3"/><stop offset="1" stop-color="#ff9a5c" stop-opacity="0"/></radialGradient>
    <pattern id="dino-scales" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0 L12 6 L6 12Z" fill="none" stroke="#5e4429" stroke-opacity=".4" stroke-width="2"/></pattern>
    <g id="dino-frond">${frondLeaflets()}</g>
    <g id="dino-leaf"><path d="M0 0 C6 -70 100 -104 168 -72 C124 -34 52 -10 0 0Z"/><path d="M4 -4 Q70 -34 156 -68" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/><path d="M40 -22 l10 -26 M72 -38 l12 -26 M104 -52 l10 -22" stroke="#fff" stroke-opacity=".2" stroke-width="2.5" stroke-linecap="round"/></g>
    <g id="dino-ptero"><path d="M-5 0 C-20 -15 -50 -24 -78 -12 C-52 -8 -36 -2 -22 9 C-14 11 -8 9 -4 6Z"/><path d="M5 0 C20 -15 50 -24 78 -12 C52 -8 36 -2 22 9 C14 11 8 9 4 6Z"/><ellipse cx="0" cy="3" rx="9" ry="5"/><path d="M6 0 L24 -2 L42 3 L24 5 L14 9Z"/><path d="M8 -2 L-2 -12 L14 -4Z"/><path d="M-6 4 L-20 12 L-4 8Z"/></g>
    <g id="dino-far"><ellipse cx="0" cy="0" rx="38" ry="19"/><path d="M-34 -4 Q-74 4 -92 22 Q-60 12 -30 12Z"/><rect x="-26" y="8" width="10" height="26" rx="5"/><rect x="-8" y="10" width="10" height="24" rx="5"/><rect x="14" y="10" width="10" height="24" rx="5"/><rect x="28" y="6" width="10" height="28" rx="5"/><path d="M26 -8 Q58 -40 72 -6" fill="none" stroke-width="11" stroke-linecap="round" stroke="currentColor"/><ellipse cx="76" cy="0" rx="10" ry="6.5" transform="rotate(30 76 0)"/></g>
  </defs>
  <rect class="sky-day" width="1600" height="900" fill="url(#sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#sky-n)"/>
  <g class="sun"><g transform="translate(1320 150)"><g class="rays">${Array.from({ length: 12 }, (_, i) => `<rect x="-5" y="-110" width="10" height="34" rx="5" fill="#ffe27a" transform="rotate(${i * 30})"/>`).join('')}</g></g><circle cx="1320" cy="150" r="58" fill="#ffd54a"/></g>
  <g class="moon"><circle cx="1320" cy="150" r="52" fill="#fff6c9"/><circle cx="1340" cy="136" r="46" fill="#4b5fa3" opacity=".0"/></g>
  <g class="stars" fill="#fff">${[[160, 90, 4], [420, 160, 3], [700, 70, 4], [980, 140, 3], [1180, 60, 3], [260, 260, 3], [840, 250, 4], [560, 320, 3], [1450, 290, 3], [90, 330, 3]].map(([x, y, r], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
  <g class="cloud c1" fill="#fff" opacity=".9"><ellipse cx="300" cy="170" rx="90" ry="30"/><ellipse cx="360" cy="150" rx="60" ry="32"/><ellipse cx="250" cy="156" rx="50" ry="26"/></g>
  <g class="cloud c2" fill="#fff" opacity=".8"><ellipse cx="900" cy="110" rx="80" ry="26"/><ellipse cx="950" cy="92" rx="52" ry="28"/><ellipse cx="860" cy="98" rx="44" ry="22"/></g>
  <g class="cloud c3" fill="#fff" opacity=".7"><ellipse cx="1180" cy="270" rx="70" ry="22"/><ellipse cx="1220" cy="254" rx="44" ry="24"/></g>
  <g class="scenery">
  <!-- far misty mountains -->
  <path d="M0 520 L0 410 L80 340 L170 420 L260 310 L380 430 L470 370 L580 450 L700 330 L820 440 L940 380 L1060 460 L1160 370 L1260 450 L1340 390 L1460 450 L1600 380 V600 H0Z" fill="#c8d8ef" stroke="#c8d8ef" stroke-width="16" stroke-linejoin="round"/>
  ${mtnSnow(260, 310, 44)}${mtnSnow(700, 330, 46)}${mtnSnow(1160, 370, 40)}${mtnSnow(80, 340, 32)}
  <path d="M0 540 L0 470 L120 410 L240 480 L360 430 L500 500 L640 440 L780 500 L930 450 L1080 505 L1220 455 L1370 510 L1500 460 L1600 490 V600 H0Z" fill="#a9c9dc" stroke="#a9c9dc" stroke-width="16" stroke-linejoin="round"/>
  <rect x="0" y="430" width="1600" height="150" fill="url(#dino-mist)"/>
  <!-- the volcano: soft glowing rim, lava streaks, smoke -->
  <g class="volcano"><circle cx="1450" cy="334" r="100" fill="url(#dino-glow)"/>
    <path d="M1230 640 C1310 570 1386 410 1418 334 L1482 334 C1514 410 1590 570 1670 640Z" fill="#b59d97" stroke="#b59d97" stroke-width="10" stroke-linejoin="round"/>
    <path d="M1482 334 C1514 410 1590 570 1670 640 L1540 640 C1520 520 1496 420 1470 334Z" fill="#9a817f" opacity=".7"/>
    <path d="M1300 610 Q1360 560 1404 420 L1420 360 Q1400 470 1350 580Z" fill="#cdb8ae" opacity=".7"/>
    <ellipse cx="1450" cy="334" rx="40" ry="10" fill="#6f5a58"/><ellipse cx="1450" cy="335" rx="32" ry="6.5" fill="#ff9a5c"/><ellipse cx="1450" cy="336" rx="22" ry="3.6" fill="#ffd27a"/>
    <path d="M1436 342 Q1428 372 1440 400 Q1448 424 1436 452" fill="none" stroke="#ff9a5c" stroke-width="7" stroke-linecap="round" opacity=".75"/><path d="M1462 342 Q1472 366 1464 394" fill="none" stroke="#ffb870" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    <g class="smoke" fill="#ece6ee"><circle class="s1" cx="1450" cy="300" r="16"/><circle class="s2" cx="1450" cy="300" r="14"/><circle class="s3" cx="1450" cy="300" r="12"/></g></g>
  <!-- warm sandstone mesas -->
  ${[[430, 612, 1], [1090, 616, .9], [800, 618, .8]].map(([x, y, k]) => `<g transform="translate(${x} ${y}) scale(${k})" opacity=".9"><path d="M-84 0 L-70 -52 Q-66 -62 -54 -62 L54 -62 Q66 -62 70 -52 L84 0Z" fill="#e3bd93"/><path d="M-76 -22 L76 -22 M-72 -40 L72 -40" stroke="#c99a6e" stroke-width="4" opacity=".6"/><path d="M38 -62 L54 -62 Q66 -62 70 -52 L84 0 L60 0Z" fill="#c99a6e" opacity=".5"/></g>`).join('')}
  <!-- far hills with a grazing long-neck, little trees -->
  <path class="hills-far" d="M0 590 Q180 520 380 572 T760 560 T1140 582 T1600 548 V900H0Z" fill="url(#dino-h1)"/>
  <use href="#dino-far" fill="#86a9a0" color="#86a9a0" opacity=".85" transform="translate(205 586) scale(.74)"/>
  ${[[330, 566, .55], [470, 580, .5], [620, 566, .5], [1010, 578, .55], [1130, 584, .5], [1280, 574, .6]].map(([x, y, s]) => tree(x!, y!, s!, '#98cba0', '#b6dfb4')).join('')}
  <path class="hills-mid" d="M0 664 Q240 596 520 646 T1060 636 T1600 614 V900H0Z" fill="url(#dino-h2)"/>
  ${[[60, 640, .9], [272, 640, .7], [380, 646, .6], [600, 650, .55], [1000, 640, .55], [1180, 634, .7]].map(([x, y, s]) => tree(x!, y!, s!, '#79bf8c', '#97d3a0')).join('')}
  <!-- the calm lake -->
  <ellipse cx="800" cy="676" rx="190" ry="20" fill="#bfe3ea"/><ellipse cx="800" cy="674" rx="170" ry="15" fill="url(#dino-water)" opacity=".8"/><path d="M700 674 q14 -5 28 0 t28 0 M850 680 q12 -5 24 0 t24 0" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>
  <!-- cliff with a little waterfall, pool and stream (right) -->
  <g transform="translate(-34 0)">  <path d="M1306 690 Q1304 560 1372 530 Q1440 512 1470 570 L1488 690Z" fill="#a98f77"/><path d="M1306 690 Q1304 560 1372 530 Q1396 522 1408 524 Q1360 570 1352 690Z" fill="#c4ad94"/><path d="M1440 530 Q1480 560 1488 690 L1450 690 Q1456 590 1440 530Z" fill="#8a7461"/>
  <path d="M1344 546 Q1376 520 1410 528 Q1440 536 1456 556 Q1420 546 1400 556 Q1380 540 1344 546Z" fill="#79b865"/>
  <path d="M1382 536 Q1396 530 1410 536 L1414 676 Q1396 684 1380 676Z" fill="#d6f1fa"/><path d="M1392 542 L1392 672 M1402 542 L1404 672" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="1397" cy="690" rx="62" ry="14" fill="#7bc7e0"/><ellipse cx="1397" cy="688" rx="46" ry="9" fill="#a8e1f0"/><circle cx="1380" cy="684" r="7" fill="#fff" opacity=".8"/><circle cx="1400" cy="680" r="9" fill="#fff" opacity=".8"/><circle cx="1416" cy="686" r="6" fill="#fff" opacity=".8"/></g>
  <path class="hills-near" d="M0 768 Q300 714 640 756 T1250 750 T1600 722 V900H0Z" fill="url(#dino-h3)"/>
  <path d="M1363 700 C1346 740 1416 770 1386 850" fill="none" stroke="#a8e1f0" stroke-width="20" stroke-linecap="round"/>
  <!-- the winding river -->
  <path d="${ribbon((x) => hw(x) + 12)}" fill="#ecd9a6"/><path d="${ribbon(hw)}" fill="url(#dino-water)"/><path d="${ribbon((x) => hw(x) * 0.5, -3)}" fill="#bdeaf5" opacity=".6"/>${ripples}
  <path d="M0 892 Q400 872 800 888 T1600 880 V900H0Z" fill="#4f9a6c"/>
  <!-- little footprints, a nest of eggs -->
  ${[[560, 806, 80], [610, 796, 100], [662, 808, 80], [714, 798, 100], [766, 806, 80], [818, 796, 100]].map(([x, y, a]) => footprint(x!, y!, a!)).join('')}
  <g transform="translate(410 826)"><ellipse cx="0" cy="10" rx="56" ry="9" fill="#2f6a49" opacity=".25"/><ellipse cx="0" cy="0" rx="52" ry="15" fill="#7a5532"/><ellipse cx="0" cy="-4" rx="42" ry="9" fill="#a6784a"/>
    <ellipse cx="-17" cy="-12" rx="12" ry="15" fill="#fff6dc"/><ellipse cx="3" cy="-15" rx="12" ry="15" fill="#d9efd2"/><ellipse cx="22" cy="-11" rx="12" ry="15" fill="#fde7c4"/>
    <circle cx="-20" cy="-14" r="2" fill="#e8c68f"/><circle cx="-13" cy="-8" r="1.8" fill="#e8c68f"/><circle cx="0" cy="-19" r="2" fill="#a7cf9c"/><circle cx="8" cy="-12" r="1.8" fill="#a7cf9c"/><circle cx="19" cy="-15" r="2" fill="#f0b98a"/>
    <path d="M-22 -20 q4 -4 8 -2 M-2 -23 q4 -4 8 -2" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M-52 -2 Q-26 12 0 12 Q26 12 52 -2 M-44 4 l8 -8 M30 6 l12 -8 M-10 12 l4 -8" fill="none" stroke="#5e3f22" stroke-width="3.5" stroke-linecap="round"/></g>
  <!-- left edge: tree fern, cycad, big leaves, mossy rock, flowers -->
  ${rock(262, 836, .7)}
  ${leafPlant(40, 885, 1.15, 1, '#3f9d63', '#2f8553')}
  ${treeFern(56, 890, 52, 548, 1.0, 15, '#4fae6d', '#2f8a58')}
  ${cycad(200, 852, 48, .8, '#58b676', '#3b9763')}
  ${leafPlant(120, 892, .8, 1, '#5cbf7b', '#3f9d63')}
  ${flower(160, 872, '#f78fb3', 1.1)}${flower(236, 868, '#ffd166', 1)}${flower(24, 770, '#f08a5d', 1)}${flower(330, 872, '#fff', .9)}${flower(486, 876, '#f78fb3', .9)}
  <!-- right edge: tree fern, cycad, big leaves, mossy rock, flowers -->
  ${rock(1292, 850, .85)}
  ${leafPlant(1580, 885, 1.15, -1, '#3f9d63', '#2f8553')}
  ${treeFern(1560, 892, 1566, 590, 1.1, 17, '#4fae6d', '#2f8a58')}
  ${cycad(1470, 876, 48, .8, '#58b676', '#3b9763')}
  ${leafPlant(1480, 896, .8, -1, '#5cbf7b', '#3f9d63')}
  ${flower(1370, 872, '#ffd166', 1)}${flower(1228, 872, '#f78fb3', 1)}${flower(1190, 880, '#fff', .9)}${flower(1580, 760, '#f08a5d', 1)}${flower(1000, 876, '#ffd166', .9)}${flower(640, 878, '#f08a5d', .9)}
  <!-- friendly distant pterosaurs -->
  <use href="#dino-ptero" fill="#6a7896" opacity=".6" transform="translate(150 230) scale(.7) rotate(-6)"/>
  <use href="#dino-ptero" fill="#6a7896" opacity=".55" transform="translate(1460 250) scale(.55) rotate(8)"/>
  <use href="#dino-ptero" fill="#6a7896" opacity=".45" transform="translate(1500 205) scale(.36) rotate(4)"/>
  </g>
</svg>`;
};

export const islandSVG = (): string => {
  const r1 = (n: number): number => Math.round(n * 10) / 10;
  const leaflets = (): string => {
    let out = '';
    for (let i = 0; i < 11; i++) {
      const t = 0.1 + i * 0.08;
      const x = 2 * (1 - t) * t * 58 + t * t * 138, y = 2 * (1 - t) * t * -64 + t * t * -6;
      const dx = 2 * (1 - t) * 58 + 2 * t * 80, dy = 2 * (1 - t) * -64 + 2 * t * 58;
      const th = (Math.atan2(dy, dx) * 180) / Math.PI, L = 17 * (1 - 0.6 * t) + 3;
      for (const a of [-58, 58]) out += `<ellipse cx="${r1(L * 0.85)}" cy="0" rx="${r1(L)}" ry="${r1(L * 0.3)}" transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(th + a)})"/>`;
    }
    return `${out}<path d="M0 0 Q58 -64 138 -6" fill="none" stroke="#0b4a2c" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`;
  };
  const crown = (x: number, y: number, s: number, c1: string, c2: string, angles: number[]): string =>
    angles.map((a, i) => [1, -1].map((m) => `<use href="#dino-i-frond" fill="${i % 2 ? c1 : c2}" transform="translate(${x} ${y}) scale(${r1(m * s)} ${s}) rotate(${a})"/>`).join('')).join('');
  const flower = (x: number, y: number, c: string): string =>
    `<g transform="translate(${x} ${y})"><path d="M0 0 q-1 -6 0 -12" stroke="#3f8f5a" stroke-width="2.4" fill="none" stroke-linecap="round"/><g fill="${c}" transform="translate(0 -14)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-3.6" rx="2.8" ry="3.6" transform="rotate(${a})"/>`).join('')}</g><circle cx="0" cy="-14" r="2.2" fill="#ffd166"/></g>`;
  return `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="dino-i-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd6ea"/><stop offset="1" stop-color="#5fb8d6"/></linearGradient>
    <g id="dino-i-frond">${leaflets()}</g>
  </defs>
  <ellipse cx="200" cy="170" rx="192" ry="17" fill="#3b8fb8" opacity=".35"/>
  <ellipse cx="200" cy="168" rx="176" ry="11" fill="#8fd6ea" opacity=".45"/>
  <path d="M30 176 q14 -6 28 0 t28 0 M300 178 q14 -6 28 0 t28 0 M150 182 q14 -5 28 0 t28 0" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>
  <path d="M22 130 Q30 80 120 78 L280 78 Q370 80 378 130 Q378 168 200 170 Q22 168 22 130Z" fill="#a9825a"/>
  <path d="M22 134 Q30 84 120 82 L280 82 Q370 84 378 134 Q374 160 200 162 Q26 160 22 134Z" fill="#f2d98d"/>
  <path d="M44 150 Q120 164 200 164 Q290 164 356 148" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>
  <path d="M34 112 Q54 68 130 66 L270 66 Q346 68 366 112 Q300 118 200 118 Q100 118 34 112Z" fill="#7bd389"/>
  <path d="M34 112 Q100 118 200 118 Q300 118 366 112 Q340 112 200 110 Q60 112 34 112Z" fill="#58b878" opacity=".55"/>
  <!-- back-left: a little rock with a trickle of waterfall into a pond -->
  <path d="M52 92 Q50 52 86 44 Q120 40 134 70 L140 92Z" fill="#a98f77"/><path d="M52 92 Q50 52 86 44 Q98 42 106 44 Q76 60 74 92Z" fill="#c4ad94"/><path d="M118 48 Q136 60 140 92 L124 92 Q126 66 118 48Z" fill="#8a7461"/>
  <path d="M70 52 Q86 40 108 46 Q96 56 84 54 Q78 62 70 52Z" fill="#79b865"/>
  <path d="M84 54 Q92 52 98 56 L99 94 Q91 98 83 94Z" fill="#d6f1fa"/><path d="M89 58 L89 92 M94 58 L94 92" stroke="#fff" stroke-opacity=".75" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="92" cy="101" rx="38" ry="9" fill="#7bc7e0"/><ellipse cx="92" cy="100" rx="28" ry="6" fill="#a8e1f0"/><circle cx="84" cy="98" r="4" fill="#fff" opacity=".85"/><circle cx="96" cy="97" r="5" fill="#fff" opacity=".85"/><circle cx="104" cy="100" r="3" fill="#fff" opacity=".85"/>
  <!-- ferns -->
  <g transform="translate(158 98)">${crown(0, 0, .28, '#4fae6d', '#2f8a58', [-80, -48, -16, 14])}</g>
  <g transform="translate(262 100)">${crown(0, 0, .3, '#5cbf7b', '#3b9763', [-80, -45, -10])}</g>
  <!-- the big tree: curved trunk, a crown of fronds -->
  <path d="M308 124 Q322 100 314 58 L328 58 Q336 104 328 124Z" fill="#9c6b3a"/><path d="M319 124 Q330 100 322 58 L328 58 Q336 104 328 124Z" fill="#7a5230" opacity=".55"/>
  <path d="M311 114 q9 -4 18 0 M313 102 q8 -4 16 0 M314 88 q8 -4 15 0 M314 74 q7 -4 14 0" fill="none" stroke="#5e3f22" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
  ${crown(321, 60, .46, '#3fae66', '#2b8c52', [-78, -52, -26, 0, 26])}
  <circle cx="315" cy="62" r="4" fill="#8a5a2c"/><circle cx="326" cy="63" r="4" fill="#8a5a2c"/>
  <!-- mossy rock, flowers, a nest with an egg -->
  <g transform="translate(64 128)"><ellipse cx="2" cy="2" rx="32" ry="5" fill="#2f6a49" opacity=".25"/><path d="M-30 0 Q-32 -16 -14 -22 Q2 -30 18 -20 Q32 -14 30 0Z" fill="#9b8470"/><path d="M-30 0 Q-32 -16 -14 -22 Q-2 -26 4 -24 Q-12 -14 -14 0Z" fill="#b8a38d"/><path d="M-22 -14 Q-14 -26 2 -27 Q16 -27 18 -20 Q10 -18 6 -22 Q0 -14 -6 -20 Q-14 -12 -22 -14Z" fill="#79b865"/></g>
  ${flower(26, 126, '#f78fb3')}${flower(190, 84, '#ffd166')}${flower(212, 80, '#f08a5d')}${flower(286, 112, '#fff')}${flower(372, 120, '#ffd166')}
  <g transform="translate(350 138)"><ellipse cx="0" cy="7" rx="26" ry="5" fill="#2f6a49" opacity=".25"/><ellipse cx="0" cy="0" rx="24" ry="8" fill="#7a5532"/><ellipse cx="0" cy="-2" rx="19" ry="5" fill="#a6784a"/><ellipse cx="-6" cy="-9" rx="8" ry="10" fill="#fff6dc"/><ellipse cx="7" cy="-8" rx="8" ry="10" fill="#d9efd2"/><circle cx="-8" cy="-10" r="1.5" fill="#e8c68f"/><circle cx="9" cy="-9" r="1.5" fill="#a7cf9c"/><path d="M-9 -14 q3 -3 6 -1" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/><path d="M-24 0 Q-12 8 0 8 Q12 8 24 0" fill="none" stroke="#5e3f22" stroke-width="2.5" stroke-linecap="round"/></g>
</svg>`;
};

/** Where the mouth sits inside the dino's box, as percentages (for the drop target). */
export const dinoMouthPct = (kind: string): { x: number; y: number } => mouthPctFor(dinoDef(kind).hy);

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
