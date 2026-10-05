import type { Metadata } from "next";
import { Card } from "@/components/card/Card";
import { DINO_LIST } from "@/data/dinos";

// All ten card fronts at 280, for checking the art (size rule, new grids) at a glance.

export const metadata: Metadata = {
  title: "Dev · Card fronts · Which Dino?",
  robots: { index: false, follow: false },
};

// Noon UTC, so it prints 03.10.26 in any time zone.
const HATCHED = new Date(Date.UTC(2026, 9, 3, 12));

export default function DevCardFrontsPage() {
  return (
    <main className="grid w-max grid-cols-5 gap-6 bg-ground p-12">
      {DINO_LIST.map((dino) => (
        <Card key={dino.id} dinoId={dino.id} rows={[]} holder="Sam" hatchedAt={HATCHED} mode="static" side="front" />
      ))}
    </main>
  );
}
