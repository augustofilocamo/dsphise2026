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
var transitionMatrix = {};		// Matrix de transiciones
var probabilitiesMatrix = {};	// Matrix de probabilidades

// Notas
var note = 0; 					// Recibir los .getNoteNumber() del midi event
var noteCounts = {};			// Stores the counts of notes
var prevNotes = []; 			// Array de notas anteriores
var prevNoteSequence = 0; 		// Recibir y agrupar las notas previas en una secuencia 

// Velocidades
var velocity = 0;				// Recibir los .getVelocity() del midi event
var velocityCounts = {};		// Lleva la cuenta de cada velocidad
var prevVelocities = []; 		// Array de velocidades anteriores
var prevVelocitySequence = 0; 	// Recibir y agrupar las velocidades previas en una secuencia 

// Duraciones
var duration = 0;				// Recibir los .getTimestamp() del midi event (es samples???)
var durationCounts = {};		// Lleva la cuenta de cada duración
var prevDurations = []; 		// Array de duraciones anteriores
var prevDurationSequence = 0; 	// Recibir y agrupar las velocidades previas en una secuencia 

// Orden de Cadena Markov
var markovOrder = 2;	// Se puede asigar a un slider. OJO, LA CANT DE NOTAS TIENE QUE SER IGUAL O MAYOR AL ORDEN

// Synth
Synth.addNoteOn(1, 60, 120, 0); // channel, noteNumber, velocity, timestampSamples

/********** MIDI **********/
// Tomar el reproductor midi
const var midiPlayer1 = Synth.getMidiPlayer("MIDI Player1");	


var midiList = [];	// Formación para recibir la lista de eventos midi

midiList.clear();	// Limpio la lista si quedó con info de otra sesión

inline function assignNotesInTransitionMatrix()
{
	// Recibir la list de eventos
	midiList = midiPlayer1.getEventList();

	// Asignar Matrix de probabilidades en notas
	for(event in midiList)
	{	// Si el evento es un NoteOn
	    if (event.isNoteOn()) {
		    
	    	// Asigná la nota a una variable
	    	note = event.getNoteNumber();
	    	velocity = event.getVelocity();
	    	duration = event.getTimestamp();
	    	
	    	// Debug - Avisa qué nota midi es
	    	Console.print("-----------------");
	        Console.print("Note On: " + note);
	        
	        // Agregar nota a la matriz
	        addMidiEventInfo(note, noteCounts, prevNotes, prevNotes.length);
	        
	        // Agregar velocidad a la matriz
	        
	        // Agregar duración a la matriz
	        
	        
	    }
	}
}

// Función para conectar el final de la secuencia con el principio 
inline function assignLastSequence()
{	// creo contador para que el for se detenga cuando sea igual al orden Markov
	local count = 1;
	
	Console.print("-----------------");
	Console.print("SEGUNDA PASADA DE EMPALME ");
	
	// uso el mismo midilist porque la secuencia es la misma
	
	for(event in midiList)
	{	
		// Si el evento es note on y el paso es menor al orden markov
	    if (event.isNoteOn() ) {
	    	
	    	note = event.getNoteNumber();
	    	// Debug - cuenta
	    	Console.print("-----------------");
	        Console.print("Cuenta: " + count);
	        Console.print("Note On: " + note);
	        
	        // Agregar nota a la matriz
	        addMidiEventInfo(note, noteCounts, prevNotes, prevNotes.length);
	      	
	      	// Agregar velocidad a la matriz
	      	
	      	
	      	// Agregar duración a la matriz
	      	
	      	
	      	
	      	// Si la cuenta es igual al orden Markov
	      	if (count == markovOrder)
	      	{	// terminá la función 
		      	return;
	      	} else { count++; } // Sino, Sumá uno a la cuenta      	
	    }	    	
	}
}

inline function addMidiEventInfo(eventInfo, eventCount, prevSeqEvent, prevSeqEventLenght)
{
	// Actualizá la secuencia de notas
	updateSeqCount(eventCount, eventInfo);
		        
	// Actualizar la cuenta de transiciones
	updateTransitionCount(prevSeqEvent, prevSeqEventLenght, eventInfo);
	 
	// agregá la nota en la secuencia de notas previas
	addNoteInPrevSeq(eventInfo);
}

// Actualizar secuencia de valores
inline function updateSeqCount (seqCount, value) /* SE PUEDE USAR PARA VELOCITIES Y TIEMPO*/
{
	// Si la nota no existe en el objecto, creala con un cero
	if (seqCount[value] == undefined) { seqCount[value] = 0; Console.print ("First Note"); }
	
	// Aumentá la cuenta en uno
	seqCount[value]++;
	
	// Debug - Mostra cuántas veces se usó esa nota
	Console.print( "Count for " + value + ": " + seqCount[value]);
}

inline function updateTransitionCount (seqNote, seqLenght, nextNote)
{
	// Si la cantidad de notas equivale al orden de markov
    if (seqLenght == markovOrder) {		//prevNotes.length
    	
    	//Console.print("Sos Array? " + seqNote.join(','));
     	// Junta las dos notas en un par
        prevNoteSequence = seqNote.join(',');		
        
        // Si la matrix no tiene esa secuencia, agregalo	
        if (transitionMatrix[prevNoteSequence] == undefined) { transitionMatrix[prevNoteSequence] = {}; }
        
        // Si la matrix no tiene un contador asociado a la nota de la secuencia previa, crealo con un 0
        if (transitionMatrix[prevNoteSequence][nextNote] == undefined) { transitionMatrix[prevNoteSequence][nextNote] = 0; }
                    
        // Sumá 1 al contador de probabilidad
        transitionMatrix[prevNoteSequence][nextNote]++;
        
        // Debug
        Console.print("Transition from [" + prevNoteSequence + "] to " 
        + nextNote + ": " + transitionMatrix[prevNoteSequence][nextNote]);
    }	
}

// Agregar la nota en la secuencia
/* Hacer la misma función para velocidades y offset */
inline function addNoteInPrevSeq (note) 
{
	// Agregar última nota al lista de notas tocadas
	prevNotes.push(note);
	
	// Mientras el largo del array sea diferente al orden de markov, borrar el elemento más viejo.
	// Es para asegurarse que el conjunto de notas siempre sea igual al orden de Markov
	while (prevNotes.length > markovOrder) { prevNotes.removeElement(0); } 
	
	// Debug - Mostrar las notas
	//for (note in prevNotes) {Console.print("Notas en formacion prevNotes: " + note); }	
}

// Asignar las probabilidades para cada caso
inline function transToProbMatrix()
{
	// Función para convertir la cuenta de transiciones en probabilidades
	for (prevNoteSequence in transitionMatrix) 
	{
		probabilitiesMatrix[prevNoteSequence] = {};	// Declaro objeto con las secuencias de notas del orden de Markov
		local totalCount = 0;	
		
		/* calcular todas las posibilidades de transicion para la secuencia */
		// Como pueden ir más de una vez hacia una nota
		// hay que sumar todas las veces de destino de todas las notas
		
		// Para cada nota de la secuencia en la matriz
		for (endNote in transitionMatrix[prevNoteSequence]) 
		{ 
			// sumar el total de n° de posibilidades.
			totalCount += transitionMatrix[prevNoteSequence][endNote]; 
		}

		/* Calcular las probabilidades */
		// Para cada transición en la matriz
		for (endNote in transitionMatrix[prevNoteSequence])
		{
			// Calcular su probabilidad, sabiendo el número máximo de probabilidades
			probabilitiesMatrix[prevNoteSequence][endNote] = transitionMatrix[prevNoteSequence][endNote] / totalCount;
		}
	}
}

// Debug - Mostrar todas las posibilidades de la matriz
inline function debugMatrix()
{
	/* Chequear que esté todo bien */
	Console.print("-----------------");
	Console.print("Matriz con Objetos: ");
	
	// Print probabilities for debugging
	for (prevNoteSequence in probabilitiesMatrix) 
	{
	    Console.print("From notes " + prevNoteSequence + ":");
	    for (endNote in probabilitiesMatrix[prevNoteSequence]) 
	    {
	        Console.print("		To note " + endNote + ": " + probabilitiesMatrix[prevNoteSequence][endNote]);
	    }
	}
}


// SELECCIONAR SECUENCIA ESPECIFICA (Todavía no se usó, se puede borrar)
inline function getSpecificPrevSeq(obj, specificValue) 
{	
	// Contador
	local count = 0;			
	
	// OJO. El valor específico debe ser menor o igual al tamaño de la matriz.
	// se puede agregar el caso adentro de la función
	
	for (seq in obj) 
	{ 	// cuando el contador sea igual al valor específico:
		if (count == specificValue) 
		{	
			// Debug - Muestro secuencia elegida y su valor
			Console.print("SECUENCIA N° " + specificValue + ": " + seq); 
			
			// Devolver el valor de la matriz
			return seq; 
		}
		count++; // De lo contrario, sumá 1 al contador
	}
}


// SELECCIONAR ITEM RANDOM
inline function getRandomPrevSeq(obj) 
{	
	// Creo una formación (array) para agrupar los valores de la secuencia
	local array = [];
	
	// por cada secuencia dentro de la matriz
	for (seq in obj) 
	{ 	// agregá la secuencia a la formación
		array.push (seq);
	}
	
	// Creo índice random tomando el largo de la formación
	local randomIndex = Math.randInt(0, array.length - 1); 
	
	// Debug - Largo array y secuencias
	Console.print ("-----------------");
	Console.print ("Cantidad opciones de secuencias en el array: " + array.length);
	for (seq in array)
	{	// Mostrar las opciones de elección
		Console.print ("Posibilidad n° "+ array.indexOf(seq, 0, 0) + ": " + seq); 
	}
	
	// Asigno indice Random y su secuencia al item de la matrix
	prevNoteSequence = array[randomIndex];
	
	// Debug - Indice Random y su secuencia
	Console.print ("-----------------");
	Console.print ("Seleccionada n° " + randomIndex + ": " + prevNoteSequence);
	
	// Limpio el array de notas 
	prevNotes.clear();
	
	// Asigno las notas obtenidas del índice random
	prevNotes = prevNoteSequence.split(",");
	
	return prevNotes;
}

// Generar la matriz de Markov
inline function onReadMidiFileControl(component, value)
{	
	if (value)
	{	
		// Si el reproductor o la secuencia midi están vacíos
		if (midiPlayer1.isSequenceEmpty(1) || midiPlayer1.isEmpty())
		{	
			// Avisá que está vacío /* AGREGAR "ERROR" */
			Console.print("Clip VACIO. AGREGAR MIDI");
			return;
		} else {
			// Sino, generá las probabilidades del clip
			assignNotesInTransitionMatrix();		// Agregá las notas en la matriz
			assignLastSequence();					// Conectá el final con las notas del principio
			transToProbMatrix();					// Generá una matriz con las probabilidades
			debugMatrix();							// Debug - Mostrar posibilidades
			getRandomPrevSeq(probabilitiesMatrix);	// Seleccióna una secuencia al azar para comenzar		
		}		
	}
};

//midiPlayer1.isSequenceEmpty(int indexOneBased);
//midiPlayer1.isEmpty();

Content.getComponent("ReadMidiFile").setControlCallback(onReadMidiFileControl);


/* Leer midi al arrastrar */


// Seleccionar próximo estado
inline function selectNextState(probMatrix, prevSequence) 
{	
	Console.print ("-----------------");
	local randValue = Math.random();	Console.print("Random: " + randValue);
	local cumulative = 0;				Console.print("Secuencia previa para elegir: " + prevSequence);	 
	
	
	// Para cada [próxima nota] en las probabilidad de la [secuencia previa] 
    for (nextState in probMatrix[prevSequence]) {
	    // Acumulo la cantidad de probabilidad
	    cumulative += probMatrix[prevSequence][nextState];
	       
	    Console.print("Prob Acumulado: " + cumulative);
	    //	Si randValue es mayor al valor de probabilidad
        if (randValue <= cumulative){
        	// Devuelve la nota
	       	return nextState;   	
        }
 	}
}

// Seleccionar próximo estado de nota, velocidad y duración
inline function onNextNoteControl(component, value) {	
	if (value)	{
		/* Agregar Caso para clip midi Vacio */
	
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
	}  
};

Content.getComponent("NextNote").setControlCallback(onNextNoteControl);

// Borrar todo el contenido midi
inline function onClearMidiSequenceControl(component, value)
{
	if (value)
	{
		// Limpiar todos los clips midi
		midiPlayer1.clearAllSequences();
		
		// Limpiar la formación con información midi	
		midiList.clear();					
		
	}
};

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
 