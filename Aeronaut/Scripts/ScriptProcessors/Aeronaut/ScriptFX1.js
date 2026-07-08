// Script for the master-chain processor ID "ScriptFX1" (Type: ScriptFX).
// prepareToPlay() runs here when the host changes sample rate / buffer size.
// This is not HardcodedMasterFX1 (the spectral freeze node).

function prepareToPlay(sampleRate, blockSize)
{
	ScriptFX1HostAudioSyncGen = ScriptFX1HostAudioSyncGen + 1;
}

function processBlock(channels)
{
	
}
 function onControl(number, value)
{
	
}
 