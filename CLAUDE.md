# BONEPATH — working notes for Claude

## What this project is

A haunted PSX-style souls-like that runs on a phone. The **entire game is
`index.html`** — one self-contained file, no build step, no install, no
server. Open it in a browser and it runs.

## Read this before you touch anything

**One line of `index.html` is the inlined three.js r128 bundle — a single
minified 603 KB line.** It will swamp every grep you run. Do not trust a
line number for it: any edit above it moves it (it was 325, and is 333 at
the time of writing). Find it, then filter it out:

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
- The imbued weapon's glow (`buildWeaponGlow`, near `ELEMENTS`) hangs two
  additive copies on every part of the weapon. They are `visible=false`
  until an element is taken, so an unlit weapon costs nothing; while lit it
  is roughly 20-30 extra draws on one small object. `player.rebuild()` must
  call `disposeWeaponGlow` first or the puffed fringe geometry leaks.
- What dominates now is the **character rigs**: every hollow, and the hero,
  is assembled from dozens of small meshes, each animated on its own
  transform. That is the next real win and the hardest, since instancing
  animated parts means writing world matrices per instance per frame rather
  than leaning on the scene graph.
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
- The heart bitmap is TEN pixels wide, not nine. An odd width has no true
  half, and the join sat a pixel left of centre.
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
- **`CHAIN_OUT` (.70) is what makes a combo one motion; `SEAM_T` is not.**
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
- **A body that has gone over the brink has no floor for its CLOTH
  either.** `stepSheet` takes its floor from `root.position.y`, and the
  ragdoll keeps the root planted on the ground while the hips fall — so
  the pinned row went down with the body while every free stitch was held
  at the cliff top, and the tabard drew as one teal streak the whole depth
  of the fall (measured: 19.97m at three seconds, exactly the fall).
  `ragFree` sets `rig.noFloorCloth`; a rebuild clears it.

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
