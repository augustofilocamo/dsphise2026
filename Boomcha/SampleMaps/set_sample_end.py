#!/usr/bin/env python3
"""Set SampleEnd in sfz1.xml to (num_samples in each WAV) - 1000."""
import re
import subprocess
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
SAMPLES_ROOT = os.path.join(PROJECT_ROOT, "Samples", "samples")
XML_PATH = os.path.join(SCRIPT_DIR, "sfz1.xml")
MARGIN = 1000


def get_sample_count(wav_path):
    if not os.path.isfile(wav_path):
        return None
    out = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-show_entries", "stream=sample_rate",
            "-of", "default=noprint_wrappers=1",
            wav_path,
        ],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if out.returncode != 0:
        return None
    duration = sample_rate = None
    for line in out.stdout.strip().split("\n"):
        if line.startswith("duration="):
            duration = float(line.split("=")[1])
        elif line.startswith("sample_rate="):
            sample_rate = int(line.split("=")[1])
    if duration is None or sample_rate is None:
        return None
    return int(duration * sample_rate)


def main():
    with open(XML_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Build map: relative path -> SampleEnd value
    pattern = r'FileName="\{PROJECT_FOLDER\}samples/([^"]+\.wav)"'
    unique_rel = list(dict.fromkeys(re.findall(pattern, content)))
    file_to_end = {}
    for rel in unique_rel:
        full = os.path.join(SAMPLES_ROOT, rel)
        n = get_sample_count(full)
        if n is not None:
            file_to_end[rel] = max(0, n - MARGIN)
        else:
            file_to_end[rel] = 0
            print("Warning: could not probe", full, file=__import__("sys").stderr)

    # One pass: track last FileName, replace SampleEnd="" with value for that file
    lines = content.split("\n")
    out_lines = []
    current_end = 0
    for line in lines:
        m = re.search(r'FileName="\{PROJECT_FOLDER\}samples/([^"]+\.wav)"', line)
        if m:
            current_end = file_to_end.get(m.group(1), 0)
        if 'SampleEnd=""' in line:
            line = line.replace('SampleEnd=""', f'SampleEnd="{current_end}"')
        out_lines.append(line)

    with open(XML_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))
    print("Done. SampleEnd set to (samples - 1000) for each WAV.")


if __name__ == "__main__":
    main()
