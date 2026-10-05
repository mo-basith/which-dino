import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CSSProperties, ReactNode } from "react";
import { DINOS, type DinoId, type Rarity } from "@/data/dinos";
import { spriteGrid, type SpriteGrid, type SpriteId } from "@/data/sprites";
import { ART, BAR_HOLO_SPAN, CARD, FRAME, artLeft, artScale, contentWidth, scaleLabel, sleeveScale } from "@/lib/card";
import { FOIL_CSS_VARS, HOLO_STOPS, colorAt, positionAlong } from "@/lib/holo";

// Link preview images (1200×630) drawn with next/og. Satori has no blend
// modes, masks or foil, so the card here is a simplified static front: the
// face, a gradient frame, a flat wash of the foil, the soft art window, the
// dino as pixel rects, the name and the one-liner. Layout at 280 design px,
// with no rotation. Server only (reads font files at build time).

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
export const OG_ALT = "A Which Dino? trading card";

// Mirrors the tokens in globals.css (Satori can't read CSS variables).
const C = {
  ground: "#08090A",
  raised1: "#0F1011",
  text: "#F7F8F8",
  text2: "#9BA0A8",
  text3: "#7A7F87",
  pearl: "#EEEDF0",
  ink: "#111114",
  rareFace: "#0B0B0D",
  lineDashed: "rgba(255,255,255,0.12)",
};

// Per rarity: the face, the flat foil wash standing in for the blended foil,
// and the art window's colours (as on the card: ink on commons, white on rares).
const FACE: Record<Rarity, { face: string; frame: string; wash: string; washOpacity: number; ink: string; window: string; dots: string; windowInk: string }> = {
  common: {
    face: C.pearl,
    frame: FOIL_CSS_VARS["--holo"],
    wash: FOIL_CSS_VARS["--holo"],
    washOpacity: 0.28,
    ink: C.ink,
    window: "rgba(17,17,20,0.055)",
    dots: "rgba(17,17,20,0.09)",
    windowInk: "17,17,20",
  },
  rare: {
    face: C.rareFace,
    frame: FOIL_CSS_VARS["--prism"],
    wash: FOIL_CSS_VARS["--prism"],
    washOpacity: 0.14,
    ink: C.text,
    window: "rgba(255,255,255,0.045)",
    dots: "rgba(255,255,255,0.09)",
    windowInk: "255,255,255",
  },
};

const FONT_DIR = join(process.cwd(), "node_modules/geist/dist/fonts");

export async function ogFonts() {
  const font = (file: string) => readFile(join(FONT_DIR, file));
  const [sans400, sans500, sans600, mono400, mono600] = await Promise.all([
    font("geist-sans/Geist-Regular.ttf"),
    font("geist-sans/Geist-Medium.ttf"),
    font("geist-sans/Geist-SemiBold.ttf"),
    font("geist-mono/GeistMono-Regular.ttf"),
    font("geist-mono/GeistMono-SemiBold.ttf"),
  ]);
  return [
    { name: "Geist", data: sans400, weight: 400, style: "normal" },
    { name: "Geist", data: sans500, weight: 500, style: "normal" },
    { name: "Geist", data: sans600, weight: 600, style: "normal" },
    { name: "Geist Mono", data: mono400, weight: 400, style: "normal" },
    { name: "Geist Mono", data: mono600, weight: 600, style: "normal" },
  ] as const;
}

// ── Pixel art as SVG ────────────────────────────────────────────────────────

type Fill = string | ((x: number, y: number, cols: number, rows: number) => string);

/** A sprite as SVG rects at a whole-number scale. '#' and 'r' both draw (silhouette). */
function PixelSprite({ grid, scale, fill, style }: { grid: SpriteGrid; scale: number; fill: Fill; style?: CSSProperties }) {
  const cols = Math.max(...grid.map((row) => row.length));
  const rows = grid.length;
  const cells = grid.flatMap((row, y) => [...row].flatMap((char, x) => (char === "." ? [] : [{ x, y }])));
  return (
    <svg width={cols * scale} height={rows * scale} viewBox={`0 0 ${cols} ${rows}`} style={style}>
      {typeof fill === "string" ? (
        <path d={cells.map(({ x, y }) => `M${x} ${y}h1v1h-1z`).join("")} fill={fill} />
      ) : (
        cells.map(({ x, y }) => <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill(x, y, cols, rows)} />)
      )}
    </svg>
  );
}

const sprite = (id: SpriteId) => spriteGrid(id);

/** 1px dots every 8px, as one path. */
function Dots({ width, height, color }: { width: number; height: number; color: string }) {
  let d = "";
  for (let y = 0; y < height; y += 8) for (let x = 0; x < width; x += 8) d += `M${x} ${y}h1v1h-1z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", top: 0, left: 0 }}>
      <path d={d} fill={color} />
    </svg>
  );
}

// ── The card front ─────────────────────────────────────────────────────────

const GROUND = ART.ground; // as in faces.tsx

export function OgCard({ dinoId }: { dinoId: DinoId }) {
  const dino = DINOS[dinoId];
  const face = FACE[dino.rarity];
  const frame = FRAME[dino.rarity];
  const inner = contentWidth(dino.rarity);
  const scale = artScale(dinoId);
  const grid = sprite(dinoId);
  const onWindow = (alpha: number) => `rgba(${face.windowInk},${alpha})`;
  const dinoFill: Fill =
    dino.rarity === "rare"
      ? (x, y, cols, rows) => colorAt(HOLO_STOPS, BAR_HOLO_SPAN * positionAlong(x + 0.5, y + 0.5, cols, rows))
      : face.ink;

  return (
    <div
      style={{
        display: "flex",
        width: CARD.width,
        height: CARD.height,
        borderRadius: CARD.radius,
        padding: frame,
        backgroundImage: face.frame,
        boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: CARD.radius - frame,
          backgroundColor: face.face,
          padding: CARD.padding,
          overflow: "hidden",
          fontFamily: "Geist Mono",
          color: face.ink,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: face.wash,
            opacity: face.washOpacity,
          }}
        />
        {/* Art window */}
        <div
          style={{
            display: "flex",
            position: "relative",
            width: inner,
            height: ART.height,
            flexShrink: 0,
            borderRadius: 10,
            backgroundColor: face.window,
            overflow: "hidden",
          }}
        >
          <Dots width={inner} height={ART.height} color={face.dots} />
          <div style={{ position: "absolute", top: 12, left: 12, fontSize: 7.5, lineHeight: 1, color: onWindow(0.55) }}>
            {dino.era.toUpperCase()}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: GROUND, height: 1, backgroundColor: onWindow(0.18) }} />
          <PixelSprite
            grid={sprite("human")}
            scale={3}
            fill={onWindow(0.38)}
            style={{ position: "absolute", left: 22, bottom: GROUND + 1 }}
          />
          <PixelSprite
            grid={grid}
            scale={scale}
            fill={dinoFill}
            style={{ position: "absolute", left: artLeft(dinoId), bottom: GROUND + 1 }}
          />
          <div style={{ position: "absolute", left: 14, right: 14, bottom: 9, display: "flex", alignItems: "center" }}>
            <div style={{ width: 1, height: 5, backgroundColor: onWindow(0.4) }} />
            <div style={{ flexGrow: 1, height: 1, marginLeft: 6, marginRight: 6, backgroundColor: onWindow(0.22) }} />
            <div style={{ fontSize: 8, lineHeight: 1, color: onWindow(0.6) }}>{scaleLabel(dino)}</div>
            <div style={{ flexGrow: 1, height: 1, marginLeft: 6, marginRight: 6, backgroundColor: onWindow(0.22) }} />
            <div style={{ width: 1, height: 5, backgroundColor: onWindow(0.4) }} />
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 28, lineHeight: 1.1, fontWeight: 600, letterSpacing: -0.98 }}>{dino.name}</div>
        <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.38 }}>{dino.oneLiner}</div>
        <div
          style={{
            marginTop: "auto",
            height: 1,
            backgroundColor: dino.rarity === "rare" ? "rgba(255,255,255,0.12)" : "rgba(17,17,20,0.12)",
          }}
        />
        {/* The footer's empty row: no holder or date on a shared card yet. */}
        <div style={{ height: 8.5 + 11 }} />
      </div>
    </div>
  );
}

/** A face-down card (the sleeve) with a faint silhouette, for the home preview's fan. */
function OgFaceDown({ dinoId, style }: { dinoId: DinoId; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        width: CARD.width,
        height: CARD.height,
        borderRadius: CARD.radius,
        padding: 1,
        backgroundImage: FOIL_CSS_VARS["--holo"],
        boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6)",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          borderRadius: CARD.radius - 1,
          backgroundColor: C.raised1,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 13,
            left: 13,
            right: 13,
            bottom: 13,
            borderRadius: 8,
            border: `1px dashed ${C.lineDashed}`,
          }}
        />
        <PixelSprite grid={sprite(dinoId)} scale={sleeveScale(dinoId)} fill="rgba(255,255,255,0.16)" />
      </div>
    </div>
  );
}

// ── The 1200×630 frame ─────────────────────────────────────────────────────

const CARD_LEFT = 120;
const TEXT_LEFT = 516;

function Frame({ art, title, line }: { art: ReactNode; title: string; line: string }) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        backgroundColor: C.ground,
        fontFamily: "Geist",
        color: C.text,
      }}
    >
      {/* The soft glow behind the card. */}
      <div
        style={{
          position: "absolute",
          left: CARD_LEFT + CARD.width / 2 - 360,
          top: OG_SIZE.height / 2 - 300,
          width: 720,
          height: 600,
          // Satori needs explicit stops here (no closest-side).
          backgroundImage: "radial-gradient(ellipse at center, rgba(180,170,255,0.14) 0%, rgba(180,170,255,0) 70%)",
        }}
      />
      {art}
      <div
        style={{
          position: "absolute",
          left: TEXT_LEFT,
          top: 0,
          bottom: 0,
          width: OG_SIZE.width - TEXT_LEFT - 64,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <PixelSprite grid={sprite("trex")} scale={2} fill={C.text} />
          <div style={{ marginLeft: 14, fontSize: 28, fontWeight: 500, letterSpacing: -0.4 }}>Which Dino?</div>
        </div>
        <div style={{ marginTop: 28, fontSize: 68, lineHeight: 1.05, fontWeight: 600, letterSpacing: -2.38 }}>{title}</div>
        <div style={{ marginTop: 20, fontSize: 32, lineHeight: 1.3, color: C.text2 }}>{line}</div>
        <div style={{ marginTop: 40, fontFamily: "Geist Mono", fontSize: 22, color: C.text3 }}>dino.mobasith.com</div>
      </div>
    </div>
  );
}

const CARD_TOP = (OG_SIZE.height - CARD.height) / 2;

/** /c/{id}: the dino's card, "A T-rex.", "Which dino are you?". */
export function CardPreview({ dinoId, title }: { dinoId: DinoId; title: string }) {
  return (
    <Frame
      title={title}
      line="Which dino are you?"
      art={
        <div style={{ display: "flex", position: "absolute", left: CARD_LEFT, top: CARD_TOP }}>
          <OgCard dinoId={dinoId} />
        </div>
      }
    />
  );
}

// The intro's fan (CardFan), at 280, drawn a little tighter so it clears the text.
const FAN: { id: DinoId; x: number; rotate: number }[] = [
  { id: "velociraptor", x: -56, rotate: -8 },
  { id: "triceratops", x: 56, rotate: 8 },
  { id: "trex", x: 0, rotate: 0 },
];
const FAN_PIVOT_Y = 392;

/** "/": three face-down cards, "Which dino are you?". */
export function HomePreview() {
  return (
    <Frame
      title="Which dino are you?"
      line="Six questions. One holographic card."
      art={FAN.map(({ id, x, rotate }) => (
        <OgFaceDown
          key={id}
          dinoId={id}
          style={{
            left: CARD_LEFT + x,
            top: CARD_TOP,
            transform: `rotate(${rotate}deg)`,
            transformOrigin: `${CARD.width / 2}px ${FAN_PIVOT_Y}px`,
          }}
        />
      ))}
    />
  );
}
