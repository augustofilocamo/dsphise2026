Content.makeFrontInterface(600, 600);

const var noteEventIds = {};function onNoteOn()
{
    local channel = 1;
    local velocity = Message.getVelocity();
    local midiNote = Message.getNoteNumber();

    // Generar una nueva nota artificial (ejemplo: +12 semitonos)
    local artificialNote = midiNote + 5;
    
    // Agregar la nota y almacenar su nota y eventId
    noteEventIds[midiNote] = {
        "note": artificialNote,
        "eventId": Synth.addNoteOn(channel, artificialNote, velocity, 0)
    };

    // Bloquear la nota MIDI original
    Message.ignoreEvent(true);
}
 function onNoteOff()
{
    local midiNote = Message.getNoteNumber();

    // Verificar si hay una nota artificial asociada
    if (noteEventIds[midiNote] != undefined)
    {
        // Obtener la nota artificial correcta
        local artificialNote = noteEventIds[midiNote]["note"];
        
        // Apagar la nota artificial usando la nota en lugar del eventId
        Synth.addNoteOff(1, artificialNote, 0);
        
        // Eliminar la entrada
        noteEventIds[midiNote] = undefined;
    }

    // Bloquear la liberación de la nota MIDI original
    Message.ignoreEvent(true);
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 