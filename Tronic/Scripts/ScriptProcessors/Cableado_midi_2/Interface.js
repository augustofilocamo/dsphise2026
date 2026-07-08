Content.makeFrontInterface(1024, 680);

const var HardcodedMasterFX1 = Synth.getEffect("HardcodedMasterFX1");





const var veloSliderParameterId = Content.getComponent("veloSliderParameterId");
const var freqSliderParameterId = Content.getComponent("freqSliderParameterId");

global sliderValues = [];


const var vco1_eg_amount = Content.getComponent("vco1_eg_amount");
const var vco2_eg_amount = Content.getComponent("vco2_eg_amount");
const var fm_amount = Content.getComponent("fm_amount");
const var hard_sync = Content.getComponent("hard_sync");
const var vco1_freq = Content.getComponent("vco1_freq");
const var vco2_freq = Content.getComponent("vco2_freq");
const var vco1_waveform = Content.getComponent("vco1_waveform");
const var vco2_waveform = Content.getComponent("vco2_waveform");
const var vco1_level = Content.getComponent("vco1_level");
const var vco2_level = Content.getComponent("vco2_level");
const var noise_level = Content.getComponent("noise_level");
const var noise_decay = Content.getComponent("noise_decay");
const var vca_decay = Content.getComponent("vca_decay");


inline function saveKnobValues(){
		sliderValues = [
	    vco1_eg_amount.getValue(),
	    vco2_eg_amount.getValue(),
	    fm_amount.getValue(),
	    hard_sync.getValue(),
	    vco1_freq.getValue(),
	    vco2_freq.getValue(),
	    vco1_waveform.getValue(),
	    vco2_waveform.getValue(),
	    vco1_level.getValue(),
	    vco2_level.getValue(),
	    noise_level.getValue(),
	    noise_decay.getValue(),
	    vca_decay.getValue()
	];
}





inline function loadKnobValues(){
	
	vco1_eg_amount.setValue(sliderValues[0]);
	vco1_eg_amount.changed();
	
	vco2_eg_amount.setValue(sliderValues[1]);
	vco2_eg_amount.changed();
	
	fm_amount.setValue(sliderValues[2]);
	fm_amount.changed();
	
	hard_sync.setValue(sliderValues[3]);
	hard_sync.changed();
	
	vco1_freq.setValue(sliderValues[4]);
	vco1_freq.changed();
	
	vco2_freq.setValue(sliderValues[5]);
	vco2_freq.changed();
	
	vco1_waveform.setValue(sliderValues[6]);
	vco1_waveform.changed();
	
	vco2_waveform.setValue(sliderValues[7]);
	vco2_waveform.changed();
	
	vco1_level.setValue(sliderValues[8]);
	vco1_level.changed();
	
	vco2_level.setValue(sliderValues[9]);
	vco2_level.changed();
	
	noise_level.setValue(sliderValues[10]);
	noise_level.changed();
	
	noise_decay.setValue(sliderValues[11]);
	noise_decay.changed();
	
	vca_decay.setValue(sliderValues[12]);
	vca_decay.changed();
	
	
}



//const var attributesInit = [0.190, 0, 1, 1, -100, 0, 200, 0, 0, 0, 0, 1, -100, 1];

const var attributes = [];


// Salva los valores de los sliders en array attributeValue[]
inline function saveValues() {
	
	// Obtiene el número total de atributos
	local numAttributess = HardcodedMasterFX2.getNumAttributes();
	
	
	// Itera sobre el número de atributos y guarda sus valores en el array
	local i = 0;
	
	for (i = 0; i < numAttributess; i++)
	{

		// Obtiene el valor de cada atributo
		local attributeValue = HardcodedMasterFX2.getAttribute(i);
		
		// Añade el valor al array
		attributes.push(attributeValue);
	}
	
	Console.print("values saved");
}

saveValues();



// Load los valores de los sliders en array attributeValue[]
inline function loadValues() {
	
	// Obtiene el número total de atributos
	local numAttributess = HardcodedMasterFX2.getNumAttributes();
	

	
	// Itera sobre el número de atributos y guarda sus valores en el array
	local i = 0;
	for (i = 0; i < numAttributess; i++)
	{
		// Obtiene el valor de cada atributo
		HardcodedMasterFX2.setAttribute(i, attributes[i]);   
	}
	Console.print("values loaded");
}




// Salva los valores de los sliders en array attributeValue[]
inline function saveValues() {
	
	// Obtiene el número total de atributos
	local numAttributess = HardcodedMasterFX1.getNumAttributes();
	
	
	// Itera sobre el número de atributos y guarda sus valores en el array
	local i = 0;
	
	for (i = 0; i < numAttributess; i++)
	{

		// Obtiene el valor de cada atributo
		local attributeValue = HardcodedMasterFX1.getAttribute(i);
		
		// Añade el valor al array
		attributes.push(attributeValue);
		Console.print("values saved " + i);
	}
	

}



// Funcion que salva en un array todos los valores de los sliders 
inline function onveloSliderParameterIdControl(component, value)
{	
saveKnobValues();
loadKnobValues();
};

Content.getComponent("veloSliderParameterId").setControlCallback(onveloSliderParameterIdControl);



inline function onfreqSliderParameterIdControl(component, value)
{
saveKnobValues();
loadKnobValues();
};

Content.getComponent("freqSliderParameterId").setControlCallback(onfreqSliderParameterIdControl);



// Funciones de normalizacion de velocity
inline function veloToBool()
{
	local value = Message.getVelocity() > 63 ? 1 : 0;
	return value;
	
}

inline function veloToGain()
{
	local value = Engine.getDecibelsForGainFactor(Message.getVelocity()/127);
	return value;
	
}

inline function veloTo01000()
{
	local value = Message.getVelocity()/127*1000;
	return value;
	
}

inline function veloTo0400()
{
	local value = Message.getVelocity()/127*400;
	return value;
	
}

inline function veloTo05000()
{
	local value = Message.getVelocity()/127*5000;
	return value;
	
}

inline function veloTo02()
{
	local value = Message.getVelocity()/127*2;
	return value;
	
}

// Freq normalizacion functions


// Funciones de normalizacion de velocity
inline function freqToBool()
{
	local value = Message.getNoteNumber() > 36 ? 1 : 0;
	return value;
	Console.print("freqToBool" + Message.getNoteNumber());
	
}

inline function freqToGain()
{
	local value = Engine.getDecibelsForGainFactor(Message.getNoteNumber()/127);
	return value;
	
}

inline function freqTo01000()
{
	local value = Message.getNoteNumber()/72*1000;
	return value;
	
}

inline function freqTo0400()
{
	local value = Message.getNoteNumber()/72*400;
	return value;
	
}

inline function freqTo05000()
{
	local value = Message.getNoteNumber()/72*5000;
	return value;
	
}

inline function freqTo02()
{
	local value = Message.getNoteNumber()/72*2;
	return value;
	
}function onNoteOn()
{
	Console.print(Message.getNoteNumber() + " Note on");
	const var veloParameterId = veloSliderParameterId.getValue();
	const var freqParameterId = freqSliderParameterId.getValue();
	
	freqToBool();
	
	// Velo cables
	
	if 	(veloParameterId != -1)
	{
		if (veloParameterId == 0 || veloParameterId == 8 || veloParameterId == 10)
	    {
	        // Convierte la velocidad en un valor entre 0 y 1 como booleano
	        HardcodedMasterFX1.setAttribute(veloParameterId, veloToBool()); 
	
	    }
	    else if (veloParameterId == 1 || veloParameterId == 6)
	    {
	        // Convierte la velocidad en un valor entre 0 y 400
	        HardcodedMasterFX1.setAttribute(veloParameterId, veloTo0400()); 
	        
	    }
	    else if (veloParameterId == 2 || veloParameterId == 7)
	    {
	        // Convierte la velocidad en un valor entre 0 y 5000
	        HardcodedMasterFX1.setAttribute(veloParameterId, veloTo05000()); 
	    }
	    else if (veloParameterId == 3)
	    {
	        // Convierte la velocidad en un valor entre 0 y 1 como booleano (igual al caso 0)
			HardcodedMasterFX1.setAttribute(veloParameterId, veloToBool());
	    }
	    else if (veloParameterId == 4 || veloParameterId == 9 || veloParameterId == 12)
	    {
	        // Convierte la velocidad en decibelios usando la función de ganancia
	       	HardcodedMasterFX1.setAttribute(veloParameterId, veloToGain()); 
	    }
	    else if (veloParameterId == 5)
	    {
	        // Convierte la velocidad en un valor entre 1 y 1000
	       	HardcodedMasterFX1.setAttribute(veloParameterId, veloTo01000()); 
	    }
	    else if (veloParameterId == 11)
	    {
	        // Convierte la velocidad en un valor entre 0 y 2
	       	HardcodedMasterFX1.setAttribute(veloParameterId, veloTo02()); 
	    }	
	}
    
	
	// Freq cables

	if 	(freqParameterId != -1)
	{
		if (freqParameterId == 0 || freqParameterId == 8 || freqParameterId == 10)
		{
		    // Convierte la velocidad en un valor entre 0 y 1 como booleano
		    HardcodedMasterFX1.setAttribute(freqParameterId, freqToBool()); 
		}	
		
		else if (freqParameterId == 1 || freqParameterId == 6)
		{
		    // Convierte la velocidad en un valor entre 0 y 400
		    HardcodedMasterFX1.setAttribute(freqParameterId, freqTo0400()); 
		}	
		else if (freqParameterId == 2 || freqParameterId == 7)
	    {
	        // Convierte la velocidad en un valor entre 0 y 5000
	        HardcodedMasterFX1.setAttribute(freqParameterId, freqTo05000()); 
	    }
	    else if (freqParameterId == 3)
	    {
	        // Convierte la velocidad en un valor entre 0 y 1 como booleano (igual al caso 0)
			HardcodedMasterFX1.setAttribute(freqParameterId, freqToBool());
	    }
	    else if (freqParameterId == 4 || freqParameterId == 9 || freqParameterId == 12)
	    {
	        // Convierte la velocidad en decibelios usando la función de ganancia
	       	HardcodedMasterFX1.setAttribute(freqParameterId, freqToGain()); 
	    }
	    else if (freqParameterId == 5)
	    {
	        // Convierte la velocidad en un valor entre 1 y 1000
	       	HardcodedMasterFX1.setAttribute(freqParameterId, freqTo01000()); 
	    }
	    else if (freqParameterId == 11)
	    {
	        // Convierte la velocidad en un valor entre 0 y 2
	       	HardcodedMasterFX1.setAttribute(freqParameterId, freqTo02()); 
	    }	
	}
	
	
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
 