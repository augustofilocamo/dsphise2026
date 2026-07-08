/* ------------------------------------------------------------
name: "VCF_V2"
Code generated with Faust 2.74.6 (https://faust.grame.fr)
Compilation options: -lang cpp -rui -nvi -ct 1 -cn _VCF_V2 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0
------------------------------------------------------------ */

#ifndef  ___VCF_V2_H__
#define  ___VCF_V2_H__

#ifndef FAUSTFLOAT
#define FAUSTFLOAT float
#endif 

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <math.h>

#ifndef FAUSTCLASS 
#define FAUSTCLASS _VCF_V2
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

static float _VCF_V2_faustpower2_f(float value) {
	return value * value;
}

class _VCF_V2 final : public ::faust::dsp {
	
 public:
	
	FAUSTFLOAT fCheckbox0;
	int fSampleRate;
	float fConst0;
	float fConst1;
	FAUSTFLOAT fHslider0;
	float fConst2;
	FAUSTFLOAT fHslider1;
	float fConst3;
	float fRec4[2];
	FAUSTFLOAT fButton0;
	int iVec0[2];
	FAUSTFLOAT fHslider2;
	int iRec6[2];
	int iConst4;
	float fConst5;
	float fRec5[2];
	FAUSTFLOAT fHslider3;
	float fRec0[2];
	float fRec1[2];
	float fRec2[2];
	float fRec7[2];
	float fRec8[2];
	float fRec9[2];
	
 public:
	_VCF_V2() {
	}
	
	void metadata(Meta* m) { 
		m->declare("basics.lib/name", "Faust Basic Element Library");
		m->declare("basics.lib/tabulateNd", "Copyright (C) 2023 Bart Brouns <bart@magnetophon.nl>");
		m->declare("basics.lib/version", "1.18.0");
		m->declare("compile_options", "-lang cpp -rui -nvi -ct 1 -cn _VCF_V2 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0");
		m->declare("envelopes.lib/adsre:author", "Julius O. Smith III");
		m->declare("envelopes.lib/adsre:licence", "STK-4.3");
		m->declare("envelopes.lib/author", "GRAME");
		m->declare("envelopes.lib/copyright", "GRAME");
		m->declare("envelopes.lib/license", "LGPL with exception");
		m->declare("envelopes.lib/name", "Faust Envelope Library");
		m->declare("envelopes.lib/version", "1.3.0");
		m->declare("filename", "VCF_V2.dsp");
		m->declare("maths.lib/author", "GRAME");
		m->declare("maths.lib/copyright", "GRAME");
		m->declare("maths.lib/license", "LGPL with exception");
		m->declare("maths.lib/name", "Faust Math Library");
		m->declare("maths.lib/version", "2.8.0");
		m->declare("name", "VCF_V2");
		m->declare("platform.lib/name", "Generic Platform Library");
		m->declare("platform.lib/version", "1.3.0");
		m->declare("signals.lib/name", "Faust Signal Routing Library");
		m->declare("signals.lib/version", "1.5.0");
		m->declare("vaeffects.lib/korg35HPF:author", "Eric Tarr");
		m->declare("vaeffects.lib/korg35HPF:license", "MIT-style STK-4.3 license");
		m->declare("vaeffects.lib/moogHalfLadder:author", "Eric Tarr");
		m->declare("vaeffects.lib/moogHalfLadder:license", "MIT-style STK-4.3 license");
		m->declare("vaeffects.lib/name", "Faust Virtual Analog Filter Effect Library");
		m->declare("vaeffects.lib/version", "1.2.1");
	}

	static constexpr int getStaticNumInputs() {
		return 1;
	}
	static constexpr int getStaticNumOutputs() {
		return 2;
	}
	int getNumInputs() {
		return 1;
	}
	int getNumOutputs() {
		return 2;
	}
	
	static void classInit(int sample_rate) {
	}
	
	void instanceConstants(int sample_rate) {
		fSampleRate = sample_rate;
		fConst0 = std::min<float>(1.92e+05f, std::max<float>(1.0f, float(fSampleRate)));
		fConst1 = 6.2831855f / fConst0;
		fConst2 = 44.1f / fConst0;
		fConst3 = 1.0f - fConst2;
		iConst4 = int(0.01f * fConst0);
		fConst5 = 1.0f / fConst0;
	}
	
	void instanceResetUserInterface() {
		fCheckbox0 = FAUSTFLOAT(0.0f);
		fHslider0 = FAUSTFLOAT(0.5f);
		fHslider1 = FAUSTFLOAT(0.5f);
		fButton0 = FAUSTFLOAT(0.0f);
		fHslider2 = FAUSTFLOAT(0.5f);
		fHslider3 = FAUSTFLOAT(1.0f);
	}
	
	void instanceClear() {
		for (int l0 = 0; l0 < 2; l0 = l0 + 1) {
			fRec4[l0] = 0.0f;
		}
		for (int l1 = 0; l1 < 2; l1 = l1 + 1) {
			iVec0[l1] = 0;
		}
		for (int l2 = 0; l2 < 2; l2 = l2 + 1) {
			iRec6[l2] = 0;
		}
		for (int l3 = 0; l3 < 2; l3 = l3 + 1) {
			fRec5[l3] = 0.0f;
		}
		for (int l4 = 0; l4 < 2; l4 = l4 + 1) {
			fRec0[l4] = 0.0f;
		}
		for (int l5 = 0; l5 < 2; l5 = l5 + 1) {
			fRec1[l5] = 0.0f;
		}
		for (int l6 = 0; l6 < 2; l6 = l6 + 1) {
			fRec2[l6] = 0.0f;
		}
		for (int l7 = 0; l7 < 2; l7 = l7 + 1) {
			fRec7[l7] = 0.0f;
		}
		for (int l8 = 0; l8 < 2; l8 = l8 + 1) {
			fRec8[l8] = 0.0f;
		}
		for (int l9 = 0; l9 < 2; l9 = l9 + 1) {
			fRec9[l9] = 0.0f;
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
	
	_VCF_V2* clone() {
		return new _VCF_V2();
	}
	
	int getSampleRate() {
		return fSampleRate;
	}
	
	void buildUserInterface(UI* ui_interface) {
		ui_interface->openVerticalBox("VCF_V2");
		ui_interface->addHorizontalSlider("Decay", &fHslider2, FAUSTFLOAT(0.5f), FAUSTFLOAT(0.0f), FAUSTFLOAT(2e+01f), FAUSTFLOAT(0.01f));
		ui_interface->addCheckButton("Lp-Hp", &fCheckbox0);
		ui_interface->addHorizontalSlider("egAmount", &fHslider0, FAUSTFLOAT(0.5f), FAUSTFLOAT(0.0f), FAUSTFLOAT(1.0f), FAUSTFLOAT(0.01f));
		ui_interface->addButton("gate", &fButton0);
		ui_interface->addHorizontalSlider("normFreq", &fHslider1, FAUSTFLOAT(0.5f), FAUSTFLOAT(0.0f), FAUSTFLOAT(1.0f), FAUSTFLOAT(0.001f));
		ui_interface->addHorizontalSlider("q", &fHslider3, FAUSTFLOAT(1.0f), FAUSTFLOAT(0.4f), FAUSTFLOAT(25.0f), FAUSTFLOAT(0.01f));
		ui_interface->closeBox();
	}
	
	void compute(int count, FAUSTFLOAT** RESTRICT inputs, FAUSTFLOAT** RESTRICT outputs) {
		FAUSTFLOAT* input0 = inputs[0];
		FAUSTFLOAT* output0 = outputs[0];
		FAUSTFLOAT* output1 = outputs[1];
		int iSlow0 = int(float(fCheckbox0));
		float fSlow1 = 3.0f * std::max<float>(0.0f, std::min<float>(1.0f, float(fHslider0)));
		float fSlow2 = fConst2 * std::max<float>(0.0f, std::min<float>(1.0f, float(fHslider1)));
		int iSlow3 = float(fButton0) > 0.0f;
		float fSlow4 = std::max<float>(0.0f, std::min<float>(2e+01f, float(fHslider2)));
		float fSlow5 = float(iSlow3);
		float fSlow6 = std::max<float>(0.4f, std::min<float>(25.0f, float(fHslider3)));
		float fSlow7 = fSlow6 + -0.70710677f;
		float fSlow8 = 0.0823286f * fSlow7;
		float fSlow9 = 0.21521823f * (0.16666667f * fSlow6 + -0.70710677f);
		for (int i0 = 0; i0 < count; i0 = i0 + 1) {
			fRec4[0] = fSlow2 + fConst3 * fRec4[1];
			iVec0[0] = iSlow3;
			iRec6[0] = iSlow3 * (iRec6[1] + 1);
			int iTemp0 = iSlow3 - iVec0[1];
			int iTemp1 = (iRec6[0] < iConst4) | (iTemp0 * (iTemp0 > 0));
			float fTemp2 = 0.1447178f * ((iSlow3) ? ((iTemp1) ? 0.01f : fSlow4) : fSlow4);
			int iTemp3 = std::fabs(fTemp2) < 1.1920929e-07f;
			float fTemp4 = ((iTemp3) ? 0.0f : std::exp(-(fConst5 / ((iTemp3) ? 1.0f : fTemp2))));
			fRec5[0] = (1.0f - fTemp4) * ((iSlow3) ? ((iTemp1) ? fSlow5 : 0.0f) : 0.0f) + fTemp4 * fRec5[1];
			float fTemp5 = std::tan(fConst1 * std::pow(1e+01f, fSlow1 * fRec4[0] * fRec5[0] + 1.0f));
			float fTemp6 = float(input0[i0]);
			float fTemp7 = fTemp5 + 1.0f;
			float fTemp8 = fTemp5 / fTemp7;
			float fTemp9 = 2.0f * fTemp8 + -1.0f;
			float fTemp10 = fTemp5 * ((fTemp6 - fSlow7 * ((0.0823286f * fRec1[1] * fTemp9 + 0.1646572f * fRec0[1] + 0.0823286f * (fTemp5 * fTemp9 * fRec2[1] / fTemp7)) / fTemp7)) / (fSlow8 * (_VCF_V2_faustpower2_f(fTemp5) * fTemp9 / _VCF_V2_faustpower2_f(fTemp7)) + 1.0f) - fRec2[1]) / fTemp7;
			float fTemp11 = fTemp5 * (fRec2[1] + fTemp10 - fRec1[1]) / fTemp7;
			float fTemp12 = fRec1[1] + fTemp11;
			float fTemp13 = fTemp5 * (fTemp12 - fRec0[1]) / fTemp7;
			fRec0[0] = fRec0[1] + 2.0f * fTemp13;
			fRec1[0] = fRec1[1] + 2.0f * fTemp11;
			fRec2[0] = fRec2[1] + 2.0f * fTemp10;
			float fRec3 = 2.0f * (fRec0[1] + fTemp13) - fTemp12;
			float fTemp14 = fTemp5 * (fTemp6 - fRec9[1]);
			float fTemp15 = (fTemp6 - (fRec9[1] + (fTemp14 - fRec7[1] + fTemp5 * fRec8[1] / fTemp7) / fTemp7)) / (fSlow9 * (fTemp5 * (fTemp8 + -1.0f) / fTemp7) + 1.0f);
			float fTemp16 = fSlow9 * fTemp15;
			float fTemp17 = fTemp5 * (fTemp16 - fRec8[1]) / fTemp7;
			fRec7[0] = fRec7[1] + 2.0f * (fTemp5 * (fTemp16 - (fRec8[1] + fRec7[1] + fTemp17)) / fTemp7);
			fRec8[0] = fRec8[1] + 2.0f * fTemp17;
			fRec9[0] = fRec9[1] + 2.0f * (fTemp14 / fTemp7);
			float fRec10 = fTemp15;
			float fTemp18 = ((iSlow0) ? fRec10 : fRec3);
			output0[i0] = FAUSTFLOAT(fTemp18);
			output1[i0] = FAUSTFLOAT(fTemp18);
			fRec4[1] = fRec4[0];
			iVec0[1] = iVec0[0];
			iRec6[1] = iRec6[0];
			fRec5[1] = fRec5[0];
			fRec0[1] = fRec0[0];
			fRec1[1] = fRec1[0];
			fRec2[1] = fRec2[0];
			fRec7[1] = fRec7[0];
			fRec8[1] = fRec8[0];
			fRec9[1] = fRec9[0];
		}
	}

};

#ifdef FAUST_UIMACROS
	
	#define FAUST_FILE_NAME "VCF_V2.dsp"
	#define FAUST_CLASS_NAME "_VCF_V2"
	#define FAUST_COMPILATION_OPIONS "-lang cpp -rui -nvi -ct 1 -cn _VCF_V2 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0"
	#define FAUST_INPUTS 1
	#define FAUST_OUTPUTS 2
	#define FAUST_ACTIVES 6
	#define FAUST_PASSIVES 0

	FAUST_ADDHORIZONTALSLIDER("Decay", fHslider2, 0.5f, 0.0f, 2e+01f, 0.01f);
	FAUST_ADDCHECKBOX("Lp-Hp", fCheckbox0);
	FAUST_ADDHORIZONTALSLIDER("egAmount", fHslider0, 0.5f, 0.0f, 1.0f, 0.01f);
	FAUST_ADDBUTTON("gate", fButton0);
	FAUST_ADDHORIZONTALSLIDER("normFreq", fHslider1, 0.5f, 0.0f, 1.0f, 0.001f);
	FAUST_ADDHORIZONTALSLIDER("q", fHslider3, 1.0f, 0.4f, 25.0f, 0.01f);

	#define FAUST_LIST_ACTIVES(p) \
		p(HORIZONTALSLIDER, Decay, "Decay", fHslider2, 0.5f, 0.0f, 2e+01f, 0.01f) \
		p(CHECKBOX, Lp-Hp, "Lp-Hp", fCheckbox0, 0.0f, 0.0f, 1.0f, 1.0f) \
		p(HORIZONTALSLIDER, egAmount, "egAmount", fHslider0, 0.5f, 0.0f, 1.0f, 0.01f) \
		p(BUTTON, gate, "gate", fButton0, 0.0f, 0.0f, 1.0f, 1.0f) \
		p(HORIZONTALSLIDER, normFreq, "normFreq", fHslider1, 0.5f, 0.0f, 1.0f, 0.001f) \
		p(HORIZONTALSLIDER, q, "q", fHslider3, 1.0f, 0.4f, 25.0f, 0.01f) \

	#define FAUST_LIST_PASSIVES(p) \

#endif

#endif
