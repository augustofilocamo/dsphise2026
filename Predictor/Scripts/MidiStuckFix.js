
// This script will play otes constant delay and shows you how to deal with the stuck note problem that arises here.

var delay = 1500;
const var activeNotes = [];

// Let's use a midi list, which is basically a fixed-size array storing 128 integer values
//for(i = 0; i < 1; i++) // sin este for tambien anda
activeNotes.push(Engine.createMidiList());

// This new API call will enable the logic (by default it's off now)
// Set this to false and you'll notice the stuck notes...
//Synth.setFixNoteOnAfterNoteOff(true);
