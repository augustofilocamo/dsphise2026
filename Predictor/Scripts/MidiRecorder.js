////////////// Recording midi

const var Record = Content.getComponent("Record");
const var Play = Content.getComponent("Play");
const var Clear = Content.getComponent("Clear");

// Get a reference to the MIDI player.
const MIDIPlayer2 = Synth.getMidiPlayer("MIDI Player2");

// Formación para recibir la lista de eventos del clip midi. 
var midiList = [];	
var preMidiList = [];
global noteMelodyPairs = [];

function addToDict(noteMelodyPairs, realNote, genNote) 
{
    // Agrega un objeto con los dos valores al array
    noteMelodyPairs.push({ realNote: realNote, genNote: genNote });
}

const var metronomeButton = Content.getComponent("metronomeButton");


// On record

inline function onRecordControl(component, value)
{
	component.set("text", value ? "Stop Recording" : "Record");
	
	setRecordingAnimation(value ? 1 : 0);
	
	// Limpia el array de melodypairs
	noteMelodyPairs.clear();
	
	// Deshabilita boton play
	Content.setPropertiesFromJSON("Play", {"enabled": value-1});

	if (value)
	{
		MIDIPlayer2.clearAllSequences();

		if (metronomeButton.getValue() == 0)
		{
			Synth.playNoteFromUI(2, 67, 100);
		}
						
		timeStart = Engine.getUptime();

		Play.setValue(false);
		Play.changed();	
	} 
	else	 
	{
		setMidiPlayer();
		Synth.noteOffFromUI(2, 67); // Metronomo off
		Arpeggiator1.setAttribute(1, 1); // Metronomo off
	}	
};

Record.setControlCallback(onRecordControl);


// On Clear
inline function onClearControl(component, value)
{
	MIDIPlayer2.clearAllSequences();
}

Clear.setControlCallback(onClearControl);


inline function onPlayControl(component, value)
{
	component.set("text", value ? "Stop" : "Play");
	value ? MIDIPlayer2.play(0) : MIDIPlayer2.stop(0);
}

// On Play
Play.setControlCallback(onPlayControl);


reg timeStart = 0;
reg recording = [];





inline function addNoteOn(list, channel, notenumber, velocity, noteOnTime)
{
    local m = Engine.createMessageHolder();
    m.setType(m.NoteOn);
    m.setNoteNumber(notenumber);
    m.setVelocity(velocity);
    m.setChannel(channel);
    m.setTimestamp(Engine.getSamplesForMilliSeconds(noteOnTime * 1000));
    
    Console.print("NoteOn add at : " + Engine.getSamplesForMilliSeconds(noteOnTime * 1000));
    
    
    list.push(m);
}

inline function addNoteOff(list, channel, notenumber, noteOffTime)
{
    local o = Engine.createMessageHolder();
    o.setType(o.NoteOff);
    o.setNoteNumber(notenumber);
    o.setChannel(channel);
    o.setTimestamp(Engine.getSamplesForMilliSeconds(noteOffTime * 1000));
    
    Console.print("NoteOff adde at : " + Engine.getSamplesForMilliSeconds(noteOffTime * 1000));
    
    list.push(o);
    
   	
		Console.print("o.dump: " + o.dump());
}




inline function orderMessages()
{
		
	// Asume que midiList es un array de objetos MessageHolder (ya parseados)
	
	// Paso 1: ordenar los eventos por timestamp
	recording.sort(function(a, b)
	{
	    return a.getTimestamp() - b.getTimestamp();
	});
	
	// Paso 2: limpiar eventos inconsistentes
	local cleanedMidiList = []; // nuevo arreglo de eventos curados
	local activeNotesOrder= []; // notas encendidas actualmente
	local currentIndex = 0;
	local totalEvents = recording.length;
	
	while (currentIndex < totalEvents)
	{
	    local event = recording[currentIndex];
	    local noteNumber = event.getNoteNumber();
	    
	    // NOTE ON
	    if (event.isNoteOn()) 
	    {
	        // si la nota ya está activa, ignorar (duplicado sin apagarse)
	        if (!activeNotesOrder.contains(noteNumber))
	        {
	            activeNotesOrder.push(noteNumber);
	            cleanedMidiList.push(event);
	        }
	    }
	    // NOTE OFF
	    else if (event.isNoteOff())
	    {
	        // solo agregar si hay un NoteOn previo
	        if (activeNotesOrder.contains(noteNumber))
	        {
	            activeNotesOrder.remove(noteNumber);
	            cleanedMidiList.push(event);
	        }
	    }
	    else
	    {
	        // otros tipos de mensaje se pasan tal cual
	        cleanedMidiList.push(event);
	    }
	    
	    currentIndex += 1;
	}
		
	recording = cleanedMidiList;
	
}

//orderMessages();

inline function setMidiPlayer()
{
	if (!recording.length)
		return;
	
	MIDIPlayer2.clearAllSequences();
	
	MIDIPlayer2.setFile("", true, true);
	
	local ts = 0;
	
	for (e in recording)
		if (e.isNoteOff())
			ts = e.getTimestamp();
	
	local qb = Math.ceil(Engine.getQuarterBeatsForSamples(ts));
	
	
	local numCompases = qb / 4; // Asumiendo 4/4
	
	//Console.print("Número de compases: " + Math.round(numCompases * 1.1));
	
	MIDIPlayer2.create(4, 4, Math.round(numCompases * 1.2 + 2));
	
	

	
	//MIDIPlayer2.create(4, 4, 12);
	orderMessages();
	MIDIPlayer2.flushMessageList(recording);
	for (k in recording)
		Console.print("k.dump: " + k.dump());
	//Console.print("Timestamp de setMidiPlayer: " + Engine.getUptime());
	
	recording.clear();
}

// Recording label;
const var RecordingLabel = Content.getComponent("RecordingLabel");

// Variable para controlar la visibilidad
var isVisible = true;

// Crear un Timer que alterna la visibilidad
const var recordingTimer = Engine.createTimerObject();
recordingTimer.setTimerCallback(function()
{
    isVisible = !isVisible;
    RecordingLabel.set("text", isVisible ? "Capturing ..." : "");
});

// Función para iniciar o detener la animación
function setRecordingAnimation(state)
{
    if (state)
        recordingTimer.startTimer(500); // Cada 500ms
    else
        recordingTimer.stopTimer();
        RecordingLabel.set("text", "");
}


