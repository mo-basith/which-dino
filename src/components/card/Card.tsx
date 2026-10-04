"use client";

import { useEffect, useReducer, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { DINOS, type DinoId } from "@/data/dinos";
import { CARD, type CardRow } from "@/lib/card";
import { TIMING } from "@/lib/motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { CardBack, CardFront, type Side } from "./faces";

// The trading card. Designed at 280×350 and scaled as a whole with a
// transform, so every size is the same card.
//
// Size rule: pixel art only stays on whole pixels at whole multiples of 280.
// Interactive cards render at 280; 240 is the fallback for short viewports
// only; the desktop result is 560 on a big enough screen. Thumbnails (104)
// may be slightly soft. Share images use whole multiples (560, 840).

type CardProps = {
  dinoId: DinoId;
  /** The three back rows (see backRows in src/lib/card.ts). */
  rows: readonly CardRow[];
  holder?: string;
  /** When it was hatched (the footer date). A friend's card from a link has none yet. */
  hatchedAt?: Date;
  mode: "interactive" | "static";
  /** Which side a static card shows, or the side an interactive card starts on (front by default). */
  side?: Side;
  /** Rendered width in px, or a size that follows the viewport (see CardScale). Height follows at 280:350. */
  width?: CardWidth;
  className?: string;
};

export function Card({ mode, width = CARD.width, className, ...card }: CardProps) {
  return (
    <CardScale width={width} className={className}>
      {mode === "interactive" ? <InteractiveCard {...card} /> : <StaticCard {...card} />}
    </CardScale>
  );
}

/**
 * A fixed width in px, or a size set in CSS by the viewport (.card-size-* in
 * globals.css): "interactive" is 280 (240 under 700px tall), "result" is the
 * same but 560 from 1024×820.
 */
export type CardWidth = number | "interactive" | "result";

/** Lays out a 280×350 design-size box at `width`, scaled as a whole. */
export function CardScale({ width, className = "", children }: { width: CardWidth; className?: string; children: ReactNode }) {
  const fixed = typeof width === "number";
  const k = fixed ? width / CARD.width : "var(--card-k)";
  return (
    <div
      className={`relative shrink-0 ${fixed ? "" : `card-size-${width}`} ${className}`}
      style={{ width: `calc(${CARD.width}px * ${k})`, height: `calc(${CARD.height}px * ${k})` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: CARD.width, height: CARD.height, transform: k === 1 ? undefined : `scale(${k})` }}
      >
        {children}
      </div>
    </div>
  );
}

type Faces = Omit<CardProps, "mode" | "width" | "className">;

// Static: no tilt, no flip, no handlers; the foil rests slightly off centre.
const STATIC_FOIL = { "--px": 0.35, "--py": 0.3 } as CSSProperties;

function StaticCard({ dinoId, rows, holder, hatchedAt, side = "front" }: Faces) {
  return (
    <div
      className="card-tilt relative size-full"
      style={STATIC_FOIL}
      role="img"
      aria-label={`${DINOS[dinoId].name} card, ${side}`}
    >
      {side === "front" ? (
        <CardFront dinoId={dinoId} holder={holder} hatchedAt={hatchedAt} />
      ) : (
        <CardBack dinoId={dinoId} rows={rows} />
      )}
    </div>
  );
}

// One state machine. `busy` is a synchronous lock so a flip can't double-fire
// (a double click or Enter held down) while one is still turning.
type State = { side: Side; phase: "idle" | "flipping" };
type Action = { type: "flip" } | { type: "settle" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "flip":
      return { side: state.side === "front" ? "back" : "front", phase: "flipping" };
    case "settle":
      return { ...state, phase: "idle" };
  }
}

const FINE_HOVER = "(hover: hover) and (pointer: fine)";
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
// Pointer within this fraction of the top-left corner reveals the egg.
const EGG_CORNER = 0.25;

export function InteractiveCard({ dinoId, rows, holder, hatchedAt, side = "front" }: Faces) {
  const [state, dispatch] = useReducer(reducer, { side, phase: "idle" });
  const busy = useRef(false);
  const timer = useRef<number>(undefined);
  const tilt = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flip = () => {
    if (busy.current) return;
    busy.current = true;
    dispatch({ type: "flip" });
    const duration = reduced ? TIMING.reduced : TIMING.flip;
    timer.current = window.setTimeout(() => {
      busy.current = false;
      dispatch({ type: "settle" });
    }, duration);
  };

  // Tilt, foil and glare follow a desktop pointer only, written straight to
  // CSS variables so moving the pointer never re-renders. Touch just flips.
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = tilt.current;
    if (!el || e.pointerType !== "mouse" || !matchMedia(FINE_HOVER).matches || reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = clamp01((e.clientX - rect.left) / rect.width);
    const py = clamp01((e.clientY - rect.top) / rect.height);
    el.style.setProperty("--px", String(px));
    el.style.setProperty("--py", String(py));
    el.style.setProperty("--ry", `${(px - 0.5) * 2 * TIMING.tiltMax}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 2 * TIMING.tiltMax}deg`);
    el.toggleAttribute("data-active", true);
    el.toggleAttribute("data-egg", px < EGG_CORNER && py < EGG_CORNER);
  };

  const onPointerLeave = () => {
    const el = tilt.current;
    if (!el) return;
    for (const prop of ["--px", "--py", "--rx", "--ry"]) el.style.removeProperty(prop);
    el.removeAttribute("data-active");
    el.removeAttribute("data-egg");
  };

  const back = state.side === "back";
  return (
    <div className="card-stage size-full" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <div ref={tilt} className="card-tilt relative size-full" data-side={state.side} data-phase={state.phase}>
        <div className="card-flip relative size-full">
          <CardFront dinoId={dinoId} holder={holder} hatchedAt={hatchedAt} hidden={back} egg />
          <CardBack dinoId={dinoId} rows={rows} turned hidden={!back} />
        </div>
        <button
          type="button"
          aria-label={`Flip the ${DINOS[dinoId].name} card`}
          onClick={flip}
          data-card-flip
          className="card-hit absolute inset-0 cursor-pointer rounded-card"
        />
      </div>
    </div>
  );
}
