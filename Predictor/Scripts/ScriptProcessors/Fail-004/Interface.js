Content.makeFrontInterface(340, 680);
// Página entrenar modelo → https://github.com/erwald/midihum

const var bypassButton = Content.getComponent("bypassButton");
const var tempoSlider = Content.getComponent("tempoSlider");


// BPM Slider
inline function ontempoSliderControl(component, value)
{
	Engine.setHostBpm(value);
};

Content.getComponent("tempoSlider").setControlCallback(ontempoSliderControl);


var feat1 = 0.634;
var feat2 = 0.634;
var feat3 = 0.634;

inline function onKnob1Control(component, value)
{
	WEIGHTS.insert(0, value);
};

Content.getComponent("Knob1").setControlCallback(onKnob1Control);



inline function onKnob2Control(component, value)
{
	WEIGHTS.insert(1, value);
};

Content.getComponent("Knob2").setControlCallback(onKnob2Control);


inline function onKnob4Control(component, value)
{
	BIAS = value;
};

Content.getComponent("Knob4").setControlCallback(onKnob4Control);


var WEIGHTS = [feat1, feat2, feat3]; // time_since_last_pressed, pitch, octave
var BIAS = 35; // Sesgo del modelo

// Variables para el estado temporal
var lastNoteTime = 0; // Tiempo de la última nota

// Función para predecir la nueva nota
function predictNewPitch(timeSinceLastPressed, pitch, octave)
{
    // Regresión lineal simple para calcular la nueva nota
    var newPitch = (timeSinceLastPressed * WEIGHTS[0]) +
                   (pitch * WEIGHTS[1]) +
                   (octave * WEIGHTS[2]) +
                   BIAS;

    // Limitar la nueva nota al rango MIDI (0-127)
    newPitch = Math.max(0, Math.min(127, Math.round(newPitch)));
    return newPitch;
}



// MIDI PLAYER
const var MIDIPlayer = Synth.getMidiPlayer("MIDIPlayer");


//References to Play and Stop buttons
const var play = Content.getComponent("play");


inline function onplayControl(component, value)
{	if(value){MIDIPlayer.play(0);}
	else{MIDIPlayer.stop(0);}
};

Content.getComponent("play").setControlCallback(onplayControl);

//I was not sure if it is necessary to include the laf...maybe not
/*
const var laf = Engine.createGlobalScriptLookAndFeel();

laf.registerFunction("drawMidiDropper", function(g, obj)
{
    if(obj.active)
        g.fillAll(obj.bgColour);
    
    if(obj.hover)
    {
        g.setColour(obj.itemColour1);
        g.drawRect(obj.area, 3);
    }
    
    g.setColour(obj.textColour);
    g.drawAlignedText(obj.text, obj.area, "centred");
});
*/

function onNoteOn()
{
	
	if (bypassButton.getValue() == 1){

	    var currentTime = Engine.getUptime(); // Tiempo actual en segundos
	    var pitch = Message.getNoteNumber(); // Nota MIDI actual
	
	    // Calcular características
	    var timeSinceLastPressed = currentTime - lastNoteTime; // Tiempo desde la última nota
	    lastNoteTime = currentTime; // Actualizar el tiempo de la última nota
	    var octave = Math.floor(pitch / 12); // Octava de la nota
		
		Console.print(octave);
		
	    // Calcular la nueva nota usando el modelo ficticio
	    var newPitch = predictNewPitch(timeSinceLastPressed, pitch, octave);
	
	    // Cambiar la nota actual por la nueva
	    Message.setNoteNumber(newPitch);
	    Console.print(newPitch);
	
	    // Debug: Imprimir las características y el resultado
	    Console.print("Pitch Original: " + pitch + ", Octave: " + octave + 
	                  ", Time Since Last: " + timeSinceLastPressed +
	                  ", New Pitch: " + newPitch);
	}                  
}function onNoteOff()
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
 