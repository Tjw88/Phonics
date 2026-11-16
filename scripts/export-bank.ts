// Writes the word bank + grapheme table as JSON for the Python audio generator (single source of truth: data.ts).
import { writeFileSync } from 'node:fs';
import { BANK, GRAPHEMES, SAFARI } from '../src/engine/data';

writeFileSync(
  new URL('./audio/bank.json', import.meta.url),
  JSON.stringify({ safari: SAFARI.map(({ word, p }) => ({ word, p })), graphemes: GRAPHEMES, words: BANK.map(({ text, graphemes, oralOnly }) => ({ text, graphemes, oralOnly: !!oralOnly })) }, null, 1),
);
console.log(`exported ${BANK.length} words`);
