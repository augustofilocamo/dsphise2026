
//Optional setting a global font
const var GlobalFonnt = Engine.setGlobalFont("Charter");

//Put all your knobs and labels in this array (they need to be in the same order)
const var UiKnobs = [Content.getComponent("Knob1"), // VCO DECAY
					 Content.getComponent("Knob2"), // VCO 1 CLICK
					 Content.getComponent("Knob3"), // VCO 1 FREQ
					 Content.getComponent("Knob17"), // CUTOFF
					 Content.getComponent("Knob15"), // FILTER DECAY
						Content.getComponent("Knob12"), // NOISE DECAY					 
						Content.getComponent("Knob6"), // FM MOD			 
						Content.getComponent("Knob7"), // VCO 2 CLICK	 
						Content.getComponent("Knob8"), // VCO 2 FREQ	 					 
						Content.getComponent("Knob16"), // FILTER ENV
						Content.getComponent("Knob19"), // FILTER q
						Content.getComponent("Knob14"), // VCA DECAY
						Content.getComponent("TempoKnob"), // BPM
						Content.getComponent("Knob20"), // STEPS
						Content.getComponent("Knob21"), // SHUFFLE 
						Content.getComponent("Knob5"),	// VCO 1 GAIN
						Content.getComponent("Knob10"),	// VCO 2 GAIN
						Content.getComponent("Knob13")	// NOISE GAIN
					 ];
				   
const var UiLabels = [Content.getComponent("label_vco_decay"),
					  Content.getComponent("label_vco_1_click"),
					  Content.getComponent("label_vco1_FREQ"),
					  Content.getComponent("label_cutoff"),
					  Content.getComponent("label_vcf_decay"),	
					  Content.getComponent("label_noise_decay"),
					  Content.getComponent("label_fm_amount"),	
					  Content.getComponent("label_vco2_eg_amount"),	
					  Content.getComponent("label_vco2_FREQ"),					
					  Content.getComponent("label_vcf_eg"),										  				  
					  Content.getComponent("label_vcf_Q"),
					  Content.getComponent("label_vca_decay"),
					  Content.getComponent("label_tempo"),
					  Content.getComponent("label_steps"),
					  Content.getComponent("label_shuffle"),
					  Content.getComponent("label_vco1_level"),
                      Content.getComponent("label_vco2_level"),
					  Content.getComponent("label_noise_level")
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
	UiLabels[i].set("textColour", 0xBEFFFFFF);
	UiLabels[i].set("fontName", "Abel");
	UiLabels[i].set("fontSize", "14");
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