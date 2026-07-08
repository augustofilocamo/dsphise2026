Content.makeFrontInterface(1024, 680);

//Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Tuffy-Regular.ttf", "Tuffy");
//Engine.setGlobalFont("Tuffy");

include("pluginVSstandalone.js");
include("menuPanels.js");
include("Authorisation.js");

const var STEMS_RUN_FOLDER = "current";

const var MidiPlayer1 = Synth.getMidiPlayer("MIDI Player1");
MidiPlayer1.setUseTimestampInTicks(true);
const var MidiPlayer2 = Synth.getMidiPlayer("MIDI Player2");
if (MidiPlayer2) MidiPlayer2.setUseTimestampInTicks(true);
const var MidiPlayer3 = Synth.getMidiPlayer("MIDI Player3");
if (MidiPlayer3) MidiPlayer3.setUseTimestampInTicks(true);
const var MidiPlayer4 = Synth.getMidiPlayer("MIDI Player4");
if (MidiPlayer4) MidiPlayer4.setUseTimestampInTicks(true);

const var bpmKnob = Content.getComponent("Tempo");
bpmKnob.setRange(-1, 300, 1); // -1 = sync to host DAW

const var BPM = 100.0;
const var FindClosestTask = Engine.createBackgroundTask("FindClosestCLI");
FindClosestTask.setTimeOut(60000);
const var DEBUG_WORKER_LOG = false;
reg FindClosestLastLine = "";
reg LastMatches = [];
reg CurrentMatchOffset = 0;
reg NextMatchOffset = 0;
reg AllCachedMatches = [];
reg sendToServerButtonLabel = "Generate";
reg LastMatchBars = 1;
// Parámetros de la última petición al CLI (para invalidar caché cuando cambian)
reg LastRequestFallbackDist = -1.0;
reg LastRequestHhMin = -1;
reg LastRequestTernary = 0;
reg LastMidPath2 = "";
reg LastMidPath3 = "";
reg LastMidPath4 = "";
reg LastMidPath2Expand = "";
reg LastMidPath3Expand = "";
reg LastMidPath4Expand = "";
reg GridAnimIndex = 0;
const var GRID_ANIM_LEAD_MS = 30;
var GridAnimComponents = [];
var GridAnimBaseBounds = [];
var GridAnimSlotIndex = [];
var GridAnimIsTernary = [];
const var DISPLAY_BARS = 2;   // compases mostrados al cargar matches

inline function getEffectiveTempoBpm()
{
	local knobBpm = bpmKnob ? bpmKnob.getValue() : BPM;

	// -1 = follow host tempo
	if (knobBpm == -1)
	{
		local hostBpm = Engine.getHostBpm();
		if (hostBpm >= 40 && hostBpm <= 300)
			return hostBpm;
		return BPM;
	}

	if (knobBpm < 40 || knobBpm > 300)
		return BPM;

	return knobBpm;
}


var templatesButton = Content.getComponent("templatesButton");
var presetsPanel = Content.getComponent("presetsPanel");
var presetsFloatingTile = Content.getComponent("presetsFloatingTile");






// Leer batch size desde el combo
var batchCombo = Content.getComponent("batchSizeComboBox");
var topN = 9; // fallback por si algo falla


inline function onbatchSizeComboBoxControl(component, value)
{
	// Items del combo: "6", "9", "12", "15", "18", "24"  
    local txt = batchCombo.getItemText(); // value es 1-based
    topN = parseInt(txt);
    Console.print(topN);
};

Content.getComponent("batchSizeComboBox").setControlCallback(onbatchSizeComboBoxControl);


// Leer expand size desde el combo
var expandCombo = Content.getComponent("expandSizeComboBox");
var topX = 9; // fallback por si algo falla

inline function onexpandSizeComboBoxControl(component, value)
{
	local txt = expandCombo.getItemText(); // value es 1-based
    topX = parseInt(txt);
    Console.print(topX);
};

Content.getComponent("expandSizeComboBox").setControlCallback(onexpandSizeComboBoxControl);









// Samplemap switching for Sampler1
const var DrumSampler1 = Synth.getChildSynth("Sampler1");

inline function loadSampler1SampleMap(sampleMapId)
{
	if (!DrumSampler1)
	{
		Console.print("Sampler1 no encontrado");
		return;
	}

	DrumSampler1.asSampler().loadSampleMap(sampleMapId);
	Console.print("Cargando samplemap: " + sampleMapId);
}

inline function onbtnAccousticControl(component, value)
{
	if (value <= 0.5)
		return;

	loadSampler1SampleMap("sfz2");
	btnElectronic.setValue(0);
}

inline function onbtnElectronicControl(component, value)
{
	if (value <= 0.5)
		return;

	loadSampler1SampleMap("electrokit");
	btnAccoustic.setValue(0);
}

var btnAccoustic = Content.getComponent("btnAccoustic");
if (btnAccoustic)
	btnAccoustic.setControlCallback(onbtnAccousticControl);

var btnElectronic = Content.getComponent("btnElectronic");
if (btnElectronic)
	btnElectronic.setControlCallback(onbtnElectronicControl);

// Cierra preset browser on load che
const var uph = Engine.createUserPresetHandler();

uph.setPostCallback(function()
{
	if (presetsPanel)
		presetsPanel.showControl(0);

	if (templatesButton)
	{
		templatesButton.setValue(0);
		templatesButton.sendRepaintMessage();
	}
	
	// Vaciar players 2-4 (no tocar player 1)
	setOtherPlayStopsToZero(1); // apaga playStop2/3/4 y para MidiPlayer2/3/4
	
	if (MidiPlayer2) MidiPlayer2.clearAllSequences();
	if (MidiPlayer3) MidiPlayer3.clearAllSequences();
	if (MidiPlayer4) MidiPlayer4.clearAllSequences();
	
});

// LAF para Preset Browser: quitar líneas divisorias de columnas
const var lafPresetBrowser = Content.createLocalLookAndFeel();
lafPresetBrowser.registerFunction("drawPresetBrowserColumnBackground", function(g, obj)
{
	// Fondo simple sin líneas verticales entre columnas
	g.setColour(0x00000000);
	g.fillRect(obj.area);
});
lafPresetBrowser.registerFunction("drawPresetBrowserBackground", function(g, obj)
{
	g.setColour(0x00000000);
	g.fillRect(obj.area);
});
lafPresetBrowser.registerFunction("drawPresetBrowserListItem", function(g, obj)
{



	g.setColour(0x00000000);
	g.fillRect(obj.area);


	g.fillRect(obj.area);
	g.setColour(0xFF9B9B9B);
	g.setFont("Tuffy", 24);
	// texto: hover blanco, normal gris
	if (obj.hover)
		g.setColour(0xFFFFFFFF);
	else
		g.setColour(0xFF9B9B9B);
	g.drawAlignedText(obj.text, obj.area, "left");
});
if (presetsFloatingTile)
{
	presetsFloatingTile.setLocalLookAndFeel(lafPresetBrowser);

}

inline function ontemplatesButtonControl(component, value)
{
	presetsPanel.showControl(value);
};

Content.getComponent("templatesButton").setControlCallback(ontemplatesButtonControl);

//Optional setting a global font
//const var GlobalFonnt = Engine.setGlobalFont("Charter");

//Put all your knobs and labels in this array (they need to be in the same order)
const var UiKnobs = [Content.getComponent("Temperature"), 
					 Content.getComponent("Tempo")
					 ];
				   
const var UiLabels = [Content.getComponent("labelTemperature"),
					  Content.getComponent("labelTempo")
					  ];


for (i = 0; i < UiLabels.length; i++)
{
	UiLabels[i].set("editable", false);
	UiLabels[i].set("enabled", true);
	UiLabels[i].set("textColour", 0xFF9B9B9B);
	UiLabels[i].set("fontName", "Tuffy");
	UiLabels[i].set("fontSize", "22");
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
                // Tempo knob special value: -1 means host sync.
                if (UiKnobs[i] == bpmKnob && component.getValue() == -1)
                {
                    UiLabels[i].set("text", "Synced");
                }
                else
                {
                    reg knobSuffix = UiKnobs[i].get("suffix");
                    reg valueChange = Engine.doubleToString(component.getValue(),0) + knobSuffix; // The number indicates how many decimal points
                    UiLabels[i].set("text", valueChange);
                }
                break;
            }
        }
    }
    else
    {
        for (i = 0; i < UiKnobs.length; i++)
        {
            if (UiKnobs[i] == bpmKnob && UiKnobs[i].getValue() == -1)
                UiLabels[i].set("text", "Synced");
            else
                UiLabels[i].set("text", UiKnobs[i].get("text"));
        }
    }
});

// Initialize the labels with the knobs' names
for (i = 0; i < UiLabels.length; i++)
{
    if (UiKnobs[i] == bpmKnob && UiKnobs[i].getValue() == -1)
        UiLabels[i].set("text", "Synced");
    else
        UiLabels[i].set("text", UiKnobs[i].get("text"));
}

// Tips rotativos (cada 20s) para guiar al usuario
const var tipsLabel = Content.getComponent("tipsLabel");
var tipsList = [
	"ⓘ Simpler grid patterns usually get better matches.",
	"ⓘ Try patterns you can sing or clap naturally.",
	"ⓘ Low Temperature follows your grid closely; high Temperature is freer.",
	"ⓘ Switch ternary mode only for triplet-like grooves.",
	"ⓘ Use Re-generate after changing grid or controls.",
	"ⓘ Start from 4 strong hits, then add ghost notes.",
	"ⓘ Too many hits can make matches less consistent.",
	"ⓘ Use Next row to audition alternatives quickly.",
	"ⓘ Expand when you like a match and need full bars."
];
reg tipsIndex = 0;
var tipsTimer = Engine.createTimerObject();
tipsTimer.setTimerCallback(function()
{
	if (!tipsLabel || tipsList.length == 0)
		return;

	tipsIndex = (tipsIndex + 1) % tipsList.length;
	tipsLabel.set("text", tipsList[tipsIndex]);
});
if (tipsLabel && tipsList.length > 0)
{
	tipsLabel.set("text", tipsList[0]);
	tipsTimer.startTimer(20000);
}





// LAFs

// LAF sd*: base gris, filete negro, círculo #e81366 (solo este con alpha)
const var FILETE = 3.5;
const var lafSd = Content.createLocalLookAndFeel();
lafSd.registerFunction("drawToggleButton", function(g, obj)
{
	var a = obj.area;
	// Escala opcional desde la propiedad scaleFactor del componente (usada por la animación de grilla)
	var scale = 1.0;
	if (obj.component)
	{
		var sf = obj.component.get("scaleFactor");
		if (sf > 0.0) scale = sf;
	}
	var side = Math.min(a[2], a[3]) * 0.6 * scale;
	var cx = a[0] + a[2] / 2;
	var cy = a[1] + a[3] / 2;
	// Base gris (el más grande, abajo)
	var sg = side + 2 * FILETE;
	g.setColour(0xFF404040);
	g.fillEllipse([cx - sg/2, cy - sg/2, sg, sg]);
	// Filete negro (sobresale un poco del magenta)
	var sb = side + FILETE;
	g.setColour(0xFF181818);
	g.fillEllipse([cx - sb/2, cy - sb/2, sb, sb]);
	// Círculo magenta; valor 0 = 100% transparente
	var alpha = obj.value > 0.5 ? 1.0 : 0.0;
	g.setColour(Colours.withAlpha(0xFFE81366, alpha));
	g.fillEllipse([cx - side/2, cy - side/2, side, side]);
});
var i = 1;
while (i <= 16)
{
	var c = Content.getComponent("sd" + i);
	if (c) c.setLocalLookAndFeel(lafSd);
	i += 1;
}
i = 1;
while (i <= 12)
{
	var c = Content.getComponent("sd" + i + "t");
	if (c) c.setLocalLookAndFeel(lafSd);
	i += 1;
}


// LAF bd*: misma estructura que sd*; círculo azul (solo este con alpha)
const var lafBd = Content.createLocalLookAndFeel();
lafBd.registerFunction("drawToggleButton", function(g, obj)
{
	var a = obj.area;
	// Escala opcional desde scaleFactor (animación de grilla)
	var scale = 1.0;
	if (obj.component)
	{
		var sf = obj.component.get("scaleFactor");
		if (sf > 0.0) scale = sf;
	}
	var side = Math.min(a[2], a[3]) * 0.6 * scale;
	var cx = a[0] + a[2] / 2;
	var cy = a[1] + a[3] / 2;
	var sg = side + 2 * FILETE;
	g.setColour(0xFF404040);
	g.fillEllipse([cx - sg/2, cy - sg/2, sg, sg]);
	var sb = side + FILETE;
	g.setColour(0xFF181818);
	g.fillEllipse([cx - sb/2, cy - sb/2, sb, sb]);
	var alpha = obj.value > 0.5 ? 1.0 : 0.0;
	g.setColour(Colours.withAlpha(0xFF2196F3, alpha));
	g.fillEllipse([cx - side/2, cy - side/2, side, side]);
});
i = 1;
while (i <= 16)
{
	var c = Content.getComponent("bd" + i);
	if (c) c.setLocalLookAndFeel(lafBd);
	i += 1;
}
i = 1;
while (i <= 12)
{
	var c = Content.getComponent("bd" + i + "t");
	if (c) c.setLocalLookAndFeel(lafBd);
	i += 1;
}


// LAF sendToServerButton: mismo efecto que progressPanel (5 cuadrados izq→der + alpha + agrandar al 100%) + texto "Generate"
const var lafSendToServer = Content.createLocalLookAndFeel();
lafSendToServer.registerFunction("drawToggleButton", function(g, obj)
{
	var a = obj.area;
	var w = a[2];
	var h = a[3];
	var x = a[0];
	var y = a[1];
	var iconLeft = x + 0.12 * w;
	var cy = y + h / 2;
	var cx0 = iconLeft + 20;
	var spacing = 18;
	var angle = 0.785398;
	var isIdle = obj.value < 0.5;
	var t = Engine.getUptime();
	var greyColour = 0xFF606060;
	var colourMagenta = 0xFFE81366;
	var colourBlue = 0xFF2196F3;
	for (var idx = 0; idx < 5; idx++)
	{
		var cx = cx0 + (idx - 2) * spacing;
		var phase = t * 2 - idx * 1.0;
		var alpha = isIdle ? 1.0 : (0.2 + 0.8 * (0.5 + 0.5 * Math.sin(phase)));
		var sz = isIdle ? 7 : (5 + 2 * (alpha - 0.2) / 0.8);
		var half = sz / 2;
		if (isIdle)
			g.setColour(idx === 2 ? colourMagenta : greyColour);
		else
			g.setColour(Colours.withAlpha(idx % 2 === 0 ? colourMagenta : colourBlue, alpha));
		g.rotate(angle, [cx, cy]);
		g.fillRect([cx - half, cy - half, sz, sz]);
		g.rotate(-angle, [cx, cy]);
	}
	var textLeft = iconLeft + 80;
	g.setColour(0xFFADADAD);
	g.setFont("Tuffy", Math.min(27, h * 0.5));
	var label = sendToServerButtonLabel;
	g.drawAlignedText(label, [textLeft, y, w - (textLeft - x), h], "left");
});


// Timer de animación para LAF de sendToServerButton (cuadrados animados)
var progressRepaintTimer = Engine.createTimerObject();
progressRepaintTimer.setTimerCallback(function()
{
	if (sendToServerBtn) sendToServerBtn.sendRepaintMessage();
});
progressRepaintTimer.startTimer(50);

inline function registerGridAnimButton(componentRef, slotIndex, isTernaryMode)
{
	if (!componentRef) return;
	GridAnimComponents.push(componentRef);
	GridAnimBaseBounds.push([
		componentRef.get("x"),
		componentRef.get("y"),
		componentRef.get("width"),
		componentRef.get("height")
	]);
	GridAnimSlotIndex.push(slotIndex);
	GridAnimIsTernary.push(isTernaryMode ? 1 : 0);
}

inline function resetGridAnimVisuals()
{
	local i = 0;
	while (i < GridAnimComponents.length)
	{
		local c = GridAnimComponents[i];
		if (c)
		{
			local base = GridAnimBaseBounds[i];
			c.set("x", base[0]);
			c.set("y", base[1]);
			c.set("width", base[2]);
			c.set("height", base[3]);
			c.sendRepaintMessage();
		}
		i += 1;
	}
}

inline function getGridAnimPlaybackPosition()
{
	// Tomamos el player activo según los botones playStop (exclusivos)
	local p1 = Content.getComponent("playStop1");
	local p2 = Content.getComponent("playStop2");
	local p3 = Content.getComponent("playStop3");
	local p4 = Content.getComponent("playStop4");

	if (p1 && p1.getValue() > 0.5 && MidiPlayer1) return MidiPlayer1.getPlaybackPosition();
	if (p2 && p2.getValue() > 0.5 && MidiPlayer2) return MidiPlayer2.getPlaybackPosition();
	if (p3 && p3.getValue() > 0.5 && MidiPlayer3) return MidiPlayer3.getPlaybackPosition();
	if (p4 && p4.getValue() > 0.5 && MidiPlayer4) return MidiPlayer4.getPlaybackPosition();

	return -1.0;
}

// Timer de animación para la grilla: los pasos activos se escalan levemente cuando es su turno
var gridAnimTimer = Engine.createTimerObject();
gridAnimTimer.setTimerCallback(function()
{
	// Detectar si estamos en modo ternario (12 slots) o binario (16 slots)
	var ternaryBtn = Content.getComponent("btnTernary");
	var isTernary = (ternaryBtn && ternaryBtn.getValue() > 0.5);
	var slots = isTernary ? 12 : 16;
	// Calcular duración de un slot en ms según Tempo (incluye host sync si Tempo=-1)
	var bpm = getEffectiveTempoBpm();
	var barMs = 4.0 * 60000.0 / bpm;
	var stepMs = barMs / slots;
	if (stepMs < 20) stepMs = 20;

	// Sync principal: usar playbackPosition del player activo + pequeño adelanto visual
	var pos = getGridAnimPlaybackPosition();
	if (pos >= 0.0)
	{
		var leadBars = GRID_ANIM_LEAD_MS / barMs;
		var posLead = pos + leadBars;
		while (posLead >= 1.0) posLead -= 1.0;
		while (posLead < 0.0) posLead += 1.0;
		GridAnimIndex = Math.floor(posLead * slots);
		if (GridAnimIndex < 0) GridAnimIndex = 0;
		if (GridAnimIndex >= slots) GridAnimIndex = slots - 1;
	}
	else
	{
		// Fallback cuando no hay player activo: continuar stepping por timer
		GridAnimIndex = (GridAnimIndex + 1) % slots;
	}

	// Recorremos todos los botones de grilla registrados y animamos tamaño real
	var i = 0;
	while (i < GridAnimComponents.length)
	{
		var c = GridAnimComponents[i];
		if (c)
		{
			var base = GridAnimBaseBounds[i];
			var bx = base[0];
			var by = base[1];
			var bw = base[2];
			var bh = base[3];
			var slotIdx = GridAnimSlotIndex[i];
			var isBtnTernary = GridAnimIsTernary[i] == 1;
			var inCurrentMode = (isTernary && isBtnTernary) || ((!isTernary) && (!isBtnTernary));
			var activeNow = inCurrentMode && (slotIdx == GridAnimIndex) && (c.getValue() > 0.5);
			var scale = activeNow ? 0.9 : 1.0;
			var nw = bw * scale;
			var nh = bh * scale;
			var nx = bx + (bw - nw) * 0.5;
			var ny = by + (bh - nh) * 0.5;
			c.set("x", nx);
			c.set("y", ny);
			c.set("width", nw);
			c.set("height", nh);
			c.sendRepaintMessage();
		}
		i += 1;
	}

	gridAnimTimer.startTimer(stepMs);
});
// La animación arranca al activar playStop1.


// Panel del primer resultado (tab abierto): pinta solo las notas de MidiPlayer2 en rojo
const var PLAYER_A_VIEWER_X = 270;
const var PLAYER_A_VIEWER_Y = 330;
const var PLAYER_A_VIEWER_W = 480;
const var PLAYER_A_VIEWER_H = 70;
const var PLAYER_A_PAD_H = 40;  // padding izquierda y derecha (px)
const var NOTE_COLOR_JORO = 0xFFE81366;  // rojo/magenta SD
const var NOTE_COLOR_BD = 0xFF2196F3;    // azul BD (mismo que LAF bd*)
const var NOTE_BAR_W = 2;       // ancho de la línea en visor MIDI (px)
const var NOTE_BAR_H_MIN = 2;   // altura mínima visor (velocity 0)
const var NOTE_BAR_H_MAX = 34;  // altura máxima visor (velocity 127)
const var NOTE_BAR_CAP_R = 2;   // radio de los círculos en cada punta de la barra (px)
const var MIDI_NOTE_BD = 36;   // Bass Drum 1 (GM)
const var PLAYHEAD_W = 2;      // ancho del playhead (px)
const var PLAYHEAD_COLOR = 0xFFFFFFFF;  // blanco

// Escala cuando la nota está siendo tocada (playhead dentro del rect de la nota)
const var NOTE_PLAYING_SCALE = 1.2;

// Paint MIDI viewer: rectángulos finos (2px) con círculo en cada punta. Alto = velocity. Nota tocada = más grande.
inline function paintMidiViewerCircles(g, mp, panel)
{
	g.fillAll(0x00000000);
	if (!mp) return;
	local flashMargin = 27;
	local panelWidth = panel.getWidth();
	local panelHeight = panel.getHeight();
	local noteList = mp.getNoteRectangleList([0, 0, panelWidth, panelHeight]);
	if (mp.isEmpty() != 0 || noteList.length == 0) return;
	local eventList = mp.getEventList();
	local velocities = [];
	local noteNumbers = [];
	local ei = 0;
	while (ei < eventList.length)
	{
		if (eventList[ei].isNoteOn())
		{
			velocities.push(eventList[ei].getVelocity());
			noteNumbers.push(eventList[ei].getNoteNumber());
		}
		ei++;
	}
	local playbackPos = mp.getPlaybackPosition() * (panelWidth - flashMargin * 2) + flashMargin;
	local halfBarW = NOTE_BAR_W / 2;
	local centerY = panelHeight / 2;
	local idx = 0;
	while (idx < noteList.length)
	{
		local note = noteList[idx];
		local noteX = (note[0] / panelWidth) * (panelWidth - flashMargin * 2) + flashMargin;
		local noteWidth = (note[2] / panelWidth) * (panelWidth - flashMargin * 2);
		local vel = (idx < velocities.length) ? velocities[idx] / 127 : 1;
		local baseHeight = NOTE_BAR_H_MIN + vel * (NOTE_BAR_H_MAX - NOTE_BAR_H_MIN);
		if (baseHeight < NOTE_BAR_H_MIN) baseHeight = NOTE_BAR_H_MIN;
		if (baseHeight > NOTE_BAR_H_MAX) baseHeight = NOTE_BAR_H_MAX;
		local centerX = noteX + (noteWidth / 2);
		local noteNum = (idx < noteNumbers.length) ? noteNumbers[idx] : 0;
		local isBd = (noteNum == MIDI_NOTE_BD);
		local barHeight = isBd ? (baseHeight * 0.7) : baseHeight;
		local noteColor = isBd ? NOTE_COLOR_BD : NOTE_COLOR_JORO;
		local isPlaying = (playbackPos >= noteX && playbackPos <= noteX + noteWidth);
		local scale = isPlaying ? NOTE_PLAYING_SCALE : 1.0;
		local scaledBarH = barHeight * scale;
		local barTop = centerY - scaledBarH / 2;
		local barBottom = centerY + scaledBarH / 2;
		local capR = NOTE_BAR_CAP_R * scale;
		local capD = capR * 2;
		local barW = NOTE_BAR_W * scale;
		local halfBarWSc = barW / 2;
		local noteRect = [
			centerX - halfBarWSc,
			barTop,
			barW,
			scaledBarH
		];
		g.setColour(noteColor);
		g.fillRect(noteRect);
		g.fillEllipse([centerX - capR, barTop - capR, capD, capD]);
		g.fillEllipse([centerX - capR, barBottom - capR, capD, capD]);
		idx++;
	}
}

var playerANoteList = [];
var playerAEventList = [];
var playerANoteOnlyList = [];
var playerANoteVelocities = [];
var playerANoteNumbers = [];
var playerAStartTicks = [];
var playerAEndTicks = [];
var playerAPaintI = 0;
var playerAEventJ = 0;
var playerAMaxEndTicks = 0;
var playerAContentW = 0;
var playerAPlaybackX = 0;
var playerABarH = 0;
var playerABarY = 0;
var playerABarCx = 0;
var playerABarD = 0;
var playerABarW = 0;
var playerACapR = 0;
var playerAOffsetX = 0;

var m3NoteList = [];
var m3EventList = [];
var m3NoteOnlyList = [];
var m3NoteVelocities = [];
var m3NoteNumbers = [];
var m3StartTicks = [];
var m3EndTicks = [];
var m3PaintI = 0;
var m3EventJ = 0;
var m3MaxEndTicks = 0;
var m3ContentW = 0;
var m3PlaybackX = 0;
var m3BarH = 0;
var m3BarY = 0;
var m3BarCx = 0;
var m3BarD = 0;
var m3BarW = 0;
var m3CapR = 0;
var m3OffsetX = 0;

var m4NoteList = [];
var m4EventList = [];
var m4NoteOnlyList = [];
var m4NoteVelocities = [];
var m4NoteNumbers = [];
var m4StartTicks = [];
var m4EndTicks = [];
var m4PaintI = 0;
var m4EventJ = 0;
var m4MaxEndTicks = 0;
var m4ContentW = 0;
var m4PlaybackX = 0;
var m4BarH = 0;
var m4BarY = 0;
var m4BarCx = 0;
var m4BarD = 0;
var m4BarW = 0;
var m4CapR = 0;
var m4OffsetX = 0;

inline function setupPlayerAMidiViewer()
{
	if (!MidiPlayer2) return;
	local panel = Content.getComponent("playerAMidiViewer");
	if (!panel)
	{
		panel = Content.addPanel("playerAMidiViewer", PLAYER_A_VIEWER_X, PLAYER_A_VIEWER_Y);
		if (!panel) return;
		Content.setPropertiesFromJSON("playerAMidiViewer", { "width": PLAYER_A_VIEWER_W, "height": PLAYER_A_VIEWER_H });
	}
	MidiPlayer2.connectToPanel(panel);
	MidiPlayer2.setRepaintOnPositionChange(true);
	panel.setPaintRoutine(function(g)
	{
		paintMidiViewerCircles(g, MidiPlayer2, this);
	});
}

setupPlayerAMidiViewer();

inline function setupPlayerBMidiViewer()
{
	if (!MidiPlayer3) return;
	local panel = Content.getComponent("playerBMidiViewer");
	if (!panel) return;
	MidiPlayer3.connectToPanel(panel);
	MidiPlayer3.setRepaintOnPositionChange(true);
	panel.setPaintRoutine(function(g)
	{
		paintMidiViewerCircles(g, MidiPlayer3, this);
	});
}

inline function setupPlayerCMidiViewer()
{
	if (!MidiPlayer4) return;
	local panel = Content.getComponent("playerCMidiViewer");
	if (!panel) return;
	MidiPlayer4.connectToPanel(panel);
	MidiPlayer4.setRepaintOnPositionChange(true);
	panel.setPaintRoutine(function(g)
	{
		paintMidiViewerCircles(g, MidiPlayer4, this);
	});
}

setupPlayerBMidiViewer();
setupPlayerCMidiViewer();



inline function setStatus(text)
{
	if (statusLabel)
		statusLabel.set("text", text);
	Console.print(text);
}

inline function setSendToServerButtonState(isOn)
{
	local btn = Content.getComponent("sendToServerButton");
	if (btn)
	{
		btn.setValue(isOn ? 1 : 0);
		btn.set("enabled", !isOn);
		btn.sendRepaintMessage();
	}
}

inline function updateExpandButtonsVisibility()
{
	local hasResults = (AllCachedMatches && AllCachedMatches.length > 0) || (LastMatches && LastMatches.length > 0);
	local expandABtn = Content.getComponent("expandAButton");
	local expandBBtn = Content.getComponent("expandBButton");
	local expandCBtn = Content.getComponent("expandCButton");
	if (expandABtn) expandABtn.showControl(hasResults ? 1 : 0);
	if (expandBBtn) expandBBtn.showControl(hasResults ? 1 : 0);
	if (expandCBtn) expandCBtn.showControl(hasResults ? 1 : 0);
}

var cacheFeedbackTimer = Engine.createTimerObject();
cacheFeedbackTimer.setTimerCallback(function()
{
	cacheFeedbackTimer.stopTimer();
	LastMatches = [];
	var j = 0;
	while (j < 3 && (NextMatchOffset + j) < AllCachedMatches.length)
	{
		LastMatches.push(AllCachedMatches[NextMatchOffset + j]);
		j = j + 1;
	}
	NextMatchOffset = NextMatchOffset + 3;
	showMatchesFromOffset(0);
	var pa = Content.getComponent("playerAMidiViewer");
	var pb = Content.getComponent("playerBMidiViewer");
	var pc = Content.getComponent("playerCMidiViewer");
	if (pa) pa.sendRepaintMessage();
	if (pb) pb.sendRepaintMessage();
	if (pc) pc.sendRepaintMessage();
	setSendToServerButtonState(false);
});

inline function appendWorkerLog(line)
{
	if (!DEBUG_WORKER_LOG)
		return;
	local fileDirectory = FileSystem.getFolder(FileSystem.UserPresets).getParentDirectory();
	local logFile = fileDirectory.getChildFile("worker_debug.log");
	local prev = "";
	if (logFile.isFile())
		prev = logFile.loadAsString();
	logFile.writeString(prev + line + "\n");
}

inline function getCliPaths()
{
	// Worker: find_closest_groove_bar_macos (one-shot, fast) en la raíz del proyecto
	local fileDirectory = FileSystem.getFolder(FileSystem.UserPresets).getParentDirectory();
	local cliBin = fileDirectory.getChildFile("find_closest_groove_bar_macos");
	local bankMain = fileDirectory.getChildFile("pattern_bank.npz");
	return {
		"cli_bin": cliBin.toString(cliBin.FullPath),
		"bank_main": bankMain.toString(bankMain.FullPath)
	};
}

// Binary grid: bd1..bd16, sd1..sd16 (original, siempre 16 slots)
inline function collectGridDataBinary()
{
	local bd = [];
	local sd = [];
	local i = 0;
	while (i < 16)
	{
		local bdBtn = Content.getComponent("bd" + (i + 1));
		local sdBtn = Content.getComponent("sd" + (i + 1));
		bd.push(bdBtn ? (bdBtn.getValue() > 0.5 ? 1 : 0) : 0);
		sd.push(sdBtn ? (sdBtn.getValue() > 0.5 ? 1 : 0) : 0);
		i += 1;
	}
	local bpm = getEffectiveTempoBpm();
	return { "bpm": bpm, "bd": bd, "sd": sd };
}

// Ternary grid: bd1t..bd12t, sd1t..sd12t (12 slots)
inline function collectGridDataTernary()
{
	local bd = [];
	local sd = [];
	local i = 0;
	while (i < 12)
	{
		local bdBtn = Content.getComponent("bd" + (i + 1) + "t");
		local sdBtn = Content.getComponent("sd" + (i + 1) + "t");
		bd.push(bdBtn ? (bdBtn.getValue() > 0.5 ? 1 : 0) : 0);
		sd.push(sdBtn ? (sdBtn.getValue() > 0.5 ? 1 : 0) : 0);
		i += 1;
	}
	local bpm = getEffectiveTempoBpm();
	local obj = { "bpm": bpm, "bd": bd, "sd": sd };
	obj.division = "ternary";
	return obj;
}

inline function collectGridData()
{
	local ternaryBtn = Content.getComponent("btnTernary");
	if (ternaryBtn && ternaryBtn.getValue() > 0.5)
		return collectGridDataTernary();
	return collectGridDataBinary();
}

inline function loadExportedMidiIntoPlayer(player, playerName, midPath, numBars, sourceBars)
{
	if (!player)
	{
		Console.print("[Find Closest] " + playerName + " no encontrado");
		return;
	}
	if (!midPath || midPath == "")
	{
		Console.print("[Find Closest] mid_path vacío para " + playerName);
		return;
	}
	if (!numBars || numBars < 1) numBars = 1;
	if (!sourceBars || sourceBars < 1) sourceBars = numBars;
	player.setFile(midPath, true, true);
	local events = player.getEventList();
	local messageList = [];
	local i = 0;
	local maxTs = 0;
	while (i < events.length)
	{
		local e = events[i];
		local ts = e.getTimestamp();
		if (ts > maxTs)
			maxTs = ts;
		local msg = Engine.createMessageHolder();
		msg.setType(e.isNoteOff() ? 2 : 1);
		msg.setTimestamp(ts);
		msg.setNoteNumber(e.getNoteNumber());
		msg.setVelocity(e.getVelocity());
		msg.setChannel(e.getChannel());
		messageList.push(msg);
		i += 1;
	}

	// Si el archivo fuente tiene más compases que los que queremos mostrar,
	// recortamos todo lo que cae fuera del rango solicitado.
	if (numBars < sourceBars && maxTs > 0)
	{
		local ticksPerBar = maxTs / sourceBars;
		local cutoff = ticksPerBar * numBars;
		local filtered = [];
		i = 0;
		while (i < messageList.length)
		{
			if (messageList[i].getTimestamp() < cutoff)
				filtered.push(messageList[i]);
			i += 1;
		}
		messageList = filtered;
	}

	player.clearAllSequences();
	player.create(4, 4, numBars);
	player.flushMessageListToSequence(messageList, 1);
	player.setSequence(1);
	//Console.print("[Find Closest] " + playerName + " <- " + midPath + " events=" + events.length);
}

inline function loadMatchIntoPlayer(match, player, playerName, numBars)
{
	local path = (match && match.mid_path != undefined) ? match.mid_path : ((match && match["mid_path"] != undefined) ? match["mid_path"] : "");
	local pathExpand = (match && match.mid_path_expand != undefined) ? match.mid_path_expand : ((match && match["mid_path_expand"] != undefined) ? match["mid_path_expand"] : path);
	local sourceBars = (match && match.bars != undefined && match.bars > 0) ? match.bars : LastMatchBars;
	if (path == "")
		return;

	if (playerName == "MIDI Player2") { LastMidPath2 = path; LastMidPath2Expand = pathExpand; }
	if (playerName == "MIDI Player3") { LastMidPath3 = path; LastMidPath3Expand = pathExpand; }
	if (playerName == "MIDI Player4") { LastMidPath4 = path; LastMidPath4Expand = pathExpand; }

	// `bank` viene desde el JSON del CLI; a veces el motor lo expone mejor via `match["bank"]`.
	local bankLabel = (match && match.bank != undefined) ? match.bank : ((match && match["bank"] != undefined) ? match["bank"] : "");
	Console.print("[Find Closest] dist=" + match.distance + " player=" + playerName + " bank=" + bankLabel);
	loadExportedMidiIntoPlayer(player, playerName, path, numBars, sourceBars);
}

inline function expandPlayerLoadFull(player, playerName, midPath, numBars, sourceBars)
{
	if (!player)
	{
		setStatus(playerName + " no encontrado");
		return;
	}
	if (!midPath || midPath == "")
	{
		setStatus(playerName + ": cargá un match antes");
		return;
	}
	if (!numBars || numBars < 1)
		numBars = topX;
	if (!sourceBars || sourceBars < 1)
		sourceBars = numBars;
	loadExportedMidiIntoPlayer(player, playerName, midPath, numBars, sourceBars);
	setStatus(playerName + " expandido a " + numBars + " compases");
}

inline function onExpandAControl(component, value)
{
	if (value <= 0.5) return;
	expandPlayerLoadFull(MidiPlayer2, "MIDI Player2", LastMidPath2Expand != "" ? LastMidPath2Expand : LastMidPath2, topX, topX);
	component.setValue(0);
	component.sendRepaintMessage();
}
inline function onExpandBControl(component, value)
{
	if (value <= 0.5) return;
	expandPlayerLoadFull(MidiPlayer3, "MIDI Player3", LastMidPath3Expand != "" ? LastMidPath3Expand : LastMidPath3, topX, topX);
	component.setValue(0);
	component.sendRepaintMessage();
}
inline function onExpandCControl(component, value)
{
	if (value <= 0.5) return;
	expandPlayerLoadFull(MidiPlayer4, "MIDI Player4", LastMidPath4Expand != "" ? LastMidPath4Expand : LastMidPath4, topX, topX);
	component.setValue(0);
	component.sendRepaintMessage();
}

inline function showMatchesFromOffset(offset)
{
	if (!LastMatches || LastMatches.length == 0)
	{
		setStatus("No hay resultados de Find Closest aún");
		return;
	}

	if (offset < 0)
		offset = 0;
	if (offset >= LastMatches.length)
		offset = 0;

	CurrentMatchOffset = offset;

	local m1 = LastMatches[offset];
	local m2 = (offset + 1 < LastMatches.length) ? LastMatches[offset + 1] : undefined;
	local m3 = (offset + 2 < LastMatches.length) ? LastMatches[offset + 2] : undefined;

	if (m1) loadMatchIntoPlayer(m1, MidiPlayer2, "MIDI Player2", DISPLAY_BARS);
	if (m2) loadMatchIntoPlayer(m2, MidiPlayer3, "MIDI Player3", DISPLAY_BARS);
	if (m3) loadMatchIntoPlayer(m3, MidiPlayer4, "MIDI Player4", DISPLAY_BARS);
}

inline function setMidiPlayerPlayState(player, playerName, shouldPlay)
{
	if (!player)
	{
		Console.print("[PlayStop] " + playerName + " no encontrado");
		return;
	}

	if (shouldPlay)
	{
		player.setPlaybackPosition(0);
		player.play(0);
		Console.print("[PlayStop] " + playerName + " PLAY");
	}
	else
	{
		player.stop(0);
		Console.print("[PlayStop] " + playerName + " STOP");
	}
}

inline function setOtherPlayStopsToZero(exceptIndex)
{
	if (exceptIndex != 1) { if (MidiPlayer1) MidiPlayer1.stop(0); local p1 = Content.getComponent("playStop1"); if (p1) { p1.setValue(0); p1.sendRepaintMessage(); } gridAnimTimer.stopTimer(); resetGridAnimVisuals(); }
	if (exceptIndex != 2) { if (MidiPlayer2) MidiPlayer2.stop(0); local p2 = Content.getComponent("playStop2"); if (p2) { p2.setValue(0); p2.sendRepaintMessage(); } }
	if (exceptIndex != 3) { if (MidiPlayer3) MidiPlayer3.stop(0); local p3 = Content.getComponent("playStop3"); if (p3) { p3.setValue(0); p3.sendRepaintMessage(); } }
	if (exceptIndex != 4) { if (MidiPlayer4) MidiPlayer4.stop(0); local p4 = Content.getComponent("playStop4"); if (p4) { p4.setValue(0); p4.sendRepaintMessage(); } }
}

inline function onPlayStop1Control(component, value)
{
	if (value > 0.5) setOtherPlayStopsToZero(1);
	if (value > 0.5) gridAnimTimer.startTimer(100);
	else { gridAnimTimer.stopTimer(); resetGridAnimVisuals(); }
	setMidiPlayerPlayState(MidiPlayer1, "MIDI Player1", value > 0.5);
}

inline function onPlayStop2Control(component, value)
{
	if (value > 0.5) setOtherPlayStopsToZero(2);
	setMidiPlayerPlayState(MidiPlayer2, "MIDI Player2", value > 0.5);
}

inline function onPlayStop3Control(component, value)
{
	if (value > 0.5) setOtherPlayStopsToZero(3);
	setMidiPlayerPlayState(MidiPlayer3, "MIDI Player3", value > 0.5);
}

inline function onPlayStop4Control(component, value)
{
	if (value > 0.5) setOtherPlayStopsToZero(4);
	setMidiPlayerPlayState(MidiPlayer4, "MIDI Player4", value > 0.5);
}

inline function onRegenerateControl(component, value)
{
	if (value <= 0.5)
		return;

	if (!LastMatches || LastMatches.length <= 3)
	{
		setStatus("No hay más resultados para regenerar");
		sendToServerButtonLabel = "Generate";
		local btn = Content.getComponent("sendToServerButton");
		if (btn) btn.sendRepaintMessage();
		return;
	}

	local nextOffset = CurrentMatchOffset + 3;
	if (nextOffset >= LastMatches.length)
		nextOffset = 0;

	showMatchesFromOffset(nextOffset);
}

inline function callFindClosestLocalCli(component, value)
{
	if (!value) return;

	// Leer parámetros actuales antes de decidir si usamos caché
	local ternaryBtnCache = Content.getComponent("btnTernary");
	local isTernaryCache = (ternaryBtnCache && ternaryBtnCache.getValue() > 0.5);
	local sliderTempCache = Content.getComponent("Temperature");
	local currentFallbackDist = sliderTempCache ? sliderTempCache.getValue() : 1;
	local currentHhMin = 5;


	// Si los parámetros son iguales a la última petición y hay caché, reutilizar batch
	if (AllCachedMatches.length > 0 && NextMatchOffset < AllCachedMatches.length
	    && LastRequestFallbackDist == currentFallbackDist
	    && LastRequestHhMin == currentHhMin
	    && LastRequestTernary == (isTernaryCache ? 1 : 0))
	{
		setSendToServerButtonState(true);
		cacheFeedbackTimer.startTimer(1500);
		return;
	}

	NextMatchOffset = 0;
	AllCachedMatches = [];
	setSendToServerButtonState(true);
	updateExpandButtonsVisibility();
	local g = collectGridData();
	local p = getCliPaths();
	// Escribir grid_buttons.json para que el CLI pueda usar --grid (igual que find_closest_groove_bar.py)
	local audioRoot = FileSystem.getFolder(FileSystem.AudioFiles);
	local base = audioRoot.createDirectory("stems");
	local folder = base.createDirectory(STEMS_RUN_FOLDER);
	local gridFile = folder.getChildFile("grid_buttons.json");
	if (!gridFile.writeObject(g))
	{
		setStatus("Error: no se pudo escribir grid_buttons.json");
		setSendToServerButtonState(false);
		return;
	}
	local gridPath = gridFile.toString(gridFile.FullPath);
	local outputDir = folder.toString(folder.FullPath);
	local ternaryBtn = Content.getComponent("btnTernary");
	local isTernary = (ternaryBtn && ternaryBtn.getValue() > 0.5);
	local sliderTemp = Content.getComponent("Temperature");
	local fallbackDist = sliderTemp ? sliderTemp.getValue() : 1;

	local hhMin = 5;
	Console.print("[Find Closest] sliderTemp (fallback-if-dist-above)=" + fallbackDist);
	Console.print("[Find Closest] btnHhats (--hh-min)=" + hhMin);
	local args = ["--json", "--grid", gridPath, "--bank", p.bank_main, "--top", topN, "--bars", topX, "--hh", "--hh-min", "" + hhMin, "--output-dir", outputDir];
	if (isTernary)
		args.push("--ternary");

	// Guardar parámetros usados en esta petición para futuras decisiones de caché
	LastRequestFallbackDist = fallbackDist;
	LastRequestHhMin = hhMin;
	LastRequestTernary = isTernary ? 1 : 0;
	local mainBankFile = FileSystem.fromAbsolutePath(p.bank_main);
	local binFile = FileSystem.fromAbsolutePath(p.cli_bin);
	if (!binFile.isFile())
	{
		setStatus("CLI not found (find_closest_groove_bar_macos)");
		Console.print("[Find Closest] missing binary: " + p.cli_bin);
		appendWorkerLog("missing binary | cli_bin=" + p.cli_bin + " | bank_main=" + p.bank_main);
		setSendToServerButtonState(false);
		return;
	}
	if (!mainBankFile.isFile())
	{
		setStatus("Main bank not found");
		Console.print("[Find Closest] missing bank_main: " + p.bank_main);
		appendWorkerLog("missing bank_main | bank_main=" + p.bank_main);
		setSendToServerButtonState(false);
		return;
	}
	Console.print("[Find Closest] cli_bin=" + p.cli_bin);
	Console.print("[Find Closest] bank_main=" + p.bank_main);
	appendWorkerLog("start | cli_bin=" + p.cli_bin + " | grid=" + gridPath + " | bank_main=" + p.bank_main);
	FindClosestLastLine = "";
	sendToServerButtonLabel = "Matching ...";
	setStatus("Buscando pattern local (CLI)...");
	FindClosestTask.runProcess(p.cli_bin, args, function(thread, isFinished, data)
	{
		if (!isFinished)
		{
			if (data != "")
				FindClosestLastLine = data;
			return;
		}
		setSendToServerButtonState(false);
		var exitCode = data;
		var lastLine = FindClosestLastLine;
		if (exitCode == 0 && lastLine != "")
		{
			var response = lastLine.parseAsJSON();
			if (response && response.index != undefined)
			{
				appendWorkerLog("ok | exit=" + exitCode + " | line=" + lastLine);
				setStatus("Match idx=" + response.index
				          + " dist=" + response.distance
				          + " bpm=" + response.meta_bpm);

				AllCachedMatches = response.matches;
				LastMatches = [];
				var j = 0;
				while (j < 3 && j < AllCachedMatches.length)
				{
					LastMatches.push(AllCachedMatches[j]);
					j = j + 1;
				}
				NextMatchOffset = 3;
				LastMatchBars = (response.bars != undefined && response.bars > 0) ? response.bars : 1;
				showMatchesFromOffset(0);
				sendToServerButtonLabel = "Next row >>";
				if (sendToServerBtn) sendToServerBtn.sendRepaintMessage();
				updateExpandButtonsVisibility();
			}
			else
			{
				setStatus("CLI OK pero sin JSON válido");
				sendToServerButtonLabel = "Warming up...";
				if (sendToServerBtn) sendToServerBtn.sendRepaintMessage();
				Console.print("[Find Closest] salida: " + lastLine);
				appendWorkerLog("ok-invalid-json | exit=" + exitCode + " | line=" + lastLine);
			}
		}
		else
		{
			var err = undefined;
			if (lastLine != "")
				err = lastLine.parseAsJSON();
			setStatus("CLI error (" + exitCode + ")");
			if (err && err.error)
				Console.print("[Find Closest] error=" + err.error);
			Console.print("[Find Closest] exit=" + exitCode + " line=" + lastLine);
			appendWorkerLog("error | exit=" + exitCode + " | line=" + lastLine);
			sendToServerButtonLabel = "Warming up...";
			if (sendToServerBtn) sendToServerBtn.sendRepaintMessage();
		}
	});
}

// BPM from knob
inline function onTempoControl(component, value)
{
	if (value == -1)
		Engine.setHostBpm(-1);
	else
		Engine.setHostBpm(value);

	local tempoLabel = Content.getComponent("labelTempo");
	if (tempoLabel)
	{
		if (value == -1)
			tempoLabel.set("text", "Synced");
		else
			tempoLabel.set("text", component.get("text"));
	}

	// Cambia el query → ofrecer Re-generate en el botón
	sendToServerButtonLabel = "Re-match";
	local btn = Content.getComponent("sendToServerButton");
	if (btn) btn.sendRepaintMessage();
}
Content.getComponent("Tempo").setControlCallback(onTempoControl);

// Tempo init (exactamente el patrón solicitado)
if (!Engine.isPlugin())
{
	Console.print(">>>>>>>>>>>>>>>>>>>>>>>> Es app");
	Content.getComponent("Tempo").setValue(100);
	Content.getComponent("Tempo").changed();
}
else
{
	Content.getComponent("Tempo").setValue(-1);
	Content.getComponent("Tempo").changed();
}

// Cambios en parámetros de búsqueda (sliderTemp, btnHhats, etc.)
inline function onQueryParamChanged(component, value)
{
	sendToServerButtonLabel = "Re-match";
	local btn = Content.getComponent("sendToServerButton");
	if (btn) btn.sendRepaintMessage();
}

// Actualiza MidiPlayer1 con la grilla actual (sin guardar JSON). Se llama al export y al cambiar cualquier botón de la grilla.
inline function refreshMidiPlayer1FromGrid()
{
	local obj = collectGridData();
	local bd = obj.bd;
	local sd = obj.sd;
	local ternaryBtn = Content.getComponent("btnTernary");
	local isTernary = (ternaryBtn && ternaryBtn.getValue() > 0.5);
	local slots = 16;
	local TICKS_PER_SLOT = 240;
	if (isTernary)
	{
		slots = 12;
		TICKS_PER_SLOT = 320;
	}
	local NOTE_LEN_TICKS = 120;
	local VEL = 100;
	local messageList = [];
	local i = 0;
	while (i < slots)
	{
		local tick = i * TICKS_PER_SLOT;
		if (bd[i] && bd[i] !== 0)
		{
			local on = Engine.createMessageHolder();
			on.setType(1);
			on.setTimestamp(tick);
			on.setNoteNumber(36);
			on.setVelocity(VEL);
			on.setChannel(10);
			messageList.push(on);
			local off = Engine.createMessageHolder();
			off.setType(2);
			off.setTimestamp(tick + NOTE_LEN_TICKS);
			off.setNoteNumber(36);
			off.setVelocity(0);
			off.setChannel(10);
			messageList.push(off);
		}
		if (sd[i] && sd[i] !== 0)
		{
			local on = Engine.createMessageHolder();
			on.setType(1);
			on.setTimestamp(tick);
			on.setNoteNumber(38);
			on.setVelocity(VEL);
			on.setChannel(10);
			messageList.push(on);
			local off = Engine.createMessageHolder();
			off.setType(2);
			off.setTimestamp(tick + NOTE_LEN_TICKS);
			off.setNoteNumber(38);
			off.setVelocity(0);
			off.setChannel(10);
			messageList.push(off);
		}
		i += 1;
	}
	MidiPlayer1.clearAllSequences();
	MidiPlayer1.create(4, 4, 1);
	MidiPlayer1.flushMessageListToSequence(messageList, 1);
	MidiPlayer1.setSequence(1);
}

inline function onGridButtonChange(component, value)
{
	NextMatchOffset = 0;
	AllCachedMatches = [];
	local tBtn = Content.getComponent("btnTernary");
	if (component == tBtn)
	{
		local ternaryPanel = Content.getComponent("ternaryPanel");
		local binaryPanel = Content.getComponent("binaryPanel");
		if (ternaryPanel) ternaryPanel.showControl(value);
		if (binaryPanel) binaryPanel.showControl(!value);
	}
	refreshMidiPlayer1FromGrid();

	// La grilla cambió: el próximo click recalculará explícitamente
	sendToServerButtonLabel = "Re-match";
	local btn = Content.getComponent("sendToServerButton");
	if (btn) btn.sendRepaintMessage();
	updateExpandButtonsVisibility();
}

// Export grid (16 BD + 16 SD) to grid_buttons.json and load into MidiPlayer1 for find_closest_groove_bar.py --grid
inline function exportGridButtonsToJson(component, value)
{
	Console.print("[Export Grid] Exportando grid_buttons.json");
	local audioRoot = FileSystem.getFolder(FileSystem.AudioFiles);
	local base = audioRoot.createDirectory("stems");
	local folder = base.createDirectory(STEMS_RUN_FOLDER);
	if (!folder.hasWriteAccess())
	{
		setStatus("Error: sin permiso en stems/" + STEMS_RUN_FOLDER);
		return;
	}
	local obj = collectGridData();
	local bpm = obj.bpm;
	local ternaryBtn = Content.getComponent("btnTernary");
	local isTernary = (ternaryBtn && ternaryBtn.getValue() > 0.5);
	Console.print("[Export Grid] ternary=" + (isTernary ? 1 : 0) + " slots=" + (isTernary ? 12 : 16) + " bd.length=" + obj.bd.length);
	local f = folder.getChildFile("grid_buttons.json");
	local ok = f.writeObject(obj);
	if (ok)
	{
		local pathStr = "stems/" + STEMS_RUN_FOLDER + "/grid_buttons.json";
		setStatus("Grid OK → " + pathStr);
		Console.print("[Export Grid] OK → " + pathStr + "  BPM=" + bpm + " ternary=" + (isTernary ? 1 : 0));
		refreshMidiPlayer1FromGrid();
		Console.print("[Export Grid] MIDI cargado en MidiPlayer1 (1 bar)");
	}
	else
	{
		setStatus("Error al guardar grid_buttons.json");
	}
}

// Wire export button(s)
var exportGridBtn = Content.getComponent("exportGridButton");
if (exportGridBtn) exportGridBtn.setControlCallback(exportGridButtonsToJson);

// Recargar MidiPlayer1 al cambiar cualquier botón de la grilla (binaria + ternaria + modo)
var gridRefreshCallback = onGridButtonChange;
var j = 0;
while (j < 16)
{
	j += 1;
	var b = Content.getComponent("bd" + j);
	var s = Content.getComponent("sd" + j);
	if (b) { b.setControlCallback(gridRefreshCallback); registerGridAnimButton(b, j - 1, 0); }
	if (s) { s.setControlCallback(gridRefreshCallback); registerGridAnimButton(s, j - 1, 0); }
}
j = 0;
while (j < 12)
{
	j += 1;
	b = Content.getComponent("bd" + j + "t");
	s = Content.getComponent("sd" + j + "t");
	if (b) { b.setControlCallback(gridRefreshCallback); registerGridAnimButton(b, j - 1, 1); }
	if (s) { s.setControlCallback(gridRefreshCallback); registerGridAnimButton(s, j - 1, 1); }
}
var ternaryBtn = Content.getComponent("btnTernary");
if (ternaryBtn) ternaryBtn.setControlCallback(gridRefreshCallback);
var sendToServerBtn = Content.getComponent("sendToServerButton");
if (sendToServerBtn)
{
	sendToServerBtn.setValue(0);
	sendToServerBtn.setControlCallback(callFindClosestLocalCli);
	sendToServerBtn.setLocalLookAndFeel(lafSendToServer);
}
var sliderTemp = Content.getComponent("Temperature");
if (sliderTemp) sliderTemp.setControlCallback(onQueryParamChanged);

var playStop1Btn = Content.getComponent("playStop1");
if (playStop1Btn) playStop1Btn.setControlCallback(onPlayStop1Control);
var playStop2Btn = Content.getComponent("playStop2");
if (playStop2Btn) playStop2Btn.setControlCallback(onPlayStop2Control);
var playStop3Btn = Content.getComponent("playStop3");
if (playStop3Btn) playStop3Btn.setControlCallback(onPlayStop3Control);
var playStop4Btn = Content.getComponent("playStop4");
if (playStop4Btn) playStop4Btn.setControlCallback(onPlayStop4Control);

var expandABtn = Content.getComponent("expandAButton");
if (expandABtn) expandABtn.setControlCallback(onExpandAControl);
var expandBBtn = Content.getComponent("expandBButton");
if (expandBBtn) expandBBtn.setControlCallback(onExpandBControl);
var expandCBtn = Content.getComponent("expandCButton");
if (expandCBtn) expandCBtn.setControlCallback(onExpandCControl);
var linkPanel = Content.getComponent("linkPanel");
if (linkPanel)
{
	linkPanel.setMouseCallback(function(event)
	{
		if (event.clicked)
			Engine.openWebsite("https://sampleson.com");
	});
}

sendToServerButtonLabel = "Generate";
updateExpandButtonsVisibility();

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
 