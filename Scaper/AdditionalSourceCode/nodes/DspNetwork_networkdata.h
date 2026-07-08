namespace project
{

struct DspNetwork_networkdata: public scriptnode::dll::InterpretedNetworkData
{
	String getId() const override
	{
		return "DspNetwork";
	}
	bool isModNode() const override
	{
		return false;
	}
	String getNetworkData() const override
	{
		return "112.nT6K8Chh8L..hbvEY.WZa3YJmNJrRfr7cn8dJSfCgpptBPBZa52+4M6DAtHx+4booh6Hiw8UxLprL3MFlnNa1XX2TkQv8jFQVVsUHAi64RS2czAcPF.2aJi2zPRgOLAteTn39gUSzYp..jMgIj4NYB";
	}
};
}

