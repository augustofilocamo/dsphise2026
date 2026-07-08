Content.makeFrontInterface(500, 500);

const var fltKeyboard = Content.getComponent("fltKeyboard"); //white
const keyboardLaf = Content.createLocalLookAndFeel(); //white

//White
keyboardLaf.registerFunction("drawWhiteNote", function(g, obj)
{
    // Get the center coordinates and the radius for the circle
    var a = obj.area;
    var radius = Math.min(a[2], a[3]) / 2;
    var centerX = a[0] + a[2] / 2;
    var centerY = a[1] + a[3] / 2;

    // Normal colour
    g.setColour(obj.hover ? Colours.red : Colours.darkred);
    g.fillEllipse([centerX - radius, centerY - radius, radius * 2, radius * 2]);

    // Draw the outline of the circle
    g.setColour(Colours.white);
    g.drawEllipse([centerX - radius, centerY - radius, radius * 2, radius * 2], 1.0);

    // Down colour (if the key is pressed)
    if (obj.down)
    {
        g.setColour(Colours.lightgrey);
        g.fillEllipse([centerX - radius, centerY - radius, radius * 2, radius * 2]);
    }
});

keyboardLaf.registerFunction("drawBlackNote", function(g, obj)
{
	 g.setColour(obj.hover ? Colours.grey : Colours.white);
	 	
	 	obj.area[1] += -4.0;
	 	obj.area[3] += 4.0;
	 	g.drawRect(obj.area, 6.0); //6.0 'fills' it	
	 	g.setColour(Colours.lightgrey);
	 	if(obj.down)
	 	g.fillRect(obj.area); 
	 	
});

fltKeyboard.setLocalLookAndFeel(keyboardLaf); 

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
 