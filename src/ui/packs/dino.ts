import { DINOS, dinoSVG, islandSVG, sceneSVG } from '../art';
import type { Pack } from './types';

/** Dino Valley: the original look (four baby dinosaurs, a volcano valley), now one pack among several. */
export const pack: Pack = {
  id: 'dino',
  name: 'Dino Valley',
  blurb: 'Baby dinosaurs in a sunny volcano valley',
  arrival: 'egg',
  defaultName: 'Dino',
  creatures: DINOS.map((d) => ({ id: d.id, label: d.label, main: d.main, dark: d.dark, accent: d.accent, hy: d.hy, svg: (g: number) => dinoSVG(d.id, g) })),
  scene: sceneSVG,
  island: islandSVG,
};
