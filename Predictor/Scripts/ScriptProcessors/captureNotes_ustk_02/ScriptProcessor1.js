
reg timeStart;


inline function onButton2Control(component, value)
{
	timeStart = Engine.getUptime();
};

Content.getComponent("Button2").setControlCallback(onButton2Control);


 
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




// Get a reference to the MIDI player.
const var MIDIPlayer1 = Synth.getMidiPlayer("MIDI Player1");

// If the MIDI player doesn't have any content loaded, we
// need to create a empty sequence first
if(MIDIPlayer1.isEmpty())
{
    // Create one bar with 4/4 time signature
    MIDIPlayer1.create(4, 4, 8);
}


inline function onButton1Control(component, value)
{
	// Now we just pass the list to the MIDI player and let it create
	// a proper MIDI sequence from it.
	MIDIPlayer1.flushMessageList(l);
};

Content.getComponent("Button1").setControlCallback(onButton1Control);


function onNoteOn()
{
	addNote(l, Message.getChannel(), Message.getNoteNumber(), Message.getVelocity(), Engine.getUptime() - timeStart, 1);
	
	Console.print(Engine.getUptime());
	
	//function addNote(list, channel, notenumber, velocity, position, length)
}
 function onNoteOff()
{
	addNote(l, Message.getChannel(), Message.getNoteNumber(), 23, (Engine.getUptime() - timeStart) + 300, 1);
	
	
	/*
	var o = Engine.createMessageHolder();
	o.setType(o.NoteOff);
	o.setNoteNumber(notenumber);
	o.setChannel(channel);
	o.setTimestamp(Engine.getSamplesForQuarterBeats(position + length));
	*/
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
 