import { bankFor, type AccentId, type Grapheme, type Word } from '../engine/data';
import { shuffle, type Rng } from '../engine/dates';
import { phonemeOf, slashed, type PlacementItem } from '../engine/session';
import { setOpensNext, type ChildState } from '../engine/state';
import { dinoMouthPct, robotSVG, rocketSVG, dinoSVG } from './art';
import { pictureEl } from './pictures';
import { blip, playSequence, praise, sfx, soft, speak, tap } from './audio';
import { h, sleep } from './dom';
import { burst, mount, skippableWait } from './fx';

export interface Ctx {
  s: ChildState;
  today: string;
  rng: Rng;
  stage: HTMLElement;
  /** Show a one-line prompt for the grown-up in the corner hint (spec: discreet co-play hints). */
  hint: (text: string | null) => void;
}
export interface TrialResult { firstTryCorrect: boolean; choices: number }

const wait = (ms: number) => sleep(ms);
const BEAD_COLOURS = ['#ff6b9a', '#ffd166', '#4cc3d9', '#8ee27a', '#9b8bf0'];
const caption = (text: string): HTMLElement => h('p', { class: 'caption', 'data-testid': 'caption' }, text);

// ---- the companion (a drawn dino that grows an accessory per set secured) -----------------------------------
export type Mood = 'idle' | 'happy' | 'open' | 'sleepy' | 'oops';
export const setMood = (el: Element, mood: Mood): void => {
  el.querySelector('svg')?.setAttribute('class', `dino mood-${mood}`);
};
export const growthLevel = (s: ChildState): number => {
  let n = 0;
  for (let set = 1; set <= 5 && setOpensNext(s, set); set++) n++;
  return Math.min(n, 4);
};
export const companionEl = (s: ChildState, extra = '', testid?: string): HTMLElement => {
  const el = h('div', { class: `companion ${extra}`, 'aria-hidden': 'true', 'data-testid': testid, 'data-growth': growthLevel(s) });
  el.innerHTML = dinoSVG(s.companion?.kind ?? 'rexy', growthLevel(s));
  if (/sleepy/.test(extra)) setMood(el, 'sleepy');
  return el;
};
const companion = (ctx: Ctx, extra = ''): HTMLElement => companionEl(ctx.s, extra);

/** Give a node a one-shot animation class. */
const play = (el: Element, cls: string, ms = 700): void => {
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
};

/**
 * Feed the Creature (sound to letter). Drag a letter into the dino's mouth, or just tap it.
 * The dino opens wide as a letter nears, gulps it with a squash, and sparkles. Wrong answers are never punished:
 * a soft sound, the dino says "oh", then models the sound again and the child tries again.
 */
export const feedCreature = async (ctx: Ctx, target: Grapheme, options: Grapheme[]): Promise<TrialResult> => {
  const choices = options.length;
  ctx.hint(`Ask: "What else starts with ${slashed(target.id)}?" Say the sound, not the letter name.`);
  const dino = companion(ctx, 'feed-dino-art');
  const pos = dinoMouthPct(ctx.s.companion?.kind ?? 'rexy');
  const mouth = h('div', { class: 'mouthzone', 'data-testid': 'mouth', 'aria-hidden': 'true', style: `left:${pos.x}%;top:${pos.y}%` });
  const wrap = h('div', { class: 'feed-dino' }, dino, mouth);
  const say = () => blip(phonemeOf(target.id));
  const bubble = h('button', {
    class: 'bubble-btn', 'data-testid': 'replay', 'aria-label': `Hear the sound ${slashed(target.id)} again`, onClick: () => { tap(); say(); },
  }, h('span', { class: 'speaker' }, '🔊'), h('span', { class: 'bubble-sound' }, slashed(target.id)));
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const dead = new Set<string>();

  const attempt = async (tile: HTMLElement, g: Grapheme, cur: { x: number; y: number }) => {
    if (dead.has(g.id) || tile.dataset.busy) return;
    if (g.id === target.id) {
      tile.dataset.busy = '1';
      setMood(dino, 'open');
      const t = tile.getBoundingClientRect();
      const m = mouth.getBoundingClientRect();
      const dx = m.left + m.width / 2 - (t.left + t.width / 2) + cur.x;
      const dy = m.top + m.height / 2 - (t.top + t.height / 2) + cur.y;
      tile.classList.add('fly');
      tile.style.transform = `translate(${dx}px, ${dy}px) scale(0.2) rotate(18deg)`;
      sfx.whoosh();
      await wait(430);
      play(dino, 'gulp', 650);
      setMood(dino, 'happy');
      sfx.chomp();
      setTimeout(() => { sfx.sparkle(); praise(); }, 160);
      burst(mouth, 'confetti', 16);
      await skippableWait(1100);
      resolve({ firstTryCorrect: firstTry, choices });
    } else {
      firstTry = false;
      dead.add(g.id);
      tile.style.transform = '';
      tile.classList.add('dim');
      tile.setAttribute('disabled', '');
      setMood(dino, 'oops');
      play(dino, 'tilt', 600);
      soft();
      await wait(500);
      setMood(dino, 'idle');
      say(); // the character models the right sound again
    }
  };

  const tiles = options.map((g, i) => {
    const tile = h('button', {
      class: `tile letter tone${i % 4}${choices === 1 ? ' glow' : ''}`, 'data-testid': 'tile', 'data-letter': g.id,
      'data-answer': g.id === target.id ? '1' : '0', 'aria-label': `letter ${g.id}`, style: `animation-delay:${i * 90}ms`,
    }, g.id);
    const cur = { x: 0, y: 0 };
    let start: { x: number; y: number } | null = null;
    tile.addEventListener('pointerdown', (e) => {
      tap();
      sfx.pop();
      start = { x: e.clientX, y: e.clientY };
      try { tile.setPointerCapture(e.pointerId); } catch { /* the pointer already ended: carry on without capture */ }
      tile.classList.add('dragging');
      mouth.classList.add('hot');
    });
    tile.addEventListener('pointermove', (e) => {
      if (!start) return;
      cur.x = e.clientX - start.x;
      cur.y = e.clientY - start.y;
      tile.style.transform = `translate(${cur.x}px, ${cur.y}px) scale(0.82) rotate(${Math.max(-12, Math.min(12, cur.x / 12))}deg)`; // smaller while carried, so the dino's face stays visible
      const m = mouth.getBoundingClientRect();
      const near = Math.hypot(e.clientX - (m.left + m.width / 2), e.clientY - (m.top + m.height / 2)) < 130;
      setMood(dino, near ? 'open' : 'idle');
    });
    const end = (e: PointerEvent) => {
      if (!start) return;
      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      start = null;
      tile.classList.remove('dragging');
      mouth.classList.remove('hot');
      const m = mouth.getBoundingClientRect();
      const overMouth = e.clientX >= m.left - 40 && e.clientX <= m.right + 40 && e.clientY >= m.top - 40 && e.clientY <= m.bottom + 40;
      if (moved < 12 || overMouth) {
        void attempt(tile, g, moved < 12 ? { x: 0, y: 0 } : { ...cur });
      } else {
        // dropped elsewhere: spring back, no penalty
        tile.style.transform = '';
        setMood(dino, 'idle');
        cur.x = cur.y = 0;
      }
      if (moved < 12) tile.style.transform = tile.dataset.busy ? tile.style.transform : '';
    };
    tile.addEventListener('pointerup', end);
    tile.addEventListener('pointercancel', () => {
      start = null;
      tile.classList.remove('dragging');
      tile.style.transform = '';
      mouth.classList.remove('hot');
      setMood(dino, 'idle');
    });
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        void attempt(tile, g, { x: 0, y: 0 });
      }
    });
    return tile;
  });

  mount(ctx.stage,
    h('div', { class: 'scene feed' },
      caption(`I’m hungry for ${slashed(target.id)}!`),
      h('div', { class: 'row creature-row' }, wrap, bubble),
      h('div', { class: 'row tiles', 'data-testid': 'tiles' }, tiles),
    ),
  );
  await wait(250);
  say();
  return done;
};

/**
 * Robot Talk (oral blending, no letters). The robot says the sounds one at a time, each lighting a coloured bead;
 * the child picks the picture. Beads rather than letters: this is the oral stage of the progression.
 */
export const robotTalk = async (ctx: Ctx, word: Word, distractors: Word[]): Promise<TrialResult> => {
  const options = shuffle([word, ...distractors], ctx.rng);
  const choices = options.length;
  ctx.hint('Ask: "Can you say it slowly like the robot, then fast?" Do not show the written word.');
  const phonemes = word.graphemes.map(phonemeOf);
  const beads = phonemes.map((_, i) => h('span', { class: 'bead', 'data-testid': 'chip', style: `--c:${BEAD_COLOURS[i % BEAD_COLOURS.length]}` }));
  const robot = h('div', { class: 'robot' });
  robot.innerHTML = robotSVG();
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  let playing = false;

  const robotSays = async () => {
    if (playing) return;
    playing = true;
    robot.classList.add('talking');
    await playSequence(phonemes, (i) => beads.forEach((b, k) => b.classList.toggle('on', k === i)));
    robot.classList.remove('talking');
    playing = false;
  };

  const pics = options.map((w, i) => {
    const b = h('button', {
      class: `tile pic card${i % 3}`, 'data-testid': 'pic', 'data-answer': w === word ? '1' : '0', 'aria-label': 'picture choice',
      style: `animation-delay:${i * 110}ms`,
    }, pictureEl(w.text, w.emoji));
    b.addEventListener('click', async () => {
      tap();
      sfx.pop();
      if (b.dataset.busy) return;
      if (w === word) {
        b.dataset.busy = '1';
        b.classList.add('alive');
        robot.classList.add('cheer');
        sfx.sparkle();
        praise();
        speak(word.text);
        burst(b, 'stars', 14);
        await skippableWait(1300);
        resolve({ firstTryCorrect: firstTry, choices });
      } else {
        firstTry = false;
        b.classList.add('dim');
        b.setAttribute('disabled', '');
        soft();
        await wait(350);
        void robotSays(); // model it again, no penalty
      }
    });
    return b;
  });

  mount(ctx.stage,
    h('div', { class: 'scene robotscene' },
      caption('Listen to the robot…'),
      h('div', { class: 'row' }, robot, h('button', { class: 'bubble-btn small', 'data-testid': 'robot-again', 'aria-label': 'Say it again', onClick: () => void robotSays() }, '🔁')),
      h('div', { class: 'row beads', 'data-testid': 'chips' }, beads),
      h('div', { class: 'row tiles', 'data-testid': 'pics' }, pics),
    ),
  );
  await wait(250);
  void robotSays();
  return done;
};

/** Rhyme Rocket (rhyme). Used for Sound Play (band B) and as the third practice game before print blending opens. */
export const rimeOf = (w: Word): string => w.graphemes.slice(1).join('-');
export const rhymeSets = (accent: AccentId): Word[][] => {
  const by = new Map<string, Word[]>();
  for (const w of bankFor(accent).filter((x) => x.emoji && x.graphemes.length === 3)) {
    const k = rimeOf(w);
    by.set(k, [...(by.get(k) ?? []), w]);
  }
  return [...by.values()].filter((g) => g.length >= 2);
};

export const rhymeRocket = async (ctx: Ctx, target: Word, answer: Word, distractors: Word[]): Promise<TrialResult> => {
  const options = shuffle([answer, ...distractors], ctx.rng);
  ctx.hint(`Ask: "What else rhymes with ${target.text}?" Clap the words together.`);
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const rocket = h('div', { class: 'rocket' });
  rocket.innerHTML = rocketSVG();
  const fuel = h('div', { class: 'fuel', 'aria-hidden': 'true' }, h('div', { class: 'fuel-fill' }));
  const pics = options.map((w, i) => {
    const b = h('button', {
      class: `tile pic card${i % 3}`, 'data-testid': 'pic', 'data-answer': w === answer ? '1' : '0', 'aria-label': 'picture choice',
      style: `animation-delay:${i * 110}ms`,
    }, pictureEl(w.text, w.emoji));
    b.addEventListener('click', async () => {
      tap();
      sfx.pop();
      if (b.dataset.busy) return;
      if (w === answer) {
        b.dataset.busy = '1';
        b.classList.add('alive');
        fuel.classList.add('full');
        praise();
        speak(`${target.text}, ${answer.text}`);
        await wait(700);
        sfx.launch();
        rocket.classList.add('launch');
        burst(rocket, 'stars', 14);
        await skippableWait(1500);
        resolve({ firstTryCorrect: firstTry, choices: options.length });
      } else {
        firstTry = false;
        b.classList.add('dim');
        b.setAttribute('disabled', '');
        soft();
        speak(w.text);
      }
    });
    return b;
  });
  mount(ctx.stage,
    h('div', { class: 'scene rocketscene' },
      caption('Which one rhymes? Fuel the rocket!'),
      h('div', { class: 'skypanel' },
        h('button', { class: 'tile pic target', 'data-testid': 'rhyme-target', onClick: () => { tap(); speak(target.text); }, 'aria-label': 'hear the word' },
          pictureEl(target.text, target.emoji)),
        rocket, fuel),
      h('div', { class: 'row tiles', 'data-testid': 'pics' }, pics),
    ),
  );
  await wait(250);
  speak(target.text);
  return done;
};

/**
 * Bridge Builder (blending printed words). Tap the sound buttons in order (dot = one letter, bar = digraph): each
 * one drops a plank. Then pick the word you blended and the dino walks across the bridge.
 */
export const bridgeBuilder = async (ctx: Ctx, word: Word, distractors: Word[]): Promise<TrialResult> => {
  ctx.hint(`Ask: "Can you push the sounds together to read it?" Tap each button, then say it fast.`);
  let next = 0;
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const choicesBox = h('div', { class: 'row tiles words', 'data-testid': 'wordchoices' });
  const options = shuffle([word, ...distractors], ctx.rng);
  const slots = word.graphemes.map(() => h('span', { class: 'slot', 'aria-hidden': 'true' }));
  const walker = companionEl(ctx.s, 'walker');
  const hopper = h('div', { class: 'hopper' }, walker);
  const far = h('span', { class: 'far', 'aria-hidden': 'true' }, '🚩');
  const bridge = h('div', { class: 'bridge', 'data-testid': 'bridge' },
    hopper, h('div', { class: 'planks' }, slots), far, h('div', { class: 'river', 'aria-hidden': 'true' }));

  const caps = caption('Tap each sound button, in order.');
  const showChoices = () => {
    choicesBox.replaceChildren(
      ...options.map((w, i) => {
        const b = h('button', {
          class: `tile wordtile card${i % 3}`, 'data-testid': 'wordchoice', 'data-answer': w === word ? '1' : '0', style: `animation-delay:${i * 100}ms`,
        }, w.text);
        b.addEventListener('click', async () => {
          tap();
          sfx.pop();
          if (b.dataset.busy) return;
          if (w === word) {
            b.dataset.busy = '1';
            b.classList.add('alive');
            praise();
            speak(word.text);
            const span = far.getBoundingClientRect().left - walker.getBoundingClientRect().left - 30;
            hopper.style.setProperty('--span', `${span}px`);
            bridge.classList.add('built');
            const steps = setInterval(() => sfx.step(), 230);
            await wait(1500);
            clearInterval(steps);
            setMood(walker, 'happy');
            sfx.sparkle();
            burst(far, 'confetti', 16);
            await skippableWait(1100);
            resolve({ firstTryCorrect: firstTry, choices: options.length });
          } else {
            firstTry = false;
            b.classList.add('dim');
            b.setAttribute('disabled', '');
            soft();
            next = 0; // gently start the sound buttons again
            buttons.forEach((x) => x.classList.remove('hit'));
            slots.forEach((x) => x.classList.remove('filled'));
            choicesBox.replaceChildren();
            caps.textContent = 'Let’s tap the sounds again.';
          }
        });
        return b;
      }),
    );
    caps.textContent = 'Now blend them. Which word is it?';
  };

  const buttons = word.graphemes.map((g, i) => {
    const digraph = g.length > 1;
    const b = h('button', {
      class: `soundbutton ${digraph ? 'bar' : 'dot'} tone${i % 4}`, 'data-testid': 'soundbutton', 'aria-label': `sound ${slashed(g)}`,
    });
    b.addEventListener('click', () => {
      if (i !== next) {
        soft();
        buttons[next]?.classList.add('nudge');
        setTimeout(() => buttons[next]?.classList.remove('nudge'), 600);
        return;
      }
      blip(phonemeOf(g));
      b.classList.add('hit');
      play(glyphs[i] as HTMLElement, 'bounce', 500);
      slots[i]?.classList.add('filled');
      setTimeout(() => sfx.thud(), 120);
      next++;
      if (next === word.graphemes.length) setTimeout(showChoices, 600);
    });
    return b;
  });
  const glyphs = word.graphemes.map((g) => h('span', { class: 'glyph' }, g));
  const letters = word.graphemes.map((_, i) => h('div', { class: 'gcol' }, glyphs[i], buttons[i]));
  mount(ctx.stage, h('div', { class: 'scene' }, caps, h('div', { class: 'row word', 'data-testid': 'word' }, letters), bridge, choicesBox));
  return done;
};

/** Placement game: neutral and encouraging whatever the answer (no fail state). */
export const placementTrial = async (ctx: Ctx, item: PlacementItem): Promise<boolean> => {
  ctx.hint('Let your child choose on their own. There are no wrong answers here, it only sets the starting point.');
  let resolve!: (ok: boolean) => void;
  const done = new Promise<boolean>((r) => (resolve = r));
  const dino = companion(ctx, 'feed-dino-art');
  const tiles = item.options.map((g, i) => {
    const b = h('button', {
      class: `tile letter tone${i % 4}`, 'data-testid': 'tile', 'data-letter': g.id, 'data-answer': g.id === item.target.id ? '1' : '0',
    }, g.id);
    b.addEventListener('click', async () => {
      tap();
      sfx.pop();
      b.classList.add('eaten');
      setMood(dino, 'happy');
      praise();
      await wait(550);
      resolve(g.id === item.target.id);
    });
    return b;
  });
  mount(ctx.stage,
    h('div', { class: 'scene' },
      caption(`Which letter says ${slashed(item.target.id)}?`),
      h('div', { class: 'feed-dino' }, dino),
      h('button', { class: 'bubble-btn', 'data-testid': 'replay', onClick: () => blip(phonemeOf(item.target.id)) }, h('span', { class: 'speaker' }, '🔊'), h('span', { class: 'bubble-sound' }, slashed(item.target.id))),
      h('div', { class: 'row tiles' }, tiles),
    ),
  );
  await wait(250);
  blip(phonemeOf(item.target.id));
  return done;
};
