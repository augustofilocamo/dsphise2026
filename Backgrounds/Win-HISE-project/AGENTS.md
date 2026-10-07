# Agent notes — Backgrounds (AI-cinescapes)

**Hablar:** nunca jerga. Palabras de todos los días.  
**UI del plugin:** inglés.  
**No borres** WAV, FLAC, OGG, PNG, metas, takes, ni `library/clap/text_encoder.fp32.onnx` (copia única del encoder grande; en Mac / monorepo con `library/`).

Leé esto antes de explorar el repo a ciegas. Port Windows: [`PORT_WINDOWS.md`](PORT_WINDOWS.md). Stretch: [`docs/STRETCH_CORE.md`](docs/STRETCH_CORE.md). Capture: [`CAPTURE.md`](CAPTURE.md).

## Producto ahora (6 sep 2026)

Nombre en HISE: **Backgrounds**. Empresa: **Sampleson**. Bundle `com.sampleson.backgrounds`. Código de plugin `Bakg`.

Vivo: canvas + tags + cápsulas + capture. El plugin **no inventa audio en la máquina**. Busca entre camas ya hechas (`v6` + `v6_locations`) y las toca. Los wavs de fábrica salieron de **Stable Audio Open 1.0** (Sampleson los generó).

**Windows:** release armado (VST3 + exe firmados, instalador Inno, EULA en el wizard). Las tres camas usan el stretch de **fábrica** de HISE (`core.stretch_player`). No hay nodos propios `zone_stretch` / `stock_stretch`.

**No hay** layerCombo, Search, Fine Tune, bounce/export viejo, MIDI gen, ni SFX en la UI. No dejes paneles muertos `visible=0`: si no se usa, borralo. Ocultar capture / alerta / diálogo de licencia cuando toca **sí**.

### Layout de este clone (Windows)

Acá la **raíz del repo es el proyecto HISE** (`DspNetworks/`, `Scripts/`, `Semantic_s/`, …). En Mac el monorepo a veces mete eso bajo `HISE-project/` y además tiene `library/`, `server/`, etc.

## Dónde está qué

| Área | Path |
|------|------|
| Port Windows | [`PORT_WINDOWS.md`](PORT_WINDOWS.md) |
| Stretch (fábrica) | [`docs/STRETCH_CORE.md`](docs/STRETCH_CORE.md) |
| Capture (vivo) | [`CAPTURE.md`](CAPTURE.md) |
| Port Mac (XML fábrica) | [`port-mac-use-core-stretch/`](port-mac-use-core-stretch/) |
| Firma Win | [`Installers/Win/Win Codesign/README_filo_windows_signing.md`](Installers/Win/Win%20Codesign/README_filo_windows_signing.md) |
| Instalador Win | `Installers/Win/Backgrounds_Win_Installer.iss` + `EULA.txt` |
| RunPod (generar audio) | `server/AGENT_RUNPOD.md` (Mac / monorepo) |
| Banks / sync / índice | `library/README.md` (Mac / monorepo) |
| Familias de sonido | `library/SOUND_TAXONOMY.md` (Mac / monorepo) |
| UI + tags / canvas / capture / búsqueda | `Scripts/ScriptProcessors/Ai-cinescape/Interface.js` |
| Engine | `DspNetworks/Networks/cinescapes_DspNetwork.xml` |
| Capture red | `DspNetworks/Networks/capture_DspNetwork.xml` |
| UI XML | `XmlPresetBackups/Ai-cinescapeUIData/Ai-cinescapeDesktop.xml` |
| Nombre / extra defs | `project_info.xml` + `user_info.xml` |

## UI

- **xyPad** + mix calm / fury / gold (cápsulas arrastrables). Mix máx. al centro; pan desde el centro de la pill.
- Máximo **3** cápsulas. Si ya hay tres: panel `maxNodesPanel` (“You can only use 3 nodes.”). **No** uses `Engine.showMessageBox`.
- `dropOntoImage`: se ve con el canvas vacío; se esconde apenas hay una cápsula (`syncDropOntoImage`).
- **tagsPanel** pestañas (solo texto; la lógica usa el índice 0…4):

  `ORCHESTRA-BASED` · `SYNTH-BASED` · `BASS-RUMBLES` · `PLACES` · `CUSTOM`

  Places → bank `v6_locations`. El resto → `v6`. Drag al canvas → búsqueda → carga cama. Letra de pestaña: **13**.
- Cápsulas: lápiz (prompt libre), refresh, delete. **No hay chevron ni menú de presets.**
- **stretchPlayBtn** (play / Generate) + **pitchMatchBtn**.
- **capturePanelButton**: capture on → Rec / Play / onda; capture off → tags + pitch + play. Custom se esconde con capture.
- Rec: captura **en vivo** (`audioRecorder.js` + ScriptFX `RecordingScript`). **No** `Engine.renderAudio` para capture. Fade de escritura en el include. Play de take: slot del Recorder. No uses `slot.clear()` — `slot.loadFile("")`.
- Nombre del take: `Background_<texto-de-cápsulas>_<tiempo+id>.wav` (vía `finishLiveCapture`). Vacío: `Background_<id>.wav`.
- Pie legal (`legalLabel`): *Generated audio is royalty-free for personal and commercial use, including music, film, games and advertising. No attribution required. See EULA for full terms.* Al lado: `infoScriptImage` (`img-info.png`). **No hay** ícono dibujado `legalInfoIcon`.
- Texto de producto en inglés. Diálogo de licencia: `Authorisation.js` + `AuthorisationDialogue`.

### Qué graba el DAW / el proyecto

El host solo guarda componentes con `saveInPreset=1`. Las variables de script **no**.

- Posición de cápsulas: paneles escondidos **Node 1 X/Y** (calm), **Node 2 X/Y** (fury), **Node 3 X/Y** (gold).
- Qué suena: label escondido `sessionStateLabel` → JSON `{ v, n1:{on,p,b,id}, n2, n3 }`. `p` = tag o texto tipeado (hace falta para refresh). Escritura: `writeSessionState()`. Lectura: `setupSessionState()` **después** de `loadBank()`. Preferir el `id` guardado (`ensureHitInList`). Guards: `skipStateCb`, `lastRestoredState`. Parse: `JSON.stringify` / `"".parseAsJSON()`.

### Búsqueda

- En el proceso: `Engine.createClapSearch()` → carpeta `Semantic_s/` (ver abajo).
- Producto carga solo `meta_ucs_v6.json` + `meta_ucs_v6_locations.json`.
- Build Mac: `native/clap_search/build_osx.sh`. Build Win: CMake en `native/clap_search/` (ver `PORT_WINDOWS.md`). Export: `python library/export_clap_onnx.py` (Mac).
- HTTP `:8766` es fallback de **dev**. El plugin **no** arranca `clap_server.py`. En el script queda un `CLAP_BASE_URL` usado si falla lo nativo, pero **la constante no está definida** (no toques eso salvo que el usuario pida arreglar el fallback).
- Encoder vivo: `text_encoder.onnx` en **fp16** (~239 MB). Entradas int64, salida float32. Backup único: `library/clap/text_encoder.fp32.onnx` — **no borrar**. Un export nuevo convierte solo.
- Mac: `libclap_search.dylib` + `libonnxruntime.1.17.3.dylib`. Win: `clap_search.dll` + `onnxruntime.dll`.

### Carpetas Semantic_s (no confundir)

Las tres están en `.gitignore`. **No las borres** si todavía laburás o armás el instalador.

| Carpeta | Rol |
|---------|-----|
| `Semantic_s/` | Dev / HISE: índice, encoder, oggs, dlls/dylibs. |
| `Semantic_s_distro_win/` | Staging del pack Win (`pack_semantic_distro_win.ps1`). Intermedia. |
| `Installers/Win/Semantic_s/` | Lo que Inno empaqueta → `%AppData%\Sampleson\Backgrounds\Semantic_s\`. |

Runtime del plugin instalado: al lado de User Presets, padre → `Semantic_s/`.

### Ritual HISE

- Custom nodes: `DspNetworks/ThirdParty/*.h` — rebuild **DSP networks**.
- **No modificar source HISE** salvo pedido explícito — excepciones ya hechas: `ScriptClapSearch` / `Engine.createClapSearch`, y en este clone Win la ventana FFT del stretcher de fábrica (ver stretch).
- No setear `x`/`y`/`width`/`height` desde JS salvo al colocar UI (pills / prompt).
- Tras `Interface.js`: compile **script**. Tras XML de componente o DSP / `.h`: reload UI / compile **DSP networks**.
- No borrar WAVs / PNGs / takes.

### Trampas de script (HISE)

- En un `setPaintRoutine` anónimo **no** uses `local`. Usá `inline function` o `var`.
- `g.drawEllipse([x,y,w,h], grosor)` — no 5 argumentos sueltos.
- `g.setOpacity` no pinta bien el panel: usá `Colours.withAlpha(..., 0.95)`.
- `oneshot_player`: `isSuspendedOnSilence()` = **false** (si no, el fade mata el nodo).

### DSP

| ScriptFX | Network | Qué hace |
|----------|---------|----------|
| `Engine` | `cinescapes_DspNetwork` | Tres `core.stretch_player` (`ch0_stretch`, `fury_stretch`, `gold_stretch`) → Haas → gain → pan. Gate unificado: `ch0_stretch_gate`. Speed: `ch0_stretch_speed` → `TimeRatio` (`PLAY_SPEED=0.1`). Pitch por cama en **semitonos** (`setStretchPitch`). |
| `Recorder` | `capture_DspNetwork` | split dry + player de take. Params: `capture_gate`, `capture_ratio`, `capture_gain`. |
| `RecordingScript` | (sin red) | Acumula audio si `g_record` (capture vivo). |

Audio del producto: **ogg** (`use_ogg = true`) en `Semantic_s/v6_curated/`.

**Stretch — decisión final:** solo `core.stretch_player`. Sacados del proyecto vivo: `zone_stretch`, `stock_stretch`. Detalle: [`docs/STRETCH_CORE.md`](docs/STRETCH_CORE.md). Port Mac: `port-mac-use-core-stretch/`. **No** apliques packs viejos `port-*-stock-stretch*`.

Generate on/off hoy: abre/cierra el gate directo. Hubo un fade suave de volumen (doc histórico [`docs/PORT_WIN_PLAYSTOP.md`](docs/PORT_WIN_PLAYSTOP.md)); **no** está en el `Interface.js` vivo.

## Banks (producto vs gen)

| Bank | En el plugin | Meta (Semantic_s) | ID prefix |
|------|--------------|-------------------|-----------|
| **`v6`** | sí (beds) | `meta_ucs_v6.json` | `v6_*` (no loc / SFX) |
| **`v6_locations`** | sí (Places + mix loc) | `meta_ucs_v6_locations.json` | `v6loc_` |
| `v6_sfx` / `v2`…`v5fol` | no en UI | siguen en disco para gen/index (Mac) | — |

Aliases CLAP (tooling): `v6loc`→`v6_locations`, `v6sfx`/`sfx`→`v6_sfx`. Per-bank keys (`v6foot`, …) solo para `clap_index.py --bank v6foot`.

## Legal (ojo)

- El pie dice **no attribution** para **quien usa el audio** en una peli / juego / aviso. Eso está bien frente al usuario.
- Stability **sí** pide que **el producto** muestre **Powered by Stability AI** (EULA / about / web), un Notice, y copia de su Community License al distribuir.
- **Win:** EULA de shipping en [`Installers/Win/EULA.txt`](Installers/Win/EULA.txt) (wizard del instalador). Incluye Notice Stability.
- Techo **USD 1 millón/año**: es de Sampleson al usar el modelo, no del músico.
- No soy abogado. No inventes “fair AI use”. No digas que los wavs de fábrica “pertenecen” al usuario: licencia de uso, no cesión de autor.

## RunPod (gen) — Mac / monorepo

- Network Volume **US-MO-2** → `/workspace` (venv + HF cache + `server/`)
- Secret: `cinescapes-dev-secret`
- Puerto HTTP **8000** (Connect debe mostrar `…-8000.proxy.runpod.net`; 8888 solo = Jupyter)
- Torch: `2.5.1+cu124` + `flex_attention`; ver `server/AGENT_RUNPOD.md`
- URL proxy **cambia** al recrear el pod
- Modelo: `stabilityai/stable-audio-open-1.0`

### Parallel gen (Ago 2026)

Dos pods, **un** `batch_generate` por pod (misma GPU ≠ N clientes):

| Rol | Pod ID (ejemplo) | Proxy |
|-----|------------------|--------|
| pod1 | `mxe1emlfr76k9j` | `https://mxe1emlfr76k9j-8000.proxy.runpod.net` |
| pod2 | `wlifu5h8yrtdny` | `https://wlifu5h8yrtdny-8000.proxy.runpod.net` |

Cola SFX interleaved: `/tmp/prompts_v6sfx_shuffled.txt` (~2583 líneas) + `--skip-existing` + `--fail-continue` + `seconds=12` `steps=190`.
Prompts SFX = **oneshot-only** (`FORCE_ONESHOT` en `build_ucs_prompts_v6_sfx.py`: takes + ~1s silence gaps; no continuous/loop).

```bash
# Arrancar SAOS en el pod (SSH)
source /workspace/venv/bin/activate
export HF_HOME=/workspace/hf-cache HUGGINGFACE_HUB_CACHE=/workspace/hf-cache
export API_SECRET=cinescapes-dev-secret PORT=8000
cd /workspace/server && python -m uvicorn app:app --host 0.0.0.0 --port 8000

# Segundo cliente en la Mac (mismo shuffle)
caffeinate -i python3 library/batch_generate.py \
  --url https://POD2-8000.proxy.runpod.net \
  --secret cinescapes-dev-secret \
  --prompts /tmp/prompts_v6sfx_shuffled.txt \
  --meta library/meta_ucs_v6_sfx.json \
  --out library/wavs --seconds 12 --steps 190 \
  --skip-existing --fail-continue
```

Log pod2 típico: `/tmp/batch_v6sfx_pod2.log`. Contar WAVs: `ls library/wavs/v6foot_*.wav | wc -l` (y demás prefixes).

## Generación — snapshot (2026-08-12 ~15:55 AR)

| Familia | En disco | Target prompts |
|---------|--------:|---------------:|
| `v6` music | ~1641 | 3000 |
| `v6_locations` | 152 | 800 |
| **`v6_sfx` total** | **~428** | **~2583** |
| · foot / ani / veh / mach | ~180 / 59 / 51 / 47 | 200 / 530 / 500 / 400 |
| · imp / vox / wx / crd | ~37 / 26 / 19 / 9 | 430 / 295 / 110 / 118 |

Pack distro (1 sep 2026): **2709 ogg** en `Semantic_s/distro/` (`v6` + `v6_locations`).

Tras más WAVs (Mac): `./library/sync_to_hise.sh` → `python3 library/clap_index.py --bank v6 --update` (y `v6_locations` / `v6_sfx`) → `python3 library/export_clap_onnx.py --skip-onnx` → rebuild dylib si cambió matching C++.

## Comandos frecuentes

```bash
# Mac / monorepo
./library/sync_to_hise.sh
python3 library/clap_index.py --bank v6 --update
python3 library/clap_index.py --bank v6_locations --update
python3 library/export_clap_onnx.py --skip-onnx
./native/clap_search/build_osx.sh
python3 library/clap_server.py
python3 library/build_ucs_prompts_v6_sfx.py
```

```powershell
# Windows — pack para instalador
.\pack_semantic_distro_win.ps1
# después copiá el contenido a Installers\Win\Semantic_s\
```

## Changelog corto

- **Sep 6 2026:** Win release listo. Camas = `core.stretch_player` (sin `zone_stretch` / `stock_stretch`). Ventana FFT del stretcher HISE en este clone: **16384 / hop 2048**. EULA en instalador Win. Capture vivo (`audioRecorder.js`). Docs alineados (Semantic_s vs distro vs Installers).
- **Sep 1 2026:** producto **Backgrounds** / Sampleson. Pestañas en caps. Máx. 3 nodos + drop image. Estado de proyecto en `sessionStateLabel`. Params DAW Node 1/2/3. Takes `Background_…wav`. Encoder CLAP fp16. Pie legal.
- **Ago 30 2026 — UI product:** canvas + tags + cápsulas + capture. Banks en plugin: `v6` + `v6_locations`
- Banks SFX `v7*` → **`v6*`**; builder `build_ucs_prompts_v6_sfx.py`
- Gen SFX interleaved + 2 pods en paralelo
