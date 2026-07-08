# Troubleshooting — historial de bugs

## WAV no se creaba (solo `loop_sidecar_path.txt`)

**Causa:** Script solo pulsaba C++ save; pulse fallaba silenciosamente; fallback script deshabilitado si existía attr P15.

**Fix:** Save dual; fallback script siempre si hubo capture; C++ sin gate `loopSidecarId >= 1` en save.

---

## WAV corrupto / bloques congelados (plugin, buffer 64)

**Causa:** `Engine.getBufferSize()` = largest block, no real; `Buffer.create(loopTapBlockSize)` con padding; `writeAudioFile` con `g_loopTapSampleRate=0`.

**Fix:** `channels[0].length`; `resolveSidecarSampleRate()`; save primario desde C++ `loopBuf`.

---

## `SF_INFO struct incomplete` / sr=0 en header

**Causa:** `prepareToPlay(0, …)` pisaba `g_loopTapSampleRate`; script `writeAudioFile` con SR 0.

**Fix:** Solo actualizar SR si `sampleRate > 0`; fallback 44100; no sobrescribir WAV C++ en el mismo tick (save deferido).

---

## No re-graba si ya existía WAV

**Causa:** `if (!file.isFile())` saltaba fallback; C++ save fallaba con archivo viejo presente.

**Fix:** IDs nuevos por take; overwrite explícito; label por proyecto.

---

## Proyectos A/B compartían WAV

**Causa:** `LoopSidecarId` fijo en factory XML; `loop_sidecar_path.txt` global.

**Fix:** Label por proyecto; path determinístico por id; sin bridge file.

---

## No carga al reabrir Logic

**Causas múltiples:**

1. C++ `loopSidecarId` miembro en 0 aunque el host restaurara attr → **fix:** `setLoopSidecarId()` antes de load.
2. Pulse load 1→0 mismo frame → **fix:** 0→1 + reset en timer.
3. Init antes de que Logic restaure state → **fix:** boot reload 150 ms + freezerWake 50 ms.
4. Parámetro DSP no persistido bien → **fix final:** **`loopSidecarIdLabel`** con `saveInPreset="1"`.

---

## Checks de consola

| Log | Significado |
|-----|-------------|
| `WARN: LoopSidecarId missing` | DSP network no recompilado |
| `WARN: loopSidecarIdLabel missing` | UI preset sin label |
| `init sidecar id=0` | OK plugin nuevo |
| `new take id=123456789` | Rec asignó id |
| `boot-reload … exists=1` | Load OK |
| `WARN: sidecar missing for id=…` | WAV no en disco o id wrong |

---

## Logic: “no carga” pero exists=1

- ¿Guardaste el proyecto **después** de grabar? (label id persiste en .logicx)
- ¿Play usa loop en RAM vs sidecar? Tras reload, Play debería usar `loopBuf` cargado.
- Borrar WAV manualmente deja id en label → WARN missing (esperado).
