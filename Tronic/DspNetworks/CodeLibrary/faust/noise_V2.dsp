import("stdfaust.lib");

//process = noise * en.adsre(0.001, noise_AmpDecay, 0, noise_AmpDecay, gate) * noise_velocity <: _, _
process = noise * en.adsre(0.001, noise_AmpDecay, 0, noise_AmpDecay, gate)  * 0.6 <: _, _
with {
    gate = button("gate"); 
    noise_AmpDecay = hslider("Decay", 0.05, 0.001, 0.7, 0.0001);
    noise_velocity = hslider("gain", 0.3, 0,0.7, 0.001);           // vco pitch secuenciador
    
    // Pre process
    noise = no.noise;
};