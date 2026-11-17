import './anim-games2.css';
// The second set of MVP games: Beat the Drum (oral segmenting), Sound Safari (initial sounds), Word Kitchen
// (segmenting to spell) and Trace Trail (letter formation).
import type { Grapheme, SafariItem, Word } from '../engine/data';
import { advanceTrace, glyphWidth, samplePath, strokesFor, traceDone, type Pt } from '../engine/glyphs';
import { drumBeats, phonemeOf, slashed } from '../engine/session';
import { pictureEl } from './pictures';
import { blip, playSequence, praise, sayPhrase, saySeq, sfx, soft, speak, tap } from './audio';
import { h, reducedMotion, sleep } from './dom';
import { mount, skippableWait } from './fx';
import { ghostDrag, makeAssist, makeDraggable, springBack } from './gesture';
import { companionEl, lookAt, setMood, type Ctx, type TrialResult } from './games';
import { celebrate } from './celebrate';
import { friendEl } from './friends';
import { coverFor, drumArt, potArt, sticksArt, worldId } from './games2-art';
import { creatureOf } from './themes';

const BEAD_COLOURS = ['#ff6b9a', '#ffd166', '#4cc3d9', '#8ee27a', '#9b8bf0'];
const caption = (text: string): HTMLElement => h('p', { class: 'caption', 'data-testid': 'caption' }, text);
const play = (el: Element, cls: string, ms = 600): void => {
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
};

/** A Web Animations one-shot: transforms and opacity only; nothing at all under Reduce Motion (the state change still shows). */
const anim = (el: Element, kf: Keyframe[], opts: KeyframeAnimationOptions): Animation | null =>
  reducedMotion() ? null : el.animate(kf, opts);

/** Timers owned by one game round, so they never outlive it. */
const makeTimers = () => {
  const ids = new Set<number>();
  return {
    later(fn: () => void, ms: number): number {
      const id = window.setTimeout(() => { ids.delete(id); fn(); }, ms);
      ids.add(id);
      return id;
    },
    clear(): void { ids.forEach((id) => clearTimeout(id)); ids.clear(); },
  };
};
type Timers = ReturnType<typeof makeTimers>;

/** The companion cheers: a happy face and two squashy hops (the creature always shares the child's success). */
const cheerPet = (pet: HTMLElement, timers: Timers, calmAfter = 1300): void => {
  setMood(pet, 'happy');
  anim(pet, [
    { transform: 'translateY(0) scale(1, 1)' }, { transform: 'translateY(2px) scale(1.07, 0.9)', offset: 0.14 },
    { transform: 'translateY(-20px) scale(0.95, 1.07)', offset: 0.45 }, { transform: 'translateY(0) scale(1.05, 0.93)', offset: 0.75 }, { transform: 'translateY(0) scale(1, 1)' },
  ], { duration: 560, iterations: 2, easing: 'ease-out' });
  timers.later(() => setMood(pet, 'idle'), calmAfter);
};
/** A soft head-tilt "oh" (a wrong answer is information, never a "no"). */
const tiltPet = (pet: HTMLElement, timers: Timers): void => {
  setMood(pet, 'oops');
  anim(pet, [{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg) translateY(2px)', offset: 0.3 }, { transform: 'rotate(4deg)', offset: 0.7 }, { transform: 'rotate(0)' }], { duration: 700, easing: 'ease-in-out' });
  timers.later(() => setMood(pet, 'idle'), 900);
};

/** A creature that plays the drum: it stands behind the drum, bobs and swings a stick on every hit. Visual only (the caller plays the sound). */
interface DrumKit { stage: HTMLElement; drum: HTMLButtonElement; pet: HTMLElement; hit: () => void }
const drumKit = (ctx: Ctx, testid: string, n: number, timers: Timers): DrumKit => {
  const pet = companionEl(ctx.s, 'drummer-pet');
  const drum = h('button', { class: 'drum', 'data-testid': testid, 'data-n': n, 'aria-label': 'drum' });
  drum.innerHTML = drumArt() + sticksArt(creatureOf(ctx.s.companion?.kind ?? 'rexy').main);
  const art = drum.querySelector('.drum-art') as SVGElement;
  const ring = drum.querySelector('.ripple') as SVGElement;
  const sticks = [...drum.querySelectorAll<SVGElement>('.stick')];
  let side = 0;
  let calm: number | null = null;
  const hit = () => {
    const mine = side++ % 2;
    drum.classList.add('hit');
    timers.later(() => drum.classList.remove('hit'), 130);
    // the drum is soft and round: squash down, stretch up, settle (it answers within one frame of the touch)
    anim(art, [
      { transform: 'scale(1, 1)' }, { transform: 'scale(1.1, 0.8)', offset: 0.2 }, { transform: 'scale(0.96, 1.07)', offset: 0.5 },
      { transform: 'scale(1.015, 0.985)', offset: 0.78 }, { transform: 'scale(1, 1)' },
    ], { duration: 300, easing: 'ease-out' });
    anim(ring, [{ transform: 'scale(1, 1)', opacity: 0.85 }, { transform: 'scale(1.3, 1.5)', opacity: 0 }], { duration: 440, easing: 'ease-out' });
    // the drummer: a bob, a stick swing (left, right, left...) and an open mouth
    anim(pet, [{ transform: 'translateY(0) rotate(0) scale(1, 1)' }, { transform: `translateY(9px) rotate(${mine ? 4 : -4}deg) scale(1.03, 0.95)`, offset: 0.35 }, { transform: 'translateY(0) rotate(0) scale(1, 1)' }], { duration: 260, easing: 'ease-out' });
    const rest = mine ? 13 : -13;
    anim(sticks[mine] as SVGElement, [{ transform: `rotate(${rest}deg)` }, { transform: `rotate(${mine ? -3 : 3}deg)`, offset: 0.3 }, { transform: `rotate(${rest}deg)` }], { duration: 280, easing: 'ease-out' });
    setMood(pet, 'open');
    if (calm) clearTimeout(calm);
    calm = timers.later(() => setMood(pet, 'idle'), 240);
  };
  return { stage: h('div', { class: 'drum-stage' }, pet, drum), drum, pet, hit };
};

/** A bead leaps out of the drum into its place (in time with the beat that made it). */
const popBead = (bead: HTMLElement, from: HTMLElement): void => {
  const a = from.getBoundingClientRect(), b = bead.getBoundingClientRect();
  const dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height * 0.35 - (b.top + b.height / 2);
  anim(bead, [
    { transform: `translate(${dx}px, ${dy}px) scale(0.25)`, opacity: 0 }, { transform: 'translate(0, 0) scale(1.6)', opacity: 1, offset: 0.7 }, { transform: 'translate(0, 0) scale(1.35)', opacity: 1 },
  ], { duration: 360, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' });
};

/** A copy of `from` flies to `to` (an arc with a little hop), then `done`. Under Reduce Motion it just calls `done`. */
const flyClone = (from: HTMLElement, fromRect: DOMRect, toRect: DOMRect, opts: { ms: number; pop?: boolean; scale?: number }, done: () => void): void => {
  if (reducedMotion()) { done(); return; }
  const ghost = from.cloneNode(true) as HTMLElement;
  ghost.classList.add('fly-clone');
  ghost.removeAttribute('data-testid');
  Object.assign(ghost.style, { position: 'fixed', left: `${fromRect.left}px`, top: `${fromRect.top}px`, width: `${fromRect.width}px`, height: `${fromRect.height}px`, margin: '0' });
  document.body.append(ghost);
  const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2), dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
  const kf: Keyframe[] = [{ transform: 'translate(0, 0) scale(1)' }];
  if (opts.pop) kf.push({ transform: 'translate(0, -30px) scale(1.28) rotate(-6deg)', offset: 0.28 });
  kf.push({ transform: `translate(${dx}px, ${dy}px) scale(${opts.scale ?? 0.8})` });
  const a = ghost.animate(kf, { duration: opts.ms, easing: 'cubic-bezier(0.45, 0.05, 0.4, 1)', fill: 'forwards' });
  const finish = () => { ghost.remove(); done(); };
  a.onfinish = finish;
  a.oncancel = finish;
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
  const timers = makeTimers();
  let count = 0;
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  let busy = false;

  const picture = h('button', { class: 'tile pic target', 'data-testid': 'drum-picture', 'aria-label': 'hear the word', onClick: () => { tap(); speak(word.text); } },
    pictureEl(word.text, word.emoji));
  const kit = drumKit(ctx, 'drum', n, timers);
  const drum = kit.drum;
  const beads = h('div', { class: 'row beads', 'data-testid': 'taps' });
  const tick = h('button', { class: 'btn go small-go', 'data-testid': 'drum-done', 'aria-label': 'Done', hidden: true }, '✔');
  const status = caption('Beat the drum for each sound.');

  const addBead = (i: number) => {
    const b = h('span', { class: 'bead on', style: `--c:${BEAD_COLOURS[i % BEAD_COLOURS.length]}` });
    beads.append(b);
    popBead(b, drum);
  };
  let pause: ReturnType<typeof setTimeout> | null = null;
  drum.addEventListener('pointerdown', () => {
    // a drum is for banging: it always sounds and squashes, even while the game is modelling the answer (it just does not count then)
    sfx.drum();
    kit.hit();
    if (busy) return;
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
      celebrate(picture, { game: 'drum' });
      cheerPet(kit.pet, timers, 1500);
      picture.classList.add('alive');
      await skippableWait(1300);
      timers.clear();
      resolve({ firstTryCorrect: firstTry, choices: 0 });
    } else {
      firstTry = false;
      soft();
      tiltPet(kit.pet, timers);
      status.textContent = 'Listen: let’s count the sounds together.';
      beads.replaceChildren(...phonemes.map((_, i) => h('span', { class: 'bead', style: `--c:${BEAD_COLOURS[i % BEAD_COLOURS.length]}` })));
      await sleep(300);
      // the drummer plays the word again, one beat to each sound
      await playSequence(phonemes, (i) => { [...beads.children].forEach((b, k) => b.classList.toggle('on', k === i)); if (i >= 0) kit.hit(); });
      await sleep(400);
      beads.replaceChildren();
      count = 0;
      tick.hidden = true;
      status.textContent = 'Now you try! Beat the drum for each sound.';
      busy = false;
    }
  };
  tick.addEventListener('click', () => void submit());

  mount(ctx.stage, h('div', { class: 'scene drumscene' }, status, h('div', { class: 'drum-row' }, picture, kit.stage), beads, tick));
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
  const timers = makeTimers();
  let found = 0;
  let wrong = 0;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const say = () => blip(ph);
  const bubble = h('button', { class: 'bubble-btn', 'data-testid': 'replay', 'aria-label': `Hear the sound ${slashed(target.id)}`, onClick: () => { tap(); say(); } },
    h('span', { class: 'speaker' }, '🔊'), h('span', { class: 'bubble-sound' }, slashed(target.id)));
  const slots = scene.targets.map(() => h('span', { class: 'slot-found' }));
  const tray = h('div', { class: 'row tray', 'data-testid': 'tray' }, slots);
  const pet = companionEl(ctx.s, 'safari-pet');
  const world = worldId();
  const field = h('div', { class: `safari-field w-${world}`, 'data-testid': 'safari' });
  const cells: HTMLElement[] = [];

  /** The picture of an unfound target, so a wrong tap can make the creature look at it. */
  const nextTarget = (): HTMLElement | undefined => cells.find((c) => c.dataset.answer === '1' && !c.dataset.busy);
  const glance = (cell: HTMLElement | undefined) => {
    if (!cell) return;
    const r = cell.getBoundingClientRect();
    lookAt(pet, r.left + r.width / 2, r.top + r.height / 2);
    timers.later(() => lookAt(pet, null, null), 1800);
  };

  scene.items.forEach((it, i) => {
    const isTarget = it.p === ph;
    const cover = coverFor(world, i);
    const flip = (i >> 1) % 2 ? ' flip' : '';
    const back = h('span', { class: `cover-layer back${flip}`, 'aria-hidden': 'true' });
    back.innerHTML = cover.back;
    const front = h('span', { class: `cover-layer front${flip}`, 'aria-hidden': 'true' });
    front.innerHTML = cover.front;
    const pic = pictureEl(it.word, it.emoji);
    const b = h('button', {
      class: 'safari-item', 'data-testid': 'safari-item', 'data-answer': isTarget ? '1' : '0', 'aria-label': 'thing to find',
      // peek in one after another; then each unfound item gives one small sway now and then, out of step with its neighbours
      style: `--peek:${240 + i * 95}ms;--sway:${(i * 1.7) % 7}s`,
    }, back, pic, front);
    b.addEventListener('click', async () => {
      tap();
      if (b.dataset.busy) return;
      if (isTarget) {
        b.dataset.busy = '1';
        b.classList.add('found');
        const slot = slots[found] as HTMLElement;
        found++;
        const all = found === scene.targets.length;
        sfx.ding();
        speak(it.word);
        // it pops, then flies into the found tray; the creature cheers; the shared success reaction plays from the item
        celebrate(b, { game: 'safari', last: all });
        cheerPet(pet, timers, all ? 2200 : 1200);
        const fill = () => { slot.replaceChildren(pictureEl(it.word, it.emoji)); slot.classList.add('filled'); };
        flyClone(pic, pic.getBoundingClientRect(), slot.getBoundingClientRect(), { ms: 760, pop: true, scale: 0.7 }, fill);
        if (all) {
          praise();
          sfx.sparkle();
          await skippableWait(1600);
          timers.clear();
          resolve({ firstTryCorrect: wrong === 0, choices: scene.items.length });
        }
      } else {
        wrong++;
        play(b, 'wobble', 650);
        soft();
        speak(it.word);
        tiltPet(pet, timers);
        glance(nextTarget());
        // after a second miss the right choice gently pulses (information, not punishment)
        if (wrong >= 2) {
          const t = nextTarget();
          if (t) { t.classList.remove('hint'); void t.offsetWidth; t.classList.add('hint'); timers.later(() => t.classList.remove('hint'), 3200); }
        }
        timers.later(say, 900); // say the target sound again so the child can compare
      }
    });
    cells.push(b);
    field.append(b);
  });

  mount(ctx.stage, h('div', { class: 'scene safariscene' },
    caption('Find things that start with…'),
    h('div', { class: 'row safari-top' }, pet, bubble, tray),
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
  const timers = makeTimers();
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const placed: (number | null)[] = Array(n).fill(null); // tile index in each slot
  let busy = false;

  const picture = h('button', { class: 'tile pic target', 'data-testid': 'kitchen-picture', 'aria-label': 'hear the word', onClick: () => { tap(); speak(word.text); } },
    pictureEl(word.text, word.emoji));
  const pot = h('div', { class: 'pot', 'aria-hidden': 'true' });
  pot.innerHTML = potArt();
  const dish = h('div', { class: 'dish' }, pictureEl(word.text, word.emoji));
  const potWrap = h('div', { class: `pot-wrap w-${worldId()}` }, pot, dish);
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
        const from = t.getBoundingClientRect(); // where the tile was let go (it flies the last bit into the slot)
        t.style.transform = '';
        if (best < 0) return springBack(t, cur);
        await place(i, best, from);
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
  /** The tile hops from where it was to its slot (the letter appears when it lands), then settles with a small squash. */
  const settle = (slot: HTMLElement, tile: HTMLElement, from: DOMRect) => {
    if (reducedMotion()) return;
    slot.classList.add('landing');
    let landed = false;
    const land = () => { if (landed) return; landed = true; slot.classList.remove('landing'); play(slot, 'settle', 420); };
    flyClone(tile, from, slot.getBoundingClientRect(), { ms: 230, scale: 0.88 }, land);
    timers.later(land, 700); // (a safety net if the page was hidden mid-flight)
  };
  const place = async (ti: number, atSlot?: number, fromRect?: DOMRect) => {
    if (busy) return;
    const slot = atSlot ?? placed.indexOf(null);
    if (slot < 0 || placed[slot] !== null) return;
    const tile = tileEls[ti] as HTMLElement;
    const from = fromRect ?? tile.getBoundingClientRect();
    placed[slot] = ti;
    tap();
    sfx.pop();
    blip(phonemeOf(tiles[ti] as string));
    settle(slotEls[slot] as HTMLElement, tile, from);
    render();
    if (placed.every((p) => p !== null)) await check();
  };
  /** Return a tile from its slot to the tray with the shared spring-back. */
  const sendHome = (entries: { ti: number; rect: DOMRect }[]) => {
    for (const { ti, rect } of entries) {
      const t = tileEls[ti] as HTMLElement;
      const r = t.getBoundingClientRect();
      springBack(t, { x: rect.left + rect.width / 2 - (r.left + r.width / 2), y: rect.top + rect.height / 2 - (r.top + r.height / 2) });
    }
  };
  const unplace = (slot: number) => {
    if (busy || placed[slot] === null) return;
    const entry = { ti: placed[slot] as number, rect: (slotEls[slot] as HTMLElement).getBoundingClientRect() };
    placed[slot] = null;
    tap();
    render();
    sendHome([entry]);
  };
  /** Steam puffs rise from the pot's mouth (a soft grey-blue cloud so they show on the white card). */
  const puffs = (count: number, big: boolean) => {
    if (reducedMotion()) return;
    for (let i = 0; i < count; i++) {
      timers.later(() => {
        const p = h('span', { class: `steam-puff${big ? ' big' : ''}` });
        const x0 = (i - (count - 1) / 2) * (big ? 14 : 9);
        p.style.left = `${50 + x0 / 1.6}%`;
        potWrap.append(p);
        const drift = (i % 2 ? 1 : -1) * (8 + (i % 3) * 6);
        anim(p, [
          { transform: 'translate(-50%, 0) scale(0.35)', opacity: 0 },
          { transform: `translate(calc(-50% + ${drift * 0.4}px), ${big ? -46 : -34}px) scale(${big ? 1.1 : 0.85})`, opacity: 0.9, offset: 0.3 },
          { transform: `translate(calc(-50% + ${drift}px), ${big ? -130 : -96}px) scale(${big ? 1.9 : 1.5})`, opacity: 0 },
        ], { duration: big ? 1100 : 950, easing: 'ease-out' });
        timers.later(() => p.remove(), 1200);
      }, i * (big ? 70 : 150));
    }
  };
  const check = async () => {
    busy = true;
    await sleep(350);
    const wrongSlots = word.graphemes.map((g, i) => (tiles[placed[i] as number] === g ? -1 : i)).filter((i) => i >= 0);
    if (wrongSlots.length === 0) {
      // cook: the pot shivers and steams, then the lid hops and the picture pops out in a puff
      pot.classList.add('cooking');
      sfx.sizzle();
      puffs(5, false);
      await sleep(900);
      sfx.sparkle();
      praise();
      pot.classList.remove('cooking');
      play(pot, 'kpop', 600);
      puffs(6, true);
      // the lid pops off and tumbles to the side, so the picture can come up out of the open pot
      pot.querySelectorAll<SVGElement>('.lid').forEach((lid) => {
        const rest = 'translate(54px, 16px) rotate(32deg)';
        anim(lid, [{ transform: 'translate(0px, 0px) rotate(0deg)' }, { transform: 'translate(20px, -62px) rotate(12deg)', offset: 0.4 }, { transform: rest }], { duration: 520, easing: 'cubic-bezier(0.3, 0.6, 0.4, 1)' });
        lid.style.transform = rest;
      });
      timers.later(() => potWrap.classList.add('front'), reducedMotion() ? 0 : 950);
      dish.classList.add('out');
      anim(dish, [
        { transform: 'translate(-50%, 30%) scale(0.2) rotate(0deg)', opacity: 0 },
        { transform: 'translate(-50%, -118%) scale(1.3) rotate(-8deg)', opacity: 1, offset: 0.45 },
        { transform: 'translate(-50%, -58%) scale(0.94, 1.08) rotate(5deg)', opacity: 1, offset: 0.66 },
        { transform: 'translate(-50%, -64%) scale(1.04, 0.97) rotate(-3deg)', opacity: 1, offset: 0.82 },
        { transform: 'translate(-50%, -62%) scale(1) rotate(0deg)', opacity: 1 },
      ], { duration: 950, easing: 'ease-out' });
      potWrap.classList.add('done');
      speak(word.text);
      timers.later(() => celebrate(dish, { game: 'kitchen' }), 430);
      await skippableWait(1600);
      timers.clear();
      resolve({ firstTryCorrect: firstTry, choices: tiles.length });
    } else {
      firstTry = false;
      soft();
      for (const i of wrongSlots) play(slotEls[i] as HTMLElement, 'wobble', 500);
      await sleep(550);
      const back = wrongSlots.map((i) => ({ ti: placed[i] as number, rect: (slotEls[i] as HTMLElement).getBoundingClientRect() }));
      for (const i of wrongSlots) placed[i] = null; // the right letters stay put
      render();
      sendHome(back); // the wrong tiles spring back to the tray
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
  const timers = makeTimers();
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
  const letter = document.createElementNS(NS, 'g') as SVGGElement; // the strokes live in one group so the finished letter can melt away as one
  const mk = (tag: string, attrs: Record<string, string>, into: Element = svg) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    into.append(e);
    return e as SVGElement;
  };
  // baseline and x-height guide lines, like handwriting paper
  mk('line', { x1: '-10', x2: String(W + 10), y1: '100', y2: '100', class: 'rule' });
  mk('line', { x1: '-10', x2: String(W + 10), y1: '50', y2: '50', class: 'rule dashed' });
  svg.append(letter);
  const guides = strokes.map((s) => mk('path', { d: s.d, class: 'guide' }, letter) as SVGPathElement);
  const inks = strokes.map((s) => mk('path', { d: s.d, class: 'ink' }, letter) as SVGPathElement);
  const startDot = mk('circle', { r: '7', class: 'startdot' });
  const arrow = mk('path', { d: 'M0 0', class: 'arrow' });
  const firefly = mk('circle', { r: '5', cx: '0', cy: '0', class: 'firefly' }); // moved with a transform, so it glides instead of jumping
  const moveFirefly = (p: Pt) => { firefly.style.transform = `translate(${p.x}px, ${p.y}px)`; };

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
    moveFirefly(p0);
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
      moveFirefly(hint);
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
        sfx.sparkle();
        praise();
        cheerPet(pet, timers, 2000);
        // the finished letter melts into its sound-friend, who says the sound and hops
        const friend = friendEl(target.id, 'trace-friend');
        const layer = h('div', { class: 'trace-friend-layer', 'aria-hidden': 'true' }, friend);
        board.append(layer);
        letter.style.transformBox = 'fill-box';
        letter.style.transformOrigin = 'center';
        if (reducedMotion()) letter.style.opacity = '0';
        else {
          letter.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.7)' }], { duration: 480, easing: 'ease-in', fill: 'forwards' });
          friend.animate([
            { transform: 'scale(0.2) rotate(-14deg)', opacity: 0 }, { transform: 'scale(1.18) rotate(4deg)', opacity: 1, offset: 0.62 }, { transform: 'scale(1) rotate(0deg)', opacity: 1 },
          ], { duration: 640, delay: 200, easing: 'cubic-bezier(0.2, 1.3, 0.4, 1)', fill: 'backwards' });
        }
        timers.later(() => {
          blip(phonemeOf(target.id));
          celebrate(friend, { game: 'trace' });
          anim(friend, [
            { transform: 'translateY(0) scale(1, 1)' }, { transform: 'translateY(-30px) scale(0.96, 1.06)', offset: 0.42 }, { transform: 'translateY(0) scale(1.06, 0.92)', offset: 0.78 }, { transform: 'translateY(0) scale(1, 1)' },
          ], { duration: 560, iterations: 2, easing: 'ease-out' });
        }, reducedMotion() ? 0 : 760);
        await skippableWait(2200);
        timers.clear();
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

  const board = h('div', { class: `trace-board ${theme}`, 'data-testid': 'trace-board' }, svg);
  mount(ctx.stage, h('div', { class: 'scene tracescene' },
    caption('Trace the letter. Start at the green dot!'),
    h('div', { class: 'row' }, bubble, pet),
    board));
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
  const timers = makeTimers();
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const kit = drumKit(ctx, 'beat-drum', n, timers);
  const { drum, pet } = kit;
  const beads = h('div', { class: 'row beads', 'data-testid': 'taps' });
  const status = caption('Watch and listen…');
  let phase: 'demo' | 'turn' | 'done' = 'demo';
  let count = 0;
  let idle: number | null = null;
  const hit = () => { sfx.drum(); kit.hit(); };
  const addBead = (i: number) => {
    const b = h('span', { class: 'bead on', style: `--c:${BEAD_COLOURS[i % BEAD_COLOURS.length]}` });
    beads.append(b);
    popBead(b, drum);
  };

  // the creature shows the beat: it drums n times (arm swings, drum squashes, a bead for each), then it is the child's turn
  const demo = async () => {
    phase = 'demo';
    count = 0;
    beads.replaceChildren();
    status.textContent = 'Watch and listen…';
    await sleep(700);
    for (let i = 0; i < n; i++) {
      if (!drum.isConnected) return;
      hit();
      addBead(i);
      await sleep(650);
    }
    setMood(pet, 'idle');
    beads.replaceChildren();
    phase = 'turn';
    status.textContent = 'Your turn!';
    void sayPhrase('your_turn', 'Your turn!');
    armIdle();
  };
  const armIdle = () => {
    if (idle) clearTimeout(idle);
    idle = timers.later(() => { if (phase === 'turn') void demo(); }, 7000); // gently show it again; never a penalty
  };
  drum.addEventListener('pointerdown', async () => {
    if (phase !== 'turn') { if (phase !== 'done') hit(); return; } // a drum is for banging: it sounds and squashes during the demo too (it just does not count)
    hit();
    addBead(count);
    count++;
    armIdle();
    if (count >= n) {
      phase = 'done';
      if (idle) clearTimeout(idle);
      sfx.sparkle();
      praise();
      celebrate(drum, { game: 'beat' });
      cheerPet(pet, timers, 1600);
      await skippableWait(1300);
      timers.clear();
      resolve({ firstTryCorrect: true, choices: 0 });
    }
  });

  mount(ctx.stage, h('div', { class: 'scene drumscene' }, status, kit.stage, beads));
  saySeq([{ phrase: 'copy_me', text: 'Copy me!' }]);
  void demo();
  return done;
};

/**
 * Find it (age 2-3, vocabulary and listening): hear "Find the ..." and tap the picture. A wrong tap just says that word
 * (the picture wobbles softly, the creature tilts its head and looks at the right card; after a second miss the right card pulses).
 */
export const findIt = async (ctx: Ctx, word: Word, others: Word[]): Promise<TrialResult> => {
  ctx.hint(`Ask: "Where is the ${word.text}? Can you point to it?" Name each picture together.`);
  const timers = makeTimers();
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const options = [word, ...others].sort(() => ctx.rng() - 0.5);
  let wrong = 0;
  const pet = companionEl(ctx.s, 'find-pet');
  const pics: HTMLElement[] = options.map((w, i) => {
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
        celebrate(b, { game: 'find' });
        cheerPet(pet, timers, 1500);
        await skippableWait(1200);
        timers.clear();
        resolve({ firstTryCorrect: wrong === 0, choices: options.length });
      } else {
        wrong++;
        b.classList.add('dim');
        play(b, 'wobble-soft', 700);
        soft();
        speak(w.text); // name it; the child hears the difference
        tiltPet(pet, timers);
        const right = pics.find((p) => p.dataset.answer === '1');
        if (right) {
          const r = right.getBoundingClientRect();
          timers.later(() => lookAt(pet, r.left + r.width / 2, r.top + r.height / 2), 350);
          timers.later(() => lookAt(pet, null, null), 2200);
          if (wrong >= 2) { right.classList.remove('hint'); void right.offsetWidth; right.classList.add('hint'); timers.later(() => right.classList.remove('hint'), 3200); }
        }
      }
    });
    return b;
  });
  mount(ctx.stage, h('div', { class: 'scene findscene' },
    h('div', { class: 'row find-head' }, pet, caption(`Find the ${word.text}!`)),
    h('div', { class: 'row tiles find-cards', 'data-testid': 'pics' }, pics)));
  saySeq([{ phrase: 'find_the', text: 'Find the' }, { word: word.text }]);
  return done;
};
