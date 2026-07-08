/* ------------------------------------------------------------
name: "VCO1_V4"
Code generated with Faust 2.74.6 (https://faust.grame.fr)
Compilation options: -lang cpp -rui -nvi -ct 1 -cn _VCO1_V4 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0
------------------------------------------------------------ */

#ifndef  ___VCO1_V4_H__
#define  ___VCO1_V4_H__

#ifndef FAUSTFLOAT
#define FAUSTFLOAT float
#endif 

/* link with : "" */
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <math.h>

#ifndef FAUSTCLASS 
#define FAUSTCLASS _VCO1_V4
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


class _VCO1_V4 final : public ::faust::dsp {
	
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
	float fRec3[2];
	FAUSTFLOAT fHslider2;
	FAUSTFLOAT fHslider3;
	FAUSTFLOAT fHslider4;
	FAUSTFLOAT fHslider5;
	float fRec4[2];
	float fRec2[2];
	
 public:
	_VCO1_V4() {
	}
	
	void metadata(Meta* m) { 
		m->declare("basics.lib/name", "Faust Basic Element Library");
		m->declare("basics.lib/tabulateNd", "Copyright (C) 2023 Bart Brouns <bart@magnetophon.nl>");
		m->declare("basics.lib/version", "1.18.0");
		m->declare("compile_options", "-lang cpp -rui -nvi -ct 1 -cn _VCO1_V4 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0");
		m->declare("envelopes.lib/adsre:author", "Julius O. Smith III");
		m->declare("envelopes.lib/adsre:licence", "STK-4.3");
		m->declare("envelopes.lib/author", "GRAME");
		m->declare("envelopes.lib/copyright", "GRAME");
		m->declare("envelopes.lib/license", "LGPL with exception");
		m->declare("envelopes.lib/name", "Faust Envelope Library");
		m->declare("envelopes.lib/version", "1.3.0");
		m->declare("filename", "VCO1_V4.dsp");
		m->declare("maths.lib/author", "GRAME");
		m->declare("maths.lib/copyright", "GRAME");
		m->declare("maths.lib/license", "LGPL with exception");
		m->declare("maths.lib/name", "Faust Math Library");
		m->declare("maths.lib/version", "2.8.0");
		m->declare("name", "VCO1_V4");
		m->declare("oscillators.lib/lf_sawpos_phase_reset:author", "Bart Brouns, revised by Stéphane Letz");
		m->declare("oscillators.lib/lf_sawpos_phase_reset:licence", "STK-4.3");
		m->declare("oscillators.lib/name", "Faust Oscillator Library");
		m->declare("oscillators.lib/version", "1.5.1");
		m->declare("platform.lib/name", "Generic Platform Library");
		m->declare("platform.lib/version", "1.3.0");
		m->declare("signals.lib/name", "Faust Signal Routing Library");
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
	}
	
	void instanceConstants(int sample_rate) {
		fSampleRate = sample_rate;
		fConst0 = std::min<float>(1.92e+05f, std::max<float>(1.0f, float(fSampleRate)));
		iConst1 = int(0.0001f * fConst0);
		fConst2 = 1.0f / fConst0;
	}
	
	void instanceResetUserInterface() {
		fHslider0 = FAUSTFLOAT(1.0f);
		fButton0 = FAUSTFLOAT(0.0f);
		fHslider1 = FAUSTFLOAT(1.0f);
		fCheckbox0 = FAUSTFLOAT(0.0f);
		fHslider2 = FAUSTFLOAT(2e+01f);
		fHslider3 = FAUSTFLOAT(0.0f);
		fHslider4 = FAUSTFLOAT(0.0f);
		fHslider5 = FAUSTFLOAT(0.5f);
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
			fRec4[l6] = 0.0f;
		}
		for (int l7 = 0; l7 < 2; l7 = l7 + 1) {
			fRec2[l7] = 0.0f;
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
	
	_VCO1_V4* clone() {
		return new _VCO1_V4();
	}
	
	int getSampleRate() {
		return fSampleRate;
	}
	
	void buildUserInterface(UI* ui_interface) {
		ui_interface->openVerticalBox("VCO1_V4");
		ui_interface->addHorizontalSlider("EG Decay", &fHslider5, FAUSTFLOAT(0.5f), FAUSTFLOAT(0.005f), FAUSTFLOAT(1.0f), FAUSTFLOAT(0.001f));
		ui_interface->addHorizontalSlider("EG amount", &fHslider4, FAUSTFLOAT(0.0f), FAUSTFLOAT(0.0f), FAUSTFLOAT(4e+02f), FAUSTFLOAT(1.0f));
		ui_interface->addCheckButton("Tri-Sqr Wave", &fCheckbox0);
		ui_interface->addHorizontalSlider("decay", &fHslider1, FAUSTFLOAT(1.0f), FAUSTFLOAT(0.005f), FAUSTFLOAT(1e+01f), FAUSTFLOAT(0.001f));
		ui_interface->addHorizontalSlider("freq", &fHslider2, FAUSTFLOAT(2e+01f), FAUSTFLOAT(2e+01f), FAUSTFLOAT(1.5e+04f), FAUSTFLOAT(0.1f));
		ui_interface->addHorizontalSlider("freqKnob", &fHslider3, FAUSTFLOAT(0.0f), FAUSTFLOAT(0.0f), FAUSTFLOAT(5e+03f), FAUSTFLOAT(0.1f));
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
		float fSlow6 = std::max<float>(2e+01f, std::min<float>(1.5e+04f, float(fHslider2))) + std::max<float>(0.0f, std::min<float>(5e+03f, float(fHslider3)));
		float fSlow7 = std::max<float>(0.0f, std::min<float>(4e+02f, float(fHslider4)));
		float fSlow8 = std::max<float>(0.005f, std::min<float>(1.0f, float(fHslider5)));
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
			int iTemp6 = fSlow1 > fVec0[1];
			fRec3[0] = ((iTemp6) ? 0.0f : fRec3[1] - 0.2f * float(fRec3[1] > 0.0f)) + float(iTemp6);
			int iTemp7 = fRec3[0] > 0.0f;
			int iTemp8 = (iRec1[0] < 0) | iTemp1;
			float fTemp9 = 0.1447178f * ((iSlow2) ? ((iTemp8) ? 0.0f : fSlow8) : 0.05f);
			int iTemp10 = std::fabs(fTemp9) < 1.1920929e-07f;
			float fTemp11 = ((iTemp10) ? 0.0f : std::exp(-(fConst2 / ((iTemp10) ? 1.0f : fTemp9))));
			fRec4[0] = (1.0f - fTemp11) * ((iSlow2) ? ((iTemp8) ? fSlow4 : 0.0f) : 0.0f) + fTemp11 * fRec4[1];
			float fTemp12 = (((1 - iVec2[1]) | iTemp7) ? 0.25f : fRec2[1] + fConst2 * (fSlow6 + fSlow7 * fRec4[0]));
			fRec2[0] = fTemp12 - std::floor(fTemp12);
			float fTemp13 = fSlow0 * fRec0[0] * tanhf(4.0f * ((iSlow5) ? float(2 * (fRec2[0] < 0.5f) + (-1 - iTemp7)) : 4.0f * std::fabs(fRec2[0] + -0.5f) + -1.0f));
			output0[i0] = FAUSTFLOAT(fTemp13);
			output1[i0] = FAUSTFLOAT(fTemp13);
			fVec0[1] = fVec0[0];
			iVec1[1] = iVec1[0];
			iVec2[1] = iVec2[0];
			iRec1[1] = iRec1[0];
			fRec0[1] = fRec0[0];
			fRec3[1] = fRec3[0];
			fRec4[1] = fRec4[0];
			fRec2[1] = fRec2[0];
		}
	}

};

#ifdef FAUST_UIMACROS
	
	#define FAUST_FILE_NAME "VCO1_V4.dsp"
	#define FAUST_CLASS_NAME "_VCO1_V4"
	#define FAUST_COMPILATION_OPIONS "-lang cpp -rui -nvi -ct 1 -cn _VCO1_V4 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0"
	#define FAUST_INPUTS 0
	#define FAUST_OUTPUTS 2
	#define FAUST_ACTIVES 8
	#define FAUST_PASSIVES 0

	FAUST_ADDHORIZONTALSLIDER("EG Decay", fHslider5, 0.5f, 0.005f, 1.0f, 0.001f);
	FAUST_ADDHORIZONTALSLIDER("EG amount", fHslider4, 0.0f, 0.0f, 4e+02f, 1.0f);
	FAUST_ADDCHECKBOX("Tri-Sqr Wave", fCheckbox0);
	FAUST_ADDHORIZONTALSLIDER("decay", fHslider1, 1.0f, 0.005f, 1e+01f, 0.001f);
	FAUST_ADDHORIZONTALSLIDER("freq", fHslider2, 2e+01f, 2e+01f, 1.5e+04f, 0.1f);
	FAUST_ADDHORIZONTALSLIDER("freqKnob", fHslider3, 0.0f, 0.0f, 5e+03f, 0.1f);
	FAUST_ADDHORIZONTALSLIDER("gain", fHslider0, 1.0f, 0.0f, 1.0f, 0.001f);
	FAUST_ADDBUTTON("gate", fButton0);

	#define FAUST_LIST_ACTIVES(p) \
		p(HORIZONTALSLIDER, EG_Decay, "EG Decay", fHslider5, 0.5f, 0.005f, 1.0f, 0.001f) \
		p(HORIZONTALSLIDER, EG_amount, "EG amount", fHslider4, 0.0f, 0.0f, 4e+02f, 1.0f) \
		p(CHECKBOX, Tri-Sqr_Wave, "Tri-Sqr Wave", fCheckbox0, 0.0f, 0.0f, 1.0f, 1.0f) \
		p(HORIZONTALSLIDER, decay, "decay", fHslider1, 1.0f, 0.005f, 1e+01f, 0.001f) \
		p(HORIZONTALSLIDER, freq, "freq", fHslider2, 2e+01f, 2e+01f, 1.5e+04f, 0.1f) \
		p(HORIZONTALSLIDER, freqKnob, "freqKnob", fHslider3, 0.0f, 0.0f, 5e+03f, 0.1f) \
		p(HORIZONTALSLIDER, gain, "gain", fHslider0, 1.0f, 0.0f, 1.0f, 0.001f) \
		p(BUTTON, gate, "gate", fButton0, 0.0f, 0.0f, 1.0f, 1.0f) \

	#define FAUST_LIST_PASSIVES(p) \

#endif

#endif
