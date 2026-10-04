// The reveal's sequence ("R2 Shuffle", staged then docked), as pure data: the
// shuffle path and when each phase starts. ResultScreen.tsx plays it; no React here.
// Relative imports (not "@/") so tests can run it compiled by tsc.

import { DINO_IDS, type DinoId } from "../data/dinos";
import { EASE_FLIP_CURVE, TIMING, timeAtProgress } from "./motion";

export type RevealPhase = "wait" | "shuffle" | "land" | "flip" | "hold" | "dock" | "settle" | "done";

/**
 * The silhouettes the shuffle shows, one per shuffle step. Random, never the
 * same dino twice in a row, and always ending on the winner.
 */
export function shufflePath(
  winner: DinoId,
  rng: () => number = Math.random,
  steps: number = TIMING.shuffleSteps.length,
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

/**
 * The settle, after the title: these rise in order, restStagger apart. The
 * flip pill (under the card) comes first. Commons have no chip.
 */
export const SETTLE_ITEMS = ["flip", "chip", "oneLiner", "actions", "retake"] as const;
export type SettleItem = (typeof SETTLE_ITEMS)[number];

/** The settle items a dino's result shows, in order. */
export const settleItems = (rare: boolean): SettleItem[] => SETTLE_ITEMS.filter((item) => rare || item !== "chip");

/** When the dino's name rises: titleStagger after "You're a". */
export const NAME_DELAY = TIMING.titleStagger;

/** When the settle item at `index` (in settleItems order) starts rising, from the start of the settle. */
export const settleDelay = (index: number) => NAME_DELAY + TIMING.titleStagger + index * TIMING.restStagger;

const settleLength = (rare: boolean) =>
  Math.max(NAME_DELAY + TIMING.titleIn, settleDelay(settleItems(rare).length - 1) + TIMING.restIn);

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

export type RevealSchedule = {
  /** When each shuffle step's silhouette appears (step i shows path[i]). */
  shuffle: number[];
  land: number;
  flip: number;
  /** The flash starts rising here and peaks at the flip's edge-on moment. */
  flash: number;
  /** The flip has finished; staged, the card holds face up at stage size. */
  hold: number;
  /** The card starts moving to its slot. */
  dock: number;
  settle: number;
  done: number;
};

/** Start times in ms from the moment the reveal begins. */
export function revealSchedule(rare: boolean): RevealSchedule {
  const t = TIMING;
  const shuffle = t.shuffleSteps.map((_, i) => t.revealWait + sum(t.shuffleSteps.slice(0, i)));
  const land = t.revealWait + sum(t.shuffleSteps);
  const flip = land + t.land + (rare ? t.rareBeat : 0);
  const edgeOn = flip + Math.round(timeAtProgress(0.5, EASE_FLIP_CURVE) * t.revealFlip);
  const hold = flip + t.revealFlip;
  const dock = hold + t.stageHold;
  const settle = dock + t.dock;
  return { shuffle, land, flip, flash: edgeOn - t.flashPulse / 2, hold, dock, settle, done: settle + settleLength(rare) };
}

/** Reduced motion: no shuffle, no stage. The "?" waits, then everything crossfades in. */
export const reducedSchedule = () => ({ settle: TIMING.revealWait, done: TIMING.revealWait + TIMING.reduced });

/**
 * How long the card shows its front at stage size before the dock: from the
 * flip's edge-on moment (the front comes into view) to the dock starting.
 */
export const frontOnStage = () =>
  Math.round((1 - timeAtProgress(0.5, EASE_FLIP_CURVE)) * TIMING.revealFlip) + TIMING.stageHold;

/** The stage: the card's width while staged, from the viewport (px). */
export const STAGE = { sideMargin: 48, chrome: 200, heightRatio: 0.8, maxWidth: 560 } as const;
export const stageWidth = (viewportWidth: number, viewportHeight: number) =>
  Math.min(viewportWidth - STAGE.sideMargin, (viewportHeight - STAGE.chrome) * STAGE.heightRatio, STAGE.maxWidth);
