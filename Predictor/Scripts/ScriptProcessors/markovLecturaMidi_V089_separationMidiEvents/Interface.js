Content.makeFrontInterface(600, 600);

/* VARIABLES */

// Variables globales para el tiempo y la nota actual
const var envelope = Synth.getModulator("AHDSR Envelope1")

var bpm = Engine.getHostBpm(); // Toma bpm del multipista

// Matrices
/*
* La de probabilidad es igual a la de transiciones
* pero cambia el valor final. En vez de llevar la cuenta por cada
* item, asigna la probabilidad que tiene de ir a ese valor la cadena de Markov
*/

// Notas
var noteTransMatrix = {};
var noteProbMatrix = {};
var noteCounts = {};			// Stores the counts of notes
var prevNotes = []; 			// Array de notas anteriores. Para el addNoteInPrevSeq(prevState)

// Velocidades
var veloTransMatrix = {};
var veloProbMatrix = {};
var velocityCounts = {};		// Lleva la cuenta de cada velocidad
var prevVelocities = []; 		// Array de velocidades anteriores. Para el addNoteInPrevSeq(prevState)

// Separación entre notas
var sepTransMatrix = {};
var sepProbMatrix = {};
var separationCounts = {};		// Lleva la cuenta de cada duración
var prevSeparations = []; 		// Array de duraciones anteriores. Para el addNoteInPrevSeq(prevState)
var endSepTime;					// el inicio entre un noteOn y el otro
var secPassEventSeparation;		// Para conectar el tiempo de la primera con la segunda pasada


// Duraciones de cada nota. Sería el largo de cada nota, o cuánto tiempo están presionadas
var durTransMatrix = {};
var durProbMatrix = {};
var durationCounts = {};		// Lleva la cuenta de cada duración
var prevDurations = []; 		// Array de duraciones anteriores. Para el addNoteInPrevSeq(prevState)
//var startEventDuration;		// Para calcular la distancia entre noteOn y el noteOff
//var endEventDuration;			// Para calcular la distancia entre noteOn y el noteOff
var eventDurTime = {};			// Para asignar la duración entre noteOn y noteOff de cada nota


// Orden de Cadena Markov
var markovOrder = 2;	// Se puede asigar a un slider. OJO, LA CANT DE NOTAS TIENE QUE SER IGUAL O MAYOR AL ORDEN

// Debug - tono de confirmación al recompilar
Synth.addNoteOn(1, 60, 120, 0); // channel, noteNumber, velocity, timestampSamples

/********** MIDI **********/
// Tomar el reproductor midi
const var midiPlayer1 = Synth.getMidiPlayer("MIDI Player1");	

var midiList = [];	// Formación para recibir la lista de eventos midi. 

/* Procesos principales */

// Procesar las notas midi
inline function assignEventsInTransitionMatrix()
{	
	// Agrego la lista de eventos en la formación 
	midiList = midiPlayer1.getEventList();
	
	endSepTime = 0;
	
	// Por cada evento de la secuencia midi
	for(event in midiList) // Es más eficiente usar "midiList" que "midiPlayer1.getEventList()"
	{	
		// Si el evento es un NoteOn
	    if (event.isNoteOn()) 
	    {   
	    	processNoteOnEvents(event);
	    } 	
	    
	    // Si el evento es un NoteOn
   	    if (event.isNoteOff()) 
   	    {   
   	    	processNoteOffEvents(event);
   	    } 	      
	}
	
	// para la segunda pasada, el inicio toma el final
	endSepTime = secPassEventSeparation;
	
}

// Función para conectar el final de la secuencia con el principio 
inline function assignLastSequence()
{	
	// creo contador para que el for se detenga cuando sea igual al orden Markov
	local count = 1;
	
	// Debug - Mostrar segunda pasada
	Console.print("-----------------");
	Console.print("SEGUNDA PASADA DE EMPALME ");
	
	// uso el mismo midilist porque la secuencia es la misma	
	for(event in midiList)
	{	
		// Si el evento es noteOn
	    if(event.isNoteOn()) 
	    {	
	    	// Proceso los eventos
	    	processNoteOnEvents(event);		     	
	    }
	    
	    // Si el evento es un NoteOn
   	    if (event.isNoteOff()) 
   	    {   
   	    	processNoteOffEvents(event);
   	    	// Si la cuenta es igual o mayor (x las dudas) al orden Markov
	      	if (count >= markovOrder) 
	      	{	// terminá la función 
		      	return;
		    }	
		     	 
	      	// Sino, Sumá uno a la cuenta
	      	count++;   
   	    } 
	    	    	
	}
}

/* Subprocesos*/

// Función para procesar los eventos ON de notas, velocidades y duraciones
inline function processNoteOnEvents(event)
{	    
   	// Asigná la nota a una variable
   	local noteOn = event.getNoteNumber();
   	local velocity = event.getVelocity();
	
	// toma el tiempo del evento midi y lo pasa a milisegundos
	//local endEventTime = Engine.getMilliSecondsForSamples(event.getTimestamp());
	local startSepTime = Engine.getQuarterBeatsForSamples(event.getTimestamp());
	
	// Asigno el tiempo incial correspondiente al valor de nota en el objeto
	eventDurTime[noteOn] = startSepTime;	
	
	// La separación es la distancia absoluta del tiempo final menos el tiempo inicial
   	local separation = Math.abs(startSepTime - endSepTime);
   	
   	// Debug - Avisa qué nota midi es
   	Console.print("-----------------");
    Console.print("Note On: "	+ noteOn);
    Console.print("Velocity: "	+ velocity);
    Console.print("prevEventSepTime: "	+ endSepTime);
    Console.print("startSepTime: "	+ startSepTime);
    Console.print("separation: "		+ separation);
    
    // Agregar nota a la matriz
    addMidiEventInfo("note", noteOn, noteCounts, prevNotes, noteTransMatrix);
    
    // Agregar velocidad a la matriz
    addMidiEventInfo("velocity", velocity, velocityCounts, prevVelocities, veloTransMatrix);
       
    if (endSepTime == 0) 
    {
		endSepTime = startSepTime;
	    return;
    }
    
    // Sino, agregar separaciones entre notas noteOn a la matriz
    addMidiEventInfo("separation", separation, separationCounts, prevSeparations, sepTransMatrix);
    
    // La duración incial de la próxima nota será la inicial del final de la actual
	endSepTime = startSepTime;
	
	// La duración para la segunda pasada será igual a la última separación 
	secPassEventSeparation = separation; 
}

// Función para procesar los eventos OFF de notas, velocidades y duraciones
inline function processNoteOffEvents(event)
{	    
	// Asigná la nota a una variable
	local noteOff = event.getNoteNumber();
	local endDuration = Engine.getQuarterBeatsForSamples(event.getTimestamp());
	local startDuration = eventDurTime[noteOff];
	
	local duration = Math.abs(endDuration - startDuration);
	
	// Debug - Avisa qué nota midi es
	Console.print("-----------------");
    Console.print("Note Off: "	+ noteOff);
    Console.print("NoteOff start Duration: "	+ startDuration);
    Console.print("NoteOff end Duration: "	+ endDuration);
   	Console.print("Value for " + noteOff + ": " + duration);
    
    
    // Agregar duración notas
    addMidiEventInfo("duracion", duration, durationCounts, prevDurations, durTransMatrix);
}

// Agregar información del evento midi a la matriz de transiciones

inline function addMidiEventInfo(eventType, eventInfo, eventCount, prevEvent, matrix)
{
	// Actualizá la secuencia de notas
	updateSeqCount(eventCount, eventInfo, eventType);
		        
	// Actualizar la cuenta de transiciones
	updateTransitionCount(prevEvent, eventInfo, matrix);
	 
	// agregá la nota en la secuencia de notas previas
	addEventInPrevSeq(eventInfo, prevEvent);
}

// Actualizar secuencia de valores
inline function updateSeqCount(count, value, Type) /* MODULARIZADO */
{
	// Si la nota no existe en el objecto, 
	if (count[value] == undefined) 
	{ 	
		// creala con un cero
		count[value] = 0; 
		
		// Debug - Avisar que es el primer valor y si es nota, velo o duración
		Console.print ("---");
		Console.print ("First Value for " + Type + ": " + value); 
	}
	
	// Aumentá la cuenta en uno
	count[value]++;	
	Console.print ("---");
	// Debug - Mostra cuántas veces se usó esa nota
	Console.print( "Count for " + value + ": " + count[value]);
}



// Actualizar la cuenta para cada evento midi (nota, velocity y duracion)
inline function updateTransitionCount(prevEvent, nextState, matrix) /* MODULARIZADO */
{	

	// Si la cantidad de notas es MENOR al orden de markov
	if (prevEvent.length < markovOrder) 
	{	// Debug - No hagas nada
		Console.print("Secuencia MENOR al orden Markov"); 
		return;
	}
	
	// NUNCA DEBERÍA SER MAYOR, YA QUE DPS se borra las notas excedentes en addNoteInPrevSeq()
	// else if (prevEvent.length > markovOrder) {Console.print("Secuencia MAYOR al orden Markov"); return;}
		
   	// Si es igual, juntá las dos notas en un estado
    local prevState = prevEvent.join(',');		
    
    // Si la matrix no tiene ese estado
    if (matrix[prevState] == undefined) 
    {	// agregalo
	    matrix[prevState] = {}; 
	}
    
    // Si la matrix no tiene un contador asociado al estado 
    if (matrix[prevState][nextState] == undefined) 
    { 	// crealo con un 0
    	matrix[prevState][nextState] = 0; 
    }
                
    // Sumá 1 al contador
    matrix[prevState][nextState]++;
    
    // Debug - Mostrá cuántas veces se pasó por ese estado
    Console.print("Transition from [" + prevState + "] to " 
    + nextState + ": " + matrix[prevState][nextState]);      
}

// Agregar la nota en la secuencia
inline function addEventInPrevSeq(event, prevState) 		/* MODULARIZADO */
{	//prevNotes
	// Agregar última nota al lista de notas tocadas
	prevState.push(event);
	
	// Mientras el largo del array sea diferente al orden de markov, borrar el elemento más viejo.
	// Es para asegurarse que el conjunto de notas siempre sea igual al orden de Markov
	while (prevState.length > markovOrder) 
	{
		prevState.removeElement(0); 
	} 	
}

// Asignar las probabilidades para cada caso
inline function transToProbMatrix(transMatrix, probMatrix)		/* MODULARIZADO */
{
	// Función para convertir la cuenta de transiciones en probabilidades
	for (currentState in transMatrix) 
	{	// Declaro objeto con las secuencias de notas del orden de Markov
		probMatrix[currentState] = {};	
		local totalCount = 0;	
		
		/* calcular todas las posibilidades de transicion para la secuencia */
		// Como pueden ir más de una vez hacia una nota
		// hay que sumar todas las veces de destino de todas las notas
		
		// Para cada nota de la secuencia en la matriz
		for (nextState in transMatrix[currentState]) 
		{ 
			// sumar el total de n° de posibilidades.
			totalCount += transMatrix[currentState][nextState]; 
		}

		/* Calcular las probabilidades */
		// Para cada transición en la matriz
		for (nextState in transMatrix[currentState])
		{
			// Calcular su probabilidad, sabiendo el número máximo de probabilidades
			probMatrix[currentState][nextState] = Math.round (transMatrix[currentState][nextState] / totalCount * 100);
		}
	}
}

// Debug - Mostrar todas las posibilidades de la matriz
inline function debugMatrix(eventInfo, matrix)			 /* MODULARIZADO */
{
	/* Chequear que esté todo bien */
	Console.print("-----------------");
	Console.print("Matriz de probabilidades para " + eventInfo +  ": ");
	
	// Print probabilities for debugging
	for (prevState in matrix) 
	{
	    Console.print("From "+ eventInfo + " " + prevState + ":");
	    for (nextState in matrix[prevState]) 
	    {
	        Console.print("		To " + eventInfo + " " + nextState + ": " + matrix[prevState][nextState] + "%");
	    }
	}
}



// Seleccionar estado de las matrices de probabilidades
inline function selectRandomState(noteMatrix, veloMatrix , sepMatrix, durMatrix, index) /* MODULARIZADO */
{	
	// Crear array de posibilidades con los estados de las notas
	local posibilities = debugPosibilities(noteMatrix);
	
	// Debug - Mostrar todas las posibilidades
	Console.print ("--------");
	Console.print ("Seleccionado estado NOTAS n° "+ index + ": " + posibilities[index]);
	// Limpio el array de notas 
	prevNotes.clear();
	//Asigno las notas obtenidas del índice random a la formación de notas
	prevNotes = posibilities[index].split(",");
	
	// Hago lo mismo con las velocidades
	posibilities = debugPosibilities(veloMatrix);
		
	Console.print ("--------");
	Console.print ("Seleccionado estado VELOCIDAD n° "+ index + ": " + posibilities[index]);
	// Limpio el array de notas 
	prevVelocities.clear();
	//Asigno las notas obtenidas del índice random
	prevVelocities = posibilities[index].split(",");
	
	
	// Hago lo mismo con las separaciones
	posibilities = debugPosibilities(sepMatrix);
	
	Console.print ("--------");
	Console.print ("Seleccionado estado SEPARACION n° "+ index + ": " + posibilities[index]);
	// Limpio el array de notas 
	prevSeparations.clear();
	//Asigno las notas obtenidas del índice random
	prevSeparations = posibilities[index].split(",");

	
	
	// Hago lo mismo con las duraciones
	posibilities = debugPosibilities(durProbMatrix);
	
	Console.print ("--------");
	Console.print ("Seleccionado estado DURACIÓN n° "+ index + ": " + posibilities[index]);
	// Limpio el array de notas 
	prevDurations.clear();
	//Asigno las notas obtenidas del índice random
	prevDurations = posibilities[index].split(",");

}		

inline function debugPosibilities(probMatrix) /* MODULARIZADO */
{	
	// Creo una formación vacía y un contador
	local array = [];
	local count = 0;
	
	Console.print ("--------------");
	// Por cada estado en la matrix
	for (state in probMatrix)
	{	
		// Agregar el valor a la formación
		array.push(state);
		// Debug - mostrar las opciones de elección
		Console.print ("Posibilidad n° "+ count + ": " + state);
		count++;
	}
	// Debug - total de posibilidades
	Console.print ("Total de posibilidades: " + array.length);
	
	return array;
}


// Función para contar la cantidad de estados y
inline function selectRandomIndex(matrix)
{
	// Creo un contador de posibilidades
	local possibilities = 0;
	
	// por cada estado dentro de la matriz
	for (state in matrix) 
	{ 	
		// sumá 1
		possibilities++; 
	}
	
	// seleccioná un valor random de la cuenta
	local randomIndex = Math.randInt(0, possibilities);
	
	// devolvé el valor random
	return randomIndex;
}

/* --------------- BOTONES --------------- */

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
	
	// local randomIndex = selectRandomIndex(noteProbMatrix);
	local randomIndex = 0;
	
	// Seleccionar estado random de la cadena usando el indice random
	selectRandomState(noteProbMatrix, veloProbMatrix, sepProbMatrix, durProbMatrix, randomIndex);
			
};

Content.getComponent("ReadMidiFile").setControlCallback(onReadMidiFileControl);


/* Leer midi al arrastrar */


// Seleccionar próximo estado
inline function selectNextState(probMatrix, prevSequence, eventType) 
{	
	/*
	* IMPORTANTE 
	* VER ERROR CUANDO LA SECUENCIA ES == 0 
	* (O cuando clickeo "NEXT STATE" Antes de leer el clip midi)
	*/
	
	Console.print ("Proximo estado para: " + eventType);
	
	// Multiplico x 99 para asegurarme que nunca pase ningún acumulado.
	local randValue = Math.random() * 99; 
	Console.print("Probabilidad Random: " + Math.round(randValue) + "%") ;
	
	local cumulative = 0;					 
	Console.print("Secuencia previa: [" + prevSequence + "]");

	// Para cada [próxima nota] en las probabilidad de la [secuencia previa] 
    for (nextState in probMatrix[prevSequence]) 
    {
	    // Acumulo la cantidad de probabilidad
	    cumulative += probMatrix[prevSequence][nextState];
	    
	    // Debug - Mostrar el valor de probabilidad acumulado 
	    Console.print("Próxima prob a superar: " + cumulative + "%");
	    
	    // Si randValue es mayor al valor de probabilidad
        if (randValue <= cumulative)  
        { 	
        	// Debug - Mostrar próximo estado
        	Console.print("---");
        	Console.print("Proxima " + eventType + " correspondiente a prob " + cumulative + "%: " + nextState);
        	
        	// Devuelve el proximo estado
        	return nextState; 
        }
 	}
}

// Seleccionar próximo estado de nota, velocidad y duración
inline function onNextNoteControl(component, value) 
{	
	
	if (!value) 
	{	
		return; 
	}
	 
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
};

Content.getComponent("NextNote").setControlCallback(onNextNoteControl);


// Borrar todo el contenido midi
inline function onClearMidiSequenceControl(component, value)
{
	if (!value) 
	{
		return;
	}
	
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
    if (value)	{ midiPlayer1.play(0); Console.print("Prender"); }
    else		{ midiPlayer1.stop(0); Console.print("Apagar") ; }
};

Content.getComponent("PlayMIDISequence").setControlCallback(onPlayMIDIControl);


// Quizas sirva esto?? --> midiPlayer1.connectToPanel(var panel)
//midiPlayer1.isSequenceEmpty(int indexOneBased);
//midiPlayer1.isEmpty();

//midiPlayer1.changed();
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
 