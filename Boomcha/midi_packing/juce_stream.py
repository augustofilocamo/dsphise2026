"""
Primitivas binarias compatibles con JUCE (OutputStream / ValueTree / var)
y compresión zstd del metadata del pool, para generar un .dat compatible
con HISE.

Referencias:
- JUCE juce_OutputStream, juce_InputStream
- JUCE juce_ValueTree, juce_Variant
- HISE PoolBase::DataProvider::writePool / restorePool (ExternalFilePool.cpp)
"""

import struct
from typing import BinaryIO, List, Tuple, Union

try:
    import zstandard as zstd
except ImportError:  # pragma: no cover - si falta, se avisa en tiempo de ejecución
    zstd = None

# var type markers (juce_Variant.cpp)
VAR_MARKER_INT = 1
VAR_MARKER_INT64 = 6
VAR_MARKER_STRING = 5


def _as_int64(v: int) -> int:
    """Normaliza a int64 con signo (64 bits)."""
    v = v & 0xFFFFFFFFFFFFFFFF
    return v if v < 0x8000000000000000 else v - 0x10000000000000000


def juce_hash_code64(s: str) -> int:
    """
    Hash 64 bits igual que JUCE String::hashCode64().
    HashGenerator<uint64>: result = 101 * result + codepoint; multiplier = 101.
    Referencia: JUCE juce_String.cpp (HashGenerator, hashCode64).
    """
    result = 0
    for c in s:
        result = (101 * result + ord(c)) & 0xFFFFFFFFFFFFFFFF
    return _as_int64(result)


def write_compressed_int(buf: bytearray, value: int) -> None:
    """JUCE OutputStream::writeCompressedInt. int32, 1-5 bytes."""
    if value == 0:
        buf.append(0)
        return
    un = abs(value) & 0xFFFFFFFF
    chunks = []
    while un:
        chunks.append(un & 0xFF)
        un >>= 8
    n = len(chunks)  # 1-4
    buf.append(n | (0x80 if value < 0 else 0))
    buf.extend(chunks)


def write_string(buf: bytearray, s: str) -> None:
    """JUCE OutputStream::writeString: UTF-8 + null terminator."""
    buf.extend(s.encode("utf-8"))
    buf.append(0)


def write_int32_le(buf: bytearray, value: int) -> None:
    """JUCE OutputStream::writeInt (little-endian)."""
    buf.extend(struct.pack("<i", value & 0xFFFFFFFF))


def write_int64_le(buf: bytearray, value: int) -> None:
    """JUCE OutputStream::writeInt64 (little-endian)."""
    v = value & 0xFFFFFFFFFFFFFFFF
    signed = _as_int64(v)
    buf.extend(struct.pack("<q", signed))


def write_var_int(buf: bytearray, value: int) -> None:
    """JUCE var (int): compressedInt(5), marker, int32 LE."""
    write_compressed_int(buf, 5)
    buf.append(VAR_MARKER_INT)
    write_int32_le(buf, value)


def write_var_int64(buf: bytearray, value: int) -> None:
    """JUCE var (int64): compressedInt(9), marker, int64 LE."""
    write_compressed_int(buf, 9)
    buf.append(VAR_MARKER_INT64)
    write_int64_le(buf, value)


def write_var_string(buf: bytearray, s: str) -> None:
    """JUCE var (string): compressedInt(len+1), marker, UTF-8 + null."""
    payload = s.encode("utf-8") + b"\x00"
    write_compressed_int(buf, 1 + len(payload))
    buf.append(VAR_MARKER_STRING)
    buf.extend(payload)


def write_value_tree(buf: bytearray, tree: "ValueTree") -> None:
    """
    JUCE ValueTree::writeToStream.
    type (string), numProps (compressed), [name, var]*, numChildren (compressed), [child]*.
    """
    write_string(buf, tree.type)
    write_compressed_int(buf, len(tree.properties))
    for name, val in tree.properties.items():
        write_string(buf, name)
        _write_var(buf, val)
    write_compressed_int(buf, len(tree.children))
    for child in tree.children:
        write_value_tree(buf, child)


def _write_var(buf: bytearray, value: Union[int, str]) -> None:
    """Escribe un var (solo int, int64, str para el pool)."""
    if isinstance(value, bool):
        value = int(value)
    if isinstance(value, int):
        # int32 si cabe; si no, int64
        if -0x80000000 <= value <= 0x7FFFFFFF:
            write_var_int(buf, value)
        else:
            write_var_int64(buf, _as_int64(value))
    elif isinstance(value, str):
        write_var_string(buf, value)
    else:
        raise TypeError(f"var type not supported: {type(value)}")


class ValueTree:
    """Árbol tipo JUCE ValueTree: type + propiedades (nombre -> int/int64/str) + hijos."""

    __slots__ = ("type", "properties", "children")

    def __init__(self, type_id: str):
        self.type = type_id
        self.properties = {}  # type: dict
        self.children = []  # type: list

    def set_property(self, name: str, value: Union[int, str]) -> None:
        self.properties[name] = value

    def add_child(self, child: "ValueTree") -> None:
        self.children.append(child)


def pool_items_from_files(
    file_entries: List[Tuple[str, int, int]],
) -> List[Tuple[str, int, int, int]]:
    """
    Convierte (reference_string, chunk_start, chunk_end) en ítems con HashCode.
    reference_string = ID del archivo en el pool (ej. nombre del .mid).
    Devuelve list of (id_str, hash_code, chunk_start, chunk_end) para build_pool_metadata.
    """
    return [
        (ref, juce_hash_code64(ref), start, end)
        for ref, start, end in file_entries
    ]


def build_pool_metadata(
    items: List[Tuple[str, int, int, int]],
) -> bytearray:
    """
    Construye el ValueTree "PoolData" con hijos "Item" (ID, HashCode, ChunkStart, ChunkEnd)
    y lo serializa a bytes (sin comprimir).
    items: list of (id_str, hash_code, chunk_start, chunk_end).
    HashCode y ChunkStart/ChunkEnd se escriben como int64 (como en HISE).
    """
    root = ValueTree("PoolData")
    for id_str, hash_code, chunk_start, chunk_end in items:
        item = ValueTree("Item")
        item.set_property("ID", id_str)
        # HISE usa int64 para HashCode y ChunkStart/ChunkEnd
        item.set_property("HashCode", _as_int64(hash_code))
        item.set_property("ChunkStart", _as_int64(chunk_start))
        item.set_property("ChunkEnd", _as_int64(chunk_end))
        root.add_child(item)
    buf = bytearray()
    write_value_tree(buf, root)
    return buf


def compress_metadata_zstd(raw_metadata: bytes, level: int = 19) -> bytes:
    """
    Comprime el bloque de metadata con zstd, igual que HISE
    (usa zstd::ZDefaultCompressor con nivel alto ~19).
    """
    if zstd is None:
        raise RuntimeError(
            "El módulo 'zstandard' no está instalado. Instálalo con "
            "'python3 -m pip install zstandard' para poder generar .dat."
        )
    compressor = zstd.ZstdCompressor(level=level)
    return compressor.compress(raw_metadata)


def decompress_metadata_zstd(compressed: bytes) -> bytes:
    """Descomprime el bloque de metadata zstd (para tests / depuración)."""
    if zstd is None:
        raise RuntimeError(
            "El módulo 'zstandard' no está instalado. Instálalo con "
            "'python3 -m pip install zstandard' para poder leer metadata."
        )
    decompressor = zstd.ZstdDecompressor()
    return decompressor.decompress(compressed)
