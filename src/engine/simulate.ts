import { GRAPHEMES, type Grapheme } from './data';
import { addDays, seeded, type Rng } from './dates';
import {
  NEW_SOUND_TRIALS, REVIEW_SOUND_TRIALS, buildFeedTrial, startAdventure, type Plan,
} from './session';
import { isSecure, newChild, recordTrial, recordWord, wordsRead, type ChildState } from './state';

/**
 * Play one whole adventure as a synthetic child with the given first-try accuracy, using the same planner,
 * trial builder and recorder as the UI. Used by tests, the pacing script and the prototype's fast-forward tool.
 */
export const playDay = (s: ChildState, today: string, accuracy: number, rng: Rng): Plan => {
  const plan = startAdventure(s, today, rng);
  const run = (g: Grapheme, idxs: readonly number[]) => {
    for (const i of idxs) {
      const t = buildFeedTrial(s, g, i, rng);
      const ok = t.choices < 2 ? true : rng() < accuracy;
      recordTrial(s, g.id, { firstTryCorrect: ok, choices: t.choices }, today);
    }
  };
  if (plan.newSound) run(plan.newSound, NEW_SOUND_TRIALS);
  for (const g of plan.review) run(g, REVIEW_SOUND_TRIALS);
  for (const w of plan.bridgeWords) recordWord(s, w.text, rng() < accuracy, today);
  if (plan.makeItReal?.mode === 'print') recordWord(s, plan.makeItReal.word.text, rng() < accuracy, today);
  if (!s.adventureDays.includes(today)) s.adventureDays.push(today);
  const collect = plan.newSound?.id ?? plan.review[0]?.id;
  if (collect && !s.collection.includes(collect)) s.collection.push(collect);
  return plan;
};

export interface DayLog { day: number; newSound: string | null; securedTotal: number; wordsRead: number; consolidation: boolean }

export interface SimOptions {
  /** probability of a first-try correct answer on a 2+ choice trial */
  accuracy: number;
  /** days since start on which the child plays (0-based); default every day */
  plays?: (day: number) => boolean;
  days: number;
  seed?: number;
}

export const simulate = (opts: SimOptions): { state: ChildState; log: DayLog[] } => {
  const rng = seeded(opts.seed ?? 1);
  const s = newChild();
  const start = '2026-01-05';
  const log: DayLog[] = [];
  for (let d = 0; d < opts.days; d++) {
    if (opts.plays && !opts.plays(d)) continue;
    const plan = playDay(s, addDays(start, d), opts.accuracy, rng);
    log.push({
      day: d + 1,
      newSound: plan.newSound?.id ?? null,
      securedTotal: GRAPHEMES.filter((g) => isSecure(s, g.id)).length,
      wordsRead: wordsRead(s).length,
      consolidation: plan.consolidation,
    });
  }
  return { state: s, log };
};
