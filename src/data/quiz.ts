// The six questions. Copy from reference/dino-v0/README-dino.md; the pairings
// are tuned from the exhaustive simulation (`npm run simulate`), never by hand.
// Each answer adds one point to each of its two dinos. Data only; scoring
// logic lives elsewhere.

import type { DinoId } from "./dinos";

export type Answer = {
  text: string;
  scores: readonly [DinoId, DinoId];
  /** The phrase printed on the card back. */
  cardLine: string;
  /** The bar value printed next to it, 0–99. */
  value: number;
};

export type Question = {
  id: string;
  prompt: string;
  answers: readonly [Answer, Answer, Answer, Answer];
};

export const QUIZ: readonly Question[] = [
  {
    id: "saturday",
    prompt: "It’s Saturday morning. You’re…",
    answers: [
      { text: "Still asleep. Obviously.", scores: ["stegosaurus", "brachiosaurus"], cardLine: "Asleep till noon", value: 96 },
      { text: "On your third plan of the day", scores: ["velociraptor", "spinosaurus"], cardLine: "Third plan by 10am", value: 88 },
      { text: "At brunch with the group chat", scores: ["triceratops", "dilophosaurus"], cardLine: "Brunch regular", value: 90 },
      { text: "Somewhere nobody can find you", scores: ["pterodactyl", "mosasaurus"], cardLine: "Unreachable", value: 97 },
    ],
  },
  {
    id: "snack",
    prompt: "Pick a snack.",
    answers: [
      { text: "The whole buffet", scores: ["trex", "spinosaurus"], cardLine: "The whole buffet", value: 99 },
      { text: "Whatever’s left over", scores: ["chicken", "velociraptor"], cardLine: "Eats the leftovers", value: 85 },
      { text: "Something spicy", scores: ["dilophosaurus", "spinosaurus"], cardLine: "Extra spicy", value: 93 },
      { text: "Seafood, always", scores: ["mosasaurus", "pterodactyl"], cardLine: "Seafood, always", value: 99 },
    ],
  },
  {
    id: "group-chat",
    prompt: "Your role in the group chat?",
    answers: [
      { text: "Sends the plans", scores: ["velociraptor", "trex"], cardLine: "Sends the plans", value: 95 },
      { text: "Sends 40 voice notes", scores: ["trex", "dilophosaurus"], cardLine: "40 voice notes", value: 94 },
      { text: "Reacts, never replies", scores: ["stegosaurus", "pterodactyl"], cardLine: "Reacts, never replies", value: 82 },
      { text: "Muted it in 2019", scores: ["brachiosaurus", "stegosaurus"], cardLine: "Muted it in 2019", value: 3 },
    ],
  },
  {
    id: "queue",
    prompt: "Someone cuts the queue. You…",
    answers: [
      { text: "Say it loudly. Everyone hears.", scores: ["trex", "dilophosaurus"], cardLine: "Said it loudly", value: 91 },
      { text: "Stare until they leave", scores: ["triceratops", "mosasaurus"], cardLine: "Stared until they left", value: 95 },
      { text: "Let it go. Life’s short.", scores: ["brachiosaurus", "stegosaurus"], cardLine: "Let it go", value: 88 },
      { text: "Somehow end up ahead of them", scores: ["velociraptor", "chicken"], cardLine: "Ended up ahead anyway", value: 96 },
    ],
  },
  {
    id: "superpower",
    prompt: "Pick a superpower.",
    answers: [
      { text: "Flying", scores: ["brachiosaurus", "pterodactyl"], cardLine: "Would rather fly", value: 92 },
      { text: "Being completely unbothered", scores: ["stegosaurus", "mosasaurus"], cardLine: "Completely unbothered", value: 98 },
      { text: "Main-character energy", scores: ["spinosaurus", "trex"], cardLine: "Main-character energy", value: 99 },
      { text: "Reading the room", scores: ["triceratops", "velociraptor"], cardLine: "Reads the room", value: 94 },
    ],
  },
  {
    id: "rest-of-today",
    prompt: "The rest of today is…",
    answers: [
      { text: "Chaos", scores: ["dilophosaurus", "velociraptor"], cardLine: "Chooses chaos", value: 97 },
      { text: "A nap", scores: ["brachiosaurus", "stegosaurus"], cardLine: "Nap scheduled", value: 89 },
      { text: "A chance to show off", scores: ["spinosaurus", "trex"], cardLine: "Showing off later", value: 93 },
      { text: "Something to survive", scores: ["triceratops", "chicken"], cardLine: "Just surviving", value: 61 },
    ],
  },
];
