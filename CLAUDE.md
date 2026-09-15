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
- **The cemetery, groves and ruins are NOT foldable the same way.** Nearly
  all of them are registered as `obstacles` or in `MARKABLE` — a blade can
  score a gravestone and gouge a tree, and the mark is painted onto that
  object — so folding them would silently kill the marks. Reaching them
  means instancing with per-instance marking, or reworking how marks are
  painted. Do not simply widen `bakeStatic` over them.
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
- **Never drive a material colour above 1.** The grade's S-curve is
  `mix(c, c*c*(3-2c), .62)`; past ~1.2 the second term goes negative and the
  pixel renders BLACK. Brightening a textured (white-based) material has to
  be done with `emissive`, which adds after the map multiply. This bit
  `wearSnow` twice before it was understood.
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
  - In first person the body is put back (`syncFpsRig`) and the gun and
    the blade viewmodels are hidden, because the eye has left the helm.
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
  2. **The eye is at 1.42 m** (`FPS.eyeY`), where the third-person gaze
     and the bow's loose already put the head. It was 1.58 and every level
     shot passed clean over a hollow's skull (its head sphere tops out at
     ~1.67; its body at ~1.52).
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
      Every viewmodel motion (bob, idle sway, look-lag) is
      scaled by `(1-ads)` so the sight is true when it is up. The hurt
      flinch is the one thing that still dips it, on purpose.
      **The gun and the blade viewmodels must each put the OTHER away.**
      `updateBladeVm` hides itself when a gun is held, but it is only
      called while no gun is held — so swapping from a blade to a gun in
      first person left the last blade standing on screen beside the rifle,
      for ever. `updateGun` clears `FPS.vmBlade.visible` from its side.
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
      and `gunAimBase` aims at the eye's mark); `updateBladeVm` runs in
      first person with a blade (a clone of `rig.weapon` MINUS ITS LIGHT
      — cloning a PointLight would add a light and recompile every shader).
      `Input.setBlade` tells the input a blade is behind the eyes, so the
      triggers become strikes and the aim button charges.
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
- **THE RELOAD IS A MECHANISM, AND THE SHAPE IS WHAT MAKES IT ONE.**
  `clack(t,{peak,body,ring,dec,bright})` and `mscrape(t,{...})` are
  declared beside `tone` inside the AudioSys closure, and every reload
  sound is built out of them. A clack is three layers inside forty
  milliseconds: the IMPACT (wideband, attack .0004 — no attack at all),
  the BODY of what was struck (a short low knock, the alloy's mass), and
  the RING left in the part (a high partial at a tenth the level, held
  five times longer). `mscrape` is metal on metal: a filtered hiss with
  a handful of tiny catches scattered through it, because a rail is not
  smooth.
  **Do not go back to a round tone.** Every stage used to be ONE square
  blip with a rounded attack, and the roundness IS the plastic.
  Each stage is now a small sequence — a catch releases, a part travels,
  a part arrives and stops dead — and **the arrival is always the
  loudest thing in the stage**, because that is what says the magazine
  is home rather than near.
  **A clack's three layers SUM**, so its true peak is about twice the
  number you pass. The seat of `magIn` was written at .38 and was
  therefore louder than the gun that needed reloading; the call peaks
  are all around .1–.3 now and the loudest moment of a reload sits under
  `AudioSys.gun`'s .58. If a reload ever shouts, look at the sum, not at
  one layer.
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
  it: **the bone sniper's 96 body damage** (its claim is one shot one
  body, and a hollow's life is deliberately just under it), the red-boned
  multiplier (2.2, not 3 — at three a red hollow is sixteen greatsword
  swings, which is the same fight held down twice as long, and it is
  `Math.round`ed or hp lands on a fraction), and the README's gun table,
  which quotes rounds-to-kill. Marrow is NOT tied to it — the templates'
  costs and the cathedral's gate are unchanged, so the field takes longer
  to clear but opens at the same point.

- **A BLADE VIEWMODEL IS CARRIED AT ITS OWN SCALE** (`VM_BLADE`, beside
  `ensureBladeVm`). The viewmodel is a clone of the pilgrim's real weapon,
  and at its real size half a metre off the lens a greatsword covered 0.77
  of the screen's width and **2.13 of its height** (the ultra 1.17 x 3.12)
  — measured by projecting the clone's world bounding box through the
  camera, which is how to check this. Each weapon now carries its own
  `s` (scale), its carry position and rotation, and `mo`, which scales the
  swing's TRANSLATION with the weapon; the rotations are deliberately left
  alone, because a rotation reads the same at any size and the rotation is
  what says the cut landed. Sword/ultra/katana now measure about 0.19 x
  0.45 of the screen, in the lower right, whole.
  Additive materials in the clone are cloned and dimmed (the wand's orb
  burns a hole in the middle of the picture otherwise) — cloned because
  the material is SHARED with the rig, and `Material.clone()` drops
  `onBeforeCompile`, so that copy no longer wobbles with `psx()`.

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
