var originalBpm = 150; // este es el BPM con el que fue generado el MIDI

const var patternMidiList = [];

// ■ PARSEO A EVENTOS INTERNOS
var i, j, str, type, pitch, velocity, timestamp;
var parts, numberStr, valueStr, timeStr;
var parsedEvents = [];
var currentIndex = 0;
var startTime = 0;
var now, e;
var sampleRate = Engine.getSampleRate();
var hostBpm = Engine.getHostBpm();



// GENERACION DE MIIDILIST

const var numBars = 8;
var tick = Engine.getSamplesForQuarterBeats(1) / 32; // Samples por semifusa
Console.print("Tick en samples: " + tick);

const var duracionGraves = 128; // 32 = negra, 64 = blancas
var duracionNotasGravesSamples = duracionGraves * tick;


const var duracionAgudas = 16; // 32 = negra
var duracionNotasAgudasSamples = duracionGraves * tick;


var eventIdCounter = 0;
var totalBars = 8;

// Recolectar eventos por separado y luego ordenar
var eventList = [];
var barCount;

var randDurations = [12, 16, 18];



// Parametros nota

// Notas
for (i = 0; i < (totalBars * tick); i++) {
    var currentTimestamp = i * tick;
    

	// 3 notas graves
    if (i % duracionGraves == 0) {
        eventList.push("MessageHolder: Type: NoteOn, Channel: 1, Number: 55, Value: 80, EventId: " + eventIdCounter + ", Timestamp: " + (currentTimestamp + 40) + ", ");
        eventList.push("MessageHolder: Type: NoteOn, Channel: 1, Number: 56, Value: 80, EventId: " + eventIdCounter + ", Timestamp: " + (currentTimestamp + 40) + ", ");
        eventList.push("MessageHolder: Type: NoteOn, Channel: 1, Number: 57, Value: 80, EventId: " + eventIdCounter + ", Timestamp: " + (currentTimestamp + 40) + ", ");
        eventList.push("MessageHolder: Type: NoteOff, Channel: 1, Number: 55, Value: 64, EventId: " + eventIdCounter + ", Timestamp: " + (currentTimestamp + duracionNotasGravesSamples) + ", ");
        eventList.push("MessageHolder: Type: NoteOff, Channel: 1, Number: 56, Value: 64, EventId: " + eventIdCounter + ", Timestamp: " + (currentTimestamp + duracionNotasGravesSamples) + ", ");
        eventList.push("MessageHolder: Type: NoteOff, Channel: 1, Number: 57, Value: 64, EventId: " + eventIdCounter + ", Timestamp: " + (currentTimestamp + duracionNotasGravesSamples) + ", ");
    }
    
    // 1 nota aguda

	    if (i % duracionAgudas == 0) {
	    		    
	    		eventList.push("MessageHolder: Type: NoteOn, Channel: 1, Number: 99, Value: 80, EventId: " + eventIdCounter + ", Timestamp: " + currentTimestamp + ", ");
	    		eventList.push("MessageHolder: Type: NoteOff, Channel: 1, Number: 99, Value: 64, EventId: " + eventIdCounter + ", Timestamp: " + (currentTimestamp + duracionNotasAgudasSamples) + ", ");
	    
	    }


    
    
	eventIdCounter += 1;    
}


// Ordenar eventos por Timestamp antes de parsear
patternMidiList.clear();

// Convertir eventList a objetos temporales para ordenar
var tempList = [];
for (i = 0; i < eventList.length; i++) {
    str = eventList[i];
    parts = str.split(",");
    timeStr = parts[5];
    timeStr = timeStr.replace("Timestamp:", "");
    timestamp = parseFloat(timeStr);
    tempList.push({ str: str, ts: timestamp });
}

tempList.sort(function(a, b) { return a.ts - b.ts; });

// Volver a llenar patternMidiList ordenado
for (i = 0; i < tempList.length; i++) {
    patternMidiList.push(tempList[i].str);
}

// ■ PARSEO DE EVENTOS
for (i = 0; i < patternMidiList.length; i++) {
    str = patternMidiList[i];
    parts = str.split(",");

    type = (parts[0].indexOf("NoteOn") != -1) ? "on" : "off";

    numberStr = parts[2];
    valueStr = parts[3];
    timeStr = parts[5];

    numberStr = numberStr.replace("Number:", "");
    valueStr = valueStr.replace("Value:", "");
    timeStr = timeStr.replace("Timestamp:", "");

    pitch = parseInt(numberStr);
    velocity = parseInt(valueStr);
    timestamp = parseFloat(timeStr);

    parsedEvents.push({
        type: type,
        note: pitch,
        velocity: velocity,
        rawTime: timestamp,
        time: 0
    });
}



// REPRODUCTOR DE MIDILIST

// ACTUALIZAR TIEMPOS SEGUN BPM
var patternDurationInMs = 0;

inline function updateEventTimes()
{
    local currentSampleRate = Engine.getSampleRate();
    for (i = 0; i < parsedEvents.length; i++) {
        parsedEvents[i].time = (parsedEvents[i].rawTime / currentSampleRate) * 1000 * (originalBpm / hostBpm);
    }

    patternDurationInMs = parsedEvents[parsedEvents.length - 1].time;
}

// TIMER DE REPRODUCCION
const var playbackTimer = Engine.createTimerObject();

playbackTimer.setTimerCallback(function() {
    now = Engine.getUptime() * 1000 - startTime;

    while (currentIndex < parsedEvents.length && parsedEvents[currentIndex].time <= now) {
        e = parsedEvents[currentIndex];

        if (e.type == "on")
            Synth.playNoteFromUI(1, e.note, e.velocity);
        else
            Synth.noteOffFromUI(1, e.note);

        currentIndex += 1;
    }

    if (now >= patternDurationInMs) {
        currentIndex = 0;
        startTime = Engine.getUptime() * 1000;
        //startTime = Engine.getUptime() * 1000 - (60000 / hostBpm);
        //startTime = Engine.getSamplesForQuarterBeats(1) * 1000;
        
    }
});

// MONITOREO DE BPM DEL HOST
const var tempoMonitor = Engine.createTimerObject();
var lastBpm = hostBpm;

tempoMonitor.setTimerCallback(function() {
    hostBpm = Engine.getHostBpm();

    if (hostBpm != lastBpm) {
        lastBpm = hostBpm;
        updateEventTimes();
    }
});

tempoMonitor.startTimer(50);

// BOTON DE PLAY
//const var patternPlayButton = Content.getComponent("patternPlayButton");
patternPlayButton.set("text", "Play");

inline function onpatternPlayButtonControl(component, value)
{
    if (value)
    {
        updateEventTimes();
        currentIndex = 0;
        startTime = Engine.getUptime() * 1000;
        playbackTimer.startTimer(30);
    }
    else
    {
        playbackTimer.stopTimer();
        Engine.allNotesOff();
    }
};

patternPlayButton.setControlCallback(onpatternPlayButtonControl);
