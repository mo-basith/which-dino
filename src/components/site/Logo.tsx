import type { MouseEventHandler } from "react";
import { Sprite } from "@/components/Sprite";
import type { DinoId } from "@/data/dinos";

// The logo (reference/design/brand/logo.png): a mini card (18×24, 1px holo
// edge, raised-2 fill, turned −10°) with the screen's dino at scale 1 stepping
// off its bottom-right corner, then "Which Dino?" in Geist Mono 500.

/** The mark alone, at a whole-number scale (1 in the header, 2 on the sleeve's emblem). */
export function LogoMark({ dino, scale = 1 }: { dino: DinoId; scale?: number }) {
  const px = (n: number) => `${n * scale}px`;
  return (
    <span aria-hidden className="inline-flex shrink-0 items-end" style={{ paddingBottom: px(1) }}>
      <span
        className="bg-holo block"
        style={{ width: px(18), height: px(24), padding: px(1), borderRadius: px(4), transform: "rotate(-10deg)" }}
      >
        <span className="block size-full bg-raised-2" style={{ borderRadius: px(3) }} />
      </span>
      {/* Steps off the card's bottom-right corner. */}
      <Sprite id={dino} size={{ scale }} silhouette className="relative" style={{ marginLeft: px(-9), marginBottom: px(-2) }} />
    </span>
  );
}

type LogoProps = {
  /** The screen's dino: each screen has its own. */
  dino: DinoId;
  href?: string;
  /** In the quiz, home is a step, not a page: it handles the click itself. */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function Logo({ dino, href = "/", onClick }: LogoProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="holo-ring -mx-1 inline-flex items-center gap-2.5 rounded-key px-1 py-1 [--ring-radius:var(--radius-key)]"
    >
      <LogoMark dino={dino} />
      <span className="font-mono text-logo">Which Dino?</span>
    </a>
  );
}
