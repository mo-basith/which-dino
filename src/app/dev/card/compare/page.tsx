import type { Metadata } from "next";
import { Card } from "@/components/card/Card";

// The four views of reference/design/card/card-j1-front-and-back.png, at the
// same positions (1360×500, cards 320px apart), for side-by-side checks.
// The back rows are the ones printed on the reference, not live quiz data.

export const metadata: Metadata = {
  title: "Dev · Card compare · Which Dino?",
  robots: { index: false, follow: false },
};

const HATCHED = new Date(2026, 9, 3);

const VIEWS = [
  { id: "trex", side: "front" },
  {
    id: "trex",
    side: "back",
    rows: [
      { label: "40 voice notes", value: 94 },
      { label: "Said it loudly", value: 91 },
      { label: "Main-character energy", value: 99 },
    ],
  },
  { id: "mosasaurus", side: "front" },
  {
    id: "mosasaurus",
    side: "back",
    rows: [
      { label: "Muted it in 2019", value: 3 },
      { label: "Stared until they left", value: 95 },
      { label: "Completely unbothered", value: 98 },
    ],
  },
] as const;

export default function DevCardComparePage() {
  return (
    <main className="relative h-[500px] w-[1360px] bg-ground">
      {VIEWS.map((view, i) => (
        <div key={i} className="absolute top-12" style={{ left: 48 + i * 320 }}>
          <Card
            dinoId={view.id}
            rows={"rows" in view ? view.rows : []}
            holder="Sam"
            hatchedAt={HATCHED}
            mode="static"
            side={view.side}
          />
        </div>
      ))}
    </main>
  );
}
