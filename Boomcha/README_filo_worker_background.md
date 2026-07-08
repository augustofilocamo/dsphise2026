# CLI find-closest

Modo actual: **CLI local one-shot** (sin servidor). HISE invoca el binario `find_closest_groove_bar_macos` cada vez que se pulsa Generate.

## Origen del binario

- **Script:** `drum_classifier/find_closest_groove_bar.py`
- **Binario usado por HISE:** `find_closest_groove_bar_macos` en la **raíz del proyecto** (misma carpeta que los `.npz`).

## Compilar el binario (macOS)

Requiere Python 3 con `numpy`, `pretty_midi`, `mido` y PyInstaller. Se puede usar el venv de `_server` (ya tiene esas dependencias para el CLI).

**Activar el venv** (en la terminal donde vayas a compilar):

```bash
cd _server
source venv/bin/activate   # macOS/Linux
```

Si el venv no existe aún: `python3 -m venv venv`, luego `pip install -r requirements.txt` y `pip install pyinstaller mido`.

**Build** (con el venv activado):

```bash
cd drum_classifier
python3 -m PyInstaller find_closest_groove_bar_macos.spec
cp dist/find_closest_groove_bar_macos ../find_closest_groove_bar_macos
```

El ejecutable queda en la raíz del proyecto (`audioToBeat/find_closest_groove_bar_macos`).

**Recompilar** (después de tocar `find_closest_groove_bar.py`):

```bash
source _server/venv/bin/activate   # si no está activo
cd drum_classifier
python3 -m PyInstaller find_closest_groove_bar_macos.spec
cp dist/find_closest_groove_bar_macos ../find_closest_groove_bar_macos
```

## Integración en HISE

`Scripts/ScriptProcessors/grid-to-human/Interface.js` llama al binario con `BackgroundTask.runProcess(...)` en modo **one-shot**, pasa `--json` y parsea la única línea JSON de stdout.

- Se escribe `Audio/stems/current/grid_buttons.json` y el CLI se invoca con:

  ```bash
  find_closest_groove_bar_macos --json \
    --grid /ruta/Audio/stems/current/grid_buttons.json \
    --bank /ruta/pattern_bank.npz \
    --bank /ruta/pattern_bank01.npz \
    --fallback-if-dist-above 0.94 \
    --top 9 --bars 8 --hh --hh-min 5 \
    --output-dir /ruta/Audio/stems/current
  ```

- El CLI devuelve una sola línea JSON con `index`, `distance`, `meta_bpm`, `matches` (array con `mid_path`, etc.) y `bars`.
- `MidiPlayer2`, `3` y `4` cargan los primeros 3 matches; cada uno recibe el número de compases configurado (p. ej. 2 para vista, 8 para expand).
- El botón **Next row >>** avanza el offset en los `matches` cacheados (paginado local, sin volver a llamar al CLI).

Requisitos en tiempo de ejecución:

- Binario **`find_closest_groove_bar_macos`** en la raíz del proyecto (donde apunta `getCliPaths()` en `Interface.js`).
- Bancos **`pattern_bank.npz`** y **`pattern_bank01.npz`** en la misma raíz.


# Deploy
Copiar el binario compilado **`find_closest_groove_bar_macos`** y los `pattern_bank_*.npz` usados a la raíz del proyecto y, al distribuir, a la carpeta `~/Library/Application Support/Sampleson/audioToBeat/` (o como se llame finalmente).

Para que los matches de `pattern_bank01.npz` funcionen bien en HISE, los MIDIs originales de `lakh_4_10k_groovified` deben estar en un formato que el MidiPlayer pueda leer.

Hay un conversor offline:

```bash
cd drum_classifier
python convert_lakh_groovified_for_hise.py --dir lakh_4_10k_groovified --backup-ext .bak
```

Este script reescribe cada `.mid` groovified a un único track de batería `is_drum=True`, con tempo y 4/4 explícitos (mismo estilo que los exports de EGMD), dejando opcionalmente un backup `*.bak`.

**Importante**: después de reconvertir, reconstruir el pattern bank para que guarde los BPMs correctos:

```bash
python build_groove_pattern_bank.py --lakh lakh_4_10k_groovified --out pattern_bank01.npz
```

El export de `find_closest_groove_bar.py` re-escala automáticamente al BPM del query (grid) usando `output_bpm`.