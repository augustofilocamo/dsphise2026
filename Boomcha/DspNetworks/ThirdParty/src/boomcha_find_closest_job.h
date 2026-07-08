#pragma once

#ifndef BOOMCHA_DEBUG_FIND_CLOSEST
#define BOOMCHA_DEBUG_FIND_CLOSEST 0
#endif

#include "boomcha_bbank.h"
#include "boomcha_find_closest_core.h"
#include "boomcha_midi_dat.h"
#include "boomcha_midi_groove.h"
#include <memory>
#include <mutex>
#include <unordered_map>

namespace boomcha
{

inline std::vector<char> computeRepeat2BarsMask(const BbankData& bank)
{
	std::vector<char> m((size_t)bank.numPatterns, 1);
	for (int i = 0; i < bank.numPatterns; ++i)
	{
		double s = 0.0;
			for (int sli = 0; sli < kSlotsPerBar; ++sli)
			for (int c = 0; c < 2; ++c)
			{
				float a = bank.getPatternValue(i, sli * 2 + c);
				float b = bank.getPatternValue(i, (sli + kSlotsPerBar) * 2 + c);
				s += std::abs(a - b);
			}
		m[(size_t)i] = (s <= kRepeat2BarsTol) ? 1 : 0;
	}
	return m;
}

struct BankTopResult
{
	BbankData bank;
	std::vector<double> distances;
	std::vector<int> order;
	std::vector<int> bestIndices;
	juce::String bankPath;
};

inline BankTopResult loadBankAndTop(const BbankData& loaded,
                                    const juce::String& bankPath,
                                    const std::vector<float>& queryFlatFull,
                                    int compareSlots,
                                    bool sdOnly,
                                    bool velocityWeight,
                                    int maxBest,
                                    bool repeat2BarsOnly,
                                    const std::vector<char>& repeatMask)
{
	BankTopResult r;
	r.bank = loaded;
	r.bankPath = bankPath;
	const int np = loaded.numPatterns;
	const int nPick = juce::jmax(1, juce::jmin(maxBest, np));

	std::vector<float> qf = queryFlatFull;
	if (sdOnly)
	{
		std::vector<float> qsd((size_t)compareSlots);
		for (int s = 0; s < compareSlots; ++s)
			qsd[(size_t)s] = queryFlatFull[(size_t)(s * 2 + 1)];
		qf = std::move(qsd);
	}

	computeDistancesAndOrder(loaded, qf, compareSlots, sdOnly, velocityWeight, r.distances, r.order);

	r.bestIndices = pickBestDeduped(loaded, r.order, r.distances, nPick, repeat2BarsOnly, repeatMask);
	return r;
}

struct CombinedEntry
{
	const BbankData* bdata = nullptr;
	int idx = -1;
	double dist = 0.0;
	juce::String bankPathUsed;
};

inline juce::Result runFindClosestJob(const juce::var& request, juce::String& responseJsonOut, juce::String& errorOut)
{
	errorOut = {};
	const auto* root = request.getDynamicObject();
	if (root == nullptr)
	{
		errorOut = "Invalid request";
		return juce::Result::fail(errorOut);
	}

	juce::String bankMainPath = root->getProperty("bank_main").toString();
	int nTop = (int)root->getProperty("top");
	int nBars = (int)root->getProperty("bars");
	if (nBars < 1)
		nBars = 1;
	bool useHh = true;
	auto vHh = root->getProperty("use_hh");
	if (!vHh.isVoid() && !vHh.isUndefined())
		useHh = (bool)vHh;
	int hhMin = (int)root->getProperty("hh_min");
	if (root->getProperty("hh_min").isVoid() || root->getProperty("hh_min").isUndefined())
		hhMin = 5;
	if (hhMin < 0)
		hhMin = 5;
	bool ternary = false;
	auto vTer = root->getProperty("ternary");
	if (!vTer.isVoid() && !vTer.isUndefined())
		ternary = (bool)vTer;
	bool matchTwoConsecutiveBars = true;
	auto vTwo = root->getProperty("match_two_consecutive_bars");
	if (!vTwo.isVoid() && !vTwo.isUndefined())
		matchTwoConsecutiveBars = (bool)vTwo;
	bool blendGridOnHighDistance = true;
	auto vBlend = root->getProperty("blend_grid_on_high_distance");
	if (!vBlend.isVoid() && !vBlend.isUndefined())
		blendGridOnHighDistance = (bool)vBlend;
	double blendGridDistanceThreshold = 6.0;
	auto vBlendTh = root->getProperty("blend_grid_distance_threshold");
	if (!vBlendTh.isVoid() && !vBlendTh.isUndefined())
		blendGridDistanceThreshold = (double)vBlendTh;
	if (!std::isfinite(blendGridDistanceThreshold))
		blendGridDistanceThreshold = 6.0;
	blendGridDistanceThreshold = juce::jmax(0.0, blendGridDistanceThreshold);
	bool safeQuantizeFarGrid = false;
	auto vSafeQ = root->getProperty("safe_quantize_far_grid");
	if (!vSafeQ.isVoid() && !vSafeQ.isUndefined())
		safeQuantizeFarGrid = (bool)vSafeQ;
	if (matchTwoConsecutiveBars)
		nBars = juce::jmax(nBars, 2);
	int previewBarsReq = 2;
	auto vPrevBars = root->getProperty("preview_bars");
	if (!vPrevBars.isVoid() && !vPrevBars.isUndefined())
		previewBarsReq = juce::jmax(1, (int)vPrevBars);
	const int exportNBarsPreview = juce::jmin(nBars, previewBarsReq);
	juce::String outputDir = root->getProperty("output_dir").toString();
	juce::String projectRoot = root->getProperty("project_root").toString();
	juce::String presetTitleForMeta = root->getProperty("preset_title").toString();

	// Descartar resultados que en el "bar 2" no tienen actividad BD/SD.
	// En la banca, el bar 2 corresponde a slots [kSlotsPerBar..kBankSlots-1] y BD/SD son interleaved (linearIdx = slot*2 + c).
	const bool requireSecondBarBdSd = (nBars >= 2);
	auto hasAnyBdSdInSecondBar = [&](const BbankData& bank, int patternIdx) -> bool
	{
		if (patternIdx < 0 || patternIdx >= bank.numPatterns)
			return false;
		// Segunda mitad de la segunda barra: dentro del rango del bar [kSlotsPerBar..kBankSlots-1],
		// dejamos solo los últimos (kSlotsPerBar/2) slots.
		const int halfSlots = kSlotsPerBar / 2; // 16/2 = 8
		const int startSecondHalf = kSlotsPerBar + halfSlots; // 16 + 8 = 24 (en total bank slots 0..31)
		for (int s = startSecondHalf; s < kBankSlots; ++s)
		{
			for (int c = 0; c < 2; ++c)
			{
				const float v = bank.getPatternValue(patternIdx, s * 2 + c);
				if (v > 0.5f)
					return true;
			}
		}
		return false;
	};
	const int nMatchesToReturn = nTop;
	const int nMatchesToConsider = requireSecondBarBdSd ? juce::jmax(nTop * 6, nTop) : nTop;

	// #region agent log (b565f0)
	{
		auto* d = new juce::DynamicObject();
		d->setProperty("bankMainPath", juce::File(bankMainPath).getFullPathName());
		d->setProperty("outputDir", juce::File(outputDir).getFullPathName());
		d->setProperty("projectRoot", juce::File(projectRoot).getFullPathName());
		d->setProperty("top", nTop);
		d->setProperty("bars", nBars);
		d->setProperty("useHh", useHh);
		d->setProperty("hhMin", hhMin);
		d->setProperty("ternary", ternary);
		d->setProperty("matchTwoConsecutiveBars", matchTwoConsecutiveBars);
		d->setProperty("safeQuantizeFarGrid", safeQuantizeFarGrid);
		d->setProperty("blendGridDistanceThreshold", blendGridDistanceThreshold);
		d->setProperty("previewBarsReq", previewBarsReq);
		detail::agentLog_b565f0("H6", "boomcha_find_closest_job.h:runFindClosestJob", "request_props", juce::var(d));
	}
	// #endregion
	juce::var gridVar = root->getProperty("grid");
	float bpm = 120.0f;
	if (auto* go = gridVar.getDynamicObject())
	{
		auto bv = go->getProperty("bpm");
		if (!bv.isVoid() && !bv.isUndefined())
			bpm = (float)(double)bv;
	}
	if (bpm < 40.0f || bpm > 300.0f)
		bpm = 120.0f;

	// #region agent log (debug b565f0)
	{
		auto* go = gridVar.getDynamicObject();
		auto* d = new juce::DynamicObject();
		d->setProperty("grid_bpm_effective", bpm);
		if (go != nullptr)
		{
			d->setProperty("grid_div", go->getProperty("division").toString());

			juce::var bdVar = go->getProperty("bd");
			juce::var sdVar = go->getProperty("sd");
			juce::Array<juce::var>* bdArr = bdVar.getArray();
			juce::Array<juce::var>* sdArr = sdVar.getArray();

			int bdSize = bdArr ? (int)bdArr->size() : 0;
			int sdSize = sdArr ? (int)sdArr->size() : 0;
			d->setProperty("grid_bd_size", bdSize);
			d->setProperty("grid_sd_size", sdSize);

			int bdOnes = 0;
			double bdSum = 0.0;
			if (bdArr != nullptr)
			{
				for (int i = 0; i < (int)bdArr->size(); ++i)
				{
					const float v = (float)(double)(*bdArr)[(size_t)i];
					bdSum += (double)v;
					if (v > 0.5f)
						++bdOnes;
				}
			}

			int sdOnes = 0;
			double sdSum = 0.0;
			if (sdArr != nullptr)
			{
				for (int i = 0; i < (int)sdArr->size(); ++i)
				{
					const float v = (float)(double)(*sdArr)[(size_t)i];
					sdSum += (double)v;
					if (v > 0.5f)
						++sdOnes;
				}
			}

			d->setProperty("grid_bd_sum", bdSum);
			d->setProperty("grid_bd_ones", bdOnes);
			d->setProperty("grid_sd_sum", sdSum);
			d->setProperty("grid_sd_ones", sdOnes);
		}
		else
			d->setProperty("grid_dynamicObject_null", true);

		detail::agentLog_b565f0("H7", "boomcha_find_closest_job.h:runFindClosestJob", "grid_summary", juce::var(d));
	}
	// #endregion

	int velocity = (int)root->getProperty("velocity");
	if (velocity < 1)
		velocity = 100;

	if (bankMainPath.isEmpty() || outputDir.isEmpty() || projectRoot.isEmpty())
	{
		errorOut = "Missing bank_main, output_dir or project_root";
		return juce::Result::fail(errorOut);
	}

	BbankData b0;
	if (auto lr = b0.loadFromFile(juce::File(bankMainPath)); lr.failed())
	{
		errorOut = lr.getErrorMessage();
		return lr;
	}

	juce::File pr(projectRoot);
	auto egmdPath = pr.getChildFile("MidiFiles.dat");

	// Cache the opened .dat readers for the lifetime of the app.
	// This avoids re-reading & re-decompressing the .dat metadata on every click.
	struct DatReadersCacheEntry
	{
		MidiFilesDatReader egmd;
		juce::Result egmdOpen = juce::Result::ok();
	};

	static std::mutex sCacheMutex;
	static std::unordered_map<std::string, std::shared_ptr<DatReadersCacheEntry>> sCache;

	auto cacheKey = pr.getFullPathName().toStdString();
	std::shared_ptr<DatReadersCacheEntry> cacheEntry;
	{
		std::lock_guard<std::mutex> lock(sCacheMutex);
		auto it = sCache.find(cacheKey);
		if (it != sCache.end())
		{
			cacheEntry = it->second;
		}
		else
		{
			cacheEntry = std::make_shared<DatReadersCacheEntry>();
			if (egmdPath.existsAsFile())
				cacheEntry->egmdOpen = cacheEntry->egmd.open(egmdPath);
			sCache.emplace(cacheKey, cacheEntry);
		}
	}

	MidiFilesDatReader& egmdRef = cacheEntry->egmd;
	juce::Result egmdOpen = cacheEntry->egmdOpen;

	// Alias the cached reader with the variable name used later in this function.
	MidiFilesDatReader& egmd = egmdRef;
	// #region agent log (b565f0)
	{
		auto* d = new juce::DynamicObject();
		d->setProperty("egmdPath", egmdPath.getFullPathName());
		d->setProperty("egmdExists", egmdPath.existsAsFile());
		d->setProperty("egmdOpenOk", egmdOpen.wasOk());
		if (egmdOpen.failed())
			d->setProperty("egmdOpenErr", egmdOpen.getErrorMessage());
		d->setProperty("egmdPoolSize", (int)egmd.getPoolEntryCount());
		d->setProperty("projectRoot", pr.getFullPathName());
		d->setProperty("bankMainFile", juce::File(bankMainPath).getFileName());
		detail::agentLog_b565f0("H3", "boomcha_find_closest_job.h:runFindClosestJob", "midi_dat_open",
		                        juce::var(d));
	}
	// #endregion

	juce::File cacheDir = pr.getChildFile(".midi_cache");
	cacheDir.createDirectory();

	std::vector<float> queryFlat;
	int compareSlots = kSlotsPerBar;
	buildQueryFromGrid(gridVar, bpm, queryFlat, compareSlots);
	const std::vector<float> queryBdSdOneBar = queryFlat; // always 16x2 from buildQueryFromGrid
	if (matchTwoConsecutiveBars)
		duplicateQueryToTwoConsecutiveBars(queryFlat, compareSlots);

	// #region agent log (debug b565f0)
	{
		int ones = 0;
		double sum = 0.0;
		juce::String bits;
		for (size_t i = 0; i < queryFlat.size(); ++i)
		{
			const float q = queryFlat[i];
			if (q > 0.5f)
				++ones;
			sum += (double)q;
			bits += (q > 0.5f) ? "1" : "0";
		}
		auto* d = new juce::DynamicObject();
		d->setProperty("queryLen", (int)queryFlat.size());
		d->setProperty("compareSlots", compareSlots);
		d->setProperty("matchTwoConsecutiveBars", matchTwoConsecutiveBars);
		d->setProperty("queryOnes", ones);
		d->setProperty("querySum", sum);
		d->setProperty("queryBits", bits);
		detail::agentLog_b565f0("H8", "boomcha_find_closest_job.h:runFindClosestJob", "queryFlat_bits", juce::var(d));
	}
	// #endregion

#if BOOMCHA_DEBUG_FIND_CLOSEST
	{
		juce::String line = "[find_closest] compare_slots=" + juce::String(compareSlots);
		line << (matchTwoConsecutiveBars ? " (2 compases, mismo grid)\n" : " (1 compás)\n");
		juce::File(projectRoot).getChildFile("boomcha_find_debug.log").appendText(line);
	}
#endif

	const bool sdOnly = false;
	const bool velW = false;
	const int maxCandidates = useHh ? juce::jmax(nTop * 25, 200) : juce::jmax(nTop, 20);

	std::vector<char> rep0 = computeRepeat2BarsMask(b0);

	auto top0 = loadBankAndTop(b0, bankMainPath, queryFlat, compareSlots, sdOnly, velW, maxCandidates, false, rep0);

	// #region agent log (debug b565f0)
	{
		auto* d = new juce::DynamicObject();
		d->setProperty("top0_best_count", (int)top0.bestIndices.size());
		for (int i = 0; i < 3; ++i)
		{
			if (i >= (int)top0.bestIndices.size())
				break;
			const int idx = top0.bestIndices[(size_t)i];
			d->setProperty("top0_best" + juce::String(i) + "_idx", idx);
			const double dist = (idx >= 0 && idx < (int)top0.distances.size()) ? top0.distances[(size_t)idx] : 0.0;
			d->setProperty("top0_best" + juce::String(i) + "_dist", dist);
		}
		detail::agentLog_b565f0("H9", "boomcha_find_closest_job.h:runFindClosestJob", "top0_best3", juce::var(d));
	}
	// #endregion

	// Diagnóstico: prueba en runtime de que el query usa 32 slots vs el bank (MidiFiles.dat no entra en esta métrica).
	if (matchTwoConsecutiveBars && compareSlots == kBankSlots && (int)queryFlat.size() >= kBankSlots * 2
	    && !top0.bestIndices.empty())
	{
		const int idx = top0.bestIndices.front();
		if (idx >= 0 && idx < top0.bank.numPatterns)
		{
			const BbankData& bnk = top0.bank;
			double l2a = 0.0;
			double l2b = 0.0;
			for (int s = 0; s < kSlotsPerBar; ++s)
				for (int c = 0; c < 2; ++c)
				{
					const int k = s * 2 + c;
					double d = (double)bnk.getPatternValue(idx, k) - (double)queryFlat[(size_t)k];
					l2a += d * d;
				}
			for (int s = kSlotsPerBar; s < kBankSlots; ++s)
				for (int c = 0; c < 2; ++c)
				{
					const int k = s * 2 + c;
					double d = (double)bnk.getPatternValue(idx, k) - (double)queryFlat[(size_t)k];
					l2b += d * d;
				}
			juce::String diag = "[find_closest] top0 L2 por compás (query vs .bbank fila idx=" + juce::String(idx)
			                    + "): bar0=" + juce::String(l2a, 6) + " bar1=" + juce::String(l2b, 6)
			                    + " | nota: el rank puede usar rama SD-exacta; esto es L2 crudo BD+SD.\n";
#if BOOMCHA_DEBUG_FIND_CLOSEST
			juce::File(projectRoot).getChildFile("boomcha_find_debug.log").appendText(diag);
#endif
		}
	}

	std::vector<CombinedEntry> combined;
	// single bank only: take first nTop from top0 with optional HH filter
	for (int idx : top0.bestIndices)
	{
		if ((int)combined.size() >= nMatchesToConsider)
			break;
		if (useHh)
		{
			juce::String src = (idx < (int)top0.bank.metaPaths.size()) ? top0.bank.metaPaths[(size_t)idx] : juce::String();
			int barStart = (idx < (int)top0.bank.metaBarStarts.size()) ? top0.bank.metaBarStarts[(size_t)idx] : 0;
			double mbpm = (idx < (int)top0.bank.metaBpm.size()) ? (double)top0.bank.metaBpm[(size_t)idx] : (double)bpm;
			juce::MemoryBlock midiBytes = resolveMidiBytesFromDat(src, pr, egmd);
			int hits = countOtherHitsInBarFromMemory(midiBytes, barStart, mbpm);
			if (hits < hhMin)
				continue;
		}
		CombinedEntry e;
		e.bdata = &top0.bank;
		e.idx = idx;
		e.dist = top0.distances[(size_t)idx];
		e.bankPathUsed = bankMainPath;
		combined.push_back(e);
	}

	if (combined.empty())
	{
		errorOut = "No matches after filtering";
		return juce::Result::fail(errorOut);
	}

	juce::Random rng((juce::int64)(juce::Time::getMillisecondCounter() & 0x7fffffff));
	juce::File outDir(outputDir);
	outDir.createDirectory();
	juce::String baseNoExt = outDir.getChildFile("closest_1bar").getFullPathName();

	juce::Array<juce::var> jsonMatches;
	for (auto& e : combined)
	{
		if ((int)jsonMatches.size() >= nMatchesToReturn)
			break;

		const auto& bank = *e.bdata;
		int idx = e.idx;
		double dist = e.dist;

		if (requireSecondBarBdSd && !hasAnyBdSdInSecondBar(bank, idx))
			continue;

		const int rank = (int)jsonMatches.size() + 1;
		juce::String midPathPreview = baseNoExt + "_" + juce::String(rank) + ".mid";
		juce::String midPathFull = baseNoExt + "_" + juce::String(rank) + "_expand.mid";
		juce::String midiId = (idx < (int)bank.metaPaths.size()) ? bank.metaPaths[(size_t)idx] : juce::String();
		int barStart = (idx < (int)bank.metaBarStarts.size()) ? bank.metaBarStarts[(size_t)idx] : 0;
		double segBpm = (idx < (int)bank.metaBpm.size()) ? (double)bank.metaBpm[(size_t)idx] : (double)bpm;

		juce::File resolved = resolveMidiPathFromDat(midiId, pr, cacheDir, egmd);
		if (!resolved.existsAsFile())
		{
			errorOut = "Could not resolve MIDI for id: " + midiId;
			if (egmd.getPoolEntryCount() == 0)
				errorOut += " | MidiFiles.dat pool empty — check .dat next to project_root or IDs vs pool.";
			return juce::Result::fail(errorOut);
		}

		const bool blendBdSdFromGrid = blendGridOnHighDistance && (dist > blendGridDistanceThreshold);
#if BOOMCHA_DEBUG_FIND_CLOSEST
		{
			juce::String line = "[find_closest] export rank=" + juce::String(rank)
			                    + " dist=" + juce::String(dist, 6)
			                    + " blend_bd_sd_from_grid=" + juce::String(blendBdSdFromGrid ? 1 : 0)
			                    + " nBarsFull=" + juce::String(nBars)
			                    + " nBarsPreview=" + juce::String(exportNBarsPreview)
			                    + " mid=" + midPathPreview + "\n";
			juce::File(projectRoot).getChildFile("boomcha_find_debug.log").appendText(line);
		}
#endif
		if (exportNBarsPreview < nBars)
		{
			if (auto er = exportGrooveSegmentToMidi(resolved,
			                                        barStart,
			                                        exportNBarsPreview,
			                                        segBpm,
			                                        (double)bpm,
			                                        juce::File(midPathPreview),
			                                        rng,
			                                        false,
			                                        &queryBdSdOneBar,
			                                        blendBdSdFromGrid,
			                                        velocity,
			                                        safeQuantizeFarGrid,
			                                        presetTitleForMeta);
			    er.failed())
			{
				errorOut = er.getErrorMessage();
				return er;
			}
			if (ternary)
				quantizeMidiTernary(juce::File(midPathPreview));
			if (auto er = exportGrooveSegmentToMidi(resolved,
			                                        barStart,
			                                        nBars,
			                                        segBpm,
			                                        (double)bpm,
			                                        juce::File(midPathFull),
			                                        rng,
			                                        false,
			                                        &queryBdSdOneBar,
			                                        blendBdSdFromGrid,
			                                        velocity,
			                                        safeQuantizeFarGrid,
			                                        presetTitleForMeta);
			    er.failed())
			{
				errorOut = er.getErrorMessage();
				return er;
			}
			if (ternary)
				quantizeMidiTernary(juce::File(midPathFull));
		}
		else
		{
			if (auto er = exportGrooveSegmentToMidi(resolved,
			                                        barStart,
			                                        nBars,
			                                        segBpm,
			                                        (double)bpm,
			                                        juce::File(midPathPreview),
			                                        rng,
			                                        false,
			                                        &queryBdSdOneBar,
			                                        blendBdSdFromGrid,
			                                        velocity,
			                                        safeQuantizeFarGrid,
			                                        presetTitleForMeta);
			    er.failed())
			{
				errorOut = er.getErrorMessage();
				return er;
			}
			if (ternary)
				quantizeMidiTernary(juce::File(midPathPreview));
		}

		auto* mo = new juce::DynamicObject();
		mo->setProperty("index", idx);
		mo->setProperty("distance", dist);
		mo->setProperty("meta_bpm", segBpm);
		mo->setProperty("bank", juce::File(e.bankPathUsed).getFileName());
		mo->setProperty("midi_id", midiId);
		mo->setProperty("bar_start", barStart);
		mo->setProperty("source_path", resolved.getFullPathName());
		mo->setProperty("mid_path", juce::File(midPathPreview).getFullPathName());
		mo->setProperty("mid_path_expand", exportNBarsPreview < nBars ? juce::File(midPathFull).getFullPathName()
		                                                                  : juce::File(midPathPreview).getFullPathName());
		mo->setProperty("preview_bars", exportNBarsPreview);
		jsonMatches.add(juce::var(mo));
	}

	if (jsonMatches.isEmpty())
	{
		errorOut = "No matches";
		return juce::Result::fail(errorOut);
	}

	auto* first = jsonMatches.getReference(0).getDynamicObject();
	if (first == nullptr)
	{
		errorOut = "Invalid first match object";
		return juce::Result::fail(errorOut);
	}
	auto* out = new juce::DynamicObject();
	out->setProperty("index", first->getProperty("index"));
	out->setProperty("distance", first->getProperty("distance"));
	out->setProperty("meta_bpm", first->getProperty("meta_bpm"));
	out->setProperty("matches", juce::var(jsonMatches));
	out->setProperty("bars", nBars);
	out->setProperty("preview_bars", exportNBarsPreview);
	out->setProperty("match_two_consecutive_bars", matchTwoConsecutiveBars);

	responseJsonOut = juce::JSON::toString(juce::var(out), false);
	return juce::Result::ok();
}

} // namespace boomcha
