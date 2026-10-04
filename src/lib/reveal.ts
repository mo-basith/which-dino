// The reveal's sequence ("R2 Shuffle"), as pure data: the shuffle path and
// when each phase starts. Reveal.tsx plays it; no React here.
// Relative imports (not "@/") so tests can run it compiled by tsc.

import { DINO_IDS, type DinoId } from "../data/dinos";
import { TIMING, timeAtProgress } from "./motion";

export type RevealPhase = "wait" | "shuffle" | "land" | "flip" | "settle" | "done";

/**
 * The silhouettes the shuffle shows, one per TIMING.shuffleSteps entry. Random,
 * never the same dino twice in a row, and always ending on the winner.
 */
export function shufflePath(
  winner: DinoId,
  rng: () => number = Math.random,
  steps = TIMING.shuffleSteps.length,
  ids: readonly DinoId[] = DINO_IDS,
): DinoId[] {
  const path: DinoId[] = [];
  for (let i = 0; i < steps - 1; i++) {
    const prev = path[i - 1];
    // The second to last can't be the winner either, or the last step repeats it.
    const options = ids.filter((id) => id !== prev && (i < steps - 2 || id !== winner));
    path.push(options[Math.min(options.length - 1, Math.floor(rng() * options.length))]);
  }
  path.push(winner);
  return path;
}

/** Settle: the title, then these after it, in order. */
export const SETTLE_ITEMS = ["chip", "oneLiner", "actions", "retake"] as const;

/** When each settle item starts rising in, from the start of the settle. */
export const settleDelay = (index: number) => TIMING.titleStagger + index * TIMING.restStagger;

const SETTLE = Math.max(TIMING.titleIn, settleDelay(SETTLE_ITEMS.length - 1) + TIMING.restIn);

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

export type RevealSchedule = {
  /** When each shuffle step's silhouette appears (step i shows path[i]). */
  shuffle: number[];
  land: number;
  flip: number;
  /** The flash starts rising here and peaks at the flip's halfway turn. */
  flash: number;
  settle: number;
  done: number;
};

/** Start times in ms from the moment the reveal begins. */
export function revealSchedule(rare: boolean): RevealSchedule {
  const shuffle = TIMING.shuffleSteps.map((_, i) => TIMING.revealWait + sum(TIMING.shuffleSteps.slice(0, i)));
  const land = TIMING.revealWait + sum(TIMING.shuffleSteps);
  const flip = land + TIMING.land + (rare ? TIMING.rareBeat : 0);
  const halfway = flip + Math.round(timeAtProgress(0.5) * TIMING.revealFlip);
  const settle = flip + TIMING.revealFlip;
  return { shuffle, land, flip, flash: halfway - TIMING.flashPulse / 2, settle, done: settle + SETTLE };
}

/** Reduced motion: no shuffle. The "?" waits, then everything crossfades in. */
export const reducedSchedule = () => ({ settle: TIMING.revealWait, done: TIMING.revealWait + TIMING.reduced });
