#on

#if !HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER
// If this causes an error, you need to add HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER=1
// to your ExtraDefinitions of the project and rebuild the component tree (either reload the patch)
// or click on the refresh icon in the interface designer)
Console.assertTrue(false);
#endif


const var Pad = Content.getComponent("Panel1");
include("xypadmidi.js");

Content.makeFrontInterface(600, 600);

inline function onButton1Control(component, value)
{
	if (value){
		Synth.playNoteFromUI(1, 64, 100);
	} else {
		Synth.noteOffFromUI(1, 64);
	}
};

Content.getComponent("Button1").setControlCallback(onButton1Control);








function onNoteOn()
{
	Message.setNoteNumber(64);
	Message.setVelocity(100);
	Message.setChannel(1);
	Message.sendToMidiOut();
}
 function onNoteOff()
{
	Console.print("m off init");
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
 