Content.makeFrontInterface(600, 600);

const var Sampler1 = Synth.getSampler("Sampler1");

inline function onKnob1Control(component, value)
{
	local obj = Sampler1.getTimestretchOptions();
	local modes = ["Disabled", "VoiceStart", "TimeVariant", "TempoSynced"];
	obj.Mode = modes[value];

	Sampler1.setTimestretchOptions(obj);
};

Content.getComponent("Knob1").setControlCallback(onKnob1Control);



inline function onKnob2Control(component, value)
{
	Sampler1.setTimestretchRatio(value);
};

Content.getComponent("Knob2").setControlCallback(onKnob2Control);
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
 