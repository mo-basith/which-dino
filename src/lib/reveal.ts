// The reveal's sequence ("R2 Shuffle"), as pure data: the shuffle path and
// when each phase starts, for a tempo. ResultScreen.tsx plays it; no React here.
// Relative imports (not "@/") so tests can run it compiled by tsc.

import { DINO_IDS, type DinoId } from "../data/dinos";
import { TIMING, timeAtProgress, type RevealTempo, type TempoId } from "./motion";

export type RevealPhase = "wait" | "shuffle" | "land" | "flip" | "hold" | "dock" | "settle" | "done";

export const TEMPO_IDS = Object.keys(TIMING.reveal) as TempoId[];
export const isTempoId = (value: unknown): value is TempoId => TEMPO_IDS.includes(value as TempoId);

/**
 * The silhouettes the shuffle shows, one per shuffle step. Random, never the
 * same dino twice in a row, and always ending on the winner.
 */
export function shufflePath(
  winner: DinoId,
  rng: () => number = Math.random,
  steps: number = TIMING.reveal[TIMING.revealTempo].shuffleSteps.length,
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
 * flip pill (under the card) comes first.
 */
export const SETTLE_ITEMS = ["flip", "chip", "oneLiner", "actions", "retake"] as const;

/** When the dino's name rises: with the lead on one line (unstaged), or titleStagger after it. */
export const nameDelay = (tempo: RevealTempo) => (tempo.staged ? tempo.titleStagger : 0);

/** When each settle item starts rising, from the start of the settle. */
export const settleDelay = (tempo: RevealTempo, index: number) =>
  nameDelay(tempo) + tempo.titleStagger + index * tempo.restStagger;

const settleLength = (tempo: RevealTempo) =>
  Math.max(nameDelay(tempo) + tempo.titleIn, settleDelay(tempo, SETTLE_ITEMS.length - 1) + tempo.restIn);

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
  /** The card starts moving to its slot (the same as settle when unstaged). */
  dock: number;
  settle: number;
  done: number;
};

/** Start times in ms from the moment the reveal begins. */
export function revealSchedule(rare: boolean, tempo: RevealTempo): RevealSchedule {
  const shuffle = tempo.shuffleSteps.map((_, i) => tempo.revealWait + sum(tempo.shuffleSteps.slice(0, i)));
  const land = tempo.revealWait + sum(tempo.shuffleSteps);
  const flip = land + tempo.land + (rare ? tempo.rareBeat : 0);
  const edgeOn = flip + Math.round(timeAtProgress(0.5, tempo.flipEase) * tempo.revealFlip);
  const hold = flip + tempo.revealFlip;
  const dock = hold + (tempo.staged ? tempo.stageHold : 0);
  const settle = dock + (tempo.staged ? tempo.dock : 0);
  return { shuffle, land, flip, flash: edgeOn - tempo.flashPulse / 2, hold, dock, settle, done: settle + settleLength(tempo) };
}

/** Reduced motion: no shuffle, no stage. The "?" waits, then everything crossfades in. */
export const reducedSchedule = (tempo: RevealTempo) => ({
  settle: tempo.revealWait,
  done: tempo.revealWait + TIMING.reduced,
});

/**
 * How long the card shows its front at stage size before the dock: from the
 * flip's edge-on moment (the front comes into view) to the dock starting.
 */
export const frontOnStage = (tempo: RevealTempo) =>
  tempo.staged ? Math.round((1 - timeAtProgress(0.5, tempo.flipEase)) * tempo.revealFlip) + tempo.stageHold : 0;

/** The stage: the card's width while staged, from the viewport (px). */
export const STAGE = { sideMargin: 48, chrome: 200, heightRatio: 0.8, maxWidth: 560 } as const;
export const stageWidth = (viewportWidth: number, viewportHeight: number) =>
  Math.min(viewportWidth - STAGE.sideMargin, (viewportHeight - STAGE.chrome) * STAGE.heightRatio, STAGE.maxWidth);
