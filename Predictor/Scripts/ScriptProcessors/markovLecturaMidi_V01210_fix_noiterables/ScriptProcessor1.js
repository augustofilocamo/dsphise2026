/** This script will play a diminuished chord with a constant delay
	and shows you how to deal with the stuck note problem that arises here.
*/

const var delay = 200;

const var activeNotes = [];

// Let's use a midi list, which is basically a fixed-size array storing 128 integer values
for(i = 0; i < 3; i++)
	activeNotes.push(Engine.createMidiList());

// This new API call will enable the logic (by default it's off now)
// Set this to false and you'll notice the stuck notes...
Synth.setFixNoteOnAfterNoteOff(true);

function onNoteOn()
{
	local c = Message.getChannel();
	local n = Message.getNoteNumber();
	local v = Message.getVelocity();
	
	// We're truncating the event ID to stay within 0-128
	// this should give us enough room for many active notes.
	local idx = Message.getEventId() % 128;
	local i = 0;

	// for the sake of this example we'll ignore the real note	
	Message.ignoreEvent(true);
	
	// We're storing the new event ID in a separate MIDI list for each 
	// note of the chord in order to stop them in the note-off message
	for(an in activeNotes)
		an.setValue(idx, Synth.addNoteOn(c, n + i++ * 3, v, delay));
}
 function onNoteOff()
{
	local idx = Message.getEventId() % 128;

	Message.ignoreEvent(true);

	// Here we have to stop the notes that have been
	// started in the note on. Note how we do not care
	// about the timestamp at all but let the 
	// Synth.setFixNoteOnAfterNoteOff() call do its job.
	for(an in activeNotes)
		Synth.noteOffByEventId(an.getValue(idx));
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
 