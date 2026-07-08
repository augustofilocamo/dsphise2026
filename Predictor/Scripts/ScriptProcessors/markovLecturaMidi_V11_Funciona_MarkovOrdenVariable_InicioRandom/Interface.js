Content.makeFrontInterface(600, 600);

include("MarkovExample_ToDelete.js");

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

// Recibir la list de eventos
const var midiList = midiPlayer1.getEventList();	

// Asignar Matrix de probabilidades en notas
for(event in midiList)
{	/*	TODO ESTO PARSARLO A UNA FUNCION, ASI SE REUSA PARA LA ULTIMA NOTA,	
		PARA LA VELOCIDAD Y LA DURACIÓN.
	*/
    if (event.isNoteOn()) {
    	note = event.getNoteNumber();
        Console.print("Note On: " + note);
        
        // Update note counts
        if (noteCounts[note] == undefined) { noteCounts[note] = 0; Console.print ("First Note"); }
        
        //Console.print( "Note Count for " + note + ": " + noteCounts[note]);
        
        noteCounts[note]++;
        
        Console.print( "Note Count for " + note + ": " + noteCounts[note]);
        
        /* Update transition counts */
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
      	addNoteInPrevSeq(note);
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
//markovOrder
var step = 0;
Console.print("SEGUNDO FOR: ");
for(event in midiList)
{	/*	
		TODO ESTO PARSARLO A UNA FUNCION, ASI SE REUSA PARA LA ULTIMA NOTA,	
		PARA LA VELOCIDAD Y LA DURACIÓN.
	*/
	// Si el evento es note on y el paso es menor al orden markov
    if (event.isNoteOn() && step < markovOrder) {
    	Console.print("PASO: " + step);
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
      	step++;
    }	// Por ahora, corre en toda la lista con los note off.
    	// Hacer una inline function y descomentar el "else" de abajo
    // else {return;} // DESCOMENTAR ESTO
}


// Función para convertir la cuenta de transiciones en probabilidades
for (prevNoteSequence in transitionMatrix) 
{
	probabilities[prevNoteSequence] = {};	// Declaro objeto con las secuencias de notas del orden de Markov
	var totalCount = 0;	
	
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


/* Chequear que esté todo bien */
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

/*
Console.print("Ahora con ARRAYS: ");

var probabilitiesArray = [];		// Array to store probabilities for the next notes

// Store probabilities in probabilitiesArray
for (prevNoteSequence in probabilities) 
{
    for (endNote in probabilities[prevNoteSequence]) 
    {
        probabilitiesArray.push
        ({
            from: prevNoteSequence,
            to: endNote,
            probability: probabilities[prevNoteSequence][endNote]
        });
    }
}

// Debug
for (var i = 0; i < probabilitiesArray.length; i++) 
{
    Console.print("From note(s): " + probabilitiesArray[i].from +
                  " To note: " + probabilitiesArray[i].to +
                  " Probability: " + probabilitiesArray[i].probability);
}

Console.print("Cantidad de opciones " + probabilitiesArray.length);
*/

/* FUNCIONES OBJETOS ------ PASAR A SCRIPT EXTERNO */
// CALCULAR TAMAÑO

inline function getSizePrevSeq(obj) 
{
	local size = 0;
	for (PrevSeq in obj) { size++; }
	return size;
}

inline function getSizeProb(obj) 
{
	local size = 0;
	for (PrevSeq in obj) 
	{
		for (nextState in obj[PrevSeq]) { size++; } 
	}
	return size;
}

// SELECCIONAR SECUENCIA ESPECIFICA
inline function getSpecificPrevSeq(obj, specificValue) 
{	// Contador
	local count = 0;			
	
	// OJO. El valor específico debe ser menor o igual al tamaño de la matriz.
	
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
	
	// Debug - Indice Random y su secuencia
	Console.print ("SECUENCIA N° " + randomIndex + ": " + array[randomIndex]);
	
	// Debug - Largo array
	Console.print ("Largo Array: " + array.length);
	
	// Devuelvo el Indice Random y su secuencia
	return array[randomIndex];
}


// SELECCIONAR PRÓXIMO ESTADO
inline function selectNextState(probMatrix, prevSequence) {
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

// Selecciono secuencia al azar de la matriz
Console.print ("Comienza con");
prevNoteSequence = getRandomPrevSeq(probabilities);

// Limpio el array de notas 
prevNotes.clear();

//Le asigno las notas obtenidas del índice random
prevNotes = prevNoteSequence.split(",");

// Debug - Notas de secuencia elegida al azar
//for (note in prevNotes) {Console.print("Notas del Random separadas: " + note);}


inline function onNextNoteControl(component, value) {	
	if (value)	{
		local nextMelodyState = selectNextState(probabilities, prevNoteSequence); 
		
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




// Read clip MIDI
inline function onReadMIDIControl(component, value)
{
    if (value)	{ midiPlayer1.play(0); Console.print("Prender"); }
    else		{ midiPlayer1.stop(0); Console.print("Apagar") ; }
};

Content.getComponent("Read MIDI").setControlCallback(onReadMIDIControl);




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
 