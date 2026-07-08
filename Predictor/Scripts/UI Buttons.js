/* AGREGAR Leer midi al arrastrar */

// Generar la matriz de Markov
inline function onReadMidiFileControl(component, value)
{	
	if (!value) {return ;}
		
	// Si la secuencia midi o el reproductor están vacíos
	if (midiPlayer1.isSequenceEmpty(1) || midiPlayer1.isEmpty())
	{	
		// Avisá que está vacío /* AGREGAR mensaje "ERROR" */
		Console.print("Clip VACIO. AGREGAR MIDI");
		return;
	} 
	
	// Procesamiento del clip midi
	assignNotesInTransitionMatrix();		// Agregá las notas en la matriz
	assignLastSequence();					// Conectá el final con las notas del principio
	transToProbMatrix();					// Generá una matriz con las probabilidades
	
	
	// Debug - Mostrar posibilidades de cada evento
	debugMatrix("notes", probabilitiesMatrix, prevNoteSequence, nextState);
	//debugMatrix("velocities", probabilitiesMatrix, prevVeloSequence, nextState);
	//debugMatrix("durations", probabilitiesMatrix, prevDurSequence, nextState);
	
	getRandomPrevSeq(probabilitiesMatrix, prevNoteSequence, prevNotes);	// Seleccióna una secuencia al azar para comenzar		
};

Content.getComponent("ReadMidiFile").setControlCallback(onReadMidiFileControl);

// Seleccionar próximo estado
inline function selectNextState(probMatrix, prevSequence) 
{	
	/*
	* IMPORTANTE 
	* VER ERROR CUANDO LA SECUENCIA ES == 0 
	* (O cuando clickeo "NEXT STATE" Antes de leer el clip midi)
	*/
	
	Console.print ("-----------------");
	local randValue = Math.random();	Console.print("Random: " + randValue);
	local cumulative = 0;				Console.print("Secuencia previa para elegir: [" + prevSequence + "]");	 
	

	// Para cada [próxima nota] en las probabilidad de la [secuencia previa] 
    for (nextState in probMatrix[prevSequence]) 
    {
	    // Acumulo la cantidad de probabilidad
	    cumulative += probMatrix[prevSequence][nextState];
	    
	    // Debug - Mostrar el valor de probabilidad acumulado 
	    Console.print("Prob Acumulado: " + cumulative);
	    
	    // Si randValue es mayor al valor de probabilidad
        if (randValue <= cumulative)  
        { 	// Devuelve la nota
        	return nextState; 
        }
 	}
}

// Seleccionar próximo estado de nota, velocidad y duración
inline function onNextNoteControl(component, value) 
{	
	
	if (!value) { return; }
	 
	/* Agregar Caso para clip midi Vacio */
	// Si la matriz está vacía
	
	local nextMelodyState = selectNextState(probabilitiesMatrix, prevNoteSequence); 
	
	/* agregar acá velocidades y duración */
	// local nextVelocityState
	// local nextDurationState
	
	Console.print("Proxima NOTA: " + nextMelodyState);
	
	//Console.print("Largo array notas: " + prevNotes.length);
	// Actualizar secuencia previa de notas 
	addNoteInPrevSeq (nextMelodyState);
					
	// guarda la nota nueva como la secuencia previa
	prevNoteSequence = prevNotes.join(",");
	 
};

Content.getComponent("NextNote").setControlCallback(onNextNoteControl);

// Borrar todo el contenido midi
inline function onClearMidiSequenceControl(component, value)
{
	if (!value) {return;}
	
	// Limpiar todos los clips midi
	midiPlayer1.clearAllSequences();
	
	// Limpiar la formación con información midi	
	midiList.clear();					
	
	// Debug - Avisar que se borro
	Console.print("Borrado");
}

Content.getComponent("Clear MIDI Sequence").setControlCallback(onClearMidiSequenceControl);



// Play clip MIDI
inline function onPlayMIDIControl(component, value)
{
    if (value)	{ midiPlayer1.play(0); Console.print("Prender"); }
    else		{ midiPlayer1.stop(0); Console.print("Apagar") ; }
};

Content.getComponent("PlayMIDISequence").setControlCallback(onPlayMIDIControl);


// Quizas sirva esto?? --> midiPlayer1.connectToPanel(var panel)
//midiPlayer1.isSequenceEmpty(int indexOneBased);
//midiPlayer1.isEmpty();

//midiPlayer1.changed();