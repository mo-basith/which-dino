"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useReducer, useRef, type KeyboardEvent } from "react";
import { ResultScreen } from "@/components/result/ResultScreen";
import { DINO_IDS, type DinoId } from "@/data/dinos";
import { QUIZ } from "@/data/quiz";
import { backRows } from "@/lib/card";
import { TIMING, type TempoId } from "@/lib/motion";
import { isTempoId } from "@/lib/reveal";
import { score } from "@/lib/scoring";
import { IntroScreen, QuestionScreen } from "./screens";

// The whole quiz flow on "/": intro → question 1–6 → result, with no route change.
//
// Steps: 0 = intro, 1–6 = question n, 7 = result. Every step has its own browser
// history entry ({ quiz: step }), pushed in order from the intro's entry, so an
// entry's step is also its distance from the intro. The phone's back button
// (and our Back / Backspace, which call history.back()) land on popstate.
//
// answers[i] is the answer picked for question i+1. Arriving at question n
// keeps answers 1..n (n shows pre-selected if answered) and drops the rest.
//
// The result ({ dinoId, hatchedAt }) is made when the last answer is picked,
// and the reveal plays then. A refresh or history lands on it settled.
// "/?start" (from a shared card's "Which dino am I?") starts fresh at question 1.
// "/?tempo=a|b|c" picks the reveal's tempo for the session (TIMING.reveal).

const TOTAL = QUIZ.length;
const DONE = TOTAL + 1;
const STORAGE_KEY = "which-dino:answers";
const RESULT_KEY = "which-dino:result";
const RESUME_ATTR = "data-quiz-resume";
const START_PARAM = "start";
const TEMPO_PARAM = "tempo";
const TEMPO_KEY = "which-dino:tempo";

type Screen = "intro" | "question" | "result";
type Result = { dinoId: DinoId; hatchedAt: number };
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
  result: Result | null;
  /** Play the reveal on arriving at the result (just finished, not a refresh or history). */
  reveal: boolean;
  tempo: TempoId;
};

type Action =
  | { type: "restore"; step: number; answers: number[]; result: Result | null; tempo: TempoId }
  | { type: "pick"; answer: number }
  | { type: "depart"; dir: Dir; whole: boolean }
  | { type: "arrive"; step: number; result: Result | null; reveal: boolean }
  | { type: "settle" };

const screenOf = (step: number): Screen => (step === 0 ? "intro" : step === DONE ? "result" : "question");

/** Answers that still hold at a step: up to and including that question. */
const keepFor = (step: number, answers: number[]) => (step >= DONE ? answers : answers.slice(0, step));

/** The furthest step these answers allow. */
const reachable = (answers: number[]) => (answers.length === TOTAL ? DONE : answers.length + 1);

const INITIAL: State = {
  step: 0,
  answers: [],
  phase: "idle",
  dir: "forward",
  whole: false,
  ready: false,
  result: null,
  reveal: false,
  tempo: TIMING.revealTempo,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "restore":
      return {
        ...INITIAL,
        step: action.step,
        answers: action.answers,
        result: action.result,
        tempo: action.tempo,
        ready: true,
      };
    case "pick":
      return { ...state, answers: [...state.answers.slice(0, state.step - 1), action.answer] };
    case "depart":
      return { ...state, phase: "out", dir: action.dir, whole: action.whole };
    case "arrive":
      return {
        ...state,
        step: action.step,
        answers: keepFor(action.step, state.answers),
        result: action.result,
        reveal: action.reveal,
        phase: "enter",
      };
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

function readResult(): Result | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(RESULT_KEY) ?? "null") as Partial<Result> | null;
    const valid =
      DINO_IDS.includes(parsed?.dinoId as DinoId) && Number.isFinite(parsed?.hatchedAt) && parsed?.hatchedAt !== undefined;
    return valid ? (parsed as Result) : null;
  } catch {
    return null;
  }
}

function writeResult(result: Result | null) {
  try {
    if (result) sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
    else sessionStorage.removeItem(RESULT_KEY);
  } catch {
    // As above.
  }
}

/** The reveal tempo: "?tempo=" saves one for the session; otherwise the saved one, or the default. */
function readTempo(url: URL): TempoId {
  try {
    const param = url.searchParams.get(TEMPO_PARAM);
    if (isTempoId(param)) sessionStorage.setItem(TEMPO_KEY, param);
    const saved = sessionStorage.getItem(TEMPO_KEY);
    return isTempoId(saved) ? saved : TIMING.revealTempo;
  } catch {
    return TIMING.revealTempo;
  }
}

/**
 * The result for a full set of answers: the stored one if it's for the same
 * dino and not a fresh finish, otherwise hatched now.
 */
function resultFor(answers: number[], fresh: boolean): Result {
  const dinoId = score(answers).winner;
  const stored = readResult();
  return !fresh && stored?.dinoId === dinoId ? stored : { dinoId, hatchedAt: Date.now() };
}

const pushStep = (step: number) => history.pushState({ ...history.state, quiz: step }, "");

const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Runs during HTML parsing on a refresh mid-quiz (or "/?start"), so the
// server-rendered intro never flashes before the client restores the right screen.
const RESUME_SCRIPT = `try{var s=history.state;if(s&&s.quiz>0||new URLSearchParams(location.search).has("${START_PARAM}"))document.documentElement.setAttribute("${RESUME_ATTR}","")}catch(e){}`;

export function Quiz() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const { step, answers, phase, dir, whole, ready } = state;
  const screen = screenOf(step);

  const rootRef = useRef<HTMLElement>(null);
  // Synchronous lock: set the moment a transition starts, so a second tap,
  // key or click during it does nothing.
  const busy = useRef(false);
  // The latest answers, for timeouts that outlive the render that set them.
  const answersRef = useRef(answers);
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
        // Arriving at the result: a pick (hold) has just finished the quiz, so it's
        // fresh and the reveal plays. Through history it's the stored result, settled.
        const result = to === DONE ? resultFor(answersRef.current, hold) : null;
        dispatch({ type: "arrive", step: to, result, reveal: to === DONE && hold }); // parks it; the layout effect below moves it in
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
    answersRef.current = [...answers.slice(0, step - 1), answer];
    dispatch({ type: "pick", answer });
    pushStep(step + 1);
    travel(step, step + 1, "forward", true);
  };

  const back = () => {
    if (busy.current || step === 0) return;
    busy.current = true;
    history.back(); // → popstate
  };

  const retake = () => {
    if (busy.current) return;
    busy.current = true;
    writeAnswers([]);
    writeResult(null);
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
    const url = new URL(window.location.href);
    const tempo = readTempo(url);
    if (url.searchParams.has(TEMPO_PARAM)) {
      url.searchParams.delete(TEMPO_PARAM);
      history.replaceState(history.state, "", url);
    }
    if (url.searchParams.has(START_PARAM)) {
      // From a shared card: a fresh quiz at question 1, with the intro's entry behind it.
      url.searchParams.delete(START_PARAM);
      writeAnswers([]);
      writeResult(null);
      history.replaceState({ ...history.state, quiz: 0 }, "", url);
      pushStep(1);
    }
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
    const result = at === DONE ? resultFor(saved, false) : null;
    dispatch({ type: "restore", step: at, answers: keepFor(at, saved), result, tempo });
    if (screenOf(at) !== "intro") focusRoot();
    document.documentElement.removeAttribute(RESUME_ATTR);
  }, []);

  useLayoutEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Persist from the restore on, so the first (server-matching) render can't wipe a saved quiz.
  useEffect(() => {
    if (ready) writeAnswers(answers);
  }, [ready, answers]);
  useEffect(() => {
    if (state.result) writeResult(state.result);
  }, [state.result]);

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
          className={`relative isolate mx-auto flex min-h-dvh w-full max-w-column flex-col px-gutter outline-none ${
            screen === "result" ? "desk:max-w-wide" : screen === "question" ? "desk:max-w-question" : ""
          }`}
        >
          {/* The result arrives by fade only: its staged reveal is laid out against the viewport. */}
          <div
            className="q-stage flex flex-1 flex-col"
            data-fade={screen === "result" || undefined}
            {...(whole ? moving : still)}
          >
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
            {screen === "result" && state.result && (
              <ResultScreen
                key={state.result.hatchedAt}
                dinoId={state.result.dinoId}
                rows={backRows(state.result.dinoId, answers)}
                hatchedAt={new Date(state.result.hatchedAt)}
                reveal={state.reveal}
                tempo={state.tempo}
                onRetake={retake}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
