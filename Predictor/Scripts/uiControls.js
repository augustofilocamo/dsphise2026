// Reverbs slider;

const var SimpleReverb2 = Synth.getEffect("Simple Reverb2");
const var SimpleReverb3 = Synth.getEffect("Simple Reverb3");
const var SimpleReverb4 = Synth.getEffect("Simple Reverb4");



inline function onreverbKnobControl(component, value)
{
	SimpleReverb2.setAttribute(2, value);
	SimpleReverb3.setAttribute(2, value);
	SimpleReverb4.setAttribute(2, value);
};

Content.getComponent("reverbKnob").setControlCallback(onreverbKnobControl);




// Settings popup
const var settingsPanel = Content.getComponent("settingsPanel");

inline function onsettingsButtonControl(component, value)
{
	settingsPanel.showControl(value);
};

Content.getComponent("settingsButton").setControlCallback(onsettingsButtonControl);




// Markov Order Combo Box
inline function onsimilarComboBoxControl(component, value)
{

	Console.print("value " + value);
	markovOrder = parseInt(value);
	//Console.print("Markov Order selected: " + markovOrder);
	if (label_absPath.getValue() == "")
	{
		Console.print("label_absPath VACÍO. CARGANDO NUEVO MIDI");
		label_absPath.set("text", "{PROJECT_FOLDER}Modal/Ionian/Ionian_Template_C_8.mid");
		lblTicker.set("text", "Ionian_Template_C.mid");
	}
	local absPath = label_absPath.getValue();
	
	Console.print("label_absPath.getValue() " + label_absPath.getValue());

	MIDIPlayer1.setFile(label_absPath.getValue(), 1, 1);
	clearMatrix(); // Limpia las matrices
	curateMidi(); // Cura el midi arrastrado
	readMidiFile(); // lee midi nuevo
	
	
	// Inicializar los círculos
	setupCircleAnimation();
	
	// Configurar el temporizador y la rutina de pintura
	panel.setTimerCallback(updateCircles);
	panel.startTimer(1000 / 20); //  FPS
	panel.setPaintRoutine(drawCircles);
};

Content.getComponent("similarComboBox").setControlCallback(onsimilarComboBoxControl);




// Octave button

const var octaveButton = Content.getComponent("octaveButton");



// Instruments
inline function onpianoButtonControl(component, value)
{
	Sampler1.setBypassed(value);
};

Content.getComponent("pianoButton").setControlCallback(onpianoButtonControl);



inline function onstringButtonControl(component, value)
{
	Sampler2.setBypassed(value);
	Sampler3.setBypassed(value);
};

Content.getComponent("stringButton").setControlCallback(onstringButtonControl);


inline function onsynthButtonControl(component, value)
{
	SynthesiserGroup1.setBypassed(value);
};

Content.getComponent("synthButton").setControlCallback(onsynthButtonControl);


// Metronome
const var SineWaveGeneratorMetronome = Synth.getChildSynth("Sine Wave Generator Metronome");

//Signature
const var Arpeggiator1 = Synth.getMidiProcessor("Arpeggiator1");

const var sigDict = [
    [6, 2, 2, 2], // 2/2
    [6, 5, 2, 2], // 2/4
    [6, 5, 2, 3], // 3/4
    [6, 5, 2, 4], // 4/4
    [6, 5, 2, 5], // 5/4
    [6, 5, 2, 7], // 7/4
    [6, 8, 2, 3], // 3/8
    [6, 8, 2, 6], // 6/8
    [6, 8, 2, 12]  // 12/8
];


Arpeggiator1.setAttribute(2,8);

inline function onsignatureComboBoxControl(component, value)
{
	
    Arpeggiator1.setAttribute(sigDict[value-1][0], sigDict[value-1][1]);
	Arpeggiator1.setAttribute(sigDict[value-1][2], sigDict[value-1][3]);
};

Content.getComponent("signatureComboBox").setControlCallback(onsignatureComboBoxControl);





// BPM and Synch to host
var bpmSave = 100;

inline function onbpmKnobControl(component, value)
{
	Content.getComponent("hostSyncButton").setValue(0);
	Engine.setHostBpm(value);

};

Content.getComponent("bpmKnob").setControlCallback(onbpmKnobControl);

inline function onhostSyncButtonControl(component, value)
{
	if(value){
		bpmSave = Engine.getHostBpm();
		Engine.setHostBpm(-1);
	} else {
		Engine.setHostBpm(bpmSave);
	}
	

};

Content.getComponent("hostSyncButton").setControlCallback(onhostSyncButtonControl);


// Metronome button

inline function onmetronomeButtonControl(component, value)
{

	SineWaveGeneratorMetronome.setBypassed(value);

};

Content.getComponent("metronomeButton").setControlCallback(onmetronomeButtonControl);









// Toca notas con botones de la UI
inline function onNextNoteControl(component, value)
{
	if (value){
		Synth.playNoteFromUI(1, 92, 90);

	} else{
		Synth.noteOffFromUI(1, 92);

	}
};

Content.getComponent("NextNote").setControlCallback(onNextNoteControl);


inline function onNext3NotesControl(component, value)
{
		if (value){
		Synth.playNoteFromUI(1, 45, 90);
		Synth.playNoteFromUI(1, 46, 90);
		Synth.playNoteFromUI(1, 47, 90);
	} else{
		Synth.noteOffFromUI(1, 45);
		Synth.noteOffFromUI(1, 46);
		Synth.noteOffFromUI(1, 47);
	}

};

Content.getComponent("Next3Notes").setControlCallback(onNext3NotesControl);


// Transporte de las notas generadas y/o grabadas
const var transposeKnob = Content.getComponent("transposeKnob");
var transpose = transposeKnob.getValue() + 12;



inline function ontransposeKnobControl(component, value)
{
	 transpose = transposeKnob.getValue();

};

Content.getComponent("transposeKnob").setControlCallback(ontransposeKnobControl);


// Velo makeup
const var veloKnob = Content.getComponent("veloKnob");
var veloMakeUp = veloKnob.getValue();



inline function onveloKnobControl(component, value)
{
	veloMakeUp = veloKnob.getValue();
};

Content.getComponent("veloKnob").setControlCallback(onveloKnobControl);


