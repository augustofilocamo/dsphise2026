"""
Construye el dataset desde STAR Drums (preview o full).
Anotaciones: .txt tab-separated (timestamp, clase 18, velocity).
Audio: .flac o .wav en audio/original_drum/ con nombre {id}_original_drum.flac
  (id = nombre del .txt hasta "_mix_", ej. ismir_0443_mix_stadium_kit_full.txt -> ismir_0443).
Salida: mismo formato que build_idmt (50 ms, log-mel, multi-label 3 clases BD/SD/HH).

Estructura esperada bajo star_root/data/:
  training/ o train/  -> split train
  validation/         -> split validation
  test/               -> split test
  <split>/<subfolder>/annotation/*.txt
  <split>/<subfolder>/audio/original_drum/<id>_original_drum.flac (o .wav)
"""
import os
import argparse
import json
import glob
import numpy as np
import librosa

N_LABELS = 3
SR = 44100
WINDOW_SEC = 0.05
N_MELS = 64
HOP_LENGTH = 512
N_FFT = 2048
FMIN = 20
FMAX = SR // 2

# 18 clases STAR -> 0=Kick, 1=Snare, 2=Hat (solo BD/SD/HH; el resto se ignora o mapea)
STAR_CLASS_TO_IDX = {
    "kick": 0, "bd": 0, "bass drum": 0, "bass": 0,
    "snare": 1, "sd": 1, "sn": 1,
    "hi-hat": 2, "hihat": 2, "hh": 2, "chh": 2, "phh": 2, "ohh": 2,
    "closed hi-hat": 2, "open hi-hat": 2, "pedal hi-hat": 2,
}


def _star_class_to_idx(label: str):
    key = (label or "").strip().lower()
    return STAR_CLASS_TO_IDX.get(key)


def parse_star_annotation(ann_path: str):
    """Lee anotación STAR: timestamp (seg), clase, velocity. Tab. Devuelve [(t, idx 0-2, vel_norm), ...]."""
    events = []
    for line in open(ann_path, encoding="utf-8", errors="ignore"):
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) < 2:
            continue
        try:
            t = float(parts[0])
            label = parts[1].strip()
            vel = float(parts[2]) / 127.0 if len(parts) > 2 else 1.0
        except (ValueError, IndexError):
            continue
        idx = _star_class_to_idx(label)
        if idx is not None:
            events.append((t, idx, vel))
    return events


def find_star_audio_for_annotation(ann_path: str, star_root: str) -> str:
    """
    Dado .../data/<split>/<subfolder>/annotation/ismir_0443_mix_stadium_kit_full.txt
    busca .../data/<split>/<subfolder>/audio/original_drum/ismir_0443_original_drum.flac o .wav
    """
    base = os.path.splitext(os.path.basename(ann_path))[0]
    if "_mix_" in base:
        id_part = base.split("_mix_")[0]
    else:
        id_part = base
    # ann_path = .../annotation/file.txt -> parent = .../subfolder
    ann_dir = os.path.dirname(ann_path)
    parent = os.path.dirname(ann_dir)  # .../ismir04
    audio_dir = os.path.join(parent, "audio", "original_drum")
    for ext in (".flac", ".wav"):
        path = os.path.join(audio_dir, id_part + "_original_drum" + ext)
        if os.path.isfile(path):
            return path
    return ""


def extract_logmel(audio: np.ndarray, sr: int, start_sample: int, length_samples: int) -> np.ndarray:
    segment = np.zeros(length_samples, dtype=np.float32)
    end = min(start_sample + length_samples, len(audio))
    segment[: end - start_sample] = audio[start_sample:end]
    peak = np.max(np.abs(segment)) + 1e-9
    segment = segment / peak
    mel = librosa.feature.melspectrogram(
        y=segment, sr=sr, n_fft=N_FFT, hop_length=HOP_LENGTH,
        n_mels=N_MELS, fmin=FMIN, fmax=FMAX,
    )
    logmel = librosa.power_to_db(mel + 1e-9, ref=np.max)
    return logmel.mean(axis=1).astype(np.float32)


def find_max_energy_start(audio: np.ndarray, onset_sample: int, length_samples: int, context_samples: int) -> int:
    seg_start = max(0, onset_sample - context_samples)
    seg_end = min(len(audio), onset_sample + length_samples + context_samples)
    segment = audio[seg_start:seg_end].astype(np.float64)
    if len(segment) < length_samples:
        return max(0, onset_sample)
    best_start = 0
    best_rms = np.sqrt(np.mean(segment[:length_samples] ** 2))
    for i in range(1, len(segment) - length_samples + 1):
        rms = np.sqrt(np.mean(segment[i : i + length_samples] ** 2))
        if rms > best_rms:
            best_rms, best_start = rms, i
    return seg_start + best_start


def multi_hot_for_window(events: list, window_start: float, window_end: float) -> np.ndarray:
    y = np.zeros(N_LABELS, dtype=np.float32)
    for t, idx, _ in events:
        if window_start <= t < window_end and idx is not None and 0 <= idx < N_LABELS:
            y[idx] = 1.0
    return y


def process_star_file(
    ann_path: str,
    audio_path: str,
    max_energy_window: bool,
    context_sec: float,
):
    """Procesa un par anotación + audio (.flac o .wav). Devuelve (X_list, y_list, vel_list)."""
    events = parse_star_annotation(ann_path)
    if len(events) < 2:
        return [], [], []
    try:
        audio, sr = librosa.load(audio_path, sr=SR, mono=True)
    except Exception as e:
        print(f"  Skip {audio_path}: {e}")
        return [], [], []
    length_samples = int(WINDOW_SEC * sr)
    context_samples = int(context_sec * sr) if max_energy_window else 0
    X_list, y_list, vel_list = [], [], []
    for t, idx, vel in events:
        start_sample = int(t * sr)
        if start_sample < 0 or start_sample >= len(audio):
            continue
        if max_energy_window and context_samples > 0:
            start_sample = find_max_energy_start(audio, start_sample, length_samples, context_samples)
        logmel = extract_logmel(audio, sr, start_sample, length_samples)
        y = multi_hot_for_window(events, t, t + WINDOW_SEC)
        X_list.append(logmel)
        y_list.append(y)
        vel_list.append(vel)
    return X_list, y_list, vel_list


def find_star_annotation_files(star_root: str):
    """Devuelve [(split_name, ann_path), ...]. split_name in (train, validation, test)."""
    data_dir = os.path.join(star_root, "data")
    if not os.path.isdir(data_dir):
        data_dir = star_root
    out = []
    for split_in in ("train", "training", "validation", "test"):
        folder = os.path.join(data_dir, split_in)
        if not os.path.isdir(folder):
            continue
        split_out = "train" if split_in == "training" else split_in
        for path in glob.glob(os.path.join(folder, "**", "annotation", "*.txt"), recursive=True):
            out.append((split_out, path))
        for path in glob.glob(os.path.join(folder, "**", "*.csv"), recursive=True):
            if "annotation" in path or os.path.basename(os.path.dirname(path)) == "annotation":
                out.append((split_out, path))
    return out


def main():
    parser = argparse.ArgumentParser(
        description="Build drum dataset from STAR Drums (annotation .txt + audio .flac/.wav in audio/original_drum/)"
    )
    parser.add_argument("star_root", help="Path to STAR root (e.g. star_drums_preview) with data/training/, data/test/, etc.")
    parser.add_argument("--out", default="dataset_star_built", help="Output directory")
    parser.add_argument("--max-energy-window", action="store_true", help="Ventana 50ms en pico de energía")
    parser.add_argument("--context-sec", type=float, default=0.03, help="Contexto para pico (con --max-energy-window)")
    args = parser.parse_args()

    star_root = os.path.abspath(args.star_root)
    out_dir = os.path.abspath(args.out)
    os.makedirs(out_dir, exist_ok=True)

    listed = find_star_annotation_files(star_root)
    if not listed:
        raise FileNotFoundError(f"No annotation .txt under {star_root}/data/ (train|training|validation|test)")

    by_split = {"train": [], "validation": [], "test": []}
    seen = set()
    for split, ann_path in listed:
        if ann_path in seen:
            continue
        seen.add(ann_path)
        audio_path = find_star_audio_for_annotation(ann_path, star_root)
        if not audio_path or not os.path.isfile(audio_path):
            print(f"  No audio for {os.path.basename(ann_path)} (looked for original_drum .flac/.wav)")
            continue
        if split not in by_split:
            by_split[split] = []
        by_split[split].append((ann_path, audio_path))

    all_X, all_y, all_vel = {}, {}, {}
    for split in ("train", "validation", "test"):
        X_all, y_all, vel_all = [], [], []
        for ann_path, audio_path in by_split.get(split, []):
            X_list, y_list, vel_list = process_star_file(
                ann_path, audio_path,
                args.max_energy_window,
                args.context_sec,
            )
            X_all.extend(X_list)
            y_all.extend(y_list)
            vel_all.extend(vel_list)
        if X_all:
            all_X[split] = np.stack(X_all, axis=0).astype(np.float32)
            all_y[split] = np.stack(y_all, axis=0).astype(np.float32)
            all_vel[split] = np.array(vel_all, dtype=np.float32)
            np.save(os.path.join(out_dir, f"{split}_X.npy"), all_X[split])
            np.save(os.path.join(out_dir, f"{split}_y.npy"), all_y[split])
            np.save(os.path.join(out_dir, f"{split}_vel.npy"), all_vel[split])
            print(f"{split}: {len(vel_all)} samples")

    if not all_X:
        raise RuntimeError("No samples extracted. Check annotation paths and audio/original_drum/*.flac (or .wav).")

    config = {
        "sr": SR,
        "window_sec": WINDOW_SEC,
        "n_mels": N_MELS,
        "n_classes": N_LABELS,
        "multi_label": True,
        "class_names": ["Kick", "Snare", "Hat"],
        "note_map": [36, 38, 42],
        "source": "star_drums",
    }
    if args.max_energy_window:
        config["train_max_energy_window"] = True
        config["train_context_sec"] = args.context_sec
    with open(os.path.join(out_dir, "config.json"), "w") as f:
        json.dump(config, f, indent=2)
    print("Config saved.")


if __name__ == "__main__":
    main()
