#on

#if !HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER
// If this causes an error, you need to add HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER=1
// to your ExtraDefinitions of the project and rebuild the component tree (either reload the patch)
// or click on the refresh icon in the interface designer)
Console.assertTrue(false);
#endif

Content.makeFrontInterface(1024, 680);
Engine.loadAudioFilesIntoPool();

Synth.deferCallbacks(true);

// Load Font
Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Atkinson-Hyperlegible-Regular-102.ttf", "Atkinson Hyperlegible");
Engine.setGlobalFont("Atkinson Hyperlegible");

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
var presetLabel1 = "";
var presetLabel2 = "";



// Audio recorder globals
global g_record = false; // the processBlock is waiting for this flag
global g_accumulator = []; // will be reserved for a 30sec length in prepareToPlay to prevent allocating too much in the audio thread (at least for 30sec...)


// AudioFile audioProcessor
const bufScript1 = audioProcessor.getAudioFile(0);
const bufScript2 = audioProcessor.getAudioFile(1);
const bufScript3 = audioProcessor.getAudioFile(2);
const bufScriptCurate = audioProcessor.getAudioFile(3);

// Includes
//include("Authorisation.js");
include("xypadmidi.js");
//include("audioRecorder.js");
//include("laf.js");
//include("curateAudio.js");
//include("paintRoutinePanels.js");
//include("presetBrowser.js");
//include("menuPanels.js");
//include("pluginVSstandalone.js");


// panel
Pad.set("isPluginParameter", true);
Pad.set("pluginParameterName", "PackedXY");



// Repaint panels con Preset changes
uph.setPostCallback(function(presetFile)
{

    
    fftResults = [];			    
    var bufContent1 = bufScript1.getContent();
    fft.prepare(1024, 1);
    var croppedBuffer = [];
    //croppedBuffer = bufContent1[0];
    croppedBuffer = normArray(bufContent1[0]);
    fft.process(croppedBuffer);
    panelBuf1.repaint();
    
    
    
    
    
    
    
    
	fftResults2 = [];
    var bufContent2 = bufScript2.getContent();

    fft2.prepare(1024, 1);
    var croppedBuffer2 = cropBufferToCenteredRangeArray(bufContent2[0]);
    fft2.process(croppedBuffer2);
    panelBuf2.repaint();
    Console.print("Buffer2: " + trace(croppedBuffer2));
    
});


// Devuelve un nuevo Buffer con 2 segundos centrados del buffer original
// para el FFT que no puede trabajar con audiofiles directo
// Normaliza todo el buffer recibido y devuelve un nuevo Buffer
function normArray(buffer)
{
    // declarar variables antes
    var i, audioLength, copyBuf;
    
    // 1) Obtener la longitud completa del buffer
    audioLength = buffer.length;
    
    // 2) Crear un nuevo Buffer del mismo tamaño
    copyBuf = Buffer.create(audioLength);
    
    // 3) Copiar todas las muestras
    for (i = 0; i < audioLength; i++)
    {
        copyBuf[i] = buffer[i];
    }
    
    // 4) Normalizar a 0 dB
    copyBuf.normalise(0);
    
    // 5) Devolver el buffer normalizado
    return copyBuf;
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



//########################## Arrastrar audio al panel
// Buffer actual que usa el buffer rotativo
var currentBufferIndex = 0;
var droppedFilePath;
var droppedFilePath2;



var signalFile;
var signalFile2;


const var signal;
const var signal2;


const var fft = Engine.createFFT();
const var fft2 = Engine.createFFT();


fft.setWindowType(fft.BlackmanHarris);
fft2.setWindowType(fft2.BlackmanHarris);


var fftResults = []; // Aquí vamos a guardar { offset, gain }
var fftResults2 = []; // Aquí vamos a guardar { offset, gain }







	
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
                
                droppedFilePath = f.fileName;
                
                // Setea el label de file cargado
				var labelName = FileSystem.fromAbsolutePath(droppedFilePath); 
				var textString = labelName.toString(labelName.Filename);
				var shortName = textString.substring(0, 12);
				Content.getComponent("LabelLayer1").set("text", shortName);	
                
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
                
                droppedFilePath2 = f.fileName;
                
				// Setea el label de file cargado
				var labelName = FileSystem.fromAbsolutePath(droppedFilePath2); 
				var textString = labelName.toString(labelName.Filename);
				var shortName = textString.substring(0, 12);
				Content.getComponent("LabelLayer2").set("text", shortName);	  
				              
                Console.print("Cargado en bufScript2");
                return;
            }

						        
			// Caso 2: todos llenos → reemplaza rotativamente
			var target = getBuffer(currentBufferIndex);
			target.loadFile(fileName);
			cropBufferToCenteredRange(target);
			
			fftResults = [];
			
			if (currentBufferIndex == 0)
			{
				signalFile = Engine.loadAudioFileIntoBufferArray(fileName);
				var cropped = cropBufferToCenteredRangeArray(signalFile[0]);
				fft.process(cropped);
				panelBuf1.repaint();
				
				// Setea el label de file cargado
				droppedFilePath = f.fileName;
				var labelName = FileSystem.fromAbsolutePath(droppedFilePath); 
				var textString = labelName.toString(labelName.Filename);
				var shortName = textString.substring(0, 12);
				Content.getComponent("LabelLayer1").set("text", shortName);	
								
			}
			else if (currentBufferIndex == 1)
			{
				signalFile2 = Engine.loadAudioFileIntoBufferArray(fileName);
				var cropped = cropBufferToCenteredRangeArray(signalFile2[0]);
				fft2.process(cropped);
				panelBuf2.repaint();
				
				// Setea el label de file cargado
				droppedFilePath2 = f.fileName;
				var labelName = FileSystem.fromAbsolutePath(droppedFilePath2); 
				var textString = labelName.toString(labelName.Filename);
				var shortName = textString.substring(0, 12);
				Content.getComponent("LabelLayer2").set("text", shortName);	
	
							
			}
		
			
			// Avanza el índice circularmente (0 → 1 → 2 → 0 ...)
			currentBufferIndex = (currentBufferIndex + 1) % 2;
			
			
        }

		loadIntoNextAvailableBuffer(f.fileName);
        
    } // Cierra if.filedrop
});			




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
 