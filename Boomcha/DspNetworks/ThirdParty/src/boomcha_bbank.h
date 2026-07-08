#pragma once

#include <JuceHeader.h>
#include <memory>

namespace boomcha
{

/** Binary bank exported by drum_classifier/export_bank_for_cpp.py (BCBK v1 / v2). */
struct BbankData
{
	static constexpr uint32 kMagic = 0x4B424342u; // "BCBK" as uint32 LE
	static constexpr int kBankSlots = 32;

	int version = 0;
	int numPatterns = 0;
	int numSlots = 0;
	std::vector<float> patterns; // legacy / fallback: [N * slots * 2]; empty when using mmap patterns
	std::vector<juce::String> metaPaths;
	std::vector<int> metaBarStarts;
	std::vector<float> metaBpm;
	std::vector<uint8> metaTernary;

	/** Memory-map the .bbank file; pattern grid is read from the map (no duplicate float blob). */
	std::shared_ptr<juce::MemoryMappedFile> mmapStorage;
	const uint8* fileData = nullptr;
	size_t fileSize = 0;
	size_t patternRegionOffset = 0;
	size_t patternRegionNumBytes = 0;
	enum class PatternMode
	{
		Empty,
		MmapFloat32,
		MmapUInt8Quantized,
		VectorFloat
	};
	PatternMode patternMode = PatternMode::Empty;

	/** Row-major: pattern i, linear index 0..(kBankSlots*2-1), BD/SD interleaved per slot. */
	float getPatternValue(int patternIndex, int linearIdx) const
	{
		const size_t rowStride = (size_t)kBankSlots * 2u;
		const size_t idx = (size_t)patternIndex * rowStride + (size_t)linearIdx;
		if (patternMode == PatternMode::MmapFloat32 && fileData != nullptr)
		{
			const auto* base = reinterpret_cast<const float*>(fileData + patternRegionOffset);
			return base[idx];
		}
		if (patternMode == PatternMode::MmapUInt8Quantized && fileData != nullptr)
			return (float)fileData[patternRegionOffset + idx] / 255.0f;
		if (patternMode == PatternMode::VectorFloat && idx < patterns.size())
			return patterns[idx];
		return 0.0f;
	}

	juce::Result loadFromFile(const juce::File& f)
	{
		if (!f.existsAsFile())
			return juce::Result::fail("Bank file missing: " + f.getFullPathName());

		clearMmap();
		mmapStorage = std::make_shared<juce::MemoryMappedFile>(f, juce::MemoryMappedFile::readOnly);
		if (mmapStorage == nullptr || mmapStorage->getData() == nullptr || mmapStorage->getSize() == 0)
			return juce::Result::fail("Could not memory-map bank file");

		fileData = static_cast<const uint8*>(mmapStorage->getData());
		fileSize = mmapStorage->getSize();
		const uint8* p = fileData;
		const size_t n = fileSize;
		size_t o = 0;
		auto need = [&](size_t sz) -> bool { return o + sz <= n; };

		if (!need(4))
			return juce::Result::fail("Truncated bank");
		const uint32 magic = readU32(p + o);
		if (magic != kMagic)
			return juce::Result::fail("Bad bank magic");
		o += 4;
		if (!need(8))
			return juce::Result::fail("Truncated bank header");
		version = (int)readU32(p + o);
		numPatterns = (int)readU32(p + o + 4);
		o += 8;

		if (version == 3)
			return juce::Result::fail(
			    "Unsupported .bbank version: 3 (zlib). Re-export with: "
			    "python3 drum_classifier/export_bank_for_cpp.py ... -o out.bbank --format 2");
		if (version == 1)
			return loadV1(p, n, o);
		if (version == 2)
			return loadV2(p, n, o);
		return juce::Result::fail("Unsupported .bbank version: " + juce::String(version)
		                          + " (need 1 or 2)");
	}

private:
	void clearMmap()
	{
		mmapStorage.reset();
		fileData = nullptr;
		fileSize = 0;
		patternRegionOffset = 0;
		patternRegionNumBytes = 0;
		patternMode = PatternMode::Empty;
		patterns.clear();
	}

	static uint32 readU32(const uint8* b)
	{
		return (uint32)b[0] | ((uint32)b[1] << 8) | ((uint32)b[2] << 16) | ((uint32)b[3] << 24);
	}

	juce::Result loadV1(const uint8* p, size_t n, size_t o)
	{
		auto need = [&](size_t sz) -> bool { return o + sz <= n; };

		const size_t patBytes = (size_t)numPatterns * (size_t)kBankSlots * 2u * sizeof(float);
		if (!need(patBytes))
			return juce::Result::fail("Truncated patterns blob");
		numSlots = kBankSlots;
		patternRegionOffset = o;
		patternRegionNumBytes = patBytes;
		patternMode = PatternMode::MmapFloat32;
		patterns.clear();
		o += patBytes;

		if (!need(4))
			return juce::Result::fail("Truncated meta count");
		const uint32 nmeta = readU32(p + o);
		o += 4;
		if ((int)nmeta != numPatterns)
			return juce::Result::fail("meta count mismatch");

		metaPaths.clear();
		metaPaths.reserve(numPatterns);
		for (int i = 0; i < numPatterns; ++i)
		{
			if (!need(4))
				return juce::Result::fail("Truncated path len");
			const uint32 slen = readU32(p + o);
			o += 4;
			if (!need(slen))
				return juce::Result::fail("Truncated path string");
			metaPaths.push_back(juce::String::fromUTF8((const char*)(p + o), (int)slen));
			o += slen;
		}

		const size_t barBytes = (size_t)numPatterns * sizeof(int32);
		const size_t bpmBytes = (size_t)numPatterns * sizeof(float);
		const size_t terBytes = (size_t)numPatterns * sizeof(uint8);
		if (!need(barBytes + bpmBytes + terBytes))
			return juce::Result::fail("Truncated meta arrays");

		metaBarStarts.resize(numPatterns);
		memcpy(metaBarStarts.data(), p + o, barBytes);
		o += barBytes;
		metaBpm.resize(numPatterns);
		memcpy(metaBpm.data(), p + o, bpmBytes);
		o += bpmBytes;
		metaTernary.resize(numPatterns);
		memcpy(metaTernary.data(), p + o, terBytes);
		o += terBytes;

		if (o != n)
			juce::Logger::writeToLog("bbank v1: trailing bytes ignored");

		return juce::Result::ok();
	}

	juce::Result loadV2(const uint8* p, size_t n, size_t o)
	{
		auto need = [&](size_t sz) -> bool { return o + sz <= n; };

		if (!need(4))
			return juce::Result::fail("Truncated bank (v2 numSlots)");
		numSlots = (int)readU32(p + o);
		o += 4;
		if (numSlots != kBankSlots)
			return juce::Result::fail("Unsupported v2 slot count (expected 32)");

		const size_t patCount = (size_t)numPatterns * (size_t)numSlots * 2u;
		if (!need(patCount))
			return juce::Result::fail("Truncated patterns blob (v2)");
		patternRegionOffset = o;
		patternRegionNumBytes = patCount;
		patternMode = PatternMode::MmapUInt8Quantized;
		patterns.clear();
		o += patCount;

		if (!need(4))
			return juce::Result::fail("Truncated path table count (v2)");
		const uint32 numUnique = readU32(p + o);
		o += 4;

		std::vector<juce::String> pathTable;
		pathTable.reserve((size_t)numUnique + 1u);
		for (uint32 k = 0; k < numUnique; ++k)
		{
			if (!need(4))
				return juce::Result::fail("Truncated path len (v2 table)");
			const uint32 slen = readU32(p + o);
			o += 4;
			if (!need(slen))
				return juce::Result::fail("Truncated path string (v2 table)");
			pathTable.push_back(juce::String::fromUTF8((const char*)(p + o), (int)slen));
			o += slen;
		}

		const size_t idxBytes = (size_t)numPatterns * sizeof(uint32);
		if (!need(idxBytes))
			return juce::Result::fail("Truncated path indices (v2)");
		metaPaths.clear();
		metaPaths.reserve(numPatterns);
		for (int i = 0; i < numPatterns; ++i)
		{
			const uint32 idx = readU32(p + o + (size_t)i * sizeof(uint32));
			if (idx >= numUnique)
				return juce::Result::fail("Invalid path index in v2 bank");
			metaPaths.push_back(pathTable[(size_t)idx]);
		}
		o += idxBytes;

		const size_t barBytes = (size_t)numPatterns * sizeof(int32);
		const size_t bpmBytes = (size_t)numPatterns * sizeof(float);
		const size_t terBytes = (size_t)numPatterns * sizeof(uint8);
		if (!need(barBytes + bpmBytes + terBytes))
			return juce::Result::fail("Truncated meta arrays (v2)");

		metaBarStarts.resize(numPatterns);
		memcpy(metaBarStarts.data(), p + o, barBytes);
		o += barBytes;
		metaBpm.resize(numPatterns);
		memcpy(metaBpm.data(), p + o, bpmBytes);
		o += bpmBytes;
		metaTernary.resize(numPatterns);
		memcpy(metaTernary.data(), p + o, terBytes);
		o += terBytes;

		if (o != n)
			juce::Logger::writeToLog("bbank v2: trailing bytes ignored");

		return juce::Result::ok();
	}
};

} // namespace boomcha
