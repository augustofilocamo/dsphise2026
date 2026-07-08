/*
  Copyright 2020 Studio427 Audio, Augusto Filocamo, & Arnar Helgi Aðalsteinsson
  
  This file is part of CollaB3.

  CollaB3 is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  CollaB3 is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with CollaB3. If not, see <https://www.gnu.org/licenses/>.
*/

//! =========================================================== open close panels

const var presetsPanel = Content.getComponent("presetsPanel");
const var settingsPanel = Content.getComponent("settingsPanel");
const var effectsPanel = Content.getComponent("effectsPanel");



const var presetsButton = Content.getComponent("presetsButton");
const var settingsButton = Content.getComponent("settingsButton");
const var effectsButton = Content.getComponent("effectsButton");




inline function onsettingsButtonControl(component, value)
{
    presetsPanel.showControl(false);
    settingsPanel.showControl(value);
    effectsPanel.showControl(false);

    
    presetsButton.setValue(false);
    settingsButton.setValue(value);
    effectsButton.setValue(false);

   
}




inline function onpresetsButtonControl(component, value)
{
    presetsPanel.showControl(value);
    settingsPanel.showControl(false);
    effectsPanel.showControl(false);

    
    presetsButton.setValue(value);
    settingsButton.setValue(false);
    effectsButton.setValue(false);

};



presetsButton.setControlCallback(onpresetsButtonControl);
settingsButton.setControlCallback(onsettingsButtonControl);

inline function oneffectsButtonControl(component, value)
{
    presetsPanel.showControl(false);
    settingsPanel.showControl(false);
    effectsPanel.showControl(value);

    
    presetsButton.setValue(false);
    settingsButton.setValue(false);
    effectsButton.setValue(value);

};



presetsButton.setControlCallback(onpresetsButtonControl);
settingsButton.setControlCallback(onsettingsButtonControl);
effectsButton.setControlCallback(oneffectsButtonControl);





