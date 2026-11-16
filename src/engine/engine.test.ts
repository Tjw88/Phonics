import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ACCENTS, ACCENT_EXCLUDE, BANK, GRAPHEMES, SAFARI_EXCLUDE, bankFor, graphemesInSet, safariFor } from './data';
import { seeded } from './dates';
import { idsUpToSet, isDecodable, lintBank, lintWord } from './linter';
import { pickReview } from './review';
import {
  applyPlacement, buildFeedTrial, buildPlacement, decodableWords, scorePlacement, startAdventure,
} from './session';
import { simulate } from './simulate';
import {
  MASTERY_DAYS, carriedForward, choicesForTrial, introduce, isSecure, newChild, nextNewSound, recordTrial, recordWord,
  statusOf, unlockedSet, wordsRead,
} from './state';

const good = (s: ReturnType<typeof newChild>, id: string, day: string) => {
  recordTrial(s, id, { firstTryCorrect: true, choices: 2 }, day);
  recordTrial(s, id, { firstTryCorrect: true, choices: 3 }, day);
};
const D = (n: number) => `2026-01-${String(n).padStart(2, '0')}`;

describe('curriculum data', () => {
  it('has the 23 MVP graphemes in the spec order', () => {
    expect(GRAPHEMES.map((g) => g.id).join(' ')).toBe(
      's a t p i n m d g o c k ck e u r h b f ff l ll ss',
    );
    expect(graphemesInSet(1).map((g) => g.id)).toEqual(['s', 'a', 't', 'p']);
  });
});

describe('content linter', () => {
  it('passes the shipped bank at the end of set 5', () => {
    expect(lintBank()).toEqual([]);
  });
  it('flags the spec’s own "egg" example: the gg grapheme is not taught in sets 1-5', () => {
    const egg = BANK.find((w) => w.text === 'egg')!;
    expect(egg.graphemes).toEqual(['e', 'gg']);
    const kinds = lintWord(egg, idsUpToSet(5)).map((i) => i.kind);
    expect(kinds).toContain('unknown-grapheme');
  });
  it('accepts the spec’s decodable examples dig, big, rock when their sounds are taught', () => {
    const find = (t: string) => BANK.find((w) => w.text === t)!;
    expect(isDecodable(find('dig'), idsUpToSet(3))).toBe(true);
    expect(isDecodable(find('rock'), idsUpToSet(4))).toBe(true);
    expect(isDecodable(find('rock'), idsUpToSet(3))).toBe(false); // ck is set 4
    expect(isDecodable(find('big'), idsUpToSet(5))).toBe(true);
    expect(isDecodable(find('big'), idsUpToSet(4))).toBe(false); // b is set 5
  });
  it('never offers oral-only words for print', () => {
    const egg = BANK.find((w) => w.text === 'egg')!;
    expect(egg.oralOnly).toBe(true);
    expect(isDecodable(egg, idsUpToSet(5))).toBe(false);
  });
  it('flags two words that share a picture (ambiguous Robot Talk rounds)', () => {
    const dup = [
      { text: 'tin', graphemes: ['t', 'i', 'n'], emoji: '🥫' },
      { text: 'can', graphemes: ['c', 'a', 'n'], emoji: '🥫' },
    ];
    expect(lintBank(dup).map((i) => i.kind)).toContain('duplicate-picture');
  });
  it('catches unsuitable words and bad segmentation', () => {
    expect(lintWord({ text: 'ass', graphemes: ['a', 'ss'] }, idsUpToSet(5)).map((i) => i.kind)).toContain('unsuitable');
    expect(lintWord({ text: 'cat', graphemes: ['c', 'a', 'p'] }, idsUpToSet(5)).map((i) => i.kind)).toContain('segmentation');
  });
});

describe('mastery gate', () => {
  it('needs a passing day on three separate days', () => {
    const s = newChild();
    introduce(s, 's', D(1));
    for (let i = 0; i < 10; i++) recordTrial(s, 's', { firstTryCorrect: true, choices: 2 }, D(1));
    expect(statusOf(s, 's')).toBe('learning'); // ten right in one day is still one day
    good(s, 's', D(2));
    expect(isSecure(s, 's')).toBe(false);
    good(s, 's', D(5));
    expect(isSecure(s, 's')).toBe(true);
    expect(s.sounds.s!.correctDays.length).toBe(MASTERY_DAYS);
  });
  it('a lucky single tap does not pass a day; a day can also be lost again', () => {
    const s = newChild();
    introduce(s, 's', D(1));
    recordTrial(s, 's', { firstTryCorrect: true, choices: 3 }, D(1));
    expect(s.sounds.s!.correctDays).toEqual([]); // only 1 correct
    recordTrial(s, 's', { firstTryCorrect: true, choices: 3 }, D(1));
    expect(s.sounds.s!.correctDays).toEqual([D(1)]); // 2/2
    for (let i = 0; i < 3; i++) recordTrial(s, 's', { firstTryCorrect: false, choices: 3 }, D(1));
    expect(s.sounds.s!.correctDays).toEqual([]); // 2/5 = 40% < 60%
  });
  it('ignores one-choice (errorless) trials and wrong first tries', () => {
    const s = newChild();
    introduce(s, 'a', D(1));
    recordTrial(s, 'a', { firstTryCorrect: true, choices: 1 }, D(1));
    recordTrial(s, 'a', { firstTryCorrect: false, choices: 2 }, D(2));
    expect(s.sounds.a!.correctDays).toEqual([]);
    expect(s.sounds.a!.attempts).toBe(1);
  });
  it('follows 1, 2, 3 choices through a session', () => {
    expect([0, 1, 2, 3].map(choicesForTrial)).toEqual([1, 2, 3, 3]);
  });
});

describe('set unlocking', () => {
  it('opens set 2 when 3 of the 4 set-1 sounds are secure, and carries the 4th forward', () => {
    const s = newChild();
    for (const id of ['s', 'a', 't', 'p']) introduce(s, id, D(1));
    expect(unlockedSet(s)).toBe(1);
    expect(nextNewSound(s)).toBeNull(); // nothing new until enough of set 1 is secure
    for (const id of ['s', 'a']) for (const d of [1, 2, 3]) good(s, id, D(d));
    expect(unlockedSet(s)).toBe(1); // 2 of 4
    for (const d of [1, 2, 3]) good(s, 't', D(d));
    expect(unlockedSet(s)).toBe(2); // 3 of 4
    expect(nextNewSound(s)?.id).toBe('i');
    expect(carriedForward(s)).toEqual(['p']);
    // the carried-forward sound is still reviewed even though a new set is open
    expect(pickReview(s, D(9)).map((g) => g.id)).toContain('p');
    // and it can still become secure later
    for (const d of [4, 5, 6]) good(s, 'p', D(d));
    expect(carriedForward(s)).toEqual([]);
  });
  it('2 of 4 is not enough: a child who knows half of a set does not move on', () => {
    const s = newChild();
    for (const id of ['s', 'a', 't', 'p']) introduce(s, id, D(1));
    for (const id of ['s', 'a']) for (const d of [1, 2, 3]) good(s, id, D(d));
    expect(unlockedSet(s)).toBe(1);
  });
});

describe('spaced review', () => {
  it('prefers the sound the child found hardest and excludes today’s new sound', () => {
    const s = newChild();
    for (const id of ['s', 'a', 't']) introduce(s, id, D(1));
    for (let i = 0; i < 4; i++) recordTrial(s, 's', { firstTryCorrect: true, choices: 2 }, D(1));
    for (let i = 0; i < 4; i++) recordTrial(s, 'a', { firstTryCorrect: false, choices: 2 }, D(1));
    const r = pickReview(s, D(3), ['t']);
    expect(r[0]!.id).toBe('a');
    expect(r.map((g) => g.id)).not.toContain('t');
  });
  it('does not review a sound on the day it was introduced', () => {
    const s = newChild();
    introduce(s, 's', D(1));
    expect(pickReview(s, D(1))).toEqual([]);
  });
});

describe('adventure planner', () => {
  it('introduces one new sound per day and is stable on replay', () => {
    const s = newChild();
    const p1 = startAdventure(s, D(1), seeded(1));
    expect(p1.newSound?.id).toBe('s');
    const again = startAdventure(s, D(1), seeded(2));
    expect(again.newSound?.id).toBe('s');
    expect(Object.keys(s.sounds)).toEqual(['s']);
    expect(startAdventure(s, D(2), seeded(1)).newSound?.id).toBe('a');
  });
  it('uses oral Make-it-real (no letters) until set 1 is secure, then printed words', () => {
    const s = newChild();
    const p = startAdventure(s, D(1), seeded(3));
    expect(p.printBlend).toBe(false);
    expect(p.makeItReal?.mode).toBe('oral');
    expect(p.bridgeWords).toEqual([]);
    for (const id of ['s', 'a', 't', 'p']) {
      introduce(s, id, D(1));
      for (const d of [1, 2, 3]) good(s, id, D(d));
    }
    const p2 = startAdventure(s, D(10), seeded(3));
    expect(p2.printBlend).toBe(true);
    expect(p2.makeItReal?.mode).toBe('print');
    for (const w of p2.bridgeWords) expect(w.graphemes.every((g) => s.sounds[g])).toBe(true);
  });
  it('only ever plans printed words from introduced sounds', () => {
    const { state } = simulate({ accuracy: 0.9, days: 40, seed: 7 });
    for (const w of decodableWords(state)) expect(w.graphemes.every((g) => state.sounds[g])).toBe(true);
  });
});

describe('feed trials', () => {
  it('has exactly one right answer: c, k and ck are never offered together', () => {
    const s = newChild();
    for (const g of GRAPHEMES) introduce(s, g.id, D(1));
    const rng = seeded(11);
    for (let i = 0; i < 200; i++) {
      for (const g of GRAPHEMES) {
        const t = buildFeedTrial(s, g, 3, rng);
        const sameSound = t.options.filter((o) => o.phoneme === g.phoneme);
        expect(sameSound).toEqual([g]);
        expect(t.options.length).toBeLessThanOrEqual(3);
      }
    }
  });
  it('day 1 can only offer a single option (only /s/ is known)', () => {
    const s = newChild();
    introduce(s, 's', D(1));
    expect(buildFeedTrial(s, GRAPHEMES[0]!, 3, seeded(1)).choices).toBe(1);
  });
});

describe('placement', () => {
  it('starts from scratch if the first set fails, and skips sets passed 2/2', () => {
    const items = buildPlacement(seeded(5));
    expect(items).toHaveLength(6);
    expect(scorePlacement(items, [false, true, true, true, true, true])).toBe(1);
    expect(scorePlacement(items, [true, true, true, true, false, true])).toBe(3);
    expect(scorePlacement(items, [true, true, true, true, true, true])).toBe(4);
  });
  it('always has one right answer', () => {
    for (let seed = 0; seed < 50; seed++)
      for (const it of buildPlacement(seeded(seed)))
        expect(it.options.filter((o) => o.phoneme === it.target.phoneme)).toEqual([it.target]);
  });
  it('seeds skipped sets as learning, never secure', () => {
    const s = newChild();
    applyPlacement(s, 3, D(1));
    expect(unlockedSet(s)).toBe(3);
    expect(statusOf(s, 's')).toBe('learning');
    expect(statusOf(s, 'g')).toBe('not-started');
  });
});

describe('words read', () => {
  it('counts a word after first-try success on two separate days', () => {
    const s = newChild();
    recordWord(s, 'sat', true, D(1));
    recordWord(s, 'sat', true, D(1));
    expect(wordsRead(s)).toEqual([]);
    recordWord(s, 'sat', true, D(2));
    expect(wordsRead(s)).toEqual(['sat']);
  });
});

describe('pacing vs the spec’s success targets', () => {
  it('a daily 90%-accurate child clears set 1 and reads words; consolidation days occur', () => {
    const { log } = simulate({ accuracy: 0.9, days: 60, seed: 3 });
    const firstWords = log.find((d) => d.wordsRead > 0);
    expect(firstWords).toBeDefined();
    expect(log.some((d) => d.consolidation)).toBe(true);
  });
});

describe('accents', () => {
  it('RP drops "pass" (BATH vowel); northern English keeps it', () => {
    expect(bankFor('rp').some((w) => w.text === 'pass')).toBe(false);
    expect(bankFor('north').some((w) => w.text === 'pass')).toBe(true);
  });
  it('only excludes words that exist in the bank', () => {
    for (const a of ACCENTS) for (const w of ACCENT_EXCLUDE[a.id]) expect(BANK.some((b) => b.text === w), w).toBe(true);
  });
  it('the planner honours the accent: "pass" is plannable for a northern child only', () => {
    const mk = (accent: 'rp' | 'north') => {
      const s = newChild();
      s.accent = accent;
      for (const g of GRAPHEMES) introduce(s, g.id, D(1));
      return decodableWords(s).map((w) => w.text);
    };
    expect(mk('rp')).not.toContain('pass');
    expect(mk('north')).toContain('pass');
  });
  it('switching accent keeps progress, because progress is keyed by letter not by accent', () => {
    const s = newChild();
    introduce(s, 's', D(1));
    for (const d of [1, 2, 3]) good(s, 's', D(d));
    s.accent = 'north';
    expect(isSecure(s, 's')).toBe(true);
  });
});

describe('generated audio stays in sync with the curriculum, per accent', () => {
  const root = new URL('../../public/audio/', import.meta.url);
  for (const accent of ACCENTS) {
    describe(accent.label, () => {
      const manifest = JSON.parse(readFileSync(new URL(`${accent.id}/manifest.json`, root), 'utf8')) as {
        phonemes: Record<string, string[]>; words: Record<string, string>; removed_words: string[]; removed_safari: string[];
      };
      const audit = JSON.parse(readFileSync(new URL(`../../scripts/audio/audit-${accent.id}.json`, import.meta.url), 'utf8')) as { problems: string[] };

      it('has a clip for every sound, and every file exists', () => {
        for (const g of GRAPHEMES) expect(manifest.phonemes[g.phoneme], `phoneme /${g.phoneme}/`).toBeTruthy();
        for (const files of Object.values(manifest.phonemes)) for (const f of files) expect(existsSync(new URL(f, root)), f).toBe(true);
      });
      it('has a clip for every usable word, and the exclusions match the engine data', () => {
        expect([...manifest.removed_words].sort()).toEqual([...ACCENT_EXCLUDE[accent.id]].sort());
        for (const w of bankFor(accent.id)) {
          expect(manifest.words[w.text], `word "${w.text}"`).toBeTruthy();
          expect(existsSync(new URL(manifest.words[w.text] as string, root)), w.text).toBe(true);
        }
      });
      it('has a clip for every Sound Safari item, and the exclusions match the engine data', () => {
        expect([...manifest.removed_safari].sort()).toEqual([...SAFARI_EXCLUDE[accent.id]].sort());
        for (const i of safariFor(accent.id)) expect(manifest.words[i.word], `safari "${i.word}"`).toBeTruthy();
      });
      it('the audio audit reported no mechanical problems', () => {
        expect(audit.problems).toEqual([]);
      });
    });
  }
});
