 function onNoteOn()
{
	Console.print("m on");
	Message.setNoteNumber(64);
	Message.setVelocity(100);
	Message.setChannel(1);
	Message.sendToMidiOut();
}
 function onNoteOff()
{
	Console.print("m off");
Message.setNoteNumber(64);
Message.setChannel(1);
Message.sendToMidiOut();

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
 