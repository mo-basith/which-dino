import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/card/Card";
import { Brand, PRIMARY, TopBar } from "@/components/quiz/parts";
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
    <div className="overflow-x-clip">
      <main className="relative isolate mx-auto flex min-h-dvh w-full max-w-column flex-col px-gutter">
        <TopBar left={<Brand mark="velociraptor" />} />
        <div className="relative mt-8 self-center short:mt-4">
          <div
            aria-hidden
            className="bg-glow pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[160%] w-[200%] -translate-x-1/2 -translate-y-1/2 [--glow-alpha:0.14]"
          />
          <Card dinoId={dino.id} rows={backRows(dino.id)} mode="interactive" width="interactive" />
        </div>
        <h1 className="mt-10 short:mt-6 text-center text-title text-balance">A friend is {withArticle(dino.name)}.</h1>
        <p className="mt-2 text-center text-body text-text-2">Now find out which one you are.</p>
        <div className="mt-auto pt-8 pb-8">
          <Link href="/?start" className={PRIMARY}>
            Which dino am I?
          </Link>
          <p className="mt-4 text-center font-mono text-label text-text-3">Six questions · about a minute</p>
        </div>
      </main>
    </div>
  );
}
