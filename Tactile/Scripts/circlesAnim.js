

var circleX = 100;
var circleY = 100;
var targetX = 100;
var targetY = 100;

// Capturar movimiento del mouse
XYPadPnl.setMouseCallback(function(event)
{
    targetX = event.x;
    targetY = event.y;
});

// Dibujar círculo
inline function draw(g)
{
    g.fillAll(Colours.black);

    g.setColour(Colours.withAlpha(Colours.red, 0.8));
    g.fillEllipse([circleX - 20, circleY - 20, 40, 40]);
}

// Actualizar posición suavemente
inline function update()
{
    circleX += (targetX - circleX) * 0.2;
    circleY += (targetY - circleY) * 0.2;

    XYPadPnl.repaint();
}

// Configurar todo
XYPadPnl.setPaintRoutine(draw);
XYPadPnl.setTimerCallback(update);
XYPadPnl.startTimer(1000 / 30); // 30 FPS

