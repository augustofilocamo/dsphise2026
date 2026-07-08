Content.makeFrontInterface(600, 600);


const var MIDIPlayer1 = Synth.getMidiPlayer("MIDI Player1");


MIDIPlayer1.setTrack(2);
var eventList = MIDIPlayer1.getEventList();

var tracks = MIDIPlayer1.getNumTracks();

if (tracks > 1){
	Console.print("Elije un track");
}function onNoteOn()
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
 