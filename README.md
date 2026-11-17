# Soundling: playable prototype

A browser prototype of the Soundling phonics app from `Phonics_app_spec.docx` (spec decision 6c: *prototype the core
loop cheaply*). It is **not** the iOS product. The spec calls for Swift/SwiftUI/SpriteKit, which cannot be built
or run in this Linux environment, so this tests the **learning engine and the daily loop**, not native feel.
The engine (`src/engine`) is plain TypeScript with no DOM, so its logic ports to the spec's Swift module.

```bash
npm install
npm run dev          # play it (iPad-landscape-shaped, works on desktop and touch)
npm test             # unit tests (engine, accents, games, digraphs, weekly summary, theme packs, pictures, sound sweep, audio/curriculum sync)
npm run lint:content # decodability / suitability linter over the word bank
npm run sim          # pacing simulation (synthetic children through the real engine)
npm run build && npx vite preview --port 4173 &  node scripts/e2e.cjs   # browser end-to-end test (needs Playwright; VP=390x844 for phone size)

# regenerate the audio (needs: pip install piper-tts soundfile numpy; optional: faster-whisper for the recogniser check)
npx tsx scripts/export-bank.ts && python3 scripts/audio/gen_neural.py [--asr]
# then open /audio-check.html (add ?accent=north) to audition every sound, word and phrase
node scripts/audit-monkey.cjs   # toddler-style random play in every game (needs Playwright)
```

First launch: parental gate (multiplication), nickname + age band, pick and name a dino, placement game, then the
daily adventure. The parent area (⚙, gated) has Today, This week, Sound map, Words read, Watch out for, Settings, and
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
| Sets 1-5 in spec order, then set 6 (the consonant digraphs sh, ch, th, ng) and set 7 (the vowel digraphs ai, ee, oa, oo), one new sound per day; the next set opens when 3 of 4 sounds are secure and the 4th is carried forward | Built (changed from whole-set gating, see findings) |
| Mastery gate (3 separate days), errorless 1→2→3 choices, spaced review of hardest sounds | Built, with a stricter definition of "right" (≥2 correct and ≥60% that day) |
| Look and feel: drawn original characters, **six theme packs** (Dino Valley, Dragon Castle, Transport Town, Space Station, Ocean Reef, Farm Friends: four companions, a backdrop with day and night, and a home island each; chosen at setup, changeable in Settings; purely cosmetic), chunky buttons, sparkle bursts, game sound effects | Built (see "Look and feel") |
| Companion grows with progress (an accessory per set secured) | Built |
| Accent option (setup step + parent Settings): Southern British (RP) or Northern English | Built; northern pack least verified (see Accents) |
| Audio | Neural-voice generated (not recorded, not listened to), every instruction spoken; see "Audio" |
| Placement game → starting set | Built for sets 1-7, two questions per set, **stops at the first miss**; never grants mastery |
| 6-step daily adventure, goodnight, treasure, off-screen mission | Built |
| All 8 MVP games: Feed the Creature, Robot Talk, Beat the Drum, Sound Safari, Word Kitchen, Bridge Builder, Rhyme Rocket, Trace Trail (optional, parent setting) | Built; Free Play is a menu of all of them |
| Sound-friends: 31 original drawn characters, one per sound | Built |
| Sound buttons (dot / bar), lower case, single-storey "a" typeface (Andika, bundled) | Built; confirmed in screenshots |
| Sound Play for ages 2-3 (co-play, listening and rhythm only) | Built: copy the beat + find-it naming; needs real environmental sounds (see docs/AUDIT.md) |
| Parent area behind a maths gate (a wrong answer locks it for 30 seconds; the prototype fast-forward tools and audio-engineering labels are hidden unless the page is opened once with `?tools=1`): today, **this week** (days played, new and secured sounds, words, what to practise, an off-screen activity), sound map, words read, watch-out flags, daily limit + 2-minute warning (a banner plus a generated voice) | Built |
| No accounts, no third-party requests, data on device only | Built; the e2e test asserts zero external requests |
| Content linter (decodable at point of use, unsuitable words, duplicate pictures) | Built |
| Banned patterns (streaks, guilt, timers, random rewards, upsell in child screens) | None present |

**Not built:** microphone, CloudKit sync, StoreKit, Rive/SpriteKit animation (CSS only), other worlds, iPhone-specific layouts.

## Look and feel

All art is original inline SVG (no images, no third-party code, works offline): four baby-dino companions with
blinking eyes and moods, 31 sound-friends (Sid the snake is bent like an s, Ollie the octopus has a round "o" mouth,
Iggy the inchworm's head is the dot of the i), a robot, rocket, drum, cooking pot, treasure chest, and a calm Dino
Valley backdrop that turns to night when the island sleeps.

| Game | What the child does |
|---|---|
| Feed the Creature | Drag a letter into the dino's mouth (or tap it): it opens wide, gulps with a squash, sparkles. Wrong letter: the dino says "oh" and models the sound |
| Robot Talk | The robot says a word in sounds, lighting one bead per sound (no letters: oral stage); pick the picture |
| Beat the Drum | Tap the drum once per sound in a picture's name; each beat plays the next sound. Wrong count: the sounds are modelled and the child retries |
| Sound Safari | Hunt a scene for things that start with today's sound; a wrong tap just says that word |
| Word Kitchen | **Drag** letter tiles onto the board (you choose the slot) to build the word and cook it; a wrong letter goes back, the right ones stay |
| Bridge Builder | Tap each sound to drop a plank; sounds stay tappable; slide across the letters to blend; pick the word and the dino crosses |
| Rhyme Rocket | **Drag** the rhyming picture into the rocket, which fuels and launches |
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

## Audio: neural voices, still never listened to

Full detail and numbers are in `docs/AUDIT.md`. In short:

- **Voices:** Piper neural text-to-speech. Southern British = Cori (CC BY 4.0); Northern English = an OpenSLR 83 northern male
  speaker (CC BY-SA 4.0; the ShareAlike condition is **not yet checked** against generated audio). Credits in
  `public/audio/CREDITS.txt` and the parent Settings.
- **I cannot hear.** Everything is checked by measurement, spectrograms and a speech recogniser (a rough, biased second opinion), not by
  ear. The old espeak voice scored 8-14/28 words on the recogniser and the new RP voice 17/28, so it is clearly better, but it is
  **still a stand-in for a trained human voice** (the research review found no evidence on synthetic voices for isolated phonemes).
- **Words and phrases** are spoken from phoneme strings *we* supply per accent (so northern "cup" is k-ʊ-p), not the voice's own spelling rules.
- **Isolated sounds** cannot come straight from a neural voice (it produces near-silence for a lone consonant), so each is cut from a
  natural syllable and lengthened: hiss sounds by granular resynthesis, voiced sounds by pitch-synchronous looping of four
  periods, stops kept short. Following the DfE Reading Framework, /p t k/ are burst + breathy release with no voiced vowel, and /b d g/
  keep a small faded vowel because the Framework says they "cannot be heard clearly in isolation" without one.
- **Lengths:** stops ~170 ms (were 70-110), hiss 480 ms, nasals/liquids 430 ms, vowels 520 ms. Sounds in a sequence use shorter takes so blending flows.
- **Every instruction is spoken**, since the children cannot read, and a test fails the build if the code asks for an instruction with no audio.
- **The four digraph sounds (set 6):** /sh/ and /th/ are hiss sounds extended the same way as /s/ and /f/; /ch/ is the voice's own burst plus
  frication (about 180 ms, deliberately short, since a real /ch/ is short); /ng/ is a nasal looped like /m/ and /n/. The checks reject any take
  that is not voiceless and bright (/sh/, /th/, /ch/) or not clearly voiced (/ng/). **The Northern voice cannot produce a voiceless /th/** (60 takes per
  slot all came out as a voiced murmur), so the Northern pack's /th/ is taken from the RP voice: a hiss has no regional vowel in it, but it is a shortcut and the
  manifest says so. In words, a speech recogniser heard several /sh/ and /ch/ words as each other and several /ng/ words as /m/ or /n/ words (e.g. Northern "ping" as "home");
  that recogniser is biased against northern vowels (it understood only 15 of the 134 older words in the Northern pack, against 56% of all words in the RP pack), so treat these as
  "listen to these first", not as proven faults.
- **Known weak points to listen for:** whether /b d g/ carry too much "uh"; whether /p t k/ sound like themselves; whether the
  sustained /m n l r/ are natural; whether /ch/ and /sh/ are clearly different, and whether /th/ is not heard as /f/ (it is never offered next to /f/ or /t/ in a game for that reason). Use `/audio-check.html`.

## Accents

The accent is a setting (chosen at setup, changeable in the parent area). **The curriculum, sound order, mastery
gate and a child's progress are identical in every accent**, so switching keeps progress (tested). What changes:

| | Southern British (RP) | Northern English |
|---|---|---|
| Voice (Piper neural) | `en_GB-cori-medium` | `en_GB-northern_english_male-medium` |
| `a` taught as | /æ/ | /a/ |
| `u` taught as | /ʌ/ ("bus" and "put" differ) | /ʊ/ ("bus" and "put" share a vowel) |
| Words usable | 133 ("pass" is left out: RP says /pɑːs/) | all 134 |

Each accent's expected sounds are written down in `gen_audio.py` and the words are spoken from exactly those phonemes; a test fails if the
manifest and the word list ever disagree. Which words
an accent drops is kept in `ACCENT_EXCLUDE` (`data.ts`) and a test fails if it ever disagrees with the audio.

What is **not** covered, honestly:

- **There is no Yorkshire voice.** The only northern voice available is a northern English male speaker (region not stated). It shares the two features
  that matter most for phonics (bus/put, short a), but other Yorkshire features are not modelled.
- **Scottish is built but switched off.** The engine renders a lone Scots /r/ as silence, and its isolated /i/ comes
  out as /e/ although the same voice says "kit" with /ɪ/. Without a human ear I can't resolve that, so it is held
  back (`python3 scripts/audio/gen_audio.py --all` retries it).
- Other accent features (th-fronting, glottal /t/, h-dropping, vowel length rules) are not modelled, and every accent
  pack still needs a native-speaking phonics specialist to listen to it. The spec notes a regional pack is a
  "meaningful later option"; this is the mechanism for it, not a finished set of regional voices.

## Evidence review and audit

- `docs/RESEARCH.md`: a sourced evidence review (compiled by a research sub-agent; I have not independently re-read the sources) with what it changed in the app and where evidence is weak or absent.
- `docs/AUDIT.md`: the full audit: sounds, a logic review of every game mechanic, and walkthroughs as a 2-, 4- and 5-year-old and as a parent (expert judgement; no child has played this), plus a prioritised backlog.
- **Sound Play (age 2-3)** is now "copy the beat" and "find the ..." (tap only, nothing scored); the old rhyme game was a 3-4 skill and needed dragging.
- **Colour:** vivid companions (brilliant red, electric blue, neon green, sunshine yellow) with glossy eggs. The research found **no solid evidence on saturation**, so this is a design choice; backgrounds stay calm.

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
7. **Content runs out around day 48-57.** With sets 6 and 7 (the digraphs) there are 31 sounds. For a 90%-accurate daily
   player in the simulator the last new sound arrives on day 48 and all 31 are secure on day 57 (95%: day 43 and 48).
   That is about 4.5 new sounds a week, above the spec's 2-4 target for steady daily play. After that the daily
   adventure has nothing new until the next stage (split digraphs, alternative spellings) is built. The "10 CVC words" target is
   reached around day 16 in simulation, which is early enough that it may be too easy to be an informative threshold; that depends on my definition of
   "word read" (first-try correct on 2 different days). A child playing 3 days a week had read 10 words by calendar day 37 and had not
   secured all 31 sounds within 150 days. Simulated children are not real children.
8. **c, k and ck share /k/.** Distractor sets never offer them together, otherwise there would be two right
   answers (tested over 200 random draws per sound).

## Decisions I made that the spec did not

- A set opens the next when **all but one** of its sounds are secure (your decision); a new sound is introduced
  per day, once, even if the day is replayed.
- "Word read" = first-try correct blending on 2 different days.
- Placement can start a child at set 2-6 (two questions per set, stopping at the first miss) but seeds sounds as *learning*, never *secure*. It never asks for a double (ck, ff, ll, ss) or for c / k.
- /th/ is the voiceless sound of "thin" only. The voiced sound of "this" and "the" is not taught and no such word is in the bank (a test enforces it), so one grapheme never has two sounds. Words with the BATH vowel, the foot vowel (bush, push) or a w are left out for the same reason.
- Sounds that are easy to mix up by ear (s/sh, t/th, f/th, sh/ch, t/ch, n/ng, k/ng) are never offered together as answer and distractor in a listening game.
- **Sound Play uses a toddler word list** (24 everyday words, every one pictured) instead of every pictured word, after a review found it offering "push pin" and "gong" to a two-year-old. The list is my judgement of common first words, not a researched list. Printed-word choices use near-neighbour distractors (same first or last sound) so a child cannot guess by length.
- **Sound buttons fade for confident readers.** Once a child has read 8 different words (each on two separate days), Bridge Builder skips the tap-each-sound step and goes straight to blending; the buttons stay faintly visible and tappable as help and come back in full after a wrong pick. The threshold of 8 is a prototype guess with no research behind it; a Settings option keeps the buttons always.
- The goodnight screen now shows the off-screen mission in a labelled "For the grown-up" card (it was behind a lightbulb).
- **Vowel digraphs (set 7):** each is one long vowel. `oo` is the long sound of "moon" only; the short oo of "book" is not taught and none of those words is in the bank (a test enforces it). Placement covers sets 1-7. The /ai/ vowel in running words needed a length mark added to the phoneme string, because the voice squeezed the glide into a short vowel (a recogniser heard sail/tail/pain as cell/tell/pen); /oa/ did not need it.
- The weekly parent summary reports only counts and the app's own graded answers, with no streaks or comparisons, and flags a sound as "worth a little practice" only after at least 4 answers in the week with under half right first time. It says plainly that this is a nudge, not a test result.
- Rewards are deterministic: today's new sound's character, or a review sound on revision days.
- The unsuitable-word list in `data.ts` is a seed list and **needs human review**; the spec requires every word
  to be checked, and a short blacklist does not do that.
- Only words with a drawing appear as pictures (e.g. `dig`, `sit`, `sat` have none and are print-only); Robot Talk and
  Rhyme Rocket only use words that have a picture.

## Open questions this prototype cannot answer

Whether children come back to it, whether the placement and gate thresholds are right for real 3-5 year olds,
and whether the loop teaches reading off-screen (the spec's Gate 2). Those need in-person play-testing with
real recorded sounds.
