Content.makeFrontInterface(1024, 680);



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

// Arps ref
const var Arpeggiator1 = Synth.getMidiProcessor("Arpeggiator1");
const var Arpeggiator2 = Synth.getMidiProcessor("Arpeggiator2");

const var SliderPack1 = Content.getComponent("SliderPack1");


SliderPack1.setSliderAtIndex(1, 100);
inline function onveloKnob1Control(component, value)
{
	SliderPack1.setSliderAtIndex(0, value);
	SliderPack1.changed();
};

Content.getComponent("veloKnob1").setControlCallback(onveloKnob1Control);




inline function ontempoControl(component, value)
{
	Engine.setHostBpm(value);
};

Content.getComponent("tempo").setControlCallback(ontempoControl);



// Label with numbers
const var Label1 = Content.getComponent("Label1");

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
            Synth.addNoteOff(1, 33, 0);
            

        } else {
	        // only start it once
	        
	        // simply call increment timer so it immediately counts up
	        // then the timer will take over
	        Synth.addNoteOn(1, 33, 100, 0);
	        incrementCounter();
        
            timer.startTimer((Engine.getMilliSecondsForQuarterBeatsWithTempo(1, Engine.getHostBpm())/2)); // how to start the timer immediately?
            Console.print("Timer started");
        }

};

Content.getComponent("play1").setControlCallback(onplay1Control);



// Function to increment the counter
function incrementCounter() {
    Console.print("Counter: " + counter);
    counter++;
    Label1.set("text", counter);
    ledKnob.setValue(counter-1);

    // Check if the counter has reached 8
    if (counter >= 8) {
        counter = 0;
    	Console.print("Counter reached 8. Restarting...");
    }
}

// Set the callback function for the timer
timer.setTimerCallback(incrementCounter);function onNoteOn()
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
 