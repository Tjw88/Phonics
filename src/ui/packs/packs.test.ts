import { describe, expect, it } from 'vitest';
import { PACKS, arrivalSVG, companionSVG, findCreature, mouthPct, sameSlotIn } from '../themes';

/** Tag-balance check for the SVG strings (there is no DOM in the test runner): every opened element is closed, in order. */
const wellFormed = (svg: string): string | null => {
  const stack: string[] = [];
  const re = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg))) {
    const [, close, name, , self] = m;
    if (self) continue;
    if (close) { if (stack.pop() !== name) return `unexpected </${name}>`; } else stack.push(name as string);
  }
  return stack.length ? `unclosed <${stack[stack.length - 1]}>` : null;
};
const ids = (svg: string): string[] => [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1] as string);

describe('theme packs', () => {
  it('there are several packs, each with a name, a blurb and exactly four creatures', () => {
    expect(PACKS.length).toBeGreaterThanOrEqual(5);
    for (const p of PACKS) {
      expect(p.name.length, p.id).toBeGreaterThan(2);
      expect(p.blurb.length, p.id).toBeGreaterThan(10);
      expect(p.defaultName.length, p.id).toBeGreaterThan(1);
      expect(p.creatures, p.id).toHaveLength(4);
    }
    expect(new Set(PACKS.map((p) => p.id)).size).toBe(PACKS.length);
    expect(new Set(PACKS.map((p) => p.name)).size).toBe(PACKS.length);
  });
  it('creature ids are unique across all packs', () => {
    const all = PACKS.flatMap((p) => p.creatures.map((c) => c.id));
    expect(new Set(all).size).toBe(all.length);
  });

  for (const pack of PACKS) {
    describe(`pack ${pack.id}`, () => {
      for (const c of pack.creatures) {
        it(`creature ${c.id} follows the companion contract at every growth level`, () => {
          expect(c.label.length).toBeGreaterThan(3);
          for (const col of [c.main, c.dark, c.accent]) expect(col).toMatch(/^#[0-9a-fA-F]{6}$/);
          expect(c.hy).toBeGreaterThanOrEqual(60);
          expect(c.hy).toBeLessThanOrEqual(100);
          const looks = new Set<string>();
          for (let g = 0; g <= 4; g++) {
            const svg = companionSVG(c.id, g);
            looks.add(svg);
            expect(wellFormed(svg), `${c.id} growth ${g}`).toBeNull();
            expect(svg).toContain('class="dino mood-idle"');
            expect(svg).toContain('viewBox="0 -26 200 238"');
            for (const hook of ['headg', 'eyes-open', 'pupil', 'eyes-happy', 'eyes-closed', 'mouth-smile', 'mouth-open', 'mouth-oh', 'zzz'])
              expect(svg, `${c.id} needs .${hook}`).toContain(hook);
            expect((svg.match(/class="pupil"/g) ?? []).length, 'two pupils').toBe(2);
          }
          expect(looks.size, `${c.id}: each growth level should look different (accessories)`).toBe(5);
          const egg = arrivalSVG(c.id);
          expect(wellFormed(egg), `${c.id} egg`).toBeNull();
          expect(egg).toContain('viewBox="0 0 120 150"');
          const m = mouthPct(c.id);
          expect(m.x).toBe(50);
          expect(m.y).toBeGreaterThan(40);
          expect(m.y).toBeLessThan(80);
          expect(findCreature(c.id)?.pack.id).toBe(pack.id);
        });
      }

      it('the four creatures are told apart by shape or colour', () => {
        const mains = pack.creatures.map((c) => c.main.toLowerCase());
        expect(new Set(mains).size, 'four different main colours').toBe(4);
        const shapes = pack.creatures.map((c) => companionSVG(c.id, 0));
        expect(new Set(shapes).size).toBe(4);
      });

      it('the backdrop keeps the day/night hooks and is well formed', () => {
        const svg = pack.scene();
        expect(wellFormed(svg)).toBeNull();
        expect(svg).toContain('viewBox="0 0 1600 900"');
        expect(svg).toContain('preserveAspectRatio="xMidYMax slice"');
        for (const hook of ['sky-day', 'sky-night', 'class="sun', 'class="moon', 'class="stars', 'class="cloud', 'scenery'])
          expect(svg, `backdrop needs ${hook}`).toContain(hook);
      });

      it('the island is well formed with the expected viewBox', () => {
        const svg = pack.island();
        expect(wellFormed(svg)).toBeNull();
        expect(svg).toContain('viewBox="0 0 400 190"');
      });
    });
  }

  it('no two packs reuse an element id (the world picker shows several backdrops in one page, so a shared id would paint the wrong gradient)', () => {
    const owner = new Map<string, string>();
    for (const p of PACKS) {
      const mine = new Set([...ids(p.scene()), ...ids(p.island()), ...p.creatures.flatMap((c) => ids(c.svg(0)))]);
      for (const id of mine) {
        const prev = owner.get(id);
        expect(prev === undefined || prev === p.id, `id "${id}" is used by both ${prev} and ${p.id}`).toBe(true);
        owner.set(id, p.id);
      }
    }
  });

  it('switching world keeps the same slot ("the second friend" stays the second friend)', () => {
    for (const a of PACKS) for (const b of PACKS)
      a.creatures.forEach((c, i) => expect(sameSlotIn(c.id, b.id)).toBe(b.creatures[i]!.id));
  });
});
