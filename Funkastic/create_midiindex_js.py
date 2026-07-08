#!/usr/bin/env python3
"""
Genera Scripts/midiIndex.js directamente desde el dataset original
Sin necesidad de crear library/wgth_data.dat intermedio
"""

import json
from pathlib import Path

def load_catalog_from_filenames(midi_folder):
    """
    Construye el catálogo leyendo directamente los nombres de archivos
    Formato: {type}_{id}_{category}_{tone}_{mode}_{density}_full.mid
    """
    catalog = []
    
    midi_files = sorted(Path(midi_folder).glob("*.mid"))
    
    for midi_file in midi_files:
        # Parsear nombre: base_9354_44_E_dorian_high_full.mid
        parts = midi_file.stem.replace("_full", "").split("_")
        
        if len(parts) >= 6:
            catalog.append({
                "type": parts[0],           # base, M7, b5, penta
                "midi_id": parts[1],        # 9354
                "category": int(parts[2]),  # 44
                "tone": parts[3],           # E
                "mode": parts[4],           # dorian
                "density": parts[5],        # high
                "file": f"{len(catalog):05d}.dat"  # Legacy field
            })
    
    return catalog


def generate_midiindex_js(catalog, output_path):
    """
    Genera el archivo midiIndex.js con el formato correcto para HISE
    """
    # Convertir a JSON con indentación para legibilidad
    json_content = json.dumps(catalog, indent=2)
    
    # Crear contenido del archivo JavaScript
    js_content = f"""// Índice de MIDIs (auto-generado)
// Total: {len(catalog)} archivos
const var midiIndex = {json_content};
"""
    
    # Escribir archivo
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(js_content, encoding='utf-8')
    
    return output_file


def main():
    # Configuración
    project_root = Path(__file__).parent
    midi_folder = project_root / "mldata"
    output_file = project_root / "Scripts" / "midiIndex.js"
    
    print("=== GENERANDO midiIndex.js ===")
    print(f"Leyendo MIDIs desde: {midi_folder}")
    
    # 1. Leer archivos MIDI y construir catálogo
    catalog = load_catalog_from_filenames(midi_folder)
    print(f"✓ MIDIs encontrados: {len(catalog)}")
    
    # 2. Generar archivo JavaScript
    output_path = generate_midiindex_js(catalog, output_file)
    print(f"✓ Archivo creado: {output_path}")
    print(f"  Tamaño: {output_path.stat().st_size / 1024 / 1024:.2f} MB")
    
    # 3. Verificar primera entrada
    if catalog:
        print(f"\n📋 Primera entrada:")
        print(f"  Type: {catalog[0]['type']}")
        print(f"  ID: {catalog[0]['midi_id']}")
        print(f"  Category: {catalog[0]['category']}")
        print(f"  Tone: {catalog[0]['tone']}")
        print(f"  Mode: {catalog[0]['mode']}")
        print(f"  Density: {catalog[0]['density']}")
    
    print("\n✅ Listo para usar en HISE")
    print("   El archivo se incluye automáticamente con: include(\"midiIndex.js\");")


if __name__ == "__main__":
    main()

