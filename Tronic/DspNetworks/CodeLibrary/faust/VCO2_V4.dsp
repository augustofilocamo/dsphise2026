import("stdfaust.lib");

/* TO DO:
Decay = bpm length
*/

// ↓↓↓↓ PARA HISE DESCOMENTAR ↓↓↓↓
//process = vco2 <: _,_

// ↓↓↓↓↓↓↓↓ PARA FAUST DESCOMENTAR ↓↓↓↓
process = vco2 * en.adsre(0.0001, vco2_AmpDecay, 0, vco2_AmpDecay, vco2_trigger) * vco2_velocity * 0.3 <: _,_

//process = vco2 * en.ar(0.01, vco2_AmpDecay, vco2_trigger) * vco2_velocity * 0.5<: _,_

with {
    // Parameters
    // Main values
    midiFreq = hslider("freq", 20, 20, 15000, 0.1);  // vco freq via midi
    freqKnob = hslider("freqKnob", 0, 0, 5000, 0.1);  // vco freq Knob Grande
    vco2_Decay = hslider("EG Decay", 0.075, 0.005, 1, 0.001);               // vco Decay EG
    vco2_egAmount = hslider("EG Amount", 0, 0, 400, 1);   // vco pitch envelope jump amount
	vco2_AmpDecay = hslider("Decay", 1, 0.005, 10, 0.001);
	
    // Sequencer
    vco2_velocity = hslider("gain", 1, 0,1, 0.001);           // vco pitch secuenciador
    vco2_PitchSeq = hslider("Pitch Seq", 0, -50, 50, 0.1);     // vco freq secuenciador
    
    // Switches
    vco2_SwitchSeq = checkbox("Switch Freq-Pitch");         // Cambia entre EG knob y pitch seq
    vco2_waveSelector = checkbox("Tri-Sqr Wave");           // vco wave selector
    vco2_hs_Gate = checkbox("Hs On-Off");                   // vco Hard sync switch
    
    // FM
    vco2_FMindex = hslider("FM amount", 0, 0, 1000, 0.01);  // vco FM mix
    
    // Trigger Envelope and Phase Reset
    vco2_trigger = button("gate"); // HACE CLICK, ver de suavizar

    // Phase Reset
    //phaseReset = ba.spulse (1, vco2_trigger): si.smoo;
	phaseReset = (vco2_trigger > vco2_trigger') : si.smoothq(0.001, 0); // tantea el smooth para los clicks
	
    // Values from VCO 1
    vco1_egAmount = hslider("VCO1- EG amount", 200, 0, 400, 1);    // vco pitch envelope jump amount
    vco1_freqKnob = hslider("VCO1- Freq", 40, 0, 5000, 0.1);   // vco freq secuenciador
    vco1_Decay = hslider("VCO1- Decay", 0.075, 0.005, 1, 0.001);   // vco Decay EG

    //DP
    releaseTime = 0.05;
    
// &&&&&&&&&&&&&&&&&&&&&&&& Sub-process &&&&&&&&&&&&&&&&&&&&&&&&

// VCO 1
    vco1_eg = en.adsre(0.001, vco1_Decay, 0 , releaseTime, vco2_trigger) * vco1_egAmount;


//  EG Envelope                                                                
    egAmount = en.adsre(0.001, vco2_Decay, 0 , releaseTime, vco2_trigger) * vco2_egAmount; // + 1 evita el cero para multiplicar en vco2_Freq

    /* Knob Frecuencia + knobs "pitch" del secuenciador * Envolvente Pitch (EG), que le sumo 1 para
    evitar el 0 que mutee al vco
    */




// Frequency from   Big Knob     MIDI sequencer   EG envelope
    vco2_Freq = freqKnob + midiFreq + egAmount;   //

    freqFromVco1 = vco1_freqKnob  + vco1_eg;

// Hard Sync
    vco2_hardSyncFreq = os.lf_imptrain (freqFromVco1); // Use vco1_Freq for hard sync
   
// Esto es un selector para que se resetee la fase con el gate 
    vco2_phaseReset =   phaseReset,           // Reset de fase x trigger cuando vco2_hs_Gate = 0
                        vco2_hardSyncFreq | phaseReset  // Reset de fase x Hard sync cuando vco2_hs_Gate = 1
                        : select2(vco2_hs_Gate)
    ;
    
    
    
    
// Osc Generators
    saw = os.lf_sawpos_phase_reset(vco2_Freq + os.osc (freqFromVco1) * vco2_FMindex, 0.25, vco2_phaseReset);

// Triangular wave
    triangular = (saw - 0.5): abs * 4 - 1 ;
    
// Square wave
    square =  (saw > 0.5) * 2 - 1; 
    
// Wave Selector
    oscillator = triangular, square : select2(vco2_waveSelector); // Ver de suavizar cambio

    vco2 = ma.tanh(oscillator * 4);
};