# Query backlog

Standing instruction from Tom: **any question I ask that remains unanswered goes in this backlog**, so nothing is lost when a conversation is compacted or moves on. Each entry has the date asked, the context, the options offered, why it matters, and my default if it stays unanswered. Answered items are moved to the bottom with the answer and date. Newest open items first.

## Open

### Q16. Where should the "For the grown-up" mission live on the finale screen? (asked 17 Nov 2026)
- **Context:** the cycle-2 review found the mission card now sits below the fold at 1180x820 (its text edge peeks in) and off-screen at 1024x768. It must be visible to the grown-up, not the centre of the child's celebration.
- **Options:** (a) a small "For the grown-up" corner tab that opens the card; (b) keep it on the screen but compact, directly under the chest and above Goodnight; (c) move it to the parent area only (the Today and This week tabs already show it).
- **My default while open:** the current layout (below the Goodnight button, scrollable).

### Q15. Continue to animation cycle 3 now? (asked 17 Nov 2026)
- **Context:** cycle 2 met the exit criterion by the reviewer's scores, but variety (3.4) and fun (3.9) are still the weakest dimensions; the ranked backlog is in `docs/ANIMATION_SPEC.md` section 9.
- **Options:** (a) yes, run cycle 3 now (hatch follow-through, Safari wrong tap, first-success waits, Rhyme vehicle, home idle in all worlds, Bridge weight, robot body); (b) pause the animation work until a person has watched a few sessions on a real device; (c) something else first (new packs, audio).
- **My recommendation:** (b) for the major remaining items, but do the small ones (hatch wave, Safari wrong tap, the waits) in a short cycle first.
- **My default while open:** none started.

### Q14. Free Play from the start: is the "quiet Play again" right? (asked 17 Nov 2026)
- **Context:** Free Play now appears on the home screen as soon as the child has met one sound, the adventure stays the big green button until it is done, and then "Play again" becomes a quiet button. It counts toward the daily limit and uses only sounds already met.
- **Options:** (a) keep this; (b) also hide "Play again" once the day is done (Free Play only); (c) show the adventure and Free Play as equals.
- **My default while open:** (a).

### Q13. Build the six recommended new theme packs? (asked 17 Nov 2026)
- **Context:** `docs/THEME_PACKS_SPEC.md` recommends Jungle Safari, Robot Workshop, Pirate Cove, Fairy Garden, Music Band and Arctic Friends next (about one artist run each plus the props and reactions system from the animation cycle). Construction, Weather/Seasons, Bakery and Superhero City are second wave.
- **Options:** (a) build all six; (b) build three first (say Jungle, Robot Workshop, Fairy Garden); (c) change the list.
- **My default while open:** none built until the animation cycle's props and reactions are in (they make a pack cheaper and better).

### Q9. Hear the new sounds yourself, or a listening checklist for someone else? (asked 16 Nov 2026, still open)
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

- **Q10: what should the curriculum teach after set 7?** (asked 17 Nov) Answered 17 Nov 2026: **(a) then (b)**: the missing consonants as sets 8-9 (j v w x | y z zz qu), then the remaining vowel sounds as sets 10-12 (igh ar or ur | ow oi ear air | er). Built; `ure` was left out on purpose (in cure/pure it is /jʊə/, not one vowel sound).
- **Q11: what pack options should there be?** (asked 17 Nov) Answered 17 Nov 2026: a full potential spec is in `docs/THEME_PACKS_SPEC.md` (selection criteria, 14 candidate packs with companions, world, arrival, scores and risks, the anatomy of a complete pack, the pack-system upgrades, quality bar and cost). The follow-up decision is Q13.
- **Q12: should Free Play be available before the adventure is done?** (asked 17 Nov) Answered 17 Nov 2026: "I think so? what do you think?"; I recommended yes (it uses only met sounds, counts toward the daily limit, never adds a sound) and built it; the open sub-question is Q14.
- **What next after the digraphs and weekly summary?** (asked 16 Nov) Answered 17 Nov 2026: **(a) vowel digraphs and (c) the goodnight mission card plus a fading-buttons challenge level**, then a full fun-ness and engagement review. Done in set 7, the goodnight "For the grown-up" card and big-reader mode; the review follows the art and theme work.
- **How should I handle the sound-quality problem?** (asked 16 Nov) Answered in discussion: I explained that I have no speech engine of my own; the sounds come from the Piper neural voice, and a human recording remains the real fix.
