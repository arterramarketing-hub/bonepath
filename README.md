# BONEPATH

*the marrow remembers*

A haunted PSX-style souls-like you can play on your phone. One self-contained
HTML file — no build, no install, no server. Open `index.html` in any browser
(or host it anywhere static) and walk the Bone Path.

## Playing it

- **Phone**: serve the repo with any static host (GitHub Pages works) and open
  it in your mobile browser. Landscape recommended. Add to home screen for
  fullscreen.
- **Desktop**: just open `index.html`. WASD to move — J/Space strike,
  K/Shift roll, Q switch target, E interact, B offerings, Z/C orbit camera.

## Controls (touch)

- **Left thumb** — floating joystick, movement only
- **Right thumb, tap** — quick strike ahead (or at your lock-on target)
- **Right thumb, flick up** — aimed strike along your swipe
  (tap or flick again mid-swing for a 3-hit combo)
- **Right thumb, flick down** — dodge roll with i-frames, in the
  direction of your swipe (neutral keyboard roll is a backstep)
- **Rolling attack** — strike during a roll (or right as it ends) and
  the knight rises out of the tuck with a fast upward cut that flows
  into the normal combo
- **Right thumb, hold & drag** — turn the camera
- **The eye never closes** — lock-on is always active: any horror in
  range is marked automatically, and the **target** button switches
  between them. When nothing stalks you, an ember waymark floats ahead,
  pointing down the path — to the fog gate, and after the Warden falls,
  to the altar

No flask. No stamina. Only nerve.

## Marrow

Everything you fell pays marrow, and the marrowfires accept it:
thicken your marrow for more vigor (max HP, at rising cost). Die and
you drop every unspent shard where you fell —
one corpse-run to win it back. Enemy windups flash amber and rasp
before they land; bone-throwers with green eyes lob shots you can
sidestep or roll through.

## The loop

Kindle the marrowfire. Walk the path through the hollows. Rest to heal
and set your checkpoint — but resting raises everything you killed, and
the fires are the only healing there is. Die and you drop your marrow where you fell; walk back and reclaim
it, or lose it to your next death. Past the fog gate the **Gravewarden of
the Bone Path** waits, with a second phase when its rage remembers itself.
Fell it, claim the altar, and the path is walked.

## How it's built

Everything is generated at boot inside the one file:

- **Renderer** — three.js r128 (inlined), rendered at ~240p and upscaled with
  nearest-neighbor, clip-space vertex snapping for the PSX wobble, exp2 fog,
  film grain and vignette overlays.
- **Textures** — all procedural 256px canvases: flagstone with moss and
  trodden bone chips, weeping stone walls, ossuary walls of mortared skulls,
  weathered gravestones, rusted iron, dead bark. Nearest-filtered, sRGB.
- **Characters** — low-poly articulated rigs (armored knight with cape,
  barbute helm, and an ultra greatsword with a long two-hand haft,
  carried DS3-style — arm extended on the haft, guard at the shoulder,
  blade rising over it toward the back — swinging edge-first with the
  left hand IK-planted on the haft; jawed skeletal
  hollows with ribcages and joint
  knobs; the horned Warden with a burning heart) with fully procedural
  animation: counter-rotating walk cycles, telegraphed windups, combos,
  rolls, clawing-from-the-grave rises, and deaths that buckle at the
  knees and crumble into bone piles — all run through critically-damped
  pose smoothing so every joint eases instead of snapping. Capes drag
  with movement.
- **Audio** — synthesized WebAudio: graveyard wind, sub drone, whooshes,
  clangs, the death gong, the Warden's roar.
- **No dependencies fetched at runtime.** Works offline.

Originally a Godot prototype; taken over and rebuilt as a web POC so it can
be played instantly on a phone.
