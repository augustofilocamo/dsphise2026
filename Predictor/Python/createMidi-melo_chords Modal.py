import random
from midiutil import MIDIFile
import os

# ===============================
# CONFIGURACIÓN GENERAL
# ===============================
tempo = 80
duration = 1  # Negra
track = 0
channel = 0

# ===============================
# DEFINICIÓN DE ESCALAS GRIEGAS Y ACORDES
# ===============================
scales = {
    "Ionian": [0, 2, 4, 5, 7, 9, 11],  # Jónico (mayor)
    "Dorian": [0, 2, 3, 5, 7, 9, 10],  # Dórico
    "Phrygian": [0, 1, 3, 5, 7, 8, 10],  # Frigio
    "Lydian": [0, 2, 4, 6, 7, 9, 11],  # Lidio
    "Mixolydian": [0, 2, 4, 5, 7, 9, 10],  # Mixolidio
    "Aeolian": [0, 2, 3, 5, 7, 8, 10],  # Eólico (menor natural)
    "Locrian": [0, 1, 3, 5, 6, 8, 10]  # Locrio
}

chord_types = {
    "Maj7": [0, 4, 7, 11],
    "min7": [0, 3, 7, 10],
    "Dom7": [0, 4, 7, 10],
    "m7b5": [0, 3, 6, 10]
}

mode_chords = {
    "Ionian": ["Maj7", "min7", "min7", "Maj7", "Dom7", "min7", "m7b5"],
    "Dorian": ["min7", "min7", "Maj7", "Dom7", "min7", "m7b5", "Maj7"],
    "Phrygian": ["min7", "Maj7", "Dom7", "min7", "m7b5", "Maj7", "min7"],
    "Lydian": ["Maj7", "Dom7", "min7", "m7b5", "Maj7", "min7", "min7"],
    "Mixolydian": ["Dom7", "min7", "m7b5", "Maj7", "min7", "min7", "Maj7"],
    "Aeolian": ["min7", "m7b5", "Maj7", "min7", "min7", "Maj7", "Dom7"],
    "Locrian": ["m7b5", "Maj7", "min7", "min7", "Maj7", "Dom7", "min7"]
}

keys = ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Ab", "Db", "Gb", "B"]
key_to_midi = {
    "C": 60, "G": 67, "D": 62, "A": 69, "E": 64, "F": 65,
    "Bb": 70, "Eb": 63, "Ab": 68, "Db": 61, "Gb": 66, "B": 71
}

# ===============================
# GENERACIÓN DE MELODÍAS Y ACORDES
# ===============================
output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Generated_Melodies")
os.makedirs(output_dir, exist_ok=True)  # Crear la carpeta principal si no existe

for scale_name, scale_intervals in scales.items():
    mode_dir = os.path.join(output_dir, scale_name)  # Crear una carpeta por modo
    os.makedirs(mode_dir, exist_ok=True)

    for template_counter in range(1, 11):  # Generar 10 archivos por modo
        key = random.choice(keys)  # Seleccionar una tonalidad aleatoria
        root_note = key_to_midi[key]  # Nota raíz en MIDI
        scale_notes = [root_note + interval for interval in scale_intervals]  # Notas de la escala

        # Generar acordes para cada compás según el modo griego
        chords = []
        tonic_chord_type = mode_chords[scale_name][0]  # Tipo de acorde para la tónica
        tonic_chord = [scale_notes[0] + interval for interval in chord_types[tonic_chord_type]]  # Construir la tónica

        for i in range(32):  # Generar 32 acordes
            if random.random() < 0.5:  # 50% de probabilidad de usar la tónica
                chords.append(tonic_chord)
            else:
                degree = random.randint(1, 6)  # Seleccionar un grado aleatorio distinto de la tónica
                chord_type = mode_chords[scale_name][degree]  # Tipo de acorde según el modo
                root = scale_notes[degree]  # Nota raíz del acorde
                chord = [root + interval for interval in chord_types[chord_type]]  # Construir el acorde
                chords.append(chord)

        # Generar una melodía aleatoria basada en la escala sin repetir notas consecutivas
        melody = []
        previous_note = None
        for _ in range(32):  # 32 notas en la melodía
            note = random.choice(scale_notes)
            while note == previous_note:  # Evitar repetir la misma nota consecutivamente
                note = random.choice(scale_notes)
            melody.append(note)
            previous_note = note

        velocities = [
            random.randint(100, 120) if i % 4 == 0 else random.randint(60, 90)  # Énfasis en los primeros tiempos de cada compás
            for i in range(32)
        ]

        # ===============================
        # GENERACIÓN DEL ARCHIVO MIDI
        # ===============================
        midi = MIDIFile(1)
        midi.addTempo(track, 0, tempo)
        time = 0

        # Agregar las notas de la melodía y los acordes
        for i, note in enumerate(melody):
            velocity = velocities[i]
            midi.addNote(track, channel, note, time, duration, velocity)

            # Agregar el acorde correspondiente al compás
            if i % 4 == 0:  # Un acorde por compás
                chord = chords[i // 4]
                for chord_note in chord:
                    midi.addNote(track, channel, chord_note - 12, time, duration, int(velocity * 0.6))  # Acordes con menor velocidad

            time += duration

        # Guardar el archivo MIDI
        filename = f"{scale_name}_Template_{key}_{template_counter}.mid"
        filepath = os.path.join(mode_dir, filename)
        with open(filepath, "wb") as output_file:
            midi.writeFile(output_file)

        print(f"🎵 Generado: {filepath}")