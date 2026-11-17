// The theme-pack registry: which packs exist, and lookups used by the screens. Progress and teaching never depend on the pack.
import { eggFromColours, mouthPctFor } from './art';
import type { CreatureDef, Pack } from './packs/types';
import { pack as dino } from './packs/dino';
import { pack as dragon } from './packs/dragon';
import { pack as transport } from './packs/transport';
import { pack as space } from './packs/space';
import { pack as ocean } from './packs/ocean';
import { pack as farm } from './packs/farm';

export const PACKS: Pack[] = [dino, dragon, transport, space, ocean, farm];
export const DEFAULT_THEME = 'dino';
export const packById = (id: string): Pack => PACKS.find((p) => p.id === id) ?? (PACKS[0] as Pack);

/** Find a creature (and its pack) by id across all packs. */
export const findCreature = (kind: string): { pack: Pack; creature: CreatureDef; index: number } | null => {
  for (const pack of PACKS) {
    const index = pack.creatures.findIndex((c) => c.id === kind);
    if (index >= 0) return { pack, creature: pack.creatures[index] as CreatureDef, index };
  }
  return null;
};
const fallback = (): CreatureDef => (dino.creatures[0] as CreatureDef);
export const creatureOf = (kind: string): CreatureDef => findCreature(kind)?.creature ?? fallback();

export const companionSVG = (kind: string, growth = 0): string => creatureOf(kind).svg(growth);
export const arrivalSVG = (kind: string): string => {
  const c = creatureOf(kind);
  return c.egg ? c.egg() : eggFromColours(c.id, c.main, c.dark, c.accent);
};
export const mouthPct = (kind: string): { x: number; y: number } => mouthPctFor(creatureOf(kind).hy);
/** The creature of the same position in another pack (used when a grown-up switches the world: keeps "the second one"). */
export const sameSlotIn = (kind: string, packId: string): string => {
  const f = findCreature(kind);
  const target = packById(packId);
  return (target.creatures[f?.index ?? 0] ?? target.creatures[0] as CreatureDef).id;
};
