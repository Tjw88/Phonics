# Game audit: sounds, mechanics, and walkthroughs by age and role (16 Nov 2026)

## How this was done, and what it is not

**Measured or tested (automated):** 75 unit tests; a browser end-to-end run that plays every game to completion with real
pointer drags (including wrong answers and retries); a "toddler" monkey test (random taps and drags for up to 15 s per game, plus the adventure screens, hunting
crashes and tap targets under 64 px: `scripts/audit-monkey.cjs`); a sound sweep (every isolated sound's length and loudness in
both accents, and a check that every spoken instruction exists as audio); spectrograms of every isolated sound; and an
independent speech recogniser as a second opinion on intelligibility.

**Judged (not measured):** the walkthroughs as a 2-, 4- and 5-year-old and as a parent. These are my expert-heuristic judgements
informed by `docs/RESEARCH.md` and general early-years practice. **No child has played this.** Where I cite a developmental
expectation I say how sure I am; real play-testing with consent should overrule any of it.

**Boy and girl:** I did not review separately by sex. I found no evidence on sex-specific design for early phonics (it was not
in the research review) and individual variation is large, so predicting preferences by sex would be guesswork dressed as
insight. What I checked instead is that nothing is gender-coded and that the pictures show a range of people (see 3.4).

---

## 1. Sounds: full sweep

### What was wrong
You reported voices that sounded robotic and sounds too short to be useful. The measurements agree:

| | Before (espeak-ng + hand-built synth) | Now (neural voice, cut from syllables) |
|---|---|---|
| Stops /p t k b d g/ | 71-85 ms | **~170 ms** (/p t k/ burst + breathy release, no voiced vowel; /b d g/ burst + small faded vowel) |
| Hiss sounds /s f h/ | 180-280 ms | **480 ms** |
| Nasals and liquids /m n l r/ | ~380 ms, buzzy, loop seams | **430 ms**, smooth (seams removed) |
| Vowels | 270-330 ms | **520 ms** |
| Voice | espeak formant synth (robotic) | Piper neural voices: Cori (RP), northern English male |

### How it was checked, honestly
- **Spectrograms** of the original 18 sounds were read for structure: hiss spectra for /s f h/, steady harmonic bands for /m n l r/ and vowels,
  breathy noise with no voiced harmonics for /p t k/. This caught real defects: loop seams every ~100 ms in /m l r/ (would
  have sounded like a stutter), /n/ containing part of the vowel, and one /m/ take that came out only 70 ms (caught by the sweep test).
- **A speech recogniser** (Whisper base.en, on "The word is X.") as a *calibrated* second opinion. On the same 28 words it understood
  **8-14/28 for the old espeak voice and 17/28 for the new RP voice**. Across the whole word bank: 74/133 (56%) RP. It is biased
  on short vowels (it hears "pin" as "pen") so a miss means "listen to this one", not "wrong".
- **Northern pack:** the recogniser understood only 20/134 northern words, but understood normal northern *sentences* nearly
  perfectly, so this mostly reflects the recogniser's trouble with isolated northern words. Still, **this pack is the least
  verified** and needs a northern speaker's ear before anyone trusts it.
- **Not checked by anyone's ears.** I cannot hear. Whether /b/ /d/ /g/ carry too much "uh", whether /p t k/ sound like /p t k/, and
  whether the sustained /m n l r/ sound natural are open questions for `public/audio-check.html`.

### The four digraph sounds (set 6), added later
/sh/ and /th/ are hiss sounds extended like /s/ and /f/ (480 ms); /ch/ is the voice's own burst plus frication, about 180 ms (a real /ch/ is
short, so it is not stretched); /ng/ is a nasal looped like /m/ (430 ms). I read their spectrograms: /sh/ shows its energy band around 2-4 kHz
(lower than /s/), /th/ a flat broadband hiss, /ch/ a burst then a 2-4 kHz band, /ng/ the harmonic bands of a voiced nasal. Every take must also pass
measurements (voiceless and bright for /sh/ /th/ /ch/; clearly voiced for /ng/; /th/ centroid above 3.5 kHz).
- **The Northern voice cannot make a voiceless /th/.** All 60 takes per slot came out as a voiced murmur (low-pitched, harmonic), so the Northern pack's /th/ is the
  **RP voice's hiss** (the manifest says so). A hiss carries no regional vowel, but it is a shortcut, and the two voices were not matched.
- **Speech-recogniser second opinion on the new words:** RP: 29 of 51 new words understood (57%, in line with the 56% for the older words). Northern: 14 of 51
  (the recogniser understood only 15 of the 134 older Northern words, so it says very little about that pack). Specific things to listen for:
  several /sh/ words heard as /ch/ words and the reverse (ship, chip, chin, shin), "thin" heard as "ten", and /ng/ words heard as /m/ or /n/ words in the Northern pack (ping, bang, hang, gang).
  The recogniser is biased, so these are **listening priorities, not confirmed faults**. **Nobody has heard any of the new sounds.**

### Fluid sequences
Sounds played in a row (robot, drum, sliding to blend) now use shorter takes of the same sound with a gap sized to each clip
(~300 ms cap + 70 ms), instead of a fixed slow beat. A new bug I introduced here (stopping a sound before starting it) was
caught by the browser run and fixed.

### Instructions were unspoken (a significant find)
Looking at the screens as a non-reader: **most instructions were text only**, which the spec forbids. Every game now speaks its
instruction ("I'm hungry for" then the real sound; "Find things that start with the sound"; "Beat the drum once for each sound";
"Build the word"; "Which one rhymes?"; and so on), as do the sound-friend introductions. Those lines are written without letter
names on purpose (a voice reading "t" would say "tee"), then the real sound plays. A test fails the build if any spoken
instruction in the code lacks audio.

### Still true
Everything is machine-generated. The research review says validated programmes expect human pronunciation and found no evidence
on how long a modelled sound should be, so our lengths are a judgement. The northern voice's CC BY-SA licence has a ShareAlike
condition that nobody has checked against generated audio (see `public/audio/CREDITS.txt`).

---

## 2. Mechanics: logic review of every game

"Checked" lists what was tested. Defects are things that really did not work.

| Game | Checked | Defects found | Status | Verdict / next idea |
|---|---|---|---|---|
| **Feed the Creature** (sound to letter) | exactly one right answer (c/k/ck never offered together, 200 random draws per sound); errorless 1 then 2 then 3 choices; wrong drop; drag; tap fallback | tap-only, so it was a button not a gesture; the carried letter hid the dino's face; same game four times in a row | drag is now primary: eyes follow the finger, mouth opens as it nears, chew, gulp, jump; ghost hand; carried letter shrinks near the mouth; tap works after 3 taps or with the parent setting | Four identical trials feel repetitive: vary the presentation (open) |
| **Robot Talk** (oral blending) | beads not letters; distractors never share a first sound or look alike; wrong pick models the sounds again | sound gaps were slow and choppy | fluid sequence timing | Oral blending is a Reception skill (Development Matters): hard for many 3-year-olds. Offer 2 choices and a slower first sequence (open) |
| **Beat the Drum** (segmenting) | one beat per sound ("ck" is one); wrong count is modelled; retry | the tick button is abstract for small children | the drum now checks itself after a ~2.4 s pause (the tick still works); an early check just models the sounds again | A more physical finish (dropping each bead into the picture) would still be better (open) |
| **Sound Safari** (initial sounds) | targets only start with the taught letter; one decoy per other sound; no look-alikes | **matched by sound, so a "K" scene accepted *cat***; static grid is not very "safari" | fixed: matched by the letter; 4 tests incl. your exact case; added kiwi, kangaroo | Make it a hunt: items hiding in foliage that rustle, a binocular lens to drag around (open) |
| **Word Kitchen** (spelling) | tray always contains the word's letters and only unambiguous decoys; duplicate letters; digraph tile; wrong letter returns, right stay | tiles were tap-only | drag onto the board; the child chooses the slot (nearest empty slot to the drop) | "Customer orders" spoken as a story would add meaning (open) |
| **Bridge Builder** (blending) | order enforced; plank per sound; word choice; crossing | **after tapping all sounds you could not tap them again**; a wrong pick reset everything | sounds stay tappable in any order; wrong pick no longer resets; **slide your finger across the letters to blend** (gesture) | Fade the sound buttons for stronger readers (open) |
| **Rhyme Rocket** | rhyme groups by shared ending spelling; distractors never rhyme | tap-only; rhymes are decided by spelling, which will give false rhymes as the word bank grows | drag the picture into the rocket | Move to pronunciation-based rhymes before adding words (open) |
| **Trace Trail** | all 27 sounds have strokes (a digraph is traced as its two letters); strokes only count in order from the start dot; tiny "i dot" | **crashed if you touched the board after finishing** | fixed + guarded | Stroke paths follow one common convention; school formation may differ; needs specialist review (open) |
| **Placement** | 2 items per set, sets 1-6; never grants mastery; never asks for a double (ck ff ll ss) or c/k, never offers a sound-alike | the list was built up front, so a beginner who missed the first question still sat through all of it | now **stops at the first miss**; extended from sets 1-3 to 1-6 | A child who knows digraphs but not (say) the exact letter shapes of set 4 will start earlier than ideal; it is a quick screen, not an assessment |
| **Sound Play (age 2-3)** | tap only; no letters; nothing scored | **its only game was Rhyme Rocket**: rhyme awareness is a 3-4 skill, and it needed dragging | replaced by "copy the beat" (3 rounds, with a gentle replay if the child pauses) and "find the ..." naming (4 rounds) | Needs real animal/environment sounds (the spec's "tuning in"), which need audio assets (open) |
| **Free Play** | menu of all 8; 3 rounds each; back button always visible; time limit | none | unchanged | |
| **Adventure flow** | rotation without randomness; celebrations under 3 s and skippable; Reduce Motion | **instructions unspoken** (see above) | fixed | |

**Monkey test:** see the results table at the bottom of this file (and note the script builds a child with sets 1-3 secure, so every game is offered).

---

## 3. Walkthroughs

### 3.1 As a 2-year-old (Sound Play, with a grown-up)
*Developmental expectations (moderate confidence, general practice):* taps and points, drags unreliably, attention for minutes
not tens of minutes, loves cause and effect and repetition, understands short spoken instructions, cannot read. WHO and AAP
guidance (in the spec) limits screen time at this age; toddlers show a transfer deficit from screen to real life.
- **Works:** targets are 96+ px; every instruction is spoken; there is no fail state; the drum is pure cause and effect; a wrong
  "find it" tap only names the picture.
- **Breaks:** previously the only game was too hard (fixed). "Copy the beat" asks a 2-year-old to wait and take turns: expect many to
  just bang the drum; that is fine (any drumming is welcomed after the demonstration) but it does not test rhythm. Seven rounds is
  probably too long for one sitting at this age (cut to 3-4 once testing says so).
- **Missing:** the sounds-around-us listening (animals, instruments) the spec describes for this band.

### 3.2 As a 4-year-old
*Expectations:* can drag, follows two-step spoken instructions, may know letter *names* but not sounds, wants to do it "myself",
dislikes being wrong, enjoys characters. Development Matters puts rhyme, syllables and initial sounds at 3-4, and letter sounds
at Reception.
- **Works:** Safari (initial sounds), Drum (syllables/segmenting) and Rhyme Rocket are exactly the 3-4 skills; the errorless
  start; a dino that reacts to the finger; spoken instructions; wrong answers never punished.
- **Breaks / risks:** the daily adventure introduces a *letter* a day, which is a Reception skill: a 4-year-old in Nursery may
  find this early (judgement). Robot Talk's oral blending is hard. Four identical Feed trials will bore some children.
- **Open:** a "just listening" daily mode for ages 3-4 that leans on the oral games and leaves letters until the parent says go.

### 3.3 As a 5-year-old (Reception)
*Expectations:* reads simple words, wants to feel "big", has school phonics running in parallel.
- **Works:** Bridge Builder and Word Kitchen are real decoding and encoding; sound buttons mirror classroom practice; the mastery
  gate prevents racing ahead on lucky taps.
- **Breaks / risks:** **the content is still short of the Reception goal.** The EYFS 2026 ELG expects "at least 10 digraphs". The app
  now teaches 27 sounds, including four consonant digraphs (sh ch th ng) and four doubled letters (ck ff ll ss), which is eight
  two-letter graphemes, but **no vowel digraphs** (ai ee oa oo and so on). The sound buttons never fade, so strong readers are not
  stretched. Trace Trail may clash with the formation the school teaches (hence optional).
- **New in set 6 (my judgement, not tested with children):** /th/ is the unvoiced sound of "thin" only (no "this", "the", "that"), so one letter
  pair never has two sounds; words with the BATH vowel, the foot vowel (bush, push) or a w are left out. /th/ is never offered next to /f/ or /t/, nor
  /sh/ next to /s/ or /ch/, nor /ng/ next to /n/ or /k/, because those pairs are the ones children and synthetic voices confuse. A Safari scene
  for "s" never contains ship, and a "sh" scene never contains a thing that merely starts with the letter s.
- **Open:** vowel digraphs and the next stage; a "no sound buttons" challenge level; hearing the new sounds (see section 1).
### 3.4 Boy and girl
No separate review (see above). Checked instead: companions are creatures in four vivid colours, not gender-coded; the
sound-friends are a mix of named male, female and neutral characters; the pictures showed a boy, a man and a doll in a pink dress, so
a **woman ("mum") was added** to broaden representation. Rough-and-tumble (drum, rocket, dino jumps) and quiet crafting (kitchen,
tracing) are both on offer. These are my observations about what is in the app, not predictions about any child.

### 3.5 As a parent
- **Works:** no account or personal data; the daily limit; the sound map and words list; the accent explanation; the audition
  page for checking sounds; a gate that a young child is unlikely to pass.
- **Breaks:** the off-screen mission is on the Today tab, but at goodnight it only appears behind a small lightbulb, so many parents
  will miss it in the moment (it should be shown on the goodnight screen); **a "This week" tab now exists** (days played, new and secured sounds, words, a nudge on sounds that need practice, an off-screen activity, with no streak or comparison wording);
  **a "report a wrong sound" link now exists in the Sound map** (it opens a public GitHub issue, so it needs a parent's judgement about what to write); delete-all-progress uses a browser pop-up;
  parents may dislike a machine voice, which is why the credits say plainly that it is machine-generated and unreviewed.
- **Trust risk:** the public GitHub Pages link is open to anyone who has the URL.

---

## 4. Prioritised backlog

1. **A trained human voice** (or a phonics specialist's sign-off on every sound) for the sounds, and a northern speaker for that pack. *Biggest quality gap.*
2. Vowel digraphs (ai ee oa oo ...) and the next stage, to reach the Reception goal. *(Consonant digraphs sh ch th ng and placement through set 6 are done.)*
3. Parent area: show the off-screen mission on the goodnight screen (it is on the Today and This week tabs). *(Weekly summary and "report a sound" are done.)*
4. Age 3-4 listening-first mode; real environmental and animal sounds for age 2.
5. Variety inside Feed the Creature; a physical replacement for the drum's tick; a foliage "hunt" for Safari.
6. Pronunciation-based rhymes before growing the word bank; fade the sound buttons for confident readers.
7. Real play-testing with consent (observation, no recordings sent anywhere).

---

## 5. Monkey test results (`scripts/audit-monkey.cjs`, final build, 16 Nov 2026)

Random taps and drags (up to 15 s per game, 60 s on the adventure screens) with a child whose sets 1-3 are secure. **No page errors.**
Nothing crashed or got stuck: games that did not change screen under random play (Beat the Drum, Trace Trail in this run) need the
right answers to progress, and the end-to-end run (54 checks, `scripts/e2e.cjs`) does play every one to completion.

| Game | Screens seen | Random actions |
|---|---|---|
| Feed the Creature | 2 | 37 |
| Robot Talk | 2 | 18 |
| Beat the Drum | 1 | 47 |
| Sound Safari | 2 | 43 |
| Word Kitchen | 2 | 46 |
| Bridge Builder | 2 | 46 |
| Rhyme Rocket | 2 | 27 |
| Trace Trail | 1 | 59 |
| Adventure screens | 13 | 173 |

**Small tap targets flagged** (under 64 x 64 px): the letter tile in Feed the Creature (30 x 30), the same tile on the adventure screens
(30 x 30), and the picture card in Rhyme Rocket (26 x 26). **Checked at rest and not real:** the letter tiles measure 115-120 px and the
Rhyme Rocket picture cards 132 px (the target picture about 110 px), so the small figures are frames taken mid-animation, when a tile
or card shrinks as it flies to the mouth or rocket. The script measures every frame, so it can flag these; it should be changed to measure
only after the screen has settled (open item). I measured one Feed screen and one Rhyme screen at rest, not every game, so this is a spot
check rather than proof for every screen.

**Script note:** an earlier version of this script never reached Free Play (random play cannot finish an adventure) and clicked game
buttons on the menu while it thought it was playing a game, so its first results covered only the adventure. It now marks the day's
adventure done in saved state and stops random play when the menu reappears.

**Re-run after set 6, the new placement and the weekly summary** (final build): all eight games and the adventure screens were exercised with random
play, **no page errors**, nothing froze. The same three "small target" flags appeared (Feed tile 30 px, adventure tile 30 px, Rhyme Rocket picture 41 px this time), which
are the mid-animation readings explained above, not the sizes at rest (115-132 px). The script's placement loop had to be fixed because placement now ends at the
first miss. The end-to-end suite passes 62 checks. Neither run plays the digraph rounds with child-like input; I looked at one Word Kitchen round ("shop": one `sh`
tile, a shop drawing, decoys g and th) in a screenshot, and the engine tests cover Safari, Feed and placement for the digraphs.
