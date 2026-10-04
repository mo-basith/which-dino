import type { CSSProperties } from "react";
import { SPRITE_ACCENT, spriteGrid, type SpriteGrid, type SpriteId } from "@/data/sprites";
import { HOLO_STOPS, colorAt, positionAlong } from "@/lib/holo";

/**
 * Pixel scale directly, or a target height/width in px. Always renders at a
 * whole-number scale: height/width round DOWN to fit (minimum 1).
 */
export type SpriteSize = { scale: number } | { height: number } | { width: number };

type SpriteProps = {
  id: SpriteId;
  size: SpriteSize;
  /** Any CSS colour (vars work), or "holo" to tint each pixel by its place on the holo gradient. */
  color?: string;
  /** Draw 'r' pixels in the main colour instead of the accent. */
  silhouette?: boolean;
  /** Draw each pixel as its own square with a 1px gap (the faint idle look). Needs scale ≥ 2. */
  cells?: boolean;
  accent?: string;
  /** Accessible name. Without one the sprite is decorative (aria-hidden). */
  label?: string;
  className?: string;
  style?: CSSProperties;
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

// One square per pixel, `cell` grid units wide (the rest of the unit is the gap).
const toCellPath = (runs: Run[], cell: number) =>
  runs
    .flatMap(({ x, y, length }) =>
      Array.from({ length }, (_, i) => `M${x + i} ${y}h${cell}v${cell}h-${cell}z`),
    )
    .join("");

const gridWidth = (grid: SpriteGrid) => Math.max(...grid.map((row) => row.length));

/** The whole-number pixel scale a sprite renders at for a given size. */
export function spriteScale(id: SpriteId, size: SpriteSize): number {
  if ("scale" in size) return size.scale;
  const grid = spriteGrid(id);
  const fit = "height" in size ? size.height / grid.length : size.width / gridWidth(grid);
  return Math.max(1, Math.floor(fit));
}

export function Sprite({
  id,
  size,
  color = "var(--color-text)",
  silhouette = false,
  cells = false,
  accent = SPRITE_ACCENT,
  label,
  className,
  style,
}: SpriteProps) {
  const grid = spriteGrid(id);
  const rows = grid.length;
  const cols = gridWidth(grid);
  const scale = spriteScale(id, size);
  // A 1px gap, in grid units. Below scale 2 there is no room for one.
  const cell = cells && scale >= 2 ? (scale - 1) / scale : 1;
  const path = (runs: Run[]) => (cell < 1 ? toCellPath(runs, cell) : toPath(runs));

  const isAccent = (char: string) => char === "r" && !silhouette;
  const runs = toRuns(grid);

  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={cols * scale}
      height={rows * scale}
      shapeRendering="crispEdges"
      className={className}
      style={style}
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
                width={cell}
                height={cell}
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
          <path d={path(runs.filter((r) => !isAccent(r.char)))} style={{ fill: color }} />
          {runs.some((r) => isAccent(r.char)) && (
            <path d={path(runs.filter((r) => isAccent(r.char)))} style={{ fill: accent }} />
          )}
        </>
      )}
    </svg>
  );
}
