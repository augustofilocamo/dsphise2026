Content.makeFrontInterface(600, 600);
/*
	Flux + HFC combinados: pico aceptado solo si flux pasa (decay) Y HFC pasa umbral. Ventana; audio normalizado antes de todo.
*/


const var AudioLoopPlayer1 = Synth.getAudioSampleProcessor("Audio Loop Player1");
const var afSlot = AudioLoopPlayer1.getAudioFile(0);

const var MidiPlayer1 = Synth.getMidiPlayer("MIDI Player1");
MidiPlayer1.setUseTimestampInTicks(true);

const var AnalyzeResult = Content.getComponent("AnalyzeResult");
const var bpmKnob = Content.getComponent("bpmKnob");
bpmKnob.setRange(40, 300, 1);

const var BPM = 120.0;


// Bpm form knob
inline function onbpmKnobControl(component, value)
{
	Engine.setHostBpm(value);
};

Content.getComponent("bpmKnob").setControlCallback(onbpmKnobControl);


const var fftObject = Engine.createFFT();
const var fftSize = 512;
const var hopSize = 128;

const var REFRACTORY_MS = 40.0;
// Decay desde cada pico: decayLevel = peakVal * DECAY_PER_FRAME^(frames desde pico). Nuevo pico solo si val > decayLevel.
const var DECAY_PER_FRAME = 0.990;
// Umbral HFC: solo aceptar onset si HFC en ese frame >= median(hfcCurve) * HFC_THRESHOLD_FACTOR.
const var HFC_THRESHOLD_FACTOR = 0.4;

var onsetCurve = [];
var hfcCurve = [];
var onsetOffsetsSamples = [];
const var STEMS_RUN_FOLDER = "current";
var g_prevMagnitudes = [];
var g_cbI = 0;
var g_flux = 0.0;
var g_hfc = 0.0;
var g_diff = 0.0;

// Flux (half-wave) + HFC por frame. Curva de onset = flux; HFC se usa después para filtrar picos.
const var magnitudeCallback = function(data, offset)
{
	g_flux = 0.0;
	g_hfc = 0.0;
	g_cbI = 0;
	if (g_prevMagnitudes.length !== data.length)
	{
		while (g_cbI < data.length)
		{
			g_prevMagnitudes[g_cbI] = data[g_cbI];
			g_hfc += data[g_cbI] * (g_cbI + 1);
			g_cbI += 1;
		}
		onsetCurve.push(0.0);
		hfcCurve.push(g_hfc);
		onsetOffsetsSamples.push(offset);
		return;
	}
	while (g_cbI < data.length)
	{
		g_diff = data[g_cbI] - g_prevMagnitudes[g_cbI];
		if (g_diff > 0.0)
			g_flux += g_diff;
		g_hfc += data[g_cbI] * (g_cbI + 1);
		g_prevMagnitudes[g_cbI] = data[g_cbI];
		g_cbI += 1;
	}
	onsetCurve.push(g_flux);
	hfcCurve.push(g_hfc);
	onsetOffsetsSamples.push(offset);
};

fftObject.setMagnitudeFunction(magnitudeCallback, false);
fftObject.setOverlap(0.75);
fftObject.prepare(fftSize, 1);
if (typeof fftObject.Hanning !== "undefined")
	fftObject.setWindowType(fftObject.Hanning);
else if (typeof fftObject.BlackmanHarris !== "undefined")
	fftObject.setWindowType(fftObject.BlackmanHarris);


inline function getRecordedLength()
{
	if (!afSlot) return 0;
	return afSlot.getNumSamples();
}

inline function median(arr)
{
	if (arr.length === 0) return 0.0;
	local sorted = [];
	local i = 0;
	while (i < arr.length) { sorted.push(arr[i]); i += 1; }
	sorted.sort(function(a, b) { return a - b; });
	local mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 1)
		return sorted[mid];
	return 0.5 * (sorted[mid - 1] + sorted[mid]);
}

// Quedarse solo con picos cuyo frame tiene HFC >= umbral (flux y HFC pasan).
inline function filterPeaksByHfc(peakIndices, hfcCurve, hfcThreshold)
{
	local out = [];
	local i = 0;
	while (i < peakIndices.length)
	{
		local idx = peakIndices[i];
		if (idx < hfcCurve.length && hfcCurve[idx] >= hfcThreshold)
			out.push(idx);
		i += 1;
	}
	return out;
}

// Pico válido solo cuando empieza el decay (no en pleno ataque): ataque suave = no generar pico hasta que la curva baje.
// Registramos el pico en el frame donde la curva deja de subir y empieza a bajar, si supera la decay del pico anterior.
inline function pickPeaksWithDecay(curve, decayPerFrame)
{
	local peaks = [];
	local lastPeakIdx = -1;
	local lastPeakVal = 0.0;
	local i = 2;
	while (i < curve.length)
	{
		local crestVal = curve[i - 1];
		local decayLevel = (lastPeakIdx >= 0) ? lastPeakVal * Math.pow(decayPerFrame, (i - 1) - lastPeakIdx) : 0.0;
		local wasRising = (i >= 2) ? (crestVal >= curve[i - 2]) : true;
		local nowFalling = (i < curve.length) ? (curve[i] < crestVal) : true;
		local isCrest = wasRising && nowFalling;
		if (isCrest && crestVal > decayLevel)
		{
			peaks.push(i - 1);
			lastPeakIdx = i - 1;
			lastPeakVal = crestVal;
		}
		i += 1;
	}
	return peaks;
}

inline function mergeNearbyPeaks(curve, peakIndices, minSepFrames)
{
	if (peakIndices.length === 0) return peakIndices;
	local merged = [];
	local i = 0;
	while (i < peakIndices.length)
	{
		local bestIdx = peakIndices[i];
		local bestVal = (bestIdx < curve.length) ? curve[bestIdx] : 0;
		local j = i + 1;
		while (j < peakIndices.length && (peakIndices[j] - peakIndices[i]) < minSepFrames)
		{
			local idx = peakIndices[j];
			local v = (idx < curve.length) ? curve[idx] : 0;
			if (v > bestVal) { bestVal = v; bestIdx = idx; }
			j += 1;
		}
		merged.push(bestIdx);
		i = j;
	}
	return merged;
}

// Desde la cresta, retroceder hasta donde la curva empieza a subir (inicio del ataque).
inline function attackStartFrame(curve, crestIdx)
{
	local j = crestIdx;
	while (j > 0 && curve[j - 1] < curve[j])
		j -= 1;
	return j;
}

inline function crestIndicesToOnsetFrames(curve, crestIndices)
{
	local onsetFrames = [];
	local i = 0;
	while (i < crestIndices.length)
	{
		onsetFrames.push(attackStartFrame(curve, crestIndices[i]));
		i += 1;
	}
	return onsetFrames;
}

inline function refractoryFrames(sr)
{
	local sec = REFRACTORY_MS / 1000.0;
	local frames = Math.round(sec * sr / hopSize);
	if (frames < 1) frames = 1;
	return frames;
}

inline function framesToTime(frameIndices, sr)
{
	local times = [];
	local i = 0;
	while (i < frameIndices.length)
	{
		local sampleOffset = onsetOffsetsSamples[frameIndices[i]];
		times.push(Math.round((sampleOffset / sr) * 1000) / 1000);
		i += 1;
	}
	return times;
}

inline function peakValuesToVelocity(curve, peakIndices)
{
	local vals = [];
	local i = 0;
	while (i < peakIndices.length)
	{
		vals.push(curve[peakIndices[i]]);
		i += 1;
	}
	if (vals.length === 0) return vals;
	local maxVal = 0;
	i = 0;
	while (i < vals.length)
	{
		if (vals[i] > maxVal) maxVal = vals[i];
		i += 1;
	}
	if (maxVal < 0.0001) maxVal = 1;
	local out = [];
	i = 0;
	while (i < vals.length)
	{
		local v = Math.round(40 + (vals[i] / maxVal) * 87);
		if (v < 1) v = 1;
		if (v > 127) v = 127;
		out.push(v);
		i += 1;
	}
	return out;
}

// Misma lógica que los stems (un segmento por nota MIDI: inicio + duración NOTE_LEN). Solo exporta JSON para usar después; sin WAV.
// vels: array de velocity 1-127 por onset (mismo orden que times); si no se pasa, se usa 80.
inline function exportStemsJson(buffer, n, times, sr, bpm, vels)
{
	if (times.length === 0) return;
	local ticksPerSecond = (bpm / 60.0) * 960;
	local NOTE_LEN_TICKS = 120;
	local noteLenSec = NOTE_LEN_TICKS / ticksPerSecond;
	local noteLenSamples = Math.round(noteLenSec * sr);

	local stems = [];
	local i = 0;
	while (i < times.length)
	{
		local startSample = Math.round(times[i] * sr);
		if (startSample < 0) startSample = 0;
		local endSample = startSample + noteLenSamples;
		if (endSample > n) endSample = n;
		if (i + 1 < times.length)
		{
			local nextStart = Math.round(times[i + 1] * sr);
			if (nextStart < endSample) endSample = nextStart;
		}
		local len = endSample - startSample;
		if (len > 0)
		{
			local vel = (vels !== undefined && i < vels.length) ? vels[i] : 80;
			if (vel < 1) vel = 1;
			if (vel > 127) vel = 127;
			stems.push({
				"index": i,
				"startTime": times[i],
				"durationSec": (endSample - startSample) / sr,
				"startSample": startSample,
				"lengthSamples": len,
				"velocity": vel,
				"vel": vel
			});
		}
		i += 1;
	}

	local json = {
		"sr": sr,
		"bpm": bpm,
		"noteLenSec": noteLenSec,
		"totalSamples": n,
		"stems": stems
	};

	local base = FileSystem.getFolder(FileSystem.AudioFiles).createDirectory("stems");
	local stemsFolder = base.createDirectory(STEMS_RUN_FOLDER);
	local f = stemsFolder.getChildFile("stems.json");
	f.writeObject(json);
	Console.print("Stems JSON: " + stems.length + " → stems/" + STEMS_RUN_FOLDER + "/stems.json");
}

// Exporta estado de los 16 botones BD/SD a grid_buttons.json para find_closest_groove_bar.py --grid
inline function exportGridButtonsToJson(component, value)
{
	Console.print("[Export Grid] Exportando grid_buttons.json");
	local audioRoot = FileSystem.getFolder(FileSystem.AudioFiles);
	local base = audioRoot.createDirectory("stems");
	local folder = base.createDirectory(STEMS_RUN_FOLDER);
	if (!folder.hasWriteAccess())
	{
		Console.print("[Export Grid] ERROR: sin permiso de escritura en stems/" + STEMS_RUN_FOLDER);
		AnalyzeResult.set("text", "Error: sin permiso en stems/" + STEMS_RUN_FOLDER);
		return;
	}
	local bd = [];
	local sd = [];
	local i = 0;
	while (i < 16)
	{
		local bdBtn = Content.getComponent("bd" + (i + 1));
		local sdBtn = Content.getComponent("sd" + (i + 1));
		bd.push(bdBtn ? (bdBtn.getValue() > 0.5 ? 1 : 0) : 0);
		sd.push(sdBtn ? (sdBtn.getValue() > 0.5 ? 1 : 0) : 0);
		i += 1;
	}
	local bpm = bpmKnob.getValue();
	if (bpm < 40 || bpm > 300) bpm = BPM;
	local obj = { "bpm": bpm, "bd": bd, "sd": sd };
	local f = folder.getChildFile("grid_buttons.json");
	local ok = f.writeObject(obj);
	if (ok)
	{
		local pathStr = "stems/" + STEMS_RUN_FOLDER + "/grid_buttons.json";
		AnalyzeResult.set("text", "Grid OK → " + pathStr);
		Console.print("[Export Grid] OK → " + pathStr + "  BPM=" + bpm);
		// Cargar grid en MidiPlayer1 (1 compás BD+SD, 16 slots)
		local NOTE_LEN_TICKS = 120;
		local TICKS_PER_SLOT = 240;  // 4*960/16
		local VEL = 100;
		local messageList = [];
		i = 0;
		while (i < 16)
		{
			local tick = i * TICKS_PER_SLOT;
			if (bd[i] && bd[i] !== 0)
			{
				local on = Engine.createMessageHolder();
				on.setType(1);
				on.setTimestamp(tick);
				on.setNoteNumber(36);
				on.setVelocity(VEL);
				on.setChannel(10);
				messageList.push(on);
				local off = Engine.createMessageHolder();
				off.setType(2);
				off.setTimestamp(tick + NOTE_LEN_TICKS);
				off.setNoteNumber(36);
				off.setVelocity(0);
				off.setChannel(10);
				messageList.push(off);
			}
			if (sd[i] && sd[i] !== 0)
			{
				local on = Engine.createMessageHolder();
				on.setType(1);
				on.setTimestamp(tick);
				on.setNoteNumber(38);
				on.setVelocity(VEL);
				on.setChannel(10);
				messageList.push(on);
				local off = Engine.createMessageHolder();
				off.setType(2);
				off.setTimestamp(tick + NOTE_LEN_TICKS);
				off.setNoteNumber(38);
				off.setVelocity(0);
				off.setChannel(10);
				messageList.push(off);
			}
			i += 1;
		}
		MidiPlayer1.clearAllSequences();
		MidiPlayer1.create(4, 4, 1);
		MidiPlayer1.flushMessageListToSequence(messageList, 1);
		MidiPlayer1.setSequence(1);
		Console.print("[Export Grid] MIDI cargado en MidiPlayer1 (1 bar)");
	}
	else
	{
		Console.print("[Export Grid] ERROR: writeObject falló");
		AnalyzeResult.set("text", "Error al guardar grid_buttons.json");
	}
}

inline function createMidiFromOnsets(times, vels, durationSeconds)
{
	local bpm = bpmKnob.getValue();
	if (bpm < 40 || bpm > 300) bpm = BPM;
	local ticksPerSecond = (bpm / 60.0) * 960;
	local numBars = Math.ceil((durationSeconds * bpm) / 240.0);
	if (numBars < 1) numBars = 1;
	local NOTE_LEN_TICKS = 120;
	local SNARE = 38;
	local messageList = [];
	local i = 0;
	while (i < times.length)
	{
		local tick = Math.round(times[i] * ticksPerSecond);
		local vel = (i < vels.length) ? vels[i] : 80;
		local on = Engine.createMessageHolder();
		on.setType(1);
		on.setTimestamp(tick);
		on.setNoteNumber(SNARE);
		on.setVelocity(vel);
		on.setChannel(10);
		messageList.push(on);
		local off = Engine.createMessageHolder();
		off.setType(2);
		off.setTimestamp(tick + NOTE_LEN_TICKS);
		off.setNoteNumber(SNARE);
		off.setVelocity(0);
		off.setChannel(10);
		messageList.push(off);
		i += 1;
	}
	MidiPlayer1.clearAllSequences();
	MidiPlayer1.create(4, 4, numBars);
	MidiPlayer1.flushMessageListToSequence(messageList, 1);
	MidiPlayer1.setSequence(1);
	Console.print("MIDI: " + times.length + " notes (SD), " + numBars + " bars @ " + bpm + " BPM");
}

// Clase (formato viejo) → nota GM. Multi-label usa predicted_notes[].
inline function classToNote(predictedClass)
{
	if (predictedClass === "Kick") return 36;
	if (predictedClass === "Snare") return 38;
	if (predictedClass === "Closed Hat") return 42;
	return 42;
}

inline function applyClassificationFromJson(component, value)
{
	local base = FileSystem.getFolder(FileSystem.AudioFiles).getChildFile("stems").getChildFile(STEMS_RUN_FOLDER);
	local inferenceFile = base.getChildFile("inference_output.json");
	if (!inferenceFile.isFile())
	{
		AnalyzeResult.set("text", "Falta inference_output.json en stems/" + STEMS_RUN_FOLDER);
		return;
	}
	local data = inferenceFile.loadAsObject();
	if (!data || data.length === undefined)
	{
		AnalyzeResult.set("text", "JSON inválido");
		return;
	}
	local stemsFile = base.getChildFile("stems.json");
	if (!stemsFile.isFile())
	{
		AnalyzeResult.set("text", "Falta stems.json en run");
		return;
	}
	local stemsData = stemsFile.loadAsObject();
	local bpm = (stemsData && stemsData.bpm !== undefined) ? stemsData.bpm : bpmKnob.getValue();
	if (bpm < 40 || bpm > 300) bpm = BPM;
	local stemCount = (stemsData && stemsData.stems !== undefined) ? stemsData.stems.length : 0;
	if (stemCount > 0 && data.length !== stemCount)
	{
		AnalyzeResult.set("text", "Run distinto: " + data.length + " vs " + stemCount + " stems");
		return;
	}
	local ticksPerSecond = (bpm / 60.0) * 960;
	local NOTE_LEN_TICKS = 120;
	local messageList = [];
	local i = 0;
	while (i < data.length)
	{
		local item = data[i];
		local notes = [];
		if (item.predicted_notes !== undefined && item.predicted_notes.length > 0)
		{
			local k = 0;
			while (k < item.predicted_notes.length)
			{
				notes.push(item.predicted_notes[k]);
				k += 1;
			}
		}
		else
		{
			notes.push(classToNote(item.predicted_class));
		}
		local tick = Math.round(item.timestamp * ticksPerSecond);
		// Velocity: preferir la guardada en stems.json al exportar; fallback velocity_estimate de la red
		local stemVel = null;
		if (stemsData.stems[i] !== undefined)
		{
			local v = stemsData.stems[i].velocity !== undefined ? stemsData.stems[i].velocity : stemsData.stems[i].vel;
			if (v !== undefined && v !== null) { stemVel = parseInt(v, 10); if (stemVel < 1 || stemVel > 127) stemVel = null; }
		}
		local vel = (stemVel !== null) ? stemVel : (40 + Math.round((item.velocity_estimate || 0.5) * 87));
		if (vel < 1) vel = 1;
		if (vel > 127) vel = 127;
		local n = 0;
		while (n < notes.length)
		{
			local note = notes[n];
			local on = Engine.createMessageHolder();
			on.setType(1);
			on.setTimestamp(tick);
			on.setNoteNumber(note);
			on.setVelocity(vel);
			on.setChannel(10);
			messageList.push(on);
			local off = Engine.createMessageHolder();
			off.setType(2);
			off.setTimestamp(tick + NOTE_LEN_TICKS);
			off.setNoteNumber(note);
			off.setVelocity(0);
			off.setChannel(10);
			messageList.push(off);
			n += 1;
		}
		i += 1;
	}
	if (messageList.length === 0)
	{
		AnalyzeResult.set("text", "Nada que mapear");
		return;
	}
	local lastTick = 0;
	i = 0;
	while (i < messageList.length)
	{
		local t = messageList[i].getTimestamp();
		if (t > lastTick) lastTick = t;
		i += 1;
	}
	local numBars = Math.ceil((lastTick / 960 + 1) / 4);
	if (numBars < 1) numBars = 1;
	MidiPlayer1.clearAllSequences();
	MidiPlayer1.create(4, 4, numBars);
	MidiPlayer1.flushMessageListToSequence(messageList, 1);
	MidiPlayer1.setSequence(1);
	AnalyzeResult.set("text", (messageList.length / 2) + " notas (BD/SD/HH multi)");
	Console.print("MIDI: " + (messageList.length / 2) + " notes (class), " + numBars + " bars @ " + bpm + " BPM");
}

inline function onAnalyzeControl(component, value)
{
	local n = getRecordedLength();
	if (n <= 0)
	{
		Console.print("No WAV loaded");
		AnalyzeResult.set("text", "No WAV loaded");
		return;
	}
	if (n < fftSize)
	{
		AnalyzeResult.set("text", n + " samples (need " + fftSize + "+)");
		return;
	}

	afSlot.setRange(0, n);
	local audioContent = afSlot.getContent();
	local buffer;

	if (audioContent && audioContent.length === n)
		buffer = audioContent;
	else if (audioContent && audioContent.length !== undefined && audioContent[0])
	{
		local left = audioContent[0];
		local right = audioContent[1];
		buffer = Buffer.create(left.length);
		local i = 0;
		while (i < left.length)
		{
			buffer[i] = right ? 0.5 * (left[i] + right[i]) : left[i];
			i += 1;
		}
	}
	else
	{
		AnalyzeResult.set("text", "No buffer");
		return;
	}

	// Normalizar por pico antes de todo (pico → 0.99)
	local peak = 0.0;
	i = 0;
	while (i < n)
	{
		local s = buffer[i];
		if (s < 0) s = -s;
		if (s > peak) peak = s;
		i += 1;
	}
	if (peak < 1e-6) peak = 1.0;
	i = 0;
	while (i < n)
	{
		buffer[i] = (buffer[i] / peak) * 0.99;
		i += 1;
	}

	local sr = Engine.getSampleRate();
	onsetCurve = [];
	hfcCurve = [];
	onsetOffsetsSamples = [];
	g_prevMagnitudes = [];
	fftObject.process(buffer);

	local peaks = pickPeaksWithDecay(onsetCurve, DECAY_PER_FRAME);
	local minSep = refractoryFrames(sr);
	peaks = mergeNearbyPeaks(onsetCurve, peaks, minSep);

	local hfcThreshold = median(hfcCurve) * HFC_THRESHOLD_FACTOR;
	peaks = filterPeaksByHfc(peaks, hfcCurve, hfcThreshold);

	local onsetFrames = crestIndicesToOnsetFrames(onsetCurve, peaks);
	local times = framesToTime(onsetFrames, sr);
	local vels = peakValuesToVelocity(onsetCurve, peaks);

	local bpm = bpmKnob.getValue();
	if (bpm < 40 || bpm > 300) bpm = BPM;
	createMidiFromOnsets(times, vels, n / sr);

	exportStemsJson(buffer, n, times, sr, bpm, vels);

	local txt = times.length + " onsets → SD · stems/";
	AnalyzeResult.set("text", txt);
	Console.print(txt);
}

Content.getComponent("Analizebutton").setControlCallback(onAnalyzeControl);
Content.getComponent("postprocessButton").setControlCallback(applyClassificationFromJson);
var exportGridBtn = Content.getComponent("exportGridButton");
if (exportGridBtn) exportGridBtn.setControlCallback(exportGridButtonsToJson);
var quantizeBtn = Content.getComponent("quantizeButton");
if (quantizeBtn) quantizeBtn.setControlCallback(exportGridButtonsToJson);


function onNoteOn()
{
	
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 