// The picture cards: original flat-style illustrations for every word the games show as a picture (replacing emoji).
// Style: viewBox 0 0 100 100, flat fills, a darker underlay for depth, white highlights, no outlines. Animals have
// simple eyes; objects have none (faces belong to the sound-friends). A picture must say ONE word unambiguously:
// anything that could be read as two words (insect / bug, ox / cow...) was deliberately not drawn.

export const K = {
  red: '#ef476f', dred: '#c2284f', orange: '#ff9f43', dorange: '#d9741a', yellow: '#ffd166', dyellow: '#e0a100', green: '#6fd37e', dgreen: '#3f9e5a',
  blue: '#4cc3d9', dblue: '#2b8fa3', violet: '#9b8bf0', dviolet: '#6f5fd0', pink: '#ff8fab', dpink: '#e0607f', brown: '#b8793a', dbrown: '#7a4a1d',
  grey: '#aab4bf', dgrey: '#6b7685', white: '#ffffff', cream: '#fff3d6', ink: '#26303f', skin: '#f7c59f', dskin: '#e0a173', sky: '#bfe8ff', tan: '#e8c48a',
} as const;
export type Col = string;
export const c = (x: number, y: number, r: number, f: Col, extra = ''): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${extra}/>`;
export const e = (x: number, y: number, rx: number, ry: number, f: Col, rot = 0): string => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}/>`;
export const r = (x: number, y: number, w: number, h: number, rad: number, f: Col, rot = 0, extra = ''): string => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${f}"${rot ? ` transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"` : ''} ${extra}/>`;
export const p = (d: string, f: Col, extra = ''): string => `<path d="${d}" fill="${f}" ${extra}/>`;
export const s = (d: string, stroke: Col, w = 3, extra = ''): string => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const eye = (x: number, y: number, rad = 3.4): string => c(x, y, rad, K.ink) + c(x + rad * 0.3, y - rad * 0.3, rad * 0.35, K.white);
export const shadow = (cy = 92, rx = 30): string => e(50, cy, rx, 4.5, '#0000001c');

export const PICTURES: Record<string, string> = {};
export const add = (words: string, body: string): void => {
  for (const w of words.split(' ')) PICTURES[w] = body;
};

