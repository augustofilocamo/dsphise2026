#pragma once
#include "hi_faust/hi_faust.h"
using Meta = ::faust::Meta;
using UI = ::faust::UI;
#define FAUST_UIMACROS
 // define dummy macros
#define FAUST_ADDCHECKBOX(...)
#define FAUST_ADDNUMENTRY(...)
#define FAUST_ADDBUTTON(...)
#define FAUST_ADDHORIZONTALSLIDER(...)
#define FAUST_ADDVERTICALSLIDER(...)
#define FAUST_ADDVERTICALBARGRAPH(...)
#define FAUST_ADDHORIZONTALBARGRAPH(...)
#define FAUST_ADDSOUNDFILE(...)
#include "src/noise_V2.cpp"
#if (FAUST_INPUTS - FAUST_OUTPUTS) > 0
#error Number of inputs and outputs in faust code must match!
#endif
namespace project {
struct noise_V2MetaData {
		SN_NODE_ID("noise_V2");
};
template <int NV, class ModParameterClass=scriptnode::parameter::empty_list>
using noise_V2 = scriptnode::faust::faust_static_wrapper<NV, ModParameterClass, _noise_V2, noise_V2MetaData, FAUST_OUTPUTS>;
} // namespace project
 // undef dummy macros
#undef FAUST_UIMACROS
#undef FAUST_ADDCHECKBOX
#undef FAUST_ADDNUMENTRY
#undef FAUST_ADDBUTTON
#undef FAUST_ADDHORIZONTALSLIDER
#undef FAUST_ADDVERTICALSLIDER
#undef FAUST_ADDVERTICALBARGRAPH
#undef FAUST_ADDHORIZONTALBARGRAPH
#undef FAUST_ADDSOUNDFILE
 // undef faust ui macros
#undef FAUST_FILE_NAME
#undef FAUST_CLASS_NAME
#undef FAUST_COMPILATION_OPIONS
#undef FAUST_INPUTS
#undef FAUST_OUTPUTS
#undef FAUST_ACTIVES
#undef FAUST_PASSIVES
#undef FAUST_LIST_ACTIVES
#undef FAUST_LIST_PASSIVES
