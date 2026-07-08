# Configuración
bpm = 120
sample_rate = 44100
beats_per_bar = 4
num_bars = 2
total_beats = beats_per_bar * num_bars

# Tiempos por figura
seconds_per_beat = 60 / bpm
samples_per_beat = int(seconds_per_beat * sample_rate)
samples_per_eighth = samples_per_beat // 2

# Notas
notes_eighth = [55, 56, 57]
note_quarter = 77
velocity = 80
note_length = samples_per_eighth  # Duración uniforme

# Generar eventos MIDI
midi_events = []
event_id = 0
timestamp = 0

# Corcheas (tres notas alternadas)
for i in range(total_beats * 2):  # dos corcheas por beat
    note = notes_eighth[i % len(notes_eighth)]
    midi_events.append(f"MessageHolder: Type: NoteOn, Channel: 1, Number: {note}, Value: {velocity}, EventId: {event_id}, Timestamp: {timestamp}, ")
    midi_events.append(f"MessageHolder: Type: NoteOff, Channel: 1, Number: {note}, Value: 64, EventId: {event_id}, Timestamp: {timestamp + note_length}, ")
    timestamp += samples_per_eighth
    event_id += 1

# Agregar negras (nota 77 en cada beat)
timestamp = 0
for i in range(total_beats):
    midi_events.append(f"MessageHolder: Type: NoteOn, Channel: 1, Number: {note_quarter}, Value: {velocity}, EventId: {event_id}, Timestamp: {timestamp}, ")
    midi_events.append(f"MessageHolder: Type: NoteOff, Channel: 1, Number: {note_quarter}, Value: 64, EventId: {event_id}, Timestamp: {timestamp + samples_per_beat}, ")
    timestamp += samples_per_beat
    event_id += 1

# Resultado final
midi_events_sorted = sorted(midi_events, key=lambda x: int(x.split("Timestamp: ")[1].split(",")[0]))

import pandas as pd
df_midi = pd.DataFrame(midi_events_sorted, columns=["MIDI Event"])
# Guardar la lista como texto
# Guardar la lista como una lista de strings con comillas
with open("midiList_8compases_formateado.txt", "w") as file:
    file.write("const var midiList = [\n")
    for line in midi_events_sorted:
        file.write(f'  "{line}",\n')
    file.write("];\n")

print("Archivo guardado como midiList_8compases_formateado.txt")