// Create a dummy signal with two sine waves
const var signal = Buffer.create(4096);

reg uptime = 0.0;

for(s in signal)
{
    s = 0.3 * Math.sin(uptime);
    s += 0.7 * Math.sin(uptime * 2.0);
    uptime += 0.1;
}

// Create a FFT object. If you right click on it in the 
// script watch table and view the popup you'll see a spectrogram
// for the data passed in
const var fft = Engine.createFFT();

// creates a spectrogram image (required for 
// the debug popup but might be used later to draw
// on a panel. */
fft.setEnableSpectrum2D(true);

// Set the window type for the processing
fft.setWindowType(fft.BlackmanHarris);

// Give the fft a function that will be called for 
// each signal chunk. `data` will contain either a 
// buffer or an array of buffers containing the transformed
// FFT signal and offset will contain the index of the first
// sample in the chunk (here it will be 0, 1024, 2048 and 3072
// because the processing size is 1024
fft.setMagnitudeFunction(

(function(data, offset)
{
	var max = 0.0;

	for(s in data)
	{
		max = Math.max(max, s);
	}
	
	Console.print("The max value at " + offset + " is " + Engine.getDecibelsForGainFactor(max));
}), true);

fft.prepare(1024, 1);

// Process the buffer with the function above.
fft.process(signal);

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
 