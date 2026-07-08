/*
	This snippet implements a stereo audio recorder.
	The final audio file is written to a file and loaded into an Audio Loop Player.
*/

const var ScriptFX2 = Synth.getAudioSampleProcessor("Script FX2");
const var afSlot = ScriptFX2.getAudioFile(0);

const var Record = Content.getComponent("Record");
const var dragOutPanel = Content.getComponent("dragOutPanel");

global g_Path = "";

var silenceCounter = 0;
const var silenceThreshold = 0.001; // Ajustá este valor si es demasiado sensible

// Variable global para el archivo grabado más reciente
var lastRecordedFilename = "";

// Callback del botón de grabación
inline function onRecordControl(component, value)
{
	g_record = value;

	if (value)
	{
		setRecordingAnimation(true);
		AudioWaveformRec.showControl(false);
		silenceCounter = 0;
		silenceTimer.startTimer(1000); // Cada 1 segundo
		Console.print("recording....");
		return;

		
		
	} else
	{
		setRecordingAnimation(false);
		AudioWaveformRec.showControl(true);
		silenceTimer.stopTimer();
	}
	
	Console.startBenchmark();

	if (g_accumulator.length > 0)
		reconstructFromAccumulator();

	Console.stopBenchmark();
};

Content.getComponent("Record").setControlCallback(onRecordControl);

// Reconstruye el audio desde el acumulador
inline function reconstructFromAccumulator()
{
	local s = g_accumulator.length * Engine.getBufferSize();
	local audioDataStereo = [Buffer.create(s), Buffer.create(s)];

	for (st in g_accumulator)
	{
		local st_idx = g_accumulator.indexOf(st);
		
		for (b in st)
		{
			local b_idx = st.indexOf(b);
			local tempBuffer = Buffer.referTo(audioDataStereo[b_idx], st_idx * b.length, b.length);
			b >> tempBuffer;
		}
	}

	g_accumulator.clear();
	exportAndLoadAudioFile(audioDataStereo);
}


inline function exportAndLoadAudioFile(audioData)
{
	// Paso 1: Carpeta raíz y subcarpeta recordings
	local audioFilesFolder = FileSystem.getFolder(FileSystem.AudioFiles);
	local recordingsFolder = audioFilesFolder.getChildFile("recordings");

	// Paso 2: Si existe, eliminar completamente la carpeta recordings
	if (recordingsFolder.isDirectory())
		recordingsFolder.deleteFileOrDirectory();

	// Paso 3: Volver a crearla
	audioFilesFolder.createDirectory("recordings");

	// Paso 4: Actualizar referencia
	recordingsFolder = audioFilesFolder.getChildFile("recordings");

	// Paso 5: Crear nuevo archivo
	lastRecordedFilename = "Tactile_" + Date.getSystemTimeMs() + ".wav";
	local newFile = recordingsFolder.getChildFile(lastRecordedFilename);
	newFile.writeAudioFile(audioData, Engine.getSampleRate(), 24);

	// Paso 6: Guardar ruta global y cargar en el slot
	g_Path = newFile;
	Engine.loadAudioFilesIntoPool();

	if (newFile.isFile())
		afSlot.loadFile(g_Path.toString(g_Path));
}



dragOutPanel.setMouseCallback(function(event) {
	if (event.clicked) { 
		var recordingsFolder = FileSystem.getFolder(FileSystem.AudioFiles).getChildFile("recordings");
		var fileToExport = recordingsFolder.getChildFile(lastRecordedFilename);

		if (fileToExport.isFile())
		{
			this.startExternalFileDrag(fileToExport, true, function(){
				// Callback después del drag, si necesitás algo acá
			});
		}
	}
});

// Recording label;
const var RecordingLabel = Content.getComponent("RecordingLabel");

// Variable para controlar la visibilidad
var isVisible = true;

// Crear un Timer que alterna la visibilidad
const var recordingTimer = Engine.createTimerObject();
recordingTimer.setTimerCallback(function()
{
    isVisible = !isVisible;
    RecordingLabel.set("text", isVisible ? "Capturing..." : "");
});

// Función para iniciar o detener la animación
function setRecordingAnimation(state)
{
    if (state)
        recordingTimer.startTimer(350); // Cada 500ms
    else
        recordingTimer.stopTimer();
        RecordingLabel.set("text", "");
}


// Play button
inline function onPlayControl(component, value)
{
	if (value)
	{
		ScriptFX2.setAttribute(ScriptFX2.Gate, 1);			
	}
	else
	{
		ScriptFX2.setAttribute(ScriptFX2.Gate, 0);	
	}	
};

Content.getComponent("Play").setControlCallback(onPlayControl);

// Clear button
inline function onClearControl(component, value)
{
	if (value)
		afSlot.loadFile("");
		
	Content.getComponent("Clear").setValue(0);
	Content.getComponent("Clear").changed();
		
};

Content.getComponent("Clear").setControlCallback(onClearControl);



// Silence detector. Para rec si no hay senal por 30 seg.
const var silenceTimer = Engine.createTimerObject();

silenceTimer.setTimerCallback(function()
{
	if (!g_record)
		return;

	var peakL = Engine.getMasterPeakLevel(0);
	var peakR = Engine.getMasterPeakLevel(1);

	if (peakL < silenceThreshold && peakR < silenceThreshold)
	{
		silenceCounter += 1;
	}
	else
	{
		silenceCounter = 0;
	}

	if (silenceCounter >= 5)
	{
		Console.print("Silencio detectado por 30 segundos. Deteniendo grabación.");
		Content.getComponent("Record").setValue(0); // Detiene la grabación
		Content.getComponent("Record").changed();
		silenceCounter = 0;
	}
});
