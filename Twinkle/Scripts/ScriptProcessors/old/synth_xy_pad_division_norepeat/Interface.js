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



// — CONFIG —
var bpm = 120; // tempo
var division = "1/8T"; // opciones: "1/16", "1/8T", "1/32"

inline function getIntervalInMs(bpm, division)
{
    local beatMs = 60000 / bpm;

    if (division == "1/16")
        return beatMs / 4;
    else if (division == "1/8T")
        return beatMs / 3;
    else if (division == "1/32")
        return beatMs / 8;
    else
        return beatMs; // default negra
}

var interval = getIntervalInMs(bpm, division);


Pad.setTimerCallback(function()
{
	
	var deltaX = Math.abs(this.data.x - lastXPos);
	var deltaY = Math.abs(this.data.y - lastYPos);
	var totalDelta = deltaX + deltaY;
	
	var velocity = Math.min(127, Math.max(20, totalDelta * 5000)); // Ajustá *5 para calibrar la sensibilidad
	
	var baseNoteMelodicMinor = 60; // C4 → menor melódica en C
	var baseNoteLydian = 65; // F4 → lidia en F
	var baseNoteMajor = 60; // C4 → mayor natural en C
	
	var melodicMinorOffsets = [0, 2, 3, 5, 7, 9, 11];
	var lydianOffsets = [0, 2, 4, 6, 7, 9, 11];
	var majorOffsets = [0, 2, 4, 5, 7, 9, 11];
	
	var melodicMinorNotes = [];
	var lydianNotes = [];
	var majorNotes = [];
	
	var octave;
	var i;
	
	for (octave = 0; octave < 3; octave++)
	{
	    for (i = 0; i < melodicMinorOffsets.length; i++)
	        melodicMinorNotes.push(baseNoteMelodicMinor + melodicMinorOffsets[i] + octave * 12);
	
	    for (i = 0; i < lydianOffsets.length; i++)
	        lydianNotes.push(baseNoteLydian + lydianOffsets[i] + octave * 12);
	
	    for (i = 0; i < majorOffsets.length; i++)
	        majorNotes.push(baseNoteMajor + majorOffsets[i] + octave * 12);
	}
	
	// PARAMETRO DE DENSIDAD → ajustar para más o menos notas
	var notesDensityFactor = 1; // menor = más notas con poco movimiento / mayor = menos notas
	
	if (totalDelta > 0)
	{
	    var xPos = this.data.x;
	    var scaleNotes;
	    var scaleName;
	
	    // Seleccionar escala segun X
	    if (xPos < 0.33)
	    {
	        scaleNotes = melodicMinorNotes;
	        scaleName = "Melodic Minor (C)";
	    }
	    else if (xPos < 0.66)
	    {
	        scaleNotes = lydianNotes;
	        scaleName = "Lydian (F)";
	    }
	    else
	    {
	        scaleNotes = majorNotes;
	        scaleName = "Major (C)";
	    }
	
	    var totalNotes = scaleNotes.length;
	    var centerIndex = Math.floor(xPos * totalNotes);
	
	    if (centerIndex >= totalNotes)
	        centerIndex = totalNotes - 1;
	
	    var minIndex = centerIndex - 5;
	    var maxIndex = centerIndex + 4;
	
	    if (minIndex < 0)
	        minIndex = 0;
	    if (maxIndex >= totalNotes)
	        maxIndex = totalNotes - 1;
	
	    // CALCULAR CUANTAS NOTAS DISPARAR SEGUN VELOCIDAD
	
	    var scaledVelocity = totalDelta * notesDensityFactor;
	    var notesToPlay = Math.floor(scaledVelocity);
	
	    if (notesToPlay < 1)
	        notesToPlay = 1;
	    if (notesToPlay > 6)
	        notesToPlay = 6;
	
	    var j;
	    var lastNotePlayed = -1; // Declarar esto al inicio del script
	    for (j = 0; j < notesToPlay; j++)
	    {
	        var noteToPlay = lastNotePlayed;
	        var attempts = 0;
	        while (noteToPlay == lastNotePlayed && attempts < 10)
	        {
	            var randomIndex = Math.randInt(minIndex, maxIndex);
	            noteToPlay = scaleNotes[randomIndex];
	            attempts++;
	        }
	
	        Synth.addNoteOn(1, noteToPlay, velocity, 0);
	        lastNotePlayed = noteToPlay;
	
	        Console.print("Delta: " + totalDelta + " | Velocity: " + velocity + " | XPos: " + xPos + " | Scale: " + scaleName + " | Note: " + noteToPlay);
	    }
	
	    lastXPos = this.data.x;
	    lastYPos = this.data.y;
	}
	
	
		else
		{
		    Engine.allNotesOff();
		}
	this.stopTimer();
	//this.startTimer(Math.random()*100); // Densidad de notas por timer
	this.startTimer(interval);
	
});
Pad.startTimer(40);




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
    //Engine.allNotesOff();
  }
  if (e.drag)
  {
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
 