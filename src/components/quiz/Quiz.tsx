"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useReducer, useRef, type KeyboardEvent } from "react";
import { QUIZ } from "@/data/quiz";
import { TIMING } from "@/lib/motion";
import { score } from "@/lib/scoring";
import { DoneScreen, IntroScreen, QuestionScreen } from "./screens";

// The whole quiz flow on "/": intro → question 1–6 → done, with no route change.
//
// Steps: 0 = intro, 1–6 = question n, 7 = done. Every step has its own browser
// history entry ({ quiz: step }), pushed in order from the intro's entry, so an
// entry's step is also its distance from the intro. The phone's back button
// (and our Back / Backspace, which call history.back()) land on popstate.
//
// answers[i] is the answer picked for question i+1. Arriving at question n
// keeps answers 1..n (n shows pre-selected if answered) and drops the rest.

const TOTAL = QUIZ.length;
const DONE = TOTAL + 1;
const STORAGE_KEY = "which-dino:answers";
const RESUME_ATTR = "data-quiz-resume";

type Screen = "intro" | "question" | "done";
type Phase = "idle" | "out" | "enter";
type Dir = "forward" | "back";

type State = {
  step: number;
  answers: number[];
  /** idle = at rest; out = departing; enter = parked on the arrival side. */
  phase: Phase;
  dir: Dir;
  /** Moving between screens (whole screen moves) rather than between questions (content only). */
  whole: boolean;
  /** Restored from history/sessionStorage (the first render always matches the server). */
  ready: boolean;
};

type Action =
  | { type: "restore"; step: number; answers: number[] }
  | { type: "pick"; answer: number }
  | { type: "depart"; dir: Dir; whole: boolean }
  | { type: "arrive"; step: number }
  | { type: "settle" };

const screenOf = (step: number): Screen => (step === 0 ? "intro" : step === DONE ? "done" : "question");

/** Answers that still hold at a step: up to and including that question. */
const keepFor = (step: number, answers: number[]) => (step >= DONE ? answers : answers.slice(0, step));

/** The furthest step these answers allow. */
const reachable = (answers: number[]) => (answers.length === TOTAL ? DONE : answers.length + 1);

const INITIAL: State = { step: 0, answers: [], phase: "idle", dir: "forward", whole: false, ready: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "restore":
      return { ...INITIAL, step: action.step, answers: action.answers, ready: true };
    case "pick":
      return { ...state, answers: [...state.answers.slice(0, state.step - 1), action.answer] };
    case "depart":
      return { ...state, phase: "out", dir: action.dir, whole: action.whole };
    case "arrive":
      return { ...state, step: action.step, answers: keepFor(action.step, state.answers), phase: "enter" };
    case "settle":
      return { ...state, phase: "idle" };
  }
}

function readStep(historyState: unknown): number | null {
  const step = (historyState as { quiz?: unknown } | null)?.quiz;
  return typeof step === "number" && Number.isInteger(step) && step >= 0 && step <= DONE ? step : null;
}

function readAnswers(): number[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    const valid =
      Array.isArray(parsed) &&
      parsed.length <= TOTAL &&
      parsed.every((a) => Number.isInteger(a) && a >= 0 && a < 4);
    return valid ? parsed : [];
  } catch {
    return [];
  }
}

function writeAnswers(answers: number[]) {
  try {
    if (answers.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode, quota). Resume is a nicety.
  }
}

const pushStep = (step: number) => history.pushState({ ...history.state, quiz: step }, "");

const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Runs during HTML parsing on a refresh mid-quiz, so the server-rendered intro
// never flashes before the client restores the right screen.
const RESUME_SCRIPT = `try{var s=history.state;if(s&&s.quiz>0)document.documentElement.setAttribute("${RESUME_ATTR}","")}catch(e){}`;

export function Quiz() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const { step, answers, phase, dir, whole, ready } = state;
  const screen = screenOf(step);

  const rootRef = useRef<HTMLElement>(null);
  // Synchronous lock: set the moment a transition starts, so a second tap,
  // key or click during it does nothing.
  const busy = useRef(false);
  const restored = useRef(false);
  const timeouts = useRef<number[]>([]);

  const after = (ms: number, fn: () => void) => {
    timeouts.current.push(window.setTimeout(fn, ms));
  };
  const cancelAll = () => {
    timeouts.current.forEach((id) => clearTimeout(id));
    timeouts.current = [];
  };

  const focusRoot = () => rootRef.current?.focus({ preventScroll: true });

  /** Depart, swap, arrive. Interruptible: a new call cancels whatever is in flight. */
  const travel = (from: number, to: number, direction: Dir, hold: boolean) => {
    cancelAll();
    busy.current = true;
    const reduced = prefersReducedMotion();
    const outMs = reduced ? TIMING.reduced : TIMING.qOut;
    const inMs = reduced ? TIMING.reduced : TIMING.qIn;
    const depart = () => {
      dispatch({ type: "depart", dir: direction, whole: screenOf(from) !== screenOf(to) });
      after(outMs, () => {
        dispatch({ type: "arrive", step: to }); // parks it; the layout effect below moves it in
        after(inMs, () => {
          busy.current = false;
          if (screenOf(to) !== "intro") focusRoot();
        });
      });
    };
    if (hold) after(TIMING.answerHold, depart);
    else depart();
  };

  const start = () => {
    if (busy.current) return;
    busy.current = true;
    pushStep(1);
    travel(0, 1, "forward", false);
  };

  const pick = (answer: number) => {
    if (busy.current || screen !== "question") return;
    busy.current = true;
    dispatch({ type: "pick", answer });
    pushStep(step + 1);
    travel(step, step + 1, "forward", true);
  };

  const back = () => {
    if (busy.current || step === 0) return;
    busy.current = true;
    history.back(); // → popstate
  };

  const playAgain = () => {
    if (busy.current) return;
    busy.current = true;
    writeAnswers([]);
    history.go(-step); // back to the intro's entry → popstate
  };

  const onPopState = useEffectEvent((event: PopStateEvent) => {
    // Our entries carry { quiz }. One without it is the page's own first entry (the intro);
    // Next can rewrite history state on a dev refresh, so don't rely on the key being there.
    const target = readStep(event.state) ?? 0;
    const limit = reachable(answers);
    if (target > limit) {
      // Forward into a question whose earlier answers are gone: step back to the furthest valid one.
      history.go(limit - target);
      return;
    }
    if (target === step) {
      // Back during a pick's hold or departure: stay put, answer still pre-selected.
      cancelAll();
      dispatch({ type: "settle" });
      busy.current = false;
      return;
    }
    travel(step, target, target < step ? "back" : "forward", false);
  });

  useEffect(() => {
    const handler = (event: PopStateEvent) => onPopState(event);
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
      cancelAll();
    };
  }, []);

  // Arrival: commit the parked "enter" position (forced reflow), then move off it,
  // so the browser transitions from there. No animation frames, so it also runs
  // in a background tab.
  useLayoutEffect(() => {
    if (phase !== "enter") return;
    void rootRef.current?.offsetWidth;
    dispatch({ type: "settle" });
  }, [phase]);

  // Restore after a refresh: history.state says which step, sessionStorage has the answers.
  // A layout effect, so the corrected screen is what gets painted.
  useLayoutEffect(() => {
    if (restored.current) return; // once, even under Strict Mode's double effects
    restored.current = true;
    let at = readStep(history.state);
    if (at === null) {
      history.replaceState({ ...history.state, quiz: 0 }, "");
      at = 0;
    }
    const saved = readAnswers();
    const limit = reachable(saved);
    if (at > limit) {
      history.go(limit - at);
      at = limit;
    }
    dispatch({ type: "restore", step: at, answers: keepFor(at, saved) });
    if (screenOf(at) === "question") focusRoot();
    document.documentElement.removeAttribute(RESUME_ATTR);
  }, []);

  // Persist from the restore on, so the first (server-matching) render can't wipe a saved quiz.
  useEffect(() => {
    if (ready) writeAnswers(answers);
  }, [ready, answers]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (screen !== "question" || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
    if (event.key >= "1" && event.key <= "4" && event.key.length === 1) {
      event.preventDefault();
      pick(Number(event.key) - 1);
    } else if (event.key === "Backspace") {
      event.preventDefault();
      back();
    }
  };

  const moving = { "data-phase": phase, "data-dir": dir };
  const still = { "data-phase": "idle", "data-dir": dir };

  return (
    <>
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: RESUME_SCRIPT }}
      />
      <div className="overflow-x-clip">
        <main
          ref={rootRef}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          data-quiz-root
          className="relative isolate mx-auto flex min-h-dvh w-full max-w-column flex-col px-gutter outline-none"
        >
          <div className="q-stage flex flex-1 flex-col" {...(whole ? moving : still)}>
            {screen === "intro" && <IntroScreen onStart={start} />}
            {screen === "question" && (
              <QuestionScreen
                question={QUIZ[step - 1]}
                number={step}
                total={TOTAL}
                answered={answers.length}
                picked={answers[step - 1]}
                stage={whole ? still : moving}
                onPick={pick}
                onBack={back}
              />
            )}
            {screen === "done" && answers.length === TOTAL && (
              <DoneScreen winner={score(answers).winner} onPlayAgain={playAgain} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
