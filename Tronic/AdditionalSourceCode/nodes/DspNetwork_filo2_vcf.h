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

namespace DspNetwork_filo2_vcf_impl
{
// ==============================| Node & Parameter type declarations |==============================

template <int NV>
using midichain_t_ = container::chain<parameter::empty, 
                                      wrap::fix<2, project::VCF_V2<NV>>>;

template <int NV>
using midichain_t = wrap::event<midichain_t_<NV>>;

namespace DspNetwork_filo2_vcf_t_parameters
{
// Parameter list for DspNetwork_filo2_vcf_impl::DspNetwork_filo2_vcf_t ----------------------------

template <int NV>
using vcf_decay = parameter::plain<project::VCF_V2<NV>, 0>;
template <int NV>
using vcf_eg_amount = parameter::plain<project::VCF_V2<NV>, 2>;
template <int NV>
using cutoff = parameter::plain<project::VCF_V2<NV>, 4>;
template <int NV>
using LP_HP = parameter::plain<project::VCF_V2<NV>, 1>;
template <int NV>
using q = parameter::plain<project::VCF_V2<NV>, 5>;
template <int NV>
using DspNetwork_filo2_vcf_t_plist = parameter::list<vcf_decay<NV>, 
                                                     vcf_eg_amount<NV>, 
                                                     cutoff<NV>, 
                                                     LP_HP<NV>, 
                                                     q<NV>>;
}

template <int NV>
using DspNetwork_filo2_vcf_t_ = container::chain<DspNetwork_filo2_vcf_t_parameters::DspNetwork_filo2_vcf_t_plist<NV>, 
                                                 wrap::fix<2, midichain_t<NV>>>;

// =================================| Root node initialiser class |=================================

template <int NV> struct instance: public DspNetwork_filo2_vcf_impl::DspNetwork_filo2_vcf_t_<NV>
{
	
	struct metadata
	{
		static const int NumTables = 0;
		static const int NumSliderPacks = 0;
		static const int NumAudioFiles = 0;
		static const int NumFilters = 0;
		static const int NumDisplayBuffers = 0;
		
		SNEX_METADATA_ID(DspNetwork_filo2_vcf);
		SNEX_METADATA_NUM_CHANNELS(2);
		SNEX_METADATA_ENCODED_PARAMETERS(84)
		{
			0x005B, 0x0000, 0x7600, 0x6663, 0x645F, 0x6365, 0x7961, 0x0000, 
            0x0000, 0x0000, 0xA000, 0x0041, 0xA000, 0x0041, 0x8000, 0x0A3F, 
            0x23D7, 0x5B3C, 0x0001, 0x0000, 0x6376, 0x5F66, 0x6765, 0x615F, 
            0x6F6D, 0x6E75, 0x0074, 0x0000, 0x0000, 0x0000, 0x3F80, 0x5C29, 
            0x3F4F, 0x0000, 0x3F80, 0xD70A, 0x3C23, 0x025B, 0x0000, 0x6300, 
            0x7475, 0x666F, 0x0066, 0x0000, 0x0000, 0x0000, 0x3F80, 0x0000, 
            0x3F80, 0x0000, 0x3F80, 0x126F, 0x3A83, 0x035B, 0x0000, 0x4C00, 
            0x5F50, 0x5048, 0x0000, 0x0000, 0x0000, 0x8000, 0x003F, 0x0000, 
            0x0000, 0x8000, 0x003F, 0x8000, 0x5B3F, 0x0004, 0x0000, 0x0071, 
            0xCCCD, 0x3ECC, 0x0000, 0x41C8, 0xCCCD, 0x3ECC, 0x0000, 0x3F80, 
            0xD70A, 0x3C23, 0x0000, 0x0000
		};
	};
	
	instance()
	{
		// Node References -------------------------------------------------------------------------
		
		auto& midichain = this->getT(0);     // DspNetwork_filo2_vcf_impl::midichain_t<NV>
		auto& faust = this->getT(0).getT(0); // project::VCF_V2<NV>
		
		// Parameter Connections -------------------------------------------------------------------
		
		this->getParameterT(0).connectT(0, faust); // vcf_decay -> faust::Decay
		
		this->getParameterT(1).connectT(0, faust); // vcf_eg_amount -> faust::egAmount
		
		this->getParameterT(2).connectT(0, faust); // cutoff -> faust::normFreq
		
		this->getParameterT(3).connectT(0, faust); // LP_HP -> faust::Lp_Hp
		
		this->getParameterT(4).connectT(0, faust); // q -> faust::q
		
		// Default Values --------------------------------------------------------------------------
		
		;                           // faust::Decay is automated
		;                           // faust::Lp_Hp is automated
		;                           // faust::egAmount is automated
		faust.setParameterT(3, 0.); // core::faust::gate
		;                           // faust::normFreq is automated
		;                           // faust::q is automated
		
		this->setParameterT(0, 2);
		this->setParameterT(1, 0.81);
		this->setParameterT(2, 1.);
		this->setParameterT(3, 0.);
		this->setParameterT(4, 0.4);
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
using DspNetwork_filo2_vcf = wrap::node<DspNetwork_filo2_vcf_impl::instance<NV>>;
}


