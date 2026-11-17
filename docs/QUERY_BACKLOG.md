# Query backlog

Standing instruction from Tom: **any question I ask that remains unanswered goes in this backlog**, so nothing is lost when a conversation is compacted or moves on. Each entry has the date asked, the context, the options offered, why it matters, and my default if it stays unanswered. Answered items are moved to the bottom with the answer and date. Newest open items first.

## Open

### Q9. Hear the new sounds yourself, or a listening checklist for someone else? (asked 16 Nov 2026)
- **Context:** the 8 new sounds (sh, ch, th, ng, ai, ee, oa, oo) and ~120 new words are machine-generated and nobody has heard them. I cannot hear.
- **Options:** (a) you listen via `public/audio-check.html` and tell me what is wrong; (b) I draft a short listening checklist for another adult (a teacher, a parent); (c) neither yet.
- **Why it matters:** the research review found no evidence on synthetic voices for isolated sounds; the recogniser flagged sh/ch confusions, /ng/ words, "thin" and a Northern pack it barely understands.
- **My default while open:** treat every new sound as unverified and say so in the README, AUDIT and credits (done).

### Q8. Start a fresh conversation stream with a transfer summary? (asked 16 Nov 2026)
- **Context:** this session has been compacted at least once and is very long; facts can get misplaced.
- **Options:** (a) yes, I write a transfer summary pack now; (b) carry on.
- **My default while open:** carry on, and keep decisions recorded in the repo docs (README, AUDIT, RESEARCH, this file).

### Q7. Write the audio pipeline up as a skills file? (asked 16 Nov 2026)
- **Context:** the per-accent sound pipeline (cut sounds from carrier syllables, retake loop with measured checks, `--missing` incremental mode, borrowed-voice fallback, spectrogram and recogniser checks) has now been used for two rounds of new sounds.
- **Options:** (a) yes, as a skill file; (b) no.
- **My default while open:** not written; the method is documented in `scripts/audio/gen_neural.py` and the README.

### Q6. Northern voice licence (CC BY-SA 4.0 ShareAlike) (standing, since the audio was generated)
- **Context:** whether generated audio counts as a derivative of the voice model is a legal question nobody has checked; `public/audio/CREDITS.txt` says so.
- **Why it matters:** blocks any public release of the Northern pack. Needs a person with the right expertise; not something I can settle.

### Q5. Real thresholds that no research could set (standing)
- **Context:** the day-pass gate (≥2 correct and ≥60%), 3 days to secure, 3 of 4 sounds to open a set, 8 words read before the sound buttons fade, 4 answers before the weekly summary flags a sound, and the sound lengths are all my judgements.
- **Why it matters:** they decide pace and difficulty. Only play-testing with real children (with consent) can set them.
- **My default while open:** as built; each is documented where it is defined.

## Answered

- **What next after the digraphs and weekly summary?** (asked 16 Nov) Answered 17 Nov 2026: **(a) vowel digraphs and (c) the goodnight mission card plus a fading-buttons challenge level**, then a full fun-ness and engagement review. Done in set 7, the goodnight "For the grown-up" card and big-reader mode; the review follows the art and theme work.
- **How should I handle the sound-quality problem?** (asked 16 Nov) Answered in discussion: I explained that I have no speech engine of my own; the sounds come from the Piper neural voice, and a human recording remains the real fix.
