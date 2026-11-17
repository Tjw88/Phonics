# Art audit and theme packs (17 Nov 2026)

## What was reviewed, and how

Every graphic in the app was rendered on contact sheets and **looked at**: all 131 picture cards (at 120 px and, for new ones, 64 px), all 31 sound-friends, the companions in every growth level and mood, the game objects (robot, rocket, chest, drum, pot), the backdrop by day and night, and the home island. Judged for stylistic consistency, internal consistency, polish, and above all **clarity: would a 3-5 year old know what the thing is?**

This is my visual judgement (and that of the artist sub-agents who drew the new work), made from rendered images. **No child has seen any of it.** The "could be misread as" lists below are guesses about children, not observations.

## Findings (before the work)

| Area | Verdict |
|---|---|
| Sound-friends (31) | The strongest set: consistent style, big eyes, soft shapes, each evokes its letter. One weak spot: Gus the goat (g) looks mask-like. |
| Picture cards (131) | **Uneven.** A solid core (cat, dog, pig, panda, frog, fox, bus, car, house, rocket...) beside about 20 weak ones: thin, tiny, off-style or ambiguous. Worst: nut (read as two potatoes), net (a magnifying glass), horse, kangaroo, banana, nose, sock (a pennant), axe, ant, goat, rat, snake, feet (soles that looked like hands), nail (vs pin), shoe (a skate), cup (vs mug), mop, bat (fangs: not "nothing scary"). |
| Companions | Good, but only four baby dinosaurs: one theme. |
| Backdrop and island | **Too plain**: three flat hill layers, one volcano, a sun, two ferns; a tiny island. |
| Game objects | Fine (robot, rocket, chest, drum, pot). |

## What was done

1. **Theme packs** (new): six complete looks, each with four companions, an arrival container, a backdrop with day and night, and a home island. See below.
2. **Dino Valley backdrop and island redrawn**: layered misty mountains, a glowing volcano with animated smoke, tree ferns and cycads at the edges, a river with a waterfall, a nest of eggs, far silhouettes (a grazing long-neck, pterosaurs, footprints).
3. **23 picture cards redrawn**: ant, horse, kangaroo, bat, goat, rat, snake, cow, sheep, hippo, nut, net, nose, banana, sock, axe, feet, nail, shoe, hill, lip, cup, mop. The first review pass found the cow (head detached from body), goat, kangaroo and mop still not good enough; they were sent back for another pass (see "Remaining").
4. **27 earlier new cards and 8 new sound-friends** for the digraph sets (sh ch th ng ai ee oa oo), reviewed the same way. The `th` friend was redrawn after the first version read badly.

## Theme packs

A pack changes how the app **looks**, never what it teaches: sounds, words, games and progress are identical in every pack.

| Pack | Companions | Backdrop | Arrives in |
|---|---|---|---|
| Dino Valley | rexy, longneck, trike, stego (baby dinosaurs) | misty prehistoric valley, volcano, waterfall | egg |
| Dragon Castle | ember, frost, leaf, sun (baby dragons: different wings, ears, spikes) | storybook castle, bridge, hills (castle windows glow at night) | scaled egg |
| Transport Town | fire engine, digger, steam train, aeroplane (front-on, with faces) | toy town: station clock tower, shop, windmill, road with crossing | gift crate |
| Space Station | zip, plum, star, sky (friendly aliens, one in a glass helmet) | pastel moon surface, ringed planet, base dome, rover | rocket capsule |
| Ocean Reef | whale, jellyfish, turtle, crab | sunlit reef, light rays, coral, sunken ship, bubbles | egg in a clam |
| Farm Friends | chick, piglet, lamb, calf | red barn and silo, windmill, patchwork fields, duck pond | egg in a straw nest |

- **Chosen at setup**: a row of six world cards sits above the four friends on the "Pick a friend" screen; choosing one changes the backdrop at once and the four friends offered. **Grown-ups can switch in Settings**: the friend keeps its slot (the second friend stays the second friend), name and all progress.
- **The contract** every pack follows is in `src/ui/art.ts` ("THE COMPANION CONTRACT") and `src/ui/packs/types.ts`: shared face parts (`faceEyesSVG`, `faceMouthSVG`, `zzzSVG`), shared growth accessories (bow, scarf, explorer hat, crown), the mouth where letters are dropped, day/night hooks, unique ids. `src/ui/packs/packs.test.ts` checks it mechanically for every pack (hooks present, well-formed SVG, five different growth looks, unique ids across packs, quiet backdrop hooks).
- **To add a pack:** copy an existing pack file in `src/ui/packs/`, change the ids (prefix them with the new pack id), register it in `src/ui/themes.ts`, run the tests. The preview harness used for the reviews renders creatures, eggs, thumbnail, island and day/night backdrop in the app's real CSS.
- **Cost:** the JavaScript bundle grew from about 45 kB to about 96 kB gzipped because all six packs are inline SVG. Acceptable for an offline app; if it matters later, packs can be loaded on demand.
- **Not done:** words are not themed (no dragon word list, etc.); the theme is cosmetic only. The robot, rocket, drum, pot and chest are shared by every pack. Animations are the same in every pack (the next review cycle looks at that).

## Things a child might misread (artists' notes and mine, unverified)

- Dragons: the frost dragon's blue pointed ears may read as a second pair of wings; the sun dragon's star spikes may read as a crown; the ember tail flame is literal fire.
- Transport: the aeroplane's round face over a body reads slightly like a snowman; its propeller tips could look like little arms.
- Space: the plum alien's pink-tipped horns may read as antennae.
- Ocean: the whale could be a seal or penguin until the fluke is noticed.
- Farm: the calf's pink muzzle resembles the piglet's snout; the lamb's grey-brown face is darker than a typical lamb and could look sad.
- Pictures: feet (could be "soles" or "footprints"), lip ("mouth"), nose ("face"), sock ("legs"), hill ("mountain"), nut ("peanut", which is fine), boat/sail/ship (a child may call them all "boat": they are never offered together as answer and distractor).

## Added in the sets 8-12 round

17 new sound-friends (Jess the jet, Vic the van, Wiggle the worm, Axel the box, Yoyo the yak, Zippy the zebra, Fizzy the fizz, Queenie the queen, Lite the light, Starla the star, Norah the corn, Furry the fur ball, Howie the owl, Coco the coin, Earl the ear, Hairy the hairbrush, Fern the fern) and 41 new picture cards, drawn by three artist agents and reviewed by me on a contact sheet. Hairy was redrawn (first version read as a pink mushroom) and wig, wing, quilt, curl and hair were sent back once. Remaining weak spots (a child might misread): wing ("feather"), quilt ("bed"), hair ("ponytail" or "bow"), curl, air (wind or weather), Fern the friend ("cabbage" at 64 px), Hairy ("hand mirror").

## Remaining

- Cow, goat, kangaroo, mop and nut were sent back for a second pass and I re-checked them: the mop (upright mop beside a bucket), kangaroo (clear face, joey in the pouch) and nut (one clear peanut) are now fine; the goat is acceptable but still stylised; **the cow is still the busiest card at 64 px** and could be simplified.
- Gus the goat sound-friend (g) is odd; not yet redrawn.
- Pictures for the vowel-digraph words that still use none (seed, chain, paint, etc.) are print-only.
- A human illustrator's review of every card before any release; this is AI-assisted vector art judged by AI.
