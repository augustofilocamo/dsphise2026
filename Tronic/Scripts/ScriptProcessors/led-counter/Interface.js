Content.makeFrontInterface(1024, 680);





// Synth Knobs





// Play Knob

Content.getComponent("play1").setControlCallback(onplay1Control);


// Sequencer knobs ref

const var veloKnob1 = Content.getComponent("veloKnob1");
const var veloKnob2 = Content.getComponent("veloKnob2");
const var veloKnob3 = Content.getComponent("veloKnob3");
const var veloKnob4 = Content.getComponent("veloKnob4");
const var veloKnob5 = Content.getComponent("veloKnob5");
const var veloKnob6 = Content.getComponent("veloKnob6");
const var veloKnob7 = Content.getComponent("veloKnob7");
const var veloKnob8 = Content.getComponent("veloKnob8");

const var noteKnob1 = Content.getComponent("noteKnob1");
const var noteKnob2 = Content.getComponent("noteKnob2");
const var noteKnob3 = Content.getComponent("noteKnob3");
const var noteKnob4 = Content.getComponent("noteKnob4");
const var noteKnob5 = Content.getComponent("noteKnob5");
const var noteKnob6 = Content.getComponent("noteKnob6");
const var noteKnob7 = Content.getComponent("noteKnob7");
const var noteKnob8 = Content.getComponent("noteKnob8");

// Arps ref
const var Arpeggiator1 = Synth.getMidiProcessor("Arpeggiator1");


const var SliderPack1 = Content.getComponent("SliderPack1");
const var SliderPack3 = Content.getComponent("SliderPack3");


// Velo Sliders

inline function onveloKnob1Control(component, value)
{
	SliderPack1.setSliderAtIndex(0, value);
	SliderPack1.changed();
};

Content.getComponent("veloKnob1").setControlCallback(onveloKnob1Control);

inline function onveloKnob2Control(component, value)
{
	SliderPack1.setSliderAtIndex(1, value);
	SliderPack1.changed();
};

Content.getComponent("veloKnob2").setControlCallback(onveloKnob2Control);

inline function onveloKnob3Control(component, value)
{
	SliderPack1.setSliderAtIndex(2, value);
	SliderPack1.changed();
};

Content.getComponent("veloKnob3").setControlCallback(onveloKnob3Control);

inline function onveloKnob4Control(component, value)
{
	SliderPack1.setSliderAtIndex(3, value);
	SliderPack1.changed();
};

Content.getComponent("veloKnob3").setControlCallback(onveloKnob3Control);

inline function onveloKnob4Control(component, value)
{
	SliderPack1.setSliderAtIndex(3, value);
	SliderPack1.changed();
};

Content.getComponent("veloKnob4").setControlCallback(onveloKnob4Control);

inline function onveloKnob5Control(component, value)
{
	SliderPack1.setSliderAtIndex(4, value);
	SliderPack1.changed();
};

Content.getComponent("veloKnob5").setControlCallback(onveloKnob5Control);

inline function onveloKnob6Control(component, value)
{
	SliderPack1.setSliderAtIndex(5, value);
	SliderPack1.changed();
};

Content.getComponent("veloKnob6").setControlCallback(onveloKnob6Control);

inline function onveloKnob7Control(component, value)
{
	SliderPack1.setSliderAtIndex(6, value);
	SliderPack1.changed();
};

Content.getComponent("veloKnob7").setControlCallback(onveloKnob7Control);

inline function onveloKnob8Control(component, value)
{
	SliderPack1.setSliderAtIndex(7, value);
	SliderPack1.changed();
};

Content.getComponent("veloKnob8").setControlCallback(onveloKnob8Control);


// Note Sliders
inline function onnoteKnob1Control(component, value)
{
	SliderPack3.setSliderAtIndex(0, value);
	SliderPack3.changed();
};

Content.getComponent("noteKnob1").setControlCallback(onnoteKnob1Control);

inline function onnoteKnob2Control(component, value)
{
	SliderPack3.setSliderAtIndex(1, value);
	SliderPack3.changed();
};

Content.getComponent("noteKnob2").setControlCallback(onnoteKnob2Control);

inline function onnoteKnob3Control(component, value)
{
	SliderPack3.setSliderAtIndex(2, value);
	SliderPack3.changed();
};

Content.getComponent("noteKnob3").setControlCallback(onnoteKnob3Control);

inline function onnoteKnob4Control(component, value)
{
	SliderPack3.setSliderAtIndex(3, value);
	SliderPack3.changed();
};

Content.getComponent("noteKnob3").setControlCallback(onnoteKnob3Control);

inline function onnoteKnob4Control(component, value)
{
	SliderPack3.setSliderAtIndex(3, value);
	SliderPack3.changed();
};

Content.getComponent("noteKnob4").setControlCallback(onnoteKnob4Control);

inline function onnoteKnob5Control(component, value)
{
	SliderPack3.setSliderAtIndex(4, value);
	SliderPack3.changed();
};

Content.getComponent("noteKnob5").setControlCallback(onnoteKnob5Control);

inline function onnoteKnob6Control(component, value)
{
	SliderPack3.setSliderAtIndex(5, value);
	SliderPack3.changed();
};

Content.getComponent("noteKnob6").setControlCallback(onnoteKnob6Control);

inline function onnoteKnob7Control(component, value)
{
	SliderPack3.setSliderAtIndex(6, value);
	SliderPack3.changed();
};

Content.getComponent("noteKnob7").setControlCallback(onnoteKnob7Control);

inline function onnoteKnob8Control(component, value)
{
	SliderPack3.setSliderAtIndex(7, value);
	SliderPack3.changed();
};

Content.getComponent("noteKnob8").setControlCallback(onnoteKnob8Control);








// Store the timer interval based on BPM
reg timerInterval = Engine.getMilliSecondsForQuarterBeatsWithTempo(1, Engine.getHostBpm()) / 2;

// Set tempo and update the timer dynamically without interrupting the counter
inline function ontempoControl(component, value)
{
    Engine.setHostBpm(value);

    // Update the timer interval dynamically without stopping the timer
    timerInterval = Engine.getMilliSecondsForQuarterBeatsWithTempo(1, Engine.getHostBpm()) / 2;
    Console.print("Timer interval updated dynamically with new BPM: " + value);
};

Content.getComponent("tempo").setControlCallback(ontempoControl);


// Led knob
const var ledKnob = Content.getComponent("ledKnob");

// Define a variable to store the counter value
reg counter = 0;

// Create a timer object
var timer = Engine.createTimerObject();

// Callback for start/stop button
inline function onplay1Control(component, value)
{
    if (!value) {
        timer.stopTimer();
        Console.print("Timer stopped");
        counter = 0;
        Synth.addNoteOff(1, 63, 0);
    } else {
        // Start the timer when play is pressed
        Synth.addNoteOn(1, 63, 100, 0);
        counter = 0; // Reset the counter to start at the first beat
        incrementCounter(); // Start the counter immediately
        
        // Start the timer with the current interval based on BPM
        timer.startTimer(timerInterval);
        Console.print("Timer started");
    }
};

Content.getComponent("play1").setControlCallback(onplay1Control);

// Function to increment the counter and sync the LED indicator
function incrementCounter() {
    // The counter runs from 1 to 8
    counter = (counter % 8) + 1;
    
    // Print the current step (1 to 8)
    Console.print("Counter: " + counter);
    
    // Update the LED knob to reflect the current step
    ledKnob.setValue(counter - 1);  // Set the LED value (0-based index)

    // Sync the Label to show which step we are on (optional)

    
    // Continue the timer using the latest interval
    timer.startTimer(timerInterval);
}

// Set the callback function for the timer
timer.setTimerCallback(incrementCounter);






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
 