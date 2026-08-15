# BONEPATH

*the marrow remembers*

A haunted PSX-style souls-like you can play on your phone. One self-contained
HTML file — no build, no install, no server. Open `index.html` in any browser
(or host it anywhere static) and walk the Bone Path.

## Playing it

- **Phone**: serve the repo with any static host (GitHub Pages works) and open
  it in your mobile browser. Landscape recommended. Add to home screen for
  fullscreen.
- **Desktop**: just open `index.html`. WASD to move, mouse-free — J/Space
  strike, K/Shift roll, F flask, Q lock-on, E interact, Z/C orbit camera.

## Controls (touch)

- **Left thumb** — floating joystick, move
- **Right thumb** — drag to orbit the camera
- **Strike** — tap for a 3-hit combo, *hold* for a heavy that staggers
- **Roll** — invincibility frames, rolls in your input direction
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
