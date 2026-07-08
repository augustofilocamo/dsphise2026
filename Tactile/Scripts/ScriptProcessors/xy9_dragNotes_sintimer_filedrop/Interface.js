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

// AudioFile audioProcessor
const 	bufScript1 = audioProcessor.getAudioFile(0);
const 	bufScript2 = audioProcessor.getAudioFile(1);
const 	bufScript3 = audioProcessor.getAudioFile(2);



// panel
Pad.set("isPluginParameter", true);
Pad.set("pluginParameterName", "PackedXY");



// Paint de los circulos


Pad.setPaintRoutine(function(g)
{
    g.fillAll(Colours.black); // Fondo si querés

	g.beginLayer(true);
		    // Dibuja el círculo
		    g.setColour(Colours.aquamarine);
		    var radius = 30;
		    var centerX = Pad.getWidth() / 2;
		    var centerY = Pad.getHeight() / 2;
		    g.fillEllipse([centerX - radius, centerY - radius, radius * 2, radius * 2]);
	g.gaussianBlur(2600);    
	g.endLayer();  
    
	// Texto blanco debajo del círculo
    g.setColour(Colours.grey);
    g.setFont("Tufy", 16);
    g.drawAlignedText("song 4.wav", [0, centerY + radius + 10, Pad.getWidth(), 30], "centred");  
    

    
});	

// — callback DAW/UI —
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
  Pad.repaint();
}
Pad.setControlCallback(onPadControl);

// — callback mouse —
Pad.setMouseCallback(function(event)
{
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
    Pad.repaint();
  } 
  
  if (event.mouseUp)
  {
  	Engine.allNotesOff();
  	Console.print("up >>> " + event.x);
  }
  
});




// Arrastrar audio al panel

// Buffer actual que usa el buffer rotativo
var currentBufferIndex = 0;

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
                Console.print("Cargado en bufScript1");
                cropBufferToCenteredRange(bufScript1);
                
                return;
            }
        
            if (!isBufferLoaded(bufScript2))
            {
                bufScript2.loadFile(fileName);
                Console.print("Cargado en bufScript2");
                cropBufferToCenteredRange(bufScript2);
                return;
            }
        
            if (!isBufferLoaded(bufScript3))
            {
                bufScript3.loadFile(fileName);
                Console.print("Cargado en bufScript3");
                cropBufferToCenteredRange(bufScript3);
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
 