Content.makeFrontInterface(600, 400);

reg boomchaMatchTwoConsecutiveBars = false;

// Los componentes de UI deben declararse aquí (global), no dentro de onInit, para que aparezcan en el Interface Designer.
const var btnWriteRequest = Content.addButton("WriteRequest", 20, 20);
const var btnReadResponse = Content.addButton("ReadResponse", 20, 55);

const var REQ_NAME = "boomcha_find_request.json";
const var RES_NAME = "boomcha_find_response.json";

/** Raíz del proyecto HISE: padre de AudioFiles (misma árbol que stems/grid). UserPresets solo como fallback (a veces apunta a ruta/expansión vieja). */
inline function getProjectBase()
{
	local af = FileSystem.getFolder(FileSystem.AudioFiles);
	if (af != undefined && af.isDirectory())
		return af.getParentDirectory();
	return FileSystem.getFolder(FileSystem.UserPresets).getParentDirectory();
}

inline function ensureBoomchaCppCompanyProductDir()
{
	local home = FileSystem.getFolder(FileSystem.UserHome);
	if (home == undefined || !home.isDirectory())
		return undefined;
	local company = "Sampleson";
	local product = "Boomcha";
	local lib = home.getChildFile("Library");
	if (lib.isDirectory() && lib.getChildFile("Application Support").isDirectory())
	{
		local as = lib.getChildFile("Application Support");
		return as.createDirectory(company).createDirectory(product);
	}
	local roam = home.getChildFile("AppData").getChildFile("Roaming");
	if (roam == undefined || !roam.isDirectory())
		return undefined;
	return roam.createDirectory(company).createDirectory(product);
}

inline function writeBoomchaDevRequestDirHint(projectDirAbs)
{
	local io = ensureBoomchaCppCompanyProductDir();
	if (io == undefined)
		return;
	io.getChildFile("boomcha_dev_request_dir.txt").writeString("" + projectDirAbs);
}

inline function copyBoomchaFindRequestToAppSupportMirror(localRequestFile)
{
	local io = ensureBoomchaCppCompanyProductDir();
	if (io == undefined || localRequestFile == undefined || !localRequestFile.isFile())
		return;
	io.getChildFile("boomcha_find_request.json").writeString(localRequestFile.loadAsString());
}

// Todo el flujo dentro del proyecto (sin temp del sistema / caches externas).
reg projectBase = getProjectBase();
reg requestFile = projectBase.getChildFile(REQ_NAME);
reg responseFile = projectBase.getChildFile(RES_NAME);

// #region agent log (debug b565f0)
inline function dbgBoomchaLog(hypothesisId, message, dataJson)
{
	local root = getProjectBase();
	local logF = root.getChildFile(".cursor/debug-b565f0.log");
	local ts = Math.floor(Engine.getUptime() * 1000.0);
	local line = "{\"sessionId\":\"b565f0\",\"hypothesisId\":\"" + hypothesisId + "\",\"message\":\"" + message + "\",\"data\":" + dataJson + ",\"timestamp\":" + ts + "}\n";
	local prev = "";
	if (logF.isFile())
		prev = logF.loadAsString();
	logF.writeString(prev + line);
}
// #endregion

/** Misma ruta que grid-to-human: AudioFiles/stems/current/grid_buttons.json */
inline function loadGridFromStemsOrDefault()
{
	local audioRoot = FileSystem.getFolder(FileSystem.AudioFiles);
	local gridFile = audioRoot.getChildFile("stems/current/grid_buttons.json");
	local defBpm = 100;
	local defBd = [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0];
	local defSd = [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0];
	if (!gridFile.isFile())
	{
		Console.print("[boomcha] grid: default (no existe AudioFiles/stems/current/grid_buttons.json — exportá desde grid-to-human)");
		local g = {};
		g.bpm = defBpm;
		g.bd = defBd;
		g.sd = defSd;
		// #region agent log (debug b565f0)
		dbgBoomchaLog("JGRID", "grid_read_missing_file_default", "{\"bpm\":" + defBpm + "}");
		// #endregion
		return g;
	}
	local s = gridFile.loadAsString();
	local o = s.parseAsJSON();
	if (!o || o.bd == undefined || o.sd == undefined)
	{
		Console.print("[boomcha] grid: JSON inválido, usando default");
		local g2 = {};
		g2.bpm = defBpm;
		g2.bd = defBd;
		g2.sd = defSd;
		// #region agent log (debug b565f0)
		dbgBoomchaLog("JGRID", "grid_read_invalid_json_default", "{\"bpm\":" + defBpm + "}");
		// #endregion
		return g2;
	}
	local bp = o.bpm;
	if (bp == undefined || bp < 40 || bp > 300)
		bp = defBpm;
	Console.print("[boomcha] grid: stems/current/grid_buttons.json  bpm=" + bp);
	// #region agent log (debug b565f0)
	{
		local bdArr = o.bd;
		local sdArr = o.sd;
		local bdOnes = 0;
		local sdOnes = 0;
		local i = 0;
		while (i < bdArr.length)
		{
			if (bdArr[i] > 0.5) bdOnes = bdOnes + 1;
			i = i + 1;
		}
		i = 0;
		while (i < sdArr.length)
		{
			if (sdArr[i] > 0.5) sdOnes = sdOnes + 1;
			i = i + 1;
		}
		dbgBoomchaLog("JGRID", "grid_read_counts", "{\"bpm\":" + bp + ",\"bdOnes\":" + bdOnes + ",\"sdOnes\":" + sdOnes + ",\"bdLen\":" + bdArr.length + ",\"sdLen\":" + sdArr.length + "}");
	}
	// #endregion
	return o;
}

inline function buildTestRequest(fallbackDist, topN, barsN, useHh, hhMin, ternaryMode)
{
	local base = getProjectBase();
	local grid = loadGridFromStemsOrDefault();
	local stems = FileSystem.getFolder(FileSystem.AudioFiles).createDirectory("stems");
	// createDirectory(name) ya crea la carpeta; no usar createDirectory() sin argumentos (HISE exige 1 arg).
	local outDir = stems.createDirectory("cpp_hello_test");
	local mainBank = base.getChildFile("pattern_bank.bbank");
	if (!mainBank.isFile())
	{
		Console.print("[boomcha] ERROR: no existe " + mainBank.toString(mainBank.FullPath));
		Console.print("      Exportá: python3 drum_classifier/export_bank_for_cpp.py pattern_bank.npz -o pattern_bank.bbank");
		return false;
	}
	local req = {};
	req.grid = grid;
	req.bank_main = mainBank.toString(base.FullPath);
	req.fallback_if_dist_above = fallbackDist;
	req.top = topN;
	req.bars = barsN;
	req.use_hh = useHh;
	req.hh_min = hhMin;
	req.ternary = ternaryMode;
	req.output_dir = outDir.toString(outDir.FullPath);
	req.project_root = base.toString(base.FullPath);
	req.velocity = 100;
	req.match_two_consecutive_bars = boomchaMatchTwoConsecutiveBars;
	Console.print("[boomcha] project_root (para MidiFiles.dat y rutas relativas): " + req.project_root);
	if (!requestFile.writeObject(req))
	{
		Console.print("[boomcha] ERROR: could not write " + requestFile.toString(requestFile.FullPath));
		return false;
	}
	writeBoomchaDevRequestDirHint(base.toString(base.FullPath));
	copyBoomchaFindRequestToAppSupportMirror(requestFile);
	Console.print("[boomcha] Wrote request: " + requestFile.toString(requestFile.FullPath));
	if (req.match_two_consecutive_bars)
		Console.print("[boomcha] find_closest: 2 compases consecutivos (mismo grid)");
	else
		Console.print("[boomcha] find_closest: 1 compás");
	return true;
}

inline function printResponse()
{
	if (!responseFile.isFile())
	{
		Console.print("[boomcha] No response file yet en project root. Trigger Run on boomcha_find_closest node, then call printResponse again.");
		return;
	}
	local s = responseFile.loadAsString();
	if (s == "")
		return;
	local o = s.parseAsJSON();
	if (!o)
	{
		Console.print("[boomcha] Could not parse response JSON");
		return;
	}
	if (o.error != undefined && o.error != "")
	{
		Console.print("[boomcha] ERROR: " + o.error);
		return;
	}
	if (o.matches == undefined)
	{
		Console.print("[boomcha] Unexpected response (no matches)");
		return;
	}
	Console.print("[boomcha] OK index=" + o.index + " dist=" + o.distance + " bpm=" + o.meta_bpm);
	local m = o.matches;
	local i = 0;
	while (i < m.length && i < 3)
	{
		local x = m[i];
		if (x.midi_id != undefined && x.bar_start != undefined && x.source_path != undefined)
			Console.print("  match " + i + " midi_id=" + x.midi_id + " bar_start=" + x.bar_start + " source=" + x.source_path + " out=" + x.mid_path + " bank=" + x.bank);
		else
			Console.print("  match " + i + " mid_path=" + x.mid_path + " bank=" + x.bank);
		i = i + 1;
	}
}

inline function onWriteRequestControl(component, value)
{
	if (value < 0.5)
		return;
	// useHh false / hhMin bajo: si useHh true con hhMin alto, el C++ puede devolver "No matches after filtering".
	if (!buildTestRequest(1.0, 3, 4, false, 0, false))
		return;
	if (responseFile.isFile())
		responseFile.deleteFileOrDirectory();
}

inline function onReadResponseControl(component, value)
{
	if (value < 0.5)
		return;
	printResponse();
}

// Registro global (no en onInit): así los clics llegan aunque onInit no se ejecute en el diseñador.
btnWriteRequest.set("text", "Write request JSON");
btnWriteRequest.set("width", 180);
btnWriteRequest.set("height", 32);
btnWriteRequest.setControlCallback(onWriteRequestControl);

btnReadResponse.set("text", "Read response");
btnReadResponse.set("width", 180);
btnReadResponse.set("height", 32);
btnReadResponse.setControlCallback(onReadResponseControl);

Console.print("[boomcha] cpp-hello-world: botones registrados (callbacks globales).");

function onInit()
{
	Console.print("=== cpp-hello-world: Boomcha find_closest (C++ node) ===");
	Console.print("1) Export: python3 drum_classifier/export_bank_for_cpp.py pattern_bank.npz -o pattern_bank.bbank");
	Console.print("2) Compile DSP; Hardcoded FX -> boomcha_find_closest.");
	Console.print("3) Pulse Run on node after Write request; then Read response.");
	Console.print("4) Request/Response ahora se escriben en project root (no en FileSystem.Temp).");
	Console.print("Request: " + requestFile.toString(requestFile.FullPath));
	Console.print("Response: " + responseFile.toString(responseFile.FullPath));
}

function onNoteOn() {}
function onNoteOff() {}
function onController() {}
function onTimer() {}
function onControl(number, value) {}
