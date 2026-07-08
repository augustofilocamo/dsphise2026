# Scripts

## `Scripts/loopSidecar.js`

Módulo compartido. Depende de símbolos definidos en `Interface.js` **antes** del `include`:

- `FreezerFx` → `Synth.getEffect("HardcodedMasterFX1")`
- `resolveAttrIdx(name)`
- `loopHasContent` (reg global LED)

### API pública (inline functions)

| Función | Cuándo |
|---------|--------|
| `initLoopSidecar()` | Boot; resuelve índices P13–P15, log, boot reload 150 ms |
| `prepareLoopSidecarPathForRec()` | Rec rising edge → `assignNewLoopSidecarId()` |
| `beginLoopSidecarRecording()` | Rec rising → limpia accumulator, `g_loopRecording=true` |
| `saveLoopSidecarAfterRec()` | Rec falling → pulse save + timer verify |
| `reloadLoopSidecarFromDisk()` | Host sync / boot → load WAV si id>0 |
| `tickLoopSidecarSavePending()` | Timer 20 ms → reset pulses + script fallback save |
| `abortLoopSidecarRecording()` | Clear / host reconfig → cancel pending save |

### Id en label (no en parámetro host)

```javascript
const var loopSidecarIdLabel = Content.getComponent("loopSidecarIdLabel");

getLoopSidecarId()  → parseSidecarIdText(label.get("text"))
setLoopSidecarId()  → label.set("text", formatSidecarId(n)) + FreezerFx.setAttribute(P13)
assignNewLoopSidecarId() → random 100000000–999999999 en cada Rec ON
```

`formatSidecarId()` evita notación científica en nombres de archivo.

### Pulses HISE-safe

```javascript
// Load / Save: primero 0, luego 1; reset del 0 en el timer siguiente
FreezerFx.setAttribute(idx, 0.0);
FreezerFx.setAttribute(idx, 1.0);
loopSidecarLoadResetPending = 1;  // o SaveResetPending
```

Pulsar 1→0 en el mismo mensaje a veces **no dispara** el edge en el DSP compilado.

---

## `Scripts/ScriptProcessors/Aeronaut/ScriptFXLoopTap.js`

Debe existir con el **mismo ID** que el módulo en la cadena FX: `ScriptFXLoopTap`.

Para **Aeronaut_demo**, copiar el archivo a:

`Scripts/ScriptProcessors/Aeronaut_demo/ScriptFXLoopTap.js`

(HISE resuelve script por carpeta del ScriptProcessor activo.)

Puntos clave:

- `g_loopTapSampleRate` solo se actualiza si `sampleRate > 0` en `prepareToPlay`.
- `Buffer.create(channels[0].length)` — **no** `Engine.getBufferSize()`.
- Escribe en `global g_loopAccumulator` mientras `g_loopRecording`.

---

## Hooks en `Interface.js` (full)

### Includes (orden)

```javascript
include("menuPanels.js");
include("Authorisation.js");   // demo: include("Demo.js");
// … FreezerFx, timers …
include("loopSidecar.js");
initLoopSidecar();
```

### `freezerBootstrap` — delayed reload

```javascript
freezerWakeTimer.setTimerCallback(function () {
    rePushAllAttributes(FreezerFx, "… [delayed]");
    reloadLoopSidecarFromDisk();
    freezerWakeTimer.stopTimer();
});
```

### `onHostAudioReconfigured(reason)`

Copiar bloque completo del full: reset transport, `abortLoopSidecarRecording()`, `reloadLoopSidecarFromDisk()`, re-push attrs, restart timers.

Requiere `ScriptFX1.js` + `ScriptFX1HostAudioSyncGen`.

### `tickRecCountdown()`

Rec rising:

```javascript
prepareLoopSidecarPathForRec();
beginLoopSidecarRecording();
```

Rec falling (si no clear):

```javascript
loopHasContent = 1;
saveLoopSidecarAfterRec();
```

### `tickRecCountdownTimer()`

Al final del tick, antes de `tickRecCountdown()`:

```javascript
tickLoopSidecarSavePending();
```

### `tickLed()` — Clear

Añadir `abortLoopSidecarRecording();` en rising edge de clear.

---

## `Scripts/Demo.js`

Runtime demo autocontenido (timer, mute, overlay). **No** forma parte del sidecar.

Para portarlo a otro proyecto HISE, ver [PORT_AERONAUT_DEMO.md](./PORT_AERONAUT_DEMO.md).
