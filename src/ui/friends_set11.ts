import { cheeks, eyes, face } from './friendKit';

// Sound-friends of set(s) ow oi ear air er. Each entry is an SVG fragment (viewBox 0 0 120 120) in the style of the existing friends.
const r1 = (n: number): number => Math.round(n * 10) / 10;
// Hairy's bristles: two staggered rows of pin-tipped pegs (round pink tips) standing in a bristle bed above the pad.
const pegRow = (y: number, h: number, xs: number[], tip: string): string => xs.map((x) =>
  `<path d="M${x} ${y} V${y - h}" stroke="#2fa7c2" stroke-width="4.6" stroke-linecap="round"/><circle cx="${x}" cy="${y - h}" r="3.6" fill="${tip}"/><circle cx="${x - 0.9}" cy="${y - h - 0.9}" r="1.2" fill="#fff"/>`).join('');
const bristles =
  `<ellipse cx="60" cy="42" rx="40" ry="10" fill="#1f8aa3"/>` +
  pegRow(46, 27, [27, 38, 49, 60, 71, 82, 93], '#ffd6e2');

// Fern's fronds: a cubic stem with pairs of leaflets fanning out along it, shrinking towards the tip.
type Pt = [number, number];
const frond = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, dark: string, light: string, n = 7, big = 13, small = 4.5): string => {
  const at = (t: number): Pt => {
    const u = 1 - t;
    const f = (i: 0 | 1): number => u ** 3 * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t ** 3 * p3[i];
    return [f(0), f(1)];
  };
  let leaves = '';
  for (let k = 0; k < n; k++) {
    const t = 0.34 + (0.62 * k) / (n - 1);
    const a = at(t - 0.02), b = at(t + 0.02);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const len = big + (small - big) * (k / (n - 1));
    for (const side of [-1, 1]) {
      const d = ang + side * 1.0;
      const cx = at(t)[0] + Math.cos(d) * len * 0.5, cy = at(t)[1] + Math.sin(d) * len * 0.5;
      leaves += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(len / 2)}" ry="${r1(3.4 - k * 0.12)}" fill="${side < 0 ? dark : light}" transform="rotate(${r1((d * 180) / Math.PI)} ${r1(cx)} ${r1(cy)})"/>`;
    }
  }
  const tip = at(1);
  leaves += `<ellipse cx="${r1(tip[0])}" cy="${r1(tip[1])}" rx="3" ry="2.6" fill="${light}"/>`;
  return `<path d="M${p0} C${p1} ${p2} ${p3}" stroke="#2f8a43" stroke-width="2.6" fill="none" stroke-linecap="round"/>${leaves}`;
};
const mirror = (p: Pt): Pt => [120 - p[0], p[1]];
const fronds = [
  [[50, 76], [24, 78], [6, 62], [6, 38], '#2f8a43', '#3c9a4b'],
  [[54, 72], [30, 58], [18, 34], [32, 12], '#3c9a4b', '#4cb25c'],
].map(([a, b, c, d, dk, lt]) => frond(a as Pt, b as Pt, c as Pt, d as Pt, dk as string, lt as string) +
  frond(mirror(a as Pt), mirror(b as Pt), mirror(c as Pt), mirror(d as Pt), lt as string, dk as string)).join('') +
  frond([60, 70], [54, 44], [58, 22], [72, 6], '#4cb25c', '#6fd37e', 7, 14, 5);

export const FRIENDS_SET11: Record<string, string> = {
  // ow: Howie the owl, round and fluffy, hooting
  ow: `<path d="M104 30 q9 8 0 18 M112 22 q15 17 0 34" stroke="#ffb703" stroke-width="3.6" fill="none" stroke-linecap="round"/>
     <path d="M12 38 q-8 -6 -9 -14 M20 30 q-12 -8 -13 -20" stroke="#ffb703" stroke-width="3.6" fill="none" stroke-linecap="round"/>
     <path d="M24 44 L20 12 L48 28Z M96 44 L100 12 L72 28Z" fill="#8a5a2b"/><path d="M28 38 L25 21 L41 30Z M92 38 L95 21 L79 30Z" fill="#d9a066"/>
     <ellipse cx="60" cy="72" rx="42" ry="42" fill="#8a5a2b"/><ellipse cx="60" cy="70" rx="42" ry="41" fill="#b8793a"/>
     <path d="M18 66 Q8 94 30 104 Q38 86 34 66Z" fill="#8a5a2b"/><path d="M102 66 Q112 94 90 104 Q82 86 86 66Z" fill="#8a5a2b"/>
     <ellipse cx="60" cy="90" rx="24" ry="24" fill="#fff3d6"/>
     <path d="M48 84 q6 6 12 0 q6 6 12 0 M42 96 q6 6 12 0 q6 6 12 0 M50 106 q6 5 10 0 q6 5 10 0" stroke="#e8c48a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
     <circle cx="43" cy="52" r="17" fill="#fff3d6"/><circle cx="77" cy="52" r="17" fill="#fff3d6"/><circle cx="43" cy="52" r="17" fill="none" stroke="#d9a066" stroke-width="3"/><circle cx="77" cy="52" r="17" fill="none" stroke="#d9a066" stroke-width="3"/>
     ${eyes(43, 77, 52, 10)}
     <path d="M52 62 L68 62 L60 70Z" fill="#ff9f1c"/><ellipse cx="60" cy="78" rx="7" ry="6" fill="#6b2437"/><path d="M53 72 Q60 69 67 72 Q64 76 60 76 Q56 76 53 72Z" fill="#ff9f1c"/>
     ${cheeks(24, 96, 70, 5)}
     <ellipse cx="46" cy="116" rx="10" ry="4.6" fill="#ff9f1c"/><ellipse cx="74" cy="116" rx="10" ry="4.6" fill="#ff9f1c"/>`,
  // oi: Coco the coin, a face on her golden face, spinning with motion arcs
  oi: `<path d="M14 40 q-8 22 0 44 M6 30 q-14 32 0 64" stroke="#ffd166" stroke-width="4" fill="none" stroke-linecap="round"/>
     <path d="M106 40 q8 22 0 44 M114 30 q14 32 0 64" stroke="#ffd166" stroke-width="4" fill="none" stroke-linecap="round"/>
     <g transform="rotate(-10 60 64)"><circle cx="60" cy="64" r="46" fill="#d68a14"/><circle cx="60" cy="64" r="42" fill="#ffc23d"/><circle cx="60" cy="64" r="35" fill="#ffd166"/>
     <circle cx="60" cy="64" r="35" fill="none" stroke="#e8a21f" stroke-width="2.6"/><circle cx="60" cy="64" r="39" fill="none" stroke="#fff" stroke-width="2.6" opacity=".5" stroke-dasharray="1 7" stroke-linecap="round"/>
     <path d="M34 42 q8 -14 24 -16" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>${face(60, 62, 1.3)}</g>
     <path d="M96 12 L99 20 L107 23 L99 26 L96 34 L93 26 L85 23 L93 20Z" fill="#fff"/><path d="M22 14 L24 19 L29 21 L24 23 L22 28 L20 23 L15 21 L20 19Z" fill="#fff3b0"/><path d="M104 104 L106 109 L111 111 L106 113 L104 118 L102 113 L97 111 L102 109Z" fill="#fff3b0"/>`,
  // ear: Earl the ear, a big peach ear with a smile and tiny arms and feet
  ear: `<path d="M32 70 q-18 -4 -20 -22" stroke="#e8a479" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="12" cy="46" r="7" fill="#ffc59a"/>
     <path d="M92 74 q18 -2 18 -22" stroke="#e8a479" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="110" cy="50" r="7" fill="#ffc59a"/>
     <ellipse cx="48" cy="114" rx="11" ry="5" fill="#52b8a5"/><ellipse cx="74" cy="114" rx="11" ry="5" fill="#52b8a5"/>
     <path d="M62 6 C92 4 108 30 102 62 C99 80 88 86 84 98 C80 112 60 114 52 100 C48 92 52 86 44 80 C28 66 30 14 62 6Z" fill="#e8a479"/>
     <path d="M62 4 C92 2 106 28 100 60 C97 78 86 84 82 96 C78 108 60 110 54 98 C50 90 54 84 46 78 C30 64 32 12 62 4Z" fill="#ffc59a"/>
     <path d="M60 14 C82 12 94 32 88 56 C85 68 78 74 76 86" stroke="#f0b087" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
     <path d="M42 30 q6 -12 20 -14" stroke="#fff" stroke-width="4.6" fill="none" opacity=".6" stroke-linecap="round"/>
     <path d="M52 40 C58 30 70 32 72 42" stroke="#f0b087" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".8"/>
     ${face(70, 62, 1.15)}`,
  // air: Hairy the hairbrush, a violet paddle brush seen from the front: bristle grid on the pad, a face in the middle, a handle below
  air: `<g transform="rotate(-12 60 74)">
     <rect x="49" y="86" width="22" height="38" rx="10" fill="#5a49b8"/><rect x="51" y="84" width="18" height="38" rx="9" fill="#7b69d8"/><path d="M56 96 v16" stroke="#fff" stroke-width="3.4" opacity=".5" stroke-linecap="round"/><circle cx="60" cy="115" r="3.4" fill="#5a49b8"/>
     ${bristles}
     <rect x="16" y="40" width="88" height="54" rx="27" fill="#5a49b8"/><rect x="16" y="38" width="88" height="52" rx="26" fill="#8b7be8"/><rect x="23" y="43" width="74" height="42" rx="21" fill="#a99df2"/>
     <path d="M28 56 q5 -8 14 -9" stroke="#fff" stroke-width="3.6" fill="none" opacity=".55" stroke-linecap="round"/>
     <path d="M40 30 C22 30 10 40 18 50 C24 56 14 62 20 68" stroke="#e0a33c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M96 40 C108 46 106 54 98 56 C92 58 100 64 96 68" stroke="#e0a33c" stroke-width="3" fill="none" stroke-linecap="round"/>
     ${eyes(47, 73, 62, 7)}${cheeks(37, 83, 72, 4.6)}<path d="M50 71 Q60 82 70 71" fill="none" stroke="#3b2030" stroke-width="3.2" stroke-linecap="round"/></g>`,
  // er: Fern the fern, a plump frond with pairs of leaflets, a face and a curling tip
  er: `${fronds}
     <circle cx="60" cy="80" r="25" fill="#5cc26b"/><circle cx="60" cy="78" r="24" fill="#8ee27a"/><path d="M42 64 q6 -8 16 -9" stroke="#fff" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>
     ${face(60, 77, 1.05)}
     <path d="M34 100 H86 L80 122 H40Z" fill="#c8693a"/><path d="M36 102 H62 L58 122 H40Z" fill="#df8450" opacity=".7"/><rect x="30" y="97" width="60" height="11" rx="5" fill="#df8450"/><rect x="30" y="97" width="60" height="4" rx="2" fill="#f2a56f" opacity=".7"/>`,
};
