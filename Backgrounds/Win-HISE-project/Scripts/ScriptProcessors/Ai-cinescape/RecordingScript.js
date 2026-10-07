reg bl;

function prepareToPlay(sampleRate, blockSize)
{
	bl = blockSize;
	if (isDefined(g_accumulator))
		g_accumulator.reserve(sampleRate * 30 / blockSize);
}

function processBlock(channels)
{
	if (g_record && isDefined(g_accumulator))
	{
		g_accumulator.push([Buffer.create(bl), Buffer.create(bl)]);
		channels[0] >> g_accumulator[g_accumulator.length-1][0];
		channels[1] >> g_accumulator[g_accumulator.length-1][1];
	}
}

function onControl(number, value)
{
	
}
 