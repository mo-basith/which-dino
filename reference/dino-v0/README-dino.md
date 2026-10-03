# Which Dino? · v0 brief

A six-question personality quiz that ends in a holographic, shareable dino trading card. A fun side project, separate from the portfolio, on **dino.mobasith.com**.

Serve this folder with `python3 serve.py` and open the boards at http://localhost:8000/:
- `DinoCards.dc.html`: three card styles (A classic foil, B clean premium, C dark collector). Hover to tilt.
- `DinoQuiz.dc.html` and `DinoQuiz-Mobile.dc.html`: the playable v0 flow (intro, 6 questions, poof reveal, card + share).

`sprites.py` has placeholder pixel art for all ten (rows of `#` = ink, `r` = red). `sprites-sheet.png` previews them. They need a real art pass.

## Decisions so far
- Pure-fun personality quiz (not about work).
- 10 famous dinos, 9 from the Jurassic films, plus the chicken as the twist.
- Card: 4:5, exported 1080×1350; link previews use a 1200×630 crop.
- v0 card styles: B (white, holo frame and scene) for commons, C (dark, neon foil) for the three rares.
- Six questions, four answers each; each answer adds a point to two dinos; a tie goes to the last answer.
- Separate product so the style can be loud and free. Not tied to the portfolio design system.

## The ten

| No. | Dino | Rarity | One-liner | Stats |
|---|---|---|---|---|
| 01 | T-rex | Common | The main character. Loud, confident, tiny arms, big plans. | Main char 99 · Arm reach 08 · Volume 94 |
| 02 | Velociraptor | Common | The clever one. Always three steps ahead. | Scheming 96 · Speed 91 · Patience 14 |
| 03 | Triceratops | Common | The loyal protector. Calm, until someone messes with your people. | Loyalty 97 · Patience 62 · Headbutt 88 |
| 04 | Stegosaurus | Common | The chill one. Slow mornings, strong boundaries. | Chill 98 · Boundaries 90 · Urgency 06 |
| 05 | Brachiosaurus | Common | The gentle giant. Head in the clouds, snacking all day. | Snacks 99 · Kindness 93 · Hurry 03 |
| 06 | Spinosaurus | Common | The show-off. Bigger than T-rex, and won’t let anyone forget it. | Flex 99 · Swagger 95 · Humility 07 |
| 07 | Dilophosaurus | Common | The drama queen. Pretty frill, venom when crossed. | Drama 99 · Frill 94 · Forgiveness 11 |
| 08 | Pterodactyl | Rare | The free spirit. Technically not a dinosaur, and proud of it. | Freedom 98 · Altitude 92 · Rules 05 |
| 09 | Mosasaurus | Rare | The deep one. Quiet on the surface, a lot going on underneath. | Depth 99 · Mystery 93 · Small talk 04 |
| 10 | Chicken | Rare | The survivor. Outlived them all. Still here, still clucking. | Survival 99 · Cluck 91 · Chill 40 |

## The six questions

1. **It’s Saturday morning. You’re…**
   - Still asleep. Obviously. → Stegosaurus, Brachiosaurus
   - On your third plan of the day → Velociraptor, Spinosaurus
   - At brunch with the group chat → Triceratops, Chicken
   - Somewhere nobody can find you → Pterodactyl, Mosasaurus
2. **Pick a snack.**
   - The whole buffet → T-rex, Brachiosaurus
   - Whatever’s left over → Chicken, Velociraptor
   - Something spicy → Dilophosaurus, Spinosaurus
   - Seafood, always → Mosasaurus, Pterodactyl
3. **Your role in the group chat?**
   - Sends the plans → Velociraptor, Triceratops
   - Sends 40 voice notes → T-rex, Dilophosaurus
   - Reacts, never replies → Stegosaurus, Pterodactyl
   - Muted it in 2019 → Mosasaurus, Brachiosaurus
4. **Someone cuts the queue. You…**
   - Say it loudly. Everyone hears. → T-rex, Dilophosaurus
   - Stare until they leave → Triceratops, Mosasaurus
   - Let it go. Life’s short. → Brachiosaurus, Stegosaurus
   - Somehow end up ahead of them → Velociraptor, Chicken
5. **Pick a superpower.**
   - Flying → Pterodactyl, Chicken
   - Being completely unbothered → Stegosaurus, Mosasaurus
   - Main-character energy → T-rex, Spinosaurus
   - Reading the room → Velociraptor, Triceratops
6. **The rest of today is…**
   - Chaos → Dilophosaurus, Velociraptor
   - A nap → Brachiosaurus, Stegosaurus
   - A chance to show off → Spinosaurus, T-rex
   - Something to survive → Chicken, Triceratops

## Flow (v0 board)
1. Intro: "Which dino / are you?", one line, START. Desktop shows a fan of three face-down cards.
2. Questions: one per screen, 4 answer tiles (2×2 desktop, stacked phone), tap to advance, 6 progress pips, Back.
3. Reveal: the poof (8 grey squares burst out, 450ms), then the card grows in (380ms, 260ms delay), text fades in (300ms, 520ms delay).
4. Result: tiltable card (max 12°, foil layer moves with tilt), "You’re a …", one-liner, SHARE, DOWNLOAD PNG, COPY LINK, "Collect all 10" row, RETAKE.

## Motion rules (carry over)
- Animate transform and opacity only; real asymmetric curves (cubic-bezier(0.2,0,0,1)); no ease-in on UI; press = scale(0.97) ~150ms; no bounce.
- Every duration in one TIMING object.
- Reduced motion: no tilt, static foil, 150ms fades, no poof.

## Open for the free-style pass
- Brand: name (working: "Which Dino?"), logo, palette. Not the portfolio’s blue and ink.
- Pack-opening reveal instead of the poof: the pack shakes, tears, card flips with a foil flash.
- Full-screen colour per result.
- A collection binder: ten slots, unfound ones as silhouettes.
- Optional sound, off by default.
- Final pixel art for all ten.

## Later, only if people play
Printed holo cards (ties to Postcarrd), sticker packs, a "team deck" for offsites.
