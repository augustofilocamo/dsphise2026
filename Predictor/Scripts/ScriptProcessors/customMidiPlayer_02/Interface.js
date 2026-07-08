Content.makeFrontInterface(200, 200);

var originalBpm = 120; // este es el BPM con el que fue generado el MIDI




inline function onKnob1Control(component, value)
{
	Engine.setHostBpm(value);
};

Content.getComponent("Knob1").setControlCallback(onKnob1Control);


const var midiList = [
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 60, Value: 96, EventId: 0, Timestamp: 0, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 60, Value: 0, EventId: 0, Timestamp: 21176, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 64, Value: 96, EventId: 1, Timestamp: 21176, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 64, Value: 0, EventId: 1, Timestamp: 42352, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 62, Value: 96, EventId: 2, Timestamp: 42352, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 62, Value: 0, EventId: 2, Timestamp: 63529, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 64, Value: 96, EventId: 3, Timestamp: 63529, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 64, Value: 0, EventId: 3, Timestamp: 84705, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 60, Value: 96, EventId: 4, Timestamp: 84705, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 60, Value: 0, EventId: 4, Timestamp: 105882, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 62, Value: 96, EventId: 5, Timestamp: 105882, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 62, Value: 0, EventId: 5, Timestamp: 127058, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 65, Value: 96, EventId: 6, Timestamp: 127058, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 65, Value: 0, EventId: 6, Timestamp: 148235, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 64, Value: 96, EventId: 7, Timestamp: 148235, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 64, Value: 0, EventId: 7, Timestamp: 169411, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 60, Value: 96, EventId: 8, Timestamp: 169411, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 60, Value: 0, EventId: 8, Timestamp: 190588, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 62, Value: 96, EventId: 9, Timestamp: 190588, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 62, Value: 0, EventId: 9, Timestamp: 211764, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 64, Value: 96, EventId: 10, Timestamp: 211764, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 64, Value: 0, EventId: 10, Timestamp: 232941, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 65, Value: 96, EventId: 11, Timestamp: 232941, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 65, Value: 0, EventId: 11, Timestamp: 254117, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 60, Value: 96, EventId: 12, Timestamp: 254117, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 60, Value: 0, EventId: 12, Timestamp: 275294, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 64, Value: 96, EventId: 13, Timestamp: 275294, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 64, Value: 0, EventId: 13, Timestamp: 296470, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 65, Value: 96, EventId: 14, Timestamp: 296470, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 65, Value: 0, EventId: 14, Timestamp: 317647, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 67, Value: 96, EventId: 15, Timestamp: 317647, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 67, Value: 0, EventId: 15, Timestamp: 338801, "
];




// Declaración anticipada
var i, str, type, pitch, velocity, timestamp;
var parts, numberStr, valueStr, timeStr;
var parsedEvents = [];
var currentIndex = 0;
var startTime = 0;
var now, e;
var sampleRate = Engine.getSampleRate();
var hostBpm = Engine.getHostBpm();

// Parseo: guardar rawTime en samples
for (i = 0; i < midiList.length; i++) {
    str = midiList[i];
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
    timestamp = parseInt(timeStr); // en samples

    parsedEvents.push({
        type: type,
        note: pitch,
        velocity: velocity,
        rawTime: timestamp, // en samples
        time: 0 // se calculará dinámicamente
    });
}

// Función para actualizar tiempos con nuevo BPM
inline function updateEventTimes()
{
    sampleRate = Engine.getSampleRate();
    for (i = 0; i < parsedEvents.length; i++) {
        parsedEvents[i].time = (parsedEvents[i].rawTime / sampleRate) * 1000 * (originalBpm / hostBpm);
    }
}

// Timer principal de reproducción
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

    if (currentIndex >= parsedEvents.length)
        playbackTimer.stopTimer();
});

// Timer para detectar cambio de BPM
const var tempoMonitor = Engine.createTimerObject();
var lastBpm = hostBpm;

tempoMonitor.setTimerCallback(function() {
    hostBpm = Engine.getHostBpm();

    if (hostBpm != lastBpm) {
        lastBpm = hostBpm;
        updateEventTimes(); // recalcular tiempos
    }
});

tempoMonitor.startTimer(50); // chequea cada 500ms

// Botón y callback
const var playButton = Content.addButton("PlayButton", 0, 0);
playButton.set("text", "Play");

inline function onPlayButtonControl(component, value)
{
    if (value)
    {
        updateEventTimes(); // asegurar que el tempo esté actualizado
        currentIndex = 0;
        startTime = Engine.getUptime() * 1000;
        playbackTimer.startTimer(30);
    } else {
	    playbackTimer.stopTimer();
	    Engine.allNotesOff();
    }
    
};

playButton.setControlCallback(onPlayButtonControl);


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
 