#!/usr/bin/env bash
# Copia el árbol zstd desde el repo dsphise (Tactile/HISE) a ThirdParty/zstd_vendor.
# Uso: desde la raíz de Boomcha: ./Scripts/vendor_zstd.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${ROOT}/../Tactile/HISE/hi_zstd/zstd"
DST="${ROOT}/DspNetworks/ThirdParty/zstd_vendor/zstd"
if [[ ! -f "${SRC}/zstd.h" ]]; then
  echo "No se encontró ${SRC}/zstd.h" >&2
  echo "Copiá manualmente hi_zstd/zstd/ a DspNetworks/ThirdParty/zstd_vendor/ (ver zstd_vendor/README.md)." >&2
  exit 1
fi
mkdir -p "$(dirname "${DST}")"
rm -rf "${DST}"
cp -R "${SRC}" "${DST}"
echo "OK: ${DST} ($(find "${DST}" -type f | wc -l | tr -d ' ') archivos)"
