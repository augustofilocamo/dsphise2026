
// Todos los elementos menos el keyboard con focus change detection
const var messagePanel = Content.getComponent("messagePanel");
const var maskPanel1 = Content.getComponent("maskPanel1");
const var maskPanel2 = Content.getComponent("maskPanel2");


qwertyPlayButton.setConsumedKeyPresses("all");
qwertyPlayButton.setKeyPressCallback(function(obj)
{
    if (obj.isFocusChange)
    {
        messagePanel.showControl(obj.hasFocus ? true : false);
        Content.getComponent("maskPanel1").showControl(obj.hasFocus ? true : false);
        Content.getComponent("maskPanel2").showControl(obj.hasFocus ? true : false);
        
        Console.print("Foco: " + (obj.hasFocus ? "Entró" : "Salió"));
    }
});


maskPanel1.setMouseCallback(function(event){
	if (event.clicked){
		//messagePanel.showControl(true);
		qwertyPlayButton.grabFocus();
	}
});

maskPanel2.setMouseCallback(function(event){
	if (event.clicked){
		qwertyPlayButton.grabFocus();
	}
});