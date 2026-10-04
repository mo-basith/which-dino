import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { FOIL_CSS_VARS } from "@/lib/holo";
import { MOTION_CSS_VARS } from "@/lib/motion";
import { geistMono, geistSans } from "./fonts";
import "./globals.css";

// Absolute URLs for link previews: the production domain on Vercel, else local.
const SITE = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT ?? 3000}`;

const DESCRIPTION = "Six questions. One dino. A holographic card to prove it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Which Dino?",
  description: DESCRIPTION,
  openGraph: { title: "Which Dino?", description: DESCRIPTION, siteName: "Which Dino?", type: "website", url: "/" },
  twitter: { card: "summary_large_image", title: "Which Dino?", description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: "#08090A", // ground
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ ...MOTION_CSS_VARS, ...FOIL_CSS_VARS } as CSSProperties}
      // The quiz's inline resume script may set data-quiz-resume before hydration.
      suppressHydrationWarning
    >
      <body className="min-h-full bg-ground font-sans text-text">{children}</body>
    </html>
  );
}
