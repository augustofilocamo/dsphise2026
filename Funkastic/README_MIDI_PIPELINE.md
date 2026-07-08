# Pipeline de MIDIs - Documentación

## 📋 Resumen

Este proyecto empaqueta **35,928 archivos MIDI** con metadata en el plugin usando el sistema de Factory Content de HISE.

**Estructura final:**
```
MidiFiles/              → 35,928 archivos MIDI (empaquetados automáticamente)
Scripts/midiIndex.js    → Índice con metadata (embebido en el script)
library/wgth_data.dat   → ⚠️ YA NO SE USA (eliminado)
```

---

## 🔄 Pipeline Completo

### 1. Archivos MIDI Originales

**Ubicación:** `mldata/`

**Formato de nombres:**
```
{type}_{id}_{category}_{tone}_{mode}_{density}_full.mid

Ejemplo:
base_9354_44_E_dorian_high_full.mid
  └─ type: base
  └─ id: 9354
  └─ category: 44
  └─ tone: E
  └─ mode: dorian
  └─ density: high
```

### 2. Preparar MIDIs para HISE

**Copiar a la carpeta MidiFiles del proyecto:**
```bash
cd "/path/to/HISE/Project"
rsync -av mldata/ MidiFiles/
```

✅ **Resultado:** 35,928 archivos `.mid` en `MidiFiles/`

---

### 3. Generar el Índice JavaScript

**📝 Método Directo (Recomendado):**

Lee los nombres de archivos MIDI y genera `midiIndex.js` directamente:

```bash
python3 create_midiindex_js.py
```

**Output esperado:**
```
=== GENERANDO midiIndex.js ===
Leyendo MIDIs desde: mldata/
✓ MIDIs encontrados: 35928
✓ Archivo creado: Scripts/midiIndex.js
  Tamaño: 7.85 MB

📋 Primera entrada:
  Type: base
  ID: 9354
  Category: 44
  Tone: E
  Mode: dorian
  Density: high

✅ Listo para usar en HISE
```

**El script:**
- ✅ Lee nombres de archivos en `mldata/`
- ✅ Parsea metadata desde el nombre
- ✅ Genera `Scripts/midiIndex.js` directamente
- ✅ No requiere pasos intermedios

---

<details>
<summary><b>📦 Método Alternativo (con .dat encriptado)</b></summary>

Si prefieres usar un archivo encriptado intermedio:

**1. Abrir el script en HISE:**
```
Scripts/ScriptProcessors/export_index_to_js/Interface.js
```

**2. Compilar en HISE**

Lee `library/wgth_data.dat`, desencripta y crea `Scripts/midiIndex.js`

**Console Output:**
```
=== EXPORTANDO ÍNDICE A JAVASCRIPT ===
Entradas: 35928
✓ Archivo creado: Scripts/midiIndex.js
```

</details>

---

## 🔍 Estructura del Índice

**Formato en `midiIndex.js`:**
```javascript
const var midiIndex = [
  {
    "type": "base",
    "midi_id": "9354",
    "category": 44,
    "tone": "E",
    "mode": "dorian",
    "density": "high",
    "file": "27089.dat"  // Campo legacy, no se usa
  },
  // ... 35,927 entradas más
];
```

**Campos:**
- `type`: Tipo de patrón (base, M7, b5, penta)
- `midi_id`: ID único del MIDI
- `category`: Cluster/categoría (0-99)
- `tone`: Tonalidad original (siempre "E")
- `mode`: Modo musical (dorian, ionian, mixololydian)
- `density`: Densidad de notas (low, medium, high)

---

## 🛠️ Cómo se Usa en el Plugin

**En `Interface.js`:**
```javascript
// 1. Incluir el índice
include("midiIndex.js");

// 2. Construir path del MIDI
inline function getMidiFilePath(midiData)
{
    local fileName = buildMidiFileName(midiData);
    return "{PROJECT_FOLDER}" + fileName;
}

inline function buildMidiFileName(midiData)
{
    return midiData.type + "_" + 
           midiData.id + "_" + 
           midiData.category + "_" + 
           midiData.tone + "_" + 
           midiData.mode + "_" + 
           midiData.density + "_full.mid";
}

// 3. Filtrar MIDIs
local filtered = filterMidiFiles("base", -1, "E", "dorian", "high");

// 4. Cargar MIDI
local randomFile = filtered[Math.randInt(0, filtered.length)];
local midiPath = getMidiFilePath(randomFile);
mp.setFile(midiPath, true, true);
```

**El wildcard `{PROJECT_FOLDER}`:**
- **En HISE (desarrollo):** → `ProjectFolder/MidiFiles/`
- **En plugin compilado:** → Pool embebido en el binario

---

## 📦 Compilación y Distribución

### Compilar el Plugin

**macOS:**
```bash
cd Binaries/
./batchCompileOSX
```

**Windows:**
```
Abrir Binaries/Builds/VisualStudio2017/*.sln
Build → Release
```

### Qué se Empaqueta

**✅ Incluido en el binario:**
- `MidiFiles/` (35,928 archivos) → Pool automático
- `Scripts/midiIndex.js` → Compilado en el script
- `Images/` → ImageResources.dat
- Scripts compilados

**❌ NO incluido:**
- `library/wgth_data.dat` → Ya no se usa
- Código fuente
- Samples (se distribuyen por separado si existen)

### Tamaño Final del Plugin

- **Binario del plugin:** ~15-20 MB
- **MIDIs embebidos:** ~6 MB
- **Índice embebido:** ~8 MB (comprimido en el script)

---

## 🔧 Mantenimiento

### Agregar Nuevos MIDIs

1. **Agregar archivos a `mldata/`** con el formato correcto
2. **Actualizar el dataset** que genera el índice
3. **Regenerar `library/wgth_data.dat`** (si usas ese método)
4. **Ejecutar `export_index_to_js`** en HISE
5. **Copiar nuevos MIDIs a `MidiFiles/`**
6. **Recompilar el plugin**

### Cambiar la Clave de Encriptación

Si cambias `"tu_clave_secreta_aqui_123"`:

1. **Re-encriptar** `library/wgth_data.dat` con la nueva clave
2. **Actualizar** la clave en `export_index_to_js/Interface.js`
3. **Regenerar** `midiIndex.js`

### Debugging

**Si los MIDIs no cargan:**
```javascript
// Agregar logs en getMidiFilePath
Console.print("Intentando cargar: " + fileName);
Console.print("Path completo: " + midiPath);
```

**Si el índice está vacío:**
```javascript
// Verificar en onInit
Console.print("Índice cargado: " + midiIndex.length + " entradas");
Console.print("Primera entrada: " + JSON.stringify(midiIndex[0]));
```

---

## 📚 Archivos Clave

| Archivo | Propósito | Se Distribuye |
|---------|-----------|---------------|
| `MidiFiles/*.mid` | Archivos MIDI (35,928) | ✅ (en pool) |
| `Scripts/midiIndex.js` | Índice con metadata | ✅ (compilado) |
| `Scripts/ScriptProcessors/export_index_to_js/` | Generador del índice | ❌ |
| `library/wgth_data.dat` | Índice encriptado legacy | ❌ (obsoleto) |
| `mldata/` | MIDIs originales (backup) | ❌ |

---

## ✅ Checklist Pre-Distribución

- [ ] `MidiFiles/` contiene todos los MIDIs (35,928)
- [ ] `Scripts/midiIndex.js` existe y tiene ~7-8 MB
- [ ] `Interface.js` usa `include("midiIndex.js")`
- [ ] Compilado funciona en HISE (carga MIDIs correctamente)
- [ ] Plugin compilado funciona standalone
- [ ] Plugin compilado funciona en DAW (Ableton, Logic, etc.)
- [ ] Filtros por tipo/modo/density funcionan
- [ ] Transposición funciona correctamente
- [ ] Historial de navegación funciona

---

## 🐛 Problemas Comunes

**"Archivos MIDI en índice: undefined"**
- El `midiIndex.js` no se generó correctamente
- Regenerar con `export_index_to_js`

**"isEmpty = 1, sequences = 0"**
- El wildcard `{PROJECT_FOLDER}` no se está resolviendo
- Verificar que el archivo MIDI existe en `MidiFiles/`

**"Filtrados: 0 archivos"**
- El índice está vacío o corrupto
- Verificar la estructura de datos en `midiIndex.js`

**Plugin compilado no encuentra MIDIs**
- Asegurarse de que `MidiFiles/` está en la raíz del proyecto
- HISE debe detectarlos automáticamente al compilar

---

## 📝 Notas Técnicas

- **Lazy Loading:** Solo el MIDI actual está en RAM (~200 bytes)
- **Pool Automático:** HISE empaqueta `MidiFiles/` al compilar
- **Índice Embebido:** `midiIndex.js` se compila en el script
- **Wildcard Resolution:** `{PROJECT_FOLDER}` es resuelto por HISE en runtime
- **No Obfuscación:** Los nombres originales se mantienen (no afecta seguridad)

---

## 📞 Soporte

Si necesitas regenerar el pipeline completo desde cero, seguí los pasos en orden:
1. Preparar MIDIs originales → `mldata/`
2. Crear índice encriptado → `library/wgth_data.dat`
3. Exportar a JavaScript → `Scripts/midiIndex.js`
4. Copiar MIDIs a proyecto → `MidiFiles/`
5. Compilar plugin → `Binaries/Compiled/`

