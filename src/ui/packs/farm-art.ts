import { mixHex } from '../art';

// Farm Friends: arrival baskets, the sunny-farm backdrop and the home island. Calm, flat, light tints (see PACK_BRIEF).

const f1 = (n: number): string => n.toFixed(1);

// ------------------------------------------------------------------ the arrival: a woven straw nest with a spotted egg
export const farmEggSVG = (id: string, main: string, dark: string, accent: string): string => {
  const light = mixHex(main, '#ffffff', 0.5);
  const outline = mixHex(dark, '#000000', 0.12);
  const straw = '#e9bb62', strawDark = '#bd8a35', strawLight = '#f7d98f';
  const spots: [number, number, number][] = [[46, 44, 7], [78, 36, 5], [66, 66, 8.5], [40, 80, 6], [84, 78, 6.5], [58, 24, 3.6]];
  const weave: string[] = [];
  for (let k = 0; k < 4; k++) {
    const y = 104 + k * 11;
    weave.push(`<path d="M6 ${y} Q60 ${y + 26} 114 ${y}" fill="none" stroke="${strawDark}" stroke-width="2.6" stroke-linecap="round"/>`);
    for (let x = 14 + (k % 2) * 8; x < 112; x += 16) {
      const t = (x - 6) / 108;
      const yy = y + 26 * 2 * t * (1 - t);
      weave.push(`<path d="M${x} ${f1(yy)} l0 ${k === 3 ? 8 : 11}" stroke="${strawDark}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`);
    }
  }
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="farm-egg-${id}-g" cx="34%" cy="26%" r="85%"><stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${main}"/><stop offset="1" stop-color="${dark}"/></radialGradient>
    <clipPath id="farm-egg-${id}-bowl"><path d="M8 100 A52 13 0 0 0 112 100 L106 124 Q98 146 60 146 Q22 146 14 124Z"/></clipPath>
  </defs>
  <ellipse cx="60" cy="144" rx="50" ry="6" fill="#0000002b"/>
  <ellipse cx="60" cy="100" rx="53" ry="14" fill="${strawDark}"/>
  <path d="M60 8 C88 8 97 54 97 72 C97 96 81 112 60 112 C39 112 23 96 23 72 C23 54 32 8 60 8Z" fill="url(#farm-egg-${id}-g)" stroke="${outline}" stroke-width="2.4" stroke-opacity=".55"/>
  ${spots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${accent}" opacity=".92"/>`).join('')}
  <ellipse cx="42" cy="34" rx="8" ry="15" fill="#fff" opacity=".6" transform="rotate(22 42 34)"/><ellipse cx="36" cy="52" rx="3" ry="5" fill="#fff" opacity=".7"/>
  <path d="M8 100 A52 13 0 0 0 112 100 L106 124 Q98 146 60 146 Q22 146 14 124Z" fill="${straw}"/>
  <g clip-path="url(#farm-egg-${id}-bowl)">${weave.join('')}<path d="M10 128 Q60 150 110 128 L110 150 L10 150Z" fill="${strawDark}" opacity=".25"/></g>
  <path d="M8 100 A52 13 0 0 0 112 100" fill="none" stroke="${strawLight}" stroke-width="7" stroke-linecap="round"/>
  <path d="M8 100 A52 13 0 0 0 112 100" fill="none" stroke="${strawDark}" stroke-width="1.8" stroke-linecap="round" opacity=".7" transform="translate(0 4)"/>
  <path d="M4 98 q-4 -9 2 -14 M10 96 q-3 -8 3 -12 M116 98 q4 -9 -2 -14 M110 96 q3 -8 -3 -12" stroke="${straw}" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
};

// ------------------------------------------------------------------ small building blocks (local coordinates, base at y = 0)
const barn = (tx: number, ty: number, s: number): { art: string; glow: string } => {
  const red = '#e5594d', redD = '#b23b35', trim = '#fff7ec';
  const art = `<g transform="translate(${tx} ${ty}) scale(${s})">
    <ellipse cx="0" cy="3" rx="86" ry="7" fill="#00000018"/>
    <path d="M-68 0 V-52 L-58 -78 Q0 -112 58 -78 L68 -52 V0Z" fill="${red}"/>
    <path d="M-50 0 V-50 M-34 0 V-50 M34 0 V-50 M50 0 V-50" stroke="${redD}" stroke-width="2" opacity=".28"/>
    <rect x="-68" y="-6" width="136" height="6" fill="${redD}" opacity=".3"/>
    <rect x="-27" y="-56" width="54" height="56" rx="3" fill="${trim}"/>
    <rect x="-22" y="-51" width="44" height="51" rx="2" fill="#d84c43"/>
    <path d="M-22 -51 L22 0 M22 -51 L-22 0" stroke="${trim}" stroke-width="5" stroke-linecap="round"/>
    <rect x="-22" y="-51" width="44" height="51" rx="2" fill="none" stroke="${trim}" stroke-width="2.5"/>
    <rect x="-13" y="-89" width="26" height="21" rx="3" fill="${trim}"/><rect x="-9" y="-85" width="18" height="13" rx="2" fill="#7f93b5"/><path d="M0 -85 v13 M-9 -78.5 h18" stroke="${trim}" stroke-width="1.6"/>
    ${[-47, 47].map((x) => `<rect x="${x - 8}" y="-44" width="16" height="15" rx="2.5" fill="${trim}"/><rect x="${x - 5.5}" y="-41.5" width="11" height="10" rx="1.5" fill="#7f93b5"/>`).join('')}
    <path d="M-74 -48 L-61 -82 Q0 -118 61 -82 L74 -48" fill="none" stroke="${redD}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-66 -52 L-55 -80 Q0 -108 55 -80 L66 -52" fill="none" stroke="#ffffff55" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
  const win = (x: number, y: number, w: number, h: number) => {
    const cx = tx + (x + w / 2) * s, cy = ty + (y + h / 2) * s;
    return `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(w * s * 1.25)}" fill="#ffd36b" opacity=".2"/><rect x="${f1(tx + x * s)}" y="${f1(ty + y * s)}" width="${f1(w * s)}" height="${f1(h * s)}" rx="${f1(2 * s)}" fill="#ffd76e"/>`;
  };
  return { art, glow: win(-9, -85, 18, 13) + win(-52.5, -41.5, 11, 10) + win(41.5, -41.5, 11, 10) };
};

const silo = (tx: number, ty: number, s: number): string => `<g transform="translate(${tx} ${ty}) scale(${s})">
  <ellipse cx="0" cy="3" rx="30" ry="5" fill="#00000018"/>
  <rect x="-21" y="-118" width="42" height="118" rx="3" fill="#e9eef4"/><rect x="5" y="-118" width="16" height="118" rx="3" fill="#d3dbe6"/>
  <path d="M-21 -30 H21 M-21 -60 H21 M-21 -90 H21" stroke="#bcc7d6" stroke-width="3"/>
  <path d="M-24 -116 Q0 -158 24 -116Z" fill="#b6c2d3"/><path d="M-24 -116 Q-8 -146 6 -148 Q-12 -134 -14 -116Z" fill="#ffffff66"/>
  <rect x="-5" y="-26" width="10" height="26" rx="5" fill="#9aa8bd" opacity=".6"/>
</g>`;

const house = (tx: number, ty: number, s: number): { art: string; glow: string } => {
  const art = `<g transform="translate(${tx} ${ty}) scale(${s})">
    <ellipse cx="0" cy="2" rx="46" ry="5" fill="#00000016"/>
    <rect x="12" y="-72" width="10" height="26" rx="2" fill="#d9ccbb"/>
    <rect x="-36" y="-38" width="72" height="38" rx="3" fill="#fff6e6"/>
    <path d="M-46 -34 L0 -70 L46 -34Z" fill="#d2604a" stroke="#d2604a" stroke-width="5" stroke-linejoin="round"/>
    <rect x="-8" y="-24" width="16" height="24" rx="3" fill="#a96f43"/>
    ${[-25, 11].map((x) => `<rect x="${x}" y="-30" width="15" height="15" rx="2" fill="#fff"/><rect x="${x + 2}" y="-28" width="11" height="11" rx="1.5" fill="#8ea4c6"/>`).join('')}
  </g>`;
  const win = (x: number) => `<circle cx="${f1(tx + (x + 7.5) * s)}" cy="${f1(ty - 22.5 * s)}" r="${f1(12 * s)}" fill="#ffd36b" opacity=".2"/><rect x="${f1(tx + (x + 2) * s)}" y="${f1(ty - 28 * s)}" width="${f1(11 * s)}" height="${f1(11 * s)}" rx="${f1(1.5 * s)}" fill="#ffd76e"/>`;
  return { art, glow: win(-25) + win(11) };
};

const windmill = (tx: number, ty: number, s: number): string => `<g transform="translate(${tx} ${ty}) scale(${s})">
  <ellipse cx="0" cy="3" rx="34" ry="5" fill="#00000016"/>
  <path d="M-24 0 L-14 -128 L14 -128 L24 0Z" fill="#f6f0e2"/><path d="M8 -128 L14 -128 L24 0 L10 0Z" fill="#e4dac4"/>
  <path d="M-19 -128 Q0 -158 19 -128Z" fill="#c1634a"/>
  <path d="M-8 0 V-20 Q0 -30 8 -20 V0Z" fill="#a96f43"/><rect x="-5" y="-78" width="10" height="14" rx="5" fill="#8ea4c6"/>
  <g class="farm-blades" style="transform-origin:0px -126px">
    <g transform="translate(0 -126)">${[15, 105, 195, 285].map((a) => `<g transform="rotate(${a})"><rect x="-2.5" y="-70" width="5" height="70" fill="#b3855a"/><rect x="2.5" y="-68" width="17" height="38" rx="2" fill="#fbf6ea" stroke="#b3855a" stroke-width="2"/><path d="M11 -68 V-30 M2.5 -49 H19.5" stroke="#b3855a" stroke-width="1.4"/></g>`).join('')}<circle r="6" fill="#b3855a"/></g>
  </g>
</g>`;

const tree = (tx: number, ty: number, s: number, g1 = '#86c873', g2 = '#a2d98a'): string => `<g transform="translate(${tx} ${ty}) scale(${s})">
  <ellipse cx="0" cy="2" rx="40" ry="6" fill="#00000018"/>
  <path d="M-8 0 Q-6 -40 -4 -64 H6 Q8 -40 10 0Z" fill="#a8764a"/><path d="M0 -40 L-16 -58 M2 -48 L18 -66" stroke="#a8764a" stroke-width="5" stroke-linecap="round"/>
  <circle cx="-30" cy="-84" r="30" fill="${g1}"/><circle cx="32" cy="-82" r="31" fill="${g1}"/><circle cx="0" cy="-106" r="38" fill="${g1}"/><circle cx="0" cy="-74" r="36" fill="${g1}"/>
  <circle cx="-12" cy="-116" r="16" fill="${g2}"/><circle cx="-34" cy="-90" r="10" fill="${g2}"/><circle cx="20" cy="-98" r="9" fill="${g2}" opacity=".8"/>
  <circle cx="-20" cy="-70" r="4.6" fill="#ff9aa8"/><circle cx="18" cy="-62" r="4.6" fill="#ff9aa8"/><circle cx="34" cy="-92" r="4.2" fill="#ff9aa8"/><circle cx="-40" cy="-100" r="4" fill="#ff9aa8"/>
</g>`;

/** a wooden fence from x0 to x1 whose posts stand on y */
const fence = (x0: number, x1: number, y: number, step = 46): string => {
  const wood = '#f1d7a6', edge = '#cfa86c';
  let s = `<rect x="${x0}" y="${y - 34}" width="${x1 - x0}" height="8" rx="4" fill="${wood}" stroke="${edge}" stroke-width="2"/><rect x="${x0}" y="${y - 16}" width="${x1 - x0}" height="8" rx="4" fill="${wood}" stroke="${edge}" stroke-width="2"/>`;
  for (let x = x0 + 8; x <= x1 - 4; x += step) s += `<rect x="${x - 6}" y="${y - 44}" width="12" height="46" rx="5" fill="${wood}" stroke="${edge}" stroke-width="2"/><path d="M${x - 2} ${y - 40} v36" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>`;
  return `<g>${s}</g>`;
};

const flowers = (pts: [number, number][], petal = '#fff', mid = '#ffd23f'): string =>
  pts.map(([x, y], i) => {
    const p = i % 3 === 1 ? '#ffb3c7' : i % 3 === 2 ? '#ffe27a' : petal;
    return `<g transform="translate(${x} ${y})"><path d="M0 0 v10" stroke="#5fae5a" stroke-width="2" stroke-linecap="round"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${f1(4.2 * Math.cos((a * Math.PI) / 180))}" cy="${f1(4.2 * Math.sin((a * Math.PI) / 180))}" r="3.1" fill="${p}"/>`).join('')}<circle r="2.4" fill="${mid}"/></g>`;
  }).join('');

const sheep = (x: number, y: number, s: number): string => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="-8" rx="12" ry="8" fill="#fffbf0"/><circle cx="-6" cy="-12" r="6" fill="#fffbf0"/><circle cx="5" cy="-13" r="5.5" fill="#fffbf0"/><circle cx="-13" cy="-9" r="4" fill="#6f5a4b"/><rect x="-6" y="-3" width="2.6" height="6" rx="1.3" fill="#6f5a4b"/><rect x="4" y="-3" width="2.6" height="6" rx="1.3" fill="#6f5a4b"/></g>`;
const cow = (x: number, y: number, s: number): string => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-13" y="-17" width="24" height="13" rx="6" fill="#fffbf0"/><ellipse cx="-1" cy="-13" rx="5" ry="3.5" fill="#6f5a4b"/><rect x="9" y="-20" width="9" height="9" rx="4" fill="#fffbf0"/><rect x="14" y="-14" width="5" height="4" rx="2" fill="#f2b3b8"/><rect x="-10" y="-5" width="3" height="8" rx="1.5" fill="#6f5a4b"/><rect x="5" y="-5" width="3" height="8" rx="1.5" fill="#6f5a4b"/></g>`;

const duck = (x: number, y: number, s: number, flip = false): string => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><ellipse cx="0" cy="0" rx="14" ry="9" fill="#ffe36a"/><circle cx="10" cy="-9" r="7" fill="#ffe36a"/><path d="M15 -9 l8 2.5 l-8 3z" fill="#ff9a2a"/><circle cx="12" cy="-11" r="1.5" fill="#4a3a2a"/><path d="M-12 -2 q-6 -4 -4 -9 q6 2 9 6z" fill="#f3c93e"/></g>`;

// ------------------------------------------------------------------ the backdrop
export const farmSceneSVG = (): string => {
  const band = (y: number, a: number, b: number, fill: string, furrow?: string): string =>
    `<path d="M0 ${y + a} C420 ${y - b} 1060 ${y + b} 1600 ${y - a} V900 H0Z" fill="${fill}"/>` +
    (furrow ? [10, 20].map((d) => `<path d="M0 ${y + a + d} C420 ${y - b + d} 1060 ${y + b + d} 1600 ${y - a + d}" fill="none" stroke="${furrow}" stroke-width="3" opacity=".55"/>`).join('') : '');
  const b1 = barn(176, 604, 1.12);
  const h1 = house(1396, 574, 1.05);
  const rays = Array.from({ length: 12 }, (_, i) => `<rect x="-5" y="-108" width="10" height="32" rx="5" fill="#ffe27a" transform="rotate(${i * 30})"/>`).join('');
  const stars = [[140, 80, 4], [420, 160, 3], [700, 70, 4], [980, 140, 3], [1180, 56, 3], [260, 250, 3], [840, 230, 4], [560, 310, 3], [1450, 300, 3], [60, 320, 3], [1020, 40, 3], [330, 50, 3]]
    .map(([x, y, r], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`).join('');
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="farm-sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8dcff"/><stop offset="0.62" stop-color="#e3f5ff"/><stop offset="1" stop-color="#fff6d6"/></linearGradient>
    <linearGradient id="farm-sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2a5a"/><stop offset="1" stop-color="#4b5fa3"/></linearGradient>
  </defs>
  <style>.wt-scene .sky-night, .wt-scene .moon, .wt-scene .stars { opacity: 0; } #scene-bg .scenery-glow, .wt-scene .scenery-glow { opacity: 0; transition: opacity 1.2s; } body.night #scene-bg .scenery-glow, .night #scene-bg .scenery-glow { opacity: 1; } .farm-blades { animation: farm-spin 48s linear infinite; } @keyframes farm-spin { to { transform: rotate(360deg); } } @media (prefers-reduced-motion: reduce) { .farm-blades { animation: none; } }</style>
  <rect class="sky-day" width="1600" height="900" fill="url(#farm-sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#farm-sky-n)"/>
  <g class="sun"><g transform="translate(1290 150)"><g class="rays">${rays}</g></g><circle cx="1290" cy="150" r="56" fill="#ffd95a"/></g>
  <g class="moon"><circle cx="1290" cy="150" r="50" fill="#fff6c9"/><circle cx="1272" cy="136" r="9" fill="#efe5b0"/><circle cx="1308" cy="166" r="6" fill="#efe5b0"/><circle cx="1300" cy="128" r="5" fill="#efe5b0"/></g>
  <g class="stars" fill="#fff">${stars}</g>
  <g class="cloud c1" fill="#fff" opacity=".92"><ellipse cx="300" cy="170" rx="92" ry="28"/><ellipse cx="350" cy="148" rx="52" ry="32"/><ellipse cx="262" cy="152" rx="46" ry="26"/><ellipse cx="318" cy="182" rx="80" ry="16"/></g>
  <g class="cloud c2" fill="#fff" opacity=".85"><ellipse cx="880" cy="104" rx="84" ry="24"/><ellipse cx="930" cy="86" rx="48" ry="28"/><ellipse cx="842" cy="92" rx="42" ry="22"/></g>
  <g class="cloud c3" fill="#fff" opacity=".75"><ellipse cx="1130" cy="290" rx="72" ry="22"/><ellipse cx="1172" cy="272" rx="42" ry="24"/><ellipse cx="1100" cy="278" rx="32" ry="16"/></g>
  <g class="scenery">
    <path d="M0 548 Q180 498 380 534 T760 528 T1160 536 T1600 506 V900 H0Z" fill="#cfe7c6"/>
    ${windmill(1530, 552, 0.8)}
    ${h1.art}
    ${sheep(330, 556, 1.1)}${sheep(366, 560, 0.95)}${cow(1240, 556, 1.1)}${sheep(1286, 560, 0.95)}${sheep(560, 540, 0.9)}
    ${band(566, 8, 22, '#dfe9ac')}
    ${band(592, -6, 26, '#f0de93', '#dcc874')}
    ${band(626, 10, 30, '#bfe0a2')}
    ${band(660, -10, 32, '#efd685', '#d9bf68')}
    ${band(700, 12, 36, '#a9da91')}
    ${band(742, -8, 30, '#f1de95', '#dcc874')}
    ${cow(112, 668, 1.3)}${sheep(1090, 676, 1.2)}${sheep(1128, 681, 1.05)}
    ${silo(62, 606, 1.15)}
    ${b1.art}
    <path d="M0 790 Q300 748 640 786 T1300 782 T1600 758 V900 H0Z" fill="#90d27f"/>
    <path d="M0 842 Q420 818 900 846 T1600 826 V900 H0Z" fill="#82c874"/>
    ${tree(1470, 764, 1.05)}
    ${fence(1290, 1640, 790)}
    ${fence(-20, 330, 796)}
    <g transform="translate(230 856)"><ellipse cx="0" cy="0" rx="124" ry="26" fill="#c8e0a0"/><ellipse cx="0" cy="2" rx="112" ry="21" fill="#9bd4ec"/><ellipse cx="-22" cy="-4" rx="78" ry="12" fill="#b4e1f3"/>
      <path d="M-64 6 q10 -5 20 0 M30 10 q10 -5 22 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      <ellipse cx="72" cy="2" rx="14" ry="6" fill="#7fc470"/><path d="M72 2 L80 -2" stroke="#9bd4ec" stroke-width="3"/>${duck(-34, -2, 1.1)}${duck(6, 8, 0.8, true)}
      <path d="M-110 -6 v-26 M-104 -4 v-34 M-98 -4 v-22" stroke="#5fae5a" stroke-width="3" stroke-linecap="round"/><ellipse cx="-104" cy="-38" rx="3.4" ry="7" fill="#9c6b3a"/></g>
    ${flowers([[430, 826], [462, 838], [498, 822], [1130, 832], [1170, 844], [1210, 828], [60, 820], [20, 844], [330, 834], [1560, 850], [1330, 852], [90, 880]])}
    <g transform="translate(1428 826)"><ellipse cx="0" cy="3" rx="60" ry="9" fill="#00000014"/><path d="M-50 0 Q-48 -34 0 -38 Q48 -34 50 0Z" fill="#efce62"/><path d="M-36 -8 Q0 -18 36 -8 M-28 -20 Q0 -28 28 -20" stroke="#d6b04a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-10 -38 Q0 -52 10 -38" fill="#f7dd86"/></g>
  </g>
  <g class="scenery-glow">${b1.glow}${h1.glow}<rect x="1527" y="${552 - 78 * 0.8}" width="8" height="11" rx="4" fill="#ffd76e"/></g>
</svg>`;
};

// ------------------------------------------------------------------ the home island: a little hill with a barn, a fence and a haystack
export const farmIslandSVG = (): string => {
  const b = barn(96, 104, 0.62);
  return `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="200" cy="176" rx="192" ry="12" fill="#2f6f3a" opacity=".22"/>
  <path d="M14 126 Q14 172 200 176 Q386 172 386 126Z" fill="#b98a55"/>
  <path d="M26 142 Q60 166 200 168 Q340 166 374 142 Q340 172 200 174 Q60 172 26 142Z" fill="#9c7040" opacity=".6"/>
  <path d="M10 128 Q22 88 120 80 L280 80 Q378 88 390 128 Q390 152 200 152 Q10 152 10 128Z" fill="#7fcf74"/>
  <path d="M34 112 Q70 86 140 84 L260 84 Q330 86 366 112 Q300 98 200 98 Q100 98 34 112Z" fill="#9adf8c"/>
  ${b.art}
  ${fence(176, 296, 108, 34)}
  <g transform="translate(336 112)"><ellipse cx="0" cy="3" rx="34" ry="6" fill="#00000018"/><path d="M-30 0 Q-28 -34 0 -38 Q28 -34 30 0Z" fill="#efce62"/><path d="M-20 -8 Q0 -16 20 -8 M-14 -20 Q0 -26 14 -20" stroke="#d6b04a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-6 -38 Q0 -50 6 -38" fill="#f7dd86"/></g>
  ${flowers([[40, 134], [64, 142], [352, 140], [372, 132], [30, 124]])}
</svg>`;
};
