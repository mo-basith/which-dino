import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FlippableCard } from "@/components/card/FlipPill";
import { PRIMARY } from "@/components/quiz/parts";
import { Logo } from "@/components/site/Logo";
import { SiteHeader } from "@/components/site/SiteHeader";
import { DINO_IDS, DINOS, type Dino, type DinoId } from "@/data/dinos";
import { backRows } from "@/lib/card";
import { cardPath, withArticle, withCapitalArticle } from "@/lib/share";

// A friend's card, from a shared link: /c/{id}. Ids are permanent (they're
// in links people have sent). Built for all ten; any other id goes home.
// Herd and the sender's name come in later steps.

const dinoFor = (id: string): Dino | null => (DINO_IDS.includes(id as DinoId) ? DINOS[id as DinoId] : null);

export function generateStaticParams() {
  return DINO_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/c/[id]">): Promise<Metadata> {
  const dino = dinoFor((await params).id);
  if (!dino) return {};
  const title = `${withCapitalArticle(dino.name)} · Which Dino?`;
  return {
    title,
    description: dino.oneLiner,
    openGraph: { title, description: dino.oneLiner, url: cardPath(dino.id), siteName: "Which Dino?", type: "website" },
    twitter: { card: "summary_large_image", title, description: dino.oneLiner },
  };
}

export default async function SharedCardPage({ params }: PageProps<"/c/[id]">) {
  const dino = dinoFor((await params).id);
  if (!dino) redirect("/");

  return (
    <div className="overflow-clip">
      <main className="relative isolate flex min-h-dvh w-full flex-col">
        <SiteHeader logo={<Logo dino="velociraptor" />} />
        {/* Phone: one column, the button at the bottom. From 900px: card left, text right,
            centred in the height below the bar (top-aligned and scrolling if taller). */}
        <div className="site-container flex flex-1 flex-col desk:flex-row desk:items-center-safe desk:justify-start desk:gap-24 desk:py-8">
          <div className="relative mt-8 self-center short:mt-4 desk:mt-0">
            <div
              aria-hidden
              className="bg-glow pointer-events-none absolute top-[40%] left-1/2 -z-10 h-[140%] w-[200%] -translate-x-1/2 -translate-y-1/2 [--glow-alpha:0.14]"
            />
            <FlippableCard dinoId={dino.id} rows={backRows(dino.id)} width="result" />
          </div>
          <div className="mx-auto flex w-full max-w-column flex-1 flex-col desk:mx-0 desk:flex-none">
            <h1 className="mt-8 text-center text-title text-balance short:mt-6 desk:mt-0 desk:text-left desk:text-display">
              A friend is {withArticle(dino.name)}.
            </h1>
            <p className="mt-2 text-center text-body text-text-2 desk:text-left">Now find out which one you are.</p>
            <div className="mt-auto pt-8 pb-8 desk:mt-8 desk:pt-0 desk:pb-0">
              <Link href="/?start" className={PRIMARY}>
                Which dino am I?
              </Link>
              <p className="mt-4 text-center font-mono text-label text-text-3 desk:text-left">Six questions · about a minute</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
