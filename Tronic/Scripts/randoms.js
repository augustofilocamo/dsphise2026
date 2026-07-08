const var SliderPack1 = Content.getComponent("SliderPack1");
const var MagicButton = Content.getComponent("MagicButton");
const var hitButton = Content.getComponent("ScriptButton1");
const var raveButton = Content.getComponent("ScriptButton2");
const var synthButton = Content.getComponent("ScriptButton3");

MagicButton.setValue(1);
Content.getComponent("ScriptButton1").setValue(0);
Content.getComponent("ScriptButton2").setValue(1);
Content.getComponent("ScriptButton3").setValue(1);

// Funcion 80% rand

inline function rand80(valor1, valor2) {
    return Math.random() < 0.8 ? valor1 : valor2;
}

// Prende uno apagan dos
inline function onScriptButton1Control(component, value)
{
	if (!value){
		Content.getComponent("ScriptButton1").setValue(0);
		Content.getComponent("ScriptButton2").setValue(1);
		Content.getComponent("ScriptButton3").setValue(1);		
	} else {
		Content.getComponent("ScriptButton1").setValue(0);
	}

};

Content.getComponent("ScriptButton1").setControlCallback(onScriptButton1Control);



inline function onScriptButton2Control(component, value)
{
	if (!value){
		Content.getComponent("ScriptButton1").setValue(1);
		Content.getComponent("ScriptButton2").setValue(0);
		Content.getComponent("ScriptButton3").setValue(1);		
	} else {
		Content.getComponent("ScriptButton2").setValue(0);
	}
};

Content.getComponent("ScriptButton2").setControlCallback(onScriptButton2Control);


inline function onScriptButton3Control(component, value)
{
	if (!value){
		Content.getComponent("ScriptButton1").setValue(1);
		Content.getComponent("ScriptButton2").setValue(1);
		Content.getComponent("ScriptButton3").setValue(0);		
	} else {
		Content.getComponent("ScriptButton3").setValue(1);
		Content.getComponent("ScriptButton3").setValue(0);
	}
};

Content.getComponent("ScriptButton3").setControlCallback(onScriptButton3Control);



//Boton de stop

inline function onStopMagicButtonControl(component, value)
{
	Engine.allNotesOff();
	playbutton.setValue(1);
};

Content.getComponent("StopMagicButton").setControlCallback(onStopMagicButtonControl);


inline function onEditMagicButtonControl(component, value)
{
    beatPanel.showControl(false);
    beatButton.setValue(false);
};

Content.getComponent("EditMagicButton").setControlCallback(onEditMagicButtonControl);


// Boton de generate

inline function onMagicButtonControl(component, value)
{
	MagicButton.setValue(1);
	playbutton.setValue(0);
	
		if (value == 0){
			//Synth.addNoteOn(1, 36, 127, 0);
			//Synth.playNoteFromUI(1, 36, 127);
			Synth.playNoteFromUI(1, 36, 127);
					
		} else if (value == 1){
			//Synth.addNoteOff(1, 36, 0);
			Engine.allNotesOff();
		} 
		
	// GENERATORS
	

	
		// HIT MAKER
		if (hitButton.getValue() == 0){
			
			// Todos los botones a cero
			for (i=1; i < 39; i++){
				Content.getComponent("Button" + i).setValue(0);
				Content.getComponent("Button" + i).changed();
			}
	
		
			
			Console.print("HIT MAKER");
				
			Content.getComponent("Knob1").setValue(Math.random()*0.4+0.2);
			Content.getComponent("Knob1").changed();
			Content.getComponent("Knob2").setValue(Math.random()*140+190);
			Content.getComponent("Knob2").changed();
			Content.getComponent("Knob3").setValue(Math.random()*40+20);
			Content.getComponent("Knob3").changed();
			Content.getComponent("Knob5").setValue(Math.random()*-10);
			Content.getComponent("Knob5").changed();
			Content.getComponent("Knob10").setValue(Math.random()*-2);
			Content.getComponent("Knob10").changed();
			Content.getComponent("Knob11").setValue(0);
			Content.getComponent("Knob11").changed();		
			Content.getComponent("Knob12").setValue(Math.random()*1.5+0.5);
			Content.getComponent("Knob12").changed();
			Content.getComponent("Knob13").setValue((Math.random()*-70)-6);
			Content.getComponent("Knob13").changed();
			Content.getComponent("Knob14").setValue(Math.random()*8+2);
			Content.getComponent("Knob14").changed();
			Content.getComponent("Knob6").setValue(0);
			Content.getComponent("Knob6").changed();
			Content.getComponent("Knob7").setValue(Math.random()*120+90);
			Content.getComponent("Knob7").changed();
			Content.getComponent("Knob4").setValue(0);
			Content.getComponent("Knob4").changed();
			Content.getComponent("Knob4").changed();
			Content.getComponent("Knob9").setValue(Math.randInt(0,2));
			Content.getComponent("Knob9").changed();
			Content.getComponent("Knob9").changed();
			Content.getComponent("Knob8").setValue(Math.random()*40+20);
			Content.getComponent("Knob8").changed();
			Content.getComponent("Knob15").setValue(Math.random()*1+1);
			Content.getComponent("Knob15").changed();
			//Content.getComponent("Knob17").setValue(Math.random()*0.3+0.7);
			//Content.getComponent("Knob17").changed();
			Content.getComponent("Knob19").setValue(Math.random()*1);
			Content.getComponent("Knob19").changed();
			Content.getComponent("Knob20").setValue(Math.randInt(1,3)*8);
			Content.getComponent("Knob20").changed();
			Content.getComponent("Knob21").setValue(Math.random());
			Content.getComponent("Knob21").changed();
			
			// Buttons cables
			
	
			Content.getComponent("Button14").setValue(Math.randInt(0,2));
			Content.getComponent("Button14").changed();
			Content.getComponent("Button30").setValue(Math.randInt(0,2));
			Content.getComponent("Button30").changed();
			Content.getComponent("Button31").setValue(Math.randInt(0,2));
			Content.getComponent("Button31").changed();
			Content.getComponent("Button23").setValue(Math.randInt(0,2));
			Content.getComponent("Button23").changed();
			Content.getComponent("Button24").setValue(Math.randInt(0,2));
			Content.getComponent("Button24").changed();
			Content.getComponent("Button25").setValue(Math.randInt(0,2));
			Content.getComponent("Button25").changed();
			Content.getComponent("Button26").setValue(Math.randInt(0,2));
			Content.getComponent("Button26").changed();
			
			local i = 0;
			local beat1 = 4;
			local beat2 = 3;
			for (i=0; i < 16; i++){
				
				if (i % beat1 == 0){
					SliderPack3.setSliderAtIndex(i, Math.random()*4+120);	
					SliderPack3.changed();
					SliderPack1.setSliderAtIndex(i, (Math.random()*4)-24);
					SliderPack1.changed();
				} else if (i % beat2 === 0 && i % beat1 !== 0) {
					SliderPack3.setSliderAtIndex(i, Math.random()*77);	
					SliderPack3.changed();
					SliderPack1.setSliderAtIndex(i, (Math.random()*48)-24);
					SliderPack1.changed();
				} else {
					SliderPack3.setSliderAtIndex(i, Math.random()*0);	
					SliderPack3.changed();
					SliderPack1.setSliderAtIndex(i, (Math.random()*24)-24);
					SliderPack1.changed();
				}
	
				
			}
			
	//		raveButton.setValue(1);
	//		synthButton.setValue(1);
			
		}
		
		// RAVE MASTER
		if (raveButton.getValue() == 0){
			
		Console.print("RAVE MASTER");
		
		// Todos los botones a cero
		for (i=1; i < 39; i++){
			Content.getComponent("Button" + i).setValue(0);
			Content.getComponent("Button" + i).changed();
		}
				
				Content.getComponent("Knob1").setValue(Math.random()*0.4+0.2);
				Content.getComponent("Knob1").changed();
				Content.getComponent("Knob2").setValue(Math.random()*140+90);
				Content.getComponent("Knob2").changed();
				Content.getComponent("Knob3").setValue(Math.random()*20);
				Content.getComponent("Knob3").changed();
				Content.getComponent("Knob5").setValue(Math.random()*0);
				Content.getComponent("Knob5").changed();
				Content.getComponent("Knob10").setValue(Math.random()*-2);
				Content.getComponent("Knob10").changed();
				Content.getComponent("Knob11").setValue(0);
				Content.getComponent("Knob11").changed();
				Content.getComponent("Knob12").setValue(Math.random()*1.5+0.5);
				Content.getComponent("Knob12").changed();
				Content.getComponent("Knob13").setValue((Math.random()*-70)-6);
				Content.getComponent("Knob13").changed();
				Content.getComponent("Knob14").setValue(Math.random()*8+2);
				Content.getComponent("Knob14").changed();
				Content.getComponent("Knob6").setValue(0);
				Content.getComponent("Knob6").changed();
				Content.getComponent("Knob7").setValue(Math.random()*120+90);
				Content.getComponent("Knob7").changed();
				Content.getComponent("Knob4").setValue(0);
				Content.getComponent("Knob4").changed();
				Content.getComponent("Knob4").changed();
				Content.getComponent("Knob9").setValue(Math.randInt(0,2));
				Content.getComponent("Knob9").changed();
				Content.getComponent("Knob9").changed();
				Content.getComponent("Knob8").setValue(Math.random()*20);
				Content.getComponent("Knob8").changed();
				Content.getComponent("Knob15").setValue(Math.random()*4+1);
				Content.getComponent("Knob15").changed();
				//Content.getComponent("Knob17").setValue(Math.random()*0.3+0.7);
				//Content.getComponent("Knob17").changed();
				Content.getComponent("Knob19").setValue(Math.random()*1);
				Content.getComponent("Knob19").changed();
				Content.getComponent("Knob20").setValue(Math.randInt(1,3)*8);
				Content.getComponent("Knob20").changed();
				Content.getComponent("Knob21").setValue(Math.random());
				Content.getComponent("Knob21").changed();
	
				
				// Buttons cables
				
		
				Content.getComponent("Button14").setValue(Math.randInt(0,2));
				Content.getComponent("Button14").changed();
				Content.getComponent("Button30").setValue(Math.randInt(0,2));
				Content.getComponent("Button30").changed();
				Content.getComponent("Button31").setValue(Math.randInt(0,2));
				Content.getComponent("Button31").changed();
				Content.getComponent("Button23").setValue(Math.randInt(0,2));
				Content.getComponent("Button23").changed();
				Content.getComponent("Button24").setValue(Math.randInt(0,2));
				Content.getComponent("Button24").changed();
				Content.getComponent("Button25").setValue(Math.randInt(0,2));
				Content.getComponent("Button25").changed();
				Content.getComponent("Button26").setValue(Math.randInt(0,2));
				Content.getComponent("Button26").changed();
				Content.getComponent("Button11").setValue(0);
				Content.getComponent("Button11").changed();
				
	
				Content.getComponent("Button18").setValue(Math.randInt(0,2));
				Content.getComponent("Button18").changed();
				Content.getComponent("Button8").setValue(Math.randInt(0,2));
				Content.getComponent("Button8").changed();
							
				Content.getComponent("Button12").setValue(Math.randInt(0,2));
				Content.getComponent("Button12").changed();
					if (Content.getComponent("Button12").getValue() == 1){
						Content.getComponent("Knob10").setValue(-25);
						Content.getComponent("Knob10").changed();
						Content.getComponent("Button6").setValue(1);
						Content.getComponent("Button6").changed();
						Content.getComponent("Button8").setValue(0);
						Content.getComponent("Button8").changed();
					} else{
						Content.getComponent("Knob10").setValue(-6);
						Content.getComponent("Knob10").changed();
						Content.getComponent("Button6").setValue(0);
						Content.getComponent("Button6").changed();
					}
	
	
	
	
				
				local i = 0;
				for (i=0; i < 16; i++){
					
					if (i % 4 == 0){
						SliderPack3.setSliderAtIndex(i, Math.random()*47+80);	
						SliderPack3.changed();
						SliderPack1.setSliderAtIndex(i, (Math.random()*4)-24);
						SliderPack1.changed();
					} else if (i % 2 === 0 && i % 4 !== 0) {
						SliderPack3.setSliderAtIndex(i, Math.random()*77);	
						SliderPack3.changed();
						SliderPack1.setSliderAtIndex(i, (Math.random()*48)-24);
						SliderPack1.changed();
					} else {
						SliderPack3.setSliderAtIndex(i, Math.random()*10);	
						SliderPack3.changed();
						SliderPack1.setSliderAtIndex(i, (Math.random()*48)-24);
						SliderPack1.changed();
					}
					
			
					
	
			
				
			}
					
	//		hitButton.setValue(1);
	//		synthButton.setValue(1);
			
		}
	
		// SYNTH HERO
		if (synthButton.getValue() == 0){
			
			// Todos los botones a cero
			for (i=1; i < 39; i++){
				Content.getComponent("Button" + i).setValue(0);
				Content.getComponent("Button" + i).changed();
			}
	
		
			
			Console.print("SYNT HERO");
				
			Content.getComponent("Knob1").setValue(Math.random()*0.1+0.1);
			Content.getComponent("Knob1").changed();
			Content.getComponent("Knob2").setValue(Math.random()*5+1);
			Content.getComponent("Knob2").changed();
			Content.getComponent("Knob3").setValue(0);
			Content.getComponent("Knob3").changed();
			Content.getComponent("Knob5").setValue(Math.random()*-10);
			Content.getComponent("Knob5").changed();
			Content.getComponent("Knob12").setValue(Math.random()*1.5+0.5);
			Content.getComponent("Knob12").changed();
			Content.getComponent("Knob13").setValue((Math.random()*-70)-6);
			Content.getComponent("Knob13").changed();
			Content.getComponent("Knob14").setValue(Math.random()*1+2);
			Content.getComponent("Knob14").changed();
			Content.getComponent("Knob6").setValue(0);
			Content.getComponent("Knob6").changed();
			Content.getComponent("Knob7").setValue(Math.random()*20+10);
			Content.getComponent("Knob7").changed();
			Content.getComponent("Knob4").setValue(Math.randInt(0,2));
			Content.getComponent("Knob4").changed();
			Content.getComponent("Knob11").setValue(Math.randInt(0,2));
			Content.getComponent("Knob11").changed();
			Content.getComponent("Knob9").setValue(Math.randInt(0,2));
			Content.getComponent("Knob9").changed();
			Content.getComponent("Knob8").setValue(0);
			Content.getComponent("Knob8").changed();
			Content.getComponent("Knob15").setValue(rand80(1, 5));
			Content.getComponent("Knob15").changed();
			Content.getComponent("Knob19").setValue(Math.random()*1);
			Content.getComponent("Knob19").changed();
			Content.getComponent("Knob20").setValue(Math.randInt(1,3)*8);
			Content.getComponent("Knob20").changed();
			Content.getComponent("Knob21").setValue(Math.random());
			Content.getComponent("Knob21").changed();
			
			// Buttons cables
			
	
			Content.getComponent("Button14").setValue(Math.randInt(0,2));
			Content.getComponent("Button14").changed();
			Content.getComponent("Button30").setValue(0);
			Content.getComponent("Button30").changed();
			//Content.getComponent("Button31").setValue(Math.randInt(0,2));
			//Content.getComponent("Button31").changed();
			Content.getComponent("Button23").setValue(Math.randInt(0,2));
			Content.getComponent("Button23").changed();
			Content.getComponent("Button24").setValue(Math.randInt(0,2));
			Content.getComponent("Button24").changed();
			Content.getComponent("Button25").setValue(Math.randInt(0,2));
			Content.getComponent("Button25").changed();
			Content.getComponent("Button26").setValue(Math.randInt(0,2));
			Content.getComponent("Button26").changed();
			Content.getComponent("Button12").setValue(Math.randInt(0,2));
			Content.getComponent("Button12").changed();
	
			if (Content.getComponent("Knob11").getValue() == 1){
				
				Content.getComponent("Knob8").setValue(Math.random()*1000+10);
				Content.getComponent("Knob8").changed();
				Content.getComponent("Knob3").setValue(Math.random()*20+30);
				Content.getComponent("Knob3").changed();
				
			}
	
				if (Content.getComponent("Button12").getValue() == 1){
					Console.print(Content.getComponent("Button12").getValue() + "<<<<<<<<<<");
				
					Content.getComponent("Knob10").setValue(-10);
					Content.getComponent("Knob10").changed();
					Content.getComponent("Button6").setValue(1);
					Content.getComponent("Button6").changed();
					Content.getComponent("Knob15").setValue(Math.random()*5+0.5);
					Content.getComponent("Knob15").changed();
				} else{
					Content.getComponent("Knob10").setValue(-2);
					Content.getComponent("Knob10").changed();
					Content.getComponent("Button6").setValue(0);
					Content.getComponent("Button6").changed();
				}
			
			
			local i = 0;
			local beat1Rand = [4, 8];
			local beat2Rand = [2, 3];
			local beat1 = 4;
			local beat2 = 3;
			local notes = [-12, -5, 7, 0];
			for (i=0; i < 16; i++){
				
				if (i % beat1 == 0){
					SliderPack3.setSliderAtIndex(i, Math.random()*4+120);	
					SliderPack3.changed();
					SliderPack1.setSliderAtIndex(i, notes[Math.randInt(0, 4)]);
					SliderPack1.changed();
				} else if (i % beat2 == 0 && i % beat1 !== 0) {
					SliderPack3.setSliderAtIndex(i, Math.random()*77);	
					SliderPack3.changed();
					SliderPack1.setSliderAtIndex(i, notes[Math.randInt(0, 4)]);
					SliderPack1.changed();
				} else {
					SliderPack3.setSliderAtIndex(i, Math.random()*10);	
					SliderPack3.changed();
					SliderPack1.setSliderAtIndex(i, notes[Math.randInt(0, 4)]);
					SliderPack1.changed();
				}
	
				
			}
			
	
			
		}

};

Content.getComponent("MagicButton").setControlCallback(onMagicButtonControl);
