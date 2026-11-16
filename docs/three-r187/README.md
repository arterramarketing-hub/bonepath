# three.js r128 to r187: the same picture

The game was drawn against three.js r128 (2021). This is the account of
moving it to r187 (the npm release `three@0.187.0`) without the picture
or the play changing, and the measurements that say it did not.

**Result: of 37 frozen frames, 31 are r128's to the last pixel; five
differ in 1, 1, 4, 6 and 14 pixels of 100,872; the 37th (the pause
portrait) differs in 63 pixels of 48,000 for a reason that is understood
and left.** Draw calls are equal in every frame, shader programs equal,
triangles a little fewer. The tables are below; the sheets (r128 | r187 | difference x8)
are beside this file.

## How it was measured

`tools/three-parity/` (read the headers of `lib.js` and `shots.js`).

- The page is given **its own clock and its own dice** before its first
  script runs: `performance.now`, `requestAnimationFrame` and the timers
  only advance when the harness turns a frame, and `Math.random` is a
  seeded stream. The library gets a separate stream (it rolls four times
  for every uuid, and r187 makes a different number of objects than
  r128), told apart by the caller's line: the library is one line.
- A shot loads the real game on a fixed seed, hour and weather, begins a
  run, sets its scene, turns a fixed number of frames, places the camera,
  calls the game's own `renderFrame()` and reads the **canvas** as PNG at
  the game's internal size (467 x 216). No screenshot, no scaling.
- **The noise floor is zero.** Two runs of the r128 file give 37 of 37
  pictures identical byte for byte in their pixels. So every number
  below is the library's doing and nothing else's.
- The harness also wraps `String.prototype.replace`: a replace on shader
  text that matches nothing is recorded (`misses`). There are none.

```sh
cd tools/three-parity
node shots.js --file=<r128 index.html> --out=/tmp/a     # git show <before>:index.html > that file
node shots.js --out=/tmp/b                               # the working tree
node compare.js /tmp/a /tmp/b /tmp/sheets
node perf.js --file=... --out=perf.json
```

## What changed in the library, and what was done about each

Everything below lives in `tools/build/three/`: `legacy.js` (THE OLD
LIGHT, compiled into the line with the library), and `PATCHES`/`OLD` in
`build.js` (exact-match source patches, and two files taken whole from
r128). Each replacement is checked when the line is built or when it
loads, so a future revision that words something differently fails
loudly instead of drawing a slightly different game.

| # | r128 | r187 as shipped | here |
|---|------|-----------------|------|
| 1 | `MeshLambertMaterial` lit **per vertex** (`lights_lambert_vertex`, `vLightFront`, `vIndirectFront`) | per fragment since r144; the chunk is gone | `ShaderLib.lambert` is r128's Gouraud shader again, written on r187's chunks and light functions; `lights_lambert_vertex` is a chunk again |
| 1b | `flatShading` "is not a property" of Lambert: ignored, with a console warning | a real property that defines `FLAT_SHADED` | an accessor on `MeshLambertMaterial.prototype`: accepted, always false. The faceting in the game is its geometry's own normals, as it always was |
| 2 | legacy light units: shaders multiply irradiance by pi, `BRDF_Lambert` divides it out; point light falloff `(1-d/distance)^decay` | physical units only (the switch was removed in r165); inverse-square with a windowed cutoff | pi restored in the ambient and hemisphere irradiance, in the Lambert sum and in Phong's `RE_Direct`; `getDistanceAttenuation` is r128's. No intensity in the game changed. Every `PointLight` in the game already names its decay |
| 3 | no colour management; `Color(hex)` is the number | `ColorManagement.enabled` on | off |
| 4 | textures stored RGBA8; an sRGB `map` decoded in the shader, after filtering | stored `SRGB8_ALPHA8`, decoded by the GPU before filtering (different mips, different blend between mip levels) | patch: never an sRGB internal format; every sRGB map takes the in-shader decode three keeps for video (`DECODE_VIDEO_TEXTURE`), points included. Game: `.encoding=sRGBEncoding` became `.colorSpace=SRGBColorSpace` |
| 5 | a render target is written in its texture's `encoding` | every target but an XR one is written linear | patch: written in its texture's `colorSpace`. `rt`, `hazeRT`, `crispRT`, `heroRT` are marked sRGB as before; the grade quad still reads them raw |
| 6 | a transparent `DoubleSide` material: one draw | two (back faces, then front) | `forceSinglePass` is true for every material |
| 7 | an opaque material writes its own alpha | `OPAQUE` forces 1 | `opaque_fragment` writes it as given (the portrait's canvas takes its alpha from the target) |
| 8 | Blinn-Phong Fresnel on L.H | on V.H (equal on paper; off by one unit of 255 on a highlight) | r128's arithmetic in `BRDF_BlinnPhong` |
| 9 | `LatheGeometry`: normals averaged from its faces | analytic normals (every highlight on a helm and a pauldron moves) | r128's `LatheGeometry.js`, whole |
| 10 | `ExtrudeGeometry` caps | cut along other diagonals | r128's `ExtrudeGeometry.js`, whole (one use: the ultra greatsword's blade) |
| 11 | program cache key | also keyed on opaque/see-through, on whether the geometry has normals, and "flat" for a Lambert without normals: 3 more programs on the field | patched out of the key; the count is r128's |
| 12 | `vUv`, `mapTexelToLinear`, `sRGBToLinear`, `<encodings_fragment>`, `geometry` in the light loops | `vMapUv`, `sRGBTransferEOTF`, `<colorspace_fragment>`, `geometryNormal` | the game's patches renamed: `psx()`'s affine swim, the ground shader, `TRAIL_GROUND`, `skyTwin` (both branches), the two effect shaders |
| 13 | `attribute.updateRange={offset,count}` | `addUpdateRange(start,count)` | `unbake` |
| 14 | `MeshDepthMaterial` RGBA packing, A the top byte | R the top byte | `bakeSky` reads it the new way round |
| 15 | three.min.js (UMD) | no UMD build | `build.js`: esbuild, IIFE, `var THREE=`, one line, from three's `src/` |

Checked and found unchanged, so nothing done: fog, vertex colours,
`alphaTest`, clipping planes (`splitEnemy`), `Sprite`/`Points`/`Line`,
additive blending (RGB; the alpha factor differs and nothing reads it),
layers, the shared `DepthTexture` between `rt` and `hazeRT`,
`readRenderTargetPixels`, `renderer.info` (`autoReset`, `programs`),
`renderer.properties.get(m).currentProgram.cacheKey` (`PROG_KEEP`),
`Material.clone()` still dropping `onBeforeCompile`, every other geometry
generator (compared face by face: `Box`, `Plane`, `Cylinder`, `Cone`,
`Sphere`, `Circle`, `Torus`, `Ring`, `Tetrahedron`, `Icosahedron`,
`Shape`, `toNonIndexed`, `computeVertexNormals`), and **the clean canvas
upload**: r187 allocates with `texStorage2D` and uploads with a
seven-argument `texSubImage2D`, which `cleanCanvasUploads` already
wrapped; counted under the wrapper, every canvas reaches WebGL as
`ImageData` and none as a canvas, in three modes.

## What does not match

1. **The pause portrait, 63 pixels.** A render target with no depth
   texture had a 16-bit depth renderbuffer in r128 and has a 24-bit one
   in r187. `heroRT` is such a target, and where two surfaces of the
   knight lie almost on each other (the belt, the pauldron's trim) the
   coarser buffer chose differently. Proved: r128 with
   `heroRT.depthTexture=new THREE.DepthTexture(W,H,THREE.UnsignedIntType)`
   (24 bits) draws a portrait identical to r187's in every pixel. Left
   as it is: it is the same picture with less z-fighting. The world's
   own frame (`rt`) always had a 24-bit depth texture and is unaffected.
2. **Triangles: fewer.** `CylinderGeometry`/`ConeGeometry` no longer emit
   the zero-area face at a tip of radius 0. About 350 fewer triangles on
   the field, none of them ever drawn a pixel. (Their `groups` start and
   count differ accordingly; the game uses no material arrays.)
3. **WebGL1 is gone** (upstream, r163). A device without WebGL2 no
   longer starts. `HAZE_SEP` is now always true; its fallback is left in
   the source, dead.

## What could not be verified here

- **A real phone, and Safari.** Everything was measured on Chromium with
  software GL (SwiftShader). The arithmetic is the same GLSL, but
  drivers differ, and the clean-canvas rule exists for a Safari bug that
  cannot be seen here.
- **Milliseconds.** Counts only (below).

## The pictures, one by one

Each name is its sheet: r128, r187, and the difference times eight (black
is none). The floor, r128 against r128, is 0 pixels in all 37.

| shot | pixels that differ | largest difference | mean | draw calls r128 / r187 | triangles r128 / r187 | programs r128 / r187 |
|---|---|---|---|---|---|---|
| [angel](angel.jpg) | 0 of 100872 | 0 | 0.0000 | 302 / 302 | 66520 / 66196 | 30 / 30 |
| [blizzard](blizzard.jpg) | 0 of 100872 | 0 | 0.0000 | 313 / 313 | 76594 / 76266 | 31 / 31 |
| [bubbles](bubbles.jpg) | 0 of 100872 | 0 | 0.0000 | 245 / 245 | 60226 / 59918 | 37 / 37 |
| [castle](castle.jpg) | 0 of 100872 | 0 | 0.0000 | 466 / 466 | 52012 / 51676 | 28 / 28 |
| [codex-hollow](codex-hollow.jpg) | 1 of 100872 | 1 | 0.0000 | 369 / 369 | 47210 / 46878 | 26 / 26 |
| [codex-horror-6](codex-horror-6.jpg) | 0 of 100872 | 0 | 0.0000 | 350 / 350 | 46544 / 46208 | 27 / 27 |
| [codex-place](codex-place.jpg) | 0 of 100872 | 0 | 0.0000 | 329 / 329 | 47654 / 47326 | 25 / 25 |
| [cut-body](cut-body.jpg) | 0 of 100872 | 0 | 0.0000 | 334 / 334 | 69754 / 69430 | 28 / 28 |
| [door-night](door-night.jpg) | 0 of 100872 | 0 | 0.0000 | 467 / 467 | 71208 / 70838 | 30 / 30 |
| [field-dusk](field-dusk.jpg) | 0 of 100872 | 0 | 0.0000 | 510 / 510 | 72834 / 72464 | 30 / 30 |
| [field-night](field-night.jpg) | 0 of 100872 | 0 | 0.0000 | 510 / 510 | 72826 / 72456 | 30 / 30 |
| [field-noon](field-noon.jpg) | 0 of 100872 | 0 | 0.0000 | 509 / 509 | 72824 / 72454 | 29 / 29 |
| [fog](fog.jpg) | 6 of 100872 | 1 | 0.0000 | 292 / 292 | 66318 / 65990 | 28 / 28 |
| [fps-flash](fps-flash.jpg) | 1 of 100872 | 1 | 0.0000 | 447 / 447 | 69116 / 68750 | 50 / 50 |
| [fps-gun](fps-gun.jpg) | 0 of 100872 | 0 | 0.0000 | 463 / 463 | 70304 / 69938 | 48 / 48 |
| [fps-scope](fps-scope.jpg) | 0 of 100872 | 0 | 0.0000 | 383 / 383 | 67520 / 67170 | 48 / 48 |
| [graves-noon](graves-noon.jpg) | 0 of 100872 | 0 | 0.0000 | 251 / 251 | 60078 / 59766 | 28 / 28 |
| [hero-close](hero-close.jpg) | 0 of 100872 | 0 | 0.0000 | 259 / 259 | 59106 / 58794 | 28 / 28 |
| [hero-game-cam](hero-game-cam.jpg) | 0 of 100872 | 0 | 0.0000 | 586 / 586 | 72906 / 72524 | 30 / 30 |
| [hero-portrait](hero-portrait.jpg) | 63 of 48000 | 212 | 0.0803 | - | - | - |
| [hollows](hollows.jpg) | 0 of 100872 | 0 | 0.0000 | 461 / 461 | 73524 / 73184 | 28 / 28 |
| [lantern-night](lantern-night.jpg) | 0 of 100872 | 0 | 0.0000 | 467 / 467 | 71806 / 71436 | 30 / 30 |
| [mire-hearth](mire-hearth.jpg) | 0 of 100872 | 0 | 0.0000 | 176 / 176 | 27412 / 27408 | 21 / 21 |
| [mire-house](mire-house.jpg) | 0 of 100872 | 0 | 0.0000 | 226 / 226 | 29362 / 29358 | 21 / 21 |
| [mire](mire.jpg) | 0 of 100872 | 0 | 0.0000 | 234 / 234 | 30420 / 30416 | 21 / 21 |
| [nave-night](nave-night.jpg) | 0 of 100872 | 0 | 0.0000 | 303 / 303 | 64468 / 64102 | 30 / 30 |
| [nave-noon](nave-noon.jpg) | 0 of 100872 | 0 | 0.0000 | 302 / 302 | 64466 / 64100 | 29 / 29 |
| [path-night](path-night.jpg) | 0 of 100872 | 0 | 0.0000 | 548 / 548 | 18552 / 18552 | 29 / 29 |
| [path-noon](path-noon.jpg) | 0 of 100872 | 0 | 0.0000 | 550 / 550 | 50332 / 49996 | 28 / 28 |
| [rain](rain.jpg) | 0 of 100872 | 0 | 0.0000 | 253 / 253 | 60078 / 59766 | 30 / 30 |
| [ravine-rim](ravine-rim.jpg) | 14 of 100872 | 31 | 0.0006 | 313 / 313 | 25774 / 25758 | 28 / 28 |
| [ravine](ravine.jpg) | 0 of 100872 | 0 | 0.0000 | 298 / 298 | 25368 / 25352 | 28 / 28 |
| [slash-arc](slash-arc.jpg) | 0 of 100872 | 0 | 0.0000 | 258 / 258 | 58762 / 58450 | 32 / 32 |
| [snow](snow.jpg) | 0 of 100872 | 0 | 0.0000 | 255 / 255 | 65310 / 64998 | 30 / 30 |
| [storm-night](storm-night.jpg) | 0 of 100872 | 0 | 0.0000 | 511 / 511 | 72824 / 72454 | 31 / 31 |
| [summer](summer.jpg) | 0 of 100872 | 0 | 0.0000 | 180 / 180 | 58366 / 58046 | 30 / 30 |
| [title](title.jpg) | 4 of 100872 | 13 | 0.0002 | 1080 / 1080 | 89220 / 88818 | 28 / 28 |

The five small ones (`title` 4 pixels, `ravine-rim` 14, `fog` 6,
`fps-flash` 1, `codex-hollow` 1) were not run to ground. In `fog`,
`fps-flash` and `codex-hollow` they are one unit of 255; in the other two
they are single dither cells, a brightness that sat on one of the grade's
63 steps and fell the other way. The likeliest
cause is the order of a float operation in a shader the driver compiles
from different text. That is a guess, not a finding.

## The cost

After thirty seconds of each way (1800 frames; software GL, so counts).
r128 / r187:

| way | programs | programs linked | draw calls | triangles | heap MB | GPU geometries | GPU textures | time to title ms | three.js warnings |
|---|---|---|---|---|---|---|---|---|---|
| field | 30 / 30 | 30 / 30 | 488 / 488 | 73016 / 72658 | 29 / 30.4 | 459 / 459 | 32 / 30 | 6136 / 6226 | 1 / 0 |
| path | 28 / 28 | 28 / 28 | 464 / 464 | 51988 / 51652 | 22.7 / 22.8 | 402 / 402 | 31 / 29 | 5680 / 6186 | 1 / 0 |
| ravine | 28 / 28 | 28 / 28 | 449 / 449 | 58666 / 58330 | 25.7 / 25.9 | 390 / 390 | 34 / 32 | 6553 / 7050 | 1 / 0 |
| mire | 24 / 24 | 24 / 24 | 233 / 233 | 29526 / 29522 | 18.3 / 18.6 | 221 / 221 | 26 / 25 | 1942 / 2294 | 1 / 0 |
| castle | 29 / 29 | 29 / 29 | 465 / 465 | 51990 / 51654 | 22.7 / 22.8 | 402 / 402 | 32 / 30 | 5595 / 5789 | 1 / 0 |
| codex | 28 / 28 | 28 / 28 | 359 / 359 | 47162 / 46834 | 39.9 / 40.7 | 361 / 361 | 26 / 24 | 11420 / 11354 | 1 / 0 |

No errors in either. r128's one warning is `'flatShading' is not a
property of this material`; r187 has none. Fewer GPU textures because a
cloned texture now shares its source's upload. The time to title is wall
clock on a busy machine with both files running at once: read it as "no
different", no finer.

## Size

| | r128 | r187 |
|---|---|---|
| the three.js line | 603,352 bytes | 591,104 bytes |
| ...gzipped (-9) | 148,655 | 148,565 |
| `index.html` | 2,190,277 | 2,178,106 |
| ...gzipped | 673,394 | 672,212 |
| as served (`minify.js`), gzipped | 439,072 | 437,746 |

The line carries 75 exports: the 69 `THREE.Name`s the game uses and six
for harnesses and notes (`EXTRA` in `build.js`). Unused classes are
shaken out; every shader chunk and `ShaderLib` entry is kept (they are
one table), with comments and blank lines stripped as three's own build
strips them.

## Tests

`tools/check/run.js`, everything (parse, boot, codex, path, ravine, road,
castle, leak): all pass. `parse` now also loads the line in a bare VM and
fails if the game names a `THREE.Name` the line does not carry. The page
as served (`tools/build/minify.js`, which still finds the three.js line
as the one dense script and leaves it byte for byte) passes `parse boot`.
`check.yml` additionally rebuilds the line (`build.js --check`) and fails
if `index.html` carries anything else.
