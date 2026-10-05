import { wallpaperSvg } from "@/lib/wallpaper";

// The sleeve's dino wallpaper (src/lib/wallpaper.ts), built once at build time.
export const dynamic = "force-static";

export function GET() {
  return new Response(wallpaperSvg(), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
