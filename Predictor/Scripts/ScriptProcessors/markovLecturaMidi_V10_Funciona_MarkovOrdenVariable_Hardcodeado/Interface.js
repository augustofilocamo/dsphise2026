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

var markovOrder = 3;		// Orden de Cadena Markov

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
for (prevNoteSequence in transitionMatrix) {
	
	probabilities[prevNoteSequence] = {};	// Declaro objeto con las secuencias de notas del orden de Markov
	var totalCount = 0;	
	
	/* calcular todas las posibilidades de transicion para la secuencia */
	
	// Para cada nota de la secuencia en la matriz
	for (endNote in transitionMatrix[prevNoteSequence]) { 
		// sumar el total de n° de posibilidades.
		totalCount += transitionMatrix[prevNoteSequence][endNote]; 
	}
	// Como pueden ir más de una vez hacia una nota
	// hay que sumar todas las veces de destino de todas las notas
	
	
	/* Calcular las probabilidades */
	// Para cada transición en la matriz
	for (endNote in transitionMatrix[prevNoteSequence]){
		// Calcular su probabilidad, sabiendo el número máximo de probabilidades
		probabilities[prevNoteSequence][endNote] = transitionMatrix[prevNoteSequence][endNote] / totalCount;
	}
}


/* Chequear que esté todo bien */
Console.print("Matriz con Objetos: ");

// Print probabilities for debugging
for (prevNoteSequence in probabilities) {
    Console.print("From notes " + prevNoteSequence + ":");
    for (endNote in probabilities[prevNoteSequence]) {
        Console.print("		To note " + endNote + ": " + probabilities[prevNoteSequence][endNote]);
    }
}

Console.print("Ahora con ARRAYS: ");

var probabilitiesArray = [];		// Array to store probabilities for the next notes

// Store probabilities in probabilitiesArray
for (prevNoteSequence in probabilities) {
    for (endNote in probabilities[prevNoteSequence]) {
        probabilitiesArray.push({
            from: prevNoteSequence,
            to: endNote,
            probability: probabilities[prevNoteSequence][endNote]
        });
    }
}

/* Chequear que esté todo bien */
for (var i = 0; i < probabilitiesArray.length; i++) {
    Console.print("From note(s): " + probabilitiesArray[i].from +
                  " To note: " + probabilitiesArray[i].to +
                  " Probability: " + probabilitiesArray[i].probability);
}

Console.print("Cantidad de opciones " + probabilitiesArray.length);

inline function getSizeNote(matrix) {
	local size = 0;
	for (PrevSeq in matrix) { size++; }
	return size;
}

inline function getSizeProb(matrix) {
	local size = 0;
	for (PrevSeq in matrix) { 
		for (nextState in matrix[PrevSeq]) { size++; } 
	}
	return size;
}

inline function selectNextState(probMatrix, prevSequence) {
	local randValue = Math.random();	
	local cumulative = 0;	
	// Paso el valor del array a valor propio
	//local prev_seq = 0;
	Console.print("Random: " + randValue);
	
	// si la nota no lleva a ningún lado, ir al DO
	// if ()
	Console.print("prevSequence en la función: " + prevSequence);
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

// Limpio el array de notas para usarlo luego en la generación de notas


// Console.print(probabilities.);
// prevNotes.clear();

/* PREDETERMINAR EL COMIENZO */
// Hardcodeada sucia, mejorar con un random
/*
if (markovOrder == 1) { prevNoteSequence = "60"; }	// Comienzo para Orden Markov 1
else if { prevNoteSequence = "65,64"; }				// Comienzo para Orden Markov 2
else 	{ prevNoteSequence = "60,64,62"; }			// Comienzo para Orden Markov 2
*/
switch(markovOrder) {
  case 1:
    prevNoteSequence = "60";
    break;
  case 2:
    prevNoteSequence = "65,64";
    break;
  case 3:
  	prevNoteSequence = "60,64,62";
  default: ;
}

// HAY QUE PREVENIR QUE SEA 

inline function onNextNoteControl(component, value) {	
	if (value)	{
		local nextMelodyState = selectNextState(probabilities, prevNoteSequence); 
		
		Console.print("SEQ PREVIA: " + prevNoteSequence + " PROX NOTA: " + nextMelodyState);
		
		Console.print("Largo array notas: " + prevNotes.length);
		// Actualizar secuencia previa de notas 
		addNoteInPrevSeq (nextMelodyState);
		
		/*	
			AGREGAR LA NUEVA NOTA A LA SECUENCIA ANTERIOR
			Y QUE SE PUEDA LEER DENTRO DE LA MATRIZ			
		*/
				
		// Debug que sólo haya la cantidad de notas en el orden markov
		for (notes in prevNotes) { Console.print("Notas en la seq: " + notes); }
		prevNoteSequence = prevNotes.join(",");  
		Console.print("Notas en el Array: " + prevNotes[0]);
		Console.print("Largo array notas limitado: "+ prevNotes.length);
		
		// guarda la nota nueva como la secuencia previa
		
		Console.print("PrevSeq NUEVA: " + prevNoteSequence);	
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
 