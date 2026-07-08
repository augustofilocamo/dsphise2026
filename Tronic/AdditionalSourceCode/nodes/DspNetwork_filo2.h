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

namespace DspNetwork_filo2_impl
{
// ==============================| Node & Parameter type declarations |==============================

template <int NV>
using chain_t = container::chain<parameter::empty, 
                                 wrap::fix<2, project::VCO1_V4<NV>>, 
                                 core::gain<NV>>;

template <int NV>
using chain1_t = container::chain<parameter::empty, 
                                  wrap::fix<2, project::VCO2_V4<NV>>, 
                                  core::gain<NV>>;

template <int NV>
using chain2_t = container::chain<parameter::empty, 
                                  wrap::fix<2, project::noise_V2<NV>>, 
                                  core::gain<NV>>;

template <int NV>
using split_t = container::split<parameter::empty, 
                                 wrap::fix<2, chain_t<NV>>, 
                                 chain1_t<NV>, 
                                 chain2_t<NV>>;

template <int NV>
using midichain_t_ = container::chain<parameter::empty, 
                                      wrap::fix<2, split_t<NV>>>;

template <int NV>
using midichain_t = wrap::event<midichain_t_<NV>>;

namespace DspNetwork_filo2_t_parameters
{
// Parameter list for DspNetwork_filo2_impl::DspNetwork_filo2_t ------------------------------------

template <int NV>
using vco_decay = parameter::chain<ranges::Identity, 
                                   parameter::plain<project::VCO1_V4<NV>, 0>, 
                                   parameter::plain<project::VCO2_V4<NV>, 2>, 
                                   parameter::plain<project::VCO2_V4<NV>, 6>>;

template <int NV>
using vco1_eg_amount = parameter::chain<ranges::Identity, 
                                        parameter::plain<project::VCO1_V4<NV>, 1>, 
                                        parameter::plain<project::VCO2_V4<NV>, 7>>;

template <int NV>
using vco1_freq = parameter::chain<ranges::Identity, 
                                   parameter::plain<project::VCO1_V4<NV>, 5>, 
                                   parameter::plain<project::VCO2_V4<NV>, 8>>;

template <int NV>
using vca_decay = parameter::chain<ranges::Identity, 
                                   parameter::plain<project::VCO1_V4<NV>, 3>, 
                                   parameter::plain<project::VCO2_V4<NV>, 0>>;

template <int NV>
using vco1_waveform = parameter::plain<project::VCO1_V4<NV>, 2>;
template <int NV>
using vco1_level = parameter::plain<core::gain<NV>, 0>;
template <int NV>
using fm_amount = parameter::plain<project::VCO2_V4<NV>, 3>;
template <int NV>
using vco2_eg_amount = parameter::plain<project::VCO2_V4<NV>, 1>;
template <int NV>
using vco2_freq = parameter::plain<project::VCO2_V4<NV>, 10>;
template <int NV>
using vco2_waveform = parameter::plain<project::VCO2_V4<NV>, 5>;
template <int NV> using vco2_level = vco1_level<NV>;
template <int NV>
using hard_sync = parameter::plain<project::VCO2_V4<NV>, 4>;
template <int NV>
using noise_decay = parameter::plain<project::noise_V2<NV>, 0>;
template <int NV> using noise_level = vco1_level<NV>;
template <int NV>
using DspNetwork_filo2_t_plist = parameter::list<vco_decay<NV>, 
                                                 vco1_eg_amount<NV>, 
                                                 vco1_freq<NV>, 
                                                 vco1_waveform<NV>, 
                                                 vco1_level<NV>, 
                                                 fm_amount<NV>, 
                                                 vco2_eg_amount<NV>, 
                                                 vco2_freq<NV>, 
                                                 vco2_waveform<NV>, 
                                                 vco2_level<NV>, 
                                                 hard_sync<NV>, 
                                                 noise_decay<NV>, 
                                                 noise_level<NV>, 
                                                 vca_decay<NV>>;
}

template <int NV>
using DspNetwork_filo2_t_ = container::chain<DspNetwork_filo2_t_parameters::DspNetwork_filo2_t_plist<NV>, 
                                             wrap::fix<2, midichain_t<NV>>, 
                                             core::gain<NV>>;

// =================================| Root node initialiser class |=================================

template <int NV> struct instance: public DspNetwork_filo2_impl::DspNetwork_filo2_t_<NV>
{
	
	struct metadata
	{
		static const int NumTables = 0;
		static const int NumSliderPacks = 0;
		static const int NumAudioFiles = 0;
		static const int NumFilters = 0;
		static const int NumDisplayBuffers = 0;
		
		SNEX_METADATA_ID(DspNetwork_filo2);
		SNEX_METADATA_NUM_CHANNELS(2);
		SNEX_METADATA_ENCODED_PARAMETERS(258)
		{
			0x005B, 0x0000, 0x7600, 0x6F63, 0x645F, 0x6365, 0x7961, 0x0A00, 
            0xA3D7, 0x003B, 0x8000, 0x003F, 0x8000, 0x003F, 0x8000, 0x6F3F, 
            0x8312, 0x5B3A, 0x0001, 0x0000, 0x6376, 0x316F, 0x655F, 0x5F67, 
            0x6D61, 0x756F, 0x746E, 0x0000, 0x0000, 0x0000, 0xC800, 0x0043, 
            0xC100, 0x0043, 0x8000, 0x003F, 0x8000, 0x5B3F, 0x0002, 0x0000, 
            0x6376, 0x316F, 0x665F, 0x6572, 0x0071, 0x0000, 0x0000, 0x4000, 
            0x459C, 0x0000, 0x43C8, 0x0000, 0x3F80, 0xCCCD, 0x3DCC, 0x035B, 
            0x0000, 0x7600, 0x6F63, 0x5F31, 0x6177, 0x6576, 0x6F66, 0x6D72, 
            0x0000, 0x0000, 0x0000, 0x8000, 0x003F, 0x0000, 0x0000, 0x8000, 
            0x003F, 0x8000, 0x5B3F, 0x0004, 0x0000, 0x6376, 0x316F, 0x6C5F, 
            0x7665, 0x6C65, 0x0000, 0xC800, 0x00C2, 0x0000, 0x0000, 0x0000, 
            0x3E00, 0xAD83, 0xCD40, 0xCCCC, 0x5B3D, 0x0005, 0x0000, 0x6D66, 
            0x615F, 0x6F6D, 0x6E75, 0x0074, 0x0000, 0x0000, 0x0000, 0x447A, 
            0xC852, 0x4438, 0x0000, 0x3F80, 0xD70A, 0x3C23, 0x065B, 0x0000, 
            0x7600, 0x6F63, 0x5F32, 0x6765, 0x615F, 0x6F6D, 0x6E75, 0x0074, 
            0x0000, 0x0000, 0x0000, 0x43C8, 0x0000, 0x433F, 0x0000, 0x3F80, 
            0x0000, 0x3F80, 0x075B, 0x0000, 0x7600, 0x6F63, 0x5F32, 0x7266, 
            0x7165, 0x0000, 0x0000, 0x0000, 0x9C40, 0x6745, 0x0966, 0x0044, 
            0x8000, 0xCD3F, 0xCCCC, 0x5B3D, 0x0008, 0x0000, 0x6376, 0x326F, 
            0x775F, 0x7661, 0x6665, 0x726F, 0x006D, 0x0000, 0x0000, 0x0000, 
            0x3F80, 0x0000, 0x0000, 0x0000, 0x3F80, 0x0000, 0x3F80, 0x095B, 
            0x0000, 0x7600, 0x6F63, 0x5F32, 0x656C, 0x6576, 0x006C, 0x0000, 
            0xC2C8, 0x0000, 0x0000, 0x0000, 0x0000, 0x833E, 0x40AD, 0xCCCD, 
            0x3DCC, 0x0A5B, 0x0000, 0x6800, 0x7261, 0x5F64, 0x7973, 0x636E, 
            0x0000, 0x0000, 0x0000, 0x8000, 0x003F, 0x8000, 0x003F, 0x8000, 
            0x003F, 0x8000, 0x5B3F, 0x000B, 0x0000, 0x6F6E, 0x7369, 0x5F65, 
            0x6564, 0x6163, 0x0079, 0x126F, 0x3A83, 0x3333, 0x3F33, 0x6594, 
            0x3F08, 0x0000, 0x3F80, 0xB717, 0x38D1, 0x0C5B, 0x0000, 0x6E00, 
            0x696F, 0x6573, 0x6C5F, 0x7665, 0x6C65, 0x0000, 0xC800, 0x00C2, 
            0x0000, 0x0000, 0x0000, 0x3E00, 0xAD83, 0xCD40, 0xCCCC, 0x5B3D, 
            0x000D, 0x0000, 0x6376, 0x5F61, 0x6564, 0x6163, 0x0079, 0xD70A, 
            0x3BA3, 0x0000, 0x4120, 0x0000, 0x4120, 0x0000, 0x3F80, 0x126F, 
            0x3A83, 0x0000
		};
	};
	
	instance()
	{
		// Node References -------------------------------------------------------------------------
		
		auto& midichain = this->getT(0);                      // DspNetwork_filo2_impl::midichain_t<NV>
		auto& split = this->getT(0).getT(0);                  // DspNetwork_filo2_impl::split_t<NV>
		auto& chain = this->getT(0).getT(0).getT(0);          // DspNetwork_filo2_impl::chain_t<NV>
		auto& faust1 = this->getT(0).getT(0).getT(0).getT(0); // project::VCO1_V4<NV>
		auto& gain = this->getT(0).getT(0).getT(0).getT(1);   // core::gain<NV>
		auto& chain1 = this->getT(0).getT(0).getT(1);         // DspNetwork_filo2_impl::chain1_t<NV>
		auto& faust2 = this->getT(0).getT(0).getT(1).getT(0); // project::VCO2_V4<NV>
		auto& gain1 = this->getT(0).getT(0).getT(1).getT(1);  // core::gain<NV>
		auto& chain2 = this->getT(0).getT(0).getT(2);         // DspNetwork_filo2_impl::chain2_t<NV>
		auto& faust3 = this->getT(0).getT(0).getT(2).getT(0); // project::noise_V2<NV>
		auto& gain2 = this->getT(0).getT(0).getT(2).getT(1);  // core::gain<NV>
		auto& gain3 = this->getT(1);                          // core::gain<NV>
		
		// Parameter Connections -------------------------------------------------------------------
		
		auto& vco_decay_p = this->getParameterT(0);
		vco_decay_p.connectT(0, faust1); // vco_decay -> faust1::EGDecay
		vco_decay_p.connectT(1, faust2); // vco_decay -> faust2::EGDecay
		vco_decay_p.connectT(2, faust2); // vco_decay -> faust2::VCO1_Decay
		
		auto& vco1_eg_amount_p = this->getParameterT(1);
		vco1_eg_amount_p.connectT(0, faust1); // vco1_eg_amount -> faust1::EGamount
		vco1_eg_amount_p.connectT(1, faust2); // vco1_eg_amount -> faust2::VCO1_EGamount
		
		auto& vco1_freq_p = this->getParameterT(2);
		vco1_freq_p.connectT(0, faust1); // vco1_freq -> faust1::freqKnob
		vco1_freq_p.connectT(1, faust2); // vco1_freq -> faust2::VCO1_Freq
		
		this->getParameterT(3).connectT(0, faust1); // vco1_waveform -> faust1::Tri_SqrWave
		
		this->getParameterT(4).connectT(0, gain); // vco1_level -> gain::Gain
		
		this->getParameterT(5).connectT(0, faust2); // fm_amount -> faust2::FMamount
		
		this->getParameterT(6).connectT(0, faust2); // vco2_eg_amount -> faust2::EGAmount
		
		this->getParameterT(7).connectT(0, faust2); // vco2_freq -> faust2::freqKnob
		
		this->getParameterT(8).connectT(0, faust2); // vco2_waveform -> faust2::Tri_SqrWave
		
		this->getParameterT(9).connectT(0, gain1); // vco2_level -> gain1::Gain
		
		this->getParameterT(10).connectT(0, faust2); // hard_sync -> faust2::HsOn_Off
		
		this->getParameterT(11).connectT(0, faust3); // noise_decay -> faust3::Decay
		
		this->getParameterT(12).connectT(0, gain2); // noise_level -> gain2::Gain
		
		auto& vca_decay_p = this->getParameterT(13);
		vca_decay_p.connectT(0, faust1); // vca_decay -> faust1::decay
		vca_decay_p.connectT(1, faust2); // vca_decay -> faust2::Decay
		
		// Default Values --------------------------------------------------------------------------
		
		;                             // faust1::EGDecay is automated
		;                             // faust1::EGamount is automated
		;                             // faust1::Tri_SqrWave is automated
		;                             // faust1::decay is automated
		faust1.setParameterT(4, 20.); // core::faust::freq
		;                             // faust1::freqKnob is automated
		faust1.setParameterT(6, 1.);  // core::faust::gain
		faust1.setParameterT(7, 0.);  // core::faust::gate
		
		;                          // gain::Gain is automated
		gain.setParameterT(1, 0.); // core::gain::Smoothing
		gain.setParameterT(2, 0.); // core::gain::ResetValue
		
		;                             // faust2::Decay is automated
		;                             // faust2::EGAmount is automated
		;                             // faust2::EGDecay is automated
		;                             // faust2::FMamount is automated
		;                             // faust2::HsOn_Off is automated
		;                             // faust2::Tri_SqrWave is automated
		;                             // faust2::VCO1_Decay is automated
		;                             // faust2::VCO1_EGamount is automated
		;                             // faust2::VCO1_Freq is automated
		faust2.setParameterT(9, 20.); // core::faust::freq
		;                             // faust2::freqKnob is automated
		faust2.setParameterT(11, 1.); // core::faust::gain
		faust2.setParameterT(12, 0.); // core::faust::gate
		
		;                           // gain1::Gain is automated
		gain1.setParameterT(1, 0.); // core::gain::Smoothing
		gain1.setParameterT(2, 0.); // core::gain::ResetValue
		
		;                            // faust3::Decay is automated
		faust3.setParameterT(1, 0.); // core::faust::gate
		
		;                           // gain2::Gain is automated
		gain2.setParameterT(1, 0.); // core::gain::Smoothing
		gain2.setParameterT(2, 0.); // core::gain::ResetValue
		
		gain3.setParameterT(0, -1.5); // core::gain::Gain
		gain3.setParameterT(1, 0.);   // core::gain::Smoothing
		gain3.setParameterT(2, 0.);   // core::gain::ResetValue
		
		this->setParameterT(0, 1.);
		this->setParameterT(1, 386.);
		this->setParameterT(2, 400.);
		this->setParameterT(3, 0.);
		this->setParameterT(4, 0.);
		this->setParameterT(5, 739.13);
		this->setParameterT(6, 191.);
		this->setParameterT(7, 549.6);
		this->setParameterT(8, 0.);
		this->setParameterT(9, 0.);
		this->setParameterT(10, 1.);
		this->setParameterT(11, 0.5328);
		this->setParameterT(12, 0.);
		this->setParameterT(13, 10.);
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
using DspNetwork_filo2 = wrap::node<DspNetwork_filo2_impl::instance<NV>>;
}


