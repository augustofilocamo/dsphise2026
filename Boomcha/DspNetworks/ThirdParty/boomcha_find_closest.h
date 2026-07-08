// ==================================| Boomcha find_closest (Third Party Node) |==================================

#pragma once

/** 1 = escribe boomcha_find_debug.log en App Support y JSON en dbgBoomchaCpp. 0 = desactivado (release). */
#ifndef BOOMCHA_DEBUG_FIND_CLOSEST
#define BOOMCHA_DEBUG_FIND_CLOSEST 0
#endif

#include <JuceHeader.h>
#include <atomic>
#include <thread>

#include "src/boomcha_find_closest_job.h"

namespace
{
inline juce::File getAppDataBoomchaRoot()
{
	auto root = juce::File::getSpecialLocation(juce::File::userApplicationDataDirectory);
#if JUCE_MAC
	root = root.getChildFile("Application Support");
#endif
	juce::String company("Sampleson");
#if defined(JucePlugin_Manufacturer)
	company = juce::String(JucePlugin_Manufacturer);
#elif defined(JUCER_COMPANY_NAME)
	company = juce::String(JUCER_COMPANY_NAME);
#endif

	juce::String product("Boomcha");
	if (auto* app = juce::JUCEApplication::getInstance())
		product = app->getApplicationName();
#if defined(JucePlugin_Name)
	else
		product = juce::String(JucePlugin_Name);
#endif

	return root.getChildFile(company).getChildFile(product);
}

// #region agent log (debug b565f0)
inline juce::File getSessionDebugLogFile()
{
	return juce::File("/Users/filo/Filo/VST-Project/dsphise/Boomcha/.cursor/debug-b565f0.log");
}

inline void dbgSession(const char* runId,
                       const char* hypothesisId,
                       const char* location,
                       const juce::String& message,
                       const juce::String& dataJson)
{
	auto f = getSessionDebugLogFile();
	const auto line = juce::String("{\"sessionId\":\"b565f0\",\"runId\":\"") + runId
	                  + "\",\"hypothesisId\":\"" + hypothesisId + "\",\"location\":\"" + location
	                  + "\",\"message\":" + juce::JSON::toString(juce::var(message), true)
	                  + ",\"data\":" + dataJson + ",\"timestamp\":"
	                  + juce::String((int64)juce::Time::currentTimeMillis()) + "}\n";
	f.appendText(line, false, false, "\n");
}
// #endregion

/**
 * Root único para request / response / debug:
 *   ~/Library/Application Support/Sampleson/Boomcha
 */
inline juce::File getProjectRootDir()
{
	return getAppDataBoomchaRoot();
}

inline juce::File getBoomchaDebugLogFile()
{
	auto root = getProjectRootDir();
	if (!root.isDirectory())
		root.createDirectory();
	return root.getChildFile("boomcha_find_debug.log");
}

// #region agent log (debug b565f0)
inline void dbgBoomchaCpp(const char* hypothesisId, const juce::String& message, const juce::String& dataJson)
{
#if BOOMCHA_DEBUG_FIND_CLOSEST
	const juce::File kLog = getBoomchaDebugLogFile();
	const juce::String line = juce::String("{\"sessionId\":\"b565f0\",\"hypothesisId\":\"") + hypothesisId + "\",\"message\":"
	                         + juce::JSON::toString(juce::var(message), true) + ",\"data\":" + dataJson
	                         + ",\"timestamp\":" + juce::String((int64)juce::Time::getMillisecondCounterHiRes()) + "}\n";
	kLog.appendText(line);
#else
	(void)hypothesisId;
	(void)message;
	(void)dataJson;
#endif
}
// #endregion

inline void addUniqueCandidate(juce::Array<juce::File>& list, juce::File f)
{
	for (int i = 0; i < list.size(); ++i)
		if (list.getReference(i) == f)
			return;
	list.add(std::move(f));
}

/**
 * Busca boomcha_find_request.json donde lo escribe el script (HISE = carpeta del proyecto) y donde espera el build exportado (App Support).
 * Elige el archivo con fecha de modificación más reciente cuando hay más de uno.
 */
inline juce::File findBoomchaRequestFile()
{
	juce::Array<juce::File> candidates;
	const juce::File appRoot = getAppDataBoomchaRoot();
	addUniqueCandidate(candidates, appRoot.getChildFile("boomcha_find_request.json"));

	// HISE dev: Interface.js escribe una sola línea con la ruta absoluta del directorio del proyecto (parent del request).
	const juce::File hintFile = appRoot.getChildFile("boomcha_dev_request_dir.txt");
	if (hintFile.existsAsFile())
	{
		const juce::String dir = hintFile.loadFileAsString().trim().removeCharacters("\r");
		if (dir.isNotEmpty())
			addUniqueCandidate(candidates, juce::File(dir).getChildFile("boomcha_find_request.json"));
	}

	juce::File best;
	juce::Time newest;
	for (int i = 0; i < candidates.size(); ++i)
	{
		const juce::File& f = candidates.getReference(i);
		if (!f.existsAsFile())
			continue;
		const auto t = f.getLastModificationTime();
		if (!best.existsAsFile() || t > newest)
		{
			best = f;
			newest = t;
		}
	}
	if (!best.existsAsFile())
		best = candidates.getFirst();

	// #region agent log (debug b565f0)
	{
		juce::String dj = "{";
		dj << "\"picked\":\"" << best.getFullPathName().replaceCharacter('"', '\'') << "\"";
		dj << ",\"exists\":" << (best.existsAsFile() ? "true" : "false");
		dj << ",\"candidateCount\":" << candidates.size();
		dj << "}";
		dbgBoomchaCpp("H3", "findBoomchaRequestFile multi", dj);
	}
	// #endregion
	return best;
}

/**
 * El script (HISE y app compilada) hace polling de boomcha_find_response.json en request.project_root.
 * Si el request se eligió desde otra carpeta (p. ej. App Support), duplicamos la respuesta ahí.
 */
inline void mirrorBoomchaResponseToProjectRootIfNeeded(const juce::var& parsedRequest,
                                                        const juce::File& primaryResponse,
                                                        const juce::String& responseBody)
{
	if (responseBody.isEmpty())
		return;
	const auto* obj = parsedRequest.getDynamicObject();
	if (obj == nullptr)
		return;
	juce::String pr = obj->getProperty("project_root").toString().trim();
	if (pr.isEmpty())
		return;
	juce::File dest = juce::File(pr).getChildFile("boomcha_find_response.json");
	if (dest.getFullPathName().equalsIgnoreCase(primaryResponse.getFullPathName()))
		return;
	(void)dest.getParentDirectory().createDirectory();
	dest.replaceWithText(responseBody);
}

/** Si no hay request, escribir el error en response del project root. */
inline juce::File defaultBoomchaResponseFileWhenRequestMissing()
{
	return getProjectRootDir().getChildFile("boomcha_find_response.json");
}
} // namespace

namespace project
{
using namespace juce;
using namespace hise;
using namespace scriptnode;

template <int NV> struct boomcha_find_closest: public data::base
{
	SNEX_NODE(boomcha_find_closest);

	struct MetadataClass
	{
		SN_NODE_ID("boomcha_find_closest");
	};

	static constexpr bool isModNode() { return false; };
	static constexpr bool isPolyphonic() { return NV > 1; };
	static constexpr bool hasTail() { return false; };
	static constexpr bool isSuspendedOnSilence() { return false; };
	static constexpr int getFixChannelAmount() { return 2; };

	static constexpr int NumTables = 0;
	static constexpr int NumSliderPacks = 0;
	static constexpr int NumAudioFiles = 0;
	static constexpr int NumFilters = 0;
	static constexpr int NumDisplayBuffers = 0;

	void prepare(PrepareSpecs specs)
	{
		(void)specs;
		juce::String dj = "{";
		dj << "\"root\":\"" << getProjectRootDir().getFullPathName().replaceCharacter('"', '\'') << "\"";
		dj << ",\"request\":\"" << findBoomchaRequestFile().getFullPathName().replaceCharacter('"', '\'') << "\"";
		dj << "}";
		dbgBoomchaCpp("H0", "prepare", dj);
		// #region agent log (debug b565f0)
		dbgSession("baseline", "A", "boomcha_find_closest.h:prepare", "prepare_called", dj);
		// #endregion
	}

	void reset() {}

	void handleHiseEvent(HiseEvent& e) { (void)e; }

	template <typename T> void process(T& data)
	{
		static constexpr int NumChannels = getFixChannelAmount();
		auto& fixData = data.template as<ProcessData<NumChannels>>();
		auto fd = fixData.toFrameData();
		while (fd.next())
			processFrame(fd.toSpan());
	}

	template <typename T> void processFrame(T& data) { (void)data; }

	int handleModulation(double& value)
	{
		(void)value;
		return 0;
	}

	void setExternalData(const ExternalData& data, int index) { (void)data; (void)index; }

	std::atomic<bool> busy { false };
	std::atomic<bool> runPending { false };
	double lastRunParam = 0.0;

	template <int P> void setParameter(double v)
	{
		if (P != 0)
			return;
		const bool rising = (v > 0.5 && lastRunParam <= 0.5);
		// #region agent log (debug b565f0)
		{
			juce::String dj = "{";
			dj << "\"v\":" << juce::String(v, 4);
			dj << ",\"lastRunBefore\":" << juce::String(lastRunParam, 4);
			dj << ",\"rising\":" << (rising ? "true" : "false");
			dj << ",\"busy\":" << (busy.load() ? "true" : "false");
			dj << ",\"runPending\":" << (runPending.load() ? "true" : "false");
			dj << "}";
			dbgBoomchaCpp("H2", "setParameter Run", dj);
			// #region agent log (debug b565f0)
			dbgSession("baseline", "B", "boomcha_find_closest.h:setParameter", "setParameter_Run", dj);
			// #endregion
		}
		// #endregion

		lastRunParam = v;
		if (!rising)
		{
			dbgBoomchaCpp("H2", "setParameter skipped (no rising)", "{}");
			return;
		}

		if (busy.load())
		{
			runPending.store(true);
			dbgBoomchaCpp("H2", "run_queued_while_busy", "{}");
			return;
		}

		busy = true;
		{
			std::thread([this]() {
				while (true)
				{
					juce::File req = findBoomchaRequestFile();
					{
						juce::String dj = "{";
						dj << "\"path\":\"" << req.getFullPathName().replaceCharacter('"', '\'') << "\"";
						dj << ",\"exists\":" << (req.existsAsFile() ? "true" : "false");
						dj << "}";
						dbgBoomchaCpp("H3", "thread request file", dj);
						// #region agent log (debug b565f0)
						dbgSession("baseline", "C", "boomcha_find_closest.h:thread", "thread_request_file", dj);
						// #endregion
					}

					if (!req.existsAsFile())
					{
						auto respMissing = defaultBoomchaResponseFileWhenRequestMissing();
						dbgBoomchaCpp("H3", "request missing; writing error response", "{\"note\":\"no req file\"}");
						// #region agent log (debug b565f0)
						dbgSession("baseline", "D", "boomcha_find_closest.h:thread", "request_missing", "{\"note\":\"no req file\"}");
						// #endregion
						writeErrorResponse("boomcha_find_request.json missing (buscado en temp y Caches/HISE)", respMissing);
						break;
					}

					juce::File responseOut = req.getParentDirectory().getChildFile("boomcha_find_response.json");
					auto parsed = juce::JSON::parse(req.loadFileAsString());
					if (parsed.isVoid())
					{
						dbgBoomchaCpp("H3", "invalid JSON in request file", "{\"note\":\"parse failed\"}");
						writeErrorResponse("Invalid JSON in request file", responseOut);
						break;
					}

					juce::String responseJson;
					juce::String jobErr;
					auto r = boomcha::runFindClosestJob(parsed, responseJson, jobErr);

					// #region agent log (debug b565f0)
					{
						juce::String dj = "{";
						dj << "\"failed\":" << (r.failed() ? "true" : "false");
						dj << ",\"jobErrEmpty\":" << (jobErr.isEmpty() ? "true" : "false");
						dj << ",\"responseJsonLen\":" << (int)responseJson.length();
						dj << ",\"responseOut\":\"" << responseOut.getFullPathName().replaceCharacter('"', '\'') << "\"";
						dj << "}";
						dbgBoomchaCpp("H4", "before write response", dj);
						// #region agent log (debug b565f0)
						dbgSession("baseline", "E", "boomcha_find_closest.h:thread", "before_write_response", dj);
						// #endregion
					}
					// #endregion

					juce::String responsePayload;
					if (r.failed() || jobErr.isNotEmpty())
					{
						auto* o = new juce::DynamicObject();
						o->setProperty("error", jobErr.isNotEmpty() ? jobErr : r.getErrorMessage());
						responsePayload = juce::JSON::toString(juce::var(o), false);
						responseOut.replaceWithText(responsePayload);
					}
					else
					{
						responsePayload = responseJson;
						responseOut.replaceWithText(responsePayload);
					}
					mirrorBoomchaResponseToProjectRootIfNeeded(parsed, responseOut, responsePayload);

					// #region agent log (debug b565f0)
					{
						juce::String dj = "{";
						dj << "\"existsAfterWrite\":" << (responseOut.existsAsFile() ? "true" : "false");
						dj << ",\"sizeAfterWrite\":" << (int)responseOut.getSize();
						dj << "}";
						dbgBoomchaCpp("H4", "after write response", dj);
					}
					// #endregion

					// Si durante el job entró otro pulso Run, lo hacemos correr ahora mismo.
					if (!runPending.exchange(false))
						break;
				}

				busy = false;
			}).detach();
		}
	}

	void writeErrorResponse(const juce::String& e, const juce::File& responseOut)
	{
		auto* o = new juce::DynamicObject();
		o->setProperty("error", e);
		responseOut.replaceWithText(juce::JSON::toString(juce::var(o), false));
	}

	void createParameters(ParameterDataList& data)
	{
		{
			parameter::data p("Run", { 0.0, 1.0 });
			registerCallback<0>(p);
			p.setDefaultValue(0.0);
			data.add(std::move(p));
		}
	}
};

} // namespace project
