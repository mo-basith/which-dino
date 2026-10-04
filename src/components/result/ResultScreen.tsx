"use client";

import { useEffect, useLayoutEffect, useReducer, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CardScale, InteractiveCard } from "@/components/card/Card";
import { FlipPill, useCardFlip } from "@/components/card/FlipPill";
import { Brand, HoloChip, TopBar } from "@/components/quiz/parts";
import { DINOS, type DinoId } from "@/data/dinos";
import { CARD, type CardRow } from "@/lib/card";
import { TIMING, ms } from "@/lib/motion";
import {
  NAME_DELAY,
  reducedSchedule,
  revealSchedule,
  settleDelay,
  settleItems,
  shufflePath,
  stageWidth,
  type RevealPhase,
  type SettleItem,
} from "@/lib/reveal";
import { withArticle } from "@/lib/share";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ShareActions } from "./ShareActions";
import { Sleeve } from "./Sleeve";

// The result screen, and the reveal ("R2 Shuffle") that plays into it. One
// state machine; `revealing` is a synchronous lock so a skip can't double-fire.
//
// wait     the face-down sleeve shows its "?"
// shuffle  silhouettes swap at TIMING.shuffleSteps, ending on the winner
// land     the card grows to landScale; rares turn the frame prism and hold rareBeat longer
// flip     sleeve → card front, a white flash at the edge-on moment; the glow brightens
// hold     the face-up card holds at stage size
// dock     the card moves and scales into its slot; the scrim lifts
// settle   "You're a", the name, then the flip pill, chip (rares), one-liner, actions, retake
// done     the card is the normal interactive card, in its slot
//
// wait → hold play big in the middle of the viewport (the stage): the card
// renders at its slot size (exactly 280 or 560) and a measured translate +
// scale puts it on the stage, so docking is just dropping that transform.
//
// Mode "turn" is the full sequence. Mode "fade" crossfades the sleeve to the
// card and fades everything else in, with no travel: reduced motion (no
// stage, after the "?" waits) and skip (a tap on the card, or Enter / Space).

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
  | { type: "phase"; phase: "land" | "flip" | "hold" | "dock" | "done" }
  | { type: "flash"; on: boolean }
  | { type: "settle"; mode?: Mode; crossfade?: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "shuffle":
      return { ...state, phase: "shuffle", step: action.step };
    case "phase":
      return { ...state, phase: action.phase };
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
  }
}

const ORDER: RevealPhase[] = ["wait", "shuffle", "land", "flip", "hold", "dock", "settle", "done"];
const atLeast = (phase: RevealPhase, than: RevealPhase) => ORDER.indexOf(phase) >= ORDER.indexOf(than);

/** Where the staged card sits: a transform from its slot to the middle of the viewport. */
type Stage = { x: number; y: number; scale: number; top: number };

function measureStage(slot: HTMLElement): Stage {
  const rect = slot.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const width = stageWidth(vw, vh);
  const height = (width * CARD.height) / CARD.width;
  return {
    x: vw / 2 - (rect.left + rect.width / 2),
    y: vh / 2 - (rect.top + rect.height / 2),
    scale: width / rect.width,
    top: (vh - height) / 2,
  };
}

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

export function ResultScreen({
  dinoId,
  rows,
  hatchedAt,
  reveal,
  onRetake,
  onSettled,
}: ResultScreenProps) {
  const dino = DINOS[dinoId];
  const rare = dino.rarity === "rare";
  const reduced = useReducedMotion();
  // Fixed at mount, like the timeline: whether this reveal plays on the stage (not under reduced motion).
  const [staged] = useState(() => reveal && !reduced);
  const items = settleItems(rare);

  const [path] = useState(() => shufflePath(dinoId));
  const [state, dispatch] = useReducer(reducer, {
    phase: reveal ? "wait" : "done",
    step: -1,
    mode: "turn",
    flash: false,
    crossfade: TIMING.reduced,
  });
  const { phase, step, mode, flash, crossfade } = state;
  const { controls: cardControls, side, onSideChange, flip } = useCardFlip();

  // Synchronous lock: true while the reveal plays. Skip and the timeline both claim it.
  const revealing = useRef(reveal);
  const timeouts = useRef<number[]>([]);
  const skipRef = useRef<HTMLButtonElement>(null);
  const handFocus = useRef(false);
  const slotRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage | null>(null);

  const cancelAll = () => {
    timeouts.current.forEach((id) => window.clearTimeout(id));
    timeouts.current = [];
  };
  const at = (time: number, fn: () => void) => {
    timeouts.current.push(window.setTimeout(fn, time));
  };

  // Settling removes the skip control. Note now (before it goes) whether it had focus.
  const settle = (mode?: Mode, fade?: number) => {
    handFocus.current = document.activeElement === skipRef.current;
    dispatch({ type: "settle", mode, crossfade: fade });
  };

  const finish = (after: number) => {
    at(after, () => {
      revealing.current = false;
      dispatch({ type: "phase", phase: "done" });
      onSettled?.();
    });
  };

  // Staged: put the card on the stage before the first paint, and keep it
  // there if the viewport changes, until it docks.
  const onStage = staged && mode === "turn" && !atLeast(phase, "dock");
  useLayoutEffect(() => {
    if (!onStage) return;
    const place = () => slotRef.current && setStage(measureStage(slotRef.current));
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
    };
  }, [onStage]);

  // Play the timeline once, from the moment the screen mounts.
  useEffect(() => {
    if (!revealing.current) return;
    if (staged) window.scrollTo(0, 0);
    if (reduced) {
      const s = reducedSchedule();
      at(s.settle, () => settle("fade", TIMING.reduced));
      finish(s.done);
    } else {
      const s = revealSchedule(rare);
      s.shuffle.forEach((time, i) => at(time, () => dispatch({ type: "shuffle", step: i })));
      at(s.land, () => dispatch({ type: "phase", phase: "land" }));
      at(s.flip, () => dispatch({ type: "phase", phase: "flip" }));
      at(s.flash, () => dispatch({ type: "flash", on: true }));
      at(s.flash + TIMING.flashPulse / 2, () => dispatch({ type: "flash", on: false }));
      at(s.hold, () => dispatch({ type: "phase", phase: "hold" }));
      at(s.dock, () => dispatch({ type: "phase", phase: "dock" }));
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

  // The card is face up (turned, rotations dropped) from the end of the flip;
  // the text and the card's own controls come in at the settle.
  const open = atLeast(phase, mode === "fade" ? "settle" : "hold");
  const shown = atLeast(phase, "settle");
  // Turn mode: the sleeve faces away once the card is open, so it can go.
  // Fade mode: it stays to fade out over the card.
  const sleeve = mode === "fade" ? phase !== "done" : !open;

  // The skip control goes away at the settle. If it had focus, hand focus to
  // the card's flip button rather than dropping it on the page.
  useLayoutEffect(() => {
    if (!shown || !handFocus.current) return;
    handFocus.current = false;
    slotRef.current?.querySelector<HTMLElement>("[data-card-flip]")?.focus({ preventScroll: true });
  }, [shown]);

  // "You’re a" / "T-rex." (the article from withArticle, so "an" where needed).
  const lead = `You’re ${withArticle(dino.name).split(" ")[0]}`;
  const name = `${dino.name}.`;
  const vars = { "--dur-crossfade": ms(crossfade) } as CSSProperties;
  const moverStyle: CSSProperties | undefined =
    onStage && stage ? { transform: `translate(${stage.x}px, ${stage.y}px) scale(${stage.scale})` } : undefined;

  return (
    <div
      className="reveal flex flex-1 flex-col"
      data-phase={phase}
      data-mode={mode}
      data-open={open || undefined}
      data-shown={shown || undefined}
      data-staged={staged || undefined}
      data-on-stage={onStage || undefined}
      style={vars}
    >
      <div className="reveal-dim">
        <TopBar left={<Brand mark={MARK} />} />
      </div>
      <p className="sr-only" role="status">
        {shown ? `${lead} ${name}` : "Shuffling the herd…"}
      </p>

      {staged && phase !== "done" && (
        <>
          <div aria-hidden className="reveal-scrim pointer-events-none fixed inset-0 z-10 bg-ground/60" />
          {stage && (
            <>
              <div
                aria-hidden
                className="reveal-stage-glow bg-glow pointer-events-none fixed top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 [--glow-alpha:0.2]"
                style={{ width: `${2 * stage.scale * CARD.width}px`, height: `${2 * stage.scale * CARD.height}px` }}
              />
              <p
                aria-hidden
                className="reveal-caption pointer-events-none fixed inset-x-0 z-20 grid h-8 place-items-center font-mono text-label text-text-2"
                style={{ top: `calc(${stage.top}px - 48px)` }}
              >
                Shuffling the herd…
              </p>
            </>
          )}
        </>
      )}

      {/* Two columns from 900px, centred in the height below the bar; "safe", so if the
          content is taller it aligns to the top and scrolls rather than clipping. */}
      <div className="flex flex-1 flex-col items-center desk:flex-row desk:items-center-safe desk:justify-center desk:gap-24 desk:py-8">
        <div className="mt-8 flex flex-col items-center short:mt-4 desk:mt-0">
          <div ref={slotRef} className="relative">
            <div
              aria-hidden
              className="reveal-glow bg-glow pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[160%] w-[200%] -translate-x-1/2 -translate-y-1/2 [--glow-alpha:0.16]"
            />
            <div className="reveal-mover relative z-20" style={moverStyle}>
              <CardScale width="result">
                <div className="reveal-land size-full" data-landed={phase === "land" || undefined}>
                  <div className="reveal-turn relative size-full" data-turned={atLeast(phase, "flip") || undefined}>
                    <div className="reveal-card absolute inset-0" inert={!shown} aria-hidden={!shown || undefined}>
                      <InteractiveCard
                        dinoId={dinoId}
                        rows={rows}
                        hatchedAt={hatchedAt}
                        ref={cardControls}
                        onSideChange={onSideChange}
                      />
                      <div className="reveal-flash" data-on={flash || undefined} />
                    </div>
                    {/* After the card, so in fade mode the sleeve sits on top and fades out over it. */}
                    {sleeve && (
                      <div className="reveal-sleeve absolute inset-0" aria-hidden>
                        <Sleeve dinoId={step >= 0 ? path[step] : null} rare={rare && atLeast(phase, "land")} />
                        <div className="reveal-flash" data-on={flash || undefined} />
                      </div>
                    )}
                  </div>
                </div>
                {!shown && (
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
          </div>
          <Item items={items} item="flip" className="mt-4" inert={!shown}>
            <FlipPill side={side} onFlip={flip} />
          </Item>
        </div>

        <div
          className="relative mt-6 flex w-full flex-1 flex-col items-center text-center short:mt-4 desk:mt-0 desk:w-auto desk:max-w-column desk:flex-none desk:items-start desk:text-left"
          inert={!shown}
          aria-hidden={!shown || undefined}
        >
          {/* Reduced motion has no stage: the caption waits here, where the text will come in. */}
          {!staged && (
            <p
              aria-hidden
              className="reveal-caption absolute inset-x-0 top-0 grid h-8 place-items-center font-mono text-label text-text-2 desk:justify-items-start"
            >
              Shuffling the herd…
            </p>
          )}
          {/* Rares only: commons have no chip, and no gap where it would be. */}
          {rare && (
            <Item items={items} item="chip" className="mb-4">
              <HoloChip size="small">Rare</HoloChip>
            </Item>
          )}
          <h1 className="text-title text-balance desk:text-display">
            {/* "You're a", then the name, rising further. */}
            <Item items={items} part="lead" as="span">
              {lead}
            </Item>{" "}
            <Item items={items} part="name" as="span">
              {name}
            </Item>
          </h1>
          <Item items={items} item="oneLiner">
            <p className="mt-2 max-w-measure text-body text-pretty text-text-2 desk:max-w-column">{dino.oneLiner}</p>
          </Item>
          <Item items={items} item="actions" className="mt-6 w-full">
            <ShareActions dinoId={dinoId} />
          </Item>
          <Item items={items} item="retake" className="mt-auto pt-8 pb-6 short:pt-4 short:pb-4 desk:mt-6 desk:pt-0 desk:pb-0">
            <button
              type="button"
              onClick={onRetake}
              className="press holo-ring rounded-control px-2 py-3 text-body text-text-2 desk:-ml-2"
            >
              Retake the quiz
            </button>
          </Item>
        </div>
      </div>
    </div>
  );
}

type ItemProps = {
  /** The settle items this result shows (settleItems), for the stagger. */
  items: SettleItem[];
  /** A settle item, or a part of the title. */
  item?: SettleItem;
  part?: "lead" | "name";
  as?: "div" | "span";
  className?: string;
  inert?: boolean;
  children: ReactNode;
};

/** One piece of the settle: rises in after its stagger (see reveal.ts). */
function Item({ items, item, part, as: Tag = "div", className = "", inert, children }: ItemProps) {
  const timing =
    part === "lead"
      ? { rise: TIMING.leadRise, dur: TIMING.titleIn, delay: 0 }
      : part === "name"
        ? { rise: TIMING.titleRise, dur: TIMING.titleIn, delay: NAME_DELAY }
        : { rise: TIMING.restRise, dur: TIMING.restIn, delay: settleDelay(items.indexOf(item!)) };
  const style = { "--rise": `${timing.rise}px`, "--dur": ms(timing.dur), "--delay": ms(timing.delay) } as CSSProperties;
  return (
    <Tag
      className={`reveal-item ${Tag === "span" ? "inline-block" : ""} ${className}`}
      style={style}
      data-item={part ?? item}
      inert={inert}
    >
      {children}
    </Tag>
  );
}
