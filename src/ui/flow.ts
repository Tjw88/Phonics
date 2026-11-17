// FLOW AND SCENES (animation cycle): the screens around the games, built as small timelines.
//   hatchScene   the arrival: the egg / crate / capsule wobbles, cracks or pops open, the friend springs out, waves and looks at the button
//   finaleScene  the end of the day in ONE continuous celebration: the decoded picture comes alive, then the chest the child taps to open
//   sleepScene   goodnight: the friend yawns and falls asleep, breathing, drifting Zs
//   homeIdle     the home screen's idle life: a slow look at the Play button now and then (breathing and blinking are CSS)
//   doorGrid     the Free Play menu as themed "doors"
// Rules kept everywhere: motion is transform/opacity only; every timer and animation is registered with the scene (fx.ts) and cleaned up
// when the next scene mounts; nothing is random (fixed timings, fixed order); Reduce Motion jumps to the resting state and keeps the sound.
import { chestSVG, drumSVG, potSVG, robotSVG, rocketSVG } from './art';
import { blip, praise, sayPhrase, sfx, speak, tap } from './audio';
import { bigButton, h, reducedMotion } from './dom';
import { friendEl } from './friends';
import { lookAt, setMood } from './games';
import { PICTURES } from './pictures';
import { GAME_LABEL, type GameKind } from './rounds';
import { arrivalSVG, companionSVG } from './themes';
import { anim, burst, every, later, mount } from './fx';

const BOTTOM = '50% 100%';
const pt = (el: Element): { x: number; y: number } => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};
const petOf = (box: Element): HTMLElement => (box.classList.contains('companion') ? box : box.querySelector('.companion')) as HTMLElement;

// ================================================================================================================ hatch / arrival
type OpenStyle = 'egg' | 'lid' | 'capsule';
/** Where each pack's arrival splits (fraction of its height from the top), the style of the split, and how it behaves. */
const ARRIVAL: Record<string, { cut: number; zig: boolean; style: OpenStyle }> = {
  dino: { cut: 0.46, zig: true, style: 'egg' },
  dragon: { cut: 0.46, zig: true, style: 'egg' },
  transport: { cut: 0.45, zig: false, style: 'lid' },
  space: { cut: 0.37, zig: false, style: 'capsule' },
  ocean: { cut: 0.4, zig: true, style: 'egg' },
  farm: { cut: 0.42, zig: true, style: 'egg' },
};
const teeth = (cut: number, zig: boolean): [number, number][] =>
  Array.from({ length: 9 }, (_, i) => [i * 12.5, cut * 100 + (zig ? (i % 2 ? -5 : 5) : 0)] as [number, number]);
const clipTop = (cut: number, zig: boolean): string =>
  `polygon(-12% -12%, 112% -12%, 112% ${cut * 100}%, ${teeth(cut, zig).reverse().map(([x, y]) => `${x}% ${y}%`).join(', ')}, -12% ${cut * 100}%)`;
const clipBottom = (cut: number, zig: boolean): string =>
  `polygon(-12% ${cut * 100}%, ${teeth(cut, zig).map(([x, y]) => `${x}% ${y}%`).join(', ')}, 112% ${cut * 100}%, 112% 112%, -12% 112%)`;

export interface HatchOpts { packId: string; kind: string; name: string; nick: string; pet: HTMLElement; arrived: string }
/**
 * The arrival, about 2.4 s: wobble that grows (anticipation), a crack (or a seam of light), the top flies off, the friend springs out with
 * overshoot, waves, then looks at the Next button. The button appears as soon as the friend is out (about 1.4 s) so nobody waits for the wave.
 * Resolves when the button is pressed.
 */
export const hatchScene = async (stage: HTMLElement, o: HatchOpts): Promise<void> => {
  const spec = ARRIVAL[o.packId] ?? (ARRIVAL.dino as (typeof ARRIVAL)[string]);
  const svg = arrivalSVG(o.kind);
  const layer = (cls: string, clip: string): HTMLElement => { const d = h('div', { class: `hs-layer ${cls}` }); d.innerHTML = svg; d.style.clipPath = clip; return d; };
  const bot = layer('hs-bot', clipBottom(spec.cut, spec.zig));
  const top = layer('hs-top', clipTop(spec.cut, spec.zig));
  // a crack that draws itself from the middle outwards (egg-like arrivals) or a seam of light (lid, capsule)
  const cy = spec.cut * 150;
  const zz = (dir: 1 | -1): string => teeth(spec.cut, spec.zig).filter(([x]) => (dir === 1 ? x >= 50 : x <= 50)).map(([x, y]) => `${(60 + (x - 50) * 0.62).toFixed(1)},${(y * 1.5).toFixed(1)}`).join(' ');
  const crack = h('div', { class: 'hs-layer hs-crack' });
  crack.innerHTML = spec.zig
    ? `<svg viewBox="0 0 120 150" aria-hidden="true"><g class="ck ck-r"><polyline points="${zz(1)}"/></g><g class="ck ck-l"><polyline points="${zz(-1)}"/></g></svg>`
    : `<svg viewBox="0 0 120 150" aria-hidden="true"><rect class="seam" x="10" y="${cy - 3}" width="100" height="6" rx="3"/></svg>`;
  const arr = h('div', { class: `hs-arr hs-${spec.style}` }, bot, crack, top);
  const glow = h('div', { class: 'hs-glow' });
  const petBox = h('div', { class: 'hs-pet' }, o.pet);
  setMood(o.pet, 'idle');
  const wob = h('div', { class: 'hs-wob' }, glow, petBox, arr);
  const caption = h('p', { class: 'caption', 'data-testid': 'hatch-caption' }, `Something is ${o.arrived === 'hatched' ? 'hatching' : 'arriving'}…`);
  const next = bigButton('▶', 'next', 'go');
  next.el.setAttribute('aria-label', 'Next');
  next.el.style.visibility = 'hidden'; // keeps its room, so the card does not jump when it appears
  mount(stage, h('div', { class: 'scene hatch-scene' }, h('div', { class: 'hatch-stage', 'data-testid': 'hatch-stage' }, wob), caption, h('div', { class: 'row' }, next.el)));

  const finished = (): void => {
    caption.textContent = `${o.name} ${o.arrived}! Hello, ${o.nick}!`;
    next.el.style.visibility = 'visible';
    anim(next.el, [{ opacity: 0, transform: 'translateY(12px) scale(0.9)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(0.2, 1.5, 0.4, 1)', fill: 'backwards' });
  };
  const lookAtButton = (): void => {
    const pet = petOf(o.pet);
    pet.classList.add('looking');
    setMood(o.pet, 'idle');
    const b = pt(next.el);
    lookAt(pet, b.x, b.y);
    anim(next.el, [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: 700, easing: 'ease-in-out' });
  };

  if (reducedMotion()) {
    // no movement: the arrival is simply replaced by the friend, with the same sound and caption
    later(() => {
      arr.style.display = 'none'; glow.style.display = 'none';
      petBox.style.opacity = '1'; setMood(o.pet, 'happy');
      sfx.pop(); praise(); finished();
    }, 500);
    await next.pressed;
    return;
  }

  // 0-1000 ms: anticipation. The whole arrival rocks, a little harder each time, and squashes down between rocks.
  sfx.boing();
  anim(wob, [
    { transform: 'rotate(0) scale(1, 1)' }, { transform: 'rotate(-4deg) scale(1.01, 0.99)', offset: 0.12 }, { transform: 'rotate(4deg) scale(0.99, 1.01)', offset: 0.26 },
    { transform: 'rotate(-7deg) scale(1.02, 0.97)', offset: 0.42 }, { transform: 'rotate(8deg) scale(0.98, 1.02)', offset: 0.58 },
    { transform: 'rotate(-11deg) scale(1.03, 0.95)', offset: 0.74 }, { transform: 'rotate(11deg) scale(1, 1)', offset: 0.88 }, { transform: 'rotate(0) scale(1.04, 0.92)' },
  ], { duration: 1000, easing: 'ease-in-out', origin: '50% 88%' });
  if (spec.zig) {
    later(() => { sfx.tick(); anim(arr.querySelector('.ck-r') as Element, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 220, easing: 'ease-out', fill: 'forwards' }); }, 380);
    later(() => { sfx.tick(); anim(arr.querySelector('.ck-l') as Element, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 220, easing: 'ease-out', fill: 'forwards' }); }, 640);
  } else {
    later(() => { sfx.tick(); anim(arr.querySelector('.seam') as Element, [{ opacity: 0 }, { opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }], { duration: 520, fill: 'forwards' }); }, 420);
    later(() => anim(top, [{ transform: 'translateY(0)' }, { transform: 'translateY(-5px) rotate(-1.5deg)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-8px) rotate(1.5deg)' }, { transform: 'translateY(0)' }], { duration: 520 }), 460);
  }

  // 1000 ms: it opens. The top flies away, the friend springs out (overshoot), light blooms behind it.
  later(() => {
    sfx.pop();
    later(() => sfx.sparkle(), 160);
    burst(arr, 'confetti', 20);
    const fly = spec.style === 'lid'
      ? [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(34%, -120%) rotate(26deg)', opacity: 1, offset: 0.6 }, { transform: 'translate(60%, -90%) rotate(58deg)', opacity: 0 }]
      : spec.style === 'capsule'
        ? [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(40%, -62%) rotate(30deg)', opacity: 1, offset: 0.6 }, { transform: 'translate(78%, -20%) rotate(64deg)', opacity: 0 }]
        : [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(-30%, -90%) rotate(-32deg)', opacity: 1, offset: 0.55 }, { transform: 'translate(-60%, -62%) rotate(-70deg)', opacity: 0 }];
    anim(top, fly, { duration: 620, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)', fill: 'forwards' });
    anim(crack, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
    anim(bot, [{ transform: 'scale(1, 1)' }, { transform: 'scale(1.06, 0.9)', offset: 0.25 }, { transform: 'scale(0.97, 1.05)', offset: 0.5 }, { transform: 'scale(1, 1)' }], { duration: 520, easing: 'ease-out' });
    anim(glow, [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1.1)', offset: 0.35 }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 1100, easing: 'ease-out', fill: 'forwards' });
    petBox.style.opacity = '1';
    setMood(o.pet, 'happy');
    anim(petBox, [
      { transform: 'translateY(26%) scale(0.4, 0.4)', opacity: 0 },
      { transform: 'translateY(8%) scale(0.62, 0.62)', opacity: 1, offset: 0.14 },
      { transform: 'translateY(-14%) scale(1.1, 1.2)', opacity: 1, offset: 0.52 },
      { transform: 'translateY(3%) scale(1.1, 0.9)', opacity: 1, offset: 0.74 },
      { transform: 'translateY(-2%) scale(0.98, 1.03)', opacity: 1, offset: 0.88 },
      { transform: 'none', opacity: 1 },
    ], { duration: 720, easing: 'ease-out' });
    caption.textContent = `${o.name} ${o.arrived}!`;
  }, 1000);

  // 1500 ms: the empty bottom half melts away and the friend says hello with a wave
  later(() => { bot.style.zIndex = '0'; anim(bot, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'translateY(8px) scale(0.86)' }], { duration: 420, easing: 'ease-in', fill: 'forwards' }); }, 1500);
  later(() => { praise(); finished(); }, 1450);
  later(() => anim(petBox, [
    { transform: 'rotate(0) translateY(0)' }, { transform: 'rotate(-9deg) translateY(-12px)', offset: 0.2 }, { transform: 'rotate(8deg) translateY(0)', offset: 0.4 },
    { transform: 'rotate(-7deg) translateY(-8px)', offset: 0.6 }, { transform: 'rotate(5deg) translateY(0)', offset: 0.8 }, { transform: 'rotate(0) translateY(0)' },
  ], { duration: 1000, easing: 'ease-in-out' }), 1500);
  later(lookAtButton, 2700);
  await next.pressed;
};

// ================================================================================================================ end of day
export interface FinaleOpts {
  pet: HTMLElement;
  word: { text: string; pic: HTMLElement } | null;
  friendId: string | null;
  friendName: string;
  phoneme: string | null;
  /** the "Goodnight" button (testid goodnight): kept hidden until the treasure is open */
  goodnight: HTMLElement;
  /** "Show a grown-up" (beside Goodnight) and the mission card for the grown-up (always in plain sight) */
  show: HTMLElement;
  card: HTMLElement;
}
const AUTO_OPEN_MS = 6000; // nothing to miss: if nobody taps, the chest opens itself

/**
 * ONE celebration (about 2 s of the picture coming alive, then the chest, then about 2.4 s after the tap for the opening):
 *  1. the decoded picture pops out with rays, the word is spoken, the friend cheers
 *  2. the picture settles to the side and the chest rises; the friend looks at it; it gives a slow, calm invitation wobble
 *  3. the CHILD TAPS the chest (or it opens itself after 6 s): squash, lid, light, the sound-friend rises, says its sound, hops
 *  4. the Goodnight button appears
 * No countdown is ever shown.
 */
export const finaleScene = (stage: HTMLElement, o: FinaleOpts): void => {
  const pet = petOf(o.pet);
  const chest = h('div', { class: 'chest' });
  chest.innerHTML = chestSVG();
  const glow = h('span', { class: 'fin-glow' });
  const chestBtn = h('button', { class: 'fin-chest', 'data-testid': 'treasure', 'aria-label': 'Open the treasure', hidden: true }, glow, chest);
  const prize = h('div', { class: 'fin-prize' }, o.friendId ? friendEl(o.friendId) : h('span', { class: 'fin-star' }, '⭐'));
  const name = h('p', { class: 'treasure-name' }, '');
  const petBox = h('div', { class: 'fin-pet' }, o.pet);
  const caption = h('p', { class: 'caption', 'data-testid': 'finale-caption' }, o.word ? `${o.word.text}!` : 'You found a treasure!');
  let word: HTMLElement | null = null, rays: HTMLElement | null = null;
  const kids: Node[] = [];
  if (o.word) {
    rays = h('span', { class: 'alive-rays' });
    word = h('div', { class: 'alive-word fin-word', 'data-testid': 'alive' }, rays, h('span', { class: 'alive-pic' }, o.word.pic));
    kids.push(word);
  }
  const finStage = h('div', { class: 'fin-stage' }, ...kids, petBox, prize, chestBtn);
  o.goodnight.hidden = true;
  mount(stage, h('div', { class: 'scene finale' }, caption, finStage, name, h('div', { class: 'row' }, o.show, o.goodnight), o.card));

  const hop = (el: Element, n = 2, h0 = 22, ms = 420): Animation =>
    anim(el, Array.from({ length: n * 2 + 1 }, (_, i) => i % 2 === 0
      ? { transform: 'translateY(0) scale(1.06, 0.92)', easing: 'ease-out' }
      : { transform: `translateY(${-h0}px) scale(0.96, 1.07)`, easing: 'ease-in' }), { duration: ms * n, origin: BOTTOM });
  const reveal = (): void => {
    anim(o.goodnight, [{ opacity: 0, transform: 'translateY(14px) scale(0.9)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'cubic-bezier(0.2, 1.5, 0.4, 1)', fill: 'backwards' });
    o.goodnight.hidden = false;
  };

  let opened = false;
  let invite: Animation | null = null;
  const open = (): void => {
    if (opened) return;
    opened = true;
    invite?.cancel();
    chestBtn.setAttribute('data-testid', 'treasure-open');
    chestBtn.setAttribute('aria-label', 'The treasure is open');
    const dy = chestBtn.offsetHeight * 0.34;
    // squash, then the lid
    anim(chestBtn, [{ transform: 'none' }, { transform: 'scale(1.07, 0.88)', offset: 0.4 }, { transform: 'scale(0.97, 1.05)', offset: 0.75 }, { transform: 'none' }], { duration: 380, easing: 'ease-out', origin: BOTTOM });
    later(() => {
      chest.classList.add('open');
      sfx.chest();
      anim(glow, [{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'scale(1)', offset: 0.5 }, { opacity: 0.55, transform: 'scale(1.1)' }], { duration: 900, easing: 'ease-out', fill: 'forwards' });
      setMood(o.pet, 'happy');
      hop(petBox, 2, 20, 360);
      if (o.friendId) lookAt(pet, pt(prize).x, pt(prize).y);
    }, 150);
    // the sound-friend rises out of the chest...
    later(() => {
      prize.style.opacity = '1';
      anim(prize, [
        { transform: `translateY(${dy}px) scale(0.3, 0.3)`, opacity: 0 }, { transform: `translateY(${dy * 0.5}px) scale(0.7, 0.8)`, opacity: 1, offset: 0.18 },
        { transform: 'translateY(-26px) scale(0.94, 1.14)', opacity: 1, offset: 0.58 }, { transform: 'translateY(4px) scale(1.1, 0.9)', opacity: 1, offset: 0.8 }, { transform: 'none', opacity: 1 },
      ], { duration: 760, easing: 'ease-out', origin: BOTTOM });
      burst(prize, 'stars', 18);
      later(() => praise(), 140);
    }, 520);
    // ...says its sound (a squash-and-stretch "talk" on each sound)...
    later(() => {
      name.textContent = o.friendName;
      anim(name, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, fill: 'backwards' });
      if (o.phoneme) {
        const ms = Math.min(900, Math.max(350, blip(o.phoneme)));
        anim(prize, [{ transform: 'none' }, { transform: 'scale(1.12, 0.9)', offset: 0.18 }, { transform: 'scale(0.94, 1.1)', offset: 0.4 }, { transform: 'scale(1.06, 0.95)', offset: 0.7 }, { transform: 'none' }], { duration: ms, easing: 'ease-in-out', origin: BOTTOM });
      }
    }, 1400);
    // ...and hops for joy; then the day can end.
    later(() => hop(prize, 2, 22, 380), 2200);
    later(reveal, 2700);
  };
  chestBtn.addEventListener('click', open);

  // phase 1 (only when a word was decoded today): the picture comes alive
  let t = 0;
  if (word && rays) {
    const w = word;
    t = 2100;
    sfx.pop();
    anim(w, [{ transform: 'scale(0.2) rotate(-12deg)', opacity: 0 }, { transform: 'scale(1.3) rotate(4deg)', opacity: 1, offset: 0.5 }, { transform: 'scale(0.94) rotate(-2deg)', offset: 0.75 }, { transform: 'scale(1) rotate(0)' }], { duration: 760, easing: 'ease-out', fill: 'backwards' });
    anim(rays, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: 'backwards' });
    later(() => { burst(w, 'confetti', 22); sfx.sparkle(); speak(o.word!.text); setMood(o.pet, 'happy'); hop(petBox, 2, 24, 380); }, 330);
    later(() => anim(w.querySelector('.alive-pic') as Element, [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: 1500, easing: 'ease-in-out' }), 1000);
    // the picture settles into the corner and stays as a small keepsake of the word the child just read
    later(() => {
      const s = finStage.getBoundingClientRect(), r = w.getBoundingClientRect();
      const tx = s.left + s.width * 0.82 - (r.left + r.width / 2), ty = s.top + s.height * 0.2 - (r.top + r.height / 2);
      anim(w, [{ transform: 'none' }, { transform: `translate(${tx * 0.6}px, ${ty * 0.6 - 18}px) scale(0.7)`, offset: 0.55 }, { transform: `translate(${tx}px, ${ty}px) scale(0.44)` }], { duration: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
      anim(rays, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' });
      caption.textContent = 'You found a treasure!';
    }, t - 250);
  }
  // phase 2: the chest rises, the friend looks at it, a slow invitation to tap
  later(() => {
    chestBtn.hidden = false;
    sayPhrase('treasure', 'You found a treasure!');
    anim(chestBtn, [{ transform: 'translateY(70px) scale(0.7, 0.7)', opacity: 0 }, { transform: 'translateY(-14px) scale(1.06, 1.08)', opacity: 1, offset: 0.62 }, { transform: 'translateY(0) scale(1, 0.96)', offset: 0.82 }, { transform: 'none', opacity: 1 }], { duration: 640, easing: 'ease-out', fill: 'backwards' });
    sfx.pop();
    const c = pt(chestBtn);
    later(() => { pet.classList.add('looking'); lookAt(pet, c.x, c.y); }, 300);
    // a calm "tap me": two soft wiggles, a pause, again (stops the moment it is opened)
    const wiggle = (): void => {
      if (opened) return;
      invite = anim(chestBtn, [{ transform: 'none' }, { transform: 'rotate(-3.5deg) scale(1.03)', offset: 0.25 }, { transform: 'rotate(3deg) scale(1.03)', offset: 0.5 }, { transform: 'rotate(-1.5deg) scale(1.01)', offset: 0.75 }, { transform: 'none' }], { duration: 900, easing: 'ease-in-out', origin: BOTTOM });
    };
    later(wiggle, 1100);
    every(wiggle, 2600);
    later(open, AUTO_OPEN_MS);
  }, t);
};

// ================================================================================================================ goodnight
export interface SleepOpts { pet: HTMLElement; caption: string; label: string; testid: string; icon: string }
/** The friend yawns and falls asleep (about 1.3 s), then breathes slowly under drifting Zs. The exit button is large (at least 96 px). */
export const sleepScene = async (stage: HTMLElement, o: SleepOpts): Promise<void> => {
  const exit = bigButton(o.icon, o.testid, 'go exit');
  exit.el.setAttribute('aria-label', o.label);
  const zs = zsEl();
  const box = h('div', { class: 'sleep-pet sleepy-fx' }, o.pet, zs);
  mount(stage, h('div', { class: 'scene sleepscene' }, box, h('p', { class: 'caption' }, o.caption), h('div', { class: 'row' }, exit.el)));
  if (!reducedMotion()) {
    setMood(o.pet, 'open'); // a yawn
    anim(box, [{ transform: 'scale(1, 1)' }, { transform: 'scale(0.98, 1.05)', offset: 0.3 }, { transform: 'scale(1.03, 0.94)', offset: 0.7 }, { transform: 'scale(1.01, 0.97) translateY(4px)' }], { duration: 1100, easing: 'ease-in-out', fill: 'forwards', origin: BOTTOM });
    later(() => setMood(o.pet, 'sleepy'), 1100);
  } else setMood(o.pet, 'sleepy');
  await exit.pressed;
  tap();
};

// ================================================================================================================ home idle
/** Three Zs that drift up and fade, one after the other (CSS, slow). Used under a sleeping friend. */
export const zsEl = (): HTMLElement => h('span', { class: 'zs', 'aria-hidden': 'true' }, h('i', {}, 'Z'), h('i', {}, 'z'), h('i', {}, 'Z'));
/**
 * The home screen's idle life. Breathing and blinking are CSS (anim-flow.css); here, every 7 s, the friend glances at the Play button and
 * nods twice, as if to say "shall we?". Fixed timing, no randomness, stops when the scene is left. An asleep friend does not look.
 */
export const homeIdle = (pet: HTMLElement, play: HTMLElement, asleep: boolean): void => {
  if (asleep) return;
  const c = petOf(pet);
  const glance = (): void => {
    if (!pet.isConnected || c.classList.contains('looking')) return;
    const b = pt(play);
    c.classList.add('looking');
    lookAt(c, b.x, b.y);
    if (!reducedMotion()) anim(c, [{ transform: 'translateY(0)' }, { transform: 'translateY(5px) scale(1.01, 0.98)', offset: 0.25 }, { transform: 'translateY(0)', offset: 0.5 }, { transform: 'translateY(5px) scale(1.01, 0.98)', offset: 0.75 }, { transform: 'translateY(0)' }], { duration: 760, easing: 'ease-in-out', delay: 250, origin: BOTTOM });
    later(() => { lookAt(c, null, null); c.classList.remove('looking'); }, 1700);
  };
  later(glance, 3500);
  every(glance, 7500);
};

// ================================================================================================================ Free Play doors
const art = (inner: string, vb = '0 0 120 100'): string => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${inner}</svg>`;
const peek = (word: string, tf: string): string => `<g transform="${tf}">${PICTURES[word] ?? ''}</g>`;
/** the door illustrations: existing art where it exists (the child's own friend, robot, drum, pot, rocket), small drawings where it does not */
const DOOR_ART: Record<GameKind, (kind: string) => string> = {
  feed: (kind) => `<span class="da-feed">${companionSVG(kind, 0).replace('mood-idle', 'mood-open')}<span class="da-letter">a</span></span>`,
  robot: () => robotSVG(),
  drum: () => drumSVG(),
  rhyme: () => `<span class="da-rocket">${rocketSVG()}</span>`,
  safari: () => art(`<ellipse cx="60" cy="90" rx="46" ry="6" fill="#0000001c"/>${peek('lion', 'translate(14 -6) scale(0.92)')}
    <path d="M6 96 C4 70 22 58 38 74 C34 82 28 92 6 96Z" fill="#3f9e5a"/><path d="M114 96 C116 68 98 56 82 74 C86 82 92 92 114 96Z" fill="#3f9e5a"/>
    <path d="M18 96 C16 76 30 68 44 82 C40 90 34 96 18 96Z" fill="#6fd37e"/><path d="M102 96 C104 74 90 66 76 82 C80 90 86 96 102 96Z" fill="#6fd37e"/>`),
  kitchen: () => potSVG(),
  bridge: () => art(`<rect x="0" y="74" width="120" height="26" rx="8" fill="#4cc3d9"/><path d="M0 80 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>
    <path d="M0 74 L0 46 Q14 40 24 50 L30 74Z" fill="#6fd37e"/><path d="M120 74 L120 46 Q106 40 96 50 L90 74Z" fill="#6fd37e"/>
    <g fill="#d4a366" stroke="#7d5a2a" stroke-width="3" stroke-linejoin="round"><rect x="22" y="52" width="18" height="9" rx="3" transform="rotate(-8 31 56)"/><rect x="40" y="46" width="18" height="9" rx="3" transform="rotate(-3 49 50)"/><rect x="60" y="45" width="18" height="9" rx="3" transform="rotate(3 69 49)"/><rect x="80" y="50" width="18" height="9" rx="3" transform="rotate(8 89 54)"/></g>
    <path d="M100 48 L100 22" stroke="#7d5a2a" stroke-width="3" stroke-linecap="round"/><path d="M100 22 L116 28 L100 35Z" fill="#ef476f"/>`),
  trace: () => art(`<rect x="8" y="8" width="104" height="84" rx="14" fill="#fff8e6" stroke="#e0b84a" stroke-width="4"/>
    <path d="M78 28 C62 20 40 28 44 42 C48 56 80 52 78 68 C76 82 46 84 36 72" fill="none" stroke="#ffb703" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 13"/>
    <circle cx="78" cy="28" r="6" fill="#2fbf71" stroke="#fff" stroke-width="2"/>
    <g transform="translate(70 56) rotate(35)"><rect x="0" y="0" width="12" height="38" rx="3" fill="#ef476f"/><path d="M0 38 L6 52 L12 38Z" fill="#f7c59f"/><path d="M3.5 46 L6 52 L8.5 46Z" fill="#26303f"/><rect x="0" y="0" width="12" height="7" rx="3" fill="#ffc933"/></g>`),
};
const DOOR_TINT: Record<GameKind, string> = {
  feed: '#ffd9e3', robot: '#d6e6ff', drum: '#ffe3c4', safari: '#d9f5c8', kitchen: '#fff0b8', bridge: '#d3f1fb', rhyme: '#e4dcff', trace: '#ffdcd0',
};
const DOOR_EDGE: Record<GameKind, string> = {
  feed: '#ff8fab', robot: '#6aa5ff', drum: '#ff9f43', safari: '#6fd37e', kitchen: '#ffc933', bridge: '#4cc3d9', rhyme: '#9b8bf0', trace: '#ff7e5f',
};

/** The Free Play menu: one themed "door" per game (an arch with a small picture and the name). Keeps data-testid gamegrid and fp-<game>. */
export const doorGrid = (games: GameKind[], kind: string, pick: (k: GameKind) => void): HTMLElement =>
  h('div', { class: 'gamegrid doors', 'data-testid': 'gamegrid' }, games.map((k, i) => {
    const b = h('button', {
      class: `gamebtn door door-${k}`, 'data-testid': `fp-${k}`, 'aria-label': GAME_LABEL[k].name, style: `--tint:${DOOR_TINT[k]};--edge:${DOOR_EDGE[k]};--i:${i}`,
      onClick: () => pick(k),
    });
    const a = h('span', { class: 'door-art' });
    a.innerHTML = DOOR_ART[k](kind);
    b.append(a, h('span', { class: 'gname' }, GAME_LABEL[k].name));
    return b;
  }));
