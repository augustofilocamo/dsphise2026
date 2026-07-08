Content.setHeight(600);
Content.setWidth(400);


const var HardcodedMasterFX1 = Synth.getEffect("HardcodedMasterFX1"); 
const var HardcodedMasterFX2 = Synth.getEffect("HardcodedMasterFX2"); 

// Array to store button references
const var buttonsArray = [];

// Use a for loop to store all button references in the 'buttonsArray'
for (i = 1; i <= 38; i++)
{
    var buttonName = "Button" + i;
    buttonsArray.push(Content.getComponent(buttonName));
}

/* PARECE QUE SE PUEDE BORRAR ESTO*/
//const var attributes = [];

// Salva los valores de los sliders en array attributeValue[]
//inline function saveValues() {
	
	// Obtiene el número total de atributos
//	local numAttributess = HardcodedMasterFX1.getNumAttributes();
	
	
	// Itera sobre el número de atributos y guarda sus valores en el array
//	local i = 0;
	
//	for (i = 0; i < numAttributess; i++)
//	{

		// Obtiene el valor de cada atributo
//		local attributeValue = HardcodedMasterFX1.getAttribute(i);
		
		// Añade el valor al array
//		attributes.push(attributeValue);
//	}
	
//	Console.print("values saved");
//}

/* Funciones para escalar valores del arpegiador */

// velocity

inline function veloToVcoDecay(){	// Rango 0.005 - 1
	local value = Message.getVelocity() / 127 * 0.995 + 0.005 ;
	return value;
}

inline function veloToWaveform(){	// Bool
	local value = Message.getVelocity() > 63 ? 1 : 0;
	return value;
}

inline function veloToHardSync(){	// Bool
	local value = Message.getVelocity() > 63 ? 1 : 0;
	return value;
}

inline function veloToGain(){	// Decibeles -100 - 0
	local value = Engine.getDecibelsForGainFactor(Message.getVelocity() / 127);
	return value;
}

inline function veloToFM(){		// 0 - 1000
	local value = Message.getVelocity() / 127 * 1000;
	return value;	
}

inline function veloToVcoEG(){	// 0 - 400
	local value = Message.getVelocity()/127*400;
	return value;
}

inline function veloToFreq(){	// 20 - 5000
	local value = Message.getVelocity() / 127 * 4980 + 20;
	return value;
}

inline function veloToNoiseDecay(){	// 0.001 - 0.7
	local value = Message.getVelocity() / 127 * 0.699 + 0.001;
	return value;
}

inline function veloToNoiseLevel(){	// Decibeles -100 - (-50)
	local value = Engine.getDecibelsForGainFactor(Message.getVelocity() / 255);
	return value;
}

inline function veloToVcaDecay(){	// 0.001 - 0.7
	local value = Message.getVelocity() / 127 * 4.995 + 0.005;
	return value;
}

// VCF

inline function veloToVcfDecay(){	// 0.01 - 5
	local velocity = Message.getVelocity() / 127;
	local logValue = Engine.getDecibelsForGainFactor(velocity * 0.9 + 0.1) / 10;
	local min = 1;
	local mid = 2.8;
	local max = 20;
	local value;
	
	if (logValue < 0)
	{
	    value = min + (mid - min) * (logValue + 1);
	}
	else
	{
	    value = mid + (max - mid) * logValue;
	}
	return value;
}

inline function veloToVcfEG(){	// 0 - 4000
	local value = Message.getVelocity() / 127 * 4000;
	return value;
}

inline function veloToCutoff(){	// 20 - 15000
	local value = Message.getVelocity() / 127;
	return value;
}

inline function veloToFilter_LpHp(){	// Bool
	local value = Message.getVelocity() > 63 ? 1 : 0;
	return value;
}

inline function veloToQ(){	// 0.1 - 24
	local value = Message.getVelocity() / 127 * 20 + 0.1;
	return value;
}


// ---------------

// Pitch
// El pitch va desde 16 a 64, entoces resto 16 y divido por 48 (en vez de 127)
// Para los Bool, resto 40 y queda entre -24 y +24. Luego comparo contra el cero

inline function pitchToVcoDecay(){	// Rango 0.005 - 1
	local value = (Message.getNoteNumber() - 16 ) / 48 * 0.995 + 0.005 ;
	return value;
}

inline function pitchToWaveform(){	// Bool
	local value = (Message.getNoteNumber() - 40 ) > 0 ? 1 : 0;
	return value;
}

inline function pitchToHardSync(){	// Bool
	local value = (Message.getNoteNumber() - 40 ) > 0 ? 1 : 0;
	return value;
}

inline function pitchToGain(){	// Decibeles -100 - 0
	local value = Engine.getDecibelsForGainFactor((Message.getNoteNumber() - 16 ) / 48);
	return value;
}

inline function pitchToFM(){		// 0 - 1000
	local value = (Message.getNoteNumber() - 16 ) / 48 * 1000;
	return value;	
}

inline function pitchToVcoEG(){	// 0 - 400
	local value = (Message.getNoteNumber() - 16 ) / 48 * 400;
	return value;
}

inline function pitchToFreq(){	// 20 - 5000
	local value = (Message.getNoteNumber() - 16 ) / 48 * 4980 + 20;
	return value;
}

inline function pitchToNoiseDecay(){	// 0.001 - 0.7
	local value = (Message.getNoteNumber() - 16 ) / 48 * 0.699 + 0.001;
	return value;
}

inline function pitchToNoiseLevel(){	// Decibeles -100 - (-50)
	local value = Engine.getDecibelsForGainFactor((Message.getNoteNumber() - 16 ) / 96);
	return value;
}

inline function pitchToVcaDecay(){	// 0.001 - 0.7
	local value = (Message.getNoteNumber() - 16 ) / 48 * 4.995 + 0.005;
	return value;
}

// VCF

inline function pitchToVcfDecay(){	// 0.01 - 5
	local note = (Message.getNoteNumber() - 16 ) / 48;
	local logValue = Engine.getDecibelsForGainFactor(note * 0.9 + 0.1) / 10;
	local min = 1.8;
	local mid = 3;
	local max = 20;
	local value;
	
	if (logValue < 0)
	{
	    value = min + (mid - min) * (logValue + 1);
	}
	else
	{
	    value = mid + (max - mid) * logValue;
	}
	
	
	
	
	return value;
}

inline function pitchToVcfEG(){	// 0 - 4000
	local value = (Message.getNoteNumber() - 16 ) / 48 * 4000;
	return value;
}

inline function pitchToCutoff(){	// 20 - 15000
	local value = (Message.getNoteNumber() - 16 ) / 48;
	Console.print(value);
	return value;
}

inline function pitchToFilter_LpHp(){	// Bool
	local value = (Message.getNoteNumber() - 40 ) > 0 ? 1 : 0;
	return value;
}

inline function pitchToQ(){	// 0.1 - 24
	local value = (Message.getNoteNumber() - 16 ) / 48 * 20 + 0.1;
	return value;
}

/*  BORRAR */
/*
inline function freqToBool()
{
	local value = Message.getNoteNumber() > 36 ? 1 : 0;
	return value;
	Console.print("freqToBool" + Message.getNoteNumber());
	
}

inline function freqToGain()
{
	local value = Engine.getDecibelsForGainFactor((Message.getNoteNumber()-36)/36);
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
	
}
*/function onNoteOn()
{
	Console.print( "Note n° Arpegiator: " + Message.getNoteNumber());

// ----------- COLUMNA VELOCITY	----------- 

	// Vco Decay
	if (buttonsArray[0].getValue() == 1)
		HardcodedMasterFX1.setAttribute(0, veloToVcoDecay());
				
	// Vco EG
	if (buttonsArray[2].getValue() == 1)
		HardcodedMasterFX1.setAttribute(1, veloToVcoEG());

	// Vco 1 freq
	if (buttonsArray[4].getValue() == 1)
		HardcodedMasterFX1.setAttribute(2, veloToFreq());

	// Vco 1 waveform triangle-square
	if (buttonsArray[6].getValue() == 1)
		HardcodedMasterFX1.setAttribute(3, veloToWaveform());
	
	// Vco 1 Gain
	if (buttonsArray[8].getValue() == 1)
		HardcodedMasterFX1.setAttribute(4, veloToGain());
	
	// Fm amount
	if (buttonsArray[10].getValue() == 1)
		HardcodedMasterFX1.setAttribute(5, veloToFM());

	// Vco 2 Eg amount
	if (buttonsArray[12].getValue() == 1)
		HardcodedMasterFX1.setAttribute(6, veloToVcoEG()); 
	
	// Vco 2 freq
	if (buttonsArray[14].getValue() == 1)
		HardcodedMasterFX1.setAttribute(7, veloToFreq());
	
	// Vco 2 Waveform
	if (buttonsArray[16].getValue() == 1)
		HardcodedMasterFX1.setAttribute(8, veloToWaveform()); 
	
	// Vco 2 level	
	if (buttonsArray[18].getValue() == 1)
		HardcodedMasterFX1.setAttribute(9, veloToGain());
	
	// Vco 2 HardSync		
	if (buttonsArray[20].getValue() == 1)
		HardcodedMasterFX1.setAttribute(10, veloToHardSync());
	
	// Noise Decay
	if (buttonsArray[22].getValue() == 1)
		HardcodedMasterFX1.setAttribute(11, veloToNoiseDecay());	
				
	// Noise Level
	if (buttonsArray[24].getValue() == 1)
		HardcodedMasterFX1.setAttribute(12, veloToNoiseLevel());	
	
	// Vca Decay
	if (buttonsArray[26].getValue() == 1)
		HardcodedMasterFX1.setAttribute(13, veloToVcaDecay());
	
	/* --------------- VCF -------------- */
	
	// Vcf decay
	if (buttonsArray[28].getValue() == 1)
		HardcodedMasterFX2.setAttribute(0, veloToVcfDecay()); 
	
	// Vcf Eg Amount
	if (buttonsArray[30].getValue() == 1)
		HardcodedMasterFX2.setAttribute(1, veloToVcfEG()); // agregar veloTo04000()

	// Vcf Cutoff
	if (buttonsArray[32].getValue() == 1)
		HardcodedMasterFX2.setAttribute(2, veloToCutoff());  // agregar veloTo015000()		
		
	// Vcf LP - HP Switch
	if (buttonsArray[34].getValue() == 1)
		HardcodedMasterFX2.setAttribute(3, veloToFilter_LpHp());
		
	// Vcf Q
	if (buttonsArray[36].getValue() == 1)
		HardcodedMasterFX2.setAttribute(4, veloToQ()); // agregar veloTo024()
		
// -------------- COLUMNA PITCH -------------	

	// Vco Decay
	if (buttonsArray[1].getValue() == 1)
		HardcodedMasterFX1.setAttribute(0, pitchToVcoDecay());
	
	// Vco EG
	if (buttonsArray[3].getValue() == 1)
		HardcodedMasterFX1.setAttribute(1, pitchToVcoEG());
	
	// Vco 1 freq
	if (buttonsArray[5].getValue() == 1)
		HardcodedMasterFX1.setAttribute(2, pitchToFreq());
	
	// Vco 1 waveform triangle-square
	if (buttonsArray[7].getValue() == 1)
		HardcodedMasterFX1.setAttribute(3, pitchToWaveform());
	
	// Vco 1 level
	if (buttonsArray[9].getValue() == 1)
		HardcodedMasterFX1.setAttribute(4, pitchToGain());
	
	// Fm amount
	if (buttonsArray[11].getValue() == 1)
		HardcodedMasterFX1.setAttribute(5, pitchToFM());
	
	// Vco 2 Eg amount
	if (buttonsArray[13].getValue() == 1)
		HardcodedMasterFX1.setAttribute(6, pitchToVcoEG());
	
	// Vco 2 freq
	if (buttonsArray[15].getValue() == 1)
		HardcodedMasterFX1.setAttribute(7, pitchToFreq());
	
	// Vco 2 Waveform
	if (buttonsArray[17].getValue() == 1)
		HardcodedMasterFX1.setAttribute(8, pitchToWaveform());
	
	// Vco 2 level
	if (buttonsArray[19].getValue() == 1)
		HardcodedMasterFX1.setAttribute(9, pitchToGain());
	
	// Vco 2 HardSync
	if (buttonsArray[21].getValue() == 1)
		HardcodedMasterFX1.setAttribute(10, pitchToHardSync());
	
	// Noise Decay
	if (buttonsArray[23].getValue() == 1)
		HardcodedMasterFX1.setAttribute(11, pitchToNoiseDecay());
	
	// Noise Level
	if (buttonsArray[25].getValue() == 1)
		HardcodedMasterFX1.setAttribute(12, pitchToNoiseLevel());
	
	// Vca Decay
	if (buttonsArray[27].getValue() == 1)
		HardcodedMasterFX1.setAttribute(13, pitchToVcaDecay());
		
	/* --------------- VCF -------------- */		
	
	// Vcf decay
	if (buttonsArray[29].getValue() == 1)
		HardcodedMasterFX2.setAttribute(0, pitchToVcfDecay()); 
	
	// Vcf Eg Amount
	if (buttonsArray[31].getValue() == 1)
		HardcodedMasterFX2.setAttribute(1, pitchToVcfEG()); // agregar veloTo04000()

	// Vcf Cutoff
	if (buttonsArray[33].getValue() == 1)
		HardcodedMasterFX2.setAttribute(2, pitchToCutoff());  // agregar veloTo015000()		
		
	// Vcf LP - HP Switch
	if (buttonsArray[35].getValue() == 1)
		HardcodedMasterFX2.setAttribute(3, pitchToFilter_LpHp());
		
	// Vcf Q
	if (buttonsArray[37].getValue() == 1)
		HardcodedMasterFX2.setAttribute(4, pitchToQ()); // agregar veloTo024()
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
 