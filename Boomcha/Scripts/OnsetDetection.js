/*
	Onset detection (paso a paso).
	Paso 1: Carga el .wav que se guardó previamente (el mismo que el recorder carga en Audio Loop Player1).
*/

// Mismo sample que el recorder: el .wav guardado está en Audio Loop Player1
const var RecordedSample = Synth.getAudioSampleProcessor("Audio Loop Player1");
const var RecordedFile = RecordedSample.getAudioFile(0);

// Útil para onset: longitud en muestras, sample rate (lo dará el Engine o el sample)
inline function getRecordedLength()
{
	if (!RecordedFile)
		return 0;
	return RecordedFile.getSampleLength();
}

inline function getRecordedSampleRate()
{
	return Engine.getSampleRate();
}

inline function isRecordedLoaded()
{
	return RecordedFile && RecordedFile.isLoaded();
}
