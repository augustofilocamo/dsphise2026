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

const var noteEventIds = {};function onNoteOn()
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
	 
	 
	local channel = 1;
	local velocity = Message.getVelocity();
	local midiNote = Message.getNoteNumber();
	
	// Generar una nueva nota artificial (ejemplo: +12 semitonos)
	
	if (Message.getNoteNumber() < 60) { // Nota tocada menor a 60
		
		local artificialNote = parseInt(nextMelodyState);
		
		if (artificialNote > 72) {
		    artificialNote -= 24; // Si es mayor a 72, resta 24
		} else if (artificialNote > 60) {
		    artificialNote -= 12; // Si es mayor a 60 pero menor o igual a 72, resta 12
		} else if (artificialNote < 36) {
		    artificialNote += 24; // Si es menor a 36, suma 24
		}
		
	} else { // nota tocada mayor a 60
	
		if (parseInt(nextMelodyState) < Message.getNoteNumber()) { // Nota generada menor a la nota tocada
		
		    local artificialNote = parseInt(nextMelodyState); // Convertimos la nota a número
		
		    if (artificialNote < 36) {
		        artificialNote += 36;
		    } else if (artificialNote < 48) {
		        artificialNote += 24;
		    } else if (artificialNote < 60) {
		        artificialNote += 12;
		    }
		    
		} else {
		    local artificialNote = parseInt(nextMelodyState); // No le suma nada
		}
	}
	
	// Agregar la nota y almacenar su nota y eventId
	noteEventIds[midiNote] = {
	    "note": artificialNote,
	    "eventId": Synth.addNoteOn(channel, artificialNote, velocity, 500)
	};
	
	Console.print("Nota que se escucha >>>>>>>>>>>>>>>>>>>>>>>>>>>>> " + artificialNote);
	
	Message.sendToMidiOut();
	
	// Bloquear la nota MIDI original
	Message.ignoreEvent(true);	 
	 
	
/*	
		if (Message.getNoteNumber() < 60) {
			Console.print("< a 60");
		
			Message.ignoreEvent(true);
			Synth.addNoteOn(1, parseInt(nextMelodyState) -12, velo, 0);
	
		} else {
		
			if (parseInt(nextMelodyState) < Message.getNoteNumber()){
				Message.ignoreEvent(true);
				Synth.addNoteOn(1, parseInt(nextMelodyState) + 12, velo, 0);
			} else {
				Message.ignoreEvent(true);
				Synth.addNoteOn(1, parseInt(nextMelodyState), velo, 0);
			}
		}
		
	
*/	
	
	
	//  Falta convertir las separaciones y duraciones a tiempo de BPM.
	//	Para "nextDurationState" habría que crear un timer y asignarle la duración 
	//	Para "nextSeparationState" lo mismo
	
}
 function onNoteOff()
{
	local midiNote = Message.getNoteNumber();
	
	// Verificar si hay una nota artificial asociada
	if (noteEventIds[midiNote] != undefined)
	{
	    // Obtener la nota artificial correcta
	    local artificialNote = noteEventIds[midiNote]["note"];
	    
	    // Apagar la nota artificial usando la nota en lugar del eventId
	    Synth.addNoteOff(1, artificialNote, 0);
	    
	    // Eliminar la entrada
	    noteEventIds[midiNote] = undefined;
	}
	
	// Bloquear la liberación de la nota MIDI original
	Message.ignoreEvent(true);
	
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
 