import { bankFor, type AccentId, type Grapheme, type Word } from '../engine/data';
import { shuffle, type Rng } from '../engine/dates';
import { phonemeOf, slashed, type PlacementItem } from '../engine/session';
import { buttonsFaded, setOpensNext, type ChildState } from '../engine/state';
import { robotSVG, rocketSVG } from './art';
import { companionSVG, mouthPct } from './themes';
import { pictureEl } from './pictures';
import { blip, playSequence, praise, sayPhrase, saySeq, sfx, soft, speak, tap } from './audio';
import { h, sleep } from './dom';
import { burst, mount, skippableWait } from './fx';
import { ghostDrag, makeAssist, makeDraggable, springBack } from './gesture';

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
/** Point the dino's pupils at a screen position (null = look straight ahead). */
export const lookAt = (el: Element, x: number | null, y: number | null): void => {
  el.querySelectorAll<SVGElement>('.pupil').forEach((p) => {
    p.style.transition = 'transform 0.12s';
    if (x === null || y === null) { p.style.transform = ''; return; }
    const r = p.getBoundingClientRect();
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(4, d / 28);
    p.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`;
  });
};
/** Occasional curious glances around, so the companion never looks frozen. */
const idleLook = (el: HTMLElement): void => {
  const tick = () => {
    if (!el.isConnected) return;
    const mood = el.querySelector('svg')?.getAttribute('class') ?? '';
    if (mood.includes('idle') && !el.classList.contains('looking')) {
      const r = el.getBoundingClientRect();
      const ang = Math.random() * Math.PI * 2;
      lookAt(el, r.left + r.width / 2 + Math.cos(ang) * 240, r.top + r.height / 2 + Math.sin(ang) * 140);
      setTimeout(() => el.isConnected && !el.classList.contains('looking') && lookAt(el, null, null), 800 + Math.random() * 600);
    }
    setTimeout(tick, 2600 + Math.random() * 3200);
  };
  setTimeout(tick, 1500 + Math.random() * 2000);
};
export const companionEl = (s: ChildState, extra = '', testid?: string): HTMLElement => {
  const el = h('div', { class: `companion ${extra}`, 'aria-hidden': 'true', 'data-testid': testid, 'data-growth': growthLevel(s) });
  el.innerHTML = companionSVG(s.companion?.kind ?? 'rexy', growthLevel(s));
  if (/sleepy/.test(extra)) setMood(el, 'sleepy');
  else idleLook(el);
  return el;
};

/** Chewing: the mouth works open and shut a few times (a gulp feels earned, not instant). */
const chew = async (dino: HTMLElement, times = 3): Promise<void> => {
  for (let i = 0; i < times; i++) {
    setMood(dino, 'oops');
    await wait(110);
    setMood(dino, 'open');
    await wait(110);
  }
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
 * Feed the Creature (sound to letter). DRAG a letter into the dino's mouth: its eyes follow your finger, it opens wide as the
 * letter nears, chews, gulps and jumps for joy. Dropping it elsewhere makes it spring back (no penalty). A wrong letter makes
 * the dino say "oh" and model the sound again. A ghost hand shows the drag if nothing has happened for a few seconds; tapping
 * a letter makes it hop towards the mouth, and after three taps (or with the parent setting) a tap places it directly.
 */
export const feedCreature = async (ctx: Ctx, target: Grapheme, options: Grapheme[]): Promise<TrialResult> => {
  const choices = options.length;
  ctx.hint(`Ask: "What else starts with ${slashed(target.id)}?" Say the sound, not the letter name. Drag the letter to the dino.`);
  const dino = companion(ctx, 'feed-dino-art');
  const pos = mouthPct(ctx.s.companion?.kind ?? 'rexy');
  const mouth = h('div', { class: 'mouthzone', 'data-testid': 'mouth', 'aria-hidden': 'true', style: `left:${pos.x}%;top:${pos.y}%` });
  const wrap = h('div', { class: 'feed-dino' }, dino, mouth);
  const say = () => blip(phonemeOf(target.id));
  const bubble = h('button', {
    class: 'bubble-btn', 'data-testid': 'replay', 'aria-label': `Hear the sound ${slashed(target.id)} again`, onClick: () => { tap(); say(); },
  }, h('span', { class: 'speaker' }, '🔊'), h('span', { class: 'bubble-sound' }, slashed(target.id)));
  const assist = makeAssist(ctx.s.easyTap);
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const dead = new Set<string>();
  let stopGhost: () => void = () => undefined;

  const attempt = async (tile: HTMLElement, g: Grapheme, from: { x: number; y: number }) => {
    if (dead.has(g.id) || tile.dataset.busy) return;
    stopGhost();
    if (g.id === target.id) {
      tile.dataset.busy = '1';
      dino.classList.add('looking');
      setMood(dino, 'open');
      const t = tile.getBoundingClientRect();
      const m = mouth.getBoundingClientRect();
      const dx = m.left + m.width / 2 - (t.left + t.width / 2) + from.x;
      const dy = m.top + m.height / 2 - (t.top + t.height / 2) + from.y;
      lookAt(dino, m.left + m.width / 2, m.top + m.height / 2);
      tile.classList.add('fly');
      tile.style.transform = `translate(${dx}px, ${dy}px) scale(0.2) rotate(18deg)`;
      sfx.whoosh();
      await wait(430);
      play(dino, 'gulp', 650);
      sfx.chomp();
      await chew(dino, 3);
      setMood(dino, 'happy');
      lookAt(dino, null, null);
      play(wrap, 'jump', 800);
      setTimeout(() => { sfx.sparkle(); praise(); }, 120);
      burst(mouth, 'confetti', 18);
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
    tile.addEventListener('pointerdown', () => { tap(); sfx.pop(); });
    makeDraggable(tile, {
      target: () => mouth.getBoundingClientRect(),
      slop: 45,
      nearScale: 0.5,
      onPickUp: () => { mouth.classList.add('hot'); stopGhost(); dino.classList.add('looking'); },
      onMove: (x, y, near) => { setMood(dino, near ? 'open' : 'idle'); lookAt(dino, x, y); },
      onDrop: async (hit, cur) => {
        mouth.classList.remove('hot');
        if (hit) await attempt(tile, g, cur);
        else {
          springBack(tile, cur);
          setMood(dino, 'idle');
          lookAt(dino, null, null);
        }
        if (!tile.dataset.busy) dino.classList.remove('looking');
      },
      onTap: () => {
        if (assist.allow) return void attempt(tile, g, { x: 0, y: 0 });
        assist.miss(); // not yet: the letter hops toward the mouth to show where it wants to go
        const t = tile.getBoundingClientRect(), m = mouth.getBoundingClientRect();
        const dx = (m.left + m.width / 2 - (t.left + t.width / 2)) * 0.3, dy = (m.top + m.height / 2 - (t.top + t.height / 2)) * 0.3;
        tile.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${dx}px, ${dy - 18}px) scale(1.05)`, offset: 0.5 }, { transform: 'translate(0,0)' }], { duration: 480, easing: 'ease-out' });
        sfx.boing();
        stopGhost();
        stopGhost = ghostDrag(sceneEl, choices === 1 ? tile : tilesRow, mouth);
        if (assist.allow) tile.classList.add('glow');
      },
    });
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); void attempt(tile, g, { x: 0, y: 0 }); }
    });
    return tile;
  });
  const tilesRow = h('div', { class: 'row tiles', 'data-testid': 'tiles' }, tiles);
  const sceneEl = h('div', { class: 'scene feed' },
    caption(`I’m hungry for ${slashed(target.id)}!`),
    h('div', { class: 'row creature-row' }, wrap, bubble),
    tilesRow,
  );
  mount(ctx.stage, sceneEl);
  stopGhost = ghostDrag(sceneEl, choices === 1 ? tiles[0]! : tilesRow, mouth);
  await wait(250);
  saySeq([{ phrase: 'hungry_for', text: 'I’m hungry for' }, { sound: phonemeOf(target.id) }]);
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
  void (async () => { await sayPhrase('listen_robot', 'Listen to the robot.'); await robotSays(); })();
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
  ctx.hint(`Ask: "What else rhymes with ${target.text}?" Clap the words together. Drag the rhyming picture into the rocket.`);
  const assist = makeAssist(ctx.s.easyTap);
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const rocket = h('div', { class: 'rocket' });
  rocket.innerHTML = rocketSVG();
  const fuel = h('div', { class: 'fuel', 'aria-hidden': 'true' }, h('div', { class: 'fuel-fill' }));
  let stopGhost: () => void = () => undefined;

  const attempt = async (b: HTMLElement, w: Word, from: { x: number; y: number }) => {
    if (b.dataset.busy) return;
    stopGhost();
    if (w === answer) {
      b.dataset.busy = '1';
      const t = b.getBoundingClientRect(), m = rocket.getBoundingClientRect();
      b.classList.add('fly');
      b.style.transform = `translate(${m.left + m.width / 2 - (t.left + t.width / 2) + from.x}px, ${m.top + m.height / 2 - (t.top + t.height / 2) + from.y}px) scale(0.2)`;
      sfx.whoosh();
      await wait(430);
      fuel.classList.add('full');
      rocket.classList.add('shake');
      praise();
      speak(`${target.text}, ${answer.text}`);
      await wait(900);
      sfx.launch();
      rocket.classList.remove('shake');
      rocket.classList.add('launch');
      burst(rocket, 'stars', 16);
      await skippableWait(1500);
      resolve({ firstTryCorrect: firstTry, choices: options.length });
    } else {
      firstTry = false;
      b.style.transform = '';
      b.classList.add('dim');
      b.setAttribute('disabled', '');
      soft();
      speak(w.text);
    }
  };

  const pics = options.map((w, i) => {
    const b = h('button', {
      class: `tile pic card${i % 3}`, 'data-testid': 'pic', 'data-answer': w === answer ? '1' : '0', 'aria-label': 'picture choice',
      style: `animation-delay:${i * 110}ms`,
    }, pictureEl(w.text, w.emoji));
    b.addEventListener('pointerdown', () => { tap(); sfx.pop(); });
    makeDraggable(b, {
      target: () => rocket.getBoundingClientRect(),
      slop: 50,
      onPickUp: () => { rocket.classList.add('hot'); stopGhost(); },
      onMove: (_x, _y, near) => rocket.classList.toggle('near', near),
      onDrop: async (hit, cur) => {
        rocket.classList.remove('hot', 'near');
        if (hit) await attempt(b, w, cur);
        else springBack(b, cur);
      },
      onTap: () => {
        if (assist.allow) return void attempt(b, w, { x: 0, y: 0 });
        assist.miss();
        sfx.boing();
        b.animate([{ transform: 'translate(0,0)' }, { transform: 'translateY(-20px) scale(1.06)', offset: 0.5 }, { transform: 'translate(0,0)' }], { duration: 480, easing: 'ease-out' });
        stopGhost();
        stopGhost = ghostDrag(sceneEl, picsRow, rocket);
      },
    });
    return b;
  });
  const picsRow = h('div', { class: 'row tiles', 'data-testid': 'pics' }, pics);
  const sceneEl = h('div', { class: 'scene rocketscene' },
    caption('Which one rhymes? Put it in the rocket!'),
    h('div', { class: 'skypanel' },
      h('button', { class: 'tile pic target', 'data-testid': 'rhyme-target', onClick: () => { tap(); speak(target.text); }, 'aria-label': 'hear the word' },
        pictureEl(target.text, target.emoji)),
      rocket, fuel),
    picsRow,
  );
  mount(ctx.stage, sceneEl);
  stopGhost = ghostDrag(sceneEl, picsRow, rocket);
  await wait(250);
  saySeq([{ phrase: 'which_rhymes', text: 'Which one rhymes?' }, { word: target.text }]);
  return done;
};

/**
 * Bridge Builder (blending printed words). Tap the sound buttons in order (dot = one letter, bar = digraph): each one drops
 * a plank. Once every sound has been tapped the sounds STAY tappable (hear any of them again, in any order, as often as you
 * like) and you can SLIDE a finger across the letters to blend them. Then pick the word and the dino walks across.
 */
export const bridgeBuilder = async (ctx: Ctx, word: Word, distractors: Word[]): Promise<TrialResult> => {
  // "Big reader" mode: a child who has read plenty of words skips the tap-each-sound step and goes straight to blending. The sound
  // buttons stay faintly visible (tap one to hear it) and come back at full strength after a wrong pick.
  const faded = buttonsFaded(ctx.s);
  ctx.hint(faded
    ? 'Big-reader round: your child blends the word straight away, with the sound buttons faded (still tappable for help). They return if the first pick is wrong. Change this in Settings.'
    : `Ask: "Can you push the sounds together to read it?" Tap each button, then slide your finger across the word to blend it.`);
  let next = faded ? word.graphemes.length : 0;
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
  const allTapped = () => next >= word.graphemes.length;
  const phs = word.graphemes.map(phonemeOf);

  const caps = caption('Tap each sound button, in order.');
  const slideHint = h('div', { class: 'slide-hint', 'aria-hidden': 'true', hidden: true }, '👉');

  // slide a finger across the letters left to right to blend them (a gesture, not a button)
  let visited: number[] = [];
  const colAt = (x: number, y: number): number => {
    const el = document.elementFromPoint(x, y)?.closest('.gcol') as HTMLElement | null;
    return el ? Number(el.dataset.i) : -1;
  };
  const wordRow = h('div', { class: 'row word', 'data-testid': 'word' });
  wordRow.style.touchAction = 'none';
  wordRow.addEventListener('pointerdown', (e) => { if (allTapped()) { visited = []; slideHint.hidden = true; const c = colAt(e.clientX, e.clientY); if (c >= 0) { visited.push(c); } } });
  wordRow.addEventListener('pointermove', (e) => {
    if (!allTapped() || e.buttons === 0) return;
    const c = colAt(e.clientX, e.clientY);
    if (c >= 0 && visited[visited.length - 1] !== c) {
      visited.push(c);
      blip(phs[c] as string, { maxMs: 260 });
      play(glyphs[c] as HTMLElement, 'bounce', 400);
      if (visited.length >= word.graphemes.length && visited.every((v, k) => v === k)) {
        visited = [];
        wordRow.classList.add('merge');
        setTimeout(() => { speak(word.text); }, 250);
        setTimeout(() => wordRow.classList.remove('merge'), 1400);
      }
    }
  });

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
            // a wrong pick is not a reset: the sounds are still there to tap and listen to again
            caps.textContent = 'Not quite. Tap the sounds again, then slide across to blend!';
            buttons.forEach((x) => x.classList.remove('faded')); // support returns in full
          }
        });
        return b;
      }),
    );
    caps.textContent = 'Slide your finger across the word to blend it. Which word is it?';
    slideHint.hidden = false;
    saySeq([{ phrase: 'slide_blend', text: 'Slide your finger across to blend.' }, { phrase: 'blend_it', text: 'Which word is it?' }]);
  };

  const buttons = word.graphemes.map((g, i) => {
    const digraph = g.length > 1;
    const b = h('button', {
      class: `soundbutton ${digraph ? 'bar' : 'dot'} tone${i % 4}${faded ? ' faded' : ''}`, 'data-testid': 'soundbutton', 'aria-label': `sound ${slashed(g)}`,
    });
    b.addEventListener('click', () => {
      if (i < next || allTapped()) {
        // already done (or the sequence is complete): just hear it again, any time, any order
        blip(phs[i] as string);
        play(glyphs[i] as HTMLElement, 'bounce', 500);
        play(b, 'bounce', 400);
        return;
      }
      if (i !== next) {
        soft();
        buttons[next]?.classList.add('nudge');
        setTimeout(() => buttons[next]?.classList.remove('nudge'), 600);
        return;
      }
      blip(phs[i] as string);
      b.classList.add('hit');
      play(glyphs[i] as HTMLElement, 'bounce', 500);
      slots[i]?.classList.add('filled');
      setTimeout(() => sfx.thud(), 120);
      next++;
      if (allTapped()) setTimeout(showChoices, 600);
    });
    return b;
  });
  const glyphs = word.graphemes.map((g) => h('span', { class: 'glyph' }, g));
  word.graphemes.forEach((_, i) => wordRow.append(h('div', { class: 'gcol', 'data-i': i }, glyphs[i], buttons[i])));
  mount(ctx.stage, h('div', { class: 'scene bridgescene' }, caps, wordRow, slideHint, bridge, choicesBox));
  if (faded) {
    slots.forEach((sl) => sl.classList.add('filled'));
    showChoices(); // straight to blending; it speaks its own prompt
  } else {
    saySeq([{ phrase: 'tap_sounds', text: 'Tap each sound, in order.' }]);
  }
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
  saySeq([{ phrase: 'which_letter', text: 'Which letter says' }, { sound: phonemeOf(item.target.id) }]);
  return done;
};
