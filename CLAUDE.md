# BONEPATH — working notes for Claude

A haunted PSX-style souls-like that runs on a phone. **The whole game is
`index.html`**: one self-contained file, no build step to run it, opens
from disk. This file is the RULES, one line each. **Every reason,
measurement and dead end is in `docs/NOTES.md`**: search it by the code's
own names before changing a system, and put the story of any new rule
there. (The longer version of these rules, as they stood on 2026-11-16,
is kept whole at the end of NOTES under "The long rules".)

## Before you touch anything

- **One line of `index.html` is the three.js r187 bundle** (591 KB,
  minified, defining `window.THREE`). It is BUILT, never edited:
  `tools/build/three/build.js` makes it (WebGL renderer only, only the
  `THREE.Name`s the game uses; r128's look from `tools/build/three/legacy.js`). A new
  name is a rebuild (`cd tools/build/three && npm ci && node build.js`);
  `parse` fails until then. Filter it out of every grep:
  `B=$(awk 'length($0)>5000 {print NR}' index.html); grep -n X index.html | grep -v "^$B:"`
- The game's first comment after it is a **CONTENTS list**: keep it current.
- A syntax error anywhere kills the game. Run the checks before every push.

## Branches, version, deploy

- **`main` is the only live branch. Work there.** An instruction to work on
  `claude/dark-souls-mobile-poc-xnquc4` (or any other) is stale: say so.
- `.github/workflows/pages.yml` deploys from `main` alone; never add a second branch. The
  `github-pages` environment stays "No restriction".
- Version: `BP_MAJOR` by hand; `pages.yml` stamps the line
  `const BP_BUILD='dev',BP_BUILT='';` by `sed`. Never reformat that line.
- The served page is `tools/build/minify.js`'s output (comments and
  whitespace only, after the stamp); the repo file is never minified. It
  fails the deploy if the `BP_BUILD`/`BP_MAJOR` lines do not survive.
- Godot files (`project.godot`, `.tscn`) mean the wrong branch.

## The aesthetic is the point (a deliberate PS1 tribute)

- 216 internal lines, upscaled nearest. Never raise the DEFAULT. A player's
  finer raster (`VIEW.res`) keeps the vertex snap and every dither on the
  216-line grid (`resK`): a new screen-space pattern divides `gl_FragCoord`
  by `uResK`.
- Keep: clip-space vertex snap (the wobble), dither, grain, vignette,
  coarse grade, flat-shaded low-poly hulls. No smooth normals, PBR or soft
  shadows. Improve art direction within the constraint, never fidelity.
- Everything procedural at boot (256px canvas textures, WebAudio, code
  geometry). **No asset files.** Exceptions: `icons/` (painted by
  `tools/make_icons.py`; re-run it, never edit a PNG), `sw.js`, the
  manifest. A new file the page needs offline goes in `sw.js`'s `KEEP`.

## Performance (60fps on an iPhone; draw calls are the number)

- `antialias:false`, `setPixelRatio(1)`, no realtime shadow maps.
- **WebGL2 only** (three dropped WebGL1); a browser without it gets a
  message before the renderer is made. `hazeScene` is always its own pass.
- **Never change the number of lights.** `LPOOL` is a fixed pool in every
  mode: a light goes through `addLight` into `lanternLights` (or
  `LPOOL.extra`), never `scene.add`. `tileCommit` skips the pool.
  `bladeLight` stays at 0 for ever. Flashes, flames, glows: never a light.
- **Folding:** `bakeStatic(root)` (a cathedral, a tile group), `bakeWorld()`
  (field and Mire, never the path: tile capture counts `world.children` by
  index). Register anything interactive
  (`breakables`, `obstacles`, `MARKABLE`, `lanternLights`, `scars`) before
  the fold. Anything that animates a world mesh or reads `mesh.parent`
  calls `unbake(o)` or checks `BAKED`. `unbakeGroup(g)` asks by record.
- **The cathedral's shade** (`bakeSky` → `aBake`, one byte a vertex)
  scales the HEMISPHERE only, through `skyTwin` (shares the original's
  colour objects, keeps its `onBeforeCompile`). Never in a vertex colour,
  never the moon's shadow, only on a fold that never moves. `bakeSky`
  QUEUES; `skyTick` does one step a frame; `skyDrain` runs after
  `buildWorld`. `?sky=0` is off.
- **Glows are not Sprites:** `addHaze`/`addWisp`/`glow()` return an
  Object3D with a `material` (`color`, `opacity`); `glowSync` draws each
  pass as one mesh, made before the world. Never `new THREE.Sprite` for one.
- **Host rigs are folded** by joint and material (`foldRig`, `RIGFOLD`),
  before any tint, skipping what the rig names in its own properties. The
  hero's body is never folded. A pew is `PEW.geo`; a path bone pile is
  folded where it is made.
- The ground paint uploads its dirty box (`flushPaint`, `GP.box`); a wipe
  sets `GP.full`.
- LOD (`lodUpdate`) goes by APPARENT size. Never swap the boss, a mini,
  anything dead, ragdolling, burning or scattering. A part on a rig's
  `root` is LOD'd unless `userData.lodKeep`. Only `lodUpdate` writes
  `rig.body.visible`.
- `geoCache` keys go through `gq()`. The pause renders every 5th frame,
  the title every 3rd. The world is within ~80 units; the far plane is
  measured (dense fog moves it via `G.fogK`).

## Rules and traps, by system

### three.js (r187, wearing r128's light)
`legacy.js` and `build.js`'s `PATCHES` put r128's look back; each is
checked at build or load. Proof: `docs/three-r187/README.md`.
- **Lambert is lit per VERTEX** (`lights_lambert_vertex`, `vLightFront`,
  `vIndirectFront`); `flatShading` on Lambert does nothing.
  Never restore three's per-fragment Lambert.
- Light intensities are r128's (no candela); a point light reaches zero AT
  its `distance` (`(1-d/distance)^decay`); every `PointLight` names its decay. Only Lambert and
  Phong carry the old units.
- `ColorManagement.enabled=false`: a hex is the number it says; "as seen"
  colours go through `convertSRGBToLinear`. sRGB textures:
  `tex.colorSpace=THREE.SRGBColorSpace` (was `.encoding`), stored RGBA8,
  decoded in the shader. A render target's `colorSpace` is what is WRITTEN
  into it (`rt`, `hazeRT`, `heroRT` are sRGB). A texture read through the game's own uniform
  is raw: `sRGBTransferEOTF(...)`.
- Shader names: `vMapUv` (not `vUv`), `<colorspace_fragment>` (not
  `encodings`), `sRGBTransferEOTF` (not `mapTexelToLinear`/`sRGBToLinear`),
  `geometryNormal`. **A string replace that matches nothing is silent**:
  run `tools/three-parity` (it counts `misses`) after any `onBeforeCompile`.
- Partial upload: `attr.addUpdateRange(start,count)` (not `updateRange`). A
  raw GL call on three's texture goes through `renderer.state`
  (`bindTexture`, `pixelStorei`), never a bare `gl.pixelStorei`.
- `MeshDepthMaterial` RGBA packing: R is the TOP byte.
- The nine maps the game never sets (`alphaMap`, `specularMap`, `envMap`,
  `aoMap`, `lightMap`, `emissiveMap`, `bumpMap`, `normalMap`,
  `displacementMap`) have no uniforms (`legacy.js` 8): setting one throws.
  Wanting one means putting its uniforms back there first.

### Boot order
- Function DECLARATIONS, not const arrows: `isThief`, `adsWalk`,
  `buildGunModel`, `isGunKey`, `fpsRespawn`.
- `const FPS` beside `G`, above `player`; `REAPER_T` below `player` (safe
  only because `takeMark()` never runs at boot). Do not
  move either. `buildGunModel` touches neither `GUNS` nor `FPS`.

### Shading, colour, textures
- Brick swim is capped (`PSX_AFFLIM`, `?affine=`): lower the cap, never add
  geometry. `WSEG` is for per-vertex lighting.
- The grade's S-curve is on `min(c,1)`; keep it monotonic.
- A textured `color` multiplies white: brighten with `emissive` or
  `multiplyScalar`, never a tint lerp.
- `Material.clone()` drops `onBeforeCompile`: reapply `psx()`.
- **Every canvas reaches WebGL through `cleanCanvasUploads`** (Safari),
  AFTER `'use strict'`, before the renderer. Never upload a canvas another
  way (`ImageBitmap`, `OffscreenCanvas`, a raw `texImage2D`) without its
  `getImageData` pixels. Repainted canvases use
  `willReadFrequently`. `?rawcanvas` turns it off.
- Sky dome: horizon is the texture's MIDDLE. Radial gradients are absolute.
- Wandering marks in `road` are `source-atop`; `road` wraps in y.
- **An absent mesh is back-face culled first** (roads wind `(a,a+2,a+1)`);
  recolour it red to prove it is there.
- Every ground geometry carries `aTrail` (a disabled attribute is not 0).
  `TRAIL_WIG` is also in `TRAIL_GROUND.frag`: change both.
- Path textures are flagged `bpOwn` and disposed on teardown.
- Shader-warm stand-ins (`clipWarm`, `warmEffects`) carry the real
  attribute set; programs live for ever in `PROG_KEEP`.
- Pixel faces need `OL` 1.6 outlines; the heart is `HEART_PX` (HUD and drop).
- A bright colour on a dark texture (`rag`, `cloth`) reads black under Lambert: use an
  untextured `lam` with the raw hex.

### Snow and marks
- **`onStone(x,z)` is asked inside every producer** (`snowStamp`,
  `printSnow`, `snowPuff`, `trailPush`, `trailHead`), never at call sites.
- Prints are `TROD`, the furrow `TRAIL`; `PLOUGHS()` picks one. No mark
  gets its own mesh. Marks sit above the ground and the road ribbons.
- `snowSink()` never changes `heightAt`.
- `wearSnow` is the hero's wardrobe (by height; boot materials cloned).
  **Weapon meshes (`wep`) are never tinted.** `tintBlade` writes into
  `rig.snowDress`'s `base`.

### The pilgrim
- Swing weight is `seg4` and under-damped `JOINT_K`/`JOINT_D`; keep the
  overshoot. New ways into `attack` call `player.chainIn()` (`ATK_ENTRY`),
  never `t=0`. `CHAIN_OUT`
  .88, `CAST_OUT` .80; a short arc: check `seamDur` first.
- `seamGrab`/`seamBlend` run right before `updateRigExtras`; new joints go
  in `SMOOTH_JOINTS`. **`rig._sm[k]` is SIX numbers** (a vanished limb:
  look for NaN there).
- Rolling attack fires at `R.ROLLED`, not `R.LAND`; roll `SPD` is balance. `HEART=10`; enemy `dmg` is a
  multiple of `HEART/2`.
- `die(kx,kz,force,kind)`, kinds `blade`/`bone`/`heavy`/`poison`/`buried`/
  `fall`; `respawn()` calls `rebuild()`. **hp is parked at 999 across a
  non-lethal `severLimb`.**
- The dead frame runs `updateRigCloth` only; `_spNow` zeroed in `die()`.
- Only `floored` and `poseFall` write the living root's pitch.
- **A `grabbed` pilgrim:** `takeHit` returns early; anything new on a hit
  asks about `grabbed`.
- `AudioSys.setBlade(k)` in `rebuild()`; never branch on `LOADOUT` in
  AudioSys. `ultraThud` never sets hitstop or `quake()`.
- No imbued glow; motes held back in first person.
- Wand: `bladeMesh` is the ROD; no emissive floor; `rig.oneHand`; bubbles
  `BUB_MAX` 8, never a light. Bat: own `weapon()` and `BCARRY`.
- Test the iaido draw away from the plinth. Home run and bat shatter:
  detached joints get stubs, deepest first.

### Input
- **Keep every way out of the stick** (`endPtr`/`dropStick`,
  `lostpointercapture`, the window catch, `reapStale`, the re-seat,
  `livePtr`). `livePtr` is emptied only by up or cancel.
- `fireDownT` is stamped in `fireDown()`. A blade behind the eyes keeps
  the shooter's buttons. `bindBtn` wraps `setPointerCapture` in a try.
  `lockAuto` gates the LOCK, never its consumers.
- The pad (`Input.pad`) is polled at the TOP of `frame`, before the pause
  check, and writes the same `st`. Its cursor presses with `pointerdown`:
  a new pressable thing needs a class in `padItems`.

### Camera
- Clamped inside the world (hex on the field, `|x|<20.5` on the path;
  separate), walked back to the first stone (`camStone`).
- The lock looks at the chest (`markY − LOCK_CHEST`); the one exception is
  a gun behind the eyes.
- **A gun owns `G.camPitch`'s rest**: one writer, gated on `G.camHeld`.
- `VIEW.fov`/`VIEW.sens` are the player's. Aimed fields go through `adsFovOf`; `applyFov()` returns the lens to
  `baseFov()`, not `VIEW.fov`. The shake is an angle (`SHAKE_ANG`), never
  the round's (`gunRay` reads `FPS.fwd`).
- Cutscenes animate nothing: camera tracks, four beats, epithet above and
  name below, bearings from the pilgrim's line, keep `cutSubject` and
  `cutHold`, sights down, end with `camSnap()`.

### First person and guns
- **No blade viewmodel, ever.** The eye is `FPS.eyeY` 1.74 on his own body.
- The body is masked by LAYER (`fpsMaskRig`, layer 3), never `visible`.
- **Only `updateGun` shows the viewmodel; only `syncFpsRig` puts it away.**
  What a GUN owns goes in `updateGun`; only what the viewmodel owns goes in
  `updateViewmodel`.
- ADS is computed (`ADS_EYE`, `sightH`, `sightZ`, `adsZs`/`splitAds`). Never
  lower `camera.near`. **Project the barrel of any new pose**; carries are
  roll and drop, never yaw.
- Sights cap you to a walk (`adsWalk`); `gunGiving` caps a retreat only.
- The crosshair is in the screen's own measure. The muzzle flash is
  depth-tested, one size, never a light.
- **Gun materials are shared** (`gunMats()`): never tinted, no emissive
  floor. `g.port` stays out of `vmParts`.
- **A new caller of `gunSwapped` checks `FPS.reloading`.** Only a dodge
  cancels a reload; the reload is one plan (`RELOAD`, `reloadPlan`).
- Magazines `magA` in `magG`; slides `slideA` in `slideG`.
- **`addObstacle`/`addWall` take the crown's world `top`**; breakables go
  through `addBreakable`; `BP.obstacles.filter(o=>o.top==null)` stays empty.
- `hitscan`: head, limb, trunk. An area hit reports its hitmarker after
  the loop.
- `'sniper'` (the Barrett) sites need a `'kar98k'` case. Keys never change.
- Sights: a second iron set needs `ring:true`; `attOf` degrades unknowns to
  `iron`; nothing crosses an aperture or the ACOG's bore; `M.tube` is
  `DoubleSide`; the UMP ring's `ay2` ≥ .0965; the rear element shrinks.
- Guns are `vmOct`; a cut is narrower and a step off its colour; metal is
  a saturation ramp; guns differ by proportion. `#fpsCtl #fbSwap`.
  Reserves through `resOf`/`setRes`.
- Harness: `fireGun` needs real frames; set `FPS.adsOn`, not `FPS.ads`.

### Audio
- Background through `musicMaster` at `BG_GAIN`. `noiseBuf` is BROWN;
  clicks use `white:true`. Reload foley `metal`/`mscrape`, no triangle
  tone; measure 10ms RMS. Hitmarker: the band, not the level. Brass:
  shorten, never raise. Sniper tail is density. `quake()` is the rocket's.

### Horrors
- Hollow 85, thrower 70, brute 140; Barrett 96, Kar98k 60, red ×2.2
  (rounded) are tied to them.
- Fire through `fireBite(e)`, never `burnT`; `dowseFlames` on death and recycling.
- `startRagdoll(...,force)` is a boss's only ragdoll.
- Pilgrim and horrors leave a rim by different rules (`groundGone` vs
  `overBrink`); never unify. `groundGone` is 0 inside the lip. `ragFree`.
- Arrows are ballistic; the hit sweeps the step's heights.
- Keep `packSteer`'s bounding test; `alertPack` is a beat, not a stun.
- `bigLead` first; the draw loop breaks on an empty list. **Changing a
  template's cost: re-measure the THINNEST seed.**
- The rise: depth per metre; a planted hand is a solve; `sstep` blends;
  `riseRate` reads three widths; uninterruptible. Never `easeOut`. Harness:
  exclude `rig.imp` and `lodKeep` from heights.
- A parry is a blow aimed at you (not `bash`, facing him).
- Bell-Called: the bell is `tough` + `onHit`; the skull is WARDED, not
  `untouchable`;
  `barFrac`; floaters set `flies` (`aloft(e)`); the jaw opens on +x; hands
  keep `body.scale.x`'s sign; skull heights are measured.
- The Arm: `this.x/z` is the palm (the root during its scene); `spheres()`;
  a grab is a player state; its first tell is at home, ahead of him.
- **Own-class horrors have none of the host's states:** writing
  `'stagger'` asks `staggers(e)`; `'held'`/`'down'`, backstab and finish
  targets ask `isHost(e)`. `alertPack` wakes a `'dormant'` horror only if it
  has `wake()`: a new dormant class has one or is skipped.
- Frostbound and Shade never `patrol()`.
- **Every kill's marrow goes through `shedMarrow`** (and `loreFell`). A new
  `kind` maps in `cxKeyOf`; one with its own entrance goes in `MEET_SCENE`.
- `DEF.might` is applied inside every `takeHit`.
- Siege-walkers need `zombieMove`'s tree detour. `reaperFinish` spends
  kills, not the Warden. `fellTree` pivots at the foot.
- NaN spheres: the guard is in `tip()` and `boltLine`/`boltArc`.
- **A shield is decided BEFORE the blow** (`shieldBlocks` from `meleeHit`,
  `gunHit`, `arrowStrike`); area attacks pass it; `gunHit`'s early return
  still returns `{kill,head}`. Shields by `posHash`.
- Fog wraith only while `RUN.weather==='fog'` (`wraithTick`), one at a time; `leave()` gives no
  marrow.
- **Wyrm's body follows the head's `trail`**; its `x/z` is the nearest part
  above soil; `R.wyrm` is the run's LAST draw; scenes shot along the trench.
- Lamplighter: `lampNear(e)` cached 20 frames; extra blow via `hd`, never
  `this.dmg`; its
  lantern is a Basic box and a sprite.
- Hanged: rope a child of the root via `worldToLocal`, `lodKeep`;
  `rig.humanoid=false`; uses `'grabbed'`.
- **Build drops go through `sowOdd`**; variants by `posHash`, never `rnd()`.
- Drowned Bride: SUNK (`BRIDE.SUNK`), never hidden; ripples ride the root;
  floor `pathHeightAt`.
- Gargoyle: perch is an `Object3D` (`PERCH`, `perchAdd`); `gargTick` wakes
  lazily; its stone is a CLONE; never under a roof (`inNave`).
- Frostbound: `Enemy.frost` by `posHash`; dormant ON the ground in
  `encase`; `wake()` thaws; blows via `frostBite`; `ICE` patches are marks.
- Ossuary King: own class, humanoid rig, `humanoid=false`; `KING.BREAK`;
  in pieces only the heart is hit; its bowl by `posHash`.
- Shade: `Enemy.shade`; dormant is `root.visible` false; roll and flask in
  `shadeCall`; a new attack state goes in its list.
- **The Rider is two bodies**: mounted `RiderHorror`, on foot
  `Enemy('boss',{rider:true})`, so **a `this.boss` rule meaning the Warden
  also checks `!this.rider`** (`onBossDead`, the nave clamp). `riderYard`,
  `riderFell`. The horse's
  folded parts (`hbs`/`nks`/`hds`) never move: moving parts go on joints.

### The world, the path and the modes
- **Each per-tile roll has its own `hash32` stream**; chunks shape by
  `posHash`, never `rnd()`.
- Terrain features carry `tp0` and `tp1`. A ravine run's feature rides in
  its LAST tile (`ravCarry`); runs never cross a cathedral.
- **Fixed-height builds are lifted by the tile's base** (`offY`,
  `pathBase`). **Tile-0 builds go inside a `tileCapture` window** in
  `buildWorld`.
- Loops start at `PATH.lo`. `teardownTile` empties arrays IN PLACE.
  `bakeStatic` on a tile is fine; `bakeWorld` on the path is not.
- **A path chunk cannot see its own road**: `roadPlan(t)` with
  `BUILD.plan` (then `nearRoad` ignores every other road); a new special adds its road shape there; axis-centred
  chunks need a path branch gated on `BUILD.plan`.
- Ravine trunks are `wood` obstacles; `free()` keeps the trail;
  nothing in a stream bed (`streamNear`).
- **Every piece of foliage goes through `leafMat()`.**
- **Anything `applyTime` writes goes into `xfSnap`/`xfSet`**; `xfTick`
  runs after `updateWeather`. Weathers are checked against `WX_NAMES`.
- Roads: `layPath`, option object `opt`. The ravine trail is painted
  (`TRAIL_GROUND`, `aTrail`).
- Slope limit judges the MESH (`slopeHold`). Path sides are a cliff
  (`pathEdge`, `PATH.backZ`); `drainSpawns` clamps inside `pathEdge−1.4`.
  A bridge is a deck in `heightAt` (`deckAt`). Mileposts dispose canvases.
- **The castle** (`PATH.castleK` 30; `?castle=N`) is ONE table, `CASTLE`,
  read by the build, `pathGround`, `pathEdge`, `castleStone`/`castleWalk`;
  **new stone also goes into `castleStone`**. Gates are obstacles removed
  by `castleTick`; the winch is `tough` + `onHit`.
- **The Mire (`DEF`)**: field-only gates are `!PATH.on&&!DEF.on`; every
  `HW/HL/PW/PL/PH` rule needs `!DEF.on`; never `G.bossActive` (a round's
  boss is a `mini`); the house takes no player damage; it is at
  `MIRE.hx/hz`.
- Cathedral collision (`HW`/`HL`/`WALLT`, plinth, portal) is fixed;
  crockets are tetrahedra; `srand(444)` precedes the vault.
- The codex keeps `G.mode` 'play'. **A new horror needs a `make` entry**;
  new weapons, armour, weathers need words in `CX_BLADES`/`CX_ARMOUR`/
  `CX_WX`. `opts.plain` stops the red roll.

### Interface
- Records are localStorage under `bp_` (`saveOut` copies them).
- **`sw.js` is NETWORK FIRST, never cache first**; only over http(s); lets
  `?check` through; fetches the page `no-cache`. Never under `file://`.
- `#toast` z-index 12. Panels tab with `panelTab`; `setPaused` refuses
  while the shop is open. Thin sliders get a 22px hit box and stopped events.
- **The title is a menu** (`MENU`, `menuInit`, `menuGo`): three ways and
  the codex; path and ravine are ONE way with two routes (`MENU.route`).
  Another way reloads with `?go=1` (`html.going`). `menuInit` runs after
  `buildWorld`. Sound starts on the first touch (`wakeOnTouch`).

## How to measure (each one settled an argument)

- An effect's pixels: render twice (on, hidden) and difference.
- Anything's size on screen: project its vertices through the camera.
- What fills the picture: a `Raycaster` probe from the camera.
- A missing small part: recolour it. A hinge's sign: `matrixWorld` at two
  openings. A NaN producer: patch `computeBoundingSphere`.
- Stalls: hook `gl.linkProgram`, time `renderer.render` per frame.

## Conventions

- Commit messages are evocative prose in the game's voice, e.g. *"Sound,
  third pass: voices for the hero and the Fallen One, slush for the
  Unburied."*
- `README.md` is the design document: update it in the same commit as a
  behaviour change. New rules go here; their stories in `docs/NOTES.md`.
- Pushing `main` deploys to https://arterramarketing-hub.github.io/bonepath/

## Testing

```sh
cd tools/check && npm install     # once
node run.js                       # everything, ~8 minutes
node run.js parse boot            # the quick pass, ~1 minute
```

`parse` (scripts compile; the three line carries every name), `boot` (all
four modes), `codex`, `path`/`ravine` (~70 hexes), `road`, `castle`,
`leak` (hex 80, ceilings). Run at least `parse boot` before every push,
and everything after touching the path, the codex or a registry.
`.github/workflows/check.yml` runs it all on every push. `tools/check/run.js`
finds Chromium at `$CHROME_PATH`, then `/opt/pw-browsers`; a harness begins
a run with `enter(pg,'#modeX')`.

**`tools/three-parity` holds the picture still**: `shots.js` takes ~40
frozen frames, `compare.js` differences two sets; the floor is zero. Take
a set before and after anything touching the renderer, a shader patch, a
material or the three line. `window.BP` is the harness handle
(`BP._reg()` counts registries); add new systems to it.
