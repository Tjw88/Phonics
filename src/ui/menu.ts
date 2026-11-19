// The GROWN-UP MENU shown from inside a game, after the parent gate (the multiplication question). Large labelled buttons for the things a grown-up
// needs mid-session: tap instead of drag, switch activity, change world or friend, back to home, keep playing. Pure UI: it returns what was chosen
// and app.ts does it (pausing, leaving and tearing down the game cleanly). Nothing here is reachable by a child: the gate comes first.
import { h } from './dom';
import { PACKS, companionSVG, creatureOf, packById } from './themes';

export type Activity = 'adventure' | 'freeplay' | 'soundplay';
export type MenuResult =
  | { type: 'keep' }
  | { type: 'home' }
  | { type: 'activity'; to: Activity }
  | { type: 'parent' }
  | { type: 'world'; pack: string }
  | { type: 'friend'; kind: string };

export interface MenuOpts {
  /** what is on screen now */
  mode: Activity;
  band: 'B' | 'C';
  /** Free Play needs at least one sound the child has met */
  hasLearned: boolean;
  tapMode: () => boolean;
  setTapMode: (easy: boolean) => void;
  theme: string;
  kind: string;
  name: string;
}

const MODE_NAME: Record<Activity, string> = { adventure: 'the daily Adventure', freeplay: 'Free Play', soundplay: 'Sound Play' };

/** Big, labelled menu button: a title and (optionally) a small second line. */
const mb = (testid: string, title: string, sub: string | null, cls: string, onClick: () => void): HTMLButtonElement =>
  h('button', { class: `btn gm-btn ${cls}`, 'data-testid': testid, onClick }, h('span', { class: 'gm-t' }, title), sub ? h('span', { class: 'gm-s' }, sub) : null);

/** Show the menu; resolves with the choice and removes itself. Escape means "keep playing". */
export const grownupMenu = (o: MenuOpts): Promise<MenuResult> =>
  new Promise<MenuResult>((resolve) => {
    const overlay = h('div', { class: 'overlay gmenu', role: 'dialog', 'aria-label': 'Grown-ups menu', 'data-testid': 'game-menu' });
    const done = (r: MenuResult): void => { document.removeEventListener('keydown', onKey, true); overlay.remove(); resolve(r); };
    const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') { e.stopPropagation(); done({ type: 'keep' }); } };
    document.addEventListener('keydown', onKey, true);

    const main = (): void => {
      const easy = o.tapMode();
      const tapBtn = mb('menu-tapmode', easy ? 'Drag' : 'Tap instead of drag', easy ? 'Now: tap to place. Tap here to drag again.' : 'Now: drag to place. Tap here to tap letters into place.', 'gm-toggle',
        () => { o.setTapMode(!o.tapMode()); main(); });
      tapBtn.setAttribute('aria-pressed', String(easy));
      const switches: HTMLElement[] = [];
      if (o.mode !== 'adventure') switches.push(mb('menu-adventure', 'Switch to Adventure', 'the daily story and games', 'gm-act', () => done({ type: 'activity', to: 'adventure' })));
      if (o.mode !== 'freeplay' && o.hasLearned) switches.push(mb('menu-freeplay', 'Switch to Free Play', 'choose any game', 'gm-act', () => done({ type: 'activity', to: 'freeplay' })));
      if (o.mode !== 'soundplay') switches.push(mb('menu-soundplay', 'Switch to Sound Play', o.band === 'C' ? 'ages 2–3, just this once' : 'ages 2–3', 'gm-act', () => done({ type: 'activity', to: 'soundplay' })));
      overlay.replaceChildren(h('div', { class: 'card wide gm-card' },
        h('h2', {}, 'Grown-ups menu'),
        h('p', { class: 'muted gm-now' }, `${o.name} is playing ${MODE_NAME[o.mode]}.`),
        mb('menu-keep', 'Keep playing', null, 'go gm-keep', () => done({ type: 'keep' })),
        tapBtn,
        h('div', { class: 'gm-grid' }, ...switches),
        h('div', { class: 'gm-grid' },
          mb('menu-world', 'Change world', packById(o.theme).name, '', () => worlds()),
          mb('menu-friend', 'Change friend', `${o.name} keeps their name and progress`, '', () => friends())),
        h('div', { class: 'gm-grid' },
          mb('menu-parent', 'Grown-ups area', 'progress and settings', 'quiet', () => done({ type: 'parent' })),
          mb('menu-home', 'Back to home', 'stop here; today stays saved', 'quiet', () => done({ type: 'home' }))),
      ));
      (overlay.querySelector('[data-testid=menu-keep]') as HTMLElement | null)?.focus();
    };

    const sub = (title: string, body: HTMLElement): void => {
      overlay.replaceChildren(h('div', { class: 'card wide gm-card' },
        h('h2', {}, title), body,
        mb('menu-back', 'Back', null, 'quiet', () => main())));
    };
    const worlds = (): void => {
      const grid = h('div', { class: 'row worlds gm-worlds', 'data-testid': 'menu-worlds' }, PACKS.map((pk) => {
        const b = h('button', {
          class: `world${pk.id === o.theme ? ' on' : ''}`, 'data-testid': 'world-pick', 'data-id': pk.id, 'aria-label': pk.name,
          onClick: () => done({ type: 'world', pack: pk.id }),
        });
        b.innerHTML = `<span class="wthumb"><span class="wt-scene">${pk.scene()}</span><span class="wt-pet">${companionSVG((pk.creatures[0] as { id: string }).id, 0)}</span></span><span class="wname">${pk.name}</span>`;
        return b;
      }));
      sub('Change world', h('div', {}, h('p', { class: 'muted' }, 'The game starts again in the new world. Your friend keeps their place, name and progress.'), grid));
    };
    const friends = (): void => {
      const pack = packById(o.theme);
      const row = h('div', { class: 'row gm-friends', 'data-testid': 'menu-friends' }, pack.creatures.map((c) => {
        const b = h('button', {
          class: `tile gm-friend${c.id === o.kind ? ' on' : ''}`, 'data-testid': 'friend-pick', 'data-kind': c.id, 'aria-label': c.label,
          onClick: () => done({ type: 'friend', kind: c.id }),
        });
        b.innerHTML = companionSVG(creatureOf(c.id).id, 0);
        return b;
      }));
      sub('Change friend', h('div', {}, h('p', { class: 'muted' }, `Choose who plays in ${pack.name}. The name and progress stay.`), row));
    };

    document.body.append(overlay);
    main();
  });
