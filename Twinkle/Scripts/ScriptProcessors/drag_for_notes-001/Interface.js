#on

#if !HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER
// If this causes an error, you need to add HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER=1
// to your ExtraDefinitions of the project and rebuild the component tree (either reload the patch)
// or click on the refresh icon in the interface designer)
Console.assertTrue(false);
#endif

Content.makeFrontInterface(1024, 680);
Engine.loadAudioFilesIntoPool();

// Sync to host bpm
Engine.setHostBpm(-1);

// Includes
include("MidiRecorder.js");
include("laf.js");
include("menuPanels.js");
include("pluginVSstandalone.js");
include("presetBrowser.js");
include("Authorisation.js");

// Limpiar grabador MIDI
MIDIPlayer2.clearAllSequences();
MIDIPlayer2.stop(0);

// — vars —
const var FX      = Synth.getEffect("Script FX1");
const var Label1  = Content.getComponent("Label1");
const var Pad     = Content.getComponent("XYPadPnl");
const var IDX     = Content.getAllComponents(".*").indexOf(Pad);
const var uph     = Engine.createUserPresetHandler();
var isDrag = false;

var lastXPos;
var lastYPos;
var lastNotePlayed = -1; // Declarar a nivel global para evitar repeticiones entre ciclos

// panel
Pad.set("allowCallbacks","All Callbacks");
Pad.set("isPluginParameter", true);
Pad.set("pluginParameterName", "PackedXY");


// Custom cursor
var pathDataMagic = 
[110,109,0,192,1,68,92,175,253,67,108,164,208,0,68,20,46,253,67,108,246,8,1,68,133,75,251,67,108,154,89,0,68,61,170,252,67,108,61,74,255,67,10,87,251,67,108,61,202,255,67,195,53,253,67,108,92,239,253,67,31,197,253,67,108,20,206,255,67,102,70,254,67,108,
164,144,255,67,133,75,255,67,108,51,211,252,67,41,28,2,68,108,20,78,253,67,20,62,2,68,108,51,19,0,68,0,96,255,67,108,20,94,0,68,61,202,254,67,108,143,18,1,68,184,14,0,68,108,143,210,0,68,184,62,254,67,108,0,192,1,68,92,175,253,67,99,101,0,0];

var magicWandPath = Content.createPath();
magicWandPath.loadFromData(pathDataMagic);
//Pad.setMouseCursor(magicWandPath, Colours.white, [0, 0]);


// Note path
var pathDataNote = [110,109,195,53,237,67,0,128,129,67,98,185,30,204,67,82,184,31,67,195,53,172,67,62,138,203,66,154,25,152,67,0,144,66,62,108,154,25,152,67,10,215,35,62,108,82,24,152,67,10,215,35,62,98,195,21,152,67,174,71,225,61,236,17,152,67,142,194,117,61,92,15,152,
67,0,0,0,0,108,205,12,152,67,10,215,35,62,108,0,0,139,67,10,215,35,62,108,0,0,139,67,215,227,59,68,98,236,209,105,67,164,80,49,68,20,46,18,67,154,9,52,68,112,61,153,66,61,154,66,68,98,0,133,107,64,163,224,81,68,64,10,173,193,225,90,104,68,202,204,160,
65,184,206,116,68,98,173,71,119,66,72,161,128,68,173,199,26,67,153,249,126,68,81,184,99,67,51,179,111,68,98,51,147,137,67,30,197,101,68,71,33,151,67,20,206,88,68,61,10,152,67,123,132,77,68,108,153,25,152,67,123,132,77,68,108,153,25,152,67,246,136,76,
68,98,225,26,152,67,62,26,76,68,71,33,152,67,226,170,75,68,153,25,152,67,113,61,75,68,108,153,25,152,67,154,25,54,67,98,245,104,172,67,113,189,69,67,153,249,223,67,123,20,118,67,82,216,234,67,134,75,170,67,98,164,240,241,67,1,0,204,67,41,252,238,67,144,
98,232,67,154,249,225,67,174,151,8,68,98,31,5,223,67,133,187,12,68,11,87,228,67,20,158,13,68,134,75,231,67,205,140,11,68,98,1,64,234,67,225,122,9,68,21,78,244,67,246,136,249,67,144,66,247,67,226,122,239,67,98,82,56,250,67,20,110,229,67,154,41,7,68,133,
43,179,67,195,53,237,67,0,128,129,67,99,101,0,0];


var notePath = Content.createPath();

notePath.loadFromData(pathDataNote);



// — callback DAW/UI —
inline function onPadControl(cmp, value)
{
  if (isDrag) return;

  // desempaquetar 4 dígitos:
  local raw  = Math.round(value * 9999.0);
  local Xint = Math.floor(raw / 100);
  local Yint = raw % 100;
  local x    = Xint / 100.0;
  local y    = Yint / 100.0;

  // aplicar al efecto
  FX.setAttribute(FX.Position1, x);
  FX.setAttribute(FX.Position2, y);

  // mostrar
  local xD = Math.round(x * 100.0) / 100.0;
  local yD = Math.round(y * 100.0) / 100.0;
  local pD = Math.round(value * 10000.0) / 10000.0;
  Label1.set("text",
     "Decoded → X:" + xD
   + " Y:"    + yD
   + " Pack:" + pD);
  Pad.repaint();
}
Pad.setControlCallback(onPadControl);



// — CONFIG —
var bpm = Engine.getHostBpm(); // tempo dinámico del host
// Opciones: "1/1", "1/2", "1/2T", "1/4", "1/4T", "1/8", "1/8T", "1/16", "1/16T", "1/32", "1/32T", "1/64", "1/64T", "Free"
var division = "Free";

inline function getIntervalInMs(bpm, division)
{
    local beatMs = 60000 / bpm;
    switch (division) {
        case "1/1":   return beatMs * 4;      // redonda
        case "1/2":   return beatMs * 2;      // blanca
        case "1/2T":  return beatMs * 4 / 3;  // blanca tresillo
        case "1/4":   return beatMs;          // negra
        case "1/4T":  return beatMs * 2 / 3;  // negra tresillo
        case "1/8":   return beatMs / 2;      // corchea
        case "1/8T":  return beatMs / 3;      // corchea tresillo
        case "1/16":  return beatMs / 4;      // semicorchea
        case "1/16T": return beatMs / 6;      // semicorchea tresillo
        case "1/32":  return beatMs / 8;      // fusa
        case "1/32T": return beatMs / 12;     // fusa tresillo
        case "1/64":  return beatMs / 16;     // semifusa
        case "1/64T": return beatMs / 24;     // semifusa tresillo
        case "Free": return Math.randInt(40, 80); // aleatorio entre 40 y 80 ms
        default:      return beatMs;           // negra por defecto
    }
}

var interval = getIntervalInMs(bpm, division);


// === MODOS GRIEGOS ===
var greekModes = [
    {name: "Ionian (Major)",     intervals: [0, 2, 4, 5, 7, 9, 11]},      // 0
    {name: "Dorian",             intervals: [0, 2, 3, 5, 7, 9, 10]},      // 1
    {name: "Phrygian",           intervals: [0, 1, 3, 5, 7, 8, 10]},      // 2
    {name: "Lydian",             intervals: [0, 2, 4, 6, 7, 9, 11]},      // 3
    {name: "Mixolydian",         intervals: [0, 2, 4, 5, 7, 9, 10]},      // 4
    {name: "Aeolian (Natural Minor)", intervals: [0, 2, 3, 5, 7, 8, 10]}, // 5
    {name: "Locrian",            intervals: [0, 1, 3, 5, 6, 8, 10]},      // 6
    {name: "Harmonic Minor",     intervals: [0, 2, 3, 5, 7, 8, 11]},      // 7
    {name: "Melodic Minor",      intervals: [0, 2, 3, 5, 7, 9, 11]},      // 8
    {name: "Double Harmonic Major", intervals: [0, 1, 4, 5, 7, 8, 11]},   // 9
    {name: "Hungarian Minor",    intervals: [0, 2, 3, 6, 7, 8, 11]},      // 10
    {name: "Neapolitan Minor",   intervals: [0, 1, 3, 5, 7, 8, 11]},      // 11
    {name: "Neapolitan Major",   intervals: [0, 1, 3, 5, 7, 9, 11]},      // 12
    {name: "Major Pentatonic",   intervals: [0, 2, 4, 7, 9]},             // 13
    {name: "Minor Pentatonic",   intervals: [0, 3, 5, 7, 10]},            // 14
    {name: "Blues",              intervals: [0, 3, 5, 6, 7, 10]},         // 15
    {name: "Major Blues",        intervals: [0, 2, 3, 4, 7, 9]},          // 16
    {name: "Whole Tone",         intervals: [0, 2, 4, 6, 8, 10]},          // 17
    {name: "Diminished (Half-Whole)", intervals: [0, 1, 3, 4, 6, 7, 9, 10]}, // 18
    {name: "Diminished (Whole-Half)", intervals: [0, 2, 3, 5, 6, 8, 9, 11]}, // 19
    {name: "Augmented",          intervals: [0, 3, 4, 7, 8, 11]},          // 20
    {name: "Enigmatic",          intervals: [0, 1, 4, 6, 8, 10, 11]},      // 21
    {name: "Persian",            intervals: [0, 1, 4, 5, 6, 8, 11]},       // 22
    {name: "Byzantine",          intervals: [0, 1, 4, 5, 7, 8, 11]},       // 23
    {name: "Arabian",            intervals: [0, 2, 4, 5, 6, 8, 10]},       // 24
    {name: "Egyptian",           intervals: [0, 2, 5, 7, 10]},             // 25
    {name: "Hirajoshi",          intervals: [0, 2, 3, 7, 8]},              // 26
    {name: "Japanese (In Sen)",  intervals: [0, 1, 5, 7, 10]},             // 27
    {name: "Balinese",           intervals: [0, 1, 3, 7, 8]},              // 28
    {name: "Chinese",            intervals: [0, 4, 6, 7, 11]},             // 29
    {name: "Romanian Minor",     intervals: [0, 2, 3, 6, 7, 9, 10]},       // 30
    {name: "Spanish 8-tone",     intervals: [0, 1, 3, 4, 5, 6, 8, 10]},    // 31
    {name: "Chromatic",          intervals: [0,1,2,3,4,5,6,7,8,9,10,11]}    // 32
];

var leftModeIndex  = 31; // Minor Natural (por defecto)
var rightModeIndex = 31; // Blues (por defecto)
var leftMode  = greekModes[leftModeIndex];
var rightMode = greekModes[rightModeIndex];
var rootNoteLeft  = 60; // C4 para el extremo izquierdo
var rootNoteRight = 60; // F4 para el extremo derecho



// ======= Funciones de generacion de escalas =========
// --- Variables globales para las escalas ---

var leftScale = [];
var rightScale = [];

function updateScales()
{
    leftMode = greekModes[leftModeIndex];
    rightMode = greekModes[rightModeIndex];

    leftScale = [];
    rightScale = [];
    var octave, i;
    for (octave = 0; octave < 3; octave++)
    {
        for (i = 0; i < leftMode.intervals.length; i++)
            leftScale.push(rootNoteLeft + leftMode.intervals[i] + octave * 12);

        for (i = 0; i < rightMode.intervals.length; i++)
            rightScale.push(rootNoteRight + rightMode.intervals[i] + octave * 12);
    }
    
    
    // Imprimir las escalas en la consola
    Console.print("Left Scale: " + leftScale.join(", "));
    Console.print("Right Scale: " + rightScale.join(", "));
}

// Combo box left Scales
var scaleNames = [
    "Ionian (Major)", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian (Natural Minor)", "Locrian", "Harmonic Minor", "Melodic Minor", "Double Harmonic Major", "Hungarian Minor", "Neapolitan Minor", "Neapolitan Major", "Major Pentatonic", "Minor Pentatonic", "Blues", "Major Blues", "Whole Tone", "Diminished (Half-Whole)", "Diminished (Whole-Half)", "Augmented", "Enigmatic", "Persian", "Byzantine", "Arabian", "Egyptian", "Hirajoshi", "Japanese (In Sen)", "Balinese", "Chinese", "Romanian Minor", "Spanish 8-tone", "Chromatic"
];


// Array de notas MIDI de C2 a C4 y sus nombres
var noteNumbersC2aC5 = [];
var noteNamesC2aC5 = [];
var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
for (i = 36; i <= 72; i++) {
    noteNumbersC2aC5.push(i);
    var octave = parseInt(Math.floor(i / 12) - 1);
    var name = noteNames[i % 12] + octave;
    noteNamesC2aC5.push(name);
}

// Array de notas MIDI para combo de la derecha shifteado dos octavas
var noteNamesC2aC5_shifted = [];
for (i = 0; i < noteNamesC2aC5.length; i++) {
    var noteName = noteNamesC2aC5[i];
    var octavePos = noteName.length - 1;
    var name = noteName.substring(0, octavePos); // "C", "C#", etc.
    var octave = parseInt(noteName.substring(octavePos, octavePos + 1));
    var shiftedOctave = octave + 2;
    noteNamesC2aC5_shifted.push(name + shiftedOctave);
}

// Poblar el ComboBox de notas raíz izquierda
var noteLeftComboBox = Content.getComponent("noteLeftComboBox");
noteLeftComboBox.set("items", noteNamesC2aC5.join("\n"));


// Poblar el ComboBox de notas raíz derecha
var noteRightComboBox = Content.getComponent("noteRightComboBox");
noteRightComboBox.set("items", noteNamesC2aC5_shifted.join("\n"));


// Comob boxes noteas
inline function onnoteLeftComboBoxControl(component, value)
{
    // value es 1-based, array es 0-based
    rootNoteLeft = noteNumbersC2aC5[value - 1];
    updateScales(); // Si quieres que se regenere la escala
};
noteLeftComboBox.setControlCallback(onnoteLeftComboBoxControl);


inline function onnoteRightComboBoxControl(component, value)
{
    // value es 1-based, array es 0-based
    rootNoteRight = noteNumbersC2aC5[value - 1];
    updateScales(); // Si quieres que se regenere la escala
};
noteRightComboBox.setControlCallback(onnoteRightComboBoxControl);
    
    
// Comob boxes escalas
inline function onleftScalesComboBoxControl(component, value)
{
    leftModeIndex = value - 1;
    updateScales();
    updateDescriptionLabels();
};

Content.getComponent("leftScalesComboBox").setControlCallback(onleftScalesComboBoxControl);


inline function onrightScalesComboBoxControl(component, value)
{
    rightModeIndex = value - 1;
    updateScales();
    updateDescriptionLabels();
};

Content.getComponent("rightScalesComboBox").setControlCallback(onrightScalesComboBoxControl);



// Opciones de división rítmica para el ComboBox
var divisionOptions = [
    "1/1", "1/2", "1/2T", "1/4", "1/4T", "1/8", "1/8T",
    "1/16", "1/16T", "1/32", "1/32T", "1/64", "1/64T", "Free"
];


var divisionComboBox = Content.getComponent("divisionComboBox");
divisionComboBox.set("items", divisionOptions.join("\n"));

inline function onDivisionComboBoxControl(component, value)
{
    division = divisionOptions[value - 1];
    // Usar BPM actual del host al cambiar división
    bpm = Engine.getHostBpm();
    interval = getIntervalInMs(bpm, division);
}
divisionComboBox.setControlCallback(onDivisionComboBoxControl);


// Opciones de patrón para el ComboBox
var patternOptions = ["Random", "Run", "Trill", "Double Mordent", "Auxiliary Trill"];
var currentPattern = "Random";
var patternComboBox = Content.getComponent("patternComboBox");
patternComboBox.set("items", patternOptions.join("\n"));



inline function onPatternComboBoxControl(component, value)
{
    currentPattern = patternOptions[value - 1];
}
patternComboBox.setControlCallback(onPatternComboBoxControl);


// Funcion de interpolacion de escalas
inline function interpolateScales(leftScale, rightScale, t)
{
    local length = Math.min(leftScale.length, rightScale.length);
    local scale = [];
    local i;
    for (i = 0; i < length; i++)
    {
        // Elegí nota más cercana al blend
        if (t < 0.5)
            scale.push(leftScale[i]);
        else
            scale.push(rightScale[i]);
    }
    return scale;
}


const var noteList = [];

// --- Generación de notas random aislada en función ---
function getRandomNotes(mixedScale, minIndex, maxIndex, notesCount, lastNotePlayed) {
    var notesToPlay = [];
    for (var j = 0; j < notesCount; j++)
    {
        var noteToPlay = lastNotePlayed;
        var attempts = 0;
        while (noteToPlay == lastNotePlayed && attempts < 10)
        {
            var randomIndex = Math.randInt(minIndex, maxIndex);
            noteToPlay = mixedScale[randomIndex];
            attempts++;
        }
        notesToPlay.push(noteToPlay);
        lastNotePlayed = noteToPlay;
    }
    return notesToPlay;
}

// --- Generación de arpegio fijo 0,2,1,3,4 sobre 5 notas centrales ---
function getArpeggio321Notes(mixedScale, minIndex, maxIndex, notesCount, lastNotePlayed) {
    var notesToPlay = [];
    var totalNotes = maxIndex - minIndex + 1;
    var center = Math.floor((minIndex + maxIndex) / 2);
    var idx0 = Math.max(minIndex, center - 2);
    var idx1 = Math.max(minIndex, center - 1);
    var idx2 = center;
    var idx3 = Math.min(maxIndex, center + 1);
    var idx4 = Math.min(maxIndex, center + 2);
    var arpNotes = [mixedScale[idx0], mixedScale[idx1], mixedScale[idx2], mixedScale[idx3], mixedScale[idx4]];
    var pattern = [0, 2, 1, 3, 4];
    var patternIdx = 0;
    
    for (var j = 0; j < notesCount; j++) {
        var noteToPlay = lastNotePlayed;
        var attempts = 0;
        while (noteToPlay == lastNotePlayed && attempts < 10) {
            var patIdx = pattern[patternIdx % pattern.length];
            noteToPlay = arpNotes[patIdx];
            patternIdx++;
            attempts++;
        }
        notesToPlay.push(noteToPlay);
        lastNotePlayed = noteToPlay;
    }
    return notesToPlay;
}

// --- Generación de tremolo de 7 notas ---
function getTremoloNotes(mixedScale, minIndex, maxIndex, notesCount, lastNotePlayed) {
    var notesToPlay = [];
    var totalNotes = maxIndex - minIndex + 1;
    
    // Si el rango es chico, usar todas las notas disponibles
    var tremNotes = [];
    if (totalNotes <= 7) {
        // Usar todas las notas del rango
        for (var i = minIndex; i <= maxIndex; i++) {
            tremNotes.push(mixedScale[i]);
        }
    } else {
        // Usar 7 notas centrales
        var center = Math.floor((minIndex + maxIndex) / 2);
        var idx0 = Math.max(minIndex, center - 3);
        var idx1 = Math.max(minIndex, center - 2);
        var idx2 = Math.max(minIndex, center - 1);
        var idx3 = center;
        var idx4 = Math.min(maxIndex, center + 1);
        var idx5 = Math.min(maxIndex, center + 2);
        var idx6 = Math.min(maxIndex, center + 3);
        tremNotes = [mixedScale[idx0], mixedScale[idx1], mixedScale[idx2], mixedScale[idx3], mixedScale[idx4], mixedScale[idx5], mixedScale[idx6]];
    }
    
    // Patrón más variado que evite quedarse pegado
    var pattern = [];
    var numNotes = tremNotes.length;
    if (numNotes >= 3) {
        pattern = [0, 2, 1, 2, 0, 1, 2, 1, 0, 2, 1, 0]; // patrón más complejo
    } else {
        // Si hay pocas notas, alternar de forma más variada
        for (var i = 0; i < 12; i++) {
            pattern.push(i % numNotes);
        }
    }
    
    var patternIdx = 0;
    for (var j = 0; j < notesCount; j++) {
        var noteToPlay = lastNotePlayed;
        var attempts = 0;
        while (noteToPlay == lastNotePlayed && attempts < 10) {
            var patIdx = pattern[patternIdx % pattern.length];
            noteToPlay = tremNotes[patIdx];
            patternIdx++;
            attempts++;
        }
        notesToPlay.push(noteToPlay);
        lastNotePlayed = noteToPlay;
    }
    return notesToPlay;
}

// --- Generación de mordente doble ---
function getDoubleMordentNotes(mixedScale, minIndex, maxIndex, notesCount, lastNotePlayed) {
    var notesToPlay = [];
    var totalNotes = maxIndex - minIndex + 1;
    
    // Si el rango es chico, usar todas las notas disponibles
    var mordNotes = [];
    if (totalNotes <= 5) {
        // Usar todas las notas del rango
        for (var i = minIndex; i <= maxIndex; i++) {
            mordNotes.push(mixedScale[i]);
        }
    } else {
        // Usar 5 notas centrales
        var center = Math.floor((minIndex + maxIndex) / 2);
        var idx0 = Math.max(minIndex, center - 2);
        var idx1 = Math.max(minIndex, center - 1);
        var idx2 = center;
        var idx3 = Math.min(maxIndex, center + 1);
        var idx4 = Math.min(maxIndex, center + 2);
        mordNotes = [mixedScale[idx0], mixedScale[idx1], mixedScale[idx2], mixedScale[idx3], mixedScale[idx4]];
    }
    
    // Patrón de mordente doble: C-D-C-B-C
    var pattern = [];
    var numNotes = mordNotes.length;
    if (numNotes >= 5) {
        pattern = [2, 3, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1]; // centro-arriba-centro-abajo-centro
    } else {
        // Si hay pocas notas, adaptar el patrón
        var center = Math.floor(numNotes / 2);
        pattern = [center, Math.min(center + 1, numNotes - 1), center, Math.max(center - 1, 0), center];
    }
    
    var patternIdx = 0;
    for (var j = 0; j < notesCount; j++) {
        var noteToPlay = lastNotePlayed;
        var attempts = 0;
        while (noteToPlay == lastNotePlayed && attempts < 10) {
            var patIdx = pattern[patternIdx % pattern.length];
            noteToPlay = mordNotes[patIdx];
            patternIdx++;
            attempts++;
        }
        notesToPlay.push(noteToPlay);
        lastNotePlayed = noteToPlay;
    }
    return notesToPlay;
}

// --- Generación de trino con nota auxiliar ---
function getAuxiliaryTrillNotes(mixedScale, minIndex, maxIndex, notesCount, lastNotePlayed) {
    var notesToPlay = [];
    var totalNotes = maxIndex - minIndex + 1;
    
    // Si el rango es chico, usar todas las notas disponibles
    var trillNotes = [];
    if (totalNotes <= 4) {
        // Usar todas las notas del rango
        for (var i = minIndex; i <= maxIndex; i++) {
            trillNotes.push(mixedScale[i]);
        }
    } else {
        // Usar 4 notas centrales
        var center = Math.floor((minIndex + maxIndex) / 2);
        var idx0 = Math.max(minIndex, center - 1);
        var idx1 = center;
        var idx2 = Math.min(maxIndex, center + 1);
        var idx3 = Math.min(maxIndex, center + 2);
        trillNotes = [mixedScale[idx0], mixedScale[idx1], mixedScale[idx2], mixedScale[idx3]];
    }
    
    // Patrón de trino con nota auxiliar: C-D-E-D-C-D-E-D
    var pattern = [];
    var numNotes = trillNotes.length;
    if (numNotes >= 4) {
        pattern = [1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 3, 2]; // centro-arriba-auxiliar-arriba-centro
    } else {
        // Si hay pocas notas, adaptar el patrón
        for (var i = 0; i < 12; i++) {
            pattern.push(i % numNotes);
        }
    }
    
    var patternIdx = 0;
    for (var j = 0; j < notesCount; j++) {
        var noteToPlay = lastNotePlayed;
        var attempts = 0;
        while (noteToPlay == lastNotePlayed && attempts < 10) {
            var patIdx = pattern[patternIdx % pattern.length];
            noteToPlay = trillNotes[patIdx];
            patternIdx++;
            attempts++;
        }
        notesToPlay.push(noteToPlay);
        lastNotePlayed = noteToPlay;
    }
    return notesToPlay;
}

// --- Timer del pad ---
var notesToTurnOff = [];
var cycleCounter = 0; // Contador de ciclos para controlar cuándo disparar notas

Pad.setTimerCallback(function()
{
    // Actualizar BPM del host en cada ciclo
    bpm = Engine.getHostBpm();
    
    // Recalcular intervalo con el BPM actualizado
    interval = getIntervalInMs(bpm, division);
    
    // Timer: usar intervalos para divisiones fijas, 40ms fijo para Free
    if (division == "Free") {
        this.startTimer(40); // Timer fijo para Free
    } else {
        this.startTimer(interval); // Usar intervalos para divisiones fijas
    }
    
    // Incrementar contador de ciclos
    cycleCounter++;
    
    // Solo disparar notas si hay datos del mouse
    if (this.data && this.data.x !== undefined && this.data.y !== undefined) {
        // Calcular delta del mouse
        var deltaX = Math.abs(this.data.x - lastXPos);
        var deltaY = Math.abs(this.data.y - lastYPos);
        var totalDelta = deltaX + deltaY;
        
        var shouldPlayNotes = false;
        
        if (division == "Free") {
            // Sistema de ciclos solo para Free
            var cyclesToSkip;
            if (totalDelta <= 0.01) {
                cyclesToSkip = 7; // Poco movimiento: disparar cada 7 ciclos (280ms)
            } else if (totalDelta >= 0.02) {
                cyclesToSkip = 1; // Mucho movimiento: disparar en todos los ciclos (40ms)
            } else {
                // Interpolación lineal entre 7 y 1 ciclos
                cyclesToSkip = Math.round(7 - (totalDelta - 0.01) * (6 / 0.01));
            }
            
            // Solo disparar notas si es el ciclo correcto
            if (cycleCounter >= cyclesToSkip) {
                cycleCounter = 0; // Resetear contador
                shouldPlayNotes = true;
            }
        } else {
            // Para divisiones fijas, disparar en cada ciclo del timer
            shouldPlayNotes = true;
        }
        
        if (shouldPlayNotes) {
            
            // Apagar las notas del ciclo anterior
            for (var i = 0; i < notesToTurnOff.length; i++) {
                Synth.noteOffFromUI(1, notesToTurnOff[i]);
            }
            notesToTurnOff = [];
            
            var velocity = Math.min(127, Math.max(20, totalDelta * 5000));
            var notesToPlay = [];
            
            if (totalDelta > 0) {
                var xPos = this.data.x;
                var mixedScale = interpolateScales(leftScale, rightScale, xPos);
                var scaleName = leftMode.name + " <-> " + rightMode.name;
                var totalNotes = mixedScale.length;
                
                // Agregar variación aleatoria al rango de notas
                var randomOffset = Math.randInt(-2, 2); // offset de -2 a +2
                var centerIndex = Math.floor(xPos * totalNotes) + randomOffset;
                if (centerIndex >= totalNotes)
                    centerIndex = totalNotes - 1;
                if (centerIndex < 0)
                    centerIndex = 0;
                var minIndex = centerIndex - 5;
                var maxIndex = centerIndex + 4;
                if (minIndex < 0)
                    minIndex = 0;
                if (maxIndex >= totalNotes)
                    maxIndex = totalNotes - 1;
                
                // Si no hay movimiento, expandir el rango de notas
                if (totalDelta < 0.01) { // umbral muy bajo para detectar poco movimiento
                    var expansion = 3; // expandir 3 notas hacia cada lado
                    minIndex = Math.max(0, minIndex - expansion);
                    maxIndex = Math.min(totalNotes - 1, maxIndex + expansion);
                }
                
                var scaledVelocity = totalDelta * 1; // notesDensityFactor = 1
                var notesCount = Math.floor(scaledVelocity);
                if (notesCount < 1)
                    notesCount = 1;
                if (notesCount > 6)
                    notesCount = 6;
                
                // Selección de patrón según el ComboBox
                if (currentPattern == "Random") {
                    notesToPlay = getRandomNotes(mixedScale, minIndex, maxIndex, notesCount, lastNotePlayed);
                } else if (currentPattern == "Run") {
                    notesToPlay = getArpeggio321Notes(mixedScale, minIndex, maxIndex, notesCount, lastNotePlayed);
                } else if (currentPattern == "Trill") {
                    notesToPlay = getTremoloNotes(mixedScale, minIndex, maxIndex, notesCount, lastNotePlayed);
                } else if (currentPattern == "Double Mordent") {
                    notesToPlay = getDoubleMordentNotes(mixedScale, minIndex, maxIndex, notesCount, lastNotePlayed);
                } else if (currentPattern == "Auxiliary Trill") {
                    notesToPlay = getAuxiliaryTrillNotes(mixedScale, minIndex, maxIndex, notesCount, lastNotePlayed);
                }
                
                for (var j = 0; j < notesToPlay.length; j++) {
                    Synth.playNoteFromUI(1, notesToPlay[j], velocity);
                    // Repintamos la notas en UI
                    Pad.repaint();
                    
                    if (division == "Free") {
                        Console.print("totalDelta: " + totalDelta + " → ciclos: " + cyclesToSkip + " (" + (cyclesToSkip * 40) + "ms)");
                    } else {
                        Console.print("División: " + division + " → intervalo: " + interval + "ms");
                    }
                    Console.print("Nota tocada >> " + notesToPlay[j]);
                    lastNotePlayed = notesToPlay[j];
                }
                
                lastXPos = this.data.x;
                lastYPos = this.data.y;
            }
            
            // Guardar las notas tocadas para apagarlas en el próximo ciclo
            notesToTurnOff = notesToPlay;
        }
    }
});



var mouseNormX = -1;
var mouseNormY = -1;



// — callback mouse —
Pad.setMouseCallback(function(e)
{
  if (e.clicked && !e.drag && !e.rightClick)
  {
    this.data.down = true;
    isDrag = true;
    uph.sendParameterGesture(2, IDX, true);
  }
  if (e.mouseUp && this.data.down)
  {
    this.data.down = false;
    isDrag = false;
    uph.sendParameterGesture(2, IDX, false);
    //Engine.allNotesOff();
  }
  if (e.drag)
  {
    // normalizar
    this.data.x = Math.range(e.x / this.getWidth(),  0, 1);
    this.data.y = Math.range(e.y / this.getHeight(), 0, 1);

    // empaquetar en 4 dígitos
    var Xint    = Math.floor(this.data.x * 100.0);
    var Yint    = Math.floor(this.data.y * 100.0);
    var encoded = Xint * 100 + Yint;    // 0..9999
    var normVal = encoded / 9999.0;     // [0..1]

    // enviar al DAW
    Pad.setValue(normVal);
    Pad.changed();

    // aplicar al efecto
    FX.setAttribute(FX.Position1, this.data.x);
    FX.setAttribute(FX.Position2, this.data.y);

    // mostrar
    var xD = Math.round(this.data.x * 100.0) / 100.0;
    var yD = Math.round(this.data.y * 100.0) / 100.0;
    var pD = Math.round(normVal * 10000.0) / 10000.0;
    Label1.set("text",
       "Pack→" + pD
     + " X:"   + xD
     + " Y:"   + yD);
     
     mouseNormX = e.x / Pad.getWidth();
     mouseNormY = e.y / Pad.getHeight();
     

     
//    Pad.repaint();
  }
});


// PaintRoutine

var gridCols = 28;
var gridRows = 20;
var circleRadius = 0;
var circleRadiusActive = 40;



Pad.setPaintRoutine(function(g)
{
    var padWidth = Pad.getWidth();
    var padHeight = Pad.getHeight();

    for (var row = 0; row < gridRows; row++)
    {
        for (var col = 0; col < gridCols; col++)
        {
            // Centro de cada círculo
            var cx = (col + 0.5) * padWidth / gridCols;
            var cy = (row + 0.5) * padHeight / gridRows;

            // Distancia del mouse al centro
            var dist = Math.sqrt(
                Math.pow(mouseNormX * padWidth - cx, 2) +
                Math.pow(mouseNormY * padHeight - cy, 2)
            );

            // Si el mouse está cerca, agrandar
            var radius = (dist < circleRadiusActive) ? circleRadiusActive : circleRadius;

            //g.setColour(Colours.fromVec4([234, 40, 147, Math.random()]);
            g.setColour(Colours.fromVec4([
                234/255, 
                40/255, 
                147/255, 
                Math.random()
            ]));

            //g.fillEllipse([cx - radius, cy - radius, radius * 2, radius * 2]);
            //var randSize = Math.random();
            g.fillPath(notePath, [cx - radius, cy - radius, radius * 1.2, radius * 2]);
            
        }
    }
});



// Instrument selector

const var instrComboBox = Content.getComponent("instrComboBox");

// Referencias a los samplers
const var SineWaveGeneratorBells = Synth.getChildSynth("Sine Wave Generator Bells");
const var Sampler_pizz    = Synth.getChildSynth("Sampler_pizz");
const var Sampler_spic    = Synth.getChildSynth("Sampler_spic");
const var Sampler_harp    = Synth.getChildSynth("Sampler_harp");
const var Sampler_xylo    = Synth.getChildSynth("Sampler_xylo");
const var Sampler_marimba = Synth.getChildSynth("Sampler_marimba");

var samplers = [SineWaveGeneratorBells, Sampler_pizz, Sampler_spic, Sampler_harp, Sampler_xylo, Sampler_marimba];

inline function onInstrComboBoxControl(component, value)
{
    local i;
    for (i = 0; i < samplers.length; i++)
        samplers[i].setBypassed(true);

    // Activa el seleccionado (ajustando value - 1)
    if (value > 0 && (value - 1) < samplers.length)
        samplers[value - 1].setBypassed(false);
}

instrComboBox.setControlCallback(onInstrComboBoxControl);



function onNoteOn()
{
	
	/* PROCESO PARA USAR EL GRABADOR MIDI */
	// Recording pasa notas al recorder.js
	if (!Message.isArtificial() && Record.getValue() == 1) // si es nota real y si esta grabando
	{
		//Message.ignoreEvent(true);	
		//local recorderVelocityOut = velocity * veloMakeUp;
		local recorderTimestamp = Engine.getUptime() - timeStart;
		
//		midiPlayButton.getValue() == 1 ? recorderVelocityOut : recorderVelocityOut = nextVelocityState * veloMakeUp;
//inline function addNoteOn(list, channel, notenumber, velocity, noteOnTime)
		addNoteOn(recording, Message.getChannel(), Message.getNoteNumber(), Message.getVelocity(), recorderTimestamp);	 	
	}

	Message.sendToMidiOut();
}
 function onNoteOff()
{
	
	if (Record.getValue() == 1) // si esta grabando
		{ 
//			for (var i = 0; i < noteMelodyPairs.length; i++) 
//			{		    
//			    if (noteMelodyPairs[i].realNote == noteNumber)	// Si realNote coincide con la nota que se soltó
//			    {
			        addNoteOff(recording, Message.getChannel(), Message.getNoteNumber(), Engine.getUptime() - timeStart);	// Apaga la nota generada asociada (genNote)       
//			        noteMelodyPairs.removeElement(i);	// Removemos la el pair apagado
//			    }
//			}	
		}

	Message.sendToMidiOut();
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
 
// Array de descripciones de escalas
var scaleDescriptions = [
    "Ionian (Major): Bright, uplifting, and triumphant. Ideal for scenes of joy, reunion, and hope. Evokes a sense of security, home, and accomplishment, making it perfect for victories, happy endings, and moments of pure emotional fulfillment.",
    "Dorian: Hopeful yet introspective. Blends warmth and melancholy, often used for heroic journeys or character growth. Fits scenes of determination, adventure, or bittersweet progress, adding depth and subtle optimism.",
    "Phrygian: Dark, tense, and exotic. Creates a mysterious or ancient atmosphere, often used for danger, suspense, or foreign lands. Perfect for unsettling or mystical moments where intrigue and caution prevail.",
    "Lydian: Dreamy, magical, and expansive. Suggests wonder, discovery, or the supernatural. Great for fantasy, moments of awe, or when the world feels enchanting and limitless. Enhances scenes of imagination and hope.",
    "Mixolydian: Festive, relaxed, and rootsy. Brings a folk or bluesy color, suitable for travel, camaraderie, or celebration. Good for lighthearted adventures, friendships, or scenes with a sense of freedom and fun.",
    "Aeolian (Natural Minor): Somber, emotional, and nostalgic. Highlights sadness, loss, or introspection. Common for tragedies, memories, or struggles, giving weight to scenes of grief, solitude, or emotional transformation.",
    "Locrian: Unstable, unsettling, and chaotic. Evokes danger, tension, or disaster. Rarely used, but ideal for horror, collapse, or moments of deep threat where safety feels distant or lost.",
    "Harmonic Minor: Dramatic, mysterious, and exotic. Associated with passion or suspense, perfect for intense confrontations, betrayals, or scenes set in Eastern or dramatic contexts, adding tension and intrigue.",
    "Melodic Minor: Sophisticated, longing, and evolving. Conveys ambition or personal growth, suited for journeys, internal conflict, or transformation. Brings subtle hope and complexity to character arcs.",
    "Double Harmonic Major: Majestic, ritualistic, and exotic. Suggests royalty, ancient cultures, or mystical ceremonies. Ideal for epic revelations, ancestral traditions, or powerful, otherworldly moments.",
    "Hungarian Minor: Intense, dramatic, and passionate. Evokes suspense, urgency, or deep emotion. Ideal for chase scenes, dramatic confrontations, or moments filled with tension and dark, swirling energy.",
    "Neapolitan Minor: Operatic, tragic, and full of drama. Highlights sorrow, fate, or internal struggle. Suited for heartbreaking revelations, doomed romances, or moments of emotional turmoil and grand conflict.",
    "Neapolitan Major: Elegant, mysterious, and nostalgic. Conveys classic intrigue or bittersweet memories. Great for scenes with refined drama, sophisticated settings, or subtle tension beneath a graceful surface.",
    "Major Pentatonic: Peaceful, innocent, and uplifting. Evokes simplicity, nature, and happiness. Perfect for childhood memories, open landscapes, or moments of calm and contentment, adding a gentle, positive vibe.",
    "Minor Pentatonic: Reflective, soulful, and earthy. Suggests longing or quiet strength. Used in scenes of introspection, resilience, or emotional honesty, often coloring journeys with a sense of grounded melancholy.",
    "Blues: Soulful, gritty, and expressive. Captures struggle, resilience, or bittersweet triumph. Ideal for urban dramas, personal setbacks, or stories of hope rising from adversity and deep emotion.",
    "Major Blues: Hopeful, warm, and optimistic. Balances cheerfulness with depth, fitting for scenes of perseverance, close friendships, or renewed optimism after struggle, adding a heartfelt and comforting touch.",
    "Whole Tone: Surreal, ambiguous, and dreamlike. Suggests fantasy, confusion, or altered reality. Great for dream sequences, magical transformations, or moments when the world feels off-balance and mysterious.",
    "Diminished (Half-Whole): Tense, suspenseful, and menacing. Intensifies fear, unpredictability, or imminent danger. Perfect for horror, climactic threats, or scenes where chaos and anxiety are at their peak.",
    "Diminished (Whole-Half): Ominous, disorienting, and unstable. Conveys menace or dread, used for nightmares, suspenseful pursuits, or unraveling sanity, providing a dark and unsettling atmosphere.",
    "Augmented: Strange, surreal, and uneasy. Evokes mystery, magical realism, or disorientation. Ideal for scenes with unexpected twists, supernatural events, or when reality bends in unsettling or wondrous ways.",
    "Enigmatic: Puzzling, ambiguous, and secretive. Fits moments of intrigue, riddles, or the unknown. Perfect for mysteries, hidden truths, or scenes that need an unresolved, otherworldly feeling.",
    "Persian: Exotic, tense, and dramatic. Suggests ancient intrigue or mysterious cultures. Works for tales of betrayal, hidden plots, or settings steeped in tradition and suspenseful atmosphere.",
    "Byzantine: Majestic, sacred, and ritualistic. Implies history, power, or spiritual mystery. Excellent for religious ceremonies, ancient empires, or scenes revealing secret societies or lost knowledge.",
    "Arabian: Adventurous, exotic, and vibrant. Evokes journeys through deserts, bustling markets, or ancient cities. Best for tales of discovery, danger, or settings with rich cultural textures.",
    "Egyptian: Mysterious, ancient, and sparse. Brings desert landscapes, ancient civilizations, or riddles of the past to life. Great for epic quests, forgotten tombs, or moments of cryptic revelation.",
    "Hirajoshi: Reflective, serene, and delicate. Conjures Japanese scenery, gentle introspection, or subtle sorrow. Suitable for quiet reflection, nature scenes, or emotional farewells.",
    "Japanese (In Sen): Calm, meditative, and graceful. Evokes temple gardens, rain, or peaceful rituals. Perfect for scenes of contemplation, tradition, or harmonious beauty in a serene setting.",
    "Balinese: Hypnotic, mystical, and festive. Suggests trance, celebration, or ritual magic. Works for dream sequences, exotic festivals, or spiritual awakenings in lush, tropical surroundings.",
    "Chinese: Tranquil, poetic, and timeless. Implies wisdom, nature, or deep harmony. Best for scenic journeys, family traditions, or moments of quiet beauty and gentle reflection.",
    "Romanian Minor: Urgent, vibrant, and folkloric. Adds a sense of restless energy, passion, or regional color. Great for chase scenes, rustic celebrations, or dramatic twists rooted in tradition and emotional intensity.",
    "Spanish 8-tone: Fiery, passionate, and dramatic. Evokes flamenco, duels, and tension-filled encounters. Ideal for heated arguments, dances, or scenes where cultural intensity and raw emotion are front and center.",
    "Chromatic: Chaotic, anxious, and unpredictable. Conveys madness, disorder, or spiraling events. Used for climactic breakdowns, surreal montages, or moments when logic dissolves and only emotion or confusion remains."
];

// Función para actualizar los labels de descripción
function updateDescriptionLabels() {
    var leftDescriptionLabel = Content.getComponent("leftDescriptionLabel");
    var rightDescriptionLabel = Content.getComponent("rightDescriptionLabel");
    
    // Actualizar label izquierdo
    if (leftModeIndex >= 0 && leftModeIndex < scaleDescriptions.length) {
        leftDescriptionLabel.set("text", scaleDescriptions[leftModeIndex]);
    }
    
    // Actualizar label derecho
    if (rightModeIndex >= 0 && rightModeIndex < scaleDescriptions.length) {
        rightDescriptionLabel.set("text", scaleDescriptions[rightModeIndex]);
    }
}

// Iniciar el timer
Pad.startTimer(40);
 