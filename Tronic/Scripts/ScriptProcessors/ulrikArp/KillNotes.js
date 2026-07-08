const killarp = Content.addButton("killarp", 0, 0);
killarp.set("isMomentary", true);
killarp.set("saveInPreset", false);

const killpressed = Content.addButton("killpressed", 130, 0);
killpressed.set("isMomentary", true);
killpressed.set("saveInPreset", false);

reg arpnotes = [];
reg pressednotes = [];
reg midiList = Engine.createMidiList();

//	Kill arp notes	-----------------------
inline function onkillarp(component, value)
{
	if (value && arpnotes.length)
	{
		for (n in arpnotes)
			Synth.addNoteOff(2, n, 0);
		
		arpnotes.clear();
	}
}

killarp.setControlCallback(onkillarp);

//	Kill pressed key notes	--------------------
inline function onkillpressed(component, value)
{
	if (value && pressednotes.length)
	{
		for (n in pressednotes)
			Synth.addNoteOff(1, n, 0);
		
		pressednotes.clear();
	}
}

killpressed.setControlCallback(onkillpressed);function onNoteOn()
{
	if (Message.isArtificial())
		arpnotes.push(Message.getNoteNumber());
	else
	{
		local id = Message.makeArtificial();
		midiList.setValue(Message.getNoteNumber(), id);
		pressednotes.push(Message.getNoteNumber());
	}	
}
 function onNoteOff()
{
	Synth.noteOffByEventId(midiList.getValue(Message.getNoteNumber()));
	
	if (Message.isArtificial())
		arpnotes.remove(Message.getNoteNumber());
	else
		pressednotes.remove(Message.getNoteNumber());
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
 