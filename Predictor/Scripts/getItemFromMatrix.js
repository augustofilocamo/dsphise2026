// SELECCIONAR ITEM RANDOM
inline function getRandomPrevSeq(obj, prevState, prevSeq) 
{	//prevNoteSequence  prevNotes
	// Creo una formación (array) para agrupar los valores de la secuencia
	local array = [];
	
	// por cada secuencia dentro de la matriz
	for (seq in obj) 
	{ 	// Agregá la secuencia a la formación
		array.push (seq); 
	}

	// Creo índice random tomando el largo de la formación
	local randomIndex = Math.randInt(0, array.length - 1); 
	
	// Debug - Largo array y secuencias
	Console.print ("-----------------");
	Console.print ("Cantidad opciones de secuencias en el array: " + array.length);
	
	// Por cada secuencia dentro de la matriz
	for (seq in array) 
	{ 	// mostrar las opciones de elección
		Console.print ("Posibilidad n° "+ array.indexOf(seq, 0, 0) + ": " + seq); 
	}
	
	// Asigno indice Random y su secuencia al item de la matrix
	prevState = array[randomIndex];
	
	// Debug - Indice Random y su secuencia
	Console.print ("-----------------");
	Console.print ("Seleccionada n° " + randomIndex + ": " + prevState);
	
	// Limpio el array de notas 
	prevSeq.clear();
	
	// Asigno las notas obtenidas del índice random
	prevSeq = prevState.split(",");
	
	// Devolver las notas
	return prevSeq;
}