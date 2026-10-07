// ==============================================================================
// Third Party Node — haas_width
// Dry (left pan) + 500 ms delayed copy (right pan). Dry stays muted until the
// delayed path actually has audio, so both sides start together after stretch
// warmup.
//
// FactoryPath: project.haas_width
// ==============================================================================
#pragma once

#include <JuceHeader.h>

namespace project
{

using namespace juce;
using namespace hise;
using namespace scriptnode;

template <int NV> struct haas_width: public data::base
{
	SNEX_NODE(haas_width);

	struct MetadataClass
	{
		SN_NODE_ID("haas_width");
	};

	static constexpr bool isModNode() { return false; };
	static constexpr bool isPolyphonic() { return NV > 1; };
	static constexpr bool hasTail() { return true; };
	static constexpr bool isSuspendedOnSilence() { return false; };
	static constexpr int getFixChannelAmount() { return 2; };

	static constexpr int NumTables = 0;
	static constexpr int NumSliderPacks = 0;
	static constexpr int NumAudioFiles = 0;
	static constexpr int NumFilters = 0;
	static constexpr int NumDisplayBuffers = 0;

	static constexpr int MaxDelaySamples = 65536;
	static constexpr float OpenThresh = 3.0e-4f;

	haas_width() = default;

	void prepare(PrepareSpecs specs)
	{
		sampleRate = specs.sampleRate > 0.0 ? specs.sampleRate : 44100.0;
		envInc = (sampleRate > 0.0) ? (float)(1.0 / (0.08 * sampleRate)) : 0.01f;
		relInc = (sampleRate > 0.0) ? (float)(1.0 / (0.4 * sampleRate)) : 0.01f;
		bufL.allocate((size_t)MaxDelaySamples, true);
		bufR.allocate((size_t)MaxDelaySamples, true);
		updateDelaySamples();
		reset();
	}

	void reset()
	{
		clearDelay();
		dryOpen = false;
		wasOn = false;
	}

	void handleHiseEvent(HiseEvent&) {}
	bool handleModulation(double&) { return false; }

	template <typename T> void processFrame(T&) {}

	template <typename ProcessDataType> void process(ProcessDataType& data)
	{
		if (data.getNumChannels() < 2)
			return;

		auto& sd = data.template as<ProcessData<2>>();
		const int n = sd.getNumSamples();
		if (n <= 0)
			return;

		float* outL = sd[0].begin();
		float* outR = sd[1].begin();
		const bool wantOn = gateParam > 0.5;

		if (wantOn && !wasOn)
		{
			clearDelay();
			dryOpen = false;
			delEnv = 0.0f;
			dryEnv = 0.0f;
		}

		float gDryL, gDryR, gDelL, gDelR;
		panGains(dryPan, gDryL, gDryR);
		panGains(delayPan, gDelL, gDelR);

		if (!wantOn)
		{
			for (int i = 0; i < n; ++i)
			{
				const float inL = outL[i];
				const float inR = outR[i];

				bufL[(size_t)writePos] = inL;
				bufR[(size_t)writePos] = inR;

				int readPos = writePos - delaySamples;
				if (readPos < 0)
					readPos += MaxDelaySamples;

				const float dL = bufL[(size_t)readPos];
				const float dR = bufR[(size_t)readPos];

				if (delEnv > 0.0f)
				{
					delEnv -= relInc;
					if (delEnv < 0.0f)
						delEnv = 0.0f;
				}

				outL[i] = dL * gDelL * delEnv + inL * gDryL * dryEnv;
				outR[i] = dR * gDelR * delEnv + inR * gDryR * dryEnv;

				writePos = writePos + 1;
				if (writePos >= MaxDelaySamples)
					writePos = 0;
			}
			wasOn = false;
			return;
		}

		for (int i = 0; i < n; ++i)
		{
			const float inL = outL[i];
			const float inR = outR[i];

			bufL[(size_t)writePos] = inL;
			bufR[(size_t)writePos] = inR;

			int readPos = writePos - delaySamples;
			if (readPos < 0)
				readPos += MaxDelaySamples;

			const float dL = bufL[(size_t)readPos];
			const float dR = bufR[(size_t)readPos];

			if (!dryOpen && (std::abs(dL) + std::abs(dR)) > OpenThresh)
				dryOpen = true;

			if (delEnv < 1.0f)
			{
				delEnv += envInc;
				if (delEnv > 1.0f)
					delEnv = 1.0f;
			}
			if (dryOpen && dryEnv < 1.0f)
			{
				dryEnv += envInc;
				if (dryEnv > 1.0f)
					dryEnv = 1.0f;
			}

			float mixL = dL * gDelL * delEnv;
			float mixR = dR * gDelR * delEnv;
			mixL += inL * gDryL * dryEnv;
			mixR += inR * gDryR * dryEnv;

			outL[i] = mixL;
			outR[i] = mixR;

			writePos = writePos + 1;
			if (writePos >= MaxDelaySamples)
				writePos = 0;
		}

		wasOn = true;
	}

	template <int P> void setParameter(double v)
	{
		if (P == 0)
		{
			delayMs = jlimit(0.0, 1000.0, v);
			updateDelaySamples();
		}
		if (P == 1)
			gateParam = v;
		if (P == 2)
			dryPan = (float)jlimit(-1.0, 1.0, v);
		if (P == 3)
			delayPan = (float)jlimit(-1.0, 1.0, v);
	}

	void createParameters(ParameterDataList& data)
	{
		{
			parameter::data p("DelayTime", { 0.0, 1000.0 });
			registerCallback<0>(p);
			p.setDefaultValue(500.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Gate", { 0.0, 1.0 });
			p.setParameterValueNames({ "Off", "On" });
			registerCallback<1>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("DryPan", { -1.0, 1.0 });
			registerCallback<2>(p);
			p.setDefaultValue(-0.35);
			data.add(std::move(p));
		}
		{
			parameter::data p("DelayPan", { -1.0, 1.0 });
			registerCallback<3>(p);
			p.setDefaultValue(0.35);
			data.add(std::move(p));
		}
	}

private:
	static void panGains(float pan, float& gL, float& gR)
	{
		const float a = jlimit(0.0f, 1.0f, 0.5f * (pan + 1.0f));
		gL = std::cos(a * (float)(0.5 * double_Pi));
		gR = std::sin(a * (float)(0.5 * double_Pi));
	}

	void updateDelaySamples()
	{
		const int next = jlimit(1, MaxDelaySamples - 1,
			roundToInt(delayMs * 0.001 * sampleRate));
		if (next != delaySamples)
		{
			delaySamples = next;
			clearDelay();
			dryOpen = false;
		}
	}

	void clearDelay()
	{
		if (bufL.getData() != nullptr)
			FloatVectorOperations::clear(bufL.getData(), MaxDelaySamples);
		if (bufR.getData() != nullptr)
			FloatVectorOperations::clear(bufR.getData(), MaxDelaySamples);
		writePos = 0;
	}

	double sampleRate = 44100.0;
	double delayMs = 500.0;
	double gateParam = 0.0;
	float dryPan = -0.35f;
	float delayPan = 0.35f;
	int delaySamples = 1;
	int writePos = 0;
	bool dryOpen = false;
	bool wasOn = false;
	float delEnv = 0.0f;
	float dryEnv = 0.0f;
	float envInc = 0.01f;
	float relInc = 0.01f;
	HeapBlock<float> bufL;
	HeapBlock<float> bufR;
};

} // namespace project
