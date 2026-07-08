#!/usr/bin/env python3
"""
Redistribute velocity bands in HISE samplemap XML (sfz1.xml) **per instrument**:
- 0–50: exactly 3 bands (low resolution).
- 50–127: remaining bands equidistant (linear).

Samples are grouped by (LoKey, HiKey). Within each group, band index is determined
by the order of (LoVel, HiVel); that index is mapped to the new velocity range.
Only LoVel/HiVel attributes are modified.
"""

import re
import sys
from pathlib import Path
from collections import defaultdict


VEL_MIN = 0
VEL_MAX = 127
LOW_THRESH = 50
NUM_LOW_BANDS = 3


def get_new_bounds(num_bands: int):
    """Return list of boundaries (length num_bands+1): 3 bands in 0–50, rest equidistant in 50–127."""
    if num_bands <= 0:
        return []
    bounds = []
    # 0–50: 3 bands
    n_low = min(NUM_LOW_BANDS, num_bands)
    for i in range(n_low + 1):
        bounds.append(int(round(LOW_THRESH * i / NUM_LOW_BANDS)))
    if bounds:
        bounds[-1] = LOW_THRESH
    # 50–127: rest equidistant
    n_high = num_bands - n_low
    if n_high > 0:
        step = (VEL_MAX - LOW_THRESH) / n_high
        for i in range(1, n_high):
            v = int(round(LOW_THRESH + step * i))
            bounds.append(max(LOW_THRESH, min(VEL_MAX, v)))
        bounds.append(VEL_MAX)
    return bounds


def main():
    script_dir = Path(__file__).resolve().parent
    xml_path = script_dir / "sfz1.xml"
    if not xml_path.exists():
        print(f"Not found: {xml_path}", file=sys.stderr)
        sys.exit(1)

    text = xml_path.read_text(encoding="utf-8")
    lines = text.split("\n")

    # Match first line of sample: has LoVel, HiVel. Second line has LoKey, HiKey.
    sample_first = re.compile(r'^\s*<sample\s[^>]*LoVel="(\d+)"\s+HiVel="(\d+)"([^>]*)>?\s*$')
    sample_second = re.compile(r'^[^>]*LoKey="(\d+)"\s+HiKey="(\d+)"')

    # Collect (line_index, lo, hi, lokey, hikey) for each sample first line
    samples = []
    i = 0
    while i < len(lines):
        m1 = sample_first.match(lines[i])
        if m1 and i + 1 < len(lines):
            m2 = sample_second.search(lines[i + 1])
            if m2:
                lo, hi = int(m1.group(1)), int(m1.group(2))
                lokey, hikey = int(m2.group(1)), int(m2.group(2))
                samples.append((i, lo, hi, lokey, hikey))
        i += 1

    # Group by (LoKey, HiKey); within each group, unique (LoVel, HiVel) sorted → band index
    key_to_pairs = defaultdict(list)
    for _, lo, hi, lokey, hikey in samples:
        key_to_pairs[(lokey, hikey)].append((lo, hi))
    key_to_band_index = {}
    key_to_new_bands = {}
    for key, pairs in key_to_pairs.items():
        unique = sorted(set(pairs), key=lambda x: (x[0], x[1]))
        key_to_band_index[key] = dict(zip(unique, range(len(unique))))
        n = len(unique)
        bounds = get_new_bounds(n)
        new_bands = [(bounds[i], bounds[i + 1]) for i in range(n)] if len(bounds) > 1 else [(0, 127)]
        key_to_new_bands[key] = new_bands

    # Build (lokey, hikey, lo, hi) -> (new_lo, new_hi)
    def new_vel(lokey, hikey, lo, hi):
        key = (lokey, hikey)
        idx = key_to_band_index.get(key, {}).get((lo, hi))
        bands = key_to_new_bands.get(key, [])
        if idx is not None and idx < len(bands):
            return bands[idx]
        return (lo, hi)

    # Replace each sample first line
    for line_idx, lo, hi, lokey, hikey in samples:
        nlo, nhi = new_vel(lokey, hikey, lo, hi)
        line = lines[line_idx]
        lines[line_idx] = re.sub(
            r'LoVel="\d+"\s+HiVel="\d+"',
            f'LoVel="{nlo}" HiVel="{nhi}"',
            line,
            count=1,
        )

    new_text = "\n".join(lines)
    backup = xml_path.with_suffix(".xml.bak")
    backup.write_bytes(xml_path.read_bytes())
    xml_path.write_text(new_text, encoding="utf-8")

    # Report
    n_instr = len(key_to_pairs)
    print(f"Instruments (LoKey, HiKey): {n_instr}. Each: 0–{LOW_THRESH} in 3 bands, then {LOW_THRESH}–{VEL_MAX} equidistant.")
    example = next(iter(key_to_new_bands.items()))
    print(f"Example key {example[0]}: {len(example[1])} bands; first 3 = {example[1][:3]}, last 2 = {example[1][-2:]}")
    print(f"Backup: {backup}")
    print(f"Updated: {xml_path}")


if __name__ == "__main__":
    main()
