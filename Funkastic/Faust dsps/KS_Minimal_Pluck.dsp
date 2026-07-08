declare name "KS_Minimal_Pluck";
declare author "you";
declare license "MIT";

import("stdfaust.lib");

// -------- Controles simples --------
freq   = hslider("freq[unit:Hz]", 110, 27.5, 1760, 0.01);
bright = hslider("brightness[unit:Hz]", 3000, 300, 10000, 1); // LP en el lazo
decay  = hslider("decay", 0.996, 0.90, 0.9999, 0.0001);       // ganancia del lazo
gain   = hslider("gain", 0.8, 0, 1, 0.001);
gate   = button("gate");

// -------- Parámetros básicos --------
sr = ma.SR;
L  = sr/freq;                       // longitud del delay (muestras)

// -------- Excitación (ruido breve con envolvente AR) --------
exc = no.noise
    : fi.lowpass(1, 8000)
    : *( en.adsr(0.001, 0.02, 0.0, 0.15, gate) * gain );

// -------- Lazo KS: delay fraccionario + LP + atenuación --------
loop = de.fdelay(48000, L)           // buffer max 48000 samps
     : fi.lowpass(1, bright)
     : *(decay);

// -------- Ecuación: y = x + y(loop) --------
sig = exc : + ~ (loop);

// -------- Salida estéreo --------
process = sig <: _,_;
