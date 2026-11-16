# three.js r128 to r187: the same picture

The game was drawn against three.js r128 (2021). This is the account of
moving it to r187 (the npm release `three@0.187.0`) without the picture
or the play changing, and the measurements that say it did not.

**Result: of 39 frozen frames, 32 are r128's to the last pixel; six
differ in 1, 1, 1, 1, 4 and 14 pixels of 100,872; the 39th (the pause
portrait) differs in 63 pixels of 48,000 for a reason that is understood
and left.** (The numbers here are for the branch after `main`'s batched
glows, folded rigs and partial paint uploads were merged in, held against
`main` itself on r128.) Draw calls are equal in every frame, shader programs equal,
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
- **The noise floor is zero.** Two runs of the r128 file give 37 of 37 (the set then)
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
| 13b | `gl.pixelStorei` is nobody's business | the unpack state is CACHED in `renderer.state` | `flushPaint` (the ground paint's partial upload, a raw `texSubImage2D` on three's texture) sets it through `renderer.state.pixelStorei`; a bare call would leave the next texture three uploads flipped. The texture is still RGBA8 (row 4), allocated by `texStorage2D`, so the box lands as before: `paint-marks` is identical |
| 13c | - | - | the one batched glow mesh (`glowMesh`): `<colorspace_fragment>`; `UniformsLib.fog`, `UniformsUtils.merge` and `DynamicDrawUsage` behave as they did (`lantern-night`, `door-night`, `fog`) |
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
is none). The floor, r128 against r128, is 0 pixels in every shot.

| shot | pixels that differ | largest difference | draw calls r128 / r187 | triangles r128 / r187 | programs r128 / r187 |
|---|---|---|---|---|---|
| [angel](angel.jpg) | 0 of 100872 | 0 | 146 / 146 | 58778 / 58466 | 31 / 31 |
| [blizzard](blizzard.jpg) | 0 of 100872 | 0 | 240 / 240 | 76712 / 76384 | 32 / 32 |
| [bubbles](bubbles.jpg) | 0 of 100872 | 0 | 171 / 171 | 59616 / 59308 | 38 / 38 |
| [castle](castle.jpg) | 0 of 100872 | 0 | 244 / 244 | 52016 / 51680 | 28 / 28 |
| [codex-hollow](codex-hollow.jpg) | 1 of 100872 | 1 | 177 / 177 | 47254 / 46922 | 27 / 27 |
| [codex-horror-6](codex-horror-6.jpg) | 0 of 100872 | 0 | 176 / 176 | 46592 / 46256 | 27 / 27 |
| [codex-place](codex-place.jpg) | 0 of 100872 | 0 | 164 / 164 | 47724 / 47396 | 26 / 26 |
| [cut-body](cut-body.jpg) | 0 of 100872 | 0 | 188 / 188 | 69966 / 69642 | 29 / 29 |
| [door-night](door-night.jpg) | 0 of 100872 | 0 | 346 / 346 | 71240 / 70870 | 31 / 31 |
| [field-dusk](field-dusk.jpg) | 0 of 100872 | 0 | 398 / 398 | 72852 / 72482 | 31 / 31 |
| [field-night](field-night.jpg) | 0 of 100872 | 0 | 398 / 398 | 72844 / 72474 | 31 / 31 |
| [field-noon](field-noon.jpg) | 0 of 100872 | 0 | 397 / 397 | 72842 / 72472 | 30 / 30 |
| [fog](fog.jpg) | 1 of 100872 | 1 | 224 / 224 | 66422 / 66094 | 29 / 29 |
| [fps-flash](fps-flash.jpg) | 1 of 100872 | 1 | 355 / 355 | 69140 / 68774 | 51 / 51 |
| [fps-gun](fps-gun.jpg) | 0 of 100872 | 0 | 372 / 372 | 70330 / 69964 | 49 / 49 |
| [fps-scope](fps-scope.jpg) | 0 of 100872 | 0 | 242 / 242 | 67634 / 67284 | 49 / 49 |
| [graves-noon](graves-noon.jpg) | 0 of 100872 | 0 | 157 / 157 | 59424 / 59112 | 29 / 29 |
| [hero-close](hero-close.jpg) | 0 of 100872 | 0 | 165 / 165 | 58452 / 58140 | 29 / 29 |
| [hero-game-cam](hero-game-cam.jpg) | 0 of 100872 | 0 | 418 / 418 | 72972 / 72590 | 31 / 31 |
| [hero-portrait](hero-portrait.jpg) | 63 of 48000 | 212 | - | - | - |
| [hollow-close](hollow-close.jpg) | 0 of 100872 | 0 | 109 / 109 | 61864 / 61544 | 30 / 30 |
| [hollows](hollows.jpg) | 0 of 100872 | 0 | 276 / 276 | 73556 / 73216 | 29 / 29 |
| [lantern-night](lantern-night.jpg) | 0 of 100872 | 0 | 355 / 355 | 71824 / 71454 | 31 / 31 |
| [mire-hearth](mire-hearth.jpg) | 0 of 100872 | 0 | 152 / 152 | 27480 / 27476 | 22 / 22 |
| [mire-house](mire-house.jpg) | 0 of 100872 | 0 | 201 / 201 | 29490 / 29486 | 22 / 22 |
| [mire](mire.jpg) | 0 of 100872 | 0 | 206 / 206 | 30480 / 30476 | 22 / 22 |
| [nave-night](nave-night.jpg) | 0 of 100872 | 0 | 237 / 237 | 64544 / 64178 | 31 / 31 |
| [nave-noon](nave-noon.jpg) | 0 of 100872 | 0 | 236 / 236 | 64542 / 64176 | 30 / 30 |
| [paint-marks](paint-marks.jpg) | 0 of 100872 | 0 | 199 / 199 | 62480 / 62160 | 31 / 31 |
| [path-night](path-night.jpg) | 0 of 100872 | 0 | 477 / 477 | 18730 / 18726 | 30 / 30 |
| [path-noon](path-noon.jpg) | 0 of 100872 | 0 | 438 / 438 | 50482 / 50146 | 29 / 29 |
| [rain](rain.jpg) | 0 of 100872 | 0 | 159 / 159 | 59424 / 59112 | 31 / 31 |
| [ravine-rim](ravine-rim.jpg) | 14 of 100872 | 31 | 236 / 236 | 25924 / 25908 | 29 / 29 |
| [ravine](ravine.jpg) | 0 of 100872 | 0 | 226 / 226 | 25530 / 25514 | 29 / 29 |
| [slash-arc](slash-arc.jpg) | 0 of 100872 | 0 | 164 / 164 | 58108 / 57796 | 33 / 33 |
| [snow](snow.jpg) | 0 of 100872 | 0 | 161 / 161 | 64656 / 64344 | 31 / 31 |
| [storm-night](storm-night.jpg) | 0 of 100872 | 0 | 399 / 399 | 72842 / 72472 | 32 / 32 |
| [summer](summer.jpg) | 1 of 100872 | 5 | 129 / 129 | 58566 / 58246 | 31 / 31 |
| [title](title.jpg) | 4 of 100872 | 13 | 663 / 663 | 89228 / 88826 | 28 / 28 |

The six small ones (`title` 4 pixels, `ravine-rim` 14, and one each in
`fog`, `fps-flash`, `codex-hollow` and `summer`) were not run to ground.
The single pixels are a unit or a few of 255; in the other two
they are single dither cells, a brightness that sat on one of the grade's
63 steps and fell the other way. The likeliest
cause is the order of a float operation in a shader the driver compiles
from different text. That is a guess, not a finding.

## The cost

After thirty seconds of each way (1800 frames; software GL, so counts).
`main` on r128 / this branch on r187:

| way | programs | programs linked | draw calls | triangles | heap MB | GPU geometries | GPU textures | time to title ms | three.js warnings | errors |
|---|---|---|---|---|---|---|---|---|---|---|
| field | 31 / 31 | 31 / 31 | 355 / 355 | 73024 / 72666 | 26.4 / 28.6 | 427 / 427 | 32 / 30 | 8091 / 8134 | 1 / 0 | 0 / 0 |
| path | 28 / 28 | 28 / 28 | 242 / 242 | 51992 / 51656 | 22.1 / 22.8 | 239 / 239 | 31 / 29 | 5692 / 5875 | 1 / 0 | 0 / 0 |
| ravine | 28 / 28 | 28 / 28 | 262 / 262 | 58670 / 58334 | 25.2 / 25.9 | 258 / 258 | 34 / 32 | 5998 / 6521 | 1 / 0 | 0 / 0 |
| mire | 25 / 25 | 25 / 25 | 205 / 205 | 29586 / 29582 | 18.1 / 19.2 | 212 / 212 | 26 / 25 | 1858 / 1931 | 1 / 0 | 0 / 0 |
| castle | 29 / 29 | 29 / 29 | 243 / 243 | 51994 / 51658 | 22.1 / 22.9 | 239 / 239 | 32 / 30 | 5253 / 5395 | 1 / 0 | 0 / 0 |
| codex | 30 / 30 | 30 / 30 | 173 / 173 | 47212 / 46884 | 39.3 / 43.8 | 249 / 249 | 26 / 24 | 11142 / 11156 | 1 / 0 | 0 / 0 |

r128's one warning is `'flatShading' is not a property of this
material`; r187 has none. Fewer GPU textures because a cloned texture now
shares its source's upload. **The heap is 1 to 2 MB larger in play and 4.5 MB
larger after eight codex entries** (not run to ground; the library's own
tables are bigger). The time to title is wall clock with both
files running at once on a busy machine: read it as "no different", no
finer.

## Size

| | r128 | r187 |
|---|---|---|
| the three.js line | 603,352 bytes | 591,158 bytes |
| ...gzipped (-9) | 148,655 | 148,593 |
| `index.html` (before the merge of main) | 2,190,277 | 2,178,106 |
| ...gzipped | 673,394 | 671,989 |
| as served (`minify.js`), gzipped | 439,072 | 437,746 |
| as served, after the merge of main | - | 440,411 |

The line carries 77 exports: the 72 `THREE.Name`s the game uses and five more
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
