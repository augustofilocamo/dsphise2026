// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% LOOK AND FEEL AUDIOWAVEFORM

//const var laf = Engine.createGlobalScriptLookAndFeel();

const var blurPanel = Content.getComponent("blurPanel");
const var SimpleGain1 = Synth.getEffect("Simple Gain1");
const var Pitch1 = Content.getComponent("Pitch1");
const var Pitch2 = Content.getComponent("Pitch2");
const var Pitch3 = Content.getComponent("Pitch3");
const var Speed1 = Content.getComponent("Speed1");
const var Speed2 = Content.getComponent("Speed2");
const var Speed3 = Content.getComponent("Speed3");

const var pitchPanel1 = Content.getComponent("pitchPanel1");
const var pitchPanel2 = Content.getComponent("pitchPanel2");
const var pitchPanel3 = Content.getComponent("pitchPanel3");

const var speedPanel1 = Content.getComponent("speedPanel1");
const var speedPanel2 = Content.getComponent("speedPanel2");
const var speedPanel3 = Content.getComponent("speedPanel3");



// UI circles & Lines

inline function onPitch1Control(component, value)
{
 pitchPanel1.setPosition(value*25 + 500, 180, 50, 50);
 aspStretcher.setAttribute(0, value);

 
};
Content.getComponent("Pitch1").setControlCallback(onPitch1Control);



inline function onPitch2Control(component, value)
{
	
 pitchPanel2.setPosition(value*25 + 500, 180, 50, 50);
 aspStretcher.setAttribute(1, value);

};

Content.getComponent("Pitch2").setControlCallback(onPitch2Control);

inline function onPitch3Control(component, value)
{
	
 pitchPanel3.setPosition(value*25 + 500, 180, 50, 50);
 aspStretcher.setAttribute(2, value);

};

Content.getComponent("Pitch3").setControlCallback(onPitch3Control);




inline function onSpeed1Control(component, value)
{
	local normValue = value * 1000;
	 speedPanel1.setPosition((normValue)*12+160, 195, 20, 20);
	 aspStretcher.setAttribute(3, value);

};

Content.getComponent("Speed1").setControlCallback(onSpeed1Control);


inline function onSpeed2Control(component, value)
{
	local normValue = value * 1000;
	 speedPanel2.setPosition((normValue)*12+160, 195, 20, 20);
	 aspStretcher.setAttribute(4, value);

};

Content.getComponent("Speed2").setControlCallback(onSpeed2Control);


inline function onSpeed3Control(component, value)
{
	local normValue = value * 1000;
	 speedPanel3.setPosition((normValue)*12+160, 195, 20, 20);
	 aspStretcher.setAttribute(5, value);

};

Content.getComponent("Speed3").setControlCallback(onSpeed3Control);








//	Audiowaveform Blur with panel layer



inline function oncpuSaveButtonControl(component, value)
{
	if (value){
		
		blurPanel.setPaintRoutine(function(g)
		{
			// area array [x, y, width, height]
			var a = this.getLocalBounds(0);
			// Blur
			g.beginLayer(true);
			//g.gaussianBlur(20);
			g.gaussianBlur(Math.range(SimpleGain1.getCurrentLevel(1) * 300, 40, 700));
			g.endLayer();
				
		});
		
		
		// Implement the onTimer callback for BlurPanel
		blurPanel.setTimerCallback(function()
		{
		    // Trigger a repaint on the blurPanel to update the blur effect
		    blurPanel.repaint();
		
		});
		
		// Start the timer with a desired interval (in milliseconds)
		blurPanel.startTimer(55); // Adjust the interval as needed
		
	} else {
			
		blurPanel.setPaintRoutine(function(g)
		{
			// area array [x, y, width, height]
			var a = this.getLocalBounds(0);
			// Blur
			g.beginLayer(true);
			g.gaussianBlur(0);
			//g.gaussianBlur(Math.range(SimpleGain1.getCurrentLevel(1) * 400, 40, 900));
			g.endLayer();
				
		});
		
		
		// Implement the onTimer callback for BlurPanel
		blurPanel.setTimerCallback(function()
		{
		    // Trigger a repaint on the blurPanel to update the blur effect
		    blurPanel.repaint();
		
		});
		
		// Start the timer with a desired interval (in milliseconds)
		blurPanel.stopTimer(); // Adjust the interval as needed
			
		
	}
};

Content.getComponent("cpuSaveButton").setControlCallback(oncpuSaveButtonControl);



inline function oncpuSaveButton1Control(component, value)
{
	if (value){
		
		blurPanel.setPaintRoutine(function(g)
		{
			// area array [x, y, width, height]
			var a = this.getLocalBounds(0);
			// Blur
			g.beginLayer(true);
			//g.gaussianBlur(20);
			g.gaussianBlur(Math.range(SimpleGain1.getCurrentLevel(1) * 300, 40, 500));
			g.endLayer();
				
		});
		
		
		// Implement the onTimer callback for BlurPanel
		blurPanel.setTimerCallback(function()
		{
		    // Trigger a repaint on the blurPanel to update the blur effect
		    blurPanel.repaint();
		
		});
		
		// Start the timer with a desired interval (in milliseconds)
		blurPanel.startTimer(75); // Adjust the interval as needed
		
	} else {
			
		blurPanel.setPaintRoutine(function(g)
		{
			// area array [x, y, width, height]
			var a = this.getLocalBounds(0);
			// Blur
			g.beginLayer(true);
			g.gaussianBlur(0);
			//g.gaussianBlur(Math.range(SimpleGain1.getCurrentLevel(1) * 400, 40, 900));
			g.endLayer();
				
		});
		
		
		// Implement the onTimer callback for BlurPanel
		blurPanel.setTimerCallback(function()
		{
		    // Trigger a repaint on the blurPanel to update the blur effect
		    blurPanel.repaint();
		
		});
		
		// Start the timer with a desired interval (in milliseconds)
		blurPanel.stopTimer(); // Adjust the interval as needed
			
		
	}
};

Content.getComponent("cpuSaveButton1").setControlCallback(oncpuSaveButton1Control);



//zone1Panel.setPaintRoutine(function(g)
//{
	// area array [x, y, width, height]
	//var a = this.getLocalBounds(0);
	// Blur
	//g.beginLayer(true);
    //g.gaussianBlur(100); 
	//g.endLayer();	


		
//});


//zone2Panel.setPaintRoutine(function(g)
//{
	// area array [x, y, width, height]
	//var a = this.getLocalBounds(0);
	// Blur
	//g.beginLayer(true);
    //g.gaussianBlur(100); 
	//g.endLayer();	

//	 g.setColour(Colours.white);
//	 g.drawLine(a[0], a[0], a[1], a[1] + a[3], .5);
//	 g.drawLine(a[0] + a[2], a[0] + a[2], a[1], a[1] + a[3], .5);
		
//});

//zone3Panel.setPaintRoutine(function(g)
//{
	// area array [x, y, width, height]
	//var a = this.getLocalBounds(0);
	// Blur
	//g.beginLayer(true);
    //g.gaussianBlur(100); 
	//g.endLayer();	

//	 g.setColour(Colours.white);
//	 g.drawLine(a[0], a[0], a[1], a[1] + a[3], .5);
//	 g.drawLine(a[0] + a[2], a[0] + a[2], a[1], a[1] + a[3], .5);
		
//});




// Combobox LAF

const var comboLaf = Content.createLocalLookAndFeel();

comboLaf.registerFunction("drawComboBox", function(g, obj)
{
	g.setColour(Colours.grey);
	//g.drawRoundedRectangle(obj.area, 2.0, 2);
	g.setColour(Colours.withAlpha(obj.textColour, (obj.enabled && obj.active) ? 1.0 : 0.2));
	g.setFont("Abel", 18.0);
	
	var a = obj.area;
	g.setColour(Colours.lightgrey);
	g.drawAlignedText(obj.text, [a[0] + 10, a[1], a[2]-10, a[3]], "left");
	var h = a[3];
	g.fillTriangle([a[0] + a[2] - h/3 - 5, a[1] + h/2.8, h/3, h/3], Math.PI);
});


ComboBox1.setLocalLookAndFeel(comboLaf);



comboLaf.registerFunction("drawPopupMenuItem", function(g, obj)
{
    var a = obj.area;
    var h = a[3];
    
    if(obj.isSeparator)
    {
        g.setColour(Colours.white);
        g.drawLine(a[0]+10, a[0] + a[2]-10, a[1] + a[3]/2, a[1] + a[3]/2, 1.0);
        return;
    }
    
    if(obj.isTicked)
    {
	

        g.setColour(Colours.white);
        //g.drawRoundedRectangle(obj.area, 2.0, 2);
        g.fillEllipse([a[0] + h/3, a[1] + h/3, h/3, h/3]);
    }
    
    if(obj.isHighlighted)
    {
        g.setColour(0x22FFFFFF);
        g.fillRect(obj.area);
    }
    

    
    g.setFont("Abel", 18.0);
    g.setColour(Colours.white);
    g.drawAlignedText(obj.text, [a[0] + h, a[1], a[2] - h, a[3]], "left");
});




// Audiowaveform LAF

const var audiowaveformLaf = Content.createLocalLookAndFeel();

audiowaveformLaf.registerFunction("drawThumbnailRuler", function(g, obj)
{	
	// Con dejarlo en blanco desaparece el playhead
	//g.setColour(0x30FF1B1B);
	//g.drawVerticalLine(obj.xPosition, 0, obj.area[3]);

});


//Problems - is ist possible to draw a rounded boarder instead of a filled rectangle?
audiowaveformLaf.registerFunction("drawThumbnailRange", function(g, obj)
{
	g.setColour(0x01550000);
    g.fillRoundedRectangle(obj.area, 128.0);
});    



audiowaveformLaf.registerFunction("drawThumbnailText", function(g, obj)
{	 
	//g.setColour(Colours.white);
	//g.setFont("Oxygen", 12.0);
	//g.drawAlignedText(obj.text, [400, 0, 70, 15], "right");
});


audiowaveformLaf.registerFunction("drawThumbnailPath", function(g, obj)
{
	 g.setGradientFill([0xfffa23cb, 0, 0.9 * obj.area[3], 0xfffd541f, 1.3*obj.area[2], 1.6* obj.area[3]]);
	 g.fillPath(obj.path, obj.area);	 
});


AudioWaveform1.setLocalLookAndFeel(audiowaveformLaf);



	
// Preset Browser LAF

const var browserLaf = Content.createLocalLookAndFeel();
const var presetsFloatingTile = Content.getComponent("presetsFloatingTile");



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

presetsFloatingTile.setLocalLookAndFeel(browserLaf);

