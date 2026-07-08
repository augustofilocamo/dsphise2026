"""
Compara el primer compás del inferido o de la grilla (solo BD y SD, cuantizado) con el
primer compás de cada patrón del banco. Escribe N compases del match como .mid (--bars N, default 1).

--bank puede repetirse: primero principal, luego fallbacks. Si se usa --fallback-if-dist-above D,
cuando la mejor distancia del banco actual sea > D se prueba el siguiente --bank.

Uso con inference:
  python find_closest_groove_bar.py --inference .../inference_output.json --stems .../stems.json --bank pattern_bank.npz

Uso con grilla y fallback (si dist > 1, usar Lakh):
  python find_closest_groove_bar.py --grid .../grid_buttons.json --bank pattern_bank.npz --bank pattern_bank_lakh.npz --fallback-if-dist-above 1 --top 3

Métrica por sílabas BD-SD + repeticiones en el compás (dist = sílabas + repeticiones no matcheadas):
  python find_closest_groove_bar.py --grid .../grid_buttons.json --bank pattern_bank.npz --syllable-match --syllable-size 2 --syllable-start bd --syllable-tol 0 --top 3
"""
import os
import re
import sys
import math
import random
import argparse
import json
import io
import struct
import hashlib
import mmap
from collections import Counter
import xml.etree.ElementTree as ET
import numpy as np
import pretty_midi
import mido

try:
    import zstandard as zstd
except ImportError:  # pragma: no cover
    zstd = None

SLOTS_PER_BAR = 16
BARS_QUERY = 1
QUERY_SLOTS = BARS_QUERY * SLOTS_PER_BAR  # 16 (1 compás)
BANK_SLOTS = 32  # banco guarda 2 compases × 16 slots; comparamos solo el primero
QUANTIZE = 16
OUTPUT_BARS = 4
# Umbral para considerar que los 2 compases del patrón son prácticamente iguales
REPEAT_2BARS_TOL = 1e-6
# BD=36, SD=37,38,39,40; "other" (HH, toms, etc.) = resto (para filtro --hh)
BD_SD_PITCHES = {36, 37, 38, 39, 40}


class MidiFilesDatReader:
    """
    Lector mínimo del formato MidiFiles.dat embebido por HISE (PoolBase).

    Formato:
      int64  metadataSize (little-endian)
      bytes  metadataZstd[metadataSize] (zstd compress, ValueTree "PoolData")
      bytes  midi_data concatenado (chunks crudos, cada MIDI es un .mid estándar)

    Idea:
      - Descomprimir metadata UNA sola vez.
      - Luego, para cada ID, extraer [ChunkStart:ChunkEnd] por slicing del .dat,
        escribiendo ese chunk a un .mid temporal en disco (cache).
    """

    def __init__(self, dat_path: str):
        if zstd is None:
            raise RuntimeError(
                "Falta dependencia 'zstandard'. Instalá con: python3 -m pip install zstandard"
            )

        self.dat_path = dat_path
        self._file = open(dat_path, "rb")
        # Mapear todo el archivo permite slicing eficiente sin leerlo completo a RAM.
        self._mmap = mmap.mmap(self._file.fileno(), 0, access=mmap.ACCESS_READ)

        # Leer cabecera (int64 little-endian)
        header = self._mmap[:8]
        self._metadata_size = struct.unpack("<q", header)[0]
        if self._metadata_size <= 0:
            raise RuntimeError(f"metadataSize inválido en {dat_path}: {self._metadata_size}")

        metadata_start = 8
        metadata_end = metadata_start + self._metadata_size
        metadata_zstd = bytes(self._mmap[metadata_start:metadata_end])
        self._midi_section_offset = metadata_end

        # Descomprimir metadata (una sola vez)
        meta_raw = zstd.ZstdDecompressor().decompress(metadata_zstd)
        self._id_to_offsets = self._parse_pool_data(meta_raw)

    @staticmethod
    def _read_compressed_int(f: io.BytesIO) -> int:
        size_byte = f.read(1)
        if not size_byte:
            raise EOFError("Unexpected EOF while reading compressed int")
        size_byte = size_byte[0]
        if size_byte == 0:
            return 0
        num_bytes = size_byte & 0x7F
        if num_bytes > 4:
            raise ValueError("Invalid compressed int size")
        raw = f.read(num_bytes)
        if len(raw) != num_bytes:
            raise EOFError("Unexpected EOF while reading compressed int payload")
        num = int.from_bytes(raw, "little", signed=False)
        return -num if (size_byte >> 7) else num

    @staticmethod
    def _read_string(f: io.BytesIO) -> str:
        out = bytearray()
        while True:
            b = f.read(1)
            if not b:
                raise EOFError("Unexpected EOF while reading string")
            if b == b"\x00":
                return out.decode("utf-8", errors="replace")
            out += b

    @classmethod
    def _read_var(cls, f: io.BytesIO):
        VAR_MARKER_INT = 1
        VAR_MARKER_INT64 = 6
        VAR_MARKER_STRING = 5

        num_bytes = cls._read_compressed_int(f)
        if num_bytes == 0:
            return None
        marker_b = f.read(1)
        if not marker_b:
            raise EOFError("Unexpected EOF while reading var marker")
        marker = marker_b[0]

        if marker == VAR_MARKER_INT:
            raw = f.read(4)
            if len(raw) != 4:
                raise EOFError("Unexpected EOF while reading int32")
            return struct.unpack("<i", raw)[0]

        if marker == VAR_MARKER_INT64:
            raw = f.read(8)
            if len(raw) != 8:
                raise EOFError("Unexpected EOF while reading int64")
            return struct.unpack("<q", raw)[0]

        if marker == VAR_MARKER_STRING:
            payload_len = num_bytes - 1
            raw = f.read(payload_len)
            if len(raw) != payload_len:
                raise EOFError("Unexpected EOF while reading string payload")
            # JUCE strings incluyen null al final; lo removemos si está.
            if raw.endswith(b"\x00"):
                raw = raw[:-1]
            return raw.decode("utf-8", errors="replace")

        raise ValueError(f"Unsupported var marker {marker} (num_bytes={num_bytes})")

    @classmethod
    def _read_value_tree(cls, f: io.BytesIO):
        type_id = cls._read_string(f)
        if type_id == "":
            return None

        num_props = cls._read_compressed_int(f)
        props = {}
        for _ in range(num_props):
            name = cls._read_string(f)
            props[name] = cls._read_var(f)

        num_children = cls._read_compressed_int(f)
        children = []
        for _ in range(num_children):
            children.append(cls._read_value_tree(f))

        return {"type": type_id, "props": props, "children": children}

    def _parse_pool_data(self, meta_raw: bytes):
        f = io.BytesIO(meta_raw)
        root = self._read_value_tree(f)
        if not root or root.get("type") != "PoolData":
            raise RuntimeError(f"PoolData inválido en {self.dat_path}")

        id_to_offsets = {}
        for child in root.get("children", []):
            if not child or child.get("type") != "Item":
                continue
            props = child.get("props", {})
            id_str = props.get("ID")
            if not isinstance(id_str, str):
                continue
            cs = props.get("ChunkStart")
            ce = props.get("ChunkEnd")
            if not isinstance(cs, int) or not isinstance(ce, int):
                continue
            if ce <= cs:
                continue
            id_to_offsets[id_str] = (cs, ce)

        return id_to_offsets

    def extract_to_cache(self, id_str: str, cache_dir: str):
        """
        Devuelve path a un .mid cacheado o None si no se encuentra el ID.
        """
        if not id_str:
            return None

        entry = self._id_to_offsets.get(id_str)
        alt = None

        # Intentar alternar extensión (por si meta_paths trae .mid vs .midi)
        low = id_str.lower()
        if entry is None:
            if low.endswith(".midi"):
                alt = id_str[:-5] + ".mid"
            elif low.endswith(".mid"):
                alt = id_str[:-4] + ".midi"
            if alt is not None:
                entry = self._id_to_offsets.get(alt)

        if entry is None:
            return None

        cs, ce = entry
        # Nombre cache: basename + hash corto para evitar colisiones
        base = os.path.basename(id_str)
        base_low = base.lower()
        if base_low.endswith(".midi"):
            base = base[:-5] + ".mid"
        elif not base_low.endswith(".mid"):
            base = base + ".mid"

        stem, _ext = os.path.splitext(base)
        h = hashlib.sha1(id_str.encode("utf-8")).hexdigest()[:10]
        out_name = f"{stem}_{h}.mid"
        out_path = os.path.join(cache_dir, out_name)

        if os.path.isfile(out_path):
            return out_path

        abs_start = self._midi_section_offset + cs
        abs_end = self._midi_section_offset + ce
        if abs_start < 0 or abs_end > self._mmap.size():
            return None

        chunk = self._mmap[abs_start:abs_end]
        if not chunk:
            return None

        with open(out_path, "wb") as f:
            f.write(chunk)

        return out_path

    def close(self):
        try:
            self._mmap.close()
        except Exception:
            pass
        try:
            self._file.close()
        except Exception:
            pass


def count_other_hits_in_bar(midi_path: str, bar_start: int, bpm: float) -> int:
    """Cuenta golpes en ese compás que no son BD ni SD. Devuelve -1 si no se puede leer el MIDI."""
    if not midi_path or not os.path.isfile(midi_path):
        return -1
    try:
        midi = pretty_midi.PrettyMIDI(midi_path)
        bar_sec = 4.0 * 60.0 / bpm
        t0 = bar_start * bar_sec
        t1 = t0 + bar_sec
        count = 0
        for inst in midi.instruments:
            if not getattr(inst, "is_drum", False):
                continue
            for n in inst.notes:
                if n.pitch in BD_SD_PITCHES:
                    continue
                if t0 <= n.start < t1:
                    count += 1
        return count
    except Exception:
        return -1


def load_json(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def quantize_time(t_sec: float, bpm: float, divisions_per_beat: int = 16) -> float:
    beat = t_sec * bpm / 60.0
    step = 1.0 / divisions_per_beat
    return round(beat / step) * step * 60.0 / bpm


def _item_to_bd_sd(item: dict) -> list:
    """Extrae notas 36 y 38 del item."""
    notes = item.get("predicted_notes", [])
    if notes:
        return [n for n in notes if n in (36, 38)]
    pc = (item.get("predicted_class") or "").strip().lower()
    if pc in ("kick", "bd", "kd"):
        return [36]
    if pc in ("snare", "sd"):
        return [38]
    return []


def grid_buttons_to_query(grid_data: dict) -> np.ndarray:
    """Convierte grid_buttons.json en grilla (16, 2). Si division=='ternary' o bd/sd tienen 12 elementos,
    mapea 12 slots ternarios → 16 binarios por tiempo (b/16 → t=round(b*12/16)) para comparar con el banco."""
    bd = list(grid_data.get("bd", []) or [])
    sd = list(grid_data.get("sd", []) or [])
    division = grid_data.get("division")
    if division == "ternary" or len(bd) == 12 or len(sd) == 12:
        while len(bd) < 12:
            bd.append(0)
        while len(sd) < 12:
            sd.append(0)
        bd, sd = bd[:12], sd[:12]
        grid = np.zeros((QUERY_SLOTS, 2), dtype=np.float32)
        for b in range(16):
            t = min(11, int(round(b * 12 / 16)))
            grid[b, 0] = 1.0 if (bd[t] and bd[t] != 0) else 0.0
            grid[b, 1] = 1.0 if (sd[t] and sd[t] != 0) else 0.0
        return grid
    while len(bd) < 16:
        bd.append(0)
    while len(sd) < 16:
        sd.append(0)
    bd, sd = bd[:16], sd[:16]
    grid = np.zeros((QUERY_SLOTS, 2), dtype=np.float32)
    for i in range(16):
        grid[i, 0] = 1.0 if (bd[i] and bd[i] != 0) else 0.0
        grid[i, 1] = 1.0 if (sd[i] and sd[i] != 0) else 0.0
    return grid


def inference_first_bar_to_query_grid(data: list, bpm: float) -> np.ndarray:
    """Primer compás del inferido, solo BD y SD, cuantizado → grilla (16, 2)."""
    return inference_first_n_bars_to_query_grid(data, bpm, 1)


def inference_first_n_bars_to_query_grid(data: list, bpm: float, n_bars: int) -> np.ndarray:
    """Primeros n_bars contiguos del inferido, solo BD y SD, cuantizado → grilla (n_bars*16, 2)."""
    n_slots = n_bars * SLOTS_PER_BAR
    grid = np.zeros((n_slots, 2), dtype=np.float32)
    for item in data:
        t = float(item["timestamp"])
        t = quantize_time(t, bpm, QUANTIZE)
        bar_pos = t * bpm / 240.0
        if bar_pos < 0 or bar_pos >= n_bars:
            continue
        notes = _item_to_bd_sd(item)
        if not notes:
            continue
        slot = min(n_slots - 1, int(round(bar_pos * SLOTS_PER_BAR)))
        for note in notes:
            if note == 36:
                grid[slot, 0] = 1.0
            elif note == 38:
                grid[slot, 1] = 1.0
    return grid


def grid_to_events_bd_sd(grid: np.ndarray, bpm: float, velocity: int = 100) -> list:
    """Grilla (N_slots, 2) BD+SD → lista de eventos para inference_output.json (solo 36 y 38). Slots en 1/16 de compás.
    SD en los primeros 4 compases con vel < 80 → random 110-127."""
    n_slots = grid.shape[0]
    bar_sec = 4.0 * 60.0 / bpm
    events = []
    for slot in range(n_slots):
        if grid[slot].sum() == 0:
            continue
        t_sec = (slot / SLOTS_PER_BAR) * bar_sec
        notes = []
        if grid[slot, 0] > 0:
            notes.append(36)
        if grid[slot, 1] > 0:
            notes.append(38)
        if notes:
            vel_norm = velocity / 127.0
            if 38 in notes and slot < 4 * SLOTS_PER_BAR:
                vel_sd = max(1, min(127, int(round(grid[slot, 1] * 127))))
                if vel_sd < 80:
                    vel_norm = random.randint(110, 127) / 127.0
            events.append({
                "timestamp": round(t_sec, 6),
                "predicted_notes": notes,
                "velocity_estimate": vel_norm,
                "class_probs": [1.0, 1.0],
                "confidence_score": 1.0,
            })
    events.sort(key=lambda x: x["timestamp"])
    return events


def grid_to_bd_sd_slots(grid: np.ndarray, thresh: float = 1e-6) -> tuple:
    """De una grilla (N_slots, 2) extrae listas de slots con BD y SD (solo primer compás si N>16)."""
    n = min(grid.shape[0], SLOTS_PER_BAR)
    bd_slots = [i for i in range(n) if grid[i, 0] > thresh]
    sd_slots = [i for i in range(n) if grid[i, 1] > thresh]
    return (bd_slots, sd_slots)


def slots_to_syllables_2(bd_slots: list, sd_slots: list, start_bd: bool = True) -> list:
    """Sílabas de 2 golpes: pares (primer BD, primer SD), (segundo BD, segundo SD), ...
    start_bd=True → intervalo = sd_i - bd_i; start_bd=False → intervalo = bd_i - sd_i.
    Retorna lista de intervalos en slots (un int por sílaba)."""
    n = min(len(bd_slots), len(sd_slots))
    if n == 0:
        return []
    if start_bd:
        return [sd_slots[i] - bd_slots[i] for i in range(n)]
    return [bd_slots[i] - sd_slots[i] for i in range(n)]


def slots_to_syllables_3(bd_slots: list, sd_slots: list, start_bd: bool = True) -> list:
    """Sílabas de 3 golpes: dos intervalos consecutivos (d_i, d_{i+1}) a partir de los pares BD-SD."""
    intervals = slots_to_syllables_2(bd_slots, sd_slots, start_bd)
    return [(intervals[i], intervals[i + 1]) for i in range(len(intervals) - 1)]


def slots_to_syllables_n(bd_slots: list, sd_slots: list, start_bd: bool, n: int) -> list:
    """Sílabas de n golpes (n>=3): (n-1) intervalos consecutivos. Retorna lista de tuplas de longitud n-1."""
    intervals = slots_to_syllables_2(bd_slots, sd_slots, start_bd)
    k = n - 1
    if len(intervals) < k:
        return []
    return [tuple(intervals[i : i + k]) for i in range(len(intervals) - k + 1)]


def syllable_match_score(
    syl_query: list, syl_pattern: list, tol_slots: int = 0, size_2: bool = True
) -> int:
    """Cuenta cuántas sílabas de la query tienen una sílaba coincidente en el patrón (cada una solo una vez).
    size_2: sílabas son ints; si no, son tuplas (d1, d2, ...). Distancia = dentro de tol_slots."""
    if size_2:

        def match(a, b):
            return abs(a - b) <= tol_slots

    else:

        def match(a, b):
            return len(a) == len(b) and all(
                abs(a[j] - b[j]) <= tol_slots for j in range(len(a))
            )

    used = set()
    score = 0
    for q in syl_query:
        for i, p in enumerate(syl_pattern):
            if i not in used and match(q, p):
                score += 1
                used.add(i)
                break
    return score


def syllable_repetition_counts(syllables: list) -> dict:
    """Para cada tipo de sílaba en el compás, cuántas veces aparece. Sílabas pueden ser int (2 golpes) o tuple (3 golpes)."""
    return dict(Counter(syllables))


def repetition_match_score(counts_query: dict, counts_pattern: dict) -> int:
    """Score por coincidencia de repeticiones: por cada tipo de sílaba, suma min(query_count, pattern_count).
    Mayor = mejor (mismo perfil de repeticiones)."""
    all_keys = set(counts_query) | set(counts_pattern)
    return sum(
        min(counts_query.get(t, 0), counts_pattern.get(t, 0)) for t in all_keys
    )


# Roland TD-17 (E-GMD) → General MIDI: hi-hats fuera de rango GM
ROLAND_TO_GM_DRUMS = {22: 42, 26: 46}  # 22=closed hat → 42, 26=open hat → 46


def _remove_bar2_edge_notes(drum, write_bpm, divisions_per_bar=16):
    """Elimina notas problemáticas al final del compás 2 (borde 2→3)."""
    if not drum.notes:
        return
    bar_sec = 4.0 * 60.0 / write_bpm
    bar2_end = 2.0 * bar_sec
    slot = bar_sec / divisions_per_bar
    bar2_last_slot_start = bar2_end - slot
    kept = []
    for n in drum.notes:
        crosses_2_to_3 = (n.start < bar2_end) and (n.end > bar2_end)
        starts_in_last_slot_bar2 = (bar2_last_slot_start <= n.start < bar2_end)
        if crosses_2_to_3 or starts_in_last_slot_bar2:
            continue
        kept.append(n)
    drum.notes = kept
    drum.notes.sort(key=lambda x: (x.start, x.pitch))


def export_groove_segment_to_midi(
    midi_path: str,
    bar_start: int,
    n_bars: int,
    bpm: float,
    path: str,
    output_bpm: float = None,
    apply_bar2_cleanup: bool = True,
) -> None:
    """Extrae n_bars desde bar_start del MIDI Groove. Mapea pitches Roland TD-17 (22, 26) a GM (42, 46).
    Si output_bpm difiere de bpm, re-escala tiempos de bpm a output_bpm."""
    midi = pretty_midi.PrettyMIDI(midi_path)
    bar_sec = 4.0 * 60.0 / bpm
    t0 = bar_start * bar_sec
    t1 = t0 + n_bars * bar_sec
    total_src = n_bars * bar_sec
    write_bpm = output_bpm if output_bpm else bpm
    if abs(write_bpm - bpm) > 0.01:
        scale = bpm / write_bpm
    else:
        scale = 1.0
    out = pretty_midi.PrettyMIDI(initial_tempo=write_bpm)
    out.time_signature_changes.append(pretty_midi.TimeSignature(4, 4, 0.0))
    drum = pretty_midi.Instrument(program=0, is_drum=True)
    for inst in midi.instruments:
        if not getattr(inst, "is_drum", False):
            continue
        for n in inst.notes:
            if n.start >= t1 or n.end <= t0:
                continue
            start = max(0.0, n.start - t0) * scale
            end = min(n.end - t0, total_src) * scale
            if end <= start:
                continue
            pitch = ROLAND_TO_GM_DRUMS.get(n.pitch, n.pitch)
            vel = n.velocity
            in_first_4_bars = start < 4 * (4.0 * 60.0 / write_bpm)
            if pitch in (37, 38, 39, 40) and vel < 80 and in_first_4_bars:
                vel = random.randint(110, 127)
            drum.notes.append(pretty_midi.Note(
                velocity=vel,
                pitch=pitch,
                start=start,
                end=end,
            ))
    if apply_bar2_cleanup:
        _remove_bar2_edge_notes(drum, write_bpm, divisions_per_bar=16)
    out.instruments.append(drum)
    out.write(path)


# IDMT XML: instrument name → MIDI pitch (GM drums). Cualquier otro → 47 (no filtrar).
IDMT_INST_TO_PITCH = {"KD": 36, "SD": 38, "HH": 42}
IDMT_DEFAULT_PITCH = 47

# STAR .txt: label → MIDI pitch (todas las clases, sin filtrar).
STAR_LABEL_TO_PITCH = {
    "BD": 36, "SD": 38, "SS": 37,
    "CHH": 42, "OHH": 46, "PHH": 44,
    "RD": 51, "HT": 48, "MT": 45, "TB": 41,
}
STAR_DEFAULT_PITCH = 47


def export_star_segment_to_midi(
    txt_path: str,
    bar_start: int,
    n_bars: int,
    bpm: float,
    path: str,
    velocity: int = 100,
    output_bpm: float = None,
) -> None:
    """Extrae n_bars desde bar_start del .txt STAR. Re-escala tiempos si output_bpm difiere."""
    bar_sec = 4.0 * 60.0 / bpm
    t0 = bar_start * bar_sec
    t1 = t0 + n_bars * bar_sec
    total_src = n_bars * bar_sec
    if output_bpm and output_bpm != bpm:
        total_dst = n_bars * 4.0 * 60.0 / output_bpm
        scale = total_dst / total_src
        write_bpm = output_bpm
    else:
        scale = 1.0
        write_bpm = bpm
    events = []
    with open(txt_path, encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split("\t")
            if len(parts) < 2:
                continue
            try:
                t = float(parts[0])
                label = (parts[1] or "").strip().upper()
            except (ValueError, IndexError):
                continue
            try:
                vel = max(1, min(127, int(round(float(parts[2]))))) if len(parts) > 2 and parts[2].strip() else velocity
            except (ValueError, TypeError, IndexError):
                vel = velocity
            if t < t0 or t >= t1:
                continue
            pitch = STAR_LABEL_TO_PITCH.get(label, STAR_DEFAULT_PITCH)
            events.append(((t - t0) * scale, pitch, vel))
    events.sort(key=lambda x: x[0])
    midi = pretty_midi.PrettyMIDI(initial_tempo=write_bpm)
    midi.time_signature_changes.append(pretty_midi.TimeSignature(4, 4, 0.0))
    drum = pretty_midi.Instrument(program=0, is_drum=True)
    slot_sec = (4.0 * 60.0 / write_bpm) / SLOTS_PER_BAR
    bar_sec_out = 4.0 * 60.0 / write_bpm
    for t, pitch, vel in events:
        in_first_4_bars = t < 4 * bar_sec_out
        if pitch in (37, 38, 39, 40) and vel < 80 and in_first_4_bars:
            vel = random.randint(110, 127)
        drum.notes.append(pretty_midi.Note(velocity=vel, pitch=pitch, start=t, end=t + slot_sec))
    midi.instruments.append(drum)
    midi.write(path)


def export_idmt_segment_to_midi(
    xml_path: str,
    bar_start: int,
    n_bars: int,
    bpm: float,
    path: str,
    velocity: int = 100,
    output_bpm: float = None,
) -> None:
    """Extrae n_bars desde bar_start del XML IDMT. Re-escala tiempos si output_bpm difiere."""
    write_bpm = output_bpm if (output_bpm and output_bpm != bpm) else bpm
    tree = ET.parse(xml_path)
    root = tree.getroot()
    trans = root.find("transcription")
    if trans is None:
        grid_n_bars_to_midi(np.zeros((n_bars * SLOTS_PER_BAR, 2), dtype=np.float32), n_bars, write_bpm, velocity=velocity, path=path)
        return
    bar_sec = 4.0 * 60.0 / bpm
    t0 = bar_start * bar_sec
    t1 = t0 + n_bars * bar_sec
    total_src = n_bars * bar_sec
    if output_bpm and output_bpm != bpm:
        scale = (n_bars * 4.0 * 60.0 / output_bpm) / total_src
    else:
        scale = 1.0
    events = []
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
        if t < t0 or t >= t1:
            continue
        pitch = IDMT_INST_TO_PITCH.get(inst, IDMT_DEFAULT_PITCH)
        events.append(((t - t0) * scale, pitch))
    events.sort(key=lambda x: x[0])
    midi = pretty_midi.PrettyMIDI(initial_tempo=write_bpm)
    midi.time_signature_changes.append(pretty_midi.TimeSignature(4, 4, 0.0))
    drum = pretty_midi.Instrument(program=0, is_drum=True)
    slot_sec = (4.0 * 60.0 / write_bpm) / SLOTS_PER_BAR
    bar_sec_out = 4.0 * 60.0 / write_bpm
    for t, pitch in events:
        in_first_4_bars = t < 4 * bar_sec_out
        vel = velocity if pitch not in (37, 38, 39, 40) or velocity >= 80 or not in_first_4_bars else random.randint(110, 127)
        drum.notes.append(pretty_midi.Note(velocity=vel, pitch=pitch, start=t, end=t + slot_sec))
    midi.instruments.append(drum)
    midi.write(path)


def grid_buttons_to_midi(grid_data: dict, n_bars: int, bpm: float, velocity: int = 100, path: str = "grid_export.mid") -> None:
    """Escribe .mid desde grid_buttons. Si division=='ternary' o bd/sd tienen 12 elementos → 12 slots/compás; si no, 16."""
    bd = list(grid_data.get("bd", []) or [])
    sd = list(grid_data.get("sd", []) or [])
    division = grid_data.get("division")
    if division == "ternary" or len(bd) == 12 or len(sd) == 12:
        slots_per_bar = 12
    else:
        slots_per_bar = 16
    while len(bd) < slots_per_bar:
        bd.append(0)
    while len(sd) < slots_per_bar:
        sd.append(0)
    bd = bd[:slots_per_bar]
    sd = sd[:slots_per_bar]
    n_slots = n_bars * slots_per_bar
    bar_sec = 4.0 * 60.0 / bpm
    slot_sec = bar_sec / slots_per_bar
    midi = pretty_midi.PrettyMIDI(initial_tempo=bpm)
    midi.time_signature_changes.append(pretty_midi.TimeSignature(4, 4, 0.0))
    drum = pretty_midi.Instrument(program=0, is_drum=True)
    for bar in range(n_bars):
        for i in range(slots_per_bar):
            slot = bar * slots_per_bar + i
            v_bd = 1 if (bd[i] and bd[i] != 0) else 0
            v_sd = 1 if (sd[i] and sd[i] != 0) else 0
            start = slot * slot_sec
            end = start + slot_sec
            if v_bd:
                drum.notes.append(pretty_midi.Note(velocity=velocity, pitch=36, start=start, end=end))
            if v_sd:
                drum.notes.append(pretty_midi.Note(velocity=velocity, pitch=38, start=start, end=end))
    midi.instruments.append(drum)
    midi.write(path)


# Índices de la grilla: 0 = BD (36), 1 = SD (38); mismo orden que el banco (NOTE_TO_IDX)
GRID_BD = 0
GRID_SD = 1
GRID_NOTE = {GRID_BD: 36, GRID_SD: 38}
GRID_THRESH = 1e-6  # umbral para considerar golpe (evita perder SD/BD con valores float pequeños)


def grid_n_bars_to_midi(grid: np.ndarray, n_bars: int, bpm: float, velocity: int = 100, path: str = "closest.mid") -> None:
    """Escribe grilla (n_bars*16, 2) como .mid: columna 0 = BD (36), columna 1 = SD (38)."""
    n_slots = n_bars * SLOTS_PER_BAR
    bar_sec = 4.0 * 60.0 / bpm
    slot_sec = bar_sec / SLOTS_PER_BAR
    midi = pretty_midi.PrettyMIDI(initial_tempo=bpm)
    midi.time_signature_changes.append(pretty_midi.TimeSignature(4, 4, 0.0))
    drum = pretty_midi.Instrument(program=0, is_drum=True)
    for slot in range(min(grid.shape[0], n_slots)):
        start = slot * slot_sec
        end = start + slot_sec
        if grid[slot, GRID_BD] > GRID_THRESH:
            drum.notes.append(pretty_midi.Note(velocity=velocity, pitch=GRID_NOTE[GRID_BD], start=start, end=end))
        if grid[slot, GRID_SD] > GRID_THRESH:
            vel_sd = max(1, min(127, int(round(grid[slot, GRID_SD] * 127))))
            if vel_sd < 80 and slot < 4 * SLOTS_PER_BAR:
                vel_sd = random.randint(110, 127)
            drum.notes.append(pretty_midi.Note(velocity=vel_sd, pitch=GRID_NOTE[GRID_SD], start=start, end=end))
    midi.instruments.append(drum)
    midi.write(path)


SLOTS_TERNARY = 12


def grid_16_to_12(grid_16: np.ndarray, n_bars: int) -> np.ndarray:
    """Requantiza grilla (n_bars*16, 2) → (n_bars*12, 2). Ternario slot t = tiempo [t/12,(t+1)/12) → binarios b_lo..b_hi-1; hit si alguno > thresh."""
    out = np.zeros((n_bars * SLOTS_TERNARY, 2), dtype=np.float32)
    for bar in range(n_bars):
        for t in range(SLOTS_TERNARY):
            b_lo = int(4 * t / 3)
            b_hi = min(16, int(math.ceil(4 * (t + 1) / 3)))
            base = bar * 16
            for col in (0, 1):
                chunk = grid_16[base + b_lo : base + b_hi, col]
                if chunk.size > 0:
                    out[bar * SLOTS_TERNARY + t, col] = float(np.max(chunk)) if np.any(chunk > GRID_THRESH) else 0.0
    return out


def grid_n_bars_to_midi_ternary(grid_16: np.ndarray, n_bars: int, bpm: float, velocity: int = 100, path: str = "closest.mid") -> None:
    """Escribe grilla 16 slots (n_bars*16, 2) requantizada a 12 slots como .mid ternario."""
    grid_12 = grid_16_to_12(grid_16, n_bars)
    bar_sec = 4.0 * 60.0 / bpm
    slot_sec = bar_sec / SLOTS_TERNARY
    midi = pretty_midi.PrettyMIDI(initial_tempo=bpm)
    midi.time_signature_changes.append(pretty_midi.TimeSignature(4, 4, 0.0))
    drum = pretty_midi.Instrument(program=0, is_drum=True)
    for slot in range(grid_12.shape[0]):
        start = slot * slot_sec
        end = start + slot_sec
        if grid_12[slot, GRID_BD] > GRID_THRESH:
            drum.notes.append(pretty_midi.Note(velocity=velocity, pitch=GRID_NOTE[GRID_BD], start=start, end=end))
        if grid_12[slot, GRID_SD] > GRID_THRESH:
            vel_sd = max(1, min(127, int(round(grid_12[slot, GRID_SD] * 127))))
            if vel_sd < 80 and slot < 4 * SLOTS_TERNARY:
                vel_sd = random.randint(110, 127)
            drum.notes.append(pretty_midi.Note(velocity=vel_sd, pitch=GRID_NOTE[GRID_SD], start=start, end=end))
    midi.instruments.append(drum)
    midi.write(path)


def quantize_midi_ternary(midi_path: str) -> None:
    """Cuantiza un .mid in-place a grilla 1/8 triplete (3 subdivisiones por beat) usando mido (ticks)."""
    mid = mido.MidiFile(midi_path)
    ticks_per_slot = round(mid.ticks_per_beat / 3)
    for track in mid.tracks:
        abs_msgs = []
        tick = 0
        for msg in track:
            tick += msg.time
            abs_msgs.append((tick, msg))
        new_abs = []
        for abs_tick, msg in abs_msgs:
            if msg.type in ("note_on", "note_off"):
                slot = round(abs_tick / ticks_per_slot)
                new_abs.append((slot * ticks_per_slot, msg))
            else:
                new_abs.append((abs_tick, msg))
        new_abs.sort(key=lambda x: x[0])
        track.clear()
        prev = 0
        for abs_tick, msg in new_abs:
            dt = max(0, abs_tick - prev)
            track.append(msg.copy(time=dt))
            prev = abs_tick
    mid.save(midi_path)


def main():
    parser = argparse.ArgumentParser(description="Find closest 1-bar Groove pattern (BD+SD) to first bar of inference or to grid_buttons.json")
    parser.add_argument("--inference", default=None, help="Path to inference_output.json (omit if using --grid)")
    parser.add_argument("--stems", default=None, help="Path to stems.json for BPM (omit if using --grid)")
    parser.add_argument("--grid", default=None, metavar="PATH", help="Ruta a grid_buttons.json (ej. ../AudioFiles/stems/current/grid_buttons.json)")
    parser.add_argument("--bank", action="append", dest="banks", metavar="PATH", help="Pattern bank .npz (puede repetirse: primero principal, luego fallbacks en orden)")
    parser.add_argument("--fallback-if-dist-above", type=float, default=None, metavar="D", help="Del primer banco solo dist<=D; si faltan para --top, completar con bancos siguientes (ej. 1.0)")
    parser.add_argument("--top", type=int, default=3, help="Export N matches (default: 3)")
    parser.add_argument("--out", default=None, help="Output JSON path (optional; solo 1er match)")
    parser.add_argument("--mid", default=None, help="Output .mid base path (default: drum_classifier/closest_1bar_1.mid, _2, _3...)")
    parser.add_argument("--velocity", type=int, default=100, help="Velocity for output notes (1-127)")
    parser.add_argument("--velocity-weight", action="store_true", dest="velocity_weight", help="Ponderar por velocity del bank en la distancia (golpes fuertes pesan más)")
    parser.add_argument("--sd-only", action="store_true", dest="sd_only", help="Comparar solo columna SD (snare); ignorar BD en la búsqueda")
    parser.add_argument("--hit-margin-ms", type=float, default=0, metavar="MS", help="Margen humano en ms (ej. 20): cuenta golpes que coinciden dentro del margen; distancia = query_hits - matched (0 = todos matchean)")
    parser.add_argument("--syllable-match", action="store_true", dest="syllable_match", help="Métrica por sílabas BD-SD: pares/tríos de golpes, distancia = sílabas no matcheadas (0 = mejor)")
    parser.add_argument("--syllable-size", type=int, default=2, choices=[2, 3, 4, 5], metavar="N", help="Tamaño de sílaba: 2 a 5 golpes (default: 2)")
    parser.add_argument("--syllable-start", default="bd", choices=["bd", "sd"], help="Primer golpe de la sílaba: bd o sd (default: bd)")
    parser.add_argument("--syllable-tol", type=int, default=0, metavar="SLOTS", help="Tolerancia en slots para matchear sílabas (default: 0)")
    parser.add_argument("--debug", action="store_true", help="Imprime query y primer match (1/16) para revisar comparación")
    parser.add_argument("--bars", type=int, default=1, metavar="N", help="Número de compases a exportar desde cada match (default: 1)")
    parser.add_argument("--compare-bars", type=int, default=1, choices=[1, 2], metavar="N", help="Comparar sobre N compases para el match (1 o 2; default: 1)")
    ternary_group = parser.add_mutually_exclusive_group()
    ternary_group.add_argument("--ternary", action="store_true", help="Query ternaria: busca el binario más parecido y entrega .mid cuantizado a 12 slots/compás")
    ternary_group.add_argument("--binary", action="store_true", dest="no_ternary", help="Excluir ternarios (solo binarios 4/4 straight)")
    parser.add_argument("--hh", action="store_true", help="Solo resultados cuyo compás tenga actividad HH/otros (varios golpes que no sean BD/SD)")
    parser.add_argument("--hh-min", type=int, default=5, metavar="N", dest="hh_min", help="Con --hh: mínimo de golpes no-BD/SD en el compás (default: 5)")
    parser.add_argument(
        "--repeat-2bars",
        action="store_true",
        dest="repeat_2bars",
        help="Filtrar patrones cuyo compás 1 y 2 sean prácticamente iguales (loop de 2 compases).",
    )
    parser.add_argument("--json", action="store_true", help="Print single JSON line to stdout for HISE (index, distance, meta_bpm, matches with mid_path).")
    parser.add_argument("--output-dir", default=None, dest="output_dir", help="Output directory for .mid files (default: same as --grid dir or script dir).")
    args = parser.parse_args()

    if not args.banks:
        args.banks = ["groove_pattern_bank.npz"]
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # --- MidiFiles.dat estricto (cero plan B) ---
    # Nota:
    # - Cuando corre como binario PyInstaller, `sys.argv[0]` suele apuntar al ejecutable
    #   en la raíz del repo (dejando `MidiFiles*.dat` al lado del binario).
    # - Cuando corre como `.py` (python3 drum_classifier/find_closest_groove_bar.py),
    #   `sys.argv[0]` cae dentro de `drum_classifier/`, así que el repo root es el
    #   parent de ese dir.
    argv0_abs = os.path.abspath(sys.argv[0])
    argv0_dir = os.path.dirname(argv0_abs)
    project_root_dir = argv0_dir
    if argv0_abs.endswith(".py") or os.path.basename(argv0_dir) == "drum_classifier":
        project_root_dir = os.path.abspath(os.path.join(argv0_dir, ".."))

    cache_dir = os.path.join(project_root_dir, ".midi_cache")

    egmd_dat_path = os.path.join(project_root_dir, "MidiFiles.dat")
    lakh_dat_path = os.path.join(project_root_dir, "MidiFiles01.dat")

    if not os.path.isfile(egmd_dat_path):
        raise SystemExit(f"Missing required ./MidiFiles.dat (expected at: {egmd_dat_path})")
    if not os.path.isfile(lakh_dat_path):
        raise SystemExit(f"Missing required ./MidiFiles01.dat (expected at: {lakh_dat_path})")

    midi_dat_reader_egmd = MidiFilesDatReader(egmd_dat_path)
    midi_dat_reader_lakh = MidiFilesDatReader(lakh_dat_path)

    os.makedirs(cache_dir, exist_ok=True)
    if not args.json:
        print(
            "Interface: Loaded MidiFiles.dat+MidiFiles01.dat "
            f"(egmd={egmd_dat_path}, lakh={lakh_dat_path}, cache_dir={cache_dir})"
        )

    def reader_for_bank(bank_path_used: str):
        # Solo para el banco específico: pattern_bank01.npz (antes: pattern_bank_lakh_74k_groovified.npz)
        if bank_path_used and "pattern_bank01.npz" in os.path.basename(bank_path_used):
            return midi_dat_reader_lakh
        return midi_dat_reader_egmd

    def normalize_pool_id(s: str) -> str:
        """ID del pool / meta_path: separador unificado para match con MidiFiles*.dat."""
        return str(s).replace("\\", "/")

    def disk_path_if_exists(path_str: str):
        """
        Si el MIDI existe en disco, devuelve ruta absoluta; si no, None.
        - Rutas absolutas (banks viejos): se prueban tal cual.
        - Rutas relativas: se resuelven contra project_root_dir (./ del producto).
        """
        pid = normalize_pool_id(path_str)
        if not pid:
            return None
        if os.path.isabs(pid):
            p = os.path.abspath(pid)
            return p if os.path.isfile(p) else None
        cand = os.path.normpath(os.path.join(project_root_dir, pid))
        return cand if os.path.isfile(cand) else None

    def resolve_midi_path_from_dat(path_str: str, bank_path_used: str) -> str:
        """
        Resuelve path de MIDI usando SOLO el dat correcto:
          - MidiFiles.dat     para egmd
          - MidiFiles01.dat  para pattern_bank01.npz

        meta_paths en el .npz deben coincidir con los IDs del .dat (típicamente relativos a ./).

        Si no está en disco y tampoco está dentro del dat: falla (cero plan B).
        """
        if not path_str:
            raise FileNotFoundError("Empty midi id/path")
        pid = normalize_pool_id(path_str)
        disk = disk_path_if_exists(pid)
        if disk:
            return disk

        reader = reader_for_bank(bank_path_used)
        cached = reader.extract_to_cache(pid, cache_dir)
        if cached is None or not os.path.isfile(cached):
            dat_name = "MidiFiles01.dat" if reader is midi_dat_reader_lakh else "MidiFiles.dat"
            raise FileNotFoundError(f"MIDI id not found in {dat_name}: {pid}")
        return cached

    bank_paths = []
    for p in args.banks:
        ap = os.path.abspath(p)
        if not os.path.isfile(ap):
            ap = os.path.join(script_dir, p)
        if not os.path.isfile(ap) and p.endswith(".npz") and "lakh10" in p and "lakh10k" not in p:
            alt = p.replace("lakh10.npz", "lakh10k.npz")
            ap_alt = os.path.join(script_dir, alt)
            if os.path.isfile(ap_alt):
                ap = ap_alt
        if not os.path.isfile(ap):
            raise FileNotFoundError(f"Bank not found: {p}. Run build_groove_pattern_bank.py first.")
        bank_paths.append(ap)

    current_dir = None  # carpeta del grid para guardar expand_meta ahí
    if args.grid is not None:
        if not args.grid:
            raise ValueError("--grid requiere la ruta al archivo, ej. --grid ../AudioFiles/stems/current/grid_buttons.json")
        grid_path = os.path.abspath(args.grid)
        if not os.path.isfile(grid_path):
            raise FileNotFoundError(f"grid_buttons.json no encontrado: {grid_path}")
        current_dir = os.path.dirname(grid_path)
        grid_data = load_json(grid_path)
        bpm = float(grid_data.get("bpm", 120))
        if bpm < 40 or bpm > 300:
            bpm = 120.0
        query = grid_buttons_to_query(grid_data)
    else:
        if not args.inference or not args.stems:
            raise ValueError("Use --inference and --stems, or --grid (path to grid_buttons.json)")
        inference_path = os.path.abspath(args.inference)
        stems_path = os.path.abspath(args.stems)
        current_dir = os.path.dirname(stems_path)
        if not os.path.isfile(inference_path):
            raise FileNotFoundError(inference_path)
        if not os.path.isfile(stems_path):
            raise FileNotFoundError(stems_path)
        data = load_json(inference_path)
        if not data or not isinstance(data, list):
            raise ValueError("inference_output.json must be a list")
        stems_data = load_json(stems_path)
        bpm = float(stems_data.get("bpm", 120))
        if bpm < 40 or bpm > 300:
            bpm = 120.0
        query = inference_first_bar_to_query_grid(data, bpm)

    compare_bars = max(1, min(2, getattr(args, "compare_bars", 1)))
    compare_slots = SLOTS_PER_BAR * compare_bars
    if compare_bars == 2:
        if args.grid is not None:
            # Grid solo tiene 1 compás: repetir para comparar 2
            query = np.tile(query, (2, 1)).astype(np.float32)
        else:
            # Inference: 2 compases contiguos desde el audio
            query = inference_first_n_bars_to_query_grid(data, bpm, 2)

    velocity = max(1, min(127, args.velocity))

    # Comparar sobre compare_slots (16 o 32 según --compare-bars)
    sd_only = args.sd_only
    if sd_only:
        query_flat = np.asarray(query[:, 1].flatten(), dtype=np.float32)
        base_flat = np.ones(compare_slots, dtype=np.float32)
    else:
        query_flat = query.flatten()
        base_flat = np.array([1.0, 5.0] * compare_slots, dtype=np.float32)
    vel_weight_alpha = 1.0 if args.velocity_weight else 0.0  # 1 = ponderar por velocity
    repeat_2bars_only = bool(getattr(args, "repeat_2bars", False))
    BIN_THRESH = 1e-6  # umbral para binarizar en --sd-only (dist=0 = misma máscara SD)
    hit_margin_ms = max(0.0, float(args.hit_margin_ms))
    # Margen en slots: 1 slot = 15/bpm segundos; margin_slots >= 1 si usuario pide margen humano
    slot_sec = (4.0 * 60.0 / bpm) / SLOTS_PER_BAR if bpm > 0 else 0.125
    margin_slots = max(1, int(round(hit_margin_ms / 1000.0 / slot_sec))) if hit_margin_ms > 0 else 0

    def source_key(path_str):
        base = os.path.basename(path_str) if path_str else ""
        if not base:
            return base
        base = re.sub(r"_\d+\.(midi?)$", r".\1", base, flags=re.IGNORECASE)
        base = re.sub(r"\.midi$", ".mid", base, flags=re.IGNORECASE)
        return base

    fallback_threshold = args.fallback_if_dist_above
    n_top = max(1, args.top)

    def load_bank_and_top(bank_path: str, use_sd_only: bool, max_best: int = None):
        bank = np.load(bank_path, allow_pickle=True)
        patterns = bank["patterns"]
        meta_paths = bank.get("meta_paths", np.array([]))
        meta_bar_starts = bank.get("meta_bar_starts", np.array([]))
        meta_bpm = bank.get("meta_bpm", None)
        meta_ternary_arr = bank.get("meta_ternary", None)
        # Máscara de patrones cuyo compás 1 y compás 2 son (casi) idénticos
        first_bar = patterns[:, :SLOTS_PER_BAR, :]
        second_bar = patterns[:, SLOTS_PER_BAR: 2 * SLOTS_PER_BAR, :]
        diff = np.abs(first_bar - second_bar)
        repeat_2bars_mask = (diff.sum(axis=(1, 2)) <= REPEAT_2BARS_TOL)
        if patterns.ndim != 3 or patterns.shape[1] != BANK_SLOTS or patterns.shape[2] != 2:
            raise ValueError(f"Bank must be (N, {BANK_SLOTS}, 2), got {patterns.shape}. Rebuild with build_groove_pattern_bank.py.")
        # Con --ternary buscamos el binario más parecido y exportamos cuantizado a ternario; no filtrar por meta_ternary.
        if args.no_ternary and meta_ternary_arr is not None and len(meta_ternary_arr) == len(patterns):
            mask = ~meta_ternary_arr.astype(bool)
            if mask.any():
                idx_map = np.where(mask)[0]
                patterns = patterns[mask]
                meta_paths = meta_paths[idx_map] if len(meta_paths) > 0 else meta_paths
                meta_bar_starts = meta_bar_starts[idx_map] if len(meta_bar_starts) > 0 else meta_bar_starts
                meta_bpm = meta_bpm[idx_map] if meta_bpm is not None and len(meta_bpm) > 0 else meta_bpm
                meta_ternary_arr = meta_ternary_arr[idx_map]
                repeat_2bars_mask = repeat_2bars_mask[mask]
        n = max(1, min(max_best if max_best is not None else n_top, len(patterns)))
        patterns_compare = patterns[:, :compare_slots, :]
        syllable_n_query, syllable_scores = None, None
        if getattr(args, "syllable_match", False):
            # Métrica por sílabas BD-SD + repeticiones en el compás: dist = sílabas no matcheadas + repeticiones no matcheadas
            bd_q, sd_q = grid_to_bd_sd_slots(query, BIN_THRESH)
            start_bd = (getattr(args, "syllable_start", "bd") or "bd").lower() == "bd"
            sz = max(2, min(5, getattr(args, "syllable_size", 2)))
            tol = max(0, int(getattr(args, "syllable_tol", 0)))
            if sz == 2:
                query_syllables = slots_to_syllables_2(bd_q, sd_q, start_bd)
            elif sz == 3:
                query_syllables = slots_to_syllables_3(bd_q, sd_q, start_bd)
            else:
                query_syllables = slots_to_syllables_n(bd_q, sd_q, start_bd, sz)
            n_q = len(query_syllables)
            counts_query = syllable_repetition_counts(query_syllables)
            syllable_scores = np.zeros(len(patterns), dtype=np.int_)
            dist = np.zeros(len(patterns), dtype=np.float64)
            for i in range(len(patterns)):
                g = patterns_compare[i]
                bd_p, sd_p = grid_to_bd_sd_slots(g, BIN_THRESH)
                if sz == 2:
                    pat_syllables = slots_to_syllables_2(bd_p, sd_p, start_bd)
                elif sz == 3:
                    pat_syllables = slots_to_syllables_3(bd_p, sd_p, start_bd)
                else:
                    pat_syllables = slots_to_syllables_n(bd_p, sd_p, start_bd, sz)
                score = syllable_match_score(
                    query_syllables, pat_syllables, tol, size_2=(sz == 2)
                )
                syllable_scores[i] = score
                counts_pat = syllable_repetition_counts(pat_syllables)
                rep_score = repetition_match_score(counts_query, counts_pat)
                # dist = (sílabas no matcheadas) + (repeticiones no matcheadas); 0 = mejor
                if n_q > 0:
                    dist[i] = (n_q - score) + (n_q - rep_score)
                else:
                    # Query tiene 0 sílabas (ej. --syllable-size 5 con pocos pares BD-SD): todos empatan en dist=0
                    dist[i] = 0.0
            syllable_n_query, syllable_scores = n_q, syllable_scores
        elif margin_slots > 0:
            # Métrica "golpes que coinciden dentro del margen": distancia = query_hits - matched (menor = mejor)
            if use_sd_only:
                q_bin = (query_flat > BIN_THRESH).astype(np.float32)
                p_bin = (patterns_compare[:, :, 1] > BIN_THRESH).astype(np.float32)
                query_hits = np.where(q_bin > 0.5)[0]
                matched = np.zeros(len(patterns), dtype=np.float64)
                for q in query_hits:
                    lo, hi = max(0, q - margin_slots), min(compare_slots, q + margin_slots + 1)
                    matched += (p_bin[:, lo:hi].any(axis=1)).astype(np.float64)
                n_hits = len(query_hits)
                dist = (n_hits - matched) if n_hits > 0 else np.zeros(len(patterns), dtype=np.float64)
            else:
                q_flat = (query_flat > BIN_THRESH).astype(np.float32)
                p_flat = (patterns_compare.reshape(len(patterns), -1) > BIN_THRESH).astype(np.float32)
                matched = np.zeros(len(patterns), dtype=np.float64)
                for col_start, col_step in [(0, 2), (1, 2)]:
                    for slot in range(compare_slots):
                        idx = col_start + slot * col_step
                        if q_flat[idx] <= 0.5:
                            continue
                        lo, hi = max(0, slot - margin_slots), min(compare_slots, slot + margin_slots + 1)
                        pat_slots = np.arange(lo, hi) * col_step + col_start
                        matched += (p_flat[:, pat_slots].any(axis=1)).astype(np.float64)
                n_hits = int((q_flat > 0.5).sum())
                dist = (n_hits - matched) if n_hits > 0 else np.zeros(len(patterns), dtype=np.float64)
        elif use_sd_only:
            patterns_flat = patterns_compare[:, :, 1].astype(np.float32)
            q_bin = (query_flat > BIN_THRESH).astype(np.float32)
            p_bin = (patterns_flat > BIN_THRESH).astype(np.float32)
            dist = np.sum((p_bin - q_bin) ** 2, axis=1)
        else:
            # SD match exacto obligatorio; entre esos, priorizar BD match exacto (binario), sino el más cercano por L2
            query_sd_bin = (query[:, 1].flatten() > BIN_THRESH).astype(np.float32)
            pattern_sd_bin = (patterns_compare[:, :, 1] > BIN_THRESH).astype(np.float32)
            sd_exact = np.all(pattern_sd_bin == query_sd_bin[np.newaxis, :], axis=1)
            n_sd_exact = int(np.sum(sd_exact))
            query_bd_flat = np.broadcast_to(query[:, 0].flatten().astype(np.float32), (len(patterns), compare_slots))
            query_bd_bin = (query[:, 0].flatten() > BIN_THRESH).astype(np.float32)
            pattern_bd = patterns_compare[:, :, 0].astype(np.float32)
            pattern_bd_bin = (pattern_bd > BIN_THRESH).astype(np.float32)
            bd_exact = np.all(pattern_bd_bin == query_bd_bin[np.newaxis, :], axis=1)
            if vel_weight_alpha:
                weights_bd = 1.0 + vel_weight_alpha * pattern_bd
            else:
                weights_bd = np.ones_like(pattern_bd)
            dist_bd = np.sum((pattern_bd - query_bd_flat) ** 2 * weights_bd, axis=1)
            if n_sd_exact > 0:
                dist = np.where(sd_exact, np.where(bd_exact, 0.0, dist_bd), np.finfo(np.float64).max)
                sort_dist = np.where(~sd_exact, np.finfo(np.float64).max,
                                     np.where(bd_exact, dist_bd, 1e10 + dist_bd))
                order = np.argsort(sort_dist)
            else:
                patterns_flat = patterns_compare.reshape(len(patterns), -1)
                weights_per_pattern = base_flat * (1.0 + vel_weight_alpha * patterns_flat)
                dist = np.sum((patterns_flat - query_flat) ** 2 * weights_per_pattern, axis=1)
                order = np.argsort(dist)
        best = []
        seen = set()
        for i in order:
            if len(best) >= n:
                break
            if repeat_2bars_only and repeat_2bars_mask is not None:
                if i >= len(repeat_2bars_mask) or not bool(repeat_2bars_mask[i]):
                    continue
            src = str(meta_paths[i]) if i < len(meta_paths) else ""
            key = source_key(src) if src else f"idx_{i}"
            if key not in seen:
                best.append(i)
                seen.add(key)
        out = {
            "path": bank_path,
            "patterns": patterns,
            "meta_paths": meta_paths,
            "meta_bar_starts": meta_bar_starts,
            "meta_bpm": meta_bpm,
            "distances": dist,
            "best_indices": np.array(best, dtype=int),
        }
        if syllable_n_query is not None:
            out["syllable_n_query"] = syllable_n_query
            out["syllable_scores"] = syllable_scores
        return out

    # Multi-bank: intercalar round-robin; si --ternary, solo primer banco (EGMD)
    use_hh = getattr(args, "hh", False)
    hh_min = max(0, int(getattr(args, "hh_min", 5)))
    max_candidates = max(n_top * 25, 200) if use_hh else max(n_top, 20)
    if len(bank_paths) >= 2 and not args.ternary and (getattr(args, "fallback_if_dist_above", None) is None):
        all_banks = [load_bank_and_top(bp, sd_only, max_best=max_candidates) for bp in bank_paths]
        combined = []
        bank_pos = [0] * len(all_banks)
        seen_keys = set()
        while len(combined) < max_candidates:
            added_any = False
            for bi, bdata in enumerate(all_banks):
                if len(combined) >= max_candidates:
                    break
                while bank_pos[bi] < len(bdata["best_indices"]):
                    idx = bdata["best_indices"][bank_pos[bi]]
                    bank_pos[bi] += 1
                    src = str(bdata["meta_paths"][idx]) if idx < len(bdata["meta_paths"]) else ""
                    key = (os.path.basename(src), int(bdata["meta_bar_starts"][idx]) if idx < len(bdata["meta_bar_starts"]) else 0)
                    if key in seen_keys:
                        continue
                    seen_keys.add(key)
                    d = float(bdata["distances"][idx])
                    combined.append((bdata, idx, d))
                    added_any = True
                    break
            if not added_any:
                break
        if use_hh:
            filtered = []
            for bdata, idx, d in combined:
                path = str(bdata["meta_paths"][idx]) if idx < len(bdata["meta_paths"]) else ""
                path = resolve_midi_path_from_dat(path, bdata.get("path", ""))
                bar_start = int(bdata["meta_bar_starts"][idx]) if idx < len(bdata["meta_bar_starts"]) else 0
                bpm = float(bdata["meta_bpm"][idx]) if bdata.get("meta_bpm") is not None and idx < len(bdata["meta_bpm"]) else 120.0
                if count_other_hits_in_bar(path, bar_start, bpm) >= hh_min:
                    filtered.append((bdata, idx, d))
                    if len(filtered) >= n_top:
                        break
            combined = filtered
        else:
            combined = combined[:n_top]
        n_top = len(combined)
        bank_path = None
        patterns = meta_paths = meta_bar_starts = meta_bpm = None
        distances = best_indices = None
        use_combined = True
    elif len(bank_paths) >= 2 and fallback_threshold is not None:
        # Completar con fallback: primer banco solo dist<=D; si faltan para n_top, rellenar con bancos siguientes
        combined = []
        seen_keys = set()
        data0 = load_bank_and_top(bank_paths[0], sd_only, max_best=max_candidates)
        for idx in data0["best_indices"]:
            if len(combined) >= n_top:
                break
            d = float(data0["distances"][idx])
            if d > fallback_threshold:
                continue
            src = str(data0["meta_paths"][idx]) if idx < len(data0["meta_paths"]) else ""
            bar_start = int(data0["meta_bar_starts"][idx]) if idx < len(data0["meta_bar_starts"]) else 0
            key = (os.path.basename(src), bar_start)
            if key in seen_keys:
                continue
            if use_hh and data0.get("meta_paths") is not None:
                path = src
                path = resolve_midi_path_from_dat(path, data0.get("path", bank_paths[0]))
                bpm = float(data0["meta_bpm"][idx]) if data0.get("meta_bpm") is not None and idx < len(data0["meta_bpm"]) else 120.0
                if count_other_hits_in_bar(path, bar_start, bpm) < hh_min:
                    continue
            seen_keys.add(key)
            combined.append((data0, idx, d))
        bank_idx = 1
        while len(combined) < n_top and bank_idx < len(bank_paths):
            data_fb = load_bank_and_top(bank_paths[bank_idx], sd_only, max_best=max_candidates)
            for idx in data_fb["best_indices"]:
                if len(combined) >= n_top:
                    break
                d = float(data_fb["distances"][idx])
                src = str(data_fb["meta_paths"][idx]) if idx < len(data_fb["meta_paths"]) else ""
                bar_start = int(data_fb["meta_bar_starts"][idx]) if idx < len(data_fb["meta_bar_starts"]) else 0
                key = (os.path.basename(src), bar_start)
                if key in seen_keys:
                    continue
                if use_hh and data_fb.get("meta_paths") is not None:
                    path = src
                    path = resolve_midi_path_from_dat(path, data_fb.get("path", bank_paths[bank_idx]))
                    bpm = float(data_fb["meta_bpm"][idx]) if data_fb.get("meta_bpm") is not None and idx < len(data_fb["meta_bpm"]) else 120.0
                    if count_other_hits_in_bar(path, bar_start, bpm) < hh_min:
                        continue
                seen_keys.add(key)
                combined.append((data_fb, idx, d))
            bank_idx += 1
        combined = combined[:n_top]
        n_top = len(combined)
        bank_path = None
        patterns = meta_paths = meta_bar_starts = meta_bpm = None
        distances = best_indices = None
        use_combined = True
    else:
        use_combined = False
        bank_path = None
        patterns = meta_paths = meta_bar_starts = meta_bpm = None
        distances = best_indices = None
        syllable_n_query = syllable_scores = None
        for bank_idx, bank_path in enumerate(bank_paths):
            data = load_bank_and_top(bank_path, sd_only, max_best=max_candidates)
            patterns = data["patterns"]
            meta_paths = data["meta_paths"]
            meta_bar_starts = data["meta_bar_starts"]
            meta_bpm = data["meta_bpm"]
            distances = data["distances"]
            best_indices = data["best_indices"]
            syllable_n_query = data.get("syllable_n_query")
            syllable_scores = data.get("syllable_scores")
            if use_hh and meta_paths is not None and len(meta_paths) > 0:
                filtered_indices = []
                for i in best_indices:
                    path = str(meta_paths[i]) if i < len(meta_paths) else ""
                    path = resolve_midi_path_from_dat(path, bank_path)
                    bar_start = int(meta_bar_starts[i]) if i < len(meta_bar_starts) else 0
                    bpm = float(meta_bpm[i]) if meta_bpm is not None and i < len(meta_bpm) else 120.0
                    if count_other_hits_in_bar(path, bar_start, bpm) >= hh_min:
                        filtered_indices.append(i)
                        if len(filtered_indices) >= n_top:
                            break
                best_indices = np.array(filtered_indices, dtype=int)
            else:
                best_indices = best_indices[:n_top]
            n_top = len(best_indices)
            if n_top == 0:
                if bank_idx + 1 < len(bank_paths):
                    continue
                break
            first_dist = float(distances[best_indices[0]])
            if fallback_threshold is not None and first_dist > fallback_threshold and bank_idx + 1 < len(bank_paths):
                print(f"Best match dist={first_dist:.4f} > {fallback_threshold}, trying fallback: {os.path.basename(bank_paths[bank_idx + 1])}", file=sys.stderr)
                continue
            break

    if args.debug and not use_combined and not getattr(args, "json", False):
        # Con --sd-only la distancia es binaria: exact = solo dist==0 (misma máscara SD)
        exact_mask = (distances == 0) if sd_only else (distances < 1e-5)
        exact = np.where(exact_mask)[0]
        print("-- debug: 1 compás a 1/16 (BD/SD) --")
        if getattr(args, "syllable_match", False):
            bd_q, sd_q = grid_to_bd_sd_slots(query, BIN_THRESH)
            start_bd = (getattr(args, "syllable_start", "bd") or "bd").lower() == "bd"
            sz = max(2, min(5, getattr(args, "syllable_size", 2)))
            if sz == 2:
                q_syl = slots_to_syllables_2(bd_q, sd_q, start_bd)
            elif sz == 3:
                q_syl = slots_to_syllables_3(bd_q, sd_q, start_bd)
            else:
                q_syl = slots_to_syllables_n(bd_q, sd_q, start_bd, sz)
            q_rep = syllable_repetition_counts(q_syl)
            print("(modo --syllable-match: dist = sílabas + repeticiones no matcheadas; size=%d start=%s)" % (sz, "bd" if start_bd else "sd"))
            print("Query syllables:", q_syl, "| repeticiones:", q_rep)
        if sd_only and not getattr(args, "syllable_match", False):
            print("(modo --sd-only: comparación binaria por SD; dist=0 = misma máscara)")
        if margin_slots > 0 and not getattr(args, "syllable_match", False):
            print("(modo --hit-margin-ms: distancia = query_hits - matched, margin=%d slots ~ %.0f ms)" % (margin_slots, margin_slots * slot_sec * 1000))
        print("Query BD:", "".join("x" if query[i, 0] > 0 else "." for i in range(16)))
        print("Query SD:", "".join("x" if query[i, 1] > 0 else "." for i in range(16)))
        print("Exact matches (dist≈0):", len(exact))
        for j in exact[:5]:
            p = str(meta_paths[j]) if j < len(meta_paths) else "?"
            b = int(meta_bar_starts[j]) if j < len(meta_bar_starts) else 0
            print("  ", os.path.basename(p), "bar", b)
        first = best_indices[0]
        match_16 = patterns[first][:SLOTS_PER_BAR]
        print("Top 1 match:")
        print("Match BD:", "".join("x" if match_16[i, 0] > 0 else "." for i in range(16)))
        sd_thresh = BIN_THRESH if sd_only else 0
        print("Match SD:", "".join("x" if match_16[i, 1] > sd_thresh else "." for i in range(16)))
        print("Distancia (L2^2):", float(distances[first]))
        if getattr(args, "syllable_match", False):
            sz = max(2, min(5, getattr(args, "syllable_size", 2)))
            start_bd = (getattr(args, "syllable_start", "bd") or "bd").lower() == "bd"
            match_16 = patterns[first][:SLOTS_PER_BAR]
            bd_p, sd_p = grid_to_bd_sd_slots(match_16, BIN_THRESH)
            if sz == 2:
                p_syl = slots_to_syllables_2(bd_p, sd_p, start_bd)
            elif sz == 3:
                p_syl = slots_to_syllables_3(bd_p, sd_p, start_bd)
            else:
                p_syl = slots_to_syllables_n(bd_p, sd_p, start_bd, sz)
            p_rep = syllable_repetition_counts(p_syl)
            print("Match syllables:", p_syl, "| repeticiones:", p_rep)
    elif args.debug and use_combined and not getattr(args, "json", False):
        print("-- debug: best from first bank, rest from fallback (combined) --", file=sys.stderr)
        for r, (bdata, idx, d) in enumerate(combined):
            print(f"  rank {r+1}: dist={d:.4f} bank={os.path.basename(bdata['path'])}", file=sys.stderr)
        # También mostramos patrón de query y top-1 en formato ..x..x.....x..x.
        print("Query BD:", "".join("x" if query[i, 0] > 0 else "." for i in range(16)))
        print("Query SD:", "".join("x" if query[i, 1] > 0 else "." for i in range(16)))
        if combined:
            bdata, idx0, d0 = combined[0]
            match_16 = bdata["patterns"][idx0][:SLOTS_PER_BAR]
            print("Top 1 match (combined):")
            print("Match BD:", "".join("x" if match_16[i, 0] > 0 else "." for i in range(16)))
            sd_thresh = BIN_THRESH if sd_only else 0
            print("Match SD:", "".join("x" if match_16[i, 1] > sd_thresh else "." for i in range(16)))

    script_dir = os.path.dirname(os.path.abspath(__file__))
    mid_base = args.mid if args.mid else os.path.join(script_dir, "closest_1bar")
    mid_base = os.path.abspath(mid_base)
    if not mid_base.lower().endswith(".mid"):
        base_no_ext = mid_base
    else:
        base_no_ext = os.path.splitext(mid_base)[0]

    out_dir = os.path.dirname(base_no_ext)
    if getattr(args, "output_dir", None):
        out_dir = os.path.abspath(args.output_dir)
        base_no_ext = os.path.join(out_dir, os.path.basename(base_no_ext))
    expand_exports = []  # lista de metadata para expand (todos los closest_1bar_* full)
    json_matches = []  # for --json: list of {index, distance, meta_path, meta_bar_start, meta_bpm, mid_path, mid_path_expand}
    if args.grid is not None:
        grid_mid_path = os.path.join(out_dir, "grid_original.mid")
        grid_buttons_to_midi(grid_data, BARS_QUERY, bpm, velocity=velocity, path=grid_mid_path)

    n_bars_export = max(1, getattr(args, "bars", 1))

    def export_one_rank(rank, bank_path_used, patterns_arr, meta_paths_arr, meta_bar_starts_arr, meta_bpm_arr, idx, dist, syllable_n_query_rank=None, syllable_score_rank=None):
        bank_name = os.path.basename(bank_path_used) if bank_path_used else ""
        mid_path = f"{base_no_ext}_{rank}.mid" if n_top > 1 else (base_no_ext + ".mid")
        midi_path = str(meta_paths_arr[idx]) if len(meta_paths_arr) > idx else None
        bar_start = int(meta_bar_starts_arr[idx]) if len(meta_bar_starts_arr) > idx else 0
        seg_bpm = float(meta_bpm_arr[idx]) if meta_bpm_arr is not None and len(meta_bpm_arr) > idx else bpm
        winner_one_bar = patterns_arr[idx][:SLOTS_PER_BAR].astype(np.float32)
        if midi_path and not os.path.isfile(midi_path):
            midi_path = resolve_midi_path_from_dat(midi_path, bank_path_used)
        if midi_path and os.path.isfile(midi_path) and (midi_path.lower().endswith(".mid") or midi_path.lower().endswith(".midi")):
            export_groove_segment_to_midi(midi_path, bar_start, n_bars_export, seg_bpm, mid_path, output_bpm=bpm)
            export_kind = "full"
        elif midi_path and os.path.isfile(midi_path) and midi_path.lower().endswith(".xml"):
            export_idmt_segment_to_midi(midi_path, bar_start, n_bars_export, seg_bpm, mid_path, velocity=velocity, output_bpm=bpm)
            export_kind = "full (IDMT)"
        elif midi_path and os.path.isfile(midi_path) and (midi_path.lower().endswith(".txt") or ".txt" in midi_path.lower()):
            export_star_segment_to_midi(midi_path, bar_start, n_bars_export, seg_bpm, mid_path, velocity=velocity, output_bpm=bpm)
            export_kind = "full (STAR)"
        else:
            raise RuntimeError(f"Unsupported/missing MIDI source for idx={idx}: {midi_path}")
        if export_kind != "BD+SD only (fallback)" and midi_path and os.path.isfile(midi_path):
            meta_path_abs = os.path.abspath(midi_path)
            source_type = "groove" if (midi_path.lower().endswith(".mid") or midi_path.lower().endswith(".midi")) else ("idmt" if midi_path.lower().endswith(".xml") else "star")
            expand_exports.append({
                "source_path": meta_path_abs,
                "bar_start": bar_start,
                "n_bars": n_bars_export,
                "bpm": seg_bpm,
                "output_bpm": bpm,
                "source_type": source_type,
                "mid_path": os.path.abspath(mid_path),
                "velocity": velocity,
                "query": query.tolist(),
            })
        # Con --ternary: cuantizar el .mid exportado a grilla 1/8 triplete (mido, ticks)
        if args.ternary and os.path.isfile(mid_path):
            quantize_midi_ternary(mid_path)

        mid_path_abs = os.path.abspath(mid_path)
        json_matches.append({
            "index": int(idx),
            "distance": float(dist),
            "meta_bpm": seg_bpm,
            "bank": bank_name,
            "mid_path": mid_path_abs,
            "mid_path_expand": mid_path_abs,
        })
        if not getattr(args, "json", False):
            src_name = os.path.basename(str(meta_paths_arr[idx])) if midi_path and idx < len(meta_paths_arr) else ""
            if syllable_n_query_rank is not None and syllable_score_rank is not None:
                print(f"dist={dist:.4f} bank={bank_name} file={src_name} syl={syllable_score_rank}/{syllable_n_query_rank}")
            else:
                print(f"dist={dist:.4f} bank={bank_name} file={src_name}")

    if use_combined:
        for rank, (bdata, idx, dist) in enumerate(combined, start=1):
            sq = bdata.get("syllable_n_query")
            ss = int(bdata["syllable_scores"][idx]) if bdata.get("syllable_scores") is not None and idx < len(bdata["syllable_scores"]) else None
            export_one_rank(rank, bdata["path"], bdata["patterns"], bdata["meta_paths"], bdata["meta_bar_starts"], bdata["meta_bpm"], idx, dist, syllable_n_query_rank=sq, syllable_score_rank=ss)
    else:
        bank_name = os.path.basename(bank_path) if bank_path else ""
        for rank, idx in enumerate(best_indices, start=1):
            dist = float(distances[idx])
            sq = syllable_n_query
            ss = int(syllable_scores[idx]) if syllable_scores is not None and idx < len(syllable_scores) else None
            export_one_rank(rank, bank_path, patterns, meta_paths, meta_bar_starts, meta_bpm, idx, dist, syllable_n_query_rank=sq, syllable_score_rank=ss)

    if expand_exports:
        expand_meta_path = os.path.join(out_dir, "expand_meta.json")
        expand_meta_path = os.path.abspath(expand_meta_path)
        payload = {"exports": expand_exports}
        with open(expand_meta_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        # Copiar también a la carpeta de stems.json (current) para que HISE lo vea
        if current_dir and os.path.isdir(current_dir) and os.path.abspath(current_dir) != os.path.abspath(out_dir):
            try:
                current_meta = os.path.join(current_dir, "expand_meta.json")
                with open(current_meta, "w", encoding="utf-8") as f:
                    json.dump(payload, f, indent=2)
            except Exception:
                pass

    if args.out:
        if use_combined:
            bdata, first_idx, _ = combined[0]
            one_bar = bdata["patterns"][first_idx][:SLOTS_PER_BAR]
        else:
            first_idx = best_indices[0]
            one_bar = patterns[first_idx][:SLOTS_PER_BAR]
        output_grid = np.tile(one_bar, (OUTPUT_BARS, 1)).astype(np.float32)
        out_events = grid_to_events_bd_sd(output_grid, bpm, velocity=velocity)
        with open(os.path.abspath(args.out), "w", encoding="utf-8") as f:
            json.dump(out_events, f, indent=2)

    if getattr(args, "json", False) and json_matches:
        first = json_matches[0]
        result = {
            "index": first["index"],
            "distance": first["distance"],
            "meta_bpm": first["meta_bpm"],
            "matches": json_matches,
            "bars": n_bars_export,
        }
        print(json.dumps(result, separators=(",", ":")))

    for _r in (midi_dat_reader_egmd, midi_dat_reader_lakh):
        try:
            _r.close()
        except Exception:
            pass


if __name__ == "__main__":
    main()
