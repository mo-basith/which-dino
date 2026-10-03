import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sprite, type SpriteSize } from "@/components/Sprite";
import { DINO_LIST } from "@/data/dinos";

// Style reference for system "G". Not linked from anywhere.

export const metadata: Metadata = {
  title: "Dev · Which Dino?",
  robots: { index: false, follow: false },
};

type Swatch = { name: string; value: string; className: string };

// Values mirror globals.css (the source of truth) so they can be labelled here.
const SURFACES: Swatch[] = [
  { name: "ground", value: "#08090A", className: "bg-ground" },
  { name: "raised-1", value: "#0F1011", className: "bg-raised-1" },
  { name: "raised-2", value: "#16171A", className: "bg-raised-2" },
];

const LINES: Swatch[] = [
  { name: "line", value: "rgba(255,255,255,0.08)", className: "bg-line" },
  { name: "line-strong", value: "rgba(255,255,255,0.16)", className: "bg-line-strong" },
];

const TEXT: Swatch[] = [
  { name: "text", value: "#F7F8F8", className: "bg-text" },
  { name: "text-2", value: "#9BA0A8", className: "bg-text-2" },
  { name: "text-3", value: "#7A7F87", className: "bg-text-3" },
];

const CARD: Swatch[] = [
  { name: "pearl", value: "#EEEDF0", className: "bg-pearl" },
  { name: "ink", value: "#111114", className: "bg-ink" },
  { name: "card-label", value: "#5A5962", className: "bg-card-label" },
  { name: "rare-face", value: "#0B0B0D", className: "bg-rare-face" },
  { name: "art-window", value: "#131316 + dots", className: "bg-art-window" },
];

const FOILS: Swatch[] = [
  { name: "holo", value: "115deg, 6 stops", className: "bg-holo" },
  { name: "prism", value: "115deg, 6 stops", className: "bg-prism" },
  { name: "glow", value: "rgba(180,170,255,0.12)", className: "bg-glow" },
];

const SPRITE_SIZES: { name: string; size: SpriteSize }[] = [
  { name: "16 tall", size: { height: 16 } },
  { name: "64 tall", size: { height: 64 } },
  { name: "120 wide", size: { width: 120 } },
];

const SPRITE_MODES = [
  { name: "white", color: "var(--color-text)", silhouette: false },
  { name: "silhouette 16%", color: "rgb(255 255 255 / 0.16)", silhouette: true },
  { name: "holo", color: "holo", silhouette: false },
];

const TYPE_SCALE: { name: string; sample: ReactNode }[] = [
  { name: "display · 48 / 600", sample: <p className="text-display">Which Dino?</p> },
  { name: "title · 32 / 600", sample: <p className="text-title">You’re a Triceratops</p> },
  { name: "heading · 20 / 600", sample: <p className="text-heading">Collect all 10</p> },
  {
    name: "body · 16",
    sample: (
      <p className="max-w-prose text-body text-text-2">
        The loyal protector. Calm, until someone messes with your people.
      </p>
    ),
  },
  { name: "small · 14", sample: <p className="text-small text-text-2">Six questions, about a minute.</p> },
  { name: "label · mono 12", sample: <p className="font-mono text-label uppercase">Question 3 of 6</p> },
  {
    name: "numbers · mono",
    sample: <p className="font-mono text-heading tabular-nums">03 / 10 · 97 · 62 · 88</p>,
  },
];

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function Label({ children }: { children: ReactNode }) {
  return <p className="font-mono text-label uppercase text-text-3">{children}</p>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-8">
      <h2 className="text-heading">{title}</h2>
      {children}
    </section>
  );
}

function Swatches({ items, note }: { items: Swatch[]; note?: (s: Swatch) => ReactNode }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((s) => (
        <li key={s.name} className="flex flex-col gap-2">
          <div className={`h-16 rounded-control border border-line ${s.className}`} />
          <div>
            <p className="text-small">{s.name}</p>
            <p className="font-mono text-label text-text-2">{s.value}</p>
            {note?.(s)}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DevPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-gutter py-16">
      <header className="relative flex flex-col gap-2">
        <div className="bg-glow pointer-events-none absolute -top-24 -left-24 size-96" aria-hidden />
        <Label>System G · dev</Label>
        <h1 className="relative text-title">Which Dino? tokens</h1>
      </header>

      <Section title="Surfaces">
        <Swatches items={SURFACES} />
      </Section>

      <Section title="Lines">
        <Swatches items={LINES} />
      </Section>

      <Section title="Text">
        <Swatches
          items={TEXT}
          note={(s) => (
            <p className="font-mono text-label text-text-3">
              {contrast(s.value, "#08090A").toFixed(2)}:1 on ground ·{" "}
              {contrast(s.value, "#16171A").toFixed(2)}:1 on raised-2
            </p>
          )}
        />
      </Section>

      <Section title="Card">
        <Swatches items={CARD} />
      </Section>

      <Section title="Foils">
        <Swatches items={FOILS} />
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-6">
          {TYPE_SCALE.map(({ name, sample }) => (
            <div key={name} className="flex flex-col gap-1">
              <Label>{name}</Label>
              {sample}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Controls">
        <div className="flex flex-wrap items-center gap-4">
          <button className="press holo-ring h-12 rounded-control bg-text px-6 font-medium text-ground">
            Start
          </button>
          <button className="press holo-ring h-12 rounded-control border border-line bg-raised-1 px-6 font-medium">
            Retake
          </button>
          <button
            className="press holo-ring grid size-10 place-items-center rounded-icon border border-line bg-raised-1 [--ring-radius:var(--radius-icon)]"
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="bg-holo rounded-full px-3 py-1 font-mono text-label uppercase text-ink">New</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="press holo-ring h-12 rounded-control border border-line bg-raised-1 px-6 text-left">
            Reacts, never replies
          </button>
          <button
            data-selected="true"
            className="press holo-ring h-12 rounded-control border border-line bg-raised-2 px-6 text-left"
          >
            Muted it in 2019 · selected
          </button>
        </div>
        <p className="text-small text-text-3">Tab to see the focus hairline. Press to see the scale.</p>
      </Section>

      <Section title="Sprites">
        <p className="font-mono text-label uppercase text-text-3">
          Rows: {SPRITE_MODES.map((m) => m.name).join(" · ")} — Columns:{" "}
          {SPRITE_SIZES.map((s) => s.name).join(" · ")}
        </p>
        <ul className="grid gap-4 lg:grid-cols-2">
          {DINO_LIST.map((dino) => (
            <li key={dino.id} className="flex min-w-0 flex-col gap-4 rounded-card border border-line bg-raised-1 p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-small">{dino.name}</p>
                <p className="font-mono text-label uppercase text-text-3">
                  {dino.number} · {dino.rarity}
                </p>
              </div>
              <div className="bg-art-window grid grid-cols-[auto_auto_auto] items-end justify-start gap-x-6 gap-y-4 overflow-x-auto rounded-control p-4">
                {SPRITE_MODES.flatMap((m) =>
                  SPRITE_SIZES.map((s) => (
                    <Sprite
                      key={`${m.name}-${s.name}`}
                      id={dino.id}
                      size={s.size}
                      color={m.color}
                      silhouette={m.silhouette}
                    />
                  )),
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
