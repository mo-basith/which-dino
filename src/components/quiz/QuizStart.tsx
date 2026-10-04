"use client";

import { createContext, useContext, useEffect, type ComponentProps } from "react";
import { PRIMARY } from "./parts";

// Starting the quiz from anywhere inside it (the home page's Start buttons and
// Enter). Everything goes through Quiz's own start(), so its ref lock still
// stops a double start.

export const QuizStartContext = createContext<() => void>(() => {});

const SECONDARY_SMALL =
  "press holo-ring inline-grid h-9 place-items-center rounded-icon border border-line bg-raised-1 px-3.5 text-small font-medium text-text [--ring-radius:var(--radius-icon)]";

/** "Start the quiz". `look="small"` is the top bar's secondary version. */
export function StartButton({
  look = "primary",
  className = "",
  children = "Start the quiz",
  ...props
}: { look?: "primary" | "small" } & Omit<ComponentProps<"button">, "onClick" | "type">) {
  const start = useContext(QuizStartContext);
  return (
    <button type="button" onClick={start} className={`${look === "small" ? SECONDARY_SMALL : PRIMARY} ${className}`} {...props}>
      {children}
    </button>
  );
}

const INTERACTIVE = "a, button, input, textarea, select, summary, [contenteditable], [role='button'], [role='link'], [tabindex]:not([tabindex='-1'])";

/**
 * Enter starts the quiz, while the home page is showing. On document, because
 * focus usually rests on the body here; mounted with the home page only, and
 * it leaves Enter alone on fields, links and buttons, which have their own.
 */
export function EnterToStart() {
  const start = useContext(QuizStartContext);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target as Element | null;
      if (target && target !== document.body && target.closest(INTERACTIVE)) return;
      event.preventDefault();
      start();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [start]);
  return null;
}
