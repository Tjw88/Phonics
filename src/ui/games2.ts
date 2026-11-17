// The second set of MVP games: Beat the Drum (oral segmenting), Sound Safari (initial sounds), Word Kitchen
// (segmenting to spell) and Trace Trail (letter formation).
import type { Grapheme, SafariItem, Word } from '../engine/data';
import { advanceTrace, glyphWidth, samplePath, strokesFor, traceDone, type Pt } from '../engine/glyphs';
import { drumBeats, phonemeOf, slashed } from '../engine/session';
import { drumSVG, potSVG } from './art';
import { pictureEl } from './pictures';
import { blip, playSequence, praise, sayPhrase, saySeq, sfx, soft, speak, tap } from './audio';
import { h, sleep } from './dom';
import { burst, mount, skippableWait } from './fx';
import { ghostDrag, makeAssist, makeDraggable, springBack } from './gesture';
import { companionEl, setMood, type Ctx, type TrialResult } from './games';

const BEAD_COLOURS = ['#ff6b9a', '#ffd166', '#4cc3d9', '#8ee27a', '#9b8bf0'];
const caption = (text: string): HTMLElement => h('p', { class: 'caption', 'data-testid': 'caption' }, text);
const play = (el: Element, cls: string, ms = 600): void => {
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
};

/**
 * Beat the Drum (oral segmenting). A picture appears; tap the drum once for each sound in its name, then press the tick.
 * Each beat plays the next sound of the word, so the child hears the word being taken apart. Wrong count: the robot-style
 * beads model it and the child tries again. Never timed.
 */
export const beatDrum = async (ctx: Ctx, word: Word): Promise<TrialResult> => {
  const n = drumBeats(word);
  const phonemes = word.graphemes.map(phonemeOf);
  ctx.hint('Ask: "How many sounds can you hear in the word? Tap the drum once for each one." Say the word slowly together.');
  let count = 0;
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  let busy = false;

  const picture = h('button', { class: 'tile pic target', 'data-testid': 'drum-picture', 'aria-label': 'hear the word', onClick: () => { tap(); speak(word.text); } },
    pictureEl(word.text, word.emoji));
  const drum = h('button', { class: 'drum', 'data-testid': 'drum', 'data-n': n, 'aria-label': 'drum' });
  drum.innerHTML = drumSVG();
  const beads = h('div', { class: 'row beads', 'data-testid': 'taps' });
  const tick = h('button', { class: 'btn go small-go', 'data-testid': 'drum-done', 'aria-label': 'Done', hidden: true }, '✔');
  const status = caption('Beat the drum for each sound.');

  const addBead = (i: number) => beads.append(h('span', { class: 'bead on pop', style: `--c:${BEAD_COLOURS[i % BEAD_COLOURS.length]}` }));
  let pause: ReturnType<typeof setTimeout> | null = null;
  drum.addEventListener('pointerdown', () => {
    if (busy) return;
    sfx.drum();
    play(drum, 'hit', 220);
    if (count < n) blip(phonemes[count] as string);
    addBead(count);
    count++;
    tick.hidden = false;
    // the drum checks itself when the child pauses (an idle pause, never a beat-the-clock timer); the tick still works
    if (pause) clearTimeout(pause);
    pause = setTimeout(() => void submit(), 2400);
  });

  const submit = async () => {
    if (pause) clearTimeout(pause);
    if (busy || count === 0) return;
    busy = true;
    if (count === n) {
      sfx.sparkle();
      praise();
      speak(word.text);
      burst(picture, 'stars', 14);
      picture.classList.add('alive');
      await skippableWait(1300);
      resolve({ firstTryCorrect: firstTry, choices: 0 });
    } else {
      firstTry = false;
      soft();
      status.textContent = 'Listen: let’s count the sounds together.';
      beads.replaceChildren(...phonemes.map((_, i) => h('span', { class: 'bead', style: `--c:${BEAD_COLOURS[i % BEAD_COLOURS.length]}` })));
      await sleep(300);
      await playSequence(phonemes, (i) => [...beads.children].forEach((b, k) => b.classList.toggle('on', k === i)));
      await sleep(400);
      beads.replaceChildren();
      count = 0;
      tick.hidden = true;
      status.textContent = 'Now you try! Beat the drum for each sound.';
      busy = false;
    }
  };
  tick.addEventListener('click', () => void submit());

  mount(ctx.stage, h('div', { class: 'scene drumscene' }, status, picture, drum, beads, tick));
  await sleep(300);
  saySeq([{ phrase: 'drum_prompt', text: 'Beat the drum once for each sound.' }, { word: word.text }]);
  return done;
};

/**
 * Sound Safari (initial sounds). Hunt a scene for the things that START with today's sound. Listening only: the child
 * taps pictures, and a wrong tap simply says that word so the difference in its first sound can be heard.
 */
export const soundSafari = async (ctx: Ctx, target: Grapheme, scene: { targets: SafariItem[]; items: SafariItem[] }): Promise<TrialResult> => {
  const ph = phonemeOf(target.id);
  ctx.hint(`Ask: "Does that start with ${slashed(target.id)}?" Say the first sound, not the letter name.`);
  let found = 0;
  let wrong = 0;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const say = () => blip(ph);
  const bubble = h('button', { class: 'bubble-btn', 'data-testid': 'replay', 'aria-label': `Hear the sound ${slashed(target.id)}`, onClick: () => { tap(); say(); } },
    h('span', { class: 'speaker' }, '🔊'), h('span', { class: 'bubble-sound' }, slashed(target.id)));
  const slots = scene.targets.map(() => h('span', { class: 'slot-found' }));
  const tray = h('div', { class: 'row tray', 'data-testid': 'tray' }, slots);
  const field = h('div', { class: 'safari-field', 'data-testid': 'safari' });

  scene.items.forEach((it, i) => {
    const isTarget = it.p === ph;
    const b = h('button', {
      class: 'safari-item', 'data-testid': 'safari-item', 'data-answer': isTarget ? '1' : '0', 'aria-label': 'thing to find',
      style: `animation-delay:${i * 70}ms;--bob:${(i % 4) * 0.35}s`,
    }, pictureEl(it.word, it.emoji));
    b.addEventListener('click', async () => {
      tap();
      if (b.dataset.busy) return;
      if (isTarget) {
        b.dataset.busy = '1';
        b.classList.add('found');
        slots[found]!.replaceChildren(pictureEl(it.word, it.emoji));
        slots[found]!.classList.add('filled');
        found++;
        sfx.ding();
        speak(it.word);
        burst(b, 'stars', 10);
        if (found === scene.targets.length) {
          praise();
          sfx.sparkle();
          await skippableWait(1400);
          resolve({ firstTryCorrect: wrong === 0, choices: scene.items.length });
        }
      } else {
        wrong++;
        play(b, 'wobble', 500);
        soft();
        speak(it.word);
        setTimeout(say, 900); // say the target sound again so the child can compare
      }
    });
    field.append(b);
  });

  mount(ctx.stage, h('div', { class: 'scene' },
    caption('Find things that start with…'),
    h('div', { class: 'row' }, bubble, tray),
    field));
  await sleep(300);
  saySeq([{ phrase: 'safari_prompt', text: 'Find things that start with the sound.' }, { sound: ph }]);
  return done;
};

/**
 * Word Kitchen (segmenting to spell). Hear the word, then tap letter tiles in order to build it; when it is right the
 * pot cooks and the picture pops out. A wrong letter goes back to the tray; the right ones stay.
 */
export const wordKitchen = async (ctx: Ctx, word: Word, tiles: string[]): Promise<TrialResult> => {
  const n = word.graphemes.length;
  ctx.hint('Ask: "What is the first sound you hear? Which letter makes it?" Say the word slowly together, one sound at a time. Drag each letter onto the board.');
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const placed: (number | null)[] = Array(n).fill(null); // tile index in each slot
  let busy = false;

  const picture = h('button', { class: 'tile pic target', 'data-testid': 'kitchen-picture', 'aria-label': 'hear the word', onClick: () => { tap(); speak(word.text); } },
    pictureEl(word.text, word.emoji));
  const pot = h('div', { class: 'pot', 'aria-hidden': 'true' });
  pot.innerHTML = potSVG();
  const dish = h('div', { class: 'dish' }, pictureEl(word.text, word.emoji));
  const potWrap = h('div', { class: 'pot-wrap' }, pot, dish);
  const slotEls = word.graphemes.map((_, i) => h('button', { class: 'kslot', 'data-testid': 'slot', 'aria-label': `place ${i + 1}`, onClick: () => unplace(i) }));
  const assist = makeAssist(ctx.s.easyTap);
  let stopGhost: () => void = () => undefined;
  const tileEls = tiles.map((g, i) => {
    const t = h('button', { class: `tile ktile tone${i % 4}`, 'data-testid': 'ktile', 'data-letter': g, 'aria-label': `letter ${g}` }, g);
    makeDraggable(t, {
      target: () => board.getBoundingClientRect(),
      slop: 34,
      onPickUp: () => { stopGhost(); board.classList.add('hot'); },
      onDrop: async (hit, cur, at) => {
        board.classList.remove('hot');
        if (!hit) return springBack(t, cur);
        // the child chooses WHICH place: the empty slot nearest to where the tile was dropped
        let best = -1, bestD = Infinity;
        slotEls.forEach((sl, k) => {
          if (placed[k] !== null) return;
          const r = sl.getBoundingClientRect();
          const d = Math.abs(at.x - (r.left + r.width / 2));
          if (d < bestD) { bestD = d; best = k; }
        });
        t.style.transform = '';
        if (best < 0) return springBack(t, cur);
        await place(i, best);
      },
      onTap: () => {
        if (assist.allow) return void place(i);
        assist.miss();
        sfx.boing();
        t.animate([{ transform: 'translate(0,0)' }, { transform: 'translateY(-26px) scale(1.06)', offset: 0.5 }, { transform: 'translate(0,0)' }], { duration: 480, easing: 'ease-out' });
        stopGhost();
        stopGhost = ghostDrag(sceneEl, tray, board);
      },
    });
    return t;
  });
  const board = h('div', { class: 'row board', 'data-testid': 'board' }, slotEls);
  const tray = h('div', { class: 'row tiles', 'data-testid': 'ktiles' }, tileEls);
  const kitchen = h('div', { class: 'row kitchen-row', 'data-testid': 'kitchen', 'data-graphemes': word.graphemes.join(',') }, picture, potWrap);

  const render = () => {
    slotEls.forEach((s, i) => {
      const ti = placed[i];
      s.textContent = ti === null || ti === undefined ? '' : (tiles[ti] as string);
      s.classList.toggle('filled', ti !== null && ti !== undefined);
    });
    tileEls.forEach((t, i) => {
      const used = placed.includes(i);
      t.classList.toggle('used', used);
      (t as HTMLButtonElement).disabled = used;
    });
  };
  const place = async (ti: number, atSlot?: number) => {
    if (busy) return;
    const slot = atSlot ?? placed.indexOf(null);
    if (slot < 0 || placed[slot] !== null) return;
    placed[slot] = ti;
    tap();
    sfx.pop();
    blip(phonemeOf(tiles[ti] as string));
    play(slotEls[slot]!, 'bounce', 400);
    render();
    if (placed.every((p) => p !== null)) await check();
  };
  const unplace = (slot: number) => {
    if (busy || placed[slot] === null) return;
    placed[slot] = null;
    tap();
    render();
  };
  const check = async () => {
    busy = true;
    await sleep(350);
    const wrongSlots = word.graphemes.map((g, i) => (tiles[placed[i] as number] === g ? -1 : i)).filter((i) => i >= 0);
    if (wrongSlots.length === 0) {
      pot.classList.add('cooking');
      sfx.sizzle();
      await sleep(900);
      sfx.sparkle();
      praise();
      dish.classList.add('out');
      potWrap.classList.add('done');
      speak(word.text);
      burst(dish, 'confetti', 18);
      await skippableWait(1500);
      resolve({ firstTryCorrect: firstTry, choices: tiles.length });
    } else {
      firstTry = false;
      soft();
      for (const i of wrongSlots) play(slotEls[i]!, 'wobble', 500);
      await sleep(550);
      for (const i of wrongSlots) placed[i] = null; // the right letters stay put
      render();
      speak(word.text); // model it again
      busy = false;
    }
  };

  const sceneEl = h('div', { class: 'scene kitchenscene' }, caption('Drag the letters onto the board to build the word!'), kitchen, board, tray);
  mount(ctx.stage, sceneEl);
  stopGhost = ghostDrag(sceneEl, tray, board);
  render();
  await sleep(300);
  saySeq([{ phrase: 'kitchen_prompt', text: 'Build the word.' }, { word: word.text }]);
  return done;
};

/**
 * Trace Trail (letter formation). Trace the letter along the trail from the green start dot; the stroke only counts when
 * followed in order (so the start and direction matter). Finger or Apple Pencil. Not scored, never timed.
 */
export const traceTrail = async (ctx: Ctx, target: Grapheme): Promise<TrialResult> => {
  ctx.hint('Optional: schools teach different letter formations. Ask: "Where does the letter start? Which way does it go?" Say the sound as you trace.');
  const strokes = strokesFor(target.id);
  const W = glyphWidth(target.id);
  const theme = ['sand', 'paint', 'mud'][ctx.s.adventureDays.length % 3] as string;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  // fit the view to THIS letter (a bit of padding), so short letters are not lost in space sized for tall ones
  const all = strokes.flatMap((st) => samplePath(st.d, 6));
  const minY = Math.min(...all.map((p) => p.y)), maxY = Math.max(...all.map((p) => p.y));
  const top = Math.min(minY, 50) - 26, bottom = Math.max(maxY, 100) + 26;
  svg.setAttribute('viewBox', `-18 ${top} ${W + 36} ${bottom - top}`);
  svg.setAttribute('class', `trace-svg ${theme}`);
  svg.setAttribute('data-testid', 'trace-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `trace the letter ${target.id}`);
  const mk = (tag: string, attrs: Record<string, string>) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    svg.append(e);
    return e as SVGElement;
  };
  // baseline and x-height guide lines, like handwriting paper
  mk('line', { x1: '-10', x2: String(W + 10), y1: '100', y2: '100', class: 'rule' });
  mk('line', { x1: '-10', x2: String(W + 10), y1: '50', y2: '50', class: 'rule dashed' });
  const guides = strokes.map((s) => mk('path', { d: s.d, class: 'guide' }) as SVGPathElement);
  const inks = strokes.map((s) => mk('path', { d: s.d, class: 'ink' }) as SVGPathElement);
  const startDot = mk('circle', { r: '7', class: 'startdot' });
  const arrow = mk('path', { d: 'M0 0', class: 'arrow' });
  const firefly = mk('circle', { r: '5', class: 'firefly' });

  const say = () => blip(phonemeOf(target.id));
  const bubble = h('button', { class: 'bubble-btn', 'data-testid': 'replay', 'aria-label': `Hear the sound ${slashed(target.id)}`, onClick: () => { tap(); say(); } },
    h('span', { class: 'speaker' }, '🔊'), h('span', { class: 'bubble-sound' }, slashed(target.id)));
  const pet = companionEl(ctx.s, 'trace-pet');

  let si = 0;
  let pts: Pt[] = [];
  let reached = -1;
  let drawing = false;
  let lastScratch = 0;

  const startStroke = () => {
    guides.forEach((g, i) => g.classList.toggle('active', i === si));
    guides[si]?.setAttribute('data-testid', 'trace-guide');
    guides.forEach((g, i) => { if (i !== si) g.removeAttribute('data-testid'); });
    pts = samplePath(strokes[si]!.d, 4);
    reached = -1;
    const p0 = pts[0]!;
    startDot.setAttribute('cx', String(p0.x));
    startDot.setAttribute('cy', String(p0.y));
    // a short arrow showing the first direction
    const p1 = pts[Math.min(5, pts.length - 1)]!;
    const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const ax = p0.x + Math.cos(ang) * 22;
    const ay = p0.y + Math.sin(ang) * 22;
    const back = (d: number) => `${ax - Math.cos(ang + d) * 8} ${ay - Math.sin(ang + d) * 8}`;
    arrow.setAttribute('d', `M${p0.x + Math.cos(ang) * 10} ${p0.y + Math.sin(ang) * 10} L${ax} ${ay} M${back(0.5)} L${ax} ${ay} L${back(-0.5)}`);
    firefly.setAttribute('cx', String(p0.x));
    firefly.setAttribute('cy', String(p0.y));
    ink(si).style.strokeDasharray = `${guides[si]!.getTotalLength?.() ?? 200}`;
    ink(si).style.strokeDashoffset = `${guides[si]!.getTotalLength?.() ?? 200}`;
  };
  const ink = (i: number) => inks[i] as SVGPathElement;
  const toSvg = (e: PointerEvent): Pt => {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const update = async (e: PointerEvent) => {
    if (!drawing || si >= strokes.length) return; // finished: further touches do nothing
    const before = reached;
    reached = advanceTrace(pts, reached, toSvg(e), 17);
    if (reached > before) {
      const total = guides[si]!.getTotalLength?.() ?? 200;
      ink(si).style.strokeDashoffset = `${total * (1 - reached / Math.max(1, pts.length - 1))}`;
      const hint = pts[Math.min(pts.length - 1, reached + 9)]!;
      firefly.setAttribute('cx', String(hint.x));
      firefly.setAttribute('cy', String(hint.y));
      if (performance.now() - lastScratch > 110) { sfx.scratch(); lastScratch = performance.now(); }
    }
    if (traceDone(pts, reached)) {
      drawing = false;
      ink(si).style.strokeDashoffset = '0';
      sfx.ding();
      si++;
      if (si < strokes.length) {
        await sleep(250);
        startStroke();
      } else {
        startDot.setAttribute('r', '0');
        firefly.setAttribute('r', '0');
        arrow.setAttribute('d', 'M0 0');
        setMood(pet, 'happy');
        sfx.sparkle();
        praise();
        burst(svg, 'confetti', 18);
        await skippableWait(1300);
        resolve({ firstTryCorrect: true, choices: 0 });
      }
    }
  };
  svg.addEventListener('pointerdown', (e) => {
    try { svg.setPointerCapture(e.pointerId); } catch { /* pointer already ended */ }
    drawing = true;
    void update(e);
  });
  svg.addEventListener('pointermove', (e) => void update(e));
  const stop = () => { drawing = false; };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);

  mount(ctx.stage, h('div', { class: 'scene tracescene' },
    caption('Trace the letter. Start at the green dot!'),
    h('div', { class: 'row' }, bubble, pet),
    h('div', { class: `trace-board ${theme}`, 'data-testid': 'trace-board' }, svg)));
  startStroke();
  await sleep(300);
  saySeq([{ phrase: 'trace_prompt', text: 'Trace the letter. Start at the green dot.' }, { sound: phonemeOf(target.id) }]);
  return done;
};


/**
 * Copy the beat (age 2-3, listening and rhythm; no letters, no scoring). The dino drums 1-3 beats, then it is the child's turn
 * to copy. Any attempt is welcomed; if the child pauses, the dino simply plays it again.
 */
export const copyBeat = async (ctx: Ctx, n: number): Promise<TrialResult> => {
  ctx.hint('Clap or tap the beat together with your child. Say "boom, boom" as the drum goes.');
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const dino = companionEl(ctx.s, 'beat-dino');
  const drum = h('button', { class: 'drum', 'data-testid': 'beat-drum', 'data-n': n, 'aria-label': 'drum' });
  drum.innerHTML = drumSVG();
  const beads = h('div', { class: 'row beads', 'data-testid': 'taps' });
  const status = caption('Watch and listen…');
  let phase: 'demo' | 'turn' | 'done' = 'demo';
  let count = 0;
  let idle: ReturnType<typeof setTimeout> | null = null;
  const hit = () => { sfx.drum(); play(drum, 'hit', 220); };

  const demo = async () => {
    phase = 'demo';
    count = 0;
    beads.replaceChildren();
    status.textContent = 'Watch and listen…';
    setMood(dino, 'open');
    await sleep(700);
    for (let i = 0; i < n; i++) {
      hit();
      beads.append(h('span', { class: 'bead on pop', style: `--c:${BEAD_COLOURS[i % BEAD_COLOURS.length]}` }));
      await sleep(650);
    }
    setMood(dino, 'idle');
    beads.replaceChildren();
    phase = 'turn';
    status.textContent = 'Your turn!';
    void sayPhrase('your_turn', 'Your turn!');
    armIdle();
  };
  const armIdle = () => {
    if (idle) clearTimeout(idle);
    idle = setTimeout(() => { if (phase === 'turn') void demo(); }, 7000); // gently show it again; never a penalty
  };
  drum.addEventListener('pointerdown', async () => {
    if (phase !== 'turn') { if (phase !== 'done') hit(); return; } // a drum is for banging: it sounds during the demo too (it just does not count)
    hit();
    beads.append(h('span', { class: 'bead on pop', style: `--c:${BEAD_COLOURS[count % BEAD_COLOURS.length]}` }));
    count++;
    armIdle();
    if (count >= n) {
      phase = 'done';
      if (idle) clearTimeout(idle);
      setMood(dino, 'happy');
      sfx.sparkle();
      praise();
      burst(drum, 'stars', 14);
      await skippableWait(1300);
      resolve({ firstTryCorrect: true, choices: 0 });
    }
  });

  mount(ctx.stage, h('div', { class: 'scene drumscene' }, status, dino, drum, beads));
  saySeq([{ phrase: 'copy_me', text: 'Copy me!' }]);
  void demo();
  return done;
};

/**
 * Find it (age 2-3, vocabulary and listening): hear "Find the ..." and tap the picture. A wrong tap just says that word.
 */
export const findIt = async (ctx: Ctx, word: Word, others: Word[]): Promise<TrialResult> => {
  ctx.hint(`Ask: "Where is the ${word.text}? Can you point to it?" Name each picture together.`);
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const options = [word, ...others].sort(() => ctx.rng() - 0.5);
  let wrong = 0;
  const pics = options.map((w, i) => {
    const b = h('button', { class: `tile pic card${i % 3}`, 'data-testid': 'pic', 'data-answer': w === word ? '1' : '0', 'aria-label': 'picture', style: `animation-delay:${i * 110}ms` }, pictureEl(w.text, w.emoji));
    b.addEventListener('click', async () => {
      tap();
      sfx.pop();
      if (b.dataset.busy) return;
      if (w === word) {
        b.dataset.busy = '1';
        b.classList.add('alive');
        praise();
        sfx.sparkle();
        speak(word.text);
        burst(b, 'stars', 12);
        await skippableWait(1200);
        resolve({ firstTryCorrect: wrong === 0, choices: options.length });
      } else {
        wrong++;
        b.classList.add('dim');
        soft();
        speak(w.text); // name it; the child hears the difference
      }
    });
    return b;
  });
  mount(ctx.stage, h('div', { class: 'scene' }, caption(`Find the ${word.text}!`), h('div', { class: 'row tiles', 'data-testid': 'pics' }, pics)));
  saySeq([{ phrase: 'find_the', text: 'Find the' }, { word: word.text }]);
  return done;
};
