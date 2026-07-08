

var bl;
global g_inputLevelDb = -100;

function prepareToPlay(sampleRate, blockSize)
{
	bl = blockSize;
	// No reserve() in HiseScript; accumulator grows with push()
}
 function processBlock(channels)
{
	// VU: peak level to dB for UI (global g_inputLevelDb set by Interface)
	reg peak = 0;
	for (var i = 0; i < bl; i++)
	{
		var s0 = Math.abs(channels[0][i]);
		var s1 = Math.abs(channels[1][i]);
		peak = Math.max(peak, Math.max(s0, s1));
	}
	g_inputLevelDb = peak <= 1e-8 ? -100 : 20 * Math.log10(peak);

	if (g_record)
	{
		// append a new empty buffer at the end of the accumulator
		g_accumulator.push([Buffer.create(bl), Buffer.create(bl)]);
		
		// copy channels
		channels[0] >> g_accumulator[g_accumulator.length-1][0];
		channels[1] >> g_accumulator[g_accumulator.length-1][1];
	}
}
 function onControl(number, value)
{
	
}
 