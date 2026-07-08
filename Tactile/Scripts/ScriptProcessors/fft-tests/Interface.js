Content.makeFrontInterface(600, 600);

// Crear un generador de onda seno para test
const var buffer = Buffer.create(8192);
var phase = 0.0;

for (s in buffer)
{
	s = Math.random() * 2.0 - 1.0; // Ruido blanco entre -1 y 1
}

// Crear FFT
const var fft = Engine.createFFT();
fft.setEnableSpectrum2D(true);
fft.setWindowType(fft.BlackmanHarris);

fft.setEnableInverseFFT(true);

fft.setMagnitudeFunction(function(data, offset)
{
    for (s in data)
    {
         Console.print(data);
          s = 0;

    }
}, true);

fft.setEnableInverseFFT(true);
// Preparar
fft.prepare(1024, 1);

// Procesar el buffer
fft.process(buffer);

// Reproducir resultado
Engine.playBuffer(buffer, 1, 44100);
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
 