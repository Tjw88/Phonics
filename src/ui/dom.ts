type Child = Node | string | null | undefined | false;
type Props = Record<string, unknown> & { class?: string };

/** Tiny hyperscript helper. `on*` props become listeners; `data-*` and `aria-*` become attributes. */
export const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...kids: (Child | Child[])[]
): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else if (k === 'class') el.className = String(v);
    else if (k === 'style' && typeof v === 'string') el.setAttribute('style', v);
    else if (k.startsWith('data-') || k.startsWith('aria-') || k === 'role' || k === 'type' || k === 'id') el.setAttribute(k, v === true ? '' : String(v));
    else (el as unknown as Record<string, unknown>)[k] = v;
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid);
  return el;
};

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Resolve when a button is pressed. */
export const bigButton = (label: string, testid: string, cls = ''): { el: HTMLButtonElement; pressed: Promise<void> } => {
  let done!: () => void;
  const pressed = new Promise<void>((r) => (done = r));
  const el = h('button', { class: `btn ${cls}`, 'data-testid': testid, onClick: () => done() }, label);
  return { el, pressed };
};
