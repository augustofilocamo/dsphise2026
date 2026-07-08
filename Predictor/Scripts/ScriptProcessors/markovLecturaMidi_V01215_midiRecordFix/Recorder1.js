const Record = Content.addButton("Record", 10, 10);

inline function onRecordControl(component, value)
{
	component.set("text", value ? "Stop Recording" : "Record");
	timeStart = Engine.getUptime();
	
	if (value)
	{
		Play.setValue(false);
		Play.changed();
	}

	if (!value)
		setMidiPlayer();
};

Record.setControlCallback(onRecordControl);

const Play = Content.addButton("Play", 150, 10);

inline function onPlayControl(component, value)
{
	component.set("text", value ? "Stop" : "Play");
	value ? MIDIPlayer2.play(0) : MIDIPlayer2.stop(0);
}

Play.setControlCallback(onPlayControl);


reg timeStart = 0;
reg recording = [];

// Get a reference to the MIDI player.
const MIDIPlayer2 = Synth.getMidiPlayer("MIDI Player2");


inline function addNote(list, channel, notenumber, velocity, position)
{
    local m = Engine.createMessageHolder();
    m.setType(m.NoteOn);
    m.setNoteNumber(notenumber);
    m.setVelocity(velocity);
    m.setChannel(channel);
    m.setTimestamp(Engine.getSamplesForMilliSeconds(position * 1000));
    
    local o = Engine.createMessageHolder();
    o.setType(o.NoteOff);
    o.setNoteNumber(notenumber);
    o.setChannel(channel);
    //	the length of the note (in samples), here 1000ms 1 second, adjust to your likings
    local length = Engine.getSamplesForMilliSeconds(1000);
    o.setTimestamp(Engine.getSamplesForMilliSeconds(position * 1000) + length);
    
    list.push(m);
    list.push(o);
}


inline function setMidiPlayer()
{
	if (!recording.length)
		return;
	
	MIDIPlayer2.setFile("", true, true);
	local ts = 0;
	
	for (e in recording)
		if (e.isNoteOff())
			ts = e.getTimestamp();
	
	local qb = Math.ceil(Engine.getQuarterBeatsForSamples(ts));
	
	MIDIPlayer2.create(qb, 4, 1);
	
	MIDIPlayer2.flushMessageList(recording);
	for (k in recording)
		Console.print(k.dump());
	recording.clear();
}






function onNoteOn()
{
	if (!Message.isArtificial())
	{
		if (!Record.getValue())
		{

			Record.setValue(true);
			Record.changed();
		}
		
		Message.ignoreEvent(true);
		local nn = Math.randInt(60, 67);
		
		addNote(recording, Message.getChannel(), nn, 100, Engine.getUptime() - timeStart);;
		Synth.addNoteOn(1, nn, 100, 0);
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
 