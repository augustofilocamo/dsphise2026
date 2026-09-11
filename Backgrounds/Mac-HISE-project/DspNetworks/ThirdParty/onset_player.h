// ==============================================================================
// Third Party Node — onset_player
// Detect onsets in an AudioFile, separate from background, replay with
// Random / Scale / MIDI logic. Each onset is a one-shot: Attack → body → Release.
//
// FactoryPath: project.onset_player
// Compile: File → Compile DSP networks
// ==============================================================================
#pragma once

#include <JuceHeader.h>

namespace project
{

using namespace juce;
using namespace hise;
using namespace scriptnode;

template <int NV> struct onset_player: public data::base
{
	SNEX_NODE(onset_player);

	struct MetadataClass
	{
		SN_NODE_ID("onset_player");
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

	static constexpr int MaxOnsets = 128;
	static constexpr int MaxVoices = 32;

	enum class Mode
	{
		Random = 0,
		Scale,
		Midi,
		numModes
	};

	struct Onset
	{
		int start = 0;
		int length = 0;
	};

	struct Voice
	{
		bool active = false;
		bool sustain = false;
		bool releasing = false;
		double pos = 0.0; // relative to onset start
		double delta = 1.0;
		int startSample = 0;
		int length = 0;
		float gainL = 1.0f;
		float gainR = 1.0f;
		float attackEnv = 0.0f;
		float attackInc = 1.0f;
		float releaseEnv = 1.0f;
		float releaseInc = 1.0f;
		int age = 0;
		int note = -1;

		void reset()
		{
			active = false;
			sustain = false;
			releasing = false;
			pos = 0.0;
			age = 0;
			attackEnv = 0.0f;
			releaseEnv = 1.0f;
			note = -1;
		}

		void trigger(int absStart, int len, double pitch, float gL, float gR,
		             float attInc, float relInc, bool hold, int midiNote)
		{
			active = true;
			sustain = hold;
			releasing = false;
			startSample = absStart;
			length = jmax(8, len);
			pos = 0.0;
			delta = pitch;
			gainL = gL;
			gainR = gR;
			attackEnv = 0.0f;
			attackInc = attInc;
			releaseEnv = 1.0f;
			releaseInc = relInc;
			age = 0;
			note = midiNote;

			if (attackInc >= 1.0f)
				attackEnv = 1.0f;
		}

		void release()
		{
			sustain = false;
			releasing = true;
		}

		static float readSample(const block& b, int idx)
		{
			if (idx < 0 || idx >= b.size())
				return 0.0f;
			return b[idx];
		}

		bool tick(const block& L, const block& R, float& oL, float& oR)
		{
			if (!active)
				return false;

			if (pos >= (double)length)
			{
				// End of one-shot → finish with release if still open
				if (!releasing)
					releasing = true;
			}

			// Auto-release near the end so ReleaseMs shapes the tail
			if (!releasing && !sustain)
			{
				const double remain = (double)length - pos;
				const double releaseSamps = releaseInc > 1.0e-9f
					? (1.0 / (double)releaseInc)
					: 0.0;
				if (remain <= releaseSamps)
					releasing = true;
			}

			int rel = (int)pos;
			if (rel < 0)
				rel = 0;

			if (attackEnv < 1.0f)
				attackEnv = jmin(1.0f, attackEnv + attackInc * (float)delta);

			if (releasing)
			{
				releaseEnv -= releaseInc * (float)delta;
				if (releaseEnv <= 0.0f)
				{
					reset();
					return false;
				}
			}

			float sL = 0.0f;
			float sR = 0.0f;
			if (rel < length)
			{
				const int absIdx = startSample + rel;
				sL = readSample(L, absIdx);
				sR = R.size() > 0 ? readSample(R, absIdx) : sL;
			}

			const float e = attackEnv * attackEnv * releaseEnv;
			oL += sL * e * gainL;
			oR += sR * e * gainR;

			pos += delta;
			++age;
			return true;
		}
	};

	onset_player() = default;

	void prepare(PrepareSpecs specs)
	{
		sampleRate = specs.sampleRate > 0.0 ? specs.sampleRate : 44100.0;
		updateTiming();
		updateEnvRates();
		if (!ed.isEmpty())
			detectOnsets();
	}

	void reset()
	{
		for (auto& v : voices)
			v.reset();
		samplesUntilNext = 0;
		bgPos = 0.0;
		playing = false;
	}

	void handleHiseEvent(HiseEvent& e)
	{
		if (e.isAllNotesOff())
		{
			playing = false;
			for (auto& v : voices)
				v.reset();
			return;
		}

		if (e.isNoteOn())
		{
			playing = true;
			heldNote = (int)e.getNoteNumber();

			if ((Mode)mode == Mode::Midi)
				triggerOnsetFromNote(heldNote);
		}
		else if (e.isNoteOff())
		{
			const int n = (int)e.getNoteNumber();
			for (auto& v : voices)
			{
				if (v.active && v.note == n)
					v.release();
			}
			if (n == heldNote)
				playing = gate > 0.5;
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
			if (d.sampleRate > 0.0)
				sourceSampleRate = d.sampleRate;
			detectOnsets();
		}
		else
		{
			numOnsets = 0;
		}

		reset();
	}

	template <typename T> void processFrame(T& frame)
	{
		float oL = 0.0f;
		float oR = 0.0f;

		const bool run = playing || gate > 0.5;
		if (run && numOnsets > 0 && left.size() > 0)
		{
			if ((Mode)mode != Mode::Midi)
			{
				if (--samplesUntilNext <= 0)
				{
					triggerScheduled();
					samplesUntilNext = nextInterval();
				}
			}

			for (auto& v : voices)
				v.tick(left, right, oL, oR);
		}
		else if (numOnsets > 0 && left.size() > 0)
		{
			for (auto& v : voices)
			{
				if (v.active)
					v.tick(left, right, oL, oR);
			}
		}

		// Background: slow file scrub, mute samples inside onset slices
		if (bgGain > 0.001f && left.size() > 1)
		{
			const int n = left.size();
			int i = (int)bgPos;
			while (i >= n) i -= n;
			while (i < 0) i += n;

			float bL = 0.0f;
			float bR = 0.0f;
			if (!isInsideOnset(i))
			{
				bL = left[i];
				bR = right.size() > i ? right[i] : bL;
			}

			oL += bL * bgGain;
			oR += bR * bgGain;

			const double bgDelta = (sourceSampleRate > 0.0 && sampleRate > 0.0)
				? (sourceSampleRate / sampleRate) * 0.25
				: 0.25;
			bgPos += bgDelta;
			if (bgPos >= (double)n)
				bgPos -= (double)n;
		}

		frame[0] += oL * gain;
		frame[1] += oR * gain;

		if (left.size() > 0)
			ed.setDisplayedValue(bgPos);
	}

	template <typename ProcessDataType> void process(ProcessDataType& data)
	{
		if (ed.isEmpty() || data.getNumChannels() < 2)
			return;

		if (auto lock = DataTryReadLock(ed))
		{
			static constexpr int NumChannels = getFixChannelAmount();
			auto& fixData = data.template as<ProcessData<NumChannels>>();
			auto fd = fixData.toFrameData();

			while (fd.next())
				processFrame(fd.toSpan());
		}
	}

	template <int P> void setParameter(double v)
	{
		if (P == 0) // Gate
		{
			gate = v;
			if (gate > 0.5)
			{
				playing = true;
			}
			else
			{
				for (auto& voice : voices)
				{
					if (voice.active && voice.note < 0)
						voice.release();
				}
			}
		}
		else if (P == 1) // Density
		{
			density = jlimit(0.0, 1.0, v);
			updateTiming();
		}
		else if (P == 2) // Gain
		{
			gain = (float)jlimit(0.0, 1.0, v);
		}
		else if (P == 3) // PitchSpread
		{
			pitchSpread = jlimit(0.0, 12.0, v);
		}
		else if (P == 4) // PanSpread
		{
			panSpread = (float)jlimit(0.0, 1.0, v);
		}
		else if (P == 5) // Mode
		{
			mode = jlimit(0, (int)Mode::numModes - 1, (int)std::round(v));
		}
		else if (P == 6) // Root
		{
			root = jlimit(0, 11, (int)std::round(v));
		}
		else if (P == 7) // BgGain
		{
			bgGain = (float)jlimit(0.0, 1.0, v);
		}
		else if (P == 8) // Threshold
		{
			const float t = (float)jlimit(0.001, 0.5, v);
			if (std::abs(t - threshold) > 1.0e-6f)
			{
				threshold = t;
				if (!ed.isEmpty())
					detectOnsets();
			}
		}
		else if (P == 9) // GrainMs
		{
			grainMs = jlimit(10.0, 500.0, v);
			if (!ed.isEmpty())
				detectOnsets();
		}
		else if (P == 10) // AttackMs
		{
			attackMs = jlimit(0.0, 500.0, v);
			updateEnvRates();
		}
		else if (P == 11) // ReleaseMs
		{
			releaseMs = jlimit(1.0, 4000.0, v);
			updateEnvRates();
		}
	}

	void createParameters(ParameterDataList& data)
	{
		{
			parameter::data p("Gate", { 0.0, 1.0 });
			registerCallback<0>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Density", { 0.0, 1.0 });
			registerCallback<1>(p);
			p.setDefaultValue(0.5);
			data.add(std::move(p));
		}
		{
			parameter::data p("Gain", { 0.0, 1.0 });
			registerCallback<2>(p);
			p.setDefaultValue(0.8);
			data.add(std::move(p));
		}
		{
			parameter::data p("PitchSpread", { 0.0, 12.0 });
			registerCallback<3>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("PanSpread", { 0.0, 1.0 });
			registerCallback<4>(p);
			p.setDefaultValue(0.35);
			data.add(std::move(p));
		}
		{
			parameter::data p("Mode", { 0.0, 2.0 });
			registerCallback<5>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Root", { 0.0, 11.0 });
			registerCallback<6>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("BgGain", { 0.0, 1.0 });
			registerCallback<7>(p);
			p.setDefaultValue(0.15);
			data.add(std::move(p));
		}
		{
			parameter::data p("Threshold", { 0.001, 0.5 });
			registerCallback<8>(p);
			p.setDefaultValue(0.0316227766);
			data.add(std::move(p));
		}
		{
			parameter::data p("GrainMs", { 10.0, 500.0 });
			registerCallback<9>(p);
			p.setDefaultValue(80.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Attack", { 0.0, 500.0 });
			registerCallback<10>(p);
			p.setDefaultValue(5.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Release", { 1.0, 4000.0 });
			registerCallback<11>(p);
			p.setDefaultValue(120.0);
			data.add(std::move(p));
		}
	}

private:
	void updateTiming()
	{
		const double perSec = 2.0 + density * 38.0;
		baseInterval = jmax(1, (int)(sampleRate / perSec));
	}

	void updateEnvRates()
	{
		const double sr = sampleRate > 0.0 ? sampleRate : 44100.0;
		attackInc = attackMs <= 0.0 ? 1.0f : (float)(1.0 / (attackMs * 0.001 * sr));
		releaseInc = (float)(1.0 / (jmax(1.0, releaseMs) * 0.001 * sr));
	}

	int nextInterval() const
	{
		const double jitter = 0.35;
		const double r = 1.0 + (hmath::randomDouble() * 2.0 - 1.0) * jitter;
		return jmax(1, (int)((double)baseInterval * r));
	}

	bool isInsideOnset(int sampleIndex) const
	{
		for (int i = 0; i < numOnsets; ++i)
		{
			const int s = onsets[i].start;
			const int e = s + onsets[i].length;
			if (sampleIndex >= s && sampleIndex < e)
				return true;
		}
		return false;
	}

	Voice* freeVoice()
	{
		for (auto& v : voices)
		{
			if (!v.active)
				return &v;
		}
		Voice* oldest = &voices[0];
		for (auto& v : voices)
		{
			if (v.age > oldest->age)
				oldest = &v;
		}
		return oldest;
	}

	static double pitchFromSemitones(double st)
	{
		return std::pow(2.0, st / 12.0);
	}

	double choosePitchRandom() const
	{
		if (pitchSpread <= 0.001)
			return 1.0;
		const double st = (hmath::randomDouble() * 2.0 - 1.0) * pitchSpread;
		return pitchFromSemitones(st);
	}

	double choosePitchForScale() const
	{
		static constexpr int major[7] = { 0, 2, 4, 5, 7, 9, 11 };
		const int deg = (int)(hmath::randomDouble() * 7.0) % 7;
		const int oct = (int)(hmath::randomDouble() * 3.0) - 1;
		return pitchFromSemitones((double)(root + major[deg] + oct * 12));
	}

	void applyPan(float& gL, float& gR) const
	{
		gL = 1.0f;
		gR = 1.0f;
		if (panSpread > 0.001f)
		{
			const float bal = (float)((hmath::randomDouble() * 2.0 - 1.0) * (double)panSpread);
			gL = 1.0f + bal;
			gR = 1.0f - bal;
		}
	}

	void fireOnset(int onsetIndex, double pitch, int midiNote)
	{
		if (onsetIndex < 0 || onsetIndex >= numOnsets)
			return;

		auto* v = freeVoice();
		if (v == nullptr)
			return;

		float gL, gR;
		applyPan(gL, gR);

		const auto& o = onsets[onsetIndex];
		const bool hold = ((Mode)mode == Mode::Midi) && midiNote >= 0;

		v->trigger(o.start, o.length, pitch, gL, gR,
		           attackInc, releaseInc, hold, midiNote);
	}

	void triggerScheduled()
	{
		if (numOnsets <= 0)
			return;

		const int idx = (int)(hmath::randomDouble() * (double)numOnsets) % numOnsets;
		const double pitch = ((Mode)mode == Mode::Scale)
			? choosePitchForScale()
			: choosePitchRandom();

		fireOnset(idx, pitch, -1);
	}

	void triggerOnsetFromNote(int note)
	{
		if (numOnsets <= 0)
			return;

		const int idx = (note * 7 + numOnsets) % numOnsets;
		const double pitch = pitchFromSemitones((double)(note - (60 + root)));
		fireOnset(idx, pitch, note);
	}

	void detectOnsets()
	{
		numOnsets = 0;
		const int n = left.size();
		if (n < 512 || sampleRate < 1.0)
			return;

		const int hop = jmax(64, (int)(sampleRate * 0.005));
		const int minDist = jmax(hop, (int)(sampleRate * 0.03));
		const int maxLen = jmax(hop * 2, (int)(grainMs * 0.001 * sampleRate));
		const float thresh = threshold;

		float prev = 0.0f;
		int last = -minDist;

		for (int i = 0; i + hop < n && numOnsets < MaxOnsets; i += hop)
		{
			float peak = 0.0f;
			for (int j = 0; j < hop; ++j)
				peak = jmax(peak, std::abs(left[i + j]));

			const bool rising = peak >= thresh && peak > prev * 1.2f;
			if (rising && (i - last) >= minDist)
			{
				int len = maxLen;
				for (int k = hop; k < maxLen && i + k < n; k += hop)
				{
					float p2 = 0.0f;
					const int lim = jmin(hop, n - (i + k));
					for (int j = 0; j < lim; ++j)
						p2 = jmax(p2, std::abs(left[i + k + j]));
					if (p2 < thresh * 0.5f)
					{
						len = k;
						break;
					}
				}

				auto& o = onsets[numOnsets];
				o.start = i;
				o.length = jmax(hop, len);
				++numOnsets;
				last = i;
			}

			prev = peak * 0.7f + prev * 0.3f;
		}
	}

	ExternalData ed;
	block left;
	block right;

	Onset onsets[MaxOnsets];
	int numOnsets = 0;
	Voice voices[MaxVoices];

	double sampleRate = 44100.0;
	double sourceSampleRate = 44100.0;
	double bgPos = 0.0;
	int samplesUntilNext = 0;
	int baseInterval = 1000;
	bool playing = false;
	int heldNote = -1;

	double gate = 0.0;
	double density = 0.5;
	float gain = 0.8f;
	double pitchSpread = 0.0;
	float panSpread = 0.35f;
	int mode = 0;
	int root = 0;
	float bgGain = 0.15f;
	float threshold = 0.0316227766f;
	double grainMs = 80.0;
	double attackMs = 5.0;
	double releaseMs = 120.0;
	float attackInc = 0.01f;
	float releaseInc = 0.0002f;
};

}
