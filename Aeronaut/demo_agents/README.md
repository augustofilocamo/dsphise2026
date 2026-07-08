# demo_agents — Loop sidecar persistence (Aeronaut)

Documentación para replicar la persistencia del **Parallel Looper** en el build full (`Aeronaut`) y en el **demo** (`Aeronaut_demo` + `Scripts/Demo.js`), o en otro proyecto HISE derivado.

## Índice

| Doc | Contenido |
|-----|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Diseño final, flujo de datos, rutas de archivo |
| [FILES.md](./FILES.md) | Lista de archivos tocados y responsabilidad |
| [CPP_DSP.md](./CPP_DSP.md) | Cambios en `spectral_freeze_node.h` |
| [SCRIPTS.md](./SCRIPTS.md) | `loopSidecar.js`, `ScriptFXLoopTap.js`, hooks en `Interface.js` |
| [HISE_XML_UI.md](./HISE_XML_UI.md) | Preset XML, cadena FX, label oculto |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Bugs que aparecieron y cómo se resolvieron |
| [PORT_AERONAUT_DEMO.md](./PORT_AERONAUT_DEMO.md) | Portar `Demo.js` (timer + mute + overlay) a **cualquier** proyecto HISE |

## Resumen en una frase

Cada grabación crea un WAV único en `AudioFiles/recordings/loop_{id}.wav`; el **id del take activo** vive en el label oculto `loopSidecarIdLabel` (persistido por el DAW al guardar el proyecto); el C++ carga/guarda el buffer del looper vía parámetros `LoopSidecarLoad` / `LoopSidecarSave`.

## Referencia rápida (proyecto full — ya implementado)

```
Scripts/loopSidecar.js                          ← lógica compartida
Scripts/ScriptProcessors/Aeronaut/ScriptFXLoopTap.js
Scripts/ScriptProcessors/Aeronaut/Interface.js  ← include + hooks
Scripts/ScriptProcessors/Aeronaut/ScriptFX1.js  ← host audio sync gen
DspNetworks/ThirdParty/spectral_freeze_node.h
XmlPresetBackups/Aeronaut.xml
XmlPresetBackups/AeronautUIData/AeronautDesktop.xml
project_info.xml                                ← USE_RELATIVE_PATH_FOR_AUDIO_FILES=1
```

## Demo vs full

| | Full | Demo |
|--|------|------|
| Runtime auth | `Authorisation.js` | `Demo.js` (timer, mute, overlay) |
| Interface | `include("Authorisation.js")` | `include("Demo.js")` — ver [PORT_AERONAUT_DEMO.md](./PORT_AERONAUT_DEMO.md) |

El sidecar del looper y el runtime demo son **independientes**: portar uno no implica portar el otro.

## Después de portar

1. Recompilar **DSP network** (cambios en `.h`).
2. Re-exportar plugin (full y/o demo).
3. Probar: grabar → ⌘S Logic → reabrir → Play.
4. Ver consola: `[Aeronaut] boot-reload sidecar id=… exists=1`.
