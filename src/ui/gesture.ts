// Shared gesture helpers. Dragging is the primary way to move things (letters into the dino's mouth, tiles onto the board,
// pictures into the rocket) because it is a natural, physical action; tapping remains as a fallback for accessibility and
// for very small hands (parent setting "Tap to place"), and kicks in by itself after a few taps so no child is ever stuck.
//
// makeDraggable is written for a real MOUSE as well as a finger (the owner found the mouse "temperamental"):
//   * only the primary button starts a drag (right-click and the context menu never pick a tile up), one pointer at a time;
//   * the move/up/cancel handlers live on the WINDOW while a gesture is on, so a release anywhere (outside the tile, outside the window)
//     is seen; a window blur, a lost pointer capture or a buttonless move ends the gesture instead of leaving the tile stuck to the cursor;
//   * a press that moves only a little (up to TAP_PX) and lets go away from the target is a TAP, not a failed drag: sloppy clicks work;
//   * a re-grab while the tile is still springing back cancels the spring and picks the tile up where it visibly is;
//   * the drop test accepts the pointer OR the dragged tile's centre, with a bigger forgiveness for the mouse than for a finger;
//   * nothing is processed twice while a drop is being handled.
import { reducedMotion } from './dom';

export interface Assist { taps: number; readonly allow: boolean; miss: () => void; sloppy: () => void }
/**
 * Tap is allowed from the start if the parent asked for it (or there is nothing to get wrong), after 2 taps that did not drag, or after one
 * sloppy drag (a mouse user who clicks with a little movement is not made to learn the drag first).
 * `easy` may be a plain boolean or a GETTER, read on every `.allow` check, so a parent switching Tap vs Drag mid-round takes effect at once:
 * `makeAssist(() => ctx.s.easyTap || choices < 2)`.
 */
export const makeAssist = (easy: boolean | (() => boolean) = false): Assist => {
  let sloppyDrag = false;
  return {
    taps: 0,
    get allow() { return (typeof easy === 'function' ? easy() : easy) || sloppyDrag || this.taps >= 2; },
    miss() { this.taps++; },
    sloppy() { sloppyDrag = true; },
  };
};

export interface DragOptions {
  target: () => DOMRect | null; // where a drop counts
  slop?: number; // extra forgiveness around the target, in px (a mouse gets 1.35x)
  onPickUp?: () => void;
  /** fired while dragging: pointer position, and whether it is over (near) the target */
  onMove?: (x: number, y: number, near: boolean) => void;
  /** fired on release after a real drag: `hit` = released over the target; cur = how far the element was carried. A drag that was cancelled
   *  (window blur, pointercancel, lost capture) also arrives here as a miss, so the game can undo its highlights. */
  onDrop: (hit: boolean, cur: { x: number; y: number }, at: { x: number; y: number }) => void | Promise<void>;
  /** a press that never became a drag, or a small sloppy drag released away from the target (`sloppy: true`: it is also a miss of the drop,
   *  so the games let it place the item at once) */
  onTap?: (info?: { sloppy: boolean }) => void;
  carryScale?: number;
  /** scale while over the target: shrink and fade so what is beneath (the dino's open mouth) stays visible */
  nearScale?: number;
}

const inside = (r: DOMRect, x: number, y: number, slop: number): boolean =>
  x >= r.left - slop && x <= r.right + slop && y >= r.top - slop && y <= r.bottom + slop;

/** Cancel the running Web Animations on an element (not CSS animations such as the glow cue), e.g. a spring-back or a hop. */
const cancelScripted = (el: Element): void => {
  for (const a of el.getAnimations()) if (!('animationName' in a) && !('transitionProperty' in a)) a.cancel();
};

/** Spring an element back to where it started, with a little overshoot. */
export const springBack = (el: HTMLElement, from: { x: number; y: number }): void => {
  cancelScripted(el);
  if (reducedMotion()) { el.style.transform = ''; return; }
  const a = el.animate(
    [{ transform: `translate(${from.x}px, ${from.y}px) scale(0.85)` }, { transform: 'translate(0px, 0px) scale(1.06)', offset: 0.7 }, { transform: 'translate(0px, 0px) scale(1)' }],
    { duration: 380, easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)' },
  );
  el.style.transform = '';
  a.onfinish = () => { if (!el.classList.contains('dragging')) el.style.transform = ''; }; // (never wipe a tile that was grabbed again)
};

/** Tuning (CSS px). A press that moves less than PICKUP_PX is a tap; one that moves up to TAP_PX and is let go away from the target is a sloppy tap. */
export const PICKUP_PX = 9;
export const TAP_PX = 26;
const MOUSE_SLOP = 1.35;

export const makeDraggable = (el: HTMLElement, o: DragOptions): void => {
  const baseSlop = o.slop ?? 40;
  type G = { id: number; type: string; sx: number; sy: number; bx: number; by: number; dragging: boolean; max: number; x: number; y: number };
  let g: G | null = null;
  let processing = false; // a drop is being handled: ignore new presses on this element
  const cur = { x: 0, y: 0 };
  el.style.touchAction = 'none';
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  el.addEventListener('dragstart', (e) => e.preventDefault()); // (no native image/text drag ghost)
  const slopFor = (type: string): number => (type === 'mouse' ? baseSlop * MOUSE_SLOP : baseSlop);

  const detach = () => {
    window.removeEventListener('pointermove', onMove, true);
    window.removeEventListener('pointerup', onUp, true);
    window.removeEventListener('pointercancel', onCancel, true);
    window.removeEventListener('blur', onCancel);
    el.removeEventListener('lostpointercapture', onCancel);
    el.removeEventListener('contextmenu', onCancel);
  };
  const cleanVisuals = () => { el.classList.remove('dragging'); el.style.opacity = ''; };

  const onMove = (e: PointerEvent) => {
    if (!g || e.pointerId !== g.id) return;
    if (e.pointerType === 'mouse' && e.buttons === 0) return onUp(e); // the release was never seen: finish now instead of following a hovering mouse
    g.x = e.clientX; g.y = e.clientY;
    const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
    const dist = Math.hypot(dx, dy);
    if (dist > g.max) g.max = dist;
    if (!g.dragging && dist > PICKUP_PX) {
      g.dragging = true;
      el.classList.add('dragging');
      o.onPickUp?.();
    }
    if (!g.dragging) return;
    cur.x = g.bx + dx;
    cur.y = g.by + dy;
    // a little lean into the direction of travel, like a real object being carried
    const lean = Math.max(-14, Math.min(14, dx / 9));
    const r = o.target();
    const near = !!r && inside(r, e.clientX, e.clientY, slopFor(g.type) * 2.2);
    const sc = near ? (o.nearScale ?? o.carryScale ?? 0.85) : (o.carryScale ?? 0.85);
    el.style.transform = `translate(${cur.x}px, ${cur.y}px) scale(${sc}) rotate(${lean}deg)`;
    el.style.opacity = near && o.nearScale ? '0.72' : '';
    o.onMove?.(e.clientX, e.clientY, near);
  };

  /** End the gesture. `at` = where it ended; `cancelled` = it did not end by a release (blur, cancel, lost capture). */
  const finish = async (at: { x: number; y: number }, cancelled: boolean) => {
    const a = g;
    if (!a) return;
    g = null;
    detach();
    try { el.releasePointerCapture(a.id); } catch { /* already released */ }
    cleanVisuals();
    if (!a.dragging) {
      el.style.transform = '';
      if (!cancelled) o.onTap?.({ sloppy: false });
      return;
    }
    const r = o.target();
    const sl = slopFor(a.type);
    const c = el.getBoundingClientRect(); // the carried tile's own centre also counts: grabbed by its corner, it may be over the target while the pointer is not
    const hit = !cancelled && !!r && (inside(r, at.x, at.y, sl) || inside(r, c.left + c.width / 2, c.top + c.height / 2, sl * 0.4));
    processing = true;
    try {
      if (!hit && !cancelled && a.max <= TAP_PX) {
        // a small movement and let go away from the target: a clumsy CLICK, not a failed drag
        el.style.transform = '';
        await o.onDrop(false, { x: 0, y: 0 }, at); // (undo the pick-up highlights)
        o.onTap?.({ sloppy: true });
      } else {
        await o.onDrop(hit, { ...cur }, at);
      }
    } finally { processing = false; }
  };
  const onUp = (e: PointerEvent) => { if (g && e.pointerId === g.id) void finish({ x: e.clientX, y: e.clientY }, false); };
  const onCancel = () => { if (g) void finish({ x: g.x, y: g.y }, true); };

  el.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return; // one finger, the main button
    if (el.hasAttribute('disabled') || processing) return;
    if (g) onCancel(); // a stale gesture (its release never arrived): drop it first
    // re-grab during a spring-back (or a hop): stop the scripted animation and pick the tile up where it visibly is
    const seen = el.getBoundingClientRect();
    cancelScripted(el);
    el.style.transform = '';
    el.classList.remove('dragging');
    const rest = el.getBoundingClientRect();
    const bx = seen.left + seen.width / 2 - (rest.left + rest.width / 2), by = seen.top + seen.height / 2 - (rest.top + rest.height / 2);
    g = { id: e.pointerId, type: e.pointerType, sx: e.clientX, sy: e.clientY, bx: Math.abs(bx) < 1 ? 0 : bx, by: Math.abs(by) < 1 ? 0 : by, dragging: false, max: 0, x: e.clientX, y: e.clientY };
    cur.x = g.bx; cur.y = g.by;
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onCancel, true);
    window.addEventListener('blur', onCancel);
    el.addEventListener('lostpointercapture', onCancel);
    el.addEventListener('contextmenu', onCancel);
    try { el.setPointerCapture(e.pointerId); } catch { /* pointer already ended */ }
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
export const ghostDrag = (host: HTMLElement, from: HTMLElement, to: HTMLElement, o: { delay?: number; /** true = do not show it (e.g. the grown-up switched on Tap to place) */ skipWhen?: () => boolean } = {}): (() => void) => {
  if (reducedMotion()) return () => undefined;
  let alive = true;
  let anim: Animation | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let hand: HTMLElement | null = null;
  const stop = () => { alive = false; clearTimeout(timer); anim?.cancel(); hand?.remove(); hand = null; };
  const run = () => {
    if (!alive || !from.isConnected || !to.isConnected) return stop();
    if (o.skipWhen?.()) { timer = setTimeout(run, 3000); return; } // asked to stay away right now: look again later
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
