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
  In first person (see *First person*, below) the first click takes the
  mouse: mouse look, left button fire, right button aim, R reload, Q and
  1–3 swap, F zoom, Shift sprint, Space dodge.
- **Pause** — the **II** button top-right (or Esc) freezes the field and
  opens a tabbed panel — *the pilgrim*, *this run*, *controls*, *the
  field* — one section at a time, Resume always in reach; it
  shows the run's stats — marrow, horrors felled, host remaining,
  deaths, time, the state of the two mini-bosses, the Warden and the
  cathedral — with the full touch and keyboard control lists, and **the
  pilgrim**: a lit portrait of your knight with three selectors under it.
  **Weapon** — the greatsword, the ultra greatsword, the longbow, the
  katana, the wand — or one of the six guns (see *First person*), which
  he carries over the shoulder in either view. **Armour** —
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
  a short mantle), the **OG knight** — the first knight as it was, all
  primitives and a hinged cape — or the **wizard's cloak**: no steel
  anywhere on him. A deep cowl drawn out to a long point with nothing in
  it but shadow, a pale indigo robe, wrapped forearms, and a short cloak
  of real simulated cloth lined in warm gold that drags and swings on its
  own. He stands taller than the knight because there is no armour to
  shorten him. **Charge** — the charged attack for the weapon
  in hand. The choice is remembered by the browser and the body is remade
  on the spot. **The view** — over the shoulder, or **first person**,
  which is the same field or path played as a shooter: see *First
  person*, below. In first person the weapon selector cycles the guns
  instead, and the charge row becomes the **attachment** on the gun's
  rail.

## Controls (touch)

- **Left thumb** — joystick. It appears wherever the thumb first lands
  and stays planted there; drag past the ring and the nub rides its edge
  rather than dragging the whole stick along. Push it past three-quarters and
  the walk breaks into a **sprint** — the knight pitches forward and
  the greatsword trails along the hip.
  **It cannot lock on any more.** A touch that vanishes without a lift —
  a system gesture taking it, a notification, the tab going to the
  background, the browser quietly handing the capture back — used to leave
  the last deflection in it for good, and the pilgrim would walk into the
  fog on his own with nothing on screen to argue with. There are five ways
  out of that now, and the last one needs no clever plumbing at all: **a
  fresh touch anywhere on the left half re-seats the stick**, whatever
  went wrong
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
  - **the wand** — the one weapon on the pilgrim that does not strike
    anything. A short crooked rod of black wood, its head split into
    three claws with a bubble of light standing in them, and a tap
    **blows another bubble off it**. What the cast leaves behind is the
    weapon: each bubble is a slow, patient, heat-seeking thing that lives
    its own life from the moment it leaves the claws, and the wand only
    ever adds to the swarm. Taps chain as fast as you can make them.

    A bubble has two minds, and the switch between them is the whole
    idea. **With a horror marked**, it *hunts* — it leaves the wizard
    slowly, gathers way, and steers after the mark at a fixed turn rate
    rather than aiming at it, which is what makes it read as heat-seeking
    and lets a horror that keeps moving pull one wide for a while. It
    bursts on arrival for 14. **With nothing marked**, it *waits*: it
    wheels round the wizard at arm's length, bobbing, each one keeping
    its own lane — the golden angle round the ring, one of three radii
    and one of three heights — so eight of them read as a swarm and not
    as one blob at his shoulder. Lose the mark mid-flight and they all
    come back to the ring; find another and they peel off again from
    wherever they were going. You do not aim a wizard; you build a cloud
    and then decide what it is for.

    **Eight is the cap and it is hard.** A ninth cast recycles the eldest
    rather than growing the swarm, so what a wizard costs the frame never
    moves: a bubble is one low sphere with an additive film plus one glow
    sprite — two draws — and no light goes anywhere near it, because a
    light count that moves recompiles every lit shader in the game.
    Measured on the field: the wizard's rig is **34 draws cheaper than
    the knight's**, and a full swarm on top of it is **+16**. They thin
    out and let go on their own after sixteen seconds, and they go out
    with him when he dies.

    He carries it in one hand, which is new: every other weapon on the
    pilgrim is held in two, and an armed rig keeps both hands on the grip
    and swings neither arm. The wand's rig is flagged one-handed, so the
    wand hand stays where the carry put it and the free arm swings with
    the stride the way an unarmed one does.

    Its charges: the **bubble volley** — the wand swept wide and three
    blown off it at once, fanned so they take three different ways round
    — or the **great bubble**, one slow heavy thing worth three of the
    small (42), which takes its time getting there and bursts hard when
    it arrives. Thor's lightning is on the wand too, as it is on
    everything.
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
    knight flashes straight through whatever stands in the line, the
    world slowing for the cut, and stands past them with the blade out
    — nothing happens to them until the guard clicks home in the
    sheath, and then they fall in two. **The draw closes whatever the
    eye can hold.** With a horror marked the step is cut to the
    distance and spent in the same sliver of the animation however far
    that is, so one fifteen metres off is crossed *faster*, not later,
    and the knight comes to rest a stride past it exactly as he does
    from three. Unmarked, it is the old fixed five metres straight
    ahead. Or the **piercing thrust**:
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
    whatever lies between for half. **And it always arrives.** The catch
    used to be a fixed metre while the blade closed at thirty a second —
    so on a heavy frame it covered a metre and a half and could STEP
    clean over the hand, land short on the far side, turn, and step back
    over it again, whirling round a pilgrim with empty hands. It came
    home on a good frame and not on a bad one, which is why the katana
    only *sometimes* vanished. The catch is now whatever the blade
    covers in that frame, the step is clamped so it can never pass the
    hand, and the last three metres are flown straight at it instead of
    steered — a homing thing with a turn rate can orbit anything it is
    faster than. Swept across every frame rate the game allows and every
    way the hand can move: the worst return was **8.5 seconds** and is
    now **0.44**, and nothing takes over three. The blade itself is one piece — a
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
    two and a half seconds straight and the eye releases it, so the camera
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

## First person, and the guns

Two things that used to be one. **The view** is a switch inside either
world: the **3RD / 1ST** button beside the pause button (or *the view* on
the pause screen) moves the eye into the helm mid-run, without a reload —
the pilgrim's body is hidden, the whole of the right thumb becomes the
look, and the buttons come up the way a phone shooter lays them. **The
weapon** is the loadout's, as it always was — and the loadout now holds
six guns beside the blades. **The eye is in the helm**, 1.74m up, inside
the pilgrim's own head (his head runs 1.56 to 2.08 above the soil): it
used to sit at 1.42, which is his belt, and the view read exactly like
that.

**And a gun over the shoulder is a gun, not a blade that goes bang.**
There is a **BRACE**: the aim button pulls the camera in past the
pilgrim's right shoulder, eases the angle down toward the horizontal,
slows the turn and closes the cone the same way the sights do behind the
eyes — fifteen rounds in twenty on a hollow at ten metres from the hip,
nineteen braced. There is a **mark on the screen**, and it is where the
ROUND lands rather than where the camera points, because the two are not
the same thing in third person: the round leaves the hands, a metre and a
half ahead of the body and off to one side, and goes to the eye's mark or
straight along the facing. It rests at working range when there is
nothing to hit and snaps onto whatever the line meets. The rifle has a
**muzzle flash** on it at last. And the **recoil is carried by the man**:
the shoulder driven round and back, the head going with it, the knees
taking the rest, riding the shot and settling rather than snapping.

**And the weapon comes up when you fire it.** Running with a gun, it is
carried low and canted across the body — but you can pull the trigger at
a dead run, and the rifle used to stay slung there while the rounds went
down the crosshair: measured, the barrel pointed **thirty-two degrees**
off the line, up and to the right, which is exactly what *it looks like
it's firing sideways* means. The carry is sold by the cant and the drop
now rather than by turning the weapon away (a roll about the barrel
changes the whole posture and costs no aim at all), and the trigger
breaks it: the gun comes up to the ready in about three tenths of a
second and the barrel sits back on the crosshair.

**Every gun's cone is capped.** Held down, an M4's hip cone used to open
from two degrees to fifteen — a two-and-a-half metre circle at ten metres
— and go on opening. It tops out at about four now, which is the
difference between a weapon that punishes a long burst and one that stops
being a weapon. So a **gun is carried in third person** too,
over the shoulder at the chest, the eye's mark doing the aiming and the
tap the firing (a held thumb runs the automatics); and a **greatsword is
swung from behind the eyes** in first, its arc drawn across the screen by
the same clock the real swing runs on — the bow and the wand too, the
shaft leaving along the eye's pitch. Either view, either kind.

**And a blade behind the eyes is carried at Minecraft's proportion.** It
was the pilgrim's own weapon at its own size hung half a metre off the
lens, which is not a weapon you are carrying, it is a wall: measured, the
greatsword covered 0.77 of the screen's width and **2.13 of its height**,
the ultra 1.17 by 3.12, with a third of the blade off the top of the
picture and the grip running out of the bottom corner. Each weapon now
has its own scale and its own carry — the whole thing inside the lower
right, pointing up and across, about half the screen's height and no
more, every part of it visible: point, guard and pommel. That is what
makes it read as a held object rather than as scenery. The swing's
*travel* is scaled down with it (a small weapon thrown the distance the
big one used to travel looks like it has come off in your hand) while the
rotations are left alone, because a rotation reads the same at any size
and it is the rotation that tells you the cut landed. Anything on the
weapon that burns is turned down in the copy as well — the wand's orb is
a handsome additive ball at arm's length and a hole burned in the middle
of the picture at half a metre.
The world, the host, the marrow, the hours, the weather, the motes
and the hexes of the path are exactly what they were; the roll, the
stagger, the knockdown and the fall over the rim all still run
underneath, and the camera rides them (the roll dips, a knockdown lays
it over). Death is watched from outside, as it always was: the body comes
back into view and the follow camera takes the fall. The choice is
remembered by the browser, and `?pov=1` on the URL asks for it.

**The buttons are laid out the way a phone shooter lays them.** A
**trigger under each thumb** — one on the left above the stick, one
large on the bottom right — so the left can fire while the right goes on
aiming, or the other way round. **The right trigger is a stick as well:**
pressed, it fires; dragged, it turns the eye, the button riding under the
thumb the way the left stick's nub rides and going home when it is let
go — so one thumb can walk and the other can hip-fire and track at once.
To the right-hand trigger's left and
above it: **aim** (a tap toggles the sights, a long hold releases them on
the way up), **reload**, and **dodge** (the roll, by button: a flick would
be a look now). The **weapon bar** at the bottom centre carries the gun's
name, its calibre and its magazine over its reserve; tap it to swap. It
**sizes itself to what it is carrying** — "golden eagle" is two and a half
times the width of "m4a1" — so the name is never pushed off the panel and
a short one never leaves a gulf before the count. A **zoom** button
appears only when the sniper is in its scope. The pause button and the
hearts are where they were; there is no lock-on and no finishing mark.

**Six guns, by calibre** — because the calibre is what a round does.
Reserves are kept **by calibre**, so the eagle and the rifle draw on one
pool of .50, and a dropped box is a box of one calibre. Every shot but
the rocket is a **ray**, not a projectile: it leaves the eye through the
crosshair, opened by the current spread, and is tested first against
every live horror's **skull, trunk, hips and limbs** — a sphere each,
taken off the rig's own bones; the skull and the limbs win over the trunk
they stand in front of — and then walked out through the world to
whatever it would have met on the way: the soil, the cathedral's stone, a
trunk, a gravestone, a pew, the bell (three rounds call the Bell-Called,
the same as three blows). The nearest thing takes the round.

| | calibre | magazine · start | damage (body / head) | rate | the feel |
|---|---|---|---|---|---|
| **golden eagle** | .50 cal | 7 · 40 | 34 / 68 | one a third of a second | a hand cannon in gold. A hollow in three, a brute in five; **a head under it comes off**. It climbs hard, and the sights hold half of it down. The gold is a RANGE and not a colour — cream along the rib and the top edges where a light overhead finds them, a mid body, cuts nearly brown — because a flat yellow is what a toy is made of. Its slide is long and its frame short and stepped down off it, so the outline is an L rather than an equals sign, and the grip is dark, which is what stops the gold halfway down |
| **UMP45** | 9mm | 25 · 100 | 12 / 22 | eleven a second, held | the spray, **suppressed**: a can on the barrel, a thick short thump instead of a crack, hardly any flash. Each one a scratch; it walks up a little and settles fast. Built off the real one — a flat-topped polymer receiver with a rail the whole length of it, a stubby barrel under a short front rail, the magazine raked forward out of a slanted well, and the **skeleton side-folder** at the back: an open rectangle of a stock, which is the one silhouette nobody mistakes for another gun. It is the one weapon that carries **two sets of its own sights** — the
drum below, or a **ring sight**: no hood to look through, only a shallow
notch at the back and a small ring standing at the muzzle end with an
**amber bead dead centre of it**, which is what you lay on the mark, and
the field left open above it. The ring sits down on the channel's own
edges on a stub of a post, not up on a tower. Its top is a **channel** — a raised wall down each edge with a lit top face, and a sunken groove between them running away to the sights, so the eye is led down it — and the gun itself is dark, with light only on those two edges. Its irons are an **HK drum**, and they are **round** and SMALL: a rear peep bored through a drum at the back of the channel, a hooded post half a metre in front, and the front ring nests inside the rear aperture rather than filling it |
| **M4A1** | 5.56mm | 30 · 120 | 16 / 35 | eleven a second, held | the rifle: six to a hollow, two in the skull, **which a 5.56 takes off**. Steadier than the spray and it hits harder; the middle of everything. Built as a RIFLE rather than a compact: a twenty-seven centimetre quad rail with its rungs running the length of it, a barrel carrying well past that to a gas block and front sight, a flat-topped receiver with one rail unbroken from the stock to the muzzle, and a collapsing stock on a ribbed buffer tube. Its irons are a **ghost ring** — a fat hoop on the back of the rail with the post half a metre in front of it, which is what an aperture is for |
| **SPAS-12** | 12 gauge | 8 · 32 | 9 / 14 a pellet, eight pellets | one, then the pump | a wall at arm's length, nothing at thirty metres: the pellets fall off with distance. **A limb under it up close comes off.** The fore-end works after every shell |
| **bone sniper** | .50 cal | 5 · (the .50 pool) | 96 / 220 | one, then the bolt | one shot, one body; **a head under it is gone**. It is the one gun the field answers: the crack, and then the field coming back — a couple of returns off the stone you can still pick out, and then more of them, closer and closer together until they run into one another and the rest is a wash coming down, each darker than the last, with a roll going away under all of it. Four spaced returns is a canyon; a field answers with density. Its sights are a **scope** with two magnifications (4×, 8×) on the zoom button. From the hip it is a stick that goes off |
| **RPG-4** | rockets | 1 · 4 | 150 at the centre, falling off to four metres | one, then a long reload | **it flies** — a rocket at twenty-six metres a second with a smoke trail, and bursts on the first thing it meets. The burst is a white flash gone before you can look at it, a fireball that swells and climbs as it burns out, and smoke that outlives both and is still standing when you look back — with two rings going out, one fast and bright and one slow and wide with dust, and the whole field lit for an instant the way lightning lights it. Whatever stands within four metres comes apart: a small horror killed by it is not left as a body, it is thrown into its bones on the spot; the survivors go down in a heap. Stand in it yourself and it takes you off your feet |

**What a round leaves.** A body flinches and bleeds (or chips, if it is
bone) where it was hit, and keeps a **wound** — a small mark attached to
the bone the round went into, riding the horror through every pose and
its fall (six a body, forty in the field). The world keeps the mark too:
a real raycast against the meshes around the hit says exactly where and
on which face, and a **bullet hole** is punched onto that surface —
a wall, a trunk, a gravestone, a pew, the bell, the cathedral's bake,
whatever texture it wears; eighty holes in one buffer and one draw,
recycled oldest-first. The soil takes a scar in the paint; stone throws
sparks; wood knocks.

**Heads and limbs.** A headshot multiplies the damage by the gun's own
factor, and under a **strong enough calibre — .50 and 5.56 — the head
comes off**: the game's own dismemberment, the skull thrown along the
line of the round and the body falling headless after it. A round in an
**arm or a leg** may take the limb (a strong calibre, or the shotgun
within six metres), and the horror fights on without it. Rockets take
the whole body.

**From the hip there is a cone; on the sights there is none.** The
crosshair is the hip's and it is honest: its gap *is* the cone the next
round can leave through — each gun's own at rest, wider walking, wider
still at a sprint, blooming with every shot and closing back. It is drawn
in the SCREEN'S own measure and not in fixed pixels: the gap is that cone
projected through the screen's height, so it holds the same share of the
picture on a phone as on a monitor (measured: 3.3% of the height at
844x390, 3.3% at 760x428, 2.7% at 1600x900, the drift being each gun's
small pixel floor at the closed end). The weapon may be scaled and carried
where it likes; the crosshair does not follow it anywhere. Bring the
sights up and the crosshair goes, the cone goes with it, and the round
goes **exactly where the sight is** — whatever the gun is doing on the
screen. Every gun has its own **sway** (a slow breath at the hip, the
walk's bob, a lag behind the look) and its own **recoil**: the muzzle
climbs on the viewmodel and jumps back, and the *eye* climbs with it, a
little to one side, so the sight is somewhere else for the next round; a
share of the climb settles back on its own, the rest you pull down. The
sway and the bob are held off entirely while the sights are up, which is
what keeps them true. **A blade behind the eyes swings for real.** The weapon used to turn about
its own long axis — the one rotation that moves a stick nowhere — so all
you saw of a cut was the ribbon it left, with the sword standing still
underneath it. Every swing is an arc now, about an axis worked out from
where the blade actually points, on the same clock the body's own pose
runs on: the slash comes off the right shoulder and lands across the
picture, the backhand goes back the other way, the overhead rises out of
frame and falls through the middle, and the thrust drives forward. The
whole weapon is in the picture at the moment it lands.
And **the aim button is the LOCK** when a blade is in the hands, since a
blade has nothing to aim. Switch it on and the eye takes the nearest
horror it can reach and leans onto it, taking the next when that one
falls — enough to keep a circling thing in the picture without dragging
for it, and never enough to fight your own thumb, which always wins. The
heavy moves to the left trigger: hold it to wind, let go to loose it.

The **muzzle flash** is at the muzzle and **the gun is allowed to hide
it**. It used to be drawn through the weapon, which aimed put a lit orb on
top of the receiver in the middle of the sight picture, and two separate
shrinkings were bolted on to keep that orb small. Both are gone: it is one
true size now, the barrel cuts into it, and down the sights what you get
is a corona around the barrel's end — because the tube between your eye
and its own muzzle is genuinely in the way, which is what aiming a rifle
looks like. The hip is unchanged. A suppressed weapon shows almost
nothing, and the launcher's flash is the backblast, behind you. Aiming narrows the field of view, slows the look
with it, and **caps you to a walk**: you keep the sights while you move,
and the only way to sprint is to bring them down. (It used to be the
other way about — a sprint dropped the sights — and since a thumbstick's
own deflection is what decides a sprint, that meant you could not aim and
move at all.) A **telling shot** (one in twelve) does half again;
the reaper's mark doubles every round on anything but the Warden; and an
imbued element rides the rounds — fire bites and can take, frost holds
them where they stand, lightning adds to the damage — exactly as an arrow
carries them.

**Cover is the real height of the thing you are behind.** A round is
stopped by a wall, a tree, a column, a headstone or a bell only up to that
object's own crown, and passes over it above that. This is what lets you
take the head of a hollow standing behind a ruined wall — and what stops
you shooting through a colonnade pillar, which reaches eleven metres.
Every low thing in the world is low to a bullet as well as to the eye: a
slab grave is eighteen centimetres and blocks nothing above them, a
toppled causeway stone sixty-five, a headstone just over a metre.

**Attachments.** Where the blade has its charged attack, the pause
screen's third row is what sits on the gun's **rail** — one per gun,
remembered by the browser, in either view. **Iron sights**: each gun's
own, and drawn as such — the eagle a blade up front with a white dot on
its face and a notch at the back with a dot either side; the UMP a post
under a hood in a square aperture; the M4 its carry handle's aperture; the
SPAS a post and a notch on the rib; the RPG a folding ladder.

**The whole ADS pose is computed off the sight itself**, both ways: its
height puts the sight line at the screen's exact centre, so the top of
the blade *is* the point of aim, and its depth puts your eye a fixed
distance — a cheek's width, 20cm — behind the rearmost part of whatever
is on the rail. Every gun and every optic therefore presents the same
sight picture. The distances used to be typed in per gun and had all
drifted long: eye to rear sight, the pistol sat at 34cm, the rifle at 40
and the shotgun at 47, which is not a cheek weld, it is a man holding a
rifle out at arm's length and squinting down it.

**How big it all is was matched against the real thing, not guessed.**
Measured off a shooter's ADS frame, the weapon covers about 0.37 of the
screen's width and 0.58 of its height; off a hip frame, about 0.5 by
0.44. Ours read 0.21 by 0.53 aimed and 0.26 by 0.40 at the hip — a toy in
both. They now measure 0.30–0.39 by 0.51–0.62 aimed and 0.41–0.51 by
0.39–0.46 at the hip. Half of that is the eye coming up to the sight and
half is the weapon being **scaled** rather than dragged nearer: these
models are slimmer than a shooter's (a real handguard is a fist thick and
ours is a box), and hauling one closer buys size at the cost of savage
foreshortening — the receiver enormous, the muzzle tiny.

**At the hip the carry is the offset and the ROLL, not the yaw.** The
guns used to sit nearly parallel to the line of sight, which shows you a
rifle end-on — a thin dark sliver in the corner. The first fix swung the
muzzle inward fifteen degrees, and that is wrong in a way you can
measure: project the barrel's own axis through the camera and its
vanishing point sat eleven per cent of the screen's width to the LEFT of
the crosshair. The gun was pointing somewhere the rounds do not go. A
shooter's hip carry is a weapon offset right, rolled over, and pointed
very nearly straight forward; the diagonal you see is perspective — the
stock near and far right, the muzzle converging on the centre. The barrel
now vanishes within two per cent of the crosshair.

**What an aimed weapon's outline is made of** — worked out against a
reference frame, on the UMP, and true of all of them. Three things, and
only one is the sight:

1. **The receiver's top running away from the eye.** A trapezoid, wide at
   the bottom edge of the screen and narrowing to the sight at its far
   end. How much of it you see is set by how far the eye rides ABOVE that
   top face, which is the REAR SIGHT'S HEIGHT. At 25mm the band was a
   sliver and the gun read as a wall; the drum puts the eye 57mm up and
   the trapezoid runs off the bottom of the frame the way the reference's
   does.
2. **Receiver BETWEEN your eye and the rear sight.** No gap, no
   trapezoid — and the sight can only come as far forward as the near
   plane allows, since past that the receiver itself starts being
   squashed and the gun comes apart at the seam.
3. **Somewhere for the eye to stop.** A box receiver seen end-on presents
   its square rear face, and the nearer that face is the more of the
   screen it owns as pure dark mass. The receiver ends at the notch now
   and the tail — narrower, lower, sloping, and in the squashed half
   anyway — carries on behind it.

And the values: three steps up the gun (body, top face, rail) with light
ticks on the rail's teeth, all of it a value above black. A black gun
under a noon sun renders as a silhouette with nothing in it.

**And a weapon that close would be cut in half by the near plane** — its
own stock ends up behind your eye, and you find yourself aiming at a flat
grey lid where the receiver should be. Every shooter answers this with a
separate, narrower field of view for the weapon, which is the same thing
as flattening it along the barrel; so the parts that would reach behind
your eye are squashed in depth as the sights come up, by exactly as much
as their own geometry needs and no more.

**Which parts those are is the whole of the aimed silhouette.** The first
pass cut the gun at its rear sight and squashed everything behind — and a
receiver straddles its own rear sight, so the receiver went in the
squashed half and arrived at your eye as a featureless wall three tenths
of its true length. That is what "the aimed silhouette needs work" was.
The line is the near plane itself now, not the sight: nearly every part
keeps its true depth, and what recedes from the eye — the top of the
receiver, the rail, the handguard, the barrel — is there to be read.
Looking straight down the barrel a depth squash is invisible. Being cut
in half is not. **Ring sight** (the UMP's alone): the same weapon's other irons, offered
only by a gun that has a second set built — a small circle at the muzzle
end with an **amber bead at its centre**, and a notch low behind it,
nothing closing over the picture. You put the bead on the mark instead of
looking through anything, which is what you want at ten metres in a hurry
and what the drum costs you. The bead is amber and not the pale metal the
other sights use for a reason: at this render's size it is about three
pixels across, too few to carry an outline, so it has to separate from a
bright sky by hue and from dark soil by value at once. The whole sight also sits LOW — the ring almost touching the channel's
lit edges on a stub of a post rather than standing on a stalk — and it
cannot go much lower than that: on the sights the ring IS the centre of
the screen, so lower only means the gun rising toward it, and past a
millimetre or two the deck begins to eat the bottom of the hoop.
**Red dot**: a **holographic** one — a single thin
rectangular hood on the rail, wider than it is tall, with **no glass in
it at all** and a red dot hanging in the middle of it. It had a pane
once, a quarter opaque, then a sixth, then a twentieth, and at every one
of those the answer to *can you see through it* was still no: a pane over
the exact spot you are shooting at is a pane you look **at**. Then it had
two hoops with rails between them and read as a *cube* on the rail. One
window, nothing in it, and a dot — no ring. It is **1.15
times**, which is to say barely a magnification at all: the picture you
were looking at is the picture you aim with, the rifle stays in your
hands, and the eye is on the mark a shade faster. **ACOG**: a short
scope on the rail at **two and a half times** — a working magnification, not a
sniper's — and it is a **scope you can see**, not a hole cut in the
screen. The optic is modelled: a bell, a body, two rings clamping it to
its mount, an elevation turret on top and a windage turret on the side,
and you look **down the tube** at the world through it, with the gun
still under you and the field still round the edges of the frame. A red
donut sits on the mark with a post under it and a pair of stadia ticks
either side, and you look down **one bore** — a scope whose body steps in
width shows you the edge of every step, and reads as two rings inside one
another rather than as a tube. It used to go to black glass with the weapon taken away —
which is what a sniper's scope does, and the ACOG is not one. The sniper's own scope is its iron option (four and eight
times, the zoom button); give it a dot or an ACOG and it becomes a rifle
you can fight close with.

**The lens and the turn are yours.** Two sliders sit under *the view* on
the pause screen and the browser remembers both.
**Field of view** runs from 60 to 100 degrees, 68 by default, and the
picture behind the pause screen redraws as you drag it so you judge the
number on the field rather than on the number.
**Turn speed** runs from 0.40 to 2.20 and multiplies every drag, in both
views and on the keys.
The thing that makes the field of view safe to change is that **a sight is
stored as a magnification, not as an angle**. Every aimed field in the
game — each gun's own irons, the red dot's 1.15x, the ACOG's 2x, the
sniper's 4x and 8x — was tuned against the 68-degree lens, so each is read
back as the power it stood for and re-derived through whatever lens you
have chosen. Set the field to a hundred and the red dot is still 1.15
times, not a scope. The first-person turn additionally narrows with
`camera.fov / your field`, which is what keeps the rate under your thumb
the same while the sights are up.

**The hit marker.** Four ticks flash on the crosshair when a round lands
— white for a body, gold for the head, red and longer for a kill — and
the phone buzzes. A miss shows nothing, and that holds for the rocket
too: a burst that catches nobody says nothing at all, one that wounds
shows white, and only a kill is red. Each carries its own **tick**:
forty milliseconds, dry, and pitched high enough to sit in a band the
gun is not using, so it cuts through at a third of the gun's level
rather than shouting over it. It has been wrong in both directions —
two soft blips the .50's report walked straight over, then a clack loud
enough to beat the gun, which made a magazine sound like a woodpecker.
A head is the same tick pitched up with a thin ring over it; a kill is
the tick and then a lower second one a beat behind — the falling pair
that says *that one is down*. The marker sounds in either view, wherever
a gun is in your hands.

**Reloading.** The magazine runs down on the weapon bar; at zero the gun
clicks and reloads on its own if there is a reserve to reload from
(the sniper waits to be asked). The reload is the viewmodel: the gun
drops and rolls, the magazine falls out of the grip and is driven home,
the action is racked, and the rounds move from reserve to magazine only
when it is all done.
**And it sounds like a mechanism.** Each of the three moments used to be
one soft blip, and a rounded attack is exactly what makes a sound read
as plastic. Each is a small SEQUENCE now: a catch releases, a part
travels along its rail, a part arrives and stops dead — and the arrival
is always the loudest thing in the stage, because that is what tells you
the magazine is home rather than merely near. Every impact in it is
three layers inside forty milliseconds — the strike itself with no
attack at all, the low knock of whatever was hit, and the high ring left
in the part afterwards, held five times longer and very quiet. The
bolt-action is four such motions and you hear all four: the handle up,
the bolt back over the spent case, forward over a live round, and down
into its lug. A swap
mid-reload abandons it. The sniper's bolt is worked after every shot,
the handle lifting and the bolt coming back and going home, and the next
round waits on it.

**The brass comes out.** Every round but the rocket throws its case out
of the ejection port — the gun's own right and a little up, tumbling,
under gravity, bouncing once off the soil and lying still — and each one
**ticks** as it lands — and then ticks again, twice or three times more,
quieter and closer each time, because a case does not land once: it hits,
turns over, hits again and settles, and that little irregular run is what
brass actually sounds like. One tick on its own is a pebble. Each contact
is dense, high and inharmonic and gone inside twenty-five milliseconds, and
there is no low thud under it, because a cartridge is twenty grams of thin
brass and has no mass to hear. The settling run is only spent when a case
has the air to itself — hold the trigger down and each one gets a single
tick, or a magazine is gravel. Fourteen are in the air at a time
and a case lies where it fell for five seconds. The port is a point on
each weapon's model, so the brass leaves the rifle at the rifle's port
whether the eye is in the helm or behind the shoulder. One sound per
case, on its first touch, throttled: a dozen cases a second each ringing
twice is gravel, not brass.

**Ammunition is dropped.** The horrors have to feed the guns, so in
first person about half of them leave a **box of rounds** where they
fall — a brass cartridge on an olive box, inside a tan glow, the same
kind of drop as the motes and sharing their patch of ground (six may lie
out at once rather than four). A box is **one calibre** — the one in
your hands half the time, otherwise any — and walking into it adds that
calibre's own measure (40 of 9mm, 30 of 5.56, 10 of .50, 8 shells, one
rocket), doubled when it is the calibre you are holding. The field's
death and return refills the magazines and tops every reserve back up to
what he set out with; on the path, as ever, death is the end.

**The field shows itself to a gun.** A host that lies under the soil
until you are ten metres off gives a rifle nothing to look at, so in
first person about half of it climbs out early — from thirty-odd metres
— and **paces its ground** the way the path's patrols do, coming only
when you are close, or when it is shot. The ambushes stay down; that is
what they are for. So the sniper has patrols to watch through the glass,
and a shot that does not kill still brings the thing.

**The models.** Every weapon is built out of chamfered eight-sided
prisms rather than boxes — one mesh and one draw each, sixteen more
triangles, and a silhouette that stops reading as a brick — and every
one of them is covered in the small hard furniture a real weapon has:
an ejection port and its cover, a selector on both sides of the
HK, a magazine catch, a bolt catch, a forward assist and a brass
deflector on the carbine, the delta ring and the detent ridges the
stock clicks along, a trigger in a guard that is a true loop, finger
grooves in the grips, witness ribs down the magazines, slots in the
flash hider, hoops of heat shield over the shotgun's barrel, sling
swivels, the chequer on the rifle's wrist and fore-end, the turrets on
its scope and the ball on its bolt handle. None of it is decoration —
each piece is something a hand uses. The cost is about forty draw calls
while a gun is held, and none of it while one is not.

**And a body far enough off is three boxes.** A hollow is forty-one small
meshes whether it fills the screen or covers nine pixels, and on a field of
two dozen horrors nearly all of that was being paid for shapes too distant
to read as more than a silhouette — so past a certain point on the screen a
body is swapped for a trunk, a head and a pair of legs in its own colour.
What decides it is **how big the thing looks, not how far away it is**, and
that distinction is the whole of it: through a scope at eight times, a
horror at seventy metres is as large in the frame as one at nine, and it
keeps every mesh it has. Put the rifle down and it goes back to boxes.
Nothing you are fighting, locked on to, standing near, or that is on fire
is ever swapped.

**Under the hood.** The viewmodel is a set of low-poly guns hung off the
camera itself (the camera is in the scene for it) and drawn in the PSX
frame with everything else, so they wobble and dither like the world;
they bob with the stride, sway against the look, kick on fire, drop for
a reload, and swing low at a sprint. The muzzle flash is a sprite and a
flare of the pilgrim's own halo — never a light. Guns, the eye's height
and every timing live in `GUNS` and `FPS`, beside the camera code.

## Marrow

**Marrow is shed, not scored.** A horror's marrow does not appear on the
counter the instant it dies. It comes OUT of the body — a dozen pale
motes thrown up and out — and each one is then one of three things.
Near the pilgrim (seven metres) it streams to him, gathering speed, and
is taken at the chest. Further off it falls and lies where it landed, a
small light in the grass, until he comes within a few strides — then it
is drawn to him and flies. Kill something in the water and you wade out
for what it was worth. Every mode pays this way: the cathedral's gate
and the path's six thousand count what is CAUGHT. One draw call for all
of it.

Some of the host burns hotter: **red-boned** hollows, throwers and
brutes, one in seven or so, with a bit over twice the life and worth
double
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
  - **and the steel wears none of it.** Snow settles on the pilgrim, blood
    darkens him as his life runs down and poison melts him green, and the
    weapon in his hands takes none of the three. A gun's materials are not
    its own — the same ones are in his hands, down the sights and in the
    pause portrait at once — so a rifle that reddened with his wounds
    reddened everywhere, and stayed that way.
  - **stone takes no print.** The cathedral's flags, its stair and the
    apron around it are cut geometry standing on the soil — nothing
    presses into a flagstone, so no boot dish, no ploughed furrow, no
    paint and no sheet of snow thrown off a roll. It is the same reach at
    which your footfalls start to ring on stone, so what you hear and what
    you leave can never disagree about what is underfoot, and it holds
    wherever a cathedral stands: the field's, and every one the path
    builds.
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
  Carrowdene, Blackwold, Sallow Cross or Marrowgate), and a **fallen
  bell** — three landmarks, each beside a road in its own wedge. The
  sign breaks like a pew: two blows and the board is knocked off whole
  to tumble away while the post snaps in two.

  **The bell is the only thing in the field that answers back.** A great
  bronze bell lying on its side in the wet grass where it came down, sunk
  a third of the way into the soil, with a crack running the height of it,
  the rotted oak headstock still bolted to the crown, the iron yoke
  snapped in two beside it, a broken length of the wheel's rim in the
  grass and the clapper loose in the mouth. The tower it hung in is not
  in this world and never was.

  Strike it and it **tolls** — not a bell rung but a bell struck where it
  lies, the whole mass of it let go at once, and each of the three blows
  is deeper and longer than the last. Nothing you swing changes that
  count: the ultra greatsword, which ends a gravestone in one hit, still
  only gets a toll out of the bell. On the third, the ground under it
  splits.
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
  a **lone** brute out where it has room to swing, an **overseer** (a
  brute with a bone-thrower on the high ground behind it), an **ambush**
  lying low till you are close, a **nest** of two casters, a **pair**, a
  **crow** on a roost (three at most). The south wedge gets a light
  budget and only the small templates. **Every wedge but the south
  draws a brute-bearing template FIRST**, two times in three, before the
  weighted draw begins: a brute costs most of a wedge's purse, so any
  cheaper template drawn ahead of one locked the big skeletons out of
  that wedge for good — the field used to average half a brute a run,
  and now averages three, with the bone-throwers and the crows still in
  the mix behind them. The purse was widened to pay for it, because a
  brute returns less marrow for its price than a pair of hollows does
  and the cathedral's gate is a hard number. The same
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

The wall is a **cliff** now — and you have to actually walk off it. The
first pass did not: it killed you for coming *within* a metre and a bit of
the edge, while the old wall was still holding you nine tenths of a metre
inside that, so you died standing on flat grass with solid ground under
both boots, having never left it. That is a circle drawn near a cliff, not
a cliff.

The game asks the ground now. `heightAt` answers everywhere with the soil
the field *would* have and does not know the world ends; the ground **mesh**
does, and the surface it draws is read the same way the card reads it. You
can stand on the very lip. You can walk the rim. It is only when the ground
has dropped further beneath your boots than a step down — which happens
about a fifth of a metre past the last of it, out on the slope into
nothing — that you go over. A metre further out than the old line, and on
the right side of it.

And you go over **on your feet**. For four tenths of a second he is still
himself: the stride that took him out carries on, the trunk pitches back as
the hips drop out from under it, both arms come up and open, the leading
leg still out over nothing. Only when he is two and a half metres below the
lip and plainly past saving does he go limp — the same ragdoll every other
death uses, thrown outward and then let off the world entirely, with no
ground under any part of it and no wall to catch it. It turns over once and
keeps going down into the dark the field sits on. Dying *on* the edge and
dying *off* it look nothing alike, and the difference is those four tenths
of a second.

**And so do the horrors** — but only when they are not standing on their own
feet. One walking the rim of its own accord is held back the way it always
was; one that is flung, floored, or still carrying the speed of a blow goes
straight over the edge and dies on the way down. A greatsword by the rim is
a different weapon, and the ultra greatsword by the rim is an execution.

The Warden's nave and the path are **not** cliffs: the arena is the arena,
and the path's sides are shorn at a width that changes down every tile —
an instant death on a boundary you cannot read while running is a different
game.

**And you can see it coming, which you could not at first.** The camera
sits *behind* the pilgrim, so walking toward the rim put it outside the
hexagon — out where the ground has already fallen away. It was being
placed half a metre above a surface that is not there, with the drop-off
standing between it and everything else: a flat green wall a hand's breadth
from the lens, the whole field still drawn behind it and none of it
visible. You could not see the cliff you were about to walk off, which is
the one thing you needed to see. The camera is held inside the hexagon now,
far enough in that it is always over ground that exists; at the rim it
comes in close over the shoulder, the way a camera does against a wall.
The **spawn moved too** — it stood seven and a half metres from the lip,
three seconds of walking backwards out of the opening shot. Thirteen and a
half now. And the eye follows the hips down as she goes over, so you see
what you walked off instead of a pair of boots leaving the frame.

**And the hexagon was only half of it.** The camera rides behind her, so
standing a stride outside a cathedral's wall puts it INSIDE that wall — a
metre of solid ashlar between the lens and everything else, which is the
same blank screen the rim used to give. It reaches both ways: inside the
nave against the north wall, the camera is out in the graveyard looking at
the back of the stone. Nothing guarded it anywhere except the Warden's
fight, which clamps the camera into the nave — so it bit on the **path**,
where every tile can carry a cathedral, and on the field once the Warden
was dead and the nave was just a room again.

There are no special cases and no phases in the fix: walk the line from
her head out to where the camera wants to be, and stop at the first stone.
Coming out of the door, through the door, along a wall, up the stair — all
the same question, asked of the same predicate. Measured by standing the
pilgrim at every legal spot on a grid round a cathedral and letting the
camera settle from eight headings: **42 of 648 placements on the field
parked the camera inside the stone, and 52 of 648 on the path. Both are
zero now.** The path camera is also held inside the tiles that have
actually been built, so it can never hang out over a stretch of the
corridor that has been torn down behind her.

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
straight through — and its host waits INSIDE the walls, a third of it
brutes now. The path's tiles lead with a brute-bearing template the same
way the field's wedges do. Six thousand
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

**And what she is wearing falls with her.** Every armour in the game carries
simulated cloth — the knight's and the sheet knight's split tabard is three
hanging panels, the thief's mantle is a whole cloth cape, the first knight's
is a chain of hinges — and all of it is stepped from the same place the
walk cycle and the arm IK are stepped from. Which is only ever reached while
the pilgrim is *alive*. So the moment she went down, every stitch on her
stopped at the shape it had on the last living frame and rode the ragdoll
like a sheet of tin: the thief's cape stood straight up out of the ground
behind the body, and the tabard's panels stuck out at the hip as two flat
boards. Four armours, four deaths, frozen to the fourth decimal.
The cloth is its own pass now, and the dead frame steps it — so the tabard
drapes over the hip the body came to rest on, the cape falls over the back
and settles on the grass, and the poison melt takes the cloth down into the
pool with everything else. The cape also stops *streaming*: it was holding
whatever speed the run had at the moment of death, so a pilgrim killed at a
sprint kept a cape flying out behind her forever.

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

## The house — defender

The title's third way. `?mode=defend` loads it; like the path, a mode is
a page.

**The Mire.** The one hexagon again, but the cathedral is gone — footing
and all — and a long timber house stands on the soil at the NORTH end of
the field: posts, plank walls between them, a pitched roof in four bays,
a door in each gable, a chimney. It is at your back. South of it a dry
rise runs out into the YARD, the fighting ground, and past the yard the
churchyard has drowned: black water to the rim of the world, dead trees
standing in it, a few graves leaning on the rise. **Three causeways fan
from the yard south to the rim**, a lantern at the head of each and one
either side of the door, and everything that comes for the house comes
up out of that water and along those lanes — six in ten on a lane, the
rest wading between. Nothing comes from behind. It is never day here
(dusk or night) and never snow (clear, rain or a storm), and the haze
closes to fifty metres whatever the weather. **Standing in the water
slows everything** — the pilgrim to six tenths, the Drowned to eight —
and the pilgrim leaves a wake in it.

**The Drowned.** A new horror. A hollow's frame with the flesh still on
it, grey-green and split, pale-eyed, unarmed — a hundred life (six
swings of the greatsword), slow, heavy in the hand, and barely rocked
by a blow. It **does not much care about you**: inside eight metres, or
for five seconds after anything hurts it, it comes for you like any
other; otherwise it picks a standing wall of the house — the nearest, a
breached one preferred — walks to a stride outside it and **bashes**,
both arms into the planks. A body walking at a wall
through a wood gets stuck on a trunk; one that has gone nowhere for a
second and a half takes a short detour sideways.

They come apart. Every one goes down in a sheet of blood; one killed by
a blow worth half its life bursts — the head and an arm off it in the
same instant, stumps spurting, the rest thrown. The blade takes their
legs as readily as their arms, and **a Drowned with a leg off crawls**:
prone, chest to the ground, dragging itself on its arms at half pace,
and still comes.

**Two more of the Drowned join from the second and fourth rounds.** The
RUNNER — thin, pale, quick, fifty-five life — never looks at the house:
it comes for you, wherever you are, and it is what stops you standing in
a doorway for ever. The HULK — half again the size, dark and
waterlogged, two hundred and sixty life, unshakeable — lands three blows
on a wall where a Drowned lands one, and hits like a brute.

**One lane is heavy.** Every round most of the column comes up one of
the three causeways, and the lantern at its head burns RED for the
round, so you know where to stand before the first of them is out of
the water. STAKES can be bought across any lane in the lull — a row of
sharpened timber leaning at the swamp — and whatever comes up that lane
meets it first; six blows and it is gone, and bought again.

**The house earns its keep.** Under the chimney a hearth burns, and
standing by it brings the hearts back, slowly — the one thing in the
Mire that gives anything back — for as long as it burns: the bay over it
falling puts it out, and so does the house. The window walls can be shot
THROUGH from indoors: a round through the open pane goes on, a round
into the planks stops. From the sixth round a Drowned that has got
inside stands under a bay and bashes the beams instead: seven blows and
the roof comes down on you.

**A boss is announced, not summoned.** Three and a half seconds before
it comes the water stirs where it will rise — rings on the surface, a
roll under the field, THE WATER STIRS across the screen — and then the
thing itself.

**The house is twelve walls.** Each is a `breakables` entry with eight
blows in it, in three stages: whole, breached (the middle planks knocked
out — a hole you see them through), gone (posts and air). A standing
wall is a collider and stops rounds at its own crown; a fallen one is
neither, and is a new way in. When both walls under a roof bay are gone
the bay comes down. The pilgrim's own blade and rounds never touch the
house. **When the last wall falls the mending is over**: the shop closes
for good, every bay drops, and it is survive-until-dead in the open —
which is not a loss, only the end coming.

**The rounds.** Endless, numbered. A round is a WAVE of the Drowned let
up out of the bog a few at a time (six plus three a round, in batches
that grow and quicken), with the field's own host mixed in from the
third round — hollows, throwers, from the fifth a brute — hunting the
pilgrim wherever he is; a share of the Drowned burns red, rising with
the round. Their life climbs eleven per cent a round and their bite a
half-heart every four. When the last of the wave is down a **boss closes
the round**: the Unburied, then the Fallen One, then the Bell-Called,
then the Gravewarden — each with its own introduction, the Warden come
out of its nave for the house — and fifth **the Carrion Mother**, a
bloated Drowned half again the size that never sieges, only hunts, and
**breeds** as she goes: a crawler every few seconds, six at a time, all
of them bursting when she dies. Then round again, every boss carrying
thirty per cent more life each cycle. A held round pays a bonus
(sixty, plus thirty a round) and opens a **lull** of forty-eight
seconds — the readout counts it down, and the prompt (E, or a tap)
calls the next round early.

**The lull is the shop.** SPEND, by the pause button, opens it (its own
pause; Esc closes it). Everything is bought with marrow:

| the house | mend the worst wall (80 + 12 a round) · mend the whole house (per hurt wall) |
| the pilgrim | eat, full heal (50) · a heart container (200, ×1.35 each) · might, +15% on everything you strike with — blade, round, shaft, bubble, bolt (160, ×1.4 each) |
| the armoury | every blade and gun in the game, 160–520 · a reserve of each calibre you own (70) |

The Mire arms you with the greatsword; the rest of the wardrobe is
bought, and the pause screen's weapon picker cycles only what you own.

Death ends the run where you fall, with the round reached, the Drowned
put down and the marrow unspent on the stone; **the best round held is
remembered** and shown under it.

The readout under the hearts carries the round, what is left to come
(or the boss's name), and the house's integrity as a percentage.

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

**And a swing that is about to become the next one ends early.** That was
the real thing, and blending across the join was not enough on its own.
Every pose is authored to end at the **carry** — so the last third of a
swing is the blade travelling all the way back to the shoulder and stopping
there. Waiting for that before starting the next cut means the blade
*reverses twice* between strikes: out of the strike, back to rest, out
again to the wind, and only then forward. No amount of smoothing over that
join can make two reversals read as one motion.

So once the next cut is asked for, the current one leaves **near the end of
the drag** — the blade still going out, still on its way through, with only
the dead beat at the very end of the return left unplayed — and the next
picks it up from there. The strikes themselves are not one frame faster:
the same arc, the same speed, the same damage, the same peak. It is the
**pause between them** that is gone.

**How near the end matters, and the first answer was wrong.** Cutting out
at seven tenths halved the wait, but it yanked each swing into the next one
*before the blade had finished travelling* — a sixth of the greatsword's arc
was simply never drawn. On the pad that reads exactly as it was described:
short in the range of motion, too fast, no weight. Swept and measured, tip
sweep across a held combo and the gap between strikes:

| leave at | greatsword sweep / gap | ultra sweep / gap |
|---|---|---|
| 0.70 | 3.52m / 0.40s — **the arc is cut** | 4.05m / 0.60s |
| 0.80 | 4.19m / 0.45s | 4.42m / 0.70s |
| **0.88** | **4.15m / 0.50s** | **4.36m / 0.80s** |
| 1.00 (the old full tail) | 4.12m / 0.60s | 4.36m / 0.95s |

At **0.88** the whole follow-through is on screen — the swept width is the
uncut swing's, to within a centimetre — and a sixth of the waiting is still
gone. The full arc, and the weight back.

There is still a blend across the join, but it is a **join and not a
blanket** now — five to twelve hundredths of a second, enough to take the
one-frame step out of the target and no more. The first attempt ran it for
a fifth of a second, which on the katana is longer than its entire wind: the
blade never reached the top of its load and the whole cut came out short.
That cost the katana **18% of the distance its tip travelled**. It is back.

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

**A cut pressed during a roll waits for the roll to finish.** It used to
come out at the *landing* — but the landing is only where the body first
touches, and the somersault runs from there on: the trunk turns its full
circle over the span from the landing to the end of the roll proper. So the
cut was arriving a little over halfway round the tumble and the rig snapped
upright out of a half-turned body, which is what looked like the hero
getting up the wrong way. It comes out of the **rise** now, at the moment
the turn completes, and carries it. (That also gave the thief his
quickstep-cut back: his profiles have no landing at all — he never leaves
the ground — so a banked attack used to simply evaporate when the dash ran
out, and had never once fired.)

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

## How the host fights

A horror used to know about exactly one thing: the pilgrim. It walked the
straight line from wherever it stood to wherever she was and swung when it
arrived, and that was the whole of it. Set six of them on her from an arc
fourteen metres out and the pack's angular spread was a hundred and
twenty-six degrees at the start and **a hundred and twenty-six degrees
eight seconds later** — every body held the radius it was born on. A group
that spawned in a clump arrived as a clump and queued up to hit you.
Neither was a decision.

**They come at you from somewhere now.** Each carries its own side, and
while it is still out in the open its approach is BANKED toward that side
— half of them curling left and half right — so a pack opens into a
crescent and closes on you from around rather than along. The bank washes
out over the last stride, so the arrival is still straight in and still
readable. And they no longer walk through one another: anything within a
couple of metres pushes off. Measured: the same six now spread from a
hundred and twenty-six degrees to **two hundred and five** while closing
from fourteen metres to three and a half.

**A thrower works for its shot.** It held its range and lobbed from one
bearing for ever, which makes a ranged thing a target you can forget
about. Its range and its movement are separate things now: it holds its
band and **works round you the whole time**, turning its circle after
every throw and whenever you close on it, so the line to it keeps breaking
and sooner or later you have to go and deal with it.

**And one of them dropping means something.** Whatever is asleep near the
body wakes; whatever is pacing its post comes; and whatever is already on
you and close enough is **startled** — a third of a second with its head
off you and round to where it happened, at half speed, and then it comes
on again from a fresh bearing. It is a beat and not a stun, deliberately:
a pack that freezes every time you kill something is a pack you take apart
one at a time for nothing. An ambush never wakes to it — lying still is
what an ambush is.

## What the host is worth killing

A hollow was four swings of the greatsword and a bone-thrower three, and
at four swings a hollow is a **door you open** rather than a thing you
fight — no room for it to answer, no reason to read what it is doing,
nothing lost by walking into its reach. A hollow is **five swings** now
and a thrower **four**; the ultra greatsword takes a hollow in three
arcs, the katana still opens one in two because cutting a thing in half
below its middle is what that blade is for, and the brute is left exactly
where it was, because the gap between a hollow and a brute was never the
complaint.

The rifles move with them: the eagle takes a hollow in three rounds and
the M4 in six. **The bone sniper still takes one in a single shot** — its
body damage and a hollow's life are the same number on purpose, because
that rifle's whole claim is one shot, one body. Raise one and the other
has to move with it.

A **red-boned** horror carries a bit over twice a plain one's life rather
than three times it, which leaves it almost exactly where it stood before
the host got tougher. Left at three, a red hollow would be sixteen swings
of the greatsword — not a harder fight, only the same fight held down for
twice as long.

## Life, in hearts

Life is **seven hearts**, drawn at boot like everything else in the game —
whole, half, and the empty socket left when it is gone — nearest-filtered
and blown up, with no bar and no gradient anywhere in it.

The shape was heraldic once: narrow lobes, a cleft driven four rows deep,
a long tail down to a point. At eighteen pixels in the corner of a phone
it did not read as a heart at all — it read as a **spade**, or a tooth: a
dark chunk with a notch cut in the top. A life counter has to be
recognised at a glance, out of the corner of the eye, while something is
swinging at you, so the shape is the **round one** now — wide lobes, a
shallow cleft, shoulders that carry the width all the way out before they
draw in to the point. **Fourteen across by thirteen down**, even, because
a half heart splits down a true centre line and an odd width has no half.

Its tones are painted rather than derived — a glint on the upper-left
lobe, a lit face, the body, the shadow, the underside, with the light
upper-left throughout — and **the empty socket is that same map read
backwards**. A hollow is concave, so what catches the light in one is the
far wall, which is exactly where a full heart is darkest; inverted, the
empty container reads as something *carved out* of the frame rather than
as a black heart-shaped hole, and its rim is dim iron rather than black so
you can still count your containers against a dark field. The row is only
rebuilt when the count of halves actually changes, so watching it costs
nothing.

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
screen** — the same pixel map, the same light, one tone brighter across
the board because that one is lit from inside its own glow, so what mends
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

**An imbued weapon takes the element as a SHADE, and that is all it
takes.** What the element does to what you hit is untouched — the burn,
the arc, the freeze, all of it is in the hit. On the weapon it is a
colour: the steel's own map tinted (hot orange, a pale gold, a cold
blue) with the blade's emissive lifting it, so what is in your hands is
readable at a glance in either view and from across the field.

There was a whole lighting rig here before, and it is worth recording why
it went. Every mesh of the weapon was copied twice, each copy a child of
the part it copied: one drawn additive over the steel, one puffed along
its own normals and turned inside out as a fringe standing off the
silhouette, with a chain of soft beads strung down the weapon's longest
axis and a coloured point light at the grip. In third person it was
handsome. **Behind the eyes it was a disaster.** The viewmodel hangs half
a metre off the lens, so a fringe, six beads and a light at that range
are not a glowing sword — they are a coloured fog over the whole screen,
and you cannot see what you are fighting. Hiding it in first person alone
would have left two different weapons in one game; a tint costs nothing,
reads better, and is the same object in both views. The motes still come
off the steel in third person, and are held back in first, where the
weapon's own frame sits on the lens and every one of them would burst
across the middle of the picture.

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

## Being introduced

**Every boss and mini-boss is introduced.** Not with a still frame and a
name over it — with the camera taken off the pilgrim's shoulder and walked
round the thing while it comes up out of whatever it was under. Two black
bars grow in from the top and bottom, the HUD goes, and the name comes up
on the last shot.

The rule that keeps this cheap is that a cutscene **animates nothing**.
Every one of these horrors already had an entrance — the Warden climbs out
of the flags, the Fallen One comes down sixteen metres on spread wings, the
Unburied claws up through the soil, the Bell-Called is three pieces coming
out of three holes — and every one of them used to play with the camera
stuck behind the pilgrim, looking at his back. The cutscene is
choreography over an entrance that already exists.

**The world keeps running under it**, which is the point: you are watching
a thing happen, not a piece of film. What is suspended is the *pilgrim* —
his input is dropped, he is held where he stands, he cannot be hit, and
the rot in him holds its breath. What is being introduced holds still and
holds its fire for the length of its own scene (the Warden was swinging a
greatsword through its own title card), but the rest of the host goes on
about its business behind the camera.

Every one is cut to the same grammar, which is the one every boss
introduction has used since the Nintendo 64:

1. **The place** — a slow low move across the ground it is about to come
   out of, before there is anything to look at.
2. **The rise** — the eye at its feet, *craning up its whole length* while
   it stands. This is the one shot that says how big a thing is, and every
   one of the four gets it.
3. **The roar** — close on the head, its own voice, and the lens rushing
   it. The move eases *in* rather than out: a slow creep that becomes a
   lunge, which is what a lunge at the camera is made of.
4. **The name** — pull back off the shout to a held frame. The picture
   darkens at the edges, the **epithet** fades up in small letters with a
   rule drawn under it, and then the **NAME** lands below it large, letter
   by letter, on a sting.

The music is part of the shape: an introduction plays over **silence**,
and the theme comes in under the name. The Warden's drums used to start
the instant you crossed the threshold; they wait for the card now.

A shot's bearing is measured from *the line the pilgrim is standing on*
rather than from the world, so a=0 always puts the eye between the two of
them and looks the horror in the face, whatever corner of the field the
seed dropped it in. (The first pass used world bearings and introduced the
Bell-Called by the back of its head.)

| | epithet | name |
|---|---|---|
| the boss | sworn keeper of the bone path | **GRAVEWARDEN** |
| | carrion seraph, its halo cracked | **THE FALLEN ONE** |
| | rot-swollen thing of the grave rows | **THE UNBURIED** |
| | buried in three pieces | **THE BELL-CALLED** |

The Gravewarden's last shot is taken from the flags looking up at the
horns, with the rose window behind its skull. It was an over-the-shoulder
at first, the pilgrim in the foreground for scale, and that does not work:
the fight starts the moment he steps through the door and the Warden is
thirty-six metres away at the far end, so the frame was an empty nave with
a speck in it. The Bell-Called takes an extra two beats, because it is
three things — the bell, a hand, the other hand, and then the skull.

**Any of it is skipped with a tap** — a phone game cannot make you watch
the same four seconds every time you die to a thing — and the return to
play is a hard cut, not a five-metre glide back across the field.

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

## The Bell-Called

**What the bell calls is fought from the outside in, and in that order or
not at all.** It was buried in three pieces and it comes up in three: a
skull the size of a cart, floating, with a light standing well back in
each socket — and its two hands, which were put under the soil apart
from it.

- **The hands, first.** Two of them, each its own body with its own life
  (130 apiece). They do not walk, they *scuttle* — the palm rides on an
  arch of five fingers, each pair of them out of step with the next,
  claws planted in the soil. Two moves, and both of them put you on the
  ground: the **sweep**, where the hand pitches back onto its wrist and
  then scythes across its whole front, and the **slam**, where it rears
  up on its fingertips and comes down flat, throwing out a ring and
  gouging the field. Kill one and the other **remembers it was two** —
  half again as fast, and it stops waiting between swings.
- **While either hand lives, the skull is warded.** The blade rings off
  it — the bell struck again — and does nothing at all. It keeps its
  distance up there, jaw chattering, and screams the bell's own note at
  you: a ring seven and a half metres wide that you have to be out of.
  There is nothing to do about the skull until the hands are gone.
- **The jaw, second.** Both hands down and it comes out of the air, mouth
  opening as it descends, and settles with the teeth at about a man's head
  height and two thirds of a metre of air under the open jaw — still
  floating, never resting. Now it can be hit, and now it fights: it
  **bites** — the whole skull lunges, mouth first — and it **chews**,
  dragging itself forward along the ground with the jaw working, which is
  the one you cannot simply back away from.
- **The head, last.** Everything you land goes into the jaw, and when the
  jaw gives it **comes off** — torn away whole, thrown, and left lying in
  the grass. That is what kills it. The skull screams with nothing to
  scream with, rolls over, the light goes out of the sockets, and it
  crumbles. 420 marrow, the mark of the reaper, and a mote of life.

Its bar is the **whole fight**, not the skull: it drains as the hands go
and again as the jaw gives, so it reads from the first blow rather than
sitting full until the hands are dead. Die to it and every piece of it
goes back to the hole it came out of and waits there — the bell called it
to that spot, and it does not follow you to the bonfire.

## Taken off your feet

**A knockdown, which the game did not have until something the size of a
cart swung at it.** A hand's sweep or slam, or the skull's bite, does not
stagger the pilgrim — it throws him. Four beats: the **throw** (still in
the air, going over backward with his arms out and nothing under him),
the **landing**, a beat flat on his back with the wind out of him, and
the **rise** — over onto the hip, one hand planted, the trunk hauled up
over a bent knee, and last of all the head.

The rise is where the punishment is: three quarters of a second in which
nothing can be done and which cannot be cancelled or rolled out of. He is
**invulnerable** from the landing to the end of it — being floored twice
in a row by two hands working in turn is not a fight, it is a wall — and
a blow that would kill him kills him outright instead, so this never
becomes a way of surviving something lethal.

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

## The icon

Add it to a home screen and what you get is a hollow's skull under the
cathedral's arch, the ember still burning in its sockets.

It is painted in code like everything else here. `tools/make_icons.py`
holds no image — it holds a description of one, a 64-cell grid scaled up
nearest-neighbour exactly the way the game upscales its own 383x216
buffer, so the icon is pixel art on purpose rather than a shrunken
render. The palette is the game's own (`:root` in `index.html`) and
every gradient is ordered-dithered, because a smooth ramp is the one
thing the console could not do. Run it and it rewrites `icons/` from
scratch.

The shapes are measured, not drawn. The cranium is a superellipse and
the mandible another; the temples are bitten in by a circle struck from
a long way out, because a small circle cuts a *notch* and a notch in a
silhouette reads as an ear. The face is lit by a distance field — the
depth of each cell inside the silhouette gives a surface normal, so a
skull seen head-on still has a near side — and then lit again from
inside by its own sockets, which is what stops it reading as a pale
cut-out. A hollow under each cheekbone puts the bones back in the face.
There is one old crack across the left parietal, because a skull with
no history is a prop.

**A gap thinner than one cell is not there at all.** The first pass gave
the teeth their true proportions — a hairline between each — and every
one of them fell between the grid's sample points: the jaw rendered as a
blank pale slab and nothing in the source was wrong. One cell is 1.32
skull units, so the gaps are 1.4 wide on a 4.0 pitch, five teeth to the
row. If a detail vanishes here, measure it against the cell before you
touch anything else.

Five files come out: 64 for a browser tab, 180 for iOS, 192 and 512 for
the manifest, and a maskable 512 whose whole picture is drawn at 78% so
that a launcher cropping it to a circle takes only the arch's legs.
`manifest.webmanifest` is a real file rather than the old inline
`data:` URI, because relative icon paths have nothing to resolve against
inside a data URI.

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
- **Shaders are kept, and warmed** — the finishing cut halves a body
  with clipping planes, and a clipped material is its own shader program.
  three.js throws a program away when the last material on it is
  disposed, so every cut used to compile five programs on the frame of
  the hit and destroy them three seconds later: over a second of stall,
  every finishing move, which read as the game lagging just before the
  blade came down. Now no program is ever given back (the first material
  on each one is kept), and the halves' programs — and the trail's, the
  drop's face, a bone piece, a bolt — are compiled where they cannot be
  felt: a horror's clipped clone is drawn for two frames when the horror
  is built, a metre ahead of the eye with every fragment discarded.
- **The field is baked too, and a mark unbakes its stone** — the
  cathedral's fold left the cemetery, the groves, the ruins and the
  nave's pews as five or six hundred draws at a busy heading, because a
  blade scores a gravestone and gouges a tree and the mark is painted
  onto that object's own texture. They are folded now, by material and
  by 25-metre cell, and every folded thing is remembered: the first mark
  on a tree or a wall, the ultra felling a trunk, a grave or a pew
  breaking, takes that one object back out of the fold and puts it in the
  scene on its own, its own texture from then on. 882 draws became 512 at
  the busiest heading on the field. The pause screen draws at twelve
  frames a second and the title at twenty; neither moves.
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
