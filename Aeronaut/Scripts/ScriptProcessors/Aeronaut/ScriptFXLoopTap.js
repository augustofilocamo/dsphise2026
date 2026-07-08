// Dry loop tap — must sit in the master chain immediately BEFORE HardcodedMasterFX1.
// Fallback capture only; primary sidecar save is from the C++ looper buffer.

global g_loopTapSampleRate = 44100.0;

function prepareToPlay(sampleRate, blockSize)
{
	// Host may call with sampleRate=0 before the driver is ready (common in export).
	if (sampleRate > 0.0)
		g_loopTapSampleRate = sampleRate;

	if (blockSize > 0)
		g_loopAccumulator.reserve(g_loopTapSampleRate * 10 / blockSize);
}

function processBlock(channels)
{
	if (!g_loopRecording)
		return;

	local bl = channels[0].length;
	g_loopAccumulator.push([Buffer.create(bl), Buffer.create(bl)]);

	local n = g_loopAccumulator.length - 1;
	channels[0] >> g_loopAccumulator[n][0];
	channels[1] >> g_loopAccumulator[n][1];
}

function onControl(number, value)
{
	
}
 