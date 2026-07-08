Content.makeFrontInterface(600, 600);

include("MarkovExample_ToDelete.js");

// Variables globales para el tiempo y la nota actual
const var Timer = Engine.createTimerObject();
const var envelope = Synth.getModulator("AHDSR Envelope1")
const var noteCounts = {}; // Stores the counts of notes
const var transitionMatrix = {}; // Como asignar probabilidades a las notas?
const var markovOrder = 2;
const var prevNotes = [];
const var probabilities = {};

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
        //else {Console.print( "Note Count " + noteCounts[note]); }
        Console.print( "Note Count for " + note + ": " + noteCounts[note]);
        noteCounts[note]++;
        
        /* Update transition counts */
        // Si la cantidad de notas equivale al orden de markov
        if (prevNotes.length == markovOrder) {
	        // Junta las dos notas en un par
            var prevNoteSequence = prevNotes.join(',');		
            
            //Console.print(prevNoteSequence);
            
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
        while (prevNotes.length > markovOrder) { prevNotes.removeElement(0); }
        
    }
    // Debug para chequear el noteOff
    //if(event.isNoteOff()){Console.print ("Note Off: " + note);}
}

// Función para convertir la cuenta de transiciones
// en probabilidades


for (prevNoteSequence in transitionMatrix){
	var totalCount = 0;
	
	/* calcular todas las posibilidades de transicion para la secuencia */
	// VER "endNote" es lo mismo que "note" en la función de arriba?
	// Para cada nota de la secuencia en la matriz
	for (endNote in transitionMatrix[prevNoteSequence]){ 
		// sumar el total de n° de posibilidades
		totalCount += transitionMatrix[prevNoteSequence][endNote];
	}
	
	// Declaro objeto con las secuencias de notas del orden de Markov
	probabilities[prevNoteSequence] = {};
	
	/* Calcular las probabilidades */
	// Para cada transición en la matriz
	for (endNote in transitionMatrix[prevNoteSequence]){
		// Calcular su probabilidad
		probabilities[prevNoteSequence][endNote] = transitionMatrix[prevNoteSequence][endNote] / totalCount;
	}
}


/* Chequear que esté todo bien */

// Para cada secuencia en la matrix de probabilidades (Eje Y)
for (prevNoteSequence in probabilities) {
    Console.print("From notes " + prevNoteSequence + ":");
    // Para cada nota de cada secuencia (Eje X)
    for (endNote in probabilities[prevNoteSequence]) {
	    // Mostrá la probabilidad    
        Console.print("  To note " + endNote + ": " + probabilities[prevNoteSequence][endNote]);
    }
}

/* ------------------------ */


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
 