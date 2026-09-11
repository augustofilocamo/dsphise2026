# Semantic_s distro payload

Copy **the contents of this folder** (not the folder name `distro`) into the plugin AppData as `Semantic_s/`.

Dev (HISE project):

```
HISE-project/Semantic_s/
```

Compiled plugin (sibling of `UserPresets`):

```
~/Library/Application Support/Sampleson/Backgrounds/Semantic_s/
```

The script looks up audio and CLAP from `UserPresets/../Semantic_s/`.

## Layout (required)

```
Semantic_s/
  v6_curated/
    v6_*.ogg              # Music Bed
    v6loc_*.ogg           # Location Ambience
  meta_ucs_v6.json
  meta_ucs_v6_locations.json
  index.bin
  text_encoder.onnx       # fp16 weights; I/O stay int64 / float32
  tokenizer/
    vocab.json            # required by CLAP
    merges.txt            # required by CLAP
  libclap_search.dylib
  libonnxruntime.1.17.3.dylib
  libonnxruntime.dylib    # unused duplicate on Mac — do not delete unless asked
  manifest.json
```

Beds and locations load **OGG** from `v6_curated/`. This pack is **v6 + v6_locations only** — no SFX, no FLAC, no `drum_detected_*`.

Do **not** ship SFX metas (`meta_ucs_v6_sfx.json`, per-category files) or legacy v2/v3/v5.

## Not in this folder

- Sound Effects WAVs / `wavs/`
- The compiled plugin / app binary (HISE export)
- Images / UI from the HISE project
- `library/` prompts, RunPod server, Python CLAP indexer

## Rebuild after new audio

From the repo root:

```bash
./library/sync_to_hise.sh
python3 library/clap_index.py --bank v6 --update
python3 library/clap_index.py --bank v6_locations --update
python3 library/export_clap_onnx.py --skip-onnx
./library/pack_semantic_distro.sh
```

OGG and ONNX are hardlinked (no extra disk). Zip this folder when you actually ship.

See `CONTENTS.txt` for the last pack summary.
