Content.makeFrontInterface(600, 200);
Console.clear();

const var intervalTime = Engine.getMilliSecondsForQuarterBeats(0.5); // 0.5 quarter note interval
const var totalSteps = 8;
global currentStep = 1;
const var Panel1 = Content.getComponent("Panel1");

Engine.setHostBpm(100);




const var SliderPack1 = Content.getComponent("SliderPack1");

const var Arpeggiator1 = Synth.getSliderPackProcessor("Arpeggiator1");
const var Arpeggiator1_sp = Arpeggiator1.getSliderPack(0);





Arpeggiator1_sp.setDisplayCallback(function(displayValue)
{
	Console.print(displayValue);
	
	var posX = SliderPack1.get("x") + SliderPack1.getWidth()/totalSteps * displayValue;
	
	Panel1.setPosition(posX, 90, 30, 10);
});




inline function onButton1Control(component, value)
{
	if (value){
		Synth.addNoteOn(1, 60, 127, 0);
	} else {
		Synth.addNoteOff(1, 60, 0);
	}
};

Content.getComponent("Button1").setControlCallback(onButton1Control);
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
 