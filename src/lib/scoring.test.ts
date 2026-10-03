// Run with `npm test` (tsc → .tsout, then node --test).

import { test } from "node:test";
import assert from "node:assert/strict";
import type { DinoId } from "../data/dinos";
import type { Question } from "../data/quiz";
import { score } from "./scoring";

// A small fixed quiz, so these tests don't move when the real one is rebalanced.
// Each tie case is chosen so that "first in DINO_IDS order" would pick wrong.
const question = (...pairs: [DinoId, DinoId][]): Question => ({
  id: "fixture",
  prompt: "",
  answers: pairs.map((scores) => ({ text: "", scores })) as unknown as Question["answers"],
});

const QUIZ: Question[] = [
  question(["trex", "velociraptor"], ["triceratops", "stegosaurus"], ["chicken", "mosasaurus"], ["pterodactyl", "spinosaurus"]),
  question(["trex", "brachiosaurus"], ["stegosaurus", "triceratops"], ["velociraptor", "dilophosaurus"], ["mosasaurus", "pterodactyl"]),
  question(["trex", "spinosaurus"], ["velociraptor", "chicken"], ["dilophosaurus", "trex"], ["chicken", "pterodactyl"]),
];

test("a clean win", () => {
  const { winner, totals } = score([0, 0, 0], QUIZ);
  assert.equal(winner, "trex");
  assert.equal(totals.trex, 3);
  assert.equal(totals.velociraptor, 1);
  assert.equal(totals.chicken, 0);
});

test("a two-way tie goes to the dino scored by the most recent answer", () => {
  // trex: Q1, Q2. velociraptor: Q1, Q3.
  const { winner, totals } = score([0, 0, 1], QUIZ);
  assert.deepEqual([totals.trex, totals.velociraptor], [2, 2]);
  assert.equal(winner, "velociraptor");
});

test("both tied dinos in the most recent answer: the one listed first wins", () => {
  // Both on 2, both scored last by Q2, which lists stegosaurus first.
  const { winner, totals } = score([1, 1], QUIZ);
  assert.deepEqual([totals.triceratops, totals.stegosaurus], [2, 2]);
  assert.equal(winner, "stegosaurus");
});

test("a three-way tie goes to the most recent answer, then the first listed", () => {
  // trex: Q1, Q3. velociraptor: Q1, Q2. dilophosaurus: Q2, Q3.
  // Q3 scores dilophosaurus (listed first) and trex.
  const { winner, totals } = score([0, 2, 2], QUIZ);
  assert.deepEqual([totals.trex, totals.velociraptor, totals.dilophosaurus], [2, 2, 2]);
  assert.equal(winner, "dilophosaurus");
});

test("totals cover every dino and sum to two per answer", () => {
  const { totals } = score([3, 3, 3], QUIZ);
  assert.equal(Object.keys(totals).length, 10);
  assert.equal(Object.values(totals).reduce((a, b) => a + b, 0), 6);
});
