#pragma once

// Embedded zstd decoder for DSP DLL builds.
// This avoids runtime libzstd/dlopen dependencies and survives HISE project regeneration.
//
// Fuentes: copiar el árbol hi_zstd/zstd a DspNetworks/ThirdParty/zstd_vendor/zstd/
// (ver ThirdParty/zstd_vendor/README.md o scripts/vendor_zstd.sh). Sin esto, el
// include falla a propósito — no dependemos de <hi_zstd/...> ni del include path de Binaries.

#ifndef ZSTD_DISABLE_ASM
#define ZSTD_DISABLE_ASM 1
#endif

// Make all exported zstd symbols TU-local to avoid linker conflicts even if this header
// is included from more than one translation unit.
#ifndef ZSTDLIB_API
#define ZSTDLIB_API static
#endif
#ifndef ZDICTLIB_API
#define ZDICTLIB_API static
#endif
#ifndef ZSTDERRORLIB_API
#define ZSTDERRORLIB_API static
#endif

#if defined(__has_include)
#if !__has_include("../zstd_vendor/zstd/zstd.h")
#error "Boomcha: falta el árbol zstd en ThirdParty/zstd_vendor — lee ThirdParty/zstd_vendor/README.md o ejecuta Scripts/vendor_zstd.sh"
#endif
#endif

#if defined(_MSC_VER)
#pragma warning(push, 0)
#endif
#if !defined(_WIN32) && !defined(_WIN64)
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Weverything"
#endif

// Decoder-only (misma selección que hi_zstd_1 + parte de hi_zstd_2 en HISE, sin compresión).
#include "../zstd_vendor/zstd/zstd.h"
#include "../zstd_vendor/zstd/common/debug.c"
#include "../zstd_vendor/zstd/common/entropy_common.c"
#include "../zstd_vendor/zstd/common/error_private.c"
#include "../zstd_vendor/zstd/common/fse_decompress.c"
#include "../zstd_vendor/zstd/common/pool.c"
#include "../zstd_vendor/zstd/common/threading.c"
#include "../zstd_vendor/zstd/common/xxhash.c"
#include "../zstd_vendor/zstd/common/zstd_common.c"
#include "../zstd_vendor/zstd/decompress/huf_decompress.c"
#include "../zstd_vendor/zstd/decompress/zstd_decompress.c"

#if !defined(_WIN32) && !defined(_WIN64)
#pragma clang diagnostic pop
#endif
#if defined(_MSC_VER)
#pragma warning(pop)
#endif

namespace boomcha
{
inline constexpr unsigned long long kZstdContentSizeUnknown = ZSTD_CONTENTSIZE_UNKNOWN;
inline constexpr unsigned long long kZstdContentSizeError = ZSTD_CONTENTSIZE_ERROR;

// Kept for compatibility with existing error handling paths.
inline bool zstdRuntimeAvailable() { return true; }
} // namespace boomcha
