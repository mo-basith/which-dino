import { Sprite } from "@/components/Sprite";
import { DINOS, type DinoId } from "@/data/dinos";
import { SLEEVE, sleeveScale } from "@/lib/card";

// The face-down card the reveal starts on, at 280×350 design px: a 1px holo
// frame (crossfading to prism for a rare), a raised-1 face, a dashed inner
// border, and either the holo "?" or the current shuffle silhouette with its
// number. Presentational: Reveal decides what it shows.

type SleeveProps = {
  /** The silhouette showing, or null for the "?". */
  dinoId: DinoId | null;
  /** Switch the frame from holo to prism (a rare has landed). */
  rare: boolean;
};

export function Sleeve({ dinoId, rare }: SleeveProps) {
  return (
    <div className="relative size-full rounded-card p-px">
      <div className="bg-holo absolute inset-0 rounded-card" />
      <div className={`bg-prism fade absolute inset-0 rounded-card ${rare ? "opacity-100" : "opacity-0"}`} />
      <div className="relative grid size-full place-items-center rounded-[calc(var(--radius-card)-1px)] bg-raised-1">
        <div
          className="absolute rounded-[8px] border border-dashed border-line-dashed"
          style={{ inset: SLEEVE.inset }}
        />
        {dinoId ? (
          <>
            <Sprite
              id={dinoId}
              size={{ scale: sleeveScale(dinoId) }}
              color="rgb(255 255 255 / 0.85)"
              silhouette
            />
            <p className="absolute inset-x-0 bottom-[34px] text-center font-mono text-[11px] leading-none text-text-3">
              NO. {DINOS[dinoId].number}
            </p>
          </>
        ) : (
          <Sprite id="question" size={{ scale: SLEEVE.markScale }} color="holo" />
        )}
      </div>
    </div>
  );
}
