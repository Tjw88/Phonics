import { mixHex } from '../art';

// Space Station: the arrival capsules, the backdrop and the home island. (Creatures live in space.ts.)

/** A four-pointed sparkle (a soft pinched star) centred on x,y with radius r. */
const spark = (x: number, y: number, r: number, fill: string, extra = ''): string => {
  const k = r * 0.2;
  return `<path ${extra} d="M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}Z" fill="${fill}"/>`;
};

/** The glossy rocket pod a space friend arrives in: silver-white shell, a porthole, a band and fins in the creature's colour. */
export const capsuleSVG = (id: string, main: string, dark: string, accent: string): string => {
  const p = `space-cap-${id}`;
  const light = mixHex(main, '#ffffff', 0.5);
  const body = 'M60 6 C88 6 102 52 102 92 L102 124 Q102 132 94 132 L26 132 Q18 132 18 124 L18 92 C18 52 32 6 60 6Z';
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${p}-shell" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#e9efff"/><stop offset="1" stop-color="#b9c4ec"/></linearGradient>
    <radialGradient id="${p}-glass" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#e6fbff"/><stop offset="0.55" stop-color="#7fd3f5"/><stop offset="1" stop-color="#2f86c9"/></radialGradient>
    <clipPath id="${p}-clip"><path d="${body}"/></clipPath>
  </defs>
  <ellipse cx="60" cy="141" rx="42" ry="6" fill="#0000002b"/>
  <path d="M18 104 Q2 112 4 134 Q14 134 24 124Z" fill="${main}"/><path d="M102 104 Q118 112 116 134 Q106 134 96 124Z" fill="${main}"/>
  <path d="M18 104 Q8 110 7 122 Q14 118 20 112Z" fill="#ffffff" opacity=".4"/><path d="M102 104 Q112 110 113 122 Q106 118 100 112Z" fill="${dark}" opacity=".35"/>
  <rect x="34" y="128" width="12" height="10" rx="4" fill="${dark}"/><rect x="74" y="128" width="12" height="10" rx="4" fill="${dark}"/>
  <path d="${body}" fill="url(#${p}-shell)"/>
  <g clip-path="url(#${p}-clip)">
    <path d="M60 0 C84 0 96 24 100 44 L20 44 C24 24 36 0 60 0Z" fill="${main}"/>
    <path d="M60 0 C76 0 88 12 94 28 L26 28 C32 12 44 0 60 0Z" fill="${light}" opacity=".45"/>
    <rect x="10" y="94" width="100" height="16" fill="${main}"/><rect x="10" y="94" width="100" height="5" fill="#ffffff" opacity=".4"/><rect x="10" y="106" width="100" height="4" fill="${dark}" opacity=".3"/>
    <circle cx="30" cy="102" r="3" fill="#ffffffcc"/><circle cx="60" cy="102" r="3" fill="#ffffffcc"/><circle cx="90" cy="102" r="3" fill="#ffffffcc"/>
    <rect x="76" y="0" width="34" height="140" fill="#7d8bc9" opacity=".16"/>
  </g>
  <circle cx="60" cy="68" r="19" fill="#9aa7d6"/><circle cx="60" cy="68" r="15.5" fill="url(#${p}-glass)"/>
  <ellipse cx="53" cy="61" rx="6" ry="4" fill="#ffffff" opacity=".85" transform="rotate(-35 53 61)"/><circle cx="68" cy="76" r="2" fill="#ffffff" opacity=".6"/>
  ${[0, 90, 180, 270].map((a) => `<circle cx="${(60 + 19 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(68 + 19 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="1.8" fill="#ffffff"/>`).join('')}
  <path d="M28 20 Q22 50 22 78" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>
  ${spark(12, 34, 7, accent)}${spark(108, 22, 8, '#fff6a8')}${spark(104, 56, 4.5, '#ffffff')}${spark(16, 62, 4, '#ffffff')}${spark(96, 6, 3.5, accent)}
</svg>`;
};

/** Backdrop: a friendly planet by day (lavender sky, ringed planet, pastel moon ground) and a starry indigo sky by night. */
export const sceneSVG = (): string => {
  const stars = [
    [90, 60, 3], [230, 150, 2.5], [360, 60, 3], [470, 220, 2.5], [560, 90, 3.5], [660, 40, 2.5], [760, 180, 3], [820, 70, 2.5], [930, 30, 3],
    [1000, 150, 2.5], [1100, 60, 3.5], [1190, 200, 2.5], [1250, 36, 3], [1330, 250, 3], [1410, 70, 3.5], [1520, 130, 2.5], [1570, 40, 3],
    [40, 220, 3], [150, 300, 2.5], [300, 340, 3], [420, 410, 2.5], [520, 300, 3], [640, 340, 2.5], [740, 420, 3], [880, 330, 2.5],
    [980, 400, 3], [1080, 320, 2.5], [1200, 410, 3], [1300, 360, 2.5], [1450, 220, 3], [1540, 330, 2.5], [60, 420, 2.5], [200, 470, 3],
    [1500, 450, 2.5], [340, 130, 2], [610, 160, 2], [1140, 130, 2], [880, 120, 2], [1380, 330, 2],
  ];
  const starEls = stars.map(([x, y, r], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`).join('');
  const sparks = [[200, 90, 11], [700, 110, 9], [1050, 90, 12], [1480, 250, 10], [380, 280, 9], [1260, 150, 8]]
    .map(([x, y, r], i) => spark(x!, y!, r!, '#fff', `class="tw tw${(i + 1) % 3}"`)).join('');
  const rays = Array.from({ length: 10 }, (_, i) => `<rect x="-4" y="-70" width="8" height="20" rx="4" fill="#ffe9a0" transform="rotate(${i * 36})"/>`).join('');
  const crater = (x: number, y: number, rx: number, ry: number, fill: string, rim: string) =>
    `<ellipse cx="${x}" cy="${y + ry * 0.18}" rx="${rx}" ry="${ry}" fill="${rim}"/><ellipse cx="${x}" cy="${y + ry * 0.3}" rx="${rx * 0.88}" ry="${ry * 0.8}" fill="${fill}"/>`;
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="space-sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8c2f4"/><stop offset="0.6" stop-color="#dde2fb"/><stop offset="1" stop-color="#eaf3ff"/></linearGradient>
    <linearGradient id="space-sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141646"/><stop offset="0.7" stop-color="#26286e"/><stop offset="1" stop-color="#3a3d8c"/></linearGradient>
    <radialGradient id="space-moonglow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6c9" stop-opacity=".55"/><stop offset="1" stop-color="#fff6c9" stop-opacity="0"/></radialGradient>
  </defs>
  <rect class="sky-day" width="1600" height="900" fill="url(#space-sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#space-sky-n)"/>
  <g class="sun">
    <g transform="translate(150 110)"><g class="rays">${rays}</g><circle r="40" fill="#ffe27a"/><circle r="40" fill="none" stroke="#ffd04a" stroke-width="5" opacity=".5"/><circle cx="-12" cy="-12" r="9" fill="#fff6c9" opacity=".7"/></g>
    <path d="M1000 44 A28 28 0 1 0 1000 96 A60 60 0 0 1 1000 44Z" fill="#fffbea"/>
  </g>
  <g class="moon"><circle cx="1470" cy="120" r="90" fill="url(#space-moonglow)"/><path d="M1480 76 A46 46 0 1 0 1480 164 A90 90 0 0 1 1480 76Z" fill="#fff6c9"/></g>
  <g class="stars" fill="#fff">${starEls}${sparks}</g>
  <g class="cloud c1" fill="#fff" opacity=".6"><ellipse cx="330" cy="200" rx="110" ry="26" fill="#f4dcf4"/><ellipse cx="400" cy="184" rx="64" ry="26" fill="#f4dcf4"/><ellipse cx="270" cy="188" rx="52" ry="20" fill="#f9e9fa"/></g>
  <g class="cloud c2" opacity=".55"><ellipse cx="900" cy="130" rx="96" ry="22" fill="#e8dcfa"/><ellipse cx="950" cy="114" rx="54" ry="22" fill="#e8dcfa"/><ellipse cx="850" cy="120" rx="44" ry="17" fill="#f3ecff"/></g>
  <g class="cloud c3" opacity=".5"><ellipse cx="1150" cy="330" rx="84" ry="20" fill="#f4dcf4"/><ellipse cx="1190" cy="316" rx="46" ry="20" fill="#f4dcf4"/></g>
  <g class="scenery">
    <g class="planet-big" transform="translate(1480 290)">
      <g transform="rotate(-20)"><path d="M-205 0 A205 46 0 0 1 205 0" fill="none" stroke="#e8c898" stroke-width="20"/></g>
      <circle r="116" fill="#f5c3a8"/>
      <clipPath id="space-pclip"><circle r="116"/></clipPath>
      <g clip-path="url(#space-pclip)"><path d="M-130 -40 Q0 -60 130 -30 L130 -6 Q0 -34 -130 -14Z" fill="#efae93"/><path d="M-130 34 Q0 12 130 40 L130 70 Q0 44 -130 66Z" fill="#efae93"/><path d="M-130 -80 Q0 -100 130 -72 L130 -62 Q0 -88 -130 -70Z" fill="#fad5bf"/><circle cx="-40" cy="-72" r="40" fill="#fff" opacity=".18"/><path d="M40 -120 A120 120 0 0 1 40 120 A150 150 0 0 0 40 -120Z" fill="#d98e7f" opacity=".35"/></g>
      <g transform="rotate(-20)"><path d="M-205 0 A205 46 0 0 0 205 0" fill="none" stroke="#f3dcae" stroke-width="20"/><path d="M-186 4 A186 40 0 0 0 186 4" fill="none" stroke="#fff6dc" stroke-width="4" opacity=".7"/></g>
    </g>
    <g class="planet-small" transform="translate(110 470)">
      <circle r="66" fill="#a5e0d2"/><clipPath id="space-p2clip"><circle r="66"/></clipPath>
      <g clip-path="url(#space-p2clip)"><circle cx="-18" cy="-20" r="14" fill="#8ccdbf"/><circle cx="24" cy="12" r="9" fill="#8ccdbf"/><circle cx="-26" cy="30" r="7" fill="#8ccdbf"/><path d="M30 -70 A70 70 0 0 1 30 70 A90 90 0 0 0 30 -70Z" fill="#6fb3b3" opacity=".35"/><ellipse cx="-30" cy="-34" rx="22" ry="12" fill="#fff" opacity=".28" transform="rotate(-35 -30 -34)"/></g>
    </g>
    <path d="M0 585 Q180 520 380 566 T760 552 T1160 570 T1600 536 V900 H0Z" fill="#b9b2f2" class="hills-far"/>
    ${crater(330, 590, 38, 8, '#b9b3e6', '#e0ddfa')}${crater(1010, 590, 30, 7, '#b9b3e6', '#e0ddfa')}
    <g class="moon-base" transform="translate(1450 604)">
      <rect x="-58" y="-6" width="116" height="16" rx="8" fill="#a9a8dc"/>
      <path d="M-40 -6 A40 40 0 0 1 40 -6Z" fill="#eef7ff" stroke="#b7c4e8" stroke-width="4"/>
      <path d="M-26 -22 A28 28 0 0 1 -6 -34" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>
      <path d="M-9 -6 V-18 Q0 -26 9 -18 V-6Z" fill="#8fa0d6"/><circle cx="-22" cy="-14" r="4" fill="#ffe27a"/><circle cx="22" cy="-14" r="4" fill="#ffe27a"/>
      <path d="M0 -46 V-78" stroke="#b7c4e8" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="-82" r="6" fill="#ff9ec0"/><path d="M-12 -62 Q0 -72 12 -62" fill="none" stroke="#b7c4e8" stroke-width="3" stroke-linecap="round"/>
      <rect x="38" y="-4" width="26" height="7" fill="#b7c4e8"/><rect x="60" y="-16" width="32" height="26" rx="10" fill="#eef7ff" stroke="#b7c4e8" stroke-width="3"/><circle cx="76" cy="-3" r="5" fill="#bfe6f8"/>
    </g>
    <path d="M0 668 Q230 596 470 654 T930 640 T1360 654 T1600 624 V900 H0Z" fill="#cdb6f0" class="hills-mid"/>
    ${crater(150, 690, 46, 10, '#c5b5e6', '#ebdff8')}${crater(700, 700, 60, 12, '#c5b5e6', '#ebdff8')}${crater(1300, 690, 36, 8, '#c5b5e6', '#ebdff8')}
    <g class="flag" transform="translate(230 700)"><path d="M0 0 V-50" stroke="#b7aee0" stroke-width="4" stroke-linecap="round"/><path d="M2 -50 H30 L22 -40 L30 -30 H2Z" fill="#ff9ec0"/></g>
    <path d="M0 770 Q300 722 620 766 T1220 760 T1600 738 V900 H0Z" fill="#e2c8f2" class="hills-near"/>
    ${crater(430, 826, 58, 12, '#d6c3e8', '#f6eefa')}${crater(1000, 840, 74, 14, '#d6c3e8', '#f6eefa')}${crater(60, 850, 40, 9, '#d6c3e8', '#f6eefa')}
    <g class="rover" transform="translate(1395 822)">
      <ellipse cx="0" cy="22" rx="52" ry="5" fill="#b7aee0" opacity=".5"/>
      <path d="M-30 -8 L30 -8 L26 -22 Q0 -30 -26 -22Z" fill="#c4b8ee"/>
      <rect x="-40" y="-8" width="80" height="22" rx="9" fill="#f5f0ff" stroke="#c4b8ee" stroke-width="3"/>
      <rect x="-40" y="2" width="80" height="6" fill="#9fd4ee"/>
      <rect x="-14" y="-20" width="28" height="12" rx="6" fill="#bfe6f8" stroke="#a6b9e6" stroke-width="3"/>
      <path d="M26 -20 V-38" stroke="#a6b9e6" stroke-width="3" stroke-linecap="round"/><path d="M18 -38 Q26 -48 34 -38Z" fill="#ff9ec0"/>
      <circle cx="-26" cy="16" r="11" fill="#8f9ad0"/><circle cx="26" cy="16" r="11" fill="#8f9ad0"/><circle cx="-26" cy="16" r="4.5" fill="#e8ecff"/><circle cx="26" cy="16" r="4.5" fill="#e8ecff"/>
    </g>
  </g>
</svg>`;
};

/** The home island: a small floating planetoid with a flag, a crater and a mini dome. */
export const islandSVG = (): string => `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="space-isl-under" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8abe8"/><stop offset="1" stop-color="#8176c4"/></linearGradient>
  </defs>
  <ellipse cx="200" cy="184" rx="92" ry="5" fill="#2b2f78" opacity=".18"/>
  <path d="M22 104 C26 140 90 160 130 170 Q200 190 270 170 C310 160 374 140 378 104Z" fill="url(#space-isl-under)"/>
  <path d="M60 126 Q130 150 200 150 Q270 150 340 126 Q300 160 230 172 Q200 177 170 172 Q100 160 60 126Z" fill="#6f65b8" opacity=".35"/>
  <ellipse cx="96" cy="136" rx="14" ry="7" fill="#7d72c2"/><ellipse cx="296" cy="146" rx="11" ry="6" fill="#7d72c2"/><ellipse cx="206" cy="166" rx="9" ry="4.5" fill="#7d72c2"/>
  <ellipse cx="200" cy="104" rx="178" ry="34" fill="#cfc6f4"/>
  <ellipse cx="200" cy="100" rx="178" ry="34" fill="#e8dffa"/>
  <path d="M48 92 Q120 70 200 70 Q280 70 352 92 Q300 78 200 78 Q100 78 48 92Z" fill="#fff" opacity=".5"/>
  <ellipse cx="262" cy="86" rx="26" ry="7" fill="#cdbfee"/><ellipse cx="262" cy="88" rx="21" ry="5" fill="#b9a9e4"/>
  <ellipse cx="146" cy="82" rx="14" ry="4" fill="#d3c7f2"/><ellipse cx="146" cy="83" rx="10" ry="2.6" fill="#bfb0e6"/>
  <g transform="translate(72 90)"><ellipse cx="0" cy="2" rx="10" ry="3" fill="#b9a9e4"/><path d="M0 0 V-52" stroke="#9c92d6" stroke-width="4" stroke-linecap="round"/><path d="M2 -52 H34 Q28 -43 34 -34 H2Z" fill="#ff7fae"/><circle cx="0" cy="-54" r="3.5" fill="#ffe27a"/></g>
  <g transform="translate(330 90)"><ellipse cx="0" cy="3" rx="36" ry="7" fill="#b9a9e4"/><path d="M-30 0 A30 30 0 0 1 30 0Z" fill="#f2f9ff" stroke="#b7c4e8" stroke-width="3"/><path d="M-20 -12 A20 20 0 0 1 -6 -22" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M-7 0 V-10 Q0 -17 7 -10 V0Z" fill="#8fa0d6"/><path d="M0 -30 V-52" stroke="#b7c4e8" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="-55" r="4.5" fill="#ff9ec0"/></g>
  <path d="M30 28 l2.2 6 l6 2.2 l-6 2.2 l-2.2 6 l-2.2 -6 l-6 -2.2 l6 -2.2z" fill="#ffe27a"/>
  <path d="M370 44 l1.8 5 l5 1.8 l-5 1.8 l-1.8 5 l-1.8 -5 l-5 -1.8 l5 -1.8z" fill="#ffffff"/>
  <path d="M112 14 l1.6 4.4 l4.4 1.6 l-4.4 1.6 l-1.6 4.4 l-1.6 -4.4 l-4.4 -1.6 l4.4 -1.6z" fill="#ffffff"/>
  <path d="M300 18 l2 5.4 l5.4 2 l-5.4 2 l-2 5.4 l-2 -5.4 l-5.4 -2 l5.4 -2z" fill="#ffe27a"/>
  <circle cx="14" cy="150" r="3" fill="#ffffff"/><circle cx="388" cy="140" r="2.5" fill="#ffe27a"/><circle cx="60" cy="176" r="2" fill="#ffffff"/><circle cx="344" cy="178" r="2.5" fill="#ffffff"/>
</svg>`;
