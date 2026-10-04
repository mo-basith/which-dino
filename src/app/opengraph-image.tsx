import { ImageResponse } from "next/og";
import { HomePreview, OG_CONTENT_TYPE, OG_SIZE, ogFonts } from "@/components/og/og";

// The home page's link preview: three face-down cards.

export const alt = "Which Dino? Six questions, one holographic card.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(<HomePreview />, { ...size, fonts: [...(await ogFonts())] });
}
