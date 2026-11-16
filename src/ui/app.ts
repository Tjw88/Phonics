import { ACCENTS, GRAPHEMES, MNEMONICS, bankFor, type AccentId, type Word } from '../engine/data';
import { seeded, shuffle } from '../engine/dates';
import { strugglingSounds } from '../engine/review';
import {
  NEW_SOUND_TRIALS, REVIEW_SOUND_TRIALS, applyPlacement, buildFeedTrial, buildPlacement, decodableWords,
  missionFor, phonemeOf, scorePlacement, slashed, startAdventure, type Plan,
} from '../engine/session';
import { playDay } from '../engine/simulate';
import {
  newChild, recordTrial, recordWord, statusOf, unlockedSet, wordsRead, type ChildState,
} from '../engine/state';
import { audioSource, blip, initAudio, praise, sayPhrase, setMuted, speak, tap, unlockAudio } from './audio';
import { bigButton, h, sleep } from './dom';
import {
  bridgeBuilder, companionEl, feedCreature, placementTrial, rhymeRocket, rhymeSets, robotTalk, type Ctx, type TrialResult,
} from './games';
import { clockDay, load, save, wipe } from './storage';

const EGGS = [
  { egg: '🥚', kind: '🦖', label: 'green egg' },
  { egg: '🥚', kind: '🦕', label: 'blue egg' },
  { egg: '🥚', kind: '🐊', label: 'spotty egg' },
  { egg: '🥚', kind: '🐲', label: 'speckled egg' },
];

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
    this.root.replaceChildren(
      h('header', { class: 'top' }, h('span', { class: 'logo' }, 'Soundling'), this.hintBtn, parent),
      this.banner, this.hintCard, this.stage,
    );
    document.addEventListener('pointerdown', unlockAudio, { once: true });
    void initAudio(this.s.accent);
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
    this.stage.replaceChildren(h('div', { class: 'scene' }, ...parts, h('div', { class: 'row' }, b.el)));
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
    this.stage.replaceChildren(
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
    const eggRow = h('div', { class: 'row eggs', 'data-testid': 'eggs' }, EGGS.map((e, i) =>
      h('button', {
        class: `tile egg${i === 0 ? ' on' : ''}`, 'data-testid': 'egg', 'aria-label': e.label,
        onClick: (ev: Event) => {
          chosen = i;
          eggRow.querySelectorAll('.egg').forEach((n) => n.classList.remove('on'));
          (ev.currentTarget as HTMLElement).classList.add('on');
          tap();
        },
      }, e.egg)));
    this.stage.replaceChildren(
      h('div', { class: 'scene setup' }, h('h1', {}, 'Pick an egg'), eggRow, names, hatch.el),
    );
    await hatch.pressed;
    const kind = EGGS[chosen]!.kind;
    this.s.companion = { kind, name: names.value.trim() || 'Dino' };
    praise();
    await this.interlude([h('div', { class: 'companion big hatching' }, kind), h('p', { class: 'caption' }, `${this.s.companion.name} hatched! Hello, ${nick}!`)]);

    // placement (band C only)
    if (band === 'C') {
      const items = buildPlacement(seeded(Date.now() & 0xffff));
      const results: boolean[] = [];
      await this.interlude([h('p', { class: 'caption' }, 'Let’s play a quick listening game so I know where to start.')]);
      const ctx = this.ctx();
      for (const it of items) results.push(await placementTrial(ctx, it));
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

    const island = h('div', { class: 'island', 'data-testid': 'island' },
      s.collection.length
        ? s.collection.map((id) => h('span', { class: 'prize', title: MNEMONICS[id]?.name ?? id }, MNEMONICS[id]?.emoji ?? '⭐'))
        : h('span', { class: 'hint-empty' }, 'Your island is waiting for treasures.'),
    );
    const playLabel = s.band === 'B' ? 'Play together' : done ? 'Play again' : 'Play';
    const play = bigButton(`▶ ${playLabel}`, 'play', 'go');
    play.el.setAttribute('aria-label', playLabel);
    play.el.addEventListener('pointerdown', () => sayPhrase(s.band === 'B' ? 'play_together' : done ? 'play_again' : 'play', playLabel));
    const free = bigButton('Free play', 'freeplay', 'quiet');
    this.stage.replaceChildren(
      h('div', { class: 'scene home' },
        companionEl(s, `big ${asleep ? 'sleepy' : ''}`, 'companion'),
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
    const plan = startAdventure(s, today, seeded((Date.now() & 0xffff) ^ s.dayOffset));
    this.persist();
    const ctx = this.ctx();
    const name = s.companion?.name ?? 'Dino';
    const graded = (id: string, r: TrialResult) => recordTrial(s, id, r, today);

    // 1. Hello
    const lastSound = [...Object.entries(s.sounds)].filter(([, r]) => r.introducedOn < today).sort((a, b) => b[1].introducedOn.localeCompare(a[1].introducedOn))[0];
    await this.interlude([
      companionEl(s, 'big'),
      h('p', { class: 'caption' }, `Hello ${s.nickname}! ${lastSound ? `Yesterday: ${slashed(lastSound[0])}.` : ''} Let’s play!`),
    ]);

    // 2. Warm-up: earlier sounds the child found hardest
    for (const g of plan.review) {
      for (const idx of REVIEW_SOUND_TRIALS) {
        const t = buildFeedTrial(s, g, idx, ctx.rng);
        graded(g.id, await feedCreature(ctx, g, t.options));
        this.persist();
      }
    }
    if (this.overLimit()) return this.goodnight(plan);

    // 3. New sound story
    if (plan.newSound) {
      const m = MNEMONICS[plan.newSound.id];
      blip(plan.newSound.phoneme);
      await this.interlude([
        h('div', { class: 'story' }, h('span', { class: 'mn' }, m?.emoji ?? '⭐'), h('span', { class: 'letter-big', 'data-testid': 'newsound' }, plan.newSound.id)),
        h('p', { class: 'caption' }, `${m?.name ?? ''}: ${m?.line ?? ''}`),
        h('button', { class: 'btn soundbtn', onClick: () => blip(plan.newSound!.phoneme) }, `🔊 ${slashed(plan.newSound.id)}`),
      ], '▶', 'story-next');
    } else {
      await this.interlude([h('p', { class: 'caption' }, `No new sound today, ${s.nickname}. Let’s make our sounds strong!`)]);
    }

    // 4. Practice: three games, rising in difficulty
    if (plan.newSound) {
      for (const idx of NEW_SOUND_TRIALS) {
        const t = buildFeedTrial(s, plan.newSound, idx, ctx.rng);
        graded(plan.newSound.id, await feedCreature(ctx, plan.newSound, t.options));
      }
    } else {
      for (const g of plan.review) {
        for (const idx of [2, 3]) {
          const t = buildFeedTrial(s, g, idx, ctx.rng);
          graded(g.id, await feedCreature(ctx, g, t.options));
        }
      }
    }
    this.persist();
    if (this.overLimit()) return this.goodnight(plan);

    const pictured = bankFor(this.s.accent).filter((w) => w.emoji);
    for (const [i, w] of plan.robotWords.entries()) {
      const others = shuffle(pictured.filter((x) => x.text !== w.text && x.graphemes[0] !== w.graphemes[0]), ctx.rng).slice(0, Math.min(3, i + 1));
      await robotTalk(ctx, w, others);
    }
    if (this.overLimit()) return this.goodnight(plan);

    if (plan.printBlend) {
      const pool = decodableWords(s);
      for (const w of plan.bridgeWords) {
        const others = shuffle(pool.filter((x) => x.text !== w.text), ctx.rng).slice(0, 2);
        const r = await bridgeBuilder(ctx, w, others);
        recordWord(s, w.text, r.firstTryCorrect, today);
      }
    } else {
      const groups = shuffle(rhymeSets(this.s.accent), ctx.rng).slice(0, 2);
      for (const grp of groups) {
        const [a, b] = shuffle(grp, ctx.rng) as [Word, Word];
        const others = shuffle(pictured.filter((x) => !grp.includes(x)), ctx.rng).slice(0, 2);
        await rhymeRocket(ctx, a, b, others);
      }
    }
    this.persist();

    // 5. Make it real: the decoded word comes alive
    if (plan.makeItReal) {
      const { word, mode } = plan.makeItReal;
      if (mode === 'print') {
        const pool = decodableWords(s);
        const others = shuffle(pool.filter((x) => x.text !== word.text), ctx.rng).slice(0, 2);
        const r = await bridgeBuilder(ctx, word, others);
        recordWord(s, word.text, r.firstTryCorrect, today);
      } else {
        const others = shuffle(pictured.filter((x) => x.text !== word.text), ctx.rng).slice(0, 2);
        await robotTalk(ctx, word, others);
      }
      await this.interlude([
        h('div', { class: 'alive-word', 'data-testid': 'alive' }, word.emoji ?? '✨'),
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
    this.stage.replaceChildren(
      h('div', { class: 'scene' },
        h('p', { class: 'caption' }, 'You found a treasure!'),
        h('div', { class: 'treasure', 'data-testid': 'treasure' }, m?.emoji ?? '⭐'),
        h('p', {}, m?.name ?? ''),
        h('div', { class: 'row' }, show, shown.el)),
    );
    praise();
    await shown.pressed; // goodnight is a celebration, not a cut-off: the child chooses to close the day
    await this.interlude([companionEl(s, 'big sleepy'), h('p', { class: 'caption' }, 'Zzz… the island is asleep.')], '🏝️', 'sleep-next');
  }

  // ----- free play (mastered sounds only, up to the parent-set limit) -----
  private async freePlay(): Promise<void> {
    this.inChild = true;
    const s = this.s;
    const ctx = this.ctx();
    const pool = GRAPHEMES.filter((g) => statusOf(s, g.id) !== 'not-started');
    const back = h('button', { class: 'btn quiet', 'data-testid': 'freeplay-back' }, 'Back to my island');
    let leave = false;
    back.addEventListener('click', () => (leave = true));
    this.root.querySelector('.top')?.append(back);
    while (!leave && !this.overLimit()) {
      const g = shuffle(pool, ctx.rng)[0];
      if (!g) break;
      const t = buildFeedTrial(s, g, 2, ctx.rng);
      const run = feedCreature(ctx, g, t.options);
      const r = await Promise.race([run, new Promise<null>((res) => back.addEventListener('click', () => res(null)))]);
      if (r) recordTrial(s, g.id, r, this.today());
      this.persist();
    }
    back.remove();
    this.inChild = false;
  }

  // ----- Sound Play: co-play listening game for 2-3 year olds (band B) -----
  private async soundPlay(): Promise<void> {
    this.inChild = true;
    const ctx = this.ctx();
    await this.interlude([companionEl(this.s, 'big'), h('p', { class: 'caption', 'data-testid': 'coplay' }, 'Find a grown-up to play with you!')]);
    const pictured = bankFor(this.s.accent).filter((w) => w.emoji);
    for (const grp of shuffle(rhymeSets(this.s.accent), ctx.rng).slice(0, 3)) {
      const [a, b] = shuffle(grp, ctx.rng) as [Word, Word];
      await rhymeRocket(ctx, a, b, shuffle(pictured.filter((x) => !grp.includes(x)), ctx.rng).slice(0, 1));
    }
    const prompts = ['Find something in your house that goes “mmm”.', 'Clap the sounds in your name.', 'Find something soft that starts with “sss”.'];
    for (const p of prompts) await this.interlude([h('p', { class: 'caption' }, p), h('p', {}, '(Away from the screen, together!)')]);
    this.setHint(null);
    this.inChild = false;
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
      const tabs = ['today', 'sounds', 'words', 'watch', 'settings'];
      const label: Record<string, string> = { today: 'Today', sounds: 'Sound map', words: 'Words read', watch: 'Watch out for', settings: 'Settings' };
      const body = h('div', { class: 'pbody' });
      if (tab === 'today') {
        const intro = GRAPHEMES.find((g) => s.sounds[g.id]?.introducedOn === today);
        const done = s.adventureDays.includes(today);
        body.append(
          h('h2', {}, 'Today in 30 seconds'),
          h('p', { 'data-testid': 'today-sound' }, done || intro ? `Sound: ${intro ? slashed(intro.id) : 'revision day'} · words read so far: ${wordsRead(s).length}` : 'No adventure played yet today.'),
          h('p', {}, missionFor(intro ?? null)),
          h('p', { class: 'muted' }, `Sets unlocked: ${unlockedSet(s)} of 5 · minutes today: ${Math.round((s.playMs[today] ?? 0) / 60000)}`),
        );
      } else if (tab === 'sounds') {
        body.append(h('h2', {}, 'Sound map'), h('p', { class: 'muted' }, 'Say the sound, not the letter name (“mmm”, not “muh”). Prototype note: these sounds are machine-generated, not recorded, so please listen to each one. The label under each sound says how it was made.'),
          h('p', {}, h('a', { href: './audio-check.html', target: '_blank', 'data-testid': 'audition-link' }, 'Audition every sound and word (for whoever audits the audio)')),
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
          h('p', { class: 'muted', 'data-testid': 'accent-help' }, `${ACCENTS.find((a) => a.id === s.accent)?.note ?? ''} Choose the one that matches how you and your child’s school say the sounds. Your child’s progress is kept when you switch.`),
          h('p', { class: 'muted' }, 'Microphone: off (not implemented in this prototype). Reminders: off.'),
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
