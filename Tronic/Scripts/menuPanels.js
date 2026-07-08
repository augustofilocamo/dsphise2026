

const var presetsPanel = Content.getComponent("presetsPanel");
const var settingsPanel = Content.getComponent("settingsPanel");
const var beatPanel = Content.getComponent("beatPanel");




const var presetsButton = Content.getComponent("presetsButton");
const var settingsButton = Content.getComponent("settingsButton");
const var beatButton = Content.getComponent("beatButton");




// Callback de clic de beatPanel
beatPanel.setMouseCallback(function(event)
{
    if (event.clicked)
    {
		beatPanel.showControl(false);
		beatButton.setValue(false);       
    }
});


inline function onsettingsButtonControl(component, value)
{
    presetsPanel.showControl(false);
    settingsPanel.showControl(value);
    beatPanel.showControl(false);


    
    presetsButton.setValue(false);
    settingsButton.setValue(value);
    beatButton.setValue(false);


   
}




inline function onpresetsButtonControl(component, value)
{
    presetsPanel.showControl(value);
    settingsPanel.showControl(false);
    beatPanel.showControl(false);


    
    presetsButton.setValue(value);
    settingsButton.setValue(false);
    beatButton.setValue(false);


};



inline function onbeatButtonControl(component, value)
{
    presetsPanel.showControl(false);
    settingsPanel.showControl(false);
    beatPanel.showControl(value);


    
    presetsButton.setValue(false);
    settingsButton.setValue(false);
    beatButton.setValue(value);


};



presetsButton.setControlCallback(onpresetsButtonControl);
settingsButton.setControlCallback(onsettingsButtonControl);
beatButton.setControlCallback(onbeatButtonControl);






