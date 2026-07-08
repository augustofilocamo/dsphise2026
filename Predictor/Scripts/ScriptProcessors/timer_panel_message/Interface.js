Content.makeFrontInterface(600, 600);

const var overlayPanel = Content.getComponent("overlayPanel");

// Mostrar cartel inicialmente

overlayPanel.showControl(false);


// Variable para rastrear la última nota recibida
reg lastActivityTime = Engine.getUptime();

// Timer que chequea cada 2 segundos si hubo actividad
const var timer = Engine.createTimerObject();


timer.setTimerCallback(function()
{
    var now = Engine.getUptime();
    if (now - lastActivityTime > 3) // más de 5 segundos sin actividad
    {
		overlayPanel.showControl(true);
    }
});

timer.startTimer(500);function onNoteOn()
{
	
	overlayPanel.showControl(false);
	lastActivityTime = Engine.getUptime();
	
}
 function onNoteOff()
{
	lastActivityTime = Engine.getUptime();
	
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
 