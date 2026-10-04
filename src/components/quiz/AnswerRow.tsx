import type { ComponentProps } from "react";
import { CheckIcon } from "./parts";

// One answer row: resting, picked (raised-2 with the line-selected border,
// key hint becomes a check) or dimmed (another row is picked). With onClick
// it's the quiz's button; without, a picture of one (the home page's "How it
// works"), and `size="small"` draws it compact.

type AnswerRowProps = {
  index: number;
  text: string;
  state: "rest" | "picked" | "dimmed";
  size?: "regular" | "small";
} & Pick<ComponentProps<"button">, "onClick">;

export function AnswerRow({ index, text, state, size = "regular", onClick }: AnswerRowProps) {
  const picked = state === "picked";
  const small = size === "small";
  const box = small ? "h-9 gap-3 px-3 text-small" : "h-15 gap-4 px-4 text-body desk:h-16";
  const key = small ? "size-5" : "size-6";
  const look = `relative flex w-full items-center justify-between rounded-control border border-line bg-raised-1 text-left ${box} ${
    state === "dimmed" ? "opacity-50" : ""
  }`;

  const content = (
    <>
      {/* Picked look: raised-2 with the line-selected border, faded in over the resting row. */}
      <span
        aria-hidden
        className={`fade absolute -inset-px rounded-control border border-line-selected bg-raised-2 ${picked ? "opacity-100" : "opacity-0"}`}
      />
      <span className="relative">{text}</span>
      <span aria-hidden className={`relative grid shrink-0 place-items-center ${key}`}>
        <span
          className={`fade col-start-1 row-start-1 grid ${key} place-items-center rounded-key border border-line-strong font-mono text-label text-text-3 ${
            picked ? "opacity-0" : "opacity-100"
          }`}
        >
          {index + 1}
        </span>
        <span
          className={`fade col-start-1 row-start-1 grid ${key} place-items-center rounded-key bg-text text-ground ${
            picked ? "opacity-100" : "opacity-0"
          }`}
        >
          <CheckIcon />
        </span>
      </span>
    </>
  );

  if (!onClick) return <div className={look}>{content}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={picked}
      aria-keyshortcuts={String(index + 1)}
      className={`press holo-ring group ${look}`}
    >
      {content}
    </button>
  );
}
