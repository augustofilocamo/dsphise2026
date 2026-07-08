Content.makeFrontInterface(600, 600);

const var stretcher1 = Synth.getAudioSampleProcessor("stretcher1");
const var Knob1 = Content.getComponent("Knob1");

const bufScript1 = stretcher1.getAudioFile(0);
bufScript1.loadFile("/Users/filo/Filo/VST-Project/dsphise/Surface\ Scratcher/AudioFiles/collab3.wav");


var audioLenght	= bufScript1.getNumSamples();




inline function onKnob1Control(component, value)
{
	bufScript1.setRange(audioLenght/Knob1.getValue(), audioLenght);
};

Content.getComponent("Knob1").setControlCallback(onKnob1Control);




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
 