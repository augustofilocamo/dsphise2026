# Boomcha engine (C++ / HISE)

## 1. `USE_MANUAL_ZSTD` — `boomcha_midi_dat.h`

Archivo: `DspNetworks/ThirdParty/src/boomcha_midi_dat.h` (aprox. líneas 28–30).

| Objetivo | Valor |
|----------|--------|
| **Trabajar dentro de HISE** (SNEX / proyecto en el IDE) | Poné **`1`** en el default de `USE_MANUAL_ZSTD`, o definí `USE_MANUAL_ZSTD` como `1` antes de incluir el header. |
| **Compilar app o plugin** (export / release) | Dejá **`0`** (comportamiento por defecto del bloque `#ifndef`). |

Con `1` se usa la ruta embebida `boomcha_zstd_embedded.h`. Con `0` se usan las declaraciones de `zstd_vendor` y el zstd que ya enlaza el binario (evitás símbolos duplicados en el plugin).

Tras cambiarlo: **recompilá las DSP networks / el target** que incluye este código.

---

## 2. “Compare two bars” (dos compases en Find Closest)

En el código no existe un símbolo llamado `comparetwobars`. La opción es **comparar el mismo grid en dos compases seguidos** del `.bbank` (slots 0–15 y 16–31).

### Request JSON

- Campo: **`match_two_consecutive_bars`** (`true` / `false` en JSON; HISE a veces escribe `1` / `0`).
- Lo lee el job en `DspNetworks/ThirdParty/src/boomcha_find_closest_job.h` (`runFindClosestJob`).

### C++

- **Duplicar el query a 32 slots:** `duplicateQueryToTwoConsecutiveBars` en `DspNetworks/ThirdParty/src/boomcha_find_closest_core.h`.
- **Distancia / orden:** `computeDistancesAndOrder` en el mismo archivo (usa `compareSlots`; con modo dos compases es **32**).
- **Respuesta:** el JSON de salida repite el flag en `match_two_consecutive_bars`.

### UI (HISE script)

- **`Scripts/ScriptProcessors/Boomcha100/Interface.js`**: reg global **`boomchaMatchTwoConsecutiveBars`** (se copia a `req.match_two_consecutive_bars` al escribir `boomcha_find_request.json`).
- **`Scripts/ScriptProcessors/cpp-hello-world/Interface.js`**: mismo reg para pruebas del nodo.

Para desactivar el modo dos compases desde la UI, poné `boomchaMatchTwoConsecutiveBars = false` arriba del script (o en `onInit`). Para activarlo, `true`.

---

## 3. Dónde está el **source de HISE** (no está en `project_info.xml`)

El archivo **`Boomcha/project_info.xml`** solo define el proyecto HISE (nombre, bundle, flags tipo `HISE_BACKEND_AS_FX`, etc.). **No guarda** la ruta al árbol de fuentes de HISE.

- La ruta al SDK / repo de HISE la define **tu instalación**: carpeta donde clonaste o descomprimiste HISE, o la que configuraste en **Projucer / preferencias del desarrollador** al compilar el ejecutable de HISE.
- **Source HISE usado para Boomcha (referencia del autor):**  
  `/Users/filo/Filo/VST-Project/HISE-Setup-Installers-Software/HISE Panel Fix/`  
  Ahí está `hi_core/hi_dsp/modules/MidiPlayer.cpp`.
- En el monorepo **`dsphise`** puede haber otras copias (`Tactile/HISE/`, etc.) solo como referencia; **no** sustituyen tu árbol de compilación.

**Importante:** el proyecto Boomcha **no** “apunta” a una carpeta HISE por XML; tenés que **parchear y recompilar el HISE que realmente abrís** (p. ej. el de la ruta de arriba).

### Metadata MIDI al arrastrar desde MidiPlayer

HISE, al cargar un `.mid`, en `HiseMidiSequence::loadFrom` **borra casi todos los meta eventos** de la pista. Por eso el drag exporta la secuencia en memoria **sin** copyright / track name, aunque el archivo en disco los tenga.

El parche para **conservar** meta 0x01 / 0x02 / 0x03 está aplicado en el source de referencia:

`/Users/filo/Filo/VST-Project/HISE-Setup-Installers-Software/HISE Panel Fix/hi_core/hi_dsp/modules/MidiPlayer.cpp`  
(bloque `HiseMidiSequence::loadFrom`, ~líneas 440–465).

Recompilá **ese** HISE para que el drag desde MidiPlayer lleve copyright / track name / texto.
