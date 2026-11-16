# Soundling: playable prototype

A browser prototype of the Soundling phonics app from `Phonics_app_spec.docx` (spec decision 6c: *prototype the core
loop cheaply*). It is **not** the iOS product. The spec calls for Swift/SwiftUI/SpriteKit, which cannot be built
or run in this Linux environment, so this tests the **learning engine and the daily loop**, not native feel.
The engine (`src/engine`) is plain TypeScript with no DOM, so its logic ports to the spec's Swift module.

```bash
npm install
npm run dev          # play it (iPad-landscape-shaped, works on desktop and touch)
npm test             # 54 tests (engine, accents, games, pictures, audio/curriculum sync)
npm run lint:content # decodability / suitability linter over the word bank
npm run sim          # pacing simulation (synthetic children through the real engine)
npm run build && npx vite preview --port 4173 &  node scripts/e2e.cjs   # browser end-to-end test (needs Playwright; VP=390x844 for phone size)

# regenerate the audio (needs: pip install espeakng-loader numpy)
npx tsx scripts/export-bank.ts && python3 scripts/audio/gen_audio.py
# then open /audio-check.html (add ?accent=north) to audition every sound, word and phrase
```

First launch: parental gate (multiplication), nickname + age band, pick and name a dino, placement game, then the
daily adventure. The parent area (⚙, gated) has Today, Sound map, Words read, Watch out for, Settings, and
**Prototype tools** to skip days or fast-forward simulated play, which is the only way to see the
"three separate days" mastery gate without waiting three real days.

## Hosting (GitHub Pages)

`.github/workflows/pages.yml` runs the tests, builds, and publishes the site on every push. One-time setup:
**repo Settings → Pages → Build and deployment → Source: "GitHub Actions"**. The site then lives at
`https://<owner>.github.io/Phonics/` (the exact URL is shown on that Settings page and in the workflow run).

Things to know: Pages sites are **public on the internet** (on a private repo too, unless the organisation has
GitHub Enterprise); the site carries `noindex` and a `robots.txt` that disallows crawlers, but that only asks
search engines not to list it. The audio is machine-generated and unreviewed, so treat the link as a prototype
to share with known people, not something to publicise. The workflow triggers on pushes to
`claude/new-session-djz0vn` and `main`; if you rename the default branch, edit the `branches:` line.

## What is built (against the spec)

| Spec item | Status |
|---|---|
| Sets 1-5 in spec order, one new sound per day; the next set opens when 3 of 4 sounds are secure and the 4th is carried forward | Built (changed from whole-set gating, see findings) |
| Mastery gate (3 separate days), errorless 1→2→3 choices, spaced review of hardest sounds | Built, with a stricter definition of "right" (≥2 correct and ≥60% that day) |
| Look and feel: drawn original characters (4 baby dinos, robot, rocket, chest), living Dino Valley backdrop with night mode, chunky buttons, sparkle bursts, game sound effects | Built (see "Look and feel") |
| Companion grows with progress (an accessory per set secured) | Built |
| Accent option (setup step + parent Settings): Southern British (RP) or Northern English | Built; Scottish held back (see Accents) |
| Audio | Generated, not recorded, see below |
| Placement game → starting set | Built (sets 1-3 only; never grants mastery) |
| 6-step daily adventure, goodnight, treasure, off-screen mission | Built |
| All 8 MVP games: Feed the Creature, Robot Talk, Beat the Drum, Sound Safari, Word Kitchen, Bridge Builder, Rhyme Rocket, Trace Trail (optional, parent setting) | Built; Free Play is a menu of all of them |
| Sound-friends: 23 original drawn characters, one per sound | Built |
| Sound buttons (dot / bar), lower case, single-storey "a" typeface (Andika, bundled) | Built; confirmed in screenshots |
| Sound Play for ages 2-3 (co-play, listening only) | Minimal version |
| Parent area behind gate, sound map, words read, watch-out flags, daily limit + 2-minute warning (banner plus browser speech, not a recorded voice) | Built |
| No accounts, no third-party requests, data on device only | Built; the e2e test asserts zero external requests |
| Content linter (decodable at point of use, unsuitable words, duplicate pictures) | Built |
| Banned patterns (streaks, guilt, timers, random rewards, upsell in child screens) | None present |

**Not built:** microphone, CloudKit sync, StoreKit, Rive/SpriteKit animation (CSS only), other worlds, iPhone-specific layouts.

## Look and feel

All art is original inline SVG (no images, no third-party code, works offline): four baby-dino companions with
blinking eyes and moods, 23 sound-friends (Sid the snake is bent like an s, Ollie the octopus has a round "o" mouth,
Iggy the inchworm's head is the dot of the i), a robot, rocket, drum, cooking pot, treasure chest, and a calm Dino
Valley backdrop that turns to night when the island sleeps.

| Game | What the child does |
|---|---|
| Feed the Creature | Drag a letter into the dino's mouth (or tap it): it opens wide, gulps with a squash, sparkles. Wrong letter: the dino says "oh" and models the sound |
| Robot Talk | The robot says a word in sounds, lighting one bead per sound (no letters: oral stage); pick the picture |
| Beat the Drum | Tap the drum once per sound in a picture's name; each beat plays the next sound. Wrong count: the sounds are modelled and the child retries |
| Sound Safari | Hunt a scene for things that start with today's sound; a wrong tap just says that word |
| Word Kitchen | Tap letter tiles in order to build the word and cook it; a wrong letter goes back, the right ones stay |
| Bridge Builder | Each sound button drops a plank; the right word sends the dino across |
| Rhyme Rocket | The right rhyme fuels the rocket, which launches |
| Trace Trail | Trace the letter from the green start dot; it only counts in order, so start and direction matter. **Off by default** (schools teach different formations); turn it on in the parent Settings |

The adventure rotates the games without randomness: Feed the Creature, then Safari / Robot / Drum in turn, then
Bridge / Kitchen (or Rhyme Rocket before printed words open). Free Play is a menu of every game.

Other rules kept: celebrations are under 3 seconds and end on any tap, sparkles and backdrop motion stop under
Reduce Motion (tested), the treasure chest always holds the sound's own friend (never random).

What this is **not**: I can only judge how it looks in screenshots and that it behaves correctly; **whether it is
fun is for you and real children to say**. Not
measured: performance on a real iPad. Letter-formation paths follow a common convention and need a phonics
specialist's review.

## Picture cards

All 101 pictures the games show (Robot Talk, Rhyme Rocket, Beat the Drum, Sound Safari, Word Kitchen, the
"word comes alive" moment) are original flat-style SVG illustrations in `src/ui/pictures.ts`, replacing the emoji.
Animals have simple eyes; objects have none (faces belong to the sound-friends). Tests check that every pictured
word has a drawing, that none is orphaned, and that no two words share one.

**A picture must say exactly one word**, so I removed pictures that couldn't, rather than drawing them anyway.
The words stay in the app for print; they just have no picture:

- bank: *bug* (ladybird? beetle?), *cap* (next to *hat*), *leg*, *hot*, *fog*, *moss*
- Safari: *insect* and *iguana* ("a small creature"), *ox* (reads as cow), *gorilla* (reads as monkey),
  *otter* (unfamiliar), *rose* (reads as flower). *igloo* was added for /i/.

Look-alikes that remain are listed in `CONFUSABLE` (*mug/cup*, *pan/pot*, *cat/tiger*): the games never show a
look-alike of the answer as a distractor (tested over hundreds of random draws). *rat* and *mouse* never meet
because only one is in each game's word list. Drawings were checked by eye on contact sheets, not by children.

## Sound effects and music

All synthesised in the browser: soft bell chimes that climb a pentatonic scale with each correct answer in a row
(deterministic; a miss quietly resets it), a gentle "boop-boop" for a wrong answer (never a buzzer), distinct
effects for chomping, planks, drum, launch, chest, and so on, through a small soft "room". Calm background music
(a fixed pattern, no randomness) ducks under any speech or sound and slows to a lullaby when the island sleeps; it
has its own switch in the parent Settings. **Nobody has listened to any of this yet**, and whether the music helps
or distracts a child learning sounds is a real question for play-testing (it is on by default because the spec
asks for it; switch it off if it gets in the way).

## Audio: generated, never listened to

The spec requires recordings by trained voice talent and bans text-to-speech for phonics. You asked for generated
audio instead, so this prototype generates it, but two things need saying plainly:

- **I do not have a speech engine and cannot hear audio.** I drove an open-source synthesiser (espeak-ng, via
  the `espeakng-loader` wheel, British RP voice) and checked the results with measurements. Nobody has listened
  to these files yet.
- **espeak-ng is not built to speak isolated sounds.** My first pass produced letter *names* ("ess", "eye", "gee")
  and silence, and my first audit let both through. What it does now, and what is and isn't verified:

| Sounds | How they are made | What was checked (no ear involved) |
|---|---|---|
| a i o e u, s f h, p t k | espeak-ng phoneme input | The engine's own phoneme trace must equal the taught sound (e.g. `a` → æ, `u` → ʌ); duration; voicing; not silent |
| m n l r, b d g | My own small source-filter synthesiser (`scripts/audio/formant.py`), because espeak renders a lone /b d g/ as pure silence and /m n l r/ as ~40 ms | Formant estimate (LPC) lands within 20% of textbook values; burst energy in the expected band. **This confirms the code does what I told it, not that it sounds like /m/.** |
| 133 words | espeak-ng text-to-speech, RP voice | The engine's phoneme trace for each word must equal the sounds the grapheme table teaches; 133/133 match. "pass" was dropped because RP says /pɑːs/, not the taught /a/ |
| 66 extra Sound Safari words | espeak-ng text-to-speech | The engine's phoneme trace must START with the right first sound in that accent (all pass in both packs) |
| 21 fixed phrases | espeak-ng | Duration only |

Known weak points to listen for: stops are clipped bursts (~70-110 ms), so /p/ /t/ /k/ may sound faint or clicky;
/b/ /d/ /g/ carry a short voiced release (a touch of "uh" is likely); the formant nasals and liquids are buzzy.
**Open `/audio-check.html`** (also linked from the parent Sound map) to hear everything with its audit data and mark
each item Good / Bad / Unsure, then export the marks as JSON. The spec's rule stands: *a wrong sound is the most
damaging defect*, so nothing here should reach a child before a phonics specialist has heard every sound.
The child's nickname cannot be pre-rendered, so it is never spoken; captions carry it.

## Accents

The accent is a setting (chosen at setup, changeable in the parent area). **The curriculum, sound order, mastery
gate and a child's progress are identical in every accent**, so switching keeps progress (tested). What changes:

| | Southern British (RP) | Northern English |
|---|---|---|
| Voice (espeak-ng) | `en-GB-x-rp` | `en-GB-x-gbclan` (Lancashire) |
| `a` taught as | /æ/ | /a/ |
| `u` taught as | /ʌ/ ("bus" and "put" differ) | /ʊ/ ("bus" and "put" share a vowel) |
| Words usable | 133 ("pass" is left out: RP says /pɑːs/) | all 134 |

Each accent's expected sounds are written down in `gen_audio.py` and **every clip and word is checked against them
using the engine's own phoneme trace**; a pack with a mismatch fails the build rather than shipping. Which words
an accent drops is kept in `ACCENT_EXCLUDE` (`data.ts`) and a test fails if it ever disagrees with the audio.

What is **not** covered, honestly:

- **There is no Yorkshire voice.** The only northern voice the engine has is Lancashire. It shares the two features
  that matter most for phonics (bus/put, short a), but other Yorkshire features are not modelled.
- **Scottish is built but switched off.** The engine renders a lone Scots /r/ as silence, and its isolated /i/ comes
  out as /e/ although the same voice says "kit" with /ɪ/. Without a human ear I can't resolve that, so it is held
  back (`python3 scripts/audio/gen_audio.py --all` retries it).
- **West Midlands was rejected:** its voice drops /h/ ("hill" → /ɪl/), which would teach /h/ wrongly.
- Other accent features (th-fronting, glottal /t/, h-dropping, vowel length rules) are not modelled, and every accent
  pack still needs a native-speaking phonics specialist to listen to it. The spec notes a regional pack is a
  "meaningful later option"; this is the mechanism for it, not a finished set of regional voices.

## Findings: where the spec's own rules disagree or underperform

Pacing numbers come from `npm run sim`: a synthetic child whose trials are independent with a fixed first-try
accuracy. Real children are not like that, so read these as relative comparisons, not forecasts.

1. **The mastery gate, read literally, cannot tell guessing from knowing.** The spec says a sound is secure when
   the child "gets it right in at least three separate sessions on different days". If one correct tap
   counts, a child guessing at chance (33%) secured set 1 by a median of day 9, against day 6 for a 90% child.
   Prototype fix (`DAY_PASS` in `state.ts`, a decision to confirm): a day counts only with ≥2 graded first-try
   correct answers and ≥60% of that day's graded answers. After it, a 33% guesser never secures set 1 in 40 days;
   45% takes ~25 days; 65% ~11; 90% ~6.
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
6. **Whole-set gating was a stall risk** (one stubborn sound held back all new content). Now decided and built: the
   next set opens at 3 of 4 secure, and the 4th is carried forward (still reviewed, can still become secure). 2 of 4
   is not enough. Tested.
7. **MVP content is short.** For a 90%-accurate daily player the last new sound arrives around day 30 and all 23
   are secure around day 37; after that the daily adventure has nothing new until stage 4 ships. That is
   over 4 sounds a week, above the spec's 2-4 target for steady daily play. The "10 CVC words within 6-8 weeks"
   target is reached in about 3 weeks in simulation (about 6 weeks at 3 days a week), so it looks too easy to be an
   informative threshold. That depends on my definition of "word read" (first-try correct on 2 different days).
8. **c, k and ck share /k/.** Distractor sets never offer them together, otherwise there would be two right
   answers (tested over 200 random draws per sound).

## Decisions I made that the spec did not

- A set opens the next when **all but one** of its sounds are secure (your decision); a new sound is introduced
  per day, once, even if the day is replayed.
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
