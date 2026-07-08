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
var mouseX = 0;
var mouseY = 0;


// AudioFile audioProcessor
const 	bufScript1 = audioProcessor.getAudioFile(0);
const 	bufScript2 = audioProcessor.getAudioFile(1);
const 	bufScript3 = audioProcessor.getAudioFile(2);



// panel
Pad.set("isPluginParameter", true);
Pad.set("pluginParameterName", "PackedXY");

//######################## — callback DAW/UI —
inline function onPadControl(cmp, value)
{
  if (isDrag) return;

  // desempaquetar 4 dígitos:
  local raw  = Math.round(value * 9999.0);
  local Xint = Math.floor(raw / 100);
  local Yint = raw % 100;
  local x    = Xint / 100.0;
  local y    = Yint / 100.0;

  // aplicar al efecto
  FX.setAttribute(FX.Position1, x);
  FX.setAttribute(FX.Position2, y);

  // mostrar
  local xD = Math.round(x * 100.0) / 100.0;
  local yD = Math.round(y * 100.0) / 100.0;
  local pD = Math.round(value * 10000.0) / 10000.0;
  Label1.set("text",
     "Decoded → X:" + xD
   + " Y:"    + yD
   + " Pack:" + pD);
  //Pad.repaint();
}
Pad.setControlCallback(onPadControl);

//####################### — callback mouse —
Pad.setMouseCallback(function(event)
{
	
	// Para el mouse Paint Routine
	mouseX = event.x;
	mouseY = event.y;

  if (event.clicked && !event.drag && !event.rightClick)
  {
    this.data.down = true;
    isDrag = true;
    uph.sendParameterGesture(2, IDX, true);
  }
  if (event.mouseUp && this.data.down)
  {
    this.data.down = false;
    isDrag = false;
    uph.sendParameterGesture(2, IDX, false);
    Engine.allNotesOff();
  }
  
  if (event.clicked){
  	//Synth.addNoteOn(1, 24, 100, 0);
  	//Console.print("Clicked");
  }
  
  
  if (event.drag)
  {
	//Console.print("dragging...");
	// Logica de disparo de notas al arrastrar el mouse
	if (this.data.x != lastXPos || this.data.y != lastYPos ){
		//Console.print("This X:" + this.data.x);
		//Console.print("lastXPos:" + lastXPos);
		Synth.addNoteOn(1, 72, 100, 0);

		lastXPos =  this.data.x;
		lastYPos =  this.data.y;
	}


    // normalizar
    this.data.x = Math.range(event.x / this.getWidth(),  0, 1);
    this.data.y = Math.range(event.y / this.getHeight(), 0, 1);

    // empaquetar en 4 dígitos
    var Xint    = Math.floor(this.data.x * 100.0);
    var Yint    = Math.floor(this.data.y * 100.0);
    var encoded = Xint * 100 + Yint;    // 0..9999
    var normVal = encoded / 9999.0;     // [0..1]

    // enviar al DAW
    Pad.setValue(normVal);
    Pad.changed();

    // aplicar al efecto
    FX.setAttribute(FX.Position1, this.data.x);
    FX.setAttribute(FX.Position2, this.data.y);
    FX.setAttribute(FX.Position3, this.data.x);
    //FX.setAttribute(FX.Gain1, Engine.getDecibelsForGainFactor(this.data.x));
    //FX.setAttribute(FX.Gain2, Engine.getDecibelsForGainFactor(this.data.y));

    // mostrar
    var xD = Math.round(this.data.x * 100.0) / 100.0;
    var yD = Math.round(this.data.y * 100.0) / 100.0;
    var pD = Math.round(normVal * 10000.0) / 10000.0;
    Label1.set("text",
       "Pack→" + pD
     + " X:"   + xD
     + " Y:"   + yD);
    //Pad.repaint();
  } 
  
  if (event.mouseUp)
  {
  	Engine.allNotesOff();
  	Console.print("up >>> " + event.x);
  }
  
});




//########################## Arrastrar audio al panel
// Buffer actual que usa el buffer rotativo
var currentBufferIndex = 0;
var droppedFilePath = "/Users/filo/Filo/VST-Project/dsphise/Surface\ Scratcher/AudioFiles/siren1.wav";

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
        
        if (signalFile.length > 0)
        {
            fft.process(signalFile[0]);
            Pad.repaint();

        }        
        
        
        
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
                Console.print("Cargado en bufScript1");
                return;
            }
        
            if (!isBufferLoaded(bufScript2))
            {
                bufScript2.loadFile(fileName);
                cropBufferToCenteredRange(bufScript2);
                Console.print("Cargado en bufScript2");
                return;
            }
        
            if (!isBufferLoaded(bufScript3))
            {
                bufScript3.loadFile(fileName);
                cropBufferToCenteredRange(bufScript3);
                Console.print("Cargado en bufScript3");
                return;
            }
        
            // Caso 2: todos llenos → reemplaza rotativamente
            var target = getBuffer(currentBufferIndex);
            target.loadFile(fileName);
            Console.print("Reemplazado bufScript" + (currentBufferIndex + 1));
            cropBufferToCenteredRange(target);
        
            // Avanza el índice circularmente (0 → 1 → 2 → 0 ...)
            currentBufferIndex = (currentBufferIndex + 1) % 3;
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

		loadIntoNextAvailableBuffer(f.fileName);
        
    } // Cierra if.filedrop
});			
	
	
	
	
	
	
	
	
	
	
	
	
	
//################ Plot de waveforms UI

// Usar el primer canal como buffer
//var signalFile  = Engine.loadAudioFileIntoBufferArray("/Users/filo/Filo/VST-Project/dsphise/Surface\ Scratcher/AudioFiles/siren1.wav");

var signalFile  = Engine.loadAudioFileIntoBufferArray(droppedFilePath);

//var signalFile = bufScript1;

const var signal = signalFile[0];

// Create a FFT object. If you right click on it in the 
// script watch table and view the popup you'll see a spectrogram
// for the data passed in
const var fft = Engine.createFFT();

// creates a spectrogram image (required for 
// the debug popup but might be used later to draw
// on a panel. */
fft.setEnableSpectrum2D(true);

// Set the window type for the processing
fft.setWindowType(fft.BlackmanHarris);

var fftResults = []; // Aquí vamos a guardar { offset, gain }

// Give the fft a function that will be called for 
// each signal chunk. `data` will contain either a 
// buffer or an array of buffers containing the transformed
// FFT signal and offset will contain the index of the first
// sample in the chunk (here it will be 0, 1024, 2048 and 3072
// because the processing size is 1024
fft.setMagnitudeFunction(

(function(data, offset)
{
	
	var max = 0.0;

	for(s in data)
	{
		max = Math.max(max, s);
	}
	
	//Console.print("The max value at " + offset + " is " + max);
	
	fftResults.push({ offset: offset, gain: max });
	
}), false);

fft.prepare(1024, 1);


// Process the buffer with the function above.
fft.process(signal);	




Pad.setTimerCallback(function()
{
    Pad.repaint();
});
Pad.startTimer(30);

Pad.setPaintRoutine(function(g)
{
    var panelWidth  = Pad.getWidth();
    var panelHeight = Pad.getHeight();

    //g.fillAll(Colours.black);

    var cols = 90;
    var rows = 40;

    var spacingX = panelWidth / cols;
    var spacingY = panelHeight / rows;

    var maxRadius  = 20;

    // Nivel de salida general
    var levelL = Engine.getMasterPeakLevel(0);
    var levelR = Engine.getMasterPeakLevel(1);
    var outputLevel = (levelL + levelR) * 0.5;

    // Usar el último frame del FFT
    var lastFFT = fftResults.length > 0 ? fftResults[fftResults.length - 1] : { gain: 0.01 };
    var fftGain = lastFFT.gain;

    var col, row;
    for (row = 0; row < rows; row++)
    {
        for (col = 0; col < cols; col++)
        {
            var x = col * spacingX + spacingX / 2;
            var y = row * spacingY + spacingY / 2;

            var dx = x - mouseX;
            var dy = y - mouseY;
            var distance = Math.sqrt(dx * dx + dy * dy);

            var influenceRadius = 30.0;
            var t = Math.max(0.0, 0.5 - (distance / influenceRadius));

            // El tamaño base ahora depende del fftGain
            // Se escala entre 1 y 6 aprox
            var baseRadius = 2.0 + fftGain * 2.0;

            // Expansión dinámica como antes
            var dynamicRadius = t * (maxRadius - baseRadius);
            var radius = baseRadius + dynamicRadius * (0.2 + outputLevel * 10.5);

            g.setColour(Colours.withAlpha(Colours.red, t * 0.8 + 0.2));
            g.fillEllipse([x - radius, y - radius, radius * 2, radius * 2]);
        }
    }
});


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
 