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
var prevNoteSequence = 0; 		// /*quizas se puede volar*/ Recibir y agrupar las notas de prevNotes para asignar en la matriz

// Velocidades
var veloTransMatrix = {};
var veloProbMatrix = {};
var velocity = 0;				// Recibir los .getVelocity() del midi event
var velocityCounts = {};		// Lleva la cuenta de cada velocidad
var prevVelocities = []; 		// Array de velocidades anteriores. Para el addNoteInPrevSeq(prevState)
var prevVeloSequence = 0; 		// Recibir y agrupar las notas de prevVelocities para asignar en la matriz

// Duraciones
var durTransMatrix = {};
var durProbMatrix = {};

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

// Función para procesar los eventos de notas, velocidades y duraciones
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
    //Console.print("------");
    
    // Agregar nota a la matriz
    addMidiEventInfo("note", note, noteCounts, prevNotes, noteTransMatrix);
    
    // Agregar velocidad a la matriz
    addMidiEventInfo("velocity", velocity, velocityCounts, prevVelocities, veloTransMatrix);
    
    // Agregar resta entre duraciones
    
    // Agregar duración a la matriz
    addMidiEventInfo("duration", duration, durationCounts, prevDurations, durTransMatrix);
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
	        Console.print("		To " + eventInfo + " " + nextState + ": " + matrix[prevState][nextState]);
	    }
	}
}



// Seleccionar estado de las matrices de probabilidades
inline function selectRandomState(noteMatrix, veloMatrix , durMatrix, index) /* MODULARIZADO */
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
	
	
	// Hago lo mismo con las velocidades
	posibilities = debugPosibilities(durMatrix);
	
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
	transToProbMatrix(durTransMatrix, durProbMatrix);	// duraciones
	
	// Debug - Mostrar posibilidades de cada evento
	debugMatrix("notes", noteProbMatrix);
	debugMatrix("velocities", veloProbMatrix);
	debugMatrix("durations", durProbMatrix);
	
	// Creo índice random tomando la cantidad de opciones
	local randomIndex = selectRandomIndex(noteProbMatrix);
	
	// Seleccionar estado random de la cadena usando el indice random
	selectRandomState(noteProbMatrix, veloProbMatrix, durProbMatrix, randomIndex);		
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
        { 	
        	// Debug - Mostrar próximo estado
        	Console.print ("---");
        	Console.print("Proxima " + eventType + ": " + nextState);
        	
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
	 
	/* Agregar Caso para clip midi Vacio */
	
	// Seleccionar nueva melodía usando markov
	Console.print ("-----------------");
	local nextMelodyState = selectNextState(noteProbMatrix, prevNotes.join(","), "nota");
	Console.print ("------------"); 
	local nextVelocityState = selectNextState(veloProbMatrix, prevVelocities.join(","), "velocidad"); 
	Console.print ("---------");
	local nextDurationState = selectNextState(durProbMatrix, prevDurations.join(","), "duración");
		
	//Console.print("Largo array notas: " + prevNotes.length);
	// Actualizar secuencia previa de notas 
	addEventInPrevSeq(nextMelodyState, prevNotes);
	addEventInPrevSeq(nextVelocityState, prevVelocities);
	addEventInPrevSeq(nextDurationState, prevDurations);
	
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
 