# Animation spec (cycle 1, 17 Nov 2026)

Goal: every animation is **polished, fun, engaging, thematically consistent, and aligned to what the game mechanic and the child's action actually are**. Sources: the two independent reviews (`docs/FUN_REVIEW.md`), the timeline measurements, and the owner's constraints (pull not hook: no streaks, no random rewards, no timers on child screens, errorless early play, Reduce Motion respected).

## 1. Principles

1. **Cause and effect first.** The animation must answer the child's action within 100 ms (a touch gets a reaction), show *which* action caused it, and end by showing the result.
2. **Anticipation, action, follow-through.** A tiny wind-up, the move with easing (never linear), a settle with a little overshoot. Squash and stretch on soft things; weight on heavy ones.
3. **Proportionate.** Size follows significance: a first success is small and quick; a block finale is bigger. After the first success of a game in a session, play the **short version** (about 0.8-1.2 s). Nothing a child must wait through for more than about 2 s before they can act again, except the finale and the hatch.
4. **Never the same twice in a row.** Reactions rotate **deterministically** through a small set by round index (no randomness: that would be a variable reward and the owner forbids it), so a long block does not look copied.
5. **Themed and mechanic-aligned.** The signature reaction comes from the creature (a digger digs, an alien beams, a jelly glows, a dragon breathes a puff of sparkles); props are skinned per world (planks become stepping stones or shells). The mechanic's logic never changes.
6. **Calm by default.** Loops are slow, subtle and stop when they stop being useful (the ghost hand, bobbing items, talking robot). Nothing flashes faster than 3 times a second.
7. **Gentle failure.** A wrong answer is information, not punishment: a soft head-tilt toward the right place, the right choice re-pulses after a second miss. No shake that reads as "no", no red, no buzzer.
8. **Reduce Motion.** Under `prefers-reduced-motion` transforms collapse to fades and the success is still visible through the creature's face and sound (already true; every new animation must keep it).
9. **Performance.** Web Animations API and CSS transforms/opacity only (no layout thrash), no animation of `filter` on large areas, cleaned up when the scene unmounts.

## 2. Timing budget (instant-answer minimums; real children take longer)

| Moment | Budget now | Target |
|---|---|---|
| Feed: a trial including the celebration | about 3.0 s | first of the session 2.4 s; the rest 1.4-1.8 s |
| Block of 4 Feed trials | about 12 s, identical | about 8 s with four different reactions |
| Between rounds | blank landscape flash 0.3-0.5 s | cross-fade, no blank, the creature stays on screen |
| End of day (alive, treasure, sleep) | 5 non-interactive screens | 3: one celebration that merges "alive" + treasure, the treasure opens on tap, goodnight |
| Finale of the day | same size as round 1 | clearly bigger (level 3) |

## 3. The reaction set (the contract)

`src/ui/celebrate.ts` is the single entry point (`celebrate(el, { level, pack, index })`). Each pack supplies a **reaction set** (kept in `src/ui/reactions.ts`):

| Reaction | When | Content |
|---|---|---|
| `eat` | a letter is dropped into the mouth | the creature's signature way of "taking" it, 3 deterministic variants by index; the letter's flight is shaped by the pack (a digger scoops, an alien beams, a jelly engulfs) |
| `right` | a correct answer in any game | level 1-3 burst in the pack's particle style (stars/bubbles/hay/sparks/petals/notes), plus the creature's happy motion |
| `wrong` | a wrong answer | a head tilt and an eye-look toward the correct choice, a soft "oh" mouth; after the second miss the correct choice gently pulses |
| `finale` | last round of a block, and the day's end | the creature's dance and a world-wide effect (lights, a rainbow, a firework in pack style) |
| `idle` | the home screen untouched | breathing, a blink, an occasional look at the Play button; a touch gives a wiggle and a pop (built) |
| `sleep` | goodnight | slow breathing, drifting Zs, a shooting star |

Particle styles per pack: dino leaves and dust; dragon sparkles and tiny flames; transport stars and steam; space twinkles and rings; ocean bubbles; farm hay, petals and feathers.

## 4. Per-animation spec

| Animation | Change |
|---|---|
| **Hatch / arrival** | anticipation wobble keeps; add overshoot on emergence, a wave, a look at the Play button; the arrival container animates in character (egg cracks, crate lid pops, capsule hatch opens) |
| **Feed: drag, drop, eat** | keep the eye-follow and hot ring (best-in-app); `eat` has 3 variants by index; short version after the first success; themed flight and particles; a wrong letter -> head tilt toward the right letter |
| **Robot Talk** | cards stay live while the robot speaks (children may tap early or preview), the robot rocks gently once (not a loop), the red bulb pulses slowly, the grill does not flap |
| **Beat the Drum** | squash-and-stretch on every tap, a creature "drummer" hits with an arm, the bead pops in time, extra taps never penalised until the tick, themed drum skin per world (pail, bongo, conga, tom) |
| **Sound Safari** | items peek out of the world's cover (grass, rocks, portholes, bushes, clouds), only unfound items sway, slowly; the found item pops, the creature cheers; themed board |
| **Word Kitchen** | the cooked word's picture pops out of the pot with steam and a wobble; per-world pot skin; tiles settle with a squash |
| **Bridge Builder** | one themed plank/stone appears per tapped sound; the creature hops to each as it appears; blending slide lights the planks left to right; the crossing has weight and a flag wave at the end; the "Not quite" text never lingers on a win (fixed) |
| **Rhyme Rocket** | per-world vehicle skin; vary the exit by round; shorter on repeats |
| **Trace Trail** | on completing a letter the letter morphs into its sound-friend, who says its sound |
| **Treasure chest** | the child taps to open (agency, no timer); the friend says its sound, hops, then flies to its spot on the island |
| **Alive word** | merged with the treasure into one celebration |
| **Goodnight** | sky to night (keep), slow breathing, drifting Zs, a shooting star; the exit button is bigger |
| **Scene transitions** | cross-fade the new card in under the old; the creature persists between rounds (it walks or hops to the next spot) |
| **Home / idle** | breathing and blinking; looks at the Play button; reacts to touch (built); the island visibly grows (later) |
| **Free Play menu** | themed game "doors" instead of emoji (the Bridge Builder icon is a bridge photo) |

## 5. Sequencing changes (the other half of "feels repetitive")

The adventure's Feed trials used to run in one block (up to 10 in a row). Cycle 1 **interleaves**: the Feed items are split around the oral game so the longest run of one mechanic is about 5, and the second block continues the errorless 1 -> 2 -> 3 choice ramp (trial index continues, so the pedagogy is unchanged). Day 1 (one single-tile sound) is cut to two Feed trials. The printed-word block is 2 words plus the make-it-real word (3 rounds, not 4).

## 6. Process: the improvement cycle

1. **Spec** (this document) and a **frame-capture harness** that records every key animation as a contact sheet (reused by the reviews).
2. **Implement** in three areas with separate files (flow and scenes; the Feed/Robot/Rhyme/Bridge group and the reaction library; the Drum/Safari/Kitchen/Trace/Sound Play group), each reporting what it changed.
3. **Independent review**: a fresh reviewer who has not seen the implementers' reports captures frame sequences of every animation in at least three packs and scores each against these principles.
4. **Fix and re-review** (cycle 2 starts from that report). The cycle ends when no animation scores below 4/5 for polish and theme fit, or the remaining items are listed in the Query Backlog.

## 7. What cannot be judged here

Audio sync (the sounds are generated audio nobody here can hear), real children's reactions, feel on a real touchscreen, and long-term novelty (a reaction set of 3 variants may still feel repeated over weeks).

---

## 8. Cycle 1 results (17 Nov 2026)

Implemented by three engineers in separate files (flow and scenes: `app.ts`, `flow.ts`, `fx.ts`, `anim-flow.css`; Feed/Robot/Rhyme/Bridge and the reaction library: `games.ts`, `celebrate.ts`, `reactions.ts`, `particles.ts`, `vehicles.ts`, `anim-games.css`; Drum/Safari/Kitchen/Trace/Sound Play: `games2.ts`, `games2-art.ts`, `anim-games2.css`), then reviewed by an independent reviewer who had not seen their reports (frame sequences in all six worlds).

**Measured:** a Feed trial takes 2.3-2.4 s for the first success of a session and 1.5-1.7 s after (was about 3 s each); a block of four is about 7 s (was about 12 s); the longest run of the same game is 3 on day 1 and 2 on a later day (was 10); the end of the day is two screens (was five); there is no blank flash between rounds (the stage cross-fades and the creature persists).
**Reviewer scores (1-5, averages):** polish 3.9, fun 3.7, clarity 4.1, theme fit 3.9, variety 3.1. The exit criterion in section 6 (nothing below 4 for polish and theme fit) was **not met**: Robot Talk and the home idle were below 4 on theme fit, Trace Trail and the Free Play doors on theme fit, and variety was the weakest dimension.
**Bugs found (no crash, stuck state or page error):** Bridge Builder word choices clipped at 1180x820 (fixed in cycle 2), no visible reaction to a wrong tap in Sound Safari, a chest-open cue that was too faint with Goodnight hidden behind it, the filled hot ring hiding the creature's face during a drag, a 250 ms cross-fade double exposure, waits above the 2 s budget with no short version (Rhyme, Kitchen, Bridge), eat variants that were visibly the same in some worlds, grown-up content in the child's celebration.
**Cycle 2** (same engineers, with the reviewer's findings for their area): the chest cue, transition polish, world-flavoured home idle and Free Play doors; the Bridge clip, the hot ring, real eat-variant variety, short versions for Rhyme and Bridge, a reactive and themed Robot, a bigger Rhyme vehicle; Safari's wrong tap, a bigger creature in Safari and Kitchen, a short Kitchen after the first success, a world-flavoured Trace friend, drummer pose variety. A second independent review follows.

## 9. Cycle 2 results (17 Nov 2026)

The same engineers fixed the cycle-1 findings; the same independent reviewer then **re-tested every item from scratch** (frames in all six worlds, DOM measurements, Reduce Motion).
**Scores (1-5 averages), cycle 1 -> cycle 2:** polish 3.9 -> 4.0, fun 3.7 -> 3.9, clarity 4.1 -> 4.2, theme fit 3.9 -> 4.4, variety 3.1 -> 3.4. By the reviewer's scores **the exit criterion (nothing below 4 for polish and theme fit) is met**, with two caveats: the home-idle theme score rests on only two of six worlds checked, and the hatch is unchanged from cycle 1. Variety (3.4) and fun (3.9) remain the weakest dimensions; the spec does not gate on them.
**Fixed and verified:** the Bridge choices fit at 1180x820, 1024x768 and 390x844 in all six worlds (measured); the chest cue (caption, ring, hand after about 4 s, no countdown) and Goodnight appearing 0.3 s after the tap (was 3.5 s); the dashed hot ring (face visible); Feed rounds with measurably different body motions; short versions (first, repeat: Feed 2.27 / 1.5 s, Rhyme 2.45 / 1.56 s, Kitchen 2.89 / 1.98 s, Bridge 2.37 / 1.33 s); a reactive, hatted Robot per world; a 180 px Safari creature and a 270 px Kitchen pot; Trace friends with a world glow and badge, including two-stroke and 7-stroke letters; per-world Free Play doors; drummer poses; the cross-fade overlap down to about 190 ms. No crash, stuck state or page error in any run; no regressions.
**Fixed after the re-review:** the ocean Feed round-3 spin that passed through an edge-on sliver is now a wobble-flip that never goes edge-on.

**Cycle 3 backlog (from the re-review, ranked):**
1. Hatch follow-through: a wave (arm, wing, flipper, ear) and a look at Play before idling.
2. Safari wrong tap on the item itself (the creature reacts, the tapped picture does not).
3. First-success waits above 2 s: Rhyme 2.45 s, Kitchen 2.9 s (trim the Rhyme exit to about 1.8 s and the Kitchen steam to about 1.2 s the first time).
4. Rhyme: the vehicle is still small in its window; make it the star (about 1.5x, a diagonal take-off, more exit variety).
5. Home idle per world: confirmed only in dragon and ocean; check and finish farm, space, dino, transport; add an occasional bigger action every 10-15 s.
6. Bridge crossing weight (walk plank by plank with a squash each).
7. The robot's body should move on the answer (it nods and shrugs; the reviewer saw only the beads and the halo).
8. Finale layout: the grown-up block sits below the fold at 1180x820 and off-screen at 1024x768 (decision: see Query Backlog).
9. Day variety: the longest same-game run was 3 in a 14-day day; put a short non-Feed game between blocks; vary Kitchen's 5 s rounds.
10. Small: Kitchen overflows a 390x844 phone by 10 px; the ghost hand sits on the letter to drag in Kitchen and over the rocket in Rhyme; a ghost frame lingers about 190 ms in the cross-fade.
**Not judged:** audio sync, real children and touch, smooth motion curves (captured at about 7 fps), long-term novelty.

## 10. Cycle 3 results (17 Nov 2026)

Done by the three engineers (flow, games, games2), verified by the e2e (94 checks, all passing, including a measured Q16 block), `scripts/pack-smoke.cjs` (rewritten: every pack plays setup, placement, and one won round of each of the 8 free-play games; all 12 packs pass with no page or console errors; the failure path has not itself been tested by forcing an error) and frame sheets. **No independent third review has been run yet.**
- Hatch follow-through: two big body waves then a look and nod toward Play. Not yet seen with the real new-pack containers in frames.
- Home idle: a distinct small action per world, all 12 (stomp, sparks, honk, float, bubbles, chew, vine swing, beep, deck rock, petals, beats, shiver); a calm sway between; nothing under Reduce Motion.
- Finale (Q16): "For the grown-up" header above the fold at 1180x820 (bottom edge 678), 1024x768 (660) and 390x844 (656).
- First-success waits: Rhyme 2.45 s to ~1.8 s, Kitchen 2.9 s to ~1.8 s; repeats 1.3 to 1.5 s. Kitchen payoff rotates through three variants.
- Rhyme vehicle ~1.5x with diagonal exits (three per vehicle); Bridge landings have weight; the robot lifts an arm per sound; ghost hand points from below; Kitchen phone overflow fixed (844 px); Safari wrong tap wobbles the item (not re-captured).
- Fallbacks: every per-pack table now falls back (familyOf/pick); the twelve-world picker is six per row on desktop, four on a phone.
- Not done: day variety (engine) check; distinct eat motions, vehicles and props for the six new packs (stage 2); real-device feel.
