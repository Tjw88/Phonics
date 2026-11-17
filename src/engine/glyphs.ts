// Letter formation for Trace Trail: lower-case print only (spec), start dot + direction, one or more strokes.
// Glyph box: 0..60 wide, baseline y=100, x-height top y=50, ascender top y=10, descender bottom y=140.
// Only absolute M / L / C commands are used so the paths can be sampled without a DOM (and unit-tested).
// NOTE: schools teach different formations (the spec makes tracing optional for that reason); these follow the common
// "start at the top, anticlockwise for round letters" convention and need a phonics specialist's review.
export interface Stroke { d: string; dot?: boolean }
export interface Pt { x: number; y: number }

const O = 'C18 50 8 62 8 75 C8 88 18 100 30 100 C42 100 52 88 52 75';
const BOWL_R = 'M10 62 C16 52 22 50 30 50 C44 50 52 62 52 75 C52 88 44 100 30 100 C22 100 16 98 10 90'; // p / b bowl, clockwise from the stem

export const GLYPHS: Record<string, Stroke[]> = {
  a: [{ d: `M44 56 C40 52 35 50 30 50 ${O} C52 66 49 60 44 56` }, { d: 'M52 50 L52 100' }],
  c: [{ d: 'M50 60 C44 52 36 50 30 50 C18 50 8 62 8 75 C8 88 18 100 30 100 C38 100 46 96 50 90' }],
  o: [{ d: `M30 50 ${O} C52 62 42 50 30 50` }],
  d: [{ d: `M44 56 C40 52 35 50 30 50 ${O} C52 66 49 60 44 56` }, { d: 'M52 10 L52 100' }],
  g: [{ d: `M44 56 C40 52 35 50 30 50 ${O} C52 66 49 60 44 56` }, { d: 'M52 50 L52 125 C52 138 42 140 32 140 C26 140 20 138 16 134' }],
  e: [{ d: 'M8 75 L52 75 C52 60 44 50 30 50 C16 50 8 62 8 75 C8 88 18 100 30 100 C40 100 48 96 52 90' }],
  s: [{ d: 'M46 58 C40 52 34 50 28 50 C16 50 12 64 24 71 C36 78 50 82 48 92 C46 100 36 100 28 100 C20 100 12 96 10 90' }],
  t: [{ d: 'M30 20 L30 92 C30 98 36 101 44 99' }, { d: 'M14 52 L48 52' }],
  p: [{ d: 'M10 50 L10 140' }, { d: BOWL_R }],
  b: [{ d: 'M10 10 L10 100' }, { d: BOWL_R }],
  i: [{ d: 'M30 50 L30 100' }, { d: 'M30 26 L30 33', dot: true }],
  n: [{ d: 'M10 50 L10 100' }, { d: 'M10 66 C14 54 22 50 30 50 C46 50 50 56 50 70 L50 100' }],
  m: [{ d: 'M6 50 L6 100' }, { d: 'M6 66 C9 54 15 50 21 50 C33 50 34 58 34 70 L34 100' }, { d: 'M34 66 C37 54 43 50 49 50 C58 50 58 58 58 70 L58 100' }],
  r: [{ d: 'M12 50 L12 100' }, { d: 'M12 68 C14 56 22 50 34 50' }],
  h: [{ d: 'M10 10 L10 100' }, { d: 'M10 66 C14 54 22 50 30 50 C46 50 50 56 50 70 L50 100' }],
  u: [{ d: 'M10 50 L10 82 C10 96 18 100 28 100 C40 100 50 94 50 82' }, { d: 'M50 50 L50 100' }],
  k: [{ d: 'M10 10 L10 100' }, { d: 'M46 50 L12 76 L50 100' }],
  l: [{ d: 'M30 10 L30 100' }],
  f: [{ d: 'M46 18 C36 8 28 14 28 28 L28 100' }, { d: 'M12 50 L44 50' }],
  j: [{ d: 'M34 50 L34 126 C34 138 26 142 14 138' }, { d: 'M34 26 L34 33', dot: true }],
  v: [{ d: 'M8 50 L30 100 L52 50' }],
  w: [{ d: 'M4 50 L17 100 L30 62 L43 100 L56 50' }],
  x: [{ d: 'M10 50 L50 100' }, { d: 'M50 50 L10 100' }],
  y: [{ d: 'M8 50 L30 98' }, { d: 'M52 50 L26 118 C20 132 12 140 4 136' }],
  z: [{ d: 'M10 50 L50 50 L10 100 L50 100' }],
  q: [{ d: `M44 56 C40 52 35 50 30 50 ${O} C52 66 49 60 44 56` }, { d: 'M52 50 L52 140' }],
};

/** Shift every x coordinate of an absolute M/L/C path (used to lay a second letter beside the first). */
export const shiftPath = (d: string, dx: number): string => {
  let i = 0;
  return d.replace(/-?\d*\.?\d+/g, (n) => (i++ % 2 === 0 ? String(Number(n) + dx) : n));
};

/** A grapheme of any length (a, ck, igh) is traced as its letters, one after the other, side by side. */
export const strokesFor = (grapheme: string): Stroke[] =>
  [...grapheme].flatMap((ch, i) => (GLYPHS[ch] ?? []).map((s) => ({ ...s, d: i === 0 ? s.d : shiftPath(s.d, 64 * i) })));
/** Width of the glyph area for a grapheme: 60 for one letter, 124 for two, 188 for three. */
export const glyphWidth = (grapheme: string): number => 64 * [...grapheme].length - 4;

/** Sample an absolute M/L/C path into points roughly `step` apart (pure, no DOM). */
export const samplePath = (d: string, step = 4): Pt[] => {
  const tokens = d.match(/[MLC]|-?\d*\.?\d+/g) ?? [];
  const dense: Pt[] = [];
  let i = 0;
  let cur: Pt = { x: 0, y: 0 };
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M') { cur = { x: num(), y: num() }; dense.push(cur); }
    else if (cmd === 'L') {
      const to = { x: num(), y: num() };
      const n = Math.max(2, Math.ceil(Math.hypot(to.x - cur.x, to.y - cur.y) / 1));
      for (let k = 1; k <= n; k++) dense.push({ x: cur.x + ((to.x - cur.x) * k) / n, y: cur.y + ((to.y - cur.y) * k) / n });
      cur = to;
    } else if (cmd === 'C') {
      // consume as many implicit repeats as follow
      while (i < tokens.length && !/[MLC]/.test(tokens[i]!)) {
        const c1 = { x: num(), y: num() }, c2 = { x: num(), y: num() }, to = { x: num(), y: num() };
        const n = 40;
        for (let k = 1; k <= n; k++) {
          const t = k / n, u = 1 - t;
          dense.push({
            x: u * u * u * cur.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x,
            y: u * u * u * cur.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y,
          });
        }
        cur = to;
      }
    }
  }
  // resample evenly by arc length
  const out: Pt[] = dense.length ? [dense[0]!] : [];
  let acc = 0;
  for (let k = 1; k < dense.length; k++) {
    acc += Math.hypot(dense[k]!.x - dense[k - 1]!.x, dense[k]!.y - dense[k - 1]!.y);
    if (acc >= step) { out.push(dense[k]!); acc = 0; }
  }
  const last = dense[dense.length - 1];
  if (last && (out.length < 2 || out[out.length - 1] !== last)) out.push(last);
  return out;
};

export const pathLength = (pts: Pt[]): number => pts.slice(1).reduce((s, p, k) => s + Math.hypot(p.x - pts[k]!.x, p.y - pts[k]!.y), 0);

/**
 * Tracing progress. `reached` is the furthest sample covered IN ORDER from the start, so scribbling elsewhere or
 * tracing backwards does not count (this is what makes the start dot and direction matter).
 */
export const advanceTrace = (pts: Pt[], reached: number, at: Pt, radius = 16): number => {
  const startR = radius * 1.5;
  if (reached < 0) return Math.hypot(at.x - pts[0]!.x, at.y - pts[0]!.y) <= startR ? 0 : -1;
  let r = reached;
  for (let k = reached + 1; k <= Math.min(pts.length - 1, reached + 4); k++) {
    if (Math.hypot(at.x - pts[k]!.x, at.y - pts[k]!.y) <= radius) r = k;
  }
  return r;
};
export const traceDone = (pts: Pt[], reached: number): boolean => reached >= Math.max(1, pts.length - 3);
