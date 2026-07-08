Content.makeFrontInterface(600, 600);

// Obtener la carpeta del proyecto
const var projectFolder = FileSystem.getFolder(FileSystem.Samples).getParentDirectory();

// Navegar a mldata
const var mldataFolder = projectFolder.getChildFile("mldata");

// Verificar si existe
if (mldataFolder.isDirectory())
{
    // Listar todos los archivos .mid (no recursivo)
    var midiFiles = FileSystem.findFiles(mldataFolder, "*.mid", false);
    
    Console.print("=== MLDATA FILES ===");
    Console.print("Total archivos: " + midiFiles.length);
    
    // Imprimir primeros 10
    for (i = 0; i < Math.min(10, midiFiles.length); i++)
    {
        Console.print(midiFiles[i]);
    }
}
else
{
    Console.print("ERROR: mldata folder no existe");
}function onNoteOn()
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
 