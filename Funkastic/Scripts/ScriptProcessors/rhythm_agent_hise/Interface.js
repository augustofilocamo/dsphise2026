Content.makeFrontInterface(600, 600);

const var mp = Synth.getMidiPlayer("MIDI Player1");
const var TypesComboBox = Content.getComponent("TypesComboBox");
const var TonesComboBox = Content.getComponent("TonesComboBox");
const var ModesComboBox = Content.getComponent("ModesComboBox");
const var DensityComboBox = Content.getComponent("DensityComboBox");
const var GenerateButton = Content.getComponent("Generate");
const var VelocityKnob = Content.getComponent("VelocityKnob");
const var QuantizeComboBox = Content.getComponent("QuantizeComboBox");


// Cargar datos encriptados
const var projectFolder = FileSystem.getFolder(FileSystem.Samples).getParentDirectory();
const var indexFile = projectFolder.getChildFile("library/wgth_data.dat");
const var midiIndex = indexFile.loadEncryptedObject("tu_clave_secreta_aqui_123");

Console.print("=== CARGA DESDE ÍNDICE ENCRIPTADO ===");
Console.print("Archivos MIDI en índice: " + midiIndex.length);

// BPM para probar
Engine.setHostBpm(78);

// Parseo desde índice (ya viene parseado)
inline function parseMidiFromIndex(indexEntry)
{
    return {
        type: indexEntry.type,
        id: parseInt(indexEntry.midi_id),
        category: parseInt(indexEntry.category),
        tone: indexEntry.tone,
        mode: indexEntry.mode,
        density: indexEntry.density,
        file: indexEntry.file  // Nombre del archivo .dat
    };
}

// Parsea el índice completo
var ParsedMidiFiles = [];

for (i = 0; i < midiIndex.length; i++)
{
    ParsedMidiFiles.push(parseMidiFromIndex(midiIndex[i]));
}



// Función para obtener valores únicos de cada categoría
inline function printAvailableOptions()
{
    local types = [];
    local modes = [];
    local densities = [];
    
    // Recorre todos los archivos
    for (i = 0; i < ParsedMidiFiles.length; i++)
    {
        local f = ParsedMidiFiles[i];
        
        // Agrega valores únicos
        if (types.indexOf(f.type) == -1) types.push(f.type);
        if (modes.indexOf(f.mode) == -1) modes.push(f.mode);
        if (densities.indexOf(f.density) == -1) densities.push(f.density);
    }
    
    Console.print("=== OPCIONES DISPONIBLES ===");
    Console.print("Types: " + types.join(", "));
    Console.print("Modes: " + modes.join(", "));
    Console.print("Densities: " + densities.join(", "));
    
    // Poblar ComboBoxes
    TypesComboBox.set("items", types.join("\n"));
    ModesComboBox.set("items", modes.join("\n"));
    DensityComboBox.set("items", densities.join("\n"));
    
    // Todas las tonalidades (originales en E)
    local allTones = ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"];
    TonesComboBox.set("items", allTones.join("\n"));
    
    // Opciones de cuantización
    QuantizeComboBox.set("items", "Off\n1/4\n1/8\n1/8 Swing 54%\n1/8 Swing 58%\n1/8 Swing 62%\n1/8 Swing 66%\n1/16\n1/16 Swing 66%\n1/32");
}
printAvailableOptions();




// Filtra archivos MIDI por tags específicos
inline function filterMidiFiles(type, category, tone, mode, density)
{
    local filtered = [];
    
    for (i = 0; i < ParsedMidiFiles.length; i++)
    {
        local file = ParsedMidiFiles[i];
        local match = true;
        
        // Si se especifica type, debe coincidir
        if (type != "" && file.type != type)
            match = false;
            
        // Si se especifica category, debe coincidir
        if (category >= 0 && file.category != category)
            match = false;
            
        // Si se especifica tone, debe coincidir
        if (tone != "" && file.tone != tone)
            match = false;
            
        // Si se especifica mode, debe coincidir
        if (mode != "" && file.mode != mode)
            match = false;
            
        // Si se especifica density, debe coincidir
        if (density != "" && file.density != density)
            match = false;
            
        if (match)
            filtered.push(file);
    }
    
    return filtered;
}


// Modifica velocities del MIDI Player
inline function applyVelocityModification(velocityMultiplier)
{
    // Extraer eventos de la secuencia 1 (one-based)
    local midiEvents = mp.getEventListFromSequence(1);
    
    if (typeof midiEvents == "undefined" || midiEvents.length == 0)
        return false;
    
    // Modificar velocities
    for (i = 0; i < midiEvents.length; i++)
    {
        if (midiEvents[i].isNoteOn())
        {
            local newVel = Math.min(127, Math.round(midiEvents[i].getVelocity() * velocityMultiplier));
            midiEvents[i].setVelocity(newVel);
        }
    }
    
    // Escribir eventos modificados de vuelta
    mp.flushMessageListToSequence(midiEvents, 1);
    
    return true;
}


// Calcula semitonos de transposición desde E (E es el centro)
inline function getTranspositionFromE(targetTone)
{
    local toneMap = {
        "E": 0,
        "F": 1,
        "F#": 2,
        "Gb": 2,
        "G": 3,
        "G#": 4,
        "Ab": 4,
        "A": 5,
        "A#": 6,
        "Bb": 6,
        "B": 7,
        "C": -4,
        "C#": -3,
        "Db": -3,
        "D": -2,
        "D#": -1,
        "Eb": -1
    };
    
    if (typeof toneMap[targetTone] != "undefined")
        return toneMap[targetTone];
    
    return 0;
}


// Transpone notas del MIDI Player
inline function applyTransposition(semitones)
{
    if (semitones == 0)
        return true;
    
    // Extraer eventos de la secuencia 1 (one-based)
    local midiEvents = mp.getEventListFromSequence(1);
    
    if (typeof midiEvents == "undefined" || midiEvents.length == 0)
        return false;
    
    // Transponer notas
    for (i = 0; i < midiEvents.length; i++)
    {
        if (midiEvents[i].isNoteOn() || midiEvents[i].isNoteOff())
        {
            local originalNote = midiEvents[i].getNoteNumber();
            local transposedNote = Math.max(0, Math.min(127, originalNote + semitones));
            midiEvents[i].setNoteNumber(transposedNote);
        }
    }
    
    // Escribir eventos modificados de vuelta
    mp.flushMessageListToSequence(midiEvents, 1);
    
    return true;
}


// Parsea la cuantización y retorna [gridSize, swingAmount]
inline function parseQuantization(quantizeText)
{
    if (quantizeText == "Off") return [0, 0];
    if (quantizeText == "1/4") return [1.0, 0];
    if (quantizeText == "1/8") return [0.5, 0];
    if (quantizeText == "1/8 Swing 54%") return [0.5, 0.54];
    if (quantizeText == "1/8 Swing 58%") return [0.5, 0.58];
    if (quantizeText == "1/8 Swing 62%") return [0.5, 0.62];
    if (quantizeText == "1/8 Swing 66%") return [0.5, 0.66];
    if (quantizeText == "1/16") return [0.25, 0];
    if (quantizeText == "1/16 Swing 66%") return [0.25, 0.66];
    if (quantizeText == "1/32") return [0.125, 0];
    return [0, 0];
}


// Cuantiza eventos con swing, preservando duraciones mínimas
inline function applyQuantization(gridSize, swingAmount)
{
    // gridSize: tamaño del grid en quarter beats, 0 = Off
    // swingAmount: 0.5 = straight, 0.66 = tresillo, etc.
    
    if (gridSize == 0)
        return true; // Sin cuantización
    
    local midiEvents = mp.getEventListFromSequence(1);
    
    if (typeof midiEvents == "undefined" || midiEvents.length == 0)
        return false;
    
    // Duración mínima para ghost notes (20ms)
    local minDuration = Engine.getSamplesForMilliSeconds(20);
    
    // Guardar Note On cuantizados por nota
    local noteOnTimestamps = [];
    for (i = 0; i < 128; i++)
        noteOnTimestamps[i] = -1;
    
    for (i = 0; i < midiEvents.length; i++)
    {
        local note = midiEvents[i].getNoteNumber();
        local timestamp = midiEvents[i].getTimestamp();
        
        // Convertir a quarter beats
        local quarterBeats = Engine.getQuarterBeatsForSamples(timestamp);
        
        // Cuantizar
        local gridIndex = Math.round(quarterBeats / gridSize);
        local quantizedBeats = gridIndex * gridSize;
        
        // Aplicar swing SOLO a Note On en off-beats (índices impares)
        if (midiEvents[i].isNoteOn() && swingAmount > 0 && gridIndex % 2 == 1)
        {
            local swingOffset = (swingAmount - 0.5) * gridSize;
            quantizedBeats += swingOffset;
        }
        
        // Convertir de vuelta a samples
        local quantizedTimestamp = Engine.getSamplesForQuarterBeats(quantizedBeats);
        
        // Guardar Note On o ajustar Note Off
        if (midiEvents[i].isNoteOn())
        {
            noteOnTimestamps[note] = quantizedTimestamp;
            midiEvents[i].setTimestamp(quantizedTimestamp);
        }
        else if (midiEvents[i].isNoteOff())
        {
            // Si hay Note On previo, forzar duración mínima
            if (noteOnTimestamps[note] >= 0)
            {
                local offTimestamp = quantizedTimestamp;
                
                // Si Note Off cae antes o muy cerca del Note On, moverlo adelante
                if (offTimestamp <= noteOnTimestamps[note] + minDuration)
                {
                    offTimestamp = noteOnTimestamps[note] + minDuration;
                }
                
                midiEvents[i].setTimestamp(offTimestamp);
                noteOnTimestamps[note] = -1; // Reset
            }
            else
            {
                midiEvents[i].setTimestamp(quantizedTimestamp);
            }
        }
        else
        {
            midiEvents[i].setTimestamp(quantizedTimestamp);
        }
    }
    
    mp.flushMessageListToSequence(midiEvents, 1);
    
    return true;
}




inline function onGenerateControl(component, value)
{
    // Obtiene los valores seleccionados de cada ComboBox
    local selectedType = TypesComboBox.getItemText();
    local selectedTone = TonesComboBox.getItemText();
    local selectedMode = ModesComboBox.getItemText();
    local selectedDensity = DensityComboBox.getItemText();
    
    Console.print("=== FILTRO ===");
    Console.print("Type: " + selectedType);
    Console.print("Tone: " + selectedTone);
    Console.print("Mode: " + selectedMode);
    Console.print("Density: " + selectedDensity);
    
    // Filtra con los valores seleccionados (siempre busca en E, el tone original)
    local filtered = filterMidiFiles(selectedType, -1, "E", selectedMode, selectedDensity);
    
    Console.print("Filtrados: " + filtered.length + " archivos");
    
    // Si hay archivos, carga uno random
    if (filtered.length > 0)
    {
        local randomFile = filtered[Math.randInt(0, filtered.length)];
        
        // Buscar el archivo ofuscado correspondiente
        local encryptedFolder = projectFolder.getChildFile("library");
        local encryptedFile = encryptedFolder.getChildFile(randomFile.file);
        
        // Cargar MIDI
        mp.setFile(encryptedFile.toString(0), true, true);
        
        // Aplicar transposición según tone seleccionado
        local semitones = getTranspositionFromE(selectedTone);
        applyTransposition(semitones);
        
        // Aplicar cuantización con swing si está seleccionada
        local quantizeText = QuantizeComboBox.getItemText();
        local quantizeParams = parseQuantization(quantizeText);
        applyQuantization(quantizeParams[0], quantizeParams[1]);
        
        // Obtener valor de velocity del knob
        local velocityMultiplier = VelocityKnob.getValue();
        
        // Si el knob no es 1.0, modificar velocities
        if (velocityMultiplier != 1.0)
        {
            applyVelocityModification(velocityMultiplier);
        }
        
        // Log
        local logMsg = ">>> Loaded: " + randomFile.type + "_" + randomFile.id + " (" + randomFile.mode + "/" + randomFile.density + ")";
        if (semitones != 0)
            logMsg += " | Transpose: " + semitones + " (" + selectedTone + ")";
        if (quantizeParams[0] != 0)
            logMsg += " | Quantize: " + quantizeText;
        if (velocityMultiplier != 1.0)
            logMsg += " | Vel: " + velocityMultiplier;
        Console.print(logMsg);
    }
}

GenerateButton.setControlCallback(onGenerateControl);



inline function onPlayControl(component, value)
{
	if (value){
		mp.play(0);
	} else {
		mp.stop(0);
	}
};

Content.getComponent("Play").setControlCallback(onPlayControl);


function onNoteOn()
{
	
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 