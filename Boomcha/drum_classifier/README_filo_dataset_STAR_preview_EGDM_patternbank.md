# train detect con dataset star_drums_preview

# preparar dataset
python build_star_drums.py star_drums_preview --out dataset_star_built --max-energy-window --context-sec 0.03

# entrenar
python train.py --data dataset_star_built --class-weights --epochs 30

# generar onsets en HISE previo a esto. Con este settup:
//Loop
const var REFRACTORY_MS = 20.0;
const var DECAY_PER_FRAME = 0.925;
// Beatbox
const var REFRACTORY_MS = 40.0;
const var DECAY_PER_FRAME = 0.990;

# Y cargarlos para inferencia con este comando
python load_stems_for_inference.py ../AudioFiles/stems/current/stems.json --context-sec 0.05 --out inference_input.npz --audio loops/120beatbox2.wav

# inferir
python infer.py inference_input.npz --checkpoint checkpoints/best.pt --out-dir ../AudioFiles/stems/current --thresholds "0.35,0.15,0.35" --max-energy-window

# apretat boton post process en HISE para aplicar

# reconstruir pattern bank con TODOS los datasets (e-gmd + star + idmt)
# Root Groove = carpeta donde está e-gmd-v1.0.0.csv y los .mid (en este repo suele ser solo e-gmd-v1.0.0, sin subcarpeta groove).
# Si tu zip trae e-gmd-v1.0.0/groove/, usá ese path; si no existe groove/, usá e-gmd-v1.0.0.
python build_groove_pattern_bank.py e-gmd-v1.0.0 --info e-gmd-v1.0.0.csv --star star_drums_preview --idmt idmt --out pattern_bank.npz


# reconstruir lakh
python build_groove_pattern_bank.py --lakh lakh_4_100k_groovified_first14k --out pattern_bank_lakh_14k.npz


# buscar similares desde audio json en el pattern bank
python find_closest_groove_bar.py --inference ../AudioFiles/stems/current/inference_output.json --stems ../AudioFiles/stems/current/stems.json --bank pattern_bank.npz --top 3

# buscar similares al grid (mismo contrato que HISE/find_closest_cli)
# banco principal: EGMD; fallback: Lakh groovified; --bars N para exportar N compases
python find_closest_groove_bar.py \
  --grid ../AudioFiles/stems/current/grid_buttons.json \
  --bank pattern_bank.npz \
  --bank pattern_bank01.npz \
  --fallback-if-dist-above 4 \
  --top 9 \
  --bars 8

# prbando con MidiFiles.dat
python find_closest_groove_bar.py --grid ../AudioFiles/stems/current/grid_buttons.json   --bank ../pattern_bank.npz --bank ../pattern_bank01.npz  -
-fallback-if-dist-above 1   --top 3  --bars 1





# para humanizar 
python humanize_drum_midi.py closest_1bar_1.mid --sigma-time 0.002 --suffix _humanized

# para expandir a n compases
python expand_groove_segment.py --meta ./expand_meta.json --bars 8

# para usar varios pattern_banks con fallback al proximo y velocity como weight
python find_closest_groove_bar.py --grid ../AudioFiles/stems/current/grid_buttons.json --bank pattern_bank.npz --bank pattern_bank01.npz --fallback-if-dist-above 6 --top 3 --velocity-weight

# --- Lakh groovified: reconversión y rebuild ---
# Si los MIDIs de lakh_4_10k_groovified tienen BPM incorrecto (todos a 120),
# restaurar desde backups y reconvertir:
for f in lakh_4_10k_groovified/*.mid.bak; do cp "$f" "${f%.bak}"; done
python convert_lakh_groovified_for_hise.py --dir lakh_4_10k_groovified --backup-ext ""
# Reconstruir el bank (usa bpm_from_midi, no estimate):
python build_groove_pattern_bank.py --lakh lakh_4_10k_groovified --out pattern_bank01.npz

