"use client";

import { useEffect, useLayoutEffect, useReducer, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CardScale, InteractiveCard } from "@/components/card/Card";
import { Brand, HoloChip, TopBar } from "@/components/quiz/parts";
import { DINOS, type DinoId } from "@/data/dinos";
import type { CardRow } from "@/lib/card";
import { TIMING, ms } from "@/lib/motion";
import { SETTLE_ITEMS, reducedSchedule, revealSchedule, settleDelay, shufflePath, type RevealPhase } from "@/lib/reveal";
import { withArticle } from "@/lib/share";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ShareActions } from "./ShareActions";
import { Sleeve } from "./Sleeve";

// The result screen, and the reveal ("R2 Shuffle") that settles into it. One
// state machine; `revealing` is a synchronous lock so a skip can't double-fire.
//
// wait     the face-down sleeve shows its "?"          (TIMING.revealWait)
// shuffle  silhouettes swap at TIMING.shuffleSteps, ending on the winner
// land     the card grows to landScale; rares turn the frame prism and hold rareBeat longer
// flip     sleeve → card front, a white flash at the halfway turn; the glow brightens
// settle   the title rises in, then the chip, one-liner, actions and retake
// done     the sleeve is gone; the card is the normal interactive card, in the same spot
//
// Mode "turn" is the full sequence. Mode "fade" crossfades the sleeve to the
// card and fades the text in with no travel: reduced motion (after the "?"
// waits) and skip (a tap on the card, or Enter / Space on it).

// The top bar's mark. Fixed through the reveal so it never gives the winner away.
const MARK: DinoId = "triceratops";

type Mode = "turn" | "fade";

type State = {
  phase: RevealPhase;
  /** Index into the shuffle path; -1 shows the "?". */
  step: number;
  mode: Mode;
  /** The flash overlay is at flashTo (rising to it, or holding there). */
  flash: boolean;
  /** Crossfade duration in fade mode: TIMING.reduced, or TIMING.skipFade on a skip. */
  crossfade: number;
};

type Action =
  | { type: "shuffle"; step: number }
  | { type: "land" }
  | { type: "flip" }
  | { type: "flash"; on: boolean }
  | { type: "settle"; mode?: Mode; crossfade?: number }
  | { type: "done" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "shuffle":
      return { ...state, phase: "shuffle", step: action.step };
    case "land":
      return { ...state, phase: "land" };
    case "flip":
      return { ...state, phase: "flip" };
    case "flash":
      return { ...state, flash: action.on };
    case "settle":
      return {
        ...state,
        phase: "settle",
        flash: false,
        mode: action.mode ?? state.mode,
        crossfade: action.crossfade ?? state.crossfade,
      };
    case "done":
      return { ...state, phase: "done" };
  }
}

const ORDER: RevealPhase[] = ["wait", "shuffle", "land", "flip", "settle", "done"];
const atLeast = (phase: RevealPhase, than: RevealPhase) => ORDER.indexOf(phase) >= ORDER.indexOf(than);

type ResultScreenProps = {
  dinoId: DinoId;
  rows: readonly CardRow[];
  hatchedAt: Date;
  /** Play the reveal. Without it (a refresh, history), the result shows settled. */
  reveal: boolean;
  onRetake: () => void;
  /** Called once the result has fully settled. */
  onSettled?: () => void;
};

export function ResultScreen({ dinoId, rows, hatchedAt, reveal, onRetake, onSettled }: ResultScreenProps) {
  const dino = DINOS[dinoId];
  const rare = dino.rarity === "rare";
  const reduced = useReducedMotion();

  const [path] = useState(() => shufflePath(dinoId));
  const [state, dispatch] = useReducer(reducer, {
    phase: reveal ? "wait" : "done",
    step: -1,
    mode: "turn",
    flash: false,
    crossfade: TIMING.reduced,
  });
  const { phase, step, mode, flash, crossfade } = state;

  // Synchronous lock: true while the reveal plays. Skip and the timeline both claim it.
  const revealing = useRef(reveal);
  const timeouts = useRef<number[]>([]);
  const skipRef = useRef<HTMLButtonElement>(null);
  const handFocus = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const cancelAll = () => {
    timeouts.current.forEach((id) => window.clearTimeout(id));
    timeouts.current = [];
  };
  const at = (time: number, fn: () => void) => {
    timeouts.current.push(window.setTimeout(fn, time));
  };

  // Opening removes the skip control. Note now (before it goes) whether it had focus.
  const settle = (mode?: Mode, fade?: number) => {
    handFocus.current = document.activeElement === skipRef.current;
    dispatch({ type: "settle", mode, crossfade: fade });
  };

  const finish = (after: number) => {
    at(after, () => {
      revealing.current = false;
      dispatch({ type: "done" });
      onSettled?.();
    });
  };

  // Play the timeline once, from the moment the screen mounts.
  useEffect(() => {
    if (!revealing.current) return;
    if (reduced) {
      const s = reducedSchedule();
      at(s.settle, () => settle("fade", TIMING.reduced));
      finish(s.done);
    } else {
      const s = revealSchedule(rare);
      s.shuffle.forEach((time, i) => at(time, () => dispatch({ type: "shuffle", step: i })));
      at(s.land, () => dispatch({ type: "land" }));
      at(s.flip, () => dispatch({ type: "flip" }));
      at(s.flash, () => dispatch({ type: "flash", on: true }));
      at(s.flash + TIMING.flashPulse / 2, () => dispatch({ type: "flash", on: false }));
      at(s.settle, () => settle());
      finish(s.done);
    }
    return cancelAll;
    // The timeline is fixed at mount: a reduced-motion change mid-reveal doesn't restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    if (!revealing.current || atLeast(phase, "settle")) return;
    cancelAll();
    settle("fade", TIMING.skipFade);
    finish(TIMING.skipFade);
  };

  const open = atLeast(phase, "settle");

  // The skip control goes away when the card opens. If it had focus, hand
  // focus to the card's flip button rather than dropping it on the page.
  useLayoutEffect(() => {
    if (!open || !handFocus.current) return;
    handFocus.current = false;
    stageRef.current?.querySelector<HTMLElement>("[data-card-flip]")?.focus({ preventScroll: true });
  }, [open]);

  const title = `You’re ${withArticle(dino.name)}.`;
  const vars = {
    "--dur-crossfade": ms(crossfade),
  } as CSSProperties;

  return (
    <div
      className="reveal flex flex-1 flex-col"
      data-phase={phase}
      data-mode={mode}
      data-open={open || undefined}
      style={vars}
    >
      <TopBar left={<Brand mark={MARK} />} />
      <p className="sr-only" role="status">
        {open ? title : "Shuffling the herd…"}
      </p>

      <div className="flex flex-1 flex-col items-center lg:flex-row lg:justify-center lg:gap-24">
        <div className="relative mt-8 short:mt-4 lg:mt-0">
          <div
            aria-hidden
            className="reveal-glow bg-glow pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[160%] w-[200%] -translate-x-1/2 -translate-y-1/2 [--glow-alpha:0.16]"
          />
          <CardScale width="result">
            <div ref={stageRef} className="reveal-land size-full" data-landed={phase === "land" || undefined}>
              <div className="reveal-turn relative size-full" data-turned={atLeast(phase, "flip") || undefined}>
                <div className="reveal-card absolute inset-0" inert={!open} aria-hidden={!open || undefined}>
                  <InteractiveCard dinoId={dinoId} rows={rows} hatchedAt={hatchedAt} />
                  <div className="reveal-flash" data-on={flash || undefined} />
                </div>
                {/* After the card, so in fade mode the sleeve sits on top and fades out over it. */}
                {phase !== "done" && (
                  <div className="reveal-sleeve absolute inset-0" aria-hidden>
                    <Sleeve dinoId={step >= 0 ? path[step] : null} rare={rare && atLeast(phase, "land")} />
                    <div className="reveal-flash" data-on={flash || undefined} />
                  </div>
                )}
              </div>
            </div>
            {!open && (
              <button
                ref={skipRef}
                type="button"
                aria-label="Skip to your card"
                onClick={skip}
                className="card-hit absolute inset-0 cursor-pointer rounded-card"
              />
            )}
          </CardScale>
        </div>

        <div
          className="relative mt-8 short:mt-6 flex w-full flex-1 flex-col items-center text-center lg:mt-0 lg:w-auto lg:max-w-column lg:flex-none lg:items-start lg:text-left"
          inert={!open}
          aria-hidden={!open || undefined}
        >
          <p
            aria-hidden
            className="reveal-caption absolute inset-x-0 top-0 grid h-8 place-items-center font-mono text-label text-text-2 lg:justify-items-start"
          >
            Shuffling the herd…
          </p>
          <Item index={0}>
            <HoloChip>{rare ? "Rare · New" : "New"}</HoloChip>
          </Item>
          <Item title>
            <h1 className="mt-4 text-title text-balance lg:text-display">{title}</h1>
          </Item>
          <Item index={1}>
            <p className="mt-2 text-body text-pretty text-text-2">{dino.oneLiner}</p>
          </Item>
          <Item index={2} className="mt-6 w-full">
            <ShareActions dinoId={dinoId} />
          </Item>
          <Item index={3} className="mt-auto pt-8 pb-6 short:pt-4 short:pb-4 lg:mt-6 lg:pt-0 lg:pb-0">
            <button
              type="button"
              onClick={onRetake}
              className="press holo-ring rounded-control px-2 py-3 text-body text-text-2 lg:-ml-2"
            >
              Retake the quiz
            </button>
          </Item>
        </div>
      </div>
    </div>
  );
}

/**
 * One piece of the settle: rises in after its stagger. The title is first;
 * the rest follow in SETTLE_ITEMS order.
 */
function Item({
  index,
  title = false,
  className = "",
  children,
}: {
  index?: number;
  title?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const style = (
    title
      ? { "--rise": `${TIMING.titleRise}px`, "--dur": ms(TIMING.titleIn), "--delay": "0ms" }
      : { "--rise": `${TIMING.restRise}px`, "--dur": ms(TIMING.restIn), "--delay": ms(settleDelay(index ?? 0)) }
  ) as CSSProperties;
  return (
    <div className={`reveal-item ${className}`} style={style} data-item={title ? "title" : SETTLE_ITEMS[index ?? 0]}>
      {children}
    </div>
  );
}
