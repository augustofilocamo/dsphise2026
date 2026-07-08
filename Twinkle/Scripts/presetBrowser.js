
inline function createPresetButton(name, x, y, up)
{
	local widget = Content.addPanel(name, x, y);
    
    Content.setPropertiesFromJSON(name, {
      "width": 30,
      "height": 30,
      "saveInPreset": false,
      "allowCallbacks": "Clicks & Hover"
    });
    
    widget.data.up = up;
    
    widget.setPaintRoutine(function(g)
    {
    	g.setColour(this.data.hover ? Colours.white : 0x88FFFFFF);
    	//g.fillTriangle([0, 0, this.getWidth(), this.getHeight()], this.data.up ? Math.PI/2 : 1.5 * Math.PI);
    	//x1, x2, y1, y2

    
    	//g.drawLine(this.getWidth(), this.getWidth()/0, this.data.up ? this.getHeight()/2 : this.getHeight()/0, this.data.up ? this.getHeight()/0 : this.getHeight()/2 , 1);  
    	//g.drawLine(this.getWidth(), this.getWidth()/0, this.data.up ? this.getHeight()/2 : this.getHeight(), this.data.up ? this.getHeight() : this.getHeight()/2 , 1);  
    	

		if (this.data.up){
			
			g.drawLine(this.getWidth()*0.3, this.getHeight()*0.7, this.getWidth()*0.3, this.getHeight()/2 , 1);  
			g.drawLine(this.getWidth()*0.3, this.getHeight()*0.7, this.getWidth()*0.7, this.getHeight()/2 , 1);
		}
		else{
		
			g.drawLine(this.getWidth()*0.7, this.getWidth()*0.3, this.getHeight()*0.3, this.getHeight()/2 , 1);  
			g.drawLine(this.getWidth()*0.7, this.getWidth()*0.3, this.getHeight()*0.7, this.getHeight()/2 , 1);  
		
		}

    	
    });
    
    widget.setMouseCallback(function(event)
    {
    	this.data.hover = event.hover;
    	
    	if(event.clicked)
    	{


    		if(this.data.up)
    			Engine.loadNextUserPreset(false);
    		else
    			Engine.loadPreviousUserPreset(false);

    	}
    	
    	this.repaint();
    });
    return widget;
};

inline function createPresetDisplay(name, x, y)
{
	local widget = Content.addPanel(name, x, y);
    
    Content.setPropertiesFromJSON(name, {
      "width": 180,
      "height": 25,
      "allowCallbacks": "Clicks & Hover"
    });
    
    
    widget.setPaintRoutine(function(g)
    {
    	//g.fillAll(this.data.hover ? 0xFF333333 : 0xFF222222);
    	g.setColour(0x44FFFFFF);
    	//g.drawRect([0, 0, this.getWidth(), this.getHeight()], 1);
    	g.setFont("Atkinson Hyperlegible", 15.0);
    	g.setColour(0xFF8B8B8B);
    	
    	g.drawAlignedText(Engine.getCurrentUserPresetName(), [0, 0, this.getWidth(), this.getHeight()], "centred");
    	
    	if(Engine.getCurrentUserPresetName() == ""){
	    	g.drawAlignedText("Magic Wand", [0, 0, this.getWidth(), this.getHeight()], "centred");
	    	}
    	

    });
    
    
    
    widget.setTimerCallback(function()
    {
    	this.repaint();

    });
    
    widget.startTimer(300);
    
//    widget.setPopupData({"Type": "PresetBrowser"}, [ widget.getWidth()/2, widget.getHeight(), 600, 400]);
    
   widget.setMouseCallback(function(event)
    {
    	this.data.hover = event.hover;
    	this.repaint();
    });
    return widget;
};

const var presetDecButton = createPresetButton("presetDecButton", 390, 22, false);
const var presetIncButton = createPresetButton("presetIncButton", 601, 22, true);

const var presetDisplayPanel = createPresetDisplay("presetDisplayPanel", 420, 27);




	


// Preset Browser LAF

const var browserLaf = Content.createLocalLookAndFeel();

browserLaf.registerFunction("drawPresetBrowserListItem", function(g, obj)
{
    g.setFont("Atkinson Hyperlegible", 18.0); // Cambiá este valor según tu preferencia

    var x = obj.area[0];
    var y = obj.area[1];
    var w = obj.area[2];
    var h = obj.area[3];

    if (obj.selected)
    {
        g.setColour(0xFF353535);
        g.fillRoundedRectangle([x , y, w, h], 2.0);
    }

    g.setColour(Colours.grey);

    // Simulamos un ajuste del interlineado desplazando el texto hacia arriba o abajo


    g.drawAlignedText(obj.text, [x + 10, y, w, h], "left");
});




Content.getComponent("presetsFloatingTile").setLocalLookAndFeel(browserLaf);








