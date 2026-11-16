import { describe, expect, it } from 'vitest';
import { applyPlacement } from './session';
import { WEEK_DAYS, WOBBLY_MIN_TRIES, weekActivity, weekLines, weeklySummary } from './summary';
import { introduce, newChild, recordTrial, recordWord, type ChildState } from './state';

const D = (n: number) => `2026-03-${String(n).padStart(2, '0')}`;
const TODAY = D(20);
/** Record graded first-try answers for a sound on a day: `right` correct, `wrong` wrong. */
const answer = (s: ChildState, id: string, day: string, right: number, wrong: number) => {
  for (let i = 0; i < right; i++) recordTrial(s, id, { firstTryCorrect: true, choices: 3 }, day);
  for (let i = 0; i < wrong; i++) recordTrial(s, id, { firstTryCorrect: false, choices: 3 }, day);
};
/** Make a sound secure with its third passing day on `last`. */
const secure = (s: ChildState, id: string, last: number) => {
  for (const d of [last - 2, last - 1, last]) answer(s, id, D(d), 2, 0);
};

describe('weekly summary (parent screen)', () => {
  it('an unplayed week says so kindly, offers a default off-screen activity and flags nothing', () => {
    const w = weeklySummary(newChild(), TODAY);
    expect(w.perDay).toHaveLength(WEEK_DAYS);
    expect(w.perDay[0]!.date).toBe(D(14));
    expect(w.perDay[6]!.date).toBe(TODAY);
    expect(w.daysPlayed).toBe(0);
    expect(w.focus).toBeNull();
    expect(weekLines(w)[0]).toMatch(/No play in the last 7 days\. Nothing is lost/);
    expect(weekActivity(w)).toMatch(/Sound hunt/);
  });

  it('counts a day as played for any play time or a finished adventure, and totals minutes', () => {
    const s = newChild();
    s.playMs[D(15)] = 5 * 60_000;
    s.playMs[D(17)] = 20_000; // under a minute still counts as a day played
    s.adventureDays.push(D(19));
    s.playMs[D(10)] = 99 * 60_000; // outside the 7-day window: ignored
    const w = weeklySummary(s, TODAY);
    expect(w.daysPlayed).toBe(3);
    expect(w.minutes).toBe(5);
    expect(weekLines(w)[0]).toBe('Played on 3 days of the last 7, about 5 minutes in all.');
  });

  it('"new this week" uses the introduction day, within the window only, and never counts sounds that placement skipped', () => {
    const s = newChild();
    introduce(s, 's', D(13)); // 7 days ago: outside
    introduce(s, 'a', D(14)); // first day of the window: inside
    introduce(s, 't', D(20));
    expect(weeklySummary(s, TODAY).newSounds).toEqual(['a', 't']);

    const placed = newChild();
    applyPlacement(placed, 3, D(18)); // sets 1-2 seeded as introduced
    introduce(placed, 'g', D(19));
    expect(weeklySummary(placed, TODAY).newSounds).toEqual(['g']);
  });

  it('"secured" is dated by the THIRD passing day, not by when the sound was introduced', () => {
    const s = newChild();
    introduce(s, 's', D(1));
    secure(s, 's', 18); // third passing day inside the window
    introduce(s, 'a', D(1));
    secure(s, 'a', 10); // secured long ago
    introduce(s, 't', D(1));
    answer(s, 't', D(18), 2, 0);
    answer(s, 't', D(19), 2, 0); // two passing days: not yet secure
    const w = weeklySummary(s, TODAY);
    expect(w.secured).toEqual(['s']);
    expect(w.practising).toEqual([{ id: 't', days: 2 }]);
    expect(weekLines(w).join(' ')).toContain('Now secure (right first time on 3 different days): /s/.');
  });

  it('flags a sound only with enough answers this week and under half first-try; the wording calls it a nudge', () => {
    const s = newChild();
    for (const id of ['s', 'a', 't', 'p']) introduce(s, id, D(1));
    answer(s, 's', D(19), 0, WOBBLY_MIN_TRIES - 1); // too few answers to say anything
    answer(s, 'a', D(19), 1, 3); // 1 of 4: flagged
    answer(s, 't', D(19), 2, 2); // exactly half: not flagged
    answer(s, 'p', D(5), 0, 8); // a bad patch before the window: not this week's business
    const w = weeklySummary(s, TODAY);
    expect(w.wobbly).toEqual([{ id: 'a', correct: 1, tries: 4 }]);
    expect(w.focus).toBe('a'); // the sound to hunt for at home is the one that needs it
    expect(weekActivity(w)).toContain('/a/');
    expect(weekLines(w).join(' ')).toMatch(/A little practice could help with \/a\/\. This is a nudge from only 4 answers, not a test result\./);
  });

  it('words count as "new" in the week their second correct day falls in', () => {
    const s = newChild();
    recordWord(s, 'sat', true, D(2));
    recordWord(s, 'sat', true, D(18)); // read as of D18 (second day): new this week
    recordWord(s, 'pin', true, D(2));
    recordWord(s, 'pin', true, D(3)); // read long ago
    recordWord(s, 'tap', true, D(19)); // only one day so far: not read yet
    const w = weeklySummary(s, TODAY);
    expect(w.wordsNew).toEqual(['sat']);
    expect(w.wordsTotal).toBe(2);
  });

  it('the wording has no streaks, guilt or comparisons, and never says a letter name', () => {
    const s = newChild();
    for (const id of ['s', 'a']) introduce(s, id, D(19));
    answer(s, 'a', D(19), 0, 5);
    s.playMs[D(19)] = 90_000;
    const text = [...weekLines(weeklySummary(s, TODAY)), weekActivity(weeklySummary(s, TODAY)), ...weekLines(weeklySummary(newChild(), TODAY))].join(' ').toLowerCase();
    for (const bad of ['streak', 'missed', 'behind', 'falling', 'failed', 'should have', 'other children', 'average', 'best', 'worst', 'lazy', 'lost your'])
      expect(text, bad).not.toContain(bad);
    expect(text).toContain('/a/');
  });
});
