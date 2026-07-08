Content.makeFrontInterface(600, 400);

const var TempoKnob = Content.getComponent("TempoKnob");
const var ledKnob = Content.getComponent("ledKnob");


// Set initial values
const var bpm = TempoKnob.getValue(); // Tempo en BPM
const var quarterBeats = 1.0; // 1 quarter beat
const var numSteps = 8;
var currentLabelValue = 1;


inline function onTempoKnobControl(component, value)
{
	Engine.setHostBpm(value);

};

Content.getComponent("TempoKnob").setControlCallback(onTempoKnobControl);



// Calculate the interval in milliseconds for each quarter beat
var interval = Engine.getMilliSecondsForQuarterBeatsWithTempo(quarterBeats, bpm);

// Function to update the label
inline function updateCounter()
{
    // Change the label text from 1 to 8

    ledKnob.setValue(currentLabelValue);

    // Increment the label value and reset to 1 after reaching 8
    currentLabelValue = (currentLabelValue % numSteps) + 1;
    
	// If the current value is 1, restart the timer
	if (currentLabelValue == 1)
	{
	    TimerId.stopTimer(); // Stop the current timer
	    TimerId.startTimer(interval); // Restart the timer with the updated interval
	}    

}


const var TimerId = Engine.createTimerObject(); // Create a timer object

TimerId.setTimerCallback(function()
{
    updateCounter();
});

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
 