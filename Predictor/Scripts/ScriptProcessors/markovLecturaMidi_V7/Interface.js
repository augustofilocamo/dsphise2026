Content.makeFrontInterface(600, 600);

include("MarkovExample_ToDelete.js");

// Variables globales para el tiempo y la nota actual
const var Timer = Engine.createTimerObject();
const var envelope = Synth.getModulator("AHDSR Envelope1")

// matrices
var noteCounts = {};		// Stores the counts of notes
var transitionMatrix = {};	// Como asignar probabilidades a las notas?
var probabilities = {};		// matrix de probabilidades
var prevNotes = [];

var markovOrder = 1;

const var timer = Engine.createTimerObject();



// Synth
Synth.addNoteOn(1, 60, 120, 0);

//Synth.addNoteOn(int channel, int noteNumber, int velocity, int timeStampSamples);

// Corroboración que el elemento más viejo en el array es el primero
// ya que los nuevos valores se almacenan al final de la formación
//const var testeo = [1, 2, 3];
//testeo.push(4);
//Console.print(testeo.join(", "));

/********** MIDI **********/
// Tomar el reproductor midi
const var midiPlayer1 = Synth.getMidiPlayer("MIDI Player1");	

// Recibir la list de eventos
const var midiList = midiPlayer1.getEventList();	


// Asignar Matrix de probabilidades en notas
for(event in midiList)
{
    if ( event.isNoteOn() ) {
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
        
      	addNoteInPrevNotes (note);
    }
    // Debug para chequear noteOff
    //if(event.isNoteOff()){Console.print ("Note Off: " + note);}
}

inline function addNoteInPrevNotes (note) {
	// Agregar última nota al lista de notas tocadas
	prevNotes.push(note);
	
	// Si el array es mayor al orden de Markov
	// if (prevNotes.length > markovOrder) { while (prevNotes.length > markovOrder) { prevNotes.removeElement(0); } }
	
	// Mientras el largo del array sea diferente al orden de markov, borrar el elemento más viejo.
	// Es para asegurarse que el conjunto de notas siempre sea igual al orden de Markov
	while (prevNotes.length > markovOrder) { prevNotes.removeElement(0); } 
}

// Limpio el array de notas para usarlo luego en la generación de notas
prevNotes.clear();

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

var probabilitiesArray = [];					// Array to store probabilities for the next notes

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


inline function getSizeProb(matrix) {
	local size = 0;
	for (PrevSeq in matrix) {
	    for (nextState in matrix[PrevSeq]) {
	        size++;
	 	}
	}
	return size;
}

inline function getSizeNote(matrix) {
	local size = 0;
	for (PrevSeq in matrix) {
	    size++;
	}
	return size;
}

inline function selectNextState(probMatrix, prevSequence) {
	local randValue = Math.random();	
	local cumulative = 0;	
	// Paso el valor del array a valor propio
	//local prev_seq = 0;
	Console.print("Random: " + randValue);
	
	// Para cada [próxima nota] en las probabilidad de la [secuencia previa] 
    for (nextState in probMatrix[prevSequence]) {
	    // Acumulo la cantidad de probabilidad
	    cumulative += probMatrix[prevSequence][nextState];
	    
	    Console.print("Prob Acumulado: " + cumulative);
	    //	Si randValue es mayor al valor de probabilidad
        if (randValue <= cumulative){
	        // Agregar la nota en la secuencia de notas previas prevNotes[]
	        //addNoteInPrevNotes (nextState);
        	// Devuelve la nota
	       	return nextState;
	       	
        }
 	}
}

inline function getRandomValueFromCategory(category) {
  //local categoryValues = category;
  local categorySize = 0;
  
  for (category in probabilities) {categorySize++ ;}
    
  Console.print("categoryValues: " + categorySize);
  
  local randomIndex = Math.floor ( Math.random() * categorySize );
  
  Console.print("randomIndex: " + randomIndex);
  Console.print("probabilities[randomIndex]: " + probabilities[prevNoteSequence][randomIndex]);
  return probabilities[randomIndex];
}


//Console.print("probabilities[prevNoteSequence] random: " + probabilities[prevNoteSequence].);

//const var initialValue = getRandomValueFromCategory(prevNoteSequence);
//Console.print("Valor inicial: " + initialValue);

var prevSeq = 60;

//const var estado = selectNextState(probabilities, prevSeq); 
//Console.print("VALOR PROBABILIDAD: "+ estado);

//const var matrixSize = getSize(probabilities); Console.print("TAMAÑO función: "+ matrixSize);

//prevNotes.clear();

inline function onNextNoteControl(component, value) {	
	if (value)	{
		local nextMelodyState = selectNextState(probabilities, prevSeq); 
		
		Console.print("SEQ PREVIA: " + prevSeq + " PROX NOTA: " + nextMelodyState);
		
		Console.print("Largo array notas: " + prevNotes.length);
		
		addNoteInPrevNotes (nextMelodyState);
		// Debug que sólo haya la cantidad de notas en el orden markov
		for (notes in prevNotes) {Console.print("Notas: " + notes);}
		Console.print("Notas en el Array: " + prevNotes[0]);
		Console.print("Largo array notas limitado: "+ prevNotes.length);
		// guarda la nota nueva como la secuencia previa
		prevSeq = prevNotes.join(",");  
		Console.print("Nota NUEVA: " + prevSeq);
		
		/* ACTUALIZAR LAS NOTAS PREVIAS */
	}  
};

Content.getComponent("NextNote").setControlCallback(onNextNoteControl);

/*
inline function selectNextState(currentState, probabilities)
{
    local randValue = Math.random();	// Valor random
    local cumulative = 0;				// Acumulación de porcentajes
		
	// Debug    
    Console.print ("Random: " + randValue);
    Console.print ("Posibilities: " + probabilities[currentState].join(", "));
	
	// Selección de la próxima función //
	// Cuenta por la cantidad de elementos
    local probLenght = probabilities[currentState].length;
    for (i = 0; i < probLenght; i++)
    {	
    	// Suma los valores de cada elemento
        cumulative += probabilities[currentState][i];
        
        //Console.print ("Cumulative: " + cumulative);
        
        // Si valor random es menor o igual al acumulado
        if (randValue <= cumulative)
        {	
        	//Console.print ("estado seleccionado[i]: " + i);
            return i;	// Devuelve el número del item y termina el "for"
        }       
    }
    return currentState;  // Debug: Si no se encuentra, permanece en el estado actual
}

inline function playMarkovNote()
{
    // Seleccionar el siguiente estado para cada propiedad
    currentMelodyState = selectNextState(currentMelodyState, melodyProbabilities);
    Console.print ("Seleced array item: " + currentMelodyState);
   

    // Generar valores para nota, velocidad y duración
    local note = melodyStates[currentMelodyState];
    local velocity = 100;
    local duration = 500;

    // Reproducir la nota
    Synth.addNoteOn(channel, note, velocity, 0); 
	envelope.setAttribute(3, Engine.getDecibelsForGainFactor(velocity / 127.));	// Velocity a gain
	
    // Detener la nota después de la duración
    Synth.addNoteOff(channel, note, duration);
    envelope.setAttribute(7, duration); // Envelope Release

    // Configurar el temporizador para la siguiente nota
    Timer.startTimer(duration); //Console.print("Duration: " + duration);
}

// Configurar el temporizador para llamar a playMarkovNote
Timer.setTimerCallback( function() { playMarkovNote(); } );

// Función para iniciar la cadena de Markov
inline function startMarkovMelody(){
    currentMelodyState = 0;
    currentVelocityState = 0;
    currentDurationState = 0;
    Timer.startTimer(400);		// Iniciar con una duración base
}

inline function stopMarkovMelody() { Timer.stopTimer(); } // Stop the timer

*/
/*
var notes = [60];
var notesSeq = notes.join(",");

Console.print("WAAAAAAAAAAAAAAAAA: " + notesSeq);
*/
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
 