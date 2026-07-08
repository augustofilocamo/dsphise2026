Content.makeFrontInterface(600, 600);

//include("MarkovExample_ToDelete.js");

// Variables globales para el tiempo y la nota actual
const var timer = Engine.createTimerObject();
const var envelope = Synth.getModulator("AHDSR Envelope1")

// Matrices
var noteCounts = {};		// Stores the counts of notes
var transitionMatrix = {};	// Como asignar probabilidades a las notas?
var probabilities = {};		// matrix de probabilidades
var prevNotes = []; 		// Array de notas anteriores
var note = 0; 				// Recibir los .getNoteNumber() del midi event
var prevNoteSequence = 0; 	// Recibir y agrupar las notas previas en una secuencia 

var markovOrder = 2;		// Orden de Cadena Markov

// Synth
Synth.addNoteOn(1, 60, 120, 0); // channel, noteNumber, velocity, timeStampSamples

/********** MIDI **********/
// Tomar el reproductor midi
const var midiPlayer1 = Synth.getMidiPlayer("MIDI Player1");	


var midiList = [];	// Formación para recibir la lista de eventos

midiList.clear();

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
	        Console.print("Note On: " + note);
	        
	        // Si la nota no existe en el objecto, creala con un cero
	        if (noteCounts[note] == undefined) { noteCounts[note] = 0; Console.print ("First Note"); }
	        
	        //Console.print( "Note Count for " + note + ": " + noteCounts[note]);
	        
	        // Aumentá la cuenta en uno
	        noteCounts[note]++;
	        
	        Console.print( "Note Count for " + note + ": " + noteCounts[note]);
	        
	        /* Actualizar la cuenta de transiciones */
	        // Si la cantidad de notas equivale al orden de markov
	        if (prevNotes.length == markovOrder) {
		        // Junta las dos notas en un par
	            prevNoteSequence = prevNotes.join(',');		
	                        
	            // Si la matrix no tiene ese par, agregalo	
	            if (transitionMatrix[prevNoteSequence] == undefined) { transitionMatrix[prevNoteSequence] = {}; }
	            
	            // Si la matrix no tiene un contador asociado a la nota de la secuencia previa, crealo con un 0
	            if (transitionMatrix[prevNoteSequence][note] == undefined) { transitionMatrix[prevNoteSequence][note] = 0; }
	                        
	            // Sumá 1 al contador de probabilidad
	            transitionMatrix[prevNoteSequence][note]++;
	            
	            // Debug
	            Console.print("Transition from [" + prevNoteSequence + "] to " 
	            + note + ": " + transitionMatrix[prevNoteSequence][note]);
	        }
	        // agregá la nota en la secuencia de notas previas
	      	addNoteInPrevSeq(note);
	    }
	}
}

inline function addNoteInPrevSeq (note) {
	// Agregar última nota al lista de notas tocadas
	prevNotes.push(note);
	
	// Mientras el largo del array sea diferente al orden de markov, borrar el elemento más viejo.
	// Es para asegurarse que el conjunto de notas siempre sea igual al orden de Markov
	while (prevNotes.length > markovOrder) { prevNotes.removeElement(0); } 
	
	// Debug - Mostrar las notas
	//for (note in prevNotes) {Console.print("Notas en formacion prevNotes: " + note); }	
}

// FUNCION PARA CONECTAR LA ÚLTIMA NOTA CON LA PRIMERA. VER DE SIMPLIFICAR
// midiList[0] → Primer evento midi con nota, velocidad y duración
/* Hacer lo mismo con .getTimestamp() y .getVelocity() */ 

//Console.print("TERCERA NOTA: " + midiList[2].getNoteNumber()); // Debug primer nota 

// Hago un for que represente la cantidad de notas para adelante 
// dependiendo del orden Markov
// markovOrder

inline function assignLastSequence()
{	// creo
	local count = 1;
	Console.print("SEGUNDO FOR: ");
	for(event in midiList)
	{	
		// Si el evento es note on y el paso es menor al orden markov
	    if (event.isNoteOn() ) {
	    	Console.print("Cuenta: " + count);
	    	note = event.getNoteNumber();
	        Console.print("Note On: " + note);
	        
	        // Update note counts
	        if (noteCounts[note] == undefined) { noteCounts[note] = 0; Console.print ("First Note"); }
	        
	        //Console.print( "Note Count for " + note + ": " + noteCounts[note]);
	        
	        noteCounts[note]++;
	        
	        Console.print( "Note Count for " + note + ": " + noteCounts[note]);
	        
	        /* Update transition counts */
	        // Saco el condicional porque el largo es = a markov
	        //if (prevNotes.length == markovOrder) {}
	        // Junta las dos notas en un par
	        prevNoteSequence = prevNotes.join(',');		
	                    
	        // Si la matrix no tiene ese par, agregalo	
	        if (transitionMatrix[prevNoteSequence] == undefined) { transitionMatrix[prevNoteSequence] = {}; }
	        
	        // Si la matrix no tiene un contador asociado a la nota de la secuencia previa, crealo con un 0
	        if (transitionMatrix[prevNoteSequence][note] == undefined) { transitionMatrix[prevNoteSequence][note] = 0; }
	                    
	        // Sumá 1 al contador de probabilidad
	        transitionMatrix[prevNoteSequence][note]++;
	        
	        // Debug
	        Console.print("Transition from [" + prevNoteSequence + "] to " 
	        + note + ": " + transitionMatrix[prevNoteSequence][note]);
	        
	      	addNoteInPrevSeq(note);
	      	
	      	// Si la cuenta es menor al orden Markov
	      	if (count < markovOrder)
	      	{	// Sumá uno a la cuenta
		      	count++;
	      	} else { return; } // Sino, terminá la función      	
	    }	    	
	}
}

inline function transToProbMatrix()
{
	// Función para convertir la cuenta de transiciones en probabilidades
	for (prevNoteSequence in transitionMatrix) 
	{
		probabilities[prevNoteSequence] = {};	// Declaro objeto con las secuencias de notas del orden de Markov
		local totalCount = 0;	
		
		/* calcular todas las posibilidades de transicion para la secuencia */
		
		// Para cada nota de la secuencia en la matriz
		for (endNote in transitionMatrix[prevNoteSequence]) 
		{ 
			// sumar el total de n° de posibilidades.
			totalCount += transitionMatrix[prevNoteSequence][endNote]; 
		}
		// Como pueden ir más de una vez hacia una nota
		// hay que sumar todas las veces de destino de todas las notas
		
		
		/* Calcular las probabilidades */
		// Para cada transición en la matriz
		for (endNote in transitionMatrix[prevNoteSequence])
		{
			// Calcular su probabilidad, sabiendo el número máximo de probabilidades
			probabilities[prevNoteSequence][endNote] = transitionMatrix[prevNoteSequence][endNote] / totalCount;
		}
	}
}
inline function debugMatrix()
{
	/* Chequear que esté todo bien */
	Console.print("-----------------");
	Console.print("Matriz con Objetos: ");
	
	// Print probabilities for debugging
	for (prevNoteSequence in probabilities) 
	{
	    Console.print("From notes " + prevNoteSequence + ":");
	    for (endNote in probabilities[prevNoteSequence]) 
	    {
	        Console.print("		To note " + endNote + ": " + probabilities[prevNoteSequence][endNote]);
	    }
	}
}


// SELECCIONAR SECUENCIA ESPECIFICA (Todavía no se usó, se puede borrar)
inline function getSpecificPrevSeq(obj, specificValue) 
{	// Contador
	local count = 0;			
	
	// OJO. El valor específico debe ser menor o igual al tamaño de la matriz.
	// se p
	
	for (seq in obj) 
	{ 	// cuando el contador sea igual al valor específico:
		if (count == specificValue) 
		{	// Debug - Muestro secuencia elegida y su valor
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

// leer notas
inline function onReadMidiFileControl(component, value)
{
	if (value)
	{
		assignNotesInTransitionMatrix();
		assignLastSequence();
		transToProbMatrix();
		debugMatrix();
		getRandomPrevSeq(probabilities);	
	}
};

Content.getComponent("ReadMidiFile").setControlCallback(onReadMidiFileControl);


/* Leer midi al arrastrar */


// SELECCIONAR PRÓXIMO ESTADO
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


inline function onNextNoteControl(component, value) {	
	if (value)	{
		/* Agregar Caso para clip midi Vacio */
	
		local nextMelodyState = selectNextState(probabilities, prevNoteSequence); 
		
		/* agregar acá velocidades y duración */
		
		// local nextVelocityState
		// local nextDurationState
		Console.print("Proxima NOTA: " + nextMelodyState);
		
		//Console.print("Largo array notas: " + prevNotes.length);
		// Actualizar secuencia previa de notas 
		addNoteInPrevSeq (nextMelodyState);
					
		// Debug - Que sólo haya la cantidad de notas igual al orden markov
		//for (notes in prevNotes) { Console.print(" " + notes); }
		//Console.print("Largo array notas: "+ prevNotes.length);
		
		// guarda la nota nueva como la secuencia previa
		prevNoteSequence = prevNotes.join(",");
		
		// Debug - Próxima secuencia
		//Console.print("Próxima secuencia: " + prevNoteSequence);	
	}  
};

Content.getComponent("NextNote").setControlCallback(onNextNoteControl);


inline function onClearMidiSequenceControl(component, value)
{
	if (value)
	{
		midiPlayer1.clearAllSequences();
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
 