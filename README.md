# BONEPATH

*the marrow remembers*

A haunted PSX-style souls-like you can play on your phone. One self-contained
HTML file — no build, no install, no server. Open `index.html` in any browser
(or host it anywhere static) and survive the Bonefield.

## Playing it

- **Phone**: serve the repo with any static host (GitHub Pages works) and open
  it in your mobile browser. Landscape recommended. Add to home screen for
  fullscreen.
- **Desktop**: just open `index.html`. WASD to move — J/Space strike
  (repeat for the combo), K/Shift roll, E interact, B offerings,
  Z/C orbit camera.

## Controls (touch)

- **Left thumb** — floating joystick, movement only
- **Right thumb — tap to fight, flick to live:**
  - **tap** — swing the sword; keep tapping and the combo climbs:
    slash, backhand, crushing overhead, deep thrust, and around again
  - **flick in ANY direction** — dodge roll with i-frames that way
- **Rolling attack** — tap during a roll (or right as it ends) and
  the knight rises out of the tuck with a fast upward cut that flows
  into the normal chain
- **Right thumb, hold & drag** — turn the camera
- **The eye never closes** — lock-on is automatic and buttonless: the
  closest live horror is always marked (skeletons still clawing out of
  the ground don't count until they're up). When nothing stalks you,
  the camera locks onto the cathedral at the heart of the field and
  keeps it framed as you walk — the goal is always in view

No flask. No stamina. Only nerve.

## Marrow

Everything you fell pays marrow, and the marrowfires accept it:
thicken your marrow for more vigor (max HP, at rising cost). Die and
you drop every unspent shard where you fell —
one corpse-run to win it back. Enemy windups flash amber and rasp
before they land; bone-throwers with green eyes lob shots you can
sidestep or roll through. Break a small horror's poise to stun it,
then land one more blow and it goes sprawling flat on the path —
kicked while it's down, it stays down.

## Elements

Fallen horrors sometimes shed a mote of the power that moved them —
**fire**, **lightning**, or **frost** — or a warm red mote of the
**life they stole**: walk into that one wounded and it mends 35
vigor on the spot (at full health it waits on the path for you).
Each mote wears its nature: fire flickers restlessly and streams
embers, lightning jitters and spits little bolts, frost hangs cold
and still with sparkles wheeling around it, and the health mote
beats like a heart. The elemental motes imbue the blade for a while,
glowing and shedding sparks: fire hits
harder and bursts into rising embers, lightning arcs from your victim
to the next horror in reach — and quickens your arm while it rides
the blade — and frost slows whatever it bites for six long seconds.
The element gutters out after a time — or is lost with your life.

Every swing also carries a chance of a **telling blow** — near double
damage with a golden ring and a crack like a bell — and a telling
blow blasts a small skeleton clean apart into a heap of bones. If
life remains in it, the bones crawl back together and it climbs
upright to come at you again.

## The loop

The Bonefield is one giant hexagon of rolling, haunted ground with the
ruined cathedral sealed at its center. The dead never stop coming —
hollows claw out of the soil, bone-throwers post up, brutes lumber in,
and carrion crows wheel overhead and stoop at you — and the field
thickens as your marrow grows. **Survive and harvest 1000 marrow** and
the cathedral's veil burns away. Kindle the marrowfires to rest, heal,
and set your checkpoint; die and you drop your marrow where you fell —
one corpse-run to win it back. Step through the portal and the
**Gravewarden of the Bonefield** rises, with a second phase when its
rage remembers itself. Fell it, claim the altar under the rose window,
and the field is yours.

## How it's built

Everything is generated at boot inside the one file:

- **Renderer** — three.js r128 (inlined), rendered at ~240p and upscaled with
  nearest-neighbor, clip-space vertex snapping for the PSX wobble, exp2 fog,
  film grain and vignette overlays.
- **Textures** — all procedural 256px canvases: flagstone with moss and
  trodden bone chips, weeping stone walls, ossuary walls of mortared skulls,
  weathered gravestones, rusted iron, dead bark. Nearest-filtered, sRGB.
- **World** — a hexagonal field with gentle procedural elevations, a
  wooded graveyard of dead trees, ruins, and bone piles (all with real
  collision), brick ramparts and corner towers on every edge, and the
  cathedral — bone wainscot, lancet glass, rose window — at the center.
- **Characters** — low-poly articulated rigs (armored knight with cape,
  barbute helm, and an ultra greatsword with a long two-hand haft,
  carried DS3-style — arm extended on the haft, guard at the shoulder,
  blade rising over it toward the back — swinging edge-first with the
  left hand IK-planted on the haft; jawed skeletal
  hollows with ribcages and joint
  knobs; wheeling carrion crows;
  the horned Warden with a burning heart) with fully procedural
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
