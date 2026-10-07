// ==============================================================================
// Third Party Node — stereo_spread
// Logic-style frequency-dependent stereo spreader (simplified).
// Alternating spectral bands pan L/R while preserving mono sum.
// Params: Width (0..1), Order (2..16). Fixed band range ~80 Hz .. 12 kHz.
//
// FactoryPath: project.stereo_spread
// Compile: Binaries/batchCompileOSX.sh
// ==============================================================================
#pragma once

#include <JuceHeader.h>

namespace project
{

using namespace juce;
using namespace hise;
using namespace scriptnode;

template <int NV> struct stereo_spread: public data::base
{
	SNEX_NODE(stereo_spread);

	struct MetadataClass
	{
		SN_NODE_ID("stereo_spread");
	};

	static constexpr bool isModNode() { return false; };
	static constexpr bool isPolyphonic() { return NV > 1; };
	static constexpr bool hasTail() { return false; };
	static constexpr bool isSuspendedOnSilence() { return true; };
	static constexpr int getFixChannelAmount() { return 2; };

	static constexpr int NumTables = 0;
	static constexpr int NumSliderPacks = 0;
	static constexpr int NumAudioFiles = 0;
	static constexpr int NumFilters = 0;
	static constexpr int NumDisplayBuffers = 0;

	static constexpr int MaxOrder = 16;
	static constexpr double kLowHz = 80.0;
	static constexpr double kHighHz = 12000.0;

	stereo_spread() = default;

	void prepare(PrepareSpecs specs)
	{
		sampleRate = specs.sampleRate > 0.0 ? specs.sampleRate : 44100.0;
		rebuildCoeffs();
		reset();
	}

	void reset()
	{
		for (int i = 0; i < MaxOrder; ++i)
			z[i] = 0.0f;
	}

	void handleHiseEvent(HiseEvent&) {}
	bool handleModulation(double&) { return false; }

	template <typename T> void processFrame(T& frame)
	{
		const float inL = frame[0];
		const float inR = frame[1];

		if (width <= 1.0e-5f || order < 2)
			return;

		const float mid = 0.5f * (inL + inR);
		const float side = 0.5f * (inL - inR);

		float prev = mid;
		float lW = 0.0f;
		float rW = 0.0f;
		const int n = order;

		for (int i = 0; i < n; ++i)
		{
			// Cascaded 1-pole LPFs, cutoffs high → low.
			z[i] += alpha[i] * (prev - z[i]);
			const float band = prev - z[i];
			prev = z[i];

			const float amt = width * ((i & 1) ? -1.0f : 1.0f);
			lW += band * (0.5f + 0.5f * amt);
			rW += band * (0.5f - 0.5f * amt);
		}

		// Residual (below ~kLowHz) stays centered.
		lW += prev * 0.5f;
		rW += prev * 0.5f;

		// *2 so width=0 → mid; keep original side for existing stereo.
		frame[0] = 2.0f * lW + side;
		frame[1] = 2.0f * rW - side;
	}

	template <typename ProcessDataType> void process(ProcessDataType& data)
	{
		if (data.getNumChannels() >= 2)
		{
			auto fd = data.template as<ProcessData<2>>().toFrameData();
			while (fd.next())
				processFrame(fd.toSpan());
		}
	}

	template <int P> void setParameter(double v)
	{
		if (P == 0) // Width
		{
			width = (float)jlimit(0.0, 1.0, v);
		}
		if (P == 1) // Order
		{
			const int next = jlimit(2, MaxOrder, roundToInt(v));
			if (next != order)
			{
				order = next;
				rebuildCoeffs();
				reset();
			}
		}
	}

	void createParameters(ParameterDataList& data)
	{
		{
			parameter::data p("Width", { 0.0, 1.0 });
			registerCallback<0>(p);
			p.setDefaultValue(0.35);
			data.add(std::move(p));
		}
		{
			parameter::data p("Order", { 2.0, (double)MaxOrder });
			registerCallback<1>(p);
			p.setDefaultValue(8.0);
			data.add(std::move(p));
		}
	}

private:
	void rebuildCoeffs()
	{
		const int n = jlimit(2, MaxOrder, order);
		order = n;

		// Geometric cutoffs from high → low across the fixed musical range.
		for (int i = 0; i < n; ++i)
		{
			const double t = (double)(i + 1) / (double)n;
			const double fc = kHighHz * std::pow(kLowHz / kHighHz, t);
			const double clamped = jlimit(20.0, sampleRate * 0.45, fc);
			const double coeff = std::exp(-2.0 * double_Pi * clamped / sampleRate);
			alpha[i] = (float)(1.0 - coeff);
		}
	}

	double sampleRate = 44100.0;
	float width = 0.35f;
	int order = 8;
	float z[MaxOrder] = {};
	float alpha[MaxOrder] = {};
};

} // namespace project
