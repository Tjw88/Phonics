// Shared gesture helpers. Dragging is the primary way to move things (letters into the dino's mouth, tiles onto the board,
// pictures into the rocket) because it is a natural, physical action; tapping remains as a fallback for accessibility and
// for very small hands (parent setting "Tap to place"), and kicks in by itself after a few taps so no child is ever stuck.
import { reducedMotion } from './dom';

export interface Assist { taps: number; readonly allow: boolean; miss: () => void }
/** Tap is allowed from the start if the parent asked for it (or there is nothing to get wrong), otherwise after 2 taps that did not drag. */
export const makeAssist = (easyTap: boolean): Assist => ({
  taps: 0,
  get allow() { return easyTap || this.taps >= 2; },
  miss() { this.taps++; },
});

export interface DragOptions {
  target: () => DOMRect | null; // where a drop counts
  slop?: number; // extra forgiveness around the target, in px
  onPickUp?: () => void;
  /** fired while dragging: pointer position, and whether it is over (near) the target */
  onMove?: (x: number, y: number, near: boolean) => void;
  /** fired on release after a real drag: `hit` = released over the target; cur = how far the element was carried */
  onDrop: (hit: boolean, cur: { x: number; y: number }, at: { x: number; y: number }) => void | Promise<void>;
  /** a press that never became a drag */
  onTap?: () => void;
  carryScale?: number;
  /** scale while over the target: shrink and fade so what is beneath (the dino's open mouth) stays visible */
  nearScale?: number;
}

const inside = (r: DOMRect, x: number, y: number, slop: number): boolean =>
  x >= r.left - slop && x <= r.right + slop && y >= r.top - slop && y <= r.bottom + slop;

/** Spring an element back to where it started, with a little overshoot. */
export const springBack = (el: HTMLElement, from: { x: number; y: number }): void => {
  if (reducedMotion()) { el.style.transform = ''; return; }
  const a = el.animate(
    [{ transform: `translate(${from.x}px, ${from.y}px) scale(0.85)` }, { transform: 'translate(0px, 0px) scale(1.06)', offset: 0.7 }, { transform: 'translate(0px, 0px) scale(1)' }],
    { duration: 380, easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)' },
  );
  el.style.transform = '';
  a.onfinish = () => { el.style.transform = ''; };
};

export const makeDraggable = (el: HTMLElement, o: DragOptions): void => {
  const slop = o.slop ?? 40;
  let start: { x: number; y: number } | null = null;
  let dragging = false;
  const cur = { x: 0, y: 0 };
  el.style.touchAction = 'none';

  el.addEventListener('pointerdown', (e) => {
    if (el.hasAttribute('disabled')) return;
    start = { x: e.clientX, y: e.clientY };
    dragging = false;
    cur.x = cur.y = 0;
    try { el.setPointerCapture(e.pointerId); } catch { /* pointer already ended */ }
  });
  el.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!dragging && Math.hypot(dx, dy) > 9) {
      dragging = true;
      el.classList.add('dragging');
      o.onPickUp?.();
    }
    if (!dragging) return;
    cur.x = dx;
    cur.y = dy;
    // a little lean into the direction of travel, like a real object being carried
    const lean = Math.max(-14, Math.min(14, dx / 9));
    const r = o.target();
    const near = !!r && inside(r, e.clientX, e.clientY, slop * 2.2);
    const sc = near ? (o.nearScale ?? o.carryScale ?? 0.85) : (o.carryScale ?? 0.85);
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${sc}) rotate(${lean}deg)`;
    el.style.opacity = near && o.nearScale ? '0.72' : '';
    o.onMove?.(e.clientX, e.clientY, near);
  });
  const end = (e: PointerEvent) => {
    if (!start) return;
    const wasDragging = dragging;
    el.style.opacity = '';
    start = null;
    dragging = false;
    el.classList.remove('dragging');
    if (!wasDragging) { el.style.transform = ''; o.onTap?.(); return; }
    const r = o.target();
    const hit = !!r && inside(r, e.clientX, e.clientY, slop);
    void o.onDrop(hit, { ...cur }, { x: e.clientX, y: e.clientY });
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', () => {
    if (!start) return;
    start = null;
    dragging = false;
    el.classList.remove('dragging');
    springBack(el, cur);
  });
};

/** How many times the ghost hand has played in each scene (host element): a round shows it at most twice. */
const ghostShown = new WeakMap<HTMLElement, number>();
export const GHOST_MAX = 2;

/**
 * A ghost hand that shows how to drag `from` to `to` (a hint, never a requirement). It appears after about 2 s of nothing happening
 * (`delay`), plays once, and may come back once more after a longer pause: at most TWICE per round (per `host`), then it is gone for good.
 * Returns a function that removes it (call it on the first touch).
 */
export const ghostDrag = (host: HTMLElement, from: HTMLElement, to: HTMLElement, o: { delay?: number } = {}): (() => void) => {
  if (reducedMotion()) return () => undefined;
  let alive = true;
  let anim: Animation | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let hand: HTMLElement | null = null;
  const stop = () => { alive = false; clearTimeout(timer); anim?.cancel(); hand?.remove(); hand = null; };
  const run = () => {
    if (!alive || !from.isConnected || !to.isConnected) return stop();
    const used = ghostShown.get(host) ?? 0;
    if (used >= GHOST_MAX) return stop();
    ghostShown.set(host, used + 1);
    hand = document.createElement('div');
    hand.className = 'ghost-hand';
    hand.textContent = '👆';
    hand.setAttribute('aria-hidden', 'true');
    host.append(hand);
    // the fingertip (top-centre of the 👆) touches the BOTTOM EDGE of the thing, so the hand hangs below it and never covers the letter or the rocket
    hand.style.margin = '0';
    const hr = host.getBoundingClientRect(), a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const HAND = 26; // half the width of the emoji
    const phone = window.innerWidth < 600; // on a phone the things are small: the fingertip just touches the edge, a little to one side
    const lap = phone ? 2 : 18, side = phone ? 16 : 0;
    const ax = a.left + a.width / 2 - hr.left - HAND + side, ay = a.bottom - hr.top - lap;
    const bx = b.left + b.width / 2 - hr.left - HAND + side, by = b.bottom - hr.top - lap;
    anim = hand.animate(
      [
        { transform: `translate(${ax}px, ${ay}px) scale(1)`, opacity: 0 },
        { transform: `translate(${ax}px, ${ay}px) scale(0.9)`, opacity: 1, offset: 0.15 },
        { transform: `translate(${bx}px, ${by}px) scale(0.9)`, opacity: 1, offset: 0.7 },
        { transform: `translate(${bx}px, ${by}px) scale(1)`, opacity: 0 },
      ],
      { duration: 1800, easing: 'ease-in-out' },
    );
    anim.onfinish = () => {
      hand?.remove();
      hand = null;
      if (alive && (ghostShown.get(host) ?? 0) < GHOST_MAX) timer = setTimeout(run, 6000);
      else alive = false;
    };
  };
  timer = setTimeout(run, o.delay ?? 2000);
  return stop;
};
