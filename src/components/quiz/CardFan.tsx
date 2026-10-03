import { Sprite } from "@/components/Sprite";
import type { DinoId } from "@/data/dinos";

// Three face-down cards fanned out on the intro. Static layout, not motion.
const CARD_W = 150;
const CARD_H = 188;
// The side cards rotate around a point this far below the top of the card.
const PIVOT_Y = 210;

const FAN: { id: DinoId; x: number; rotate: number }[] = [
  { id: "velociraptor", x: -46, rotate: -9 },
  { id: "triceratops", x: 46, rotate: 9 },
  { id: "trex", x: 0, rotate: 0 }, // last, so it sits on top
];

export function CardFan({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative mx-auto ${className}`}
      style={{
        width: CARD_W,
        height: CARD_H,
        // rounded-card is 16 at 280px wide; scale it with the card.
        ["--card-radius" as string]: `calc(var(--radius-card) * ${CARD_W} / 280)`,
      }}
      aria-hidden
    >
      {FAN.map(({ id, x, rotate }) => (
        <div
          key={id}
          className="absolute inset-0"
          style={{
            transform: `translateX(${x}px) rotate(${rotate}deg)`,
            transformOrigin: `50% ${PIVOT_Y}px`,
          }}
        >
          <FaceDownCard id={id} />
        </div>
      ))}
    </div>
  );
}

function FaceDownCard({ id }: { id: DinoId }) {
  return (
    <div className="bg-holo size-full rounded-(--card-radius) p-px shadow-[0_24px_48px_-12px_rgb(0_0_0/0.6)]">
      <div className="relative grid size-full place-items-center rounded-[calc(var(--card-radius)-1px)] bg-raised-1">
        <div className="absolute inset-2.5 rounded-[max(4px,calc(var(--card-radius)-10px))] border border-dashed border-line-dashed" />
        <Sprite id={id} size={{ scale: 3 }} color="var(--color-line-strong)" silhouette cells />
      </div>
    </div>
  );
}
