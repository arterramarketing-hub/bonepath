# First person — built (2026-09-12)

This file was the plan for an "FPS mode". It is built now, and it came out
as something a little different from the plan: **not a third way to begin,
but a switch inside either world.** The 3RD / 1ST button beside the pause
button (or *the view* on the pause screen) moves the eye into the helm
mid-run, in the field or on the path. The design document is `README.md`,
section *First person*; the code is the section headed FIRST PERSON in
`index.html`, just above `updateHUD`, with `const FPS` beside `G` and the
input additions inside `Input`. Working notes and traps are in `CLAUDE.md`.

## What the plan said, and what was done

| planned | built |
|---|---|
| a mode of its own on the title screen | a toggle inside the field and the path; the title button and its note are gone |
| the guns only behind the eyes | the view and the weapon are separate: a gun is carried in third person too, and a blade is swung from behind the eyes |
| a revolver, six rounds, nothing else | six guns by calibre: the golden eagle and the bone sniper (.50), the M4A1 (5.56), the UMP45 (9mm, suppressed), the SPAS-12 (12 gauge), the RPG-4 (rockets); iron sights, a red dot or an ACOG on each rail |
| infinite ammunition, or marrow buys rounds (open question) | finite magazines and reserves; the horrors drop boxes of rounds in first person; the field's death refills |
| tap fires, hold aims, flick rolls | phone-shooter buttons: a trigger under each thumb, aim (tap toggles, hold releases), reload, dodge, zoom, and the weapon bar to swap |
| lock-on off, the crosshair aims | as planned; the finishing mark is off too |
| hitscan, head counts double | as planned: head and body spheres off the rig, then the ray walked through the world |
| elements as rounds | an imbued element rides every round the way it rides an arrow |
| the Warden's heart as a weak point | not done: the Warden is shot like anything else (head double) |
| melee bash at point-blank (open question) | no melee at all in first person; the dodge is the only body move |

The remaining open question from the plan — whether the path's cathedral
suits a shooter — was left alone: the nave, the pews and the host in it
are what they are, and the pews stop bullets.
