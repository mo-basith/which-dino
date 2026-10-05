@AGENTS.md

# Which Dino?

A six-question personality quiz that ends in a holographic, shareable pixel-art dino trading card. A fun side project (not a business) at dino.mobasith.com.

Ten dinos: seven commons (T-rex, Velociraptor, Triceratops, Stegosaurus, Brachiosaurus, Spinosaurus, Dilophosaurus) and three rares (Pterodactyl, Mosasaurus, Chicken).

## Locked decisions

- **Next.js App Router on Vercel**, TypeScript, `src/` dir, `@/*` alias. Next because per-card link-preview images (`/c/[dino]`) need server rendering.
- **Tailwind v4.** Tokens are CSS variables in `@theme` in `src/app/globals.css`. The default colour palette and easings are cleared, so only our tokens exist.
- **Fonts:** Geist and Geist Mono, the `geist` package's own woff2 files, declared with `next/font/local` in `src/app/fonts.ts` (not `geist/font/*`, whose fallback drew ~3% too wide). No other fonts. `display: "optional"`: nothing may change size after first paint, so a view that paints before Geist arrives stays on the fallback rather than swapping. The fallbacks ("Geist Fallback", "Geist Mono Fallback") are hand-tuned `@font-face` rules in `globals.css` (Arial per weight range, Menlo), with `size-adjust` measured against Geist on this app's copy; re-measure if the copy or fonts change a lot.
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
| art window, common | `rgba(17,17,20,0.055)` over pearl, radius 10, 1px dots / 8px at `rgba(17,17,20,0.09)`; everything drawn in it (dino, era, ground, human, scale bar, egg) is ink; the dino is a silhouette (no red accent) | `card-window` + `--card-window*` |
| art window, rare | `rgba(255,255,255,0.045)` over rare-face, white dots at 9%; drawn in white, holo dino | `card-window` + `--card-window*` |

- **Contrast:** text, text-2 and text-3 all pass 4.5:1 on ground. Keep it that way. Note text-3 is 4.45:1 on raised-2, so don't put text-3 on raised-2.
- **Holo** is the ONLY colour in the UI, and only for: cards (and sleeves, and the logo's mini card), the RARE chip, and keyboard focus rings. `bg-holo`, and `holo-ring` for the focus hairline (`:focus-visible` only). A picked/selected state is NOT holo: it uses `line-selected`.
  `linear-gradient(115deg, #FF9FD8 0%, #FFE39F 20%, #A8FFCF 40%, #9FD8FF 60%, #C8A8FF 80%, #FF9FD8 100%)`
- **Prism** for rare cards and their frames: `bg-prism`.
  `linear-gradient(115deg, #FF7AC8 0%, #FFD97A 20%, #7AFFC0 40%, #7ACFFF 60%, #B98CFF 80%, #FF7AC8 100%)`
- `src/lib/holo.ts` is the only source of the holo and prism stops. It builds `--holo` / `--prism` and the repeating `--holo-foil` (`FOIL_CSS_VARS`), set on `<html>` like `MOTION_CSS_VARS`; never hardcode the gradients in CSS.
- **Glow:** soft radial behind hero content, `bg-glow`, rgba(180,170,255, 0.08–0.16) via `--glow-alpha`.
- **Type:** Geist for UI. Headings 600, letter-spacing -0.035em (`text-hero` 40 on phones / 80 from 1024px for the home H1, `text-display` 40 / 56 from 768px, `text-section` 32 / 40 from 768px for home section headings, `text-title` 32, `text-heading` 20 carry this). Body `text-body` 16 (`text-lead` 18 for a desktop lead paragraph), `text-small` 14. Geist Mono (`font-mono`) for the logo (`text-logo` 15, 500, -0.02em), labels (`text-label` 12, uppercase, no extra tracking), counters and numbers, and ALL text on the card itself.
- **Radius:** buttons and inputs `rounded-control` (12), small icon buttons `rounded-icon` (10), key hints `rounded-key` (6), cards `rounded-card` (16 at 280px card width; scale with the card), chips `rounded-full`.
- **Spacing:** 8px grid. Tailwind's base is 4px, so use even steps (`p-2`, `p-4`, `gap-6`…). Phone side margin `px-gutter` (24).
- **Layout:** phone first. Every page and section sits in one container: `site-container` (1120 of content, the gutter outside, centred; works as a block or a flex item), the header included, so the logo lines up with the content. Inside it, the quiz screens are a column at `max-w-column` (440px), questions `max-w-question` (520px, 64px answer rows) from 900px. From `desk:` (900px) the result and the shared card go two columns, the card at the container's left edge (under the logo), both centred in the height below the header (`items-center-safe`: taller content aligns to the top and scrolls, never clips). The home page uses breakpoints `sm` 640, `md` 768, `lg` 1024, `xl` 1280. `max-w-measure` (300px) is a centred line of body text on phones. Glows can reach past the page: the page wrappers are `overflow-clip` (both axes) so they never add scroll.
- **Header:** one `SiteHeader` (`src/components/site/`) on every page: the `Logo` on the left (`LogoMark`: an 18×24 mini card, 1px holo edge, raised-2 fill, turned −10°, with the screen's dino at scale 1 stepping off its bottom-right corner; then "Which Dino?"), a slot on the right. 36px tall 24px down on phones; 64px with a hairline from 768. The full nav (How it works, The herd, Start the quiz) is on home only; elsewhere the logo just links home (in the quiz, `QuizLogo` walks back through the quiz's own history). Each screen keeps its own dino: home T-rex, questions Dilophosaurus, result Triceratops, shared Velociraptor.
- **Pointer:** `can-hover:` = `(hover: hover) and (pointer: fine)`, for copy that only makes sense with a keyboard and mouse (e.g. "or press 1–4").
- **Buttons:** primary is `bg-text text-ground`, 48px tall (`h-12`); one primary per screen. Secondary is `bg-raised-1 border border-line`. Both get `press`. The flip pill (`FlipPill`, under interactive cards) is a 36px secondary pill with a 44px hit area: its visible text follows the side ("Flip card" / "Show front"), its accessible name stays "Flip card" and `aria-pressed` carries the side.
- **Icon buttons** draw at 36px (`size-9`, `rounded-icon`) with a 44px hit area (a 4px `::before` outset). See `IconButton` in `src/components/quiz/parts.tsx`.

## Motion rules

- Animate `transform` and `opacity` only.
- One easing: `cubic-bezier(0.2,0,0,1)` (`EASE` in `src/lib/motion.ts`; `ease-g` / `var(--motion-ease)` in CSS). Never ease-in on UI. No bounce. The reveal's flip alone uses `EASE_FLIP` (`cubic-bezier(0.32,0.08,0.16,1)`), slower off the mark so the turn reads.
- Press feedback: `scale(0.97)`, 150ms (`press` utility).
- **Every duration, delay, stagger and distance lives in the `TIMING` object in `src/lib/motion.ts`.** Nothing hardcoded anywhere else: no `duration-150`, no literal ms in components. CSS reads TIMING through custom properties set on `<html>` (`MOTION_CSS_VARS`: `--dur-press`, `--dur-fade`, `--dur-reduced`, `--press-scale`, `--dur-q-out`, `--dur-q-in`, `--q-shift`, `--dur-seg-fill`, `--dur-flip`, `--dur-tilt`, `--foil-shift`, `--dur-glare`, `--glare-rest`, `--glare-active`, `--land-scale`, `--flash-to`, `--dur-skip`, `--dur-land`, `--dur-reveal-flip`, `--flip-ease`, `--dur-flash`, `--dur-dock`, `--dur-section`, `--section-rise`, `--dur-deal`, `--deal-stagger`, `--deal-rise`, `--dur-fan-fade`, `--dur-sheen`, `--sheen-stagger`, `--dur-fan-hover`, `--fan-spread`, `--fan-turn`, `--fan-lift`); add new ones there when CSS needs them. Per-element values computed from TIMING (stagger delays) may be set inline as custom properties.
- `prefers-reduced-motion`: gentler, not zero. No travel, rotation or flips; state changes become ~150ms (`TIMING.reduced`) fades. In CSS use the `reduced:` variant (`@variant reduced` in plain CSS), in JS `useReducedMotion()` (`src/lib/useReducedMotion.ts`): both follow the OS unless a `data-motion="reduced" | "full"` ancestor and the `MotionOverride` provider force it (how `/dev/reveal` simulates it). `short:` is the under-700px-tall variant.
- Interactive sequences use one explicit state machine with a synchronous ref lock against double-fire. Use interruptible transitions, not keyframes.

## Components

- `<Sprite id size color silhouette cells accent label />` (`src/components/Sprite.tsx`): crisp SVG pixel art, always at a whole-number pixel scale. `size` is `{ scale }`, `{ height }` or `{ width }`; height/width round DOWN to the nearest whole scale (minimum 1; `spriteScale()` tells you which). `color` is any CSS colour or `"holo"` (each pixel tinted by its position on the holo gradient; `holoRange={[start, end]}` limits it to part of the gradient, e.g. the rare card dino uses `[0, BAR_HOLO_SPAN]`, pink → yellow → mint, like the rare bars). `silhouette` draws `r` pixels in the main colour instead of the accent. `cells` draws each pixel as its own square with a 1px gap (the faint idle look; needs scale ≥ 2); solid is the default.

## The card (`src/components/card/`)

- `<Card dinoId rows holder? hatchedAt? mode side? width? />`. `width` is px, or `"interactive"` / `"result"`, sized in CSS by the viewport (`.card-size-*`, `--card-k`) so nothing jumps after hydration. No `hatchedAt` (a friend's card from a link) leaves the date off the footer. `faces.tsx` is the presentational front/back; `Card.tsx` scales, tilts and flips. Card styles live in the `card-*` classes in `globals.css`; each face sets a `--card-*` palette (`.card-common` / `.card-rare`), so parts never branch on rarity.
- Designed at 280×350 and scaled as a whole with `transform`. **Size rule:** pixel art is only on whole pixels at whole multiples of 280. Interactive cards (result, card detail, returning intro, shared link) render at **280** (the result and shared link use `width="result"`: at the two-column layout, 560 from 960 tall, 420 (1.5×; whole pixels on 2× screens) from 720, otherwise 280); **240** only as a fallback when the viewport is under 700px tall. Thumbnails (104, the share-sheet preview) may be slightly soft. Share and preview images use whole multiples, never "whatever fits": the **share image** card is **560** (2×); the **link preview** card is **280** with no rotation.
- **Art size rule** (`artBox` / `artScale` / `artLeft` in `src/lib/card.ts`, tested): the dino fills a box from x 44 (clear of the human) to the window's right edge − 14, between 28 below the window's top (room for the era label) and the ground line (188×126 on commons, 186×126 on rares): the largest whole-number scale up to 8, centred horizontally, standing on the ground line. The OG images use the same numbers. `/dev/card/fronts` shows all ten fronts at 280.
- Interactive: one reducer (`side`, `phase`) with a synchronous `busy` ref lock. Tilt, foil and glare follow a desktop mouse only (written straight to CSS variables, no re-render); touch just flips. The flip control is a `<button>` over the card ("Flip the {name} card"). Reduced motion: no tilt, the flip becomes a `TIMING.reduced` crossfade.
- Static: no handlers, foil at a fixed slight offset. For thumbnails and exports.
- The "STILL HERE" chicken in the art window (tilt towards the top-left, desktop pointer only) is deliberate. Keep it quiet.
- Not in v1: the serial ("NO. 0427") and "% OF PLAYERS" slots stay empty.
- `/dev/card` is the test bench (all 10, a scale row, holder and answer pickers, an overflow check); `/dev/card/compare` lays out the four J1 views at the reference's exact positions for screenshot diffs.

## The quiz flow (`src/components/quiz/`)

- One client flow on `/`, no route changes: `Quiz.tsx` owns a reducer state machine (step 0 = intro, the home page; 1–6 = questions, 7 = result; phase `idle | out | enter`) and a synchronous `busy` ref lock. `screens.tsx` is presentational.
- Every step has a history entry `{ quiz: step }`, pushed in order from the intro's entry, so the phone's back button walks back. Our Back button and Backspace call `history.back()` too; all screen changes from history go through `popstate`.
- Going back shows that question with its answer pre-selected; answers after it are dropped. Tapping the same answer advances; a different one replaces it.
- Answers persist in `sessionStorage` (`which-dino:answers`), so a refresh resumes on the same step. An inline script hides the server-rendered intro until the client restores.
- The result (`{ dinoId, hatchedAt }`, `which-dino:result`) is made when the last answer is picked, and only then does the reveal play. A refresh or history lands on it settled. Retake clears answers and result and goes back to the intro's entry.
- `/?start` (the shared page's "Which dino am I?") clears any saved quiz, rewrites itself to the intro's entry and pushes question 1, so back from question 1 is the intro.
- Keys 1–4 / Backspace are handled on the quiz container (`<main tabIndex={-1}>`, focused on arrival, no focus ring of its own), never on `window`. The one exception: the home page's Enter-to-start (`EnterToStart`) listens on `document`, because focus rests on the body there; it's mounted with the home page only and ignores fields, links and buttons.

## The home page (`src/components/home/`)

- "/" renders `<Quiz home={<HomePage />} />`: the home page is server-rendered and the quiz shows it as step 0, so it adds little JS. Client islands only: `StartButton` and `EnterToStart` (`quiz/QuizStart.tsx`, through the quiz's own `start()` and its lock, via `QuizStartContext`), `ScrollLink` (#how, #herd: smooth, instant under reduced motion, focus moves there, no history entry), `SectionReveal`, and the phones' `FlippableCard`. Start jumps to the top instantly, never a smooth scroll.
- Sections: top bar (nav from 768), hero (two columns at viewport height from 1024; the `HeroFan` above the text on phones), How it works (`AnswerRow size="small"`, a `FaceDownCard`, `HerdSlot`s; never the "?"), The herd (`HerdTile`s, `found` always false until step 5; no "0 / 10 found" yet; wide dinos at scale 3 so they fit a two-column tile at 320), Every card has a back (the real `Card` with a fixed T-rex sample: static front and back from 1024, otherwise one card on its back with the pill "Show front" / "Show back"), closing CTA, footer. Copy is as in `home-*.png`; where the two differ, the desktop wording shows from 768.
- `SectionReveal`: a section off screen at mount fades and rises `TIMING.sectionRise` once as it enters (`TIMING.sectionIn`). Decided once at mount: anything visible on first paint never animates, nothing is hidden in the server HTML, and after a reload or back/forward (scroll may be restored after mount) nothing animates. Reduced motion: just there.
- **Sleeve** (`home/Sleeve.tsx`): the face-down card design, drawn at 240×300: a 1.5px holo edge, a raised-1 face with a wallpaper of all ten dinos (cells at scale 2, white at 6%, rows offset half a tile; `src/lib/wallpaper.ts`, served once as the static `/sleeve-wallpaper.svg` so the art stays in one place), a dashed inset at 12, and a centred emblem (the mark at 2×, "Which Dino?", "SERIES 01 · 10 DINOS"). It is not the card's own back face (that's the stats side). Follow-up, not done yet: the reveal's sleeve (`result/Sleeve.tsx`) should adopt this design, keeping its "?" and shuffle silhouettes in place of the emblem.
- **HeroFan** (`home/HeroFan.tsx`, client): a Sleeve either side and a real static `Card` front in the middle, laid out at 240-wide cards and scaled as a whole by `--fan-k` (0.56 on phones, 0.72 from 1024, 1 from 1280). The middle front changes through all ten every `TIMING.fanCycle`, crossfading over `fanFade`, with at most two fronts mounted; it and the sheen pause while the fan is off screen or the tab is hidden. On first paint the cards deal in, left, middle, right (`@starting-style`, so no JS and no flash: `dealIn`, `dealStagger`, `dealRise`). Every `sheenEvery` a light band crosses each card (`sheenCross`, `sheenStagger`; a transition re-armed by JS). Hover, fine pointers only: the sides spread `fanSpread` and turn `fanTurn`, the middle lifts `fanLift`, over `fanHover`. Reduced motion: no deal, sheen or cycling (the T-rex shows), and hover leaves it be.
- `FaceDownCard` (`quiz/FaceDownCard.tsx`) is the plain face-down card with a faint silhouette in "How it works", sized by `--face-k`.
- `/dev` is the style reference page (tokens, type, buttons, all sprites). Not linked from anywhere.

## The reveal and result (`src/components/result/`)

- `ResultScreen.tsx` is the result, and plays the reveal ("R2 Shuffle") into it: one reducer (phase `wait | shuffle | land | flip | hold | dock | settle | done`, mode `turn | fade`) with a synchronous `revealing` ref lock. The sequence's numbers are pure data in `src/lib/reveal.ts` (`shufflePath`, `revealSchedule`, `reducedSchedule`, `frontOnStage`, `stageWidth`; tested). CSS is the `reveal-*` classes in `globals.css`, driven by attributes on `.reveal`.
- **Stage, then dock:** wait → shuffle → land → flip → hold play big in the middle of the viewport (width `min(vw − 48, (vh − 200) × 0.8, 560)`) over a scrim (ground at 60%) and a stronger glow, with the caption above the card, the top bar at 40% and the rest of the screen hidden. Then **dock**: the card moves into its slot while the scrim lifts, and only then does the text come in ("You’re a", then the name rising further, then the flip pill, the RARE chip on rares, one-liner, actions, retake). Commons have no chip and no gap for one.
- Staging is a measured translate + scale on `.reveal-mover`: the card always renders at its slot size, so docked it is exactly 280 or 560 (staged, its pixels aren't whole, which is accepted). The result screen arrives by fade, not slide (`q-stage[data-fade]`), so nothing transformed sits between the fixed stage and the viewport.
- The face-down sleeve (`Sleeve.tsx`) and the real interactive card are the two faces of one 3D turn; when it opens, both rotations drop together and the sleeve unmounts, so the card is just the card in the same spot. The "?" (sleeve only) appears nowhere else. The flash peaks at the flip's real edge-on moment for the flip's curve (`timeAtProgress`).
- Skip: a tap on the card, or Enter / Space on it, jumps straight to the docked, settled state (fade mode, `TIMING.skipFade`); focus moves to the card's flip button. Reduced motion: no stage, no dock, no shuffle: the "?" waits, then a `TIMING.reduced` crossfade.
- The top-bar mark stays fixed through the reveal (never the winner's silhouette).
- Phone: one column. From 900 wide: two columns (in `site-container`), card left, text right; the stage is the middle of the viewport and the card docks into the left column.
- Sharing (`ShareActions.tsx`, words in `src/lib/share.ts`): "Share card" uses `navigator.share` (cancel does nothing) or copies "I’m a T-rex. Which dino are you? <url>"; the icon button copies the URL. Both confirm for `TIMING.copiedHold`. Links are absolute `/c/{id}` from `location.origin`.
- `/dev/reveal` is the reveal bench: any dino, replay or loop, simulated reduced motion, and the schedule's numbers. `?dino=…&bare` for captures. noindex.

## Shared links and previews

- `/c/[id]` (static for all ten; any other id redirects to `/`): the friend's card with the flip pill (README-stat back rows, no holder, no date), "A friend is a T-rex.", and "Which dino am I?" → `/?start`. Two columns from 900px, like the result.
- Link previews are `opengraph-image.tsx` / `twitter-image.tsx` (1200×630, `next/og`, built at build time) for `/c/[id]` and `/`; drawn by `src/components/og/og.tsx`, which mirrors the tokens (Satori can't read CSS variables) and loads Geist from the `geist` package's TTFs. Satori has no blend modes or masks: the card there is a simplified static front.
- `metadataBase` is `https://$VERCEL_PROJECT_PRODUCTION_URL`, else localhost.
