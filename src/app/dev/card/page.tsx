import type { Metadata } from "next";
import { CardBench } from "./CardBench";

// Card test bench. Not linked from anywhere.

export const metadata: Metadata = {
  title: "Dev · Card · Which Dino?",
  robots: { index: false, follow: false },
};

export default function DevCardPage() {
  return <CardBench />;
}
