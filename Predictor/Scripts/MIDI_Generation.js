/* Falta leer la secuencia automáticamente al arrastrar */
// Quizas sirva esto?? --> midiPlayer1.connectToPanel(var panel)
//midiPlayer1.isSequenceEmpty(int indexOneBased);
//midiPlayer1.isEmpty();
//midiPlayer1.changed();

// Generar la matriz de Markov
inline function onReadMidiFileControl(component, value)
{	
	if (!value) return;
	
	//Limpiar las matrices
	noteTransMatrix = {};
	noteProbMatrix = {};
	noteCounts = {};			
	prevNotes = []; 
	
	// Si la secuencia midi o el reproductor están vacíos
	if (midiPlayer1.isSequenceEmpty(1) || midiPlayer1.isEmpty())
	{	
		// Avisá que está vacío /* AGREGAR mensaje "ERROR" */
		Console.print("Clip VACIO. AGREGAR MIDI");
		return;
	} 
	
	// Procesamiento del clip midi
	assignEventsInTransitionMatrix();							// Agregá los enventos en cada matriz
	assignLastSequence();										// Conectá el final con las notas del principio
	
	// Pasaje a matriz de probabilidades
	transToProbMatrix(noteTransMatrix, noteProbMatrix);	// notas
	transToProbMatrix(veloTransMatrix, veloProbMatrix);	// Velocidades
	transToProbMatrix(sepTransMatrix, sepProbMatrix);	// separacion entre notas
	transToProbMatrix(durTransMatrix, durProbMatrix);	// Duración de cada nota
	
	// Debug - Mostrar posibilidades de cada evento
	debugMatrix("Notes", noteProbMatrix);
	debugMatrix("Velocities", veloProbMatrix);
	debugMatrix("Separations", sepProbMatrix);
	debugMatrix("Durations", durProbMatrix);
	
	/* RESOLVER CUANDO EL VALOR RANDOM ES MAYOR AL LARGO DE ALGUN ARRAY */
	// Creo índice random tomando la cantidad de opciones
	// local randomIndex = selectRandomIndexFromMatrix(noteProbMatrix);
	
	// Por ahora comienzan todas desde el principio hasta que resuelva el bug de arriba
	local randomIndex = 0;
	
	// Seleccionar estado random de la cadena usando el indice random
	selectRandomState(noteProbMatrix, veloProbMatrix, sepProbMatrix, durProbMatrix, randomIndex);
	

};

Content.getComponent("ReadMidiFile").setControlCallback(onReadMidiFileControl);


inline function clearMatrix(){
	
	//Limpiar las matrices
	noteTransMatrix = {};
	noteProbMatrix = {};
	veloTransMatrix = {};
	veloProbMatrix = {};
	durTransMatrix = {};
	durProbMatrix = {};
	sepTransMatrix = {};
	sepProbMatrix = {};
	
	noteCounts = {};			
	prevNotes = []; 
	
	velocityCounts = {};		
	prevVelocities = []; 
	
	separationCounts = {};	
	prevSeparations = []; 
	
	durationCounts = {};
	prevDurations = [];

}



inline function readMidiFile(){
	
	
	// Si la secuencia midi o el reproductor están vacíos
	if (midiPlayer1.isSequenceEmpty(1) || midiPlayer1.isEmpty())
	{	
		// Avisá que está vacío /* AGREGAR mensaje "ERROR" */
		Console.print("Clip VACIO. AGREGAR MIDI");
		return;
	} 
	
	// Procesamiento del clip midi
	assignEventsInTransitionMatrix();							// Agregá los enventos en cada matriz
	assignLastSequence();										// Conectá el final con las notas del principio
	
	// Pasaje a matriz de probabilidades
	transToProbMatrix(noteTransMatrix, noteProbMatrix);	// notas
	transToProbMatrix(veloTransMatrix, veloProbMatrix);	// Velocidades
	transToProbMatrix(sepTransMatrix, sepProbMatrix);	// separacion entre notas
	transToProbMatrix(durTransMatrix, durProbMatrix);	// Duración de cada nota
	
	// Debug - Mostrar posibilidades de cada evento
	debugMatrix("Notes", noteProbMatrix);
	debugMatrix("Velocities", veloProbMatrix);
	debugMatrix("Separations", sepProbMatrix);
	debugMatrix("Durations", durProbMatrix);
	
	/* RESOLVER CUANDO EL VALOR RANDOM ES MAYOR AL LARGO DE ALGUN ARRAY */
	// Creo índice random tomando la cantidad de opciones
	// local randomIndex = selectRandomIndexFromMatrix(noteProbMatrix);
	
	// Por ahora comienzan todas desde el principio hasta que resuelva el bug de arriba
	local randomIndex = 0;
	
	// Seleccionar estado random de la cadena usando el indice random
	selectRandomState(noteProbMatrix, veloProbMatrix, sepProbMatrix, durProbMatrix, randomIndex);
	
	

	
}



// Seleccionar próximo estado
inline function selectNextState(probMatrix, prevSequence, eventType) 
{	
	/*
	* IMPORTANTE 
	* VER ERROR CUANDO LA SECUENCIA ES == 0 
	* (O cuando clickeo "NEXT STATE" Antes de leer el clip midi)
	*/
	
	//Console.print ("Proximo estado para: " + eventType);
	
	// Multiplico por 0.99 para asegurarme que nunca pase el acumulado
	local randValue = Math.random() * 0.99; 
	//Console.print("Probabilidad Random: " + Math.round(randValue * 100) + "%") ;
	
	local cumulative = 0;					 
	//Console.print("Secuencia previa: [" + prevSequence + "]");

	// Para cada [próxima nota] en las probabilidad de la [secuencia previa] 
    for (nextState in probMatrix[prevSequence]) 
    {
	    // Acumulo la cantidad de probabilidad
	    cumulative += probMatrix[prevSequence][nextState];
	    
	    // Debug - Mostrar el valor de probabilidad acumulado 
	    //Console.print("Próxima probabilidad a superar: " + Math.round(cumulative * 100) + "%");
	    
	    // Si randValue es mayor al valor de probabilidad
        if (randValue <= cumulative)  
        { 	
        	// Debug - Mostrar próximo estado
        	//Console.print("---");
        	//Console.print("Proxima " + eventType + " correspondiente a prob " + Math.round(cumulative * 100) + "%: " + nextState);
        	
        	// Devuelve el proximo estado
        	return nextState; 
        }
 	}
}





function addNote(list, channel, notenumber, velocity, position, length)
{
   var m = Engine.createMessageHolder();
   m.setType(m.NoteOn);
   m.setNoteNumber(notenumber);
   m.setVelocity(velocity);
   m.setChannel(channel);
   m.setTimestamp(Engine.getSamplesForQuarterBeats(position));
   
   var o = Engine.createMessageHolder();
   o.setType(o.NoteOff);
   o.setNoteNumber(notenumber);
   o.setChannel(channel);
   o.setTimestamp(Engine.getSamplesForQuarterBeats(position + length));
   
   list.push(m);
   list.push(o);
   
   //Console.print("adNote anda!");
}




// Borrar todo el contenido midi
inline function onClearMidiSequenceControl(component, value)
{
	if (!value) return;
	
	// Limpiar todos los clips midi
	midiPlayer1.clearAllSequences();			
	
	// Limpiar la formación de eventos midi
	midiList.clear();
	
	// Debug - Avisar que se borro
	Console.print("Borrado");
}

Content.getComponent("Clear MIDI Sequence").setControlCallback(onClearMidiSequenceControl);



// Play clip MIDI
inline function onPlayMIDIControl(component, value)
{
    //if (value)	{ midiPlayer1.play(0); Console.print("Prender"); }
    //else		{ midiPlayer1.stop(0); Console.print("Apagar en onPlayMIDIControl") ; }
};

Content.getComponent("PlayMIDISequence").setControlCallback(onPlayMIDIControl);