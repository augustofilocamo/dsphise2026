Content.makeFrontInterface(1024, 680);
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% DEFINICION VARIABLES 
const var bufScriptFX = Synth.getAudioSampleProcessor("Stretcher");

const bufScript1 = bufScriptFX.getAudioFile(0);
const bufScript2 = bufScriptFX.getAudioFile(1);
const bufScript3 = bufScriptFX.getAudioFile(2);
const bufScript4 = bufScriptFX.getAudioFile(3);

// Boton cargar audio
const var Button1 = Content.getComponent("Button1");

// const var AudioWaveform1 = Content.getComponent("AudioWaveform1");


inline function onButton1Control(component, value)
{
	if (value)
		FileSystem.browse(FileSystem.Desktop, false, "*.wav,*.mp3,*.ogg" , function(file)
		{
		    // Cargar audio en los buffers				
			var f = {};
			f.fileName = file.toString(File.FullPath); 
			
			bufScript1.loadFile(f.fileName);	  		
		    bufScript2.loadFile(f.fileName);
		    bufScript3.loadFile(f.fileName);
		    bufScript4.loadFile(f.fileName);
		    // Esto funciona
		    // AudioWaveform1.setPlaybackPosition(0.5);
		    		    
			Synth.addNoteOn(1, 60, 127, 0); // Envio nota al granulador
			Console.print("Audio Loaded");
			Console.print(f.fileName);
		});		
};

Content.getComponent("Button1").setControlCallback(onButton1Control);


//------------------- Panel de carga

const var DropPanel = Content.getComponent("Panel1");


// Activar Granulador

Synth.addNoteOn(1, 60, 127, 0);

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% LOOK AND FEEL AUDIOWAVEFORM

const var laf = Engine.createGlobalScriptLookAndFeel();

laf.registerFunction("drawThumbnailRuler", function(g, obj)
{	
// Con dejarlo en blanco desaparece el playhead
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
});function onNoteOn()
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
	DropPanel.setFileDropCallback("Drop Only", "*.wav,*.mp3,*.ogg", function(file)
	{
	    if (file.drop)
	    {
	/* (A String is forbidden as preset value in order to prevent subtle bugs) so we need to create a simple object with a single property. We could also just have passed in file to the function, but this reduces the noise a bit */ 
	        var x = {};
	        x.fileName = file.fileName;   // mejora de performance
	         
	        bufScript1.loadFile(x.fileName); // Cargo audio en los buffers
	        bufScript2.loadFile(x.fileName);
	        bufScript3.loadFile(x.fileName);
	        bufScript4.loadFile(x.fileName);
      
	        Synth.addNoteOn(1, 60, 127, 0); // Envio nota al granulador
	        Console.print(x.fileName); 		// DEBUG CONSOLA
	    }
	});
	
}

}
 