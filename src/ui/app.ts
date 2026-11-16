import { ACCENTS, GRAPHEMES, MAX_SET, MNEMONICS, STORY_SAY, bankFor, type AccentId } from '../engine/data';
import { seeded, shuffle } from '../engine/dates';
import { strugglingSounds } from '../engine/review';
import { weekActivity, weekLines, weeklySummary } from '../engine/summary';
import {
  NEW_SOUND_TRIALS, REVIEW_SOUND_TRIALS, applyPlacement, buildPlacement, decodableWords,
  missionFor, phonemeOf, pickDistractors, pickWords, printBlendOpen, scorePlacement, slashed, startAdventure, type Plan,
} from '../engine/session';
import { playDay } from '../engine/simulate';
import {
  MASTERY_DAYS, newChild, statusOf, unlockedSet, wordsRead, type ChildState,
} from '../engine/state';
import { audioSource, blip, initAudio, praise, sayPhrase, saySeq, setMuted, setMusicOn, sfx, speak, tap, unlockAudio } from './audio';
import { friendEl } from './friends';
import { pictureEl } from './pictures';
import { copyBeat, findIt } from './games2';
import { GAME_LABEL, availableGames, safariLearned, roundBridge, roundDrum, roundFeed, roundKitchen, roundRhyme, roundRobot, roundSafari, roundTrace, type GameKind } from './rounds';
import { DINOS, chestSVG, eggSVG, islandSVG, sceneSVG } from './art';
import { burst, mount, setNight } from './fx';
import { bigButton, h, sleep } from './dom';
import {
  companionEl, placementTrial, type Ctx,
} from './games';
import { clockDay, load, save, wipe } from './storage';


export class App {
  s: ChildState = load();
  private stage: HTMLElement;
  private hintBtn: HTMLButtonElement;
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
    bg.innerHTML = sceneSVG();
    document.body.prepend(bg);
    const logo = h('span', { class: 'logo' });
    logo.innerHTML = `${eggSVG('rexy')}<span>Soundling</span>`;
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
  private async gate(): Promise<boolean> {
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
          h('button', { class: 'btn', 'data-testid': 'gate-option', 'data-n': n, onClick: () => { overlay.remove(); resolve(n === right); } }, String(n)))),
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
        input, h('div', { class: 'row' }, bandBtns),
        h('p', { class: 'caption small' }, 'How do you say your sounds?'),
        h('div', { class: 'row' }, accentBtns), accentNote, go.el),
    );
    await go.pressed;
    nick = input.value.trim() || 'Friend';
    this.s = newChild();
    this.s.nickname = nick;
    this.s.band = band;
    this.s.accent = accent;

    // choose and name a companion
    let chosen = 0;
    const names = h('input', { type: 'text', maxlength: 16, placeholder: 'Name your friend', 'data-testid': 'companion-name', class: 'input' }) as HTMLInputElement;
    const hatch = bigButton('Hatch!', 'hatch');
    const eggRow = h('div', { class: 'row eggs', 'data-testid': 'eggs' }, DINOS.map((d, i) => {
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
      b.innerHTML = eggSVG(d.id);
      return b;
    }));
    mount(this.stage,
      h('div', { class: 'scene setup' }, h('h1', {}, 'Pick an egg'), eggRow, names, hatch.el),
    );
    void sayPhrase('pick_egg', 'Pick an egg.');
    await hatch.pressed;
    const kind = DINOS[chosen]!.id;
    this.s.companion = { kind, name: names.value.trim() || 'Dino' };
    // the egg wobbles, cracks and the dino pops out
    const hatchEgg = h('div', { class: 'hatch-egg' });
    hatchEgg.innerHTML = eggSVG(kind);
    mount(this.stage, h('div', { class: 'scene' }, hatchEgg, h('p', { class: 'caption' }, 'Something is hatching…')));
    sfx.boing();
    await sleep(900);
    sfx.pop();
    burst(hatchEgg, 'confetti', 18);
    praise();
    const hatched = companionEl(this.s, 'big hatching');
    await this.interlude([hatched, h('p', { class: 'caption' }, `${this.s.companion.name} hatched! Hello, ${nick}!`)]);

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
    const SPOTS: [number, number][] = [[14, 62], [28, 72], [44, 78], [60, 76], [76, 70], [88, 60], [22, 52], [38, 60], [54, 62], [70, 58], [82, 48], [10, 44], [92, 74]];
    const island = h('div', { class: 'island', 'data-testid': 'island' },
      (() => { const a = h('div', { class: 'island-art' }); a.innerHTML = islandSVG(); return a; })(),
      ...s.collection.slice(0, SPOTS.length).map((id, i) =>
        h('span', { class: 'prize', title: MNEMONICS[id]?.name ?? id, style: `left:${SPOTS[i]![0]}%;top:${SPOTS[i]![1]}%;animation-delay:${(i % 5) * 0.4}s` }, friendEl(id))),
      h('div', { class: 'island-pet' }, companionEl(s, `big ${asleep ? 'sleepy' : ''}`, 'companion')),
      s.collection.length ? null : h('span', { class: 'hint-empty' }, 'Treasures will appear here.'),
    );
    setNight(asleep);
    const playLabel = s.band === 'B' ? 'Play together' : done ? 'Play again' : 'Play';
    const play = bigButton(`▶ ${playLabel}`, 'play', 'go');
    play.el.setAttribute('aria-label', playLabel);
    play.el.addEventListener('pointerdown', () => sayPhrase(s.band === 'B' ? 'play_together' : done ? 'play_again' : 'play', playLabel));
    const free = bigButton('Free play', 'freeplay', 'quiet');
    mount(this.stage, 
      h('div', { class: 'scene home' },
        h('p', { class: 'caption', 'data-testid': 'greeting' },
          asleep
            ? `${name} is sleepy. See you tomorrow, ${s.nickname}!`
            : `Hello ${s.nickname}! ${last ? `Yesterday we learned ${slashed(last[0])}.` : `I’m ${name}. Let’s find some sounds!`}`),
        island,
        h('div', { class: 'row' }, play.el, done && s.band === 'C' && !this.overLimit() ? free.el : null),
      ),
    );
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
    const name = s.companion?.name ?? 'Dino';

    // 1. Hello
    void sayPhrase('hello', 'Hello!');
    const lastSound = [...Object.entries(s.sounds)].filter(([, r]) => r.introducedOn < today).sort((a, b) => b[1].introducedOn.localeCompare(a[1].introducedOn))[0];
    await this.interlude([
      companionEl(s, 'big'),
      h('p', { class: 'caption' }, `Hello ${s.nickname}! ${lastSound ? `Yesterday: ${slashed(lastSound[0])}.` : ''} Let’s play!`),
    ]);

    // 2. Warm-up: earlier sounds the child found hardest
    for (const g of plan.review) {
      for (const idx of REVIEW_SOUND_TRIALS) {
        await roundFeed(ctx, g, idx);
        this.persist();
      }
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

    // 4. Practice: three games, rising in difficulty (Feed the Creature, then one listening game, then one print/rhyme game)
    if (plan.newSound) {
      for (const idx of NEW_SOUND_TRIALS) await roundFeed(ctx, plan.newSound, idx);
    } else {
      for (const g of plan.review) for (const idx of [2, 3]) await roundFeed(ctx, g, idx);
    }
    this.persist();
    if (this.overLimit()) return this.goodnight(plan);

    if (plan.second === 'robot') for (const [i, w] of plan.robotWords.entries()) await roundRobot(ctx, w, i);
    else if (plan.second === 'drum') for (const w of plan.drumWords) await roundDrum(ctx, w);
    else if (plan.newSound) await roundSafari(ctx, plan.newSound);
    this.persist();
    if (this.overLimit()) return this.goodnight(plan);

    if (plan.third === 'bridge') for (const w of plan.bridgeWords) await roundBridge(ctx, w);
    else if (plan.third === 'kitchen') for (const w of plan.kitchenWords) await roundKitchen(ctx, w);
    else for (let i = 0; i < 2; i++) await roundRhyme(ctx);
    this.persist();

    // 5. Make it real: the decoded word comes alive
    if (plan.makeItReal) {
      const { word, mode } = plan.makeItReal;
      if (mode === 'print') await roundBridge(ctx, word);
      else await roundRobot(ctx, word, 1);
      const aliveEl = h('div', { class: 'alive-word', 'data-testid': 'alive' }, h('span', { class: 'alive-rays' }), h('span', { class: 'alive-pic' }, pictureEl(word.text, word.emoji ?? '✨')));
      setTimeout(() => { burst(aliveEl, 'confetti', 20); sfx.sparkle(); speak(word.text); }, 350);
      await this.interlude([
        aliveEl,
        h('p', { class: 'caption' }, `${word.text}!${name ? ` ${name} cheers.` : ''}`),
      ], '▶', 'alive-next');
    }

    // 6. Treasure and goodnight
    await this.goodnight(plan);
  }

  private async goodnight(plan: Plan): Promise<void> {
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
    // The chest always holds the sound's own friend (known in advance, never random). It opens by itself, so there is nothing to miss.
    const chest = h('div', { class: 'chest' });
    chest.innerHTML = chestSVG();
    const prizeEl = h('div', { class: 'treasure', 'data-testid': 'treasure' }, prize ? friendEl(prize) : '⭐');
    mount(this.stage,
      h('div', { class: 'scene' },
        h('p', { class: 'caption' }, 'You found a treasure!'),
        h('div', { class: 'chest-wrap' }, chest, prizeEl),
        h('p', { class: 'treasure-name' }, m?.name ?? ''),
        h('div', { class: 'row' }, show, shown.el)),
    );
    void sayPhrase('treasure', 'You found a treasure!');
    setTimeout(() => { chest.classList.add('open'); sfx.chest(); burst(prizeEl, 'stars', 16); praise(); }, 900);
    await shown.pressed; // goodnight is a celebration, not a cut-off: the child chooses to close the day
    setNight(true);
    await this.interlude([companionEl(s, 'big sleepy'), h('p', { class: 'caption' }, 'Zzz… the island is asleep.')], '🏝️', 'sleep-next');
  }

  // ----- free play (mastered sounds only, up to the parent-set limit) -----
  private async freePlay(): Promise<void> {
    this.inChild = true;
    setNight(false); // free play is daytime, even when the adventure is done
    const s = this.s;
    const ctx = this.ctx();
    const learned = GRAPHEMES.filter((g) => statusOf(s, g.id) !== 'not-started');
    const back = h('button', { class: 'btn quiet', 'data-testid': 'freeplay-back' }, 'Back to my island');
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
        mount(this.stage, h('div', { class: 'scene' },
          h('p', { class: 'caption' }, 'What shall we play?'),
          h('div', { class: 'gamegrid', 'data-testid': 'gamegrid' }, games.map((k) =>
            h('button', { class: 'gamebtn', 'data-testid': `fp-${k}`, 'aria-label': GAME_LABEL[k].name, onClick: () => { tap(); sfx.pop(); resolve(k); } },
              h('span', { class: 'gicon' }, GAME_LABEL[k].icon), h('span', { class: 'gname' }, GAME_LABEL[k].name))))));
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
    const pictured = bankFor(this.s.accent).filter((w) => w.emoji && w.graphemes.length >= 2);
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
    setNight(true);
    await this.interlude([companionEl(this.s, 'big sleepy'), h('p', { class: 'caption' }, 'Goodnight! See you tomorrow.')], '🏝️');
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
          h('p', { 'data-testid': 'today-sound' }, done || intro ? `Sound: ${intro ? slashed(intro.id) : 'revision day'} · words read so far: ${wordsRead(s).length}` : 'No adventure played yet today.'),
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
              h('span', { class: 'muted src', 'data-testid': 'audio-source' }, audioSource(phonemeOf(g.id))),
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
          h('label', {}, 'Accent ', accentSel),
          h('label', { class: 'check' }, h('input', { type: 'checkbox', 'data-testid': 'tracing', checked: s.tracing, onChange: (e: Event) => { s.tracing = (e.target as HTMLInputElement).checked; this.persist(); } }), ' Letter tracing (Trace Trail) in the daily adventure'),
          h('label', { class: 'check' }, h('input', { type: 'checkbox', 'data-testid': 'music', checked: s.musicOn, onChange: (e: Event) => { s.musicOn = (e.target as HTMLInputElement).checked; setMusicOn(s.musicOn); this.persist(); } }), ' Background music'),
          h('p', { class: 'muted', 'data-testid': 'accent-help' }, `${ACCENTS.find((a) => a.id === s.accent)?.note ?? ''} Choose the one that matches how you and your child’s school say the sounds. Your child’s progress is kept when you switch.`),
          h('p', { class: 'muted' }, 'Microphone: off (not implemented in this prototype). Reminders: off.'),
          h('p', { class: 'muted', 'data-testid': 'credits' }, 'Voices: Piper neural text-to-speech. Southern British: Cori Samuel (CC BY 4.0). Northern English: OpenSLR 83 speaker (CC BY-SA 4.0). Machine-generated stand-ins for recordings, not yet reviewed by a phonics specialist.'),
          h('h3', {}, 'Prototype tools'),
          h('p', { class: 'muted' }, 'These move the on-device clock so the three-separate-days mastery gate can be tried without waiting.'),
          h('div', { class: 'row' },
            h('button', { class: 'btn small', 'data-testid': 'skip-day', onClick: () => { s.dayOffset++; this.dirty = true; this.persist(); draw(); } }, 'Skip to tomorrow (no play)'),
            fast(1, 0.9), fast(3, 0.9), fast(7, 0.9)),
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
