// Loop sidecar persistence.
// Current take id is stored in hidden ScriptLabel "loopSidecarIdLabel" (saved in DAW preset).
// Each recording → new random id → recordings/loop_{id}.wav (older files kept on disk).
// Default label text "0" → fresh plugin loads no sidecar.

reg loopSidecarIdAttrIdx   = -1;
reg loopSidecarLoadAttrIdx = -1;
reg loopSidecarSaveAttrIdx = -1;
reg loopSidecarSaveResetPending = 0;
reg loopSidecarSaveVerifyId     = 0;
reg loopSidecarSaveHadCapture   = 0;
reg loopSidecarLoadResetPending = 0;

global g_loopRecording   = false;
global g_loopAccumulator = [];

const var loopSidecarIdLabel   = Content.getComponent("loopSidecarIdLabel");
const var loopSidecarBootTimer = Engine.createTimerObject();

inline function getLoopSidecarFolder()
{
	local root = FileSystem.getFolder(FileSystem.AudioFiles);
	root.createDirectory("recordings");
	return root.getChildFile("recordings");
}

inline function formatSidecarId(id)
{
	local n = Math.floor(id);
	if (n < 1)
		return "0";

	local s = "";
	while (n > 0)
	{
		local digit = n % 10;
		s = "" + digit + s;
		n = (n - digit) / 10;
	}
	return s;
}

inline function parseSidecarIdText(t)
{
	if (t == undefined || t == "" || t == "0")
		return 0;

	return Math.floor(parseFloat(t));
}

inline function getLoopSidecarFileForId(id)
{
	return getLoopSidecarFolder().getChildFile("loop_" + formatSidecarId(id) + ".wav");
}

inline function getLoopSidecarId()
{
	if (loopSidecarIdLabel == undefined)
		return 0;

	return parseSidecarIdText(loopSidecarIdLabel.get("text"));
}

inline function setLoopSidecarId(id)
{
	local n = Math.floor(id);

	if (loopSidecarIdLabel != undefined)
		loopSidecarIdLabel.set("text", formatSidecarId(n));

	if (loopSidecarIdAttrIdx >= 0 && FreezerFx != undefined)
		FreezerFx.setAttribute(loopSidecarIdAttrIdx, n);
}

inline function assignNewLoopSidecarId()
{
	local id = Math.floor(Math.random() * 899999999) + 100000000;
	setLoopSidecarId(id);
	return id;
}

inline function pulseLoopSidecarLoad()
{
	if (loopSidecarLoadAttrIdx < 0 || FreezerFx == undefined)
		return;

	FreezerFx.setAttribute(loopSidecarLoadAttrIdx, 0.0);
	FreezerFx.setAttribute(loopSidecarLoadAttrIdx, 1.0);
	loopSidecarLoadResetPending = 1;
}

inline function resetLoopSidecarLoadPulse()
{
	if (loopSidecarLoadAttrIdx < 0 || FreezerFx == undefined)
		return;

	FreezerFx.setAttribute(loopSidecarLoadAttrIdx, 0.0);
}

inline function pulseLoopSidecarSave()
{
	if (loopSidecarSaveAttrIdx < 0 || FreezerFx == undefined)
		return;

	FreezerFx.setAttribute(loopSidecarSaveAttrIdx, 0.0);
	FreezerFx.setAttribute(loopSidecarSaveAttrIdx, 1.0);
}

inline function resetLoopSidecarSavePulse()
{
	if (loopSidecarSaveAttrIdx < 0 || FreezerFx == undefined)
		return;

	FreezerFx.setAttribute(loopSidecarSaveAttrIdx, 0.0);
}

inline function prepareLoopSidecarPathForRec()
{
	local id = assignNewLoopSidecarId();
	Console.print("[Aeronaut] new take id=" + formatSidecarId(id));
}

inline function logLoopSidecarStatus(label)
{
	local id = getLoopSidecarId();
	local folder = getLoopSidecarFolder();
	local file = getLoopSidecarFileForId(id);

	Console.print("[Aeronaut] " + label + " sidecar id=" + formatSidecarId(id));
	Console.print("[Aeronaut] folder: " + folder.toString(0));
	Console.print("[Aeronaut] file:   " + file.toString(0) + " exists=" + file.isFile());
}

inline function syncLoopHasContentFromSidecar()
{
	local id = getLoopSidecarId();

	if (id < 1)
	{
		loopHasContent = 0;
		return;
	}

	loopHasContent = getLoopSidecarFileForId(id).isFile() ? 1 : 0;
}

inline function beginLoopSidecarRecording()
{
	g_loopAccumulator.clear();
	g_loopRecording = true;
}

inline function endLoopSidecarRecording()
{
	g_loopRecording = false;
}

inline function abortLoopSidecarRecording()
{
	g_loopRecording = false;
	g_loopAccumulator.clear();
	loopSidecarSaveResetPending = 0;
	loopSidecarSaveVerifyId     = 0;
	loopSidecarSaveHadCapture   = 0;
	loopSidecarLoadResetPending = 0;
}

inline function resolveSidecarSampleRate()
{
	local sr = g_loopTapSampleRate;

	if (sr > 0.0)
		return sr;

	sr = Engine.getSampleRate();

	if (sr > 0.0)
		return sr;

	return 44100.0;
}

inline function writeLoopSidecarFromAccumulatorForId(id)
{
	local nBlocks = g_loopAccumulator.length;
	if (nBlocks == 0)
		return false;

	local s = 0;
	local i = 0;

	for (i = 0; i < nBlocks; i++)
		s += g_loopAccumulator[i][0].length;

	local audioDataStereo = [Buffer.create(s), Buffer.create(s)];
	local offset = 0;

	for (i = 0; i < nBlocks; i++)
	{
		local bl = g_loopAccumulator[i][0].length;
		local tempL = Buffer.referTo(audioDataStereo[0], offset, bl);
		local tempR = Buffer.referTo(audioDataStereo[1], offset, bl);
		g_loopAccumulator[i][0] >> tempL;
		g_loopAccumulator[i][1] >> tempR;
		offset += bl;
	}

	g_loopAccumulator.clear();

	local file = getLoopSidecarFileForId(id);
	file.writeAudioFile(audioDataStereo, resolveSidecarSampleRate(), 24);
	Engine.loadAudioFilesIntoPool();

	return file.isFile();
}

inline function reloadLoopSidecarFromDisk()
{
	local id = getLoopSidecarId();

	if (id < 1)
	{
		syncLoopHasContentFromSidecar();
		return;
	}

	setLoopSidecarId(id);

	local file = getLoopSidecarFileForId(id);

	if (file.isFile())
		pulseLoopSidecarLoad();
	else
		Console.print("[Aeronaut] WARN: sidecar missing for id=" + formatSidecarId(id));

	syncLoopHasContentFromSidecar();
}

inline function scheduleLoopSidecarBootReload()
{
	loopSidecarBootTimer.stopTimer();
	loopSidecarBootTimer.setTimerCallback(function()
	{
		reloadLoopSidecarFromDisk();
		logLoopSidecarStatus("boot-reload");
		loopSidecarBootTimer.stopTimer();
	});
	loopSidecarBootTimer.startTimer(150);
}

inline function tickLoopSidecarSavePending()
{
	if (loopSidecarSaveResetPending > 0)
	{
		resetLoopSidecarSavePulse();
		loopSidecarSaveResetPending = 0;

		if (loopSidecarSaveVerifyId >= 1)
		{
			local id = loopSidecarSaveVerifyId;
			local hadCapture = loopSidecarSaveHadCapture > 0;
			loopSidecarSaveHadCapture = 0;

			if (hadCapture)
			{
				if (!writeLoopSidecarFromAccumulatorForId(id))
					Console.print("[Aeronaut] WARN: sidecar script save failed");
				else
					setLoopSidecarId(id);
			}
			else if (!getLoopSidecarFileForId(id).isFile())
			{
				Console.print("[Aeronaut] WARN: sidecar save failed (no capture, no file)");
			}

			loopSidecarSaveVerifyId = 0;
			syncLoopHasContentFromSidecar();
			logLoopSidecarStatus("saved");
		}
	}

	if (loopSidecarLoadResetPending > 0)
	{
		resetLoopSidecarLoadPulse();
		loopSidecarLoadResetPending = 0;
	}
}

inline function saveLoopSidecarAfterRec()
{
	endLoopSidecarRecording();

	loopSidecarSaveHadCapture = g_loopAccumulator.length > 0 ? 1 : 0;
	loopSidecarSaveVerifyId   = getLoopSidecarId();

	pulseLoopSidecarSave();
	loopSidecarSaveResetPending = 1;
}

inline function initLoopSidecar()
{
	loopSidecarIdAttrIdx   = resolveAttrIdx("LoopSidecarId");
	loopSidecarLoadAttrIdx = resolveAttrIdx("LoopSidecarLoad");
	loopSidecarSaveAttrIdx = resolveAttrIdx("LoopSidecarSave");

	if (loopSidecarIdAttrIdx < 0)
		Console.print("[Aeronaut] WARN: LoopSidecarId missing — recompile DSP network");

	if (loopSidecarLoadAttrIdx < 0)
		Console.print("[Aeronaut] WARN: LoopSidecarLoad missing — recompile DSP network");

	if (loopSidecarSaveAttrIdx < 0)
		Console.print("[Aeronaut] WARN: LoopSidecarSave missing — recompile DSP network");

	if (loopSidecarIdLabel == undefined)
		Console.print("[Aeronaut] WARN: loopSidecarIdLabel missing — reload UI preset");

	getLoopSidecarFolder();
	logLoopSidecarStatus("init");
	scheduleLoopSidecarBootReload();
}
