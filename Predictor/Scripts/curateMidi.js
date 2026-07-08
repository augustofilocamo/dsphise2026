//var midiWasCurated = 0;
//const var selectTrackPanel = Content.getComponent("selectTrackPanel");
//const var numTracksLabel = Content.getComponent("numTracksLabel");


var segmentDuration = 300000; // Duración del bloque en timestamps (ajustable)

var totalSegments = 12;
var pitchCount = []; // Array para contar pitch classes por bloque
var index, event, noteNumber, pitchClass, timestamp, segmentIndex;

const var warningPanel = Content.getComponent("warningPanel");


var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var prevKey = -1;
var bestKey, maxCount, pc, s;

// Cura midi antes de cargarlo
inline function curateMidi()
{	
	////////////////////////////////////////////////////////
	// Elije el track con más notas, evitando el de batería
	////////////////////////////////////////////////////////
	
	if (midiPlayer1.getNumTracks() > 1) {
	
	    local numTracks = midiPlayer1.getNumTracks();
	    Console.print("EL midi tiene esta candidad de tracks: " + numTracks);
	    local maxEvents = 0;
	    local maxTrack = -1;
	    local repetitionThreshold = 5; // Mínimo de repeticiones consecutivas para detectar batería
	    local patternThreshold = 2;    // Mínimo de patrones repetidos para considerar el track como batería
	    local trackIndex;
	    local eventIndex;
	
	    for (trackIndex = 0; trackIndex < numTracks; trackIndex++) {
	        midiPlayer1.setTrack(trackIndex);
	        local eventList = midiPlayer1.getEventList();
	        local consecutiveRepeats = 0;
	        local lastNote = -1;
	        local drumLikePatterns = 0;
	        local isDrumTrack = false;
	
	        for (eventIndex = 0; eventIndex < eventList.length; eventIndex++) {
	            local event = eventList[eventIndex];
	
	            if (event.isNoteOn()) { // NoteOn
	                local noteNumber = event.getNoteNumber();
	
	                if (noteNumber == lastNote) {
	                    consecutiveRepeats++;
	                } else {
	                    if (consecutiveRepeats >= repetitionThreshold) {
	                        drumLikePatterns++;
	                    }
	                    consecutiveRepeats = 1;
	                }
	                lastNote = noteNumber;
	            }
	        }
	
	        // Si el track tiene patrones repetidos tipo batería, lo descartamos
	        if (drumLikePatterns >= patternThreshold) {
	            Console.print("Track " + trackIndex + " descartado (parece batería).");
	            continue;
	        }
	
	        // Elegir el track con más eventos, excluyendo los de batería
	        if (eventList.length > maxEvents) {
	            maxEvents = eventList.length;
	            maxTrack = trackIndex;
	        }
	    }
	
	    if (maxTrack != -1) {
	        Console.print("Track seleccionado: " + (maxTrack) + " con " + maxEvents + " eventos.");
	        midiPlayer1.setTrack(maxTrack);
	    } else {
	        Console.print("No se encontró un track adecuado.");
	    }
	}
	
	
	
	/////////////////////////////////////
	// Corta el midi a los maxElements
	/////////////////////////////////////
	
	local maxElements = 500;
	// Obtener lista de eventos de midiPlayer1
	preMidiList = midiPlayer1.getEventList();
	
	// Limpiar midiList antes de llenarlo
	midiList.clear();

	// Asegurar que midiList tenga hasta maxElements
	if (preMidiList.length > maxElements) {
		// Si hay más de 100 eventos, solo tomamos los primeros 100
		for (i = 0; i < maxElements; i++) {
			midiList.push(preMidiList[i]);
		}
	} else {
		// Si hay menos de 100, copiamos todos 
		midiList = preMidiList;

	}
	
	
	checkChromaticNotes(midiList);    
	
	////////////////////////////////////////////////////
	// Cura velocidades de midis que tiene todo al palo
	///////////////////////////////////////////////////
	
	// Declarar variables necesarias
	local totalVelocity = 0;
	local noteOnCount = 0;
	local index = 0;
	local event;
	
	
	
	// Primer recorrido: calcular promedio de velocity para eventos NoteOn
	for (index = 0; index < midiList.length; index++)
	{
	    event = midiList[index];
	    
	    if (event.isNoteOn())
	    {
	        totalVelocity += event.getVelocity();
	        noteOnCount += 1;
	    }
	}
	
	if(midiList.length < markovOrder) 
	{
		Console.print("Eventos Midi menores al orden Markov: " + midiList.length);
		return;
	} 
	
	// Verificar si hay al menos un NoteOn
	if (noteOnCount > 0)
	{
	    local averageVelocity = totalVelocity / noteOnCount;
	    //Console.print("Average Velocity: " + averageVelocity);
	    
	    if (averageVelocity >= 80)
	    {
	        // Segundo recorrido: aplicar el script original
	        for (index = 0; index < midiList.length; index++)
	        {
	            event = midiList[index];
	            
	            if (event.isNoteOn())
	            {
	                local originalVelocity = event.getVelocity();
	                local newVelocity = originalVelocity; // valor por defecto
	                
	                if (originalVelocity >= 40 && originalVelocity <= 110)
	                {
	                    newVelocity = Math.floor(originalVelocity * Math.randInt(3, 7) / 10);
	                }
	                else if (originalVelocity > 110 && originalVelocity <= 127)
	                {
	                    newVelocity = Math.floor(originalVelocity * Math.randInt(3, 6) / 10);
	                }
	                
	                event.setVelocity(newVelocity);
	                //Console.print("Original Velocity: " + originalVelocity + " → New Velocity: " + newVelocity);
	            }
	        }
	    }
	    else
	    {
	        Console.print("Promedio de velocity menor a 100, no se aplica modificación.");
	    }
	}
	else
	{
	    Console.print("No hay eventos NoteOn para evaluar.");
	    
	}
		
}



inline function checkChromaticNotes(eventList) {
	    local chromaticCount = 0;
	    local totalNotes = 0;
	    local lastNote = -1;
	
	    for (eventIndex = 0; eventIndex < eventList.length; eventIndex++) {
	        local event = eventList[eventIndex];
	
	        if (event.isNoteOn()) { // NoteOn
	            local noteNumber = event.getNoteNumber();
	            totalNotes++;
	            if (lastNote != -1 && Math.abs(noteNumber - lastNote) == 1) {
	                chromaticCount++;
	            }
	            lastNote = noteNumber;
	        }
	    }
	
	    if (totalNotes > 0) {
	        local chromaticPercentage = (chromaticCount / totalNotes) * 100;
	        if (chromaticPercentage > 35) {
	            Console.print("Warning: El track tiene más del 10% de notas cromáticas.");
	            warningPanel.showControl(true);
	    		MIDIPlayer1.setFile("{PROJECT_FOLDER}Modal/Ionian/Ionian_Template_C_8.mid", 1, 1); // Carga el midifile
	    		clearMatrix();
				curateMidi(); // Cura el midi arrastrado
	    			    
				readMidiFile(); // lee midi nuevo
	       
	        }
	    }
	}
	
	
	inline function onwarningButtonControl(component, value)
	{
		warningPanel.showControl(false);
	};
	
	Content.getComponent("warningButton").setControlCallback(onwarningButtonControl);
	



