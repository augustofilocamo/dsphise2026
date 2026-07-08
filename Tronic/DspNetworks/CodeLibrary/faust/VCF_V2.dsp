import("stdfaust.lib");

q = hslider("q",1,0.4,25,0.01);
normFreq = hslider("normFreq",0.5,0,1,0.001):si.smoo;

// Adding ADSR to modulate the frequency
attack = hslider("Attack", 0.001, 0, 2, 0.01);
decay = hslider("Decay", 0.5, 0, 20, 0.01);
adsr = en.adsre(0.01, decay, 0, decay, button("gate"));
egAmount = hslider("egAmount", 0.5, 0, 1, 0.01);
modulatedFreq = normFreq * adsr * egAmount;
filterSwitch = checkbox("Lp-Hp");

lowpass = ve.moogHalfLadder(modulatedFreq, q);
//highpass = fi.resonhp (modulatedFreq*20000, q, 1); // Ganancia en 1
highpass = ve.korg35HPF(modulatedFreq, q/6);


// Process
vcf = _ <: lowpass,highpass : select2(filterSwitch);

process = vcf <:_,_;

