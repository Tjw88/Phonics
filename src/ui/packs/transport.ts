import { accessorySVG, faceEyesSVG, faceMouthSVG, mixHex, zzzSVG } from '../art';
import type { CreatureDef, Pack } from './types';

// Transport Town: four chubby toy vehicles drawn front-on (the vehicle's "face" carries the shared eyes and mouth), a sunny toy-town
// backdrop and a little road-loop island. Vehicles arrive in gift crates instead of eggs.

const HY = 84;

/** Common creature shell: shadow, the vehicle's body (drawn first), then the bobbing head/face on top, then the sleep zzz. */
const shell = (body: string, head: string, growth: number): string => `<svg class="dino mood-idle" viewBox="0 -26 200 238" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="100" cy="202" rx="64" ry="9" fill="#0000001f"/>
  ${body}
  <g class="headg">
    ${head}
    ${faceEyesSVG(HY)}
    ${faceMouthSVG(HY)}
    ${accessorySVG(growth, HY)}
  </g>
  ${zzzSVG(HY)}
</svg>`;

const tyre = (x: number, y: number, w: number, h: number): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="#2b3445"/><rect x="${x + w / 2 - 2}" y="${y + 8}" width="4" height="${h - 16}" rx="2" fill="#566178"/>`;

// ---------------------------------------------------------------------------------------------------------------- fire engine
const FIRE = { main: '#ff2a3d', dark: '#c4001f', accent: '#ffd400' };
const fireSVG = (growth: number): string => {
  const { main, dark, accent } = FIRE;
  const rungs = [80, 92, 104, 116, 128, 140, 152].map((x) => `<rect x="${x}" y="22" width="4" height="9" fill="#e0a100"/>`).join('');
  const body = `
    <rect x="84" y="38" width="8" height="16" rx="2" fill="#8c0f22"/><rect x="140" y="30" width="8" height="18" rx="2" fill="#8c0f22"/>
    <g transform="rotate(-8 117 26)"><rect x="74" y="16" width="86" height="6" rx="3" fill="${accent}"/><rect x="74" y="31" width="86" height="6" rx="3" fill="${accent}"/>${rungs}</g>
    <rect x="52" y="42" width="22" height="12" rx="3" fill="#26303f"/>
    <circle cx="63" cy="35" r="17" fill="#5cb8ff" opacity=".35"><animate attributeName="opacity" values=".12;.5;.12" dur="1.4s" repeatCount="indefinite"/></circle>
    <path d="M53 44 A10 10 0 0 1 73 44Z" fill="#2d8cff"/><path d="M57 40 A7 7 0 0 1 63 34" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
    ${tyre(36, 146, 24, 48)}${tyre(140, 146, 24, 48)}
    <rect x="48" y="108" width="104" height="72" rx="16" fill="#8c0f22"/>
    <rect x="44" y="128" width="112" height="26" rx="11" fill="#b8c2d4"/><rect x="44" y="128" width="112" height="22" rx="11" fill="#e6ecf5"/>
    <circle cx="61" cy="140" r="9" fill="#fff3b0" stroke="${accent}" stroke-width="3"/><circle cx="139" cy="140" r="9" fill="#fff3b0" stroke="${accent}" stroke-width="3"/>
    <circle cx="58" cy="137" r="3" fill="#fff"/><circle cx="136" cy="137" r="3" fill="#fff"/>
    <rect x="86" y="135" width="28" height="13" rx="4" fill="${accent}"/><rect x="90" y="139" width="20" height="5" rx="2.5" fill="#e0a100" opacity=".55"/>`;
  const head = `
    <rect x="54" y="42" width="92" height="90" rx="30" fill="${main}"/>
    <path d="M70 54 Q80 47 94 47" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".45"/>
    <path d="M56 122 Q58 132 84 132 H116 Q142 132 144 122 Q124 126 100 126 Q76 126 56 122Z" fill="${dark}"/>`;
  return shell(body, head, growth);
};

// ---------------------------------------------------------------------------------------------------------------- digger
const DIGGER = { main: '#ffd400', dark: '#e09b00', accent: '#ff7a1a' };
const diggerSVG = (growth: number): string => {
  const { main, dark } = DIGGER;
  const treads = (x: number) => [148, 158, 168, 178, 188].map((y) => `<rect x="${x + 6}" y="${y}" width="22" height="4" rx="2" fill="#5b6679"/>`).join('');
  const body = `
    <g class="tail"><circle cx="64" cy="8" r="8" fill="#eef1f6"/><circle cx="52" cy="-3" r="9" fill="#f6f8fb"/><circle cx="66" cy="-14" r="8" fill="#eef1f6"/></g>
    <rect x="61" y="18" width="10" height="30" rx="3" fill="#55627a"/><rect x="58" y="14" width="16" height="8" rx="3" fill="#3a4256"/>
    <path d="M146 112 L170 86" stroke="#8793a8" stroke-width="5" stroke-linecap="round"/>
    <path d="M138 140 L176 92" stroke="${dark}" stroke-width="15" stroke-linecap="round" fill="none"/>
    <path d="M176 92 L172 44" stroke="${dark}" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M160 26 Q160 20 166 20 L186 20 Q192 20 191 27 Q187 52 166 56 Q158 57 160 48Z" fill="#8793a8"/>
    <path d="M168 28 H184 Q182 46 168 50Z" fill="#6a768c"/>
    <path d="M160 26 L149 30 L160 35Z M160 38 L149 42 L160 47Z" fill="#55627a"/>
    <circle cx="176" cy="92" r="8" fill="#55627a"/><circle cx="176" cy="92" r="3" fill="#aab4c6"/>
    <rect x="26" y="136" width="38" height="62" rx="16" fill="#3a4256"/><rect x="136" y="136" width="38" height="62" rx="16" fill="#3a4256"/>
    ${treads(26)}${treads(136)}
    <rect x="50" y="122" width="100" height="62" rx="16" fill="${dark}"/>
    <rect x="56" y="136" width="88" height="40" rx="12" fill="${mixHex(dark, '#ffffff', 0.18)}"/>
    <circle cx="68" cy="148" r="8" fill="#fff3b0" stroke="#3a4256" stroke-width="3"/><circle cx="132" cy="148" r="8" fill="#fff3b0" stroke="#3a4256" stroke-width="3"/>
    <rect x="86" y="142" width="28" height="22" rx="6" fill="#3a4256"/><path d="M92 148 V158 M100 148 V158 M108 148 V158" stroke="#7b8aa3" stroke-width="3" stroke-linecap="round"/>`;
  const head = `
    <rect x="50" y="36" width="100" height="14" rx="7" fill="${dark}"/>
    <rect x="54" y="44" width="92" height="88" rx="26" fill="${main}"/>
    <rect x="62" y="52" width="76" height="76" rx="22" fill="${mixHex(main, '#ffffff', 0.42)}" stroke="${dark}" stroke-width="3"/>`;
  return shell(body, head, growth);
};

// ---------------------------------------------------------------------------------------------------------------- steam train
const TRAIN = { main: '#1f7bff', dark: '#0a49c9', accent: '#ffe14d' };
const trainSVG = (growth: number): string => {
  const { main, dark, accent } = TRAIN;
  const rivets = Array.from({ length: 9 }, (_, i) => {
    const a = ((-170 + i * 20) * Math.PI) / 180;
    return `<circle cx="${(100 + 44.5 * Math.cos(a)).toFixed(1)}" cy="${(HY + 44.5 * Math.sin(a)).toFixed(1)}" r="2.4" fill="#d4e6ff"/>`;
  }).join('');
  const bars = [[72, 62], [86, 81], [100, 100], [114, 119], [128, 138]].map(([a, b]) => `<path d="M${a} 152 L${b} 184" stroke="#c99600" stroke-width="4" stroke-linecap="round"/>`).join('');
  const body = `
    <rect x="22" y="196" width="156" height="8" rx="4" fill="#a98558"/><rect x="34" y="188" width="132" height="6" rx="3" fill="#bf9a68"/>
    <path d="M64 188 L56 208 M136 188 L144 208" stroke="#9aa5b8" stroke-width="5" stroke-linecap="round"/>
    <g class="tail"><circle cx="64" cy="4" r="8" fill="#eef3fb"/><circle cx="52" cy="-8" r="9" fill="#f6f9fe"/><circle cx="66" cy="-18" r="8" fill="#eef3fb"/></g>
    <path d="M69 46 L71 16 H85 L87 46Z" fill="#3a4256"/><path d="M62 18 Q78 8 94 18 L92 26 Q78 20 64 26Z" fill="#26303f"/><rect x="70" y="30" width="16" height="4" fill="${accent}"/>
    <circle cx="40" cy="168" r="22" fill="#2b3445"/><circle cx="160" cy="168" r="22" fill="#2b3445"/>
    <circle cx="40" cy="168" r="9" fill="#ff5a6a"/><circle cx="160" cy="168" r="9" fill="#ff5a6a"/><circle cx="37" cy="165" r="3" fill="#fff" opacity=".8"/><circle cx="157" cy="165" r="3" fill="#fff" opacity=".8"/>
    <rect x="48" y="120" width="104" height="58" rx="14" fill="${dark}"/>
    <path d="M64 150 H136 L148 188 H52Z" fill="${accent}" stroke="#c99600" stroke-width="4" stroke-linejoin="round"/>${bars}
    <rect x="52" y="138" width="9" height="12" rx="3" fill="#9aa5b8"/><rect x="139" y="138" width="9" height="12" rx="3" fill="#9aa5b8"/>
    <circle cx="56" cy="136" r="9" fill="#ef476f"/><circle cx="144" cy="136" r="9" fill="#ef476f"/><circle cx="53" cy="133" r="3" fill="#fff" opacity=".7"/><circle cx="141" cy="133" r="3" fill="#fff" opacity=".7"/>`;
  const head = `
    <circle cx="100" cy="${HY}" r="47" fill="${dark}"/>${rivets}
    <circle cx="100" cy="${HY}" r="42" fill="${main}"/>
    <path d="M72 58 Q82 50 94 49" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".4"/>`;
  return shell(body, head, growth);
};

// ---------------------------------------------------------------------------------------------------------------- aeroplane
const PLANE = { main: '#1fd655', dark: '#0a9b3a', accent: '#ff8a1f' };
const planeSVG = (growth: number): string => {
  const { main, dark, accent } = PLANE;
  const body = `
    <g class="tail"><path d="M88 54 L92 16 Q93 8 102 8 H108 Q115 8 113 17 L112 54Z" fill="${dark}"/><path d="M92 16 Q93 8 102 8 H108 Q115 8 113 17Z" fill="${accent}"/><path d="M97 22 V44" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".3"/></g>
    <g transform="rotate(-20 100 ${HY})"><rect x="26" y="${HY - 9}" width="148" height="18" rx="9" fill="#26303f"/><rect x="26" y="${HY - 9}" width="22" height="18" rx="9" fill="${accent}"/><rect x="152" y="${HY - 9}" width="22" height="18" rx="9" fill="${accent}"/>
      <animateTransform attributeName="transform" type="rotate" values="-20 100 ${HY};-13 100 ${HY};-20 100 ${HY}" dur="1.1s" repeatCount="indefinite"/></g>
    <path d="M72 126 L18 118 Q2 116 2 131 Q2 146 18 147 L72 154Z" fill="${dark}"/><path d="M128 126 L182 118 Q198 116 198 131 Q198 146 182 147 L128 154Z" fill="${dark}"/>
    <path d="M18 118.5 L10 117.5 Q2 118 2 131 Q2 145 10 146 L18 146.5Z" fill="${accent}"/><path d="M182 118.5 L190 117.5 Q198 118 198 131 Q198 145 190 146 L182 146.5Z" fill="${accent}"/>
    <path d="M28 124 L66 130" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/><path d="M172 124 L134 130" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>
    <rect x="49" y="150" width="7" height="32" rx="3" fill="#566178"/><rect x="144" y="150" width="7" height="32" rx="3" fill="#566178"/>
    <circle cx="52" cy="186" r="12" fill="#2b3445"/><circle cx="148" cy="186" r="12" fill="#2b3445"/><circle cx="52" cy="186" r="4.5" fill="#cfd6e4"/><circle cx="148" cy="186" r="4.5" fill="#cfd6e4"/>
    <ellipse cx="100" cy="150" rx="38" ry="40" fill="${main}"/><path d="M70 172 Q100 190 130 172 Q128 186 100 188 Q72 186 70 172Z" fill="${dark}" opacity=".5"/>`;
  const head = `
    <circle cx="100" cy="${HY}" r="47" fill="${dark}"/>
    <circle cx="100" cy="${HY}" r="42" fill="${main}"/>
    <path d="M72 58 Q82 50 94 49" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".4"/>`;
  return shell(body, head, growth);
};

// ---------------------------------------------------------------------------------------------------------------- the gift crate
const starPts = (cx: number, cy: number, r: number): string =>
  Array.from({ length: 10 }, (_, i) => {
    const rad = i % 2 ? r * 0.45 : r;
    const a = ((-90 + i * 36) * Math.PI) / 180;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

const crateSVG = (main: string, dark: string): string => {
  const hi = mixHex(main, '#ffffff', 0.45);
  const star = (x: number, y: number, r: number) => `<polygon points="${starPts(x, y + 1.5, r)}" fill="#8a5a28" opacity=".35"/><polygon points="${starPts(x, y, r)}" fill="#fff8e6"/>`;
  return `<svg class="egg-art" viewBox="0 0 120 150" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="60" cy="142" rx="46" ry="7" fill="#0000002b"/>
  <rect x="14" y="56" width="92" height="82" rx="8" fill="#9a6830"/>
  <rect x="18" y="60" width="84" height="23" rx="4" fill="#e2b074"/><rect x="18" y="85" width="84" height="23" rx="4" fill="#e2b074"/><rect x="18" y="110" width="84" height="24" rx="4" fill="#e2b074"/>
  <path d="M22 64 H96 M22 89 H96 M22 114 H96" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".28"/>
  <rect x="14" y="56" width="12" height="82" rx="5" fill="#bf8844"/><rect x="94" y="56" width="12" height="82" rx="5" fill="#bf8844"/>
  <circle cx="20" cy="66" r="2.2" fill="#6d4519"/><circle cx="20" cy="128" r="2.2" fill="#6d4519"/><circle cx="100" cy="66" r="2.2" fill="#6d4519"/><circle cx="100" cy="128" r="2.2" fill="#6d4519"/>
  ${star(36, 72, 7)}${star(86, 72, 7)}${star(86, 121, 7)}${star(36, 121, 7)}${star(32, 97, 5)}${star(88, 97, 5)}
  <rect x="8" y="42" width="104" height="22" rx="7" fill="#c48f4d"/><rect x="8" y="42" width="104" height="10" rx="5" fill="#d9a766"/><rect x="8" y="60" width="104" height="4" rx="2" fill="#8a5a28" opacity=".5"/>
  <rect x="14" y="86" width="92" height="16" fill="${dark}"/><rect x="14" y="86" width="92" height="12" fill="${main}"/><rect x="14" y="88" width="92" height="3" fill="${hi}" opacity=".7"/>
  <rect x="49" y="42" width="22" height="96" fill="${dark}"/><rect x="49" y="42" width="18" height="96" fill="${main}"/><rect x="52" y="44" width="4" height="92" fill="${hi}" opacity=".7"/>
  <path d="M60 40 Q36 8 34 26 Q34 42 60 40Z" fill="${main}"/><path d="M60 40 Q84 8 86 26 Q86 42 60 40Z" fill="${main}"/>
  <path d="M60 40 Q44 22 41 28" stroke="${hi}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/><path d="M60 40 Q76 22 79 28" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
  <path d="M56 46 L48 64 L58 60Z" fill="${dark}"/><path d="M64 46 L72 64 L62 60Z" fill="${dark}"/>
  <circle cx="60" cy="40" r="8" fill="${main}"/><circle cx="57.5" cy="37.5" r="3" fill="${hi}"/>
</svg>`;
};

const make = (id: string, label: string, col: { main: string; dark: string; accent: string }, svg: (g: number) => string): CreatureDef => ({
  id, label, main: col.main, dark: col.dark, accent: col.accent, hy: HY, svg, egg: () => crateSVG(col.main, col.dark),
});

// ---------------------------------------------------------------------------------------------------------------- the backdrop
/** Where a pixel on the line from (x0,y0) to (x1,y1) sits at t (0..1). */
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const sceneSVG = (): string => {
  const glow: string[] = [];
  /** a window: a pale pane by day, plus a warm lit copy in the (undimmed) glow group for night */
  const win = (x: number, y: number, w: number, h: number, r = 3): string => {
    glow.push(`<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="${r + 2}" fill="#ffe08a" opacity=".38"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#ffe27a"/>`);
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#d6ecf8"/><rect x="${x}" y="${y + h / 2 - 0.75}" width="${w}" height="1.5" fill="#fff" opacity=".7"/>`;
  };
  const lamp = (x: number, y: number): string => {
    glow.push(`<circle cx="${x}" cy="${y - 44}" r="30" fill="#ffe08a" opacity=".3"/><circle cx="${x}" cy="${y - 44}" r="14" fill="#ffe08a" opacity=".5"/><circle cx="${x}" cy="${y - 44}" r="7" fill="#fff3b0"/>`);
    return `<rect x="${x - 2}" y="${y - 40}" width="4" height="40" rx="2" fill="#9aa5b8"/><circle cx="${x}" cy="${y - 44}" r="7" fill="#fff8d6" stroke="#9aa5b8" stroke-width="2.5"/>`;
  };
  const car = (x: number, y: number, c: string, flip = false): string => `<g transform="translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}">
    <ellipse cx="0" cy="11" rx="31" ry="4" fill="#0000001a"/><rect x="-28" y="-8" width="56" height="18" rx="8" fill="${c}"/>
    <path d="M-14 -8 Q-12 -23 -2 -23 L10 -23 Q18 -23 20 -8Z" fill="${c}"/><path d="M-10 -9 Q-9 -19 -2 -19 H2 V-9Z M6 -9 V-19 H10 Q15 -19 16 -9Z" fill="#e3f3fc"/>
    <circle cx="-16" cy="10" r="7.5" fill="#3a4256"/><circle cx="16" cy="10" r="7.5" fill="#3a4256"/><circle cx="-16" cy="10" r="3" fill="#d4dbe8"/><circle cx="16" cy="10" r="3" fill="#d4dbe8"/>
    <circle cx="26" cy="-1" r="2.6" fill="#fff3b0"/></g>`;
  const tinyCar = (x: number, y: number, c: string, ang: number): string => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang})"><rect x="-9" y="-5" width="18" height="7" rx="3" fill="${c}"/><rect x="-4" y="-9" width="9" height="6" rx="2.5" fill="${c}"/><circle cx="-5" cy="2.5" r="2.4" fill="#4a5568"/><circle cx="5" cy="2.5" r="2.4" fill="#4a5568"/></g>`;
  const tree = (x: number, y: number, r: number, c = '#86cf9a'): string => `<rect x="${x - 3}" y="${y}" width="6" height="${r * 0.9}" rx="3" fill="#b88a5a"/><circle cx="${x}" cy="${y - r * 0.2}" r="${r}" fill="${c}"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.5}" r="${r * 0.35}" fill="#fff" opacity=".22"/>`;
  const bush = (x: number, y: number, s = 1): string => `<g transform="translate(${x} ${y}) scale(${s})" fill="#6cbd86"><circle cx="-16" cy="0" r="14"/><circle cx="0" cy="-6" r="18"/><circle cx="17" cy="0" r="13"/></g>`;
  const flower = (x: number, y: number, c: string): string => `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/><circle cx="${x}" cy="${y}" r="2" fill="#fff6c9"/>`;

  // viaduct (far left) with a tiny train
  const piers = Array.from({ length: 8 }, (_, i) => {
    const x = 20 + i * 64;
    return `<rect x="${x - 7}" y="508" width="14" height="70" fill="#cdd7e8"/><path d="M${x + 7} 512 Q${x + 25} 550 ${x + 57} 512Z" fill="#c4cfe2"/>`;
  }).join('');
  const trainCols = ['#ff8fa3', '#ffd166', '#8fd3ff', '#9be08f', '#c4a8ff'];
  const miniTrain = trainCols.map((c, i) => `<rect x="${60 + i * 34}" y="${i === 0 ? 484 : 486}" width="31" height="${i === 0 ? 18 : 16}" rx="5" fill="${c}"/><rect x="${64 + i * 34}" y="490" width="7" height="6" rx="2" fill="#fff" opacity=".85"/><rect x="${75 + i * 34}" y="490" width="7" height="6" rx="2" fill="#fff" opacity=".85"/>`).join('')
    + `<rect x="${60}" y="476" width="7" height="10" rx="2" fill="#7a869c"/>`;

  // far road on the right hill with tiny cars
  const farCars = [0.12, 0.36, 0.62, 0.86].map((t, i) => tinyCar(lerp(1190, 1600, t), lerp(559, 521, t) - 3, ['#ff8fa3', '#8fd3ff', '#ffd166', '#9be08f'][i] as string, -5.3)).join('');
  const farHouses = [[1210, 548, 24, '#e8c9b4'], [1250, 551, 20, '#d3e0f0'], [1290, 540, 26, '#f0d9a8']].map(([x, y, w, c]) => `<rect x="${x}" y="${(y as number) - 16}" width="${w}" height="16" rx="3" fill="${c}"/><path d="M${(x as number) - 3} ${(y as number) - 15} L${(x as number) + (w as number) / 2} ${(y as number) - 29} L${(x as number) + (w as number) + 3} ${(y as number) - 15}Z" fill="#e3a79c"/>`).join('');

  // left cluster: station + clock tower + house
  const station = `
    <rect x="22" y="618" width="136" height="74" rx="6" fill="#fff0d4"/>
    <path d="M12 622 L90 574 L168 622Z" fill="#ef9a8f"/><path d="M26 622 L90 583 L154 622Z" fill="#f6b4a8"/>
    <circle cx="90" cy="604" r="10" fill="#fff" stroke="#e0cfa8" stroke-width="3"/><path d="M90 604 V598 M90 604 H95" stroke="#8a7a5a" stroke-width="2" stroke-linecap="round"/>
    ${win(36, 640, 18, 24)}${win(64, 640, 18, 24)}${win(98, 640, 18, 24)}
    <rect x="124" y="654" width="24" height="38" rx="4" fill="#a8c8e8"/><rect x="128" y="658" width="16" height="12" rx="3" fill="#d6ecf8"/>
    <rect x="8" y="632" width="162" height="7" rx="3.5" fill="#c9d4e6"/>
    <rect x="152" y="542" width="46" height="150" rx="4" fill="#f6e3c4"/><path d="M146 546 L175 498 L204 546Z" fill="#8cc0ea"/><path d="M175 498 V484" stroke="#8a7a5a" stroke-width="3" stroke-linecap="round"/><path d="M175 484 l16 5 l-16 5z" fill="#ef6b6b"/>
    <circle cx="175" cy="578" r="16" fill="#fff" stroke="#d9c9a4" stroke-width="3.5"/><path d="M175 578 V567 M175 578 L184 583" stroke="#6a7288" stroke-width="3" stroke-linecap="round"/>
    ${win(166, 624, 18, 26)}${win(166, 662, 18, 22)}
    <rect x="0" y="686" width="248" height="9" rx="4" fill="#d9d2c6"/>`;
  glow.push(`<circle cx="175" cy="578" r="20" fill="#ffe08a" opacity=".4"/><circle cx="175" cy="578" r="14" fill="#fff3b0"/><path d="M175 578 V567 M175 578 L184 583" stroke="#8a7a5a" stroke-width="3" stroke-linecap="round"/>`);
  const houseA = `<rect x="214" y="648" width="70" height="44" rx="5" fill="#fde9d2"/><path d="M206 650 L249 612 L292 650Z" fill="#f5a38c"/><rect x="266" y="618" width="10" height="20" rx="2" fill="#d98a76"/>
    ${win(226, 660, 16, 16)}${win(256, 660, 16, 16)}<rect x="242" y="664" width="14" height="28" rx="3" fill="#c9a27a"/>`;

  // right cluster: house, shop with a striped awning, windmill
  const houseB = `<rect x="1288" y="648" width="64" height="44" rx="5" fill="#e6f0fb"/><path d="M1280 650 L1320 614 L1360 650Z" fill="#8cc0ea"/><rect x="1336" y="622" width="9" height="18" rx="2" fill="#6fa6d6"/>
    ${win(1298, 660, 14, 16)}${win(1326, 660, 14, 16)}`;
  const awn = Array.from({ length: 8 }, (_, i) => `<rect x="${1366 + i * 15}" y="624" width="15" height="22" fill="${i % 2 ? '#ffffff' : '#f27b7b'}"/><circle cx="${1373.5 + i * 15}" cy="646" r="7.5" fill="${i % 2 ? '#ffffff' : '#f27b7b'}"/>`).join('');
  const shop = `<rect x="1372" y="596" width="108" height="96" rx="6" fill="#fde4c4"/><rect x="1366" y="584" width="120" height="16" rx="7" fill="#e8c29a"/>
    <rect x="1396" y="602" width="60" height="18" rx="6" fill="#fff" stroke="#f27b7b" stroke-width="3"/><circle cx="1426" cy="611" r="4" fill="#f27b7b"/>
    ${awn}${win(1384, 658, 50, 34, 5)}<rect x="1444" y="656" width="26" height="36" rx="4" fill="#a8c8e8"/><rect x="1449" y="661" width="16" height="16" rx="3" fill="#d6ecf8"/>`;
  glow.push(`<rect x="1441" y="653" width="32" height="42" rx="6" fill="#ffe08a" opacity=".3"/><rect x="1449" y="661" width="16" height="16" rx="3" fill="#ffe27a"/>`);
  const blades = [0, 90, 180, 270].map((a) => `<g transform="rotate(${a})"><rect x="-4" y="-62" width="8" height="58" rx="3" fill="#c9a27a"/><rect x="2" y="-60" width="17" height="44" rx="3" fill="#fffaf0" stroke="#d9c4a4" stroke-width="2.5"/><path d="M5 -48 H17 M5 -38 H17 M5 -28 H17" stroke="#e5d6bb" stroke-width="2"/></g>`).join('');
  const mill = `<path d="M1506 692 L1518 596 L1562 596 L1574 692Z" fill="#fff0d4"/><path d="M1510 598 Q1540 556 1570 598Z" fill="#c9a27a"/>
    <g transform="translate(1540 584) rotate(14)">${blades}<circle r="8" fill="#a8825a"/></g>
    ${win(1530, 626, 20, 20, 10)}<rect x="1530" y="660" width="20" height="32" rx="4" fill="#c9a27a"/>`;

  // bottom road: pavement, road, zebra crossing, cars, lamps; stream and a little bridge on the right
  const zebra = Array.from({ length: 7 }, (_, i) => { const x = 1010 + i * 20; return `<path d="M${x} 822 H${x + 11} L${x + 6} 880 H${x - 5}Z" fill="#fff" opacity=".92"/>`; }).join('');
  const dash = `<path d="M-10 851 H1610" stroke="#f7f9fc" stroke-width="4" stroke-dasharray="26 20" fill="none" opacity=".85"/>`;

  const sunRays = Array.from({ length: 12 }, (_, i) => `<rect x="-5" y="-108" width="10" height="32" rx="5" fill="#ffe27a" transform="rotate(${i * 30})"/>`).join('');
  const stars = [[160, 90, 4], [420, 160, 3], [700, 70, 4], [980, 140, 3], [1180, 60, 3], [260, 260, 3], [840, 250, 4], [560, 320, 3], [1450, 290, 3], [90, 330, 3], [1100, 230, 3], [330, 60, 3]]
    .map(([x, y, r], i) => `<circle class="tw tw${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`).join('');

  const scenery = `
  <rect x="0" y="498" width="520" height="12" rx="4" fill="#bfcbe0"/>${piers}${miniTrain}
  <path d="M0 560 Q200 500 420 548 T820 530 T1240 548 T1600 505 V900 H0Z" fill="#cfe9dc"/>
  <path d="M1190 566 L1600 528" stroke="#e1e6ec" stroke-width="9" stroke-linecap="round"/>${farHouses}${farCars}
  <path d="M0 640 Q260 575 520 635 T1040 625 T1600 595 V900 H0Z" fill="#b4e0bd"/>
  ${tree(318, 652, 17)}${tree(1496, 660, 15, '#7fc895')}${tree(1372, 668, 12, '#8fd1a0')}
  ${station}${houseA}${houseB}${shop}${mill}
  <path d="M0 740 Q300 690 600 740 T1200 735 T1600 710 V900 H0Z" fill="#8fd3a0"/>
  <path d="M1462 706 Q1448 760 1418 830 H1564 Q1524 760 1492 706Z" fill="#a6dbef"/><path d="M1470 724 Q1462 760 1446 800" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".5"/>
  ${bush(30, 770, 1.1)}${bush(352, 780, 0.9)}${bush(1330, 782, 0.9)}${bush(1590, 770, 1.1)}
  ${flower(96, 790, '#ff9fb8')}${flower(128, 780, '#ffd166')}${flower(250, 796, '#ff9fb8')}${flower(300, 786, '#c4a8ff')}${flower(1290, 792, '#ffd166')}${flower(1250, 782, '#ff9fb8')}${flower(1560, 796, '#c4a8ff')}
  <rect x="-10" y="808" width="1620" height="12" fill="#e6e3da"/>
  <rect x="-10" y="818" width="1620" height="66" fill="#bcc4d3"/><rect x="-10" y="884" width="1620" height="5" fill="#d8d4cb"/>
  ${dash}${zebra}
  ${lamp(430, 810)}${lamp(900, 810)}${lamp(1240, 810)}
  ${car(540, 838, '#ff6b6b')}${car(790, 868, '#ffcc33', true)}${car(1290, 868, '#5aa9ff', true)}${car(1170, 838, '#7ed989')}
  <path d="M1385 818 V884 H1575 V818 Q1530 786 1480 786 Q1430 786 1385 818Z" fill="#ddd3c3"/>
  <path d="M1432 884 Q1432 834 1480 834 Q1528 834 1528 884Z" fill="#a6dbef"/>
  <path d="M1385 818 Q1430 786 1480 786 Q1530 786 1575 818" stroke="#c4b8a4" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M1400 826 H1424 M1536 826 H1560 M1396 846 H1418 M1542 846 H1564" stroke="#cbbfa9" stroke-width="3" stroke-linecap="round"/>`;

  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="tp-sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6e1ff"/><stop offset="1" stop-color="#f4fbef"/></linearGradient>
    <linearGradient id="tp-sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2a5a"/><stop offset="1" stop-color="#4b5fa3"/></linearGradient>
  </defs>
  <style>.scenery-glow{transition:opacity 1.2s}.night #scene-bg .scenery-glow,body.night #scene-bg .scenery-glow{opacity:1}</style>
  <rect class="sky-day" width="1600" height="900" fill="url(#tp-sky-d)"/>
  <rect class="sky-night" width="1600" height="900" fill="url(#tp-sky-n)"/>
  <g class="sun"><g transform="translate(1440 130)"><g class="rays">${sunRays}</g></g><circle cx="1440" cy="130" r="56" fill="#ffd54a"/></g>
  <g class="moon"><circle cx="1440" cy="130" r="50" fill="#fff6c9"/><circle cx="1424" cy="116" r="9" fill="#efe4a6"/><circle cx="1458" cy="146" r="6" fill="#efe4a6"/><circle cx="1452" cy="112" r="4" fill="#efe4a6"/></g>
  <g class="stars" fill="#fff">${stars}</g>
  <g class="cloud c1" fill="#fff" opacity=".9"><ellipse cx="250" cy="160" rx="90" ry="28"/><ellipse cx="310" cy="140" rx="58" ry="30"/><ellipse cx="200" cy="146" rx="48" ry="24"/></g>
  <g class="cloud c2" fill="#fff" opacity=".8"><ellipse cx="900" cy="100" rx="80" ry="26"/><ellipse cx="950" cy="82" rx="52" ry="28"/><ellipse cx="860" cy="88" rx="44" ry="22"/></g>
  <g class="cloud c3" fill="#fff" opacity=".7"><ellipse cx="1180" cy="270" rx="70" ry="22"/><ellipse cx="1220" cy="254" rx="44" ry="24"/></g>
  <g class="scenery">${scenery}
  </g>
  <g class="scenery-glow" opacity="0">${glow.join('')}</g>
</svg>`;
};

// ---------------------------------------------------------------------------------------------------------------- the island
const islandSVG = (): string => `<svg class="island-art" viewBox="0 0 400 190" role="img" aria-hidden="true" focusable="false">
  <ellipse cx="200" cy="174" rx="190" ry="13" fill="#00000018"/>
  <path d="M14 138 Q24 80 120 74 L280 74 Q376 80 386 138 Q386 174 200 176 Q14 174 14 138Z" fill="#c89b66"/>
  <path d="M14 134 Q24 76 120 70 L280 70 Q376 76 386 134 Q386 160 200 162 Q14 160 14 134Z" fill="#7bd389"/>
  <path d="M40 112 Q60 78 130 74 L270 74 Q340 78 360 112 Q300 98 200 98 Q100 98 40 112Z" fill="#92e0a0" opacity=".7"/>
  <ellipse cx="200" cy="128" rx="132" ry="23" fill="none" stroke="#b9b2a2" stroke-width="17"/>
  <ellipse cx="200" cy="128" rx="132" ry="23" fill="none" stroke="#e1dccf" stroke-width="12"/>
  <ellipse cx="200" cy="128" rx="132" ry="23" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="10 9" opacity=".9"/>
  <g><rect x="150" y="62" width="6" height="14" rx="3" fill="#b88a5a"/><circle cx="153" cy="52" r="17" fill="#5fc27a"/><circle cx="146" cy="45" r="6" fill="#fff" opacity=".25"/></g>
  <rect x="56" y="58" width="58" height="42" rx="5" fill="#fff0d4"/><path d="M48 60 L85 30 L122 60Z" fill="#ef7c6b"/><path d="M60 60 L85 40 L110 60Z" fill="#f59a8b"/>
  <rect x="100" y="32" width="9" height="16" rx="2" fill="#d96b5a"/>
  <rect x="78" y="74" width="14" height="26" rx="4" fill="#9c6b3a"/><rect x="62" y="68" width="12" height="12" rx="3" fill="#bfe3fa"/><rect x="98" y="68" width="12" height="12" rx="3" fill="#bfe3fa"/>
  <rect x="318" y="66" width="6" height="44" rx="3" fill="#9c6b3a"/>
  <path d="M296 70 H340 L350 78 L340 86 H296Z" fill="#ffd166"/><path d="M346 92 H304 L294 100 L304 108 H346Z" fill="#5bc0f0"/>
  <circle cx="306" cy="78" r="3" fill="#fff" opacity=".8"/><circle cx="334" cy="100" r="3" fill="#fff" opacity=".8"/>
  <circle cx="40" cy="132" r="4.5" fill="#ff9fb8"/><circle cx="52" cy="140" r="4.5" fill="#ffd166"/><circle cx="352" cy="136" r="4.5" fill="#ff9fb8"/><circle cx="364" cy="128" r="4.5" fill="#c4a8ff"/><circle cx="262" cy="86" r="4" fill="#ffd166"/>
</svg>`;

export const pack: Pack = {
  id: 'transport',
  name: 'Transport Town',
  blurb: 'Little vehicles in a busy toy town',
  arrival: 'crate',
  defaultName: 'Digger',
  creatures: [
    make('transport-fire', 'red fire engine crate', FIRE, fireSVG),
    make('transport-digger', 'yellow digger crate', DIGGER, diggerSVG),
    make('transport-train', 'blue steam train crate', TRAIN, trainSVG),
    make('transport-plane', 'green aeroplane crate', PLANE, planeSVG),
  ],
  scene: sceneSVG,
  island: islandSVG,
};
