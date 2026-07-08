Content.makeFrontInterface(1024, 680);
const var Panel = Content.getComponent("Panel1");

var mouseX = 0;
var mouseY = 0;

Panel.setMouseCallback(function(event)
{
    mouseX = event.x;
    mouseY = event.y;
});

Panel.setTimerCallback(function()
{
    Panel.repaint();
});
Panel.startTimer(30); // 30 FPS

Panel.setPaintRoutine(function(g)
{
    var panelWidth  = Panel.getWidth();
    var panelHeight = Panel.getHeight();

    g.fillAll(Colours.black);

    var cols = 36;
    var rows = 22;

    var spacingX = panelWidth / cols;
    var spacingY = panelHeight / rows;

    var baseRadius = 2;
    var maxRadius  = 20;

    var levelL = Engine.getMasterPeakLevel(0);
    var levelR = Engine.getMasterPeakLevel(1);
    var outputLevel = (levelL + levelR) * 0.5;

    var col, row;
    for (row = 0; row < rows; row++)
    {
        for (col = 0; col < cols; col++)
        {
            var x = col * spacingX + spacingX / 2;
            var y = row * spacingY + spacingY / 2;

            var dx = x - mouseX;
            var dy = y - mouseY;
            var distance = Math.sqrt(dx * dx + dy * dy);

            var influenceRadius = 100.0;
            var t = Math.max(0.0, 1.0 - (distance / influenceRadius));

            var dynamicRadius = t * (maxRadius - baseRadius);
            var radius = baseRadius + dynamicRadius * (0.05 + outputLevel * 3.5);

            g.setColour(Colours.withAlpha(Colours.magenta, t * 0.8 + 0.2)); // nunca alpha 0
            g.fillEllipse([x - radius, y - radius, radius * 2, radius * 2]);
        }
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
 