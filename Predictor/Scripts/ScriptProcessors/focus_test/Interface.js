Content.makeFrontInterface(600, 600);
const var panel = Content.getComponent("Panel1");
const var button = Content.getComponent("Button1");
const var FloatingTile1 = Content.getComponent("FloatingTile1");




const var Label1 = Content.getComponent("Label1");

Label1.setConsumedKeyPresses({keyCode: 27});

Label1.setKeyPressCallback(function(event)
{
	if (event.isFocusChange)
	{
		// Respond to focus changes here
		Console.print("FOCUS CHANGE");
		return;
		FloatingTile1.grabFocus();
		panel.loseFocus();
	}
	
	// If we get to here, then the escape key (27) must have been pressed
	Console.print("ESC PRESSED!!!");
	
});


panel.setMouseCallback(function(event)
{
	if (event.clicked)
		FloatingTile1.grabFocus();
		Console.print("clicked");
		
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
 