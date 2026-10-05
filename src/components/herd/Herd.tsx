import { Sprite } from "@/components/Sprite";
import { HoloChip } from "@/components/quiz/parts";
import type { Dino, DinoId } from "@/data/dinos";
import { SPRITES } from "@/data/sprites";

// The herd: the ten dinos you can collect. Server-safe pieces, shared by the
// home page now and the herd row and binder in step 5. `found` is always false
// until then.

/** A small herd slot: the dino's solid silhouette, white when found, faint when not. */
export function HerdSlot({ id, found }: { id: DinoId; found: boolean }) {
  return (
    <div
      className={`grid h-8 place-items-center rounded-[8px] border ${found ? "border-line-strong bg-raised-2" : "border-line bg-raised-1"}`}
    >
      <Sprite id={id} size={{ scale: 1 }} silhouette color={found ? "var(--color-text)" : "rgb(255 255 255 / 0.3)"} />
    </div>
  );
}

// Scale 4, or 3 for the wide ones (Triceratops, Stegosaurus, Spinosaurus), so
// every silhouette fits a two-column tile on a 320px phone (98px inside).
const TILE_ART_WIDTH = 96;
const tileScale = (id: DinoId) => Math.min(4, Math.floor(TILE_ART_WIDTH / SPRITES[id][0].length));

/** One dino in the herd grid: number, rare chip, silhouette (22% white cells until found), name. */
export function HerdTile({ dino, found }: { dino: Dino; found: boolean }) {
  return (
    <div className="flex flex-col rounded-card border border-line bg-raised-1 p-4">
      <div className="flex h-6 items-center justify-between">
        <p className="font-mono text-label text-text-3">NO. {dino.number}</p>
        {dino.rarity === "rare" && <HoloChip size="small">Rare</HoloChip>}
      </div>
      <div className="mt-2 flex h-[76px] items-end justify-center">
        <Sprite
          id={dino.id}
          size={{ scale: tileScale(dino.id) }}
          silhouette
          cells={!found}
          color={found ? "var(--color-text)" : "rgb(255 255 255 / 0.22)"}
        />
      </div>
      <p className="mt-4 text-small font-medium">{dino.name}</p>
    </div>
  );
}
