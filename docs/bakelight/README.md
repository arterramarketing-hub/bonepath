# Baked light: an experiment, not yet in the game

`index.html` is untouched: `tools/bakelight/` loads the real game and
injects the bake through `window.BP`.

## The sheets

Each is OFF | baked occlusion | occlusion + key-light shadow: one frozen
frame, the game's own 216 lines. `sheet_a-cathedral`, `b-nave`, `g-door`,
`c-graves`, `d-wood` at noon, dusk and night; `e-path-hollow`,
`e-path-ruins`, `f-ravine`, `f-ravine-rim` at noon.

## What was built

1. **Sky occlusion per vertex.** The static world is drawn depth-only from
   16 directions; each vertex asks each map whether it sees that sky. It
   rides in a 2-byte attribute (`aBake`) and scales only the hemisphere and
   the moon/sun. A plain vertex colour was tried first and was wrong: it
   dimmed the lanterns' pools too.
2. **A darkened foot** on anything standing in the soil.
3. **Contact shade in the ground's paint sheet (`GP`).** The ground's grid
   is 1.5–2 m: no vertex can shade round a headstone. Three straight-down
   depth maps give each footprint, blurred into the sheet (15 cm a texel).
4. **Key-light shadow**, one 2048 map.

## What it buys

- The nave: the stone falls dark under its roof, so windows and lantern
  pools carry the room, and the doorway is a dark mouth from outside. The
  clear win.
- Graves, trunks, walls: a dark foot and a blocky patch on the soil. Small.
- Open field, wood, path, ravine: very little. Open ground sees the sky.
- The baked shadow: nothing at noon; at dusk it lands on a ground too
  coarse to draw it.

## What it costs (software GL here; phone not measured)

| | vertices | renders + readbacks | time here | bytes |
|---|---|---|---|---|
| field, whole | 152,946 | 16 @1024² | 1.1–1.6 s | 306 KB |
| cathedral alone | 97,450 | 16 @512² | 1.3 s | 195 KB |
| an ordinary path tile | 16,443 | 16 @512² | 0.34 s | 33 KB |
| the Mire | 51,551 | 16 @1024² | 1.0 s | 103 KB |
| paint sheet | — | 3 @1024² | 0.26–0.39 s | 0 |

Most of the time is `readPixels`, software GL's worst case; a phone should
be a few tenths of a second, unmeasured. Draw calls on the same frame:
unchanged in all four modes (516, 466, 451, 232). Shader programs: +7 or
+8 (25 → 33). Twenty seconds of walking with an hour turned, rain brought
on and folds unbaked: no page errors.

## Risks

- A fold shares its material with unfolded things, so each baked material
  needs a twin, and whatever writes a world material (`syncLeaves`,
  `applyRoadSurface`, a flash) must write the twin too.
- `unbake()` hands back the original unshaded: a marked stone pops brighter.
- `applyGroundSurface` and `movePaint` wipe the paint sheet: the feet must
  be repainted there. Roads do not read the sheet.
- `bakeStatic` also folds the horse, the grille and the winch wheel, which
  move: the bake must be asked for, never automatic.
- `G.naveDim` already dims the nave: the stone would be dimmed twice.
  On the path most scenery is unfolded and would get nothing.
- Not looked at: the castle, snow, fog, summer leaves, a real phone.

## Recommendation

**Occlusion only, where it shows: the cathedral's fold and the paint-sheet
feet. No baked shadow** (re-baked at every `turnDay`, and it cannot
cross-fade with `xfSet`).

If approved:

- a `skyCut(mat)` beside `psx()`, and a cached `bakedMat(m)` twin;
- `bakeStatic(root,rec,light)` writes `aBake` when asked, from
  `buildCathedral` (the `cath.userData.bake` line);
- `bakeLight()` after `bakeWorld()` in `buildWorld`; on the path a third
  step in `stepTile`, one direction a frame;
- `footPaint()` after it, and again from `applyGroundSurface` and
  `movePaint`.

Run: `cd tools/bakelight && node shots.js && node sheets.js && node measure.js`.
