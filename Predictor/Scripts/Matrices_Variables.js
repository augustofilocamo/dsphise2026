// Matrices
/*
* La de probabilidad es igual a la de transiciones
* pero cambia el valor final. En vez de llevar la cuenta por cada
* item, asigna la probabilidad que tiene de ir a ese valor la cadena de Markov
*/

// Notas
var noteTransMatrix = {};
var noteProbMatrix = {};
var noteCounts = {};			// Stores the counts of notes
var prevNotes = []; 			// Array de notas anteriores. Para el addNoteInPrevSeq(prevState)

// Velocidades
var veloTransMatrix = {};
var veloProbMatrix = {};
var velocityCounts = {};		// Lleva la cuenta de cada velocidad
var prevVelocities = []; 		// Array de velocidades anteriores. Para el addNoteInPrevSeq(prevState)

// Separación entre notas
var sepTransMatrix = {};
var sepProbMatrix = {};
var separationCounts = {};		// Lleva la cuenta de cada duración
var prevSeparations = []; 		// Array de duraciones anteriores. Para el addNoteInPrevSeq(prevState)
								
								/*	QUIZAS SE PUEDEN REEMPLAZAR CON UN OBJETO
								*	COMO CON LA eventDurTime
								*/
var endSepTime;					// el inicio entre un noteOn y el otro
var secPassEventSeparation;		// Para conectar el tiempo de la primera con la segunda pasada


// Duraciones de cada nota. Sería el largo de cada nota, o cuánto tiempo están presionadas
var durTransMatrix = {};
var durProbMatrix = {};
var durationCounts = {};		// Lleva la cuenta de cada duración
var prevDurations = []; 		// Array de duraciones anteriores. Para el addNoteInPrevSeq(prevState)
var eventDurTime = {};			// Para asignar la duración entre noteOn y noteOff de cada nota


// Orden de Cadena Markov
var markovOrder = 3;	// Se puede asigar a un slider. OJO, LA CANT DE NOTAS TIENE QUE SER IGUAL O MAYOR AL ORDEN


var prevPredictedNote = -1; // Nota previa usada en onNoteOn para evitar repeticiones de nota