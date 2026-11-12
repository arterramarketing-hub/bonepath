#!/usr/bin/env python3
"""Builds the picture sheets in docs/blender/ from the shots in --out.
    python sheets.py --out DIR      (needs Pillow)"""
import os, sys
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(HERE, 'out')
DOCS = os.path.normpath(os.path.join(HERE, '../../docs/blender'))
os.makedirs(DOCS, exist_ok=True)
BG, INK = (11, 13, 18), (214, 206, 180)


def tile(name, crop=None, scale=1.0):
    p = os.path.join(OUT, name + '.png')
    if not os.path.exists(p):
        im = Image.new('RGB', (160, 160), (40, 20, 20))
        ImageDraw.Draw(im).text((6, 70), 'missing: ' + name, fill=INK)
        return im
    im = Image.open(p).convert('RGB')
    if crop:
        im = im.crop(tuple(int(c * (im.width if i % 2 == 0 else im.height)) for i, c in enumerate(crop)))
    if scale != 1:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.NEAREST)   # nearest: these are pixels, keep them
    return im


def sheet(fname, title, rows, colours=96):
    """rows: [(label, [images])]"""
    pad, lab = 6, 16
    W = max(sum(i.width for i in ims) + pad * (len(ims) + 1) for _, ims in rows)
    H = 26 + sum(max(i.height for i in ims) + lab + pad for _, ims in rows) + pad
    s = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(s)
    d.text((pad, 7), title, fill=INK)
    y = 26
    for label, ims in rows:
        d.text((pad, y + 2), label, fill=INK)
        x = pad
        for i in ims:
            s.paste(i, (x, y + lab))
            x += i.width + pad
        y += max(i.height for i in ims) + lab + pad
    s = s.quantize(colours, method=Image.MEDIANCUT, dither=Image.NONE)
    p = os.path.join(DOCS, fname)
    s.save(p, optimize=True)
    print('%-22s %4dx%-4d %7d bytes' % (fname, W, H, os.path.getsize(p)))


V = ['front', 'q34', 'side', 'back34', 'back']
C = (.33, .06, .67, .94)
sheet('sheet_close.png', 'BONEPATH knight, up close in the real game (648 lines, noon). Top: today. Bottom: the Blender parts on the same rig.',
      [('TODAY  - front, three-quarter, side, back three-quarter, back', [tile('before_close_' + v, C, .62) for v in V]),
       ('BLENDER - the same five', [tile('after_close_' + v, C, .62) for v in V])], 128)
G = (.28, .12, .72, .88)
P4 = ['stand', 'walk', 'swing', 'roll']
sheet('sheet_game.png', 'The real camera at the real 216 lines (each pixel drawn 2x). Standing, walking, mid-swing, mid-roll.',
      [('TODAY', [tile('before_game_' + p, G, 2) for p in P4]), ('BLENDER', [tile('after_game_' + p, G, 2) for p in P4])], 128)
K = (.25, .1, .75, .95)
sheet('sheet_poses.png', 'The game drives the new parts: walk, swing, roll (648 lines), and the pause-screen portrait.',
      [('TODAY', [tile('before_close_' + p, K, .5) for p in P4[1:]] + [tile('before_pause', None, 1.15)]),
       ('BLENDER', [tile('after_close_' + p, K, .5) for p in P4[1:]] + [tile('after_pause', None, 1.15)])], 128)
S2 = (.25, .05, .75, .98)
sheet('sheet_systems.png', 'What else touches the meshes: the snow dress after three rolls in a blizzard, first person, a blow taken, a death.',
      [('TODAY  - snow close, snow at 216 lines, first person, hit, dead',
        [tile('snow_before_close_back34', S2, 1), tile('snow_before_game_stand', G, 1.3), tile('before_game_fps', None, .75), tile('before_game_hit', G, 1.3), tile('before_game_dead', G, 1.3)]),
       ('BLENDER (block inlined)',
        [tile('snow_after_close_back34', S2, 1), tile('snow_after_game_stand', G, 1.3), tile('after_game_fps', None, .75), tile('after_game_hit', G, 1.3), tile('after_game_dead', G, 1.3)]),
       ('BLENDER (swapped onto the untouched game at runtime)',
        [tile('snow_inject_close_back34', S2, 1), tile('snow_inject_game_stand', G, 1.3), tile('inject_game_fps', None, .75), tile('inject_game_hit', G, 1.3), tile('inject_game_dead', G, 1.3)])], 128)
sheet('sheet_blender.png', 'Straight out of Blender (Cycles, CPU): the parts at rest on their pivots, vertex colour x baked AO, no game lighting.',
      [('front, three-quarter, side, back three-quarter, back', [tile('blender_' + v, None, .8) for v in V])], 64)
