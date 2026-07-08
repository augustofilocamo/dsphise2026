// ==================================| Third Party Node Template |==================================

#pragma once
#include <JuceHeader.h>

#include <array>
#include <cmath>

namespace project
{
using namespace juce;
using namespace hise;
using namespace scriptnode;

// Spectral freeze with phase randomisation.
// STFT (N=2048, OVERLAP=4, Hann), on Cue rising edge the magnitude spectrum
// of the current frame is captured per channel. While frozen, the output is
// synthesised every hop from those magnitudes and a (configurable) random phase.

template <int NV> struct spectral_freeze_node: public data::base
{
	SNEX_NODE(spectral_freeze_node);

	struct MetadataClass
	{
		SN_NODE_ID("spectral_freeze_node");
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

	static constexpr int FFT_ORDER = 13;
	static constexpr int FFT_SIZE  = 1 << FFT_ORDER;
	static constexpr int OVERLAP   = 4;
	static constexpr int HOP       = FFT_SIZE / OVERLAP;
	static constexpr int NUM_BINS  = FFT_SIZE / 2 + 1;

	struct ChannelState
	{
		// Default-initialise the buffers so the very first prepare()
		// (before any audio has hit the node) sees deterministic zeros.
		std::array<float, FFT_SIZE>     inRing {};
		std::array<float, FFT_SIZE>     outRing {};
		std::array<float, FFT_SIZE * 2> fftScratch {};

		std::array<float, NUM_BINS> frozenMag {};
		std::array<float, NUM_BINS> frozenPhase {};

		// Smear gain compensation: we remember the total spectral energy at
		// the moment of capture and use it to scale the (drifting) frozenMag
		// back to that level so Smear doesn't bleed level away.
		float snapshotEnergy = 0.0f;
		float makeupSmoothed = 1.0f;

		int  writeIdx    = 0;
		int  readIdx     = 0;
		bool hasSnapshot = false;

		// Light reset: zero only the runtime buffers and indices. The
		// captured snapshot (frozenMag/Phase + hasSnapshot) survives so a
		// plugin toggle / export does NOT silently kill the freeze.
		void resetRuntime()
		{
			inRing.fill(0.0f);
			outRing.fill(0.0f);
			fftScratch.fill(0.0f);
			writeIdx = 0;
			readIdx  = 0;
		}
	};

	std::array<ChannelState, 2> ch;     // input pipeline (live input → freeze)
	std::array<ChannelState, 2> chLp;   // loop  pipeline (looper playback → freeze)
	std::array<float, FFT_SIZE> window;
	juce::dsp::FFT fft { FFT_ORDER };
	juce::Random   rng;

	int   hopCounter   = 0;
	bool  cueArmed     = false;
	float lastCue      = 0.0f;
	// Auto-cue the loop pipeline N hops after Play rises so the chLp
	// inRing has time to fill with loop content before we freeze it.
	// -1 = idle; otherwise counts hops down to 0 and fires once.
	int   loopCueCountdown = -1;

	double freezeAmount = 0.0;   // input branch dry/wet
	double freezeLoop   = 0.0;   // loop branch dry/wet
	double phaseRandom  = 1.0;
	double smear        = 0.0;   // input branch smear amount
	double smearLoop    = 0.0;   // loop  branch smear amount
	double autoCue      = 0.0;
	double inputLevel   = 1.0;   // post-mix gain for the live input branch
	double loopLevel    = 1.0;   // post-mix gain for the looper branch

	// Mono-input detection. Some hosts (e.g. Logic on a mono track) feed
	// the plugin with audio on one channel and exact zero on the other.
	// We keep a slow follower of |inL|/|inR| and, when one side is
	// consistently far below the other, treat the input as mono: the
	// silent side is filled by mirroring the live side, and at hop time
	// only the active pipeline runs the FFT/snapshot. The mirror pipeline
	// copies the captured spectrum and resynthesises it with an
	// independent random-phase pass, giving the same wide stereo image
	// the user gets in Reaper (which duplicates mono → L+R at the host).
	float monoLevelL  = 0.0f;
	float monoLevelR  = 0.0f;
	bool  monoLActive = false;   // L has signal, R silent → mirror L into R
	bool  monoRActive = false;   // R has signal, L silent → mirror R into L

	// =================== Looper ===================
	// 10 s stereo recording at up to 96 kHz, pre-allocated (no audio-thread
	// allocations). At 44.1 kHz only the first ~441 k samples are touched;
	// the rest of the capacity stays unused (a few MB of "wasted" RAM, kept
	// for simplicity and determinism).
	static constexpr int LOOP_MAX_SECONDS = 10;
	static constexpr int LOOP_MAX_SR      = 96000;
	static constexpr int LOOP_CAPACITY    = LOOP_MAX_SECONDS * LOOP_MAX_SR;

	std::array<float, LOOP_CAPACITY> loopBufL {};
	std::array<float, LOOP_CAPACITY> loopBufR {};

	int   loopMaxSamples = LOOP_CAPACITY; // recomputed as 10 * sampleRate in prepare()
	int   loopWrite      = 0;
	int   loopRead       = 0;
	int   loopLen        = 0;             // 0 ⇒ nothing recorded yet
	bool  recording      = false;
	bool  playing        = false;
	float lastRec        = 0.0f;
	float lastPlay       = 0.0f;
	float lastClear      = 0.0f;
	double loopMix       = 1.0;
	double loopSidecarId = 0.0;   // persisted by host; sidecar WAV name suffix
	double currentSampleRate = 44100.0;
	float  lastLoopSidecarLoad = 0.0f;
	float  lastLoopSidecarSave = 0.0f;

	// Sidecar WAVs — must match loopSidecar.js:
	// AppData/AudioFiles/recordings/loop_{LoopSidecarId}.wav
	static juce::File getSidecarDirectory()
	{
		return juce::File::getSpecialLocation(juce::File::userApplicationDataDirectory)
		    .getChildFile("Sampleson")
		    .getChildFile("Aeronaut")
		    .getChildFile("AudioFiles")
		    .getChildFile("recordings");
	}

	juce::File getSidecarFile() const
	{
		if (loopSidecarId < 1.0)
			return {};

		return getSidecarDirectory().getChildFile(
		    "loop_" + juce::String((juce::int64) loopSidecarId) + ".wav");
	}

	void deleteSidecarFile() const
	{
		const auto f = getSidecarFile();
		if (f.existsAsFile())
			f.deleteFile();
	}

	bool saveLoopSidecarFile() const
	{
		if (loopLen <= 0)
			return false;

		const auto file = getSidecarFile();
		if (! file.getFullPathName().isNotEmpty())
			return false;

		file.getParentDirectory().createDirectory();

		juce::AudioBuffer<float> buffer(2, loopLen);
		buffer.copyFrom(0, 0, loopBufL.data(), loopLen);
		buffer.copyFrom(1, 0, loopBufR.data(), loopLen);

		std::unique_ptr<juce::FileOutputStream> stream(file.createOutputStream());
		if (stream == nullptr)
			return false;

		juce::WavAudioFormat format;
		std::unique_ptr<juce::AudioFormatWriter> writer(
		    format.createWriterFor(stream.get(), currentSampleRate, 2, 32, {}, 0));

		if (writer == nullptr)
			return false;

		stream.release();
		return writer->writeFromAudioSampleBuffer(buffer, 0, loopLen);
	}

	bool loadLoopSidecarFile()
	{
		if (loopSidecarId < 1.0)
			return false;

		const auto file = getSidecarFile();
		if (! file.existsAsFile())
			return false;

		juce::AudioFormatManager manager;
		manager.registerBasicFormats();

		std::unique_ptr<juce::AudioFormatReader> reader(manager.createReaderFor(file));
		if (reader == nullptr)
			return false;

		const int64 srcLen = reader->lengthInSamples;
		if (srcLen <= 0)
			return false;

		juce::AudioBuffer<float> src(2, (int) juce::jmin(srcLen, (int64) LOOP_CAPACITY));
		reader->read(&src, 0, src.getNumSamples(), 0, true, true);

		const int outLen = juce::jmin(
		    (int) std::lround((double) src.getNumSamples() * currentSampleRate / reader->sampleRate),
		    loopMaxSamples,
		    LOOP_CAPACITY);

		if (outLen <= 0)
			return false;

		const double ratio = (double) src.getNumSamples() / (double) outLen;

		for (int i = 0; i < outLen; ++i)
		{
			const double srcPos = (double) i * ratio;
			const int    idx    = (int) srcPos;
			const float  frac   = (float) (srcPos - (double) idx);
			const int    idx1   = juce::jmin(idx + 1, src.getNumSamples() - 1);

			loopBufL[(size_t) i] = src.getSample(0, idx) + frac * (src.getSample(0, idx1) - src.getSample(0, idx));
			loopBufR[(size_t) i] = src.getSample(1, idx) + frac * (src.getSample(1, idx1) - src.getSample(1, idx));
		}

		loopLen            = outLen;
		loopRead           = 0;
		loopWrite          = outLen;
		recording          = false;
		playing            = false;
		loopCueCountdown   = -1;
		return true;
	}

	// Hann² OLA gain compensation for OVERLAP=4. With coherent phase (PhaseRandom=0)
	// successive hops add in phase ⇒ 1/Σw² = 1/1.5 ≈ 0.667. With fully random phase
	// the hops add like uncorrelated noise ⇒ 1/√Σw² = 1/√1.5 ≈ 0.816 (we lose the
	// √OVERLAP factor of coherent summation). We crossfade between both in the power
	// domain so the wet path keeps a stable RMS for any PhaseRandom value.
	static constexpr float OLA_GAIN_COHERENT = 1.0f / 1.5f;
	static inline const float OLA_GAIN_RANDOM = 1.0f / std::sqrt(1.5f);

	void prepare(PrepareSpecs specs)
	{
		currentSampleRate = specs.sampleRate;

		for (int n = 0; n < FFT_SIZE; ++n)
			window[n] = 0.5f - 0.5f * std::cos(2.0f * juce::MathConstants<float>::pi
			                                  * (float) n / (float) (FFT_SIZE - 1));

		// Looper: cap recording length to 10 seconds at the host sample rate,
		// but never overflow our pre-allocated buffer.
		const int srSamples = (int) std::lround(specs.sampleRate) * LOOP_MAX_SECONDS;
		loopMaxSamples = juce::jmin(srSamples, LOOP_CAPACITY);

		reset();

		if (loopSidecarId >= 1.0)
			loadLoopSidecarFile();
	}

	void reset()
	{
		for (auto& c : ch)
			c.resetRuntime();
		for (auto& c : chLp)
			c.resetRuntime();

		hopCounter = 0;
		cueArmed   = false;
		lastCue    = 0.0f;
		loopCueCountdown = -1;

		// Looper: clear pointers/flags but leave the buffer memory alone
		// (we set loopLen=0 so nothing will be read until a new recording).
		// lastRec/lastPlay also go to 0 so the next setParameter rising
		// edge from the bootstrap re-trigger really fires.
		recording = false;
		playing   = false;
		lastRec   = 0.0f;
		lastPlay  = 0.0f;
		lastClear = 0.0f;
		loopWrite = 0;
		loopRead  = 0;
		loopLen   = 0;

		monoLevelL  = 0.0f;
		monoLevelR  = 0.0f;
		monoLActive = false;
		monoRActive = false;
	}

	// Clear the looper buffer + the loop branch's frozen snapshot so the
	// "loop has nothing" state is fully audible (no leftover frozen pad).
	void clearLoopBuffer()
	{
		recording = false;
		playing   = false;
		loopWrite = 0;
		loopRead  = 0;
		loopLen   = 0;
		loopCueCountdown = -1;

		for (auto& c : chLp)
		{
			c.frozenMag.fill(0.0f);
			c.frozenPhase.fill(0.0f);
			c.snapshotEnergy = 0.0f;
			c.makeupSmoothed = 1.0f;
			c.hasSnapshot = false;
			c.resetRuntime();
		}
	}

	void handleHiseEvent(HiseEvent& /*e*/) {}
	int  handleModulation(double& /*value*/) { return 0; }
	void setExternalData(const ExternalData& /*data*/, int /*index*/) {}

	template <typename T> void process(T& data)
	{
		static constexpr int NumChannels = getFixChannelAmount();
		auto& fixData = data.template as<ProcessData<NumChannels>>();
		auto fd = fixData.toFrameData();

		while (fd.next())
			processFrame(fd.toSpan());
	}

	template <typename T> void processFrame(T& frame)
	{
		float inL = frame[0];
		float inR = frame[1];

		// One-pole follower of channel envelope (~30 ms RC at 44.1 kHz).
		// We only need this to be stable across hops, not sample-accurate.
		static constexpr float kMonoFollow = 1.0e-3f;
		monoLevelL += kMonoFollow * (std::abs(inL) - monoLevelL);
		monoLevelR += kMonoFollow * (std::abs(inR) - monoLevelR);

		// Conservative mono test: an absolute floor (~ -100 dB) so we never
		// flip mono on truly silent input, and a 60 dB ratio so any real
		// stereo content disables the upmix.
		static constexpr float kMonoFloor = 1.0e-5f;
		static constexpr float kMonoRatio = 1.0e-3f;
		monoLActive = (monoLevelL > kMonoFloor) && (monoLevelR < monoLevelL * kMonoRatio);
		monoRActive = (monoLevelR > kMonoFloor) && (monoLevelL < monoLevelR * kMonoRatio);

		if (monoLActive)
			inR = inL;
		else if (monoRActive)
			inL = inR;

		// --- Looper: write before the freeze sees the input ---
		// Recording captures the dry input (before freeze) so the loop is
		// always a clean copy of what was played in. If we hit the 10 s
		// ceiling we auto-stop and lock the loop length there.
		if (recording)
		{
			loopBufL[loopWrite] = inL;
			loopBufR[loopWrite] = inR;
			++loopWrite;
			if (loopWrite >= loopMaxSamples)
			{
				recording = false;
				loopLen   = loopMaxSamples;
				saveLoopSidecarFile();
			}
		}

		// Looper playback: read one sample from the loop if there is content
		// and Play is on. The loop runs through its OWN freeze pipeline so
		// it can be frozen independently of the live input.
		float loopL = 0.0f;
		float loopR = 0.0f;
		if (playing && loopLen > 0)
		{
			loopL = loopBufL[loopRead];
			loopR = loopBufR[loopRead];
			++loopRead;
			if (loopRead >= loopLen)
				loopRead = 0;
		}

		const float lm   = (float) loopMix;
		const float lpL  = lm * loopL;
		const float lpR  = lm * loopR;

		// Feed each pipeline its own dry source.
		ch[0].inRing[ch[0].writeIdx]   = inL;
		ch[1].inRing[ch[1].writeIdx]   = inR;
		chLp[0].inRing[chLp[0].writeIdx] = lpL;
		chLp[1].inRing[chLp[1].writeIdx] = lpR;
		ch[0].writeIdx   = (ch[0].writeIdx   + 1) % FFT_SIZE;
		ch[1].writeIdx   = (ch[1].writeIdx   + 1) % FFT_SIZE;
		chLp[0].writeIdx = (chLp[0].writeIdx + 1) % FFT_SIZE;
		chLp[1].writeIdx = (chLp[1].writeIdx + 1) % FFT_SIZE;

		if (++hopCounter >= HOP)
		{
			hopCounter = 0;

			// AutoCue: probabilistic re-trigger of the snapshot every hop.
			// 0    = static freeze (manual Cue only).
			// 0.05 = sparse glitchy bursts (~1 retrigger per second).
			// 1.0  = retrigger every hop ⇒ input gets sliced into ~46 ms
			//        granular shards, à la Microcosm "Glitch".
			// Tip the dice once per hop (not per channel) so all four
			// pipelines stay phase-locked on the same captured frame.
			if (autoCue > 0.0 && rng.nextFloat() < (float) autoCue)
				cueArmed = true;

			// One-shot auto-cue for the loop pipeline N hops after Play
			// rose (gives chLp.inRing time to fill with real loop audio).
			bool autoCaptureLoop = false;
			if (loopCueCountdown >= 0)
			{
				if (loopCueCountdown == 0)
				{
					autoCaptureLoop  = true;
					loopCueCountdown = -1;
				}
				else
				{
					--loopCueCountdown;
				}
			}

			// The loop pipeline only captures a snapshot when there is
			// actual loop audio in its input ring; otherwise we'd freeze
			// silence (zero-magnitude spectrum) and FreezeLoop would mute
			// the loop instead of "freezing" it.
			const bool cueLp =
			    (cueArmed || autoCaptureLoop) && playing && loopLen > 0;

			const bool monoIn = monoLActive || monoRActive;
			if (monoIn)
			{
				// Live-input pipeline: one FFT analysis on ch[0] (both
				// rings carry the same content), then mirror the captured
				// spectrum into ch[1] and resynthesise with independent
				// random phases for the stereo widener feel.
				doHopAnalysis (ch[0], smear, cueArmed);
				doHopSynthesis(ch[0]);
				copyFrozenState(ch[0], ch[1]);
				doHopSynthesis(ch[1]);

				doHopAnalysis (chLp[0], smearLoop, cueLp);
				doHopSynthesis(chLp[0]);
				copyFrozenState(chLp[0], chLp[1]);
				doHopSynthesis(chLp[1]);
			}
			else
			{
				doHop(ch[0],   smear,     cueArmed);
				doHop(ch[1],   smear,     cueArmed);
				doHop(chLp[0], smearLoop, cueLp);
				doHop(chLp[1], smearLoop, cueLp);
			}
			cueArmed = false;
		}

		const float outInL = ch[0].outRing[ch[0].readIdx];
		const float outInR = ch[1].outRing[ch[1].readIdx];
		const float outLpL = chLp[0].outRing[chLp[0].readIdx];
		const float outLpR = chLp[1].outRing[chLp[1].readIdx];
		ch[0].outRing[ch[0].readIdx]     = 0.0f;
		ch[1].outRing[ch[1].readIdx]     = 0.0f;
		chLp[0].outRing[chLp[0].readIdx] = 0.0f;
		chLp[1].outRing[chLp[1].readIdx] = 0.0f;
		ch[0].readIdx   = (ch[0].readIdx   + 1) % FFT_SIZE;
		ch[1].readIdx   = (ch[1].readIdx   + 1) % FFT_SIZE;
		chLp[0].readIdx = (chLp[0].readIdx + 1) % FFT_SIZE;
		chLp[1].readIdx = (chLp[1].readIdx + 1) % FFT_SIZE;

		// Equal-power crossfade per pipeline, then sum both branches.
		// If a pipeline has no snapshot yet we force its w=0 so it never
		// hears silence (FreezeAmount with empty outRing would null it).
		const bool readyIn = ch[0].hasSnapshot   && ch[1].hasSnapshot;
		const bool readyLp = chLp[0].hasSnapshot && chLp[1].hasSnapshot;

		const float wIn = readyIn ? juce::jlimit(0.0f, 1.0f, (float) freezeAmount) : 0.0f;
		const float wLp = readyLp ? juce::jlimit(0.0f, 1.0f, (float) freezeLoop)   : 0.0f;

		const float gWetIn = std::sin(wIn * juce::MathConstants<float>::halfPi);
		const float gDryIn = std::cos(wIn * juce::MathConstants<float>::halfPi);
		const float gWetLp = std::sin(wLp * juce::MathConstants<float>::halfPi);
		const float gDryLp = std::cos(wLp * juce::MathConstants<float>::halfPi);

		// Dry stays at unity so FreezeAmount=0 / FreezeLoop=0 is a true
		// bypass and the user doesn't feel a hole when backing off the
		// freeze knobs.
		static constexpr float DRY_GAIN = 1.0f;

		// Wet makeup: random-phase reconstruction preserves RMS but loses
		// peak amplitude (a tone reconstructed with random phase comes out
		// as noise of the same RMS but ~6 dB lower crest factor). Boost the
		// wet path proportionally to PhaseRandom so the perceived loudness
		// stays even with the dry. At PhaseRandom=0 (coherent freeze) the
		// makeup is 1.0 (no change).
		const float pr        = juce::jlimit(0.0f, 1.0f, (float) phaseRandom);
		const float wetMakeup = 1.0f + pr; // 1.0 .. 2.0 (≈ +6 dB max)

		const float inGain = juce::jlimit(0.0f, 1.0f, (float) inputLevel);
		const float lpGain = juce::jlimit(0.0f, 1.0f, (float) loopLevel);

		const float inOutL = gWetIn * outInL * wetMakeup + gDryIn * inL * DRY_GAIN;
		const float inOutR = gWetIn * outInR * wetMakeup + gDryIn * inR * DRY_GAIN;
		const float lpOutL = gWetLp * outLpL * wetMakeup + gDryLp * lpL * DRY_GAIN;
		const float lpOutR = gWetLp * outLpR * wetMakeup + gDryLp * lpR * DRY_GAIN;

		frame[0] = inGain * inOutL + lpGain * lpOutL;
		frame[1] = inGain * inOutR + lpGain * lpOutR;
	}

	// Analysis half of one hop: windowed FFT of the input ring, then
	// either capture the magnitude/phase as the new snapshot or smear
	// the frozen magnitudes toward the live input. Leaves frozenMag /
	// frozenPhase / snapshotEnergy / makeupSmoothed up to date but does
	// NOT touch outRing.
	void doHopAnalysis(ChannelState& c, double smearVal, bool captureSnapshot)
	{
		for (int n = 0; n < FFT_SIZE; ++n)
		{
			const int idx = (c.writeIdx + n) % FFT_SIZE;
			c.fftScratch[n]            = c.inRing[idx] * window[n];
			c.fftScratch[n + FFT_SIZE] = 0.0f;
		}

		fft.performRealOnlyForwardTransform(c.fftScratch.data());

		if (captureSnapshot)
		{
			double e = 0.0;
			for (int b = 0; b < NUM_BINS; ++b)
			{
				const float re = c.fftScratch[2 * b];
				const float im = c.fftScratch[2 * b + 1];
				const float mag  = std::sqrt(re * re + im * im);
				c.frozenMag[b]   = mag;
				c.frozenPhase[b] = std::atan2(im, re);
				e += (double) mag * (double) mag;
			}
			c.snapshotEnergy = (float) e;
			c.makeupSmoothed = 1.0f;
			c.hasSnapshot = true;
		}
		else if (c.hasSnapshot && smearVal > 0.0)
		{
			// Slowly let the frozen magnitudes track the live input so the
			// texture "breathes". smearVal=1 → ~5% per hop.
			const float a = juce::jlimit(0.0f, 1.0f, (float) smearVal) * 0.05f;
			double eNow = 0.0;
			for (int b = 0; b < NUM_BINS; ++b)
			{
				const float re = c.fftScratch[2 * b];
				const float im = c.fftScratch[2 * b + 1];
				const float m  = std::sqrt(re * re + im * im);
				c.frozenMag[b] += a * (m - c.frozenMag[b]);
				eNow += (double) c.frozenMag[b] * (double) c.frozenMag[b];
			}

			// Makeup gain so Smear keeps the same overall level as the
			// captured snapshot even when the live input is quieter (or
			// silent). Clamped to a sane window so a near-empty spectrum
			// can't produce wild amplification, and one-pole smoothed so
			// the gain doesn't jump per hop.
			const float makeupTarget = (eNow > 1.0e-12 && c.snapshotEnergy > 0.0f)
			    ? juce::jlimit(0.25f, 4.0f,
			                   std::sqrt(c.snapshotEnergy / (float) eNow))
			    : 1.0f;
			c.makeupSmoothed += 0.1f * (makeupTarget - c.makeupSmoothed);
		}
	}

	// Synthesis half of one hop: random-phase IFFT of the (already
	// captured) frozen spectrum, then overlap-add into outRing. Each
	// call consumes its own random-phase realisation, so calling
	// doHopSynthesis twice on the same frozen state (e.g. for the mono
	// upmix mirror) produces a decorrelated companion channel.
	void doHopSynthesis(ChannelState& c)
	{
		if (! c.hasSnapshot)
			return;

		const float pr     = juce::jlimit(0.0f, 1.0f, (float) phaseRandom);
		const float twoPi  = juce::MathConstants<float>::twoPi;
		const float piOne  = juce::MathConstants<float>::pi;

		const float makeup = c.makeupSmoothed;

		for (int b = 0; b < NUM_BINS; ++b)
		{
			const float mag    = c.frozenMag[b] * makeup;
			const float randPh = rng.nextFloat() * twoPi - piOne;
			const float ph     = pr * randPh + (1.0f - pr) * c.frozenPhase[b];

			c.fftScratch[2 * b]     = mag * std::cos(ph);
			c.fftScratch[2 * b + 1] = mag * std::sin(ph);
		}

		// Zero the mirrored negative-frequency bins so the IFFT treats the
		// spectrum as Hermitian-symmetric around Nyquist. JUCE expects the
		// full 2N layout to be valid for performRealOnlyInverseTransform.
		for (int b = NUM_BINS; b < FFT_SIZE; ++b)
		{
			const int mirror = FFT_SIZE - b;
			c.fftScratch[2 * b]     =  c.fftScratch[2 * mirror];
			c.fftScratch[2 * b + 1] = -c.fftScratch[2 * mirror + 1];
		}

		fft.performRealOnlyInverseTransform(c.fftScratch.data());

		// Pick the OLA gain that matches the current phase coherence.
		// Power-domain interpolation between coherent and random regimes.
		const float olaGain = std::sqrt(  OLA_GAIN_COHERENT * OLA_GAIN_COHERENT * (1.0f - pr)
		                                + OLA_GAIN_RANDOM   * OLA_GAIN_RANDOM   *        pr );

		for (int n = 0; n < FFT_SIZE; ++n)
		{
			const int idx = (c.readIdx + n) % FFT_SIZE;
			c.outRing[idx] += c.fftScratch[n] * window[n] * olaGain;
		}
	}

	void doHop(ChannelState& c, double smearVal, bool captureSnapshot)
	{
		doHopAnalysis(c, smearVal, captureSnapshot);
		doHopSynthesis(c);
	}

	// Mirror the frozen spectrum (and the smear/makeup state that drives
	// it) from one channel to another so the mirror can resynthesise an
	// independent random-phase realisation of the SAME spectrum.
	static void copyFrozenState(const ChannelState& src, ChannelState& dst)
	{
		dst.frozenMag      = src.frozenMag;
		dst.frozenPhase    = src.frozenPhase;
		dst.snapshotEnergy = src.snapshotEnergy;
		dst.makeupSmoothed = src.makeupSmoothed;
		dst.hasSnapshot    = src.hasSnapshot;
	}

	template <int P> void setParameter(double v)
	{
		if (P == 0)
		{
			const float cur = (float) v;
			if (lastCue < 0.5f && cur >= 0.5f)
				cueArmed = true;
			lastCue = cur;
		}
		else if (P == 1)
		{
			freezeAmount = v;
		}
		else if (P == 2)
		{
			phaseRandom = v;
		}
		else if (P == 3)
		{
			// Slider invertido: 1 = freeze estático, 0 = breathing máximo.
			smear = 1.0 - v;
		}
		else if (P == 4)
		{
			autoCue = v;
		}
		else if (P == 5)
		{
			// Rec: rising edge (0→1) starts a fresh recording from sample 0.
			// Falling edge (1→0) stops recording and locks loopLen so the
			// captured length becomes the loop period.
			const float cur = (float) v;
			if (lastRec < 0.5f && cur >= 0.5f)
			{
				recording = true;
				loopWrite = 0;
				loopLen   = 0;
			}
			else if (lastRec >= 0.5f && cur < 0.5f)
			{
				if (recording)
				{
					recording = false;
					loopLen   = loopWrite;
					loopRead  = 0;

					if (playing && loopLen > 0)
						loopCueCountdown = OVERLAP;
				}

				if (loopLen > 0)
					saveLoopSidecarFile();
			}
			lastRec = cur;
		}
		else if (P == 6)
		{
			// Play: rising edge restarts playback from sample 0; falling
			// edge mutes playback. The loop content is preserved either way.
			// Rising edge also schedules an auto-cue for the loop pipeline
			// once OVERLAP hops of fresh loop content have been written
			// into chLp.inRing — that way FreezeLoop / SmearLoop have a
			// real snapshot to work with without the user having to press
			// Cue manually.
			const float cur = (float) v;
			if (lastPlay < 0.5f && cur >= 0.5f)
			{
				playing  = true;
				loopRead = 0;
				if (loopLen > 0)
					loopCueCountdown = OVERLAP;
			}
			else if (lastPlay >= 0.5f && cur < 0.5f)
			{
				playing = false;
				loopCueCountdown = -1;
			}
			lastPlay = cur;
		}
		else if (P == 7)
		{
			loopMix = v;
		}
		else if (P == 8)
		{
			freezeLoop = v;
		}
		else if (P == 9)
		{
			// Slider invertido (mismo criterio que Smear).
			smearLoop = 1.0 - v;
		}
		else if (P == 10)
		{
			// Clear: rising edge wipes the looper buffer + loop freeze
			// snapshot. Falling edge does nothing (the button is meant to
			// be momentary).
			const float cur = (float) v;
			if (lastClear < 0.5f && cur >= 0.5f)
				clearLoopBuffer();
			lastClear = cur;
		}
		else if (P == 11)
		{
			inputLevel = v;
		}
		else if (P == 12)
		{
			loopLevel = v;
		}
		else if (P == 13)
		{
			loopSidecarId = v;
		}
		else if (P == 14)
		{
			const float cur = (float) v;
			if (lastLoopSidecarLoad < 0.5f && cur >= 0.5f)
				loadLoopSidecarFile();
			lastLoopSidecarLoad = cur;
		}
		else if (P == 15)
		{
			const float cur = (float) v;
			if (lastLoopSidecarSave < 0.5f && cur >= 0.5f && loopLen > 0)
				saveLoopSidecarFile();
			lastLoopSidecarSave = cur;
		}
	}

	void createParameters(ParameterDataList& data)
	{
		{
			parameter::data p("Cue", { 0.0, 1.0 });
			registerCallback<0>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("FreezeAmount", { 0.0, 1.0 });
			registerCallback<1>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("PhaseRandom", { 0.0, 1.0 });
			registerCallback<2>(p);
			p.setDefaultValue(1.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Smear", { 0.0, 1.0 });
			registerCallback<3>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("AutoCue", { 0.0, 1.0 });
			registerCallback<4>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Rec", { 0.0, 1.0 });
			registerCallback<5>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Play", { 0.0, 1.0 });
			registerCallback<6>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("LoopMix", { 0.0, 1.0 });
			registerCallback<7>(p);
			p.setDefaultValue(1.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("FreezeLoop", { 0.0, 1.0 });
			registerCallback<8>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("SmearLoop", { 0.0, 1.0 });
			registerCallback<9>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("Clear", { 0.0, 1.0 });
			registerCallback<10>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("InputLevel", { 0.0, 1.0 });
			registerCallback<11>(p);
			p.setDefaultValue(1.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("LoopLevel", { 0.0, 1.0 });
			registerCallback<12>(p);
			p.setDefaultValue(1.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("LoopSidecarId", { 0.0, 999999999.0 });
			registerCallback<13>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("LoopSidecarLoad", { 0.0, 1.0 });
			registerCallback<14>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
		{
			parameter::data p("LoopSidecarSave", { 0.0, 1.0 });
			registerCallback<15>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
	}
};

}
