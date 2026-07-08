from mido import MidiFile
from sklearn.linear_model import LinearRegression
import numpy as np

# Cargar archivo MIDI


def load_midi_features(midi_path):
    midi_data = MidiFile(midi_path)
    notes = []
    time_accumulated = 0

    for track in midi_data.tracks:
        for msg in track:
            if msg.type == 'note_on' and msg.velocity > 0:
                pitch = msg.note
                time_accumulated += msg.time
                octave = pitch // 12
                notes.append((pitch, octave, time_accumulated))
    
    return notes

# Procesar características
def extract_features(notes):
    features = []
    targets = []
    last_time = 0

    for pitch, octave, time in notes:
        time_since_last_pressed = time - last_time
        last_time = time

        # Agregar las características
        features.append([time_since_last_pressed, pitch, octave])

        # Para este ejemplo, asumiremos que queremos predecir la misma nota (identidad)
        targets.append(pitch)
    
    return np.array(features), np.array(targets)

# Entrenar un modelo
def train_model(features, targets):
    model = LinearRegression()
    model.fit(features, targets)
    return model

# Evaluar el modelo
def evaluate_model(model, features, targets):
    predictions = model.predict(features)
    mse = np.mean((predictions - targets) ** 2)
    return mse, predictions

# Entrenamiento completo
midi_path = "/Users/filo/Downloads/bach_846.mid"  # Cambia por tu archivo MIDI
notes = load_midi_features(midi_path)
features, targets = extract_features(notes)

# Entrenar el modelo
model = train_model(features, targets)

# Obtener pesos y sesgo
weights = model.coef_
bias = model.intercept_

# Evaluar el modelo
mse, predictions = evaluate_model(model, features, targets)

print("Pesos entrenados:", weights)
print("Sesgo (bias):", bias)
print("Error cuadrático medio:", mse)
