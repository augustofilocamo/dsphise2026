# cpp-hello-world — find_closest en C++ (HISE)

## Grid en el request

- Por defecto el script intenta cargar **`AudioFiles/stems/current/grid_buttons.json`** (misma ruta que **grid-to-human** al exportar la grilla). Si no existe, usa un patrón fijo de prueba.
- Si cambiás la grilla en otro ScriptProcessor pero **no** generás ese JSON, el request **no cambia** — exportá la grilla desde grid-to-human o copiá el archivo a esa ruta.

## Requisitos

1. **Bancos en `.bbank`** (exportados desde los `.npz`; por defecto **v2**: patrones `uint8` + rutas deduplicadas; el motor carga **v1 y v2**):

   ```bash
   cd /path/to/Boomcha
   python3 drum_classifier/export_bank_for_cpp.py pattern_bank.npz -o pattern_bank.bbank
   python3 drum_classifier/export_bank_for_cpp.py pattern_bank01.npz -o pattern_bank01.bbank
   ```

   Legacy **v1** (float32 sin dedup): `--format 1`.

   Los archivos deben quedar junto al proyecto (misma carpeta que `pattern_bank.npz`), típicamente la raíz del producto / UserPresets parent.

2. **`MidiFiles.dat` y `MidiFiles01.dat`** en la raíz del proyecto (mismo criterio que el CLI Python). El formato es el **mismo que usa HISE** (pool embebido + metadata **zstd**). El DSP embebe el decoder zstd dentro del DLL (`boomcha_zstd_embedded.h`), sin depender de `dlopen` ni de `brew install zstd` en la máquina del usuario. **Una vez:** copiá el árbol `hi_zstd/zstd` a `DspNetworks/ThirdParty/zstd_vendor/zstd` (ver `ThirdParty/zstd_vendor/README.md` o `./Scripts/vendor_zstd.sh` desde la raíz de Boomcha).

3. **Compilar el DLL de DSP** en HISE (Export → Compile DSP networks).

4. En el **Hardcoded FX**, elegir el nodo **`boomcha_find_closest`**.

**Proyecto Boomcha100:** [`Interface.js`](../Boomcha100/Interface.js) integra el mismo flujo en la UI real (botón Generate): escribe `boomcha_find_request.json`, pulsa **Run** en el processor **`HardcodedMasterFX1`**, y hace polling de `boomcha_find_response.json`. El preset debe incluir ese Hardcoded Master FX (referencia en [`XmlPresetBackups/Boomcha 1.0.0.xml`](../../../XmlPresetBackups/Boomcha%201.0.0.xml)).

## Flujo script ↔ C++

1. El script escribe `boomcha_find_request.json` donde apunte **`FileSystem.Temp`** en HISE (en macOS suele ser `~/Library/Caches/HISE/`).

2. Subís el parámetro **Run** del nodo de `0` a `1` (flanco ascendente).

3. El nodo C++ busca el request en el temp del sistema **y** en la carpeta tipo-HISE (Caches/HISE), y escribe `boomcha_find_response.json` **junto al request** (misma carpeta).

4. Pulsá **Read response** en la UI de prueba o leé el archivo manualmente.

## Formato del request (JSON)

Campos usados por el motor:

- `grid`: `{ bpm, bd:[16], sd:[16] }` (o 12 + `division` ternario)
- `bank_main`, `bank_fallback`: rutas absolutas a `.bbank`
- `project_root`: se toma del **padre de `AudioFiles`** (misma raíz que la grilla en `AudioFiles/stems/...`), no del padre de `UserPresets` (evita rutas viejas).
- `fallback_if_dist_above`, `top`, `bars`
- `use_hh`, `hh_min`, `ternary`
- `output_dir`, `project_root`, `velocity`

## Respuesta

Misma idea que el CLI con `--json`: `index`, `distance`, `meta_bpm`, `matches[]` con `mid_path`, `bank`, etc.

Cada elemento de `matches` puede incluir (motor reciente): **`midi_id`** (ID del pool / `meta_paths` del banco), **`bar_start`** (índice de compás de inicio en el MIDI fuente, **base 0**: el primer compás es `0`; en un DAW que muestre compás 1, 2, 3… equivale a `bar_start + 1`), **`source_path`** (ruta del `.mid` resuelto desde disco o `MidiFiles*.dat`), además de **`mid_path`** (clip exportado para esa fila).

## Depuración C++

Ver [Third Party C++ Nodes](https://docs.hise.dev/scriptnode/manual/third_party.html) y el foro [About C++ Nodes](https://forum.hise.audio/topic/10185/about-c-nodes): Xcode con el ejecutable de HISE como target de depuración, breakpoints en `DspNetworks/ThirdParty/`.

## Notas

- El export del segmento usa la **misma ventana en segundos** que `export_groove_segment_to_midi` en Python (`bar_sec = 4*60/meta_bpm`, tiempos de nota con mapa de tempo vía JUCE `convertTimestampTicksToSeconds`), alineado con cómo se construyó `meta_bar_starts` en `build_groove_pattern_bank.py` (no `bar * 4 * PPQ` en ticks crudos).
- Si en consola aparece **`No matches after filtering`**, el buscador sí encontró candidatos en el `.bbank` pero el **filtro de hi-hat** (`use_hh` / `hh_min` en el JSON) los descartó todos. Para pruebas, dejá `use_hh: false` o un `hh_min` bajo (p. ej. 0–2).
- Si falta `DspNetworks/ThirdParty/zstd_vendor/zstd/zstd.h`, la compilación fallará con un `#error` explícito; no hace falta el módulo **hi_zstd** en el proyecto.
- El nodo `hello_custom_node` sigue disponible como plantilla; el buscador es `boomcha_find_closest`.
