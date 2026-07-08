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

namespace DspNetwork_grayhole_impl
{
// ==============================| Node & Parameter type declarations |==============================

DECLARE_PARAMETER_RANGE_SKEW(dry_wet_mixer_c0Range, 
                             -100., 
                             0., 
                             5.42227);

using dry_wet_mixer_c0 = parameter::from0To1<core::gain, 
                                             0, 
                                             dry_wet_mixer_c0Range>;

using dry_wet_mixer_c1 = dry_wet_mixer_c0;

using dry_wet_mixer_multimod = parameter::list<dry_wet_mixer_c0, dry_wet_mixer_c1>;

using dry_wet_mixer_t = control::xfader<dry_wet_mixer_multimod, faders::rms>;

using dry_path_t = container::chain<parameter::empty, 
                                    wrap::fix<2, dry_wet_mixer_t>, 
                                    core::gain>;

template <int NV>
using wet_path_t = container::chain<parameter::empty, 
                                    wrap::fix<2, project::greyhole_reverb<NV>>, 
                                    core::gain>;

namespace dry_wet1_t_parameters
{
}

template <int NV>
using dry_wet1_t = container::split<parameter::plain<DspNetwork_grayhole_impl::dry_wet_mixer_t, 0>, 
                                    wrap::fix<2, dry_path_t>, 
                                    wet_path_t<NV>>;

namespace DspNetwork_grayhole_t_parameters
{
// Parameter list for DspNetwork_grayhole_impl::DspNetwork_grayhole_t ------------------------------

template <int NV>
using dryWet = parameter::plain<DspNetwork_grayhole_impl::dry_wet1_t<NV>, 
                                0>;
template <int NV>
using delayTime = parameter::plain<project::greyhole_reverb<NV>, 
                                   0>;
template <int NV>
using damping = parameter::plain<project::greyhole_reverb<NV>, 
                                 1>;
template <int NV>
using size = parameter::plain<project::greyhole_reverb<NV>, 
                              2>;
template <int NV>
using diffusion = parameter::plain<project::greyhole_reverb<NV>, 
                                   3>;
template <int NV>
using feedback = parameter::plain<project::greyhole_reverb<NV>, 
                                  4>;
template <int NV>
using modDepth = parameter::plain<project::greyhole_reverb<NV>, 
                                  5>;
template <int NV>
using modFreq = parameter::plain<project::greyhole_reverb<NV>, 
                                 6>;
template <int NV>
using DspNetwork_grayhole_t_plist = parameter::list<dryWet<NV>, 
                                                    delayTime<NV>, 
                                                    damping<NV>, 
                                                    size<NV>, 
                                                    diffusion<NV>, 
                                                    feedback<NV>, 
                                                    modDepth<NV>, 
                                                    modFreq<NV>>;
}

template <int NV>
using DspNetwork_grayhole_t_ = container::chain<DspNetwork_grayhole_t_parameters::DspNetwork_grayhole_t_plist<NV>, 
                                                wrap::fix<2, dry_wet1_t<NV>>>;

// =================================| Root node initialiser class |=================================

template <int NV> struct instance: public DspNetwork_grayhole_impl::DspNetwork_grayhole_t_<NV>
{
	
	struct metadata
	{
		static const int NumTables = 0;
		static const int NumSliderPacks = 0;
		static const int NumAudioFiles = 0;
		static const int NumFilters = 0;
		static const int NumDisplayBuffers = 0;
		
		SNEX_METADATA_ID(DspNetwork_grayhole);
		SNEX_METADATA_NUM_CHANNELS(2);
		SNEX_METADATA_ENCODED_PARAMETERS(134)
		{
			0x005B, 0x0000, 0x6400, 0x7972, 0x6557, 0x0074, 0x0000, 0x0000, 
            0x0000, 0x3F80, 0x0000, 0x3F80, 0x0000, 0x3F80, 0x0000, 0x0000, 
            0x015B, 0x0000, 0x6400, 0x6C65, 0x7961, 0x6954, 0x656D, 0x6F00, 
            0x8312, 0x9A3A, 0xB999, 0x003F, 0x8000, 0x003F, 0x8000, 0x173F, 
            0xD1B7, 0x5B38, 0x0002, 0x0000, 0x6164, 0x706D, 0x6E69, 0x0067, 
            0x0000, 0x0000, 0x70A4, 0x3F7D, 0x0000, 0x3F80, 0x0000, 0x3F80, 
            0x126F, 0x3A83, 0x035B, 0x0000, 0x7300, 0x7A69, 0x0065, 0x0000, 
            0x3F00, 0x0000, 0x4040, 0x0000, 0x3F80, 0x0000, 0x3F80, 0xB717, 
            0x38D1, 0x045B, 0x0000, 0x6400, 0x6669, 0x7566, 0x6973, 0x6E6F, 
            0x0000, 0x0000, 0xA400, 0x7D70, 0x003F, 0x8000, 0x003F, 0x8000, 
            0x173F, 0xD1B7, 0x5B38, 0x0005, 0x0000, 0x6566, 0x6465, 0x6162, 
            0x6B63, 0x0000, 0x0000, 0x0000, 0x8000, 0x003F, 0x8000, 0x003F, 
            0x8000, 0x0A3F, 0x23D7, 0x5B3C, 0x0006, 0x0000, 0x6F6D, 0x4464, 
            0x7065, 0x6874, 0x0000, 0x0000, 0x0000, 0x8000, 0x003F, 0x8000, 
            0x003F, 0x8000, 0x6F3F, 0x8312, 0x5B3A, 0x0007, 0x0000, 0x6F6D, 
            0x4664, 0x6572, 0x0071, 0x0000, 0x0000, 0x0000, 0x4120, 0x0000, 
            0x3F80, 0x0000, 0x3F80, 0xD70A, 0x3C23, 0x0000
		};
	};
	
	instance()
	{
		// Node References -------------------------------------------------------------------------
		
		auto& dry_wet1 = this->getT(0);                      // DspNetwork_grayhole_impl::dry_wet1_t<NV>
		auto& dry_path = this->getT(0).getT(0);              // DspNetwork_grayhole_impl::dry_path_t
		auto& dry_wet_mixer = this->getT(0).getT(0).getT(0); // DspNetwork_grayhole_impl::dry_wet_mixer_t
		auto& dry_gain = this->getT(0).getT(0).getT(1);      // core::gain
		auto& wet_path = this->getT(0).getT(1);              // DspNetwork_grayhole_impl::wet_path_t<NV>
		auto& faust = this->getT(0).getT(1).getT(0);         // project::greyhole_reverb<NV>
		auto& wet_gain = this->getT(0).getT(1).getT(1);      // core::gain
		
		// Parameter Connections -------------------------------------------------------------------
		
		dry_wet1.getParameterT(0).connectT(0, dry_wet_mixer); // DryWet -> dry_wet_mixer::Value
		this->getParameterT(0).connectT(0, dry_wet1);         // dryWet -> dry_wet1::DryWet
		
		this->getParameterT(1).connectT(0, faust); // delayTime -> faust::delayTime
		
		this->getParameterT(2).connectT(0, faust); // damping -> faust::damping
		
		this->getParameterT(3).connectT(0, faust); // size -> faust::size
		
		this->getParameterT(4).connectT(0, faust); // diffusion -> faust::diffusion
		
		this->getParameterT(5).connectT(0, faust); // feedback -> faust::feedback
		
		this->getParameterT(6).connectT(0, faust); // modDepth -> faust::modDepth
		
		this->getParameterT(7).connectT(0, faust); // modFreq -> faust::modFreq
		
		// Modulation Connections ------------------------------------------------------------------
		
		auto& dry_wet_mixer_p = dry_wet_mixer.getWrappedObject().getParameter();
		dry_wet_mixer_p.getParameterT(0).connectT(0, dry_gain); // dry_wet_mixer -> dry_gain::Gain
		dry_wet_mixer_p.getParameterT(1).connectT(0, wet_gain); // dry_wet_mixer -> wet_gain::Gain
		
		// Default Values --------------------------------------------------------------------------
		
		; // dry_wet1::DryWet is automated
		
		; // dry_wet_mixer::Value is automated
		
		;                               // dry_gain::Gain is automated
		dry_gain.setParameterT(1, 20.); // core::gain::Smoothing
		dry_gain.setParameterT(2, 0.);  // core::gain::ResetValue
		
		; // faust::delayTime is automated
		; // faust::damping is automated
		; // faust::size is automated
		; // faust::diffusion is automated
		; // faust::feedback is automated
		; // faust::modDepth is automated
		; // faust::modFreq is automated
		
		;                               // wet_gain::Gain is automated
		wet_gain.setParameterT(1, 20.); // core::gain::Smoothing
		wet_gain.setParameterT(2, 0.);  // core::gain::ResetValue
		
		this->setParameterT(0, 1.);
		this->setParameterT(1, 1.);
		this->setParameterT(2, 1.);
		this->setParameterT(3, 1.);
		this->setParameterT(4, 1.);
		this->setParameterT(5, 1.);
		this->setParameterT(6, 1.);
		this->setParameterT(7, 1.);
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
using DspNetwork_grayhole = wrap::node<DspNetwork_grayhole_impl::instance<NV>>;
}


