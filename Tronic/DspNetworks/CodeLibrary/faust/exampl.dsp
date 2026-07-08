declare name "TR-909 kick";
declare author "Simon-L/FergusL";
declare version "0.1-beta";
declare license "TBD"; 
// Resources used:
// http://www.network-909.de/bassdrum.htm
// machines.hyperreal.org/manufacturers/Roland/TR-909/samples/index.html

import("stdfaust.lib");

fixed_gate(n,trig) = 0, (ba.time < end(n)) : select2(ba.time > n)
with {
    end(n) = ba.time : ba.sAndH((trig == 1) & (trig' == 0)) + n;
};
tri(freq, retrig) = (phase_base, .5 - (phase_base - 0.5) : select2(phase_base > 0.5)) * (phase_x2 < 0.5 : *(2) - 1)
with {
    phase_x2 = (os.hs_phasor(1, freq/2, retrig)); // 2 times slower to alternate *(+1) / *(-1)
    phase_base = phase_x2 % 0.5 : *(2); // original frequency by using modulo and *(2) to get [0-1] range
};

remap(value, start1, stop1, start2, stop2) = start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));

trig_1 = ba.pulsen(128, ma.SR);

atk = hslider("Attack",0.7,0,2,0.1);

noise = no.noise : fi.lowpass(1, 338);
k_noise = en.are(1e-3, 15e-3, fixed_gate(ba.sec2samp(1.3e-3 + (atk * 2) * 0.001), trig_1)) * noise;

del = 50;
kts_rel = hslider("Sweep length",170e-3,100e-30,800e-3,0.5e-3);
kts_low = hslider("Sweep low",100,50,300,0.5);
kts_high = hslider("Sweep high",450,300,800,0.5);
k_tune_sweep = en.are(1e-6, kts_rel, (trig_1 : @(del))): ^(1.8) : remap(_, 0, 1, kts_low, kts_high);
k_osc_src = tri(k_tune_sweep, trig_1 : @(del) : ba.impulsify) : *(1.25) : ma.tanh;
k_osc_env = en.are(10e-6, hslider("Decay",650e-3,150e-3,1200e-3,1e-3), fixed_gate(ba.sec2samp(hslider("Punch",9e-3,1e-3,150e-3,1e-3)), trig_1 : @(del))) : ^(1.15);
k_osc = k_osc_src * k_osc_env * 2;

kick = k_osc + (k_noise * atk);

process = kick <: _,_;