#!/usr/bin/env python3
"""
Extract first N Lakh MIDIs → one track of drums only (channel 10).
- Single output track (Format 0); BPM preserved via merge by absolute tick.
- Drops SMPTE and other meta that cause DAW frame-rate dialogs.
"""
import argparse
import glob
import os
import re
import sys

import mido

KEEP_META = frozenset({"set_tempo", "time_signature"})


def collect_paths(src):
    return sorted(
        set(
            glob.glob(os.path.join(src, "**", "*.mid"), recursive=True)
            + glob.glob(os.path.join(src, "**", "*.midi"), recursive=True)
        )
    )


def events_with_absolute_ticks(midi):
    for track in midi.tracks:
        tick = 0
        for msg in track:
            tick += msg.time
            yield (tick, msg)


def keep_message(msg):
    if msg.is_meta:
        return getattr(msg, "type", None) in KEEP_META
    return hasattr(msg, "channel") and msg.channel == 9


def build_single_track(events_sorted):
    track = mido.MidiTrack()
    prev_tick = 0
    for tick, msg in events_sorted:
        delta = tick - prev_tick
        prev_tick = tick
        track.append(msg.copy(time=delta))
    return track


RESUME_STATE = ".resume_state"

def count_existing_outputs(out_dir):
    """Return the max output index already on disk (0 if none)."""
    pattern = re.compile(r"^(\d+)\.midi?$", re.IGNORECASE)
    max_index = 0
    try:
        for name in os.listdir(out_dir):
            m = pattern.match(name)
            if m:
                max_index = max(max_index, int(m.group(1)))
    except OSError:
        pass
    return max_index


def read_resume_state(out_dir):
    """Return (last_output_index, last_input_index_1based) or (0, 0) if missing/invalid."""
    path = os.path.join(out_dir, RESUME_STATE)
    try:
        with open(path) as f:
            line = f.readline()
        parts = line.split()
        if len(parts) >= 2:
            return int(parts[0]), int(parts[1])
    except (OSError, ValueError):
        pass
    return 0, 0


def write_resume_state(out_dir, output_index, input_index_1based):
    path = os.path.join(out_dir, RESUME_STATE)
    try:
        with open(path, "w") as f:
            f.write(f"{output_index} {input_index_1based}\n")
    except OSError:
        pass


def main():
    parser = argparse.ArgumentParser(description="Extract first N Lakh MIDIs → one drum track (ch 10), BPM preserved.")
    parser.add_argument("--src", required=True, help="Input root (eg. lakh_4)")
    parser.add_argument("--out", required=True, help="Output directory")
    parser.add_argument("--limit", type=int, default=10000, help="Max files to consider from sorted list")
    args = parser.parse_args()

    src = os.path.abspath(args.src)
    out = os.path.abspath(args.out)
    limit = max(1, int(args.limit))

    if not os.path.isdir(src):
        print(f"ERROR: src not found: {src}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(out, exist_ok=True)
    already_written = count_existing_outputs(out)
    paths = collect_paths(src)[:limit]
    total = len(paths)

    start_input_1based = 1
    next_output_index = 1
    state_out, state_in = read_resume_state(out)
    if already_written > 0 and state_out == already_written and state_in >= 1 and state_in < total:
        start_input_1based = state_in + 1
        next_output_index = already_written + 1
        print(f"Resuming: {already_written} outputs done, continuing from input {start_input_1based}/{total}, output {next_output_index}", flush=True)
    elif already_written > 0:
        print(f"Resuming: found {already_written} existing output(s), replaying from input 1 to find resume point…", flush=True)

    written = 0
    skipped_parse = 0
    skipped_no_drum = 0
    skipped_write = 0
    paths_to_process = paths[start_input_1based - 1 :]

    for i, path in enumerate(paths_to_process, start_input_1based):
        try:
            midi = mido.MidiFile(path)
        except Exception:
            skipped_parse += 1
            continue

        events = []
        has_drum = False
        for tick, msg in events_with_absolute_ticks(midi):
            if not keep_message(msg):
                continue
            events.append((tick, msg))
            if not msg.is_meta and getattr(msg, "type", None) in ("note_on", "note_off"):
                has_drum = True

        if not has_drum:
            skipped_no_drum += 1
            continue

        # This input produces output file next_output_index; only write if past resume point
        if next_output_index > already_written:
            events.sort(key=lambda x: (x[0], 0 if x[1].is_meta else 1))
            single_track = build_single_track(events)
            out_midi = mido.MidiFile(type=0, ticks_per_beat=midi.ticks_per_beat)
            out_midi.tracks.append(single_track)
            dst = os.path.join(out, f"{next_output_index:06d}.mid")
            try:
                out_midi.save(dst)
                written += 1
                write_resume_state(out, next_output_index, i)
            except Exception:
                skipped_write += 1
        next_output_index += 1

        total_drums = next_output_index - 1
        print(f"\r{i}/{total}  drums={total_drums}", end="", flush=True)

    print()

    print("DONE")
    print(f"input_considered={total}")
    print(f"written_this_run={written}")
    print(f"total_drum_files_now={already_written + written}")
    print(f"skipped_parse={skipped_parse} skipped_no_drum={skipped_no_drum} skipped_write={skipped_write}")
    print(f"output_dir={out}")


if __name__ == "__main__":
    main()