#ifdef _WIN32

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <delayimp.h>
#include <shlwapi.h>

#include <cstring>

#pragma comment(lib, "Shlwapi.lib")
#pragma comment(lib, "Delayimp.lib")

namespace
{
HMODULE getSelfModule()
{
	HMODULE module = nullptr;
	GetModuleHandleExW(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS
	                       | GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT,
	                   reinterpret_cast<LPCWSTR>(&getSelfModule),
	                   &module);
	return module;
}

HMODULE loadOnnxRuntimeFromSibling()
{
	wchar_t path[MAX_PATH] = {};
	const HMODULE self = getSelfModule();
	if (self == nullptr || GetModuleFileNameW(self, path, MAX_PATH) == 0)
		return nullptr;

	PathRemoveFileSpecW(path);
	PathAppendW(path, L"onnxruntime.dll");
	return LoadLibraryW(path);
}
} // namespace

extern "C" FARPROC WINAPI clap_search_delay_load_hook(unsigned reason, DelayLoadInfo* info)
{
	if (reason != dliNotePreLoadLibrary || info == nullptr || info->szDll == nullptr)
		return nullptr;

	if (_stricmp(info->szDll, "onnxruntime.dll") != 0)
		return nullptr;

	return reinterpret_cast<FARPROC>(loadOnnxRuntimeFromSibling());
}

extern "C" decltype(__pfnDliNotifyHook2) __pfnDliNotifyHook2 = clap_search_delay_load_hook;

#endif
