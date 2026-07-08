# Archivos modificados / añadidos

## C++ / DSP

| Archivo | Cambio |
|---------|--------|
| `DspNetworks/ThirdParty/spectral_freeze_node.h` | Looper sidecar: P13–P15, `saveLoopSidecarFile`, `loadLoopSidecarFile`, path `recordings/`. Clear **no** borra WAV. |

**Recompilar DSP network obligatorio** tras editar el `.h`.

## Scripts compartidos

| Archivo | Cambio |
|---------|--------|
| `Scripts/loopSidecar.js` | **Nuevo.** Toda la lógica sidecar (id label, save/load, timers). |
| `Scripts/ScriptProcessors/Aeronaut/ScriptFXLoopTap.js` | **Nuevo.** Captura dry pre-freeze en `g_loopAccumulator`. |

`loopSidecar.js` vive en `Scripts/` (no dentro de `ScriptProcessors/Aeronaut/`) para poder `include()` desde full y demo.

## Interface full

| Archivo | Cambio |
|---------|--------|
| `Scripts/ScriptProcessors/Aeronaut/Interface.js` | `include("loopSidecar.js")`, hooks rec/host sync, `tickLoopSidecarSavePending`, `onHostAudioReconfigured`, `ScriptFX1HostAudioSyncGen` bridge. |
| `Scripts/ScriptProcessors/Aeronaut/ScriptFX1.js` | Incrementa `ScriptFX1HostAudioSyncGen` en `prepareToPlay`. |

## Interface demo

| Archivo | Estado |
|---------|--------|
| `Scripts/ScriptProcessors/Aeronaut_demo/Interface.js` | `include("Demo.js")` en lugar de `Authorisation.js` |
| `Scripts/Demo.js` | Timer demo compartido — ver [PORT_AERONAUT_DEMO.md](./PORT_AERONAUT_DEMO.md) |

## Preset / UI

| Archivo | Cambio |
|---------|--------|
| `XmlPresetBackups/Aeronaut.xml` | `ScriptFXLoopTap` antes de `HardcodedMasterFX1`; `LoopSidecarId="0.0"`; Control `loopSidecarIdLabel` |
| `XmlPresetBackups/AeronautUIData/AeronautDesktop.xml` | Label oculto `loopSidecarIdLabel` |
| `XmlPresetBackups/Aeronaut_demo.xml` | Tiene `ScriptFXLoopTap`; **sin** LoopSidecar* attrs ni label Control |
| `XmlPresetBackups/Aeronaut_demoUIData/Aeronaut_demoDesktop.xml` | **Sin** `loopSidecarIdLabel` |

## Proyecto

| Archivo | Cambio |
|---------|--------|
| `project_info.xml` | `USE_RELATIVE_PATH_FOR_AUDIO_FILES=1` (macOS/Windows) |

## Copia a otro proyecto

Mínimo para transferir (ej. `~/Desktop/Transfer`):

```
Aeronaut/DspNetworks/ThirdParty/spectral_freeze_node.h
Aeronaut/Scripts/loopSidecar.js
Aeronaut/Scripts/ScriptProcessors/Aeronaut/ScriptFXLoopTap.js
Aeronaut/Scripts/ScriptProcessors/Aeronaut/Interface.js   ← diff vs demo
Aeronaut/Scripts/ScriptProcessors/Aeronaut/ScriptFX1.js
Aeronaut/XmlPresetBackups/Aeronaut.xml
Aeronaut/XmlPresetBackups/AeronautUIData/AeronautDesktop.xml
Aeronaut/project_info.xml                                   ← si falta USE_RELATIVE…
Aeronaut/demo_agents/                                       ← esta documentación
```

Para demo, ver [PORT_AERONAUT_DEMO.md](./PORT_AERONAUT_DEMO.md) en lugar de copiar `Interface.js` del full tal cual.