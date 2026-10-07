// ==============================================================================
// Third Party Node — granulator_gap
// Same grain engine as core.granulator, with Interval (0.02–2 s) instead of
// Density, MIDI note does not change pitch (Pitch param only), and up to
// MaxVoices held notes each with their own Position (C2..C4 → 0..1).
//
// FactoryPath: project.granulator_gap
// Compile: File → Compile DSP networks  (or Binaries/batchCompileOSX.sh)
// ==============================================================================
#pragma once

#include <JuceHeader.h>

namespace project
{

using namespace juce;
using namespace hise;
using namespace scriptnode;

template <int NV> struct granulator_gap: public data::base
{
	SNEX_NODE(granulator_gap);

	struct MetadataClass
	{
		SN_NODE_ID("granulator_gap");
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

	static const int NumGrains = 128;
	static const int MaxVoices = 5;
	static const int NotePosLo = 48; // C2 (HISE: C3 = 60)
	static const int NotePosHi = 72; // C4

	granulator_gap() = default;

	using AudioDataType = span<block, 2>;
	using IndexType = index::lerp<index::unscaled<double, index::clamped<0>>>;

	struct Grain
	{
		hmath Math;

		void reset()
		{
			fadeState = 3;
		}

		void setFadeTime(int newFadeTimeSamples)
		{
			if (newFadeTimeSamples != fadeTimeSamples)
			{
				fadeTimeSamples = newFadeTimeSamples;
				fadeDelta = fadeTimeSamples == 0 ? 1.0f : 1.0f / (float)fadeTimeSamples;
			}
		}

		void setSpread(float alpha, float gain, double detuneAmount)
		{
			gainValue = gain;
			auto balance = 2.0f * (Math.random() - 0.5f);
			lGain = 1.0f + alpha * balance;
			rGain = 1.0f - alpha * balance;

			const double pf = (2.0 * Math.randomDouble() - 1.0) * detuneAmount;
			uptimeDelta *= Math.pow(2.0, pf);
		}

		bool startIfIdle(const span<block, 2>& data, int index, int grainSize)
		{
			if (fadeState == 3)
			{
				fadeState = 0;
				fadeValue = 0.0f;
				idx = 0.0;

				grainData[0].referTo(data[0], grainSize, index);
				grainData[1].referTo(data[1], grainSize, index);

				setFadeTime(grainSize / 2);
				releaseSamples = grainSize * 4;
				releaseDelta = 1.0f / (float)releaseSamples;
				inRelease = false;
				return true;
			}

			return false;
		}

		void updateFadeState()
		{
			auto grainLimit = grainData[0].size();
			auto atkLimit = fadeTimeSamples;
			auto susLimit = grainLimit - fadeTimeSamples;
			auto idx_ = (int)idx;

			fadeState = 0;
			fadeState += idx_ >= atkLimit;
			fadeState += idx_ >= susLimit;
			fadeState += idx_ >= grainLimit;

			if (fadeState == 0)
				fadeValue += fadeDelta * (float)uptimeDelta;
			if (fadeState == 2)
				fadeValue -= fadeDelta * (float)uptimeDelta;
			if (fadeState == 1)
				fadeValue = 1.0f;
		}

		void tick(span<float, 2>& output)
		{
			if (fadeState < 3)
			{
				IndexType i(idx);

				float normFade = jlimit(0.0f, 1.0f, fadeValue);
				float fadeShape = 0.5f * (1.0f - std::cos(normFade * 3.14159265f));
				auto thisGain = gainValue * fadeShape;

				output[0] += lGain * thisGain * grainData[0][i] * 0.5f;
				output[1] += rGain * thisGain * grainData[1][i] * 0.5f;

				idx += uptimeDelta;
				updateFadeState();
			}
		}

		void setPitchRatio(double delta)
		{
			uptimeDelta = delta;
			gainValue *= (float)Math.pow(delta, 0.3);
		}

		double idx = 0.0;
		double uptimeDelta = 1.0;
		int fadeTimeSamples = 0;
		float fadeDelta = 1.0f;
		float fadeValue = 0.0f;
		int fadeState = 3;
		float gainValue = 1.0f;
		float lGain = 1.0f;
		float rGain = 1.0f;
		int releaseSamples = 0;
		float releaseDelta = 0.0f;
		bool inRelease = false;
		AudioDataType grainData;
	};

	struct VoiceState
	{
		HiseEvent event;
		double position = 0.4;
		int lastGrainUptime = -1000000;
		int lastGrainIdx = -1; // avoid identical repeats when Interval > 500 ms
		int age = 0;
		bool active = false;
	};

	static double noteToPosition(int noteNumber)
	{
		const double n = (double)jlimit(NotePosLo, NotePosHi, noteNumber);
		return (n - (double)NotePosLo) / (double)(NotePosHi - NotePosLo);
	}

	int countActiveVoices() const
	{
		int n = 0;
		for (int i = 0; i < MaxVoices; ++i)
			if (voiceStates[i].active)
				++n;
		return n;
	}

	int findVoiceSlot()
	{
		for (int i = 0; i < MaxVoices; ++i)
			if (!voiceStates[i].active)
				return i;

		// Steal oldest voice when all 5 are held.
		int oldest = 0;
		int oldestAge = voiceStates[0].age;
		for (int i = 1; i < MaxVoices; ++i)
		{
			if (voiceStates[i].age < oldestAge)
			{
				oldestAge = voiceStates[i].age;
				oldest = i;
			}
		}
		return oldest;
	}

	void clearVoice(int index)
	{
		if (index < 0 || index >= MaxVoices)
			return;
		voiceStates[index] = VoiceState();
	}

	void reset()
	{
		for (int i = 0; i < MaxVoices; ++i)
			clearVoice(i);
		delayedNoteOffs.clear();
		voiceAgeCounter = 0;
	}

	void spawnGrainForVoice(VoiceState& vs, float voiceGain)
	{
		hmath rng;
		auto jitter = ((rng.randomDouble() - 0.5) * (double)timeBetweenGrains * 0.3);
		vs.lastGrainUptime = uptime + (int)jitter;

		// Pitch from param only — ignore MIDI note transposition.
		double thisPitch = pitchRatio * sourceSampleRate / sampleRate;

		StereoSample nextSample;
		ed.getStereoSample(nextSample, vs.event);

		if (nextSample.isEmpty())
			return;

		auto maxStart = (double)(nextSample.data[0].size() - 2.0 * grainLengthSamples);
		if (maxStart < 1.0)
			maxStart = 1.0;

		const int maxIdx = jmax(0, (int)nextSample.data[0].size() - (int)grainLengthSamples - 1);
		const bool avoidRepeat = intervalSec > 0.5;
		// Minimum distance between successive starts when Interval is long.
		const int minDelta = jmax((int)(grainLengthSamples * 0.5), (int)(maxStart * 0.05));

		int idx = 0;
		for (int attempt = 0; attempt < 8; ++attempt)
		{
			idx = (int)(vs.position * maxStart);
			idx += (int)((double)spread * rng.randomDouble() * grainLengthSamples);

			if (avoidRepeat)
			{
				// Wander farther around the note position so sparse grains don't clone.
				const double wander = jmax(grainLengthSamples * 3.0, maxStart * 0.35);
				idx += (int)((rng.randomDouble() - 0.5) * 2.0 * wander);
			}

			if (idx < 0)
				idx = 0;
			if (idx > maxIdx)
				idx = maxIdx;

			idx -= idx % 4;

			if (!avoidRepeat || vs.lastGrainIdx < 0)
				break;
			if (std::abs(idx - vs.lastGrainIdx) >= minDelta)
				break;

			// Last try: force a jump away from the previous grain.
			if (attempt == 7)
			{
				idx = vs.lastGrainIdx + minDelta;
				if (idx > maxIdx)
					idx = vs.lastGrainIdx - minDelta;
				if (idx < 0)
					idx = 0;
				if (idx > maxIdx)
					idx = maxIdx;
				idx -= idx % 4;
			}
		}

		if (avoidRepeat)
			vs.lastGrainIdx = idx;

		for (auto& grain : grains)
		{
			if (grain.startIfIdle(nextSample.data, idx, (int)grainLengthSamples))
			{
				grain.setPitchRatio(thisPitch);
				grain.setSpread(spread, voiceGain, detune);
				break;
			}
		}
	}

	void startNextGrain(int numSamples)
	{
		uptime += numSamples;

		const int nActive = countActiveVoices();
		if (nActive == 0)
			return;

		const float voiceGain = 1.0f / std::sqrt((float)nActive);

		for (int i = 0; i < MaxVoices; ++i)
		{
			auto& vs = voiceStates[i];
			if (!vs.active)
				continue;

			if (uptime - vs.lastGrainUptime > timeBetweenGrains)
				spawnGrainForVoice(vs, voiceGain);
		}
	}

	template <typename FrameDataType> void processFrame(FrameDataType& data)
	{
		if (data.size() == 2)
		{
			if (countActiveVoices() != 0)
				startNextGrain(1);

			span<float, 2> sum;

			for (auto& g : grains)
				g.tick(sum);

			data[0] += totalGrainGain * sum[0];
			data[1] += totalGrainGain * sum[1];
		}
	}

	template <typename ProcessDataType> void process(ProcessDataType& d)
	{
		if (!ed.isEmpty() && d.getNumChannels() == 2)
		{
			if (auto s = DataTryReadLock(ed))
				processFix(d.template as<ProcessData<2>>());
		}
	}

	void processFix(ProcessData<2>& d)
	{
		auto fd = d.toFrameData();
		while (fd.next())
			processFrame(fd.toSpan());
	}

	void handleHiseEvent(HiseEvent& e)
	{
		if (e.isController())
		{
			if (e.getControllerNumber() == 64)
			{
				pedal = e.getControllerValue() > 64;

				if (!pedal)
				{
					for (auto& dl : delayedNoteOffs)
						handleHiseEvent(dl);

					delayedNoteOffs.clear();
				}
			}
		}

		if (e.isAllNotesOff())
		{
			reset();
			return;
		}

		if (e.isNoteOn())
		{
			const int slot = findVoiceSlot();
			voiceStates[slot].event = e;
			voiceStates[slot].position = noteToPosition(e.getNoteNumber());
			voiceStates[slot].lastGrainUptime = uptime - timeBetweenGrains; // fire soon
			voiceStates[slot].age = ++voiceAgeCounter;
			voiceStates[slot].active = true;

			// Keep Position param / display in sync with newest note.
			currentPosition = voiceStates[slot].position;
			if (!ed.isXYZ())
			{
				auto dv = currentPosition * ed.numSamples - grainLengthSamples;
				ed.setDisplayedValue(dv);
			}
		}
		else if (e.isNoteOff())
		{
			for (int i = 0; i < MaxVoices; ++i)
			{
				auto& vs = voiceStates[i];
				if (!vs.active)
					continue;
				if (vs.event.getEventId() != e.getEventId())
					continue;

				if (pedal)
					delayedNoteOffs.insert(e);
				else
					clearVoice(i);
			}
		}
	}

	void updateGrainLength()
	{
		grainLengthSamples = grainLength * 0.001 * sampleRate;
		timeBetweenGrains = (int)(intervalSec * sampleRate);
		timeBetweenGrains = jmax(50, timeBetweenGrains);
		auto gl = (float)jmax(1.0, grainLengthSamples);
		auto gainDelta = (float)timeBetweenGrains / gl;
		totalGrainGain = (float)std::pow((double)jmin(gainDelta, 8.0f), 0.3);
	}

	void setExternalData(const ExternalData& d, int index)
	{
		base::setExternalData(d, index);
		ed = d;

		if (d.sampleRate != 0.0)
			sourceSampleRate = d.sampleRate;

		for (auto& g : grains)
			g.reset();

		reset();
		updateGrainLength();
	}

	void prepare(PrepareSpecs ps)
	{
		sampleRate = ps.sampleRate > 0.0 ? ps.sampleRate : 44100.0;
		updateGrainLength();
	}

	template <int P> void setParameter(double v)
	{
		if (P == 0) // Position — manual / UI; MIDI notes override per voice
		{
			currentPosition = jlimit(0.0, 1.0, v);

			if (!ed.isXYZ())
			{
				auto dv = currentPosition * ed.numSamples - grainLengthSamples;
				ed.setDisplayedValue(dv);
			}
		}
		if (P == 1) // Pitch
		{
			pitchRatio = v;
			for (auto& g : grains)
				g.setPitchRatio(v);
			updateGrainLength();
		}
		if (P == 2) // GrainSize
		{
			grainLength = (int)jlimit(20.0, 1800.0, v);
			updateGrainLength();
		}
		if (P == 3) // Interval (seconds)
		{
			intervalSec = jlimit(0.02, 2.0, v);
			updateGrainLength();
		}
		if (P == 4) // Spread
			spread = (float)v;
		if (P == 5) // Detune
			detune = jlimit(0.0, 1.0, v);
	}

	void createParameters(ParameterDataList& l)
	{
		{
			parameter::data d("Position", { 0.0, 1.0 });
			registerCallback<0>(d);
			l.add(d);
		}
		{
			parameter::data d("Pitch", { 0.5, 2.0 });
			registerCallback<1>(d);
			d.setSkewForCentre(1.0);
			d.setDefaultValue(1.0);
			l.add(d);
		}
		{
			parameter::data d("GrainSize", { 20.0, 1800.0 });
			registerCallback<2>(d);
			d.setDefaultValue(80.0);
			l.add(d);
		}
		{
			parameter::data d("Interval", { 0.02, 2.0 });
			registerCallback<3>(d);
			d.setSkewForCentre(0.25);
			d.setDefaultValue(0.1);
			l.add(d);
		}
		{
			parameter::data d("Spread", { 0.0, 1.0 });
			registerCallback<4>(d);
			l.add(d);
		}
		{
			parameter::data d("Detune", { 0.0, 1.0 });
			registerCallback<5>(d);
			l.add(d);
		}
	}

	ExternalData ed;
	span<Grain, NumGrains> grains;
	span<VoiceState, MaxVoices> voiceStates;

	float totalGrainGain = 1.0f;
	int uptime = 0;
	int timeBetweenGrains = 4410;
	int grainLength = 80;
	double grainLengthSamples = 2000.0;

	double pitchRatio = 1.0;
	double sampleRate = 44100.0;
	double sourceSampleRate = 44100.0;
	double intervalSec = 0.1;
	double detune = 0.0;
	float spread = 0.0f;
	bool pedal = false;
	int voiceAgeCounter = 0;

	UnorderedStack<HiseEvent, MaxVoices> delayedNoteOffs;
	double currentPosition = 0.0;
};

} // namespace project
