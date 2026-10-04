// Run with `npm test` (tsc → .tsout, then node --test).

import { test } from "node:test";
import assert from "node:assert/strict";
import { DINO_IDS } from "../data/dinos";
import { EASE_FLIP_CURVE, TIMING, timeAtProgress } from "./motion";
import { frontOnStage, reducedSchedule, revealSchedule, settleItems, shufflePath, stageWidth } from "./reveal";
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
      assert.equal(path.length, TIMING.shuffleSteps.length);
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

test("schedule: staged, then docked (common, so no chip in the settle)", () => {
  const s = revealSchedule(false);
  assert.equal(s.shuffle.length, 12);
  assert.equal(s.shuffle[0], 700);
  assert.equal(s.land, 700 + 1595);
  assert.equal(s.flip, 2295 + 400);
  assert.equal(s.hold, 2695 + 480);
  assert.equal(s.dock, 3175 + 600);
  assert.equal(s.settle, 3775 + 420);
  // Name at +80, then flip pill, one-liner, actions, retake from +160, 60 apart.
  assert.equal(s.done, 4195 + 80 + 80 + 3 * 60 + 260);
});

test("a rare lands rareBeat longer, and its chip adds one stagger step", () => {
  const common = revealSchedule(false);
  const rare = revealSchedule(true);
  assert.equal(rare.land, common.land);
  assert.equal(rare.flip - common.flip, TIMING.rareBeat);
  assert.equal(rare.done - common.done, TIMING.rareBeat + TIMING.restStagger);
});

test("settle items: commons have no chip", () => {
  assert.deepEqual(settleItems(false), ["flip", "oneLiner", "actions", "retake"]);
  assert.deepEqual(settleItems(true), ["flip", "chip", "oneLiner", "actions", "retake"]);
});

test("the flash peaks at the flip's edge-on moment", () => {
  const s = revealSchedule(false);
  const peak = (s.flash + TIMING.flashPulse / 2 - s.flip) / TIMING.revealFlip;
  assert.ok(Math.abs(peak - timeAtProgress(0.5, EASE_FLIP_CURVE)) < 1 / TIMING.revealFlip, `${peak}`);
});

test("the front shows on stage from edge-on to the dock", () => {
  const s = revealSchedule(false);
  assert.equal(frontOnStage(), s.dock - (s.flash + TIMING.flashPulse / 2));
});

test("reduced motion waits, then crossfades", () => {
  assert.deepEqual(reducedSchedule(), { settle: 700, done: 850 });
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
