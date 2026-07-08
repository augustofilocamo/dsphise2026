 
function addNote(list, channel, notenumber, velocity, position, length)
{
    var m = Engine.createMessageHolder();
    m.setType(m.NoteOn);
    m.setNoteNumber(notenumber);
    m.setVelocity(velocity);
    m.setChannel(channel);
    m.setTimestamp(Engine.getSamplesForQuarterBeats(position));
    
    var o = Engine.createMessageHolder();
    o.setType(o.NoteOff);
    o.setNoteNumber(notenumber);
    o.setChannel(channel);
    o.setTimestamp(Engine.getSamplesForQuarterBeats(position + length));
    
    list.push(m);
    list.push(o);
}


// This will hold our note sequence.
var l = [];

// Add a bunch of notes
addNote(l, 1, 60, 127, 0, 1);
addNote(l, 1, 63, 127, 1, 0.5);
addNote(l, 1, 65, 127, 1.5, 0.3);
addNote(l, 1, 67, 127, 2.11, 0.5);
addNote(l, 1, 72, 127, 3, 1);


// Get a reference to the MIDI player.
const var MIDIPlayer1 = Synth.getMidiPlayer("MIDI Player1");

// If the MIDI player doesn't have any content loaded, we
// need to create a empty sequence first
if(MIDIPlayer1.isEmpty())
{
    // Create one bar with 4/4 time signature
    MIDIPlayer1.create(4, 4, 1);
}

// Now we just pass the list to the MIDI player and let it create
// a proper MIDI sequence from it.
MIDIPlayer1.flushMessageList(l);
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
 