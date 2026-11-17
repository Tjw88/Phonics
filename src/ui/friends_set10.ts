import { cheeks, eyes, face, smile } from './friendKit';

// Sound-friends of set(s) igh ar or ur. Each entry is an SVG fragment (viewBox 0 0 120 120) in the style of the existing friends.

// Starla's five points, softened by a round-joined stroke of the same colour
const starPath = (cx: number, cy: number, R: number, rr: number, tilt: number): string => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = ((tilt - 90 + i * 36) * Math.PI) / 180;
    const rad = i % 2 ? rr : R;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)} `;
  }
  return d + 'Z';
};
const STAR = starPath(60, 66, 46, 24, -6);
const STAR_IN = starPath(60, 66, 38, 20, -6);

// Furry's fluffy edge: a ring of round tufts around a round middle
const tufts = (rad: number, cols: [string, string]): string => {
  let a = '', b = '';
  for (let i = 0; i < 14; i++) {
    const t = (i / 14) * Math.PI * 2;
    const x = 60 + 36 * Math.cos(t), y = 62 + 34 * Math.sin(t);
    a += `<circle cx="${x.toFixed(1)}" cy="${(y + 2).toFixed(1)}" r="${rad}" fill="${cols[0]}"/>`;
    b += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad - 1}" fill="${cols[1]}"/>`;
  }
  return a + b;
};

// corn kernels on Norah's cob
const kernels = (): string => {
  let k = '';
  for (let row = 0; row < 9; row++) {
    const y = 18 + row * 9.5;
    for (let col = 0; col < 6; col++) {
      const x = 40 + col * 8 + (row % 2 ? 4 : 0) - 4;
      const dx = (x - 60) / 24, dy = (y - 52) / 40;
      if (dx * dx + dy * dy < 0.8) k += `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="3.8" fill="#f0b400" opacity=".5"/>`;
    }
  }
  return k;
};

export const FRIENDS_SET10: Record<string, string> = {
  // igh: Lite the light bulb, glowing, a face on the glass
  igh: `<circle cx="60" cy="50" r="50" fill="#fff2a8" opacity=".45"/>
      <g stroke="#ff9f43" stroke-width="4" stroke-linecap="round"><path d="M60 -2 V6 M22 12 L28 18 M98 12 L92 18 M6 50 H14 M106 50 H114"/></g>
      <path d="M42 78 Q44 92 46 96 H74 Q76 92 78 78Z" fill="#e0a100"/>
      <circle cx="60" cy="52" r="38" fill="#e0a100"/><circle cx="60" cy="50" r="38" fill="#ffd966"/><path d="M44 74 Q46 90 48 94 H72 Q74 90 76 74Z" fill="#ffd966"/>
      <rect x="42" y="92" width="36" height="9" rx="3" fill="#6b7685"/><rect x="42" y="92" width="36" height="4" rx="2" fill="#aab4bf"/>
      <rect x="44" y="100" width="32" height="9" rx="3" fill="#aab4bf"/><rect x="44" y="100" width="32" height="4" rx="2" fill="#d6dde5"/><path d="M48 109 H72 Q70 116 60 116 Q50 116 48 109Z" fill="#6b7685"/>
      <path d="M34 36 Q40 22 54 18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
      ${face(60, 52, 1.2)}`,
  // ar: Starla the star, soft violet, waving, with sparkles
  ar: `<path d="${STAR}" fill="#7c5fd6" stroke="#7c5fd6" stroke-width="16" stroke-linejoin="round" transform="translate(0 3)"/>
      <path d="${STAR}" fill="#b79cf7" stroke="#b79cf7" stroke-width="16" stroke-linejoin="round"/>
      <path d="${STAR_IN}" fill="#c9b4fb" opacity=".55"/>
      <path d="M32 36 q8 -12 20 -16" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".6"/>
      ${face(60, 68, 1.1)}
      <path d="M104 18 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" fill="#ffd166"/><path d="M12 28 l2.4 6 l6 2.4 l-6 2.4 l-2.4 6 l-2.4 -6 l-6 -2.4 l6 -2.4z" fill="#ffd166"/><circle cx="112" cy="60" r="3" fill="#ff8fab"/><circle cx="8" cy="76" r="3" fill="#ffd166"/>`,
  // or: Norah the corn cob, leaf arms up, a big grin
  or: `<path d="M60 112 C34 112 16 92 14 62 C30 70 48 78 60 90Z" fill="#3f9e5a"/><path d="M60 112 C86 112 104 92 106 62 C90 70 72 78 60 90Z" fill="#3f9e5a"/>
      <path d="M28 82 C12 80 4 62 8 40 C18 52 24 62 34 72Z" fill="#6fd37e"/><path d="M92 82 C108 80 116 62 112 40 C102 52 96 62 86 72Z" fill="#6fd37e"/>
      <ellipse cx="60" cy="52" rx="26" ry="44" fill="#e0a100"/><ellipse cx="60" cy="50" rx="26" ry="44" fill="#ffd966"/>${kernels()}
      <path d="M60 112 C42 102 44 80 60 68 C76 80 78 102 60 112Z" fill="#6fd37e"/><path d="M60 108 C52 98 52 86 60 76" stroke="#3f9e5a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M44 22 q6 -8 14 -9" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".7"/>
      ${eyes(49, 71, 40, 7)}${cheeks(40, 80, 54, 5)}
      <path d="M43 52 Q60 78 77 52Z" fill="#7a2335"/><path d="M50 66 Q60 58 70 66 Q60 76 50 66Z" fill="#ff6f95"/><path d="M43 52 H77" stroke="#7a2335" stroke-width="3" stroke-linecap="round"/><path d="M48 52 H72 V56 Q60 60 48 56Z" fill="#fff"/>`,
  // ur: Furry the fur ball, lilac and fluffy, purring, tiny feet
  ur: `<ellipse cx="44" cy="112" rx="11" ry="6" fill="#7a5fc0"/><ellipse cx="76" cy="112" rx="11" ry="6" fill="#7a5fc0"/>
      ${tufts(14, ['#8f74d6', '#b9a2f0'])}<circle cx="60" cy="64" r="38" fill="#8f74d6"/><circle cx="60" cy="62" r="38" fill="#b9a2f0"/>
      <path d="M50 20 q-4 -10 -10 -10 M60 18 q0 -12 -4 -14 M70 20 q4 -10 10 -10" stroke="#8f74d6" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <path d="M32 46 q6 -14 20 -18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
      ${eyes(46, 74, 52, 9)}${cheeks(34, 86, 68, 6)}
      <path d="M56 64 h8 l-4 4z" fill="#ff7aa2"/><path d="M60 68 v3 M60 71 q-5 6 -11 1 M60 71 q5 6 11 1" stroke="#3b2030" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M10 56 q-6 6 0 12 M4 52 q-10 10 0 20 M110 56 q6 6 0 12 M116 52 q10 10 0 20" stroke="#8f74d6" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`,
};
void smile;
