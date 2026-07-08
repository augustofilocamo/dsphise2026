
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
      "width": 180,
      "height": 25,
      "allowCallbacks": "Clicks & Hover"
    });
    
    
    widget.setPaintRoutine(function(g)
    {
      //g.fillAll(this.data.hover ? 0xFF333333 : 0xFF222222);
      g.setColour(0x44FFFFFF);
      //g.drawRect([0, 0, this.getWidth(), this.getHeight()], 1);
      g.setFont("Atkinson Hyperlegible", 16.0);
      g.setColour(0xFF8B8B8B);
      
      g.drawAlignedText(Engine.getCurrentUserPresetName(), [0, 0, this.getWidth(), this.getHeight()], "centred");
      
      if(Engine.getCurrentUserPresetName() == ""){
        g.drawAlignedText("Initial Preset", [0, 0, this.getWidth(), this.getHeight()], "centred");
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

const var presetDecButton = createPresetButton("presetDecButton", 370, 32, false);
const var presetIncButton = createPresetButton("presetIncButton", 581, 32, true);

const var presetDisplayPanel = createPresetDisplay("presetDisplayPanel", 400, 35);

