// Curriculum data: graphemes (in teaching order), mnemonic cast, and the tagged word bank.
// Order follows the spec's Letters-and-Sounds-style progression (sets 1-5, MVP).

export interface Grapheme {
  id: string; // printed form, e.g. "s", "ck"
  set: number; // 1..5
  phoneme: string; // sound key; graphemes sharing a key share a sound (c/k/ck -> "k")
}

const g = (id: string, set: number, phoneme: string = id): Grapheme => ({ id, set, phoneme });

export const GRAPHEMES: Grapheme[] = [
  g('s', 1), g('a', 1), g('t', 1), g('p', 1),
  g('i', 2), g('n', 2), g('m', 2), g('d', 2),
  g('g', 3), g('o', 3), g('c', 3, 'k'), g('k', 3),
  g('ck', 4, 'k'), g('e', 4), g('u', 4), g('r', 4),
  g('h', 5), g('b', 5), g('f', 5), g('ff', 5, 'f'), g('l', 5), g('ll', 5, 'l'), g('ss', 5, 's'),
  // set 6: the four consonant digraphs (two letters, ONE sound). th is the unvoiced /θ/ of "thin" only: the voiced /ð/ of
  // "this" and "the" is deliberately not taught or used, so one grapheme never has two sounds.
  g('sh', 6), g('ch', 6), g('th', 6), g('ng', 6),
  // set 7: four vowel digraphs, each ONE long vowel sound. oo is the LONG sound of "moon" only: the short sound of "book" is a second
  // sound for the same letters, so it is neither taught nor used (a test keeps book, look, good, foot out of the bank).
  g('ai', 7), g('ee', 7), g('oa', 7), g('oo', 7),
  // sets 8-9: the consonants the first sets left out (j v w x | y z zz qu). x says two sounds (/ks/) and qu says two (/kw/) as ONE letter group,
  // as every programme teaches them; zz is a word-end double of z.
  g('j', 8), g('v', 8), g('w', 8), g('x', 8),
  g('y', 9), g('z', 9), g('zz', 9, 'z'), g('qu', 9),
  // sets 10-12: the remaining vowel sounds. Each is ONE sound: igh /aɪ/, ar /ɑː/, or /ɔː/, ur /ɜː/; ow is /aʊ/ only (cow, not the /əʊ/ of snow), oi /ɔɪ/,
  // ear /ɪə/, air /ɛə/; er shares the sound of ur (her, fern). "ure" is left out on purpose: in cure/pure it is /jʊə/, not one vowel sound.
  g('igh', 10), g('ar', 10), g('or', 10), g('ur', 10),
  g('ow', 11), g('oi', 11), g('ear', 11), g('air', 11),
  g('er', 12, 'ur'),
];

export const MAX_SET = 12;
export const GRAPHEME_BY_ID = new Map(GRAPHEMES.map((x) => [x.id, x]));
export const graphemesInSet = (set: number) => GRAPHEMES.filter((x) => x.set === set);

/** Original mnemonic characters (spec: must not copy any programme's artwork). */
export interface Mnemonic { name: string; emoji: string; line: string }
export const MNEMONICS: Record<string, Mnemonic> = {
  s: { name: 'Sid the snake', emoji: '🐍', line: 'Sid hisses sss.' },
  a: { name: 'Annie the ant', emoji: '🐜', line: 'Annie says a, a, a, as she climbs.' },
  t: { name: 'Tessa the tap', emoji: '🚰', line: 'Tessa drips t, t, t.' },
  p: { name: 'Pip the penguin', emoji: '🐧', line: 'Pip pops p, p, p.' },
  i: { name: 'Iggy the inchworm', emoji: '🐛', line: 'Iggy wriggles i, i, i.' },
  n: { name: 'Nutmeg the nut', emoji: '🥜', line: 'Nutmeg hums nnn.' },
  m: { name: 'Mabel the mouse', emoji: '🐭', line: 'Mabel munches mmm.' },
  d: { name: 'Dot the dino', emoji: '🦕', line: 'Dot beats the drum d, d, d.' },
  g: { name: 'Gus the goat', emoji: '🐐', line: 'Gus gulps g, g, g.' },
  o: { name: 'Ollie the octopus', emoji: '🐙', line: 'Ollie opens wide: o, o, o.' },
  c: { name: 'Cora the cat', emoji: '🐱', line: 'Cora coughs c, c, c.' },
  k: { name: 'Kit the kite', emoji: '🪁', line: 'Kit kicks up k, k, k.' },
  ck: { name: 'Rocky the rock', emoji: '🪨', line: 'Rocky clicks ck at the end.' },
  e: { name: 'Ed the egg', emoji: '🥚', line: 'Ed wobbles e, e, e.' },
  u: { name: 'Uma the umbrella', emoji: '☂️', line: 'Uma goes up: u, u, u.' },
  r: { name: 'Rosie the rabbit', emoji: '🐰', line: 'Rosie races rrr.' },
  h: { name: 'Hattie the hen', emoji: '🐔', line: 'Hattie huffs h, h, h.' },
  b: { name: 'Bo the bug', emoji: '🐞', line: 'Bo bounces b, b, b.' },
  f: { name: 'Fenn the fox', emoji: '🦊', line: 'Fenn flicks fff.' },
  ff: { name: 'Fluffy the cloud', emoji: '☁️', line: 'Fluffy puffs ff at the end.' },
  l: { name: 'Lulu the lamb', emoji: '🐑', line: 'Lulu licks lll.' },
  ll: { name: 'Bella the bell', emoji: '🔔', line: 'Bella rings ll at the end.' },
  ss: { name: 'Moss the hisser', emoji: '🌿', line: 'Moss hisses ss at the end.' },
  sh: { name: 'Shelly the shell', emoji: '🐚', line: 'Shelly whispers shhh.' },
  ch: { name: 'Choo-Choo the train', emoji: '🚂', line: 'Choo-Choo chugs ch, ch, ch.' },
  th: { name: 'Theo the thumb', emoji: '👍', line: 'Theo sticks his tongue out: th, th, th.' },
  ng: { name: 'Gong the gong', emoji: '🎶', line: 'Gong rings out: ng, ng, ng.' },
  ai: { name: 'Rainy the raindrop', emoji: '💧', line: 'Rainy splashes ai, ai, ai in the rain.' },
  ee: { name: 'Bea the bee', emoji: '🐝', line: 'Bea buzzes ee, ee, ee.' },
  oa: { name: 'Boa the boat', emoji: '⛵', line: 'Boa toots oa, oa, oa as she sails.' },
  oo: { name: 'Moony the moon', emoji: '🌙', line: 'Moony sings oo, oo, oo at night.' },
  j: { name: 'Jess the jet', emoji: '🛩️', line: 'Jess zooms j, j, j.' },
  v: { name: 'Vic the van', emoji: '🚐', line: 'Vic vrooms vvv.' },
  w: { name: 'Wiggle the worm', emoji: '🪱', line: 'Wiggle wobbles www.' },
  x: { name: 'Axel the box', emoji: '📦', line: 'Axel clicks ks, ks, ks.' },
  y: { name: 'Yoyo the yak', emoji: '🪀', line: 'Yoyo yips y, y, y.' },
  z: { name: 'Zippy the zebra', emoji: '🦓', line: 'Zippy zooms zzz.' },
  zz: { name: 'Fizzy the fizz', emoji: '🥤', line: 'Fizzy fizzes zz at the end.' },
  qu: { name: 'Queenie the queen', emoji: '👑', line: 'Queenie says qu, qu, qu.' },
  igh: { name: 'Lite the light', emoji: '💡', line: 'Lite shines igh, igh, igh.' },
  ar: { name: 'Starla the star', emoji: '⭐', line: 'Starla says ar, ar, ar.' },
  or: { name: 'Norah the corn', emoji: '🌽', line: 'Norah crunches or, or, or.' },
  ur: { name: 'Furry the fur ball', emoji: '🐾', line: 'Furry purrs ur, ur, ur.' },
  ow: { name: 'Howie the owl', emoji: '🦉', line: 'Howie hoots ow, ow, ow.' },
  oi: { name: 'Coco the coin', emoji: '🪙', line: 'Coco spins oi, oi, oi.' },
  ear: { name: 'Earl the ear', emoji: '👂', line: 'Earl listens: ear, ear, ear.' },
  air: { name: 'Hairy the hairbrush', emoji: '🪮', line: 'Hairy brushes air, air, air.' },
  er: { name: 'Fern the fern', emoji: '🍃', line: 'Fern says er, er, er.' },
};

export interface Word {
  text: string;
  graphemes: string[];
  emoji?: string; // picture for oral games (Robot Talk) and "coming alive"
  dino?: boolean; // fits the Dino Valley theme
  /** Used in oral games only: never shown in print (fails the decodability linter by design). */
  oralOnly?: boolean;
}

// Compact bank: "c-a-t" lists the graphemes explicitly so the linter can verify them.
type Row = [seg: string, emoji?: string, flags?: string];
const rows: Row[] = [
  // VC and set 1-2
  ['a-t'], ['s-a-t'], ['p-a-t'], ['t-a-p', '🚰'], ['s-a-p'],
  ['i-n'], ['i-t'], ['a-n'], ['a-m'], ['a-d'],
  ['s-i-t'], ['s-i-p'], ['t-i-p'], ['t-i-n', '🥫'], ['p-i-n', '📌'], ['p-i-t'],
  ['p-a-n', '🍳'], ['m-a-n', '👨'], ['m-a-p', '🗺️'], ['m-a-t'], ['m-a-d'], ['s-a-d'],
  ['d-a-d'], ['d-i-d'], ['d-i-p'], ['n-a-p'], ['n-i-p'], ['t-a-n'], ['p-a-d'], ['d-a-m'],
  // set 3
  ['d-o-g', '🐶', 'd'], ['d-i-g', undefined, 'd'], ['d-o-t'], ['g-o-t'], ['g-a-p'],
  ['c-a-t', '🐱'], ['c-a-p'], ['c-a-n'], ['c-o-t'], ['k-i-d', '🧒'], ['k-i-t'],
  ['p-i-g', '🐷'], ['p-o-t', '🍲'], ['p-o-p'], ['t-o-p'], ['m-o-p', '🧹'], ['n-o-t'], ['n-o-d'], ['p-o-d'],
  ['o-n'],
  // set 4
  ['r-o-ck', '🪨', 'd'], ['s-o-ck', '🧦'], ['p-a-ck'], ['t-a-ck'], ['n-e-ck'], ['p-e-ck'], ['d-e-ck'],
  ['p-e-n', '🖊️'], ['t-e-n'], ['n-e-t', '🥅'], ['p-e-t'], ['m-e-n'], ['r-e-d'], ['r-u-n'],
  ['r-a-t', '🐀'], ['r-i-p'], ['r-i-d'], ['r-a-m', '🐏'], ['r-u-g'], ['r-u-b'],
  ['s-u-n', '☀️'], ['m-u-d', undefined, 'd'], ['m-u-g', '☕'], ['m-u-m', '👩'], ['c-u-p', '🥤'], ['p-u-p'],
  ['u-p'], ['u-s'], ['c-u-t'], ['n-u-t', '🥜'], ['g-u-m'], ['t-u-g'], ['d-u-g', undefined, 'd'],
  ['e-gg', '🥚', 'od'], // spec lists "egg" as decodable; "gg" is not in sets 1-5, so oral-only
  // set 5
  ['h-a-t', '🎩'], ['h-o-t', undefined, 'd'], ['h-i-t'], ['h-e-n', '🐔'], ['h-u-g'], ['h-u-t'],
  ['b-e-d', '🛏️'], ['b-i-g', undefined, 'd'], ['b-a-g', '👜'], ['b-u-s', '🚌'], ['b-u-g'],
  ['b-u-n'], ['b-a-t', '🦇'], ['b-i-t'], ['b-i-b'],
  ['f-a-n'], ['f-u-n'], ['f-i-t'], ['f-o-g', undefined, 'd'], ['o-ff'], ['p-u-ff'], ['h-u-ff'], ['c-u-ff'],
  ['f-i-ll'], ['f-e-ll'], ['b-e-ll', '🔔'], ['d-o-ll', '🪆'], ['h-i-ll', '⛰️', 'd'], ['p-i-ll'], ['m-i-ll'],
  ['t-e-ll'], ['s-e-ll'], ['b-i-ll'],
  ['l-i-p', '👄'], ['l-a-p'], ['l-e-g'], ['l-o-g', '🪵', 'd'], ['l-e-t'], ['l-i-d'], ['l-i-t'],
  ['m-e-ss'], ['m-i-ss'], ['k-i-ss'], ['h-i-ss'], ['m-o-ss', undefined, 'd'], ['b-o-ss'], ['f-u-ss'], ['l-e-ss'],
  ['p-a-ss'], ['m-a-ss'], // "pass": RP /pɑːs/ (BATH vowel) clashes with the taught /a/, so it is excluded per accent (ACCENT_EXCLUDE)
  // set 6 (digraphs). Left out on purpose: bush/push (a different vowel from the taught /u/), bath/path/maths (BATH vowel), this/that/then/with (voiced th),
  // wing/swing (no w yet).
  ['sh-i-p', '🚢'], ['sh-o-p', '🏪'], ['sh-e-d', '🏚️'], ['sh-e-ll', '🐚'], ['sh-u-t'], ['sh-o-ck'], ['sh-i-n'], ['sh-a-ck'],
  ['f-i-sh', '🐟'], ['d-i-sh', '🍽️'], ['c-a-sh'], ['d-a-sh'], ['r-u-sh'], ['b-a-sh'], ['m-a-sh'], ['h-u-sh'], ['g-u-sh'],
  ['ch-i-p', '🍟'], ['ch-i-ck', '🐥'], ['ch-i-n'], ['ch-o-p'], ['ch-a-t'], ['ch-a-p'], ['ch-e-ss'], ['ch-e-ck'], ['ch-u-g'],
  ['r-i-ch'], ['m-u-ch'], ['s-u-ch'],
  ['th-i-n'], ['th-i-ck'], ['th-u-d'], ['th-u-m-p'], ['th-i-ng'], ['m-o-th', '🦋'],
  ['r-i-ng', '💍'], ['k-i-ng', '🤴'], ['g-o-ng', '🛎️'], ['s-o-ng'], ['s-i-ng'], ['p-i-ng'], ['d-i-ng'], ['b-a-ng'], ['h-a-ng'], ['f-a-ng'],
  ['g-a-ng'], ['h-u-ng'], ['l-u-ng'], ['r-u-ng'], ['s-u-ng'], ['l-o-ng'],
  // set 7 (vowel digraphs). Left out on purpose: the short oo of book/look/good/foot, room/roof/root (said both ways), poo/poop, w/y/z words (not taught),
  // and anything with a silent or different letter pattern. "rain", "pain", "main" etc. are long /ai/ in every accent.
  ['r-ai-n', '🌧️'], ['s-n-ai-l', '🐌'], ['s-ai-l', '⛵'], ['t-r-ai-n', '🚂'], ['n-ai-l', '💅'], ['ch-ai-n'], ['p-ai-n'], ['m-ai-n'], ['g-ai-n'], ['t-ai-l'],
  ['m-ai-l'], ['r-ai-l'], ['f-ai-l'], ['p-ai-n-t'], ['b-ai-t'], ['r-ai-d'], ['m-ai-d'],
  ['b-ee', '🐝'], ['s-ee'], ['t-r-ee', '🌳'], ['f-ee-t', '🦶'], ['s-ee-d'], ['n-ee-d'], ['f-ee-l'], ['k-ee-p'], ['d-ee-p'], ['s-l-ee-p'], ['m-ee-t'],
  ['sh-ee-p', '🐑'], ['ch-ee-k'], ['p-ee-l'], ['s-ee-k'], ['h-ee-l'], ['d-ee-d'],
  ['b-oa-t', '🚤'], ['c-oa-t', '🧥'], ['g-oa-t', '🐐'], ['s-oa-p', '🧼'], ['t-oa-s-t', '🍞'], ['r-oa-d'], ['t-oa-d'], ['f-oa-m'], ['l-oa-f'], ['m-oa-n'], ['g-oa-l'],
  ['l-oa-d'], ['c-oa-ch'], ['f-l-oa-t'], ['c-l-oa-k'], ['m-oa-t'], ['c-oa-l'],
  ['m-oo-n', '🌙'], ['s-p-oo-n', '🥄'], ['b-oo-t', '👢'], ['m-oo'], ['t-oo'], ['b-oo'], ['s-oo-n'], ['n-oo-n'], ['p-oo-l'], ['c-oo-l'], ['t-oo-l'], ['f-oo-d'], ['m-oo-d'],
  ['h-oo-t'], ['t-oo-t'], ['b-oo-m'], ['d-oo-m'], ['l-oo-p'],
  // set 8 (j v w x). "was", "wasp" (not /w ɒ/ as spelled), "with" (voiced th) and "wind" (said two ways) stay out.
  ['j-a-m', '🍓'], ['j-e-t', '🛩️'], ['j-u-g', '🏺'], ['j-o-g'], ['j-u-m-p'], ['j-o-b'], ['j-a-ck'],
  ['v-a-n', '🚐'], ['v-e-t'], ['v-e-s-t', '🦺'], ['v-a-t'], ['v-e-n-t'],
  ['w-e-b', '🕸️'], ['w-i-g', '💇'], ['w-e-t'], ['w-i-n'], ['w-a-g'], ['w-a-x'], ['w-i-sh'], ['w-i-ng', '🪽'], ['s-w-i-ng'], ['w-e-ll'], ['w-i-ck'],
  ['f-o-x', '🦊'], ['b-o-x', '📦'], ['s-i-x'], ['m-i-x'], ['f-i-x'], ['t-a-x'], ['n-e-x-t'], ['o-x'],
  // set 9 (y z zz qu)
  ['y-e-s'], ['y-a-m'], ['y-u-m'], ['y-a-ck'], ['y-e-ll'], ['y-e-t'], ['y-a-p'],
  ['z-i-p', '🤐'], ['z-a-p'], ['z-i-g'], ['z-oo', '🦒'], ['z-oo-m'], ['z-e-s-t'],
  ['b-u-zz'], ['f-i-zz'], ['j-a-zz'], ['f-u-zz'],
  ['qu-i-t'], ['qu-i-z'], ['qu-i-ck'], ['qu-a-ck'], ['qu-ee-n', '👸'], ['qu-i-ll'], ['qu-i-l-t', '🧶'], ['qu-e-s-t'],
  // set 10 (igh ar or ur)
  ['h-igh'], ['s-igh'], ['n-igh-t', '🌃'], ['l-igh-t', '💡'], ['r-igh-t'], ['t-igh-t'], ['m-igh-t'], ['s-igh-t'], ['b-r-igh-t'], ['f-l-igh-t'], ['th-igh'],
  ['c-ar'], ['j-ar', '🫙'], ['b-ar'], ['f-ar'], ['s-t-ar'], ['ar-m', '💪'], ['ar-t'], ['f-ar-m', '🚜'], ['b-ar-n', '🌾'], ['p-ar-k'], ['d-ar-k'], ['sh-ar-k', '🦈'], ['y-ar-d'], ['c-ar-d', '🃏'],
  ['f-or'], ['f-or-k', '🍴'], ['c-or-n', '🌽'], ['h-or-n', '📯'], ['b-or-n'], ['s-t-or-m'], ['s-or-t'], ['sh-or-t'], ['n-or-th'], ['t-or-ch', '🔦'], ['f-or-t'], ['c-or-k'], ['p-or-k'], ['s-p-or-t'],
  ['f-ur'], ['b-ur-n'], ['t-ur-n'], ['h-ur-t'], ['c-ur-l', '🌀'], ['s-ur-f', '🏄'], ['p-ur-r'], ['ch-ur-ch'], ['b-ur-s-t'],
  // set 11 (ow oi ear air)
  ['c-ow'], ['n-ow'], ['h-ow'], ['w-ow'], ['ow-l', '🦉'], ['d-ow-n'], ['t-ow-n'], ['c-l-ow-n', '🤡'], ['b-r-ow-n'], ['c-r-ow-n', '👑'], ['g-r-ow-l'],
  ['oi-l', '🛢️'], ['c-oi-n', '🪙'], ['b-oi-l'], ['s-oi-l'], ['j-oi-n'], ['f-oi-l'], ['t-oi-l'], ['p-oi-n-t'],
  ['ear', '👂'], ['h-ear'], ['n-ear'], ['d-ear'], ['f-ear'], ['g-ear'], ['r-ear'], ['y-ear'], ['c-l-ear'], ['b-ear-d'], ['s-p-ear'],
  ['air', '🌬️'], ['h-air', '💇‍♀️'], ['p-air', '👯'], ['f-air'], ['s-t-air', '🪜'], ['l-air'], ['f-l-air'],
  // set 12 (er: the sound of ur)
  ['h-er'], ['f-er-n', '🍃'], ['t-er-m'], ['h-er-d'], ['v-er-b'], ['k-er-b'], ['p-er-ch'],
];

export const BANK: Word[] = rows.map(([seg, emoji, flags = '']) => ({
  text: seg.split('-').join(''),
  graphemes: seg.split('-'),
  emoji,
  dino: flags.includes('d'),
  oralOnly: flags.includes('o'),
}));

/** Seed list only: needs human review (spec: "unfortunate decodable combinations"). */
export const UNSUITABLE = new Set([
  'ass', 'tit', 'tits', 'dick', 'cock', 'fag', 'sex', 'pee', 'poo', 'bum', 'god', 'cum', 'gun',
  'shit', 'shag', 'chink', 'dong', 'gash',
]);

// ---- Accents -------------------------------------------------------------------------------------------------
// The curriculum (grapheme order, sets, mastery) is the SAME in every accent and progress is keyed by letter, so
// switching accent keeps a child's progress. What changes per accent: the audio pack, and which words are usable
// (a word is excluded when the accent says it with a different vowel from the one the letter teaches).
export type AccentId = 'rp' | 'north';
export interface Accent { id: AccentId; label: string; note: string }
export const ACCENTS: Accent[] = [
  { id: 'rp', label: 'Southern British (RP)', note: '“bus” and “put” have different vowels; “pass” has a long a, so it is left out.' },
  {
    id: 'north', label: 'Northern English',
    note: '“bus” and “put” share the same vowel and “pass” has a short a. Voice is Lancashire; there is no Yorkshire-specific voice yet.',
  },
];
export const DEFAULT_ACCENT: AccentId = 'rp';
/** Words dropped per accent. Must equal the generated audio's `removed_words` (a test enforces it). */
export const ACCENT_EXCLUDE: Record<AccentId, readonly string[]> = { rp: ['pass'], north: [] };
export const bankFor = (accent: AccentId): Word[] => BANK.filter((w) => !ACCENT_EXCLUDE[accent].includes(w.text));

// ---- Sound Safari: things to hunt for by their FIRST sound (listening only; no letters) --------------------------
/**
 * p = initial phoneme key, g = the LETTER the word starts with. A scene is built for a letter (so a "k" scene shows kite and
 * key, never cat, even though cat also starts with the sound /k/): the child is learning that letter.
 */
export interface SafariItem { word: string; emoji: string; p: string; g: string }
const sf = (p: string, items: [string, string][], g?: string): SafariItem[] => items.map(([word, emoji]) => ({ word, emoji, p, g: g ?? word.charAt(0) }));
export const SAFARI: SafariItem[] = [
  ...sf('s', [['sun', '☀️'], ['sock', '🧦'], ['snake', '🐍'], ['star', '⭐'], ['soap', '🧼']]),
  ...sf('a', [['ant', '🐜'], ['apple', '🍎'], ['alligator', '🐊'], ['axe', '🪓']]),
  ...sf('t', [['tap', '🚰'], ['tiger', '🐯'], ['tent', '⛺'], ['turtle', '🐢'], ['tooth', '🦷'], ['train', '🚂']]),
  ...sf('p', [['pig', '🐷'], ['pen', '🖊️'], ['pizza', '🍕'], ['panda', '🐼'], ['parrot', '🦜'], ['pear', '🍐']]),
  ...sf('i', [['igloo', '🛖'], ['ink', '🖋️']]), // (insect and iguana dropped: a picture of "a small creature" cannot say which word)
  ...sf('n', [['nut', '🥜'], ['net', '🥅'], ['nest', '🪺'], ['nose', '👃'], ['nail', '💅']]),
  ...sf('m', [['mouse', '🐭'], ['map', '🗺️'], ['moon', '🌙'], ['mug', '☕'], ['monkey', '🐒'], ['milk', '🥛']]),
  ...sf('d', [['dog', '🐶'], ['drum', '🥁'], ['duck', '🦆'], ['door', '🚪'], ['dolphin', '🐬']]),
  ...sf('g', [['goat', '🐐'], ['grapes', '🍇'], ['gift', '🎁'], ['guitar', '🎸']]), // gorilla dropped: reads as "monkey"
  ...sf('o', [['octopus', '🐙'], ['orange', '🍊']]), // ox (reads as cow) and otter (unfamiliar) dropped
  ...sf('k', [['cat', '🐱'], ['cup', '🥤'], ['cow', '🐄'], ['camel', '🐫'], ['car', '🚗'], ['cake', '🎂'], ['kite', '🪁'], ['key', '🔑'], ['kiwi', '🥝'], ['kangaroo', '🦘']]),
  ...sf('e', [['egg', '🥚'], ['elephant', '🐘'], ['envelope', '✉️']]),
  ...sf('u', [['umbrella', '☂️'], ['up', '⬆️']]),
  ...sf('r', [['rabbit', '🐰'], ['rainbow', '🌈'], ['robot', '🤖'], ['rocket', '🚀'], ['ring', '💍']]), // rose dropped: reads as "flower"
  ...sf('h', [['hat', '🎩'], ['hen', '🐔'], ['horse', '🐴'], ['house', '🏠'], ['hippo', '🦛'], ['heart', '❤️']]),
  ...sf('b', [['bus', '🚌'], ['ball', '⚽'], ['bat', '🦇'], ['bee', '🐝'], ['banana', '🍌'], ['bed', '🛏️']]),
  ...sf('f', [['fish', '🐟'], ['fox', '🦊'], ['frog', '🐸'], ['flower', '🌸'], ['feather', '🪶'], ['fire', '🔥']]),
  ...sf('l', [['lion', '🦁'], ['leaf', '🍃'], ['lemon', '🍋'], ['log', '🪵'], ['lollipop', '🍭']]),
  // digraphs: the scene is built for the DIGRAPH (g = 'sh'), so "ship" is never a target in an s scene even though it starts with the letter s.
  // ng never starts an English word, so it has no Safari scene.
  ...sf('sh', [['ship', '🚢'], ['shell', '🐚'], ['sheep', '🐑'], ['shoe', '👟']], 'sh'),
  ...sf('ch', [['chair', '🪑'], ['cheese', '🧀'], ['chick', '🐥']], 'ch'),
  ...sf('th', [['thumb', '👍'], ['thread', '🧵'], ['thunder', '⛈️']], 'th'),
  // sets 8-9 (x never starts a /ks/ word: xylophone starts with /z/, so it has no scene)
  ...sf('j', [['jet', '🛩️'], ['jam', '🍓'], ['jug', '🏺']]),
  ...sf('v', [['van', '🚐'], ['vest', '🦺']]),
  ...sf('w', [['web', '🕸️'], ['wig', '💇'], ['wing', '🪽']]),
  ...sf('y', [['yak', '🦬'], ['yoyo', '🪀']]),
  ...sf('z', [['zip', '🤐'], ['zoo', '🦒'], ['zebra', '🦓']]),
  ...sf('qu', [['queen', '👸'], ['quilt', '🧶']], 'qu'),
];
/** Safari items dropped per accent when the audio audit found the engine says them with a different first sound. */
export const SAFARI_EXCLUDE: Record<AccentId, readonly string[]> = { rp: [], north: [] };
export const safariFor = (accent: AccentId): SafariItem[] => SAFARI.filter((i) => !SAFARI_EXCLUDE[accent].includes(i.word));

/**
 * Pictures that a child could reasonably mix up (two drinking vessels, two cookware pieces, two big cats). The games never
 * show these together as the answer and a distractor, because the picture, not the child, would be at fault.
 */
export const CONFUSABLE: readonly (readonly [string, string])[] = [['mug', 'cup'], ['pan', 'pot'], ['cat', 'tiger'], ['chick', 'duck'], ['sheep', 'ram'],
  ['boat', 'ship'], ['sail', 'boat'], ['sail', 'ship'], ['goat', 'sheep'], ['rain', 'thunder'],
  ['jar', 'jam'], ['jug', 'jar'], ['jug', 'mug'], ['barn', 'farm'], ['crown', 'queen'], ['owl', 'hen'], ['torch', 'light'], ['coin', 'ring'], ['hair', 'wig'], ['fern', 'leaf']];
export const isConfusable = (a: string, b: string): boolean => CONFUSABLE.some(([x, y]) => (a === x && b === y) || (a === y && b === x));

/**
 * Sounds that are easy to mistake for each other, in a child's ear and especially in a synthetic voice (/θ/ for /f/ is the classic
 * one). They are never offered together as the answer and a distractor in a listen-and-choose game.
 */
export const CLOSE_SOUNDS: readonly (readonly [string, string])[] = [['s', 'sh'], ['t', 'th'], ['f', 'th'], ['sh', 'ch'], ['t', 'ch'], ['n', 'ng'], ['k', 'ng'],
  // a long vowel next to the short one it is built on (a/ai, e/ai, e/ee, i/ee, o/oa, u/oo): easy to blur, especially in a synthetic voice
  ['a', 'ai'], ['e', 'ai'], ['e', 'ee'], ['i', 'ee'], ['o', 'oa'], ['u', 'oo'],
  // voiced / unvoiced and neighbouring consonants (j/ch, v/f, z/s, v/b, qu/k, x/k), and the vowel sounds that blur into each other
  ['j', 'ch'], ['v', 'f'], ['z', 's'], ['v', 'b'], ['qu', 'k'], ['x', 'k'], ['j', 'sh'], ['w', 'y'],
  ['ar', 'or'], ['or', 'ur'], ['ar', 'ur'], ['igh', 'ai'], ['ow', 'oa'], ['ow', 'oi'], ['ear', 'air'], ['air', 'ai'], ['ear', 'ee'], ['or', 'o'], ['ur', 'u'], ['ar', 'a'], ['oi', 'or'], ['igh', 'i'], ['air', 'e']];
export const soundsClose = (a: string, b: string): boolean => CLOSE_SOUNDS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));

/** What a sound-friend SAYS when introduced. Written without letter names on purpose (a voice reading "t" would say "tee");
 *  the real sound is played right after the line. */
export const STORY_SAY: Record<string, string> = {
  s: 'Sid the snake hisses.', a: 'Annie the ant climbs up.', t: 'Tessa the tap drips.', p: 'Pip the penguin pops up.',
  i: 'Iggy the inchworm wriggles.', n: 'Nutmeg the nut hums.', m: 'Mabel the mouse munches.', d: 'Dot the dino beats her drum.',
  g: 'Gus the goat gulps.', o: 'Ollie the octopus opens wide.', c: 'Cora the cat coughs.', k: 'Kit the kite kicks up high.',
  ck: 'Rocky the rock clicks.', e: 'Ed the egg wobbles.', u: 'Uma the umbrella goes up.', r: 'Rosie the rabbit races.',
  h: 'Hattie the hen huffs.', b: 'Bo the bug bounces.', f: 'Fenn the fox flicks his tail.', ff: 'Fluffy the cloud puffs.',
  l: 'Lulu the lamb licks her lips.', ll: 'Bella the bell rings.', ss: 'Moss hisses.',
  sh: 'Shelly the shell whispers.', ch: 'Choo-Choo the train chugs along.', th: 'Theo the thumb sticks his tongue out.', ng: 'Gong the gong rings out.',
  ai: 'Rainy the raindrop splashes down.', ee: 'Bea the bee buzzes by.', oa: 'Boa the boat toots her horn.', oo: 'Moony the moon sings softly.',
  j: 'Jess the jet zooms past.', v: 'Vic the van drives by.', w: 'Wiggle the worm wobbles.', x: 'Axel the box clicks open.',
  y: 'Yoyo the yak yips.', z: 'Zippy the zebra zooms.', zz: 'Fizzy the fizz bubbles up.', qu: 'Queenie the queen speaks.',
  igh: 'Lite the light shines bright.', ar: 'Starla the star twinkles.', or: 'Norah the corn crunches.', ur: 'Furry the fur ball purrs.',
  ow: 'Howie the owl hoots.', oi: 'Coco the coin spins.', ear: 'Earl the ear listens.', air: 'Hairy the hairbrush swishes.', er: 'Fern the fern sways.',
};

/**
 * Sound Play (ages 2-3) is a naming game, so it only uses words a two-year-old is likely to know. Every one has a drawn picture. (A review
 * found it offering "push pin" and "gong" to a toddler.) These are my judgement of common first words, not a researched list.
 */
export const TODDLER_WORDS: readonly string[] = [
  'cat', 'dog', 'pig', 'hen', 'bus', 'sun', 'hat', 'bed', 'bag', 'cup', 'mug', 'fish', 'moon', 'bee', 'tree', 'feet', 'boat', 'coat',
  'train', 'goat', 'sheep', 'rain', 'spoon', 'boot',
];
