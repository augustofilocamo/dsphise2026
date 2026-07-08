const var TempoKnob = Content.getComponent("TempoKnob");
//const var playbutton = Content.getComponent("playbutton");
//const var ledPanel = Content.getComponent("ledPanel");
const var totalSteps = 8;




// BPM Slider
inline function onTempoKnobControl(component, value)
{
	Engine.setHostBpm(value);
};

Content.getComponent("TempoKnob").setControlCallback(onTempoKnobControl);



// Play Button

inline function onplaybuttonControl(component, value)
{
		if (value == 0){
			//Synth.addNoteOn(1, 36, 127, 0);
			//Synth.playNoteFromUI(1, 36, 127);
			Synth.playNoteFromUI(1, 36, 127);
					
		} else if (value == 1){
			//Synth.addNoteOff(1, 36, 0);
			Engine.allNotesOff();
			
		} 
		
};

Content.getComponent("playbutton").setControlCallback(onplaybuttonControl);



