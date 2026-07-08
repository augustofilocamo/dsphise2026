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
//include("patternPlay.js");				// Genera notas sin marko

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


const var SimpleReverb2 = Synth.getEffect("Simple Reverb2");
const var SimpleReverb3 = Synth.getEffect("Simple Reverb3");
const var SimpleReverb4 = Synth.getEffect("Simple Reverb4");


inline function onreverbKnobControl(component, value)
{
	SimpleReverb2.setAttribute(0, value);
	SimpleReverb4.setAttribute(0, value);
	SimpleReverb4.setAttribute(0, value);
};

Content.getComponent("reverbKnob").setControlCallback(onreverbKnobControl);


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
		if (midiPlayButton.getValue() == 1) // Si esta siendo tocado con un controlador
		{
	
			addNoteOn(recording, Message.getChannel(), nextMelodyState + transpose, Math.min(v * veloMakeUp, 127), Engine.getUptime() - timeStart);
			 
		} else {		
		
			addNoteOn(recording, Message.getChannel(), nextMelodyState + transpose, Math.min(nextVelocityState * veloMakeUp, 127), Engine.getUptime() - timeStart); ;

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
	var i;
	// Recorremos el array noteMelodyPairs para buscar coincidencias en realNote
	if (Record.getValue() == 1) // si esta grabando
	{ 

		
		for (i = 0; i < noteMelodyPairs.length; i++) {
		    // Si realNote coincide con la nota que se soltó
		    

		    
		    if (noteMelodyPairs[i].realNote == noteNumber) {
		        // Apaga la nota generada asociada (genNote)
		        addNoteOff(recording, Message.getChannel(), noteMelodyPairs[i].genNote, Engine.getUptime() - timeStart);
		        //Console.print("Engine.getUptime() - timeStart: " + (Engine.getUptime() - timeStart));
		        
		        // Removemos la el pair apagado
		        noteMelodyPairs.remove(i, 1);
		        
		        //Console.print("GenNotes a apagar: " + noteMelodyPairs[i].genNote);
		        
		        // quiero que si la nota soltada 
		    }
		}	
	}

}




// genero una nota con markov apartir de una nota real. quiero que cuando suelte esa nota se apague la nota generada por markov.
// si se generan dos notas iguales con dos notas reales distintas, necesito agregar un note off de la nota que ya esta sonando. eso lo hago en onNoteOff?
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 