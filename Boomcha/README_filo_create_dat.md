# Create `MidiFiles*.dat` (HISE MidiFilePool packaging)

Este proyecto usa `.dat` binarios en el mismo formato que HISE genera para el **MidiFilePool**:

`int64 metadataSize + zstd(metadata(ValueTree PoolData)) + concatenación de MIDI crudos`

El objetivo es que el CLI `find_closest_groove_bar.py` pueda **extraer los `.mid` desde el `.dat`** (sin depender de que exista el archivo `.mid/.midi` en folders), imitando el comportamiento “compilado” de HISE.

---

## Requisitos

Necesitás Python 3 y el módulo `zstandard`:

```bash
cd /Users/filo/Filo/VST-Project/dsphise/Boomcha
python3 -m pip install --user zstandard
```

Opcional (solo si querés correr el resto de herramientas de este repo):

```bash
python3 -m pip install --user numpy pretty_midi mido
```

---

## Punto crítico: IDs relativos a la raíz del producto (`./`)

El CLI, los `pattern_bank*.npz` y los `MidiFiles*.dat` deben vivir en la **misma carpeta base** (típicamente la raíz `Boomcha/`).

- `build_groove_pattern_bank.py` guarda `meta_paths` como rutas **relativas** a la carpeta del `--out` (salvo que pases `--meta-path-base`).
- `make_midi_dat.py` guarda el campo `ID` del pool como la **misma idea**: ruta relativa respecto de `--id-root` (por defecto: carpeta donde cae `--output`, es decir el mismo `./`).

**Regla:** las cadenas en `meta_paths` y los `ID` en el `.dat` tienen que coincidir (mismo string, separador `/`). Si cambiás layout o base, **regenerá** `.npz` y `.dat` juntos.

**HISE:** si el editor esperaba referencias absolutas al pool, puede diferir de este esquema; para el flujo CLI + `.dat` lo importante es la coincidencia string entre `.npz` y `.dat`.

---

## Script para generar `.dat`

Ruta:
- `midi_packing/make_midi_dat.py`

Genera un archivo con salida:
- `./MidiFiles.dat`
- `./MidiFiles01.dat`

y crea un cache:
- `./.midi_cache/` (solo cuando el CLI extrae un `.mid` desde el `.dat`)

---

## Generar `MidiFiles.dat` (EGMD)

Usá como `--src-dir` **la carpeta raíz** que contiene los `.mid/.midi` referenciados por:
- `pattern_bank.npz`

Ejemplo (ajustá la ruta a tu folder real EGMD):

```bash
cd /Users/filo/Filo/VST-Project/dsphise/Boomcha
python3 midi_packing/make_midi_dat.py \
  --src-dir "/RUTA/A/TU/CARPETA/EGMD" \
  --output MidiFiles.dat
```

Opcional: si el `.dat` no lo escribís en `./`, fijá la misma base que usaste al armar el `.npz`:

`--id-root /ruta/absoluta/a/Boomcha`

---

## Generar `MidiFiles01.dat` (Lakh groovified)

Para `pattern_bank01.npz` el repo usa los `.mid` dentro de:
- `Sketches-Ideas/audioToBeat/first_74k_groovified/`

Entonces:

```bash
cd /Users/filo/Filo/VST-Project/dsphise/Boomcha
python3 midi_packing/make_midi_dat.py \
  --src-dir "/Users/filo/Filo/VST-Project/Sketches-Ideas/audioToBeat/first_74k_groovified" \
  --output MidiFiles01.dat
```

---

## Smoke test (verificar que el CLI lee desde el `.dat`)

El CLI decide qué `.dat` usar según el banco:
- `pattern_bank.npz` -> `./MidiFiles.dat`
- `pattern_bank01.npz` -> `./MidiFiles01.dat`

Ejemplo:

```bash
cd /Users/filo/Filo/VST-Project/dsphise/Boomcha
python3 drum_classifier/find_closest_groove_bar.py \
  --grid AudioFiles/stems/current/grid_buttons.json \
  --bank pattern_bank.npz \
  --top 1 --bars 1 --json
```

Si el `.dat` está bien, el stdout será **JSON válido** (una sola línea).

---

## Nombres y ubicación esperada

Los `.dat` deben quedar en la raíz del repo:
- `Boomcha/MidiFiles.dat`
- `Boomcha/MidiFiles01.dat`

Si cambias la ubicación, tenés que ajustar el CLI (y/o rebuild del binario de HISE).

