// Quiz scoring. Pure functions, no React.
// Relative imports (not "@/") so scripts and tests can run it compiled by tsc.

import { DINO_IDS, type DinoId } from "../data/dinos";
import { QUIZ, type Question } from "../data/quiz";

export type ScoreResult = {
  winner: DinoId;
  totals: Record<DinoId, number>;
};

/**
 * Each answer adds 1 point to each of its two dinos; the highest total wins.
 * Ties go to the dino scored by the most recent answer; if both tied dinos
 * come from that same answer, the one listed first wins.
 *
 * `answerIndexes[i]` is the answer (0–3) picked for question i.
 */
export function score(answerIndexes: readonly number[], quiz: readonly Question[] = QUIZ): ScoreResult {
  if (answerIndexes.length === 0) throw new Error("score() needs at least one answer");

  const totals = Object.fromEntries(DINO_IDS.map((id) => [id, 0])) as Record<DinoId, number>;
  // Higher = scored more recently. Within one answer the first-listed dino ranks higher.
  const recency = Object.fromEntries(DINO_IDS.map((id) => [id, -1])) as Record<DinoId, number>;

  answerIndexes.forEach((answerIndex, q) => {
    const answer = quiz[q]?.answers[answerIndex];
    if (!answer) throw new Error(`No answer ${answerIndex} for question ${q}`);
    answer.scores.forEach((id, slot) => {
      totals[id] += 1;
      recency[id] = q * 2 + (1 - slot);
    });
  });

  const winner = DINO_IDS.reduce((best, id) =>
    totals[id] > totals[best] || (totals[id] === totals[best] && recency[id] > recency[best])
      ? id
      : best,
  );

  return { winner, totals };
}
