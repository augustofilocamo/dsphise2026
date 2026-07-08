// Funcion para curar el audio a cargar;

function cropArrayTo20sInPlace(buffer)
{
    // declarar variables antes
    var i, maxLength, originalLength;

    // 1) Obtener longitud original
    originalLength = buffer.length;

    // 2) Definir longitud máxima (20s a 44.1kHz)
    maxLength = 882000;

    // 3) Si es más corto, no hacer nada
    if (originalLength <= maxLength)
    {
        Console.print("No requiere recorte");
        return;
    }

    // 4) Copiar hasta maxLength y rellenar con ceros el resto
    for (i = 0; i < maxLength; i++)
    {
        buffer[i] = buffer[i]; // mantener valor original
    }

    for (i = maxLength; i < originalLength; i++)
    {
        buffer[i] = 0.0; // silenciar el resto
    }

    Console.print("Buffer recortado a 20 segundos (in place)");
}


function curateAudioLength(audioFile)
{
	var audioLenght	= audioFile.getNumSamples();
	Console.print("audioLenght: " + audioLenght);
	
	if (audioLenght < 88100)
	{
		Console.print("Archivo demasiado corto (88200 samples)");
		warningPanel.showControl(true);
		return false;
	}
	
	return true;
}


function curateFileSize(file)
{
	var audio = FileSystem.fromAbsolutePath(file);	
	var fileSizeCheck = audio.getSize()/1000000; // Size in Mb
	Console.print("fileSizeCheck: " + fileSizeCheck);
	
	if (fileSizeCheck > 50)
	{
		Console.print("Archivo demasiado grande (>50MB)");
		warningPanel.showControl(true);
		return false;
	}

	return true;

}



Content.getComponent("Play").setControlCallback(onPlayControl);


inline function oncurateCloseButtonControl(component, value)
{
	warningPanel.showControl(false);
};

Content.getComponent("curateCloseButton").setControlCallback(oncurateCloseButtonControl);
