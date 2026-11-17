// Shared drawing helpers for the sound-friends (viewBox 0 0 120 120): big eyes, a smile, blushing cheeks, a whole face.
// The friends of each set live in their own file (friends.ts, friends_set8.ts, ...) and all import these.

export const eyes = (x1: number, x2: number, y: number, r = 7): string =>
  `<g class="eyes"><circle cx="${x1}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#fff"/>` +
  `<circle cx="${x1 + r * 0.15}" cy="${y + r * 0.1}" r="${r * 0.55}" fill="#26303f"/><circle cx="${x2 + r * 0.15}" cy="${y + r * 0.1}" r="${r * 0.55}" fill="#26303f"/>` +
  `<circle cx="${x1 + r * 0.35}" cy="${y - r * 0.25}" r="${r * 0.2}" fill="#fff"/><circle cx="${x2 + r * 0.35}" cy="${y - r * 0.25}" r="${r * 0.2}" fill="#fff"/></g>`;
export const smile = (cx: number, y: number, w = 12): string =>
  `<path d="M${cx - w} ${y} Q${cx} ${y + w * 0.9} ${cx + w} ${y}" fill="none" stroke="#3b2030" stroke-width="3.2" stroke-linecap="round"/>`;
export const cheeks = (x1: number, x2: number, y: number, r = 5): string =>
  `<circle cx="${x1}" cy="${y}" r="${r}" fill="#ff8fa3" opacity=".5"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#ff8fa3" opacity=".5"/>`;
export const face = (cx: number, cy: number, s = 1): string =>
  eyes(cx - 10 * s, cx + 10 * s, cy, 6.5 * s) + cheeks(cx - 17 * s, cx + 17 * s, cy + 9 * s, 4.5 * s) + smile(cx, cy + 10 * s, 8 * s);

