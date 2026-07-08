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
fft.setMagnitudeFunction(

(function(data, offset)
{
	var max = 0.0;

	for(s in data)
	{
		max = Math.max(max, s);
	}
	
	Console.print("The max value at " + offset + " is " + max);
	
	fftResults.push({ offset: offset, gain: max });
	
}), false);

fft.prepare(8192, 1);



// Process the buffer with the function above.
fft.process(signal);


const var Panel = Content.getComponent("Panel1");

var mouseX = 0;
var mouseY = 0;

Panel.setMouseCallback(function(event)
{
    mouseX = event.x;
    mouseY = event.y;
});

Panel.setTimerCallback(function()
{
    Panel.repaint();
});
Panel.startTimer(30);

Panel.setPaintRoutine(function(g)
{
    var panelWidth  = Panel.getWidth();
    var panelHeight = Panel.getHeight();

    g.fillAll(Colours.black);

    var cols = 60;
    var rows = 22;

    var spacingX = panelWidth / cols;
    var spacingY = panelHeight / rows;

    var maxRadius  = 20;

    // Nivel de salida general
    var levelL = Engine.getMasterPeakLevel(0);
    var levelR = Engine.getMasterPeakLevel(1);
    var outputLevel = (levelL + levelR) * 0.5;

    // Usar el último frame del FFT
    var lastFFT = fftResults.length > 0 ? fftResults[fftResults.length - 1] : { gain: 0.01 };
    var fftGain = lastFFT.gain;

    var col, row;
    for (row = 0; row < rows; row++)
    {
        for (col = 0; col < cols; col++)
        {
            var x = col * spacingX + spacingX / 2;
            var y = row * spacingY + spacingY / 2;

            var dx = x - mouseX;
            var dy = y - mouseY;
            var distance = Math.sqrt(dx * dx + dy * dy);

            var influenceRadius = 30.0;
            var t = Math.max(0.0, 1.0 - (distance / influenceRadius));

            // El tamaño base ahora depende del fftGain
            // Se escala entre 1 y 6 aprox
            var baseRadius = 3.0 + fftGain * 2.0;

            // Expansión dinámica como antes
            var dynamicRadius = t * (maxRadius - baseRadius);
            var radius = baseRadius + dynamicRadius * (0.2 + outputLevel * 1.5);

            g.setColour(Colours.withAlpha(Colours.magenta, t * 0.8 + 0.2));
            g.fillEllipse([x - radius, y - radius, radius * 2, radius * 2]);
        }
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
 