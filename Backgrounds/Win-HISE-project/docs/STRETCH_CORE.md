# Stretch de fábrica — Backgrounds

**Fecha:** 6 sep 2026  
**Producto:** Backgrounds (Sampleson)  
**Hablar:** palabras de todos los días.

## Decisión final (Win + Mac)

Las tres camas usan el player de HISE de fábrica:

`FactoryPath="core.stretch_player"`

en `DspNetworks/Networks/cinescapes_DspNetwork.xml` (`ch0_stretch`, `fury_stretch`, `gold_stretch`).

**No** uses:

- `project.zone_stretch` (Signalsmith + zonas) — crasheaba VST3 en Reaper (Win).
- `project.stock_stretch` (nodo propio) — también inestable en Win (exe/plugin).

Esos headers / registros **ya no** están en el proyecto vivo. Si aparecen en Mac, sacalos (no alcanza con dejar de apuntarlos en la red).

Port oficial a Mac: carpeta [`port-mac-use-core-stretch/`](../port-mac-use-core-stretch/).  
**No** apliques `port-mac-stock-stretch-fix` ni `port-win-stock-stretch` si te llegan.

## Parámetros (script ↔ red)

| ID en script | Conecta a |
|--------------|-----------|
| `ch0_stretch_gate` | Gate de las 3 camas + Haas |
| `ch0_stretch_speed` | `TimeRatio` de las 3 (`PLAY_SPEED = 0.1`) |
| `ch0_stretch_pitch` / `fury_` / `gold_` | Pitch en **semitonos** |

El script convierte ratio → semitonos con `setStretchPitch` (`12 * log2(ratio)`).

Slots de audio: calm Index `0`, fury `4`, gold `1`. Después: Haas → gain → pan.

## Ventana FFT (este clone Win)

En `HISE/hi_streaming/timestretch/time_stretcher.cpp` (carpeta HISE gitignored):

| | Valor |
|--|------:|
| Block (ventana) | **16384** |
| Interval (hop) | **2048** |

Hace falta rebuild de HISE + plugin si cambiás eso. En Mac hay que alinear a mano si quieren el mismo carácter.

## Ritual

1. Confirmá `core.stretch_player` en la red.
2. Compile **DSP networks** + Binaries.
3. Compile **script** si tocaste pitch / gate / speed.

## Sonido

Loop de punta a punta del archivo. **No** hay saltos de zona. Generate on/off = gate; ver nota histórica de fade en [`PORT_WIN_PLAYSTOP.md`](PORT_WIN_PLAYSTOP.md).
