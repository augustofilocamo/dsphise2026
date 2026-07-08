"""
Banco de patrones de 2 compases consecutivos (BD+SD): Groove, opcionalmente STAR e IDMT.
Cada patrón = 2 compases → grilla 32 slots (16 por compás), 2 clases. Cuantización a 16 por negra.
Salida: .npz con patterns (N, 32, 2), meta_paths (relativos a la carpeta del .npz por defecto),
meta_bar_starts, meta_bpm, meta_ternary.

Uso:
  python build_groove_pattern_bank.py groove --out groove_pattern_bank.npz
  python build_groove_pattern_bank.py groove --star star_drums_preview --idmt idmt_root --out pattern_bank.npz
  python build_groove_pattern_bank.py --lakh lakh_4 --out pattern_bank_lakh.npz
"""
import os
import argparse
import glob
import warnings
import numpy as np
import pandas as pd
import pretty_midi
import xml.etree.ElementTree as ET

warnings.filterwarnings("ignore", module="pretty_midi")

BARS_PER_PATTERN = 2
SLOTS_PER_BAR = 16
N_SLOTS = BARS_PER_PATTERN * SLOTS_PER_BAR  # 32
N_CLASSES = 2  # BD=0, SD=1
# BD=36; SD = 37 side stick, 38 snare, 39 clap, 40 electric snare → todos a columna SD (1)
NOTE_TO_IDX = {36: 0, 37: 1, 38: 1, 39: 1, 40: 1}
QUANTIZE = 16  # divisiones por negra (semicorcheas = 16)

TERNARY_TIME_SIGS = {"6-8", "3-4", "6/8", "3/4", "12-8", "12/8", "9-8", "9/8"}
TERNARY_STYLE_KEYWORDS = {"shuffle", "swing", "blues"}


def detect_ternary_from_onsets(note_times: list, bpm: float, min_notes: int = 8) -> bool:
    """Detecta si los onsets tienen subdivisión ternaria (triplet/shuffle) comparando
    error de cuantización a grilla binaria (4 subdiv/beat) vs triplet (3 subdiv/beat).
    Retorna True si triplet fit es mejor que binary fit."""
    if len(note_times) < min_notes or bpm <= 0:
        return False
    beat_sec = 60.0 / bpm
    positions = [(t % beat_sec) / beat_sec for t in note_times]
    err_bin = sum(min((p * 4 % 1), 1 - (p * 4 % 1)) ** 2 for p in positions)
    err_tri = sum(min((p * 3 % 1), 1 - (p * 3 % 1)) ** 2 for p in positions)
    return err_tri < err_bin * 0.8


def collect_bd_sd_notes(midi: pretty_midi.PrettyMIDI):
    """Lista (start_sec, idx 0|1, velocity 1-127) de notas BD (36) y SD (37 stick, 38 snare, 39 clap, 40 e-snare)."""
    out = []
    for inst in midi.instruments:
        for n in inst.notes:
            idx = NOTE_TO_IDX.get(n.pitch)
            if idx is not None:
                vel = max(1, min(127, int(getattr(n, "velocity", 127) or 127)))
                out.append((n.start, idx, vel))
    return out


def collect_bd_sd_notes_from_drum_track(midi: pretty_midi.PrettyMIDI):
    """Lista (start_sec, idx 0|1, velocity 1-127) desde pistas de batería (36=BD; 37–40=SD)."""
    out = []
    for inst in midi.instruments:
        if not getattr(inst, "is_drum", False):
            continue
        for n in inst.notes:
            idx = NOTE_TO_IDX.get(n.pitch)
            if idx is not None:
                vel = max(1, min(127, int(getattr(n, "velocity", 127) or 127)))
                out.append((n.start, idx, vel))
    return out


def quantize_time(t: float, bpm: float, divisions_per_beat: int = 16) -> float:
    """Cuantiza t (segundos) a la grilla de divisiones por negra."""
    beat = t * bpm / 60.0
    step = 1.0 / divisions_per_beat
    return round(beat / step) * step * 60.0 / bpm


def events_to_grid(events: list, bpm: float, bar_start: int) -> np.ndarray:
    """Convierte eventos (t_sec, idx 0|1, velocity 1-127) en grilla de 2 compases (32, 2), 16 slots/compás.
    Valor por slot = velocity/127 (máximo si varias notas en el mismo slot). Cuantiza antes."""
    grid = np.zeros((N_SLOTS, N_CLASSES), dtype=np.float32)
    step_sec = (60.0 / bpm) / QUANTIZE if QUANTIZE > 0 else 0.0
    for ev in events:
        if len(ev) >= 3:
            t, idx, vel = ev[0], ev[1], ev[2]
            vel_norm = max(0.0, min(1.0, vel if 0 < vel <= 1 else vel / 127.0))
        else:
            t, idx = ev[0], ev[1]
            vel_norm = 1.0
        if step_sec > 0:
            t = quantize_time(t, bpm, QUANTIZE)
        bar_global = t * bpm / 240.0
        if bar_global < bar_start or bar_global >= bar_start + BARS_PER_PATTERN:
            continue
        bar_rel = bar_global - bar_start
        slot = min(N_SLOTS - 1, int(round(bar_rel * SLOTS_PER_BAR)))
        if 0 <= slot < N_SLOTS and 0 <= idx < N_CLASSES:
            grid[slot, idx] = max(grid[slot, idx], vel_norm)
    return grid


def bpm_from_midi(midi: pretty_midi.PrettyMIDI) -> float:
    """Primer tempo del MIDI o 120."""
    try:
        times, tempos = midi.get_tempo_changes()
        if len(tempos) > 0:
            return float(tempos[0])
    except Exception:
        pass
    return 120.0


def estimate_bpm_from_times(times: list) -> float:
    """Estima BPM desde inter-onset intervals (mediana)."""
    if len(times) < 2:
        return 120.0
    times = sorted(times)
    iois = np.diff(times)
    iois = iois[iois > 0.05]
    if len(iois) == 0:
        return 120.0
    median_ioi = float(np.median(iois))
    if median_ioi <= 0:
        return 120.0
    beat_period = median_ioi if median_ioi > 0.3 else median_ioi * 2
    bpm = 60.0 / beat_period
    return max(60, min(200, bpm))


# STAR: 18 clases -> BD=0, SD=1 (solo esos dos para la grilla)
STAR_BD_SD = {"kick": 0, "bd": 0, "snare": 1, "sd": 1}


def parse_star_bd_sd(ann_path: str) -> list:
    """Devuelve [(t, idx 0|1), ...] solo BD y SD desde anotación STAR."""
    out = []
    for line in open(ann_path, encoding="utf-8", errors="ignore"):
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) < 2:
            continue
        try:
            t = float(parts[0])
            label = (parts[1] or "").strip().lower()
        except (ValueError, IndexError):
            continue
        idx = STAR_BD_SD.get(label)
        if idx is not None:
            out.append((t, idx, 1.0))  # STAR sin velocity → normalizado 1.0
    return out


def find_star_annotation_files(star_root: str) -> list:
    """Rutas a archivos de anotación .txt bajo data/train, data/training, data/validation, data/test."""
    data_dir = os.path.join(star_root, "data")
    if not os.path.isdir(data_dir):
        data_dir = star_root
    out = []
    for split in ("train", "training", "validation", "test"):
        folder = os.path.join(data_dir, split)
        if not os.path.isdir(folder):
            continue
        for path in glob.glob(os.path.join(folder, "**", "annotation", "*.txt"), recursive=True):
            out.append(path)
    return out


def collect_idmt_bd_sd(xml_path: str) -> list:
    """Devuelve [(t, idx 0|1), ...] desde XML IDMT (KD=0, SD=1)."""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    out = []
    trans = root.find("transcription")
    if trans is None:
        return out
    for ev in trans.findall("event"):
        onset_el = ev.find("onsetSec")
        inst_el = ev.find("instrument")
        if onset_el is None or not onset_el.text or inst_el is None or not inst_el.text:
            continue
        try:
            t = float(onset_el.text)
            inst = inst_el.text.strip().upper()
        except ValueError:
            continue
        if inst == "KD":
            out.append((t, 0, 1.0))  # IDMT sin velocity → normalizado 1.0
        elif inst == "SD":
            out.append((t, 1, 1.0))
    return out


def main():
    parser = argparse.ArgumentParser(description="Build 2-bar BD+SD pattern bank from Groove, STAR, IDMT")
    parser.add_argument(
        "groove_roots",
        nargs="*",
        help="Uno o más roots Groove (cada uno es un directorio). Ej. un solo path: e-gmd-v1.0.0/groove (no pasar dos args separados).",
    )
    parser.add_argument("--out", default="groove_pattern_bank.npz", help="Output .npz path")
    parser.add_argument("--info", default="info.csv", help="CSV filename (relative to each groove root); if missing, glob .mid/.midi")
    parser.add_argument("--star", default=None, help="Path to STAR root (data/training, data/test, etc.)")
    parser.add_argument("--idmt", default=None, help="Path to IDMT root (annotation_xml/*.xml)")
    parser.add_argument("--lakh", default=None, help="Path to folder of MIDI files with drum track (e.g. Lakh subset); BD/SD from GM channel 9")
    parser.add_argument(
        "--meta-path-base",
        default=None,
        dest="meta_path_base",
        help="Store meta_paths relative to this folder (default: directory containing --out .npz).",
    )
    args = parser.parse_args()

    out_abs = os.path.abspath(args.out)
    meta_base = os.path.abspath(args.meta_path_base) if args.meta_path_base else os.path.dirname(out_abs)

    def meta_rel(path: str) -> str:
        return os.path.relpath(os.path.abspath(path), meta_base).replace("\\", "/")

    patterns = []
    meta_paths = []
    meta_bar_starts = []
    meta_bpm = []
    meta_ternary = []

    # Resumen de fuentes (STAR/IDMT se procesan después de Groove)
    parts = [f"Groove roots: {', '.join(args.groove_roots)}"]
    if args.star:
        parts.append(f"STAR: {args.star}")
    if args.idmt:
        parts.append(f"IDMT: {args.idmt}")
    if args.lakh:
        parts.append(f"Lakh: {args.lakh}")
    print("Building bank:", " | ".join(parts))
    print(f"meta_paths relative to: {meta_base}")

    # --- Groove (todos los roots sumados) ---
    entries = []
    for groove_root in args.groove_roots:
        groove_root = os.path.abspath(groove_root)
        if not os.path.isdir(groove_root):
            raise FileNotFoundError(groove_root)
        n_before = len(entries)
        info_path = os.path.join(groove_root, args.info)
        if os.path.isfile(info_path):
            df = pd.read_csv(info_path)
            for _, row in df.iterrows():
                midi_fn = row.get("midi_filename")
                if pd.isna(midi_fn) or not isinstance(midi_fn, str):
                    continue
                midi_path = os.path.join(groove_root, midi_fn)
                if not os.path.isfile(midi_path):
                    continue
                bpm = row.get("bpm", 120)
                if pd.isna(bpm):
                    bpm = 120
                try:
                    bpm = float(bpm)
                except (TypeError, ValueError):
                    bpm = 120
                bpm = max(60, min(200, bpm))
                ts = str(row.get("time_signature", "")).strip().lower()
                style = str(row.get("style", "")).strip().lower()
                is_ternary = ts in TERNARY_TIME_SIGS or any(kw in style for kw in TERNARY_STYLE_KEYWORDS)
                entries.append((midi_path, bpm, is_ternary))
            print(f"Groove {groove_root}: {len(entries) - n_before} from {args.info}")
        else:
            mid_paths = sorted(glob.glob(os.path.join(groove_root, "**", "*.mid"), recursive=True))
            mid_paths += sorted(glob.glob(os.path.join(groove_root, "**", "*.midi"), recursive=True))
            for midi_path in mid_paths:
                entries.append((midi_path, None, False))
            print(f"Groove {groove_root}: {len(entries) - n_before} .mid/.midi (BPM from MIDI)")

    if entries:
        for file_idx, (midi_path, bpm_csv, is_ternary) in enumerate(entries):
            if (file_idx + 1) % 2000 == 0:
                print(f"  Groove: {file_idx + 1}/{len(entries)} files, {len(patterns)} patterns so far")
            try:
                midi = pretty_midi.PrettyMIDI(midi_path)
            except Exception as e:
                print(f"  Skip {midi_path}: {e}")
                continue
            events = collect_bd_sd_notes(midi)
            if len(events) < 1:
                continue
            bpm = bpm_csv if bpm_csv is not None else bpm_from_midi(midi)
            times = [e[0] for e in events]
            all_onsets = sorted(n.start for inst in midi.instruments for n in inst.notes)
            file_ternary = detect_ternary_from_onsets(all_onsets, bpm)
            bar_max = max(t * bpm / 240.0 for t in times)
            for bar_start in range(0, max(0, int(bar_max) - BARS_PER_PATTERN + 1)):
                grid = events_to_grid(events, bpm, bar_start)
                if grid.sum() < 1:
                    continue
                patterns.append(grid)
                meta_paths.append(meta_rel(midi_path))
                meta_bar_starts.append(bar_start)
                meta_bpm.append(float(bpm))
                meta_ternary.append(file_ternary)
        n_ternary = sum(1 for t in meta_ternary if t)
        print(f"  Groove total: {len(patterns)} patterns ({n_ternary} ternary)")

    # --- Lakh (MIDI con pista de drums, solo canal percusión GM) ---
    if args.lakh:
        lakh_root = os.path.abspath(args.lakh)
        if not os.path.isdir(lakh_root):
            raise FileNotFoundError(lakh_root)
        lakh_paths = sorted(glob.glob(os.path.join(lakh_root, "**", "*.mid"), recursive=True))
        lakh_paths += sorted(glob.glob(os.path.join(lakh_root, "**", "*.midi"), recursive=True))
        lakh_paths = list(dict.fromkeys(lakh_paths))
        print(f"  Lakh ({args.lakh}): {len(lakh_paths)} .mid/.midi files ...")
        n_lakh_before = len(patterns)
        n_lakh = len(lakh_paths)
        for file_idx, midi_path in enumerate(lakh_paths):
            try:
                midi = pretty_midi.PrettyMIDI(midi_path)
            except Exception:
                continue
            events = collect_bd_sd_notes_from_drum_track(midi)
            if len(events) < 1:
                continue
            # Excluir MIDIs con 1 velocity (plano) o solo 2 (ej. 80 y 127)
            velocities = [e[2] for e in events]
            if len(set(velocities)) <= 2:
                continue
            times = [e[0] for e in events]
            bpm = bpm_from_midi(midi)
            if not (60 <= bpm <= 200):
                bpm = estimate_bpm_from_times(times)
            bpm = max(60, min(200, float(bpm)))
            all_onsets = sorted(n.start for inst in midi.instruments if getattr(inst, "is_drum", False) for n in inst.notes)
            file_ternary = detect_ternary_from_onsets(all_onsets, bpm)
            bar_max = max(t * bpm / 240.0 for t in times)
            for bar_start in range(0, max(0, int(bar_max) - BARS_PER_PATTERN + 1)):
                grid = events_to_grid(events, bpm, bar_start)
                if grid.sum() < 1:
                    continue
                patterns.append(grid)
                meta_paths.append(meta_rel(midi_path))
                meta_bar_starts.append(bar_start)
                meta_bpm.append(float(bpm))
                meta_ternary.append(file_ternary)
            i = file_idx + 1
            pct = 100 * i / n_lakh
            bar_len = 30
            filled = int(bar_len * i / n_lakh)
            bar = "█" * filled + "░" * (bar_len - filled)
            print(f"\r  Lakh: {i:5d} / {n_lakh}  [{bar}]  {pct:5.1f}%  patterns: {len(patterns)}", end="", flush=True)
        print(f"\n  Lakh total: {len(patterns) - n_lakh_before} patterns")

    # --- STAR ---
    if args.star:
        star_root = os.path.abspath(args.star)
        if not os.path.isdir(star_root):
            raise FileNotFoundError(star_root)
        ann_files = find_star_annotation_files(star_root)
        print(f"  STAR ({args.star}): {len(ann_files)} annotation files ...")
        n_star_before = len(patterns)
        for ann_path in ann_files:
            events = parse_star_bd_sd(ann_path)
            if len(events) < 2:
                continue
            times = [e[0] for e in events]
            bpm = estimate_bpm_from_times(times)
            bar_max = max(t * bpm / 240.0 for t in times)
            for bar_start in range(0, max(0, int(bar_max) - BARS_PER_PATTERN + 1)):
                grid = events_to_grid(events, bpm, bar_start)
                if grid.sum() < 1:
                    continue
                patterns.append(grid)
                meta_paths.append(meta_rel(ann_path))
                meta_bar_starts.append(bar_start)
                meta_bpm.append(float(bpm))
                meta_ternary.append(False)
        print(f"  STAR: {len(patterns) - n_star_before} patterns")

    # --- IDMT ---
    if args.idmt:
        idmt_root = os.path.abspath(args.idmt)
        if not os.path.isdir(idmt_root):
            print(f"  IDMT: skip (no such dir: {idmt_root})")
        else:
            ann_dir = os.path.join(idmt_root, "annotation_xml")
            if not os.path.isdir(ann_dir):
                ann_dir = idmt_root
            xml_files = sorted(glob.glob(os.path.join(ann_dir, "*.xml")))
            print(f"  IDMT ({args.idmt}): {len(xml_files)} xml files ...")
            n_idmt_before = len(patterns)
            idmt_bpm = 120.0
            for xml_path in xml_files:
                events = collect_idmt_bd_sd(xml_path)
                if len(events) < 2:
                    continue
                times = [e[0] for e in events]
                bar_max = max(t * idmt_bpm / 240.0 for t in times)
                for bar_start in range(0, max(0, int(bar_max) - BARS_PER_PATTERN + 1)):
                    grid = events_to_grid(events, idmt_bpm, bar_start)
                    if grid.sum() < 1:
                        continue
                    patterns.append(grid)
                    meta_paths.append(meta_rel(xml_path))
                    meta_bar_starts.append(bar_start)
                    meta_bpm.append(idmt_bpm)
                    meta_ternary.append(False)
            print(f"  IDMT: {len(patterns) - n_idmt_before} patterns")

    if not patterns:
        raise RuntimeError("No 2-bar BD+SD patterns. Use groove_roots and/or --star, --idmt, --lakh.")

    patterns = np.stack(patterns, axis=0).astype(np.float32)
    meta_paths = np.array(meta_paths, dtype=object)
    meta_bar_starts = np.array(meta_bar_starts, dtype=np.int32)
    meta_bpm = np.array(meta_bpm, dtype=np.float32)
    meta_ternary = np.array(meta_ternary, dtype=bool)

    np.savez_compressed(
        out_abs,
        patterns=patterns,
        meta_paths=meta_paths,
        meta_bar_starts=meta_bar_starts,
        meta_bpm=meta_bpm,
        meta_ternary=meta_ternary,
        bars_per_pattern=BARS_PER_PATTERN,
        slots_per_bar=SLOTS_PER_BAR,
        n_classes=N_CLASSES,
    )
    n_tern = int(meta_ternary.sum())
    print(f"Saved {len(patterns)} patterns ({n_tern} ternary) to {out_abs}")


if __name__ == "__main__":
    main()
