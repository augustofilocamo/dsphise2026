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
# DEFINICIÓN DE PROGRESIONES POP
# ===============================
pop_progressions = {
    "FourChords": ["I", "V", "vi", "IV"],  # Progresión clásica de 4 acordes
    "Axis": ["vi", "IV", "I", "V"],  # Progresión de éxitos modernos
    "PopRock": ["I", "IV", "V", "IV"],  # Progresión típica de pop-rock
    "Doowop": ["I", "vi", "IV", "V"],  # Progresión doo-wop
    "Ballad": ["I", "V", "vi", "iii"],  # Progresión de balada
    "DescendingBass": ["I", "V", "vi", "iii"],  # Bajo descendente
    "Uplifting": ["IV", "I", "V", "vi"],  # Progresión edificante
    "Catchy": ["I", "V", "vi", "iii"]  # Progresión pegajosa
}

chord_types = {
    "I": [0, 4, 7],  # Acorde mayor
    "V": [0, 4, 7],  # Acorde mayor
    "vi": [0, 3, 7],  # Acorde menor
    "IV": [0, 4, 7],  # Acorde mayor
    "iii": [0, 3, 7],  # Acorde menor
}

keys = ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Ab", "Db", "Gb", "B"]
key_to_midi = {
    "C": 60, "G": 67, "D": 62, "A": 69, "E": 64, "F": 65,
    "Bb": 70, "Eb": 63, "Ab": 68, "Db": 61, "Gb": 66, "B": 71
}

# ===============================
# GENERACIÓN DE MELODÍAS Y ACORDES
# ===============================
output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Pop_Melodies")
os.makedirs(output_dir, exist_ok=True)  # Crear la carpeta principal si no existe

for progression_name, progression in pop_progressions.items():
    progression_dir = os.path.join(output_dir, progression_name)  # Crear una carpeta por progresión
    os.makedirs(progression_dir, exist_ok=True)

    for template_counter in range(1, 11):  # Generar 10 archivos por progresión
        key = random.choice(keys)  # Seleccionar una tonalidad aleatoria
        root_note = key_to_midi[key]  # Nota raíz en MIDI
        scale_degrees = [0, 2, 4, 5, 7, 9, 11]  # Intervalos de los grados de la escala mayor

        # Generar acordes basados en la progresión
        chords = []
        for chord_symbol in progression:
            degree_index = {
                "I": 0, "ii": 1, "iii": 2, "IV": 3, "V": 4, "vi": 5, "vii": 6
            }[chord_symbol]
            chord_root = root_note + scale_degrees[degree_index]  # Calcular la raíz del acorde
            chord_intervals = chord_types[chord_symbol]
            chord = [chord_root + interval - 12 for interval in chord_intervals]  # Transportar 12 semitonos hacia abajo
            chords.append(chord)

        # Generar una melodía aleatoria basada en la tonalidad
        melody = []
        previous_note = None
        for _ in range(32):  # 32 notas en la melodía
            note = random.choice(chords[random.randint(0, len(chords) - 1)])  # Elegir una nota de los acordes
            while note == previous_note:  # Evitar repetir la misma nota consecutivamente
                note = random.choice(chords[random.randint(0, len(chords) - 1)])
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
            melody_velocity_factor = random.uniform(0.7, 0.9)
            midi.addNote(track, channel, note, time, duration, int(velocity * melody_velocity_factor))

            if i % 4 == 0:  # Un acorde por compás
                chord = chords[i // 4 % len(chords)]
                chord_velocity_factor = random.uniform(0.35, 0.75)
                for chord_note in chord:
                    midi.addNote(track, channel, chord_note, time, duration, int(velocity * chord_velocity_factor))

            time += duration

        # Guardar el archivo MIDI
        filename = f"{progression_name}_Template_{key}_{template_counter}.mid"
        filepath = os.path.join(progression_dir, filename)
        with open(filepath, "wb") as output_file:
            midi.writeFile(output_file)

        print(f"🎵 Generado: {filepath}")