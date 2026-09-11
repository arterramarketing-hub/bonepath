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
  charged double slash, K/Shift roll, E interact, Z/C orbit camera, Esc pause.
- **Pause** — the **II** button top-right (or Esc) freezes the field and
  shows the run's stats — marrow, horrors felled, host remaining,
  deaths, time, the state of the two mini-bosses, the Warden and the
  cathedral — with the full touch and keyboard control lists, and **the
  pilgrim**: a lit portrait of your knight with three selectors under it.
  **Weapon** — the greatsword, the ultra greatsword, the longbow, or the
  katana. **Armour** —
  **sheet knight** (hand-modelled low-poly, after an eight-view
  reference sheet: every part is a hull of six-to-twelve-sided rings
  lofted into flat-shaded facets and painted in patches — a bascinet
  with a proud rim at the brow, a low brass comb and one dark slit
  across the face over a green gorget; a straw pelt over both shoulders
  torn to points at the hem and standing up behind the neck; an
  olive-green cuirass lamed three times under a leather baldric and
  belt; domed pauldrons, plate arms and cuffed gauntlets; a mail fauld
  off the belt; a green tabard bordered in cream crosses and lilies,
  split in front, real cloth to the knee; plate cuisses and greaves into
  dark boots with a toe; and a straight diamond-section greatsword with a
  plain cross, a long grip and an octagonal pommel, carried across the
  shoulder. The hero is drawn in the PSX frame with everything else —
  snapped, dithered and graded on the same coarse grid. (The crisp pass
  that once drew the player alone at the device's resolution is still in
  the code behind a switch, off.)
  **knight plate** (the sculpted knight, after a Faraam-style reference:
  a ridged helm with a central bar and an eye slit to either side, one
  small fur pelt, one piece turned from a profile and roughed with
  seamless noise, that sits on the shoulders, drops over the pauldrons
  and stops at the shoulder blades, a teal scarf wound thick under the helm with its bib at the
  throat, a cuirass turned from a profile — broad at the shoulders,
  oval in section and tapering to the belt — with a leather baldric across
  it and a mail fauld under the belt, plate upper arms over mail
  forearms and steel gauntlets, and a long split teal tabard — two front
  panels and a back panel of real cloth hung off the belt, sliding over
  the thighs and shins like a skirt as the legs move — over brown
  trousers and knee-high leather boots; no cape), the **thief's
  cloth** (dark quilting, a leather jerkin, wrapped limbs, a deep hood and
  a short mantle), or the **OG knight** — the first knight as it was, all
  primitives and a hinged cape. **Charge** — the charged attack for the weapon
  in hand. The choice is remembered by the browser and the body is remade
  on the spot.

## Controls (touch)

- **Left thumb** — joystick. It appears wherever the thumb first lands
  and stays planted there; drag past the ring and the nub rides its edge
  rather than dragging the whole stick along. Push it past three-quarters and
  the walk breaks into a **sprint** — the knight pitches forward and
  the greatsword trails along the hip
- **Right thumb — tap to fight, hold to break them, flick to live:**
  - **tap** — swing the sword; keep tapping and the combo climbs:
    slash, backhand, crushing overhead, deep thrust, and around again
  - **tap at full sprint** — the **running thrust**: the blade is drawn
    back along the hip mid-stride and driven forward point-first, the
    run's momentum carrying it deep — narrow, but it reaches
  - **hold still, then release** — the **charged attack** chosen on the
    pause screen. With the sword, the **double slash** — two fast
    cuts, forward and back, inside two-thirds of a swing's time, and
    nothing after: the cuts are the whole of it — or the **whirlwind** — the blade held out level while the whole body turns
    twice, four cuts all round, the last of a full charge staggering all
    but the Warden. With the bow, either the **knockback shot** — a heavy
    shaft that throws them back off their feet and staggers all but the
    Warden — or the **piercing shot**, which goes clean through up to four
    horrors in a line and stays in the last. The default is the
    **double slash**. The
    knight coils onto the rear leg with the point levelled at the prey;
    your own glow draws in tight and burns hotter as the charge fills (a
    ring and a chime at full). Let go and the coil comes out as two fast
    cuts with a long driving lunge under each (a stride and a half of
    ground in all): the forward sweep, then the
    backhand straight back across the same line. A full charge's pair
    hits ~3× a light strike and its second cut **staggers anything that
    isn't the Warden outright** — brutes included — and a stagger is
    where the knockdowns and telling blows begin. Held too briefly, it's
    just a strike. You are wide open while you wind it.
  - **the longbow** — a tap nocks, draws and looses in half a second,
    and taps chain. **Arrows fall.** A shaft carries its speed forward and
    gravity works on it the whole way, so it flies flat for a dozen metres
    and drops off from there; loosed at nothing it is in the soil somewhere
    past twenty, which is where the bow's range now ends and it is visible
    in the flight. With a horror on the eye the loose is **aimed**: the
    launch angle is solved for where that horror actually is — up on a
    rise, down in a hollow, five metres in the air on the Fallen One's
    climb — by the time the arrow would arrive. The elevation is capped,
    deliberately: past the cap the solution is refused and the shaft is
    thrown as high as the bow will throw it, and falls short. The shaft
    lies along its own flight and tips over as the flight does. The first
    horror across the path takes it **and keeps it** — planted in the body
    and riding with it through every pose and fall. Into the ground or the
    stone, it sticks. The finishing move with a bow in hand is a shaft
    through the skull at point-blank. At full draw the bow arm is aimed
    straight down the facing however far the chest turns side-on, the
    limbs upright and the string to the cheek, so the nocked arrow points
    where the shot will go. Its third charge is the **bomb
    arrow**: a shaft with a charge bound behind the head that bursts on
    the first thing it meets — a flash, fire, smoke, a scorched ring —
    and every small or medium horror within two metres and a bit is
    blown apart into its bones, to crawl back together in time; the big
    and the Warden only take the blow
  - **the ultra greatsword** — a slab of a blade a foot wide, thick as a
    plank, single-edged with its spine clipped to the point and two holes
    through its base, on a short thick grip under a block of a guard;
    longer and heavier than the greatsword, carried the same way and
    sharing its charges. Every light swing takes half again as long to
    come round, and the screen jolts as the weight lands at the end of
    every arc whether it found anything or not; whatever it does land on
    is knocked back like nothing: all but the Warden are thrown off their
    feet and sent flying, and it hits for **three times** what the
    greatsword does — to everything, the Warden and the two that are not
    hollows included, and through the earthshaker as well as the arc.
    It hangs further behind the arm that throws it than any other weapon —
    the slab and the forearms holding it run on their own slacker spring
    rates, so it lags more going out and carries further past the pose
    coming back, which is the only way to show mass in a rig that has
    none. It does not chip things: **a gravestone or a pew goes in one
    blow**, and a **tree comes down** — the trunk hesitates, then goes over
    away from the swing and lands with a thud, leaving a stump where it
    stood and nothing to walk around. And it **marks the field**: every
    swing, landed or not, drags a furrow of torn earth along the arc the
    edge travelled — once per swing, where the arc was, with the dust and
    the thud of the weight landing separate from it.
  - **the katana** — overpowered on purpose. Carried in **chudan**, both
    hands on the grip before the navel and the point levelled at the
    throat, and it fights the way a katana does: **yoko-giri**, the level
    cut through the ribs; **kesa-giri**, down from the right shoulder to
    the left hip; **gyaku-kesa**, rising back along the same line; and
    **tsuki**, the point straight in. Fast cuts for 30, and any small or
    medium horror below half its life is **cut in two along the line the
    blade took** — level through the middle, or on the diagonal. The cut
    is too clean to feel: nothing moves for half a second, then the
    top slides off the cut face in ONE piece — sideways with the swing
    off a level cut, down the slope of a diagonal one — and drops onto
    its chest wherever it tips, nothing under it to hold it up; the legs
    stand almost a second longer, in plain view, and then the knees go. Nothing
    comes off the line but a glint, the halves never flash red, and the katana
    never takes an arm or a head, nor blasts a skeleton apart — its cut
    is the whole body, and blasting is the greatsword's business. Its
    charge is chosen on the pause screen. The **iaido draw**: hold and
    the hands put the blade away — the right rides the hilt down as the
    blade comes back across the saya's mouth, swings into line and
    slides home, the left holding the saya at its mouth, and it clicks
    only when it is in — the body coiled low over it; release and the
    knight flashes five metres straight through whatever stands in the
    line, the world slowing for the cut, and stands past them with the
    blade out — nothing happens to them until the guard clicks home in
    the sheath, and then they fall in two. Or the **piercing thrust**:
    the blade never goes away — the hold chambers the point level
    beside the right hip with the hips square, already on its line, and
    the release is one motion, a long low lunge of three metres that
    drives it straight out and through whoever stands there — a poke,
    not a swing, four metres of reach, 42 (58 at a full hold), that
    staggers all but the Warden and throws them back off their feet,
    the streak of it a straight line forward at the point's height. Or the **tiger blade**: the hold raises the
    blade high over the head in jodan, and the release drives it into
    the ground a stride ahead — three shock waves heave out of it in a
    fan, one straight and one to either side, five metres or to the
    first wall. Each front is the ground HEAVING UP: a standing arc of
    the turf's own colour a metre tall, dark earth at its foot
    dissolving to dust at its crest, that rises where the blade struck,
    runs, and sinks as it spends itself, a plume of grit off the top;
    and the ground it goes over comes apart behind it — clods of turf,
    grass on top and earth beneath, tossed up and outward off the front
    with real weight, tumble, land, bounce once and lie where they fall;
    and the ground stays torn where the fronts passed — not a thing laid
    on it but PAINT: the field carries a paint sheet its own shader
    samples by world position, and each front paints a rough strip of
    torn earth into it along its line, a dark core under a lighter lip
    with a jagged edge, following every rise and hollow,
    the dirt showing through (the scars fade in ten seconds). Each throws whatever it crosses into the air for
    24 (30 at a full hold), and more often than not takes a leg out
    from under a small or medium horror. The greatsword can take the
    **piercing thrust** and the **tiger blade** too, from its own charge
    list, and its point and its waves hit a quarter harder. Or the **waterfowl**: wound in the saya like the draw, then
    drawn in one rising diagonal cut and held dead still at the end of
    it — while the air keeps cutting: a storm of pale slashes wheels
    round the body for most of a second, striking everything within
    three metres again and again for 8 (10 at a full hold), the body
    untouchable inside it. Or the **magic throw**: the blade raised
    overhead in one hand, then THROWN point first at the marked horror
    (or the nearest in the thirty degrees ahead). It drives a hand's
    width into the chest for twice a cut — 36, 48 at a full hold — and
    STAYS there, grip out the front, while they reel round it; a horror
    the blow leaves under a third of its life it goes clean through,
    and they burst apart behind it, and the blade turns in the air and
    whirls home to the hand on its own. While it stands in a horror (or
    in the earth where it fell short, or on the ground where its horror
    died round it) the hands are empty: a charge, a tap, or a tap out
    of a roll CALLS it — it tears free with a low hum and a rush and
    comes back to the hand like a thing pulled on a string, cutting
    whatever lies between for half. The blade itself is one piece — a
    long thin box bent along its length into the curve, ground thin on
    the edge side and drawn to a point — so the curve reads unbroken,
    and its saya lies back along the left hip with the mouth forward
    and up, the way one is worn
  - **the earthshaker** — the greatsword's third charge, and a **stab**,
    not a chop. Hold and the blade is hauled up in both hands and turned
    **point-down** while the ground groans and the screen shakes; release
    and the whole body drops behind it and drives the point into the
    flags, and he stays crouched over the buried steel while the shock
    goes out of it. Every small and medium horror nearby is blasted five
    body-lengths down the line, and some of them burst into bones that fly
    the same way. The Warden and the two that are not hollows only take
    the blow. **And the ground keeps it**: the soil round the point is
    burst open and burnt through, with cracks running out from it along
    their own radii and a last scatter of flung earth where the wave died
    — painted into the field's own colour, so it costs nothing and stays
    there for the rest of the run
  - **flick in ANY direction** — dodge roll with i-frames that way
  - **the blade's trail** — every swing leaves a ribbon along the path
    the blade REALLY took, done the PSX way: each frame the hilt and the
    tip are sampled off the posed rig and a TAPERED spline ribbon is
    drawn from the oldest sample up to a live head at the blade itself,
    so the widest, brightest part is always at the sword, even as it
    slows, and the ribbon narrows to nothing at the oldest point of the
    swing. Its fade is a ramp, four fifths at the blade to nothing at
    the tail, by place and by age — applied the way the PS1 faded a
    glow: not as alpha and not as a screen-door of dots (that reads as a
    halftone, a comic's tone), but as the colour itself dimmed under the
    additive blend, held to the console's five bits a channel with its
    own faint ordered dither on the steps — so the ribbon fades as a
    solid band into stepped, slightly grainy shades; its vertices take the world's
    snap so it wobbles like the sword; its colour is the blade's own,
    the tip edge pushed toward white as a hot core, warmed gold by a hit.
    It only appears while the tip is whipping fast relative to the
    knight, past the wind-up, so walking and sprinting leave nothing; a
    thrust adds a streak along the point's line.
  - **the blow lands** — a connecting hit is sold mechanically, nothing
    soft: a hard flash at the point of contact and a spray of sparks;
    what comes off the horror is its own stuff — bone chips off a
    skeleton, a puff of grave dust off the big, stone grit off the
    Warden, black feathers off a crow, ichor off the Fallen One, bile
    off the Unburied; the horror pops WHITE for a frame, then the red;
    the frame holds for a tenth of a second (longer for a heavy blow or
    a telling one); the camera jolts; and the horror FLINCHES the way
    the blow sent it — trunk and head thrown back off a thrust, sideways
    off a sweep, hardest at the instant and easing off over a quarter
    second. Each kind of horror has its own smack: dry bone and clatter
    for the small skeletons, a deeper crunch for the big, a wet thud for
    the Unburied, a knock of stone with a ringing chip for the Warden, a
    snap of feathers for a crow, a crack with a chime under it for the
    Fallen One.
  - **the eye (lock-on)** — the lock scores every live horror in reach
    by its distance PLUS a penalty for standing off to the side of, or
    behind, the camera's forward, so the one in front of you wins over
    the one at your shoulder even when the shoulder one is nearer; and
    it holds what it has unless a rival has been clearly better — by two
    metres' worth of score — for half a second running, so a crowd
    circling you no longer makes it jump. And it **lets go of what you
    run from**: move with the marked horror well behind your heading for
    a second and a half straight and the eye releases it, so the camera
    comes round to where you are running; it comes back the moment you
    strike, stop, turn toward the host, or take a blow — so running past
    a pack costs you nothing, and turning to fight costs no button. As
    the camera comes round behind you after the release, the hero keeps
    running the way it was running until the stick is moved, so a held
    "back" never turns into a charge.
    Two things it used to drop and no longer does. **A horror in the air**:
    the Fallen One climbs five and a half metres before its ground-pound,
    and the mark and the gaze both used to stay on the soil beneath it — the
    lock was never actually lost, it simply pointed at dirt while the thing
    that mattered was over your head. Anything that flies carries its own
    height, and the mark sits on it while the camera looks halfway up to it,
    so the whole climb stays on screen. **And a skeleton blasted apart**: a
    telling blow bursts one into a heap that drags itself back together, and
    letting the eye go for those two seconds threw it onto whatever else was
    near and then back again. The heap is still the horror you are fighting,
    so it keeps the mark — lower, on the bones, and dimmed, so you can see
    what it is.
  - **the stick's turn** — the knight turns toward the stick at a rate
    that follows the push: a nudge steers, a shove wheels; and a nudge
    within fifteen degrees of the heading only eases it round, never
    snaps.
  - **moving under the eye** — locked on, the body stays on the foe:
    walking, and sprinting toward or around it. Only a sprint held
    clearly AWAY (past about 115° off the foe) turns the body to the
    heading, and it comes back on the foe once the sprint swings within
    95° again — there is no line for the facing to flicker over. The
    sprint itself starts the instant the stick passes three-quarters (a
    slammed stick is a sprint now) and only drops to a walk below
    two-thirds, so a thumb hovering on the line doesn't flicker between
    the two; speed ramps over a tenth of a second instead of jumping,
    stops quicker than it starts, and runs a little slower sideways or
    back than straight ahead. The walk is DIRECTIONAL: the stride runs
    backward for a backpedal, shortens as the walk turns sideways, and
    a side-step swings the legs out toward the side it goes with the
    trunk leaning into it, the cycle clocked by the ground covered so
    the feet match the pace. The lock camera is damped: it lets a few
    degrees go so circling doesn't keep re-aiming under the thumb,
    never swings faster than a set rate, and holds still while the foe
    is within a stride, where the line through it would flip.
  - **steel on steel** — catch a horror's weapon as it swings (late in
    its wind-up, or mid-strike) and the blades **clash**: a burst of
    white sparks, a clang, and its attack is broken — it reels, open to
    the finishing cut. Swing into **stone** — a wall, a column, the
    ruins — and the blade **bounces off** in a shower of sparks: the arms
    are flung back with it, the knight staggers half a step, and nothing
    on the far side is touched — but a horror standing BETWEEN the blade
    and the stone is cut on the way, the swing only stops at the wall. A lantern post only checks the
    blade in sparks and the swing carries on; a **tree** takes the
    edge: the bark changes colour where it bit. Nothing is added to the
    trunk — the first blow gives that tree a bark texture of its own and
    every blow paints a pale streak of the lighter wood INTO it, at
    blade height on the side the blade came from, lying the way the
    blade travelled: flat for a sweep, upright for an overhead, a nick
    for a thrust — with a few chips of wood; the marks stay for the
    run. A **wall** takes it the other way: a swing into the ruins'
    walls or fallen blocks, or the cathedral's own, scores a DARK
    gouge into that wall's stone (its texture, painted — the first
    blow gives the wall a stone of its own) at blade height on the
    face the blade came at, a chip or two along it; pews, gravestones
    and the town sign break
  - **the finishing cut** — break a small or medium horror's poise and
    a bright blade-mark hangs over it while it reels. Tap with it in
    reach and the knight steps in, drops low with the greatsword drawn
    back past the hip while the world holds its breath, and whips it up
    through them from the ground to the sky — fast: the body is cleaved
    clean in two — truly in two, each half flung its own way and flopping
    down limp with the cut face showing — to a wet, splintering,
    spattering mess of a sound,
    the screen jolting with the weight of it. You are untouchable for the
    whole of the cut. Brutes included; the Warden and the two that are
    not hollows are beyond it
- **the backstab** — get behind a small or medium horror that hasn't
    turned to you, close, squared up to its back, and tap: the knight
    steps in, drives the greatsword straight through the middle of its
    back and out the chest, holds it there,
    and kicks the body off the steel — it goes sprawling, or dies. With
    the bow it's a shaft in the back at point-blank. You can't be touched
    while you do it. The Warden and the two that are not hollows can't be
    taken from behind
- **Rolling attack** — tap during a roll (or right as it ends) and
  the knight rises out of the tuck with a fast upward cut that flows
  into the normal chain
- **Thor's lightning** — a charge for ANY weapon (it is in every
  charge list): the weapon is thrust at the sky in ONE hand, the other
  arm dropped, the face turned up after it — then the arm sweeps down
  to point the weapon at the mark, and as it comes level the bolt goes,
  in ONE motion: off the weapon's tip, nine metres up over you, and
  down on the marked horror — or the nearest live one within fourteen,
  a crow in the air as readily as anything on the ground — a single
  kinked thread drawn thrice for weight with forks off it, the fizzing
  zap of its leaving and the crack of its landing in the same instant,
  a flash that lights the whole field, sparks and a scorch painted into
  the ground. What it hits is
  held where it stands, stunned (40, 52 at a full hold); a crow is
  knocked out of the air to the dirt; and the charge leaps to two more
  within a few strides for half. Made for the birds.
- **Right thumb, hold & drag** — turn the camera
- **The eye never closes** — lock-on is automatic and buttonless: the
  closest live horror is always marked (skeletons still clawing out of
  the ground don't count until they're up). When the marked one falls,
  the eye stays on it for half a second — the camera holds and you watch
  it go down before the lock moves on. The eye never looks through the
  cathedral's wall: a horror pacing outside the nave while you stand in
  it (or the other way round) is not a target, unless one of you is in
  the portal. When nothing stalks you
  there is no lock at all: the camera eases in behind the way you are
  walking, and a drag of the right thumb is left exactly where you put
  it until you move again. The moonbeam over the nave does the pointing

No flask. No stamina. Only nerve.

## Marrow

Some of the host burns hotter: **red-boned** hollows, throwers and
brutes, one in seven or so, with three times the life and worth double
— and a red one blasted apart by a telling blow scatters RED bones on
the path, and crawls back together out of them.

Everything you fell pays marrow — the toll that opens the cathedral.
Die and you drop every shard where you fell — your helm lies there on
the path with the marrow burning inside it, under a shaft of pale light
you can see from anywhere — and you wake again at the pilgrim's gate on
the far southern edge: one long corpse-run to win it back. There is no rest and no fire to kindle: the only mending is
what the fallen shed. Nothing on a horror's body glows before it
strikes any more — the tell is in **the eyes**: every hollow has them
now (dark in their sockets on the small ones), and a quarter second
before the arm comes down they **glow** — lit up hot in their own
colour, swollen, with a halo of it. That quarter
second is the moment to roll: a roll begun on the flare — even a beat
late — is still untouchable when the blow lands, which is what the
timing is meant to teach. Bone-throwers with green eyes lob shots you can
sidestep or roll through. Break a small horror's poise to stun it,
then land one more blow and it goes sprawling on the path — a real
fall, limbs everywhere — and kicked while it's down, it stays down.

## The run — one seed, a different field every time

Everything that changes between playthroughs is drawn from ONE seed: a
fresh one each load, or `?seed=N` on the address for the same field
again. The seed is a plain whole number (up to 4,294,967,295) and it is
the WHOLE description of a field: the pause screen shows it, and a
**go to seed** row there takes any number typed in and loads that
field. The same number always rebuilds the same field, as long as the
generation code is the same build.
The cathedral, its plinth, the stair and the roads never move; around
them the seed decides:

- **the hour** — sunrise, noon, dusk or night (night twice as likely).
  Night is the moon and the stars; sunrise a GREEN dawn — cold teal
  overhead, pale green-gold at the horizon, a pale sun — so it never
  reads as dusk; dusk a low orange sun, a purple sky and warm fog; noon a high white
  sun, a pale haze and a blue sky, the lanterns barely showing. The
  sky's two lights, the fog colour, the sky dome, the sun or moon
  sprite, the grade's exposure and the lanterns' strength all follow.
  **Noon reads as the middle of the day** — the fill up by a third, the sun
  harder and whiter, a brighter haze to stand in and the grade's exposure
  lifted with it. It had been landing somewhere around six in the evening.
- **the clouds.** The dome carried nothing but a gradient, and a sky with
  no cloud in it reads as a backdrop. Every hour now has banks of them,
  built the way a cumulus is built: a dozen or more lobes strung along one
  **flat baseline**, swollen toward the middle of the mass and domed over
  it, each going down faint so that the density comes from the overlap
  rather than from one opaque blob — which is what the first pass was, and
  why they read as pasted on. Only the lobes riding highest take much
  light, which gives the mass a lit crown and a shadowed underside:
  fair-weather cumulus by day, cloud undersides lit orange at dusk, cold
  gold at the green dawn. The dome turns a few degrees a minute — faster
  when the wind is up enough to drive snow or rain sideways — so they go
  somewhere.
  Finding where to put them turned up something that had been wrong since
  the skies were written. **The dome's horizon falls at the middle of the
  texture**, and the camera, low behind the pilgrim's shoulder, shows a
  strip from about a quarter of the way down to it. Every gradient had its
  best part — the pale horizon band, the dusk's orange, the dawn's gold —
  placed at three-quarters and below, which is *under the ground*, and not
  one pixel of it had ever been seen. That is why the sky was a flat wash
  at every hour. The stops are all pulled up into the top half now.
- **the overcast sheets are tinted by the hour.** They are painted once and
  used at every hour, so a pale rain sky hung over a midnight field like a
  lit ceiling. The dome is dimmed to a fifth under a night's cloud, half
  under a dusk, and full only at noon; a storm's lightning multiplies on
  top of that rather than replacing it.
- **the ambience runs at under two-thirds.** The whole background bus —
  wind, drone, rain, thunder, the far-off creaks and the theme — sat at
  full and talked over the game. The storm's own two voices, which were the
  loudest things in the field by a distance, are pulled down harder still
  on top of that: the rain bed by nearly half, and every layer of the
  thunder by half.
- **the weather** — clear (three in seven), light rain, a storm, snow, or
  a blizzard.
  Rain is a cloud of streaks that lives round the camera and falls
  through it, with its own hiss and patter under the wind; a storm has
  nine hundred of them, and every five to fourteen seconds a bolt: the
  sky dome, the fog and both sky lights leap for a few frames in a
  double flash, and the thunder comes after — a near bolt cracks first
  and rolls hard, a far one only rolls, long and low, a second or two
  behind. **No two bolts are alike**: one comes down on top of you and
  *cracks* — a bright rip of tearing air and the whole sky falling in behind
  it, lighting everything once and hard; one *crackles*, a broken string of
  five or six dry reports running away from you over the field, each further
  off than the last, with the flash flickering to match; one is a flat
  *boom* a mile out; and one is only a *rumble* that never quite arrives,
  the low end alone, arriving late and slow and barely lifting the sky. The
  rain under them is heavier than it was by half again, falling faster, and
  driven sideways in gusts that come through in waves.
  All three cloud the sky: light rain draws a pale sheet of
  overcast across it and hides the sun or moon; a storm is a dark,
  lumpen cloud-roof, the fog greyer and the light down by a quarter,
  so the bolts have something to light.
- **snow** is its own weather, and changes the ground under the run.
  Seven hundred and sixty flakes wander down rather than fall — each is
  pushed about on two axes as it drops, and there is no rain bed under
  them, because snow is silent. The field's ground texture is swapped
  for drifts: pale where the light takes them, blue in the hollows,
  with dead stalks and frosted bone still showing through where it
  lies thin. The sky is shut like rain's, but the fill light RISES
  where a storm's drops — the ground throws it back up — the sun is a
  rumour behind cloud, and the hero's own amber lantern-light goes cold
  and halves, since there is no warmth on an open snowfield. **The
  footing changes with it**: snow gives the boot nothing to push
  against, so the stride is half again as slow to build and four times
  slower to shed. Every stop is a skid and every turn carries wide.
  Each heel strike presses a **boot-print** into the ground's paint
  layer — left foot or right, offset from the centre line — so the way
  you came is written behind you, following every rise and hollow; and
  the print crunches, a dry squeak of crust breaking over the pack of
  weight going into it. Changing the weather clears the paint sheet:
  what was gouged in mud is not there under a foot of snow.
- **a blizzard** is snow past the point of weather. Three thousand four
  hundred flakes, and they do not fall — they are *driven*, one way and
  hard, the gusts shoving the whole sheet of it sideways nearly twice as
  fast as it drops, with a hiss under it that quiet snow does not have.
  **A third of it is not falling at all**: it is spindrift, snow already
  down and picked up again, tearing along a few feet off the ground, and
  it is what makes a storm look like it is going somewhere rather than
  just coming down. And every seven to fifteen seconds the storm **leans
  on the field** — a squall swells and lets go over four seconds, the
  wind up by most of itself again, the fog shut to half of what it was,
  the wind's own voice rising with it, and for a second or two there is
  nothing out there at all. Each one is a
  **grain, not a bokeh ball**: a hard little core with the thinnest halo,
  drawn small, so that a screenful of them reads as ice in the air rather
  than white circles floating past the lens. The sky is shut and the sun
  is put out — and a real midday over a white field turned out to be more
  light than the grade could hold, so the fill and the exposure both come
  back down under cloud, hardest at noon and hardest in a blizzard. The fog
  closes to **six and twenty-seven** — and to half of
  that in a squall — so a hollow comes out of the white at about the
  distance it can smell you from, and no further. The ground takes the deeper texture — long drifts lit
  hard along the crest with deep blue troughs between them, the stalks
  buried, only the largest bones still proud of it.
  **And you stand IN it, and you carry it with you.** The pilgrim and every
  hollow are dropped a quarter of a unit into the drift, so the boots go
  under and the snow takes them to the shin — and a **heap of snow stands
  against each shin at the surface**, shoved up where the leg goes in. (It
  is drawn rather than painted on, because by the time snow is deep enough
  to matter the boot is under it and there is nothing left to tint.) Go
  shoulder-first through a drift in a **roll** and you come up **wearing**
  it: every part of the hero from the hip down carries a cold wash, heaviest
  at the shin and thinning to nothing by the belt, **and patches of the snow
  itself are left lying on him** — a small flat one on the top face of a
  dozen of his upper parts, found by measuring each part rather than by
  naming it, so it works whatever armour he has on. All of it beats off over
  about four seconds as he moves. (A wash of colour alone says almost
  nothing against a field of snow: the hero is a dark shape on white either
  way, so the snow has to be *there*.) Half his parts are textured, and a
  textured material's colour is plain white — a multiplier over the map, not
  a paint — so tinting it toward anything only darkens it, which is how the
  first attempt put snow on him by turning him blue. The tint is pulled
  first, and the lift is done with **emissive**, which adds light after the
  map is multiplied in. Driving the colour above white instead — the obvious
  answer — is worse than useless: the grade's S-curve is
  `mix(c, c*c*(3-2c), .62)`, and past about 1.2 that second term turns
  negative and the pixel goes *black*. That is why the snow he was supposed
  to be carrying had been making him darker. It is a look and nothing else: the ground the
  game measures is exactly where it always was, so no reach, no collision
  and no blade's height changes — and it is given up over the cathedral's
  flags, where there is nothing to sink into. The footing swaps one
  complaint for another too: where fresh snow is *slippery*, drifts
  **drag**. The top speed comes down by a fifth and the skid comes back,
  because a man wading is not a man sliding.
- **trodden snow.** A dusting is stepped ON; a drift is walked THROUGH,
  and those are not the same mark. So the field keeps whichever one it
  should, and never both:
  - **a dusting keeps boot-prints.** Each is real geometry: a seven-by-seven
    patch of ground in three rings — the untouched outside, a collar of
    shoved snow, and a flat floor pressed under it — with the whole grid
    pushed out onto circles, so what a boot leaves is a round-ended dish
    and not a stamped rectangle. Left and right off the centre line, and
    every hollow leaves its own, scaled to what is doing the treading.
  - **a drift keeps a furrow.** In deep snow the body does not step on the
    surface, it *ploughs*: the legs push the snow aside and what is left
    behind is one continuous channel, its floor pressed flat and a bank of
    shoved snow standing along both sides of it, running back the whole
    way you came. Everything that can carve one gets a **lane** — the
    pilgrim and the nine nearest hollows — and a lane is a strip of
    cross-sections laid down every third of a stride, the oldest pushed off
    the back when the lane is full. **Roll**, and the channel widens to the
    trough a shoulder makes.
    A cross-section is eleven points across and **no two are alike**, which
    is the whole difference between a furrow and a ribbon. Built as a crest
    and a floor it came out an extruded rail — two parallel white mouldings
    with a flat strip between them, which is a ski track, not snow. So the
    bank is given a **shoulder** outside it and a **skirt** outside that,
    dying back into the untouched surface instead of stopping at a line;
    the two banks take turns being the heavy one on a **stride** beat set
    by the distance covered, because each step throws snow mostly to one
    side and the next throws it to the other, so the channel scallops
    rather than running true; the line itself **wanders** a few centimetres
    either way, because nobody walks a ruled line through a drift; the
    width, each bank's height, the churn of the floor and the tone of the
    shoved snow are all **thrown about by a fifth**, fixed the moment the
    section is laid so nothing shimmers; and the far end **thins out** over
    the last five sections instead of stopping square. None of it costs
    anything: a section is shaped once, and never again.
    **And there is a head to it, which is part of it.** The heap of snow
    riding in front of the legs was its own little mesh floating along ahead
    of the trench — two things where there should be one, and you could see
    the join. It is a *cut of the ribbon* now, written at the leading end
    from wherever the body has got to since the last section was laid: the
    same nine points across, but with the middle pushed **up** into a heap
    instead of pressed down into a floor, so the channel runs continuously
    into the bank it is throwing. Only a blizzard has one, because only a
    blizzard has a furrow.
    **A channel ploughs through whatever was there before.** Walk back
    across your own furrow, or across one a hollow left, and the old banks
    stood up out of the new one — two trenches crossing and neither giving
    way, which is not how snow works. Snow shoved once is shoved again, and
    the newer pass wins: laying a cut flattens every older one it covers,
    wherever that one came from, its own last few excepted (those are the
    ribbon it is attached to, not something it is crossing).
    And a furrow's tones are **quieter than a boot-print's**: a print is a
    collar the size of a foot, while a bank is a continuous surface running
    twenty paces and catching the light the whole way, so the same numbers
    that read as a pressed dish read as a painted stripe once drawn out into
    a line. The crest sits barely above the snow, the floor barely below it,
    the banks lean less, and the relief does the rest.
    A boot down in a furrow leaves a **scuff**, not a dish — the floor is
    already dark and has nothing bright to shove, so the tread carries the
    channel's own three tones. Given the dusting's palette it came out as a
    ring of light lying in the channel.
    The channel is **a body's width**, and only a **roll** is wider: that is
    the one time the whole hero is on the ground and the shoulders are doing
    the ploughing. Built any wider than that it stops reading as a man
    wading and starts reading as a cart track. And no mark appears: a boot
    presses in over a third of a second, which is the difference between a
    footfall and a decal being switched on behind you.
  - **and snow goes up as well as down.** A furrow is what is left behind,
    and behind is mostly where the camera is — what you actually watch,
    pace after pace, is the snow the legs are shovelling aside right now.
    So every stride kicks loose grains up and back, more of them at a run,
    and a roll throws a whole sheet of it.

  Prints live in one shared buffer and lanes in another, both written
  straight into world space so nothing needs a transform or an object of
  its own, and each **draws in a single call** however many marks there
  are — and not at all when the snow is untouched. Every mark fills itself
  back in as it ages (the snow still coming down puts it back) over forty
  seconds in quiet snowfall and **sixteen in a blizzard**, because there is
  that much more of it falling.
  Two things had to be got right for any of it to show. A mark sits just
  **above** the surface rather than cut into it, because the ground is one
  mesh on a grid a unit and a half across and nothing carves into it — a
  floor written below it is simply hidden, and all that ever showed was the
  collar. It gets its depth the way a relief does: the shoved snow stands
  up as real geometry, the pressed floor goes darker than any trough in the
  drift, and the body that made it is dropped into the drift so it walks
  down among the banks rather than over them. And **the roads go under the
  snow** with everything else, both because a flagstone ribbon lying bare
  down the middle of a blizzard gives the whole field away, and because
  every ribbon used to float over a rise high enough to swallow a print
  whole.
- **buried, or already on its feet.** It used to be one or the other by
  *mode* — the field's whole host lay in the ground and the path's whole
  host walked about — and neither is right. What decides it now is the
  **ground it is standing on**: grave rows are full of things still in their
  graves (six in seven), a bone hollow nearly so; a chapel or a ruin is half
  and half; a dead wood has more wandering than lying; and almost nothing
  waits under a causeway or the flags of a nave, because there is nothing
  there to wait under. An ambush is always buried — that is the whole of
  what an ambush is. Both modes get the mix; a sleeper on the path climbs
  out of the tile's own ground exactly as one in the field climbs out of a
  grave.
- **the six wedges** — the field is cut into six wedges round the
  cathedral, and each takes one authored chunk, no kind more than twice
  a run: the **grave rows** (ranks of stones in arcs, every one facing
  the nave), the **hollow wood** (three groves of dead trees), the
  **ruins** (two roofless houses and, three times in four, the fallen
  tower), a **sunken hollow** (a bowl full of bone piles, slabs about
  its rim), a **causeway** (standing stones along a ridge's crest, one
  fallen), or a **roofless chapel** (three walls, a lancet still lit
  from within, a candle stand burning, four graves before its door).
  The south wedge, the pilgrim's walk in, is never walled off. Every
  chunk keeps off the roads and off everything placed before it.
- **the ground** — each chunk asks for the lie of land it wants, and
  the seed shapes it under the rolling base: a bowl under the hollow, a
  ridge under the causeway, a terrace with a soft scarp under the ruins
  and the chapel (and half the graveyards), a bending stream bed
  through some woods — and one more dry stream bed cut across a wedge
  on top of it all. Everything that stands on the ground reads the same
  height, so it all follows.
- **the landmarks** — a **well** (an open ring of stone, and inside it
  a stone-lined shaft going down three metres to a dry black floor —
  look over the rim and you see the courses of the wall going into the
  dark, no water; two posts, a crossbar, a bucket on its rope) and a small **town sign** (a post
  under two metres and a board a metre wide with the village's name,
  readable from the road: Ashmere, Gallowmoor, Hollowfen, Wrenhallow,
  Carrowdene, Blackwold, Sallow Cross or Marrowgate), each beside a road
  in its own wedge. The sign breaks like a pew: two blows and the board
  is knocked off whole to tumble away while the post snaps in two.
- **the testing menu** — under *The field (testing)* on the pause
  screen: the **hour** and the **weather** can be stepped through live
  (the sky's lights, the dome, the sun or moon, the fog and its range,
  the exposure, the dust, the lanterns, the ground's own surface and
  texture, the footing, the prints already pressed into it, and the rain
  — with its hiss and the storm's bolts — all re-set under the running
  game), **effects** and **music
  & ambience** each have a switch (remembered between loads) — the
  first is every blow, step, swing and voice; the second is the whole
  background: the theme, the wind, the drone, the far-off creaks and
  crows, the rain and the thunder — a **frame counter** (also remembered)
  that puts frames-a-second, draw calls and triangles in the bottom
  corner, off unless asked for — and the seed row
  above. `?time=noon&wx=snow` on the address does the same from the
  start, the rest of the field still the seed's.
- **the lanterns** — always at the ring's four junctions and the head
  of the stair; one or two down each quarter road at seeded distances;
  one by each landmark and the chapel's door; and a couple of strays.
- **the host** — every wedge is given a marrow budget and spends it on
  encounter templates drawn to suit its chunk: a **patrol** strung
  beside the road, a **guard** (a caster on the highest ground with two
  hollows), a **brute** (a big one and a hollow, likeliest in a hollow),
  an **ambush** lying low till you are close, a **nest** of two
  casters, a **pair**, a **crow** on a roost (three at most). The south
  wedge gets a light budget and only the small templates. The same
  total marrow is out there every run — a little over what the
  cathedral asks — laid differently; the Unburied waits under the grave
  rows, or under whatever lies where the seed put no graves. A
  red-boned horror costs its wedge no more than a plain one: its double
  marrow is the pilgrim's bonus, not the field's spend. One run in ten,
  one wedge's whole host burns red.

## The brink

**The field is a hexagon and the world falls away past its edge.** That was
always true — the ground mesh drops off into nothing out there, it is not a
painted backdrop — but an invisible wall stood a metre inside the drop and
you simply could not reach it, which made the most dramatic feature of the
whole field a place where you bumped into air.

The wall is a **cliff** now. Cross the lip — the last stride before the old
wall stood — and you go over it: no blow, no blood, the same ragdoll every
other death uses, thrown outward and then let off the world entirely, with
no ground under any part of it and no wall to catch it. It turns over once
and keeps going down into the dark the field sits on.

**And so do the horrors** — but only when they are not standing on their own
feet. One walking the rim of its own accord is held back the way it always
was; one that is flung, floored, or still carrying the speed of a blow goes
straight over the edge and dies on the way down. A greatsword by the rim is
a different weapon, and the ultra greatsword by the rim is an execution.

The Warden's nave and the path are **not** cliffs: the arena is the arena,
and the path's sides are shorn at a width that changes down every tile —
an instant death on a boundary you cannot read while running is a different
game.

## The path — survival

The title screen offers two ways, and a third that is only a note.
**The field** is the game above. **FPS mode** is a placeholder: the
button opens a description of a first-person revolver mode that is not
built; its plan is in `docs/FPS_MODE_PLAN.md`, and a brief for an
importable hero model made outside the game is in
`docs/HERO_MODEL_BRIEF.md`. **The path** is survival: instead of the one hexagon, a chain of hex
tiles laid end to end northward, without end — each an authored chunk
(the grave rows, the wood, the ruins, a hollow, a causeway, a chapel)
on its own seeded ground shape, with a road through, a lantern or two,
and a host sown to a budget that grows with every hex. Two or three
tiles always stand ahead of you, built as you come; what is fifty
metres behind is torn down. Every sixth hex is the cathedral, with a
back door and stair mirrored from the front so you walk the nave
straight through — and its host waits INSIDE the walls. Six thousand
marrow wins (the marrow counter reads to it); death ends the path
where you fall, with the hexes walked and the horrors felled on the
stone. There is no Warden on the path. The path is a RUN: walk and
sprint are half again as fast as in the field, and its host does not
climb out of any grave — every horror stands on its hex already,
pacing a few strides back and forth about its post (a pause at each
end), and comes the moment you are in reach.

The hitch that used to land at every new hex is gone, three ways.
Lights: three.js recompiles every lit shader the moment the scene's
count of lights changes, and every tile with a lantern (every
cathedral with its dozen candles and moonbeam) used to change it on
build and again on teardown — so on the path no lantern, candle or
nave light is ever put in the scene; a fixed dozen point lights are,
from the first frame, and each frame the twelve nearest you are
copied into them, flicker and all. The count never changes, so
nothing ever recompiles. Building: a tile is a job spread over
frames — the chunk one frame, then the ground, road and lamps with the
host sown into a queue — and the horrors themselves are raised two a
frame after that, seventy metres out in the dark where nobody sees
them arrive (before the first frame the first two tiles are still
built whole). Every step re-seeds the run's RNG, so a hex is still the
seed's alone.

Under the hood every tile is built with the same chunk code the field
uses, in the origin's frame as the field's north wedge, and then
shifted into place — objects, colliders, breakables, lanterns and the
host alike — so the field and the path share one set of pieces; the
cathedral's collision, stairs and doors are resolved against whichever
cathedral the pilgrim is nearest. `?mode=path` on the address loads
the path directly; a mode is a page, so choosing the other way on the
title reloads into it.

**What kills you decides how you go down.** Not one canned fall but four,
and the field goes on around you through all of them — the hollows keep
hunting, the snow keeps coming down, the storm keeps leaning on the field —
while the screen holds off for **three whole seconds** before it says what
it has to say.

| killed by | what happens |
|---|---|
| **a blade** | opened up. The blood goes out of you in a sheet and keeps coming for a second after, and you fold where you stand — no throw to it at all |
| **a thrown bone** | struck. Taken off your feet down the line the thing came in on, and you land wherever the physics leaves you |
| **something heavy** | the weight takes a limb with it. An arm or a leg comes off and lands a stride away, spurting, and the rest of you crumbles after it |
| **poison** | no fall. The rot has been in you a while by the time it finishes, so there is nothing left standing to fall: the knees go, then you lose your shape altogether — squatting down into the ground and out at the sides, going green as you go and spitting the stuff off you the whole way, until there is nothing above the field but the pool you left |

The first three are the hollows' own ragdoll, kicked differently, and the
heavy one borrows their limb-shearing outright. However you came apart, you
are built again from nothing on respawn rather than patched back together.

**They do not simply stand up out of the ground, and the ground shows it.**
A body sliding up out of a surface that never moved is the whole reason the
rise read as a fault rather than as a thing climbing: nothing was displaced.
So the earth over it is **torn open in the paint**, and a **mound of spoil**
is pushed up and heaved wider as the thing works at it, falling back flat
once it is out — and the torn ground is left there for good. The soil does not give,
and a thing with no muscle left on it has to argue with it. A hand breaches
first and scrabbles at the dirt for a moment with nothing under it; then it
*heaves*, gets a third of the way, and the ground takes it back. It heaves
again, gets further, slips again. The third one holds. The whole way up it
shudders, the trunk stays folded over itself and the head hangs, and only at
the very end does the body straighten and remember what standing was — two
and a half seconds end to end, where it used to be one. Under it is the
sound of soil giving way: a long low rumble that *swells* rather than starts
— the ground shifting before anything shows — grit and small stones
crumbling off it the whole way, and three heaves audible in it, the two that
fail and the one that does not. The earth keeps breaking around it until it
is out.

## The weight of a swing

Two things carry the mass of a weapon, and neither of them is speed.

**The shape of the arc, which was backwards.** Every swing runs on four
keys — carry, wind, strike, follow-through. The carry-to-wind leg was right,
an ease-out, the blade settling at the top of the load. But the *wind to
strike* leg ran on `1-(1-x)^3.5`, which is an ease-out as well: the blade
lurched to its fastest on the first frame of the arc and **decelerated all
the way into the impact**. That is the whole of why a swing read as starting
up with new momentum and then going slack — there was no acceleration in it
anywhere, only a lurch. A blade accelerates *into* the thing it hits. The
arc is an ease-in now, fastest at the moment of contact, and the
follow-through drags out long and slow behind it with the weight still in
it. The mass lives in that contrast and nowhere else.

**A kinetic chain, where there was a blend.** Every joint used to chase the
posed frame at the same rate, so the hips, the shoulder and the blade all
arrived together — which is a puppet, not a body. A body throws a weapon in
*sequence*: the hips go, the trunk follows, the shoulder follows that, and
the blade is last, arrives late and **overshoots**, because nobody stops a
greatsword exactly where they meant to. So each joint is on its own spring
now — stiff and quick at the hips, slacker and later at every joint further
out, slackest of all at the weapon — and every one of them is *under-damped*,
so it carries past the pose and settles back. The lag down the chain is the
whip and the overshoot is the follow-through, and between them they are the
entire feeling of weight. Measured on a sweep: the trunk peaks at 0.66 of
the swing, the arm at 0.88, the blade at 1.03 — each a beat behind the last,
the blade still travelling after the swing is nominally over.

None of the poses changed. They did not need to.

## The chain

**A chained swing does not start from rest.** Every attack pose in the game
is four keys — carry, wind, strike, follow-through — and the *wind* takes
the first forty-two hundredths of the swing. Start the second cut of a combo
at zero and the blade travels all the way back to the shoulder before it
comes down again, so three strikes read as three separate attacks with a
dead stop between each. But the blade is **already moving** when the second
one begins.

So a chained swing begins **a fifth of the way in**: past the carry, into
the wind, with the load already on it. Nothing about the poses changes and
nothing can fall out of sync, because the strike, the whoosh, the lunge and
the hit are all read off the same clock — they simply arrive sooner, which
is what a combo *is*. The stride carries through the seam too: a swing that
is already going does not stand still waiting for its own wind to finish
before it moves again. And the rig's pose blender carries the last swing's
follow-through into this one's wind across the join, so there is no join.

**And the seam itself is closed.** Getting the *timing* right was only half
of it. Every swing's pose is authored to begin at the carry, so entering one
a fifth of the way in drops the body onto a target that is already well over
half the distance from the carry to the top of the wind — a step, taken in a
single frame, which the joints then chase. That step is precisely the little
hitch you could feel between one cut and the next.
So at the instant a swing chains, the body's **current** pose is taken down,
and for the first fifth of a second the new swing's target is blended back
toward it: full weight at the join, easing away with no corner at either
end, and gone long before the strike lands. The target curve therefore
*starts exactly where the body already is* and has no step in it at all,
while the springs keep every bit of the speed they had — so the swing
continues rather than restarting. Measured across the join, the greatsword
moves **40% less** in the frames after a chain than it used to, the ultra
**70% less**. The seam is scaled to the swing, so the slab gets three
tenths of a second of it and the katana under two.

It applies to every weapon and every way in — the ordinary chain, the one
that flows out of a charged cut into the overhead, and the one that comes
out of a rolling attack — because they all go through the same door, and
because none of it asks what the weapon is.

## The roll

**In four parts, not one.** It used to be a single move: speed at its
maximum on the first frame and falling from there, a body turning at a flat
rate the whole way, and five centimetres of lift on the trunk. That is not a
dodge, it is a man falling over while he slides — there is nothing to push
off from, nothing in the air, and nothing lands.

It is **one motion**, not four poses in a row: the turn runs on a single
curve from the first frame to the last of the roll — flat at the start while
he is still loading, accelerating through the air, fastest right about where
he comes down, easing off into the finish — so there is no frame where the
rate of it jumps. Push and tuck *overlap* rather than switch: the load is
still coming off the legs while the knees are already coming in.

**The first frame is the whole of the feel.** A dodge that spends a tenth of
a second building speed out of nothing has told you, seven frames running,
that your thumb did not land — and no amount of weight later in the move
buys that back. So the push is a **kick and not a coil**: four hundredths of
a second, nine tenths of the speed already there on the frame the button is
read, the turn already begun, and the body *committed* rather than crouching
to get ready — the shape of a push that has happened, not one that is
coming. He is off the ground by the third frame and invulnerable by the
second. The weight is still in it; it just stopped asking permission first.

1. **The push.** A kick off the back leg, the trunk already thrown along the
   line he is going.
2. **The flight.** The speed holds, with only the air on him. The whole body
   — the *root*, not the trunk — goes up over a real arc, a third of a unit
   at the top, and the knees come in. A fifth of the turn happens here.
3. **The landing**, which is a beat of its own: a dip of the camera, a thud,
   and a burst of whatever he came down in. In snow the furrow stops being
   cut for as long as there is nothing cutting it, and gouges hard here.
4. **The roll.** The other **four fifths of the turn whip through at once**,
   which is what reads as a somersault instead of a stumble, while the
   ground takes the speed back. Then he rides out on his feet with some of
   it still in him, so a roll into a run keeps going.

### The thief does not roll

A man in cloth with no plate on him has no business throwing himself on the
ground and getting up again — **he steps.** The thief's dodge is the
quickstep: low, flat, gone and back on his feet before a greatsword has
finished leaving the floor, with **no arc to it and no turn in it at all**,
and it does not land because it never left. He drops low, throws the trunk
along the line he is going, scissors the legs — one flung out ahead, one
trailing — and sweeps the arms back behind him, all on one hump, so there is
no recovery pose to sit in: by the time it is over he is already standing.

It reaches **less than a roll** (about three and a half units to the roll's
five) for **half the recovery** — four tenths of a second in the field, less
than a third on the path. That is the trade.

And while he is inside the window **he is not quite there**: the whole of
him thins to a quarter and comes back, in and out fast at both ends, which
is the only warning a blade gets that it is going to pass through him. It is
the same wardrobe the snow and the blood use — made *able* to fade once,
when the rig is built, because flipping forty materials to transparent at
the moment of the dash would rebuild forty shaders in the frame the player
most wants smooth. Depth-writing goes off while he is thin, or the parts of
him sort against each other and he comes apart.

The **field** takes it slow and heavy — seven tenths of a second, the leap
at eleven and a half, invulnerable from .06 to .46 so the tail of the roll
is punishable. The **path** is a run and not a pilgrimage, so it gets the
snappy one: just over half a second, faster off the ground, and the window
scaled with it. The ground covered is tuned to stay near what the old roll
covered — a leap that also doubled the dodge's reach would be a balance
change wearing an animation's clothes.

## Life, in hearts

Life is **seven hearts**, drawn at boot like everything else in the game —
whole, half, and the empty socket left when it is gone — nearest-filtered
and blown up, with no bar and no gradient anywhere in it. The shape is
**heraldic and not the fat round one off a playing card**: narrow lobes, a
deep cleft between them, shoulders that pull in almost at once, and a long
tapered tail down to a point. Ten pixels across by fourteen down — ten
because an even width is the only one with a true centre line, and a half
heart has to split on it. The cleft runs **four rows down**, not two: a
shallow notch reads as a dent, and what makes the shape gothic rather than
cute is how far the two lobes are driven apart before they meet. The row is only rebuilt when the count of halves actually
changes, so watching it costs nothing.

**Every blow in the field is a whole number of halves.** A hollow's swing
takes **one heart**; a caster's bolt or a thrown bone, **half**; the
Unburied's reach, one; a brute's, **two**; the Warden's and the Fallen
One's, **one and a half**; the boss, **two and a half**. The rot takes half
a heart at a time, every second and a bit.

**And what is left of you shows on you.** Three states, not a slide: above
two thirds of your hearts you are clean, below it there is blood on you,
below a third you are soaked, and on the last two hearts it is nearly black
with it. It is a **colour and nothing else** — the same wardrobe the snow
uses, lerped the other way, one pass over forty materials at the moment the
state changes and nothing at all in between. The upper body takes most of
it, since that is where a blow lands. (It has to be lerped toward a dark
*red*: pulled toward something near black he only came out grimy, there
being no red left in it to give.)

## Elements

Fallen horrors sometimes shed a mote of the power that moved them —
**fire**, **lightning**, or **frost** — or a warm red mote of the
**life they stole**: walk into that one wounded and it mends 35
vigor on the spot (at full health it waits on the path for you).
Each mote wears its nature: fire flickers restlessly and streams
embers, lightning jitters and spits little bolts, frost hangs cold
and still with sparkles wheeling around it, and the health mote
beats like a heart.

**And each one has a face.** A drop used to be a round glow in a
different colour, so four of them lying in a nave read as four of the
same thing. Now a small painted sprite sits *inside* the glow, lit from
behind by it: the health mote is **the heart off the corner of the
screen**, the same heraldic shape at the same proportions, so what mends
you looks like what it mends; fire is a molten ball with tongues licking
up off its shoulders, lightning a dark amber one with a white fork
standing on it, frost a pale one under a six-armed barbed flake. The
glow is what you see from across the field and the face is what tells
you what you are about to pick up once you are near enough to care.
(The first pass hung thin strokes off each rim and they read as
scratches. A face this small needs **one bold filled shape**, not
detail.) The elemental motes imbue the blade for a while,
glowing and shedding sparks: fire sets whatever it bites **burning** —
a chip of life every half-second for four seconds, shedding embers,
the way the Unburied's poison works on you — lightning arcs from your victim
to the next horror in reach — and quickens your arm while it rides
the blade — and frost FREEZES whatever it bites where it stands for twelve long seconds: no step, no swing, its state clock stopped, a rest pose with a shiver and a rime of mist coming off it.
The element gutters out after a time — or is lost with your life.

**Fire clings, and then it takes.** One hit off a burning blade leaves a
horror smouldering — embers, a chip of life every half second, guttering out
in four. A **second hit**, while the first is still on them, is the one that
does it: dry bone that has been alight twice does not go out. *They go up.*
Ablaze is its own thing and not a bigger number — it burns three times as
long, takes twice as much twice as often, and the fire is **on** them:
riding the trunk, the skull and every limb they still have, throwing a glow
of its own across the ground. They are **tongues and not blobs**: four of
them in a two-by-two sheet, each drawn in layers from the outside in — a
dark red edge, an orange body, a yellow heart, a white core — every layer
shorter and narrower than the last, which is what makes a flame read as hot
in the middle rather than as an orange smear. Each sprite carries its own
copy of the sheet and runs the cycle on its own count, so the fire on a body
*flickers* instead of pulsing in lockstep. They carry it until it kills them, which it very often does. (The
glow is a haze sprite and not a light: three.js recompiles every lit shader
in the scene the moment the count of lights changes, and a host of six going
up one after another would recompile the world six times.)

**An imbued weapon lights as itself.** It used to be one round sprite hung
off the blade's point light — a ball of colour near the hand, the same ball
for a longbow as for a slab of a greatsword. Now every mesh the weapon is
built from is copied twice, each copy a *child* of the part it copies, so
it inherits that part's transform exactly and follows every joint of every
swing with nothing of its own to keep in step. The first copy is the
geometry unchanged, drawn additive: the steel burns in the element's colour,
in its own outline — a slab where a slab is, a curve where a curve is. The
second is the same geometry pushed out along its own normals once, at
build, and turned inside out: a fringe of light standing just off the
silhouette. Only the blade parts take the fringe; the grip and the guard
get the burn alone, and only as much of it as the weapon lets down to them.
A chain of soft beads is strung down the weapon's longest axis in place of
the one ball, each weighted by how far it is from the *hand* — so on a bow,
where the hand is halfway along, both limbs burn and the handle between them
stays dim. All of it is hidden until an element is taken: an unlit weapon
costs nothing.

**And each weapon takes it its own way:**

| | how it lights |
|---|---|
| **greatsword** | a broad blade takes it whole — an even heat the length of it, breathing slow, the fringe wide |
| **ultra greatsword** | too much iron to light at once: the heat CRAWLS up the slab from the guard to the point and starts again, slow and heavy |
| **katana** | only the edge really takes it — a thin, bright, restless line that shivers rather than breathes, and next to nothing on the grip |
| **longbow** | the limbs hold it and the string carries it, and the whole stave answers the DRAW: banked at rest, fiercest at full stretch |

A landed cut can also take something with it: a sweep or a thrust
sometimes shears an arm off at the shoulder, an overhead sometimes takes
the head — the piece flies, lands and lies there in the body's own
colour (never the red of the hit flash), and the horror keeps
coming without it. Every swing also carries a chance of a **telling blow** — near double
damage with a golden ring and a crack like a bell — and a telling
blow blasts a small skeleton clean apart: real bones and a skull go
flying **down the line of the blow** — the way the blade was travelling,
so a sweep from the left throws them right and a thrust throws them
back — tumble, and lie scattered on the path. If life remains in
it, the bones drag themselves back together and it climbs upright
to come at you again.

## The mark of the reaper

Rarely — one drop in sixteen or so — what a horror sheds is not power but
**permission**: a white skull turning slowly in a bone-pale light, with no
colour in it at all, because the thing it does is take colour away.

Walk into it and the skull comes with you, hanging over your head and
turning, for **sixteen seconds**. While it does, the blade does not wound
anything it can finish — it **finishes it**, and moves on to the next. Not
a damage number: a killing move, spent on demand. The blow alternates
between the two the game already owns — the **cut in two** the katana has
to earn by wearing a horror down to half its life, and the **head off** an
overhead blow — so a nave full of them does not die the same way six times
over. Either way it goes out in a white ring and a fall of bone dust, and
the mark is still there for the next one.

It is **not an element**. It never touches the blade's colour, nothing is
imbued, and fire or frost already burning on the steel keeps burning
underneath it — the only mark on the weapon is a pale cold rim, and only
when nothing else has claimed the light. A parried blade is nowhere near a
body, so a parry takes nothing with it. And the **Warden is too heavy to
simply take**: the mark leans on it — near three times the damage — and no
more.

In the last three seconds the skull begins to gutter, the way an imbued
blade does. Death lets it go, with everything else.

## How the Warden ends

It kneels — the legs fold, the claws drag at the flags, the head lifts once
with the ember in its chest guttering out — and that much was always right.
What came after was not. The authored fall pitched the **whole rig about its
own root**, and the root sits at the feet, so the Warden rotated straight
down through the floor and the last thing you saw of the fight was its
shoulders going under the flagstones.

So the kneel plays as it always did, and then the body is **handed to the
ragdoll**. It goes over the way a thing that size goes over, lands where the
physics puts it, and lies there long enough to be looked at before it comes
apart into bone. The ragdoll was refused to the boss and the two that are
not hollows on purpose — something that big flopping at every stagger is a
joke — so the dying asks for it outright, and nothing else can.

## The two that are not hollows

Two things in the field are worse than the host, and each borrows the
Warden's bar while it hunts you.

- **The Fallen One** comes down out of the sky wherever you are the
  moment your marrow reaches 800. It is an angel only by the shape of
  it — a neck far too long with the head hung off it at a broken
  angle, three pale eyes behind a bone mask, a cracked halo hung
  askew, claws for hands, knees bent the wrong way, and wings of bare
  bone spars with the membrane rotted half away. It never touches the
  ground, and its head snaps sideways when you aren't looking. Three
  moves: the **wingblade** (both wings scythe forward across the
  ground), the **plunge** (it rises, hangs over your position, and
  drops like a stone — roll out from under it), and the **lament** (a
  shriek that flings a ring of black feather-shards, then a fan aimed
  straight at you). Fell it for 220 marrow and a mote of life.
- **The Unburied** sleeps under the grave rows in the east and erupts
  when you walk its row. A grave-thing, contorted and mutated: the
  spine wrenched a quarter turn with vertebrae tearing out of the
  back, a swollen boiled belly, the head hung sideways off the shoulder
  with the jaw unhinged, one arm monstrously long and dragging a claw,
  the other twisted behind its back, and a third, vestigial arm pawing
  from the collarbone. It lurches in surges, and **it poisons**: the
  **rake** of the long arm, the **retch** (three globs of bile lobbed
  at you that burst into puddles — don't stand in them), and the
  **burrow** (it sinks, travels under the soil, and erupts again behind
  you in a cloud of rot). Poison ticks your life away for seconds and
  can't be rolled off — only outlasted. Fell it for 200 marrow and a
  mote of life; its belly bursts when it dies, so step back.

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
marrow lying where you fell.

The cathedral itself stands on a stone plinth, reached by a flight of
steps at its south door and by nothing else — the rim is a wall.
Inside is a long church — twenty-four metres wide and forty-five long
— a nave of pews between two colonnades under a
pitched roof of stone slates on tie beams — slates missing here and
there, so the moon gets in, and two fallen beams lying on the floor —
lancet glass between the buttresses, lit bright by the moon behind it
and glowing softly from both faces, the rose window the same, eight tall iron candle stands down
the aisles burning with real, breathing light that keeps the nave lit,
and at the far end the
altar on its dais under the rose window, where the moon comes straight
down. The pews break —
two hard blows and one bursts into splinters and planks, a roll through
one does the same, and the Warden shoulders through them as it comes.
The gravestones out in the east break too: two blows and the slab
comes apart into chunks. Walk the nave and the
**Gravewarden of the Bonefield** rises from before the altar, with a
second phase when its rage remembers itself — its eyes catch and burn
red, shedding embers. When it falls it goes down in three beats: onto
its knees, claws dragging at the flags with the head lifted and the
ember in its chest guttering out, then the whole mass pitching forward
onto its face, and only then to bone. Fell it, claim the altar,
and the field is yours.

## How it's built

Everything is generated at boot inside the one file:

- **Renderer** — three.js r128 (inlined), rendered at ~240p and upscaled with
  nearest-neighbor, clip-space vertex snapping for the PSX wobble,
  **affine texture mapping** — the console's most famous wrong, textures
  walked across a triangle in even steps of screen space instead of of
  the surface, so the picture swims and buckles with the angle (hardware
  has interpolated perspective-correct since, and WebGL1 has no
  `noperspective` to ask it not to, so the correction is undone by hand:
  the uv is carried multiplied by w with w beside it and the two divided
  back out in the fragment, where the division cancels and what lands is
  linear in screen space) — and **capped**, which the console never had to
  do. The swim is an error proportional to how much `w` varies across a
  triangle, and the PS1 never had to bound it because its triangles were
  never large. This cathedral's are: a wall face spans many units, and
  seen at a *grazing* angle the error stops being a wobble and becomes a
  shear, the brick courses sagging, kinking and running off diagonally.
  Cutting the world's boxes up (every box and column is segmented about
  every two units now, six a side at most, which also buys better
  per-vertex lighting on a big wall) brings the flat-on view back and can
  never fix the oblique one. So the fragment is handed BOTH uvs — the true
  one and the swimming one — and the difference between them, which is the
  swim exactly, is clamped to three hundredths of a face: a small triangle
  never reaches the limit and keeps the whole of its wobble, while a
  wall-sized one is held to a PS1's worth of it instead of tearing itself
  open. `?affine=0` turns it off, `?affine=full` lifts the cap —
  **distance fog** standing in the very colour the sky is — the same
  Color object as the background, so every hour, every weather and every
  white flash of lightning carries the fog with it, and the land never
  ends at a hard edge. Its range is the weather's: the field is a
  150-unit square whose far edge stands about 106 away, so a fog that
  ended at 158 was there and never read. Clear sees 30 to 132, light
  rain 24 to 110, a storm 20 to 96, and snow closes the world down to
  13–68, and a blizzard 9–44. Then film grain and vignette overlays.
- **Static bake** — the cathedral is three hundred and thirty-one separate
  pieces and not a stone of it moves, so at the end of its building the
  parts that are only ever looked at are folded together by material into
  one geometry each — 224 pieces into 5 on the field, 221 into 4 on the
  path. Everything the game still holds a handle on is left untouched: the
  pews that break, the walls a blade can score, anything carrying collision
  or a light. The picture is identical to the triangle; the card is simply
  told about it 219 fewer times a frame.
- **Textures** — all procedural 256px canvases: flagstone with moss and
  trodden bone chips, weeping stone walls, ossuary walls of mortared skulls,
  weathered gravestones, rusted iron, dead bark. Nearest-filtered, sRGB.
- **World** — a vast hexagonal field with broad procedural elevations,
  laid out in quarters around a ring road: an ordered cemetery, groves
  of dead trees, roofless ruins and a fallen tower (all with real
  collision), the land shearing off into dark void at the hexagon's
  edge, a starfield night lit only by a low moon, iron lanterns along
  the roads casting real flickering point-light, a soft additive haze
  blooming around every light source, the hero's own warm
  glow pooling around them, and the cathedral — bone wainscot,
  lancet glass, rose window, a moonbeam standing over it — at the
  center.
- **Characters** — low-poly articulated rigs (armored knight with a one-piece cape,
  barbute helm, and an ultra greatsword with a long two-hand haft,
  carried DS3-style — arm extended on the haft, guard at the shoulder,
  blade rising over it toward the back — swinging edge-first with the
  left hand IK-planted on the haft; skeletal hollows with rounded
  crania, true eye sockets, hinged jaws, ribcages and knuckled joints;
  wheeling carrion crows;
  the horned Warden with a burning heart) with fully procedural
  animation: counter-rotating walk cycles, telegraphed windups, combos,
  rolls, clawing-from-the-grave rises, and deaths that buckle at the
  knees and crumble into bone piles — all run through critically-damped
  pose smoothing so every joint eases instead of snapping. When a
  hollow or brute dies, or is slammed flat, its rig hands itself to a
  **verlet ragdoll** — no physics library: point masses at the joints,
  distance constraints for the bones, braces for the trunk, gravity,
  the ground with friction, and the walls — and the body falls the way
  the blade sent it — a sweep flings it sideways along the cut, WITH the
  blade's momentum (the first cut comes round right to left and throws
  them to the hero's left, the second the other way; the whirlwind, and a
  katana's level cut, likewise), a thrust straight back, an overhead down
  on its face — tumbles, and lies where
  it lands before the bones
  come apart into the soil. The knight's cape is a sheet of verlet cloth
  pinned across the shoulder blades — it hangs, folds and swings on its
  own, slides over the hips and never crosses the back, and shows a
  darker lining on the inside. Bone doesn't bleed: a skeleton sheds dust and
  chips instead of blood and leaves no stain. The finishing cut's halves are two such
  ragdoll fragments flung apart off the blade, the cut plane riding in
  each one's hips. A broken pew comes apart into planks that fly,
  bounce, settle flat and lie there. The knight's
  long, broad cape is a single strip of cloth pinned to a chain of five
  hinges that share one capped lift, so it streams out behind a sprint
  in one seamless piece instead of curling up over the back.
- **Audio** — synthesized WebAudio, run through a deliberately grimy
  master chain (tape saturation, a dull low-pass and a stone-room reverb
  that deepens inside the nave): two bands of
  graveyard wind, a sub drone, far-off creaks and crows, heavy armoured
  footfalls, whooshes, bone-splintering hits, the death gong, the
  Warden's roar, the Fallen One's shriek, the Unburied's retch.
  Footfalls know the ground: on the field a boot lands in turf — the
  heel's thump swallowed, a brush of grass under the sole, the soil
  giving, the plate settling low and dull, nothing that could squeak —
  and on the cathedral's flags and stair the old ringing step. Bone
  under steel is never hollow: a crunch with mass, then one of three
  breakings drawn by lot and pitched fresh each time — a clean SNAP
  with a smaller one behind it, a CRUSH that crumples over a tenth of a
  second in a run of small cracks with a grind under them, or a
  SHATTER that comes apart into a long clatter of chips — the body
  settling after, and the last chips slow behind it. The Fallen One
  breaks the same way (a skeleton too), with feathers off the wings
  and a chime under; a crow hit is all feathers and a squawk, two
  harsh syllables, the second cut short — no bone in a bird. The
  Unburied is slush: a slap into something more water than meat, the
  wet giving in pulses, a slosh rising and falling as it moves,
  bubbles through it, the suck as the steel comes free, drips after;
  its heave bubbles and slops. An element on the blade is heard in
  every swing: fire is a great brand swung, five slow swells a tenth
  of a second apart the way flames lean and recover in a wind, with
  crackles all through; lightning is a HUM that swells and climbs with
  the arc — the charge singing in the steel — a rush of air drawn
  after it, a few ticks off the edge and the fizz; ice is the cold
  itself, a breath of chilled air through the arc. Steel into the
  world sounds like what it met: METAL (a lantern's post, a candle
  stand) rings bright; a WALL takes a heavy clank with the thump of
  the blow in it, or the edge skidding along the stone before it
  bites; STONE (a gravestone) knocks, dull and short, and sheds grit.
  **And the blade in the hand decides the swing.** A greatsword does not
  make the same noise going through air as a katana and never did: a slab
  DISPLACES air — a low push you feel before you hear it — and a katana
  CUTS it, which is a thin, fast, rising whistle with almost no body
  under it at all, a second thinner pass a hair behind for the air closing
  again, one keen overtone off the spine, and gone inside a fifth of a
  second. One flag, set when the pilgrim is rebuilt, so every swing in the
  game speaks in the right voice — the combo, the charges, the draw, the
  waterfowl — without a single one of them having to know.
  **The Unburied is not a wet thud.** The thing is a skin of grave-rot
  holding several gallons of water and the blade does not so much strike
  it as open it, so the blow is in four parts and the last is the longest:
  the slap of the edge going in; the SPLIT, something sodden tearing low
  and broad; the SPILL, a wash of noise falling away downward for most of
  a second while the inside of it goes out onto the ground; and then the
  patter, still running off it long after everything else has stopped.
  Gurgle, bubble and suck all the way through, and fat pitched drops
  hitting the soil at the end.
  Steel catching steel mid-swing (the parry) is a short scrape, no
  bell. VOICES are sung, not chipped: a sawtooth through three formant
  filters shaped to a vowel, on a pitch line, with breath under it —
  the same throat the chant uses. When the hero takes a wound a man
  cries out, one of four drawn by lot — "ah", "oof" with the wind
  knocked out, "ugh", "agh" with a catch in it — over the thud of the
  blow in the body. A pew takes a knock of old oak, and when it breaks every plank
  clatters on the flags as it lands, as hard as it fell. The thrown
  katana coming home makes no hum — a whoosh each half-turn as it
  whirls back, the air drawn after it. The Fallen One
  LAUGHS in that same high, wrong throat — a run of "ha"s that quicken
  and climb, breath under each, breaking into a wavering shriek — and
  CRIES when it is hurt: three sobbing catches, a wail that wavers and
  falls, a whimper after (and long, when it dies). And while the Warden
  stands there is a CHANT over his drone: a choir of the dead, voices
  sung rather than played (a sawtooth through three formant filters
  shaped to an "oh", two tenors a hair apart with a singer's late
  vibrato and a bass an octave under, in unison as plainchant is),
  singing a long-breathed line in D Phrygian — phrase, rest, phrase —
  that never resolves; when the marrow stirs the line quickens and a
  fourth voice climbs a fifth above it, organum, and wrong. There
  is no theme, nothing you could hum — three layers instead. **Unease**:
  a sub drone that swells slowly, always there. **Threat**: a low bowed
  string with a slow vibrato that rises while something hunts you, a
  bell struck now and then, and your own heart when your life is under
  half. **The nave**: a choir pad on a D minor chord with one high held
  note inside the cathedral, handed off to the Warden's tremolo drone
  when he rises.
- **No dependencies fetched at runtime.** Works offline.

Originally a Godot prototype; taken over and rebuilt as a web POC so it can
be played instantly on a phone.
