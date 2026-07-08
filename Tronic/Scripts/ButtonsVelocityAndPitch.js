const var HardcodedMasterFX1 = Synth.getEffect("Hardcoded Polyphonic FX1"); 
const var HardcodedMasterFX2 = Synth.getEffect("HardcodedMasterFX3"); 
const var scriptProcessor1 = Synth.getMidiProcessor("Script Processor1");

// Array para guardar los items
const var buttonsArray = [];		// Botones
const var knobsArray = [];			// Knobs
const var storedValueArray = [];	// Ultimos valores de los knobs
storedValueArray.reserve(19);

// Use a for loop to store all button references in the 'buttonsArray'
for (i = 1; i <= 38; i++)
{	
    var buttonName = "Button" + i;
    buttonsArray.push(Content.getComponent(buttonName));
    //Console.print(buttonName);
}

// Use a for loop to store all button references in the 'knobsArray'
for (i = 1; i <= 19; i++)
{
    var knobName = "Knob" + i;
    knobsArray.push(Content.getComponent(knobName));
    Content.getComponent(knobName).changed(); // Actualizar valores en los HardcodedFX
    //Console.print(knobName);
}

// Valores del los knobs del Harcoded FX 1

var knobsValues_vco = HardcodedMasterFX1.getNumAttributes();

for (i = 0; i < knobsValues_vco; i++)
{
	// Obtiene el valor de cada atributo
	var attributeValue_vco = HardcodedMasterFX1.getAttribute(i);
	
	// Añade el valor al array
	storedValueArray.push(attributeValue_vco);
	
	Console.print(storedValueArray[i]);
}


// Valores del los knobs del Harcoded FX 2

var knobsValues_vcf = HardcodedMasterFX2.getNumAttributes();

for (i = 0; i < knobsValues_vcf; i++)
{
	// Obtiene el valor de cada atributo
	var attributeValue_vcf = HardcodedMasterFX2.getAttribute(i);
	
	// Añade el valor al array
	storedValueArray.push(attributeValue_vcf);
	
	//Console.print(storedValueArray[i]);
}

// variable para guardar ultimo valor del knob 
//global storedValue = 0; SE PUEDE BORRAR ESTO

/* ----------------- Vco 1 Decay ----------------- */

// Vco1_Decay Velocity
inline function onButton1Control(component, value)
{	
	if (value){
	// Si el botón del pitch esta apagado, almacená el último valor del Knob 
		if (buttonsArray[1].getValue() == 0){
			storedValueArray[0] = HardcodedMasterFX1.getAttribute(0);
			//Console.print(storedValueArray[0]);
		}
	// Deshabilitar el knob	
		Content.getComponent("Knob1").set("enabled",false);
			
	// Apagá el botón del pitch	
		buttonsArray[1].setValue(0);
		
	// En ""Script Procesor1"", Prender el boton de velocity y apagar el de pitch
		scriptProcessor1.setAttribute(scriptProcessor1.Button1,1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button2,0);
	}				
	if (buttonsArray[0].getValue() == 0 && buttonsArray[1].getValue() == 0){
	/* Si ambos botones están apagados, asigná el valor almacenado al prender la matriz a los knobs de la interfaz y del Hardcoded Fx*/
		knobsArray[0] = storedValueArray[0];
		Content.getComponent("Knob1").changed();
		Content.getComponent("Knob1").set("enabled", true);
		//Console.print(knobsArray[0]);
		//Console.print(HardcodedMasterFX1.getAttribute(0));
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button1, 0);
	}
};
buttonsArray[0].setControlCallback(onButton1Control);

// Vco1_Decay Pitch
inline function onButton2Control(component, value)
{
	if (value){
		if (buttonsArray[0].getValue() == 0){
			storedValueArray[0] = HardcodedMasterFX1.getAttribute(0);
		}
		Content.getComponent("Knob1").set("enabled",false);	
		buttonsArray[0].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button1,0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button2,1);
	}
				
	if (buttonsArray[0].getValue() == 0 && buttonsArray[1].getValue() == 0){
		Content.getComponent("Knob1").set("enabled", true);
		knobsArray[0] = storedValueArray[0];
		Content.getComponent("Knob1").changed();		
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button2, 0);
	}
};

buttonsArray[1].setControlCallback(onButton2Control);

/* ----------------- VCO 1 EG Amount ----------------- */

// Velocity
inline function onButton3Control(component, value)
{	
	if (value){
		if (buttonsArray[3].getValue() == 0){
			storedValueArray[1] = HardcodedMasterFX1.getAttribute(1);
		}
		Content.getComponent("Knob2").set("enabled",false);	
		buttonsArray[3].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button3,1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button4,0);
	}				
	if (buttonsArray[2].getValue() == 0 && buttonsArray[3].getValue() == 0){
		knobsArray[1] = storedValueArray[1];
		Content.getComponent("Knob2").changed();
		Content.getComponent("Knob2").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button3, 0);
	}
};
buttonsArray[2].setControlCallback(onButton3Control);

// Pitch
inline function onButton4Control(component, value)
{
	if (value){
		if (buttonsArray[2].getValue() == 0){
			storedValueArray[1] = HardcodedMasterFX1.getAttribute(1);
		}
				
		Content.getComponent("Knob2").set("enabled",false);
			
		buttonsArray[2].setValue(0);
		
		scriptProcessor1.setAttribute(scriptProcessor1.Button3,0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button4,1);
	}
				
	if (buttonsArray[2].getValue() == 0 && buttonsArray[3].getValue() == 0){
		knobsArray[1] = storedValueArray[1];
		Content.getComponent("Knob2").changed();
		Content.getComponent("Knob2").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button4, 0);
	}
};

buttonsArray[3].setControlCallback(onButton4Control);

/* ----------------- VCO 1 Freq ----------------- */

// Velocity
inline function onButton5Control(component, value)
{	
	if (value){
		if (buttonsArray[5].getValue() == 0){
			storedValueArray[2] = HardcodedMasterFX1.getAttribute(2);
		}
		Content.getComponent("Knob3").set("enabled",false);
		buttonsArray[5].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button5, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button6, 0);
	}				
	if (buttonsArray[4].getValue() == 0 && buttonsArray[5].getValue() == 0){
		knobsArray[2] = storedValueArray[2];
		Content.getComponent("Knob3").changed();
		Content.getComponent("Knob3").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button5, 0);
	}
};
buttonsArray[4].setControlCallback(onButton5Control);

// Pitch
inline function onButton6Control(component, value)
{
	if (value){
		if (buttonsArray[4].getValue() == 0){
			storedValueArray[2] = HardcodedMasterFX1.getAttribute(2);
		}		
		Content.getComponent("Knob3").set("enabled",false);	
		buttonsArray[4].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button5,0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button6,1);
	}
				
	if (buttonsArray[4].getValue() == 0 && buttonsArray[5].getValue() == 0){
		knobsArray[2] = storedValueArray[2];
		Content.getComponent("Knob3").changed();
		Content.getComponent("Knob3").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button6, 0);
	}
};

buttonsArray[5].setControlCallback(onButton6Control);

/* ----------------- VCO 1 Waveform ----------------- */

// Velocity
inline function onButton7Control(component, value)
{	
	if (value){ 
		if (buttonsArray[7].getValue() == 0){
			storedValueArray[3] = HardcodedMasterFX1.getAttribute(3);
		}	
		Content.getComponent("Knob4").set("enabled",false);
		buttonsArray[7].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button7,1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button8,0);
	}				
	if (buttonsArray[6].getValue() == 0 && buttonsArray[7].getValue() == 0){
		knobsArray[3] = storedValueArray[3];
		Content.getComponent("Knob4").changed();
		Content.getComponent("Knob4").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button7, 0);
	}
};
buttonsArray[6].setControlCallback(onButton7Control);

// Pitch
inline function onButton8Control(component, value)
{
	if (value){
		if (buttonsArray[6].getValue() == 0){
			storedValueArray[3] = HardcodedMasterFX1.getAttribute(3);
		}
		Content.getComponent("Knob4").set("enabled",false);
		buttonsArray[6].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button7,0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button8,1);
	}			
	if (buttonsArray[6].getValue() == 0 && buttonsArray[7].getValue() == 0){
		knobsArray[3] = storedValueArray[3];
		Content.getComponent("Knob4").changed();
		Content.getComponent("Knob4").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button8, 0);
	}
};
buttonsArray[7].setControlCallback(onButton8Control);

/* ----------------- VCO 1 Gain ----------------- */

// Velocity
inline function onButton9Control(component, value)
{	
	if (value){ 
		if (buttonsArray[9].getValue() == 0){
			storedValueArray[4] = HardcodedMasterFX1.getAttribute(4);
		}	
		Content.getComponent("Knob5").set("enabled",false);
		buttonsArray[9].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button9, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button10, 0);
	}				
	if (buttonsArray[8].getValue() == 0 && buttonsArray[9].getValue() == 0){
		knobsArray[4] = storedValueArray[4];
		Content.getComponent("Knob5").changed();
		Content.getComponent("Knob5").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button9, 0);
	}
};
buttonsArray[8].setControlCallback(onButton9Control);

// Pitch
inline function onButton10Control(component, value)
{
	if (value){
		if (buttonsArray[8].getValue() == 0){
			storedValueArray[4] = HardcodedMasterFX1.getAttribute(4);
		}
		Content.getComponent("Knob5").set("enabled",false);
		buttonsArray[8].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button9, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button10, 1);
	}			
	if (buttonsArray[8].getValue() == 0 && buttonsArray[9].getValue() == 0){
		knobsArray[4] = storedValueArray[4];
		Content.getComponent("Knob5").changed();
		Content.getComponent("Knob5").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button10, 0);
	}
};
buttonsArray[9].setControlCallback(onButton10Control);

/* ----------------- FM Amount ----------------- */

// Velocity
inline function onButton11Control(component, value)
{	
	if (value){ 
		if (buttonsArray[11].getValue() == 0){
			storedValueArray[5] = HardcodedMasterFX1.getAttribute(5);
		}	
		Content.getComponent("Knob6").set("enabled",false);
		buttonsArray[11].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button11, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button12, 0);
	}				
	if (buttonsArray[10].getValue() == 0 && buttonsArray[11].getValue() == 0){
		knobsArray[5] = storedValueArray[5];
		Content.getComponent("Knob6").changed();
		Content.getComponent("Knob6").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button11, 0);
	}
};
buttonsArray[10].setControlCallback(onButton11Control);

// Pitch
inline function onButton12Control(component, value)
{
	if (value){
		if (buttonsArray[10].getValue() == 0){
			storedValueArray[5] = HardcodedMasterFX1.getAttribute(5);
		}
		Content.getComponent("Knob6").set("enabled",false);
		buttonsArray[10].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button11, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button12, 1);
	}			
	if (buttonsArray[10].getValue() == 0 && buttonsArray[11].getValue() == 0){
		knobsArray[5] = storedValueArray[5];
		Content.getComponent("Knob6").changed();
		Content.getComponent("Knob6").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button12, 0);
	}
};
buttonsArray[11].setControlCallback(onButton12Control);

/* ----------------- VCO 2 Eg Amount ----------------- */

// Velocity
inline function onButton13Control(component, value)
{	
	if (value){ 
		if (buttonsArray[13].getValue() == 0){
			storedValueArray[6] = HardcodedMasterFX1.getAttribute(6);
		}	
		Content.getComponent("Knob7").set("enabled",false);
		buttonsArray[13].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button13, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button14, 0);
	}				
	if (buttonsArray[12].getValue() == 0 && buttonsArray[13].getValue() == 0){
		knobsArray[6] = storedValueArray[6];
		Content.getComponent("Knob7").changed();
		Content.getComponent("Knob7").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button13, 0);
	}
};
buttonsArray[12].setControlCallback(onButton13Control);

// Pitch
inline function onButton14Control(component, value)
{
	if (value){
		if (buttonsArray[12].getValue() == 0){
			storedValueArray[6] = HardcodedMasterFX1.getAttribute(6);
		}
		Content.getComponent("Knob7").set("enabled",false);
		buttonsArray[12].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button13, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button14, 1);
	}			
	if (buttonsArray[12].getValue() == 0 && buttonsArray[13].getValue() == 0){
		knobsArray[6] = storedValueArray[6];
		Content.getComponent("Knob7").changed();
		Content.getComponent("Knob7").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button14, 0);
	}
};
buttonsArray[13].setControlCallback(onButton14Control);

/* ----------------- VCO 2 Freq ----------------- */

// Velocity
inline function onButton15Control(component, value)
{	
	if (value){ 
		if (buttonsArray[15].getValue() == 0){
			storedValueArray[7] = HardcodedMasterFX1.getAttribute(7);
		}		
		Content.getComponent("Knob8").set("enabled",false);
		buttonsArray[15].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button15, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button16, 0);
	}				
	if (buttonsArray[14].getValue() == 0 && buttonsArray[15].getValue() == 0){
		knobsArray[7] = storedValueArray[7];
		Content.getComponent("Knob8").changed();
		Content.getComponent("Knob8").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button15, 0);
	}
};
buttonsArray[14].setControlCallback(onButton15Control);

// Pitch
inline function onButton16Control(component, value)
{
	if (value){
		if (buttonsArray[14].getValue() == 0){
			storedValueArray[7] = HardcodedMasterFX1.getAttribute(7);
		}
		Content.getComponent("Knob8").set("enabled",false);
		buttonsArray[14].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button15, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button16, 1);
	}			
	if (buttonsArray[14].getValue() == 0 && buttonsArray[15].getValue() == 0){
		knobsArray[7] = storedValueArray[7];
		Content.getComponent("Knob8").changed();
		Content.getComponent("Knob8").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button16, 0);
	}
};
buttonsArray[15].setControlCallback(onButton16Control);

/* ----------------- VCO 2 Waveform ----------------- */

// Velocity
inline function onButton17Control(component, value)
{	
	if (value){ 
		if (buttonsArray[17].getValue() == 0){
			storedValueArray[8] = HardcodedMasterFX1.getAttribute(8);
		}
		Content.getComponent("Knob9").set("enabled",false);
		buttonsArray[17].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button17, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button18, 0);
	}				
	if (buttonsArray[16].getValue() == 0 && buttonsArray[17].getValue() == 0){
		knobsArray[8] = storedValueArray[8];
		Content.getComponent("Knob9").changed();
		Content.getComponent("Knob9").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button17, 0);
	}
};
buttonsArray[16].setControlCallback(onButton17Control);

// Pitch
inline function onButton18Control(component, value)
{
	if (value){
		if (buttonsArray[16].getValue() == 0){
			storedValueArray[8] = HardcodedMasterFX1.getAttribute(8);
		}
		Content.getComponent("Knob9").set("enabled",false);
		buttonsArray[16].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button17, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button18, 1);
	}			
	if (buttonsArray[16].getValue() == 0 && buttonsArray[17].getValue() == 0){
		knobsArray[8] = storedValueArray[8];
		Content.getComponent("Knob9").changed();
		Content.getComponent("Knob9").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button18, 0);
	}
};
buttonsArray[17].setControlCallback(onButton18Control);

/* ----------------- VCO 2 Gain ----------------- */

// Velocity
inline function onButton19Control(component, value)
{	
	if (value){ 
		if (buttonsArray[19].getValue() == 0){
			storedValueArray[9] = HardcodedMasterFX1.getAttribute(9);
		}
		Content.getComponent("Knob10").set("enabled",false);
		buttonsArray[19].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button19, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button20, 0);
	}				
	if (buttonsArray[18].getValue() == 0 && buttonsArray[19].getValue() == 0){
		knobsArray[9] = storedValueArray[9];
		Content.getComponent("Knob10").changed();
		Content.getComponent("Knob10").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button19, 0);
	}
};
buttonsArray[18].setControlCallback(onButton19Control);

// Pitch
inline function onButton20Control(component, value)
{
	if (value){
		if (buttonsArray[18].getValue() == 0){
			storedValueArray[9] = HardcodedMasterFX1.getAttribute(9);
		}
		Content.getComponent("Knob10").set("enabled",false);
		buttonsArray[18].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button19, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button20, 1);
	}			
	if (buttonsArray[18].getValue() == 0 && buttonsArray[19].getValue() == 0){
		knobsArray[9] = storedValueArray[9];
		Content.getComponent("Knob10").changed();
		Content.getComponent("Knob10").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button20, 0);
	}
};
buttonsArray[19].setControlCallback(onButton20Control);

/* ----------------- VCO 2 Hard Sync ----------------- */

// Velocity
inline function onButton21Control(component, value)
{	
	if (value){ 
		if (buttonsArray[21].getValue() == 0){
			storedValueArray[10] = HardcodedMasterFX1.getAttribute(10);
		}
		Content.getComponent("Knob11").set("enabled",false);
		buttonsArray[21].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button21, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button22, 0);
	}				
	if (buttonsArray[20].getValue() == 0 && buttonsArray[21].getValue() == 0){
		knobsArray[10] = storedValueArray[10];
		Content.getComponent("Knob11").changed();
		Content.getComponent("Knob11").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button21, 0);
	}
};
buttonsArray[20].setControlCallback(onButton21Control);

// Pitch
inline function onButton22Control(component, value)
{
	if (value){
		if (buttonsArray[20].getValue() == 0){
			storedValueArray[10] = HardcodedMasterFX1.getAttribute(10);
		}
		Content.getComponent("Knob11").set("enabled",false);
		buttonsArray[20].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button21, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button22, 1);
	}			
	if (buttonsArray[20].getValue() == 0 && buttonsArray[21].getValue() == 0){
		knobsArray[10] = storedValueArray[10];
		Content.getComponent("Knob11").changed();
		Content.getComponent("Knob11").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button22, 0);
	}
};
buttonsArray[21].setControlCallback(onButton22Control);

/* ----------------- Noise Decay ----------------- */

// Velocity
inline function onButton23Control(component, value)
{	
	if (value){ 
		if (buttonsArray[23].getValue() == 0){
			storedValueArray[11] = HardcodedMasterFX1.getAttribute(11);
		}
		Content.getComponent("Knob12").set("enabled",false);
		buttonsArray[23].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button23, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button24, 0);
	}				
	if (buttonsArray[22].getValue() == 0 && buttonsArray[23].getValue() == 0){
		knobsArray[11] = storedValueArray[11];
		Content.getComponent("Knob12").changed();
		Content.getComponent("Knob12").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button23, 0);
	}
};
buttonsArray[22].setControlCallback(onButton23Control);

// Pitch
inline function onButton24Control(component, value)
{
	if (value){
		if (buttonsArray[22].getValue() == 0){
			storedValueArray[11] = HardcodedMasterFX1.getAttribute(11);
		}
		Content.getComponent("Knob12").set("enabled",false);
		buttonsArray[22].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button23, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button24, 1);
	}			
	if (buttonsArray[22].getValue() == 0 && buttonsArray[23].getValue() == 0){
		knobsArray[11] = storedValueArray[11];
		Content.getComponent("Knob12").changed();
		Content.getComponent("Knob12").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button24, 0);
	}
};
buttonsArray[23].setControlCallback(onButton24Control);

/* ----------------- Noise Level ----------------- */

// Velocity
inline function onButton25Control(component, value)
{	
	if (value){ 
		if (buttonsArray[25].getValue() == 0){
			storedValueArray[12] = HardcodedMasterFX1.getAttribute(12);
		}
		Content.getComponent("Knob13").set("enabled",false);
		buttonsArray[25].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button25, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button26, 0);
	}				
	if (buttonsArray[24].getValue() == 0 && buttonsArray[25].getValue() == 0){
		knobsArray[12] = storedValueArray[12];
		Content.getComponent("Knob13").changed();
		Content.getComponent("Knob13").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button25, 0);
	}
};
buttonsArray[24].setControlCallback(onButton25Control);

// Pitch
inline function onButton26Control(component, value)
{
	if (value){
		if (buttonsArray[24].getValue() == 0){
			storedValueArray[12] = HardcodedMasterFX1.getAttribute(12);
		}
		Content.getComponent("Knob13").set("enabled",false);
		buttonsArray[24].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button25, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button26, 1);
	}			
	if (buttonsArray[24].getValue() == 0 && buttonsArray[25].getValue() == 0){
		knobsArray[12] = storedValueArray[12];
		Content.getComponent("Knob13").changed();
		Content.getComponent("Knob13").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button26, 0);
	}
};
buttonsArray[25].setControlCallback(onButton26Control);

/* ----------------- VCA Decay ----------------- */

// Velocity
inline function onButton27Control(component, value)
{	
	if (value){ 
		if (buttonsArray[27].getValue() == 0){
			storedValueArray[13] = HardcodedMasterFX1.getAttribute(13);
		}
		Content.getComponent("Knob14").set("enabled",false);
		buttonsArray[27].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button27, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button28, 0);
	}				
	if (buttonsArray[26].getValue() == 0 && buttonsArray[27].getValue() == 0){
		knobsArray[13] = storedValueArray[13];
		Content.getComponent("Knob14").changed();
		Content.getComponent("Knob14").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button27, 0);
	}
};
buttonsArray[26].setControlCallback(onButton27Control);

// Pitch
inline function onButton28Control(component, value)
{
	if (value){
		if (buttonsArray[26].getValue() == 0){
			storedValueArray[13] = HardcodedMasterFX1.getAttribute(13);
		}
		Content.getComponent("Knob14").set("enabled",false);
		buttonsArray[26].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button27, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button28, 1);
	}			
	if (buttonsArray[26].getValue() == 0 && buttonsArray[27].getValue() == 0){
		knobsArray[13] = storedValueArray[13];
		Content.getComponent("Knob14").changed();
		Content.getComponent("Knob14").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button28, 0);
	}
};
buttonsArray[27].setControlCallback(onButton28Control);

/* ----------------- VCF Decay ----------------- */

// Velocity
inline function onButton29Control(component, value)
{	
	if (value){ 
		if (buttonsArray[29].getValue() == 0){
			storedValueArray[14] = HardcodedMasterFX2.getAttribute(0);
		}
		Content.getComponent("Knob15").set("enabled",false);
		buttonsArray[29].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button29, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button30, 0);
	}				
	if (buttonsArray[28].getValue() == 0 && buttonsArray[29].getValue() == 0){
		knobsArray[14] = storedValueArray[14];
		Content.getComponent("Knob15").changed();
		Content.getComponent("Knob15").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button29, 0);
	}
};
buttonsArray[28].setControlCallback(onButton29Control);

// Pitch
inline function onButton30Control(component, value)
{
	if (value){
		if (buttonsArray[28].getValue() == 0){
			storedValueArray[14] = HardcodedMasterFX2.getAttribute(0);
		}
		Content.getComponent("Knob15").set("enabled",false);
		buttonsArray[28].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button29, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button30, 1);
	}			
	if (buttonsArray[28].getValue() == 0 && buttonsArray[29].getValue() == 0){
		knobsArray[14] = storedValueArray[14];
		Content.getComponent("Knob15").changed();
		Content.getComponent("Knob15").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button30, 0);
	}
};
buttonsArray[29].setControlCallback(onButton30Control);

/* ----------------- VCF EG Amount ----------------- */

// Velocity
inline function onButton31Control(component, value)
{	
	if (value){ 
		if (buttonsArray[31].getValue() == 0){
			storedValueArray[15] = HardcodedMasterFX2.getAttribute(1);
		}
		Content.getComponent("Knob16").set("enabled",false);
		buttonsArray[31].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button31, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button32, 0);
	}				
	if (buttonsArray[30].getValue() == 0 && buttonsArray[31].getValue() == 0){
		knobsArray[15] = storedValueArray[15];
		Content.getComponent("Knob16").changed();
		Content.getComponent("Knob16").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button31, 0);
	}
};
buttonsArray[30].setControlCallback(onButton31Control);

// Pitch
inline function onButton32Control(component, value)
{
	if (value){
		if (buttonsArray[30].getValue() == 0){
			storedValueArray[15] = HardcodedMasterFX2.getAttribute(1);
		}
		Content.getComponent("Knob16").set("enabled",false);
		buttonsArray[30].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button31, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button32, 1);
	}			
	if (buttonsArray[30].getValue() == 0 && buttonsArray[31].getValue() == 0){
		knobsArray[15] = storedValueArray[15];
		Content.getComponent("Knob16").changed();
		Content.getComponent("Knob16").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button32, 0);
	}
};
buttonsArray[31].setControlCallback(onButton32Control);

/* ----------------- VCF Freq Cutoff ----------------- */

// Velocity
inline function onButton33Control(component, value)
{	
	if (value){ 
		if (buttonsArray[33].getValue() == 0){
			storedValueArray[16] = HardcodedMasterFX2.getAttribute(2);
		}
		Content.getComponent("Knob17").set("enabled",false);
		buttonsArray[33].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button33, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button34, 0);
	}				
	if (buttonsArray[32].getValue() == 0 && buttonsArray[33].getValue() == 0){
		knobsArray[16] = storedValueArray[16];
		Content.getComponent("Knob17").changed();
		Content.getComponent("Knob17").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button33, 0);
	}
};
buttonsArray[32].setControlCallback(onButton33Control);

// Pitch
inline function onButton34Control(component, value)
{
	if (value){
		if (buttonsArray[32].getValue() == 0){
			storedValueArray[16] = HardcodedMasterFX2.getAttribute(2);
		}
		Content.getComponent("Knob17").set("enabled",false);
		buttonsArray[32].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button33, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button34, 1);
	}			
	if (buttonsArray[32].getValue() == 0 && buttonsArray[33].getValue() == 0){
		knobsArray[16] = storedValueArray[16];
		Content.getComponent("Knob17").changed();
		Content.getComponent("Knob17").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button34, 0);
	}
};
buttonsArray[33].setControlCallback(onButton34Control);

/* ----------------- VCF LP - HP ----------------- */

// Velocity
inline function onButton35Control(component, value)
{	
	if (value){ 
		if (buttonsArray[35].getValue() == 0){
			storedValueArray[17] = HardcodedMasterFX2.getAttribute(3);
		}
		Content.getComponent("Knob18").set("enabled",false);
		buttonsArray[35].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button35, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button36, 0);
	}				
	if (buttonsArray[34].getValue() == 0 && buttonsArray[35].getValue() == 0){
		knobsArray[17] = storedValueArray[17];
		Content.getComponent("Knob18").changed();
		Content.getComponent("Knob18").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button35, 0);
	}
};
buttonsArray[34].setControlCallback(onButton35Control);

// Pitch
inline function onButton36Control(component, value)
{
	if (value){
		if (buttonsArray[34].getValue() == 0){
			storedValueArray[17] = HardcodedMasterFX2.getAttribute(3);
		}
		Content.getComponent("Knob18").set("enabled",false);
		buttonsArray[34].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button35, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button36, 1);
	}			
	if (buttonsArray[34].getValue() == 0 && buttonsArray[35].getValue() == 0){
		knobsArray[17] = storedValueArray[17];
		Content.getComponent("Knob18").changed();
		Content.getComponent("Knob18").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button36, 0);
	}
};
buttonsArray[35].setControlCallback(onButton36Control);

/* ----------------- VCF Q ----------------- */

// Velocity
inline function onButton37Control(component, value)
{	
	if (value){ 
		if (buttonsArray[37].getValue() == 0){
			storedValueArray[18] = HardcodedMasterFX2.getAttribute(4);
		}
		Content.getComponent("Knob19").set("enabled",false);
		buttonsArray[37].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button37, 1);
		scriptProcessor1.setAttribute(scriptProcessor1.Button38, 0);
	}				
	if (buttonsArray[36].getValue() == 0 && buttonsArray[37].getValue() == 0){
		knobsArray[18] = storedValueArray[18];
		Content.getComponent("Knob19").changed();
		Content.getComponent("Knob19").set("enabled", true);
	}
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button37, 0);
	}
};
buttonsArray[36].setControlCallback(onButton37Control);

// Pitch
inline function onButton38Control(component, value)
{
	if (value){
		if (buttonsArray[36].getValue() == 0){
			storedValueArray[18] = HardcodedMasterFX2.getAttribute(4);
		}
		Content.getComponent("Knob19").set("enabled",false);
		buttonsArray[36].setValue(0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button37, 0);
		scriptProcessor1.setAttribute(scriptProcessor1.Button38, 1);
	}			
	if (buttonsArray[36].getValue() == 0 && buttonsArray[37].getValue() == 0){
		knobsArray[18] = storedValueArray[18];
		Content.getComponent("Knob19").changed();
		Content.getComponent("Knob19").set("enabled", true);
	}	
	if (value == 0){
		scriptProcessor1.setAttribute(scriptProcessor1.Button38, 0);
	}
};
buttonsArray[37].setControlCallback(onButton38Control);