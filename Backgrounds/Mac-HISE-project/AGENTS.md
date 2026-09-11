# Agent notes — Backgrounds (copia de release, proyecto HISE)

Leé esto antes de explorar a ciegas. Este workspace **no** es el repo completo del producto.

**Hablar:** nunca jerga. Palabras de todos los días.  
**UI del plugin:** inglés.  
**No borres** OGG, WAV, FLAC, PNG, metas JSON, takes, dylibs de CLAP, ni `Semantic_s/text_encoder.onnx` / el de distro.

---

## Qué es este workspace

Carpeta HISE de **Backgrounds 1.0.0**, copiada para trabajar acá sin tocar el original.

| | |
|--|--|
| Producto | **Backgrounds** (Sampleson) |
| Patch interno HISE | **Ai-cinescape** (nombres de XML / ScriptProcessors) |
| Bundle | `com.sampleson.backgrounds` |
| Plugin code | `Bakg` |
| Versión | `1.0.0` |
| Company | Sampleson / `Samp` / sampleson.com |
| Tipo | Instrument (`project_info.xml`) |
| Extra defs | `HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER=1` (todas las plataformas) |
| AppData global | **No** (`UseGlobalAppDataFolderMacOS/Windows = No`) → carpeta por producto |

El plugin **no genera audio en la máquina**. Busca camas ya hechas (`v6` + `v6_locations`) con CLAP y las estira. El audio de fábrica salió de **Stable Audio Open 1.0**.

**No hay** (y no reintroducir): layerCombo, Search, Fine Tune, bounce/export viejo, MIDI gen, SFX en la UI. No dejes paneles muertos `visible=0`: si no se usa, borralo. Ocultar capture / alerta / diálogo de licencia cuando toca **sí**.

---

## Relación con el original (sin asumir discos)

El repo vivo con git, tags, `library/`, `server/`, `generator/`, `native/` y el `AGENTS.md` largo del producto se llama **AI-cinescapes** (suele vivir bajo sketches / ideas, no acá).

Esta carpeta es **solo** el `HISE-project` de ese repo, copiada.

- Tag de producto: **`Backgrounds-1.0.0-release`** (commit *Lanzado 1.0.0*, 11 sep 2026).
- La copia se tomó el mismo día desde la rama `develop-emotions`, **un commit después** del tag (`Rebuilt dll`). Ese commit solo regeneró hashes embebidos en:
  - `AdditionalSourceCode/nodes/capture_DspNetwork_networkdata.h`
  - `AdditionalSourceCode/nodes/cinescapes_DspNetwork_networkdata.h`
- A nivel de producto es el release 1.0.0.
- Otro tag del original, `videoeditors_version_andando`, es **otra rama** (video editors), no este producto.

**Git acá:** no hay `.git` propio. El padre `dsphise` (remote típico `dsphise2026`) no trackea esta carpeta. No hay tags en ese repo. No trates esto como checkout del tag.

No está en esta copia (sí en AI-cinescapes): `library/`, `server/`, `generator/`, `native/`, `Legal/`, `PORT_WINDOWS.md`, historial.

Si hace falta regen de índice / ogg / CLAP / pack distro, ir al original. Acá solo está el payload ya empaquetado.

---

## Mapa de archivos (raíz = este proyecto HISE)

| Área | Path |
|------|------|
| UI + tags / canvas / capture / carga ogg / CLAP | `Scripts/ScriptProcessors/Ai-cinescape/Interface.js` |
| UI XML | `XmlPresetBackups/Ai-cinescapeUIData/Ai-cinescapeDesktop.xml` |
| Patch | `XmlPresetBackups/Ai-cinescape.xml` |
| Engine stretch | `DspNetworks/Networks/cinescapes_DspNetwork.xml` |
| Capture DSP | `DspNetworks/Networks/capture_DspNetwork.xml` |
| Custom nodes | `DspNetworks/ThirdParty/*.h` |
| Auth | `Scripts/Authorisation.js` (`PRODUCT_ID` = `ZpHkY`) |
| Capture I/O | `Scripts/audioRecorder.js` |
| Plugin vs standalone (paneles) | `Scripts/pluginVSstandalone.js` |
| Recording (sin red) | `Scripts/ScriptProcessors/Ai-cinescape/RecordingScript.js` |
| Recorder stub | `Scripts/ScriptProcessors/Ai-cinescape/Recorder.js` |
| Nombre / extra defs | `project_info.xml`, `user_info.xml` |
| Payload de shipping (oggs + CLAP) | `Semantic_s/distro/Semantic_s/` |
| README + layout distro | `Semantic_s/distro/Semantic_s/README.md` |
| Resumen pack | `Semantic_s/distro/Semantic_s/CONTENTS.txt` (pack 2026-09-01, banks v6 + v6_locations) |
| Copia installer | `Installer/MacOS/Semantic_s/` |
| Postinstall unzip | `Installer/MacOS/unzip_resources.sh` |
| pkg | `Installer/MacOS/Backgrounds.pkgproj` |

`Semantic_s/` en la raíz del proyecto es lo que HISE / el script usan en **dev**. Adentro hay metas, dylibs, onnx, tokenizer, **y** `distro/` (el pack limpio para AppData).

---

## Cómo se resuelven los .ogg (lo más importante)

`use_ogg = true` en `Interface.js`.

```
FileSystem.UserPresets
  → parent
    → Semantic_s/
      → v6_curated/{entry.id}.ogg
```

Funciones: `projectSemanticFolder()`, `wavPathForEntry()`. Si el ogg no existe, fallback `Semantic_s/wavs/{id}.wav` (en esta copia ese fallback está roto; ver symlinks).

`UserPresets` **cambia** según el contexto:

### En HISE (este proyecto)

`UserPresets` = `UserPresets/` del proyecto.  
Entonces busca: **`Semantic_s/v6_curated/{id}.ogg`** (hermano de `UserPresets`).

### App / plugin compilado

`UserPresets` = AppData del producto (porque `UseGlobalAppDataFolder* = No`):

```
~/Library/Application Support/Sampleson/Backgrounds/User Presets
```

Entonces busca:

```
~/Library/Application Support/Sampleson/Backgrounds/Semantic_s/v6_curated/{id}.ogg
```

El `.app` **no** mira adentro del bundle. Tampoco usa el symlink de esta copia. Si AppData no tiene `v6_curated`, el binario compilado no carga camas.

Windows (misma lógica, carpeta por producto): `%APPDATA%\Sampleson\Backgrounds\Semantic_s\v6_curated\`.

### Installer Mac

1. El pkg deja un zip en  
   `/Library/Application Support/Sampleson/Backgrounds/Semantic_s.zip`  
   (Application Support **de sistema**, no el del usuario).
2. `unzip_resources.sh` lo extrae a  
   `$HOME/Library/Application Support/Sampleson/Backgrounds/Semantic_s`  
   y borra el zip.

El contenido de ese pack es el de `Semantic_s/distro/Semantic_s/` (o la copia en `Installer/MacOS/Semantic_s/`). Copiar **el contenido** de distro, no la carpeta llamada `distro`.

Takes de capture **no** van a `Semantic_s`. Van al parent de User Presets (carpeta `Backgrounds` de AppData / raíz de proyecto). Nombre: `Background_<texto-de-cápsulas>_<tiempo+id>.wav`. Vacío: `Background_<id>.wav`. No crear `Captures/`.

---

## Symlinks en esta copia (estado actual)

El original apuntaba `Semantic_s/v6_curated` y `*/wavs` a `../../library/...` (library vive **al lado** del `HISE-project` en AI-cinescapes). Al copiar solo el proyecto HISE, esas rutas relativas **no existen**.

| Symlink | Antes (roto) | Ahora |
|---------|----------------|-------|
| `Semantic_s/v6_curated` | `../../library/v6_curated` | `distro/Semantic_s/v6_curated` (~2719 ogg) |
| `Semantic_s/wavs` | `../../library/wavs` | **sigue roto** |
| `AudioFiles/wavs` | `../../library/wavs` | **sigue roto** |

Si HISE no carga oggs: `ls -l Semantic_s/v6_curated` tiene que resolver a distro y listar `v6_*.ogg` / `v6loc_*.ogg`.

Otra copia de oggs: `Installer/MacOS/Semantic_s/v6_curated/` (~2709). Distro de producto = **v6 + v6_locations** solamente: no SFX, no FLAC, no `drum_detected_*`.

`CONTENTS.txt` del pack dice 2709 ogg (1 sep 2026). Distro en esta copia puede tener un poco más (~2719). No mezclar con el bank completo del original (~2775 si incluye `drum_detected_*` en library).

---

## Layout que el script espera en `Semantic_s/`

```
Semantic_s/
  v6_curated/
    v6_*.ogg              # music beds
    v6loc_*.ogg           # Places / locations
  meta_ucs_v6.json
  meta_ucs_v6_locations.json
  index.bin
  text_encoder.onnx       # fp16; I/O int64 / float32
  tokenizer/              # vocab.json + merges.txt (CLAP)
  libclap_search.dylib
  libonnxruntime.1.17.3.dylib
  libonnxruntime.dylib    # duplicado Mac; no borrar
  manifest.json
```

No shippear metas SFX (`meta_ucs_v6_sfx.json`, por categoría) ni legacy v2/v3/v5 en el pack de usuario.

CLAP en proceso: `Engine.createClapSearch()` sobre esa carpeta `Semantic_s/`. HTTP `:8766` es fallback de **dev**; el plugin **no** arranca `clap_server.py`. En el script puede quedar un `CLAP_BASE_URL` si falla lo nativo, pero **la constante no está definida** — no lo “arregles” salvo pedido.

Encoder grande fp32 (backup único) vive en el original: `library/clap/text_encoder.fp32.onnx`. Acá solo está el fp16 de distro.

Regen (en el original, no acá):

```bash
./library/sync_to_hise.sh
python3 library/clap_index.py --bank v6 --update
python3 library/clap_index.py --bank v6_locations --update
python3 library/export_clap_onnx.py --skip-onnx
./library/pack_semantic_distro.sh
```

---

## UI (contrato)

- Canvas **xyPad** + mix calm / fury / gold (cápsulas arrastrables). Mix máx. al centro; pan desde el centro de la pill.
- Máximo **3** cápsulas. Si ya hay tres: `maxNodesPanel` (“You can only use 3 nodes.”). **No** `Engine.showMessageBox`.
- `dropOntoImage`: visible con canvas vacío; se esconde con la primera cápsula (`syncDropOntoImage`).
- **tagsPanel** pestañas (el texto es label; la lógica usa índice 0…4):

  `ORCHESTRA-BASED` · `SYNTH-BASED` · `BASS-RUMBLES` · `PLACES` · `CUSTOM`

  Places → bank `v6_locations`. El resto → `v6`. Drag al canvas → búsqueda → carga cama. Letra de pestaña: **13**.
- Cápsulas: lápiz (prompt libre), refresh, delete. **No** chevron ni menú de presets.
- **stretchPlayBtn** + **pitchMatchBtn**.
- **capturePanelButton**: capture on → Rec / Play / onda; off → tags + pitch + play. Custom se esconde con capture.
- Rec: `g_record` + ScriptFX **`RecordingScript`** (sin red, después del EQ). Stop arma wav, fade **700 ms**. Play: Recorder slot 0, `capture_ratio=1`. No `slot.clear()` — `slot.loadFile("")`. **No** `Engine.renderAudio` para capture.
- Pie (`legalLabel`): *Generated audio is royalty-free for personal and commercial use, including music, film, games and advertising. No attribution required. See EULA for full terms.* Al lado: `infoScriptImage` (`img-info.png`). **No** ícono dibujado `legalInfoIcon`.
- Licencia: `Authorisation.js` + diálogo `AuthorisationDialogue`. `RegData.js` al lado de User Presets (AppData / raíz proyecto).

Constantes útiles en `Interface.js` (esta copia): `TOP_N = 20`, `PLAY_SLOT = 0`, `GOLD_SLOT = 1`, `FURY_SLOT = 4`, `CAPTURE_SLOT = 0`, `PLAY_SPEED = 0.15`, `GATE_ATTACK_MS = 400`, `use_ogg = true`. UI canvas `1024×680`.

### Qué graba el DAW / el .hip

El host solo guarda componentes con `saveInPreset=1`. Las variables de script **no**.

- Posición: paneles escondidos **Node 1 X/Y** (calm), **Node 2 X/Y** (fury), **Node 3 X/Y** (gold).
- Qué suena: label escondido `sessionStateLabel` → JSON `{ v, n1:{on,p,b,id}, n2, n3 }`. `p` = tag o texto tipeado (hace falta para refresh).
- Escritura: `writeSessionState()`. Lectura: `setupSessionState()` **después** de `loadBank()`. Preferir el `id` guardado (`ensureHitInList`). Guards: `skipStateCb`, `lastRestoredState`. Parse: `JSON.stringify` / `"".parseAsJSON()`.

---

## Banks

| Bank | En el plugin | Meta | ID prefix |
|------|--------------|------|-----------|
| **`v6`** | sí (beds) | `meta_ucs_v6.json` | `v6_*` (no loc / SFX) |
| **`v6_locations`** | sí (Places) | `meta_ucs_v6_locations.json` | `v6loc_` |
| `v6_sfx` y v2…v5 | no en UI | no shippear en distro | — |

Aliases de tooling (solo original): `v6loc` → `v6_locations`, `v6sfx`/`sfx` → `v6_sfx`.

---

## DSP

| ScriptFX | Network | Qué hace |
|----------|---------|----------|
| `Engine` | `cinescapes_DspNetwork` | `ch0_stretch` + `fury_stretch` + `gold_stretch` → spread. Gate `ch0_stretch_gate` (las tres). Attack de entrada: `GATE_ATTACK_MS` (400). Release gate ~50 ms. Speed `PLAY_SPEED` (acá **0.15**, no 0.1). |
| `RecordingScript` | *(ninguna)* | Copia L/R a `g_accumulator` si `g_record`. Si le ponés red, `processBlock` no corre. |
| `Recorder` | `capture_DspNetwork` | split dry + `oneshot_player` slot 0. Params: `capture_gate`, `capture_ratio`, `capture_gain`. |

`oneshot_player`: `isSuspendedOnSilence()` = **false** (si no, el fade mata el nodo).

---

## Ritual HISE

- Tras `Interface.js` / JS incluido: compile **script**.
- Tras XML de componente, DSP o `.h` de nodes: reload UI / compile **DSP networks**.
- Custom nodes: `DspNetworks/ThirdParty/*.h`.
- **No modificar source dentro de `HISE/`** salvo pedido explícito (excepción histórica: `ScriptClapSearch` / `Engine.createClapSearch`).
- No setear `x`/`y`/`width`/`height` desde JS salvo al colocar pills / prompt.
- Extra def `HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER=1` tiene que seguir en `project_info.xml` o el front se queja al arrancar.

### Trampas de script

- En un `setPaintRoutine` anónimo **no** uses `local`. Usá `inline function` o `var`.
- `g.drawEllipse([x,y,w,h], grosor)` — no 5 argumentos sueltos.
- `g.setOpacity` pinta mal el panel: `Colours.withAlpha(..., 0.95)`.
- Plugin vs standalone: `Engine.isPlugin()` en `pluginVSstandalone.js` (muestra un panel u otro). No cambia la ruta de oggs.

---

## Legal (ojo)

- El pie dice **no attribution** para **quien usa el audio** en peli / juego / aviso. Eso es hacia el usuario.
- Stability **sí** pide que **el producto** muestre **Powered by Stability AI** (EULA / about / web), un Notice, y su Community License al distribuir.
- Borrador EULA vive en el original (`docs/EULA-DRAFT.md`), no en esta copia. País/juzgado puede ser placeholder.
- Techo USD 1 millón/año: Sampleson vs el modelo, no el músico.
- No inventar “fair AI use”. Los oggs de fábrica: licencia de uso, no cesión de autor.

Auth: `Authorisation.js`, product id `ZpHkY`. No reimprimir secretos / PINs en chats.

---

## Si no suena / no carga

1. **HISE:** ¿`Semantic_s/v6_curated` resuelve a `distro/Semantic_s/v6_curated` y hay `*.ogg`? Si el symlink volvió a `../../library/...`, está roto.
2. **`.app` / VST / AU:** ¿existe AppData `…/Sampleson/Backgrounds/Semantic_s/v6_curated/*.ogg`? El symlink de este repo no aplica.
3. ¿Compilaste y estás oyendo el AppData viejo, no esta copia?
4. No asumas `library/` al lado de esta carpeta.
5. Capture no usa oggs de `v6_curated`; escribe wav al parent de User Presets.

---

## Qué no hacer

- No borrar ni “limpiar” `Semantic_s/distro/`, oggs, onnx, dylibs, tokenizer.
- No apuntar `v6_curated` otra vez a `../../library/...` salvo que library esté realmente dos niveles arriba (estructura del original).
- No meter SFX / `drum_detected_*` en el pack de usuario.
- No generar audio ni tocar RunPod desde esta copia (no está el server).
- No commitear esta carpeta a `dsphise` sin que lo pidan (hoy está untracked; es pesada).
- No tratar `HISE/` como código del producto.

---

## Changelog de esta copia

- **11 sep 2026:** copia de `HISE-project` ≈ `Backgrounds-1.0.0-release` + commit *Rebuilt dll*.
- **11 sep 2026:** `Semantic_s/v6_curated` re-apuntado a `distro/Semantic_s/v6_curated` para que HISE encuentre los ogg.
- Original del producto (UI, banks, legal, RunPod, gen): `AGENTS.md` en **AI-cinescapes**.
