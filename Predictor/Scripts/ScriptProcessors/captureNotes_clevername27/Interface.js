/////////////////// NOTE CAPTURE SNIPPET ////////////////////
//
// This snippet captures incoming MIDI note-on messages in
// real-time, in the audio thread. It does not capture
// note-offs, so if that information is important to you,
// then be sure to add that functionality.

Content.makeFrontInterface(600, 300);

//////////////////// CREATE GLOBAL VARIABLES ////////////////////
//
// Create these variable in Globals so they can be accessed from 
// both the ui and realtime threads.

// The captured notes will be stored here.
Globals.global_capturedNotes = []; 

// Erase any captured notes still stored.
Globals.global_capturedNotes.clear(); 

// We haven't caputred any notes yet.
Globals.numOfCaptureNotes = 0; 

// Set the maximum number of notes we can capture.
Globals.maxNotes = 1024;

// Clear the console.
Console.clear();

// Prealloacte the memory in the array; we don't want to allocate memory inside the audio thread.
// I'm not using the reserve method as I don't see how to use it for complex data types, and to
// my understanding, JavaScript does not actually allocate memory with it. I'm assuming that 
// the zero allocated for Event ID and Timestamp will be the same variable type (e.g., int32) as the
// corresponding function will allocate, otherwise, this is all for naught.
for (index = 0; index < Globals.maxNotes; index++) { 

	var capturedNote = Engine.createMessageHolder();
	
	capturedNote.setType(global_capturedNotes.NoteOn);
	capturedNote.setNoteNumber(0);
	capturedNote.setVelocity(0);
	capturedNote.setChannel(0);
	capturedNote.setTimestamp(0);
	
	Globals.global_capturedNotes[index] = capturedNote;
}

//////////////////// PRINT CAPTURED MIDI NOTES ////////////////////

// Get a reference to the button.
const var btn_DumpCapture = Content.getComponent("btn_DumpCapture");

// Register and define the callback function for when the button is pressed.
btn_DumpCapture.setControlCallback(on_btnDumpCapture_Control);
inline function on_btnDumpCapture_Control(component, value) {

	// If the button is pressed…
	if (value) {

		// Loop over the number of notes captured.
		for (index = 0; index < Globals.numOfCaptureNotes; index++) { 
	
			// Print each event's information to the Console.
			Console.print(	" note: " 	+ Globals.global_capturedNotes[index].getNoteNumber() + 
		  					"  vel: " 	+ Globals.global_capturedNotes[index].getVelocity() + 
		  					" chan: " 	+ Globals.global_capturedNotes[index].getChannel() +
		  					"   ts: " 	+ Globals.global_capturedNotes[index].getTimestamp() ); 
		}
	}
}; function onNoteOn()
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
 