Content.makeFrontInterface(600, 600);


//Play desde teclado qwerty
const var panelQwerty = Content.getComponent("panelQwerty");


var cosumedKeysQwerty = "qwertyQWERTYasdfASDFzxcvZXCVpoiuPOIUlkjhgLKJHGmnbMNB".split("");
//var cosumedKeysPoiu = "poiuPOIUlkjhgLKJHGmnbMNB".split("");

panelQwerty.setConsumedKeyPresses(cosumedKeysQwerty);

panelQwerty.setKeyPressCallback(function(event)
{
    var eventData = {
        "isFocusChange": event.isFocusChange,
        "character": event.character,
        "specialKey": event.specialKey,
        "isWhitespace": event.isWhitespace,
        "isLetter": event.isLetter,
        "isDigit": event.isDigit,
        "keyCode": event.keyCode,
        "description": event.description,
        "shift": event.shift,
        "cmd": event.cmd,
        "alt": event.alt
    };
Console.print(trace(event));

	// Manejo de teclas ASDFG (minúsculas y mayúsculas)
    if (event.keyCode == 65 ||
	    event.keyCode == 83 ||
	    event.keyCode == 68 ||
	    event.keyCode == 70)
    {
        Console.print("Presionaste una tecla de ASDF");
        Synth.playNoteFromUI(1, 60, 90);
    }
    // Manejo de teclas ASDFG (minúsculas y mayúsculas)
    else if (event.keyCode == 72 ||
        event.keyCode == 74 ||
        event.keyCode == 75 ||
        event.keyCode == 76)
    {
        Console.print("Presionaste una tecla de GHJKL");
        Synth.playNoteFromUI(1, 72, 90);
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
 