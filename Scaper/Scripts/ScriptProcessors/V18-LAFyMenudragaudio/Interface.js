Content.makeFrontInterface(1024, 680);
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% DEFINICION VARIABLES 
// -------------------- NO HACE FALTA

// Creación de Buffers en el Motor 
/*
const bufStretch1 = Engine.createAndRegisterAudioFile(0);
const bufStretch2 = Engine.createAndRegisterAudioFile(1);
const bufStretch3 = Engine.createAndRegisterAudioFile(2);
const bufGranular = Engine.createAndRegisterAudioFile(3);
*/

// -------------------- NO HACE FALTA

// Asignación de Buffers al ScriptNode
// const bufWaveform1 = Engine.createAndRegisterAudioFile(0); // Buffer para 

const var bufScriptFX = Synth.getAudioSampleProcessor("Stretcher");

const bufScript1 = bufScriptFX.getAudioFile(0);
const bufScript2 = bufScriptFX.getAudioFile(1);
const bufScript3 = bufScriptFX.getAudioFile(2);
const bufScript4 = bufScriptFX.getAudioFile(3);

// Boton cargar audio
const var Button1 = Content.getComponent("Button1");

//------------------- Interfaz 

// Asignación AudioWaveform (todavia no hace nada)
//const var AudioWaveform1 = Content.getComponent("AudioWaveform1");
const var DropPanel = Content.getComponent("Panel1");

// Cargar Audio en los buffers
/*
bufScript1.loadFile("{PROJECT_FOLDER}guitar.wav");
bufScript2.loadFile("{PROJECT_FOLDER}guitar.wav");
bufScript3.loadFile("{PROJECT_FOLDER}guitar.wav");
bufScript4.loadFile("{PROJECT_FOLDER}guitar.wav");
*/
// bufWaveform1.linkTo(bufScript1);

// Activar Granulador

Synth.addNoteOn(1, 60, 127, 0);

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% SACAR PLAYHEAD AUDIOWAVEFORM

const var laf = Engine.createGlobalScriptLookAndFeel();

laf.registerFunction("drawThumbnailRuler", function(g, obj)
{	
/* Selecciono el itemColour3 (en "Component Specific Properties") como color para el playhead y lo hagotransparente
	*/
    g.setColour(obj.itemColour3); 
	g.drawVerticalLine(obj.xPosition, 0, obj.area[3]);
});





//Problems - is ist possible to draw a rounded boarder instead of a filled rectangle?
laf.registerFunction("drawThumbnailRange", function(g, obj)
{
	 
	
	g.setColour(0x01550000);
    g.fillRoundedRectangle(obj.area, 128.0);

    
    
});    



laf.registerFunction("drawThumbnailText", function(g, obj)
{
	 
	g.setColour(Colours.white);
	g.setFont("Oxygen", 12.0);
	g.drawAlignedText(obj.text, [310, 5, 70, 15], "right");


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
	//------------------- Arrastrar audio al panel
	DropPanel.setFileDropCallback("Drop Only", "*.wav,*.mp3", function(file)
	{
	    if (file.drop)
	    {
	/* (A String is forbidden as preset value in order to prevent subtle bugs) so we need to create a simple object with a single property. We could also just have passed in file to the function, but this reduces the noise a bit */ 
	        var x = {};
	        x.fileName = file.fileName;   // mejora de performane
	         
	        bufScript1.loadFile(x.fileName); // Cargo audio en los buffers
	        bufScript2.loadFile(x.fileName);
	        bufScript3.loadFile(x.fileName);
	        bufScript4.loadFile(x.fileName);
	        // bufWaveform1.linkTo(bufScript1);      
	     
	        // Activar Granulador        
	        Synth.addNoteOn(1, 60, 127, 0); // Envio nota
	        Console.print(x.fileName); 		// DEBUG CONSOLA
	    }
	});

if (number == Button1 && value == 1) {
	Console.print("GFSJG");
}

}
 