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
];

export const MAX_SET = 5;
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
  ['c-a-t', '🐱'], ['c-a-p', '🧢'], ['c-a-n'], ['c-o-t'], ['k-i-d', '🧒'], ['k-i-t'],
  ['p-i-g', '🐷'], ['p-o-t', '🍲'], ['p-o-p'], ['t-o-p'], ['m-o-p', '🧹'], ['n-o-t'], ['n-o-d'], ['p-o-d'],
  ['o-n'],
  // set 4
  ['r-o-ck', '🪨', 'd'], ['s-o-ck', '🧦'], ['p-a-ck'], ['t-a-ck'], ['n-e-ck'], ['p-e-ck'], ['d-e-ck'],
  ['p-e-n', '🖊️'], ['t-e-n'], ['n-e-t', '🥅'], ['p-e-t'], ['m-e-n'], ['r-e-d'], ['r-u-n'],
  ['r-a-t', '🐀'], ['r-i-p'], ['r-i-d'], ['r-a-m', '🐏'], ['r-u-g'], ['r-u-b'],
  ['s-u-n', '☀️'], ['m-u-d', undefined, 'd'], ['m-u-g', '☕'], ['m-u-m'], ['c-u-p', '🥤'], ['p-u-p'],
  ['u-p'], ['u-s'], ['c-u-t'], ['n-u-t', '🥜'], ['g-u-m'], ['t-u-g'], ['d-u-g', undefined, 'd'],
  ['e-gg', '🥚', 'od'], // spec lists "egg" as decodable; "gg" is not in sets 1-5, so oral-only
  // set 5
  ['h-a-t', '🎩'], ['h-o-t', '🌋', 'd'], ['h-i-t'], ['h-e-n', '🐔'], ['h-u-g'], ['h-u-t'],
  ['b-e-d', '🛏️'], ['b-i-g', undefined, 'd'], ['b-a-g', '👜'], ['b-u-s', '🚌'], ['b-u-g', '🐞'],
  ['b-u-n'], ['b-a-t', '🦇'], ['b-i-t'], ['b-i-b'],
  ['f-a-n'], ['f-u-n'], ['f-i-t'], ['f-o-g', '🌫️', 'd'], ['o-ff'], ['p-u-ff'], ['h-u-ff'], ['c-u-ff'],
  ['f-i-ll'], ['f-e-ll'], ['b-e-ll', '🔔'], ['d-o-ll', '🪆'], ['h-i-ll', '⛰️', 'd'], ['p-i-ll'], ['m-i-ll'],
  ['t-e-ll'], ['s-e-ll'], ['b-i-ll'],
  ['l-i-p', '👄'], ['l-a-p'], ['l-e-g', '🦵'], ['l-o-g', '🪵', 'd'], ['l-e-t'], ['l-i-d'], ['l-i-t'],
  ['m-e-ss'], ['m-i-ss'], ['k-i-ss'], ['h-i-ss'], ['m-o-ss', '🌿', 'd'], ['b-o-ss'], ['f-u-ss'], ['l-e-ss'],
  ['p-a-ss'], ['m-a-ss'], // "pass": RP /pɑːs/ (BATH vowel) clashes with the taught /a/, so it is excluded per accent (ACCENT_EXCLUDE)
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
