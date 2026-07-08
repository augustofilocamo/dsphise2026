namespace project
{

struct cputest_networkdata: public scriptnode::dll::InterpretedNetworkData
{
	String getId() const override
	{
		return "cputest";
	}
	bool isModNode() const override
	{
		return false;
	}
	String getNetworkData() const override
	{
		return "327.nT6K8ClzAzdB.XjT7TBDqaS.7QH2skbdYJIkSFfB8fJV2smAHAG5xspppq3SZdDOr5zOu.PL.7B.M7wSXzsCnuZxaxjwoiunPeSE0n5aQsn11POL9vjcmOw5InK2FfdKXRn2iLBwr0z6R7QABAU+4IaITac8IVIpkEbYmwVWNT4lsbhsBbrlJpIg91pPOUigwWYIb3iqbQx.Gh1yDj+dxKrLh3w4pmbjBwYdKpsq9FjE2A9xr5WYO6Orj27K8XWnOTSAwn5wZqv+wbvLNdbQqJqCqGXnBK.+Ut4ay1XRZYLI8XarH9lLC8mWCqCITjb.jIsIQjPYhRyfHQsk.MPGf.HIZL8Fz.zCsAM3PxYkgjtu2gaiLRwcTaLWsSoUH9y3LP73vnMa4sKKDtvNv0fKspaJJXTvAt04kQYm.hkear..Tacjhb0L";
	}
};
}

