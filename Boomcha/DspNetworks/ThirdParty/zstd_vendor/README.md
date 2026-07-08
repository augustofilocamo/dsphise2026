# Vendored Zstandard (zstd) sources

Boomcha embebe **solo el decoder** zstd dentro del DLL de DSP (`boomcha_zstd_embedded.h`), sin depender del módulo `hi_zstd` de HISE ni de rutas en `Binaries/` (HISE regenera esa carpeta).

## One-time setup

Copiá el árbol completo de fuentes zstd (el mismo que usa HISE en `hi_zstd/zstd/`) a esta carpeta:

```text
DspNetworks/ThirdParty/zstd_vendor/zstd/
  zstd.h
  common/...
  decompress/...
```

### Si tenés el repo `dsphise` completo (con `Tactile/`)

Desde la raíz de **Boomcha**:

```bash
./Scripts/vendor_zstd.sh
```

### Copia manual

Ejemplo (ajustá la ruta origen a tu instalación de HISE o a `Tactile/HISE/hi_zstd/zstd`):

```bash
rm -rf DspNetworks/ThirdParty/zstd_vendor/zstd
cp -R /ruta/a/hi_zstd/zstd DspNetworks/ThirdParty/zstd_vendor/
```

Tras copiar, debe existir:

`DspNetworks/ThirdParty/zstd_vendor/zstd/zstd.h`

### Parche respecto al bundle de HISE

En `decompress/zstd_decompress.c`, el árbol que trae **hi_zstd** puede tener `ZSTD_limitCopy` **dentro de `#if 0`** mientras el resto del archivo lo usa → error *undeclared identifier 'ZSTD_limitCopy'*. En este repo esa función **está habilitada** (sin `#if 0`). Si volvés a copiar zstd desde HISE, reaplicá ese cambio o traé el archivo ya parcheado del commit actual.

## Licencia

Zstandard está bajo licencia **BSD** / GPLv2 (según upstream). Ver los archivos `LICENSE` / `COPYING` dentro del árbol copiado.
