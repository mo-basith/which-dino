import type { CSSProperties } from "react";
import { LogoMark } from "@/components/site/Logo";
import { WALLPAPER_SIZE } from "@/lib/wallpaper";

// The face-down card ("sleeve", reference/design/brand/logo.png, right): a
// 1.5px holo edge, a raised-1 face with a faint wallpaper of all ten dinos, a
// dashed inset at 12, and a centred emblem (the mark at 2×, the name, the
// series). Drawn at 240×300; scale it as a whole. Separate from the card's
// own back face, which is the stats side.

export const SLEEVE_SIZE = { width: 240, height: 300 } as const;

export function Sleeve({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className={`bg-holo relative rounded-[14px] p-[1.5px] shadow-[0_24px_48px_-12px_rgb(0_0_0/0.6)] ${className}`}
      style={{ width: SLEEVE_SIZE.width, height: SLEEVE_SIZE.height, ...style }}
    >
      <div
        className="relative grid size-full place-items-center overflow-hidden rounded-[12.5px] bg-raised-1"
        style={{
          backgroundImage: "url(/sleeve-wallpaper.svg)",
          backgroundSize: `${WALLPAPER_SIZE.width}px ${WALLPAPER_SIZE.height}px`,
        }}
      >
        <div className="absolute inset-3 rounded-[6px] border border-dashed border-line-dashed" />
        <div className="relative flex flex-col items-center rounded-[12px] border border-line bg-raised-1 px-6 pt-5 pb-4">
          <LogoMark dino="trex" scale={2} />
          <p className="mt-3 font-mono text-logo">Which Dino?</p>
          <p className="mt-2 font-mono text-[8px] leading-none tracking-[0.14em] text-text-3 uppercase">Series 01 · 10 dinos</p>
        </div>
      </div>
    </div>
  );
}
