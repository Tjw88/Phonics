import './anim-flow.css';
import { ACCENTS, GRAPHEMES, MAX_SET, MNEMONICS, STORY_SAY, TODDLER_WORDS, bankFor, type AccentId, type Word } from '../engine/data';
import { seeded, shuffle } from '../engine/dates';
import { strugglingSounds } from '../engine/review';
import { weekActivity, weekLines, weeklySummary } from '../engine/summary';
import {
  applyPlacement, feedBlocks, buildPlacement, decodableWords,
  missionFor, phonemeOf, pickDistractors, pickWords, printBlendOpen, scorePlacement, slashed, startAdventure, type Plan,
} from '../engine/session';
import { playDay } from '../engine/simulate';
import {
  MASTERY_DAYS, newChild, statusOf, unlockedSet, wordsRead, type ChildState,
} from '../engine/state';
import { audioSource, blip, initAudio, sayPhrase, saySeq, setMuted, setMusicOn, sfx, speak, tap, unlockAudio } from './audio';
import { friendEl } from './friends';
import { pictureEl } from './pictures';
import { copyBeat, findIt } from './games2';
import { availableGames, safariLearned, roundBridge, roundDrum, roundFeed, roundKitchen, roundRhyme, roundRobot, roundSafari, roundTrace, type GameKind } from './rounds';
import { PACKS, arrivalSVG, companionSVG, defaultNameFor, packById, sameSlotIn } from './themes';
import { mount, setNight } from './fx';
import { doorGrid, doorsHint, emptyNest, finaleScene, hatchScene, homeIdle, sleepScene, zsEl } from './flow';
import { bigButton, h, sleep } from './dom';
import {
  companionEl, placementTrial, type Ctx,
} from './games';
import { clockDay, load, save, wipe } from './storage';


export class App {
  s: ChildState = load();
  private stage: HTMLElement;
  private hintBtn: HTMLButtonElement;
  private bg!: HTMLElement;
  private logoEl!: HTMLElement;
  private hintCard: HTMLElement;
  private banner: HTMLElement;
  private inChild = false;
  private warned: string | null = null;
  private dirty = false; // prototype tools changed the clock/progress: reload to redraw cleanly

  constructor(private root: HTMLElement) {
    this.stage = h('main', { id: 'stage' });
    this.hintBtn = h('button', {
      class: 'corner hintbtn', 'data-testid': 'hint', 'aria-label': 'Grown-up hint', hidden: true,
      onClick: () => this.hintCard.classList.toggle('open'),
    }, '💡');
    this.hintCard = h('aside', { class: 'hintcard', 'data-testid': 'hintcard' });
    this.banner = h('div', { class: 'banner', role: 'status', 'data-testid': 'banner', hidden: true });
    const parent = h('button', {
      class: 'corner parentbtn', 'data-testid': 'parent-btn', 'aria-label': 'Grown-ups area',
      onClick: () => void this.openParent(),
    }, '⚙︎');
    const bg = h('div', { id: 'scene-bg', 'aria-hidden': 'true' });
    document.body.prepend(bg);
    this.bg = bg;
    const logo = h('span', { class: 'logo' });
    this.logoEl = logo;
    this.applyTheme();
    this.root.replaceChildren(
      h('header', { class: 'top' }, logo, this.hintBtn, parent),
      this.banner, this.hintCard, this.stage,
    );
    document.addEventListener('pointerdown', unlockAudio, { once: true });
    void initAudio(this.s.accent);
    setMusicOn(this.s.musicOn);
    setInterval(() => this.tick(), 1000);
  }

  private today = (): string => clockDay(this.s);
  private persist = (): void => save(this.s);

  private ctx(): Ctx {
    return {
      s: this.s, today: this.today(), rng: seeded((Date.now() & 0xffff) + this.s.dayOffset), stage: this.stage,
      hint: (t) => this.setHint(t),
    };
  }

  /** Paint the current theme pack's backdrop (and its first creature's arrival on the logo). Cosmetic only. */
  private applyTheme(): void {
    const pack = packById(this.s.theme);
    document.body.dataset.pack = pack.id; // lets the stylesheet skin props (bridge planks, drum, rocket...) per world
    this.bg.innerHTML = pack.scene();
    this.logoEl.innerHTML = `${arrivalSVG((pack.creatures[0] as { id: string }).id)}<span>Soundling</span>`;
  }

  private setHint(t: string | null) {
    this.hintBtn.hidden = !t;
    this.hintCard.classList.remove('open');
    this.hintCard.textContent = t ? `For grown-ups: ${t}` : '';
  }

  // ----- time limits (spec: parent-set daily limit, spoken two-minute warning, session ends on a high) -----
  private tick() {
    if (!this.inChild) return;
    const day = this.today();
    this.s.playMs[day] = (this.s.playMs[day] ?? 0) + 1000;
    const left = this.s.dailyLimitMin * 60_000 - (this.s.playMs[day] ?? 0);
    if (left <= 120_000 && left > 0 && this.warned !== day) {
      this.warned = day;
      const name = this.s.companion?.name ?? 'Your friend';
      this.banner.textContent = `${name}: two more minutes, then it’s sleepy time.`;
      this.banner.hidden = false;
      sayPhrase('two_minutes', 'Two more minutes, then it’s sleepy time.');
      setTimeout(() => (this.banner.hidden = true), 6000);
    }
    if (this.s.playMs[day]! % 15_000 === 0) this.persist();
  }
  private overLimit(): boolean {
    return (this.s.playMs[this.today()] ?? 0) >= this.s.dailyLimitMin * 60_000;
  }

  // ----- parental gate -----
  private gateLockedUntil = 0;
  /** Prototype tools (move the clock, fast-forward) are for testing only: hidden unless the page was opened with ?tools=1 once (remembered in this browser). */
  private toolsOn = ((): boolean => {
    try {
      if (new URLSearchParams(location.search).has('tools')) localStorage.setItem('soundling.tools', '1');
      return localStorage.getItem('soundling.tools') === '1';
    } catch { return false; }
  })();
  private async gate(): Promise<boolean> {
    // after a wrong answer the gate stays shut for 30 seconds, so a child cannot simply keep guessing (1 in 4 each try)
    const waitMs = this.gateLockedUntil - Date.now();
    if (waitMs > 0) {
      let res!: (ok: boolean) => void;
      const closed = new Promise<boolean>((r) => (res = r));
      const lock = h('div', { class: 'overlay', role: 'dialog', 'aria-label': 'Grown-ups only', 'data-testid': 'gate-locked' },
        h('div', { class: 'card' }, h('h2', {}, 'Grown-ups only'), h('p', {}, `Please wait ${Math.ceil(waitMs / 1000)} seconds and try again.`),
          h('button', { class: 'btn quiet', onClick: () => { lock.remove(); res(false); } }, 'Back to the game')));
      document.body.append(lock);
      return closed;
    }
    const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
    const right = a * b;
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = right + [-10, -8, -6, -4, -2, 2, 4, 6, 8, 10][Math.floor(Math.random() * 10)]!;
      if (w !== right && w > 0) wrongs.add(w);
    }
    let resolve!: (ok: boolean) => void;
    const done = new Promise<boolean>((r) => (resolve = r));
    const overlay = h('div', { class: 'overlay', role: 'dialog', 'aria-label': 'Grown-ups only', 'data-testid': 'gate' },
      h('div', { class: 'card' },
        h('h2', {}, 'Grown-ups only'),
        h('p', { 'data-testid': 'gate-q' }, `What is ${a} × ${b}?`),
        h('div', { class: 'row' }, shuffle([right, ...wrongs], Math.random).map((n) =>
          h('button', { class: 'btn', 'data-testid': 'gate-option', 'data-n': n, onClick: () => { overlay.remove(); if (n !== right) this.gateLockedUntil = Date.now() + 30_000; resolve(n === right); } }, String(n)))),
        h('button', { class: 'btn quiet', 'data-testid': 'gate-cancel', onClick: () => { overlay.remove(); resolve(false); } }, 'Back to the game'),
      ));
    document.body.append(overlay);
    return done;
  }

  // ----- entry -----
  async run(): Promise<void> {
    if (!this.s.companion) await this.setup();
    for (;;) await this.home();
  }

  private async interlude(parts: (Node | string)[], label = '▶', testid = 'next'): Promise<void> {
    const b = bigButton(label, testid, 'go');
    b.el.setAttribute('aria-label', 'Next');
    mount(this.stage, h('div', { class: 'scene' }, ...parts, h('div', { class: 'row' }, b.el)));
    await b.pressed;
    tap();
  }

  // ----- setup flow (spec: <3 minutes to first play, no DOB/photo/email/real name) -----
  private async setup(): Promise<void> {
    this.inChild = false;
    this.setHint(null);
    for (;;) if (await this.gate()) break;
    let band: 'B' | 'C' = 'C';
    let nick = '';
    const input = h('input', {
      type: 'text', maxlength: 20, placeholder: 'A nickname (not a real name)', 'data-testid': 'nick',
      'aria-label': 'Child nickname', class: 'input',
    }) as HTMLInputElement;
    const bandBtns = (['B', 'C'] as const).map((k) => h('button', {
      class: `btn choice${k === band ? ' on' : ''}`, 'data-testid': `band-${k}`,
      onClick: () => { band = k; bandBtns.forEach((x, i) => x.classList.toggle('on', i === (k === 'B' ? 0 : 1))); },
    }, k === 'B' ? 'Sound Play · ages 2–3, play together' : 'Phonics journey · ages 3–5'));
    const bandHelp = h('p', { class: 'muted small', 'data-testid': 'band-help' }, 'Not sure? Start with Sound Play until your child knows a few letter sounds; you can start the journey later from a new profile.');
    let accent: AccentId = this.s.accent;
    const accentNote = h('p', { class: 'muted', 'data-testid': 'accent-note' }, ACCENTS.find((a) => a.id === accent)?.note ?? '');
    const accentBtns = ACCENTS.map((a) => h('button', {
      class: `btn choice small${a.id === accent ? ' on' : ''}`, 'data-testid': `accent-${a.id}`,
      onClick: () => {
        accent = a.id;
        accentBtns.forEach((x, i) => x.classList.toggle('on', ACCENTS[i]?.id === accent));
        accentNote.textContent = a.note;
        void initAudio(accent);
      },
    }, a.label));
    const go = bigButton('Next', 'setup-next');
    mount(this.stage, 
      h('div', { class: 'scene setup' }, h('h1', {}, 'Welcome to Soundling'),
        h('p', {}, 'No account, email, photo or real name needed. Everything stays on this device.'),
        input, h('div', { class: 'row' }, bandBtns), bandHelp,
        h('p', { class: 'caption small' }, 'How do you say your sounds?'),
        h('div', { class: 'row' }, accentBtns), accentNote, go.el),
    );
    await go.pressed;
    nick = input.value.trim() || 'Friend';
    this.s = newChild();
    this.s.nickname = nick;
    this.s.band = band;
    this.s.accent = accent;

    // choose a world, then a friend from it, and name them
    let chosen = 0;
    const names = h('input', { type: 'text', maxlength: 16, placeholder: 'Name your friend', 'data-testid': 'companion-name', class: 'input' }) as HTMLInputElement;
    const hatch = bigButton('Hatch!', 'hatch');
    const eggRow = h('div', { class: 'row eggs', 'data-testid': 'eggs' });
    const drawEggs = () => {
      chosen = 0;
      eggRow.replaceChildren(...packById(this.s.theme).creatures.map((d, i) => {
        const b = h('button', {
          class: `tile egg${i === 0 ? ' on' : ''}`, 'data-testid': 'egg', 'aria-label': d.label,
          onClick: (ev: Event) => {
            chosen = i;
            eggRow.querySelectorAll('.egg').forEach((n) => n.classList.remove('on'));
            (ev.currentTarget as HTMLElement).classList.add('on');
            tap();
            sfx.pop();
          },
        });
        b.innerHTML = arrivalSVG(d.id);
        return b;
      }));
    };
    const worldRow = h('div', { class: 'row worlds', 'data-testid': 'worlds' }, PACKS.map((pk) => {
      const b = h('button', {
        class: `world${pk.id === this.s.theme ? ' on' : ''}`, 'data-testid': 'world', 'data-id': pk.id, 'aria-label': pk.name,
        onClick: (ev: Event) => {
          this.s.theme = pk.id;
          this.applyTheme();
          worldRow.querySelectorAll('.world').forEach((n) => n.classList.remove('on'));
          (ev.currentTarget as HTMLElement).classList.add('on');
          drawEggs();
          tap();
          sfx.pop();
        },
      });
      b.innerHTML = `<span class="wthumb"><span class="wt-scene">${pk.scene()}</span><span class="wt-pet">${companionSVG((pk.creatures[0] as { id: string }).id, 0)}</span></span><span class="wname">${pk.name}</span>`;
      return b;
    }));
    drawEggs();
    mount(this.stage,
      h('div', { class: 'scene setup' }, h('h1', {}, 'Pick a friend'), worldRow, eggRow, names, hatch.el),
    );
    void sayPhrase('pick_friend', 'Pick a friend.');
    await hatch.pressed;
    const pack = packById(this.s.theme);
    const kind = (pack.creatures[chosen] as { id: string }).id;
    this.s.companion = { kind, name: names.value.trim() || defaultNameFor(kind) };
    // the egg (or crate, or capsule) wobbles, cracks or pops open; the friend springs out, waves and looks at the button (flow.ts)
    const arrived = pack.arrival === 'egg' ? 'hatched' : 'arrived';
    await hatchScene(this.stage, { packId: pack.id, kind, name: this.s.companion.name, nick, pet: companionEl(this.s, 'big'), arrived });
    tap();

    // placement (band C only)
    if (band === 'C') {
      const items = buildPlacement(seeded(Date.now() & 0xffff));
      const results: boolean[] = [];
      await this.interlude([h('p', { class: 'caption' }, 'Let’s play a quick listening game so I know where to start.')]);
      const ctx = this.ctx();
      // stop at the first miss: scoring never looks past the first failed set, and a beginner should not sit through twelve questions
      for (const it of items) {
        const ok = await placementTrial(ctx, it);
        results.push(ok);
        if (!ok) break;
      }
      const start = scorePlacement(items, results);
      applyPlacement(this.s, start, this.today());
    }
    this.persist();
  }

  // ----- home / island -----
  private async home(): Promise<void> {
    this.inChild = false;
    this.setHint(null);
    const s = this.s;
    const today = this.today();
    const done = s.adventureDays.includes(today);
    const asleep = done || this.overLimit();
    const last = [...Object.entries(s.sounds)].filter(([, r]) => r.introducedOn < today).sort((a, b) => b[1].introducedOn.localeCompare(a[1].introducedOn))[0];
    const name = s.companion?.name ?? 'Dino';

    // Treasures sit on the island in fixed, known places (never random). Each is a sticker of its mnemonic friend.
    // Spots for every collected friend (31 of them), on either side of the companion so none hides behind it: rows from the front
    // (bottom) of the island upwards, filling the inner places first so a small collection looks tidy and balanced.
    const SPOTS: [number, number][] = [];
    for (const y of [82, 72, 62, 52, 42, 32, 22]) for (const dx of [0, 1, 2]) { SPOTS.push([24 - dx * 9, y]); SPOTS.push([76 + dx * 9, y]); }
    const island = h('div', { class: 'island', 'data-testid': 'island' },
      (() => { const a = h('div', { class: 'island-art' }); a.innerHTML = packById(s.theme).island(); return a; })(),
      ...s.collection.slice(0, SPOTS.length).map((id, i) =>
        h('span', { class: 'prize', title: MNEMONICS[id]?.name ?? id, style: `left:${SPOTS[i]![0]}%;top:${SPOTS[i]![1]}%;animation-delay:${(i % 5) * 0.4}s` }, friendEl(id))),
      (() => {
        const pet = h('div', { class: `island-pet${asleep ? ' asleep' : ''}`, 'data-testid': 'island-pet' }, companionEl(s, `big ${asleep ? 'sleepy' : ''}`, 'companion'), asleep ? zsEl() : null);
        // touching the character is the first thing a small child tries: it answers (a wiggle and a pop; a sleepy one gives a snore-wiggle)
        pet.addEventListener('pointerdown', () => { tap(); sfx.pop(); pet.classList.remove('wiggle'); void pet.offsetWidth; pet.classList.add('wiggle'); });
        return pet;
      })(),
      s.collection.length ? null : emptyNest(),
    );
    setNight(asleep);
    const playLabel = s.band === 'B' ? 'Play together' : done ? 'Play again' : 'Play';
    const play = bigButton(`▶ ${playLabel}`, 'play', done ? 'quiet' : 'go'); // once today's adventure is done, "play again" is a quiet option, not a big green invitation
    play.el.setAttribute('aria-label', playLabel);
    play.el.addEventListener('pointerdown', () => sayPhrase(s.band === 'B' ? 'play_together' : done ? 'play_again' : 'play', playLabel));
    const free = bigButton('Free play', 'freeplay', 'quiet');
    // Free Play uses only sounds already met, counts against the daily limit and never adds a new sound, so it is offered from the start
    const hasLearned = Object.keys(s.sounds).length > 0;
    mount(this.stage, 
      h('div', { class: 'scene home' },
        h('p', { class: 'caption', 'data-testid': 'greeting' },
          asleep
            ? `${name} is sleepy. See you tomorrow, ${s.nickname}!`
            : `Hello ${s.nickname}! ${last ? `Yesterday we learned ${slashed(last[0])}.` : `I’m ${name}. Let’s find some sounds!`}`),
        island,
        h('div', { class: 'row' }, play.el, s.band === 'C' && hasLearned && !this.overLimit() ? free.el : null),
      ),
    );
    homeIdle(island.querySelector('.island-pet') as HTMLElement, play.el, asleep); // a slow glance at the Play button now and then (breathing and blinking are CSS)
    const which = await Promise.race([play.pressed.then(() => 'play' as const), free.pressed.then(() => 'free' as const)]);
    if (which === 'free') await this.freePlay();
    else if (s.band === 'B') await this.soundPlay();
    else await this.adventure();
  }

  // ----- the daily adventure (6 steps) -----
  private async adventure(): Promise<void> {
    this.inChild = true;
    const s = this.s;
    const today = this.today();
    setNight(false);
    const plan = startAdventure(s, today, seeded((Date.now() & 0xffff) ^ s.dayOffset));
    this.persist();
    const ctx = this.ctx();

    // 1. Hello
    void sayPhrase('hello', 'Hello!');
    const lastSound = [...Object.entries(s.sounds)].filter(([, r]) => r.introducedOn < today).sort((a, b) => b[1].introducedOn.localeCompare(a[1].introducedOn))[0];
    await this.interlude([
      companionEl(s, 'big'),
      h('p', { class: 'caption' }, `Hello ${s.nickname}! ${lastSound ? `Yesterday: ${slashed(lastSound[0])}.` : ''} Let’s play!`),
    ]);

    // The Feed trials are split into blocks with the oral game between them, so one mechanic never runs for ten rounds in a row
    // (see feedBlocks): warm-up -> story -> early Feed -> oral game -> late Feed -> printed game -> make it real.
    const blocks = feedBlocks(plan, Object.keys(s.sounds).length);

    // 2. Warm-up: earlier sounds the child found hardest
    for (const it of blocks.warm) {
      await roundFeed(ctx, it.g, it.idx);
      this.persist();
    }
    if (this.overLimit()) return this.goodnight(plan);

    // 3. New sound story (a sound-friend introduces the sound), then optional letter tracing
    if (plan.newSound) {
      const m = MNEMONICS[plan.newSound.id];
      saySeq([{ phrase: `story_${plan.newSound.id}`, text: STORY_SAY[plan.newSound.id] ?? '' }, { sound: plan.newSound.phoneme }]);
      await this.interlude([
        h('div', { class: 'story' }, h('span', { class: 'mn' }, friendEl(plan.newSound.id, 'story-friend')), h('span', { class: 'letter-big', 'data-testid': 'newsound' }, plan.newSound.id)),
        h('p', { class: 'caption' }, `${m?.name ?? ''}: ${m?.line ?? ''}`),
        h('button', { class: 'bubble-btn', 'aria-label': `Hear ${slashed(plan.newSound.id)}`, onClick: () => { tap(); blip(plan.newSound!.phoneme); } }, h('span', { class: 'speaker' }, '🔊'), h('span', { class: 'bubble-sound' }, slashed(plan.newSound.id))),
      ], '▶', 'story-next');
      if (plan.trace) await roundTrace(ctx, plan.newSound);
    } else {
      await this.interlude([h('p', { class: 'caption' }, `No new sound today, ${s.nickname}. Let’s make our sounds strong!`)]);
    }

    // 4. Practice: Feed, then one listening game, then the rest of the Feed, then one print/rhyme game (rising difficulty overall)
    // each block ends on its largest payoff: ctx.last marks the final round of a block so the success is a finale (see celebrate)
    const block = async <T,>(items: readonly T[], run: (x: T, i: number) => Promise<unknown>): Promise<void> => {
      for (let i = 0; i < items.length; i++) {
        ctx.last = i === items.length - 1;
        await run(items[i] as T, i);
      }
      ctx.last = false;
    };
    await block(blocks.early, (it) => roundFeed(ctx, it.g, it.idx));
    this.persist();
    if (this.overLimit()) return this.goodnight(plan);

    if (plan.second === 'robot') await block(plan.robotWords, (w, i) => roundRobot(ctx, w, i));
    else if (plan.second === 'drum') await block(plan.drumWords, (w) => roundDrum(ctx, w));
    else if (plan.newSound) await block([plan.newSound], (g) => roundSafari(ctx, g));
    this.persist();
    if (this.overLimit()) return this.goodnight(plan);

    await block(blocks.late, (it) => roundFeed(ctx, it.g, it.idx));
    this.persist();
    if (this.overLimit()) return this.goodnight(plan);

    // the printed-word block is two rounds plus the "make it real" word (three Bridge rounds in all, not four)
    if (plan.third === 'bridge') await block(plan.bridgeWords.slice(0, 2), (w) => roundBridge(ctx, w));
    else if (plan.third === 'kitchen') await block(plan.kitchenWords, (w) => roundKitchen(ctx, w));
    else await block([0, 1], () => roundRhyme(ctx));
    this.persist();

    // 5. Make it real, then ONE end-of-day celebration: the decoded word comes alive, then the chest the child taps (flow.ts)
    let alive: Word | null = null;
    if (plan.makeItReal) {
      const { word, mode } = plan.makeItReal;
      ctx.last = true; // the day's final round is the biggest celebration
      if (mode === 'print') await roundBridge(ctx, word);
      else await roundRobot(ctx, word, 1);
      ctx.last = false;
      alive = word;
    }
    await this.goodnight(plan, alive);
  }

  private async goodnight(plan: Plan, alive: Word | null = null): Promise<void> {
    const s = this.s;
    const today = this.today();
    const prize = plan.newSound?.id ?? plan.review[0]?.id ?? null;
    if (prize && !s.collection.includes(prize)) s.collection.push(prize);
    if (!s.adventureDays.includes(today)) s.adventureDays.push(today);
    this.persist();
    this.inChild = false;
    this.setHint(`Off-screen mission: ${plan.mission.replace(/^Sound hunt: /, '')}`);
    const m = prize ? MNEMONICS[prize] : undefined;
    const shown = bigButton('🌙 Goodnight', 'goodnight', 'go');
    const show = h('button', {
      class: 'btn quiet', 'data-testid': 'show-grownup',
      onClick: async () => {
        for (const g of [plan.newSound, ...plan.review].filter((x): x is NonNullable<typeof x> => !!x)) {
          blip(g.phoneme);
          await sleep(700);
        }
        if (plan.makeItReal) speak(plan.makeItReal.word.text);
      },
    }, 'Show a grown-up');
    // The chest always holds the sound's own friend (known in advance, never random). The child taps it to open it (it also opens by itself
    // after a few seconds, so nobody is ever stuck); the decoded word comes alive first, in the same continuous celebration.
    const card = h('div', { class: 'grownup-card', 'data-testid': 'mission-card' }, h('strong', {}, 'For the grown-up'), plan.mission); // the off-screen mission, in plain sight
    finaleScene(this.stage, {
      pet: companionEl(s, 'big'),
      word: alive ? { text: alive.text, pic: pictureEl(alive.text, alive.emoji ?? '✨') } : null,
      friendId: prize, friendName: m?.name ?? '', phoneme: prize ? phonemeOf(prize) : null,
      goodnight: shown.el, show, card,
    });
    await shown.pressed; // goodnight is a celebration, not a cut-off: the child chooses to close the day
    setNight(true);
    await sleepScene(this.stage, { pet: companionEl(s, 'big sleepy'), caption: 'Zzz… the island is asleep.', label: 'Back to my island', testid: 'sleep-next', icon: '🏝️' });
  }

  // ----- free play (mastered sounds only, up to the parent-set limit) -----
  private async freePlay(): Promise<void> {
    this.inChild = true;
    setNight(false); // free play is daytime, even when the adventure is done
    const s = this.s;
    const ctx = this.ctx();
    const learned = GRAPHEMES.filter((g) => statusOf(s, g.id) !== 'not-started');
    const back = h('button', { class: 'btn quiet', 'data-testid': 'freeplay-back', 'aria-label': 'Back to my island' }, h('span', { class: 'back-ico', 'aria-hidden': 'true' }, '🏝️'), h('span', { class: 'back-lbl' }, ' Back to my island'));
    let leave = false;
    const backed = new Promise<null>((res) => back.addEventListener('click', () => { leave = true; res(null); }));
    this.root.querySelector('.top')?.append(back);
    const race = <T,>(p: Promise<T>) => Promise.race([p, backed]);
    const pictured = bankFor(s.accent).filter((w) => w.emoji);

    const runRound = async (kind: GameKind) => {
      const g = shuffle(learned, ctx.rng)[0]!;
      const decodable = decodableWords(s);
      if (kind === 'feed') await roundFeed(ctx, g, 2);
      else if (kind === 'robot') await roundRobot(ctx, pickWords(pictured, s, g, 1, ctx.rng)[0]!, 1);
      else if (kind === 'drum') await roundDrum(ctx, pickWords(pictured.filter((w) => w.graphemes.length >= 2 && w.graphemes.length <= 4), s, g, 1, ctx.rng)[0]!);
      else if (kind === 'safari') await roundSafari(ctx, shuffle(safariLearned(ctx), ctx.rng)[0] ?? g);
      else if (kind === 'kitchen') await roundKitchen(ctx, pickWords(decodable.filter((w) => w.emoji && w.graphemes.length >= 2), s, g, 1, ctx.rng)[0]!);
      else if (kind === 'bridge') await roundBridge(ctx, pickWords(decodable, s, g, 1, ctx.rng)[0]!);
      else if (kind === 'rhyme') await roundRhyme(ctx);
      else await roundTrace(ctx, g);
    };

    while (!leave && !this.overLimit()) {
      const games = availableGames(ctx, printBlendOpen(s), learned.length > 0);
      const pick = await race(new Promise<GameKind>((resolve) => {
        const grid = doorGrid(games, s.companion?.kind ?? 'rexy', (k) => { tap(); sfx.pop(); resolve(k); });
        mount(this.stage, h('div', { class: 'scene' }, h('p', { class: 'caption' }, 'What shall we play?'), grid));
        doorsHint(grid);
      }));
      if (!pick) break;
      const rounds = Number(new URLSearchParams(location.search).get('fpRounds')) || 3; // (tests use 1)
      for (let i = 0; i < rounds && !leave && !this.overLimit(); i++) {
        await race(runRound(pick));
        this.persist();
      }
    }
    back.remove();
    this.inChild = false;
  }

  // ----- Sound Play: co-play listening game for 2-3 year olds (band B) -----
  private async soundPlay(): Promise<void> {
    this.inChild = true;
    setNight(false);
    const ctx = this.ctx();
    void sayPhrase('find_grownup', 'Find a grown-up to play with you!');
    await this.interlude([companionEl(this.s, 'big'), h('p', { class: 'caption', 'data-testid': 'coplay' }, 'Find a grown-up to play with you!')]);
    // age 2-3: rhythm and naming (no letters, nothing scored); rhyme recognition is a later (3-4) skill
    const pictured = bankFor(this.s.accent).filter((w) => w.emoji && TODDLER_WORDS.includes(w.text));
    const picks = shuffle(pictured, ctx.rng);
    await copyBeat(ctx, 1);
    for (const w of picks.slice(0, 2)) await findIt(ctx, w, pickDistractors(pictured, w, 2, ctx.rng));
    await copyBeat(ctx, 2);
    for (const w of picks.slice(2, 4)) await findIt(ctx, w, pickDistractors(pictured, w, 2, ctx.rng));
    await copyBeat(ctx, 3);
    const prompts = ['Find something in your house that goes “mmm”.', 'Clap the sounds in your name.', 'Find something soft that starts with “sss”.'];
    for (const p of prompts) await this.interlude([h('p', { class: 'caption' }, p), h('p', {}, '(Away from the screen, together!)')]);
    this.setHint(null);
    this.inChild = false;
    if (!this.s.adventureDays.includes(this.today())) this.s.adventureDays.push(this.today()); // so the grown-up's Today and This week show that Sound Play happened
    this.persist();
    setNight(true);
    await sleepScene(this.stage, { pet: companionEl(this.s, 'big sleepy'), caption: 'Goodnight! See you tomorrow.', label: 'Back to my island', testid: 'next', icon: '🏝️' });
  }

  // ----- parent area (behind a gate) -----
  private async openParent(): Promise<void> {
    const wasChild = this.inChild;
    this.inChild = false;
    if (!(await this.gate())) {
      this.inChild = wasChild;
      return;
    }
    await this.parentArea();
    if (this.dirty) location.reload();
    else this.inChild = wasChild;
  }

  private async parentArea(): Promise<void> {
    const s = this.s;
    let tab = 'today';
    let resolve!: () => void;
    const done = new Promise<void>((r) => (resolve = r));
    const overlay = h('div', { class: 'overlay parent', 'data-testid': 'parent' });
    document.body.append(overlay);
    const draw = () => {
      const today = this.today();
      const tabs = ['today', 'week', 'sounds', 'words', 'watch', 'settings'];
      const label: Record<string, string> = { today: 'Today', week: 'This week', sounds: 'Sound map', words: 'Words read', watch: 'Watch out for', settings: 'Settings' };
      const body = h('div', { class: 'pbody' });
      if (tab === 'today') {
        const intro = GRAPHEMES.find((g) => s.sounds[g.id]?.introducedOn === today);
        const done = s.adventureDays.includes(today);
        body.append(
          h('h2', {}, 'Today in 30 seconds'),
          h('p', { 'data-testid': 'today-sound' }, s.band === 'B' ? (done ? 'Sound Play done today: copy the beat and naming pictures (nothing is scored).' : 'No Sound Play yet today.') : done || intro ? `Sound: ${intro ? slashed(intro.id) : 'revision day'} · words read so far: ${wordsRead(s).length}` : 'No adventure played yet today.'),
          h('p', {}, missionFor(intro ?? null)),
          h('p', { class: 'muted' }, `Sets unlocked: ${unlockedSet(s)} of ${MAX_SET} · minutes today: ${Math.round((s.playMs[today] ?? 0) / 60000)}`),
        );
      } else if (tab === 'week') {
        const w = weeklySummary(s, today);
        const dayName = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
        body.append(
          h('h2', {}, 'This week'),
          // played = a filled dot, not played = a faint one (no red, no counting of "missed" days)
          h('div', { class: 'weekbar', 'data-testid': 'weekbar' }, w.perDay.map((d) => {
            const played = d.adventure || (s.playMs[d.date] ?? 0) > 0;
            return h('div', { class: `weekday${played ? ' played' : ''}`, 'data-played': played ? '1' : '0', title: played ? `${d.minutes} min` : 'no play' },
              h('span', { class: 'dot' }), h('span', { class: 'dn' }, dayName(d.date)), h('span', { class: 'dm' }, played ? `${d.minutes} min` : ' '));
          })),
          h('div', { 'data-testid': 'week-lines' }, weekLines(w).map((l) => h('p', {}, l))),
          h('div', {}, ...(w.practising.length
            ? [h('h3', {}, 'Still being learned'), h('div', { class: 'wordlist', 'data-testid': 'week-practising' }, w.practising.map((x) => h('span', { class: 'pill' }, `${slashed(x.id)} · ${x.days} of ${MASTERY_DAYS} days`)))]
            : [])),
          h('h3', {}, 'Away from the screen'),
          h('p', { 'data-testid': 'week-activity' }, weekActivity(w)),
          h('p', { class: 'muted' }, 'These numbers come from the questions inside the app and stay on this device. They are a guide for you, not a test of your child.'),
        );
      } else if (tab === 'sounds') {
        body.append(h('h2', {}, 'Sound map'), h('p', { class: 'muted' }, 'Say the sound, not the letter name (“mmm”, not “muh”). Prototype note: these sounds are machine-generated, not recorded, so please listen to each one. The label under each sound says how it was made.'),
          h('p', {}, h('a', { href: './audio-check.html', target: '_blank', 'data-testid': 'audition-link' }, 'Audition every sound and word (for whoever audits the audio)'), ' · ', h('a', { href: 'https://github.com/Tjw88/Phonics/issues/new?title=Sound%20problem%3A%20', target: '_blank', rel: 'noopener', 'data-testid': 'report-sound' }, 'Report a wrong or unclear sound')),
          h('div', { class: 'map', 'data-testid': 'soundmap' }, GRAPHEMES.map((g) => {
            const st = statusOf(s, g.id);
            const icon = st === 'secure' ? '●' : st === 'learning' ? '◐' : '○';
            return h('div', { class: `mapcell ${st}`, 'data-testid': 'mapcell', 'data-status': st, 'data-id': g.id },
              h('span', { class: 'glyph' }, g.id), h('span', {}, `${icon} ${st === 'not-started' ? 'not started' : st}`),
              this.toolsOn ? h('span', { class: 'muted src', 'data-testid': 'audio-source' }, audioSource(phonemeOf(g.id))) : null,
              h('button', { class: 'btn small', 'aria-label': `hear ${slashed(g.id)}`, onClick: () => blip(phonemeOf(g.id)) }, `🔊 ${slashed(g.id)}`));
          })));
      } else if (tab === 'words') {
        const w = wordsRead(s);
        body.append(h('h2', {}, 'Words my child can read'), h('p', { 'data-testid': 'words-count' }, `${w.length} word${w.length === 1 ? '' : 's'}`),
          h('div', { class: 'wordlist' }, w.map((x) => h('span', { class: 'pill' }, x))),
          h('p', { class: 'muted' }, 'A word appears here after your child blends it correctly first time on two different days.'));
      } else if (tab === 'watch') {
        const st = strugglingSounds(s);
        body.append(h('h2', {}, 'Watch out for'), st.length
          ? h('div', {}, st.map((g) => h('p', {}, `Your child is finding ${slashed(g.id)} tricky. Say it slowly together and play “sound hunt”. If it keeps being hard, mention it to nursery or school.`)))
          : h('p', {}, 'Nothing to flag right now.'));
      } else {
        const sel = h('select', { 'data-testid': 'limit', onChange: (e: Event) => { s.dailyLimitMin = Number((e.target as HTMLSelectElement).value); this.persist(); } },
          [10, 15, 20, 30].map((m) => h('option', { value: String(m), selected: m === s.dailyLimitMin }, `${m} minutes`)));
        const accentSel = h('select', {
          'data-testid': 'accent',
          onChange: (e: Event) => {
            s.accent = (e.target as HTMLSelectElement).value as AccentId;
            this.persist();
            void initAudio(s.accent);
            draw();
          },
        }, ACCENTS.map((a) => h('option', { value: a.id, selected: a.id === s.accent }, a.label)));
        const mute = h('label', {}, h('input', { type: 'checkbox', onChange: (e: Event) => setMuted((e.target as HTMLInputElement).checked) }), ' Mute sound');
        const fast = (days: number, acc: number) => h('button', {
          class: 'btn small', 'data-testid': `ff-${days}`,
          onClick: () => {
            const rng = seeded(Date.now() & 0xffff);
            for (let i = 0; i < days; i++) { s.dayOffset++; playDay(s, this.today(), acc, rng); }
            this.dirty = true; this.persist(); draw();
          },
        }, `Fast-forward ${days} day${days > 1 ? 's' : ''} at ${Math.round(acc * 100)}%`);
        body.append(h('h2', {}, 'Settings'),
          h('label', {}, 'Daily limit ', sel), mute,
          h('label', {}, 'World ', h('select', {
            'data-testid': 'theme',
            onChange: (e: Event) => {
              const id = (e.target as HTMLSelectElement).value;
              s.theme = id;
              if (s.companion) s.companion = { ...s.companion, kind: sameSlotIn(s.companion.kind, id) }; // same friend slot, in the new world
              this.applyTheme();
              this.persist();
              this.dirty = true; // the home screen is redrawn when the grown-up closes this area
              draw();
            },
          }, PACKS.map((pk) => h('option', { value: pk.id, selected: pk.id === s.theme }, `${pk.name}: ${pk.blurb}`)))),
          h('label', {}, 'Accent ', accentSel),
          h('label', { class: 'check' }, h('input', { type: 'checkbox', 'data-testid': 'tracing', checked: s.tracing, onChange: (e: Event) => { s.tracing = (e.target as HTMLInputElement).checked; this.persist(); } }), ' Letter tracing (Trace Trail) in the daily adventure'),
          h('label', {}, 'Sound buttons under words ', h('select', {
            'data-testid': 'soundbuttons',
            onChange: (e: Event) => { s.soundButtons = (e.target as HTMLSelectElement).value as ChildState['soundButtons']; this.persist(); },
          }, h('option', { value: 'auto', selected: s.soundButtons === 'auto' }, 'Fade as my child reads more words'), h('option', { value: 'always', selected: s.soundButtons === 'always' }, 'Always show them'))),
          h('label', { class: 'check' }, h('input', { type: 'checkbox', 'data-testid': 'music', checked: s.musicOn, onChange: (e: Event) => { s.musicOn = (e.target as HTMLInputElement).checked; setMusicOn(s.musicOn); this.persist(); } }), ' Background music'),
          h('p', { class: 'muted', 'data-testid': 'accent-help' }, `${ACCENTS.find((a) => a.id === s.accent)?.note ?? ''} Choose the one that matches how you and your child’s school say the sounds. Your child’s progress is kept when you switch.`),
          h('p', { class: 'muted' }, 'Microphone: off (not implemented in this prototype). Reminders: off.'),
          h('p', { class: 'muted', 'data-testid': 'credits' }, 'Voices: Piper neural text-to-speech. Southern British: Cori Samuel (CC BY 4.0). Northern English: OpenSLR 83 speaker (CC BY-SA 4.0). Machine-generated stand-ins for recordings, not yet reviewed by a phonics specialist.'),
          ...(this.toolsOn ? [
            h('h3', {}, 'Prototype tools'),
            h('p', { class: 'muted' }, 'These move the on-device clock so the three-separate-days mastery gate can be tried without waiting.'),
            h('div', { class: 'row' },
              h('button', { class: 'btn small', 'data-testid': 'skip-day', onClick: () => { s.dayOffset++; this.dirty = true; this.persist(); draw(); } }, 'Skip to tomorrow (no play)'),
              fast(1, 0.9), fast(3, 0.9), fast(7, 0.9))] : []),
          h('div', { class: 'row' }, h('button', { class: 'btn small danger', 'data-testid': 'reset', onClick: () => { if (confirm('Delete all progress on this device?')) { wipe(); this.dirty = true; location.reload(); } } }, 'Delete all progress')));
      }
      overlay.replaceChildren(h('div', { class: 'card wide' },
        h('div', { class: 'row tabs' }, tabs.map((t) => h('button', { class: `btn small${t === tab ? ' on' : ''}`, 'data-testid': `tab-${t}`, onClick: () => { tab = t; draw(); } }, label[t]))),
        body,
        h('div', { class: 'row' }, h('button', { class: 'btn quiet', 'data-testid': 'parent-close', onClick: () => { overlay.remove(); resolve(); } }, 'Back to the game'))));
    };
    draw();
    await done;
  }
}
