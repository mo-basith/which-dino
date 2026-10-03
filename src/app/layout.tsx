import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { FOIL_CSS_VARS } from "@/lib/holo";
import { MOTION_CSS_VARS } from "@/lib/motion";
import "./globals.css";

export const metadata: Metadata = {
  title: "Which Dino?",
  description: "Six questions. One dino. A holographic card to prove it.",
};

export const viewport: Viewport = {
  themeColor: "#08090A", // ground
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      style={{ ...MOTION_CSS_VARS, ...FOIL_CSS_VARS } as CSSProperties}
      // The quiz's inline resume script may set data-quiz-resume before hydration.
      suppressHydrationWarning
    >
      <body className="min-h-full bg-ground font-sans text-text">{children}</body>
    </html>
  );
}
