Content.makeFrontInterface(1024, 680);

//include("ledCounter.js");

const var vco1_eg_amount = Content.getComponent("vco1_eg_amount");
const var vco2_eg_amount = Content.getComponent("vco2_eg_amount");
const var fm_amount = Content.getComponent("fm_amount");
const var hard_sync = Content.getComponent("hard_sync");
const var vco1_freq = Content.getComponent("vco1_freq");
const var vco2_freq = Content.getComponent("vco2_freq");
const var vco1_waveform = Content.getComponent("vco1_waveform");
const var vco2_waveform = Content.getComponent("vco2_waveform");
const var vco1_level = Content.getComponent("vco1_level");
const var vco2_level = Content.getComponent("vco2_level");
const var noise_level = Content.getComponent("noise_level");
const var nosie_decay = Content.getComponent("nosie_decay");
const var vca_decay = Content.getComponent("vca_decay");
const var TempoKnob = Content.getComponent("TempoKnob");
const var ledKnob = Content.getComponent("ledKnob");

const var buttonsArray = [];

// Use a for loop to store all button references in the 'buttons' array
for (i = 1; i <= 28; i++)
{
    var buttonName = "Button" + i;
    buttonsArray .push(Content.getComponent(buttonName));
    Console.print(buttonName);
}

Console.print(buttonsArray[0]);

// Set initial values
const var quarterBeats = 1; // 1 quarter beat
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
    
	if (currentLabelValue == 1)
	{
	    TimerId.stopTimer(); // Stop the current timer
	    TimerId.startTimer(interval); // Restart the timer with the updated interval
	    Console.print("restart on step 1");
	}    
}

// Create a timer object
const var TimerId = Engine.createTimerObject();

TimerId.setTimerCallback(function()
{
    updateCounter();

    // Adjust the timer interval dynamically based on the current BPM
    interval =  Engine.getMilliSecondsForQuarterBeatsWithTempo(quarterBeats, bpm);

    // Restart the timer for the next tick without stopping it
    TimerId.startTimer(interval-1);
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
    updateTempoOnTheFly(value*2); // Update the tempo dynamically
	Engine.setHostBpm(value);
}

Content.getComponent("TempoKnob").setControlCallback(onTempoKnobControl);function onNoteOn()
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
 