#pragma once

// These will improve the readability of the connection definition

#define getT(Idx) template get<Idx>()
#define connectT(Idx, target) template connect<Idx>(target)
#define getParameterT(Idx) template getParameter<Idx>()
#define setParameterT(Idx, value) template setParameter<Idx>(value)
#define setParameterWT(Idx, value) template setWrapParameter<Idx>(value)
using namespace scriptnode;
using namespace snex;
using namespace snex::Types;

namespace Clavi_faust_impl
{
// =========================| Node & Parameter type declarations |=========================

namespace Clavi_faust_t_parameters
{
// Parameter list for Clavi_faust_impl::Clavi_faust_t -------------------------------------

template <int NV>
using bright = parameter::plain<project::clavi<NV>, 0>;
template <int NV>
using decay = parameter::plain<project::clavi<NV>, 1>;
template <int NV>
using Clavi_faust_t_plist = parameter::list<bright<NV>, decay<NV>>;
}

template <int NV>
using Clavi_faust_t_ = container::chain<Clavi_faust_t_parameters::Clavi_faust_t_plist<NV>, 
                                        wrap::fix<2, project::clavi<NV>>, 
                                        envelope::silent_killer<NV>>;

// =============================| Root node initialiser class |=============================

template <int NV> struct instance: public Clavi_faust_impl::Clavi_faust_t_<NV>
{
	
	struct metadata
	{
		static const int NumTables = 0;
		static const int NumSliderPacks = 0;
		static const int NumAudioFiles = 0;
		static const int NumFilters = 0;
		static const int NumDisplayBuffers = 0;
		
		SNEX_METADATA_ID(Clavi_faust);
		SNEX_METADATA_NUM_CHANNELS(2);
		SNEX_METADATA_ENCODED_PARAMETERS(32)
		{
			0x005B, 0x0000, 0x6200, 0x6972, 0x6867, 0x0074, 0x0000, 0x4396, 
            0x4000, 0x469C, 0x4400, 0x461E, 0x0000, 0x3F80, 0x0000, 0x3F80, 
            0x015B, 0x0000, 0x6400, 0x6365, 0x7961, 0x6600, 0x6666, 0x723F, 
            0x7FF9, 0x953F, 0x7CB2, 0x003F, 0x8000, 0x173F, 0xD1B7, 0x0038
		};
	};
	
	instance()
	{
		// Node References ----------------------------------------------------------------
		
		auto& faust = this->getT(0);         // project::clavi<NV>
		auto& silent_killer = this->getT(1); // envelope::silent_killer<NV>
		
		// Parameter Connections ----------------------------------------------------------
		
		this->getParameterT(0).connectT(0, faust); // bright -> faust::brightness
		
		this->getParameterT(1).connectT(0, faust); // decay -> faust::decay
		
		// Default Values -----------------------------------------------------------------
		
		;                             // faust::brightness is automated
		;                             // faust::decay is automated
		faust.setParameterT(2, 110.); // core::faust::freq
		faust.setParameterT(3, 0.8);  // core::faust::gain
		faust.setParameterT(4, 0.);   // core::faust::gate
		
		silent_killer.setParameterT(0, -100.); // envelope::silent_killer::Threshold
		silent_killer.setParameterT(1, 1.);    // envelope::silent_killer::Active
		
		this->setParameterT(0, 10129.);
		this->setParameterT(1, 0.9871);
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
// ==================================| Public Definition |==================================

namespace project
{
// polyphonic template declaration

template <int NV>
using Clavi_faust = wrap::node<Clavi_faust_impl::instance<NV>>;
}


