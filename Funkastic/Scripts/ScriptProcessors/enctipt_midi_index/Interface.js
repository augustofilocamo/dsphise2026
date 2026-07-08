Content.makeFrontInterface(600, 600);

// Script one-time para encriptar el índice
const var projectFolder = FileSystem.getFolder(FileSystem.Samples).getParentDirectory();

// Cargar catálogo sin encriptar
const var indexFile = projectFolder.getChildFile("library/catalog.json");
const var indexData = indexFile.loadAsObject();

// Crear archivo encriptado
const var encryptedFile = projectFolder.getChildFile("library/wgth_data.dat");
encryptedFile.writeEncryptedObject(indexData, "tu_clave_secreta_aqui_123");

Console.print("✓ Índice encriptado creado");
Console.print("  Archivos: " + indexData.length);function onNoteOn()
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
 