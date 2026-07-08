/* ------------------------------------------------------------
name: "VCO2_V4"
Code generated with Faust 2.74.6 (https://faust.grame.fr)
Compilation options: -lang cpp -rui -nvi -ct 1 -cn _VCO2_V4 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0
------------------------------------------------------------ */

#ifndef  ___VCO2_V4_H__
#define  ___VCO2_V4_H__

#ifndef FAUSTFLOAT
#define FAUSTFLOAT float
#endif 

/* link with : "" */
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <math.h>

#ifndef FAUSTCLASS 
#define FAUSTCLASS _VCO2_V4
#endif

#ifdef __APPLE__ 
#define exp10f __exp10f
#define exp10 __exp10
#endif

#if defined(_WIN32)
#define RESTRICT __restrict
#else
#define RESTRICT __restrict__
#endif

class _VCO2_V4SIG0 {
	
  public:
	
	int iVec3[2];
	int iRec13[2];
	
  public:
	
	int getNumInputs_VCO2_V4SIG0() {
		return 0;
	}
	int getNumOutputs_VCO2_V4SIG0() {
		return 1;
	}
	
	void instanceInit_VCO2_V4SIG0(int sample_rate) {
		for (int l15 = 0; l15 < 2; l15 = l15 + 1) {
			iVec3[l15] = 0;
		}
		for (int l16 = 0; l16 < 2; l16 = l16 + 1) {
			iRec13[l16] = 0;
		}
	}
	
	void fill_VCO2_V4SIG0(int count, float* table) {
		for (int i1 = 0; i1 < count; i1 = i1 + 1) {
			iVec3[0] = 1;
			iRec13[0] = (iVec3[1] + iRec13[1]) % 65536;
			table[i1] = std::sin(9.58738e-05f * float(iRec13[0]));
			iVec3[1] = iVec3[0];
			iRec13[1] = iRec13[0];
		}
	}

};

static _VCO2_V4SIG0* new_VCO2_V4SIG0() { return (_VCO2_V4SIG0*)new _VCO2_V4SIG0(); }
static void delete_VCO2_V4SIG0(_VCO2_V4SIG0* dsp) { delete dsp; }

static float ftbl0_VCO2_V4SIG0[65536];

class _VCO2_V4 final : public ::faust::dsp {
	
 public:
	
	FAUSTFLOAT fHslider0;
	FAUSTFLOAT fButton0;
	float fVec0[2];
	int iVec1[2];
	FAUSTFLOAT fHslider1;
	int iVec2[2];
	int iRec1[2];
	int fSampleRate;
	float fConst0;
	int iConst1;
	float fConst2;
	float fRec0[2];
	FAUSTFLOAT fCheckbox0;
	FAUSTFLOAT fCheckbox1;
	float fConst3;
	float fConst4;
	float fConst5;
	float fRec3[2];
	int iRec4[2];
	float fRec5[2];
	float fRec6[2];
	int iRec7[2];
	float fRec8[2];
	float fRec9[2];
	FAUSTFLOAT fHslider2;
	FAUSTFLOAT fHslider3;
	int iConst6;
	FAUSTFLOAT fHslider4;
	float fRec11[2];
	float fRec10[2];
	FAUSTFLOAT fHslider5;
	FAUSTFLOAT fHslider6;
	FAUSTFLOAT fHslider7;
	FAUSTFLOAT fHslider8;
	float fRec12[2];
	FAUSTFLOAT fHslider9;
	float fRec2[2];
	
 public:
	_VCO2_V4() {
	}
	
	void metadata(Meta* m) { 
		m->declare("basics.lib/name", "Faust Basic Element Library");
		m->declare("basics.lib/tabulateNd", "Copyright (C) 2023 Bart Brouns <bart@magnetophon.nl>");
		m->declare("basics.lib/version", "1.18.0");
		m->declare("compile_options", "-lang cpp -rui -nvi -ct 1 -cn _VCO2_V4 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0");
		m->declare("envelopes.lib/adsre:author", "Julius O. Smith III");
		m->declare("envelopes.lib/adsre:licence", "STK-4.3");
		m->declare("envelopes.lib/author", "GRAME");
		m->declare("envelopes.lib/copyright", "GRAME");
		m->declare("envelopes.lib/license", "LGPL with exception");
		m->declare("envelopes.lib/name", "Faust Envelope Library");
		m->declare("envelopes.lib/version", "1.3.0");
		m->declare("filename", "VCO2_V4.dsp");
		m->declare("maths.lib/author", "GRAME");
		m->declare("maths.lib/copyright", "GRAME");
		m->declare("maths.lib/license", "LGPL with exception");
		m->declare("maths.lib/name", "Faust Math Library");
		m->declare("maths.lib/version", "2.8.0");
		m->declare("name", "VCO2_V4");
		m->declare("oscillators.lib/lf_sawpos:author", "Bart Brouns, revised by Stéphane Letz");
		m->declare("oscillators.lib/lf_sawpos:licence", "STK-4.3");
		m->declare("oscillators.lib/lf_sawpos_phase_reset:author", "Bart Brouns, revised by Stéphane Letz");
		m->declare("oscillators.lib/lf_sawpos_phase_reset:licence", "STK-4.3");
		m->declare("oscillators.lib/name", "Faust Oscillator Library");
		m->declare("oscillators.lib/version", "1.5.1");
		m->declare("platform.lib/name", "Generic Platform Library");
		m->declare("platform.lib/version", "1.3.0");
		m->declare("signals.lib/name", "Faust Signal Routing Library");
		m->declare("signals.lib/smoothq:author", "Andrew John March");
		m->declare("signals.lib/smoothq:licence", "STK-4.3");
		m->declare("signals.lib/version", "1.5.0");
	}

	static constexpr int getStaticNumInputs() {
		return 0;
	}
	static constexpr int getStaticNumOutputs() {
		return 2;
	}
	int getNumInputs() {
		return 0;
	}
	int getNumOutputs() {
		return 2;
	}
	
	static void classInit(int sample_rate) {
		_VCO2_V4SIG0* sig0 = new_VCO2_V4SIG0();
		sig0->instanceInit_VCO2_V4SIG0(sample_rate);
		sig0->fill_VCO2_V4SIG0(65536, ftbl0_VCO2_V4SIG0);
		delete_VCO2_V4SIG0(sig0);
	}
	
	void instanceConstants(int sample_rate) {
		fSampleRate = sample_rate;
		fConst0 = std::min<float>(1.92e+05f, std::max<float>(1.0f, float(fSampleRate)));
		iConst1 = int(0.0001f * fConst0);
		fConst2 = 1.0f / fConst0;
		fConst3 = std::pow(0.000999001f, 1e+03f / fConst0);
		fConst4 = 0.001f * (fConst3 - 1.0f);
		fConst5 = 1.001f * (1.0f - fConst3);
		iConst6 = int(0.001f * fConst0);
	}
	
	void instanceResetUserInterface() {
		fHslider0 = FAUSTFLOAT(1.0f);
		fButton0 = FAUSTFLOAT(0.0f);
		fHslider1 = FAUSTFLOAT(1.0f);
		fCheckbox0 = FAUSTFLOAT(0.0f);
		fCheckbox1 = FAUSTFLOAT(0.0f);
		fHslider2 = FAUSTFLOAT(4e+01f);
		fHslider3 = FAUSTFLOAT(2e+02f);
		fHslider4 = FAUSTFLOAT(0.075f);
		fHslider5 = FAUSTFLOAT(0.0f);
		fHslider6 = FAUSTFLOAT(2e+01f);
		fHslider7 = FAUSTFLOAT(0.0f);
		fHslider8 = FAUSTFLOAT(0.075f);
		fHslider9 = FAUSTFLOAT(0.0f);
	}
	
	void instanceClear() {
		for (int l0 = 0; l0 < 2; l0 = l0 + 1) {
			fVec0[l0] = 0.0f;
		}
		for (int l1 = 0; l1 < 2; l1 = l1 + 1) {
			iVec1[l1] = 0;
		}
		for (int l2 = 0; l2 < 2; l2 = l2 + 1) {
			iVec2[l2] = 0;
		}
		for (int l3 = 0; l3 < 2; l3 = l3 + 1) {
			iRec1[l3] = 0;
		}
		for (int l4 = 0; l4 < 2; l4 = l4 + 1) {
			fRec0[l4] = 0.0f;
		}
		for (int l5 = 0; l5 < 2; l5 = l5 + 1) {
			fRec3[l5] = 0.0f;
		}
		for (int l6 = 0; l6 < 2; l6 = l6 + 1) {
			iRec4[l6] = 0;
		}
		for (int l7 = 0; l7 < 2; l7 = l7 + 1) {
			fRec5[l7] = 0.0f;
		}
		for (int l8 = 0; l8 < 2; l8 = l8 + 1) {
			fRec6[l8] = 0.0f;
		}
		for (int l9 = 0; l9 < 2; l9 = l9 + 1) {
			iRec7[l9] = 0;
		}
		for (int l10 = 0; l10 < 2; l10 = l10 + 1) {
			fRec8[l10] = 0.0f;
		}
		for (int l11 = 0; l11 < 2; l11 = l11 + 1) {
			fRec9[l11] = 0.0f;
		}
		for (int l12 = 0; l12 < 2; l12 = l12 + 1) {
			fRec11[l12] = 0.0f;
		}
		for (int l13 = 0; l13 < 2; l13 = l13 + 1) {
			fRec10[l13] = 0.0f;
		}
		for (int l14 = 0; l14 < 2; l14 = l14 + 1) {
			fRec12[l14] = 0.0f;
		}
		for (int l17 = 0; l17 < 2; l17 = l17 + 1) {
			fRec2[l17] = 0.0f;
		}
	}
	
	void init(int sample_rate) {
		classInit(sample_rate);
		instanceInit(sample_rate);
	}
	
	void instanceInit(int sample_rate) {
		instanceConstants(sample_rate);
		instanceResetUserInterface();
		instanceClear();
	}
	
	_VCO2_V4* clone() {
		return new _VCO2_V4();
	}
	
	int getSampleRate() {
		return fSampleRate;
	}
	
	void buildUserInterface(UI* ui_interface) {
		ui_interface->openVerticalBox("VCO2_V4");
		ui_interface->addHorizontalSlider("Decay", &fHslider1, FAUSTFLOAT(1.0f), FAUSTFLOAT(0.005f), FAUSTFLOAT(1e+01f), FAUSTFLOAT(0.001f));
		ui_interface->addHorizontalSlider("EG Amount", &fHslider7, FAUSTFLOAT(0.0f), FAUSTFLOAT(0.0f), FAUSTFLOAT(4e+02f), FAUSTFLOAT(1.0f));
		ui_interface->addHorizontalSlider("EG Decay", &fHslider8, FAUSTFLOAT(0.075f), FAUSTFLOAT(0.005f), FAUSTFLOAT(1.0f), FAUSTFLOAT(0.001f));
		ui_interface->addHorizontalSlider("FM amount", &fHslider9, FAUSTFLOAT(0.0f), FAUSTFLOAT(0.0f), FAUSTFLOAT(1e+03f), FAUSTFLOAT(0.01f));
		ui_interface->addCheckButton("Hs On-Off", &fCheckbox1);
		ui_interface->addCheckButton("Tri-Sqr Wave", &fCheckbox0);
		ui_interface->addHorizontalSlider("VCO1- Decay", &fHslider4, FAUSTFLOAT(0.075f), FAUSTFLOAT(0.005f), FAUSTFLOAT(1.0f), FAUSTFLOAT(0.001f));
		ui_interface->addHorizontalSlider("VCO1- EG amount", &fHslider3, FAUSTFLOAT(2e+02f), FAUSTFLOAT(0.0f), FAUSTFLOAT(4e+02f), FAUSTFLOAT(1.0f));
		ui_interface->addHorizontalSlider("VCO1- Freq", &fHslider2, FAUSTFLOAT(4e+01f), FAUSTFLOAT(0.0f), FAUSTFLOAT(5e+03f), FAUSTFLOAT(0.1f));
		ui_interface->addHorizontalSlider("freq", &fHslider6, FAUSTFLOAT(2e+01f), FAUSTFLOAT(2e+01f), FAUSTFLOAT(1.5e+04f), FAUSTFLOAT(0.1f));
		ui_interface->addHorizontalSlider("freqKnob", &fHslider5, FAUSTFLOAT(0.0f), FAUSTFLOAT(0.0f), FAUSTFLOAT(5e+03f), FAUSTFLOAT(0.1f));
		ui_interface->addHorizontalSlider("gain", &fHslider0, FAUSTFLOAT(1.0f), FAUSTFLOAT(0.0f), FAUSTFLOAT(1.0f), FAUSTFLOAT(0.001f));
		ui_interface->addButton("gate", &fButton0);
		ui_interface->closeBox();
	}
	
	void compute(int count, FAUSTFLOAT** RESTRICT inputs, FAUSTFLOAT** RESTRICT outputs) {
		FAUSTFLOAT* output0 = outputs[0];
		FAUSTFLOAT* output1 = outputs[1];
		float fSlow0 = 0.3f * std::max<float>(0.0f, std::min<float>(1.0f, float(fHslider0)));
		float fSlow1 = float(fButton0);
		int iSlow2 = fSlow1 > 0.0f;
		float fSlow3 = std::max<float>(0.005f, std::min<float>(1e+01f, float(fHslider1)));
		float fSlow4 = float(iSlow2);
		int iSlow5 = int(float(fCheckbox0));
		int iSlow6 = int(float(fCheckbox1));
		float fSlow7 = std::max<float>(0.0f, std::min<float>(5e+03f, float(fHslider2)));
		float fSlow8 = std::max<float>(0.0f, std::min<float>(4e+02f, float(fHslider3)));
		float fSlow9 = std::max<float>(0.005f, std::min<float>(1.0f, float(fHslider4)));
		float fSlow10 = std::max<float>(0.0f, std::min<float>(5e+03f, float(fHslider5))) + std::max<float>(2e+01f, std::min<float>(1.5e+04f, float(fHslider6)));
		float fSlow11 = std::max<float>(0.0f, std::min<float>(4e+02f, float(fHslider7)));
		float fSlow12 = std::max<float>(0.005f, std::min<float>(1.0f, float(fHslider8)));
		float fSlow13 = std::max<float>(0.0f, std::min<float>(1e+03f, float(fHslider9)));
		for (int i0 = 0; i0 < count; i0 = i0 + 1) {
			fVec0[0] = fSlow1;
			iVec1[0] = iSlow2;
			iVec2[0] = 1;
			iRec1[0] = iSlow2 * (iRec1[1] + 1);
			int iTemp0 = iSlow2 - iVec1[1];
			int iTemp1 = iTemp0 * (iTemp0 > 0);
			int iTemp2 = (iRec1[0] < iConst1) | iTemp1;
			float fTemp3 = 0.1447178f * ((iSlow2) ? ((iTemp2) ? 0.0001f : fSlow3) : fSlow3);
			int iTemp4 = std::fabs(fTemp3) < 1.1920929e-07f;
			float fTemp5 = ((iTemp4) ? 0.0f : std::exp(-(fConst2 / ((iTemp4) ? 1.0f : fTemp3))));
			fRec0[0] = (1.0f - fTemp5) * ((iSlow2) ? ((iTemp2) ? fSlow4 : 0.0f) : 0.0f) + fTemp5 * fRec0[1];
			int iTemp6 = 1 - iVec2[1];
			int iTemp7 = fSlow1 > fVec0[1];
			int iTemp8 = iRec4[1] != iTemp7;
			float fTemp9 = float(iTemp7);
			float fTemp10 = ((iTemp8) ? fRec9[1] : fRec5[1]);
			int iTemp11 = ((iTemp8) ? fTemp9 > fTemp10 : iRec7[1]);
			float fTemp12 = ((iTemp8) ? ((iTemp11) ? fConst5 : fConst4) : fRec3[1]);
			fRec3[0] = fTemp12;
			iRec4[0] = iTemp7;
			fRec5[0] = fTemp10;
			float fTemp13 = ((iTemp8) ? std::fabs(fTemp9 - fTemp10) : fRec6[1]);
			fRec6[0] = fTemp13;
			iRec7[0] = iTemp11;
			float fTemp14 = fTemp12 + fConst3 * fRec8[1];
			float fTemp15 = ((iTemp11) ? ((iTemp8) ? 0.0f : std::min<float>(1.0f, fTemp14)) : ((iTemp8) ? 1.0f : std::max<float>(0.0f, fTemp14)));
			fRec8[0] = fTemp15;
			float fTemp16 = fTemp13 * fTemp15;
			fRec9[0] = ((iTemp11) ? fTemp10 + fTemp16 : fTemp9 + fTemp16);
			int iTemp17 = (iRec1[0] < iConst6) | iTemp1;
			float fTemp18 = 0.1447178f * ((iSlow2) ? ((iTemp17) ? 0.001f : fSlow9) : 0.05f);
			int iTemp19 = std::fabs(fTemp18) < 1.1920929e-07f;
			float fTemp20 = ((iTemp19) ? 0.0f : std::exp(-(fConst2 / ((iTemp19) ? 1.0f : fTemp18))));
			float fTemp21 = ((iSlow2) ? ((iTemp17) ? fSlow4 : 0.0f) : 0.0f);
			fRec11[0] = (1.0f - fTemp20) * fTemp21 + fTemp20 * fRec11[1];
			float fTemp22 = ((iTemp6) ? 0.0f : fRec10[1] + fConst2 * (fSlow7 + fSlow8 * fRec11[0]));
			fRec10[0] = fTemp22 - std::floor(fTemp22);
			float fTemp23 = 0.1447178f * ((iSlow2) ? ((iTemp17) ? 0.001f : fSlow12) : 0.05f);
			int iTemp24 = std::fabs(fTemp23) < 1.1920929e-07f;
			float fTemp25 = ((iTemp24) ? 0.0f : std::exp(-(fConst2 / ((iTemp24) ? 1.0f : fTemp23))));
			fRec12[0] = fTemp21 * (1.0f - fTemp25) + fTemp25 * fRec12[1];
			float fTemp26 = ((iTemp6 | int(((iSlow6) ? float(((fRec10[0] - fRec10[1]) < 0.0f) | int(fRec9[0])) : fRec9[0]))) ? 0.25f : fRec2[1] + fConst2 * (fSlow10 + fSlow11 * fRec12[0] + fSlow13 * ftbl0_VCO2_V4SIG0[std::max<int>(0, std::min<int>(int(65536.0f * fRec10[0]), 65535))]));
			fRec2[0] = fTemp26 - std::floor(fTemp26);
			float fTemp27 = fSlow0 * fRec0[0] * tanhf(4.0f * ((iSlow5) ? float(2 * (fRec2[0] > 0.5f) + -1) : 4.0f * std::fabs(fRec2[0] + -0.5f) + -1.0f));
			output0[i0] = FAUSTFLOAT(fTemp27);
			output1[i0] = FAUSTFLOAT(fTemp27);
			fVec0[1] = fVec0[0];
			iVec1[1] = iVec1[0];
			iVec2[1] = iVec2[0];
			iRec1[1] = iRec1[0];
			fRec0[1] = fRec0[0];
			fRec3[1] = fRec3[0];
			iRec4[1] = iRec4[0];
			fRec5[1] = fRec5[0];
			fRec6[1] = fRec6[0];
			iRec7[1] = iRec7[0];
			fRec8[1] = fRec8[0];
			fRec9[1] = fRec9[0];
			fRec11[1] = fRec11[0];
			fRec10[1] = fRec10[0];
			fRec12[1] = fRec12[0];
			fRec2[1] = fRec2[0];
		}
	}

};

#ifdef FAUST_UIMACROS
	
	#define FAUST_FILE_NAME "VCO2_V4.dsp"
	#define FAUST_CLASS_NAME "_VCO2_V4"
	#define FAUST_COMPILATION_OPIONS "-lang cpp -rui -nvi -ct 1 -cn _VCO2_V4 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0"
	#define FAUST_INPUTS 0
	#define FAUST_OUTPUTS 2
	#define FAUST_ACTIVES 13
	#define FAUST_PASSIVES 0

	FAUST_ADDHORIZONTALSLIDER("Decay", fHslider1, 1.0f, 0.005f, 1e+01f, 0.001f);
	FAUST_ADDHORIZONTALSLIDER("EG Amount", fHslider7, 0.0f, 0.0f, 4e+02f, 1.0f);
	FAUST_ADDHORIZONTALSLIDER("EG Decay", fHslider8, 0.075f, 0.005f, 1.0f, 0.001f);
	FAUST_ADDHORIZONTALSLIDER("FM amount", fHslider9, 0.0f, 0.0f, 1e+03f, 0.01f);
	FAUST_ADDCHECKBOX("Hs On-Off", fCheckbox1);
	FAUST_ADDCHECKBOX("Tri-Sqr Wave", fCheckbox0);
	FAUST_ADDHORIZONTALSLIDER("VCO1- Decay", fHslider4, 0.075f, 0.005f, 1.0f, 0.001f);
	FAUST_ADDHORIZONTALSLIDER("VCO1- EG amount", fHslider3, 2e+02f, 0.0f, 4e+02f, 1.0f);
	FAUST_ADDHORIZONTALSLIDER("VCO1- Freq", fHslider2, 4e+01f, 0.0f, 5e+03f, 0.1f);
	FAUST_ADDHORIZONTALSLIDER("freq", fHslider6, 2e+01f, 2e+01f, 1.5e+04f, 0.1f);
	FAUST_ADDHORIZONTALSLIDER("freqKnob", fHslider5, 0.0f, 0.0f, 5e+03f, 0.1f);
	FAUST_ADDHORIZONTALSLIDER("gain", fHslider0, 1.0f, 0.0f, 1.0f, 0.001f);
	FAUST_ADDBUTTON("gate", fButton0);

	#define FAUST_LIST_ACTIVES(p) \
		p(HORIZONTALSLIDER, Decay, "Decay", fHslider1, 1.0f, 0.005f, 1e+01f, 0.001f) \
		p(HORIZONTALSLIDER, EG_Amount, "EG Amount", fHslider7, 0.0f, 0.0f, 4e+02f, 1.0f) \
		p(HORIZONTALSLIDER, EG_Decay, "EG Decay", fHslider8, 0.075f, 0.005f, 1.0f, 0.001f) \
		p(HORIZONTALSLIDER, FM_amount, "FM amount", fHslider9, 0.0f, 0.0f, 1e+03f, 0.01f) \
		p(CHECKBOX, Hs_On-Off, "Hs On-Off", fCheckbox1, 0.0f, 0.0f, 1.0f, 1.0f) \
		p(CHECKBOX, Tri-Sqr_Wave, "Tri-Sqr Wave", fCheckbox0, 0.0f, 0.0f, 1.0f, 1.0f) \
		p(HORIZONTALSLIDER, VCO1-_Decay, "VCO1- Decay", fHslider4, 0.075f, 0.005f, 1.0f, 0.001f) \
		p(HORIZONTALSLIDER, VCO1-_EG_amount, "VCO1- EG amount", fHslider3, 2e+02f, 0.0f, 4e+02f, 1.0f) \
		p(HORIZONTALSLIDER, VCO1-_Freq, "VCO1- Freq", fHslider2, 4e+01f, 0.0f, 5e+03f, 0.1f) \
		p(HORIZONTALSLIDER, freq, "freq", fHslider6, 2e+01f, 2e+01f, 1.5e+04f, 0.1f) \
		p(HORIZONTALSLIDER, freqKnob, "freqKnob", fHslider5, 0.0f, 0.0f, 5e+03f, 0.1f) \
		p(HORIZONTALSLIDER, gain, "gain", fHslider0, 1.0f, 0.0f, 1.0f, 0.001f) \
		p(BUTTON, gate, "gate", fButton0, 0.0f, 0.0f, 1.0f, 1.0f) \

	#define FAUST_LIST_PASSIVES(p) \

#endif

#endif
