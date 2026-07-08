#!/usr/bin/env python3
"""Copia los primeros 10000 .mid/.midi de lmd_matched a lmd_matched_100k con nombres únicos."""
import os
import glob

src_dir = os.path.join(os.path.dirname(__file__), "lmd_matched")
dst_dir = os.path.join(os.path.dirname(__file__), "lmd_matched_100k")
os.makedirs(dst_dir, exist_ok=True)

paths = []
for ext in ("*.mid", "*.midi"):
    paths.extend(glob.glob(os.path.join(src_dir, "**", ext), recursive=True))
paths.sort()
paths = paths[:100000]

n = len(paths)
for i, p in enumerate(paths, start=1):
    dst = os.path.join(dst_dir, f"{i:06d}.mid")
    with open(p, "rb") as f:
        data = f.read()
    with open(dst, "wb") as f:
        f.write(data)
    pct = 100 * i / n
    bar_len = 30
    filled = int(bar_len * i / n)
    bar = "█" * filled + "░" * (bar_len - filled)
    print(f"\r  {i:5d} / {n}  [{bar}]  {pct:5.1f}%", end="", flush=True)
print("\nDone:", n, "files in", dst_dir)
