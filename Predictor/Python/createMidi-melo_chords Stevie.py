import random
from midiutil import MIDIFile
import os

# ===============================
# CONFIGURACIÓN GENERAL
# ===============================
tempo = 90
duration = 1  # Negra
track = 0
channel = 0

# ===============================
# DEFINICIÓN DE PROGRESIONES AL ESTILO STEVIE WONDER
# ===============================
stevie_progressions = {
    "SoulPopProgression1": ["Imaj7", "vi7", "ii7", "V7"],  # Progresión jazz-pop clásica
    "SoulPopProgression2": ["IVmaj7", "V7", "iii7", "vi7"],  # Movimiento cromático descendente
    "SoulPopProgression3": ["ii7", "V7", "Imaj9", "IVmaj7"],  # Resolución rica con novenas
    "SoulPopProgression4": ["Imaj7", "IVmaj7", "bVII9", "V7"],  # Uso de acordes dominantes secundarios
    "SoulPopProgression5": ["Imaj7", "vi7", "IVmaj9", "V13"],  # Progresión con tensiones
    "SoulPopProgression6": ["ii7", "bII7", "Imaj7", "V7"],  # Sustitución tritonal
    "SoulPopProgression7": ["IVmaj7", "bVII13", "Imaj9", "ii7"],  # Movimiento moderno
    "SoulPopProgression8": ["Imaj7", "iii7", "vi9", "IVmaj7"],  # Progresión rica en tensiones
}

chord_types = {
    "Imaj7": [0, 4, 7, 11],  # Acorde mayor séptima
    "vi7": [0, 3, 7, 10],  # Acorde menor séptima
    "ii7": [0, 3, 7, 10],  # Acorde menor séptima
    "V7": [0, 4, 7, 10],  # Acorde dominante séptima
    "IVmaj7": [0, 4, 7, 11],  # Acorde mayor séptima
    "bVII9": [0, 4, 7, 10, 14],  # Acorde dominante novena
    "Imaj9": [0, 4, 7, 11, 14],  # Acorde mayor novena
    "IVmaj9": [0, 4, 7, 11, 14],  # Acorde mayor novena
    "V13": [0, 4, 7, 10, 14, 21],  # Acorde dominante treceava
    "bII7": [0, 4, 7, 10],  # Sustitución tritonal
    "bVII13": [0, 4, 7, 10, 14, 21],  # Acorde dominante treceava
    "iii7": [0, 3, 7, 10],  # Acorde menor séptima
    "vi9": [0, 3, 7, 10, 14],  # Acorde menor novena
}

keys = ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Ab", "Db", "Gb", "B"]
key_to_midi = {
    "C": 60, "G": 67, "D": 62, "A": 69, "E": 64, "F": 65,
    "Bb": 70, "Eb": 63, "Ab": 68, "Db": 61, "Gb": 66, "B": 71
}

# ===============================
# GENERACIÓN DE MELODÍAS Y ACORDES
# ===============================
output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Soul_Pop_Melodies")
os.makedirs(output_dir, exist_ok=True)  # Crear la carpeta principal si no existe

for progression_name, progression in stevie_progressions.items():
    progression_dir = os.path.join(output_dir, progression_name)  # Crear una carpeta por progresión
    os.makedirs(progression_dir, exist_ok=True)

    for template_counter in range(1, 11):  # Generar 10 archivos por progresión
        key = random.choice(keys)  # Seleccionar una tonalidad aleatoria
        root_note = key_to_midi[key]  # Nota raíz en MIDI
        scale_degrees = [0, 2, 4, 5, 7, 9, 11]  # Intervalos de los grados de la escala mayor

        # Generar acordes basados en la progresión
        chords = []
        for chord_symbol in progression:
            # Extraer el grado del acorde (por ejemplo, "I", "ii", "IV", etc.)
            degree_index = {
                "I": 0, "ii": 1, "iii": 2, "IV": 3, "V": 4, "vi": 5, "bVII": 6, "bII": 1
            }[chord_symbol.split("maj")[0].split("7")[0].split("9")[0].split("13")[0]]
            
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