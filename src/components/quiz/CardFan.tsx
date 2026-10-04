import type { CSSProperties } from "react";
import { Sprite } from "@/components/Sprite";
import type { DinoId } from "@/data/dinos";

// Face-down cards: the sleeve's look (holo frame, raised-1 face, dashed inner
// border) with a faint silhouette, and never the "?" (that's the reveal's).
// Static layout, not motion. Everything is sized by --face-k, the card's
// width over 280, so one set of markup serves every breakpoint.

export function FaceDownCard({ id, className = "", style }: { id: DinoId; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`bg-holo rounded-[calc(var(--radius-card)*var(--face-k))] p-px shadow-[0_24px_48px_-12px_rgb(0_0_0/0.6)] ${className}`}
      style={{ width: "calc(280px * var(--face-k))", height: "calc(350px * var(--face-k))", ...style }}
    >
      <div className="relative grid size-full place-items-center rounded-[calc(var(--radius-card)*var(--face-k)-1px)] bg-raised-1">
        <div className="absolute inset-2.5 rounded-[max(4px,calc(var(--radius-card)*var(--face-k)-10px))] border border-dashed border-line-dashed" />
        <Sprite id={id} size={{ scale: 3 }} color="var(--color-line-strong)" silhouette cells />
      </div>
    </div>
  );
}

// Three face-down cards fanned out. The side cards move --fan-x (× the card's
// width) and turn --fan-rot around a point below the card.
const FAN: { id: DinoId; side: -1 | 0 | 1 }[] = [
  { id: "velociraptor", side: -1 },
  { id: "triceratops", side: 1 },
  { id: "trex", side: 0 }, // last, so it sits on top
];

export function CardFan({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: "calc(280px * var(--face-k))", height: "calc(350px * var(--face-k))" }}
      aria-hidden
    >
      {FAN.map(({ id, side }) => (
        <FaceDownCard
          key={id}
          id={id}
          className="absolute inset-0"
          style={{
            transform: `translateX(calc(280px * var(--face-k) * var(--fan-x) * ${side})) rotate(calc(var(--fan-rot) * ${side}))`,
            transformOrigin: "50% calc(350px * var(--face-k) * 1.12)",
          }}
        />
      ))}
    </div>
  );
}
