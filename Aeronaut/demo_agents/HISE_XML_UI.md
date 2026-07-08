# HISE — XML y UI

## Cadena FX (`Aeronaut.xml` / preset del DAW)

Orden en `EffectChain` → `ChildProcessors`:

1. `Simple Gain Makeup`
2. **`ScriptFXLoopTap`** ← insertar aquí
3. `HardcodedMasterFX1` (`spectral_freeze_node`)
4. `ScriptFX1`
5. … resto

Snippet:

```xml
<Processor Type="ScriptFX" ID="ScriptFXLoopTap" Bypassed="0">
  …
</Processor>
<Processor Type="Hardcoded Master FX" ID="HardcodedMasterFX1" …
           LoopSidecarId="0.0" LoopSidecarLoad="0.0" LoopSidecarSave="0.0">
```

`LoopSidecarId="0.0"` en factory preset — **no** hardcodear un id viejo.

## Label oculto (`AeronautDesktop.xml`)

```xml
<Component type="ScriptLabel" id="loopSidecarIdLabel" x="0.0" y="0.0" text="0"
           width="1.0" height="1.0" visible="0" saveInPreset="1" editable="0"/>
```

## Preset Interface Content (`Aeronaut.xml`)

Dentro de `<Processor Type="ScriptProcessor" ID="Interface">` → `<Content>`:

```xml
<Control type="ScriptLabel" id="loopSidecarIdLabel" value="0"/>
```

HISE persiste el label como `value` en el preset del processor; Logic guarda el estado del plugin al salvar el proyecto.

## ScriptProcessor demo

Duplicar en:

- `XmlPresetBackups/Aeronaut_demoUIData/Aeronaut_demoDesktop.xml` — componente label
- `XmlPresetBackups/Aeronaut_demo.xml` — Control + attrs LoopSidecar* en HardcodedMasterFX1

## Recargar UI en HISE

Tras editar XML a mano:

1. Reload preset / reimport UIData.
2. Verificar en UI editor que existe `loopSidecarIdLabel` (invisible).
3. Re-export frontend.

Si falta el label, consola: `[Aeronaut] WARN: loopSidecarIdLabel missing`.

## `project_info.xml`

```xml
<ExtraDefinitionsOSX value="USE_RELATIVE_PATH_FOR_AUDIO_FILES=1"/>
<ExtraDefinitionsWindows value="USE_RELATIVE_PATH_FOR_AUDIO_FILES=1"/>
```

Sin esto, `FileSystem.AudioFiles` en export puede no apuntar a AppData y el script/C++ desincronizan rutas.
