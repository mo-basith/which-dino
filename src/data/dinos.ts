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
  // TODO(content): the fields below are placeholders until the content pass.
  // `null` / "TODO" mean "not written yet"; tighten the types once filled.
  era: string;
  lengthM: number | null;
  fact: string;
  herdWith: DinoId | null;
  avoid: DinoId | null;
};

const TODO = "TODO";

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
    era: TODO,
    lengthM: null,
    fact: TODO,
    herdWith: null,
    avoid: null,
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
    era: TODO,
    lengthM: null,
    fact: TODO,
    herdWith: null,
    avoid: null,
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
    era: TODO,
    lengthM: null,
    fact: TODO,
    herdWith: null,
    avoid: null,
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
    era: TODO,
    lengthM: null,
    fact: TODO,
    herdWith: null,
    avoid: null,
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
    era: TODO,
    lengthM: null,
    fact: TODO,
    herdWith: null,
    avoid: null,
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
    era: TODO,
    lengthM: null,
    fact: TODO,
    herdWith: null,
    avoid: null,
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
    era: TODO,
    lengthM: null,
    fact: TODO,
    herdWith: null,
    avoid: null,
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
    era: TODO,
    lengthM: null,
    fact: TODO,
    herdWith: null,
    avoid: null,
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
    era: TODO,
    lengthM: null,
    fact: TODO,
    herdWith: null,
    avoid: null,
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
    era: TODO,
    lengthM: null,
    fact: TODO,
    herdWith: null,
    avoid: null,
  },
};

/** All dinos in collector-number order. */
export const DINO_LIST: readonly Dino[] = DINO_IDS.map((id) => DINOS[id]);
