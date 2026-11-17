import { mixHex } from '../art';

// Music Band: the instrument-case arrival, the stage backdrop and the home island. Calm, flat, light tints (see PACK_BRIEF).
// No text, no letters and no logos anywhere: only note and star SHAPES.

const f1 = (n: number): string => n.toFixed(1);

// ------------------------------------------------------------------ small shared shapes
/** a five-point star, rounded by its own stroke */
const starPath = (cx: number, cy: number, R: number, r = R * 0.5): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (-90 + i * 36) * (Math.PI / 180);
    const rr = i % 2 ? r : R;
    pts.push(`${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))}`);
  }
  return `M${pts.join(' L')}Z`;
};
const star = (cx: number, cy: number, R: number, fill: string, cls = ''): string =>
  `<path ${cls ? `class="${cls}" ` : ''}d="${starPath(cx, cy, R)}" fill="${fill}" stroke="${fill}" stroke-width="${f1(R * 0.22)}" stroke-linejoin="round"/>`;

/** a single eighth note: head at (x, y), stem going up, flag to the right */
const note = (x: number, y: number, s: number, fill: string): string =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><ellipse cx="0" cy="0" rx="9" ry="6.6" transform="rotate(-22)"/><rect x="6.4" y="-34" width="3.6" height="33" rx="1.8"/><path d="M8 -34 C12 -26 24 -26 24 -14 C21 -20 15 -20 8 -22Z"/></g>`;
/** two beamed eighth notes */
const notePair = (x: number, y: number, s: number, fill: string): string =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><ellipse cx="0" cy="0" rx="9" ry="6.6" transform="rotate(-22)"/><ellipse cx="26" cy="-5" rx="9" ry="6.6" transform="rotate(-22 26 -5)"/><rect x="6.4" y="-32" width="3.6" height="31" rx="1.8"/><rect x="32.4" y="-37" width="3.6" height="31" rx="1.8"/><path d="M6.4 -32 L36 -38 V-28 L6.4 -22Z"/></g>`;
/** a quarter note */
const noteQ = (x: number, y: number, s: number, fill: string): string =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><ellipse cx="0" cy="0" rx="9" ry="6.6" transform="rotate(-22)"/><rect x="6.4" y="-34" width="3.6" height="33" rx="1.8"/></g>`;
const sparkle4 = (x: number, y: number, s: number, c: string): string =>
  `<path d="M${x} ${y - s} Q${f1(x + s * 0.18)} ${f1(y - s * 0.18)} ${x + s} ${y} Q${f1(x + s * 0.18)} ${f1(y + s * 0.18)} ${x} ${y + s} Q${f1(x - s * 0.18)} ${f1(y + s * 0.18)} ${x - s} ${y} Q${f1(x - s * 0.18)} ${f1(y - s * 0.18)} ${x} ${y - s}Z" fill="${c}"/>`;

// ------------------------------------------------------------------ the arrival: an open instrument case with the instrument peeking out, glowing
const caseContents = (id: string, main: string, dark: string, accent: string): string => {
  const wood = '#b9792f', woodLight = '#f4c682';
  const bar = (x: number, h: number, c: string) => `<rect x="${x}" y="${84 - h}" width="12" height="${h + 6}" rx="6" fill="${c}" stroke="#fff" stroke-width="1.4"/><rect x="${x + 2.5}" y="${88 - h}" width="3" height="${h - 8}" rx="1.5" fill="#fff" opacity=".5"/>`;
  switch (id) {
    case 'music-drum': {
      const stick = (x1: number, x2: number) => `<path d="M${x1} 90 L${x2} 38" stroke="${wood}" stroke-width="6" stroke-linecap="round"/><path d="M${x1} 90 L${x2} 38" stroke="${woodLight}" stroke-width="3" stroke-linecap="round"/><circle cx="${x2}" cy="35" r="7" fill="#fff0cf" stroke="${wood}" stroke-width="2"/>`;
      return `${stick(38, 24)}${stick(82, 96)}<circle cx="60" cy="76" r="29" fill="${main}" stroke="${dark}" stroke-width="3"/><circle cx="60" cy="76" r="23" fill="#fff3dc" stroke="#efd5ac" stroke-width="2.4"/>${Array.from({ length: 7 }, (_, i) => { const a = (-160 + i * 23) * Math.PI / 180; return `<rect x="-2.6" y="-4" width="5.2" height="8" rx="2" fill="#e6ecf4" stroke="#aab6c6" stroke-width="1" transform="translate(${f1(60 + 26 * Math.cos(a))} ${f1(76 + 26 * Math.sin(a))}) rotate(${f1(a * 180 / Math.PI + 90)})"/>`; }).join('')}`;
    }
    case 'music-trumpet':
      return `<path d="M20 84 V70 H66 L100 46 Q110 66 106 90 L100 94 L66 84Z" fill="${main}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="102" cy="68" rx="9" ry="24" fill="#fff0b0" stroke="${dark}" stroke-width="3"/><path d="M26 74 H62" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>${[34, 46, 58].map((x) => `<rect x="${x - 4.5}" y="54" width="9" height="18" rx="4" fill="${dark}"/><circle cx="${x}" cy="51" r="4.4" fill="${accent}"/>`).join('')}<rect x="10" y="68" width="12" height="12" rx="4" fill="#e6ecf4" stroke="#aab6c6" stroke-width="2"/>`;
    case 'music-xylo':
      return `<path d="M18 72 H102 M18 90 H102" stroke="${dark}" stroke-width="5" stroke-linecap="round"/>${['#ff4d5e', '#ff9f1c', '#ffd91a', '#35d07f', '#4da3ff', '#a066ff'].map((c, i) => bar(22 + i * 15, 50 - i * 5, c)).join('')}<path d="M92 90 L108 40" stroke="${wood}" stroke-width="5" stroke-linecap="round"/><circle cx="109" cy="36" r="7.5" fill="#e0243a" stroke="#a8061c" stroke-width="2"/>`;
    default: {
      const maraca = (x: number, y: number, r: number, hx: number) => `<path d="M${x} ${y + r - 4} L${hx} 92" stroke="${wood}" stroke-width="9" stroke-linecap="round"/><path d="M${x} ${y + r - 4} L${hx} 92" stroke="${woodLight}" stroke-width="4.5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${r}" fill="${main}" stroke="${dark}" stroke-width="3"/><path d="M${x - r + 2} ${y - 4} Q${x} ${y - r - 4} ${x + r - 2} ${y - 4} Q${x} ${y - 14} ${x - r + 2} ${y - 4}Z" fill="${accent}"/><circle cx="${x - 7}" cy="${y + 6}" r="2.6" fill="#fff4d6"/><circle cx="${x + 5}" cy="${y + 10}" r="2.6" fill="#fff4d6"/><circle cx="${x + 9}" cy="${y + 1}" r="2.6" fill="#ffd23f"/><ellipse cx="${x - 8}" cy="${y - 10}" rx="4" ry="2.4" fill="#fff" opacity=".55"/>`;
      return `${maraca(38, 62, 20, 36)}${maraca(82, 52, 22, 86)}`;
    }
  }
};

export const musicCaseSVG = (id: string, main: string, dark: string, accent: string): string => {
  const gid = `music-case-${id}`;
  const shade = mixHex(main, dark, 0.45);
  const cream = '#fff4d8';
  const gold = '#f6cf5a', goldDark = '#c9981c';
  const latch = (x: number) => `<rect x="${x}" y="82" width="14" height="18" rx="4" fill="${gold}" stroke="${goldDark}" stroke-width="1.6"/><circle cx="${x + 7}" cy="92" r="3" fill="${goldDark}"/>`;
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="${gid}-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6a8" stop-opacity="1"/><stop offset=".5" stop-color="#ffd23f" stop-opacity=".75"/><stop offset="1" stop-color="#ffb703" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="60" cy="145" rx="50" ry="5.5" fill="#0000002b"/>
  <ellipse cx="60" cy="62" rx="62" ry="58" fill="url(#${gid}-glow)"/>
  <path d="M16 84 V38 Q16 20 34 20 H86 Q104 20 104 38 V84Z" fill="#5a2d82" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M22 80 V40 Q22 27 35 27 H85 Q98 27 98 40 V80Z" fill="#8a52b8"/><path d="M22 80 V40 Q22 27 35 27 H85 Q98 27 98 40 V80Z" fill="none" stroke="#f6cf5a" stroke-width="1.8" stroke-dasharray="4 4" opacity=".8"/>
  <ellipse cx="60" cy="62" rx="40" ry="40" fill="url(#${gid}-glow)" opacity=".8"/>
  <rect x="14" y="74" width="92" height="14" fill="#5a2d82"/>
  ${caseContents(id, main, dark, accent)}
  <rect x="10" y="132" width="16" height="8" rx="4" fill="${dark}"/><rect x="94" y="132" width="16" height="8" rx="4" fill="${dark}"/>
  <path d="M10 88 H110 V130 Q110 140 100 140 H20 Q10 140 10 130Z" fill="${main}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M10 122 H110 V130 Q110 140 100 140 H20 Q10 140 10 130Z" fill="${shade}" opacity=".5"/>
  <rect x="10" y="84" width="100" height="9" rx="3" fill="${shade}" stroke="${dark}" stroke-width="2.4"/>
  <rect x="50" y="93" width="20" height="47" fill="${accent}" stroke="${dark}" stroke-width="2"/><path d="M60 96 V136" stroke="#fff" stroke-width="2" stroke-dasharray="4 4" opacity=".7"/>
  ${latch(22)}${latch(84)}
  <rect x="10" y="126" width="13" height="14" rx="4" fill="${cream}" stroke="${dark}" stroke-width="2"/><rect x="97" y="126" width="13" height="14" rx="4" fill="${cream}" stroke="${dark}" stroke-width="2"/>
  <circle cx="60" cy="112" r="14" fill="${cream}" stroke="${dark}" stroke-width="2.4"/>
  <path d="${starPath(60, 112, 10)}" fill="${accent}" stroke="${dark}" stroke-width="1.8" stroke-linejoin="round"/>
  <ellipse cx="57" cy="108" rx="2.6" ry="1.6" fill="#fff" opacity=".7"/>
  ${note(12, 16, 0.42, '#ff9f1c')}${noteQ(108, 14, 0.38, '#ff9f1c')}${sparkle4(60, 9, 6, '#ffb703')}${sparkle4(30, 6, 4, '#ffb703')}${sparkle4(92, 5, 4, '#ffb703')}
</svg>`;
};

// ------------------------------------------------------------------ the stage backdrop
export const musicSceneSVG = (): string => {
  const sky = Array.from({ length: 16 }, (_, i) => `<rect x="${230 + i * 76}" y="0" width="38" height="660" rx="19" fill="${i % 2 ? '#ffffff' : '#a77fd0'}" opacity="${i % 2 ? 0.1 : 0.07}"/>`).join('');
  const stars = [[160, 96, 4], [420, 150, 3], [700, 230, 4], [980, 140, 3], [1180, 70, 3], [300, 300, 3], [860, 300, 4], [560, 330, 3], [1440, 300, 3], [90, 330, 3], [1040, 40, 3], [330, 60, 3]]
    .map(([x, y, r], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`).join('');
  const rays = Array.from({ length: 12 }, (_, i) => `<rect x="-5" y="-92" width="10" height="28" rx="5" fill="#ffd978" transform="rotate(${i * 30})"/>`).join('');

  // --- a velvet curtain with a gold tie-back (left side; the right side is the same mirrored)
  const EDGE = 'M262 0 C262 120 228 250 176 380 C140 468 122 510 114 548 C142 590 200 620 208 662';
  const fold = (f: number): string => `M${f1(f * 262)} 0 C${f1(f * 262)} 120 ${f1(f * 228)} 250 ${f1(f * 176)} 380 C${f1(f * 140)} 468 ${f1(f * 122)} 510 ${f1(f * 114)} 548 C${f1(f * 142)} 590 ${f1(f * 200)} 620 ${f1(f * 208)} 662`;
  const folds = [0.12, 0.27, 0.42, 0.57, 0.72, 0.87].map((f, i) => `<path d="${fold(f)}" fill="none" stroke="${i % 2 ? '#c47ee8' : '#4a1768'}" stroke-width="${i % 2 ? 16 : 24}" opacity="${i % 2 ? 0.22 : 0.3}" stroke-linecap="round"/>`).join('');
  const curtain = `<path d="M0 0 L262 0 C262 120 228 250 176 380 C140 468 122 510 114 548 C142 590 200 620 208 662 L0 662Z" fill="url(#music-velvet)"/>
    ${folds}
    <path d="${EDGE}" fill="none" stroke="#b7821a" stroke-width="11" stroke-linecap="round" opacity=".55"/><path d="${EDGE}" fill="none" stroke="#f6cc55" stroke-width="7" stroke-linecap="round"/>
    <path d="M0 528 Q64 566 118 548" fill="none" stroke="#b7821a" stroke-width="13" stroke-linecap="round"/><path d="M0 528 Q64 566 118 548" fill="none" stroke="#f6cc55" stroke-width="9" stroke-linecap="round"/><path d="M0 528 Q64 566 118 548" fill="none" stroke="#fff0b0" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="6 8" opacity=".8"/>
    <circle cx="120" cy="549" r="13" fill="#f6cc55" stroke="#b7821a" stroke-width="3"/><circle cx="116" cy="545" r="4" fill="#fff" opacity=".7"/>
    <path d="M110 560 Q120 572 130 560 L134 612 Q120 624 106 612Z" fill="#f6cc55" stroke="#b7821a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M112 590 V612 M120 592 V618 M128 590 V612" stroke="#b7821a" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`;
  // --- the swagged valance across the top corner
  const swag = (a: number, b: number): string => {
    const m = (a + b) / 2;
    return `<path d="M${a} 34 Q${m} 138 ${b} 34Z" fill="#7a2ba2"/><path d="M${a} 34 Q${m} 138 ${b} 34" fill="none" stroke="#f6cc55" stroke-width="6" stroke-linecap="round"/>
      <path d="M${a + 24} 38 Q${m - 4} 106 ${b - 30} 38" fill="none" stroke="#c47ee8" stroke-width="9" opacity=".3" stroke-linecap="round"/><path d="M${a + 46} 38 Q${m} 96 ${b - 52} 38" fill="none" stroke="#4a1768" stroke-width="11" opacity=".28" stroke-linecap="round"/>
      <circle cx="${b}" cy="38" r="11" fill="#f6cc55" stroke="#b7821a" stroke-width="3"/><circle cx="${b - 3}" cy="35" r="3.2" fill="#fff" opacity=".7"/>`;
  };
  const valance = `<rect x="-4" y="0" width="470" height="36" fill="#5d1c80"/><rect x="-4" y="30" width="470" height="8" fill="#f6cc55"/>${swag(-4, 154)}${swag(154, 306)}${swag(306, 458)}`;
  const side = `${curtain}${valance}`;

  // --- the round bunting garland between the two swags
  const P0 = [458, 38], P1 = [800, 170], P2 = [1142, 38];
  const bez = (t: number): [number, number] => [(1 - t) * (1 - t) * P0[0]! + 2 * (1 - t) * t * P1[0]! + t * t * P2[0]!, (1 - t) * (1 - t) * P0[1]! + 2 * (1 - t) * t * P1[1]! + t * t * P2[1]!];
  const flagCols = ['#f6cc55', '#ff7aa8', '#4fc3c8', '#fff1d0', '#a77be0'];
  const flags: string[] = [];
  const bulbs: string[] = [];
  const N = 15;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = bez(t);
    const dx = 2 * (1 - t) * (P1[0]! - P0[0]!) + 2 * t * (P2[0]! - P1[0]!);
    const dy = 2 * (1 - t) * (P1[1]! - P0[1]!) + 2 * t * (P2[1]! - P1[1]!);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (i % 1 === 0 && i > 0 && i < N) {
      const c = flagCols[i % flagCols.length]!;
      flags.push(`<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})"><path d="M-17 0 H17 A17 17 0 0 1 -17 0Z" transform="translate(0 0)" fill="${c}"/><path d="M-17 0 H17 A17 17 0 0 1 -17 0Z" fill="${c}"/><path d="M-12 3 Q0 20 12 3" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".55"/></g>`);
      if (i % 2 === 0) bulbs.push(`<circle class="tw tw${i % 3}" cx="${f1(x + (i % 4 === 0 ? -9 : 9))}" cy="${f1(y + 3)}" r="4.5" fill="#fff3a8"/>`);
    }
  }
  const garland = `<path d="M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}" fill="none" stroke="#b7821a" stroke-width="5" stroke-linecap="round"/>${flags.join('')}`;

  // --- spotlights: the lamp cans on a rail, soft cones and pools of light on the floor
  const lamp = (x: number, aim: number): string => {
    const rot = aim > 0 ? -16 : 16;
    return `<g transform="translate(${x} 22)"><path d="M-2 -22 V0" stroke="#3a1b55" stroke-width="5"/><g transform="rotate(${rot})"><path d="M-17 -4 H17 L26 30 H-26Z" fill="#4a2468"/><path d="M-17 -4 H17 L19 4 H-19Z" fill="#6a3a8e"/><ellipse cx="0" cy="31" rx="26" ry="7" fill="#ffe9a0"/><ellipse cx="0" cy="31" rx="17" ry="4.2" fill="#fffbe8"/><path d="M-26 30 H26" stroke="#2f1646" stroke-width="3"/></g></g>`;
  };
  const cone = (x: number, tx: number, op: number, w = 190): string => `<path d="M${x - 20} 56 L${x + 20} 56 L${tx + w} 780 L${tx - w} 780Z" fill="url(#music-cone)" opacity="${op}"/>`;
  const pool = (cx: number, op: number): string => `<ellipse cx="${cx}" cy="782" rx="200" ry="34" fill="url(#music-pool)" opacity="${op}"/>`;

  // --- the polished wooden floor
  const planks = Array.from({ length: 21 }, (_, i) => { const d = (i - 10) * 90; return `M${800 + d} 640 L${f1(800 + d * 1.765)} 900`; }).join(' ');
  const seams = [668, 702, 744, 796, 856].map((y) => `<path d="M0 ${y} Q800 ${y - 8} 1600 ${y}" fill="none" stroke="#a8702c" stroke-width="2" opacity=".28"/>`).join('');

  // --- tiny audience heads, far away at the very bottom edge
  const crowd = [[44, 26], [118, 22], [196, 25], [262, 21], [1342, 22], [1404, 26], [1478, 22], [1552, 25]]
    .map(([x, r]) => `<g fill="#4c2a6e" opacity=".62"><circle cx="${x}" cy="${895}" r="${r}"/><ellipse cx="${x}" cy="${925}" rx="${r! * 1.9}" ry="${r! * 1.3}"/></g>`).join('');

  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="music-sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb2ec"/><stop offset=".6" stop-color="#f1dcf2"/><stop offset="1" stop-color="#fff0d2"/></linearGradient>
    <linearGradient id="music-sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1042"/><stop offset=".6" stop-color="#3a2572"/><stop offset="1" stop-color="#5b3a8e"/></linearGradient>
    <linearGradient id="music-velvet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a2aa0"/><stop offset=".55" stop-color="#9a45c2"/><stop offset="1" stop-color="#7a2aa0"/></linearGradient>
    <linearGradient id="music-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4c885"/><stop offset=".5" stop-color="#e5ab63"/><stop offset="1" stop-color="#cf8f4a"/></linearGradient>
    <linearGradient id="music-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c4" stop-opacity=".95"/><stop offset="1" stop-color="#fff6c4" stop-opacity=".1"/></linearGradient>
    <radialGradient id="music-pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe0" stop-opacity=".95"/><stop offset=".6" stop-color="#fff0b0" stop-opacity=".55"/><stop offset="1" stop-color="#fff0b0" stop-opacity="0"/></radialGradient>
    <radialGradient id="music-halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3a8" stop-opacity=".9"/><stop offset="1" stop-color="#fff3a8" stop-opacity="0"/></radialGradient>
  </defs>
  <style>#scene-bg .scenery-glow, .wt-scene .scenery-glow { opacity: 0; transition: opacity 1.2s; } body.night #scene-bg .scenery-glow, .night #scene-bg .scenery-glow { opacity: 1; }</style>
  <rect class="sky-day" width="1600" height="900" fill="url(#music-sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#music-sky-n)"/>
  <g class="sun"><g transform="translate(1160 214)"><g class="rays">${rays}</g></g><circle cx="1160" cy="214" r="50" fill="#ffd45a"/><circle cx="1160" cy="214" r="38" fill="#ffe58f"/></g>
  <g class="moon"><circle cx="1160" cy="214" r="48" fill="#fff6d2"/><circle cx="1142" cy="200" r="8" fill="#efe3b4"/><circle cx="1178" cy="230" r="6" fill="#efe3b4"/><circle cx="1176" cy="196" r="4.5" fill="#efe3b4"/></g>
  <g class="stars" fill="#fff4b8">${stars}</g>
  <g class="cloud c1" opacity=".85">${notePair(40, 262, 1.1, '#f6b93b')}${star(150, 232, 15, '#ff8fb6')}${note(240, 290, 1, '#fff')}${star(320, 256, 9, '#fff')}</g>
  <g class="cloud c2" opacity=".8">${noteQ(40, 170, 1, '#ff8fb6')}${star(120, 132, 12, '#f6cc55')}${notePair(210, 186, 0.9, '#fff')}${star(300, 150, 8, '#4fc3c8')}</g>
  <g class="cloud c3" opacity=".75">${note(40, 470, 1.15, '#4fc3c8')}${star(130, 430, 11, '#fff')}${noteQ(214, 480, 1, '#f6cc55')}${star(280, 440, 14, '#ff8fb6')}${note(350, 486, 0.8, '#fff')}</g>
  <g class="scenery">
    ${sky}
    <rect x="0" y="618" width="1600" height="30" fill="#b184d4" opacity=".4"/>
    ${cone(520, 400, 0.2)}${cone(1080, 1200, 0.2)}
    <g>${side}</g>
    <g transform="translate(1600 0) scale(-1 1)">${side}</g>
    ${garland}
    ${lamp(520, -1)}${lamp(1080, 1)}
    <path d="M0 640 Q800 624 1600 640 V900 H0Z" fill="url(#music-floor)"/>
    <path d="${planks}" fill="none" stroke="#a8702c" stroke-width="2" opacity=".26"/>${seams}
    <path d="M0 640 Q800 624 1600 640" fill="none" stroke="#fff5d6" stroke-width="5" opacity=".7"/>
    ${pool(330, 0.55)}${pool(1270, 0.55)}
    <path d="M0 872 Q800 858 1600 872 V900 H0Z" fill="#a9692c" opacity=".55"/><path d="M0 872 Q800 858 1600 872" fill="none" stroke="#f6cc55" stroke-width="5" opacity=".8"/>
    ${crowd}
    ${star(60, 770, 12, '#f6cc55')}${star(1545, 755, 10, '#f6cc55')}${star(215, 820, 7, '#fff3c0')}${star(1390, 828, 8, '#fff3c0')}
  </g>
  <g class="scenery-glow">
    ${cone(520, 360, 0.3, 120)}${cone(1080, 1240, 0.3, 120)}${pool(330, 0.85)}${pool(1270, 0.85)}
    <circle cx="497" cy="53" r="46" fill="url(#music-halo)"/><circle cx="1103" cy="53" r="46" fill="url(#music-halo)"/>
    ${bulbs.join('')}
    ${sparkle4(112, 640, 12, '#fff3a8')}${sparkle4(1490, 650, 12, '#fff3a8')}
  </g>
</svg>`;
};

// ------------------------------------------------------------------ the home island: a small round stage with a mic stand, a drum riser and a spotlight
export const musicIslandSVG = (): string => {
  const sil = '#5a2a82';
  const folds = [60, 100, 140, 180, 220, 260, 300, 340].map((x, i) => `<path d="M${x} 130 Q${x + (i % 2 ? 5 : -5)} 150 ${x} 172" fill="none" stroke="${i % 2 ? '#c47ee8' : '#4a1768'}" stroke-width="9" opacity=".28" stroke-linecap="round"/>`).join('');
  const zig = Array.from({ length: 6 }, (_, i) => `${f1(279 + i * 8.4)},${i % 2 ? 98 : 84}`).join(' ');
  return `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="music-i-velvet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a2aa0"/><stop offset=".5" stop-color="#9a45c2"/><stop offset="1" stop-color="#7a2aa0"/></linearGradient>
    <linearGradient id="music-i-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7d595"/><stop offset="1" stop-color="#e8b068"/></linearGradient>
    <linearGradient id="music-i-cone" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff6c4" stop-opacity=".7"/><stop offset="1" stop-color="#fff6c4" stop-opacity=".05"/></linearGradient>
  </defs>
  <ellipse cx="200" cy="176" rx="192" ry="11" fill="#3a1b55" opacity=".25"/>
  <path d="M20 122 V148 Q20 174 200 174 Q380 174 380 148 V122Z" fill="url(#music-i-velvet)"/>${folds}
  <path d="M20 148 Q20 174 200 174 Q380 174 380 148" fill="none" stroke="#f6cc55" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="200" cy="122" rx="180" ry="40" fill="#f6cc55"/><ellipse cx="200" cy="121" rx="176" ry="37" fill="#b7821a" opacity=".5"/>
  <ellipse cx="200" cy="120" rx="174" ry="35" fill="url(#music-i-top)"/>
  <ellipse cx="200" cy="120" rx="140" ry="27" fill="none" stroke="#c98f48" stroke-width="2.4" opacity=".4"/><ellipse cx="200" cy="120" rx="96" ry="18" fill="none" stroke="#c98f48" stroke-width="2.4" opacity=".35"/>
  <path d="M60 128 Q200 160 340 128" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>
  <!-- spotlight on a boom: a soft cone onto the stage -->
  <path d="M356 40 L374 56 L206 122 L150 112Z" fill="url(#music-i-cone)"/>
  <path d="M372 120 V42" stroke="${sil}" stroke-width="5" stroke-linecap="round"/><ellipse cx="372" cy="121" rx="12" ry="4" fill="${sil}"/>
  <g transform="translate(362 40) rotate(36)"><path d="M-9 -8 H9 L14 12 H-14Z" fill="#4a2468"/><ellipse cx="0" cy="13" rx="14" ry="4.5" fill="#ffe9a0"/><ellipse cx="0" cy="13" rx="9" ry="2.6" fill="#fffbe8"/></g>
  <!-- drum riser with a little drum -->
  <ellipse cx="292" cy="100" rx="52" ry="12" fill="#6a2290"/><path d="M240 94 V100 Q240 112 292 112 Q344 112 344 100 V94Z" fill="#7a2aa0"/><ellipse cx="292" cy="94" rx="52" ry="12" fill="#f6cc55"/><ellipse cx="292" cy="93" rx="48" ry="10" fill="#e3b0f0"/>
  <path d="M240 100 Q240 112 292 112 Q344 112 344 100" fill="none" stroke="#f6cc55" stroke-width="3.5" opacity=".9"/>
  <path d="M276 98 V84 M308 98 V84" stroke="#fff" stroke-width="0"/>
  <rect x="268" y="72" width="48" height="26" rx="5" fill="#ff2a3d"/><polyline points="${zig}" fill="none" stroke="#fff3dc" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" transform="translate(-1.6 -2)"/>
  <ellipse cx="292" cy="98" rx="24" ry="6" fill="#c4001f"/><rect x="268" y="72" width="48" height="26" rx="5" fill="none"/><ellipse cx="292" cy="72" rx="24" ry="7" fill="#e6ecf4"/><ellipse cx="292" cy="72" rx="20" ry="5.2" fill="#fff3dc"/>
  <path d="M270 62 L280 70 M314 60 L304 69" stroke="#b9792f" stroke-width="3" stroke-linecap="round"/><circle cx="268" cy="60" r="3.6" fill="#fff0cf" stroke="#b9792f" stroke-width="1.6"/><circle cx="316" cy="58" r="3.6" fill="#fff0cf" stroke="#b9792f" stroke-width="1.6"/>
  <!-- the mic stand silhouette -->
  <g fill="none" stroke="${sil}" stroke-linecap="round"><path d="M64 112 L50 120 M64 112 L78 120 M64 112 V116" stroke-width="4"/><path d="M64 112 V52 Q64 40 78 40" stroke-width="5"/></g>
  <ellipse cx="64" cy="116" rx="15" ry="4.6" fill="${sil}"/><g transform="translate(82 41) rotate(-70)"><rect x="-6" y="-10" width="12" height="18" rx="6" fill="${sil}"/><rect x="-7" y="-1" width="14" height="3" fill="#f6cc55"/></g>
  <!-- floating notes and stars -->
  ${note(150, 52, 0.62, '#f6b93b')}${star(206, 30, 7, '#ff8fb6')}${notePair(232, 54, 0.5, '#ffffff')}${star(130, 22, 5, '#fff')}${sparkle4(250, 22, 5, '#fff3a8')}
</svg>`;
};
