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
            Console.print("Transition from [" + prevNoteSequence + "] to " 
            + note + ": " + transitionMatrix[prevNoteSequence][note]);
        }
        
        // Agregar última nota al lista de notas tocadas
        prevNotes.push(note); 
        
        
        // Si el array es mayor al orden de Markov
        

        // Mientras el largo del array sea diferente al orden de markov, borrar el elemento más viejo.
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

/* Chequear que esté todo bien */
for (var i = 0; i < probabilitiesArray.length; i++) {
    Console.print("From note(s): " + probabilitiesArray[i].from +
                  " To note: " + probabilitiesArray[i].to +
                  " Probability: " + probabilitiesArray[i].probability);
}
Console.print("Cantidad de opciones " + probabilitiesArray.length);


inline function getSize(matrix) {
	local size = 0;
	for (PrevSeq in matrix) {
	    for (nextState in matrix[PrevSeq]) {
	        size++;
	 	}
	}
	return size;
}

inline function selectNextState(probMatrix, prevSequence) {
	local randValue = Math.random();	
	local cumulative = 0;	
	Console.print("Random: " + randValue);
	
	// Para cada [próxima nota] en las probabilidad de la [secuencia previa] 
    for (nextState in probMatrix[prevSequence]) {
	    // Acumulo la cantidad de probabilidad
	    cumulative += probMatrix[prevSequence][nextState];
	    
	    Console.print("Prob Acumulado: " + cumulative);
	    //	Si randValue es mayor al valor de probabilidad
        if (randValue <= cumulative){
        	// Para la proxima nota de esa secuencia anterior, devolveme la nota
	       	for (nextState in probMatrix[prevSequence]) { return nextState; }
        }
 	}
}

const var prevSeq = 60;

//const var estado = selectNextState(probabilities, prevSeq); 
//Console.print("VALOR PROBABILIDAD: "+ estado);

//const var matrixSize = getSize(probabilities); Console.print("TAMAÑO función: "+ matrixSize);



inline function onNextNoteControl(component, value){	
	if (value)	{
		
		
		local nextNote = selectNextState(probabilities, prevSeq); Console.print("PROX NOTA: "+ nextNote);
	}  
};

Content.getComponent("NextNote").setControlCallback(onNextNoteControl);




/* GENERACION AUTOMATICA */




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
 