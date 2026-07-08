#on

#if !HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER
// If this causes an error, you need to add HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER=1
// to your ExtraDefinitions of the project and rebuild the component tree (either reload the patch)
// or click on the refresh icon in the interface designer)
Console.assertTrue(false);
#endif

Content.makeFrontInterface(1024, 680);
Engine.loadAudioFilesIntoPool();



// — vars —
const var FX      = Synth.getEffect("Script FX1");
const var Label1  = Content.getComponent("Label1");
const var Pad     = Content.getComponent("XYPadPnl");
const var IDX     = Content.getAllComponents(".*").indexOf(Pad);
const var uph     = Engine.createUserPresetHandler();
var isDrag = false;
var lastXPos;
var lastYPos;
const var audioProcessor = Synth.getAudioSampleProcessor("Script FX1");
const var warningPanel = Content.getComponent("warningPanel");



// Paint routine
const var Panel1 = Content.getComponent("Panel1");




// Audio recorder globals
global g_record = false; // the processBlock is waiting for this flag
global g_accumulator = []; // will be reserved for a 30sec length in prepareToPlay to prevent allocating too much in the audio thread (at least for 30sec...)


// AudioFile audioProcessor
const bufScript1 = audioProcessor.getAudioFile(0);
const bufScript2 = audioProcessor.getAudioFile(1);
const bufScript3 = audioProcessor.getAudioFile(2);
const bufScriptCurate = audioProcessor.getAudioFile(3);

// Includes
include("xypadmidi.js");
include("audioRecorder.js");
include("laf.js");
include("curateAudio.js");
include("paintRoutinePanels.js");
include("presetBrowser.js");
include("menuPanels.js");
include("pluginVSstandalone.js");


// panel
Pad.set("isPluginParameter", true);
Pad.set("pluginParameterName", "PackedXY");



// On buttons


inline function onButtonOn1Control(component, value)
{
	if (!value)
	{
		FX.setAttribute(FX.onoff1, 0);
		Content.getComponent("panelBuf1").showControl(0);
		Console.print("value");
			
	} else 
	{
		FX.setAttribute(FX.onoff1, 1);
		Content.getComponent("panelBuf1").showControl(1);
		Console.print("no value");
	}
	
};

Content.getComponent("ButtonOn1").setControlCallback(onButtonOn1Control);


inline function onButtonOn2Control(component, value)
{
	if (!value)
	{
		FX.setAttribute(FX.onoff2, 0);
		Content.getComponent("panelBuf2").showControl(0);
		Console.print("value");
			
	} else 
	{
		FX.setAttribute(FX.onoff2, 1);
		Content.getComponent("panelBuf2").showControl(1);
		Console.print("no value");
	}
	
};

Content.getComponent("ButtonOn2").setControlCallback(onButtonOn2Control);



inline function onButtonOn3Control(component, value)
{
	if (!value)
	{
		FX.setAttribute(FX.onoff3, 0);
		Content.getComponent("panelBuf3").showControl(0);
		Console.print("value");
			
	} else 
	{
		FX.setAttribute(FX.onoff3, 1);
		Content.getComponent("panelBuf3").showControl(1);
		Console.print("no value");
	}
	
};

Content.getComponent("ButtonOn3").setControlCallback(onButtonOn3Control);



// Devuelve un nuevo Buffer con 2 segundos centrados del buffer original
// para el FFT que no puede trabajar con audiofiles directo
function cropBufferToCenteredRangeArray(buffer)
{
    var segmentLength = 88200; // 2 segundos a 44.1kHz
    var audioLength = buffer.length;

    var startSample = Math.floor((audioLength - segmentLength) / 2);
    if (startSample < 0) startSample = 0;

    var cropped = Buffer.create(segmentLength);
    

    
    for (i = 0; i < segmentLength; i++)
    {
        cropped[i] = buffer[startSample + i];
    }

	cropped.normalise(0);
    return cropped;
}










// Funcion para cropear el audio		
function cropBufferToCenteredRange(buffer)
{
    var segmentLength = 88200; // 2 segundos a 44.1kHz
    var audioLength = buffer.getNumSamples();

    var startSample = Math.floor((audioLength - segmentLength) / 2);
    var endSample   = startSample + segmentLength;

    buffer.setRange(startSample, endSample);

}


var droppedFilePath1 = ""; // Variable global


// Botones de load audios
inline function onloadButton1Control(component, value)
{
	if (value){
		FileSystem.browse(FileSystem.Desktop, false, "*.wav,*.mp3,*.ogg, *.aif, *.aiff" , function(file)
		{
			var f = {};			
						
			f.fileName = file.toString(file.FullPath);	
			

				
			bufScript1.loadFile(f.fileName);
			droppedFilePath1 = f.fileName; // ← Aquí se guarda la ruta globalmente
						
			if (!curateAudioLength(bufScript1))
				return; // Interrumpe si es mayor a 50MB
			
			if (!curateFileSize(f.fileName))
				return; // Interrumpe si es mayor a 50MB


			cropBufferToCenteredRange(bufScript1);
			droppedFilePath = f.fileName;
			
			// Volver a cargar y procesar el nuevo audio para plot fft UI
			signalFile = Engine.loadAudioFileIntoBufferArray(droppedFilePath);
			var croppedBuffer = cropBufferToCenteredRangeArray(signalFile[0]);
			
			Panel1.setPaintRoutine(function(g)
			{
			    g.setColour(Colours.white);
				g.drawFFTSpectrum(fft, this.getLocalBounds(0));
			});
			
			Panel1.repaint();
			
			fftResults = [];
			fft.process(croppedBuffer);
			
			Panel1.setPaintRoutine(function(g)
			{
			    g.setColour(Colours.white);
				g.drawFFTSpectrum(fft, this.getLocalBounds(0));
			});
			
			Panel1.repaint();
		    
		    //fft.process(signalFile[0]);
		    panelBuf1.repaint();
   
			// Setea el label de file cargado
	   		var labelName = FileSystem.fromAbsolutePath(droppedFilePath); 
	   		var textString = labelName.toString(labelName.Filename);
	   		var shortName = textString.substring(0, 12);
	   		Content.getComponent("LabelLayer1").set("text", shortName);	
   
   
			Console.print("Cargado en bufScript1");
			Content.getComponent("loadButton1").setValue(0);
		});		
			
	}

};

Content.getComponent("loadButton1").setControlCallback(onloadButton1Control);



inline function onloadButton2Control(component, value)
{
	if (value){
		FileSystem.browse(FileSystem.Desktop, false, "*.wav,*.mp3,*.ogg, *.aif, *.aiff" , function(file)
		{
			var f = {};			
						
			f.fileName = file.toString(file.FullPath);	
			
			bufScript2.loadFile(f.fileName);
			
			if (!curateAudioLength(bufScript2))
				return; // Interrumpe si es menor a 2 sec
			
			if (!curateFileSize(f.fileName))
				return; // Interrumpe si es mayor a 50MB
				
			cropBufferToCenteredRange(bufScript2);
			droppedFilePath2 = f.fileName;
			
			// Volver a cargar y procesar el nuevo audio para plor fft UI
			signalFile2 = Engine.loadAudioFileIntoBufferArray(droppedFilePath2);
			var croppedBuffer = cropBufferToCenteredRangeArray(signalFile2[0]);
			
			fftResults2 = [];
		    fft2.process(croppedBuffer);
		    panelBuf2.repaint();
		    
			// Setea el label de file cargado
	   		var labelName = FileSystem.fromAbsolutePath(droppedFilePath2); 
	   		var textString = labelName.toString(labelName.Filename);
	   		var shortName = textString.substring(0, 12);
	   		Content.getComponent("LabelLayer2").set("text", shortName);	
   
			Console.print("Cargado en bufScript2");
			Content.getComponent("loadButton2").setValue(0);
		});		
			
	}

};

Content.getComponent("loadButton2").setControlCallback(onloadButton2Control);



inline function onloadButton3Control(component, value)
{
	if (value){
		FileSystem.browse(FileSystem.Desktop, false, "*.wav,*.mp3,*.ogg, *.aif, *.aiff" , function(file)
		{
			var f = {};			
						
			f.fileName = file.toString(file.FullPath);	
			
			bufScript3.loadFile(f.fileName);
			
			if (!curateAudioLength(bufScript3))
				return; // Interrumpe si es mayor a 50MB
			
			if (!curateFileSize(f.fileName))
				return; // Interrumpe si es mayor a 50MB
			
			cropBufferToCenteredRange(bufScript3);
			droppedFilePath3 = f.fileName;
			
			// Volver a cargar y procesar el nuevo audio para plor fft UI
			signalFile3 = Engine.loadAudioFileIntoBufferArray(droppedFilePath3);
			var croppedBuffer = cropBufferToCenteredRangeArray(signalFile3[0]);

			fftResults2 = [];
		    fft3.process(croppedBuffer);
		    panelBuf3.repaint();
		    
			// Setea el label de file cargado
	   		var labelName = FileSystem.fromAbsolutePath(droppedFilePath3); 
	   		var textString = labelName.toString(labelName.Filename);
	   		var shortName = textString.substring(0, 12);
	   		Content.getComponent("LabelLayer3").set("text", shortName);		    
   
			Console.print("Cargado en bufScript3");
			Content.getComponent("loadButton3").setValue(0);
		});		
			
	}

};

Content.getComponent("loadButton3").setControlCallback(onloadButton3Control);





//########################## Arrastrar audio al panel
// Buffer actual que usa el buffer rotativo
var currentBufferIndex = 0;
var droppedFilePath;
var droppedFilePath2;
var droppedFilePath3;


var signalFile;
var signalFile2;
var signalFile3;

const var signal;
const var signal2;
const var signal3;

const var fft = Engine.createFFT();
const var fft2 = Engine.createFFT();
const var fft3 = Engine.createFFT();

fft.setWindowType(fft.BlackmanHarris);
fft2.setWindowType(fft2.BlackmanHarris);
fft3.setWindowType(fft3.BlackmanHarris);

var fftResults = []; // Aquí vamos a guardar { offset, gain }
var fftResults2 = []; // Aquí vamos a guardar { offset, gain }
var fftResults3 = []; // Aquí vamos a guardar { offset, gain }






	
//################ Plot de waveforms UI


fft.setMagnitudeFunction(
(function(data, offset)
{
	
	var max = 0.0;
	
	//fftResults = []; // limpia array
	
	for(s in data)
	{
		max = Math.max(max, s);
	}
	
	fftResults.push({ offset: offset, gain: max });
	
}), false);

fft.prepare(1024, 1);
fft.setEnableSpectrum2D(true);


// 2d Spectrum parameters
fft.setSpectrum2DParameters({
  "FFTSize": 13,
  "DynamicRange": 100,
  "Oversampling": 4,
  "ColourScheme": 1,
  "GainFactor": 500,
  "ResamplingQuality": "High",
  "Gamma": 1,
  "Standardize": true,
  "FrequencyGamma": 1,
  "WindowType": 4
});



// Process the buffer with the function above.



// Segundo fft
fft2.setMagnitudeFunction(
(function(data, offset)
{
	
	var max = 0.0;

	for(s in data)
	{
		max = Math.max(max, s);
	}
	
	fftResults2.push({ offset: offset, gain: max });
	
}), false);

fft2.prepare(1024, 1);


// Process the buffer with the function above.





// Tercer fft
fft3.setMagnitudeFunction(
(function(data, offset)
{
	
	var max = 0.0;

	for(s in data)
	{
		max = Math.max(max, s);
	}
	
	fftResults3.push({ offset: offset, gain: max });
	
}), false);

fft3.prepare(1024, 1);


// Process the buffer with the function above.




// Funcion drop
Pad.setFileDropCallback("Drop Only", "*.wav,*.mp3,*.ogg, *.aif, *.aiff", 
function(file)
{
    if (file.drop)
    {
        var f = {};
        var audio = {};
        f.fileName = file.fileName;  					
        audio = FileSystem.fromAbsolutePath(file.fileName);
     
        droppedFilePath = file.fileName;  
        
        // Volver a cargar y procesar el nuevo audio para plor fft UI
        signalFile = Engine.loadAudioFileIntoBufferArray(droppedFilePath);

		bufScriptCurate.loadFile(f.fileName);
		
		if (!curateAudioLength(bufScriptCurate))
			return; // Interrumpe si es menor a 2 sec
       
        
        // Cargado de buffer rotativo
        inline function getBuffer(index)
        {
            if (index == 0) return bufScript1;
            if (index == 1) return bufScript2;
            if (index == 2) return bufScript3;
        }
        
        
        inline function isBufferLoaded(buf)
        {
            return buf.getNumSamples() > 0;
        }
        
        function loadIntoNextAvailableBuffer(fileName)
        {
            // Caso 1: hay alguno vacío
            if (!isBufferLoaded(bufScript1))
            {
                bufScript1.loadFile(fileName);
                cropBufferToCenteredRange(bufScript1);
                var croppedBuffer = cropBufferToCenteredRangeArray(signalFile[0]);
                fft.process(croppedBuffer);
                panelBuf1.repaint();
                Console.print("Cargado en bufScript1");
                return;
            }
        
            if (!isBufferLoaded(bufScript2))
            {
                bufScript2.loadFile(fileName);
                cropBufferToCenteredRange(bufScript2);
                var croppedBuffer = cropBufferToCenteredRangeArray(signalFile2[0]);
                fft2.process(croppedBuffer);
                panelBuf2.repaint();
                Console.print("Cargado en bufScript2");
                return;
            }
        
            if (!isBufferLoaded(bufScript3))
            {
                bufScript3.loadFile(fileName);
                cropBufferToCenteredRange(bufScript3);
                var croppedBuffer = cropBufferToCenteredRangeArray(signalFile3[0]);
                fft3.process(croppedBuffer);
                panelBuf3.repaint();
                Console.print("Cargado en bufScript3");
                return;
            }
			        
			// Caso 2: todos llenos → reemplaza rotativamente
			var target = getBuffer(currentBufferIndex);
			target.loadFile(fileName);
			cropBufferToCenteredRange(target);
			
			if (currentBufferIndex == 0)
			{			    
			    signalFile = Engine.loadAudioFileIntoBufferArray(fileName);
			    var cropped = cropBufferToCenteredRangeArray(signalFile[0]);
			    fft.process(cropped);
			    //Console.print(cropped);
			    //fft.process(signalFile[0]);
			    panelBuf1.repaint();
			}
			else if (currentBufferIndex == 1)
			{
			    signalFile2 = Engine.loadAudioFileIntoBufferArray(fileName);
			    var cropped = cropBufferToCenteredRangeArray(signalFile2[0]);
			    fft.process(cropped);
			    //fft2.process(signalFile2[0]);
			    panelBuf2.repaint();
			}
			else if (currentBufferIndex == 2)
			{
			    signalFile3 = Engine.loadAudioFileIntoBufferArray(fileName);
			    var cropped = cropBufferToCenteredRangeArray(signalFile3[0]);
			    fft.process(cropped);
			    //fft3.process(signalFile3[0]);
			    panelBuf3.repaint();
			}
			
			Console.print("Reemplazado bufScript" + (currentBufferIndex + 1));
			
			// Avanza el índice circularmente (0 → 1 → 2 → 0 ...)
			currentBufferIndex = (currentBufferIndex + 1) % 3;
			
        }
              
       


		loadIntoNextAvailableBuffer(f.fileName);
        
    } // Cierra if.filedrop
});			
	
	
	
	
	






// Crear el timer para que en init llene los buffers por primera vez
const timerInit = Engine.createTimerObject();

// Definir el callback que se ejecuta después del delay
timerInit.setTimerCallback(function() {
    // Init paints
    var bufContent1 = bufScript1.getContent();

    fft.prepare(1024, 1);
    var croppedBuffer = cropBufferToCenteredRangeArray(bufContent1[0]);
    fft.process(croppedBuffer);
    panelBuf1.repaint();
    Console.print("Buffer1: " + trace(croppedBuffer));
    
    

    var bufContent2 = bufScript2.getContent();

    fft2.prepare(1024, 1);
    var croppedBuffer2 = cropBufferToCenteredRangeArray(bufContent2[0]);
    fft2.process(croppedBuffer2);
    panelBuf2.repaint();
    Console.print("Buffer2: " + trace(croppedBuffer2));
    
    

    var bufContent3 = bufScript3.getContent();

    fft3.prepare(1024, 1);
    var croppedBuffer3 = cropBufferToCenteredRangeArray(bufContent3[0]);
    fft3.process(croppedBuffer3);
    panelBuf3.repaint();
    Console.print("Buffer3: " + trace(croppedBuffer3));

    // Parar el timer si no querés que se repita
    timerInit.stopTimer();
});

// Iniciar el timer con 1 segundo de retraso (1000 milisegundos)
timerInit.startTimer(200);








// 2d Spectrum parameters
fft.setSpectrum2DParameters({
  "FFTSize": 13,
  "DynamicRange": 100,
  "Oversampling": 4,
  "ColourScheme": 2,
  "GainFactor": 1000,
  "ResamplingQuality": "High",
  "Gamma": 5,
  "Standardize": true,
  "FrequencyGamma": 10,
  "WindowType": 4
});

var param = fft.getSpectrum2DParameters();





function onNoteOn()
{
	Message.sendToMidiOut();
}
 function onNoteOff()
{
	Message.sendToMidiOut();
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
 