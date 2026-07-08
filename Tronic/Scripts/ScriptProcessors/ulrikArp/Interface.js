Content.makeFrontInterface(600, 600);

//	MODULES
const var Module1 = Synth.getChildSynth("Module1");
const var Module2 = Synth.getChildSynth("Module2");
const var ChannelFilter1 = Synth.getMidiProcessor("ChannelFilter1");
const var KillNotes = Synth.getMidiProcessor("KillNotes");

const var LFOModulator1 = Synth.getModulator("LFO Modulator1");
const var LFOModulator2 = Synth.getModulator("LFO Modulator2");

//	COMPONENTS
const Arp1SLPs = Content.getAllComponents("SLPArp1");
const Arp2SLPs = Content.getAllComponents("SLPArp2");

const var PlayArp1 = Content.getComponent("PlayArp1");
const var PlayArp2 = Content.getComponent("PlayArp2");
const var NoteValueArp1 = Content.getComponent("NoteValueArp1");
const var FreqArp1 = Content.getComponent("FreqArp1");
const var NoteValueLblArp1 = Content.getComponent("NoteValueLblArp1");
const var NoteValueArp2 = Content.getComponent("NoteValueArp2");
const var FreqArp2 = Content.getComponent("FreqArp2");
const var NoteValueLblArp2 = Content.getComponent("NoteValueLblArp2");
const var NumStepsArp1 = Content.getComponent("NumStepsArp1");
const var NumStepsArp2 = Content.getComponent("NumStepsArp2");
const var OctaveArp1 = Content.getComponent("OctaveArp1");
const var OctaveArp2 = Content.getComponent("OctaveArp2");


//	NOTEVALUE LOOKUP TABLES	------------------
//	This table doesn't match Hise Notevalue scheme, I've set this
//	from longest value to shortest, like 1/4D is longer than 1/2T etc.
const NVLookUpString = ["1/1", "1/2D", "1/2",
"1/4D", "1/2T", "1/4",
"1/8D", "1/4T", "1/8",
"1/16D", "1/8T", "1/16",
"1/32D", "1/16T", "1/32",
"1/64D", "1/32T", "1/64",
"1/64T"];

const NVLookUpNum = [1/1, 3/4, 1/2,
3/8, 1/3, 1/4,
3/16, 1/6, 1/8,
3/32, 1/12, 1/16,
3/64, 1/24, 1/32,
3/128, 1/48, 1/64,
1/96];

const NVLookUpIndex = [0, 1, 2,
4, 3, 5,
7, 6, 8,
10, 9, 11,
13, 12, 14,
16, 15, 17,
18];

//	TRANSPORT HANDLER
const TH = Engine.createTransportHandler();
TH.setEnableGrid(true, 18);	// 18 means notevalue 1/64T (1/96), the smallest value you can use
TH.setSyncMode(TH.PreferInternal);
TH.setOnGridChange(true, GridChange);

reg count1, count2 = 0;
reg beat1, beat2 = false;

//	PLAY FUNCTION	----------------------------------
inline function GridChange(clock, arg2, arg3)
{
	if (PlayArp1.getValue())
	{
		local beat;
		local nv;
		
		if (LFOModulator1.getAttribute(LFOModulator1.TempoSync))
			nv = NVLookUpNum[NoteValueArp1.getValue()];
		else
			nv = Engine.getQuarterBeatsForMilliSeconds(1000 / LFOModulator1.getAttribute(LFOModulator1.Frequency)/4);
		
		local steps = NumStepsArp1.getValue();
		local step;
		
		local length = nv * steps;
		local sample = Engine.getSamplesForQuarterBeats(nv * 4);
		local root = 60 + OctaveArp1.getValue() * 12;
		local p;
		local v;
		local l;
		
		if (!beat1 && LFOModulator1.getCurrentLevel() == 1)
		{
			beat1 = true;
			step = count1 % steps;
			
			p = parseInt(root + Arp1SLPs[0].getSliderValueAt(step));
			v = parseInt(Arp1SLPs[1].getSliderValueAt(step));
			l = Arp1SLPs[2].getSliderValueAt(step);
			local id = Synth.addNoteOn(2, p, v, 0);
			Synth.noteOffDelayedByEventId(id, l * sample);
			
			count1++;
		}
		
		if (beat1 && LFOModulator1.getCurrentLevel() < 0.5)
			beat1 = false;
	}
	
	if (PlayArp2.getValue())
	{
		local beat;
		local nv;
		
		if (LFOModulator2.getAttribute(LFOModulator2.TempoSync))
			nv = NVLookUpNum[NoteValueArp2.getValue()];
		else
			nv = Engine.getQuarterBeatsForMilliSeconds(1000 / LFOModulator2.getAttribute(LFOModulator2.Frequency)/4);
		
		local steps = NumStepsArp2.getValue();
		local step;
		
		local length = nv * steps;
		local sample = Engine.getSamplesForQuarterBeats(nv * 4);
		local root = 60 + OctaveArp2.getValue() * 12;
		local p;
		local v;
		local l;
		
		if (!beat2 && LFOModulator2.getCurrentLevel() == 1)
		{
			beat2 = true;
			step = count2 % steps;
			
			p = parseInt(root + Arp2SLPs[0].getSliderValueAt(step));
			v = parseInt(Arp2SLPs[1].getSliderValueAt(step));
			l = Arp2SLPs[2].getSliderValueAt(step);
			local id = Synth.addNoteOn(3, p, v, 0);
			Synth.noteOffDelayedByEventId(id, l * sample);
			
			count2++;
		}
		
		if (beat2 && LFOModulator2.getCurrentLevel() < 0.5)
			beat2 = false;
	}
};


//	================ ARP1 ============================
inline function onPlayArp1Control(component, value)
{
	if (!PlayArp2.getValue())
		value ? TH.startInternalClock(0) : TH.stopInternalClock(0);
	
	LFOModulator1.setBypassed(!value);
	count1 = 0;
	beat1 = false;
	
	if (value)
	{
		KillNotes.setAttribute(KillNotes.killpressed, true);
		ChannelFilter1.setAttribute(ChannelFilter1.channelNumber, 2);
	}

	else
	{
		ChannelFilter1.setAttribute(ChannelFilter1.channelNumber, 1);
		KillNotes.setAttribute(KillNotes.killarp, true);
	}
};

Content.getComponent("PlayArp1").setControlCallback(onPlayArp1Control);


inline function onNumStepsArp1Control(component, value)
{
	for (s in Arp1SLPs)
		s.set("sliderAmount", value);
};

Content.getComponent("NumStepsArp1").setControlCallback(onNumStepsArp1Control);


inline function onTempoSyncArp1Control(component, value)
{
	LFOModulator1.setAttribute(LFOModulator1.TempoSync, value);
	NoteValueArp1.set("visible", value);
	FreqArp1.set("visible", !value);
	NoteValueArp1.set("enabled", value);
	FreqArp1.set("enabled", !value);
	
	value ? NoteValueArp1.changed() : FreqArp1.changed();
	
	NoteValueLblArp1.set("visible", value);
};

Content.getComponent("TempoSyncArp1").setControlCallback(onTempoSyncArp1Control);


inline function onNoteValueArp1Control(component, value)
{
	LFOModulator1.setAttribute(LFOModulator1.Frequency, NVLookUpIndex[value]);
	NoteValueLblArp1.set("text", NVLookUpString[value]);
};

Content.getComponent("NoteValueArp1").setControlCallback(onNoteValueArp1Control);


inline function onFreqArp1Control(component, value)
{
	LFOModulator1.setAttribute(LFOModulator1.Frequency, value);
};

Content.getComponent("FreqArp1").setControlCallback(onFreqArp1Control);


//	=============== ARP2 =============================
inline function onPlayArp2Control(component, value)
{
	if (!PlayArp1.getValue())
		value ? TH.startInternalClock(0) : TH.stopInternalClock(0);
	
	if (value)
		KillNotes.setAttribute(KillNotes.killpressed, true);
};

Content.getComponent("PlayArp2").setControlCallback(onPlayArp2Control);


inline function onNumStepsArp2Control(component, value)
{
	for (s in Arp2SLPs)
		s.set("sliderAmount", value);
};

Content.getComponent("NumStepsArp2").setControlCallback(onNumStepsArp2Control);


inline function onTempoSyncArp2Control(component, value)
{
	LFOModulator2.setAttribute(LFOModulator2.TempoSync, value);
	NoteValueArp2.set("visible", value);
	FreqArp2.set("visible", !value);
	NoteValueArp2.set("enabled", value);
	FreqArp2.set("enabled", !value);
	
	value ? NoteValueArp2.changed() : FreqArp2.changed();
	
	NoteValueLblArp2.set("visible", value);
};

Content.getComponent("TempoSyncArp2").setControlCallback(onTempoSyncArp2Control);


inline function onNoteValueArp2Control(component, value)
{
	LFOModulator2.setAttribute(LFOModulator2.Frequency, NVLookUpIndex[value]);
	NoteValueLblArp2.set("text", NVLookUpString[value]);
};

Content.getComponent("NoteValueArp2").setControlCallback(onNoteValueArp2Control);



inline function onFreqArp2Control(component, value)
{
	LFOModulator2.setAttribute(LFOModulator2.Frequency, value);
};

Content.getComponent("FreqArp2").setControlCallback(onFreqArp2Control);


function onNoteOn()
{
	if (PlayArp1.getValue() || PlayArp2.getValue())
		Message.ignoreEvent(true);
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
 