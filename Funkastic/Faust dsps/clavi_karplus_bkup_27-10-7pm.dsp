declare name "KS_Minimal_Pluck";
declare author "you";
declare license "MIT";

import("stdfaust.lib");

// -------- Controles simples --------
freq     = hslider("freq[unit:Hz]", 110, 27.5, 1760, 0.01);
bright   = hslider("brightness[unit:Hz]", 10000, 300, 10000, 1); // LP en el lazo
decay    = hslider("decay", 0.99, 0.90, 0.9995, 0.0001);     // ganancia del lazo (más rango para decay largo)
inharm   = hslider("inharmonicity", 0.5, 0, 1, 0.01);          // dispersión (inharmonicidad)
pickupPos = hslider("pickup_position", 0.83, 0.1, 0.98, 0.01);  // posición del pickup (0.9 = cerca del puente)
pickupNL = hslider("pickup_nonlinearity", 0.54, 0, 1, 0.01);    // no-linealidad del pickup (distorsión armónica)
sympathetic = hslider("sympathetic", 0.0, 0, 1, 0.01);         // resonancia simpática (cuerdas vecinas)
gain     = hslider("gain", 0.8, 0, 1, 0.001);
gate     = button("gate");

// -------- Parámetros básicos --------
sr = ma.SR;

// -------- Excitación con pulso triangular --------
// Detectar flanco de subida del gate
trigger = (gate - gate') > 0;

// Envelope de pitch bend inicial (simula tensión del tangent)
// Sube rápido al golpear, baja lento durante 1.5 segundos
pitchEnv = en.ar(0.005, 1.5, gate); // attack 5ms, release 1.5s
pitchBendCents = pitchEnv * 40.0;   // +15 cents máximo
pitchBendFactor = pow(2.0, pitchBendCents / 1200.0); // convertir cents a ratio

// Frecuencia modulada por pitch bend
freqBent = freq * pitchBendFactor;
L = sr / freqBent; // longitud del delay con pitch bend aplicado

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

// ADSR fijo para el ruido: attack 1ms, decay 5ms, sustain 0, release 10ms
noiseEnv = en.adsr(0.002, 0.005, 0.0, 0.01, gate);

// Excitación = triángulo + textura de ruido con ADSR
exc = (triangle * isActive * 0.2  + no.noise * noiseEnv * 0.4 * gain)
    : fi.lowpass(2, 7000)
    : *(gain);

// -------- Lazo KS con modulación para simular inharmonicidad --------
// Modula el delay para crear "beating" (efecto de cuerdas ligeramente desafinadas)
lfoRate = 3.0 + freq / 200.0; // LFO más rápido en frecuencias altas
lfoDepth = inharm * 0.8; // profundidad aumentada para más efecto
delayMod = L + os.osc(lfoRate) * lfoDepth; // delay modulado

// Brightness dependiente de frecuencia: graves tienen más filtrado (menos armónicos)
// Mapea freq 27.5Hz-1760Hz a factor 0..1
freqNorm = (freq - 27.5) / (1760.0 - 27.5); // normalizado 0..1
freqFactor = max(0.0, min(1.0, freqNorm));  // clamp

// Brightness escalado: graves usan 60% del bright, agudos 100%
brightScaled = bright * (0.9 + freqFactor * 0.4);

loop = de.fdelay(48000, delayMod)    // delay modulado para inharmonicidad
     : fi.lowpass(1, brightScaled)   // filtrado con brightness escalado por frecuencia
     : *(decay);                     // atenuación simple

// -------- Ecuación: y = x + y(loop) --------
sig = exc : + ~ (loop);

// -------- Pickup (comb filter por posición) --------
// Simula que el captador solo "escucha" la cuerda en un punto específico
// Delay desde pickup hasta el puente (ida y vuelta)
pickupDelay = max(2.0, (1.0 - pickupPos) * L * 2.0); // ida + vuelta, mínimo 2 samples
// Comb filter: señal directa + señal reflejada desde el puente (efecto más audible)
pickupComb(x) = x <: _, (@(int(pickupDelay)) : *(-0.92)) : +; // reflejo más fuerte

// -------- No-linealidad del pickup (simplificada para evitar clicks) --------
// Distorsión suave con tanh en vez de polinomio complejo
pickupNonlin(x) = x : *(pickupNL * 5.0) : ma.tanh : *(0.5);

// Mezcla señal lineal y no-lineal
pickupFull(x) = x : pickupComb : (_ <: clean, nl : *(pickupNL), *(1.0 - pickupNL) : +)
with {
  clean = _;
  nl = pickupNonlin;
};

// -------- Resonancia simpática (cuerdas vecinas) --------
// Banco de filtros resonantes en intervalos cromáticos cercanos
// Simula cuerdas adyacentes del Clavinet vibrando por simpatía
sympatheticResonance(x) = dry + wet
with {
  // Filtros resonantes en semitonos cercanos: -1, +1, -2, +2 semitonos
  freq1 = freq * pow(2.0, -1.0/12.0); // un semitono abajo
  freq2 = freq * pow(2.0, 1.0/12.0);  // un semitono arriba
  freq3 = freq * pow(2.0, -2.0/12.0); // dos semitonos abajo
  freq4 = freq * pow(2.0, 2.0/12.0);  // dos semitonos arriba
  
  // Q bajo para resonancia sutil
  Q = 8.0;
  
  // Señal limpia
  dry = x * (1.0 - sympathetic);
  
  // Banco de resonadores sumados
  res1 = x : fi.resonbp(freq1, Q, 1.0);
  res2 = x : fi.resonbp(freq2, Q, 1.0) : *(0.7);
  res3 = x : fi.resonbp(freq3, Q, 1.0) : *(0.5);
  res4 = x : fi.resonbp(freq4, Q, 1.0) : *(0.5);
  
  wet = (res1 + res2 + res3 + res4) * 0.25 * sympathetic;
};

// -------- Salida estéreo con soft-clipper de seguridad --------
process = sig : pickupFull : sympatheticResonance : ma.tanh <: _,_;
