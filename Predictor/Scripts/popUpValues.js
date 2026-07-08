
//Optional setting a global font
//const var GlobalFonnt = Engine.setGlobalFont("Charter");

//Put all your knobs and labels in this array (they need to be in the same order)
const var UiKnobs = [Content.getComponent("transposeKnob"), // VCO DECAY
					 Content.getComponent("veloKnob"),
					 Content.getComponent("matroVolKnob"),
					 Content.getComponent("bpmKnob")
					 ];
				   
const var UiLabels = [Content.getComponent("transposeLabel"),
					  Content.getComponent("veloLabel"),
					  Content.getComponent("metroVolLabel"),
					  Content.getComponent("bpmLabel")
					  ];






/*			
// You can load in the image using the commented out variable and for loop below
//const var filmstripImagePath = "{PROJECT_FOLDER}dial.png";
for (i = 0; i < UiKnobs.length; i++)
{
    UiKnobs[i].set("width", 49);       
    UiKnobs[i].set("height", 49); 
    UiKnobs[i].set("filmstripImage", filmstripImagePath);
    UiKnobs[i].set("numStrips", 100);  
    UiKnobs[i].set("isVertical", 0);     
    UiKnobs[i].set("scaleFactor", 0.5); 
}
*/

for (i = 0; i < UiLabels.length; i++)
{
	UiLabels[i].set("editable", false);
	UiLabels[i].set("enabled", true);
	UiLabels[i].set("textColour", 0xFF878787);
	UiLabels[i].set("fontName", "Abel");
	UiLabels[i].set("fontSize", "18");
}

const var LabelBroadcaster = Engine.createBroadcaster({
  "id": "Knob Labels",
  "args": ["component", "event"]
});

// Attach the broadcaster to component mouse events
LabelBroadcaster.attachToComponentMouseEvents(UiKnobs, "All Callbacks", "Knob & Label Mouse Listener");

// Listener for the broadcaster
LabelBroadcaster.addListener("LabelListener", "Set labels to display knob values", function(component, event)
{
    if (event.drag || event.hover)
    {
        for (i = 0; i < UiKnobs.length; i++)
        {
            if (UiKnobs[i] == component)
            {
                reg knobSuffix = UiKnobs[i].get("suffix");
                reg valueChange = Engine.doubleToString(component.getValue(),0) + knobSuffix; // The number indicates how many decimal points
                UiLabels[i].set("text", valueChange);
                break;
            }
        }
    }
    else
    {
        for (i = 0; i < UiKnobs.length; i++)
        {
            UiLabels[i].set("text", UiKnobs[i].get("text"));
        }
    }
});

// Initialize the labels with the knobs' names
for (i = 0; i < UiLabels.length; i++)
{
    UiLabels[i].set("text", UiKnobs[i].get("text"));
}