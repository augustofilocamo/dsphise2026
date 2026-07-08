declare name "KS_Minimal_Pluck";
declare author "you";
declare license "MIT";

import("stdfaust.lib");

// -------- Controles simples --------
freq     = hslider("freq[unit:Hz]", 110, 27.5, 1760, 0.01);
bright   = hslider("brightness[unit:Hz]", 3000, 300, 10000, 1); // LP en el lazo
decay    = hslider("decay", 0.995, 0.90, 0.998, 0.0001);       // ganancia del lazo (limitado a 0.998)
inharm   = hslider("inharmonicity", 0.5, 0, 1, 0.01);          // dispersión (inharmonicidad)
pickupPos = hslider("pickup_position", 0.9, 0.1, 0.98, 0.01);  // posición del pickup (0.9 = cerca del puente)
gain     = hslider("gain", 0.8, 0, 1, 0.001);
gate     = button("gate");

// -------- Parámetros básicos --------
sr = ma.SR;
L  = sr/freq;                       // longitud del delay (muestras)

// -------- Excitación con pulso triangular --------
// Detectar flanco de subida del gate
trigger = (gate - gate') > 0;

// Longitud del pulso en muestras
pulseLen = 200;

// Contador: suma 1 cada muestra, se resetea a 0 con trigger
counter = ba.if(trigger, 0, min(pulseLen, _)) ~ +(1);

// Activo mientras counter < pulseLen
isActive = counter < pulseLen;

// Fase normalizada 0..1
phase = counter / pulseLen;

// Forma triangular: sube primera mitad, baja segunda mitad
triangle = ba.if(phase < 0.5, phase * 2.0, (1.0 - phase) * 2.0);

// Excitación = triángulo + textura de ruido
exc = (triangle * isActive * 0.2 + no.noise * isActive * 0.15)
    : fi.lowpass(2, 7000)
    : *(gain);

// -------- Lazo KS con modulación sutil para simular inharmonicidad --------
// Modula ligeramente el delay para crear "beating" (efecto de cuerdas ligeramente desafinadas)
lfoRate = 3.0 + freq / 200.0; // LFO más rápido en frecuencias altas
lfoDepth = inharm * 0.2; // profundidad controlada por inharm
delayMod = L + os.osc(lfoRate) * lfoDepth; // delay modulado

loop = de.fdelay(48000, delayMod)    // delay modulado para inharmonicidad
     : fi.lowpass(1, bright)         // filtrado brightness
     : *(decay);                     // atenuación simple

// -------- Ecuación: y = x + y(loop) --------
sig = exc : + ~ (loop);

// -------- Pickup (comb filter por posición) --------
// Simula que el captador solo "escucha" la cuerda en un punto específico
// Delay desde pickup hasta el puente (ida y vuelta)
pickupDelay = (1.0 - pickupPos) * L * 2.0; // ida + vuelta
// Comb filter: señal directa + señal reflejada desde el puente
pickup(x) = x <: _, (@(int(pickupDelay)) : *(-0.8)) : +; // reflejo invertido y atenuado

// -------- Salida estéreo con soft-clipper de seguridad --------
process = sig : pickup : ma.tanh <: _,_;
