# Estado del proyecto — drum_classifier

Resumen para retomar el contexto: qué hace este repo, decisiones tomadas y flujo actual.

---

## Qué hace este repo

- **Entrenar** un clasificador de percusión (Kick, Snare, Hat, etc.) sobre datasets (STAR, E-GMD, Groove, IDMT, Lakh).
- **Inferir** onsets desde audio (stems + JSON desde HISE) y obtener una grilla BD/SD por tiempo.
- **Banco de patrones**: grillas de 2 compases, 16 slots por compás, solo BD (36) y SD (38). Se construye con `build_groove_pattern_bank.py` desde varias fuentes.
- **Find closest**: compara una query (grilla 16×2 o primer compás de inferencia) con el banco y exporta los **top N** patrones más parecidos como MIDI. Cada alternativa viene de un **archivo MIDI distinto** (no se repite el mismo path).
- **BPM desde WAV**: `estimate_bpm_wav.py` estima BPM con librosa (compatible con 0.9 y 0.10+).
- **Humanizar**: `humanize_drum_midi.py` aplica jitter de tiempo y velocidad a un MIDI exportado.

---

## Decisiones / implementación actual

- **Query**: si se pasan `--grid` y `--inference`, **solo se usa --grid** (grid_buttons.json: `bd[16]`, `sd[16]`). El BPM puede venir del grid JSON o de `--stems` (stems.json).
- **Comparación**: solo BD y SD; distancia L2 ponderada; se prueba el patrón desplazado medio compás (`np.roll(..., 8)`) y se toma el mínimo.
- **Un resultado por origen/canción**: la clave para “no repetir” normaliza el nombre del archivo (quita _15, _32, etc. y unifica .mid/.midi). Así solo entra una variante por tema en el top N.
- **Lakh**: en el bank se procesa **solo desde pistas con is_drum=True** (canal GM percusión); BPM desde `get_tempo_changes()` del MIDI.
- **Export**: solo pistas `is_drum=True`; para segmentos se usa el BPM del ítem del banco cuando está disponible.
- **`.bbank` (C++ / HISE)**: `export_bank_for_cpp.py` genera **v2** por defecto (rejilla `uint8` + rutas deduplicadas). **v1** legacy con `--format 1`. El loader `boomcha_bbank.h` solo carga **v1 y v2** (sin zlib/compresión en el DLL).

---

## Flujo típico

1. **Preparar dataset** (ej. STAR):  
   `python build_star_drums.py star_drums_preview --out dataset_star_built --max-energy-window --context-sec 0.03`
2. **Entrenar**:  
   `python train.py --data dataset_star_built --class-weights --epochs 30`
3. **Onsets en HISE** → guardar stems + JSON.
4. **Cargar para inferencia**:  
   `python load_stems_for_inference.py .../stems.json --context-sec 0.05 --out inference_input.npz --audio loops/archivo.wav`
5. **Inferir**:  
   `python infer.py inference_input.npz --checkpoint checkpoints/best.pt --out-dir ... --thresholds "0.35,0.15,0.35" --max-energy-window`
6. **Construir banco** (e-gmd, groove, star, idmt, lakh):  
   `python build_groove_pattern_bank.py e-gmd-v1.0.0 --info e-gmd-v1.0.0.csv --star star_drums_preview --idmt idmt --lakh lakh_folder --out pattern_bank.npz` (o `e-gmd-v1.0.0/groove` si esa carpeta existe en tu layout)
7. **Buscar similares**:  
   `python find_closest_groove_bar.py --grid --stems .../stems.json --bank pattern_bank.npz --top 3`  
   (o `--inference` con inference_output.json si no usás grid.)
8. **BPM desde WAV** (opcional):  
   `BPM=$(python estimate_bpm_wav.py loops/archivo.wav)`
9. **Humanizar MIDI**:  
   `python humanize_drum_midi.py closest_1bar_1.mid --sigma-time 0.002 --suffix _humanized`

---

## Dónde estamos (última actualización)

- Banco de patrones con varias fuentes (incl. Lakh).
- Find closest con **un resultado por origen/canción** (una variante por tema en el top N).
- **Estimador de BPM desde WAV** (`estimate_bpm_wav.py`) listo para usar en scripts o para integrar en el flujo cuando la entrada sea solo audio.

---

## Integración HISE (estado actual)

- Se usa **CLI local** (sin servidor HTTP) desde `Scripts/ScriptProcessors/grid-to-human/Interface.js`.
- HISE dispara el worker con `BackgroundTask.runProcess(...)` y parsea JSON por stdout.
- Worker en mac:
  - archivo: `find_closest_cli_macos` (binario generado desde `_server/find_closest_cli.py`).
  - ejecución one-shot (no persistente): arranca, responde, termina.
- Resolución de rutas runtime (plugin compilado):
  - base: `FileSystem.getFolder(FileSystem.UserPresets).getParentDirectory()`
  - worker esperado: `<base>/find_closest_cli_macos`
 - bank principal esperado: `<base>/pattern_bank.npz`
 - bank fallback esperado: `<base>/pattern_bank01.npz`
- Flujo en HISE:
  1. arma `bd/sd` (16 slots),
  2. ejecuta CLI local con `--bank --bd --sd`,
  3. recibe `index/distance/meta_path/meta_bar_start/meta_bpm`,
  4. carga `meta_path` en `MidiPlayer2` y recorta el compás `meta_bar_start`.
- Debug en compilado:
  - `Interface.js` escribe `worker_debug.log` en la misma base (`UserPresets.parent`).
  - el CLI imprime errores en stdout y stderr como JSON (`{"error":"..."}`) para que HISE los capture.

---

## Por qué con Lakh los "similar" suelen ser mucho más similares

- **Solo pista de batería**: Lakh usa `collect_bd_sd_notes_from_drum_track` (solo notas en pistas con `is_drum=True`). Eso da una grilla BD/SD muy limpia, sin notas 36/38 que vengan de otras pistas. En E-GMD/Groove se usa `collect_bd_sd_notes` (cualquier pista), lo que a veces mezcla fuentes o variantes.
- **Contenido del dataset**: Lakh son MIDIs de canciones (pop/rock, etc.) con patrones a menudo **repetitivos**: el mismo compás se repite muchos veces. Al construir el banco se añade **cada ventana de 2 compases**; en una canción de 4 min con el mismo beat aparecen decenas o cientos de copias del mismo patrón. Por eso find_closest encuentra muchos matches con distancia 0 o muy baja.
- **E-GMD/Groove**: suelen ser tomas de **interpretación** (varias variantes _1, _15, _32 del mismo tema, con pequeñas diferencias) y a veces una pista por instrumento. La misma “idea” de groove puede cuantizar a grillas ligeramente distintas, así que los similares tienen distancias algo mayores.
- **Un patrón por canción en Lakh**: como cada archivo es una canción distinta, cuando hay “muy similar” suele ser porque muchas canciones comparten el mismo patrón típico (four-on-the-floor, backbeat, etc.), y la grilla cuantizada es literalmente la misma.

En resumen: con Lakh las grillas son limpias (solo drum track) y el banco está lleno de repeticiones del mismo patrón por canción y de patrones muy comunes entre canciones; por eso los resultados “similar” suelen ser casi idénticos. Con E-GMD/Groove hay más variedad y variación por take, así que los similares pueden tener distancia > 0.

---

Para que un asistente retome desde aquí: leer este `CONTEXT.md` y el README del dataset/pattern bank que corresponda.
