// The six questions. Copy and scoring from reference/dino-v0/README-dino.md,
// copied as written: balance is tuned later from a full simulation, not by hand.
// Each answer adds one point to each of its two dinos. Data only; scoring
// logic lives elsewhere.

import type { DinoId } from "./dinos";

export type Answer = {
  text: string;
  scores: readonly [DinoId, DinoId];
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
      { text: "Still asleep. Obviously.", scores: ["stegosaurus", "brachiosaurus"] },
      { text: "On your third plan of the day", scores: ["velociraptor", "spinosaurus"] },
      { text: "At brunch with the group chat", scores: ["triceratops", "chicken"] },
      { text: "Somewhere nobody can find you", scores: ["pterodactyl", "mosasaurus"] },
    ],
  },
  {
    id: "snack",
    prompt: "Pick a snack.",
    answers: [
      { text: "The whole buffet", scores: ["trex", "brachiosaurus"] },
      { text: "Whatever’s left over", scores: ["chicken", "velociraptor"] },
      { text: "Something spicy", scores: ["dilophosaurus", "spinosaurus"] },
      { text: "Seafood, always", scores: ["mosasaurus", "pterodactyl"] },
    ],
  },
  {
    id: "group-chat",
    prompt: "Your role in the group chat?",
    answers: [
      { text: "Sends the plans", scores: ["velociraptor", "triceratops"] },
      { text: "Sends 40 voice notes", scores: ["trex", "dilophosaurus"] },
      { text: "Reacts, never replies", scores: ["stegosaurus", "pterodactyl"] },
      { text: "Muted it in 2019", scores: ["mosasaurus", "brachiosaurus"] },
    ],
  },
  {
    id: "queue",
    prompt: "Someone cuts the queue. You…",
    answers: [
      { text: "Say it loudly. Everyone hears.", scores: ["trex", "dilophosaurus"] },
      { text: "Stare until they leave", scores: ["triceratops", "mosasaurus"] },
      { text: "Let it go. Life’s short.", scores: ["brachiosaurus", "stegosaurus"] },
      { text: "Somehow end up ahead of them", scores: ["velociraptor", "chicken"] },
    ],
  },
  {
    id: "superpower",
    prompt: "Pick a superpower.",
    answers: [
      { text: "Flying", scores: ["pterodactyl", "chicken"] },
      { text: "Being completely unbothered", scores: ["stegosaurus", "mosasaurus"] },
      { text: "Main-character energy", scores: ["trex", "spinosaurus"] },
      { text: "Reading the room", scores: ["velociraptor", "triceratops"] },
    ],
  },
  {
    id: "rest-of-today",
    prompt: "The rest of today is…",
    answers: [
      { text: "Chaos", scores: ["dilophosaurus", "velociraptor"] },
      { text: "A nap", scores: ["brachiosaurus", "stegosaurus"] },
      { text: "A chance to show off", scores: ["spinosaurus", "trex"] },
      { text: "Something to survive", scores: ["chicken", "triceratops"] },
    ],
  },
];
