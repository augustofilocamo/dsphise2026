import("stdfaust.lib");

// ↓↓↓↓ PARA HISE DESCOMENTAR ↓↓↓↓
//process = vco <: _,_

// ↓↓↓↓↓↓↓↓ PARA FAUST DESCOMENTAR ↓↓↓↓


process = vco * en.adsre(0.0001, vco1_AmpDecay, 0, vco1_AmpDecay, trigger) * vco1_velocity * 0.3 <: _,_

with {
    // Parameters
    // Main values
    midiFreq = hslider("freq", 20, 20, 15000, 0.1);  // vco freq via midi
    freqKnob = hslider("freqKnob", 0, 0, 5000, 0.1);  // vco freq Knob Grande
    decay = hslider("EG Decay", 0.5, 0.005, 1, 0.001);   // vco decay EG
    egAmount = hslider("EG amount", 0, 0 , 400, 1);
    vco1_AmpDecay = hslider("decay", 1, 0.005, 10, 0.001);

    // Sequencer
    velocitySeq = hslider("Velocity Seq", 0, -8,8, 0.01);         // vco pitch envelope jump amount
    pitchSeq = hslider("Pitch Seq", 0, -1000, 1000, 0.1);   // vco freq secuenciador
    vco1_velocity = hslider("gain", 1, 0,1, 0.001);           // vco pitch secuenciador
    
    // Switches
    switchSeq = checkbox("Switch freq-Pitch");         // Cambia entre EG knob y pitch seq
    waveSelector = checkbox("Tri-Sqr Wave");           // vco wave selector
    
    // Trigger Envelope and Phase Reset
    trigger = button("gate");

    //CHEQUEAR EL RELEASE CUANDO EL GATE TERMINA ANTES QUE EL DECAY
    releaseTime = 0.05;
    
// &&&&&&&&&&&&&&&&&&&&&&&& Sub-process &&&&&&&&&&&&&&&&&&&&&&&&

//  EG Envelope                                                                
    eg = en.adsre(0, decay, 0 , releaseTime, trigger) * egAmount; // + 1 evita el cero para multiplicar en freq

    /* Knob Frecuencia + knobs "pitch" del secuenciador * Envolvente Pitch (EG), que le sumo 1 para
    evitar el 0 que mutee al vco
    */

    // frequency from   Big Knob     MIDI sequencer   EG envelope
    freq = midiFreq + freqKnob + eg;   
	
    phase = 0.25;

    //phaseReset = ba.spulse (ba.sec2samp(0.0001), trigger);
    phaseReset = ba.spulse (5, trigger);

    saw = os.lf_sawpos_phase_reset(freq, phase, phaseReset);

    // Triangular wave
    triangular = (saw - 0.5): abs * 4 - 1 ;

    // Square wave
    square =  ((saw < 0.5) * 2 - 1) - phaseReset; 
	
 
    
    // Wave Selector
    oscillator = triangular, square : select2(waveSelector); // Ver de suavizar cambio

    vco = ma.tanh(oscillator * 4);
};

