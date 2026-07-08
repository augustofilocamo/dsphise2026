// Audiowaveform LAF

const var AudioWaveformRec = Content.getComponent("AudioWaveform4");
const var AudioWaveformRange1 = Content.getComponent("AudioWaveformRange1");
const var AudioWaveformRange2 = Content.getComponent("AudioWaveformRange2");
const var audiowaveformLaf = Content.createLocalLookAndFeel();
const var audiowaveformRangeLaf = Content.createLocalLookAndFeel();

audiowaveformLaf.registerFunction("drawThumbnailRuler", function(g, obj)
{
    g.setColour(0x0DCCCCCC); // lightgrey con alpha baja
    g.fillRect([obj.xPosition, 0, obj.xPosition == 0 ? 5 : 10, obj.area[3]]);
});



//Problems - is ist possible to draw a rounded boarder instead of a filled rectangle?
audiowaveformLaf.registerFunction("drawThumbnailRange", function(g, obj)
{
    g.setColour(0x01550000);
    g.fillRoundedRectangle(obj.area, 128.0);
});    



audiowaveformLaf.registerFunction("drawThumbnailText", function(g, obj)
{    
    //g.setColour(Colours.white);
    //g.setFont("Oxygen", 12.0);
    //g.drawAlignedText(obj.text, [400, 0, 70, 15], "right");
});


audiowaveformLaf.registerFunction("drawThumbnailPath", function(g, obj)
{
     g.setGradientFill([0xfffa23cb, 0, 0.9 * obj.area[3], 0xfffd541f, 1.3*obj.area[2], 1.6* obj.area[3]]);
     g.fillPath(obj.path, obj.area);     
});


AudioWaveformRec.setLocalLookAndFeel(audiowaveformLaf);
AudioWaveformRec.sendRepaintMessage();



// Audiowaveform Range Laf
audiowaveformRangeLaf.registerFunction("drawThumbnailRuler", function(g, obj)
{
    g.setColour(0x0DCCCCCC); // lightgrey con alpha baja
    g.fillRect([obj.xPosition, 0, obj.xPosition == 0 ? 5 : 10, obj.area[3]]);
});

audiowaveformRangeLaf.registerFunction("drawThumbnailRange", function(g, obj)
{
    // desestructuramos área original
    var x = obj.area[0],
        y = obj.area[1],
        w = obj.area[2],
        h = obj.area[3];
    
    // nueva altura = 50% del alto original, y en la parte superior
    var newH = h * 0.5;
    var newY = y;
    
    // área de la mitad superior
    var topHalf = [ x, newY, w, newH ];
    
    // relleno semitransparente
    g.setColour(0x22C10050);
    g.fillRoundedRectangle(topHalf, 4.0);
    
    // borde más visible
    g.setColour(0x88C10050);
    g.drawRoundedRectangle(topHalf, 4.0, 2.0);
});



audiowaveformRangeLaf.registerFunction("drawThumbnailText", function(g, obj)
{    
    //g.setColour(Colours.white);
    //g.setFont("Oxygen", 12.0);
    //g.drawAlignedText(obj.text, [400, 0, 70, 15], "right");
});


audiowaveformRangeLaf.registerFunction("drawThumbnailPath", function(g, obj)
{
     g.setColour(0xFF888888);   
     g.fillPath(obj.path, obj.area);     
});


AudioWaveformRange1.setLocalLookAndFeel(audiowaveformRangeLaf);
AudioWaveformRange2.setLocalLookAndFeel(audiowaveformRangeLaf);















// Preset Browser LAF

const var browserLaf = Content.createLocalLookAndFeel();
const var presetsFloatingTile = Content.getComponent("ScriptFloatingTile1");


browserLaf.registerFunction("drawPresetBrowserListItem", function(g, obj)
{
    g.setFont("Atkinson Hyperlegible", 18.0); // Cambiá este valor según tu preferencia

    var x = obj.area[0];
    var y = obj.area[1];
    var w = obj.area[2];
    var h = obj.area[3];

    if (obj.selected)
    {
        g.setColour(0xFF242424);
        g.fillRoundedRectangle([x, y, w, h], 2.0);
    }

    g.setColour(Colours.grey);

    // Simulamos un ajuste del interlineado desplazando el texto hacia arriba o abajo


    g.drawAlignedText(obj.text, [x + 40, y, w, h], "left");
});


presetsFloatingTile.setLocalLookAndFeel(browserLaf);




