import { mixHex } from '../art';

// Robot Workshop art: the arrival parts box, the cosy workshop backdrop and the workbench island.
// Flat fills, soft rounded shapes, pale steel blue and warm yellow; saturated colour belongs to the four robots.

const f = (n: number): string => String(Math.round(n * 10) / 10);

/** A friendly gear: body disc + rounded teeth + a ring and a hole. `cls` goes on the inner group (e.g. for slow spinning). */
export const robotGear = (cx: number, cy: number, r: number, n: number, fill: string, o: { hole?: string; cls?: string; spokes?: string; ring?: boolean } = {}): string => {
  const tw = r * 0.3;
  let teeth = '';
  for (let i = 0; i < n; i++) teeth += `<rect x="${f(-tw / 2)}" y="${f(-r)}" width="${f(tw)}" height="${f(r * 0.4)}" rx="${f(tw * 0.32)}" transform="rotate(${f((i * 360) / n)})"/>`;
  let spokes = '';
  if (o.spokes) for (let i = 0; i < 4; i++) { const a = ((45 + i * 90) * Math.PI) / 180; spokes += `<circle cx="${f(Math.cos(a) * r * 0.5)}" cy="${f(Math.sin(a) * r * 0.5)}" r="${f(r * 0.13)}" fill="${o.spokes}"/>`; }
  const hole = o.hole ?? mixHex(fill, '#000000', 0.25);
  return `<g transform="translate(${f(cx)} ${f(cy)})"><g${o.cls ? ` class="${o.cls}"` : ''}><g fill="${fill}">${teeth}<circle r="${f(r * 0.84)}"/></g>${o.ring === false ? '' : `<circle r="${f(r * 0.64)}" fill="none" stroke="#ffffff" stroke-opacity=".38" stroke-width="${f(Math.max(1.5, r * 0.05))}"/>`}${spokes}<circle r="${f(r * 0.24)}" fill="${hole}"/></g></g>`;
};

const hex = (cx: number, cy: number, r: number, fill: string): string => {
  const p = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i; return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`; }).join(' ');
  return `<polygon points="${p}" fill="${fill}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.38)}" fill="#00000030"/>`;
};

/** coil spring seen from the side, x = centre */
export const robotSpring = (x: number, y: number, w: number, h: number, coils: number, col: string, sw = 4.5): string => {
  const step = h / coils;
  let s = `<rect x="${f(x - w * 0.3)}" y="${f(y)}" width="${f(w * 0.6)}" height="${f(h)}" rx="3" fill="${mixHex(col, '#000000', 0.35)}"/>`;
  for (let i = 0; i < coils; i++) {
    const yy = y + step * (i + 0.45);
    s += `<path d="M${f(x - w / 2)} ${f(yy)} Q${f(x)} ${f(yy + step * 0.95)} ${f(x + w / 2)} ${f(yy)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`;
  }
  return s;
};

// ------------------------------------------------------------------ arrival: a cardboard parts box with a coloured strap and bow
export const robotBoxSVG = (idx: number, main: string, dark: string, accent: string): string => {
  const steel = '#b7c4d4';
  const steelD = '#8c9bb0';
  const lightM = mixHex(main, '#ffffff', 0.35);
  const bow = (cx: number, cy: number): string => `
    <g transform="translate(${cx} ${cy})">
      <path d="M-3 4 L-13 30 L-4 26 L0 33Z" fill="${dark}"/><path d="M3 4 L13 30 L4 26 L0 33Z" fill="${dark}"/>
      <ellipse cx="-14" cy="-3" rx="14" ry="9" fill="${main}" transform="rotate(-22 -14 -3)"/><ellipse cx="14" cy="-3" rx="14" ry="9" fill="${main}" transform="rotate(22 14 -3)"/>
      <ellipse cx="-15" cy="-3" rx="7" ry="4" fill="${dark}" opacity=".35" transform="rotate(-22 -15 -3)"/><ellipse cx="15" cy="-3" rx="7" ry="4" fill="${dark}" opacity=".35" transform="rotate(22 15 -3)"/>
      <circle r="7" fill="${dark}"/><circle cx="-2" cy="-2" r="2.4" fill="#fff" opacity=".6"/>
    </g>`;
  const contents: string[] = [
    // round: bulb + two gears
    `${robotGear(32, 66, 22, 9, accent, { hole: '#8a5a2b' })}${robotGear(90, 62, 17, 8, steel, { hole: '#8a5a2b' })}<g><rect x="55" y="40" width="10" height="26" fill="${steelD}"/><circle cx="60" cy="36" r="13" fill="#ffe27a" stroke="#e0a100" stroke-width="3"/><circle cx="55" cy="31" r="4" fill="#fff" opacity=".8"/></g>`,
    // boxy: wheel + spring + gear
    `<g transform="translate(30 62)"><circle r="21" fill="#3a4658"/><circle r="11" fill="#cfd8e6"/><circle r="4.5" fill="#3a4658"/></g>${robotSpring(62, 32, 18, 42, 5, steel)}${robotGear(92, 64, 17, 8, accent, { hole: '#8a5a2b' })}`,
    // tall: a big spring and gears
    `${robotSpring(40, 22, 22, 54, 6, steel)}${robotGear(84, 62, 21, 9, accent, { hole: '#8a5a2b' })}${robotGear(100, 50, 12, 7, steel, { hole: '#8a5a2b', ring: false })}`,
    // tiny: three small gears and a spring
    `${robotGear(26, 66, 15, 8, steel, { hole: '#8a5a2b' })}${robotGear(56, 56, 20, 9, accent, { hole: '#8a5a2b' })}${robotSpring(88, 34, 16, 40, 5, steel)}${robotGear(100, 68, 12, 7, steel, { hole: '#8a5a2b', ring: false })}`,
  ];
  const flapC = '#e8be82';
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="60" cy="143" rx="46" ry="6.5" fill="#0000002b"/>
  <g transform="rotate(-24 14 78)"><rect x="12" y="48" width="32" height="30" rx="5" fill="${flapC}"/><rect x="12" y="68" width="32" height="10" rx="3" fill="#c58b46" opacity=".45"/></g>
  <g transform="rotate(24 106 78)"><rect x="76" y="48" width="32" height="30" rx="5" fill="${flapC}"/><rect x="76" y="68" width="32" height="10" rx="3" fill="#c58b46" opacity=".45"/></g>
  <rect x="14" y="68" width="92" height="22" rx="6" fill="#7a4d24"/>
  ${contents[idx % 4]}
  <rect x="14" y="76" width="92" height="64" rx="7" fill="#d9a560"/>
  <path d="M14 83 Q14 76 21 76 H99 Q106 76 106 83 V90 H14Z" fill="#c78d48"/>
  <rect x="92" y="90" width="14" height="50" rx="5" fill="#b77f3b" opacity=".3"/>
  <rect x="50" y="76" width="20" height="64" fill="${main}"/><rect x="50" y="76" width="5" height="64" fill="${lightM}" opacity=".7"/><rect x="65" y="76" width="5" height="64" fill="${dark}" opacity=".35"/>
  <rect x="14" y="76" width="92" height="64" rx="7" fill="none" stroke="#a9722f" stroke-width="2.5"/>
  <g><rect x="78" y="106" width="22" height="24" rx="5" fill="#fff6dc" stroke="#c78d48" stroke-width="2"/>${robotGear(89, 118, 7, 6, '#b77f3b', { hole: '#fff6dc', ring: false })}</g>
  <g><rect x="20" y="122" width="22" height="9" rx="3" fill="#f3e3b8" opacity=".9"/></g>
  ${bow(60, 90)}
</svg>`;
};

// ------------------------------------------------------------------ the backdrop
export const robotSceneSVG = (): string => {
  const WAINS = '#f5da83';
  // wall with two see-through holes (a window and a porthole) so the sky, sun, moon, stars and clouds are seen through them
  const winL = 'M72 84 H232 Q252 84 252 104 V284 Q252 304 232 304 H72 Q52 304 52 284 V104 Q52 84 72 84Z';
  const winR = 'M1394 196 a74 74 0 1 0 148 0 a74 74 0 1 0 -148 0Z';
  const stars = [[92, 118, 3], [210, 112, 3.5], [130, 258, 3], [222, 244, 3], [170, 148, 2.5], [86, 206, 2.5], [1440, 156, 3], [1500, 150, 3.5], [1466, 240, 3], [1416, 206, 2.5], [1520, 232, 3], [1470, 196, 2.5], [236, 176, 2.5]]
    .map(([x, y, r], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`).join('');
  const rays = Array.from({ length: 10 }, (_, i) => `<rect x="-4" y="-66" width="8" height="20" rx="4" fill="#ffe27a" transform="rotate(${i * 36})"/>`).join('');

  // hanging lamps
  const lampShade = (x: number): string => `<path d="M${x} 52 V86" stroke="#8695a8" stroke-width="3"/><path d="M${x - 34} 118 Q${x - 34} 88 ${x} 86 Q${x + 34} 88 ${x + 34} 118Z" fill="#f7bf3c"/><path d="M${x - 24} 110 Q${x - 22} 94 ${x - 6} 90" stroke="#fff" stroke-opacity=".55" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="${x - 38}" y="114" width="76" height="8" rx="4" fill="#d9a63a"/><ellipse cx="${x}" cy="125" rx="9" ry="6" fill="#fff4c9"/>`;
  const lampGlow = (x: number): string => `<circle cx="${x}" cy="128" r="250" fill="url(#robot-lamp)"/><ellipse cx="${x}" cy="126" rx="12" ry="8" fill="#ffe27a"/><ellipse cx="${x}" cy="124" rx="5" ry="3" fill="#fff"/>`;

  // shelf jars
  const jar = (x: number, bottom: number, w: number, h: number, kind: number): string => {
    let inner = '';
    const rows = Math.floor((h - 14) / 12);
    for (let r = 0; r < rows; r++) for (let c = 0; c < 3; c++) {
      const cx = x + 8 + c * ((w - 16) / 2) + (r % 2 ? 4 : -2), cy = bottom - 9 - r * 11;
      if (kind === 0) inner += hex(cx, cy, 6, '#8d9db2');
      else if (kind === 1) inner += `<circle cx="${f(cx)}" cy="${f(cy)}" r="5" fill="#e8b84a"/><circle cx="${f(cx - 1.5)}" cy="${f(cy - 1.5)}" r="1.6" fill="#fff" opacity=".6"/>`;
      else inner += `<circle cx="${f(cx)}" cy="${f(cy)}" r="5.2" fill="none" stroke="#e8827a" stroke-width="3"/>`;
    }
    return `<g><rect x="${x}" y="${bottom - h}" width="${w}" height="${h}" rx="9" fill="#e4f2f8"/>${inner}<rect x="${x}" y="${bottom - h}" width="${w}" height="${h}" rx="9" fill="#ffffff" opacity=".28"/><rect x="${x + 5}" y="${bottom - h + 8}" width="4" height="${h - 22}" rx="2" fill="#fff" opacity=".7"/><rect x="${x}" y="${bottom - h}" width="${w}" height="${h}" rx="9" fill="none" stroke="#a9c3d1" stroke-width="2.5"/><rect x="${x - 2}" y="${bottom - h - 9}" width="${w + 4}" height="11" rx="4" fill="${['#e07a5f', '#5b9bd5', '#f2b84b'][kind]}"/></g>`;
  };
  const shelf = (x1: number, x2: number, y: number): string => `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="13" rx="5" fill="#d3a96b"/><rect x="${x1}" y="${y + 9}" width="${x2 - x1}" height="4" rx="2" fill="#b28445"/><path d="M${x1 + 14} ${y + 13} v22 l16 -22Z" fill="#a8b6c6"/><path d="M${x2 - 14} ${y + 13} v22 l-16 -22Z" fill="#a8b6c6"/>`;

  // pegboard tools (silhouettes with a little colour)
  const sh = (s: string): string => `<g transform="translate(3 4)" opacity=".16">${s}</g>`;
  const tools = (): string => {
    const hammer = `<line x1="84" y1="392" x2="84" y2="476" stroke="#c48a4c" stroke-width="10" stroke-linecap="round"/><rect x="60" y="372" width="48" height="22" rx="6" fill="#5f6f83"/><rect x="60" y="372" width="48" height="6" rx="3" fill="#fff" opacity=".25"/>`;
    const wrench = `<line x1="146" y1="384" x2="146" y2="506" stroke="#5f6f83" stroke-width="11" stroke-linecap="round"/><circle cx="146" cy="372" r="14" fill="none" stroke="#5f6f83" stroke-width="9"/><circle cx="146" cy="512" r="10" fill="none" stroke="#5f6f83" stroke-width="7"/>`;
    const driver = `<line x1="204" y1="430" x2="204" y2="496" stroke="#8d9db0" stroke-width="5" stroke-linecap="round"/><rect x="192" y="376" width="24" height="56" rx="10" fill="#e0564f"/><rect x="196" y="384" width="5" height="34" rx="2.5" fill="#fff" opacity=".4"/>`;
    const pliers = `<line x1="96" y1="606" x2="116" y2="556" stroke="#4b9ce2" stroke-width="10" stroke-linecap="round"/><line x1="140" y1="606" x2="120" y2="556" stroke="#4b9ce2" stroke-width="10" stroke-linecap="round"/><line x1="116" y1="556" x2="106" y2="526" stroke="#5f6f83" stroke-width="8" stroke-linecap="round"/><line x1="120" y1="556" x2="130" y2="526" stroke="#5f6f83" stroke-width="8" stroke-linecap="round"/><circle cx="118" cy="557" r="7" fill="#5f6f83"/>`;
    const spool = `<circle cx="204" cy="574" r="24" fill="#f4c542"/><circle cx="204" cy="574" r="10" fill="#c3d1de"/><circle cx="204" cy="574" r="24" fill="none" stroke="#d9a62a" stroke-width="3"/>`;
    return [hammer, wrench, driver, pliers, spool].map((t) => sh(t) + t).join('');
  };

  // a bolted control panel with soft blinking lights
  const lights: Array<[number, number, string, number]> = [[1388, 616, '#7fe0a0', 0], [1424, 616, '#ffd36b', 1], [1460, 616, '#ff9fb5', 2], [1496, 616, '#8fd0ff', 3], [1532, 616, '#7fe0a0', 1], [1568, 616, '#ffd36b', 2]];
  const lightsArt = lights.map(([x, y, c, b]) => `<circle class="robot-blink b${b}" cx="${x}" cy="${y}" r="8" fill="${c}"/><circle cx="${x - 2.5}" cy="${y - 2.5}" r="2.4" fill="#fff" opacity=".7"/>`).join('');
  const lightsGlow = lights.map(([x, y, c, b]) => `<circle class="robot-blink b${b}" cx="${x}" cy="${y}" r="13" fill="${c}" opacity=".38"/>`).join('');
  const barLights = [[56, 0], [86, 1], [116, 2], [1478, 1], [1508, 2], [1538, 3]].map(([x, b], i) => `<circle class="robot-blink b${b}" cx="${x}" cy="886" r="5" fill="${['#7fe0a0', '#ffd36b', '#ff9fb5'][i % 3]}"/>`).join('');
  const barGlow = [[56, 0], [86, 1], [116, 2], [1478, 1], [1508, 2], [1538, 3]].map(([x, b], i) => `<circle class="robot-blink b${b}" cx="${x}" cy="886" r="10" fill="${['#7fe0a0', '#ffd36b', '#ff9fb5'][i % 3]}" opacity=".4"/>`).join('');

  const rollers = Array.from({ length: 24 }, (_, i) => `<circle cx="${40 + i * 70}" cy="851" r="11" fill="#a4b2c2" stroke="#6a788b" stroke-width="3"/><circle cx="${40 + i * 70}" cy="851" r="3.5" fill="#6a788b"/>`).join('');
  const crate = (x: number, w: number, h: number, strap: string): string => `<g><rect x="${x}" y="${800 - h}" width="${w}" height="${h}" rx="5" fill="#d9a560"/><rect x="${x}" y="${800 - h}" width="${w}" height="9" rx="4" fill="#c78d48"/><rect x="${x + w / 2 - 6}" y="${800 - h}" width="12" height="${h}" fill="${strap}"/><rect x="${x}" y="${800 - h}" width="${w}" height="${h}" rx="5" fill="none" stroke="#a9722f" stroke-width="2.5"/></g>`;

  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="robot-sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b4dcf7"/><stop offset="1" stop-color="#eaf6fd"/></linearGradient>
    <linearGradient id="robot-sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17234d"/><stop offset="1" stop-color="#43569a"/></linearGradient>
    <linearGradient id="robot-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c1d2e3"/><stop offset="1" stop-color="#e5edf3"/></linearGradient>
    <linearGradient id="robot-wains" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e08a"/><stop offset="1" stop-color="#f0cf6c"/></linearGradient>
    <radialGradient id="robot-lamp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe9a3" stop-opacity=".85"/><stop offset=".3" stop-color="#ffd36b" stop-opacity=".4"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient>
    <radialGradient id="robot-pool" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff4c4" stop-opacity=".95"/><stop offset=".55" stop-color="#fff0b8" stop-opacity=".55"/><stop offset="1" stop-color="#fff0b8" stop-opacity="0"/></radialGradient>
    <pattern id="robot-haz" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="32" fill="#f6c944"/><rect x="16" width="16" height="32" fill="#56647a"/></pattern>
    <pattern id="robot-peg" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="2.4" fill="#9aabbd"/></pattern>
  </defs>
  <style>
    .wt-scene .sky-night, .wt-scene .moon, .wt-scene .stars { opacity: 0; }
    #scene-bg .scenery-glow, .wt-scene .scenery-glow { opacity: 0; transition: opacity 1.2s; }
    body.night #scene-bg .scenery-glow, .night #scene-bg .scenery-glow { opacity: 1; }
    .robot-blink { animation: robot-blink 3.4s ease-in-out infinite; } .robot-blink.b1 { animation-delay: -0.9s; } .robot-blink.b2 { animation-delay: -1.7s; } .robot-blink.b3 { animation-delay: -2.4s; }
    @keyframes robot-blink { 50% { opacity: 0.35; } }
    .robot-spin { transform-box: fill-box; transform-origin: 50% 50%; animation: robot-spin 90s linear infinite; } .robot-spin.r { animation-direction: reverse; animation-duration: 60s; }
    @keyframes robot-spin { to { transform: rotate(360deg); } }
    .robot-belt { animation: robot-belt 2.4s linear infinite; } @keyframes robot-belt { to { stroke-dashoffset: -34; } }
    @media (prefers-reduced-motion: reduce) { .robot-blink, .robot-spin, .robot-belt { animation: none !important; } }
  </style>
  <rect class="sky-day" width="1600" height="900" fill="url(#robot-sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#robot-sky-n)"/>
  <g class="sun"><g transform="translate(152 188)"><g class="rays">${rays}</g></g><circle cx="152" cy="188" r="36" fill="#ffd95a"/></g>
  <g class="moon"><circle cx="152" cy="188" r="34" fill="#fff6c9"/><circle cx="140" cy="178" r="7" fill="#efe5b0"/><circle cx="166" cy="200" r="5" fill="#efe5b0"/><circle cx="162" cy="172" r="4" fill="#efe5b0"/></g>
  <g class="stars" fill="#fff">${stars}</g>
  <g class="cloud c1" fill="#fff" opacity=".95"><ellipse cx="300" cy="150" rx="62" ry="20"/><ellipse cx="330" cy="134" rx="34" ry="22"/><ellipse cx="274" cy="138" rx="30" ry="17"/></g>
  <g class="cloud c2" fill="#fff" opacity=".9"><ellipse cx="900" cy="214" rx="58" ry="18"/><ellipse cx="928" cy="200" rx="30" ry="19"/><ellipse cx="878" cy="203" rx="26" ry="15"/></g>
  <g class="cloud c3" fill="#fff" opacity=".85"><ellipse cx="1100" cy="170" rx="50" ry="16"/><ellipse cx="1124" cy="158" rx="26" ry="16"/><ellipse cx="1080" cy="160" rx="22" ry="13"/></g>
  <g class="scenery">
    <path d="M40 262 Q110 228 172 256 T270 244 V310 H40Z" fill="#bcdcc8"/><path d="M40 288 Q120 260 200 282 T270 274 V310 H40Z" fill="#9dcbaa"/>
    <path d="M1380 252 Q1440 222 1482 246 T1560 238 V300 H1380Z" fill="#bcdcc8"/><path d="M1380 276 Q1450 252 1510 272 T1560 266 V300 H1380Z" fill="#9dcbaa"/>
    <path fill-rule="evenodd" fill="url(#robot-wall)" d="M0 0H1600V900H0Z ${winL} ${winR}"/>
    <g stroke="#bfcddb" stroke-opacity=".6" stroke-width="3"><line x1="400" y1="80" x2="400" y2="650"/><line x1="800" y1="80" x2="800" y2="650"/><line x1="1200" y1="80" x2="1200" y2="650"/></g>
    <ellipse cx="800" cy="580" rx="560" ry="340" fill="url(#robot-pool)"/>
    <rect x="0" y="654" width="1600" height="246" fill="url(#robot-wains)"/><rect x="0" y="648" width="1600" height="14" fill="#dcbf6c"/><rect x="0" y="648" width="1600" height="4" fill="#fff" opacity=".4"/>
    <rect x="0" y="0" width="1600" height="42" fill="#aebdcc"/><rect x="0" y="36" width="1600" height="8" fill="#97a8ba"/>
    ${Array.from({ length: 16 }, (_, i) => `<circle cx="${50 + i * 100}" cy="20" r="4" fill="#8392a6"/>`).join('')}
    <rect x="0" y="62" width="1600" height="18" fill="#c4d2df"/><rect x="0" y="62" width="1600" height="5" fill="#fff" opacity=".5"/>
    ${[300, 760, 1240].map((x) => `<rect x="${x}" y="54" width="14" height="34" rx="4" fill="#9aabbd"/>`).join('')}
    ${lampShade(470)}${lampShade(1130)}
    <ellipse cx="470" cy="150" rx="120" ry="50" fill="url(#robot-lamp)" opacity=".4"/><ellipse cx="1130" cy="150" rx="120" ry="50" fill="url(#robot-lamp)" opacity=".4"/>

    <!-- window -->
    <path d="${winL}" fill="none" stroke="#a5b6c8" stroke-width="14"/><path d="${winL}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4"/>
    <line x1="152" y1="86" x2="152" y2="302" stroke="#a5b6c8" stroke-width="8"/><line x1="54" y1="194" x2="250" y2="194" stroke="#a5b6c8" stroke-width="8"/>
    <rect x="38" y="304" width="228" height="16" rx="8" fill="#b9c7d6"/><rect x="38" y="304" width="228" height="5" rx="2.5" fill="#fff" opacity=".4"/>
    <g fill="#e07a5f"><rect x="78" y="272" width="38" height="32" rx="6"/></g><g fill="#7fc79a"><ellipse cx="97" cy="262" rx="12" ry="10"/><ellipse cx="86" cy="270" rx="8" ry="7"/><ellipse cx="108" cy="270" rx="8" ry="7"/></g>
    <rect x="76" y="286" width="42" height="5" rx="2" fill="#fff" opacity=".35"/>
    <!-- porthole -->
    <circle cx="1468" cy="196" r="80" fill="none" stroke="#a5b6c8" stroke-width="14"/><circle cx="1468" cy="196" r="80" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4"/>
    ${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4 + Math.PI / 8; return `<circle cx="${f(1468 + 80 * Math.cos(a))}" cy="${f(196 + 80 * Math.sin(a))}" r="4.5" fill="#8392a6"/>`; }).join('')}

    <!-- pegboard with tools -->
    <rect x="40" y="344" width="214" height="308" rx="12" fill="#c3d1de"/><rect x="40" y="344" width="214" height="308" rx="12" fill="url(#robot-peg)"/><rect x="40" y="344" width="214" height="308" rx="12" fill="none" stroke="#8fa1b5" stroke-width="5"/>
    ${[[50, 354], [244, 354], [50, 642], [244, 642]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#8392a6"/>`).join('')}
    ${tools()}

    <!-- shelves with jars of nuts and bolts -->
    ${shelf(1346, 1584, 392)}
    ${jar(1362, 392, 44, 64, 0)}${jar(1418, 392, 44, 58, 1)}${jar(1474, 392, 44, 66, 2)}${crate(1534, 42, 36, '#5b9bd5').replace(/800/g, '392')}
    ${shelf(1346, 1584, 520)}
    ${robotGear(1384, 498, 22, 9, '#9fb1c6', { hole: '#c6d3df' })}${robotGear(1428, 504, 16, 8, '#f0c85a', { hole: '#c6d3df' })}${jar(1462, 520, 44, 50, 1)}${jar(1518, 520, 44, 56, 0)}

    <!-- control panel -->
    <rect x="1352" y="552" width="228" height="82" rx="12" fill="#94a5b8"/><rect x="1352" y="552" width="228" height="82" rx="12" fill="none" stroke="#7b8da2" stroke-width="4"/>
    <rect x="1364" y="562" width="100" height="32" rx="8" fill="#4a5c73"/><path d="M1372 580 l14 -9 l12 14 l14 -16 l14 12 l14 -8 l14 10" fill="none" stroke="#8fe3b0" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
    <circle cx="1500" cy="578" r="14" fill="#e6edf3" stroke="#6f8097" stroke-width="3"/><path d="M1500 578 l8 -8" stroke="#e0564f" stroke-width="3.5" stroke-linecap="round"/><circle cx="1546" cy="578" r="14" fill="#e6edf3" stroke="#6f8097" stroke-width="3"/><path d="M1546 578 l-6 -9" stroke="#5f6f83" stroke-width="3.5" stroke-linecap="round"/>
    ${lightsArt}
    ${[[1356, 556], [1576, 556], [1356, 630], [1576, 630]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#6f8097"/>`).join('')}

    <!-- big gears, partly behind the conveyor -->
    <g opacity=".9">${robotGear(150, 832, 172, 14, '#8fa8c4', { hole: WAINS, spokes: WAINS, cls: 'robot-spin' })}${robotGear(336, 800, 62, 8, '#e6c25a', { hole: WAINS, spokes: WAINS, cls: 'robot-spin r' })}
    ${robotGear(1440, 832, 172, 16, '#8fa8c4', { hole: WAINS, spokes: WAINS, cls: 'robot-spin r' })}${robotGear(1264, 810, 58, 8, '#e6c25a', { hole: WAINS, spokes: WAINS, cls: 'robot-spin' })}</g>

    <!-- conveyor belt along the bottom -->
    <rect x="-10" y="826" width="1620" height="52" rx="14" fill="#5a687d"/>${rollers}
    <rect x="-10" y="800" width="1620" height="36" rx="16" fill="#76869b"/><rect x="-10" y="803" width="1620" height="5" rx="2.5" fill="#fff" opacity=".4"/>
    <line class="robot-belt" x1="-20" y1="822" x2="1620" y2="822" stroke="#6f7e92" stroke-width="5" stroke-dasharray="18 16" stroke-linecap="round"/>
    <rect x="0" y="872" width="1600" height="28" fill="url(#robot-haz)"/>
    ${barLights}
    ${crate(30, 56, 42, '#ff6b6b')}${crate(176, 60, 52, '#ff6b6b')}${robotGear(262, 778, 22, 8, '#f0c85a', { hole: '#8a99ab' })}
    ${crate(1330, 58, 50, '#4b9ce2')}${robotSpring(1420, 764, 16, 36, 5, '#c7d3e0')}${crate(1470, 54, 56, '#7fc79a')}${crate(1540, 40, 34, '#ff6b6b')}
  </g>
  <g class="scenery-glow">
    ${lampGlow(470)}${lampGlow(1130)}
    ${lightsGlow}${barGlow}
  </g>
</svg>`;
};

// ------------------------------------------------------------------ the home island: a small workbench with a tiny conveyor, a gear and a stool
export const robotIslandSVG = (): string => {
  const wood = '#e7bb77';
  return `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="196" cy="178" rx="190" ry="11" fill="#2f3f55" opacity=".2"/>
  <!-- legs and brace -->
  <rect x="34" y="148" width="22" height="32" rx="6" fill="#6c7a8d"/><rect x="304" y="148" width="22" height="32" rx="6" fill="#6c7a8d"/>
  <rect x="34" y="166" width="292" height="8" rx="4" fill="#8696aa"/><rect x="26" y="174" width="38" height="7" rx="3.5" fill="#566478"/><rect x="296" y="174" width="38" height="7" rx="3.5" fill="#566478"/>
  <!-- bench top -->
  <path d="M22 98 Q22 90 32 90 H328 Q338 90 338 98 L352 140 H8Z" fill="${wood}"/>
  <path d="M22 98 Q22 90 32 90 H328 Q338 90 338 98 L342 108 Q180 100 18 108Z" fill="#f3d196"/>
  <g stroke="#cf9b57" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"><path d="M60 120 Q110 116 160 120"/><path d="M200 126 Q250 122 300 126"/><path d="M120 134 Q170 131 230 134"/></g>
  <rect x="8" y="138" width="344" height="16" rx="6" fill="#c98f50"/><rect x="8" y="138" width="344" height="5" rx="2.5" fill="#fff" opacity=".3"/>
  <!-- tiny conveyor (back left) -->
  <g>
    <rect x="34" y="76" width="130" height="20" rx="10" fill="#6c7a8d"/><rect x="34" y="70" width="130" height="14" rx="7" fill="#8a99ab"/>
    <line x1="42" y1="77" x2="156" y2="77" stroke="#6f7e92" stroke-width="3" stroke-dasharray="10 9" stroke-linecap="round"/>
    <circle cx="50" cy="89" r="6" fill="#a4b2c2" stroke="#6a788b" stroke-width="2"/><circle cx="148" cy="89" r="6" fill="#a4b2c2" stroke="#6a788b" stroke-width="2"/><circle cx="99" cy="89" r="5" fill="#a4b2c2" stroke="#6a788b" stroke-width="2"/>
    <rect x="96" y="46" width="30" height="24" rx="4" fill="#d9a560"/><rect x="96" y="46" width="30" height="6" rx="3" fill="#c78d48"/><rect x="107" y="46" width="8" height="24" fill="#ff6b6b"/>
    <g transform="translate(62 60)"><circle r="9" fill="#ffe27a" stroke="#e0a100" stroke-width="2"/><rect x="-3" y="8" width="6" height="4" fill="#8c9bb0"/></g>
  </g>
  <!-- a gear standing on the bench (back right) -->
  ${robotGear(286, 58, 30, 10, '#9fb1c6', { hole: '#e7bb77' })}${robotGear(322, 78, 16, 8, '#f0c85a', { hole: '#e7bb77' })}
  <!-- bolts on the bench -->
  <g transform="translate(40 118)"><polygon points="-9,0 -4.5,-7.8 4.5,-7.8 9,0 4.5,7.8 -4.5,7.8" fill="#8d9db2"/><circle r="3.4" fill="#00000030"/></g>
  <g transform="translate(316 122)"><polygon points="-8,0 -4,-6.9 4,-6.9 8,0 4,6.9 -4,6.9" fill="#8d9db2"/><circle r="3" fill="#00000030"/></g>
  <!-- stool at the right end -->
  <g transform="translate(-10 0)">
    <line x1="364" y1="138" x2="358" y2="178" stroke="#6c7a8d" stroke-width="5" stroke-linecap="round"/><line x1="386" y1="138" x2="392" y2="178" stroke="#6c7a8d" stroke-width="5" stroke-linecap="round"/><line x1="375" y1="140" x2="375" y2="178" stroke="#566478" stroke-width="5" stroke-linecap="round"/>
    <path d="M362 160 H388" stroke="#8696aa" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="375" cy="132" rx="26" ry="9" fill="#d99a1f"/><path d="M349 132 Q349 144 375 144 Q401 144 401 132 Q401 138 375 138 Q349 138 349 132Z" fill="#b87f10"/><ellipse cx="375" cy="130" rx="26" ry="9" fill="#f4c542"/><ellipse cx="366" cy="127" rx="10" ry="3" fill="#fff" opacity=".5"/>
  </g>
</svg>`;
};
