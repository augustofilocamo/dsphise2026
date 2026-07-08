Content.makeFrontInterface(600, 600);

//include("MarkovExample_ToDelete.js");

// Variables globales para el tiempo y la nota actual
const var timer = Engine.createTimerObject();
const var envelope = Synth.getModulator("AHDSR Envelope1")

// Matrices
/*
* La de probabilidad es igual a la de transiciones
* pero cambia el valor final. En vez de llevar la cuenta por cada
* item, asigna la probabilidad que tiene de ir a ese valor la cadena de Markov
*/
var transitionMatrix = {};		// Matrix de transiciones	GENERICA
var probabilitiesMatrix = {};	// Matrix de probabilidades GENERICA

// Cómo están organizadas las matrices
// transitionMatrix[prevNoteSequence][nextNote]

// probabilitiesMatrix[prevNoteSequence][endNote]

// Notas
var noteTransMatrix = {};
var noteProbMatrix = {};

//var note = 0; 				// Recibir los .getNoteNumber() del midi event
var noteCounts = {};			// Stores the counts of notes
var prevNotes = []; 			// Array de notas anteriores. Para el addNoteInPrevSeq(prevState)
var prevNoteSequence = 0; 		// Recibir y agrupar las notas de prevNotes para asignar en la matriz

// Velocidades
var velocityTransMatrix = {};
var velocityProbMatrix = {};
var velocity = 0;				// Recibir los .getVelocity() del midi event
var velocityCounts = {};		// Lleva la cuenta de cada velocidad
var prevVelocities = []; 		// Array de velocidades anteriores. Para el addNoteInPrevSeq(prevState)
var prevVeloSequence = 0; 		// Recibir y agrupar las notas de prevVelocities para asignar en la matriz

// Duraciones
var durationTransMatrix = {};
var durationProbMatrix = {};

var duration = 0;				// Recibir los .getTimestamp() del midi event (es samples???)
var durationCounts = {};		// Lleva la cuenta de cada duración
var prevDurations = []; 		// Array de duraciones anteriores. Para el addNoteInPrevSeq(prevState)
var prevDurSequence = 0;		// Recibir y agrupar las notas de prevDurations para asignar en la matriz 

// Orden de Cadena Markov
var markovOrder = 2;	// Se puede asigar a un slider. OJO, LA CANT DE NOTAS TIENE QUE SER IGUAL O MAYOR AL ORDEN

// Debug - tono de confirmación al recompilar
Synth.addNoteOn(1, 60, 120, 0); // channel, noteNumber, velocity, timestampSamples

/********** MIDI **********/
// Tomar el reproductor midi
const var midiPlayer1 = Synth.getMidiPlayer("MIDI Player1");	

var midiList = [];	// Formación para recibir la lista de eventos midi. Se puede sacar

/* Procesos principales */

// Procesar las notas midi
inline function assignEventsInTransitionMatrix()
{	
	// Limpio la lista si quedó con info de otra sesión
	//midiList.clear();	/* SE PUEDE SACAR ESTO */
	
	// Recibir la list de eventos
	//midiList = midiPlayer1.getEventList();
	
	// Por cada evento de la lista del reproductor midi
	for(event in midiPlayer1.getEventList())
	{	
		// Si el evento es un NoteOn
	    if (event.isNoteOn()) 
	    {   
	    	processEvents(event);
	    }
	}
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
	for(event in midiPlayer1.getEventList())
	{	
		// Si el evento es noteOn
	    if(event.isNoteOn()) 
	    {	
	    	// Proceso los eventos
	    	processEvents(event);	
	    	
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

// Función para  procesar los eventos 
inline function processEvents(event)
{	    
   	// Asigná la nota a una variable
   	local note = event.getNoteNumber();
   	local velocity = event.getVelocity();
   	local duration = event.getTimestamp();
   	
   	// Debug - Avisa qué nota midi es
   	Console.print("-----------------");
    Console.print("Note On: "	+ note);
    Console.print("Velocity: "	+ velocity);
    Console.print("Duration: "	+ duration);
    Console.print("------");
    
    // Agregar nota a la matriz
    addMidiEventInfo("note", note, noteCounts, prevNotes, transitionMatrix);
    
    // Agregar velocidad a la matriz
    
    // Agregar duración a la matriz
      
}

// Agregar información del evento midi a la matriz de transiciones
//inline function addMidiEventInfo(eventType, eventCount, prevEventSeq, prevEventSeqLenght)
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
inline function updateSeqCount(count, value, Type) /* SE PUEDE USAR PARA VELOCITIES Y TIEMPO */
{
	// Si la nota no existe en el objecto, 
	if (count[value] == undefined) 
	{ 	
		// creala con un cero
		count[value] = 0; 
		Console.print ("First Value for " + Type + ": " + value); 
	}
	
	// Aumentá la cuenta en uno
	count[value]++;	
	
	// Debug - Mostra cuántas veces se usó esa nota
	Console.print( "Count for " + value + ": " + count[value]);
}



// Actualizar la cuenta para cada evento midi (nota, velocity y duracion)
inline function updateTransitionCount(prevEvent, nextState, matrix) /* MODULARIZADO */
{	
// EXPONER transitionMatrix[prevNoteSequence] COMO VARIABLES

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
			probMatrix[currentState][nextState] = transMatrix[currentState][nextState] / totalCount;
		}
	}
}

// Debug - Mostrar todas las posibilidades de la matriz
inline function debugMatrix(eventInfo, matrix)			 /* MODULARIZADO */
{
	/* Chequear que esté todo bien */
	Console.print("-----------------");
	Console.print("Matriz con Objetos: ");
	
	// Print probabilities for debugging
	for (prevState in matrix) 
	{
	    Console.print("From "+ eventInfo + " " + prevState + ":");
	    for (nextState in matrix[prevState]) 
	    {
	        Console.print("		To note " + nextState + ": " + matrix[prevState][nextState]);
	    }
	}
}



// SELECCIONAR ITEM RANDOM
inline function getRandomState(matrix) /* HACER PARA VELOCITIES Y DURATION */
{	/* prevNoteSequence  */
	// Creo una formación (array) para agrupar los valores de la secuencia
	local array = [];
	
	// por cada estado dentro de la matriz, agregá la secuencia a la formación
	for (state in matrix) 
	{ 
		array.push (state); 
	}

	// Creo índice random tomando el largo de la formación
	local randomIndex = Math.randInt(0, array.length - 1); 
	
	// Debug - Largo array y secuencias
	Console.print ("-----------------");
	Console.print ("Cantidad opciones de secuencias en el array: " + array.length);
	
	// Debug - Por cada secuencia dentro de la matriz
	for (state in array) 
	{	// mostrar las opciones de elección
		Console.print ("Posibilidad n° "+ array.indexOf(state, 0, 0) + ": " + state); 
	}
	/* PROBAR CON UN MATCH - CASE */
	
	/*
	switch(action) {
	  case 'draw':
	    drawIt();
	    break;
	  case 'eat':
	    eatIt();
	    break;
	  default:
	    doNothing();
	}
	*/
	// Asigno indice Random y su secuencia al item de la matrix
	
	prevNoteSequence = array[randomIndex];
	
	// Debug - Indice Random y su secuencia
	Console.print ("-----------------");
	Console.print ("Seleccionada n° " + randomIndex + ": " + prevNoteSequence);
	
	// Limpio el array de notas 
	prevNotes.clear();
	
	// Asigno las notas obtenidas del índice random
	prevNotes = array[randomIndex].split(",");
	
	//return prevNotes;
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
	assignEventsInTransitionMatrix();							// Agregá las notas en la matriz
	assignLastSequence();										// Conectá el final con las notas del principio
	transToProbMatrix(transitionMatrix, probabilitiesMatrix);	// Generá una matriz con las probabilidades
	
	//transToProbMatrix(matrixTrans, matrixProb)
	
	// Debug - Mostrar posibilidades de cada evento
	debugMatrix("notes", probabilitiesMatrix);
	//debugMatrix("velocities", probabilitiesMatrix);
	//debugMatrix("durations", probabilitiesMatrix);
	
	// Seleccionar estado random de la cadena
	local randomIndex = getRandomState(probabilitiesMatrix);	// Seleccióna una secuencia al azar para comenzar		
};

Content.getComponent("ReadMidiFile").setControlCallback(onReadMidiFileControl);


/* Leer midi al arrastrar */


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
	
	// Seleccionar nueva melodía usando markov
	local nextMelodyState = selectNextState(probabilitiesMatrix, prevNotes.join(",")); 
	
	/* agregar acá velocidades y duración */
	// local nextVelocityState
	// local nextDurationState
	
	Console.print("Proxima NOTA: " + nextMelodyState);
	
	//Console.print("Largo array notas: " + prevNotes.length);
	// Actualizar secuencia previa de notas 
	addEventInPrevSeq(nextMelodyState, prevNotes);
					
	// guarda la nota nueva como la secuencia previa
	//prevNoteSequence = prevNotes.join(",");	
	
};

Content.getComponent("NextNote").setControlCallback(onNextNoteControl);


// Borrar todo el contenido midi
inline function onClearMidiSequenceControl(component, value)
{
	if (!value) {return;}
	
	// Limpiar todos los clips midi
	midiPlayer1.clearAllSequences();			
	
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
 