Content.makeFrontInterface(600, 600);

const var timeKnob1 = Content.getComponent("timeKnob1");
const var timeKnob2 = Content.getComponent("timeKnob2");
const var timeKnob3 = Content.getComponent("timeKnob3");

const var pitchKnob1 = Content.getComponent("pitchKnob1");
const var pitchKnob2 = Content.getComponent("pitchKnob2");
const var pitchKnob3 = Content.getComponent("pitchKnob3");


const var timer1 = Engine.createTimerObject();

timer1.setTimerCallback(function()
{
	timeKnob1.setValue(Math.random()/5);
	timeKnob1.changed();
	timeKnob2.setValue(Math.random());
	timeKnob2.changed();
	timeKnob3.setValue(Math.random()/10);
	timeKnob3.changed();	
	
});

timer1.startTimer(Math.randInt(30, 500));


const var timer2 = Engine.createTimerObject();
const var pitchLow = 0;
const var pitchHigh = 0;

const var minPitchKnob = Content.getComponent("minPitchKnob");
const var maxPitchKnob = Content.getComponent("maxPitchKnob");





timer2.setTimerCallback(function()
{

	pitchKnob1.setValue(Math.randInt(minPitchKnob.getValue(), maxPitchKnob.getValue()));
	pitchKnob1.changed();
	pitchKnob2.setValue(Math.randInt(minPitchKnob.getValue(), maxPitchKnob.getValue()));
	pitchKnob2.changed();
	pitchKnob3.setValue(Math.randInt(minPitchKnob.getValue(), maxPitchKnob.getValue()));
	pitchKnob3.changed();	
	
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
 