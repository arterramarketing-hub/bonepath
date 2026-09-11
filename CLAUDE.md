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

## Branch layout — this trips people up

This repo contains two unrelated projects that share **no git history**.

| Branch | What it is |
|---|---|
| `claude/dark-souls-mobile-poc-xnquc4` | **The game. Work here.** |
| `main` | An abandoned near-empty **Godot** skeleton. Not the game. |
| `claude/bone-path-hero-character-*` | Abandoned Godot character experiment |
| `claude/knight-lowpoly-character-*` | Abandoned Godot + Blender experiment |
| `claude/zealous-gates-*` | Abandoned Godot weather experiment |

If you find yourself in a Godot project (`project.godot`, `.tscn` files),
you are on the wrong branch. The game is HTML and three.js.

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
- There is **no instancing and no geometry merging** anywhere — the
  cemetery, groves and ruins each build individual meshes.
- There is **no FPS or draw-call readout**. Add one before optimizing;
  do not guess at performance.

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
