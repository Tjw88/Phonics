// A THEME PACK is a complete look for the app: four companion creatures a child can choose from, the "egg" (or box, or capsule) each one
// arrives in, the backdrop behind every screen and the home island. Packs change how the app LOOKS, never what it teaches: sounds, words,
// games and progress are identical in every pack. See the companion contract in ../art.ts (faceEyesSVG and friends).

export interface CreatureDef {
  /** unique across ALL packs; saved with the child's progress (e.g. 'ember') */
  id: string;
  /** what a grown-up hears from a screen reader when choosing, e.g. 'red dragon egg' */
  label: string;
  /** egg / arrival colours (also used as the creature's own main colours) */
  main: string;
  dark: string;
  accent: string;
  /** head-centre y inside the 200 x 238 creature box (see the contract in art.ts); 84 for most, 74 for a tall-necked creature */
  hy: number;
  /** the creature, following the companion contract; `growth` 0..4 picks the accessory (use accessorySVG(growth, hy)) */
  svg: (growth: number) => string;
  /** optional custom arrival container (egg, crate, capsule...), 120 x 150 viewBox; default is the glossy egg in main/dark/accent */
  egg?: () => string;
}

export interface Pack {
  /** 'dino' | 'dragon' | 'transport' | 'space' | 'ocean' | 'farm' */
  id: string;
  /** shown on the world picker, e.g. 'Dragon Castle' */
  name: string;
  /** one short line for the parent, e.g. 'Baby dragons and a fairy-tale castle' */
  blurb: string;
  /** what the arrival is called, for the on-screen captions: 'egg' | 'crate' | 'capsule' ... */
  arrival: string;
  /** the name used if the grown-up leaves the friend's name blank: 'Dino', 'Dragon', 'Digger'... */
  defaultName: string;
  creatures: CreatureDef[]; // exactly four
  /**
   * The full-screen backdrop, viewBox "0 0 1600 900" preserveAspectRatio "xMidYMax slice". It MUST keep these hooks so day and night work:
   *   <rect class="sky-day"> and <rect class="sky-night"> (full-size), <g class="sun"> (optionally with a <g class="rays">), <g class="moon">,
   *   <g class="stars"> (circles with class "tw tw0|tw1|tw2" twinkle), clouds as <g class="cloud c1|c2|c3">, and every piece of scenery
   *   (hills, buildings, water, planets...) inside a <g class="scenery"> so night can darken it. Keep it calm and low-contrast: the
   *   learning object on top of it is the star, and the centre of the screen (where the game card sits) must stay quiet.
   */
  scene: () => string;
  /** the home island, viewBox "0 0 400 190": a small floating/standing scene the collected sound-friends sit on */
  island: () => string;
}
