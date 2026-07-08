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

// panel
Pad.set("allowCallbacks","All Callbacks");
Pad.set("isPluginParameter", true);
Pad.set("pluginParameterName", "PackedXY");

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
Pad.setMouseCallback(function(e)
{
  if (e.clicked && !e.drag && !e.rightClick)
  {
    this.data.down = true;
    isDrag = true;
    uph.sendParameterGesture(2, IDX, true);
  }
  if (e.mouseUp && this.data.down)
  {
    this.data.down = false;
    isDrag = false;
    uph.sendParameterGesture(2, IDX, false);
    Engine.allNotesOff();
  }
  
  if (e.clicked){
  	//Synth.addNoteOn(1, 24, 100, 0);
  	Console.print("Clicked");
  }
  
  if (e.drag)
  {
	Console.print("dragging...");
	// Logica de disparo de notas al arrastrar el mouse
	if (this.data.x != lastXPos || this.data.y != lastYPos ){
		Console.print("This X:" + this.data.x);
		Console.print("lastXPos:" + lastXPos);
		Synth.addNoteOn(1, 72, 100, 0);

		lastXPos =  this.data.x;
		lastYPos =  this.data.y;
	}
	
		
	if (e.mouseUp)
	{
		Engine.allNotesOff();
	}

    // normalizar
    this.data.x = Math.range(e.x / this.getWidth(),  0, 1);
    this.data.y = Math.range(e.y / this.getHeight(), 0, 1);

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
 