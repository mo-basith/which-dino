// The single source of truth for motion. Every duration, delay, stagger and
// distance lives here; nothing is hardcoded anywhere else.
// Units: milliseconds unless the key says otherwise (Rise/Shift = px, Scale/To/Rest/Active = ratio,
// Max = degrees).

/** The one easing curve's control points (x1, y1, x2, y2). */
export const EASE_CURVE = [0.2, 0, 0, 1] as const;
export const EASE = `cubic-bezier(${EASE_CURVE.join(", ")})`;

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
  // Reveal: the face-down sleeve waits, shuffles through silhouettes (each
  // step's hold, in order; the last is the winner), lands (grows to landScale
  // over land/2; rares hold rareBeat longer), then flips to the card. A white
  // flash pulses to flashTo over flashPulse at the flip's halfway turn. Then
  // the title rises in, and titleStagger later the rest, restStagger apart.
  // Skip jumps to the end, fading in over skipFade.
  revealWait: 600,
  shuffleSteps: [60, 60, 60, 65, 75, 90, 110, 135, 165, 205, 250],
  land: 320,
  landScale: 1.03,
  rareBeat: 160,
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
 * When (0–1 of the duration) the easing curve reaches `progress` (0–1). The
 * flip's halfway turn comes early on this curve: it decelerates.
 */
export function timeAtProgress(progress: number, [x1, y1, x2, y2] = EASE_CURVE) {
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
  "--dur-land": ms(TIMING.land / 2),
  "--land-scale": String(TIMING.landScale),
  "--dur-reveal-flip": ms(TIMING.revealFlip),
  "--dur-flash": ms(TIMING.flashPulse / 2),
  "--flash-to": String(TIMING.flashTo),
  "--dur-skip": ms(TIMING.skipFade),
};
