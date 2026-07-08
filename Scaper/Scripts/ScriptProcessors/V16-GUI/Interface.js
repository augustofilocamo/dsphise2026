Content.makeFrontInterface(1024, 680);









//------------------- Creación de Buffers en el Motor
const bufStretch1 = Engine.createAndRegisterAudioFile(0);
const bufStretch2 = Engine.createAndRegisterAudioFile(1);
const bufStretch3 = Engine.createAndRegisterAudioFile(2);
const bufGranular = Engine.createAndRegisterAudioFile(3);

// Asignación de Buffers al ScriptNode

const var bufScriptFX = Synth.getAudioSampleProcessor("Stretcher");

const bufScript1 = bufScriptFX.getAudioFile(0);
const bufScript2 = bufScriptFX.getAudioFile(1);
const bufScript3 = bufScriptFX.getAudioFile(2);
const bufScript4 = bufScriptFX.getAudioFile(3);

// Asignación de archivo de audio a cargar en buffer

//const var audioLoaded = Synth.getA

//------------------- Interfaz
// Asignación AudioWaveform (todavia no hace nada)
const var AudioWaveform1 = Content.getComponent("AudioWaveform1");

AudioWaveform1.setColour(1, "0xffe33ddc");

//Console.print(AudioWaveform1.getCurrentlyLoadedFile());

// Cargar Audio en los buffers
bufScript1.loadFile("{PROJECT_FOLDER}guitar.wav");
bufScript2.loadFile("{PROJECT_FOLDER}guitar.wav");
bufScript3.loadFile("{PROJECT_FOLDER}guitar.wav");
bufScript4.loadFile("{PROJECT_FOLDER}guitar.wav");

// %%%%%%%%%%%%%%%%%%%%%%%%% PROCESO %%%%%%%%%%%%%%%%%%%%%%%%%

//Synth.addNoteOn(int channel, int noteNumber, int velocity, int timeStampSamples)

Synth.addNoteOn(1, 60, 127, 0);


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
 