# BONEPATH — working notes for Claude

## What this project is

A haunted PSX-style souls-like that runs on a phone. The **entire game is
`index.html`** — one self-contained file, no build step, no install, no
server. Open it in a browser and it runs.

## Read this before you touch anything

**`index.html` line 325 is the inlined three.js r128 bundle — a single
minified 603 KB line.** It will swamp every grep you run. Always filter it
out:

```sh
grep -n "PATTERN" index.html | grep -v '^325:'
```

The real game code is lines 326–end (~9,100 lines).

## Branch layout

`claude/dark-souls-mobile-poc-xnquc4` is the **default branch and the only
live one**. Work there.

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
- What dominates now is the **character rigs**: every hollow, and the hero,
  is assembled from dozens of small meshes, each animated on its own
  transform. That is the next real win and the hardest, since instancing
  animated parts means writing world matrices per instance per frame rather
  than leaning on the scene graph.
- The world's geometry all sits within ~80 units of the origin, so there is
  nothing beyond the fog to cull and no draw distance to win back by pulling
  the camera's far plane in. This was measured; do not re-litigate it.

## Conventions

- Commit messages here are written as evocative prose, lowercase-leaning,
  describing what changed in the game's own voice — e.g. *"Sound, third
  pass: voices for the hero and the Fallen One, slush for the Unburied."*
  Match that register.
- `README.md` is the design document and is kept genuinely current. When
  you change behaviour, update it in the same commit.
- Pushing to `claude/dark-souls-mobile-poc-xnquc4` auto-deploys the game
  via `.github/workflows/pages.yml`.

## Testing

There is no test suite. Verify by reasoning carefully about the diff and,
where possible, by loading the page. Be especially careful: a syntax error
anywhere in `index.html` takes the whole game down, since it is one file.
