Content.makeFrontInterface(600, 600);


// Granulator combo

const audio = Engine.createAndRegisterAudioFile(0);
const audio1 = Engine.createAndRegisterAudioFile(1);

const var AudioWaveform1 = Content.getComponent("AudioWaveform1");

const var ScriptFXA = Synth.getAudioSampleProcessor("Script FXA");

const slotA = ScriptFXA.getAudioFile(0);
const slotB = ScriptFXA.getAudioFile(1);


//slotA.loadFile("{PROJECT_FOLDER}guitar.wav");
//slotA.loadFile("{PROJECT_FOLDER}guitar.wav");
//slotB.loadFile("{PROJECT_FOLDER}guitar.wav");


 

Console.print(AudioWaveform1.getAllProperties());
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
 