#on

#if !HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER
// If this causes an error, you need to add HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER=1
// to your ExtraDefinitions of the project and rebuild the component tree (either reload the patch)
// or click on the refresh icon in the interface designer)
Console.assertTrue(false);
#endif

Engine.loadAudioFilesIntoPool();


Content.makeFrontInterface(600, 600);

const var SimpleGain1 = Synth.getEffect("Simple Gain1");
const var SimpleGain2 = Synth.getEffect("Simple Gain2");
const var SimpleGain3 = Synth.getEffect("Simple Gain3");
const var SimpleGain4 = Synth.getEffect("Simple Gain4");
const var knobs = []; 

// Pad principal con envio de parametro automatizable
const var XYPadPnl = Content.getComponent("XYPadPnl");
XYPadPnl.set("allowCallbacks", "All Callbacks");
XYPadPnl.set("isPluginParameter", true);
XYPadPnl.set("pluginParameterName", "My Parameter");

// List all magic numbers again so we don't confuse stuff...
const var CUSTOM = 0;
const var MACRO = 1;
const var SCRIPT = 2;

// this is the index in the component list, using this method should
// always resolve it correctly
const var PANEL_PARAMETER_INDEX = Content.getAllComponents(".*").indexOf(XYPadPnl); 

const var uph = Engine.createUserPresetHandler();

// Control Callbacks para los 4 knobs
for (i = 0; i < 4; i++)
{
    knobs[i] = Content.getComponent("Knob"+(i+1));
    knobs[i].setControlCallback(XYPad);
}

inline function XYPad(component, value)
{ 
    local idx = knobs.indexOf(component);
   XYPadPnl.repaint();
};



// Mouse CB
XYPadPnl.setMouseCallback(function(event)
{
	
	
	if(event.clicked && !event.drag && !event.rightClick)
	{
		this.data.down = true;
		this.data.downValue = this.getValue();
		uph.sendParameterGesture(SCRIPT, PANEL_PARAMETER_INDEX, true);
	}
	
	if(event.mouseUp && !event.rightClick && this.data.down)
	{
		uph.sendParameterGesture(SCRIPT, PANEL_PARAMETER_INDEX, false);
		this.data.down = false;
	}

    if (event.drag)
    {
	
		// Agrega note on
		Synth.addNoteOn(1, 72, 100, 0);

		// Crea dos objetos data con el x e y
        this.data.x = Math.range(event.x / this.getWidth(), 0,  1);
        this.data.y = Math.range(event.y / this.getHeight(), 0, 1);               
        
        // Usamos xy para lo que sea
        knobs[0].setValue(1*this.data.x);
        knobs[1].setValue(1-(1*this.data.y));
        knobs[2].setValue(1*this.data.y);
        knobs[3].setValue(1-(1*this.data.x));
        knobs[0].changed();
        knobs[1].changed();
        knobs[2].changed();
        knobs[3].changed();
        this.repaint();
        
        //var nv = event.dragY / 200.0;
        //var nv = Math.range(this.data.downValue - nv, 0.0, 1.0);
        // This value es el valor que usa para enviar el isPluginParameter
        this.setValue(this.data.x);
        this.changed();
        
    }    
     else if (event.mouseUp)
    {
		// Apaga toda nota
	    Engine.allNotesOff();

    }
    Console.print("XYPadPnl value: " + XYPadPnl.getValue());
});




// Crear el timer para que en reproduccion del daw lea el valor del pad
const var xyPadTimer = Engine.createTimerObject();


xyPadTimer.setTimerCallback(function()
{
    Console.print("XYPadPnl value: " + XYPadPnl.getValue());
    
    var XYPadPnlValue = XYPadPnl.getValue();
    
    knobs[0].setValue(1*XYPadPnlValue);
    knobs[1].setValue(1-(1*XYPadPnlValue));
    knobs[2].setValue(1*XYPadPnlValue);
    knobs[3].setValue(1-(1*XYPadPnlValue));
    knobs[0].changed();
    knobs[1].changed();
    knobs[2].changed();
    knobs[3].changed();
});

// Iniciar el timer cada 100 ms
xyPadTimer.startTimer(40);






// Paint routine
XYPadPnl.setPaintRoutine(function(g){
    
    g.fillAll(Colours.black);
    
    g.setColour(Colours.red);
    //g.drawLine(0, this.getWidth(), 0, this.getHeight(), 0.5);
    //g.drawLine(0, this.getWidth(), this.getHeight(), 0, 0.5);
    
    var x = Math.range(knobs[0].getValue() / 1 * this.getWidth(), 0, this.getWidth());
    var y = this.getHeight() - Math.range(knobs[1].getValue() / 1 * this.getHeight(), 0, this.getHeight());
        
    //g.fillEllipse([x, y, 30, 30]);
    g.drawEllipse([x, y, 0, 0], 20);


    
    //g.setColour(Colours.grey);
    //g.setFont("GUI-Barlow-Medium", 14.0);
    //g.drawAlignedText(127-x, [x+2, y-140, 200, this.getHeight()], "left");
    //g.drawAlignedText(127-y, [x, y-120, 37, this.getHeight()], "right");
});




inline function onKnob1Control(component, value)
{
	   SimpleGain1.setAttribute(SimpleGain1.Gain,(1 - value)*-100);
	    
};
Content.getComponent("Knob1").setControlCallback(onKnob1Control);

inline function onKnob2Control(component, value)
{
	
	   SimpleGain2.setAttribute(SimpleGain2.Gain,(1 - value)*-100);
};
Content.getComponent("Knob2").setControlCallback(onKnob2Control);

inline function onKnob3Control(component, value)
{
	
	   SimpleGain3.setAttribute(SimpleGain3.Gain,(1 - value)*-100);
};
Content.getComponent("Knob3").setControlCallback(onKnob3Control);


inline function onKnob4Control(component, value)
{
	
	   SimpleGain4.setAttribute(SimpleGain4.Gain,(1 - value)*-100);
};
Content.getComponent("Knob4").setControlCallback(onKnob4Control);
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
 