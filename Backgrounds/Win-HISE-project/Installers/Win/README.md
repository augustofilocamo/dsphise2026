# Installers — Windows

| Archivo / carpeta | Rol |
|-------------------|-----|
| `Backgrounds_Win_Installer.iss` | Inno Setup |
| `EULA.txt` | Licencia del wizard (incluye Notice Stability) |
| `Semantic_s/` | Payload de biblioteca (AppData) |
| `Win Codesign/` | Binarios a firmar + `README_filo_windows_signing.md` |
| `VC_redist.x64.exe` | Runtime VS |

Armá / refrescá `Semantic_s/` con `..\..\pack_semantic_distro_win.ps1` (staging `Semantic_s_distro_win/`) y copiá el contenido acá.

Notas de producto: [`../../AGENTS.md`](../../AGENTS.md). Port: [`../../PORT_WINDOWS.md`](../../PORT_WINDOWS.md).
