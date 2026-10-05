// The sleeve's wallpaper: all ten dinos as cells (scale 2: one 1px square per
// pixel, 1px apart) in white at 6%, in rows of tiles with every other row
// offset by half a tile. Built from the sprite data, so it follows the art.
// Pure; served as an SVG by app/sleeve-wallpaper.svg.

import { DINO_IDS } from "../data/dinos";
import { SPRITES } from "../data/sprites";

export const WALLPAPER = { tileWidth: 72, tileHeight: 44, scale: 2, opacity: 0.06 } as const;
/** One repeat of the pattern: ten tiles across, two rows. */
export const WALLPAPER_SIZE = { width: WALLPAPER.tileWidth * DINO_IDS.length, height: WALLPAPER.tileHeight * 2 };

function tile(index: number, x: number, y: number) {
  const grid = SPRITES[DINO_IDS[index % DINO_IDS.length]];
  const { scale, tileWidth, tileHeight } = WALLPAPER;
  const left = x + Math.round((tileWidth - grid[0].length * scale) / 2);
  const top = y + Math.round((tileHeight - grid.length * scale) / 2);
  let d = "";
  grid.forEach((row, r) =>
    [...row].forEach((char, c) => {
      if (char !== ".") d += `M${left + c * scale} ${top + r * scale}h1v1h-1z`;
    }),
  );
  return d;
}

export function wallpaperSvg() {
  const { tileWidth, tileHeight, opacity } = WALLPAPER;
  const n = DINO_IDS.length;
  let d = "";
  for (let i = 0; i < n; i++) d += tile(i, i * tileWidth, 0);
  // The second row starts half a tile in, five dinos along; the tile hanging
  // off the left edge is the same as the last one, so the pattern repeats seamlessly.
  for (let i = 0; i <= n; i++) d += tile(i + n / 2, -tileWidth / 2 + i * tileWidth, tileHeight);
  const { width, height } = WALLPAPER_SIZE;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges"><path fill="#fff" fill-opacity="${opacity}" d="${d}"/></svg>`;
}
