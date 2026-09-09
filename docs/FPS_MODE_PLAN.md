# FPS mode — plan (not built; a reference for later)

The idea: the same field and the same path, played from behind the
pilgrim's own eyes as a first-person shooter, with a revolver in hand
and nothing else. Controls stay as close to the third-person game as a
first-person view allows. The title screen already has a placeholder
button that opens a note; this file is the plan behind it.

## What stays

- The worlds (the field, the path and its streaming tiles), the hours,
  the weather, the paint, the marrow economy, the pause screen and the
  testing menu.
- The horrors and their AI, the eye's tell, poise, staggers, elements
  (a frost round freezes, a fire round burns), the Fallen One, the
  Unburied. In the field the Warden fight still gates the ending.
- Death and the corpse-run (field) or the run's end (path).

## What changes

1. **Camera.** A first-person camera at eye height (1.62 m) on the
   hero's head position, yaw from the existing right-thumb drag and
   pitch from its vertical drag (clamped ±70°). The hero's body mesh is
   hidden; a **viewmodel** (arms + revolver) is a child of the camera,
   drawn last on top, with walk bob, sway from look speed, and a kick
   on fire. Lock-on is off in this mode; the crosshair does the aiming.
   The PSX post-process (low-res target, grade, dither) is unchanged.
2. **Controls.** Left thumb moves relative to the view (forward/strafe),
   full push sprints (hysteresis as now). Right thumb drag looks. Tap on
   the right half fires; hold aims down the sights (narrower FOV, less
   spread, slower turn); flick still rolls (a quick dodge with i-frames,
   the camera dipping); a reload button appears when the cylinder is not
   full, and an empty cylinder reloads on the next tap. Keyboard: WASD,
   mouse look with pointer lock, left click fire, right click aim, R
   reload, shift roll.
3. **The revolver.** Six rounds. Hitscan: a ray from the camera through
   the crosshair against enemy hitboxes (a sphere per body part; the
   head counts double). Damage 28 body, 56 head; a full aimed shot adds
   poise damage so a headshot staggers. Spread grows with movement and
   consecutive shots, shrinks when aiming. Fan the hammer: three fast
   taps fire three rounds in 0.4 s with wide spread. Reload 1.4 s with a
   cylinder-swing animation and casing eject. Muzzle flash as a sprite
   plus a brief point light, smoke puff, the existing sparks/gore at the
   hit, tracer only for the elemental rounds.
4. **Elements as rounds.** The motes the fallen shed load the cylinder
   instead of the blade: the next six rounds carry fire, lightning
   (leaps as now), frost (freezes as now) or life.
5. **HUD.** A dot crosshair that opens with spread; six ammo pips; a
   hit marker (a small cross) on a hit, red on a kill; a damage
   direction arc when struck; the marrow counter as now.
6. **Enemies.** Unchanged AI; add a ranged pressure tweak so casters and
   crows are the threat that keeps you moving. Melee horrors need to
   close, so their approach speed and the eye's tell timing are the
   dodge cue.
7. **The Warden.** In the field, his fight works in first person with
   the same phases; his weak point is the burning heart in phase two
   (a headshot-class hitbox).

## Build order and estimate

1. Camera + viewmodel + body hide, movement relative to view, look
   controls with pointer lock. (one round)
2. Revolver: hitscan, damage, spread, reload, fan, effects, HUD. (one
   round)
3. Elements as rounds, hit markers, damage arc, dodge camera. (half a
   round)
4. Balance pass on both worlds; the Warden in first person. (one round)

Verification as always: headless probes that fire at spawned horrors and
check hits, spread and reload timing; screenshots of the viewmodel.

## Open questions to decide first

- Is the hero's blade gone entirely in this mode, or is a melee bash
  kept for point-blank range?
- Ammo: infinite with reloads (arcade), or found marrow buys rounds?
- Does the path's cathedral host suit a shooter, or should those hexes
  become long galleries with cover?
