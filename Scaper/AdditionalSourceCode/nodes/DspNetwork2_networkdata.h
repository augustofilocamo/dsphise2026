namespace project
{

struct DspNetwork2_networkdata: public scriptnode::dll::InterpretedNetworkData
{
	String getId() const override
	{
		return "DspNetwork2";
	}
	bool isModNode() const override
	{
		return false;
	}
	String getNetworkData() const override
	{
		return "115.nT6K8CBiUM..Bc7EZ.WZa3YJmNJrRfr7cn8dJS.hHTU0ZHRUaS+.+m2ryD3hI+myklLtiLG2WIy3xBBuwPE0YyFC6lpLBtqzXxhUaEV33dtzzcGcPGjAv8lx3MO7AoEFwD3NhAi6HVUQmof..rNAOjMLYB";
	}
};
}

