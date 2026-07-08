import numpy as np
import tensorflow as tf
from mido import MidiFile

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

        # Agregar características
        features.append([time_since_last_pressed, pitch, octave])

        # Target: La nota original que queremos predecir
        targets.append(pitch)
    
    return np.array(features), np.array(targets)

# Cargar datos MIDI y preparar conjuntos de datos
midi_path = "/Users/filo/Downloads/bach_846.mid"  # Cambia por tu archivo MIDI
notes = load_midi_features(midi_path)
features, targets = extract_features(notes)

# Normalización de características
features = (features - np.mean(features, axis=0)) / np.std(features, axis=0)

# Dividir datos en entrenamiento y validación
from sklearn.model_selection import train_test_split
X_train, X_val, y_train, y_val = train_test_split(features, targets, test_size=0.2, random_state=42)

# Crear la red neuronal
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(3,)),  # Tres características: time_since_last_pressed, pitch, octave
    tf.keras.layers.Dense(64, activation='relu'),  # Primera capa oculta con 64 neuronas
    tf.keras.layers.Dense(64, activation='relu'),  # Segunda capa oculta
    tf.keras.layers.Dense(1, activation='linear')  # Salida: Nota predicha
])

# Compilar el modelo
model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# Entrenar el modelo
history = model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=50, batch_size=32)

# Evaluar el modelo
loss, mae = model.evaluate(X_val, y_val)
print(f"Mean Absolute Error en validación: {mae}")

# Predicciones
predictions = model.predict(X_val)

# Mostrar pesos de las capas
for layer in model.layers:
    print(layer.name, "Pesos:", layer.get_weights())
