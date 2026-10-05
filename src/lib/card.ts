// What a card prints. Pure functions, no React.
// Relative imports (not "@/") so tests can run it compiled by tsc.

import { DINOS, type Dino, type DinoId, type Rarity } from "../data/dinos";
import { QUIZ, type Question } from "../data/quiz";
import { SPRITES } from "../data/sprites";

export type CardRow = { label: string; value: number };

export const BACK_ROWS = 3;

/**
 * The rows on a card's back. Takes the answers that scored `dinoId` (the
 * winner), in question order, and keeps the last three. Any rows still empty
 * are topped up from the dino's README stats, in listed order. With no
 * answers (a friend's card arriving by link) it is just the three stats.
 *
 * `answerIndexes[i]` is the answer (0–3) picked for question i.
 */
export function backRows(
  dinoId: DinoId,
  answerIndexes: readonly number[] = [],
  quiz: readonly Question[] = QUIZ,
): CardRow[] {
  const fromAnswers = answerIndexes
    .map((answerIndex, q) => quiz[q]?.answers[answerIndex])
    .filter((answer) => answer?.scores.includes(dinoId))
    .map((answer) => ({ label: answer!.cardLine, value: answer!.value }))
    .slice(-BACK_ROWS);

  const topUp = DINOS[dinoId].stats.slice(0, BACK_ROWS - fromAnswers.length);
  return [...fromAnswers, ...topUp.map(({ label, value }) => ({ label, value }))];
}

const two = (n: number) => String(n).padStart(2, "0");

/** A row's value as printed: always two digits ("03"). */
export const formatValue = (value: number) => two(Math.min(99, Math.max(0, Math.round(value))));

/** Filled blocks in a 20-block bar. */
export const BAR_BLOCKS = 20;
export const filledBlocks = (value: number) =>
  Math.min(BAR_BLOCKS, Math.max(0, Math.round(value / 5)));

/**
 * Where a rare card's bar block sits on the holo gradient (0–1). Every bar runs
 * the first 40% of it, pink → yellow → mint, as on the J1 reference.
 */
export const BAR_HOLO_SPAN = 0.4;
export const blockHoloAt = (index: number) => (BAR_HOLO_SPAN * (index + 0.5)) / BAR_BLOCKS;

/** The hatch date as printed, DD.MM.YY in the viewer's local time: "03.10.26". */
export const formatHatched = (date: Date) =>
  `${two(date.getDate())}.${two(date.getMonth() + 1)}.${two(date.getFullYear() % 100)}`;

/**
 * The front footer: "SAM · 03.10.26", just the date with no holder, or just
 * the name with no date (a friend's card arriving by link has neither yet).
 */
export function holderLine(holder: string | undefined, hatchedAt: Date | undefined) {
  const name = holder?.trim().toUpperCase();
  return [name, hatchedAt && formatHatched(hatchedAt)].filter(Boolean).join(" · ");
}

/** The scale bar: "12 M", "0.4 M", "1 M WINGSPAN". */
export const scaleLabel = (dino: Pick<Dino, "lengthM" | "span">) =>
  `${dino.lengthM} M${dino.span === "wingspan" ? " WINGSPAN" : ""}`;

/** Card design size. Every other size is this, scaled as a whole. */
export const CARD = { width: 280, height: 350, radius: 16, padding: 16 } as const;

/** The frame (holo on commons, prism on rares) is this many design px wide. */
export const FRAME: Record<Rarity, number> = { common: 1, rare: 2 };

/** Width of everything inside the frame and padding: 246 on commons, 244 on rares. */
export const contentWidth = (rarity: Rarity) => CARD.width - 2 * (FRAME[rarity] + CARD.padding);

/**
 * The art window (184 tall), the ground line (29 up from its bottom; the dino
 * and the human stand on it), and the box the dino fills: from x 44 (clear of
 * the human) to the window's right edge − 14, and from 28 below the window's
 * top (room for the era label) down to the ground line.
 */
export const ART = { height: 184, ground: 29, boxLeft: 44, boxRight: 14, boxTop: 28, maxScale: 8 } as const;

/** The dino's box inside the art window, in design px: 188 × 126 on commons, 186 × 126 on rares. */
export const artBox = (rarity: Rarity) => ({
  left: ART.boxLeft,
  width: contentWidth(rarity) - ART.boxLeft - ART.boxRight,
  height: ART.height - ART.ground - 1 - ART.boxTop,
});

const gridSize = (id: DinoId) => {
  const grid = SPRITES[id];
  return { cols: Math.max(...grid.map((row) => row.length)), rows: grid.length };
};

/** The largest whole-number scale (max 8) at which the dino fits its box. */
export function artScale(id: DinoId) {
  const { cols, rows } = gridSize(id);
  const box = artBox(DINOS[id].rarity);
  return Math.max(1, Math.min(ART.maxScale, Math.floor(Math.min(box.width / cols, box.height / rows))));
}

/** Where the dino's left edge sits in the art window: centred in its box, on whole pixels. */
export function artLeft(id: DinoId) {
  const box = artBox(DINOS[id].rarity);
  return box.left + Math.round((box.width - gridSize(id).cols * artScale(id)) / 2);
}

/**
 * The face-down sleeve: a dashed border inset 14px, the box the reveal's
 * silhouettes fit (centred on the card), and the "?" mark's scale.
 */
export const SLEEVE = { inset: 14, artWidth: 160, artHeight: 112, markScale: 8 } as const;

/** The largest whole-number scale at which a dino's silhouette fits the sleeve's art box. */
export function sleeveScale(id: DinoId) {
  const grid = SPRITES[id];
  const cols = Math.max(...grid.map((row) => row.length));
  return Math.max(1, Math.floor(Math.min(SLEEVE.artWidth / cols, SLEEVE.artHeight / grid.length)));
}
