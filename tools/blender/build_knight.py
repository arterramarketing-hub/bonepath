#!/usr/bin/env python3
"""BONEPATH — the knight, built in Blender and exported as an inline block.

    python build_knight.py [--out DIR] [--no-render] [--blend]

Runs headless on the `bpy` wheel (pip install bpy; no Blender app needed).
It does four things, in order, and each one works off the SCENE, not off this
file's own lists — so a part re-modelled by hand in the saved .blend exports
exactly the same way:

  1. BUILD   every rig part as its own mesh object (`P_head`, `P_torso` ...)
             parented to an empty at the joint the game rotates (`head`,
             `torso`, `armR` ...). Mesh data is in the JOINT's frame, so the
             pivot is the object's origin and the game's poses drive it as is.
  2. BAKE    ambient occlusion into a per-vertex attribute (`ao`) by casting
             rays against a BVH of the whole body in its rest pose.
  3. EXPORT  the compact block `knight.block.json` (see README: 8-bit
             positions in each part's box, a palette, per-vertex AO,
             per-face colour and shade), which `decode.js` turns into
             flat-shaded BufferGeometry on the existing joints.
  4. RENDER  turnaround stills with Cycles on the CPU (no GPU, no display).

Everything is authored in the GAME's frame (x right, y up, z toward the
viewer, metres) and turned into Blender's (z up, -y front) at the mesh.
Never edit knight.block.json by hand: change this file (or the .blend) and
re-run.
"""
import bpy, bmesh, math, random, json, base64, gzip, sys, os
from mathutils import Vector
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[1:]
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)

# ----------------------------------------------------------------- the rig
# Pivots as measure_rig.js reads them off the live knight (metres, parent's
# frame; the body's y is rig.baseY). mirrorArms puts the WEAPON arm at -x.
PIVOT = {
    'body': ('root', (0, 1.04, 0)), 'torso': ('body', (0, .08, 0)), 'head': ('torso', (0, .58, 0)),
    'armR': ('torso', (-.30, .47, 0)), 'foreR': ('armR', (0, -.34, 0)), 'weapon': ('foreR', (0, -.34, 0)),
    'armL': ('torso', (.30, .47, 0)), 'foreL': ('armL', (0, -.34, 0)),
    'legR': ('body', (.14, -.02, 0)), 'kneeR': ('legR', (0, -.46, 0)),
    'legL': ('body', (-.14, -.02, 0)), 'kneeL': ('legL', (0, -.46, 0)),
}
# which exported part hangs on which joint; limbs are authored once, for the
# +x side, and mirrored (by the decoder too) where the joint sits at -x
WEAR = [('head', 'head', 0), ('torso', 'torso', 0), ('body', 'body', 0),
        ('armL', 'pauld', 0), ('armL', 'arm', 0), ('foreL', 'fore', 0),
        ('armR', 'pauld', 1), ('armR', 'arm', 1), ('foreR', 'fore', 1),
        ('legR', 'leg', 0), ('kneeR', 'knee', 0), ('legL', 'leg', 1), ('kneeL', 'knee', 1)]

# ------------------------------------------------------------- the palette
# The colour as SEEN (sRGB), the way flatMat() takes it. Read off today's
# knight: each is the average of the texture that part wears now.
PAL = {
    'iron': '#a3a7ab', 'ironL': '#c3c7ca', 'ironD': '#70747a', 'helm': '#a9adb1', 'mail': '#5e6268',
    'teal': '#2f8272', 'tealL': '#4aa892', 'tealD': '#236556', 'fur': '#dfe1e2', 'furD': '#b3b6b8',
    'leather': '#8c5c3a', 'leatherD': '#644028', 'trouser': '#6b4a34', 'dark': '#08080a', 'brass': '#b09a54',
}
PAL_KEYS = list(PAL)
TAU = math.pi * 2
rng = random.Random(1128)


def srgb2lin(c):
    return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4


def hex3(h):
    return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))


# ------------------------------------------------------------ the low-poly kit
class Part:
    """Faces in a joint's frame. Every face keeps a palette name and a shade."""

    def __init__(self, name):
        self.name, self.v, self.f = name, [], []

    def face(self, pts, col, away=None, shade=1.0):
        if away is not None:  # turn the face to look away from `away`
            a, b, c = (Vector(p) for p in pts[:3])
            cen = sum((Vector(p) for p in pts), Vector()) / len(pts)
            if (b - a).cross(c - a).dot(cen - Vector(away)) < 0:
                pts = pts[::-1]
        i0 = len(self.v)
        self.v += [tuple(p) for p in pts]
        self.f.append((list(range(i0, i0 + len(pts))), col, shade))

    def loft(self, rings, col, cap_top=False, cap_bottom=False):
        """rings of equal count (or a single point) joined into flat faces.
        col: a palette name, or f(band, face, centre) -> name | (name, shade)."""
        def cen(r):
            return tuple(sum(p[k] for p in r) / len(r) for k in range(3))

        def pick(i, j, pts):
            c = col(i, j, cen(pts)) if callable(col) else col
            return c if isinstance(c, tuple) else (c, 1.0)
        for i in range(len(rings) - 1):
            A, B = rings[i], rings[i + 1]
            ax = tuple((a + b) / 2 for a, b in zip(cen(A), cen(B)))
            n = max(len(A), len(B))
            for j in range(n):
                if len(B) == 1:
                    pts = [A[j], A[(j + 1) % n], B[0]]
                elif len(A) == 1:
                    pts = [A[0], B[(j + 1) % n], B[j]]
                else:
                    pts = [A[j], A[(j + 1) % n], B[(j + 1) % n], B[j]]
                c, s = pick(i, j, pts)
                if c:
                    self.face(pts, c, away=ax, shade=s)
        if cap_top:
            c, s = pick(len(rings) - 1, -1, rings[-1])
            self.face(list(rings[-1]), c, away=cen(rings[-2]), shade=s)
        if cap_bottom:
            c, s = pick(-1, -1, rings[0])
            self.face(list(rings[0]), c, away=cen(rings[1]), shade=s)

    def box(self, w, h, d, at, col, rx=0, ry=0, rz=0, taper=1.0):
        """a box about `at`; taper narrows its -y end (a tongue, a wedge)."""
        from mathutils import Euler
        R = Euler((rx, ry, rz), 'XYZ').to_matrix()
        P = []
        for sy in (-1, 1):
            k = taper if sy < 0 else 1.0
            P.append([tuple(Vector(at) + R @ Vector((sx * w / 2 * k, sy * h / 2, sz * d / 2 * k)))
                      for sx, sz in ((-1, -1), (1, -1), (1, 1), (-1, 1))])
        self.loft(P, col, cap_top=True, cap_bottom=True)


def ring(n, rx, y, rzf=None, rzb=None, cx=0, cz=0, phase=None, yf=None, kf=None):
    """n points round the y axis. rzf/rzb: the depth in front of and behind
    the axis (a body is not round). phase 0 puts a vertex dead ahead at +z —
    a keel — when n is a multiple of 4."""
    rzf = rx if rzf is None else rzf
    rzb = rzf if rzb is None else rzb
    ph = math.pi / 2 if phase is None else phase
    out = []
    for i in range(n):
        t = ph + i * TAU / n
        c, s = math.cos(t), math.sin(t)
        k = kf(i, c, s) if kf else 1.0
        out.append((cx + c * rx * k, y + (yf(i, c, s) if yf else 0), cz + s * (rzf if s > 0 else rzb) * k))
    return out


# ------------------------------------------------------------------ the knight
def build_parts():
    P = {}

    # ---- HEAD (pivot: the neck). A sallet: a keel down the face, one dark
    # slit, a proud brow, a tail flaring out over the nape, a tall comb.
    p = P['head'] = Part('head')
    def helm_col(i, j, c):
        if i == 3 and c[2] > .09 and abs(c[0]) < .11:
            return 'dark'                                    # the visor slit
        if i == 4:
            return ('ironL', 1.0)                            # the brow rim catches the light
        if i == 0:
            return 'ironD'                                   # the tail's underside rim
        return 'helm'
    p.loft([ring(8, .135, .02, .125, .19),                   # the tail, flared back over the nape
            ring(8, .140, .09, .150, .165),
            ring(8, .152, .225, .185, .150),                 # the snout of the visor
            ring(8, .156, .250, .182, .150),                 # ... the slit between these two ...
            ring(8, .158, .285, .176, .152),
            ring(8, .168, .315, .180, .160),                 # the brow, proud
            ring(8, .140, .385, .140, .140),
            ring(8, .080, .440, .078, .085),
            [(0, .462, -.01)]], helm_col, cap_bottom=True)
    # the comb: a fin from the brow over the crown to the nape
    def fin(z, y0, y1, w=.017):
        return [(-w, y0, z), (w, y0, z), (w * .3, y1, z), (-w * .3, y1, z)]
    p.loft([fin(.170, .270, .330), fin(.120, .330, .470), fin(.010, .400, .555), fin(-.100, .360, .530),
            fin(-.160, .260, .400), fin(-.178, .200, .300)], 'ironL', cap_top=True, cap_bottom=True)
    # the scarf, wound thick under the helm's rim
    p.loft([ring(6, .105, -.03, phase=0), ring(6, .150, .025, .150, .155, phase=0), ring(6, .118, .085, phase=0)], 'teal')

    # ---- TORSO (pivot: the waist). A keeled cuirass under a teal surcoat
    # front and back, a belt, a fur collar torn to points, a tabard tongue.
    p = P['torso'] = Part('torso')
    def cuirass_col(i, j, c):
        if abs(c[0]) < .10 and i < 4:
            return 'teal'                                    # the surcoat: the two keel faces, front and back
        return ('ironL', 1.0) if i == 3 and c[2] > 0 else 'iron'
    p.loft([ring(12, .235, -.03, .160, .130),
            ring(12, .225, .100, .160, .128),                # the waist
            ring(12, .275, .250, .205, .150),
            ring(12, .325, .410, .228, .165),                # the chest
            ring(12, .320, .520, .195, .165),
            ring(12, .190, .600, .130, .125)], cuirass_col, cap_top=True, cap_bottom=True)
    p.loft([ring(8, .236, -.005, .164, .134), ring(8, .262, .030, .186, .150), ring(8, .236, .065, .166, .134)],
           lambda i, j, c: 'leather' if i == 0 else 'leatherD')                                          # the belt
    p.box(.07, .07, .03, (0, .03, .188), 'brass')                                                        # its buckle
    p.box(.20, .40, .028, (0, -.19, .168), lambda i, j, c: 'teal' if c[1] > -.3 else 'tealL', rx=.05, taper=.35)  # the tabard's tongue
    # the pelt: a collar that stands at the neck, lies on the shoulders and
    # hangs to the shoulder blades behind — its hem torn to points
    jit = lambda a: (lambda i, c, s: 1 + (((i * 7919) % 13) / 13 - .5) * a)
    hem = lambda i, c, s: (-.075 if i % 2 else 0) + (-.10 if s < -.3 else 0) + (.03 if s > .5 else 0)
    p.loft([ring(12, .165, .665, .150, .175, phase=0, kf=jit(.08)),
            ring(12, .310, .615, .215, .280, phase=0, kf=jit(.10)),
            ring(12, .385, .515, .250, .335, phase=0, yf=hem, kf=lambda i, c, s: (.86 if i % 2 else 1.04))],
           lambda i, j, c: ('fur', 1.06) if i == 0 else ('furD' if (j % 3 == 0) else 'fur'))
    p.loft([ring(6, .150, .655, .10, .16, cz=-.04, phase=0), ring(6, .120, .735, .07, .13, cz=-.07, phase=0),
            [(0, .775, -.13)]], 'fur')                                                                   # it stands up behind the neck

    # ---- BODY (pivot: the hips). A mail skirt with plate tassets at the
    # sides; the game's own cloth tabard hangs over its front and back.
    p = P['body'] = Part('body')
    def skirt_col(i, j, c):
        if i == 0:
            return 'iron'
        if abs(c[0]) > .17:
            return ('iron', 1.0) if i == 1 else 'ironD'      # the tassets
        return 'mail'
    zig = lambda i, c, s: -.03 if i % 2 else 0
    p.loft([ring(8, .236, .065, .164, .134), ring(8, .262, -.03, .178, .150),
            ring(8, .305, -.170, .190, .170), ring(8, .345, -.300, .200, .185, yf=zig)],
           skirt_col)
    p.loft([ring(8, .262, -.03, .178, .150), ring(8, .16, -.13, .10, .09)], 'dark', cap_top=True)        # closed underneath
    p.box(.10, .12, .07, (-.255, -.07, -.06), lambda i, j, c: 'leather' if c[1] < -.04 else 'leatherD', rz=.12)   # the pouch
    p.box(.11, .035, .08, (-.257, -.012, -.06), 'leatherD', rz=.12)                                     # its flap

    # ---- PAULDRON (pivot: the shoulder). Its own mesh, because first person
    # masks the arm's meshes one by one: the pauldron goes, the arm stays.
    p = P['pauld'] = Part('pauld')
    slope = lambda k: (lambda i, c, s: -k * c)               # the outer side hangs lower than the neck side
    p.loft([[(.0, .150, 0)],
            ring(6, .095, .120, cx=.02, phase=0, yf=slope(.03)),
            ring(6, .200, .045, .190, .190, cx=.04, phase=0, yf=slope(.06)),
            ring(6, .222, -.035, .205, .205, cx=.05, phase=0, yf=slope(.085)),
            ring(6, .185, -.050, .170, .170, cx=.05, phase=0, yf=slope(.085))],
           lambda i, j, c: 'ironL' if i < 2 else ('ironD' if i == 3 else 'iron'))
    p.loft([ring(6, .150, -.045, cx=.035, phase=0, yf=slope(.07)),                                       # the second lame, under it
            ring(6, .165, -.120, .150, .150, cx=.045, phase=0, yf=slope(.07)),
            ring(6, .135, -.135, .125, .125, cx=.045, phase=0, yf=slope(.07))],
           lambda i, j, c: 'iron' if i == 0 else 'ironD')
    p.box(.034, .085, .13, (.055, .135, 0), 'iron', rz=-.38, taper=.6)                                     # the haute-piece: a fin that breaks the shoulder line

    # ---- UPPER ARM (pivot: the shoulder): mail, a plate over the outside
    p = P['arm'] = Part('arm')
    p.loft([ring(6, .085, .0, phase=0), ring(6, .100, -.150, phase=0), ring(6, .078, -.335, phase=0)],
           lambda i, j, c: 'iron' if c[0] > .02 else 'mail', cap_top=True, cap_bottom=True)
    p.loft([ring(6, .094, -.215, phase=0), ring(6, .100, -.235, phase=0), ring(6, .090, -.255, phase=0)], 'leather')   # the strap

    # ---- FOREARM (pivot: the elbow): a couter with a point behind, a flared
    # vambrace, a broad cuff, a fist
    p = P['fore'] = Part('fore')
    p.loft([[(0, -.01, -.135)], ring(6, .082, .0, .07, .075, phase=0, yf=lambda i, c, s: .05 if s > .5 else (-.045 if s < -.5 else 0)),
            [(0, .0, .06)]], lambda i, j, c: 'ironL' if c[1] > 0 else 'iron')                             # the couter
    p.loft([ring(6, .070, -.02, phase=0), ring(6, .078, -.120, phase=0), ring(6, .058, -.250, phase=0)],
           lambda i, j, c: 'iron' if c[2] < .02 else 'mail', cap_top=True)                                # the vambrace
    p.loft([ring(6, .108, -.215, phase=0), ring(6, .074, -.300, phase=0)],
           lambda i, j, c: 'ironL', cap_top=False)                                                        # the gauntlet's cuff, flared to the elbow
    p.loft([ring(6, .068, -.215, phase=0), ring(6, .108, -.215, phase=0)], 'ironD')                       # ... its dark mouth
    p.loft([ring(6, .066, -.295, phase=0), ring(6, .084, -.355, .090, .075, phase=0), ring(6, .060, -.425, .070, .055, phase=0)],
           lambda i, j, c: 'leatherD' if i == 0 else 'ironD', cap_bottom=True)                            # the fist

    # ---- THIGH (pivot: the hip): dark trousers, a cuisse over the front
    p = P['leg'] = Part('leg')
    p.loft([ring(8, .116, -.0, .112, .105), ring(8, .112, -.210, .116, .10), ring(8, .090, -.455, .092, .086)],
           lambda i, j, c: ('iron' if i == 0 else 'ironD') if (c[2] > .045 and i < 2 and c[1] < -.02) else 'trouser',
           cap_top=True, cap_bottom=True)

    # ---- SHIN AND BOOT (pivot: the knee): a poleyn with a point and a side
    # wing, a turned-down boot top, a greave over the shin, a long boot
    p = P['knee'] = Part('knee')
    p.loft([[(0, .0, .135)], ring(6, .088, .0, .06, .07, phase=0, yf=lambda i, c, s: .075 if s > .5 else (-.06 if s < -.5 else 0)),
            [(0, -.01, -.05)]], lambda i, j, c: 'ironL' if c[1] > .01 else 'iron')                        # the poleyn
    p.box(.022, .10, .11, (.088, .0, .0), 'iron', rz=-.25, taper=.5)                                      # its wing, outside
    p.loft([ring(6, .078, -.03, phase=0), ring(6, .114, -.075, phase=0), ring(6, .106, -.135, phase=0), ring(6, .082, -.145, phase=0)],
           lambda i, j, c: 'leather' if i == 1 else 'leatherD')                                           # the boot's turned top
    p.loft([ring(8, .084, -.02, .088, .078), ring(8, .090, -.20, .086, .098), ring(8, .066, -.415, .066, .066)],
           lambda i, j, c: ('iron' if i == 0 else 'ironD') if (c[2] > .035 and c[1] < -.13) else 'leather')   # the shin, greave in front
    # the foot, lofted heel to toe along z
    def sec(z, w, y0, y1, pinch=1.0):
        return [(-w / 2, y0, z), (w / 2, y0, z), (w / 2 * pinch, y1, z), (-w / 2 * pinch, y1, z)]
    p.loft([sec(-.085, .100, -.525, -.430, .8), sec(-.02, .130, -.525, -.380, .75), sec(.075, .140, -.525, -.430, .8),
            sec(.155, .115, -.525, -.475, .7), sec(.215, .050, -.525, -.500, .6)],
           lambda i, j, c: 'leatherD' if (c[1] < -.51 or i == 3) else 'leather', cap_top=True, cap_bottom=True)
    return P


# -------------------------------------------------------------- into Blender
def to_bl(p):          # game (x, y up, z front) -> Blender (x, -y front, z up); a pure rotation
    return (p[0], -p[2], p[1])


def to_game(p):
    return (p[0], p[2], -p[1])


def world_pivot(j):
    x = y = z = 0.0
    while j != 'root':
        par, (a, b, c) = PIVOT[j]
        x, y, z, j = x + a, y + b, z + c, par
    return (x, y, z)


def scene_build(parts):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    col = sc.collection
    emp = {'root': bpy.data.objects.new('root', None)}
    col.objects.link(emp['root'])
    for j, (par, loc) in PIVOT.items():                      # dict order is parent-first
        e = bpy.data.objects.new(j, None)
        e.empty_display_size = .05
        e.parent = emp[par]
        e.location = to_bl(loc)
        col.objects.link(e)
        emp[j] = e
    meshes = {}
    for name, part in parts.items():
        me = bpy.data.meshes.new('P_' + name)
        bm = bmesh.new()
        vs = [bm.verts.new(to_bl(v)) for v in part.v]
        cl = bm.loops.layers.color.new('Col')
        fs = bm.faces.layers.float.new('fs')
        for idx, c, shade in part.f:
            try:
                f = bm.faces.new([vs[i] for i in idx])
            except ValueError:
                continue
            r, g, b = hex3(PAL[c])
            for lp in f.loops:
                lp[cl] = (r, g, b, 1)
            f[fs] = shade * (1 + (rng.random() * 2 - 1) * .05)   # the facet jitter (the game's own facet())
            f.smooth = False
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
        bmesh.ops.triangulate(bm, faces=bm.faces)
        bm.to_mesh(me)
        bm.free()
        meshes[name] = me
    objs = []
    for joint, name, mir in WEAR:
        o = bpy.data.objects.new('P_' + name + ('.' + joint if mir else ''), meshes[name])
        o.parent = emp[joint]
        if mir:
            o.scale = (-1, 1, 1)
        col.objects.link(o)
        objs.append((o, joint, name, mir))
    bpy.context.view_layer.update()
    return objs


def bake_ao(objs, rays=96, reach=.34, strength=.8, other=.4, floor=.45):
    """Ambient occlusion into the point attribute `ao` (1 = open sky).
    A BVH of the whole body at rest; cosine-weighted rays from every vertex;
    a hit counts for less the further away it is. No GPU, no Cycles bake —
    this runs anywhere bpy imports."""
    V, T, own = [], [], []
    for o, joint, name, mir in objs:
        base = len(V)
        mw = o.matrix_world
        V += [mw @ v.co for v in o.data.vertices]
        T += [tuple(base + i for i in p.vertices) for p in o.data.polygons]
        own += [joint] * len(o.data.polygons)
    tree = BVHTree.FromPolygons(V, T)
    r2 = random.Random(7)
    dirs = []
    while len(dirs) < rays:                                   # cosine-weighted, about +z
        u, v = r2.random(), r2.random()
        r, t = math.sqrt(u), TAU * v
        dirs.append(Vector((r * math.cos(t), r * math.sin(t), math.sqrt(1 - u))))
    done = set()
    for o, joint, name, mir in objs:
        if mir or name in done:                               # the mirrored copy shares the mesh
            continue
        done.add(name)
        me = o.data
        at = me.attributes.get('ao') or me.attributes.new('ao', 'FLOAT', 'POINT')
        mw = o.matrix_world
        n3 = mw.to_3x3()
        nrm = [Vector() for _ in me.vertices]
        for p in me.polygons:
            for i in p.vertices:
                nrm[i] += p.normal * p.area
        for i, v in enumerate(me.vertices):
            n = (n3 @ nrm[i])
            if n.length < 1e-9:
                at.data[i].value = 1
                continue
            n.normalize()
            a = Vector((0, 0, 1)).cross(n)
            tx = a.normalized() if a.length > 1e-5 else Vector((1, 0, 0))
            ty = n.cross(tx)
            org = mw @ v.co + n * .004
            occ = 0.0
            for d in dirs:
                w = tx * d.x + ty * d.y + n * d.z
                hit = tree.ray_cast(org, w, reach)
                if hit[0] is not None:
                    # a part on ANOTHER joint moves away in play: its shadow is baked at under half weight
                    occ += (1 - (hit[3] / reach) ** 2) * (1.0 if own[hit[2]] == joint else other)
            ao = max(floor, 1 - strength * occ / rays)
            y = (mw @ v.co).z                                 # and the body darkens toward the boots: it stands on the ground
            ao *= .84 + .16 * min(1, max(0, y / 1.1))
            at.data[i].value = ao
    # a display colour for the render: base * face shade * ao
    for name in done:
        me = bpy.data.meshes['P_' + name]
        sh = me.color_attributes.get('Shaded') or me.color_attributes.new('Shaded', 'FLOAT_COLOR', 'CORNER')
        colr, fs, ao = me.color_attributes['Col'], me.attributes['fs'], me.attributes['ao']
        for p in me.polygons:
            for li in p.loop_indices:
                c = colr.data[li].color
                k = fs.data[p.index].value * ao.data[me.loops[li].vertex_index].value
                sh.data[li].color = (srgb2lin(c[0]) * k, srgb2lin(c[1]) * k, srgb2lin(c[2]) * k, 1)


# ------------------------------------------------------------------- export
def export_block(path):
    """Reads the SCENE: every mesh named P_<part>. Layout per part, one
    base64 string: positions (3 bytes a vertex, in the part's box), AO (1 a
    vertex, /200), indices (1 byte each, 2 if the part has over 256
    vertices), palette index (1 a face), face shade (1 a face, /200)."""
    used, parts, report = [], {}, []
    names = []
    for joint, name, mir in WEAR:
        if name not in names:
            names.append(name)
    for name in names:
        me = bpy.data.meshes['P_' + name]
        colr, fs, ao = me.color_attributes['Col'], me.attributes['fs'], me.attributes['ao']
        G = [to_game(v.co) for v in me.vertices]
        lo = [min(g[k] for g in G) for k in range(3)]
        sz = [max(max(g[k] for g in G) - lo[k], 1e-6) for k in range(3)]
        n, t = len(G), len(me.polygons)
        buf = bytearray()
        for g in G:
            buf += bytes(round((g[k] - lo[k]) / sz[k] * 255) for k in range(3))
        buf += bytes(max(0, min(255, round(ao.data[i].value * 200))) for i in range(n))
        cols, shades = bytearray(), bytearray()
        for p in me.polygons:
            assert len(p.vertices) == 3
            for i in p.vertices:
                buf += bytes([i]) if n <= 256 else bytes([i & 255, i >> 8])
            c = colr.data[p.loop_indices[0]].color
            hx = '#%02x%02x%02x' % tuple(round(max(0, min(1, c[k])) * 255) for k in range(3))
            if hx not in used:
                used.append(hx)
            cols.append(used.index(hx))
            shades.append(max(0, min(255, round(fs.data[p.index].value * 200))))
        buf += cols + shades
        parts[name] = {'b': [round(x, 4) for x in lo + sz], 'n': n, 't': t, 'd': base64.b64encode(bytes(buf)).decode()}
        js = json.dumps(parts[name], separators=(',', ':'))
        report.append({'part': name, 'verts': n, 'tris': t, 'raw': len(buf), 'json': len(js), 'gzip': len(gzip.compress(js.encode(), 9)),
                       'min': [round(x, 3) for x in lo], 'max': [round(lo[k] + sz[k], 3) for k in range(3)]})
    block = {'v': 1, 'pal': used, 'parts': parts}
    txt = json.dumps(block, separators=(',', ':'))
    with open(path, 'w') as f:
        f.write(txt + '\n')
    worn = {}
    for joint, name, mir in WEAR:
        worn[name] = worn.get(name, 0) + 1
    tot = {'json': len(txt), 'gzip': len(gzip.compress(txt.encode(), 9)), 'raw': sum(r['raw'] for r in report),
           'tris_unique': sum(r['tris'] for r in report), 'tris_worn': sum(r['tris'] * worn[r['part']] for r in report),
           'draws': len(WEAR), 'palette': len(used)}
    return report, tot


# ------------------------------------------------------------------- render
def render(out):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 24
    sc.cycles.use_denoising = False
    sc.cycles.max_bounces = 1
    sc.render.resolution_x, sc.render.resolution_y = 360, 560
    sc.render.film_transparent = False
    sc.view_settings.view_transform = 'Standard'
    w = bpy.data.worlds.new('w')
    bg = w.node_tree.nodes['Background']
    bg.inputs[0].default_value = (.045, .05, .06, 1)
    bg.inputs[1].default_value = 1.0
    sc.world = w
    m = bpy.data.materials.new('vc')
    nt = m.node_tree
    bsdf = nt.nodes.get('Principled BSDF')
    at = nt.nodes.new('ShaderNodeAttribute')
    at.attribute_name = 'Shaded'
    nt.links.new(at.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 1.0
    for o in bpy.data.objects:
        if o.type == 'MESH' and not o.data.materials:
            o.data.materials.append(m)
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN'))
    sun.data.energy = 5.0
    sun.data.angle = .02
    sc.collection.objects.link(sun)
    amb = bpy.data.objects.new('fill', bpy.data.lights.new('fill', 'SUN'))
    amb.data.energy = 1.6
    sc.collection.objects.link(amb)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    cam.data.lens = 85
    sc.collection.objects.link(cam)
    sc.camera = cam
    tgt = Vector((0, 0, 1.1))
    for name, deg in (('front', 0), ('q34', 35), ('side', 90), ('back34', 150), ('back', 180)):
        a = math.radians(deg)
        d = Vector((math.sin(a), -math.cos(a), .12)).normalized()
        cam.location = tgt + d * 6.3
        cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
        ld = Vector((math.sin(a + .7), -math.cos(a + .7), 1.3))    # the key rides with the camera, up and to one side
        sun.rotation_euler = ld.to_track_quat('Z', 'Y').to_euler()
        fd = Vector((math.sin(a - 1.2), -math.cos(a - 1.2), .5))
        amb.rotation_euler = fd.to_track_quat('Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(out, 'blender_' + name + '.png')
        bpy.ops.render.render(write_still=True)


def main():
    parts = build_parts()
    objs = scene_build(parts)
    bake_ao(objs)
    report, tot = export_block(os.path.join(HERE, 'knight.block.json'))
    with open(os.path.join(HERE, 'knight.report.json'), 'w') as f:
        json.dump({'parts': report, 'total': tot, 'blender': bpy.app.version_string, 'ao': 'BVH ray cast, 96 rays a vertex'}, f, indent=1)
    print('%-7s %5s %5s %6s %6s %6s' % ('part', 'verts', 'tris', 'raw', 'json', 'gzip'))
    for r in report:
        print('%-7s %5d %5d %6d %6d %6d' % (r['part'], r['verts'], r['tris'], r['raw'], r['json'], r['gzip']))
    print('TOTAL  json %d B, gzip %d B, %d triangles on the body (%d unique), %d draws, %d colours'
          % (tot['json'], tot['gzip'], tot['tris_worn'], tot['tris_unique'], tot['draws'], tot['palette']))
    if '--blend' in ARGS:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'knight.blend'))
    if '--no-render' not in ARGS:
        render(OUT)


main()
