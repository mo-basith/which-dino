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

- `src/data/dinos.ts`: one typed record per dino. `era`, `lengthM`, `span` (`"length"` or `"wingspan"`), `fact`, `herdWith`, `avoid` are drafts: every line marked `// verify` is fact-checked before launch.
- `src/data/sprites.ts`: pixel grids as string rows. `#` = ink, `r` = accent, `.` = empty. Rows must be the same width. Paste new art straight over an array. `PROPS` holds non-dino art (the `human` for scale, the reveal's `question` "?"); `<Sprite>` draws any `SpriteId`.
- `src/data/quiz.ts`: 6 questions × 4 answers; each answer scores two dino ids and carries a `cardLine` + `value` (0–99) for the card back. Balance is tuned from the exhaustive simulation (`npm run simulate`), never by hand.

## Scoring, tests and scripts

- `src/lib/scoring.ts` is pure (no React): each answer adds 1 to each of its two dinos; highest total wins. Ties go to the dino scored by the most recent answer; if both come from that answer, the one listed first wins.
- `src/lib/card.ts` is pure too: `backRows` (the card back's 3 rows: the answers that scored the winning dino, in question order, last 3; topped up from README stats in listed order; just the stats with no answers), plus the card's formatting and layout numbers.
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
| rare-label (rare card label, fact, footer) | `rgba(255,255,255,0.62)` | `text-rare-label` |
| card-label (common card label) | `#5A5962` | `text-card-label` |
| rare-face | `#0B0B0D` | `bg-rare-face` |
| art window, common | `rgba(17,17,20,0.055)` over pearl, radius 10, 1px dots / 8px at `rgba(17,17,20,0.09)`; everything drawn in it (dino, era, ground, human, scale bar, egg) is ink | `card-window` + `--card-window*` |
| art window, rare | `rgba(255,255,255,0.045)` over rare-face, white dots at 9%; drawn in white, holo dino | `card-window` + `--card-window*` |

- **Contrast:** text, text-2 and text-3 all pass 4.5:1 on ground. Keep it that way. Note text-3 is 4.45:1 on raised-2, so don't put text-3 on raised-2.
- **Holo** is the ONLY colour in the UI, and only for: cards, the "new" chip, and keyboard focus rings. `bg-holo`, and `holo-ring` for the focus hairline (`:focus-visible` only). A picked/selected state is NOT holo: it uses `line-selected`.
  `linear-gradient(115deg, #FF9FD8 0%, #FFE39F 20%, #A8FFCF 40%, #9FD8FF 60%, #C8A8FF 80%, #FF9FD8 100%)`
- **Prism** for rare cards and their frames: `bg-prism`.
  `linear-gradient(115deg, #FF7AC8 0%, #FFD97A 20%, #7AFFC0 40%, #7ACFFF 60%, #B98CFF 80%, #FF7AC8 100%)`
- `src/lib/holo.ts` is the only source of the holo and prism stops. It builds `--holo` / `--prism` and the repeating `--holo-foil` (`FOIL_CSS_VARS`), set on `<html>` like `MOTION_CSS_VARS`; never hardcode the gradients in CSS.
- **Glow:** soft radial behind hero content, `bg-glow`, rgba(180,170,255, 0.08–0.16) via `--glow-alpha`.
- **Type:** Geist for UI. Headings 600, letter-spacing -0.035em (`text-display` 40 on phones / 56 from 768px, `text-title` 32, `text-heading` 20 carry this). Body `text-body` 16, `text-small` 14. Geist Mono (`font-mono`) for labels (`text-label` 12, uppercase, no extra tracking), counters and numbers, and ALL text on the card itself.
- **Radius:** buttons and inputs `rounded-control` (12), small icon buttons `rounded-icon` (10), key hints `rounded-key` (6), cards `rounded-card` (16 at 280px card width; scale with the card), chips `rounded-full`.
- **Spacing:** 8px grid. Tailwind's base is 4px, so use even steps (`p-2`, `p-4`, `gap-6`…). Phone side margin `px-gutter` (24).
- **Layout:** phone first. On wider screens the same column is centred at `max-w-column` (440px); two-column desktop screens (so far the result) widen to `max-w-wide` (1200px) from 1024px.
- **Pointer:** `can-hover:` = `(hover: hover) and (pointer: fine)`, for copy that only makes sense with a keyboard and mouse (e.g. "or press 1–4").
- **Buttons:** primary is `bg-text text-ground`, 48px tall (`h-12`); one primary per screen. Secondary is `bg-raised-1 border border-line`. Both get `press`.
- **Icon buttons** draw at 36px (`size-9`, `rounded-icon`) with a 44px hit area (a 4px `::before` outset). See `IconButton` in `src/components/quiz/parts.tsx`.

## Motion rules

- Animate `transform` and `opacity` only.
- One easing: `cubic-bezier(0.2,0,0,1)` (`EASE` in `src/lib/motion.ts`; `ease-g` / `var(--motion-ease)` in CSS). Never ease-in on UI. No bounce.
- Press feedback: `scale(0.97)`, 150ms (`press` utility).
- **Every duration, delay, stagger and distance lives in the `TIMING` object in `src/lib/motion.ts`.** Nothing hardcoded anywhere else: no `duration-150`, no literal ms in components. CSS reads TIMING through custom properties set on `<html>` (`MOTION_CSS_VARS`: `--dur-press`, `--dur-fade`, `--dur-reduced`, `--press-scale`, `--dur-q-out`, `--dur-q-in`, `--q-shift`, `--dur-seg-fill`, `--dur-flip`, `--dur-tilt`, `--foil-shift`, `--dur-glare`, `--glare-rest`, `--glare-active`, `--dur-land`, `--land-scale`, `--dur-reveal-flip`, `--dur-flash`, `--flash-to`, `--dur-skip`); add new ones there when CSS needs them. Per-element values computed from TIMING (stagger delays) may be set inline as custom properties.
- `prefers-reduced-motion`: gentler, not zero. No travel, rotation or flips; state changes become ~150ms (`TIMING.reduced`) fades. In CSS use the `reduced:` variant (`@variant reduced` in plain CSS), in JS `useReducedMotion()` (`src/lib/useReducedMotion.ts`): both follow the OS unless a `data-motion="reduced" | "full"` ancestor and the `MotionOverride` provider force it (how `/dev/reveal` simulates it). `short:` is the under-700px-tall variant.
- Interactive sequences use one explicit state machine with a synchronous ref lock against double-fire. Use interruptible transitions, not keyframes.

## Components

- `<Sprite id size color silhouette cells accent label />` (`src/components/Sprite.tsx`): crisp SVG pixel art, always at a whole-number pixel scale. `size` is `{ scale }`, `{ height }` or `{ width }`; height/width round DOWN to the nearest whole scale (minimum 1; `spriteScale()` tells you which). `color` is any CSS colour or `"holo"` (each pixel tinted by its position on the holo gradient; `holoRange={[start, end]}` limits it to part of the gradient, e.g. the rare card dino uses `[0, BAR_HOLO_SPAN]`, pink → yellow → mint, like the rare bars). `silhouette` draws `r` pixels in the main colour instead of the accent. `cells` draws each pixel as its own square with a 1px gap (the faint idle look; needs scale ≥ 2); solid is the default.

## The card (`src/components/card/`)

- `<Card dinoId rows holder? hatchedAt? mode side? width? />`. `width` is px, or `"interactive"` / `"result"`, sized in CSS by the viewport (`.card-size-*`, `--card-k`) so nothing jumps after hydration. No `hatchedAt` (a friend's card from a link) leaves the date off the footer. `faces.tsx` is the presentational front/back; `Card.tsx` scales, tilts and flips. Card styles live in the `card-*` classes in `globals.css`; each face sets a `--card-*` palette (`.card-common` / `.card-rare`), so parts never branch on rarity.
- Designed at 280×350 and scaled as a whole with `transform`. **Size rule:** pixel art is only on whole pixels at whole multiples of 280. Interactive cards (result, card detail, returning intro, shared link) render at **280**; **240** only as a fallback when the viewport is under 700px tall. Thumbnails (104, the share-sheet preview) may be slightly soft. Share and preview images use whole multiples, never "whatever fits": the **share image** card is **560** (2×); the **link preview** card is **280** with no rotation. The **desktop result** card is **560** when the viewport is at least 1024 wide and 820 tall, otherwise 280 (`width="result"`).
- Interactive: one reducer (`side`, `phase`) with a synchronous `busy` ref lock. Tilt, foil and glare follow a desktop mouse only (written straight to CSS variables, no re-render); touch just flips. The flip control is a `<button>` over the card ("Flip the {name} card"). Reduced motion: no tilt, the flip becomes a `TIMING.reduced` crossfade.
- Static: no handlers, foil at a fixed slight offset. For thumbnails and exports.
- The "STILL HERE" chicken in the art window (tilt towards the top-left, desktop pointer only) is deliberate. Keep it quiet.
- Not in v1: the serial ("NO. 0427") and "% OF PLAYERS" slots stay empty.
- `/dev/card` is the test bench (all 10, a scale row, holder and answer pickers, an overflow check); `/dev/card/compare` lays out the four J1 views at the reference's exact positions for screenshot diffs.

## The quiz flow (`src/components/quiz/`)

- One client flow on `/`, no route changes: `Quiz.tsx` owns a reducer state machine (step 0 = intro, 1–6 = questions, 7 = result; phase `idle | out | enter`) and a synchronous `busy` ref lock. `screens.tsx` is presentational.
- Every step has a history entry `{ quiz: step }`, pushed in order from the intro's entry, so the phone's back button walks back. Our Back button and Backspace call `history.back()` too; all screen changes from history go through `popstate`.
- Going back shows that question with its answer pre-selected; answers after it are dropped. Tapping the same answer advances; a different one replaces it.
- Answers persist in `sessionStorage` (`which-dino:answers`), so a refresh resumes on the same step. An inline script hides the server-rendered intro until the client restores.
- The result (`{ dinoId, hatchedAt }`, `which-dino:result`) is made when the last answer is picked, and only then does the reveal play. A refresh or history lands on it settled. Retake clears answers and result and goes back to the intro's entry.
- `/?start` (the shared page's "Which dino am I?") clears any saved quiz, rewrites itself to the intro's entry and pushes question 1, so back from question 1 is the intro.
- Keys 1–4 / Backspace are handled on the quiz container (`<main tabIndex={-1}>`, focused on arrival, no focus ring of its own), never on `window`.
- `/dev` is the style reference page (tokens, type, buttons, all sprites). Not linked from anywhere.

## The reveal and result (`src/components/result/`)

- `ResultScreen.tsx` is the result, and plays the reveal ("R2 Shuffle") into it: one reducer (phase `wait | shuffle | land | flip | settle | done`, mode `turn | fade`) with a synchronous `revealing` ref lock. The sequence's numbers are pure data in `src/lib/reveal.ts` (`shufflePath`, `revealSchedule`, `reducedSchedule`; tested). CSS is the `reveal-*` classes in `globals.css`, driven by attributes on `.reveal`.
- The face-down sleeve (`Sleeve.tsx`) and the real interactive card are the two faces of one 3D turn; when it opens, both rotations drop together and the sleeve unmounts, so the card is just the card in the same spot. The "?" (sleeve only) appears nowhere else.
- Skip: a tap on the card, or Enter / Space on it, jumps to the end (fade mode, `TIMING.skipFade`); focus moves to the card's flip button. Reduced motion: the "?" waits, then a `TIMING.reduced` crossfade, no shuffle.
- The top-bar mark stays fixed through the reveal (never the winner's silhouette).
- Phone: one column. From 1024 wide: two columns (`max-w-wide`), card left, text right; the reveal runs in the same layout.
- Sharing (`ShareActions.tsx`, words in `src/lib/share.ts`): "Share card" uses `navigator.share` (cancel does nothing) or copies "I’m a T-rex. Which dino are you? <url>"; the icon button copies the URL. Both confirm for `TIMING.copiedHold`. Links are absolute `/c/{id}` from `location.origin`.
- `/dev/reveal` is the reveal bench: any dino, replay or loop, simulated reduced motion, and the schedule's numbers. `?dino=…&bare` for captures. noindex.

## Shared links and previews

- `/c/[id]` (static for all ten; any other id redirects to `/`): the friend's card (README-stat back rows, no holder, no date), "A friend is a T-rex.", and "Which dino am I?" → `/?start`.
- Link previews are `opengraph-image.tsx` / `twitter-image.tsx` (1200×630, `next/og`, built at build time) for `/c/[id]` and `/`; drawn by `src/components/og/og.tsx`, which mirrors the tokens (Satori can't read CSS variables) and loads Geist from the `geist` package's TTFs. Satori has no blend modes or masks: the card there is a simplified static front.
- `metadataBase` is `https://$VERCEL_PROJECT_PRODUCTION_URL`, else localhost.
