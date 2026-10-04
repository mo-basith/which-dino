// Run with `npm test` (tsc → .tsout, then node --test).

import { test } from "node:test";
import assert from "node:assert/strict";
import { DINO_IDS } from "../data/dinos";
import { TIMING, timeAtProgress } from "./motion";
import { reducedSchedule, revealSchedule, shufflePath } from "./reveal";
import { shareText, withArticle, withCapitalArticle } from "./share";

// A small seeded generator so a failure can be replayed.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return s / 2 ** 32;
  };
}

test("shuffle path: one per step, ends on the winner, never repeats back to back", () => {
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
    const path = shufflePath("trex", rng);
    assert.equal(path.at(-1), "trex");
    path.slice(1).forEach((id, i) => assert.notEqual(id, path[i]));
  }
});

test("the easing curve turns halfway at 20% of its time", () => {
  assert.ok(Math.abs(timeAtProgress(0.5) - 0.2) < 1e-6);
  assert.ok(timeAtProgress(0) < 1e-6);
  assert.ok(Math.abs(timeAtProgress(1) - 1) < 1e-6);
});

test("schedule: common", () => {
  const s = revealSchedule(false);
  assert.equal(s.shuffle[0], 600);
  assert.equal(s.shuffle[1], 660);
  assert.equal(s.land, 600 + 1275);
  assert.equal(s.flip, 1875 + 320);
  assert.equal(s.flash, 2195 + 72 - 60);
  assert.equal(s.settle, 2195 + 360);
  assert.equal(s.done, 2555 + 450);
});

test("schedule: a rare lands rareBeat longer", () => {
  const common = revealSchedule(false);
  const rare = revealSchedule(true);
  assert.equal(rare.land, common.land);
  assert.equal(rare.flip - common.flip, TIMING.rareBeat);
  assert.equal(rare.done - common.done, TIMING.rareBeat);
});

test("schedule: reduced motion waits, then crossfades", () => {
  assert.deepEqual(reducedSchedule(), { settle: 600, done: 750 });
});

test("a / an", () => {
  assert.equal(withArticle("T-rex"), "a T-rex");
  assert.equal(withArticle("Mosasaurus"), "a Mosasaurus");
  assert.equal(withArticle("Ankylosaurus"), "an Ankylosaurus");
  assert.equal(withCapitalArticle("Ankylosaurus"), "An Ankylosaurus");
  assert.equal(shareText("trex"), "I’m a T-rex. Which dino are you?");
});
