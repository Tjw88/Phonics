import { setNightMusic } from './audio';
import { h, reducedMotion } from './dom';

const COLOURS = ['#ff6b9a', '#ffd166', '#4cc3d9', '#8ee27a', '#9b8bf0', '#ff9f43'];
const star = (c: string) =>
  `<svg viewBox="-12 -12 24 24" width="22" height="22"><path d="M0 -11 L3.2 -3.4 L11 -3.4 L4.8 1.6 L7 10 L0 5.2 L-7 10 L-4.8 1.6 L-11 -3.4 L-3.2 -3.4Z" fill="${c}"/></svg>`;

let layer: HTMLElement | null = null;
const fxLayer = (): HTMLElement => {
  if (!layer || !layer.isConnected) {
    layer = h('div', { id: 'fx', 'aria-hidden': 'true' });
    document.body.append(layer);
  }
  return layer;
};

/** A short burst of confetti and stars from the middle of `el` (about 1.1 s; nothing at all under Reduce Motion). */
export const burst = (el: Element, kind: 'confetti' | 'stars' = 'confetti', n = 16): void => {
  if (reducedMotion()) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const host = fxLayer();
  for (let i = 0; i < n; i++) {
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
    const dist = 70 + Math.random() * 110;
    const c = COLOURS[i % COLOURS.length] as string;
    const p = h('span', {
      class: `particle ${kind === 'stars' || i % 3 === 0 ? 'p-star' : i % 2 ? 'p-dot' : 'p-bit'}`,
      style: `left:${cx}px;top:${cy}px;--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 30}px;--rot:${Math.random() * 540 - 270}deg;--c:${c};animation-delay:${Math.random() * 60}ms`,
    });
    if (kind === 'stars' || i % 3 === 0) p.innerHTML = star(c);
    host.append(p);
    setTimeout(() => p.remove(), 1200);
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

/** Replace the stage contents and tag the scene with a counter, so tests (and animations) can tell scenes apart. */
export const mount = (stage: HTMLElement, ...kids: Node[]): void => {
  stage.dataset.scene = String(Number(stage.dataset.scene ?? '0') + 1);
  stage.replaceChildren(...kids);
};

export const setNight = (night: boolean): void => {
  document.body.classList.toggle('night', night);
  setNightMusic(night);
};
