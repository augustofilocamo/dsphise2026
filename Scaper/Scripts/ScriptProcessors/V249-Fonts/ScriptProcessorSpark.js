const var timerSparks = Engine.createTimerObject();
const var sparkKnob = Content.getComponent("sparkKnob");



inline function secsToSamples(secs){
	local lap = secs * 44100;
	return lap;
}  

Console.print(secsToSamples(1));

timerSparks.setTimerCallback(function()
{
	Synth.addNoteOn(1, 30, Math.randInt(90, 127), Math.random() * secsToSamples(3));	
	Synth.addNoteOn(1, 30, Math.randInt(90, 127), Math.random() * secsToSamples(20));		  
	Synth.addNoteOn(1, 30, Math.randInt(90, 127), Math.random() * secsToSamples(20));		  
	Synth.addNoteOn(1, 30, Math.randInt(90, 127), Math.random() * secsToSamples(50));		  
	Synth.addNoteOn(1, 30, Math.randInt(90, 127), Math.random() * secsToSamples(40));		  
	Synth.addNoteOn(1, 30, Math.randInt(90, 127), Math.random() * secsToSamples(40));		  
	Synth.addNoteOn(1, 30, Math.randInt(90, 127), Math.random() * secsToSamples(10));		  
	Synth.addNoteOn(1, 30, Math.randInt(90, 127), Math.random() * secsToSamples(10));		  	  

});

timerSparks.startTimer(50000);

 
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
 