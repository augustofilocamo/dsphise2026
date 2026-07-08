Content.makeFrontInterface(1024, 680);

//include("pluginVSstandalone.js");
//include("Authorisation.js");
include("menuPanels.js");
include("laf.js");


//UI defer callback for performance
Synth.deferCallbacks(true);


// Load Font
Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Abel-Regular.ttf", "Abel");

Engine.setGlobalFont("Abel");

const var SimpleGainAlp = Synth.getEffect("Simple GainAlp");

const var SimpleGain1 = Synth.getEffect("Simple Gain1");

const var Pitch1 = Content.getComponent("Pitch1");
const var Pitch2 = Content.getComponent("Pitch2");
const var Pitch3 = Content.getComponent("Pitch3");

const var Speed1 = Content.getComponent("Speed1");
const var Speed2 = Content.getComponent("Speed2");
const var Speed3 = Content.getComponent("Speed3");



// Alert Sanity Check

inline function onButton3Control(component, value)
{
	alertPanel.showControl(false);
};

Content.getComponent("Button3").setControlCallback(onButton3Control);



// Parametric EQ 
const var ParametriqEQ = Synth.getEffect("Parametriq EQ1");

inline function onfxBtn9Control(component, value)
{
	local index = ParametriqEQ.Gain + 0 * ParametriqEQ.BandOffset;
	ParametriqEQ.setAttribute(index, value);
};

Content.getComponent("fxBtn9").setControlCallback(onfxBtn9Control);


// USER PRESETS

const var nameDisplay = Content.getComponent("nameDisplay");

//if(Engine.getCurrentUserPresetName() == ""){
    nameDisplay.set("text", "INITIAL PRESET");
//}


// Prev Next

const var btnNextPreset = Content.getComponent("btnNextPreset");
const var btnPrevPreset = Content.getComponent("btnPrevPreset");


inline function onbtnNextPresetControl(component, value)
{
    if (value == 1)
	   Engine.loadNextUserPreset(false);
	   //local nextName = Engine.getCurrentUserPresetName();
	   nameDisplay.set("text", Engine.getCurrentUserPresetName().toUpperCase());

	   
};

Content.getComponent("btnNextPreset").setControlCallback(onbtnNextPresetControl);



inline function onbtnPrevPresetControl(component, value)
{
    if (value == 1)
	   Engine.loadPreviousUserPreset(false);
	   nameDisplay.set("text", Engine.getCurrentUserPresetName().toUpperCase());
	

};

Content.getComponent("btnPrevPreset").setControlCallback(onbtnPrevPresetControl);



// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% DEFINICION VARIABLES 
// Creación Global Cable
const var Global = Engine.getGlobalRoutingManager();
const var Cable = Global.getCable("global_cable");

// Audio Sample Proccesor stretcher
const var aspStretcher = Synth.getAudioSampleProcessor("Stretcher");

// AudioFile stretcher
const 	bufScript1 = aspStretcher.getAudioFile(0);
const 	bufScript2 = aspStretcher.getAudioFile(1);
const 	bufScript3 = aspStretcher.getAudioFile(2);

// AudioFile stretcher
const fileAnalizer = aspStretcher.getAudioFile(3);

// AudioFile AudioLoopPlayer
const var bufGranFX = Synth.getAudioSampleProcessor("Audio Loop Player1");
const bufScript4 = bufGranFX.getAudioFile(0);

// AudioFile Engine
const var bufScript5 = Engine.createAndRegisterAudioFile(0);

// Waveforms para stretchers 
const var AudioWaveform1 = Content.getComponent("AudioWaveform1");

//Init con audio pre-cargado y stretcher bypasseado

aspStretcher.setBypassed(true);
SimpleGainAlp.setBypassed(false);

if (bufScript1.getNumSamples() == 0){
	bufScript1.loadFile("{PROJECT_FOLDER}nylon.wav"); // Stretcher 1	  		
    bufScript2.loadFile("{PROJECT_FOLDER}nylon.wav"); // Stretcher 2  	
    bufScript3.loadFile("{PROJECT_FOLDER}nylon.wav"); // Stretcher 3
    
    fileAnalizer.loadFile("{PROJECT_FOLDER}nylon.wav"); // Audio Analyzer
    
    bufScript4.loadFile("{PROJECT_FOLDER}nylon.wav"); // Audio Loop Player
    bufScript5.loadFile("{PROJECT_FOLDER}nylon.wav"); // AudioFile Engine
     
    Console.print(fileAnalizer.getNumSamples());
    
    var audioLenght	= fileAnalizer.getNumSamples();
    
    // Setear rangos de los buffers 
	bufScript1.setRange(audioLenght/6, audioLenght);
	bufScript2.setRange(audioLenght/2, audioLenght);		    
	bufScript3.setRange(audioLenght/3, audioLenght);
   
}

//------------------- Panel de carga
//Sliders custom step size
Content.setPropertiesFromJSON("Speed1", {"stepSize": 0.0001});
Content.setPropertiesFromJSON("Speed2", {"stepSize": 0.0001});	
Content.setPropertiesFromJSON("Speed3", {"stepSize": 0.0001});	

// Panel para arrastrar archivos
const var DropPanel = Content.getComponent("Panel1");

// Boton cargar audio Manualmente
const var Button1 = Content.getComponent("Button1");

// Play button
Content.getComponent("Button5").setValue(1);

// Alert Panel
const var alertPanel = Content.getComponent("alertPanel");

inline function onButton5Control(component, value)
{
	aspStretcher.setBypassed(value);
	SimpleGainAlp.setBypassed(1-value);
};

Content.getComponent("Button5").setControlCallback(onButton5Control);

// ------- CARGAR AUDIO CON BOTON
inline function onButton1Control(component, value)
{
	if (value)
		FileSystem.browse(FileSystem.Desktop, false, "*.wav,*.mp3,*.ogg, *.aif, *.aiff" , function(file)
		{
/* 
A String is forbidden as preset value in order to prevent subtle bugs) so we need to create a simple object with a single property. We could also just have passed in file to the function, but this reduces the noise a bit 

	Chequeo del archivo de audio. Tiene que ser menor a 1 minuto, mayor a -70 Db y pesar menos de 20 Mb
*/						

			var f = {};										// Defino Array "f" para setear path del archivo	
			f.fileName = file.toString(File.FullPath);		// paso path del archivo a string
			
			fileAnalizer.loadFile(f.fileName); 				// cargo archivo en Audio Analyzer
			
			// Variables para testear
			
			var gainCheck		= Engine.getDecibelsForGainFactor(Cable.getValue());// Intensidad
			var fileSizeCheck	= file.getSize()/1000000;							// Tamaño
			var audioLenght		= fileAnalizer.getNumSamples();						// Cant. Samples
			var lenCheck		= audioLenght/Engine.getSampleRate();				// Largo de tiempo
			var applyGain		= -gainCheck - 7.0;									// Valor de ganancia para normalizar a -1 Db
			
			// si mide MÁS de -50 Db, pesa MENOS de 20 Mb y tiene MENOS de 1 min
			if (gainCheck > -50 && fileSizeCheck < 20 && lenCheck < 60) 
			{
// ***BORRAR***  Mostrar los chequeos 
				Console.print("gaincheck: " 	+ gainCheck 	+ " dB");			// Intensidad
				Console.print("fileSizeCheck: " + fileSizeCheck + " Mb");			// Tamaño
				Console.print(audioLenght);											// Cant. Samples
				Console.print("lenCheck: " 		+ lenCheck 		+ " sec.");			// Largo de tiempo					
				Console.print("Gain To Apply: " + applyGain);						// Valor de ganancia para normalizar a -1 Db
				
// ***FIN BORRAR***	
			
				// Cargar el archivo en los demás AudioFiles
				bufScript1.loadFile(f.fileName); // Stretcher 1	  	
			    bufScript2.loadFile(f.fileName); // Stretcher 2  	
			    bufScript3.loadFile(f.fileName); // Stretcher 3		
			    
			    bufScript4.loadFile(f.fileName); // Granulador
			    
			    bufScript5.loadFile(f.fileName); // Audio Loop Player
			    
			    // Setear rangos de los buffers (AUGUSTO)
				bufScript1.setRange(audioLenght/6, audioLenght);
				bufScript2.setRange(audioLenght/2, audioLenght);		    
				bufScript3.setRange(audioLenght/3, audioLenght);	
						
			    aspStretcher.setAttribute(6, applyGain);  // Normalización a -1 Db
				Console.print("Audio Loaded");
				Console.print(f.fileName);
			}
			else {
				alertPanel.showControl(true);
			};
		});		
};

Content.getComponent("Button1").setControlCallback(onButton1Control);



function onNoteOn()
{
	Console.print(Message.getNoteNumber());
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
/* 
A String is forbidden as preset value in order to prevent subtle bugs) so we need to create a simple object with a single property. We could also just have passed in file to the function, but this reduces the noise a bit 
*/ 
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
 