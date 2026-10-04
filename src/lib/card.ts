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

/** The front footer: "SAM · 03.10.26", or just the date with no holder. */
export function holderLine(holder: string | undefined, hatchedAt: Date) {
  const name = holder?.trim().toUpperCase();
  return name ? `${name} · ${formatHatched(hatchedAt)}` : formatHatched(hatchedAt);
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

/** The art window, and the room the dino keeps clear inside it. */
export const ART = { height: 184, roomX: 80, roomY: 50, maxScale: 5 } as const;

/** The largest whole-number scale (max 5) at which the dino fits the art window minus 80×50. */
export function artScale(id: DinoId) {
  const grid = SPRITES[id];
  const cols = Math.max(...grid.map((row) => row.length));
  const room = contentWidth(DINOS[id].rarity) - ART.roomX;
  const fit = Math.min(room / cols, (ART.height - ART.roomY) / grid.length);
  return Math.max(1, Math.min(ART.maxScale, Math.floor(fit)));
}
