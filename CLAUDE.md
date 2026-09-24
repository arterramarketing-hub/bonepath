# BONEPATH — working notes for Claude

## What this project is

A haunted PSX-style souls-like that runs on a phone. The **entire game is
`index.html`** — one self-contained file, no build step, no install, no
server. Open it in a browser and it runs.

This file is the RULES and the TRAPS, kept short because it is loaded into
every session. **The reasons, the measurements and the dead ends are in
`docs/NOTES.md`** — search it by the code's own names before changing a
system, and put the story of any new rule there.

## Read this before you touch anything

**One line of `index.html` is the inlined three.js r128 bundle — a single
minified 603 KB line.** It will swamp every grep. Its line number moves with
every edit above it, so find it, then filter it out:

```sh
BUNDLE=$(awk 'length($0)>5000 {print NR}' index.html)
grep -n "PATTERN" index.html | grep -v "^$BUNDLE:"
```

Everything after that line is the game (~20,700 lines). **Its first comment
is a CONTENTS list** of the major sections with the names to search for.
Keep it current when you add a section.

A syntax error anywhere takes the whole game down. Run the checks (see
*Testing*) before every push.

## Branch layout

**`main` is the default branch and the only live one. Work there.**

It was once called `claude/dark-souls-mobile-poc-xnquc4`. If you are a
session told to work on that name, or any other branch: **that instruction
is stale — work on `main`**, and say so, rather than pushing the old branch
back into existence (it happened once, and stranded `main` behind it).

`.github/workflows/pages.yml` deploys from `main` alone. **Do not add a
second branch to it.** A push anywhere else stops the site updating, which
is the signal you want.

The repo once held an unrelated Godot project; it was removed. If you find
`project.godot` or `.tscn` files, you are on the wrong branch. Recovery SHAs
are in `docs/NOTES.md`.

## The aesthetic is the point

This is a **deliberate PlayStation 1 tribute**, not a game that happens to
look dated. Preserve it:

- Low internal render resolution, upscaled nearest-neighbor. Never "fix"
  the blurriness or raise the resolution.
- Clip-space vertex snapping (the PSX wobble). Keep it.
- Dithering, film grain, vignette, coarse colour grading.
- Flat-shaded low-poly hulls. No smooth normals, no PBR, no soft shadows.
- Everything procedural, generated at boot: textures are 256px canvases,
  audio is synthesized WebAudio, geometry is built in code. **No external
  asset files.** The single-file property is non-negotiable.
  The one exception is the home-screen icon (`icons/`), because a launcher
  reads it before the page runs. `tools/make_icons.py` paints it; re-run the
  script, never edit a PNG. Nothing the GAME draws may come from disk.

When asked to improve graphics, improve *art direction within the
constraint* — lighting, colour, silhouette, texture design. Do not
modernize toward higher fidelity.

## Performance

Target is 60fps on an iPhone. `antialias:false`, `setPixelRatio(1)`, no
realtime shadow maps. Keep it that way. The draw call count is the number
that matters on a phone; the frame counter is under *The field (testing)*
on the pause screen.

- **Never change the number of lights in the scene.** three.js recompiles
  every lit shader when it changes. `LPOOL` is a fixed pool; `bladeLight`
  stays at intensity 0 for ever (do not delete it, do not light it).
  Muzzle flashes, flames, bubbles, glows: sprites and haze, NEVER a light.
- **Folding.** `bakeStatic(root)` folds a cathedral (or a tile group);
  `bakeWorld()` folds the field's and the Mire's scenery, never the path's
  (tile capture counts `world.children` by index). Anything interactive
  must be registered (`breakables`, `obstacles`, `MARKABLE`,
  `lanternLights`, `scars`) before the bake. **Anything that animates a
  world mesh or reads `mesh.parent` must call `unbake(o)` first or check
  `BAKED`.** `unbakeGroup(g)` asks by record, not by traversal. A `fold`
  breakable lets its group fold and claims only its `obs`.
- The pause screen renders every fifth frame and the title every third.
- LOD (`lodUpdate`): the threshold is APPARENT size, not distance (scopes).
  Never swap the boss, a mini, anything dead, ragdolling, burning or
  scattering. A part added directly to a rig's `root` is LOD'd unless
  tagged `userData.lodKeep`. `lodUpdate` owns `rig.body.visible`; nothing
  else writes it.
- `geoCache` keys are quantized by `gq()`; keep every rig size going
  through it or the cache grows without bound.
- The world sits within ~80 units of the origin. Do not pull the far plane
  in for clear air — it was measured. Dense fog moves it via `G.fogK`.
- Folding and LOD figures, and every other measurement, are in NOTES.

## Rules and traps, by system

Each line is a rule. The why is in NOTES under the same names.

### Declaration order (boot)

- **Function DECLARATIONS, not const arrows**: `isThief`, `adsWalk`,
  `buildGunModel`, `isGunKey`, `fpsRespawn`. Each is reached at boot before
  its line; a const puts it in the temporal dead zone and kills the game.
- `const FPS` is declared beside `G`, ABOVE `player`. `REAPER_T` is below
  `player` and safe only because `takeMark()` never runs at boot. Do not
  move either.
- `buildGunModel` touches neither `GUNS` nor `FPS` (the rig calls it at boot).

### Shading, colour and textures

- The brick swim is capped in the shader (`PSX_AFFLIM`, `?affine=`). If
  bricks shear, lower the cap; never add geometry. `WSEG` segmenting is for
  the per-vertex lighting.
- The grade's S-curve is shaped on `min(c,1)`; over-bright goes white.
  Keep it monotonic.
- A textured material's `color` is a multiplier over white: brighten it
  with `emissive` or `multiplyScalar` above one, never by lerping a tint.
- `Material.clone()` drops `onBeforeCompile`: reapply `psx()` or the part
  stops wobbling.
- Sky dome: the horizon is the MIDDLE of its texture; paint the top half.
  A radial gradient uses absolute canvas coordinates — scale about the
  lobe's own centre.
- Anything drawn into the `road` texture that can wander is drawn
  `source-atop`; `road` wraps in y.
- **A silently absent mesh is back-face culled first.** Check the index
  order (roads wind `(a, a+2, a+1)`). Then recolour it red to prove it is
  there before moving it.
- A disabled vertex attribute does not read 0: every ground geometry
  carries `aTrail` (zeros on the field and in the Mire).
- `TRAIL_WIG` is repeated in GLSL inside `TRAIL_GROUND.frag`. Change one,
  change both.
- r128 textures have no `userData`; the path's own textures are flagged
  `bpOwn` and disposed on teardown.
- A stand-in for shader warming (`clipWarm`, `warmEffects`) carries the
  same attribute set as the thing it stands for; programs live for ever in
  `PROG_KEEP`.
- A pixel face needs a pixel-sized outline (`OL` 1.6 of a cell), or the
  outline closes its gaps. The heart is `HEART_PX`, one map for the HUD
  and the drop: change it once.
- Icon: a gap thinner than one cell does not render.
- A strong colour on a dark texture (`rag`, `cloth`) reads near black under
  Lambert, whatever the colour. For a flat bright colour (a banner) use an
  untextured `lam`, and give the hex raw, not through `lin`.

### Snow and marks

- **`onStone(x,z)` is asked inside every producer** — `snowStamp`,
  `printSnow`, `snowPuff`, `trailPush`, `trailHead` — never at call sites.
  Every copy of the 4.5 reach is `onStone`.
- Boot-prints are `TROD`, the furrow is `TRAIL`; `PLOUGHS()` picks one,
  never both. No mark gets its own mesh.
- Marks sit ABOVE the ground and above the road ribbons.
- `snowSink()` sinks bodies and never changes `heightAt`.
- `wearSnow` is the hero's whole wardrobe: parts chosen by height up the
  body, boot materials cloned. **Weapon meshes (`wep`) are never tinted**
  (their materials are shared). `tintBlade` writes into
  `rig.snowDress`'s recorded `base`.

### The pilgrim

- Swing weight: `seg4`'s ease-in and the under-damped `JOINT_K`/`JOINT_D`.
  Do not "fix" the overshoot.
- Any new way into `attack` calls `player.chainIn()` (`ATK_ENTRY`), never
  `t=0`. `CHAIN_OUT` is .88; `CAST_OUT` .80. If an arc looks short, check
  `seamDur` against the weapon's wind before touching a pose.
- `seamGrab`/`seamBlend` run immediately before `updateRigExtras`. New
  joints go in `SMOOTH_JOINTS`.
- **`rig._sm[k]` is SIX numbers.** A three-wide snapshot NaNs the joint and
  it vanishes silently. A vanished limb: read `_sm` for NaN first.
- A rolling attack fires at `R.ROLLED`, not `R.LAND`. Roll `SPD` is balance.
- Life: `HEART=10`; every enemy `dmg` is a multiple of `HEART/2`.
- `die(kx,kz,force,kind)` — kinds `blade`/`bone`/`heavy`/`poison`/
  `buried`/`fall`. `respawn()` calls `rebuild()`.
- **hp is parked at 999 across any `severLimb` call** that is not meant to
  kill (it kills at zero and would count the marrow twice).
- The dead frame does NOT run `updateRigExtras`; it runs `updateRigCloth`
  only. `_spNow` is zeroed in `die()`. The dead root is placed by whoever
  posed it.
- `floored` and `poseFall` are the only writers of the living root's pitch;
  it is reset every other frame.
- **A `grabbed` pilgrim**: `takeHit` returns early after damage. Anything
  new that changes his state on a hit must ask about `grabbed`.
- `AudioSys.setBlade(k)` is set in `rebuild()`. Never branch on `LOADOUT`
  inside AudioSys. Anything else that swings names its own steel.
- `ultraThud` never sets hitstop and never plays `quake()`.
- The imbued glow is gone for good: an element is a shade on the steel.
  Motes are held back in first person.
- The wand: `bladeMesh` is the ROD (the orb is Basic, no emissive). No
  emissive floor on the wizard. One-handed weapons set `rig.oneHand`.
  Bubbles: `BUB_MAX` 8, two draws each, never a light.
- The bat: its own `weapon()`, its own carry (`BCARRY`). Trace the barrel
  before touching a swing pose.
- The iaido draw: test it away from the cathedral plinth.
- Home run and bat shatter: detached joints get empty stubs; deepest first.

### Input

- **Do not remove any of the stick's ways out** (`endPtr`/`dropStick`,
  `lostpointercapture`, the window-level catch, `reapStale`, the re-seat,
  and `livePtr`). `livePtr` is emptied by up or cancel and nothing else.
- `fireDownT` is stamped in `fireDown()`, whichever button went first.
- A blade behind the eyes keeps the shooter's buttons; the right half is
  the look. This was tried both ways.
- `bindBtn` wraps `setPointerCapture` in a try.
- `lockAuto` gates the LOCK, never its consumers.

### Camera

- The camera is clamped inside the world (hex on the field, `|x|<20.5` on
  the path — keep them separate) and walked back from its look point to
  the first stone (`camStone`).
- The lock looks at the chest (`markY − LOCK_CHEST`). The only lock
  exception is a gun behind the eyes.
- **A gun owns `G.camPitch`'s resting value.** One writer, gated on
  `G.camHeld`. Do not add a second.
- `VIEW.fov`/`VIEW.sens` are the player's. **Every aimed field goes through
  `adsFovOf`.** `applyFov()` is the one place the lens returns to rest; the
  rest lens is `baseFov()`, not `VIEW.fov`.
- The shake is an angle (`SHAKE_ANG`) and the picture's, never the round's
  (`gunRay` reads `FPS.fwd`).
- Cutscenes animate nothing; they are camera tracks over existing
  entrances. Four beats; epithet above, name below. Bearings are from the
  pilgrim's line. `cutSubject` and `cutHold` both stay. A scene puts the
  sights down and ends with `camSnap()`.

### First person and guns

- **There is no blade viewmodel, and there must not be one again.** The
  camera sits at the eye (`FPS.eyeY` 1.74) and the pilgrim's own arms and
  weapon are what you see. Re-measure the hit spheres before moving the eye.
- The body is masked by LAYER (`fpsMaskRig`, layer 3), never `visible`,
  and the line is taken off the living rig.
- **Only `updateGun` shows the viewmodel; only `syncFpsRig` puts it away.**
  Anything a GUN owns belongs in `updateGun`; only what the VIEWMODEL owns
  belongs in `updateViewmodel`.
- ADS is computed (`ADS_EYE`, `sightH`, `sightZ`, `adsZs`/`splitAds`), never
  hand-tuned. Do not lower `camera.near`. A part goes aft only if it would
  cross the near plane.
- **Any new or changed viewmodel pose: project its barrel.** Carries are
  sold by roll and drop, never yaw.
- The sights cap you to a walk (`adsWalk`); they do not come down when you
  move. `gunGiving` caps a retreat, never a charge.
- The crosshair is sized in the screen's own measure. Do not convert it to
  pixels or scale it with the weapon.
- The muzzle flash is depth-tested, one true size, and never a light.
- **Gun materials are shared** (`gunMats()`): no emissive floor, never
  tinted. `g.port` stays out of `vmParts`.
- **Any new caller of `gunSwapped` checks `FPS.reloading` first.** The only
  reload cancel is a dodge. The reload is one plan table (`RELOAD`,
  `reloadPlan`) driving sound, props, viewmodel and rig.
- Magazines are `magA` inside `magG`; slides `slideA` inside `slideG`.
- **`addObstacle` and `addWall` take the crown's world `top`**; every
  breakable goes through `addBreakable`. `BP.obstacles.filter(o=>o.top==null)`
  must stay empty.
- `hitscan` asks spheres in order: head, limb, trunk.
- An area hit reports its hitmarker after the loop, from what it touched.
- Sites keyed on `'sniper'` need a `'kar98k'` case (tracer, hole, vibration,
  two flash sizes). The `sniper` key is the Barrett; keys never change.
- Sights: a second iron set needs `ring:true`; `attOf` degrades unknown
  choices to `iron`. Nothing may cross an aperture's hole or the ACOG's
  bore (radius under `R`). One bore, one ring. `M.tube` is `DoubleSide`.
  The UMP ring's `ay2` never goes under .0965. The rear element is what
  shrinks, never the front.
- Modelling: guns are `vmOct`; a cut is narrower than its surface and a
  step off its colour; a detail sits AT the surface. Metal is a saturation
  ramp. Two guns are told apart by proportion, not colour.
- The weapon bar's selector is `#fpsCtl #fbSwap` (specificity).
- Reserves by calibre through `resOf`/`setRes`.
- Harness traps: `fireGun` fires from the rig's muzzle (drive real frames);
  set `FPS.adsOn`, not `FPS.ads`; a scattered skeleton is not shootable.

### Audio

- Background audio runs through `musicMaster` at `BG_GAIN`.
- `noiseBuf` is BROWN. Clicks, scrapes and strikes use `white:true`.
- Reload foley is `metal`/`mscrape`; no triangle tone. The arrival is the
  loudest thing in a stage. Measure levels in 10ms RMS, not sample peak.
- The hitmarker is short, dry and high-banded; reach for the band, not the
  level. Brass is short and inharmonic; shorten it, never raise it.
- The sniper's tail is density, not a count of echoes.
- `quake()` is for real explosions (the rocket), never `ultraThud`.

### Horrors

- A hollow is 85, a thrower 70, a brute 140. The Barrett's 96, the Kar98k's
  60 and the red multiplier 2.2 (`Math.round`ed) are tied to them.
- Fire goes through `fireBite(e)`, never `burnT`. `dowseFlames` on death
  and on tile recycling.
- `startRagdoll(...,force)` is the only way a boss gets one; do not tidy
  the root's rotation afterwards.
- **The pilgrim and the horrors go over a rim by different rules**
  (`groundGone` vs `overBrink`). Do not unify them. `groundGone` is 0 inside
  the lip, unconditionally. `ragFree` lets a body off the world, cloth too.
- Arrows are ballistic; the hit test sweeps the step's height range.
- The pack: keep `packSteer`'s bounding test; `alertPack` is a beat, not a
  stun.
- The host: `bigLead` runs first; the draw loop breaks on an empty option
  list. **Changing a template's cost: re-measure the THINNEST seed.**
- The rise: depth per metre of rig; a planted hand is a solve; blends use
  `sstep`, never `easeOut`; `riseRate` reads three widths; the rise cannot
  be interrupted. Harness: exclude `rig.imp` and `lodKeep` from heights.
- A parry is a blow aimed at you: not `bash`, and facing the pilgrim.
- The Bell-Called: the bell is `tough` with `onHit`; the skull is WARDED,
  not `untouchable`; `barFrac` for anything fought in pieces; floaters set
  `flies` (read through `aloft(e)`); the jaw opens on POSITIVE rotation.x;
  the hands are a left and a right (`body.scale.x` keeps its sign); skull
  heights are measured constants. Re-measure claw tips if the hand changes.
- The Arm: `this.x/z` is the palm near the ground, else the root (the ROOT
  while its own scene plays); `spheres()` for gun hits. A grab is a player
  state. Its FIRST tell is at home, ahead of the pilgrim: a scene needs a
  bearing, and one under his feet has none.
- **A horror of its own class has none of the host's states.** Anything
  that WRITES `'stagger'` onto a horror asks `staggers(e)`; anything that
  writes `'held'` or `'down'`, or picks a backstab or finishing target,
  asks `isHost(e)`. A horror left in a state it does not know stands
  frozen for good. `alertPack` wakes a `'dormant'` horror only if it has a
  `wake()`: a new class that lies dormant either has one or is skipped.
- A Frostbound and a Shade never `patrol()`: a roaming template leaves
  them where they were sown.
- **Every kill's marrow goes through `shedMarrow`**, and so does the lore's
  tally (`loreFell`). A new horror's key is its codex key: if its `kind`
  is not already one, map it in `cxKeyOf`. A kind that enters in its own
  scene goes in `MEET_SCENE`, or it gets a name card as well.
- `DEF.might` is applied in every horror's `takeHit`, never at a call site.
- New siege-walkers need `zombieMove`'s stuck-on-a-tree detour.
- `reaperFinish` spends existing kills; the Warden is excluded.
- `fellTree` wraps the tree in a pivot at its foot; the obstacle drops the
  instant it starts to fall.
- NaN bounding spheres: the guard is in `tip()` and `boltLine`/`boltArc`.
- **A shield is decided BEFORE the blow** (`shieldBlocks`, called from
  `meleeHit`, `gunHit` and `arrowStrike`): the melee loop severs, scatters
  and bleeds AFTER `takeHit`, so a block inside `takeHit` would stop only
  the damage. Area attacks pass the shield on purpose. `gunHit`'s early
  return still returns `{kill,head}` — its caller reads them. Hollows get
  their shields by `posHash` in the pair and patrol templates: no draw
  moves, so the field's host is unchanged.
- The fog wraith lives only while `RUN.weather==='fog'` (`wraithTick`);
  `leave()` removes one without marrow. One manifests at a time.
- **The Ravine Wyrm's body follows its head's `trail`**; a segment under
  the soil is hidden, so the chain dives by itself. Its `x/z` is the
  nearest part above the soil (untouchable when there is none). A run
  carries one by `R.wyrm`, the LAST draw on the run's stream. Its scenes
  are shot along the trench: a lens swung to the side is up the wall.
- The Lamplighter's light is `lampNear(e)`, cached for 20 frames on the
  horror; the extra blow goes through the strike's `hd`, never `this.dmg`.
  Its lantern is a Basic box and a sprite, never a light.
- The Ossuary Swarm is two `InstancedMesh`es on a plain Lambert (no `psx`).
  Its hp is its piece count times four; `takeHit` kills pieces, never hp.
- The Hanged's rope is a child of its root, placed in world space through
  `worldToLocal`, and `lodKeep`. Its rig is `humanoid=false`. A hanged
  pilgrim uses the Arm's `'grabbed'` state.
- **Anything a build drops into the host goes through `sowOdd`** (queued
  on the path, straight in on the field). New variants are picked by
  `posHash`, never `rnd()`, so no draw moves.
- The Drowned Bride's body is SUNK below the bed while she is under
  (`BRIDE.SUNK`), never hidden: `lodUpdate` owns `rig.body.visible`. Her
  ripples ride the root. Her floor is `pathHeightAt`, never the deck.
- A Gargoyle's perch is an `Object3D` anchor in its hall's group
  (`PERCH`, `perchAdd`), read every frame; `gargTick` wakes one lazily
  near the pilgrim. Its stone is a CLONE of the hall's material (a flash
  on the shared one lights the hall). It never wakes, or chases, under a
  roof (`inNave`).
- The Frostbound is `Enemy.frost`, rolled by `posHash` (no draw moves).
  Dormant, its root stands ON the ground in its ice (`encase`); `wake()`
  thaws it. Its blows go through `frostBite`. Ice patches (`ICE`) are
  marks: above the ground, wound to face the sky, disposed when they melt.
- The Ossuary King is its own class with a humanoid rig and
  `rig.humanoid=false`. Its breaks are `KING.BREAK`; while it lies in
  pieces its only sphere is the heart. It replaces the bowl's swarm by
  `posHash` on the tile, never `rnd()`.
- The Shade is `Enemy.shade`. Dormant it is unseen (`root.visible` false)
  and `wake()` steps it out. Its roll and flask are decided in
  `shadeCall` before the state's own step; a blow spills the flask in
  `takeHit`. Its roll reads the pilgrim's attack STATE names: a new
  attack state goes into that list.
- **The Rider is two bodies.** Mounted it is `RiderHorror` (its own rig, the
  top half of the bar; its `die()` unhorses). On foot it is
  `Enemy('boss',{rider:true})`, so **every `this.boss` rule that means "the
  Warden in the nave" also checks `!this.rider`** (`onBossDead`, the nave
  clamp). `riderYard` holds it to the yard; `riderFell` opens the keep.
  The horse's rigid parts are folded (`hbs`/`nks`/`hds`): anything that must
  move goes on a joint group, never in those.

### The world, the path and the modes

- **Every per-tile roll gets its own hashed stream** (`hash32`), never the
  second `rnd()`. Chunks shape details with `posHash`, never `rnd()`.
- Terrain features carry BOTH `tp0` and `tp1`. A ravine run's feature rides
  in its LAST tile (`ravCarry` in the next run's first); a run never
  crosses a cathedral.
- **Anything built at fixed heights on the path is lifted by the tile's
  base** (`tileCommit`'s `offY`, `pathBase`). Level on purpose: cathedral,
  ravine run, river, pond, fork, narrows.
- **Anything new built at tile 0 on the path goes inside one of the
  `tileCapture` windows in `buildWorld`**, or it outlives its ground.
- Loops over path tiles start at `PATH.lo`. `teardownTile` empties a torn
  tile's arrays IN PLACE and drops its roads, decks, stairs, bake records
  and own textures.
- `bakeStatic` on a tile group is fine; `bakeWorld` on the path is not.
- **A chunk on the path cannot see its own road** (step 0 builds the chunk,
  step 1 lays the road). `roadPlan(t)` puts the route into `roads` for step
  0 with `BUILD.plan` set, and `nearRoad` then ignores every other road
  (they are in the world's frame). A new special with its own road shape
  adds it to `roadPlan`. On the path a wedge's axis IS the road: anything a
  chunk centres on the axis needs a path branch (the chapel, the causeway,
  the ruins), gated on `BUILD.plan` so the field's draws do not move.
- Ravine: trunks are `wood` obstacles, not `tree`; the chunk's `free()`
  keeps the trail clear; nothing stands in a stream bed (`streamNear`).
- **Every piece of foliage goes through `leafMat()`**; fallen leaves do not.
- **Anything `applyTime` writes goes into `xfSnap`/`xfSet`**, or a gradual
  turn snaps it. `xfTick` runs after `updateWeather`.
- Weathers are validated against `WX_NAMES`. Settled fog hides the dome.
- Roads: `layPath` (mitred polylines); its option object is `opt`. The
  ravine trail is painted into the ground (`TRAIL_GROUND`, `aTrail`).
- The slope limit judges the ground MESH (`slopeHold`); water banks exempt.
- The path's sides are a cliff (`pathEdge`); the way back is a cliff
  (`PATH.backZ`). `drainSpawns` clamps inside `pathEdge−1.4`.
- A bridge is a deck in `heightAt` (`deckAt`), not in the ground.
- Mileposts dispose their canvases on teardown.
- **The castle** stands at `PATH.castleK` (30; -1 on the ravine-only path
  and the codex, which lays its own; `?castle=N` for testing) and takes that
  hex's cathedral slot. Its measure is ONE table, `CASTLE`, read by the
  build, the flattened ground (`pathGround`), the widened edge (`pathEdge`),
  the camera (`castleStone`/`castleWalk`) and the Rider's yard. **New stone
  on it goes into `castleStone` too.** The gates are obstacles that
  `castleTick` removes when they lift; the winch is a `tough` breakable with
  `onHit` (the bell's rule).
- **The Mire (`DEF`)**: every field-only gate is `!PATH.on&&!DEF.on`. Every
  rule that reasons from `HW/HL/PW/PL/PH` is a cathedral rule and needs a
  `!DEF.on` gate. `G.bossActive` is never set in the Mire; a round's boss
  is a `mini`. The player's blows never damage the house. The house is at
  `MIRE.hx/hz`, not the origin.
- The cathedral: collision (`HW`/`HL`/`WALLT`, plinth, portal) did not move
  with the gothic pass; keep it. Crockets are tetrahedra. `srand(444)`
  precedes the vault. Gargoyle anchors are `Object3D`s.
- The codex: `G.mode` stays 'play'. **A new horror needs a `make` entry**;
  a new weapon, armour or weather needs its words in `CX_BLADES`,
  `CX_ARMOUR` or `CX_WX`. `opts.plain` stops the red roll.

### Interface

- `#toast` sits at z-index 12, over the pause panel and the shop.
- Panels are tabbed (`panelTab`); `setPaused` refuses while the shop is open.
- A thin slider needs a 22px hit box and stopped pointer events.
- A harness must press title cards by id (`#modePath`, `#modeDefend`, ...).

### How to measure (each one settled an argument)

- Count an effect's pixels by rendering twice (on, then hidden) and
  differencing.
- Size anything on screen by projecting its vertices through the camera.
- Find what fills the picture with a `Raycaster` probe from the camera.
- Prove a small part is missing by recolouring it.
- Check a hinge's sign by traversing with `matrixWorld` at two openings.
- Trap a NaN producer by patching `computeBoundingSphere` and reading the
  vertex count.
- Stalls: hook `gl.linkProgram` and time `renderer.render` per frame.

## Conventions

- Commit messages are evocative prose, lowercase-leaning, in the game's own
  voice — e.g. *"Sound, third pass: voices for the hero and the Fallen One,
  slush for the Unburied."*
- `README.md` is the design document and is kept current. When you change
  behaviour, update it in the same commit. New rules go here, their stories
  in `docs/NOTES.md`.
- Pushing to `main` deploys to GitHub Pages at
  https://arterramarketing-hub.github.io/bonepath/ . The `github-pages`
  environment is set to "No restriction" for deployment branches; narrowing
  it breaks deploys after a rename.

## Testing

`tools/check/run.js` loads the game headless and fails on any page error:

```sh
cd tools/check && npm install     # once; playwright-core only
node run.js                       # everything, ~6 minutes
node run.js parse boot            # the quick pass, ~1 minute
```

Checks: `parse` (every inline script compiles), `boot` (field, path, ravine
and Mire start clean), `codex` (every entry of every section), `path` and
`ravine` (walk about seventy hexes), `road` (nothing a hex builds stands on
its own road), `castle` (raised at hex 3: the gate,
the Rider's two halves, the keep, the road on), `leak` (walk to hex 80;
ceilings on heap, geometry and the registries). Chromium comes from `$CHROME_PATH`,
then `/opt/pw-browsers`, then playwright's own install.
`.github/workflows/check.yml` runs all of it on every push; it never
deploys.

The game exposes `window.BP` for harnesses (`BP._reg()` counts the
registries). A new system worth probing should be added to it.

Run at least `parse boot` before every push, and the whole set after
anything touching the path, the codex or a registry.
