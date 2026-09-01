# BONEPATH

*the marrow remembers*

A haunted PSX-style souls-like you can play on your phone. One self-contained
HTML file — no build, no install, no server. Open `index.html` in any browser
(or host it anywhere static) and survive the Bonefield.

## Playing it

- **Phone**: serve the repo with any static host (GitHub Pages works) and open
  it in your mobile browser. Landscape recommended. Add to home screen for
  fullscreen.
- **Desktop**: just open `index.html`. WASD to move (hold R to sprint) —
  J/Space strike (repeat for the combo), hold L and release for the
  charged lunge, K/Shift roll, E interact, Z/C orbit camera.

## Controls (touch)

- **Left thumb** — floating joystick. Push it past three-quarters and
  the walk breaks into a **sprint** — the knight pitches forward and
  the greatsword trails along the hip
- **Right thumb — tap to fight, hold to break them, flick to live:**
  - **tap** — swing the sword; keep tapping and the combo climbs:
    slash, backhand, crushing overhead, deep thrust, and around again
  - **tap at full sprint** — the **dash cut**: the lead foot plants and
    skids while the blade whips through a wide, low, level sweep
  - **hold still, then release** — the **charged lunge**. The knight
    coils onto the rear leg with the point levelled at the prey; your
    own glow draws in tight and burns hotter as the charge fills (a ring
    and a chime at full). Let go and the whole body fires forward four
    metres behind the point. A full charge hits ~2.5× a light strike
    and **staggers anything that isn't the Warden outright** — brutes
    included — and a stagger is where the knockdowns and telling blows
    begin. Held too briefly, it's just a strike. You are wide open while
    you wind it.
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

Everything you fell pays marrow — the toll that opens the cathedral.
Die and you drop every shard where you fell, and wake again at the
pilgrim's gate on the far southern edge — one long corpse-run to win
it back. There is no rest and no fire to kindle: the only mending is
what the fallen shed. Enemy windups flash amber and rasp
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
blow blasts a small skeleton clean apart: real bones and a skull go
flying, tumble, and lie scattered on the path. If life remains in
it, the bones drag themselves back together and it climbs upright
to come at you again.

## The loop

The Bonefield is one giant hexagon of rolling, haunted ground under
true night — over 130 meters across — with the ruined cathedral sealed at
its center under a pillar of moonlight you can steer by from anywhere.
A flagstone ring road circles the nave with straight roads running out
to the quarters: the pilgrim's approach in the south, the ordered
grave rows in the east, the hollow wood's groves in the west, the
ruins and fallen tower in the north — iron lanterns burning warm at
the crossings and along the roads, the only kindness in the dark.
You start your pilgrimage at the field's far southern edge, the
cathedral a distant beacon, carrying your own soft glow — a warm
pool of light that walks with you through the dark, souls-fashion.
A finite host sleeps under the soil, sown across the quarters —
hollows, bone-throwers, brutes, two roosting carrion crows — and
each one stirs only when you come near: wander wide of them and
they let you pass, stray too far mid-chase and they give up and
trudge home to stand guard. There are just enough of them, all
told, to pay the toll. **Harvest 1000 marrow** from the sleeping
host and the cathedral's veil burns away. There are no
fires to rest at: die and you wake at the pilgrim's gate, your
marrow lying where you fell. Step through the portal and the
**Gravewarden of the Bonefield** rises, with a second phase when its
rage remembers itself. Fell it, claim the altar under the rose window,
and the field is yours.

## How it's built

Everything is generated at boot inside the one file:

- **Renderer** — three.js r128 (inlined), rendered at ~240p and upscaled with
  nearest-neighbor, clip-space vertex snapping for the PSX wobble,
  film grain and vignette overlays.
- **Textures** — all procedural 256px canvases: flagstone with moss and
  trodden bone chips, weeping stone walls, ossuary walls of mortared skulls,
  weathered gravestones, rusted iron, dead bark. Nearest-filtered, sRGB.
- **World** — a vast hexagonal field with broad procedural elevations,
  laid out in quarters around a ring road: an ordered cemetery, groves
  of dead trees, roofless ruins and a fallen tower (all with real
  collision), the land shearing off into dark void at the hexagon's
  edge, a starfield night lit only by a low moon, iron lanterns along
  the roads casting real flickering point-light, the hero's own warm
  glow pooling around them, and the cathedral — bone wainscot,
  lancet glass, rose window, a moonbeam standing over it — at the
  center.
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
