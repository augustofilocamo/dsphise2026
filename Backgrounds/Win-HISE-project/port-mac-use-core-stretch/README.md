# Update para Mac — stretch de fábrica (oficial)

Leé esto entero. Hablá con palabras de todos los días. **No borres** WAV, FLAC, OGG, PNG, metas, takes ni `library/clap/text_encoder.fp32.onnx`.

Producto: **Backgrounds** (Sampleson). **Decisión final** (Win + Mac): las 3 camas usan **`core.stretch_player`**. Ver [`docs/STRETCH_CORE.md`](../docs/STRETCH_CORE.md).

## Por qué

Los nodos propios (`zone_stretch`, `stock_stretch`) tumbaron VST/exe en Windows. El de fábrica no. Misma decisión en Mac para un solo motor.

**No** apliques packs `port-*-stock-stretch*`.

## Dónde va

| En este paquete | Pegalo en el repo Mac |
|-----------------|----------------------|
| `HISE-project/DspNetworks/Networks/cinescapes_DspNetwork.xml` | mismo path bajo tu `HISE-project/` |

Confirmá `FactoryPath="core.stretch_player"` en las 3 camas.

Si Mac todavía tiene `stock_stretch.h` / `zone_stretch.h` o registro en `factory.cpp` / `includes.h` / `node_properties.json`: **sacalos**.

El script debe hablar Gate / TimeRatio / Pitch en **semitonos** (`setStretchPitch`). Si ya está así, no lo pises.

## En HISE

1. Compile **DSP networks**
2. Build Binaries (plugin / app)
3. Compile **script** solo si hace falta alinear pitch/gate/speed

## Ventana grande (opcional, alinear con Win)

16384 / 2048 vive en source HISE `hi_streaming/timestretch/time_stretcher.cpp` (rebuild HISE + plugin). En el clone Win de Filo eso ya está.

## Resumen

**Red = `core.stretch_player`. Compile DSP + Binaries. Sin stock/zone en el proyecto.**
