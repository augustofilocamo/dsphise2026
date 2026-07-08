"""
Exporta N compases desde la misma fuente que usó find_closest (para el botón Expand en HISE).
Lee expand_meta.json y escribe *_expanded.mid para cada closest_1bar_*.
"""
import argparse
import json
import os
import sys

# Mismo directorio que find_closest_groove_bar
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from find_closest_groove_bar import (
    export_groove_segment_to_midi,
    export_idmt_segment_to_midi,
    export_star_segment_to_midi,
)


def expand_one(item: dict, n_bars: int) -> str:
    """Exporta n_bars desde item. Devuelve out_path."""
    source_path = item.get("source_path")
    bar_start = int(item.get("bar_start", 0))
    bpm = float(item.get("bpm", 120))
    output_bpm = float(item["output_bpm"]) if "output_bpm" in item else None
    source_type = (item.get("source_type") or "groove").lower()
    mid_path = item.get("mid_path")
    velocity = max(1, min(127, int(item.get("velocity", 100))))

    if not source_path or not os.path.isfile(source_path):
        raise FileNotFoundError(f"Source no encontrado: {source_path}")

    if mid_path:
        base = mid_path
        if base.lower().endswith(".midi"):
            base = base[:-5]
        elif base.lower().endswith(".mid"):
            base = base[:-4]
        out_path = base + "_expanded.mid"
    else:
        out_path = os.path.join(os.path.dirname(os.path.abspath(".")), "closest_1bar_1_expanded.mid")

    if source_type == "groove":
        export_groove_segment_to_midi(
            source_path,
            bar_start,
            n_bars,
            bpm,
            out_path,
            output_bpm=output_bpm,
            apply_bar2_cleanup=False,
        )
    elif source_type == "idmt":
        export_idmt_segment_to_midi(source_path, bar_start, n_bars, bpm, out_path, velocity=velocity, output_bpm=output_bpm)
    elif source_type == "star":
        export_star_segment_to_midi(source_path, bar_start, n_bars, bpm, out_path, velocity=velocity, output_bpm=output_bpm)
    else:
        raise ValueError(f"source_type desconocido: {source_type}")

    return out_path


def main():
    parser = argparse.ArgumentParser(description="Exporta 8 compases por cada closest_1bar_* (Expand)")
    parser.add_argument("--meta", default=None, help="Path a expand_meta.json (default: expand_meta.json en cwd o junto al script)")
    parser.add_argument("--bars", type=int, default=8, help="Número de compases a exportar (default: 8)")
    args = parser.parse_args()

    meta_path = args.meta
    if not meta_path:
        for candidate in (os.path.join(os.getcwd(), "expand_meta.json"), os.path.join(SCRIPT_DIR, "expand_meta.json")):
            if os.path.isfile(candidate):
                meta_path = candidate
                break
    if not meta_path or not os.path.isfile(meta_path):
        print("expand_meta.json no encontrado. Ejecutá find_closest_groove_bar antes (export full).", file=sys.stderr)
        return 1

    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    # Lista de exports (todos los closest_1bar_*) o formato legacy (un solo objeto)
    if "exports" in meta:
        items = meta["exports"]
    else:
        items = [meta]

    n_bars = max(1, min(64, args.bars))
    ok = 0
    for item in items:
        try:
            out_path = expand_one(item, n_bars)
            print(out_path)
            ok += 1
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
