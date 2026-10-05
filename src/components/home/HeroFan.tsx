"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Card } from "@/components/card/Card";
import { DINO_LIST } from "@/data/dinos";
import { TIMING } from "@/lib/motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { SLEEVE_SIZE, Sleeve } from "./Sleeve";

// The home page's fan (reference/design/screens/home-hero-desktop.png): a
// sleeve either side and a real card front in the middle that changes through
// all ten. Laid out at 240-wide cards and scaled as a whole (--fan-k, per
// breakpoint), so the phone gets the same fan smaller.
//
// Motion (timings in TIMING, styles in the `fan-*` classes):
// - deal: on first paint the cards rise into place, left, middle, right
//   (CSS @starting-style, so it needs no JS and nothing flashes);
// - cycle: every fanCycle the middle front crossfades to the next dino, with
//   at most two fronts mounted (the current one and the one fading in);
// - sheen: every sheenEvery a light band crosses each card;
// - hover (fine pointers): the sides spread and turn, the middle lifts.
// Cycle and sheen pause while the fan is off screen or the tab is hidden.
// Reduced motion: none of it; the T-rex front shows and hover does nothing.

const FRONTS = DINO_LIST.map((dino) => dino.id);
// Noon UTC, so it prints 03.10.26 in any time zone, on the server and the client alike.
const SAMPLE_HATCHED = new Date(Date.UTC(2026, 9, 3, 12));

/** The fan's own box at scale 1: three 240×300 cards, the sides 180 out and turned 12°. */
const FAN_BOX = { width: 640, height: 380 } as const;

export function HeroFan({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [front, setFront] = useState(0);
  const frontRef = useRef(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [sheen, setSheen] = useState(false);

  // Cycle and sheen, while the fan is on screen and the tab is visible.
  useEffect(() => {
    const el = root.current;
    if (!el || reduced || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let onScreen = false;
    const timers: number[] = [];
    const clear = () => timers.splice(0).forEach((id) => window.clearTimeout(id));
    const running = () => onScreen && !document.hidden;

    // Mount the next front over the current one (it fades in), then make it the current one.
    const cycle = () => {
      timers.push(
        window.setTimeout(() => {
          if (!running()) return;
          const next = (frontRef.current + 1) % FRONTS.length;
          setIncoming(next);
          timers.push(
            window.setTimeout(() => {
              frontRef.current = next;
              setFront(next);
              setIncoming(null);
            }, TIMING.fanFade),
          );
          cycle();
        }, TIMING.fanCycle),
      );
    };
    const sweep = () => {
      timers.push(
        window.setTimeout(() => {
          if (!running()) return;
          setSheen(true);
          timers.push(window.setTimeout(() => setSheen(false), TIMING.sheenCross + 2 * TIMING.sheenStagger));
          sweep();
        }, TIMING.sheenEvery),
      );
    };
    const update = () => {
      clear();
      setSheen(false);
      if (running()) {
        cycle();
        sweep();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      clear();
    };
  }, [reduced]);

  const card = (index: number) => (
    <Card dinoId={FRONTS[index]} rows={[]} holder="Sam" hatchedAt={SAMPLE_HATCHED} mode="static" width={SLEEVE_SIZE.width} />
  );

  return (
    <div
      ref={root}
      aria-hidden
      className={`fan relative ${className}`}
      data-sheen={sheen || undefined}
      style={{ width: `calc(${FAN_BOX.width}px * var(--fan-k))`, height: `calc(${FAN_BOX.height}px * var(--fan-k))` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: FAN_BOX.width, height: FAN_BOX.height, transform: "scale(var(--fan-k))" }}
      >
        {/* Painted left, right, then middle (on top); dealt left, middle, right. */}
        <FanCard side={-1} deal={0}>
          <Sleeve />
        </FanCard>
        <FanCard side={1} deal={2}>
          <Sleeve />
        </FanCard>
        <FanCard side={0} deal={1}>
          <div className="relative" style={SLEEVE_SIZE}>
            <div className="absolute inset-0">{card(front)}</div>
            {incoming !== null && (
              <div key={incoming} className="fan-incoming absolute inset-0">
                {card(incoming)}
              </div>
            )}
          </div>
        </FanCard>
      </div>
    </div>
  );
}

/**
 * One card's place in the fan. The outer layer is its resting position (and
 * deals in from below); the inner layer takes the hover offset on top.
 */
function FanCard({ side, deal, children }: { side: -1 | 0 | 1; deal: number; children: ReactNode }) {
  return (
    <div
      className="fan-deal absolute"
      style={
        {
          left: (FAN_BOX.width - SLEEVE_SIZE.width) / 2,
          top: (FAN_BOX.height - SLEEVE_SIZE.height) / 2,
          "--side": side,
          "--deal-i": deal,
        } as CSSProperties
      }
    >
      <div className={`relative ${side === 0 ? "fan-lift" : "fan-spread"}`}>
        {children}
        {/* The light band, clipped to the card. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]">
          <div className="fan-sheen" style={{ "--sheen-i": deal } as CSSProperties} />
        </div>
      </div>
    </div>
  );
}
