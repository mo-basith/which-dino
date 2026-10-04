// Run with `npm test` (tsc → .tsout, then node --test).

import { test } from "node:test";
import assert from "node:assert/strict";
import type { DinoId } from "../data/dinos";
import type { Question } from "../data/quiz";
import { backRows, blockHoloAt, filledBlocks, formatHatched, formatValue, holderLine, scaleLabel } from "./card";

// A fixed quiz so these tests don't move when the real one is rebalanced.
// Answer 0 of every question scores trex; answer 1 never does.
const question = (n: number, ...pairs: [DinoId, DinoId][]): Question => ({
  id: `q${n}`,
  prompt: "",
  answers: pairs.map((scores, a) => ({ text: "", scores, cardLine: `Q${n}${"abcd"[a]}`, value: n * 10 + a })) as unknown as Question["answers"],
});

const QUIZ: Question[] = [1, 2, 3, 4, 5, 6].map((n) =>
  question(n, ["trex", "velociraptor"], ["stegosaurus", "chicken"], ["chicken", "trex"], ["mosasaurus", "pterodactyl"]),
);

// trex's README stats, in listed order.
const STATS = [
  { label: "Main char", value: 99 },
  { label: "Arm reach", value: 8 },
  { label: "Volume", value: 94 },
];

test("no answers: the three README stats", () => {
  assert.deepEqual(backRows("trex", [], QUIZ), STATS);
  assert.deepEqual(backRows("trex", undefined, QUIZ), STATS);
});

test("no answers scored the dino: the three README stats", () => {
  assert.deepEqual(backRows("trex", [1, 1, 1, 1, 1, 1], QUIZ), STATS);
});

test("one qualifying answer comes first, topped up with the first two stats", () => {
  assert.deepEqual(backRows("trex", [1, 1, 0, 1, 1, 1], QUIZ), [{ label: "Q3a", value: 30 }, STATS[0], STATS[1]]);
});

test("two qualifying answers, in question order, then the first stat", () => {
  // Answer c also scores trex (listed second); either slot counts.
  assert.deepEqual(backRows("trex", [2, 1, 1, 1, 0, 1], QUIZ), [
    { label: "Q1c", value: 12 },
    { label: "Q5a", value: 50 },
    STATS[0],
  ]);
});

test("exactly three qualifying answers: all three, no stats", () => {
  assert.deepEqual(backRows("trex", [0, 1, 0, 1, 2, 1], QUIZ), [
    { label: "Q1a", value: 10 },
    { label: "Q3a", value: 30 },
    { label: "Q5c", value: 52 },
  ]);
});

test("more than three: the last three in question order", () => {
  assert.deepEqual(backRows("trex", [0, 0, 2, 0, 0, 0], QUIZ), [
    { label: "Q4a", value: 40 },
    { label: "Q5a", value: 50 },
    { label: "Q6a", value: 60 },
  ]);
});

test("a partly answered quiz only counts the answers given", () => {
  assert.deepEqual(backRows("trex", [0, 0], QUIZ), [{ label: "Q1a", value: 10 }, { label: "Q2a", value: 20 }, STATS[0]]);
});

test("values print as two digits and fill round(value / 5) blocks", () => {
  assert.equal(formatValue(3), "03");
  assert.equal(formatValue(99), "99");
  assert.deepEqual([0, 3, 94, 95, 99].map(filledBlocks), [0, 1, 19, 19, 20]);
  assert.equal(filledBlocks(97), 19);
  assert.equal(filledBlocks(98), 20);
});

test("hatch date and holder line", () => {
  const date = new Date(2026, 9, 3);
  assert.equal(formatHatched(date), "03.10.26");
  assert.equal(holderLine("Sam", date), "SAM · 03.10.26");
  assert.equal(holderLine("  ", date), "03.10.26");
  assert.equal(holderLine(undefined, date), "03.10.26");
  assert.equal(holderLine("Sam", undefined), "SAM");
  assert.equal(holderLine(undefined, undefined), "");
});

test("scale label: length, decimals, wingspan", () => {
  assert.equal(scaleLabel({ lengthM: 12, span: "length" }), "12 M");
  assert.equal(scaleLabel({ lengthM: 0.4, span: "length" }), "0.4 M");
  assert.equal(scaleLabel({ lengthM: 1, span: "wingspan" }), "1 M WINGSPAN");
});

test("rare bar blocks run the first 40% of the holo gradient, left to right", () => {
  assert.equal(blockHoloAt(0), 0.01);
  assert.ok(Math.abs(blockHoloAt(19) - 0.39) < 1e-9);
  assert.ok(blockHoloAt(10) > blockHoloAt(9));
});
