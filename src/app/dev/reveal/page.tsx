import type { Metadata } from "next";
import { DINO_IDS, type DinoId } from "@/data/dinos";
import { TIMING } from "@/lib/motion";
import { isTempoId } from "@/lib/reveal";
import { RevealBench } from "./RevealBench";

// Reveal test bench: pick a dino, replay or loop, simulate reduced motion. Not linked from anywhere.
// For captures: ?dino=mosasaurus and ?tempo=a|b|c start there; ?bare hides the panel and plays once.

export const metadata: Metadata = {
  title: "Dev · Reveal · Which Dino?",
  robots: { index: false, follow: false },
};

export default async function DevRevealPage({ searchParams }: PageProps<"/dev/reveal">) {
  const { dino, tempo, bare } = await searchParams;
  const initial = DINO_IDS.includes(dino as DinoId) ? (dino as DinoId) : "trex";
  return (
    <RevealBench
      initialDino={initial}
      initialTempo={isTempoId(tempo) ? tempo : TIMING.revealTempo}
      bare={bare !== undefined}
    />
  );
}
