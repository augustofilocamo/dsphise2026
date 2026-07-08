Content.makeFrontInterface(1024, 680);


//include("pluginVSstandalone.js");
//include("Authorisation.js");
include("presetBrowser.js");
include("leds.js");
include("playButton.js");
include("ButtonsVelocityAndPitch.js");
include("arpMuter.js");
include("menuPanels.js");
include("pluginVSstandalone.js");

function onNoteOn()
{
	Console.print("Note n° Interface: " + Message.getNoteNumber());
	//Console.print(freqTo01000());
	//Console.print(arpegiador.CurrentValue());
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
 