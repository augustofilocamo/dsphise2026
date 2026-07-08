Content.makeFrontInterface(1024, 680);


include("menuPanels.js");
include("Authorisation.js");

Console.print("char: '" + "\u2197" + "' charCode=" + "\u2197".charCodeAt(0));


// Link panel
;
var linkPanel = Content.getComponent("linkPanel");
if (linkPanel)
{
	linkPanel.setMouseCallback(function(event)
	{
		if (event.clicked)
			Engine.openWebsite("https://sampleson.com");
	});
}



// Preset Browser LAF

const var browserLaf = Content.createLocalLookAndFeel();

browserLaf.registerFunction("drawPresetBrowserListItem", function(g, obj)
{
    g.setFont("Abel", 22.0); // Cambiá este valor según tu preferencia

    var x = obj.area[0];
    var y = obj.area[1];
    var w = obj.area[2];
    var h = obj.area[3];

    if (obj.selected)
    {
        g.setColour(0xFF353535);
        g.fillRoundedRectangle([x , y, w, h], 2.0);
    }

    g.setColour(Colours.grey);

    // Simulamos un ajuste del interlineado desplazando el texto hacia arriba o abajo


    g.drawAlignedText(obj.text, [x + 10, y, w, h], "left");
});




Content.getComponent("presetsFloatingTile").setLocalLookAndFeel(browserLaf);





// HardcodedMasterFX1 hosts the compiled "spectral_freeze_node" C++ node.
// On load HISE 4.1 sometimes fails to invoke the node's setParameter<P>
// callbacks until a value actually changes, leaving the DSP in an
// uninitialised state ("no audio until I move a slider"). Forcing a
// re-set of every attribute to its current value (immediately, then
// again from a one-shot timer) kicks the callbacks and gets the node
// processing.


// Variables

const var KnobCue = Content.getComponent("KnobCue");
const var KnobFreezeAmount = Content.getComponent("KnobFreezeAmount");
const var KnobPhaseRandom = Content.getComponent("KnobPhaseRandom");
const var KnobSmear = Content.getComponent("KnobSmear");

const var ledPanel    = Content.getComponent("ledPanel");
const var recButton   = Content.getComponent("recButton");
const var playButton  = Content.getComponent("playButton");
const var clearButton = Content.getComponent("clearButton");
const var freezeButton = Content.getComponent("freezeButton");
const var timeLabel   = Content.getComponent("timeLabel");

const var FreezerFx = Synth.getEffect("HardcodedMasterFX1");
const var freezerWakeTimer = Engine.createTimerObject();

inline function dumpEffectAttributes(effect, label)
{
	if (effect == undefined)
	{
		Console.print("[Handsynth] " + label + " is undefined");
		return;
	}

	local n = effect.getNumAttributes();
	Console.print("[Handsynth] " + label + " has " + n + " attributes:");
	local i = 0;
	while (i < n)
	{
		Console.print("  [" + i + "] " + effect.getAttributeId(i));
		i = i + 1;
	}
}

inline function rePushAllAttributes(effect, label)
{
	if (effect == undefined)
		return;

	local n = effect.getNumAttributes();
	local i = 0;
	while (i < n)
	{
		local v = effect.getAttribute(i);
		effect.setAttribute(i, v);
		i = i + 1;
	}
	Console.print("[Handsynth] re-pushed " + n + " attributes on " + label);
}

inline function freezerBootstrap()
{
	if (FreezerFx == undefined)
	{
		Console.print("[Handsynth] WARNING: 'HardcodedMasterFX1' not found.");
		return;
	}

	dumpEffectAttributes(FreezerFx, "FreezerFx (HardcodedMasterFX1)");
	rePushAllAttributes(FreezerFx, "FreezerFx (HardcodedMasterFX1) [boot]");

	freezerWakeTimer.setTimerCallback(function ()
	{
		rePushAllAttributes(FreezerFx, "FreezerFx (HardcodedMasterFX1) [delayed]");
		freezerWakeTimer.stopTimer();
	});
	freezerWakeTimer.startTimer(50);
}

freezerBootstrap();


// =============================================================
//  Rec countdown — timeLabel shows "SS:CC" (seconds:centiseconds)
//  remaining while recButton is held high. Total recording
//  time = 10 s. When the counter reaches zero we forcibly
//  release the Rec button so the DSP sees a falling edge and
//  stops recording.
// =============================================================

const var REC_TICK_MS     = 20;        // poll period (ms)
const var REC_TOTAL_TICKS = 500;       // 500 * 20 ms = 10 s

const var recCountdownTimer = Engine.createTimerObject();
reg recLastState  = 0.0;
reg playLastState = 0.0;
reg recTicksLeft  = 0;
reg recAttrIdx    = -1;        // resolved at boot
reg playAttrIdx   = -1;        // resolved at boot
reg clearAttrIdx  = -1;        // resolved at boot
reg smearAttrIdx  = -1;        // resolved at boot

reg freezeLastState = 0.0;
reg savedSmear      = 0.0;

inline function resolveAttrIdx(name)
{
	if (FreezerFx == undefined)
		return -1;

	local n = FreezerFx.getNumAttributes();
	local i = 0;
	while (i < n)
	{
		if (FreezerFx.getAttributeId(i) == name)
			return i;
		i = i + 1;
	}
	return -1;
}

recAttrIdx   = resolveAttrIdx("Rec");
playAttrIdx  = resolveAttrIdx("Play");
clearAttrIdx = resolveAttrIdx("Clear");
smearAttrIdx = resolveAttrIdx("Smear");

// HISE script returns doubles from Math.* / division, so naive
// concatenation produces "0.0" instead of "0". This helper strips
// any decimal part and zero-pads to two digits.
inline function pad2(n)
{
	local s   = "" + n;
	local dot = s.indexOf(".");
	if (dot >= 0)
		s = s.substring(0, dot);
	if (s.length < 2)
		s = "0" + s;
	return s;
}

inline function setTimeLabelTicks(ticks)
{
	// Each 20 ms tick = 2 centiseconds → pure integer arithmetic.
	local cs = ticks * 2;
	if (cs < 0)
		cs = 0;

	local cents = cs % 100;
	local secs  = (cs - cents) / 100;

	timeLabel.set("text", pad2(secs) + ":" + pad2(cents));
}

inline function forceStopRec()
{
	recButton.setValue(0);
	if (recAttrIdx >= 0 && FreezerFx != undefined)
		FreezerFx.setAttribute(recAttrIdx, 0.0);
}

inline function forceStopPlay()
{
	playButton.setValue(0);
	if (playAttrIdx >= 0 && FreezerFx != undefined)
		FreezerFx.setAttribute(playAttrIdx, 0.0);
}

// Force the Clear button (and its DSP attribute) back to 0 so the
// node's lastClear edge detector is rearmed for the next press.
inline function resetClearButton()
{
	clearButton.setValue(0);
	if (clearAttrIdx >= 0 && FreezerFx != undefined)
		FreezerFx.setAttribute(clearAttrIdx, 0.0);
}

inline function tickRecCountdown()
{
	local r = recButton.getValue();
	local p = (playButton == undefined) ? 0.0 : playButton.getValue();

	// === Rec rising edge ===
	// Transport interlock: if Play is on, kill it before recording starts
	// so the user always hears the new take from the start.
	if (recLastState < 0.5 && r >= 0.5)
	{
		if (p >= 0.5)
		{
			forceStopPlay();
			p = 0.0;
		}
		recTicksLeft = REC_TOTAL_TICKS;
		setTimeLabelTicks(recTicksLeft);
	}
	// === Rec falling edge ===
	else if (recLastState >= 0.5 && r < 0.5)
	{
		recTicksLeft = 0;
		setTimeLabelTicks(0);

		// If the falling edge was caused by Clear we must NOT mark the
		// loop as having content; otherwise the LED would flip back to
		// the "loaded" colour right after the user wiped the buffer.
		if (clearJustFired > 0)
			clearJustFired = 0;
		else
			loopHasContent = 1;
	}
	// === Held high: decrement and auto-stop on zero ===
	else if (r >= 0.5 && recTicksLeft > 0)
	{
		recTicksLeft = recTicksLeft - 1;
		setTimeLabelTicks(recTicksLeft);

		if (recTicksLeft <= 0)
			forceStopRec();
	}

	// === Play rising edge while recording → stop rec ===
	// HISE has already pushed Play=1 to the DSP by the time we see the
	// edge here, but loopLen is still 0 at that moment so playback is
	// silent. forceStopRec() then locks loopLen and audio kicks in.
	if (playLastState < 0.5 && p >= 0.5 && r >= 0.5)
		forceStopRec();

	recLastState  = r;
	playLastState = p;
}

// =============================================================
//  ledPanel — recording / playback indicator
//   • recording : red, blinking
//   • playing   : solid green
//   • idle      : solid white
//  All states are drawn with an additive 2-layer glow halo.
// =============================================================

const var LED_COL_RED   = 0xFFFF3030;
const var LED_COL_GREEN = 0xFF3CE07A;
const var LED_COL_WHITE = 0xFFF0F0F0;
const var LED_COL_BLACK = 0xFF000000;

const var LED_BLINK_TICKS = 10;     // 10 * 20 ms = 200 ms half-period

reg ledBlinkPhase   = 1;            // 1 = lit, 0 = dark
reg ledBlinkCounter = 0;
reg ledLastRec      = 0;
reg ledLastPlay     = 0;
reg ledLastClear    = 0;
reg loopHasContent  = 0;            // 0 = empty buffer, 1 = something recorded
reg clearJustFired  = 0;            // suppress the next Rec falling-edge writeback

ledPanel.setPaintRoutine(function (g)
{
	var area = this.getLocalBounds(0);
	var w    = area[2];
	var h    = area[3];
	var cx   = w * 0.5;
	var cy   = h * 0.5;
	var size = (w < h) ? w : h;

	var rRaw = recButton.getValue();
	var pRaw = (playButton == undefined) ? 0.0 : playButton.getValue();

	var col       = (loopHasContent > 0) ? LED_COL_WHITE : LED_COL_BLACK;
	var glowCol   = col;
	var coreVisible = true;

	if (rRaw >= 0.5)
	{
		col     = LED_COL_RED;
		glowCol = LED_COL_RED;
		if (ledBlinkPhase < 0.5)
			coreVisible = false;
	}
	else if (pRaw >= 0.5 && loopHasContent > 0)
	{
		col     = LED_COL_GREEN;
		glowCol = LED_COL_GREEN;
	}

	var coreR   = size * 0.13;
	var borderR = size * 0.155;
	var glow1R  = size * 0.19;
	var glow2R  = size * 0.27;

	// Outer glow halos (drawn first, sit behind everything)
	if (coreVisible)
	{
		g.setColour(Colours.withAlpha(glowCol, 0.18));
		g.fillEllipse([cx - glow2R, cy - glow2R, glow2R * 2.0, glow2R * 2.0]);

		g.setColour(Colours.withAlpha(glowCol, 0.45));
		g.fillEllipse([cx - glow1R, cy - glow1R, glow1R * 2.0, glow1R * 2.0]);
	}

	// Solid black border ring (between core and glow)
	g.setColour(LED_COL_BLACK);
	g.fillEllipse([cx - borderR, cy - borderR, borderR * 2.0, borderR * 2.0]);

	// Core fill
	if (coreVisible)
	{
		g.setColour(col);
		g.fillEllipse([cx - coreR, cy - coreR, coreR * 2.0, coreR * 2.0]);
	}
});

inline function tickLed()
{
	local rOn = (recButton.getValue()  >= 0.5) ? 1 : 0;
	local pOn = (playButton == undefined) ? 0
	          : ((playButton.getValue() >= 0.5) ? 1 : 0);
	local cOn = (clearButton == undefined) ? 0
	          : ((clearButton.getValue() >= 0.5) ? 1 : 0);

	local dirty = false;

	// Clear rising edge → loop is now empty again. Also reset the
	// transport buttons because the DSP's clearLoopBuffer() already
	// sets playing=recording=false internally; without this the UI
	// buttons would still latch high and the LED would lie.
	// Finally, snap the Clear button itself back to 0 so it's always
	// armed and ready to fire again on the next press.
	if (cOn > ledLastClear)
	{
		loopHasContent = 0;
		if (recButton.getValue() >= 0.5)
		{
			clearJustFired = 1;
			forceStopRec();
		}
		if (playButton.getValue() >= 0.5)
			forceStopPlay();
		resetClearButton();
		cOn   = 0;
		dirty = true;
	}
	ledLastClear = cOn;

	if (rOn != ledLastRec || pOn != ledLastPlay)
	{
		ledLastRec  = rOn;
		ledLastPlay = pOn;
		dirty = true;
	}

	if (rOn > 0)
	{
		ledBlinkCounter = ledBlinkCounter + 1;
		if (ledBlinkCounter >= LED_BLINK_TICKS)
		{
			ledBlinkCounter = 0;
			ledBlinkPhase   = (ledBlinkPhase > 0) ? 0 : 1;
			dirty = true;
		}
	}
	else
	{
		if (ledBlinkPhase < 1)
		{
			ledBlinkPhase = 1;
			dirty = true;
		}
		ledBlinkCounter = 0;
	}

	if (dirty)
		ledPanel.repaint();
}

ledPanel.repaint();


// =============================================================
//  Freeze button — momentary "lock the texture" toggle.
//   • rising edge : remember KnobSmear's current value and snap
//                   the slider (and the DSP attribute) to 1.0,
//                   which the C++ node interprets as "no breathing"
//                   (smear = 1 - v ⇒ internal smear = 0 ⇒ static).
//   • falling edge: restore the saved value so the user lands back
//                   exactly where they were before the freeze.
//  Pushed via setAttribute() because setValue() alone does not
//  re-fire the DSP callback (same trick used for Rec/Play/Clear).
// =============================================================
inline function tickFreeze()
{
	local f = (freezeButton == undefined) ? 0.0 : freezeButton.getValue();

	if (freezeLastState < 0.5 && f >= 0.5)
	{
		savedSmear = KnobSmear.getValue();
		KnobSmear.setValue(1.0);
		if (smearAttrIdx >= 0 && FreezerFx != undefined)
			FreezerFx.setAttribute(smearAttrIdx, 1.0);
		KnobSmear.set("enabled", false);
	}
	else if (freezeLastState >= 0.5 && f < 0.5)
	{
		KnobSmear.set("enabled", true);
		KnobSmear.setValue(savedSmear);
		if (smearAttrIdx >= 0 && FreezerFx != undefined)
			FreezerFx.setAttribute(smearAttrIdx, savedSmear);
	}

	freezeLastState = f;
}


recCountdownTimer.setTimerCallback(function ()
{
	tickRecCountdown();
	tickLed();
	tickFreeze();
});
recCountdownTimer.startTimer(REC_TICK_MS);
setTimeLabelTicks(0);


// =============================================================
//  Knob value display.
//
//  While a knob is being dragged or hovered, its companion label
//  swaps from the designer-chosen name (e.g. "spaceshipness") to
//  the current value. When the pointer leaves, the original label
//  text is restored. All knob/label pairs go through a single
//  broadcaster, so adding more is just a matter of extending the
//  arrays below (keep them in the same order).
//
//  KnobPhaseRandom is invisible in the UI so it's not included.
//  UiKnobDecimals controls how many digits we show after the dot
//  for each knob — main-panel knobs are 0..1 so we use 2 decimals,
//  while the settings-panel makeup/pan run on real-world units and
//  look better with 1 decimal (e.g. "-12.5 dB").
// =============================================================
const var UiKnobs = [
	KnobCue,
	KnobFreezeAmount,
	KnobSmear,
	Content.getComponent("loopFreezeKnob"),
	Content.getComponent("decayLoopKnob"),
	Content.getComponent("loopVolumeSlider"),
	Content.getComponent("mainVolumeSlider"),
	Content.getComponent("makeupKnob"),
	Content.getComponent("panKnob")
];

const var UiLabels = [
	Content.getComponent("loopMixLabel"),
	Content.getComponent("spaceshipnessLabel"),
	Content.getComponent("diluteLabel"),
	Content.getComponent("spaceshipnessLabel2"),
	Content.getComponent("freezeLoopLabel"),
	Content.getComponent("looperGainLabel"),
	Content.getComponent("CH1GainLabel"),
	Content.getComponent("makeupLabel"),
	Content.getComponent("makeupLabel1")
];

const var UiKnobDecimals = [2, 2, 2, 2, 2, 1, 1, 1, 1];

// InputLevel / LoopLevel stay 0..1 in the DSP; labels show dB on hover.
inline function linearGainToDbString(g)
{
	if (g <= 0.000001)
		return "-inf dB";

	local db = 20.0 * Math.log(g) / Math.log(10.0);
	return Engine.doubleToString(db, 1) + " dB";
}

// Cache each label's designer-chosen text so we can restore it on
// mouse-out. We can't fall back to the knob's "text" attribute
// (like the source snippet did) because in this project that's the
// DSP parameter id, e.g. "FreezeAmount", which isn't what the
// user is meant to see.
const var defaultLabelTexts = [];
reg knobLabelIdx = 0;
for (knobLabelIdx = 0; knobLabelIdx < UiLabels.length; knobLabelIdx++)
	defaultLabelTexts[knobLabelIdx] = UiLabels[knobLabelIdx].get("text");

// Scratch regs reused inside the broadcaster callback. They can't
// be declared `local` there because the callback is a regular
// function (not an inline function) and HISE rejects `local`
// outside inline functions / callbacks.
reg labelIterI = 0;
reg labelSuffix = "";

const var LabelBroadcaster = Engine.createBroadcaster({
	"id":   "Knob Labels",
	"args": ["component", "event"]
});

LabelBroadcaster.attachToComponentMouseEvents(UiKnobs, "All Callbacks", "Knob & Label Mouse Listener");

LabelBroadcaster.addListener("LabelListener", "Show knob value while dragging or hovering", function (component, event)
{
	if (event.drag || event.hover)
	{
		for (labelIterI = 0; labelIterI < UiKnobs.length; labelIterI++)
		{
			if (UiKnobs[labelIterI] == component)
			{
				// loopVolumeSlider (5) / mainVolumeSlider (6): linear gain → dB display only.
				if (labelIterI == 5 || labelIterI == 6)
					UiLabels[labelIterI].set("text", linearGainToDbString(component.getValue()));
				else
				{
					labelSuffix = UiKnobs[labelIterI].get("suffix");
					UiLabels[labelIterI].set("text",
						Engine.doubleToString(component.getValue(), UiKnobDecimals[labelIterI])
						+ labelSuffix);
				}
				break;
			}
		}
	}
	else
	{
		for (labelIterI = 0; labelIterI < UiLabels.length; labelIterI++)
			UiLabels[labelIterI].set("text", defaultLabelTexts[labelIterI]);
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
 