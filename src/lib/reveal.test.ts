// Run with `npm test` (tsc → .tsout, then node --test).

import { test } from "node:test";
import assert from "node:assert/strict";
import { DINO_IDS } from "../data/dinos";
import { TIMING, timeAtProgress } from "./motion";
import { reducedSchedule, revealSchedule, shufflePath, stageWidth } from "./reveal";
import { shareText, withArticle, withCapitalArticle } from "./share";

// A small seeded generator so a failure can be replayed.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return s / 2 ** 32;
  };
}

test("shuffle path: one per step (and any length), ends on the winner, never repeats back to back", () => {
  for (const winner of DINO_IDS) {
    for (let seed = 0; seed < 200; seed++) {
      const path = shufflePath(winner, seeded(seed));
      assert.equal(path.length, TIMING.reveal[TIMING.revealTempo].shuffleSteps.length);
      assert.equal(path.at(-1), winner);
      path.slice(1).forEach((id, i) => assert.notEqual(id, path[i], `${winner} seed ${seed} step ${i + 1}`));
    }
  }
});

test("shuffle path: even an rng stuck at 0 or 1 gives a valid path", () => {
  for (const rng of [() => 0, () => 0.999999]) {
    const path = shufflePath("trex", rng, 14);
    assert.equal(path.at(-1), "trex");
    path.slice(1).forEach((id, i) => assert.notEqual(id, path[i]));
  }
});

test("the standard curve turns halfway at 20% of its time", () => {
  assert.ok(Math.abs(timeAtProgress(0.5) - 0.2) < 1e-6);
  assert.ok(timeAtProgress(0) < 1e-6);
  assert.ok(Math.abs(timeAtProgress(1) - 1) < 1e-6);
});

const { a: A, b: B, c: C } = TIMING.reveal;

test("schedule A: the docked model, as before (plus the flip pill in the settle)", () => {
  const s = revealSchedule(false, A);
  assert.equal(s.shuffle[0], 600);
  assert.equal(s.shuffle[1], 660);
  assert.equal(s.land, 600 + 1275);
  assert.equal(s.flip, 1875 + 320);
  assert.equal(s.flash, 2195 + 72 - 60);
  assert.equal(s.hold, 2195 + 360);
  assert.equal(s.dock, s.hold);
  assert.equal(s.settle, s.hold);
  assert.equal(s.done, 2555 + 60 + 4 * 50 + 240);
});

test("schedule B: staged", () => {
  const s = revealSchedule(false, B);
  assert.equal(s.shuffle.length, 12);
  assert.equal(s.land, 700 + 1595);
  assert.equal(s.flip, 2295 + 400);
  assert.equal(s.hold, 2695 + 480);
  assert.equal(s.dock, 3175 + 600);
  assert.equal(s.settle, 3775 + 420);
  assert.equal(s.done, 4195 + 80 + 80 + 4 * 60 + 260);
});

test("schedule C: staged, theatrical", () => {
  const s = revealSchedule(false, C);
  assert.equal(s.shuffle.length, 14);
  assert.equal(s.land, 900 + 2490);
  assert.equal(s.flip, 3390 + 560);
  assert.equal(s.hold, 3950 + 720);
  assert.equal(s.dock, 4670 + 900);
  assert.equal(s.settle, 5570 + 520);
  assert.equal(s.done, 6090 + 120 + 120 + 4 * 80 + 300);
});

test("a rare lands rareBeat longer, in every tempo", () => {
  for (const tempo of [A, B, C]) {
    const common = revealSchedule(false, tempo);
    const rare = revealSchedule(true, tempo);
    assert.equal(rare.land, common.land);
    assert.equal(rare.flip - common.flip, tempo.rareBeat);
    assert.equal(rare.done - common.done, tempo.rareBeat);
  }
});

test("the flash peaks at the flip's edge-on moment for each tempo's curve", () => {
  for (const tempo of [A, B, C]) {
    const s = revealSchedule(false, tempo);
    const peak = (s.flash + tempo.flashPulse / 2 - s.flip) / tempo.revealFlip;
    // At that point of the duration, the curve's progress is a half turn.
    assert.ok(Math.abs(peak - timeAtProgress(0.5, tempo.flipEase)) < 1 / tempo.revealFlip, `${peak}`);
  }
});

test("reduced motion waits, then crossfades", () => {
  assert.deepEqual(reducedSchedule(B), { settle: 700, done: 850 });
});

test("the stage: 342 wide on a 390×844 phone, capped at 560", () => {
  assert.equal(stageWidth(390, 844), 342);
  assert.equal(stageWidth(1440, 900), 560);
  assert.equal(stageWidth(1280, 700), 400);
});

test("a / an", () => {
  assert.equal(withArticle("T-rex"), "a T-rex");
  assert.equal(withArticle("Mosasaurus"), "a Mosasaurus");
  assert.equal(withArticle("Ankylosaurus"), "an Ankylosaurus");
  assert.equal(withCapitalArticle("Ankylosaurus"), "An Ankylosaurus");
  assert.equal(shareText("trex"), "I’m a T-rex. Which dino are you?");
});
