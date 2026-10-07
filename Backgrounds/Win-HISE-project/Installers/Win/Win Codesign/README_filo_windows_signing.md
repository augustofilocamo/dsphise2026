# Firma Windows (Artifact Signing) — Backgrounds

**Necesitás:** Azure CLI, Windows SDK (`signtool`), .NET 8 x64, `Azure.CodeSigning.Dlib.dll` (x64).  
Doc: https://learn.microsoft.com/azure/trusted-signing/how-to-signing-integrations

Carpeta de trabajo típica: `Installers/Win/Win Codesign/`  
(ahí van `Backgrounds.exe`, `Backgrounds.vst3`, `clap_search.dll`, `onnxruntime.dll`, `metadata.json`).

---

## `metadata.json` (este repo)

```json
{
  "Endpoint": "https://eus.codesigning.azure.net",
  "CodeSigningAccountName": "samplesonartifacts",
  "CertificateProfileName": "pub-samp390"
}
```

---

## Comandos

**1. Login** (device code: abrís el link y pegás el código)

```powershell
az login --use-device-code --tenant 3cad04fe-cb8f-4d7f-b4f4-364378dff8d4
```

**2. Dlib** (si no lo tenés: `winget install -e --id Microsoft.Azure.ArtifactSigningClientTools` o NuGet `Microsoft.ArtifactSigning.Client` → `...\bin\x64\Azure.CodeSigning.Dlib.dll`)

**3. Firmar** — ajustá rutas de `signtool`, Dlib y del binario:

```powershell
$codesign = "C:\Filo\HISE-project\Installers\Win\Win Codesign"
$signtool = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\signtool.exe"
$dlib = "$env:USERPROFILE\Downloads\asclient\Microsoft.ArtifactSigning.Client\bin\x64\Azure.CodeSigning.Dlib.dll"

& $signtool sign /v /fd SHA256 /tr "http://timestamp.acs.microsoft.com" /td SHA256 `
  /dlib $dlib /dmdf "$codesign\metadata.json" `
  "$codesign\Backgrounds.exe"

& $signtool sign /v /fd SHA256 /tr "http://timestamp.acs.microsoft.com" /td SHA256 `
  /dlib $dlib /dmdf "$codesign\metadata.json" `
  "$codesign\Backgrounds.vst3\Contents\x86_64-win\Backgrounds.vst3"
```

(Ajustá el path interno del `.vst3` si VS lo dejó distinto. `clap_search.dll` si hace falta firmarla; `onnxruntime.dll` de Microsoft suele quedar como viene.)

**4. Verificar**

```powershell
Get-AuthenticodeSignature "$codesign\Backgrounds.exe"
```

Debe salir **Status: Valid**.
