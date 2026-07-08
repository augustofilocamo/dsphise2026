Content.makeFrontInterface(1024, 680);
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% DEFINICION VARIABLES 
// Buffers Stretchers
const var bufStrechFX = Synth.getAudioSampleProcessor("Stretcher");
const bufScript1 = bufStrechFX.getAudioFile(0);
const bufScript2 = bufStrechFX.getAudioFile(1);
const bufScript3 = bufStrechFX.getAudioFile(2);

// Buffer Granulador
const var bufGranFX = Synth.getAudioSampleProcessor("Granulator");
const bufScript4 = bufGranFX.getAudioFile(0);

// Buffer AudioLoop
const var bufAudioLoop = Synth.getAudioSampleProcessor("Audio Loop Player1");
const bufScript5 = bufAudioLoop.getAudioFile(0);

// Waveforms para stretchers 
const var AudioWaveform1 = Content.getComponent("AudioWaveform1");

//------------------- Panel de carga
const var DropPanel = Content.getComponent("Panel1");

// Boton cargar audio Manualmente
const var Button1 = Content.getComponent("Button1");


inline function onButton1Control(component, value)
{
	if (value)
		FileSystem.browse(FileSystem.Desktop, false, "*.wav,*.mp3,*.ogg" , function(file)
		{
		    // Cargar audio en los buffers				
			var f = {};
			f.fileName = file.toString(File.FullPath); 
						
			bufScript1.loadFile(f.fileName); // Stretcher 1	  		
		    bufScript2.loadFile(f.fileName); // Stretcher 2  	
		    bufScript3.loadFile(f.fileName); // Stretcher 3
		    bufScript4.loadFile(f.fileName); // Granulador
		    bufScript5.loadFile(f.fileName); // Audio Loop Player
		    
		    Console.print(bufScript1.getNumSamples());
		    
		    var BufLenght = bufScript1.getNumSamples();
		    
		    // Setear rangos de los buffers (AUGUSTO)
			bufScript1.setRange(BufLenght/6, BufLenght);
			bufScript2.setRange(BufLenght/2, BufLenght);		    
			bufScript3.setRange(BufLenght/3, BufLenght);			
		    		    
			Synth.addNoteOn(1, 60, 127, 0); // Envio nota al granulador
			Console.print("Audio Loaded");
			Console.print(f.fileName);
		});		
};

Content.getComponent("Button1").setControlCallback(onButton1Control);

// Activar Granulador

Synth.addNoteOn(1, 60, 127, 0);


// Randoms Granulador

const var positionGranu = Content.getComponent("positionGranu");

const var timer1 = Engine.createTimerObject();

timer1.setTimerCallback(function()
{
	positionGranu.setValue(Math.random());
	positionGranu.changed();
});

timer1.startTimer(Math.randInt(120, 1200));



// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% LOOK AND FEEL AUDIOWAVEFORM

const var laf = Engine.createGlobalScriptLookAndFeel();

laf.registerFunction("drawThumbnailRuler", function(g, obj)
{	
	// Con dejarlo en blanco desaparece el playhead
	//g.setColour(Colours.fuchsia);
	//g.drawVerticalLine(obj.xPosition, 0, obj.area[3]);
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
	/* A String is forbidden as preset value in order to prevent subtle bugs) so we need to create a simple object with a single property. We could also just have passed in file to the function, but this reduces the noise a bit */ 
	        var x = {};
	        x.fileName = file.fileName;   // mejora de performance
	       	      	
	       	bufScript1.loadFile(x.fileName); // Stretcher 1	  		
		    bufScript2.loadFile(x.fileName); // Stretcher 2  	
		    bufScript3.loadFile(x.fileName); // Stretcher 3
		    bufScript4.loadFile(x.fileName); // Granulador
		    bufScript5.loadFile(x.fileName); // Audio Loop Player
		    
		    // Setear rangos de los buffers (AUGUSTO)
	        var BufLenght = bufScript1.getNumSamples();  
			
			bufScript1.setRange(BufLenght/6, BufLenght);
			bufScript2.setRange(BufLenght/2, BufLenght);		    
			bufScript3.setRange(BufLenght/3, BufLenght);

      
	        Synth.addNoteOn(1, 60, 127, 0); // Envio nota al granulador
	        Console.print(x.fileName); 		// DEBUG CONSOLA
	    }
	});
	
}

}
 