# tools/blender — models built in Blender, worn by the game's own rig

Blender is used here as an **offline geometry tool**. It never ships: what
ships is a ten-kilobyte block of text that would be inlined in `index.html`,
and a 48-line decoder. The game stays one file with no asset files, no
loader and no skinning; its poses, springs, IK, cloth, snow dress and ragdoll
drive the new parts exactly as they drive today's, because the parts hang on
the same joints at the same pivots.

Nothing in here is wired into the game yet. `index.html` is only ever read.

## One command

```sh
sh tools/blender/run.sh              # everything, about 6 minutes
sh tools/blender/run.sh --model-only # just Blender: build, bake, export, render (10 s)
```

First run makes a Python venv **outside the repository** and `pip install`s
`bpy` (Blender 5.3.0 as a module, about 1.1 GB) and Pillow. No Blender app,
no GPU, no display.

| variable | default | what |
|---|---|---|
| `BP_BLENDER_VENV` | `~/.cache/bonepath-blender-venv` | where bpy lives |
| `BP_BLENDER_OUT` | `/tmp/bonepath-blender` | raw shots, logs, reports |
| `BP_INDEX` | `../../index.html` | the game to read |
| `CHROME_PATH` | `/opt/pw-browsers/...` | Chromium, as in `tools/check` |

Node needs `playwright` (or `tools/check`'s `playwright-core`).

## Files

| file | what it is |
|---|---|
| `build_knight.py` | bpy/bmesh: builds each part on its pivot, bakes AO, exports the block, renders turnarounds |
| `knight.block.json` | **generated** — the block. Never edit; re-run the script |
| `knight.report.json` | **generated** — bytes and triangles per part |
| `decode.js` | `bpDecode(block)` and `bpDress(rig, block, makeMaterial)`; plain r128, 48 lines |
| `measure_rig.js` | reads today's knight off the live rig into `today_parts.json` |
| `today_parts.json` | **generated** — every mesh, joint, box, triangle count and material of today's knight |
| `shoot.js` | Playwright: photographs and plays the real game (`--mode=none\|inject\|patched`, `--wx=snow`) |
| `serve.js` | **the test page**: the real game with the block inlined in memory, on localhost, playable. `?oldknight` shows today's on the same build |
| `sheets.py` | builds the PNG sheets in `docs/blender/` |
| `lib.js` | launch, begin a run (as `tools/check` does), the in-memory patch, the server |

## What a replacement must keep (measured, `today_parts.json`)

The game plays no clips. It rotates these joints from its own pose code, so a
part is a **rigid mesh in its joint's frame, the joint at the origin**, the
limb running down −Y, the model facing +Z, metres. All rest rotations zero.

| joint | parent | pivot in parent (x, y, z) | note |
|---|---|---|---|
| `body` | root | 0, 1.04, 0 | `rig.baseY`; the hips |
| `torso` | body | 0, 0.08, 0 | the waist |
| `head` | torso | 0, 0.58, 0 | the neck: 1.70 m up |
| `armR` | torso | **−0.30**, 0.47, 0 | the WEAPON arm; `mirrorArms` puts it at −x |
| `foreR` | armR | 0, −0.34, 0 | elbow |
| `weapon` | foreR | 0, −0.34, 0 | the palm; the game hangs its own weapons here — never model one |
| `armL` | torso | +0.30, 0.47, 0 | |
| `foreL` | armL | 0, −0.34, 0 | |
| `legR` | body | **+0.14**, −0.02, 0 | (yes: legR is +x while armR is −x) |
| `kneeR` | legR | 0, −0.46, 0 | `legLen` 1.15 |
| `legL` | body | −0.14, −0.02, 0 | |
| `kneeL` | legL | 0, −0.46, 0 | |

`docs/HERO_MODEL_BRIEF.md` gives 1.95 m to the top of the helm and the hips at
1.06; the live rig measures the hips at 1.04, the neck at 1.70, the helm's
crown at 2.14 and its knob at 2.20. **The numbers above are the rig's.**

Today's parts and the new ones, each in its joint's frame (metres):

| joint | today: meshes / triangles / materials | today's box (min → max) | new part | new triangles | new box |
|---|---|---|---|---|---|
| head | 8 / 434 / 4 | −.15,−.02,−.19 → .15,.50,.16 | `head` | 194 | −.17,−.03,−.19 → .17,.56,.19 |
| torso | 11 / 848 / 6 | −.49,−.39,−.34 → .49,.67,.29 | `torso` | 262 | −.40,−.39,−.30 → .40,.78,.23 |
| body | 4 / 224 / 4 | −.38,−.30,−.23 → .38,.06,.27 | `body` | 94 | −.35,−.33,−.19 → .35,.07,.20 |
| armR, armL | 4 / 324 / 2 each | −.17,−.33,−.18 → .17,.12,.18 | `pauld` + `arm` | 78 + 56 | −.17,−.34,−.18 → .27,.18,.18 |
| foreR, foreL | 4 / 126 / 4 each | −.09,−.42,−.09 → .09,.06,.09 | `fore` | 92 | −.11,−.43,−.14 → .11,.05,.09 |
| legR, legL | 1 / 28 / 1 each | −.09,−.45,−.08 → .09,−.01,.09 | `leg` | 44 | −.12,−.46,−.11 → .12,0,.12 |
| kneeR, kneeL | 4 / 120 / 4 each | −.09,−.52,−.09 → .09,.07,.17 | `knee` | 128 | −.11,−.53,−.10 → .11,.08,.22 |
| **body total** | **49 meshes, 2,702 triangles** | | **13 meshes** | **1,346** | |
| weapon | 21 / 332 | untouched | — | | |
| root: cloth ×6, shade | 7 / 170 | untouched | — | | |

Limbs are authored once, for the +x side, and mirrored by the decoder where
the joint sits at −x (so 948 triangles are stored for 1,346 worn).

Materials. Today: nine textures' worth (`iron`, `helm`, `mail` are Phong with a
glint; `teal`, `leather`, `fur` Lambert), 30-odd material instances. New: **one**
material shared by all thirteen meshes — what `flatMat(0xffffff)` returns:
Lambert, `vertexColors`, through `psx()` — with every colour in the vertices.
Fourteen palette colours, read off today's knight in the real game's light.

What touches those meshes afterwards, and what was seen (see `shoot.js`):

| system | what it needs | result |
|---|---|---|
| poses, `_sm` springs, IK, `seamBlend` | joints only | unchanged; no NaN joints after 20 s |
| cloth (tabard panels) | joints, collision spheres | unchanged; the new skirt is kept inside the hip sphere's depth |
| `dressSnow` / `wearSnow` | a mesh with ONE (non-array) material with `.color`; clones those below 0.88 m | works. The share is taken at the mesh's ORIGIN, which is now the joint, so the thigh (hip at 1.02 m) takes no boot-snow; shins and boots do |
| snow flecks | a bounding box per upper mesh | works; 6 flecks instead of 12 (fewer, larger meshes) |
| `player.flash` (`player.mats`) | `.emissive` | works |
| `fpsMaskRig` | masks ARM meshes whose box tops the eye line, one mesh at a time | works, which is why the pauldron is its own mesh: merged into the arm, the whole upper arm would vanish in first person. 22 meshes masked, all restored on leaving |
| `lodUpdate` | — | **does not apply to the hero** (it loops over `enemies`). It will matter for the hollow: the impostor takes the material of the largest lit mesh, and a white vertex-colour material would make a white box |
| death, ragdoll, `respawn()` → `rebuild()` | joints; rebuild calls `makeKnightRig` | works when inlined. Swapped at runtime, a rebuild has to be re-dressed (shoot.js wraps it) |
| `heroifyObject`, `dashGhost`, `meltHero` | walk `snowDress` / materials | not exercised (`HERO_HI` is off; the ghost is the thief's) |
| pause portrait (`renderHero`) | calls `makeKnightRig` | works |
| `severLimb`, home run, bat shatter | detach joints | not exercised on the hero by this harness |

## The block

```json
{"v":1,"pal":["#a9adb1",...],"parts":{"head":{"b":[minx,miny,minz,sizex,sizey,sizez],"n":107,"t":194,"d":"<base64>"}}}
```

`d` is one byte string: positions (3 bytes a vertex, 0–255 across the part's
box: 1–2 mm steps), AO (1 byte a vertex, ÷200), indices (1 byte each; 2 if a
part passes 256 vertices), palette index (1 byte a face), face shade (1 byte a
face, ÷200: the facet jitter). No normals and no UVs. The decoder writes
NON-indexed geometry and lets `computeVertexNormals()` give each face its
own normal — r128's Lambert lights per vertex and ignores `flatShading`,
which is why `loft()` in the game does the same.

| part | vertices | triangles | binary | in the block (base64 JSON) | gzip |
|---|---|---|---|---|---|
| head | 107 | 194 | 1,398 | 1,931 | 1,294 |
| torso | 161 | 262 | 1,954 | 2,680 | 1,818 |
| body | 56 | 94 | 694 | 993 | 709 |
| pauld | 51 | 78 | 594 | 862 | 603 |
| arm | 36 | 56 | 424 | 633 | 475 |
| fore | 62 | 92 | 708 | 1,012 | 760 |
| leg | 24 | 44 | 316 | 491 | 366 |
| knee | 84 | 128 | 976 | 1,372 | 1,009 |
| **block** | 581 | 948 stored, 1,346 worn | 7,064 | **10,203** | **6,591** |

Decoder: 2,781 bytes with its comments (1,555 without). Block + decoder +
the one line in `makeKnightRig`: **13,220 bytes** on a 2,181,924-byte
`index.html` (+0.6 %), about 8.3 kB gzipped.

## AO

Baked by `bake_ao()` with `mathutils.bvhtree`: a BVH of the whole body at
rest, 96 cosine-weighted rays from every vertex, 34 cm reach, a hit weighted
by distance. A hit on a part hung from a DIFFERENT joint counts 0.4 (an arm's
shadow on the chest is wrong the moment the arm lifts); the result is floored
at 0.45 and darkened a little toward the boots. It is not a Cycles bake:
this runs anywhere `bpy` imports and takes under two seconds. Cycles (CPU) is
used only for the turnaround stills. EEVEE and Workbench need a GPU context
and were not tried.

## Why not glTF + GLTFLoader

| | this block | glTF + GLTFLoader |
|---|---|---|
| runtime code | 48 lines | GLTFLoader for r128 is ~100 kB minified, not in the inlined bundle |
| one file, no assets | yes: text, inlined | a `.glb` beside the page, or a base64 data URI plus the loader |
| what the game needs | positions, colours, faces | it would discard the node tree, materials, UVs, normals and skins it loaded |
| size, this knight | 10.2 kB | ~35–45 kB as .glb (float positions, normals, float colours), before base64 |
| async | none: decoded where the rig is built | a promise in a boot that is synchronous, and that the declaration-order rules guard |
| skinning | impossible, by design | invites it; the game rotates rigid joints and has no bones to bind |

glTF is the right **interchange** format for an outside artist, and Blender's
exporter is in the bpy wheel. If a hand-made `.glb` arrives, the route is:
import it into Blender, name the meshes `P_head`, `P_torso` …, and run the
same `export_block()` — it reads the scene, not the generator.

## A new model, or a part re-made by hand

`export_block()` reads every mesh named `P_<part>` and three things on it:
the corner colour attribute `Col` (the palette is built from whatever colours
it finds, up to 256), the face float `fs` (shade), and the point float `ao`.
`python build_knight.py --blend` saves `knight.blend` to the out directory for
editing. To keep a hand edit, split `main()` so it opens that `.blend`
instead of calling `build_parts()` — that switch is not written yet.

Rules for a part: flat faces only (no subdivision, no smooth groups); one
mesh per joint unless something masks by mesh (the pauldron); keep the box
close to today's (the cloth's spheres and the first-person eye line were
measured against it); never include the weapon.

## Not verified

- Only headless Chromium on SwiftShader. Not Safari, not a phone, no frame
  timings on real hardware.
- Only the default knight with the claymore. The katana's `saya` is kept by
  `bpDress` but was not looked at; guns, bow and wand were not run.
- Sever, home run, bat shatter, the dash ghost and the melt were not run.
- The path, ravine and Mire were booted (`tools/check parse boot codex` on a
  patched copy: all passed) but not played.
- `tools/check`'s long walks (`path`, `ravine`, `road`, `castle`, `leak`) were
  not run against the patched copy.
