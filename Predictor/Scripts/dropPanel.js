
//Drop panel
const var dropPanel = Content.getComponent("dropPanel");
const var dropPanelWidth = dropPanel.getWidth();


//const var midiLabel = Content.getComponent("midiLabel");
//const var MIDIPlayer1 = Synth.getMidiPlayer("MIDI Player1");

var clickRandom = 0;
// Console.print("Ancho panel: " + dropPanelWidth);
// 1000

/// Label Ticker
const var lblTicker = Content.getComponent("lblTicker");

dropPanel.setMouseCallback(function(event)
{
	if (clickPlayButton.getValue() == 1)
	{
		if(event.mouseDownX < (dropPanelWidth * 0.3)){
			if (event.clicked) {
					Synth.playNoteFromUI(1, 15, 90);
				}	
				else if(event.mouseUp){
					Synth.noteOffFromUI(1, 15);	
				}		
			}
			else if(event.mouseDownX < (dropPanelWidth * 0.6))
			{
				if (event.clicked) {
					Synth.playNoteFromUI(1, 45, 90);
					Synth.playNoteFromUI(1, 46, 90);
					Synth.playNoteFromUI(1, 47, 90);
				}
					
				else if(event.mouseUp){
					Synth.noteOffFromUI(1, 45);	
					Synth.noteOffFromUI(1, 46);	
					Synth.noteOffFromUI(1, 47);	
				}		
			}
			else 
			{ 
				if (event.clicked) 
				{
					Synth.playNoteFromUI(1, 99, 90);
				}
						
				else if(event.mouseUp)
				{
					Synth.noteOffFromUI(1, 99);	
				}
			}
	}
			
	
	targetX = event.mouseDownX;
	targetY = event.mouseDownY;

	for (i = 0; i < NUM_CIRCLES; i++) 
	{
	    circles[i].targetX = targetX;
	    circles[i].targetY = targetY;
	}
});



var absolutePath = "";
var droppedFileName = "";

dropPanel.setFileDropCallback("All Callbacks", "*.mid", function(f)
{
    if(f.drop)
    {
        // We can't pass in only the filename
        // (a String is forbidden as preset value in order
        // to prevent subtle bugs) so we need to create
        // a simple object with a single property
        //var x = {};
        absolutePath = f.fileName;        
        MIDIPlayer1.setFile(absolutePath, 1, 1);
        
		label_absPath.set("text", absolutePath);
		// Convertimos en file object apra poder sacar el Filename para el label
		var labelName = FileSystem.fromAbsolutePath(absolutePath); 
		
        lblTicker.set("text", labelName.toString(labelName.Filename)); // Actualiza label con el nombre del midi
        
        //lblTicker.set("text", absolutePath.toString(absolutePath.Filename)); // Actualiza label con el nombre del midi
        
        //Console.print("absolutePath" + droppedFileName);
        
        clearMatrix();
		curateMidi(); // Cura el midi arrastrado
		readMidiFile(); // lee midi nuevo

		// Inicializar los círculos
		setupCircleAnimation();
		// Configurar el temporizador y la rutina de pintura
		panel.setTimerCallback(updateCircles);
		panel.startTimer(1000 / 20); //  FPS
		panel.setPaintRoutine(drawCircles);
	
        // We could also just have passed in f to the function,
        // but this reduces the noise a bit
        //this.setValue(absolutePath);
        //this.changed();
    }
});




// Load button
var r = {};
var d;


inline function onchooseButtonControl(component, value) 
{
	if (value)
		FileSystem.browse(FileSystem.getFolder(FileSystem.UserPresets).getParentDirectory().getChildFile("MidiFiles"), false, "*.mid", function(result)	
	{
	    // the parameter is a File object, so we just show it
	    // in the OS' file browser.
	    //result.show();
	    
	    r = result;
		droppedFileName = r.toString(r.Filename);
	    var midiFile = r.toString(r.FullPath);
	    lblTicker.set("text", droppedFileName); // Actualiza label con el nombre del midi
	    label_absPath.set("text", midiFile);
	    
	    MIDIPlayer1.setFile(midiFile, 1, 1); // Carga el midifile
	    clearMatrix();
	    curateMidi(); // Cura el midi arrastrado
	    
	    readMidiFile(); // lee midi nuevo
	    
	    
	    // Inicializar los círculos
    	setupCircleAnimation();
    	// Configurar el temporizador y la rutina de pintura
    	panel.setTimerCallback(updateCircles);
    	panel.startTimer(1000 / 20); //  FPS
    	panel.setPaintRoutine(drawCircles);
    
    
	});
	
	Content.getComponent("chooseButton").setValue(0);
};

Content.getComponent("chooseButton").setControlCallback(onchooseButtonControl);



