Content.makeFrontInterface(1024, 400);

// Ruta absoluta al archivo de audio (ajustá esto a tu archivo real)
const var filePath = "/Users/filo/Filo/VST-Project/dsphise/Surface\ Scratcher/AudioFiles/nylon.wav";

// Crear un objeto File desde la ruta absoluta
const var af = FileSystem.fromAbsolutePath(filePath);

// Verificar que el archivo exista
Console.assertTrue(af.isFile());

// Cargarlo como AudioFile y obtener los canales
const var channels = af.loadAsAudioFile();

// Usar el primer canal como buffer
const var signal = channels[0];

// Imprimir la longitud del buffer
Console.print("Samples en canal 0: " + signal.length);

//Engine.playBuffer(signal, 1, 44100);

reg uptime = 0.0;


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


var fftResults = []; // Aquí vamos a guardar { offset, gain }


// Give the fft a function that will be called for 
// each signal chunk. `data` will contain either a 
// buffer or an array of buffers containing the transformed
// FFT signal and offset will contain the index of the first
// sample in the chunk (here it will be 0, 1024, 2048 and 3072
// because the processing size is 1024

fft.setMagnitudeFunction(function(data, offset)
{
    var bins = [];

    // Guardamos una copia de los valores del array `data`
    for (var i = 0; i < data.length; i++)
        bins.push(data[i]);

    fftResults.push({
        offset: offset,
        bins: bins
    });
}, false);

fft.prepare(8192, 1);

var reduced = [];

inline function downsampleBins(bins, groupSize)
{

    local numGroups = Math.floor(bins.length / groupSize);

	local i;
	local j;
    for (i = 0; i < numGroups; i++)
    {
        local sum = 0.0;

        for (j = 0; j < groupSize; j++)
            sum += bins[i * groupSize + j];

        reduced.push(sum / groupSize);
    }

    return reduced;
}


var rawBins = fftResults[fftResults.length - 1].bins;
var bins = downsampleBins(rawBins, 16); // 8192 → 512 líneas


// Process the buffer with the function above.
fft.process(signal);

Console.print("Total FFT frames: " + fftResults.length);
Console.print("Bins in first frame: " + fftResults[0].bins.length);


const var Panel = Content.getComponent("Panel");




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
 