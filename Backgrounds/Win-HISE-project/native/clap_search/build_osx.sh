#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
BUILD="$ROOT/build_osx"
ORT_ROOT="${ORT_ROOT:-$ROOT/third_party/onnxruntime}"
cmake -S "$ROOT" -B "$BUILD" -DCMAKE_BUILD_TYPE=Release -DORT_ROOT="$ORT_ROOT"
cmake --build "$BUILD" --config Release -j"$(sysctl -n hw.ncpu 2>/dev/null || echo 4)"
echo "Built: $BUILD/libclap_search.dylib"
