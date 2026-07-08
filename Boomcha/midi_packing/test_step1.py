"""
Paso 1: comprobar que las primitivas JUCE escriben bytes correctos.
"""
from juce_stream import (
    write_compressed_int,
    write_string,
    write_var_int,
    write_var_int64,
    write_var_string,
    build_pool_metadata,
    ValueTree,
    write_value_tree,
)


def test_compressed_int():
    buf = bytearray()
    write_compressed_int(buf, 0)
    assert buf == b"\x00"
    buf.clear()
    write_compressed_int(buf, 1)
    assert buf == bytes([1, 1])  # 1 byte value, value=1
    buf.clear()
    write_compressed_int(buf, 255)
    assert buf == bytes([1, 0xFF])
    buf.clear()
    write_compressed_int(buf, 256)
    assert buf == bytes([2, 0, 1])
    buf.clear()
    write_compressed_int(buf, -1)
    assert buf[0] & 0x80
    print("  write_compressed_int: ok")


def test_string():
    buf = bytearray()
    write_string(buf, "PoolData")
    assert buf == b"PoolData\x00"
    write_string(buf, "Item")
    assert buf == b"PoolData\x00Item\x00"
    print("  write_string: ok")


def test_var():
    buf = bytearray()
    write_var_int(buf, 42)
    # compressedInt(5) = 2 bytes, marker 1 byte, int32 4 bytes
    assert len(buf) == 2 + 1 + 4
    buf.clear()
    write_var_int64(buf, 1000)
    # compressedInt(9) = 2 bytes, marker 1 byte, int64 8 bytes
    assert len(buf) == 2 + 1 + 8
    buf.clear()
    write_var_string(buf, "foo.mid")
    assert buf[-1] == 0 and buf[-2] != 0
    print("  write_var_*: ok")


def test_pool_metadata_shape():
    # Un solo ítem de ejemplo
    items = [("test.mid", 12345, 0, 1024)]
    raw = build_pool_metadata(items)
    assert len(raw) > 20
    assert b"PoolData" in raw or raw[:8] == b"PoolData\x00"
    print("  build_pool_metadata (1 item): ok, len =", len(raw))


if __name__ == "__main__":
    print("Paso 1 – primitivas JUCE:")
    test_compressed_int()
    test_string()
    test_var()
    test_pool_metadata_shape()
    print("Todo OK.")
