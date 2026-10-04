// One record per dino. Copy from reference/dino-v0/README-dino.md.
// Ids are permanent: they become URL slugs (/c/trex). Never rename one.

export const DINO_IDS = [
  "trex",
  "velociraptor",
  "triceratops",
  "stegosaurus",
  "brachiosaurus",
  "spinosaurus",
  "dilophosaurus",
  "pterodactyl",
  "mosasaurus",
  "chicken",
] as const;

export type DinoId = (typeof DINO_IDS)[number];

export type Rarity = "common" | "rare";

export type Stat = { label: string; value: number };

export type Dino = {
  id: DinoId;
  /** Collector number as printed on the card, "01"–"10". */
  number: string;
  name: string;
  rarity: Rarity;
  oneLiner: string;
  stats: readonly [Stat, Stat, Stat];
  // Drafts: every era, size and fact is fact-checked before launch (see `// verify`).
  /** Printed top-left of the art window, as written. */
  era: string;
  /** Printed on the scale bar as "{lengthM} M", plus "WINGSPAN" when `span` says so. */
  lengthM: number;
  span: "length" | "wingspan";
  fact: string;
  herdWith: DinoId;
  avoid: DinoId;
};

export const DINOS: Record<DinoId, Dino> = {
  trex: {
    id: "trex",
    number: "01",
    name: "T-rex",
    rarity: "common",
    oneLiner: "The main character. Loud, confident, tiny arms, big plans.",
    stats: [
      { label: "Main char", value: 99 },
      { label: "Arm reach", value: 8 },
      { label: "Volume", value: 94 },
    ],
    era: "Late Cretaceous · 68–66 mya", // verify
    lengthM: 12, // verify
    span: "length",
    fact: "One of the strongest bites of any land animal, ever.", // verify
    herdWith: "triceratops",
    avoid: "spinosaurus",
  },
  velociraptor: {
    id: "velociraptor",
    number: "02",
    name: "Velociraptor",
    rarity: "common",
    oneLiner: "The clever one. Always three steps ahead.",
    stats: [
      { label: "Scheming", value: 96 },
      { label: "Speed", value: 91 },
      { label: "Patience", value: 14 },
    ],
    era: "Late Cretaceous · 75–71 mya", // verify
    lengthM: 2, // verify
    span: "length",
    fact: "Real ones were about the size of a turkey, and had feathers.", // verify
    herdWith: "chicken",
    avoid: "stegosaurus",
  },
  triceratops: {
    id: "triceratops",
    number: "03",
    name: "Triceratops",
    rarity: "common",
    oneLiner: "The loyal protector. Calm, until someone messes with your people.",
    stats: [
      { label: "Loyalty", value: 97 },
      { label: "Patience", value: 62 },
      { label: "Headbutt", value: 88 },
    ],
    era: "Late Cretaceous · 68–66 mya", // verify
    lengthM: 9, // verify
    span: "length",
    fact: "Its skull was one of the largest of any land animal.", // verify
    herdWith: "stegosaurus",
    avoid: "dilophosaurus",
  },
  stegosaurus: {
    id: "stegosaurus",
    number: "04",
    name: "Stegosaurus",
    rarity: "common",
    oneLiner: "The chill one. Slow mornings, strong boundaries.",
    stats: [
      { label: "Chill", value: 98 },
      { label: "Boundaries", value: 90 },
      { label: "Urgency", value: 6 },
    ],
    era: "Late Jurassic · 155–150 mya", // verify
    lengthM: 9, // verify
    span: "length",
    fact: "T-rex lived closer in time to us than to Stegosaurus.", // verify
    herdWith: "brachiosaurus",
    avoid: "velociraptor",
  },
  brachiosaurus: {
    id: "brachiosaurus",
    number: "05",
    name: "Brachiosaurus",
    rarity: "common",
    oneLiner: "The gentle giant. Head in the clouds, snacking all day.",
    stats: [
      { label: "Snacks", value: 99 },
      { label: "Kindness", value: 93 },
      { label: "Hurry", value: 3 },
    ],
    era: "Late Jurassic · 154–150 mya", // verify
    lengthM: 22, // verify
    span: "length",
    fact: "Its front legs were longer than its back legs, like a giraffe.", // verify
    herdWith: "stegosaurus",
    avoid: "spinosaurus",
  },
  spinosaurus: {
    id: "spinosaurus",
    number: "06",
    name: "Spinosaurus",
    rarity: "common",
    oneLiner: "The show-off. Bigger than T-rex, and won’t let anyone forget it.",
    stats: [
      { label: "Flex", value: 99 },
      { label: "Swagger", value: 95 },
      { label: "Humility", value: 7 },
    ],
    era: "Mid Cretaceous · 99–93 mya", // verify
    lengthM: 14, // verify
    span: "length",
    fact: "Probably spent much of its life in water, hunting fish.", // verify
    herdWith: "dilophosaurus",
    avoid: "trex",
  },
  dilophosaurus: {
    id: "dilophosaurus",
    number: "07",
    name: "Dilophosaurus",
    rarity: "common",
    oneLiner: "The drama queen. Pretty frill, venom when crossed.",
    stats: [
      { label: "Drama", value: 99 },
      { label: "Frill", value: 94 },
      { label: "Forgiveness", value: 11 },
    ],
    era: "Early Jurassic · 186 mya", // verify
    lengthM: 7, // verify
    span: "length",
    fact: "No evidence it had a frill or spat venom. That was the movies.", // verify
    herdWith: "spinosaurus",
    avoid: "triceratops",
  },
  pterodactyl: {
    id: "pterodactyl",
    number: "08",
    name: "Pterodactyl",
    rarity: "rare",
    oneLiner: "The free spirit. Technically not a dinosaur, and proud of it.",
    stats: [
      { label: "Freedom", value: 98 },
      { label: "Altitude", value: 92 },
      { label: "Rules", value: 5 },
    ],
    era: "Late Jurassic · 150 mya", // verify
    lengthM: 1, // verify
    span: "wingspan",
    fact: "A pterosaur: a flying reptile, not a dinosaur.", // verify
    herdWith: "mosasaurus",
    avoid: "trex",
  },
  mosasaurus: {
    id: "mosasaurus",
    number: "09",
    name: "Mosasaurus",
    rarity: "rare",
    oneLiner: "The deep one. Quiet on the surface, a lot going on underneath.",
    stats: [
      { label: "Depth", value: 99 },
      { label: "Mystery", value: 93 },
      { label: "Small talk", value: 4 },
    ],
    era: "Late Cretaceous · 82–66 mya", // verify
    lengthM: 13, // verify
    span: "length",
    fact: "Not a dinosaur. A giant sea lizard, related to today’s monitor lizards and snakes.", // verify
    herdWith: "stegosaurus",
    avoid: "dilophosaurus",
  },
  chicken: {
    id: "chicken",
    number: "10",
    name: "Chicken",
    rarity: "rare",
    oneLiner: "The survivor. Outlived them all. Still here, still clucking.",
    stats: [
      { label: "Survival", value: 99 },
      { label: "Cluck", value: 91 },
      { label: "Composure", value: 40 },
    ],
    era: "Holocene · now", // verify
    lengthM: 0.4, // verify
    span: "length",
    fact: "Birds are living dinosaurs. The chicken is a theropod, like T-rex.", // verify
    herdWith: "velociraptor",
    avoid: "trex",
  },
};

/** All dinos in collector-number order. */
export const DINO_LIST: readonly Dino[] = DINO_IDS.map((id) => DINOS[id]);
