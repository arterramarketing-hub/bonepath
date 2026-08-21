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
- **Right thumb, hold & drag** — turn the camera
- **Right thumb, flick up** — quick strike, aimed along your swipe
  (flick again mid-swing for a 3-hit combo)
- **Right thumb, flick down** — dodge roll with i-frames, in the
  direction of your swipe (neutral keyboard roll is a backstep)
- **Block** — hold to raise the shield: hits from your front arc are
  cut to a quarter, with chip damage
- **Charge** — hold ~0.6s until the blade smolders; your next strike
  flick is the heavy — bigger damage, staggers
- **Flask** — 3 charges, refilled at marrowfires
- **Lock** — lock the camera onto the nearest horror

No stamina. Only nerve.

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
