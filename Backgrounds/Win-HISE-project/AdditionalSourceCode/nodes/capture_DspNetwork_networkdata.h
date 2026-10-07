namespace project
{

struct capture_DspNetwork_networkdata: public scriptnode::dll::InterpretedNetworkData
{
	String getId() const override
	{
		return "capture_DspNetwork";
	}
	bool isModNode() const override
	{
		return false;
	}
	String getNetworkData() const override
	{
		return "525.nT6K8C1TGzAD.X9z9LBDKq9hXSW907qdmc1CBDuOxMOXgCfA.SZB..UYTeKkdwpkoPC.0.PM.jPZQ8.6mi+mSsLzz5YJYf9SwQVM6JWR07owlPym6hv1hTVLZgFp8YL0VflQRZzzAni4aovta7jFPGrJzr0tXKO2jUSUu7zvEYFXk.MD7tqrHhL1nITD1eiwPlBF2ZpwXorwBflUcLxYYFwcUZOTMS94ns9JCygznv94o5FbX1Zv6Vw94LxL7U1.eG6Ja.WdNq2crocwpX2Tg0wAl1goIDQkjL9b2S0umCQ0reGqiCj6dtxl.AHGnmw7W6weowLzQY+O3lx5GZWmlbi25pmjXe4BwAZ7wLZFrjP.pTA.PA.fnxJCGjBY0POQt1KW+QYdNGwjb5b9xTL7L5c3X3xXZQDRMR42nS30o.AWXAILTSecWkb.9CWhhQXFgHaXkPIpiNMXwpUNSJJyDtM8fFYeQJR2qv3qr06rgsq3Oe3DA3l4at7tyODz+BXMSrTgcfDVvFQ+HS.ya6cbMgGClgF6JkdDGjP.WG4.PGZkdzcU7LZ6jWsmiZEC4gIQNnHP0.DFFmzDVyqRWhzDc6vF.RKx2kJZli9Aq4csAMvmaT3skkvyriTPcf1cF7GI4RL.FP.35qyQsQgQFqLd97BKc5xVJbIqSApQfGmxGnhg5pxK3cc.8bPOdVXO";
	}
};
}

