import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { CardPreview, OG_ALT, OG_CONTENT_TYPE, OG_SIZE, ogFonts } from "@/components/og/og";
import { DINO_IDS, DINOS, type DinoId } from "@/data/dinos";
import { withCapitalArticle } from "@/lib/share";

// The link preview for /c/{id}: built once per dino at build time.

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return DINO_IDS.map((id) => ({ id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!DINO_IDS.includes(id as DinoId)) notFound();
  const dino = DINOS[id as DinoId];
  return new ImageResponse(<CardPreview dinoId={dino.id} title={`${withCapitalArticle(dino.name)}.`} />, {
    ...size,
    fonts: [...(await ogFonts())],
  });
}
