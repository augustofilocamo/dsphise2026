Content.makeFrontInterface(600, 600);

const var panelQwerty = Content.getComponent("panelQwerty");
panelQwerty.setConsumedKeyPresses("All");

panelQwerty.setKeyPressCallback(function(event)
{
    if (event.hasFocus)
    {
        Console.print("En foco");
    }
    else {
	    Console.print("NO foco");
    }
});function onNoteOn()
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
 