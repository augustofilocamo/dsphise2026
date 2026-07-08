Content.makeFrontInterface(1024, 680);


const var play1 = Content.getComponent("play1");

inline function onplay1Control(component, value)
{

	Console.print("play1");
	if (value){
		Synth.addNoteOn(1, 33, 100, 0);
	} else {
		Synth.addNoteOff(1, 33, 0);
		Console.print("stop1");
	}

};

Content.getComponent("play1").setControlCallback(onplay1Control);


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
 