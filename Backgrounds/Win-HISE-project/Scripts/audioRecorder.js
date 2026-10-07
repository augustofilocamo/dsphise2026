global g_record = false;
global g_accumulator = [];

inline function clearCaptureWavs()
{
	local dir = captureExportFolder();
	local list = 0;
	local i = 0;
	local f = 0;

	if (!isDefined(dir) || !dir.isDirectory())
		return;
	list = FileSystem.findFiles(dir, "*.wav", false);
	if (!isDefined(list))
		return;
	while (i < list.length)
	{
		f = list[i];
		if (isDefined(f) && f.isFile())
			f.deleteFileOrDirectory();
		i = i + 1;
	}
}

inline function exportAndLoadCapture(audioData)
{
	local dir = captureExportFolder();
	local f = undefined;
	local ok = 0;

	if (!isDefined(audioData) || audioData.length < 1)
		return 0;
	if (!isDefined(dir) || !dir.isDirectory())
		return 0;
	fadeExportChannels(audioData);
	captureTakeId = captureTakeId + 1;
	f = dir.getChildFile(captureExportFileName());
	ok = f.writeAudioFile(audioData, Engine.getSampleRate(), 24);
	if (!ok)
		return 0;
	captureFile = f;
	captureAudio = audioData;
	captureSampleRate = Engine.getSampleRate();
	captureNumSamples = 0;
	if (isDefined(audioData[0]))
		captureNumSamples = audioData[0].length;
	capturePeaksFromChannels(audioData);
	loadCaptureIntoPlayer();
	return 1;
}

inline function reconstructFromAccumulator()
{
	local nBlocks = 0;
	local s = 0;
	local i = 0;
	local off = 0;
	local st = 0;
	local n = 0;
	local audioDataStereo = 0;
	local tempBuffer = 0;

	nBlocks = g_accumulator.length;
	if (nBlocks < 1)
		return 0;
	while (i < nBlocks)
	{
		st = g_accumulator[i];
		if (isDefined(st) && isDefined(st[0]))
			s = s + st[0].length;
		i = i + 1;
	}
	if (s < 16)
	{
		g_accumulator.clear();
		return 0;
	}
	audioDataStereo = [Buffer.create(s), Buffer.create(s)];
	i = 0;
	off = 0;
	while (i < nBlocks)
	{
		st = g_accumulator[i];
		if (isDefined(st) && isDefined(st[0]) && isDefined(st[1]))
		{
			n = st[0].length;
			if (n > 0)
			{
				tempBuffer = Buffer.referTo(audioDataStereo[0], off, n);
				st[0] >> tempBuffer;
				tempBuffer = Buffer.referTo(audioDataStereo[1], off, n);
				st[1] >> tempBuffer;
				off = off + n;
			}
		}
		i = i + 1;
	}
	g_accumulator.clear();
	return exportAndLoadCapture(audioDataStereo);
}

inline function finishLiveCapture()
{
	local ok = 0;

	captureRendering = 1;
	if (isDefined(g_accumulator) && g_accumulator.length > 0)
		ok = reconstructFromAccumulator();
	else if (isDefined(g_accumulator))
		g_accumulator.clear();
	captureRendering = 0;
	if (isDefined(capturePanel))
		capturePanel.repaint();
	if (ok && isDefined(Status))
		Status.set("text", "Capture ready — drag out");
	syncToDawImage();
	return ok;
}

inline function abortLiveCapture()
{
	g_record = false;
	if (isDefined(g_accumulator))
		g_accumulator.clear();
	captureRecording = 0;
	captureRendering = 0;
}
