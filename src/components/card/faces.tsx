import type { ReactNode } from "react";
import { Sprite } from "@/components/Sprite";
import { DINOS, type Dino, type DinoId, type Rarity } from "@/data/dinos";
import { SPRITES } from "@/data/sprites";
import {
  BAR_BLOCKS,
  artScale,
  blockHoloAt,
  contentWidth,
  filledBlocks,
  formatValue,
  holderLine,
  scaleLabel,
  type CardRow,
} from "@/lib/card";
import { HOLO_STOPS, colorAt } from "@/lib/holo";

// The two faces of the card, laid out at 280×350 design px. Card.tsx scales
// them as a whole and handles tilt and flip; these are presentational.
// Every colour comes from the face's --card-* palette (globals.css).

export type Side = "front" | "back";

type FaceProps = {
  rarity: Rarity;
  /** The back face of a flippable card: turned away until the card flips. */
  turned?: boolean;
  hidden?: boolean;
  children: ReactNode;
};

/** Frame, face, foil and glare. The content sits under the foil. */
function Face({ rarity, turned = false, hidden, children }: FaceProps) {
  return (
    <div
      className={`card-face card-${rarity} ${turned ? "card-face-back" : "card-face-front"} absolute inset-0 rounded-card p-(--card-frame-width)`}
      style={{ backgroundImage: "var(--card-frame)" }}
      aria-hidden={hidden || undefined}
    >
      <div data-card-body className="relative flex size-full flex-col overflow-hidden rounded-[calc(var(--radius-card)-var(--card-frame-width))] bg-(--card-face) p-4 font-mono text-(--card-ink)">
        {children}
        <div className={`card-foil card-foil-${rarity}`} />
        <div className="card-glare" />
      </div>
    </div>
  );
}

function Footer({ left, right }: { left?: string; right?: string }) {
  return (
    <div data-card-footer className="mt-auto flex justify-between border-t border-(--card-line) pt-[11px] text-[8.5px] leading-none text-(--card-label) uppercase">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

const ON_WINDOW = {
  era: "rgb(255 255 255 / 0.55)",
  ground: "rgb(255 255 255 / 0.18)",
  human: "rgb(255 255 255 / 0.38)",
  bar: "rgb(255 255 255 / 0.25)",
  label: "rgb(255 255 255 / 0.6)",
};

// The dino and the human stand on the ground line, 29px up from the bottom.
const GROUND = 29;

function ArtWindow({ dino, egg }: { dino: Dino; egg: boolean }) {
  const grid = SPRITES[dino.id];
  const scale = artScale(dino.id);
  const width = Math.max(...grid.map((row) => row.length)) * scale;
  // Whole pixels, so the art never lands on a half pixel.
  const left = Math.round((contentWidth(dino.rarity) - width) / 2);

  return (
    <div className="relative h-[184px] shrink-0 overflow-hidden rounded-[10px] bg-art-window">
      <p className="absolute top-3 left-3 text-[7.5px] leading-none uppercase" style={{ color: ON_WINDOW.era }}>
        {dino.era}
      </p>
      {egg && (
        <div className="card-egg absolute top-3 right-3 flex flex-col items-end gap-[3px]">
          <Sprite id="chicken" size={{ scale: 1 }} silhouette color="var(--card-egg)" />
          <span className="text-[6px] leading-none text-(--card-egg)">STILL HERE</span>
        </div>
      )}
      <div className="absolute inset-x-0 h-px" style={{ bottom: GROUND, background: ON_WINDOW.ground }} />
      <Sprite
        id="human"
        size={{ scale: 3 }}
        color={ON_WINDOW.human}
        className="absolute left-[22px]"
        style={{ bottom: GROUND + 1 }}
      />
      <Sprite
        id={dino.id}
        size={{ scale }}
        color={dino.rarity === "rare" ? "holo" : "var(--card-dino)"}
        className="absolute"
        style={{ bottom: GROUND + 1, left }}
      />
      <div className="absolute inset-x-[14px] bottom-[9px] flex items-center gap-1.5">
        <ScaleTick />
        <div className="h-px flex-1" style={{ background: ON_WINDOW.bar }} />
        <span className="text-[8px] leading-none" style={{ color: ON_WINDOW.label }}>
          {scaleLabel(dino)}
        </span>
        <div className="h-px flex-1" style={{ background: ON_WINDOW.bar }} />
        <ScaleTick />
      </div>
    </div>
  );
}

const ScaleTick = () => <div className="h-[5px] w-px" style={{ background: ON_WINDOW.label }} />;

type FrontProps = {
  dinoId: DinoId;
  holder?: string;
  hatchedAt: Date;
  turned?: boolean;
  hidden?: boolean;
  /** Render the hidden "STILL HERE" chicken (interactive cards only). */
  egg?: boolean;
};

export function CardFront({ dinoId, holder, hatchedAt, turned, hidden, egg = false }: FrontProps) {
  const dino = DINOS[dinoId];
  return (
    <Face rarity={dino.rarity} turned={turned} hidden={hidden}>
      <ArtWindow dino={dino} egg={egg} />
      <p className="mt-[14px] text-[28px] leading-[1.1] font-semibold tracking-[-0.035em]">{dino.name}</p>
      <p className="mt-2 text-[12.5px] leading-[1.38]">{dino.oneLiner}</p>
      {/* Right slot: the serial ("NO. 0427") comes back with analytics. */}
      <Footer left={holderLine(holder, hatchedAt)} />
    </Face>
  );
}

// Back rows: a 13px label line, then 7px down, a bar of 20 blocks.
const ROW = { label: 13, gap: 7 } as const;

function Bar({ value, rarity }: { value: number; rarity: Rarity }) {
  const filled = filledBlocks(value);
  return (
    <div className="flex justify-between" style={{ marginTop: ROW.gap }}>
      {Array.from({ length: BAR_BLOCKS }, (_, i) => {
        if (i >= filled) {
          return <div key={i} className="size-[9px] shadow-[inset_0_0_0_1px_var(--card-block-empty)]" />;
        }
        // On rares each block takes its own colour along the holo gradient.
        const fill = rarity === "rare" ? colorAt(HOLO_STOPS, blockHoloAt(i)) : "var(--card-ink)";
        return <div key={i} className="size-[9px]" style={{ background: fill }} />;
      })}
    </div>
  );
}

/** Herd/avoid: the dino's solid silhouette at scale 1 in a dashed box, then its name. */
function Kin({ id, label }: { id: DinoId; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="grid h-[30px] w-[34px] shrink-0 place-items-center rounded-[6px] border border-dashed border-(--card-dash)">
        <Sprite id={id} size={{ scale: 1 }} silhouette color="var(--card-silhouette)" />
      </div>
      <div className="min-w-0">
        <p className="text-[7.5px] leading-none text-(--card-label) uppercase">{label}</p>
        <p className="mt-[5px] text-[10px] leading-none font-medium whitespace-nowrap">{DINOS[id].name}</p>
      </div>
    </div>
  );
}

const Divider = () => <div className="mt-[11px] h-px shrink-0 bg-(--card-line)" />;

type BackProps = {
  dinoId: DinoId;
  rows: readonly CardRow[];
  turned?: boolean;
  hidden?: boolean;
};

export function CardBack({ dinoId, rows, turned, hidden }: BackProps) {
  const dino = DINOS[dinoId];
  return (
    <Face rarity={dino.rarity} turned={turned} hidden={hidden}>
      <div className="flex flex-col gap-[11px]">
        {rows.map((row, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between gap-2" style={{ lineHeight: `${ROW.label}px` }}>
              <span className="truncate text-[12px]">{row.label}</span>
              <span className="text-[11px]">{formatValue(row.value)}</span>
            </div>
            <Bar value={row.value} rarity={dino.rarity} />
          </div>
        ))}
      </div>
      <Divider />
      {/* 4px between columns so the longest names (Dilophosaurus, Brachiosaurus: 78px) fit on rares too. */}
      <div className="mt-[11px] grid grid-cols-2 gap-x-1">
        <Kin id={dino.herdWith} label="Herd" />
        <Kin id={dino.avoid} label="Avoid" />
      </div>
      <Divider />
      <p className="mt-3 text-[12px] leading-[1.4] text-(--card-label)">{dino.fact}</p>
      {/* Left slot: "% OF PLAYERS" comes back with analytics. */}
      <Footer right="Series 01" />
    </Face>
  );
}
