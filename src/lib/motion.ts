// The single source of truth for motion. Every duration, delay, stagger and
// distance lives here; nothing is hardcoded anywhere else.
// Units: milliseconds unless the key says otherwise (Rise/Shift = px, Scale/To/Rest/Active = ratio,
// Max = degrees, Ease = a cubic-bezier curve).

export type Curve = readonly [x1: number, y1: number, x2: number, y2: number];
const bezier = (curve: Curve) => `cubic-bezier(${curve.join(", ")})`;

/** The one easing curve for UI. Never ease-in, no bounce. */
export const EASE_CURVE: Curve = [0.2, 0, 0, 1];
export const EASE = bezier(EASE_CURVE);

/** The reveal's flip (tempo B): slower off the mark than EASE, so the turn reads. */
export const EASE_FLIP_CURVE: Curve = [0.32, 0.08, 0.16, 1];
export const EASE_FLIP = bezier(EASE_FLIP_CURVE);
/**
 * The reveal's flip (tempo C). The single exception to "never ease-in": it
 * eases in slightly. Only for this flip.
 */
export const EASE_FLIP_SLOW_CURVE: Curve = [0.45, 0, 0.2, 1];
export const EASE_FLIP_SLOW = bezier(EASE_FLIP_SLOW_CURVE);

/**
 * One tempo of the reveal. The face-down sleeve waits, shuffles through
 * silhouettes (each step's hold, in order; the last is the winner), lands
 * (grows to landScale over landGrow, holds the rest of land; rares hold
 * rareBeat longer), then flips to the card on flipEase. A white flash pulses
 * to flashTo over flashPulse at the flip's actual edge-on moment.
 *
 * Staged tempos play all that big in the middle of the screen, hold the
 * flipped card for stageHold, then dock it into its slot over dock. Then the
 * text: "You're a" rises (leadRise), the name titleStagger later (titleRise),
 * then the rest, restStagger apart. Unstaged (A): the card stays in its slot
 * and the title rises as one line.
 */
export type RevealTempo = {
  staged: boolean;
  revealWait: number;
  shuffleSteps: readonly number[];
  land: number;
  landGrow: number;
  rareBeat: number;
  revealFlip: number;
  flipEase: Curve;
  flashPulse: number;
  stageHold: number;
  dock: number;
  titleIn: number;
  titleStagger: number;
  leadRise: number;
  titleRise: number;
  restIn: number;
  restStagger: number;
  restRise: number;
};

export type TempoId = "a" | "b" | "c";

export const TIMING = {
  press: 150,
  pressScale: 0.97,
  // Card: tilt follows the pointer (max tiltMax degrees), the foil travels
  // foilShift px in total (±half) with it, and the glare brightens from
  // glareRest to glareActive opacity while the pointer is over the card.
  flip: 340,
  tilt: 160,
  tiltMax: 10,
  foilShift: 120,
  glare: 200,
  glareRest: 0.3,
  glareActive: 0.5,
  fade: 150,
  reduced: 150,
  // The reveal: three tempos to compare (see RevealTempo), and the one in use.
  // ?tempo=a|b|c on "/" overrides it for the session.
  reveal: {
    // A: docked (the card stays in its slot). For comparison only.
    a: {
      staged: false,
      revealWait: 600,
      shuffleSteps: [60, 60, 60, 65, 75, 90, 110, 135, 165, 205, 250],
      land: 320,
      landGrow: 160,
      rareBeat: 160,
      revealFlip: 360,
      flipEase: EASE_CURVE,
      flashPulse: 120,
      stageHold: 0,
      dock: 0,
      titleIn: 240,
      titleStagger: 60,
      leadRise: 10,
      titleRise: 10,
      restIn: 240,
      restStagger: 50,
      restRise: 8,
    },
    // B: staged.
    b: {
      staged: true,
      revealWait: 700,
      shuffleSteps: [60, 60, 60, 65, 75, 90, 110, 135, 165, 205, 250, 320],
      land: 400,
      landGrow: 200,
      rareBeat: 200,
      revealFlip: 480,
      flipEase: EASE_FLIP_CURVE,
      flashPulse: 140,
      stageHold: 600,
      dock: 420,
      titleIn: 280,
      titleStagger: 80,
      leadRise: 10,
      titleRise: 16,
      restIn: 260,
      restStagger: 60,
      restRise: 8,
    },
    // C: staged, theatrical.
    c: {
      staged: true,
      revealWait: 900,
      shuffleSteps: [70, 70, 75, 80, 90, 100, 115, 135, 160, 195, 240, 300, 380, 480],
      land: 560,
      landGrow: 260,
      rareBeat: 300,
      revealFlip: 720,
      flipEase: EASE_FLIP_SLOW_CURVE,
      flashPulse: 180,
      stageHold: 900,
      dock: 520,
      titleIn: 320,
      titleStagger: 120,
      leadRise: 10,
      titleRise: 16,
      restIn: 300,
      restStagger: 80,
      restRise: 8,
    },
  } satisfies Record<TempoId, RevealTempo>,
  revealTempo: "b" as TempoId,
  landScale: 1.03,
  flashTo: 0.5,
  skipFade: 150,
  // Share / Copy link: the check and "Link copied" hold this long.
  copiedHold: 1500,
  // Quiz: a picked answer holds, then the question departs left and the next
  // arrives from the right. The new progress segment fills alongside.
  answerHold: 180,
  qOut: 160,
  qIn: 220,
  qShift: 12,
  segFill: 220,
} as const;

export const ms = (n: number) => `${n}ms`;

/**
 * When (0–1 of the duration) an easing curve reaches `progress` (0–1). On a
 * decelerating curve the flip's halfway turn comes early.
 */
export function timeAtProgress(progress: number, [x1, y1, x2, y2]: Curve = EASE_CURVE) {
  const bezier = (t: number, a: number, b: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  // y rises monotonically with t on this curve, so bisect for y(t) = progress.
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (bezier(mid, y1, y2) < progress) lo = mid;
    else hi = mid;
  }
  return bezier((lo + hi) / 2, x1, x2);
}
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
  "--dur-flip": ms(TIMING.flip),
  "--dur-tilt": ms(TIMING.tilt),
  "--foil-shift": px(TIMING.foilShift),
  "--dur-glare": ms(TIMING.glare),
  "--glare-rest": String(TIMING.glareRest),
  "--glare-active": String(TIMING.glareActive),
  "--land-scale": String(TIMING.landScale),
  "--flash-to": String(TIMING.flashTo),
  "--dur-skip": ms(TIMING.skipFade),
};

/** The reveal's per-tempo custom properties, set inline on the reveal's root. */
export const tempoCssVars = (tempo: RevealTempo): Record<string, string> => ({
  "--dur-land": ms(tempo.landGrow),
  "--dur-reveal-flip": ms(tempo.revealFlip),
  "--flip-ease": bezier(tempo.flipEase),
  "--dur-flash": ms(tempo.flashPulse / 2),
  "--dur-dock": ms(tempo.dock),
});
