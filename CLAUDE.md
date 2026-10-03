@AGENTS.md

# Which Dino?

A six-question personality quiz that ends in a holographic, shareable pixel-art dino trading card. A fun side project (not a business) at dino.mobasith.com.

Ten dinos: seven commons (T-rex, Velociraptor, Triceratops, Stegosaurus, Brachiosaurus, Spinosaurus, Dilophosaurus) and three rares (Pterodactyl, Mosasaurus, Chicken).

## Locked decisions

- **Next.js App Router on Vercel**, TypeScript, `src/` dir, `@/*` alias. Next because per-card link-preview images (`/c/[dino]`) need server rendering.
- **Tailwind v4.** Tokens are CSS variables in `@theme` in `src/app/globals.css`. The default colour palette and easings are cleared, so only our tokens exist.
- **Fonts:** Geist and Geist Mono from the `geist` package (`geist/font/sans`, `geist/font/mono`). No other fonts.
- **No UI kit, no animation library.** Motion is hand-written CSS transitions driven by explicit state.
- **Lean dependencies:** Next, React, Tailwind, geist. Ask before adding anything else.
- **Dark only.** No light mode, no `prefers-color-scheme` queries.
- **Dino ids are permanent** (`trex`, `velociraptor`, `triceratops`, `stegosaurus`, `brachiosaurus`, `spinosaurus`, `dilophosaurus`, `pterodactyl`, `mosasaurus`, `chicken`). They are URL slugs (`/c/trex`). Never rename one.

## Content lives in `src/data`

Copy and art are data; swapping them must never touch components.

- `src/data/dinos.ts`: one typed record per dino. `era`, `lengthM`, `fact`, `herdWith`, `avoid` are TODO placeholders (`"TODO"` / `null`).
- `src/data/sprites.ts`: pixel grids as string rows. `#` = ink, `r` = accent, `.` = empty. Rows must be the same width. Paste new art straight over an array.
- `src/data/quiz.ts`: 6 questions × 4 answers; each answer scores two dino ids. Scoring is intentionally unbalanced for now; it gets rebalanced from an exhaustive simulation, never by hand.

## `reference/` is context only

`reference/dino-v0/` holds the v0 brief, sprites and old design boards. Never import from it. Its styling and motion numbers are superseded by this file.

Approved designs: reference/design/ (see DESIGN.md)

## Design tokens (system "G")

| Token | Value | Tailwind |
|---|---|---|
| ground | `#08090A` | `bg-ground` |
| raised-1 | `#0F1011` | `bg-raised-1` |
| raised-2 | `#16171A` | `bg-raised-2` |
| line | `rgba(255,255,255,0.08)` | `border-line` |
| line-strong | `rgba(255,255,255,0.16)` | `border-line-strong` |
| text | `#F7F8F8` | `text-text` |
| text-2 | `#9BA0A8` | `text-text-2` |
| text-3 | `#7A7F87` | `text-text-3` |
| pearl (common card face) | `#EEEDF0` | `bg-pearl` |
| ink (common card ink) | `#111114` | `text-ink` |
| card-label (common card label) | `#5A5962` | `text-card-label` |
| rare-face | `#0B0B0D` | `bg-rare-face` |
| art window | `#131316` + 1px dots / 8px / 7% white | `bg-art-window` |

- **Contrast:** text, text-2 and text-3 all pass 4.5:1 on ground. Keep it that way. Note text-3 is 4.45:1 on raised-2, so don't put text-3 on raised-2.
- **Holo** is the ONLY colour in the UI: cards, the selected/focus hairline, the "new" chip. `bg-holo`, and `holo-ring` for the hairline (focus-visible or `data-selected="true"`).
  `linear-gradient(115deg, #FF9FD8 0%, #FFE39F 20%, #A8FFCF 40%, #9FD8FF 60%, #C8A8FF 80%, #FF9FD8 100%)`
- **Prism** for rare cards and their frames: `bg-prism`.
  `linear-gradient(115deg, #FF7AC8 0%, #FFD97A 20%, #7AFFC0 40%, #7ACFFF 60%, #B98CFF 80%, #FF7AC8 100%)`
- Holo and prism stops are mirrored in `src/lib/holo.ts` for per-pixel tinting. Change both together.
- **Glow:** soft radial behind hero content, `bg-glow`, rgba(180,170,255, 0.08–0.16) via `--glow-alpha`.
- **Type:** Geist for UI. Headings 600, letter-spacing -0.035em (`text-display` 48, `text-title` 32, `text-heading` 20 carry this). Body `text-body` 16, `text-small` 14. Geist Mono (`font-mono`) for labels (`text-label` 12, uppercase), counters and numbers, and ALL text on the card itself.
- **Radius:** buttons and inputs `rounded-control` (12), small icon buttons `rounded-icon` (10), cards `rounded-card` (16 at 280px card width; scale with the card), chips `rounded-full`.
- **Spacing:** 8px grid. Tailwind's base is 4px, so use even steps (`p-2`, `p-4`, `gap-6`…). Phone side margin `px-gutter` (24).
- **Buttons:** primary is `bg-text text-ground`, 48px tall (`h-12`); one primary per screen. Secondary is `bg-raised-1 border border-line`. Both get `press`.

## Motion rules

- Animate `transform` and `opacity` only.
- One easing: `cubic-bezier(0.2,0,0,1)` (`EASE` in `src/lib/motion.ts`; `ease-g` / `var(--motion-ease)` in CSS). Never ease-in on UI. No bounce.
- Press feedback: `scale(0.97)`, 150ms (`press` utility).
- **Every duration, delay, stagger and distance lives in the `TIMING` object in `src/lib/motion.ts`.** Nothing hardcoded anywhere else: no `duration-150`, no literal ms in components. CSS reads TIMING through custom properties set on `<html>` (`MOTION_CSS_VARS`: `--dur-press`, `--dur-fade`, `--dur-reduced`, `--press-scale`); add new ones there when CSS needs them.
- `prefers-reduced-motion`: gentler, not zero. No travel, rotation or flips; state changes become ~150ms (`TIMING.reduced`) fades.
- Interactive sequences use one explicit state machine with a synchronous ref lock against double-fire. Use interruptible transitions, not keyframes.

## Components

- `<Sprite id size color silhouette accent label />` (`src/components/Sprite.tsx`): crisp SVG pixel art. `size` is `{ scale }`, `{ height }` or `{ width }`. `color` is any CSS colour or `"holo"` (each pixel tinted by its position on the holo gradient). `silhouette` draws `r` pixels in the main colour instead of the accent.
- `/dev` is the style reference page (tokens, type, buttons, all sprites). Not linked from anywhere.
