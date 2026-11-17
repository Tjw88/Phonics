import { mixHex } from '../art';

/** Arctic Friends: the ice-egg arrival, the backdrop and the island. Soft, flat, low-contrast; saturated colour belongs to the creatures. */

const f = (n: number): string => n.toFixed(1);

// ---------------------------------------------------------------- arrival: a glossy ice-blue egg-shaped ice block with a crystal inside
const ICE: Record<string, [string, string, string]> = {
  bear: ['#f0faff', '#a8dcf8', '#4f9fd9'],
  penguin: ['#e6efff', '#8fb0f2', '#3f62c8'],
  fox: ['#fff3e4', '#ffcc99', '#f08a3c'],
  seal: ['#f3eeff', '#c9bcf5', '#8274d6'],
};
/** The creature's frozen silhouette inside the ice (head, ears, flippers, whiskers), so each egg is told apart by shape as well as colour. */
const frozen = (kind: string, col: string): string => {
  const head = `<circle cx="60" cy="86" r="30" fill="${col}" opacity=".5"/>`;
  switch (kind) {
    case 'bear': return `<circle cx="36" cy="60" r="11" fill="${col}" opacity=".5"/><circle cx="84" cy="60" r="11" fill="${col}" opacity=".5"/>${head}`;
    case 'penguin': return `<ellipse cx="28" cy="100" rx="8" ry="22" transform="rotate(18 28 100)" fill="${col}" opacity=".5"/><ellipse cx="92" cy="100" rx="8" ry="22" transform="rotate(-18 92 100)" fill="${col}" opacity=".5"/>${head}<path d="M52 52 Q60 40 68 52Z" fill="#ff9f1c" opacity=".9"/>`;
    case 'fox': return `<path d="M32 74 L28 38 L58 60Z M88 74 L92 38 L62 60Z" fill="${col}" opacity=".55" stroke="${col}" stroke-width="4" stroke-linejoin="round"/>${head}`;
    default: return `${head}<g stroke="${col}" stroke-width="3" stroke-linecap="round" opacity=".6" fill="none"><path d="M24 90 L8 84 M24 98 L8 98 M96 90 L112 84 M96 98 L112 98"/></g>`;
  }
};
export const iceEgg = (id: string, crystal: string, kind = 'bear'): string => {
  const [ice1, ice2, ice3] = ICE[kind] ?? (ICE.bear as [string, string, string]);
  const gemLeft = mixHex(crystal, '#0f2742', 0.28);
  const gemRight = crystal;
  const gemTop = mixHex(crystal, '#ffffff', 0.5);
  const gemEdge = mixHex(crystal, '#0f2742', 0.5);
  const gid = `arctic-egg-${id}`;
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs><radialGradient id="${gid}" cx="34%" cy="26%" r="88%"><stop offset="0" stop-color="${ice1}"/><stop offset="0.5" stop-color="${ice2}"/><stop offset="1" stop-color="${ice3}"/></radialGradient></defs>
  <ellipse cx="60" cy="143" rx="46" ry="6.5" fill="#0000002b"/>
  <path d="M60 6 C100 6 112 78 112 98 C112 128 90 142 60 142 C30 142 8 128 8 98 C8 78 20 6 60 6Z" fill="url(#${gid})"/>
  <path d="M60 17 C91 17 102 78 102 98 C102 121 84 132 60 132 C36 132 18 121 18 98 C18 78 29 17 60 17Z" fill="#ffffff" opacity=".2"/>
  ${frozen(kind, mixHex(crystal, '#10253f', kind === 'bear' ? 0.3 : 0.35))}
  <path d="M60 52 L82 72 L76 104 L60 118 L44 104 L38 72Z" fill="${gemRight}" stroke="${gemEdge}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M60 52 L38 72 L44 104 L60 118Z" fill="${gemLeft}"/>
  <path d="M60 52 L82 72 L60 80 L38 72Z" fill="${gemTop}"/>
  <path d="M60 80 V118 M38 72 L60 80 L82 72" stroke="${gemEdge}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".55"/>
  <path d="M24 78 L34 70 M96 88 L86 80" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".6"/>
  <ellipse cx="38" cy="36" rx="11" ry="19" fill="#ffffff" opacity=".7" transform="rotate(24 38 36)"/><ellipse cx="30" cy="55" rx="3.4" ry="5.2" fill="#ffffff" opacity=".8"/>
  <path d="M92 26 l2.6 7 l7 2.6 l-7 2.6 l-2.6 7 l-2.6 -7 l-7 -2.6 l7 -2.6z" fill="#ffffff"/>
  <path d="M10 130 Q16 120 28 126 Q38 116 52 124 Q64 116 78 124 Q92 116 102 126 Q112 122 112 132 Q108 147 60 148 Q12 147 10 130Z" fill="#ffffff" stroke="#c4def2" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M26 136 q10 5 20 0 M70 138 q10 5 20 0" stroke="#dcecf8" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`;
};

// ---------------------------------------------------------------- small drawing helpers
/** A pointed ice peak with a rounded tip, a shaded side and a snow cap. */
const peak = (cx: number, by: number, w: number, h: number, base: string, shade: string, cap = '#fbfdff'): string => {
  const top = by - h, hw = w / 2, capH = 0.34, y = top + h * capH, dx = hw * capH;
  return `<g stroke-linejoin="round" stroke-linecap="round">
    <path d="M${f(cx - hw)} ${by} L${f(cx)} ${top} L${f(cx + hw)} ${by}Z" fill="${base}" stroke="${base}" stroke-width="10"/>
    <path d="M${f(cx)} ${top} L${f(cx + hw)} ${by} L${f(cx + hw * 0.08)} ${by}Z" fill="${shade}" opacity=".6"/>
    <path d="M${f(cx)} ${top} L${f(cx + dx)} ${f(y)} L${f(cx + dx * 0.55)} ${f(y + h * 0.075)} L${f(cx + dx * 0.1)} ${f(y + h * 0.02)} L${f(cx - dx * 0.35)} ${f(y + h * 0.08)} L${f(cx - dx)} ${f(y)}Z" fill="${cap}" stroke="${cap}" stroke-width="6"/>
  </g>`;
};

/** A little snowy pine (origin at the foot of the trunk). */
const pine = (x: number, y: number, s: number, col = '#6fae9c'): string => {
  const tier = (apexY: number, baseY: number, hw: number) => {
    const h = baseY - apexY;
    return `<path d="M0 ${apexY} L${-hw} ${baseY} L${hw} ${baseY}Z" fill="${col}" stroke="${col}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M0 ${apexY} L${f(hw * 0.5)} ${f(apexY + h * 0.5)} L${f(hw * 0.2)} ${f(apexY + h * 0.4)} L0 ${f(apexY + h * 0.56)} L${f(-hw * 0.25)} ${f(apexY + h * 0.4)} L${f(-hw * 0.5)} ${f(apexY + h * 0.5)}Z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>`;
  };
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-12" width="10" height="16" rx="3.5" fill="#9a7b66"/>${tier(-56, -8, 40)}${tier(-84, -36, 33)}${tier(-108, -64, 25)}</g>`;
};

/** An igloo of snow blocks (origin at the middle of its base). Returns the body and the warm door light for night. */
const igloo = (x: number, y: number, s: number): { body: string; glow: string } => {
  const row = (yy: number) => { const hw = 60 * Math.sqrt(1 - (yy / 46) ** 2); return `M${f(-hw)} ${-yy} Q0 ${-yy + 8} ${f(hw)} ${-yy}`; };
  const joints = [[-36, -4, -15], [-8, -4, -15], [22, -4, -15], [-24, -15, -30], [8, -15, -30], [-8, -30, -43]]
    .map(([jx, y1, y2]) => `M${jx} ${y1} L${jx! + 2} ${y2}`).join(' ');
  const door = 'M-12 3 V-8 A12 12 0 0 1 12 -8 V3Z';
  const body = `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="2" cy="3" rx="74" ry="9" fill="#33516c" opacity=".22"/>
    <path d="M-60 0 A60 46 0 0 1 60 0Z" fill="#ffffff"/>
    <path d="M30 -39 A60 46 0 0 1 60 0 L26 0 Q38 -20 30 -39Z" fill="#d6e4f6" opacity=".75"/>
    <path d="${row(15)} ${row(30)} ${joints}" stroke="#bcd3ea" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M-40 -28 Q-30 -38 -16 -42" stroke="#eef6ff" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M-25 4 V-6 Q-25 -29 0 -29 Q25 -29 25 -6 V4Z" fill="#ffffff" stroke="#c4d9ee" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-25 -12 Q0 -6 25 -12" stroke="#d3e3f3" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="${door}" fill="#35506b"/>
  </g>`;
  const glow = `<g transform="translate(${x} ${y}) scale(${s})"><path d="${door}" fill="#ffd77a"/><ellipse cx="0" cy="3" rx="30" ry="6" fill="#ffd77a" opacity=".35"/></g>`;
  return { body, glow };
};

/** A flat ice floe seen from the side: pale top, a blue side, a soft shadow in the water. */
const floe = (cx: number, cy: number, w: number, h: number): string => {
  const shape = (dy: number) => `M${f(cx - w / 2)} ${f(cy + dy)} Q${f(cx - w / 2)} ${f(cy - h + dy)} ${f(cx - w * 0.15)} ${f(cy - h * 0.95 + dy)} Q${f(cx + w * 0.3)} ${f(cy - h * 1.05 + dy)} ${f(cx + w / 2)} ${f(cy - h * 0.05 + dy)} Q${f(cx + w * 0.5)} ${f(cy + h * 0.5 + dy)} ${f(cx)} ${f(cy + h * 0.55 + dy)} Q${f(cx - w / 2)} ${f(cy + h * 0.55 + dy)} ${f(cx - w / 2)} ${f(cy + dy)}Z`;
  return `<g>
    <ellipse cx="${f(cx)}" cy="${f(cy + h * 1.0)}" rx="${f(w * 0.56)}" ry="${f(h * 0.34)}" fill="#1b3045" opacity=".28"/>
    <path d="${shape(h * 0.42)}" fill="#8fbfe2"/>
    <path d="${shape(0)}" fill="#f7fbff"/>
    <ellipse cx="${f(cx + w * 0.08)}" cy="${f(cy + h * 0.1)}" rx="${f(w * 0.34)}" ry="${f(h * 0.2)}" fill="#e3eefa"/>
    <path d="M${f(cx - w * 0.3)} ${f(cy - h * 0.55)} Q${f(cx - w * 0.1)} ${f(cy - h * 0.75)} ${f(cx + w * 0.05)} ${f(cy - h * 0.72)}" stroke="#fff" stroke-width="${f(Math.max(3, h * 0.12))}" stroke-linecap="round" fill="none"/>
    <path d="M${f(cx - w * 0.22)} ${f(cy + h * 0.78)} l0 ${f(h * 0.32)} M${f(cx + w * 0.02)} ${f(cy + h * 0.9)} l0 ${f(h * 0.3)} M${f(cx + w * 0.26)} ${f(cy + h * 0.78)} l0 ${f(h * 0.3)}" stroke="#ffffff" stroke-width="${f(Math.max(2.5, h * 0.08))}" stroke-linecap="round" opacity=".28"/>
  </g>`;
};

/** A four-point sparkle. */
const sparkle = (x: number, y: number, r: number, fill = '#fff'): string =>
  `<path d="M${x} ${y - r} L${f(x + r * 0.28)} ${f(y - r * 0.28)} L${x + r} ${y} L${f(x + r * 0.28)} ${f(y + r * 0.28)} L${x} ${y + r} L${f(x - r * 0.28)} ${f(y + r * 0.28)} L${x - r} ${y} L${f(x - r * 0.28)} ${f(y - r * 0.28)}Z" fill="${fill}"/>`;

// ---------------------------------------------------------------- falling snow (clouds that drift, flakes that fall)
const flake = (cx: number, cy: number, r: number, kind: number, delay: number, dur: number): string => {
  const inner = kind === 2
    ? `<g transform="translate(${cx} ${cy})"><g stroke="#a9cdee" stroke-width="${f(r * 0.9)}" stroke-linecap="round" opacity=".7"><path d="M0 ${-r * 1.7}V${r * 1.7}M${f(-r * 1.47)} ${f(-r * 0.85)}L${f(r * 1.47)} ${f(r * 0.85)}M${f(-r * 1.47)} ${f(r * 0.85)}L${f(r * 1.47)} ${f(-r * 0.85)}"/></g><g stroke="#fff" stroke-width="${f(r * 0.42)}" stroke-linecap="round"><path d="M0 ${-r * 1.7}V${r * 1.7}M${f(-r * 1.47)} ${f(-r * 0.85)}L${f(r * 1.47)} ${f(r * 0.85)}M${f(-r * 1.47)} ${f(r * 0.85)}L${f(r * 1.47)} ${f(-r * 0.85)}"/></g></g>`
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="#b9d6f0" stroke-width="1.4"/>`;
  return `<g class="ar-f" style="animation-delay:-${delay.toFixed(1)}s;animation-duration:${dur.toFixed(1)}s">${inner}</g>`;
};
const snowCluster = (cls: string, cx: number, cy: number, seed: number): string => {
  const spec: [number, number, number, number][] = [[-96, -34, 4.5, 0], [-58, 18, 3.4, 1], [-22, -52, 5.6, 2], [14, 6, 4, 0], [48, -30, 3.2, 1], [84, 30, 5, 2], [112, -6, 3.6, 0], [-120, 40, 3, 1], [62, 62, 4.2, 0], [-40, 70, 3, 1]];
  return `<g class="cloud ${cls}">${spec.map(([dx, dy, r, k], i) => flake(cx + dx, cy + dy, r, k, seed + i * 1.7, 7 + ((seed + i) % 4) * 1.3)).join('')}</g>`;
};

const STYLE = `<style>
@keyframes ar-fall { 0% { transform: translate(0, -30px); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translate(16px, 150px); opacity: 0; } }
@keyframes ar-glow { 0% { opacity: .72; transform: translateX(-22px); } 100% { opacity: 1; transform: translateX(22px); } }
.ar-f { animation: ar-fall 8s linear infinite; }
#scene-bg .ar-au { animation: ar-glow 16s ease-in-out infinite alternate; }
#scene-bg .ar-au2 { animation-duration: 22s; animation-delay: -6s; }
#scene-bg .scenery-glow { opacity: 0; transition: opacity 1.2s; }
body.night #scene-bg .scenery-glow, .night #scene-bg .scenery-glow { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .ar-f, #scene-bg .ar-au { animation: none !important; } }
</style>`;

// ---------------------------------------------------------------- the backdrop
export const arcticScene = (): string => {
  const stars = [[110, 110], [250, 60], [410, 190], [560, 80], [690, 36], [830, 160], [960, 66], [1090, 140], [1170, 36], [1300, 200], [1440, 96], [1530, 250], [70, 290], [330, 300], [640, 250], [900, 290], [1230, 320], [1470, 380], [170, 440], [520, 400], [770, 430], [1010, 400], [1350, 460], [50, 540], [1560, 540], [300, 520], [1180, 520], [1400, 30], [190, 200], [860, 30]]
    .map(([x, y], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${2.4 + (i % 3) * 0.9}" fill="${i % 5 === 0 ? '#fff6cf' : i % 3 === 0 ? '#d9f1ff' : '#ffffff'}"/>`).join('');
  const sparks = [[210, 150, 11], [1010, 110, 13], [1480, 300, 10], [620, 150, 9], [80, 420, 9], [1330, 90, 11]]
    .map(([x, y, r]) => `<g class="tw tw1">${sparkle(x!, y!, r!, '#fffbe6')}</g>`).join('');
  const peakFar = '#c4d4ef', peakFarShade = '#a6bde2', peakNear = '#b9deef', peakNearShade = '#97c7df';
  const ig = igloo(1445, 690, 1.45);
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  ${STYLE}
  <defs>
    <linearGradient id="arctic-sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ccaf2"/><stop offset="0.3" stop-color="#b7dcf6"/><stop offset="0.5" stop-color="#d9daf4"/><stop offset="0.62" stop-color="#f7d9e8"/><stop offset="0.72" stop-color="#fde6e8"/><stop offset="1" stop-color="#fff4f2"/></linearGradient>
    <linearGradient id="arctic-sn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#091541"/><stop offset="0.4" stop-color="#12306a"/><stop offset="0.68" stop-color="#2b5391"/><stop offset="1" stop-color="#1d4068"/></linearGradient>
    <linearGradient id="arctic-wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f86a3"/><stop offset="0.5" stop-color="#436784"/><stop offset="1" stop-color="#2a4660"/></linearGradient>
    <linearGradient id="arctic-au1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3be8b0" stop-opacity="0"/><stop offset="0.6" stop-color="#4fefb4" stop-opacity=".75"/><stop offset="1" stop-color="#9af9d4" stop-opacity=".95"/></linearGradient>
    <linearGradient id="arctic-au2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a98bff" stop-opacity="0"/><stop offset="0.6" stop-color="#9f86ff" stop-opacity=".45"/><stop offset="1" stop-color="#e0a2ff" stop-opacity=".7"/></linearGradient>
    <linearGradient id="arctic-au3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d83ff" stop-opacity="0"/><stop offset="0.55" stop-color="#6fd8ff" stop-opacity=".4"/><stop offset="1" stop-color="#65f2c4" stop-opacity=".8"/></linearGradient>
    <radialGradient id="arctic-sung" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fffbe6" stop-opacity=".95"/><stop offset="0.35" stop-color="#ffeec2" stop-opacity=".5"/><stop offset="1" stop-color="#ffe3d0" stop-opacity="0"/></radialGradient>
    <radialGradient id="arctic-moong" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e6f3ff" stop-opacity=".7"/><stop offset="1" stop-color="#e6f3ff" stop-opacity="0"/></radialGradient>
    <linearGradient id="arctic-nt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2447a8" stop-opacity="0"/><stop offset="0.3" stop-color="#2447a8" stop-opacity=".42"/><stop offset="1" stop-color="#1b3a9a" stop-opacity=".5"/></linearGradient>
    <filter id="arctic-blur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="13"/></filter>
  </defs>
  <rect class="sky-day" width="1600" height="900" fill="url(#arctic-sd)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#arctic-sn)"/>
  <g class="sun">
    <circle cx="1250" cy="170" r="190" fill="url(#arctic-sung)"/><circle cx="1250" cy="170" r="40" fill="#fff8e0"/><circle cx="1250" cy="170" r="29" fill="#fffdf2"/>
    <g fill="#ffd3e0" opacity=".7"><ellipse cx="190" cy="250" rx="150" ry="11"/><ellipse cx="300" cy="280" rx="110" ry="8"/><ellipse cx="1090" cy="360" rx="160" ry="10"/><ellipse cx="1380" cy="320" rx="140" ry="9"/><ellipse cx="60" cy="440" rx="130" ry="9"/></g>
    <g fill="#ffffff" opacity=".6"><ellipse cx="1470" cy="230" rx="120" ry="9"/><ellipse cx="900" cy="440" rx="120" ry="8"/></g>
  </g>
  <g class="moon"><circle cx="1290" cy="120" r="130" fill="url(#arctic-moong)"/><circle cx="1290" cy="120" r="42" fill="#eef7ff"/><circle cx="1276" cy="108" r="8" fill="#d3e5f6"/><circle cx="1306" cy="132" r="5" fill="#d3e5f6"/><circle cx="1300" cy="102" r="3.5" fill="#d3e5f6"/></g>
  <g class="stars">
    <g class="ar-au" filter="url(#arctic-blur)">
      <path d="M-100 330 C120 262 280 350 480 280 S830 200 1060 150 L1060 -60 C830 -10 700 -40 480 -10 S120 -20 -100 20Z" fill="url(#arctic-au1)"/>
      <path d="M-100 380 C140 320 300 400 520 340 S780 290 940 270 L940 150 C780 160 640 170 520 190 S140 210 -100 240Z" fill="url(#arctic-au2)" opacity=".8"/>
    </g>
    <g class="ar-au ar-au2" filter="url(#arctic-blur)">
      <path d="M520 190 C780 120 1000 230 1200 170 S1500 70 1720 150 L1720 -60 L520 -60Z" fill="url(#arctic-au3)" opacity=".85"/>
      <path d="M900 300 C1100 240 1280 320 1460 250 S1620 210 1720 230 L1720 90 C1560 100 1420 130 1260 120 S1000 100 900 140Z" fill="url(#arctic-au2)" opacity=".7"/>
    </g>
    ${stars}${sparks}
  </g>
  ${snowCluster('c1', 170, 150, 1)}
  ${snowCluster('c2', 120, 330, 5)}
  ${snowCluster('c3', 60, 90, 9)}
  <g class="scenery">
    <!-- pointed ice peaks at the two edges -->
    ${peak(-20, 640, 300, 310, peakFar, peakFarShade)}${peak(130, 640, 330, 380, peakFar, peakFarShade)}${peak(330, 640, 240, 240, peakFar, peakFarShade)}
    ${peak(1290, 640, 250, 230, peakFar, peakFarShade)}${peak(1470, 640, 340, 370, peakFar, peakFarShade)}${peak(1640, 640, 260, 300, peakFar, peakFarShade)}
    ${peak(240, 650, 190, 150, peakNear, peakNearShade)}${peak(1380, 650, 200, 160, peakNear, peakNearShade)}
    <!-- far snowy ridge, soft lilac -->
    <path d="M-10 602 Q170 540 380 584 T760 590 T1140 572 T1610 586 V740 H-10Z" fill="#dfe6f8"/>
    <path d="M-10 622 Q200 574 420 612 T820 618 T1220 604 T1610 616 V740 H-10Z" fill="#ebf0fb"/>
    <!-- nearer snow hills -->
    <path d="M-20 704 Q130 604 340 632 Q480 650 580 710Z" fill="#cfe0f3"/>
    <path d="M-20 700 Q130 598 340 624 Q480 642 580 704Z" fill="#f5f9fe"/>
    <path d="M980 710 Q1160 622 1360 608 Q1520 600 1620 646 V710Z" fill="#cfe0f3"/>
    <path d="M980 704 Q1160 616 1360 600 Q1520 592 1620 638 V704Z" fill="#f5f9fe"/>
    <path d="M0 684 Q400 636 800 662 T1600 656 V724 H0Z" fill="#f2f6fc"/>
    ${pine(96, 662, 0.95)}${pine(176, 676, 0.66, '#7bb8a6')}${pine(1130, 664, 0.8)}${pine(1196, 676, 0.58, '#7bb8a6')}
    ${ig.body}
    <!-- dark blue-grey water -->
    <path d="M0 708 Q200 696 400 708 T800 708 T1200 706 T1600 708 V900 H0Z" fill="url(#arctic-wat)"/>
    <g fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".22"><path d="M420 760 q40 -9 80 0"/><path d="M820 748 q50 -9 100 0"/><path d="M1050 868 q40 -9 80 0"/><path d="M160 870 q36 -8 72 0"/><path d="M1300 840 q36 -8 72 0"/><path d="M640 884 q40 -8 80 0"/></g>
    <!-- ice floes -->
    ${floe(1090, 786, 170, 30)}${floe(470, 812, 200, 34)}${floe(300, 880, 120, 18)}${floe(820, 866, 250, 32)}${floe(1330, 868, 190, 30)}
    ${floe(40, 776, 360, 58)}${floe(1570, 780, 360, 60)}
    ${pine(76, 744, 0.7, '#7bb8a6')}
    <g fill="#ffffff" opacity=".7"><circle cx="210" cy="738" r="4"/><circle cx="1470" cy="750" r="4"/><circle cx="640" cy="690" r="3"/><circle cx="1000" cy="676" r="3"/></g>
    ${sparkle(150, 620, 10)}${sparkle(1500, 620, 9)}${sparkle(540, 664, 7)}${sparkle(1290, 640, 7)}
  </g>
  <g class="stars"><rect y="330" width="1600" height="570" fill="url(#arctic-nt)"/></g>
  <g class="scenery-glow">${ig.glow}</g>
</svg>`;
};

// ---------------------------------------------------------------- the island: a small ice floe with an igloo, a snow pile, a tiny pine and a hole in the ice
export const arcticIsland = (): string => {
  const ig = igloo(290, 116, 0.8);
  const top = 'M18 126 Q18 88 110 83 L290 83 Q382 88 382 126 Q382 160 200 162 Q18 160 18 126Z';
  return `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="200" cy="176" rx="190" ry="12" fill="#1b3045" opacity=".3"/>
  <path d="${top}" transform="translate(0 14)" fill="#8fbfe2"/>
  <path d="M40 156 v14 M82 162 v13 M128 166 v12 M176 168 v12 M228 168 v12 M276 166 v12 M322 162 v13 M362 154 v13" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" opacity=".3"/>
  <path d="${top}" fill="#f8fbff"/>
  <path d="M30 128 Q60 150 130 154 Q200 158 270 154 Q340 150 370 128 Q380 140 360 148 Q300 164 200 164 Q100 164 40 148 Q22 140 30 128Z" fill="#e1edf9"/>
  <path d="M60 106 Q80 94 120 92" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none"/>
  ${ig.body}
  ${pine(54, 118, 0.62)}
  <path d="M82 124 Q94 102 118 103 Q142 102 152 124 Q118 130 82 124Z" fill="#d2e3f4"/>
  <path d="M82 121 Q94 98 118 99 Q142 98 152 121 Q118 127 82 121Z" fill="#ffffff"/>
  <circle cx="136" cy="118" r="5" fill="#fff"/><circle cx="84" cy="121" r="4" fill="#fff"/><path d="M96 112 Q104 104 116 104" stroke="#d9e8f6" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  <ellipse cx="336" cy="144" rx="26" ry="8.5" fill="#cbe2f5"/>
  <ellipse cx="336" cy="144.5" rx="21" ry="6" fill="#3d5d7a"/>
  <path d="M322 143 q8 -3 18 -1" stroke="#7ea3c2" stroke-width="2" stroke-linecap="round" fill="none"/>
  ${sparkle(30, 96, 6)}${sparkle(214, 92, 5)}${sparkle(376, 100, 5)}
  <g>${flake(330, 30, 4, 0, 0, 9).replace(' class="ar-f"', '')}${flake(60, 40, 3.4, 1, 0, 9).replace(' class="ar-f"', '')}${flake(190, 18, 4.4, 2, 0, 9).replace(' class="ar-f"', '')}${flake(368, 60, 3, 0, 0, 9).replace(' class="ar-f"', '')}${flake(120, 56, 3, 1, 0, 9).replace(' class="ar-f"', '')}</g>
</svg>`;
};
