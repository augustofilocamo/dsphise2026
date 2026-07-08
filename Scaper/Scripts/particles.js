
const var timerSparks = Engine.createTimerObject();
const var ComboBox1 = Content.getComponent("ComboBox1");
global startTime = 3000;	  

//const var comboValues = [5000, 10000, 60000, 300000];
const var comboValues = [1, 8, 15, 38];
global numLaps = 5;


inline function secsToSamples(secs){
	local lap = secs * 44100;
	return lap;
}  


timerSparks.setTimerCallback(function()
{
	var i = 0;
	for (i=0; i < numLaps; i++){
		
		Synth.addNoteOn(12, 60, Math.randInt(40, 127), Math.random() * secsToSamples(10));
		Synth.addNoteOn(12, 67, Math.randInt(40, 127), Math.random() * secsToSamples(10));
		Synth.addNoteOn(12, 48, Math.randInt(40, 127), Math.random() * secsToSamples(10));

	}

	//Console.print(numLaps + " loops de 3 notas disparadas");	  
	//Console.print("timer tic: ------------ <<<<<<<<<");

});
startTime = comboValues[ComboBox1.getValue()];
//Console.print("looping every outside " + startTime);
//timerSparks.startTimer(startTime);
//timerSparks.stopTimer();
//Console.print("ComboBox1.getValue(): " + ComboBox1.getValue());


inline function onComboBox1Control(component, value)
{
	timerSparks.stopTimer();
	//Console.print("Combobox callback:  time: " + comboValues[value]);
	//timerSparks.startTimer(comboValues[value-1]);
	timerSparks.startTimer(10000);
	numLaps = comboValues[value-1];
	//Console.print("numLaps: " + numLaps);
	

	
};

Content.getComponent("ComboBox1").setControlCallback(onComboBox1Control);




