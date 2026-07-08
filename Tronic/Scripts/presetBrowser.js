
inline function createPresetButton(name, x, y, up)
{
	local widget = Content.addPanel(name, x, y);
    
    Content.setPropertiesFromJSON(name, {
      "width": 20,
      "height": 20,
      "saveInPreset": false,
      "allowCallbacks": "Clicks & Hover"
    });
    
    widget.data.up = up;
    
    widget.setPaintRoutine(function(g)
    {
    	g.setColour(this.data.hover ? Colours.white : 0x88FFFFFF);
    	

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
      "width": 120,
      "height": 25,
      "allowCallbacks": "Clicks & Hover"
    });
    
    
    widget.setPaintRoutine(function(g)
    {
    	//g.fillAll(this.data.hover ? 0xFF333333 : 0xFF222222);
    	g.setColour(0xFFA3A3A3);
    	//g.drawRect([0, 0, this.getWidth(), this.getHeight()], 1);
    	g.setFont("Abel", 18.0);
    	g.setColour(0xFFA3A3A3);
    	
    	g.drawAlignedText(Engine.getCurrentUserPresetName().toUpperCase(), [0, 0, this.getWidth(), this.getHeight()], "centred");
    	
    	if(Engine.getCurrentUserPresetName() == ""){
	    	g.drawAlignedText("INITIAL PRESET", [0, 0, this.getWidth(), this.getHeight()], "centred");
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

const var presetDecButton = createPresetButton("presetDecButton", 100, 22, false);
const var presetIncButton = createPresetButton("presetIncButton", 255, 22, true);

const var presetDisplayPanel = createPresetDisplay("presetDisplayPanel", 130, 20);



	
// Preset Browser LAF

const var browserLaf = Content.createLocalLookAndFeel();
const var presetsFloatingTile = Content.getComponent("presetsFloatingTile");



browserLaf.registerFunction("drawPresetBrowserListItem", function(g, obj)
{

	g.setFont("Abel", 21.0);
	var a = [obj.area[0], obj.area[1], obj.area[2], obj.area[3]];
	
	


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


