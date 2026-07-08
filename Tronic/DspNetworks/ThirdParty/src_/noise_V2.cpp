/* ------------------------------------------------------------
name: "noise_V2"
Code generated with Faust 2.74.6 (https://faust.grame.fr)
Compilation options: -lang cpp -rui -nvi -ct 1 -cn _noise_V2 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0
------------------------------------------------------------ */

#ifndef  ___noise_V2_H__
#define  ___noise_V2_H__

#ifndef FAUSTFLOAT
#define FAUSTFLOAT float
#endif 

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <math.h>

#ifndef FAUSTCLASS 
#define FAUSTCLASS _noise_V2
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


class _noise_V2 final : public ::faust::dsp {
	
 public:
	
	FAUSTFLOAT fButton0;
	int iVec0[2];
	FAUSTFLOAT fHslider0;
	int iRec1[2];
	int fSampleRate;
	float fConst0;
	int iConst1;
	float fConst2;
	float fRec0[2];
	int iRec2[2];
	
 public:
	_noise_V2() {
	}
	
	void metadata(Meta* m) { 
		m->declare("basics.lib/name", "Faust Basic Element Library");
		m->declare("basics.lib/tabulateNd", "Copyright (C) 2023 Bart Brouns <bart@magnetophon.nl>");
		m->declare("basics.lib/version", "1.18.0");
		m->declare("compile_options", "-lang cpp -rui -nvi -ct 1 -cn _noise_V2 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0");
		m->declare("envelopes.lib/adsre:author", "Julius O. Smith III");
		m->declare("envelopes.lib/adsre:licence", "STK-4.3");
		m->declare("envelopes.lib/author", "GRAME");
		m->declare("envelopes.lib/copyright", "GRAME");
		m->declare("envelopes.lib/license", "LGPL with exception");
		m->declare("envelopes.lib/name", "Faust Envelope Library");
		m->declare("envelopes.lib/version", "1.3.0");
		m->declare("filename", "noise_V2.dsp");
		m->declare("maths.lib/author", "GRAME");
		m->declare("maths.lib/copyright", "GRAME");
		m->declare("maths.lib/license", "LGPL with exception");
		m->declare("maths.lib/name", "Faust Math Library");
		m->declare("maths.lib/version", "2.8.0");
		m->declare("name", "noise_V2");
		m->declare("noises.lib/name", "Faust Noise Generator Library");
		m->declare("noises.lib/version", "1.4.1");
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
		iConst1 = int(0.001f * fConst0);
		fConst2 = 1.0f / fConst0;
	}
	
	void instanceResetUserInterface() {
		fButton0 = FAUSTFLOAT(0.0f);
		fHslider0 = FAUSTFLOAT(0.05f);
	}
	
	void instanceClear() {
		for (int l0 = 0; l0 < 2; l0 = l0 + 1) {
			iVec0[l0] = 0;
		}
		for (int l1 = 0; l1 < 2; l1 = l1 + 1) {
			iRec1[l1] = 0;
		}
		for (int l2 = 0; l2 < 2; l2 = l2 + 1) {
			fRec0[l2] = 0.0f;
		}
		for (int l3 = 0; l3 < 2; l3 = l3 + 1) {
			iRec2[l3] = 0;
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
	
	_noise_V2* clone() {
		return new _noise_V2();
	}
	
	int getSampleRate() {
		return fSampleRate;
	}
	
	void buildUserInterface(UI* ui_interface) {
		ui_interface->openVerticalBox("noise_V2");
		ui_interface->addHorizontalSlider("Decay", &fHslider0, FAUSTFLOAT(0.05f), FAUSTFLOAT(0.001f), FAUSTFLOAT(0.7f), FAUSTFLOAT(0.0001f));
		ui_interface->addButton("gate", &fButton0);
		ui_interface->closeBox();
	}
	
	void compute(int count, FAUSTFLOAT** RESTRICT inputs, FAUSTFLOAT** RESTRICT outputs) {
		FAUSTFLOAT* output0 = outputs[0];
		FAUSTFLOAT* output1 = outputs[1];
		int iSlow0 = float(fButton0) > 0.0f;
		float fSlow1 = std::max<float>(0.001f, std::min<float>(0.7f, float(fHslider0)));
		float fSlow2 = float(iSlow0);
		for (int i0 = 0; i0 < count; i0 = i0 + 1) {
			iVec0[0] = iSlow0;
			iRec1[0] = iSlow0 * (iRec1[1] + 1);
			int iTemp0 = iSlow0 - iVec0[1];
			int iTemp1 = (iRec1[0] < iConst1) | (iTemp0 * (iTemp0 > 0));
			float fTemp2 = 0.1447178f * ((iSlow0) ? ((iTemp1) ? 0.001f : fSlow1) : fSlow1);
			int iTemp3 = std::fabs(fTemp2) < 1.1920929e-07f;
			float fTemp4 = ((iTemp3) ? 0.0f : std::exp(-(fConst2 / ((iTemp3) ? 1.0f : fTemp2))));
			fRec0[0] = (1.0f - fTemp4) * ((iSlow0) ? ((iTemp1) ? fSlow2 : 0.0f) : 0.0f) + fTemp4 * fRec0[1];
			iRec2[0] = 1103515245 * iRec2[1] + 12345;
			float fTemp5 = 2.7939678e-10f * fRec0[0] * float(iRec2[0]);
			output0[i0] = FAUSTFLOAT(fTemp5);
			output1[i0] = FAUSTFLOAT(fTemp5);
			iVec0[1] = iVec0[0];
			iRec1[1] = iRec1[0];
			fRec0[1] = fRec0[0];
			iRec2[1] = iRec2[0];
		}
	}

};

#ifdef FAUST_UIMACROS
	
	#define FAUST_FILE_NAME "noise_V2.dsp"
	#define FAUST_CLASS_NAME "_noise_V2"
	#define FAUST_COMPILATION_OPIONS "-lang cpp -rui -nvi -ct 1 -cn _noise_V2 -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0"
	#define FAUST_INPUTS 0
	#define FAUST_OUTPUTS 2
	#define FAUST_ACTIVES 2
	#define FAUST_PASSIVES 0

	FAUST_ADDHORIZONTALSLIDER("Decay", fHslider0, 0.05f, 0.001f, 0.7f, 0.0001f);
	FAUST_ADDBUTTON("gate", fButton0);

	#define FAUST_LIST_ACTIVES(p) \
		p(HORIZONTALSLIDER, Decay, "Decay", fHslider0, 0.05f, 0.001f, 0.7f, 0.0001f) \
		p(BUTTON, gate, "gate", fButton0, 0.0f, 0.0f, 1.0f, 1.0f) \

	#define FAUST_LIST_PASSIVES(p) \

#endif

#endif
