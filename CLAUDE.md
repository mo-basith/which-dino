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
- `src/data/quiz.ts`: 6 questions × 4 answers; each answer scores two dino ids. Balance is tuned from the exhaustive simulation (`npm run simulate`), never by hand.

## Scoring, tests and scripts

- `src/lib/scoring.ts` is pure (no React): each answer adds 1 to each of its two dinos; highest total wins. Ties go to the dino scored by the most recent answer; if both come from that answer, the one listed first wins.
- `npm test` runs `*.test.ts` with Node's built-in runner. `npm run simulate` scores all 4,096 answer combinations (targets: each common 11–15%, each rare 3–6%).
- Both compile with `tsc -p tsconfig.node.json` into `.tsout/` (gitignored), so no TS runner is needed. Anything they import must use relative imports, not `@/`.

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
| line-selected (picked answer) | `rgba(255,255,255,0.32)` | `border-line-selected` |
| line-dashed (face-down card inner border) | `rgba(255,255,255,0.12)` | `border-line-dashed` |
| text | `#F7F8F8` | `text-text` |
| text-2 | `#9BA0A8` | `text-text-2` |
| text-3 | `#7A7F87` | `text-text-3` |
| pearl (common card face) | `#EEEDF0` | `bg-pearl` |
| ink (common card ink) | `#111114` | `text-ink` |
| card-label (common card label) | `#5A5962` | `text-card-label` |
| rare-face | `#0B0B0D` | `bg-rare-face` |
| art window | `#131316` + 1px dots / 8px / 7% white | `bg-art-window` |

- **Contrast:** text, text-2 and text-3 all pass 4.5:1 on ground. Keep it that way. Note text-3 is 4.45:1 on raised-2, so don't put text-3 on raised-2.
- **Holo** is the ONLY colour in the UI, and only for: cards, the "new" chip, and keyboard focus rings. `bg-holo`, and `holo-ring` for the focus hairline (`:focus-visible` only). A picked/selected state is NOT holo: it uses `line-selected`.
  `linear-gradient(115deg, #FF9FD8 0%, #FFE39F 20%, #A8FFCF 40%, #9FD8FF 60%, #C8A8FF 80%, #FF9FD8 100%)`
- **Prism** for rare cards and their frames: `bg-prism`.
  `linear-gradient(115deg, #FF7AC8 0%, #FFD97A 20%, #7AFFC0 40%, #7ACFFF 60%, #B98CFF 80%, #FF7AC8 100%)`
- `src/lib/holo.ts` is the only source of the holo and prism stops. It builds `--holo` / `--prism` (`FOIL_CSS_VARS`), set on `<html>` like `MOTION_CSS_VARS`; never hardcode the gradients in CSS.
- **Glow:** soft radial behind hero content, `bg-glow`, rgba(180,170,255, 0.08–0.16) via `--glow-alpha`.
- **Type:** Geist for UI. Headings 600, letter-spacing -0.035em (`text-display` 48, `text-title` 32, `text-heading` 20 carry this). Body `text-body` 16, `text-small` 14. Geist Mono (`font-mono`) for labels (`text-label` 12, uppercase, no extra tracking), counters and numbers, and ALL text on the card itself.
- **Radius:** buttons and inputs `rounded-control` (12), small icon buttons `rounded-icon` (10), key hints `rounded-key` (6), cards `rounded-card` (16 at 280px card width; scale with the card), chips `rounded-full`.
- **Spacing:** 8px grid. Tailwind's base is 4px, so use even steps (`p-2`, `p-4`, `gap-6`…). Phone side margin `px-gutter` (24).
- **Layout:** phone first. On wider screens the same column is centred at `max-w-column` (440px) until the two-column desktop lands.
- **Pointer:** `can-hover:` = `(hover: hover) and (pointer: fine)`, for copy that only makes sense with a keyboard and mouse (e.g. "or press 1–4").
- **Buttons:** primary is `bg-text text-ground`, 48px tall (`h-12`); one primary per screen. Secondary is `bg-raised-1 border border-line`. Both get `press`.
- **Icon buttons** draw at 36px (`size-9`, `rounded-icon`) with a 44px hit area (a 4px `::before` outset). See `IconButton` in `src/components/quiz/parts.tsx`.

## Motion rules

- Animate `transform` and `opacity` only.
- One easing: `cubic-bezier(0.2,0,0,1)` (`EASE` in `src/lib/motion.ts`; `ease-g` / `var(--motion-ease)` in CSS). Never ease-in on UI. No bounce.
- Press feedback: `scale(0.97)`, 150ms (`press` utility).
- **Every duration, delay, stagger and distance lives in the `TIMING` object in `src/lib/motion.ts`.** Nothing hardcoded anywhere else: no `duration-150`, no literal ms in components. CSS reads TIMING through custom properties set on `<html>` (`MOTION_CSS_VARS`: `--dur-press`, `--dur-fade`, `--dur-reduced`, `--press-scale`, `--dur-q-out`, `--dur-q-in`, `--q-shift`, `--dur-seg-fill`); add new ones there when CSS needs them.
- `prefers-reduced-motion`: gentler, not zero. No travel, rotation or flips; state changes become ~150ms (`TIMING.reduced`) fades.
- Interactive sequences use one explicit state machine with a synchronous ref lock against double-fire. Use interruptible transitions, not keyframes.

## Components

- `<Sprite id size color silhouette cells accent label />` (`src/components/Sprite.tsx`): crisp SVG pixel art, always at a whole-number pixel scale. `size` is `{ scale }`, `{ height }` or `{ width }`; height/width round DOWN to the nearest whole scale (minimum 1; `spriteScale()` tells you which). `color` is any CSS colour or `"holo"` (each pixel tinted by its position on the holo gradient). `silhouette` draws `r` pixels in the main colour instead of the accent. `cells` draws each pixel as its own square with a 1px gap (the faint idle look; needs scale ≥ 2); solid is the default.

## The quiz flow (`src/components/quiz/`)

- One client flow on `/`, no route changes: `Quiz.tsx` owns a reducer state machine (step 0 = intro, 1–6 = questions, 7 = done; phase `idle | out | enter`) and a synchronous `busy` ref lock. `screens.tsx` is presentational.
- Every step has a history entry `{ quiz: step }`, pushed in order from the intro's entry, so the phone's back button walks back. Our Back button and Backspace call `history.back()` too; all screen changes from history go through `popstate`.
- Going back shows that question with its answer pre-selected; answers after it are dropped. Tapping the same answer advances; a different one replaces it.
- Answers persist in `sessionStorage` (`which-dino:answers`), so a refresh resumes on the same step. An inline script hides the server-rendered intro until the client restores.
- Keys 1–4 / Backspace are handled on the quiz container (`<main tabIndex={-1}>`, focused on arrival, no focus ring of its own), never on `window`.
- `/dev` is the style reference page (tokens, type, buttons, all sprites). Not linked from anywhere.
