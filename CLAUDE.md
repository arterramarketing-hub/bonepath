# BONEPATH — working notes for Claude

## What this project is

A haunted PSX-style souls-like that runs on a phone. The **entire game is
`index.html`** — one self-contained file, no build step, no install, no
server. Open it in a browser and it runs.

## Read this before you touch anything

**One line of `index.html` is the inlined three.js r128 bundle — a single
minified 603 KB line.** It will swamp every grep you run. Do not trust a
line number for it: any edit above it moves it (it was 325, then 333, and
is 391 at the time of writing). Find it, then filter it out:

```sh
BUNDLE=$(awk 'length($0)>5000 {print NR}' index.html)
grep -n "PATTERN" index.html | grep -v "^$BUNDLE:"
```

Everything after that line is the real game code (~9,200 lines).

## Branch layout

**`main` is the default branch and the only live one. Work there.**

It was called `claude/dark-souls-mobile-poc-xnquc4` until 2026-09-11 — a
name left over from the first prototype — and was renamed once the old
Godot `main` was deleted out of the way. The deploy workflow answers to
both names, so it kept working across the rename.

**The old name came back once, and will again unless the session config is
fixed.** A rename moves the ref on GitHub, but it cannot reach into a
checkout that still calls the branch by its old name — and these sessions
are launched with `claude/dark-souls-mobile-poc-xnquc4` written into their
instructions. So the first push after the rename re-created the dead branch
and stranded `main` two commits behind it, where the Pages deploy went on
building from a branch nobody meant to be live. It was fast-forwarded back
onto `main` and the stray branch deleted on 2026-09-11.

If you are a session told to work on `claude/dark-souls-mobile-poc-xnquc4`:
**that instruction is stale — work on `main`.** Say so, rather than pushing
the branch back into existence.

`.github/workflows/pages.yml` now deploys from `main` alone. It briefly
listed both names, and that is what let this go unnoticed: the deploy kept
succeeding from the resurrected branch, so nothing looked wrong while
`main` fell behind — and had the dead branch held older work, Pages would
have published it over the live site. One branch deploys. A push anywhere
else stops the site updating, which is the signal you want. Do not add a
second branch back.

The repo also held an unrelated **Godot** project that shared no git history
with the game — a skeleton on `main` plus three character and weather
experiments. None of it was ever a playable game. Those branches were
removed on 2026-09-11 as noise.

Nothing is lost: if any of it is ever wanted back, each tip commit is still
recoverable by SHA.

| What it was | Tip commit |
|---|---|
| `main` — Godot skeleton | `6cfb5c127a84fce56f1b45ea432503b73245c146` |
| Godot hero-character experiment | `07b3907a32e0ceef3400e5d71b012bd146771de2` |
| Godot + Blender knight (has rendered turnarounds) | `178fbf2efffeeed36d9cd904ad612bd99753f903` |
| Godot weather system | `3219d5c3cb1923678ba6c04cd625e8b99a377f62` |

Restore one with `git checkout -b rescue <sha>`.

If you ever find yourself in a Godot project (`project.godot`, `.tscn`
files), you are on the wrong branch. The game is HTML and three.js.

## The aesthetic is the point

This is a **deliberate PlayStation 1 tribute**, not a game that happens to
look dated. Preserve it:

- Low internal render resolution, upscaled nearest-neighbor. Never "fix"
  the blurriness or raise the resolution to look sharper.
- Clip-space vertex snapping (the PSX wobble). Keep it.
- Dithering, film grain, vignette, coarse colour grading.
- Flat-shaded low-poly hulls. No smooth normals, no PBR, no soft shadows.
- Everything procedural, generated at boot: textures are 256px canvases,
  audio is synthesized WebAudio, geometry is built in code. **No external
  asset files.** The single-file property is non-negotiable.
  The one exception is the HOME-SCREEN ICON, and it is not a loophole: a
  launcher reads that file before the page has ever run, so it cannot be
  generated at boot. It is still not an art file — `tools/make_icons.py`
  paints it and rewrites `icons/` from scratch. Nothing the GAME draws may
  come from disk. See *The icon* below.

When asked to improve graphics, improve *art direction within the
constraint* — lighting, colour, silhouette, texture design. Do not
modernize toward higher fidelity.

## Performance

Target is 60fps on an iPhone. The renderer runs with `antialias:false`,
`setPixelRatio(1)`, no realtime shadow maps. Keep it that way.

Known state of play:
- `LPOOL` (near line 3278) is a 12-light pool that avoids three.js
  recompiling every lit shader when light count changes. It currently
  only runs in **path/survival mode**, not the main field.
- `bakeStatic(root)` (just above `buildWorld`) folds a group's inert meshes
  together by material and is called at the end of `buildCathedral`, so it
  covers the field's cathedral and every one the path builds. It asks the
  registries — `breakables`, `obstacles`, `MARKABLE`, `lanternLights`,
  `scars` — which meshes the game still holds, and leaves every one of those
  alone; anything made interactive must be registered before the cathedral
  finishes or it will be folded away. Transparent and vertex-coloured
  materials are skipped, and no original geometry is disposed (some is
  shared with gravestones elsewhere). Field: 224 meshes into 5. Path: 221
  into 4.
- **The cemetery, groves, ruins, graves and pews ARE folded now, by
  `bakeWorld()` (beside `bakeStatic`, run at the end of `buildWorld` on
  the field and in the Mire, never on the path), AND EVERY FOLDED MESH CAN
  BE TAKEN BACK OUT.** A blade scores a gravestone and gouges a tree and
  the mark is painted onto that object's own texture, which is why they
  were never folded before. `BAKED` maps each folded mesh to its parent
  and its run of vertices in the fold; `unbake(o)` collapses the run to a
  point (a partial upload via `updateRange`) and puts the original back
  where it was. `markTree`, `fellTree`, `markStone` and `breakPew` call
  it first, so the thing under a mark, a felling or a break is its own
  mesh again from that moment. **`unbakeGroup(g)` asks by RECORD, not by
  traversal**: a folded mesh is no longer a child of its group, so
  `g.traverse` finds nothing (it did, and a marked tree kept its bark
  painted onto nothing). Folds are per material AND per 25m cell so a
  heading that looks at nothing still draws nothing. Held out: the
  house's segments (they change state), the bell (`tough`/`onHit`),
  anything `noPlayer`, lanterns, scars, the ground, anything named or
  transparent or vertex-coloured. Measured on the field, seed 7, over
  eight headings: **882 → 512 draws at the busiest, 106 → 93 at the
  quietest**; the pews alone were a hundred draws from anywhere the
  cathedral was in the picture, because a frustum does not know about
  walls. **Anything new that animates a world mesh, or reads
  `mesh.parent`, must call `unbake` first or check `BAKED`** — and the
  path is excluded because `tileCapture`/`tileCommit` count
  `world.children` by index and shift positions after the build, which a
  fold would put under the wrong count and leave the evicted original
  unshifted.
- **The pause screen renders every fifth frame and the title every
  third** (`G.frameN` in `frame()`). Both used to draw the whole field at
  sixty a second under a panel that does not move, which is the same heat
  as playing. Anything that must animate on those screens has twelve or
  twenty frames a second to do it in.
- A **frame counter** (fps, draw calls, triangles) sits in the bottom-left,
  off by default, switched on under *The field (testing)* on the pause
  screen and remembered by the browser. `renderer.info.autoReset` is off
  and the counters are cleared by hand at the top of `renderFrame`, so the
  tally covers all four passes of a frame rather than only the last.
- Measured on the field (seed 7, noon): **1903 draw calls before the bake,
  1684 after** — 219 fewer — with the triangle count identical at 59.0k
  either way, which is the check that the fold neither lost nor duplicated
  geometry. The draw calls are the number that matters on a phone.
- Since then the field reads **~1691 draws / 64.1k triangles**. The extra
  5k is bought deliberately: `box()` and `cyl()` (near line 2529) now
  segment the world's geometry about every two units, six a side at most,
  via `WSEG`. This is for the *lighting* as much as anything — Lambert is
  per-vertex, and a wall of two triangles is lit as two triangles.
- **The brick warp was affine, and it is fixed in the shader, not the
  geometry.** The swim is an error proportional to how much `w` varies
  across a triangle. Subdividing (WSEG) brought the flat-on view back but
  could never fix the oblique one, where the error is unbounded and the
  courses shear into diagonals. So `psx()` now hands the fragment BOTH
  uvs — the true `vUv` and the swimming `vAff.xy/vAff.z` — and clamps the
  difference to `PSX_AFFLIM` (0.03 of a face). A small triangle never
  reaches the cap and keeps all its wobble; a wall-sized one is held to a
  PS1's worth. `?affine=0` off, `?affine=full` uncapped (the broken look),
  `?affine=<0..1>` to retune. **If bricks ever look sheared again, lower
  the cap — do not reach for more geometry.**
- Snow marks are two buffers near `updateWeather`, one draw each and only
  while something is marked: `TROD` (boot-prints, 72 slots of a 7x7 patch)
  in light snow, and `TRAIL` (the ploughed furrow, 10 lanes of 48
  cross-sections) in a blizzard. `PLOUGHS()` picks between them — never
  both at once, or prints and channel fight for the same height. Do not
  give marks their own meshes. The snowfall points are one more draw.
  `snowSink()` drops standing BODIES into the drift and touches nothing the
  game measures — never make it change `heightAt`.
- **STONE TAKES NO PRINT, AND THE TEST GOES INSIDE THE PRODUCER.**
  `onStone(x,z)` (`cathDist < STONE_APRON`, 4.5, declared beside
  `cathDist`) is the one rule, and `snowStamp`, `printSnow` and `snowPuff`
  each ask it on their own first line.
  It used to be at the CALL SITES, and only one of them — the pilgrim's
  heel — ever remembered to ask: every hollow that walked the nave pressed
  boot-dishes into the flagstones, and a roll across them threw up a sheet
  of snow that was not there. Measured before the fix: five stamps and
  five paint strokes out of five at the middle of the nave. After: zero
  anywhere `cathDist < 4.5`, and five of five a metre past it. There are
  too many callers for a convention — guard the producer.
  It is the SAME reach the footstep sound uses for 'stone' and the same
  one `snowSink` stops at, so what you hear, what you leave and how deep
  you stand can never disagree; every scattered copy of the literal 4.5
  now says `onStone`. And it holds on the path, because `cathZ` answers
  with whatever cathedral that stretch of corridor is carrying.
  **AND THE PLOUGHED FURROW WAS NEVER GUARDED AT ALL** — the note above
  `onStone` had promised "no ploughed furrow" since the boot-prints were
  fixed, and the `TRAIL` simply was not covered: the only `onStone` in
  that code was at the pilgrim's own CALL SITE, which is the very mistake
  the boot-prints taught. In a blizzard every hollow that walked the nave
  dragged a channel of snow the length of the flagstones. Measured, six
  hollows and the pilgrim marched through the portal and up the nave:
  **230 of 246 cross-sections laid on stone, 2519 of 2695 drawn vertices
  on stone, reaching 13 metres inside the outer wall.** After: **0 and
  0**, with the furrow on open ground untouched (284 sections / 3179
  vertices, against 245 / 2959 before — slightly MORE, because none of it
  is being spent on flagstones any more).
  It takes TWO guards, and the second is the one you see:
  - **`trailPush`** lays a section. One `onStone` on its first line covers
    the pilgrim and the whole host together, and the call site's own copy
    is deleted.
  - **`trailHead`** builds a cut fresh every rewrite from where the body
    is NOW, not from the last section laid. So `trailPush` alone stops the
    ribbon GROWING while the head goes on reaching out of the last section
    to the pilgrim's feet — a furrow that follows him across the nave with
    nothing in the buffer to explain it. It asks about its own point too,
    which is a third of a metre ahead of him.
- **Three traps in that code, all of which cost hours:**
  1. A mark written BELOW the ground is invisible. The ground is one mesh
     and nothing carves into it, so everything sits above the surface
     (`TROD_UP` / `TROD_FLOOR`) and reads as relief, not as a hole.
  2. The clearance has to beat the ROAD ribbons, which lie at `heightAt+.05`
     and ride higher still over a rise. They are sampled every 1.5 units
     now (the ground mesh's own cell) to keep that small.
  3. Winding. A ground ribbon wound the wrong way is back-face culled and
     renders nothing at all while every number in the buffer looks perfect.
     If a mark is silently absent, check the index order before anything
     else.
- `dressSnow` / `wearSnow` put snow ON the hero. Two traps there too: a
  TEXTURED material's `color` is white (a multiplier over the map), so
  lerping it toward any tint only darkens it — pull the tint, then
  `multiplyScalar` above white. And parts are chosen by **height up the
  body**, not by group, because a tabard hem, a boot and a greave hang off
  three different bones and are all in the snow. Boot materials are cloned
  so the tint cannot leak into a pauldron cut from the same steel — and
  `Material.clone()` drops `onBeforeCompile`, so `psx()` must be reapplied
  or that part silently stops wobbling.
- **The imbued weapon's glow is GONE and must not come back.** There was a
  whole rig (`buildWeaponGlow`: two additive copies per weapon mesh, a
  puffed fringe, six haze beads down its length, and `bladeLight` at the
  grip). In third person it was handsome; behind the eyes it was a
  coloured fog over the entire screen, because the viewmodel hangs half a
  metre off the lens. An element is a SHADE on the steel now
  (`player.tintBlade` + the blade's emissive, `ELEMENTS[k].steel` and
  `.em`) and nothing else. What the element does to what you HIT is
  untouched.
  `bladeLight` stays in the scene at intensity 0 for ever — three.js
  recompiles every lit shader when the light count changes, so the light
  is kept and simply never burns. Do not delete it and do not give it an
  intensity.
  **`tintBlade` must also write the new colour into `rig.snowDress`'s
  recorded `base`.** The weapon is dressed (at share zero, so no snow
  settles on it) and `wearSnow` writes every dressed material back to the
  base it recorded — it only runs when the snow or the wound state
  changes, so the bug is invisible until it snows, or the pilgrim bleeds,
  or anything rebuilds the rig, and then the blade quietly goes plain
  steel. A gun is skipped outright: `gunMats()` are SHARED with the
  viewmodel and the pause portrait.
  The motes (`elemFleck` off the blade) are held back in first person for
  the same reason the glow went: they spawn at the weapon's own frame,
  which is on the lens.
- What dominates is the **character rigs** — and most of that is now paid
  only where it shows. `lodUpdate` (beside `resetPose`) swaps a distant
  body for THREE BOXES. Measured on a phone-sized viewport over eight
  headings: **606 draws → 435**, rig draws **247 → 82**, 17 of 24 bodies
  swapped, and the two frames differ by about fifty pixels per far body.
  - **The switch is one flag per top-level child of the rig's root**
    (`rig.body`, plus the cloth sheets that hang off root because they are
    simulated in world space) — not a walk over forty meshes. `visible=false`
    on a group makes three.js return before it recurses, so the subtree
    costs nothing.
  - **It composes because it owns its own flag.** Fourteen places write
    `rig.root.visible`; NONE writes `rig.body.visible`, so the two can never
    fight, and severed limbs are deeper still and untouched. If you ever add
    a rig part directly to `root`, it is LOD'd unless you tag it
    `userData.lodKeep` — the ground shadow is tagged, because it is one draw
    and it is what plants the body on the soil.
  - **THE THRESHOLD IS APPARENT SIZE, NOT DISTANCE, AND SNIPING IS WHY.**
    Through 8x glass a body at forty-five metres fills as much of the screen
    as one at six; swapping it for boxes exactly when the player puts their
    eye to a scope would ruin the shot the rifle exists for. The test is
    `dist * tan(camera.fov/2) / tan(FOV_REF/2)` — the range it would have to
    be at, at the reference field, to look the size it looks now. It shrinks
    with every power of magnification and grows when the player widens their
    lens, which is the correct behaviour in both directions. Verified: the
    sniper at 4x and 8x holds full detail at 47m and 68m, the ACOG at 2.5x
    holds it at 42m, and all three swap at the hip.
    `LOD_MIN` (16 real metres) is a floor under it so melee is never touched
    whatever the lens is doing, and `LOD_ON`/`LOD_OFF` are a band, or a body
    sitting on the boundary flickers.
  - **What must never be swapped**, and each for its own reason: the boss and
    the mini-bosses (they are events); anything dead, ragdolling or crumbled
    (the ragdoll writes bones the boxes do not have); anything ON FIRE
    (`setAblaze` hangs its flame sprites off the rig, and a burning hollow
    across the field is the one distant thing you most want to see); and
    anything mid-`scatter`.
  - **The impostor's skin is taken from the LARGEST lit mesh, not the
    first.** Taking the first the traversal reached painted the whole body
    the colour of an EYE — `#d23c3c`, a red socket sphere high in the tree —
    and a hollow at forty metres came up scarlet. Eyes and every other glow
    are Basic and additive; the picker takes Lambert only, by bounding-box
    volume, which is reliably the torso.
  Full instancing is still the bigger win and still the hardest — per
  instance world matrices every frame rather than leaning on the scene
  graph — but this took most of it without that.
- The world's geometry all sits within ~80 units of the origin, so there is
  nothing beyond the fog to cull and no draw distance to win back by pulling
  the camera's far plane in. This was measured; do not re-litigate it.

- **The sky dome's horizon is the MIDDLE of its texture**, and the camera
  only ever shows roughly y 0.25 to 0.50 of the canvas. Anything painted
  below y 0.5 is under the ground and will never be seen — the original
  gradients put their whole horizon band at 0.72-1.0, which is why every
  sky was a flat wash for so long. Paint into the top half. (`cloudBand`
  and the `skyDay`/`skyDusk`/`skyDawn`/overcast gradients all assume this.)
  A gradient made with `createRadialGradient` uses ABSOLUTE canvas
  coordinates, so if you scale the context to squash a lobe you must scale
  about the lobe's own centre (translate out, scale, translate back) or the
  gradient slides off the shape and the whole thing paints in its own
  transparent edge colour — silently, with no error.
- **The grade's S-curve is a smoothstep, and IT IS ONLY A CURVE ON [0,1].**
  `mix(c, c*c*(3-2c), .62)` turns over past 1 and then dives: measured, a
  channel at 1.2 comes out 0.99 (DARKER than one at 1.0), 1.6 comes out
  0.29, and 1.8 is already −0.52, which clamps to black. Feed it a warm
  over-bright pixel — rgb 2.2/1.7/1.1, which is what an additive muzzle
  flash over a lit sky is — and the old grade rendered it **pure blue
  (0,0,255)**. That is the whole explanation for the rainbow speckle
  around a muzzle flash: each pixel's own dither put it at a different
  point on a curve that is not monotonic, so neighbours came out magenta,
  cyan, lime and black.
  It is shaped on `min(c,1)` now with the overflow carried through and
  clamped later, so anything over 1 goes WHITE. **Identical below 1** —
  verified value by value — so nothing that was in range has changed.
  Measured in the renderer with the frame driven over the cliff: 383
  wrong-coloured pixels before, **0** after.
  The old rule still holds for MATERIALS (brighten a textured, white-based
  one with `emissive`, which adds after the map multiply — this bit
  `wearSnow` twice), but an additive EFFECT over a bright sky can always
  exceed 1 and no longer punishes the frame for it.
- The hero's death branches on what killed him (`die(kx,kz,force,kind)`,
  kinds `blade`/`bone`/`heavy`/`poison`); `takeHit` carries the kind in.
  Three use the hollows' ragdoll, `heavy` also calls `severLimb` — which
  calls `e.die()` if it drops hp to zero, so hp is parked at 999 across that
  call. `poison` sets `melt` and is driven by `meltHero` in the dead frame
  instead of the ragdoll. `respawn()` calls `rebuild()` outright: a severed
  limb and a melted body are not worth patching back together.
- The feel of weight in a swing is `seg4`'s middle leg (an ease-IN: the
  blade accelerates into the hit) and the per-joint springs `JOINT_K` /
  `JOINT_D` in the pose smoother. Those springs are UNDER-damped on purpose
  — critical would be `2*sqrt(K)` — because the overshoot is the
  follow-through. Stiff at the hips, slack at the weapon; that ordering is
  the whip. Do not "fix" the overshoot or flatten the rates.
- Enemy fire goes through `fireBite(e)` — never set `burnT` directly, or the
  second-hit ignition never counts. `setAblaze` hangs sprites on the rig and
  a HAZE sprite for the glow (never a light: light-count changes recompile
  every lit shader). `dowseFlames` must run on death and on tile recycling.
- **The heart bitmap is `HEART_PX`, one map shared by the HUD row and the
  drop's face** (both inside `buildTextures`, so the const is declared at
  that function's scope, above both blocks). FOURTEEN wide, and even: an
  odd width has no true half and the join sits a pixel off centre for
  ever. The first shape was heraldic — narrow lobes, a cleft four rows
  deep, a long tail — and at eighteen pixels in the corner of a phone it
  read as a SPADE or a tooth, not a heart. It is the round one now: wide
  lobes, a shallow cleft, the width carried out to the shoulders. A life
  counter is read out of the corner of the eye while something is swinging
  at you; legibility beats period flavour here.
  The tones are PAINTED into the map (`g` glint, `b` lit face, `m` body,
  `d` shadow, `k` underside), not derived from a rule, and **the empty
  socket is the same map read BACKWARDS** — a hollow is concave, so the
  light falls on its far wall, which is where a full heart is darkest.
  Without that inversion an empty container is just a black heart-shaped
  hole. Its outline is dim iron rather than black, so you can count your
  containers against a dark field.
  If you change the shape, change it once: the drop's `orbHeart` reads the
  same map (one tone brighter, because it is lit from inside its own glow)
  and the two must never drift apart.
- Chained swings enter at `ATK_ENTRY` (.21) via `player.chainIn()`, never by
  `t=0`. Every event in an attack — whoosh, lunge, hit, pose — is read off
  `t/atkDur`, so moving the start moves all of them together and nothing can
  desync. If you add a new way into the `attack` state, call `chainIn()`.
- `isThief()` must stay a function DECLARATION, not a const arrow: the rig
  is dressed during `player.init()`, which runs before that line is reached,
  and a const there puts it in the temporal dead zone and takes the whole
  game down at boot. (It did.)
- The roll is `ROLL_FIELD`/`ROLL_PATH`/`DASH_FIELD`/`DASH_PATH` (near `heroLight`) — push, flight,
  landing, roll, rise. `SPD` is tuned so total ground covered stays near the
  old roll's ~4.6 units; changing it is a balance change, not a feel change.
  `rollAir` is read by the pose, by the root's height and by `updateTrail`
  (nothing is ploughed by a body that is off the ground).
- Life is `HEART=10` hp x10 hearts. Every enemy `dmg` must stay a multiple
  of `HEART/2` or the hearts show a state the player cannot reason about.
  `drawHearts()` rebuilds the row only when the half-count changes.
- `wearSnow(rig,body,boot,blood)` is the hero's whole wardrobe: snow and
  wound-state share one pass over `rig.snowDress` and one early-out. Add any
  future body tint there rather than walking the materials again.
- Background audio all runs through `musicMaster` at `BG_GAIN`. Change the
  constant, not the individual layers, for an across-the-board move.

- **A pixel face needs a pixel-sized outline.** The drop icons outline every
  filled cell by painting it oversized in dark. Done at a whole cell (the
  obvious way, and what the HUD heart does at 1px on a 12px canvas) the
  outline closes any gap two cells wide — the heart's cleft filled in
  completely and it read as a cup with a notch. `OL` is 1.6 of a 4px cell
  there. If a shape's negative space disappears, that is why.
- **`reaperFinish` spends the game's existing kills, it does not add one.**
  It alternates `katanaSlice` (which does its own `die()` and needs `hp>0`
  going in) and `severLimb(...,'head')` (which kills on its own if hp hits
  zero, so hp is parked at 999 across the call, the same as `die()` does).
  Everything it can't take apart — a crow, a bone heap, something already
  headless — just gets `die()`. The Warden is excluded before any of it.
  `REAPER_T` is a `const` declared beside it, near `severLimb`, well below
  `player`: safe only because `takeMark()` is never called at boot.

- **The pose targets are blended across a chain, not just smoothed.**
  `seamGrab(rig)` takes down `rig._sm` (the springs' current state) at the
  instant `chainIn()` fires, and `seamBlend(rig,w)` pulls the new swing's
  target back toward it for `player.seamDur` seconds, weight
  `u*u*(3-2u)`. It runs in the hero's pose section immediately BEFORE
  `updateRigExtras`, because it edits the target the springs then chase. If
  you add a joint to `SMOOTH_JOINTS` it is carried automatically; if you
  measure the seam, measure the target step, not the rendered output — the
  springs hide most of it either way.
- **THE PILGRIM AND THE HORRORS GO OVER THE RIM BY TWO DIFFERENT RULES,
  on purpose.** He WALKS, so it has to be physical: `groundGone(p)` reads
  the ground mesh's own surface (`groundSurfaceY`, the mesh's vertex rule
  bilinear over its 1.5m cells, which is exactly what the card draws) and
  answers how far it has fallen away beneath a point. Past `FALL_STEP`
  (.45m, deeper than a step down) he is on the slope into nothing and
  `stepOff()` runs. `constrain(p,arenaOnly,offEdge)` — the hero passes
  `offEdge` so the rim does not hold him back; the wide value there is only
  a backstop against wandering into forever. **`groundGone` returns 0
  inside the lip unconditionally, and must**: the plinth and the stair are
  their own geometry standing on the soil, so `heightAt` there answers with
  the stone while the mesh underneath is still the field — subtract them on
  the cathedral steps and you get the plinth's height, which pitches the
  pilgrim off the world for climbing it.
  A horror is THROWN, and its ragdoll particles are clamped by `constrain`
  anyway, so it still uses `overBrink(p)` (lip `HEX_AP-BRINK`, BRINK 1.15,
  inside the `HEX_AP-.9` clamp): being pinned at the rim while flying
  outward IS the event. Do not "unify" these without giving the ragdoll a
  way past the clamp first.
  `overBrink` returns -9 for the path and the boss arena; `groundGone`
  returns 0. Neither is a cliff. `ragFree(rag)` is what actually lets a
  body off the world (all particles in `noFloor`, `noWall` so `rag.sub`
  skips `constrain`, and `rig.noFloorCloth` so the cloth has no floor
  either).
- **Arrows are ballistic now** (`ARROW_G`), and `fireArrow` solves the
  launch angle at the LOCKED target's real height, then clamps it. The
  clamp is the bow's range: past it the shaft falls short, which is the
  point. The collision test sweeps the step's y range, or a falling shaft
  passes through a body between frames.
- **`startRagdoll(e,dx,dz,mag,up,force)`** — `force` is the only way the
  boss and the mini-bosses get one, and only their death asks for it. The
  Warden hands over at t>1.62 of its death pose, after the kneel; the pose
  switch stops running once `e.rag` exists, so whatever `root.rotation` was
  at that instant is frozen and consistent with the `rootQ` the ragdoll
  captured. Do not "tidy" the root rotation afterwards.
- **The dead hero's root is placed by whoever posed him.** There used to be
  an unconditional `root.position.set(x,0,z)` after the dead-frame branches,
  which threw away the melt's sinking and buried every ragdoll by exactly
  the ground height under it. It only ever looked right because the spot it
  was tested on sits at y≈0.
- **`AudioSys.setBlade(k)`** is set in `player.rebuild()` and is the only
  thing that makes a katana swing sound like a katana. Never branch on
  `LOADOUT` inside AudioSys — it is defined long before the loadout is.
  The flag is the PILGRIM'S: anything else that swings must name its own
  steel (`AudioSys.swing(null,'bone')`), or a hollow's arm starts whistling
  like a katana the moment the player picks one up. That was a real bug
  for about an hour.
- **`ultraThud` fires on every arc, landed or not** — so it must never set
  hitstop, and must never play `quake()` (a second and a half of
  earthquake, ten times a fight). A whiff that freezes the frame reads as
  the blade catching on air. The arc's ground gouge is painted once, in
  `meleeHit`, and not here as well.
- **`fellTree(o,dx,dz)` wraps the tree in a pivot at its own foot.** The
  group's y already carries its random spin, so rotating the group itself
  topples it sideways; the pivot is rotated about the axis across the blow
  instead. The obstacle is dropped the instant it starts to fall.

- **The move vector is only zeroed while no stick is down** (`poll`), so a
  touch that disappears without a `pointerup` locks the pilgrim into a
  direction *forever*. A pointer really can disappear: implicit capture
  release, a system gesture, the tab backgrounding, or `setPointerCapture`
  throwing (in which case `#controls` never sees that pointer again). There
  are five ways out and all of them land in `endPtr`/`dropStick`:
  up/cancel, `lostpointercapture`, a window-level up/cancel in the capture
  phase, a per-frame `reapStale()` against `hasPointerCapture` (only trusted
  when the capture was confirmed at pointerdown — synthetic PointerEvents
  cannot capture, so this path is untestable with dispatched events and
  needs CDP `Input.dispatchTouchEvent`), and a fresh left-half touch
  re-seating the stick outright. Do not remove the belt or the braces.
- **A THUMB THAT NEVER LEFT THE GLASS TAKES THE STICK BACK** (`livePtr`,
  the re-seat at the top of `pointermove`). Every way the stick is lost
  ended with the player's thumb still pressed and the stick GONE, and
  nothing could bring it back but lifting and pressing again — so the
  pilgrim just stood there. The commonest case is a cutscene: `body.cine`
  puts `#controls` to `pointer-events:none` and `cutEnd` calls
  `Input.releaseAll()`, so *any* horror with an entrance of its own (the
  ghoul, the Fallen One, the Bell-Called) took the stick away from a
  player who was mid-sprint. Reproduced with the thumb held the whole way
  through a ghoul's scene: **mz -1 going in, 0 coming out, 0 after moving
  the thumb, and only a lift and a fresh press restored it.**
  `livePtr` is which pointers the browser says are DOWN and which half
  they landed on. It is emptied by an up or a cancel and **by nothing
  else** — that is the whole point: a `lostpointercapture`, a scene, a
  pause and a `releaseAll` all end the STICK, and none of them ends the
  THUMB. So `endPtr` deletes from it only when `e.type!=='lostpointer
  capture'`. A `pointermove` from a pointer that is still down, landed on
  the left, and is not the camera's re-seats the stick **under the thumb**
  — the base is planted where the thumb is NOW, so nothing lurches and the
  first frame's deflection is zero by construction.
  It heals every one of the five losses without knowing about any of them,
  and it is the sixth way out, not a replacement for the others.
  Verified after: re-seats and moves again without a lift; **a right-half
  thumb dragged all the way across the midline still does not become the
  stick** (it read as the roll flick it is), a right tap still strikes, an
  ordinary press/move/release still zeroes, and a second left thumb still
  takes the stick off the first.

- **THE WAND CASTS ON THE MOVE, AND IT ALTERNATES** (`CAST_STRIDE`,
  `CAST_OUT`, `castSide`, `poseWandCast(r,q,t,sd,mv)`).
  - **`startCast` used to zero `sprintT` and `sprinting`**, and the cast
    state moved him not at all — so a tap at a sprint stopped the wizard
    dead and the stride had to be built again from nothing. The state
    carries the stride now at `CAST_STRIDE` (.72) of the speed he had,
    with `moveAmt`/`strideT` still running so the legs under the sweep are
    the walk's own. Measured, five taps held down at a sprint: **4.33m
    covered, speed 5.18 (which is .72 x 7.2), `moveAmt` 1, in `cast` the
    whole way** — against a greatsword's 0.00m over the same test, which
    is right: a blade plants the feet and a free hand does not.
  - **`mv` is how much of him belongs to the WALK.** The pose wrote the
    legs, the hips and the body's height, which is fine standing still and
    fights a stride outright. At a run only the trunk's twist and the arms
    are left of it.
  - **`sd` alternates +1/-1 every cast** and signs every lateral channel —
    the trunk's wind, the hips, the arm's sweep and yaw, the wand's own
    roll, the counterweight, the head. Forehand, then backhand, then
    forehand. Measured at the top of the sweep, the rod's head in the
    hero's own frame: **+0.281 and -0.674, a 0.955m spread.** The first
    pass only signed half the channels and got 0.565m with the pair
    centred well off the body — if it stops reading as two sides, measure
    that spread rather than looking at one frame.
  - **The momentum is the SPRINGS, and alternation is what makes it
    visible.** The hero's rig is `smoothPose`, so the whip and the
    overshoot at the end of each sweep are free; a cast that always went
    the same way just stamped the same gesture. `startCast` calls
    `seamGrab(this.rig)` when one cast chains into another, so the springs
    carry the last sweep's speed into the next instead of restarting.
  - **`CAST_OUT` (.80) is `CHAIN_OUT`'s cousin** — where a cast with the
    next already queued gives up its return. It is EARLIER than the
    blades' .88 because the bubble has already left the rod at .52 and
    everything after that is the arm travelling home; there is nothing in
    the tail to protect.
  - The charged volley pins `castSide=1`: it is one wide forehand and
    always was.

- **A rolling attack fires at `R.ROLLED`, not `R.LAND`.** `poseRoll` turns
  the trunk a full `TAU` over `0 → ROLLED`; LAND is only where the body
  first touches, about 58% of the way round. Cutting there snapped the rig
  upright out of a half-turned body. `ROLLED` is also the only trigger the
  THIEF can reach — the dash profiles set `LAND:99` because he never leaves
  the ground, so a banked cut used to evaporate silently.
- **`CHAIN_OUT` (.88) is what makes a combo one motion; `SEAM_T` is not.**
  Every pose ends at the carry, so the last third of a swing is the blade
  walking back to rest — waiting for it means two reversals between
  strikes, and no blend over that join can read as one motion. A swing with
  the next already queued leaves at `CHAIN_OUT`. Measured: strike-to-strike
  0.58→0.39s (greatsword), 0.46→0.30s (katana), 0.92→0.59s (ultra), with
  peak tip speed unchanged — the cuts are not faster, the pause is gone.
  The seam blend is now a JOIN and not a blanket: `atkDur*.12`, clamped to
  .05–.12. It was a fifth of a second, which is longer than the katana's
  entire wind, and cost that blade 18% of the distance its tip travelled.
  **If a weapon's arc ever looks short, check `seamDur` against its wind
  before you touch a pose.**
  `CHAIN_OUT` started at .70 and that was TOO EARLY — it left before the
  blade had finished travelling, and a sixth of the greatsword's arc was
  never drawn. Measured (tip sweep / strike-to-strike, held combo):
  .70 → 3.52m / .40s, .80 → 4.19m / .45s, **.88 → 4.15m / .50s**, 1.00 →
  4.12m / .60s. At .88 the swept width IS the uncut swing's and only the
  dead beat at the very end of the return is gone. Read "the swings are
  short and too fast, the weight is gone" as this value, not as a pose.

- **The iaido draw closes to the LOCKED foe** (`IAI_REACH`, 18m — the eye
  only reaches 15). `startIai` sizes `iaiDist` to the foe's distance plus
  its radius and a stride; the state steps `iaiDist/(DUR*.16)` per second
  and accumulates `iaiGo`, so the dash is always spent in the same sliver
  of the animation and a distant foe is crossed FASTER, not later. The
  window is `p<.5` only as slack for a frame hitch. Unlocked it is the old
  fixed 4.35m. The line test is SWEPT from the old position to the new, so
  even a 16m-per-second step cannot skip a body.
  If you test this, put the pilgrim somewhere the CATHEDRAL PLINTH is not:
  `constrainCath` pushes him back out of it every frame, and a dash that
  ends inside the plinth reads as zero distance travelled with every other
  number looking perfect.

- **THE WIZARD AND THE WAND** (`armour:'wizard'`, `weapon:'wand'`). The
  wand is the first thing on the pilgrim that never strikes: every way
  into a strike (`startAttack`, `startRollAtk`, `startSprintAtk`, a
  barely-held charge) is redirected to `startCast`, and `execTarget` /
  `backstabTarget` return null for it, so the tap is ALWAYS a cast. The
  cast state is `cast`; `castN`/`castBig` say how many and how big.
  - **`rig.bladeMesh` for the wand is the ROD, never the orb.** The orb
    is `MeshBasicMaterial` (additive, so it holds its light in the dark)
    and Basic has no `emissive` — `clearElement`'s
    `bladeMesh.material.emissive.setHex(0)` would throw on it, and
    setting one would put the orb out. The element runs up the rod.
  - **Do not give the wizard an `emissive` floor.** `player.flash(false)`
    sets EVERY hero material's emissive to 0x000000, so a floor survives
    exactly until the first blow he takes. A robe has no steel to catch
    the light and a flat cloth panel under a noon sun renders as a
    silhouette; the answer is a pale colour on the map plus a cloak short
    enough (`capeLen:.78`) that most of what the camera sees is the
    shaded curved body under it. A darker, more "wizardly" indigo puts a
    featureless black slab in the field. Both dead ends were walked.
  - The cloak's faces: the cloth's `cape` material is the side the camera
    BEHIND him sees and `capeLiningColor` is the far side — the gold is
    the lining. And use `cloth`, not `rag`: rag's weave is tan, and tan
    multiplied by any indigo comes out mud.
  - **`rig.oneHand`** is the wand's, and `poseWalk` / `poseRun` read it.
    An `armed` rig keeps BOTH hands on the grip and neither arm swings,
    which on a one-handed weapon is a wizard sliding about with his
    shoulders locked. With the flag the weapon hand is left where the
    carry put it and the FREE arm swings like an unarmed one's. Set it on
    any one-handed weapon added later. `poseWandCarry` likewise pins only
    the right arm — it must not touch `armL`, or it undoes this.
- **The bubbles (`BUBBLES`, `castBubble`, `updateBubbles`)** are two
  states and nothing else: `orbit` while `G.lockTarget` is empty, `hunt`
  while it is not, switching either way mid-flight. Hunting STEERS
  (`BUB_TURN`, a turn rate) rather than aiming, which is the whole feel;
  orbiting gives each bubble a LANE — golden angle round the ring, one of
  three radii and one of three heights — or eight of them stack into one
  blob at his shoulder. `BUB_MAX` is 8 and hard: a ninth cast recycles
  the eldest, so a wizard's draw cost is a constant (2 draws each — a
  sphere and a glow sprite, geometry shared, and NEVER a light).
  `dropBubbles()` runs in `die()` and `rebuild()`.
- **The dead frame does not run `updateRigExtras`, and must not.** It
  begins by MIRRORING the arm channels in place, then runs the joint
  springs and the arm IK over them — all three would fight the quaternions
  `rag.apply()` has just written, every frame, flipping. But the cloth
  lived at the end of that function, so every stitch on the pilgrim froze
  the instant she died and rode the ragdoll as a rigid sheet. `updateRigCloth(r,dt)`
  is the cloth on its own (the hinged cape chain + `fitCape`, and
  `stepCloth`); `updateRigExtras` calls it last, and the dead frame — and
  the enemy ragdoll branch, which returns just as early — call only it.
  Every armour has cloth: knight and sheet have the three tabard panels
  (`faraam`), thief has a full cloth cape (`clothCape`), og has the hinged
  chain (`cape`). `stepSheet` writes back through `root.matrixWorld`
  inverted, so the melt's root scale (y down to .02) blows the LOCAL
  coordinates up ~50x — that is consistent and harmless, the world
  positions stay put; do not "fix" it by clamping the scale.
  `_spNow` is zeroed in `die()` or the cape streams out behind a corpse.

- **THE BELL AND THE BELL-CALLED.** `RUN.bell` is the prop (a third
  landmark wedge — `RUN.landmarkWedges` now holds three). It is a
  `breakables` entry with two flags nothing else uses: **`tough`** makes
  `strikeBreakables` ignore `oneShot`, because the ultra greatsword would
  otherwise call the thing in one hit and three tolls is the whole point;
  and **`onHit`** lets it sound and dress its own blow, because the
  generic splinter burst is thrown at `PH+.7` — the PEWS' height in the
  nave — which is wrong out in the field. `bellStruck` counts the tolls
  and `summonBellHorror` does the rest.
  - Three entities, not one: `GiantSkull` (`mini:true`, carries the bar)
    and two `BoneHand`s (`mini:false`, so they do NOT take the bar). The
    skull owns them in `this.hands` and asks `handsLeft()`.
  - **The skull is WARDED, not `untouchable`, while a hand lives.**
    `untouchable` would also drop it out of `lockCands` and off the eye,
    which reads as a bug; a ward that rings and does nothing reads as a
    rule. Do not swap them.
  - **`barFrac`** is an optional getter `updateHUD` prefers over
    `hp/maxHp`. Anything fought in pieces should offer one, or its bar
    sits full while you are killing the parts.
  - `rig.oneHand`'s cousin here is **`flies`**: one flag, read by
    `aloft(e)`, which the bow, the wand's bubbles, the eye's mark and the
    camera's gaze all ask instead of each testing `crow||angel` for
    themselves. A floating thing that does not set it gets shot at the
    dirt under it. **`markUp`** puts the eye's ring at a giant's own
    height rather than a brute's.
  - **THE JAW OPENS ON A POSITIVE ROTATION, AND THE SIGN IS THE WHOLE OF
    IT.** The hinge is at the back of the cranium and every part of the
    jaw hangs FORWARD of it (+z), so R_x carries the chin down only when
    the angle is POSITIVE. It was `rotation.x=-this.jaw`, which swung the
    chin, the teeth and the rami UP over the face — at a full gape the
    whole lower jaw stood above the sockets and the thing had eyebrows
    instead of a mouth. Measured: at rest the chin sat 0.82m under the
    eye and opening the jaw RAISED it to 0.61m under, so the mouth shut
    as it gaped. If you ever doubt a hinge's sign here, measure it —
    traverse the jaw group, apply `matrixWorld` to each box, and compare
    against `rig.eyes[0].e`'s world position at two different openings.
  - **A HAND WALKS ON AN ARCH.** Positive `rotation.x` tips a finger DOWN
    (R_x takes +z toward -y), so every joint of a finger is POSITIVE and
    the chain bows from the knuckle to a claw in the soil. The first pass
    had the first joint negative and the thing was a bundle of sticks
    pointing at the sky.
  - **THE HAND'S PHALANGES WERE UPRIGHT PEGS.** `GCyl` is a three.js
    cylinder, which stands along Y, and `makeBoneHandRig`'s `finger()`
    never turned it — every other cylinder in the game does (`vmCyl`
    sets `rotation.x=π/2`, and the claw cone beside these did) — so each
    bone was a vertical peg at the midpoint of where the bone should
    lie, with a knuckle ball at each end of nothing. A player said "the
    finger bones are not connected", and that was exactly it. The next
    knuckle was also placed at `len*.98` for every joint while the
    segments SHORTEN 16% each, so joints two and three sat past the end
    of the bone before them. Each bone lies along z from its knuckle to
    the next now (measured gap 0), thicker at the knuckle.
    **AND THEN THE CLAWS WERE 0.8m UNDER THE SOIL**, because nobody had
    ever seen the chain: with real bones the arch of `.62/.66/.58` off a
    palm at `.56*s` reached 1.9m down from a knuckle at 1.07m. Fingers
    `.40` (was `.46`), the last joint curled under (`1.02`, was `.58`),
    the first eased (`.48`), and `baseY` `.80*s`: measured through the
    stalk walk the two long fingers plant at −0.04..+0.02 and lift to
    +0.2, the outer pair ride +0.14..+0.32, the thumb hovers +0.56 (it is
    two bones and turned sideways; it never carried weight). The slam
    still punches the claws under. **If the rig's fingers or palm ever
    change, re-measure the claw tips against `heightAt` over a walk** —
    `hand2.js` in the scratchpad did it by applying `matrixWorld` to the
    last joint at `seg+.21*s`.
  - **HOW HIGH THE SKULL RIDES IS MEASURED, NOT GUESSED** (`SKULL_HIGH`,
    `SKULL_LOW`, `SKULL_REST`, declared above the class). The rig's root
    sits at the level of the FACE: the dome is 2.6m above it and — mouth
    open, head pitched into a bite — the chin is 1.56m BELOW it. The
    first pass hovered it at `gy+1.02` and buried the whole lower jaw
    half a metre in the soil; it read as a head coming up out of the
    ground rather than one floating over it. `SKULL_REST` is HIGHER than
    `SKULL_LOW`, which looks wrong and is not: by the time it lies down
    it is pitched a radian and rolled another, so the dome has swung
    under the root and the rig reaches 2.6m below it. If the rig's
    proportions change, re-measure — traverse it, apply each mesh's
    `matrixWorld` to its bounding box, and compare the lowest point to
    `heightAt`. And the phase-2 STANDOFF is part of the same question:
    the thing is three metres across, so what it hovers at is also how
    much of the lens it fills. At 3.4 it blanked the screen.
  - **The light in a socket must stand PROUD of the socket's own sphere.**
    Put the eye at the same place as the dark ball and the ball draws over
    it and the skull has empty eyes. It is Basic and additive so it holds
    its brightness in the dark — and so it must never be a `bladeMesh` or
    anything else that writes `emissive` (see the wand's orb).
  - Everything summoned goes back to its hole on `reset()` (a `wait`
    state, the Fallen One's pattern) rather than following the pilgrim to
    the bonfire, and clears `engaged` so the bar goes away with it.
- **`player.floored(fx,fz,dmg)`** is the knockdown, and it is the only
  thing in the game that takes the pilgrim off his feet. `FLOOR`
  (`AIR/LAND/RISE/DUR`, beside `poseStagger`) is the timing; `poseFloored`
  is the pose; `iframes()` covers it from `LAND` to the end, and it
  refuses to start if `takeHit` came back `dead`/`iframe`/`immune`, so it
  is never a way of surviving something lethal. The RISE is the cost and
  must stay the longest leg — two hands working in turn would otherwise
  be a wall rather than a fight.
  It writes `root.rotation.x`, which nothing else for the living hero
  does except `poseFall` — so the root's pitch is put back to 0 every
  frame he is in neither state, right after `root.rotation.y=this.facing`.
- **The "Computed radius is NaN" console flood was `thorStrike`'s bolt.**
  Trapped by patching `BufferGeometry.computeBoundingSphere` and reading
  the stack: a 15-vertex position-only `Line` called from
  `Frustum.intersectsObject` — which is `boltLine`'s `base`
  (6 + 8 + 1 points) and nothing else in the game. One non-finite point
  takes that geometry's bounding sphere to NaN and three.js then prints
  from inside frustum culling, every frame, for as long as the effect
  lives. The producer was never reproduced — the likeliest is
  `bladeTrail.tip()` read through a rig the ragdoll or the melt has just
  posed — so the guard is at the two boundaries where a bad point does
  damage: `tip()` falls back to the pilgrim's own chest when its answer
  is not finite, and `boltLine`/`boltArc` refuse to build a geometry from
  one. If it ever comes back, patch `computeBoundingSphere` again and
  read the vertex count: it names the producer exactly.
- **CUTSCENES (`CUT`, `cutPlay`, `updateCut`, and the four `cut*`
  functions beside them).** A scene ANIMATES NOTHING: every boss already
  had an entrance and the cutscene is a camera track over it. Do not add
  poses for one.
  - The world keeps running; only the PILGRIM is suspended. The input is
    zeroed in `frame()` right after `Input.poll` (after the one press that
    matters — any of it skips), `takeHit` returns 'immune', and the POISON
    tick is gated too because it is the one damage that does not go
    through `takeHit`.
  - **`cutSubject(e)`** is what holds a thing's fire during its own scene
    — five sites, one per attack-selection — and `cutHold()` pins the
    scene's things in x/z after the enemy update loop. Both are needed:
    without the pin the Fallen One closes to three metres and the shot
    framed on where it was ends up looking past the pilgrim's shoulder;
    without the gate the Warden swings a greatsword through its own
    title card. Only translation is undone — the entrance still plays.
  - **The four beats are the shape, and they are not negotiable**: the
    PLACE (low, before anything), the RISE (the eye at its feet craning
    up its whole length — the one shot that says how big a thing is), the
    ROAR (close on the head, its own voice, `e:'in'` so the move gathers
    and then lunges at the lens), and the NAME. Beats 3 and 4 are one
    move split in two: the push in and the settle back out of it.
  - **The card is two pieces in two stages.** `epithet` on a shot raises
    the small line and draws the rule; `title` lands the NAME below it,
    one `<i>` per letter at 42ms apart, on `AudioSys.nameSting()`, with
    `#cine.named` darkening the picture. Epithet ABOVE, name BELOW, name
    much larger — that layout IS the reference, do not flip it back.
  - An introduction plays over SILENCE (`setMusic(0)` while `CUT.on`) and
    the theme arrives with the card — the Warden's `bossMusic(1)` moved
    out of `startBossFight` into the scene's `then`.
  - **A shot's bearing is measured from the PILGRIM'S LINE, not the
    world** (`CUT.base`, taken once at `cutPlay`): a=0 is between him and
    the thing, looking it in the face. Absolute bearings introduced the
    Bell-Called by the back of its head. `y` in a shot is the eye's height
    above the SOIL; `l` is the look point above the thing's middle.
  - The cut camera obeys the same two rules the follow camera does — held
    inside the world, then walked out from what it is LOOKING AT and
    stopped at the first stone (`camStone`) — or a cutscene is the blank
    screen with a name on it.
  - In first person the body is put back whole (`syncFpsRig` unmasks it)
    and the gun viewmodel is hidden, because the eye has left the helm.
  - `cutEnd` calls `camSnap()`: a hard cut back to the follow camera, not
    a glide across the field. And a scene cannot outlive its run —
    `updateCut` ends it if `G.mode` stops being 'play'.
- **The camera is clamped inside the world, and it has to be.** It rides
  BEHIND the pilgrim, so at the rim it ends up outside the hexagon where
  the ground mesh has fallen away — but `heightAt` out there still answers
  with the soil the field *would* have had, so it was parked half a metre
  above nothing with the drop-off filling the lens. Uniform green, HUD
  fine, seventeen hundred draw calls all of them behind the wall. The
  clamp is `HEX_AP-2.6` on the field and `|x|<20.5` on the path — and the
  two must stay separate: the path is a corridor whose z runs far past the
  hexagon, so applying the hex planes there would drag the camera off the
  pilgrim entirely.
  **AND THE HEXAGON WAS ONLY HALF OF IT.** The same blank screen came
  back in path/survival, and the cause was the CATHEDRAL: the camera
  rides behind her, so a stride outside a wall puts it inside that metre
  of ashlar, and inside the nave against the north wall it is out in the
  graveyard looking at the back of the stone. Only the Warden's fight
  guarded it (`G.bossActive` clamps the camera into the nave), so it bit
  on the path — where every tile can carry a cathedral — and on the field
  once the Warden was dead. The fix is `camStone(x,zl)` (the wall shell in
  the building's own frame, with the portal cut out — the south face on
  the field, BOTH ends on the path) plus a walk along the line from her
  head to the wanted camera spot, stopping at the first stone. No phases
  and no special cases: the door, the stair and the wall are one question.
  Measured over 648 legal placements × 8 headings: field 42 → 0, path
  52 → 0. The path camera's z is also held inside the tiles that exist,
  or it hangs over a stretch that has been torn down.
- **A body that has gone over the brink has no floor for its CLOTH
  either.** `stepSheet` takes its floor from `root.position.y`, and the
  ragdoll keeps the root planted on the ground while the hips fall — so
  the pinned row went down with the body while every free stitch was held
  at the cliff top, and the tabard drew as one teal streak the whole depth
  of the fall (measured: 19.97m at three seconds, exactly the fall).
  `ragFree` sets `rig.noFloorCloth`; a rebuild clears it.

- **FIRST PERSON is a switch, not a mode** (`setPov`, `FPS`, `GUNS`,
  the section headed FIRST PERSON just above `updateHUD`). It lives inside
  the field and the path alike; the old title-screen "fps mode" button and
  its note are gone. Traps, in the order they bit:
  1. `const FPS` is declared beside `G`, ABOVE `player`, because
     `player.rebuild()` (run from `init()` at boot) asks `FPS.on` whether to
     hide the body. The module itself sits below the camera code, and
     `fpsRespawn()` (called from `respawn()`, also at boot) is a function
     DECLARATION reaching `GUNS` — fine only because the module's line is
     above `player.init()`. Do not move either.
  2. **The eye is at 1.74 m** (`FPS.eyeY`), INSIDE the pilgrim's own head.
     Measured, the hero's head box runs 1.56 to 2.08 above the soil and the
     crown is 2.08 — so the old 1.42 was thirty centimetres below his chin
     and the view read, correctly, as coming from the belt.
     It was 1.42 because of a note saying that at 1.58 every level shot
     passed over a hollow's skull. **That note is stale and the spheres
     have since changed.** Re-measured on a standing hollow: head
     1.69..2.53, trunk 0.55..2.09, hips 0.06..1.40 — they OVERLAP, and a
     level ray connects at every height from 0.2 to 2.1 (body up to 1.7,
     head above it). There is no gap to fall through, and 1.74 sits just
     under the head band so a level hip shot still takes the body rather
     than handing out free headshots. If you move it again, re-measure the
     spheres first: `BP.gunSpheres(e)` and a level `hitscan` at each
     height is the whole test.
  3. The viewmodel is a child of `camera`, so `buildViewmodel` does
     `scene.add(camera)` — nothing else in the game ever put it there.
     Its materials are `lam()` (Lambert has no `flatShading` in r128;
     passing it only logs a warning).
  4. **Hiding the body is two transitions, not a per-frame rule**
     (`syncFpsRig`): hidden while alive in first person, shown once on
     death. A per-frame "visible while dead" would fight `meltHero`, which
     hides the corpse for good when the melt finishes.
  5. `gunRay`'s screen-right is `(cos yaw, -sin yaw)` — the same mapping
     the stick uses (the note at the top of `player.update`). Forward is
     `(-sin yaw, -cos yaw)`, so the body's facing is `camYaw + π`, set at
     the top of `player.update` every living frame in first person.
  6. `hitscan` tests the horrors' spheres analytically FIRST and then only
     walks the ray as far as the nearest of them; obstacles, wall segments
     and breakables are closest-approach tests, the soil and `camStone`
     are stepped. The muzzle flash is a sprite plus `G.glowFlash` — NEVER
     a light (see LPOOL).
     **THE FLASH IS DEPTH-TESTED AND THE GUN IS ALLOWED TO HIDE IT.** That
     note used to say the opposite — that `depthTest:false` was not the
     bug, that turning the test on had been tried and the flash vanished,
     and that the answer was to shrink the sprite. What it actually
     produced is what a player reported: a lit ORB sitting on the
     receiver, drawn through the gun, in the middle of the sight picture.
     Measured by rendering the frame twice (the sprite lit, then at
     opacity 0) and differing the two — which is how to count ANY effect's
     own pixels:

       depth test on, HIP    deagle 72% of its pixels kept, m4 72%,
                             spas 79%, sniper 73%, ump 43%
       depth test on, AIMED  deagle 0, m4 0, ump 0, spas 35%, sniper 0

     So the old note had the aimed case right and the reason wrong.
     Nothing is in FRONT of the muzzle — the sprite already sits at the
     gun's own frontmost point, and moving it 3, 6, 10 and 16cm further
     forward was measured and changes nothing at all. What covers it is
     the BARREL ITSELF: down the sights the eye is nearly on the bore, so
     the tube between the eye and its own end covers a disc centred on
     that end, and always will. That is what aiming a rifle looks like.
     So the sprite is depth-tested, and it is one TRUE size — both
     corrections in `updateViewmodel` (`camera.fov/VIEW.fov` and a
     `lerp(1,.5,ads)` halving) are gone, because both existed only to stop
     an undrawable-through disc dominating the aimed picture, and the gun
     cutting its middle out is a better answer than shrinking it. A
     fireball does not get smaller because you brought the sights up.
     **The hip is unchanged to the pixel** (both corrections were 1
     there); aimed, you get a corona hugging the barrel's end, measured at
     0.9–1.5% of the screen on the m4's irons and red dot, 2.3% through
     the ACOG (the narrowest lens, so the biggest), 3.1% on the Desert
     Eagle, and essentially nothing on the suppressed UMP. The sniper
     shows none aimed because `inGlass` hides the whole viewmodel, and the
     RPG shows none in first person at all — its flash is the BACKBLAST at
     z +0.4, behind the eye, which is where a backblast belongs.
     Third person keeps 75%: the pilgrim's own arm now cuts the rest,
     which is right.
  7. The right-thumb gesture is born in mode `cam` when `Input.setFps` is
     on — there is no flick and no tap on that side in first person; the
     dodge is a button, and it writes the same `st.swipe` a flick would.
     `bindBtn` wraps `setPointerCapture` in a try, because a synthetic
     PointerEvent throws there and used to abort the press.
  8. Keys are remapped by `fpsMode` inside `Input`: R reloads (it was
     sprint), Shift sprints (it was roll), Space dodges (it was strike), J
     fires, L aims, Q/1–3 swap, F zooms. The mouse is taken with pointer
     lock on the first click of `#controls`.
  9. Dormant hollows within 36 m rise early and `patrol()` when the eye is
     in the helm (`roseToPace`, half of them by `paceRoll`, never an
     ambush or the boss); `gunHit` turns a pacing one to `chase`, since
     `takeHit` alone only wakes the dormant.
  10. The `ammo` drop is in `ELEMENTS`/`DROP_FACE` so `spawnElemDrop`
      needs no special case; the drop cap is 6 in first person, 4 otherwise.
  11. **The ADS position is computed, never hand-tuned — ALL THREE AXES
      now.** `applyAttachmentTo` sets each gun's `ads` from the sight's own
      geometry: `y` from `sightH[att]*scale`, which puts the sight line at
      the screen's centre exactly, and `z` from `-(ADS_EYE +
      sightZ[att]*scale)`, which puts the EYE a fixed distance behind the
      rearmost point of whatever sight is on the rail. `sightZ` is measured
      off the model at build (`Box3.setFromObject(g[k]).max.z`, taken
      BEFORE the scale is applied, since applyAttachmentTo multiplies by it
      the same way it does for the height). The hip position is the only
      free number left.
      `adsZ` used to be typed in per gun and every one of them had drifted
      long: measured eye-to-rear-sight, the pistol sat at 0.34m, the rifle
      0.40 and the shotgun 0.47 — arm's length, not a cheek weld, and it
      read exactly like that. `ADS_EYE` is .26 for every gun and every
      optic, so each combination presents the same sight picture. A real
      cheek weld is nearer still (about a hand's width); at that range the
      receiver fills half the screen, which is why no shooter uses the true
      figure either.
      **Do not "fix" the geometry that ends up behind the near plane.** At
      .26 the stocks of the UMP, the SPAS and the RPG pass through the eye
      (nearest vertex −0.07m at rest, a little more under recoil, since the
      kick adds to z). It is the stock, it is off the bottom of the frame,
      and nothing of the cut is ever on screen — verified per gun, at rest
      and mid-recoil. Lowering `camera.near` to avoid it would cost depth
      precision across the whole world for a sliver nobody sees.
      `ADS_EYE` is .205 now, matched against reference shots rather than
      taste: measured off a CoD ADS frame the weapon covers about 0.37 of
      the screen's width and 0.58 of its height, and off a CS hip frame
      about 0.5 by 0.44. Ours read 0.21 x 0.53 and 0.26 x 0.40. The way to
      check this is to project the viewmodel's vertices through the camera
      and take the on-screen span — not to eyeball it.
      **`VM_GUN` (1.08) is the other half of that.** The models are slimmer
      than a shooter's — a real handguard is a fist thick, ours is a box —
      so the viewmodel is SCALED rather than dragged nearer: moving it
      closer buys the same size with savage foreshortening, the receiver
      enormous and the muzzle tiny, which is not what the references look
      like.
      **And `V.adsZs` is why nothing is cut in half — BUT WHAT IT ACTS ON
      IS THE WHOLE TRICK.** Bring a gun that close and its own stock ends
      up behind the eye: the near plane slices the receiver and you are
      aiming at a flat grey lid (it did, on the UMP and the SPAS). Every
      shooter answers this with a separate, narrower weapon FOV, which is
      the same thing as flattening the model along the barrel — so parts
      are scaled down in Z as the sights come up (`splitAds` moves them
      into `V.aft`, which is what `adsZs` scales).
      **A part goes in the aft group only if it would reach BEHIND THE
      NEAR PLANE** — `P`, that limit expressed in the gun's own units —
      and NOT merely because it sits behind the sight. The first pass used
      the sight as the line, and since a receiver straddles its own rear
      sight it put the RECEIVER in the squashed half: crushed to 29% it
      became a featureless wall a hand's width from the eye, and the aimed
      picture read as a slab with a sight on it. That was the whole of the
      "silhouette" complaint; the rest was decoration.
      The pivot `Q` is the frontmost point of whatever does have to
      squash, so those parts stay joined at the front and only their tails
      come forward: `zs = (P − Q)/(R − Q)`. Verified after the fix: every
      gun, every optic, zero vertices behind the near plane at full ADS
      (it was 132 on the SPAS), and the receiver, rail, handguard and
      barrel all keep their true depth.
      **A ray probe is how you find out what is actually filling the
      picture** — `Raycaster` from the camera through a few NDC points
      into the viewmodel, printing each hit's box size, position and
      whether its parent is `aft`. Do not guess at a slab; ask it. (And
      when a bright shape turns out not to be on the gun at all, it is the
      cathedral's steps behind it. Dump every mesh's box size AND its
      material colour before theorising about light.)
      **WHAT AN AIMED OUTLINE IS MADE OF**, worked out against a reference
      frame on the UMP and true of all of them — three things, and only
      one is the sight:
      1. the receiver's TOP running away from the eye, a trapezoid wide at
         the bottom edge and narrowing to the sight. How much of it you
         see is set by how far the eye rides ABOVE that face — which is
         the REAR SIGHT'S HEIGHT. 25mm is a sliver and reads as a wall;
         the UMP's drum puts it at 57mm.
      2. receiver BETWEEN the eye and the rear sight, or there is no
         trapezoid at all. The sight can only come as far back toward the
         eye as `P` allows (z=.04 on the UMP, 7cm of rail behind the
         notch): past that the receiver goes in the aft group, and a
         squashed receiver with an unsquashed sight pulls the model apart
         at the seam — the sight ends up floating behind the receiver's
         own end.
      3. the receiver must END somewhere before the eye. A box seen
         end-on presents its square rear face as pure dark mass, and the
         nearer it is the more of the screen it owns; the UMP's receiver
         stops at the notch and the tail carries on behind it.
      Values: three steps up the gun (body, top face, rail) plus light
      ticks on the rail's teeth, and all of it a value ABOVE black — a
      black gun under a noon sun is a silhouette with nothing in it.
      **THE HIP CARRY IS THE OFFSET AND THE ROLL, NOT THE YAW.** The guns
      were first held nearly parallel to the view and read as a thin
      sliver end-on; the answer looked like yaw, so they got `hipRy` +.26
      (15°). That is wrong, and it is wrong in a way you can measure: the
      BARREL'S OWN VANISHING POINT — project the gun's −z axis through the
      camera — sat at NDC −0.22, eleven per cent of the screen's width
      left of the crosshair. The gun was visibly pointing somewhere the
      rounds do not go, which is exactly what "it looks like you're
      shooting to the side" means.
      What a shooter's hip carry actually is: the weapon offset right,
      ROLLED, and pointed very nearly straight forward — the diagonal you
      see is perspective, the near end (the stock) far to the right and
      the far end (the muzzle) converging on the vanishing point. So
      `hipRy` is +.05 or so, `hipRz` about −.15, and the offset came in
      from .19 to .12. Measured: barrel vanishing point −0.05, muzzle at
      +0.07, and the gun still covers 0.47 x 0.43 of the screen.
      If a gun ever looks like it is aimed off to one side, measure the
      vanishing point before you touch anything.
      **AND THE RUNNING CARRY COMMITTED THE SAME SIN AT TEN TIMES THE
      SIZE.** The sprint pose was `+sr*.35` pitch, `-sr*.5` YAW and
      `+sr*.3` roll, and it was never measured. Projected: the barrel's
      vanishing point sat at NDC **(+0.42, +0.54)** with the barrel
      **31.7 degrees** off the camera's line — identical on the M4, the
      UMP and the Eagle, because the pose is shared. That is a rifle
      pointing up and to the RIGHT while its rounds go dead ahead down the
      crosshair, and you can fire the whole time: sprinting is the `free`
      state and nothing stops the trigger.
      Two halves to the fix, and both were needed.
      1. **The carry is sold by the ROLL and the DROP, never the yaw** —
         the hip's own lesson. A rotation about the barrel's own axis
         changes the posture completely and moves the aim point not at
         all, so the CANT does the work (`+sr*.62`); the muzzle goes DOWN
         (`-sr*.17`, and note the sign — positive pitch RAISES it here,
         which is what had it aimed at the sky), and the yaw is `-sr*.09`,
         a fifth of what it was. Measured after: **9.9 degrees** off, the
         vanishing point at (+0.03, −0.26) — just under the crosshair,
         where a lowered weapon belongs. The gun covers 7% of the screen
         running against 20.6% at rest, low and to the right.
      2. **The trigger takes the weapon OUT of the run** (`GUN_READY`,
         `FPS.readyT`, read by `updateViewmodel`). Nothing used to, so the
         first burst out of a sprint was fired from the carry. Held down,
         the pose comes out over about three tenths of a second and the
         barrel goes 9.9 → **3.5 degrees**, vanishing point (−0.04,
         −0.06): back on the crosshair, which is where the rounds go. It
         eases back in when you let go.
      **If a viewmodel pose is ever added or changed, project its barrel.**
      Every one of these faults looked fine in the source.
      Every viewmodel motion (bob, idle sway, look-lag) is
      scaled by `(1-ads)` so the sight is true when it is up. The hurt
      flinch is the one thing that still dips it, on purpose.
      **NOTHING BUT `updateGun` EVER SHOWS THE VIEWMODEL, AND ONLY
      `syncFpsRig` PUTS IT AWAY.** `updateViewmodel` runs inside
      `updateGun`, which a blade never calls — so a viewmodel raised once
      stood on the screen for ever under a blade, with every gun in the
      rack showing at once because none had been picked. That one line is
      in `syncFpsRig` now, where what is shown behind the eyes is decided.
  12. **THE SIGHTS CAP YOU TO A WALK; THEY DO NOT COME DOWN WHEN YOU
      MOVE.** `updateGun` used to carry
      `if(P.sprinting&&P.moveAmt>.5)FPS.adsOn=false` — "a sprint comes off
      the sights" — and on a THUMBSTICK that is the same sentence as *you
      cannot aim and move*. Nothing else gates movement while aiming; the
      stick's own DEFLECTION is what decides a sprint (past .78), and a
      thumb shoves a stick to its edge, so a player who aimed and then
      walked lost the sights every time. Measured before: holding the
      sprint with the sights up gave `ads 0, spd 7.2`.
      `adsWalk()` (a function DECLARATION beside `FPS`, reaching `gunHeld`,
      which is why it must not be a const arrow) is read in the hero's
      `free` state and forces `run` false while the sights are up. After:
      `ads 1, spd 4.3, sprint false` — the sights hold and you walk, which
      is what a shooter does. The sprint is untouched everywhere else:
      verified 7.2 with a gun and no sights, with a blade, and in third
      person.
  13. **THE CROSSHAIR IS SIZED IN THE SCREEN'S OWN MEASURE, AND IT STAYS
      THAT WAY.** `updateGunHud` computes the gap as
      `tan(cone) * (innerHeight / 2tan(fov/2)) + g.gap` — the cone
      projected through the screen's height, plus each gun's small pixel
      floor at the closed end. Measured, it holds 3.3% of the height at
      844x390 and at 760x428, and 2.7% at 1600x900 (the drift is the
      floor). The holo reticle's ring is `vh` for the same reason and
      reads exactly 7.0% at every size. **This was played and asked for by
      name — do not convert either to fixed pixels, and do not scale them
      with the weapon when the viewmodel changes size.** The crosshair
      belongs to the cone, not to the gun.
      **The cone is the hip's** (`coneNow`: `spread*(1-ads)`, 0 past
      `ads>.9`); on the sights the ray is the camera's forward and nothing
      else, and the crosshair is hidden past `ads>.8`. Recoil moves the
      EYE (`FPS.pitch`, `G.camYaw`) plus a settling share (`FPS.recP`);
      the viewmodel's kick is cosmetic. `gunRay` reads the camera matrix
      from the LAST update, so the kick applied in `fireGun` never bends
      the shot that caused it.
  14. The right trigger (`#fbFireR`) has its own pointer handling, not
      `bindBtn`: its drag feeds `camDX/camDY` and translates the button.
      The left trigger is a plain `bindBtn`.
  15. The UMP is `suppressed`: `AudioSys.gun('ump')` is a thump with no
      crack, the flash sprite is a third the size, and the halo flare is a
      quarter. Do not give it the eagle's report back.
  16. **The view and the weapon are separate now.** `FPS.on` is the eye's
      place; `gunHeld()` (`isGunKey(LOADOUT.weapon)`) is what is in the
      hands. `GUNS` holds six and `HERO_OPTS.weapon` lists them beside
      the blades. `updateGun` runs in EITHER view when a gun is held (in
      third person the tap is the trigger, `chargeHeld` the automatic's,
      and `gunAimBase` aims at the eye's mark). A BLADE has no viewmodel
      in either view: the pilgrim's own body is the animation, masked
      down to what the eye is not inside of. `Input.setBlade` tells the
      input a blade is held, so the right thumb keeps the third-person
      gesture behind the eyes instead of becoming the look.
  17. `buildGunModel` is a function DECLARATION and touches neither `GUNS`
      nor `FPS`: `makeKnightRig` calls it at boot when a saved loadout
      holds a gun, long before the module's consts exist. `isGunKey` is a
      declaration for the same reason. The rig's gun is the same model
      turned `rotation.x=-π/2, z=π` (barrel down the hand's -y, the way a
      blade hangs) — measured: muzzle 1.16 m ahead, sights up.
  18. **The gun materials are SHARED** (`gunMats()`) between the rig, the
      viewmodel and the pause portrait, and `player.flash` sets every hero
      emissive — so no gun material carries an emissive floor (the gold had
      one; it was wiped by the first blow and the portrait went red).
  19. Reserves are BY CALIBRE (`FPS.res[cal]`, `CALIBRES`); a magazine is
      the gun's own (`FPS.ammo[key].mag`). `resOf`/`setRes`, never the
      object directly.
  20. `hitscan` asks each horror's spheres in ORDER — head, then a limb,
      then the trunk — and the first the ray passes through takes it; the
      trunk's sphere is generous and wraps the others, so a nearest-t rule
      never reached a skull or an arm. `popHead`/`popLimb` park hp at 999
      across `severLimb` (which kills at zero and would double-count the
      marrow); `severLimb` takes `armR` now as well as `armL`.
  21. Holes are one buffer (`HOLES`, 80 quads, `punchHole`) placed by a
      Raycaster over `world`'s meshes minus the soil (`surfaceHit`);
      wounds (`woundEnemy`) are quads ATTACHED to the bone they struck,
      capped six a body and forty in all, and `clearWounds` runs in the
      hollows' `reset`. The rocket (`fireRocket`) marches `hitscan` a step
      a frame and `rocketBurst` throws a killed small humanoid into
      `scatterBones` with `crumbled` set, the katana-slice path, so
      `pruneFallen` buries it.
  22. **COVER IS THE OCCLUDER'S OWN CROWN, AND IT USED TO BE A CONSTANT
      PER KIND.** `hitscan` blocked a ray at `heightAt+2.4` for any wall
      segment, `+1.4` for any other obstacle (`+5.5` for a tree) and
      `+1.5`/`+2.6` for a breakable — numbers that have nothing to do with
      the thing standing there. Measured on seed 7: ruin walls run 1.31 to
      2.18m, so **every one of them ate rounds a metre above its own
      crown**, and a hollow's skull plainly showing over a wall could not
      be shot. A slab grave is 0.19m and stopped everything under 2.4. The
      same constant ran the other way on the colonnade: an 8.6m pillar was
      see-through above 1.4m.
      `addObstacle(x,z,r,stone,top)` and `addWall(...,stone,top)` take
      `top` — the WORLD y of the crown, not a height above anything — and
      `hitscan` reads it, falling back to the old constants only for an
      obstacle that forgot to say. A breakable takes its own from
      `b.obs.top`.
      **AND IT BROKE THE BELL, WHICH IS THE TRAP WORTH KNOWING.** Every
      breakable ALSO stands as a solid obstacle (bodies have to be pushed
      out of it), and `hitscan` tests the obstacles in an earlier loop than
      the breakables — so the obstacle sets `bt` at that same `t` and the
      breakable's own `if(t>=bt)continue` then skips it. It never showed
      before because the obstacle's constant was a LOW 1.4m and a round at
      chest height sailed over it into the breakable behind; give the bell
      its true 2.05m crown and the obstacle catches the round first,
      `hitscan` answers `stone`, `gunHit` never reaches
      `strikeBreakables`, and the thing stops ringing. Measured: a level
      shot from six metres read `stone(obs r=1.5)` where it had read
      `break(bell)`.
      Every breakable now goes through **`addBreakable(b)`**, which tags
      `b.obs.brk`, and `hitscan`'s obstacle loop skips anything tagged: the
      obstacle is the BODY'S business, the breakable answers for the
      bullet, and both carry the same crown. `breakPew` removes the pair
      together so the tag cannot outlive its obstacle. Verified end to end
      through `fireGun`: three rounds, tolls 0->1->2->3, the Bell-Called
      summoned. Verified over 178 field occluders and 68 on the path:
      **0 still block a shot 20cm over their own crown**, and what passes
      through their middle is unchanged. `BP.obstacles.filter(o=>o.top==null)`
      must stay empty — **anything new that calls either producer has to
      pass its height**, or it silently becomes a 2.4m wall again.

- **THE GUN OVER THE SHOULDER WAS THE LEAST-FINISHED THING IN THE GAME,
  and `updateGun` running in both views hid it.** Everything worked; almost
  nothing was FINISHED. Audited, in the order it was found:
  1. **`FPS.kick` never came down.** Its decay lived in `updateViewmodel`,
     which only runs behind the eyes — so over the shoulder the first round
     set it to 1 and it stayed there (measured: 1.000 five seconds later).
     `poseGunCarry` reads it, so the pilgrim's firing arm FROZE in the
     recoil pose for the rest of the run. The decay is in `updateGun` now,
     where both views reach it. **Anything a gun owns belongs in
     `updateGun`; only what the VIEWMODEL owns belongs in
     `updateViewmodel`.**
  2. **The hip's cone had no ceiling.** Measured on the M4, a magazine held
     down opened it 2.0 → 15.4 degrees — a two-and-a-half metre circle at
     ten. Behind the eyes you bring the sights up and zero it; over the
     shoulder there was no aim at all, so **half the rounds missed a
     standing hollow at nine metres** (10/20 measured). `SPREAD_CAP` (2.6)
     is a multiple of the gun's own resting cone, so it scales with the
     weapon: the M4 now tops out at 3.9 degrees.
  3. **There was no aim over the shoulder.** `canAim` was `FPS.on&&...`,
     so the AIM button was not even drawn, `coneNow` ignored `FPS.ads`
     in third person, and nothing the player could do tightened the shot.
     The **BRACE** is the answer and it is the same `FPS.ads` lerp: the
     cone closes, the camera comes IN and to the pilgrim's right, the
     pitch eases toward the horizontal, and the turn slows. Measured at
     ten metres: hip 15/20, braced 19/20.
     **AND THE WHOLE THING HAS SINCE MOVED UP ONE** (`GUN_CAM`,
     `ADS_CAM`, beside `BRACE_SIDE`). What the brace used to be is where a
     gun now RESTS — a rifle never wanted the blade's camera, which rides
     high and looks down at the ground round your feet. Aiming goes on
     from there to a Gears carry: closer still, nearly level, the body
     pushed well off to the left so the whole right of the frame is the
     shot. The two are one move along one axis, so the brace reads as
     leaning into a shot you were already lined up for.
     Measured (camera's horizontal distance / height over the soil /
     pitch / the pilgrim's share of the screen's height and where his
     middle sits across it):
       blade        4.87m / 3.06 / 9.5deg / 0.34h at cx +0.04  (unchanged)
       gun, resting 3.07m / 2.15 / 5.0deg / 0.59h at cx -0.11
       gun, aimed   2.56m / 1.82 / 2.7deg / 0.77h at cx -0.26
     The resting figures are the OLD AIMED ones to two places, which is
     the check that the request was honoured exactly.
     **THE AIMED END HAS SINCE GONE IN AND UP AGAIN**, asked for by name —
     closer over the shoulder and a little higher. Measured UNLOCKED at
     760x428 (which is why the pitches read higher than the locked table
     above; measure one way or the other, not both):
       before  2.76m / 1.95 / 10.9deg / 0.62h at cx -0.45
       after   2.46m / 2.17 / 12.7deg / 0.71h at cx -0.59
     **AND THE LOOK POINT HAS TO RISE WITH THE EYE, or "higher" only ever
     means "tipped further down".** The gaze is `hP+1.35+ADS_LOOK*ads`;
     lifting `ADS_CAM.up` on its own took the aimed lens from 10.9 to
     **15.0 degrees** while the camera climbed and the point it was
     looking at did not — the shot ends up looking down at the pilgrim
     rather than out past him. `ADS_LOOK` carries the gaze up by about
     what the eye gains, so only the vantage moves.
     Note also that `side` FIGHTS `in`: the reported distance is the
     horizontal hypotenuse, so stepping further to the shoulder adds back
     what pulling in took off. `in` went .58 -> .72 (the along-axis
     distance 2.14m -> 1.43m) and the measured figure moved only 0.30.
     The resting end (`GUN_CAM`) is untouched by all of it — verified
     3.07 / 2.15 / 15.4deg before and after in the same harness.
     **A GUN OWNS `G.camPitch`'S RESTING VALUE — NOT THE PLAYER'S THUMB.**
     The two branches above lerp it to .3 for their own reasons and this
     used to lerp against them, so the lens settled wherever the tug of
     war left it — measured 6.1 degrees where .17 was asked for. Both are
     gated `!gunHeld()` now and there is ONE writer. Do not add a second.
     But the first version of that writer ran UNCONDITIONALLY, and a drag
     writes `G.camPitch` in the no-foe branch — so it was hauled straight
     back at 6/s and **you could not look up or down at all with a gun in
     your hands**. Measured, one full drag: a blade's pitch moved +0.258,
     a gun's **+0.000**. It is gated on the same `G.camHeld` the yaw's own
     return uses, so a held camera stays where you put it until you move
     again (measured: .52 held, back to .17 after two seconds of walking,
     `camHeld` cleared), a LOCK takes it (as it does for a blade, which
     never had a drag there), and the AIM overrides both because bringing
     the gun up is an explicit ask for that angle (measured .52 → .111).
     After: blade +0.258, gun **+0.259**.
  4. **There was no mark on the screen.** The crosshair was `-1` unless
     `FPS.on`, so a rifle in third person was fired blind. And the
     screen's CENTRE is the wrong place for it: the round leaves the
     HANDS, a metre and a half ahead of the body and off to one side, and
     goes to the eye's mark or straight along the facing — none of which
     is where the camera points. So the mark is put where the round
     LANDS: one `hitscan` a frame along the same base `fireGun` uses,
     projected, with the gap sized from the cone's real radius at that
     range as seen from the CAMERA (a different angle from the muzzle's).
     Two traps in that: **`project()`'s own z is not the test for "in
     front"** — a point seventy-six metres out came back z 1.0042 and the
     mark was hidden always; ask `camera.getWorldDirection` and dot it.
     And a level round over flat ground meets NOTHING, so the honest mark
     is the horizon, which tells you nothing — it rests at `AIM_REST`
     (22m) and snaps onto whatever the ray meets the moment there is
     something to meet.
  5. **The rig's gun had a muzzle flash and nothing ever showed it**
     (`V.flash.visible` is written in `updateViewmodel` alone).
     `updateRigGun` is the third-person half of the viewmodel: the flash,
     bigger than the viewmodel's because it is five metres from the camera
     rather than half a metre from the lens.
  6. **The recoil now goes through the whole body.** It moved one joint;
     a rifle going off drives the shoulder round and back, takes the head
     with it and is absorbed at the knees. Every joint `poseGunCarry`
     writes is in `SMOOTH_JOINTS`, so the springs give the follow-through
     for nothing — the body rides the shot and settles rather than
     snapping.
  7. **HE TURNED HIS BACK ON WHAT HE WAS SHOOTING AT.** Giving ground
     while firing is the whole of a gunfight, and the body did the
     opposite: past about 115 degrees off the foe a sprint set `runAway`
     and swung the pilgrim round to face the way he was running, so he
     sprinted off with his shoulder blades to the horror while his rounds
     flew out of his back. Measured, a full-deflection retreat at a
     sprint: **180 degrees off the foe, `relF` +1** (the walk cycle
     playing FORWARD) — and the lock dropped at `LOCK_LEAVE` on top, so
     the eye let go of the thing he was shooting.
     Three flags, and the narrowness of each is the point:
     - **`gunWorked()`** — over the shoulder, the brace up OR a round
       inside the last `GUN_HOLD` (1.2s, `FPS.engageT`, set in `fireGun`
       and refreshed by the brace in `updateGun`). It gates the lock's
       LEAVING rule, in both directions: `lockAwayT` does not accumulate
       while the gun is being worked, and working it is one of the things
       that brings a released lock back. Without that half the rest is
       dead code — the lock goes, `foe` is null, and the facing rule it
       guards is never reached.
     - **`gunShoulder()`** — `gunWorked()` with something to point it at.
       It forces `runAway` false, so the body holds square on the foe
       whichever way the feet are going. `relF` goes negative and
       `poseWalk` reverses the stride and leans the trunk back on its own
       (`dir=-1` at `fwd<-.15`); none of that had to be written.
     - **`gunGiving()`** — `gunShoulder()` AND the feet actually going
       the other way (`dot < -.2`, the same test the lock's leaving rule
       uses). This is the one `adsWalk` reads, and it is separate because
       a backwards SPRINT is not a thing a man does: giving ground drops
       you to a walk so the legs have a backpedal to play. **A CHARGE IS
       UNTOUCHED** — sprinting AT something while firing keeps its 7.2,
       which is why the walk cap is not simply hung on `gunShoulder`.
     Measured, seed 7, a hollow pinned six metres ahead, the stick hard
     away: blade 180°/sprint (unchanged), gun idle 180°/sprint
     (unchanged — a retreat is still a retreat), **gun firing 0°, `relF`
     −1, 3.7 m/s**, gun charging in 0°/`relF` +1/7.2 (unchanged).
     First person is untouched by all of it (`gunWorked` requires
     `!FPS.on`): `adsWalk` there is still the sights alone, verified 6.1
     hip-firing and 3.7 with them up.

- **THE BRACE AIMS AT THE HEAD** (`GUN_HEAD_HIP`, `gunAimBase`). Over the
  shoulder there is NO FREE AIM at all — the round goes to the marked
  horror or straight along the facing, and nothing the player does points
  it — so *which part* it goes to is the only aim there is. It was one in
  four for the skull whatever you did, braced or not, which left the brace
  worth nothing but a tighter cone the third-person shot barely had.
  It rides `FPS.ads` now: `lerp(GUN_HEAD_HIP, 1, ads)`, so the hip keeps
  its old one in four and a fully braced round is a headshot. No switch
  and no threshold to sit on — it is the same move as the camera coming
  in. Measured over 400 rounds on a hollow at nine metres: **hip 22.8%,
  half-braced 56.8%, braced 100.0%** (400 of 400).
  - **IT IS FRONT-LOADED, AND THAT IS THE BEHAVIOUR, NOT A FAULT.** 5.56
    and .50 are `strong` calibres, so the first braced round POPS THE HEAD
    — and `gunSpheres` then offers no head sphere, so every round after it
    goes to the body. Measured, six braced m4 rounds at one hollow kept
    alive: **round 1 HEAD (head off), rounds 2-6 body.** That is why
    rounds-to-kill barely moves: m4 on a 70hp thrower, **hip 4.5 (median
    5), braced 4.0 (median 4)**. The brace buys a decapitation, not a
    damage multiplier on every shot.
  - **`steady` is what the MARK asks for.** The mark is one `gunAimBase` a
    frame, so with a random head/body pick it aimed at the skull on one
    frame in four and the chest on the others — a reticle shivering a
    body's height, which `FHUD`'s own smoothing then parked at the AVERAGE
    of the two, pointing at neither. `gunAimBase(o,true)` leaves the die
    out. Measured over 40 still frames, the mark's y is now identical on
    every one: **0.496 at the hip (the chest), 0.937 braced against a
    skull whose centre is 0.92.**
  - **FIRST PERSON IS UNTOUCHED AND CANNOT BE REACHED FROM HERE**:
    `fireGun` passes `base=FPS.on?null:gunAimBase(o)`, so behind the eyes
    the ray is the camera's and nothing else. Verified by wrapping the
    function and firing in first person — **called 0 times**.
  - `popHead` already refuses a boss and a mini, so nothing here can
    decapitate the Warden; and a horror with no head sphere (a crow, a
    heap, something already headless) falls through to the body exactly as
    it did.
  **THREE HARNESS TRAPS, ALL OF WHICH GAVE CONFIDENT WRONG ANSWERS:**
  1. **`fireGun` fires from the RIG'S MUZZLE.** Moving `player.x/z` in a
     harness without updating the rig leaves `muzzleWorld()` at the old
     place, and the rounds go into the dirt — measured `FPS.lastHit
     'ground'` on a shot whose own `gunAimBase` ray hit the foe cleanly.
     Drive real frames between shots (`await new Promise(requestAnimation
     Frame)` inside `page.evaluate`, which can await), or measure
     `gunAimBase` directly with a synthetic origin.
  2. **`FPS.ads` IS A LERP THAT `updateGun` OWNS.** Setting it from a
     per-frame tick is pointless: the game pulls it straight back, because
     the AIM button is not held. Set `FPS.adsOn` — the input — and let the
     brace come up before counting. A whole "braced" run was measured at
     `FPS.ads 0` before this was noticed.
  3. **A burst skeleton is not shootable.** Body hits scatter a hollow
     into a heap, `shootable()` excludes `scatter`, so `gunAimBase` falls
     back to the facing and every further round flies past — a kill test
     that runs to its cap with the target on full health.

- **THE RELOAD IS A PLAN** (`RELOAD`, `reloadPlan`, `startReload`,
  `cancelReload`, `reloadMotion`, `rlArm`, `RL_CARRY`, `MAGDROPS`). It was
  one sine hump on the whole gun plus a magazine sliding down and back,
  and over the shoulder it was nothing at all — `poseGunCarry` never read
  `FPS.reloading`, so the pilgrim stood holding the rifle while the
  counter refilled. Now a reload is built once when it starts: a list of
  timed events in SECONDS (`FPS.rl.ev` — what sounds, when the rounds are
  credited, which prop moves), and the same list drives the sound, the
  viewmodel's parts and hand, the rig's own gun and the pilgrim's arms.
  One table, so none of them can drift.
  - **Four mechanisms, not one.** A BOX (deagle, ump, m4): out, DROPPED
    as a real prop, fresh one up and rocked home, the action worked. A
    TUBE (spas): shells one at a time, each credited as it goes in, then
    the fore-end. A TURN-BOLT (sniper): bolt opened and HELD open, singles
    into the box, bolt closed — so the bolt sound is split into
    `boltUp`/`boltDown`. A ROCKET (rpg): slid down the tube from the
    front, the warhead re-appearing as it seats. The tube's and the
    bolt's lengths are the rounds MISSING, so their `g.reload` is a
    per-round figure.
  - **A tactical reload is the same as an empty one** (by decision), and
    **the ONLY cancel is a dodge** (`startDodge` → `cancelReload`). A swap
    is REFUSED while one runs — it used to be a cancel through
    `gunSwapped` — and death simply ends it. Whatever was credited before
    a cancel stays: measured, a dodge at .65s of an m4 reload left 2 in
    the magazine, a dodge at 1.28s (past the seat) left 30, and a spas
    dodged after two shells kept 5.
  - **The magazines are GROUPS now, and they had to be.** Each mag was a
    body mesh plus separate ribs and a floor plate on the gun, and the old
    animation moved the body alone — the plate stayed in the grip while
    the magazine it closes fell out of it. `magG` (outer, a `vmPart` the
    ADS split may move) holds `magA` (inner, what the reload moves), so
    what `splitAds` does to the outer z is never fought. The pistol's
    travels along `magAxis`, because its grip is raked.
  - **THE CARRY IS A PLATEAU, AND IT COMES UP, NOT DOWN.** The whole
    reload of every gun played BELOW THE SCREEN. Two causes, both
    measured by projecting each gun's own `wellAt` to NDC: the old carry
    dipped the gun down and pitched the muzzle up (both push the well
    under the bottom edge — m4 well y -0.99 to -0.89 for the whole
    reload), and my first replacement was a hump near zero at both ends,
    so the hand went to a well that was still off screen. `RL_CARRY`
    lifts, drops the muzzle and ROLLS the underside to the centre, held
    for the whole reload: now m4 -0.39, ump -0.51, spas -0.33, sniper 0,
    rpg -0.19, all in frame, hands in frame most or all of the time.
    `g.rlCarry` scales it per gun — **the Eagle at .55**, because its
    well is at the REAR of the gun and the full carry put the support
    hand behind the near plane (+0.065 against -0.1); the launcher .75.
  - **THREE SLABS, ALL THE SAME TRAP** (a flat box a hand's width from
    the lens — see the UMP's receiver note): the support hand's forearm
    angled BACK toward the eye (now it hangs down); the hand sent to the
    m4's charging handle at the REAR of the receiver (it works the action
    from the receiver's side, forward of the eye, and only the handle
    mesh travels); and the GRIP hand's static sleeve, a .2 box angled
    back that the lift brought up across the bottom of every reload —
    shorter and hanging down it is still off the bottom at rest.
    **Verified unchanged at rest by the hip-picture measurement: m4 0.48
    x 0.43, ump 0.47 x 0.44 against the documented 0.47 x 0.43.**
    After all three: **0 frames behind the near plane on the m4, ump and
    deagle for the whole reload**; the spas, sniper and rpg still read
    their STOCK there from frame one, which is the documented hip carry
    and not the reload.
  - Sound is once per beat, at its beat: the first version fired `magOut`
    twice (once from `startReload`, once from the plan) and thudded the
    dropped magazine on every bounce. `magDrop` plays on first touch only.
  - **The pose returns exactly.** All seven arm/trunk/weapon channels
    read identical before and after a third-person reload; the barrel
    direction settles to 0.007 (the springs carry the pose for a few
    frames past the fade — a harness that samples at the END reads 0.68
    and is measuring the fade, not a fault).
  - Harness traps: `FPS.vm` is null until `setPov(true)` builds it;
    `wantAds` is gated `!FPS.reloading`, so a reload never happens on the
    sights and an "ADS reload" cannot be measured; a per-trial drop count
    must reset the pool or it counts the last trial's magazine.

- **THE GROUND SHADE** (`SHADOW`, `shadowTick`, `shadeRig`, `shadeRigs`,
  beside `lodUpdate`). Every body stands on a flat black disc, built once
  in the humanoid rig and never touched again. Three things were wrong
  with it and all three were measured before anything was changed:
  1. **IT LEFT THE GROUND.** The disc is a child of the rig's ROOT and the
     root's height carries `rollAir`, so at the top of a roll the shadow
     rose **0.35m into the air** with the body. It is pinned to the soil
     now by cancelling the lift in its own local y — measured 0.02 (which
     is `SHADOW_UP`) at every point of the roll.
  2. **IT WAS AS DARK AT MIDNIGHT AS AT NOON.** The key light runs 1.20 at
     noon down to 0.21 at night and the disc held a flat 0.40 through all
     of it. Now **0.44 / 0.32 / 0.24** at noon / dusk / night.
     **AND THERE IS A FLOOR UNDER THAT, LEARNT THE HARD WAY.** The first
     curve was `.08+.36*x`, which is what the physics says — a weak light
     throws a faint shadow — and at night it reached 0.14, where the disc
     stopped doing the one job it has. Measured by rendering the frame
     twice and differencing it (the disc lit, then hidden), the pixels it
     touches were darkened by 24.6 of 255 at noon, 6.4 at dusk and **3.9
     at night**: under two per cent, a body hovering over the ground. The
     ground is ALREADY dark at night, so a black disc can never take much
     absolute luminance out of it — the share it takes is just its
     opacity, so the floor has to be a legible share and not a physical
     one. `.20+.24*x` reads 24.5 / 7.8 / 6.5 and still softens by nearly
     half from noon to night. **If it is ever re-tuned, difference the
     frame; do not reason from the light's intensity alone.**
  3. **IT NEVER LEANED.** The sun swings from 74 degrees at noon to 9 at
     sunrise, where a real shadow is thrown six times the body's height
     sideways, and the disc sat centred under the feet at every hour. It
     stretches and leans AWAY from the key light now: measured, the offset
     from the feet runs 0.01m at noon to 0.48m at dawn and dusk, the long
     axis 1.00 to 1.80 times the short, and the dot of the offset against
     the light's own bearing is **-1.00 at every hour**, which is the
     check that it leans the right way.
  Three things about the code are load-bearing:
  - **`rotation.order` is YXZ**, so the disc can be spun about the parent's
    up AFTER being laid flat. The parent is the root, which carries the
    body's facing, so the yaw is `SHADOW.az - facing` and the offset is
    rotated back through the facing by hand. Get the order wrong and the
    lean tumbles the disc instead of spinning it.
  - **THE MATERIAL IS NOT SHARED, AND SHARING IT WAS TRIED.**
    `heroifyObject` MUTATES a material in place to give it the hero's
    depth-clip shader — so one material behind every body in the world
    takes that shader the moment the pilgrim's rig is built, and every
    enemy's shadow starts discarding against the hero's depth buffer. A
    float written per body per frame is nothing; that is a bug nobody
    would find.
  - **It writes the CHILD's `visible`, never the root's.** Every corpse in
    the game is hidden with `root.visible=false` (ten sites), so a child
    flag cannot resurrect one. The melt is the one case it does guard,
    because that scales the root and the disc's local units stop being
    metres.
  **What is deliberately NOT done: the disc does not follow the ground's
  slope.** Measured over 1962 spots of real soil (the cathedral and its
  apron excluded, or you measure the plinth's step and get 1.2m), the
  ground under the disc's own rim varies a **median of 4cm, 18cm at the
  ninetieth and 47cm at the ninety-ninth** — under a disc standing 2cm
  proud. Only the steepest hundredth shows it, and tilting costs a second
  rotation composed against the facing every frame. Re-measure before
  deciding it is worth it.
  The whole pass costs **19.7 microseconds a frame at 25 bodies — 0.12% of
  a 60fps frame** — and the draw count is unchanged at 533.

- **THE PACK: THREE THINGS THE HOST NEVER DID, AND ALL THREE THE SAME
  SENTENCE — a horror only ever knew about the PILGRIM.**
  1. **The approach was a straight line on a frozen bearing.** Measured on
     six hollows set on her from a 126-degree arc fourteen metres out: the
     spread was 126 degrees at the start and **126 degrees eight seconds
     later**. Every body held the radius it was born on, so a pack that
     spawns in a clump arrives as a clump and queues to hit you. Neither
     outcome is a decision.
  2. **They walked through one another.** Nothing kept two bodies apart.
  3. **A kill meant nothing.** Nothing in `die()` touched a neighbour.
  `packSteer(e,dx,dz,dist)` answers the first two: the line to the
  pilgrim, BANKED toward the tangent while still out in the open (each
  body carries its own signed `flank`, so half curl left and half right
  and the group opens out with nobody being assigned a position), plus a
  separation push off anything else walking at her. The bank fades to
  nothing inside `FLANK_NEAR` reaches, so the last stride is straight in.
  Measured now: **126 → 205 degrees** of spread while closing 14m → 3.5m,
  closest pair 1.58m rather than stacked.
  `alertPack(x,z,from)` answers the third, from `die()`: dormant within
  8m wakes (never an ambush — that is what an ambush is for), anything
  patrolling or guarding within 12m comes, and a chaser within 7m is
  STARTLED — `startleT`, a third of a second with its head off the
  pilgrim and round to where it happened, at 45% speed, then on from a
  fresh bearing. Measured: 2 of 3 neighbours startled, the pacer went to
  chase. **It is a beat and not a stun on purpose**: a pack that freezes
  on every kill is a pack you take apart one at a time for free, and
  `startleCd` (3.5s) stops a massacre chaining it.
  **The cost is nothing and it was measured**: every live body steering
  against every other is **8.6 microseconds a frame — 0.05% of a 60fps
  frame** at 24 bodies. The two-comparison bounding test before the
  distance is what buys that; keep it.
  **The THROWER stood on one line.** Its band was a rubber band on the
  same radius, so it lobbed from one bearing for ever (measured: seven
  degrees in five seconds) — a ranged thing that never moves is a target
  you can forget about. Its RANGE and its ORBIT are separate now, or it
  ends up pinned on the edge of its own band: it holds `CAST_BAND` within
  a metre and a bit, and works round her the whole time, turning its
  circle after every throw and whenever she closes inside seven metres.
  Measured: 21 degrees in ten seconds at a steady 10.7–11.6m.

- **THE WEAPON BAR WAS LAID OUT AS A 52px CIRCLE, AND IT WAS A
  SPECIFICITY BUG.** `#fpsCtl .btn{width:52px;height:52px}` is (1,1,0) and
  `#fbSwap{width:228px;height:42px}` was only (1,0,0), so the size rule
  the bar wanted never applied: it was drawn as one of the round buttons
  while its own contents — the name, the calibre and the count — ran 95 to
  136 pixels wide. Everything past the first 52 fell outside the panel, so
  the gun's name and its ammunition sat on the bare field with no ground
  under them. The selector is `#fpsCtl #fbSwap` now, which is (2,0,0).
  **If a button in that set ever ignores its own size, count the
  specificity before you touch the numbers.**
  While there: the bar sizes to its contents (`width:auto` with a floor
  and a `min(64vw,330px)` ceiling) because the names are not one length,
  and it carries its own LINEAR background — `.btn`'s fill is a radial
  gradient lit from 38%/32%, which on a bar two hundred pixels wide is a
  bright patch off to one side.
- **THE PLAYER OWNS TWO NUMBERS: `VIEW.fov` AND `VIEW.sens`** (declared
  immediately below `camera`, above everything that reads them, and
  remembered under `bp_view`). Two sliders on the pause screen write them.
  - **A SIGHT IS A MAGNIFICATION, NOT AN ANGLE, AND THIS IS THE WHOLE
    TRICK.** Every aimed field in the game — each gun's `adsFov`, the
    sniper's zoom array, `ATT_FOV`'s 61 and 37 — was hand-tuned against a
    68-degree lens. Store those as absolute degrees and a player who sets
    a hundred-degree field finds his red dot has silently become a scope.
    `FOV_REF` is 68 and `adsFovOf(deg)` reads a stored figure back as the
    POWER it stood for at 68 and re-derives it through `VIEW.fov`.
    Verified: the red dot holds 1.145x at base 60, 68, 84 and 100.
    **Any new aimed field goes through `adsFovOf`.** Writing one straight
    into `camera.fov` is the bug, and it is invisible at the default.
  - `applyFov()` is the one place the lens is put back to rest; the two
    sites that used to write a literal 68 call it now. Do not add a third.
  - The first-person turn is `.0034*(camera.fov/VIEW.fov)*VIEW.sens` — the
    `camera.fov/VIEW.fov` share is what holds the rate ON THE SCREEN
    steady while the sights narrow, and it must be measured against
    `VIEW.fov`, not against 68, or the setting changes the feel of the
    hip as well. Third person is `.0062*VIEW.sens`, unscaled: it has no
    sights.
  - **A SLIDER STYLED DOWN TO A HAIRLINE IS TWO PIXELS TALL AND NOBODY
    CAN HIT IT.** Put the height on the input (22px, transparent) and the
    hairline on `::-webkit-slider-runnable-track` / `::-moz-range-track`,
    with the thumb pulled up by half its own height. Measured: the hit
    box is 22px, not 2px. And stop `pointerdown`/`pointermove` at the
    input the way `#seedIn` does, or the overlay under it takes the drag
    and the thumb never moves.
- **THE HOST'S DRAW ORDER IS WHAT DECIDES THE MIX, NOT THE WEIGHTS**
  (`hostKit`, `bigLead`, `spawnEnemies`, `pathHost`). A wedge's purse is
  about a hundred and eighty and the cheapest brute-bearing template is a
  hundred and twenty, so ANY cheaper template drawn before one locks the
  big skeletons out of that wedge for good. Raising `brute`'s weight could
  never fix it — measured, the field averaged **0.58 brutes**. `bigLead`
  places one before the weighted draw begins, `BIG_LEAD` of the time, from
  `LEAD_POOL`; it is never run for the south wedge, whose purse is a third
  of the others'. Now: **3.2 brutes, 2.7 throwers, 13.9 hollows, 2.6
  crows** over twelve seeds.
  Two traps came out of it, both measured:
  1. **A lead costs the wedge the casters and the crows it used to buy.**
     Leading with a bare brute took the throwers from 3.00 a field to
     0.50. `overseer` (a brute AND a thrower for the price of the two) is
     in the lead pool for exactly this reason, and the draw loop's floor
     is the CHEAPEST template's price (25, a crow), not the
     second-cheapest — what a lead leaves behind is usually a crow's
     worth and a crow is what should spend it. **The south wedge is barred
     from the crow, so its cheapest is 70, not 25: the loop must `break`
     on an empty option list or it reads `T[undefined].place` and takes
     the whole game down at boot.** (It did.)
  2. **A brute returns LESS marrow for its price than hollows do** (140
     for 120, against 120 for 70), and the host never comes back — so a
     field of brutes quietly sows less marrow against a gate of a
     thousand. It took the thinnest of twelve seeds from 1210 to 1110:
     one brute lost over the rim and the cathedral could not be opened at
     all. `TOTAL` is 1000→1120 to hold the slack (thinnest seed now
     1305). **If you change what a template costs, re-measure the
     THINNEST seed, not the mean.**
  Fewer, bigger bodies is also CHEAPER: a hollow's rig is 41 meshes and a
  brute's 34, and there are four fewer bodies. Measured over four seeds x
  eight headings, **847 draw calls to 546**.
- **The sights are a magnification, and the number is derived, not
  chosen** (`ATT_FOV`): the camera's field is 68 degrees, so a power of N
  is `2*atan(tan(34deg)/N)`. The red dot is **1.15x (61 deg)** and the
  ACOG **2x (37 deg)**; they were 1.38x and 3.17x, and the ACOG's was a
  sniper's magnification with a sniper's tunnel to go with it.
  - **The red dot's housing is the GUN'S OWN.** `applyAttachment` puts the
    modelled optic's sight line at the screen's exact centre, so a drawn
    tube in `#reddot` on top of it is a second housing at the wrong scale
    — it read as a black hoop hanging in front of the rifle. The HUD
    contributes the emitter's bloom and the reticle RING over that same
    point, and nothing else.
    **THERE IS NO GLASS IN IT, AND IT IS ONE HOOP.** The pane went a
    quarter opaque, then a sixth, then a twentieth, and at every one of
    those the answer to "can you see through it" was still no: a pane over
    the exact spot you are shooting at is a pane you look AT. Then it had
    two square hoops with rails between them, for depth — and that read as
    a CUBE sitting on the gun. It is ONE thin rectangle now, wider than it
    is tall the way a holographic sight's window really is, with nothing
    between the sides, and the reticle is a red dot and ONLY a red dot: no
    ring around it, in the model or in the HUD. Do not put back the pane,
    the second hoop, or the ring.
  - **THE ACOG IS OUT OF `inGlass` AND IS A MODELLED SCOPE.** It used to
    take the eye into the lens and put the gun away, which is what a
    SNIPER'S scope does; at 2x it read as a black tunnel with a chevron
    in it. `sightAcog` builds the real thing now — a bell, a body, two
    rings clamping it to its mount, an elevation turret on top and a
    windage turret on the side — out of `vmTube` (open at both ends and
    `side:DoubleSide`, so its inner wall is there and you look DOWN it)
    and `vmRing`. The gun stays under it and the field stays round the
    edges. `inGlass` is the SNIPER'S OWN scope alone now
    (`!!g.scope&&attOf(g)==='iron'`), and `#acog` in the CSS is a
    reticle only — a ring, four ticks and a centre dot over the middle
    of the screen — with no housing drawn, because the housing is the
    model's.
    If the picture through it ever looks like a hole, check that
    `M.tube` still has `side:THREE.DoubleSide`: a single-sided tube seen
    from inside draws nothing and the scope becomes a window onto the
    skybox.
    **ONE BORE, ONE RING.** The body was r .024 with a WIDER eyepiece of
    r .028 behind it, and looking down a tube whose radius steps you see
    the edge of each: two concentric hoops. A scope's body is a single
    bore from the eye to the bell. A flare is free — anything WIDER than
    the bore is outside what the bore already frames and draws no edge of
    its own, which is why the bell may and does flare; only a NARROWING
    adds a ring. If a second hoop ever appears, look for a radius step.
    The power is 30 degrees (2.47x) now rather than 37 (2x): the reason it
    was pulled down to 2x was the tunnel, and the tunnel went when the
    optic became a model.
- **EVERY GUN IS BUILT OUT OF `vmOct`, AND THE FURNITURE FOLLOWS ONE
  RULE.** `GOct` is a unit eight-sided prism lying along z, turned an
  eighth of a turn so its flats land exactly where a box's faces would —
  so `vmOct` is a drop-in for `vmBox` with its four long corners
  chamfered, one mesh, one draw, sixteen more triangles. Every receiver,
  grip, magazine, stock and handguard is one. At this resolution the
  chamfer is the whole difference between a prop and a gun.
  **A piece of furniture cut INTO a surface must be NARROWER than the
  surface and only a step off its colour.** Both halves of that were got
  wrong on the Desert Eagle first time: the slide's serrations were
  drawn .051 wide on a .048 slide in near-black, so instead of cuts in
  gold they were black fins standing off the sides, and the pistol read
  as a yellow blob with holes punched through it. `goldM`/`goldD` exist
  for this — the frame is a step under the slide so the two read as two
  parts, and every cut in either is that part's own colour darkened.
  A rib that stands PROUD (a rail's teeth, a magazine's witness ribs) is
  the opposite and may be a millimetre wider; know which you are making.
  And a detail buried INSIDE its parent renders nothing while looking
  perfect in the source — the rifle's fore-end chequer sat 6mm inside the
  wood for a while. If a detail is invisible, check it is at the surface
  before you touch its colour.
  Measured, first person, gun in hand: the pass costs **22–58 draw calls**
  a weapon (deagle 26→52 meshes, ump 53→78, m4 38→94) and nothing at all
  while a blade is held. That is the price of the detail and it was paid
  deliberately; do not pay it twice by adding more.
- **WHAT MAKES A MODEL READ AS A RIFLE RATHER THAN AN SMG IS PROPORTION,
  NOT DETAIL.** The M4 was covered in furniture and still read as a
  submachine gun, and the reason was a short fat handguard, a stub of
  barrel past it and a tall stubby receiver. What says RIFLE is LENGTH
  FORWARD OF THE HAND: a long slim handguard (.270 now, against .200), a
  barrel carrying well past it to a gas block and front sight at the end
  of it, and a receiver that is LONGER and SLIMMER rather than taller
  (.050 x .048 x .225, against .056 x .060 x .260). It runs 1.00 in gun
  units against the old .88 and nearly all of the gain is ahead of the
  grip. The carry handle went with it — a flat top with one rail unbroken
  from the receiver to the end of the handguard is the modern outline.
  **The lit top FACE must run the WHOLE gun.** It stopped at the end of
  the receiver first time and the trapezoid that gives the aimed picture
  its depth stopped with it, halfway to the muzzle; the handguard carries
  the same `M.grey` strip at the same height (.063–.068) so the band is
  one unbroken fifty-centimetre run receding from the eye.
- **THE UMP'S DECK IS A CHANNEL, AND THAT IS THE WHOLE AIMED PICTURE.**
  The reference frame shows a TROUGH: a raised wall down each outer edge
  of the receiver, their top faces catching the light, and a sunken groove
  between them running away to a small dark sight block. The eye is led
  down the groove. The build before this had it inside out — one bright
  rail raised along the CENTRE with light teeth on it — and a raised
  centre reads as a spine, not as a line to look along. The walls are
  `M.gun` with a 4mm `M.grey` cap each (one lit edge apiece, and nothing
  else on the gun is lit); the groove's floor is `M.gunD`, a step DOWN
  into shadow. The handguard carries the same channel on unbroken, so the
  run is one length from the eye to the front sight.
  **And the gun is DARK.** A UMP is black polymer. The old one laid
  `M.steel` across the whole top face and it rendered as a cream stripe
  the length of the weapon. Light on the EDGES, nowhere else — the same
  lesson the Eagle's gold taught.
  **THE REAR PEEP WAS TWICE THE SIZE IT SHOULD BE**: measured by the M4's
  own formula, `(r_outer/eyeDist)/tan(adsFov/2)`, its hoop covered 43% of
  the screen's height and the aimed picture was a donut with a gun
  somewhere under it. r .0095 / tube .0024 puts it at 26%, and what fills
  the frame is the channel, which is the point.
  **A HOODED FRONT SIGHT MUST NEST INSIDE THE REAR APERTURE, and the test
  is angular, not linear.** The front ring is more than twice as far from
  the eye, so what matters is radius over ITS OWN distance: .0105 at .527
  subtends 0.70 of the rear's clear .0071 at .205. The old front ring was
  .0207 across and subtended MORE than the rear aperture could frame, so
  it filled the hole instead of sitting in it.
  And the drum gets no flat top: at ADS it is the nearest thing to the eye
  after the hoop, and a wide slab there hangs over the aperture.
- **A GUN MAY OFFER A SIGHT THE OTHERS DO NOT** (`SIGHTS`, `attHas`,
  `attOpts`, `g.ring`). `iron2` is a SECOND set of a weapon's own sights
  and only a gun whose `GUNS` descriptor carries `ring:true` has one built;
  the pause screen cycles THAT GUN'S list, so a rifle without a second set
  never shows the row twice. Three things had to stop being hardcoded to
  the original three names: `applyAttachmentTo`'s visibility, the `sightZ`
  measuring loop in `buildGunModel`, and the aimed-field pick (now
  `attFov(g,a)`, which drops anything that is not a dot or a scope onto the
  gun's own `adsFov` — so a second iron set aims at the same field as the
  first, which is what it should do).
  **`attOf` degrades a choice the current gun cannot honour back to
  `iron`.** The attachment is remembered per gun in localStorage, so a gun
  that loses a sight between versions — or a key typed in by hand — would
  otherwise hand `applyAttachmentTo` a name with no group behind it and
  hide every sight on the weapon. Verified: forcing `FPS.att.m4='iron2'`
  reads back as `iron` and the rifle's own irons stay up.
  **THE UMP'S SECOND SET IS A NOTCH AND A RING AND A BEAD** — no hood,
  nothing to look through. The ring stands at the muzzle end and you lay
  the bead on the mark; the field stays open above the sight line, which is
  the whole trade against the drum.
  - **The bead goes in the ring's CENTRE and the front tower must stop
    under it.** The first pass put a tick on the ring's CROWN and ran the
    tower straight up through the middle and out of the top of the hoop, so
    what you actually aimed with was a black post and the point of aim was
    an empty spot beside it.
  - **A THREE-PIXEL PART IS A COLOUR PROBLEM, NOT A SIZE PROBLEM.** The
    render is 383x216; the ring's clear circle is about ten pixels of it
    and the bead is four. At `M.pale` it was four pixels of cream on a pale
    noon sky and read as nothing at all, and there is no room at that size
    for a dark rim wide enough to save it — a shroud fat enough to see
    fills the hoop. It is `M.bead` (amber) now, which separates from a
    bright sky by HUE and from dark soil by VALUE, so it needs neither.
    Measured at (410,231) with the ring dead centre, the bead against the
    picture just above it: 147 at clear noon, 207 storm night, 120 snow.
    A warm DUSK sky is the one case the colour alone does not win (35), and
    it is what the two-pixel dark bezel round the bead is for; check that
    case before trimming the bezel away.
    It is a 4x4 square of the frame — `.0048` in the gun's units, down
    from `.0062`, which at eight pixels read as a blob filling the hoop
    rather than a bead sitting in it.
  - **PROVE A SMALL PART IS MISSING BEFORE YOU MOVE IT.** Hours went on the
    assumption that the bead was being culled, occluded or snapped away —
    it was none of those. Repainting it red showed 48 pixels exactly where
    it should be. Recolour first; it is one line and it answers the
    question outright.
  - **HOW HIGH IT RIDES IS `ay2`, WHICH IS THE WHOLE SIGHT LINE**, and
    there is a HARD FLOOR under it that is worth knowing before you try.
    At ADS the ring is pinned to the screen's exact centre and cannot
    move, so "lower" only ever means the DECK rising toward it — and the
    deck's own crown is the limit. The ring's lowest point is `ay2` minus
    its outer radius (.016), the channel's lit caps top out at .0805, so
    below **ay2 .0965** the deck starts eating the ring's bottom arc.
    Measured at .0925: the lower third of the hoop was gone and the
    picture was solid gun from the middle down. It is .0975 now, which is
    a millimetre and a half of clearance.
    Getting there went .108 -> .0995 -> .0975, and the honest measurement
    is that most of what reads as "the ring is too high" is the TOWER, not
    the sight line: from .108 to .0995 the air under the ring closed
    56px -> 36px, but from .0995 to .0975 the deck came up only two more
    pixels. The tower went 40mm -> 20mm -> 12mm over the same three
    passes and that is what actually changed the picture. If it is asked
    to go lower again, shrink the RING (a smaller hoop clears the deck at
    a lower `ay2`) — do not push `ay2` under .0965.
    The rear notch comes down by the same amount every time, or it rises
    through the sight line it is supposed to sit under.
  **And the REAR is what wants shrinking, never the front.** It sits a
  fifth of a metre from the eye and the front sight is five times further,
  so every millimetre at the back is worth five at the front. A .028 bed
  with .014 posts came up as two black ears filling the middle of the frame
  — a big rear element swapped for a different big rear element. Low bed,
  short ticks, and both BELOW the sight line: the picture is the ring with
  a notch under it, not a notch with a ring in it.
  **A front-only sight is not an option**, however much it might look like
  one: `sightZ` is the REARMOST point of the group and that is what fixes
  where the eye sits (`ADS_EYE` behind it). Drop the rear and the eye lands
  level with the ejection port with the whole gun squashed behind it.
- **AN APERTURE SIGHT MUST HAVE NOTHING BEHIND ITS HOLE.** The obvious way
  to mount a ghost ring is to stand it on a tower, and a tower at the
  hoop's own z fills the aperture with its own material — you aim at a
  solid disc and every number in the model looks right. It stands on a
  NECK that stops at the hoop's OUTER bottom edge (`ay - (r + tube)`), or
  on two legs set outside the outer radius. Nothing may cross the clear
  hole.
  **And how big the hoop is, is MEASURED, not chosen.** The eye sits
  `ADS_EYE` behind the sight, so the hoop's share of the screen's height
  is `(r_outer / eyeDist) / tan(adsFov/2)`. At r .020 the M4's covered
  **55%** of the frame — a tunnel, not a sight. The reference frame's is
  about 24%; r .0105 with a .0028 wall gives 30%, which is the reference's
  picture with enough hoop left for a fourteen-sided torus to still read
  as round. If it wants resizing, compute the share.
  A dark post on a dark background vanishes, so the front post carries a
  `M.pale` bead at its tip — test the sight picture against open SKY as
  well as against the nave, or you will not know whether the post is
  missing or merely unlit.
- **A WEAPON'S MATERIALS ARE NEVER THE WARDROBE'S TO PAINT.** `dressSnow`
  lists every mesh on the rig; weapon meshes are marked `wep` and
  `wearSnow` and `meltHero` skip them outright. They stay IN the list
  because `dashGhost` walks exactly that array and the thief's fade has to
  reach the sword — only the COLOUR is out of bounds.
  The reason is that those materials are not the rig's own: `gunMats()` is
  a memoised singleton shared by the pilgrim's hands, the first-person
  viewmodel AND the pause portrait, and a blade's are shared with its own
  viewmodel clone. Anything written here is written to all of them and it
  STAYS — `rebuild()` makes a fresh rig and hands it back the same cached
  materials. Measured: at 15hp the rifle's material went `#060607` to
  `#3d0706`, in the hands, down the sights and in the portrait at once,
  and the melt would have left one poison-green for the rest of the run
  the same way. `sh=0` was supposed to mean this and did not — it only
  zeroed the SNOW share, while the blood lerp used `1-sh*.45`, which at
  sh=0 is the full tint.
- **GOLD IS A SATURATION RAMP, NOT A VALUE RAMP, AND YOU CAN MEASURE IT.**
  The Desert Eagle read as a yellow plastic toy, and three passes of
  darkening the palette did almost nothing. Sampling the rendered pixels
  inside the gun's own box said why: saturation ran **0.72 / 0.75 / 0.57**
  across shadow, body and highlight — essentially FLAT, which is precisely
  what plastic does. Metal's highlights blow out toward WHITE while its
  shadows stay saturated and go redder. The palette is `goldHi` 0xf2e6c2
  (a cream with a fifth of the saturation left), `gold`, `goldM`, and
  `goldD` 0x4a3410 (nearly brown). Now: **0.77 / 0.80 / 0.24**, median
  216 → 146, spread 108 → 176.
  **If a metal ever looks like plastic, measure the saturation across the
  value range before you touch the value.** Two traps found doing it:
  a filter of `g > b*1.25` silently excludes the cream highlights, so the
  one number you care about never moves; and sampling the whole frame
  measures the sky, which is pale and warm and swamps everything.
  Two model lessons came with it: a darker PANEL laid over a flank stands
  proud of the serrations and buries every one of them — choose the body's
  value, do not paper over it; and a pistol whose slide and frame are the
  same length and height is an equals sign, not an L. The frame is 150
  against the slide's 262 and steps down off it, and the grip is DARK,
  which is what stops the gold halfway down.
- **AN OPTIC NEEDS AIR UNDER IT, AND THE LAUNCHER HAD NONE.** The RPG's
  rail sat straight on a 76mm pipe, so its sight line was barely two
  centimetres over the tube's own crown — and at ADS the sight line IS the
  middle of the screen, so the pipe rose to just under the reticle and
  filled the lower frame. Measured at full ADS, the crown in the near
  half-metre (the part that actually fills the picture, not the far end,
  which converges toward the vanishing point and tells you nothing): NDC
  **-0.26 → -0.58** once it was put on a bracket. When you measure this,
  force `FPS.ads` to 1 first — the launcher auto-reloads off a magazine of
  one, and `FPS.reloading` blocks the sights, so a timed wait catches the
  lerp mid-flight and reads a different number every run.
- **THE BRASS** (`SHELLS`, `shellPool`, `ejectShell`, `updateShells`).
  Fourteen cases in a ring buffer, thrown along the GUN'S OWN right and
  up — which in first person is the camera's and in third the hand's —
  tumbling under gravity, bouncing once off `heightAt` and lying down.
  - Where they leave is **`g.port`**, an anchor group on every gun model
    that each gun positions at its own ejection port. It must stay out
    of `vmParts` (the line in `buildGunModel` that collects the split's
    parts skips it explicitly) or the ADS squash reparents it and the
    brass starts pouring out of thin air.
  - `updateShells(dt)` runs in `frame()` under `G.mode==='play'||'dead'`,
    not inside the play branch: brass in the air does not care that you
    have just died.
  - **A CASE DOES NOT LAND ONCE, AND THAT WAS THE LAST THING WRONG WITH
    IT.** It hits, turns over, hits again and settles, and that short
    irregular run of re-contacts IS what brass sounds like — one tick on
    its own is a pebble, however well the tick is built. `shellDrop`
    plays two or three re-contacts, each quieter, brighter and closer to
    the last. The other half was a 45ms tone at 420Hz put in as "the
    case's mass": a cartridge is twenty grams of thin brass and has no
    mass to hear, and a low tone held that long is a wood block. All of
    its voice is high, dense and inharmonic (1 : 1.71 : 2.43) and over
    inside 25ms.
    **The run is only spent when a case has the air to itself.** A second
    throttle (`_shRun`, 420ms) beside `_shTink`: a carbine throws twelve a
    second and twelve runs of three would be gravel, so in sustained fire
    each case gets its single tick. Measured: one shot → one full run;
    twenty-four rounds held down → 39 sounds, 3 of them runs.
  - **IT WAS A SQUEAK, AND THE SHAPE WAS THE FAULT, NOT THE LEVEL.**
    `shellDrop` was two nearly-pure partials at 3kHz and 5kHz, each held
    around a tenth of a second — a sine that high, that clean and that
    long is a whistle at any volume. A case is mostly IMPACT (a broadband
    tick), its own small mass under it, and a brief ring over the top; the
    ring's partials are 2.37 apart, deliberately INHARMONIC, or the ear
    hears a note rather than metal. Nothing in it runs past 70ms. Shorten
    and lower the partials; never reach for the level.
  - **One sound per case, on its FIRST touch, and throttled** (`_shTink`,
    50ms). It rang on the bounce AND on the lie-down to begin with, which
    at a carbine's rate is twenty-four tinks a second and reads as
    gravel. `AudioSys.shellDrop` is deliberately tiny (peak .045) — it
    must sit under the report that threw it.
  - The rocket has no case: `ejectShell` returns on `g.rocket`.
- **THE RELOAD IS A MECHANISM, IN STEEL — AND THE NOISE BUFFER WAS WHY
  IT WAS PLASTIC.** `metal(t,{peak,f,q,dec,body,bodyAmt,click,nm})` and
  `mscrape(t,{...})` are declared beside `tone` inside the AudioSys
  closure; `rustle`, `slap` and `spring` beside them. Every reload, pump,
  bolt, shell and dry-fire sound is built out of them. `clack` survives
  as a thin wrapper onto `metal` (only `rocketIn` still calls it).
  - **`noiseBuf` IS BROWN NOISE.** Every sample is the last plus a little,
    so it has almost nothing above 2kHz, and every click that filtered it
    at 4–9kHz rendered near silent — what the ear got was the triangle
    tone under each one, and a soft pure tone IS the toy. `whiteBuf`
    (one second of white, built in `ensure()`) is what foley is cut from:
    `noise(...,{white:true})`. **Anything meant to be a click, a scrape or
    a strike wants `white`; the wind, the drone and the rumble want the
    brown.** If a mechanical sound ever goes dull, check which buffer it
    is cut from before touching a filter.
  - `metal` is modal: a white click (highpass 7.2k, 5ms), the strike
    (bandpass round `f`), five resonant modes at `[1,1.52,2.31,3.08,3.92]`
    — inharmonic, which is what a stamped steel part does and what stops
    it being a NOTE — at Q `q` (26), each gain normalised by
    `sqrt(q*24000/fm)` so a sharper mode is not a quieter one, and a
    lowpassed thump plus a small sine for the mass behind it. No triangle
    tone anywhere in a reload. **Do not add one back to "fill it out".**
  - Each stage is a small sequence — a catch releases, a part travels, a
    part arrives and stops dead — and **the arrival is always the loudest
    thing in the stage**: `magIn`'s SEAT, `rack`'s bolt INTO BATTERY.
  - **LEVELS ARE MEASURED IN 10ms RMS, NOT SAMPLE PEAK.** Rendered through
    the whole master chain in an `OfflineAudioContext` (the AudioSys source
    eval'd per sound, `started=true` so no ambient, one fresh context
    each): a reload's loudest 10ms sits at 0.04–0.07 against the M4's
    report at 0.09–0.14 — about half, which is where CoD puts it. The
    sample PEAK of the same sound ran 0.09 to 0.40 across repeats, because
    it is one random spike in the white click; it tells you nothing. The
    reload voices were at the report's level before (`rack` 0.078 RMS,
    peaks over the M4's) and every peak in `magOut`/`magIn`/`rack`/
    `rocketIn`/`shellIn` was scaled by .68. `gunEmpty` was .12 and
    rendered 0.017 — quieter than the hitmarker, for the one sound that
    says you are out — and is .34.
- **A HITMARKER THAT FIRES WHEN YOU HIT NOTHING IS WORSE THAN NONE.**
  `rocketBurst` ended with a bare `hitMark(true,false)`, so EVERY rocket
  flashed the red KILL cross and played the kill's falling pair — at a
  wall, at the dirt, at nothing at all. It is the one piece of the HUD the
  player trusts to say whether the shot counted. The burst now tracks
  `caught` and `slew` across its own enemy loop and reports what actually
  happened. Measured, the three cases: empty ground `''`, a survivor
  caught in it `'on'`, a kill `'on kill'` — where the committed build gave
  `'on kill'` for all three.
  **Any new thing that damages in an AREA has the same trap in it**: the
  marker belongs after the loop, not beside the effect.
- **AN EXPLOSION IS THREE LIVES WITH THREE CURVES, NOT ONE SPRITE THAT
  FADES.** The rocket's burst was a single glow scaled 2.4 → 7.4 over
  three tenths of a second: the largest round in the game looked like a
  muzzle flash on the ground. What reads as an explosion is a FLASH gone
  before you can look at it, a FIREBALL that swells fast and then eases as
  it burns out and climbs, and SMOKE that outlives both and is still
  standing a second later — and the last is what actually says something
  big happened, because it is the only part left when you look back.
  So `puff(colour, s0, s1, dur, rise, opacity, delay)` builds them as
  overlapping lives: a .10s white flash, a .42s fireball, a .60s darker
  heart, and five smoke bodies out to 3.2s, each rising further than the
  one before. The ease is `1-(1-q)²` — fast then slow, which is how a
  pressure wave actually expands; a linear scale reads as a balloon.
  Two rings, not one (a fast bright one and a slow wide one of dust), and
  `WX.flash` so it lights the whole field the way lightning does.
  **`AudioSys.quake()` is allowed here** — CLAUDE.md warns it off
  `ultraThud` because that fires on every swing, landed or not; a rocket
  lands about five times in a run and is an actual explosion, which is the
  one thing that rumble was written for. It is audio only: no hitstop, no
  camera shake of its own.
- **`AudioSys.hitmark(kill,head)` has been wrong in BOTH directions, and
  the answer is neither.** First it was two soft square blips, which the
  .50's own report walked straight over — a hitmarker that cannot be heard
  is the one thing a hitmarker cannot be. Then it was a clack loud enough
  to beat the gun, which beat everything else too: twelve of them in a
  magazine and a firefight is a woodpecker. What a shooter's marker
  actually is: SHORT (~40ms), DRY, and pitched high (a bandpass around
  3kHz) so it sits in a band the gun is not using and cuts through at a
  THIRD of the gun's level instead of shouting over it. Do not reach for
  the peak knob in either direction; reach for the band.
  The three must stay tellable apart at speed: one tick for a body, the
  same pitched up with a thin ring for a head, and for a kill a LOWER
  second tick a beat behind — the falling pair. `hitMark` carries `head`
  through to it and to `FPS.hitHead`, which is what colours the ticks
  gold.
- **The sniper is the one gun the FIELD answers**, and **THE TAIL IS
  DENSITY, NOT A COUNT OF ECHOES.** It was four returns at .14/.30/.52/.80
  — and four discrete events a third of a second apart are four ECHOES,
  which is a canyon, not a field. A field answers the way a room does: two
  or three early reflections you can still pick out, and then the density
  RISES until the returns run into one another and the rest is a wash
  coming down. So it is fifteen returns whose gaps SHRINK (each .72 of the
  last), none loud enough to stand out of the others, over the same total
  length. Each is quieter and DARKER than the last — distance eats the top
  end first, so the filter corner falls with the gain — and only the first
  four carry the low sawtooth, or the bottom end flutters. A long low roll
  runs under all of it. Without that tail a 96-damage round reads no
  heavier than the carbine: the weight of a rifle is in what comes back,
  not in the crack. **If it ever sounds like separate echoes again, add
  returns and close the gaps; do not move the four.**

- **A HOLLOW IS 85 AND A THROWER 70** (`Enemy`'s constructor), five swings
  of the greatsword and four. They were 64 and 52 — four swings and three
  — and at four a hollow is a door you open rather than a thing you fight.
  The brute is untouched at 140: the gap between a hollow and a brute was
  never the problem. Three things are tied to that 85 and must move with
  it: **the Barrett .50's 96 body damage** (it was the bone sniper; the
  KEY is still `sniper`, only the name and the model changed — its claim
  is one shot one body, and a hollow's life is deliberately just under
  it; the Kar98k's 60 is set so a hollow is TWO, and one in the skull), the red-boned
  multiplier (2.2, not 3 — at three a red hollow is sixteen greatsword
  swings, which is the same fight held down twice as long, and it is
  `Math.round`ed or hp lands on a fraction), and the README's gun table,
  which quotes rounds-to-kill. Marrow is NOT tied to it — the templates'
  costs and the cathedral's gate are unchanged, so the field takes longer
  to clear but opens at the same point.

- **THE 1911 IS NOT THE EAGLE IN BLUE, AND `shake` IS A MULTIPLIER.**
  `GUNS['1911']` (key `'1911'`, a string — `isGunKey` names it) is a
  9mm pistol on the UMP's pool: `RELOAD['1911']` is a `box` plan like the
  Eagle's, its `magAxis` is raked .20 to follow the grip, and `rlCarry`
  .55 keeps its short tang off the near plane the way the Eagle's does.
  Its palette is `blue`/`blueD`/`blueHi`/`walnut` in `gunMats()` — blued
  steel is a step DARKER than `M.gun`, not gold, and the panels are the
  one warm thing on it. A cut in the slide is the slide's own colour
  darkened and narrower than the slide (the Eagle's lesson).
  **THE FIRST BUILD WAS THE EAGLE'S SHAPE WITH THE COLOUR SWAPPED**, and
  a player said so. A palette does not tell two pistols apart; SHAPE
  does, and four things carry it: a NARROW ROUND-TOPPED slide (a .030
  body with a cylinder laid along its crown, against the Eagle's .046
  slab with a rib), a FRAME HALF THE SLIDE'S LENGTH with a stub of a
  dust cover, a LONG SLIM NEARLY-STRAIGHT GRIP (rake .20 against .30)
  with an arched housing and a lanyard loop at the heel, and a ROUND
  LOOP of a guard with the barrel showing through a bushing at the
  muzzle. If two guns ever read as one gun twice, change proportions,
  not colours.
  **THE COLT'S REAR SIGHT IS ONE NOTCH.** Two chamfered posts with a
  pale dot each (the Eagle's pattern) came up at ADS as two round-
  shouldered bars with eyes on them; it is a low bed with two square
  ears now, dark all over, and the front bead is the only pale thing in
  the picture. The Eagle keeps its own two posts — those were asked for
  as they stand.
  **THE EAGLE'S TANG.** Its hammer was a rod run right through the slide
  (`vmKnob` .050 across) with a dark block standing off it, and from the
  side it read as a second trigger at the back of the gun. It is a flat
  spur laid back over the beavertail now, in `goldD`, nothing crossing
  the slide, and the beavertail curls back and DOWN (rotation.x −.28)
  instead of standing out flat. Its name is "desert eagle" (`GUNS`,
  `HERO_OPTS`, the weapon bar's placeholder) — the key is still
  `deagle`. Its flash is the biggest of the pistols (.42 first person,
  .46 on the rig, `flashT` .08 against .05, `glowFlash` .7 against .45).
  **AND IT IS A SLAB.** The Mark XIX is 10.75in long, 6.25in tall and
  1.25in wide (Magnum Research's own figures) — a tall thin rectangle,
  and from the side one rectangle from the tang to a flat square
  muzzle. The model had a bore with a gas CYLINDER slung under it, which
  is a revolver's silhouette; a Desert Eagle's barrel is a solid block
  the full height of the gun with the gas system inside. So the front
  .128 of the gun is one `vmOct` .078 tall (`M.gold`, a step lighter
  than the slide so the seam reads), the slide behind it .050 tall over
  the frame, the rib runs the whole .288, the muzzle face is flat with
  the bore in its upper half and the gas port under it, the guard is a
  squared box with a hook forward, the grip .040 wide and flat-backed at
  rake .26 (the magazine follows it), the safety is on both sides and
  the ejection port is big. The `iron` group is untouched, so
  `sightZ.iron` (.0975) and the aimed picture are exactly what they were.
  Measured after: 75 meshes, `adsZs` .80, every mode boots clean.
  `fireGun`'s `G.camShake` is `R.cam*4*(g.shake||1)`: the Barrett
  carries 2.6, the SPAS 2.2 and the Kar98k 1.6, every other gun 1.
  Measured at the shot: 1911 0.18, deagle 0.28, ump 0.044, m4 0.096,
  spas 0.968, sniper 1.768, kar98k 0.768, rpg 0.36. The recoil itself
  (`rec`) is untouched — the shake is the picture, not the aim.
  **THE SHAKE IS AN ANGLE, AND IT IS THE SAME IN BOTH VIEWS**
  (`SHAKE_ANG`, .094 rad per unit of `camShake`, declared beside `VIEW`
  because both cameras read it). Behind the eyes it used to be a shove of
  the camera's POSITION by `.1*camShake` — a centimetre of travel read as
  nothing, so the Barrett's 1.77 barely moved the picture. Over the
  shoulder it was `.3*camShake` of position, which becomes an angle
  through the camera's distance: the brace brought the camera in and
  DOUBLED the shake (4.8 degrees aimed against 2.7 resting, at a held
  shake of 1), and the position is lerped from last frame's so the jitter
  smeared into drift. Now, with a gun in the hands, both cameras apply
  `SHAKE_ANG*camShake` of pitch and yaw AFTER aiming (first person scales
  it by `camera.fov/VIEW.fov`, so the sights narrow it on screen the way
  they narrow everything). Measured at a held shake of 1: first person
  1.8–2.0 degrees RMS, third 2.1 resting and 2.2 braced. A blade's camera
  keeps its positional shove — nothing about it was asked to change.
  **THE SHAKE IS THE PICTURE'S, NEVER THE ROUND'S.** `gunRay` read
  `camera.getWorldDirection`, so once the first-person shake became a turn
  of the look it bent real shots — about a third of a degree a round on an
  aimed carbine. The first-person camera writes `FPS.fwd` (the look from
  `FPS.pitch` and `G.camYaw`, no shake) and `gunRay` reads that behind the
  eyes. Measured: identical to the camera's direction calm; under a held
  shake the camera wanders 2.6 degrees and the ray does not move. Over the
  shoulder the ray always has a `base` and never read the camera.
  **To measure it**: hold `G.camShake` from a rAF tick and take the RMS
  angle of `camera.getWorldDirection` against the mean of ten unshaken
  frames. A single shot is useless in the harness: the two views run at
  different frame times and the shake is gone in two or three frames.
- **THE BOLT AND THE PUMP CYCLE AFTER THE SHOT, AND THEY USED TO DO IT IN
  SILENCE.** `FPS.boltT` ran and the bolt part moved, and nothing played
  a sound, and the case left with the report. Now `fireGun` sets
  `FPS.cyc` and `updateGun` fires the beats as `boltT` crosses them:
  `BOLT_UP` (.19) `boltUp`, `BOLT_EJECT` (.33) the case, `BOLT_DOWN` (.45)
  `boltDown`; the pump's sound at .1 and its case at .2. `ejectShell` is
  skipped in `fireGun` for a bolt or a pump. `boltCycle(V)` moves the
  bolt on those same beats (lift, then .085 back) for the viewmodel AND
  the rig's gun, and `boltCant()` (0..1 over .1–.8) cants the whole gun
  toward the working hand — `.3` of roll in `updateViewmodel`, `-.35` on
  the rig's weapon in `poseGunCarry` with the left arm and head going
  with it. That cant is what makes a turn-bolt READ as one from behind
  the eyes. Everything is gated off during a bolt-type reload, which runs
  the bolt itself. `gunSwapped` clears `cyc`.
- **A PISTOL'S SLIDE IS `slideA` INSIDE `slideG`**, the magazine's
  pattern: `slideG` is the vmPart the ADS split may move, `slideA` is what
  `slideMotion(V,g)` moves along +z by `g.slideTravel` (.046 on the Eagle,
  .036 on the Colt). Back in .03s, home by .13s; **held open on an empty
  magazine**; in a box reload held open until `act[0]` if the reload
  began empty (`reloadPlan` returns `empty`) and then slammed home in
  .05s, else racked as a hump over `act`. Anything that belongs to the
  SLIDE — body, top edge, serrations, safeties, port — goes in `slideA`;
  the barrel block, the rib and the frame do not, or they travel with it.
- **THE EAGLE'S RIB IS ONE PIECE, FLUSH.** It was a thin stick with its
  slots standing PROUD of it, which read as a loose part rather than as
  the top of the gun. It is one `vmOct` the full length (`RIB0`–`RIB1`)
  with a cream `goldHi` top strip broken at each slot, and the slots are
  `goldD` sunk a hair below that strip. Cuts go INTO a surface (the
  furniture rule above).
- **BLOWBACK IS `g.flip`, ON THE KICK TO THE POWER 1.5.** `updateViewmodel`
  adds `k*sqrt(k)*g.flip*(1-.45*ads)` to the pitch; it has to beat the
  `-k*R.up*.12` that dips every gun as the eye climbs. On the square the
  Eagle's barrel rose 15 degrees for ONE frame and was level in a tenth of
  a second, gone before the eye found it. Now (projecting the barrel
  through the camera, kick held): Eagle 25 / 8 / 1.5 degrees at k 1 / .6 /
  .3, Colt 10 / 5 / 1. `g.kickMul` multiplies `FPS.kick` in
  `poseGunCarry` so the pilgrim's arms take the same buck over the
  shoulder (Eagle 1.9, Colt 1.3).
- **THE ACOG IS FASTENED, AND NOTHING MAY CROSS THE BORE.** `sightAcog`
  builds a base on the rail, pedestals from `railY+.010` up to EXACTLY
  `ay-R` (the tube's underside, R .026), rings as tori OUTSIDE the tube
  (`R+.0035`), turrets standing off the tube's OUTER wall (`ay+R+.007`
  on top, `R+.0065` on the side). The first build pushed rings and
  turrets into the tube's radius, and down the scope they drew a dark
  shelf across the bottom and a block in the top of the picture — every
  part looked right from the side. `sightZ.acog` is still the eyepiece's
  rear (~zc+.068). **If the aimed ACOG ever shows anything inside the
  circle but the world and the reticle, look for a part whose radius is
  under R.**
- **THE BELL-CALLED'S THUMB IS SWUNG OUT, `rotation.y=-.95`.** It was
  `+1.1`, which swung it IN under the palm, and the measured tip sat
  inside the palm's own box — the hand had four fingers. Measured now in
  the palm's frame: root x −0.58, tip x −1.42 against a palm half-width
  of 0.53, tip 0.53m above the soil.
- **A CUTSCENE PUTS THE SIGHTS DOWN** (`cutPlay`, after its refusal
  check): `FPS.adsOn=false, ads=0, zoom=0, applyFov()`. It used to keep
  whatever lens the sights had — the Barrett's 8x is seven degrees — so
  the Bell-Called's roar was a jaw filling the frame. And `updateGun`'s
  own FOV write is gated `!CUT.on`, or it pulls the lens back the frame
  after. Measured: 7 and 30 before the scene, 68 through all of it.
- **THE BARRETT AND THE KAR98K ARE TWO GUNS, AND THE OLD SNIPER IS THE
  BARRETT.** Key `sniper` is the **Barrett .50** — the name and the model
  changed, the key did not, so every saved loadout and attachment choice
  survives. It is a SEMI-AUTOMATIC off a ten-round box now (`RELOAD.sniper`
  is a `box` plan, `g.handle` is the charging handle the reload racks,
  `rof` .95, no `bolt`), which is what an M82 is; the round, the glass,
  `inGlass`, the zoom and the field's answer (`AudioSys.gun('sniper')`)
  are untouched. `phos`/`phosD`/`phosHi` in `gunMats()` are its
  parkerising — grey-green black, no blue in it, no wood.
  **`kar98k`** is the new turn-bolt, on its own `792` calibre (7.92mm,
  `strong`, so a head under it comes off). The `bolt` reload plan moved
  to it unchanged. Three things about its model are load-bearing:
  1. **`adsEye` (.38) puts the eye back on the comb.** A Mauser's rear
     sight is out on the barrel (z −.136); the default `ADS_EYE` would
     have put the eye level with the ejection port. So the leaf and the
     hood read small and far — that IS the Mauser's picture.
  2. **THE COMB DROPS, OR THE STOCK IS THE PICTURE.** The first pass ran
     the wood up to the bolt (comb top .075 under a sight line of .0835)
     and at ADS the squashed butt stood in the middle of the frame as a
     wall the sight sat on — the UMP-receiver trap again, in wood. The
     comb is 40mm under the sight line now (.058 under .0975) and the
     stock is in the bottom quarter, where a cheek weld puts it. What
     squashes on this gun is the BUTT (`adsZs` .3), never the receiver.
  3. **`boltLift` gives the bolt's lift its sign.** Both bolt animations
     wrote `rotation.z=-1.1*lift`, which on a handle standing straight
     out to the right swings it DOWN (a −z rotation takes +x toward −y);
     nobody had measured it. The Mauser's handle is built turned DOWN,
     so a lift there is a rise: `V.boltLift` is +1.0 on it and the two
     sites read `(V.boltLift||-1.1)`. The handle is `M.grey`, not steel:
     at ADS it is the nearest thing in the frame.
  Sites that key on `'sniper'` by name (tracer colour and life, the hole
  size, the vibration, the two flash sizes) each carry a `kar98k` case;
  a new heavy rifle needs the same five.
  Measured: Kar98k reload well y −0.34..−0.02, hand in frame the whole
  reload; Barrett well −0.78..−0.50, hand in frame 72% (the M4's own
  figure is 76%); every mode boots with 0 errors.
- **THE METAL BAT** (`weapon:'bat'`, `batCharge:'homerun'`). It is its own
  `weapon()` — NOT mapped to `'sword'` the way the ultra is — so the
  greatsword's quake rumble (`weapon()==='sword'&&LOADOUT.charge==='quake'`)
  and its thrust multipliers never reach it, and every other rule falls
  through to the greatsword's default branch (the carry, the combo poses,
  the IK'd left hand). `chargeKey()` answers `batCharge`; the charge
  dispatch sends it to `startHomerun` right after Thor; `rig.bat`, reach
  2.2, grip -.24..05. `meleeHit` never rolls `severLimb` for it (blunt)
  and plays `AudioSys.batPing` over `smack`; `BLADE==='bat'` gives
  `swing`/`heavySwing` the hollow `batCut`.
  **THE HOME RUN** (`homerun` state, `homeRun`, `homeRunOK`,
  `homeRunStreak`, `HOMERUN_V`/`HOMERUN_UP`, `BAT_LOAD`, `HR_KEYS`,
  `HR_HIT`, `poseBatCharge`, `poseHomerun`). `meleeHit` takes
  `opts.homerun` (full charge) and `opts.homerunDmg`; a target that
  `homeRunOK` (humanoid, headed, not boss/mini/crow, not scattering or
  rising) and is either under a full charge or dies to the blow is
  handed to `homeRun` BEFORE `takeHit`, the reaper's pattern: hp parked
  at 999 across `severLimb` (which kills on its own and would count the
  marrow twice), then `die()`. `severLimb` takes a fifth argument,
  `launch` `{vx,vy,vz,snd,spin,onPiece}`, which `loosePiece` flies
  instead of the usual toss; `loosePiece` only `pushOut`s within 2.5m of
  the ground now, or a head forty feet up is shoved out of the trees
  under it. Measured: heads land **41–47m** out, peaking **7–8m**, over
  about 2.3s; a half charge leaves a healthy hollow at 55/85 with its
  head on and takes the head off one at 20.
  **THE POSES ARE SOLVED AND MEASURED, AND THE FIRST PASS WAS WRONG BOTH
  WAYS.** Written by eye, the load pointed the barrel forward and DOWN
  (.24, −.40, .88 in the rig's frame) and the strike pointed it at the
  sky. `BAT_LOAD` came out of a search for the hand at the right shoulder
  (−.34, 1.62, −.16) with the barrel up and back (−.25, .78, −.57). And a
  batter drops the barrel into the SLOT before it comes round, which a
  sword never does: straight out of the high load the bat met the body
  tilted 30° at the sky. So the swing is FIVE keys (`hrK`) — load,
  hitch, slot, through, follow — and the slot and through keys are the
  greatsword sweep's own windup and strike, whose barrel travels right →
  front → left. It now crosses dead ahead at `HR_HIT` (.38), head ~20°
  below the hands, which is where a real bat meets the ball.
  **If you touch either pose, trace the barrel**: `(0,−1,0)` through the
  weapon's world quaternion, with the root at the origin facing +z.
  **Harness trap:** `IN.chargeHeld` set before a frame is wiped by
  `Input.poll`, so the charge releases on the first frame as a TAP. Set
  `player.state='charge'` and `chargeT` to what you want and let the next
  frame release it.
  **THE BAT'S CARRY IS ITS OWN (`BCARRY`, `poseBatCarry`).** It wore the
  greatsword's `CARRY`: the arm straight out, the hand 0.61m in front of
  the chest and the bat laid nearly flat back through the neck — a yoke.
  A greatsword is long enough to reach the shoulder from there; a bat is
  not. `BCARRY` was SEARCHED against three targets in the rig's frame
  (facing +z, right is −x): the hand at (−.14, 1.36, .26), the ELBOW at
  (−.36, 1.26, .03) and the barrel up and back (−.20, .79, −.58). Without
  the elbow target the search tucked the elbow inside the ribs (−.11,
  1.32, −.08). Getting the elbow out AND the hand in needs a shoulder
  TWIST, `aRy` .69, and `resetPose` writes no twist — so `poseBatCarry`
  applies it in the `free` state only (and the pause portrait). The
  swings start from the rest of `BCARRY` and the springs carry the twist
  off; verified by rendering a combo, and the home run is unchanged
  (41–51m). Both hands stay on the handle through the grip IK.
  **THE FINISHER SHATTERS (`batShatter`, `flyBone`, `SHATTER_KEYS`).**
  The execution's bat branch calls `die()` with `noRag` FIRST, then
  takes the rig apart, then hides the root and sets `crumbled` — the
  split branch's ending. Three things about it are load-bearing:
  - **Every detached joint group is replaced by an empty STUB**,
    severLimb's pattern. The dead body's pose code keeps writing
    `r.armR` and friends every frame; without the stub it writes into
    the bone in flight and the piece stops tumbling.
  - **Deepest first** (`SHATTER_KEYS`: weapon, forearms, head, upper
    arms, shins, thighs, torso, body), so a forearm leaves before the
    arm it hangs from and the arm takes only its own meshes.
  - **`flyBone` re-pivots each piece about its bounding box's middle.**
    A joint group's origin is the JOINT, at one end of the bone:
    `loosePiece` snaps its rotation to a quarter turn, so a forearm
    pivoted at the elbow and snapped upright stood half in the soil.
    `flyBone` settles every piece FLAT (x to ±π/2, z to 0) at a rest
    height of half its own thickness. Measured: 11 pieces off a hollow,
    every one lying within −0.04..+0.01m of the soil, the tallest 0.38m
    (a ribcage on its back), the skull 18.8m out.
  The eyes and anything additive are put out, not flown. Materials are
  cloned with the flash cleared. Pieces fade at 20s and are gone at 23.
  `AudioSys.shatter()` is the blow; `boneLand(v)` is each landing,
  throttled at 55ms, because eleven pieces land inside a second.
  **A CROW MET BY THE BAT IS BATTED (`Crow.batted`, state `batted`).**
  `meleeHit` sends any bat blow on a crow there, right after the home run
  check, so the charged swing takes crows too (`homeRunOK` refuses them).
  `batted` calls `die()` first (marrow, the drop, the kill) and then
  overrides the state: the crow flies ballistic at 15–18.5m/s, tumbling
  (`rx`/`rz` into the root's rotation, wings splayed at 1.45) with
  `homeRunStreak` on its root. It lands as `dead` at `t=.9`, so the dead
  branch bursts it on the next frame. **`constrain` is skipped while
  `batted`** — pinned at the rim it would stop dead in the air — and
  `groundGone` decides whether there is soil to land on. Measured: 23.1m
  out, 3.6m up at the top. A sword on the same crow still only wounds
  it.
- **THE RAVINE (`RAVINE`, `ravineStart`, `PATH.rav`, CHUNKS.`ravine`,
  `viaduct`, terrain feature `t:'ravine'`).** A path-only tile kind that
  comes in RUNS of 2–5 tiles, in three variants (maple / shale / birch).
  Load-bearing, in the order they bit:
  - **ONE terrain feature per RUN, not per tile.** Pushed into
    `PATH.terrain` when the run starts, it spans the whole run and eases
    in only at the run's two ends (`tp` 12m), so the walls run unbroken
    across every join. It rides in the LAST tile's `t.terrain`, because
    teardown drops a tile's features from `PATH.terrain` — in the first
    tile's list, the walls would vanish from under the tiles still
    standing. A run never crosses a cathedral: `ravineStart` shortens it
    to the room before the next `k%cathEvery===0`, and refuses under 2.
  - **THE UNDERPASS REACHES ±28m FROM ITS TILE'S CENTRE**, so it is only
    ever the middle of a run (never tile 0 or n−1, runs of 3+), where the
    run's walls stand under all of it. Its tile's `heightAt` must answer
    for the neighbours' ground, which is why the feature is per run.
  - **THE KIND IS ROLLED FIRST, AND THE RAVINE ON ITS OWN HASHED
    STREAM.** `rnd` is an LCG. Rolled second on the tile's stream, the
    kind came out graves ×5, chapel ×3 — the second draw after a reseed
    is correlated tile to tile. And a stream seeded by tileSeed's xor put
    every run in the same slot of the six-tile block (the two before a
    cathedral, and so never long enough for an underpass). `hash32`
    (a murmur-style finaliser) seeds the ravine's stream. **Any new
    per-tile roll wants its own hashed stream, not the second `rnd()`.**
  - **EVERYTHING IS BUILT INTO ONE GROUP AND `bakeStatic`'d.** bakeWorld
    is off on the path (it would break tileCapture's index count), but
    bakeStatic on a group that is itself one world child is safe: the
    child count and the shift are the group's. Measured by counting the
    visible meshes each tile owns: a ravine tile 6–20, a wood tile 128, a
    cathedral 160. The TRIANGLES are the cost: the whole frame reads
    24–36k in a ravine against 12–14k on an ordinary stretch (the ICO
    crowns and the highway's boxes). Do not add crowns or bents freely.
  - **Trunks are obstacles tagged `wood`, NOT `tree`.** `markTree` and
    `fellTree` need the trunk mesh in the scene, and the bake has taken
    it out; `meleeHit` gives a `wood` obstacle a hit and no mark, and no
    metal clang. Columns are `stone` (sparks, a bounce, cover).
  - The chunk runs BEFORE the tile's road is laid, so `clearSpot` knows
    nothing of the trail: the chunk's `free()` keeps |x|≥2.6 itself, and
    the viaduct skips any bent with a column at |x|<2.6 (or past the
    rim, |x|>21) — the deck spans the gap.
  - Materials are made once per `buildWorld` (`ravMats`), from `lam`/`mat`
    with a map, so they share programs already linked. Leaves are
    painted GREY and tinted per variant (a green texture tinted orange is
    mud); snow lerps the tint .72 toward white. Concrete and birch carry
    a darkening `color` — both burned out to near white in a noon sun.
  - The graffiti textures (`tagA`, `tagB`) are drawn in METRES on the
    .85×3.2 foot block (`tagCtx` squashes the canvas by .85/3.2), or a
    box face stretches every flower into an egg.
  - The trail is `layRoad(...,'gravel')`; `rm.userData.tex` is what the
    snow swap restores, so a ravine's trail comes back as gravel.
  Measured: 0 errors walking 4km / 118 tiles of seed 2, and no ravine
  feature left in `PATH.terrain` behind the pilgrim.
- **THERE IS NO BLADE VIEWMODEL** — see *THE FIRST-PERSON SWING IS THE
  THIRD-PERSON SWING*, far below. `VM_BLADE`, `ensureBladeVm`,
  `bladePose`, `VM_SEAM` and `SW_FLIP` are gone. The one thing worth
  keeping from that pass: a clone of the real weapon half a metre off the
  lens covers 0.77 of the screen's width and **2.13 of its height** (the
  ultra 1.17 x 3.12), measured by projecting its world box through the
  camera — which is how to check ANY of this, and why a carried clone
  always needed a scale of its own while the real weapon, at its real
  distance, needs none.

- **THE ICON IS PAINTED BY A SCRIPT, NOT DRAWN** (`tools/make_icons.py`,
  output in `icons/`, wired up in the `<head>` and in
  `manifest.webmanifest`). It is the only thing beside `index.html` that
  the site serves, and it exists because a home screen reads an icon
  before the page runs — so it cannot be built at boot like everything
  else. It is still procedural: a 64-cell grid of superellipses, distance
  fields and ordered dither, scaled up nearest-neighbour the same way the
  game upscales its 383x216 buffer. Re-run the script rather than editing
  a PNG; nothing else should ever write into `icons/`.
  - **A GAP THINNER THAN ONE CELL IS NOT THERE AT ALL.** The teeth were
    given their true proportions first time — a hairline between each —
    and at 64 cells every gap fell between the sample points: the jaw
    rendered as a blank pale slab with nothing wrong in the source. One
    cell is `1/SKS` = 1.32 skull units, so a gap must be at least that
    wide. Same trap waits for the bite line and any suture. If a detail
    is missing, measure it against the cell before anything else.
  - **A SMALL CIRCLE CUTS A NOTCH, AND A NOTCH READS AS AN EAR.** The
    temple pinch is struck from (±24, −3) with r 9.2 — a long way out, so
    the arc is nearly flat where it bites. At (±21.5, −3) r 7.2 it took
    the same 3-cell bite out of the silhouette but left a visible step,
    and the skull grew ears.
  - The face is lit twice: once by a distance field (depth inside the
    silhouette → surface normal, so a head-on skull still has a near
    side) and once from inside by its own sockets. Drop the second and it
    reads as a pale cut-out rather than a lit thing.
  - `manifest.webmanifest` is a real file now. It was an inline
    `data:application/manifest+json` URI, and a data URI has no base, so
    relative icon paths in it resolve against nothing. Do not put it back.
  - The maskable variant paints the WHOLE picture at 78% (`paint(0.78)`),
    not just the skull — a launcher may crop to the middle 80%, and what
    it is allowed to take is the arch's legs.

- **DEFENDER (`DEF`, `?mode=defend`, THE MIRE, THE HOUSE, THE ROUNDS, THE
  SHOP — five headed sections above the pews).** A third mode-as-a-page
  beside the field and the path. Traps, in the order they bit:
  - **Every `if(!PATH.on)` in `buildWorld` is a field-only gate, and most
    of them had to become `!PATH.on&&!DEF.on`.** The wedges, the piles, the
    three landmarks, `makeFogGate`, `spawnEnemies`, the 800-marrow angel.
    Search for `PATH.on` before adding anything to the field.
  - **The cathedral is not built, and neither is its footing — but the
    plinth still exists in the RULES.** `heightAt` answers PH inside the
    PW/PL rect, `constrainCath` pushes bodies off its rim, `onStone` is
    `cathDist<4.5`, `camStone` is the hall's shell. Every one of them
    returns early in the Mire (`heightAt` → `mireGround`, `constrainCath`
    → return, `onStone` → false, `camStone` → false). The first build kept
    the plinth and stood the house on it, and the Drowned had to clamber a
    half-metre step to reach a wall; the house stands on the soil now.
    **If anything in the Mire ever floats or sinks by 1.2m, a PH rule has
    leaked through.**
  - **THE HOUSE IS AT `MIRE.hx/hz` (0,−27), NOT THE ORIGIN.** `buildHouse`
    builds in the group's own frame and carries `ox/oz/oy` into every
    registry (`addWall`, `addObstacle`, `addBreakable`'s x/z) — the
    segments' `x/z` are WORLD, their planks are LOCAL, and `roofFall`'s
    bay test subtracts `HOUSE.oz`. `mireGround`'s rise is an oval about
    the house and the yard (`MIRE.yardZ`, −8), flattened to `MIRE.pad`
    under the house; the three lanes (`MIRE.lanes`) fan SOUTH from the
    yard. The field's ring road and quarter roads are gated `!DEF.on`.
  - **Everything spawns in the south** (`spawnDrowned`: a lane bearing
    six times in ten, else `π/2 ± .8`, 30–38m from the yard) and
    `defBossSpot` walks out from the house THROUGH the pilgrim and rejects
    anything north of the house's back wall. The pilgrim starts in the yard
    facing south (`G.checkpoint` beside the house's front door).
  - **THE NAVE TRIGGER.** `frame()` starts the Warden fight when the
    pilgrim stands inside the HW/HL rect with the cathedral open — which
    in the Mire is the inside of the house, and `boss` is null there. It
    took the game down the first time anyone walked indoors. Gated on
    `!DEF.on`; `G.bossActive` must never be set in the Mire (it clamps the
    camera and the pilgrim into a nave that does not exist).
  - **A round's boss is a `mini`, never `G.bossActive`.** The Warden is
    `new Enemy('boss')` with `mini=true, engaged=true, name`, so
    `updateHUD`'s mini bar carries it; its `die()` skips `onBossDead` in
    the Mire; `constrain(this,this.boss&&!DEF.on)`. The Mother is a
    `zombie` with `mother:true`, likewise. Cycle scaling multiplies
    `maxHp` after the summon.
  - **The Mother breeds from `update()`, not from her walk.** Ticked in
    `zombieMove` she only bred while in `chase`, and a Mother kept busy
    swinging never bred at all (measured: 4 → 0.83 on the timer in six
    seconds of `chase`). `breed(dt)` runs every living frame outside the
    rise and her cutscene.
  - **The player's blade and rounds never damage the house.**
    `strikeBreakables` skips `b.noPlayer`; only `bashSeg` (from the
    Drowned's `bash` strike, and `breakPew` for kind `house`) does. A
    fallen segment is REMOVED from `breakables` and `obstacles` and put
    back by `mendSeg`; `HOUSE.segs` holds all twelve regardless. Roof
    meshes are `name='roof'` so the static bake leaves them out.
  - **Stuck on a tree.** A body steering straight at a wall through the
    wood is pushed out of a trunk and steps back into it for ever —
    measured, two of six stood at 28m for a whole wave. `zombieMove`
    watches the ground covered and takes a 1.3s sideways detour after
    1.5s of going nowhere. Any new siege-walker needs the same.
  - **A dead `#shop` CSS block from the old marrowfire offerings was
    still in the stylesheet** and overrode the new overlay (a 380px
    centred box). It is deleted. The shop borrows the pause panel's rules
    by selector (`#pause X,#shop X`), and `setPaused` refuses while
    `DEF.shopOpen` so the two overlays cannot stack; Esc closes the shop
    first.
  - **`DEF.might` is applied in every horror's `takeHit`** (`heroDmg`, six
    classes — Enemy, Crow, FallenAngel, GraveGhoul, BoneHand, GiantSkull),
    not at the producers: arrows, bubbles, bolts, the katana's throw and
    the shockwaves all land there, and a new weapon gets it for nothing.
    Do not also multiply at a call site or it stacks. `player.init` forces
    the greatsword when the saved weapon is not owned; `cycleLoadout`
    filters `HERO_OPTS.weapon` by `DEF.owned` in the Mire.
  - Spawn is 30–38m from the yard; at 43–52 from the house a round-one
    wave took forty seconds to arrive, which is a long time to look at
    water. The bog slows the Drowned to .82, the pilgrim to .6.

- **MARROW IS ESSENCE (`MARROW`, `shedMarrow`, `updateMarrow`, beside the
  marrow drop).** Every horror's `die()` calls `shedMarrow(this,amount)`
  in place of `player.marrow+=`; nothing else may add marrow for a kill.
  The motes are one `Points` buffer (`MARROW.N` slots, unused parked at
  y −999), three phases — `fly`, `rest`, `home` — and a toast and a sound
  are throttled over the collections rather than fired per mote. Home
  motes ignore walls (it is essence). If the field ever feels short of
  marrow, motes are lying out in the water or over the rim: the cap
  (`N`) sends the eldest resting mote home of its own accord, and the
  wade is deliberate.
- **The Mire's second pass, for whoever tunes it:** stakes are
  `HOUSE.stakes[lane]`, built by `buildStakes(i)` and never mended —
  `segFall` nulls the slot and drops the group; `siegeTargets()` is what
  the Drowned pick from (walls plus stakes). Which side of a target a
  body stands on is the sign of `dot(body − target, outward normal)` —
  no house-rect test, so the same rule serves a stake in the yard and a
  wall with a Drowned already indoors. A ROOF target is a pseudo-segment
  `{roof:sec,…}` with a zero normal, so the near point is the body's own
  feet and it bashes where it stands; `bashSeg` branches on `s.roof`
  first. `DEF.heavy` is the round's lane and `laneLamps(i)` recolours
  the lane-head lanterns (`MIRE.laneLamps`, returned by `lantern()`).
  Variants are `opts.variant` on a zombie (`runner`/`hulk`) and read in
  five places in the constructor; the runner is `hunting` always. The
  hearth is `HOUSE.hearth`, healed in `updateDefend`, put out by
  `hearthOut()` from `roofFall` (its own bay) and `houseFallen`. The
  window pass is in `hitscan`'s breakable loop, keyed on `b.win` and the
  pane's band (`oy+1.72..2.58`, `|off|<.8`). `defBoss` is the TELL and
  `defSummon` the summon; `DEF.tellSpot` is chosen once so the rings and
  the thing agree.

- **THE PHANTOM HALL, AND TWO MORE THINGS THAT WERE THE CATHEDRAL'S.**
  `bladeMeetsStone` tests "the hall's walls" geometrically off HW/HL —
  and in the Mire that rect stands invisible across the yard's flanks,
  so every swing there bounced off nothing. Gated `!DEF.on`. **Any rule
  that reasons from HW/HL/PW/PL/PH is a cathedral rule and needs the same
  gate**; grep those names before trusting a new mode.
- **A PARRY IS A BLOW AIMED AT YOU.** The rule was "the horror is
  mid-windup or striking", and a Drowned pounding a WALL is exactly that
  for most of its life — so every cut on one clanged, halved its damage
  and froze the frame, and the blade read as bouncing off bodies. It now
  also asks that the attack is not `bash` and that the horror is FACING
  the pilgrim (within a radian). Tune that arc, not the state test.
- **The over-the-shoulder mark is SMOOTHED** (`FHUD.sx/sy`): the ray
  meets the skull's sphere one frame and the trunk's the next as a body
  bobs, and the reticle leapt a head's height with it. It eases at 16/s
  and snaps only on a jump over a fifth of the screen (a new target).
- **THE PANELS ARE TABBED** (`.tabs`/`.tab[data-t]` and `.col[data-t]`,
  `panelTab(root,t)`, remembered under `bp_tab_<id>`). The pause screen
  is four sections — the pilgrim (portrait beside its selectors), this
  run, controls, the field — and the shop three; one shows at a time.
  The `.panel` is a flex column: `.cols` scrolls and `.btns` is pinned,
  so Resume is never below the fold on a 390px phone. Every id the JS
  reaches (`heroView`, `sel*`, `ps*`, `sh*`) is unchanged; the second
  pause column was split at "The field (testing)" into its own tab. The
  title's three ways are CARDS with their own blurbs, so the two JS
  writes into `#titleHint` are gone and the hint is one generic line.
  **A harness that clicks the middle of the title screen now presses the
  middle CARD and reloads into the path**; press `#modeDefend` (or the
  card you mean) by id.

- **THE WEAPON VANISHED AFTER A BACKSTAB, AND IT WAS A THREE-ENTRY
  ARRAY.** The pose springs keep `rig._sm[joint]` as SIX numbers — the
  pose and its velocity. The backstab's aim (and the arm IK's two
  snapshots) wrote `[x,y,z]`, so `p[3]` was `undefined`, one spring step
  made the joint NaN, and a NaN matrix draws nothing, silently, for the
  rest of the run. Reproduced: after a backstab `rig.weapon.quaternion`
  read null/null/null/null and so did `_sm.weapon`. Every snapshot is
  six wide now and the spring rebuilds any state that is short or
  non-finite from the pose. **If a limb or a blade ever vanishes with no
  error, read `rig._sm[k]` for NaN before anything else.**

- **THE FIRST-PERSON SWING IS THE THIRD-PERSON SWING. THERE IS NO
  VIEWMODEL AND THERE MUST NOT BE ONE AGAIN.** Three were built and
  thrown away before this. The first turned the blade about its own
  length: sampled frame by frame the pitch never moved, all the motion
  was a yaw and a roll, and the blade at the carry pointed **(−.32, .54,
  −.78)** from the grip — mostly ALONG the view — so a yaw and a roll
  spin a stick about itself. The second gave it a real arc but a
  hand-written one, a table of axes and angles per combo: a SECOND
  animation beside the body's, which can never match it. The third read
  the motion off the rig (`bladePose`, `root⁻¹·weapon` laid onto a carry
  in the eye's frame) and was the closest, but it still carried a clone
  on the camera at its own scale, with its own gain, its own seam blend
  and its own three pages of notes.
  **Now the camera is simply put at the eye and the pilgrim's own body
  and his own weapon are what you see.** Whatever happens over the
  shoulder happens behind the eyes, because it is the same rig, the same
  pose, the same springs and the same steel. Every state, every weapon,
  every chain comes free and can never disagree with the body.
  What the earlier notes gave as reasons this could not work, re-measured:
    - **"the body encloses the lens" — WRONG, and it was a bounding
      SPHERE.** Boxes say the head holds the camera and nothing else does;
      the nearest part after it is 0.63m away.
    - **"at rest the weapon is BEHIND the eye"** (the sword's nearest
      point 1.10m behind the lens, the ultra's 1.49m) — TRUE, and not a
      fault. A man with a greatsword on his shoulder cannot see it
      either. Measured through a cut it comes round: nearest point 0.38m
      in FRONT at the strike, the whole weapon across the picture.
  **What IS true, and is the price:** the greatsword's arc lives at chest
  height and the eye is 40cm above it, so an UNLOCKED, level swing reads
  in the bottom third of the frame — measured, the weapon's on-screen
  box centres at y −1.0 to −2.6 through the cut. **Locked it is right**,
  because the lock tips the eye 6–9 degrees down onto the chest and the
  arms and the blade come up into the picture with the horror. If a
  swing ever looks empty, check whether the shot was locked before you
  reach for a pose. And at REST there is no weapon in the frame at all,
  which is also correct — see the carry, above.
- **BEHIND THE EYES THE PILGRIM IS TWO ARMS AND A WEAPON** (`fpsMaskRig`,
  `fpsMaskSet`, beside `syncFpsRig`). The keep-list is `rig.armR`,
  `rig.armL` and everything under them; the rest of the rig goes onto a
  layer nothing draws. Forty-seven meshes of eighty-three on the knight,
  fifty-two with the katana, forty-five on the wizard.
  It got there in two steps, and the first is worth keeping because the
  second does not replace it. The lens at 1.74 is inside the head AND the
  top of the trunk: measured at rest, ONE collar plate covered **0.65 of
  the screen** and the next 0.46, both straddling the near plane, and the
  picture was a teal wall with a strip of field over it. Cutting
  everything above the eye line fixed that — and left the tabard, the
  skirt and the greaves swinging across the lower frame, which is armour
  you do not need to see to fight. So the body is not drawn at all now.
  **THE ARMS ARE STILL CUT AT THE EYE LINE**, because the pauldrons top
  out at 1.92 and would straddle the near plane exactly as the collar
  did; the WEAPON is never cut, whatever height it reaches.
  Three things about it are load-bearing:
  1. **The line is taken off the LIVING rig, not the fresh one.** A rig
     straight out of `makeKnightRig` stands 19cm lower than the same rig
     once the game is posing it — the shoulder plates that come up at 1.92
     in play top out at 1.73 on the workbench, UNDER the line, and the
     first pass cut nothing. It is built the first frame it is wanted,
     against `heightAt + FPS.eyeY`, after a quarter-second of standing in
     `free` so the springs have settled.
  2. **The box is recomputed by hand.** `Box3.setFromObject` trusts a
     geometry's cached `boundingBox`, and the rig's are stale.
  3. **IT IS A LAYER, NOT A `visible` FLAG.** A masked mesh goes to layer
     3, which no camera pass renders, so it can never fight the fourteen
     places that write `visible` on a rig, nor a severed limb, nor the
     LOD. Each mesh remembers its own mask and is put back to exactly it.
  **And the GUN puts itself away.** `updateViewmodel` is the only thing
  that writes the viewmodel's visibility and it runs inside `updateGun`,
  which a blade never calls — so a viewmodel raised once stood on the
  screen for ever, with every gun in the rack showing at once because
  none had been picked. `syncFpsRig` clears it.

- **A BLADE BEHIND THE EYES KEEPS THE SHOOTER'S BUTTONS, AND THIS WAS
  TRIED BOTH WAYS.** For one build the four went away and the right thumb
  carried the third-person gesture behind the eyes as well — flick to
  roll, tap to strike, hold still for the heavy, hold and drag for the
  eye. It works, and it is wrong: in first person the thumb is the LOOK,
  and a gesture that has to decide what it is costs you the look for
  `HOLD_MS` (240ms) every time, while anything fast enough to turn
  quickly reads as a dodge (26px inside 220ms). They are back.
  So the gesture is born `'cam'` whenever `fpsMode` — the whole right half
  is the look, at once — and the buttons do the rest: either TRIGGER
  strikes, either one HELD past `HEAVY_HOLD` (180ms) also winds the heavy
  (the press still swings at once, because a tap must never wait to find
  out what it was, and the hero only reads `chargeHeld` back in `free`),
  the AIM button is the charge (`#fpsCtl.blade>#fbAds span.t::after` adds
  " / charge" to its label), and the ROLL button dodges. On a keyboard L
  winds in either view, except behind the eyes with a GUN, where it is
  the sights.
  **`fireDownT` is stamped in `fireDown()`, not at one button.** It used
  to be set only by the right trigger's own pointer handler, so a LEFT
  trigger tap after any earlier right-trigger press read as a heavy
  already held past `HEAVY_HOLD` and wound the blade on a tap. It is the
  moment the FIRST thumb went down, whichever button that was.

- **THE LOCK IS THE FOLLOW CAMERA'S LOCK, IN EITHER VIEW, AND THERE IS NO
  SWITCH.** `updateLock`'s only special case now is a GUN behind the
  eyes, which locks nothing (the crosshair IS the eye there, and an eye
  that leans on its own would pull every shot off the mark). Everything
  else runs the one rule, so the leaving (`LOCK_LEAVE`), the stickiness
  and the half-second a fallen horror keeps the eye are the same wherever
  you stand.
  **AND IT LOOKS AT THE CHEST, NOT THE HIPS.** The aim point was a flat
  `foeY + .95` (1.4 for a big one) while the eye sits at 1.74 — so the
  lens tipped DOWN onto every horror it held and you fought a pair of
  boots. It is `markY(L) − LOCK_CHEST` (.4) now: `markY` already knows
  what it is looking at (1.9 over a hollow, 2.3 a brute, 3.6 the Warden,
  its own for a crow or a heap), so a hand's drop under the ring is the
  chest of whatever is there. Measured on a hollow: at 2.1m the pitch
  goes **−20.3° → −6.2°**, at 1.7m **−26.4° → −9.4°**, at 4.8m
  **−11.0° → −4.5°**, and at 4.8m the whole body is inside the frame
  (feet −0.54, crown +0.13 in NDC).

- **THE RISE IS A LEVER BEFORE IT IS A LIFT** (`RISE_UP`, `riseUp`,
  `riseRate`, `RISE_DEEP`, `RISE_CLAW`, `RISE_PLANT`, `plantHand`,
  `riseToWalk`, `poseRise`). A hand breaks the soil and claws; the thing
  scrabbles its shoulders clear; then it puts ONE HAND FLAT ON THE GROUND
  and straightens that arm, which is what actually brings the trunk out;
  the second hand joins it and the two press the hips clear; and the last
  beat is the hands leaving the soil and the pose walking away.
  1. **THE CLIMB CAME BACK TO ZERO BETWEEN HEAVES.** It was
     `up=max(h1*.3,h2*.6,h3)` where every `h` was a bump that returned to
     zero, so the body climbed a third, sank to the BOTTOM of its hole,
     climbed two thirds, sank to the bottom again, lay buried for a beat,
     and then glided the whole way up on one ease. Measured over sixty
     samples: **0.95m given back — the entire gain — and 21 of 60 frames
     travelling DOWNWARD.** That is the whole of "it floats up and down".
     `RISE_UP` is a table of (time, height) and the interpolation is
     ASYMMETRIC because the halves of a failed lift do not look alike: a
     heave is explosive and runs out (ease-OUT), a slip holds an instant
     and then lets go (ease-IN). Now **0.17m of 2.10 given back on a
     hollow and 0.25m of 3.00 on a brute** — 8% of the climb, all inside
     the designed slips — and the floor of the grave is never touched
     twice.
  2. **`RISE_DEEP` IS PER METRE OF RIG (`*r.s`), NOT METRES.** The head's
     crown stands 1.89m above the root in this pose (2.53 on a neutral
     rig — the fold drops it), and the depth was a flat 1.55: the skull
     was **34cm PROUD OF THE SOIL on the first frame** and the first thing
     out of a grave was a face. A constant is only right for one body — at
     2.05 a brute, whose crown is 2.85 above its root, stood most of a
     metre out before it began. At 2.271 of its own scale every body
     starts with its crown half a metre under, measured hollow −0.87 and
     brute −1.13.
  3. **THE TRUNK FOLD EATS THE REACH.** The body is folded `RISE_FOLD`
     (1.3) over itself all the way up and that fold is what keeps the head
     down — so an arm "raised overhead" at `armR.rotation.x = -2.75` comes
     out nearly HORIZONTAL and the hand cleared the soil by **4cm**; what
     you saw was the weapon lying flat on the mound. Swept WITH the fold
     applied: −3.2 puts the hand 0.79m proud, −3.6 1.20m, −4.0 1.36m, the
     head still 0.22m under at all of them. **Sweep the shoulder with the
     fold applied, never on a neutral rig** — a neutral sweep says −2.75
     reaches 3.72 above the root and is useless. `RISE_CLAW` is a PULSE
     over the breach alone, and it is .45 and not .95 for a resolution
     reason: at .95 the hand stood 1.42m proud and at 383x216 what came
     out of the ground read as a FENCE POST. Anything thrust out of the
     soil has to be a DIAGONAL at this size.
  **A PLANTED HAND IS A CONSTRAINT, NOT AN ANIMATION**, which is why
  `plantHand` bisects the shoulder every frame instead of playing a curve.
  A hardcoded angle table was written and thrown away: hollows randomise
  their scale and a brute is not a scaled hollow (its planting band is up
  .42–.66 where a hollow's is .46–.78), so one table is wrong for almost
  every body in the field. Measured, both hands now hold the soil to
  **±2cm on the right and ±5mm on the left** across their presses.
  Five things about it each cost a measurement:
  - **THE TARGET IS 0.** The root carries the BURIAL OFFSET, so the soil
    is y=0 in the rig's own frame and the game adds the ground height
    afterwards. Solving against `-gy` — which looks reasonable, and was
    the first version — pins the hands a metre ABOVE the ground: the right
    hand ran −1.00 to +0.59 with a mean of +0.26 where every sample should
    read 0.
  - **THE TIP IS MEASURED PER ARM.** A hollow's LEFT ARM HAS NO HAND: the
    right forearm reaches −0.55 to its fingertips, the left stops at the
    wrist at −0.35. Taking the tip off `foreR` and using it for both put
    the left solve 20cm out, so that palm floated a hand's width over the
    soil for its whole press while every number in the solve read zero.
  - **WHEN EACH HAND CAN BE DOWN IS THE ARM'S TO SAY.** The arm is 0.59
    from shoulder to wrist and the shoulder sits 1.29 above the root, so
    while the body is two metres down the shoulder is three quarters of a
    metre UNDER the soil and **a plant is geometrically impossible** — the
    hand can barely poke its fingers out. That is why the scrabble comes
    first and both presses are in the upper half. The short left arm holds
    the soil only while the root is under −0.78 and the right down to
    −0.46, so the left joins EARLY and releases first and the longer right
    arm finishes the push. `RISE_PLANT` is
    `[rightDown, rightUntil, leftDown, leftUntil]`.
  - **THE BRACKET'S LOW END IS THE ARM'S FURTHEST REACH, and that is not
    where you would first put it.** The hand's height is not monotone in
    the shoulder angle, it is a U: measured at p .78, 0.21 at armRx −1.2,
    down through −0.00 at −0.4, up to 0.79 at +1.4. So the soil has TWO
    solutions, the bisection crossed between branches, and when the near
    one vanished the angle leapt from −0.16 to the bracket end — a 0.23m
    teleport on a hollow and 0.44m on a brute in a hundredth of a second.
    `PLANT_LO` is the bottom of that U (−.35, stable across the press),
    the function is non-decreasing over the bracket, and the clamp at `lo`
    is then the max-reach pose and moves smoothly as the shoulder rises.
  - **THE RESIDUAL IS NOT A WEIGHT.** Fading the solve out as the arm ran
    out of reach (`res>.02 ? max(0,1-res*2.2) : 1`) is a switch, and a
    switch is a discontinuity. It guarded against nothing: out of reach,
    the bisection already returns the lowest angle the shoulder CAN hold.
  - Cost: **13–19us per rising body per frame** (software-rendered
    harness, so the spread is the harness) against 1.4us for the same pose
    with no plant — about 0.1% of a 60fps frame, and only while something
    is rising. The ancestors are walked once per solve, not once per step.
  **`eff` WAS DISCONTINUOUS AT EVERY BREAKPOINT IN THE LADDER**, and the
  shudder, the head, the arms and the legs are all hung on it, so all of
  them stepped together at every join. The cause is the EASE, not the
  table: an ease-out segment arrives with a derivative near zero and the
  next leaves with its steepest, so a central difference over a hundredth
  of a second reads a cliff. Measured across p .86, `eff` jumped 0.35 in
  one frame and every channel moved in exact proportion to its own eff
  coefficient — kneeR −0.209 on a −.6, legR +0.174 on a +.5, head +0.187
  on a +.55. `riseRate` reads the rate over THREE widths and averages.
  **A one-sample derivative of a piecewise-eased table is always a cliff;
  do not narrow that window.**
  **AND A BLEND WANTS SMOOTHSTEP, NEVER EASE-OUT** (`sstep`). `easeOut`
  has its STEEPEST slope at u=0, so the rise-to-walk hand-off spent eight
  per cent of the whole gap on its first frame — a 0.24m step in the hand,
  right at the seam it exists to hide. Every weight that blends one pose
  into another goes through `sstep`; the ones that describe a MOTION (a
  hand swinging over, a heave) keep their ease. For the same reason a
  raise that hands over to a solve must fade on its own RELEASE and not
  against the solve's weight — fading `lRaise` against `lOn` multiplied
  two fast ramps and stepped the left shoulder 0.355 rad in one frame.
  **IT FLOWS INTO THE WALK BECAUSE THE LAST BEAT IS THE WALK.** Horror
  rigs are `smoothPose:false`, so a hand-off with nothing across it IS a
  snap. `riseToWalk` snapshots the rise's channels, evaluates
  `poseWalk` at the phase the chase will use that very frame
  (`G.time+this.homeX`, passed in as `wt`), and lerps between them over
  the last `1-RISE_WALK`. Measured, the pose step at the hand-off is 0.
  **THE BOSS'S ENTRANCE IS NOT THIS.** The Warden rises in 1.1s inside its
  own cutscene and hands over to a fight, not to a walk; there is no room
  in a second for two plants to read. It is told apart by having no walk
  phase passed in (`lever===false`) and keeps the old flat depth, so its
  entrance is untouched.
  **THE RISE CANNOT BE INTERRUPTED, so every beat is always seen:**
  `wake()` returns early unless the state is `dormant`, nothing else
  writes `state='rise'` on a live body, and a rising horror is excluded
  from auto-target, lock and `execTarget`. It runs the full 2.6s (1.1s for
  the boss — **if a harness reads 1.1, it picked the boss**; filter
  `!x.boss&&!x.mini`).
  Two more harness traps: `rig.imp` (the LOD impostor, three boxes, a
  direct child of root) is the topmost mesh on the rig at 2.21, so exclude
  it and the shadow disc's `lodKeep` or every height measurement is the
  impostor's; and **`min y` of the forearm group is the ELBOW when the arm
  is raised and the fingertips when it is planted** — which is why an
  early sweep concluded the hand could not get within a metre of the
  surface.

- **THE LAG BEFORE A FINISHING CUT WAS SHADER COMPILATION, EVERY CUT.**
  `splitEnemy` clones every material on the body with a clipping plane,
  and a clipped material is its own shader program. three.js counts the
  materials on a program and DELETES the program when the last is
  disposed, so the halves' five programs (a Basic, two Phong, two
  Lambert) were linked on the frame of the hit and destroyed 2.8s later,
  and the next cut linked them again. Measured: the hit frame 1250ms plus
  650ms on the one after it (the GPU process compiling at first draw);
  now 216ms and no link. Two halves to the fix, both needed:
  1. **`THREE.Material.prototype.dispose` is wrapped (beside
     `localClippingEnabled`) so the first material to reach each program
     is kept in `PROG_KEEP` and the program lives for ever.** The game
     needs about thirty; a program is a few tens of kilobytes. Every
     effect that clones-shows-disposes (bone pieces, halves) is covered
     without knowing about it.
  2. **`clipWarm(rig,kind)`** compiles the halves' programs when the horror
     is BUILT (boot on the field, the wave's spawn in the Mire) and
     `warmEffects()` at boot does the trail, the drop's face, a bone piece
     and a Line. The stand-ins ride a metre ahead of the eye
     (`clipWarmPlace`), invisible: the clipped ones discard every fragment
     (plane constant +1e6), the rest are alpha 0 or add black.
     **What has to be drawn was found by measurement and is not
     explicable from the source:** one triangle per material class linked
     every program and the hit still stalled 400-530ms; a clone of the
     whole body alone, the same; a clone of the body PLUS one small
     stand-in per part, nothing. Both are drawn, two frames each, once per
     kind. Whatever the driver keys its pipelines on under the program,
     that covers it. If the stall ever returns, hook `gl.linkProgram` and
     time `renderer.render` per frame (the harness in the notes did
     exactly that): a stall with no link and no render time is the GPU
     process, and the answer is a more faithful stand-in, not less work.
  - **A stand-in's GEOMETRY is part of the key.** The trail's stand-in on a
    bare triangle left `vertexAlphas` undefined where the real trail's
    colour attribute makes it false, and the real trail linked its shader
    again on the first swing. A stand-in carries the attribute set of the
    thing it stands for.

## Conventions

- Commit messages here are written as evocative prose, lowercase-leaning,
  describing what changed in the game's own voice — e.g. *"Sound, third
  pass: voices for the hero and the Fallen One, slush for the Unburied."*
  Match that register.
- `README.md` is the design document and is kept genuinely current. When
  you change behaviour, update it in the same commit.
- Pushing to `main` auto-deploys the game via
  `.github/workflows/pages.yml`, which publishes to GitHub Pages at
  https://arterramarketing-hub.github.io/bonepath/ . The `github-pages`
  environment is set to "No restriction" for deployment branches — if that
  is ever narrowed back to a single branch, a rename will break deploys
  with an "environment protection rules" error.

## Testing

There is no test suite. Verify by reasoning carefully about the diff and,
where possible, by loading the page. Be especially careful: a syntax error
anywhere in `index.html` takes the whole game down, since it is one file.
