import random
from midiutil import MIDIFile
import os

# ===============================
# CONFIGURACIÓN GENERAL
# ===============================
tempo = 80
duration = 2  # Blanca
track = 0
channel = 0
template_counter = 1  # Para nombres como Cinematic_Template_1.mid

# ===============================
# DEFINICIÓN DE DATOS
# ===============================
all_templates = []

# === Generar datos dinámicos ===
composers = ["Hans_Zimmer", "John_Williams", "Ennio_Morricone", "Thomas_Newman", "Ramin_Djawadi"]
keys = ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Ab", "Db", "Gb", "B"]
base_chords = [
    [60, 64, 67], [62, 65, 69], [64, 67, 71], [65, 69, 72],
    [67, 71, 74], [69, 72, 76], [71, 74, 78]
]

for composer in composers:
    for i in range(10):  # 10 archivos por compositor
        key = random.choice(keys)
        transposition = random.randint(-5, 5)  # Transposición aleatoria
        chords = [[note + transposition for note in chord] for chord in base_chords]
        random.shuffle(chords)  # Secuencia aleatoria de acordes

        # Generar velocidades aleatorias (solo para acordes)
        velocities = [random.randint(50, 100) for _ in range(len(chords))]

        all_templates.append({
            "composer": composer,
            "key": key,
            "chords": chords,
            "velocities": velocities
        })

# ===============================
# GENERACIÓN DE LOS ARCHIVOS MIDI
# ===============================
base_dir = os.path.dirname(os.path.abspath(__file__))

for template in all_templates:
    composer_dir = os.path.join(base_dir, template["composer"])
    os.makedirs(composer_dir, exist_ok=True)

    midi = MIDIFile(1)
    midi.addTempo(track, 0, tempo)
    time = 0

    # Agregar acordes
    for i, chord in enumerate(template["chords"]):
        velocity = template["velocities"][i]
        for note in chord:
            midi.addNote(track, channel, note, time, duration, velocity)
        time += duration

    filename = f"Cinematic_Template_{template_counter}.mid"
    filepath = os.path.join(composer_dir, filename)
    with open(filepath, "wb") as output_file:
        midi.writeFile(output_file)

    print(f"🎵 Generado: {filepath}")
    template_counter += 1