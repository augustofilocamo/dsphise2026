import mido

def convert_midi_to_hise_format(midi_path, output_txt_path):
    mid = mido.MidiFile(midi_path)
    ticks_per_beat = mid.ticks_per_beat
    tempo = 500000  # default (120 BPM)
    bpm = 120
    time_accum = 0
    sample_rate = 44100

    event_id = 0
    output_lines = []

    for track in mid.tracks:
        time_accum = 0
        for msg in track:
            time_accum += msg.time
            if msg.type == 'set_tempo':
                tempo = msg.tempo
                bpm = mido.tempo2bpm(tempo)

            if msg.type in ['note_on', 'note_off'] and msg.channel < 16:
                type_str = 'NoteOn' if msg.type == 'note_on' and msg.velocity > 0 else 'NoteOff'
                velocity = msg.velocity if type_str == 'NoteOn' else 64

                # Convert time to samples
                time_in_seconds = mido.tick2second(time_accum, ticks_per_beat, tempo)
                timestamp = int(time_in_seconds * sample_rate)

                line = f"MessageHolder: Type: {type_str}, Channel: {msg.channel + 1}, Number: {msg.note}, Value: {velocity}, EventId: {event_id}, Timestamp: {timestamp}, "
                output_lines.append(f'"{line}"')
                event_id += 1

    with open(output_txt_path, "w") as f:
        f.write("[\n")
        for line in output_lines:
            f.write("  " + line + ",\n")
        f.write("]\n")

    print(f"Archivo exportado: {output_txt_path}")
    print(f"BPM detectado: {bpm:.2f}")
    return bpm

# USO
# bpm = convert_midi_to_hise_format("tu_archivo.mid", "salida.txt")
