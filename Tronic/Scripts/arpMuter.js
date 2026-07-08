const var SliderPack3 = Content.getComponent("SliderPack3");
const var SliderPack4 = Content.getComponent("SliderPack4");

//Console.print("slider: " + SliderPack3.getSliderValueAt(0));

inline function onSliderPack3Control(component, value)
{
	local i = 0;
	for (i; i <= 16; i++){
		if (SliderPack3.getSliderValueAt(i) < 5){
			SliderPack4.setSliderAtIndex(i, 0);
		} else {
			SliderPack4.setSliderAtIndex(i, 90);
		}
	}		
};

Content.getComponent("SliderPack3").setControlCallback(onSliderPack3Control);