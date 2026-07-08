namespace project
{

struct debug2_networkdata: public scriptnode::dll::InterpretedNetworkData
{
	String getId() const override
	{
		return "debug2";
	}
	bool isModNode() const override
	{
		return false;
	}
	String getNetworkData() const override
	{
		return "338.nT6K8CF7ATjB.XnD8TBDqaS.LwH1omPaGujPlDjzb.8++LFnKf.uKqA..XwOKFgPvNR+w.PL..C.Qw9434CRsBn2ZxYxhvIEaQg9tBhQ02hZQskg9GzIi8lOAwGNc01PeEFRnuSDBZ1XBH6KmEnq5CBp9yStRn9ByCjRTGI3wNiuvdvhZ1wobC3xtBhIg91pPeUKkLVVB+4XKp.ntyzi+dxKrKhvoAqmZdKRZ2n1tq9U+kwd1d3Hm4u8XpIIsMBwW5OW7lm6xkB0Uuv+kTuLMcnfWTVGWb3mBaieKpoKyxXRZWLIUvx..naxMzdbNrNhLIxAOjzj.IxjoIMCfD01AzGHf.lPho0Cz.5gFfFbHbVYXR22+vs8LRweTaLWsSoPH9XiyAhiCa1rkucMCAiheP3jO2CZYDxtiL8LAQu.PgiYKyVCkm.2j3V3.viaMTxAxL.";
	}
};
}

