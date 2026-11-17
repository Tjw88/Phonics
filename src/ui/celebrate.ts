// The one place a "success" is celebrated: every game calls celebrate() so the size and look of the reaction follow the round
// (first success short, later ones varied, the last of a block a finale) and the world (read from document.body.dataset.pack).
//
// FROZEN API (other files call this; the animation cycle may change the BODY but not the signature):
//   celebrate(el, { game: 'feed' | 'robot' | 'drum' | 'safari' | 'kitchen' | 'bridge' | 'rhyme' | 'trace' | 'beat' | 'find' | 'alive' | 'treasure', last?: boolean })
//     el   = the element the burst comes from (the creature, the card, the board...)
//     game = which game succeeded (the implementation keeps its own per-game counter for the session so the reaction rotates
//            DETERMINISTICALLY by round number and the first success of a game is the short version; never random)
//     last = true for the last round of a block (a finale-sized reaction)
//
// What it does (no randomness anywhere, nothing at all under Reduce Motion):
//   * the FIRST success of a game this session: level 1, the short version (about 0.8-1.2 s): a few of the world's particles and a small happy move
//   * later successes: level 2, rotating through THREE variants by that game's success count (direction of the burst, which particles lead,
//     which of the creature's three happy moves plays), so a long block never looks copied
//   * `last`: level 3, a finale: a wide burst, a world-wide shower (leaves, sparkles, bubbles, hay...) and three happy moves in a row
//   * the particle style and the creature's move come from the world: dino leaves and dust; dragon sparkles and tiny flames; transport stars and
//     steam puffs; space twinkles and little orbit rings; ocean bubbles; farm hay, petals and feathers (see particles.ts and reactions.ts)
//   * if a creature (`.companion`) is on screen it does its happy move (unless another reaction, e.g. Feed's `eat`, already owns it)
import { reducedMotion } from './dom';
import { emit, type Level } from './particles';
import { reactions } from './reactions';

export type CelebrateGame = 'feed' | 'robot' | 'drum' | 'safari' | 'kitchen' | 'bridge' | 'rhyme' | 'trace' | 'beat' | 'find' | 'alive' | 'treasure';
export interface CelebrateOptions { game: CelebrateGame; last?: boolean }

const counts: Partial<Record<CelebrateGame, number>> = {};
/** How many successes of `game` have been celebrated this session (0 = the next one is the first, short version). */
export const celebrationCount = (game: CelebrateGame): number => counts[game] ?? 0;
/** Forget the session counters (tests). */
export const resetCelebrations = (): void => { for (const k of Object.keys(counts)) delete counts[k as CelebrateGame]; };

/** The creature on screen that this celebration should make happy: the element itself, its parent, or the one in the stage. */
const creatureFor = (el: Element): HTMLElement | null => {
  const c = el.closest<HTMLElement>('.companion') ?? el.parentElement?.querySelector<HTMLElement>(':scope > .companion') ?? el.querySelector<HTMLElement>('.companion')
    ?? document.querySelector<HTMLElement>('#stage .companion:not(.sleepy)');
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return r.width > 20 && r.height > 20 ? c : null;
};

export const celebrate = (el: Element, opts: CelebrateOptions): void => {
  const n = counts[opts.game] ?? 0;
  counts[opts.game] = n + 1;
  const big = opts.game === 'alive' || opts.game === 'treasure'; // once a day: never the smallest version
  const level: Level = opts.last ? 3 : n === 0 && !big ? 1 : 2;
  const variant = n === 0 ? 0 : (n - 1) % 3;
  const creature = creatureFor(el);
  if (reducedMotion()) { if (creature) reactions.right(creature, { level, index: variant }); return; } // the face still says yes
  if (opts.last) {
    emit(el, { level: 3, variant, wide: true });
    reactions.finale(creature);
  } else {
    emit(el, { level, variant });
    if (creature) reactions.right(creature, { level, index: variant });
  }
};
