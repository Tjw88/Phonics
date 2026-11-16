import { type Grapheme, type Word } from '../engine/data';
import { shuffle, type Rng } from '../engine/dates';
import { bankFor, type AccentId } from '../engine/data';
import { phonemeOf, slashed, type PlacementItem } from '../engine/session';
import { setOpensNext, type ChildState } from '../engine/state';
import { blip, playSequence, praise, soft, speak, tap } from './audio';
import { h, sleep } from './dom';

export interface Ctx {
  s: ChildState;
  today: string;
  rng: Rng;
  stage: HTMLElement;
  /** Show a one-line prompt for the grown-up in the corner hint (spec: discreet co-play hints). */
  hint: (text: string | null) => void;
}

export interface TrialResult { firstTryCorrect: boolean; choices: number }

/** The companion grows: a new accessory for each set the child has (nearly) secured. Progress lives in the character. */
const ACCESSORIES = ['', '🎀', '🧢', '🕶️', '👑'];
export const growthLevel = (s: ChildState): number => {
  let n = 0;
  for (let set = 1; set <= 5 && setOpensNext(s, set); set++) n++;
  return Math.min(n, ACCESSORIES.length - 1);
};
export const companionEl = (s: ChildState, extra = '', testid?: string): HTMLElement =>
  h('div', { class: `companion ${extra}`, 'aria-hidden': 'true', 'data-testid': testid, 'data-growth': growthLevel(s) },
    s.companion?.kind ?? '🦖',
    growthLevel(s) ? h('span', { class: 'acc' }, ACCESSORIES[growthLevel(s)]) : null);
const companion = (ctx: Ctx, extra = ''): HTMLElement => companionEl(ctx.s, extra);

const caption = (text: string): HTMLElement => h('p', { class: 'caption', 'data-testid': 'caption' }, text);

const wait = (ms: number) => sleep(ms);

/**
 * Feed the Creature (sound to letter). Drag a letter to the creature's mouth, or just tap it.
 * Wrong answers are never punished: soft sound, the creature says the sound again, try again.
 */
export const feedCreature = async (ctx: Ctx, target: Grapheme, options: Grapheme[]): Promise<TrialResult> => {
  const choices = options.length;
  ctx.hint(`Ask: "What else starts with ${slashed(target.id)}?" Say the sound, not the letter name.`);
  const mouth = h('div', { class: 'mouth', 'data-testid': 'mouth', 'aria-hidden': 'true' }, '😮');
  const say = () => blip(phonemeOf(target.id));
  const prompt = h('button', {
    class: 'btn soundbtn', 'data-testid': 'replay', 'aria-label': `Hear the sound ${slashed(target.id)} again`,
    onClick: say,
  }, `🔊 ${slashed(target.id)}`);
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const dead = new Set<string>();

  const attempt = async (tile: HTMLElement, g: Grapheme) => {
    if (dead.has(g.id) || tile.dataset.busy) return;
    if (g.id === target.id) {
      tile.dataset.busy = '1';
      tile.classList.add('eaten');
      mouth.classList.add('chomp');
      praise();
      await wait(650);
      resolve({ firstTryCorrect: firstTry, choices });
    } else {
      firstTry = false;
      dead.add(g.id);
      tile.classList.add('dim');
      tile.setAttribute('disabled', '');
      soft();
      await wait(450);
      say(); // the character models the right sound again
    }
  };

  const tiles = options.map((g) => {
    const tile = h('button', {
      class: `tile${choices === 1 ? ' glow' : ''}`, 'data-testid': 'tile', 'data-letter': g.id,
      'data-answer': g.id === target.id ? '1' : '0', 'aria-label': `letter ${g.id}`,
    }, g.id);
    let start: { x: number; y: number } | null = null;
    tile.addEventListener('pointerdown', (e) => {
      tap();
      start = { x: e.clientX, y: e.clientY };
      tile.setPointerCapture(e.pointerId);
      tile.classList.add('dragging');
      mouth.classList.add('hot');
    });
    tile.addEventListener('pointermove', (e) => {
      if (!start) return;
      tile.style.transform = `translate(${e.clientX - start.x}px, ${e.clientY - start.y}px) scale(1.1)`;
    });
    const end = (e: PointerEvent) => {
      if (!start) return;
      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      start = null;
      tile.classList.remove('dragging');
      mouth.classList.remove('hot');
      tile.style.transform = '';
      const m = mouth.getBoundingClientRect();
      const overMouth = e.clientX >= m.left - 30 && e.clientX <= m.right + 30 && e.clientY >= m.top - 30 && e.clientY <= m.bottom + 30;
      if (moved < 12 || overMouth) void attempt(tile, g); // tap, or a drop on the mouth; a drop elsewhere just snaps back
    };
    tile.addEventListener('pointerup', end);
    tile.addEventListener('pointercancel', () => {
      start = null;
      tile.classList.remove('dragging');
      tile.style.transform = '';
    });
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        void attempt(tile, g);
      }
    });
    return tile;
  });

  ctx.stage.replaceChildren(
    h('div', { class: 'scene feed' },
      caption(`I’m hungry for ${slashed(target.id)}!`),
      h('div', { class: 'row creature-row' }, mouth, companion(ctx, 'big')),
      prompt,
      h('div', { class: 'row tiles', 'data-testid': 'tiles' }, tiles),
    ),
  );
  await wait(250);
  say();
  return done;
};

/**
 * Robot Talk (oral blending, no letters). The robot says the sounds one at a time; the child picks the picture.
 */
export const robotTalk = async (ctx: Ctx, word: Word, distractors: Word[]): Promise<TrialResult> => {
  const options = shuffle([word, ...distractors], ctx.rng);
  const choices = options.length;
  ctx.hint('Ask: "Can you say it slowly like the robot, then fast?" Do not show the written word.');
  const phonemes = word.graphemes.map(phonemeOf);
  const chips = phonemes.map((p) => h('span', { class: 'chip', 'data-testid': 'chip' }, `/${p}/`));
  const robot = h('div', { class: 'robot' }, '🤖');
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  let playing = false;

  const robotSays = async () => {
    if (playing) return;
    playing = true;
    robot.classList.add('talking');
    await playSequence(phonemes, (i) => chips.forEach((c, k) => c.classList.toggle('on', k === i)));
    robot.classList.remove('talking');
    playing = false;
  };

  const pics = options.map((w) => {
    const b = h('button', {
      class: 'tile pic', 'data-testid': 'pic', 'data-answer': w === word ? '1' : '0', 'aria-label': 'picture choice',
    }, w.emoji ?? '❔');
    b.addEventListener('click', async () => {
      tap();
      if (b.dataset.busy) return;
      if (w === word) {
        b.dataset.busy = '1';
        b.classList.add('alive');
        praise();
        speak(word.text);
        await wait(1100);
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

  ctx.stage.replaceChildren(
    h('div', { class: 'scene robotscene' },
      caption('Listen to the robot…'),
      h('div', { class: 'row' }, robot, h('button', { class: 'btn soundbtn', 'data-testid': 'robot-again', onClick: () => void robotSays() }, '🔁')),
      h('div', { class: 'row chips', 'data-testid': 'chips' }, chips),
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
  const rocket = h('div', { class: 'rocket' }, '🚀');
  const pics = options.map((w) => {
    const b = h('button', {
      class: 'tile pic', 'data-testid': 'pic', 'data-answer': w === answer ? '1' : '0', 'aria-label': 'picture choice',
    }, w.emoji ?? '❔');
    b.addEventListener('click', async () => {
      tap();
      if (b.dataset.busy) return;
      if (w === answer) {
        b.dataset.busy = '1';
        rocket.classList.add('launch');
        praise();
        speak(`${target.text}, ${answer.text}`);
        await wait(1300);
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
  ctx.stage.replaceChildren(
    h('div', { class: 'scene' },
      caption('Which one rhymes? Pick it to fuel the rocket!'),
      h('div', { class: 'row' }, h('button', {
        class: 'tile pic target', 'data-testid': 'rhyme-target', onClick: () => speak(target.text),
        'aria-label': 'hear the word',
      }, target.emoji ?? '❔'), rocket),
      h('div', { class: 'row tiles', 'data-testid': 'pics' }, pics),
    ),
  );
  await wait(250);
  speak(target.text);
  return done;
};

/**
 * Bridge Builder (blending printed words). Tap the sound buttons in order (dot = one letter, bar = digraph),
 * then pick the word you blended. The plank appears.
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
  const bridge = h('div', { class: 'bridge', 'data-testid': 'bridge' }, walker, h('div', { class: 'planks' }, slots), h('span', { class: 'far', 'aria-hidden': 'true' }, '🏝️'));

  const showChoices = () => {
    choicesBox.replaceChildren(
      ...options.map((w) => {
        const b = h('button', { class: 'tile wordtile', 'data-testid': 'wordchoice', 'data-answer': w === word ? '1' : '0' }, w.text);
        b.addEventListener('click', async () => {
          tap();
          if (b.dataset.busy) return;
          if (w === word) {
            b.dataset.busy = '1';
            praise();
            speak(word.text);
            bridge.classList.add('built');
            await wait(1400);
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

  const caps = caption('Tap each sound button, in order.');
  const buttons = word.graphemes.map((g, i) => {
    const digraph = g.length > 1;
    const b = h('button', {
      class: `soundbutton ${digraph ? 'bar' : 'dot'}`, 'data-testid': 'soundbutton',
      'aria-label': `sound ${slashed(g)}`,
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
      slots[i]?.classList.add('filled');
      next++;
      if (next === word.graphemes.length) setTimeout(showChoices, 500);
    });
    return b;
  });
  const letters = word.graphemes.map((g, i) =>
    h('div', { class: 'gcol' }, h('span', { class: 'glyph' }, g), buttons[i]),
  );
  ctx.stage.replaceChildren(
    h('div', { class: 'scene' }, caps, h('div', { class: 'row word', 'data-testid': 'word' }, letters), bridge, choicesBox),
  );
  return done;
};

/** Placement game: neutral and encouraging whatever the answer (no fail state). */
export const placementTrial = async (ctx: Ctx, item: PlacementItem): Promise<boolean> => {
  ctx.hint('Let your child choose on their own. There are no wrong answers here, it only sets the starting point.');
  let resolve!: (ok: boolean) => void;
  const done = new Promise<boolean>((r) => (resolve = r));
  const tiles = item.options.map((g) => {
    const b = h('button', {
      class: 'tile', 'data-testid': 'tile', 'data-letter': g.id, 'data-answer': g.id === item.target.id ? '1' : '0',
    }, g.id);
    b.addEventListener('click', async () => {
      tap();
      b.classList.add('eaten');
      praise();
      await wait(500);
      resolve(g.id === item.target.id);
    });
    return b;
  });
  ctx.stage.replaceChildren(
    h('div', { class: 'scene' },
      caption(`Which letter says ${slashed(item.target.id)}?`),
      h('button', { class: 'btn soundbtn', 'data-testid': 'replay', onClick: () => blip(phonemeOf(item.target.id)) }, `🔊 ${slashed(item.target.id)}`),
      h('div', { class: 'row tiles' }, tiles),
    ),
  );
  await wait(250);
  blip(phonemeOf(item.target.id));
  return done;
};
