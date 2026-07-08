Content.makeFrontInterface(600, 600);

/*
	This snippet implements a stereo audio recorder
	The final audio file is written to a file and loaded into an Audio Loop Player
*/

global g_lastExportedFilePath = "";
global g_Path = "";

const var ScriptFX1 = Synth.getAudioSampleProcessor("Script FX1");
const var afSlot = ScriptFX1.getAudioFile(0);

const var Record = Content.getComponent("Record");

const var AudioLoopPlayer1 = Synth.getAudioSampleProcessor("Audio Loop Player1");

const var AudioLoopPlayer1Slot = AudioLoopPlayer1.getAudioFile(0);
const var AudioWaveform1 = Content.getComponent("AudioWaveform1");




global g_record = false; // the processBlock is waiting for this flag
global g_accumulator = []; // will be reserved for a 30sec length in prepareToPlay to prevent allocating too much in the audio thread (at least for 30sec...)



inline function onRecordControl(component, value)
{
	g_record = value;
	
	if (value)
	{
		Synth.addNoteOn(1, 64, 64, 0);
		Synth.addNoteOff(1, 64, 10000);
		
		return;
	}
	Console.startBenchmark();
	
	// no need to create a file at compile time...
	if (g_accumulator.length > 0)
		reconstructFromAccumulator();
		
	Console.stopBenchmark();
	
};

Content.getComponent("Record").setControlCallback(onRecordControl);




inline function reconstructFromAccumulator()
{
	// The length of the final audio file
	local s = g_accumulator.length * Engine.getBufferSize();
	
	// prepare a stereo buffer holder
	local audioDataStereo = [Buffer.create(s), Buffer.create(s)];
	
	// iterate over the stereo accumulator
	for (st in g_accumulator)
	{
		local st_idx = g_accumulator.indexOf(st); // index of the current blockSize buffer stereo array
		
		// pair of buffers
		for (b in st)
		{
			local b_idx = st.indexOf(b); // so left/right
			
			// we take a slice reference of the buffer we want to write into (accumulator left or right, from sample idx, numSamples).
			local tempBuffer = Buffer.referTo(audioDataStereo[b_idx], st_idx * b.length, b.length);
			
			b >> tempBuffer; // here we write in the reference slice so it gets "copied" to the audioDataStereo buffer automatically
		}
	}
	
	// clean for next time
	g_accumulator.clear();
	
	exportAndLoadAudioFile(audioDataStereo);
}


inline function exportAndLoadAudioFile(audioData)
{
	// append the timestamp to filename to get a unique file
	local filename = "HISE_Rec_" + Date.getSystemTimeMs() + ".wav";

	// preparar el archivo
	local fname = FileSystem.getFolder(FileSystem.AudioFiles).getChildFile(filename);

	// Guardar el path completo en la variable global
	g_lastExportedFilePath = "{PROJECT_FOLDER}" + fname.toString(fname.Filename);
	g_Path = fname;

	// escribir el archivo
	fname.writeAudioFile(audioData, Engine.getSampleRate(), 24);

	// informar que hay nuevos archivos
	Engine.loadAudioFilesIntoPool();

	// cargar archivo
	if (fname.isFile())
		afSlot.loadFile(g_lastExportedFilePath);

	AudioWaveform1.set("visible", false);
	
	Content.callAfterDelay(1000, function() 
	{
	    AudioWaveform1.set("visible", true);
	    afSlot.loadFile(g_Path.toString(g_Path));
	});	
}







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
 