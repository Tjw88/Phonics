// One "round" of each game: builds the trial from the child's state, runs the game, and records the result.
// The adventure and Free Play both use these, so a game behaves identically wherever it is played.
import { bankFor, isConfusable, type Grapheme, type Word } from '../engine/data';
import { shuffle } from '../engine/dates';
import { buildFeedTrial, buildKitchenTiles, buildSafari, decodableWords, phonemeOf, pickDistractors } from '../engine/session';
import { recordTrial, recordWord } from '../engine/state';
import { bridgeBuilder, feedCreature, rhymeRocket, rhymeSets, robotTalk, type Ctx, type TrialResult } from './games';
import { beatDrum, soundSafari, traceTrail, wordKitchen } from './games2';

export type GameKind = 'feed' | 'robot' | 'drum' | 'safari' | 'kitchen' | 'bridge' | 'rhyme' | 'trace';
export const GAME_LABEL: Record<GameKind, { icon: string; name: string }> = {
  feed: { icon: '🦕', name: 'Feed the Creature' },
  robot: { icon: '🤖', name: 'Robot Talk' },
  drum: { icon: '🥁', name: 'Beat the Drum' },
  safari: { icon: '🔭', name: 'Sound Safari' },
  kitchen: { icon: '🍲', name: 'Word Kitchen' },
  bridge: { icon: '🌉', name: 'Bridge Builder' },
  rhyme: { icon: '🚀', name: 'Rhyme Rocket' },
  trace: { icon: '✏️', name: 'Trace Trail' },
};

const pictured = (ctx: Ctx): Word[] => bankFor(ctx.s.accent).filter((w) => w.emoji);

export const roundFeed = async (ctx: Ctx, g: Grapheme, trialIndex: number): Promise<TrialResult> => {
  const t = buildFeedTrial(ctx.s, g, trialIndex, ctx.rng);
  const r = await feedCreature(ctx, g, t.options);
  recordTrial(ctx.s, g.id, r, ctx.today);
  return r;
};

export const roundRobot = (ctx: Ctx, w: Word, i: number): Promise<TrialResult> => {
  return robotTalk(ctx, w, pickDistractors(pictured(ctx), w, Math.min(3, i + 1), ctx.rng));
};

export const roundDrum = (ctx: Ctx, w: Word): Promise<TrialResult> => beatDrum(ctx, w);

export const roundSafari = (ctx: Ctx, g: Grapheme): Promise<TrialResult> =>
  soundSafari(ctx, g, buildSafari(ctx.s, phonemeOf(g.id), ctx.rng));

export const roundKitchen = (ctx: Ctx, w: Word): Promise<TrialResult> =>
  wordKitchen(ctx, w, buildKitchenTiles(ctx.s, w, ctx.rng));

export const roundBridge = async (ctx: Ctx, w: Word): Promise<TrialResult> => {
  const others = shuffle(decodableWords(ctx.s).filter((x) => x.text !== w.text), ctx.rng).slice(0, 2);
  const r = await bridgeBuilder(ctx, w, others);
  recordWord(ctx.s, w.text, r.firstTryCorrect, ctx.today);
  return r;
};

export const roundRhyme = (ctx: Ctx): Promise<TrialResult> => {
  const [grp] = shuffle(rhymeSets(ctx.s.accent), ctx.rng);
  const [a, b] = shuffle(grp as Word[], ctx.rng) as [Word, Word];
  const others = shuffle(pictured(ctx).filter((x) => !(grp as Word[]).includes(x) && !(grp as Word[]).some((g) => isConfusable(g.text, x.text))), ctx.rng).slice(0, 2);
  return rhymeRocket(ctx, a, b, others);
};

export const roundTrace = (ctx: Ctx, g: Grapheme): Promise<TrialResult> => traceTrail(ctx, g);

/** Which games a child can play right now (Free Play menu): print games wait until printed blending is open. */
export const availableGames = (ctx: Ctx, printBlend: boolean, hasSounds: boolean): GameKind[] => {
  const g: GameKind[] = ['robot', 'drum', 'rhyme'];
  if (hasSounds) g.unshift('feed', 'safari');
  if (printBlend && decodableWords(ctx.s).some((w) => w.emoji && w.graphemes.length >= 2)) g.push('kitchen');
  if (printBlend) g.push('bridge');
  if (hasSounds) g.push('trace');
  return g;
};
