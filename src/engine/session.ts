import { GRAPHEMES, GRAPHEME_BY_ID, bankFor, graphemesInSet, type Grapheme, type Word } from './data';
import { shuffle, type Rng } from './dates';
import { isDecodable } from './linter';
import { pickReview } from './review';
import {
  choicesForTrial, introduce, introducedIds, nextNewSound, setOpensNext, wordsRead,
  type ChildState,
} from './state';

export interface Plan {
  day: string;
  newSound: Grapheme | null; // null on a consolidation day (nothing new is safe to add yet)
  review: Grapheme[];
  /** Printed blending (Bridge Builder, printed Make-it-real) opens when set 1 is (nearly) secure or placement skipped it. */
  printBlend: boolean;
  makeItReal: { word: Word; mode: 'print' | 'oral' } | null;
  robotWords: Word[]; // oral blending targets (no letters shown)
  bridgeWords: Word[]; // printed words, all decodable from taught sounds
  mission: string;
  consolidation: boolean;
}

// Oral-only words (e.g. "egg") may use graphemes that are not taught for print; fall back to the first letter.
export const phonemeOf = (id: string): string => GRAPHEME_BY_ID.get(id)?.phoneme ?? id.charAt(0);
export const slashed = (id: string): string => `/${phonemeOf(id)}/`;

export const printBlendOpen = (s: ChildState): boolean => s.startSet > 1 || setOpensNext(s, 1);

/** Print words decodable from what has been introduced so far, never oral-only or unsuitable. */
export const decodableWords = (s: ChildState): Word[] => {
  const taught = introducedIds(s);
  return bankFor(s.accent).filter((w) => isDecodable(w, taught));
};

const containsPhoneme = (w: Word, phoneme: string) => w.graphemes.some((id) => phonemeOf(id) === phoneme);

/** Prefer 3-phoneme words, words with the target sound, unread words and Dino Valley words. */
const rank = (w: Word, read: ReadonlySet<string>, target: Grapheme | null, rng: Rng): number => {
  let r = rng() * 0.5;
  if (target && w.graphemes.includes(target.id)) r += 4;
  if (w.graphemes.length === 3) r += 1.5;
  if (!read.has(w.text)) r += 1;
  if (w.dino) r += 0.75;
  return r;
};

export const pickWords = (pool: Word[], s: ChildState, target: Grapheme | null, n: number, rng: Rng): Word[] => {
  const read = new Set(wordsRead(s));
  return pool
    .map((w) => ({ w, r: rank(w, read, target, rng) })) // score once per word so the sort is stable and cheap
    .sort((a, b) => b.r - a.r)
    .slice(0, n)
    .map((x) => x.w);
};

export const missionFor = (g: Grapheme | null): string =>
  g
    ? `Sound hunt: find three things at home that start with ${slashed(g.id)}. Say the sound, not the letter name.`
    : 'Sound hunt: find something at home that goes “mmm”, “sss” or “fff”, then say it together.';

/**
 * Start (or resume) today's adventure. Mutates state: today's new sound is introduced exactly once per day,
 * so replaying the same day returns the same new sound.
 */
export const startAdventure = (s: ChildState, today: string, rng: Rng): Plan => {
  let newSound: Grapheme | null = null;
  if (s.lastIntroDay === today) {
    newSound = GRAPHEMES.find((g) => s.sounds[g.id]?.introducedOn === today) ?? null;
  } else {
    newSound = nextNewSound(s);
    if (newSound) {
      introduce(s, newSound.id, today);
      s.lastIntroDay = today;
    }
  }

  const review = pickReview(s, today, newSound ? [newSound.id] : []);
  const printBlend = printBlendOpen(s);
  const pool = decodableWords(s);

  // Oral blending uses pictured words and shows no letters, so it is available from day one.
  const pictured = bankFor(s.accent).filter((w) => w.emoji);
  const robotWords = pickWords(pictured.filter((w) => !newSound || containsPhoneme(w, newSound.phoneme)), s, newSound, 3, rng);
  if (robotWords.length < 3) robotWords.push(...pickWords(pictured.filter((w) => !robotWords.includes(w)), s, null, 3 - robotWords.length, rng));

  const bridgeWords = printBlend ? pickWords(pool, s, newSound, 3, rng) : [];

  let makeItReal: Plan['makeItReal'] = null;
  if (printBlend && pool.length) {
    const withPic = pool.filter((w) => w.emoji);
    const word = pickWords(withPic.length ? withPic : pool, s, newSound, 1, rng)[0];
    if (word) makeItReal = { word, mode: 'print' };
  } else if (robotWords[0]) {
    makeItReal = { word: robotWords[0], mode: 'oral' };
  }

  return {
    day: today, newSound, review, printBlend, makeItReal, robotWords, bridgeWords,
    mission: missionFor(newSound ?? review[0] ?? null),
    consolidation: !newSound,
  };
};

export interface FeedTrial { target: Grapheme; options: Grapheme[]; choices: number }

/**
 * Build a "Feed the Creature" trial: the target letter plus distractors that are introduced, and do NOT share
 * the target's sound (so there is only one right answer: c, k and ck are never offered together).
 */
export const buildFeedTrial = (s: ChildState, target: Grapheme, indexInSession: number, rng: Rng): FeedTrial => {
  const wanted = choicesForTrial(indexInSession);
  const intro = introducedIds(s);
  const pool = GRAPHEMES.filter((g) => intro.has(g.id) && g.phoneme !== target.phoneme);
  // Prefer distractors from the same set, then recently introduced, to make discrimination meaningful.
  const near = shuffle(pool.filter((g) => g.set === target.set), rng);
  const far = shuffle(pool.filter((g) => g.set !== target.set), rng);
  const distractors = [...near, ...far].slice(0, wanted - 1);
  const options = shuffle([target, ...distractors], rng);
  return { target, options, choices: options.length };
};

/** Sounds the placement game draws from (sets 1-3 only, to stay conservative). */
export const PLACEMENT_SETS = [1, 2, 3] as const;
export interface PlacementItem { set: number; target: Grapheme; options: Grapheme[] }

export const buildPlacement = (rng: Rng): PlacementItem[] =>
  PLACEMENT_SETS.flatMap((set) => {
    const inSet = graphemesInSet(set);
    // c and k share a sound, so neither is asked directly in placement.
    const targets = shuffle(inSet.filter((g) => g.id !== 'c' && g.id !== 'k'), rng).slice(0, 2);
    return targets.map((target) => {
      const distractors = shuffle(inSet.filter((g) => g.phoneme !== target.phoneme), rng).slice(0, 2);
      return { set, target, options: shuffle([target, ...distractors], rng) };
    });
  });

/** Pass a set with 2/2; stop at the first failed set. Returns the set to start from (1 = from scratch). */
export const scorePlacement = (items: PlacementItem[], results: boolean[]): number => {
  let start = 1;
  for (const set of PLACEMENT_SETS) {
    const idx = items.map((it, i) => (it.set === set ? i : -1)).filter((i) => i >= 0);
    if (idx.length && idx.every((i) => results[i] === true)) start = set + 1;
    else break;
  }
  return start;
};

/** Seed the sounds in skipped sets as "learning" (introduced, not secure): placement never grants mastery. */
export const applyPlacement = (s: ChildState, startSet: number, today: string): void => {
  s.startSet = startSet;
  for (const g of GRAPHEMES) if (g.set < startSet) introduce(s, g.id, today);
};


/** Trial indices (-> choices 1,2,3,3 / 2,3) per sound per adventure. Shared by the UI and the simulator. */
export const NEW_SOUND_TRIALS = [0, 1, 2, 3] as const;
export const REVIEW_SOUND_TRIALS = [1, 2] as const;
