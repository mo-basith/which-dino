import type { CSSProperties } from "react";
import { Sprite } from "@/components/Sprite";
import type { DinoId } from "@/data/dinos";

// A plain face-down card (holo frame, raised-1 face, dashed inner border) with
// a faint silhouette, and never the "?" (that's the reveal's): the home page's
// "How it works". Sized by --face-k, the card's width over 280. (The hero fan
// uses the full sleeve design, components/home/Sleeve.tsx.)

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
