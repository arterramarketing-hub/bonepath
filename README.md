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
  K/Shift roll, hold L to block, hold H to charge the heavy, F flask,
  Q lock-on, E interact, Z/C orbit camera.

## Controls (touch)

- **Left thumb** — floating joystick, movement only
- **Right thumb, tap** — quick strike ahead (or at your lock-on target)
- **Right thumb, flick up** — aimed strike along your swipe
  (tap or flick again mid-swing for a 3-hit combo)
- **Right thumb, flick down** — dodge roll with i-frames, in the
  direction of your swipe (neutral keyboard roll is a backstep)
- **Right thumb, hold & drag** — turn the camera
- **Block** — hold to raise the shield: light hits from your front arc
  are cut to a quarter — but heavy blows (the big hollow, the Warden)
  **break your guard**. Block the pokes, roll the slams.
- **Charge** — hold ~0.6s until the blade smolders; your next strike
  is the heavy — bigger damage, staggers
- **Flask** — refilled at marrowfires
- **Lock** — tap to lock the nearest horror, tap again to cycle
  targets, cycle past the last to release

No stamina. Only nerve.

## Marrow

Everything you fell pays marrow, and the marrowfires accept it: buy
another flask vial, or thicken your marrow for more vigor (max HP, at
rising cost). Die and you drop every unspent shard where you fell —
one corpse-run to win it back. Enemy windups flash amber and rasp
before they land; bone-throwers with green eyes lob shots you can
sidestep, block, or roll through.

## The loop

Kindle the marrowfire. Walk the path through the hollows. Rest to heal,
refill flasks, and set your checkpoint — but resting raises everything you
killed. Die and you drop your marrow where you fell; walk back and reclaim
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
- **Characters** — chunky box-rigs (knight, hollows, the horned Warden)
  with fully procedural animation: walk cycles, telegraphed windups, combos,
  rolls, staggers, deaths.
- **Audio** — synthesized WebAudio: graveyard wind, sub drone, whooshes,
  clangs, the death gong, the Warden's roar.
- **No dependencies fetched at runtime.** Works offline.

Originally a Godot prototype; taken over and rebuilt as a web POC so it can
be played instantly on a phone.
