
/********************* FUNCIONES NOTE ON *********************/
//var noteArray = [];
inline function checkNoteOnDuplicates(noteOnGenerated, eventOnId)
{
	local noteArrayLength = noteArray.length;
			
	// Si encuentra un duplicado en el array de notas generadas
	for (i = 0; i < noteArrayLength; i++)
	{
		if (noteArray[i].noteGenerated == noteOnGenerated)
		{
			Synth.noteOffByEventId(noteArray[i].eventId);	// Cortá la nota
			noteArray.removeElement(noteOnGenerated);		// borrá el item 	
		}
	}
}

inline function addNoteAndEventToArray(noteNumberGenerated, eventOnId)
{
	checkNoteOnDuplicates(noteNumberGenerated, eventOnId);
	
	// Agregar item a la formación con la nota presionada y la generada
	noteArray.push({noteGenerated: noteNumberGenerated, eventId: eventOnId});
	
	Console.print("---- NOTE ON ----
		Note Stored: " + noteNumberGenerated + "
		Event ID: " + eventOnId);
	
	return noteNumberGenerated;
}

inline function sendMidiOnOutAndIgnoreEvent(velocityModified, noteModified)
{
	Message.setVelocity(velocityModified);
	Message.setNoteNumber(noteModified);
	// Primero se manda el midi, luego se ignora el evento
	Message.sendToMidiOut();
	Message.ignoreEvent(true);	
}

/********************* FUNCIONES NOTE OFF *********************/
inline function getNoteGenerated(eventIdEvaluated)
{
	local noteArrayLength = noteArray.length;
	
    for (i = 0; i < noteArrayLength; i++)
    {
        if (noteArray[i].eventId == eventIdEvaluated)
        {
	        return noteArray[i].noteGenerated;	// Devolver nota seleccionada
        }
    }
}

inline function isEqualThan(item, eventIdToEvaluate) 
{
	Console.print ("!eventIdToEvaluate: " + eventIdToEvaluate);
	Console.print ("!item.eventId: " + item.eventId);
	
    return item.eventId == eventIdToEvaluate;
}

inline function findIndexInArray(eventId) 
{
    local index = noteArray.findIndex(item => isEqualThan(item, eventId)); // reemplazar la funcion -> (item => item.eventId == eventIdToEvaluate)
   	Console.print("Index of first element: " + index);
   	return index;
}

inline function sendMidiOff(noteOffGenerated, eventId)
{	
	Console.print("---- NOTE OFF ----
					Note Released: " + noteOffGenerated + "
					Event ID: " + eventId);
	
	
	Synth.noteOffByEventId(eventId);				// NoteOff referida al evento ID
	Message.setNoteNumber(noteOffGenerated);		// Asignar la nota generada al midi out
   	Message.sendToMidiOut();						// Mandar el midi
   	//Message.ignoreEvent(true);						// Si se descomenta NO CORTA EL NOTE ON DEL SINTE
}

inline function checkIfKeysAreDown()	// SE PUEDE BORRAR. Para Debuggear
{
	if (!Synth.getNumPressedKeys())		// Si no hay notas tocando, apagar todas las notas y limpiá el Array
	{
	  	Engine.allNotesOff();
		noteArray.clear();
	}
}