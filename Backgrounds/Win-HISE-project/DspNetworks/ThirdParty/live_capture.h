// ==============================================================================
// Third Party Node — live_capture
// Pass-through that records the input into an AudioFile while Gate is On.
// Gate Off flushes the take (message thread) so script can read getContent().
//
// FactoryPath: project.live_capture
// Compile: File → Compile DSP networks, then rebuild the DSP DLL.
// ==============================================================================
#pragma once

#include <JuceHeader.h>

namespace project
{

using namespace juce;
using namespace hise;
using namespace scriptnode;

template <int NV> struct live_capture: public data::base
{
	SNEX_NODE(live_capture);

	struct MetadataClass
	{
		SN_NODE_ID("live_capture");
	};

	static constexpr bool isModNode() { return false; };
	static constexpr bool isPolyphonic() { return NV > 1; };
	static constexpr bool hasTail() { return false; };
	static constexpr bool isSuspendedOnSilence() { return false; };
	static constexpr int getFixChannelAmount() { return 2; };

	static constexpr int NumTables = 0;
	static constexpr int NumSliderPacks = 0;
	static constexpr int NumAudioFiles = 1;
	static constexpr int NumFilters = 0;
	static constexpr int NumDisplayBuffers = 0;

	static constexpr double MaxSeconds = 600.0;

	live_capture() = default;

	void prepare(PrepareSpecs specs)
	{
		lastSpecs = specs;
		if (updater != nullptr)
			updater->resizeFlag.store(true);
		else
			rebuildBuffer();
	}

	void reset()
	{
		recording = false;
		prevGate = false;
		recordingIndex = 0;
	}

	void handleHiseEvent(HiseEvent&) {}
	bool handleModulation(double&) { return false; }

	void setExternalData(const ExternalData& d, int index)
	{
		if (updater == nullptr && d.obj != nullptr)
		{
			if (auto gu = d.obj->getUpdater().getGlobalUIUpdater())
				updater = new InternalUpdater(*this, gu);
		}

		if (auto af = dynamic_cast<MultiChannelAudioBuffer*>(d.obj))
			af->setDisabledXYZProviders({ Identifier("SampleMap"), Identifier("SFZ") });

		data::base::setExternalData(d, index);
	}

	template <typename T> void processFrame(T&) {}

	template <typename ProcessDataType> void process(ProcessDataType& data)
	{
		if (!recording || data.getNumChannels() < 1)
			return;

		SimpleReadWriteLock::ScopedReadLock sl(bufferLock);
		const int n = data.getNumSamples();
		const int nChIn = data.getNumChannels();
		const int cap = recordingBuffer.getNumSamples();
		const int nChBuf = recordingBuffer.getNumChannels();
		if (cap < 1 || n < 1 || nChBuf < 1)
			return;

		float* inL = data[0].begin();
		float* inR = nChIn > 1 ? data[1].begin() : inL;

		for (int i = 0; i < n; ++i)
		{
			if (recordingIndex >= cap)
			{
				recording = false;
				if (updater != nullptr)
					updater->flushFlag.store(true);
				break;
			}

			recordingBuffer.setSample(0, recordingIndex, inL[i]);
			if (nChBuf > 1)
				recordingBuffer.setSample(1, recordingIndex, inR[i]);
			++recordingIndex;
		}
	}

	template <int P> void setParameter(double v)
	{
		if (P == 0) // Gate
		{
			const bool on = v > 0.5;
			if (on && !prevGate)
			{
				if (recordingBuffer.getNumSamples() < 16)
					rebuildBuffer();
				recordingIndex = 0;
				recording = true;
			}
			else if (!on && prevGate)
			{
				recording = false;
				if (updater != nullptr)
					updater->flushFlag.store(true);
				else
					flush();
			}
			prevGate = on;
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
	}

	void flush()
	{
		SimpleReadWriteLock::ScopedReadLock sl(bufferLock);
		const int n = jlimit(0, recordingBuffer.getNumSamples(), recordingIndex);
		if (n < 16)
			return;

		AudioSampleBuffer take(recordingBuffer.getNumChannels(), n);
		for (int c = 0; c < take.getNumChannels(); ++c)
			take.copyFrom(c, 0, recordingBuffer, c, 0, n);

		if (auto af = dynamic_cast<MultiChannelAudioBuffer*>(externalData.obj))
			af->loadBuffer(take, lastSpecs.sampleRate > 0.0 ? lastSpecs.sampleRate : 44100.0);
	}

	void rebuildBuffer()
	{
		const double sr = lastSpecs.sampleRate > 0.0 ? lastSpecs.sampleRate : 44100.0;
		const int nCh = jmax(2, lastSpecs.numChannels);
		const int n = jmax(16, (int)std::ceil(MaxSeconds * sr));
		AudioSampleBuffer next(nCh, n);
		next.clear();
		{
			SimpleReadWriteLock::ScopedWriteLock wl(bufferLock);
			std::swap(next, recordingBuffer);
			recordingIndex = 0;
		}
	}

private:
	struct InternalUpdater : public PooledUIUpdater::SimpleTimer
	{
		InternalUpdater(live_capture& p, PooledUIUpdater* u) :
			SimpleTimer(u),
			parent(p)
		{}

		void timerCallback() override
		{
			if (resizeFlag.exchange(false))
				parent.rebuildBuffer();
			if (flushFlag.exchange(false))
				parent.flush();
		}

		std::atomic<bool> resizeFlag { false };
		std::atomic<bool> flushFlag { false };
		live_capture& parent;
	};

	ScopedPointer<InternalUpdater> updater;
	PrepareSpecs lastSpecs;
	SimpleReadWriteLock bufferLock;
	AudioSampleBuffer recordingBuffer;
	int recordingIndex = 0;
	bool recording = false;
	bool prevGate = false;
};

} // namespace project
