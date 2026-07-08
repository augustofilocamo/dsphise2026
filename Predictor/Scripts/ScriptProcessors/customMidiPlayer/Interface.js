Content.makeFrontInterface(200, 200);
const var patternMidiList = [
  "MessageHolder: Type: Controller, Channel: 1, Number: 7, Value: 100, EventId: 0, Timestamp: 0, ",
  "MessageHolder: Type: Controller, Channel: 1, Number: 10, Value: 64, EventId: 0, Timestamp: 0, ",
  "MessageHolder: Type: Controller, Channel: 1, Number: 91, Value: 127, EventId: 0, Timestamp: 0, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 81, Value: 56, EventId: 0, Timestamp: 42352, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 69, Value: 45, EventId: 1, Timestamp: 42352, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 81, Value: 0, EventId: 0, Timestamp: 63529, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 69, Value: 0, EventId: 1, Timestamp: 63529, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 70, Value: 48, EventId: 2, Timestamp: 63529, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 82, Value: 59, EventId: 3, Timestamp: 63529, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 70, Value: 0, EventId: 2, Timestamp: 84705, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 82, Value: 0, EventId: 3, Timestamp: 84705, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 76, Value: 51, EventId: 4, Timestamp: 84705, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 88, Value: 63, EventId: 5, Timestamp: 84705, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 76, Value: 0, EventId: 4, Timestamp: 105882, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 88, Value: 0, EventId: 5, Timestamp: 105882, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 79, Value: 54, EventId: 6, Timestamp: 105882, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 91, Value: 67, EventId: 7, Timestamp: 105882, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 79, Value: 0, EventId: 6, Timestamp: 127058, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 91, Value: 0, EventId: 7, Timestamp: 127058, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 91, Value: 69, EventId: 8, Timestamp: 127058, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 79, Value: 56, EventId: 9, Timestamp: 127058, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 91, Value: 0, EventId: 8, Timestamp: 169411, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 79, Value: 0, EventId: 9, Timestamp: 169411, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 68, Value: 51, EventId: 10, Timestamp: 169411, ",
  "MessageHolder: Type: NoteOn, Channel: 1, Number: 80, Value: 63, EventId: 11, Timestamp: 169411, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 68, Value: 0, EventId: 10, Timestamp: 190588, ",
  "MessageHolder: Type: NoteOff, Channel: 1, Number: 80, Value: 0, EventId: 11, Timestamp: 190588, ",
];

// Declaración anticipada de variables
var i, str, type, pitch, velocity, timestamp;
var parts, note, valueStr, numberStr, timeStr;
var parsedEvents = [];
var currentIndex = 0;
var startTime = 0;
var now;
var e;
var sampleRate = Engine.getSampleRate();

for (i = 0; i < patternMidiList.length; i++) {
    str = patternMidiList[i];
    parts = str.split(",");

    type = (parts[0].indexOf("NoteOn") != -1) ? "on" : "off";

    numberStr = parts[2]; // " Number: 60"
    valueStr = parts[3];  // " Value: 96"
    timeStr = parts[5];   // " Timestamp: 21176"

    numberStr = numberStr.replace("Number:", "");
    valueStr = valueStr.replace("Value:", "");
    timeStr = timeStr.replace("Timestamp:", "");

    pitch = parseInt(numberStr);
    velocity = parseInt(valueStr);
    timestamp = parseInt(timeStr);

    // Corrección de escala: de muestras a milisegundos
    timestamp = (timestamp / sampleRate) * 1000;

    parsedEvents.push({
        type: type,
        note: pitch,
        velocity: velocity,
        time: timestamp
    });
}

// Timer
const var playbackTimer = Engine.createTimerObject();

playbackTimer.setTimerCallback(function() {
    now = Engine.getUptime() * 1000 - startTime;

    while (currentIndex < parsedEvents.length && parsedEvents[currentIndex].time <= now) {
        e = parsedEvents[currentIndex];

        if (e.type == "on"){
			Synth.playNoteFromUI(1, e.note, e.velocity);
			Console.print("noteOn: " + e.note);	        
        } else{
            Synth.noteOffFromUI(1, e.note);
            }

        currentIndex += 1;
    }

    if (currentIndex >= parsedEvents.length)
        playbackTimer.stopTimer();
});

// Botón y callback
const var patternplayButton = Content.addButton("patternPlayButton", 0, 0);
patternplayButton.set("text", "Play");

inline function onpatternPlayButtonControl(component, value)
{
    if (value)
    {
        currentIndex = 0;
        startTime = Engine.getUptime() * 1000;
        playbackTimer.startTimer(50);
    } else {
	    playbackTimer.stopTimer();
	    Engine.allNotesOff();
    }
};

patternplayButton.setControlCallback(onpatternPlayButtonControl);

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
 