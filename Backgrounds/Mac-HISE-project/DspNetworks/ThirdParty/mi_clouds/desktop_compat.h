// Desktop / HISE shims for Clouds + stmlib (no STM32 toolchain).
#pragma once

#ifndef TEST
#define TEST 1
#endif

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// Some stmlib headers expect these on embedded; provide no-ops on desktop.
#ifndef __attribute__
#if defined(_MSC_VER)
#define __attribute__(x)
#endif
#endif
