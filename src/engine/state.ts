import { addDays } from './dates';
import { GRAPHEMES, GRAPHEME_BY_ID, MAX_SET, graphemesInSet, type Grapheme } from './data';

/** Days of correct, unscaffolded answers needed to call a sound secure (spec: three separate days). */
export const MASTERY_DAYS = 3;
/**
 * What counts as "right in a session". The spec says only "gets it right in at least three separate sessions
 * on different days". Read literally (one correct tap), a child guessing at chance passes about as fast as one
 * who knows the sound (see scripts/simulate.ts), so a day passes only with >= 2 graded first-try correct answers
 * AND >= 60% of that day's graded answers. This is a prototype decision, not in the spec.
 */
export const DAY_PASS = { minCorrect: 2, minRate: 0.6 } as const;
/** Leitner-style review gaps in days, by box 0..5. */
export const REVIEW_INTERVALS = [0, 1, 2, 4, 7, 14] as const;

export interface SoundRecord {
  introducedOn: string;
  attempts: number; // all graded trials (2+ choices)
  correct: number; // first-try correct among those
  correctDays: string[]; // days that passed DAY_PASS (derived from dayTally)
  dayTally: Record<string, { n: number; c: number }>; // graded first-try results per day
  box: number; // 0..5, moves at most once per day (first graded trial of the day)
  due: string; // next review day (only binds once a sound is secure)
  boxDay: string | null;
}

export interface WordRecord { correctDays: string[]; attempts: number; correct: number }

export interface Companion { kind: string; name: string }

export interface ChildState {
  nickname: string;
  band: 'B' | 'C';
  companion: Companion | null;
  startSet: number; // placement result, 1 = from scratch
  sounds: Record<string, SoundRecord>;
  words: Record<string, WordRecord>;
  collection: string[]; // grapheme ids whose mnemonic has been collected
  adventureDays: string[]; // days a full adventure was completed
  lastIntroDay: string | null;
  // prototype-only bookkeeping
  dayOffset: number;
  playMs: Record<string, number>;
  dailyLimitMin: number;
  version: 1;
}

export const newChild = (): ChildState => ({
  nickname: '',
  band: 'C',
  companion: null,
  startSet: 1,
  sounds: {},
  words: {},
  collection: [],
  adventureDays: [],
  lastIntroDay: null,
  dayOffset: 0,
  playMs: {},
  dailyLimitMin: 20,
  version: 1,
});

export type Status = 'not-started' | 'learning' | 'secure';

export const isSecure = (s: ChildState, id: string): boolean =>
  (s.sounds[id]?.correctDays.length ?? 0) >= MASTERY_DAYS;

export const statusOf = (s: ChildState, id: string): Status =>
  !s.sounds[id] ? 'not-started' : isSecure(s, id) ? 'secure' : 'learning';

export const introducedIds = (s: ChildState): Set<string> => new Set(Object.keys(s.sounds));

export const setSecure = (s: ChildState, set: number): boolean =>
  graphemesInSet(set).every((g) => isSecure(s, g.id));

/**
 * A set "opens the next one" when all but one of its sounds are secure (3 of 4). The one that is not yet
 * secure is carried forward: it stays introduced, is always eligible for review, and can still earn its three days.
 * Strict whole-set gating let one stubborn sound hold back all new content.
 */
export const setOpensNext = (s: ChildState, set: number): boolean => {
  const ids = graphemesInSet(set).map((g) => g.id);
  const secure = ids.filter((id) => isSecure(s, id)).length;
  return secure >= Math.max(1, ids.length - 1);
};

/** Sounds introduced and not yet secure that sit in an earlier set than the highest unlocked one. */
export const carriedForward = (s: ChildState): string[] => {
  const open = unlockedSet(s);
  return GRAPHEMES.filter((g) => g.set < open && s.sounds[g.id] && !isSecure(s, g.id)).map((g) => g.id);
};

/**
 * Highest unlocked set. Placement can open later sets directly; otherwise set N+1 opens when set N
 * has all but one sound secure (see setOpensNext).
 */
export const unlockedSet = (s: ChildState): number => {
  let n = Math.max(1, s.startSet);
  while (n < MAX_SET && setOpensNext(s, n)) n++;
  return n;
};

/** The next sound to introduce: first not-yet-introduced grapheme in an unlocked set. */
export const nextNewSound = (s: ChildState): Grapheme | null => {
  const open = unlockedSet(s);
  return GRAPHEMES.find((g) => g.set <= open && !s.sounds[g.id]) ?? null;
};

export const introduce = (s: ChildState, id: string, today: string): void => {
  if (!GRAPHEME_BY_ID.has(id)) throw new Error(`unknown grapheme ${id}`);
  if (!s.sounds[id])
    s.sounds[id] = { introducedOn: today, attempts: 0, correct: 0, correctDays: [], dayTally: {}, box: 0, due: today, boxDay: null };
};

/**
 * Record one trial on a sound.
 * Only trials with 2+ choices are graded: a one-choice (errorless) trial teaches but proves nothing.
 * A day counts toward mastery only if it passes DAY_PASS on first-try graded answers.
 */
export const recordTrial = (
  s: ChildState,
  id: string,
  t: { firstTryCorrect: boolean; choices: number },
  today: string,
): void => {
  const r = s.sounds[id];
  if (!r || t.choices < 2) return;
  r.attempts++;
  if (t.firstTryCorrect) r.correct++;
  const tally = (r.dayTally[today] ??= { n: 0, c: 0 });
  tally.n++;
  if (t.firstTryCorrect) tally.c++;
  const passes = tally.c >= DAY_PASS.minCorrect && tally.c / tally.n >= DAY_PASS.minRate;
  const has = r.correctDays.includes(today);
  if (passes && !has) r.correctDays.push(today);
  else if (!passes && has) r.correctDays.splice(r.correctDays.indexOf(today), 1);
  // Spacing moves once per day, otherwise a few good trials in one session push a sound out of review
  // for a week and the three-separate-days mastery gate cannot be reached.
  if (r.boxDay !== today) {
    r.boxDay = today;
    r.box = t.firstTryCorrect ? Math.min(REVIEW_INTERVALS.length - 1, r.box + 1) : Math.max(0, r.box - 1);
    r.due = addDays(today, REVIEW_INTERVALS[r.box] as number);
  }
};

/** A printed word counts as "read" after first-try correct blending on two separate days. */
export const WORD_READ_DAYS = 2;
export const recordWord = (s: ChildState, text: string, firstTryCorrect: boolean, today: string): void => {
  const r = (s.words[text] ??= { correctDays: [], attempts: 0, correct: 0 });
  r.attempts++;
  if (firstTryCorrect) {
    r.correct++;
    if (!r.correctDays.includes(today)) r.correctDays.push(today);
  }
};
export const wordsRead = (s: ChildState): string[] =>
  Object.entries(s.words).filter(([, r]) => r.correctDays.length >= WORD_READ_DAYS).map(([w]) => w);

/** Number of answer choices for the n-th graded trial of a sound in a session: 1, then 2, then 3 (errorless start). */
export const choicesForTrial = (indexInSession: number): number => Math.min(3, indexInSession + 1);
