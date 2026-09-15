#!/usr/bin/env python3
"""BONEPATH - the home-screen icon, painted in code.

Nothing in this game ships as an art file: the textures are 256px canvases,
the audio is synthesised, the geometry is built at boot.  The icon keeps the
rule.  There is no image here to edit - there is a description of one, and
running this repaints every PNG under icons/ from scratch:

    python3 tools/make_icons.py

The art is a 64-cell grid, scaled up nearest-neighbour exactly the way the
game upscales its 383x216 buffer, so the icon is pixel art on purpose rather
than a shrunken render.  What it shows: a hollow's skull with the ember still
burning in its sockets, stood under the cathedral's arch.  At sixty pixels on
a phone's home screen the three things that survive are a black square, a
pale skull and two orange eyes, and those are the three things chosen.

Palette is the game's own (:root in index.html) - bone #cfc4a3, ember
#d0762b / #f0a648, pit #070a09 - and every gradient is ordered-dithered,
because a smooth ramp is the one thing a PlayStation could not do.
"""

import math, os, struct, zlib

G = 64                      # art grid, in cells
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'icons')

# ---------------------------------------------------------------- small maths

def clamp(v, a=0.0, b=1.0):
    return a if v < a else (b if v > b else v)

def smooth(e0, e1, x):
    t = clamp((x - e0) / (e1 - e0))
    return t * t * (3.0 - 2.0 * t)

def ramp(stops, t):
    t = clamp(t) * (len(stops) - 1)
    i = int(t)
    if i >= len(stops) - 1:
        return stops[-1]
    f = t - i
    a, b = stops[i], stops[i + 1]
    return (a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f)

def seg_dist(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    L = vx * vx + vy * vy
    t = 0.0 if L <= 0 else clamp((wx * vx + wy * vy) / L)
    dx, dy = wx - vx * t, wy - vy * t
    return math.hypot(dx, dy)

# The bone is lit from the upper left and slightly in front, so a skull seen
# head-on still has a near side.  Below, the ember in the sockets adds its own
# light from inside the face, which is what makes it read as lit rather than
# merely pale.
_L = (-0.42, -0.50, 0.76)
_LN = math.sqrt(sum(c * c for c in _L))
LIGHT = tuple(c / _LN for c in _L)

BONE_RAMP = [(28, 26, 22), (52, 49, 41), (76, 72, 60), (104, 98, 82),
             (133, 125, 104), (170, 161, 134), (207, 196, 163),
             (232, 223, 192), (251, 246, 222)]
EMBER_RAMP = [(9, 7, 6), (34, 14, 8), (74, 26, 11), (124, 47, 16),
              (176, 82, 26), (208, 118, 43), (240, 166, 72),
              (253, 220, 154), (255, 246, 219)]
COLD_RAMP = [(6, 9, 8), (10, 14, 13), (15, 20, 19), (22, 29, 27),
             (32, 42, 38), (46, 58, 52), (64, 78, 69)]
GLOW = (255, 150, 58)

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

# ------------------------------------------------------------------ the shapes
# All of these are in SKULL coordinates: cell units, origin between the eyes,
# +y down.  The crown sits at -27 and the chin at 23.

SKS, SYOFF = 0.76, 1.5      # the skull's size and seat inside the arch

def skull_solid(sx, sy):
    inside = (abs(sx / 18.0) ** 2.4 + abs((sy + 8.0) / 19.0) ** 2.4) <= 1.0      # cranium
    if not inside:
        inside = (abs(sx / 14.5) ** 3.4 + abs((sy - 6.0) / 17.0) ** 3.4) <= 1.0  # mandible
    if not inside:                                                                # zygomatic flare
        inside = (abs(sx) - 12.6) ** 2 + (sy - 4.5) ** 2 <= 4.6 ** 2
    if not inside:
        return False
    # The temples pinch in between the parietal and the cheekbone.  Without
    # this the silhouette is an egg: 17.8 wide at the brow, 14.8 at the temple,
    # 17.2 again at the cheek is what makes it a skull.  The bite is struck
    # from a long way out on purpose - a small circle cuts a notch, and a
    # notch in a silhouette reads as an ear.
    if (abs(sx) - 24.0) ** 2 + (sy + 3.0) ** 2 < 9.2 ** 2:
        return False
    return True

# A gap thinner than one cell of the grid falls between the sample points and
# the mouth silently is not there at all - which is exactly what the first
# pass did.  One cell is 1/SKS = 1.32 skull units, so the gaps are 1.4 wide on
# a 4.0 pitch: two cells of tooth, one of shadow, five teeth to the row.
def tooth_gap(sx, period, phase):
    f = (sx + phase) % period
    return min(f, period - f) < 0.70

def skull_hole(sx, sy):
    """'socket' burns; 'dark' is simply absent bone."""
    if (abs((abs(sx) - 7.3) / 5.5) ** 3.0 + abs((sy + 3.0) / 5.5) ** 3.0) <= 1.0:
        return 'socket'
    if 3.5 <= sy <= 11.5:                                   # nasal aperture
        w = 0.6 + 3.4 * ((sy - 3.5) / 8.0) ** 1.25
        if abs(sx) <= w and not (abs(sx) < 0.85 and sy > 7.6):
            return 'dark'
    if 13.2 <= sy <= 17.0 and abs(sx) <= 10.6:              # upper row
        if tooth_gap(sx, 4.0, 0.0) or abs(sx) > 9.4:
            return 'dark'
    if 17.0 < sy < 18.5 and abs(sx) <= 10.2:                # the bite
        return 'dark'
    if 18.5 <= sy <= 21.0 and abs(sx) <= 8.8:               # lower row
        if tooth_gap(sx, 4.0, 2.0) or abs(sx) > 7.8:
            return 'dark'
    return None

def crack(sx, sy):
    """One old blow to the left parietal.  A skull with no history is a prop."""
    d = seg_dist(sx, sy, -13.5, -18.0, -6.5, -8.5)
    d = min(d, seg_dist(sx, sy, -10.0, -13.2, -12.6, -10.0))
    return d < 0.85

# The cathedral's arch: two arcs struck from (+-A, Y) of radius R, springing
# into vertical jambs below Y.  A = 18.9 / R = 38.9 puts the apex 34 cells
# above the springing at 20 wide, which is a lancet rather than a tunnel.
AR_A, AR_R, AR_Y = 18.9, 38.9, 8.0

def arch_hw(ay):
    if ay <= AR_Y:
        v = AR_R * AR_R - (ay - AR_Y) ** 2
        return -1.0 if v <= 0 else (math.sqrt(v) - AR_A)
    return AR_R - AR_A

MOTES = [(-16.5, -11.0, .85), (14.8, -17.2, .60), (-12.0, 12.5, .70),
         (17.5, 6.0, .50), (-19.0, 2.0, .45), (10.5, -24.0, .40),
         (-7.0, 25.5, .65), (6.0, 21.0, .35), (19.5, 20.0, .45)]

# ------------------------------------------------------------- distance fields

def chamfer(seed, G):
    INF = 1e9
    D = [[0.0 if seed[y][x] else INF for x in range(G)] for y in range(G)]
    for y in range(G):
        for x in range(G):
            d = D[y][x]
            if y > 0:
                d = min(d, D[y - 1][x] + 3)
                if x > 0:     d = min(d, D[y - 1][x - 1] + 4)
                if x < G - 1: d = min(d, D[y - 1][x + 1] + 4)
            if x > 0:         d = min(d, D[y][x - 1] + 3)
            D[y][x] = d
    for y in range(G - 1, -1, -1):
        for x in range(G - 1, -1, -1):
            d = D[y][x]
            if y < G - 1:
                d = min(d, D[y + 1][x] + 3)
                if x > 0:     d = min(d, D[y + 1][x - 1] + 4)
                if x < G - 1: d = min(d, D[y + 1][x + 1] + 4)
            if x < G - 1:     d = min(d, D[y][x + 1] + 3)
            D[y][x] = d
    return [[min(v / 3.0, 40.0) for v in row] for row in D]

# --------------------------------------------------------------------- painter

def paint(scale):
    """Return a G x G grid of float RGB.  `scale` shrinks the whole picture for
    the maskable variant, whose outer fifth a launcher is free to crop."""
    solid = [[False] * G for _ in range(G)]
    hole  = [[None] * G for _ in range(G)]
    bone  = [[False] * G for _ in range(G)]
    archi = [[False] * G for _ in range(G)]

    def art(x, y):
        return ((x + 0.5 - G / 2.0) / scale, (y + 0.5 - G / 2.0) / scale)

    for y in range(G):
        for x in range(G):
            ax, ay = art(x, y)
            sx, sy = ax / SKS, (ay - SYOFF) / SKS
            s = skull_solid(sx, sy)
            solid[y][x] = s
            if s:
                hole[y][x] = skull_hole(sx, sy)
                bone[y][x] = hole[y][x] is None
            archi[y][x] = abs(ax) < arch_hw(ay)

    notbone = [[not bone[y][x] for x in range(G)] for y in range(G)]
    D = chamfer(notbone, G)

    edge = [[False] * G for _ in range(G)]
    for y in range(G):
        for x in range(G):
            a = archi[y][x]
            if ((x and archi[y][x - 1] != a) or (x < G - 1 and archi[y][x + 1] != a)
                    or (y and archi[y - 1][x] != a) or (y < G - 1 and archi[y + 1][x] != a)):
                edge[y][x] = True
    AD = chamfer(edge, G)

    # The two sockets and the pool of light under the chin, in canvas cells.
    lamps = [(+7.2 * SKS * scale, (-3.0 * SKS + SYOFF) * scale, 1.00),
             (-7.2 * SKS * scale, (-3.0 * SKS + SYOFF) * scale, 1.00),
             (0.0, (24.0 * SKS + SYOFF) * scale, 0.45)]

    img = [[(0.0, 0.0, 0.0)] * G for _ in range(G)]
    for y in range(G):
        row = []
        for x in range(G):
            cx, cy = x + 0.5 - G / 2.0, y + 0.5 - G / 2.0
            ax, ay = art(x, y)
            sx, sy = ax / SKS, (ay - SYOFF) / SKS

            glow = 0.0
            for lx, ly, lw in lamps:
                r = math.hypot(cx - lx, cy - ly)
                glow += lw / (1.0 + (r / (7.4 * scale)) ** 2)

            k = hole[y][x]
            if bone[y][x]:
                d = D[y][x]
                gx = (D[y][min(G - 1, x + 1)] - D[y][max(0, x - 1)]) * 0.5
                gy = (D[min(G - 1, y + 1)][x] - D[max(0, y - 1)][x]) * 0.5
                fall = clamp(1.0 - d / 5.5)
                nx, ny = -gx * fall, -gy * fall
                m = nx * nx + ny * ny
                if m > 0.94:
                    s = math.sqrt(0.94 / m); nx *= s; ny *= s; m = 0.94
                nz = math.sqrt(1.0 - m)
                ndl = clamp(nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2])
                lum = 0.20 + 0.68 * ndl + 0.11 * clamp((10.0 - sy) / 36.0)
                # The hollow under the cheekbone.  Without it the whole maxilla
                # is one pale slab and the face has no bones in it.
                gaunt = clamp(1.0 - math.hypot((abs(sx) - 9.6) / 4.4, (sy - 9.6) / 4.8))
                lum -= 0.22 * gaunt * gaunt
                if crack(sx, sy):
                    lum *= 0.42
                col = list(ramp(BONE_RAMP, lum))
                warm = clamp(glow * 0.62)                 # the sockets light the face
                for i in range(3):
                    col[i] += (GLOW[i] - col[i]) * warm * 0.42 + GLOW[i] * warm * 0.16
            elif k == 'socket':
                u = (abs(sx) - 7.3) / 5.5
                v = (sy + 3.0) / 5.5
                rr = math.hypot(u * 1.04, v * 0.96)
                # The brow keeps the top of the socket dark, so the fire reads
                # as something burning inside a hollow rather than as a bead
                # stuck on the front of the face.  The core sits low and
                # inboard, where a candle set behind the face would show.
                core = clamp(1.30 - math.hypot((u + 0.18) * 1.15, (v - 0.22) * 1.05) * 1.34)
                fire = core * (0.16 + 0.84 * smooth(-1.05, 0.05, v))
                fire *= 0.55 + 0.45 * clamp(1.0 - rr * 0.55)
                col = list(ramp(EMBER_RAMP, fire * 1.02))
            elif k == 'dark':
                col = list(ramp(EMBER_RAMP, 0.02 + clamp(glow * 0.10)))
            else:
                base = 0.10
                if archi[y][x]:
                    base = 0.34 + 0.10 * clamp((ay + 26.0) / 50.0)
                if AD[y][x] < 2.1 and ay < 30.0:          # the arch's own rib
                    base = 0.72 - 0.10 * clamp(AD[y][x] / 2.1)
                if ay > 24.0 and not archi[y][x]:
                    base += 0.05
                r = math.hypot(cx, cy)
                base *= 1.0 - 0.52 * clamp((r / 33.0) ** 2)
                col = list(ramp(COLD_RAMP, base))
                for mx, my, mb in MOTES:                  # embers still in the air
                    md = math.hypot(cx - mx * scale, cy - my * scale)
                    f = mb * clamp(1.0 - md / 1.15) ** 1.5
                    for i in range(3):
                        col[i] += GLOW[i] * f * 0.85
                g = clamp(glow * 0.80)
                for i in range(3):
                    col[i] += GLOW[i] * g * 0.30
            row.append(tuple(col))
        img[y] = row
    return img

# ------------------------------------------------------------------- the files

def png(path, size, art):
    """Nearest-neighbour up to `size`, ordered-dithered, quantised to a coarse
    ladder.  The dither is the point: it is what the game's own frame does."""
    rows = bytearray()
    for py in range(size):
        cy = py * G // size
        rows.append(0)
        for px in range(size):
            cx = px * G // size
            c = art[cy][cx]
            b = (BAYER[cy & 3][cx & 3] + 0.5) / 16.0 - 0.5
            for i in range(3):
                v = c[i] + b * 4.5
                v = int(round(v / 4.0)) * 4
                rows.append(0 if v < 0 else (255 if v > 255 else v))
    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data
                + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)))
        f.write(chunk(b'IDAT', zlib.compress(bytes(rows), 9)))
        f.write(chunk(b'IEND', b''))
    print('%-34s %4dpx  %6d bytes' % (os.path.relpath(path), size, os.path.getsize(path)))

def main():
    os.makedirs(OUT, exist_ok=True)
    full = paint(1.0)
    # A maskable icon may be cropped to the middle 80%, so the arch's legs are
    # spent and everything that matters sits inside that circle.
    safe = paint(0.78)
    for s in (64, 180, 192, 512):
        png(os.path.join(OUT, 'icon-%d.png' % s), s, full)
    png(os.path.join(OUT, 'icon-maskable-512.png'), 512, safe)

if __name__ == '__main__':
    main()
