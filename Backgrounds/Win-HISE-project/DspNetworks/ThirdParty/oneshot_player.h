// ==============================================================================
// Third Party Node — oneshot_player
// Plays an AudioFile straight through at Ratio× (default 1.0), once. No loop,
// no timestretch. Gate rising edge restarts from the start; Gate off stops.
//
// FactoryPath: project.oneshot_player
// Compile: File → Compile DSP networks
// ==============================================================================
#pragma once

#include <JuceHeader.h>

namespace project
{

using namespace juce;
using namespace hise;
using namespace scriptnode;

template <int NV> struct oneshot_player: public data::base
{
	SNEX_NODE(oneshot_player);

	struct MetadataClass
	{
		SN_NODE_ID("oneshot_player");
	};

	static constexpr bool isModNode() { return false; };
	static constexpr bool isPolyphonic() { return NV > 1; };
	static constexpr bool hasTail() { return true; };
	static constexpr bool isSuspendedOnSilence() { return false; };
	static constexpr int getFixChannelAmount() { return 2; };

	static constexpr int NumTables = 0;
	static constexpr int NumSliderPacks = 0;
	static constexpr int NumAudioFiles = 1;
	static constexpr int NumFilters = 0;
	static constexpr int NumDisplayBuffers = 0;

	using IndexType = index::lerp<index::unscaled<double, index::clamped<0, false>>>;

	oneshot_player() = default;

	void prepare(PrepareSpecs specs)
	{
		hostSampleRate = specs.sampleRate > 0.0 ? specs.sampleRate : 44100.0;
		refreshRatio();
	}

	void reset()
	{
		pos = 0.0;
		playing = false;
		prevGate = false;
	}

	void handleHiseEvent(HiseEvent&) {}
	bool handleModulation(double&) { return false; }

	void setExternalData(const ExternalData& d, int index)
	{
		data::base::setExternalData(d, index);
		ed = d;
		left.referToNothing();
		right.referToNothing();
		numSamples = 0;

		if (!d.isEmpty() && d.numSamples > 0)
		{
			d.referBlockTo(left, 0);
			d.referBlockTo(right, d.numChannels > 1 ? 1 : 0);
			numSamples = d.numSamples;
			if (d.sampleRate > 0.0)
				sourceSampleRate = d.sampleRate;
		}

		refreshRatio();
		reset();
	}

	template <typename T> void processFrame(T& frame)
	{
		frame[0] = 0.0f;
		frame[1] = 0.0f;

		if (!playing || numSamples < 2 || left.size() < 2)
			return;

		if (pos >= (double)(numSamples - 1))
		{
			playing = false;
			return;
		}

		IndexType ip(pos);
		const float sL = left[ip];
		const float sR = right.size() > 0 ? right[ip] : sL;
		frame[0] = sL;
		frame[1] = sR;
		pos += advance;
	}

	template <typename ProcessDataType> void process(ProcessDataType& data)
	{
		if (data.getNumChannels() < 2)
			return;

		DataReadLock sl(ed, true);

		auto fd = data.template as<ProcessData<2>>().toFrameData();
		while (fd.next())
			processFrame(fd.toSpan());
	}

	template <int P> void setParameter(double v)
	{
		if (P == 0) // Gate
		{
			const bool on = v > 0.5;
			if (on && !prevGate)
			{
				pos = 0.0;
				playing = numSamples > 1;
			}
			else if (!on)
			{
				playing = false;
				pos = 0.0;
			}
			prevGate = on;
		}
		if (P == 1) // Ratio
		{
			ratio = jlimit(0.01, 4.0, v);
			refreshRatio();
		}
	}

	void createParameters(ParameterDataList& data)
	{
		{
			parameter::data p("Gate", { 0.0, 1.0 });
			p.setParameterValueNames({ "Off", "On" });
			registerCallback<0>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Ratio", { 0.01, 4.0 });
			registerCallback<1>(p);
			p.setDefaultValue(1.0);
			data.add(std::move(p));
		}
	}

private:
	void refreshRatio()
	{
		const double sr = hostSampleRate > 0.0 ? hostSampleRate : 44100.0;
		const double src = sourceSampleRate > 0.0 ? sourceSampleRate : sr;
		advance = ratio * (src / sr);
	}

	ExternalData ed;
	block left;
	block right;
	int numSamples = 0;

	double hostSampleRate = 44100.0;
	double sourceSampleRate = 44100.0;
	double ratio = 1.0;
	double advance = 1.0;
	double pos = 0.0;
	bool playing = false;
	bool prevGate = false;
};

} // namespace project
