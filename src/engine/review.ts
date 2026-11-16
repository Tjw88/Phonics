import { daysBetween } from './dates';
import { GRAPHEME_BY_ID, type Grapheme } from './data';
import { isSecure, type ChildState } from './state';

/**
 * Pick the 2-3 earlier sounds the child found hardest, by a simple schedule:
 * overdue-ness plus error rate.
 */
export const pickReview = (s: ChildState, today: string, exclude: string[] = [], max = 3): Grapheme[] => {
  const scored = Object.entries(s.sounds)
    .filter(([id, r]) => !exclude.includes(id) && r.introducedOn < today)
    .map(([id, r]) => {
      const secure = isSecure(s, id);
      const overdue = Math.max(0, daysBetween(r.due, today));
      const errRate = r.attempts ? 1 - r.correct / r.attempts : 0.5; // unknown difficulty -> middling
      // Sounds still being learned are always eligible (they need practice on separate days to pass the gate);
      // secure sounds come back only when their spaced-review date arrives.
      const eligible = !secure || r.due <= today;
      return { id, eligible, score: (secure ? 0 : 2) + overdue + 3 * errRate };
    })
    .filter((x) => x.eligible)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return scored.slice(0, max).map((x) => GRAPHEME_BY_ID.get(x.id)!);
};

/** Sounds with enough attempts and a poor first-try rate: for the parent "Watch out for" panel. */
export const strugglingSounds = (s: ChildState): Grapheme[] =>
  Object.entries(s.sounds)
    .filter(([, r]) => r.attempts >= 6 && r.correct / r.attempts < 0.5)
    .map(([id]) => GRAPHEME_BY_ID.get(id)!);
