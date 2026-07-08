const var panel = Content.getComponent("panel");

const var NUM_CIRCLES = 23;
var circles = [];

var i, k, j;
var targetX = 280; // Centro inicial
var targetY = 120;

// Función para inicializar la animación de los círculos
inline function setupCircleAnimation()
{
    circles.clear();



    for (i = 0; i < NUM_CIRCLES; i++) {
        local posX = Math.random() * 560 +200;
        local posY = Math.random() * 40 + 100;
        
        local t = Math.random(); // Valor entre 0 y 1
        local colour = Colours.mix(0xFFFF00C1, 0xFF009EFF, t);
        

        circles.push({
         	colour: colour,
            x: posX,
            y: posY,
            baseSize: 40 + Math.random() * 60,
            scale: 1.0,
            speed: 0.02 + Math.random() * 0.03,
            phase: Math.random() * Math.PI * 2,
            responseFactor: (Math.random() * 1.5) - 0.75,
            targetX: posX,
            targetY: posY
        });
    }
}

// Función para actualizar la animación
inline function updateCircles()
{
    local peakLevel = Engine.getMasterPeakLevel(0);
    local normalizedLevel = Math.max(0, peakLevel * 3);

	for (k = 0; k < NUM_CIRCLES; k++) {
	    if (k % 5 == 0) {
	        local c = circles[k];
	
	        // Movimiento suave hacia el objetivo con velocidad única
	        c.x += (c.targetX - c.x) * Math.random() * 0.0005 ;
	        c.y += (c.targetY - c.y) * Math.random() * 0.0;
	
	        local response = normalizedLevel * c.responseFactor;
	        c.scale = 1.0 + response * Math.sin(Engine.getUptime() * c.speed + c.phase);
	    }
	    if (k % 7 == 0) {
	        local c = circles[k];
	    	
	        // Movimiento suave hacia el objetivo con velocidad única
	        c.x += (c.targetX - c.x) * Math.random() * 0.001 ;
	        c.y += (c.targetY - c.y) * Math.random() * 0.0 ;
	    	
	        local response = normalizedLevel * c.responseFactor;
	        c.scale = 1.0 + response * Math.sin(Engine.getUptime() * c.speed + c.phase);
	    }
	    
	    if (k % 9 == 0) {
	        local c = circles[k];
	    	
	        // Movimiento suave hacia el objetivo con velocidad única
	        c.x += (c.targetX - c.x) * Math.random() * 0.002 ;
	        c.y += (c.targetY - c.y) * Math.random() * 0.0 ;
	    	
	        local response = normalizedLevel * c.responseFactor;
	        c.scale = 1.0 + response * Math.sin(Engine.getUptime() * c.speed + c.phase);
	    }
	    else {
		    local c = circles[k];
		    	    	
		    // Movimiento suave hacia el objetivo con velocidad única
		    c.x += (c.targetX - c.x) * Math.random() * 0.0002 ;
		    c.y += (c.targetY - c.y) * Math.random() * 0.0 ;
		    	    	
		    local response = normalizedLevel * c.responseFactor;
		    c.scale = 1.0 + response * Math.sin(Engine.getUptime() * c.speed + c.phase);
	    } 

	}

    panel.repaint();
}

// Dibujar los círculos
inline function drawCircles(g)
{
    g.beginLayer(1);

    for (j = 0; j < NUM_CIRCLES; j++) {
        local c = circles[j];
        local size = c.baseSize * c.scale;
        local x = c.x + (c.baseSize - size) / 2;
        local y = c.y + (c.baseSize - size) / 2;

		g.setColour(Colours.withAlpha(c.colour, 0.5));

        g.fillEllipse([x, y, size, size]);
    }

    g.endLayer();
}



// Inicializar todo
setupCircleAnimation();
panel.setPaintRoutine(drawCircles);
panel.setTimerCallback(updateCircles);
panel.startTimer(1000 / 30); // 30 FPS
