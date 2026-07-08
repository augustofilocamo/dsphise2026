#on

#if !HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER
// If this causes an error, you need to add HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER=1
// to your ExtraDefinitions of the project and rebuild the component tree (either reload the patch)
// or click on the refresh icon in the interface designer)
Console.assertTrue(false);
#endif


Content.makeFrontInterface(600, 600);

Engine.loadAudioFilesIntoPool();


// ------------------- vars ---------------------------
const var ScriptFX1 = Synth.getEffect("Script FX1");
const var Label1 = Content.getComponent("Label1");
const var XYPadPnl = Content.getComponent("XYPadPnl");
const var CUSTOM = 0;
const var MACRO = 1;
const var SCRIPT = 2;
const var PANEL_PARAMETER_INDEX = Content.getAllComponents(".*").indexOf(XYPadPnl); 
const var uph = Engine.createUserPresetHandler();
var isDraggingXYPad = false;

// ------------ Panel setup --------------------------
XYPadPnl.set("allowCallbacks", "All Callbacks");
XYPadPnl.set("isPluginParameter", true);
XYPadPnl.set("pluginParameterName", "My Parameter");





// ----------------- CALLBACK DESDE DAW / UI -----------------
inline function onXYPadPnlControl(component, value)
{
    if (isDraggingXYPad) return; // Evita conflicto mientras arrastrás

    Console.print("Automatización recibida desde DAW o UI: " + value);

    ScriptFX1.setAttribute(ScriptFX1.Position1, value);
    Label1.set("text", "Panel value: " + value);

    XYPadPnl.repaint();
}
XYPadPnl.setControlCallback(onXYPadPnlControl);

// ----------------- CALLBACK MOUSE MANUAL -----------------
XYPadPnl.setMouseCallback(function(event)
{
	if (event.clicked && !event.drag && !event.rightClick)
	{
		this.data.down = true;
		isDraggingXYPad = true;
		uph.sendParameterGesture(SCRIPT, PANEL_PARAMETER_INDEX, true);
	}

	if (event.mouseUp && !event.rightClick && this.data.down)
	{
		this.data.down = false;
		isDraggingXYPad = false;
		uph.sendParameterGesture(SCRIPT, PANEL_PARAMETER_INDEX, false);
		Engine.allNotesOff();
	}

	if (event.drag)
	{
		Synth.addNoteOn(1, 72, 100, 0);

		this.data.x = Math.range(event.x / this.getWidth(), 0, 1);
		this.data.y = Math.range(event.y / this.getHeight(), 0, 1);               

		XYPadPnl.setValue(this.data.x);  // Actualiza parámetro automatizable
		XYPadPnl.changed();

		XYPadPnl.repaint();
		ScriptFX1.setAttribute(ScriptFX1.Position1, this.data.x);
		Label1.set("text", "Panel value: " + this.data.x);
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
 