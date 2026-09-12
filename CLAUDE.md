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
  - **A HAND WALKS ON AN ARCH.** Positive `rotation.x` tips a finger DOWN
    (R_x takes +z toward -y), so every joint of a finger is POSITIVE and
    the chain bows from the knuckle to a claw in the soil. The first pass
    had the first joint negative and the thing was a bundle of sticks
    pointing at the sky.
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
  11. **The ADS position is computed, never hand-tuned.** `applyAttachment`
      sets each gun's `ads` from `sightH[att] * scale`, so the sight line
      sits at the screen's centre exactly; the hip position is the only
      free number. Every viewmodel motion (bob, idle sway, look-lag) is
      scaled by `(1-ads)` so the sight is true when it is up. The hurt
      flinch is the one thing that still dips it, on purpose.
  12. **The cone is the hip's** (`coneNow`: `spread*(1-ads)`, 0 past
      `ads>.9`); on the sights the ray is the camera's forward and nothing
      else, and the crosshair is hidden past `ads>.8`. Recoil moves the
      EYE (`FPS.pitch`, `G.camYaw`) plus a settling share (`FPS.recP`);
      the viewmodel's kick is cosmetic. `gunRay` reads the camera matrix
      from the LAST update, so the kick applied in `fireGun` never bends
      the shot that caused it.
  13. The right trigger (`#fbFireR`) has its own pointer handling, not
      `bindBtn`: its drag feeds `camDX/camDY` and translates the button.
      The left trigger is a plain `bindBtn`.
  14. The UMP is `suppressed`: `AudioSys.gun('ump')` is a thump with no
      crack, the flash sprite is a third the size, and the halo flare is a
      quarter. Do not give it the eagle's report back.

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
