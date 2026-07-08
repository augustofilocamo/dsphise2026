
const var qwertyPlayPanel = Content.getComponent("qwertyPlayPanel");
const var midiPlayPanel = Content.getComponent("midiPlayPanel");
const var clickPlayPanel = Content.getComponent("clickPlayPanel");

const var qwertyPlayButton = Content.getComponent("qwertyPlayButton");
const var midiPlayButton = Content.getComponent("midiPlayButton");
const var clickPlayButton = Content.getComponent("clickPlayButton");

// Menu panels
inline function onqwertyPlayButtonControl(component, value)
{
    midiPlayPanel.showControl(false);
    clickPlayPanel.showControl(false);
    qwertyPlayPanel.showControl(true);
    messagePanel.showControl(true);
    //Mensaje de click para focus. desaparece con timer


    // Desactivar los botones de los paneles ocultos
    midiPlayButton.setValue(false);
    clickPlayButton.setValue(false);
    qwertyPlayButton.setValue(true);
}

inline function onmidiPlayButtonControl(component, value)
{
    midiPlayPanel.showControl(true);
    clickPlayPanel.showControl(false);
    qwertyPlayPanel.showControl(false);


    // Desactivar los botones de los paneles ocultos
    qwertyPlayButton.setValue(false);
    clickPlayButton.setValue(false);
    midiPlayButton.setValue(true);

}

inline function onclickPlayButtonControl(component, value)
{
    midiPlayPanel.showControl(false);
    qwertyPlayPanel.showControl(false);
    clickPlayPanel.showControl(true);


    // Desactivar los botones de los paneles ocultos
    qwertyPlayButton.setValue(false);
    midiPlayButton.setValue(false);
    clickPlayButton.setValue(true);
}

midiPlayButton.setControlCallback(onmidiPlayButtonControl);
qwertyPlayButton.setControlCallback(onqwertyPlayButtonControl);
clickPlayButton.setControlCallback(onclickPlayButtonControl);
