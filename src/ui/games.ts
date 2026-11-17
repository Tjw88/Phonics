import './anim-games.css';
import { bankFor, type AccentId, type Grapheme, type Word } from '../engine/data';
import { shuffle, type Rng } from '../engine/dates';
import { phonemeOf, slashed, type PlacementItem } from '../engine/session';
import { buttonsFaded, setOpensNext, type ChildState } from '../engine/state';
import { robotSVG } from './art';
import { companionSVG, mouthPct } from './themes';
import { pictureEl } from './pictures';
import { blip, playSequence, praise, sayPhrase, saySeq, sfx, soft, speak, tap } from './audio';
import { h, reducedMotion, sleep } from './dom';
import { mount, skippableWait } from './fx';
import { ghostDrag, makeAssist, makeDraggable, springBack } from './gesture';
import { celebrate, celebrationCount } from './celebrate';
import { emit, rawPack } from './particles';
import { lookAt, reactions, setMood, type Mood } from './reactions';
import { exitMs, robotWithProp, vehicleExit, vehicleName, vehicleSVG } from './vehicles';

// the creature's face and eyes live in reactions.ts (so the reaction library can use them); re-exported for the other game files
export { lookAt, setMood };
export type { Mood };

export interface Ctx {
  s: ChildState;
  today: string;
  rng: Rng;
  stage: HTMLElement;
  /** Show a one-line prompt for the grown-up in the corner hint (spec: discreet co-play hints). */
  hint: (text: string | null) => void;
  /** Optional: true on the last round of a block (the flow engineer may set it so the success is a finale). */
  last?: boolean;
}
export interface TrialResult { firstTryCorrect: boolean; choices: number }

const wait = (ms: number) => sleep(ms);
const BEAD_COLOURS = ['#ff6b9a', '#ffd166', '#4cc3d9', '#8ee27a', '#9b8bf0'];
const caption = (text: string): HTMLElement => h('p', { class: 'caption', 'data-testid': 'caption' }, text);

// ---- the companion (a drawn dino that grows an accessory per set secured) -----------------------------------
export const growthLevel = (s: ChildState): number => {
  let n = 0;
  for (let set = 1; set <= 5 && setOpensNext(s, set); set++) n++;
  return Math.min(n, 4);
};
/** Occasional curious glances around, so the companion never looks frozen. */
const idleLook = (el: HTMLElement): void => {
  const tick = () => {
    if (!el.isConnected) return;
    const mood = el.querySelector('svg')?.getAttribute('class') ?? '';
    if (mood.includes('idle') && !el.classList.contains('looking') && !el.dataset.hold) {
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
  const el = h('div', { class: `companion ${extra}`, 'aria-hidden': 'true', 'data-testid': testid, 'data-growth': growthLevel(s), 'data-kind': s.companion?.kind ?? 'rexy' });
  el.innerHTML = companionSVG(s.companion?.kind ?? 'rexy', growthLevel(s));
  if (/sleepy/.test(extra)) setMood(el, 'sleepy');
  else idleLook(el);
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
 * Feed the Creature (sound to letter). DRAG a letter into the creature's mouth: its eyes follow your finger, it opens wide as the
 * letter nears, takes it in its OWN way (a digger scoops, an alien beams, a jelly engulfs, a dragon gulps with a puff, an animal chomps:
 * see reactions.ts), then celebrates with the world's particles. Three variants rotate by round and every success after the first of the
 * session is the short version. Dropping a letter elsewhere makes it spring back (no penalty). A wrong letter: the creature says a soft
 * "oh", tilts its head and LOOKS TOWARD THE RIGHT LETTER; after the second miss that letter gently pulses (no shake, no red).
 * A ghost hand shows the drag after about 2 s of nothing (at most twice a round); tapping a letter makes it hop towards the mouth, and
 * after two taps (or with the parent setting) a tap places it directly (at once when there is only one letter to choose).
 */
export const feedCreature = async (ctx: Ctx, target: Grapheme, options: Grapheme[]): Promise<TrialResult> => {
  const choices = options.length;
  ctx.hint(`Ask: "What else starts with ${slashed(target.id)}?" Say the sound, not the letter name. Drag the letter to the creature.`);
  const dino = companion(ctx, 'feed-dino-art');
  const pos = mouthPct(ctx.s.companion?.kind ?? 'rexy');
  const mouth = h('div', { class: 'mouthzone', 'data-testid': 'mouth', 'aria-hidden': 'true', style: `left:${pos.x}%;top:${pos.y}%` });
  const crown = h('div', { class: 'burst-anchor', 'aria-hidden': 'true' }); // celebrations fan up from above the head, not over the face
  const wrap = h('div', { class: 'feed-dino' }, dino, mouth, crown);
  const say = () => blip(phonemeOf(target.id));
  const bubble = h('button', {
    class: 'bubble-btn', 'data-testid': 'replay', 'aria-label': `Hear the sound ${slashed(target.id)} again`, onClick: () => { tap(); say(); },
  }, h('span', { class: 'speaker' }, '🔊'), h('span', { class: 'bubble-sound' }, slashed(target.id)));
  const assist = makeAssist(ctx.s.easyTap || choices < 2); // one option = nothing to get wrong: a tap just works (a 3-year-old taps first)
  let firstTry = true;
  let misses = 0;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  const dead = new Set<string>();
  let stopGhost: () => void = () => undefined;
  const rightTile = (): HTMLElement | undefined => tiles.find((t) => t.dataset.answer === '1');

  const attempt = async (tile: HTMLElement, g: Grapheme, from: { x: number; y: number }) => {
    if (dead.has(g.id) || tile.dataset.busy) return;
    stopGhost();
    if (g.id === target.id) {
      tile.dataset.busy = '1';
      rightTile()?.classList.remove('hint-pulse');
      dino.classList.add('looking');
      const t = tile.getBoundingClientRect();
      const m = mouth.getBoundingClientRect();
      const dx = m.left + m.width / 2 - (t.left + t.width / 2) + from.x;
      const dy = m.top + m.height / 2 - (t.top + t.height / 2) + from.y;
      lookAt(dino, m.left + m.width / 2, m.top + m.height / 2);
      sfx.whoosh();
      const index = celebrationCount('feed'); // 0 for the first success of the session: the full version; later ones are shorter
      await reactions.eat({
        creature: dino, tile, mouth, cur: from, end: { x: dx, y: dy }, index, short: index > 0, kind: ctx.s.companion?.kind,
        onSwallow: () => sfx.chomp(),
        onHappy: () => {
          setTimeout(() => { sfx.sparkle(); praise(); }, 60);
          celebrate(crown, { game: 'feed', last: ctx.last });
        },
      });
      await skippableWait(index > 0 ? 100 : 300);
      resolve({ firstTryCorrect: firstTry, choices });
    } else {
      firstTry = false;
      misses++;
      dead.add(g.id);
      tile.style.transform = '';
      tile.classList.add('dim');
      tile.setAttribute('disabled', '');
      soft();
      await reactions.wrong(dino, { toward: rightTile() ?? null });
      say(); // the character models the right sound again
      const rt = rightTile();
      if (misses >= 2 && rt && !rt.dataset.busy) reactions.pulseHint(rt); // errorless: after the second miss the right letter gently pulses
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
        stopGhost = ghostDrag(sceneEl, choices === 1 ? tile : tilesRow, mouth, { delay: 700 });
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
  robot.innerHTML = robotWithProp(robotSVG(), rawPack());
  let firstTry = true;
  let resolve!: (r: TrialResult) => void;
  const done = new Promise<TrialResult>((r) => (resolve = r));
  let playing = false;
  let finished = false; // the right card was tapped (maybe while the robot was still talking): stop lighting beads

  // the robot's body moves WITH each sound (not a loop): one arm lifts (they alternate), the chest light flashes and the whole robot bobs
  const armL = robot.querySelector<SVGElement>('rect[x="16"][y="120"]'), armR = robot.querySelector<SVGElement>('rect[x="122"][y="120"]');
  const chest = robot.querySelector<SVGElement>('circle[cx="80"][cy="144"]');
  for (const [el, o] of [[armL, '100% 50%'], [armR, '0% 50%'], [chest, '50% 50%']] as const) if (el) { el.style.transformBox = 'fill-box'; el.style.transformOrigin = o; }
  const robotBeat = (i: number) => {
    if (reducedMotion()) return;
    const arm = i % 2 ? armR : armL;
    arm?.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${i % 2 ? -34 : 34}deg)`, offset: 0.4 }, { transform: 'rotate(0deg)' }], { duration: 380, easing: 'ease-in-out' });
    chest?.animate([{ transform: 'scale(1)', fill: '#ffd166' }, { transform: 'scale(1.4)', fill: '#fff6c8', offset: 0.35 }, { transform: 'scale(1)', fill: '#ffd166' }], { duration: 380, easing: 'ease-out' });
    robot.querySelector('svg')?.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-6px) rotate(' + (i % 2 ? 1.5 : -1.5) + 'deg)', offset: 0.4 }, { transform: 'translateY(0px)' }], { duration: 380, easing: 'ease-out' });
  };
  const robotSays = async () => {
    if (playing || finished) return;
    playing = true;
    robot.classList.add('talking');
    await playSequence(phonemes, (i) => { if (!finished) { beads.forEach((b, k) => b.classList.toggle('on', k === i)); if (i >= 0) robotBeat(i); } });
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
        finished = true; // answers are live while the robot speaks: an early tap is fine
        beads.forEach((x, k) => { x.classList.remove('on'); x.style.transitionDelay = `${k * 90}ms`; x.classList.add('ok'); }); // all the bulbs light green
        robot.classList.remove('talking');
        b.classList.add('alive');
        robot.classList.remove('cheer');
        void robot.getBoundingClientRect();
        robot.classList.add('cheer'); // two nods and both arms up
        if (!reducedMotion()) { armL?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(40deg)', offset: 0.3 }, { transform: 'rotate(40deg)', offset: 0.75 }, { transform: 'rotate(0deg)' }], { duration: 900, easing: 'ease-in-out' }); armR?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-40deg)', offset: 0.3 }, { transform: 'rotate(-40deg)', offset: 0.75 }, { transform: 'rotate(0deg)' }], { duration: 900, easing: 'ease-in-out' }); }
        sfx.sparkle();
        praise();
        speak(word.text);
        const index = celebrationCount('robot');
        celebrate(b, { game: 'robot', last: ctx.last });
        await skippableWait(index > 0 ? 900 : 1200);
        resolve({ firstTryCorrect: firstTry, choices });
      } else {
        firstTry = false;
        b.classList.add('dim');
        b.setAttribute('disabled', '');
        soft();
        play(robot, 'shrug', 900); // a gentle shrug, once: never a buzzer
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
  const pack = rawPack(); // the world's own id: a world without its own vehicle gets its family's (vehicles.ts)
  const rocket = h('div', { class: 'rocket', 'data-vehicle': pack, 'data-name': vehicleName(pack) }); // the vehicle is skinned per world (vehicles.ts)
  rocket.innerHTML = vehicleSVG(pack);
  const fuel = h('div', { class: 'fuel', 'aria-hidden': 'true' }, h('div', { class: 'fuel-fill' }));
  const sky = h('div', { class: 'skypanel' },
    h('button', { class: 'tile pic target', 'data-testid': 'rhyme-target', onClick: () => { tap(); speak(target.text); }, 'aria-label': 'hear the word' }, pictureEl(target.text, target.emoji)),
    rocket, fuel);
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
      const index = celebrationCount('rhyme'); // the exit rotates through three variants by round; repeats are shorter
      const short = index > 0;
      await wait(short ? 330 : 380);
      fuel.classList.add('full');
      rocket.classList.add('charge'); // a gentle squash-and-rise, not a rattle
      praise();
      speak(`${target.text}, ${answer.text}`);
      await wait(short ? 200 : 340);
      sfx.launch();
      sky.classList.add('launching'); // the vehicle may leave the little window and cross the card
      rocket.classList.remove('charge');
      rocket.classList.add('launch');
      celebrate(rocket, { game: 'rhyme', last: ctx.last });
      const leaving = vehicleExit(rocket, pack, index, short);
      for (const at of short ? [220, 480] : [260, 560, 860]) setTimeout(() => rocket.isConnected && emit(rocket, { level: 1, variant: index }), at); // a trail
      void leaving;
      await skippableWait(exitMs(pack, short) * 0.95);
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
        stopGhost = ghostDrag(sceneEl, picsRow, rocket, { delay: 700 });
      },
    });
    return b;
  });
  const picsRow = h('div', { class: 'row tiles', 'data-testid': 'pics' }, pics);
  const sceneEl = h('div', { class: 'scene rocketscene' },
    caption(`Which one rhymes? Put it in the ${vehicleName(pack)}!`),
    sky,
    picsRow,
  );
  mount(ctx.stage, sceneEl);
  stopGhost = ghostDrag(sceneEl, picsRow, rocket);
  await wait(250);
  saySeq([{ phrase: 'which_rhymes', text: 'Which one rhymes?' }, { word: target.text }]);
  return done;
};

/**
 * Bridge Builder (blending printed words). Tap the sound buttons in order (dot = one letter, bar = digraph): each one drops ONE themed
 * plank (a log, a moon stone, a shell, a hay bale, a stone block or a road segment, by world) and the creature hops onto it. Once every
 * sound has been tapped the sounds STAY tappable (hear any of them again, in any order, as often as you like) and you can SLIDE a finger
 * across the letters to blend them: the planks light up left to right as you go and the creature hops along. Then pick the word and the
 * creature crosses with weight (every step dips a plank) and waves the flag at the far side.
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
  const far = h('span', { class: 'far', 'aria-hidden': 'true' });
  far.innerHTML = '<svg viewBox="0 0 48 64" width="48" height="64"><path d="M12 6 L12 60" stroke="#8d5a22" stroke-width="4" stroke-linecap="round"/><g class="cloth"><path d="M14 8 Q28 2 44 10 Q30 18 14 24Z" fill="#ef476f" stroke="#c7385a" stroke-width="2" stroke-linejoin="round"/></g><circle cx="12" cy="6" r="3.5" fill="#ffd166"/></svg>';
  const bridge = h('div', { class: 'bridge', 'data-testid': 'bridge' },
    hopper, h('div', { class: 'planks' }, slots), far, h('div', { class: 'river', 'aria-hidden': 'true' }));
  const allTapped = () => next >= word.graphemes.length;
  const phs = word.graphemes.map(phonemeOf);

  const caps = caption('Tap each sound button, in order.');
  const slideHint = h('div', { class: 'slide-hint', 'aria-hidden': 'true', hidden: true }, '👉');

  // ---- the creature on the bridge: it hops onto a plank (or back to the bank), measured from where it is now ----
  const visual = (): { x: number; y: number } => {
    const t = getComputedStyle(hopper).transform;
    const m = new DOMMatrixReadOnly(t === 'none' ? undefined : t);
    return { x: m.m41, y: m.m42 };
  };
  const feetOf = (): number => { const r = walker.getBoundingClientRect(); return r.top + r.height * 0.95; };
  const hopTo = (target: { x: number; y: number }, ms = 340, lift = 26): void => {
    const v = visual();
    hopper.style.transform = `translate(${target.x}px, ${target.y}px)`;
    if (reducedMotion()) return;
    hopper.animate([
      { transform: `translate(${v.x}px, ${v.y}px)` },
      { transform: `translate(${(v.x + target.x) / 2}px, ${Math.min(v.y, target.y) - lift}px)`, offset: 0.5 },
      { transform: `translate(${target.x}px, ${target.y}px)` },
    ], { duration: ms, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' });
    walker.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.07,0.9)', offset: 0.12 }, { transform: 'scale(0.95,1.08)', offset: 0.45 }, { transform: 'scale(1.06,0.92)', offset: 0.85 }, { transform: 'scale(1,1)' }], { duration: ms + 60, easing: 'ease-out' });
  };
  const standOn = (i: number): void => {
    const sl = slots[i];
    if (!sl) return;
    const v = visual(), r = sl.getBoundingClientRect(), wr = walker.getBoundingClientRect();
    const drop = new DOMMatrixReadOnly(getComputedStyle(sl).transform === 'none' ? undefined : getComputedStyle(sl).transform).m42; // the plank may still be dropping in
    hopTo({ x: v.x + (r.left + r.width / 2 - (wr.left + wr.width / 2)), y: v.y + (r.top - drop - feetOf()) + 2 });
    setTimeout(() => sl.isConnected && !reducedMotion() && sl.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(5px)' }, { transform: 'translateY(0px)' }], { duration: 240, easing: 'ease-out' }), 300);
  };

  // slide a finger across the letters left to right to blend them (a gesture, not a button)
  let visited: number[] = [];
  const lightClear = () => slots.forEach((sl) => sl.classList.remove('lit'));
  const colAt = (x: number, y: number): number => {
    const el = document.elementFromPoint(x, y)?.closest('.gcol') as HTMLElement | null;
    return el ? Number(el.dataset.i) : -1;
  };
  const wordRow = h('div', { class: 'row word', 'data-testid': 'word' });
  wordRow.style.touchAction = 'none';
  wordRow.addEventListener('pointerdown', (e) => {
    if (!allTapped()) return;
    visited = [];
    slideHint.hidden = true;
    lightClear();
    const c = colAt(e.clientX, e.clientY);
    if (c >= 0) visited.push(c);
  });
  wordRow.addEventListener('pointermove', (e) => {
    if (!allTapped() || e.buttons === 0) return;
    const c = colAt(e.clientX, e.clientY);
    if (c >= 0 && visited[visited.length - 1] !== c) {
      visited.push(c);
      blip(phs[c] as string, { maxMs: 260 });
      play(glyphs[c] as HTMLElement, 'bounce', 400);
      if (visited.every((v, k) => v === k)) { slots[c]?.classList.add('lit'); standOn(c); } // the planks light up left to right, the creature follows
      if (visited.length >= word.graphemes.length && visited.every((v, k) => v === k)) {
        visited = [];
        wordRow.classList.add('merge');
        bridge.classList.add('blended'); // the whole bridge glows: the sounds are one word
        setTimeout(() => { speak(word.text); }, 250);
        setTimeout(() => { wordRow.classList.remove('merge'); bridge.classList.remove('blended'); lightClear(); if (!bridge.classList.contains('built') && !visited.length) hopTo({ x: 0, y: 0 }, 420, 30); }, 1400);
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
            caps.textContent = 'You built the bridge! Well done!'; // clears any "Not quite" from an earlier wrong pick
            praise();
            speak(word.text);
            const index = celebrationCount('bridge');
            lightClear();
            bridge.classList.add('built');
            await cross(index > 0);
            setMood(walker, 'happy');
            sfx.sparkle();
            waveFlag();
            celebrate(far, { game: 'bridge', last: ctx.last });
            await skippableWait(index > 0 ? 130 : 600);
            resolve({ firstTryCorrect: firstTry, choices: options.length });
          } else {
            firstTry = false;
            b.classList.add('dim');
            b.setAttribute('disabled', '');
            soft();
            void reactions.wrong(walker, { toward: wordRow }); // a soft "oh" and a look at the word: the sounds are still there
            // a wrong pick is not a reset: the sounds are still there to tap and listen to again
            caps.textContent = 'Not quite. Tap the sounds, then slide!';
            buttons.forEach((x) => x.classList.remove('faded')); // support returns in full
          }
        });
        return b;
      }),
    );
    caps.textContent = 'Slide across to blend. Which word is it?';
    slideHint.hidden = false;
    // if the creature is standing on the last plank, it hops back to the bank, ready to cross
    if (!faded) setTimeout(() => { if (hopper.isConnected && !bridge.classList.contains('built') && !visited.length) hopTo({ x: 0, y: 0 }, 420, 30); }, 700);
    saySeq([{ phrase: 'slide_blend', text: 'Slide your finger across to blend.' }, { phrase: 'blend_it', text: 'Which word is it?' }]);
  };

  /** The crossing has weight: a slow walk along the planks, a squash with every step, each plank dips under the creature, a hop onto the far bank. */
  const cross = async (short: boolean): Promise<void> => {
    const fr = far.getBoundingClientRect(), wr = walker.getBoundingClientRect();
    const from = visual();
    hopper.getAnimations().forEach((x) => x.cancel());
    hopper.style.transform = `translate(${from.x}px, ${from.y}px)`;
    const endX = from.x + (fr.left - wr.left - 30);
    const first = slots[0]?.getBoundingClientRect();
    const plankY = first ? from.y + (first.top - feetOf()) + 2 : from.y;
    const n = short ? 3 : Math.max(2, slots.length + 1); // steps: after the first success of the session it is a quick hop-hop-hop
    const D = short ? 1000 : 760 + n * 160;
    const stepEvery = D / (n * 2);
    // plank dips and footsteps, timed to when the creature passes each plank
    const sx = slots.map((sl) => { const r = sl.getBoundingClientRect(); return r.left + r.width / 2 - (wr.left + wr.width / 2); });
    const ease = (f: number) => f * f * (3 - 2 * f) * 0.35 + f * 0.65; // mostly steady, a little slower at both ends
    if (reducedMotion()) { hopper.style.transform = `translate(${endX}px, 0px)`; await wait(300); return; }
    const kf: Keyframe[] = [];
    const M = n * 6;
    for (let k = 0; k <= M; k++) {
      const f = k / M;
      const x = from.x + (endX - from.x) * ease(f);
      const level = f < 0.1 ? from.y + (plankY - from.y) * (f / 0.1) : f > 0.92 ? plankY * (1 - (f - 0.92) / 0.08) : plankY;
      const bob = -Math.abs(Math.sin(f * n * Math.PI)) * (short ? 16 : 9);
      kf.push({ transform: `translate(${x.toFixed(1)}px, ${(level + bob).toFixed(1)}px)`, offset: f });
    }
    const anim = hopper.animate(kf, { duration: D, easing: 'linear', fill: 'forwards' });
    // weight: a squash on every landing, a lean from side to side in the air
    walker.animate(Array.from({ length: n * 2 + 1 }, (_, k) => ({ transform: k % 2 ? `scale(0.95,1.07) rotate(${(k >> 1) % 2 ? -4 : 4}deg)` : 'scale(1.1,0.87) rotate(0deg)', offset: k / (n * 2) })), { duration: D, easing: 'ease-in-out' });
    slots.forEach((sl, j) => {
      const f = Math.min(0.98, Math.max(0.05, ((sx[j] ?? 0) - from.x) / (endX - from.x || 1)));
      let lo = 0, hi = 1; for (let it = 0; it < 14; it++) { const mid = (lo + hi) / 2; if (ease(mid) < f) lo = mid; else hi = mid; }
      setTimeout(() => { sfx.step(); sl.animate([{ transform: 'translateY(0px) rotate(0deg)' }, { transform: `translateY(10px) rotate(${j % 2 ? -2 : 2}deg)`, offset: 0.35 }, { transform: 'translateY(-2px) rotate(0deg)', offset: 0.7 }, { transform: 'translateY(0px) rotate(0deg)' }], { duration: 340, easing: 'ease-out' }); }, lo * D);
    });
    const steps = setInterval(() => sfx.step(), stepEvery * 2);
    await anim.finished.then(() => undefined, () => undefined);
    clearInterval(steps);
    hopper.style.transform = `translate(${endX}px, 0px)`;
    anim.cancel();
    walker.animate([{ transform: 'scale(1.12,0.84)' }, { transform: 'scale(0.97,1.05)', offset: 0.5 }, { transform: 'scale(1,1)' }], { duration: 320, easing: 'ease-out' }); // the last landing, heavier
    await wait(short ? 50 : 200); // a beat before the cheer
  };
  const waveFlag = () => {
    const cloth = far.querySelector('.cloth');
    if (!cloth || reducedMotion()) return;
    cloth.animate([{ transform: 'skewY(0deg) scaleX(1)' }, { transform: 'skewY(-9deg) scaleX(0.86)', offset: 0.25 }, { transform: 'skewY(7deg) scaleX(1.05)', offset: 0.5 }, { transform: 'skewY(-6deg) scaleX(0.9)', offset: 0.75 }, { transform: 'skewY(0deg) scaleX(1)' }], { duration: 1300, easing: 'ease-in-out' });
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
      slots[i]?.classList.add('filled'); // one themed plank drops for this sound...
      standOn(i); // ...and the creature hops onto it
      setTimeout(() => sfx.thud(), 120);
      next++;
      if (allTapped()) setTimeout(showChoices, 900);
    });
    return b;
  });
  const glyphs = word.graphemes.map((g) => h('span', { class: 'glyph' }, g));
  word.graphemes.forEach((_, i) => wordRow.append(h('div', { class: 'gcol', 'data-i': i }, glyphs[i], buttons[i])));
  wordRow.append(slideHint); // drawn over the letters (absolute), so it costs no height
  mount(ctx.stage, h('div', { class: 'scene bridgescene' }, caps, wordRow, bridge, choicesBox));
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
      const r = b.getBoundingClientRect();
      lookAt(dino, r.left + r.width / 2, r.top + r.height / 2); // the creature glances at what was chosen, then a soft nod (calm: no hop, no burst)
      reactions.nod(dino);
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
