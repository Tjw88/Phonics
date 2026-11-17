# Fun and engagement review (17 Nov 2026)

## How it was done, and what it is not

Three reads of the same build, kept separate on purpose:

1. **Mine**: contact sheets of every graphic, screenshots of every screen, and a **timeline measurement** (the end-to-end player records when each screen appears; because it answers instantly, each screen's duration is the *minimum* time the app makes a child spend on it).
2. **An independent children's game designer** (a sub-agent that played the app with Playwright, took frame sequences of the animations, and wrote its own report without seeing mine).
3. **An independent early-years practitioner and parent** (another sub-agent: six child personas, then the parent; again without seeing mine).

Their full reports are not committed (they live in the session scratchpad with their screenshots); everything that matters is summarised here. **No child has played this.** Every "a 4-year-old would..." is expert prediction from screenshots, not observation. **Nobody could judge the audio**, which carries a lot of the experience. Timings are minimums.

## Verdict

Safe, gentle, clear and honest to its constraints (no ads, streaks, timers, random rewards or upsell; errorless early rounds; a goodnight that really ends the session; targets of 64 px or more; strong contrast). **As a game it is closer to a polished worksheet with a lovely mascot than to something a 4-year-old begs to replay**: roughly **3/5 for fun, 4/5 for clarity** (designer's scores; the practitioner's verdict agrees: "a competent quiet drill with a lovely wrapper"). Both reviewers independently ranked the same things highest. The weak points are all things the design constraints do **not** forbid: the reward was invisible (a bug, now fixed), the same mechanic repeats back to back with an identical reaction, dead air between rounds, nothing escalates, and the six themes are skins rather than six experiences.

## What is genuinely good (keep it)

- **Feed the Creature**: the creature's eyes follow the dragged letter, the mouth opens as it nears, a ring glows, it chews, jumps, confetti. Clear cause and effect, shown by the character not by words; a wrong letter gets a gentle "oh". Both reviewers named it the best mechanic.
- **The hatch**: choice of friend and name gives ownership; it works in every world (an egg, a crate, a capsule).
- **Rhyme Rocket's launch** (gauge fills, picture drops in, rocket leaves with a star trail): the best payoff in the app.
- **The treasure is a sound-friend the child already met** (deterministic, so it respects "no random rewards") and the **"For the grown-up" card** with the sound hunt.
- **Goodnight is a true ending**: the sky goes to night, the creature sleeps, "see you tomorrow".
- **Errorless start, soft failure, no punishment.** Targets are large and consistent.

## Fixed in this pass (concrete defects found by the reviews)

| Problem | Fix |
|---|---|
| **The treasure stickers were invisible blank discs on the island** (percentage padding larger than the sticker left it zero-sized), so the only lasting reward never showed. The island could also show only 13 of 31 friends and some sat behind the creature. | Sizing fixed; spots for all 31, either side of the creature. Verified on screen. |
| Default friend name did not follow the creature (the pig was called "Chick") | A default name per creature (Bluey, Ruby, Zip, Tilly, Piggle...). |
| "Not quite" text stayed on screen while the creature crossed the bridge in triumph | Replaced by "You built the bridge! Well done!" |
| On a phone the Back button wrapped into a tall capsule and pushed the top bar wider than the screen | Icon-only on narrow screens; the word mark gives way. |
| A tap did nothing for the first three taps (a 3-year-old taps first) | A tap works at once when there is only one letter to choose; with several letters it places the letter after two taps instead of three. |
| Sound Play: the drum was silent during the demo | Every drum tap sounds. |
| Sound Play offered "push pin", "gong", "shed" to a toddler | A 24-word toddler list, every word pictured. |
| The grown-up Today and This week said nothing had happened after a full Sound Play | Sound Play counts as a day played and Today says so. |
| Nothing told a parent which band suits a 3-year-old | A line under the band choice. |
| The grown-up gate could be guessed 1 time in 4 with instant retries | Locks for 30 seconds after a wrong answer. |
| Prototype fast-forward tools and audio-engineering text on every sound card in the parent area | Hidden unless the page is opened once with `?tools=1`. |
| Settings: "Mute soundWorld" run together, 19 px selects, 13 px checkbox | Stacked, labelled, 44 px+ controls. |
| Word choices on digraph days could be guessed by length or first letter ("mash / sock / in") | Distractors now share a first or last sound (tested). |
| The home creature ignored a touch (the first thing a child tries) | Wiggle and pop. |

## Still open: carried into the animation and engagement cycle

Ranked by impact; the first six are the heart of the next cycle.

1. **Repetition**: day 1 is four identical single-tile Feed trials, then four Bridge rounds; a later day runs about ten Feed trials back to back (measured: 4 per new sound plus 2 per review sound, the same chomp every time, about 3 s each). Interleave, cap blocks, shorten the celebration after the first success, deterministic variants of the reaction (no random rewards).
2. **Themes are skins**: backdrop and creature change; the bridge, drum, pot, rocket and safari board are identical in every world, and the same chomp plays for a digger and a jellyfish ("feed the digger"). Themed props and per-world reactions.
3. **Dead air and flicker between rounds** (the card blanks to the landscape, then the next fades in), and **four to five non-interactive screens** at the end of every day (hello, story, alive, treasure, sleep). Cross-fade, keep the creature on screen, merge "alive" and treasure.
4. **Nothing escalates and the island barely changes**: celebrations are the same size for a trivial and a hard success; no visible progress toward the treasure; the island looks the same on day 1 and day 30. Deterministic island growth (a flower per secure sound), a progress trail, a finale.
5. **Sound Safari** is a grid of unrelated objects, not a safari, with everything bobbing forever; **Beat the Drum** counts phonemes then a tick (over-tapping, the natural thing, counts as wrong) and the drum does not feel like a drum; **Word Kitchen's** payoff is small for a game called "kitchen".
6. **Robot Talk** keeps the answer cards dimmed while the robot speaks (nothing to do) and is the most agitated animation (rocking, flashing bulb, flapping grill); the **ghost hand** and slide hint loop for ever.
7. **First 60 seconds are written for a parent**, and the child's first real play is a placement quiz, not a game. Make placement look like Feed the Creature.
8. **Free Play** is hidden until the day's adventure is done and is a plain emoji grid (the Bridge Builder icon is a bridge photo); **"Play again" under a sleeping creature** is a mixed message.
9. **Picture ambiguity** (man/kid, king, shed, rock, "ink", "up", "igloo") can make a correct rhyme look wrong. Needs child testing; cannot be settled by looking.
10. **Age fit**: Sound Play is about 30 seconds of content and has no environmental-sound or sound-discrimination activity; a 5-year-old who already reads will find the pace slow after week one; content runs out around day 48-57.
11. Portrait layout wastes space (the card is a small box with empty sky).
12. Fine-motor load in Word Kitchen (96 px tiles into 84 px slots) is high for a young 4.

## Animation findings (the brief for the next cycle)

| Animation | State | Direction |
|---|---|---|
| Hatch | Good anticipation, weak follow-through (the creature then stands still) | Overshoot on emergence, a wave, a look at the Play button; per-world arrival feel |
| Feed: drag, chomp | Best-polished; identical every time; the same for every creature | Deterministic variants, a shorter version after the first success, per-world reactions (a digger digs, an alien beams, a jellyfish glows) |
| Wrong answer | Gentle but nearly invisible | Head tilt toward the right choice; re-pulse the correct choice after a second miss |
| Correct celebration | Same confetti everywhere, no escalation | Themed bursts (stars, bubbles, hay, sparks); escalate across a block; a finale |
| Bridge crossing | Fine walk; planks pre-exist | Planks appear per tapped sound, the creature hops per plank, themed planks per world |
| Rhyme rocket | Strongest; long when repeated | Vary the exit, speed up repeats, per-world vehicle |
| Treasure chest | Charming, passive | Child taps to open, the friend says its sound, then flies to its place on the island |
| Goodnight | Calm and lovely, then static | Breathing, drifting Zs, a shooting star |
| Scene transitions | A blink of empty landscape | Cross-fade, creature stays |
| Drum, Kitchen "done", Safari find | Small | Squash-and-stretch drum, drummer creature; pot steam and a picture popping out; themed peek-a-boo items |
| Idle / home | Static | Breathing, blinking, a look at the button; reacts to touch (now added) |
| Reduced motion | Correct: durations collapse, confetti off, ghost hand skipped | Verify success is still visible with sound and the creature's face |

## Ideas that fit the owner's constraints (all deterministic, no streaks or random rewards)

An island that grows with what the child knows; tap a sticker to hear its friend say its sound and wave; a deterministic costume wardrobe; the chest showing tomorrow's friend as a silhouette (certainty, not chance); a four-frame cartoon for each sound-friend's story; a "sound parade" finale of every friend met; a two-door choice of the next game (agency with no extra content risk); a drum that plays back the child's taps as a jingle.

## For a phonics specialist to check (the practitioner's list, abridged; not research)

The order after set 5 skips j, v, w, x, y, z, zz, qu and igh, ar, or, ur, ow, oi and the rest of Phase 3 (many everyday words need them: see Query Backlog); one new sound a day is fast for nursery; the stops in the mnemonic lines ("Bo bounces b, b, b") may sound like "buh" in a synthetic voice; "clap the sounds in your name" is ambiguous between syllables and phonemes; Safari scenes are built for the letter taught (a /k/ scene shows kite, never cat), which is defensible for letter teaching but is not quite "starts with the sound"; a delayed review a week later would strengthen the mastery rule.

## What could not be judged

Audio of any kind; real children (attention, frustration, finger feel, palm touches); real durations (timings are minimums); retention over weeks; iPad Safari and old devices; assistive technology; whether the 131 pictures are named the same way by children.
