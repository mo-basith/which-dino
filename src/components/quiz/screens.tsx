import type { Question } from "@/data/quiz";
import { AnswerRow } from "./AnswerRow";
import { BackIcon, IconButton, TopBar, pad2 } from "./parts";

// The quiz's question screen (the intro is the home page, components/home; the result is components/result). Presentational only: Quiz.tsx owns state and motion.
// `stage` props are the data-phase/data-dir attributes for the part that moves.

type Stage = { "data-phase": string; "data-dir": string };

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

