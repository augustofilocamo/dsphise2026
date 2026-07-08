//######################## — callback DAW/UI —
inline function onPadControl(cmp, value)
{
  if (isDrag) return;

  // desempaquetar 4 dígitos:
  local raw  = Math.round(value * 9999.0);
  local Xint = Math.floor(raw / 100);
  local Yint = raw % 100;
  local x    = Xint / 100.0;
  local y    = Yint / 100.0;

  // aplicar al efecto
  FX.setAttribute(FX.Position1, x);
  FX.setAttribute(FX.Position2, y);

  // mostrar
  local xD = Math.round(x * 100.0) / 100.0;
  local yD = Math.round(y * 100.0) / 100.0;
  local pD = Math.round(value * 10000.0) / 10000.0;
  Label1.set("text",
     "Decoded → X:" + xD
   + " Y:"    + yD
   + " Pack:" + pD);
  //Pad.repaint();
}
Pad.setControlCallback(onPadControl);



//######################## — callback DAW/UI —
inline function onPadControl(cmp, value)
{
  if (isDrag) return;

  // desempaquetar 4 dígitos:
  local raw  = Math.round(value * 9999.0);
  local Xint = Math.floor(raw / 100);
  local Yint = raw % 100;
  local x    = Xint / 100.0;
  local y    = Yint / 100.0;

  // aplicar al efecto
  FX.setAttribute(FX.Position1, x);
  FX.setAttribute(FX.Position2, y);

  // mostrar
  local xD = Math.round(x * 100.0) / 100.0;
  local yD = Math.round(y * 100.0) / 100.0;
  local pD = Math.round(value * 10000.0) / 10000.0;
  Label1.set("text",
     "Decoded → X:" + xD
   + " Y:"    + yD
   + " Pack:" + pD);
  //Pad.repaint();
}
Pad.setControlCallback(onPadControl);

//####################### — callback mouse —
Pad.setMouseCallback(function(event)
{
  if (event.clicked && !event.drag && !event.rightClick)
  {
    this.data.down = true;
    isDrag = true;
    uph.sendParameterGesture(2, IDX, true);
    Synth.playNoteFromUI(1, 64, 100);
    

  }
  if (event.mouseUp && this.data.down)
  {
    this.data.down = false;
    isDrag = false;
    uph.sendParameterGesture(2, IDX, false);
    //Engine.allNotesOff();
    Synth.noteOffFromUI(1, 64);
    
    

  }
  
  
  if (event.drag)
  {

	//Synth.addNoteOn(1, 64, 100, 0);



	
    // normalizar
    this.data.x = Math.range(event.x / this.getWidth(),  0, 1);
    this.data.y = Math.range(event.y / this.getHeight(), 0, 1);

    // empaquetar en 4 dígitos
    var Xint    = Math.floor(this.data.x * 100.0);
    var Yint    = Math.floor(this.data.y * 100.0);
    var encoded = Xint * 100 + Yint;    // 0..9999
    var normVal = encoded / 9999.0;     // [0..1]

    // enviar al DAW
    Pad.setValue(normVal);
    Pad.changed();

    // aplicar al efecto
    FX.setAttribute(FX.Position1, this.data.x);
    FX.setAttribute(FX.Position2, this.data.y);
    FX.setAttribute(FX.Position3, this.data.x);
    //FX.setAttribute(FX.grainSize1, this.data.y);
    //FX.setAttribute(FX.Gain1, Engine.getDecibelsForGainFactor(this.data.x));
    //FX.setAttribute(FX.Gain2, Engine.getDecibelsForGainFactor(this.data.y));

    // mostrar
    var xD = Math.round(this.data.x * 100.0) / 100.0;
    var yD = Math.round(this.data.y * 100.0) / 100.0;
    var pD = Math.round(normVal * 10000.0) / 10000.0;
    Label1.set("text",
       "Pack→" + pD
     + " X:"   + xD
     + " Y:"   + yD);

  }  
});


/*
// Timer que verifica si el mouse no está presionado
const var noteCheckTimer = Engine.createTimerObject();

noteCheckTimer.setTimerCallback(function()
{
    if (!Content.isMouseDown())
    {
        Engine.allNotesOff();
        
        
    }

});

// Iniciar el timer cada 100ms (ajustable)
noteCheckTimer.startTimer(100);

*/









