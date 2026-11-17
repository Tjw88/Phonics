import { addDays, todayReal } from '../engine/dates';
import { newChild, type ChildState } from '../engine/state';
import { findCreature, packById } from './themes';

// On-device only (spec: no accounts, no backend). localStorage stands in for SwiftData.
const KEY = 'soundling.proto.v1';

export const load = (): ChildState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as ChildState;
      if (s.version === 1) {
        const merged = { ...newChild(), ...s }; // fill fields added since this save was written (e.g. accent)
        if (merged.companion && !findCreature(merged.companion.kind)) merged.companion = { ...merged.companion, kind: 'rexy' }; // pre-art saves stored an emoji
        merged.theme = packById(findCreature(merged.companion?.kind ?? '')?.pack.id ?? merged.theme ?? 'dino').id; // the pack always matches the companion
        return merged;
      }
    }
  } catch {
    /* corrupted or unavailable storage: start fresh */
  }
  return newChild();
};
export const save = (s: ChildState): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode etc: progress will not persist */
  }
};
export const wipe = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};
/** Prototype clock: the real date plus a "skip ahead" offset so the 3-different-days gate can be demoed. */
export const clockDay = (s: ChildState): string => addDays(todayReal(), s.dayOffset);
