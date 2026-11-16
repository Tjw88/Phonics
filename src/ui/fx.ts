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

/** Replace the stage contents and tag the scene with a counter, so tests (and animations) can tell scenes apart. */
export const mount = (stage: HTMLElement, ...kids: Node[]): void => {
  stage.dataset.scene = String(Number(stage.dataset.scene ?? '0') + 1);
  stage.replaceChildren(...kids);
};

export const setNight = (night: boolean): void => {
  document.body.classList.toggle('night', night);
  setNightMusic(night);
};
