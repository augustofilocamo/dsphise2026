Content.makeFrontInterface(1024, 680);
include("menuPanels.js");
include("Matrices_Variables.js");	// Variables del Tío Markov
include("Create_Markov_Chain.js");	// Procesos para crear las probabilidades
include("MIDI_Generation.js");		// UI y procesos para generar midi
include("MidiRecorder.js");			// Graba midi generado en MIDI Player 2
include("MidiStuckFix.js");			// Logica de onNoteOf para que no haya notas colgadas
include("uiControls.js");			// Botones de la UI para tocar y grabar
include("circlesAnim.js");			// Anima de circulos
include("curateMidi.js");			// Cura midis antes de cargase
include("laf.js");					// Look and Feel 
include("dropPanel.js");			// Panel donde se arrastran los midis
//include("autoPlay.js");				// Genera notas sin marko

// Variables globales para el tiempo y la nota actual
const var envelope = Synth.getModulator("AHDSR Envelope1") // Se puede volar
var bpm = Engine.getHostBpm(); // Toma bpm del multipista

// Tomar el reproductor midi
const var midiPlayer1 = Synth.getMidiPlayer("MIDI Player1");



// Inicializa el Midi record y play
//setMidiPlayer();


// Modulos de sonido
const var Sampler1 = Synth.getChildSynth("Sampler1");
const var Sampler2 = Synth.getChildSynth("Sampler2");
const var Sampler3 = Synth.getChildSynth("Sampler3");
const var SynthesiserGroup1 = Synth.getChildSynth("Synthesiser Group1");


//Inits Generales

// Inits para pintar circulos y leer midi cargado por default
curateMidi(); // Cura el midi arrastrado
readMidiFile(); // lee midi nuevo
setupCircleAnimation();// Inicializar los círculos
panel.setTimerCallback(updateCircles); // Configurar el temporizador y la rutina de pintura
panel.startTimer(1000 / 20); //  FPS
panel.setPaintRoutine(drawCircles);
MIDIPlayer2.clearAllSequences();
MIDIPlayer2.stop(0);



///////////////////////

const var patternMidiList = [
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 52, EventId: 0, Timestamp: 0, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 52, EventId: 1, Timestamp: 0, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 89, EventId: 2, Timestamp: 0, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 54, EventId: 3, Timestamp: 0, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 2, Timestamp: 21176, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 69, EventId: 4, Timestamp: 21176, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 1, Timestamp: 40411, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 3, Timestamp: 40522, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 4, Timestamp: 40808, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 0, Timestamp: 40985, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 45, EventId: 5, Timestamp: 42352, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 43, EventId: 6, Timestamp: 42352, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 56, EventId: 7, Timestamp: 42352, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 40, EventId: 8, Timestamp: 42352, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 8, Timestamp: 80117, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 5, Timestamp: 80536, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 6, Timestamp: 80625, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 7, Timestamp: 81485, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 40, EventId: 9, Timestamp: 84705, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 41, EventId: 10, Timestamp: 84705, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 43, EventId: 11, Timestamp: 84705, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 69, EventId: 12, Timestamp: 84705, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 12, Timestamp: 104095, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 86, EventId: 13, Timestamp: 105882, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 11, Timestamp: 123220, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 9, Timestamp: 123551, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 10, Timestamp: 123661, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 13, Timestamp: 124301, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 39, EventId: 14, Timestamp: 127058, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 39, EventId: 15, Timestamp: 127058, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 39, EventId: 16, Timestamp: 127058, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 57, EventId: 17, Timestamp: 127058, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 17, Timestamp: 144639, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 74, Value: 52, EventId: 19, Timestamp: 158823, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 76, Value: 41, EventId: 18, Timestamp: 158823, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 76, Value: 64, EventId: 18, Timestamp: 163830, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 16, Timestamp: 164602, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 74, Value: 64, EventId: 19, Timestamp: 165132, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 15, Timestamp: 165639, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 14, Timestamp: 165838, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 42, EventId: 20, Timestamp: 169411, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 46, EventId: 21, Timestamp: 169411, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 46, EventId: 22, Timestamp: 169411, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 66, EventId: 23, Timestamp: 169411, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 23, Timestamp: 189860, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 70, EventId: 24, Timestamp: 190588, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 24, Timestamp: 209757, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 20, Timestamp: 211764, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 21, Timestamp: 211764, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 22, Timestamp: 211764, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 46, EventId: 25, Timestamp: 211764, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 41, EventId: 26, Timestamp: 211764, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 70, EventId: 28, Timestamp: 211764, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 45, EventId: 27, Timestamp: 211764, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 28, Timestamp: 231485, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 69, EventId: 29, Timestamp: 232941, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 29, Timestamp: 252529, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 27, Timestamp: 252617, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 25, Timestamp: 252794, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 26, Timestamp: 252860, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 42, EventId: 30, Timestamp: 254117, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 66, EventId: 33, Timestamp: 254117, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 41, EventId: 31, Timestamp: 254117, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 45, EventId: 32, Timestamp: 254117, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 33, Timestamp: 273948, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 60, EventId: 34, Timestamp: 275294, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 34, Timestamp: 292742, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 32, Timestamp: 292808, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 30, Timestamp: 293227, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 31, Timestamp: 293404, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 41, EventId: 35, Timestamp: 296470, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 58, EventId: 38, Timestamp: 296470, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 44, EventId: 36, Timestamp: 296470, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 42, EventId: 37, Timestamp: 296470, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 37, Timestamp: 332051, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 38, Timestamp: 332360, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 35, Timestamp: 332625, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 36, Timestamp: 332669, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 42, EventId: 39, Timestamp: 338823, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 43, EventId: 40, Timestamp: 338823, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 42, EventId: 41, Timestamp: 338823, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 61, EventId: 42, Timestamp: 338823, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 42, Timestamp: 357595, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 68, EventId: 43, Timestamp: 360000, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 41, Timestamp: 378154, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 40, Timestamp: 378308, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 39, Timestamp: 378750, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 43, Timestamp: 379014, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 42, EventId: 44, Timestamp: 381176, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 45, EventId: 45, Timestamp: 381176, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 45, EventId: 46, Timestamp: 381176, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 66, EventId: 47, Timestamp: 381176, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 46, Timestamp: 421720, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 45, Timestamp: 421963, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 44, Timestamp: 422139, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 47, Timestamp: 423220, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 49, EventId: 48, Timestamp: 423529, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 48, EventId: 49, Timestamp: 423529, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 46, EventId: 50, Timestamp: 423529, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 69, EventId: 51, Timestamp: 423529, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 51, Timestamp: 440536, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 64, EventId: 52, Timestamp: 444705, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 50, Timestamp: 459573, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 48, Timestamp: 459661, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 49, Timestamp: 459705, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 52, Timestamp: 462705, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 45, EventId: 53, Timestamp: 465882, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 43, EventId: 55, Timestamp: 465882, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 44, EventId: 54, Timestamp: 465882, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 60, EventId: 56, Timestamp: 465882, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 56, Timestamp: 479691, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 74, EventId: 57, Timestamp: 487058, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 57, Timestamp: 495419, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 76, Value: 65, EventId: 59, Timestamp: 497647, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 74, Value: 61, EventId: 58, Timestamp: 497647, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 74, Value: 64, EventId: 58, Timestamp: 504154, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 55, Timestamp: 504772, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 76, Value: 64, EventId: 59, Timestamp: 504794, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 54, Timestamp: 504860, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 53, Timestamp: 504882, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 45, EventId: 60, Timestamp: 508235, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 41, EventId: 61, Timestamp: 508235, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 45, EventId: 62, Timestamp: 508235, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 85, EventId: 63, Timestamp: 508235, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 63, Timestamp: 528838, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 67, EventId: 64, Timestamp: 529411, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 64, Timestamp: 548183, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 61, Timestamp: 549772, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 62, Timestamp: 550301, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 60, Timestamp: 550588, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 38, EventId: 65, Timestamp: 550588, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 59, EventId: 68, Timestamp: 550588, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 42, EventId: 66, Timestamp: 550588, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 44, EventId: 67, Timestamp: 550588, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 68, Timestamp: 588992, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 67, Timestamp: 589036, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 65, Timestamp: 589808, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 66, Timestamp: 589941, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 34, EventId: 69, Timestamp: 592941, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 58, EventId: 72, Timestamp: 592941, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 38, EventId: 70, Timestamp: 592941, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 36, EventId: 71, Timestamp: 592941, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 72, Timestamp: 611227, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 61, EventId: 73, Timestamp: 614117, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 71, Timestamp: 632470, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 70, Timestamp: 632669, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 73, Timestamp: 632691, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 69, Timestamp: 633088, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 52, Value: 43, EventId: 74, Timestamp: 635294, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 50, Value: 41, EventId: 75, Timestamp: 635294, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 72, Value: 59, EventId: 76, Timestamp: 635294, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 48, Value: 42, EventId: 77, Timestamp: 635294, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 50, Value: 64, EventId: 75, Timestamp: 689691, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 48, Value: 64, EventId: 77, Timestamp: 689713, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 52, Value: 64, EventId: 74, Timestamp: 689867, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 72, Value: 64, EventId: 76, Timestamp: 690485, "
];

// Declaración anticipada de variables
var i, str, type, pitch, velocity, timestamp;
var parts, note, valueStr, numberStr, timeStr;
var parsedEvents = [];
var currentIndex = 0;
var startTime = 0;
var now;
var e;
var sampleRate = Engine.getSampleRate();

for (i = 0; i < patternMidiList.length; i++) {
    str = patternMidiList[i];
    parts = str.split(",");

    type = (parts[0].indexOf("NoteOn") != -1) ? "on" : "off";

    numberStr = parts[2]; // " Number: 60"
    valueStr = parts[3];  // " Value: 96"
    timeStr = parts[5];   // " Timestamp: 21176"

    numberStr = numberStr.replace("Number:", "");
    valueStr = valueStr.replace("Value:", "");
    timeStr = timeStr.replace("Timestamp:", "");

    pitch = parseInt(numberStr);
    velocity = parseInt(valueStr);
    timestamp = parseInt(timeStr);

    // Corrección de escala: de muestras a milisegundos
    timestamp = (timestamp / sampleRate) * 1000;

    parsedEvents.push({
        type: type,
        note: pitch,
        velocity: velocity,
        time: timestamp
    });
}

// Timer
const var playbackTimer = Engine.createTimerObject();

playbackTimer.setTimerCallback(function() {
    now = Engine.getUptime() * 1000 - startTime;

    while (currentIndex < parsedEvents.length && parsedEvents[currentIndex].time <= now) {
        e = parsedEvents[currentIndex];

        if (e.type == "on"){
			Synth.playNoteFromUI(1, e.note, e.velocity);
			Console.print("noteOn: " + e.note);	        
        } else{
            Synth.noteOffFromUI(1, e.note);
            }

        currentIndex += 1;
    }

    if (currentIndex >= parsedEvents.length)
        playbackTimer.stopTimer();
});

// Botón y callback
const var patternplayButton = Content.addButton("patternPlayButton", 0, 0);
patternplayButton.set("text", "Play");

inline function onpatternPlayButtonControl(component, value)
{
    if (value)
    {
        currentIndex = 0;
        startTime = Engine.getUptime() * 1000;
        playbackTimer.startTimer(50);
    } else {
	    playbackTimer.stopTimer();
	    Engine.allNotesOff();
    }
};

patternplayButton.setControlCallback(onpatternPlayButtonControl);

function onNoteOn()
{
	

	// Caso clip midi Vacio 
	// Si el tamaño de la formación donde almaceno los eventos midi está vacía (menor o igual a cero)
	if (midiList.length <= 0) 
	{	
		Console.print("ERROR. Analizar el clip midi Primero");
		return; 
	}
	
	// Seleccionar nueva melodía usando markov
	//Console.print ("-------------------------");
	local nextMelodyState = selectNextState(noteProbMatrix, prevNotes.join(","), "nota");
	//Console.print ("-------------------"); 
	local nextVelocityState = selectNextState(veloProbMatrix, prevVelocities.join(","), "velocidad"); 
	//Console.print ("---------------");
	local nextSeparationState = selectNextState(sepProbMatrix, prevSeparations.join(","), "separacion");
	//Console.print ("-----------");
	local nextDurationState = selectNextState(durProbMatrix, prevDurations.join(","), "duración");
		
	//Console.print("Largo array notas: " + prevNotes.length);
	// Actualizar secuencia previa de notas 
	addEventInPrevSeq(nextMelodyState, prevNotes);
	addEventInPrevSeq(nextVelocityState, prevVelocities);
	//addEventInPrevSeq(nextSeparationState, prevSeparations);	
	//addEventInPrevSeq(nextDurationState, prevDurations);
	
	/* 
	Usar estas variables para usar en el sinte
	nextMelodyState
	nextVelocityState
	nextSeparationState
	nextDurationState
	 */
	 
	 // Casteo de variables
	nextMelodyState = parseInt(nextMelodyState);
	nextVelocityState = parseInt(nextVelocityState);	 
	nextSeparationState = parseInt(nextSeparationState);
	nextDurationState = parseInt(nextDurationState);	
	 
	// Script para agregar note off evitango hanging notes	
	local c = Message.getChannel();
	local n = Message.getNoteNumber();
	local v = Message.getVelocity();
	
	// We're truncating the event ID to stay within 0-128
	// this should give us enough room for many active notes.
	local idx = Message.getEventId() % 128;
	local i = 0;
	


	// Filtramos el note in para transportar las notas generadas a la octava de melo o de chords
	if (octaveButton.getValue() == 1)// Boton de octavas prendido?
	{
		if (Message.getNoteNumber() < 66) { // Nota tocada menor a 60
			
			if (nextMelodyState > 72) {
			    nextMelodyState -= 24; // Si es mayor a 72, resta 24
			} else if (nextMelodyState > 60) {
			    nextMelodyState -= 12; // Si es mayor a 60 pero menor o igual a 72, resta 12
			} else if (nextMelodyState < 36) {
			    nextMelodyState += 24; // Si es menor a 36, suma 24
			}
			
		} else { // nota tocada mayor a 60
		
			if (nextMelodyState < Message.getNoteNumber()) { // Nota generada menor a la nota tocada
			
			    if (nextMelodyState < 36) {
			        nextMelodyState += 36;
			    } else if (nextMelodyState < 48) {
			        nextMelodyState += 24;
			    } else if (nextMelodyState < 60) {
			        nextMelodyState += 12;
			    }
			    
			} else {
			    local nextMelodyState = nextMelodyState;
			}
		}
		
	}


	// Guarda la relación en el diccionario: NoteNumber -> nextMelodyState	
	addToDict(noteMelodyDictionary, n, nextMelodyState + transpose);	

	
	// Recording pasa notas al recorder.js
	if (!Message.isArtificial() && Record.getValue() == 1) // si es nota real y si esta grabando
	{
		Message.ignoreEvent(true);	
		if (midiPlayButton.getValue() == 1){
			addNoteOn(recording, Message.getChannel(), nextMelodyState + transpose, Math.min(v * veloMakeUp, 127), Engine.getUptime() - timeStart); // acordarse de poner v como velocity con un if que detecte el modo MIDI de tocado
		} else {
			addNoteOn(recording, Message.getChannel(), nextMelodyState + transpose, Math.min(nextVelocityState * veloMakeUp, 127), Engine.getUptime() - timeStart); // acordarse de poner v como velocity con un if que detecte el modo MIDI de tocado
		}

	}
	
	
	// Toca la nota generada en vivo
	if (Play.getValue() == 0){ //Si esta en play, no ejectura la creacion de notas por Markov
		Message.ignoreEvent(true);
		
		// We're storing the new event ID in a separate MIDI list for each 
		// note of the chord in order to stop them in the note-off messages
		for(an in activeNotes){
			
			if (midiPlayButton.getValue() == 1){
				an.setValue(idx, Synth.addNoteOn(c, nextMelodyState + transpose, Math.min(v * veloMakeUp, 127), delay * Math.random()));		
			} else {
				an.setValue(idx, Synth.addNoteOn(c, nextMelodyState + transpose, Math.min(nextVelocityState * veloMakeUp, 127), delay * Math.random()));		
			}
			
		

		}	
	}

	
	//  Falta convertir las separaciones y duraciones a tiempo de BPM.
	//	Para "nextDurationState" habría que crear un timer y asignarle la duración 
	//	Para "nextSeparationState" lo mismo
	
	
}
 function onNoteOff()
{
	local idx = Message.getEventId() % 128;
	
	local noteNumber = Message.getNoteNumber();
	

	if (Play.getValue() == 0)
	Message.ignoreEvent(true);
	
	// Here we have to stop the notes that have been
	// started in the note on. Note how we do not care
	// about the timestamp at all but let the 
	// Synth.setFixNoteOnAfterNoteOff() call do its job.
	
	// Apaga notas tocadas en vivo
	for(an in activeNotes)
		Synth.noteOffByEventId(an.getValue(idx));
		
	// Apaga notas grabadas
	//addNoteOff(recording, Message.getChannel(), Message.getNoteNumber(), Engine.getUptime() - timeStart);
	
	// Recorremos el array noteMelodyPairs para buscar coincidencias en realNote
	if (Record.getValue() == 1) // si esta grabando
	{ 
		for (var i = 0; i < noteMelodyPairs.length; i++) {
		    // Si realNote coincide con la nota que se soltó
		    if (noteMelodyPairs[i].realNote == noteNumber) {
		        // Apaga la nota generada asociada (genNote)
		        addNoteOff(recording, Message.getChannel(), noteMelodyPairs[i].genNote, Engine.getUptime() - timeStart);
		        
		        //Console.print("GenNotes a apagar: " + noteMelodyPairs[i].genNote);
		    }
		}	
	}

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
 