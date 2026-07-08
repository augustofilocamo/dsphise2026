Content.makeFrontInterface(600, 600);


//const components = Content.getAllComponents("");



const var Panel1 = Content.getComponent("Panel1");
const var Knob1 = Content.getComponent("Knob1");

Knob1.setKeyPressCallback(function(obj)
{
    if (obj.isFocusChange)
    {
        Panel1.showControl(obj.hasFocus ? true : false);
        Console.print("Foco: " + (obj.hasFocus ? "Entró" : "Salió"));

   }
});
function onNoteOn()
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
 