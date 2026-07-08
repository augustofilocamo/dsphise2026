#pragma once

#include <JuceHeader.h>

#ifndef BOOMCHA_EXPORT_PLUGIN_NAME
#define BOOMCHA_EXPORT_PLUGIN_NAME "Boomcha"
#endif
#ifndef BOOMCHA_EXPORT_PLUGIN_VERSION_STRING
#define BOOMCHA_EXPORT_PLUGIN_VERSION_STRING "1.0.0"
#endif
#ifndef BOOMCHA_EXPORT_RIGHTS_HOLDER
#define BOOMCHA_EXPORT_RIGHTS_HOLDER "Sampleson"
#endif

// #region agent log
namespace boomcha
{
inline void dbgExportLog(const juce::String& jsonLine)
{
	juce::File("/Users/filo/Filo/VST-Project/dsphise/Boomcha/.cursor/debug-b565f0.log").appendText(jsonLine + "\n");
}
} // namespace
// #endregion

namespace boomcha
{

static inline double tickToSec(double tick, int ppq, double bpm)
{
	if (ppq <= 0 || bpm <= 0.0)
		return 0.0;
	return tick * (60.0 / (bpm * (double)ppq));
}

static inline double secToTick(double sec, int ppq, double bpm)
{
	if (ppq <= 0 || bpm <= 0.0)
		return 0.0;
	return sec / (60.0 / (bpm * (double)ppq));
}

/** Count drum notes in bar that are not BD/SD (36-40).
 *  Misma definición de compás que build_groove_pattern_bank / pretty_midi: bar_sec = 4*60/bpm (meta_bpm del banco). */
inline int countOtherHitsInBar(const juce::File& midiPath, int barStart, double bpm)
{
	if (!midiPath.existsAsFile())
		return -1;

	juce::FileInputStream fis(midiPath);
	if (!fis.openedOk())
		return -1;

	juce::MidiFile mf;
	if (!mf.readFrom(fis))
		return -1;

	const int ppq = mf.getTimeFormat() > 0 ? mf.getTimeFormat() : 480;
	const bool useSec = (mf.getTimeFormat() != 0);
	if (useSec)
		mf.convertTimestampTicksToSeconds();

	if (bpm <= 0.0)
		return -1;
	const double barSec = 4.0 * 60.0 / bpm;
	const double t0 = (double)barStart * barSec;
	const double t1 = t0 + barSec;

	int count = 0;

	for (int ti = 0; ti < mf.getNumTracks(); ++ti)
	{
		const auto* seq = mf.getTrack(ti);
		if (seq == nullptr)
			continue;
		for (int i = 0; i < seq->getNumEvents(); ++i)
		{
			auto meh = seq->getEventPointer(i);
			const auto& m = meh->message;
			if (!m.isNoteOn() || m.getVelocity() == 0)
				continue;
			const int pitch = m.getNoteNumber();
			if (pitch >= 36 && pitch <= 40)
				continue;
			const double tSec = useSec ? (double)m.getTimeStamp()
			                           : tickToSec((double)m.getTimeStamp(), ppq, bpm);
			if (tSec >= t1 || tSec < t0)
				continue;
			++count;
		}
	}

	return count;
}

/** Same as countOtherHitsInBar, but reads/parses the MIDI from memory bytes (no .mid on disk). */
inline int countOtherHitsInBarFromMemory(const juce::MemoryBlock& midiBytes, int barStart, double bpm)
{
	if (midiBytes.getSize() <= 0)
		return -1;

	juce::MemoryInputStream mis(midiBytes.getData(), (size_t)midiBytes.getSize(), false);

	juce::MidiFile mf;
	if (!mf.readFrom(mis))
		return -1;

	const int ppq = mf.getTimeFormat() > 0 ? mf.getTimeFormat() : 480;
	const bool useSec = (mf.getTimeFormat() != 0);
	if (useSec)
		mf.convertTimestampTicksToSeconds();

	if (bpm <= 0.0)
		return -1;
	const double barSec = 4.0 * 60.0 / bpm;
	const double t0 = (double)barStart * barSec;
	const double t1 = t0 + barSec;

	int count = 0;

	for (int ti = 0; ti < mf.getNumTracks(); ++ti)
	{
		const auto* seq = mf.getTrack(ti);
		if (seq == nullptr)
			continue;
		for (int i = 0; i < seq->getNumEvents(); ++i)
		{
			auto meh = seq->getEventPointer(i);
			const auto& m = meh->message;
			if (!m.isNoteOn() || m.getVelocity() == 0)
				continue;
			const int pitch = m.getNoteNumber();
			if (pitch >= 36 && pitch <= 40)
				continue;
			const double tSec = useSec ? (double)m.getTimeStamp()
			                           : tickToSec((double)m.getTimeStamp(), ppq, bpm);
			if (tSec >= t1 || tSec < t0)
				continue;
			++count;
		}
	}

	return count;
}

/** Export groove segment. Igual que find_closest_groove_bar.export_groove_segment_to_midi (pretty_midi):
 *  ventana [t0,t1) en segundos con bar_sec = 4*60/segBpm (meta del banco); tiempos de nota en segundos reales (mapa de tempo). */
inline juce::Result exportGrooveSegmentToMidi(const juce::File& srcPath,
                                               int barStart,
                                               int nBars,
                                               double bpm,
                                               double outputBpm,
                                               const juce::File& outPath,
                                               juce::Random& rng,
                                               bool applyBar2Cleanup,
                                               const std::vector<float>* gridBdSdOneBar = nullptr,
                                               bool blendBdSdFromGrid = false,
                                               int gridVelocity = 100,
                                               bool safeQuantizeFarGrid = false,
                                               const juce::String& presetTitleForMeta = {})
{
	(void)applyBar2Cleanup; // optional cleanup can be re-enabled to match Python _remove_bar2_edge_notes

	if (!srcPath.existsAsFile())
		return juce::Result::fail("Source MIDI missing");

	juce::FileInputStream fis(srcPath);
	juce::MidiFile mf;
	if (!mf.readFrom(fis))
		return juce::Result::fail("Could not parse source MIDI");

	const int ppqIn = mf.getTimeFormat() > 0 ? mf.getTimeFormat() : 480;
	const bool useSec = (mf.getTimeFormat() != 0);
	if (useSec)
		mf.convertTimestampTicksToSeconds();

	const double segBpm = bpm;
	if (segBpm <= 0.0)
		return juce::Result::fail("Invalid segment BPM");

	const double barSec = 4.0 * 60.0 / segBpm;
	const double t0sec = (double)barStart * barSec;
	const double t1sec = t0sec + (double)nBars * barSec;
	const double statsBars = 8.0;
	const double statsT0sec = t0sec;
	const double statsT1sec = t0sec + statsBars * barSec;
	const double totalSrcSec = (double)nBars * barSec; // same as Python total_src
	const double writeBpm = outputBpm > 0.0 ? outputBpm : segBpm;
	if (writeBpm <= 0.0)
		return juce::Result::fail("Invalid BPM");
	const double scale = (std::abs(writeBpm - segBpm) > 0.01) ? (segBpm / writeBpm) : 1.0;
	const int ppqOut = 480;

	juce::MidiMessageSequence outSeq;
	struct Note
	{
		double t0, t1;
		int pitch, vel;
	};
	std::vector<Note> notes;
	int srcBdMinVel = 127, srcBdMaxVel = 1;
	int srcSdMinVel = 127, srcSdMaxVel = 1;
	int srcBdVelSum = 0, srcBdVelCount = 0;
	int srcSdVelSum = 0, srcSdVelCount = 0;
	bool hasSrcBdVel = false, hasSrcSdVel = false;
	std::vector<uint8> tomInQuarter; // [bar * 4 + quarter] => 1 si hay tom en esa negra
	std::vector<double> nonKickSnareOnsets; // onsets de golpes "otros" en tiempo de salida, para alinear BD/SD de grilla
	if (nBars > 0)
		tomInQuarter.assign((size_t)nBars * 4u, 0);
	auto isTomPitch = [](int p) -> bool
	{
		// GM toms más comunes.
		return p == 41 || p == 43 || p == 45 || p == 47 || p == 48 || p == 50;
	};

	// #region agent log
	int dbgTotalOn = 0;
	double dbgMinAll = 1e100;
	double dbgMaxAll = -1e100;
	const juce::String dbgSrc = srcPath.getFileName();
	// #endregion

	for (int ti = 0; ti < mf.getNumTracks(); ++ti)
	{
		const auto* seq = mf.getTrack(ti);
		if (seq == nullptr)
			continue;
		// readFrom(createMatchingNoteOffs=true) already ran updateMatchedPairs per track.
		for (int i = 0; i < seq->getNumEvents(); ++i)
		{
			auto meh = seq->getEventPointer(i);
			const auto& m = meh->message;
			if (!m.isNoteOn() || m.getVelocity() == 0)
				continue;
			const double tStart = useSec ? (double)m.getTimeStamp()
			                             : tickToSec((double)m.getTimeStamp(), ppqIn, segBpm);
			double tEnd = tStart + 0.05;
			if (meh->noteOffObject != nullptr)
				tEnd = useSec ? (double)meh->noteOffObject->message.getTimeStamp()
				              : tickToSec((double)meh->noteOffObject->message.getTimeStamp(), ppqIn, segBpm);
			// #region agent log
			++dbgTotalOn;
			if (tStart < dbgMinAll)
				dbgMinAll = tStart;
			if (tStart > dbgMaxAll)
				dbgMaxAll = tStart;
			// #endregion
			int pitch = m.getNoteNumber();
			if (pitch == 22)
				pitch = 42;
			else if (pitch == 26)
				pitch = 46;

			int vel = m.getVelocity();
			// Capturar estadísticas de velocity BD/SD en una ventana fija de 8 compases
			// desde barStart, independiente de cuántos compases se exportan.
			if (tStart < statsT1sec && tEnd > statsT0sec)
			{
				if (pitch == 36)
				{
					hasSrcBdVel = true;
					srcBdMinVel = juce::jmin(srcBdMinVel, vel);
					srcBdMaxVel = juce::jmax(srcBdMaxVel, vel);
					srcBdVelSum += vel;
					++srcBdVelCount;
				}
				else if (pitch >= 37 && pitch <= 40)
				{
					hasSrcSdVel = true;
					srcSdMinVel = juce::jmin(srcSdMinVel, vel);
					srcSdMaxVel = juce::jmax(srcSdMaxVel, vel);
					srcSdVelSum += vel;
					++srcSdVelCount;
				}
			}

			// Same window as export_groove_segment_to_midi: skip if outside (t0,t1) in time
			if (tStart >= t1sec || tEnd <= t0sec)
				continue;
			double start = juce::jmax(0.0, tStart - t0sec) * scale;
			double end = juce::jmin(tEnd - t0sec, totalSrcSec) * scale;
			if (end <= start)
				continue;

			// En modo blend, BD/SD se reemplazan por la grilla del usuario.
			if (blendBdSdFromGrid && pitch >= 36 && pitch <= 40)
				continue;

			const double barSecOut = 4.0 * 60.0 / writeBpm;
			if (pitch >= 37 && pitch <= 40 && vel < 80 && start < 4.0 * barSecOut)
				vel = 110 + rng.nextInt(18);

			// Detectar toms del source por negra en tiempo de salida (post-scale).
			if (blendBdSdFromGrid && isTomPitch(pitch) && nBars > 0)
			{
				const int barIdx = juce::jlimit(0, nBars - 1, (int)std::floor(start / barSecOut));
				const double local = start - (double)barIdx * barSecOut;
				const int q = juce::jlimit(0, 3, (int)std::floor(local / (barSecOut / 4.0)));
				tomInQuarter[(size_t)barIdx * 4u + (size_t)q] = 1;
			}
			// Guardar onsets de "otros" golpes para posible alineación temporal de BD/SD agregados.
			if (blendBdSdFromGrid && !(pitch >= 36 && pitch <= 40))
				nonKickSnareOnsets.push_back(start);
			notes.push_back({start, end, pitch, vel});
		}
	}

	// Si el blend está activo, inyectar BD/SD desde la grilla de 1 compás y repetirla en cada compás exportado.
	if (blendBdSdFromGrid && gridBdSdOneBar != nullptr && gridBdSdOneBar->size() >= (size_t)(16 * 2))
	{
		const double barSecOut = 4.0 * 60.0 / writeBpm;
		const double slotSecOut = barSecOut / 16.0;
		const double noteLen = slotSecOut * 0.5;
		const int baseVel = juce::jlimit(1, 127, gridVelocity);
		// Fallback si no hubo BD/SD originales en la ventana.
		const int bdMin = hasSrcBdVel ? srcBdMinVel : juce::jlimit(1, 127, baseVel - 18);
		const int bdMax = hasSrcBdVel ? srcBdMaxVel : juce::jlimit(1, 127, baseVel + 10);
		const int sdMin = hasSrcSdVel ? srcSdMinVel : juce::jlimit(1, 127, baseVel - 16);
		const int sdMax = hasSrcSdVel ? srcSdMaxVel : juce::jlimit(1, 127, baseVel + 14);
		const int bdAvg = (hasSrcBdVel && srcBdVelCount > 0)
			? juce::jlimit(1, 127, juce::roundToInt((double)srcBdVelSum / (double)srcBdVelCount))
			: juce::jlimit(1, 127, baseVel);
		const int sdAvg = (hasSrcSdVel && srcSdVelCount > 0)
			? juce::jlimit(1, 127, juce::roundToInt((double)srcSdVelSum / (double)srcSdVelCount))
			: juce::jlimit(1, 127, baseVel);
		auto slotAccent = [](int slot) -> double
		{
			// 16th-note feel: negras > corcheas > semicorcheas offbeat
			if ((slot % 8) == 0) return 1.00; // tiempos 1 y 3
			if ((slot % 4) == 0) return 0.90; // tiempos 2 y 4
			if ((slot % 2) == 0) return 0.78; // subdivisión par
			return 0.64;                      // subdivisión débil
		};
		auto mapAccentAroundAvg = [&](double x, int avg, int vmin, int vmax) -> int
		{
			const double c = juce::jlimit(0.0, 1.0, x);
			const int lo = juce::jmin(vmin, vmax);
			const int hi = juce::jmax(vmin, vmax);
			const int a = juce::jlimit(lo, hi, avg);
			if (c <= 0.5)
			{
				const double t = c * 2.0; // 0..1 entre lo y avg
				return juce::jlimit(1, 127, juce::roundToInt((double)lo + t * (double)(a - lo)));
			}
			const double t = (c - 0.5) * 2.0; // 0..1 entre avg y hi
			return juce::jlimit(1, 127, juce::roundToInt((double)a + t * (double)(hi - a)));
		};
		// Si hay un golpe "otro" muy cercano, alinear BD/SD de grilla al 90% hacia ese timestamp.
		auto alignToNearbyOtherHit = [&](double t) -> double
		{
			if (nonKickSnareOnsets.empty())
				return t;
			const double nearWindow = slotSecOut * 0.35; // "muy cercano" ~ 35% de un 16th
			double bestTs = t;
			double bestAbs = 1e12;
			for (double ts : nonKickSnareOnsets)
			{
				const double d = std::abs(ts - t);
				if (d < bestAbs)
				{
					bestAbs = d;
					bestTs = ts;
				}
			}
			if (bestAbs <= nearWindow)
				return t + 0.9 * (bestTs - t); // 90% hacia el golpe cercano
			return t;
		};
		// Para rachas largas (>=3) de un mismo instrumento en la grilla:
		// aplicar contraste fuerte/débil muy marcado.
		auto runInfoAtSlot = [&](int slot, bool isBd, int& runLen, int& runPos) -> void
		{
			runLen = 0;
			runPos = 0;
			const int col = isBd ? 0 : 1;
			const float v = (*gridBdSdOneBar)[(size_t)(slot * 2 + col)];
			if (v <= 0.5f)
				return;

			int start = slot;
			while (start > 0)
			{
				const float pv = (*gridBdSdOneBar)[(size_t)((start - 1) * 2 + col)];
				if (pv <= 0.5f)
					break;
				--start;
			}
			int end = slot;
			while (end < 15)
			{
				const float nv = (*gridBdSdOneBar)[(size_t)((end + 1) * 2 + col)];
				if (nv <= 0.5f)
					break;
				++end;
			}
			runLen = end - start + 1;
			runPos = slot - start;
		};

		for (int bar = 0; bar < nBars; ++bar)
		{
			const double barStartSec = (double)bar * barSecOut;
			for (int slot = 0; slot < 16; ++slot)
			{
				const double t0 = barStartSec + (double)slot * slotSecOut;
				const double t1 = juce::jmin((double)nBars * barSecOut, t0 + noteLen);
				if (t1 <= t0)
					continue;

				const float qBd = (*gridBdSdOneBar)[(size_t)(slot * 2)];
				const float qSd = (*gridBdSdOneBar)[(size_t)(slot * 2 + 1)];
				const double acc = slotAccent(slot);

				if (qBd > 0.5f)
				{
					// BD: ligero extra en downbeats 1 / 3.
					const double bdBoost = ((slot % 8) == 0) ? 0.08 : 0.0;
					int runLen = 0, runPos = 0;
					runInfoAtSlot(slot, true, runLen, runPos);
					double bdAccent = acc + bdBoost;
					if (runLen >= 3)
					{
						// contraste "grandísimo": alternar fuerte/débil dentro de la racha
						const bool strong = ((runPos % 2) == 0);
						bdAccent = strong ? 1.00 : 0.22;
					}
					// Humanización nota por nota (±40%), sin sesgo por compás.
					const double noteHumanize = 0.6 + (0.8 * rng.nextDouble());
					const int bdVel = juce::jlimit(1, 127, juce::roundToInt((double)mapAccentAroundAvg(bdAccent, bdAvg, bdMin, bdMax) * noteHumanize));
					const double a0 = alignToNearbyOtherHit(t0);
					const double a1 = juce::jmin((double)nBars * barSecOut, a0 + noteLen);
					if (a1 > a0)
						notes.push_back({a0, a1, 36, bdVel});
				}
				if (qSd > 0.5f)
				{
					// Regla: si hay toms en esta negra del compás, no agregar SD en esa negra.
					const int q = slot / 4; // negra 0..3
					const bool hasTomHere = (nBars > 0) ? (tomInQuarter[(size_t)bar * 4u + (size_t)q] != 0) : false;
					if (hasTomHere)
						continue;

					// SD: ligero extra en backbeats 2 / 4.
					const bool isBackbeat = (slot == 4 || slot == 12);
					const double sdBoost = isBackbeat ? 0.10 : 0.0;
					int runLen = 0, runPos = 0;
					runInfoAtSlot(slot, false, runLen, runPos);
					double sdAccent = acc + sdBoost;
					if (runLen >= 3)
					{
						// contraste "grandísimo": alternar fuerte/débil dentro de la racha
						const bool strong = ((runPos % 2) == 0);
						sdAccent = strong ? 1.00 : 0.22;
					}
					// Humanización nota por nota (±40%), sin sesgo por compás.
					const double noteHumanize = 0.6 + (0.8 * rng.nextDouble());
					const int sdVel = juce::jlimit(1, 127, juce::roundToInt((double)mapAccentAroundAvg(sdAccent, sdAvg, sdMin, sdMax) * noteHumanize));
					const double a0 = alignToNearbyOtherHit(t0);
					const double a1 = juce::jmin((double)nBars * barSecOut, a0 + noteLen);
					if (a1 > a0)
						notes.push_back({a0, a1, 38, sdVel});
				}
			}
		}
	}

	// Safe quantize por nota:
	// si un onset está a más de 1/128 de una grilla 1/16,
	// mover ese golpe 80% hacia su 1/16 más cercana.
	if (safeQuantizeFarGrid && !notes.empty() && nBars > 0)
	{
		const double barSecOut = 4.0 * 60.0 / writeBpm;
		const double slot16Sec = barSecOut / 16.0;
		const double threshold128Sec = barSecOut / 128.0;
		const double totalSec = (double)nBars * barSecOut;

		for (auto& n : notes)
		{
			const double q = std::round(n.t0 / slot16Sec) * slot16Sec;
			const double d = std::abs(n.t0 - q);
			if (d > threshold128Sec)
			{
				const double delta = 0.8 * (q - n.t0);
				double t0 = juce::jlimit(0.0, totalSec, n.t0 + delta);
				double t1 = juce::jlimit(0.0, totalSec, n.t1 + delta);
				if (t1 <= t0)
					t1 = juce::jmin(totalSec, t0 + slot16Sec * 0.25);
				n.t0 = t0;
				n.t1 = t1;
			}
		}
	}

	// #region agent log
	{
		const juce::int64 ts = (juce::int64)juce::Time::getMillisecondCounter();
		const int tf = (int)mf.getTimeFormat();
		dbgExportLog(juce::String::formatted(
		    "{\"sessionId\":\"b565f0\",\"hypothesisId\":\"H1-H5\",\"location\":\"boomcha_midi_groove.h:exportGrooveSegmentToMidi\","
		    "\"message\":\"after_collect\",\"data\":{"
		    "\"src\":\"%s\",\"barStart\":%d,\"nBars\":%d,\"segBpm\":%.6f,\"writeBpm\":%.6f,\"useSec\":%s,\"ppq\":%d,\"timeFormat\":%d,"
		    "\"tracks\":%d,\"t0sec\":%.8f,\"t1sec\":%.8f,\"barSec\":%.8f,\"totalNoteOn\":%d,\"minTSec\":%.8f,\"maxTSec\":%.8f,\"notesOut\":%d"
		    "},\"timestamp\":%lld}",
		    dbgSrc.toRawUTF8(),
		    barStart,
		    nBars,
		    segBpm,
		    writeBpm,
		    useSec ? "true" : "false",
		    ppqIn,
		    tf,
		    mf.getNumTracks(),
		    t0sec,
		    t1sec,
		    barSec,
		    dbgTotalOn,
		    dbgMinAll < 1e99 ? dbgMinAll : 0.0,
		    dbgMaxAll > -1e99 ? dbgMaxAll : 0.0,
		    (int)notes.size(),
		    (long long)ts));
	}
	// #endregion

	for (const auto& n : notes)
	{
		// MidiMessageSequence times are in seconds (JUCE)
		outSeq.addEvent(juce::MidiMessage::noteOn(10, n.pitch, (juce::uint8)juce::jlimit(1, 127, n.vel)), n.t0);
		outSeq.addEvent(juce::MidiMessage::noteOff(10, n.pitch), n.t1);
	}

	// SMF meta: TITLE (0x03), COPYRIGHT (0x02), COMMENT (0x01)
	{
		const juce::String pluginVer = juce::String(BOOMCHA_EXPORT_PLUGIN_VERSION_STRING);
		const juce::String title = presetTitleForMeta.trim().isEmpty()
		                               ? juce::String("Untitled")
		                               : presetTitleForMeta.trim();
		const int exportYear = juce::Time::getCurrentTime().getYear();
		const juce::String copyrightText =
		"© " + juce::String(exportYear) + " [YOUR NAME / COMPANY]. "
		"All rights reserved.";
	
	const juce::String commentText =
		"Generated by Boomcha " + pluginVer + ". "
		"Contains material from the E-GMD dataset. "
		"Source material may have been modified and/or supplemented with additional content.";
	
	const juce::String attributionText =
		"E-GMD dataset © Google LLC. Licensed under CC BY 4.0.\n"
		"https://creativecommons.org/licenses/by/4.0/\n"
		"Source: https://magenta.tensorflow.org/datasets/e-gmd\n"
		"Ref: Callender, Hawthorne, Engel. arXiv:2004.00188 (2020)";
	
	outSeq.addEvent(juce::MidiMessage::textMetaEvent(3, title), 0.0);
	outSeq.addEvent(juce::MidiMessage::textMetaEvent(2, copyrightText), 0.0);
	outSeq.addEvent(juce::MidiMessage::textMetaEvent(1, commentText), 0.0);
	outSeq.addEvent(juce::MidiMessage::textMetaEvent(1, attributionText), 0.0);
	}

	outSeq.updateMatchedPairs();
	outSeq.sort();

	// #region agent log
	double dbgTickMin = 1e100;
	double dbgTickMax = -1e100;
	// #endregion

	// JUCE MidiFile::writeTo treats MidiMessage::getTimeStamp() as MIDI ticks (see juce_MidiFile.cpp writeTrack).
	// We built outSeq in seconds; convert to ticks before write or notes collapse / corrupt.
	outSeq.addEvent(juce::MidiMessage::tempoMetaEvent((int)juce::roundToInt(60000000.0 / writeBpm)), 0.0);
	outSeq.sort();
	for (int i = 0; i < outSeq.getNumEvents(); ++i)
	{
		auto* e = outSeq.getEventPointer(i);
		const double sec = e->message.getTimeStamp();
		const double ticks = secToTick(sec, ppqOut, writeBpm);
		e->message.setTimeStamp(ticks);
		// #region agent log
		if (ticks < dbgTickMin)
			dbgTickMin = ticks;
		if (ticks > dbgTickMax)
			dbgTickMax = ticks;
		// #endregion
	}

	// #region agent log
	{
		const juce::int64 ts2 = (juce::int64)juce::Time::getMillisecondCounter();
		dbgExportLog(juce::String::formatted(
		    "{\"sessionId\":\"b565f0\",\"hypothesisId\":\"H4-H6\",\"location\":\"boomcha_midi_groove.h:after_sec_to_tick\","
		    "\"message\":\"outSeq_events\",\"data\":{\"numEvents\":%d,\"tickMin\":%.4f,\"tickMax\":%.4f},\"timestamp\":%lld}",
		    outSeq.getNumEvents(),
		    dbgTickMin < 1e99 ? dbgTickMin : 0.0,
		    dbgTickMax > -1e99 ? dbgTickMax : 0.0,
		    (long long)ts2));
	}
	// #endregion

	juce::MidiFile out;
	out.setTicksPerQuarterNote(ppqOut);
	out.addTrack(outSeq);

	juce::FileOutputStream fos(outPath);
	if (!fos.openedOk())
		return juce::Result::fail("Could not write output MIDI");
	// JUCE FileOutputStream opens existing files at EOF (append). Truncate or each export prepends a full SMF and
	// mido/DAWs only read the first (often stale 1-note) header — see juce_FileOutputStream.h.
	if (!fos.setPosition(0))
		return juce::Result::fail("Could not seek output MIDI");
	{
		const auto tr = fos.truncate();
		if (tr.failed())
			return juce::Result::fail("Could not truncate output MIDI: " + tr.getErrorMessage());
	}
	if (!out.writeTo(fos))
		return juce::Result::fail("writeTo failed");
	fos.flush();

	// #region agent log
	{
		const juce::int64 ts3 = (juce::int64)juce::Time::getMillisecondCounter();
		const juce::int64 sz = outPath.getSize();
		dbgExportLog(juce::String::formatted(
		    "{\"sessionId\":\"b565f0\",\"hypothesisId\":\"H8\",\"location\":\"boomcha_midi_groove.h:after_write\","
		    "\"message\":\"wrote_midi\",\"data\":{\"path\":\"%s\",\"bytes\":%lld},\"timestamp\":%lld}",
		    outPath.getFullPathName().toRawUTF8(),
		    (long long)sz,
		    (long long)ts3));
	}
	// #endregion

	return juce::Result::ok();
}

inline juce::Result quantizeMidiTernary(const juce::File& path)
{
	if (!path.existsAsFile())
		return juce::Result::fail("quantizeMidiTernary: file not found: " + path.getFullPathName());

	juce::FileInputStream fis(path);
	if (!fis.openedOk())
		return juce::Result::fail("quantizeMidiTernary: cannot open for reading: " + path.getFullPathName());

	juce::MidiFile mid;
	if (!mid.readFrom(fis, true))
		return juce::Result::fail("quantizeMidiTernary: cannot read midi: " + path.getFullPathName());

	const int timeFormat = (int)mid.getTimeFormat();
	if (timeFormat <= 0)
		return juce::Result::fail("quantizeMidiTernary: timeFormat=0 (seconds-based) not supported: " + path.getFullPathName());

	// Python uses: ticks_per_slot = round(mid.ticks_per_beat / 3)
	const int ticksPerSlot = juce::roundToInt((double)timeFormat / 3.0);
	if (ticksPerSlot <= 0)
		return juce::Result::fail("quantizeMidiTernary: invalid ticksPerSlot computed from ppq=" + juce::String(timeFormat));

	std::vector<juce::MidiMessageSequence> quantTracks;
	quantTracks.reserve((size_t)mid.getNumTracks());

	for (int ti = 0; ti < mid.getNumTracks(); ++ti)
	{
		const auto* seq = mid.getTrack(ti); // JUCE returns const track pointer.
		if (seq == nullptr)
		{
			quantTracks.emplace_back();
			continue;
		}

		juce::MidiMessageSequence qSeq;
		for (int i = 0; i < seq->getNumEvents(); ++i)
		{
			auto* ep = seq->getEventPointer(i);
			if (ep == nullptr)
				continue;

			juce::MidiMessage msg = ep->message; // copy, we can modify timestamp on the copy

			// Match Python: quantize note_on / note_off only.
			if (msg.isNoteOn() || msg.isNoteOff())
			{
				const int tick = juce::roundToInt(msg.getTimeStamp());
				const int slot = juce::roundToInt((double)tick / (double)ticksPerSlot);
				const int newTick = slot * ticksPerSlot;
				msg.setTimeStamp((double)newTick);
			}

			// addEvent keeps the sequence sorted based on msg.getTimeStamp()
			qSeq.addEvent(msg);
		}

		// Rebuild matching note-off pointers if note timing changed.
		qSeq.updateMatchedPairs();
		quantTracks.push_back(std::move(qSeq));
	}

	// Overwrite MIDI tracks with the quantized versions.
	mid.clear();
	mid.setTicksPerQuarterNote(timeFormat);
	for (const auto& qSeq : quantTracks)
		mid.addTrack(qSeq);

	// Overwrite in place (JUCE FileOutputStream appends by default).
	juce::FileOutputStream fos(path);
	if (!fos.openedOk())
		return juce::Result::fail("quantizeMidiTernary: cannot open for writing: " + path.getFullPathName());

	if (!fos.setPosition(0))
		return juce::Result::fail("quantizeMidiTernary: could not seek to beginning: " + path.getFullPathName());

	{
		const auto tr = fos.truncate();
		if (tr.failed())
			return juce::Result::fail("quantizeMidiTernary: could not truncate output: " + tr.getErrorMessage());
	}

	if (!mid.writeTo(fos))
		return juce::Result::fail("quantizeMidiTernary: writeTo failed: " + path.getFullPathName());

	fos.flush();
	return juce::Result::ok();
}

} // namespace boomcha
