import { setNightMusic } from './audio';
import { h, reducedMotion } from './dom';

const COLOURS = ['#ff6b9a', '#ffd166', '#4cc3d9', '#8ee27a', '#9b8bf0', '#ff9f43'];
const starSvg = (c: string) =>
  `<svg viewBox="-12 -12 24 24" width="22" height="22"><path d="M0 -11 L3.2 -3.4 L11 -3.4 L4.8 1.6 L7 10 L0 5.2 L-7 10 L-4.8 1.6 L-11 -3.4 L-3.2 -3.4Z" fill="${c}"/></svg>`;

let layer: HTMLElement | null = null;
const fxLayer = (): HTMLElement => {
  if (!layer || !layer.isConnected) {
    layer = h('div', { id: 'fx', 'aria-hidden': 'true' });
    document.body.append(layer);
  }
  return layer;
};

/** A short burst of confetti and stars with real gravity (about 1.1 s; nothing at all under Reduce Motion). */
export const burst = (el: Element, kind: 'confetti' | 'stars' = 'confetti', n = 16): void => {
  if (reducedMotion()) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const host = fxLayer();
  const DUR = 1150;
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25; // mostly upward fan
    const speed = 260 + Math.random() * 300; // px/s
    const vx = Math.cos(ang) * speed, vy = Math.sin(ang) * speed;
    const g = 1100; // px/s^2
    const spin = (Math.random() - 0.5) * 900;
    const c = COLOURS[i % COLOURS.length] as string;
    const star = kind === 'stars' || i % 3 === 0;
    const p = h('span', { class: `particle ${star ? 'p-star' : i % 2 ? 'p-dot' : 'p-bit'}`, style: `left:${cx}px;top:${cy}px;--c:${c}` });
    if (star) p.innerHTML = starSvg(c);
    host.append(p);
    const frames: Keyframe[] = [];
    for (let k = 0; k <= 12; k++) {
      const t = (k / 12) * (DUR / 1000);
      frames.push({
        transform: `translate(${vx * t}px, ${vy * t + 0.5 * g * t * t}px) rotate(${spin * t}deg) scale(${1 - (k / 12) * 0.35})`,
        opacity: k < 9 ? 1 : 1 - (k - 9) / 3,
        offset: k / 12,
      });
    }
    p.animate(frames, { duration: DUR, easing: 'linear', fill: 'forwards', delay: Math.random() * 60 });
    setTimeout(() => p.remove(), DUR + 120);
  }
};

/** Wait `ms`, or until the child taps anywhere (celebrations are skippable: spec). */
export const skippableWait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener('pointerdown', finish, true);
      resolve();
    };
    // ignore the very tap that triggered the celebration
    setTimeout(() => window.addEventListener('pointerdown', finish, true), 250);
    setTimeout(finish, Math.min(ms, 2800)); // spec: celebrations stay under 3 seconds
  });

// ---------------------------------------------------------------------------------------------------------------------------
// Scene lifecycle: everything a screen starts (timers, loops, one-shot animations) registers a cleanup here, and mount() runs them
// when the next scene arrives, so a screen can never keep chattering, blinking or playing sounds after the child has moved on.
const leaveHooks: (() => void)[] = [];
/** Run `fn` when the current scene is left (the next mount). */
export const onLeave = (fn: () => void): void => { leaveHooks.push(fn); };
/** setTimeout that is cancelled when the scene is left. */
export const later = (fn: () => void, ms: number): void => {
  const t = window.setTimeout(fn, ms);
  onLeave(() => clearTimeout(t));
};
/** setInterval that stops when the scene is left. */
export const every = (fn: () => void, ms: number): void => {
  const t = window.setInterval(fn, ms);
  onLeave(() => clearInterval(t));
};
/**
 * Play a Web Animation (transform / opacity only) that is cancelled when the scene is left. Under Reduce Motion it jumps straight to its
 * last frame, so callers write the keyframes so that the LAST frame is the resting state they want (the success stays visible, just still).
 */
export const anim = (el: Element, frames: Keyframe[], opts: KeyframeAnimationOptions & { origin?: string } = {}): Animation => {
  const { origin, ...o } = opts;
  if (origin) (el as HTMLElement).style.transformOrigin = origin;
  const a = el.animate(frames, reducedMotion() ? { ...o, duration: 1, delay: 0, iterations: 1, fill: 'forwards' } : o);
  onLeave(() => { try { a.cancel(); } catch { /* already gone */ } });
  return a;
};
const runLeave = (): void => { for (const fn of leaveHooks.splice(0)) { try { fn(); } catch { /* a dead element is fine */ } } };

const XFADE_IN = 240, XFADE_OUT = 120; // the old card leaves fast, so the two are never both readable
/**
 * Replace the stage contents and tag the scene with a counter, so tests (and animations) can tell scenes apart.
 * The new card CROSS-FADES in while the old one fades out (no blank landscape between rounds), and when the child's creature is on both
 * screens it glides from where it stood to where it stands now instead of popping out and back in.
 */
export const mount = (stage: HTMLElement, ...kids: Node[]): void => {
  runLeave();
  stage.querySelectorAll(':scope > .scene-ghost').forEach((g) => g.remove());
  const old = stage.querySelector<HTMLElement>(':scope > .scene');
  const motion = !reducedMotion();
  let ghost: HTMLElement | null = null;
  let oldPet: DOMRect | null = null;
  if (old && motion && old.isConnected) {
    const r = old.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      const pet = old.querySelector('.companion');
      oldPet = pet ? pet.getBoundingClientRect() : null;
      ghost = old;
      // freeze the old card exactly where it was, take it out of the layout and strip everything a test or a finger could find
      ghost.style.cssText += `;position:absolute;margin:0;left:${r.left - sr.left - stage.clientLeft}px;top:${r.top - sr.top - stage.clientTop}px;width:${r.width}px;height:${r.height}px`;
      ghost.classList.add('scene-ghost');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.setAttribute('inert', '');
      ghost.querySelectorAll('[data-testid],[data-answer],[id]').forEach((n) => { n.removeAttribute('data-testid'); n.removeAttribute('data-answer'); n.removeAttribute('id'); });
      ghost.removeAttribute('data-testid');
      // words must never be in the double exposure: the old captions go at once (the rest of the card fades under the new one)
      ghost.querySelectorAll<HTMLElement>('.caption, h1, h2, .treasure-name').forEach((n) => { n.style.visibility = 'hidden'; });
    }
  }
  stage.dataset.scene = String(Number(stage.dataset.scene ?? '0') + 1);
  stage.replaceChildren(...kids, ...(ghost ? [ghost] : []));
  if (!motion) return;
  const fresh = kids.find((k): k is HTMLElement => k instanceof HTMLElement && k.classList.contains('scene'));
  if (ghost) {
    const g = ghost;
    const newPet = fresh?.querySelector<HTMLElement>('.companion') ?? null;
    if (oldPet && newPet) {
      const nr = newPet.getBoundingClientRect();
      if (nr.width > 0 && oldPet.width > 0) {
        // the creature stays: hide the old copy and glide the new one from the old spot (feet to feet), with a little hop on the way
        g.querySelector<HTMLElement>('.companion')!.style.visibility = 'hidden';
        const dx = oldPet.left + oldPet.width / 2 - (nr.left + nr.width / 2);
        const dy = oldPet.bottom - nr.bottom;
        const sc = Math.min(1.5, Math.max(0.65, oldPet.width / nr.width)); // never starts huge over the new card's buttons
        const far = Math.abs(dx) + Math.abs(dy) > 6 || Math.abs(sc - 1) > 0.03;
        if (far) {
          const hop = Math.min(26, 8 + (Math.abs(dx) + Math.abs(dy)) / 14);
          newPet.style.zIndex = '-1'; // behind the new card's buttons while it travels, so it can never sit over a button
          const glide = newPet.animate([
            { transform: `translate(${dx}px, ${dy}px) scale(${sc})`, transformOrigin: '50% 100%', easing: 'cubic-bezier(0.3, 0.6, 0.4, 1)' },
            { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - hop}px) scale(${(1 + sc) / 2 * 1.02}, ${(1 + sc) / 2 * 1.05})`, transformOrigin: '50% 100%', offset: 0.5, easing: 'cubic-bezier(0.5, 0, 0.7, 1)' },
            { transform: 'translate(0, 0) scale(1.03, 0.96)', transformOrigin: '50% 100%', offset: 0.86 },
            { transform: 'none', transformOrigin: '50% 100%' },
          ], { duration: 460 });
          const settle = (): void => { newPet.style.zIndex = ''; };
          glide.onfinish = settle; glide.oncancel = settle;
        }
      }
    }
    g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: XFADE_OUT, easing: 'ease-in', fill: 'forwards' });
    window.setTimeout(() => g.remove(), XFADE_OUT + 40);
  }
  // the incoming card fades in as ONE piece (never a hollow frame), its words a beat later so they are never over the old words
  fresh?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: XFADE_IN, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'backwards' });
  if (ghost) fresh?.querySelectorAll('.caption, h1, .treasure-name').forEach((n) => n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: 90, fill: 'backwards' }));
};

export const setNight = (night: boolean): void => {
  document.body.classList.toggle('night', night);
  setNightMusic(night);
};
