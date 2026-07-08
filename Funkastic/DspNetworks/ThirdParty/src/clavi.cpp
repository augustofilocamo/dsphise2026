/* ------------------------------------------------------------
author: "you"
license: "MIT"
name: "KS_Minimal_Pluck"
Code generated with Faust 2.74.6 (https://faust.grame.fr)
Compilation options: -lang cpp -rui -nvi -ct 1 -cn _clavi -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0
------------------------------------------------------------ */

#ifndef  ___clavi_H__
#define  ___clavi_H__

#ifndef FAUSTFLOAT
#define FAUSTFLOAT float
#endif 

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <math.h>

#ifndef FAUSTCLASS 
#define FAUSTCLASS _clavi
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

static float _clavi_faustpower2_f(float value) {
	return value * value;
}

class _clavi final : public ::faust::dsp {
	
 public:
	
	FAUSTFLOAT fButton0;
	float fVec0[2];
	FAUSTFLOAT fHslider0;
	FAUSTFLOAT fHslider1;
	int fSampleRate;
	float fConst0;
	float fConst1;
	FAUSTFLOAT fHslider2;
	FAUSTFLOAT fHslider3;
	float fConst2;
	int IOTA0;
	float fRec2[3];
	float fRec1[3];
	float fConst3;
	float fConst4;
	int iRec4[2];
	float fVec1[2];
	float fConst5;
	float fRec3[2];
	float fConst6;
	float fRec5[2];
	float fConst7;
	int iRec6[2];
	float fRec0[8192];
	
 public:
	_clavi() {
	}
	
	void metadata(Meta* m) { 
		m->declare("author", "you");
		m->declare("compile_options", "-lang cpp -rui -nvi -ct 1 -cn _clavi -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0");
		m->declare("delays.lib/name", "Faust Delay Library");
		m->declare("delays.lib/version", "1.1.0");
		m->declare("envelopes.lib/adsr:author", "Yann Orlarey and Andrey Bundin");
		m->declare("envelopes.lib/author", "GRAME");
		m->declare("envelopes.lib/copyright", "GRAME");
		m->declare("envelopes.lib/license", "LGPL with exception");
		m->declare("envelopes.lib/name", "Faust Envelope Library");
		m->declare("envelopes.lib/version", "1.3.0");
		m->declare("filename", "clavi.dsp");
		m->declare("filters.lib/fir:author", "Julius O. Smith III");
		m->declare("filters.lib/fir:copyright", "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>");
		m->declare("filters.lib/fir:license", "MIT-style STK-4.3 license");
		m->declare("filters.lib/iir:author", "Julius O. Smith III");
		m->declare("filters.lib/iir:copyright", "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>");
		m->declare("filters.lib/iir:license", "MIT-style STK-4.3 license");
		m->declare("filters.lib/lowpass0_highpass1", "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>");
		m->declare("filters.lib/lowpass0_highpass1:author", "Julius O. Smith III");
		m->declare("filters.lib/lowpass:author", "Julius O. Smith III");
		m->declare("filters.lib/lowpass:copyright", "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>");
		m->declare("filters.lib/lowpass:license", "MIT-style STK-4.3 license");
		m->declare("filters.lib/name", "Faust Filters Library");
		m->declare("filters.lib/tf1:author", "Julius O. Smith III");
		m->declare("filters.lib/tf1:copyright", "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>");
		m->declare("filters.lib/tf1:license", "MIT-style STK-4.3 license");
		m->declare("filters.lib/tf1s:author", "Julius O. Smith III");
		m->declare("filters.lib/tf1s:copyright", "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>");
		m->declare("filters.lib/tf1s:license", "MIT-style STK-4.3 license");
		m->declare("filters.lib/tf2:author", "Julius O. Smith III");
		m->declare("filters.lib/tf2:copyright", "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>");
		m->declare("filters.lib/tf2:license", "MIT-style STK-4.3 license");
		m->declare("filters.lib/tf2s:author", "Julius O. Smith III");
		m->declare("filters.lib/tf2s:copyright", "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>");
		m->declare("filters.lib/tf2s:license", "MIT-style STK-4.3 license");
		m->declare("filters.lib/version", "1.3.0");
		m->declare("license", "MIT");
		m->declare("maths.lib/author", "GRAME");
		m->declare("maths.lib/copyright", "GRAME");
		m->declare("maths.lib/license", "LGPL with exception");
		m->declare("maths.lib/name", "Faust Math Library");
		m->declare("maths.lib/version", "2.8.0");
		m->declare("name", "KS_Minimal_Pluck");
		m->declare("noises.lib/name", "Faust Noise Generator Library");
		m->declare("noises.lib/version", "1.4.1");
		m->declare("platform.lib/name", "Generic Platform Library");
		m->declare("platform.lib/version", "1.3.0");
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
		fConst1 = 3.1415927f / fConst0;
		fConst2 = 0.45f * fConst0;
		fConst3 = 1.0f / std::tan(21991.148f / fConst0);
		fConst4 = 1.0f / (fConst3 + 1.0f);
		fConst5 = 1.0f - fConst3;
		fConst6 = 0.009f * fConst0;
		fConst7 = 1.0f / std::max<float>(1.0f, 0.35f * fConst0);
	}
	
	void instanceResetUserInterface() {
		fButton0 = FAUSTFLOAT(0.0f);
		fHslider0 = FAUSTFLOAT(0.996f);
		fHslider1 = FAUSTFLOAT(1.1e+02f);
		fHslider2 = FAUSTFLOAT(3e+03f);
		fHslider3 = FAUSTFLOAT(0.8f);
	}
	
	void instanceClear() {
		for (int l0 = 0; l0 < 2; l0 = l0 + 1) {
			fVec0[l0] = 0.0f;
		}
		IOTA0 = 0;
		for (int l1 = 0; l1 < 3; l1 = l1 + 1) {
			fRec2[l1] = 0.0f;
		}
		for (int l2 = 0; l2 < 3; l2 = l2 + 1) {
			fRec1[l2] = 0.0f;
		}
		for (int l3 = 0; l3 < 2; l3 = l3 + 1) {
			iRec4[l3] = 0;
		}
		for (int l4 = 0; l4 < 2; l4 = l4 + 1) {
			fVec1[l4] = 0.0f;
		}
		for (int l5 = 0; l5 < 2; l5 = l5 + 1) {
			fRec3[l5] = 0.0f;
		}
		for (int l6 = 0; l6 < 2; l6 = l6 + 1) {
			fRec5[l6] = 0.0f;
		}
		for (int l7 = 0; l7 < 2; l7 = l7 + 1) {
			iRec6[l7] = 0;
		}
		for (int l8 = 0; l8 < 8192; l8 = l8 + 1) {
			fRec0[l8] = 0.0f;
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
	
	_clavi* clone() {
		return new _clavi();
	}
	
	int getSampleRate() {
		return fSampleRate;
	}
	
	void buildUserInterface(UI* ui_interface) {
		ui_interface->openVerticalBox("KS_Minimal_Pluck");
		ui_interface->declare(&fHslider2, "unit", "Hz");
		ui_interface->addHorizontalSlider("brightness", &fHslider2, FAUSTFLOAT(3e+03f), FAUSTFLOAT(3e+02f), FAUSTFLOAT(2e+04f), FAUSTFLOAT(1.0f));
		ui_interface->addHorizontalSlider("decay", &fHslider0, FAUSTFLOAT(0.996f), FAUSTFLOAT(0.9f), FAUSTFLOAT(0.9999f), FAUSTFLOAT(0.0001f));
		ui_interface->declare(&fHslider1, "unit", "Hz");
		ui_interface->addHorizontalSlider("freq", &fHslider1, FAUSTFLOAT(1.1e+02f), FAUSTFLOAT(27.5f), FAUSTFLOAT(1.76e+03f), FAUSTFLOAT(0.01f));
		ui_interface->addHorizontalSlider("gain", &fHslider3, FAUSTFLOAT(0.8f), FAUSTFLOAT(0.0f), FAUSTFLOAT(1.0f), FAUSTFLOAT(0.001f));
		ui_interface->addButton("gate", &fButton0);
		ui_interface->closeBox();
	}
	
	void compute(int count, FAUSTFLOAT** RESTRICT inputs, FAUSTFLOAT** RESTRICT outputs) {
		FAUSTFLOAT* output0 = outputs[0];
		FAUSTFLOAT* output1 = outputs[1];
		float fSlow0 = float(fButton0);
		float fSlow1 = std::max<float>(27.5f, std::min<float>(1.76e+03f, float(fHslider1)));
		float fSlow2 = std::min<float>(1.0f, std::max<float>(0.0f, 0.0101936795f * (fSlow1 + -32.7f)));
		float fSlow3 = std::max<float>(0.0f, std::min<float>(1.0f, float(fHslider3)));
		float fSlow4 = std::min<float>(std::max<float>(3e+02f, std::min<float>(2e+04f, float(fHslider2))) * fSlow3 * (0.8f * fSlow2 + 0.2f), fConst2);
		float fSlow5 = std::tan(fConst1 * fSlow4);
		float fSlow6 = 1.0f / fSlow5;
		float fSlow7 = (fSlow6 + 0.76536685f) / fSlow5 + 1.0f;
		float fSlow8 = std::max<float>(0.9f, std::min<float>(0.9999f, float(fHslider0))) * (0.05f * fSlow2 + 0.95f) / fSlow7;
		float fSlow9 = 1.0f / ((fSlow6 + 1.847759f) / fSlow5 + 1.0f);
		float fSlow10 = fConst0 * ((1.0f - 0.31830987f * std::atan(fSlow1 / fSlow4)) / fSlow1);
		float fSlow11 = std::floor(fSlow10);
		float fSlow12 = fSlow11 + (1.0f - fSlow10);
		int iSlow13 = int(fSlow10);
		int iSlow14 = std::min<int>(48001, std::max<int>(0, iSlow13)) + 1;
		float fSlow15 = fSlow10 - fSlow11;
		int iSlow16 = std::min<int>(48001, std::max<int>(0, iSlow13 + 1)) + 1;
		float fSlow17 = (fSlow6 + -1.847759f) / fSlow5 + 1.0f;
		float fSlow18 = 2.0f * (1.0f - 1.0f / _clavi_faustpower2_f(fSlow5));
		float fSlow19 = 1.0f / fSlow7;
		float fSlow20 = (fSlow6 + -0.76536685f) / fSlow5 + 1.0f;
		float fSlow21 = std::max<float>(1.0f, fConst6 * (0.7f * (1.0f - fSlow3) + 0.3f));
		float fSlow22 = 1.0f / fSlow21;
		int iSlow23 = fSlow0 == 0.0f;
		for (int i0 = 0; i0 < count; i0 = i0 + 1) {
			fVec0[0] = fSlow0;
			fRec2[0] = fSlow12 * fRec0[(IOTA0 - iSlow14) & 8191] + fSlow15 * fRec0[(IOTA0 - iSlow16) & 8191] - fSlow9 * (fSlow17 * fRec2[2] + fSlow18 * fRec2[1]);
			fRec1[0] = fSlow9 * (fRec2[2] + fRec2[0] + 2.0f * fRec2[1]) - fSlow19 * (fSlow20 * fRec1[2] + fSlow18 * fRec1[1]);
			iRec4[0] = 1103515245 * iRec4[1] + 12345;
			float fTemp0 = float(iRec4[0]);
			fVec1[0] = fTemp0;
			fRec3[0] = fConst4 * (4.656613e-10f * (fTemp0 + fVec1[1]) - fConst5 * fRec3[1]);
			fRec5[0] = fSlow0 + fRec5[1] * float(fVec0[1] >= fSlow0);
			iRec6[0] = iSlow23 * (iRec6[1] + 1);
			fRec0[IOTA0 & 8191] = fSlow8 * (fRec1[2] + fRec1[0] + 2.0f * fRec1[1]) + fSlow3 * fRec3[0] * std::max<float>(0.0f, std::min<float>(fSlow22 * fRec5[0], std::max<float>(fSlow21 + (1.0f - fRec5[0]), 0.0f)) * (1.0f - fConst7 * float(iRec6[0])));
			float fTemp1 = fSlow0 * fRec0[IOTA0 & 8191];
			output0[i0] = FAUSTFLOAT(fTemp1);
			output1[i0] = FAUSTFLOAT(fTemp1);
			fVec0[1] = fVec0[0];
			IOTA0 = IOTA0 + 1;
			fRec2[2] = fRec2[1];
			fRec2[1] = fRec2[0];
			fRec1[2] = fRec1[1];
			fRec1[1] = fRec1[0];
			iRec4[1] = iRec4[0];
			fVec1[1] = fVec1[0];
			fRec3[1] = fRec3[0];
			fRec5[1] = fRec5[0];
			iRec6[1] = iRec6[0];
		}
	}

};

#ifdef FAUST_UIMACROS
	
	#define FAUST_FILE_NAME "clavi.dsp"
	#define FAUST_CLASS_NAME "_clavi"
	#define FAUST_COMPILATION_OPIONS "-lang cpp -rui -nvi -ct 1 -cn _clavi -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0"
	#define FAUST_INPUTS 0
	#define FAUST_OUTPUTS 2
	#define FAUST_ACTIVES 5
	#define FAUST_PASSIVES 0

	FAUST_ADDHORIZONTALSLIDER("brightness", fHslider2, 3e+03f, 3e+02f, 2e+04f, 1.0f);
	FAUST_ADDHORIZONTALSLIDER("decay", fHslider0, 0.996f, 0.9f, 0.9999f, 0.0001f);
	FAUST_ADDHORIZONTALSLIDER("freq", fHslider1, 1.1e+02f, 27.5f, 1.76e+03f, 0.01f);
	FAUST_ADDHORIZONTALSLIDER("gain", fHslider3, 0.8f, 0.0f, 1.0f, 0.001f);
	FAUST_ADDBUTTON("gate", fButton0);

	#define FAUST_LIST_ACTIVES(p) \
		p(HORIZONTALSLIDER, brightness, "brightness", fHslider2, 3e+03f, 3e+02f, 2e+04f, 1.0f) \
		p(HORIZONTALSLIDER, decay, "decay", fHslider0, 0.996f, 0.9f, 0.9999f, 0.0001f) \
		p(HORIZONTALSLIDER, freq, "freq", fHslider1, 1.1e+02f, 27.5f, 1.76e+03f, 0.01f) \
		p(HORIZONTALSLIDER, gain, "gain", fHslider3, 0.8f, 0.0f, 1.0f, 0.001f) \
		p(BUTTON, gate, "gate", fButton0, 0.0f, 0.0f, 1.0f, 1.0f) \

	#define FAUST_LIST_PASSIVES(p) \

#endif

#endif
