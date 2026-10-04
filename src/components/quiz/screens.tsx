import type { ComponentProps } from "react";
import type { Question } from "@/data/quiz";
import { CardFan } from "./CardFan";
import { BackIcon, Brand, CheckIcon, IconButton, PrimaryButton, TopBar, pad2 } from "./parts";

// The quiz's intro and question screens (the result lives in components/result). Presentational only: Quiz.tsx owns state and motion.
// `stage` props are the data-phase/data-dir attributes for the part that moves.

type Stage = { "data-phase": string; "data-dir": string };

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <>
      <div
        className="bg-glow pointer-events-none absolute top-0 left-1/2 -z-10 h-[480px] w-[640px] -translate-x-1/2 -translate-y-1/3 [--glow-alpha:0.14]"
        aria-hidden
      />
      <TopBar left={<Brand />} />
      <CardFan className="mt-12" />
      <h1 className="mt-24 text-display">
        Which dino <br />
        are you?
      </h1>
      <p className="mt-4 text-body text-text-2">Six questions, one holographic card. Collect the other nine from friends.</p>
      <div className="mt-auto pt-8 pb-8">
        <PrimaryButton onClick={onStart}>Start</PrimaryButton>
        {/* The right side is reserved for "0 / 10 in your herd" (herd comes in its own step). */}
        <div className="mt-4 flex justify-between font-mono text-label text-text-3">
          <span>About a minute</span>
        </div>
      </div>
    </>
  );
}

type QuestionScreenProps = {
  question: Question;
  number: number; // 1-based
  total: number;
  answered: number;
  picked: number | undefined;
  stage: Stage;
  onPick: (answer: number) => void;
  onBack: () => void;
};

export function QuestionScreen({ question, number, total, answered, picked, stage, onPick, onBack }: QuestionScreenProps) {
  const titleId = `question-${question.id}`;
  return (
    <>
      <TopBar
        left={
          <IconButton label="Back" onClick={onBack}>
            <BackIcon />
          </IconButton>
        }
        center={
          <p className="font-mono text-label text-text-2 tabular-nums">
            <span className="sr-only">Question </span>
            {pad2(number)} <span aria-hidden>/</span>
            <span className="sr-only"> of </span> {pad2(total)}
          </p>
        }
      />
      <Progress total={total} filled={answered} />

      <div className="q-stage" {...stage}>
        <p className="mt-18 font-mono text-label uppercase text-text-3">Question {number}</p>
        <h1 id={titleId} className="mt-2 text-title text-balance">
          {question.prompt}
        </h1>
        <div role="group" aria-labelledby={titleId} className="mt-10 flex flex-col gap-2">
          {question.answers.map((answer, i) => (
            <AnswerRow
              key={i}
              index={i}
              text={answer.text}
              state={picked === undefined ? "rest" : picked === i ? "picked" : "dimmed"}
              onClick={() => onPick(i)}
            />
          ))}
        </div>
      </div>

      <p className="mt-auto pt-8 pb-8 text-center font-mono text-label text-text-3">
        <span className="can-hover:hidden">Tap an answer</span>
        <span className="hidden can-hover:inline">Tap an answer, or press 1–4</span>
      </p>
    </>
  );
}

function Progress({ total, filled }: { total: number; filled: number }) {
  return (
    <div
      role="progressbar"
      aria-label="Questions answered"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={filled}
      className="mt-4 grid gap-1"
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="h-0.5 overflow-hidden rounded-full bg-line-strong">
          <div className="seg-fill h-full bg-text" data-filled={i < filled} />
        </div>
      ))}
    </div>
  );
}

type AnswerRowProps = { index: number; text: string; state: "rest" | "picked" | "dimmed" } & Pick<
  ComponentProps<"button">,
  "onClick"
>;

function AnswerRow({ index, text, state, onClick }: AnswerRowProps) {
  const picked = state === "picked";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={picked}
      aria-keyshortcuts={String(index + 1)}
      className={`press holo-ring group relative flex h-15 w-full desk:h-16 items-center justify-between gap-4 rounded-control border border-line bg-raised-1 px-4 text-left text-body ${
        state === "dimmed" ? "opacity-50" : ""
      }`}
    >
      {/* Picked look: raised-2 with the line-selected border, faded in over the resting row. */}
      <span
        aria-hidden
        className={`fade absolute -inset-px rounded-control border border-line-selected bg-raised-2 ${picked ? "opacity-100" : "opacity-0"}`}
      />
      <span className="relative">{text}</span>
      <span aria-hidden className="relative grid size-6 shrink-0 place-items-center">
        <span
          className={`fade col-start-1 row-start-1 grid size-6 place-items-center rounded-key border border-line-strong font-mono text-label text-text-3 ${
            picked ? "opacity-0" : "opacity-100"
          }`}
        >
          {index + 1}
        </span>
        <span
          className={`fade col-start-1 row-start-1 grid size-6 place-items-center rounded-key bg-text text-ground ${
            picked ? "opacity-100" : "opacity-0"
          }`}
        >
          <CheckIcon />
        </span>
      </span>
    </button>
  );
}
