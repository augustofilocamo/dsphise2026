Content.makeFrontInterface(1024, 680);

// Load Font
Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Abel-Regular.ttf", "Abel");
Engine.setGlobalFont("Abel");


include("menuPanels.js");
include("pluginVSstandalone.js");
//include("Authorisation.js");
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
include("qwertyAlert.js");			// Alert de focus en modo qwerty
include("popUpValues.js");			// Popup values
//include("patternPlay.js");				// Genera notas sin marko
include("MidiOut.js");

// Variables globales para el tiempo y la nota actual
const var envelope = Synth.getModulator("AHDSR Envelope1") // Se puede volar
var bpm = Engine.getHostBpm(); // Toma bpm del multipista

// Tomar el reproductor midi
const var midiPlayer1 = Synth.getMidiPlayer("MIDI Player1");
const var MIDIPlayer1 = Synth.getMidiPlayer("MIDI Player1"); // ARREGLAR ESTO URGENTEMENTE
const var label_absPath = Content.getComponent("label_absPath");

// Modulos de sonido
const var Sampler1 = Synth.getChildSynth("Sampler1");
const var Sampler2 = Synth.getChildSynth("Sampler2");
const var Sampler3 = Synth.getChildSynth("Sampler3");
const var SynthesiserGroup1 = Synth.getChildSynth("Synthesiser Group1");

// Para el MidiOut
var noteArray = [];
Synth.setFixNoteOnAfterNoteOff(true);

setupCircleAnimation();// Inicializar los círculos
panel.setTimerCallback(updateCircles); // Configurar el temporizador y la rutina de pintura
panel.startTimer(1000 / 20); //  FPS
panel.setPaintRoutine(drawCircles);
MIDIPlayer2.clearAllSequences();
MIDIPlayer2.stop(0);






function onNoteOn()
{
	
	// Overlay de qwerty panel focus
	//messagePanel.showControl(false);
	//lastActivityTime = Engine.getUptime();
	
	// Caso clip midi Vacio 
	// Si el tamaño de la formación donde almaceno los eventos midi está vacía (menor o igual a cero)
	if (midiList.length <= 0) 
	{	
		Console.print("ERROR. Analizar el clip midi Primero");
		return; 
	}
	
	local nextMelodyState = selectNextState(noteProbMatrix, prevNotes.join(","), "nota");
	local nextVelocityState = selectNextState(veloProbMatrix, prevVelocities.join(","), "velocidad"); 

	addEventInPrevSeq(nextMelodyState, prevNotes);
	addEventInPrevSeq(nextVelocityState, prevVelocities);

	 
	// Casteo de variables
	nextMelodyState = parseInt(nextMelodyState);
	nextVelocityState = parseInt(nextVelocityState);	 
	 
	// Script para agregar note off evitango hanging notes	
	local channel = Message.getChannel();
	local noteOn = Message.getNoteNumber();
	local velocity = Message.getVelocity();
	local noteOnTimestamp = delay * Math.random();
	
	// We're truncating the event ID to stay within 0-128
	// this should give us enough room for many active notes.
	local eventId = Message.getEventId() % 128;
	//local i = 0;

	// Reemplazo de notas repetidas
	if (nextMelodyState == prevPredictedNote )
		{
			Console.print("Nota igual evitada : " + nextMelodyState);
		    nextMelodyState = selectNextState(noteProbMatrix, prevNotes.join(","), "nota");
		    nextMelodyState = parseInt(nextMelodyState);
		}
	else if (nextMelodyState == prevPredictedNote -1)
		{
			Console.print("Nota -1 evitada : " + nextMelodyState);
		    nextMelodyState = selectNextState(noteProbMatrix, prevNotes.join(","), "nota");
		    nextMelodyState = parseInt(nextMelodyState);
		}
	else if (nextMelodyState == prevPredictedNote +1)
		{
			Console.print("Nota +1 evitada : " + nextMelodyState);
		    nextMelodyState = selectNextState(noteProbMatrix, prevNotes.join(","), "nota");
		    nextMelodyState = parseInt(nextMelodyState);
		}
		
		prevPredictedNote = nextMelodyState; // Actualiza última nota generada

	// Filtramos el note in para transportar las notas generadas a la octava de melo o de chords
	if (octaveButton.getValue() == 1)// Boton de octavas prendido?
	{
		if (Message.getNoteNumber() < 42){
				
			if (nextMelodyState > 55) {
				nextMelodyState -= 48;
			} else if (nextMelodyState < 24) {
			    nextMelodyState -= 36; // Si es menor a 36, suma 24
			}			
		}
		if (Message.getNoteNumber() < 66) { // Nota tocada menor a 60
			if (nextMelodyState > 72) 
			{
			    nextMelodyState -= 24; // Si es mayor a 72, resta 24
			} 
			else if (nextMelodyState > 60) 
			{
			    nextMelodyState -= 12; // Si es mayor a 60 pero menor o igual a 72, resta 12
			}
			else if (nextMelodyState < 36) 
			{
			    nextMelodyState += 24; // Si es menor a 36, suma 24
			}
		} 
		else 
		{ // nota tocada mayor a 60
		
			if (nextMelodyState < Message.getNoteNumber()) // Nota generada menor a la nota tocada
			{ 			
			    if (nextMelodyState < 36) 
			    {
			        nextMelodyState += 36;
			    } 
			    else if (nextMelodyState < 48) 
			    {
			        nextMelodyState += 24;
			    } 
			    else if (nextMelodyState < 60) 
			    {
			        nextMelodyState += 12;
			    }    
			} 
			else 
			{
			    local nextMelodyState = nextMelodyState;
			}
		}
	}
	
	local noteOut = nextMelodyState + transpose; 
	
	// Guarda la relación en el diccionario: NoteNumber -> nextMelodyState	
	addToDict(noteMelodyDictionary, noteOn, noteOut);	
	
	// Recording pasa notas al recorder.js
	if (!Message.isArtificial() && Record.getValue() == 1) // si es nota real y si esta grabando
	{
		Message.ignoreEvent(true);	
		local recorderVelocityOut = velocity * veloMakeUp;
		
		midiPlayButton.getValue() == 1 ? recorderVelocityOut : recorderVelocityOut = nextVelocityState * veloMakeUp;
		addNoteOn(recording, Message.getChannel(), noteOut, recorderVelocityOut, Engine.getUptime() - timeStart);	 	
	}
	
	// Toca la nota generada en vivo
	if (Play.getValue() == 0)	//Si esta en play, no ejectura la creacion de notas por Markov
	{ 
		Message.ignoreEvent(true);
		local liveVelocityOut;

		for(event in activeNotes)
		{			
			if (midiPlayButton.getValue() == 1)
			{
				liveVelocityOut = velocity * veloMakeUp;		
			}
			else 
			{
				liveVelocityOut = nextVelocityState * veloMakeUp;
				noteOn < 66 ? liveVelocityOut *= 0.7 : liveVelocityOut;
			}
			event.setValue(eventId, Synth.addNoteOn(channel, noteOut, liveVelocityOut, noteOnTimestamp));
			// Previo -> event.setValue(eventId, Synth.addNoteOn(channel, noteOut, Math.min(velocity * veloMakeUp, 127), noteOnTimestamp));
		}	
	}	
}function onNoteOff()
{
	local eventId = Message.getEventId() % 128;	
	local noteNumber = Message.getNoteNumber();

	if (Play.getValue() == 0)
	{
		Message.ignoreEvent(true);
	}
	
	// Apaga notas tocadas en vivo
	for(event in activeNotes)
	{
		Synth.noteOffByEventId(event.getValue(eventId));
	}
		
	// Apaga notas grabadas
	var i;
	// Recorremos el array noteMelodyPairs para buscar coincidencias en realNote
	if (Record.getValue() == 1) // si esta grabando
	{ 
		for (i = 0; i < noteMelodyPairs.length; i++) 
		{
		    // Si realNote coincide con la nota que se soltó
		    if (noteMelodyPairs[i].realNote == noteNumber) 
		    {
		        // Apaga la nota generada asociada (genNote)
		        addNoteOff(recording, Message.getChannel(), noteMelodyPairs[i].genNote, Engine.getUptime() - timeStart);
		        
		        // Removemos la el pair apagado
		        noteMelodyPairs.removeElement(i);
		        Console.print("notesoffes i: " + i); 
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
 