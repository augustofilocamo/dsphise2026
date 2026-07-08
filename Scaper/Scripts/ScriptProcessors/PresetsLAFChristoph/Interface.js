Content.makeFrontInterface(600, 500);

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
    	g.setColour(this.data.hover ? 0xFFFFFFFF : 0x88FFFFFF);
    	g.fillTriangle([0, 0, this.getWidth(), this.getHeight()], this.data.up ? Math.PI/2 : 1.5 * Math.PI);
    });
    
    widget.setMouseCallback(function(event)
    {
    	this.data.hover = event.hover;
    	
    	if(event.clicked)
    	{
    		if(this.data.up)
    			Engine.loadNextUserPreset(true);
    		else
    			Engine.loadPreviousUserPreset(true);		
    	}
    	
    	this.repaint();
    });
    return widget;
};

inline function createPresetDisplay(name, x, y)
{
	local widget = Content.addPanel(name, x, y);
    
    Content.setPropertiesFromJSON(name, {
      "width": 143,
      "height": 25,
      "allowCallbacks": "Clicks & Hover"
    });
    
    
    widget.setPaintRoutine(function(g)
    {
    	g.fillAll(this.data.hover ? 0xFF333333 : 0xFF222222);
    	g.setColour(0x44FFFFFF);
    	g.drawRect([0, 0, this.getWidth(), this.getHeight()], 1);
    	g.setFont("Oxygen Bold", 15.0);
    	g.setColour(Colours.white);
    	
    	g.drawAlignedText(Engine.getCurrentUserPresetName(), [0, 0, this.getWidth(), this.getHeight()], "centred");
    });
    
    widget.setTimerCallback(function()
    {
    	this.repaint();
    });
    
    widget.startTimer(300);
    
    widget.setPopupData({"Type": "PresetBrowser"}, [ widget.getWidth()/2, widget.getHeight(), 600, 400]);
    
    widget.setMouseCallback(function(event)
    {
    	this.data.hover = event.hover;
    	this.repaint();
    });
    return widget;
};

const var presetDecButton = createPresetButton("presetDecButton", 52, 7, false);
const var presetIncButton = createPresetButton("presetIncButton", 222, 7, true);

const var presetDisplayPanel = createPresetDisplay("presetDisplayPanel", 76, 4);function onNoteOn()
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
	
}
 