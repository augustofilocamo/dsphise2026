// Unity build for Clouds DSP + required stmlib .cc files (MIT / Emilie Gillet).
#include "desktop_compat.h"

#include "stmlib/utils/random.cc"
#include "stmlib/dsp/atan.cc"
#include "stmlib/dsp/units.cc"

#include "clouds/resources.cc"
#include "clouds/dsp/mu_law.cc"
#include "clouds/dsp/correlator.cc"
#include "clouds/dsp/granular_processor.cc"
#include "clouds/dsp/pvoc/stft.cc"
#include "clouds/dsp/pvoc/frame_transformation.cc"
#include "clouds/dsp/pvoc/phase_vocoder.cc"
