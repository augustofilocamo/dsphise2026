declare name "Clavinet_DWG_Gabrielli2013";
declare author "you";
declare license "MIT";

import("stdfaust.lib");

// =================== UI ===================
gate      = button("gate");
useMIDI   = checkbox("MIDI");
mkey      = ba.midikey; mvel = ba.midivelocity/127.0; mgate = ba.midigate;

freqUI    = hslider("freq[unit:Hz]", 110, 27.5, 1760, 0.01);
velUI     = hslider("velocity", 0.8, 0, 1, 0.001);
Bcoef     = hslider("inharmonicity B", 2e-4, 0, 8e-4, 1e-6); // tabla en paper, acá ajustable
lossBase  = hslider("loss(base)", 0.004, 0.0005, 0.02, 0.0001);
rRipple   = hslider("ripple r", -0.004, -0.006, -0.001, 0.0001); // ~[-0.006..-0.001]
Rrate     = hslider("ripple R_rate", 0.45, 0.33, 0.5, 0.001);   // ~[1/3..1/2]
pickupSel = nentry("pickup [enum: Center,Bridge,SumIP,SumOP]", 2, 0, 3, 1);
pposC     = hslider("centerPickupPos", 0.55, 0.45, 0.65, 0.001); // fracción de la cuerda
pposB     = hslider("bridgePickupPos", 0.92, 0.85, 0.98, 0.001);
excScale  = hslider("excitation gain", 1.0, 0.3, 2.0, 0.001);
excWidth  = hslider("excitation width (samples @48k)", 600, 120, 1600, 1); // se estira por dinámica
relDamp   = hslider("release loss boost", 0.8, 0, 1, 0.001);
keyKnock  = hslider("tangentKnock", 0.15, 0, 1, 0.001);

toneSoft     = checkbox("Tone/Soft");
toneMedium   = checkbox("Tone/Medium");
toneTreble   = checkbox("Tone/Treble");
toneBrilliant= checkbox("Tone/Brilliant");
outGain   = hslider("output[dB]", -6, -24, +12, 0.1);

// MIDI or UI
freqEff  = select2(useMIDI>0.5, freqUI, ba.midikey2hz(mkey));
velEff   = select2(useMIDI>0.5, max(0.05, velUI), max(0.05, mvel));
gateEff  = select2(useMIDI>0.5, gate, mgate);

// =================== Utilidades ===================
sr  = ma.SR;
twoPi = 2.0*ma.PI;

fracDelay(n) = de.fdelay(n+2, n); // fracc. con Lagrange orden 2 (rápido)

leakyIntegrator(x) = fi.dcblocker(1) : + ~ *(0.9997); // integrador con fuga (paper sugiere leaky)

// Derivador 1er orden (para emular pickup como derivada de desplazamiento)
diff1(x) = x - x@(1);

// =================== Excitación (Sec. 3.2) ===================
// ramp poly P=6: coef en orden descendente del paper
poly6(x) = (((((( -2.69e-8*x + 2.53e-6 )*x - 9.54e-5 )*x + 1.74e-3 )*x
              - 1.44e-2 )*x + 4.50e-2 )*x - 3.50e-2);
// Pulso simétrico: rampa y su espejo (triángulo suave)
pulseShape(n) = with {
  t = (ba.count(n) / float(n)); // 0..1
  ramp = poly6(t);
  mirror = poly6(1.0 - t);
} : (ramp + mirror);

excitation(g, widthSam, vel) = (pulseShape(int(widthSam)) * excScale * vel * g);

// Click/Knock mecánico breve
tangentKnock(g) = no.noise * fi.highpass(1, 2000) * fi.lowpass(1, 6000)
                   * en.ar(0,0.0005,0.004,0.02,g) * keyKnock;

// =================== Lazo DWG de cuerda (Sec. 3.1) ===================
// Longitud de retardo objetivo
Ltarget(f0) = sr/f0; // muestras

// Pérdidas (filtro 1º orden simple)
lossFilt(g) = *(g) : fi.onepole(g); // barato, ajustable con lossEff

// Dispersión (aprox. con allpass 1º orden param. por B): beta ~ k*B*f0
dispersionAP(B,f0) = fi.allpass_f1(((B*10.0)*f0) : min(0.499) : max(-0.499)); // aproximación rápida

// Ripple filter (feedforward corto dentro del lazo): y = x + r*x@R
ripple(r, Rsam) = +( *(r) : @(int(Rsam)) );

// Beating EQ (hasta 3 parciales) — costo bajo
beq(f) = fi.resonbp(f, 0.995) * (abs(os.osc(f)) : (_<:_,_) : *(0.0),*(1.0) : +); // |cos(2πfn)| ~ mod

// =================== Comb de pickup + no linealidad (Sec. 3.3) ===================
// Delay de peine por ida/vuelta desde pickup hasta terminación
combPickup(Ltot, ppos) = with {
  d = (1.0 - ppos) * Ltot * 2.0; // ida+vuelta hacia el puente (ganancia -1)
} : (+ : @(int(d))) ~ *(0) : _; // estructura feedforward: y = in - in@d

// No linealidad polinómica pickup (Tabla 2 – polinomio grado 4 en desplazamiento)
pickupPoly(x) = ((((1.817e5*x - 9.508e3)*x + 1.818e2)*x - 1.544)*x + 0.7951);

// Cadena pickup: integrar (vel->desp) -> NL -> derivar (desp->vel)
pickupNL(x) = x : leakyIntegrator : pickupPoly : diff1;

// Selector de pickups (C, B, suma en fase / fuera de fase)
mixPickups(sel, c, b) = select4(sel, c, b, (c+b)*0.5, (c-b)*0.5);

// =================== Release: caída -3 semitonos + más pérdidas ===================
dropSemis = 3.0;
relFactor = pow(2.0, dropSemis/12.0); // aumenta L (baja f)
relEnv(g) = 1.0 - en.ar(0,0.001,0.02,0.15,g); // sube al soltar

// =================== Nota ===================
process = _
with {
  // señales de control
  gTrig = gateEff;

  f0      = freqEff;
  L0      = Ltarget(f0);
  Ldecay  = L0 * (1.0 + (relFactor-1.0)*(1.0 - relEnv(gTrig))); // estable durante sustain; salta al release
  lossEff = (1.0 - lossBase) * (1.0 - relDamp*(1.0 - relEnv(gTrig))); // más pérdidas al soltar

  // construir lazo DWG: fraccDelay + pérdida + dispersión + ripple
  // loop: z^-L * loss * dispersion -> ripple
  // Separa una parte del lazo para Ripple de longitud R
  Rlen   = max(1.0, Rrate * Ldecay);
  Lmain  = max(2.0, Ldecay - Rlen);

  // Lazo principal
  dwg(x) = x
          : fracDelay(Lmain)
          : lossFilt(1.0 - lossBase)
          : dispersionAP(Bcoef, f0);

  // Ripple (feedforward corto)
  rippleBlk(x) = x : ripple(rRipple, Rlen);

  // Excitación (señal de ataque) + knock
  excSig = excitation(gTrig, excWidth * (1.2 - 0.5*velEff), velEff)
         + tangentKnock(gTrig);

  // Integración: excitación entra como onda de velocidad (paper)
  // Lazo cerrado
  vWave = +(excSig) : (dwg : rippleBlk) ~ _;

  // Señales hacia pickups (antes de NL son velocidad; integrar para NL)
  // Cálculo de peine por posición relativa
  cPick = combPickup(Ldecay, pposC) : pickupNL;
  bPick = combPickup(Ldecay, pposB) : pickupNL;

  // Aplicar peine a misma señal (vWave) por cada pickup
  sigC = vWave : cPick;
  sigB = vWave : bPick;

  // Mezcla según selector
  pickOut = mixPickups(pickupSel, sigC, sigB);

  // Tono (stack simple IIR aproximado; cada switch habilita una celda)
  // Simplificaciones de Tabla 3 (biquad/shelving aproximados)
  zsoft(x)   = fi.lowpass(2, 350)  * x;
  zmedium(x) = fi.highpass(1, 500) * fi.lowpass(1, 2500) * x;
  ztreble(x) = fi.highpass(2, 1500) * x;
  zbrill(x)  = fi.highpass(2, 3500) * x;

  toneOut = pickOut
          : (toneSoft>0.5 ? zsoft : _)
          : (toneMedium>0.5 ? zmedium : _)
          : (toneTreble>0.5 ? ztreble : _)
          : (toneBrilliant>0.5 ? zbrill : _);

} : *(ba.db2linear(outGain)) <: _,_;
