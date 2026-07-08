Content.makeFrontInterface(600, 600);

const var circleAnim = Content.getComponent("circleAnim");
const var SimpleGain1 = Synth.getEffect("Simple Gain1");
const var AudioLoopPlayer1 = Synth.getChildSynth("Audio Loop Player1");


// Function to generate a random number between min and max
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}



// Function to draw a circle at a random position with a random color from the colors array
function drawRandomCircle(g) {
    var x = getRandomNumber(150, 350);
    var y = getRandomNumber(150, 350);
    var radius = getRandomNumber(0, SimpleGain1.getCurrentLevel(1) * 40);
    var area = [x - radius, y - radius, radius * 2, radius * 2]; // Define the area array


    g.fillEllipse(area); // Draw ellipse using the area array and random color
}

// CIRCLE ANIM PAINT ROUTINE
circleAnim.setPaintRoutine(function(g) {
    var alphaValue = this.getValue() / 2;
    g.setColour(Colours.mix(Colours.red, Colours.darkmagenta, Math.random()));
    g.setOpacity(0.9 + alphaValue);

    // Draw 10 random circles with random colors from the colors array
    for (var i = 0; i < 10; i++) {
        drawRandomCircle(g);
    }

    g.beginLayer(true);
    g.boxBlur(alphaValue * 100);
    g.endLayer();
});

// CIRCLE ANIM TIMER CALLBACK
circleAnim.setTimerCallback(function() {
    var x = SimpleGain1.getCurrentLevel(1);
    x = x * Math.random() + 0.1 * (Math.random() / 20);
    this.setValue(x);
    this.repaint();
});

// START TIMER
circleAnim.startTimer(30);
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
 