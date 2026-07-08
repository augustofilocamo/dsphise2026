#pragma once

#include "boomcha_find_closest.h"
// These will improve the readability of the connection definition

#define getT(Idx) template get<Idx>()
#define connectT(Idx, target) template connect<Idx>(target)
#define getParameterT(Idx) template getParameter<Idx>()
#define setParameterT(Idx, value) template setParameter<Idx>(value)
#define setParameterWT(Idx, value) template setWrapParameter<Idx>(value)
using namespace scriptnode;
using namespace snex;
using namespace snex::Types;

namespace cpp_hello_DspNetwork_impl
{
// ==============================| Node & Parameter type declarations |==============================

namespace cpp_hello_DspNetwork_t_parameters
{
}

template <int NV>
using cpp_hello_DspNetwork_t_ = container::chain<parameter::plain<project::boomcha_find_closest<NV>, 0>, 
                                                 wrap::fix<2, project::boomcha_find_closest<NV>>>;

// =================================| Root node initialiser class |=================================

template <int NV> struct instance: public cpp_hello_DspNetwork_impl::cpp_hello_DspNetwork_t_<NV>
{
	
	struct metadata
	{
		static const int NumTables = 0;
		static const int NumSliderPacks = 0;
		static const int NumAudioFiles = 0;
		static const int NumFilters = 0;
		static const int NumDisplayBuffers = 0;
		
		SNEX_METADATA_ID(cpp_hello_DspNetwork);
		SNEX_METADATA_NUM_CHANNELS(2);
		SNEX_METADATA_ENCODED_PARAMETERS(16)
		{
			0x005B, 0x0000, 0x5200, 0x6E75, 0x0000, 0x0000, 0x0000, 0x8000, 
            0x003F, 0x8000, 0x003F, 0x8000, 0x003F, 0x0000, 0x0000, 0x0000
		};
	};
	
	instance()
	{
		// Node References -------------------------------------------------------------------------
		
		auto& boomcha_find_closest = this->getT(0); // project::boomcha_find_closest<NV>
		
		// Parameter Connections -------------------------------------------------------------------
		
		this->getParameterT(0).connectT(0, boomcha_find_closest); // Run -> boomcha_find_closest::Run
		
		// Default Values --------------------------------------------------------------------------
		
		; // boomcha_find_closest::Run is automated
		
		this->setParameterT(0, 1.);
	}
	
	static constexpr bool isPolyphonic() { return NV > 1; };
	
	static constexpr bool hasTail() { return true; };
	
	static constexpr bool isSuspendedOnSilence() { return false; };
};
}

#undef getT
#undef connectT
#undef setParameterT
#undef setParameterWT
#undef getParameterT
// ======================================| Public Definition |======================================

namespace project
{
// polyphonic template declaration

template <int NV>
using cpp_hello_DspNetwork = wrap::node<cpp_hello_DspNetwork_impl::instance<NV>>;
}


