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
var midiList = [];	function onNoteOn()
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
	 
	local velo = Message.getVelocity(); 
	
	Console.print("Recieved note: " + Message.getNoteNumber());
	 
	if (Message.getNoteNumber() < 60) {
		Console.print("< a 60");
	
		Message.ignoreEvent(true);
		Synth.addNoteOn(1, parseInt(nextMelodyState) -12, velo, 0);
	} else {
		Message.ignoreEvent(true);
		Synth.addNoteOn(1, parseInt(nextMelodyState) , velo, 0);
	}
	


	//Synth.addNoteOff(1, nextMelodyState, parseFloat(nextDurationState)*Engine.getSampleRate());
	
	//  Falta convertir las separaciones y duraciones a tiempo de BPM.
	//	Para "nextDurationState" habría que crear un timer y asignarle la duración 
	//	Para "nextSeparationState" lo mismo
	
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
 