 function onNoteOn()
{
	////////////////// ASSIGNING INCOMING NOTE DATA //////////////////

	// If we haven't reached our maximum number of recorded notes,
	// then proceed.
	if (Globals.numOfCaptureNotes < Globals.maxNotes ) {

		// Create a local variable on the heap to store our even
		// information.
		var capturedNote = Engine.createMessageHolder();
		
		// Capture the note data.
		capturedNote.setType(global_capturedNotes.NoteOn);
		capturedNote.setNoteNumber(Message.getNoteNumber());
		capturedNote.setVelocity(Message.getVelocity());
		capturedNote.setChannel(Message.getChannel());
		capturedNote.setChannel(Message.getEventId());
		capturedNote.setTimestamp(Message.getTimestamp());
		
		// Copy the information from the local variable to the
		// global array (presumably on the heap).
		Globals.global_capturedNotes[numOfCaptureNotes] = capturedNote;
		
		// Increment the number of notes captured.
		Globals.numOfCaptureNotes++;
	}
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
 