import type { DinoId } from "@/data/dinos";
import { SPRITES, SPRITE_ACCENT, type SpriteGrid } from "@/data/sprites";
import { HOLO_STOPS, colorAt, positionAlong } from "@/lib/holo";

/** Pixel scale directly, or a target height/width in px (scale derived from the grid). */
export type SpriteSize = { scale: number } | { height: number } | { width: number };

type SpriteProps = {
  id: DinoId;
  size: SpriteSize;
  /** Any CSS colour (vars work), or "holo" to tint each pixel by its place on the holo gradient. */
  color?: string;
  /** Draw 'r' pixels in the main colour instead of the accent. */
  silhouette?: boolean;
  accent?: string;
  /** Accessible name. Without one the sprite is decorative (aria-hidden). */
  label?: string;
  className?: string;
};

type Run = { x: number; y: number; length: number; char: string };

// Horizontal runs of identical non-empty pixels, so solid fills draw as one path.
function toRuns(grid: SpriteGrid): Run[] {
  const runs: Run[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const char = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === char) end++;
      if (char !== ".") runs.push({ x, y, length: end - x, char });
      x = end;
    }
  });
  return runs;
}

const toPath = (runs: Run[]) =>
  runs.map(({ x, y, length }) => `M${x} ${y}h${length}v1h-${length}z`).join("");

const round = (n: number) => Math.round(n * 100) / 100;

export function Sprite({
  id,
  size,
  color = "var(--color-text)",
  silhouette = false,
  accent = SPRITE_ACCENT,
  label,
  className,
}: SpriteProps) {
  const grid = SPRITES[id];
  const rows = grid.length;
  const cols = Math.max(...grid.map((row) => row.length));
  const scale =
    "scale" in size ? size.scale : "height" in size ? size.height / rows : size.width / cols;

  const isAccent = (char: string) => char === "r" && !silhouette;
  const runs = toRuns(grid);

  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={round(cols * scale)}
      height={round(rows * scale)}
      shapeRendering="crispEdges"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {color === "holo" ? (
        <>
          {runs.flatMap(({ x, y, length, char }) =>
            Array.from({ length }, (_, i) => (
              <rect
                key={`${x + i}-${y}`}
                x={x + i}
                y={y}
                width={1}
                height={1}
                fill={
                  isAccent(char)
                    ? accent
                    : colorAt(HOLO_STOPS, positionAlong(x + i + 0.5, y + 0.5, cols, rows))
                }
              />
            )),
          )}
        </>
      ) : (
        <>
          <path d={toPath(runs.filter((r) => !isAccent(r.char)))} style={{ fill: color }} />
          {runs.some((r) => isAccent(r.char)) && (
            <path d={toPath(runs.filter((r) => isAccent(r.char)))} style={{ fill: accent }} />
          )}
        </>
      )}
    </svg>
  );
}
