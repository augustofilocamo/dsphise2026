Content.makeFrontInterface(600, 600);

const var circleAnim = Content.getComponent("circleAnim");
const var SimpleGain1 = Synth.getEffect("Simple Gain1");
const var AudioLoopPlayer1 = Synth.getChildSynth("Audio Loop Player1");




//	CICRLE ANIM PAINT ROUTINE
circleAnim.setPaintRoutine(function(g)
{
	// area array [x, y, width, height]
	//var freqKnob = (freq.getValue()/2000 * 140) + 100;
	var freqKnob = 240;

	var mA = [this.getHeight()*0.2, this.getHeight()*0.2, this.getHeight()*0.7, this.getHeight()*0.7];
	var a = this.getLocalBounds(0);
	var alphaValue = this.getValue()/2;
	g.setColour(Colours.cyan);
	g.setOpacity(0.9 + alphaValue);
	

	

	g.drawLine(300, 300, 300 * alphaValue, 300-(300 * alphaValue), 1 + 15 * alphaValue);

	
//	g.drawEllipse([(a[2] /2 - freqKnob/2), (a[3]/2 - freqKnob/2) , freqKnob, freqKnob], 5 + 35 * alphaValue);
	
	g.beginLayer(true);
	g.boxBlur(alphaValue * 100);
	g.endLayer();

});

//	CICRLE ANIM TIMER CALLBACK
	circleAnim.setTimerCallback(function()
	{
		var x = SimpleGain1.getCurrentLevel(1);
		x = x * Math.random() + 0.1 * (Math.random()/20) ;
		this.setValue(x);
		this.repaint();
	});
	
//	START TIMER
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
 