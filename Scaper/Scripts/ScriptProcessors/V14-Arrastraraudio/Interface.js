Content.makeFrontInterface(600, 600);

// Declaracion constantes ==================================
const var timeKnob1 = Content.getComponent("timeKnob1");
const var pitchKnob1 = Content.getComponent("pitchKnob1");

const var timer1 = Engine.createTimerObject();
const var timer2 = Engine.createTimerObject();

const var minPitchKnob = Content.getComponent("minPitchKnob");
const var maxPitchKnob = Content.getComponent("maxPitchKnob");

const var bufStretch1 = Synth.getAudioSampleProcessor("Audio Loop Player2").getAudioFile(0);
const var bufStretch2 = Synth.getAudioSampleProcessor("Audio Loop Player1").getAudioFile(0);

const var bufStretch3 = Synth.getAudioSampleProcessor("Stretcher").getAudioFile(0);

bufStretch2.linkTo(bufStretch1);
bufStretch3.linkTo(bufStretch1);

// ======================================== Procesos 

//-------------------- Cargar audio en varios buffers --------------------
// 


// Timer 1
timer1.setTimerCallback(function()
{
	timeKnob1.setValue(Math.random()/5);
	timeKnob1.changed();
});

timer1.startTimer(Math.randInt(30, 500));

// Timer 2

timer2.setTimerCallback(function()
{
	pitchKnob1.setValue(Math.randInt(minPitchKnob.getValue(), maxPitchKnob.getValue()));
	pitchKnob1.changed();
});

timer2.startTimer(Math.randInt(3000, 5000));




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
 