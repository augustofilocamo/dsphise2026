// Combobox LAF
 
const var comboLaf = Content.createLocalLookAndFeel();
//const var signatureComboBox = Content.getComponent("signatureComboBox");
//const var similarComboBox = Content.getComponent("similarComboBox");


comboLaf.registerFunction("drawComboBox", function(g, obj)
{
    //g.setColour(Colours.black);
    g.setFont("Atkinson Hyperlegible", 14.0);

    var a = obj.area;
    var h = a[3];

    // Triángulo a la izquierda
    g.setColour(Colours.grey);
    g.fillTriangle([a[0] + 10, a[1] + h/2.8, h/3, h/3], Math.PI);

    // Texto a la derecha del triángulo (ajustá +40 si querés más espacio)
    g.setColour(Colours.grey);
    g.drawAlignedText(obj.text, [a[0] + 30, a[1], a[2]-40, a[3]], "left");
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

Content.getComponent("leftScalesComboBox").setLocalLookAndFeel(comboLaf);
Content.getComponent("rightScalesComboBox").setLocalLookAndFeel(comboLaf);
Content.getComponent("noteLeftComboBox").setLocalLookAndFeel(comboLaf);
Content.getComponent("noteRightComboBox").setLocalLookAndFeel(comboLaf);
Content.getComponent("divisionComboBox").setLocalLookAndFeel(comboLaf);
Content.getComponent("instrComboBox").setLocalLookAndFeel(comboLaf);
Content.getComponent("patternComboBox").setLocalLookAndFeel(comboLaf);









