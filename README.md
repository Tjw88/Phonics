# Soundling: playable prototype

A browser prototype of the Soundling phonics app from `Phonics_app_spec.docx` (spec decision 6c: *prototype the core
loop cheaply*). It is **not** the iOS product. The spec calls for Swift/SwiftUI/SpriteKit, which cannot be built
or run in this Linux environment, so this tests the **learning engine and the daily loop**, not native feel.
The engine (`src/engine`) is plain TypeScript with no DOM, so its logic ports to the spec's Swift module.

```bash
npm install
npm run dev          # play it (iPad-landscape-shaped, works on desktop and touch)
npm test             # 24 engine tests
npm run lint:content # decodability / suitability linter over the word bank
npm run sim          # pacing simulation (synthetic children through the real engine)
npm run build && npx vite preview --port 4173 &  node scripts/e2e.cjs   # browser end-to-end test (needs Playwright)
```

First launch: parental gate (multiplication), nickname + age band, pick and name a dino, placement game, then the
daily adventure. The parent area (⚙, gated) has Today, Sound map, Words read, Watch out for, Settings, and
**Prototype tools** to skip days or fast-forward simulated play, which is the only way to see the
"three separate days" mastery gate without waiting three real days.

## What is built (against the spec)

| Spec item | Status |
|---|---|
| Sets 1-5 in spec order, one new sound per day, set unlocks when the whole set is secure | Built |
| Mastery gate (3 separate days), errorless 1→2→3 choices, spaced review of hardest sounds | Built, with a changed definition of "right" (see findings) |
| Placement game → starting set | Built (sets 1-3 only; never grants mastery) |
| 6-step daily adventure, goodnight, treasure, off-screen mission | Built |
| Games: Robot Talk, Feed the Creature, Bridge Builder, Rhyme Rocket | Built (4 of the 8 MVP games) |
| Sound buttons (dot / bar), lower case, single-storey "a" typeface (Andika, bundled) | Built; confirmed in screenshots |
| Sound Play for ages 2-3 (co-play, listening only) | Minimal version |
| Parent area behind gate, sound map, words read, watch-out flags, daily limit + 2-minute warning (banner plus browser speech, not a recorded voice) | Built |
| No accounts, no third-party requests, data on device only | Built; the e2e test asserts zero external requests |
| Content linter (decodable at point of use, unsuitable words, duplicate pictures) | Built |
| Banned patterns (streaks, guilt, timers, random rewards, upsell in child screens) | None present |

**Not built:** Beat the Drum, Sound Safari, Word Kitchen, Trace Trail, microphone, CloudKit sync, StoreKit,
Rive/SpriteKit animation (CSS only), other worlds, Free Play is a simple loop, no iPhone-specific layouts.

## Placeholder audio: the biggest gap

The spec's most important rule is *pure sounds from trained voices; no text-to-speech for phonics*. This prototype
cannot honour it: each sound is a **tone** with the sound printed on screen (`/s/`), and only whole words use
browser speech. **Do not judge the teaching by how it sounds.** A child cannot learn /s/ from a beep.

## Findings: where the spec's own rules disagree or underperform

Pacing numbers come from `npm run sim`: a synthetic child whose trials are independent with a fixed first-try
accuracy. Real children are not like that, so read these as relative comparisons, not forecasts.

1. **The mastery gate, read literally, cannot tell guessing from knowing.** The spec says a sound is secure when
   the child "gets it right in at least three separate sessions on different days". If one correct tap
   counts, a child guessing at chance (33%) secured set 1 by a median of day 9, against day 6 for a 90% child.
   Prototype fix (`DAY_PASS` in `state.ts`, a decision to confirm): a day counts only with ≥2 graded first-try
   correct answers and ≥60% of that day's graded answers. After it, a 33% guesser never secures set 1 in 40 days;
   45% takes ~26 days; 65% ~11; 90% ~6.
2. **Spaced review and the 3-day gate pull against each other.** My first scheduler (expanding Leitner intervals)
   pushed learned-but-not-yet-secure sounds out of review for days, so set 1 took ~22 days even for a 95%
   child. Fix: sounds not yet secure are always eligible for review; the schedule only binds once secure.
3. **"Make it real" every session conflicts with "blending starts once set 1 is secure".** On day 1 there is
   one letter, so no printed word exists. Resolution here: oral Make-it-real (picture comes alive after robot
   sounds, no letters) until set 1 is secure, then printed words.
4. **The spec's own example "egg" is not decodable.** `gg` is not in sets 1-5. Kept as an oral-only word; the
   linter rejects it for print (there is a test). Separately, a naive `e-g-g` segmentation would have passed
   as two /g/ sounds, which is the kind of error the linter is there to catch.
5. **Day-1 sound cannot earn a mastery day on day 1**, because with only one letter known there is nothing to
   choose between, and one-choice trials are not graded.
6. **Whole-set gating is a stall risk.** One stubborn sound holds the entire set (and all new content) back.
   The spec gives no escape hatch; I did not add one. It needs a decision (e.g. open the next set once 3 of 4
   are secure, or carry a hard sound forward).
7. **MVP content is short.** For a 90%-accurate daily player the last new sound arrives around day 34 and all 23
   are secure around day 41; after that the daily adventure has nothing new until stage 4 ships. Their rate is
   ~4 sounds a week, the top of the spec's 2-4 target. The "10 CVC words within 6-8 weeks" target is reached in
   about 3-4 weeks in simulation (6 weeks at 3 days a week), so it looks too easy to be an informative
   threshold. That depends on my definition of "word read" (first-try correct on 2 different days).
8. **c, k and ck share /k/.** Distractor sets never offer them together, otherwise there would be two right
   answers (tested over 200 random draws per sound).

## Decisions I made that the spec did not

- A set unlocks when **every** sound in it is secure; a new sound is introduced per day, once, even if the day
  is replayed.
- "Word read" = first-try correct blending on 2 different days.
- Placement can start a child at set 2-4 but seeds sounds as *learning*, never *secure*.
- Rewards are deterministic: today's new sound's character, or a review sound on revision days.
- The unsuitable-word list in `data.ts` is a seed list and **needs human review**; the spec requires every word
  to be checked, and a short blacklist does not do that.
- Pictures are emoji, so only some words have one (e.g. `dig`, `sit`, `sat` have none and are print-only);
  Robot Talk and Rhyme Rocket only use words that have a picture. Real art is needed.

## Open questions this prototype cannot answer

Whether children come back to it, whether the placement and gate thresholds are right for real 3-5 year olds,
and whether the loop teaches reading off-screen (the spec's Gate 2). Those need in-person play-testing with
real recorded sounds.
