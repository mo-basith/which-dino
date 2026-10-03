// Balance simulation: every one of the 4^6 = 4,096 answer combinations,
// each assumed equally likely, scored exactly as the app scores them.
// Run with `npm run simulate`.

import { DINO_IDS, DINOS, type DinoId } from "../src/data/dinos";
import { QUIZ, type Question } from "../src/data/quiz";
import { score } from "../src/lib/scoring";

export const TARGETS = {
  common: { min: 0.11, max: 0.15 },
  rare: { min: 0.03, max: 0.06 },
} as const;

export type Row = {
  id: DinoId;
  rarity: "common" | "rare";
  wins: number;
  share: number;
  mentions: number;
  onTarget: boolean;
};

export function simulate(quiz: readonly Question[] = QUIZ): { rows: Row[]; combinations: number } {
  const combinations = 4 ** quiz.length;
  const wins = Object.fromEntries(DINO_IDS.map((id) => [id, 0])) as Record<DinoId, number>;

  for (let n = 0; n < combinations; n++) {
    const answers = quiz.map((_, q) => Math.floor(n / 4 ** q) % 4);
    wins[score(answers, quiz).winner]++;
  }

  const mentions = Object.fromEntries(DINO_IDS.map((id) => [id, 0])) as Record<DinoId, number>;
  for (const question of quiz) {
    for (const answer of question.answers) for (const id of answer.scores) mentions[id]++;
  }

  const rows = DINO_IDS.map((id) => {
    const { rarity } = DINOS[id];
    const share = wins[id] / combinations;
    const { min, max } = TARGETS[rarity];
    return { id, rarity, wins: wins[id], share, mentions: mentions[id], onTarget: share >= min && share <= max };
  });

  return { rows, combinations };
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function formatTable(rows: Row[]): string {
  const header = ["dino", "rarity", "wins", "%", "answers", ""];
  const body = rows.map((r) => [r.id, r.rarity, String(r.wins), pct(r.share), String(r.mentions), r.onTarget ? "" : "✗"]);
  const widths = header.map((_, i) => Math.max(...[header, ...body].map((row) => row[i].length)));
  const line = (row: string[]) =>
    row.map((cell, i) => (i >= 2 && i <= 4 ? cell.padStart(widths[i]) : cell.padEnd(widths[i]))).join("  ").trimEnd();
  const rares = rows.filter((r) => r.rarity === "rare").reduce((sum, r) => sum + r.share, 0);
  return [line(header), ...body.map(line), "", `rares together: ${pct(rares)}`].join("\n");
}

if (require.main === module) {
  const { rows, combinations } = simulate();
  console.log(`${combinations.toLocaleString("en")} combinations\n`);
  console.log(formatTable(rows));
  const misses = rows.filter((r) => !r.onTarget);
  console.log(
    misses.length === 0
      ? "\nAll on target (commons 11–15%, rares 3–6%)."
      : `\n${misses.length} off target (✗). Targets: commons 11–15%, rares 3–6%.`,
  );
}
