"""
Paso 3: Compresión zstd del metadata.
"""

from juce_stream import (
    pool_items_from_files,
    build_pool_metadata,
    compress_metadata_zstd,
    decompress_metadata_zstd,
)


def test_zstd_roundtrip():
    entries = [
        ("a.mid", 0, 100),
        ("b.mid", 100, 300),
        ("c.mid", 300, 900),
    ]
    items = pool_items_from_files(entries)
    raw = build_pool_metadata(items)
    compressed = compress_metadata_zstd(bytes(raw), level=19)
    assert len(compressed) > 0
    restored = decompress_metadata_zstd(compressed)
    assert restored == bytes(raw)
    print("  zstd roundtrip metadata: ok ({} -> {} bytes)".format(len(raw), len(compressed)))


if __name__ == "__main__":
    print("Paso 3 – compresión zstd del metadata:")
    test_zstd_roundtrip()
    print("Todo OK.")

