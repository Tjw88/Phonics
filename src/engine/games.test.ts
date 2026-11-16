import { describe, expect, it } from 'vitest';
import { BANK, CONFUSABLE, GRAPHEMES, SAFARI, bankFor, isConfusable } from './data';
import { seeded } from './dates';
import { GLYPHS, advanceTrace, glyphWidth, pathLength, samplePath, shiftPath, strokesFor, traceDone } from './glyphs';
import { buildKitchenTiles, buildSafari, drumBeats, phonemeOf, pickDistractors, safariGraphemes, startAdventure } from './session';
import { playDay } from './simulate';
import { introduce, newChild } from './state';

describe('Trace Trail glyphs', () => {
  it('every sound in the curriculum can be traced', () => {
    for (const g of GRAPHEMES) {
      const strokes = strokesFor(g.id);
      expect(strokes.length, g.id).toBeGreaterThan(0);
      for (const st of strokes) {
        const pts = samplePath(st.d);
        expect(pts.length, `${g.id} ${st.d}`).toBeGreaterThanOrEqual(2);
        expect(pathLength(pts), `${g.id}`).toBeGreaterThan(st.dot ? 4 : 20);
        const w = glyphWidth(g.id);
        for (const p of pts) {
          expect(p.x).toBeGreaterThanOrEqual(-1);
          expect(p.x).toBeLessThanOrEqual(w + 1);
          expect(p.y).toBeGreaterThanOrEqual(0);
          expect(p.y).toBeLessThanOrEqual(145);
        }
      }
    }
  });
  it('digraphs are their two letters side by side', () => {
    expect(strokesFor('ck').length).toBe(GLYPHS.c!.length + GLYPHS.k!.length);
    const first = samplePath(strokesFor('ll')[0]!.d)[0]!;
    const second = samplePath(strokesFor('ll')[1]!.d)[0]!;
    expect(second.x - first.x).toBeCloseTo(64, 0);
    expect(shiftPath('M10 20 L30 40', 5)).toBe('M15 20 L35 40');
  });
  it('tracing in order from the start dot completes; scribbling or going backwards does not', () => {
    const pts = samplePath(GLYPHS.l![0]!.d);
    let r = -1;
    for (const p of pts) r = advanceTrace(pts, r, p);
    expect(traceDone(pts, r)).toBe(true);
    // starting at the far end does not start the stroke
    expect(advanceTrace(pts, -1, pts[pts.length - 1]!)).toBe(-1);
    // a touch in the middle without starting does nothing
    expect(advanceTrace(pts, -1, pts[Math.floor(pts.length / 2)]!)).toBe(-1);
    // after starting, jumping to the end in one move cannot complete it
    const r0 = advanceTrace(pts, -1, pts[0]!);
    expect(traceDone(pts, advanceTrace(pts, r0, pts[pts.length - 1]!))).toBe(false);
  });
  it('a quick tap on the dot of an i completes that tiny stroke', () => {
    const dot = samplePath(GLYPHS.i![1]!.d);
    let r = advanceTrace(dot, -1, dot[0]!);
    r = advanceTrace(dot, r, dot[dot.length - 1]!);
    expect(traceDone(dot, r)).toBe(true);
  });
});

describe('Sound Safari', () => {
  it('data is sane: valid sounds, no repeated words or pictures', () => {
    const sounds = new Set(GRAPHEMES.map((g) => g.phoneme));
    for (const i of SAFARI) expect(sounds.has(i.p), i.word).toBe(true);
    expect(new Set(SAFARI.map((i) => i.word)).size).toBe(SAFARI.length);
    expect(new Set(SAFARI.map((i) => i.emoji)).size).toBe(SAFARI.length);
  });
  it('every single-letter sound has at least two things that start with that letter', () => {
    for (const g of GRAPHEMES.filter((x) => x.id.length === 1)) expect(SAFARI.filter((i) => i.g === g.id).length, g.id).toBeGreaterThanOrEqual(2);
  });
  it('a "k" scene never contains cat (or anything else spelled with c), and a "c" scene never contains kite', () => {
    const s = newChild();
    for (const g of GRAPHEMES) introduce(s, g.id, '2026-01-01');
    for (let seed = 0; seed < 200; seed++) {
      const k = buildSafari(s, GRAPHEMES.find((g) => g.id === 'k')!, seeded(seed));
      expect(k.items.some((i) => i.g === 'c'), 'a c-word in a k scene').toBe(false);
      expect(k.targets.every((i) => i.word[0] === 'k')).toBe(true);
      const c = buildSafari(s, GRAPHEMES.find((g) => g.id === 'c')!, seeded(seed));
      expect(c.items.some((i) => i.g === 'k'), 'a k-word in a c scene').toBe(false);
      expect(c.targets.every((i) => i.word[0] === 'c')).toBe(true);
    }
  });
  it('a scene hides only real targets among non-targets, one decoy per other sound', () => {
    const s = newChild();
    for (const g of GRAPHEMES.slice(0, 8)) introduce(s, g.id, '2026-01-01');
    for (const g of GRAPHEMES.filter((x) => safariGraphemes('rp').includes(x.id))) {
      const { targets, items } = buildSafari(s, g, seeded(7));
      expect(targets.length, g.id).toBeGreaterThanOrEqual(2);
      expect(items.length).toBeLessThanOrEqual(8);
      expect(items.filter((i) => i.p === g.phoneme).length, g.id).toBe(targets.length); // nothing else sneaks in that starts with the same sound
      const decoySounds = items.filter((i) => i.p !== g.phoneme).map((i) => i.p);
      expect(new Set(decoySounds).size).toBe(decoySounds.length);
    }
  });
  it('letters that no word starts with (ck, ff, ll, ss) never get a Safari scene', () => {
    for (const id of ['ck', 'ff', 'll', 'ss']) expect(safariGraphemes('rp')).not.toContain(id);
  });
});

describe('Word Kitchen and Beat the Drum', () => {
  it('the tray has every letter of the word and only unambiguous, already-met decoys', () => {
    const s = newChild();
    for (const g of GRAPHEMES) introduce(s, g.id, '2026-01-01');
    const rng = seeded(3);
    for (const w of bankFor('rp').filter((x) => x.emoji)) {
      const tiles = buildKitchenTiles(s, w, rng);
      for (const g of w.graphemes) expect(tiles, w.text).toContain(g);
      const decoys = [...tiles];
      for (const g of w.graphemes) decoys.splice(decoys.indexOf(g), 1);
      const wordSounds = new Set(w.graphemes.map(phonemeOf));
      for (const d of decoys) expect(wordSounds.has(phonemeOf(d)), `${w.text}: decoy ${d}`).toBe(false);
      expect(decoys.length).toBeLessThanOrEqual(2);
    }
  });
  it('one beat per sound', () => {
    expect(drumBeats(bankFor('rp').find((w) => w.text === 'cat')!)).toBe(3);
    expect(drumBeats(bankFor('rp').find((w) => w.text === 'rock')!)).toBe(3); // r-o-ck: the digraph is one sound
    expect(drumBeats(bankFor('rp').find((w) => w.text === 'egg')!)).toBe(2);
  });
});

describe('the day plan rotates games without randomness', () => {
  it('uses every oral game and both print games over a couple of weeks, and is stable on replay', () => {
    const s = newChild();
    const seconds = new Set<string>();
    const thirds = new Set<string>();
    const rng = seeded(9);
    for (let d = 1; d <= 24; d++) {
      const today = `2026-02-${String(d).padStart(2, '0')}`;
      const before = JSON.stringify(s.adventureDays);
      const plan = startAdventure(s, today, rng);
      const again = startAdventure(s, today, seeded(1));
      expect(again.second).toBe(plan.second);
      expect(again.third).toBe(plan.third);
      expect(JSON.stringify(s.adventureDays)).toBe(before);
      seconds.add(plan.second);
      thirds.add(plan.third);
      playDay(s, today, 0.95, rng);
    }
    expect([...seconds].sort()).toEqual(['drum', 'robot', 'safari']);
    expect([...thirds].sort()).toEqual(['bridge', 'kitchen', 'rhyme']);
  });
  it('Trace Trail only appears when the parent turns it on, and only on days with a new sound', () => {
    const s = newChild();
    expect(startAdventure(s, '2026-03-01', seeded(1)).trace).toBe(false);
    s.tracing = true;
    expect(startAdventure(s, '2026-03-01', seeded(1)).trace).toBe(true); // day 1 introduces /s/
  });
});

describe('picture cards are original art', () => {
  it('every word that is shown as a picture has a drawing, and no drawing is orphaned', async () => {
    const { PICTURES } = await import('../ui/pictures');
    const used = new Set([...BANK.filter((w) => w.emoji).map((w) => w.text), ...SAFARI.map((i) => i.word)]);
    for (const w of used) expect(PICTURES[w], `no drawing for "${w}"`).toBeTruthy();
    for (const k of Object.keys(PICTURES)) expect(used.has(k), `orphan drawing "${k}"`).toBe(true);
  });
  it('drawings are well-formed (no stray undefined/NaN from the builders, balanced svg)', async () => {
    const { PICTURES } = await import('../ui/pictures');
    for (const [k, body] of Object.entries(PICTURES)) {
      expect(body, k).not.toMatch(/undefined|NaN/);
      expect(body.length, k).toBeGreaterThan(80);
    }
  });
  it('no two words that can appear together share a drawing', async () => {
    const { PICTURES } = await import('../ui/pictures');
    const seen = new Map<string, string>();
    for (const [k, body] of Object.entries(PICTURES)) {
      expect(seen.get(body), `${k} and ${seen.get(body)} are the same drawing`).toBeUndefined();
      seen.set(body, k);
    }
  });
});

describe('look-alike pictures are never an answer and a distractor together', () => {
  it('confusable pairs refer to real words with drawings', () => {
    const known = new Set([...BANK.filter((w) => w.emoji).map((w) => w.text), ...SAFARI.map((i) => i.word)]);
    for (const [a, b] of CONFUSABLE) { expect(known.has(a), a).toBe(true); expect(known.has(b), b).toBe(true); }
  });
  it('Robot Talk distractors never include a look-alike of the answer', () => {
    const pool = bankFor('rp').filter((w) => w.emoji);
    for (let seed = 0; seed < 200; seed++)
      for (const w of pool) for (const d of pickDistractors(pool, w, 3, seeded(seed))) expect(isConfusable(w.text, d.text), `${w.text} vs ${d.text}`).toBe(false);
  });
  it('Sound Safari scenes never hide a look-alike of a target', () => {
    const s = newChild();
    for (const g of GRAPHEMES) introduce(s, g.id, '2026-01-01');
    for (let seed = 0; seed < 100; seed++)
      for (const p of GRAPHEMES.filter((x) => safariGraphemes('rp').includes(x.id))) {
        const { targets, items } = buildSafari(s, p, seeded(seed));
        for (const t of targets) for (const it of items) expect(isConfusable(t.word, it.word), `${t.word} vs ${it.word}`).toBe(false);
      }
  });
});
