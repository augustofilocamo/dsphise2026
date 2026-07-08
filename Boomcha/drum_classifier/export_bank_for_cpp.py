#!/usr/bin/env python3
"""
Exporta pattern_bank.npz a formato binario .bbank para el motor C++ (Boomcha / HISE).

Formatos:
  v1 — float32 en bruto + un string de ruta por patrón (legacy).
  v2 — uint8 (valor/255) + tabla de rutas únicas + índices (recomendado; motor C++ actual).

Uso:
  python3 export_bank_for_cpp.py pattern_bank.npz -o pattern_bank.bbank
"""
from __future__ import annotations

import argparse
import struct

import numpy as np

MAGIC = b"BCBK"
VERSION_V1 = 1
VERSION_V2 = 2
BANK_SLOTS = 32


def write_string(f, s: str) -> None:
    b = s.encode("utf-8")
    f.write(struct.pack("<I", len(b)))
    f.write(b)


def _load_bank_arrays(npz_path: str):
    bank = np.load(npz_path, allow_pickle=True)
    patterns = bank["patterns"]
    if patterns.ndim != 3:
        raise ValueError(f"patterns must be 3D, got {patterns.shape}")
    n, slots, ch = patterns.shape
    if ch != 2:
        raise ValueError(f"patterns must have 2 channels (BD, SD), got {ch}")
    if slots != BANK_SLOTS:
        raise ValueError(f"expected {BANK_SLOTS} slots, got {slots}")

    meta_paths = bank.get("meta_paths", np.array([]))
    meta_bar_starts = bank.get("meta_bar_starts", np.zeros(n, dtype=np.int32))
    meta_bpm = bank.get("meta_bpm", None)
    meta_ternary = bank.get("meta_ternary", None)

    if len(meta_paths) > 0 and len(meta_paths) != n:
        raise ValueError("meta_paths length must match patterns or be empty")
    if len(meta_bar_starts) != n:
        meta_bar_starts = np.zeros(n, dtype=np.int32)
    if meta_bpm is None:
        meta_bpm = np.full(n, 120.0, dtype=np.float32)
    elif len(meta_bpm) != n:
        meta_bpm = np.full(n, 120.0, dtype=np.float32)
    if meta_ternary is None:
        meta_ternary = np.zeros(n, dtype=np.uint8)
    elif len(meta_ternary) != n:
        meta_ternary = np.zeros(n, dtype=np.uint8)

    return bank, patterns, n, meta_paths, meta_bar_starts, meta_bpm, meta_ternary


def export_npz_v1(npz_path: str, out_path: str) -> None:
    _, patterns, n, meta_paths, meta_bar_starts, meta_bpm, meta_ternary = _load_bank_arrays(
        npz_path
    )

    flat = np.ascontiguousarray(patterns.astype(np.float32))
    with open(out_path, "wb") as f:
        f.write(MAGIC)
        f.write(struct.pack("<II", VERSION_V1, n))
        f.write(flat.tobytes(order="C"))
        f.write(struct.pack("<I", n))
        for i in range(n):
            s = str(meta_paths[i]) if len(meta_paths) > i else ""
            write_string(f, s)
        f.write(np.asarray(meta_bar_starts, dtype=np.int32).tobytes(order="C"))
        f.write(np.asarray(meta_bpm, dtype=np.float32).tobytes(order="C"))
        f.write(np.asarray(meta_ternary, dtype=np.uint8).tobytes(order="C"))

    print(f"Wrote {out_path} (v1, {n} patterns, {BANK_SLOTS} slots)")


def export_npz_v2(npz_path: str, out_path: str) -> None:
    _, patterns, n, meta_paths, meta_bar_starts, meta_bpm, meta_ternary = _load_bank_arrays(
        npz_path
    )

    # Normalized 0..1 -> uint8 (same semantics as float/255.0f on load in C++)
    p = np.clip(patterns.astype(np.float64), 0.0, 1.0)
    u8 = np.round(p * 255.0).astype(np.uint8)
    flat = np.ascontiguousarray(u8)

    path_to_idx: dict[str, int] = {}
    unique: list[str] = []
    indices: list[int] = []
    for i in range(n):
        s = str(meta_paths[i]) if len(meta_paths) > i else ""
        if s not in path_to_idx:
            path_to_idx[s] = len(unique)
            unique.append(s)
        indices.append(path_to_idx[s])

    with open(out_path, "wb") as f:
        f.write(MAGIC)
        f.write(struct.pack("<III", VERSION_V2, n, BANK_SLOTS))
        f.write(flat.tobytes(order="C"))
        f.write(struct.pack("<I", len(unique)))
        for s in unique:
            write_string(f, s)
        for idx in indices:
            f.write(struct.pack("<I", idx))
        f.write(np.asarray(meta_bar_starts, dtype=np.int32).tobytes(order="C"))
        f.write(np.asarray(meta_bpm, dtype=np.float32).tobytes(order="C"))
        f.write(np.asarray(meta_ternary, dtype=np.uint8).tobytes(order="C"))

    print(
        f"Wrote {out_path} (v2, {n} patterns, {BANK_SLOTS} slots, {len(unique)} unique paths)"
    )


def main() -> None:
    p = argparse.ArgumentParser(description="Export NPZ groove bank to .bbank for C++")
    p.add_argument("npz", help="Input .npz")
    p.add_argument("-o", "--output", required=True, help="Output .bbank path")
    p.add_argument(
        "--format",
        type=int,
        choices=(1, 2),
        default=2,
        help="Binary format: 1 float32 legacy, 2 uint8+dedup (default)",
    )
    args = p.parse_args()
    if args.format == 1:
        export_npz_v1(args.npz, args.output)
    else:
        export_npz_v2(args.npz, args.output)


if __name__ == "__main__":
    main()
