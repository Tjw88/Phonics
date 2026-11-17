import { GRAPHEMES, GRAPHEME_BY_ID, MAX_SET, bankFor, graphemesInSet, isConfusable, safariFor, soundsClose, type Grapheme, type SafariItem, type Word } from './data';
import { shuffle, type Rng } from './dates';
import { isDecodable } from './linter';
import { pickReview } from './review';
import {
  choicesForTrial, introduce, introducedIds, nextNewSound, setOpensNext, wordsRead,
  type ChildState,
} from './state';

export type SecondGame = 'robot' | 'drum' | 'safari';
export type ThirdGame = 'bridge' | 'kitchen' | 'rhyme';
export interface Plan {
  day: string;
  /** Practice is three games rising in difficulty: Feed the Creature, then one oral game, then one print (or rhyme) game. */
  second: SecondGame;
  third: ThirdGame;
  /** Optional Trace Trail after the new-sound story (parent setting; only on days with a new sound). */
  trace: boolean;
  drumWords: Word[]; // pictured words to segment
  kitchenWords: Word[]; // pictured, decodable words to spell
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

  // Variety without randomness: rotate by how many adventures have been completed (stable if a day is replayed).
  const n = s.adventureDays.filter((d) => d !== today).length;
  const safariOk = !!newSound && safariGraphemes(s.accent).includes(newSound.id);
  const seconds: SecondGame[] = safariOk ? ['safari', 'robot', 'drum'] : ['robot', 'drum'];
  const second = seconds[n % seconds.length] as SecondGame;
  const kitchenPool = pool.filter((w) => w.emoji && w.graphemes.length >= 2);
  const third: ThirdGame = !printBlend ? 'rhyme' : kitchenPool.length && n % 2 === 1 ? 'kitchen' : 'bridge';
  const drumPool = pictured.filter((w) => w.graphemes.length >= 2 && w.graphemes.length <= 4);
  return {
    day: today, second, third, trace: s.tracing && !!newSound,
    drumWords: pickWords(drumPool, s, newSound, 2, rng),
    kitchenWords: pickWords(kitchenPool, s, newSound, 2, rng),
    newSound, review, printBlend, makeItReal, robotWords, bridgeWords,
    mission: missionFor(newSound ?? review[0] ?? null),
    consolidation: !newSound,
  };
};

export interface FeedTrial { target: Grapheme; options: Grapheme[]; choices: number }

/**
 * Build a "Feed the Creature" trial: the target letter plus distractors that are introduced, and do NOT share
 * the target's sound (so there is only one right answer: c, k and ck are never offered together) and are not easily
 * mistaken for it by ear (s/sh, t/th, f/th and similar are never offered together; see CLOSE_SOUNDS).
 */
export const buildFeedTrial = (s: ChildState, target: Grapheme, indexInSession: number, rng: Rng): FeedTrial => {
  const wanted = choicesForTrial(indexInSession);
  const intro = introducedIds(s);
  const pool = GRAPHEMES.filter((g) => intro.has(g.id) && g.phoneme !== target.phoneme && !soundsClose(g.phoneme, target.phoneme));
  // Prefer distractors from the same set, then recently introduced, to make discrimination meaningful.
  const near = shuffle(pool.filter((g) => g.set === target.set), rng);
  const far = shuffle(pool.filter((g) => g.set !== target.set), rng);
  const distractors = [...near, ...far].slice(0, wanted - 1);
  const options = shuffle([target, ...distractors], rng);
  return { target, options, choices: options.length };
};

/** Sets the placement game draws from: every set, in order. It stops at the first miss, so a beginner only ever sees the first few. */
export const PLACEMENT_SETS: readonly number[] = Array.from({ length: MAX_SET }, (_, i) => i + 1);
export interface PlacementItem { set: number; target: Grapheme; options: Grapheme[] }

const DOUBLES = ['ck', 'ff', 'll', 'ss'];
const isDouble = (g: Grapheme): boolean => DOUBLES.includes(g.id);
const placementTargetOk = (g: Grapheme, inSet: Grapheme[]): boolean =>
  !isDouble(g) && !inSet.some((o) => o.id !== g.id && !isDouble(o) && o.phoneme === g.phoneme);

/**
 * Two items per set. Targets are never a grapheme that shares its sound with another one in the same set (c / k), and never a
 * "word-end" double (ck, ff, ll, ss), which a child who knows the single letter would not necessarily recognise.
 */
export const buildPlacement = (rng: Rng): PlacementItem[] =>
  PLACEMENT_SETS.flatMap((set) => {
    const inSet = graphemesInSet(set);
    const targets = shuffle(inSet.filter((g) => placementTargetOk(g, inSet)), rng).slice(0, 2);
    return targets.map((target) => {
      // one right answer, and nothing that sounds close to it (sh / ch, say)
      const pool = inSet.filter((g) => g.phoneme !== target.phoneme && !soundsClose(g.phoneme, target.phoneme));
      const distractors = shuffle(pool, rng).slice(0, 2);
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
  return Math.min(start, MAX_SET);
};

/** Seed the sounds in skipped sets as "learning" (introduced, not secure): placement never grants mastery. */
export const applyPlacement = (s: ChildState, startSet: number, today: string): void => {
  s.startSet = startSet;
  for (const g of GRAPHEMES) if (g.set < startSet) introduce(s, g.id, today);
};


/** Trial indices (-> choices 1,2,3,3 / 2,3) per sound per adventure. Shared by the UI and the simulator. */
export const NEW_SOUND_TRIALS = [0, 1, 2, 3] as const;
export const REVIEW_SOUND_TRIALS = [1, 2] as const;


// ---- Sound Safari / Word Kitchen builders ---------------------------------------------------------------------------
/**
 * A safari scene: up to `nTargets` things that START with the target sound, hidden among things that do not.
 * Distractors prefer sounds the child has already met, so the hunt is fair.
 */
export const buildSafari = (s: ChildState, target: Grapheme, rng: Rng, nTargets = 3, nTotal = 8): { targets: SafariItem[]; items: SafariItem[] } => {
  const all = safariFor(s.accent);
  // targets start with the LETTER being taught; nothing else that starts with the same SOUND is ever shown (no "cat" in a k scene)
  const targets = shuffle(all.filter((i) => i.g === target.id), rng).slice(0, nTargets);
  const met = new Set([...introducedIds(s)].map(phonemeOf));
  const others = all.filter((i) => i.p !== target.phoneme && !soundsClose(i.p, target.phoneme)); // nothing that sounds close (s / sh)
  const familiar = shuffle(others.filter((i) => met.has(i.p)), rng);
  const rest = shuffle(others.filter((i) => !met.has(i.p)), rng);
  // one distractor per sound, so the scene never has two items that start with the same wrong sound crowding it
  const seen = new Set<string>();
  const distractors: SafariItem[] = [];
  for (const it of [...familiar, ...rest]) {
    if (distractors.length >= nTotal - targets.length) break;
    if (seen.has(it.p)) continue;
    seen.add(it.p);
    if (targets.some((t) => isConfusable(t.word, it.word))) continue; // never a look-alike of an answer
    distractors.push(it);
  }
  return { targets, items: shuffle([...targets, ...distractors], rng) };
};

/** Letters (graphemes) that have at least two Safari items starting with them in this accent. */
export const safariGraphemes = (accent: ChildState['accent']): string[] =>
  GRAPHEMES.map((g) => g.id).filter((id) => safariFor(accent).filter((i) => i.g === id).length >= 2);

/** Word Kitchen tray: the word's own letters plus up to two other letters the child has met, shuffled. */
export const buildKitchenTiles = (s: ChildState, word: Word, rng: Rng, extra = 2): string[] => {
  const intro = [...introducedIds(s)].filter((id) => !word.graphemes.includes(id));
  // never offer a decoy that makes the answer ambiguous (c / k / ck all say /k/, ff = f, ll = l, ss = s)
  const sounds = new Set(word.graphemes.map(phonemeOf));
  // ...and no letter that is PART of one of the word's digraphs (s or h in "ship"), or a digraph that contains one of its letters
  const overlaps = (d: string) => word.graphemes.some((g) => g !== d && (g.includes(d) || d.includes(g)));
  const decoys = shuffle(intro.filter((id) => !sounds.has(phonemeOf(id)) && !overlaps(id)), rng).slice(0, extra);
  return shuffle([...word.graphemes, ...decoys], rng);
};
/** One drum beat per sound in the word. */
export const drumBeats = (word: Word): number => word.graphemes.length;

/** Distractor pictures for an oral game: different first sound, and never a look-alike of the answer. */
export const pickDistractors = (pool: Word[], target: Word, n: number, rng: Rng): Word[] =>
  shuffle(pool.filter((x) => x.text !== target.text && x.graphemes[0] !== target.graphemes[0] && !isConfusable(x.text, target.text)), rng).slice(0, n);
