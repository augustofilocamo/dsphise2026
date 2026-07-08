Content.makeFrontInterface(600, 600);

include("MarkovExample_ToDelete.js");

// Variables globales para el tiempo y la nota actual
const var Timer = Engine.createTimerObject();
const var envelope = Synth.getModulator("AHDSR Envelope1")


/********** MIDI **********/
// fetch a typed reference
const var midiPlayer1 = Synth.getMidiPlayer("MIDI Player1");	// Tomar el reproductor midi

// 1. get a list
const var midiList = midiPlayer1.getEventList();	// Recibir la list de eventos
const var noteAmount = [];							// Array

// Como asignar probabilidades a las notas?
const var transitionMatrix = {};

// 2. Perform operations  
for(event in midiList)
{
    if(event.isNoteOn())
    	var note = noteAmount.push(event.getNoteNumber());
        //Console.print(event.getNoteNumber());
        //event.setVelocity(36);
        //event.setNoteNumber(60);
}

function shuffleArray(arr) { 
	var last_index = arr.length - 1; // Lenght of the array
	// Algoritmo Fisher-Yates
	while (last_index > 0){								// Mientras que el índice sea mayor a cero
		var rand_index = Math.randInt(0, last_index);	// selecciona un valor random (0 - indice)
		// Intercambiar valores entre los indices
		var temp = arr[last_index];						// variable temporal con valor ultimo indice
		arr[last_index] = arr[rand_index];				// intercambiar ultimo indice con indice random
		arr[rand_index] = temp;							// indice random = al valor temporal
		last_index -= 1;
		return arr;
	}
}

const var noteNumberScrumbled = shuffleArray(noteAmount); 
Console.print(noteNumberScrumbled.join(", ")); // Outputs the scrambled array

// Lector de notas en Cadena de Matriz de transiciones

/*
var noteCounts = {}; // Stores the counts of notes
var transitionMatrix = {}; // Stores the counts of transitions

// Parse MIDI events
for (event in midiList) {
    if (event.isNoteOn()) {
        var note = event.getNoteNumber();
        Console.print(note);

        // Update note counts
        if (noteCounts[note] == undefined) {
            noteCounts[note] = 0;
        }
        noteCounts[note]++;
        
        // Update transition counts
        if (prevNote != undefined) {
            if (transitionMatrix[prevNote] == undefined) {
                transitionMatrix[prevNote] = {};
            }
            if (transitionMatrix[prevNote][note] == undefined) {
                transitionMatrix[prevNote][note] = 0;
            }
            transitionMatrix[prevNote][note]++;
        }
        
        var prevNote = note;
    }
}


var probabilities = {};

// Convert transition counts to probabilities
for (var startNote in transitionMatrix) {
    var totalCount = 0;
    
    // Calculate the total number of transitions from this note
    for (var endNote in transitionMatrix[startNote]) {
        totalCount += transitionMatrix[startNote][endNote];
    }
    
    // Calculate probabilities
    probabilities[startNote] = {};
    for (var endNote in transitionMatrix[startNote]) {
        probabilities[startNote][endNote] = transitionMatrix[startNote][endNote] / totalCount;
    }
}

// Print probabilities for debugging
for (var startNote in probabilities) {
    Console.print("From note " + startNote + ":");
    for (var endNote in probabilities[startNote]) {
        Console.print("  To note " + endNote + ": " + probabilities[startNote][endNote]);
    }
}


*/



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
 