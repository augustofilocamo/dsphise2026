#pragma once

#include <JuceHeader.h>
#include <memory>
#include <unordered_map>

// #region agent log (b565f0)
namespace boomcha
{
namespace detail
{
inline void agentLog_b565f0(const char* hypothesisId, const juce::String& location,
                            const juce::String& message, const juce::var& data)
{
	auto* root = new juce::DynamicObject();
	root->setProperty("sessionId", "b565f0");
	root->setProperty("hypothesisId", juce::String(hypothesisId));
	root->setProperty("location", location);
	root->setProperty("message", message);
	root->setProperty("data", data);
	root->setProperty("timestamp", (int64)juce::Time::getMillisecondCounterHiRes());
	juce::File f("/Users/filo/Filo/VST-Project/dsphise/Boomcha/.cursor/debug-b565f0.log");
	f.appendText(juce::JSON::toString(juce::var(root), false) + "\n");
}
} // namespace detail
} // namespace boomcha
// #endregion

#ifndef USE_MANUAL_ZSTD
#define USE_MANUAL_ZSTD 0
#endif

#if USE_MANUAL_ZSTD
#include "boomcha_zstd_embedded.h"
#else
// HISE already links a zstd implementation in many targets, but this header
// needs the *declarations* (ZSTD_*) at compile time.
//
// Important: we only include zstd.h (declarations). We do NOT include the
// zstd *.c implementation files here, otherwise we'd end up duplicating
// symbols at link time when HISE also provides zstd.
#include "../zstd_vendor/zstd/zstd.h"

namespace boomcha
{
inline constexpr unsigned long long kZstdContentSizeUnknown = ZSTD_CONTENTSIZE_UNKNOWN;
inline constexpr unsigned long long kZstdContentSizeError = ZSTD_CONTENTSIZE_ERROR;

inline bool zstdRuntimeAvailable() { return true; }
} // namespace boomcha
#endif

// MidiFiles*.dat = mismo empaquetado que HISE (PoolBase: metadata zstd + blobs MIDI).
// zstd se embebe dentro del DLL (sin dependencia runtime de libzstd del sistema).

namespace boomcha
{

class PoolDataParser
{
public:
	static int readCompressedInt(juce::MemoryInputStream& mis)
	{
		int8_t sizeByte = 0;
		if (mis.read(&sizeByte, 1) != 1)
			return 0;
		auto ub = (uint8_t)sizeByte;
		if (ub == 0)
			return 0;
		uint8_t numBytes = ub & 0x7F;
		if (numBytes > 4)
			return 0;
		uint8_t raw[4];
		if (mis.read(raw, numBytes) != numBytes)
			return 0;
		uint32_t num = 0;
		for (int i = 0; i < numBytes; ++i)
			num |= ((uint32_t)raw[i]) << (8 * i);
		return (ub >> 7) ? -(int)num : (int)num;
	}

	static juce::String readString(juce::MemoryInputStream& mis)
	{
		juce::MemoryBlock mb;
		while (mis.getNumBytesRemaining() > 0)
		{
			char c = 0;
			if (mis.read(&c, 1) != 1)
				break;
			if (c == 0)
				return mb.toString();
			mb.append(&c, 1);
		}
		return mb.toString();
	}

	static juce::var readVar(juce::MemoryInputStream& mis)
	{
		const int VAR_MARKER_INT = 1;
		const int VAR_MARKER_INT64 = 6;
		const int VAR_MARKER_STRING = 5;

		int numBytes = readCompressedInt(mis);
		if (numBytes == 0)
			return juce::var();
		uint8_t marker = 0;
		if (mis.read(&marker, 1) != 1)
			return juce::var();

		if (marker == VAR_MARKER_INT)
		{
			uint8_t raw[4];
			if (mis.read(raw, 4) != 4)
				return juce::var();
			int32_t v = (int32_t)(raw[0] | (raw[1] << 8) | (raw[2] << 16) | (raw[3] << 24));
			return juce::var(v);
		}
		if (marker == VAR_MARKER_INT64)
		{
			uint8_t raw[8];
			if (mis.read(raw, 8) != 8)
				return juce::var();
			int64_t v = (int64_t)((uint64_t)raw[0] | ((uint64_t)raw[1] << 8) | ((uint64_t)raw[2] << 16)
			                      | ((uint64_t)raw[3] << 24) | ((uint64_t)raw[4] << 32)
			                      | ((uint64_t)raw[5] << 40) | ((uint64_t)raw[6] << 48) | ((uint64_t)raw[7] << 56));
			return juce::var((int)v);
		}
		if (marker == VAR_MARKER_STRING)
		{
			int payloadLen = numBytes - 1;
			juce::MemoryBlock buf((size_t)payloadLen);
			if (mis.read(buf.getData(), (int)payloadLen) != payloadLen)
				return juce::var();
			auto* b = (const char*)buf.getData();
			juce::String s(b, (size_t)payloadLen);
			if (s.endsWithChar(0))
				s = s.substring(0, s.length() - 1);
			return juce::var(s);
		}
		return juce::var();
	}

	static juce::var readValueTree(juce::MemoryInputStream& mis)
	{
		juce::String typeId = readString(mis);
		if (typeId.isEmpty())
			return juce::var();

		auto* obj = new juce::DynamicObject();
		obj->setProperty("type", typeId);

		int numProps = readCompressedInt(mis);
		for (int i = 0; i < numProps; ++i)
		{
			juce::String name = readString(mis);
			juce::var val = readVar(mis);
			obj->setProperty(juce::Identifier(name), val);
		}

		int numChildren = readCompressedInt(mis);
		juce::Array<juce::var> children;
		for (int i = 0; i < numChildren; ++i)
			children.add(readValueTree(mis));
		obj->setProperty("children", juce::var(children));

		return juce::var(obj);
	}

	static std::unordered_map<std::string, std::pair<int64, int64>> parsePoolData(const juce::MemoryBlock& decompressed)
	{
		std::unordered_map<std::string, std::pair<int64, int64>> map;
		juce::MemoryInputStream mis(decompressed, false);
		juce::var root = readValueTree(mis);
		auto* ro = root.getDynamicObject();
		if (ro == nullptr || ro->getProperty("type").toString() != "PoolData")
			return map;

		juce::var ch = ro->getProperty("children");
		auto* arr = ch.getArray();
		if (arr == nullptr)
			return map;

		for (auto& c : *arr)
		{
			auto* co = c.getDynamicObject();
			if (co == nullptr || co->getProperty("type").toString() != "Item")
				continue;
			juce::String id = co->getProperty("ID").toString();
			juce::var csV = co->getProperty("ChunkStart");
			juce::var ceV = co->getProperty("ChunkEnd");
			int64 cs = csV.isInt64() ? (int64)csV : (int64)(int)csV;
			int64 ce = ceV.isInt64() ? (int64)ceV : (int64)(int)ceV;
			if (id.isNotEmpty() && ce > cs)
				map[id.toStdString()] = {cs, ce};
		}
		return map;
	}
};

class MidiFilesDatReader
{
public:
	juce::Result open(const juce::File& datPath)
	{
		if (!datPath.existsAsFile())
			return juce::Result::fail("MidiFiles.dat missing");

		datMmap.reset();
		datMmap = std::make_unique<juce::MemoryMappedFile>(datPath, juce::MemoryMappedFile::readOnly);
		if (datMmap == nullptr || datMmap->getData() == nullptr || datMmap->getSize() == 0)
			return juce::Result::fail("Could not memory-map dat");

		const uint8* p = (const uint8*)datMmap->getData();
		const size_t n = datMmap->getSize();
		if (n < 8)
			return juce::Result::fail("dat too small");

		int64 metaSize = 0;
		memcpy(&metaSize, p, 8);
		if (metaSize <= 0 || (size_t)(8 + metaSize) > n)
			return juce::Result::fail("invalid metadata size");

		midiSectionOffset = (int64)(8 + metaSize);
		juce::MemoryBlock zstdBlock(p + 8, (size_t)metaSize);

		unsigned long long decSize = ZSTD_getFrameContentSize(zstdBlock.getData(), zstdBlock.getSize());
		if (decSize == kZstdContentSizeError || decSize == kZstdContentSizeUnknown)
			return juce::Result::fail("zstd frame error");

		decompressedMeta.setSize((size_t)decSize);
		size_t r = ZSTD_decompress(decompressedMeta.getData(), decompressedMeta.getSize(),
		                           zstdBlock.getData(), zstdBlock.getSize());
		if (ZSTD_isError(r))
			return juce::Result::fail("ZSTD_decompress failed");

		idMap = PoolDataParser::parsePoolData(decompressedMeta);
		datFile = datPath;
		return juce::Result::ok();
	}

	size_t getPoolEntryCount() const { return idMap.size(); }

	juce::File extractToCache(const juce::String& idStr, const juce::File& cacheDir) const
	{
		if (idStr.isEmpty())
			return {};

		juce::String key = idStr.replaceCharacter('\\', '/');
		auto it = idMap.find(key.toStdString());
		if (it == idMap.end())
		{
			juce::String low = key.toLowerCase();
			juce::String alt;
			if (low.endsWith(".midi"))
				alt = key.substring(0, key.length() - 5) + ".mid";
			else if (low.endsWith(".mid"))
				alt = key.substring(0, key.length() - 4) + ".midi";
			if (alt.isNotEmpty())
				it = idMap.find(alt.toStdString());
		}
		if (it == idMap.end())
			return {};

		int64 cs = it->second.first;
		int64 ce = it->second.second;
		cacheDir.createDirectory();

		juce::String base = juce::File(key).getFileName();
		if (base.toLowerCase().endsWith(".midi"))
			base = base.substring(0, base.length() - 5) + ".mid";
		else if (!base.toLowerCase().endsWith(".mid"))
			base += ".mid";

		uint32 hc = (uint32)juce::String(key).hashCode();
		juce::String h = juce::String::formatted("%08x", (unsigned)hc);
		if (h.length() > 10)
			h = h.substring(0, 10);
		auto out = cacheDir.getChildFile(base.upToLastOccurrenceOf(".", false, false) + "_" + h + ".mid");

		if (out.existsAsFile())
			return out;

		if (datMmap == nullptr || datMmap->getData() == nullptr || datMmap->getSize() == 0)
			return {};

		const uint8* raw = (const uint8*)datMmap->getData();
		const int64 datSize = (int64)datMmap->getSize();
		int64 absStart = midiSectionOffset + cs;
		int64 absEnd = midiSectionOffset + ce;
		if (absStart < 0 || absEnd > datSize)
			return {};

		juce::FileOutputStream fos(out);
		if (!fos.openedOk())
			return {};
		fos.write(raw + absStart, (size_t)(absEnd - absStart));
		fos.flush();
		return out;
	}

	juce::MemoryBlock extractChunkToMemory(const juce::String& idStr) const
	{
		if (idStr.isEmpty())
			return {};

		juce::String key = idStr.replaceCharacter('\\', '/');
		auto it = idMap.find(key.toStdString());
		if (it == idMap.end())
		{
			juce::String low = key.toLowerCase();
			juce::String alt;
			if (low.endsWith(".midi"))
				alt = key.substring(0, key.length() - 5) + ".mid";
			else if (low.endsWith(".mid"))
				alt = key.substring(0, key.length() - 4) + ".midi";
			if (alt.isNotEmpty())
				it = idMap.find(alt.toStdString());
		}

		if (it == idMap.end())
			return {};

		int64 cs = it->second.first;
		int64 ce = it->second.second;
		if (ce <= cs)
			return {};

		const int64 absStart = midiSectionOffset + cs;
		const int64 absEnd = midiSectionOffset + ce;
		const int64 len64 = absEnd - absStart;
		if (absStart < 0 || len64 <= 0)
			return {};
		if (len64 > std::numeric_limits<int>::max())
			return {};

		if (datMmap == nullptr || datMmap->getData() == nullptr || datMmap->getSize() == 0)
			return {};

		const int64 datSize = (int64)datMmap->getSize();
		if (absEnd > datSize)
			return {};

		const int len = (int)len64;
		juce::MemoryBlock out;
		out.setSize((size_t)len, false);
		auto* dst = out.getData();
		const auto* src = ((const uint8*)datMmap->getData()) + absStart;
		memcpy(dst, src, (size_t)len);
		return out;
	}

	std::unordered_map<std::string, std::pair<int64, int64>> idMap;
	int64 midiSectionOffset = 0;
	juce::MemoryBlock decompressedMeta;
	std::unique_ptr<juce::MemoryMappedFile> datMmap;
	juce::File datFile;
};

inline juce::File resolveMidiPathFromDat(const juce::String& pathStr,
                                         const juce::File& projectRoot,
                                         const juce::File& cacheDir,
                                         MidiFilesDatReader& egmd)
{
	juce::String pid = pathStr.replaceCharacter('\\', '/');
	if (pid.isEmpty())
		return {};

	auto tryDisk = [&](const juce::String& rel) -> juce::File {
		if (rel.isEmpty())
			return {};
		if (juce::File::isAbsolutePath(rel))
		{
			juce::File a(rel);
			return a.existsAsFile() ? a : juce::File();
		}
		juce::File f(projectRoot.getChildFile(rel).getFullPathName());
		return f.existsAsFile() ? f : juce::File();
	};

	juce::File disk = tryDisk(pid);
	juce::File diskAttempt = projectRoot.getChildFile(pid);
	// #region agent log (b565f0)
	{
		auto* d = new juce::DynamicObject();
		d->setProperty("pid", pid);
		d->setProperty("projectRoot", projectRoot.getFullPathName());
		d->setProperty("diskResolved", disk.getFullPathName());
		d->setProperty("diskExists", disk.existsAsFile());
		d->setProperty("diskAttemptPath", diskAttempt.getFullPathName());
		d->setProperty("egmdPoolSize", (int)egmd.getPoolEntryCount());
		d->setProperty("zstdEmbedded", true);
		detail::agentLog_b565f0("H1_H4", "boomcha_midi_dat.h:resolveMidiPathFromDat", "pre_dat_lookup",
		                        juce::var(d));
	}
	// #endregion
	if (disk.existsAsFile())
		return disk;

	juce::File cached = egmd.extractToCache(pid, cacheDir);
	// #region agent log (b565f0)
	{
		auto* d2 = new juce::DynamicObject();
		d2->setProperty("pid", pid);
		d2->setProperty("chosenReader", juce::var("MidiFiles.dat"));
		d2->setProperty("chosenPoolSize", (int)egmd.getPoolEntryCount());
		d2->setProperty("cachedPath", cached.getFullPathName());
		d2->setProperty("cachedExists", cached.existsAsFile());
		detail::agentLog_b565f0("H1_H2_H5", "boomcha_midi_dat.h:resolveMidiPathFromDat", "post_extract",
		                        juce::var(d2));
	}
	// #endregion
	return cached;
}

inline juce::MemoryBlock resolveMidiBytesFromDat(const juce::String& pathStr,
                                                   const juce::File& projectRoot,
                                                   MidiFilesDatReader& egmd)
{
	juce::String pid = pathStr.replaceCharacter('\\', '/');
	if (pid.isEmpty())
		return {};

	auto tryDiskBytes = [&](const juce::String& rel) -> juce::MemoryBlock {
		if (rel.isEmpty())
			return {};
		if (juce::File::isAbsolutePath(rel))
		{
			juce::File a(rel);
			if (!a.existsAsFile())
				return {};
			juce::MemoryBlock mb;
			if (!a.loadFileAsData(mb))
				return {};
			return mb;
		}
		juce::File f(projectRoot.getChildFile(rel).getFullPathName());
		if (!f.existsAsFile())
			return {};
		juce::MemoryBlock mb;
		if (!f.loadFileAsData(mb))
			return {};
		return mb;
	};

	// If MIDI exists on disk already, use it (read into memory; no cache writes).
	juce::MemoryBlock diskBytes = tryDiskBytes(pid);
	if (diskBytes.getSize() > 0)
		return diskBytes;

	juce::MemoryBlock mem = egmd.extractChunkToMemory(pid);
	return mem;
}

} // namespace boomcha
