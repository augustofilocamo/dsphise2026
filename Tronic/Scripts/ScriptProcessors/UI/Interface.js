Content.makeFrontInterface(1024, 680);

include("leds.js");

const var vco1_eg_amount = Content.getComponent("vco1_eg_amount");
const var vco2_eg_amount = Content.getComponent("vco2_eg_amount");
const var fm_amount = Content.getComponent("fm_amount");
const var hard_sync = Content.getComponent("hard_sync");
const var vco1_freq = Content.getComponent("vco1_freq");
const var vco2_freq = Content.getComponent("vco2_freq");
const var vco1_waveform = Content.getComponent("vco1_waveform");
const var vco2_waveform = Content.getComponent("vco2_waveform");
const var vco1_level = Content.getComponent("vco1_level");
const var vco2_level = Content.getComponent("vco2_level");
const var noise_level = Content.getComponent("noise_level");
const var nosie_decay = Content.getComponent("nosie_decay");
const var vca_decay = Content.getComponent("vca_decay");



function onNoteOn()
{
	TimerId.startTimer(interval); // Start the timer with the defined interval
	currentLabelValue = 2;
	ledKnob.setValue(1);
}
 function onNoteOff()
{
	TimerId.stopTimer(); 
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
 