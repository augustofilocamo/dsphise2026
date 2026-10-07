// ==============================================================================
// Third Party Node — texture_grain
// Clouds-based granular texture player (MIT engine by Emilie Gillet).
// Seeds the freeze buffer from a HISE AudioFile and granulates in-place.
//
// FactoryPath: project.texture_grain
// Compile: DspNetworks/Binaries/batchCompileOSX.sh
// Branding: do not call this "Clouds" / "Mutable Instruments" in product UI.
// ==============================================================================
#pragma once

#include <JuceHeader.h>

#include "mi_clouds/desktop_compat.h"
#include "mi_clouds/clouds/dsp/granular_processor.h"
#include "mi_clouds/clouds/dsp/parameters.h"

namespace project
{

using namespace juce;
using namespace hise;
using namespace scriptnode;

template <int NV> struct texture_grain: public data::base
{
	SNEX_NODE(texture_grain);

	struct MetadataClass
	{
		SN_NODE_ID("texture_grain");
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

	static constexpr size_t kLargeBuf = 118784;
	static constexpr size_t kSmallBuf = 65536 - 128;
	static constexpr int kBlock = (int)clouds::kMaxBlockSize;

	texture_grain() = default;

	void prepare(PrepareSpecs specs)
	{
		sampleRate = specs.sampleRate > 0.0 ? specs.sampleRate : 44100.0;
		ensureProcessor();
		prepared = true;
	}

	void reset()
	{
		seeded = false;
		seedPos = 0;
		gate = 0.0;
		if (ready)
		{
			processor.set_freeze(true);
			processor.set_silence(false);
		}
	}

	void handleHiseEvent(HiseEvent& e)
	{
		if (e.isAllNotesOff())
		{
			gate = 0.0;
		}
		else if (e.isNoteOn())
		{
			gate = 1.0;
			requestSeed = true;
		}
		else if (e.isNoteOff())
		{
			if (gateParam < 0.5)
				gate = 0.0;
		}
	}

	bool handleModulation(double&) { return false; }

	void setExternalData(const ExternalData& d, int index)
	{
		data::base::setExternalData(d, index);
		ed = d;
		left.referToNothing();
		right.referToNothing();

		if (!d.isEmpty() && d.numSamples > 0)
		{
			d.referBlockTo(left, 0);
			d.referBlockTo(right, d.numChannels > 1 ? 1 : 0);
		}

		seeded = false;
		seedPos = 0;
		requestSeed = (gate > 0.5 || gateParam > 0.5);
	}

	template <typename T> void processFrame(T&) {}

	template <typename ProcessDataType> void process(ProcessDataType& data)
	{
		if (data.getNumChannels() < 2)
			return;

		ensureProcessor();
		if (!ready)
			return;

		DataReadLock sl(ed, true);

		auto& sd = data.template as<ProcessData<2>>();
		const int numHost = sd.getNumSamples();
		if (numHost <= 0)
			return;

		float* outL = sd[0].begin();
		float* outR = sd[1].begin();
		FloatVectorOperations::clear(outL, numHost);
		FloatVectorOperations::clear(outR, numHost);

		const bool wantOn = gate > 0.5 || gateParam > 0.5;
		if (!wantOn)
			return;

		if (left.size() < 2)
			return;

		if (requestSeed || !seeded)
			seedFromFile();

		applyParams();

		clouds::ShortFrame in[kBlock];
		clouds::ShortFrame out[kBlock];

		int done = 0;
		while (done < numHost)
		{
			const int n = jmin(kBlock, numHost - done);
			for (int i = 0; i < n; ++i)
			{
				in[i].l = 0;
				in[i].r = 0;
			}

			processor.Prepare();
			processor.Process(in, out, (size_t)n);

			for (int i = 0; i < n; ++i)
			{
				outL[done + i] = (float)out[i].l / 32768.0f;
				outR[done + i] = (float)out[i].r / 32768.0f;
			}
			done += n;
		}
	}

	template <int P> void setParameter(double v)
	{
		if (P == 0) // Gate
		{
			const bool wasOn = gateParam > 0.5;
			gateParam = v;
			gate = v;
			if (v > 0.5 && !wasOn)
				requestSeed = true;
		}
		if (P == 1) position = (float)jlimit(0.0, 1.0, v);
		if (P == 2) size = (float)jlimit(0.0, 1.0, v);
		if (P == 3) density = (float)jlimit(0.0, 1.0, v);
		if (P == 4) texture = (float)jlimit(0.0, 1.0, v);
		if (P == 5) pitch = (float)jlimit(-48.0, 48.0, v); // semitones
		if (P == 6) dryWet = (float)jlimit(0.0, 1.0, v);
		if (P == 7) spread = (float)jlimit(0.0, 1.0, v);
		if (P == 8) feedback = (float)jlimit(0.0, 1.0, v);
		if (P == 9) reverb = (float)jlimit(0.0, 1.0, v);
		if (P == 10)
		{
			freeze = v > 0.5;
			if (ready)
				processor.set_freeze(freeze);
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
			parameter::data p("Position", { 0.0, 1.0 });
			registerCallback<1>(p);
			p.setDefaultValue(0.5);
			data.add(std::move(p));
		}
		{
			parameter::data p("Size", { 0.0, 1.0 });
			registerCallback<2>(p);
			p.setDefaultValue(0.5);
			data.add(std::move(p));
		}
		{
			parameter::data p("Density", { 0.0, 1.0 });
			registerCallback<3>(p);
			p.setDefaultValue(0.6);
			data.add(std::move(p));
		}
		{
			parameter::data p("Texture", { 0.0, 1.0 });
			registerCallback<4>(p);
			p.setDefaultValue(0.5);
			data.add(std::move(p));
		}
		{
			parameter::data p("Pitch", { -24.0, 24.0 });
			registerCallback<5>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("DryWet", { 0.0, 1.0 });
			registerCallback<6>(p);
			p.setDefaultValue(1.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Spread", { 0.0, 1.0 });
			registerCallback<7>(p);
			p.setDefaultValue(0.5);
			data.add(std::move(p));
		}
		{
			parameter::data p("Feedback", { 0.0, 1.0 });
			registerCallback<8>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Reverb", { 0.0, 1.0 });
			registerCallback<9>(p);
			p.setDefaultValue(0.2);
			data.add(std::move(p));
		}
		{
			parameter::data p("Freeze", { 0.0, 1.0 });
			p.setParameterValueNames({ "Off", "On" });
			registerCallback<10>(p);
			p.setDefaultValue(1.0);
			data.add(std::move(p));
		}
	}

private:
	void ensureProcessor()
	{
		if (ready)
			return;

		largeBuf.allocate(kLargeBuf, true);
		smallBuf.allocate(kSmallBuf, true);
		processor.Init(largeBuf.getData(), kLargeBuf, smallBuf.getData(), kSmallBuf);
		processor.set_playback_mode(clouds::PLAYBACK_MODE_GRANULAR);
		processor.set_quality(0); // stereo 16-bit
		processor.set_freeze(false);
		processor.set_silence(false);
		processor.set_bypass(false);

		for (int i = 0; i < 8; ++i)
			processor.Prepare();

		ready = true;
		applyParams();
		processor.set_freeze(freeze);
	}

	void applyParams()
	{
		if (!ready)
			return;

		auto* p = processor.mutable_parameters();
		p->position = position;
		p->size = size;
		p->density = density;
		p->texture = texture;
		p->pitch = pitch;
		p->dry_wet = dryWet;
		p->stereo_spread = spread;
		p->feedback = feedback;
		p->reverb = reverb;
		p->freeze = freeze;
		p->trigger = false;
		p->gate = gate > 0.5 || gateParam > 0.5;
		p->granular.stereo_spread = spread;
	}

	void seedFromFile()
	{
		requestSeed = false;
		if (!ready || left.size() < 2)
			return;

		processor.set_playback_mode(clouds::PLAYBACK_MODE_GRANULAR);
		processor.set_freeze(false);
		processor.set_silence(false);

		for (int i = 0; i < 4; ++i)
			processor.Prepare();

		applyParams();
		processor.mutable_parameters()->freeze = false;

		const int nFile = left.size();
		const block& rch = right.size() > 0 ? right : left;

		// Fill freeze buffer: feed file as input (~capacity of stereo 16-bit half).
		const int capacity = (int)((kSmallBuf >> 1));
		const int toWrite = jmin(nFile, capacity);
		seedPos = 0;

		clouds::ShortFrame in[kBlock];
		clouds::ShortFrame out[kBlock];

		while (seedPos < toWrite)
		{
			const int n = jmin(kBlock, toWrite - seedPos);
			for (int i = 0; i < n; ++i)
			{
				const int idx = seedPos + i;
				const float l = left[idx];
				const float r = rch[idx];
				in[i].l = (short)jlimit(-32767, 32767, roundToInt(l * 32767.0f));
				in[i].r = (short)jlimit(-32767, 32767, roundToInt(r * 32767.0f));
			}
			for (int i = n; i < kBlock; ++i)
			{
				in[i].l = 0;
				in[i].r = 0;
			}

			processor.Prepare();
			processor.Process(in, out, (size_t)n);
			seedPos += n;
		}

		processor.set_freeze(true);
		freeze = true;
		seeded = true;
		applyParams();
	}

	clouds::GranularProcessor processor;
	HeapBlock<uint8_t> largeBuf;
	HeapBlock<uint8_t> smallBuf;

	ExternalData ed;
	block left;
	block right;

	double sampleRate = 44100.0;
	double gate = 0.0;
	double gateParam = 0.0;

	float position = 0.5f;
	float size = 0.5f;
	float density = 0.6f;
	float texture = 0.5f;
	float pitch = 0.0f;
	float dryWet = 1.0f;
	float spread = 0.5f;
	float feedback = 0.0f;
	float reverb = 0.2f;
	bool freeze = true;

	bool prepared = false;
	bool ready = false;
	bool seeded = false;
	bool requestSeed = false;
	int seedPos = 0;
};

} // namespace project
