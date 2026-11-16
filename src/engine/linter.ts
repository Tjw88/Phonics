import { BANK, GRAPHEME_BY_ID, MAX_SET, UNSUITABLE, type Word } from './data';

export interface LintIssue { word: string; kind: 'segmentation' | 'unknown-grapheme' | 'not-taught' | 'unsuitable' | 'duplicate-picture'; detail: string }

/** Highest set a word needs before it is fully decodable (Infinity if a grapheme is unknown). */
export const wordLevel = (w: Word): number =>
  Math.max(...w.graphemes.map((id) => GRAPHEME_BY_ID.get(id)?.set ?? Infinity));

/** Can this word be sounded out using only the taught graphemes? */
export const isDecodable = (w: Word, taught: ReadonlySet<string>): boolean =>
  !w.oralOnly && !UNSUITABLE.has(w.text) && w.graphemes.every((id) => taught.has(id));

/**
 * Lint a word for PRINT use at a given point in the curriculum.
 * `taught` is the set of grapheme ids taught so far (use `idsUpToSet`).
 */
export const lintWord = (w: Word, taught: ReadonlySet<string>): LintIssue[] => {
  const issues: LintIssue[] = [];
  if (w.graphemes.join('') !== w.text)
    issues.push({ word: w.text, kind: 'segmentation', detail: `graphemes ${w.graphemes.join('-')} do not spell "${w.text}"` });
  for (const id of w.graphemes) {
    if (!GRAPHEME_BY_ID.has(id))
      issues.push({ word: w.text, kind: 'unknown-grapheme', detail: `"${id}" is not in the curriculum` });
    else if (!taught.has(id))
      issues.push({ word: w.text, kind: 'not-taught', detail: `"${id}" (set ${GRAPHEME_BY_ID.get(id)!.set}) is not taught yet` });
  }
  if (UNSUITABLE.has(w.text)) issues.push({ word: w.text, kind: 'unsuitable', detail: 'on the unsuitable-word list' });
  return issues;
};

export const idsUpToSet = (set: number): Set<string> =>
  new Set([...GRAPHEME_BY_ID.values()].filter((g) => g.set <= set).map((g) => g.id));

/** Lint the whole bank: every print-eligible word must be decodable by the end of set `maxSet`. */
export const lintBank = (bank: readonly Word[] = BANK, maxSet = MAX_SET): LintIssue[] => {
  const taught = idsUpToSet(maxSet);
  const issues: LintIssue[] = [];
  const seen = new Set<string>();
  const pictures = new Map<string, string>();
  for (const w of bank) {
    // Two words sharing a picture would make an oral-blending round ambiguous (two "right" pictures).
    if (w.emoji) {
      const clash = pictures.get(w.emoji);
      if (clash) issues.push({ word: w.text, kind: 'duplicate-picture', detail: `${w.emoji} is also used by "${clash}"` });
      else pictures.set(w.emoji, w.text);
    }
    if (seen.has(w.text)) issues.push({ word: w.text, kind: 'segmentation', detail: 'duplicate word' });
    seen.add(w.text);
    if (w.oralOnly) {
      if (UNSUITABLE.has(w.text)) issues.push({ word: w.text, kind: 'unsuitable', detail: 'on the unsuitable-word list' });
      continue;
    }
    issues.push(...lintWord(w, taught));
  }
  return issues;
};
