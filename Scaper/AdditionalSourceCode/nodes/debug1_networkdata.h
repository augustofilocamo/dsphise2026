namespace project
{

struct debug1_networkdata: public scriptnode::dll::InterpretedNetworkData
{
	String getId() const override
	{
		return "debug1";
	}
	bool isModNode() const override
	{
		return false;
	}
	String getNetworkData() const override
	{
		return "371.nT6K8CFwDzzB.Xaj6TB.qbd.MwGaMoLRxX7dfc.wXI++VT1K4svJkP++eQ8gEPsLrjT.u.vK..C.RTWB6WNebC1V8slK57eMFDr0olYXrUpwJXqbBqTmy5b3SCNEufsWPHhscnSPumIAL1t82WB4QKOSKRN0AGPzCiV00Q8qNZwP06c5WsZJH1wViXaiQvVJuVaqqB1pWrf7NOjrq+8AbhGfar7eiiYoFyL0e2SSaM6FoRCxDDdQn1+DaNRXBgbJY0iPLSH0m3bMdxqMcdynElQrgVZ.uX2p2C0vJ3DObCvJ.XB+VA2CbAlAkIJQjToUYBkoGSMHSjZr.rPLf.mAjgVNA.lNjC1.Pundi3TJ61E3DC.M67qgRAGDYqLrR22NFJu.cKbQeTaL2rSomP7gFGAhGG1rYK510DBSgYFXDLN8oavQ.v5VwPvysIGyLIMFDJbLa5r0r7b.WkCXJQiYbWdRqUfGrOVLir1DzwsCC7X.+m.";
	}
};
}

