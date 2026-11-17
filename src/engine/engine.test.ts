import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ACCENTS, ACCENT_EXCLUDE, BANK, GRAPHEMES, SAFARI_EXCLUDE, bankFor, graphemesInSet, safariFor, soundsClose } from './data';
import { addDays, seeded } from './dates';
import { idsUpToSet, isDecodable, lintBank, lintWord } from './linter';
import { pickReview } from './review';
import {
  applyPlacement, buildFeedTrial, buildPlacement, decodableWords, scorePlacement, startAdventure,
} from './session';
import { playDay, simulate } from './simulate';
import {
  BUTTON_FADE_AT, MASTERY_DAYS, buttonsFaded, carriedForward, choicesForTrial, introduce, isSecure, newChild, nextNewSound, recordTrial, recordWord,
  statusOf, unlockedSet, wordsRead,
} from './state';

const good = (s: ReturnType<typeof newChild>, id: string, day: string) => {
  recordTrial(s, id, { firstTryCorrect: true, choices: 2 }, day);
  recordTrial(s, id, { firstTryCorrect: true, choices: 3 }, day);
};
const D = (n: number) => `2026-01-${String(n).padStart(2, '0')}`;

describe('curriculum data', () => {
  it('has the 23 MVP graphemes in the spec order, then the set-6 and set-7 digraphs', () => {
    expect(GRAPHEMES.map((g) => g.id).join(' ')).toBe(
      's a t p i n m d g o c k ck e u r h b f ff l ll ss sh ch th ng ai ee oa oo',
    );
    expect(graphemesInSet(1).map((g) => g.id)).toEqual(['s', 'a', 't', 'p']);
    expect(graphemesInSet(6).map((g) => g.id)).toEqual(['sh', 'ch', 'th', 'ng']);
    expect(graphemesInSet(7).map((g) => g.id)).toEqual(['ai', 'ee', 'oa', 'oo']);
    // a digraph is ONE sound: it must not share a key with the letters it is written with
    for (const id of ['sh', 'ch', 'th', 'ng', 'ai', 'ee', 'oa', 'oo']) expect(['s', 'h', 'c', 't', 'n', 'g', 'a', 'e', 'o']).not.toContain(GRAPHEMES.find((g) => g.id === id)!.phoneme);
  });
  it('keeps out words whose digraph or vowel would teach the wrong sound', () => {
    // voiced th (this/that/then/with), the BATH vowel (bath/path), the foot vowel (bush/push), and w-words (no w is taught)
    // the short oo (book, look, good, foot), room/roof/root (said both ways), poop, and z-words (no z is taught)
    const banned = ['this', 'that', 'then', 'them', 'with', 'the', 'bath', 'path', 'maths', 'bush', 'push', 'wing', 'swing', 'shit', 'book', 'look', 'good', 'foot', 'room', 'roof', 'root', 'poop', 'zoo'];
    for (const w of BANK) expect(banned, w.text).not.toContain(w.text);
  });
});

describe('content linter', () => {
  it('passes the shipped bank at the end of set 7', () => {
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
    expect(items).toHaveLength(14); // two per set, sets 1-7
    expect([...new Set(items.map((i) => i.set))]).toEqual([1, 2, 3, 4, 5, 6, 7]);
    const yes = (n: number) => Array(n).fill(true) as boolean[];
    expect(scorePlacement(items, [false, ...yes(13)])).toBe(1);
    expect(scorePlacement(items, [...yes(4), false, true, ...yes(8)])).toBe(3);
    expect(scorePlacement(items, yes(6))).toBe(4);
    expect(scorePlacement(items, yes(10))).toBe(6); // 2/2 on sets 1-5 starts at set 6
    expect(scorePlacement(items, yes(12))).toBe(7); // 2/2 on sets 1-6 starts at set 7
    expect(scorePlacement(items, yes(14))).toBe(7); // there is no set 8
    // the UI stops at the first miss, so results can be shorter than the item list: a missing answer is a miss
    expect(scorePlacement(items, [...yes(2), false])).toBe(2);
  });
  it('never asks for a double (ck ff ll ss) or a sound shared inside its set, and never offers a sound-alike', () => {
    for (let seed = 0; seed < 60; seed++)
      for (const it of buildPlacement(seeded(seed))) {
        expect(['ck', 'ff', 'll', 'ss', 'c', 'k']).not.toContain(it.target.id); // (ee and oo are real graphemes, not doubles, so they may be asked)
        for (const o of it.options) if (o !== it.target) expect(soundsClose(o.phoneme, it.target.phoneme), `${it.target.id} vs ${o.id}`).toBe(false);
        expect(it.options.length).toBeGreaterThanOrEqual(2);
      }
  });
  it('placing at set 6 introduces sets 1-5 as learning and leaves the digraphs for later', () => {
    const s = newChild();
    applyPlacement(s, 6, D(1));
    expect(unlockedSet(s)).toBe(6);
    expect(statusOf(s, 'ck')).toBe('learning');
    expect(statusOf(s, 'sh')).toBe('not-started');
    expect(nextNewSound(s)?.id).toBe('sh');
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

describe('set 6 (digraphs) in play', () => {
  it('a daily 90%-accurate child reaches sh, ch, th and ng, and every day on the way has a playable plan', () => {
    const rng = seeded(11);
    const s = newChild();
    const seen = new Set<string>();
    for (let d = 0; d < 120 && !['sh', 'ch', 'th', 'ng'].every((g) => seen.has(g)); d++) {
      const plan = playDay(s, addDays('2026-01-05', d), 0.9, rng);
      if (plan.newSound) seen.add(plan.newSound.id);
      expect(plan.robotWords.length, `day ${d} robot words`).toBe(3);
      expect(plan.drumWords.length, `day ${d} drum words`).toBeGreaterThan(0);
      if (plan.printBlend) expect(plan.bridgeWords.length, `day ${d} bridge words`).toBe(3);
      if (plan.newSound?.set === 6) {
        // a day that teaches a digraph has words that use it, spoken and printable from what has been taught
        const withIt = decodableWords(s).filter((w) => w.graphemes.includes(plan.newSound!.id));
        expect(withIt.length, `${plan.newSound.id} words`).toBeGreaterThanOrEqual(3);
      }
    }
    expect([...seen].filter((g) => ['sh', 'ch', 'th', 'ng'].includes(g)).sort()).toEqual(['ch', 'ng', 'sh', 'th']);
    expect(unlockedSet(s)).toBe(6);
  });
  it('every digraph has enough decodable words, with at least two that have a picture (except th, which has one)', () => {
    const s = newChild();
    for (const g of GRAPHEMES) introduce(s, g.id, D(1));
    for (const g of ['sh', 'ch', 'th', 'ng']) {
      const ws = decodableWords(s).filter((w) => w.graphemes.includes(g));
      expect(ws.length, g).toBeGreaterThanOrEqual(6);
      expect(ws.filter((w) => w.emoji).length, `${g} pictured`).toBeGreaterThanOrEqual(g === 'th' ? 1 : 2);
    }
  });
});

describe('sound-button fading ("big reader" mode)', () => {
  const readWords = (s: ReturnType<typeof newChild>, n: number) => {
    for (let i = 0; i < n; i++) { recordWord(s, `w${i}`, true, D(1)); recordWord(s, `w${i}`, true, D(2)); }
  };
  it('starts once enough different words are read, and not before', () => {
    const s = newChild();
    expect(buttonsFaded(s)).toBe(false);
    readWords(s, BUTTON_FADE_AT - 1);
    expect(buttonsFaded(s)).toBe(false);
    readWords(s, BUTTON_FADE_AT);
    expect(buttonsFaded(s)).toBe(true);
  });
  it('a word counts as read only after two days, so a lucky day does not fade the buttons', () => {
    const s = newChild();
    for (let i = 0; i < 20; i++) recordWord(s, `w${i}`, true, D(1));
    expect(buttonsFaded(s)).toBe(false);
  });
  it('the parent can keep the buttons always', () => {
    const s = newChild();
    readWords(s, BUTTON_FADE_AT + 5);
    s.soundButtons = 'always';
    expect(buttonsFaded(s)).toBe(false);
  });
  it('an old save without the field defaults to auto', () => {
    expect(newChild().soundButtons).toBe('auto');
  });
});

describe('set 7 (vowel digraphs) in play', () => {
  it('a daily 90%-accurate child reaches ai, ee, oa and oo, and every day on the way has a playable plan', () => {
    const rng = seeded(21);
    const s = newChild();
    const seen = new Set<string>();
    const want = ['ai', 'ee', 'oa', 'oo'];
    for (let d = 0; d < 200 && !want.every((g) => seen.has(g)); d++) {
      const plan = playDay(s, addDays('2026-01-05', d), 0.9, rng);
      if (plan.newSound) seen.add(plan.newSound.id);
      expect(plan.robotWords.length, `day ${d} robot words`).toBe(3);
      if (plan.printBlend) expect(plan.bridgeWords.length, `day ${d} bridge words`).toBe(3);
      if (plan.newSound?.set === 7) {
        const withIt = decodableWords(s).filter((w) => w.graphemes.includes(plan.newSound!.id));
        expect(withIt.length, `${plan.newSound.id} words`).toBeGreaterThanOrEqual(3);
      }
    }
    expect(want.filter((g) => seen.has(g))).toEqual(want);
    expect(unlockedSet(s)).toBe(7);
  });
  it('each vowel digraph has plenty of decodable words and at least two with a picture', () => {
    const s = newChild();
    for (const g of GRAPHEMES) introduce(s, g.id, D(1));
    for (const g of ['ai', 'ee', 'oa', 'oo']) {
      const ws = decodableWords(s).filter((w) => w.graphemes.includes(g));
      expect(ws.length, g).toBeGreaterThanOrEqual(8);
      expect(ws.filter((w) => w.emoji).length, `${g} pictured`).toBeGreaterThanOrEqual(2);
    }
  });
  it('a long vowel is never offered next to the short vowel it is built on', () => {
    const s = newChild();
    for (const g of GRAPHEMES) introduce(s, g.id, D(1));
    for (let seed = 0; seed < 100; seed++)
      for (const [short, long] of [['a', 'ai'], ['e', 'ai'], ['e', 'ee'], ['i', 'ee'], ['o', 'oa'], ['u', 'oo']] as const) {
        const target = GRAPHEMES.find((g) => g.id === long)!;
        expect(buildFeedTrial(s, target, 3, seeded(seed)).options.map((o) => o.id), `${long} with ${short}`).not.toContain(short);
        const t2 = GRAPHEMES.find((g) => g.id === short)!;
        expect(buildFeedTrial(s, t2, 3, seeded(seed)).options.map((o) => o.id), `${short} with ${long}`).not.toContain(long);
      }
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

describe('sound sweep: every sound is long enough to hear, loud enough, and every spoken instruction exists', () => {
  const MIN = { fric: 400, sonor: 380, vowel: 450 } as const;
  const KIND: Record<string, 'fric' | 'sonor' | 'vowel' | 'stop' | 'affr'> = {
    ai: 'vowel', ee: 'vowel', oa: 'vowel', oo: 'vowel',
    s: 'fric', f: 'fric', h: 'fric', sh: 'fric', th: 'fric', ch: 'affr', m: 'sonor', n: 'sonor', l: 'sonor', r: 'sonor', ng: 'sonor',
    a: 'vowel', i: 'vowel', o: 'vowel', e: 'vowel', u: 'vowel', p: 'stop', t: 'stop', k: 'stop', b: 'stop', d: 'stop', g: 'stop',
  };
  const kind = (k: string) => KIND[k] ?? 'stop';
  for (const accent of ACCENTS) {
    describe(accent.label, () => {
      const audit = JSON.parse(readFileSync(new URL(`../../scripts/audio/audit-${accent.id}.json`, import.meta.url), 'utf8')) as {
        phonemes: Record<string, { files: { ms: number; rms: number }[] }>;
      };
      const manifest = JSON.parse(readFileSync(new URL(`../../public/audio/${accent.id}/manifest.json`, import.meta.url), 'utf8')) as {
        phrases: Record<string, string>; phonemes: Record<string, string[]>;
      };
      it('all 26 sounds have three takes, each long and loud enough for its type', () => {
        expect(Object.keys(audit.phonemes).sort()).toEqual([...new Set(GRAPHEMES.map((g) => g.phoneme))].sort());
        expect(Object.keys(audit.phonemes).length).toBe(26);
        for (const [k, v] of Object.entries(audit.phonemes)) {
          expect(v.files.length, k).toBe(3);
          for (const f of v.files) {
            const t = kind(k);
            if (t === 'stop') { expect(f.ms, `/${k}/`).toBeGreaterThanOrEqual(130); expect(f.ms, `/${k}/`).toBeLessThanOrEqual(320); }
            else if (t === 'affr') { expect(f.ms, `/${k}/`).toBeGreaterThanOrEqual(150); expect(f.ms, `/${k}/`).toBeLessThanOrEqual(450); }
            else expect(f.ms, `/${k}/`).toBeGreaterThanOrEqual(MIN[t]);
            expect(f.rms, `/${k}/ too quiet`).toBeGreaterThan(0.04);
          }
        }
      });
      it('every instruction the screens speak exists as audio (so no child is left with text they cannot read)', () => {
        const src = ['games.ts', 'games2.ts', 'app.ts'].map((f) => readFileSync(new URL(`../ui/${f}`, import.meta.url), 'utf8')).join('\n');
        const keys = new Set([...src.matchAll(/phrase: '([a-z_]+)'/g), ...src.matchAll(/sayPhrase\('([a-z_]+)'/g)].map((m) => m[1] as string));
        expect(keys.size).toBeGreaterThan(8);
        for (const k of keys) expect(manifest.phrases[k], `no audio for spoken instruction "${k}"`).toBeTruthy();
        for (const g of GRAPHEMES) expect(manifest.phrases[`story_${g.id}`], `story line for ${g.id}`).toBeTruthy();
      });
    });
  }
});
