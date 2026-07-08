Content.makeFrontInterface(600, 600);

include("MarkovExample_ToDelete.js");

// Variables globales para el tiempo y la nota actual
const var Timer = Engine.createTimerObject();
const var envelope = Synth.getModulator("AHDSR Envelope1")

// matrices
const var noteCounts = {};			// Stores the counts of notes
const var transitionMatrix = {};	// Como asignar probabilidades a las notas?
const var probabilities = {};		// matrix de probabilidades
const var prevNotes = [];

const var markovOrder = 1;

const var timer = Engine.createTimerObject();



// Synth
Synth.addNoteOn(1, 60, 120, 0);

//Synth.addNoteOn(int channel, int noteNumber, int velocity, int timeStampSamples);

// Corroboración que el elemento más viejo en el array es el primero
// ya que los nuevos valores se almacenan al final de la formación
const var testeo = [1, 2, 3];
testeo.push(4);
Console.print(testeo.join(", "));

/********** MIDI **********/
// Tomar el reproductor midi
const var midiPlayer1 = Synth.getMidiPlayer("MIDI Player1");	

// Recibir la list de eventos
const var midiList = midiPlayer1.getEventList();	


// Asignar Matrix de probabilidades en notas
for(event in midiList)
{
    if(event.isNoteOn()){
    	var note = event.getNoteNumber();
        Console.print("Note On: " + note);
        
        // Update note counts
        if (noteCounts[note] == undefined) { noteCounts[note] = 0; Console.print ("First Note"); }
        
        Console.print( "Note Count for " + note + ": " + noteCounts[note]);
        
        noteCounts[note]++;
        
        /* Update transition counts */
        // Si la cantidad de notas equivale al orden de markov
        if (prevNotes.length == markovOrder) {
	        // Junta las dos notas en un par
            var prevNoteSequence = prevNotes.join(',');		
                        
            // Si la matrix no tiene ese par, agregalo	
            if (transitionMatrix[prevNoteSequence] == undefined) { transitionMatrix[prevNoteSequence] = {}; }
            
            // Si la matrix no tiene nota asociada al par, crealo con un 0
            if (transitionMatrix[prevNoteSequence][note] == undefined) { transitionMatrix[prevNoteSequence][note] = 0; }
                        
            // Sumá 1 a la nota de la secuencia
            transitionMatrix[prevNoteSequence][note]++;
            
            // Debug
            Console.print("Transition from [" + prevNoteSequence + "] to " + note + ": " 
            + transitionMatrix[prevNoteSequence][note]);
        }
        
        // Agregar última nota al lista de notas tocadas
        prevNotes.push(note);
        
        // Si el array es mayor al orden de Markov
        // if (prevNotes.length > markovOrder) { while (prevNotes.length > markovOrder) { prevNotes.removeElement(0); } }
        
        // Mientras el largo del array sea mayor al orden de markov, borrar el elemento más viejo.
        // Es para asegurarse que el conjunto de notas siempre sea igual al orden de Markov
        while (prevNotes.length > markovOrder) { prevNotes.removeElement(0); }
        
    }
    // Debug para chequear noteOff
    //if(event.isNoteOff()){Console.print ("Note Off: " + note);}
}

// Función para convertir la cuenta de transiciones en probabilidades
for (prevNoteSequence in transitionMatrix){
	
	probabilities[prevNoteSequence] = {};	// Declaro objeto con las secuencias de notas del orden de Markov
	var totalCount = 0;	
	
	/* calcular todas las posibilidades de transicion para la secuencia */
	
	// VER- "endNote" es lo mismo que "note" en la función de arriba?
	// No. Es la nota de destino de la cadena
	
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

const var probabilitiesArray = [];					// Array to store probabilities for the next notes

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


Console.print("Ahora con ARRAYS: ");


/* Chequear que esté todo bien */
for (var i = 0; i < probabilitiesArray.length; i++) {
    Console.print("From note(s): " + probabilitiesArray[i].from +
                  " To note: " + probabilitiesArray[i].to +
                  " Probability: " + probabilitiesArray[i].probability);
}
Console.print("Cantidad de opciones " + probabilitiesArray.length);

/*
function getNoteAmount(probabilities) {
	var size = 0;
	for (prevNoteSequence in probabilities) {
	    for (endNote in probabilities[prevNoteSequence]) {
	        size ++;
	 	}
	}
	return size;
}
*/

function getNoteAmount(obj) {
	var size = 0;
	for (prevNoteSequence in obj) {
	    for (endNote in obj[prevNoteSequence]) {
	        size++;
	 	}
	}
	return size;
}


const var estava = getNoteAmount(probabilities);
Console.print("TAMAÑO función: "+ estava);

inline function onNextNoteControl(component, value){	
	if (value)	{
		local randValue = Math.random(); 
		Console.print("Valor Random: " + randValue);
		/* AGREGAR LA CUENTA DEL OBJETO */
	
	}  
};

Content.getComponent("NextNote").setControlCallback(onNextNoteControl);




/* GENERACION AUTOMATICA */


// VER ESTOS
// probabilities[prevNoteSequence][endNote] 
// transitionMatrix[prevNoteSequence][endNote]

// Estado actual
const var currentMelodyState = 0; // Índice en melodyStates
const var noteOnDelayTime = 0;
const var channel = 1; // Canal MIDI
const var velocity = 60; 
const var duration = 500; // msec 


// SEGUIR ACA
// SEGUIR ACA
// SEGUIR ACA
// SEGUIR ACA
// SEGUIR ACA
/*tengo qeu obtener los valores de las matrices para que elija la próxima nota*/

// Helper function to get the next note based on the transition matrix
inline function selectNextState(transitionMatrix, prevNoteSequence) { //PONER probabilities[prevNoteSequence][endNote] 
	
	// Pasar los objetos a formaciones (arrays)
    local possibleTransitions = transitionMatrix[prevNotes];	// Get possible transitions for the current sequence
    local notes = [];											// Array to store possible next notes
    local probabilitiesArray = [];								// Array to store probabilities for the next notes
	
	// Collect possible next notes and their probabilities
    for (note in possibleTransitions) {
        notes.push(parseInt (note));					// Convert note to integer and add to notes array
        probabilities.push(possibleTransitions[note]);	// Add probability to probabilities array
    }
	
    // Generate a random number between 0 and 1
    local randomValue = Math.random();

    // Determine the next note based on the probabilities
    local cumulativeProbability = 0;
    for (i = 0; i < notes.length; i++) {
	    
        cumulativeProbability += probabilitiesArray[i];
        
        if (randomValue <= cumulativeProbability) {
            return notes[i]; // Return the next note based on the random value
        }
    }

    // Fallback to the first note if none selected (shouldn't happen)
    return notes[0];
}

// FALTA FUNCION PARA GENERAR LAS NOTAS
/*
inline function playMarkovNote()
{
    // Seleccionar el siguiente estado para cada propiedad
    currentMelodyState = selectNextState(currentMelodyState, melodyProbabilities);    

    // Generar valores para nota, velocidad y duración
    local note = melodyStates[currentMelodyState];

    // Reproducir la nota
    Synth.addNoteOn(channel, note, velocity, 0); 
	
    // Detener la nota después de la duración
    Synth.addNoteOff(channel, note, duration);
    
    // Configurar el temporizador para la siguiente nota
    Timer.startTimer(duration);
}
*/







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
 