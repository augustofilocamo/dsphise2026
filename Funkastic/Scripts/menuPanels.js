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

const var aboutPanel = Content.getComponent("aboutPanel");
const var settingsPanel = Content.getComponent("settingsPanel");




const var aboutButton = Content.getComponent("aboutButton");
const var settingsButton = Content.getComponent("settingsButton");





inline function onsettingsButtonControl(component, value)
{
    aboutPanel.showControl(false);
    settingsPanel.showControl(value);
    
    aboutButton.setValue(false);
    settingsButton.setValue(value);
   
}




inline function onaboutButtonControl(component, value)
{
    aboutPanel.showControl(value);
    settingsPanel.showControl(false);
 
    aboutButton.setValue(value);
    settingsButton.setValue(false);


};


aboutButton.setControlCallback(onaboutButtonControl);
settingsButton.setControlCallback(onsettingsButtonControl);




