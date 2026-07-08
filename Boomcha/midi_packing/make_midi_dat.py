"""
Generador de MidiFiles.dat compatible con HISE.

Formato (según HISE PoolBase::DataProvider::writePool):

    int64  metadataSize
    bytes  metadataZstd[metadataSize]
    bytes  concatenación de todos los archivos MIDI en orden

Donde metadataZstd es un ValueTree "PoolData" serializado en binario JUCE y
comprimido con zstd (nivel 19), con hijos "Item" que tienen:
    ID          = nombre/referencia del MIDI
    HashCode    = juce_hash_code64(ID)
    ChunkStart  = offset (en bytes) relativo al principio de la sección de datos
    ChunkEnd    = fin exclusivo (en bytes) relativo a la misma sección.

Uso:
    python3 make_midi_dat.py \
        --src-dir midistest \
        --output MidiFiles.dat

Los IDs en el pool son rutas relativas a la carpeta del producto (por defecto el directorio
donde queda el .dat), con separador `/`, para coincidir con `meta_paths` del pattern bank.
"""

import argparse
import os
import struct
from typing import List, Tuple

from juce_stream import (
    pool_items_from_files,
    build_pool_metadata,
    compress_metadata_zstd,
)


def collect_midi_files(src_dir: str, id_root: str) -> List[Tuple[str, bytes]]:
    """Lista de (ID relativo desde id_root, datos) por cada .mid/.midi bajo src_dir."""
    entries: List[Tuple[str, bytes]] = []
    src_dir = os.path.abspath(src_dir)
    id_root = os.path.abspath(id_root)

    # Orden estable: primero subdirectorios alfabéticamente, luego archivos
    for root, _, files in os.walk(src_dir):
        for name in sorted(files):
            lower = name.lower()
            if not (lower.endswith(".mid") or lower.endswith(".midi")):
                continue
            path = os.path.join(root, name)
            with open(path, "rb") as f:
                data = f.read()

            abs_path = os.path.abspath(path)
            ref = os.path.relpath(abs_path, id_root).replace("\\", "/")

            entries.append((ref, data))

    return entries


def build_pooled_binary(midi_entries: List[Tuple[str, bytes]]) -> bytes:
    """
    Construye el contenido completo de MidiFiles.dat:
    [int64 size][metadata_zstd][midi_data...]
    """
    # Construir sección de datos crudos y offsets
    file_entries: List[Tuple[str, int, int]] = []
    data_buf = bytearray()
    offset = 0

    for ref, data in midi_entries:
        start = offset
        data_buf.extend(data)
        offset += len(data)
        end = offset
        file_entries.append((ref, start, end))

    # Metadata sin comprimir
    items = pool_items_from_files(file_entries)
    raw_metadata = build_pool_metadata(items)

    # Metadata comprimido con zstd
    compressed_metadata = compress_metadata_zstd(bytes(raw_metadata), level=19)
    metadata_size = len(compressed_metadata)

    # Escribir int64 size (little-endian, como OutputStream::writeInt64)
    out = bytearray()
    out.extend(struct.pack("<q", metadata_size))
    out.extend(compressed_metadata)
    out.extend(data_buf)

    return bytes(out)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generar MidiFiles.dat compatible con HISE.")
    parser.add_argument(
        "--src-dir",
        type=str,
        default="midistest",
        help="Directorio con archivos .mid/.midi (por defecto: midistest).",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="MidiFiles.dat",
        help="Ruta de salida del archivo .dat (por defecto: MidiFiles.dat en el cwd).",
    )
    parser.add_argument(
        "--id-root",
        type=str,
        default=None,
        dest="id_root",
        help=(
            "Carpeta base para IDs relativos en el pool (default: directorio de --output, "
            "ej. la raíz del producto con .npz, .dat y CLI)."
        ),
    )

    args = parser.parse_args()

    src_dir = os.path.abspath(args.src_dir)
    if not os.path.isdir(src_dir):
        raise SystemExit(f"Directorio de entrada no existe: {src_dir}")

    out_path = os.path.abspath(args.output)
    id_root = os.path.abspath(args.id_root) if args.id_root else os.path.dirname(out_path)

    midi_entries = collect_midi_files(src_dir, id_root)
    if not midi_entries:
        raise SystemExit(f"No se encontraron .mid/.midi en {src_dir}")

    print(f"Encontrados {len(midi_entries)} archivos MIDI en {src_dir}")
    print(f"Pool IDs relativos a: {id_root}")

    blob = build_pooled_binary(midi_entries)

    with open(out_path, "wb") as f:
        f.write(blob)

    print(f"Escrito {out_path} ({len(blob)} bytes)")


if __name__ == "__main__":
    main()

