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
