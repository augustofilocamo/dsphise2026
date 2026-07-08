// Paint routines paneles

const var panelBuf1 = Content.getComponent("panelBuf1");
const var panelBuf2 = Content.getComponent("panelBuf2");




panelBuf1.setPaintRoutine(function(g)
{
	
    var panelWidth = panelBuf1.getWidth();
    var panelHeight = panelBuf1.getHeight();

    if (fftResults.length == 0) return;

    var gridCols = 48;
    var cellSize = panelWidth / gridCols;
    var gridRows = Math.floor(panelHeight / cellSize);

    var maxRadius = cellSize * 0.9;
    var baseColour = 0xFFff0068;

    var originalLen = fftResults.length;
    var threshold = 0.0; // Umbral mínimo para ambas capas

    var fftX = [];
    for (var i = 0; i < gridCols; i++)
    {
        var idxFloat = i / gridCols * originalLen;
        var idxLow = Math.floor(idxFloat);
        var idxHigh = Math.min(idxLow + 1, originalLen - 1);
        var frac = idxFloat - idxLow;

        var gainLow = fftResults[idxLow].gain;
        var gainHigh = fftResults[idxHigh].gain;
        var interpolatedGain = gainLow + (gainHigh - gainLow) * frac;

        fftX.push(interpolatedGain);
    }

    for (var row = 0; row < gridRows; row++)
    {
        var y = row * cellSize + cellSize / 2;

        for (var col = 0; col < gridCols; col++)
        {
            var x = col * cellSize + cellSize / 2;

            var gainX = fftX[col];
            var gainY = fftY[row];

            var normGainX = Math.min(gainX * 6.0, 1.0);
            var normGainY = Math.min(gainY * 6.0, 1.0);

            // Sólo mostrar si ambas capas superan el umbral
            if (normGainX >= threshold && normGainY >= threshold)
            {
                var totalGain = normGainX + normGainY;
                var radius = totalGain * 0.5 * maxRadius;
                var diameter = radius * 2;
                var alpha = Math.min(totalGain * 1.3, 1.0);

                var colorWithAlpha = Colours.withAlpha(baseColour, alpha);	
                var rand = Math.random();
                g.setColour(colorWithAlpha);
                g.fillRoundedRectangle([x - radius * rand, y - radius * rand, diameter * rand, diameter * rand], 4);
            }
        }
    }
    

});





panelBuf2.setPaintRoutine(function(g)
{
	
    var panelWidth = panelBuf2.getWidth();
    var panelHeight = panelBuf2.getHeight();

    if (fftResults2.length == 0) return;

    var gridCols = 48;
    var cellSize = panelWidth / gridCols;
    var gridRows = Math.floor(panelHeight / cellSize);

    var maxRadius = cellSize * 0.9;
    var baseColour = 0xFF00A2A3;

    var originalLen = fftResults2.length;
    var threshold = 0.0; // Umbral mínimo para ambas capas

   
    var fftY = [];
    for (var i = 0; i < gridRows; i++)
    {
        var idxFloat = i / gridRows * originalLen;
        var idxLow = Math.floor(idxFloat);
        var idxHigh = Math.min(idxLow + 1, originalLen - 1);
        var frac = idxFloat - idxLow;

        var gainLow = fftResults2[idxLow].gain;
        var gainHigh = fftResults2[idxHigh].gain;
        var interpolatedGain = gainLow + (gainHigh - gainLow) * frac;

        fftY.push(interpolatedGain);
    }

    for (var row = 0; row < gridRows; row++)
    {
        var y = row * cellSize + cellSize / 2;

        for (var col = 0; col < gridCols; col++)
        {
            var x = col * cellSize + cellSize / 2;

            var gainX = fftX[col];
            var gainY = fftY[row];

            var normGainX = Math.min(gainX * 6.0, 1.0);
            var normGainY = Math.min(gainY * 6.0, 1.0);

            // Sólo mostrar si ambas capas superan el umbral
            if (normGainX >= threshold && normGainY >= threshold)
            {
                var totalGain = normGainX + normGainY;
                var radius = totalGain * 0.5 * maxRadius;
                var diameter = radius * 2;
                var alpha = Math.min(totalGain * 1.3, 1.0);

                var colorWithAlpha = Colours.withAlpha(baseColour, alpha);	
                var rand = Math.random();
                g.setColour(colorWithAlpha);
                g.fillRoundedRectangle([x - radius * rand, y - radius * rand, diameter * rand, diameter * rand], 4);
            }
        }
    }
    
});




