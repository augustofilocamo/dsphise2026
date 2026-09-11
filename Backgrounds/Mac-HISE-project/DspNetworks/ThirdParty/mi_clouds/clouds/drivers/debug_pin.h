// Stub — original Clouds debug GPIO driver (not used on desktop).
#ifndef CLOUDS_DRIVERS_DEBUG_PIN_H_
#define CLOUDS_DRIVERS_DEBUG_PIN_H_

#include "stmlib/stmlib.h"

namespace clouds {

class DebugPin {
 public:
  static void Init() {}
  static void High() {}
  static void Low() {}
  static void Toggle() {}
};

}  // namespace clouds

#endif
