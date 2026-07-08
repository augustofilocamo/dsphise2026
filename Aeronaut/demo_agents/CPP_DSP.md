# C++ — `spectral_freeze_node.h`

## Parámetros nuevos (P13–P15)

| P | Nombre | Tipo | Uso |
|---|--------|------|-----|
| 13 | `LoopSidecarId` | 0 … 999999999 | Sufijo de archivo; script escribe vía `setAttribute` |
| 14 | `LoopSidecarLoad` | 0/1 momentáneo | Rising edge → `loadLoopSidecarFile()` |
| 15 | `LoopSidecarSave` | 0/1 momentáneo | Rising edge → `saveLoopSidecarFile()` si `loopLen > 0` |

Default `LoopSidecarId = 0`.

## Path de sidecar

```cpp
// AppData/Sampleson/Aeronaut/AudioFiles/recordings/loop_{id}.wav
getSidecarDirectory() → …/AudioFiles/recordings
getSidecarFile()      → loop_ + (int64)loopSidecarId + .wav
```

Debe coincidir con script:

```javascript
FileSystem.getFolder(FileSystem.AudioFiles).getChildFile("recordings/loop_" + id + ".wav")
```

## Save

- `saveLoopSidecarFile()`: copia `loopBufL/R` → WAV stereo 32-bit float, SR = `currentSampleRate`.
- Se llama en:
  - Rec falling edge (P5), si `loopLen > 0`
  - Tope 10 s de grabación
  - Pulse P15 desde script

## Load

- `loadLoopSidecarFile()`: lee WAV, resamplea linealmente a `currentSampleRate`, llena `loopBuf`, setea `loopLen`.
- Se llama en:
  - Pulse P14 desde script
  - `prepare()` si `loopSidecarId >= 1` (puede correr antes que el script restaure el id — el script reload es la fuente fiable)

## Clear

- `clearLoopBuffer()` **ya no** llama `deleteSidecarFile()` (WAV históricos se conservan).
- `deleteSidecarFile()` sigue existiendo pero no se usa en Clear.

## Requisitos al portar

1. Editar header en `DspNetworks/ThirdParty/`.
2. **Compile DSP network** en HISE (Export → Compile network).
3. Rebuild plugin / AU / VST3.

Sin recompilar, `resolveAttrIdx("LoopSidecarLoad")` devuelve `-1` y el script imprime WARN.
