"use client";

import { useRef, useState } from "react";
import type { DinoId } from "@/data/dinos";
import type { CardRow } from "@/lib/card";
import { CardScale, InteractiveCard, type CardControls, type CardWidth } from "./Card";
import type { Side } from "./faces";

// The flip, made visible: a small pill under an interactive card. The visible
// text follows the side ("Flip card" ↔ "Show front"); the accessible name stays
// "Flip card" and aria-pressed carries which side is showing.

type PillLabels = { front: string; back: string };
/** The visible text while each side is showing. */
const LABELS: PillLabels = { front: "Flip card", back: "Show front" };

export function FlipPill({
  side,
  onFlip,
  labels = LABELS,
  className = "",
}: {
  side: Side;
  onFlip: () => void;
  labels?: PillLabels;
  className?: string;
}) {
  const back = side === "back";
  return (
    <button
      type="button"
      aria-label="Flip card"
      aria-pressed={back}
      onClick={onFlip}
      className={`press holo-ring inline-grid h-9 items-center rounded-full border border-line bg-raised-1 px-4 text-small text-text [--ring-radius:9999px] before:absolute before:-inset-1 before:content-[''] ${className}`}
    >
      {/* Both labels share one cell, so the pill keeps the wider one's width. */}
      <span aria-hidden className="col-start-1 row-start-1 flex items-center justify-center gap-2">
        <RotateIcon />
        <span className="grid">
          <span className={`fade col-start-1 row-start-1 ${back ? "opacity-0" : "opacity-100"}`}>{labels.front}</span>
          <span className={`fade col-start-1 row-start-1 ${back ? "opacity-100" : "opacity-0"}`}>{labels.back}</span>
        </span>
      </span>
    </button>
  );
}

function RotateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="text-text-2">
      <path
        d="M11.5 7a4.5 4.5 0 1 1-1.32-3.18M11.5 2v2.5H9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Flip the card from outside, and know which side it shows. */
export function useCardFlip(initial: Side = "front") {
  const controls = useRef<CardControls>(null);
  const [side, setSide] = useState<Side>(initial);
  return { controls, side, onSideChange: setSide, flip: () => controls.current?.flip() };
}

type FlippableCardProps = {
  dinoId: DinoId;
  rows: readonly CardRow[];
  holder?: string;
  hatchedAt?: Date;
  width: CardWidth;
  /** The side it starts on. */
  side?: Side;
  labels?: PillLabels;
};

/** An interactive card with the flip pill under it (the shared-link page, the home page on phones). */
export function FlippableCard({ width, side: initial = "front", labels, ...card }: FlippableCardProps) {
  const { controls, side, onSideChange, flip } = useCardFlip(initial);
  return (
    <div className="flex flex-col items-center">
      <CardScale width={width}>
        <InteractiveCard {...card} side={initial} ref={controls} onSideChange={onSideChange} />
      </CardScale>
      <FlipPill side={side} onFlip={flip} labels={labels} className="mt-4" />
    </div>
  );
}
