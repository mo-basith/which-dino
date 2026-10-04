# Which Dino? · locked design references

These images are the approved designs (system "G"). They were exported from the design canvas, which you can't open. Use them for **appearance**: layout, spacing, hierarchy, copy and states. The prompts and CLAUDE.md win on **behaviour, timing and tokens**. If an image and a prompt disagree, follow the prompt and flag it.

The old boards in `reference/dino-v0/*.dc.html` are superseded. Ignore their styling.

## screens/ (phone 390 wide unless noted)
| File | What |
|---|---|
| home-desktop.png (1440), home-mobile.png (390) | **The home page, first visit. Supersedes 01-intro.png and d1-desktop-intro.png.** Full-page captures: hero (fan of face-down cards + heading + Start), How it works (3 steps), The herd (10 tiles, rares chipped RARE), Every card has a back (front + back, Flip card pill), closing CTA, footer. |
| 01-intro.png | Superseded by home-mobile.png. |
| 02-intro-returning.png | Returning visitor: your card, "Welcome back, T-rex.", Share my card / Retake. |
| 03-shared-link.png | Landing from a friend's link. Their card, "Sam is a Velociraptor.", "Added to your herd" chip. |
| 04-question.png | Question, resting. Segmented progress, key hints 1–4. |
| 05-question-picked.png | Question, answer picked. The row brightens, the others dim to 50%, and the key hint becomes a check. |
| 07-result-common.png | Result: card, title, one-liner, Share / Save / Copy link, herd row. **The "NEW · 2 / 10" chip is removed:** commons show no chip; rares show a small holo "RARE" chip. |
| 08-result-rare.png | The same for a rare (prism card). |
| 09-result-already-owned.png | The same when the card is already in your herd (neutral chip). |
| 10-share-sheet.png | Bottom sheet: preview, optional "Sign it" name field, Share… / Save image / Copy link. |
| 11-binder.png | "Your herd" 3/10: three columns, found cards plus dashed silhouettes. This screen scrolls. |
| 12-card-detail.png | One card large (tap to flip, hover to tilt), prev/next, "From Sam · 3 Oct". |
| d2-desktop-result.png | Desktop result, 1440 wide: two columns, both vertically centred in the viewport. (d1-desktop-intro.png is superseded by home-desktop.png.) |
| share-image-1080x1350.png | The saved/shared image. |
| link-preview-1200x630.png | The link preview. |

The small mark next to "Which Dino?" in the top bar is a different white dino silhouette on each screen.

## card/
`card-j1-front-and-back.png` is the locked card ("J1"), shown at 280×350 design size in four views: common front, common back, rare front and rare back. All text on the card is Geist Mono. The bars are 20 square "pixel blocks": filled in ink on commons, and in holo colours per block on rares. Common dinos are drawn in white; rare dinos are drawn in holo pixels.

**Not in v1:** the serial ("NO. 0427") and "% OF PLAYERS". Leave those slots empty for now. They come back with analytics.

## reveal/
Frames of the locked reveal ("R2 Shuffle"), which plays after question 6 and settles into the result screen:
1. `06-reveal-1-shuffling.png`: the face-down card, with silhouettes flicking past and their numbers. "Shuffling the herd…" sits below.
2. `06-reveal-2-landed.png`: it lands on your dino's silhouette and the card grows slightly.
3. `06-reveal-3-settled-into-result.png`: after the flip, the title, chip, one-liner, actions and herd row fade in one after another. This is exactly the result screen.

Timings live in `TIMING`; step 4's prompt describes the sequence.
