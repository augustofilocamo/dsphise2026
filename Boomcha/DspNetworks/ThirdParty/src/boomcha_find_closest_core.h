#pragma once

#include "boomcha_bbank.h"
#include <algorithm>
#include <cmath>
#include <limits>
#include <regex>
#include <vector>

namespace boomcha
{

static constexpr int kSlotsPerBar = 16;
static constexpr int kBankSlots = 32;
static constexpr double kBinThresh = 1e-6;
static constexpr double kRepeat2BarsTol = 1e-6;

inline juce::String sourceKey(const juce::String& pathStr)
{
	if (pathStr.isEmpty())
		return {};
	juce::String base = juce::File(pathStr).getFileName();
	std::string s = base.toStdString();
	try
	{
		std::regex re(R"(_\d+\.(midi?)$)", std::regex_constants::icase);
		s = std::regex_replace(s, re, ".$1");
		std::regex re2(R"(\.midi$)", std::regex_constants::icase);
		s = std::regex_replace(s, re2, ".mid");
	}
	catch (...) {}
	return juce::String(s);
}

struct RankedIndex
{
	int idx = -1;
	double sortKey = 0.0;
};

inline void computeDistancesAndOrder(const BbankData& bank,
                                      const std::vector<float>& queryFlat, // size compare_slots*2 BD/SD interleaved
                                      int compareSlots,
                                      bool sdOnly,
                                      bool velocityWeight,
                                      std::vector<double>& outDist,
                                      std::vector<int>& outOrder)
{
	const int np = bank.numPatterns;
	outDist.assign((size_t)np, 0.0);

	std::vector<float> queryFlatF = queryFlat;
	std::vector<float> baseFlat;
	if (sdOnly)
	{
		baseFlat.assign((size_t)compareSlots, 1.0f);
	}
	else
	{
		baseFlat.resize((size_t)(compareSlots * 2));
		for (int s = 0; s < compareSlots; ++s)
		{
			baseFlat[(size_t)(s * 2)] = 1.0f;
			baseFlat[(size_t)(s * 2 + 1)] = 5.0f;
		}
	}

	const double velAlpha = velocityWeight ? 1.0 : 0.0;

	if (sdOnly)
	{
		// query_flat is only SD column (compareSlots floats)
		for (int i = 0; i < np; ++i)
		{
			double acc = 0.0;
			for (int s = 0; s < compareSlots; ++s)
			{
				float q = (queryFlat[(size_t)s] > (float)kBinThresh) ? 1.0f : 0.0f;
				float pv = bank.getPatternValue(i, s * 2 + 1);
				float p = (pv > (float)kBinThresh) ? 1.0f : 0.0f;
				double d = (double)(p - q);
				acc += d * d;
			}
			outDist[(size_t)i] = acc;
		}
		outOrder.resize((size_t)np);
		for (int i = 0; i < np; ++i)
			outOrder[(size_t)i] = i;
		std::stable_sort(outOrder.begin(), outOrder.end(), [&](int a, int b) {
			return outDist[(size_t)a] < outDist[(size_t)b];
		});
	}
	else
	{
		// Full BD+SD metric (default Python branch)
		std::vector<char> sdExact((size_t)np, 0);
		int nSdExact = 0;
		for (int i = 0; i < np; ++i)
		{
			bool ex = true;
			for (int s = 0; s < compareSlots; ++s)
			{
				float q = (queryFlat[(size_t)(s * 2 + 1)] > (float)kBinThresh) ? 1.0f : 0.0f;
				float pv = bank.getPatternValue(i, s * 2 + 1);
				float p = (pv > (float)kBinThresh) ? 1.0f : 0.0f;
				if (std::abs(p - q) > 1e-9f)
					ex = false;
			}
			sdExact[(size_t)i] = ex ? 1 : 0;
			if (ex)
				++nSdExact;
		}

		std::vector<double> distBd((size_t)np, 0.0);
		std::vector<char> bdExact((size_t)np, 0);
		for (int i = 0; i < np; ++i)
		{
			bool bex = true;
			double acc = 0.0;
			for (int s = 0; s < compareSlots; ++s)
			{
				float qbd = (queryFlat[(size_t)(s * 2)] > (float)kBinThresh) ? 1.0f : 0.0f;
				float pv = bank.getPatternValue(i, s * 2);
				float pbin = (pv > (float)kBinThresh) ? 1.0f : 0.0f;
				if (std::abs(pbin - qbd) > 1e-9f)
					bex = false;
				double w = 1.0;
				if (velAlpha > 0.0)
					w *= (1.0 + velAlpha * (double)pv);
				double qflat = (double)queryFlat[(size_t)(s * 2)];
				acc += ((double)pv - qflat) * ((double)pv - qflat) * w;
			}
			distBd[(size_t)i] = acc;
			bdExact[(size_t)i] = bex ? 1 : 0;
		}

		const double inf = std::numeric_limits<double>::max();
		if (nSdExact > 0)
		{
			std::vector<double> sortDist((size_t)np, inf);
			for (int i = 0; i < np; ++i)
			{
				if (!sdExact[(size_t)i])
					sortDist[(size_t)i] = inf;
				else if (bdExact[(size_t)i])
					sortDist[(size_t)i] = distBd[(size_t)i];
				else
					sortDist[(size_t)i] = 1.0e10 + distBd[(size_t)i];

				if (sdExact[(size_t)i])
				{
					if (bdExact[(size_t)i])
						outDist[(size_t)i] = 0.0;
					else
						outDist[(size_t)i] = distBd[(size_t)i];
				}
				else
					outDist[(size_t)i] = inf;
			}
			outOrder.resize((size_t)np);
			for (int i = 0; i < np; ++i)
				outOrder[(size_t)i] = i;
			std::stable_sort(outOrder.begin(), outOrder.end(), [&](int a, int b) {
				return sortDist[(size_t)a] < sortDist[(size_t)b];
			});
		}
		else
		{
			// L2 on full flat pattern vs query
			for (int i = 0; i < np; ++i)
			{
				double acc = 0.0;
				for (int k = 0; k < compareSlots * 2; ++k)
				{
					float pv = bank.getPatternValue(i, k);
					double w = (double)baseFlat[(size_t)k] * (1.0 + velAlpha * (double)pv);
					double qv = (double)queryFlat[(size_t)k];
					double d = (double)pv - qv;
					acc += d * d * w;
				}
				outDist[(size_t)i] = acc;
			}
			outOrder.resize((size_t)np);
			for (int i = 0; i < np; ++i)
				outOrder[(size_t)i] = i;
			std::stable_sort(outOrder.begin(), outOrder.end(), [&](int a, int b) {
				return outDist[(size_t)a] < outDist[(size_t)b];
			});
		}
	}
}

inline std::vector<int> pickBestDeduped(const BbankData& bank,
                                        const std::vector<int>& order,
                                        const std::vector<double>& dist,
                                        int maxPick,
                                        bool repeat2BarsOnly,
                                        const std::vector<char>& repeatMask)
{
	std::vector<int> best;
	juce::StringArray seen;
	for (int oi = 0; oi < (int)order.size() && (int)best.size() < maxPick; ++oi)
	{
		int i = order[(size_t)oi];
		if (repeat2BarsOnly && i < (int)repeatMask.size())
		{
			if (!repeatMask[(size_t)i])
				continue;
		}
		juce::String src = (i < bank.metaPaths.size()) ? bank.metaPaths[(size_t)i] : juce::String();
		auto key = sourceKey(src);
		if (key.isEmpty())
			key = "idx_" + juce::String(i);
		bool dup = false;
		for (auto& s : seen)
			if (s == key)
			{
				dup = true;
				break;
			}
		if (dup)
			continue;
		seen.add(key);
		best.push_back(i);
	}
	return best;
}

inline void buildQueryFromGrid(const juce::var& gridObj, float bpm, std::vector<float>& queryFlat, int& compareSlots)
{
	compareSlots = kSlotsPerBar;
	auto* obj = gridObj.getDynamicObject();
	if (obj == nullptr)
	{
		queryFlat.assign((size_t)(compareSlots * 2), 0.0f);
		return;
	}

	juce::var bdVar = obj->getProperty("bd");
	juce::var sdVar = obj->getProperty("sd");
	juce::Array<juce::var>* bdArr = bdVar.getArray();
	juce::Array<juce::var>* sdArr = sdVar.getArray();
	int n = bdArr ? bdArr->size() : 0;
	int ns = sdArr ? sdArr->size() : 0;
	juce::String div = obj->getProperty("division").toString();

	bool ternary = (div == "ternary") || n == 12 || ns == 12;
	queryFlat.resize((size_t)(kSlotsPerBar * 2));

	if (ternary)
	{
		juce::Array<juce::var> bd = bdArr ? *bdArr : juce::Array<juce::var>();
		juce::Array<juce::var> sd = sdArr ? *sdArr : juce::Array<juce::var>();
		while (bd.size() < 12)
			bd.add(0);
		while (sd.size() < 12)
			sd.add(0);
		for (int b = 0; b < kSlotsPerBar; ++b)
		{
			int t = juce::jmin(11, (int)std::lround((double)b * 12.0 / 16.0));
			float bv = (float)bd[t];
			float sv = (float)sd[t];
			queryFlat[(size_t)(b * 2)] = (bv != 0.0f) ? 1.0f : 0.0f;
			queryFlat[(size_t)(b * 2 + 1)] = (sv != 0.0f) ? 1.0f : 0.0f;
		}
	}
	else
	{
		for (int i = 0; i < kSlotsPerBar; ++i)
		{
			float bv = (bdArr && i < bdArr->size()) ? (float)(double)(*bdArr)[i] : 0.0f;
			float sv = (sdArr && i < sdArr->size()) ? (float)(double)(*sdArr)[i] : 0.0f;
			queryFlat[(size_t)(i * 2)] = (bv > 0.5f) ? 1.0f : 0.0f;
			queryFlat[(size_t)(i * 2 + 1)] = (sv > 0.5f) ? 1.0f : 0.0f;
		}
	}

	(void)bpm;
}

/** Repite el mismo grid de un compás en el siguiente (slots 0–15 y 16–31 del .bbank). */
inline void duplicateQueryToTwoConsecutiveBars(std::vector<float>& queryFlat, int& compareSlots)
{
	const int oneBarSlots = kSlotsPerBar;
	const int oneBarFloats = oneBarSlots * 2;
	if (compareSlots != oneBarSlots || (int)queryFlat.size() != oneBarFloats)
		return;
	queryFlat.resize((size_t)(oneBarFloats * 2));
	for (int i = 0; i < oneBarFloats; ++i)
		queryFlat[(size_t)(oneBarFloats + i)] = queryFlat[(size_t)i];
	compareSlots = kBankSlots;
}

} // namespace boomcha
