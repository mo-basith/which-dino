import localFont from "next/font/local";

// Geist and Geist Mono, from the geist package's own files. Declared here
// rather than via geist/font/* so we control the fallback: Next's automatic
// one for Geist drew about 3% too wide (and Geist Mono had none), so text
// shrank when the real font swapped in.
//
// Nothing may change size after first paint, so display is "optional": the
// fonts are preloaded, and if they aren't ready by first paint the page stays
// on the fallback for that view (cached Geist is used from the next one)
// rather than swapping. The fallbacks are hand-tuned @font-face rules in
// globals.css ("Geist Fallback", "Geist Mono Fallback"), matched to Geist's
// widths on this app's copy, so that view looks as close as it can.

export const geistSans = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "optional",
  adjustFontFallback: false,
});

export const geistMono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "optional",
  adjustFontFallback: false,
});
