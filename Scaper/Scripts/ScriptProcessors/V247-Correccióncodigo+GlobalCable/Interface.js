Content.makeFrontInterface(1024, 680);

//include("pluginVSstandalone.js");
//include("Authorisation.js");
include("menuPanels.js");

//UI defer callback for performance
Synth.deferCallbacks(true);
const var SimpleGainAlp = Synth.getEffect("Simple GainAlp");

const var nameDisplay = Content.getComponent("nameDisplay");
// nameDisplay.set("text", "GLASSY EP 1");

var asdfas = nameDisplay.get("text");

//Console.print(Engine.getCurrentUserPresetName());
//nameDisplay.set("text", Engine.getCurrentUserPresetName().toUpperCase());

//if(Engine.getCurrentUserPresetName() == ""){
    nameDisplay.set("text", "DX Short Decay");
//}

if (!nameDisplay.get("text")){
	Console.print("vacio");
}

//nameDisplay.changed();

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

//Init con audio pre-cargado

if (bufScript1.getNumSamples() == 0){
	bufScript1.loadFile("{PROJECT_FOLDER}nylon.wav"); // Stretcher 1	  		
    bufScript2.loadFile("{PROJECT_FOLDER}nylon.wav"); // Stretcher 2  	
    bufScript3.loadFile("{PROJECT_FOLDER}nylon.wav"); // Stretcher 3
    
    fileAnalizer.loadFile("{PROJECT_FOLDER}nylon.wav"); // Audio Analyzer
    
    bufScript4.loadFile("{PROJECT_FOLDER}nylon.wav"); // Audio Loop Player
    bufScript5.loadFile("{PROJECT_FOLDER}nylon.wav"); // AudioFile Engine
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

//Console.print(aspStretcher.StretchGain);
//aspStretcher.setAttribute(6, 30);
//Console.print(aspStretcher.getAttribute(6));
//aspStretcher.setAttribute(6, 50);
//Console.print(aspStretcher.getAttribute(6));


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

// Alert Sanity Check

inline function onButton3Control(component, value)
{
	alertPanel.showControl(false);
};

Content.getComponent("Button3").setControlCallback(onButton3Control);


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% LOOK AND FEEL AUDIOWAVEFORM

const var laf = Engine.createGlobalScriptLookAndFeel();

laf.registerFunction("drawThumbnailRuler", function(g, obj)
{	
	// Con dejarlo en blanco desaparece el playhead
	//g.setColour(0x30FF1B1B);
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
});


laf.registerFunction("drawThumbnailPath", function(g, obj)
{
	 g.setGradientFill([0xfffa23cb, 0, 0.9 * obj.area[3], 0xfffd541f, 1.3*obj.area[2], 1.6* obj.area[3]]);
	 g.fillPath(obj.path, obj.area);	 
});




const var circleAnim = Content.getComponent("circleAnim");


const var SimpleGain1 = Synth.getEffect("Simple Gain1");

const var Pitch1 = Content.getComponent("Pitch1");
const var Pitch2 = Content.getComponent("Pitch2");
const var Pitch3 = Content.getComponent("Pitch3");

const var Speed1 = Content.getComponent("Speed1");
const var Speed2 = Content.getComponent("Speed2");
const var Speed3 = Content.getComponent("Speed3");



//	CICRLE ANIM PAINT ROUTINE
// Circle 1
circleAnim.setPaintRoutine(function(g)
{
	// area array [x, y, width, height]
	var mA = [Pitch1.getValue()*30 + 480, this.getHeight()*0.4, this.getHeight()*0.15, this.getHeight()*0.15];
	var mA2 = [Pitch2.getValue()*30 + 480, this.getHeight()*0.4, this.getHeight()*0.15, this.getHeight()*0.15];
	var mA3 = [Pitch3.getValue()*30 + 480, this.getHeight()*0.4, this.getHeight()*0.15, this.getHeight()*0.15];
	var mA4 = [Speed1.getValue()*15000 + 100 , this.getHeight()*0.15, this.getHeight()*0.15, this.getHeight()*0.15];
	var mA5 = [Speed2.getValue()*15000 + 100, this.getHeight()*0.15, this.getHeight()*0.15, this.getHeight()*0.15];
	var mA6 = [Speed3.getValue()*15000 + 100, this.getHeight()*0.15, this.getHeight()*0.15, this.getHeight()*0.15];
	
	var a = this.getLocalBounds(0);
//	var alphaValue = this.getValue()/2;
//	g.setGradientFill([0xfffa23cb, 0, 0.2* obj.area[3], 0xfffd541f, 1.3*obj.area[2], 1.6* obj.area[3]]);

	g.setOpacity(0.9 + alphaValue);	
	
	// Blur
	g.beginLayer(true);
	g.gaussianBlur(Math.range(SimpleGain1.getCurrentLevel(1) * 400, 40, 900));
	g.addNoise(2);
	g.endLayer();
		
	//g.drawLine(3000 * SimpleGain1.getCurrentLevel(1), 3000 * SimpleGain1.getCurrentLevel(1), 100 * SimpleGain1.getCurrentLevel(1), 100-(100 * SimpleGain1.getCurrentLevel(1)), 1);

	g.setColour(Colours.fromVec4([0.859, 0.949, 0.231, 1.0]));
	g.setOpacity(0.6);
	g.drawEllipse(mA, 2 + SimpleGain1.getCurrentLevel(1) * 10);
	g.setColour(Colours.fromVec4([0, 0.89, 0.89, 1.0]));
	g.setOpacity(0.6);
	g.drawEllipse(mA2, 2 +  SimpleGain1.getCurrentLevel(1) * 10);
	g.setColour(Colours.fromVec4([1, 0.149, 0.522, 1.0]));
	g.setOpacity(0.6);
	g.drawEllipse(mA3, 2 +  SimpleGain1.getCurrentLevel(1) * 10);

	
	g.setColour(Colours.fromVec4([0.859, 0.949, 0.231, 1.0]));
	g.setOpacity(0.6);
//	g.drawRect(mA4, 2 + SimpleGain1.getCurrentLevel(1) * 4);
	g.drawLine(Speed1.getValue()*15000 + 100, Speed1.getValue()*15000 + 100, 116, 75, 2 + SimpleGain1.getCurrentLevel(1) * 10);
	g.setColour(Colours.fromVec4([0, 0.89, 0.89, 1.0]));
	g.setOpacity(0.6);
//	g.drawRect(mA5, 2 +  SimpleGain1.getCurrentLevel(1) * 4);
	g.drawLine(Speed2.getValue()*15000 + 100, Speed2.getValue()*15000 + 100, 116, 75, 2 + SimpleGain1.getCurrentLevel(1) * 10);
	g.setColour(Colours.fromVec4([1, 0.149, 0.522, 1.0]));
	g.setOpacity(0.6);
//	g.drawRect(mA6, 2 +  SimpleGain1.getCurrentLevel(1) * 4);
	g.drawLine(Speed3.getValue()*15000 + 100, Speed3.getValue()*15000 + 100, 116, 75, 2 + SimpleGain1.getCurrentLevel(1) * 10);
	




});

//	CICRLE ANIM TIMER CALLBACK
	circleAnim.setTimerCallback(function()
	{
		var x = SimpleGain1.getCurrentLevel(1);
		//Console.print(SimpleGain1.getCurrentLevel(1) * 800);
		x = x * Math.random() + 0.1 * (Math.random()/20) ;
		this.setValue(x);
		this.setPosition(30, 120, 960, 200);
		//AudioWaveform1.setPosition(0, 20 - SimpleGain1.getCurrentLevel(1) * 18, 710, 400);
		this.repaint();
	
	});
	
//	START TIMER
	circleAnim.startTimer(60); 
	
	
// Preset Browser LAF


const browserLaf = Engine.createGlobalScriptLookAndFeel();

browserLaf.registerFunction("drawPresetBrowserListItem", function(g, obj)
{

	g.setFont("Abel", 21.0);
	var a = [obj.area[0], obj.area[1], obj.area[2], obj.area[3]];
	
		    if (obj.text == "Add a Bank")
		        obj.text = "Select a library";
		        
		    if (obj.text == "Select a Column")
		        obj.text = "Select a Category";
		        
		    if (a[2] > 300 && obj.text != "")
		        obj.text = "No Results";		


//color preset select


	if(obj.selected)
	{
		g.setColour(0xFF242424);
		g.fillRoundedRectangle(obj.area, 2.0);
		
		//g.setColour(0x995F5BFF);    
		//g.fillRoundedRectangle([a[0] + 0, a[1], a[2] - 180, a[3]], 2);
	}


//text color preset idle
	    
		g.setColour(Colours.white);
		g.drawAlignedText(obj.text, [a[0] + 19, a[1], a[2] , a[3]], "left");


});
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
 