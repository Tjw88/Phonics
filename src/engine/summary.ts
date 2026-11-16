// The parent's "This week" summary: what was played, what is new, what became secure, what could use a little practice.
// Pure functions of the saved state and today's date (no clock, no DOM), so it is unit-tested.
//
// Honesty rules for the wording (the numbers are the app's own graded questions, not an assessment of the child):
//  * no streaks, no "you missed a day" language, no comparison with other children (the spec's banned-patterns list)
//  * a sound is "worth a little practice" on the evidence of a handful of answers only, and the text says it is a nudge
import { addDays } from './dates';
import { GRAPHEME_BY_ID } from './data';
import { MASTERY_DAYS, WORD_READ_DAYS, wordsRead, type ChildState } from './state';

export const WEEK_DAYS = 7;
/** A sound needs this many graded answers in the week before it can be flagged (fewer says nothing reliable). */
export const WOBBLY_MIN_TRIES = 4;
export const WOBBLY_BELOW = 0.5;

export interface DaySummary { date: string; minutes: number; adventure: boolean }
export interface WeekSummary {
  from: string;
  to: string;
  perDay: DaySummary[]; // oldest first, always WEEK_DAYS long
  daysPlayed: number;
  minutes: number;
  newSounds: string[]; // introduced this week (not counting sounds placement skipped), in teaching order
  secured: string[]; // became secure (third passing day) this week
  practising: { id: string; days: number }[]; // introduced, not yet secure: passing days so far, of MASTERY_DAYS
  wobbly: { id: string; correct: number; tries: number }[]; // enough answers this week and under half first-try
  tries: number;
  correct: number;
  wordsNew: string[]; // counted as "read" for the first time this week
  wordsTotal: number;
  focus: string | null; // the sound to hunt for away from the screen
}

const inWindow = (d: string, from: string, to: string): boolean => d >= from && d <= to;
const ORDER = new Map([...GRAPHEME_BY_ID.keys()].map((id, i) => [id, i]));
const order = (a: string, b: string): number => (ORDER.get(a) ?? 0) - (ORDER.get(b) ?? 0);

export const weeklySummary = (s: ChildState, today: string): WeekSummary => {
  const from = addDays(today, -(WEEK_DAYS - 1));
  const perDay: DaySummary[] = [];
  for (let i = 0; i < WEEK_DAYS; i++) {
    const date = addDays(from, i);
    perDay.push({ date, minutes: Math.round((s.playMs[date] ?? 0) / 60_000), adventure: s.adventureDays.includes(date) });
  }
  // a day counts as played if there was any play time (even under a minute) or a finished adventure
  const daysPlayed = perDay.filter((d) => d.adventure || (s.playMs[d.date] ?? 0) > 0).length;
  const minutes = Math.round(perDay.reduce((n, d) => n + (s.playMs[d.date] ?? 0), 0) / 60_000);

  const ids = Object.keys(s.sounds).filter((id) => GRAPHEME_BY_ID.has(id));

  // placement seeds the sounds of sets the child already knows as "introduced"; those are not new this week
  const newSounds = ids
    .filter((id) => inWindow(s.sounds[id]!.introducedOn, from, today) && GRAPHEME_BY_ID.get(id)!.set >= s.startSet)
    .sort(order);

  const secured = ids
    .filter((id) => {
      const days = [...s.sounds[id]!.correctDays].sort();
      return days.length >= MASTERY_DAYS && inWindow(days[MASTERY_DAYS - 1]!, from, today);
    })
    .sort(order);

  const practising = ids
    .filter((id) => s.sounds[id]!.correctDays.length < MASTERY_DAYS)
    .sort(order)
    .map((id) => ({ id, days: s.sounds[id]!.correctDays.length }));

  let tries = 0;
  let correct = 0;
  const wobbly: WeekSummary['wobbly'] = [];
  for (const id of ids) {
    let n = 0;
    let c = 0;
    for (const [d, t] of Object.entries(s.sounds[id]!.dayTally)) if (inWindow(d, from, today)) { n += t.n; c += t.c; }
    tries += n;
    correct += c;
    if (n >= WOBBLY_MIN_TRIES && c / n < WOBBLY_BELOW) wobbly.push({ id, correct: c, tries: n });
  }
  wobbly.sort((a, b) => a.correct / a.tries - b.correct / b.tries || order(a.id, b.id));

  const read = new Set(wordsRead(s));
  const wordsNew = Object.entries(s.words)
    .filter(([w, r]) => read.has(w) && inWindow([...r.correctDays].sort()[WORD_READ_DAYS - 1] ?? '', from, today))
    .map(([w]) => w)
    .sort();

  const focus = wobbly[0]?.id ?? newSounds[newSounds.length - 1] ?? practising[0]?.id ?? null;
  return { from, to: today, perDay, daysPlayed, minutes, newSounds, secured, practising, wobbly, tries, correct, wordsNew, wordsTotal: read.size, focus };
};

const slash = (id: string): string => `/${GRAPHEME_BY_ID.get(id)?.phoneme ?? id}/`;
const list = (xs: string[]): string => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;

/** Plain sentences for the parent screen (kept out of the UI so they can be tested). */
export const weekLines = (w: WeekSummary): string[] => {
  const out: string[] = [];
  if (w.daysPlayed === 0) {
    out.push('No play in the last 7 days. Nothing is lost: the sounds your child has learned stay saved, and the next adventure picks up where you left off.');
  } else {
    out.push(`Played on ${plural(w.daysPlayed, 'day')} of the last 7, about ${plural(w.minutes, 'minute')} in all.`);
  }
  if (w.newSounds.length) out.push(`New this week: ${list(w.newSounds.map(slash))}.`);
  if (w.secured.length) out.push(`Now secure (right first time on ${MASTERY_DAYS} different days): ${list(w.secured.map(slash))}.`);
  if (w.wordsNew.length) out.push(`Words read for the first time: ${list(w.wordsNew)}.`);
  if (w.wobbly.length)
    out.push(`A little practice could help with ${list(w.wobbly.map((x) => slash(x.id)))}. This is a nudge from only ${plural(w.wobbly.reduce((n, x) => n + x.tries, 0), 'answer')}, not a test result.`);
  return out;
};

/** The off-screen suggestion that goes with the summary (said as a sound, never a letter name). */
export const weekActivity = (w: WeekSummary): string =>
  w.focus
    ? `Sound hunt this week: find three things at home that start with ${slash(w.focus)}, and say the sound together (not the letter name).`
    : 'Sound hunt this week: find something at home that goes “mmm”, “sss” or “fff”, then say it together.';
