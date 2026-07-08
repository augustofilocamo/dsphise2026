Content.makeFrontInterface(600, 400);

const var TempoKnob = Content.getComponent("TempoKnob");
const var ledKnob = Content.getComponent("ledKnob");

// Set initial values
const var quarterBeats = 1.0; // 1 quarter beat
const var numSteps = 8;
var currentLabelValue = 1;
var bpm = TempoKnob.getValue(); // Tempo in BPM

// Calculate the interval in milliseconds for each quarter beat
var interval = Engine.getMilliSecondsForQuarterBeatsWithTempo(quarterBeats, bpm);

// Function to update the counter
inline function updateCounter()
{
    // Set the ledKnob value to the current label value (1 to 8)
    ledKnob.setValue(currentLabelValue);

    // Increment the label value and reset to 1 after reaching 8
    currentLabelValue = (currentLabelValue % numSteps) + 1;
}

// Create a timer object
const var TimerId = Engine.createTimerObject();

TimerId.setTimerCallback(function()
{
    updateCounter();

    // Adjust the timer interval dynamically based on the current BPM
    interval = Engine.getMilliSecondsForQuarterBeatsWithTempo(quarterBeats, bpm);

    // Restart the timer for the next tick without stopping it
    TimerId.startTimer(interval);
});

// Start the timer with the initial interval
//TimerId.startTimer(interval);

// Function to update the interval without resetting the counter
inline function updateTempoOnTheFly(value)
{
    bpm = value; // Update the bpm value
    interval = Engine.getMilliSecondsForQuarterBeatsWithTempo(quarterBeats, bpm); // Update the interval based on the new tempo

    // No need to stop the timer, just change the BPM, the next cycle will adjust automatically
}

// Callback for the TempoKnob
inline function onTempoKnobControl(component, value)
{
    updateTempoOnTheFly(value); // Update the tempo dynamically
	Engine.setHostBpm(value);
}

Content.getComponent("TempoKnob").setControlCallback(onTempoKnobControl);
function onNoteOn()
{
	TimerId.startTimer(interval); // Start the timer with the defined interval
	currentLabelValue = 2;
	ledKnob.setValue(1);
	
}
 function onNoteOff()
{
	TimerId.stopTimer(); 
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
 