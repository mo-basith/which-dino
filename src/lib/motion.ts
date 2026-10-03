// The single source of truth for motion. Every duration, delay, stagger and
// distance lives here; nothing is hardcoded anywhere else.
// Units: milliseconds unless the key says otherwise (Rise/Shift = px, Scale/To = ratio).

export const EASE = "cubic-bezier(0.2, 0, 0, 1)";

export const TIMING = {
  press: 150,
  pressScale: 0.97,
  flip: 340,
  tilt: 160,
  glare: 200,
  fade: 150,
  reduced: 150,
  shuffleSteps: [60, 60, 60, 65, 75, 90, 110, 135, 165, 205, 250],
  land: 320,
  landScale: 1.03,
  revealFlip: 360,
  flashPulse: 120,
  flashTo: 0.5,
  titleIn: 240,
  titleStagger: 60,
  titleRise: 10,
  restIn: 240,
  restStagger: 50,
  restRise: 8,
  skipFade: 150,
  // Quiz: a picked answer holds, then the question departs left and the next
  // arrives from the right. The new progress segment fills alongside.
  answerHold: 180,
  qOut: 160,
  qIn: 220,
  qShift: 12,
  segFill: 220,
} as const;

export const ms = (n: number) => `${n}ms`;
const px = (n: number) => `${n}px`;

// Exposed as CSS custom properties on <html> so stylesheet utilities
// (e.g. `press`, `holo-ring`) read from TIMING instead of their own numbers.
export const MOTION_CSS_VARS: Record<string, string> = {
  "--motion-ease": EASE,
  "--dur-press": ms(TIMING.press),
  "--dur-fade": ms(TIMING.fade),
  "--dur-reduced": ms(TIMING.reduced),
  "--press-scale": String(TIMING.pressScale),
  "--dur-q-out": ms(TIMING.qOut),
  "--dur-q-in": ms(TIMING.qIn),
  "--q-shift": px(TIMING.qShift),
  "--dur-seg-fill": ms(TIMING.segFill),
};
