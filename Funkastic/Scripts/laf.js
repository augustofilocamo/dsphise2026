var comboLaf = Content.createLocalLookAndFeel();

comboLaf.registerFunction("drawComboBox", function(g, obj)
{
	g.setColour(Colours.black);
	///g.drawRoundedRectangle(obj.area, 2.0, 2);
//	g.setColour(Colours.withAlpha(obj.textColour, (obj.enabled && obj.active) ? 1.0 : 0.2));
	g.setFont("Tuffy", 22.0);
	
	
	
	var a = obj.area;
	g.setColour(Colours.grey);
	g.drawAlignedText(obj.text, [a[0] + 10, a[1], a[2]-10, a[3]], "left");
	var h = a[3];
	g.fillTriangle([a[0] + a[2] - h/3 - 5, a[1] + h/2.8, h/3, h/3], Math.PI);
	

});




/*


comboLaf.registerFunction("drawPopupMenuItem", function(g, obj)
{
    var a = obj.area;
    var h = a[3]*2;
    

    
    if(obj.isSeparator)
    {
        g.setColour(Colours.white);
        g.drawLine(a[0]+10, a[0] + a[2]-10, a[1] + a[3]/2, a[1] + a[3]/2, 1.0);
        return;
    }
    
    if(obj.isTicked)
    {
	

        g.setColour(Colours.white);
        //g.drawRoundedRectangle(obj.area, 2.0, 2);
        g.fillEllipse([a[0] + h/4, a[1] + h/3, h/3, h/3]);
    }
    
    if(obj.isHighlighted)
    {
        g.setColour(0x22FFFFFF);
        g.fillRect(obj.area);
    }
    

    
    g.setFont("Abel", 22.0);
    g.setColour(Colours.white);
    g.drawAlignedText(obj.text, [a[0] + h +10, a[1], a[2] - h, a[3]], "left");
});

*/

TypesComboBox.setLocalLookAndFeel(comboLaf);
TonesComboBox.setLocalLookAndFeel(comboLaf);
ModesComboBox.setLocalLookAndFeel(comboLaf);
DensityComboBox.setLocalLookAndFeel(comboLaf);
QuantizeComboBox.setLocalLookAndFeel(comboLaf);
VelocityComboBox.setLocalLookAndFeel(comboLaf);



