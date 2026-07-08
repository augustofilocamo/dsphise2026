// Set up the interface size
Content.makeFrontInterface(400, 300);



// USAGE
// Agregar counterTimer.startTimer(30); en onNoteOn y 	counterTimer.stopTimer(); en onNoteOff

const var BpmSlider = Content.getComponent("BpmSlider");
const var Knob1 = Content.getComponent("Knob1");


// Initialize the counter and timing variables
var counter = 1;
var lastUpdateTime = Engine.getUptime();
var bpm = Engine.getHostBpm(); // Get the host BPM at the start
var interval = 60000 / bpm; // Calculate the interval based on host BPM

// Function to update the label with the counter value
function updateCounter()
{

    Knob1.setValue(counter);
    counter++;
    
    if (counter > 8) // Reset counter if it exceeds 8
    {
        counter = 1;
    }
}

// Start a timer that continuously checks the time difference
var counterTimer = Engine.createTimerObject();
counterTimer.setTimerCallback(function()
{
    var currentTime = Engine.getUptime();
    var elapsedTime = currentTime - lastUpdateTime;

    if (elapsedTime >= interval / 1000) // Check if enough time has passed (convert ms to sec)
    {
        updateCounter();
        lastUpdateTime = currentTime;
    }
});

// Start the timer with a small interval to continuously check


// Function to update BPM based on slider and host synchronization
inline function onBpmSliderControl(component, value)
{
    bpm = value;
    interval = 60000 / bpm; // Recalculate interval based on new BPM value
    
    // Set the BPM of the host to match the slider
    Engine.setHostBpm(bpm);
};

BpmSlider.setControlCallback(onBpmSliderControl);

// Sync the slider with the host BPM initially
function syncBpmWithHost()
{
    bpm = Engine.getHostBpm(); // Get the current BPM from the host
    interval = 60000 / bpm;    // Recalculate the interval based on host BPM
    BpmSlider.setValue(bpm);   // Set the slider value to match the host BPM
}

// Continuously check for changes in host BPM
var hostBpmTimer = Engine.createTimerObject();
hostBpmTimer.setTimerCallback(function()
{
    var hostBpm = Engine.getHostBpm();
    if (hostBpm != BpmSlider.getValue()) // Only update if there's a mismatch
    {
        BpmSlider.setValue(hostBpm);  // Synchronize slider with host BPM
        bpm = hostBpm;
        interval = 60000 / bpm;
    }
});

hostBpmTimer.startTimer(30); // Check every 500 milliseconds

// Initialize the BPM based on host BPM
syncBpmWithHost();

function onNoteOn()
{
	counterTimer.startTimer(30);
}
 function onNoteOff()
{
	counterTimer.stopTimer();
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
 