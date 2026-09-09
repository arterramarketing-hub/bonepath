# Brief for an importable hero model

Give this whole file to whatever is making the model. It describes what
the game can take and how the model must be built to drop into the
existing rig, so the game's own poses, swings, rolls and hit reactions
drive it without new animation.

## What the game is

A PSX-style (PlayStation 1 look) third-person action game in one HTML
file on three.js. Everything is low-poly, flat-shaded, with small
nearest-filtered textures and a low-resolution render. There is no PBR,
no normal maps, no real-time shadows. The hero is a knight with a
greatsword (also an ultra greatsword, a longbow, a katana). The camera
sits behind and above; the hero is seen from the back and sides most of
the time, up close in the pause screen.

## Format

- glTF 2.0 binary (`.glb`), Y up, metres, right-handed. The model
  faces **+Z** at rest (three.js convention used by the game).
- Origin on the ground, midway between the heels.
- One texture sheet, PNG, 256 x 256 (512 at most), palette-limited,
  hand-painted shading baked in. Nearest-filtered in game, so keep
  detail chunky; no gradients that rely on smoothing.
- One material, unlit or Lambert; no transparency except alpha cutout
  if a part truly needs it (hair, straps).
- Triangle budget: 1,500 to 3,000 for the whole hero, weapon apart.
  The current knight is about 3,200 including the sword.

## Size and proportions (match these so reach, camera and hits stay right)

- Standing height to the top of the helm: **1.95 m**.
- Hips pivot at 1.06 m, knees at 0.58 m, shoulders at 1.61 m, head
  pivot (neck) at 1.72 m. Shoulder width 0.60 m (shoulders at x = ±0.30).
- Stance: legs straight down, feet 0.28 m apart (x = ±0.14).

## Rig: separate rigid parts on named pivots (this is the important part)

The game does not play animation clips. It rotates named joints every
frame from its own pose code, and each joint is a plain node whose
mesh hangs off it. So build the hero as **rigid parts parented to
empties**, NOT as one skinned mesh. Name the nodes exactly:

```
root
 └─ body        (hips; the whole upper body and legs hang from it)
     ├─ torso   (chest, from the waist up)
     │   ├─ head            (neck pivot; helm/face mesh under it)
     │   ├─ armR            (right shoulder pivot; upper arm mesh)
     │   │   └─ foreR       (right elbow pivot; forearm + hand mesh)
     │   │       └─ weapon  (an EMPTY at the palm — the grip socket)
     │   └─ armL            (left shoulder pivot; upper arm mesh)
     │       └─ foreL       (left elbow pivot; forearm + hand mesh)
     ├─ legR    (right hip pivot; thigh mesh)
     │   └─ kneeR           (right knee pivot; shin + foot mesh)
     └─ legL    (left hip pivot; thigh mesh)
         └─ kneeL           (left knee pivot; shin + foot mesh)
```

Rules for every pivot:

- The pivot sits at the JOINT (top of the upper arm at the shoulder, the
  elbow, the top of the thigh, the knee). Its mesh extends from the
  pivot **down the limb along the pivot's local −Y** in the rest pose.
- Rest pose is A-pose-free: arms hanging straight down at the sides,
  legs straight, all pivot rotations zero. The game treats rotation
  zero as this rest.
- Rotation about the pivot's local X swings the limb forward and back
  (negative X raises an arm forward and up); local Z swings it out to
  the side. Keep pivot axes aligned with the world axes at rest (no
  baked rotations on the empties).
- The `weapon` empty is at the right palm, oriented so a weapon whose
  blade runs along the empty's **−Y** points down out of the fist at
  rest. The game hangs its own weapons on this socket; the model
  should not include one.
- Right is **−X** when the model faces +Z.

Optional extras the game will use if present: a node named `cape`
with a simple cloth sheet as its mesh (the game simulates capes),
and a node named `eyes` if the face has separate eye meshes.

## Style notes

- Silhouette first: read at 100 pixels tall. Big shapes, few details.
- Bake ambient occlusion and edge highlights into the texture by hand;
  keep colours desaturated with one accent (the current knight uses
  bone ivory plate with a teal-green tabard).
- Faceted, hard-edged geometry, no smoothing groups across large curves.
- Symmetry is fine; the game mirrors poses for the off-hand.

## Delivery

One `.glb` with the texture embedded, plus the PNG on its own. A
screenshot from the back three-quarter view helps. The game side then
needs a small adapter that finds the named nodes and hands them to the
existing rig; nothing else in the game changes.
