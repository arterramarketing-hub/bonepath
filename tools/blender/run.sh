#!/bin/sh
# BONEPATH — the Blender pipeline, end to end:  sh tools/blender/run.sh
# Builds the knight in headless Blender, bakes AO, exports knight.block.json,
# photographs today's knight and the new one in the real game, plays each for
# twenty seconds, and rebuilds the picture sheets in docs/blender/.
# index.html is only read. The venv (about 1.1 GB with bpy) lives OUTSIDE the
# repository:  BP_BLENDER_VENV (default ~/.cache/bonepath-blender-venv),
# shots in BP_BLENDER_OUT (default /tmp/bonepath-blender).
set -e
cd "$(dirname "$0")"
VENV="${BP_BLENDER_VENV:-$HOME/.cache/bonepath-blender-venv}"
OUT="${BP_BLENDER_OUT:-/tmp/bonepath-blender}"
mkdir -p "$OUT"
if [ ! -x "$VENV/bin/python" ]; then python3 -m venv "$VENV"; fi
"$VENV/bin/python" -c "import bpy, PIL" 2>/dev/null || "$VENV/bin/pip" install -q bpy pillow
echo "== build, bake, export, render (Blender $("$VENV/bin/python" -c 'import bpy;print(bpy.app.version_string)' 2>/dev/null | tail -1))"
"$VENV/bin/python" build_knight.py --out "$OUT" 2>&1 | grep -v "^Fra:\|DeprecationWarning\|use_nodes\| render  *|"
if [ "$1" = "--model-only" ]; then exit 0; fi
echo "== measure today's rig";            node measure_rig.js > "$OUT/measure.log" 2>&1 && tail -1 "$OUT/measure.log"
for m in none patched inject; do
  echo "== the real game: $m";            node shoot.js --mode=$m --out="$OUT" > "$OUT/shoot_$m.log" 2>&1 || { tail -3 "$OUT/shoot_$m.log"; exit 1; }
  echo "== the real game: $m, in snow";   node shoot.js --mode=$m --wx=snow --out="$OUT" > "$OUT/shoot_${m}_snow.log" 2>&1 || { tail -3 "$OUT/shoot_${m}_snow.log"; exit 1; }
done
echo "== sheets"
"$VENV/bin/python" sheets.py --out "$OUT"
echo "done: docs/blender/*.png, tools/blender/knight.block.json"
