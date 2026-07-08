"""
Paso 2: Hash JUCE hashCode64 y pool_items_from_files.
"""
from juce_stream import (
    juce_hash_code64,
    pool_items_from_files,
    build_pool_metadata,
)


def test_hash_deterministic():
    h = juce_hash_code64("foo.mid")
    assert juce_hash_code64("foo.mid") == h
    assert juce_hash_code64("bar.mid") != h
    print("  juce_hash_code64: determinístico ok")


def test_hash_int64_range():
    # Debe caber en int64 (puede ser negativo)
    h = juce_hash_code64("cualquier_string_largo.mid")
    assert -(2**63) <= h < 2**63
    print("  juce_hash_code64: rango int64 ok")


def test_pool_items_from_files():
    entries = [
        ("a.mid", 0, 100),
        ("b.mid", 100, 250),
    ]
    items = pool_items_from_files(entries)
    assert len(items) == 2
    assert items[0][0] == "a.mid" and items[0][2] == 0 and items[0][3] == 100
    assert items[1][0] == "b.mid" and items[1][2] == 100 and items[1][3] == 250
    # HashCode debe ser el de la string
    assert items[0][1] == juce_hash_code64("a.mid")
    assert items[1][1] == juce_hash_code64("b.mid")
    print("  pool_items_from_files: ok")


def test_build_metadata_with_hash():
    entries = [("1_rock_87_beat_4-4_1.midi", 0, 512)]
    items = pool_items_from_files(entries)
    raw = build_pool_metadata(items)
    assert len(raw) > 50
    # Debe contener el ID
    assert b"1_rock" in raw or b"4-4_1" in raw
    print("  build_pool_metadata desde entries: ok, len =", len(raw))


if __name__ == "__main__":
    print("Paso 2 – hashCode64 + pool items:")
    test_hash_deterministic()
    test_hash_int64_range()
    test_pool_items_from_files()
    test_build_metadata_with_hash()
    print("Todo OK.")
