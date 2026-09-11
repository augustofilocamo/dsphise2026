#on

#if !HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER
// If this causes an error, you need to add HISE_SEND_PANEL_CHANGED_TO_PLUGIN_PARAMETER=1
// to your ExtraDefinitions of the project and rebuild the component tree (either reload the patch)
// or click on the refresh icon in the interface designer)
Console.assertTrue(false);
#endif

Content.makeFrontInterface(1024, 680);


include("Authorisation.js");
include("audioRecorder.js");
include("pluginVSstandalone.js");

// Fonts
Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Atkinson-Hyperlegible-Regular-102.ttf", "Atkinson Hyperlegible");
Engine.setGlobalFont("Atkinson Hyperlegible");



// Components come from UIData only. Script binds by ID + logic.

const var TOP_N = 20;
const var UI_FULL_W = 1024;
const var UI_FULL_H = 680;

const var ENGINE_FX_ID = "Engine";
const var RECORD_FX_ID = "Recorder";
const var CLAP_FAMILIES = "";
const var PLAY_SLOT = 0;       // ch0 — v6 bed
const var use_ogg = true;
const var GOLD_SLOT = 1;       // gold — first gold stretch
const var CAPTURE_SLOT = 0;    // Recorder oneshot — captured take
const var FURY_SLOT = 4;       // fury — first fury stretch
const var LAYER_V6_SPEED = 0.02;
const var LAYER_V6_PAN_A = -0.35;
const var LAYER_V6_PAN_B = 0.35;
const var PLAY_SPEED = 0.15;
const var PLAY_ZONE = 1.0; // full range: always start at 0 / 0.05, no random jump
const var EMOTION_PROMPT_MAX = 160;
const var CAPSULE_CHARS = 10;
const var CAP_CALM_X = 207.0;
const var CAP_CALM_Y = 310.0;
const var CAP_FURY_X = 671.0;
const var CAP_FURY_Y = 310.0;
const var CAP_GOLD_X = 439.0;
const var CAP_GOLD_Y = 140.0;
const var CAP_W = 156.0;
const var CAP_H = 37.1;
const var CAP_EDIT_DX = -62.0;
const var CAP_GAP = 5.6;
const var CAP_ICON_S = 37.1;
const var CAP_REFRESH_DX = 161.6;
const var CAP_DELETE_DX = 204.3;
const var CAP_ICON_DY = 0.0;
const var CAP_GROUP_W = 241.4;
var pillCalmX = 207.0;
var pillCalmY = 310.0;
var pillFuryX = 671.0;
var pillFuryY = 310.0;
var pillGoldX = 439.0;
var pillGoldY = 140.0;
var pillDrag = 0;
var pillDragOffX = 0.0;
var pillDragOffY = 0.0;
var pillDidDrag = 0;
var pillOpenMenu = 0;
var pillScrollCalm = 0.0;
var pillScrollFury = 0.0;
var pillScrollGold = 0.0;
var pillHoldCalm = 0;
var pillHoldFury = 0;
var pillHoldGold = 0;
var canvasCalmOn = 0;
var canvasFuryOn = 0;
var canvasGoldOn = 0;
const var TAG_ORCH = ["Choir", "Voice", "Strings", "Slow Violin", "Cello", "Cinematic Strings", "Organ", "Flute", "Calm string section", "Tense violas", "Woodwinds", "Brass", "Horns", "Pan Flute", "Airy Flute", "Bass Flute", "Pipe Organ", "Marimba", "Ethnic Flute", "Tibetan Monks", "Sitar"];
const var TAG_SYNTH = ["Heavy synth", "Aerial flying synth", "Pad", "Choir pad", "Dark drone", "Lead synth", "Pulse synth", "Shimmer synth", "Noise synth", "Analog", "Sub bass", "Frozen synth", "Tape synth", "Modular", "Brass synth", "FM synth", "Acid synth", "Super saw"];
const var TAG_BASS = ["Sub bass", "Bass Rumble", "Contrabass", "Upright bass", "Bass guitar", "Low strings", "Bass synth", "808 bass", "Reese bass", "Synth bass", "Analog bass", "Bass pad", "Sub drone", "Rumble", "Low brass", "Tuba", "Bassoon", "Organ bass", "Low Rumble", "Bass choir", "Pulsing bass", "Dark bass", "Infra bass"];
const var TAG_BASS_PROMPT = [
	"deep sub bass, low rumble only, no treble, no cymbals, dark",
	"double bass, low register, woody rumble, no highs, no sparkle",
	"contrabass, deep low strings, no treble, no violins",
	"upright bass, low pizzicato rumble, dark, no treble",
	"bass guitar, muted low strings, rumble only, no highs",
	"low strings, cellos and basses, dark, no violins, no treble",
	"bass synth, sub sine, low frequencies only, no treble",
	"808 sub bass, deep sine rumble, no snap, no highs",
	"reese bass, low growl, detuned sub, no treble",
	"moog bass, fat low sine, no filter whistle, no highs",
	"analog bass, warm sub, low only, no treble, no sparkle",
	"bass pad, dark low drone, no shimmer, no highs",
	"sub drone, infrasonic rumble, no treble, no air",
	"low rumble, distant thunder bass, no crackle, no highs",
	"low brass, tuba and trombone pedals, dark, no trumpets",
	"tuba, low pedal tones, dark brass, no treble",
	"bassoon, low register, woody dark, no highs",
	"organ pedal bass, 16 foot stop, no mixtures, no treble",
	"low piano, left hand rumble, no treble, dark",
	"bass choir, low male voices, no soprano, dark, no highs",
	"pulsing sub bass, slow low pulse, no tick, no treble",
	"dark bass, low drone rumble, no sparkle, no highs",
	"infra bass, felt more than heard, no treble, rumble"
];
const var TAG_PLACE = ["Harbor", "Forest", "Rain", "Wind", "Crowd", "City", "Subway", "Airport", "Hospital", "Church", "Library", "Cinema", "Cafe", "Warehouse", "Farm", "Spaceship", "Ruins", "Castle", "Graveyard", "Highway", "Ocean", "Desert", "Mountain", "Lighthouse"];
const var TAG_TABS = ["ORCHESTRA-BASED", "SYNTH-BASED", "BASS-RUMBLES", "PLACES", "CUSTOM"];
const var TAG_TAB_N = 5;
const var TAG_PAD = 4.0;
const var TAG_GAP_X = 12.0;
const var TAG_GAP_Y = 8.0;
const var TAG_TAB_H = 26.0;
const var TAG_TAB_MB = 20.0;
const var TAG_PROMPT_H = 32.0;
const var TAG_PROMPT_GAP = 10.0;
const var TAG_PROMPT_PAD = 15.0;
const var TAG_PROMPT_PAD_Y = 4.0;
const var TAG_TAB_GAP = 23.0;
const var TAG_H = 29.0;
const var TAG_FONT = 14;
const var TAG_TEXT_PAD = 9.0;
const var TAG_CHIP_LINE = 0xE68F8F8F;
const var TAG_CHIP_FG = 0xE68F8F8F;
var tagTabW = 260.0;
var tagTab = 0;
var tagPromptFocus = 0;
var tagDrag = -1;
var tagDragWord = "";
var tagDragOffX = 0.0;
var tagDragOffY = 0.0;
var tagX = [];
var tagY = [];
var tagW = [];
const var EMO_PROMPT_W = 176.0;
const var EMO_PROMPT_H = 42.0;
const var EMO_PROMPT_FONT = 22;
const var EMO_PROMPT_RADIUS = 8.0;
const var EMO_PROMPT_PLACEHOLDER = "Ask for an ambient sound";
const var EMO_PROMPT_PAD_X = 16.0;
const var EMO_PROMPT_TYPE_GAP = 4.0;
const var EMO_PROMPT_TYPE_H = 16.1;
const var EMO_PROMPT_TYPE_PAD = 5.0;
const var EMO_PROMPT_BOX_EXTRA = 1.0;
const var EMO_PROMPT_SUBMIT_S = 22.0;
const var EMO_PROMPT_SUBMIT_PAD = 12.0;
const var EMO_OK_S = 56.0;
const var EMO_COMBO_DX = 0.0;
const var EMO_COMBO_DY = 0.0;
const var EMO_COMBO_W = 156.0;
const var EMO_COMBO_H = 37.1;
const var EMO_CHEV_W = 37.1;
const var EMO_MENU_W = 236.0;
const var EMO_MENU_ITEM_H = 42.0;
const var EMO_MENU_GAP = 10.0;
const var EMO_PILL_BG = 0x1AFFFFFF;
const var EMO_PILL_LINE = 0xE6FFFFFF;
const var EMO_PILL_FG = 0xE6FFFFFF;
const var EMO_PILL_FONT = "Atkinson Hyperlegible";
const var EMO_PILL_BLUR = 98;
const var EMO_PILL_BLUR_ON = 0;
const var PLAY_ATTACK = 0.0;
const var PLAY_FADE = 1200.0;
const var GATE_ATTACK_MS = 400.0; // fade-in when play starts or refresh, milliseconds
const var PLAY_GAP = 0.0;
const var PLAY_GAIN = -1.0;
const var WAVE_BARS = 72;
const var WAVE_BUILD_SEC = 2.2;
const var SILENCE_FLOOR = 0.0316227766;
const var SILENCE_MIN_SAMPLES = 512;
const var ONSET_MAX = 128;
const var PITCH_CUT_HOLD_SEC = 1.0;
const var PITCH_WINDOW = 8192; // samples for detectPitch (~50 Hz floor @ 44.1k)
const var PITCH_TIMER_MS = 100;
const var PITCH_AVG_SEC = 3.0;
const var PITCH_MIN_VOTES = 3;
var pitchTracking = 0;
var pitchSamplesHz = [];
var pitchWindowStarted = 0.0;

reg bankLoaded = 0;
reg clapReady = 0;
var ClapSearch = undefined;
var bankV6 = [];
var bankV6loc = [];
reg pageIndex = 0;
reg previewMatchIndex = -1;
// Per-stretch search carousels (row appears when that stretch gets a load)
var stretchHits0 = [];
var stretchHits1 = [];
var stretchHits2 = [];
var stretchIdx = [];
var stretchRowOn = [];
var stretchPlaying = []; // per-row play/stop gate state
var navWaiting = [];
var navStartedAt = [];
var iconiaRevealAt = [];
var iconiaAnim = [];
reg pendingTargetStretch = 0;
reg stretchPlaySyncing = 0;
reg compactMode = 0;
reg lastMiniSlot = 0;
var EngineFX = undefined;
var RecorderFX = undefined;
var attrCache = {};
var captureAttrCache = {};
reg chUsed = 0;
var chEntry = undefined;
var layerV6Entry = undefined;
var layerLocEntry = undefined;
var layerFolEntry = undefined;
reg chPlaying = 0;
reg previewPlaying = 0;
reg previewSyncing = 0;
reg stretchGainSyncing = 0;
reg promptCollapsed = 0;
reg hitRowTopY = 12.0;
reg hitRowGapY = 10.0;
const var CLEAR_BADGE = 24.0;
reg clearOffX = 12.0;
reg clearOffY = 3.0;
reg promptAnimT = 1.0;
reg promptAnimFrom = 120.0;
reg promptAnimTo = 120.0;
reg animAnimFrom = 190.0;
reg animAnimTo = 190.0;
reg searchStartedAt = 0.0;
reg searchWaitActive = 0;
reg searchReadyToDeliver = 0;
reg searchDotsTick = 0;
reg waitMode = 0; // 1=search, 2=page
reg pendingPageIndex = 0;
var pendingHits = [];
var pendingMode = "";
var pendingBankKey = "";
var wavePeaks = [];
var wavePeaks1 = [];
var wavePeaks2 = [];
reg waveReveal = 0.0;
var waveHeads = [];
var waveActives = [];
var waveStarteds = [];
var waveDotAlphas = [];
var waveDotDirs = [];
const var WAVE_DOT_FADE = 0.035; // ~1s reveal/retract at 33ms ticks

const var animPanel = Content.getComponent("animPanel");
const var calmLabel = Content.getComponent("calmLabel");
const var furyLabel = Content.getComponent("furyLabel");
const var goldLabel = Content.getComponent("goldLabel");
const var calmCapsule = Content.getComponent("calmCapsule");
const var furyCapsule = Content.getComponent("furyCapsule");
const var goldCapsule = Content.getComponent("goldCapsule");
const var xyPad = Content.getComponent("xyPad");
const var calmXSlider = Content.getComponent("calmXSlider");
const var calmYSlider = Content.getComponent("calmYSlider");
const var furyXSlider = Content.getComponent("furyXSlider");
const var furyYSlider = Content.getComponent("furyYSlider");
const var goldXSlider = Content.getComponent("goldXSlider");
const var goldYSlider = Content.getComponent("goldYSlider");
const var presetHandler = Engine.createUserPresetHandler();
const var AUTO_SCRIPT_CTRL = 2;
var calmXIdx = -1;
var calmYIdx = -1;
var furyXIdx = -1;
var furyYIdx = -1;
var goldXIdx = -1;
var goldYIdx = -1;
var pillGestureOn = 0;
const var tagsPanel = Content.getComponent("tagsPanel");
const var capturePanel = Content.getComponent("capturePanel");
const var capturePanelButton = Content.getComponent("capturePanelButton");
const var settingsButton = Content.getComponent("settingsButton");
const var settingsPanel = Content.getComponent("settingsPanel");
const var weblinkButton = Content.getComponent("weblinkButton");
const var toDawScriptImage = Content.getComponent("toDawScriptImage");
const var tagPromptInput = Content.getComponent("tagPromptInput");
const var sessionStateLabel = Content.getComponent("sessionStateLabel");
const var dropOntoImage = Content.getComponent("dropOntoImage");
const var maxNodesPanel = Content.getComponent("maxNodesPanel");
const var maxNodesOk = Content.getComponent("maxNodesOk");
const var maxNodesLabel = Content.getComponent("maxNodesLabel");
var capturePanelOn = 0;
var settingsPanelOn = 0;
const var CAPTURE_PEAK_N = 160;
const var CAPTURE_PAD = 16.0;
const var CAPTURE_PAD_L = 250.0;
var capturePeaks = [];
var captureHead = 0;
var captureRecording = 0;
var capturePlaying = 0;
var captureBtnSyncing = 0;
var captureFile = undefined;
var captureAudio = undefined;
var captureSampleRate = 0.0;
var captureDragArmed = 0;
var captureStarted = 0.0;
var captureRendering = 0;
var capturePlayEnds = 0.0;
var captureNumSamples = 0;
var captureTakeId = 0;
const var tagGhost = Content.addPanel("tagGhost", 0, 0);
const var calmRefresh = Content.addPanel("calmRefresh", 383, 321);
const var furyRefresh = Content.addPanel("furyRefresh", 847, 321);
const var goldRefresh = Content.addPanel("goldRefresh", 615, 151);
const var calmDelete = Content.addPanel("calmDelete", 454, 321);
const var furyDelete = Content.addPanel("furyDelete", 918, 321);
const var goldDelete = Content.addPanel("goldDelete", 686, 151);
const var calmEdit = Content.addPanel("calmEdit", 145, 321);
const var furyEdit = Content.addPanel("furyEdit", 609, 321);
const var pitchMatchBtn = Content.getComponent("pitchMatchBtn");
const var stretchPlayBtn = Content.getComponent("stretchPlayBtn");
const var recordButton = Content.getComponent("recordButton");
const var recordingPlayBtn = Content.getComponent("recordingPlayBtn");
const var recordingClearBtn = Content.getComponent("recordingClearBtn");
const var emotionPromptBox = Content.addPanel("emotionPromptBox", 172, 248);
const var emotionPromptPlaceholder = Content.addLabel("emotionPromptPlaceholder", 192, 264);
const var emotionPromptInput = Content.addLabel("emotionPromptInput", 192, 264);
const var emotionTypeIcon = Content.addPanel("emotionTypeIcon", 0, 0);
const var emotionPromptOk = Content.addPanel("emotionPromptOk", 764, 292);
const var pitchTimer = Engine.createTimerObject();
const var emotionPitchTimer = Engine.createTimerObject();
const var emotionRefreshTimer = Engine.createTimerObject();
const var EMOTION_STOP_WAIT_MS = 500;
const var EMOTION_REFRESH_WAIT_MS = 500;
const var EMOTION_HOT_WAIT_MS = 800;
var emotionRefreshPhase = 0;
var emotionRefreshSide = 0;
var emotionRefreshEntry = undefined;
var emotionRefreshIndex = 0;
var emotionHotMuteSide = -1;
const var emotionCapsuleTimer = Engine.createTimerObject();
const var captureTimer = Engine.createTimerObject();
const var REFRESH_SPIN_STEP = 0.40;
const var refreshIconPath = Content.createPath();
const var arrowIconPath = Content.createPath();
const var penIconPath = Content.createPath();
const var typeIconPath = Content.createPath();

// pen2.svg — pencil inside circle (coords in the SVG circle box)
penIconPath.startNewSubPath(26.16, 9.25);
penIconPath.cubicTo([28.03, 9.07], [29.73, 10.99], 30.87, 12.30);
penIconPath.cubicTo([31.93, 13.52], [32.17, 14.91], 31.31, 16.34);
penIconPath.lineTo(18.08, 29.57);
penIconPath.cubicTo([17.11, 30.24], [12.84, 31.83], 11.66, 32.00);
penIconPath.cubicTo([9.99, 32.24], [8.83, 31.14], 9.05, 29.46);
penIconPath.cubicTo([9.20, 28.32], [10.82, 23.99], 11.46, 23.03);
penIconPath.cubicTo([15.66, 18.61], [20.08, 14.38], 24.37, 10.03);
penIconPath.cubicTo([24.87, 9.61], [25.49, 9.32], 26.15, 9.26);
penIconPath.closeSubPath();
penIconPath.startNewSubPath(26.29, 11.46);
penIconPath.cubicTo([26.09, 11.49], [25.91, 11.63], 25.75, 11.76);
penIconPath.cubicTo([25.32, 12.10], [24.11, 13.30], 23.78, 13.73);
penIconPath.cubicTo([23.74, 13.78], [23.67, 13.81], 23.68, 13.90);
penIconPath.lineTo(27.22, 17.39);
penIconPath.cubicTo([27.83, 16.69], [28.79, 16.01], 29.34, 15.29);
penIconPath.cubicTo([29.66, 14.87], [29.73, 14.51], 29.41, 14.05);
penIconPath.cubicTo([29.19, 13.74], [27.34, 11.89], 27.03, 11.67);
penIconPath.cubicTo([26.81, 11.51], [26.56, 11.43], 26.29, 11.48);
penIconPath.closeSubPath();
penIconPath.startNewSubPath(22.07, 15.45);
penIconPath.lineTo(14.63, 22.87);
penIconPath.lineTo(18.19, 26.43);
penIconPath.lineTo(25.61, 19.00);
penIconPath.lineTo(22.07, 15.46);
penIconPath.closeSubPath();
penIconPath.startNewSubPath(16.50, 27.95);
penIconPath.lineTo(13.12, 24.57);
penIconPath.cubicTo([12.47, 26.30], [11.63, 28.00], 11.25, 29.82);
penIconPath.cubicTo([11.45, 30.02], [15.90, 28.18], 16.50, 27.95);
penIconPath.closeSubPath();

// type.svg — I-beam (tight artboard coords)
typeIconPath.startNewSubPath(302.17, 405.07);
typeIconPath.lineTo(299.79, 405.07);
typeIconPath.lineTo(299.79, 404.71);
typeIconPath.lineTo(302.17, 404.71);
typeIconPath.cubicTo([304.17, 404.71], [305.79, 403.08], 305.79, 401.09);
typeIconPath.lineTo(305.79, 391.90);
typeIconPath.cubicTo([305.79, 389.90], [304.17, 388.28], 302.17, 388.28);
typeIconPath.lineTo(299.79, 388.28);
typeIconPath.lineTo(299.79, 387.92);
typeIconPath.lineTo(302.17, 387.92);
typeIconPath.cubicTo([304.37, 387.92], [306.15, 389.71], 306.15, 391.90);
typeIconPath.lineTo(306.15, 401.09);
typeIconPath.cubicTo([306.15, 403.29], [304.36, 405.07], 302.17, 405.07);
typeIconPath.closeSubPath();
typeIconPath.startNewSubPath(312.20, 405.07);
typeIconPath.lineTo(309.82, 405.07);
typeIconPath.cubicTo([307.62, 405.07], [305.84, 403.28], 305.84, 401.09);
typeIconPath.lineTo(305.84, 391.90);
typeIconPath.cubicTo([305.84, 389.70], [307.63, 387.92], 309.82, 387.92);
typeIconPath.lineTo(312.20, 387.92);
typeIconPath.lineTo(312.20, 388.28);
typeIconPath.lineTo(309.82, 388.28);
typeIconPath.cubicTo([307.82, 388.28], [306.20, 389.91], 306.20, 391.90);
typeIconPath.lineTo(306.20, 401.09);
typeIconPath.cubicTo([306.20, 403.09], [307.83, 404.71], 309.82, 404.71);
typeIconPath.lineTo(312.20, 404.71);
typeIconPath.lineTo(312.20, 405.07);
typeIconPath.closeSubPath();

// refresh.svg — two arrows inside the same circle box
refreshIconPath.startNewSubPath(28.42, 15.69);
refreshIconPath.cubicTo([28.49, 15.62], [27.65, 14.50], 27.54, 14.38);
refreshIconPath.cubicTo([23.18, 9.33], [14.96, 10.69], 12.65, 16.96);
refreshIconPath.cubicTo([12.48, 17.42], [12.31, 18.37], 11.99, 18.67);
refreshIconPath.cubicTo([11.44, 19.18], [10.49, 18.99], 10.21, 18.29);
refreshIconPath.cubicTo([9.99, 17.73], [10.38, 16.75], 10.59, 16.19);
refreshIconPath.cubicTo([13.46, 8.51], [23.43, 6.65], 28.98, 12.68);
refreshIconPath.cubicTo([29.18, 12.89], [29.34, 13.14], 29.53, 13.36);
refreshIconPath.cubicTo([29.56, 13.40], [29.53, 13.46], 29.65, 13.43);
refreshIconPath.lineTo(29.65, 12.12);
refreshIconPath.cubicTo([29.65, 11.98], [29.91, 11.62], 30.04, 11.53);
refreshIconPath.cubicTo([30.74, 11.00], [31.74, 11.39], 31.82, 12.27);
refreshIconPath.cubicTo([31.95, 13.76], [31.72, 15.44], 31.82, 16.95);
refreshIconPath.cubicTo([31.77, 17.40], [31.37, 17.80], 30.92, 17.85);
refreshIconPath.cubicTo([29.41, 17.75], [27.73, 17.99], 26.24, 17.85);
refreshIconPath.cubicTo([25.36, 17.77], [24.96, 16.77], 25.50, 16.07);
refreshIconPath.cubicTo([25.59, 15.95], [25.95, 15.68], 26.09, 15.68);
refreshIconPath.lineTo(28.43, 15.68);
refreshIconPath.closeSubPath();
refreshIconPath.startNewSubPath(12.07, 26.64);
refreshIconPath.lineTo(12.07, 28.00);
refreshIconPath.cubicTo([12.07, 28.14], [11.81, 28.50], 11.68, 28.59);
refreshIconPath.cubicTo([10.98, 29.12], [9.98, 28.73], 9.90, 27.85);
refreshIconPath.cubicTo([9.77, 26.36], [10.00, 24.68], 9.90, 23.17);
refreshIconPath.cubicTo([9.95, 22.72], [10.35, 22.32], 10.80, 22.27);
refreshIconPath.cubicTo([12.31, 22.37], [13.99, 22.13], 15.48, 22.27);
refreshIconPath.cubicTo([16.36, 22.35], [16.76, 23.35], 16.22, 24.05);
refreshIconPath.cubicTo([16.13, 24.17], [15.77, 24.44], 15.63, 24.44);
refreshIconPath.lineTo(13.29, 24.44);
refreshIconPath.cubicTo([13.45, 24.79], [13.70, 25.16], 13.94, 25.46);
refreshIconPath.cubicTo([18.16, 30.88], [26.76, 29.54], 29.09, 23.09);
refreshIconPath.cubicTo([29.25, 22.64], [29.40, 21.75], 29.72, 21.46);
refreshIconPath.cubicTo([30.43, 20.81], [31.58, 21.32], 31.59, 22.26);
refreshIconPath.cubicTo([31.59, 22.64], [31.28, 23.52], 31.14, 23.91);
refreshIconPath.cubicTo([29.14, 29.35], [23.26, 32.24], 17.68, 30.58);
refreshIconPath.cubicTo([15.42, 29.91], [13.51, 28.50], 12.07, 26.66);
refreshIconPath.closeSubPath();

inline function startRefreshSpin(p)
{
	if (!isDefined(p))
		return;
	if (p.data.loading)
		return;
	p.data.loading = 1;
	p.data.spin = 0.0;
	p.setTimerCallback(function()
	{
		this.data.spin = this.data.spin + REFRESH_SPIN_STEP;
		this.repaint();
	});
	p.startTimer(33);
}

inline function stopRefreshSpin(p)
{
	if (!isDefined(p))
		return;
	p.data.loading = 0;
	p.data.spin = 0.0;
	p.stopTimer();
	p.repaint();
}

inline function startRefreshSpinLoad(side)
{
	if (side == 0)
		startRefreshSpin(calmRefresh);
	else if (side == 1)
		startRefreshSpin(furyRefresh);
	else
		startRefreshSpin(goldRefresh);
}

inline function stopRefreshSpinLoad(side)
{
	if (side == 0)
		stopRefreshSpin(calmRefresh);
	else if (side == 1)
		stopRefreshSpin(furyRefresh);
	else
		stopRefreshSpin(goldRefresh);
}

inline function startRefreshSpinNode(side)
{
	if (side == 1)
		startRefreshSpin(calmRefresh);
	else if (side == 2)
		startRefreshSpin(furyRefresh);
	else
		startRefreshSpin(goldRefresh);
}

inline function stopRefreshSpinNode(side)
{
	if (side == 1)
		stopRefreshSpin(calmRefresh);
	else if (side == 2)
		stopRefreshSpin(furyRefresh);
	else
		stopRefreshSpin(goldRefresh);
}

// arrow.svg — up arrow (polyline + stem)
arrowIconPath.startNewSubPath(295.08, 405.82);
arrowIconPath.lineTo(301.58, 399.32);
arrowIconPath.lineTo(308.07, 405.82);
arrowIconPath.startNewSubPath(301.58, 410.98);
arrowIconPath.lineTo(301.58, 399.32);

inline function fadeExportChannels(channels)
{
	local nFade = Math.round(Engine.getSamplesForMilliSeconds(700.0));
	local c = 0;
	local buf = 0;
	local n = 0;
	local fadeLen = 0;
	local last = 1;
	local i = 0;
	local g = 0.0;

	if (!isDefined(channels) || channels.length < 1)
		return;
	if (nFade < 2)
		nFade = 2;

	while (c < channels.length)
	{
		buf = channels[c];
		if (isDefined(buf) && buf.length > 16)
		{
			n = buf.length;
			fadeLen = nFade;
			if (fadeLen * 2 > n)
				fadeLen = Math.floor(n / 2);
			if (fadeLen < 2)
				fadeLen = 2;
			last = fadeLen - 1;
			if (last < 1)
				last = 1;
			i = 0;
			while (i < fadeLen)
			{
				g = 0.5 - 0.5 * Math.cos(3.14159265 * i / last);
				buf[i] = buf[i] * g;
				buf[n - 1 - i] = buf[n - 1 - i] * g;
				i = i + 1;
			}
		}
		c = c + 1;
	}
}

// --- organic floating balls on animPanel ---
const var BALL_N_SIDE = 40;
const var BALL_N = 120;
const var BALL_COL_CALM = 0xFFF2A03D;
const var BALL_COL_FURY = 0xFFE32619;
const var BALL_COL_GOLD = 0xFFC026D3;
const var BALL_COL = 0xFFFF0061;
const var BALL_CALM_CX = 280.0;
const var BALL_FURY_CX = 744.0;
const var BALL_GOLD_CX = 512.0;
const var BALL_LABEL_CY = 266.5;
const var BALL_GOLD_CY = 96.5;
const var MIX_CALM_Y = 336.5;
const var MIX_FURY_Y = 336.5;
const var MIX_GOLD_Y = 166.5;
const var MIX_CX = 512.0;
const var MIX_CY = 336.0;
const var MIX_R = 420.0;
const var MIX_PAN_AMT = 0.3;
const var BALL_SPREAD_X = 118.0;
const var BALL_SPREAD_Y = 118.0;
const var ICON_SIZE = 44.0;      // on-screen badge (row height)
const var ICON_TILE = 100;       // source tile in icons-filmstrip.png (2x)
const var ICON_COUNT = 91;       // 13 cols × 7 rows
const var ICON_ALPH = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-./ ";
const var ICON_ATLAS = "iconsAtlas";
const var CARD_TITLE_MAX = 46;
const var HIT_TITLE_SIZE = 26.0;
const var HIT_TITLE_COL = 0xFFB4B4B4;
const var HIT_TITLE_HOLD = 45;
const var HIT_TITLE_SPEED = 0.85;

reg animT = 0.0;
var ballBX = [];
var ballBY = [];
var ballR = [];
var ballAMin = [];
var ballAMax = [];
var ballFx1 = [];
var ballFx2 = [];
var ballFy1 = [];
var ballFy2 = [];
var ballFa = [];
var ballAx1 = [];
var ballAx2 = [];
var ballAy1 = [];
var ballAy2 = [];
var ballPx1 = [];
var ballPx2 = [];
var ballPy1 = [];
var ballPy2 = [];
var ballPa = [];
var ballCol = [];
var ballPosX = [];
var ballPosY = [];
var ballVx = [];
var ballVy = [];
var ballK = [];
var ballDamp = [];
var animBallsOn = 0;

inline function emotionNodesOn()
{
	if (canvasCalmOn)
		return 1;
	if (canvasFuryOn)
		return 1;
	if (canvasGoldOn)
		return 1;
	return 0;
}

inline function ballSideOn(i)
{
	if (i < BALL_N_SIDE)
		return canvasCalmOn;
	if (i < BALL_N_SIDE * 2)
		return canvasFuryOn;
	return canvasGoldOn;
}

inline function initAnimBalls()
{
	if (!isDefined(animPanel))
		return;

	local i = 0;
	local col = 0;
	local dx = 0.0;
	local dy = 0.0;
	local ang = 0.0;
	local rad = 0.0;
	local fall = 0.0;
	local ax = animPanel.get("x");
	local ay = animPanel.get("y");
	local h0x = pillCalmX + CAP_W * 0.5 - ax;
	local h0y = pillCalmY + CAP_H * 0.5 - ay;
	local h1x = pillFuryX + CAP_W * 0.5 - ax;
	local h1y = pillFuryY + CAP_H * 0.5 - ay;
	local h2x = pillGoldX + CAP_W * 0.5 - ax;
	local h2y = pillGoldY + CAP_H * 0.5 - ay;
	local hx = 0.0;
	local hy = 0.0;

	ballBX = [];
	ballBY = [];
	ballR = [];
	ballAMin = [];
	ballAMax = [];
	ballFx1 = [];
	ballFx2 = [];
	ballFy1 = [];
	ballFy2 = [];
	ballFa = [];
	ballAx1 = [];
	ballAx2 = [];
	ballAy1 = [];
	ballAy2 = [];
	ballPx1 = [];
	ballPx2 = [];
	ballPy1 = [];
	ballPy2 = [];
	ballPa = [];
	ballCol = [];
	ballPosX = [];
	ballPosY = [];
	ballVx = [];
	ballVy = [];
	ballK = [];
	ballDamp = [];

	while (i < BALL_N)
	{
		if (i < BALL_N_SIDE)
		{
			col = BALL_COL_CALM;
			hx = h0x;
			hy = h0y;
		}
		else if (i < BALL_N_SIDE * 2)
		{
			col = BALL_COL_FURY;
			hx = h1x;
			hy = h1y;
		}
		else
		{
			col = BALL_COL_GOLD;
			hx = h2x;
			hy = h2y;
		}

		ang = Math.random() * 6.28318530718;
		if (Math.random() < 0.42)
			rad = Math.pow(Math.random(), 2.5);
		else
			rad = 0.38 + 0.62 * Math.sqrt(Math.random());
		dx = rad * BALL_SPREAD_X * Math.cos(ang);
		dy = rad * BALL_SPREAD_Y * Math.sin(ang);
		fall = Math.log(1.0 + 31.0 * rad) / Math.log(32.0);
		ballK.push(0.002 + 0.18 * (1.0 - fall));
		ballDamp.push(0.76 + 0.20 * fall);

		ballBX.push(dx);
		ballBY.push(dy);
		ang = Math.random() * 6.28318530718;
		rad = 50.0 + Math.pow(Math.random(), 0.55) * 420.0;
		ballPosX.push(hx + rad * Math.cos(ang));
		ballPosY.push(hy + rad * Math.sin(ang));
		ballVx.push((Math.random() - 0.5) * 4.0);
		ballVy.push((Math.random() - 0.5) * 4.0);
		ballR.push(2.1 + Math.random() * Math.random() * 16.8);
		ballAMin.push(0.12 + 0.18 * Math.random());
		ballAMax.push(0.45 + 0.45 * Math.random());
		ballFx1.push(0.18 + 0.55 * Math.random());
		ballFx2.push(0.35 + 0.90 * Math.random());
		ballFy1.push(0.22 + 0.50 * Math.random());
		ballFy2.push(0.40 + 0.85 * Math.random());
		ballFa.push(0.20 + 0.70 * Math.random());
		ballAx1.push(8.0 + 28.0 * Math.random());
		ballAx2.push(4.0 + 16.0 * Math.random());
		ballAy1.push(6.0 + 20.0 * Math.random());
		ballAy2.push(4.0 + 12.0 * Math.random());
		ballPx1.push(Math.random() * 6.28);
		ballPx2.push(Math.random() * 6.28);
		ballPy1.push(Math.random() * 6.28);
		ballPy2.push(Math.random() * 6.28);
		ballPa.push(Math.random() * 6.28);
		ballCol.push(col);
		i = i + 1;
	}
}

inline function tickBallFollow()
{
	if (!isDefined(animPanel))
		return;
	if (ballPosX.length < BALL_N)
		return;

	local ax = animPanel.get("x");
	local ay = animPanel.get("y");
	local c0x = pillCalmX + CAP_W * 0.5 - ax;
	local c0y = pillCalmY + CAP_H * 0.5 - ay;
	local c1x = pillFuryX + CAP_W * 0.5 - ax;
	local c1y = pillFuryY + CAP_H * 0.5 - ay;
	local c2x = pillGoldX + CAP_W * 0.5 - ax;
	local c2y = pillGoldY + CAP_H * 0.5 - ay;
	local i = 0;
	local hx = 0.0;
	local hy = 0.0;
	local tx = 0.0;
	local ty = 0.0;
	local vx = 0.0;
	local vy = 0.0;

	while (i < BALL_N)
	{
		if (ballSideOn(i))
		{
			if (i < BALL_N_SIDE)
			{
				hx = c0x;
				hy = c0y;
			}
			else if (i < BALL_N_SIDE * 2)
			{
				hx = c1x;
				hy = c1y;
			}
			else
			{
				hx = c2x;
				hy = c2y;
			}
			tx = hx + ballBX[i];
			ty = hy + ballBY[i];
			vx = (ballVx[i] + (tx - ballPosX[i]) * ballK[i]) * ballDamp[i];
			vy = (ballVy[i] + (ty - ballPosY[i]) * ballK[i]) * ballDamp[i];
			ballVx[i] = vx;
			ballVy[i] = vy;
			ballPosX[i] = ballPosX[i] + vx;
			ballPosY[i] = ballPosY[i] + vy;
		}
		i = i + 1;
	}
}

inline function startAnimPanel()
{
	if (!isDefined(animPanel))
		return;

	animPanel.set("opaque", false);
	animPanel.set("enabled", false);

	animPanel.setPaintRoutine(function(g)
	{
		var i = 0;
		var x = 0.0;
		var y = 0.0;
		var r = 0.0;
		var a = 0.0;
		var t = animT;
		var ok = 0;

		if (!canvasCalmOn && !canvasFuryOn && !canvasGoldOn)
			return;
		if (ballPosX.length < BALL_N)
			return;

		while (i < BALL_N)
		{
			ok = 0;
			if (i < BALL_N_SIDE)
			{
				if (canvasCalmOn)
					ok = 1;
			}
			else if (i < BALL_N_SIDE * 2)
			{
				if (canvasFuryOn)
					ok = 1;
			}
			else if (canvasGoldOn)
				ok = 1;
			if (ok)
			{
				x = ballPosX[i] + ballAx1[i] * Math.sin(t * ballFx1[i] + ballPx1[i])
				+ ballAx2[i] * Math.sin(t * ballFx2[i] + ballPx2[i]);
				y = ballPosY[i] + ballAy1[i] * Math.sin(t * ballFy1[i] + ballPy1[i])
				+ ballAy2[i] * Math.cos(t * ballFy2[i] + ballPy2[i]);
			a = ballAMin[i] + (ballAMax[i] - ballAMin[i]) *
				(0.5 + 0.5 * Math.sin(t * ballFa[i] + ballPa[i]));
			r = ballR[i];
				g.setColour(Colours.withAlpha(ballCol[i], a));
			g.fillEllipse([x - r, y - r, r * 2.0, r * 2.0]);
			}
			i = i + 1;
		}
	});

	animPanel.setTimerCallback(function()
	{
		if (!canvasCalmOn && !canvasFuryOn && !canvasGoldOn)
		{
			this.stopTimer();
			return;
		}
		animT = animT + 0.018;
		tickBallFollow();
		this.repaint();
		if (EMO_PILL_BLUR_ON)
			repaintEmotionGlass();
	});
}

inline function syncAnimBalls()
{
	if (!isDefined(animPanel))
		return;
	if (emotionNodesOn())
	{
		if (!animBallsOn)
		{
			initAnimBalls();
			animT = 0.0;
			animBallsOn = 1;
	animPanel.startTimer(33);
		}
		animPanel.repaint();
	}
	else
	{
		animBallsOn = 0;
		animPanel.stopTimer();
		animPanel.repaint();
	}
}

startAnimPanel();

inline function paintGlassRounded(g, area, radius)
{
	if (EMO_PILL_BLUR_ON)
	{
		g.beginLayer(true);
		g.gaussianBlur(EMO_PILL_BLUR);
		g.endLayer();
	}
	g.setColour(EMO_PILL_BG);
	g.fillRoundedRectangle(area, radius);
	g.setColour(EMO_PILL_LINE);
	g.drawRoundedRectangle([area[0] + 1.0, area[1] + 1.0, area[2] - 2.0, area[3] - 2.0], radius - 1.0, 1.6);
}

inline function paintGlassRoundedFlat(g, area, radius)
{
	g.setColour(EMO_PILL_BG);
	g.fillRoundedRectangle(area, radius);
	g.setColour(EMO_PILL_LINE);
	g.drawRoundedRectangle([area[0] + 1.0, area[1] + 1.0, area[2] - 2.0, area[3] - 2.0], radius - 1.0, 1.6);
}

inline function paintGlassCircle(g, s)
{
	local area = [0.0, 0.0, s, s];
	if (EMO_PILL_BLUR_ON)
	{
		g.beginLayer(true);
		g.gaussianBlur(EMO_PILL_BLUR);
		g.endLayer();
	}
	g.setColour(EMO_PILL_BG);
	g.fillEllipse(area);
	g.setColour(EMO_PILL_LINE);
	g.drawEllipse([1.0, 1.0, s - 2.0, s - 2.0], 1.6);
}

inline function paintPillTextAt(g, raw, w, h, ox, oy)
{
	local t = ("" + raw).toUpperCase();
	local inner = w - 26.0;
	g.setColour(EMO_PILL_FG);
	g.setFont(EMO_PILL_FONT, 22);
	if (g.getStringWidth(t) > inner)
	{
		while (t.length > 1 && g.getStringWidth(t + "...") > inner)
			t = t.substring(0, t.length - 1);
		t = t + "...";
	}
	g.drawAlignedText(t, [ox + 12.0, oy + 2.0, inner, h], "centred");
}

inline function paintPillText(g, raw)
{
	paintPillTextAt(g, raw, CAP_W, CAP_H, 0.0, 0.0);
}

inline function tagTextWidth(raw)
{
	local t = ("" + raw).toUpperCase();
	local w = Engine.getStringWidth(t, EMO_PILL_FONT, TAG_FONT, 0.0);
	if (w < 1.0)
		w = t.length * TAG_FONT * 0.7;
	return w * 1.25 + TAG_TEXT_PAD * 2.0;
}

inline function paintTagChip(g, area)
{
	local r = area[3] * 0.5;
	g.setColour(TAG_CHIP_LINE);
	g.drawRoundedRectangle([area[0] + 1.0, area[1] + 1.0, area[2] - 2.0, area[3] - 2.0], r - 1.0, 1.6);
}

inline function paintTagTextAt(g, raw, w, h, ox, oy)
{
	local t = ("" + raw).toUpperCase();
	g.setColour(TAG_CHIP_FG);
	g.setFont(EMO_PILL_FONT, TAG_FONT);
	g.drawAlignedText(t, [ox, oy, w, h], "centred");
}

inline function tagWordAt(i)
{
	if (tagTab == 1)
		return TAG_SYNTH[i];
	if (tagTab == 2)
		return TAG_BASS[i];
	if (tagTab == 3)
		return TAG_PLACE[i];
	if (tagTab == 4)
		return "";
	return TAG_ORCH[i];
}

inline function tagCount()
{
	if (tagTab == 1)
		return TAG_SYNTH.length;
	if (tagTab == 2)
		return TAG_BASS.length;
	if (tagTab == 3)
		return TAG_PLACE.length;
	if (tagTab == 4)
		return 0;
	return TAG_ORCH.length;
}

inline function bassPromptFor(word)
{
	local w = "" + word;
	local i = 0;
	while (i < TAG_BASS.length)
	{
		if (("" + TAG_BASS[i]) == w)
			return TAG_BASS_PROMPT[i];
		i = i + 1;
	}
	return w;
}

inline function tagBankKey()
{
	if (tagTab == 3)
		return "v6_locations";
	return "v6";
}

inline function setupCapsuleOutline(p, side)
{
	if (!isDefined(p))
		return;

	p.set("width", CAP_W);
	p.set("height", CAP_H);
	p.set("opaque", false);
	p.set("enabled", false);
	p.data.which = side;
	p.setPaintRoutine(function(g)
	{
		var t = "";
		var which = this.data.which;
		paintGlassRounded(g, [0.0, 0.0, CAP_W, CAP_H], CAP_H * 0.5);
		if (which == 1)
			t = emotionCalmPrompt;
		else if (which == 2)
			t = emotionFuryPrompt;
		else
			t = emotionGoldPrompt;
		paintPillText(g, t);
	});
}

inline function repaintEmotionGlass()
{
	if (isDefined(calmCapsule))
		calmCapsule.repaint();
	if (isDefined(furyCapsule))
		furyCapsule.repaint();
	if (isDefined(calmRefresh))
		calmRefresh.repaint();
	if (isDefined(furyRefresh))
		furyRefresh.repaint();
	if (isDefined(goldCapsule))
		goldCapsule.repaint();
	if (isDefined(goldRefresh))
		goldRefresh.repaint();
	if (isDefined(calmDelete))
		calmDelete.repaint();
	if (isDefined(furyDelete))
		furyDelete.repaint();
	if (isDefined(goldDelete))
		goldDelete.repaint();
}

setupCapsuleOutline(calmCapsule, 1);
setupCapsuleOutline(furyCapsule, 2);
setupCapsuleOutline(goldCapsule, 3);
if (isDefined(calmLabel))
{
	calmLabel.set("fontName", "Tuffy");
	calmLabel.set("fontSize", 33);
	calmLabel.set("textColour", Colours.withAlpha(0xFFFFFFFF, 0.8));
}
if (isDefined(furyLabel))
{
	furyLabel.set("fontName", "Tuffy");
	furyLabel.set("fontSize", 33);
	furyLabel.set("textColour", Colours.withAlpha(0xFFFFFFFF, 0.8));
}
if (isDefined(goldLabel))
{
	goldLabel.set("fontName", "Tuffy");
	goldLabel.set("fontSize", 33);
	goldLabel.set("textColour", Colours.withAlpha(0xFFFFFFFF, 0.8));
}

var xyX = 512.0;
var xyY = 336.0;

inline function mixLinToDb(lin)
{
	if (lin <= 0.00001)
		return -100.0;
	return PLAY_GAIN + 20.0 * Math.log(lin) / Math.log(10.0);
}

inline function pillCalmCx()
{
	return pillCalmX + CAP_W * 0.5;
}

inline function pillGoldCx()
{
	return pillGoldX + CAP_W * 0.5;
}

inline function pillCalmCy()
{
	return pillCalmY + CAP_H * 0.5;
}

inline function pillFuryCy()
{
	return pillFuryY + CAP_H * 0.5;
}

inline function pillGoldCy()
{
	return pillGoldY + CAP_H * 0.5;
}

inline function clampPillX(x)
{
	local cx = x + CAP_W * 0.5;
	local minC = 12.0 + CAP_W * 0.5;
	local maxC = 1024.0 - 12.0 - CAP_W * 0.5;
	if (cx < minC)
		cx = minC;
	if (cx > maxC)
		cx = maxC;
	return cx - CAP_W * 0.5;
}

inline function clampPillY(y)
{
	local cy = y + CAP_H * 0.5;
	local minC = 56.0 + CAP_H * 0.5;
	local maxY = 620.0;
	local maxC = 0.0;
	if (isDefined(tagsPanel))
		maxY = tagsPanel.get("y") - 8.0;
	maxC = maxY - CAP_H * 0.5;
	if (cy < minC)
		cy = minC;
	if (cy > maxC)
		cy = maxC;
	return cy - CAP_H * 0.5;
}

inline function samePillPos(a, b)
{
	if (Math.abs(a - b) < 0.05)
		return 1;
	return 0;
}

inline function findCompIndex(comp)
{
	if (!isDefined(comp))
		return -1;
	return Content.getAllComponents(".*").indexOf(comp);
}

inline function sendPillGesture(idx, on)
{
	if (!isDefined(presetHandler))
		return;
	if (idx < 0)
		return;
	presetHandler.sendParameterGesture(AUTO_SCRIPT_CTRL, idx, on);
}

inline function startPillGesture(side)
{
	if (pillGestureOn)
		return;
	if (side == 1)
	{
		sendPillGesture(calmXIdx, 1);
		sendPillGesture(calmYIdx, 1);
	}
	else if (side == 2)
	{
		sendPillGesture(furyXIdx, 1);
		sendPillGesture(furyYIdx, 1);
	}
	else if (side == 3)
	{
		sendPillGesture(goldXIdx, 1);
		sendPillGesture(goldYIdx, 1);
	}
	pillGestureOn = side;
}

inline function endPillGesture()
{
	local side = pillGestureOn;
	if (!side)
		return;
	if (side == 1)
	{
		sendPillGesture(calmXIdx, 0);
		sendPillGesture(calmYIdx, 0);
	}
	else if (side == 2)
	{
		sendPillGesture(furyXIdx, 0);
		sendPillGesture(furyYIdx, 0);
	}
	else if (side == 3)
	{
		sendPillGesture(goldXIdx, 0);
		sendPillGesture(goldYIdx, 0);
	}
	pillGestureOn = 0;
}

inline function writeSliderPos(s, v)
{
	if (!isDefined(s))
		return;
	if (samePillPos(s.getValue(), v))
		return;
	s.setValue(v);
	s.changed();
}

inline function writePillAuto(side)
{
	local pulse = 0;
	if (!pillGestureOn)
	{
		startPillGesture(side);
		pulse = 1;
	}
	if (side == 1)
	{
		writeSliderPos(calmXSlider, pillCalmX);
		writeSliderPos(calmYSlider, pillCalmY);
	}
	else if (side == 2)
	{
		writeSliderPos(furyXSlider, pillFuryX);
		writeSliderPos(furyYSlider, pillFuryY);
	}
	else if (side == 3)
	{
		writeSliderPos(goldXSlider, pillGoldX);
		writeSliderPos(goldYSlider, pillGoldY);
	}
	if (pulse)
		endPillGesture();
}

inline function onCalmXSlider(component, value)
{
	local x = clampPillX(value);
	if (samePillPos(x, pillCalmX))
		return;
	pillCalmX = x;
	placeCalmChrome();
	applyEmotionMix();
}

inline function onCalmYSlider(component, value)
{
	local y = clampPillY(value);
	if (samePillPos(y, pillCalmY))
		return;
	pillCalmY = y;
	placeCalmChrome();
	applyEmotionMix();
}

inline function onFuryXSlider(component, value)
{
	local x = clampPillX(value);
	if (samePillPos(x, pillFuryX))
		return;
	pillFuryX = x;
	placeFuryChrome();
	applyEmotionMix();
}

inline function onFuryYSlider(component, value)
{
	local y = clampPillY(value);
	if (samePillPos(y, pillFuryY))
		return;
	pillFuryY = y;
	placeFuryChrome();
	applyEmotionMix();
}

inline function onGoldXSlider(component, value)
{
	local x = clampPillX(value);
	if (samePillPos(x, pillGoldX))
		return;
	pillGoldX = x;
	placeGoldChrome();
	applyEmotionMix();
}

inline function onGoldYSlider(component, value)
{
	local y = clampPillY(value);
	if (samePillPos(y, pillGoldY))
		return;
	pillGoldY = y;
	placeGoldChrome();
	applyEmotionMix();
}

inline function readPillSliders()
{
	if (isDefined(calmXSlider))
		pillCalmX = clampPillX(calmXSlider.getValue());
	if (isDefined(calmYSlider))
		pillCalmY = clampPillY(calmYSlider.getValue());
	if (isDefined(furyXSlider))
		pillFuryX = clampPillX(furyXSlider.getValue());
	if (isDefined(furyYSlider))
		pillFuryY = clampPillY(furyYSlider.getValue());
	if (isDefined(goldXSlider))
		pillGoldX = clampPillX(goldXSlider.getValue());
	if (isDefined(goldYSlider))
		pillGoldY = clampPillY(goldYSlider.getValue());
}

inline function setupPillSliders()
{
	calmXIdx = findCompIndex(calmXSlider);
	calmYIdx = findCompIndex(calmYSlider);
	furyXIdx = findCompIndex(furyXSlider);
	furyYIdx = findCompIndex(furyYSlider);
	goldXIdx = findCompIndex(goldXSlider);
	goldYIdx = findCompIndex(goldYSlider);
	bindCallback(calmXSlider, onCalmXSlider);
	bindCallback(calmYSlider, onCalmYSlider);
	bindCallback(furyXSlider, onFuryXSlider);
	bindCallback(furyYSlider, onFuryYSlider);
	bindCallback(goldXSlider, onGoldXSlider);
	bindCallback(goldYSlider, onGoldYSlider);
	readPillSliders();
}

inline function hitPill(x, y, px, py)
{
	if (x < px || x >= px + CAP_W)
		return 0;
	if (y < py || y >= py + CAP_H)
		return 0;
	return 1;
}

inline function hitIcon(x, y, ix, iy)
{
	if (x < ix || x >= ix + CAP_ICON_S)
		return 0;
	if (y < iy || y >= iy + CAP_ICON_S)
		return 0;
	return 1;
}

inline function placeCalmChrome()
{
	if (isDefined(calmCapsule))
	{
		calmCapsule.set("x", pillCalmX);
		calmCapsule.set("y", pillCalmY);
	}
	if (isDefined(calmLabel))
	{
		calmLabel.set("x", pillCalmX);
		calmLabel.set("y", pillCalmY);
		calmLabel.set("enabled", false);
	}
	if (isDefined(calmRefresh))
	{
		calmRefresh.set("x", pillCalmX + CAP_REFRESH_DX);
		calmRefresh.set("y", pillCalmY + CAP_ICON_DY);
	}
	if (isDefined(calmDelete))
	{
		calmDelete.set("x", pillCalmX + CAP_DELETE_DX);
		calmDelete.set("y", pillCalmY + CAP_ICON_DY);
	}
}

inline function placeFuryChrome()
{
	if (isDefined(furyCapsule))
	{
		furyCapsule.set("x", pillFuryX);
		furyCapsule.set("y", pillFuryY);
	}
	if (isDefined(furyLabel))
	{
		furyLabel.set("x", pillFuryX);
		furyLabel.set("y", pillFuryY);
		furyLabel.set("enabled", false);
	}
	if (isDefined(furyRefresh))
	{
		furyRefresh.set("x", pillFuryX + CAP_REFRESH_DX);
		furyRefresh.set("y", pillFuryY + CAP_ICON_DY);
	}
	if (isDefined(furyDelete))
	{
		furyDelete.set("x", pillFuryX + CAP_DELETE_DX);
		furyDelete.set("y", pillFuryY + CAP_ICON_DY);
	}
}

inline function placeGoldChrome()
{
	if (isDefined(goldCapsule))
	{
		goldCapsule.set("x", pillGoldX);
		goldCapsule.set("y", pillGoldY);
	}
	if (isDefined(goldLabel))
	{
		goldLabel.set("x", pillGoldX);
		goldLabel.set("y", pillGoldY);
		goldLabel.set("enabled", false);
	}
	if (isDefined(goldRefresh))
	{
		goldRefresh.set("x", pillGoldX + CAP_REFRESH_DX);
		goldRefresh.set("y", pillGoldY + CAP_ICON_DY);
	}
	if (isDefined(goldDelete))
	{
		goldDelete.set("x", pillGoldX + CAP_DELETE_DX);
		goldDelete.set("y", pillGoldY + CAP_ICON_DY);
	}
}

inline function pillLinFromCenter(px, py)
{
	local cx = px + CAP_W * 0.5;
	local cy = py + CAP_H * 0.5;
	local dx = cx - MIX_CX;
	local dy = cy - MIX_CY;
	local d = Math.sqrt(dx * dx + dy * dy);
	local t = 0.0;
	if (MIX_R > 1.0)
		t = d / MIX_R;
	if (t < 0.0)
		t = 0.0;
	if (t > 1.0)
		t = 1.0;
	return Math.cos(t * 1.57079632679);
}

inline function pillPanFromX(px)
{
	local cx = px + CAP_W * 0.5;
	local n = 0.0;
	if (MIX_CX > 1.0)
		n = (cx - MIX_CX) / MIX_CX;
	if (n < -1.0)
		n = -1.0;
	if (n > 1.0)
		n = 1.0;
	return n * MIX_PAN_AMT;
}

inline function applyEmotionMix()
{
	if (canvasCalmOn && emotionHotMuteSide != 0)
		setFxParam("ch0_gain_gain", mixLinToDb(pillLinFromCenter(pillCalmX, pillCalmY)));
	else
		setFxParam("ch0_gain_gain", -100.0);
	if (canvasFuryOn && emotionHotMuteSide != 1)
		setFxParam("fury_gain_gain", mixLinToDb(pillLinFromCenter(pillFuryX, pillFuryY)));
	else
		setFxParam("fury_gain_gain", -100.0);
	if (canvasGoldOn && emotionHotMuteSide != 2)
		setFxParam("gold_gain_gain", mixLinToDb(pillLinFromCenter(pillGoldX, pillGoldY)));
	else
		setFxParam("gold_gain_gain", -100.0);
	if (canvasCalmOn)
		setFxParam("ch0_pan_pan", pillPanFromX(pillCalmX));
	else
		setFxParam("ch0_pan_pan", 0.0);
	if (canvasFuryOn)
		setFxParam("fury_pan_pan", pillPanFromX(pillFuryX));
	else
		setFxParam("fury_pan_pan", 0.0);
	if (canvasGoldOn)
		setFxParam("gold_pan_pan", pillPanFromX(pillGoldX));
	else
		setFxParam("gold_pan_pan", 0.0);
	if (isDefined(animPanel))
		animPanel.repaint();
}

inline function setupXyPad()
{
	if (!isDefined(xyPad))
		return;

	xyPad.set("opaque", false);
	xyPad.set("enabled", true);
	xyPad.set("allowCallbacks", "Clicks, Hover & Dragging");
	xyPad.setZLevel("Default");

	xyPad.setPaintRoutine(function(g)
	{
		g.setColour(0);
		g.fillRect([0.0, 0.0, 1.0, 1.0]);
	});

	xyPad.setMouseCallback(function(event)
	{
		var x = event.x;
		var y = event.y;
		if (!event.clicked && !event.drag)
			return;
	});
}

setupXyPad();
applyEmotionMix();

inline function debugLog(msg)
{
	Console.print(msg);
}

inline function bindCallback(comp, fn)
{
	if (isDefined(comp))
		comp.setControlCallback(fn);
}

inline function resolveEngine()
{
	if (isDefined(EngineFX))
		return EngineFX;

	EngineFX = Synth.getAudioSampleProcessor(ENGINE_FX_ID);
	if (!isDefined(EngineFX))
	{
		debugLog("[AI-cinescapes] AudioSampleProcessor not found: " + ENGINE_FX_ID);
		return undefined;
	}

	return EngineFX;
}

inline function resolveAttrIndex(paramId)
{
	if (attrCache[paramId] != undefined)
		return attrCache[paramId];

	local fx = resolveEngine();
	if (!isDefined(fx))
		return -1;

	local idx = fx.getAttributeIndex(paramId);
	if (idx < 0)
	{
		local n = fx.getNumAttributes();
		local i = 0;
		while (i < n)
		{
			if (fx.getAttributeId(i) == paramId)
			{
				idx = i;
				break;
			}
			i = i + 1;
		}
	}

	if (idx < 0)
	{
		debugLog("[AI-cinescapes] attr missing: " + paramId);
		return -1;
	}

	attrCache[paramId] = idx;
	return idx;
}

inline function setFxParam(paramId, value)
{
	local fx = resolveEngine();
	if (!isDefined(fx))
		return 0;

	local idx = resolveAttrIndex(paramId);
	if (idx < 0)
		return 0;

	fx.setAttribute(idx, value);
	return 1;
}

inline function setStretchPitch(paramId, ratio)
{
	local semis = 0.0;
	if (ratio > 0.0001)
		semis = 12.0 * Math.log(ratio) / Math.log(2.0);
	setFxParam(paramId, semis);
}

inline function resolveRecorder()
{
	if (isDefined(RecorderFX))
		return RecorderFX;

	RecorderFX = Synth.getAudioSampleProcessor(RECORD_FX_ID);
	if (!isDefined(RecorderFX))
	{
		debugLog("[AI-cinescapes] AudioSampleProcessor not found: " + RECORD_FX_ID);
		return undefined;
	}

	return RecorderFX;
}

inline function resolveCaptureAttrIndex(paramId)
{
	if (captureAttrCache[paramId] != undefined)
		return captureAttrCache[paramId];

	local fx = resolveRecorder();
	if (!isDefined(fx))
		return -1;

	local idx = fx.getAttributeIndex(paramId);
	if (idx < 0)
	{
		local n = fx.getNumAttributes();
		local i = 0;
		while (i < n)
		{
			if (fx.getAttributeId(i) == paramId)
			{
				idx = i;
				break;
			}
			i = i + 1;
		}
	}

	if (idx < 0)
	{
		debugLog("[AI-cinescapes] recorder attr missing: " + paramId + " (numAttrs=" + fx.getNumAttributes() + ")");
		return -1;
	}

	captureAttrCache[paramId] = idx;
	return idx;
}

inline function setCaptureParam(paramId, value)
{
	local fx = resolveRecorder();
	if (!isDefined(fx))
		return 0;

	local idx = resolveCaptureAttrIndex(paramId);
	if (idx < 0)
		return 0;

	fx.setAttribute(idx, value);
	return 1;
}

inline function retriggerCaptureGate()
{
	setCaptureParam("capture_gate", 0.0);
	setCaptureParam("capture_gate", 1.0);
}

/** Project/AppData root via UserPresets → sibling Semantic_s/ */
inline function projectSemanticFolder()
{
	local presets = FileSystem.getFolder(FileSystem.UserPresets);
	if (!isDefined(presets))
		return undefined;
	return presets.getParentDirectory().getChildFile("Semantic_s");
}

/** Same folder as UserPresets (AppData Backgrounds / project root). Not inside Semantic_s. */
inline function captureExportFolder()
{
	local presets = FileSystem.getFolder(FileSystem.UserPresets);
	if (!isDefined(presets))
		return undefined;
	return presets.getParentDirectory();
}

inline function wavPathForEntry(entry)
{
	local root = projectSemanticFolder();
	local curated = undefined;
	local f = undefined;
	if (!isDefined(root))
		return undefined;
	curated = root.getChildFile("v6_curated");
	if (use_ogg)
		f = curated.getChildFile(entry.id + ".ogg");
	else
		f = curated.getChildFile(entry.id + ".flac");
	if (isDefined(f) && f.isFile())
		return f;
	return root.getChildFile("wavs").getChildFile(entry.id + ".wav");
}

inline function silenceHop(n)
{
	local hop = Math.round(n / 2500.0);
	if (hop < 64)
		hop = 64;
	if (hop > 2048)
		hop = 2048;
	return hop;
}

inline function findActiveSampleRange(slot)
{
	local n = slot.getNumSamples();
	if (n <= SILENCE_MIN_SAMPLES)
		return [0, n];

	local content = slot.getContent();
	if (!isDefined(content) || content.length < 1)
		return [0, n];

	local buf = content[0];
	if (!isDefined(buf))
		return [0, n];

	local peak = buf.getMagnitude(0, n);
	if (peak < SILENCE_FLOOR)
		return [0, n];

	local thresh = SILENCE_FLOOR;
	local hop = silenceHop(n);

	local start = 0;
	while (start < n)
	{
		local len = hop;
		if (start + len > n)
			len = n - start;
		if (buf.getMagnitude(start, len) >= thresh)
			break;
		start = start + hop;
	}

	local end = n;
	while (end > start)
	{
		local s = end - hop;
		if (s < start)
			s = start;
		local len = end - s;
		if (len > 0 && buf.getMagnitude(s, len) >= thresh)
			break;
		end = s;
	}

	if (end - start < SILENCE_MIN_SAMPLES)
		return [0, n];

	return [start, end];
}

inline function applySlotActiveRange(slot, label)
{
	local full = slot.getNumSamples();
	local range = findActiveSampleRange(slot);
	local start = range[0];
	local end = range[1];

	if (end <= start)
		return;

	if (start <= 0 && end >= full)
		return;

	slot.setRange(start, end);
	debugLog("[AI-cinescapes] " + label + " range: " + start + ".." + end + " / " + full);
}

inline function loadAudioFile(slotIndex, entry, label)
{
	if (entry == undefined)
		return 0;

	local fx = resolveEngine();
	if (!isDefined(fx))
		return 0;

	local wav = wavPathForEntry(entry);
	if (!isDefined(wav) || !wav.isFile())
	{
		debugLog("[AI-cinescapes] audio not found for " + label + ": " + entry.id);
		return 0;
	}

	local path = wav.toString(0);
	debugLog("loadFile " + label + " → " + path);
	local slot = fx.getAudioFile(slotIndex);

	if (isDefined(slot))
	{
		slot.loadFile(path);
		return 1;
	}

	debugLog("[AI-cinescapes] missing audio slot " + slotIndex);
	return 0;
}

inline function loadFileIntoSlot(slotIndex, entry, label)
{
	if (!loadAudioFile(slotIndex, entry, label))
		return 0;

	local fx = resolveEngine();
	if (!isDefined(fx))
		return 0;

	local slot = fx.getAudioFile(slotIndex);
	if (isDefined(slot))
		applySlotActiveRange(slot, label);

	return 1;
}

inline function loadCalmIntoStretches(entry, label)
{
	if (!loadAudioFile(PLAY_SLOT, entry, label))
		return 0;
	local fx = resolveEngine();
	if (isDefined(fx))
		applySlotActiveRange(fx.getAudioFile(PLAY_SLOT), label);
	return 1;
}

inline function loadFuryIntoStretches(entry, label)
{
	if (!loadAudioFile(FURY_SLOT, entry, label))
		return 0;
	local fx = resolveEngine();
	if (isDefined(fx))
		applySlotActiveRange(fx.getAudioFile(FURY_SLOT), label);
	return 1;
}

inline function loadGoldIntoStretches(entry, label)
{
	if (!loadAudioFile(GOLD_SLOT, entry, label))
		return 0;
	local fx = resolveEngine();
	if (isDefined(fx))
		applySlotActiveRange(fx.getAudioFile(GOLD_SLOT), label);
	return 1;
}

inline function hzToMidiRound(hz)
{
	return Math.round(69.0 + 12.0 * Math.log(hz / 440.0) / Math.log(2.0));
}

inline function detectSlotPitchMidi(slotIndex)
{
	local fx = resolveEngine();
	local slot = undefined;
	local sr = 0.0;
	local num = 0;
	local content = 0;
	local buf = undefined;
	local range = 0;
	local start = 0;
	local end = 0;
	local win = PITCH_WINDOW;
	local hop = 0;
	local pos = 0;
	local hz = 0.0;
	local midi = -1;
	local bestMidi = -1;
	local bestCount = 0;
	local i = 0;
		local count = 0;
	local votes = [];
	if (!isDefined(fx))
		return -1;
	slot = fx.getAudioFile(slotIndex);
	if (!isDefined(slot))
		return -1;
	sr = slot.getSampleRate();
	num = slot.getNumSamples();
	if (sr <= 0.0 || num < 64)
		return -1;
	content = slot.getContent();
	if (!isDefined(content) || content.length < 1)
		return -1;
	buf = content[0];
	if (!isDefined(buf))
		return -1;
	range = findActiveSampleRange(slot);
	start = range[0];
	end = start + Math.round(sr * PITCH_AVG_SEC);
	if (end > range[1])
		end = range[1];
	if (win > end - start)
		win = end - start;
	if (win < 64)
		return -1;
	hop = Math.floor(win / 2);
	if (hop < 64)
		hop = 64;
	pos = start;
	while (pos + win <= end)
	{
		hz = buf.detectPitch(sr, pos, win);
		if (hz >= 20.0 && hz <= 5000.0)
			votes.push(hzToMidiRound(hz));
		pos = pos + hop;
	}
	if (votes.length < 1)
		return -1;
	while (i < votes.length)
	{
		midi = votes[i];
		count = 0;
		local j = 0;
		while (j < votes.length)
		{
			if (votes[j] == midi)
				count = count + 1;
			j = j + 1;
		}
		if (count > bestCount)
		{
			bestCount = count;
			bestMidi = midi;
		}
		i = i + 1;
	}
	return bestMidi;
}

inline function chromaPc(midi)
{
	local p = midi % 12;
	if (p < 0)
		p = p + 12;
	return p;
}

inline function chromaSemis(fromMidi, toMidi)
{
	local a = chromaPc(fromMidi);
	local b = chromaPc(toMidi);
	local d = b - a;
	if (d > 6)
		d = d - 12;
	if (d < -6)
		d = d + 12;
	return d;
}

inline function chromaDistAbs(fromMidi, toPc)
{
	local d = chromaSemis(fromMidi, toPc);
	if (d < 0)
		d = 0 - d;
	return d;
}

inline function pickEmotionTargetPc()
{
	local pc = 0;
	local best = 0;
	local bestCost = 999;
	local cost = 0;
	local n = 0;
	if (emotionTargetPc >= 0)
		return;
	if (emotionCalmMidi < 0 && emotionFuryMidi < 0 && emotionGoldMidi < 0)
	{
		emotionTargetPc = -1;
		return;
	}
	while (pc < 12)
	{
		cost = 0;
		n = 0;
		if (emotionCalmMidi >= 0)
		{
			cost = cost + chromaDistAbs(emotionCalmMidi, pc);
			n = n + 1;
		}
		if (emotionFuryMidi >= 0)
		{
			cost = cost + chromaDistAbs(emotionFuryMidi, pc);
				n = n + 1;
			}
		if (emotionGoldMidi >= 0)
		{
			cost = cost + chromaDistAbs(emotionGoldMidi, pc);
			n = n + 1;
		}
		if (n > 0 && cost < bestCost)
		{
			bestCost = cost;
			best = pc;
		}
		pc = pc + 1;
	}
	emotionTargetPc = best;
}

inline function pitchRatioToTarget(srcMidi)
{
	local d = 0;
	local r = 1.0;
	if (srcMidi < 0 || emotionTargetPc < 0)
		return 1.0;
	d = chromaSemis(srcMidi, emotionTargetPc);
	r = Math.pow(2.0, d / 12.0);
	if (r < 0.5)
		r = 0.5;
	if (r > 2.0)
		r = 2.0;
	return r;
}

inline function applyEmotionPitchMatch()
{
	if (!emotionPitchMatchOn)
	{
		emotionCalmRatio = 1.0;
		emotionFuryRatio = 1.0;
		emotionGoldRatio = 1.0;
		setStretchPitch("ch0_stretch_pitch", 1.0);
		setStretchPitch("fury_stretch_pitch", 1.0);
		setStretchPitch("gold_stretch_pitch", 1.0);
		debugLog("[AI-cinescapes] pitch match off");
		return;
	}
	pickEmotionTargetPc();
	if (emotionCalmMidi >= 0)
		emotionCalmRatio = pitchRatioToTarget(emotionCalmMidi);
	if (emotionFuryMidi >= 0)
		emotionFuryRatio = pitchRatioToTarget(emotionFuryMidi);
	if (emotionGoldMidi >= 0)
		emotionGoldRatio = pitchRatioToTarget(emotionGoldMidi);
	setStretchPitch("ch0_stretch_pitch", emotionCalmRatio);
	setStretchPitch("fury_stretch_pitch", emotionFuryRatio);
	setStretchPitch("gold_stretch_pitch", emotionGoldRatio);
	debugLog("[AI-cinescapes] pitch target=" + emotionTargetPc + " calm=" + emotionCalmMidi + " r=" + emotionCalmRatio + " fury=" + emotionFuryMidi + " r=" + emotionFuryRatio + " gold=" + emotionGoldMidi + " r=" + emotionGoldRatio);
}

inline function applyEmotionPitchMatchSide(side)
{
	if (!emotionPitchMatchOn)
	{
		if (side == 0)
		{
			emotionCalmRatio = 1.0;
			setStretchPitch("ch0_stretch_pitch", 1.0);
		}
		else if (side == 1)
		{
			emotionFuryRatio = 1.0;
			setStretchPitch("fury_stretch_pitch", 1.0);
		}
		else
		{
			emotionGoldRatio = 1.0;
			setStretchPitch("gold_stretch_pitch", 1.0);
		}
		return;
	}
	pickEmotionTargetPc();
	if (side == 0)
	{
		if (emotionCalmMidi >= 0)
			emotionCalmRatio = pitchRatioToTarget(emotionCalmMidi);
		else
			emotionCalmRatio = 1.0;
		setStretchPitch("ch0_stretch_pitch", emotionCalmRatio);
	}
	else if (side == 1)
	{
		if (emotionFuryMidi >= 0)
			emotionFuryRatio = pitchRatioToTarget(emotionFuryMidi);
		else
			emotionFuryRatio = 1.0;
		setStretchPitch("fury_stretch_pitch", emotionFuryRatio);
	}
	else
	{
		if (emotionGoldMidi >= 0)
			emotionGoldRatio = pitchRatioToTarget(emotionGoldMidi);
		else
			emotionGoldRatio = 1.0;
		setStretchPitch("gold_stretch_pitch", emotionGoldRatio);
	}
}

inline function armEmotionPitchMatch()
{
	applyEmotionPitchMatch();
}

inline function setCompVisible(c, on)
{
	if (isDefined(c))
		c.set("visible", on ? 1 : 0);
}

inline function isStopword(t)
{
	if (t == "a" || t == "an" || t == "the" || t == "in" || t == "of")
		return true;
	if (t == "and" || t == "to" || t == "or" || t == "on" || t == "at")
		return true;
	if (t == "for" || t == "with" || t == "from" || t == "by" || t == "as")
		return true;
	// Spanish fillers (common in SFX prompts)
	if (t == "el" || t == "la" || t == "los" || t == "las" || t == "un" || t == "una")
		return true;
	if (t == "del" || t == "al" || t == "en" || t == "de" || t == "y" || t == "que")
		return true;
	if (t == "por" || t == "con" || t == "para" || t == "una" || t == "unos" || t == "unas")
		return true;
	return false;
}

inline function isTokenChar(c)
{
	if (c >= "a" && c <= "z")
		return true;
	if (c >= "0" && c <= "9")
		return true;
	if (c == "_")
		return true;
	return false;
}

inline function tokenize(text)
{
	local s = ("" + text).toLowerCase();
	local tokens = [];
	local cur = "";
	local i = 0;
	local n = s.length;

	while (i < n)
	{
		local c = s.substring(i, i + 1);
		if (isTokenChar(c))
		{
			cur = cur + c;
		}
		else
		{
			if (cur.length > 0)
			{
				if (!isStopword(cur) && cur.length > 1)
					tokens.push(cur);
				cur = "";
			}
		}
		i = i + 1;
	}

	if (cur.length > 0 && !isStopword(cur) && cur.length > 1)
		tokens.push(cur);

	return tokens;
}

inline function scoreEntry(entry, tokens)
{
	local score = 0;
	local tag = ("" + entry.tag).toLowerCase();
	local ucs = ("" + entry.ucs).toLowerCase();
	local prompt = ("" + entry.prompt).toLowerCase();
	local ti = 0;

	while (ti < tokens.length)
	{
		local t = tokens[ti];
		if (tag.indexOf(t) >= 0)
			score = score + 3;
		if (ucs.indexOf(t) >= 0)
			score = score + 2;
		if (prompt.indexOf(t) >= 0)
			score = score + 1;
		ti = ti + 1;
	}

	return score;
}

inline function rankMatches(promptText, sourceBank)
{
	local tokens = tokenize(promptText);
	local empty = [];
	if (tokens.length == 0)
		return empty;
	if (sourceBank == undefined)
		return empty;

	local scored = [];
	local i = 0;
	while (i < sourceBank.length)
	{
		local e = sourceBank[i];
		local sc = scoreEntry(e, tokens);
		if (sc > 0)
		{
			e._score = sc;
			scored.push(e);
		}
		i = i + 1;
	}

	local a = 1;
	while (a < scored.length)
	{
		local key = scored[a];
		local b = a - 1;
		while (b >= 0 && scored[b]._score < key._score)
		{
			scored[b + 1] = scored[b];
			b = b - 1;
		}
		scored[b + 1] = key;
		a = a + 1;
	}

	local top = [];
	local k = 0;
	local lim = scored.length;
	if (lim > TOP_N)
		lim = TOP_N;
	while (k < lim)
	{
		top.push(scored[k]);
		k = k + 1;
	}

	return top;
}

inline function findEntryById(sid, sourceBank)
{
	local i = 0;
	while (i < sourceBank.length)
	{
		if (("" + sourceBank[i].id) == ("" + sid))
			return sourceBank[i];
		i = i + 1;
	}
	return undefined;
}

inline function matchesFromClapHits(hits, sourceBank)
{
	local out = [];
	if (hits == undefined || hits.length == undefined)
		return out;

	local i = 0;
	while (i < hits.length)
	{
		local h = hits[i];
		local e = findEntryById(h.id, sourceBank);
		if (e != undefined)
		{
			e._score = Math.round(h.score * 1000);
			e._clap = 1;
			out.push(e);
		}
		i = i + 1;
	}
	return out;
}

inline function initClapSearch()
{
	local root = projectSemanticFolder();
	ClapSearch = Engine.createClapSearch();
	if (isDefined(root) && ClapSearch != undefined)
		ClapSearch.load(root.toString(0));

	if (ClapSearch != undefined && ClapSearch.isReady())
	{
		clapReady = 1;
		debugLog("Semantic search ready (" + ClapSearch.getSize() + " embeddings)");
		return;
	}

	clapReady = 0;
	Server.setBaseURL(CLAP_BASE_URL);
	debugLog("Semantic search unavailable — HTTP fallback " + CLAP_BASE_URL);
}

inline function clapSearch(promptText, bankKey, callback, families)
{
	local k = TOP_N;
	local n = 0;
	local i = 0;
	local line = "";
	local h = undefined;
	if (("" + bankKey) == "v6_sfx" || ("" + bankKey) == "v6sfx" || ("" + bankKey) == "sfx")
		k = TOP_N;

	if (clapReady && ClapSearch != undefined && ClapSearch.isReady())
	{
		local hits = ClapSearch.search(promptText, bankKey, k);
		local data = {};
		data.ok = 1;
		data.hits = hits;
		n = 0;
		if (hits != undefined)
			n = hits.length;
		line = "[CLAP] native \"" + promptText + "\" bank=" + bankKey + " n=" + n;
		i = 0;
		while (i < n && i < 3)
		{
			h = hits[i];
			line = line + " | " + h.id + " " + h.score;
		i = i + 1;
	}
		debugLog(line);
		callback(Server.StatusOK, data);
		return;
	}

	debugLog("[CLAP] http \"" + promptText + "\" bank=" + bankKey + " k=" + k);
	local params = {};
	params.prompt = promptText;
	params.top_k = k;
	params.bank = bankKey;
	if (families != undefined && ("" + families).length > 0)
		params.families = families;
	Server.callWithGET("/search", params, callback);
}

var emotionCalmHits = [];
var emotionFuryHits = [];
var emotionGoldHits = [];
var emotionCalmIndex = -1;
var emotionFuryIndex = -1;
var emotionGoldIndex = -1;
var emotionCalmId = "";
var emotionFuryId = "";
var emotionGoldId = "";
var emotionCalmMidi = -1;
var emotionFuryMidi = -1;
var emotionGoldMidi = -1;
var emotionTargetPc = -1;
var emotionCalmRatio = 1.0;
var emotionFuryRatio = 1.0;
var emotionGoldRatio = 1.0;
var emotionLabelSync = 0;
var emotionSearchStep = 0;
var emotionPitchMatchOn = 1;
var emotionStretchOn = 0;
var emotionBtnSyncing = 0;
var emotionCalmPrompt = "harbor boats";
var emotionFuryPrompt = "lighthouse storm";
var emotionGoldPrompt = "ancient ruins";
var emotionCalmBank = "v6";
var emotionFuryBank = "v6";
var emotionGoldBank = "v6";
var emotionMixSide = 0;
var emotionMixRefresh = 0;
var emotionMixPrompt = "";
var emotionMixHitsV6 = [];
var emotionPromptOpen = 0;
var emotionPromptSide = 0;
var emotionShowTypeIcon = 0;
var emotionShowPlaceholder = 0;
var emoTypeIconW = 14.0;
var emotionMenuOpen = 0;
var emotionMenuHover = -1;
var emotionMenuX = 0.0;
var emotionMenuY = 0.0;
var emotionMenuScroll = 0;
var emotionMenuDragScroll0 = 0;
var emotionMenuDidScroll = 0;
var emotionMenuOnBar = 0;
var capsuleCalmOff = 0;
var capsuleFuryOff = 0;
var capsuleGoldOff = 0;
var tagUseKeys = [];
var tagUseCounts = [];
var emotionCalmPick = 0;
var emotionFuryPick = 0;
var emotionGoldPick = 0;
var skipStateCb = 0;
var lastRestoredState = "";
var emoPromptX = 24.5;
var emoPromptY = 243.8;
var emoPromptW = 380.0;
var emoPromptH = 200.0;
var emoOkX = 463.5;
var emoOkY = 308.5;

inline function sessionNodeObj(on, prompt, bank, sid)
{
	local n = {};
	n.on = on;
	n.p = "" + prompt;
	n.b = "" + bank;
	n.id = "" + sid;
	return n;
}

inline function writeSessionState()
{
	local o = {};
	if (skipStateCb)
		return;
	if (!isDefined(sessionStateLabel))
		return;
	o.v = 1;
	o.n1 = sessionNodeObj(canvasCalmOn, emotionCalmPrompt, emotionCalmBank, emotionCalmId);
	o.n2 = sessionNodeObj(canvasFuryOn, emotionFuryPrompt, emotionFuryBank, emotionFuryId);
	o.n3 = sessionNodeObj(canvasGoldOn, emotionGoldPrompt, emotionGoldBank, emotionGoldId);
	skipStateCb = 1;
	sessionStateLabel.setValue(JSON.stringify(o));
	skipStateCb = 0;
}

inline function clipEmotionPrompt(s)
{
	local t = "" + s;
	if (t == "undefined")
		t = "";
	if (t.length > EMOTION_PROMPT_MAX)
		t = t.substring(0, EMOTION_PROMPT_MAX);
	return t;
}

inline function trimEmotionPrompt(s)
{
	local t = clipEmotionPrompt(s);
	while (t.length > 0 && t.substring(0, 1) == " ")
		t = t.substring(1, t.length);
	return t;
}

inline function capsuleLine(s)
{
	local t = clipEmotionPrompt(s);
	local out = "";
	local i = 0;
	local c = "";
	while (i < t.length)
	{
		c = t.substring(i, i + 1);
		if (c == "\n" || c == "\t")
			c = " ";
		out = out + c;
		i = i + 1;
	}
	return out;
}

inline function capsuleVisible(full, offset)
{
	local t = capsuleLine(full);
	local loop = "";
	local len = 0;
	local i = 0;
	local k = 0;
	local out = "";
	if (t.length <= CAPSULE_CHARS)
		return t;
	loop = t + "   ";
	len = loop.length;
	i = offset % len;
	if (i < 0)
		i = i + len;
	while (k < CAPSULE_CHARS)
	{
		out = out + loop.substring((i + k) % len, (i + k) % len + 1);
		k = k + 1;
	}
	return out;
}

inline function getCalmPrompt()
{
	local t = clipEmotionPrompt(emotionCalmPrompt);
	if (t.length == 0)
		t = "harbor boats";
	return bassPromptFor(t);
}

inline function getFuryPrompt()
{
	local t = clipEmotionPrompt(emotionFuryPrompt);
	if (t.length == 0)
		t = "lighthouse storm";
	return bassPromptFor(t);
}

inline function getGoldPrompt()
{
	local t = clipEmotionPrompt(emotionGoldPrompt);
	if (t.length == 0)
		t = "ancient ruins";
	return bassPromptFor(t);
}

inline function emotionBankArray(bankKey)
{
	if (("" + bankKey) == "v6_locations" || ("" + bankKey) == "v6loc")
		return bankV6loc;
	return bankV6;
}

inline function emotionHitsFromResponse(status, data, promptText, bankKey)
{
	local hits = [];
	local nRaw = 0;
	local bank = emotionBankArray(bankKey);
	if (status == Server.StatusOK && data != undefined && data.ok)
	{
		if (data.hits != undefined)
			nRaw = data.hits.length;
		hits = matchesFromClapHits(data.hits, bank);
	}
	if (hits.length == 0)
	{
		hits = rankMatches(promptText, bank);
		debugLog("[CLAP] fallback tags \"" + promptText + "\" bank=" + bankKey + " raw=" + nRaw + " tags=" + hits.length);
	}
	else
		debugLog("[CLAP] mapped \"" + promptText + "\" bank=" + bankKey + " raw=" + nRaw + " wav=" + hits.length);
	return hits;
}

inline function emotionHitScore(e)
{
	if (e == undefined)
		return 0;
	if (e._score == undefined)
		return 0;
	return e._score;
}

inline function interleaveEmotionHits(a, b)
{
	local out = [];
	local ia = 0;
	local ib = 0;
	local aFirst = 1;
	if (a == undefined)
		a = [];
	if (b == undefined)
		b = [];
	if (a.length == 0)
		return b;
	if (b.length == 0)
		return a;
	if (emotionHitScore(b[0]) > emotionHitScore(a[0]))
		aFirst = 0;
	while (ia < a.length || ib < b.length)
	{
		if (aFirst)
		{
			if (ia < a.length)
			{
				out.push(a[ia]);
				ia = ia + 1;
			}
			if (ib < b.length)
			{
				out.push(b[ib]);
				ib = ib + 1;
			}
		}
		else
		{
			if (ib < b.length)
			{
				out.push(b[ib]);
				ib = ib + 1;
			}
			if (ia < a.length)
			{
				out.push(a[ia]);
				ia = ia + 1;
			}
		}
	}
	return out;
}

inline function tagUseTake(word)
{
	local k = trimEmotionPrompt(word);
	local i = 0;
	local n = 0;
	if (k.length == 0)
		return 0;
	while (i < tagUseKeys.length)
	{
		if (("" + tagUseKeys[i]) == k)
		{
			n = tagUseCounts[i];
			tagUseCounts[i] = n + 1;
		return n;
	}
		i = i + 1;
	}
	tagUseKeys.push(k);
	tagUseCounts.push(1);
	return 0;
}

inline function emotionPickIndex(hits, off)
{
	if (hits == undefined)
		return -1;
	if (hits.length <= 0)
		return -1;
	return off % hits.length;
}

inline function findEntryAnyBank(sid)
{
	local e = findEntryById(sid, bankV6);
	if (e != undefined)
		return e;
	return findEntryById(sid, bankV6loc);
}

inline function emotionIndexById(hits, sid)
{
	local i = 0;
	if (sid == "" || hits == undefined)
		return -1;
	while (i < hits.length)
	{
		if (("" + hits[i].id) == ("" + sid))
			return i;
		i = i + 1;
	}
	return -1;
}

inline function ensureHitInList(hits, sid)
{
	local e = undefined;
	local out = [];
	local i = 0;
	if (sid == "")
		return hits;
	if (emotionIndexById(hits, sid) >= 0)
		return hits;
	e = findEntryAnyBank(sid);
	if (e == undefined)
		return hits;
	out.push(e);
	if (hits == undefined)
		return out;
	while (i < hits.length)
	{
		out.push(hits[i]);
		i = i + 1;
	}
	return out;
}

inline function loadEmotionHits(side, hits, off)
{
	local prefer = "";
	local idx = -1;
	local list = hits;
	if (side == 1)
		prefer = emotionCalmId;
	else if (side == 2)
		prefer = emotionFuryId;
	else
		prefer = emotionGoldId;
	list = ensureHitInList(hits, prefer);
	idx = emotionIndexById(list, prefer);
	if (idx < 0)
		idx = emotionPickIndex(list, off);
	if (idx < 0)
	{
		stopRefreshSpinNode(side);
		return;
	}
	if (side == 1)
	{
		emotionCalmHits = list;
		loadCalmEmotionEntry(list[idx], idx);
		return;
	}
	if (side == 2)
	{
		emotionFuryHits = list;
		loadFuryEmotionEntry(list[idx], idx);
		return;
	}
	emotionGoldHits = list;
	loadGoldEmotionEntry(list[idx], idx);
}

inline function finishEmotionMixHits(hits)
{
	if (emotionMixSide == 1)
	{
		emotionCalmHits = hits;
		if (emotionMixRefresh)
		{
			emotionCalmIndex = -1;
			if (hits.length == 0)
			{
				stopRefreshSpinNode(1);
				return;
			}
			refreshCalmBed();
			return;
		}
		loadEmotionHits(1, hits, emotionCalmPick);
		return;
	}
	if (emotionMixSide == 2)
	{
		emotionFuryHits = hits;
		if (emotionMixRefresh)
		{
			emotionFuryIndex = -1;
			if (hits.length == 0)
			{
				stopRefreshSpinNode(2);
				return;
			}
			refreshFuryBed();
			return;
		}
		loadEmotionHits(2, hits, emotionFuryPick);
		return;
	}
	emotionGoldHits = hits;
	if (emotionMixRefresh)
	{
		emotionGoldIndex = -1;
		if (hits.length == 0)
		{
			stopRefreshSpinNode(3);
			return;
		}
		refreshGoldBed();
		return;
	}
	loadEmotionHits(3, hits, emotionGoldPick);
}

inline function onEmotionMixLoc(status, data)
{
	local loc = emotionHitsFromResponse(status, data, emotionMixPrompt, "v6_locations");
	local hits = interleaveEmotionHits(emotionMixHitsV6, loc);
	debugLog("[CLAP] mix v6=" + emotionMixHitsV6.length + " loc=" + loc.length + " interleaved=" + hits.length);
	finishEmotionMixHits(hits);
}

inline function onEmotionMixV6(status, data)
{
	emotionMixHitsV6 = emotionHitsFromResponse(status, data, emotionMixPrompt, "v6");
	clapSearch(emotionMixPrompt, "v6_locations", onEmotionMixLoc, CLAP_FAMILIES);
}

inline function startEmotionClap(side, prompt, bank, refresh)
{
	startRefreshSpinNode(side);
	if (("" + bank) == "v6mix")
	{
		emotionMixSide = side;
		emotionMixRefresh = refresh;
		emotionMixPrompt = prompt;
		emotionMixHitsV6 = [];
		clapSearch(prompt, "v6", onEmotionMixV6, CLAP_FAMILIES);
		return;
	}
	if (side == 1)
	{
		if (refresh)
			clapSearch(prompt, bank, onCalmEmotionRefresh, CLAP_FAMILIES);
		else
			clapSearch(prompt, bank, onCalmEmotionSearch, CLAP_FAMILIES);
		return;
	}
	if (side == 2)
	{
		clapSearch(prompt, bank, onFuryEmotionSearch, CLAP_FAMILIES);
		return;
	}
	clapSearch(prompt, bank, onGoldEmotionSearch, CLAP_FAMILIES);
}

inline function pickEmotionHit(hits, avoidA, avoidB)
{
	local i = 0;
	if (hits == undefined)
		return undefined;
	while (i < hits.length)
	{
		if ((avoidA == "" || ("" + hits[i].id) != ("" + avoidA)) &&
			(avoidB == "" || ("" + hits[i].id) != ("" + avoidB)))
			return hits[i];
			i = i + 1;
		}
	if (hits.length > 0)
		return hits[0];
	return undefined;
}

inline function nextEmotionIndex(hits, startIndex, avoidA, avoidB)
{
	local n = 0;
	local i = 0;
	local idx = 0;
	if (hits == undefined)
		return -1;
	n = hits.length;
	if (n <= 0)
		return -1;
	while (i < n)
	{
		idx = (startIndex + 1 + i) % n;
		if ((avoidA == "" || ("" + hits[idx].id) != ("" + avoidA)) &&
			(avoidB == "" || ("" + hits[idx].id) != ("" + avoidB)))
			return idx;
		i = i + 1;
	}
	return (startIndex + 1) % n;
}

inline function setEmotionStretchGate()
{
	if (emotionStretchOn)
	{
		applyEmotionPitchMatch();
		setFxParam("ch0_stretch_gate", 1.0);
	}
	else
		setFxParam("ch0_stretch_gate", 0.0);
}

inline function applyEmotionBedParams()
{
	setFxParam("ch0_stretch_speed", PLAY_SPEED);
	setFxParam("ch0_pan_pan", 0.0);
	setFxParam("ch0a_pan_pan", LAYER_V6_PAN_A);
	setFxParam("ch0b_pan_pan", LAYER_V6_PAN_B);
	applyEmotionMix();
}

inline function commitEmotionLoad(side, entry, index)
{
	local midi = -1;
	if (entry == undefined)
		return 0;
	if (side == 0 && !canvasCalmOn)
		return 0;
	if (side == 1 && !canvasFuryOn)
		return 0;
	if (side == 2 && !canvasGoldOn)
		return 0;
	if (side == 0)
	{
		if (!loadCalmIntoStretches(entry, "emotion_calm"))
			return 0;
		midi = detectSlotPitchMidi(PLAY_SLOT);
		if (midi >= 0)
			emotionCalmMidi = midi;
		emotionCalmIndex = index;
		emotionCalmId = "" + entry.id;
		layerV6Entry = entry;
		debugLog("[AI-cinescapes] calm bed " + entry.id);
	}
	else if (side == 1)
	{
		if (!loadFuryIntoStretches(entry, "emotion_fury"))
		return 0;
		midi = detectSlotPitchMidi(FURY_SLOT);
		if (midi >= 0)
			emotionFuryMidi = midi;
		emotionFuryIndex = index;
		emotionFuryId = "" + entry.id;
		debugLog("[AI-cinescapes] fury bed " + entry.id);
	}
	else
	{
		if (!loadGoldIntoStretches(entry, "emotion_gold"))
		return 0;
		midi = detectSlotPitchMidi(GOLD_SLOT);
		if (midi >= 0)
			emotionGoldMidi = midi;
		emotionGoldIndex = index;
		emotionGoldId = "" + entry.id;
		debugLog("[AI-cinescapes] gold bed " + entry.id);
	}
	applyEmotionBedParams();
	if (emotionHotMuteSide == side)
		applyEmotionPitchMatchSide(side);
	else
		applyEmotionPitchMatch();
	writeSessionState();
	return 1;
}

inline function onEmotionRefreshTimer()
{
	if (emotionRefreshPhase == 1)
	{
		commitEmotionLoad(emotionRefreshSide, emotionRefreshEntry, emotionRefreshIndex);
		emotionRefreshPhase = 2;
		if (emotionStretchOn && isDefined(emotionRefreshTimer))
		{
			if (emotionHotMuteSide >= 0)
				emotionRefreshTimer.startTimer(EMOTION_HOT_WAIT_MS);
			else
				emotionRefreshTimer.startTimer(EMOTION_REFRESH_WAIT_MS);
	}
	else
	{
			emotionHotMuteSide = -1;
			applyEmotionMix();
			emotionRefreshPhase = 0;
			stopRefreshSpinLoad(emotionRefreshSide);
		}
		return;
	}
	if (emotionRefreshPhase == 2)
	{
		if (emotionHotMuteSide >= 0)
		{
			emotionHotMuteSide = -1;
			applyEmotionMix();
		}
		if (emotionStretchOn)
			setEmotionStretchGate();
		stopRefreshSpinLoad(emotionRefreshSide);
		emotionRefreshPhase = 0;
		if (isDefined(emotionRefreshTimer))
			emotionRefreshTimer.stopTimer();
	}
}

inline function otherEmotionNodesOn(side)
{
	if (side != 0 && canvasCalmOn)
		return 1;
	if (side != 1 && canvasFuryOn)
		return 1;
	if (side != 2 && canvasGoldOn)
		return 1;
		return 0;
}

inline function queueEmotionLoad(side, entry, index)
{
	if (entry == undefined)
	{
		stopRefreshSpinLoad(side);
		return 0;
	}
	if (!emotionStretchOn)
	{
		emotionHotMuteSide = -1;
		emotionRefreshSide = side;
		emotionRefreshEntry = entry;
		emotionRefreshIndex = index;
		commitEmotionLoad(side, entry, index);
		stopRefreshSpinLoad(side);
		return 1;
	}
	if (otherEmotionNodesOn(side))
	{
		if (emotionHotMuteSide >= 0 && emotionHotMuteSide != side)
		{
			emotionHotMuteSide = -1;
			applyEmotionMix();
		}
		emotionHotMuteSide = side;
		emotionRefreshSide = side;
		emotionRefreshEntry = entry;
		emotionRefreshIndex = index;
		applyEmotionMix();
		emotionRefreshPhase = 1;
		if (!isDefined(emotionRefreshTimer))
		{
			stopRefreshSpinLoad(side);
		return 0;
		}
		emotionRefreshTimer.stopTimer();
		emotionRefreshTimer.setTimerCallback(function()
		{
			onEmotionRefreshTimer();
		});
		emotionRefreshTimer.startTimer(EMOTION_STOP_WAIT_MS);
		return 1;
	}
	emotionHotMuteSide = -1;
	setFxParam("ch0_stretch_gate", 0.0);
	emotionRefreshSide = side;
	emotionRefreshEntry = entry;
	emotionRefreshIndex = index;
	emotionRefreshPhase = 1;
	if (!isDefined(emotionRefreshTimer))
	{
		stopRefreshSpinLoad(side);
	return 0;
}
	emotionRefreshTimer.stopTimer();
	emotionRefreshTimer.setTimerCallback(function()
	{
		onEmotionRefreshTimer();
	});
	emotionRefreshTimer.startTimer(EMOTION_STOP_WAIT_MS);
	return 1;
}

inline function loadCalmEmotionEntry(entry, index)
{
	return queueEmotionLoad(0, entry, index);
}

inline function loadFuryEmotionEntry(entry, index)
{
	return queueEmotionLoad(1, entry, index);
}

inline function loadGoldEmotionEntry(entry, index)
{
	return queueEmotionLoad(2, entry, index);
}

inline function refreshCalmBed()
{
	startRefreshSpinLoad(0);
	local idx = nextEmotionIndex(emotionCalmHits, emotionCalmIndex, emotionFuryId, "");
	if (idx < 0)
	{
		startEmotionClap(1, getCalmPrompt(), emotionCalmBank, 1);
		return;
	}
	loadCalmEmotionEntry(emotionCalmHits[idx], idx);
}

inline function refreshFuryBed()
{
	startRefreshSpinLoad(1);
	local idx = nextEmotionIndex(emotionFuryHits, emotionFuryIndex, emotionCalmId, "");
	if (idx < 0)
	{
		startEmotionClap(2, getFuryPrompt(), emotionFuryBank, 1);
		return;
	}
	loadFuryEmotionEntry(emotionFuryHits[idx], idx);
}

inline function refreshGoldBed()
{
	startRefreshSpinLoad(2);
	local idx = nextEmotionIndex(emotionGoldHits, emotionGoldIndex, emotionCalmId, emotionFuryId);
	if (idx < 0)
	{
		startEmotionClap(3, getGoldPrompt(), emotionGoldBank, 1);
		return;
	}
	loadGoldEmotionEntry(emotionGoldHits[idx], idx);
}

inline function onCalmEmotionRefresh(status, data)
{
	emotionCalmHits = emotionHitsFromResponse(status, data, getCalmPrompt(), emotionCalmBank);
	emotionCalmIndex = -1;
	if (emotionCalmHits.length == 0)
	{
		stopRefreshSpinNode(1);
		return;
	}
	refreshCalmBed();
}

inline function onGoldEmotionSearch(status, data)
{
	local hits = emotionHitsFromResponse(status, data, getGoldPrompt(), emotionGoldBank);
	loadEmotionHits(3, hits, emotionGoldPick);
}

inline function onFuryEmotionSearch(status, data)
{
	local hits = emotionHitsFromResponse(status, data, getFuryPrompt(), emotionFuryBank);
	loadEmotionHits(2, hits, emotionFuryPick);
	if (emotionSearchStep == 2)
		emotionSearchStep = 0;
}

inline function onCalmEmotionSearch(status, data)
{
	local hits = emotionHitsFromResponse(status, data, getCalmPrompt(), emotionCalmBank);
	loadEmotionHits(1, hits, emotionCalmPick);
	if (emotionSearchStep == 1)
	{
		emotionSearchStep = 2;
		clapSearch(getFuryPrompt(), "v6", onFuryEmotionSearch, CLAP_FAMILIES);
	}
}

inline function loadEmotionSearches()
{
	emotionCalmId = "";
	emotionFuryId = "";
	emotionGoldId = "";
	emotionCalmIndex = -1;
	emotionFuryIndex = -1;
	emotionGoldIndex = -1;
	emotionCalmHits = [];
	emotionFuryHits = [];
	emotionGoldHits = [];
	emotionCalmMidi = -1;
	emotionFuryMidi = -1;
	emotionGoldMidi = -1;
	emotionTargetPc = -1;
	emotionCalmRatio = 1.0;
	emotionFuryRatio = 1.0;
	emotionGoldRatio = 1.0;
	setStretchPitch("ch0_stretch_pitch", 1.0);
	setStretchPitch("fury_stretch_pitch", 1.0);
	setStretchPitch("gold_stretch_pitch", 1.0);
	emotionSearchStep = 1;
	clapSearch(getCalmPrompt(), "v6", onCalmEmotionSearch, CLAP_FAMILIES);
}

inline function setEmotionNodeVisible(side, on)
{
	if (side == 1)
	{
		canvasCalmOn = on ? 1 : 0;
		setCompVisible(calmCapsule, on);
		setCompVisible(calmRefresh, on);
		setCompVisible(calmDelete, on);
		setCompVisible(calmLabel, 0);
		if (!on)
			stopRefreshSpinNode(1);
	}
	else if (side == 2)
	{
		canvasFuryOn = on ? 1 : 0;
		setCompVisible(furyCapsule, on);
		setCompVisible(furyRefresh, on);
		setCompVisible(furyDelete, on);
		setCompVisible(furyLabel, 0);
		if (!on)
			stopRefreshSpinNode(2);
	}
	else
	{
		canvasGoldOn = on ? 1 : 0;
		setCompVisible(goldCapsule, on);
		setCompVisible(goldRefresh, on);
		setCompVisible(goldDelete, on);
		setCompVisible(goldLabel, 0);
		if (!on)
			stopRefreshSpinNode(3);
	}
	syncDropOntoImage();
}

inline function syncDropOntoImage()
{
	local on = 1;
	if (emotionNodesOn())
		on = 0;
	setCompVisible(dropOntoImage, on);
}

inline function deleteEmotionNode(side)
{
	if (side == 1)
	{
		if (!canvasCalmOn)
			return;
		emotionCalmId = "";
		emotionCalmIndex = -1;
		emotionCalmHits = [];
		emotionCalmMidi = -1;
		emotionCalmRatio = 1.0;
		emotionCalmPrompt = "";
		setEmotionNodeVisible(1, 0);
		setStretchPitch("ch0_stretch_pitch", 1.0);
	}
	else if (side == 2)
	{
		if (!canvasFuryOn)
			return;
		emotionFuryId = "";
		emotionFuryIndex = -1;
		emotionFuryHits = [];
		emotionFuryMidi = -1;
		emotionFuryRatio = 1.0;
		emotionFuryPrompt = "";
		setEmotionNodeVisible(2, 0);
		setStretchPitch("fury_stretch_pitch", 1.0);
	}
	else
	{
		if (!canvasGoldOn)
			return;
		emotionGoldId = "";
		emotionGoldIndex = -1;
		emotionGoldHits = [];
		emotionGoldMidi = -1;
		emotionGoldRatio = 1.0;
		emotionGoldPrompt = "";
		setEmotionNodeVisible(3, 0);
		setStretchPitch("gold_stretch_pitch", 1.0);
	}
	emotionHotMuteSide = -1;
	if (isDefined(emotionRefreshTimer))
		emotionRefreshTimer.stopTimer();
	emotionRefreshPhase = 0;
	applyEmotionMix();
	if (!canvasCalmOn && !canvasFuryOn && !canvasGoldOn)
	{
		emotionTargetPc = -1;
		setFxParam("ch0_stretch_gate", 0.0);
	}
	syncAnimBalls();
	writeSessionState();
}

inline function restoreSessionNode(side, rec)
{
	local on = 0;
	local p = "";
	local b = "v6";
	local sid = "";
	if (!isDefined(rec))
		return;
	if (rec.on)
		on = 1;
	p = clipEmotionPrompt(rec.p);
	if (isDefined(rec.b) && ("" + rec.b) != "")
		b = "" + rec.b;
	if (isDefined(rec.id))
		sid = "" + rec.id;
	if (!on)
		return;
	if (p.length == 0 && sid.length == 0)
		return;
	if (side == 1)
	{
		emotionCalmPrompt = p;
		emotionCalmBank = b;
		emotionCalmId = sid;
		emotionCalmHits = [];
		emotionCalmIndex = -1;
		setEmotionNodeVisible(1, 1);
		placeCalmChrome();
		if (isDefined(calmCapsule))
			calmCapsule.repaint();
		startEmotionClap(1, getCalmPrompt(), b, 0);
		return;
	}
	if (side == 2)
	{
		emotionFuryPrompt = p;
		emotionFuryBank = b;
		emotionFuryId = sid;
		emotionFuryHits = [];
		emotionFuryIndex = -1;
		setEmotionNodeVisible(2, 1);
		placeFuryChrome();
		if (isDefined(furyCapsule))
			furyCapsule.repaint();
		startEmotionClap(2, getFuryPrompt(), b, 0);
		return;
	}
	emotionGoldPrompt = p;
	emotionGoldBank = b;
	emotionGoldId = sid;
	emotionGoldHits = [];
	emotionGoldIndex = -1;
	setEmotionNodeVisible(3, 1);
	placeGoldChrome();
	if (isDefined(goldCapsule))
		goldCapsule.repaint();
	startEmotionClap(3, getGoldPrompt(), b, 0);
}

inline function restoreSessionState(raw)
{
	local o = undefined;
	local s = "" + raw;
	if (skipStateCb)
		return;
	if (s.length < 8)
		return;
	if (s == lastRestoredState)
		return;
	o = s.parseAsJSON();
	if (!isDefined(o) || !o.v)
		return;
	lastRestoredState = s;
	skipStateCb = 1;
	readPillSliders();
	restoreSessionNode(1, o.n1);
	restoreSessionNode(2, o.n2);
	restoreSessionNode(3, o.n3);
	applyEmotionMix();
	syncAnimBalls();
	skipStateCb = 0;
}

inline function onSessionState(component, value)
{
	restoreSessionState(value);
}

inline function setupSessionState()
{
	if (!isDefined(sessionStateLabel))
			return;
	bindCallback(sessionStateLabel, onSessionState);
	restoreSessionState(sessionStateLabel.getValue());
}

inline function hideMaxNodesAlert()
{
	setCompVisible(maxNodesPanel, 0);
}

inline function showMaxNodesAlert()
{
	if (!isDefined(maxNodesPanel))
		return;
	maxNodesPanel.setZLevel("AlwaysOnTop");
	setCompVisible(maxNodesPanel, 1);
}

inline function spawnEmotionNode(word, gx, gy)
{
	local px = clampPillX(gx - CAP_W * 0.5);
	local py = clampPillY(gy - CAP_H * 0.5);
	local t = "" + word;
	local bank = tagBankKey();
	if (t.length == 0)
		return 0;
	if (tagCustomOn())
		bank = "v6mix";
	emotionSearchStep = 0;
	if (!canvasCalmOn)
	{
		pillCalmX = px;
		pillCalmY = py;
		emotionCalmPrompt = t;
		emotionCalmBank = bank;
		emotionCalmPick = tagUseTake(t);
		emotionCalmId = "";
		emotionCalmHits = [];
		emotionCalmIndex = -1;
		setEmotionNodeVisible(1, 1);
		placeCalmChrome();
		writePillAuto(1);
		if (isDefined(calmCapsule))
			calmCapsule.repaint();
		startEmotionClap(1, getCalmPrompt(), bank, 0);
		applyEmotionMix();
		syncAnimBalls();
		writeSessionState();
		return 1;
	}
	if (!canvasFuryOn)
	{
		pillFuryX = px;
		pillFuryY = py;
		emotionFuryPrompt = t;
		emotionFuryBank = bank;
		emotionFuryPick = tagUseTake(t);
		emotionFuryId = "";
		emotionFuryHits = [];
		emotionFuryIndex = -1;
		setEmotionNodeVisible(2, 1);
		placeFuryChrome();
		writePillAuto(2);
		if (isDefined(furyCapsule))
			furyCapsule.repaint();
		startEmotionClap(2, getFuryPrompt(), bank, 0);
		applyEmotionMix();
		syncAnimBalls();
		writeSessionState();
		return 1;
	}
	if (!canvasGoldOn)
	{
		pillGoldX = px;
		pillGoldY = py;
		emotionGoldPrompt = t;
		emotionGoldBank = bank;
		emotionGoldPick = tagUseTake(t);
		emotionGoldId = "";
		emotionGoldHits = [];
		emotionGoldIndex = -1;
		setEmotionNodeVisible(3, 1);
		placeGoldChrome();
		writePillAuto(3);
		if (isDefined(goldCapsule))
			goldCapsule.repaint();
		startEmotionClap(3, getGoldPrompt(), bank, 0);
		applyEmotionMix();
		syncAnimBalls();
		writeSessionState();
		return 1;
	}
	showMaxNodesAlert();
	return 0;
}

inline function tagCustomOn()
{
	if (tagTab == 4)
		return 1;
	return 0;
}

inline function tagTabsY()
{
	return TAG_PAD;
}

inline function tagPromptBoxH()
{
	return TAG_PROMPT_H + TAG_PROMPT_PAD_Y * 2.0;
}

inline function tagPromptY()
{
	local ph = 160.0;
	local top = TAG_PAD + TAG_TAB_H;
	local bh = tagPromptBoxH();
	if (isDefined(tagsPanel))
		ph = tagsPanel.get("height");
	return top + (ph - top - bh) * 0.5;
}

inline function tagPromptBoxW(pw)
{
	return pw * 0.5;
}

inline function tagPromptBoxX(pw)
{
	return (pw - tagPromptBoxW(pw)) * 0.5;
}

inline function tagTabX(t)
{
	return TAG_PAD + t * (tagTabW + TAG_TAB_GAP);
}

inline function ensureTagSlots()
{
	local i = 0;
	local n = tagCount();
	if (tagX.length == n)
		return;
	tagX = [];
	tagY = [];
	tagW = [];
	while (i < n)
	{
		tagX.push(0.0);
		tagY.push(0.0);
		tagW.push(0.0);
		i = i + 1;
	}
}

inline function layoutTags(g, pw)
{
	local maxW = pw - TAG_PAD * 2.0;
	local y = tagTabsY() + TAG_TAB_H + TAG_TAB_MB;
	local i = 0;
	local n = tagCount();
	local tw = 0.0;
	local lineStart = 0;
	local lineW = 0.0;
	local nLine = 0;
	local j = 0;
	local x0 = 0.0;
	local x = 0.0;

	ensureTagSlots();
	g.setFont(EMO_PILL_FONT, TAG_FONT);
	while (i < n)
	{
		tw = tagTextWidth(tagWordAt(i));
		if (tw < 18.0)
			tw = 18.0;
		tagW[i] = tw;
		if (nLine > 0 && (lineW + TAG_GAP_X + tw) > maxW)
		{
			x0 = TAG_PAD + (maxW - lineW) * 0.5;
			x = x0;
			j = lineStart;
			while (j < i)
			{
				tagX[j] = x;
				tagY[j] = y;
				x = x + tagW[j] + TAG_GAP_X;
				j = j + 1;
			}
			y = y + TAG_H + TAG_GAP_Y;
			lineStart = i;
			lineW = tw;
			nLine = 1;
		}
		else
		{
			if (nLine > 0)
				lineW = lineW + TAG_GAP_X + tw;
			else
				lineW = tw;
			nLine = nLine + 1;
		}
		i = i + 1;
	}
	if (nLine > 0)
	{
		x0 = TAG_PAD + (maxW - lineW) * 0.5;
		x = x0;
		j = lineStart;
		while (j < n)
		{
			tagX[j] = x;
			tagY[j] = y;
			x = x + tagW[j] + TAG_GAP_X;
			j = j + 1;
		}
	}
}

inline function tagCellX(i)
{
	if (i < 0 || i >= tagX.length)
		return 0.0;
	return tagX[i];
}

inline function tagCellY(i)
{
	if (i < 0 || i >= tagY.length)
		return 0.0;
	return tagY[i];
}

inline function tagCellW(i)
{
	if (i < 0 || i >= tagW.length)
		return TAG_H;
	return tagW[i];
}

inline function tagTabAt(x, y)
{
	local i = 0;
	local tx = 0.0;
	if (y < tagTabsY() || y >= tagTabsY() + TAG_TAB_H)
		return -1;
	while (i < TAG_TAB_N)
	{
		tx = tagTabX(i);
		if (x >= tx && x < tx + tagTabW)
			return i;
		i = i + 1;
	}
	return -1;
}

inline function tagIndexAt(x, y)
{
	local i = 0;
	local tx = 0.0;
	local ty = 0.0;
	local tw = 0.0;
	if (tagX.length != tagCount())
		return -1;
	while (i < tagCount())
	{
		tx = tagX[i];
		ty = tagY[i];
		tw = tagW[i];
		if (x >= tx && x < tx + tw && y >= ty && y < ty + TAG_H)
			return i;
		i = i + 1;
	}
	return -1;
}

inline function hideTagGhost()
{
	tagDrag = -1;
	if (isDefined(tagGhost))
		tagGhost.set("visible", 0);
}

inline function pointInTagsPanel(gx, gy)
{
	local px = 40.0;
	local py = 460.0;
	local pw = 820.0;
	local ph = 170.0;
	if (isDefined(tagsPanel))
	{
		px = tagsPanel.get("x");
		py = tagsPanel.get("y");
		pw = tagsPanel.get("width");
		ph = tagsPanel.get("height");
	}
	if (gx < px || gx >= px + pw)
		return 0;
	if (gy < py || gy >= py + ph)
		return 0;
	return 1;
}

inline function tagPromptEmpty()
{
	local t = "";
	if (!isDefined(tagPromptInput))
		return 1;
	t = trimEmotionPrompt(tagPromptInput.get("text"));
	if (t.length == 0)
		return 1;
	if (t == EMO_PROMPT_PLACEHOLDER)
		return 1;
	return 0;
}

inline function submitTagPrompt()
{
	local t = "";
	if (!isDefined(tagPromptInput))
		return;
	t = trimEmotionPrompt(tagPromptInput.get("text"));
	if (t.length == 0 || t == EMO_PROMPT_PLACEHOLDER)
		return;
	spawnEmotionNode(t, MIX_CX, MIX_CY);
	tagPromptInput.set("text", "");
	tagPromptFocus = 0;
	if (isDefined(tagsPanel))
		tagsPanel.repaint();
}

inline function tagPromptSubmitHit(x, y, pw)
{
	local py = tagPromptY();
	local bh = tagPromptBoxH();
	local bx = tagPromptBoxX(pw);
	local bw = tagPromptBoxW(pw);
	local sx = bx + bw - TAG_PROMPT_PAD - TAG_PROMPT_H;
	local sy = py + TAG_PROMPT_PAD_Y;
	if (!tagCustomOn())
		return 0;
	if (x >= sx && x < sx + TAG_PROMPT_H && y >= sy && y < sy + TAG_PROMPT_H)
		return 1;
	return 0;
}

inline function paintTagPromptRow(g, pw)
{
	local py = tagPromptY();
	local bh = tagPromptBoxH();
	local bx = tagPromptBoxX(pw);
	local bw = tagPromptBoxW(pw);
	local area = [bx, py, bw, bh];
	local r = bh * 0.5;
	local sy = py + TAG_PROMPT_PAD_Y;
	local sx = bx + bw - TAG_PROMPT_PAD - TAG_PROMPT_H;
	local s = TAG_PROMPT_H;
	local b = arrowIconPath.getBounds(1.0);
	local ipw = b[2];
	local iph = b[3];
	local pad = s * 0.22;
	local maxS = s - pad * 2.0;
	local dw = maxS;
	local dh = maxS;
	if (!tagCustomOn())
		return;
	g.setColour(0xFF414141);
	g.drawRoundedRectangle([area[0] + 1.0, area[1] + 1.0, area[2] - 2.0, area[3] - 2.0], r - 1.0, 1.6);
	if (tagPromptEmpty() && !tagPromptFocus)
	{
		g.setColour(TAG_CHIP_FG);
		g.setFont(EMO_PILL_FONT, TAG_FONT);
		g.drawAlignedText(EMO_PROMPT_PLACEHOLDER, [bx + TAG_PROMPT_PAD, sy, bw - TAG_PROMPT_PAD * 2.0 - TAG_PROMPT_H, TAG_PROMPT_H], "left");
	}
	if (ipw < 0.001)
		ipw = 1.0;
	if (iph < 0.001)
		iph = 1.0;
	if (ipw > iph)
		dh = maxS * iph / ipw;
	else
		dw = maxS * ipw / iph;
	g.setColour(0xFF8F8F8F);
	g.drawPath(arrowIconPath, [sx + (s - dw) * 0.5, sy + (s - dh) * 0.5, dw, dh], 1.6);
}

inline function placeTagPrompt()
{
	local px = 18.0;
	local py = 503.0;
	local pw = 740.0;
	local bx = 0.0;
	local bw = 0.0;
	if (!isDefined(tagPromptInput))
		return;
	if (isDefined(tagsPanel))
	{
		px = tagsPanel.get("x");
		py = tagsPanel.get("y");
		pw = tagsPanel.get("width");
	}
	bx = tagPromptBoxX(pw);
	bw = tagPromptBoxW(pw);
	tagPromptInput.set("x", px + bx + TAG_PROMPT_PAD);
	tagPromptInput.set("y", py + tagPromptY() + TAG_PROMPT_PAD_Y);
	tagPromptInput.set("width", bw - TAG_PROMPT_PAD * 2.0 - TAG_PROMPT_H);
	tagPromptInput.set("height", TAG_PROMPT_H);
	tagPromptInput.set("fontName", EMO_PILL_FONT);
	tagPromptInput.set("fontSize", TAG_FONT);
	tagPromptInput.set("textColour", TAG_CHIP_FG);
	tagPromptInput.set("bgColour", 0);
	tagPromptInput.set("itemColour", 0);
	tagPromptInput.set("multiline", 0);
	tagPromptInput.set("alignment", "left");
	tagPromptInput.set("editable", true);
	tagPromptInput.set("enabled", true);
	tagPromptInput.set("visible", 1);
	tagPromptInput.set("updateEachKey", false);
	tagPromptInput.setZLevel("AlwaysOnTop");
}

inline function syncTagPrompt()
{
	if (!isDefined(tagPromptInput))
		return;
	if (tagCustomOn() && !capturePanelOn)
	{
		placeTagPrompt();
		tagPromptInput.set("visible", 1);
	}
	else
	{
		tagPromptFocus = 0;
		tagPromptInput.set("visible", 0);
	}
}

inline function captureEnsurePeaks()
{
	if (capturePeaks.length >= CAPTURE_PEAK_N)
		return;
	while (capturePeaks.length < CAPTURE_PEAK_N)
		capturePeaks.push(0.0);
	captureHead = 0;
}

inline function captureClearPeaks()
{
	capturePeaks = [];
	captureHead = 0;
	captureEnsurePeaks();
}

inline function captureClearBuffer()
{
	local fx = resolveRecorder();
	local slot = undefined;
	captureClearPeaks();
	captureFile = undefined;
	captureAudio = undefined;
	captureSampleRate = 0.0;
	capturePlayEnds = 0.0;
	captureNumSamples = 0;
	if (isDefined(fx))
	{
		slot = fx.getAudioFile(CAPTURE_SLOT);
		if (isDefined(slot))
			slot.loadFile("");
	}
	if (isDefined(capturePanel))
		capturePanel.repaint();
	syncToDawImage();
}

inline function syncToDawImage()
{
	local on = 0;
	if (capturePanelOn && !captureRecording && !captureRendering)
	{
		if (isDefined(captureFile) && captureFile.isFile())
			on = 1;
	}
	setCompVisible(toDawScriptImage, on);
}

inline function capturePushPeak()
{
	local p = 0.0;
	local e = 0.0;
	captureEnsurePeaks();
	p = (Engine.getMasterPeakLevel(0) + Engine.getMasterPeakLevel(1)) * 0.5;
	if (isDefined(EngineLevelFx))
	{
		e = (EngineLevelFx.getCurrentLevel(1) + EngineLevelFx.getCurrentLevel(0)) * 0.5;
		if (e > p)
			p = e;
	}
	if (p < 0.0)
		p = 0.0;
	if (p > 1.0)
		p = 1.0;
	capturePeaks[captureHead] = p;
	captureHead = captureHead + 1;
	if (captureHead >= CAPTURE_PEAK_N)
		captureHead = 0;
}

inline function paintCaptureWave(g, pw, ph)
{
	local pad = CAPTURE_PAD;
	local padL = CAPTURE_PAD_L;
	local x0 = padL;
	local y0 = pad;
	local w = pw - padL - pad;
	local h = ph - pad * 2.0;
	local mid = y0 + h * 0.5;
	local n = capturePeaks.length;
	local i = 0;
	local idx = 0;
	local x = 0.0;
	local pk = 0.0;
	local bh = 0.0;
	local step = 1.0;
	local barW = 3.0;
	if (w < 8.0 || h < 8.0)
		return;
	g.setColour(0xFF414141);
	g.drawRoundedRectangle([x0, 1.0, w + pad - 1.0, ph - 2.0], 10.0, 0);
	if (n < 2)
		return;
	step = w / n;
	if (step < 1.0)
		barW = 1.0;
	else if (step < 2.5)
		barW = step * 0.7;
	g.setColour(0xE66a6a6a);
	while (i < n)
	{
		idx = captureHead + i;
		if (idx >= n)
			idx = idx - n;
		pk = capturePeaks[idx];
		if (pk > 0.001)
		{
			bh = pk * (h * 0.92);
			if (bh < 1.0)
				bh = 1.0;
			x = x0 + i * step;
			g.fillRect([x, mid - bh * 0.5, barW, bh]);
		}
		i = i + 1;
	}
}

inline function captureTimerShouldRun()
{
	if (!capturePanelOn)
		return 0;
	if (captureRecording)
		return 1;
	if (capturePlaying)
		return 1;
	return 0;
}

inline function syncCaptureTimer()
{
	if (!isDefined(captureTimer))
		return;
	if (captureTimerShouldRun())
		captureTimer.startTimer(33);
	else
		captureTimer.stopTimer();
}

inline function syncRecordButtons()
{
	captureBtnSyncing = 1;
	if (isDefined(recordButton))
		recordButton.setValue(captureRecording ? 1 : 0);
	if (isDefined(recordingPlayBtn))
	{
		recordingPlayBtn.setValue(capturePlaying ? 1 : 0);
		recordingPlayBtn.set("enabled", captureRecording ? 0 : 1);
	}
	captureBtnSyncing = 0;
}

inline function capturePeaksFromChannels(channels)
{
	local buf = undefined;
	local bufR = undefined;
	local n = 0;
	local hop = 1;
	local i = 0;
	local mag = 0.0;
	local magR = 0.0;
	local mx = 0.001;
	local peaks = [];
	local start = 0;
	local len = 1;

	if (!isDefined(channels))
		return;
	if (channels.length > 0 && isDefined(channels[0]) && isDefined(channels[0].length))
		buf = channels[0];
	else if (isDefined(channels.length) && !isDefined(channels[0]))
		buf = channels;
	if (!isDefined(buf))
		return;
	n = buf.length;
	if (n < 16)
		return;
	if (channels.length > 1)
		bufR = channels[1];
	hop = Math.floor(n / CAPTURE_PEAK_N);
	if (hop < 1)
		hop = 1;
	i = 0;
	while (i < CAPTURE_PEAK_N)
	{
		start = i * hop;
		if (start >= n)
			break;
		len = hop;
		if (start + len > n)
			len = n - start;
		if (len < 1)
			break;
		mag = buf.getMagnitude(start, len);
		if (isDefined(bufR))
		{
			magR = bufR.getMagnitude(start, len);
			if (magR > mag)
				mag = magR;
		}
		peaks.push(mag);
		if (mag > mx)
			mx = mag;
		i = i + 1;
	}
	i = 0;
	while (i < peaks.length)
	{
		peaks[i] = peaks[i] / mx;
		i = i + 1;
	}
	capturePeaks = peaks;
	captureHead = 0;
	if (isDefined(capturePanel))
		capturePanel.repaint();
}

inline function captureLoadFile(f)
{
	local audio = undefined;
	local channels = [];
	local meta = undefined;
	if (!isDefined(f) || !f.isFile())
		return 0;
	audio = f.loadAsAudioFile();
	if (!isDefined(audio))
		return 0;
	if (audio.length > 0 && isDefined(audio[0]) && isDefined(audio[0].length))
		channels = audio;
	else
		channels.push(audio);
	captureFile = f;
	captureAudio = channels;
	captureSampleRate = Engine.getSampleRate();
	meta = f.loadAudioMetadata();
	if (isDefined(meta) && meta.SampleRate > 1.0)
		captureSampleRate = meta.SampleRate;
	capturePeaksFromChannels(channels);
	syncToDawImage();
	return 1;
}

inline function fileSlug(s)
{
	local t = capsuleLine(s).toLowerCase();
	local i = 0;
	local c = "";
	local out = "";
	local dash = 0;
	while (i < t.length)
	{
		c = t.substring(i, i + 1);
		if (isTokenChar(c))
		{
			out = out + c;
			dash = 0;
		}
		else if (out.length > 0 && !dash)
		{
			out = out + "-";
			dash = 1;
		}
		i = i + 1;
	}
	if (out.length > 0 && dash)
		out = out.substring(0, out.length - 1);
	if (out.length > 28)
		out = out.substring(0, 28);
	return out;
}

inline function captureNodeSlug()
{
	local names = "";
	local slug = "";
	if (canvasCalmOn)
	{
		slug = fileSlug(emotionCalmPrompt);
		if (slug.length > 0)
			names = slug;
	}
	if (canvasFuryOn)
	{
		slug = fileSlug(emotionFuryPrompt);
		if (slug.length > 0)
		{
			if (names.length > 0)
				names = names + "_";
			names = names + slug;
		}
	}
	if (canvasGoldOn)
	{
		slug = fileSlug(emotionGoldPrompt);
		if (slug.length > 0)
		{
			if (names.length > 0)
				names = names + "_";
			names = names + slug;
		}
	}
	return names;
}

inline function captureUniqueId()
{
	local t = ("" + Engine.getSystemTime(false)).toLowerCase();
	local i = 0;
	local c = "";
	local out = "";
	while (i < t.length)
	{
		c = t.substring(i, i + 1);
		if (isTokenChar(c))
			out = out + c;
		i = i + 1;
	}
	return out + captureTakeId;
}

inline function captureExportFileName()
{
	local names = captureNodeSlug();
	local id = captureUniqueId();
	if (names.length > 0)
		return "Background_" + names + "_" + id + ".wav";
	return "Background_" + id + ".wav";
}

inline function setCaptureCursor(name)
{
	if (!isDefined(capturePanel))
		return;
	capturePanel.setMouseCursor(name, 0, [0.5, 0.5]);
}

inline function onCaptureWaveMouse(event)
{
	local f = undefined;
	if (event.mouseUp)
	{
		captureDragArmed = 0;
		setCaptureCursor("PointingHandCursor");
		return;
	}
	if (!event.drag)
		return;
	if (captureDragArmed)
		return;
	if (captureRecording || captureRendering)
		return;
	if (Math.abs(event.dragX) + Math.abs(event.dragY) < 8)
		return;
	f = captureFile;
	if (!isDefined(f) || !f.isFile())
		return;
	captureDragArmed = 1;
	setCaptureCursor("DraggingHandCursor");
	capturePanel.startExternalFileDrag(f, 0, 0);
}

inline function onCaptureFileDrop(info)
{
	local path = "";
	local f = undefined;
	if (!isDefined(info) || !info.drop)
		return;
	if (captureRecording || captureRendering)
		return;
	path = "" + info.fileName;
	if (path.length < 5)
		return;
	f = FileSystem.fromAbsolutePath(path);
	if (!isDefined(f))
		return;
	capturePlaying = 0;
	syncRecordButtons();
	syncCaptureTimer();
	captureLoadFile(f);
}

inline function loadCaptureIntoPlayer()
{
	local fx = resolveRecorder();
	local slot = undefined;
	local path = "";
	local n = 0;
	local sr = 0.0;
	if (!isDefined(captureFile) || !captureFile.isFile())
		return 0;
	if (!isDefined(fx))
		return 0;
	slot = fx.getAudioFile(CAPTURE_SLOT);
	if (!isDefined(slot))
		return 0;
	path = captureFile.toString(0);
	debugLog("loadFile capture → " + path);
	slot.loadFile(path);
	n = slot.getNumSamples();
	if (n >= 16)
		slot.setRange(0, n);
	if (captureNumSamples > n)
		n = captureNumSamples;
	if (n < 16)
	{
		debugLog("[AI-cinescapes] capture slot empty");
		return 0;
	}
	sr = Engine.getSampleRate();
	if (sr < 1.0)
		sr = captureSampleRate;
	if (sr < 1.0)
		sr = 44100.0;
	capturePlayEnds = Engine.getUptime() + Engine.getMilliSecondsForSamples(n) / 1000.0 + 0.35;
	debugLog("[AI-cinescapes] capture play " + n + " smp @ " + sr);
	return 1;
}

inline function stopCapturePreview()
{
	local wasPlaying = capturePlaying;
	setCaptureParam("capture_gate", 0.0);
	setCaptureParam("capture_gain", -100.0);
	capturePlaying = 0;
	capturePlayEnds = 0.0;
	if (!wasPlaying)
		return;
	setEmotionStretchGate();
	applyEmotionMix();
}

inline function setCaptureRecording(on)
{
	if (on)
	{
		g_record = false;
		if (isDefined(g_accumulator))
			g_accumulator.clear();
		stopCapturePreview();
		capturePlaying = 0;
		captureRecording = 1;
		captureStarted = Engine.getUptime();
		syncCaptureTimer();
		captureClearBuffer();
		clearCaptureWavs();
		g_record = true;
	}
	else
	{
		g_record = false;
		captureRecording = 0;
		setEmotionStretchPlaying(0);
		finishLiveCapture();
	}
	syncRecordButtons();
	syncCaptureTimer();
	if (isDefined(capturePanel))
		capturePanel.repaint();
	syncToDawImage();
}

inline function setCapturePlaying(on)
{
	if (on)
	{
		if (captureRecording)
			setCaptureRecording(0);
		if (!loadCaptureIntoPlayer())
		{
			capturePlaying = 0;
			syncRecordButtons();
			if (isDefined(Status))
				Status.set("text", "No capture yet");
			return;
		}
		capturePlaying = 1;
		setFxParam("ch0_stretch_gate", 0.0);
		setCaptureParam("capture_ratio", 1.0);
		setCaptureParam("capture_gain", 0.0);
		retriggerCaptureGate();
	}
	else
		stopCapturePreview();
	syncRecordButtons();
	syncCaptureTimer();
	if (isDefined(capturePanel))
		capturePanel.repaint();
}

inline function onRecordButton(component, value)
{
	if (captureBtnSyncing)
		return;
	if (value > 0.5)
		setCaptureRecording(1);
	else
		setCaptureRecording(0);
}

inline function onRecordingPlayBtn(component, value)
{
	if (captureBtnSyncing)
		return;
	if (captureRecording)
	{
		syncRecordButtons();
		return;
	}
	if (value > 0.5)
		setCapturePlaying(1);
	else
		setCapturePlaying(0);
}

inline function onRecordingClearBtn(component, value)
{
	if (value < 0.5)
		return;
	if (captureRecording)
		abortLiveCapture();
	stopCapturePreview();
	capturePlaying = 0;
	captureClearBuffer();
	clearCaptureWavs();
	syncRecordButtons();
	syncCaptureTimer();
	if (isDefined(capturePanel))
		capturePanel.repaint();
	syncToDawImage();
}

inline function setupCapturePanel()
{
	if (!isDefined(capturePanel))
		return;
	captureEnsurePeaks();
	capturePanel.set("opaque", false);
	capturePanel.set("enabled", true);
	capturePanel.set("allowCallbacks", "Clicks, Hover & Dragging");
	capturePanel.setZLevel("AlwaysOnTop");
	if (isDefined(toDawScriptImage))
		toDawScriptImage.setZLevel("AlwaysOnTop");
	setCaptureCursor("PointingHandCursor");
	capturePanel.setPaintRoutine(function(g)
	{
		paintCaptureWave(g, this.get("width"), this.get("height"));
	});
	if (isDefined(captureTimer))
	{
		captureTimer.setTimerCallback(function()
		{
			if (captureRecording)
				capturePushPeak();
			else if (capturePlaying && capturePlayEnds > 0.0 && Engine.getUptime() >= capturePlayEnds)
				setCapturePlaying(0);
			if (isDefined(capturePanel))
				capturePanel.repaint();
		});
	}
	capturePanel.setMouseCallback(function(event)
	{
		onCaptureWaveMouse(event);
	});
	capturePanel.setFileDropCallback("Drop Only", "*.wav", function(event)
	{
		onCaptureFileDrop(event);
	});
	syncCaptureTimer();
}

inline function setupRecordButtons()
{
	if (isDefined(recordButton))
	{
		recordButton.set("isMomentary", 0);
		recordButton.setZLevel("AlwaysOnTop");
		bindCallback(recordButton, onRecordButton);
	}
	if (isDefined(recordingPlayBtn))
	{
		recordingPlayBtn.set("isMomentary", 0);
		recordingPlayBtn.setZLevel("AlwaysOnTop");
		bindCallback(recordingPlayBtn, onRecordingPlayBtn);
	}
	if (isDefined(recordingClearBtn))
	{
		recordingClearBtn.set("isMomentary", 1);
		recordingClearBtn.setZLevel("AlwaysOnTop");
		bindCallback(recordingClearBtn, onRecordingClearBtn);
	}
	syncRecordButtons();
}

inline function syncCaptureToggle()
{
	if (capturePanelOn)
	{
		setCompVisible(tagsPanel, 0);
		setCompVisible(tagPromptInput, 0);
		setCompVisible(tagGhost, 0);
		setCompVisible(capturePanel, 1);
		setCompVisible(pitchMatchBtn, 0);
		setCompVisible(stretchPlayBtn, 1);
		setCompVisible(recordButton, 1);
		setCompVisible(recordingPlayBtn, 1);
		setCompVisible(recordingClearBtn, 1);
	}
	else
	{
		stopCapturePreview();
		if (captureRecording)
			abortLiveCapture();
		captureRecording = 0;
		capturePlaying = 0;
		syncRecordButtons();
		setCompVisible(capturePanel, 0);
		setCompVisible(recordButton, 0);
		setCompVisible(recordingPlayBtn, 0);
		setCompVisible(recordingClearBtn, 0);
		setCompVisible(pitchMatchBtn, 1);
		setCompVisible(stretchPlayBtn, 1);
		setCompVisible(tagsPanel, 1);
		syncTagPrompt();
	}
	syncToDawImage();
	syncCaptureTimer();
}

inline function onCapturePanelButton(component, value)
{
	capturePanelOn = 0;
	if (value)
		capturePanelOn = 1;
	syncCaptureToggle();
}

inline function setupCaptureToggle()
{
	if (isDefined(capturePanel))
	{
		capturePanel.set("opaque", false);
		capturePanel.setZLevel("AlwaysOnTop");
	}
	if (!isDefined(capturePanelButton))
	{
		syncCaptureToggle();
		return;
	}
	capturePanelButton.set("isMomentary", 0);
	bindCallback(capturePanelButton, onCapturePanelButton);
	capturePanelOn = 0;
	if (capturePanelButton.getValue())
		capturePanelOn = 1;
	syncCaptureToggle();
}

inline function syncSettingsToggle()
{
	setCompVisible(settingsPanel, settingsPanelOn);
}

inline function onSettingsButton(component, value)
{
	settingsPanelOn = 0;
	if (value)
		settingsPanelOn = 1;
	syncSettingsToggle();
}

inline function setupSettingsToggle()
{
	if (isDefined(settingsPanel))
		settingsPanel.setZLevel("AlwaysOnTop");
	if (!isDefined(settingsButton))
	{
		syncSettingsToggle();
		return;
	}
	settingsButton.set("isMomentary", 0);
	bindCallback(settingsButton, onSettingsButton);
	settingsPanelOn = 0;
	if (settingsButton.getValue())
		settingsPanelOn = 1;
	syncSettingsToggle();
}

inline function onWeblinkButton(component, value)
{
	if (value)
		Engine.openWebsite("https://sampleson.com");
}

inline function setupWeblinkButton()
{
	if (!isDefined(weblinkButton))
		return;
	weblinkButton.set("isMomentary", 1);
	bindCallback(weblinkButton, onWeblinkButton);
}

inline function paintMaxNodesPanel(g)
{
	g.setColour(Colours.withAlpha(0xFF2C2C29, 0.95));
	g.fillRoundedRectangle([0.0, 0.0, 400.0, 160.0], 10.0);
	g.setColour(Colours.withAlpha(0xFF6A6A6A, 0.95));
	g.drawRoundedRectangle([1.0, 1.0, 398.0, 158.0], 10.0, 1.0);
}

inline function paintMaxNodesOk(g, hover)
{
	local a = 0.95;
	if (hover)
		a = 1.0;
	g.setColour(Colours.withAlpha(0xFFE6E6E6, a));
	g.drawRoundedRectangle([1.0, 1.0, 98.0, 34.0], 8.0, 1.4);
	g.setFont("Atkinson Hyperlegible", 16.0);
	g.drawAlignedText("OK", [0.0, 0.0, 100.0, 36.0], "centred");
}

inline function setupMaxNodesAlert()
{
	if (isDefined(maxNodesPanel))
	{
		maxNodesPanel.set("opaque", false);
		maxNodesPanel.setZLevel("AlwaysOnTop");
		maxNodesPanel.setPaintRoutine(function(g)
		{
			paintMaxNodesPanel(g);
		});
		setCompVisible(maxNodesPanel, 0);
	}
	if (isDefined(maxNodesLabel))
		maxNodesLabel.set("textColour", Colours.withAlpha(0xFFC6C6C6, 0.95));
	if (!isDefined(maxNodesOk))
		return;
	maxNodesOk.set("opaque", false);
	maxNodesOk.data.hover = 0;
	maxNodesOk.setPaintRoutine(function(g)
	{
		paintMaxNodesOk(g, this.data.hover);
	});
	maxNodesOk.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		this.repaint();
		if (event.clicked)
			hideMaxNodesAlert();
	});
}

inline function showTagPromptHint(on)
{
	if (on)
		tagPromptFocus = 0;
	else
		tagPromptFocus = 1;
	if (isDefined(tagsPanel))
		tagsPanel.repaint();
}

const var tagPromptMouse = Engine.createBroadcaster({
	"id": "TagPromptMouse",
	"args": ["component", "event"]
});

tagPromptMouse.attachToComponentMouseEvents("tagPromptInput", "Clicks Only", "");

tagPromptMouse.addListener("hideTagHint", "hide placeholder under tagPromptInput", function(component, event)
{
	if (event.clicked)
		showTagPromptHint(0);
});

inline function onTagPromptText(component, value)
{
	if (tagPromptEmpty())
	{
		showTagPromptHint(1);
		return;
	}
	submitTagPrompt();
}

inline function setupTagsPanel()
{
	local pw = 820.0;
	if (!isDefined(tagsPanel))
		return;

	pw = tagsPanel.get("width");
	tagTabW = (pw - TAG_PAD * 2.0 - TAG_TAB_GAP * (TAG_TAB_N - 1)) / TAG_TAB_N;
	tagsPanel.set("opaque", false);
	tagsPanel.set("enabled", true);
	tagsPanel.set("allowCallbacks", "Clicks, Hover & Dragging");
	tagsPanel.setZLevel("AlwaysOnTop");
	tagsPanel.setPaintRoutine(function(g)
	{
		var i = 0;
		var tx = 0.0;
		var ty = 0.0;
		var tw = 0.0;
		var pw2 = this.get("width");
		layoutTags(g, pw2);
		paintTagPromptRow(g, pw2);
		while (i < TAG_TAB_N)
		{
			tx = tagTabX(i);
			ty = tagTabsY();
			if (i == tagTab)
			{
				g.setColour(0xFF8F8F8F);
				g.fillRoundedRectangle([tx, ty, tagTabW, TAG_TAB_H], TAG_TAB_H * 0.5);
				g.setColour(0xFF8F8F8F);
				g.drawRoundedRectangle([tx + 1.0, ty + 1.0, tagTabW - 2.0, TAG_TAB_H - 2.0], TAG_TAB_H * 0.5 - 1.0, 1.6);
				g.setColour(0xFF2A2A2A);
			}
			else
				g.setColour(TAG_CHIP_FG);
			g.setFont(EMO_PILL_FONT, 13);
			g.drawAlignedText(TAG_TABS[i], [tx, ty, tagTabW, TAG_TAB_H], "centred");
			i = i + 1;
		}
		i = 0;
		while (i < tagCount())
		{
			tx = tagX[i];
			ty = tagY[i];
			tw = tagW[i];
			paintTagChip(g, [tx, ty, tw, TAG_H]);
			paintTagTextAt(g, tagWordAt(i), tw, TAG_H, tx, ty);
			i = i + 1;
		}
	});
	tagsPanel.setMouseCallback(function(event)
	{
		var x = event.x;
		var y = event.y;
		var idx = -1;
		var tab = -1;
		var gx = 0.0;
		var gy = 0.0;
		var px = 40.0;
		var py = 460.0;
		if (isDefined(tagsPanel))
		{
			px = tagsPanel.get("x");
			py = tagsPanel.get("y");
		}
		gx = px + x;
		gy = py + y;
		if (event.clicked)
		{
			if (tagPromptSubmitHit(x, y, this.get("width")))
			{
				submitTagPrompt();
				return;
			}
			tab = tagTabAt(x, y);
			if (tab >= 0)
			{
				tagTab = tab;
				syncTagPrompt();
				this.repaint();
				return;
			}
			idx = tagIndexAt(x, y);
			if (idx < 0)
				return;
			tagDrag = idx;
			tagDragWord = tagWordAt(idx);
			tagDragOffX = x - tagCellX(idx);
			tagDragOffY = y - tagCellY(idx);
			if (isDefined(tagGhost))
			{
				tagGhost.data.word = tagDragWord;
				tagGhost.set("width", tagCellW(idx));
				tagGhost.set("height", TAG_H);
				tagGhost.set("x", gx - tagDragOffX);
				tagGhost.set("y", gy - tagDragOffY);
				tagGhost.set("visible", 1);
				tagGhost.repaint();
			}
			return;
		}
		if (tagDrag < 0)
			return;
		if (event.drag && isDefined(tagGhost))
		{
			tagGhost.set("x", gx - tagDragOffX);
			tagGhost.set("y", gy - tagDragOffY);
		}
		if (!event.clicked && !event.drag)
		{
			idx = tagDrag;
			hideTagGhost();
			if (idx >= 0 && idx < tagCount() && !pointInTagsPanel(gx, gy))
				spawnEmotionNode(tagDragWord, gx, gy);
		}
	});

	placeTagPrompt();
	syncTagPrompt();
	if (isDefined(tagPromptInput))
		bindCallback(tagPromptInput, onTagPromptText);
	if (!isDefined(tagGhost))
		return;
	tagGhost.set("opaque", false);
	tagGhost.set("enabled", false);
	tagGhost.set("visible", 0);
	tagGhost.setZLevel("AlwaysOnTop");
	tagGhost.data.word = "";
	tagGhost.setPaintRoutine(function(g)
	{
		var w = this.get("width");
		paintTagChip(g, [0.0, 0.0, w, TAG_H]);
		paintTagTextAt(g, this.data.word, w, TAG_H, 0.0, 0.0);
	});
}

inline function lockEmotionLabel(lbl)
{
	if (!isDefined(lbl))
		return;
	lbl.set("editable", false);
	lbl.set("enabled", false);
}

inline function layoutEmotionPrompt(side)
{
	local px = pillCalmX;
	local py = pillCalmY;
	if (side == 2)
	{
		px = pillFuryX;
		py = pillFuryY;
	}
	else if (side == 3)
	{
		px = pillGoldX;
		py = pillGoldY;
	}
	emoPromptX = px;
	emoPromptY = py + CAP_H + EMO_MENU_GAP;
	emoPromptW = EMO_MENU_W;
	emoPromptH = EMO_MENU_ITEM_H;
	emoOkX = emoPromptX;
	emoOkY = emoPromptY;
	emotionMenuX = emoPromptX;
	emotionMenuY = emoPromptY;
}

inline function hitEmotionDrop(x, y)
{
	if (!emotionPromptOpen)
		return 0;
	if (x < emoPromptX || x >= emoPromptX + emoPromptW)
		return 0;
	if (y < emoPromptY || y >= emoPromptY + emoPromptH + EMO_PROMPT_BOX_EXTRA)
		return 0;
	return 1;
}

inline function paintCapsuleText()
{
	if (!(emotionPromptOpen && emotionPromptSide == 1) && isDefined(calmLabel))
	{
		emotionLabelSync = 1;
		calmLabel.set("text", capsuleVisible(emotionCalmPrompt, capsuleCalmOff));
		emotionLabelSync = 0;
	}
	if (!(emotionPromptOpen && emotionPromptSide == 2) && isDefined(furyLabel))
	{
		emotionLabelSync = 1;
		furyLabel.set("text", capsuleVisible(emotionFuryPrompt, capsuleFuryOff));
		emotionLabelSync = 0;
	}
	if (!(emotionPromptOpen && emotionPromptSide == 3) && isDefined(goldLabel))
	{
		emotionLabelSync = 1;
		goldLabel.set("text", capsuleVisible(emotionGoldPrompt, capsuleGoldOff));
		emotionLabelSync = 0;
	}
}

inline function tickCapsuleScroll()
{
	if (!pillHoldCalm)
		pillScrollCalm = pillScrollCalm + 1.15;
	if (!pillHoldFury)
		pillScrollFury = pillScrollFury + 1.15;
	if (!pillHoldGold)
		pillScrollGold = pillScrollGold + 1.15;
	if (capsuleLine(emotionCalmPrompt).length > CAPSULE_CHARS)
		capsuleCalmOff = capsuleCalmOff + 1;
	else
		capsuleCalmOff = 0;
	if (capsuleLine(emotionFuryPrompt).length > CAPSULE_CHARS)
		capsuleFuryOff = capsuleFuryOff + 1;
	else
		capsuleFuryOff = 0;
	if (capsuleLine(emotionGoldPrompt).length > CAPSULE_CHARS)
		capsuleGoldOff = capsuleGoldOff + 1;
	else
		capsuleGoldOff = 0;
	paintCapsuleText();
}

inline function showCapsuleWord(lbl, full)
{
	if (lbl == calmLabel)
	{
		capsuleCalmOff = 0;
		pillScrollCalm = 0.0;
		pillHoldCalm = 0;
	}
	if (lbl == furyLabel)
	{
		capsuleFuryOff = 0;
		pillScrollFury = 0.0;
		pillHoldFury = 0;
	}
	if (lbl == goldLabel)
	{
		capsuleGoldOff = 0;
		pillScrollGold = 0.0;
		pillHoldGold = 0;
	}
	paintCapsuleText();
}

inline function startCapsuleScroll()
{
	if (!isDefined(emotionCapsuleTimer))
		return;
	emotionCapsuleTimer.setTimerCallback(function()
	{
		tickCapsuleScroll();
	});
	emotionCapsuleTimer.startTimer(40);
}

inline function hideEmotionPromptBox()
{
	emotionPromptOpen = 0;
	emotionMenuOpen = 0;
	emotionMenuHover = -1;
	emotionShowTypeIcon = 1;
	emotionShowPlaceholder = 1;
	if (isDefined(emotionPromptInput))
	{
		emotionLabelSync = 1;
		emotionPromptInput.set("text", "");
		emotionLabelSync = 0;
		emotionPromptInput.loseFocus();
		emotionPromptInput.set("editable", false);
	}
	setCompVisible(emotionPromptBox, 0);
	setCompVisible(emotionPromptPlaceholder, 0);
	setCompVisible(emotionPromptInput, 0);
	setCompVisible(emotionTypeIcon, 0);
	setCompVisible(emotionPromptOk, 0);
	if (isDefined(emotionPromptBox))
		emotionPromptBox.set("enabled", false);
	if (isDefined(emotionTypeIcon))
		emotionTypeIcon.set("enabled", false);
}

inline function showEmotionPromptBox(full)
{
	layoutEmotionPrompt(emotionPromptSide);
	emotionPromptOpen = 1;
	emotionMenuOpen = 1;
	emotionShowTypeIcon = 1;
	emotionShowPlaceholder = 1;
	if (isDefined(emotionPromptBox))
	{
		emotionPromptBox.set("x", emoPromptX);
		emotionPromptBox.set("y", emoPromptY);
		emotionPromptBox.set("width", emoPromptW);
		emotionPromptBox.set("height", emoPromptH + EMO_PROMPT_BOX_EXTRA);
		emotionPromptBox.set("visible", 1);
		emotionPromptBox.setZLevel("AlwaysOnTop");
		emotionPromptBox.repaint();
	}
	if (isDefined(emotionPromptInput))
	{
		emotionLabelSync = 1;
		emotionPromptInput.set("text", "");
		emotionLabelSync = 0;
		emotionPromptInput.set("x", emoPromptX + EMO_PROMPT_PAD_X);
		emotionPromptInput.set("y", emoPromptY);
		emotionPromptInput.set("width", emoPromptW - EMO_PROMPT_PAD_X - EMO_PROMPT_SUBMIT_PAD - EMO_PROMPT_SUBMIT_S);
		emotionPromptInput.set("height", emoPromptH);
		emotionPromptInput.set("fontName", "Atkinson Hyperlegible");
		emotionPromptInput.set("fontSize", 16);
		emotionPromptInput.set("textColour", 0xFFC8C8C8);
		emotionPromptInput.set("bgColour", 0);
		emotionPromptInput.set("itemColour", 0);
		emotionPromptInput.set("multiline", 0);
		emotionPromptInput.set("alignment", "left");
		emotionPromptInput.set("visible", 1);
		emotionPromptInput.set("enabled", true);
		emotionPromptInput.set("editable", true);
		emotionPromptInput.set("updateEachKey", false);
	}
	placeEmotionTypeIcon();
	placeEmotionPlaceholder();
	placeEmotionSubmit();
	if (isDefined(emotionPromptBox))
	{
		emotionPromptBox.set("enabled", false);
		emotionPromptBox.setZLevel("AlwaysOnTop");
		emotionPromptBox.repaint();
	}
	if (isDefined(emotionPromptPlaceholder))
	{
		emotionPromptPlaceholder.set("enabled", false);
		emotionPromptPlaceholder.setZLevel("AlwaysOnTop");
	}
	if (isDefined(emotionTypeIcon) && emotionShowTypeIcon)
	{
		emotionTypeIcon.set("enabled", false);
		emotionTypeIcon.setZLevel("AlwaysOnTop");
	}
	if (isDefined(emotionPromptOk))
		emotionPromptOk.setZLevel("AlwaysOnTop");
	if (isDefined(emotionPromptInput))
	{
		emotionPromptInput.setZLevel("AlwaysOnTop");
		emotionPromptInput.set("editable", true);
		emotionPromptInput.set("enabled", true);
	}
}

inline function openEmotionMenu(side)
{
	if (emotionMenuOpen && emotionPromptSide == side)
	{
		commitEmotionPrompt();
		return;
	}
	if (emotionMenuOpen)
		commitEmotionPrompt();
	emotionPromptSide = side;
	if (side == 1)
		showEmotionPromptBox(emotionCalmPrompt);
	else if (side == 2)
		showEmotionPromptBox(emotionFuryPrompt);
	else
		showEmotionPromptBox(emotionGoldPrompt);
}

inline function commitEmotionPrompt()
{
	local t = "";
	local side = emotionPromptSide;
	if (!emotionPromptOpen)
		return;
	if (isDefined(emotionPromptInput))
		t = trimEmotionPrompt(emotionPromptInput.get("text"));
	if (t == EMO_PROMPT_PLACEHOLDER)
		t = "";
	hideEmotionPromptBox();
	emotionPromptSide = 0;
	if (t.length == 0)
	{
		if (side == 1)
			showCapsuleWord(calmLabel, emotionCalmPrompt);
		else if (side == 2)
			showCapsuleWord(furyLabel, emotionFuryPrompt);
		else if (side == 3)
			showCapsuleWord(goldLabel, emotionGoldPrompt);
		return;
	}
	if (side == 1)
	{
		emotionCalmPrompt = t;
		showCapsuleWord(calmLabel, t);
		emotionCalmHits = [];
		emotionCalmIndex = -1;
		emotionCalmId = "";
		clapSearch(t, "v6", onCalmEmotionSearch, CLAP_FAMILIES);
		writeSessionState();
	}
	else if (side == 2)
	{
		emotionFuryPrompt = t;
		showCapsuleWord(furyLabel, t);
		emotionFuryHits = [];
		emotionFuryIndex = -1;
		emotionFuryId = "";
		clapSearch(t, "v6", onFuryEmotionSearch, CLAP_FAMILIES);
		writeSessionState();
	}
	else if (side == 3)
	{
		emotionGoldPrompt = t;
		showCapsuleWord(goldLabel, t);
		emotionGoldHits = [];
		emotionGoldIndex = -1;
		emotionGoldId = "";
		clapSearch(t, "v6", onGoldEmotionSearch, CLAP_FAMILIES);
		writeSessionState();
	}
}

inline function beginCalmPrompt()
{
	openEmotionMenu(1);
}

inline function beginFuryPrompt()
{
	openEmotionMenu(2);
}

inline function beginGoldPrompt()
{
	openEmotionMenu(3);
}

inline function showEmotionPlaceholder(on)
{
	local v = on ? 1 : 0;
	emotionShowPlaceholder = v;
	if (isDefined(emotionPromptPlaceholder))
		emotionPromptPlaceholder.set("visible", v);
}

const var emotionPromptMouse = Engine.createBroadcaster({
	"id": "EmotionPromptMouse",
	"args": ["component", "event"]
});

emotionPromptMouse.attachToComponentMouseEvents("emotionPromptInput", "Clicks Only", "");

emotionPromptMouse.addListener("hideEmotionHint", "hide placeholder under emotionPromptInput", function(component, event)
{
	if (event.clicked)
		showEmotionPlaceholder(0);
});

inline function hideEmotionPromptHint()
{
	if (!emotionPromptOpen)
		return;
	if (!emotionShowTypeIcon)
		return;
	emotionShowTypeIcon = 0;
	if (isDefined(emotionPromptInput))
	{
		emotionPromptInput.set("textColour", 0xFFC8C8C8);
		emotionPromptInput.set("x", emoPromptX + EMO_PROMPT_PAD_X);
		emotionPromptInput.set("width", emoPromptW - EMO_PROMPT_PAD_X - EMO_PROMPT_SUBMIT_PAD - EMO_PROMPT_SUBMIT_S);
		emotionPromptInput.setZLevel("AlwaysOnTop");
	}
	if (isDefined(emotionTypeIcon))
		emotionTypeIcon.set("visible", 0);
}

inline function onEmotionPromptKey(event)
{
	if (event.isFocusChange)
		return;
	if (event.specialKey)
		return;
	hideEmotionPromptHint();
}

inline function onEmotionPromptInput(component, value)
	{
	if (emotionLabelSync)
		return;
	if (!emotionPromptOpen)
		return;
	commitEmotionPrompt();
}

inline function paintEmotionPromptBox(g)
{
	local w = emoPromptW;
	local h = emoPromptH + EMO_PROMPT_BOX_EXTRA;
	g.setColour(0xFF323232);
	g.fillRoundedRectangle([1.0, 1.0, w - 2.0, h - 2.0], EMO_PROMPT_RADIUS);
	g.setColour(0xFF5A5A5A);
	g.drawRoundedRectangle([1.0, 1.0, w - 2.0, h - 2.0], EMO_PROMPT_RADIUS - 1.0, 1.0);
}

inline function placeEmotionPlaceholder()
{
	local ix = emoPromptX + EMO_PROMPT_PAD_X + emoTypeIconW + EMO_PROMPT_TYPE_GAP;
	local iw = emoPromptX + emoPromptW - EMO_PROMPT_SUBMIT_PAD - EMO_PROMPT_SUBMIT_S - ix;
	if (!isDefined(emotionPromptPlaceholder))
		return;
	emotionPromptPlaceholder.set("x", ix);
	emotionPromptPlaceholder.set("y", emoPromptY + 4);
	emotionPromptPlaceholder.set("width", iw);
	emotionPromptPlaceholder.set("height", emoPromptH - 5);
	showEmotionPlaceholder(emotionShowPlaceholder);
}

inline function paintEmotionTypeIcon(g)
{
	local w = 0.0;
	local h = 0.0;
	if (!emotionShowTypeIcon)
		return;
	if (!isDefined(emotionTypeIcon))
		return;
	w = emotionTypeIcon.get("width");
	h = emotionTypeIcon.get("height");
	g.setColour(0xFFD4D4D4);
	g.fillPath(typeIconPath, [EMO_PROMPT_TYPE_PAD, EMO_PROMPT_TYPE_PAD, w - EMO_PROMPT_TYPE_PAD * 2.0, h - EMO_PROMPT_TYPE_PAD * 2.0]);
}

inline function placeEmotionTypeIcon()
{
	local ih = EMO_PROMPT_TYPE_H;
	local iw = ih;
	local b = typeIconPath.getBounds(1.0);
	local ix = 0.0;
	if (b[3] > 0.001)
		iw = ih * b[2] / b[3];
	emoTypeIconW = iw + EMO_PROMPT_TYPE_PAD;
	ix = emoPromptX + EMO_PROMPT_PAD_X + emoTypeIconW + EMO_PROMPT_TYPE_GAP;
	if (isDefined(emotionPromptInput) && emotionShowTypeIcon)
	{
		emotionPromptInput.set("x", ix);
		emotionPromptInput.set("width", emoPromptX + emoPromptW - EMO_PROMPT_SUBMIT_PAD - EMO_PROMPT_SUBMIT_S - ix);
	}
	if (!isDefined(emotionTypeIcon))
		return;
	if (!emotionShowTypeIcon)
	{
		emotionTypeIcon.set("visible", 0);
		return;
	}
	emotionTypeIcon.set("x", emoPromptX + EMO_PROMPT_PAD_X - EMO_PROMPT_TYPE_PAD);
	emotionTypeIcon.set("y", emoPromptY + (emoPromptH - ih) * 0.5 + 1.0 - EMO_PROMPT_TYPE_PAD);
	emotionTypeIcon.set("width", iw + EMO_PROMPT_TYPE_PAD * 2.0);
	emotionTypeIcon.set("height", ih + EMO_PROMPT_TYPE_PAD * 2.0);
	emotionTypeIcon.set("visible", 1);
	emotionTypeIcon.setZLevel("AlwaysOnTop");
	emotionTypeIcon.repaint();
}

inline function placeEmotionSubmit()
{
	local s = EMO_PROMPT_SUBMIT_S;
	if (!isDefined(emotionPromptOk))
		return;
	emotionPromptOk.set("x", emoPromptX + emoPromptW - EMO_PROMPT_SUBMIT_PAD - s);
	emotionPromptOk.set("y", emoPromptY + (emoPromptH - s) * 0.5);
	emotionPromptOk.set("width", s);
	emotionPromptOk.set("height", s);
	emotionPromptOk.set("visible", 1);
	emotionPromptOk.setZLevel("AlwaysOnTop");
	emotionPromptOk.repaint();
}

inline function paintEmotionPromptOk(g, hover)
{
	local s = EMO_PROMPT_SUBMIT_S;
	local a = hover ? 1.0 : 0.92;
	local b = arrowIconPath.getBounds(1.0);
	local pw = b[2];
	local ph = b[3];
	local pad = s * 0.22;
	local maxS = s - pad * 2.0;
	local dw = maxS;
	local dh = maxS;
	if (pw < 0.001)
		pw = 1.0;
	if (ph < 0.001)
		ph = 1.0;
	if (pw > ph)
		dh = maxS * ph / pw;
	else
		dw = maxS * pw / ph;
	g.setColour(Colours.withAlpha(0xFFF0F0F0, a));
	g.drawPath(arrowIconPath, [(s - dw) * 0.5, (s - dh) * 0.5, dw, dh], 1.4);
}

inline function setupEmotionPromptBox()
{
	if (isDefined(emotionPromptBox))
	{
		emotionPromptBox.set("width", emoPromptW);
		emotionPromptBox.set("height", emoPromptH + EMO_PROMPT_BOX_EXTRA);
		emotionPromptBox.set("opaque", false);
		emotionPromptBox.set("enabled", false);
		emotionPromptBox.set("visible", false);
		emotionPromptBox.setZLevel("AlwaysOnTop");
		emotionPromptBox.setPaintRoutine(function(g)
		{
			paintEmotionPromptBox(g);
		});
	}
	if (isDefined(emotionPromptPlaceholder))
	{
		emotionPromptPlaceholder.set("fontName", "Atkinson Hyperlegible");
		emotionPromptPlaceholder.set("fontSize", 16);
		emotionPromptPlaceholder.set("textColour", 0xFF888888);
		emotionPromptPlaceholder.set("bgColour", 0);
		emotionPromptPlaceholder.set("itemColour", 0);
		emotionPromptPlaceholder.set("alignment", "left");
		emotionPromptPlaceholder.set("multiline", 0);
		emotionPromptPlaceholder.set("editable", false);
		emotionPromptPlaceholder.set("enabled", false);
		emotionPromptPlaceholder.set("visible", false);
		emotionPromptPlaceholder.set("text", EMO_PROMPT_PLACEHOLDER);
	}
	if (isDefined(emotionPromptInput))
	{
		emotionPromptInput.set("fontName", "Atkinson Hyperlegible");
		emotionPromptInput.set("fontSize", 16);
		emotionPromptInput.set("textColour", 0xFFC8C8C8);
		emotionPromptInput.set("bgColour", 0);
		emotionPromptInput.set("itemColour", 0);
		emotionPromptInput.set("alignment", "left");
		emotionPromptInput.set("multiline", 0);
		emotionPromptInput.set("editable", false);
		emotionPromptInput.set("enabled", true);
		emotionPromptInput.set("updateEachKey", false);
		emotionPromptInput.set("visible", false);
		emotionPromptInput.setZLevel("AlwaysOnTop");
		bindCallback(emotionPromptInput, onEmotionPromptInput);
		emotionPromptInput.setConsumedKeyPresses("all_nonexclusive");
		emotionPromptInput.setKeyPressCallback(onEmotionPromptKey);
	}
	if (isDefined(emotionTypeIcon))
	{
		emotionTypeIcon.set("width", EMO_PROMPT_TYPE_H);
		emotionTypeIcon.set("height", EMO_PROMPT_TYPE_H);
		emotionTypeIcon.set("opaque", false);
		emotionTypeIcon.set("enabled", false);
		emotionTypeIcon.set("visible", false);
		emotionTypeIcon.setZLevel("AlwaysOnTop");
		emotionTypeIcon.setPaintRoutine(function(g)
		{
			paintEmotionTypeIcon(g);
		});
	}
	if (isDefined(emotionPromptOk))
	{
		emotionPromptOk.set("width", EMO_PROMPT_SUBMIT_S);
		emotionPromptOk.set("height", EMO_PROMPT_SUBMIT_S);
		emotionPromptOk.set("opaque", false);
		emotionPromptOk.set("enabled", true);
		emotionPromptOk.set("visible", false);
		emotionPromptOk.set("allowCallbacks", "Clicks, Hover & Dragging");
		emotionPromptOk.setZLevel("AlwaysOnTop");
		emotionPromptOk.data.hover = 0;
		emotionPromptOk.setPaintRoutine(function(g)
		{
			paintEmotionPromptOk(g, this.data.hover);
		});
		emotionPromptOk.setMouseCallback(function(event)
		{
			this.data.hover = event.hover;
			this.repaint();
			if (event.clicked)
				commitEmotionPrompt();
		});
	}
}

inline function iconFitArea(path, s, pad)
{
	local b = path.getBounds(1.0);
	local pw = b[2];
	local ph = b[3];
	local maxS = s - pad * 2.0;
	local dw = maxS;
	local dh = maxS;
	if (pw < 0.001)
		pw = 1.0;
	if (ph < 0.001)
		ph = 1.0;
	if (pw > ph)
		dh = maxS * ph / pw;
	else
		dw = maxS * pw / ph;
	return [(s - dw) * 0.5, (s - dh) * 0.5, dw, dh];
}

inline function paintEditBtn(g, hover)
{
	local a = hover ? 1.0 : 0.8;
	g.setColour(Colours.withAlpha(0xFFFFFFFF, a));
	g.fillPath(penIconPath, [1.5, 1.5, 29.0, 29.0]);
}

inline function paintRefreshBtn(g, hover, spin)
{
	local s = CAP_ICON_S;
	local a = hover ? 1.0 : 0.92;
	local area = iconFitArea(refreshIconPath, s, s * 0.22);
	paintGlassCircle(g, s);
	g.setColour(Colours.withAlpha(EMO_PILL_FG, a));
	if (spin)
		g.rotate(spin, [s * 0.5, s * 0.5]);
	g.fillPath(refreshIconPath, area);
}

inline function paintDeleteBtn(g, hover)
{
	local s = CAP_ICON_S;
	local a = hover ? 1.0 : 0.92;
	local pad = s * 0.32;
	paintGlassCircle(g, s);
	g.setColour(Colours.withAlpha(EMO_PILL_FG, a));
	g.drawLine(pad, s - pad, pad, s - pad, 1.8);
	g.drawLine(s - pad, pad, pad, s - pad, 1.8);
}

inline function setupCalmRefresh()
{
	if (!isDefined(calmRefresh))
		return;
	calmRefresh.set("width", CAP_ICON_S);
	calmRefresh.set("height", CAP_ICON_S);
	calmRefresh.set("opaque", false);
	calmRefresh.set("enabled", true);
	calmRefresh.set("allowCallbacks", "Clicks, Hover & Dragging");
	calmRefresh.setZLevel("AlwaysOnTop");
	calmRefresh.data.hover = 0;
	calmRefresh.data.spin = 0.0;
	calmRefresh.data.loading = 0;
	calmRefresh.setPaintRoutine(function(g)
	{
		paintRefreshBtn(g, this.data.hover, this.data.spin);
	});
	calmRefresh.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		this.repaint();
		if (event.clicked)
			refreshCalmBed();
	});
}

inline function setupFuryRefresh()
{
	if (!isDefined(furyRefresh))
		return;
	furyRefresh.set("width", CAP_ICON_S);
	furyRefresh.set("height", CAP_ICON_S);
	furyRefresh.set("opaque", false);
	furyRefresh.set("enabled", true);
	furyRefresh.set("allowCallbacks", "Clicks, Hover & Dragging");
	furyRefresh.setZLevel("AlwaysOnTop");
	furyRefresh.data.hover = 0;
	furyRefresh.data.spin = 0.0;
	furyRefresh.data.loading = 0;
	furyRefresh.setPaintRoutine(function(g)
	{
		paintRefreshBtn(g, this.data.hover, this.data.spin);
	});
	furyRefresh.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		this.repaint();
		if (event.clicked)
			refreshFuryBed();
	});
}

inline function setupGoldRefresh()
{
	if (!isDefined(goldRefresh))
		return;
	goldRefresh.set("width", CAP_ICON_S);
	goldRefresh.set("height", CAP_ICON_S);
	goldRefresh.set("opaque", false);
	goldRefresh.set("enabled", true);
	goldRefresh.set("allowCallbacks", "Clicks, Hover & Dragging");
	goldRefresh.setZLevel("AlwaysOnTop");
	goldRefresh.data.hover = 0;
	goldRefresh.data.spin = 0.0;
	goldRefresh.data.loading = 0;
	goldRefresh.setPaintRoutine(function(g)
	{
		paintRefreshBtn(g, this.data.hover, this.data.spin);
	});
	goldRefresh.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		this.repaint();
		if (event.clicked)
			refreshGoldBed();
	});
}

inline function setupCalmDelete()
{
	if (!isDefined(calmDelete))
		return;
	calmDelete.set("width", CAP_ICON_S);
	calmDelete.set("height", CAP_ICON_S);
	calmDelete.set("opaque", false);
	calmDelete.set("enabled", true);
	calmDelete.set("allowCallbacks", "Clicks, Hover & Dragging");
	calmDelete.setZLevel("AlwaysOnTop");
	calmDelete.data.hover = 0;
	calmDelete.setPaintRoutine(function(g)
	{
		paintDeleteBtn(g, this.data.hover);
	});
	calmDelete.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		this.repaint();
		if (event.clicked)
			deleteEmotionNode(1);
	});
}

inline function setupFuryDelete()
{
	if (!isDefined(furyDelete))
		return;
	furyDelete.set("width", CAP_ICON_S);
	furyDelete.set("height", CAP_ICON_S);
	furyDelete.set("opaque", false);
	furyDelete.set("enabled", true);
	furyDelete.set("allowCallbacks", "Clicks, Hover & Dragging");
	furyDelete.setZLevel("AlwaysOnTop");
	furyDelete.data.hover = 0;
	furyDelete.setPaintRoutine(function(g)
	{
		paintDeleteBtn(g, this.data.hover);
	});
	furyDelete.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		this.repaint();
		if (event.clicked)
			deleteEmotionNode(2);
	});
}

inline function setupGoldDelete()
{
	if (!isDefined(goldDelete))
		return;
	goldDelete.set("width", CAP_ICON_S);
	goldDelete.set("height", CAP_ICON_S);
	goldDelete.set("opaque", false);
	goldDelete.set("enabled", true);
	goldDelete.set("allowCallbacks", "Clicks, Hover & Dragging");
	goldDelete.setZLevel("AlwaysOnTop");
	goldDelete.data.hover = 0;
	goldDelete.setPaintRoutine(function(g)
	{
		paintDeleteBtn(g, this.data.hover);
	});
	goldDelete.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		this.repaint();
		if (event.clicked)
			deleteEmotionNode(3);
	});
}

inline function setupCalmEdit()
{
	if (!isDefined(calmEdit))
			return;
	calmEdit.set("width", 32);
	calmEdit.set("height", 32);
	calmEdit.set("opaque", false);
	calmEdit.set("enabled", true);
	calmEdit.set("allowCallbacks", "Clicks, Hover & Dragging");
	calmEdit.setZLevel("AlwaysOnTop");
	calmEdit.data.hover = 0;
	calmEdit.setPaintRoutine(function(g)
	{
		paintEditBtn(g, this.data.hover);
	});
	calmEdit.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		this.repaint();
		if (event.clicked)
			beginCalmPrompt();
	});
}

inline function setupFuryEdit()
{
	if (!isDefined(furyEdit))
		return;
	furyEdit.set("width", 32);
	furyEdit.set("height", 32);
	furyEdit.set("opaque", false);
	furyEdit.set("enabled", true);
	furyEdit.set("allowCallbacks", "Clicks, Hover & Dragging");
	furyEdit.setZLevel("AlwaysOnTop");
	furyEdit.data.hover = 0;
	furyEdit.setPaintRoutine(function(g)
	{
		paintEditBtn(g, this.data.hover);
	});
	furyEdit.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		this.repaint();
		if (event.clicked)
			beginFuryPrompt();
	});
}

inline function syncStretchPlayBtn()
{
	if (!isDefined(stretchPlayBtn))
		return;
	emotionBtnSyncing = 1;
	stretchPlayBtn.setValue(emotionStretchOn ? 1 : 0);
	if (isDefined(earScriptButton))
		earScriptButton.setValue(emotionStretchOn ? 1 : 0);
	emotionBtnSyncing = 0;
}

inline function syncPitchMatchBtn()
{
	if (!isDefined(pitchMatchBtn))
		return;
	emotionBtnSyncing = 1;
	pitchMatchBtn.setValue(emotionPitchMatchOn ? 0 : 1);
	emotionBtnSyncing = 0;
}

inline function toggleEmotionPitchMatch()
{
	if (emotionPitchMatchOn)
		emotionPitchMatchOn = 0;
	else
		emotionPitchMatchOn = 1;
	syncPitchMatchBtn();
	armEmotionPitchMatch();
	debugLog("[AI-cinescapes] pitch match " + emotionPitchMatchOn);
}

inline function onPitchMatchBtn(component, value)
{
	if (emotionBtnSyncing)
		return;
	if (value > 0.5)
		emotionPitchMatchOn = 0;
	else
		emotionPitchMatchOn = 1;
	armEmotionPitchMatch();
	debugLog("[AI-cinescapes] pitch match " + emotionPitchMatchOn);
}

inline function setEmotionStretchPlaying(on)
{
	if (on)
		emotionStretchOn = 1;
	else
		emotionStretchOn = 0;
	setEmotionStretchGate();
	syncStretchPlayBtn();
}

inline function toggleEmotionStretch()
{
	if (emotionStretchOn)
		setEmotionStretchPlaying(0);
	else
		setEmotionStretchPlaying(1);
	debugLog("[AI-cinescapes] stretch play " + emotionStretchOn);
}

inline function onStretchPlayBtn(component, value)
{
	if (emotionBtnSyncing)
		return;
	if (value > 0.5)
		setEmotionStretchPlaying(1);
	else
		setEmotionStretchPlaying(0);
	debugLog("[AI-cinescapes] stretch play " + emotionStretchOn);
}

inline function setupStretchPlayBtn()
{
	if (!isDefined(stretchPlayBtn))
		return;
	stretchPlayBtn.set("isMomentary", 0);
	stretchPlayBtn.setZLevel("AlwaysOnTop");
	bindCallback(stretchPlayBtn, onStretchPlayBtn);
	syncStretchPlayBtn();
}

inline function onEarScriptButton(component, value)
{
	if (emotionBtnSyncing)
		return;
	syncStretchPlayBtn();
}

inline function setupEarScriptButton()
{
	if (!isDefined(earScriptButton))
		return;
	earScriptButton.set("isMomentary", 0);
	bindCallback(earScriptButton, onEarScriptButton);
	syncStretchPlayBtn();
}

inline function setupPitchMatchBtn()
{
	if (!isDefined(pitchMatchBtn))
		return;
	pitchMatchBtn.set("isMomentary", 0);
	pitchMatchBtn.setZLevel("AlwaysOnTop");
	bindCallback(pitchMatchBtn, onPitchMatchBtn);
	syncPitchMatchBtn();
}

setupEmotionPromptBox();
setupCalmRefresh();
setupFuryRefresh();
setupGoldRefresh();
setupCalmDelete();
setupFuryDelete();
setupGoldDelete();
setupPitchMatchBtn();
setupStretchPlayBtn();
setupEarScriptButton();
setupTagsPanel();
setupCapturePanel();
setupRecordButtons();
setupCaptureToggle();
setupSettingsToggle();
setupWeblinkButton();
setupMaxNodesAlert();
syncDropOntoImage();
setupPillSliders();
placeCalmChrome();
placeFuryChrome();
placeGoldChrome();

if (isDefined(xyPad))
{
	xyPad.setMouseCallback(function(event)
	{
		var x = event.x;
		var y = event.y;
		if (event.clicked)
		{
			if (emotionMenuOpen)
			{
				if (hitEmotionDrop(x, y))
					return;
				commitEmotionPrompt();
				return;
			}
			if (canvasCalmOn && hitIcon(x, y, pillCalmX + CAP_DELETE_DX, pillCalmY + CAP_ICON_DY))
			{
				deleteEmotionNode(1);
				return;
			}
			if (canvasFuryOn && hitIcon(x, y, pillFuryX + CAP_DELETE_DX, pillFuryY + CAP_ICON_DY))
			{
				deleteEmotionNode(2);
				return;
			}
			if (canvasGoldOn && hitIcon(x, y, pillGoldX + CAP_DELETE_DX, pillGoldY + CAP_ICON_DY))
			{
				deleteEmotionNode(3);
				return;
			}
			if (canvasCalmOn && hitIcon(x, y, pillCalmX + CAP_REFRESH_DX, pillCalmY + CAP_ICON_DY))
			{
				refreshCalmBed();
				return;
			}
			if (canvasFuryOn && hitIcon(x, y, pillFuryX + CAP_REFRESH_DX, pillFuryY + CAP_ICON_DY))
			{
				refreshFuryBed();
				return;
			}
			if (canvasGoldOn && hitIcon(x, y, pillGoldX + CAP_REFRESH_DX, pillGoldY + CAP_ICON_DY))
			{
				refreshGoldBed();
				return;
			}
			if (canvasCalmOn && hitPill(x, y, pillCalmX, pillCalmY))
			{
				pillDrag = 1;
				pillDidDrag = 0;
				pillOpenMenu = 0;
				pillDragOffX = x - pillCalmX;
				pillDragOffY = y - pillCalmY;
				startPillGesture(1);
				return;
			}
			if (canvasFuryOn && hitPill(x, y, pillFuryX, pillFuryY))
			{
				pillDrag = 2;
				pillDidDrag = 0;
				pillOpenMenu = 0;
				pillDragOffX = x - pillFuryX;
				pillDragOffY = y - pillFuryY;
				startPillGesture(2);
				return;
			}
			if (canvasGoldOn && hitPill(x, y, pillGoldX, pillGoldY))
			{
				pillDrag = 3;
				pillDidDrag = 0;
				pillOpenMenu = 0;
				pillDragOffX = x - pillGoldX;
				pillDragOffY = y - pillGoldY;
				startPillGesture(3);
				return;
			}
		}
		if (pillDrag)
		{
			if (event.drag)
			{
				pillDidDrag = 1;
				if (pillDrag == 1)
				{
					pillCalmX = clampPillX(x - pillDragOffX);
					pillCalmY = clampPillY(y - pillDragOffY);
					placeCalmChrome();
					writePillAuto(1);
				}
				else if (pillDrag == 2)
				{
					pillFuryX = clampPillX(x - pillDragOffX);
					pillFuryY = clampPillY(y - pillDragOffY);
					placeFuryChrome();
					writePillAuto(2);
				}
				else if (pillDrag == 3)
				{
					pillGoldX = clampPillX(x - pillDragOffX);
					pillGoldY = clampPillY(y - pillDragOffY);
					placeGoldChrome();
					writePillAuto(3);
				}
				applyEmotionMix();
			}
			if (!event.clicked && !event.drag)
			{
				endPillGesture();
				pillDrag = 0;
				pillOpenMenu = 0;
				pillDidDrag = 0;
			}
			return;
		}
	});
}

inline function loadMetaFile(fileName)
{
	local root = projectSemanticFolder();
	if (!isDefined(root))
		return undefined;
	local f = root.getChildFile(fileName);
	if (!f.isFile())
		return undefined;
	local data = f.loadAsObject();
	if (data == undefined || data.length == undefined)
		return undefined;
	return data;
}

inline function loadMetaOrEmpty(fileName)
{
	local data = loadMetaFile(fileName);
	if (data == undefined)
		return [];
	return data;
}

inline function loadBank()
{
	bankV6 = loadMetaOrEmpty("meta_ucs_v6.json");
	bankV6loc = loadMetaOrEmpty("meta_ucs_v6_locations.json");
	if (bankV6.length + bankV6loc.length == 0)
	{
		bankLoaded = 0;
		return;
	}
	bankLoaded = 1;
	initClapSearch();
}

loadBank();
setupSessionState();
applyEmotionMix();
setFxParam("ch0_stretch_speed", PLAY_SPEED);
setFxParam("ch0_stretch_gate", 0.0);
setCaptureParam("capture_gate", 0.0);
setCaptureParam("capture_ratio", 1.0);
setCaptureParam("capture_gain", -100.0);

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
 