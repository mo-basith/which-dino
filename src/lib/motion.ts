// The single source of truth for motion. Every duration, delay, stagger and
// distance lives here; nothing is hardcoded anywhere else.
// Units: milliseconds unless the key says otherwise (Rise/Shift = px, Scale/To/Rest/Active = ratio,
// Max = degrees).

export type Curve = readonly [x1: number, y1: number, x2: number, y2: number];
const bezier = (curve: Curve) => `cubic-bezier(${curve.join(", ")})`;

/** The one easing curve for UI. Never ease-in, no bounce. */
export const EASE_CURVE: Curve = [0.2, 0, 0, 1];
export const EASE = bezier(EASE_CURVE);

/** The reveal's flip: slower off the mark than EASE, so the turn reads. */
export const EASE_FLIP_CURVE: Curve = [0.32, 0.08, 0.16, 1];
export const EASE_FLIP = bezier(EASE_FLIP_CURVE);
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
  // The reveal ("stage, then dock"). The face-down sleeve waits, shuffles
  // through silhouettes (each step's hold, in order; the last is the winner),
  // lands (grows to landScale over landGrow, holds the rest of land; rares hold
  // rareBeat longer), then flips to the card on EASE_FLIP. A white flash pulses
  // to flashTo over flashPulse at the flip's actual edge-on moment. All of that
  // plays big in the middle of the screen; the flipped card holds for
  // stageHold, then docks into its slot over dock. Then the text: "You're a"
  // rises leadRise, the name titleStagger later rises titleRise, then the rest,
  // restStagger apart. Skip jumps to the end, fading in over skipFade.
  revealWait: 700,
  shuffleSteps: [60, 60, 60, 65, 75, 90, 110, 135, 165, 205, 250, 320],
  land: 400,
  landGrow: 200,
  rareBeat: 200,
  revealFlip: 480,
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
  landScale: 1.03,
  flashTo: 0.5,
  skipFade: 150,
  // Home: each section below the first paint fades in and rises once as it enters.
  sectionIn: 480,
  sectionRise: 8,
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
  "--dur-land": ms(TIMING.landGrow),
  "--dur-reveal-flip": ms(TIMING.revealFlip),
  "--flip-ease": EASE_FLIP,
  "--dur-flash": ms(TIMING.flashPulse / 2),
  "--dur-dock": ms(TIMING.dock),
  "--dur-section": ms(TIMING.sectionIn),
  "--section-rise": px(TIMING.sectionRise),
};
