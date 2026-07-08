Content.makeFrontInterface(1024, 680);

// Label with numbers
const var Label1 = Content.getComponent("Label1");

// Define a variable to store the counter value
var counter = 0;

// Create a timer object
var timer = Engine.createTimerObject();


// Callback for start/strop button
inline function onButton1Control(component, value)
{
	if (!value) {
            timer.stopTimer();
            Console.print("Timer stopped");
            counter = 0;
        } else {
            timer.startTimer(300); // how to start the timer immediately?
            Console.print("Timer started");
        }

};

Content.getComponent("Button1").setControlCallback(onButton1Control);



// Function to increment the counter
function incrementCounter() {
    Console.print("Counter: " + counter);
    Label1.set("text", counter);
    counter++;

    // Check if the counter has reached 8
    if (counter <= 8) {
        // Start the timer again for the next increment
        timer.startTimer(300);
    } else {
        Console.print("Counter reached 8. Restarting...");

        // Reset the counter to 0
        counter = 0;

        // Start the timer again for the next iteration
        timer.startTimer(300);
    }
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
 