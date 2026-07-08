Content.makeFrontInterface(600, 600);

include("Matrices_Variables.js");	// Variables del Tío Markov
include("Create_Markov_Chain.js");	// Procesos para crear las probabilidades
include("MIDI_Generation.js");		// UI y procesos para generar midi

// Variables globales para el tiempo y la nota actual
const var envelope = Synth.getModulator("AHDSR Envelope1") // Se puede volar
var bpm = Engine.getHostBpm(); // Toma bpm del multipista

// Tomar el reproductor midi
const var midiPlayer1 = Synth.getMidiPlayer("MIDI Player1");

// Formación para recibir la lista de eventos del clip midi. 
var midiList = [];	


// This script will play otes constant delay and shows you how to deal with the stuck note problem that arises here.

const var delay = 200;
const var activeNotes = [];

// Let's use a midi list, which is basically a fixed-size array storing 128 integer values
for(i = 0; i < 3; i++)
	activeNotes.push(Engine.createMidiList());

// This new API call will enable the logic (by default it's off now)
// Set this to false and you'll notice the stuck notes...
Synth.setFixNoteOnAfterNoteOff(true);

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
	Console.print ("-------------------------");
	local nextMelodyState = selectNextState(noteProbMatrix, prevNotes.join(","), "nota");
	Console.print ("-------------------"); 
	local nextVelocityState = selectNextState(veloProbMatrix, prevVelocities.join(","), "velocidad"); 
	Console.print ("---------------");
	local nextSeparationState = selectNextState(sepProbMatrix, prevSeparations.join(","), "separacion");
	Console.print ("-----------");
	local nextDurationState = selectNextState(durProbMatrix, prevDurations.join(","), "duración");
		
	//Console.print("Largo array notas: " + prevNotes.length);
	// Actualizar secuencia previa de notas 
	addEventInPrevSeq(nextMelodyState, prevNotes);
	addEventInPrevSeq(nextVelocityState, prevVelocities);
	addEventInPrevSeq(nextSeparationState, prevSeparations);	
	addEventInPrevSeq(nextDurationState, prevDurations);
	
	/* 
	Usar estas variables para usar en el sinte
	nextMelodyState
	nextVelocityState
	nextSeparationState
	nextDurationState
	 */
	 
	// Script para agregar note off evitango hanging notes	
	local c = Message.getChannel();
	local n = Message.getNoteNumber();
	local v = Message.getVelocity();
	
	// We're truncating the event ID to stay within 0-128
	// this should give us enough room for many active notes.
	local idx = Message.getEventId() % 128;
	local i = 0;
	
	// for the sake of this example we'll ignore the real note	
	Message.ignoreEvent(true);
	
	// We're storing the new event ID in a separate MIDI list for each 
	// note of the chord in order to stop them in the note-off message
	for(an in activeNotes)
		an.setValue(idx, Synth.addNoteOn(c, nextMelodyState, nextVelocityState, delay));	
	
	//  Falta convertir las separaciones y duraciones a tiempo de BPM.
	//	Para "nextDurationState" habría que crear un timer y asignarle la duración 
	//	Para "nextSeparationState" lo mismo
	
}
 function onNoteOff()
{
	local idx = Message.getEventId() % 128;
	
	Message.ignoreEvent(true);
	
	// Here we have to stop the notes that have been
	// started in the note on. Note how we do not care
	// about the timestamp at all but let the 
	// Synth.setFixNoteOnAfterNoteOff() call do its job.
	for(an in activeNotes)
		Synth.noteOffByEventId(an.getValue(idx));
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
 