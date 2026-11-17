// FLOW AND SCENES (animation cycle): the screens around the games, built as small timelines.
//   hatchScene   the arrival: the egg / crate / capsule wobbles, cracks or pops open, the friend springs out, waves and looks at the button
//   finaleScene  the end of the day in ONE continuous celebration: the decoded picture comes alive, then the chest the child taps to open
//   sleepScene   goodnight: the friend yawns and falls asleep, breathing, drifting Zs
//   homeIdle     the home screen's idle life: a slow look at the Play button now and then (breathing and blinking are CSS)
//   doorGrid     the Free Play menu as themed "doors"
// Rules kept everywhere: motion is transform/opacity only; every timer and animation is registered with the scene (fx.ts) and cleaned up
// when the next scene mounts; nothing is random (fixed timings, fixed order); Reduce Motion jumps to the resting state and keeps the sound.
import { chestSVG, robotSVG } from './art';
import { drumArt, potArt, type World } from './games2-art';
import { vehicleSVG } from './vehicles';
import { blip, praise, sayPhrase, sfx, speak, tap } from './audio';
import { bigButton, h, reducedMotion } from './dom';
import { friendEl } from './friends';
import { lookAt, setMood } from './games';
import { PICTURES } from './pictures';
import { GAME_LABEL, type GameKind } from './rounds';
import { arrivalSVG, companionSVG } from './themes';
import { emitKind, puffAt, type PackId } from './particles';
import { anim, burst, every, later, mount, onLeave } from './fx';

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

export interface HatchOpts { packId: string; kind: string; name: string; nick: string; pet: HTMLElement; arrived: string; /** the pack's word for its arrival ('egg', 'crate', 'treasure chest'...): picks how it opens when the pack has no entry above */ arrival?: string }
type ArrivalSpec = { cut: number; zig: boolean; style: OpenStyle };
/** How an arrival opens: the table above for the six first packs, else by what the pack calls it (a box, chest or case lifts its lid; a capsule opens; anything else cracks like an egg). */
const arrivalSpec = (packId: string, word = ''): ArrivalSpec =>
  ARRIVAL[packId] ?? (/crate|box|chest|case/i.test(word) ? { cut: 0.42, zig: false, style: 'lid' } : /capsule/i.test(word) ? { cut: 0.37, zig: false, style: 'capsule' } : { cut: 0.44, zig: true, style: 'egg' });
/**
 * The arrival, about 2.4 s: wobble that grows (anticipation), a crack (or a seam of light), the top flies off, the friend springs out with
 * overshoot, waves, then looks at the Next button. The button appears as soon as the friend is out (about 1.4 s) so nobody waits for the wave.
 * Resolves when the button is pressed.
 */
export const hatchScene = async (stage: HTMLElement, o: HatchOpts): Promise<void> => {
  const spec = arrivalSpec(o.packId, o.arrival);
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
    anim(next.el, [{ transform: 'scale(1)' }, { transform: 'scale(1.09)' }, { transform: 'scale(1)' }, { transform: 'scale(1.09)' }, { transform: 'scale(1)' }], { duration: 1100, easing: 'ease-in-out' });
    // a nod toward it
    anim(petBox, [{ transform: 'translateY(0)' }, { transform: 'translateY(8px) scale(1.03, 0.95)', offset: 0.3 }, { transform: 'translateY(0)', offset: 0.55 }, { transform: 'translateY(8px) scale(1.03, 0.95)', offset: 0.8 }, { transform: 'translateY(0)' }], { duration: 900, easing: 'ease-in-out', origin: BOTTOM });
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
  // a real wave: two big swings side to side with a hop each time (the friends have no arms, so the whole body waves hello)
  later(() => anim(petBox, [
    { transform: 'rotate(0) translateY(0)' }, { transform: 'rotate(-14deg) translateY(-18px) scale(0.97, 1.05)', offset: 0.16 }, { transform: 'rotate(0) translateY(0) scale(1.05, 0.94)', offset: 0.3 },
    { transform: 'rotate(14deg) translateY(-18px) scale(0.97, 1.05)', offset: 0.46 }, { transform: 'rotate(0) translateY(0) scale(1.05, 0.94)', offset: 0.6 },
    { transform: 'rotate(-10deg) translateY(-10px)', offset: 0.76 }, { transform: 'rotate(6deg) translateY(0)', offset: 0.9 }, { transform: 'rotate(0) translateY(0)' },
  ], { duration: 1300, easing: 'ease-in-out' }), 1750);
  later(lookAtButton, 3200);
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
  /** "Show a grown-up" and the mission card for the grown-up: kept in a quiet zone at the bottom, out of the child's focus */
  show: HTMLElement;
  card: HTMLElement;
}
const CUE_MS = 4000; // with no tap for this long the chest cue gets louder
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
  const ring = h('span', { class: 'fin-ring', hidden: true });
  const hand = h('span', { class: 'fin-hand', 'aria-hidden': 'true', hidden: true }, '👆');
  const chestBtn = h('button', { class: 'fin-chest', 'data-testid': 'treasure', 'aria-label': 'Open the treasure', hidden: true }, glow, ring, chest, hand);
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
  o.goodnight.style.visibility = 'hidden'; // keeps its room (no jump when it arrives); not visible to a finger, a screen reader or a test until the friend has risen
  o.goodnight.setAttribute('aria-hidden', 'true');
  mount(stage, h('div', { class: 'scene finale' }, caption, finStage, name, h('div', { class: 'row goodnight-row' }, o.goodnight), h('div', { class: 'grownup-zone' }, o.card, o.show)));

  const hop = (el: Element, n = 2, h0 = 22, ms = 420): Animation =>
    anim(el, Array.from({ length: n * 2 + 1 }, (_, i) => i % 2 === 0
      ? { transform: 'translateY(0) scale(1.06, 0.92)', easing: 'ease-out' }
      : { transform: `translateY(${-h0}px) scale(0.96, 1.07)`, easing: 'ease-in' }), { duration: ms * n, origin: BOTTOM });
  const reveal = (): void => {
    anim(o.goodnight, [{ opacity: 0, transform: 'translateY(14px) scale(0.9)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'cubic-bezier(0.2, 1.5, 0.4, 1)', fill: 'backwards' });
    o.goodnight.style.visibility = 'visible';
    o.goodnight.removeAttribute('aria-hidden');
  };

  let opened = false;
  let invite: Animation | null = null;
  const open = (): void => {
    if (opened) return;
    opened = true;
    invite?.cancel();
    ring.hidden = true; hand.hidden = true;
    caption.textContent = 'You found a treasure!';
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
    later(reveal, 1350); // Goodnight is there as soon as the friend has risen: nobody waits for the hops
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
      invite = anim(chestBtn, [{ transform: 'none' }, { transform: 'rotate(-5deg) scale(1.05)', offset: 0.25 }, { transform: 'rotate(4.5deg) scale(1.05)', offset: 0.5 }, { transform: 'rotate(-2deg) scale(1.02)', offset: 0.75 }, { transform: 'none' }], { duration: 900, easing: 'ease-in-out', origin: BOTTOM });
    };
    later(wiggle, 900);
    every(wiggle, 2000);
    // after about 4 s without a tap the cue gets louder: a soft pulsing ring, a small bouncing hand and a caption (for the grown-up, and said aloud).
    // Nothing counts down on screen; the chest opens by itself a little later so nobody is stuck.
    later(() => {
      if (opened) return;
      ring.hidden = false; hand.hidden = false;
      caption.textContent = 'Tap the chest!';
      anim(caption, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
      sayPhrase('tap_chest', 'Tap the chest!');
    }, CUE_MS);
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
 * The home screen's idle life (breathing and blinking are CSS in anim-flow.css; this is the rest). Two fixed loops, nothing random:
 *  - every 6 s the friend looks at the Play button, nods twice and the button gives one soft pulse ("shall we?");
 *  - every 8, 10, 12, 8, 10, 12... s the friend does something of its WORLD, alternating with a calm sway:
 *    dino stomps a dust puff, dragon puffs a spark, transport honks a steam puff, space beams up a twinkle, ocean blows a bubble,
 *    farm chews. Particles come from particles.ts. Both stop when the scene is left; an asleep friend only breathes.
 */
const wobble = (el: Element, frames: Keyframe[], ms: number): Animation => anim(el, frames, { duration: ms, easing: 'ease-in-out', origin: BOTTOM });
const topOf = (el: Element): { x: number; y: number } => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.16 }; };
type At = (fn: () => void, ms: number) => void;
type Flavour = (c: HTMLElement, at: At) => number; // does the action, returns how long it lasts (ms)
const packId = (): string => document.body.dataset.pack ?? 'dino';
/** the world's own small action: a fixed pose and (mostly) a few particles of the world's kind. All quiet, about 1 s. */
const FLAVOUR: Record<string, Flavour> = {
  dino: (c, at) => { // a stomp: up, down hard with a squash, a puff of dust at its feet
    wobble(c, [{ transform: 'none' }, { transform: 'translateY(-16px) scale(0.96, 1.07)', offset: 0.35 }, { transform: 'translateY(2px) scale(1.09, 0.9)', offset: 0.6 }, { transform: 'translateY(-3px) scale(0.99, 1.02)', offset: 0.8 }, { transform: 'none' }], 700);
    at(() => puffAt(c, 4), 400);
    return 900;
  },
  dragon: (c, at) => { // head back, a small puff of sparks and a flame
    wobble(c, [{ transform: 'none' }, { transform: 'rotate(-5deg) translateY(-4px) scale(0.99, 1.03)', offset: 0.4 }, { transform: 'rotate(2deg) translateY(1px) scale(1.03, 0.97)', offset: 0.6 }, { transform: 'none' }], 800);
    at(() => { emitKind(topOf(c), 'spark', 3); emitKind(topOf(c), 'flame', 1); }, 330);
    return 1000;
  },
  transport: (c, at) => { // a honk: two quick shakes and a steam toot
    wobble(c, [{ transform: 'none' }, { transform: 'translateX(-5px) scale(1.03, 0.97)', offset: 0.18 }, { transform: 'translateX(5px) scale(0.98, 1.03)', offset: 0.36 }, { transform: 'translateX(-4px)', offset: 0.54 }, { transform: 'translateX(4px)', offset: 0.72 }, { transform: 'none' }], 620);
    at(() => { sfx.pop(); emitKind(topOf(c), 'steam', 3); }, 80);
    return 800;
  },
  space: (c, at) => { // floats up a little and beams up twinkles
    wobble(c, [{ transform: 'none' }, { transform: 'translateY(-20px) scale(0.98, 1.04)', offset: 0.45 }, { transform: 'translateY(-16px)', offset: 0.7 }, { transform: 'none' }], 1300);
    at(() => emitKind(topOf(c), 'twinkle', 4), 420);
    return 1400;
  },
  ocean: (c, at) => { // rises on its toes and blows a few bubbles
    wobble(c, [{ transform: 'none' }, { transform: 'translateY(-12px) scale(0.98, 1.04)', offset: 0.4 }, { transform: 'translateY(-10px) scale(1.04, 0.96)', offset: 0.6 }, { transform: 'none' }], 1200);
    at(() => emitKind(topOf(c), 'bubble', 3), 400);
    return 1300;
  },
  farm: (c, at) => { // chews: four small mouthfuls and a wisp of hay
    wobble(c, [{ transform: 'none' }, { transform: 'scale(1.03, 0.95)', offset: 0.13 }, { transform: 'scale(0.99, 1.02)', offset: 0.25 }, { transform: 'scale(1.03, 0.95)', offset: 0.38 }, { transform: 'scale(0.99, 1.02)', offset: 0.5 }, { transform: 'scale(1.03, 0.95)', offset: 0.63 }, { transform: 'scale(0.99, 1.02)', offset: 0.75 }, { transform: 'none' }], 1100);
    at(() => emitKind(topOf(c), 'hay', 1), 100);
    return 1200;
  },
  jungle: (c, at) => { // swings its weight to one side, as if on a vine, and shakes down two leaves
    wobble(c, [{ transform: 'none' }, { transform: 'rotate(7deg) translateX(8px)', offset: 0.35 }, { transform: 'rotate(7deg) translateX(8px)', offset: 0.5 }, { transform: 'rotate(-3deg) translateX(-3px)', offset: 0.78 }, { transform: 'none' }], 1300);
    at(() => emitKind(topOf(c), 'leaf', 2), 350);
    return 1400;
  },
  robot: (c, at) => { // a beep: a quick jolt, a ring of signal and a spark from the antenna
    wobble(c, [{ transform: 'none' }, { transform: 'scale(1.04, 0.95)', offset: 0.15 }, { transform: 'translateY(-6px) scale(0.98, 1.03)', offset: 0.3 }, { transform: 'translateX(-3px)', offset: 0.45 }, { transform: 'translateX(3px)', offset: 0.6 }, { transform: 'none' }], 600);
    at(() => { sfx.tick(); emitKind(topOf(c), 'ring', 2); emitKind(topOf(c), 'spark', 1); }, 120);
    return 800;
  },
  pirate: (c, at) => { // rocks like a deck on the swell, a gold glint
    wobble(c, [{ transform: 'none' }, { transform: 'rotate(-5deg) translateX(-4px)', offset: 0.3 }, { transform: 'rotate(5deg) translateX(4px)', offset: 0.65 }, { transform: 'none' }], 1500);
    at(() => emitKind(topOf(c), 'star', 2), 500);
    return 1600;
  },
  fairy: (c, at) => { // drifts up like a petal on the breeze, scatters a few petals
    wobble(c, [{ transform: 'none' }, { transform: 'translateY(-18px) rotate(3deg)', offset: 0.5 }, { transform: 'translateY(-14px) rotate(-2deg)', offset: 0.7 }, { transform: 'none' }], 1500);
    at(() => { emitKind(topOf(c), 'petal', 3); emitKind(topOf(c), 'twinkle', 1); }, 450);
    return 1600;
  },
  music: (c, at) => { // keeps the beat: three little bounces, a ring of sound each time
    wobble(c, [{ transform: 'none' }, { transform: 'translateY(-9px) scale(0.98, 1.04)', offset: 0.17 }, { transform: 'scale(1.04, 0.96)', offset: 0.33 }, { transform: 'translateY(-9px) scale(0.98, 1.04)', offset: 0.5 }, { transform: 'scale(1.04, 0.96)', offset: 0.66 }, { transform: 'translateY(-9px) scale(0.98, 1.04)', offset: 0.83 }, { transform: 'none' }], 1200);
    at(() => emitKind(topOf(c), 'ring', 1), 150); at(() => emitKind(topOf(c), 'ring', 1), 550); at(() => emitKind(topOf(c), 'star', 1), 950);
    return 1300;
  },
  arctic: (c, at) => { // a shiver (small fast side-to-side), a flurry of snow-white flakes
    wobble(c, [{ transform: 'none' }, { transform: 'translateX(-3px)', offset: 0.1 }, { transform: 'translateX(3px)', offset: 0.2 }, { transform: 'translateX(-3px)', offset: 0.3 }, { transform: 'translateX(3px)', offset: 0.4 }, { transform: 'translateX(-2px)', offset: 0.5 }, { transform: 'scale(1.03, 0.97)', offset: 0.65 }, { transform: 'none' }], 900);
    at(() => emitKind(topOf(c), 'feather', 3), 200);
    return 1000;
  },
};
/** a pack with no action of its own (a future world) sways calmly: never an error, never nothing */
const SWAY: Flavour = (c) => { wobble(c, [{ transform: 'none' }, { transform: 'rotate(-3.5deg)', offset: 0.25 }, { transform: 'rotate(3.5deg)', offset: 0.6 }, { transform: 'none' }], 1000); return 1100; };
/** every 4th time a slightly bigger, still gentle, action for any world: two happy hops */
const BIG: Flavour = (c) => { wobble(c, [{ transform: 'none' }, { transform: 'translateY(-22px) rotate(-4deg) scale(0.96, 1.06)', offset: 0.22 }, { transform: 'scale(1.07, 0.92)', offset: 0.4 }, { transform: 'translateY(-22px) rotate(4deg) scale(0.96, 1.06)', offset: 0.62 }, { transform: 'scale(1.07, 0.92)', offset: 0.8 }, { transform: 'none' }], 1300); return 1400; };
const FLAVOUR_GAPS = [8000, 10000, 12000];

export const homeIdle = (pet: HTMLElement, play: HTMLElement, asleep: boolean): void => {
  if (asleep) return;
  const c = petOf(pet);
  let busy = false;
  const hold = (ms: number): void => { busy = true; later(() => { busy = false; }, ms); };
  const glance = (): void => {
    if (!pet.isConnected || busy || c.classList.contains('looking')) return;
    const b = pt(play);
    c.classList.add('looking');
    hold(1800);
    lookAt(c, b.x, b.y);
    if (!reducedMotion()) {
      anim(c, [{ transform: 'translateY(0)' }, { transform: 'translateY(8px) scale(1.03, 0.94)', offset: 0.22 }, { transform: 'translateY(-4px) scale(0.98, 1.03)', offset: 0.42 }, { transform: 'translateY(8px) scale(1.03, 0.94)', offset: 0.68 }, { transform: 'translateY(0)' }], { duration: 900, easing: 'ease-in-out', delay: 200, origin: BOTTOM });
      anim(play, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 700, easing: 'ease-in-out', delay: 700 });
    }
    later(() => { lookAt(c, null, null); c.classList.remove('looking'); }, 1900);
  };
  let i = 0;
  const flavour = (): void => {
    const gap = FLAVOUR_GAPS[i % FLAVOUR_GAPS.length] as number;
    later(() => {
      if (pet.isConnected && !busy && !reducedMotion()) {
        // the world's own action, a calm sway, the world's action, then every 4th a bigger double hop (about every 40 s: not a loop of stimulation)
        const act: Flavour = i % 4 === 3 ? BIG : i % 2 === 1 ? SWAY : (FLAVOUR[packId()] ?? SWAY);
        hold(act(c, later) + 200);
      }
      i++;
      flavour();
    }, gap);
  };
  later(glance, 3000);
  every(glance, 6000);
  flavour();
};

/** A tiny empty nest with a dotted egg outline: "something will live here" (replaces the words on the bare island). */
export const emptyNest = (): HTMLElement => {
  const el = h('span', { class: 'hint-empty nest', 'aria-hidden': 'true' });
  el.innerHTML = `<svg viewBox="0 0 80 52" width="78" height="51" focusable="false"><ellipse cx="40" cy="45" rx="30" ry="4" fill="#0000001c"/>
    <ellipse cx="40" cy="24" rx="12" ry="15" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round" opacity=".95"/>
    <path d="M8 30 Q40 52 72 30 L66 38 Q40 54 14 38Z" fill="#c9893e" stroke="#8d5a22" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M12 33 Q40 49 68 33" fill="none" stroke="#e8b866" stroke-width="2.5" stroke-linecap="round"/><path d="M20 38 L26 33 M33 42 L38 35 M47 42 L44 35 M60 38 L55 33" stroke="#8d5a22" stroke-width="2" stroke-linecap="round"/></svg>`;
  return el;
};

// ================================================================================================================ Free Play doors
const art = (inner: string, vb = '0 0 120 100'): string => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${inner}</svg>`;
const peek = (word: string, tf: string): string => `<g transform="${tf}">${PICTURES[word] ?? ''}</g>`;
// per world: the animal that peeks out of the safari cover, the colours of the cover, the bridge's water, planks and bank
const SAFARI_DOOR: Record<string, { animal: string; leaf1: string; leaf2: string }> = {
  dino: { animal: 'lion', leaf1: '#3f9e5a', leaf2: '#6fd37e' }, dragon: { animal: 'fox', leaf1: '#7a5fc0', leaf2: '#a98bff' },
  transport: { animal: 'dog', leaf1: '#3f9e5a', leaf2: '#8ed36f' }, space: { animal: 'frog', leaf1: '#6f5fd0', leaf2: '#b9a8ff' },
  ocean: { animal: 'octopus', leaf1: '#ff7a6b', leaf2: '#ffa890' }, farm: { animal: 'sheep', leaf1: '#c9a23a', leaf2: '#f1cd70' },
};
const BRIDGE_DOOR: Record<string, { water: string; wave: string; bank: string; bank2: string; plank: (x: number, y: number, r: number) => string }> = {
  // logs
  dino: { water: '#4cc3d9', wave: '#fff', bank: '#6fd37e', bank2: '#3f9e5a', plank: (x, y, r) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 10}" y="${y - 5}" width="20" height="10" rx="5" fill="#b8793a" stroke="#7a4a1d" stroke-width="2.5"/><circle cx="${x + 7}" cy="${y}" r="3" fill="#e3b277" stroke="#7a4a1d" stroke-width="1.5"/></g>` },
  // castle stones
  dragon: { water: '#7aa8e8', wave: '#e6f0ff', bank: '#b9a8d8', bank2: '#8c78b8', plank: (x, y, r) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 10}" y="${y - 6}" width="20" height="12" rx="3" fill="#c9c3d6" stroke="#6f6a85" stroke-width="2.5"/><path d="M${x - 6} ${y - 2} h8" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>` },
  // girders
  transport: { water: '#8fb4d6', wave: '#e8f2fb', bank: '#a9b4c2', bank2: '#7b8696', plank: (x, y, r) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 10}" y="${y - 5}" width="20" height="10" rx="2" fill="#ffc933" stroke="#2f3a4a" stroke-width="2.5"/><path d="M${x - 7} ${y + 5} l5 -10 M${x} ${y + 5} l5 -10 M${x + 6} ${y + 5} l4 -8" stroke="#2f3a4a" stroke-width="2"/></g>` },
  // stepping-stone discs on deep space
  space: { water: '#2b2f7a', wave: '#8f9bff', bank: '#d9c8ff', bank2: '#a98bff', plank: (x, y, r) => `<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="10" ry="6" fill="#e7e2f7" stroke="#8c78d8" stroke-width="2.5"/><ellipse cx="${x - 3}" cy="${y - 2}" rx="4" ry="1.8" fill="#fff" opacity=".8"/></g>` },
  // shells
  ocean: { water: '#2fb8d8', wave: '#fff', bank: '#f6dfa8', bank2: '#e0c078', plank: (x, y, r) => `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - 10} ${y + 5} Q${x - 10} ${y - 8} ${x} ${y - 8} Q${x + 10} ${y - 8} ${x + 10} ${y + 5}Z" fill="#ff9fc0" stroke="#d6608a" stroke-width="2.5" stroke-linejoin="round"/><path d="M${x} ${y + 5} V${y - 6} M${x - 5} ${y + 5} L${x - 5} ${y - 4} M${x + 5} ${y + 5} L${x + 5} ${y - 4}" stroke="#d6608a" stroke-width="1.6"/></g>` },
  // hay bales
  farm: { water: '#6fc4e8', wave: '#fff', bank: '#8ed36f', bank2: '#5fae4a', plank: (x, y, r) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 10}" y="${y - 6}" width="20" height="12" rx="4" fill="#f1cd70" stroke="#b98a22" stroke-width="2.5"/><path d="M${x - 6} ${y - 6} v12 M${x + 6} ${y - 6} v12" stroke="#b98a22" stroke-width="1.8"/></g>` },
};
const bridgeDoor = (w: string): string => {
  const d = (BRIDGE_DOOR[w] ?? BRIDGE_DOOR.dino) as (typeof BRIDGE_DOOR)[string];
  const stars = w === 'space' ? '<circle cx="16" cy="82" r="1.6" fill="#fff"/><circle cx="52" cy="92" r="1.2" fill="#fff"/><circle cx="96" cy="86" r="1.6" fill="#fff"/><circle cx="76" cy="94" r="1.1" fill="#fff"/>' : '';
  return art(`<rect x="0" y="74" width="120" height="26" rx="8" fill="${d.water}"/><path d="M0 80 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="${d.wave}" stroke-width="3" fill="none" opacity=".6"/>${stars}
    <path d="M0 74 L0 46 Q14 40 24 50 L30 74Z" fill="${d.bank}" stroke="${d.bank2}" stroke-width="2"/><path d="M120 74 L120 46 Q106 40 96 50 L90 74Z" fill="${d.bank}" stroke="${d.bank2}" stroke-width="2"/>
    ${d.plank(31, 57, -8)}${d.plank(50, 50, -3)}${d.plank(70, 49, 3)}${d.plank(89, 55, 8)}
    <path d="M100 48 L100 22" stroke="#7d5a2a" stroke-width="3" stroke-linecap="round"/><path d="M100 22 L116 28 L100 35Z" fill="#ef476f"/>`);
};
/** the door illustrations: the world's own props where they exist (drum, pot, vehicle), the child's own friend, and small drawings for the rest */
const DOOR_ART: Record<GameKind, (kind: string, w: string) => string> = {
  feed: (kind) => `<span class="da-feed">${companionSVG(kind, 0).replace('mood-idle', 'mood-open')}<span class="da-letter">a</span></span>`,
  robot: () => robotSVG(),
  drum: (_k, w) => drumArt(w as World) || drumArt('dino'),
  rhyme: (_k, w) => `<span class="da-vehicle da-${w}">${vehicleSVG(w as PackId) || vehicleSVG('dino')}</span>`,
  safari: (_k, w) => { const d = (SAFARI_DOOR[w] ?? SAFARI_DOOR.dino) as (typeof SAFARI_DOOR)[string]; return art(`<ellipse cx="60" cy="90" rx="46" ry="6" fill="#0000001c"/>${peek(d.animal, 'translate(14 -6) scale(0.92)')}
    <path d="M6 96 C4 70 22 58 38 74 C34 82 28 92 6 96Z" fill="${d.leaf1}"/><path d="M114 96 C116 68 98 56 82 74 C86 82 92 92 114 96Z" fill="${d.leaf1}"/>
    <path d="M18 96 C16 76 30 68 44 82 C40 90 34 96 18 96Z" fill="${d.leaf2}"/><path d="M102 96 C104 74 90 66 76 82 C80 90 86 96 102 96Z" fill="${d.leaf2}"/>`); },
  kitchen: (_k, w) => potArt(w as World) || potArt('dino'),
  bridge: (_k, w) => bridgeDoor(w),
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
    a.innerHTML = DOOR_ART[k](kind, packId());
    b.append(a, h('span', { class: 'gname' }, GAME_LABEL[k].name));
    return b;
  }), h('span', { class: 'doors-more', 'aria-hidden': 'true' }, '⌄'));
/** Call AFTER the scene is mounted: shows the phone's "more below" chevron while the grid scrolls, and removes it at the end (cleaned up with the scene). */
export const doorsHint = (grid: HTMLElement): void => {
  const more = grid.querySelector('.doors-more');
  if (!more) return;
  const upd = (): void => {
    const el = document.documentElement;
    more.classList.toggle('off', el.scrollHeight <= window.innerHeight + 24 || window.scrollY + window.innerHeight >= el.scrollHeight - 24);
  };
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  onLeave(() => { window.removeEventListener('scroll', upd); window.removeEventListener('resize', upd); });
  later(upd, 80); later(upd, 700);
};
