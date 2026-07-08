// Script temporal para exportar el índice encriptado a JavaScript

const var projectFolder = FileSystem.getFolder(FileSystem.Samples).getParentDirectory();
const var indexFile = projectFolder.getChildFile("library/wgth_data.dat");
const var midiIndex = indexFile.loadEncryptedObject("tu_clave_secreta_aqui_123");

Console.print("=== EXPORTANDO ÍNDICE A JAVASCRIPT ===");
Console.print("Entradas: " + midiIndex.length);

// Construir el contenido del archivo JS usando JSON.stringify
// (HISE usa JSON nativo de JavaScript)
const var jsContent = "// Índice de MIDIs (auto-generado)\nconst var midiIndex = " + JSON.stringify(midiIndex) + ";";

// Guardar en Scripts/
const var outputFile = projectFolder.getChildFile("Scripts/midiIndex.js");
const var result = outputFile.writeString(jsContent);

if (result)
{
    Console.print("✓ Archivo creado: Scripts/midiIndex.js");
    Console.print("  Tamaño: " + midiIndex.length + " entradas");
}
else
{
    Console.print("✗ ERROR: No se pudo escribir el archivo");
}

Console.print("\nPróximo paso:");
Console.print("  1. Reemplaza la línea en Interface.js:");
Console.print("     const var midiIndex = indexFile.loadEncryptedObject(...);");
Console.print("  2. Por:");
Console.print("     include(\"midiIndex.js\");");

