// Gradient stops for the holo and prism foils, used where a colour has to be
// computed in JS (e.g. per-pixel sprite tinting). Mirrors --holo and --prism
// in src/app/globals.css; change both together.

export type GradientStop = readonly [hex: string, at: number];

export const GRADIENT_ANGLE = 115;

export const HOLO_STOPS: readonly GradientStop[] = [
  ["#FF9FD8", 0],
  ["#FFE39F", 0.2],
  ["#A8FFCF", 0.4],
  ["#9FD8FF", 0.6],
  ["#C8A8FF", 0.8],
  ["#FF9FD8", 1],
];

export const PRISM_STOPS: readonly GradientStop[] = [
  ["#FF7AC8", 0],
  ["#FFD97A", 0.2],
  ["#7AFFC0", 0.4],
  ["#7ACFFF", 0.6],
  ["#B98CFF", 0.8],
  ["#FF7AC8", 1],
];

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const toHex = (rgb: number[]) =>
  "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");

/** Colour at t (0–1) along the stops, interpolated in sRGB like a CSS gradient. */
export function colorAt(stops: readonly GradientStop[], t: number): string {
  const p = Math.min(1, Math.max(0, t));
  for (let i = 1; i < stops.length; i++) {
    const [toColor, toAt] = stops[i];
    if (p <= toAt) {
      const [fromColor, fromAt] = stops[i - 1];
      const k = (p - fromAt) / (toAt - fromAt || 1);
      const a = toRgb(fromColor);
      const b = toRgb(toColor);
      return toHex(a.map((c, j) => c + (b[j] - c) * k));
    }
  }
  return stops[stops.length - 1][0];
}

/**
 * Where point (x, y) falls along a CSS `linear-gradient(<angle>deg, …)` drawn
 * over a w×h box, as 0–1. Same geometry as the browser: 0deg points up,
 * angles turn clockwise, and the gradient line spans the box corner to corner.
 */
export function positionAlong(x: number, y: number, w: number, h: number, angle = GRADIENT_ANGLE) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const length = Math.abs(w * dx) + Math.abs(h * dy);
  return 0.5 + ((x - w / 2) * dx + (y - h / 2) * dy) / length;
}
